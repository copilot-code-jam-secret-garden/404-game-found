import { Scene, GameObjects, Input } from 'phaser';

export class MainMenu extends Scene
{
    background: GameObjects.Image;
    title: GameObjects.Text;
    player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

    // Properties for player movement
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    private playerSpeed: number = 200;
    private playerFacingLeft: boolean = false;

    // Properties for jump mechanics
    private jumpVelocity: number = -400;
    private isJumping: boolean = false;
    private canJump: boolean = false;
    
    // Property for attack mechanics
    private isAttacking: boolean = false;
    private attackKey: Phaser.Input.Keyboard.Key;
    private attackRange: number = 60; // Range of the attack in pixels

    // Ground properties
    private groundTiles: Phaser.GameObjects.Group;
    private flowerPots: Phaser.GameObjects.Group; // New group to track flower pots
    private tileSize: number = 64; // Size of the tile sprite

    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        // Get the screen dimensions
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Add the back.png as background first so it's behind everything
        // Use displayWidth and displayHeight to stretch it to fill the screen
        const backgroundImage = this.add.image(width / 2, height / 2, 'back');
        backgroundImage.setOrigin(0.5);
        backgroundImage.displayWidth = width;
        backgroundImage.displayHeight = height;

        // Display middle.png stretched over the background with some transparency
        const middleImage = this.add.image(width / 2, height / 2, 'background');
        middleImage.setOrigin(0.5);
        middleImage.displayWidth = width;
        middleImage.displayHeight = height;

        // Create the ground tiles
        this.createGround(width, height);

        // Add player as a sprite with physics - positioned above the ground
        this.player = this.physics.add.sprite(width / 2, height - this.tileSize - 50, 'player-walk', 0);
        this.player.setOrigin(0.5);
        // Scale the player down to 1/5 of the original scale
        this.player.setScale(0.16);

        // Set player collision with world bounds
        this.player.setCollideWorldBounds(true);

        // Add instruction text
        const infoText = this.add.text(width / 2, 600, 'Use Arrow Keys to Move, Space to Jump, A to Attack', {
            fontFamily: 'Arial', fontSize: 24, color: '#ffffff',
            stroke: '#000000', strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5);

        // Make the text pulse to draw attention
        this.tweens.add({
            targets: infoText,
            alpha: 0.5,
            duration: 800,
            yoyo: true,
            repeat: -1
        });

        // Initialize cursor keys for player control
        this.cursors = this.input.keyboard.createCursorKeys();

        // Initialize attack key
        this.attackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);

        // Set the idle animation for the player at start
        this.player.play('idle');

        // Enable collision between player and ground tiles
        this.physics.add.collider(this.player, this.groundTiles);

