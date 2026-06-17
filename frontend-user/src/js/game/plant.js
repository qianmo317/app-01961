/**
 * 植物实体管理
 */
class PlantEntity {
    constructor(data, row, col) {
        this.data = data;
        this.row = row;
        this.col = col;
        this.hp = data.hp;
        this.maxHp = data.hp;
        this.active = true;

        // 攻击计时
        this.attackTimer = 0;
        // 产阳光计时
        this.sunTimer = 0;
        // 土豆雷准备
        this.armed = data.type !== 'mine';
        this.armTimer = 0;
        // 大嘴花咀嚼
        this.chewing = false;
        this.chewTimer = 0;
        // 地刺计时
        this.spikeTimer = 0;
        // 磁力菇计时
        this.magnetTimer = 0;
        // 窝瓜状态
        this.jumping = false;
        this.jumpTarget = null;
        this.jumpTimer = 0;
        // 南瓜头护甲
        this.armorHp = data.type === 'armor' ? data.hp : 0;
        // 一次性植物是否已触发
        this.fired = false;
    }

    update(dt, speed, engine) {
        if (!this.active) return;

        const cfg = GAME_CONFIG;
        const pos = Helpers.getCellCenter(this.row, this.col);
        const zombiesInRow = engine.zombieManager.getZombiesInRow(this.row);
        const zombiesAhead = zombiesInRow.filter(z => z.active && z.x > pos.x - cfg.CELL_WIDTH / 2);

        switch (this.data.type) {
            case 'shooter':
                this.updateShooter(dt, speed, engine, pos, zombiesAhead);
                break;
            case 'lobber':
                this.updateLobber(dt, speed, engine, pos, zombiesAhead);
                break;
            case 'producer':
                this.updateProducer(dt, speed, engine, pos);
                break;
            case 'mine':
                this.updateMine(dt, speed, engine, pos, zombiesInRow);
                break;
            case 'chomper':
                this.updateChomper(dt, speed, engine, pos, zombiesAhead);
                break;
            case 'spike':
                this.updateSpike(dt, speed, engine, pos, zombiesInRow);
                break;
            case 'starfruit':
                this.updateStarfruit(dt, speed, engine, pos, zombiesInRow);
                break;
            case 'magnet':
                this.updateMagnet(dt, speed, engine, pos);
                break;
            case 'squash':
                this.updateSquash(dt, speed, engine, pos, zombiesAhead);
                break;
            case 'instant_row':
                if (!this.fired) {
                    this.fired = true;
                    this.instantRow(engine, pos);
                }
                break;
            case 'instant_bomb':
                if (!this.fired) {
                    this.fired = true;
                    this.instantBomb(engine, pos);
                }
                break;
            case 'torch':
            case 'wall':
            case 'armor':
                // 被动类型，无需更新
                break;
        }
    }

    updateShooter(dt, speed, engine, pos, zombiesAhead) {
        if (zombiesAhead.length === 0) return;
        this.attackTimer += dt * speed;
        if (this.attackTimer >= this.data.attackInterval) {
            this.attackTimer = 0;
            const shots = this.data.shots || 1;
            for (let i = 0; i < shots; i++) {
                setTimeout(() => {
                    if (!this.active) return;
                    // 始终以原始弹药类型发射，火炬转化在飞行中处理
                    engine.projectileManager.spawn(this.data.projectile, pos.x + 20, pos.y, this.row);
                }, i * 150);
            }

            // 三线射手 - 同时向相邻行发射
            if (this.data.threeRow) {
                [-1, 1].forEach(offset => {
                    const targetRow = this.row + offset;
                    if (targetRow >= 0 && targetRow < GAME_CONFIG.ROWS) {
                        const adjY = pos.y + offset * GAME_CONFIG.CELL_HEIGHT;
                        engine.projectileManager.spawn(this.data.projectile, pos.x + 20, adjY, targetRow);
                    }
                });
            }
        }
    }

    updateLobber(dt, speed, engine, pos, zombiesAhead) {
        if (zombiesAhead.length === 0) return;
        this.attackTimer += dt * speed;
        if (this.attackTimer >= this.data.attackInterval) {
            this.attackTimer = 0;
            // 找最近的僵尸
            const target = zombiesAhead.reduce((a, b) => a.x < b.x ? a : b);
            engine.projectileManager.spawn(this.data.projectile, pos.x, pos.y, this.row, target.x);
        }
    }

