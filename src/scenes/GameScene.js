// import Phaser from 'phaser';
// import { loadTiledEntities, loadTiledTriggerZones, loadTiledBariers } from '../assets/utils/tiledLoader';

// export default class GameScene extends Phaser.Scene {
//     constructor() {
//         super('GameScene');
//         this.triggerZones = {};
//         this.player = null;
//         this.entities = {};
//         this.bariers = {};
//         this.collectables = [];
//     }

//     create() {
//         this.scene.launch('UIScene');

//         this.cameras.main.setZoom(2);
//         const level1 = this.make.tilemap({ key: 'level1' });

//         this.cameras.main.setBounds(0, 0, level1.widthInPixels, level1.heightInPixels);

//         const tiles = level1.addTilesetImage('tiles', 'tiles');

//         const backgroundLayer = level1.createLayer('Background', tiles, 0, 0);
//         const wallsLayer = level1.createLayer('Walls', tiles, 0, 0);
//         const decorLayer = level1.createLayer('Decor', tiles, 0, 0);

//         // const entities = loadTiledObjects(this, level1);
//         // const bariers = loadTiledBariers(this, level1);
//         // const triggers = loadTiledTriggerZones(this, level1);
//     }
// }

import Phaser from 'phaser';
import { loadTiledEntities, loadTiledTriggerZones, loadTiledBariers } from '../assets/utils/tiledLoader';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.triggerZones = {};
        this.player = null;
        this.entities = {};
        this.bariers = {};
        this.collectables = [];
    }

    preload() {
        // Ваша загрузка ресурсов
    }

    create() {
        this.scene.launch('UIScene');

        this.cameras.main.setZoom(2);
        const level1 = this.make.tilemap({ key: 'level1' });

        this.cameras.main.setBounds(0, 0, level1.widthInPixels, level1.heightInPixels);

        const tiles = level1.addTilesetImage('tiles', 'tiles');

        const backgroundLayer = level1.createLayer('Background', tiles, 0, 0);
        const wallsLayer = level1.createLayer('Walls', tiles, 0, 0);
        const decorLayer = level1.createLayer('Decor', tiles, 0, 0);

        // Загружаем все объекты
        this.entities = loadTiledEntities(this, level1);
        this.triggerZones = loadTiledTriggerZones(this, level1);
        this.bariers = loadTiledBariers(this, level1);

        // Находим игрока среди сущностей
        this.player = Object.values(this.entities).find(entity =>
            entity && entity.class === 'player'
        );

        // Собираем все собираемые предметы в отдельный массив для проверки коллизий
        this.collectables = Object.values(this.entities).filter(entity =>
            entity && entity.class === 'collect'
        );

        // Собираем всех врагов для проверки коллизий
        this.enemies = Object.values(this.entities).filter(entity =>
            entity && entity.class === 'enemy'
        );

        // Собираем все барьеры для проверки коллизий
        this.allBariers = Object.values(this.bariers).filter(barrier =>
            barrier && barrier.class === 'bariere'
        );
    }

    update() {
        if (!this.player) return;

        // Проверяем триггерные зоны (дебаффы)
        Object.values(this.triggerZones).forEach(zone => {
            if (!zone.getData) return;

            const polygon = zone.getData('polygon');
            const entered = zone.getData('entered');
            const zoneClass = zone.getData('class');

            if (Phaser.Geom.Polygon.ContainsPoint(polygon, this.player.x, this.player.y)) {
                if (!entered) {
                    zone.setData('entered', true);
                    this.onZoneEnter(zone);
                }
            } else if (entered) {
                zone.setData('entered', false);
                this.onZoneExit(zone);
            }
        });

        // Проверяем коллизии с собираемыми предметами
        this.checkCollectableCollisions();

        // Проверяем коллизии с врагами
        this.checkEnemyCollisions();

        // Проверяем коллизии с барьерами
        this.checkBarrierCollisions();
    }

    checkCollectableCollisions() {
        // Простая проверка коллизий по расстоянию
        const collectRadius = 20; // Радиус сбора предмета

        for (let i = this.collectables.length - 1; i >= 0; i--) {
            const collectable = this.collectables[i];
            if (!collectable) continue;

            const distance = Phaser.Math.Distance.Between(
                this.player.x, this.player.y,
                collectable.x, collectable.y
            );

            if (distance < collectRadius) {
                this.onCollect(this.player, collectable);
                this.collectables.splice(i, 1);
            }
        }
    }

    checkEnemyCollisions() {
        // Простая проверка коллизий с врагами
        const enemyRadius = 25; // Радиус коллизии врага

        this.enemies.forEach(enemy => {
            if (!enemy) return;

            const distance = Phaser.Math.Distance.Between(
                this.player.x, this.player.y,
                enemy.x, enemy.y
            );

            if (distance < enemyRadius) {
                this.onEnemyPlayerCollision(enemy, this.player);
            }
        });
    }

    checkBarrierCollisions() {
        // Простая проверка коллизий с барьерами
        const barrierRadius = 20; // Радиус коллизии барьера

        this.allBariers.forEach(barrier => {
            if (!barrier) return;

            const distance = Phaser.Math.Distance.Between(
                this.player.x, this.player.y,
                barrier.x, barrier.y
            );

            if (distance < barrierRadius) {
                this.onBarrierCollision(barrier, this.player);
            }
        });
    }

    onZoneEnter(zone) {
        const properties = zone.getData('properties');
        const name = zone.getData('name');
        const zoneClass = zone.getData('class');

        console.log(`Entered ${zoneClass} zone:`, name, properties);

        // Обработка дебафф зон
        if (zoneClass === 'debuff') {
            this.applyDebuff(properties);
        }

        // Вызываем кастомные события
        if (properties.onEnter) {
            this.events.emit(properties.onEnter, zone);
        }

        // Показываем сообщение
        if (properties.message) {
            this.showMessage(properties.message);
        }
    }

    onZoneExit(zone) {
        const properties = zone.getData('properties');
        const name = zone.getData('name');
        const zoneClass = zone.getData('class');

        console.log(`Exited ${zoneClass} zone:`, name, properties);

        // Снимаем дебафф
        if (zoneClass === 'debuff') {
            this.removeDebuff(properties);
        }

        if (properties.onExit) {
            this.events.emit(properties.onExit, zone);
        }
    }

    applyDebuff(properties) {
        // Применяем эффекты дебаффа к игроку
        // Например, замедление скорости движения
        if (properties.slowDown) {
            this.player.speedMultiplier = 0.5;
        }

        // Визуальный эффект
        this.player.setTint(0xff0000);

        if (properties.damageOverTime) {
            // Запускаем периодический урон
            this.debuffDamageTimer = this.time.addEvent({
                delay: 1000, // Каждую секунду
                callback: this.applyDebuffDamage,
                callbackScope: this,
                loop: true
            });
        }
    }

    removeDebuff(properties) {
        // Снимаем эффекты дебаффа
        this.player.clearTint();
        this.player.speedMultiplier = 1.0;

        // Останавливаем таймер урона, если он был
        if (this.debuffDamageTimer) {
            this.debuffDamageTimer.remove();
            this.debuffDamageTimer = null;
        }
    }

    applyDebuffDamage() {
        // Применяем урон от дебаффа
        console.log('Taking debuff damage');
        // this.player.health -= 1;
        // this.events.emit('playerHealthChanged', this.player.health);
    }

    onEnemyPlayerCollision(enemy, player) {
        // Обработка столкновения врага с игроком
        console.log('Enemy collided with player');
        // Ваша логика урона
        // this.player.health -= 10;
        // this.events.emit('playerHealthChanged', this.player.health);
    }

    onBarrierCollision(barrier, player) {
        // Обработка столкновения с барьером
        console.log('Player collided with barrier');
        // Можно добавить отталкивание или другую логику
    }

    onCollect(player, collectable) {
        // Обработка сбора предмета
        console.log('Collected:', collectable.name);

        // Удаляем предмет со сцены
        collectable.destroy();

        // Дополнительная логика (добавление очков и т.д.)
        this.events.emit('itemCollected', collectable);
    }

    showMessage(text) {
        // Реализация показа сообщения
        const message = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY - 50,
            text,
            {
                fontSize: '16px',
                fill: '#ffffff',
                backgroundColor: '#000000',
                padding: { x: 10, y: 5 }
            }
        );
        message.setOrigin(0.5);

        // Автоматическое скрытие сообщения
        this.time.delayedCall(3000, () => {
            message.destroy();
        });
    }
}