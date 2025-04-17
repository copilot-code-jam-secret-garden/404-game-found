import { Scene } from 'phaser';

export class GameScene extends Scene
{
    constructor ()
    {
        super('GameScene');
    }

    create ()
    {
        // Add game background
        this.add.image(512, 384, 'background');

        // Display the logo 
        const logo = this.add.image(512, 200, 'logo');
        logo.setScale(0.5);

        // Add text to show we're in the GameScene
        this.add.text(512, 100, 'Game Scene', {
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        // Add instruction text
        this.add.text(512, 384, 'Some assets are missing!', {
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        this.add.text(512, 550, 'Click anywhere to go to Game Over', {
            fontSize: '18px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Handle click to go to GameOver scene
        this.input.once('pointerdown', () => {
            this.scene.start('GameOver');
        });
    }
}
