/**
 * 阳光系统
 */
class SunManager {
    constructor(engine) {
        this.engine = engine;
        this.suns = [];
        this.skyTimer = 0;
    }

    reset() {
        this.suns = [];
        this.skyTimer = 0;
    }

    update(dt, speed) {
        const cfg = GAME_CONFIG;
        this.skyTimer += dt * speed;

        // 天空掉落阳光
        if (this.skyTimer >= cfg.SKY_SUN_INTERVAL) {
            this.skyTimer = 0;
            this.spawnSkySun();
        }

        // 更新阳光位置
        this.suns.forEach(sun => {
            if (!sun.active) return;

            if (sun.collecting) {
                // 飞向计数器
                const dx = sun.targetX - sun.x;
                const dy = sun.targetY - sun.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 10) {
                    sun.active = false;
                    this.engine.addSun(sun.value);
                } else {
                    sun.x += (dx / dist) * 8;
                    sun.y += (dy / dist) * 8;
                    sun.size *= 0.97;
                }
            } else if (sun.falling) {
                if (sun.fromPlant) {
                    // 向日葵阳光 - 向目标点飞行
                    const dx = sun.targetX - sun.x;
                    const dy = sun.targetY - sun.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 2) {
                        sun.x = sun.targetX;
                        sun.y = sun.targetY;
                        sun.falling = false;
                        sun.lifeTimer = 0;
                    } else {
                        const spd = Math.max(1.5, dist * 0.06) * speed;
                        sun.x += (dx / dist) * spd;
                        sun.y += (dy / dist) * spd;
                    }
                } else {
                    // 天空阳光 - 垂直掉落
                    sun.y += 0.8 * speed;
                    if (sun.y >= sun.targetY) {
                        sun.y = sun.targetY;
                        sun.falling = false;
                        sun.lifeTimer = 0;
                    }
                }
            } else {
                sun.lifeTimer += dt * speed;
                // 阳光闪烁后消失
                if (sun.lifeTimer > 6000) {
                    sun.active = false;
                } else if (sun.lifeTimer > 4500) {
                    sun.size = 32 + Math.sin(sun.lifeTimer * 0.01) * 6;
                }
            }
        });

        // 清理
        this.suns = this.suns.filter(s => s.active);
    }

    spawnSkySun() {
        const cfg = GAME_CONFIG;
        const x = Helpers.randInt(
            cfg.GRID_OFFSET_X + cfg.CELL_WIDTH,
            cfg.GRID_OFFSET_X + (cfg.COLS - 1) * cfg.CELL_WIDTH
        );
        this.suns.push({
            x: x,
            y: cfg.GRID_OFFSET_Y,
            targetX: x,
            targetY: Helpers.randInt(
                cfg.GRID_OFFSET_Y + cfg.CELL_HEIGHT,
                cfg.GRID_OFFSET_Y + (cfg.ROWS - 2) * cfg.CELL_HEIGHT
            ),
            value: cfg.SKY_SUN_VALUE,
            size: 36,
            active: true,
            falling: true,
            collecting: false,
            showValue: false,
            lifeTimer: 0
        });
    }

    spawnPlantSun(x, y, value) {
        const cfg = GAME_CONFIG;
        // 在向日葵所在格子内随机，不超出格子边界
        const angle = Math.random() * Math.PI * 2;
        const maxR = Math.min(cfg.CELL_WIDTH, cfg.CELL_HEIGHT) * 0.35;
        const radius = maxR * 0.4 + Math.random() * maxR * 0.6;
        const targetX = x + Math.cos(angle) * radius;
        const targetY = y + Math.sin(angle) * radius;
        this.suns.push({
            x: x,
            y: y,
            targetX: targetX,
            targetY: targetY,
            value: value,
            size: 32,
            active: true,
            falling: true,
            fromPlant: true,
            collecting: false,
            showValue: false,
            lifeTimer: 0
        });
    }

    tryCollect(mx, my) {
        for (const sun of this.suns) {
            if (!sun.active || sun.collecting) continue;
            const dist = Helpers.distance(mx, my, sun.x, sun.y);
            const hitRadius = sun.size * 0.6;
            if (dist < hitRadius) {
                sun.collecting = true;
                sun.showValue = true;
                // 飞向画布顶部中央（阳光计数器在 canvas 上方，用 canvas 内坐标）
                const canvas = document.getElementById('game-canvas');
                sun.targetX = canvas.width / 2;
                sun.targetY = 0;
                return true;
            }
        }
        return false;
    }
}
