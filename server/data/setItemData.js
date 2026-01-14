// ============================================================
// SET ITEMS DATABASE - Equipment Sets per Tower
// ============================================================

// Set bonus configurations
export const SET_BONUSES = {
  gridz: {
    name: 'Gridz',
    tower: 1,
    pieces: 5,
    bonuses: {
      3: { str: 20, agi: 20, dex: 20, int: 20, description: '+20 to Primary Stat' },
      5: { str: 50, agi: 50, dex: 50, int: 50, critChance: 20, description: '+50 Primary Stat, +20% Crit Chance' }
    }
  },
  tempest: {
    name: 'Tempest',
    tower: 2,
    pieces: 5,
    bonuses: {
      3: { str: 40, agi: 40, dex: 40, int: 40, description: '+40 to Primary Stat' },
      5: { str: 100, agi: 100, dex: 100, int: 100, def: 30, description: '+100 Primary Stat, +30 DEF' }
    }
  },
  inferno: {
    name: 'Inferno',
    tower: 3,
    pieces: 5,
    bonuses: {
      3: { str: 60, agi: 60, dex: 60, int: 60, vit: 30, description: '+60 Primary Stat, +30 VIT' },
      5: { str: 150, agi: 150, dex: 150, int: 150, dmgBonus: 15, description: '+150 Primary Stat, +15% DMG' }
    }
  },
  glacial: {
    name: 'Glacial',
    tower: 4,
    pieces: 5,
    bonuses: {
      3: { str: 80, agi: 80, dex: 80, int: 80, def: 40, description: '+80 Primary Stat, +40 DEF' },
      5: { str: 200, agi: 200, dex: 200, int: 200, dmgBonus: 20, critChance: 15, description: '+200 Primary, +20% DMG, +15% Crit' }
    }
  },
  nightmare: {
    name: 'Nightmare',
    tower: 5,
    pieces: 5,
    bonuses: {
      3: { str: 100, agi: 100, dex: 100, int: 100, vit: 50, description: '+100 Primary Stat, +50 VIT' },
      5: { str: 300, agi: 300, dex: 300, int: 300, dmgBonus: 25, lifesteal: 10, description: '+300 Primary, +25% DMG, +10% Lifesteal' }
    }
  },
  celestial: {
    name: 'Celestial',
    tower: 6,
    pieces: 5,
    bonuses: {
      3: { str: 150, agi: 150, dex: 150, int: 150, def: 60, description: '+150 Primary Stat, +60 DEF' },
      5: { str: 400, agi: 400, dex: 400, int: 400, dmgBonus: 30, healBonus: 20, description: '+400 Primary, +30% DMG, +20% Heal' }
    }
  },
  abyssal: {
    name: 'Abyssal',
    tower: 7,
    pieces: 5,
    bonuses: {
      3: { str: 200, agi: 200, dex: 200, int: 200, vit: 80, description: '+200 Primary Stat, +80 VIT' },
      5: { str: 500, agi: 500, dex: 500, int: 500, dmgBonus: 35, critDmg: 50, description: '+500 Primary, +35% DMG, +50% Crit DMG' }
    }
  },
  dragonborn: {
    name: 'Dragonborn',
    tower: 8,
    pieces: 5,
    bonuses: {
      3: { str: 250, agi: 250, dex: 250, int: 250, def: 100, description: '+250 Primary Stat, +100 DEF' },
      5: { str: 600, agi: 600, dex: 600, int: 600, dmgBonus: 40, allStats: 50, description: '+600 Primary, +40% DMG, +50 All Stats' }
    }
  },
  eternal: {
    name: 'Eternal',
    tower: 9,
    pieces: 5,
    bonuses: {
      3: { str: 300, agi: 300, dex: 300, int: 300, vit: 120, description: '+300 Primary Stat, +120 VIT' },
      5: { str: 800, agi: 800, dex: 800, int: 800, dmgBonus: 50, allStats: 80, description: '+800 Primary, +50% DMG, +80 All Stats' }
    }
  },
  divine: {
    name: 'Divine',
    tower: 10,
    pieces: 5,
    bonuses: {
      3: { str: 400, agi: 400, dex: 400, int: 400, def: 150, description: '+400 Primary Stat, +150 DEF' },
      5: { str: 1000, agi: 1000, dex: 1000, int: 1000, dmgBonus: 60, allStats: 100, finalDmg: 20, description: '+1000 Primary, +60% DMG, +100 All, +20% Final DMG' }
    }
  }
};

// ============================================================
// SET ITEMS - Full equipment per class per tower
// ============================================================

