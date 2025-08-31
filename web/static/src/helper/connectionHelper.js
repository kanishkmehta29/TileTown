import { addPlayer, setupPlayerControls } from "./playerHelper.js";

let ws = null;
let isLeaving = false; // Flag to prevent recursive leave calls

export function setupWebSocket(scene) {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const host = window.location.host;

  ws = new WebSocket(
    `${protocol}//${host}/rooms/${scene.roomCode}/join/${scene.playerName}`
  );

  setupCleanupHandlers(scene);

  ws.onopen = () => {
    console.log("Connected to TileTown server");
    setupPlayerControls(scene);
    if (scene.connectionStatusElement) {
      scene.connectionStatusElement.textContent = "🟢 Connected";
      scene.connectionStatusElement.style.color = "#00ff88";
    }
  };

  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    handleServerMessage(scene, message);
  };

  ws.onclose = () => {
    console.log("Disconnected from server");
    if (scene.connectionStatusElement) {
      scene.connectionStatusElement.textContent = "🔴 Disconnected";
      scene.connectionStatusElement.style.color = "#ff4444";
    }
  };

  ws.onerror = (error) => {
    console.error("WebSocket error:", error);
    if (scene.connectionStatusElement) {
      scene.connectionStatusElement.textContent = "⚠️ Connection Error";
      scene.connectionStatusElement.style.color = "#ffaa00";
    }
  };
}

function handleServerMessage(scene, message) {
  console.log('Received message:', message);

  switch (message.type) {
    case 'welcome':
      addPlayer(scene, message.id, message.name, message.x, message.y);
      updatePlayerPosition(scene, message);
      break;

    case 'move':
      updatePlayerPosition(scene, message);
      break;

    case 'leave':
      removePlayer(scene, message.id);
      break;
  }

  updatePlayerCount(scene);
}

export function setupDisplay(scene) {
  scene.connectionStatusElement = document.getElementById("connection-status");
  scene.playerCountElement = document.getElementById("player-count");
}

export function sendMovementDataToWS(scene) {
  if (ws && ws.readyState === WebSocket.OPEN && scene.player) {
    const sprite = scene.player.sprite || scene.player;
    const currentX = Math.round(sprite.x);
    const currentY = Math.round(sprite.y);

    // Only send if position has changed
    if (currentX !== scene.lastSentPosition.x || currentY !== scene.lastSentPosition.y) {
      let direction = scene.player.direction || 'down'; // Use player's current direction

      // Only calculate direction from movement if we don't have a stored direction
      if (!scene.player.direction) {
        const deltaX = currentX - scene.lastSentPosition.x;
        const deltaY = currentY - scene.lastSentPosition.y;

        if (deltaX > 0) {
          direction = 'right';
        }
        else if (deltaX < 0) {
          direction = 'left';
        }
        else if (deltaY < 0) {
          direction = 'up';
        }
        else {
          direction = 'down';
        }
      }

      scene.player.direction = direction;

      ws.send(JSON.stringify({
        type: 'move',
        id: scene.player.id,
        x: currentX,
        y: currentY,
        direction: direction,
        name: scene.player.name,
      }));

      scene.lastSentPosition.x = currentX;
      scene.lastSentPosition.y = currentY;
    }
  }
}

function updatePlayerPosition(scene, message) {
  let player = scene.players.get(message.id);

  if (!player) {
    addPlayer(scene, message.id, message.name || 'Player', message.x, message.y);
    player = scene.players.get(message.id);
  }

  if (!player) return;

  if (player.stopTimer) {
    player.stopTimer.remove();
  }

  player.x = message.x;
  player.y = message.y;
  player.direction = message.direction || 'down';

  // Update sprite position with smooth animation
  scene.tweens.add({
    targets: player.sprite,
    x: message.x,
    y: message.y,
    duration: 150,
    ease: 'Power2'
  });

  // Update name text position
  scene.tweens.add({
    targets: player.nameText,
    x: message.x,
    y: message.y - 30,
    duration: 150,
    ease: 'Power2'
  });

  // Play movement animation
  if (player.sprite.anims) {
    player.sprite.anims.play(player.direction, true);
  }

  // Set a timer to stop animation if no movement for 200ms
  player.stopTimer = scene.time.delayedCall(200, () => {
    if (player.sprite && player.sprite.anims) {
      player.sprite.anims.stop();
      player.sprite.setFrame(4); 
    }
  });
}


function updatePlayerCount(scene) {
  if (scene.playerCountElement) {
    scene.playerCountElement.textContent = `Players: ${scene.players.size}`;
  }
}

function removePlayer(scene, playerId) {
  const player = scene.players.get(playerId);
  if (!player) return;

  if (player.sprite) player.sprite.destroy();
  if (player.nameText) player.nameText.destroy();
  scene.players.delete(playerId);

  console.log(`Player ${player.name} left`);
}

// Setup cleanup handlers for when user leaves the page
function setupCleanupHandlers(scene) {
  window.addEventListener('beforeunload', () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.close();
      console.log('WebSocket connection closed');
    }
  });
}
