export const createScaledSprite = (group, x, y, texture, scale = 0.2, rotation = 0) => {
    const sprite = group.create(x, y, texture);
    sprite.setScale(scale);
    sprite.setRotation(rotation);
    
    // For rotated sprites, we need to handle physics body differently
    if (rotation !== 0) {
        // For 90-degree rotations, swap width and height
        if (Math.abs(rotation) === Math.PI/2 || Math.abs(rotation) === 3*Math.PI/2) {
            sprite.body.setSize(sprite.height * scale, sprite.width * scale);
        } else {
            sprite.body.setSize(sprite.width * scale, sprite.height * scale);
        }
    } else {
        sprite.body.setSize(sprite.width * scale, sprite.height * scale);
    }
    
    // Center the physics body
    sprite.body.setOffset(
        (sprite.width - sprite.body.width) / 2,
        (sprite.height - sprite.body.height) / 2
    );
    
    return sprite;
};

export const createAnimations = (scene) => {
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
        key: "turn",
        frames: [{ key: "dude", frame: 4 }],
        frameRate: 20,
    });

    scene.anims.create({
        key: "right",
        frames: scene.anims.generateFrameNumbers("dude", { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1,
    });
};

export const createMeetingRoom = (scene, createScaledSprite) => {
    // Meeting room walls
    const wallPositions = [
        { x: 375, y: 35 }, { x: 375, y: 105 }, { x: 375, y: 175 },
        { x: 375, y: 245 }, { x: 375, y: 315 }
    ];
    wallPositions.forEach(pos => {
        createScaledSprite(scene.walls, pos.x, pos.y, "vertical_wall", 0.2);
    });

    const horizontalWalls = [
        { x: 35, y: 350 }, { x: 105, y: 350 }, { x: 210, y: 350 },
        { x: 280, y: 350 }, { x: 350, y: 350 }
    ];
    horizontalWalls.forEach(pos => {
        createScaledSprite(scene.walls, pos.x, pos.y, "horizontal_wall", 0.2);
    });

    // Door 
    scene.add.image(157, 342, "door").setScale(0.7);

    // Meeting room furniture
    createScaledSprite(scene.tablechair, 175, 175, "table", 0.2);

    const chairConfigs = [
        { x: 125, y: 110, rotation: 0 },
        { x: 175, y: 110, rotation: 0 },
        { x: 225, y: 110, rotation: 0 },
        { x: 125, y: 240, rotation: Math.PI },
        { x: 175, y: 240, rotation: Math.PI },
        { x: 225, y: 240, rotation: Math.PI },
        { x: 70, y: 175, rotation: (3 * Math.PI) / 2 },
        { x: 280, y: 175, rotation: Math.PI / 2 }
    ];
    chairConfigs.forEach(chair => {
        createScaledSprite(scene.tablechair, chair.x, chair.y, "chair", 0.2, chair.rotation);
    });
};

export const createWorkArea = (scene, createScaledSprite) => {
    // Work tables
    const workTables = [
        { x: 600, y: 140, rotation: 0 },
        { x: 750, y: 140, rotation: 0 },
        { x: 875, y: 370, rotation: Math.PI / 2 },
        { x: 875, y: 520, rotation: Math.PI / 2 }
    ];
    workTables.forEach(table => {
        createScaledSprite(scene.workArea, table.x, table.y, "work_table", 0.2, table.rotation);
    });

    // Work chairs
    const workChairs = [
        { x: 565, y: 85, rotation: 0 },
        { x: 635, y: 85, rotation: 0 },
        { x: 715, y: 85, rotation: 0 },
        { x: 785, y: 85, rotation: 0 },
        { x: 930, y: 335, rotation: Math.PI / 2 },
        { x: 930, y: 405, rotation: Math.PI / 2 },
        { x: 930, y: 485, rotation: Math.PI / 2 },
        { x: 930, y: 555, rotation: Math.PI / 2 }
    ];
    workChairs.forEach(chair => {
        createScaledSprite(scene.workArea, chair.x, chair.y, "work_chair", 0.2, chair.rotation);
    });
};

export const createLoungeArea = (scene, createScaledSprite) => {
    createScaledSprite(scene.loungeArea, 695, 480, "black_sofa", 0.25, Math.PI / 2);
    createScaledSprite(scene.loungeArea, 505, 480, "white_sofa", 0.25, (3 * Math.PI) / 2);
    createScaledSprite(scene.loungeArea, 600, 480, "round_table", 0.2, Math.PI / 2);
};

export const createPlants = (scene, createScaledSprite) => {
    const plantPositions = [
        { x: 440, y: 50, type: "plant1" },
        { x: 990, y: 50, type: "plant2" },
        { x: 990, y: 610, type: "plant1" },
        { x: 50, y: 610, type: "plant2" }
    ];
    plantPositions.forEach(plant => {
        createScaledSprite(scene.plants, plant.x, plant.y, plant.type, 0.2);
    });
};

export const setupPlayer = (scene) => {
    const player = scene.physics.add.sprite(100, 450, "dude");
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);
    player.setSize(20, 30);
    player.setOffset(6, 9);
    return player;
};

export const setupCollisions = (scene) => {
    scene.physics.add.collider(scene.player, scene.walls);
    scene.physics.add.collider(scene.player, scene.tablechair);
    scene.physics.add.collider(scene.player, scene.workArea);
    scene.physics.add.collider(scene.player, scene.loungeArea);
    scene.physics.add.collider(scene.player, scene.plants);
};

export const handlePlayerMovement = (scene) => {
    const { cursors, player } = scene;
    
    if (cursors.left.isDown) {
        player.setVelocityX(-160);
        player.setVelocityY(0);
        player.anims.play("left", true);
    } 
    else if (cursors.right.isDown) {
        player.setVelocityX(160);
        player.setVelocityY(0);
        player.anims.play("right", true);
    } 
    else if (cursors.up.isDown) {
        player.setVelocityX(0);
        player.setVelocityY(-160);
        player.anims.play("up", true);
    } 
    else if (cursors.down.isDown) {
        player.setVelocityX(0);
        player.setVelocityY(160);
        player.anims.play("down", true);
    } 
    else {
        player.setVelocityX(0);
        player.setVelocityY(0);
        player.anims.play("turn");
    }
};