/**
 * 游戏引擎 - 核心循环
 */
class GameEngine {
    constructor() {
        this.canvas = null;
        this.renderer = null;
        this.sunManager = new SunManager(this);
        this.projectileManager = new ProjectileManager(this);
        this.plantManager = new PlantManager(this);
        this.zombieManager = new ZombieManager(this);
        this.waveManager = new WaveManager(this);

        this.running = false;
        this.paused = false;
        this.gameSpeed = GAME_CONFIG.NORMAL_SPEED;
        this.sunCount = GAME_CONFIG.INITIAL_SUN;
        this.lastTime = 0;
        this.animFrameId = null;

        // 选中的植物
        this.selectedPlant = null;

        // 爆炸效果
        this.explosions = [];

        // 粒子效果
        this.particles = [];

        // 鼠标位置
        this.mouseX = 0;
        this.mouseY = 0;

        // 绑定
        this.loop = this.loop.bind(this);
    }

    init() {
        this.canvas = document.getElementById('game-canvas');
        this.renderer = new Renderer(this.canvas);

        // 事件
        this.canvas.addEventListener('click', (e) => this.onClick(e));
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.cancelSelection();
        });

        window.addEventListener('resize', () => {
            if (this.running) this.renderer.resize();
        });
    }

    start() {
        this.running = true;
        this.paused = false;
        this.sunCount = GAME_CONFIG.INITIAL_SUN;
        this.gameSpeed = GAME_CONFIG.NORMAL_SPEED;
        this.selectedPlant = null;
        this.explosions = [];
        this.particles = [];

        this.sunManager.reset();
        this.projectileManager.reset();
        this.plantManager.reset();
        this.zombieManager.reset();
        this.waveManager.reset();

        this.renderer.resize();
        this.updateSunDisplay();

        this.lastTime = performance.now();
        // 延迟一帧确保DOM布局完成后再resize
        requestAnimationFrame(() => {
            this.renderer.resize();
            this.loop();
        });

        Toast.success('游戏开始！种植植物抵御僵尸！');
    }

    stop() {
        this.running = false;
        if (this.animFrameId) {
            cancelAnimationFrame(this.animFrameId);
            this.animFrameId = null;
        }
    }

    pause() {
        this.paused = true;
    }

    resume() {
        if (this.paused) {
            this.paused = false;
            this.lastTime = performance.now();
        }
    }

    loop() {
        if (!this.running) return;
        this.animFrameId = requestAnimationFrame(this.loop);

        if (this.paused) return;

        const now = performance.now();
        const dt = Math.min(now - this.lastTime, 100); // cap delta
        this.lastTime = now;

        this.update(dt);
        this.draw();
    }

    update(dt) {
        const speed = this.gameSpeed;

        // 更新各系统
        this.sunManager.update(dt, speed);
        this.plantManager.update(dt, speed);
        this.zombieManager.update(dt, speed);
        this.projectileManager.update(dt, speed, this.zombieManager.zombies, GAME_CONFIG);
        this.waveManager.update(dt, speed);

        // 更新爆炸
        this.explosions.forEach(e => {
            e.timer += dt;
            if (e.timer >= e.duration) e.active = false;
        });
        this.explosions = this.explosions.filter(e => e.active);

        // 更新粒子
        this.particles.forEach(p => {
            p.x += p.vx * speed;
            p.y += p.vy * speed;
            p.vy += 0.05 * speed; // 重力
            p.life -= dt * speed;
            if (p.life <= 0) p.active = false;
        });
        this.particles = this.particles.filter(p => p.active);

        // 更新UI
        this.updatePlantBarUI();
    }

    draw() {
        this.renderer.clear();
        this.renderer.drawLawn();

        // 绘制植物
        this.plantManager.draw(this.renderer.ctx);

        // 绘制弹药（在僵尸下方）
        this.renderer.drawProjectiles(this.projectileManager.projectiles);

        // 绘制僵尸
        this.zombieManager.draw(this.renderer.ctx);

        // 绘制阳光（在最上层）
        this.renderer.drawSuns(this.sunManager.suns);

        // 绘制爆炸
        this.renderer.drawExplosions(this.explosions);

        // 绘制粒子
        this.renderer.drawParticles(this.particles);

        // 绘制鼠标跟随
        this.drawCursor();
    }

    drawCursor() {
        if (!this.selectedPlant) return;
        const ctx = this.renderer.ctx;
        const cell = Helpers.pixelToCell(this.mouseX, this.mouseY);

        if (cell) {
            const x = GAME_CONFIG.GRID_OFFSET_X + cell.col * GAME_CONFIG.CELL_WIDTH;
            const y = GAME_CONFIG.GRID_OFFSET_Y + cell.row * GAME_CONFIG.CELL_HEIGHT;

            const canPlace = !this.plantManager.getPlant(cell.row, cell.col) ||
                (this.selectedPlant.type === 'armor' && this.plantManager.getPlant(cell.row, cell.col));
            ctx.fillStyle = canPlace ? 'rgba(76, 175, 80, 0.3)' : 'rgba(244, 67, 54, 0.3)';
            ctx.fillRect(x, y, GAME_CONFIG.CELL_WIDTH, GAME_CONFIG.CELL_HEIGHT);
            ctx.font = '24px serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.globalAlpha = 0.7;
            ctx.fillText(this.selectedPlant.icon, x + GAME_CONFIG.CELL_WIDTH / 2, y + GAME_CONFIG.CELL_HEIGHT / 2);
            ctx.globalAlpha = 1;
        }
    }

    onClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        const mx = (e.clientX - rect.left) * scaleX;
        const my = (e.clientY - rect.top) * scaleY;

        // 尝试收集阳光
        if (this.sunManager.tryCollect(mx, my)) return;

        const cell = Helpers.pixelToCell(mx, my);
        if (!cell) return;

        // 种植
        if (this.selectedPlant) {
            this.tryPlant(cell.row, cell.col);
        }
    }

    onMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        this.mouseX = (e.clientX - rect.left) * scaleX;
        this.mouseY = (e.clientY - rect.top) * scaleY;
    }

    tryPlant(row, col) {
        const plant = this.selectedPlant;
        if (!plant) return;

        if (this.sunCount < plant.cost) return;

        if (this.plantManager.place(plant, row, col)) {
            this.sunCount -= plant.cost;
            this.updateSunDisplay();
            this.selectedPlant = null;
            this.updatePlantBarSelection();
        }
    }

    selectPlant(plantData) {
        if (this.sunCount < plantData.cost) return;
        this.selectedPlant = plantData;
        this.updatePlantBarSelection();
    }

    cancelSelection() {
        this.selectedPlant = null;
        this.updatePlantBarSelection();
    }

    addSun(amount) {
        this.sunCount += amount;
        this.updateSunDisplay();
        // 阳光计数器脉冲动画
        const counter = document.getElementById('sun-counter');
        counter.classList.remove('pulse');
        void counter.offsetWidth; // 强制 reflow 重置动画
        counter.classList.add('pulse');
    }

    updateSunDisplay() {
        document.getElementById('sun-value').textContent = this.sunCount;
    }

    updatePlantBarSelection() {
        document.querySelectorAll('.plant-card').forEach(card => {
            card.classList.remove('selected');
        });
        if (this.selectedPlant) {
            const card = document.querySelector(`.plant-card[data-id="${this.selectedPlant.id}"]`);
            if (card) card.classList.add('selected');
        }
    }

    updatePlantBarUI() {
        document.querySelectorAll('.plant-card').forEach(card => {
            const id = card.dataset.id;
            const plantData = PLANTS_DATA.find(p => p.id === id);

            if (plantData && this.sunCount < plantData.cost) {
                card.classList.add('disabled');
            } else {
                card.classList.remove('disabled');
            }
        });
    }

    addExplosion(x, y, radius, color, color2, duration) {
        this.explosions.push({
            x, y, radius, color, color2, duration,
            timer: 0,
            active: true
        });
        // 爆炸时生成粒子
        this.spawnParticles(x, y, color, 8);
    }

    /** 生成粒子效果 */
    spawnParticles(x, y, color, count) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.5 + Math.random() * 2;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 1,
                color: color,
                size: 2 + Math.random() * 3,
                life: 400 + Math.random() * 400,
                active: true
            });
        }
    }

    gameOver(won) {
        if (!this.running) return; // 防止重复调用
        this.running = false;
        if (this.animFrameId) {
            cancelAnimationFrame(this.animFrameId);
        }

        const resultOverlay = document.getElementById('result-overlay');
        const resultTitle = document.getElementById('result-title');
        const resultDesc = document.getElementById('result-desc');

        if (won) {
            resultTitle.textContent = '🎉 胜利！';
            resultDesc.textContent = '恭喜你成功抵御了所有僵尸的进攻！';
            Toast.success('🏆 恭喜通关！');
        } else {
            resultTitle.textContent = '💀 失败...';
            resultDesc.textContent = '僵尸突破了防线，进入了你的房子...';
            Toast.error('😱 僵尸入侵了你的房子！');
        }

        resultOverlay.classList.add('active');
    }
}
