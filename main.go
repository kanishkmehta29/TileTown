package main

import (
	"log"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/kanishkmehta29/TileTown/handlers"
	"github.com/kanishkmehta29/TileTown/services"
)

func main() {
	roomManager := services.NewRoomManager()

	r := mux.NewRouter()
	r.HandleFunc("/rooms", handlers.CreateRoomHandler(roomManager)).Methods("POST")
	r.HandleFunc("/rooms/{code}/join/{name}", handlers.JoinRoomHandler(roomManager)).Methods("GET")
	r.HandleFunc("/rooms/{code}/leave/{name}", handlers.LeaveRoomHandler(roomManager)).Methods("DELETE")
	r.PathPrefix("/").Handler(handlers.StaticFileHandler())

	log.Println("Server running on :8080")
	if err := http.ListenAndServe(":8080", r); err != nil {
		log.Fatal(err)
	}

}
