// WebRTC Video Call System
let localStream = null;
let remoteStream = null;
let peerConnection = null;
let isCallActive = false;
let currentCallTarget = null;
let videoCallWS = null;
let isAudioMuted = false;
let isVideoMuted = false;

// WebRTC configuration with STUN servers for NAT traversal
const pcConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' }
  ]
};

export function initializeVideoCallSystem(scene, ws) {
  console.log('Initializing video call system...');
  videoCallWS = ws;
  setupVideoCallUI();
  console.log('Video call system initialized');
}

function setupVideoCallUI() {
  const videoCallButton = document.getElementById('video-call-button');
  const videoCallModal = document.getElementById('video-call-modal');
  const videoCallClose = document.getElementById('video-call-close');
  const muteAudio = document.getElementById('mute-audio');
  const muteVideo = document.getElementById('mute-video');
  const endCall = document.getElementById('end-call');

  // Video call button click
  videoCallButton.addEventListener('click', () => {
    if (currentCallTarget) {
      startVideoCall(currentCallTarget);
    }
  });

  // Close video call modal
  videoCallClose.addEventListener('click', endVideoCall);
  endCall.addEventListener('click', endVideoCall);

  // Media controls
  muteAudio.addEventListener('click', toggleAudio);
  muteVideo.addEventListener('click', toggleVideo);

  // Close on background click
  videoCallModal.addEventListener('click', (e) => {
    if (e.target === videoCallModal) {
      endVideoCall();
    }
  });
}

export function showVideoCallButton(targetPlayer, position) {
  const videoCallButton = document.getElementById('video-call-button');
  if (!videoCallButton) return;

  currentCallTarget = targetPlayer;
  
  // Position the video call button next to the chat button
  videoCallButton.style.left = (position.x + 150) + 'px'; // Offset from chat button
  videoCallButton.style.top = position.y + 'px';
  videoCallButton.style.display = 'block';
  videoCallButton.textContent = `📹 Call ${targetPlayer.name}`;
}

export function hideVideoCallButton() {
  const videoCallButton = document.getElementById('video-call-button');
  if (videoCallButton) {
    videoCallButton.style.display = 'none';
  }
  currentCallTarget = null;
}

async function startVideoCall(targetPlayer) {
  try {
    updateCallStatus('Requesting camera and microphone access...');
    
    // Get user media
    localStream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480 },
      audio: true
    });

    // Show the video call modal
    showVideoCallModal(targetPlayer);
    
    // Display local video
    const localVideo = document.getElementById('local-video');
    localVideo.srcObject = localStream;

    // Create peer connection
    createPeerConnection();

    // Add local stream to peer connection
    localStream.getTracks().forEach(track => {
      peerConnection.addTrack(track, localStream);
    });

    updateCallStatus('Calling...');

    // Create and send offer
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    // Send offer through WebSocket
    sendSignalingMessage({
      type: 'video-call-offer',
      offer: offer,
      toId: targetPlayer.id
    });

    isCallActive = true;

  } catch (error) {
    console.error('Error starting video call:', error);
    updateCallStatus('Failed to access camera/microphone');
    setTimeout(() => {
      endVideoCall();
    }, 2000);
  }
}

function createPeerConnection() {
  peerConnection = new RTCPeerConnection(pcConfig);

  // Handle remote stream
  peerConnection.ontrack = (event) => {
    console.log('Received remote stream');
    remoteStream = event.streams[0];
    const remoteVideo = document.getElementById('remote-video');
    remoteVideo.srcObject = remoteStream;
    updateCallStatus('Connected');
  };

  // Handle ICE candidates
  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      sendSignalingMessage({
        type: 'video-call-ice-candidate',
        candidate: event.candidate,
        toId: currentCallTarget?.id
      });
    }
  };

  // Handle connection state changes
  peerConnection.onconnectionstatechange = () => {
    console.log('Connection state:', peerConnection.connectionState);
    switch (peerConnection.connectionState) {
      case 'connected':
        updateCallStatus('Connected');
        break;
      case 'disconnected':
      case 'failed':
        updateCallStatus('Connection failed');
        setTimeout(endVideoCall, 2000);
        break;
      case 'closed':
        updateCallStatus('Call ended');
        break;
    }
  };
}

function showVideoCallModal(targetPlayer) {
  const modal = document.getElementById('video-call-modal');
  const title = document.getElementById('video-call-title');
  
  title.textContent = `Video Call with ${targetPlayer.name}`;
  modal.style.display = 'flex';
  
  // Hide proximity buttons
  hideProximityButtons();
}

function hideVideoCallModal() {
  const modal = document.getElementById('video-call-modal');
  modal.style.display = 'none';
}

