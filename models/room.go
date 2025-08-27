package models

import (
	"github.com/gorilla/websocket"
)

type Player struct {
	Id           string
	Name         string
	X, Y         int
	Conn         *websocket.Conn
	MessageQueue chan *Message
}
type Room struct {
	Code      string
	Players   map[*Player]bool
	Broadcast chan *Message
	Join      chan *Player
	Leave     chan *Player
}

type Message struct {
	Type string `json:"type"`
	Id   string `json:"id,omitempty"`
	X    int    `json:"x,omitempty"`
	Y    int    `json:"y,omitempty"`
	Text string `json:"text,omitempty"`
}
