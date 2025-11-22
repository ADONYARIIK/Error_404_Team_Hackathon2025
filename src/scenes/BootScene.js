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

            this.registry.set('playerHealth', 100);
            this.registry.set('playerMaxHealth', 100);
            this.registry.set('playerSpeed', 3);
            this.registry.set('enemySpeed', 0.8);
            this.registry.set('kitHeal', 25);
            this.registry.set('playerDamage', 20);
            this.registry.set('enemyDamage', 10);
            this.registry.set('enemyHealth', 30);
            this.registry.set('scores', 0);
            this.registry.set('fogRemovers', 0);
            this.registry.set('level', 1);

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

        this.load.audio('theme', './src/assets/audio/music/Embient.mp3')

        this.load.tilemapTiledJSON('level1', './src/assets/maps/level1.json');
        this.load.image('tiles', './src/assets/maps/tilesets/tiles.png');
    }
}