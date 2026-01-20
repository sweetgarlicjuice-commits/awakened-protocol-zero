// ============================================================
// EQUIPMENT DATABASE v2 - Tower-Based System
// Main index file - imports all towers and provides helpers
// ============================================================

import { TOWER1 } from './towers/tower1.js';
import { TOWER2 } from './towers/tower2.js';
import { TOWER3 } from './towsers/tower3.js';
import { TOWER4 } from './towers/tower4.js';
import { TOWER5 } from './towers/tower5.js';
// Future towers (6-10) - uncomment when ready
// import { TOWER6 } from './towers/tower6.js';
// import { TOWER7 } from './towers/tower7.js';
// import { TOWER8 } from './towers/tower8.js';
// import { TOWER9 } from './towers/tower9.js';
// import { TOWER10 } from './towers/tower10.js';

import { TOWER_CONFIGS, TOWER_STAT_SCALING, CLASSES } from './towerConfigs.js';
import { HIDDEN_CLASS_SCROLLS, HIDDEN_CLASS_SCROLL_HELPERS } from './special_items.js';
import { CONSUMABLES } from './consumables.js';

// ============================================================
// PHASE 9.9.4: VIP EQUIPMENT IMPORTS
// VIP items are GM-only granted, not dropped from towers
// ============================================================
import { 
  VIP_EQUIPMENT, 
  VIP_SETS, 
  getVipItemById, 
  getVipSetById,
  getAllVipItems,
  getAllVipSets,
  getVipSetPieces
} from './vipEquipment.js';

// ============================================================
// ALL TOWERS
// ============================================================

export const TOWERS = {
  1: TOWER1,
  2: TOWER2,
  3: TOWER3,
  4: TOWER4,
  5: TOWER5,
  // Towers 6-10 will be added in future updates
  // 6: TOWER6,
  // 7: TOWER7,
  // 8: TOWER8,
  // 9: TOWER9,
  // 10: TOWER10,
};

// ============================================================
// RARITY CONFIGURATION
// ============================================================

export const RARITIES = {
  common: { name: 'Common', color: '#9CA3AF', bgColor: 'bg-gray-500', dropWeight: 60 },
  uncommon: { name: 'Uncommon', color: '#22C55E', bgColor: 'bg-green-500', dropWeight: 25 },
  rare: { name: 'Rare', color: '#3B82F6', bgColor: 'bg-blue-500', dropWeight: 10 },
  epic: { name: 'Epic', color: '#A855F7', bgColor: 'bg-purple-500', dropWeight: 4 },
  legendary: { name: 'Legendary', color: '#F59E0B', bgColor: 'bg-amber-500', dropWeight: 1 }
};

// ============================================================
// SLOT CONFIGURATION
// ============================================================

export const SLOTS = {
  mainHand: { name: 'Weapon', icon: '⚔️' },
  head: { name: 'Head', icon: '🧢' },
  body: { name: 'Body', icon: '👕' },
  hands: { name: 'Hands', icon: '🧤' },
  feet: { name: 'Feet', icon: '👢' },
  ring: { name: 'Ring', icon: '💍' },
  necklace: { name: 'Necklace', icon: '📿' },
  cape: { name: 'Cape', icon: '🧥' }
};

// ============================================================
// COMBINED EQUIPMENT DATABASE
// Flattens all tower equipment into single lookup
// ============================================================

const buildEquipmentDatabase = () => {
  const db = {};
  
  Object.values(TOWERS).forEach(tower => {
    // Add weapons from all classes
    Object.values(tower.weapons).forEach(weapons => {
      weapons.forEach(w => { db[w.id] = { ...w, tower: tower.id }; });
    });
    
    // Add armor
    tower.armor.forEach(a => { db[a.id] = { ...a, tower: tower.id }; });
    
    // Add accessories
    tower.accessories.forEach(a => { db[a.id] = { ...a, tower: tower.id }; });
  });
  
  return db;
};

export const EQUIPMENT = buildEquipmentDatabase();

// ============================================================
// SETS DATABASE
// ============================================================

const buildSetsDatabase = () => {
  const db = {};
  
  Object.values(TOWERS).forEach(tower => {
    Object.values(tower.sets).forEach(set => {
      db[set.id] = { ...set, tower: tower.id };
    });
  });
  
  return db;
};

export const SETS = buildSetsDatabase();

// ============================================================
// MATERIALS DATABASE
// ============================================================

const buildMaterialsDatabase = () => {
  const db = {};
  
  Object.values(TOWERS).forEach(tower => {
    if (tower.monsterDrops) {
      tower.monsterDrops.forEach(drop => {
        db[drop.id] = { ...drop, tower: tower.id };
      });
    }
  });
  
  return db;
};

export const MATERIALS = buildMaterialsDatabase();

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Get equipment by ID
 * PHASE 9.9.4: Now also checks VIP equipment
 */
export const getEquipmentById = (id) => {
  // Check regular equipment first
  if (EQUIPMENT[id]) return EQUIPMENT[id];
  
  // Check VIP equipment
  if (VIP_EQUIPMENT[id]) return VIP_EQUIPMENT[id];
  
  return null;
};

