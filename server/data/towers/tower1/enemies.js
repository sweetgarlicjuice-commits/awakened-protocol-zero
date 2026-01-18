// ============================================================
// TOWER 1 ENEMIES - Crimson Spire
// Edit this file to add/modify enemies for Tower 1
// ============================================================

export const TOWER1_ENEMIES = {
  normal: [
    {
      id: 'skeleton_warrior',
      name: 'Skeleton Warrior',
      icon: '💀',
      baseHp: 50,
      baseAtk: 8,
      baseDef: 3,
      expReward: 15,
      goldReward: { min: 5, max: 15 },
      floors: [1, 2, 3, 4]
    },
    {
      id: 'zombie',
      name: 'Rotting Zombie',
      icon: '🧟',
      baseHp: 70,
      baseAtk: 10,
      baseDef: 2,
      expReward: 20,
      goldReward: { min: 8, max: 20 },
      floors: [2, 3, 4, 5]
    },
    {
      id: 'skeleton_archer',
      name: 'Skeleton Archer',
      icon: '🏹',
      baseHp: 45,
      baseAtk: 12,
      baseDef: 2,
      expReward: 18,
      goldReward: { min: 6, max: 18 },
      floors: [3, 4, 5, 6]
    },
    {
      id: 'cursed_knight',
      name: 'Cursed Knight',
      icon: '⚔️',
      baseHp: 90,
      baseAtk: 14,
      baseDef: 6,
      expReward: 30,
      goldReward: { min: 12, max: 30 },
      floors: [5, 6, 7, 8, 9]
    },
    {
      id: 'ghost',
      name: 'Wandering Ghost',
      icon: '👻',
      baseHp: 60,
      baseAtk: 16,
      baseDef: 1,
      expReward: 25,
      goldReward: { min: 10, max: 25 },
      floors: [6, 7, 8, 9]
    },
    {
      id: 'bone_mage',
      name: 'Bone Mage',
      icon: '🦴',
      baseHp: 55,
      baseAtk: 18,
      baseDef: 2,
      expReward: 35,
      goldReward: { min: 15, max: 35 },
      floors: [8, 9, 10, 11, 12]
    },
    {
      id: 'skeleton_mage',
      name: 'Skeleton Mage',
      icon: '🧙',
      baseHp: 50,
      baseAtk: 20,
      baseDef: 2,
      expReward: 40,
      goldReward: { min: 18, max: 38 },
      floors: [10, 11, 12]
    }
  ],

  elite: [
    {
      id: 'bone_golem',
      name: 'Bone Golem',
      icon: '🦴💀',
      baseHp: 250,
      baseAtk: 28,
      baseDef: 15,
      expReward: 120,
      goldReward: { min: 60, max: 120 },
      floors: [13, 14],
      isElite: true
    },
    {
      id: 'wraith_lord',
      name: 'Wraith Lord',
      icon: '👻👑',
      baseHp: 220,
      baseAtk: 32,
      baseDef: 10,
      expReward: 140,
      goldReward: { min: 70, max: 140 },
      floors: [13, 14],
      isElite: true
    }
  ],

  boss: {
    id: 'death_knight',
    name: 'Death Knight',
    icon: '💀⚔️',
    baseHp: 500,
    baseAtk: 40,
    baseDef: 20,
    expReward: 300,
    goldReward: { min: 150, max: 300 },
    floor: 15,
    isBoss: true
  }
};

export default TOWER1_ENEMIES;
