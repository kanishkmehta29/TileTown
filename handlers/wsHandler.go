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
			X:            5,
			Y:            5,
			Conn:         conn,
			MessageQueue: make(chan *models.Message, 256),
		}

		room.Join <- player
		log.Printf("player:%v joined the room:%v, player id:%v", player.Name, code, player.Id)

		welcomeMsg := &models.Message{
			Type: "welcome",
			Id:   player.Id,
			X:    player.X,
			Y:    player.Y,
		}
		player.MessageQueue <- welcomeMsg

		joinMsg := &models.Message{
			Type: "playerJoined",
			Id:   player.Id,
			Text: player.Name,
			X:    player.X,
			Y:    player.Y,
		}
		room.Broadcast <- joinMsg

		//read loop
		go func() {
			defer func() {
				room.Leave <- player
				player.Conn.Close()
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

				if msgStruct.Type == constants.MessageTypeMove {
					player.X = msgStruct.X
					player.Y = msgStruct.Y
					msgStruct.Id = player.Id // Ensure the message has the correct player ID
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
