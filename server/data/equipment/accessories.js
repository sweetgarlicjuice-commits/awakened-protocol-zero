// ============================================================
// ACCESSORIES DATABASE
// Easy to edit - just add new entries following the pattern
// ============================================================

export const ACCESSORIES = {
  
  // ============================================================
  // RINGS (Ring slot)
  // ============================================================
  
  // Common
  copper_ring: {
    id: 'copper_ring',
    name: 'Copper Ring',
    icon: '💍',
    type: 'accessory',
    slot: 'ring',
    class: 'any',
    rarity: 'common',
    stats: { hp: 10 },
    dropFloor: 1,
    buyPrice: 50,
    sellPrice: 12,
    description: 'A simple copper band.'
  },
  
  iron_ring: {
    id: 'iron_ring',
    name: 'Iron Ring',
    icon: '💍',
    type: 'accessory',
    slot: 'ring',
    class: 'any',
    rarity: 'common',
    stats: { hp: 20, pDef: 1 },
    dropFloor: 2,
    buyPrice: 120,
    sellPrice: 30,
    description: 'A sturdy iron ring.'
  },
  
  // Uncommon
  ring_of_strength: {
    id: 'ring_of_strength',
    name: 'Ring of Strength',
    icon: '💪',
    type: 'accessory',
    slot: 'ring',
    class: 'any',
    rarity: 'uncommon',
    stats: { str: 5, pAtk: 8 },
    dropFloor: 4,
    buyPrice: 500,
    sellPrice: 125,
    description: 'Empowers physical might.'
  },
  
  ring_of_agility: {
    id: 'ring_of_agility',
    name: 'Ring of Agility',
    icon: '💨',
    type: 'accessory',
    slot: 'ring',
    class: 'any',
    rarity: 'uncommon',
    stats: { agi: 5, critRate: 2 },
    dropFloor: 4,
    buyPrice: 500,
    sellPrice: 125,
    description: 'Enhances reflexes.'
  },
  
  ring_of_wisdom: {
    id: 'ring_of_wisdom',
    name: 'Ring of Wisdom',
    icon: '🧠',
    type: 'accessory',
    slot: 'ring',
    class: 'any',
    rarity: 'uncommon',
    stats: { int: 5, mAtk: 10, mp: 20 },
    dropFloor: 4,
    buyPrice: 520,
    sellPrice: 130,
    description: 'Sharpens the mind.'
  },
  
  ring_of_vitality: {
    id: 'ring_of_vitality',
    name: 'Ring of Vitality',
    icon: '❤️',
    type: 'accessory',
    slot: 'ring',
    class: 'any',
    rarity: 'uncommon',
    stats: { vit: 5, hp: 50 },
    dropFloor: 4,
    buyPrice: 480,
    sellPrice: 120,
    description: 'Boosts life force.'
  },
  
  // Rare
  crimson_ring: {
    id: 'crimson_ring',
    name: 'Crimson Ring',
    icon: '🔴',
    type: 'accessory',
    slot: 'ring',
    class: 'any',
    rarity: 'rare',
    stats: { str: 8, pAtk: 15, critDmg: 10 },
    element: 'fire',
    dropFloor: 7,
    buyPrice: 1500,
    sellPrice: 375,
    description: 'Burns with inner fire.'
  },
  
  azure_ring: {
    id: 'azure_ring',
    name: 'Azure Ring',
    icon: '🔵',
    type: 'accessory',
    slot: 'ring',
    class: 'any',
    rarity: 'rare',
    stats: { int: 8, mAtk: 20, mp: 40 },
    element: 'ice',
    dropFloor: 7,
    buyPrice: 1500,
    sellPrice: 375,
    description: 'Cold to the touch.'
  },
  
  shadow_ring: {
    id: 'shadow_ring',
    name: 'Shadow Ring',
    icon: '⚫',
    type: 'accessory',
    slot: 'ring',
    class: 'any',
    rarity: 'rare',
    stats: { agi: 8, critRate: 6, critDmg: 12 },
    element: 'dark',
    dropFloor: 8,
    buyPrice: 1800,
    sellPrice: 450,
    description: 'Shadows cling to it.'
  },
  
  // Epic
  dragon_ring: {
    id: 'dragon_ring',
    name: 'Dragon Ring',
    icon: '🐲',
    type: 'accessory',
    slot: 'ring',
    class: 'any',
    rarity: 'epic',
    stats: { str: 10, vit: 10, pAtk: 25, hp: 100 },
    dropFloor: 11,
    buyPrice: 4000,
    sellPrice: 1000,
    description: 'Contains dragon essence.'
  },
  
  arcane_signet: {
    id: 'arcane_signet',
    name: 'Arcane Signet',
    icon: '💠',
    type: 'accessory',
    slot: 'ring',
    class: 'any',
    rarity: 'epic',
    stats: { int: 12, mAtk: 35, mp: 80, critRate: 4 },
    dropFloor: 12,
    buyPrice: 4500,
    sellPrice: 1125,
    description: 'Pulsing with magic.'
  },
  
  // Legendary
  monarchs_ring: {
    id: 'monarchs_ring',
    name: "Monarch's Ring",
    icon: '👑',
    type: 'accessory',
    slot: 'ring',
    class: 'any',
    rarity: 'legendary',
    stats: { str: 15, agi: 15, int: 15, vit: 15, critRate: 8 },
    element: 'dark',
    dropFloor: 15,
    buyPrice: null,
    sellPrice: 3000,
    description: 'Symbol of absolute power.'
  },
  
  
  // ============================================================
  // NECKLACES (Necklace slot)
  // ============================================================
  
  // Common
  wooden_pendant: {
    id: 'wooden_pendant',
    name: 'Wooden Pendant',
    icon: '📿',
    type: 'accessory',
    slot: 'necklace',
    class: 'any',
    rarity: 'common',
    stats: { hp: 15 },
    dropFloor: 1,
    buyPrice: 60,
    sellPrice: 15,
    description: 'A carved wooden charm.'
  },
  
  silver_chain: {
    id: 'silver_chain',
    name: 'Silver Chain',
    icon: '⛓️',
    type: 'accessory',
    slot: 'necklace',
    class: 'any',
    rarity: 'common',
    stats: { hp: 25, mp: 10 },
    dropFloor: 2,
    buyPrice: 150,
    sellPrice: 35,
    description: 'A simple silver necklace.'
  },
  
  // Uncommon
  warriors_pendant: {
    id: 'warriors_pendant',
    name: "Warrior's Pendant",
    icon: '⚔️',
    type: 'accessory',
    slot: 'necklace',
    class: 'swordsman',
    rarity: 'uncommon',
    stats: { str: 4, pAtk: 10, hp: 30 },
    dropFloor: 4,
    buyPrice: 600,
    sellPrice: 150,
    description: 'Inspires battle courage.'
  },
  
  thieves_locket: {
    id: 'thieves_locket',
    name: "Thief's Locket",
    icon: '🔒',
    type: 'accessory',
    slot: 'necklace',
    class: 'thief',
    rarity: 'uncommon',
    stats: { agi: 4, critRate: 3, critDmg: 8 },
    dropFloor: 4,
    buyPrice: 620,
    sellPrice: 155,
    description: 'Contains lockpicks.'
  },
  
  hunters_tooth: {
    id: 'hunters_tooth',
    name: "Hunter's Tooth",
    icon: '🦷',
    type: 'accessory',
    slot: 'necklace',
    class: 'archer',
    rarity: 'uncommon',
    stats: { dex: 4, pAtk: 8, critRate: 2 },
    dropFloor: 4,
    buyPrice: 580,
    sellPrice: 145,
    description: 'Trophy of the hunt.'
  },
  
  mages_amulet: {
    id: 'mages_amulet',
    name: "Mage's Amulet",
    icon: '🔮',
    type: 'accessory',
    slot: 'necklace',
    class: 'mage',
    rarity: 'uncommon',
    stats: { int: 4, mAtk: 12, mp: 30 },
    dropFloor: 4,
    buyPrice: 650,
    sellPrice: 160,
    description: 'Amplifies magic.'
  },
  
  // Rare
  fire_heart: {
    id: 'fire_heart',
    name: 'Fire Heart',
    icon: '🔥',
    type: 'accessory',
    slot: 'necklace',
    class: 'any',
    rarity: 'rare',
    stats: { pAtk: 20, mAtk: 20, critDmg: 15 },
    element: 'fire',
    dropFloor: 7,
    buyPrice: 2000,
    sellPrice: 500,
    description: 'Burns with passion.'
  },
  
  frost_crystal: {
    id: 'frost_crystal',
    name: 'Frost Crystal',
    icon: '❄️',
    type: 'accessory',
    slot: 'necklace',
    class: 'any',
    rarity: 'rare',
    stats: { mAtk: 25, int: 6, mp: 50 },
    element: 'ice',
    dropFloor: 7,
    buyPrice: 2100,
    sellPrice: 525,
    description: 'Eternally frozen.'
  },
  
  storm_pendant: {
    id: 'storm_pendant',
    name: 'Storm Pendant',
    icon: '⚡',
    type: 'accessory',
    slot: 'necklace',
    class: 'any',
    rarity: 'rare',
    stats: { agi: 6, dex: 6, critRate: 5 },
    element: 'lightning',
    dropFloor: 8,
    buyPrice: 2200,
    sellPrice: 550,
    description: 'Crackles with energy.'
  },
  
  // Epic
  dragon_fang: {
    id: 'dragon_fang',
    name: 'Dragon Fang',
    icon: '🐲',
    type: 'accessory',
    slot: 'necklace',
    class: 'any',
    rarity: 'epic',
    stats: { pAtk: 30, mAtk: 30, hp: 80, critDmg: 18 },
    dropFloor: 11,
    buyPrice: 5000,
    sellPrice: 1250,
    description: 'From an ancient dragon.'
  },
  
  void_pendant: {
    id: 'void_pendant',
    name: 'Void Pendant',
    icon: '🌀',
    type: 'accessory',
    slot: 'necklace',
    class: 'any',
    rarity: 'epic',
    stats: { mAtk: 40, int: 10, mp: 70, critRate: 6 },
    element: 'dark',
    dropFloor: 12,
    buyPrice: 5500,
    sellPrice: 1375,
    description: 'Gazing into the void.'
  },
  
  // Legendary
  shadow_heart: {
    id: 'shadow_heart',
    name: 'Shadow Heart',
    icon: '🖤',
    type: 'accessory',
    slot: 'necklace',
    class: 'any',
    rarity: 'legendary',
    stats: { pAtk: 50, mAtk: 50, hp: 150, critRate: 10, critDmg: 25 },
    element: 'dark',
    dropFloor: 15,
    buyPrice: null,
    sellPrice: 4000,
    description: 'The heart of shadows.'
  },
  
  
  // ============================================================
  // CAPES (Cape slot)
  // ============================================================
  
  // Common
  worn_cloak: {
    id: 'worn_cloak',
    name: 'Worn Cloak',
    icon: '🧥',
    type: 'accessory',
    slot: 'cape',
    class: 'any',
    rarity: 'common',
    stats: { pDef: 2, mDef: 2 },
    dropFloor: 1,
    buyPrice: 80,
    sellPrice: 20,
    description: 'A tattered old cloak.'
  },
  
  travelers_cape: {
    id: 'travelers_cape',
    name: "Traveler's Cape",
    icon: '🧣',
    type: 'accessory',
    slot: 'cape',
    class: 'any',
    rarity: 'common',
    stats: { pDef: 4, mDef: 4, hp: 15 },
    dropFloor: 2,
    buyPrice: 200,
    sellPrice: 50,
    description: 'For long journeys.'
  },
  
  // Uncommon
  knights_cape: {
    id: 'knights_cape',
    name: "Knight's Cape",
    icon: '🔴',
    type: 'accessory',
    slot: 'cape',
    class: 'swordsman',
    rarity: 'uncommon',
    stats: { pDef: 10, hp: 40, vit: 3 },
    dropFloor: 4,
    buyPrice: 700,
    sellPrice: 175,
    description: 'Symbol of knighthood.'
  },
  
  shadow_cloak: {
    id: 'shadow_cloak',
    name: 'Shadow Cloak',
    icon: '🖤',
    type: 'accessory',
    slot: 'cape',
    class: 'thief',
    rarity: 'uncommon',
    stats: { pDef: 6, agi: 5, critRate: 2 },
    element: 'dark',
    dropFloor: 4,
    buyPrice: 720,
    sellPrice: 180,
    description: 'Blends into shadows.'
  },
  
  nature_mantle: {
    id: 'nature_mantle',
    name: 'Nature Mantle',
    icon: '🌿',
    type: 'accessory',
    slot: 'cape',
    class: 'archer',
    rarity: 'uncommon',
    stats: { pDef: 7, mDef: 5, dex: 4 },
    element: 'nature',
    dropFloor: 4,
    buyPrice: 680,
    sellPrice: 170,
    description: 'Woven from forest vines.'
  },
  
  wizards_cloak: {
    id: 'wizards_cloak',
    name: "Wizard's Cloak",
    icon: '🟣',
    type: 'accessory',
    slot: 'cape',
    class: 'mage',
    rarity: 'uncommon',
    stats: { mDef: 10, mp: 40, int: 3 },
    dropFloor: 4,
    buyPrice: 750,
    sellPrice: 185,
    description: 'Enhances spellcasting.'
  },
  
  // Rare
  flame_cape: {
    id: 'flame_cape',
    name: 'Flame Cape',
    icon: '🔥',
    type: 'accessory',
    slot: 'cape',
    class: 'any',
    rarity: 'rare',
    stats: { pDef: 15, mDef: 10, pAtk: 12 },
    element: 'fire',
    dropFloor: 7,
    buyPrice: 2000,
    sellPrice: 500,
    description: 'Wreathed in flames.'
  },
  
  frost_mantle: {
    id: 'frost_mantle',
    name: 'Frost Mantle',
    icon: '❄️',
    type: 'accessory',
    slot: 'cape',
    class: 'any',
    rarity: 'rare',
    stats: { pDef: 12, mDef: 18, mAtk: 15 },
    element: 'ice',
    dropFloor: 7,
    buyPrice: 2000,
    sellPrice: 500,
    description: 'Frozen air surrounds it.'
  },
  
  wings_of_wind: {
    id: 'wings_of_wind',
    name: 'Wings of Wind',
    icon: '🌬️',
    type: 'accessory',
    slot: 'cape',
    class: 'any',
    rarity: 'rare',
    stats: { pDef: 10, agi: 10 },
    dropFloor: 8,
    buyPrice: 2200,
    sellPrice: 550,
    description: 'Light as a breeze.'
  },
  
  // Epic
  dragon_wings: {
    id: 'dragon_wings',
    name: 'Dragon Wings',
    icon: '🐲',
    type: 'accessory',
    slot: 'cape',
    class: 'any',
    rarity: 'epic',
    stats: { pDef: 25, mDef: 25, hp: 100, agi: 8 },
    dropFloor: 11,
    buyPrice: 6000,
    sellPrice: 1500,
    description: 'Magnificent dragon wings.'
  },
  
  void_shroud: {
    id: 'void_shroud',
    name: 'Void Shroud',
    icon: '🌀',
    type: 'accessory',
    slot: 'cape',
    class: 'any',
    rarity: 'epic',
    stats: { pDef: 20, mDef: 30, mAtk: 25, critRate: 5 },
    element: 'dark',
    dropFloor: 12,
    buyPrice: 6500,
    sellPrice: 1625,
    description: 'Reality bends around it.'
  },
  
  // Legendary
  monarchs_mantle: {
    id: 'monarchs_mantle',
    name: "Monarch's Mantle",
    icon: '👑',
    type: 'accessory',
    slot: 'cape',
    class: 'any',
    rarity: 'legendary',
    stats: { pDef: 40, mDef: 40, hp: 150, mp: 80, agi: 12 },
    element: 'dark',
    dropFloor: 15,
    buyPrice: null,
    sellPrice: 4500,
    description: 'Cloak of the Shadow Monarch.'
  }
};

// Helper: Get accessories by slot
export const getAccessoriesBySlot = (slot) => {
  return Object.values(ACCESSORIES).filter(a => a.slot === slot);
};

// Helper: Get accessories by rarity
export const getAccessoriesByRarity = (rarity) => {
  return Object.values(ACCESSORIES).filter(a => a.rarity === rarity);
};
