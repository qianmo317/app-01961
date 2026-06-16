/**
 * 僵尸精灵图 - 纯SVG下半身+装备
 * 上半身由emoji提供，SVG只画腿/裤/鞋 + 特殊装备
 * viewBox分为上半(0-32)留给emoji，下半(32-64)画腿部
 */
const ZOMBIE_SPRITES = {};

/** 装备层：画在emoji头顶的装备SVG */
const ZOMBIE_EQUIP = {};

(function() {
    // ---- 下半身SVG（所有僵尸共享类似腿部，体型不同） ----
    const legs = {
        // 普通体型腿
        normal: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 32">
            <rect x="20" y="0" width="10" height="16" rx="2" fill="#455a64"/>
            <rect x="34" y="0" width="10" height="16" rx="2" fill="#455a64"/>
            <rect x="18" y="14" width="12" height="5" rx="2.5" fill="#37474f"/>
            <rect x="34" y="14" width="12" height="5" rx="2.5" fill="#37474f"/>
            <ellipse cx="32" cy="20" rx="14" ry="2" fill="rgba(0,0,0,.15)"/>
        </svg>`,
        // 壮硕体型腿（橄榄球/巨人）
        heavy: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 32">
            <rect x="16" y="0" width="12" height="18" rx="3" fill="#455a64"/>
            <rect x="36" y="0" width="12" height="18" rx="3" fill="#455a64"/>
            <rect x="14" y="16" width="14" height="5" rx="2.5" fill="#37474f"/>
            <rect x="36" y="16" width="14" height="5" rx="2.5" fill="#37474f"/>
            <ellipse cx="32" cy="22" rx="18" ry="2.5" fill="rgba(0,0,0,.18)"/>
        </svg>`,
        // 小体型腿（小鬼）
        small: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 32">
            <rect x="23" y="0" width="7" height="12" rx="2" fill="#455a64"/>
            <rect x="34" y="0" width="7" height="12" rx="2" fill="#455a64"/>
            <rect x="22" y="10" width="8" height="4" rx="2" fill="#37474f"/>
            <rect x="34" y="10" width="8" height="4" rx="2" fill="#37474f"/>
            <ellipse cx="32" cy="15" rx="10" ry="1.5" fill="rgba(0,0,0,.12)"/>
        </svg>`,
        // 舞王白裤+黑鞋
        dancer: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 32">
            <rect x="20" y="0" width="10" height="16" rx="2" fill="#eeeeee"/>
            <rect x="34" y="0" width="10" height="16" rx="2" fill="#eeeeee"/>
            <rect x="18" y="14" width="12" height="5" rx="2.5" fill="#212121"/>
            <rect x="34" y="14" width="12" height="5" rx="2.5" fill="#212121"/>
            <ellipse cx="32" cy="20" rx="14" ry="2" fill="rgba(0,0,0,.15)"/>
        </svg>`
    };

    // ---- 装备SVG（画在emoji头顶） ----
    const equips = {
        // 路障锥
        cone: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 28">
            <polygon points="20,0 8,24 32,24" fill="#FF9800"/>
            <ellipse cx="20" cy="24" rx="13" ry="3" fill="#F57C00"/>
            <line x1="11" y1="20" x2="29" y2="20" stroke="white" stroke-width="1.5" opacity=".7"/>
            <line x1="14" y1="14" x2="26" y2="14" stroke="white" stroke-width="1.2" opacity=".5"/>
            <line x1="16" y1="8" x2="24" y2="8" stroke="white" stroke-width="1" opacity=".4"/>
        </svg>`,
        // 铁桶
        bucket: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 28">
            <rect x="4" y="2" width="32" height="24" rx="3" fill="url(#bkG)"/>
            <defs><linearGradient id="bkG" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stop-color="#757575"/><stop offset=".3" stop-color="#bdbdbd"/>
                <stop offset=".5" stop-color="#e0e0e0"/><stop offset=".7" stop-color="#bdbdbd"/>
                <stop offset="1" stop-color="#757575"/>
            </linearGradient></defs>
            <line x1="4" y1="10" x2="36" y2="10" stroke="#616161" stroke-width="1.5"/>
            <line x1="4" y1="18" x2="36" y2="18" stroke="#616161" stroke-width="1"/>
            <rect x="17" y="3" width="4" height="20" fill="rgba(255,255,255,.12)" rx="1"/>
        </svg>`,
        // 橄榄球头盔
        helmet: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 22">
            <path d="M4 18 Q22 0 40 18 L40 20 Q22 14 4 20 Z" fill="#2e7d32"/>
            <path d="M4 18 Q22 0 40 18 L40 20 Q22 14 4 20 Z" fill="url(#hmG)" opacity=".4"/>
            <defs><linearGradient id="hmG" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stop-color="#1b5e20"/><stop offset=".5" stop-color="#4caf50"/><stop offset="1" stop-color="#1b5e20"/>
            </linearGradient></defs>
            <line x1="10" y1="20" x2="34" y2="20" stroke="#bdbdbd" stroke-width="1.5"/>
        </svg>`,
        // 爆炸头（舞王）
        afro: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 24">
            <circle cx="20" cy="12" r="12" fill="#1a1a1a"/>
            <circle cx="12" cy="6" r="5" fill="#333"/>
            <circle cx="28" cy="6" r="5" fill="#333"/>
            <circle cx="20" cy="3" r="5" fill="#333"/>
            <circle cx="14" cy="14" r="3" fill="#333"/>
            <circle cx="26" cy="14" r="3" fill="#333"/>
        </svg>`,
        // 报纸（读报僵尸手持）
        newspaper: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 36">
            <rect x="0" y="0" width="28" height="36" rx="2" fill="#f5f5f5"/>
            <rect x="3" y="3" width="22" height="4" rx="1" fill="#bdbdbd"/>
            <rect x="3" y="10" width="22" height="2" rx="1" fill="#e0e0e0"/>
            <rect x="3" y="15" width="18" height="2" rx="1" fill="#e0e0e0"/>
            <rect x="3" y="20" width="20" height="2" rx="1" fill="#e0e0e0"/>
            <rect x="3" y="25" width="14" height="2" rx="1" fill="#e0e0e0"/>
            <rect x="3" y="30" width="16" height="2" rx="1" fill="#eeeeee"/>
        </svg>`,
        // 撑杆
        pole: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 56">
            <line x1="6" y1="0" x2="6" y2="56" stroke="#6d4c41" stroke-width="3" stroke-linecap="round"/>
            <circle cx="6" cy="2" r="3" fill="#8d6e63"/>
        </svg>`,
        // 铁栅门
        screendoor: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 48">
            <rect x="0" y="0" width="20" height="48" rx="2" fill="#9e9e9e"/>
            <rect x="0" y="0" width="20" height="48" rx="2" fill="url(#sdG)" opacity=".4"/>
            <defs><linearGradient id="sdG" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stop-color="#616161"/><stop offset=".5" stop-color="#e0e0e0"/><stop offset="1" stop-color="#616161"/>
            </linearGradient></defs>
            <line x1="0" y1="8" x2="20" y2="8" stroke="#757575" stroke-width="1"/>
            <line x1="0" y1="16" x2="20" y2="16" stroke="#757575" stroke-width="1"/>
            <line x1="0" y1="24" x2="20" y2="24" stroke="#757575" stroke-width="1"/>
            <line x1="0" y1="32" x2="20" y2="32" stroke="#757575" stroke-width="1"/>
            <line x1="0" y1="40" x2="20" y2="40" stroke="#757575" stroke-width="1"/>
            <line x1="10" y1="0" x2="10" y2="48" stroke="#757575" stroke-width="1"/>
        </svg>`,
        // 电线杆（巨人）
        telephone: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 52">
            <rect x="5" y="0" width="6" height="52" rx="2" fill="#5d4037"/>
            <rect x="0" y="4" width="16" height="4" rx="1" fill="#4e342e"/>
        </svg>`
    };

    function loadSVG(map, id, svgStr) {
        const img = new Image();
        const blob = new Blob([svgStr], { type: 'image/svg+xml' });
        img.src = URL.createObjectURL(blob);
        map[id] = img;
    }

    // 加载下半身
    Object.keys(legs).forEach(id => loadSVG(ZOMBIE_SPRITES, id, legs[id]));

    // 加载装备
    Object.keys(equips).forEach(id => loadSVG(ZOMBIE_EQUIP, id, equips[id]));
})();
