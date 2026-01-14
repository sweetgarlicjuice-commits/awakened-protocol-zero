// ============================================================
// TOWER CONFIGURATION - 10 TOWERS
// ============================================================

export const TOWERS = {
  1: {
    id: 1,
    name: "Crimson Spire",
    description: "Ancient ruins filled with undead creatures",
    theme: "undead",
    levelRange: { min: 1, max: 15 },
    floors: 15,
    lootTier: ['common', 'rare'],
    setName: 'Gridz',
    background: "crimson"
  },
  2: {
    id: 2,
    name: "Azure Depths",
    description: "Underwater caverns with aquatic monsters",
    theme: "aquatic",
    levelRange: { min: 15, max: 30 },
    floors: 15,
    lootTier: ['rare', 'epic'],
    setName: 'Tempest',
    requirement: { tower: 1, cleared: true },
    background: "azure"
  },
  3: {
    id: 3,
    name: "Volcanic Core",
    description: "Molten caverns filled with fire elementals",
    theme: "fire",
    levelRange: { min: 30, max: 50 },
    floors: 15,
    lootTier: ['epic', 'legendary'],
    setName: 'Inferno',
    requirement: { tower: 2, cleared: true },
    background: "volcanic"
  },
  4: {
    id: 4,
    name: "Frozen Peak",
    description: "Icy mountains with frost giants",
    theme: "ice",
    levelRange: { min: 50, max: 70 },
    floors: 15,
    lootTier: ['legendary'],
    setName: 'Glacial',
    requirement: { tower: 3, cleared: true },
    background: "frozen"
  },
  5: {
    id: 5,
    name: "Shadow Realm",
    description: "Dark dimension of nightmares",
    theme: "shadow",
    levelRange: { min: 70, max: 100 },
    floors: 15,
    lootTier: ['legendary', 'epic'],
    setName: 'Nightmare',
    requirement: { tower: 4, cleared: true },
    background: "shadow"
  },
  6: {
    id: 6,
    name: "Celestial Sanctum",
    description: "Floating temples in the sky",
    theme: "celestial",
    levelRange: { min: 100, max: 130 },
    floors: 15,
    lootTier: ['legendary', 'mythical'],
    setName: 'Celestial',
    requirement: { tower: 5, cleared: true },
    background: "celestial"
  },
  7: {
    id: 7,
    name: "Abyssal Void",
    description: "The endless void between worlds",
    theme: "void",
    levelRange: { min: 130, max: 160 },
    floors: 15,
    lootTier: ['mythical'],
    setName: 'Abyssal',
    requirement: { tower: 6, cleared: true },
    background: "abyssal"
  },
  8: {
    id: 8,
    name: "Dragon's Domain",
    description: "Ancient dragon lairs",
    theme: "dragon",
    levelRange: { min: 160, max: 180 },
    floors: 15,
    lootTier: ['mythical'],
    setName: 'Dragonborn',
    requirement: { tower: 7, cleared: true },
    background: "dragon"
  },
  9: {
    id: 9,
    name: "Eternal Citadel",
    description: "The fortress of the ancient ones",
    theme: "eternal",
    levelRange: { min: 180, max: 190 },
    floors: 15,
    lootTier: ['mythical'],
    setName: 'Eternal',
    requirement: { tower: 8, cleared: true },
    background: "eternal"
  },
  10: {
    id: 10,
    name: "Throne of Gods",
    description: "The final challenge - realm of the divine",
    theme: "divine",
    levelRange: { min: 190, max: 200 },
    floors: 15,
    lootTier: ['mythical'],
    setName: 'Divine',
    requirement: { tower: 9, cleared: true },
    background: "divine"
  }
};

// ============================================================
// ENEMIES PER TOWER
// ============================================================