export const SET_ITEMS = {
  // ==================== TOWER 1: GRIDZ SET ====================
  gridz: {
    swordsman: {
      leftHand: { id: 'gridz_sword_sw', name: 'Gridz Sword', icon: '⚔️', rarity: 'epic', levelReq: 10, setId: 'gridz', stats: { str: 30, atk: 25 } },
      head: { id: 'gridz_helm_sw', name: 'Gridz Helm', icon: '🪖', rarity: 'epic', levelReq: 10, setId: 'gridz', stats: { vit: 20, def: 15 } },
      body: { id: 'gridz_armor_sw', name: 'Gridz Plate', icon: '🛡️', rarity: 'epic', levelReq: 10, setId: 'gridz', stats: { vit: 25, def: 20 } },
      leg: { id: 'gridz_legs_sw', name: 'Gridz Greaves', icon: '👖', rarity: 'epic', levelReq: 10, setId: 'gridz', stats: { str: 15, vit: 10 } },
      shoes: { id: 'gridz_boots_sw', name: 'Gridz Boots', icon: '👢', rarity: 'epic', levelReq: 10, setId: 'gridz', stats: { agi: 10, vit: 10 } }
    },
    thief: {
      leftHand: { id: 'gridz_dagger_th', name: 'Gridz Dagger', icon: '🗡️', rarity: 'epic', levelReq: 10, setId: 'gridz', stats: { agi: 30, atk: 20 } },
      head: { id: 'gridz_hood_th', name: 'Gridz Hood', icon: '🧢', rarity: 'epic', levelReq: 10, setId: 'gridz', stats: { agi: 20, critChance: 5 } },
      body: { id: 'gridz_vest_th', name: 'Gridz Vest', icon: '👕', rarity: 'epic', levelReq: 10, setId: 'gridz', stats: { agi: 25, def: 10 } },
      leg: { id: 'gridz_pants_th', name: 'Gridz Pants', icon: '👖', rarity: 'epic', levelReq: 10, setId: 'gridz', stats: { agi: 15, critChance: 3 } },
      shoes: { id: 'gridz_shoes_th', name: 'Gridz Shoes', icon: '👟', rarity: 'epic', levelReq: 10, setId: 'gridz', stats: { agi: 20, vit: 5 } }
    },
    archer: {
      leftHand: { id: 'gridz_bow_ar', name: 'Gridz Bow', icon: '🏹', rarity: 'epic', levelReq: 10, setId: 'gridz', stats: { dex: 30, atk: 22 } },
      head: { id: 'gridz_cap_ar', name: 'Gridz Cap', icon: '🧢', rarity: 'epic', levelReq: 10, setId: 'gridz', stats: { dex: 20, precision: 10 } },
      body: { id: 'gridz_tunic_ar', name: 'Gridz Tunic', icon: '👕', rarity: 'epic', levelReq: 10, setId: 'gridz', stats: { dex: 22, def: 8 } },
      leg: { id: 'gridz_leggings_ar', name: 'Gridz Leggings', icon: '👖', rarity: 'epic', levelReq: 10, setId: 'gridz', stats: { dex: 15, agi: 8 } },
      shoes: { id: 'gridz_treads_ar', name: 'Gridz Treads', icon: '👢', rarity: 'epic', levelReq: 10, setId: 'gridz', stats: { agi: 15, dex: 10 } }
    },
    mage: {
      leftHand: { id: 'gridz_staff_mg', name: 'Gridz Staff', icon: '🪄', rarity: 'epic', levelReq: 10, setId: 'gridz', stats: { int: 35, magicAtk: 25 } },
      head: { id: 'gridz_circlet_mg', name: 'Gridz Circlet', icon: '👑', rarity: 'epic', levelReq: 10, setId: 'gridz', stats: { int: 22, mana: 20 } },
      body: { id: 'gridz_robe_mg', name: 'Gridz Robe', icon: '👘', rarity: 'epic', levelReq: 10, setId: 'gridz', stats: { int: 25, mana: 25 } },
      leg: { id: 'gridz_pants_mg', name: 'Gridz Cloth', icon: '👖', rarity: 'epic', levelReq: 10, setId: 'gridz', stats: { int: 15, vit: 10 } },
      shoes: { id: 'gridz_slippers_mg', name: 'Gridz Slippers', icon: '🥿', rarity: 'epic', levelReq: 10, setId: 'gridz', stats: { int: 18, mana: 12 } }
    }
  },

  // ==================== TOWER 2: TEMPEST SET ====================
  tempest: {
    swordsman: {
      leftHand: { id: 'tempest_sword_sw', name: 'Tempest Blade', icon: '⚔️', rarity: 'epic', levelReq: 25, setId: 'tempest', stats: { str: 55, atk: 45 } },
      head: { id: 'tempest_helm_sw', name: 'Tempest Helm', icon: '🪖', rarity: 'epic', levelReq: 25, setId: 'tempest', stats: { vit: 40, def: 30 } },
      body: { id: 'tempest_armor_sw', name: 'Tempest Plate', icon: '🛡️', rarity: 'epic', levelReq: 25, setId: 'tempest', stats: { vit: 50, def: 40 } },
      leg: { id: 'tempest_legs_sw', name: 'Tempest Greaves', icon: '👖', rarity: 'epic', levelReq: 25, setId: 'tempest', stats: { str: 30, vit: 20 } },
      shoes: { id: 'tempest_boots_sw', name: 'Tempest Boots', icon: '👢', rarity: 'epic', levelReq: 25, setId: 'tempest', stats: { agi: 20, vit: 20 } }
    },
    thief: {
      leftHand: { id: 'tempest_dagger_th', name: 'Tempest Fang', icon: '🗡️', rarity: 'epic', levelReq: 25, setId: 'tempest', stats: { agi: 55, atk: 40 } },
      head: { id: 'tempest_hood_th', name: 'Tempest Mask', icon: '🎭', rarity: 'epic', levelReq: 25, setId: 'tempest', stats: { agi: 40, critChance: 10 } },
      body: { id: 'tempest_vest_th', name: 'Tempest Leather', icon: '🧥', rarity: 'epic', levelReq: 25, setId: 'tempest', stats: { agi: 45, def: 20 } },
      leg: { id: 'tempest_pants_th', name: 'Tempest Pants', icon: '👖', rarity: 'epic', levelReq: 25, setId: 'tempest', stats: { agi: 30, critChance: 8 } },
      shoes: { id: 'tempest_shoes_th', name: 'Tempest Boots', icon: '👢', rarity: 'epic', levelReq: 25, setId: 'tempest', stats: { agi: 40, vit: 15 } }
    },
    archer: {
      leftHand: { id: 'tempest_bow_ar', name: 'Tempest Longbow', icon: '🏹', rarity: 'epic', levelReq: 25, setId: 'tempest', stats: { dex: 55, atk: 42 } },
      head: { id: 'tempest_hood_ar', name: 'Tempest Hood', icon: '🧢', rarity: 'epic', levelReq: 25, setId: 'tempest', stats: { dex: 38, precision: 18 } },
      body: { id: 'tempest_vest_ar', name: 'Tempest Vest', icon: '🦺', rarity: 'epic', levelReq: 25, setId: 'tempest', stats: { dex: 42, def: 18 } },
      leg: { id: 'tempest_pants_ar', name: 'Tempest Leggings', icon: '👖', rarity: 'epic', levelReq: 25, setId: 'tempest', stats: { dex: 28, agi: 18 } },
      shoes: { id: 'tempest_boots_ar', name: 'Tempest Treads', icon: '👢', rarity: 'epic', levelReq: 25, setId: 'tempest', stats: { agi: 30, dex: 20 } }
    },
    mage: {
      leftHand: { id: 'tempest_staff_mg', name: 'Tempest Staff', icon: '🪄', rarity: 'epic', levelReq: 25, setId: 'tempest', stats: { int: 60, magicAtk: 48 } },
      head: { id: 'tempest_circlet_mg', name: 'Tempest Crown', icon: '👑', rarity: 'epic', levelReq: 25, setId: 'tempest', stats: { int: 42, mana: 40 } },
      body: { id: 'tempest_robe_mg', name: 'Tempest Robe', icon: '👘', rarity: 'epic', levelReq: 25, setId: 'tempest', stats: { int: 48, mana: 45 } },
      leg: { id: 'tempest_pants_mg', name: 'Tempest Cloth', icon: '👖', rarity: 'epic', levelReq: 25, setId: 'tempest', stats: { int: 30, vit: 20 } },
      shoes: { id: 'tempest_slippers_mg', name: 'Tempest Slippers', icon: '🥿', rarity: 'epic', levelReq: 25, setId: 'tempest', stats: { int: 35, mana: 25 } }
    }
  }
};

