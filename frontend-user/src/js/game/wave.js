/**
 * 波次管理器
 */
class WaveManager {
    constructor(engine) {
        this.engine = engine;
        this.currentWave = 0;
        this.waveTimer = 0;
        this.waveStarted = false;
        this.allWavesSpawned = false;
        this.zombiesSpawnedThisWave = false;
    }

    reset() {
        this.currentWave = 0;
        this.waveTimer = 0;
        this.waveStarted = false;
        this.allWavesSpawned = false;
        this.zombiesSpawnedThisWave = false;
    }

    update(dt, speed) {
        if (this.allWavesSpawned) {
            // 所有波次已出完，检查是否还有僵尸
            if (this.engine.zombieManager.aliveCount === 0) {
                this.engine.gameOver(true);
            }
            return;
        }

        this.waveTimer += dt * speed;

        // 第一波延迟
        if (this.currentWave === 0 && this.waveTimer < GAME_CONFIG.FIRST_WAVE_DELAY) {
            const remaining = Math.ceil((GAME_CONFIG.FIRST_WAVE_DELAY - this.waveTimer) / 1000);
            document.getElementById('wave-info').textContent = `准备中... ${remaining}s`;
            return;
        }

        // 开始新波次
        if (!this.waveStarted) {
            this.startWave();
        }

        // 波次间隔
        if (this.zombiesSpawnedThisWave && this.waveTimer >= GAME_CONFIG.WAVE_INTERVAL) {
            this.waveTimer = 0;
            this.waveStarted = false;
            this.zombiesSpawnedThisWave = false;
        }
    }

    startWave() {
        if (this.currentWave >= WAVE_CONFIG.length) {
            this.allWavesSpawned = true;
            return;
        }

        this.waveStarted = true;
        this.currentWave++;
        this.zombiesSpawnedThisWave = true;
        this.waveTimer = 0;

        const waveData = WAVE_CONFIG[this.currentWave - 1];
        const zombieIds = waveData.zombies;

        // 更新UI
        document.getElementById('wave-info').textContent = `波次: ${this.currentWave}/${GAME_CONFIG.TOTAL_WAVES}`;

        if (this.currentWave > 1) {
            Toast.warning(`⚠️ 第 ${this.currentWave} 波僵尸来袭！`);
        } else {
            Toast.info('🧟 僵尸来了！准备战斗！');
        }

        // 分批生成僵尸 - 均匀分配行，减少重叠
        const rows = [];
        for (let i = 0; i < zombieIds.length; i++) {
            rows.push(i % GAME_CONFIG.ROWS);
        }
        // 打乱行顺序
        for (let i = rows.length - 1; i > 0; i--) {
            const j = Helpers.randInt(0, i);
            [rows[i], rows[j]] = [rows[j], rows[i]];
        }

        zombieIds.forEach((zId, index) => {
            setTimeout(() => {
                if (!this.engine.running) return;
                const zData = ZOMBIES_DATA.find(z => z.id === zId);
                if (zData) {
                    const row = rows[index];
                    // 出生x位置拉开，避免同时出现在同一位置
                    const baseX = GAME_CONFIG.GRID_OFFSET_X + GAME_CONFIG.COLS * GAME_CONFIG.CELL_WIDTH;
                    const spawnX = baseX + Helpers.randInt(30, 120);
                    this.engine.zombieManager.spawn(zData, row, spawnX);
                }
            }, index * 1500 + Helpers.randInt(0, 800));
        });

        // 最后一波特殊提示
        if (this.currentWave === WAVE_CONFIG.length) {
            Toast.error('🚨 最终波次！全力防守！');
        }
    }
}
