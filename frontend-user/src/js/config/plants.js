/**
 * 20种植物配置
 */
const PLANTS_DATA = [
    {
        id: 'peashooter',
        name: '豌豆射手',
        icon: '🌱',
        cost: 100,
        hp: 300,
        desc: '发射豌豆攻击僵尸',
        attackInterval: 1500,
        projectile: 'PEA',
        type: 'shooter'
    },
    {
        id: 'sunflower',
        name: '向日葵',
        icon: '🌻',
        cost: 50,
        hp: 300,
        desc: '定期产生阳光',
        sunInterval: 9000,
        sunAmount: 50,
        type: 'producer'
    },
    {
        id: 'wallnut',
        name: '坚果墙',
        icon: '🥜',
        cost: 50,
        hp: 4000,
        desc: '高血量防御植物',
        type: 'wall'
    },
    {
        id: 'snowpea',
        name: '寒冰射手',
        icon: '❄️',
        cost: 175,
        hp: 300,
        desc: '发射冰冻豌豆减速僵尸',
        attackInterval: 1500,
        projectile: 'FROZEN_PEA',
        type: 'shooter'
    },
    {
        id: 'repeater',
        name: '双发射手',
        icon: '🌿',
        cost: 200,
        hp: 300,
        desc: '一次发射两颗豌豆',
        attackInterval: 1500,
        projectile: 'PEA',
        shots: 2,
        type: 'shooter'
    },
    {
        id: 'threepeater',
        name: '三线射手',
        icon: '☘️',
        cost: 325,
        hp: 300,
        desc: '同时向三行发射豌豆',
        attackInterval: 1500,
        projectile: 'PEA',
        threeRow: true,
        type: 'shooter'
    },
    {
        id: 'torchwood',
        name: '火炬树桩',
        icon: '🔥',
        cost: 175,
        hp: 300,
        desc: '经过的豌豆变为火焰豌豆',
        type: 'torch'
    },
    {
        id: 'chomper',
        name: '大嘴花',
        icon: '🌺',
        cost: 150,
        hp: 300,
        desc: '一口吞掉前方僵尸',
        attackInterval: 30000,
        chompDamage: 1800,
        type: 'chomper'
    },
    {
        id: 'potatomine',
        name: '土豆雷',
        icon: '🥔',
        cost: 25,
        hp: 300,
        desc: '准备后炸飞接触的僵尸',
        armTime: 12000,
        explodeDamage: 1800,
        type: 'mine'
    },
    {
        id: 'cactus',
        name: '仙人掌',
        icon: '🌵',
        cost: 125,
        hp: 300,
        desc: '发射尖刺攻击僵尸',
        attackInterval: 1500,
        projectile: 'NEEDLE',
        type: 'shooter'
    },
    {
        id: 'magnetshroom',
        name: '磁力菇',
        icon: '🧲',
        cost: 100,
        hp: 300,
        desc: '吸走僵尸的金属防具',
        magnetInterval: 12000,
        type: 'magnet'
    },
    {
        id: 'pumpkin',
        name: '南瓜头',
        icon: '🎃',
        cost: 125,
        hp: 4000,
        desc: '可套在其他植物上的护甲',
        type: 'armor'
    },
    {
        id: 'starfruit',
        name: '杨桃',
        icon: '⭐',
        cost: 125,
        hp: 300,
        desc: '向五个方向发射星星',
        attackInterval: 1500,
        projectile: 'STAR',
        type: 'starfruit'
    },
    {
        id: 'cornpult',
        name: '玉米投手',
        icon: '🌽',
        cost: 100,
        hp: 300,
        desc: '投掷玉米粒攻击僵尸',
        attackInterval: 2500,
        projectile: 'CORN',
        type: 'lobber'
    },
    {
        id: 'cabbagepult',
        name: '卷心菜投手',
        icon: '🥬',
        cost: 100,
        hp: 300,
        desc: '投掷卷心菜攻击僵尸',
        attackInterval: 2500,
        projectile: 'CABBAGE',
        type: 'lobber'
    },
    {
        id: 'melonpult',
        name: '西瓜投手',
        icon: '🍉',
        cost: 300,
        hp: 300,
        desc: '投掷西瓜造成溅射伤害',
        attackInterval: 3000,
        projectile: 'MELON',
        type: 'lobber'
    },
    {
        id: 'spikeweed',
        name: '地刺',
        icon: '📌',
        cost: 100,
        hp: 300,
        desc: '僵尸经过时造成伤害',
        spikeDamage: 20,
        spikeInterval: 800,
        type: 'spike'
    },
    {
        id: 'jalapeno',
        name: '火爆辣椒',
        icon: '🌶️',
        cost: 125,
        hp: 300,
        desc: '燃烧整行僵尸（一次性）',
        rowDamage: 1800,
        type: 'instant_row'
    },
    {
        id: 'cherrybomb',
        name: '樱桃炸弹',
        icon: '🍒',
        cost: 150,
        hp: 300,
        desc: '炸飞周围所有僵尸（一次性）',
        explodeRadius: 1,
        explodeDamage: 1800,
        type: 'instant_bomb'
    },
    {
        id: 'squash',
        name: '窝瓜',
        icon: '🫒',
        cost: 50,
        hp: 300,
        desc: '跳起压扁附近僵尸（一次性）',
        squashDamage: 1800,
        type: 'squash'
    }
];
