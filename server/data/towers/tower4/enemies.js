// ============================================================
// TOWER 4 ENEMIES - Storm Bastion
// Edit this file to add/modify enemies for Tower 4
// ============================================================

export const TOWER4_ENEMIES = {
  normal: [
    {
      id: 'spark_sprite',
      name: 'Spark Sprite',
      icon: '⚡',
      baseHp: 180,
      baseAtk: 42,
      baseDef: 12,
      expReward: 120,
      goldReward: { min: 50, max: 90 },
      floors: [1, 2, 3]
    },
    {
      id: 'storm_elemental',
      name: 'Storm Elemental',
      icon: '🌩️',
      baseHp: 220,
      baseAtk: 48,
      baseDef: 15,
      expReward: 140,
      goldReward: { min: 60, max: 110 },
      floors: [2, 3, 4, 5]
    },
    {
      id: 'thunder_hound',
      name: 'Thunder Hound',
      icon: '🐺',
      baseHp: 200,
      baseAtk: 55,
      baseDef: 14,
      expReward: 160,
      goldReward: { min: 70, max: 130 },
      floors: [4, 5, 6, 7]
    },
    {
      id: 'lightning_knight',
      name: 'Lightning Knight',
      icon: '⚔️⚡',
      baseHp: 280,
      baseAtk: 58,
      baseDef: 22,
      expReward: 180,
      goldReward: { min: 80, max: 150 },
      floors: [5, 6, 7, 8, 9]
    },
    {
      id: 'storm_mage',
      name: 'Storm Mage',
      icon: '🧙⚡',
      baseHp: 220,
      baseAtk: 68,
      baseDef: 15,
      expReward: 200,
      goldReward: { min: 90, max: 170 },
      floors: [7, 8, 9, 10]
    },
    {
      id: 'thunderbird',
      name: 'Thunderbird',
      icon: '🦅',
      baseHp: 250,
      baseAtk: 72,
      baseDef: 18,
      expReward: 220,
      goldReward: { min: 100, max: 190 },
      floors: [9, 10, 11, 12]
    }
  ],

  elite: [
    {
      id: 'storm_giant',
      name: 'Storm Giant',
      icon: '🗿⚡',
      baseHp: 750,
      baseAtk: 95,
      baseDef: 38,
      expReward: 500,
      goldReward: { min: 250, max: 500 },
      floors: [13, 14],
      isElite: true
    },
    {
      id: 'thunder_lord',
      name: 'Thunder Lord',
      icon: '👑⚡',
      baseHp: 680,
      baseAtk: 105,
      baseDef: 32,
      expReward: 550,
      goldReward: { min: 275, max: 550 },
      floors: [13, 14],
      isElite: true
    }
  ],

  boss: {
    id: 'storm_titan',
    name: 'Storm Titan',
    icon: '👁️⚡',
    baseHp: 1800,
    baseAtk: 120,
    baseDef: 45,
    expReward: 1200,
    goldReward: { min: 600, max: 1200 },
    floor: 15,
    isBoss: true
  }
};

export default TOWER4_ENEMIES;