    updateProducer(dt, speed, engine, pos) {
        this.sunTimer += dt * speed;
        if (this.sunTimer >= this.data.sunInterval) {
            this.sunTimer = 0;
            engine.sunManager.spawnPlantSun(pos.x, pos.y, this.data.sunAmount);
        }
    }

    updateMine(dt, speed, engine, pos, zombiesInRow) {
        if (!this.armed) {
            this.armTimer += dt * speed;
            if (this.armTimer >= this.data.armTime) {
                this.armed = true;
            }
            return;
        }
        // 检测僵尸踩到（在格子范围内）
        const cfg = GAME_CONFIG;
        for (const z of zombiesInRow) {
            if (!z.active) continue;
            if (Math.abs(z.x - pos.x) < cfg.CELL_WIDTH * 0.6) {
                z.takeDamage(this.data.explodeDamage);
                engine.addExplosion(pos.x, pos.y, 60, '#C4A265', '#8B6914', 500);
                this.active = false;
                soundManager.playExplosion();
                Toast.info('💥 土豆雷爆炸！');
                return;
            }
        }
    }

    updateChomper(dt, speed, engine, pos, zombiesAhead) {
        if (this.chewing) {
            this.chewTimer += dt * speed;
            if (this.chewTimer >= this.data.attackInterval) {
                this.chewing = false;
                this.chewTimer = 0;
            }
            return;
        }
        for (const z of zombiesAhead) {
            if (Math.abs(z.x - pos.x) < GAME_CONFIG.CELL_WIDTH) {
                z.takeDamage(this.data.chompDamage);
                this.chewing = true;
                this.chewTimer = 0;
                return;
            }
        }
    }

    updateSpike(dt, speed, engine, pos, zombiesInRow) {
        this.spikeTimer += dt * speed;
        if (this.spikeTimer >= this.data.spikeInterval) {
            this.spikeTimer = 0;
            for (const z of zombiesInRow) {
                if (Math.abs(z.x - pos.x) < GAME_CONFIG.CELL_WIDTH / 2) {
                    z.takeDamage(this.data.spikeDamage);
                }
            }
        }
    }

    updateStarfruit(dt, speed, engine, pos) {
        const allZombies = engine.zombieManager.zombies.filter(z => z.active);
        if (allZombies.length === 0) return;
        this.attackTimer += dt * speed;
        if (this.attackTimer >= this.data.attackInterval) {
            this.attackTimer = 0;
            // 五个方向
            const directions = [
                { dx: 4, dy: 0 },
                { dx: -4, dy: 0 },
                { dx: 0, dy: -4 },
                { dx: 3, dy: -3 },
                { dx: 3, dy: 3 }
            ];
            directions.forEach(d => {
                engine.projectileManager.spawnStar(pos.x, pos.y, this.row, d.dx, d.dy);
            });
        }
    }

    updateMagnet(dt, speed, engine, pos) {
        this.magnetTimer += dt * speed;
        if (this.magnetTimer >= this.data.magnetInterval) {
            // 吸走金属防具
            const zombies = engine.zombieManager.zombies.filter(z =>
                z.active && z.data.metalArmor && z.armorHp > 0 &&
                Helpers.distance(pos.x, pos.y, z.x, z.getY()) < GAME_CONFIG.CELL_WIDTH * 4
            );
            if (zombies.length > 0) {
                this.magnetTimer = 0;
                const target = zombies[0];
                // 吸走护甲后，将hp降至基础血量（总hp - 护甲hp）
                const baseHp = target.data.hp - target.data.armorHp;
                target.hp = Math.min(target.hp, baseHp);
                target.armorHp = 0;
                Toast.success('🧲 磁力菇吸走了防具！');
            }
        }
    }

    updateSquash(dt, speed, engine, pos, zombiesAhead) {
        if (this.jumping) {
            this.jumpTimer += dt * speed;
            if (this.jumpTimer > 500 && this.jumpTarget) {
                if (this.jumpTarget.active) {
                    this.jumpTarget.takeDamage(this.data.squashDamage);
                }
                engine.addExplosion(this.jumpTarget.x, pos.y, 40, '#556B2F', '#228B22', 400);
                soundManager.playExplosion();
                this.active = false;
            }
            return;
        }
        for (const z of zombiesAhead) {
            if (!z.active) continue;
            if (Math.abs(z.x - pos.x) < GAME_CONFIG.CELL_WIDTH * 2) {
                this.jumping = true;
                this.jumpTarget = z;
                this.jumpTimer = 0;
                return;
            }
        }
    }

