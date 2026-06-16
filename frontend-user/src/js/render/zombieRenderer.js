/**
 * 僵尸渲染器 - 分层绘制
 * 层1: SVG下半身（腿/裤/鞋）
 * 层2: emoji上半身（🧟/👹 自带头+肩+手）
 * 层3: 装备叠加（锥桶/铁桶/头盔/报纸/撑杆/铁门/电线杆/爆炸头）
 */
class ZombieRenderer {
    static _cache = {};

    /** 每种僵尸的渲染配置 */
    static CONFIG = {
        normal:     { legs: 'normal', emoji: '🧟', equips: [] },
        cone:       { legs: 'normal', emoji: '🧟', equips: ['cone'] },
        bucket:     { legs: 'normal', emoji: '🧟', equips: ['bucket'] },
        newspaper:  { legs: 'normal', emoji: '🧟', equips: ['newspaper'] },
        polevault:  { legs: 'normal', emoji: '🧟', equips: ['pole'] },
        screen:     { legs: 'normal', emoji: '🧟', equips: ['screendoor'] },
        football:   { legs: 'heavy',  emoji: '🧟', equips: ['helmet'] },
        dancer:     { legs: 'dancer', emoji: '🧟', equips: ['afro'] },
        imp:        { legs: 'small',  emoji: '👹', equips: [] },
        gargantuar: { legs: 'heavy',  emoji: '🧟', equips: ['telephone'] }
    };

