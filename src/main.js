import Phaser from 'phaser';
import BootScene from './scenes/BootScene';
import MainMenuScene from './scenes/MainMenuScene';
import GameScene from './scenes/GameScene';
import UIScene from './scenes/UIScene';
import AuthorsScene from './scenes/AuthorsScene';

const config = {
    type: Phaser.AUTO,
    width: 1120,
    height: 640,
    backgroundColor: '0xba6aa7',
    parent: 'game-container',
    scale: {
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [BootScene, MainMenuScene, GameScene, UIScene, AuthorsScene]
};

new Phaser.Game(config);