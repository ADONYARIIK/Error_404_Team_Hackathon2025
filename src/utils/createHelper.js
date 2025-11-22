import Player from '../entities/Player.js';
import Enemy from '../entities/Enemy.js';

export function createPlayer(scene, x, y) {
    const texture = scene.textures.get('sprites');
    const initialFrame = texture.has('player_idle_front_01.png')
        ? 'player_idle_front_01.png'
        : texture.getFrameNames()[0];

    const player = new Player(scene, x, y);
    player.class = 'player';

    return player;
}

export function createEnemy(scene, x, y, type = 'zombie') {
    const texture = scene.textures.get('sprites');
    let initialFrame = `${type}_idle_front_01.png`;

    if (!texture.has(initialFrame)) {
        console.warn(`Frame ${initialFrame} not found, trying alternatives`);
        const availableFrames = texture.getFrameNames();
        const enemyFrame = availableFrames.find(frame =>
            frame.includes(type) && frame.includes('idle')
        ) || availableFrames.find(frame => frame.includes(type)) || availableFrames[0];

        initialFrame = enemyFrame;
    }

    // Убедимся, что тип правильно установлен
    const enemyType = type && type !== '' ? type : 'zombie';

    const enemy = new Enemy(scene, x, y, enemyType);
    enemy.class = 'enemy';
    enemy.name = enemyType;

    // Также установим тип объекта для альтернативного поиска
    enemy.type = 'enemy';

    console.log(`Created enemy: ${enemyType} at (${x}, ${y})`);

    return enemy;
}

export function createCollectable(scene, x, y, name) {
    const texture = scene.textures.get('sprites');
    let frameName = `${name}.png`;

    if (!texture.has(frameName)) {
        console.warn(`Frame ${frameName} not found in sprites atlas, using default`);

        const frameMapping = {
            'medkit': 'medicine.png',
            'fogeRemove': 'diamond_01.png',
            'exit': 'tile033.png',
        };

        frameName = frameMapping[name] || 'medicine';
    }

    const collectable = scene.add.sprite(x, y, 'sprites', frameName);
    collectable.class = 'collect';
    collectable.name = name;

    if (name.includes('medkit')) {
        collectable.collectType = 'health';
        collectable.value = 25;
        collectable.setFrame('medicine.png');
    } else if (name.includes('fogeRemove')) {
        collectable.collectType = 'fog_remover';
        collectable.value = 1;
        collectable.setFrame('diamond_01.png');
    } else if (name.includes('exit')) {
        collectable.collectType = 'exit';
        collectable.value = 0;
        collectable.setFrame('tile033.png');
    } else {
        collectable.collectType = 'health';
        collectable.value = 10;
        collectable.setFrame('medicine.png');
    }

    collectable.setScale(0.8);

    scene.tweens.add({
        targets: collectable,
        y: collectable.y -5,
        duration: 1000,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1
    });

    return collectable;
}

export function spawnBarier(scene, x, y, atlas, name, direction, length) {
    const frame = 'violete_bariere_10.png';
    const barrier = scene.add.sprite(x, y, atlas, frame);
    barrier.class = 'bariere';
    barrier.name = name;

    if (direction === 'Left' || direction === 'Right') {
        barrier.displayWidth = (length || 1) * 16;
        barrier.displayHeight = 16;
        barrier.setRotation(0, 0.5);
    } else if (direction === 'Up' || direction === 'Down') {
        barrier.displayHeight = (length || 2) * 16;
        barrier.displayWidth = 16;
        barrier.setOrigin(0.5, 0);
    }

    return barrier;
}

export function processSpawnZone(scene, map, spawnObject) {
    const props = (spawnObject.properties || []).reduce((acc, prop) => {
        acc[prop.name] = prop.value;
        return acc;
    }, {});

    if (!spawnObject.polygon) return null;

    const points = spawnObject.polygon.map(p => ({
        x: spawnObject.x + p.x,
        y: spawnObject.y + p.y
    }));

    const spawnPolygon = new Phaser.Geom.Polygon(points);

    // Исправляем ошибку - переменная graphics не определена
    const graphics = scene.add.graphics();
    graphics.lineStyle(2, 0x00ff00, 0.5);
    graphics.strokePoints(spawnPolygon.points, true);

    return {
        polygon: spawnPolygon,
        properties: props,
        class: spawnObject.class,
        graphics: graphics
    };
}