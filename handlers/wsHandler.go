package handlers

import (
	"log"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
	"github.com/kanishkmehta29/TileTown/models"
	"github.com/kanishkmehta29/TileTown/services"
)

// Upgrader is used to upgrade HTTP connections to WebSocket connections
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool{
		return true
	},
}

func JoinRoomHandler(manager *services.RoomManager) http.HandlerFunc{
	return func(w http.ResponseWriter,r *http.Request){
		code := mux.Vars(r)["code"]

		room,ok := manager.GetRoom(code)
		if(!ok){
			http.Error(w, "Room not found", http.StatusNotFound)
			return
		}

		conn,err := upgrader.Upgrade(w,r,nil)
		if err != nil{
			log.Println("upgrade error:",err)
			return
		}

		player := &models.Player{
			Conn: conn,
			Send: make(chan []byte, 256),
		}

		room.Join <- player

		//read loop
		go func(){
			defer func(){
				room.Leave <- player
				player.Conn.Close()
			}()
			for{
				_,msg,err := conn.ReadMessage()
				if err != nil{
					break
				}
				room.Broadcast <- msg
			}
		}()

		//write loop
		go func(){
			for msg := range player.Send{
				err := conn.WriteMessage(websocket.TextMessage,msg)
				if err != nil{
					break
				}
			}
		}()
	}
}