// Generate sets for towers 3-10 programmatically
const setNames = ['inferno', 'glacial', 'nightmare', 'celestial', 'abyssal', 'dragonborn', 'eternal', 'divine'];
const setLevelReqs = [40, 60, 85, 115, 145, 170, 185, 195];
const setRarities = ['legendary', 'legendary', 'legendary', 'mythical', 'mythical', 'mythical', 'mythical', 'mythical'];

setNames.forEach((setName, index) => {
  const towerNum = index + 3;
  const levelReq = setLevelReqs[index];
  const rarity = setRarities[index];
  const multiplier = 1.5 + (index * 0.5);
  
  SET_ITEMS[setName] = {
    swordsman: {
      leftHand: { id: setName + '_sword_sw', name: setName.charAt(0).toUpperCase() + setName.slice(1) + ' Sword', icon: '⚔️', rarity, levelReq, setId: setName, stats: { str: Math.floor(55 * multiplier), atk: Math.floor(45 * multiplier) } },
      head: { id: setName + '_helm_sw', name: setName.charAt(0).toUpperCase() + setName.slice(1) + ' Helm', icon: '🪖', rarity, levelReq, setId: setName, stats: { vit: Math.floor(40 * multiplier), def: Math.floor(30 * multiplier) } },
      body: { id: setName + '_armor_sw', name: setName.charAt(0).toUpperCase() + setName.slice(1) + ' Plate', icon: '🛡️', rarity, levelReq, setId: setName, stats: { vit: Math.floor(50 * multiplier), def: Math.floor(40 * multiplier) } },
      leg: { id: setName + '_legs_sw', name: setName.charAt(0).toUpperCase() + setName.slice(1) + ' Greaves', icon: '👖', rarity, levelReq, setId: setName, stats: { str: Math.floor(30 * multiplier), vit: Math.floor(20 * multiplier) } },
      shoes: { id: setName + '_boots_sw', name: setName.charAt(0).toUpperCase() + setName.slice(1) + ' Boots', icon: '👢', rarity, levelReq, setId: setName, stats: { agi: Math.floor(20 * multiplier), vit: Math.floor(20 * multiplier) } }
    },
    thief: {
      leftHand: { id: setName + '_dagger_th', name: setName.charAt(0).toUpperCase() + setName.slice(1) + ' Fang', icon: '🗡️', rarity, levelReq, setId: setName, stats: { agi: Math.floor(55 * multiplier), atk: Math.floor(40 * multiplier) } },
      head: { id: setName + '_hood_th', name: setName.charAt(0).toUpperCase() + setName.slice(1) + ' Mask', icon: '🎭', rarity, levelReq, setId: setName, stats: { agi: Math.floor(40 * multiplier), critChance: Math.floor(10 + index * 2) } },
      body: { id: setName + '_vest_th', name: setName.charAt(0).toUpperCase() + setName.slice(1) + ' Leather', icon: '🧥', rarity, levelReq, setId: setName, stats: { agi: Math.floor(45 * multiplier), def: Math.floor(20 * multiplier) } },
      leg: { id: setName + '_pants_th', name: setName.charAt(0).toUpperCase() + setName.slice(1) + ' Pants', icon: '👖', rarity, levelReq, setId: setName, stats: { agi: Math.floor(30 * multiplier), critChance: Math.floor(8 + index * 2) } },
      shoes: { id: setName + '_shoes_th', name: setName.charAt(0).toUpperCase() + setName.slice(1) + ' Boots', icon: '👢', rarity, levelReq, setId: setName, stats: { agi: Math.floor(40 * multiplier), vit: Math.floor(15 * multiplier) } }
    },
    archer: {
      leftHand: { id: setName + '_bow_ar', name: setName.charAt(0).toUpperCase() + setName.slice(1) + ' Bow', icon: '🏹', rarity, levelReq, setId: setName, stats: { dex: Math.floor(55 * multiplier), atk: Math.floor(42 * multiplier) } },
      head: { id: setName + '_hood_ar', name: setName.charAt(0).toUpperCase() + setName.slice(1) + ' Hood', icon: '🧢', rarity, levelReq, setId: setName, stats: { dex: Math.floor(38 * multiplier), precision: Math.floor(18 + index * 3) } },
      body: { id: setName + '_vest_ar', name: setName.charAt(0).toUpperCase() + setName.slice(1) + ' Vest', icon: '🦺', rarity, levelReq, setId: setName, stats: { dex: Math.floor(42 * multiplier), def: Math.floor(18 * multiplier) } },
      leg: { id: setName + '_pants_ar', name: setName.charAt(0).toUpperCase() + setName.slice(1) + ' Leggings', icon: '👖', rarity, levelReq, setId: setName, stats: { dex: Math.floor(28 * multiplier), agi: Math.floor(18 * multiplier) } },
      shoes: { id: setName + '_boots_ar', name: setName.charAt(0).toUpperCase() + setName.slice(1) + ' Treads', icon: '👢', rarity, levelReq, setId: setName, stats: { agi: Math.floor(30 * multiplier), dex: Math.floor(20 * multiplier) } }
    },
    mage: {
      leftHand: { id: setName + '_staff_mg', name: setName.charAt(0).toUpperCase() + setName.slice(1) + ' Staff', icon: '🪄', rarity, levelReq, setId: setName, stats: { int: Math.floor(60 * multiplier), magicAtk: Math.floor(48 * multiplier) } },
      head: { id: setName + '_circlet_mg', name: setName.charAt(0).toUpperCase() + setName.slice(1) + ' Crown', icon: '👑', rarity, levelReq, setId: setName, stats: { int: Math.floor(42 * multiplier), mana: Math.floor(40 * multiplier) } },
      body: { id: setName + '_robe_mg', name: setName.charAt(0).toUpperCase() + setName.slice(1) + ' Robe', icon: '👘', rarity, levelReq, setId: setName, stats: { int: Math.floor(48 * multiplier), mana: Math.floor(45 * multiplier) } },
      leg: { id: setName + '_pants_mg', name: setName.charAt(0).toUpperCase() + setName.slice(1) + ' Cloth', icon: '👖', rarity, levelReq, setId: setName, stats: { int: Math.floor(30 * multiplier), vit: Math.floor(20 * multiplier) } },
      shoes: { id: setName + '_slippers_mg', name: setName.charAt(0).toUpperCase() + setName.slice(1) + ' Slippers', icon: '🥿', rarity, levelReq, setId: setName, stats: { int: Math.floor(35 * multiplier), mana: Math.floor(25 * multiplier) } }
    }
  };
});

