// Chat history storage - maps conversation pairs to message arrays
const chatHistories = new Map();
let currentChatTarget = null;
let chatWS = null;

export function initializeChatSystem(scene, ws) {
  chatWS = ws;
  setupChatUI(scene);
}

function setupChatUI(scene) {
  const chatButton = document.getElementById('chat-button');
  const chatModal = document.getElementById('chat-modal');
  const chatClose = document.getElementById('chat-close');
  const chatSend = document.getElementById('chat-send');
  const chatInput = document.getElementById('chat-input');

  // Chat button click
  chatButton.addEventListener('click', () => {
    if (currentChatTarget) {
      openChatModal(currentChatTarget);
    }
  });

  // Close chat modal
  chatClose.addEventListener('click', closeChatModal);
  chatModal.addEventListener('click', (e) => {
    if (e.target === chatModal) {
      closeChatModal();
    }
  });

  // Send message
  chatSend.addEventListener('click', sendMessage);
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });
}

export function checkPlayerProximity(scene) {
  if (!scene.player || !scene.players) return;

  const myPlayer = scene.player;
  const chatButton = document.getElementById('chat-button');
  let nearbyPlayer = null;
  const proximityDistance = 60; // Reduced from 80 to 60 pixels

  // Check distance to all other players
  for (const [playerId, player] of scene.players) {
    if (playerId === myPlayer.id) continue; // Skip self

    const distance = Phaser.Math.Distance.Between(
      myPlayer.sprite.x, myPlayer.sprite.y,
      player.sprite.x, player.sprite.y
    );

    if (distance <= proximityDistance) {
      nearbyPlayer = player;
      break; // Take the first nearby player
    }
  }

  // Show/hide chat button based on proximity
  if (nearbyPlayer && nearbyPlayer.id !== currentChatTarget?.id) {
    currentChatTarget = nearbyPlayer;
    
    // Position the chat button between the two players
    const myPlayer = scene.player;
    const buttonX = (myPlayer.sprite.x + nearbyPlayer.sprite.x) / 2;
    const buttonY = (myPlayer.sprite.y + nearbyPlayer.sprite.y) / 2 - 40;
    
    // Convert game coordinates to screen coordinates
    const gameContainer = document.getElementById('game-container');
    const canvas = gameContainer ? gameContainer.querySelector('canvas') : null;
    
    if (canvas) {
      const canvasRect = canvas.getBoundingClientRect();
      // Assuming game world is 800x600 (adjust if different)
      const scaleX = canvasRect.width / 800;
      const scaleY = canvasRect.height / 600;
      
      // Position relative to viewport
      const screenX = canvasRect.left + (buttonX * scaleX);
      const screenY = canvasRect.top + (buttonY * scaleY);
      
      chatButton.style.left = Math.max(10, Math.min(window.innerWidth - 200, screenX)) + 'px';
      chatButton.style.top = Math.max(10, Math.min(window.innerHeight - 50, screenY)) + 'px';
    } else {
      // Fallback positioning if canvas not found
      chatButton.style.left = '50%';
      chatButton.style.top = '50%';
      chatButton.style.transform = 'translate(-50%, -50%)';
    }
    
    chatButton.style.display = 'block';
    chatButton.textContent = `💬 Chat with ${nearbyPlayer.name}`;
  } else if (!nearbyPlayer) {
    currentChatTarget = null;
    chatButton.style.display = 'none';
  }
}

function openChatModal(targetPlayer) {
  const chatModal = document.getElementById('chat-modal');
  const chatWith = document.getElementById('chat-with');
  const chatMessages = document.getElementById('chat-messages');

  chatWith.textContent = `Chat with ${targetPlayer.name}`;
  
  // Load chat history for this player
  loadChatHistory(targetPlayer.id, chatMessages);
  
  chatModal.style.display = 'block'; // Changed from 'flex' to 'block'

  // Focus on input
  document.getElementById('chat-input').focus();
}

