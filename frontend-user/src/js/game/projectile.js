/**
 * 弹药系统
 */
class ProjectileManager {
    constructor(engine) {
        this.engine = engine;
        this.projectiles = [];
    }

    reset() {
        this.projectiles = [];
    }

    spawn(type, x, y, row, targetX) {
        const pType = PROJECTILE_TYPES[type];
        const proj = {
            type: type,
            x: x,
            y: y,
            row: row,
            active: true,
            groundY: y
        };

        if (pType.lob && targetX !== undefined) {
            proj.startX = x;
            proj.startY = y;
            proj.targetX = targetX;
            proj.groundY = y;
            proj.lobProgress = 0;
        }

        if (pType.diagonal) {
            proj.dx = 0;
            proj.dy = 0;
            proj.isMultiRow = true; // 星星可以跨行命中
        }

        this.projectiles.push(proj);
        return proj;
    }

    spawnStar(x, y, row, dx, dy) {
        const proj = this.spawn('STAR', x, y, row);
        proj.dx = dx;
        proj.dy = dy;
        return proj;
    }

    update(dt, speed, zombies, cfg) {
        this.projectiles.forEach(p => {
            if (!p.active) return;
            const pType = PROJECTILE_TYPES[p.type];

            if (pType.lob && p.targetX !== undefined) {
                // 抛物线运动
                p.lobProgress += (pType.speed * speed * 0.015);
                if (p.lobProgress >= 1) p.lobProgress = 1;

                const t = p.lobProgress;
                p.x = p.startX + (p.targetX - p.startX) * t;
                const height = -200 * t * (1 - t);
                p.y = p.groundY + height;

                if (p.lobProgress >= 1) {
                    this.lobHit(p, zombies, pType);
                    p.active = false;
                }
            } else if (pType.diagonal && (p.dx !== 0 || p.dy !== 0)) {
                // 星星 - 多方向
                p.x += p.dx * pType.speed * speed;
                p.y += p.dy * pType.speed * speed;
            } else {
                // 直线弹药
                p.x += pType.speed * speed;

                // 豌豆经过火炬树桩时转化为火焰豌豆
                if (p.type === 'PEA' || p.type === 'FROZEN_PEA') {
                    const torchPlant = this.engine.plantManager.getTorchAt(p.row, p.x);
                    if (torchPlant) {
                        p.type = 'FIRE_PEA';
                    }
                }
            }

            // 超出屏幕
            if (p.x > cfg.GRID_OFFSET_X + cfg.COLS * cfg.CELL_WIDTH + 50 ||
                p.x < -50 || p.y < -50 || p.y > cfg.GRID_OFFSET_Y + cfg.ROWS * cfg.CELL_HEIGHT + 50) {
                p.active = false;
                return;
            }

            // 碰撞检测（非抛物线）
            if (!pType.lob) {
                this.checkHit(p, zombies, pType, cfg);
            }
        });

        this.projectiles = this.projectiles.filter(p => p.active);
    }

    checkHit(p, zombies, pType, cfg) {
        // 弹药类型转化后需要重新获取属性
        const currentType = PROJECTILE_TYPES[p.type];
        const damage = currentType ? currentType.damage : pType.damage;
        const slow = currentType ? currentType.slow : pType.slow;

        for (const z of zombies) {
            if (!z.active) continue;

            if (p.isMultiRow) {
                const zy = z.getY();
                if (Math.abs(z.x - p.x) < 20 && Math.abs(zy - p.y) < cfg.CELL_HEIGHT * 0.4) {
                    z.takeDamage(damage);
                    if (slow) z.applySlow(slow, 3000);
                    p.active = false;
                    return;
                }
            } else {
                if (z.row !== p.row) continue;
                if (Math.abs(z.x - p.x) < 20) {
                    z.takeDamage(damage);
                    if (slow) z.applySlow(slow, 3000);
                    p.active = false;
                    if (currentType && currentType.splash) {
                        this.splashDamage(p.x, p.y, p.row, currentType.splash, damage * 0.5, zombies);
                    }
                    return;
                }
            }
        }
    }

    lobHit(p, zombies, pType) {
        let hit = false;
        for (const z of zombies) {
            if (!z.active || z.row !== p.row) continue;
            if (Math.abs(z.x - p.x) < 25) {
                z.takeDamage(pType.damage);
                hit = true;
                if (pType.splash) {
                    this.splashDamage(p.x, p.groundY, p.row, pType.splash, pType.damage * 0.5, zombies);
                }
                break;
            }
        }
        if (hit) {
            this.engine.addExplosion(p.x, p.groundY, 20, '#FFD700', '#FF8C00', 300);
        }
    }

    splashDamage(x, y, row, radius, damage, zombies) {
        zombies.forEach(z => {
            if (!z.active) return;
            if (Math.abs(z.row - row) <= 1 && Math.abs(z.x - x) < radius) {
                z.takeDamage(damage);
            }
        });
        this.engine.addExplosion(x, y, radius, 'rgba(255,200,0,0.5)', 'rgba(255,100,0,0.3)', 400);
    }
}
