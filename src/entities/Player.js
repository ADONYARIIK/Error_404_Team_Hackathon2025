import Phaser from 'phaser';

export default class Player extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'sprites', 'player_idle_front_01.png');
        scene.add.existing(this);

        this.currentDirection = 'front';
        this.currentAction = 'idle';
        this.speed = scene.registry.get('playerSpeed') || 3;
        this.isAlive = true;

        this.health = scene.registry.get('playerHealth') || 100;
        this.maxHealth = scene.registry.get('playerMaxHealth') || 100;
        this.score = scene.registry.get('scores') || 0;

        this.playIdle();
    }

    // Удаляем старый метод move и заменяем его на методы для управления анимациями

    takeDamage(amount) {
        if (!this.isAlive) return;

        this.health = Math.max(0, this.health - amount);

        this.setTint(0xff0000);
        this.scene.time.delayedCall(200, () => {
            this.clearTint();
        });

        this.scene.events.emit('playerHealthChanged', this.health);

        if (this.health <= 0) {
            this.die();
        }

        return this.health;
    }

    playIdle() {
        if (!this.isAlive) return;

        this.currentAction = 'idle';
        const animKey = `player_idle_${this.currentDirection}`;
        if (this.anims.currentAnim?.key !== animKey) {
            this.play(animKey, true);
        }
    }

    playWalk() {
        if (!this.isAlive) return;

        this.currentAction = 'walk';
        const animKey = `player_walk_${this.currentDirection}`;
        if (this.anims.currentAnim?.key !== animKey) {
            this.play(animKey, true);
        }
    }

    playDeath() {
        this.currentAction = 'death';
        this.isAlive = false;
        this.play(`player_death_${this.currentDirection}`, true);

        this.once('animationcomplete', () => {
            this.setTint(0x666666);
        });
    }

    playShoot() {
        if (!this.isAlive || this.currentAction === 'shoot') return false;

        this.currentAction = 'shoot';
        this.play(`player_shoot_${this.currentDirection}`, true);

        this.scene.time.delayedCall(500, () => {
            if (this.isAlive && this.currentAction === 'shoot') {
                this.playIdle();
            }
        });

        return true;
    }

    playStab() {
        if (!this.isAlive || this.currentAction === 'stab') return false;

        this.currentAction = 'stab';
        this.play(`player_stab_${this.currentDirection}`, true);

        this.scene.time.delayedCall(400, () => {
            if (this.isAlive && this.currentAction === 'stab') {
                this.playIdle();
            }
        });

        return true;
    }

    setDirection(direction) {
        if (this.currentDirection !== direction && this.isAlive) {
            this.currentDirection = direction;

            if (this.currentAction === 'idle') {
                this.playIdle();
            } else if (this.currentAction === 'walk') {
                this.playWalk();
            }
        }
    }

    move(left, right, up, down) {
        if (!this.isAlive) return false;

        if (this.currentAction === 'shoot' || this.currentAction === 'stab') {
            return false;
        }

        let moving = false;
        let newDirection = this.currentDirection;

        if (left) {
            this.x -= this.speed;
            newDirection = 'left';
            moving = true;
        } else if (right) {
            this.x += this.speed;
            newDirection = 'right';
            moving = true;
        }

        if (up) {
            this.y -= this.speed;
            newDirection = 'back';
            moving = true;
        } else if (down) {
            this.y += this.speed;
            newDirection = 'front';
            moving = true;
        }

        this.setDirection(newDirection);

        if (moving && this.currentAction !== 'walk') {
            this.playWalk();
        } else if (!moving && this.currentAction !== 'idle') {
            this.playIdle();
        }

        return moving;
    }

    die() {
        if (!this.isAlive) return;

        this.isAlive = false;
        this.playDeath();

        // Эмитим событие смерти игрока
        this.scene.events.emit('playerDied');
    }

    addScore(points) {
        this.score += points;
        this.scene.events.emit('scoreChanged', this.score);
    }

    heal(amount) {
        const oldHealth = this.health;
        this.health = Math.min(this.maxHealth, this.health + amount);
        const actualHeal = this.health - oldHealth;

        this.setTint(0x00ff00);
        this.scene.time.delayedCall(200, () => {
            this.clearTint();
        });

        return actualHeal;
    }
}