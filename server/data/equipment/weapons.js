// ============================================================
// WEAPONS DATABASE
// Easy to edit - just add new entries following the pattern
// ============================================================

export const WEAPONS = {
  
  // ============================================================
  // SWORDSMAN WEAPONS (Swords, Greatswords)
  // ============================================================
  
  // Common (Floor 1-3)
  wooden_sword: {
    id: 'wooden_sword',
    name: 'Wooden Sword',
    icon: '🗡️',
    type: 'weapon',
    slot: 'mainHand',
    class: 'swordsman',
    rarity: 'common',
    stats: { pAtk: 5 },
    dropFloor: 1,
    buyPrice: 100,
    sellPrice: 25,
    description: 'A basic training sword made of wood.'
  },
  
  iron_sword: {
    id: 'iron_sword',
    name: 'Iron Sword',
    icon: '⚔️',
    type: 'weapon',
    slot: 'mainHand',
    class: 'swordsman',
    rarity: 'common',
    stats: { pAtk: 10 },
    dropFloor: 2,
    buyPrice: 250,
    sellPrice: 60,
    description: 'A sturdy iron blade.'
  },
  
  // Uncommon (Floor 3-6)
  steel_sword: {
    id: 'steel_sword',
    name: 'Steel Sword',
    icon: '⚔️',
    type: 'weapon',
    slot: 'mainHand',
    class: 'swordsman',
    rarity: 'uncommon',
    stats: { pAtk: 18, str: 2 },
    dropFloor: 3,
    buyPrice: 600,
    sellPrice: 150,
    description: 'A well-crafted steel blade.'
  },
  
  knights_blade: {
    id: 'knights_blade',
    name: "Knight's Blade",
    icon: '⚔️',
    type: 'weapon',
    slot: 'mainHand',
    class: 'swordsman',
    rarity: 'uncommon',
    stats: { pAtk: 25, str: 3, vit: 2 },
    dropFloor: 5,
    buyPrice: 1200,
    sellPrice: 300,
    description: 'A blade worthy of a knight.'
  },
  
  // Rare (Floor 6-10)
  flamebrand: {
    id: 'flamebrand',
    name: 'Flamebrand',
    icon: '🔥',
    type: 'weapon',
    slot: 'mainHand',
    class: 'swordsman',
    rarity: 'rare',
    stats: { pAtk: 35, str: 5 },
    element: 'fire',
    dropFloor: 7,
    buyPrice: 2500,
    sellPrice: 625,
    description: 'A blade that burns with eternal flame.'
  },
  
  frostbite_blade: {
    id: 'frostbite_blade',
    name: 'Frostbite Blade',
    icon: '❄️',
    type: 'weapon',
    slot: 'mainHand',
    class: 'swordsman',
    rarity: 'rare',
    stats: { pAtk: 32, str: 4, agi: 3 },
    element: 'ice',
    dropFloor: 7,
    buyPrice: 2500,
    sellPrice: 625,
    description: 'Ice crystals form along its edge.'
  },
  
  thunderclap: {
    id: 'thunderclap',
    name: 'Thunderclap',
    icon: '⚡',
    type: 'weapon',
    slot: 'mainHand',
    class: 'swordsman',
    rarity: 'rare',
    stats: { pAtk: 38, agi: 5, critRate: 3 },
    element: 'lightning',
    dropFloor: 8,
    buyPrice: 3000,
    sellPrice: 750,
    description: 'Thunder echoes with each swing.'
  },
  
  // Epic (Floor 10-13)
  dragon_slayer: {
    id: 'dragon_slayer',
    name: 'Dragon Slayer',
    icon: '🐉',
    type: 'weapon',
    slot: 'mainHand',
    class: 'swordsman',
    rarity: 'epic',
    stats: { pAtk: 55, str: 8, vit: 5, critDmg: 10 },
    dropFloor: 10,
    buyPrice: 8000,
    sellPrice: 2000,
    description: 'Forged from dragon bones and scales.'
  },
  
  void_cleaver: {
    id: 'void_cleaver',
    name: 'Void Cleaver',
    icon: '🌀',
    type: 'weapon',
    slot: 'mainHand',
    class: 'swordsman',
    rarity: 'epic',
    stats: { pAtk: 50, str: 6, int: 4, mAtk: 20 },
    element: 'dark',
    dropFloor: 12,
    buyPrice: 10000,
    sellPrice: 2500,
    description: 'A blade that cuts through dimensions.'
  },
  
  // Legendary (Floor 13-15)
  excalibur: {
    id: 'excalibur',
    name: 'Excalibur',
    icon: '✨',
    type: 'weapon',
    slot: 'mainHand',
    class: 'swordsman',
    rarity: 'legendary',
    stats: { pAtk: 80, str: 15, vit: 10, critRate: 5, critDmg: 20 },
    element: 'holy',
    dropFloor: 15,
    buyPrice: null, // Cannot buy
    sellPrice: 5000,
    description: 'The legendary sword of kings.'
  },
  
  
  // ============================================================
  // THIEF WEAPONS (Daggers, Claws)
  // ============================================================
  
  // Common
  rusty_dagger: {
    id: 'rusty_dagger',
    name: 'Rusty Dagger',
    icon: '🔪',
    type: 'weapon',
    slot: 'mainHand',
    class: 'thief',
    rarity: 'common',
    stats: { pAtk: 4, agi: 1 },
    dropFloor: 1,
    buyPrice: 80,
    sellPrice: 20,
    description: 'A worn but still sharp dagger.'
  },
  
  iron_dagger: {
    id: 'iron_dagger',
    name: 'Iron Dagger',
    icon: '🗡️',
    type: 'weapon',
    slot: 'mainHand',
    class: 'thief',
    rarity: 'common',
    stats: { pAtk: 8, agi: 2 },
    dropFloor: 2,
    buyPrice: 200,
    sellPrice: 50,
    description: 'A reliable iron dagger.'
  },
  
  // Uncommon
  assassins_blade: {
    id: 'assassins_blade',
    name: "Assassin's Blade",
    icon: '🔪',
    type: 'weapon',
    slot: 'mainHand',
    class: 'thief',
    rarity: 'uncommon',
    stats: { pAtk: 15, agi: 4, critRate: 3 },
    dropFloor: 4,
    buyPrice: 800,
    sellPrice: 200,
    description: 'Silent and deadly.'
  },
  
  venom_fang: {
    id: 'venom_fang',
    name: 'Venom Fang',
    icon: '🐍',
    type: 'weapon',
    slot: 'mainHand',
    class: 'thief',
    rarity: 'uncommon',
    stats: { pAtk: 18, agi: 3, dex: 3 },
    element: 'nature',
    dropFloor: 5,
    buyPrice: 1000,
    sellPrice: 250,
    description: 'Coated with paralyzing venom.'
  },
  
  // Rare
  shadow_claw: {
    id: 'shadow_claw',
    name: 'Shadow Claw',
    icon: '🌑',
    type: 'weapon',
    slot: 'mainHand',
    class: 'thief',
    rarity: 'rare',
    stats: { pAtk: 28, agi: 6, critRate: 5 },
    element: 'dark',
    dropFloor: 7,
    buyPrice: 2200,
    sellPrice: 550,
    description: 'Strikes from the shadows.'
  },
  
  bloodthirst: {
    id: 'bloodthirst',
    name: 'Bloodthirst',
    icon: '🩸',
    type: 'weapon',
    slot: 'mainHand',
    class: 'thief',
    rarity: 'rare',
    stats: { pAtk: 32, agi: 5, critDmg: 15 },
    dropFloor: 8,
    buyPrice: 2800,
    sellPrice: 700,
    description: 'Grows stronger with each kill.'
  },
  
  // Epic
  phantom_edge: {
    id: 'phantom_edge',
    name: 'Phantom Edge',
    icon: '👻',
    type: 'weapon',
    slot: 'mainHand',
    class: 'thief',
    rarity: 'epic',
    stats: { pAtk: 45, agi: 10, critRate: 8, critDmg: 20 },
    element: 'dark',
    dropFloor: 11,
    buyPrice: 7500,
    sellPrice: 1875,
    description: 'Phases through armor.'
  },
  
  // Legendary
  deaths_whisper: {
    id: 'deaths_whisper',
    name: "Death's Whisper",
    icon: '💀',
    type: 'weapon',
    slot: 'mainHand',
    class: 'thief',
    rarity: 'legendary',
    stats: { pAtk: 70, agi: 18, critRate: 12, critDmg: 35 },
    element: 'dark',
    dropFloor: 15,
    buyPrice: null,
    sellPrice: 4500,
    description: 'The last thing enemies hear.'
  },
  
  
  // ============================================================
  // ARCHER WEAPONS (Bows, Crossbows)
  // ============================================================
  
  // Common
  short_bow: {
    id: 'short_bow',
    name: 'Short Bow',
    icon: '🏹',
    type: 'weapon',
    slot: 'mainHand',
    class: 'archer',
    rarity: 'common',
    stats: { pAtk: 6, dex: 1 },
    dropFloor: 1,
    buyPrice: 120,
    sellPrice: 30,
    description: 'A basic hunting bow.'
  },
  
  longbow: {
    id: 'longbow',
    name: 'Longbow',
    icon: '🏹',
    type: 'weapon',
    slot: 'mainHand',
    class: 'archer',
    rarity: 'common',
    stats: { pAtk: 12, dex: 2 },
    dropFloor: 2,
    buyPrice: 300,
    sellPrice: 75,
    description: 'Greater range and power.'
  },
  
  // Uncommon
  composite_bow: {
    id: 'composite_bow',
    name: 'Composite Bow',
    icon: '🏹',
    type: 'weapon',
    slot: 'mainHand',
    class: 'archer',
    rarity: 'uncommon',
    stats: { pAtk: 20, dex: 4, agi: 2 },
    dropFloor: 4,
    buyPrice: 900,
    sellPrice: 225,
    description: 'Layered materials for extra power.'
  },
  
  hunters_bow: {
    id: 'hunters_bow',
    name: "Hunter's Bow",
    icon: '🎯',
    type: 'weapon',
    slot: 'mainHand',
    class: 'archer',
    rarity: 'uncommon',
    stats: { pAtk: 24, dex: 5, critRate: 3 },
    dropFloor: 5,
    buyPrice: 1100,
    sellPrice: 275,
    description: 'Precision engineered for hunting.'
  },
  
  // Rare
  storm_bow: {
    id: 'storm_bow',
    name: 'Storm Bow',
    icon: '⚡',
    type: 'weapon',
    slot: 'mainHand',
    class: 'archer',
    rarity: 'rare',
    stats: { pAtk: 35, dex: 6, agi: 4 },
    element: 'lightning',
    dropFloor: 7,
    buyPrice: 2400,
    sellPrice: 600,
    description: 'Arrows crackle with electricity.'
  },
  
  phoenix_bow: {
    id: 'phoenix_bow',
    name: 'Phoenix Bow',
    icon: '🔥',
    type: 'weapon',
    slot: 'mainHand',
    class: 'archer',
    rarity: 'rare',
    stats: { pAtk: 38, dex: 5, critDmg: 12 },
    element: 'fire',
    dropFloor: 8,
    buyPrice: 2800,
    sellPrice: 700,
    description: 'Arrows ignite upon release.'
  },
  
  // Epic
  windripper: {
    id: 'windripper',
    name: 'Windripper',
    icon: '🌪️',
    type: 'weapon',
    slot: 'mainHand',
    class: 'archer',
    rarity: 'epic',
    stats: { pAtk: 52, dex: 10, agi: 8, critRate: 6 },
    dropFloor: 11,
    buyPrice: 8500,
    sellPrice: 2125,
    description: 'Arrows fly faster than the wind.'
  },
  
  // Legendary
  artemis_grace: {
    id: 'artemis_grace',
    name: "Artemis' Grace",
    icon: '🌙',
    type: 'weapon',
    slot: 'mainHand',
    class: 'archer',
    rarity: 'legendary',
    stats: { pAtk: 75, dex: 20, agi: 12, critRate: 10, critDmg: 25 },
    element: 'holy',
    dropFloor: 15,
    buyPrice: null,
    sellPrice: 4800,
    description: 'Blessed by the goddess of the hunt.'
  },
  
  
  // ============================================================
  // MAGE WEAPONS (Staffs, Wands, Orbs)
  // ============================================================
  
  // Common
  wooden_staff: {
    id: 'wooden_staff',
    name: 'Wooden Staff',
    icon: '🪄',
    type: 'weapon',
    slot: 'mainHand',
    class: 'mage',
    rarity: 'common',
    stats: { mAtk: 8, int: 1 },
    dropFloor: 1,
    buyPrice: 100,
    sellPrice: 25,
    description: 'A simple channeling focus.'
  },
  
  apprentice_wand: {
    id: 'apprentice_wand',
    name: 'Apprentice Wand',
    icon: '🪄',
    type: 'weapon',
    slot: 'mainHand',
    class: 'mage',
    rarity: 'common',
    stats: { mAtk: 12, int: 2, mp: 10 },
    dropFloor: 2,
    buyPrice: 280,
    sellPrice: 70,
    description: 'Standard issue for magic students.'
  },
  
  // Uncommon
  crystal_staff: {
    id: 'crystal_staff',
    name: 'Crystal Staff',
    icon: '💎',
    type: 'weapon',
    slot: 'mainHand',
    class: 'mage',
    rarity: 'uncommon',
    stats: { mAtk: 22, int: 4, mp: 20 },
    dropFloor: 4,
    buyPrice: 950,
    sellPrice: 235,
    description: 'Amplifies magical energy.'
  },
  
  flame_rod: {
    id: 'flame_rod',
    name: 'Flame Rod',
    icon: '🔥',
    type: 'weapon',
    slot: 'mainHand',
    class: 'mage',
    rarity: 'uncommon',
    stats: { mAtk: 26, int: 5 },
    element: 'fire',
    dropFloor: 5,
    buyPrice: 1100,
    sellPrice: 275,
    description: 'Burns with inner fire.'
  },
  
  // Rare
  frost_scepter: {
    id: 'frost_scepter',
    name: 'Frost Scepter',
    icon: '❄️',
    type: 'weapon',
    slot: 'mainHand',
    class: 'mage',
    rarity: 'rare',
    stats: { mAtk: 38, int: 7, mp: 30 },
    element: 'ice',
    dropFloor: 7,
    buyPrice: 2600,
    sellPrice: 650,
    description: 'Cold mist surrounds its crystal.'
  },
  
  thunder_staff: {
    id: 'thunder_staff',
    name: 'Thunder Staff',
    icon: '⚡',
    type: 'weapon',
    slot: 'mainHand',
    class: 'mage',
    rarity: 'rare',
    stats: { mAtk: 42, int: 6, critRate: 4 },
    element: 'lightning',
    dropFloor: 8,
    buyPrice: 3000,
    sellPrice: 750,
    description: 'Channels raw lightning.'
  },
  
  void_orb: {
    id: 'void_orb',
    name: 'Void Orb',
    icon: '🌀',
    type: 'weapon',
    slot: 'mainHand',
    class: 'mage',
    rarity: 'rare',
    stats: { mAtk: 40, int: 8, mp: 40 },
    element: 'dark',
    dropFloor: 9,
    buyPrice: 3200,
    sellPrice: 800,
    description: 'Contains a fragment of the void.'
  },
  
  // Epic
  archmage_staff: {
    id: 'archmage_staff',
    name: 'Archmage Staff',
    icon: '🔮',
    type: 'weapon',
    slot: 'mainHand',
    class: 'mage',
    rarity: 'epic',
    stats: { mAtk: 60, int: 12, mp: 60, critDmg: 15 },
    dropFloor: 11,
    buyPrice: 9000,
    sellPrice: 2250,
    description: 'Wielded by the greatest mages.'
  },
  
  // Legendary
  staff_of_eternity: {
    id: 'staff_of_eternity',
    name: 'Staff of Eternity',
    icon: '✨',
    type: 'weapon',
    slot: 'mainHand',
    class: 'mage',
    rarity: 'legendary',
    stats: { mAtk: 90, int: 22, mp: 100, critRate: 8, critDmg: 25 },
    element: 'holy',
    dropFloor: 15,
    buyPrice: null,
    sellPrice: 5500,
    description: 'Time bends around its wielder.'
  },
  
  
  // ============================================================
  // UNIVERSAL WEAPONS (Any class)
  // ============================================================
  
  broken_blade: {
    id: 'broken_blade',
    name: 'Broken Blade',
    icon: '🗡️',
    type: 'weapon',
    slot: 'mainHand',
    class: 'any',
    rarity: 'common',
    stats: { pAtk: 3 },
    dropFloor: 1,
    buyPrice: 50,
    sellPrice: 10,
    description: 'Better than nothing.'
  }
};

// Helper: Get weapons by class
export const getWeaponsByClass = (className) => {
  return Object.values(WEAPONS).filter(w => w.class === className || w.class === 'any');
};

// Helper: Get weapons by rarity
export const getWeaponsByRarity = (rarity) => {
  return Object.values(WEAPONS).filter(w => w.rarity === rarity);
};

// Helper: Get weapons for floor range
export const getWeaponsForFloor = (floor) => {
  return Object.values(WEAPONS).filter(w => w.dropFloor <= floor);
};
