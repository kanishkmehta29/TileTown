export class Start extends Phaser.Scene {
  constructor() {
    super("Start");
  }

  preload() {
    this.load.image("background", "assets/background.jpg");
    this.load.image("door", "assets/door.png");
    this.load.image("table", "assets/table.png");
    this.load.image("chair", "assets/chair.png");
    this.load.image("work_table", "assets/work_table.png");
    this.load.image("work_chair", "assets/work_chair.png");
    this.load.image("black_sofa", "assets/black_sofa.png");
    this.load.image("white_sofa", "assets/white_sofa.png");
    this.load.image("round_table", "assets/round_table.png");
    this.load.image("plant1", "assets/plant1.png");
    this.load.image("plant2", "assets/plant2.png");
    this.load.image("vertical_wall", "assets/walls/vertical_wall.png");
    this.load.image("horizontal_wall", "assets/walls/horizontal_wall.png");

    this.load.spritesheet("dude", "assets/dude.png", {
      frameWidth: 32,
      frameHeight: 48,
    });
  }

  create() {
    // Helper function to create scaled sprites with matching physics bodies
    const createScaledSprite = (group, x, y, texture, scale = 0.2, rotation = 0) => {
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

    this.add
      .image(400, 300, "background")
      .setDisplaySize(this.cameras.main.width, this.cameras.main.height);
    this.walls = this.physics.add.staticGroup();

    // meeting room wall
    createScaledSprite(this.walls, 375, 35, "vertical_wall", 0.2);
    createScaledSprite(this.walls, 375, 105, "vertical_wall", 0.2);
    createScaledSprite(this.walls, 375, 175, "vertical_wall", 0.2);
    createScaledSprite(this.walls, 375, 245, "vertical_wall", 0.2);
    createScaledSprite(this.walls, 375, 315, "vertical_wall", 0.2);

    createScaledSprite(this.walls, 35, 350, "horizontal_wall", 0.2);
    createScaledSprite(this.walls, 105, 350, "horizontal_wall", 0.2);

    this.add.image(157, 342, "door").setScale(0.7);

    createScaledSprite(this.walls, 210, 350, "horizontal_wall", 0.2);
    createScaledSprite(this.walls, 280, 350, "horizontal_wall", 0.2);
    createScaledSprite(this.walls, 350, 350, "horizontal_wall", 0.2);

    // meeting room furniture
    this.tablechair = this.physics.add.staticGroup();
    createScaledSprite(this.tablechair, 175, 175, "table", 0.2);

    createScaledSprite(this.tablechair, 125, 110, "chair", 0.2);
    createScaledSprite(this.tablechair, 175, 110, "chair", 0.2);
    createScaledSprite(this.tablechair, 225, 110, "chair", 0.2);

    createScaledSprite(this.tablechair, 125, 240, "chair", 0.2, Math.PI);
    createScaledSprite(this.tablechair, 175, 240, "chair", 0.2, Math.PI);
    createScaledSprite(this.tablechair, 225, 240, "chair", 0.2, Math.PI);

    createScaledSprite(this.tablechair, 70, 175, "chair", 0.2, (3 * Math.PI) / 2);
    createScaledSprite(this.tablechair, 280, 175, "chair", 0.2, Math.PI / 2);

    // Work area outside meeting room
    this.workArea = this.physics.add.staticGroup();

    createScaledSprite(this.workArea, 600, 140, "work_table", 0.2);
    createScaledSprite(this.workArea, 750, 140, "work_table", 0.2);
    createScaledSprite(this.workArea, 875, 370, "work_table", 0.2, Math.PI / 2);
    createScaledSprite(this.workArea, 875, 520, "work_table", 0.2, Math.PI / 2);

    createScaledSprite(this.workArea, 565, 85, "work_chair", 0.2);
    createScaledSprite(this.workArea, 635, 85, "work_chair", 0.2);
    createScaledSprite(this.workArea, 715, 85, "work_chair", 0.2);
    createScaledSprite(this.workArea, 785, 85, "work_chair", 0.2);

    createScaledSprite(this.workArea, 930, 335, "work_chair", 0.2, Math.PI / 2);
    createScaledSprite(this.workArea, 930, 405, "work_chair", 0.2, Math.PI / 2);
    createScaledSprite(this.workArea, 930, 485, "work_chair", 0.2, Math.PI / 2);
    createScaledSprite(this.workArea, 930, 555, "work_chair", 0.2, Math.PI / 2);

    // Lounge area
    this.loungeArea = this.physics.add.staticGroup();

    createScaledSprite(this.loungeArea, 695, 480, "black_sofa", 0.25, Math.PI / 2);
    createScaledSprite(this.loungeArea, 505, 480, "white_sofa", 0.25, (3 * Math.PI) / 2);
    createScaledSprite(this.loungeArea, 600, 480, "round_table", 0.2, Math.PI / 2);

    // Plants for decoration
    this.plants = this.physics.add.staticGroup();
    createScaledSprite(this.plants, 440, 50, "plant1", 0.2);
    createScaledSprite(this.plants, 990, 50, "plant2", 0.2);
    createScaledSprite(this.plants, 990, 610, "plant1", 0.2);
    createScaledSprite(this.plants, 50, 610, "plant2", 0.2);

    //character
    this.player = this.physics.add.sprite(100, 450, "dude");
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);
    this.player.setSize(20, 30);
    this.player.setOffset(6, 9);

    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "up",
      frames: this.anims.generateFrameNumbers("dude", { start: 4, end: 4 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "down",
      frames: this.anims.generateFrameNumbers("dude", { start: 4, end: 4 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "turn",
      frames: [{ key: "dude", frame: 4 }],
      frameRate: 20,
    });

    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers("dude", { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1,
    });

    this.cursors = this.input.keyboard.createCursorKeys();

    // Add colliders
    this.physics.add.collider(this.player, this.walls);
    this.physics.add.collider(this.player, this.tablechair);
    this.physics.add.collider(this.player, this.workArea);
    this.physics.add.collider(this.player, this.loungeArea);
    this.physics.add.collider(this.player, this.plants);

    // Enable physics debug to see collision bodies (remove this line when done debugging)
    //this.physics.world.createDebugGraphic();
}

  update() {
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
      this.player.setVelocityY(0);
      this.player.anims.play("left", true);
    } 
    else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
      this.player.setVelocityY(0);
      this.player.anims.play("right", true);
    } 
    else if (this.cursors.up.isDown) {
      this.player.setVelocityX(0);
      this.player.setVelocityY(-160); // Changed from setVelocityX to setVelocityY
      this.player.anims.play("up", true);
    } 
    else if (this.cursors.down.isDown) {
      this.player.setVelocityX(0);
      this.player.setVelocityY(160); // Changed from setVelocityX to setVelocityY
      this.player.anims.play("down", true);
    } 
    else {
      this.player.setVelocityX(0);
      this.player.setVelocityY(0); // Stop both X and Y movement
      this.player.anims.play("turn");
    }
}
}
