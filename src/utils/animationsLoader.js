export class AnimationsLoader {
    static createPlayerAnimations(scene) {
        this.createDirectionalAnimation(scene, 'player', 'idle', ['front', 'back', 'left', 'right'], 2, 10, -1);

        this.createDirectionalAnimation(scene, 'player', 'walk', ['front', 'back', 'left', 'right'], 4, 10, -1);

        this.createDirectionalAnimation(scene, 'player', 'death', ['front', 'back', 'left', 'right'], 4, 10, 0);

        this.createDirectionalAnimation(scene, 'player', 'shoot', ['front', 'back', 'left', 'right'], 4, 10, 0);

        this.createDirectionalAnimation(scene, 'player', 'stab', ['front', 'back', 'left', 'right'], 4, 10, 0);
    }

    static createZombieAnimations(scene) {
        this.createDirectionalAnimation(scene, 'zombie', 'idle', ['front', 'back', 'left', 'right'], 5, 10, -1);

        this.createDirectionalAnimation(scene, 'zombie', 'walk', ['front', 'back', 'left', 'right'], 10, 10, -1);

        this.createDirectionalAnimation(scene, 'zombie', 'atack', ['front', 'back', 'left', 'right'], 8, 10, 0);

        this.createDirectionalAnimation(scene, 'zombie', 'death', ['front', 'back', 'left', 'right'], 7, 10, 0);
    }

    static createDirectionalAnimation(scene, character, action, directions, frameCount, frameRate, repeat) {
        directions.forEach(direction => {
            const frames = [];

            for (let i = 1; i <= frameCount; i++) {
                const frameNumber = i.toString().padStart(2, '0');
                const frameKey = `${character}_${action}_${direction}_${frameNumber}.png`;

                const texture = scene.textures.get('sprites');
                if (texture && texture.has(frameKey)) {
                    frames.push({ key: 'sprites', frame: frameKey });
                } else {
                    console.warn(`Missing frame: ${frameKey}`);
                }
            }

            if (frames.length > 0) {
                const animKey = `${character}_${action}_${direction}`;

                if (!scene.anims.exists(animKey)) {
                    scene.anims.create({
                        key: animKey,
                        frames: frames,
                        frameRate: frameRate,
                        repeat: repeat
                    });
                }
            } else {
                console.error(`No frames found for animation: ${character}_${action}_${direction}`);
            }
        });
    }

    static createAllAnimations(scene) {
        this.createPlayerAnimations(scene);
        this.createZombieAnimations(scene);
    }
}