// ============================================================
// NON-SET EQUIPMENT - Random drops per tower tier
// ============================================================

export const NON_SET_EQUIPMENT = {
  common: {
    weapons: {
      swordsman: [
        { id: 'wooden_sword', name: 'Wooden Sword', icon: '🗡️', slot: 'leftHand', levelReq: 1, stats: { str: 3, atk: 5 } },
        { id: 'rusty_blade', name: 'Rusty Blade', icon: '⚔️', slot: 'leftHand', levelReq: 5, stats: { str: 6, atk: 10 } }
      ],
      thief: [
        { id: 'wooden_dagger', name: 'Wooden Dagger', icon: '🔪', slot: 'leftHand', levelReq: 1, stats: { agi: 3, atk: 4 } },
        { id: 'rusty_knife', name: 'Rusty Knife', icon: '🗡️', slot: 'leftHand', levelReq: 5, stats: { agi: 6, atk: 8 } }
      ],
      archer: [
        { id: 'wooden_bow', name: 'Wooden Bow', icon: '🏹', slot: 'leftHand', levelReq: 1, stats: { dex: 3, atk: 4 } },
        { id: 'short_bow', name: 'Short Bow', icon: '🏹', slot: 'leftHand', levelReq: 5, stats: { dex: 6, atk: 9 } }
      ],
      mage: [
        { id: 'wooden_staff', name: 'Wooden Staff', icon: '🪄', slot: 'leftHand', levelReq: 1, stats: { int: 4, magicAtk: 5 } },
        { id: 'apprentice_wand', name: 'Apprentice Wand', icon: '🪄', slot: 'leftHand', levelReq: 5, stats: { int: 7, magicAtk: 10 } }
      ]
    },
    armor: [
      { id: 'cloth_shirt', name: 'Cloth Shirt', icon: '👕', slot: 'body', levelReq: 1, stats: { def: 2, vit: 3 } },
      { id: 'leather_cap', name: 'Leather Cap', icon: '🧢', slot: 'head', levelReq: 1, stats: { def: 1, vit: 2 } },
      { id: 'cloth_pants', name: 'Cloth Pants', icon: '👖', slot: 'leg', levelReq: 1, stats: { def: 1, vit: 2 } },
      { id: 'sandals', name: 'Sandals', icon: '👟', slot: 'shoes', levelReq: 1, stats: { agi: 2 } }
    ],
    accessories: [
      { id: 'copper_ring', name: 'Copper Ring', icon: '💍', slot: 'ring', levelReq: 1, stats: { str: 1, agi: 1 } },
      { id: 'wooden_pendant', name: 'Wooden Pendant', icon: '📿', slot: 'necklace', levelReq: 1, stats: { vit: 2 } }
    ]
  },
  rare: {
    weapons: {
      swordsman: [
        { id: 'iron_sword', name: 'Iron Sword', icon: '⚔️', slot: 'leftHand', levelReq: 10, stats: { str: 15, atk: 20 } },
        { id: 'soldier_blade', name: "Soldier's Blade", icon: '⚔️', slot: 'leftHand', levelReq: 15, stats: { str: 22, atk: 28 } }
      ],
      thief: [
        { id: 'steel_dagger', name: 'Steel Dagger', icon: '🗡️', slot: 'leftHand', levelReq: 10, stats: { agi: 15, atk: 18 } },
        { id: 'assassin_knife', name: "Assassin's Knife", icon: '🗡️', slot: 'leftHand', levelReq: 15, stats: { agi: 22, atk: 25, critChance: 3 } }
      ],
      archer: [
        { id: 'composite_bow', name: 'Composite Bow', icon: '🏹', slot: 'leftHand', levelReq: 10, stats: { dex: 15, atk: 19 } },
        { id: 'hunter_bow', name: "Hunter's Bow", icon: '🏹', slot: 'leftHand', levelReq: 15, stats: { dex: 22, atk: 26, precision: 5 } }
      ],
      mage: [
        { id: 'oak_staff', name: 'Oak Staff', icon: '🪄', slot: 'leftHand', levelReq: 10, stats: { int: 18, magicAtk: 22 } },
        { id: 'mystic_rod', name: 'Mystic Rod', icon: '🪄', slot: 'leftHand', levelReq: 15, stats: { int: 25, magicAtk: 30, mana: 15 } }
      ]
    },
    armor: [
      { id: 'leather_armor', name: 'Leather Armor', icon: '🧥', slot: 'body', levelReq: 10, stats: { def: 12, vit: 15 } },
      { id: 'iron_helm', name: 'Iron Helm', icon: '🪖', slot: 'head', levelReq: 10, stats: { def: 8, vit: 10 } },
      { id: 'leather_pants', name: 'Leather Pants', icon: '👖', slot: 'leg', levelReq: 10, stats: { def: 6, vit: 8 } },
      { id: 'leather_boots', name: 'Leather Boots', icon: '👢', slot: 'shoes', levelReq: 10, stats: { agi: 8, def: 4 } }
    ],
    accessories: [
      { id: 'silver_ring', name: 'Silver Ring', icon: '💍', slot: 'ring', levelReq: 10, stats: { str: 5, agi: 5 } },
      { id: 'bone_amulet', name: 'Bone Amulet', icon: '📿', slot: 'necklace', levelReq: 10, stats: { vit: 10, def: 3 } }
    ]
  },
  epic: {
    weapons: {
      swordsman: [
        { id: 'knights_sword', name: "Knight's Sword", icon: '⚔️', slot: 'leftHand', levelReq: 30, stats: { str: 45, atk: 55 } },
        { id: 'champions_blade', name: "Champion's Blade", icon: '⚔️', slot: 'leftHand', levelReq: 45, stats: { str: 65, atk: 75 } }
      ],
      thief: [
        { id: 'shadow_knife', name: 'Shadow Knife', icon: '🗡️', slot: 'leftHand', levelReq: 30, stats: { agi: 45, atk: 50, critChance: 8 } },
        { id: 'phantom_blade', name: 'Phantom Blade', icon: '🗡️', slot: 'leftHand', levelReq: 45, stats: { agi: 65, atk: 70, critChance: 12 } }
      ],
      archer: [
        { id: 'wind_bow', name: 'Wind Bow', icon: '🏹', slot: 'leftHand', levelReq: 30, stats: { dex: 45, atk: 52, precision: 12 } },
        { id: 'storm_bow', name: 'Storm Bow', icon: '🏹', slot: 'leftHand', levelReq: 45, stats: { dex: 65, atk: 72, precision: 18 } }
      ],
      mage: [
        { id: 'arcane_staff', name: 'Arcane Staff', icon: '🪄', slot: 'leftHand', levelReq: 30, stats: { int: 50, magicAtk: 60, mana: 30 } },
        { id: 'elemental_rod', name: 'Elemental Rod', icon: '🪄', slot: 'leftHand', levelReq: 45, stats: { int: 70, magicAtk: 85, mana: 45 } }
      ]
    },
    armor: [
      { id: 'plate_armor', name: 'Plate Armor', icon: '🛡️', slot: 'body', levelReq: 30, stats: { def: 35, vit: 40 } },
      { id: 'steel_helm', name: 'Steel Helm', icon: '🪖', slot: 'head', levelReq: 30, stats: { def: 25, vit: 30 } },
      { id: 'chain_pants', name: 'Chain Pants', icon: '👖', slot: 'leg', levelReq: 30, stats: { def: 20, vit: 25 } },
      { id: 'steel_boots', name: 'Steel Boots', icon: '👢', slot: 'shoes', levelReq: 30, stats: { agi: 18, def: 15 } }
    ],
    accessories: [
      { id: 'gold_ring', name: 'Gold Ring', icon: '💍', slot: 'ring', levelReq: 30, stats: { str: 15, agi: 15, int: 15, dex: 15 } },
      { id: 'crystal_pendant', name: 'Crystal Pendant', icon: '📿', slot: 'necklace', levelReq: 30, stats: { vit: 25, mana: 20 } }
    ]
  },
  legendary: {
    weapons: {
      swordsman: [
        { id: 'dragon_slayer', name: 'Dragon Slayer', icon: '⚔️', slot: 'leftHand', levelReq: 60, stats: { str: 100, atk: 120, critChance: 10 } },
        { id: 'titans_blade', name: "Titan's Blade", icon: '⚔️', slot: 'leftHand', levelReq: 80, stats: { str: 150, atk: 180, dmgBonus: 10 } }
      ],
      thief: [
        { id: 'soul_reaper', name: 'Soul Reaper', icon: '🗡️', slot: 'leftHand', levelReq: 60, stats: { agi: 100, atk: 110, critChance: 20 } },
        { id: 'deaths_whisper', name: "Death's Whisper", icon: '🗡️', slot: 'leftHand', levelReq: 80, stats: { agi: 150, atk: 165, critChance: 28, critDmg: 30 } }
      ],
      archer: [
        { id: 'phoenix_bow', name: 'Phoenix Bow', icon: '🏹', slot: 'leftHand', levelReq: 60, stats: { dex: 100, atk: 115, precision: 25 } },
        { id: 'starfall_bow', name: 'Starfall Bow', icon: '🏹', slot: 'leftHand', levelReq: 80, stats: { dex: 150, atk: 170, precision: 35, critChance: 15 } }
      ],
      mage: [
        { id: 'void_staff', name: 'Void Staff', icon: '🪄', slot: 'leftHand', levelReq: 60, stats: { int: 110, magicAtk: 130, mana: 60 } },
        { id: 'cosmic_rod', name: 'Cosmic Rod', icon: '🪄', slot: 'leftHand', levelReq: 80, stats: { int: 165, magicAtk: 195, mana: 90, dmgBonus: 12 } }
      ]
    },
    armor: [
      { id: 'dragon_armor', name: 'Dragon Armor', icon: '🛡️', slot: 'body', levelReq: 60, stats: { def: 80, vit: 90, str: 30 } },
      { id: 'dragon_helm', name: 'Dragon Helm', icon: '🪖', slot: 'head', levelReq: 60, stats: { def: 55, vit: 65 } },
      { id: 'dragon_legs', name: 'Dragon Leggings', icon: '👖', slot: 'leg', levelReq: 60, stats: { def: 45, vit: 55 } },
      { id: 'dragon_boots', name: 'Dragon Boots', icon: '👢', slot: 'shoes', levelReq: 60, stats: { agi: 40, def: 35, vit: 30 } }
    ],
    accessories: [
      { id: 'dragon_ring', name: 'Dragon Ring', icon: '💍', slot: 'ring', levelReq: 60, stats: { str: 35, agi: 35, int: 35, dex: 35 } },
      { id: 'dragon_pendant', name: 'Dragon Pendant', icon: '📿', slot: 'necklace', levelReq: 60, stats: { vit: 60, mana: 50, def: 25 } }
    ]
  },
  mythical: {
    weapons: {
      swordsman: [
        { id: 'godslayer', name: 'Godslayer', icon: '⚔️', slot: 'leftHand', levelReq: 150, stats: { str: 300, atk: 350, critChance: 25, dmgBonus: 20 } },
        { id: 'eternity_blade', name: 'Eternity Blade', icon: '⚔️', slot: 'leftHand', levelReq: 190, stats: { str: 500, atk: 600, critChance: 35, dmgBonus: 35, finalDmg: 10 } }
      ],
      thief: [
        { id: 'void_fang', name: 'Void Fang', icon: '🗡️', slot: 'leftHand', levelReq: 150, stats: { agi: 300, atk: 320, critChance: 40, critDmg: 60 } },
        { id: 'oblivion_edge', name: 'Oblivion Edge', icon: '🗡️', slot: 'leftHand', levelReq: 190, stats: { agi: 500, atk: 550, critChance: 50, critDmg: 100, finalDmg: 10 } }
      ],
      archer: [
        { id: 'celestial_bow', name: 'Celestial Bow', icon: '🏹', slot: 'leftHand', levelReq: 150, stats: { dex: 300, atk: 330, precision: 50, critChance: 30 } },
        { id: 'godhood_bow', name: 'Godhood Bow', icon: '🏹', slot: 'leftHand', levelReq: 190, stats: { dex: 500, atk: 580, precision: 70, critChance: 40, finalDmg: 10 } }
      ],
      mage: [
        { id: 'archmage_staff', name: 'Archmage Staff', icon: '🪄', slot: 'leftHand', levelReq: 150, stats: { int: 320, magicAtk: 380, mana: 150, dmgBonus: 25 } },
        { id: 'creation_staff', name: 'Staff of Creation', icon: '🪄', slot: 'leftHand', levelReq: 190, stats: { int: 550, magicAtk: 650, mana: 250, dmgBonus: 40, finalDmg: 10 } }
      ]
    },
    armor: [
      { id: 'divine_armor', name: 'Divine Armor', icon: '🛡️', slot: 'body', levelReq: 150, stats: { def: 200, vit: 250, allStats: 50 } },
      { id: 'divine_helm', name: 'Divine Helm', icon: '🪖', slot: 'head', levelReq: 150, stats: { def: 140, vit: 180, allStats: 30 } },
      { id: 'divine_legs', name: 'Divine Leggings', icon: '👖', slot: 'leg', levelReq: 150, stats: { def: 120, vit: 150, allStats: 25 } },
      { id: 'divine_boots', name: 'Divine Boots', icon: '👢', slot: 'shoes', levelReq: 150, stats: { agi: 100, def: 100, vit: 100, allStats: 20 } }
    ],
    accessories: [
      { id: 'divine_ring', name: 'Divine Ring', icon: '💍', slot: 'ring', levelReq: 150, stats: { str: 80, agi: 80, int: 80, dex: 80, vit: 50 } },
      { id: 'divine_pendant', name: 'Divine Pendant', icon: '📿', slot: 'necklace', levelReq: 150, stats: { vit: 150, mana: 120, def: 80, allStats: 40 } }
    ]
  }
};

