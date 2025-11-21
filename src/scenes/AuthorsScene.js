import Phaser from 'phaser';

export default class AuthorsScene extends Phaser.Scene {
    constructor() {
        super('AuthorsScene');
    }

    create() {
        this.add.image(0, 0, 'gui', 'bg.png').setOrigin(0).setScale(0.71);

        const exit = this.add.image(20, 10, 'gui', "icon13.png").setOrigin(0)
            .setScale(3.5)
            .setInteractive({ useHandCursor: true });


        exit.on('pointerdown', () => {
            this.scene.start('MainMenuScene');
        })

        exit.on('pointerover', () => {
            this.scaleUpBtn(exit, 4);
        });
        exit.on('pointerout', () => {
            this.scaleDownBtn(exit, 3.5);
        });

        this.add.image(350, 50, 'gui', 'menu.png').setOrigin(0).setScale(7);    

        this.add.text(500, 60, `AUTHORS`, { fontFamily: '"Jacquard 12"', fontSize: '32px', fill: '#ffffffff' });
        this.add.text(480, 250, `Tymofii Sova 2A`, { fontFamily: '"Jacquard 12"', fontSize: '32px', fill: '#ffffffff' });
        this.add.text(460, 350, `Jaroslav Tyrchenko 2A`, { fontFamily: '"Jacquard 12"', fontSize: '32px', fill: '#ffffffff' });
        this.add.text(450, 150, `Viktoriia Babynina 2B `, { fontFamily: '"Jacquard 12"', fontSize: '32px', fill: '#ffffffff' });
        this.add.text(500, 450, `Ilona Sitar 2B`, { fontFamily: '"Jacquard 12"', fontSize: '32px', fill: '#ffffffff' });

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