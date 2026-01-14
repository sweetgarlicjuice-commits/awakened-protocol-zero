// ============================================================
// EXPANDED GAME DATA - 10 TOWERS
// ============================================================

export const TOWERS_EXPANDED = {
  1: { id: 1, name: "Crimson Spire", theme: "undead", levelRange: { min: 1, max: 15 }, floors: 15, lootTier: ['common', 'rare'], setName: 'Gridz' },
  2: { id: 2, name: "Azure Depths", theme: "aquatic", levelRange: { min: 15, max: 30 }, floors: 15, lootTier: ['rare', 'epic'], setName: 'Tempest', requirement: { tower: 1, cleared: true } },
  3: { id: 3, name: "Volcanic Core", theme: "fire", levelRange: { min: 30, max: 50 }, floors: 15, lootTier: ['epic', 'legendary'], setName: 'Inferno', requirement: { tower: 2, cleared: true } },
  4: { id: 4, name: "Frozen Peak", theme: "ice", levelRange: { min: 50, max: 70 }, floors: 15, lootTier: ['legendary'], setName: 'Glacial', requirement: { tower: 3, cleared: true } },
  5: { id: 5, name: "Shadow Realm", theme: "shadow", levelRange: { min: 70, max: 100 }, floors: 15, lootTier: ['legendary'], setName: 'Nightmare', requirement: { tower: 4, cleared: true } },
  6: { id: 6, name: "Celestial Sanctum", theme: "celestial", levelRange: { min: 100, max: 130 }, floors: 15, lootTier: ['legendary', 'mythical'], setName: 'Celestial', requirement: { tower: 5, cleared: true } },
  7: { id: 7, name: "Abyssal Void", theme: "void", levelRange: { min: 130, max: 160 }, floors: 15, lootTier: ['mythical'], setName: 'Abyssal', requirement: { tower: 6, cleared: true } },
  8: { id: 8, name: "Dragon's Domain", theme: "dragon", levelRange: { min: 160, max: 180 }, floors: 15, lootTier: ['mythical'], setName: 'Dragonborn', requirement: { tower: 7, cleared: true } },
  9: { id: 9, name: "Eternal Citadel", theme: "eternal", levelRange: { min: 180, max: 190 }, floors: 15, lootTier: ['mythical'], setName: 'Eternal', requirement: { tower: 8, cleared: true } },
  10: { id: 10, name: "Throne of Gods", theme: "divine", levelRange: { min: 190, max: 200 }, floors: 15, lootTier: ['mythical'], setName: 'Divine', requirement: { tower: 9, cleared: true } }
};

// ============================================================
// ENEMIES - All 10 Towers
// ============================================================