export const ENEMIES = {
  tower1: {
    normal: [
      { id: 'skeleton_warrior', name: 'Skeleton Warrior', icon: '💀', baseHp: 50, baseAtk: 8, baseDef: 3, expReward: 15, goldReward: { min: 5, max: 15 }, floors: [1, 2, 3, 4] },
      { id: 'zombie', name: 'Rotting Zombie', icon: '🧟', baseHp: 70, baseAtk: 10, baseDef: 2, expReward: 20, goldReward: { min: 8, max: 20 }, floors: [2, 3, 4, 5] },
      { id: 'cursed_knight', name: 'Cursed Knight', icon: '⚔️', baseHp: 90, baseAtk: 14, baseDef: 6, expReward: 30, goldReward: { min: 12, max: 30 }, floors: [5, 6, 7, 8, 9] },
      { id: 'ghost', name: 'Wandering Ghost', icon: '👻', baseHp: 60, baseAtk: 16, baseDef: 1, expReward: 25, goldReward: { min: 10, max: 25 }, floors: [6, 7, 8, 9] },
      { id: 'bone_mage', name: 'Bone Mage', icon: '🦴', baseHp: 55, baseAtk: 18, baseDef: 2, expReward: 35, goldReward: { min: 15, max: 35 }, floors: [8, 9, 11, 12] }
    ],
    elite: [
      { id: 'death_knight', name: 'Death Knight', icon: '🖤', baseHp: 200, baseAtk: 25, baseDef: 12, expReward: 100, goldReward: { min: 50, max: 100 }, floors: [13, 14], isElite: true },
      { id: 'lich_apprentice', name: 'Lich Apprentice', icon: '💜', baseHp: 180, baseAtk: 30, baseDef: 8, expReward: 120, goldReward: { min: 60, max: 120 }, floors: [13, 14], isElite: true }
    ],
    boss: { id: 'hollow_king', name: 'The Hollow King', icon: '👑', baseHp: 500, baseAtk: 35, baseDef: 15, expReward: 300, goldReward: { min: 150, max: 300 }, floor: 15, isBoss: true }
  },
  tower2: {
    normal: [
      { id: 'drowned_pirate', name: 'Drowned Pirate', icon: '🏴‍☠️', baseHp: 100, baseAtk: 18, baseDef: 6, expReward: 40, goldReward: { min: 20, max: 40 }, floors: [1, 2, 3, 4] },
      { id: 'sea_serpent', name: 'Sea Serpent', icon: '🐍', baseHp: 130, baseAtk: 22, baseDef: 5, expReward: 50, goldReward: { min: 25, max: 50 }, floors: [3, 4, 5, 6] },
      { id: 'coral_golem', name: 'Coral Golem', icon: '🪸', baseHp: 180, baseAtk: 20, baseDef: 15, expReward: 60, goldReward: { min: 30, max: 60 }, floors: [5, 6, 7, 8, 9] },
      { id: 'siren', name: 'Deadly Siren', icon: '🧜‍♀️', baseHp: 110, baseAtk: 28, baseDef: 4, expReward: 55, goldReward: { min: 28, max: 55 }, floors: [7, 8, 9] },
      { id: 'deep_one', name: 'Deep One', icon: '🦑', baseHp: 150, baseAtk: 30, baseDef: 10, expReward: 70, goldReward: { min: 35, max: 70 }, floors: [8, 9, 11, 12] }
    ],
    elite: [
      { id: 'kraken_spawn', name: 'Kraken Spawn', icon: '🐙', baseHp: 400, baseAtk: 45, baseDef: 18, expReward: 200, goldReward: { min: 100, max: 200 }, floors: [13, 14], isElite: true },
      { id: 'abyssal_lord', name: 'Abyssal Lord', icon: '🌊', baseHp: 350, baseAtk: 50, baseDef: 15, expReward: 220, goldReward: { min: 110, max: 220 }, floors: [13, 14], isElite: true }
    ],
    boss: { id: 'leviathan_herald', name: "Leviathan's Herald", icon: '🐋', baseHp: 1000, baseAtk: 60, baseDef: 25, expReward: 600, goldReward: { min: 300, max: 600 }, floor: 15, isBoss: true }
  },
  tower3: {
    normal: [
      { id: 'fire_imp', name: 'Fire Imp', icon: '🔥', baseHp: 200, baseAtk: 35, baseDef: 10, expReward: 80, goldReward: { min: 40, max: 80 }, floors: [1, 2, 3, 4] },
      { id: 'lava_golem', name: 'Lava Golem', icon: '🪨', baseHp: 350, baseAtk: 40, baseDef: 25, expReward: 100, goldReward: { min: 50, max: 100 }, floors: [3, 4, 5, 6] },
      { id: 'flame_wraith', name: 'Flame Wraith', icon: '👤', baseHp: 250, baseAtk: 50, baseDef: 8, expReward: 110, goldReward: { min: 55, max: 110 }, floors: [5, 6, 7, 8, 9] },
      { id: 'magma_serpent', name: 'Magma Serpent', icon: '🐉', baseHp: 300, baseAtk: 55, baseDef: 15, expReward: 130, goldReward: { min: 65, max: 130 }, floors: [7, 8, 9] },
      { id: 'ember_mage', name: 'Ember Mage', icon: '🧙', baseHp: 220, baseAtk: 65, baseDef: 10, expReward: 140, goldReward: { min: 70, max: 140 }, floors: [8, 9, 11, 12] }
    ],
    elite: [
      { id: 'infernal_knight', name: 'Infernal Knight', icon: '🔶', baseHp: 800, baseAtk: 80, baseDef: 35, expReward: 400, goldReward: { min: 200, max: 400 }, floors: [13, 14], isElite: true },
      { id: 'phoenix_guardian', name: 'Phoenix Guardian', icon: '🦅', baseHp: 700, baseAtk: 90, baseDef: 30, expReward: 450, goldReward: { min: 225, max: 450 }, floors: [13, 14], isElite: true }
    ],
    boss: { id: 'molten_king', name: 'Molten King', icon: '👑🔥', baseHp: 2000, baseAtk: 100, baseDef: 45, expReward: 1200, goldReward: { min: 600, max: 1200 }, floor: 15, isBoss: true }
  },
  tower4: {
    normal: [
      { id: 'frost_sprite', name: 'Frost Sprite', icon: '❄️', baseHp: 400, baseAtk: 60, baseDef: 20, expReward: 150, goldReward: { min: 75, max: 150 }, floors: [1, 2, 3, 4] },
      { id: 'ice_golem', name: 'Ice Golem', icon: '🧊', baseHp: 600, baseAtk: 65, baseDef: 40, expReward: 180, goldReward: { min: 90, max: 180 }, floors: [3, 4, 5, 6] },
      { id: 'frozen_knight', name: 'Frozen Knight', icon: '🥶', baseHp: 500, baseAtk: 80, baseDef: 30, expReward: 200, goldReward: { min: 100, max: 200 }, floors: [5, 6, 7, 8, 9] },
      { id: 'blizzard_wolf', name: 'Blizzard Wolf', icon: '🐺', baseHp: 450, baseAtk: 90, baseDef: 25, expReward: 220, goldReward: { min: 110, max: 220 }, floors: [7, 8, 9] },
      { id: 'ice_witch', name: 'Ice Witch', icon: '🧙‍♀️', baseHp: 380, baseAtk: 100, baseDef: 20, expReward: 250, goldReward: { min: 125, max: 250 }, floors: [8, 9, 11, 12] }
    ],
    elite: [
      { id: 'frost_giant', name: 'Frost Giant', icon: '🗿', baseHp: 1500, baseAtk: 130, baseDef: 60, expReward: 700, goldReward: { min: 350, max: 700 }, floors: [13, 14], isElite: true },
      { id: 'avalanche_lord', name: 'Avalanche Lord', icon: '⛰️', baseHp: 1400, baseAtk: 140, baseDef: 55, expReward: 750, goldReward: { min: 375, max: 750 }, floors: [13, 14], isElite: true }
    ],
    boss: { id: 'ice_emperor', name: 'Ice Emperor', icon: '👑❄️', baseHp: 4000, baseAtk: 160, baseDef: 70, expReward: 2000, goldReward: { min: 1000, max: 2000 }, floor: 15, isBoss: true }
  },
  tower5: {
    normal: [
      { id: 'shadow_stalker', name: 'Shadow Stalker', icon: '🌑', baseHp: 700, baseAtk: 100, baseDef: 30, expReward: 280, goldReward: { min: 140, max: 280 }, floors: [1, 2, 3, 4] },
      { id: 'nightmare_hound', name: 'Nightmare Hound', icon: '🐕‍🦺', baseHp: 800, baseAtk: 110, baseDef: 35, expReward: 320, goldReward: { min: 160, max: 320 }, floors: [3, 4, 5, 6] },
      { id: 'void_walker', name: 'Void Walker', icon: '👁️', baseHp: 750, baseAtk: 130, baseDef: 40, expReward: 360, goldReward: { min: 180, max: 360 }, floors: [5, 6, 7, 8, 9] },
      { id: 'dark_seraph', name: 'Dark Seraph', icon: '😈', baseHp: 850, baseAtk: 140, baseDef: 45, expReward: 400, goldReward: { min: 200, max: 400 }, floors: [7, 8, 9] },
      { id: 'nightmare_mage', name: 'Nightmare Mage', icon: '🧙‍♂️', baseHp: 650, baseAtk: 160, baseDef: 35, expReward: 450, goldReward: { min: 225, max: 450 }, floors: [8, 9, 11, 12] }
    ],
    elite: [
      { id: 'shadow_lord', name: 'Shadow Lord', icon: '🦇', baseHp: 2500, baseAtk: 200, baseDef: 80, expReward: 1200, goldReward: { min: 600, max: 1200 }, floors: [13, 14], isElite: true },
      { id: 'nightmare_king', name: 'Nightmare King', icon: '💀', baseHp: 2300, baseAtk: 220, baseDef: 75, expReward: 1300, goldReward: { min: 650, max: 1300 }, floors: [13, 14], isElite: true }
    ],
    boss: { id: 'void_emperor', name: 'Void Emperor', icon: '👁️‍🗨️', baseHp: 8000, baseAtk: 250, baseDef: 100, expReward: 4000, goldReward: { min: 2000, max: 4000 }, floor: 15, isBoss: true }
  }
};

