export function setupPlayer(scene) {
  const player = scene.physics.add.sprite(100, 450, "dude");
  player.setBounce(0.2);
  player.setCollideWorldBounds(true);
  player.setSize(20, 30);
  player.setOffset(6, 9);
  return player;
}

function createAnimations(scene) {
  scene.anims.create({
    key: "left",
    frames: scene.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1,
  });

  scene.anims.create({
    key: "up",
    frames: scene.anims.generateFrameNumbers("dude", { start: 4, end: 4 }),
    frameRate: 10,
    repeat: -1,
  });

  scene.anims.create({
    key: "down",
    frames: scene.anims.generateFrameNumbers("dude", { start: 4, end: 4 }),
    frameRate: 10,
    repeat: -1,
  });

  scene.anims.create({
    key: "right",
    frames: scene.anims.generateFrameNumbers("dude", { start: 5, end: 8 }),
    frameRate: 10,
    repeat: -1,
  });

  scene.anims.create({
    key: "turn",
    frames: [{ key: "dude", frame: 4 }],
    frameRate: 20,
  });
}

function setupCollisions(scene) {
  if (!scene.player) {
    console.error("Player not found when setting up collisions");
    return;
  }

  const sprite = scene.player.sprite || scene.player;
  scene.physics.add.collider(sprite, scene.walls);
  scene.physics.add.collider(sprite, scene.tablechair);
  scene.physics.add.collider(sprite, scene.workArea);
  scene.physics.add.collider(sprite, scene.loungeArea);
  scene.physics.add.collider(sprite, scene.plants);
}

export function handlePlayerMovement(scene) {
  if (!scene.player || !scene.cursors) return;
  
  const sprite = scene.player.sprite || scene.player;

  if (scene.cursors.left.isDown) {
    sprite.setVelocityX(-160);
    sprite.setVelocityY(0);
    sprite.anims.play("left", true);
    scene.player.direction = 'left';
  }
  else if (scene.cursors.right.isDown) {
    sprite.setVelocityX(160);
    sprite.setVelocityY(0);
    sprite.anims.play("right", true);
    scene.player.direction = 'right';
  }
  else if (scene.cursors.up.isDown) {
    sprite.setVelocityX(0);
    sprite.setVelocityY(-160);
    sprite.anims.play("up", true);
    scene.player.direction = 'up';
  }
  else if (scene.cursors.down.isDown) {
    sprite.setVelocityX(0);
    sprite.setVelocityY(160);
    sprite.anims.play("down", true);
    scene.player.direction = 'down';
  }
  else {
    sprite.setVelocityX(0);
    sprite.setVelocityY(0);
    sprite.anims.play("turn");
  }

  // update nameText 
  if (scene.player.nameText) {
    scene.player.nameText.setPosition(sprite.x, sprite.y - 30);
  }
}

export function setupPlayerControls(scene) {
  // Create animations (only needed once)
  createAnimations(scene);
  
  // Setup input controls
  scene.cursors = scene.input.keyboard.createCursorKeys();
}

export function addPlayer(scene, id, name, x, y) {
  if (scene.players.has(id)) return;

  const sprite = setupPlayer(scene);
  sprite.setPosition(x, y);

  const nameText = scene.add.text(x, y - 30, name, {
    fontSize: '12px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 4, y: 2 },
    borderRadius: 3
  }).setOrigin(0.5, 1);

  const player = {
    id,
    name,
    x: x,
    y: y,
    direction: 'down',
    sprite,
    nameText
  };

  scene.players.set(id, player);
  const isMe = scene.players.size === 1;

  if (isMe) {
    scene.player = player;
    
    setupCollisions(scene);
    
    console.log(`My player created at position: (${x}, ${y})`);
  }

  console.log(`Player ${name} added at position: (${x}, ${y})`);
}