export const ENEMIES_EXPANDED = {
  tower1: {
    normal: [
      { id: 'skeleton_warrior', name: 'Skeleton Warrior', icon: '💀', baseHp: 50, baseAtk: 8, baseDef: 3, expReward: 15, goldReward: { min: 5, max: 15 } },
      { id: 'zombie', name: 'Rotting Zombie', icon: '🧟', baseHp: 70, baseAtk: 10, baseDef: 2, expReward: 20, goldReward: { min: 8, max: 20 } },
      { id: 'cursed_knight', name: 'Cursed Knight', icon: '⚔️', baseHp: 90, baseAtk: 14, baseDef: 6, expReward: 30, goldReward: { min: 12, max: 30 } },
      { id: 'ghost', name: 'Wandering Ghost', icon: '👻', baseHp: 60, baseAtk: 16, baseDef: 1, expReward: 25, goldReward: { min: 10, max: 25 } },
      { id: 'bone_mage', name: 'Bone Mage', icon: '🦴', baseHp: 55, baseAtk: 18, baseDef: 2, expReward: 35, goldReward: { min: 15, max: 35 } }
    ],
    elite: [
      { id: 'death_knight', name: 'Death Knight', icon: '🖤', baseHp: 200, baseAtk: 25, baseDef: 12, expReward: 100, goldReward: { min: 50, max: 100 }, isElite: true },
      { id: 'lich_apprentice', name: 'Lich Apprentice', icon: '💜', baseHp: 180, baseAtk: 30, baseDef: 8, expReward: 120, goldReward: { min: 60, max: 120 }, isElite: true }
    ],
    boss: { id: 'hollow_king', name: 'The Hollow King', icon: '👑', baseHp: 500, baseAtk: 35, baseDef: 15, expReward: 300, goldReward: { min: 150, max: 300 }, isBoss: true }
  },
  tower2: {
    normal: [
      { id: 'drowned_pirate', name: 'Drowned Pirate', icon: '🏴‍☠️', baseHp: 100, baseAtk: 18, baseDef: 6, expReward: 40, goldReward: { min: 20, max: 40 } },
      { id: 'sea_serpent', name: 'Sea Serpent', icon: '🐍', baseHp: 130, baseAtk: 22, baseDef: 5, expReward: 50, goldReward: { min: 25, max: 50 } },
      { id: 'coral_golem', name: 'Coral Golem', icon: '🪸', baseHp: 180, baseAtk: 20, baseDef: 15, expReward: 60, goldReward: { min: 30, max: 60 } },
      { id: 'siren', name: 'Deadly Siren', icon: '🧜‍♀️', baseHp: 110, baseAtk: 28, baseDef: 4, expReward: 55, goldReward: { min: 28, max: 55 } },
      { id: 'deep_one', name: 'Deep One', icon: '🦑', baseHp: 150, baseAtk: 30, baseDef: 10, expReward: 70, goldReward: { min: 35, max: 70 } }
    ],
    elite: [
      { id: 'kraken_spawn', name: 'Kraken Spawn', icon: '🐙', baseHp: 400, baseAtk: 45, baseDef: 18, expReward: 200, goldReward: { min: 100, max: 200 }, isElite: true },
      { id: 'abyssal_lord', name: 'Abyssal Lord', icon: '🌊', baseHp: 350, baseAtk: 50, baseDef: 15, expReward: 220, goldReward: { min: 110, max: 220 }, isElite: true }
    ],
    boss: { id: 'leviathan_herald', name: "Leviathan's Herald", icon: '🐋', baseHp: 1000, baseAtk: 60, baseDef: 25, expReward: 600, goldReward: { min: 300, max: 600 }, isBoss: true }
  },
  tower3: {
    normal: [
      { id: 'fire_imp', name: 'Fire Imp', icon: '🔥', baseHp: 200, baseAtk: 35, baseDef: 10, expReward: 80, goldReward: { min: 40, max: 80 } },
      { id: 'lava_golem', name: 'Lava Golem', icon: '🪨', baseHp: 350, baseAtk: 40, baseDef: 25, expReward: 100, goldReward: { min: 50, max: 100 } },
      { id: 'flame_wraith', name: 'Flame Wraith', icon: '👤', baseHp: 250, baseAtk: 50, baseDef: 8, expReward: 110, goldReward: { min: 55, max: 110 } },
      { id: 'magma_serpent', name: 'Magma Serpent', icon: '🐉', baseHp: 300, baseAtk: 55, baseDef: 15, expReward: 130, goldReward: { min: 65, max: 130 } },
      { id: 'ember_mage', name: 'Ember Mage', icon: '🧙', baseHp: 220, baseAtk: 65, baseDef: 10, expReward: 140, goldReward: { min: 70, max: 140 } }
    ],
    elite: [
      { id: 'infernal_knight', name: 'Infernal Knight', icon: '🔶', baseHp: 800, baseAtk: 80, baseDef: 35, expReward: 400, goldReward: { min: 200, max: 400 }, isElite: true },
      { id: 'phoenix_guardian', name: 'Phoenix Guardian', icon: '🦅', baseHp: 700, baseAtk: 90, baseDef: 30, expReward: 450, goldReward: { min: 225, max: 450 }, isElite: true }
    ],
    boss: { id: 'molten_king', name: 'Molten King', icon: '👑', baseHp: 2000, baseAtk: 100, baseDef: 45, expReward: 1200, goldReward: { min: 600, max: 1200 }, isBoss: true }
  },
  tower4: {
    normal: [
      { id: 'frost_sprite', name: 'Frost Sprite', icon: '❄️', baseHp: 400, baseAtk: 60, baseDef: 20, expReward: 150, goldReward: { min: 75, max: 150 } },
      { id: 'ice_golem', name: 'Ice Golem', icon: '🧊', baseHp: 600, baseAtk: 65, baseDef: 40, expReward: 180, goldReward: { min: 90, max: 180 } },
      { id: 'frozen_knight', name: 'Frozen Knight', icon: '🥶', baseHp: 500, baseAtk: 80, baseDef: 30, expReward: 200, goldReward: { min: 100, max: 200 } },
      { id: 'blizzard_wolf', name: 'Blizzard Wolf', icon: '🐺', baseHp: 450, baseAtk: 90, baseDef: 25, expReward: 220, goldReward: { min: 110, max: 220 } },
      { id: 'ice_witch', name: 'Ice Witch', icon: '🧙‍♀️', baseHp: 380, baseAtk: 100, baseDef: 20, expReward: 250, goldReward: { min: 125, max: 250 } }
    ],
    elite: [
      { id: 'frost_giant', name: 'Frost Giant', icon: '🗿', baseHp: 1500, baseAtk: 130, baseDef: 60, expReward: 700, goldReward: { min: 350, max: 700 }, isElite: true },
      { id: 'avalanche_lord', name: 'Avalanche Lord', icon: '⛰️', baseHp: 1400, baseAtk: 140, baseDef: 55, expReward: 750, goldReward: { min: 375, max: 750 }, isElite: true }
    ],
    boss: { id: 'ice_emperor', name: 'Ice Emperor', icon: '👑', baseHp: 4000, baseAtk: 160, baseDef: 70, expReward: 2000, goldReward: { min: 1000, max: 2000 }, isBoss: true }
  },
  tower5: {
    normal: [
      { id: 'shadow_stalker', name: 'Shadow Stalker', icon: '🌑', baseHp: 700, baseAtk: 100, baseDef: 30, expReward: 280, goldReward: { min: 140, max: 280 } },
      { id: 'nightmare_hound', name: 'Nightmare Hound', icon: '🐕', baseHp: 800, baseAtk: 110, baseDef: 35, expReward: 320, goldReward: { min: 160, max: 320 } },
      { id: 'void_walker', name: 'Void Walker', icon: '👁️', baseHp: 750, baseAtk: 130, baseDef: 40, expReward: 360, goldReward: { min: 180, max: 360 } },
      { id: 'dark_seraph', name: 'Dark Seraph', icon: '😈', baseHp: 850, baseAtk: 140, baseDef: 45, expReward: 400, goldReward: { min: 200, max: 400 } },
      { id: 'nightmare_mage', name: 'Nightmare Mage', icon: '🧙‍♂️', baseHp: 650, baseAtk: 160, baseDef: 35, expReward: 450, goldReward: { min: 225, max: 450 } }
    ],
    elite: [
      { id: 'shadow_lord', name: 'Shadow Lord', icon: '🦇', baseHp: 2500, baseAtk: 200, baseDef: 80, expReward: 1200, goldReward: { min: 600, max: 1200 }, isElite: true },
      { id: 'nightmare_king', name: 'Nightmare King', icon: '💀', baseHp: 2300, baseAtk: 220, baseDef: 75, expReward: 1300, goldReward: { min: 650, max: 1300 }, isElite: true }
    ],
    boss: { id: 'void_emperor', name: 'Void Emperor', icon: '👁️‍🗨️', baseHp: 8000, baseAtk: 250, baseDef: 100, expReward: 4000, goldReward: { min: 2000, max: 4000 }, isBoss: true }
  },
  tower6: {
    normal: [
      { id: 'celestial_soldier', name: 'Celestial Soldier', icon: '⭐', baseHp: 1200, baseAtk: 180, baseDef: 60, expReward: 550, goldReward: { min: 275, max: 550 } },
      { id: 'light_guardian', name: 'Light Guardian', icon: '🛡️', baseHp: 1500, baseAtk: 170, baseDef: 80, expReward: 600, goldReward: { min: 300, max: 600 } },
      { id: 'angel_warrior', name: 'Angel Warrior', icon: '👼', baseHp: 1100, baseAtk: 200, baseDef: 55, expReward: 650, goldReward: { min: 325, max: 650 } },
      { id: 'holy_archer', name: 'Holy Archer', icon: '🏹', baseHp: 1000, baseAtk: 220, baseDef: 45, expReward: 700, goldReward: { min: 350, max: 700 } },
      { id: 'divine_mage', name: 'Divine Mage', icon: '✨', baseHp: 950, baseAtk: 250, baseDef: 40, expReward: 750, goldReward: { min: 375, max: 750 } }
    ],
    elite: [
      { id: 'seraph_commander', name: 'Seraph Commander', icon: '🌟', baseHp: 4000, baseAtk: 300, baseDef: 120, expReward: 2000, goldReward: { min: 1000, max: 2000 }, isElite: true },
      { id: 'celestial_judge', name: 'Celestial Judge', icon: '⚖️', baseHp: 3800, baseAtk: 320, baseDef: 110, expReward: 2200, goldReward: { min: 1100, max: 2200 }, isElite: true }
    ],
    boss: { id: 'archangel', name: 'The Archangel', icon: '👼', baseHp: 15000, baseAtk: 380, baseDef: 150, expReward: 6000, goldReward: { min: 3000, max: 6000 }, isBoss: true }
  },
  tower7: {
    normal: [
      { id: 'void_spawn', name: 'Void Spawn', icon: '🕳️', baseHp: 2000, baseAtk: 280, baseDef: 90, expReward: 900, goldReward: { min: 450, max: 900 } },
      { id: 'abyssal_fiend', name: 'Abyssal Fiend', icon: '👿', baseHp: 2200, baseAtk: 300, baseDef: 85, expReward: 1000, goldReward: { min: 500, max: 1000 } },
      { id: 'dimension_horror', name: 'Dimension Horror', icon: '👾', baseHp: 1900, baseAtk: 330, baseDef: 80, expReward: 1100, goldReward: { min: 550, max: 1100 } },
      { id: 'void_knight', name: 'Void Knight', icon: '🗡️', baseHp: 2500, baseAtk: 310, baseDef: 100, expReward: 1200, goldReward: { min: 600, max: 1200 } },
      { id: 'entropy_mage', name: 'Entropy Mage', icon: '🔮', baseHp: 1800, baseAtk: 380, baseDef: 70, expReward: 1300, goldReward: { min: 650, max: 1300 } }
    ],
    elite: [
      { id: 'void_titan', name: 'Void Titan', icon: '🌑', baseHp: 6500, baseAtk: 450, baseDef: 160, expReward: 3500, goldReward: { min: 1750, max: 3500 }, isElite: true },
      { id: 'abyssal_overlord', name: 'Abyssal Overlord', icon: '😈', baseHp: 6000, baseAtk: 480, baseDef: 150, expReward: 3800, goldReward: { min: 1900, max: 3800 }, isElite: true }
    ],
    boss: { id: 'void_god', name: 'The Void God', icon: '🕳️', baseHp: 25000, baseAtk: 550, baseDef: 200, expReward: 10000, goldReward: { min: 5000, max: 10000 }, isBoss: true }
  },
  tower8: {
    normal: [
      { id: 'drake', name: 'Drake', icon: '🐲', baseHp: 3500, baseAtk: 400, baseDef: 130, expReward: 1600, goldReward: { min: 800, max: 1600 } },
      { id: 'wyvern', name: 'Wyvern', icon: '🦎', baseHp: 3200, baseAtk: 450, baseDef: 120, expReward: 1800, goldReward: { min: 900, max: 1800 } },
      { id: 'dragon_knight', name: 'Dragon Knight', icon: '⚔️', baseHp: 4000, baseAtk: 420, baseDef: 150, expReward: 2000, goldReward: { min: 1000, max: 2000 } },
      { id: 'fire_drake', name: 'Fire Drake', icon: '🔥', baseHp: 3000, baseAtk: 500, baseDef: 110, expReward: 2200, goldReward: { min: 1100, max: 2200 } },
      { id: 'dragon_mage', name: 'Dragon Mage', icon: '🧙', baseHp: 2800, baseAtk: 550, baseDef: 100, expReward: 2400, goldReward: { min: 1200, max: 2400 } }
    ],
    elite: [
      { id: 'elder_dragon', name: 'Elder Dragon', icon: '🐉', baseHp: 10000, baseAtk: 650, baseDef: 220, expReward: 5500, goldReward: { min: 2750, max: 5500 }, isElite: true },
      { id: 'dragon_lord', name: 'Dragon Lord', icon: '👑', baseHp: 9500, baseAtk: 680, baseDef: 210, expReward: 5800, goldReward: { min: 2900, max: 5800 }, isElite: true }
    ],
    boss: { id: 'ancient_dragon', name: 'Ancient Dragon', icon: '🐲', baseHp: 40000, baseAtk: 800, baseDef: 280, expReward: 15000, goldReward: { min: 7500, max: 15000 }, isBoss: true }
  },
  tower9: {
    normal: [
      { id: 'eternal_guardian', name: 'Eternal Guardian', icon: '🗿', baseHp: 5500, baseAtk: 600, baseDef: 200, expReward: 3000, goldReward: { min: 1500, max: 3000 } },
      { id: 'time_warden', name: 'Time Warden', icon: '⏳', baseHp: 5000, baseAtk: 650, baseDef: 180, expReward: 3300, goldReward: { min: 1650, max: 3300 } },
      { id: 'ancient_sentinel', name: 'Ancient Sentinel', icon: '🛡️', baseHp: 6000, baseAtk: 580, baseDef: 250, expReward: 3500, goldReward: { min: 1750, max: 3500 } },
      { id: 'eternal_warrior', name: 'Eternal Warrior', icon: '⚔️', baseHp: 5200, baseAtk: 700, baseDef: 190, expReward: 3800, goldReward: { min: 1900, max: 3800 } },
      { id: 'chrono_mage', name: 'Chrono Mage', icon: '🔮', baseHp: 4500, baseAtk: 780, baseDef: 160, expReward: 4000, goldReward: { min: 2000, max: 4000 } }
    ],
    elite: [
      { id: 'eternal_champion', name: 'Eternal Champion', icon: '🏆', baseHp: 15000, baseAtk: 900, baseDef: 300, expReward: 8000, goldReward: { min: 4000, max: 8000 }, isElite: true },
      { id: 'time_lord', name: 'Time Lord', icon: '⏰', baseHp: 14000, baseAtk: 950, baseDef: 280, expReward: 8500, goldReward: { min: 4250, max: 8500 }, isElite: true }
    ],
    boss: { id: 'eternal_king', name: 'The Eternal King', icon: '👑', baseHp: 60000, baseAtk: 1100, baseDef: 350, expReward: 22000, goldReward: { min: 11000, max: 22000 }, isBoss: true }
  },
  tower10: {
    normal: [
      { id: 'divine_soldier', name: 'Divine Soldier', icon: '⚡', baseHp: 8000, baseAtk: 850, baseDef: 280, expReward: 5000, goldReward: { min: 2500, max: 5000 } },
      { id: 'god_knight', name: 'God Knight', icon: '🗡️', baseHp: 9000, baseAtk: 900, baseDef: 300, expReward: 5500, goldReward: { min: 2750, max: 5500 } },
      { id: 'celestial_titan', name: 'Celestial Titan', icon: '🗿', baseHp: 10000, baseAtk: 880, baseDef: 350, expReward: 6000, goldReward: { min: 3000, max: 6000 } },
      { id: 'divine_archer', name: 'Divine Archer', icon: '🏹', baseHp: 7500, baseAtk: 1000, baseDef: 250, expReward: 6500, goldReward: { min: 3250, max: 6500 } },
      { id: 'god_mage', name: 'God Mage', icon: '✨', baseHp: 7000, baseAtk: 1100, baseDef: 230, expReward: 7000, goldReward: { min: 3500, max: 7000 } }
    ],
    elite: [
      { id: 'divine_champion', name: 'Divine Champion', icon: '🌟', baseHp: 25000, baseAtk: 1300, baseDef: 400, expReward: 12000, goldReward: { min: 6000, max: 12000 }, isElite: true },
      { id: 'god_general', name: 'God General', icon: '⚔️', baseHp: 24000, baseAtk: 1350, baseDef: 380, expReward: 13000, goldReward: { min: 6500, max: 13000 }, isElite: true }
    ],
    boss: { id: 'god_king', name: 'The God King', icon: '👑', baseHp: 100000, baseAtk: 1500, baseDef: 450, expReward: 35000, goldReward: { min: 17500, max: 35000 }, isBoss: true }
  }
};

