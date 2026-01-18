// ============================================================
// TOWER 5 ENEMIES - Verdant Spire
// Edit this file to add/modify enemies for Tower 5
// ============================================================

export const TOWER5_ENEMIES = {
  normal: [
    {
      id: 'vine_creeper',
      name: 'Vine Creeper',
      icon: '🌿',
      baseHp: 250,
      baseAtk: 58,
      baseDef: 18,
      expReward: 180,
      goldReward: { min: 80, max: 150 },
      floors: [1, 2, 3]
    },
    {
      id: 'thorn_beast',
      name: 'Thorn Beast',
      icon: '🌹',
      baseHp: 300,
      baseAtk: 65,
      baseDef: 22,
      expReward: 210,
      goldReward: { min: 95, max: 175 },
      floors: [2, 3, 4, 5]
    },
    {
      id: 'poison_bloom',
      name: 'Poison Bloom',
      icon: '🌸',
      baseHp: 220,
      baseAtk: 78,
      baseDef: 15,
      expReward: 240,
      goldReward: { min: 110, max: 200 },
      floors: [4, 5, 6, 7]
    },
    {
      id: 'moss_golem',
      name: 'Moss Golem',
      icon: '🗿',
      baseHp: 400,
      baseAtk: 72,
      baseDef: 35,
      expReward: 270,
      goldReward: { min: 125, max: 230 },
      floors: [5, 6, 7, 8, 9]
    },
    {
      id: 'forest_spirit',
      name: 'Forest Spirit',
      icon: '🧚',
      baseHp: 280,
      baseAtk: 88,
      baseDef: 20,
      expReward: 300,
      goldReward: { min: 140, max: 260 },
      floors: [7, 8, 9, 10]
    },
    {
      id: 'elder_ent',
      name: 'Elder Ent',
      icon: '🌲',
      baseHp: 380,
      baseAtk: 92,
      baseDef: 30,
      expReward: 330,
      goldReward: { min: 155, max: 290 },
      floors: [9, 10, 11, 12]
    }
  ],

  elite: [
    {
      id: 'ancient_treant',
      name: 'Ancient Treant',
      icon: '🌳💚',
      baseHp: 1000,
      baseAtk: 120,
      baseDef: 50,
      expReward: 700,
      goldReward: { min: 350, max: 700 },
      floors: [13, 14],
      isElite: true
    },
    {
      id: 'nature_warden',
      name: 'Nature Warden',
      icon: '🧝',
      baseHp: 900,
      baseAtk: 135,
      baseDef: 42,
      expReward: 780,
      goldReward: { min: 390, max: 780 },
      floors: [13, 14],
      isElite: true
    }
  ],

  boss: {
    id: 'guardian_treant',
    name: 'Guardian Treant',
    icon: '🌳👑',
    baseHp: 2500,
    baseAtk: 150,
    baseDef: 60,
    expReward: 1800,
    goldReward: { min: 900, max: 1800 },
    floor: 15,
    isBoss: true
  }
};

export default TOWER5_ENEMIES;