/**
 * Get set by ID
 * PHASE 9.9.4: Now also checks VIP sets
 */
export const getSetById = (id) => {
  // Check regular sets first
  if (SETS[id]) return SETS[id];
  
  // Check VIP sets
  if (VIP_SETS[id]) return VIP_SETS[id];
  
  return null;
};

/**
 * Get tower data by ID
 */
export const getTowerById = (id) => TOWERS[id] || null;

/**
 * Get all equipment for a specific tower
 */
export const getEquipmentByTower = (towerId) => {
  return Object.values(EQUIPMENT).filter(e => e.tower === towerId);
};

/**
 * Get equipment by slot
 */
export const getEquipmentBySlot = (slot) => {
  return Object.values(EQUIPMENT).filter(e => e.slot === slot);
};

/**
 * Get weapons for a specific class
 */
export const getWeaponsByClass = (className) => {
  return Object.values(EQUIPMENT).filter(e => 
    e.slot === 'mainHand' && (e.class === className || e.class === 'any')
  );
};

/**
 * Get equipment for a floor (respects level requirements)
 */
export const getEquipmentForFloor = (towerId, floor, playerLevel, playerClass = null) => {
  const tower = TOWERS[towerId];
  if (!tower) return [];
  
  const allEquip = getEquipmentByTower(towerId);
  
  return allEquip.filter(e => {
    // Check floor range
    const [minFloor, maxFloor] = e.dropFloor;
    if (floor < minFloor || floor > maxFloor) return false;
    
    // Check level requirement
    if (playerLevel < e.levelReq) return false;
    
    // Check class requirement for weapons
    if (e.slot === 'mainHand' && e.class !== 'any' && playerClass && e.class !== playerClass) {
      return false;
    }
    
    return true;
  });
};

/**
 * Check if player can equip item
 * @param {Object} item - The item to check
 * @param {number} playerLevel - Player's current level
 * @param {string} playerClass - Player's class (swordsman, thief, archer, mage)
 * @param {string|null} playerHiddenClass - Player's hidden class (uses base class for requirements)
 */
export const canEquipItem = (item, playerLevel, playerClass, playerHiddenClass = null) => {
  // Check level requirement
  if (playerLevel < item.levelReq) {
    return { canEquip: false, reason: `Requires level ${item.levelReq}` };
  }
  
  // For weapons and class-specific armor, check class requirement
  if (item.class && item.class !== 'any') {
    // Hidden classes use their base class for equipment requirements
    const effectiveClass = playerHiddenClass ? getBaseClass(playerHiddenClass) : playerClass;
    
    if (item.class !== effectiveClass) {
      return { canEquip: false, reason: `Requires ${item.class} class` };
    }
  }
  
  return { canEquip: true, reason: null };
};

/**
 * Get base class for hidden class
 */
export const getBaseClass = (hiddenClass) => {
  const HIDDEN_CLASS_MAP = {
    // Swordsman hidden classes
    flameblade: 'swordsman',
    berserker: 'swordsman',
    paladin: 'swordsman',
    earthshaker: 'swordsman',
    frostguard: 'swordsman',
    // Thief hidden classes
    shadowDancer: 'thief',
    venomancer: 'thief',
    assassin: 'thief',
    phantom: 'thief',
    bloodreaper: 'thief',
    // Archer hidden classes
    stormRanger: 'archer',
    pyroArcher: 'archer',
    frostSniper: 'archer',
    natureWarden: 'archer',
    voidHunter: 'archer',
    // Mage hidden classes
    frostWeaver: 'mage',
    pyromancer: 'mage',
    stormcaller: 'mage',
    necromancer: 'mage',
    arcanist: 'mage'
  };
  
  return HIDDEN_CLASS_MAP[hiddenClass] || null;
};

/**
 * Get random equipment drop
 * NOTE: VIP equipment is NOT included in random drops
 */
export const getRandomEquipment = (towerId, floor, playerLevel, playerClass = null, forcedRarity = null) => {
  let pool = getEquipmentForFloor(towerId, floor, playerLevel, playerClass);
  
  if (forcedRarity) {
    pool = pool.filter(e => e.rarity === forcedRarity);
  }
  
  if (pool.length === 0) return null;
  
  if (forcedRarity) {
    return pool[Math.floor(Math.random() * pool.length)];
  }
  
  // Weight by rarity
  const weighted = [];
  pool.forEach(item => {
    const weight = RARITIES[item.rarity]?.dropWeight || 10;
    for (let i = 0; i < weight; i++) {
      weighted.push(item);
    }
  });
  
  return weighted[Math.floor(Math.random() * weighted.length)];
};

/**
 * Calculate total stats from equipped items
 * PHASE 9.9.4: Now supports percentage stats
 */
