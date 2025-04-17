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
        
        // Load tiles as a spritesheet with 2 frames at 88x76 size
        this.load.spritesheet('tiles', 'tiles.png', {
            frameWidth: 88,
            frameHeight: 76
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

        // After preloading assets, go to the MainMenu scene instead of directly to GameScene
        this.scene.start('MainMenu');
    }
}
