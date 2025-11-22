import Phaser from 'phaser';
import { loadTiledEntities, loadTiledTriggerZones, loadTiledBariers } from '../utils/tiledLoader.js';
import { AnimationsLoader } from '../utils/animationsLoader.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.player = null;
        this.enemies = [];
        this.collectables = [];
        this.bariers = [];
        this.triggerZones = {};
        this.cursors = null;
        this.spaceKey = null;
        this.shiftKey = null;
        this.fogRemovers = 0;
    }

    create() {
        AnimationsLoader.createAllAnimations(this);

        const level1 = this.make.tilemap({ key: 'level1' });
        this.cameras.main.setBounds(0, 0, level1.widthInPixels, level1.heightInPixels);

        const tiles = level1.addTilesetImage('tiles', 'tiles');

        const backgroundLayer = level1.createLayer('Background', tiles, 0, 0);
        const wallsLayer = level1.createLayer('Walls', tiles, 0, 0);
        const decorLayer = level1.createLayer('Decor', tiles, 0, 0);

        const entities = loadTiledEntities(this, level1);
        this.bariers = loadTiledBariers(this, level1);
        this.triggerZones = loadTiledTriggerZones(this, level1);

        this.player = Object.values(entities).find(entity =>
            entity && entity.class === 'player'
        );

        this.enemies = Object.values(entities).filter(entity =>
            entity && entity.class === 'enemy'
        );

        this.collectables = Object.values(entities).filter(entity =>
            entity && entity.class === 'collect'
        );

        if (this.player) {
            this.cameras.main.startFollow(this.player);
            this.cameras.main.setZoom(2);
        }

        this.setupControls();

        this.setupEvents();
    }

    setupControls() {
        this.cursors = this.input.keyboard.createCursorKeys();

        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);

        this.wKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.sKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    }

    setupEvents() {
        this.events.on('itemCollected', (collectable) => {
            console.log('Item collected:', collectable.name);
            if (this.player) {
                this.player.addScore(10);
                this.updateUI();
            }
        });

        this.events.on('enemyDied', (enemy) => {
            console.log('Enemy died:', enemy.name);
            if (this.player) {
                this.player.addScore(50);
                this.updateUI();

                const index = this.enemies.indexOf(enemy);
                if (index > -1) {
                    this.enemies.splice(index, 1);
                }
            }
        });

        this.events.on('playerDied', () => {
            console.log('Player died!');
            this.showGameOver();
        });

        this.events.on('playerHealthChanged', (health) => {
            this.updateUI();
        });
    }

    update() {
        if (!this.player || !this.player.isAlive) return;

        this.handlePlayerMovement();

        this.handlePlayerAttacks();

        this.updateEnemies();

        this.checkCollectableCollisions();

        this.checkTriggerZones();

        this.checkEnemyCollisions();
    }

    handlePlayerMovement() {
        const moving = this.player.move(
            this.cursors.left.isDown || this.aKey.isDown,
            this.cursors.right.isDown || this.dKey.isDown,
            this.cursors.up.isDown || this.wKey.isDown,
            this.cursors.down.isDown || this.sKey.isDown
        );
    }

    handlePlayerAttacks() {
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            this.player.playShoot();
        } else if (Phaser.Input.Keyboard.JustDown(this.shiftKey)) {
            this.player.playStab();
        }
    }

    updateEnemies() {
        this.enemies.forEach(enemy => {
            if (enemy.isAlive && this.player.isAlive) {
                enemy.update(this.player);
            }
        });
    }

    checkCollectableCollisions() {
        const collectRadius = 20;

        for (let i = this.collectables.length - 1; i >= 0; i--) {
            const collectable = this.collectables[i];
            if (!collectable) continue;

            const distance = Phaser.Math.Distance.Between(
                this.player.x, this.player.y,
                collectable.x, collectable.y
            );

            if (distance < collectRadius) {
                this.handleCollectable(collectable);
                collectable.destroy();
                this.collectables.splice(i, 1);
            }
        }
    }

    handleCollectable(collectable) {
        const collectType = collectable.collectType;

        switch (collectType) {
            case 'health':
                if (this.player) {
                    const oldHealth = this.player.health;
                    this.player.heal(collectable.value);
                    const healthGained = this.player.health - oldHealth;
                    this.events.emit('itemCollected', collectable);
                    this.showMessage(`+${healthGained} здоровья!`);
                }
                break;

            case 'fog_remover':
                this.fogRemovers++;
                this.events.emit('itemCollected', collectable);
                this.showMessage('Предмет для рассеивания тумана! Используйте F для удаления тумана');
                break;

            case 'exit':
                this.events.emit('itemCollected', collectable);
                this.showMessage('Выход найден! Уровень пройден!');
                break;

            default:
                this.events.emit('itemCollected', collectable);
                if (this.player) {
                    this.player.addScore(10);
                }
                break;
        }

        this.updateUI();
    }

    checkTriggerZones() {
        Object.values(this.triggerZones).forEach(zone => {
            if (!zone.getData) return;

            const polygon = zone.getData('polygon');
            const entered = zone.getData('entered');
            const properties = zone.getData('properties');

            if (Phaser.Geom.Polygon.ContainsPoint(polygon, this.player.x, this.player.y)) {
                if (!entered) {
                    zone.setData('entered', true);
                    this.onZoneEnter(zone);
                }

                if (this.scene.time.now > (this.lastFogDamage || 0)) {
                    this.applyFogDamage(5);
                    this.lastFogDamage = this.scene.time.now + 1000;
                }
            } else if (entered) {
                zone.setData('entered', false);
                this.onZoneExit(zone);
            }
        });
    }

    checkEnemyCollisions() {
        const enemyRadius = 30;

        this.enemies.forEach(enemy => {
            if (!enemy.isAlive || !this.player.isAlive) return;

            const distance = Phaser.Math.Distance.Between(
                this.player.x, this.player.y,
                enemy.x, enemy.y
            );

            if (distance < enemyRadius && enemy.currentAction !== 'attack') {
                enemy.attack(this.player);
            }
        });
    }

    onZoneEnter(zone) {
        const properties = zone.getData('properties');
        console.log('Entered fog zone:', zone.getData('name'));

        this.player.speed *= 0.5;

        this.showMessage('Вы в тумане! Замедление и получение урона');
    }

    onZoneExit(zone) {
        console.log('Exited fog zone:', zone.getData('name'));

        this.player.speed *= 2;
    }

    applyFogDamage(damage) {
        if (this.player && this.player.isAlive) {
            this.player.takeDamage(damage);
            this.updateUI();
        }
    }

    updateUI() {
        if (this.player) {
            this.events.emit('updateUI', {
                health: this.player.health,
                maxHealth: this.player.maxHealth,
                score: this.player.score,
                fogRemovers: this.fogRemovers
            });
        }
    }

    showMessage(text) {
        if (this.currentMessage) {
            this.currentMessage.destroy();
        }

        const message = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY - 100,
            text,
            {
                fontSize: '16px',
                fill: '#ffffff',
                backgroundColor: '#000000',
                padding: { x: 10, y: 5 }
            }
        );
        message.setOrigin(0.5);
        this.currentMessage = message;

        this.time.delayedCall(3000, () => {
            if (this.currentMessage === message) {
                message.destroy();
                this.currentMessage = null;
            }
        });
    }

    showGameOver() {
        const gameOverText = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            'GAME OVER\n\nScore: ' + (this.player ? this.player.score : 0) + '\n\nClick to restart',
            {
                fontSize: '32px',
                fill: '#ff0000',
                align: 'center'
            }
        );
        gameOverText.setOrigin(0.5);

        this.input.once('pointerdown', () => {
            this.scene.restart();
        });
    }
}