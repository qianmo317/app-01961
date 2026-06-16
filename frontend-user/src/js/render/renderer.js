/**
 * 主渲染器 - 负责画布和草坪渲染
 * 优化：离屏缓存、自适应布局、批量绘制
 */
class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        // 离屏画布 - 缓存静态草坪
        this.lawnCanvas = document.createElement('canvas');
        this.lawnCtx = this.lawnCanvas.getContext('2d');
        this.lawnDirty = true;

        this.ctx.imageSmoothingEnabled = false;

        this.resize();
    }

    resize() {
        const wrapper = this.canvas.parentElement;
        const topbar = document.querySelector('.game-topbar');
        const plantbar = document.querySelector('.plant-bar');
        const topH = topbar ? topbar.offsetHeight : 48;
        const barH = plantbar ? plantbar.offsetHeight : 72;
        this.canvas.width = wrapper.offsetWidth;
        this.canvas.height = wrapper.offsetHeight - topH - barH;

        const cfg = GAME_CONFIG;
        const cw = this.canvas.width;
        const ch = this.canvas.height;

        // 布局比例：左侧房子区 5%，草坪区 75%，右侧泥土区 20%
        const houseRatio = 0.05;
        const lawnRatio = 0.75;
        // 垂直方向留上下边距各 3%
        const vertPad = Math.floor(ch * 0.03);

        const lawnAreaW = Math.floor(cw * lawnRatio);
        const lawnAreaH = ch - vertPad * 2;

        // 根据可用区域计算格子大小，取宽高中较小值做正方形
        const cellByW = Math.floor(lawnAreaW / cfg.COLS);
        const cellByH = Math.floor(lawnAreaH / cfg.ROWS);
        const cellSize = Math.min(cellByW, cellByH);
        cfg.CELL_WIDTH = cellSize;
        cfg.CELL_HEIGHT = cellSize;

        // 实际草坪总尺寸
        const gridW = cfg.COLS * cfg.CELL_WIDTH;
        const gridH = cfg.ROWS * cfg.CELL_HEIGHT;

        // 水平：房子区域后开始，草坪在剩余空间中居中偏左
        const houseW = Math.max(40, Math.floor(cw * houseRatio));
        const rightZoneW = Math.max(60, Math.floor(cw * 0.15));
        const availW = cw - houseW - rightZoneW;
        cfg.GRID_OFFSET_X = houseW + Math.max(0, Math.floor((availW - gridW) / 2));

        // 垂直居中
        cfg.GRID_OFFSET_Y = Math.max(vertPad, Math.floor((ch - gridH) / 2));

        // 同步离屏画布
        this.lawnCanvas.width = cw;
        this.lawnCanvas.height = ch;
        this.lawnDirty = true;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawLawn() {
        if (this.lawnDirty) {
            this._renderLawnToCache();
            this.lawnDirty = false;
        }
        this.ctx.drawImage(this.lawnCanvas, 0, 0);
    }

    _renderLawnToCache() {
        const ctx = this.lawnCtx;
        const cfg = GAME_CONFIG;
        const w = this.lawnCanvas.width;
        const h = this.lawnCanvas.height;

        const gridW = cfg.COLS * cfg.CELL_WIDTH;
        const gridH = cfg.ROWS * cfg.CELL_HEIGHT;
        const gridRight = cfg.GRID_OFFSET_X + gridW;
        const gridBottom = cfg.GRID_OFFSET_Y + gridH;

        ctx.clearRect(0, 0, w, h);

        // 整体背景 - 深绿色
        ctx.fillStyle = '#2d5a18';
        ctx.fillRect(0, 0, w, h);

        // 左侧房子区域 - 带渐变
        const houseGrad = ctx.createLinearGradient(0, 0, cfg.GRID_OFFSET_X, 0);
        houseGrad.addColorStop(0, '#1a3a0e');
        houseGrad.addColorStop(0.7, '#2d5a18');
        houseGrad.addColorStop(1, '#3a6e20');
        ctx.fillStyle = houseGrad;
        ctx.fillRect(0, cfg.GRID_OFFSET_Y, cfg.GRID_OFFSET_X, gridH);

        // 房子图标 - 每行一个小房子
        ctx.font = `${Math.min(20, cfg.CELL_HEIGHT * 0.25)}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        for (let r = 0; r < cfg.ROWS; r++) {
            const hy = cfg.GRID_OFFSET_Y + r * cfg.CELL_HEIGHT + cfg.CELL_HEIGHT / 2;
            ctx.fillText('🏠', cfg.GRID_OFFSET_X / 2, hy);
        }

        // 草坪背景（格子区域外围微光）
        ctx.fillStyle = cfg.LAWN_BG;
        ctx.fillRect(cfg.GRID_OFFSET_X, cfg.GRID_OFFSET_Y, gridW, gridH);

        // 草坪格子 - 批量绘制同色格子
        for (let colorIdx = 0; colorIdx < 2; colorIdx++) {
            ctx.fillStyle = cfg.LAWN_COLORS[colorIdx];
            for (let r = 0; r < cfg.ROWS; r++) {
                for (let c = 0; c < cfg.COLS; c++) {
                    if ((r + c) % 2 !== colorIdx) continue;
                    const x = cfg.GRID_OFFSET_X + c * cfg.CELL_WIDTH;
                    const y = cfg.GRID_OFFSET_Y + r * cfg.CELL_HEIGHT;
                    ctx.fillRect(x, y, cfg.CELL_WIDTH, cfg.CELL_HEIGHT);
                }
            }
        }

        // 格子内阴影边框
        ctx.strokeStyle = 'rgba(0,0,0,0.08)';
        ctx.lineWidth = 1;
        for (let r = 0; r < cfg.ROWS; r++) {
            for (let c = 0; c < cfg.COLS; c++) {
                const x = cfg.GRID_OFFSET_X + c * cfg.CELL_WIDTH;
                const y = cfg.GRID_OFFSET_Y + r * cfg.CELL_HEIGHT;
                ctx.strokeRect(x + 0.5, y + 0.5, cfg.CELL_WIDTH - 1, cfg.CELL_HEIGHT - 1);
            }
        }

        // 草地高光点缀
        ctx.fillStyle = 'rgba(255,255,255,0.04)';
        ctx.beginPath();
        for (let r = 0; r < cfg.ROWS; r++) {
            for (let c = 0; c < cfg.COLS; c++) {
                const x = cfg.GRID_OFFSET_X + c * cfg.CELL_WIDTH;
                const y = cfg.GRID_OFFSET_Y + r * cfg.CELL_HEIGHT;
                ctx.moveTo(x + cfg.CELL_WIDTH * 0.3 + 2, y + cfg.CELL_HEIGHT * 0.6);
                ctx.arc(x + cfg.CELL_WIDTH * 0.3, y + cfg.CELL_HEIGHT * 0.6, 2, 0, Math.PI * 2);
                ctx.moveTo(x + cfg.CELL_WIDTH * 0.7 + 1.5, y + cfg.CELL_HEIGHT * 0.35);
                ctx.arc(x + cfg.CELL_WIDTH * 0.7, y + cfg.CELL_HEIGHT * 0.35, 1.5, 0, Math.PI * 2);
            }
        }
        ctx.fill();

        // 草坪顶部高光边
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cfg.GRID_OFFSET_X, cfg.GRID_OFFSET_Y + 0.5);
        ctx.lineTo(gridRight, cfg.GRID_OFFSET_Y + 0.5);
        ctx.stroke();

        // 草坪底部阴影边
        ctx.strokeStyle = 'rgba(0,0,0,0.15)';
        ctx.beginPath();
        ctx.moveTo(cfg.GRID_OFFSET_X, gridBottom - 0.5);
        ctx.lineTo(gridRight, gridBottom - 0.5);
        ctx.stroke();

        // 右侧僵尸出生区 - 深绿草地
        const rightW = w - gridRight;
        const dirtGrad = ctx.createLinearGradient(gridRight, 0, w, 0);
        dirtGrad.addColorStop(0, '#3a6e20');
        dirtGrad.addColorStop(0.3, '#336618');
        dirtGrad.addColorStop(1, '#2d5a18');
        ctx.fillStyle = dirtGrad;
        ctx.fillRect(gridRight, cfg.GRID_OFFSET_Y, rightW, gridH);

        // 草地纹理
        ctx.fillStyle = 'rgba(0,0,0,0.04)';
        for (let r = 0; r < cfg.ROWS; r++) {
            const ry = cfg.GRID_OFFSET_Y + r * cfg.CELL_HEIGHT;
            for (let i = 0; i < 3; i++) {
                const rx = gridRight + 10 + i * Math.floor(rightW / 3);
                const rw = 8 + Math.random() * 12;
                ctx.fillRect(rx, ry + cfg.CELL_HEIGHT * 0.3, rw, 2);
                ctx.fillRect(rx + 5, ry + cfg.CELL_HEIGHT * 0.6, rw * 0.7, 1.5);
            }
        }

        // 行分隔线（泥土区域）
        ctx.strokeStyle = 'rgba(0,0,0,0.12)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let r = 1; r < cfg.ROWS; r++) {
            const ly = cfg.GRID_OFFSET_Y + r * cfg.CELL_HEIGHT;
            ctx.moveTo(gridRight, ly);
            ctx.lineTo(w, ly);
        }
        ctx.stroke();

        // 草坪与右侧的过渡边
        ctx.strokeStyle = 'rgba(0,0,0,0.1)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(gridRight, cfg.GRID_OFFSET_Y);
        ctx.lineTo(gridRight, gridBottom);
        ctx.stroke();

        // 上下空白区域 - 深绿色
        const topGrad = ctx.createLinearGradient(0, 0, 0, cfg.GRID_OFFSET_Y);
        topGrad.addColorStop(0, '#1a3a0e');
        topGrad.addColorStop(1, '#2d5a18');
        ctx.fillStyle = topGrad;
        ctx.fillRect(0, 0, w, cfg.GRID_OFFSET_Y);

        const botGrad = ctx.createLinearGradient(0, gridBottom, 0, h);
        botGrad.addColorStop(0, '#2d5a18');
        botGrad.addColorStop(1, '#1a3a0e');
        ctx.fillStyle = botGrad;
        ctx.fillRect(0, gridBottom, w, h - gridBottom);

        // 左侧上下补齐
        ctx.fillStyle = '#1a3a0e';
        ctx.fillRect(0, 0, cfg.GRID_OFFSET_X, cfg.GRID_OFFSET_Y);
        ctx.fillRect(0, gridBottom, cfg.GRID_OFFSET_X, h - gridBottom);
    }

    drawSuns(suns) {
        const ctx = this.ctx;

        for (let i = 0; i < suns.length; i++) {
            const sun = suns[i];
            if (!sun.active) continue;

            const r = sun.size * 0.48;
            const petalCount = 10;
            const petalDepth = r * 0.22;

            ctx.save();

            // 柔和外发光
            ctx.shadowColor = 'rgba(255,180,0,0.35)';
            ctx.shadowBlur = 8;

            // 花瓣形外圈（橙色波浪边缘）
            ctx.fillStyle = '#F57C00';
            ctx.beginPath();
            for (let p = 0; p < petalCount; p++) {
                const a1 = (p / petalCount) * Math.PI * 2;
                const a2 = ((p + 0.5) / petalCount) * Math.PI * 2;
                const outerR = r + petalDepth;
                const innerR = r - petalDepth * 0.15;
                if (p === 0) {
                    ctx.moveTo(sun.x + Math.cos(a1) * outerR, sun.y + Math.sin(a1) * outerR);
                }
                ctx.quadraticCurveTo(
                    sun.x + Math.cos((a1 + a2) / 2) * innerR,
                    sun.y + Math.sin((a1 + a2) / 2) * innerR,
                    sun.x + Math.cos(a2) * outerR,
                    sun.y + Math.sin(a2) * outerR
                );
            }
            ctx.closePath();
            ctx.fill();

            ctx.shadowBlur = 0;

            // 内圈黄色渐变球体
            const innerR = r * 0.78;
            const innerGrad = ctx.createRadialGradient(
                sun.x - innerR * 0.15, sun.y - innerR * 0.2, innerR * 0.1,
                sun.x, sun.y, innerR
            );
            innerGrad.addColorStop(0, '#FFF9C4');
            innerGrad.addColorStop(0.4, '#FFE082');
            innerGrad.addColorStop(0.8, '#FFB300');
            innerGrad.addColorStop(1, '#F9A825');
            ctx.fillStyle = innerGrad;
            ctx.beginPath();
            ctx.arc(sun.x, sun.y, innerR, 0, Math.PI * 2);
            ctx.fill();

            // 高光月牙
            ctx.fillStyle = 'rgba(255,255,255,0.25)';
            ctx.beginPath();
            ctx.ellipse(sun.x - innerR * 0.15, sun.y - innerR * 0.2, innerR * 0.4, innerR * 0.28, -0.3, 0, Math.PI * 2);
            ctx.fill();

            // 阳光值文字 - 始终显示
            const label = `+${sun.value}`;
            const fontSize = Math.max(9, Math.floor(r * 0.62));
            ctx.font = `bold ${fontSize}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.strokeStyle = 'rgba(120,60,0,0.25)';
            ctx.lineWidth = 1.5;
            ctx.strokeText(label, sun.x, sun.y + 1);
            ctx.fillStyle = '#5D4037';
            ctx.fillText(label, sun.x, sun.y + 1);

            ctx.restore();
        }
    }

    drawProjectiles(projectiles) {
        const ctx = this.ctx;

        const groups = {};
        for (let i = 0; i < projectiles.length; i++) {
            const p = projectiles[i];
            if (!p.active) continue;
            if (!groups[p.type]) groups[p.type] = [];
            groups[p.type].push(p);
        }

        const types = Object.keys(groups);
        for (let t = 0; t < types.length; t++) {
            const typeName = types[t];
            const pType = PROJECTILE_TYPES[typeName];
            const list = groups[typeName];

            ctx.save();
            ctx.fillStyle = pType.color;

            if (pType.lob) {
                ctx.globalAlpha = 0.3;
                ctx.beginPath();
                for (let i = 0; i < list.length; i++) {
                    const p = list[i];
                    ctx.moveTo(p.x + pType.radius * 0.6, p.groundY);
                    ctx.arc(p.x, p.groundY, pType.radius * 0.6, 0, Math.PI * 2);
                }
                ctx.fill();

                ctx.globalAlpha = 1;
                ctx.beginPath();
                for (let i = 0; i < list.length; i++) {
                    const p = list[i];
                    ctx.moveTo(p.x + pType.radius, p.y);
                    ctx.arc(p.x, p.y, pType.radius, 0, Math.PI * 2);
                }
                ctx.fill();
            } else if (typeName === 'FROZEN_PEA') {
                ctx.beginPath();
                for (let i = 0; i < list.length; i++) {
                    const p = list[i];
                    ctx.moveTo(p.x + pType.radius, p.y);
                    ctx.arc(p.x, p.y, pType.radius, 0, Math.PI * 2);
                }
                ctx.fill();
                ctx.strokeStyle = '#B0E0E6';
                ctx.lineWidth = 1;
                ctx.stroke();
            } else if (typeName === 'FIRE_PEA') {
                ctx.shadowColor = '#FF4500';
                ctx.shadowBlur = 6;
                ctx.beginPath();
                for (let i = 0; i < list.length; i++) {
                    const p = list[i];
                    ctx.moveTo(p.x + pType.radius, p.y);
                    ctx.arc(p.x, p.y, pType.radius, 0, Math.PI * 2);
                }
                ctx.fill();
            } else if (typeName === 'NEEDLE') {
                // 仙人掌尖刺 - 细长菱形
                for (let i = 0; i < list.length; i++) {
                    const p = list[i];
                    ctx.beginPath();
                    ctx.moveTo(p.x + 8, p.y);       // 尖端（右）
                    ctx.lineTo(p.x, p.y - 2.5);     // 上
                    ctx.lineTo(p.x - 4, p.y);       // 尾部（左）
                    ctx.lineTo(p.x, p.y + 2.5);     // 下
                    ctx.closePath();
                    ctx.fill();
                }
            } else {
                ctx.beginPath();
                for (let i = 0; i < list.length; i++) {
                    const p = list[i];
                    ctx.moveTo(p.x + pType.radius, p.y);
                    ctx.arc(p.x, p.y, pType.radius, 0, Math.PI * 2);
                }
                ctx.fill();
            }

            ctx.restore();
        }
    }

    drawExplosions(explosions) {
        const ctx = this.ctx;
        for (let i = 0; i < explosions.length; i++) {
            const e = explosions[i];
            if (!e.active) continue;
            const progress = e.timer / e.duration;
            const alpha = 1 - progress;
            const radius = e.radius * (0.5 + progress * 0.5);

            ctx.save();
            ctx.globalAlpha = alpha;
            const gradient = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, radius);
            gradient.addColorStop(0, e.color || '#FF6B35');
            gradient.addColorStop(0.5, e.color2 || '#FF4500');
            gradient.addColorStop(1, 'rgba(255,69,0,0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(e.x, e.y, radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    drawParticles(particles) {
        if (!particles || particles.length === 0) return;
        const ctx = this.ctx;

        const groups = {};
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            if (!p.active) continue;
            if (!groups[p.color]) groups[p.color] = [];
            groups[p.color].push(p);
        }

        const colors = Object.keys(groups);
        for (let c = 0; c < colors.length; c++) {
            const color = colors[c];
            const list = groups[color];
            ctx.fillStyle = color;

            for (let i = 0; i < list.length; i++) {
                const p = list[i];
                const alpha = Math.max(0, p.life / 800);
                ctx.globalAlpha = alpha;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        ctx.globalAlpha = 1;
    }
}