export const calculateEquipmentStats = (equippedItemIds) => {
  const stats = {
    // Flat stats
    pAtk: 0, mAtk: 0, pDef: 0, mDef: 0,
    hp: 0, mp: 0,
    str: 0, agi: 0, dex: 0, int: 0, vit: 0,
    critRate: 0, critDmg: 0,
    // Percentage stats (PHASE 9.9.4)
    pAtkPercent: 0, mAtkPercent: 0, pDefPercent: 0, mDefPercent: 0,
    hpPercent: 0, mpPercent: 0,
    critRatePercent: 0, critDmgPercent: 0,
    // Special bonuses
    expBonus: 0, goldBonus: 0
  };
  
  equippedItemIds.forEach(itemId => {
    // Check both regular and VIP equipment
    const item = getEquipmentById(itemId);
    if (item?.stats) {
      Object.keys(item.stats).forEach(stat => {
        if (stats.hasOwnProperty(stat)) {
          stats[stat] += item.stats[stat];
        }
      });
    }
  });
  
  // Add set bonuses
  const setBonuses = calculateSetBonuses(equippedItemIds);
  Object.values(setBonuses).forEach(setData => {
    Object.keys(setData.activeBonuses).forEach(stat => {
      if (stats.hasOwnProperty(stat)) {
        stats[stat] += setData.activeBonuses[stat];
      }
    });
  });
  
  return stats;
};

/**
 * Calculate active set bonuses
 * PHASE 9.9.4: Now also checks VIP sets
 */
export const calculateSetBonuses = (equippedItemIds) => {
  const result = {};
  
  // Check regular sets
  Object.values(SETS).forEach(set => {
    const matchingPieces = set.pieces.filter(pieceId => equippedItemIds.includes(pieceId));
    const count = matchingPieces.length;
    
    if (count >= 2) {
      const activeBonuses = {};
      const activeDescriptions = [];
      
      Object.keys(set.bonuses).forEach(threshold => {
        if (count >= parseInt(threshold)) {
          const bonus = set.bonuses[threshold];
          Object.keys(bonus).forEach(key => {
            if (key !== 'description') {
              activeBonuses[key] = (activeBonuses[key] || 0) + bonus[key];
            } else {
              activeDescriptions.push(`(${threshold}pc) ${bonus.description}`);
            }
          });
        }
      });
      
      result[set.id] = {
        name: set.name,
        icon: set.icon,
        pieces: count,
        totalPieces: set.pieces.length,
        activeBonuses,
        activeDescriptions,
        class: set.class,
        tower: set.tower
      };
    }
  });
  
  // PHASE 9.9.4: Check VIP sets
  Object.values(VIP_SETS).forEach(set => {
    const matchingPieces = set.pieces.filter(pieceId => equippedItemIds.includes(pieceId));
    const count = matchingPieces.length;
    
    if (count >= 2 && set.setBonus) {
      const activeBonuses = {};
      const activeDescriptions = [];
      
      Object.keys(set.setBonus).forEach(threshold => {
        if (count >= parseInt(threshold)) {
          const bonus = set.setBonus[threshold];
          Object.keys(bonus).forEach(key => {
            if (key !== 'description') {
              activeBonuses[key] = (activeBonuses[key] || 0) + bonus[key];
            } else {
              activeDescriptions.push(`(${threshold}pc) ${bonus.description}`);
            }
          });
        }
      });
      
      result[set.id] = {
        name: set.name,
        icon: '🎁',
        pieces: count,
        totalPieces: set.pieces.length,
        activeBonuses,
        activeDescriptions,
        isVIP: true
      };
    }
  });
  
  return result;
};

/**
 * Get all sets for a class (including tower info)
 */
export const getSetsByClass = (className) => {
  return Object.values(SETS).filter(s => s.class === className);
};

/**
 * Get sets by tower
 */
export const getSetsByTower = (towerId) => {
  return Object.values(SETS).filter(s => s.tower === towerId);
};

/**
 * Get material by ID
 */
export const getMaterialById = (id) => MATERIALS[id] || null;

/**
 * Get materials by tower
 */
export const getMaterialsByTower = (towerId) => {
  return Object.values(MATERIALS).filter(m => m.tower === towerId);
};

// ============================================================
// EXPORTS
// ============================================================

export {
  TOWER1,
  TOWER2,
  TOWER3,
  TOWER4,
  TOWER5,
  TOWER_CONFIGS,
  TOWER_STAT_SCALING,
  CLASSES,
  HIDDEN_CLASS_SCROLLS,
  HIDDEN_CLASS_SCROLL_HELPERS,
  CONSUMABLES,
  // PHASE 9.9.4: VIP Equipment exports
  VIP_EQUIPMENT,
  VIP_SETS,
  getVipItemById,
  getVipSetById,
  getAllVipItems,
  getAllVipSets,
  getVipSetPieces
};

export default {
  TOWERS,
  EQUIPMENT,
  SETS,
  MATERIALS,
  RARITIES,
  SLOTS,
  TOWER_CONFIGS,
  HIDDEN_CLASS_SCROLLS,
  CONSUMABLES,
  // PHASE 9.9.4: VIP exports
  VIP_EQUIPMENT,
  VIP_SETS
};