function loadChatHistory(targetPlayerId, chatMessagesContainer) {
  const scene = window.currentGameScene || document.scene; // Fallback reference
  if (!scene || !scene.player) return;
  
  const conversationKey = getChatKey(scene.player.id, targetPlayerId);
  const messages = chatHistories.get(conversationKey) || [];
  
  // Clear container
  chatMessagesContainer.innerHTML = '';
  
  // Display all historical messages
  messages.forEach(msg => {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${msg.type}`;
    
    if (msg.type === 'received') {
      const senderSpan = document.createElement('div');
      senderSpan.className = 'sender';
      senderSpan.textContent = msg.fromName;
      messageDiv.appendChild(senderSpan);
    }
    
    const textDiv = document.createElement('div');
    textDiv.textContent = msg.text;
    messageDiv.appendChild(textDiv);
    
    // Add timestamp
    const timestampDiv = document.createElement('div');
    timestampDiv.className = 'timestamp';
    timestampDiv.textContent = formatTimestamp(msg.timestamp);
    messageDiv.appendChild(timestampDiv);
    
    chatMessagesContainer.appendChild(messageDiv);
  });
  
  // Scroll to bottom
  chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
}

function getChatKey(playerId1, playerId2) {
  // Create consistent key regardless of order
  return [playerId1, playerId2].sort().join('-');
}

function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  
  // If today, show only time
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  // If this year, show date and time
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + 
           ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  // Show full date and time
  return date.toLocaleDateString() + ' ' + 
         date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function closeChatModal() {
  const chatModal = document.getElementById('chat-modal');
  const chatInput = document.getElementById('chat-input');
  
  chatModal.style.display = 'none';
  chatInput.value = '';
}

function sendMessage() {
  const chatInput = document.getElementById('chat-input');
  const message = chatInput.value.trim();

  if (!message || !currentChatTarget || !chatWS) return;

  // Send chat message via WebSocket
  chatWS.send(JSON.stringify({
    type: 'chat',
    text: message,
    toId: currentChatTarget.id,
  }));

  // Store in chat history
  const scene = window.currentGameScene || document.scene; // Fallback reference
  if (scene && scene.player) {
    storeChatMessage({
      fromId: scene.player.id,
      fromName: scene.player.name,
      text: message,
      type: 'sent',
      timestamp: new Date()
    }, currentChatTarget.id);
  }

  // Add message to chat UI
  addMessageToUI(message, true, 'You');
  
  // Clear input
  chatInput.value = '';
}

export function handleChatMessage(scene, message) {
  // Don't handle messages from ourselves to avoid duplicate notifications
  if (!scene || !scene.player || message.fromId === scene.player.id) {
    return;
  }

  // Store the message in history
  storeChatMessage({
    fromId: message.fromId,
    fromName: message.fromName,
    text: message.text,
    type: 'received',
    timestamp: new Date()
  }, message.fromId);

  // Only show in UI if chatting with this player
  if (currentChatTarget && message.fromId === currentChatTarget.id) {
    addMessageToUI(message.text, false, message.fromName);
    
    // Show notification if chat is closed
    const chatModal = document.getElementById('chat-modal');
    if (chatModal && chatModal.style.display === 'none') {
      showChatNotification(message.fromName);
    }
  } else {
    // Show notification for messages from other players (only if not from self)
    showChatNotification(message.fromName);
  }
}

function storeChatMessage(messageData, otherPlayerId) {
  const scene = window.currentGameScene || document.scene;
  if (!scene || !scene.player) return;
  
  const conversationKey = getChatKey(scene.player.id, otherPlayerId);
  
  if (!chatHistories.has(conversationKey)) {
    chatHistories.set(conversationKey, []);
  }
  
  const history = chatHistories.get(conversationKey);
  history.push({
    id: Date.now() + Math.random(),
    ...messageData
  });
  
  // Keep only last 100 messages per conversation
  if (history.length > 100) {
    history.shift();
  }
}

function addMessageToUI(text, isSent, senderName) {
  const chatMessages = document.getElementById('chat-messages');
  
  const messageDiv = document.createElement('div');
  messageDiv.className = `chat-message ${isSent ? 'sent' : 'received'}`;
  
  if (!isSent) {
    const senderSpan = document.createElement('div');
    senderSpan.className = 'sender';
    senderSpan.textContent = senderName;
    messageDiv.appendChild(senderSpan);
  }
  
  const textDiv = document.createElement('div');
  textDiv.textContent = text;
  messageDiv.appendChild(textDiv);
  
  // Add timestamp
  const timestampDiv = document.createElement('div');
  timestampDiv.className = 'timestamp';
  timestampDiv.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  messageDiv.appendChild(timestampDiv);
  
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showChatNotification(fromName) {
  const chatButton = document.getElementById('chat-button');
  const originalText = chatButton.textContent;
  
  chatButton.textContent = `💬 New message from ${fromName}!`;
  chatButton.style.background = '#e74c3c';
  
  // Reset after 3 seconds
  setTimeout(() => {
    chatButton.textContent = originalText;
    chatButton.style.background = '#3498db';
  }, 3000);
}
