// ============================================================
// EQUIPMENT SETS DATABASE
// Easy to edit - just add new set entries
// ============================================================

export const SETS = {
  
  // ============================================================
  // STARTER SETS (Floor 1-5)
  // ============================================================
  
  iron_warrior: {
    id: 'iron_warrior',
    name: 'Iron Warrior Set',
    icon: '⚔️',
    class: 'swordsman',
    rarity: 'uncommon',
    pieces: ['iron_sword', 'iron_helm', 'chainmail', 'combat_gauntlets', 'steel_boots'],
    bonuses: {
      2: { pAtk: 10, description: '+10 P.ATK' },
      4: { str: 5, hp: 50, description: '+5 STR, +50 HP' },
      5: { pDef: 20, critDmg: 10, description: '+20 P.DEF, +10% Crit DMG' }
    },
    description: 'Standard warrior equipment.'
  },
  
  shadow_assassin: {
    id: 'shadow_assassin',
    name: 'Shadow Assassin Set',
    icon: '🗡️',
    class: 'thief',
    rarity: 'uncommon',
    pieces: ['assassins_blade', 'rogues_mask', 'shadow_vest', 'thieves_gloves', 'swift_boots'],
    bonuses: {
      2: { agi: 5, description: '+5 AGI' },
      4: { critRate: 8, description: '+8% Crit Rate' },
      5: { critDmg: 25, pAtk: 15, description: '+25% Crit DMG, +15 P.ATK' }
    },
    description: 'Silent killer equipment.'
  },
  
  forest_ranger: {
    id: 'forest_ranger',
    name: 'Forest Ranger Set',
    icon: '🏹',
    class: 'archer',
    rarity: 'uncommon',
    pieces: ['hunters_bow', 'leather_cap', 'ranger_tunic', 'archers_bracers', 'ranger_boots'],
    bonuses: {
      2: { dex: 5, description: '+5 DEX' },
      4: { pAtk: 15, critRate: 4, description: '+15 P.ATK, +4% Crit Rate' },
      5: { agi: 8, critDmg: 15, description: '+8 AGI, +15% Crit DMG' }
    },
    description: 'Woodland hunter gear.'
  },
  
  apprentice_mage: {
    id: 'apprentice_mage',
    name: 'Apprentice Mage Set',
    icon: '🔮',
    class: 'mage',
    rarity: 'uncommon',
    pieces: ['crystal_staff', 'mage_hood', 'mage_robe', 'cloth_gloves', 'mage_slippers'],
    bonuses: {
      2: { int: 5, description: '+5 INT' },
      4: { mAtk: 20, mp: 40, description: '+20 M.ATK, +40 MP' },
      5: { int: 10, critDmg: 12, description: '+10 INT, +12% Crit DMG' }
    },
    description: 'Basic mage attire.'
  },
  
  
  // ============================================================
  // MID-GAME SETS (Floor 6-10)
  // ============================================================
  
  flame_knight: {
    id: 'flame_knight',
    name: 'Flame Knight Set',
    icon: '🔥',
    class: 'swordsman',
    rarity: 'rare',
    element: 'fire',
    pieces: ['flamebrand', 'knights_helm', 'plate_armor', 'berserker_gauntlets', 'steel_boots'],
    bonuses: {
      2: { pAtk: 20, description: '+20 P.ATK' },
      3: { str: 8, description: '+8 STR' },
      5: { pAtk: 35, critDmg: 20, description: '+35 P.ATK, +20% Crit DMG, Fire damage +15%' }
    },
    description: 'Burns with righteous fury.'
  },
  
  phantom_blade: {
    id: 'phantom_blade',
    name: 'Phantom Blade Set',
    icon: '👻',
    class: 'thief',
    rarity: 'rare',
    element: 'dark',
    pieces: ['shadow_claw', 'rogues_mask', 'assassin_garb', 'thieves_gloves', 'swift_boots'],
    bonuses: {
      2: { critRate: 6, description: '+6% Crit Rate' },
      3: { agi: 10, description: '+10 AGI' },
      5: { critRate: 12, critDmg: 35, description: '+12% Crit Rate, +35% Crit DMG' }
    },
    description: 'Strike from the shadows.'
  },
  
  storm_hunter: {
    id: 'storm_hunter',
    name: 'Storm Hunter Set',
    icon: '⚡',
    class: 'archer',
    rarity: 'rare',
    element: 'lightning',
    pieces: ['storm_bow', 'leather_cap', 'ranger_tunic', 'archers_bracers', 'winged_boots'],
    bonuses: {
      2: { dex: 8, description: '+8 DEX' },
      3: { pAtk: 25, description: '+25 P.ATK' },
      5: { critRate: 10, agi: 15, description: '+10% Crit Rate, +15 AGI, Lightning damage +15%' }
    },
    description: 'Swift as lightning.'
  },
  
  frost_weaver: {
    id: 'frost_weaver',
    name: 'Frost Weaver Set',
    icon: '❄️',
    class: 'mage',
    rarity: 'rare',
    element: 'ice',
    pieces: ['frost_scepter', 'arcane_circlet', 'archmage_robe', 'spellweaver_gloves', 'mage_slippers'],
    bonuses: {
      2: { mAtk: 25, description: '+25 M.ATK' },
      3: { int: 10, mp: 50, description: '+10 INT, +50 MP' },
      5: { mAtk: 40, critDmg: 25, description: '+40 M.ATK, +25% Crit DMG, Ice damage +15%' }
    },
    description: 'Master of ice magic.'
  },
  
  
  // ============================================================
  // END-GAME SETS (Floor 11-15)
  // ============================================================
  
  dragon_slayer: {
    id: 'dragon_slayer',
    name: 'Dragon Slayer Set',
    icon: '🐉',
    class: 'any',
    rarity: 'epic',
    pieces: ['dragon_slayer', 'dragon_helm', 'dragon_scale_armor', 'dragon_claws', 'dragon_greaves'],
    bonuses: {
      2: { pAtk: 30, hp: 100, description: '+30 P.ATK, +100 HP' },
      3: { str: 12, vit: 12, description: '+12 STR, +12 VIT' },
      5: { pAtk: 60, critDmg: 35, hp: 200, description: '+60 P.ATK, +35% Crit DMG, +200 HP' }
    },
    description: 'Forged from dragon remains.'
  },
  
  void_walker: {
    id: 'void_walker',
    name: 'Void Walker Set',
    icon: '🌀',
    class: 'any',
    rarity: 'epic',
    element: 'dark',
    pieces: ['void_cleaver', 'dragon_helm', 'dragon_scale_armor', 'dragon_claws', 'dragon_greaves'],
    bonuses: {
      2: { mAtk: 30, pAtk: 30, description: '+30 M.ATK, +30 P.ATK' },
      3: { critRate: 8, description: '+8% Crit Rate' },
      5: { pAtk: 50, mAtk: 50, critDmg: 40, description: '+50 P.ATK, +50 M.ATK, +40% Crit DMG, Dark damage +20%' }
    },
    description: 'Walk between dimensions.'
  },
  
  
  // ============================================================
  // LEGENDARY SETS (Floor 15 Boss)
  // ============================================================
  
  shadow_monarch: {
    id: 'shadow_monarch',
    name: 'Shadow Monarch Set',
    icon: '👑',
    class: 'any',
    rarity: 'legendary',
    element: 'dark',
    pieces: ['excalibur', 'crown_of_shadows', 'monarchs_armor', 'shadow_grip', 'shadow_stride'],
    bonuses: {
      2: { pAtk: 50, mAtk: 50, description: '+50 P.ATK, +50 M.ATK' },
      3: { str: 20, int: 20, description: '+20 STR, +20 INT' },
      5: { 
        pAtk: 100, 
        mAtk: 100, 
        hp: 300, 
        critRate: 15, 
        critDmg: 50,
        description: '+100 P.ATK, +100 M.ATK, +300 HP, +15% Crit Rate, +50% Crit DMG, Dark damage +30%'
      }
    },
    description: 'Armor of the Shadow Monarch. Absolute power.'
  },
  
  celestial_guardian: {
    id: 'celestial_guardian',
    name: 'Celestial Guardian Set',
    icon: '✨',
    class: 'any',
    rarity: 'legendary',
    element: 'holy',
    pieces: ['excalibur', 'crown_of_shadows', 'monarchs_armor', 'shadow_grip', 'shadow_stride'],
    bonuses: {
      2: { pDef: 50, mDef: 50, description: '+50 P.DEF, +50 M.DEF' },
      3: { hp: 200, mp: 100, description: '+200 HP, +100 MP' },
      5: { 
        pDef: 80, 
        mDef: 80, 
        hp: 400, 
        vit: 25,
        description: '+80 P.DEF, +80 M.DEF, +400 HP, +25 VIT, Holy damage +30%'
      }
    },
    description: 'Divine protection incarnate.'
  }
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Get set info by set ID
 */
export const getSetById = (setId) => {
  return SETS[setId] || null;
};

/**
 * Get all sets for a class
 */
export const getSetsByClass = (className) => {
  return Object.values(SETS).filter(s => s.class === className || s.class === 'any');
};

/**
 * Get sets by rarity
 */
export const getSetsByRarity = (rarity) => {
  return Object.values(SETS).filter(s => s.rarity === rarity);
};

/**
 * Calculate set bonuses for equipped items
 * @param {Array} equippedItemIds - Array of equipped item IDs
 * @returns {Object} - { setId: { pieces: count, bonuses: {...} }, ... }
 */
export const calculateSetBonuses = (equippedItemIds) => {
  const result = {};
  
  Object.values(SETS).forEach(set => {
    const matchingPieces = set.pieces.filter(pieceId => equippedItemIds.includes(pieceId));
    const count = matchingPieces.length;
    
    if (count >= 2) {
      const activeBonuses = {};
      
      // Collect all active bonuses (2-piece, 3-piece, etc.)
      Object.keys(set.bonuses).forEach(threshold => {
        if (count >= parseInt(threshold)) {
          const bonus = set.bonuses[threshold];
          Object.keys(bonus).forEach(stat => {
            if (stat !== 'description') {
              activeBonuses[stat] = (activeBonuses[stat] || 0) + bonus[stat];
            }
          });
        }
      });
      
      result[set.id] = {
        name: set.name,
        icon: set.icon,
        pieces: count,
        totalPieces: set.pieces.length,
        bonuses: activeBonuses,
        element: set.element || null
      };
    }
  });
  
  return result;
};

/**
 * Check if an item belongs to any set
 */
export const getItemSets = (itemId) => {
  return Object.values(SETS).filter(set => set.pieces.includes(itemId));
};