    instantRow(engine, pos) {
        // 火爆辣椒 - 整行伤害
        const zombies = engine.zombieManager.getZombiesInRow(this.row);
        zombies.forEach(z => z.takeDamage(this.data.rowDamage));
        // 火焰效果
        const cfg = GAME_CONFIG;
        for (let c = 0; c < cfg.COLS; c++) {
            const fx = cfg.GRID_OFFSET_X + c * cfg.CELL_WIDTH + cfg.CELL_WIDTH / 2;
            engine.addExplosion(fx, pos.y, 40, '#FF4500', '#FF6B35', 600);
        }
        soundManager.playExplosion();
        Toast.info('🌶️ 火爆辣椒燃烧了整行！');
        this.active = false;
    }

    instantBomb(engine, pos) {
        // 樱桃炸弹 - 范围伤害
        const cfg = GAME_CONFIG;
        const radius = this.data.explodeRadius;
        engine.zombieManager.zombies.forEach(z => {
            if (!z.active) return;
            if (Math.abs(z.row - this.row) <= radius) {
                const zPos = z.x;
                if (Math.abs(zPos - pos.x) < cfg.CELL_WIDTH * (radius + 1)) {
                    z.takeDamage(this.data.explodeDamage);
                }
            }
        });
        engine.addExplosion(pos.x, pos.y, 80, '#DC143C', '#FF4500', 700);
        soundManager.playExplosion();
        Toast.info('🍒 樱桃炸弹爆炸！');
        this.active = false;
    }

    takeDamage(amount) {
        if (this.armorHp > 0) {
            this.armorHp -= amount;
            if (this.armorHp < 0) {
                this.hp += this.armorHp;
                this.armorHp = 0;
            }
        } else {
            this.hp -= amount;
        }
        if (this.hp <= 0) {
            this.active = false;
        }
    }
}

/**
 * 植物管理器
 */
class PlantManager {
    constructor(engine) {
        this.engine = engine;
        this.grid = []; // [row][col]
    }

    reset() {
        this.grid = [];
        for (let r = 0; r < GAME_CONFIG.ROWS; r++) {
            this.grid[r] = [];
            for (let c = 0; c < GAME_CONFIG.COLS; c++) {
                this.grid[r][c] = null;
            }
        }
    }

    place(plantData, row, col) {
        if (this.grid[row][col] !== null) {
            // 南瓜头可以套在其他植物上
            if (plantData.type === 'armor' && this.grid[row][col].data.type !== 'armor') {
                this.grid[row][col].armorHp = plantData.hp;
                return true;
            }
            return false;
        }
        this.grid[row][col] = new PlantEntity(plantData, row, col);
        return true;
    }

    remove(row, col) {
        this.grid[row][col] = null;
    }

    getPlant(row, col) {
        return this.grid[row][col];
    }

    hasTorchAhead(row, col) {
        for (let c = col + 1; c < GAME_CONFIG.COLS; c++) {
            const p = this.grid[row][c];
            if (p && p.active && p.data.type === 'torch') return true;
        }
        return false;
    }

    /** 检测弹药当前x位置是否正在经过火炬树桩 */
    getTorchAt(row, x) {
        const cfg = GAME_CONFIG;
        for (let c = 0; c < cfg.COLS; c++) {
            const p = this.grid[row][c];
            if (p && p.active && p.data.type === 'torch') {
                const torchX = cfg.GRID_OFFSET_X + c * cfg.CELL_WIDTH + cfg.CELL_WIDTH / 2;
                if (Math.abs(x - torchX) < cfg.CELL_WIDTH * 0.4) {
                    return p;
                }
            }
        }
        return null;
    }

    update(dt, speed) {
        for (let r = 0; r < GAME_CONFIG.ROWS; r++) {
            for (let c = 0; c < GAME_CONFIG.COLS; c++) {
                const plant = this.grid[r][c];
                if (plant && plant.active) {
                    plant.update(dt, speed, this.engine);
                } else if (plant && !plant.active) {
                    this.grid[r][c] = null;
                }
            }
        }
    }

    draw(ctx) {
        const cfg = GAME_CONFIG;
        for (let r = 0; r < cfg.ROWS; r++) {
            for (let c = 0; c < cfg.COLS; c++) {
                const plant = this.grid[r][c];
                if (plant && plant.active) {
                    const x = cfg.GRID_OFFSET_X + c * cfg.CELL_WIDTH;
                    const y = cfg.GRID_OFFSET_Y + r * cfg.CELL_HEIGHT;
                    PlantRenderer.draw(ctx, plant, x, y, cfg.CELL_WIDTH, cfg.CELL_HEIGHT);
                }
            }
        }
    }
}
