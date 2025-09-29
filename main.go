package main

import (
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"
	"github.com/kanishkmehta29/TileTown/handlers"
	"github.com/kanishkmehta29/TileTown/services"
)

func main() {
	// Room manager instance
	roomManager := services.NewRoomManager()

	// Router setup
	r := mux.NewRouter()
	r.HandleFunc("/rooms", handlers.CreateRoomHandler(roomManager)).Methods("POST")
	r.HandleFunc("/rooms/{code}/join/{name}", handlers.JoinRoomHandler(roomManager)).Methods("GET")
	r.HandleFunc("/rooms/{code}/leave/{name}", handlers.LeaveRoomHandler(roomManager)).Methods("DELETE")
	r.PathPrefix("/").Handler(handlers.StaticFileHandler())

	// Pick port from environment (Render sets PORT dynamically)
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080" // fallback for local dev
	}

	log.Printf("Server running on :%s", port)
	if err := http.ListenAndServe(":"+port, r); err != nil {
		log.Fatal(err)
	}
}
