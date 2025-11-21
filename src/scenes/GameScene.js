import Phaser from 'phaser';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    preload() {

    }

    create() {
        this.scene.launch('UIScene');
        const level1 = this.make.tilemap({ key: 'level1' });

        this.cameras.main.setBounds(0, 0, level1.widthInPixels, level1.heightInPixels);

        const tiles = level1.addTilesetImage('tiles', 'tiles');

        const backgroundLayer = level1.createLayer('Background', tiles, 0, 0);
        const wallsLayer = level1.createLayer('Walls', tiles, 0, 0);
        const decorLayer = level1.createLayer('Decor', tiles, 0, 0);

        const entities = loadTiledObjects(this, level1);
        const triggers = loadTiledTriggerZones(this, level1);
    }
}