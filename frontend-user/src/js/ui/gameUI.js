/**
 * 游戏界面UI管理
 */
class GameUI {
    constructor(app) {
        this.app = app;
    }

    init() {
        const engine = this.app.engine;

        // 植物栏
        this.buildPlantBar();

        // 确认框逻辑
        this._confirmCallback = null;
        document.getElementById('btn-confirm-yes').addEventListener('click', () => {
            document.getElementById('confirm-overlay').classList.remove('active');
            if (this._confirmCallback) this._confirmCallback();
            this._confirmCallback = null;
            engine.resume();
        });
        document.getElementById('btn-confirm-no').addEventListener('click', () => {
            document.getElementById('confirm-overlay').classList.remove('active');
            this._confirmCallback = null;
            engine.resume();
        });

        // 音效开关
        const btnSound = document.getElementById('btn-sound');
        btnSound.addEventListener('click', () => {
            SoundManager.init();
            const muted = SoundManager.toggleMute();
            if (muted) {
                btnSound.innerHTML = '🔇 静音';
                btnSound.classList.remove('btn-secondary');
                btnSound.classList.add('btn-primary');
            } else {
                btnSound.innerHTML = '🔊 音效';
                btnSound.classList.remove('btn-primary');
                btnSound.classList.add('btn-secondary');
            }
        });

        // 暂停/继续 切换
        const btnPause = document.getElementById('btn-pause');
        btnPause.addEventListener('click', () => {
            if (engine.paused) {
                engine.resume();
                btnPause.innerHTML = '⏸ 暂停';
                btnPause.classList.remove('btn-primary');
                btnPause.classList.add('btn-secondary');
            } else {
                engine.pause();
                btnPause.innerHTML = '▶ 继续';
                btnPause.classList.remove('btn-secondary');
                btnPause.classList.add('btn-primary');
            }
        });

        // 重新开始
        document.getElementById('btn-restart').addEventListener('click', () => {
            this.showConfirm('🔄 重新开始', '确定要重新开始游戏吗？', () => {
                engine.stop();
                btnPause.innerHTML = '⏸ 暂停';
                btnPause.classList.remove('btn-primary');
                btnPause.classList.add('btn-secondary');
                engine.start();
            });
        });

        // 退出
        document.getElementById('btn-quit').addEventListener('click', () => {
            this.showConfirm('✕ 退出游戏', '确定要退出当前游戏吗？', () => {
                engine.stop();
                btnPause.innerHTML = '⏸ 暂停';
                btnPause.classList.remove('btn-primary');
                btnPause.classList.add('btn-secondary');
                this.app.showScreen('menu');
            });
        });

        // 重试
        document.getElementById('btn-retry').addEventListener('click', () => {
            document.getElementById('result-overlay').classList.remove('active');
            engine.start();
        });

        // 返回主页
        document.getElementById('btn-home').addEventListener('click', () => {
            document.getElementById('result-overlay').classList.remove('active');
            engine.stop();
            this.app.showScreen('menu');
        });
    }

    showConfirm(title, desc, callback) {
        this.app.engine.pause();
        this._confirmCallback = callback;
        document.getElementById('confirm-title').textContent = title;
        document.getElementById('confirm-desc').textContent = desc;
        document.getElementById('confirm-overlay').classList.add('active');
    }

    buildPlantBar() {
        const bar = document.getElementById('plant-bar');
        bar.innerHTML = '';
        PLANTS_DATA.forEach(plant => {
            const card = document.createElement('div');
            card.className = 'plant-card';
            card.dataset.id = plant.id;
            card.innerHTML = `
                <span class="plant-card-icon">${plant.icon}</span>
                <span class="plant-card-cost">${plant.cost}</span>
            `;
            card.title = `${plant.name} - ${plant.desc} (${plant.cost}☀️)`;
            card.addEventListener('click', () => {
                SoundManager.init();
                SoundManager.ensureContext();
                this.app.engine.selectPlant(plant);
            });
            bar.appendChild(card);
        });
    }
}
