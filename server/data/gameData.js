// Tower Configuration
export const TOWERS = {
  1: {
    id: 1,
    name: "Crimson Spire",
    description: "Ancient ruins filled with undead creatures",
    theme: "undead",
    levelRange: { min: 1, max: 10 },
    floors: 15,
    background: "crimson"
  },
  2: {
    id: 2,
    name: "Azure Depths",
    description: "Underwater caverns with aquatic monsters",
    theme: "aquatic",
    levelRange: { min: 10, max: 20 },
    floors: 15,
    background: "azure",
    requirement: { tower: 1, cleared: true }
  }
};

// Enemy Configuration
export const ENEMIES = {
  // Tower 1: Crimson Spire
  tower1: {
    normal: [
      {
        id: "skeleton_warrior",
        name: "Skeleton Warrior",
        icon: "💀",
        baseHp: 50,
        baseAtk: 8,
        baseDef: 3,
        expReward: 15,
        goldReward: { min: 5, max: 15 },
        floors: [1, 2, 3, 4]
      },
      {
        id: "zombie",
        name: "Rotting Zombie",
        icon: "🧟",
        baseHp: 70,
        baseAtk: 10,
        baseDef: 2,
        expReward: 20,
        goldReward: { min: 8, max: 20 },
        floors: [2, 3, 4, 5]
      },
      {
        id: "cursed_knight",
        name: "Cursed Knight",
        icon: "⚔️",
        baseHp: 90,
        baseAtk: 14,
        baseDef: 6,
        expReward: 30,
        goldReward: { min: 12, max: 30 },
        floors: [5, 6, 7, 8, 9]
      },
      {
        id: "ghost",
        name: "Wandering Ghost",
        icon: "👻",
        baseHp: 60,
        baseAtk: 16,
        baseDef: 1,
        expReward: 25,
        goldReward: { min: 10, max: 25 },
        floors: [6, 7, 8, 9]
      },
      {
        id: "bone_mage",
        name: "Bone Mage",
        icon: "🦴",
        baseHp: 55,
        baseAtk: 18,
        baseDef: 2,
        expReward: 35,
        goldReward: { min: 15, max: 35 },
        floors: [8, 9, 11, 12]
      }
    ],
    elite: [
      {
        id: "death_knight",
        name: "Death Knight",
        icon: "🖤",
        baseHp: 200,
        baseAtk: 25,
        baseDef: 12,
        expReward: 100,
        goldReward: { min: 50, max: 100 },
        floors: [13, 14],
        isElite: true,
        scrollDropChance: 0.02 // 2% chance
      },
      {
        id: "lich_apprentice",
        name: "Lich Apprentice",
        icon: "💜",
        baseHp: 180,
        baseAtk: 30,
        baseDef: 8,
        expReward: 120,
        goldReward: { min: 60, max: 120 },
        floors: [13, 14],
        isElite: true,
        scrollDropChance: 0.02
      }
    ],
    boss: {
      id: "hollow_king",
      name: "The Hollow King",
      icon: "👑",
      baseHp: 500,
      baseAtk: 35,
      baseDef: 15,
      expReward: 300,
      goldReward: { min: 150, max: 300 },
      floor: 15,
      isBoss: true,
      scrollDropChance: 0.05, // 5% chance
      skills: ["dark_slash", "summon_minions", "death_grip"]
    }
  },
  
  // Tower 2: Azure Depths
  tower2: {
    normal: [
      {
        id: "drowned_pirate",
        name: "Drowned Pirate",
        icon: "🏴‍☠️",
        baseHp: 100,
        baseAtk: 18,
        baseDef: 6,
        expReward: 40,
        goldReward: { min: 20, max: 40 },
        floors: [1, 2, 3, 4]
      },
      {
        id: "sea_serpent",
        name: "Sea Serpent",
        icon: "🐍",
        baseHp: 130,
        baseAtk: 22,
        baseDef: 5,
        expReward: 50,
        goldReward: { min: 25, max: 50 },
        floors: [3, 4, 5, 6]
      },
      {
        id: "coral_golem",
        name: "Coral Golem",
        icon: "🪸",
        baseHp: 180,
        baseAtk: 20,
        baseDef: 15,
        expReward: 60,
        goldReward: { min: 30, max: 60 },
        floors: [5, 6, 7, 8, 9]
      },
      {
        id: "siren",
        name: "Deadly Siren",
        icon: "🧜‍♀️",
        baseHp: 110,
        baseAtk: 28,
        baseDef: 4,
        expReward: 55,
        goldReward: { min: 28, max: 55 },
        floors: [7, 8, 9]
      },
      {
        id: "deep_one",
        name: "Deep One",
        icon: "🦑",
        baseHp: 150,
        baseAtk: 30,
        baseDef: 10,
        expReward: 70,
        goldReward: { min: 35, max: 70 },
        floors: [8, 9, 11, 12]
      }
    ],
    elite: [
      {
        id: "kraken_spawn",
        name: "Kraken Spawn",
        icon: "🐙",
        baseHp: 400,
        baseAtk: 45,
        baseDef: 18,
        expReward: 200,
        goldReward: { min: 100, max: 200 },
        floors: [13, 14],
        isElite: true,
        scrollDropChance: 0.02
      },
      {
        id: "abyssal_lord",
        name: "Abyssal Lord",
        icon: "🌊",
        baseHp: 350,
        baseAtk: 50,
        baseDef: 15,
        expReward: 220,
        goldReward: { min: 110, max: 220 },
        floors: [13, 14],
        isElite: true,
        scrollDropChance: 0.02
      }
    ],
    boss: {
      id: "leviathan_herald",
      name: "Leviathan's Herald",
      icon: "🐋",
      baseHp: 1000,
      baseAtk: 60,
      baseDef: 25,
      expReward: 600,
      goldReward: { min: 300, max: 600 },
      floor: 15,
      isBoss: true,
      scrollDropChance: 0.05,
      skills: ["tidal_wave", "crushing_depths", "call_of_the_deep"]
    }
  }
};

