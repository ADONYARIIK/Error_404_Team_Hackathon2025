import Phaser from 'phaser';

export default class UIScene extends Phaser.Scene {
    constructor() {
        super('UIScene');
    }

    preload() {

    }

    create() {
        this.add.image(50,0,'gui','healthBar.png').setOrigin(0).setScale(3);
        const healthBar = this.add.rectangle(105,48,55,10,0x5F1818,)

        const game = this.add.image(0,0,'gui','gameName.png').setOrigin(0).setScale(0.5).setInteractive({useHandCursor: true});

        game.on('pointerdown', ()=>{
            healthBar.width -= 10;
        })

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