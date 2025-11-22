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
        this.add.image(0, 0, 'gui', 'bg.png').setOrigin(0).setScale(0.71)

        this.add.image(330, -100, 'gui', 'gameName.png').setOrigin(0).setScale(0.5);


        this.clouds = [
            this.add.image(250, -100, 'gui', 'cloudBigSize.png').setOrigin(0)
                .setScale(0.4)
                .setAlpha(0.5),
            this.add.image(250, 0, 'gui', 'cloudBigSize.png').setOrigin(0)
                .setScale(0.4)
                .setAlpha(0.7),
            this.add.image(450, -100, 'gui', 'cloudBigSize.png').setOrigin(0)
                .setScale(0.4)
                .setAlpha(0.7),
            this.add.image(450, 0, 'gui', 'cloudBigSize.png').setOrigin(0)
                .setScale(0.4)
                .setAlpha(0.5),

        ];

        const authors = this.add.image(200, 520,'gui', 'icon_group.png').setScale(0.1)
            .setTintFill(0xffffff)
            .setInteractive({ useHandCursor: true });


        authors.on('pointerover', () => {
            this.scaleUpBtn(authors, 0.12)
        })

        authors.on('pointerout', () => {
            this.scaleDownBtn(authors, 0.1)
        })

        authors.on('pointerdown', () => {
            this.scene.start('AuthorsScene');
        });


        const button = [

            this.add.image(550, 440, 'gui', 'play.png').setOrigin(0.5)
                .setScale(5)
                .setInteractive({ useHandCursor: true }),
            this.add.image(550, 440, 'gui', 'play2.png').setOrigin(0.5)
                .setScale(5)
                .setInteractive({ useHandCursor: true }).setVisible(false)

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

        const settings = [

            this.add.image(550, 540, 'gui', 'settings.png').setOrigin(0.5)
                .setScale(5)
                .setInteractive({ useHandCursor: true }),
            this.add.image(550, 540, 'gui', 'settings2.png').setOrigin(0.5)
                .setScale(5)
                .setInteractive({ useHandCursor: true }).setVisible(false)

        ];

        settings.forEach((buttonchange) => {
            buttonchange.on('pointerover', () => {
                this.scaleUpBtn(buttonchange, 5.5)
            })
            buttonchange.on('pointerout', () => {
                this.scaleDownBtn(buttonchange, 5)
            })
            buttonchange.on('pointerdown', () => {
                settings[1].setVisible(true);

                this.scene.start('SettingsScene');

            });
        })


        const soundOn = this.add.image(1000, 520, 'gui', 'icon1.png').setScale(6).setInteractive({ useHandCursor: true });

        soundOn.on('pointerover', () => {
            this.scaleUpBtn(soundOn, 5.5);
        });

        soundOn.on('pointerout', () => {
            this.scaleDownBtn(soundOn, 6);
        });


        const soundOff = this.add.image(1000, 520, 'gui', 'icon3.png').setScale(6)
            .setVisible(false)
            .setInteractive({ useHandCursor: true });

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