// Hidden Class Scrolls
export const SCROLLS = {
  flameblade: {
    id: "scroll_flameblade",
    name: "Flameblade Scroll",
    icon: "📜🔥",
    description: "Ancient scroll containing the secrets of the Flameblade warriors",
    requiredClass: "swordsman",
    rarity: "rare"
  },
  shadowDancer: {
    id: "scroll_shadow_dancer",
    name: "Shadow Dancer Scroll",
    icon: "📜🌑",
    description: "Dark scroll whispering the techniques of Shadow Dancers",
    requiredClass: "thief",
    rarity: "rare"
  },
  stormRanger: {
    id: "scroll_storm_ranger",
    name: "Storm Ranger Scroll",
    icon: "📜⚡",
    description: "Crackling scroll infused with storm archer knowledge",
    requiredClass: "archer",
    rarity: "rare"
  },
  frostWeaver: {
    id: "scroll_frost_weaver",
    name: "Frost Weaver Scroll",
    icon: "📜❄️",
    description: "Frozen scroll containing ice magic mastery",
    requiredClass: "mage",
    rarity: "rare"
  }
};

// Skill definitions for combat
export const SKILLS = {
  // Swordsman
  slash: { name: "Slash", mpCost: 5, damage: 1.2, type: "physical" },
  heavyStrike: { name: "Heavy Strike", mpCost: 12, damage: 1.8, type: "physical" },
  shieldBash: { name: "Shield Bash", mpCost: 8, damage: 1.0, effect: "stun", type: "physical" },
  warCry: { name: "War Cry", mpCost: 15, damage: 0, effect: "buff_atk", type: "buff" },
  
  // Thief
  backstab: { name: "Backstab", mpCost: 8, damage: 2.0, critBonus: 0.3, type: "physical" },
  poisonBlade: { name: "Poison Blade", mpCost: 10, damage: 1.2, effect: "poison", type: "physical" },
  smokeScreen: { name: "Smoke Screen", mpCost: 12, damage: 0, effect: "evasion", type: "buff" },
  steal: { name: "Steal", mpCost: 5, damage: 0, effect: "steal", type: "special" },
  
  // Archer
  preciseShot: { name: "Precise Shot", mpCost: 6, damage: 1.5, type: "physical" },
  multiShot: { name: "Multi Shot", mpCost: 14, damage: 1.0, hits: 3, type: "physical" },
  eagleEye: { name: "Eagle Eye", mpCost: 10, damage: 0, effect: "accuracy", type: "buff" },
  arrowRain: { name: "Arrow Rain", mpCost: 20, damage: 1.8, type: "physical" },
  
  // Mage
  fireball: { name: "Fireball", mpCost: 10, damage: 1.6, type: "magic" },
  iceSpear: { name: "Ice Spear", mpCost: 12, damage: 1.4, effect: "slow", type: "magic" },
  manaShield: { name: "Mana Shield", mpCost: 15, damage: 0, effect: "shield", type: "buff" },
  thunderbolt: { name: "Thunderbolt", mpCost: 18, damage: 2.0, type: "magic" }
};

