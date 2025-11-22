import { createPlayer, createEnemy, createCollectable, spawnBarier, processSpawnZone } from './createHelper.js'

export function loadTiledEntities(scene, map) {
    const entitiesLayer = map.getObjectLayer('Objects').objects;
    console.log('All objects in Objects layer:', entitiesLayer); // Отладочный вывод

    const entities = {};

    entitiesLayer.forEach(ent => {
        const props = (ent.properties || []).reduce((acc, prop) => {
            acc[prop.name] = prop.value;
            return acc;
        }, {});

        console.log(`Processing entity: name=${ent.name}, type=${ent.type}, class=${ent.class}, x=${ent.x}, y=${ent.y}`); // Отладочный вывод

        let entity;

        if (ent.type === 'player') {
            entity = createPlayer(scene, ent.x, ent.y);
            console.log('Created player entity');
        }
        else if (ent.type === 'enemy') {
            entity = createEnemy(scene, ent.x, ent.y, ent.name);
            console.log(`Created enemy entity: ${ent.name}`);
        }
        else if (ent.type === 'collectable') {
            entity = createCollectable(scene, ent.x, ent.y, ent.name);
            console.log(`Created collectable entity: ${ent.name}`);
        } else {
            console.log(`Unknown entity type: ${ent.type}`);
        }

        if (entity) {
            entities[ent.name] = entity;
        }
    });

    console.log('Final entities object:', entities); // Отладочный вывод
    return entities;
}

export function loadTiledBariers(scene, map) {
    const bariersLayer = map.getObjectLayer('Bariers').objects;
    const bariers = {};
    const fogSprites = [];

    bariersLayer.forEach(bar => {
        const props = (bar.properties || []).reduce((acc, prop) => {
            acc[prop.name] = prop.value;
            return acc;
        }, {});

        let barier;

        if (bar.type === 'bariere') {
            if (bar.name === 'cloud') {
                const fog = scene.add.sprite(bar.x, bar.y, 'sprites', 'cloud.png');
                fog.setAlpha(0.6);
                fog.setScale(0.8);
                fog.setOrigin(0.5, 0.5);
                fog.setDepth(5);
                fogSprites.push(fog);
                barier = fog;
            } else {
                barier = spawnBarier(scene, bar.x, bar.y, 'sprites', `${bar.name}.png`, props.Direction, props.Length);
            }
        }
        else if (bar.type === 'bariere_zone' && bar.polygon) {
            barier = processSpawnZone(scene, map, bar);
        }

        if (barier) {
            bariers[bar.name] = barier;
        }
    });

    scene.fogSprites = fogSprites;

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

        if (trig.type === 'debuff' && trig.polygon) {
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
                class: trig.type
            });

            trigger = zone;
        }

        if (trigger) {
            triggers[trig.name] = trigger;
        }
    });

    return triggers;
}