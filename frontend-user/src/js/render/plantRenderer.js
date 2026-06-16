/**
 * 植物渲染器 - 使用预渲染 emoji icon，与植物栏图标一致
 */
class PlantRenderer {
    static _cache = {};

    /** 获取预渲染的 emoji 图片 */
    static getIcon(emoji, size) {
        const key = emoji + '|' + size;
        if (PlantRenderer._cache[key]) return PlantRenderer._cache[key];

        const canvas = document.createElement('canvas');
        const padding = Math.ceil(size * 0.2);
        canvas.width = size + padding * 2;
        canvas.height = size + padding * 2;
        const ctx = canvas.getContext('2d');
        ctx.font = `${size}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(emoji, canvas.width / 2, canvas.height / 2);

        PlantRenderer._cache[key] = canvas;
        return canvas;
    }

    static draw(ctx, plant, cellX, cellY, cellW, cellH) {
        const cx = cellX + cellW / 2;
        const cy = cellY + cellH / 2;
        const size = Math.min(cellW, cellH) * 0.7;

        ctx.save();

        // 呼吸动画
        const t = performance.now() * 0.001;
        const breathe = 1 + Math.sin(t * 2 + plant.row * 0.7 + plant.col * 1.3) * 0.02;
        const sway = Math.sin(t * 1.5 + plant.row + plant.col * 0.8) * 1.2;

        ctx.translate(cx, cy);
        ctx.scale(breathe, breathe);
        ctx.translate(sway, 0);
        ctx.translate(-cx, -cy);

        // 血量条
        if (plant.hp < plant.maxHp) {
            const barW = cellW * 0.7;
            const barH = 4;
            const barX = cx - barW / 2;
            const barY = cellY + 4;
            ctx.fillStyle = 'rgba(0,0,0,0.4)';
            ctx.fillRect(barX, barY, barW, barH);
            const ratio = plant.hp / plant.maxHp;
            ctx.fillStyle = ratio > 0.5 ? '#4CAF50' : ratio > 0.25 ? '#FF9800' : '#F44336';
            ctx.fillRect(barX, barY, barW * ratio, barH);
        }

        // 窝瓜跳跃状态
        if (plant.data.type === 'squash' && plant.jumping) {
            const jumpProgress = Math.min(1, plant.jumpTimer / 500);
            const jumpHeight = Math.sin(jumpProgress * Math.PI) * cellH * 0.8;
            let jumpX = cx;
            if (plant.jumpTarget) {
                jumpX = cx + (plant.jumpTarget.x - (cellX + cellW / 2)) * jumpProgress;
            }
            ctx.save();
            // 阴影
            ctx.fillStyle = `rgba(0,0,0,${0.15 * (1 - jumpProgress * 0.5)})`;
            ctx.beginPath();
            ctx.ellipse(jumpX, cy + cellH * 0.3, cellW * 0.25, 4, 0, 0, Math.PI * 2);
            ctx.fill();
            // 跳起的窝瓜
            const iconSize = Math.round(size * 0.7);
            const iconCanvas = PlantRenderer.getIcon(plant.data.icon, iconSize);
            ctx.drawImage(iconCanvas, jumpX - iconCanvas.width / 2, cy - jumpHeight - iconCanvas.height / 2);
            ctx.restore();
            return;
        }

        // 用预渲染 emoji 绘制
        const iconSize = Math.round(size * 0.7);
        const iconCanvas = PlantRenderer.getIcon(plant.data.icon, iconSize);
        ctx.drawImage(iconCanvas, cx - iconCanvas.width / 2, cy - iconCanvas.height / 2);

        // 土豆雷未准备状态
        if (plant.data.type === 'mine' && !plant.armed) {
            ctx.globalAlpha = 0.5;
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.beginPath();
            ctx.arc(cx, cy, iconSize * 0.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
            ctx.fillStyle = '#fff';
            ctx.font = '10px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('准备中...', cx, cellY + cellH - 8);
        }

        // 大嘴花咀嚼状态
        if (plant.data.type === 'chomper' && plant.chewing) {
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.font = '10px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('咀嚼中...', cx, cellY + cellH - 8);
        }

        // 南瓜头护甲 - 环绕植物的橙色护甲圈
        if (plant.armorHp > 0) {
            const armorR = size * 0.48;
            const armorRatio = plant.armorHp / 4000; // 南瓜头满血4000

            // 外圈橙色光环
            ctx.strokeStyle = `rgba(255,152,0,${0.3 + armorRatio * 0.4})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(cx, cy, armorR, 0, Math.PI * 2);
            ctx.stroke();

            // 护甲弧度（按剩余比例）
            ctx.strokeStyle = '#FF9800';
            ctx.lineWidth = 3.5;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.arc(cx, cy, armorR, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * armorRatio);
            ctx.stroke();

            // 底部小南瓜图标
            const pumpSize = Math.round(size * 0.22);
            const pumpCanvas = PlantRenderer.getIcon('🎃', pumpSize);
            ctx.drawImage(pumpCanvas, cx - pumpCanvas.width / 2, cellY + cellH - pumpCanvas.height - 2);
        }

        ctx.restore();
    }
}
