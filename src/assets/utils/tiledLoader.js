export function loadTiledEntities(scene, map) {
    const entitiesLayer = map.getObjectLayer('Objects').objects;
    const entities = {};

    entitiesLayer.forEach(ent => {
        const props = (ent.properties || []).reduce((acc, prop) => {
            acc[prop.name] = prop.value;
            return acc;
        }, {});

        let entity;

        if (obj.type === 'player') {
            entity = createPlayer(scene, ent.x, ent.y, 'sprites');
        }
        else if (obj.type === 'enemy') {
            entity = createEnemy(scene, ent.x, ent.y, 'sprites', ent.name);
        }

        entities[ent.name] = entity;
    });

    return entities;
}

export function loadTiledBariers(scene, map) {

}

export function loadTiledTriggerZones(scene, map) {
    const triggersLayer = map.getObjectLayer('Triggers'.objects);
    const triggers = {};

    triggersLayer.forEach(trig => {
        const props = (trig.properties || []).reduce((acc, prop) => {
            acc[prop.name] = prop.value;
            return acc;
        }, {});
    });
}