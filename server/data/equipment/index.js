// ============================================================
// ITEMS DATABASE - Main Export
// This file combines all item modules for easy importing
// ============================================================

// Equipment
import { WEAPONS, getWeaponsByClass, getWeaponsByRarity, getWeaponsForFloor } from './weapons.js';
import { ARMOR, getArmorBySlot, getArmorByClass, getArmorByRarity } from './armor.js';
import { ACCESSORIES, getAccessoriesBySlot, getAccessoriesByRarity } from './accessories.js';
import { SETS, getSetById, getSetsByClass, getSetsByRarity, calculateSetBonuses, getItemSets } from './sets.js';

// Consumables & Materials
import { CONSUMABLES, getConsumablesByCategory, getPotions, getBuffPotions, getFood } from './consumables.js';
import { MATERIALS, getMaterialsByCategory, getMaterialsByRarity, getMaterialsByElement, getOres, getEssences, getGems, getUpgradeMaterials } from './materials.js';
import { MONSTER_DROPS, getDropsByTower, getDropsByMonster, getBossDrops, getDropsByRarity as getDropsByRarityFn } from './monster_drops.js';
import { SPECIAL_ITEMS, getHiddenClassScrolls, getScrollByHiddenClass, getScrollsByBaseClass, getKeys, getMemoryItems, getUniqueItems } from './special_items.js';

// ============================================================
// COMBINED DATABASES
// ============================================================

// All equipment (wearable)
export const EQUIPMENT = {
  ...WEAPONS,
  ...ARMOR,
  ...ACCESSORIES
};

// All items (everything)
export const ALL_ITEMS = {
  ...WEAPONS,
  ...ARMOR,
  ...ACCESSORIES,
  ...CONSUMABLES,
  ...MATERIALS,
  ...MONSTER_DROPS,
  ...SPECIAL_ITEMS
};

// ============================================================
// RARITY CONFIGURATION
// ============================================================

export const RARITIES = {
  common: { 
    name: 'Common', 
    color: '#9CA3AF', // gray
    bgColor: 'bg-gray-600',
    dropWeight: 60 
  },
  uncommon: { 
    name: 'Uncommon', 
    color: '#22C55E', // green
    bgColor: 'bg-green-600',
    dropWeight: 25 
  },
  rare: { 
    name: 'Rare', 
    color: '#3B82F6', // blue
    bgColor: 'bg-blue-600',
    dropWeight: 10 
  },
  epic: { 
    name: 'Epic', 
    color: '#A855F7', // purple
    bgColor: 'bg-purple-600',
    dropWeight: 4 
  },
  legendary: { 
    name: 'Legendary', 
    color: '#F59E0B', // orange/gold
    bgColor: 'bg-amber-500',
    dropWeight: 1 
  }
};

// ============================================================
// SLOT CONFIGURATION
// ============================================================

export const SLOTS = {
  mainHand: { name: 'Main Hand', icon: '⚔️' },
  head: { name: 'Head', icon: '⛑️' },
  body: { name: 'Body', icon: '🛡️' },
  hands: { name: 'Hands', icon: '🧤' },
  feet: { name: 'Feet', icon: '👢' },
  ring: { name: 'Ring', icon: '💍' },
  necklace: { name: 'Necklace', icon: '📿' },
  cape: { name: 'Cape', icon: '🧥' }
};

// ============================================================
// ITEM TYPE CONFIGURATION
// ============================================================

