package models

import (
	"github.com/gorilla/websocket"
)

type Player struct{
	Conn *websocket.Conn
	Send chan []byte
}
type Room struct{
	Code string
	Players map[*Player]bool
	Broadcast chan []byte
	Join chan *Player
	Leave chan *Player
}