// ============================================================
// HELPER: Get random equipment for tower
// ============================================================

export function getRandomEquipment(towerId, baseClass, isElite, isBoss) {
  const tower = towerId;
  let rarity = 'common';
  
  // Determine rarity based on tower and enemy type
  if (tower <= 2) rarity = isBoss ? 'rare' : (isElite ? 'rare' : (Math.random() < 0.7 ? 'common' : 'rare'));
  else if (tower <= 4) rarity = isBoss ? 'epic' : (isElite ? 'epic' : (Math.random() < 0.6 ? 'rare' : 'epic'));
  else if (tower <= 6) rarity = isBoss ? 'legendary' : (isElite ? 'legendary' : (Math.random() < 0.5 ? 'epic' : 'legendary'));
  else rarity = isBoss ? 'mythical' : (isElite ? 'mythical' : (Math.random() < 0.4 ? 'legendary' : 'mythical'));
  
  const equipment = NON_SET_EQUIPMENT[rarity];
  if (!equipment) return null;
  
  // Random slot type
  const slotTypes = ['weapons', 'armor', 'accessories'];
  const slotType = slotTypes[Math.floor(Math.random() * slotTypes.length)];
  
  let pool;
  if (slotType === 'weapons') {
    pool = equipment.weapons[baseClass] || equipment.weapons.swordsman;
  } else {
    pool = equipment[slotType];
  }
  
  if (!pool || pool.length === 0) return null;
  
  const item = pool[Math.floor(Math.random() * pool.length)];
  return { ...item, rarity };
}

