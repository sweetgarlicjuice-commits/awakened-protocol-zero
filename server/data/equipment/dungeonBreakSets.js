// ============================================================
// DUNGEON BREAK EQUIPMENT SETS
// ============================================================
// Phase 9.9+: Exclusive equipment from Dungeon Break events
// 
// 5 Sets corresponding to 5 Dungeon Break bosses:
// - Boss 1 (Lvl 20): Shadow Monarch's Remnant
// - Boss 2 (Lvl 30): Demon King's Armor
// - Boss 3 (Lvl 40): Ice Dragon's Scale
// - Boss 4 (Lvl 50): Architect's Design
// - Boss 5 (Lvl 60): Absolute Being's Fragment
// ============================================================

export const DUNGEON_BREAK_SETS = {
  // ============================================================
  // SET 1: Shadow Monarch's Remnant (Level 20)
  // ============================================================
  shadow_monarch_set: {
    id: 'shadow_monarch_set',
    name: "Shadow Monarch's Remnant",
    description: 'Fragments of power from the Shadow Monarch',
    levelReq: 20,
    rarity: 'legendary',
    
    pieces: {
      head: {
        id: 'shadow_monarch_helm',
        name: "Shadow Monarch's Crown",
        icon: '👑',
        slot: 'head',
        stats: { pAtk: 15, mAtk: 15, hp: 100 }
      },
      body: {
        id: 'shadow_monarch_armor',
        name: "Shadow Monarch's Chestplate",
        icon: '🥋',
        slot: 'body',
        stats: { pDef: 40, mDef: 40, hp: 200 }
      },
      hands: {
        id: 'shadow_monarch_gloves',
        name: "Shadow Monarch's Gauntlets",
        icon: '🧤',
        slot: 'hands',
        stats: { pAtk: 20, critRate: 5 }
      },
      feet: {
        id: 'shadow_monarch_boots',
        name: "Shadow Monarch's Greaves",
        icon: '👢',
        slot: 'feet',
        stats: { pDef: 25, agi: 10, hp: 50 }
      },
      mainHand: {
        id: 'shadow_monarch_blade',
        name: "Shadow Monarch's Blade",
        icon: '⚔️',
        slot: 'mainHand',
        stats: { pAtk: 50, mAtk: 30, critDmg: 20 }
      }
    },
    
    setBonuses: {
      2: { name: '2-Piece', effect: '+10% Dark Damage', stats: { darkDmg: 10 } },
      4: { name: '4-Piece', effect: '+15% Lifesteal on attacks', stats: { lifesteal: 15 } },
      5: { name: '5-Piece', effect: 'Shadow Army: 10% chance to summon shadow soldier on kill', special: 'shadow_army' }
    }
  },
  
  // ============================================================
  // SET 2: Demon King's Armor (Level 30)
  // ============================================================
  demon_king_set: {
    id: 'demon_king_set',
    name: "Demon King's Armor",
    description: 'Forged in the flames of the demon realm',
    levelReq: 30,
    rarity: 'legendary',
    
    pieces: {
      head: {
        id: 'demon_king_helm',
        name: "Demon King's Horned Helm",
        icon: '😈',
        slot: 'head',
        stats: { pAtk: 25, str: 10, hp: 150 }
      },
      body: {
        id: 'demon_king_armor',
        name: "Demon King's Infernal Plate",
        icon: '🔥',
        slot: 'body',
        stats: { pDef: 60, mDef: 40, hp: 300 }
      },
      hands: {
        id: 'demon_king_gloves',
        name: "Demon King's Claws",
        icon: '🖐️',
        slot: 'hands',
        stats: { pAtk: 35, critRate: 8 }
      },
      feet: {
        id: 'demon_king_boots',
        name: "Demon King's Hooves",
        icon: '🦶',
        slot: 'feet',
        stats: { pDef: 35, agi: 15, hp: 100 }
      },
      mainHand: {
        id: 'demon_king_axe',
        name: "Demon King's Hellfire Axe",
        icon: '🪓',
        slot: 'mainHand',
        stats: { pAtk: 80, critDmg: 30 }
      }
    },
    
    setBonuses: {
      2: { name: '2-Piece', effect: '+15% Fire Damage', stats: { fireDmg: 15 } },
      4: { name: '4-Piece', effect: '+20% P.ATK, Attacks burn enemies', stats: { pAtk: 20 }, special: 'burn_attacks' },
      5: { name: '5-Piece', effect: 'Demon Rage: Below 30% HP, +50% damage', special: 'demon_rage' }
    }
  },
  
  // ============================================================
  // SET 3: Ice Dragon's Scale (Level 40)
  // ============================================================
  ice_dragon_set: {
    id: 'ice_dragon_set',
    name: "Ice Dragon's Scale",
    description: 'Scales shed by the ancient ice dragon Kaisel',
    levelReq: 40,
    rarity: 'legendary',
    
    pieces: {
      head: {
        id: 'ice_dragon_helm',
        name: "Ice Dragon's Crest",
        icon: '❄️',
        slot: 'head',
        stats: { mAtk: 30, int: 15, mp: 100 }
      },
      body: {
        id: 'ice_dragon_armor',
        name: "Ice Dragon's Scales",
        icon: '🐉',
        slot: 'body',
        stats: { pDef: 50, mDef: 70, hp: 250, mp: 150 }
      },
      hands: {
        id: 'ice_dragon_gloves',
        name: "Ice Dragon's Talons",
        icon: '🧊',
        slot: 'hands',
        stats: { mAtk: 40, critRate: 10 }
      },
      feet: {
        id: 'ice_dragon_boots',
        name: "Ice Dragon's Steps",
        icon: '👣',
        slot: 'feet',
        stats: { mDef: 40, agi: 20, mp: 50 }
      },
      mainHand: {
        id: 'ice_dragon_staff',
        name: "Ice Dragon's Fang Staff",
        icon: '🏒',
        slot: 'mainHand',
        stats: { mAtk: 100, int: 25, critDmg: 25 }
      }
    },
    
    setBonuses: {
      2: { name: '2-Piece', effect: '+20% Ice Damage', stats: { iceDmg: 20 } },
      4: { name: '4-Piece', effect: '+25% M.DEF, 15% chance to freeze attackers', stats: { mDef: 25 }, special: 'frost_shield' },
      5: { name: '5-Piece', effect: 'Dragon Breath: Skills have 20% chance for bonus ice AoE', special: 'dragon_breath' }
    }
  },
  
  // ============================================================
  // SET 4: Architect's Design (Level 50)
  // ============================================================
  architect_set: {
    id: 'architect_set',
    name: "Architect's Design",
    description: 'Created by the one who designed the system',
    levelReq: 50,
    rarity: 'mythic',
    
    pieces: {
      head: {
        id: 'architect_helm',
        name: "Architect's Visage",
        icon: '🎭',
        slot: 'head',
        stats: { pAtk: 35, mAtk: 35, hp: 200, mp: 100 }
      },
      body: {
        id: 'architect_armor',
        name: "Architect's Masterwork",
        icon: '🏛️',
        slot: 'body',
        stats: { pDef: 80, mDef: 80, hp: 400 }
      },
      hands: {
        id: 'architect_gloves',
        name: "Architect's Precision",
        icon: '✋',
        slot: 'hands',
        stats: { pAtk: 45, mAtk: 45, critRate: 12 }
      },
      feet: {
        id: 'architect_boots',
        name: "Architect's Foundation",
        icon: '🦿',
        slot: 'feet',
        stats: { pDef: 45, mDef: 45, agi: 25 }
      },
      mainHand: {
        id: 'architect_weapon',
        name: "Architect's Blueprint",
        icon: '📐',
        slot: 'mainHand',
        stats: { pAtk: 120, mAtk: 120, critDmg: 40 }
      }
    },
    
    setBonuses: {
      2: { name: '2-Piece', effect: '+15% All Damage', stats: { allDmg: 15 } },
      4: { name: '4-Piece', effect: '+20% HP, +20% MP, Skills cost 15% less MP', stats: { hp: 20, mp: 20 }, special: 'mana_efficiency' },
      5: { name: '5-Piece', effect: 'System Override: Ignore 30% of enemy defense', special: 'system_override' }
    }
  },
  
  // ============================================================
  // SET 5: Absolute Being's Fragment (Level 60)
  // ============================================================
  absolute_being_set: {
    id: 'absolute_being_set',
    name: "Absolute Being's Fragment",
    description: 'A piece of the creator of all existence',
    levelReq: 60,
    rarity: 'mythic',
    
    pieces: {
      head: {
        id: 'absolute_helm',
        name: "Crown of the Absolute",
        icon: '👑✨',
        slot: 'head',
        stats: { pAtk: 50, mAtk: 50, str: 20, int: 20, hp: 300 }
      },
      body: {
        id: 'absolute_armor',
        name: "Vestments of Creation",
        icon: '✨',
        slot: 'body',
        stats: { pDef: 100, mDef: 100, hp: 500, mp: 200 }
      },
      hands: {
        id: 'absolute_gloves',
        name: "Hands of the Creator",
        icon: '🤲',
        slot: 'hands',
        stats: { pAtk: 60, mAtk: 60, critRate: 15, critDmg: 20 }
      },
      feet: {
        id: 'absolute_boots',
        name: "Steps of Eternity",
        icon: '🌟',
        slot: 'feet',
        stats: { pDef: 60, mDef: 60, agi: 30, vit: 20 }
      },
      mainHand: {
        id: 'absolute_weapon',
        name: "Will of the Absolute",
        icon: '⚡✨',
        slot: 'mainHand',
        stats: { pAtk: 150, mAtk: 150, critRate: 10, critDmg: 50 }
      }
    },
    
    setBonuses: {
      2: { name: '2-Piece', effect: '+25% All Stats', stats: { allStats: 25 } },
      4: { name: '4-Piece', effect: '+30% All Damage, +30% All Defense', stats: { allDmg: 30, allDef: 30 } },
      5: { name: '5-Piece', effect: 'Absolute Authority: Immune to control effects, 50% chance to reset skill cooldowns', special: 'absolute_authority' }
    }
  }
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Get a random piece from a set
 */
export function getRandomSetPiece(setId) {
  const set = DUNGEON_BREAK_SETS[setId];
  if (!set) return null;
  
  const pieces = Object.values(set.pieces);
  const randomPiece = pieces[Math.floor(Math.random() * pieces.length)];
  
  return {
    ...randomPiece,
    setId: set.id,
    setName: set.name,
    levelReq: set.levelReq,
    rarity: set.rarity,
    type: 'equipment'
  };
}

/**
 * Get set info by ID
 */
export function getSetInfo(setId) {
  return DUNGEON_BREAK_SETS[setId] || null;
}

/**
 * Get all sets for a level range
 */
export function getSetsForLevel(level) {
  return Object.values(DUNGEON_BREAK_SETS).filter(set => level >= set.levelReq);
}

/**
 * Calculate active set bonuses for equipped items
 */
export function calculateDungeonSetBonuses(equippedSetPieces) {
  const bonuses = {};
  
  // Count pieces per set
  const setCounts = {};
  equippedSetPieces.forEach(piece => {
    if (piece.setId) {
      setCounts[piece.setId] = (setCounts[piece.setId] || 0) + 1;
    }
  });
  
  // Apply bonuses
  Object.entries(setCounts).forEach(([setId, count]) => {
    const set = DUNGEON_BREAK_SETS[setId];
    if (!set) return;
    
    Object.entries(set.setBonuses).forEach(([pieceCount, bonus]) => {
      if (count >= parseInt(pieceCount)) {
        bonuses[`${setId}_${pieceCount}`] = {
          setName: set.name,
          ...bonus
        };
      }
    });
  });
  
  return bonuses;
}

export default DUNGEON_BREAK_SETS;
