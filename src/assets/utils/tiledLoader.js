// import { createPlayer, createEnemy, createCollectable, spawnBarier, processSpawnZone } from './createHelper.js'

// export function loadTiledEntities(scene, map) {
//     const entitiesLayer = map.getObjectLayer('Objects').objects;
//     const entities = {};

//     entitiesLayer.forEach(ent => {
//         const props = (ent.properties || []).reduce((acc, prop) => {
//             acc[prop.name] = prop.value;
//             return acc;
//         }, {});

//         let entity;

//         if (obj.class === 'player') {
//             entity = createPlayer(scene, ent.x, ent.y, 'sprites');
//         }
//         else if (obj.class === 'enemy') {
//             entity = createEnemy(scene, ent.x, ent.y, 'sprites', ent.name);
//         }
//         else if (obj.class === 'collect') {
//             entity = createCollectable(scene, ent.x, ent.y, 'sprites', ent.name);
//         }

//         entities[ent.name] = entity;
//     });

//     return entities;
// }

// export function loadTiledBariers(scene, map) {
//     const bariersLayer = map.getObjectLayer('Bariers').objects;
//     const bariers = {};

//     bariersLayer.forEach(bar => {
//         const props = (bar.properties || []).reduce((acc, prop) => {
//             acc[prop.name] = prop.value;
//             return acc;
//         }, {});

//         let barier;

//         if (bar.class === 'bariere') {
//             barier = spawnBarier(scene, bar.x, bar.y, 'sprites', bar.name, bar.Direction, bar.Length);
//         }
//         else if (bar.class === 'bariere_zone' && bar.polygon) {
//             barier = processSpawnZone(scene, map, bar);
//         }

//         bariers[bar.name] = barier;
//     });

//     return bariers;
// }

// export function loadTiledTriggerZones(scene, map) {
//     const triggersLayer = map.getObjectLayer('Triggers').objects;
//     const triggers = {};

//     triggersLayer.forEach(trig => {
//         const props = (trig.properties || []).reduce((acc, prop) => {
//             acc[prop.name] = prop.value;
//             return acc;
//         }, {});

//         let trigger;

//         if (trig.class === 'debuff' && trig.polygon) {
//             const points = trig.polygon.map(p => ({
//                 x: trig.x + p.x,
//                 y: trig.y + p.y
//             }));

//             const polygon = new Phaser.Geom.Polygon(points);

//             const zone = scene.add.zone(0, 0).setOrigin(0);
//             zone.setData({
//                 polygon: polygon,
//                 properties: props,
//                 entered: false,
//                 name: trig.name,
//                 class: trig.class
//             });

//             // Визуализация для отладки (можно убрать в продакшене)
//             const graphics = scene.add.graphics();
//             graphics.lineStyle(2, 0xff00ff, 0.3); // Фиолетовый для дебафф зон
//             graphics.strokePoints(polygon.points, true);

//             // Подписываем зону для отладки
//             if (trig.name) {
//                 const text = scene.add.text(points[0].x, points[0].y - 15, `${trig.name}\n(debuff)`, {
//                     fontSize: '8px',
//                     fill: '#ff00ff',
//                     align: 'center'
//                 });
//                 text.setOrigin(0.5);
//             }

//             trigger = zone;
//         }

//         if (trigger) {
//             triggers[trig.name] = trigger;
//         }
//     });

//     return triggers;
// }


import { createPlayer, createEnemy, createCollectable, spawnBarier, processSpawnZone } from './createHelper.js'

export function loadTiledEntities(scene, map) {
    const entitiesLayer = map.getObjectLayer('Objects').objects;
    const entities = {};

    entitiesLayer.forEach(ent => {
        const props = (ent.properties || []).reduce((acc, prop) => {
            acc[prop.name] = prop.value;
            return acc;
        }, {});

        let entity;

        // Используем ent.class вместо ent.type
        if (ent.class === 'player') {
            entity = createPlayer(scene, ent.x, ent.y, 'sprites');
        }
        else if (ent.class === 'enemy') {
            entity = createEnemy(scene, ent.x, ent.y, 'sprites', ent.name);
        }
        else if (ent.class === 'collect') {
            entity = createCollectable(scene, ent.x, ent.y, 'sprites', ent.name);
        }
        // Добавляем обработку зон спавна для врагов/предметов
        else if (ent.class === 'spawn_zone' && ent.polygon) {
            entity = processSpawnZone(scene, map, ent);
        }

        if (entity) {
            entities[ent.name] = entity;
        }
    });

    return entities;
}

export function loadTiledBariers(scene, map) {
    const bariersLayer = map.getObjectLayer('Bariers').objects;
    const bariers = {};

    bariersLayer.forEach(bar => {
        const props = (bar.properties || []).reduce((acc, prop) => {
            acc[prop.name] = prop.value;
            return acc;
        }, {});

        let barier;

        // Используем bar.class вместо bar.type
        if (bar.class === 'bariere') {
            barier = spawnBarier(scene, bar.x, bar.y, 'sprites', bar.name, props.Direction, props.Length);
        }
        else if (bar.class === 'bariere_zone' && bar.polygon) {
            // Для зон барьеров тоже используем processSpawnZone
            barier = processSpawnZone(scene, map, bar);
        }

        if (barier) {
            bariers[bar.name] = barier;
        }
    });

    return bariers;
}

export function loadTiledTriggerZones(scene, map) {
    const triggersLayer = map.getObjectLayer('Triggers').objects;
    const triggers = {};

    triggersLayer.forEach(trig => {
        const props = (trig.properties || []).reduce((acc, prop) => {
            acc[prop.name] = prop.value;
            return acc;
        }, {});

        let trigger;

        // Проверяем класс и полигон
        if (trig.class === 'debuff' && trig.polygon) {
            const points = trig.polygon.map(p => ({
                x: trig.x + p.x,
                y: trig.y + p.y
            }));

            const polygon = new Phaser.Geom.Polygon(points);

            const zone = scene.add.zone(0, 0).setOrigin(0);
            zone.setData({
                polygon: polygon,
                properties: props,
                entered: false,
                name: trig.name,
                class: trig.class // Сохраняем класс для идентификации
            });

            // Визуализация для отладки (можно убрать в продакшене)
            const graphics = scene.add.graphics();
            graphics.lineStyle(2, 0xff00ff, 0.3); // Фиолетовый для дебафф зон
            graphics.strokePoints(polygon.points, true);

            // Подписываем зону для отладки
            if (trig.name) {
                const text = scene.add.text(points[0].x, points[0].y - 15, `${trig.name}\n(debuff)`, {
                    fontSize: '8px',
                    fill: '#ff00ff',
                    align: 'center'
                });
                text.setOrigin(0.5);
            }

            trigger = zone;
        }

        if (trigger) {
            triggers[trig.name] = trigger;
        }
    });

    return triggers;
}