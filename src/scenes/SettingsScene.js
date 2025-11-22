import Phaser from 'phaser';

export default class SettingsScene extends Phaser.Scene {
    constructor() {
        super('SettingsScene');

    }
     preload() {
        this.music = this.registry.get('music');
    }

    create() {
        this.add.image(350, 50, 'gui', 'menu.png').setOrigin(0).setScale(7);


        const home = this.add.image(450,320,'gui','icon11.png').setOrigin(0.5)
            .setScale(6)
            .setInteractive({useHandCursor: true});
        
        home.on('pointerover', () => {
            this.scaleUpBtn(home, 6.5);
        });

        home.on('pointerout', () => {
            this.scaleDownBtn(home, 6);
        });

        home.on('pointerdown', ()=>{
            this.scene.start('MainMenuScene');
        })



        const soundOn = this.add.image(580, 320, 'gui', 'icon1.png').setScale(6).setInteractive({ useHandCursor: true });

        soundOn.on('pointerover', () => {
            this.scaleUpBtn(soundOn, 6.5);
        });

        soundOn.on('pointerout', () => {
            this.scaleDownBtn(soundOn, 6);
        });


        const soundOff = this.add.image(580, 320, 'gui', 'icon3.png').setScale(6)
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



        const play = this.add.image(700,320,'gui','icon9.png').setOrigin(0.5)
            .setScale(6)
            .setInteractive({useHandCursor: true});
        
        play.on('pointerover', () => {
            this.scaleUpBtn(play, 6.5);
        });

        play.on('pointerout', () => {
            this.scaleDownBtn(play, 6);
        });

        play.on('pointerdown', ()=>{
            this.scene.stop('SettingsScene');
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