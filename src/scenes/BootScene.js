import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        this.load.image('logo', './src/assets/logo.png');
    }

    create() {
        const { width, height } = this.scale;
        const logo = this.add.image(width / 2, height / 2, 'logo').setScale(0.8);

        this.loadAssets();

        this.load.on('complete', () => {
            logo.destroy();

            if (!this.registry.get('music')) {
                const music = this.sound.add('theme', { loop: true, volume: 0.5 });
                music.play();
                this.registry.set('music', music);
            }


            this.scene.start('MainMenuScene');
        })

        this.load.start();
    }

    loadAssets() {
        this.load.atlas('gui', './src/assets/atlas/gui_spritesheet.png', './src/assets/atlas/gui_spritesheet.json');
        this.load.atlas('sprites', './src/assets/atlas/spritesheet.png', './src/assets/atlas/spritesheet.json');

        WebFont.load({
            google: { families: ['Jacquard 12'] }
        });

        this.load.audio('theme', './src/assets/audio/music/Embient.mp3');

        this.load.image('bg', './src/assets/newSprites/bg.png');
        this.load.image('gameName', './src/assets/newSprites/gameName.png');
        this.load.image('cloud', './src/assets/newSprites/cloud.png');
        this.load.image('cloudBigSize', './src/assets/newSprites/cloudBigSize.png');
        this.load.image('icon1', './src/assets/sprites/gui/icon1.png');
        this.load.image('icon2', './src/assets/sprites/gui/icon2.png');
        this.load.image('icon3', './src/assets/sprites/gui/icon3.png');
        this.load.image('icon4', './src/assets/sprites/gui/icon4.png');
    }
}