import { Start } from './scenes/Start.js';

let game = null;

const config = {
    type: Phaser.AUTO,
    title: 'TileTown',
    description: '',
    parent: 'game-container',
    width: 1280,
    height: 720,
    backgroundColor: '#000000',
    pixelArt: false,
    scene: [
        Start
    ],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
}

export function startGame(roomCode, playerName) {
    const startScene = new Start(roomCode, playerName);
    
    const gameConfig = {
        ...config,
        scene: [startScene]
    };
    
    game = new Phaser.Game(gameConfig);
}
