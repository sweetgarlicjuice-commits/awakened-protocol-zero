// ============================================================
// MONSTER DROPS DATABASE
// Monster-specific loot and materials
// ============================================================

export const MONSTER_DROPS = {
  
  // ============================================================
  // TOWER 1 - CRIMSON SPIRE (Undead theme)
  // ============================================================
  
  bone_fragment: {
    id: 'bone_fragment',
    name: 'Bone Fragment',
    icon: '🦴',
    type: 'material',
    category: 'monster',
    source: ['skeleton', 'skeleton_warrior', 'skeleton_archer'],
    tower: 1,
    rarity: 'common',
    stackable: true,
    maxStack: 999,
    sellPrice: 3,
    description: 'Fragment from undead skeleton.'
  },
  
  cursed_bone: {
    id: 'cursed_bone',
    name: 'Cursed Bone',
    icon: '💀',
    type: 'material',
    category: 'monster',
    source: ['skeleton_mage', 'bone_golem'],
    tower: 1,
    rarity: 'uncommon',
    stackable: true,
    maxStack: 999,
    sellPrice: 12,
    description: 'Bone infused with dark magic.'
  },
  
  death_knight_core: {
    id: 'death_knight_core',
    name: 'Death Knight Core',
    icon: '⚫',
    type: 'material',
    category: 'monster',
    source: ['death_knight'],
    tower: 1,
    rarity: 'rare',
    isBossDrop: true,
    stackable: true,
    maxStack: 99,
    sellPrice: 100,
    description: 'Core of the Death Knight boss.'
  },
  
  
  // ============================================================
  // TOWER 2 - FROST CITADEL (Ice theme)
  // ============================================================
  
  ice_shard: {
    id: 'ice_shard',
    name: 'Ice Shard',
    icon: '🧊',
    type: 'material',
    category: 'monster',
    source: ['ice_slime', 'frost_sprite'],
    tower: 2,
    rarity: 'common',
    stackable: true,
    maxStack: 999,
    sellPrice: 4,
    description: 'Sharp shard of magical ice.'
  },
  
  frozen_heart: {
    id: 'frozen_heart',
    name: 'Frozen Heart',
    icon: '💙',
    type: 'material',
    category: 'monster',
    source: ['ice_golem', 'frost_elemental'],
    tower: 2,
    rarity: 'uncommon',
    stackable: true,
    maxStack: 999,
    sellPrice: 15,
    description: 'Heart of an ice creature.'
  },
  
  frost_wyrm_scale: {
    id: 'frost_wyrm_scale',
    name: 'Frost Wyrm Scale',
    icon: '❄️',
    type: 'material',
    category: 'monster',
    source: ['frost_wyrm'],
    tower: 2,
    rarity: 'rare',
    isBossDrop: true,
    stackable: true,
    maxStack: 99,
    sellPrice: 120,
    description: 'Scale from the Frost Wyrm boss.'
  },
  
  
  // ============================================================
  // TOWER 3 - SHADOW KEEP (Dark theme)
  // ============================================================
  
  shadow_dust: {
    id: 'shadow_dust',
    name: 'Shadow Dust',
    icon: '🌫️',
    type: 'material',
    category: 'monster',
    source: ['shadow_imp', 'dark_wisp'],
    tower: 3,
    rarity: 'common',
    stackable: true,
    maxStack: 999,
    sellPrice: 5,
    description: 'Dust from shadow creatures.'
  },
  
  nightmare_essence: {
    id: 'nightmare_essence',
    name: 'Nightmare Essence',
    icon: '😈',
    type: 'material',
    category: 'monster',
    source: ['nightmare', 'shadow_stalker'],
    tower: 3,
    rarity: 'uncommon',
    stackable: true,
    maxStack: 999,
    sellPrice: 18,
    description: 'Essence of nightmares.'
  },
  
  shadow_lord_fragment: {
    id: 'shadow_lord_fragment',
    name: 'Shadow Lord Fragment',
    icon: '🖤',
    type: 'material',
    category: 'monster',
    source: ['shadow_lord'],
    tower: 3,
    rarity: 'rare',
    isBossDrop: true,
    stackable: true,
    maxStack: 99,
    sellPrice: 150,
    description: 'Fragment of the Shadow Lord.'
  },
  
  
  // ============================================================
  // TOWER 4 - STORM BASTION (Lightning theme)
  // ============================================================
  
  static_charge: {
    id: 'static_charge',
    name: 'Static Charge',
    icon: '⚡',
    type: 'material',
    category: 'monster',
    source: ['spark_elemental', 'storm_sprite'],
    tower: 4,
    rarity: 'common',
    stackable: true,
    maxStack: 999,
    sellPrice: 6,
    description: 'Condensed electrical energy.'
  },
  
  thunder_core: {
    id: 'thunder_core',
    name: 'Thunder Core',
    icon: '🌩️',
    type: 'material',
    category: 'monster',
    source: ['thunder_golem', 'storm_elemental'],
    tower: 4,
    rarity: 'uncommon',
    stackable: true,
    maxStack: 999,
    sellPrice: 20,
    description: 'Core of a thunder creature.'
  },
  
  storm_titan_eye: {
    id: 'storm_titan_eye',
    name: 'Storm Titan Eye',
    icon: '👁️',
    type: 'material',
    category: 'monster',
    source: ['storm_titan'],
    tower: 4,
    rarity: 'rare',
    isBossDrop: true,
    stackable: true,
    maxStack: 99,
    sellPrice: 180,
    description: 'Eye of the Storm Titan boss.'
  },
  
  
  // ============================================================
  // TOWER 5 - VERDANT TOWER (Nature theme)
  // ============================================================
  
  vine_fiber: {
    id: 'vine_fiber',
    name: 'Vine Fiber',
    icon: '🌱',
    type: 'material',
    category: 'monster',
    source: ['vine_creeper', 'thorn_sprite'],
    tower: 5,
    rarity: 'common',
    stackable: true,
    maxStack: 999,
    sellPrice: 5,
    description: 'Strong plant fiber.'
  },
  
  ancient_bark: {
    id: 'ancient_bark',
    name: 'Ancient Bark',
    icon: '🌲',
    type: 'material',
    category: 'monster',
    source: ['treant', 'ancient_ent'],
    tower: 5,
    rarity: 'uncommon',
    stackable: true,
    maxStack: 999,
    sellPrice: 22,
    description: 'Bark from ancient trees.'
  },
  
  world_tree_seed: {
    id: 'world_tree_seed',
    name: 'World Tree Seed',
    icon: '🌰',
    type: 'material',
    category: 'monster',
    source: ['guardian_treant'],
    tower: 5,
    rarity: 'rare',
    isBossDrop: true,
    stackable: true,
    maxStack: 99,
    sellPrice: 200,
    description: 'Seed from the World Tree Guardian.'
  },
  
  
  // ============================================================
  // TOWER 6-10 (Higher tier drops)
  // ============================================================
  
  infernal_ash: {
    id: 'infernal_ash',
    name: 'Infernal Ash',
    icon: '🔥',
    type: 'material',
    category: 'monster',
    source: ['fire_demon', 'infernal'],
    tower: 6,
    rarity: 'uncommon',
    stackable: true,
    maxStack: 999,
    sellPrice: 25,
    description: 'Ash from fire demons.'
  },
  
  demon_heart: {
    id: 'demon_heart',
    name: 'Demon Heart',
    icon: '💔',
    type: 'material',
    category: 'monster',
    source: ['arch_demon'],
    tower: 6,
    rarity: 'rare',
    isBossDrop: true,
    stackable: true,
    maxStack: 99,
    sellPrice: 250,
    description: 'Heart of an Arch Demon.'
  },
  
  abyssal_scale: {
    id: 'abyssal_scale',
    name: 'Abyssal Scale',
    icon: '🐚',
    type: 'material',
    category: 'monster',
    source: ['sea_serpent', 'kraken_spawn'],
    tower: 7,
    rarity: 'uncommon',
    stackable: true,
    maxStack: 999,
    sellPrice: 28,
    description: 'Scale from deep sea creatures.'
  },
  
  leviathan_tooth: {
    id: 'leviathan_tooth',
    name: 'Leviathan Tooth',
    icon: '🦷',
    type: 'material',
    category: 'monster',
    source: ['leviathan'],
    tower: 7,
    rarity: 'rare',
    isBossDrop: true,
    stackable: true,
    maxStack: 99,
    sellPrice: 280,
    description: 'Tooth of the Leviathan.'
  },
  
  crystal_fragment: {
    id: 'crystal_fragment',
    name: 'Crystal Fragment',
    icon: '💎',
    type: 'material',
    category: 'monster',
    source: ['crystal_golem', 'gem_guardian'],
    tower: 8,
    rarity: 'uncommon',
    stackable: true,
    maxStack: 999,
    sellPrice: 30,
    description: 'Fragment of magical crystal.'
  },
  
  prism_core: {
    id: 'prism_core',
    name: 'Prism Core',
    icon: '🌈',
    type: 'material',
    category: 'monster',
    source: ['prism_guardian'],
    tower: 8,
    rarity: 'rare',
    isBossDrop: true,
    stackable: true,
    maxStack: 99,
    sellPrice: 320,
    description: 'Core of the Prism Guardian.'
  },
  
  void_residue: {
    id: 'void_residue',
    name: 'Void Residue',
    icon: '🌀',
    type: 'material',
    category: 'monster',
    source: ['void_walker', 'dimension_rift'],
    tower: 9,
    rarity: 'rare',
    stackable: true,
    maxStack: 999,
    sellPrice: 50,
    description: 'Residue from void creatures.'
  },
  
  void_lord_essence: {
    id: 'void_lord_essence',
    name: 'Void Lord Essence',
    icon: '⬛',
    type: 'material',
    category: 'monster',
    source: ['void_lord'],
    tower: 9,
    rarity: 'epic',
    isBossDrop: true,
    stackable: true,
    maxStack: 99,
    sellPrice: 400,
    description: 'Essence of the Void Lord.'
  },
  
  celestial_dust: {
    id: 'celestial_dust',
    name: 'Celestial Dust',
    icon: '✨',
    type: 'material',
    category: 'monster',
    source: ['angel', 'seraphim'],
    tower: 10,
    rarity: 'rare',
    stackable: true,
    maxStack: 999,
    sellPrice: 60,
    description: 'Dust from celestial beings.'
  },
  
  archangel_feather: {
    id: 'archangel_feather',
    name: 'Archangel Feather',
    icon: '🪶',
    type: 'material',
    category: 'monster',
    source: ['archangel'],
    tower: 10,
    rarity: 'epic',
    isBossDrop: true,
    stackable: true,
    maxStack: 99,
    sellPrice: 500,
    description: 'Feather of an Archangel.'
  },
  
  
  // ============================================================
  // UNIVERSAL DROPS (Any tower)
  // ============================================================
  
  monster_blood: {
    id: 'monster_blood',
    name: 'Monster Blood',
    icon: '🩸',
    type: 'material',
    category: 'monster',
    source: ['any'],
    tower: null,
    rarity: 'common',
    stackable: true,
    maxStack: 999,
    sellPrice: 2,
    description: 'Blood from any monster.'
  },
  
  magic_crystal: {
    id: 'magic_crystal',
    name: 'Magic Crystal',
    icon: '💠',
    type: 'material',
    category: 'monster',
    source: ['any_magic'],
    tower: null,
    rarity: 'uncommon',
    stackable: true,
    maxStack: 999,
    sellPrice: 15,
    description: 'Crystal from magical creatures.'
  },
  
  rare_hide: {
    id: 'rare_hide',
    name: 'Rare Hide',
    icon: '🐾',
    type: 'material',
    category: 'monster',
    source: ['any_beast'],
    tower: null,
    rarity: 'uncommon',
    stackable: true,
    maxStack: 999,
    sellPrice: 20,
    description: 'Hide from powerful beasts.'
  }
};

// ============================================================
// HELPERS
// ============================================================

export const getDropsByTower = (towerId) => {
  return Object.values(MONSTER_DROPS).filter(d => d.tower === towerId || d.tower === null);
};

export const getDropsByMonster = (monsterId) => {
  return Object.values(MONSTER_DROPS).filter(d => 
    d.source.includes(monsterId) || d.source.includes('any')
  );
};

export const getBossDrops = () => {
  return Object.values(MONSTER_DROPS).filter(d => d.isBossDrop);
};

export const getDropsByRarity = (rarity) => {
  return Object.values(MONSTER_DROPS).filter(d => d.rarity === rarity);
};
