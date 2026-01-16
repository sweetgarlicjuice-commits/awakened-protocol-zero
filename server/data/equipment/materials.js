// ============================================================
// MATERIALS DATABASE
// Crafting materials, mob drops, upgrade materials
// ============================================================

export const MATERIALS = {
  
  // ============================================================
  // BASIC CRAFTING MATERIALS
  // ============================================================
  
  // Ores & Metals
  iron_ore: {
    id: 'iron_ore',
    name: 'Iron Ore',
    icon: '🪨',
    type: 'material',
    category: 'ore',
    rarity: 'common',
    stackable: true,
    maxStack: 999,
    dropFloor: 1,
    buyPrice: 20,
    sellPrice: 5,
    description: 'Raw iron ore. Used for basic crafting.'
  },
  
  steel_ingot: {
    id: 'steel_ingot',
    name: 'Steel Ingot',
    icon: '🔩',
    type: 'material',
    category: 'ore',
    rarity: 'uncommon',
    stackable: true,
    maxStack: 999,
    dropFloor: 4,
    buyPrice: 80,
    sellPrice: 20,
    description: 'Refined steel. Used for crafting.'
  },
  
  mithril_ore: {
    id: 'mithril_ore',
    name: 'Mithril Ore',
    icon: '💎',
    type: 'material',
    category: 'ore',
    rarity: 'rare',
    stackable: true,
    maxStack: 999,
    dropFloor: 8,
    buyPrice: 300,
    sellPrice: 75,
    description: 'Magical metal ore. High quality crafting.'
  },
  
  adamantite_ore: {
    id: 'adamantite_ore',
    name: 'Adamantite Ore',
    icon: '🟣',
    type: 'material',
    category: 'ore',
    rarity: 'epic',
    stackable: true,
    maxStack: 999,
    dropFloor: 12,
    buyPrice: 800,
    sellPrice: 200,
    description: 'Extremely hard metal. Epic crafting.'
  },
  
  orichalcum: {
    id: 'orichalcum',
    name: 'Orichalcum',
    icon: '🌟',
    type: 'material',
    category: 'ore',
    rarity: 'legendary',
    stackable: true,
    maxStack: 999,
    dropFloor: 15,
    buyPrice: null,
    sellPrice: 500,
    description: 'Legendary metal. Divine crafting.'
  },
  
  // Leather & Cloth
  leather_scrap: {
    id: 'leather_scrap',
    name: 'Leather Scrap',
    icon: '🟤',
    type: 'material',
    category: 'leather',
    rarity: 'common',
    stackable: true,
    maxStack: 999,
    dropFloor: 1,
    buyPrice: 15,
    sellPrice: 4,
    description: 'Basic leather piece.'
  },
  
  hardened_leather: {
    id: 'hardened_leather',
    name: 'Hardened Leather',
    icon: '🟫',
    type: 'material',
    category: 'leather',
    rarity: 'uncommon',
    stackable: true,
    maxStack: 999,
    dropFloor: 4,
    buyPrice: 60,
    sellPrice: 15,
    description: 'Treated leather. More durable.'
  },
  
  magic_cloth: {
    id: 'magic_cloth',
    name: 'Magic Cloth',
    icon: '🟪',
    type: 'material',
    category: 'cloth',
    rarity: 'rare',
    stackable: true,
    maxStack: 999,
    dropFloor: 7,
    buyPrice: 200,
    sellPrice: 50,
    description: 'Enchanted fabric.'
  },
  
  
  // ============================================================
  // ELEMENTAL MATERIALS
  // ============================================================
  
  fire_essence: {
    id: 'fire_essence',
    name: 'Fire Essence',
    icon: '🔥',
    type: 'material',
    category: 'essence',
    element: 'fire',
    rarity: 'uncommon',
    stackable: true,
    maxStack: 999,
    dropFloor: 3,
    buyPrice: 100,
    sellPrice: 25,
    description: 'Condensed fire energy.'
  },
  
  ice_essence: {
    id: 'ice_essence',
    name: 'Ice Essence',
    icon: '❄️',
    type: 'material',
    category: 'essence',
    element: 'ice',
    rarity: 'uncommon',
    stackable: true,
    maxStack: 999,
    dropFloor: 3,
    buyPrice: 100,
    sellPrice: 25,
    description: 'Condensed ice energy.'
  },
  
  lightning_essence: {
    id: 'lightning_essence',
    name: 'Lightning Essence',
    icon: '⚡',
    type: 'material',
    category: 'essence',
    element: 'lightning',
    rarity: 'uncommon',
    stackable: true,
    maxStack: 999,
    dropFloor: 3,
    buyPrice: 100,
    sellPrice: 25,
    description: 'Condensed lightning energy.'
  },
  
  dark_essence: {
    id: 'dark_essence',
    name: 'Dark Essence',
    icon: '🌑',
    type: 'material',
    category: 'essence',
    element: 'dark',
    rarity: 'rare',
    stackable: true,
    maxStack: 999,
    dropFloor: 6,
    buyPrice: 250,
    sellPrice: 62,
    description: 'Condensed shadow energy.'
  },
  
  holy_essence: {
    id: 'holy_essence',
    name: 'Holy Essence',
    icon: '✨',
    type: 'material',
    category: 'essence',
    element: 'holy',
    rarity: 'rare',
    stackable: true,
    maxStack: 999,
    dropFloor: 6,
    buyPrice: 250,
    sellPrice: 62,
    description: 'Condensed holy energy.'
  },
  
  nature_essence: {
    id: 'nature_essence',
    name: 'Nature Essence',
    icon: '🌿',
    type: 'material',
    category: 'essence',
    element: 'nature',
    rarity: 'uncommon',
    stackable: true,
    maxStack: 999,
    dropFloor: 3,
    buyPrice: 100,
    sellPrice: 25,
    description: 'Condensed nature energy.'
  },
  
  void_shard: {
    id: 'void_shard',
    name: 'Void Shard',
    icon: '🌀',
    type: 'material',
    category: 'essence',
    element: 'dark',
    rarity: 'epic',
    stackable: true,
    maxStack: 999,
    dropFloor: 10,
    buyPrice: 600,
    sellPrice: 150,
    description: 'Fragment of the void.'
  },
  
  
  // ============================================================
  // UPGRADE MATERIALS
  // ============================================================
  
  enhancement_stone: {
    id: 'enhancement_stone',
    name: 'Enhancement Stone',
    icon: '💠',
    type: 'material',
    category: 'upgrade',
    rarity: 'common',
    stackable: true,
    maxStack: 999,
    dropFloor: 2,
    buyPrice: 50,
    sellPrice: 12,
    description: 'Used to enhance equipment +1 to +5.'
  },
  
  superior_enhancement_stone: {
    id: 'superior_enhancement_stone',
    name: 'Superior Enhancement Stone',
    icon: '💎',
    type: 'material',
    category: 'upgrade',
    rarity: 'uncommon',
    stackable: true,
    maxStack: 999,
    dropFloor: 6,
    buyPrice: 200,
    sellPrice: 50,
    description: 'Used to enhance equipment +6 to +10.'
  },
  
  blessed_enhancement_stone: {
    id: 'blessed_enhancement_stone',
    name: 'Blessed Enhancement Stone',
    icon: '🌟',
    type: 'material',
    category: 'upgrade',
    rarity: 'rare',
    stackable: true,
    maxStack: 999,
    dropFloor: 10,
    buyPrice: 500,
    sellPrice: 125,
    description: 'Used to enhance equipment +11 to +15.'
  },
  
  protection_scroll: {
    id: 'protection_scroll',
    name: 'Protection Scroll',
    icon: '📜',
    type: 'material',
    category: 'upgrade',
    rarity: 'rare',
    stackable: true,
    maxStack: 99,
    dropFloor: 8,
    buyPrice: 400,
    sellPrice: 100,
    description: 'Prevents equipment destruction on failed enhance.'
  },
  
  
  // ============================================================
  // GEMS (Socket materials)
  // ============================================================
  
  ruby: {
    id: 'ruby',
    name: 'Ruby',
    icon: '🔴',
    type: 'material',
    category: 'gem',
    rarity: 'uncommon',
    effect: { pAtk: 10 },
    stackable: true,
    maxStack: 99,
    dropFloor: 5,
    buyPrice: 300,
    sellPrice: 75,
    description: 'Socketable gem. +10 P.ATK.'
  },
  
  sapphire: {
    id: 'sapphire',
    name: 'Sapphire',
    icon: '🔵',
    type: 'material',
    category: 'gem',
    rarity: 'uncommon',
    effect: { mAtk: 10 },
    stackable: true,
    maxStack: 99,
    dropFloor: 5,
    buyPrice: 300,
    sellPrice: 75,
    description: 'Socketable gem. +10 M.ATK.'
  },
  
  emerald: {
    id: 'emerald',
    name: 'Emerald',
    icon: '🟢',
    type: 'material',
    category: 'gem',
    rarity: 'uncommon',
    effect: { hp: 50 },
    stackable: true,
    maxStack: 99,
    dropFloor: 5,
    buyPrice: 300,
    sellPrice: 75,
    description: 'Socketable gem. +50 HP.'
  },
  
  diamond: {
    id: 'diamond',
    name: 'Diamond',
    icon: '💠',
    type: 'material',
    category: 'gem',
    rarity: 'rare',
    effect: { critRate: 3 },
    stackable: true,
    maxStack: 99,
    dropFloor: 8,
    buyPrice: 600,
    sellPrice: 150,
    description: 'Socketable gem. +3% Crit Rate.'
  },
  
  amethyst: {
    id: 'amethyst',
    name: 'Amethyst',
    icon: '🟣',
    type: 'material',
    category: 'gem',
    rarity: 'rare',
    effect: { mp: 40 },
    stackable: true,
    maxStack: 99,
    dropFloor: 8,
    buyPrice: 500,
    sellPrice: 125,
    description: 'Socketable gem. +40 MP.'
  },
  
  onyx: {
    id: 'onyx',
    name: 'Onyx',
    icon: '⚫',
    type: 'material',
    category: 'gem',
    rarity: 'epic',
    effect: { critDmg: 10 },
    stackable: true,
    maxStack: 99,
    dropFloor: 12,
    buyPrice: 1000,
    sellPrice: 250,
    description: 'Socketable gem. +10% Crit DMG.'
  },
  
  
  // ============================================================
  // CRAFTING RECIPES (Unlock items)
  // ============================================================
  
  smithing_manual_basic: {
    id: 'smithing_manual_basic',
    name: 'Basic Smithing Manual',
    icon: '📖',
    type: 'material',
    category: 'recipe',
    rarity: 'uncommon',
    stackable: false,
    dropFloor: 3,
    buyPrice: 500,
    sellPrice: 125,
    description: 'Unlocks basic weapon crafting recipes.'
  },
  
  smithing_manual_advanced: {
    id: 'smithing_manual_advanced',
    name: 'Advanced Smithing Manual',
    icon: '📕',
    type: 'material',
    category: 'recipe',
    rarity: 'rare',
    stackable: false,
    dropFloor: 8,
    buyPrice: 2000,
    sellPrice: 500,
    description: 'Unlocks advanced weapon crafting recipes.'
  },
  
  tailoring_manual: {
    id: 'tailoring_manual',
    name: 'Tailoring Manual',
    icon: '📗',
    type: 'material',
    category: 'recipe',
    rarity: 'uncommon',
    stackable: false,
    dropFloor: 3,
    buyPrice: 500,
    sellPrice: 125,
    description: 'Unlocks armor crafting recipes.'
  },
  
  alchemy_manual: {
    id: 'alchemy_manual',
    name: 'Alchemy Manual',
    icon: '📘',
    type: 'material',
    category: 'recipe',
    rarity: 'uncommon',
    stackable: false,
    dropFloor: 4,
    buyPrice: 600,
    sellPrice: 150,
    description: 'Unlocks potion crafting recipes.'
  }
};

// ============================================================
// HELPERS
// ============================================================

export const getMaterialsByCategory = (category) => {
  return Object.values(MATERIALS).filter(m => m.category === category);
};

export const getMaterialsByRarity = (rarity) => {
  return Object.values(MATERIALS).filter(m => m.rarity === rarity);
};

export const getMaterialsByElement = (element) => {
  return Object.values(MATERIALS).filter(m => m.element === element);
};

export const getOres = () => getMaterialsByCategory('ore');
export const getEssences = () => getMaterialsByCategory('essence');
export const getGems = () => getMaterialsByCategory('gem');
export const getUpgradeMaterials = () => getMaterialsByCategory('upgrade');