    static getIcon(emoji, size) {
        const key = emoji + '|' + size;
        if (ZombieRenderer._cache[key]) return ZombieRenderer._cache[key];
        const canvas = document.createElement('canvas');
        const padding = Math.ceil(size * 0.2);
        canvas.width = size + padding * 2;
        canvas.height = size + padding * 2;
        const ctx = canvas.getContext('2d');
        ctx.font = `${size}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(emoji, canvas.width / 2, canvas.height / 2);
        ZombieRenderer._cache[key] = canvas;
        return canvas;
    }

    static _getImg(map, id) {
        const img = map && map[id];
        return (img && img.complete && img.naturalWidth > 0) ? img : null;
    }

    static draw(ctx, zombie, cfg) {
        const x = zombie.x;
        const row = zombie.row;
        const cy = cfg.GRID_OFFSET_Y + row * cfg.CELL_HEIGHT + cfg.CELL_HEIGHT * 0.6;
        const cellSize = Math.min(cfg.CELL_WIDTH, cfg.CELL_HEIGHT);
        const size = cellSize * 0.72;

        ctx.save();

        // 行走动画
        const t = performance.now() * 0.003;
        const walkBob = zombie.attacking ? 0 : Math.sin(t * zombie.speed * 3 + zombie.x * 0.05) * 1.5;
        const walkTilt = zombie.attacking ? 0 : Math.sin(t * zombie.speed * 3 + zombie.x * 0.05) * 0.03;
        ctx.translate(x, cy + walkBob);
        ctx.rotate(walkTilt);
        ctx.translate(-x, -(cy + walkBob));

        if (zombie.slowed) ctx.globalAlpha = 0.85;

        // 脚下阴影
        ctx.fillStyle = 'rgba(0,0,0,0.18)';
        ctx.beginPath();
        ctx.ellipse(x, cy + size * 0.48, size * 0.28, size * 0.06, 0, 0, Math.PI * 2);
        ctx.fill();

        const rc = ZombieRenderer.CONFIG[zombie.data.id] || ZombieRenderer.CONFIG.normal;
        const emojiSize = Math.round(size * 0.72);
        const legH = size * 0.38;

        // ---- 层1: 下半身（腿） ----
        const legImg = ZombieRenderer._getImg(ZOMBIE_SPRITES, rc.legs);
        if (legImg) {
            const legW = size * 0.9;
            ctx.drawImage(legImg, x - legW / 2, cy + size * 0.08, legW, legH);
        }

        // ---- 层2: emoji上半身 ----
        const emojiCanvas = ZombieRenderer.getIcon(rc.emoji, emojiSize);
        const emojiX = x - emojiCanvas.width / 2;
        const emojiY = cy - size * 0.38 - emojiCanvas.height * 0.3;
        ctx.drawImage(emojiCanvas, emojiX, emojiY);

        // ---- 层3: 装备 ----
        const equipMap = typeof ZOMBIE_EQUIP !== 'undefined' ? ZOMBIE_EQUIP : null;
        // 有护甲的僵尸，护甲被摧毁后不再绘制对应装备
        const armorDestroyed = zombie.data.armor && zombie.armorHp <= 0;
        const armorEquipMap = {
            'cone': 'cone', 'bucket': 'bucket', 'newspaper': 'newspaper',
            'screen': 'screen', 'helmet': 'helmet'
        };
        for (let i = 0; i < rc.equips.length; i++) {
            const eqId = rc.equips[i];
            // 如果该装备对应护甲且护甲已被摧毁，跳过绘制
            if (armorDestroyed && armorEquipMap[eqId]) continue;
            const eqImg = ZombieRenderer._getImg(equipMap, eqId);
            if (!eqImg) continue;

            switch (eqId) {
                case 'cone': {
                    const w = size * 0.42;
                    const h = size * 0.32;
                    ctx.drawImage(eqImg, x - w / 2, emojiY - h * 0.35, w, h);
                    break;
                }
                case 'bucket': {
                    const w = size * 0.48;
                    const h = size * 0.34;
                    ctx.drawImage(eqImg, x - w / 2, emojiY - h * 0.25, w, h);
                    break;
                }
                case 'helmet': {
                    const w = size * 0.55;
                    const h = size * 0.26;
                    ctx.drawImage(eqImg, x - w / 2, emojiY - h * 0.1, w, h);
                    break;
                }
                case 'afro': {
                    const w = size * 0.5;
                    const h = size * 0.3;
                    ctx.drawImage(eqImg, x - w / 2, emojiY - h * 0.45, w, h);
                    break;
                }
                case 'newspaper': {
                    const w = size * 0.28;
                    const h = size * 0.38;
                    ctx.drawImage(eqImg, x + emojiSize * 0.32, cy - size * 0.2, w, h);
                    break;
                }
                case 'pole': {
                    const w = size * 0.12;
                    const h = size * 0.7;
                    ctx.drawImage(eqImg, x + emojiSize * 0.28, cy - size * 0.35, w, h);
                    break;
                }
                case 'screendoor': {
                    const w = size * 0.22;
                    const h = size * 0.6;
                    ctx.drawImage(eqImg, x - emojiSize * 0.52 - w * 0.3, cy - size * 0.3, w, h);
                    break;
                }
                case 'telephone': {
                    const w = size * 0.16;
                    const h = size * 0.65;
                    ctx.drawImage(eqImg, x + emojiSize * 0.35, cy - size * 0.4, w, h);
                    break;
                }
            }
        }

        ctx.globalAlpha = 1;

        // 受击闪白
        if (zombie.hitFlash > 0) {
            const flashAlpha = Math.min(0.45, zombie.hitFlash / 80);
            ctx.fillStyle = `rgba(255,255,255,${flashAlpha})`;
            ctx.beginPath();
            ctx.arc(x, cy - size * 0.1, size * 0.35, 0, Math.PI * 2);
            ctx.fill();
        }

        // 血量条
        const barW = Math.max(28, size * 0.7);
        const barH = 3;
        const barX = x - barW / 2;
        const barY = emojiY - 4;

        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ZombieRenderer.roundRect(ctx, barX - 1, barY - 1, barW + 2, barH + 2, 2);
        ctx.fill();

        const ratio = Math.max(0, zombie.hp / zombie.data.hp);
        const barColor = ratio > 0.5 ? '#e53935' : ratio > 0.25 ? '#FB8C00' : '#FDD835';
        ctx.fillStyle = barColor;
        if (ratio > 0) {
            ZombieRenderer.roundRect(ctx, barX, barY, barW * ratio, barH, 1.5);
            ctx.fill();
        }

        // 减速标记
        if (zombie.slowed) {
            const snowSize = Math.round(size * 0.2);
            const snowCanvas = ZombieRenderer.getIcon('❄', snowSize);
            ctx.drawImage(snowCanvas, x - snowCanvas.width / 2, barY - snowCanvas.height - 1);
        }

        // 激怒标记
        if (zombie.enraged) {
            const angerSize = Math.round(size * 0.22);
            const angerCanvas = ZombieRenderer.getIcon('💢', angerSize);
            ctx.drawImage(angerCanvas, x - size * 0.4, emojiY);
        }

        ctx.restore();
    }

    static roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    }
}
