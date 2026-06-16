/**
 * 应用入口
 */
class App {
    constructor() {
        this.engine = new GameEngine();
        this.menuUI = new MenuUI(this);
        this.almanacUI = new AlmanacUI(this);
        this.gameUI = new GameUI(this);
    }

    init() {
        this.engine.init();
        this.menuUI.init();
        this.almanacUI.init();
        this.gameUI.init();

        Toast.init();
    }

    showScreen(name) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const screen = document.getElementById(`${name}-screen`);
        if (screen) screen.classList.add('active');
    }
}

// 启动
window.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
});
