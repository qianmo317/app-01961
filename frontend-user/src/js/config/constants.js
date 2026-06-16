/**
 * 游戏常量配置
 */
const GAME_CONFIG = {
    ROWS: 5,
    COLS: 9,
    CELL_WIDTH: 80,
    CELL_HEIGHT: 100,
    GRID_OFFSET_X: 40,
    GRID_OFFSET_Y: 10,

    // 阳光
    INITIAL_SUN: 150,
    SKY_SUN_INTERVAL: 7000,
    SKY_SUN_VALUE: 25,
    SUN_COLLECT_RANGE: 20,

    // 波次
    TOTAL_WAVES: 10,
    WAVE_INTERVAL: 25000,
    FIRST_WAVE_DELAY: 15000,

    // 速度
    NORMAL_SPEED: 1,

    // 颜色
    LAWN_COLORS: ['#5da83a', '#4e9631'],
    LAWN_BG: '#3d7a24',
    SIDEBAR_COLOR: '#2d5a18',
};

const PROJECTILE_TYPES = {
    PEA: { speed: 4, damage: 20, color: '#7ec850', radius: 5 },
    FROZEN_PEA: { speed: 4, damage: 20, color: '#87CEEB', radius: 5, slow: 0.5 },
    FIRE_PEA: { speed: 4, damage: 40, color: '#FF6B35', radius: 6 },
    STAR: { speed: 3, damage: 20, color: '#FFD700', radius: 5, diagonal: true },
    CABBAGE: { speed: 3, damage: 40, color: '#228B22', radius: 7, lob: true },
    CORN: { speed: 3, damage: 30, color: '#FFD700', radius: 6, lob: true },
    MELON: { speed: 3, damage: 60, color: '#2E8B57', radius: 8, lob: true, splash: 60 },
    SPIKE: { speed: 0, damage: 20, color: '#8B4513', radius: 0 },
    NEEDLE: { speed: 5, damage: 25, color: '#2E7D32', radius: 3 },
};