// ============================================================
// MATERIALS PER TOWER
// ============================================================

export const MATERIALS_BY_TOWER = {
  tower1: [
    { id: 'bone_fragment', name: 'Bone Fragment', icon: '🦴', dropChance: 0.5, quantity: { min: 1, max: 3 }, sellPrice: 5 },
    { id: 'cursed_cloth', name: 'Cursed Cloth', icon: '🧵', dropChance: 0.35, quantity: { min: 1, max: 2 }, sellPrice: 8 },
    { id: 'ghost_essence', name: 'Ghost Essence', icon: '👻', dropChance: 0.25, quantity: { min: 1, max: 2 }, sellPrice: 12 },
    { id: 'iron_ore', name: 'Iron Ore', icon: '�ite', dropChance: 0.4, quantity: { min: 1, max: 3 }, sellPrice: 6 }
  ],
  tower2: [
    { id: 'sea_scale', name: 'Sea Scale', icon: '🐚', dropChance: 0.45, quantity: { min: 1, max: 3 }, sellPrice: 10 },
    { id: 'coral_piece', name: 'Coral Piece', icon: '🪸', dropChance: 0.35, quantity: { min: 1, max: 2 }, sellPrice: 15 },
    { id: 'siren_tear', name: 'Siren Tear', icon: '💧', dropChance: 0.2, quantity: { min: 1, max: 1 }, sellPrice: 25 },
    { id: 'steel_ingot', name: 'Steel Ingot', icon: '🔩', dropChance: 0.3, quantity: { min: 1, max: 2 }, sellPrice: 18 }
  ],
  tower3: [
    { id: 'fire_essence', name: 'Fire Essence', icon: '🔥', dropChance: 0.4, quantity: { min: 1, max: 2 }, sellPrice: 20 },
    { id: 'molten_core', name: 'Molten Core', icon: '🌋', dropChance: 0.2, quantity: { min: 1, max: 1 }, sellPrice: 40 },
    { id: 'ember_dust', name: 'Ember Dust', icon: '✨', dropChance: 0.35, quantity: { min: 1, max: 3 }, sellPrice: 18 },
    { id: 'mystic_crystal', name: 'Mystic Crystal', icon: '💎', dropChance: 0.25, quantity: { min: 1, max: 1 }, sellPrice: 35 }
  ],
  tower4: [
    { id: 'frost_shard', name: 'Frost Shard', icon: '❄️', dropChance: 0.4, quantity: { min: 1, max: 2 }, sellPrice: 30 },
    { id: 'frozen_tear', name: 'Frozen Tear', icon: '💧', dropChance: 0.2, quantity: { min: 1, max: 1 }, sellPrice: 55 },
    { id: 'ice_crystal', name: 'Ice Crystal', icon: '🧊', dropChance: 0.3, quantity: { min: 1, max: 2 }, sellPrice: 28 },
    { id: 'titanium_ingot', name: 'Titanium Ingot', icon: '⚙️', dropChance: 0.2, quantity: { min: 1, max: 1 }, sellPrice: 50 }
  ],
  tower5: [
    { id: 'shadow_essence', name: 'Shadow Essence', icon: '🌑', dropChance: 0.35, quantity: { min: 1, max: 2 }, sellPrice: 45 },
    { id: 'nightmare_dust', name: 'Nightmare Dust', icon: '💀', dropChance: 0.25, quantity: { min: 1, max: 1 }, sellPrice: 65 },
    { id: 'void_shard', name: 'Void Shard', icon: '🕳️', dropChance: 0.2, quantity: { min: 1, max: 1 }, sellPrice: 80 },
    { id: 'elemental_stone', name: 'Elemental Stone', icon: '🪨', dropChance: 0.25, quantity: { min: 1, max: 2 }, sellPrice: 55 }
  ],
  tower6: [
    { id: 'celestial_crystal', name: 'Celestial Crystal', icon: '⭐', dropChance: 0.25, quantity: { min: 1, max: 1 }, sellPrice: 100 },
    { id: 'angel_feather', name: 'Angel Feather', icon: '🪶', dropChance: 0.3, quantity: { min: 1, max: 2 }, sellPrice: 75 },
    { id: 'holy_essence', name: 'Holy Essence', icon: '✝️', dropChance: 0.2, quantity: { min: 1, max: 1 }, sellPrice: 120 },
    { id: 'divine_elixir', name: 'Divine Elixir', icon: '🏺', dropChance: 0.15, quantity: { min: 1, max: 1 }, sellPrice: 150 }
  ],
  tower7: [
    { id: 'void_essence', name: 'Void Essence', icon: '🌌', dropChance: 0.25, quantity: { min: 1, max: 1 }, sellPrice: 150 },
    { id: 'dimension_shard', name: 'Dimension Shard', icon: '🔮', dropChance: 0.2, quantity: { min: 1, max: 1 }, sellPrice: 180 },
    { id: 'astral_gem', name: 'Astral Gem', icon: '💫', dropChance: 0.15, quantity: { min: 1, max: 1 }, sellPrice: 220 },
    { id: 'phoenix_feather', name: 'Phoenix Feather', icon: '🔶', dropChance: 0.1, quantity: { min: 1, max: 1 }, sellPrice: 300 }
  ],
  tower8: [
    { id: 'dragon_scale', name: 'Dragon Scale', icon: '🐲', dropChance: 0.2, quantity: { min: 1, max: 1 }, sellPrice: 250 },
    { id: 'dragon_heart', name: 'Dragon Heart', icon: '❤️‍🔥', dropChance: 0.08, quantity: { min: 1, max: 1 }, sellPrice: 500 },
    { id: 'sunstone', name: 'Sunstone', icon: '☀️', dropChance: 0.15, quantity: { min: 1, max: 1 }, sellPrice: 350 },
    { id: 'moonstone', name: 'Moonstone', icon: '🌙', dropChance: 0.15, quantity: { min: 1, max: 1 }, sellPrice: 350 }
  },
  tower9: [
    { id: 'essence_of_eternity', name: 'Essence of Eternity', icon: '♾️', dropChance: 0.1, quantity: { min: 1, max: 1 }, sellPrice: 600 },
    { id: 'time_crystal', name: 'Time Crystal', icon: '⏳', dropChance: 0.12, quantity: { min: 1, max: 1 }, sellPrice: 500 },
    { id: 'eternal_flame', name: 'Eternal Flame', icon: '🔱', dropChance: 0.12, quantity: { min: 1, max: 1 }, sellPrice: 550 },
    { id: 'ancient_rune', name: 'Ancient Rune', icon: '📜', dropChance: 0.15, quantity: { min: 1, max: 1 }, sellPrice: 450 }
  ],
  tower10: [
    { id: 'god_essence', name: 'God Essence', icon: '👼', dropChance: 0.06, quantity: { min: 1, max: 1 }, sellPrice: 1000 },
    { id: 'primordial_stone', name: 'Primordial Stone', icon: '🌍', dropChance: 0.08, quantity: { min: 1, max: 1 }, sellPrice: 800 },
    { id: 'divine_tear', name: 'Divine Tear', icon: '💧', dropChance: 0.1, quantity: { min: 1, max: 1 }, sellPrice: 700 },
    { id: 'creation_spark', name: 'Creation Spark', icon: '✴️', dropChance: 0.05, quantity: { min: 1, max: 1 }, sellPrice: 1200 }
  ]
};

