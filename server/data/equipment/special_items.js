// ============================================================
// SPECIAL ITEMS DATABASE
// Hidden class scrolls, memory crystals, keys, unique items
// ============================================================

export const SPECIAL_ITEMS = {
  
  // ============================================================
  // HIDDEN CLASS SCROLLS (One per hidden class)
  // ============================================================
  
  // Swordsman Hidden Classes
  scroll_flameblade: {
    id: 'scroll_flameblade',
    name: 'Flameblade Scroll',
    icon: '📜🔥',
    type: 'scroll',
    category: 'hidden_class',
    hiddenClass: 'flameblade',
    baseClass: 'swordsman',
    rarity: 'legendary',
    stackable: false,
    unique: true, // Only one can exist in game
    dropFloor: 10,
    dropSource: 'boss',
    dropRate: 0.06,
    sellPrice: 5000,
    description: 'Unlocks Flameblade hidden class. Burns with eternal flame.'
  },
  
  scroll_berserker: {
    id: 'scroll_berserker',
    name: 'Berserker Scroll',
    icon: '📜💢',
    type: 'scroll',
    category: 'hidden_class',
    hiddenClass: 'berserker',
    baseClass: 'swordsman',
    rarity: 'legendary',
    stackable: false,
    unique: true,
    dropFloor: 10,
    dropSource: 'boss',
    dropRate: 0.06,
    sellPrice: 5000,
    description: 'Unlocks Berserker hidden class. Rage is power.'
  },
  
  scroll_paladin: {
    id: 'scroll_paladin',
    name: 'Paladin Scroll',
    icon: '📜✨',
    type: 'scroll',
    category: 'hidden_class',
    hiddenClass: 'paladin',
    baseClass: 'swordsman',
    rarity: 'legendary',
    stackable: false,
    unique: true,
    dropFloor: 10,
    dropSource: 'boss',
    dropRate: 0.06,
    sellPrice: 5000,
    description: 'Unlocks Paladin hidden class. Holy warrior.'
  },
  
  scroll_earthshaker: {
    id: 'scroll_earthshaker',
    name: 'Earthshaker Scroll',
    icon: '📜🌍',
    type: 'scroll',
    category: 'hidden_class',
    hiddenClass: 'earthshaker',
    baseClass: 'swordsman',
    rarity: 'legendary',
    stackable: false,
    unique: true,
    dropFloor: 10,
    dropSource: 'boss',
    dropRate: 0.06,
    sellPrice: 5000,
    description: 'Unlocks Earthshaker hidden class. Shatter the earth.'
  },
  
  scroll_frostguard: {
    id: 'scroll_frostguard',
    name: 'Frostguard Scroll',
    icon: '📜❄️',
    type: 'scroll',
    category: 'hidden_class',
    hiddenClass: 'frostguard',
    baseClass: 'swordsman',
    rarity: 'legendary',
    stackable: false,
    unique: true,
    dropFloor: 10,
    dropSource: 'boss',
    dropRate: 0.06,
    sellPrice: 5000,
    description: 'Unlocks Frostguard hidden class. Ice shield.'
  },
  
  // Thief Hidden Classes
  scroll_shadow_dancer: {
    id: 'scroll_shadow_dancer',
    name: 'Shadow Dancer Scroll',
    icon: '📜🌑',
    type: 'scroll',
    category: 'hidden_class',
    hiddenClass: 'shadowDancer',
    baseClass: 'thief',
    rarity: 'legendary',
    stackable: false,
    unique: true,
    dropFloor: 10,
    dropSource: 'boss',
    dropRate: 0.06,
    sellPrice: 5000,
    description: 'Unlocks Shadow Dancer hidden class. Dance in darkness.'
  },
  
  scroll_venomancer: {
    id: 'scroll_venomancer',
    name: 'Venomancer Scroll',
    icon: '📜🐍',
    type: 'scroll',
    category: 'hidden_class',
    hiddenClass: 'venomancer',
    baseClass: 'thief',
    rarity: 'legendary',
    stackable: false,
    unique: true,
    dropFloor: 10,
    dropSource: 'boss',
    dropRate: 0.06,
    sellPrice: 5000,
    description: 'Unlocks Venomancer hidden class. Poison master.'
  },
  
  scroll_assassin: {
    id: 'scroll_assassin',
    name: 'Assassin Scroll',
    icon: '📜⚫',
    type: 'scroll',
    category: 'hidden_class',
    hiddenClass: 'assassin',
    baseClass: 'thief',
    rarity: 'legendary',
    stackable: false,
    unique: true,
    dropFloor: 10,
    dropSource: 'boss',
    dropRate: 0.06,
    sellPrice: 5000,
    description: 'Unlocks Assassin hidden class. Silent killer.'
  },
  
  scroll_phantom: {
    id: 'scroll_phantom',
    name: 'Phantom Scroll',
    icon: '📜👻',
    type: 'scroll',
    category: 'hidden_class',
    hiddenClass: 'phantom',
    baseClass: 'thief',
    rarity: 'legendary',
    stackable: false,
    unique: true,
    dropFloor: 10,
    dropSource: 'boss',
    dropRate: 0.06,
    sellPrice: 5000,
    description: 'Unlocks Phantom hidden class. Phase through reality.'
  },
  
  scroll_bloodreaper: {
    id: 'scroll_bloodreaper',
    name: 'Bloodreaper Scroll',
    icon: '📜🩸',
    type: 'scroll',
    category: 'hidden_class',
    hiddenClass: 'bloodreaper',
    baseClass: 'thief',
    rarity: 'legendary',
    stackable: false,
    unique: true,
    dropFloor: 10,
    dropSource: 'boss',
    dropRate: 0.06,
    sellPrice: 5000,
    description: 'Unlocks Bloodreaper hidden class. Life stealer.'
  },
  
  // Archer Hidden Classes
  scroll_storm_ranger: {
    id: 'scroll_storm_ranger',
    name: 'Storm Ranger Scroll',
    icon: '📜⚡',
    type: 'scroll',
    category: 'hidden_class',
    hiddenClass: 'stormRanger',
    baseClass: 'archer',
    rarity: 'legendary',
    stackable: false,
    unique: true,
    dropFloor: 10,
    dropSource: 'boss',
    dropRate: 0.06,
    sellPrice: 5000,
    description: 'Unlocks Storm Ranger hidden class. Lightning arrows.'
  },
  
  scroll_pyro_archer: {
    id: 'scroll_pyro_archer',
    name: 'Pyro Archer Scroll',
    icon: '📜🔥',
    type: 'scroll',
    category: 'hidden_class',
    hiddenClass: 'pyroArcher',
    baseClass: 'archer',
    rarity: 'legendary',
    stackable: false,
    unique: true,
    dropFloor: 10,
    dropSource: 'boss',
    dropRate: 0.06,
    sellPrice: 5000,
    description: 'Unlocks Pyro Archer hidden class. Flame arrows.'
  },
  
  scroll_frost_sniper: {
    id: 'scroll_frost_sniper',
    name: 'Frost Sniper Scroll',
    icon: '📜❄️',
    type: 'scroll',
    category: 'hidden_class',
    hiddenClass: 'frostSniper',
    baseClass: 'archer',
    rarity: 'legendary',
    stackable: false,
    unique: true,
    dropFloor: 10,
    dropSource: 'boss',
    dropRate: 0.06,
    sellPrice: 5000,
    description: 'Unlocks Frost Sniper hidden class. Ice precision.'
  },
  
  scroll_nature_warden: {
    id: 'scroll_nature_warden',
    name: 'Nature Warden Scroll',
    icon: '📜🌿',
    type: 'scroll',
    category: 'hidden_class',
    hiddenClass: 'natureWarden',
    baseClass: 'archer',
    rarity: 'legendary',
    stackable: false,
    unique: true,
    dropFloor: 10,
    dropSource: 'boss',
    dropRate: 0.06,
    sellPrice: 5000,
    description: 'Unlocks Nature Warden hidden class. Forest guardian.'
  },
  
  scroll_void_hunter: {
    id: 'scroll_void_hunter',
    name: 'Void Hunter Scroll',
    icon: '📜🌀',
    type: 'scroll',
    category: 'hidden_class',
    hiddenClass: 'voidHunter',
    baseClass: 'archer',
    rarity: 'legendary',
    stackable: false,
    unique: true,
    dropFloor: 10,
    dropSource: 'boss',
    dropRate: 0.06,
    sellPrice: 5000,
    description: 'Unlocks Void Hunter hidden class. Pierce reality.'
  },
  
  // Mage Hidden Classes
  scroll_frost_weaver: {
    id: 'scroll_frost_weaver',
    name: 'Frost Weaver Scroll',
    icon: '📜❄️',
    type: 'scroll',
    category: 'hidden_class',
    hiddenClass: 'frostWeaver',
    baseClass: 'mage',
    rarity: 'legendary',
    stackable: false,
    unique: true,
    dropFloor: 10,
    dropSource: 'boss',
    dropRate: 0.06,
    sellPrice: 5000,
    description: 'Unlocks Frost Weaver hidden class. Ice master.'
  },
  
  scroll_pyromancer: {
    id: 'scroll_pyromancer',
    name: 'Pyromancer Scroll',
    icon: '📜🔥',
    type: 'scroll',
    category: 'hidden_class',
    hiddenClass: 'pyromancer',
    baseClass: 'mage',
    rarity: 'legendary',
    stackable: false,
    unique: true,
    dropFloor: 10,
    dropSource: 'boss',
    dropRate: 0.06,
    sellPrice: 5000,
    description: 'Unlocks Pyromancer hidden class. Fire master.'
  },
  
  scroll_stormcaller: {
    id: 'scroll_stormcaller',
    name: 'Stormcaller Scroll',
    icon: '📜⚡',
    type: 'scroll',
    category: 'hidden_class',
    hiddenClass: 'stormcaller',
    baseClass: 'mage',
    rarity: 'legendary',
    stackable: false,
    unique: true,
    dropFloor: 10,
    dropSource: 'boss',
    dropRate: 0.06,
    sellPrice: 5000,
    description: 'Unlocks Stormcaller hidden class. Thunder master.'
  },
  
  scroll_necromancer: {
    id: 'scroll_necromancer',
    name: 'Necromancer Scroll',
    icon: '📜💀',
    type: 'scroll',
    category: 'hidden_class',
    hiddenClass: 'necromancer',
    baseClass: 'mage',
    rarity: 'legendary',
    stackable: false,
    unique: true,
    dropFloor: 10,
    dropSource: 'boss',
    dropRate: 0.06,
    sellPrice: 5000,
    description: 'Unlocks Necromancer hidden class. Death master.'
  },
  
  scroll_arcanist: {
    id: 'scroll_arcanist',
    name: 'Arcanist Scroll',
    icon: '📜✨',
    type: 'scroll',
    category: 'hidden_class',
    hiddenClass: 'arcanist',
    baseClass: 'mage',
    rarity: 'legendary',
    stackable: false,
    unique: true,
    dropFloor: 10,
    dropSource: 'boss',
    dropRate: 0.06,
    sellPrice: 5000,
    description: 'Unlocks Arcanist hidden class. Pure magic.'
  },
  
  
  // ============================================================
  // MEMORY CRYSTALS
  // ============================================================
  
  memory_crystal_fragment: {
    id: 'memory_crystal_fragment',
    name: 'Memory Crystal Fragment',
    icon: '🔮',
    type: 'special',
    category: 'memory',
    rarity: 'epic',
    stackable: true,
    maxStack: 99,
    dropFloor: 10,
    dropSource: 'boss',
    dropRate: 0.10,
    sellPrice: 500,
    description: 'Fragment of a memory crystal. Collect 10 for full crystal.'
  },
  
  memory_crystal: {
    id: 'memory_crystal',
    name: 'Memory Crystal',
    icon: '💎',
    type: 'special',
    category: 'memory',
    rarity: 'legendary',
    stackable: false,
    craftable: true,
    craftRecipe: { memory_crystal_fragment: 10 },
    sellPrice: 0, // Cannot sell
    description: 'Removes hidden class, allowing you to obtain a new one.'
  },
  
  
  // ============================================================
  // DUNGEON KEYS
  // ============================================================
  
  bronze_key: {
    id: 'bronze_key',
    name: 'Bronze Key',
    icon: '🔑',
    type: 'key',
    category: 'dungeon',
    rarity: 'uncommon',
    stackable: true,
    maxStack: 10,
    dropFloor: 3,
    dropSource: 'elite',
    dropRate: 0.15,
    sellPrice: 100,
    description: 'Opens bronze-tier bonus dungeons.'
  },
  
  silver_key: {
    id: 'silver_key',
    name: 'Silver Key',
    icon: '🗝️',
    type: 'key',
    category: 'dungeon',
    rarity: 'rare',
    stackable: true,
    maxStack: 10,
    dropFloor: 7,
    dropSource: 'elite',
    dropRate: 0.10,
    sellPrice: 300,
    description: 'Opens silver-tier bonus dungeons.'
  },
  
  gold_key: {
    id: 'gold_key',
    name: 'Gold Key',
    icon: '🔐',
    type: 'key',
    category: 'dungeon',
    rarity: 'epic',
    stackable: true,
    maxStack: 10,
    dropFloor: 12,
    dropSource: 'boss',
    dropRate: 0.08,
    sellPrice: 800,
    description: 'Opens gold-tier bonus dungeons.'
  },
  
  void_key: {
    id: 'void_key',
    name: 'Void Key',
    icon: '🌀',
    type: 'key',
    category: 'dungeon',
    rarity: 'legendary',
    stackable: true,
    maxStack: 5,
    dropFloor: 15,
    dropSource: 'boss',
    dropRate: 0.05,
    sellPrice: 2000,
    description: 'Opens the Void Dungeon. Extreme difficulty.'
  },
  
  
  // ============================================================
  // TICKETS & TOKENS
  // ============================================================
  
  arena_ticket: {
    id: 'arena_ticket',
    name: 'Arena Ticket',
    icon: '🎫',
    type: 'ticket',
    category: 'event',
    rarity: 'uncommon',
    stackable: true,
    maxStack: 50,
    buyPrice: 500,
    sellPrice: 125,
    description: 'Entry ticket for PvP Arena.'
  },
  
  raid_token: {
    id: 'raid_token',
    name: 'Raid Token',
    icon: '🏆',
    type: 'token',
    category: 'event',
    rarity: 'rare',
    stackable: true,
    maxStack: 100,
    sellPrice: 50,
    description: 'Earned from raids. Exchange for rewards.'
  },
  
  guild_emblem: {
    id: 'guild_emblem',
    name: 'Guild Emblem',
    icon: '🛡️',
    type: 'token',
    category: 'guild',
    rarity: 'rare',
    stackable: true,
    maxStack: 100,
    sellPrice: 0,
    description: 'Earned from guild activities. Exchange at guild shop.'
  },
  
  
  // ============================================================
  // UNIQUE/QUEST ITEMS
  // ============================================================
  
  doorkeeper_blessing: {
    id: 'doorkeeper_blessing',
    name: "Doorkeeper's Blessing",
    icon: '🚪',
    type: 'unique',
    category: 'quest',
    rarity: 'legendary',
    stackable: false,
    sellPrice: 0,
    description: 'Blessing from the Doorkeeper. Increases hidden class scroll drop rate by 2%.'
  },
  
  shadow_monarch_seal: {
    id: 'shadow_monarch_seal',
    name: "Shadow Monarch's Seal",
    icon: '👑',
    type: 'unique',
    category: 'quest',
    rarity: 'legendary',
    stackable: false,
    sellPrice: 0,
    description: 'Proof of defeating the Shadow Monarch. Unknown power.'
  },
  
  hunters_license: {
    id: 'hunters_license',
    name: "Hunter's License",
    icon: '📋',
    type: 'unique',
    category: 'quest',
    rarity: 'epic',
    stackable: false,
    sellPrice: 0,
    description: 'Official hunter license. Unlocks S-rank quests.'
  }
};

// ============================================================
// HELPERS
// ============================================================

export const getHiddenClassScrolls = () => {
  return Object.values(SPECIAL_ITEMS).filter(i => i.category === 'hidden_class');
};

export const getScrollByHiddenClass = (hiddenClass) => {
  return Object.values(SPECIAL_ITEMS).find(i => i.hiddenClass === hiddenClass);
};

export const getScrollsByBaseClass = (baseClass) => {
  return Object.values(SPECIAL_ITEMS).filter(i => 
    i.category === 'hidden_class' && i.baseClass === baseClass
  );
};

export const getKeys = () => {
  return Object.values(SPECIAL_ITEMS).filter(i => i.type === 'key');
};

export const getMemoryItems = () => {
  return Object.values(SPECIAL_ITEMS).filter(i => i.category === 'memory');
};

export const getUniqueItems = () => {
  return Object.values(SPECIAL_ITEMS).filter(i => i.type === 'unique');
};
