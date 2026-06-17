/**
 * 僵尸实体
 */
class ZombieEntity {
    constructor(data, row, x) {
        this.data = data;
        this.row = row;
        this.x = x;
        this.hp = data.hp;
        this.speed = data.speed;
        this.active = true;
        this.attacking = false;
        this.attackTimer = 0;
        this.targetPlant = null;

        // 护甲
        this.armorHp = data.armorHp || 0;

        // 减速
        this.slowed = false;
        this.slowTimer = 0;
        this.slowFactor = 1;

        // 撑杆
        this.canVault = data.canVault || false;
        this.vaulted = false;

        // 读报僵尸
        this.enraged = false;

        // 舞王召唤
        this.summonTimer = 0;

        // 巨人投掷小鬼
        this.thrownImp = false;

        // 受击闪烁
        this.hitFlash = 0;
    }

    /** 计算僵尸的 y 坐标（行中心） */
    getY() {
        const cfg = GAME_CONFIG;
        return cfg.GRID_OFFSET_Y + this.row * cfg.CELL_HEIGHT + cfg.CELL_HEIGHT / 2;
    }

    update(dt, speed, engine) {
        if (!this.active) return;

        const cfg = GAME_CONFIG;

        // 减速计时
        if (this.slowed) {
            this.slowTimer -= dt * speed;
            if (this.slowTimer <= 0) {
                this.slowed = false;
                this.slowFactor = 1;
            }
        }

        // 受击闪烁衰减
        if (this.hitFlash > 0) {
            this.hitFlash -= dt * speed;
            if (this.hitFlash < 0) this.hitFlash = 0;
        }

        // 受击音效冷却
        if (this.hitSoundCooldown > 0) {
            this.hitSoundCooldown -= dt * speed;
        }

        // 读报僵尸激怒
        if (this.data.id === 'newspaper' && !this.enraged && this.armorHp <= 0) {
            this.enraged = true;
            this.speed = this.data.enrageSpeed;
        }

        // 舞王召唤
        if (this.data.summon) {
            this.summonTimer += dt * speed;
            if (this.summonTimer >= this.data.summonInterval) {
                this.summonTimer = 0;
                this.summonImps(engine);
            }
        }

        // 巨人投掷小鬼
        if (this.data.throwImp && !this.thrownImp && this.hp <= this.data.throwHpThreshold) {
            this.thrownImp = true;
            this.throwImp(engine);
        }

        // 检测前方植物 - 使用僵尸前端位置精确匹配格子
        const zombieFrontX = this.x - cfg.CELL_WIDTH * 0.3;
        const col = Math.floor((zombieFrontX - cfg.GRID_OFFSET_X) / cfg.CELL_WIDTH);
        const plantCol = Helpers.clamp(col, 0, cfg.COLS - 1);
        const plant = engine.plantManager.getPlant(this.row, plantCol);

        if (plant && plant.active) {
            const plantPos = Helpers.getCellCenter(this.row, plantCol);
            const dist = this.x - plantPos.x;

            // 撑杆跳
            if (this.canVault && !this.vaulted && dist > 0 && dist < cfg.CELL_WIDTH) {
                this.vaulted = true;
                this.canVault = false;
                this.x = plantPos.x - cfg.CELL_WIDTH;
                this.speed = this.data.speed * 0.7;
                return;
            }

            // 地刺类植物不阻挡僵尸，僵尸直接走过
            if (plant.data.type === 'spike') {
                // 不攻击地刺，继续前进
            } else if (dist > -10 && dist < cfg.CELL_WIDTH * 0.6) {
                // 切换目标时重置攻击计时器
                if (this.targetPlant !== plant) {
                    this.attackTimer = 0;
                }
                // 攻击植物
                this.attacking = true;
                this.targetPlant = plant;
                this.attackTimer += dt * speed;
                if (this.attackTimer >= this.data.attackInterval) {
                    this.attackTimer = 0;
                    plant.takeDamage(this.data.damage);
                    if (!plant.active) {
                        this.attacking = false;
                        this.targetPlant = null;
                    }
                }
                return;
            }
        } else {
            this.attacking = false;
            this.targetPlant = null;
        }

        // 移动
        const moveSpeed = this.speed * this.slowFactor * speed;
        this.x -= moveSpeed;

        // 同行前方僵尸间距保持，避免重叠
        const sameRowZombies = engine.zombieManager.getZombiesInRow(this.row);
        const minGap = cfg.CELL_WIDTH * 0.45;
        for (const other of sameRowZombies) {
            if (other === this || !other.active) continue;
            const dist = other.x - this.x;
            // 前方有僵尸且距离太近，停下等待
            if (dist > 0 && dist < minGap && !other.attacking) {
                this.x = other.x - minGap;
                break;
            }
        }

        // 到达左边界 - 游戏失败
        if (this.x < cfg.GRID_OFFSET_X - 20) {
            engine.gameOver(false);
        }
    }