// ============================================================
// STORY EVENTS FOR TOWERS 3-10
// ============================================================

export const STORY_EVENTS_EXPANDED = {
  tower3: {
    entrance: ['The heat hits you like a wall as you enter the Volcanic Core.', 'Molten lava flows through the caverns ahead.'],
    exploration: ['Embers float through the scorching air.', 'The ground trembles with volcanic activity.', 'You feel the intense heat radiating from the walls.'],
    paths: [
      { description: 'The path splits at a river of lava.', choices: ['Jump across the lava stones', 'Take the longer cooled path', 'Search for hidden passage'] },
      { description: 'An ancient fire shrine blocks your way.', choices: ['Pray at the shrine', 'Ignore it and proceed', 'Examine the inscriptions'] }
    ],
    victory: ['The flames of {enemy} are extinguished!', '{enemy} crumbles into cooling embers!'],
    rest_prompt: ['The heat is exhausting. Perhaps rest at a cool spot?']
  },
  tower4: {
    entrance: ['Bitter cold bites at your skin as you enter Frozen Peak.', 'Ice crystals cover every surface.'],
    exploration: ['Your breath forms clouds in the frigid air.', 'Icicles hang from the ceiling like daggers.', 'The cold seeps into your bones.'],
    paths: [
      { description: 'A frozen lake blocks your path.', choices: ['Walk carefully across the ice', 'Find a way around', 'Break through the ice'] },
      { description: 'An ice wall blocks the passage.', choices: ['Melt through with fire', 'Climb over it', 'Search for cracks'] }
    ],
    victory: ['The ice that was {enemy} shatters!', '{enemy} freezes solid and crumbles!'],
    rest_prompt: ['The cold is draining. Find warmth to rest?']
  },
  tower5: {
    entrance: ['Darkness consumes all light as you enter the Shadow Realm.', 'Your own shadow seems to writhe with malice.'],
    exploration: ['Whispers echo from the darkness.', 'Shadows move at the edge of your vision.', 'The darkness feels alive and hungry.'],
    paths: [
      { description: 'Multiple shadow paths appear before you.', choices: ['Follow the faint light', 'Trust your instincts in darkness', 'Mark your path and explore'] },
      { description: 'A nightmare manifestation offers guidance.', choices: ['Accept its help', 'Refuse and fight', 'Ignore and proceed'] }
    ],
    victory: ['{enemy} dissolves into shadow!', 'The nightmare of {enemy} ends!'],
    rest_prompt: ['Even the darkness needs rest. Find a sanctuary?']
  },
  tower6: {
    entrance: ['Radiant light blinds you as you enter the Celestial Sanctum.', 'Divine architecture stretches endlessly upward.'],
    exploration: ['Holy light permeates every corner.', 'Angelic hymns echo in the distance.', 'The air feels pure and sacred.'],
    paths: [
      { description: 'A celestial guardian bars your path.', choices: ['Prove your worth in combat', 'Request peaceful passage', 'Seek an alternate route'] },
      { description: 'A divine trial awaits.', choices: ['Accept the trial', 'Refuse the trial', 'Negotiate terms'] }
    ],
    victory: ['{enemy} ascends in holy light!', 'The celestial {enemy} is vanquished!'],
    rest_prompt: ['Even in heaven, warriors rest. Pray at the shrine?']
  },
  tower7: {
    entrance: ['Reality itself seems to bend as you enter the Abyssal Void.', 'There is no up, no down, only void.'],
    exploration: ['Space and time have no meaning here.', 'Impossible geometry surrounds you.', 'The void whispers forgotten truths.'],
    paths: [
      { description: 'Multiple dimensions intersect here.', choices: ['Enter the closest rift', 'Navigate by instinct', 'Anchor yourself and proceed'] },
      { description: 'A void entity offers a shortcut.', choices: ['Accept', 'Decline', 'Question its motives'] }
    ],
    victory: ['{enemy} is consumed by the void!', '{enemy} ceases to exist!'],
    rest_prompt: ['Find a stable pocket of reality to rest?']
  },
  tower8: {
    entrance: ['The ancient power of dragons fills the air as you enter the Domain.', 'Massive claw marks scar the walls.'],
    exploration: ['Dragon roars echo in the distance.', 'Treasures and bones litter the floor.', 'The scent of smoke and sulfur fills your lungs.'],
    paths: [
      { description: 'A dragon nest blocks your path.', choices: ['Sneak past quietly', 'Face the guardian', 'Seek another route'] },
      { description: 'An ancient dragon offers a challenge.', choices: ['Accept the challenge', 'Decline respectfully', 'Demand passage'] }
    ],
    victory: ['{enemy} falls with a thunderous crash!', 'The mighty {enemy} is slain!'],
    rest_prompt: ['Rest in the dragon hoard?']
  },
  tower9: {
    entrance: ['Ancient power beyond comprehension fills the Eternal Citadel.', 'Time flows differently here.'],
    exploration: ['Echoes of past and future blend together.', 'The citadel has stood for eternity.', 'Reality is malleable in this place.'],
    paths: [
      { description: 'Time loops block your progress.', choices: ['Break the loop', 'Navigate through it', 'Wait for the right moment'] },
      { description: 'An eternal guardian tests you.', choices: ['Prove your worth', 'Challenge its authority', 'Seek wisdom instead'] }
    ],
    victory: ['{enemy} fades into eternity!', 'The eternal {enemy} falls!'],
    rest_prompt: ['Rest in a moment frozen in time?']
  },
  tower10: {
    entrance: ['Divine power overwhelms your senses at the Throne of Gods.', 'You stand at the pinnacle of creation.'],
    exploration: ['The presence of gods is palpable.', 'Reality bends to divine will.', 'You are but mortal in a realm of gods.'],
    paths: [
      { description: 'A divine gate bars your path.', choices: ['Prove your divine right', 'Force your way', 'Seek divine blessing'] },
      { description: 'The God King himself appears.', choices: ['Challenge him', 'Kneel before him', 'Demand answers'] }
    ],
    victory: ['{enemy} falls before mortal might!', 'Even gods fall to your blade!'],
    rest_prompt: ['Rest in the halls of divinity?']
  }
};