// ============================================================
// HELPER: Get set item drop
// ============================================================

export function getSetItemDrop(towerId, baseClass) {
  const setNames = ['gridz', 'tempest', 'inferno', 'glacial', 'nightmare', 'celestial', 'abyssal', 'dragonborn', 'eternal', 'divine'];
  const setId = setNames[towerId - 1];
  
  if (!SET_ITEMS[setId] || !SET_ITEMS[setId][baseClass]) return null;
  
  const slots = ['leftHand', 'head', 'body', 'leg', 'shoes'];
  const slot = slots[Math.floor(Math.random() * slots.length)];
  
  return SET_ITEMS[setId][baseClass][slot];
}

// ============================================================
// HELPER: Calculate set bonus
// ============================================================

export function calculateSetBonus(equippedItems) {
  const setCounts = {};
  
  // Count equipped set pieces
  equippedItems.forEach(item => {
    if (item && item.setId) {
      setCounts[item.setId] = (setCounts[item.setId] || 0) + 1;
    }
  });
  
  // Calculate bonuses
  const bonuses = { str: 0, agi: 0, dex: 0, int: 0, vit: 0, def: 0, critChance: 0, critDmg: 0, dmgBonus: 0, allStats: 0, finalDmg: 0, mana: 0, healBonus: 0, lifesteal: 0 };
  const activeSetBonuses = [];
  
  Object.entries(setCounts).forEach(([setId, count]) => {
    const setBonus = SET_BONUSES[setId];
    if (!setBonus) return;
    
    if (count >= 3 && setBonus.bonuses[3]) {
      const bonus3 = setBonus.bonuses[3];
      Object.entries(bonus3).forEach(([stat, value]) => {
        if (stat !== 'description' && bonuses[stat] !== undefined) {
          bonuses[stat] += value;
        }
      });
      activeSetBonuses.push({ set: setBonus.name, pieces: 3, description: bonus3.description });
    }
    
    if (count >= 5 && setBonus.bonuses[5]) {
      const bonus5 = setBonus.bonuses[5];
      Object.entries(bonus5).forEach(([stat, value]) => {
        if (stat !== 'description' && bonuses[stat] !== undefined) {
          bonuses[stat] += value;
        }
      });
      activeSetBonuses.push({ set: setBonus.name, pieces: 5, description: bonus5.description });
    }
  });
  
  return { bonuses, activeSetBonuses, setCounts };
}
