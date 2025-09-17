package services

import (
	"log"

	"github.com/kanishkmehta29/TileTown/models"
	"github.com/kanishkmehta29/TileTown/utils"
)

type RoomManager struct {
	rooms map[string]*models.Room
}

func NewRoomManager() *RoomManager {
	return &RoomManager{
		rooms: make(map[string]*models.Room),
	}
}

func (m *RoomManager) CreateRoom() *models.Room {
	newRoomCode := utils.RandomCode()
	newRoom := &models.Room{
		Code:      newRoomCode,
		Players:   make(map[*models.Player]bool),
		Broadcast: make(chan *models.Message),
		Join:      make(chan *models.Player),
		Leave:     make(chan *models.Player),
	}
	m.rooms[newRoomCode] = newRoom
	log.Printf("room created with code:%v", newRoomCode)

	go runRoom(newRoom)
	return newRoom
}

func (m *RoomManager) GetRoom(code string) (*models.Room, bool) {
	room, ok := m.rooms[code]
	return room, ok
}

func runRoom(r *models.Room) {
	for {
		select {
		case player := <-r.Join:
			r.Players[player] = true
		case player := <-r.Leave:
			_, ok := r.Players[player]
			if ok {
				delete(r.Players, player)
				close(player.MessageQueue)
			}
		case msg := <-r.Broadcast:
			for p := range r.Players {
				if p.Id == msg.FromId {
					continue
				}
				select {
				case p.MessageQueue <- msg:
				default:
					log.Printf("Removing the player %v as its message queue filled",p.Name)
					close(p.MessageQueue)
					delete(r.Players, p)
				}
			}
		}
	}
}
