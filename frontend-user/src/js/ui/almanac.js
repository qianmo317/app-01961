/**
 * 图鉴界面
 */
class AlmanacUI {
    constructor(app) {
        this.app = app;
        this.currentTab = 'plants';
    }

    init() {
        document.getElementById('btn-almanac-back').addEventListener('click', () => {
            this.currentTab = 'plants';
            this.app.showScreen('menu');
        });

        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const tab = btn.dataset.tab;
                this.currentTab = tab;
                if (tab === 'plants') this.showPlants();
                else this.showZombies();
            });
        });
    }

    showPlants() {
        const container = document.getElementById('almanac-content');
        container.innerHTML = '';
        PLANTS_DATA.forEach(plant => {
            const card = document.createElement('div');
            card.className = 'almanac-card';
            card.innerHTML = `
                <div class="almanac-card-header">
                    <div class="almanac-card-icon">${plant.icon}</div>
                    <div class="almanac-card-name">${plant.name}</div>
                </div>
                <div class="almanac-card-desc">${plant.desc}</div>
                <div class="almanac-card-stats">
                    <span class="stat-tag">☀️ ${plant.cost}</span>
                    <span class="stat-tag">❤️ ${plant.hp}</span>
                </div>
            `;
            container.appendChild(card);
        });
    }

    /**
     * 在小canvas上渲染僵尸真实形象（复用ZombieRenderer的分层逻辑）
     */
    renderZombieIcon(zombieId, size) {
        const rc = ZombieRenderer.CONFIG[zombieId] || ZombieRenderer.CONFIG.normal;
        const canvas = document.createElement('canvas');
        const W = size, H = size;
        canvas.width = W;
        canvas.height = H;
        canvas.style.width = size + 'px';
        canvas.style.height = size + 'px';
        const ctx = canvas.getContext('2d');
        const cx = W / 2, cy = H * 0.62;
        const s = size * 0.55;
        const emojiSize = Math.round(s * 0.72);
        const legH = s * 0.38;

        // 层1: 腿部
        const legImg = ZombieRenderer._getImg(ZOMBIE_SPRITES, rc.legs);
        if (legImg) {
            const legW = s * 0.9;
            ctx.drawImage(legImg, cx - legW / 2, cy + s * 0.08, legW, legH);
        }

        // 层2: emoji上半身
        const emojiCanvas = ZombieRenderer.getIcon(rc.emoji, emojiSize);
        const emojiX = cx - emojiCanvas.width / 2;
        const emojiY = cy - s * 0.38 - emojiCanvas.height * 0.3;
        ctx.drawImage(emojiCanvas, emojiX, emojiY);

        // 层3: 装备
        const equipMap = typeof ZOMBIE_EQUIP !== 'undefined' ? ZOMBIE_EQUIP : null;
        for (const eqId of rc.equips) {
            const eqImg = ZombieRenderer._getImg(equipMap, eqId);
            if (!eqImg) continue;
            switch (eqId) {
                case 'cone': {
                    const w = s * 0.42, h = s * 0.32;
                    ctx.drawImage(eqImg, cx - w / 2, emojiY - h * 0.35, w, h);
                    break;
                }
                case 'bucket': {
                    const w = s * 0.48, h = s * 0.34;
                    ctx.drawImage(eqImg, cx - w / 2, emojiY - h * 0.25, w, h);
                    break;
                }
                case 'helmet': {
                    const w = s * 0.55, h = s * 0.26;
                    ctx.drawImage(eqImg, cx - w / 2, emojiY - h * 0.1, w, h);
                    break;
                }
                case 'afro': {
                    const w = s * 0.5, h = s * 0.3;
                    ctx.drawImage(eqImg, cx - w / 2, emojiY - h * 0.45, w, h);
                    break;
                }
                case 'newspaper': {
                    const w = s * 0.28, h = s * 0.38;
                    ctx.drawImage(eqImg, cx + emojiSize * 0.32, cy - s * 0.2, w, h);
                    break;
                }
                case 'pole': {
                    const w = s * 0.12, h = s * 0.7;
                    ctx.drawImage(eqImg, cx + emojiSize * 0.28, cy - s * 0.35, w, h);
                    break;
                }
                case 'screendoor': {
                    const w = s * 0.22, h = s * 0.6;
                    ctx.drawImage(eqImg, cx - emojiSize * 0.52 - w * 0.3, cy - s * 0.3, w, h);
                    break;
                }
                case 'telephone': {
                    const w = s * 0.16, h = s * 0.65;
                    ctx.drawImage(eqImg, cx + emojiSize * 0.35, cy - s * 0.4, w, h);
                    break;
                }
            }
        }
        return canvas;
    }

    showCurrentTab() {
        // 同步 tab 按钮高亮状态
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === this.currentTab);
        });
        if (this.currentTab === 'zombies') this.showZombies();
        else this.showPlants();
    }

    showZombies() {
        const container = document.getElementById('almanac-content');
        container.innerHTML = '';
        // 延迟渲染，确保SVG blob图片已加载
        setTimeout(() => {
            ZOMBIES_DATA.forEach(zombie => {
                const card = document.createElement('div');
                card.className = 'almanac-card';

                const header = document.createElement('div');
                header.className = 'almanac-card-header';

                const iconDiv = document.createElement('div');
                iconDiv.className = 'almanac-card-icon';
                const iconCanvas = this.renderZombieIcon(zombie.id, 48);
                iconDiv.innerHTML = '';
                iconDiv.appendChild(iconCanvas);

                const nameDiv = document.createElement('div');
                nameDiv.className = 'almanac-card-name';
                nameDiv.textContent = zombie.name;

                header.appendChild(iconDiv);
                header.appendChild(nameDiv);
                card.appendChild(header);

                const descDiv = document.createElement('div');
                descDiv.className = 'almanac-card-desc';
                descDiv.textContent = zombie.desc;
                card.appendChild(descDiv);

                const statsDiv = document.createElement('div');
                statsDiv.className = 'almanac-card-stats';
                statsDiv.innerHTML = `
                    <span class="stat-tag">❤️ ${zombie.hp}</span>
                    <span class="stat-tag">⚡ ${zombie.speed}</span>
                    <span class="stat-tag">⚔️ ${zombie.damage}</span>
                    <span class="stat-tag">🌊 第${zombie.wave}波</span>
                `;
                card.appendChild(statsDiv);
                container.appendChild(card);
            });
        }, 100);
    }
}
