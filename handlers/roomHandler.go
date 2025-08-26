package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/kanishkmehta29/TileTown/services"
)

func CreateRoomHandler(manager *services.RoomManager) http.HandlerFunc{
	return func(w http.ResponseWriter,r *http.Request){
		room := manager.CreateRoom()
		w.Header().Set("Content-Type","application/json")
		json.NewEncoder(w).Encode(map[string]string{"code":room.Code})
	}
}