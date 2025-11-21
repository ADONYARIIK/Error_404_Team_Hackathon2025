import Phaser from 'phaser';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    preload() {

    }

    create() {
        // this.scene.launch('UIScene');
        // const level1 = this.make.tilemap({ key: 'level1' });

        // this.cameras.main.setBounds(0, 0, level1.widthInPixels, level1.heightInPixels);
    }
}