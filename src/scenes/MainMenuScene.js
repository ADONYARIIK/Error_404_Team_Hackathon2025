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

        const button = [

            this.add.image(650, 700, 'gui', 'play.png').setOrigin(0).setScale(5).setInteractive({ useHandCursor: true }),
            this.add.image(650, 700, 'gui', 'play2.png').setOrigin(0).setScale(5).setInteractive({ useHandCursor: true }).setVisible(false)

        ];

        button.forEach((buttonchange) => {
            buttonchange.on('pointerover', () => {
                this.scaleUpBtn(buttonchange, 5.5)
            })
            buttonchange.on('pointerout', () => {
                this.scaleDownBtn(buttonchange, 5)
            })
            buttonchange.on('pointerdown', () => {
                button[1].setVisible(true);
                this.outAnimation();
                setTimeout(() => {
                    this.scene.start('GameScene');
                }, 1000)
            });
        })


        const soundOn = this.add.image(1200, 500, 'gui', 'icon1.png').setScale(6).setInteractive({ useHandCursor: true });
        soundOn.on('pointerover', () => {
            this.scaleUpBtn(soundOn, 5.5);
        });
        soundOn.on('pointerout', () => {
            this.scaleDownBtn(soundOn, 6);
        });


        const soundOff = this.add.image(1200, 500, 'gui', 'icon3.png').setScale(6).setVisible(false).setInteractive({ useHandCursor: true });
        soundOff.on('pointerover', () => {
            this.scaleUpBtn(soundOff, 5.5);
        });
        soundOff.on('pointerout', () => {
            this.scaleDownBtn(soundOff, 6);
        });


        soundOn.on('pointerdown', () => {
            soundOff.setVisible(true);
            this.music.stop();
            soundOff.on('pointerdown', () => {
                soundOff.setVisible(false);
                this.music.play();
            })
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

    scaleUpBtn(obj, scale) {
        this.tweens.add({
            targets: obj,
            scale: scale,
            duration: 150,
            ease: 'Power1'
        });
    }
    scaleDownBtn(obj, scale) {
        this.tweens.add({
            targets: obj,
            scale: scale,
            duration: 150,
            ease: 'Power2'
        });
    }
}