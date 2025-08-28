import { Start } from './scenes/Start.js';

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

new Phaser.Game(config);
            