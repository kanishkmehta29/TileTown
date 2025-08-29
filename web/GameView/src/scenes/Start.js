import { handlePlayerMovement } from '../utils/helper.js';
import { 
    createScaledSprite, 
    createAnimations, 
    createMeetingRoom, 
    createWorkArea, 
    createLoungeArea, 
    createPlants, 
    setupPlayer, 
    setupCollisions 
} from '../utils/helper.js';

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
        this.physics.world.setBounds(0, 0, 1024, 650);

        // Setup background
        this.add.image(512, 325, "background").setDisplaySize(1024, 650);

        // Initialize physics groups
        this.walls = this.physics.add.staticGroup();
        this.tablechair = this.physics.add.staticGroup();
        this.workArea = this.physics.add.staticGroup();
        this.loungeArea = this.physics.add.staticGroup();
        this.plants = this.physics.add.staticGroup();

        // Create game areas
        createMeetingRoom(this, createScaledSprite);
        createWorkArea(this, createScaledSprite);
        createLoungeArea(this, createScaledSprite);
        createPlants(this, createScaledSprite);

        // Setup player
        this.player = setupPlayer(this);

        // Create animations
        createAnimations(this);

        // Setup input
        this.cursors = this.input.keyboard.createCursorKeys();

        // Setup collisions
        setupCollisions(this);

    }

    update() {
        handlePlayerMovement(this);
    }
}