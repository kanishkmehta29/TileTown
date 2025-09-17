// Option selection functionality
window.selectOption = function(option) {
  const createBtn = document.getElementById('createRoomBtn');
  const joinBtn = document.getElementById('joinRoomBtn');
  const createForm = document.getElementById('createRoomForm');
  const joinForm = document.getElementById('joinRoomForm');

  if (option === 'create') {
    createBtn.classList.add('active');
    joinBtn.classList.remove('active');
    createForm.classList.add('active');
    joinForm.classList.remove('active');
  } else {
    joinBtn.classList.add('active');
    createBtn.classList.remove('active');
    joinForm.classList.add('active');
    createForm.classList.remove('active');
  }
};

// Create new room function
window.createRoom = async function() {
  const playerName = document.getElementById("createPlayerName").value.trim();

  if (!playerName) {
    alert("Please enter your name");
    return;
  }

  try {
    // Show loading state
    document.getElementById("joinForm").style.display = "none";
    document.getElementById("info").style.display = "block";
    document.querySelector("#info p").textContent = "🏗️ Creating your room...";

    // Call the API to create a new room
    const response = await fetch('/rooms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to create room: ${response.status}`);
    }

    const roomData = await response.json();
    const roomCode = roomData.code;

    if (!roomCode) {
      throw new Error('No room code received from server');
    }

    // Redirect to game with room info
    window.location.href = `game.html?room=${roomCode}&player=${encodeURIComponent(playerName)}&new=true`;
    
  } catch (error) {
    console.error('Error creating room:', error);
    alert('Failed to create room. Please try again.');
    
    // Show the form again
    document.getElementById("info").style.display = "none";
    document.getElementById("joinForm").style.display = "block";
  }
};

// Join existing room function
window.joinExistingRoom = function() {
  const roomCode = document.getElementById("roomCode").value.trim();
  const playerName = document.getElementById("joinPlayerName").value.trim();

  if (!roomCode || !playerName) {
    alert("Please enter both room code and your name");
    return;
  }

  // Redirect to game with room info
  window.location.href = `game.html?room=${roomCode}&player=${encodeURIComponent(playerName)}&new=false`;
};