import Phaser from 'phaser';
import { loadTiledEntities, loadTiledTriggerZones, loadTiledBariers } from '../utils/tiledLoader.js';
import { AnimationsLoader } from '../utils/animationsLoader.js';
import { createEnemy, createCollectable } from '../utils/createHelper.js';

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
        this.fKey = null;
        this.wallsLayer = null;
        this.fogRemovers = 0;
        this.lastFogDamage = 0;
        this.currentMessage = null;
        this.fogSprites = [];
    }

    create() {
        AnimationsLoader.createAllAnimations(this);

        const level1 = this.make.tilemap({ key: 'level1' });
        this.cameras.main.setBounds(0, 0, level1.widthInPixels, level1.heightInPixels);

        const tiles = level1.addTilesetImage('tiles', 'tiles');

        const backgroundLayer = level1.createLayer('Background', tiles, 0, 0);
        this.wallsLayer = level1.createLayer('Walls', tiles, 0, 0);
        const decorLayer = level1.createLayer('Decor', tiles, 0, 0);

        // this.wallsLayer.setCollisionByExclusion([-1]);
        this.wallsLayer.setCollisionByProperty({ collides: true });
        // this.wallsLayer.setCollision([0, 2, 3, 4, 5, 8, 14, 15, 16, 17, 18, 19, 20, 22, 23, 24, 25, 28, 29, 30, 33, 34, 44, 45, 46, 48, 56, 57, 58, 59, 60, 62, 64, 72, 76, 78, 79, 86, 91, 92, 93, 98, 99, 100, 101, 102, 103, 104, 105, 106, 112, 113, 114, 115, 116, 117, 118, 119, 120, 132, 133, 134, 135, 136, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150]);

        const entities = loadTiledEntities(this, level1);
        this.bariers = loadTiledBariers(this, level1);
        this.triggerZones = loadTiledTriggerZones(this, level1);

        console.log('All loaded entities:', entities);

        this.player = Object.values(entities).find(entity =>
            entity && entity.class === 'player'
        );

        // Инициализация игрока с значениями из registry
        if (this.player) {
            this.player.health = this.registry.get('playerHealth') || 100;
            this.player.maxHealth = this.registry.get('playerMaxHealth') || 100;
            this.player.speed = this.registry.get('playerSpeed') || 3;
            this.player.score = this.registry.get('scores') || 0;
        }

        this.enemies = Object.values(entities).filter(entity =>
            entity && entity.class === 'enemy'
        );

        if (this.enemies.length === 0) {
            console.log('No enemies found by class, trying to find by type...');
            this.enemies = Object.values(entities).filter(entity =>
                entity && entity.type === 'enemy'
            );
        }

        // Инициализация врагов с значениями из registry
        this.enemies.forEach(enemy => {
            enemy.speed = this.registry.get('enemySpeed') || 0.8;
            enemy.attackDamage = this.registry.get('enemyDamage') || 10;
            enemy.health = this.registry.get('enemyHealth') || 30;
        });

        this.collectables = Object.values(entities).filter(entity =>
            entity && entity.class === 'collect'
        );

        if (this.player) {
            // Добавляем физическое тело для игрока
            this.physics.add.existing(this.player);
            this.player.body.setCollideWorldBounds(true);

            // Добавляем коллизию между игроком и стенами
            this.physics.add.collider(this.player, this.wallsLayer);

            this.cameras.main.startFollow(this.player);
            this.cameras.main.setZoom(2);
        }

        // Добавляем физические тела и коллизии для врагов
        this.enemies.forEach(enemy => {
            this.physics.add.existing(enemy);
            this.physics.add.collider(enemy, this.wallsLayer);
            this.physics.add.collider(enemy, this.player, this.handleEnemyPlayerCollision, null, this);
        });

        // Добавляем коллизии для коллектируемых предметов
        this.collectables.forEach(collectable => {
            this.physics.add.existing(collectable);
            this.physics.add.overlap(this.player, collectable, this.handleCollectableCollision, null, this);
        });

        this.setupControls();
        this.setupEvents();
        this.updateUI();

        console.log(`=== FINAL SCENE STATE ===`);
        console.log(`Player: ${this.player ? `at (${this.player.x}, ${this.player.y})` : 'NOT FOUND'}`);
        console.log(`Enemies: ${this.enemies.length}`);
        console.log(`Collectables: ${this.collectables.length}`);
        console.log(`=== END FINAL STATE ===`);

        if (this.enemies.length === 0) {
            console.log('Adding enemies manually for testing');
            const testEnemies = [
                createEnemy(this, 344, 200, 'zombie'),
                createEnemy(this, 440, 264, 'zombie'),
                createEnemy(this, 1048, 72, 'zombie'),
                createEnemy(this, 904, 184, 'zombie'),
                createEnemy(this, 552, 264, 'zombie'),
                createEnemy(this, 744, 584, 'zombie'),
                createEnemy(this, 1064, 536, 'zombie'),
                createEnemy(this, 696, 520, 'zombie'),
                createEnemy(this, 552, 440, 'zombie'),
                createEnemy(this, 40, 600, 'zombie'),
                createEnemy(this, 120, 200, 'zombie')
            ];
            // const testEnemies = [
            //     createEnemy(this, 120, 152, 'zombie'),
            //     createEnemy(this, 136, 152, 'zombie'),
            //     createEnemy(this, 152, 152, 'zombie'),
            //     createEnemy(this, 120, 136, 'zombie'),
            //     createEnemy(this, 136, 136, 'zombie'),
            //     createEnemy(this, 152, 136, 'zombie'),
            //     createEnemy(this, 120, 120, 'zombie'),
            //     createEnemy(this, 136, 120, 'zombie'),
            //     createEnemy(this, 152, 120, 'zombie'),
            //     createEnemy(this, 168, 120, 'zombie'),
            //     // createEnemy(this, 120, 104, 'zombie'),
            //     // createEnemy(this, 136, 104, 'zombie'),
            //     // createEnemy(this, 152, 104, 'zombie'),
            //     // createEnemy(this, 168, 104, 'zombie'),
            //     // createEnemy(this, 184, 104, 'zombie'),
            //     // createEnemy(this, 184, 88, 'zombie'),
            //     // createEnemy(this, 168, 88, 'zombie')

            // ];

            // Добавляем коллизии для созданных вручную врагов
            testEnemies.forEach(enemy => {
                this.physics.add.existing(enemy);
                this.physics.add.collider(enemy, this.wallsLayer);
                this.physics.add.collider(enemy, this.player, this.handleEnemyPlayerCollision, null, this);
            });
            this.enemies = testEnemies;
        }

        this.add.sprite(216, 248, 'sprites', 'violete_bariere_11.png').setAngle(90);
        this.add.sprite(232, 248, 'sprites', 'violete_bariere_12.png').setAngle(90);

        this.add.sprite(808, 89, 'sprites', 'violete_bariere_11.png');
        this.add.sprite(808, 105, 'sprites', 'violete_bariere_14.png');
        this.add.sprite(808, 121, 'sprites', 'violete_bariere_13.png');

        this.add.sprite(472, 88, 'sprites', 'violete_bariere_11.png');
        this.add.sprite(472, 104, 'sprites', 'violete_bariere_11.png');

        this.add.sprite(200, 328, 'sprites', 'violete_bariere_11.png').setAngle(90);
        this.add.sprite(216, 328, 'sprites', 'violete_bariere_14.png').setAngle(90);
        this.add.sprite(232, 328, 'sprites', 'violete_bariere_13.png').setAngle(90);

        this.add.sprite(232, 568, 'sprites', 'violete_bariere_11.png').setAngle(90);
        this.add.sprite(248, 568, 'sprites', 'violete_bariere_14.png').setAngle(90);
        this.add.sprite(264, 568, 'sprites', 'violete_bariere_12.png').setAngle(90);
        this.add.sprite(280, 568, 'sprites', 'violete_bariere_13.png').setAngle(90);
        this.add.sprite(296, 568, 'sprites', 'violete_bariere_11.png').setAngle(90);

        this.add.sprite(584, 536, 'sprites', 'violete_bariere_12.png');
        this.add.sprite(584, 552, 'sprites', 'violete_bariere_13.png');

        this.add.sprite(856, 344, 'sprites', 'violete_bariere_12.png');
        this.add.sprite(856, 360, 'sprites', 'violete_bariere_13.png');
        this.add.sprite(856, 376, 'sprites', 'violete_bariere_11.png');

        this.add.sprite(712, 360, 'sprites', 'tile033.png');

        if (this.collectables.length === 0) {
            console.log('Adding collectables manually for testing');
            const testCollectables = [
                createCollectable(this, 1064, 184, 'medkit'),
                createCollectable(this, 760, 216, 'medkit'),
                createCollectable(this, 376, 280, 'medkit'),
                createCollectable(this, 264, 184, 'medkit'),
                createCollectable(this, 536, 600, 'medkit'),
                createCollectable(this, 440, 408, 'medkit'),
                createCollectable(this, 1080, 520, 'medkit'),
                createCollectable(this, 680, 360, 'medkit')
            ];

            // Добавляем коллизии для созданных вручную коллектируемых предметов
            testCollectables.forEach(collectable => {
                this.physics.add.existing(collectable);
                this.physics.add.overlap(this.player, collectable, this.handleCollectableCollision, null, this);
            });
            this.collectables = testCollectables;
        }
    }

    setupControls() {
        this.cursors = this.input.keyboard.createCursorKeys();

        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
        this.fKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);

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
                this.updateRegistry();
                this.updateUI();
            }
        });

        this.events.on('enemyDied', (enemy) => {
            console.log('Enemy died:', enemy.name);
            if (this.player) {
                this.player.addScore(50);
                this.updateRegistry();
                this.updateUI();

                const index = this.enemies.indexOf(enemy);
                if (index > -1) {
                    this.enemies.splice(index, 1);
                }
            }
        });

        this.events.on('playerDied', () => {
            console.log('Player died!');
            this.updateRegistry();
            this.showGameOver();
        });

        this.events.on('playerHealthChanged', (health) => {
            this.updateRegistry();
            this.updateUI();
        });
    }

    update() {
        if (!this.player || !this.player.isAlive) return;

        this.handlePlayerMovement();
        this.handlePlayerAttacks();
        this.updateEnemies();
        this.checkTriggerZones();

        // Обработка удаления тумана
        if (Phaser.Input.Keyboard.JustDown(this.fKey) && this.fogRemovers > 0) {
            this.removeFog();
        }
    }

    handlePlayerMovement() {
        if (!this.player.isAlive) return;

        // Отключаем физическое движение если игрок атакует
        if (this.player.currentAction === 'shoot' || this.player.currentAction === 'stab') {
            if (this.player.body) {
                this.player.body.setVelocity(0, 0);
            }
            return;
        }

        const velocity = { x: 0, y: 0 };

        if (this.cursors.left.isDown || this.aKey.isDown) {
            velocity.x = -this.player.speed;
            this.player.setDirection('left');
        } else if (this.cursors.right.isDown || this.dKey.isDown) {
            velocity.x = this.player.speed;
            this.player.setDirection('right');
        }

        if (this.cursors.up.isDown || this.wKey.isDown) {
            velocity.y = -this.player.speed;
            this.player.setDirection('back');
        } else if (this.cursors.down.isDown || this.sKey.isDown) {
            velocity.y = this.player.speed;
            this.player.setDirection('front');
        }

        // Нормализуем скорость по диагонали
        if (velocity.x !== 0 && velocity.y !== 0) {
            const length = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
            velocity.x = (velocity.x / length) * this.player.speed;
            velocity.y = (velocity.y / length) * this.player.speed;
        }

        if (this.player.body) {
            this.player.body.setVelocity(velocity.x * 60, velocity.y * 60);
        } else {
            // Fallback если физика не работает
            this.player.x += velocity.x;
            this.player.y += velocity.y;
        }

        // Обновляем анимации
        if (velocity.x !== 0 || velocity.y !== 0) {
            if (this.player.currentAction !== 'walk') {
                this.player.playWalk();
            }
        } else {
            if (this.player.currentAction !== 'idle') {
                this.player.playIdle();
            }
        }
    }

    // ДОБАВЛЕННЫЙ МЕТОД - обработка атак игрока
    handlePlayerAttacks() {
        if (!this.player.isAlive) return;

        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            this.player.playShoot();
        } else if (Phaser.Input.Keyboard.JustDown(this.shiftKey)) {
            this.player.playStab();
        }
    }

    handleEnemyPlayerCollision(enemy, player) {
        if (enemy.isAlive && player.isAlive && enemy.currentAction !== 'attack') {
            enemy.attack(player);
        }
    }

    handleCollectableCollision(player, collectable) {
        this.handleCollectable(collectable);
        collectable.destroy();

        const index = this.collectables.indexOf(collectable);
        if (index > -1) {
            this.collectables.splice(index, 1);
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

                if (this.time.now > (this.lastFogDamage || 0)) {
                    this.applyFogDamage(5);
                    this.lastFogDamage = this.time.now + 1000;
                }
            } else if (entered) {
                zone.setData('entered', false);
                this.onZoneExit(zone);
            }
        });
    }

    updateEnemies() {
        this.enemies.forEach((enemy, index) => {
            if (!enemy || !enemy.isAlive) {
                return;
            }

            if (!this.player || !this.player.isAlive) {
                if (enemy.currentAction !== 'idle') {
                    enemy.playIdle();
                }
                return;
            }

            enemy.update(this.player);
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

    updateRegistry() {
        if (this.player) {
            this.registry.set('playerHealth', this.player.health);
            this.registry.set('playerMaxHealth', this.player.maxHealth);
            this.registry.set('scores', this.player.score);
            this.registry.set('fogRemovers', this.fogRemovers);
        }
    }

    updateUI() {
        this.updateRegistry();
        if (this.player) {
            this.events.emit('updateUI', {
                health: this.player.health,
                maxHealth: this.player.maxHealth,
                score: this.player.score,
                fogRemovers: this.fogRemovers
            });
        }
    }

    removeFog() {
        if (this.fogRemovers > 0) {
            this.fogRemovers--;
            this.updateRegistry();

            // Удаляем спрайты тумана
            if (this.fogSprites && this.fogSprites.length > 0) {
                this.fogSprites.forEach(fog => fog.destroy());
                this.fogSprites = [];
            }

            this.showMessage('Туман рассеян!');
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
        message.setScrollFactor(0);
        this.currentMessage = message;

        this.time.delayedCall(3000, () => {
            if (this.currentMessage === message) {
                message.destroy();
                this.currentMessage = null;
            }
        });
    }

    showGameOver() {
        // Останавливаем музыку если нужно
        const music = this.registry.get('music');
        if (music) {
            music.stop();
        }

        // Сохраняем финальные данные в registry
        this.updateRegistry();

        this.time.delayedCall(800, () => {
            this.scene.start('GameOverScene', {
                level: this.registry.get('level') || 1,
                scores: this.player ? this.player.score : 0
            });
        });
    }
}