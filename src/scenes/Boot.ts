import { Scene } from 'phaser';

export class Boot extends Scene
{
    constructor ()
    {
        super('Boot');
    }

    preload ()
    {
        // Set the base path for all assets loaded in this scene
        this.load.setPath('assets');
        
        // The Boot Scene is typically used to load in any assets you require for your Preloader
        this.load.image('background', 'middle.png');
    }

    create ()
    {
        this.scene.start('Preloader');
    }
}
