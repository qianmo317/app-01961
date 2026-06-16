/**
 * 工具函数
 */
const Helpers = {
    /**
     * 获取格子中心坐标
     */
    getCellCenter(row, col) {
        const cfg = GAME_CONFIG;
        return {
            x: cfg.GRID_OFFSET_X + col * cfg.CELL_WIDTH + cfg.CELL_WIDTH / 2,
            y: cfg.GRID_OFFSET_Y + row * cfg.CELL_HEIGHT + cfg.CELL_HEIGHT / 2
        };
    },

    /**
     * 像素坐标转格子坐标
     */
    pixelToCell(px, py) {
        const cfg = GAME_CONFIG;
        const col = Math.floor((px - cfg.GRID_OFFSET_X) / cfg.CELL_WIDTH);
        const row = Math.floor((py - cfg.GRID_OFFSET_Y) / cfg.CELL_HEIGHT);
        if (row >= 0 && row < cfg.ROWS && col >= 0 && col < cfg.COLS) {
            return { row, col };
        }
        return null;
    },

    /**
     * 两点距离
     */
    distance(x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    },

    /**
     * 随机整数
     */
    randInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    /**
     * 随机选择数组元素
     */
    randPick(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    },

    /**
     * 限制范围
     */
    clamp(val, min, max) {
        return Math.max(min, Math.min(max, val));
    }
};