export const ITEM_TYPES = {
  weapon: { name: 'Weapon', icon: '⚔️' },
  armor: { name: 'Armor', icon: '🛡️' },
  accessory: { name: 'Accessory', icon: '💍' },
  consumable: { name: 'Consumable', icon: '🧪' },
  material: { name: 'Material', icon: '🔩' },
  scroll: { name: 'Scroll', icon: '📜' },
  key: { name: 'Key', icon: '🔑' },
  special: { name: 'Special', icon: '⭐' },
  unique: { name: 'Unique', icon: '👑' }
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Get any item by ID
 */
export const getItemById = (id) => {
  return ALL_ITEMS[id] || null;
};

/**
 * Get equipment by ID
 */
export const getEquipmentById = (id) => {
  return EQUIPMENT[id] || null;
};

/**
 * Get all equipment for a slot
 */
export const getEquipmentBySlot = (slot) => {
  return Object.values(EQUIPMENT).filter(e => e.slot === slot);
};

/**
 * Get all equipment for a class (includes 'any' class items)
 */
export const getEquipmentByClass = (className) => {
  return Object.values(EQUIPMENT).filter(e => e.class === className || e.class === 'any');
};

/**
 * Get equipment that can drop on a specific floor
 */
export const getEquipmentForFloor = (floor, className = null) => {
  let items = Object.values(EQUIPMENT).filter(e => e.dropFloor <= floor);
  if (className) {
    items = items.filter(e => e.class === className || e.class === 'any');
  }
  return items;
};

/**
 * Get items by type
 */
export const getItemsByType = (type) => {
  return Object.values(ALL_ITEMS).filter(i => i.type === type);
};

/**
 * Get random equipment drop based on rarity weights
 */
export const getRandomEquipment = (floor, className = null, forcedRarity = null) => {
  let pool = getEquipmentForFloor(floor, className);
  
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
 * Get random loot drop (any item type)
 */
export const getRandomLoot = (floor, enemyType = 'normal', towerId = 1) => {
  const loot = [];
  
  // Always have a chance for gold (handled separately)
  
  // Monster drops based on tower
  const towerDrops = getDropsByTower(towerId);
  if (towerDrops.length > 0 && Math.random() < 0.3) {
    const drop = towerDrops[Math.floor(Math.random() * towerDrops.length)];
    if (!drop.isBossDrop || enemyType === 'boss') {
      loot.push({ ...drop, quantity: 1 + Math.floor(Math.random() * 3) });
    }
  }
  
  // Consumables
  if (Math.random() < 0.15) {
    const potions = getPotions().filter(p => p.dropFloor <= floor);
    if (potions.length > 0) {
      const potion = potions[Math.floor(Math.random() * potions.length)];
      loot.push({ ...potion, quantity: 1 });
    }
  }
  
  // Equipment (based on enemy type)
  const equipChance = enemyType === 'boss' ? 0.25 : (enemyType === 'elite' ? 0.15 : 0.07);
  if (Math.random() < equipChance) {
    const equip = getRandomEquipment(floor);
    if (equip) {
      loot.push({ ...equip, quantity: 1 });
    }
  }
  
  // Materials
  if (Math.random() < 0.20) {
    const mats = Object.values(MATERIALS).filter(m => m.dropFloor <= floor);
    if (mats.length > 0) {
      const mat = mats[Math.floor(Math.random() * mats.length)];
      loot.push({ ...mat, quantity: 1 + Math.floor(Math.random() * 5) });
    }
  }
  
  // Boss-only drops
  if (enemyType === 'boss') {
    // Hidden class scroll (6% chance)
    if (Math.random() < 0.06) {
      const scrolls = getHiddenClassScrolls();
      const scroll = scrolls[Math.floor(Math.random() * scrolls.length)];
      loot.push({ ...scroll, quantity: 1 });
    }
    
    // Memory crystal fragment (10% chance)
    if (Math.random() < 0.10) {
      loot.push({ ...SPECIAL_ITEMS.memory_crystal_fragment, quantity: 1 });
    }
  }
  
  return loot;
};

/**
 * Calculate total stats from equipped items
 */
export const calculateEquipmentStats = (equippedItemIds) => {
  const stats = {
    pAtk: 0, mAtk: 0, pDef: 0, mDef: 0,
    hp: 0, mp: 0,
    str: 0, agi: 0, dex: 0, int: 0, vit: 0,
    critRate: 0, critDmg: 0
  };
  
  equippedItemIds.forEach(itemId => {
    const item = EQUIPMENT[itemId];
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
    Object.keys(setData.bonuses).forEach(stat => {
      if (stats.hasOwnProperty(stat)) {
        stats[stat] += setData.bonuses[stat];
      }
    });
  });
  
  return stats;
};

// ============================================================
// EXPORTS
// ============================================================

// Equipment
export { 
  WEAPONS, 
  ARMOR, 
  ACCESSORIES, 
  SETS,
  getWeaponsByClass,
  getWeaponsByRarity,
  getWeaponsForFloor,
  getArmorBySlot,
  getArmorByClass,
  getArmorByRarity,
  getAccessoriesBySlot,
  getAccessoriesByRarity,
  getSetById,
  getSetsByClass,
  getSetsByRarity,
  calculateSetBonuses,
  getItemSets
};

// Consumables
export {
  CONSUMABLES,
  getConsumablesByCategory,
  getPotions,
  getBuffPotions,
  getFood
};

// Materials
export {
  MATERIALS,
  getMaterialsByCategory,
  getMaterialsByRarity,
  getMaterialsByElement,
  getOres,
  getEssences,
  getGems,
  getUpgradeMaterials
};

// Monster Drops
export {
  MONSTER_DROPS,
  getDropsByTower,
  getDropsByMonster,
  getBossDrops
};

// Special Items
export {
  SPECIAL_ITEMS,
  getHiddenClassScrolls,
  getScrollByHiddenClass,
  getScrollsByBaseClass,
  getKeys,
  getMemoryItems,
  getUniqueItems
};