        // Enable gravity for the player
        this.player.body.setGravityY(800);
    }

    /**
     * Creates a ground made of a single row of tile sprites
     * @param width The width of the screen
     * @param height The height of the screen
     */
    private createGround(width: number, height: number): void {
        // Create a group to hold all our ground tiles
        this.groundTiles = this.add.group();

        // Create a group to hold all flower pots
        this.flowerPots = this.add.group();

        // Calculate how many tiles we need to cover the width of the screen
        const tilesNeeded = Math.ceil(width / this.tileSize) + 1; // +1 to ensure full coverage

        // Position for the ground (bottom of the screen, leaving some margin)
        const groundY = height - this.tileSize;

        // Create single row of tiles for the ground
        for (let i = 0; i < tilesNeeded; i++) {
            // Calculate the x position for each tile
            const tileX = i * this.tileSize;

            // Alternate between the two tiles
            const tileFrame = i % 2; // 0 for the first tile, 1 for the second tile

            // Create the tile as a physics sprite
            const tile = this.physics.add.sprite(tileX, groundY, 'tiles', tileFrame);
            tile.setOrigin(0, 0); // Align to top-left for easy tiling
            tile.setDisplaySize(this.tileSize, this.tileSize); // Ensure consistent size

            // Make the tile static (doesn't move when collided with)
            tile.setImmovable(true);
            tile.body.setAllowGravity(false);

            // Adjust the collision body size
            tile.body.setSize(this.tileSize, this.tileSize / 2);
            tile.body.setOffset(0, 0);

            // Add the tile to our group
            this.groundTiles.add(tile);

            // Randomly place the flower pot on top of the tile
            if (Math.random() < 0.3) { // 30% chance to place a flower pot
                const flowerPot = this.add.image(tileX + this.tileSize / 2, groundY - 20, 'flower-pot-red');
                flowerPot.setOrigin(0.5, 1); // Align the bottom center of the flower pot to the tile
                flowerPot.setData('hasFlower', false); // Initialize flower pot data
                flowerPot.setDepth(10); // Set a higher depth for the pot so flowers will be behind it
                this.flowerPots.add(flowerPot); // Add flower pot to the group
            }
        }
    }

    update(time: number, delta: number) {
        if (!this.player) return;

        // Get screen boundaries
        const width = this.cameras.main.width;

        // Track if the player is moving horizontally
        let isMoving = false;

        // Don't process movement if the player is attacking
        if (!this.isAttacking) {
            // Handle horizontal movement with physics velocity
            if (this.cursors.left.isDown) {
                this.player.setVelocityX(-this.playerSpeed);
                if (!this.playerFacingLeft) {
                    // Flip the sprite to face left
                    this.player.setFlipX(true);
                    this.playerFacingLeft = true;
                }
                if (this.player.anims.currentAnim?.key !== 'walk-left' && this.canJump) {
                    this.player.play('walk-left');
                }
                isMoving = true;
            } else if (this.cursors.right.isDown) {
                this.player.setVelocityX(this.playerSpeed);
                if (this.playerFacingLeft) {
                    // Flip the sprite to face right
                    this.player.setFlipX(false);
                    this.playerFacingLeft = false;
                }
                if (this.player.anims.currentAnim?.key !== 'walk-right' && this.canJump) {
                    this.player.play('walk-right');
                }
                isMoving = true;
            } else {
                // Stop horizontal movement when no keys are pressed
                this.player.setVelocityX(0);
            }

            // Check if player is touching the ground
            const wasInAir = !this.canJump;
            this.canJump = this.player.body.touching.down;

            // Just landed
            if (wasInAir && this.canJump) {
                this.isJumping = false;
                if (!isMoving) {
                    this.player.play('idle');
                }
            }

            // Handle jumping with spacebar OR up arrow
            if ((this.cursors.up.isDown || this.cursors.space.isDown) && this.canJump && !this.isJumping) {
                this.player.setVelocityY(this.jumpVelocity);
                this.player.play('jump');
                this.isJumping = true;
            }

            // If in the air (jumping or falling), play jump animation if not already playing
            if (!this.canJump && !this.isJumping) {
                this.player.play('jump');
                this.isJumping = true;
            }

            // If not moving horizontally and on the ground, play idle animation
            if (!isMoving && this.canJump && !this.isJumping) {
                this.player.play('idle');
            }
        }

        // Handle attack action with the 'A' key
        if (Phaser.Input.Keyboard.JustDown(this.attackKey) && !this.isAttacking && this.canJump) {
            this.isAttacking = true;
            // Stop horizontal movement during attack
            this.player.setVelocityX(0);
            
            // Play the attack animation
            this.player.play('attack');
            
            // Detect flower pots within attack range
            this.flowerPots.getChildren().forEach((flowerPot: Phaser.GameObjects.Image) => {
                // Skip if this flower pot already has a flower
                if (flowerPot.getData('hasFlower')) {
                    return;
                }
                
                const distance = Phaser.Math.Distance.Between(
                    this.player.x, 
                    this.player.y, 
                    flowerPot.x, 
                    flowerPot.y
                );
                
                // Check if the flower pot is within attack range and on the correct side (based on player facing direction)
                const isOnCorrectSide = (this.playerFacingLeft && flowerPot.x < this.player.x) || 
                                       (!this.playerFacingLeft && flowerPot.x > this.player.x);
                
                if (distance <= this.attackRange && isOnCorrectSide) {
                    // Get the position of the flower pot
                    const potX = flowerPot.x;
                    const potY = flowerPot.y - 25; // Position flower above the pot
                    
                    // Mark this pot as having a flower so we don't add another one
                    flowerPot.setData('hasFlower', true);
                    
                    // Create the purple flower at the position above the pot
                    const flower = this.add.image(potX, potY, 'flower-purple');
                    flower.setOrigin(0.5, 0.5); // Same origin as flower pot
                    flower.setScale(0.5); // Scale for appropriate size
                    
                    // Add a growth animation effect
                    this.tweens.add({
                        targets: flower,
                        scaleX: { from: 0.1, to: 0.5 },
                        scaleY: { from: 0.1, to: 0.5 },
                        y: { from: potY + 10, to: potY }, // Slight upward movement as it grows
                        duration: 500,
                        ease: 'Back.easeOut'
                    });
                }
            });

            // Listen for animation completion to reset attack state
            this.player.once('animationcomplete', () => {
                this.isAttacking = false;
                // Return to idle if not moving
                if (this.canJump && !this.cursors.left.isDown && !this.cursors.right.isDown) {
                    this.player.play('idle');
                }
            });
        }

        // Keep player within horizontal screen boundaries
        if (this.player.x < 50) {
            this.player.x = 50;
            this.player.setVelocityX(0);
        } else if (this.player.x > width - 50) {
            this.player.x = width - 50;
            this.player.setVelocityX(0);
        }

        // Update the position of the player label to follow the player if it exists
        if (this.player.data && this.player.data.get('label')) {
            const label = this.player.data.get('label');
            label.setPosition(this.player.x, this.player.y + 70);
        }
    }
}