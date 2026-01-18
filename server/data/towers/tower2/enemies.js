// ============================================================
// TOWER 2 ENEMIES - Frost Citadel
// Edit this file to add/modify enemies for Tower 2
// ============================================================

export const TOWER2_ENEMIES = {
  normal: [
    {
      id: 'ice_slime',
      name: 'Ice Slime',
      icon: '🧊',
      baseHp: 80,
      baseAtk: 15,
      baseDef: 5,
      expReward: 35,
      goldReward: { min: 12, max: 25 },
      floors: [1, 2, 3]
    },
    {
      id: 'frost_sprite',
      name: 'Frost Sprite',
      icon: '❄️',
      baseHp: 70,
      baseAtk: 18,
      baseDef: 4,
      expReward: 40,
      goldReward: { min: 15, max: 30 },
      floors: [2, 3, 4, 5]
    },
    {
      id: 'frozen_skeleton',
      name: 'Frozen Skeleton',
      icon: '💀❄️',
      baseHp: 100,
      baseAtk: 20,
      baseDef: 8,
      expReward: 50,
      goldReward: { min: 20, max: 40 },
      floors: [4, 5, 6, 7]
    },
    {
      id: 'ice_golem',
      name: 'Ice Golem',
      icon: '🗿',
      baseHp: 150,
      baseAtk: 22,
      baseDef: 15,
      expReward: 60,
      goldReward: { min: 25, max: 50 },
      floors: [5, 6, 7, 8, 9]
    },
    {
      id: 'frost_elemental',
      name: 'Frost Elemental',
      icon: '🌀',
      baseHp: 120,
      baseAtk: 28,
      baseDef: 6,
      expReward: 70,
      goldReward: { min: 30, max: 55 },
      floors: [7, 8, 9, 10]
    },
    {
      id: 'ice_wraith',
      name: 'Ice Wraith',
      icon: '👻❄️',
      baseHp: 100,
      baseAtk: 32,
      baseDef: 4,
      expReward: 80,
      goldReward: { min: 35, max: 60 },
      floors: [9, 10, 11, 12]
    }
  ],

  elite: [
    {
      id: 'frost_giant',
      name: 'Frost Giant',
      icon: '🗿❄️',
      baseHp: 400,
      baseAtk: 45,
      baseDef: 20,
      expReward: 200,
      goldReward: { min: 100, max: 200 },
      floors: [13, 14],
      isElite: true
    },
    {
      id: 'ice_queen',
      name: 'Ice Queen',
      icon: '👑❄️',
      baseHp: 350,
      baseAtk: 50,
      baseDef: 15,
      expReward: 220,
      goldReward: { min: 110, max: 220 },
      floors: [13, 14],
      isElite: true
    }
  ],

  boss: {
    id: 'frost_wyrm',
    name: 'Frost Wyrm',
    icon: '🐲❄️',
    baseHp: 800,
    baseAtk: 55,
    baseDef: 25,
    expReward: 500,
    goldReward: { min: 250, max: 500 },
    floor: 15,
    isBoss: true
  }
};

export default TOWER2_ENEMIES;
