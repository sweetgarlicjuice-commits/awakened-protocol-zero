// ============================================================
// TOWER 3 ENEMIES - Shadow Keep
// Edit this file to add/modify enemies for Tower 3
// ============================================================

export const TOWER3_ENEMIES = {
  normal: [
    {
      id: 'shadow_wisp',
      name: 'Shadow Wisp',
      icon: '🌑',
      baseHp: 130,
      baseAtk: 28,
      baseDef: 8,
      expReward: 70,
      goldReward: { min: 30, max: 55 },
      floors: [1, 2, 3]
    },
    {
      id: 'dark_stalker',
      name: 'Dark Stalker',
      icon: '👤',
      baseHp: 150,
      baseAtk: 32,
      baseDef: 10,
      expReward: 85,
      goldReward: { min: 35, max: 65 },
      floors: [2, 3, 4, 5]
    },
    {
      id: 'shadow_hound',
      name: 'Shadow Hound',
      icon: '🐕',
      baseHp: 140,
      baseAtk: 38,
      baseDef: 8,
      expReward: 95,
      goldReward: { min: 40, max: 75 },
      floors: [4, 5, 6, 7]
    },
    {
      id: 'dark_knight',
      name: 'Dark Knight',
      icon: '⚔️',
      baseHp: 200,
      baseAtk: 40,
      baseDef: 18,
      expReward: 110,
      goldReward: { min: 50, max: 90 },
      floors: [5, 6, 7, 8, 9]
    },
    {
      id: 'shadow_mage',
      name: 'Shadow Mage',
      icon: '🧙',
      baseHp: 160,
      baseAtk: 48,
      baseDef: 10,
      expReward: 130,
      goldReward: { min: 55, max: 100 },
      floors: [7, 8, 9, 10]
    },
    {
      id: 'nightmare_spawn',
      name: 'Nightmare Spawn',
      icon: '😈',
      baseHp: 180,
      baseAtk: 52,
      baseDef: 12,
      expReward: 150,
      goldReward: { min: 65, max: 120 },
      floors: [9, 10, 11, 12]
    }
  ],

  elite: [
    {
      id: 'shadow_champion',
      name: 'Shadow Champion',
      icon: '🦇',
      baseHp: 550,
      baseAtk: 70,
      baseDef: 28,
      expReward: 350,
      goldReward: { min: 175, max: 350 },
      floors: [13, 14],
      isElite: true
    },
    {
      id: 'dark_executioner',
      name: 'Dark Executioner',
      icon: '⚰️',
      baseHp: 500,
      baseAtk: 78,
      baseDef: 22,
      expReward: 380,
      goldReward: { min: 190, max: 380 },
      floors: [13, 14],
      isElite: true
    }
  ],

  boss: {
    id: 'shadow_lord',
    name: 'Shadow Lord',
    icon: '👑🌑',
    baseHp: 1200,
    baseAtk: 85,
    baseDef: 35,
    expReward: 800,
    goldReward: { min: 400, max: 800 },
    floor: 15,
    isBoss: true
  }
};

export default TOWER3_ENEMIES;