function hideProximityButtons() {
  const chatButton = document.getElementById('chat-button');
  const videoCallButton = document.getElementById('video-call-button');
  
  if (chatButton) chatButton.style.display = 'none';
  if (videoCallButton) videoCallButton.style.display = 'none';
}

export async function handleVideoCallSignaling(message) {
  try {
    switch (message.type) {
      case 'video-call-offer':
        await handleIncomingOffer(message);
        break;
      
      case 'video-call-answer':
        await handleIncomingAnswer(message);
        break;
      
      case 'video-call-ice-candidate':
        await handleIncomingIceCandidate(message);
        break;
      
      case 'video-call-end':
        handleCallEnd();
        break;
      
      case 'video-call-declined':
        handleCallDeclined();
        break;
    }
  } catch (error) {
    console.error('Error handling video call signaling:', error);
  }
}

async function handleIncomingOffer(message) {
  const confirmed = confirm(`${message.fromName} wants to video call with you. Accept?`);
  
  if (!confirmed) {
    // Send decline message
    sendSignalingMessage({
      type: 'video-call-declined',
      toId: message.fromId
    });
    return;
  }

  try {
    // Get user media
    localStream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480 },
      audio: true
    });

    // Find the caller in players list
    const scene = window.currentGameScene;
    const caller = scene?.players.get(message.fromId);
    if (caller) {
      currentCallTarget = caller;
      showVideoCallModal(caller);
    }

    // Display local video
    const localVideo = document.getElementById('local-video');
    localVideo.srcObject = localStream;

    // Create peer connection
    createPeerConnection();

    // Add local stream
    localStream.getTracks().forEach(track => {
      peerConnection.addTrack(track, localStream);
    });

    // Set remote description and create answer
    await peerConnection.setRemoteDescription(message.offer);
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    // Send answer
    sendSignalingMessage({
      type: 'video-call-answer',
      answer: answer,
      toId: message.fromId
    });

    updateCallStatus('Connecting...');
    isCallActive = true;

  } catch (error) {
    console.error('Error handling incoming call:', error);
    updateCallStatus('Failed to accept call');
  }
}

async function handleIncomingAnswer(message) {
  if (peerConnection && peerConnection.signalingState === 'have-local-offer') {
    await peerConnection.setRemoteDescription(message.answer);
    updateCallStatus('Connecting...');
  }
}

async function handleIncomingIceCandidate(message) {
  if (peerConnection && peerConnection.remoteDescription) {
    await peerConnection.addIceCandidate(message.candidate);
  }
}

function handleCallEnd() {
  updateCallStatus('Call ended by remote user');
  setTimeout(endVideoCall, 1000);
}

function handleCallDeclined() {
  updateCallStatus('Call declined');
  setTimeout(endVideoCall, 2000);
}

function toggleAudio() {
  if (localStream) {
    const audioTrack = localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      isAudioMuted = !audioTrack.enabled;
      
      const muteBtn = document.getElementById('mute-audio');
      muteBtn.textContent = isAudioMuted ? '🔇' : '🎤';
      muteBtn.classList.toggle('muted', isAudioMuted);
    }
  }
}

function toggleVideo() {
  if (localStream) {
    const videoTrack = localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      isVideoMuted = !videoTrack.enabled;
      
      const videoBtn = document.getElementById('mute-video');
      videoBtn.textContent = isVideoMuted ? '📹❌' : '📹';
      videoBtn.classList.toggle('muted', isVideoMuted);
    }
  }
}

function endVideoCall() {
  // Send end call signal to remote peer
  if (currentCallTarget && isCallActive) {
    sendSignalingMessage({
      type: 'video-call-end',
      toId: currentCallTarget.id
    });
  }

  // Clean up local resources
  cleanupCall();
  
  // Hide modal
  hideVideoCallModal();
  
  updateCallStatus('Call ended');
}

function cleanupCall() {
  // Stop local stream
  if (localStream) {
    localStream.getTracks().forEach(track => track.stop());
    localStream = null;
  }

  // Close peer connection
  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
  }

  // Reset state
  isCallActive = false;
  currentCallTarget = null;
  isAudioMuted = false;
  isVideoMuted = false;

  // Clear video elements
  const localVideo = document.getElementById('local-video');
  const remoteVideo = document.getElementById('remote-video');
  
  if (localVideo) localVideo.srcObject = null;
  if (remoteVideo) remoteVideo.srcObject = null;
}

function sendSignalingMessage(message) {
  if (videoCallWS && videoCallWS.readyState === WebSocket.OPEN) {
    videoCallWS.send(JSON.stringify(message));
  }
}

function updateCallStatus(status) {
  const statusElement = document.getElementById('call-status');
  if (statusElement) {
    statusElement.textContent = status;
  }
}

export function cleanupVideoCallSystem() {
  if (isCallActive) {
    endVideoCall();
  }
  hideVideoCallButton();
}
