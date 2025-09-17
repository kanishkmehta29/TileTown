# TileTown 🏘️

A real-time multiplayer virtual office game built with Go backend and Phaser.js frontend. Players can create or join virtual office rooms, move around in a 2D office environment, interact with other players in real-time, chat privately, and make video calls with nearby colleagues.

## 🎮 Features

- **Real-time Multiplayer**: Multiple players can join the same virtual office room
- **WebSocket Communication**: Live player movement synchronization
- **Room Management**: Create new rooms or join existing ones with room codes
- **Interactive Office Environment**: Navigate through meeting rooms, work areas, lounge spaces, and more
- **Player Customization**: Each player has a unique appearance and name tag
- **Collision Detection**: Realistic physics with furniture and wall boundaries
- **Proximity-Based Chat**: Private messaging with players when you're nearby
- **Video Calling**: WebRTC-powered video calls with camera/microphone controls
- **Chat History**: Persistent chat conversations per player
- **Responsive Design**: Works on desktop and mobile devices

## 🏗️ Architecture

### Backend (Go)
- **HTTP Server**: Gorilla Mux router for REST endpoints and WebSocket upgrades
- **WebSocket Management**: Real-time bidirectional communication
- **Room Service**: Manages room creation, player joining/leaving, and message broadcasting
- **Message Routing**: Handles movement, chat, and video call signaling messages
- **Concurrent Design**: Each room runs in its own goroutine for scalability

### Frontend (JavaScript/Phaser.js)
- **Phaser 3 Game Engine**: Handles 2D rendering, physics, and animations
- **Modular Architecture**: Organized into helper modules for different concerns
- **WebSocket Client**: Maintains connection with backend for real-time updates
- **WebRTC Integration**: Peer-to-peer video calling with STUN servers
- **Chat System**: Real-time messaging with history persistence
- **Responsive UI**: Modern CSS with backdrop filters and smooth animations

## 📁 Project Structure

```
TileTown/
├── main.go                     # Application entry point
├── go.mod                      # Go module dependencies
├── go.sum                      # Go module checksums
├── Readme.md                   # Project documentation
├── constants/
│   └── constants.go            # Application constants (message types, defaults)
├── handlers/
│   ├── roomHandler.go          # Room creation endpoints
│   ├── staticHandler.go        # Static file serving
│   └── wsHandler.go            # WebSocket connection and message handling
├── models/
│   └── room.go                 # Data structures (Player, Room, Message)
├── services/
│   └── roomService.go          # Room management business logic
├── utils/
│   └── utils.go                # Utility functions (room code generation)
└── web/
    └── static/
        ├── welcome.html        # Landing page with room creation/joining
        ├── game.html           # Main game interface
        ├── index.html          # Redirect to welcome page
        ├── phaser.js           # Phaser.js game engine library
        ├── css/
        │   ├── styles.css      # Welcome page styles
        │   └── game-styles.css # Game interface and chat/video call styles
        ├── javascript/
        │   └── welcome.js      # Welcome page functionality
        ├── assets/
        │   ├── background.jpg  # Office background
        │   ├── characters/     # Player sprites and animations
        │   │   ├── dude.png
        │   │   ├── character_move.png
        │   │   ├── characters.png
        │   │   └── Walk.png
        │   ├── furniture/      # Office furniture sprites
        │   │   ├── chair.png
        │   │   ├── table.png
        │   │   ├── black_sofa.png
        │   │   ├── white_sofa.png
        │   │   ├── round_table.png
        │   │   ├── work_chair.png
        │   │   └── work_table.png
        │   ├── environment/    # Environment elements
        │   │   ├── door.png
        │   │   ├── plant1.png
        │   │   └── plant2.png
        │   └── walls/          # Wall sprites for collision
        │       ├── vertical_wall.png
        │       └── horizontal_wall.png
        └── src/
            ├── main.js         # Game initialization and configuration
            ├── scenes/
            │   └── Start.js    # Main game scene with update loop
            └── helper/
                ├── connectionHelper.js  # WebSocket management and message handling
                ├── mapHelper.js         # Office layout, assets, and physics setup
                ├── playerHelper.js      # Player controls, animations, and collision
                ├── chatHelper.js        # Chat system with history and proximity detection
                └── videoCallHelper.js   # WebRTC video calling system
```

## 🚀 Getting Started

### Prerequisites
- Go 1.19 or higher
- Modern web browser with WebSocket and WebRTC support
- Camera and microphone (optional, for video calls)

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

### Communication Features

#### Proximity Chat
- **Automatic Detection**: Chat buttons appear when you're near other players
- **Private Messaging**: Click the chat button to start a private conversation
- **Chat History**: Previous conversations are saved and restored
- **Real-time Notifications**: Get notified of new messages

#### Video Calling
- **Proximity Activation**: Video call buttons appear when near other players
- **WebRTC Technology**: Peer-to-peer video calls with low latency
- **Media Controls**: Mute/unmute audio and video during calls
- **Call Management**: Accept, decline, or end calls with intuitive controls

## 🏢 Office Layout

The virtual office includes several areas:

- **Meeting Room**: Conference table with chairs for team meetings
- **Work Area**: Individual desks and work chairs for focused work
- **Lounge Area**: Comfortable sofas and round table for casual interactions
- **Decorative Elements**: Plants, walls, and office equipment for ambiance
- **Open Spaces**: Areas for free movement and spontaneous interactions

## 🔧 API Endpoints

### REST Endpoints
- `POST /rooms` - Create a new room
- `DELETE /rooms/{code}/leave/{name}` - Leave a room

### WebSocket Endpoints
- `GET /rooms/{code}/join/{name}` - Join room via WebSocket

### Message Types
- `welcome` - Initial player setup and position
- `move` - Player movement updates with direction
- `chat` - Private chat messages between players
- `leave` - Player disconnection notification
- `video-call-offer` - WebRTC offer for video call initiation
- `video-call-answer` - WebRTC answer for call acceptance
- `video-call-ice-candidate` - ICE candidates for connection establishment
- `video-call-end` - Call termination signal
- `video-call-declined` - Call rejection signal