    takeDamage(amount, engine) {
        if (this.armorHp > 0) {
            this.armorHp -= amount;
            if (this.armorHp < 0) {
                this.hp += this.armorHp;
                this.armorHp = 0;
            }
        } else {
            this.hp -= amount;
        }
        // 受击闪烁
        this.hitFlash = 80;
        // 受击音效（带冷却避免太频繁）
        if (!this.hitSoundCooldown || this.hitSoundCooldown <= 0) {
            soundManager.playHit();
            this.hitSoundCooldown = 80;
        }
        if (this.hp <= 0) {
            this.active = false;
        }
    }

    applySlow(factor, duration) {
        this.slowed = true;
        this.slowFactor = factor;
        this.slowTimer = duration;
    }

    summonImps(engine) {
        const cfg = GAME_CONFIG;
        const impData = ZOMBIES_DATA.find(z => z.id === 'imp');
        if (!impData) return;
        // 在周围行召唤小鬼
        for (let offset = -1; offset <= 1; offset += 2) {
            const targetRow = this.row + offset;
            if (targetRow >= 0 && targetRow < cfg.ROWS) {
                engine.zombieManager.spawn(impData, targetRow, this.x + 20);
            }
        }
    }

    throwImp(engine) {
        const cfg = GAME_CONFIG;
        const impData = ZOMBIES_DATA.find(z => z.id === 'imp');
        if (!impData) return;
        // 投掷小鬼到前方
        const targetX = this.x - cfg.CELL_WIDTH * 3;
        engine.zombieManager.spawn(impData, this.row, Math.max(cfg.GRID_OFFSET_X + cfg.CELL_WIDTH, targetX));
        Toast.warning('👾 巨人僵尸投掷了小鬼！');
    }
}

/**
 * 僵尸管理器
 */
class ZombieManager {
    constructor(engine) {
        this.engine = engine;
        this.zombies = [];
    }

    reset() {
        this.zombies = [];
    }

    spawn(data, row, x) {
        const cfg = GAME_CONFIG;
        if (x === undefined) {
            x = cfg.GRID_OFFSET_X + cfg.COLS * cfg.CELL_WIDTH + Helpers.randInt(20, 100);
        }
        const zombie = new ZombieEntity(data, row, x);
        this.zombies.push(zombie);
        return zombie;
    }

    getZombiesInRow(row) {
        return this.zombies.filter(z => z.active && z.row === row);
    }

    update(dt, speed) {
        this.zombies.forEach(z => {
            if (z.active) {
                z.update(dt, speed, this.engine);
            }
        });
        this.zombies = this.zombies.filter(z => z.active);
    }

    draw(ctx) {
        const cfg = GAME_CONFIG;
        this.zombies.forEach(z => {
            if (z.active) {
                ZombieRenderer.draw(ctx, z, cfg);
            }
        });
    }

    get aliveCount() {
        return this.zombies.filter(z => z.active).length;
    }
}
