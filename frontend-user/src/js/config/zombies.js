/**
 * 10种僵尸配置
 */
const ZOMBIES_DATA = [
    {
        id: 'normal',
        name: '普通僵尸',
        icon: '🧟',
        hp: 200,
        speed: 0.28,
        damage: 100,
        attackInterval: 1000,
        desc: '最普通的僵尸',
        wave: 1
    },
    {
        id: 'cone',
        name: '路障僵尸',
        icon: '🧟',
        hp: 560,
        speed: 0.28,
        damage: 100,
        attackInterval: 1000,
        desc: '头戴路障的僵尸，更耐打',
        wave: 2,
        armor: 'cone',
        armorHp: 360
    },
    {
        id: 'bucket',
        name: '铁桶僵尸',
        icon: '🪣',
        hp: 1300,
        speed: 0.28,
        damage: 100,
        attackInterval: 1000,
        desc: '头戴铁桶，非常耐打',
        wave: 4,
        armor: 'bucket',
        armorHp: 1100,
        metalArmor: true
    },
    {
        id: 'newspaper',
        name: '读报僵尸',
        icon: '📰',
        hp: 400,
        speed: 0.28,
        damage: 100,
        attackInterval: 1000,
        desc: '报纸被毁后会加速',
        wave: 3,
        armor: 'newspaper',
        armorHp: 200,
        enrageSpeed: 0.56
    },
    {
        id: 'polevault',
        name: '撑杆僵尸',
        icon: '🏃',
        hp: 500,
        speed: 0.49,
        damage: 100,
        attackInterval: 1000,
        desc: '可以跳过第一个植物',
        wave: 5,
        canVault: true
    },
    {
        id: 'screen',
        name: '铁栅门僵尸',
        icon: '🚪',
        hp: 1100,
        speed: 0.28,
        damage: 100,
        attackInterval: 1000,
        desc: '手持铁栅门作为盾牌',
        wave: 6,
        armor: 'screen',
        armorHp: 900,
        metalArmor: true
    },
    {
        id: 'football',
        name: '橄榄球僵尸',
        icon: '🪖',
        hp: 1600,
        speed: 0.49,
        damage: 100,
        attackInterval: 800,
        desc: '高速高血量的精英僵尸',
        wave: 6,
        armor: 'helmet',
        armorHp: 1400,
        metalArmor: true
    },
    {
        id: 'dancer',
        name: '舞王僵尸',
        icon: '🕺',
        hp: 500,
        speed: 0.35,
        damage: 100,
        attackInterval: 1000,
        desc: '会召唤伴舞小鬼',
        wave: 7,
        summon: true,
        summonInterval: 8000
    },
    {
        id: 'imp',
        name: '小鬼僵尸',
        icon: '👹',
        hp: 200,
        speed: 0.56,
        damage: 80,
        attackInterval: 800,
        desc: '速度快但血量低',
        wave: 4
    },
    {
        id: 'gargantuar',
        name: '巨人僵尸',
        icon: '🦍',
        hp: 3000,
        speed: 0.18,
        damage: 300,
        attackInterval: 1500,
        desc: '巨大僵尸，一击粉碎植物',
        wave: 8,
        throwImp: true,
        throwHpThreshold: 1500
    }
];

/**
 * 波次配置 - 每波出现的僵尸
 */
const WAVE_CONFIG = [
    { zombies: ['normal', 'normal', 'normal'] },
    { zombies: ['normal', 'normal', 'cone', 'normal'] },
    { zombies: ['normal', 'cone', 'cone', 'newspaper'] },
    { zombies: ['cone', 'cone', 'bucket', 'newspaper', 'imp'] },
    { zombies: ['cone', 'bucket', 'polevault', 'imp', 'imp'] },
    { zombies: ['bucket', 'bucket', 'football', 'polevault', 'screen'] },
    { zombies: ['football', 'bucket', 'dancer', 'screen', 'cone', 'cone'] },
    { zombies: ['football', 'football', 'gargantuar', 'bucket', 'screen', 'imp'] },
    { zombies: ['gargantuar', 'football', 'football', 'dancer', 'bucket', 'bucket', 'screen'] },
    { zombies: ['gargantuar', 'gargantuar', 'football', 'football', 'dancer', 'bucket', 'bucket', 'screen', 'imp', 'imp'] }
];
