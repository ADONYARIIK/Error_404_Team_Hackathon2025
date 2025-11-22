// export function createPlayer(scene, x, y, atlas) {

// }

// export function createEnemy(scene, x, y, atlas, name) {

// }

// export function createCollectable(scene, x, y, atlas, name) {

// }

// export function spawnBarier(scene, x, y, atlas, name, direction, length) {

// }

// export function processSpawnZone(scene, map, spawnObject) {
//     const props = (spawnObject.properties || []).reduce((acc, prop) => {
//         acc[prop.name] = prop.value;
//         return acc;
//     }, {});

//     if (!spawnObject.polygon) return null;

//     const points = spawnObject.polygon.map(p => ({
//         x: spawnObject.x + p.x,
//         y: spawnObject.y + p.y
//     }));

//     const spawnPolygon = new Phaser.Geom.Polygon(points);

//     const tilesInPolygon = getTilesInPolygon(map, spawnPolygon);

//     const spawnedObjects = spawnObjectsInZone(scene, tilesInPolygon, spawnObject.type, props);

//     // Визуализация для отладки
//     const graphics = scene.add.graphics();
//     const color = getColorForType(spawnObject.type);
//     graphics.lineStyle(1, color, 0.5);
//     graphics.strokePoints(spawnPolygon.points, true);

//     return {
//         polygon: spawnPolygon,
//         objects: spawnedObjects,
//         properties: props,
//         type: spawnObject.type
//     };
// }

// function getTilesInPolygon(map, polygon) {
//     const tiles = [];
//     const layer = map.getLayer('Backgtound').data``;

//     if (!layer) {
//         console.warn('No tile layers found in map');
//         return tiles;
//     }

//     const bounds = Phaser.Geom.Polygon.GetAABB(polygon);

//     const startTileX = Math.floor(bounds.x / map.tileWidth);
//     const startTileY = Math.floor(bounds.y / map.tileHeight);
//     const endTileX = Math.ceil((bounds.x + bounds.width) / map.tileWidth);
//     const endTileY = Math.ceil((bounds.y + bounds.height) / map.tileHeight);

//     for (let y = startTileY; y < endTileY; y++) {
//         for (let x = startTileX; x < endTileX; x++) {
//             if (y >= 0 && y < layer.length && x >= 0 && x < layer[0].length) {
//                 const tile = layer[y][x];
//                 if (tile && tile.index !== -1) {
//                     const tileCenterX = tile.pixelX + map.tileWidth / 2;
//                     const tileCenterY = tile.pixelY + map.tileHeight / 2;

//                     if (Phaser.Geom.Polygon.ContainsPoint(polygon, tileCenterX, tileCenterY)) {
//                         tiles.push(tile);
//                     }
//                 }
//             }
//         }
//     }

//     return tiles;
// }

// function spawnObjectsInZone(scene, tiles, type, properties) {
//     const spawnedObjects = [];

//     tiles.forEach((tile, index) => {
//         const spawnX = tile.pixelX + tile.width / 2;
//         const spawnY = tile.pixelY + tile.height / 2;

//         let object;

//         switch (type) {
//             case 'spawn_zone':
//                 const objectType = properties.objectType || 'enemy';
//                 if (objectType === 'enemy') {
//                     object = createEnemy(scene, spawnX, spawnY, 'sprites', `spawned_enemy_${index}`);
//                 } else if (objectType === 'collect') {
//                     object = createCollectable(scene, spawnX, spawnY, 'sprites', `spawned_collect_${index}`);
//                 }
//                 break;

//             case 'bariere_zone': // Спавн барьеров
//                 const direction = properties.Direction || 'right';
//                 const length = properties.Length || 1;
//                 object = spawnBarier(scene, spawnX, spawnY, 'sprites', `spawned_barrier_${index}`, direction, length);
//                 break;

//             default:
//                 console.warn(`Unknown spawn zone type: ${type}`);
//         }

//         if (object) {
//             spawnedObjects.push(object);

//             // Визуализация точки спавна для отладки
//             const graphics = scene.add.graphics();
//             const color = getColorForType(type);
//             graphics.fillStyle(color, 0.3);
//             graphics.fillCircle(spawnX, spawnY, 3);
//         }
//     });

//     console.log(`Spawned ${spawnedObjects.length} objects of type: ${type}`);
//     return spawnedObjects;
// }

// createHelper.js

// Функция для обработки зон спавна (врагов, предметов, барьеров)
export function processSpawnZone(scene, map, spawnObject) {
    const props = (spawnObject.properties || []).reduce((acc, prop) => {
        acc[prop.name] = prop.value;
        return acc;
    }, {});

    if (!spawnObject.polygon) return null;

    // Создаем полигон зоны спавна
    const points = spawnObject.polygon.map(p => ({
        x: spawnObject.x + p.x,
        y: spawnObject.y + p.y
    }));

    const spawnPolygon = new Phaser.Geom.Polygon(points);

    // Получаем все тайлы внутри полигона
    const tilesInPolygon = getTilesInPolygon(map, spawnPolygon);

    // Спавним объекты на найденных тайлах в зависимости от класса
    const spawnedObjects = spawnObjectsInZone(scene, tilesInPolygon, spawnObject.class, props);

    // Визуализация для отладки
    const graphics = scene.add.graphics();
    const color = getColorForClass(spawnObject.class);
    graphics.lineStyle(1, color, 0.5);
    graphics.strokePoints(spawnPolygon.points, true);

    // Подписываем зону для отладки
    if (spawnObject.name) {
        const text = scene.add.text(points[0].x, points[0].y - 10, `${spawnObject.name}\n(${spawnObject.class})`, {
            fontSize: '8px',
            fill: '#' + color.toString(16),
            align: 'center'
        });
        text.setOrigin(0.5);
    }

    return {
        polygon: spawnPolygon,
        objects: spawnedObjects,
        properties: props,
        class: spawnObject.class
    };
}

