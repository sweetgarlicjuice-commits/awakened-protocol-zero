// ============================================================
// TOWER DATA - Main Entry Point (Backward Compatible)
// ============================================================
// This file provides backward compatibility with the old towerData.js
// while using the new modular architecture internally.
//
// STRUCTURE:
// server/data/
// ├── towerData.js          <-- This file (entry point)
// ├── towers/
// │   ├── index.js          <-- Combines all tower data
// │   ├── tower1/
// │   │   ├── config.js     <-- Tower 1 settings
// │   │   ├── enemies.js    <-- Tower 1 mobs
// │   │   ├── materials.js  <-- Tower 1 materials
// │   │   └── index.js      <-- Tower 1 combined export
// │   ├── tower2/           <-- Same structure...
// │   └── ...
// └── config/
//     ├── dropRates.js      <-- Drop rate settings
//     └── enemyScaling.js   <-- Scaling formulas
// ============================================================

import { 
  TOWERS as TOWER_DATA,
  ENEMIES as ENEMY_DATA,
  TOWER_MATERIALS as MATERIAL_DATA,
  DROP_RATES as DROP_RATE_CONFIG,
  getTowerById,
  getEnemiesForFloor,
  getRandomEnemy,
  getMaterialsForTower,
  getRandomMaterial
} from './towers/index.js';

// ============================================================
// BACKWARD COMPATIBLE EXPORTS
// These match the old towerData.js structure exactly
// ============================================================

/**
 * TOWERS - Tower configurations (name, theme, levels, etc.)
 * Access: TOWERS[1], TOWERS[2], etc.
 */
export const TOWERS = {};
Object.keys(TOWER_DATA).forEach(id => {
  const tower = TOWER_DATA[id];
  TOWERS[id] = {
    id: tower.id,
    name: tower.name,
    description: tower.description,
    theme: tower.theme,
    levelRange: tower.levelRange,
    floors: tower.floors,
    lootTier: tower.lootTier,
    setName: tower.setName || tower.name, // Fallback to tower name
    requirement: tower.requirement,
    background: tower.background
  };
});

/**
 * ENEMIES - Enemies per tower
 * Access: ENEMIES.tower1.normal, ENEMIES.tower1.elite, ENEMIES.tower1.boss
 */
export const ENEMIES = ENEMY_DATA;

/**
 * TOWER_MATERIALS - Materials per tower
 * Access: TOWER_MATERIALS.tower1, TOWER_MATERIALS.tower2, etc.
 */
export const TOWER_MATERIALS = MATERIAL_DATA;

/**
 * DROP_RATES - Drop rates by enemy type
 * Access: DROP_RATES.normal, DROP_RATES.elite, DROP_RATES.boss
 */
export const DROP_RATES = {
  normal: { 
    equipment: DROP_RATE_CONFIG.combat.equipment, 
    setItem: 0.02, 
    potion: DROP_RATE_CONFIG.combat.potion 
  },
  elite: { 
    equipment: DROP_RATE_CONFIG.elite.equipment, 
    setItem: 0.08, 
    scroll: 0.02, 
    potion: DROP_RATE_CONFIG.elite.potion 
  },
  boss: { 
    equipment: DROP_RATE_CONFIG.boss.equipment, 
    setItem: 0.20, 
    rareEquipment: 0.30, 
    scroll: DROP_RATE_CONFIG.boss.hiddenScroll, 
    memoryCrystal: DROP_RATE_CONFIG.boss.memoryCrystalFragment 
  }
};

// ============================================================
// NEW HELPER EXPORTS (Optional - for enhanced functionality)
// ============================================================

export {
  getTowerById,
  getEnemiesForFloor,
  getRandomEnemy,
  getMaterialsForTower,
  getRandomMaterial
};

// ============================================================
// DEFAULT EXPORT
// ============================================================

export default {
  TOWERS,
  ENEMIES,
  TOWER_MATERIALS,
  DROP_RATES,
  // New helpers
  getTowerById,
  getEnemiesForFloor,
  getRandomEnemy,
  getMaterialsForTower,
  getRandomMaterial
};
