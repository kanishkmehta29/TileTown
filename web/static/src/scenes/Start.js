import { sendMovementDataToWS, setupDisplay, setupWebSocket } from "../helper/connectionHelper.js";
import { preloadAssets, setupUI } from "../helper/mapHelper.js";
import { handlePlayerMovement } from "../helper/playerHelper.js";


export class Start extends Phaser.Scene {
  constructor(roomCode, playerName) {
    super("Start");
    this.players = new Map();
    this.roomCode = roomCode;
    this.playerName = playerName;
    this.lastSentPosition = { x: 0, y: 0 };
  }

  preload() {
    preloadAssets(this)
  }

  create() {
    setupUI(this)
    setupWebSocket(this)
    setupDisplay(this)
  }

  update() {
    handlePlayerMovement(this)
    sendMovementDataToWS(this)
  }

  }
