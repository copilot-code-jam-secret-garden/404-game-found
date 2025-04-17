import { Scene } from 'phaser';

export class Preloader extends Scene
{
    constructor ()
    {
        super('Preloader');
    }

    init ()
    {
        //  We loaded this image in our Boot Scene, so we can display it here
        this.add.image(512, 384, 'background');

        //  A simple progress bar. This is the outline of the bar.
        this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

        //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        const bar = this.add.rectangle(512-230, 384, 4, 28, 0xffffff);

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on('progress', (progress: number) => {

            //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
            bar.width = 4 + (460 * progress);

        });
    }

    preload ()
    {
        //  Load the assets for the game
        this.load.setPath('assets');

        // We already know 'background' is loaded in the Boot scene as 'middle.png'
        // Load the other required images
        this.load.image('back', 'back.png');

        // Load tiles as a spritesheet while ignoring the 16-pixel void
        this.load.spritesheet('tiles', 'tiles.png', {
            frameWidth: 64, // Actual tile width without the void
            frameHeight: 69, // Actual tile height without the void
            margin: 16, // Ignore the 16-pixel void at the beginning
            spacing: 16 // Ignore the 16-pixel void in the middle and end
        });

        // Load the player walking spritesheet
        this.load.spritesheet('player-walk', 'Walk.png', {
            frameWidth: 512,
            frameHeight: 512
        });

        // Load the player jumping spritesheet
        this.load.spritesheet('player-jump', 'Jump.png', {
            frameWidth: 512,
            frameHeight: 512
        });
        
        // Load the player attack spritesheet
        this.load.spritesheet('player-attack', 'Attack.png', {
            frameWidth: 512,
            frameHeight: 512
        });

        // Load the empty flower pot image
        this.load.image('flower-pot-red', 'EmptyFlowerPots/FlowerPot2RED.png');
        
        // Load the purple flower image
        this.load.image('flower-purple', 'Flower 2/Flower 2 - PURPLE.png');
    }

    create ()
    {
        // Create animations for the player
        this.anims.create({
            key: 'walk-right',
            frames: this.anims.generateFrameNumbers('player-walk', { start: 0, end: 4 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'walk-left',
            frames: this.anims.generateFrameNumbers('player-walk', { start: 0, end: 4 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'idle',
            frames: [{ key: 'player-walk', frame: 0 }],
            frameRate: 10
        });

        // Create jump animation
        this.anims.create({
            key: 'jump',
            frames: this.anims.generateFrameNumbers('player-jump', { start: 0, end: 11 }),
            frameRate: 10, // Increased from 10 to 20 for faster animation
            repeat: 0 // Don't repeat the jump animation
        });
        
        // Create attack animation
        this.anims.create({
            key: 'attack',
            frames: this.anims.generateFrameNumbers('player-attack', { start: 0, end: 4 }),
            frameRate: 15, // Slightly faster than walking to make attacks feel impactful
            repeat: 0 // Play once and stop
        });

        // Example of randomly alternating tiles
        const tileWidth = 64;
        const tileHeight = 69;
        const numTiles = 10; // Number of tiles to display in a row
        const startX = 100; // Starting X position
        const startY = 300; // Starting Y position
        const potScale = 2.5; // Scale factor for the flower pots

        for (let i = 0; i < numTiles; i++) {
            const tileKey = Math.random() < 0.5 ? 0 : 1; // Randomly choose between tile 0 and tile 1
            const tile = this.add.image(startX + i * tileWidth, startY, 'tiles', tileKey);

            // Randomly place a flower pot on top of some tiles
            if (Math.random() < 0.3) { // 30% chance to place a flower pot
                const flowerPot = this.add.image(tile.x, tile.y - tileHeight / 2, 'flower-pot-red');
                flowerPot.setOrigin(0.5, 1); // Align the bottom center of the flower pot to the tile
                flowerPot.setScale(potScale); // Dynamically scale the flower pot
            }
        }

        // After preloading assets, go to the MainMenu scene
        this.scene.start('MainMenu');
    }
}
