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

        // 静音开关 - 控制所有音效，立即生效，不影响游戏进度
        const btnMute = document.getElementById('btn-mute');
        this.updateMuteButton();
        btnMute.addEventListener('click', () => {
            SoundManager.toggleMute();
            this.updateMuteButton();
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

    /** 同步静音按钮的图标与状态 */
    updateMuteButton() {
        const btnMute = document.getElementById('btn-mute');
        if (!btnMute) return;
        if (SoundManager.isMuted()) {
            btnMute.innerHTML = '🔇 音效';
            btnMute.classList.add('btn-mute-off');
        } else {
            btnMute.innerHTML = '🔊 音效';
            btnMute.classList.remove('btn-mute-off');
        }
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
                this.app.engine.selectPlant(plant);
            });
            bar.appendChild(card);
        });
    }
}