// Generate enemies for towers 6-10 with scaling
for (let t = 6; t <= 10; t++) {
  const multiplier = Math.pow(1.5, t - 5);
  ENEMIES['tower' + t] = {
    normal: [
      { id: 't' + t + '_enemy1', name: 'Tower ' + t + ' Guardian', icon: '⚔️', baseHp: Math.floor(1000 * multiplier), baseAtk: Math.floor(180 * multiplier), baseDef: Math.floor(50 * multiplier), expReward: Math.floor(500 * multiplier), goldReward: { min: Math.floor(250 * multiplier), max: Math.floor(500 * multiplier) }, floors: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
      { id: 't' + t + '_enemy2', name: 'Tower ' + t + ' Sentinel', icon: '🛡️', baseHp: Math.floor(1200 * multiplier), baseAtk: Math.floor(200 * multiplier), baseDef: Math.floor(60 * multiplier), expReward: Math.floor(600 * multiplier), goldReward: { min: Math.floor(300 * multiplier), max: Math.floor(600 * multiplier) }, floors: [5, 6, 7, 8, 9, 10, 11, 12] }
    ],
    elite: [
      { id: 't' + t + '_elite', name: 'Tower ' + t + ' Champion', icon: '💎', baseHp: Math.floor(4000 * multiplier), baseAtk: Math.floor(300 * multiplier), baseDef: Math.floor(100 * multiplier), expReward: Math.floor(2000 * multiplier), goldReward: { min: Math.floor(1000 * multiplier), max: Math.floor(2000 * multiplier) }, floors: [13, 14], isElite: true }
    ],
    boss: { id: 't' + t + '_boss', name: 'Tower ' + t + ' Overlord', icon: '👑', baseHp: Math.floor(15000 * multiplier), baseAtk: Math.floor(400 * multiplier), baseDef: Math.floor(150 * multiplier), expReward: Math.floor(8000 * multiplier), goldReward: { min: Math.floor(4000 * multiplier), max: Math.floor(8000 * multiplier) }, floor: 15, isBoss: true }
  };
}

// ============================================================
// MATERIALS PER TOWER
// ============================================================

export const TOWER_MATERIALS = {
  tower1: [
    { id: 'iron_ore', name: 'Iron Ore', icon: '�ite', dropChance: 0.4, quantity: { min: 1, max: 3 } },
    { id: 'healing_herb', name: 'Healing Herb', icon: '🌿', dropChance: 0.3, quantity: { min: 1, max: 2 } },
    { id: 'bone_fragment', name: 'Bone Fragment', icon: '🦴', dropChance: 0.5, quantity: { min: 1, max: 4 } },
    { id: 'cursed_cloth', name: 'Cursed Cloth', icon: '🧵', dropChance: 0.25, quantity: { min: 1, max: 2 } }
  ],
  tower2: [
    { id: 'steel_ingot', name: 'Steel Ingot', icon: '🔩', dropChance: 0.35, quantity: { min: 1, max: 2 } },
    { id: 'greater_healing_herb', name: 'Greater Healing Herb', icon: '🌱', dropChance: 0.25, quantity: { min: 1, max: 2 } },
    { id: 'sea_scale', name: 'Sea Scale', icon: '🐚', dropChance: 0.4, quantity: { min: 1, max: 3 } },
    { id: 'coral_piece', name: 'Coral Piece', icon: '🪸', dropChance: 0.3, quantity: { min: 1, max: 2 } }
  ],
  tower3: [
    { id: 'mystic_crystal', name: 'Mystic Crystal', icon: '💎', dropChance: 0.3, quantity: { min: 1, max: 2 } },
    { id: 'mana_elixir', name: 'Mana Elixir', icon: '🧪', dropChance: 0.2, quantity: { min: 1, max: 1 } },
    { id: 'fire_essence', name: 'Fire Essence', icon: '🔥', dropChance: 0.35, quantity: { min: 1, max: 2 } },
    { id: 'molten_core', name: 'Molten Core', icon: '🌋', dropChance: 0.15, quantity: { min: 1, max: 1 } }
  ],
  tower4: [
    { id: 'titanium_ingot', name: 'Titanium Ingot', icon: '⚙️', dropChance: 0.25, quantity: { min: 1, max: 2 } },
    { id: 'greater_mana_crystal', name: 'Greater Mana Crystal', icon: '💠', dropChance: 0.2, quantity: { min: 1, max: 1 } },
    { id: 'frost_shard', name: 'Frost Shard', icon: '❄️', dropChance: 0.35, quantity: { min: 1, max: 2 } },
    { id: 'frozen_tear', name: 'Frozen Tear', icon: '💧', dropChance: 0.15, quantity: { min: 1, max: 1 } }
  ],
  tower5: [
    { id: 'elemental_stone', name: 'Elemental Stone', icon: '🪨', dropChance: 0.25, quantity: { min: 1, max: 2 } },
    { id: 'elixir_of_power', name: 'Elixir of Power', icon: '⚡', dropChance: 0.15, quantity: { min: 1, max: 1 } },
    { id: 'shadow_essence', name: 'Shadow Essence', icon: '🌑', dropChance: 0.3, quantity: { min: 1, max: 2 } },
    { id: 'nightmare_dust', name: 'Nightmare Dust', icon: '✨', dropChance: 0.2, quantity: { min: 1, max: 1 } }
  ],
  tower6: [
    { id: 'celestial_crystal', name: 'Celestial Crystal', icon: '⭐', dropChance: 0.2, quantity: { min: 1, max: 1 } },
    { id: 'divine_elixir', name: 'Divine Elixir', icon: '🏺', dropChance: 0.1, quantity: { min: 1, max: 1 } },
    { id: 'angel_feather', name: 'Angel Feather', icon: '🪶', dropChance: 0.25, quantity: { min: 1, max: 2 } },
    { id: 'holy_essence', name: 'Holy Essence', icon: '✝️', dropChance: 0.15, quantity: { min: 1, max: 1 } }
  ],
  tower7: [
    { id: 'astral_gem', name: 'Astral Gem', icon: '💫', dropChance: 0.15, quantity: { min: 1, max: 1 } },
    { id: 'phoenix_feather', name: 'Phoenix Feather', icon: '🔶', dropChance: 0.1, quantity: { min: 1, max: 1 } },
    { id: 'void_essence', name: 'Void Essence', icon: '🕳️', dropChance: 0.2, quantity: { min: 1, max: 1 } },
    { id: 'dimension_shard', name: 'Dimension Shard', icon: '🔮', dropChance: 0.12, quantity: { min: 1, max: 1 } }
  ],
  tower8: [
    { id: 'sunstone', name: 'Sunstone', icon: '☀️', dropChance: 0.12, quantity: { min: 1, max: 1 } },
    { id: 'moonstone', name: 'Moonstone', icon: '🌙', dropChance: 0.12, quantity: { min: 1, max: 1 } },
    { id: 'dragon_scale', name: 'Dragon Scale', icon: '🐲', dropChance: 0.15, quantity: { min: 1, max: 1 } },
    { id: 'dragon_heart', name: 'Dragon Heart', icon: '❤️‍🔥', dropChance: 0.05, quantity: { min: 1, max: 1 } }
  ],
  tower9: [
    { id: 'essence_of_eternity', name: 'Essence of Eternity', icon: '♾️', dropChance: 0.08, quantity: { min: 1, max: 1 } },
    { id: 'time_crystal', name: 'Time Crystal', icon: '⏳', dropChance: 0.1, quantity: { min: 1, max: 1 } },
    { id: 'eternal_flame', name: 'Eternal Flame', icon: '🔱', dropChance: 0.1, quantity: { min: 1, max: 1 } },
    { id: 'ancient_rune', name: 'Ancient Rune', icon: '📜', dropChance: 0.12, quantity: { min: 1, max: 1 } }
  ],
  tower10: [
    { id: 'god_essence', name: 'God Essence', icon: '👼', dropChance: 0.05, quantity: { min: 1, max: 1 } },
    { id: 'primordial_stone', name: 'Primordial Stone', icon: '🌍', dropChance: 0.06, quantity: { min: 1, max: 1 } },
    { id: 'divine_tear', name: 'Divine Tear', icon: '💧', dropChance: 0.08, quantity: { min: 1, max: 1 } },
    { id: 'creation_spark', name: 'Creation Spark', icon: '✴️', dropChance: 0.04, quantity: { min: 1, max: 1 } }
  ]
};

// ============================================================
// DROP RATES BY ENEMY TYPE
// ============================================================

export const DROP_RATES = {
  normal: { equipment: 0.15, setItem: 0.02, potion: 0.30 },
  elite: { equipment: 0.40, setItem: 0.08, scroll: 0.02, potion: 0.50 },
  boss: { equipment: 0.80, setItem: 0.20, rareEquipment: 0.30, scroll: 0.05, memoryCrystal: 0.10 }
};
