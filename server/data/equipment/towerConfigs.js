// ============================================================
// TOWER CONFIGURATIONS - All 10 Towers
// This defines the theme, level ranges, and set names for each tower
// ============================================================

export const TOWER_CONFIGS = {
  1: {
    id: 1,
    name: 'Crimson Spire',
    theme: 'undead',
    element: 'dark',
    icon: '🩸',
    levelRange: { min: 1, max: 15 },
    boss: { name: 'Death Knight', icon: '💀' },
    sets: {
      swordsman: 'Crimson Knight',
      thief: 'Crimson Shadow',
      archer: 'Crimson Hunter',
      mage: 'Crimson Mage'
    }
  },
  2: {
    id: 2,
    name: 'Frost Citadel',
    theme: 'ice',
    element: 'ice',
    icon: '❄️',
    levelRange: { min: 10, max: 25 },
    boss: { name: 'Frost Wyrm', icon: '🐲' },
    sets: {
      swordsman: 'Frost Warden',
      thief: 'Frost Assassin',
      archer: 'Frost Ranger',
      mage: 'Frost Weaver'
    }
  },
  3: {
    id: 3,
    name: 'Shadow Keep',
    theme: 'shadow',
    element: 'dark',
    icon: '🌑',
    levelRange: { min: 20, max: 35 },
    boss: { name: 'Shadow Lord', icon: '👑' },
    sets: {
      swordsman: 'Shadow Knight',
      thief: 'Shadow Dancer',
      archer: 'Shadow Stalker',
      mage: 'Shadow Mage'
    }
  },
  4: {
    id: 4,
    name: 'Storm Bastion',
    theme: 'storm',
    element: 'lightning',
    icon: '⚡',
    levelRange: { min: 30, max: 45 },
    boss: { name: 'Storm Titan', icon: '👁️' },
    sets: {
      swordsman: 'Storm Knight',
      thief: 'Storm Striker',
      archer: 'Storm Archer',
      mage: 'Storm Mage'
    }
  },
  5: {
    id: 5,
    name: 'Verdant Spire',
    theme: 'nature',
    element: 'nature',
    icon: '🌿',
    levelRange: { min: 40, max: 55 },
    boss: { name: 'Guardian Treant', icon: '🌳' },
    sets: {
      swordsman: 'Forest Guardian',
      thief: 'Vine Dancer',
      archer: 'Wild Hunter',
      mage: 'Druid'
    }
  },
  6: {
    id: 6,
    name: 'Infernal Fortress',
    theme: 'fire',
    element: 'fire',
    icon: '🔥',
    levelRange: { min: 50, max: 65 },
    boss: { name: 'Arch Demon', icon: '😈' },
    sets: {
      swordsman: 'Infernal Knight',
      thief: 'Flame Assassin',
      archer: 'Infernal Hunter',
      mage: 'Pyromancer'
    }
  },
  7: {
    id: 7,
    name: 'Abyssal Depths',
    theme: 'water',
    element: 'water',
    icon: '🌊',
    levelRange: { min: 60, max: 75 },
    boss: { name: 'Leviathan', icon: '🐙' },
    sets: {
      swordsman: 'Abyssal Knight',
      thief: 'Tide Walker',
      archer: 'Abyssal Hunter',
      mage: 'Tide Mage'
    }
  },
  8: {
    id: 8,
    name: 'Crystal Caverns',
    theme: 'crystal',
    element: 'holy',
    icon: '💎',
    levelRange: { min: 70, max: 85 },
    boss: { name: 'Prism Guardian', icon: '🌈' },
    sets: {
      swordsman: 'Crystal Knight',
      thief: 'Prism Assassin',
      archer: 'Crystal Hunter',
      mage: 'Crystal Mage'
    }
  },
  9: {
    id: 9,
    name: 'Void Sanctum',
    theme: 'void',
    element: 'dark',
    icon: '🌀',
    levelRange: { min: 80, max: 95 },
    boss: { name: 'Void Lord', icon: '⬛' },
    sets: {
      swordsman: 'Void Knight',
      thief: 'Void Walker',
      archer: 'Void Hunter',
      mage: 'Void Mage'
    }
  },
  10: {
    id: 10,
    name: 'Celestial Pinnacle',
    theme: 'celestial',
    element: 'holy',
    icon: '✨',
    levelRange: { min: 90, max: 100 },
    boss: { name: 'Archangel', icon: '👼' },
    sets: {
      swordsman: 'Celestial Knight',
      thief: 'Divine Assassin',
      archer: 'Celestial Hunter',
      mage: 'Archangel Mage'
    }
  }
};

// Stat scaling per tower tier
export const TOWER_STAT_SCALING = {
  // Base stats multiplied by tower tier
  weapon: {
    common: { pAtk: 8, mAtk: 10 },
    uncommon: { pAtk: 18, mAtk: 22 },
    rare: { pAtk: 35, mAtk: 42 },
    epic: { pAtk: 55, mAtk: 65 }
  },
  armor: {
    common: { pDef: 5, mDef: 4, hp: 20 },
    uncommon: { pDef: 12, mDef: 10, hp: 50 },
    rare: { pDef: 25, mDef: 20, hp: 100 },
    epic: { pDef: 40, mDef: 35, hp: 150 }
  },
  accessory: {
    common: { hp: 20, stat: 3 },
    uncommon: { hp: 50, stat: 6 },
    rare: { hp: 90, stat: 12 },
    epic: { hp: 150, stat: 20 }
  }
};

// Equipment slot definitions
export const EQUIPMENT_SLOTS = ['head', 'body', 'hands', 'feet'];
export const ACCESSORY_SLOTS = ['ring', 'necklace', 'cape'];
export const WEAPON_SLOT = 'mainHand';

// Class definitions
export const CLASSES = ['swordsman', 'thief', 'archer', 'mage'];

export default TOWER_CONFIGS;