// ============================================================
// FLOOR REQUIREMENTS FOR TOWERS 3-10
// ============================================================

export const FLOOR_REQUIREMENTS_EXPANDED = {
  tower3: {
    3: { items: [{ id: 'fire_essence', name: 'Fire Essence', quantity: 3 }], gold: 200 },
    6: { items: [{ id: 'ember_dust', name: 'Ember Dust', quantity: 5 }, { id: 'fire_essence', name: 'Fire Essence', quantity: 3 }], gold: 400 },
    9: { items: [{ id: 'molten_core', name: 'Molten Core', quantity: 2 }, { id: 'mystic_crystal', name: 'Mystic Crystal', quantity: 3 }], gold: 800 },
    12: { items: [{ id: 'molten_core', name: 'Molten Core', quantity: 4 }, { id: 'fire_essence', name: 'Fire Essence', quantity: 8 }], gold: 1500 },
    14: { items: [{ id: 'molten_core', name: 'Molten Core', quantity: 6 }, { id: 'mystic_crystal', name: 'Mystic Crystal', quantity: 5 }], gold: 3000 }
  },
  tower4: {
    3: { items: [{ id: 'frost_shard', name: 'Frost Shard', quantity: 3 }], gold: 400 },
    6: { items: [{ id: 'ice_crystal', name: 'Ice Crystal', quantity: 5 }, { id: 'frost_shard', name: 'Frost Shard', quantity: 4 }], gold: 800 },
    9: { items: [{ id: 'frozen_tear', name: 'Frozen Tear', quantity: 2 }, { id: 'titanium_ingot', name: 'Titanium Ingot', quantity: 3 }], gold: 1600 },
    12: { items: [{ id: 'frozen_tear', name: 'Frozen Tear', quantity: 4 }, { id: 'frost_shard', name: 'Frost Shard', quantity: 10 }], gold: 3000 },
    14: { items: [{ id: 'frozen_tear', name: 'Frozen Tear', quantity: 6 }, { id: 'titanium_ingot', name: 'Titanium Ingot', quantity: 6 }], gold: 6000 }
  },
  tower5: {
    3: { items: [{ id: 'shadow_essence', name: 'Shadow Essence', quantity: 3 }], gold: 800 },
    6: { items: [{ id: 'nightmare_dust', name: 'Nightmare Dust', quantity: 3 }, { id: 'shadow_essence', name: 'Shadow Essence', quantity: 5 }], gold: 1500 },
    9: { items: [{ id: 'void_shard', name: 'Void Shard', quantity: 2 }, { id: 'elemental_stone', name: 'Elemental Stone', quantity: 4 }], gold: 3000 },
    12: { items: [{ id: 'void_shard', name: 'Void Shard', quantity: 4 }, { id: 'nightmare_dust', name: 'Nightmare Dust', quantity: 6 }], gold: 6000 },
    14: { items: [{ id: 'void_shard', name: 'Void Shard', quantity: 6 }, { id: 'elemental_stone', name: 'Elemental Stone', quantity: 8 }], gold: 12000 }
  }
};

// Generate floor requirements for towers 6-10
for (let t = 6; t <= 10; t++) {
  const mult = Math.pow(2, t - 5);
  FLOOR_REQUIREMENTS_EXPANDED['tower' + t] = {
    3: { items: [], gold: Math.floor(1500 * mult) },
    6: { items: [], gold: Math.floor(3000 * mult) },
    9: { items: [], gold: Math.floor(6000 * mult) },
    12: { items: [], gold: Math.floor(12000 * mult) },
    14: { items: [], gold: Math.floor(25000 * mult) }
  };
}
