package handlers

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
	"github.com/kanishkmehta29/TileTown/constants"
	"github.com/kanishkmehta29/TileTown/models"
	"github.com/kanishkmehta29/TileTown/services"
	"github.com/kanishkmehta29/TileTown/utils"
)

// Upgrader is used to upgrade HTTP connections to WebSocket connections
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func JoinRoomHandler(manager *services.RoomManager) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		roomCode := mux.Vars(r)["code"]
		playerName := mux.Vars(r)["name"]

		room, ok := manager.GetRoom(roomCode)
		if !ok {
			http.Error(w, "Room not found", http.StatusNotFound)
			return
		}

		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			log.Println("upgrade error:", err)
			return
		}

		player := &models.Player{
			Name:         playerName,
			Id:           utils.RandomCode(),
			X:            constants.DefaultPlayerX,
			Y:            constants.DefaultPlayerY,
			Direction:    constants.PlayerDirectionDown,
			Conn:         conn,
			MessageQueue: make(chan *models.Message, 256),
		}

		room.Join <- player
		log.Printf("player:%v joined the room:%v, player id:%v", player.Name, roomCode, player.Id)

		welcomeMsg := &models.Message{
			Type:      constants.MessageTypeWelcome,
			FromId:    player.Id,
			X:         player.X,
			Y:         player.Y,
			Direction: player.Direction,
			FromName:  player.Name,
		}
		player.MessageQueue <- welcomeMsg

		//read loop
		go func() {
			defer func() {
				// send leave message to other players when connection closes
				leaveMsg := &models.Message{
					Type:   constants.MessageTypeLeave,
					FromId: player.Id,
					Text:   player.Name,
				}
				room.Broadcast <- leaveMsg
				room.Leave <- player
				player.Conn.Close()

				log.Printf("player:%v left the room:%v due to connection close, player id:%v", player.Name, roomCode, player.Id)
			}()
			for {
				_, msg, err := conn.ReadMessage()
				if err != nil {
					log.Printf("Error while reading ws message of player: %v", player.Id)
					break
				}
				var msgStruct models.Message
				err = json.Unmarshal(msg, &msgStruct)
				if err != nil {
					log.Printf("Error while unmarshalling message for player:%v, error:%v", player.Id, err.Error())
					break
				}

				log.Printf("ws message received by player_name:%v, player_code:%v, message:%v", player.Name, player.Id, msgStruct)

				switch msgStruct.Type {
				//  movement
				case constants.MessageTypeMove:
					player.X = msgStruct.X
					player.Y = msgStruct.Y
					player.Direction = msgStruct.Direction
					msgStruct.FromId = player.Id
					msgStruct.FromName = player.Name
					room.Broadcast <- &msgStruct

				// chat
				case constants.MessageTypeChat:
					msgStruct.FromId = player.Id
					msgStruct.FromName = player.Name

					// send message to the appropriate player only
					if msgStruct.ToId != "" {
						for p := range room.Players {
							if p.Id == msgStruct.ToId {
								p.MessageQueue <- &msgStruct
								break
							}
						}
					} else {
						room.Broadcast <- &msgStruct
					}

				// video-call
				case "video-call-offer", "video-call-answer", "video-call-ice-candidate", "video-call-end", "video-call-declined":
					msgStruct.FromId = player.Id
					msgStruct.FromName = player.Name

					// send message to the appropriate player only
					if msgStruct.ToId != "" {
						for p := range room.Players {
							if p.Id == msgStruct.ToId {
								p.MessageQueue <- &msgStruct
								break
							}
						}
					}
				}
			}
		}()

		//write loop
		go func() {
			for msg := range player.MessageQueue {
				msgText, _ := json.Marshal(msg)
				err := conn.WriteMessage(websocket.TextMessage, msgText)
				if err != nil {
					break
				}
			}
		}()
	}
}

func LeaveRoomHandler(manager *services.RoomManager) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		roomCode := mux.Vars(r)["code"]
		playerName := mux.Vars(r)["name"]

		room, ok := manager.GetRoom(roomCode)
		if !ok {
			http.Error(w, "Room not found", http.StatusNotFound)
			return
		}

		// find the player in the room
		var playerToRemove *models.Player
		for player := range room.Players {
			if player.Name == playerName {
				playerToRemove = player
				break
			}
		}

		if playerToRemove == nil {
			http.Error(w, "Player not found in room", http.StatusNotFound)
			return
		}

		// send leave message to room
		leaveMsg := &models.Message{
			Type:   constants.MessageTypeLeave,
			FromId: playerToRemove.Id,
			Text:   playerToRemove.Name,
		}
		room.Broadcast <- leaveMsg

		// remove player from room
		room.Leave <- playerToRemove

		// close player's connection
		playerToRemove.Conn.Close()

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"status": "left", "player": playerName})

		log.Printf("player:%v left the room:%v, player id:%v", playerToRemove.Name, roomCode, playerToRemove.Id)
	}
}
