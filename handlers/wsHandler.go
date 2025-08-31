package handlers

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
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
		code := mux.Vars(r)["code"]

		room, ok := manager.GetRoom(code)
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
			Name:         mux.Vars(r)["name"],
			Id:           utils.RandomCode(),
			X:            150,
			Y:            500,
			Direction:    "down",
			Conn:         conn,
			MessageQueue: make(chan *models.Message, 256),
		}

		room.Join <- player
		log.Printf("player:%v joined the room:%v, player id:%v", player.Name, code, player.Id)

		welcomeMsg := &models.Message{
			Type:      "welcome",
			Id:        player.Id,
			X:         player.X,
			Y:         player.Y,
			Direction: player.Direction,
			Name:      player.Name,
		}
		player.MessageQueue <- welcomeMsg

		//read loop
		go func() {
			defer func() {
				// Send leave message to other players when connection closes
				leaveMsg := &models.Message{
					Type: "leave",
					Id:   player.Id,
					Text: player.Name,
				}
				room.Broadcast <- leaveMsg
				room.Leave <- player
				player.Conn.Close()

				log.Printf("player:%v left the room:%v due to connection close, player id:%v", player.Name, code, player.Id)
			}()
			for {
				_, msg, err := conn.ReadMessage()
				if err != nil {
					break
				}
				var msgStruct models.Message
				err = json.Unmarshal(msg, &msgStruct)
				if err != nil {
					log.Printf("Error while unmarshalling message, error:%v", err.Error())
					break
				}

				log.Printf("message received by player_name:%v, player_code:%v, message:%v", player.Name, player.Id, msgStruct)

				if msgStruct.Type == "move" {
					player.X = msgStruct.X
					player.Y = msgStruct.Y
					player.Direction = msgStruct.Direction
					msgStruct.Id = player.Id
					msgStruct.Name = player.Name
				}
				room.Broadcast <- &msgStruct
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
		code := mux.Vars(r)["code"]
		playerName := mux.Vars(r)["name"]

		room, ok := manager.GetRoom(code)
		if !ok {
			http.Error(w, "Room not found", http.StatusNotFound)
			return
		}

		// Find the player in the room
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

		// Send leave message to room
		leaveMsg := &models.Message{
			Type: "leave",
			Id:   playerToRemove.Id,
			Text: playerToRemove.Name,
		}
		room.Broadcast <- leaveMsg

		// Remove player from room
		room.Leave <- playerToRemove

		// Close player's connection
		playerToRemove.Conn.Close()

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"status": "left", "player": playerName})

		log.Printf("player:%v left the room:%v, player id:%v", playerToRemove.Name, code, playerToRemove.Id)
	}
}
