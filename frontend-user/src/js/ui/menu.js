/**
 * 菜单界面管理
 */
class MenuUI {
    constructor(app) {
        this.app = app;
    }

    init() {
        document.getElementById('btn-start').addEventListener('click', () => {
            this.app.showScreen('game');
            this.app.engine.start();
        });

        document.getElementById('btn-almanac').addEventListener('click', () => {
            this.app.showScreen('almanac');
            this.app.almanacUI.showCurrentTab();
        });

        document.getElementById('btn-help').addEventListener('click', () => {
            this.app.showScreen('help');
        });

        document.getElementById('btn-help-back').addEventListener('click', () => {
            this.app.showScreen('menu');
        });
    }
}