// Drop tables for equipment
export const EQUIPMENT_DROPS = {
  tower1: {
    common: [
      { id: "rusty_sword", name: "Rusty Sword", type: "weapon", slot: "weapon", classReq: "swordsman", stats: { str: 3 } },
      { id: "torn_hood", name: "Torn Hood", type: "armor", slot: "head", stats: { agi: 2 } },
      { id: "leather_vest", name: "Leather Vest", type: "armor", slot: "chest", stats: { vit: 3 } },
      { id: "wooden_bow", name: "Wooden Bow", type: "weapon", slot: "weapon", classReq: "archer", stats: { dex: 3 } },
      { id: "apprentice_staff", name: "Apprentice Staff", type: "weapon", slot: "weapon", classReq: "mage", stats: { int: 3 } },
      { id: "iron_dagger", name: "Iron Dagger", type: "weapon", slot: "weapon", classReq: "thief", stats: { agi: 3 } }
    ],
    uncommon: [
      { id: "soldier_sword", name: "Soldier's Sword", type: "weapon", slot: "weapon", classReq: "swordsman", stats: { str: 6, vit: 2 }, rarity: "uncommon" },
      { id: "hunter_bow", name: "Hunter's Bow", type: "weapon", slot: "weapon", classReq: "archer", stats: { dex: 6, agi: 2 }, rarity: "uncommon" },
      { id: "shadow_cloak", name: "Shadow Cloak", type: "armor", slot: "chest", stats: { agi: 5, dex: 3 }, rarity: "uncommon" },
      { id: "mage_robe", name: "Mage Robe", type: "armor", slot: "chest", stats: { int: 5, vit: 2 }, rarity: "uncommon" }
    ]
  },
  tower2: {
    uncommon: [
      { id: "coral_blade", name: "Coral Blade", type: "weapon", slot: "weapon", classReq: "swordsman", stats: { str: 10, vit: 4 }, rarity: "uncommon" },
      { id: "siren_bow", name: "Siren's Bow", type: "weapon", slot: "weapon", classReq: "archer", stats: { dex: 10, agi: 4 }, rarity: "uncommon" }
    ],
    rare: [
      { id: "abyssal_sword", name: "Abyssal Sword", type: "weapon", slot: "weapon", classReq: "swordsman", stats: { str: 15, vit: 8, agi: 3 }, rarity: "rare" },
      { id: "depth_staff", name: "Staff of the Depths", type: "weapon", slot: "weapon", classReq: "mage", stats: { int: 18, vit: 5 }, rarity: "rare" },
      { id: "kraken_dagger", name: "Kraken Fang Dagger", type: "weapon", slot: "weapon", classReq: "thief", stats: { agi: 15, dex: 8, str: 3 }, rarity: "rare" },
      { id: "leviathan_bow", name: "Leviathan Bow", type: "weapon", slot: "weapon", classReq: "archer", stats: { dex: 18, agi: 6 }, rarity: "rare" }
    ]
  }
};

// Item drop chances by floor type
export const DROP_RATES = {
  normal: {
    equipment: 0.15, // 15% chance
    potion: 0.30     // 30% chance
  },
  elite: {
    equipment: 0.40, // 40% chance
    potion: 0.50,
    scroll: 0.02     // 2% hidden class scroll
  },
  boss: {
    equipment: 0.80, // 80% chance
    rareEquipment: 0.30,
    scroll: 0.05,    // 5% hidden class scroll
    memoryCrystal: 0.10
  }
};

// Consumable items
export const CONSUMABLES = {
  health_potion_small: { id: "health_potion_small", name: "Small Health Potion", icon: "🧪", effect: "heal", value: 50, price: 25 },
  health_potion_medium: { id: "health_potion_medium", name: "Medium Health Potion", icon: "🧪", effect: "heal", value: 120, price: 60 },
  mana_potion_small: { id: "mana_potion_small", name: "Small Mana Potion", icon: "💎", effect: "mana", value: 30, price: 20 },
  mana_potion_medium: { id: "mana_potion_medium", name: "Medium Mana Potion", icon: "💎", effect: "mana", value: 80, price: 50 },
  antidote: { id: "antidote", name: "Antidote", icon: "🌿", effect: "cure_poison", price: 15 },
  energy_drink: { id: "energy_drink", name: "Energy Drink", icon: "⚡", effect: "energy", value: 25, price: 100 }
};
