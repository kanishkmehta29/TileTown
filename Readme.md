# TileTown 🏘️

A real-time multiplayer virtual office game built with Go backend and Phaser.js frontend. Players can create or join virtual office rooms, move around in a 2D office environment, and interact with other players in real-time.

## 🎮 Features

- **Real-time Multiplayer**: Multiple players can join the same virtual office room
- **WebSocket Communication**: Live player movement synchronization
- **Room Management**: Create new rooms or join existing ones with room codes
- **Interactive Office Environment**: Navigate through meeting rooms, work areas, lounge spaces, and more
- **Player Customization**: Each player has a unique appearance and name tag
- **Collision Detection**: Realistic physics with furniture and wall boundaries
- **Responsive Design**: Works on desktop and mobile devices

## 🏗️ Architecture

### Backend (Go)
- **HTTP Server**: Gorilla Mux router for REST endpoints and WebSocket upgrades
- **WebSocket Management**: Real-time bidirectional communication
- **Room Service**: Manages room creation, player joining/leaving, and message broadcasting
- **Concurrent Design**: Each room runs in its own goroutine for scalability

### Frontend (JavaScript/Phaser.js)
- **Phaser 3 Game Engine**: Handles 2D rendering, physics, and animations
- **Modular Architecture**: Organized into helper modules for different concerns
- **WebSocket Client**: Maintains connection with backend for real-time updates
- **Responsive UI**: Modern CSS with backdrop filters and smooth animations

## 📁 Project Structure

```
TileTown/
├── main.go                     # Application entry point
├── go.mod                      # Go module dependencies
├── constants/
│   └── constants.go            # Application constants
├── handlers/
│   ├── roomHandler.go          # Room creation endpoints
│   ├── staticHandler.go        # Static file serving
│   └── wsHandler.go            # WebSocket connection handling
├── models/
│   └── room.go                 # Data structures (Player, Room, Message)
├── services/
│   └── roomService.go          # Room management business logic
├── utils/
│   └── utils.go                # Utility functions (room code generation)
└── web/
    ├── index.html              # Legacy game interface
    └── static/
        ├── welcome.html        # Landing page
        ├── game.html           # Main game interface
        ├── styles.css          # Welcome page styles
        ├── game-styles.css     # Game interface styles
        ├── phaser.js           # Phaser.js library
        ├── assets/             # Game sprites and images
        └── src/
            ├── main.js         # Game initialization
            ├── scenes/
            │   └── Start.js    # Main game scene
            └── helper/
                ├── connectionHelper.js  # WebSocket management
                ├── mapHelper.js        # Office layout and assets
                └── playerHelper.js     # Player controls and animations
```

## 🚀 Getting Started

### Prerequisites
- Go 1.19 or higher
- Modern web browser with WebSocket support

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd TileTown
   ```

2. **Install Go dependencies**
   ```bash
   go mod tidy
   ```

3. **Run the server**
   ```bash
   go run main.go
   ```

4. **Open your browser**
   Navigate to `http://localhost:8080`

## 🎯 How to Play

### Creating a Room
1. Visit the welcome page
2. Click "Create New Room"
3. Enter your player name
4. Click "Create & Join Room"
5. Share the generated room code with others

### Joining a Room
1. Click "Join Existing Room"
2. Enter the room code provided by the room creator
3. Enter your player name
4. Click "Join Room"

### Game Controls
- **Arrow Keys** or **WASD**: Move your character
- **Real-time Movement**: Your position updates live for other players
- **Collision System**: Navigate around furniture and obstacles

## 🏢 Office Layout

The virtual office includes several areas:

- **Meeting Room**: Conference table with chairs for team meetings
- **Work Area**: Individual desks and work chairs for focused work
- **Lounge Area**: Comfortable sofas and round table for casual interactions
- **Decorative Elements**: Plants, walls, and office equipment for ambiance