// Функция для получения тайлов внутри полигона
function getTilesInPolygon(map, polygon) {
    const tiles = [];

    // Используем слой Ground или первый доступный слой
    let layer;
    try {
        layer = map.getLayer('Ground').data;
    } catch (e) {
        // Если слоя Ground нет, используем первый слой
        layer = map.layers[0].data;
    }

    if (!layer) {
        console.warn('No tile layers found in map');
        return tiles;
    }

    // Получаем границы полигона
    const bounds = Phaser.Geom.Polygon.GetAABB(polygon);

    // Определяем диапазон тайлов для проверки
    const startTileX = Math.max(0, Math.floor(bounds.x / map.tileWidth));
    const startTileY = Math.max(0, Math.floor(bounds.y / map.tileHeight));
    const endTileX = Math.min(layer[0].length, Math.ceil((bounds.x + bounds.width) / map.tileWidth));
    const endTileY = Math.min(layer.length, Math.ceil((bounds.y + bounds.height) / map.tileHeight));

    // Проверяем каждый тайл в границах полигона
    for (let y = startTileY; y < endTileY; y++) {
        for (let x = startTileX; x < endTileX; x++) {
            if (y < layer.length && x < layer[y].length) {
                const tile = layer[y][x];
                if (tile && tile.index !== -1) {
                    const tileCenterX = tile.pixelX + map.tileWidth / 2;
                    const tileCenterY = tile.pixelY + map.tileHeight / 2;

                    // Проверяем, находится ли центр тайла внутри полигона
                    if (Phaser.Geom.Polygon.ContainsPoint(polygon, tileCenterX, tileCenterY)) {
                        tiles.push(tile);
                    }
                }
            }
        }
    }

    return tiles;
}

// Функция для спавна объектов в зоне в зависимости от класса
function spawnObjectsInZone(scene, tiles, objectClass, properties) {
    const spawnedObjects = [];

    tiles.forEach((tile, index) => {
        const spawnX = tile.pixelX + tile.width / 2;
        const spawnY = tile.pixelY + tile.height / 2;

        let object;

        switch (objectClass) {
            case 'spawn_zone': // Спавн врагов/предметов
                const spawnType = properties.objectType || 'enemy';
                if (spawnType === 'enemy') {
                    object = createEnemy(scene, spawnX, spawnY, 'sprites', `spawned_enemy_${index}`);
                } else if (spawnType === 'collect') {
                    object = createCollectable(scene, spawnX, spawnY, 'sprites', `spawned_collect_${index}`);
                }
                break;

            case 'bariere_zone': // Спавн барьеров
                const direction = properties.Direction || 'horizontal';
                const length = properties.Length || 1;
                object = spawnBarier(scene, spawnX, spawnY, 'sprites', `spawned_barrier_${index}`, direction, length);
                break;

            default:
                console.warn(`Unknown spawn zone class: ${objectClass}`);
        }

        if (object) {
            spawnedObjects.push(object);

            // Визуализация точки спавна для отладки
            const graphics = scene.add.graphics();
            const color = getColorForClass(objectClass);
            graphics.fillStyle(color, 0.3);
            graphics.fillCircle(spawnX, spawnY, 3);
        }
    });

    console.log(`Spawned ${spawnedObjects.length} objects of class: ${objectClass}`);
    return spawnedObjects;
}

// Вспомогательная функция для цветов отладки
function getColorForClass(objectClass) {
    switch (objectClass) {
        case 'spawn_zone': return 0x0000ff; // Синий для зон спавна
        case 'bariere_zone': return 0xff0000; // Красный для барьеров
        case 'debuff': return 0xff00ff; // Фиолетовый для дебафф зон
        case 'enemy': return 0xffff00; // Желтый для врагов
        case 'player': return 0x00ff00; // Зеленый для игрока
        case 'collect': return 0x00ffff; // Голубой для собираемых предметов
        default: return 0xffffff; // Белый по умолчанию
    }
}

// Ваши существующие функции (без физики)
export function createPlayer(scene, x, y, texture) {
    const player = scene.add.sprite(x, y, texture); // Без physics
    player.class = 'player';
    return player;
}

export function createEnemy(scene, x, y, texture, name) {
    const enemy = scene.add.sprite(x, y, texture); // Без physics
    enemy.class = 'enemy';
    enemy.name = name;
    return enemy;
}

export function createCollectable(scene, x, y, texture, name) {
    const collectable = scene.add.sprite(x, y, texture); // Без physics
    collectable.class = 'collect';
    collectable.name = name;
    return collectable;
}

export function spawnBarier(scene, x, y, texture, name, direction, length) {
    const barrier = scene.add.sprite(x, y, texture); // Без physics
    barrier.class = 'bariere';
    barrier.name = name;
    // Используйте direction и length по необходимости
    return barrier;
}