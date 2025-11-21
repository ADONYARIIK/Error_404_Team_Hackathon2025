import Phaser from 'phaser';

export default class UIScene extends Phaser.Scene {
    constructor() {
        super('UIScene');
    }

    preload() {

    }

    create() {
        this.add.image(0, 0, 'gui', 'bg.png').setOrigin(0);
        this.add.image(50,0,'gui','healthBar.png').setOrigin(0).setScale(3);
        this.add.rectangle(105,48,55,10,0x5F1818,)
    }
}