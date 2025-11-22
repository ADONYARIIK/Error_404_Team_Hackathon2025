import Phaser from 'phaser';

export default class UIScene extends Phaser.Scene {
    constructor() {
        super('UIScene');
    }

    preload() {

    }

    create() {
        this.add.image(0,0,'gui','healthBar.png').setOrigin(0).setScale(3);

        let healthBar = this.registry.get('hp');

        this.add.rectangle(54,47,56,11,0x5F1818,)

        if(healthBar <= 0){
            this.scene.start('GameOverScene');
        }

        const initialScores = this.registry.get('scores') || 0;
        this.scoresText = this.add.text(980, -10, this.formatScores(initialScores), {
            fontFamily: '"Jacquard 12"',
            fontSize: '48px',
            fill: '#ffffff',
            align: 'right'
        }).setOrigin(0);
    }

    formatScores(scores) {
        const scoreNum = parseInt(scores);
        return scoreNum.toString().padStart(8, '0');
    }
}