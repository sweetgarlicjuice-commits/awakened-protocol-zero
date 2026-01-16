// ============================================================
// ARMOR DATABASE
// Easy to edit - just add new entries following the pattern
// ============================================================

export const ARMOR = {
  
  // ============================================================
  // HELMETS (Head slot)
  // ============================================================
  
  // Common
  leather_cap: {
    id: 'leather_cap',
    name: 'Leather Cap',
    icon: '🎩',
    type: 'armor',
    slot: 'head',
    class: 'any',
    rarity: 'common',
    stats: { pDef: 2, hp: 10 },
    dropFloor: 1,
    buyPrice: 80,
    sellPrice: 20,
    description: 'Basic head protection.'
  },
  
  iron_helm: {
    id: 'iron_helm',
    name: 'Iron Helm',
    icon: '⛑️',
    type: 'armor',
    slot: 'head',
    class: 'any',
    rarity: 'common',
    stats: { pDef: 5, hp: 20 },
    dropFloor: 2,
    buyPrice: 200,
    sellPrice: 50,
    description: 'Sturdy iron helmet.'
  },
  
  // Uncommon
  steel_helm: {
    id: 'steel_helm',
    name: 'Steel Helm',
    icon: '⛑️',
    type: 'armor',
    slot: 'head',
    class: 'any',
    rarity: 'uncommon',
    stats: { pDef: 10, hp: 40, vit: 2 },
    dropFloor: 4,
    buyPrice: 600,
    sellPrice: 150,
    description: 'Quality steel protection.'
  },
  
  mage_hood: {
    id: 'mage_hood',
    name: 'Mage Hood',
    icon: '🧙',
    type: 'armor',
    slot: 'head',
    class: 'mage',
    rarity: 'uncommon',
    stats: { mDef: 8, mp: 30, int: 3 },
    dropFloor: 4,
    buyPrice: 650,
    sellPrice: 160,
    description: 'Enhances magical focus.'
  },
  
  rogues_mask: {
    id: 'rogues_mask',
    name: "Rogue's Mask",
    icon: '🎭',
    type: 'armor',
    slot: 'head',
    class: 'thief',
    rarity: 'uncommon',
    stats: { pDef: 6, agi: 4, critRate: 2 },
    dropFloor: 4,
    buyPrice: 700,
    sellPrice: 175,
    description: 'Conceals identity.'
  },
  
  // Rare
  knights_helm: {
    id: 'knights_helm',
    name: "Knight's Helm",
    icon: '🪖',
    type: 'armor',
    slot: 'head',
    class: 'swordsman',
    rarity: 'rare',
    stats: { pDef: 18, hp: 80, vit: 4, str: 2 },
    dropFloor: 7,
    buyPrice: 1800,
    sellPrice: 450,
    description: 'Full-face knight helmet.'
  },
  
  arcane_circlet: {
    id: 'arcane_circlet',
    name: 'Arcane Circlet',
    icon: '👑',
    type: 'armor',
    slot: 'head',
    class: 'mage',
    rarity: 'rare',
    stats: { mDef: 15, mp: 60, int: 6, critDmg: 8 },
    dropFloor: 7,
    buyPrice: 2000,
    sellPrice: 500,
    description: 'Channels arcane energy.'
  },
  
  // Epic
  dragon_helm: {
    id: 'dragon_helm',
    name: 'Dragon Helm',
    icon: '🐲',
    type: 'armor',
    slot: 'head',
    class: 'any',
    rarity: 'epic',
    stats: { pDef: 30, mDef: 15, hp: 120, vit: 6 },
    dropFloor: 11,
    buyPrice: 5500,
    sellPrice: 1375,
    description: 'Forged from dragon scales.'
  },
  
  // Legendary
  crown_of_shadows: {
    id: 'crown_of_shadows',
    name: 'Crown of Shadows',
    icon: '👑',
    type: 'armor',
    slot: 'head',
    class: 'any',
    rarity: 'legendary',
    stats: { pDef: 40, mDef: 40, hp: 150, critRate: 5, critDmg: 15 },
    element: 'dark',
    dropFloor: 15,
    buyPrice: null,
    sellPrice: 3500,
    description: 'Worn by the Shadow Monarch.'
  },
  
  
  // ============================================================
  // CHEST ARMOR (Body slot)
  // ============================================================
  
  // Common
  cloth_shirt: {
    id: 'cloth_shirt',
    name: 'Cloth Shirt',
    icon: '👕',
    type: 'armor',
    slot: 'body',
    class: 'any',
    rarity: 'common',
    stats: { pDef: 3, hp: 15 },
    dropFloor: 1,
    buyPrice: 100,
    sellPrice: 25,
    description: 'Basic clothing.'
  },
  
  leather_armor: {
    id: 'leather_armor',
    name: 'Leather Armor',
    icon: '🦺',
    type: 'armor',
    slot: 'body',
    class: 'any',
    rarity: 'common',
    stats: { pDef: 8, hp: 30 },
    dropFloor: 2,
    buyPrice: 300,
    sellPrice: 75,
    description: 'Flexible leather protection.'
  },
  
  // Uncommon
  chainmail: {
    id: 'chainmail',
    name: 'Chainmail',
    icon: '🛡️',
    type: 'armor',
    slot: 'body',
    class: 'swordsman',
    rarity: 'uncommon',
    stats: { pDef: 18, hp: 60, vit: 3 },
    dropFloor: 4,
    buyPrice: 900,
    sellPrice: 225,
    description: 'Interlocking metal rings.'
  },
  
  shadow_vest: {
    id: 'shadow_vest',
    name: 'Shadow Vest',
    icon: '🖤',
    type: 'armor',
    slot: 'body',
    class: 'thief',
    rarity: 'uncommon',
    stats: { pDef: 10, agi: 5, critRate: 2 },
    dropFloor: 4,
    buyPrice: 850,
    sellPrice: 210,
    description: 'Blends into darkness.'
  },
  
  ranger_tunic: {
    id: 'ranger_tunic',
    name: 'Ranger Tunic',
    icon: '🟢',
    type: 'armor',
    slot: 'body',
    class: 'archer',
    rarity: 'uncommon',
    stats: { pDef: 12, dex: 4, agi: 3 },
    dropFloor: 4,
    buyPrice: 880,
    sellPrice: 220,
    description: 'Light and flexible.'
  },
  
  mage_robe: {
    id: 'mage_robe',
    name: 'Mage Robe',
    icon: '👘',
    type: 'armor',
    slot: 'body',
    class: 'mage',
    rarity: 'uncommon',
    stats: { mDef: 12, mp: 50, int: 4 },
    dropFloor: 4,
    buyPrice: 900,
    sellPrice: 225,
    description: 'Enchanted with mana.'
  },
  
  // Rare
  plate_armor: {
    id: 'plate_armor',
    name: 'Plate Armor',
    icon: '🛡️',
    type: 'armor',
    slot: 'body',
    class: 'swordsman',
    rarity: 'rare',
    stats: { pDef: 35, hp: 100, vit: 6, str: 3 },
    dropFloor: 7,
    buyPrice: 2800,
    sellPrice: 700,
    description: 'Heavy plate protection.'
  },
  
  assassin_garb: {
    id: 'assassin_garb',
    name: 'Assassin Garb',
    icon: '🖤',
    type: 'armor',
    slot: 'body',
    class: 'thief',
    rarity: 'rare',
    stats: { pDef: 20, agi: 8, critRate: 5, critDmg: 10 },
    dropFloor: 7,
    buyPrice: 2600,
    sellPrice: 650,
    description: 'Silent and deadly.'
  },
  
  archmage_robe: {
    id: 'archmage_robe',
    name: 'Archmage Robe',
    icon: '👘',
    type: 'armor',
    slot: 'body',
    class: 'mage',
    rarity: 'rare',
    stats: { mDef: 25, mp: 80, int: 8, mAtk: 15 },
    dropFloor: 8,
    buyPrice: 3000,
    sellPrice: 750,
    description: 'Worn by master mages.'
  },
  
  // Epic
  dragon_scale_armor: {
    id: 'dragon_scale_armor',
    name: 'Dragon Scale Armor',
    icon: '🐉',
    type: 'armor',
    slot: 'body',
    class: 'any',
    rarity: 'epic',
    stats: { pDef: 50, mDef: 30, hp: 150, vit: 8 },
    dropFloor: 11,
    buyPrice: 8000,
    sellPrice: 2000,
    description: 'Impervious to fire.'
  },
  
  // Legendary
  monarchs_armor: {
    id: 'monarchs_armor',
    name: "Monarch's Armor",
    icon: '🖤',
    type: 'armor',
    slot: 'body',
    class: 'any',
    rarity: 'legendary',
    stats: { pDef: 70, mDef: 50, hp: 200, vit: 12, str: 8 },
    element: 'dark',
    dropFloor: 15,
    buyPrice: null,
    sellPrice: 5000,
    description: 'Armor of the Shadow Monarch.'
  },
  
  
  // ============================================================
  // GLOVES (Hands slot)
  // ============================================================
  
  // Common
  cloth_gloves: {
    id: 'cloth_gloves',
    name: 'Cloth Gloves',
    icon: '🧤',
    type: 'armor',
    slot: 'hands',
    class: 'any',
    rarity: 'common',
    stats: { pDef: 1, dex: 1 },
    dropFloor: 1,
    buyPrice: 60,
    sellPrice: 15,
    description: 'Simple hand protection.'
  },
  
  leather_gloves: {
    id: 'leather_gloves',
    name: 'Leather Gloves',
    icon: '🧤',
    type: 'armor',
    slot: 'hands',
    class: 'any',
    rarity: 'common',
    stats: { pDef: 3, dex: 2 },
    dropFloor: 2,
    buyPrice: 150,
    sellPrice: 35,
    description: 'Grip-enhanced gloves.'
  },
  
  // Uncommon
  combat_gauntlets: {
    id: 'combat_gauntlets',
    name: 'Combat Gauntlets',
    icon: '🥊',
    type: 'armor',
    slot: 'hands',
    class: 'swordsman',
    rarity: 'uncommon',
    stats: { pDef: 8, str: 3, pAtk: 5 },
    dropFloor: 4,
    buyPrice: 550,
    sellPrice: 135,
    description: 'Adds punch to attacks.'
  },
  
  thieves_gloves: {
    id: 'thieves_gloves',
    name: "Thief's Gloves",
    icon: '🧤',
    type: 'armor',
    slot: 'hands',
    class: 'thief',
    rarity: 'uncommon',
    stats: { pDef: 4, agi: 4, critRate: 3 },
    dropFloor: 4,
    buyPrice: 580,
    sellPrice: 145,
    description: 'Nimble fingers.'
  },
  
  archers_bracers: {
    id: 'archers_bracers',
    name: "Archer's Bracers",
    icon: '🏹',
    type: 'armor',
    slot: 'hands',
    class: 'archer',
    rarity: 'uncommon',
    stats: { pDef: 5, dex: 5, pAtk: 4 },
    dropFloor: 4,
    buyPrice: 560,
    sellPrice: 140,
    description: 'Steadies the aim.'
  },
  
  // Rare
  berserker_gauntlets: {
    id: 'berserker_gauntlets',
    name: 'Berserker Gauntlets',
    icon: '💢',
    type: 'armor',
    slot: 'hands',
    class: 'swordsman',
    rarity: 'rare',
    stats: { pDef: 12, str: 6, pAtk: 12, critDmg: 8 },
    dropFloor: 7,
    buyPrice: 1600,
    sellPrice: 400,
    description: 'Fueled by rage.'
  },
  
  spellweaver_gloves: {
    id: 'spellweaver_gloves',
    name: 'Spellweaver Gloves',
    icon: '✨',
    type: 'armor',
    slot: 'hands',
    class: 'mage',
    rarity: 'rare',
    stats: { mDef: 10, int: 6, mAtk: 15, mp: 30 },
    dropFloor: 7,
    buyPrice: 1700,
    sellPrice: 425,
    description: 'Weaves spells faster.'
  },
  
  // Epic
  dragon_claws: {
    id: 'dragon_claws',
    name: 'Dragon Claws',
    icon: '🐲',
    type: 'armor',
    slot: 'hands',
    class: 'any',
    rarity: 'epic',
    stats: { pDef: 20, pAtk: 25, str: 8, critRate: 5 },
    dropFloor: 11,
    buyPrice: 4500,
    sellPrice: 1125,
    description: 'Tear through enemies.'
  },
  
  // Legendary
  shadow_grip: {
    id: 'shadow_grip',
    name: 'Shadow Grip',
    icon: '🖐️',
    type: 'armor',
    slot: 'hands',
    class: 'any',
    rarity: 'legendary',
    stats: { pDef: 30, mDef: 20, pAtk: 35, mAtk: 35, critRate: 8 },
    element: 'dark',
    dropFloor: 15,
    buyPrice: null,
    sellPrice: 3000,
    description: 'Grasp the shadows.'
  },
  
  
  // ============================================================
  // BOOTS (Feet slot)
  // ============================================================
  
  // Common
  cloth_shoes: {
    id: 'cloth_shoes',
    name: 'Cloth Shoes',
    icon: '👟',
    type: 'armor',
    slot: 'feet',
    class: 'any',
    rarity: 'common',
    stats: { pDef: 1, agi: 1 },
    dropFloor: 1,
    buyPrice: 70,
    sellPrice: 17,
    description: 'Basic footwear.'
  },
  
  leather_boots: {
    id: 'leather_boots',
    name: 'Leather Boots',
    icon: '👢',
    type: 'armor',
    slot: 'feet',
    class: 'any',
    rarity: 'common',
    stats: { pDef: 3, agi: 2 },
    dropFloor: 2,
    buyPrice: 180,
    sellPrice: 45,
    description: 'Durable leather boots.'
  },
  
  // Uncommon
  steel_boots: {
    id: 'steel_boots',
    name: 'Steel Boots',
    icon: '🦶',
    type: 'armor',
    slot: 'feet',
    class: 'swordsman',
    rarity: 'uncommon',
    stats: { pDef: 10, vit: 3, hp: 30 },
    dropFloor: 4,
    buyPrice: 650,
    sellPrice: 160,
    description: 'Heavy but protective.'
  },
  
  swift_boots: {
    id: 'swift_boots',
    name: 'Swift Boots',
    icon: '👟',
    type: 'armor',
    slot: 'feet',
    class: 'thief',
    rarity: 'uncommon',
    stats: { pDef: 5, agi: 6 },
    dropFloor: 4,
    buyPrice: 620,
    sellPrice: 155,
    description: 'Move like the wind.'
  },
  
  ranger_boots: {
    id: 'ranger_boots',
    name: 'Ranger Boots',
    icon: '🥾',
    type: 'armor',
    slot: 'feet',
    class: 'archer',
    rarity: 'uncommon',
    stats: { pDef: 6, agi: 4, dex: 3 },
    dropFloor: 4,
    buyPrice: 640,
    sellPrice: 160,
    description: 'Silent steps.'
  },
  
  // Rare
  winged_boots: {
    id: 'winged_boots',
    name: 'Winged Boots',
    icon: '👼',
    type: 'armor',
    slot: 'feet',
    class: 'any',
    rarity: 'rare',
    stats: { pDef: 12, agi: 10 },
    dropFloor: 7,
    buyPrice: 2000,
    sellPrice: 500,
    description: 'Light as a feather.'
  },
  
  mage_slippers: {
    id: 'mage_slippers',
    name: 'Mage Slippers',
    icon: '🩴',
    type: 'armor',
    slot: 'feet',
    class: 'mage',
    rarity: 'rare',
    stats: { mDef: 15, mp: 40, int: 5 },
    dropFloor: 7,
    buyPrice: 1900,
    sellPrice: 475,
    description: 'Enchanted for comfort.'
  },
  
  // Epic
  dragon_greaves: {
    id: 'dragon_greaves',
    name: 'Dragon Greaves',
    icon: '🐲',
    type: 'armor',
    slot: 'feet',
    class: 'any',
    rarity: 'epic',
    stats: { pDef: 25, mDef: 15, agi: 8, hp: 80 },
    dropFloor: 11,
    buyPrice: 5000,
    sellPrice: 1250,
    description: 'Dragon scale leg armor.'
  },
  
  // Legendary
  shadow_stride: {
    id: 'shadow_stride',
    name: 'Shadow Stride',
    icon: '👣',
    type: 'armor',
    slot: 'feet',
    class: 'any',
    rarity: 'legendary',
    stats: { pDef: 35, mDef: 25, agi: 15, critRate: 5 },
    element: 'dark',
    dropFloor: 15,
    buyPrice: null,
    sellPrice: 3200,
    description: 'Walk between shadows.'
  }
};

// Helper: Get armor by slot
export const getArmorBySlot = (slot) => {
  return Object.values(ARMOR).filter(a => a.slot === slot);
};

// Helper: Get armor by class
export const getArmorByClass = (className) => {
  return Object.values(ARMOR).filter(a => a.class === className || a.class === 'any');
};

// Helper: Get armor by rarity
export const getArmorByRarity = (rarity) => {
  return Object.values(ARMOR).filter(a => a.rarity === rarity);
};
