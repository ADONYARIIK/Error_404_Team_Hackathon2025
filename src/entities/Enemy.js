import Phaser from 'phaser';

export default class Enemy extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, type = 'zombie') {
        super(scene, x, y, 'sprites', `${type}_idle_front_01.png`);
        scene.add.existing(this);
        
        this.type = type;
        this.currentDirection = 'front';
        this.currentAction = 'idle';
        this.isAlive = true;
        this.speed = 1.5;
        this.attackDamage = 10;
        this.health = 30;
        this.attackCooldown = 1000;
        this.lastAttackTime = 0;
        
        this.playIdle();
    }

    playIdle() {
        if (!this.isAlive) return;
        
        this.currentAction = 'idle';
        const animKey = `${this.type}_idle_${this.currentDirection}`;
        if (this.anims.currentAnim?.key !== animKey) {
            this.play(animKey, true);
        }
    }

    playWalk() {
        if (!this.isAlive) return;
        
        this.currentAction = 'walk';
        const animKey = `${this.type}_walk_${this.currentDirection}`;
        if (this.anims.currentAnim?.key !== animKey) {
            this.play(animKey, true);
        }
    }

    playAttack() {
        if (!this.isAlive) return;
        
        this.currentAction = 'attack';
        this.play(`${this.type}_attack_${this.currentDirection}`, true);
        
        this.once('animationcomplete', () => {
            if (this.isAlive) {
                this.playIdle();
            }
        });
    }

    playDeath() {
        this.currentAction = 'death';
        this.isAlive = false;
        this.play(`${this.type}_death_${this.currentDirection}`, true);
        
        this.once('animationcomplete', () => {
            this.destroy();
        });
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

    update(target) {
        if (!this.isAlive || !target) return;

        const distance = Phaser.Math.Distance.Between(this.x, this.y, target.x, target.y);
        
        if (distance < 40) {
            if (this.currentAction !== 'attack' && 
                this.scene.time.now > this.lastAttackTime + this.attackCooldown) {
                this.attack(target);
            }
            return;
        }

        if (distance < 200) {
            this.moveToTarget(target);
        } else {
            if (this.currentAction !== 'idle') {
                this.playIdle();
            }
        }
    }

    moveToTarget(target) {
        if (!this.isAlive) return;

        const dx = target.x - this.x;
        const dy = target.y - this.y;
        
        const distance = Math.sqrt(dx * dx + dy * dy);
        const velocityX = (dx / distance) * this.speed;
        const velocityY = (dy / distance) * this.speed;
        
        this.x += velocityX;
        this.y += velocityY;
        
        if (Math.abs(dx) > Math.abs(dy)) {
            this.setDirection(dx > 0 ? 'right' : 'left');
        } else {
            this.setDirection(dy > 0 ? 'front' : 'back');
        }
        
        if (this.currentAction !== 'walk') {
            this.playWalk();
        }
    }

    attack(target) {
        if (!this.isAlive || !target.takeDamage) return;
        
        this.playAttack();
        this.lastAttackTime = this.scene.time.now;
        
        this.scene.time.delayedCall(300, () => {
            if (this.isAlive && target.takeDamage) {
                target.takeDamage(this.attackDamage);
            }
        });
    }

    takeDamage(amount) {
        if (!this.isAlive) return;
        
        this.health -= amount;
        
        this.setTint(0xff0000);
        this.scene.time.delayedCall(200, () => {
            this.clearTint();
        });
        
        if (this.health <= 0) {
            this.die();
        }
        
        return this.health;
    }

    die() {
        if (!this.isAlive) return;
        
        this.isAlive = false;
        this.playDeath();
        
        this.scene.events.emit('enemyDied', this);
    }
}