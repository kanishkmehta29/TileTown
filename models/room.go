package models

import (
	"github.com/gorilla/websocket"
)

type Player struct {
	Id           string
	Name         string
	X, Y         int
	Direction    string
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
	Type      string `json:"type"`
	Id        string `json:"id,omitempty"`
	X         int    `json:"x,omitempty"`
	Y         int    `json:"y,omitempty"`
	Direction string `json:"direction,omitempty"`
	Text      string `json:"text,omitempty"`
	Name      string `json:"name,omitempty"`
}
