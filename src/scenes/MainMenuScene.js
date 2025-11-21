import Phaser from 'phaser';

export default class MainMenuScene extends Phaser.Scene {
    constructor() {
        super('MainMenuScene');

        this.clouds = [];

    }

    preload() {
         this.music = this.registry.get('music');
    }

    create() {
        this.add.image(0, 0, 'gui', 'bg.png').setOrigin(0);
        this.add.image(550, 0, 'gui', 'gameName.png').setOrigin(0).setScale(0.5);
        this.clouds = [
            this.add.image(500, 0, 'gui', 'cloudBigSize.png').setOrigin(0).setScale(0.4).setInteractive({ useHandCursor: true }).setAlpha(1),
            this.add.image(500, 100, 'gui', 'cloudBigSize.png').setOrigin(0).setScale(0.4).setInteractive({ useHandCursor: true }).setAlpha(1),
            this.add.image(650, 0, 'gui', 'cloudBigSize.png').setOrigin(0).setScale(0.4).setInteractive({ useHandCursor: true }).setAlpha(1),
            this.add.image(650, 100, 'gui', 'cloudBigSize.png').setOrigin(0).setScale(0.4).setInteractive({ useHandCursor: true }).setAlpha(1),

        ];

        const button = this.add.image(550, 700, 'gui', 'gameName.png').setOrigin(0).setScale(0.5).setInteractive({ useHandCursor: true });

        button.on('pointerdown', () => {
            this.outAnimation();
        })

        

    }


    outAnimation() {
        this.clouds.forEach((cloud, index) => {
            this.tweens.add({
                targets: cloud,
                alpha: 0,
                y: -200,
                duration: 400,
                ease: 'Power1',
                delay: index * 100
            })

        })
    }
}