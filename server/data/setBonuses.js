// ============================================================
// SET BONUSES AGGREGATOR
// ============================================================
// Phase 9.9.4: Centralized set bonus definitions
// 
// This file imports set bonuses from all sources and exports
// a unified SET_BONUS_DEFINITIONS object for use in Character.js
//
// ADDING NEW SETS:
// 1. Add sets to tower files, vipEquipment.js, or dungeonBreakSets.js
// 2. Sets are automatically picked up - no changes needed here!
// ============================================================

import { TOWER1 } from './equipment/towers/tower1.js';
import { TOWER2 } from './equipment/towers/tower2.js';
import { TOWER3 } from './equipment/towers/tower3.js';
import { TOWER4 } from './equipment/towers/tower4.js';
import { TOWER5 } from './equipment/towers/tower5.js';
import { VIP_SETS } from './equipment/vipEquipment.js';
import { DUNGEON_BREAK_SETS } from './equipment/dungeonBreakSets.js';

// ============================================================
// BUILD SET BONUS DEFINITIONS
// ============================================================

const SET_BONUS_DEFINITIONS = {};

// Helper to extract stats from bonus object (handles both formats)
function extractStats(bonus) {
  // Format 1: { pAtk: 10, hp: 50, description: '...' }
  // Format 2: { name: '...', effect: '...', stats: { pAtk: 10 } }
  if (bonus.stats) {
    return { ...bonus.stats };
  }
  // Remove non-stat keys
  const stats = { ...bonus };
  delete stats.description;
  delete stats.name;
  delete stats.effect;
  delete stats.special;
  return stats;
}

// ============================================================
// IMPORT TOWER SETS
// ============================================================
const TOWERS = [TOWER1, TOWER2, TOWER3, TOWER4, TOWER5];

let towerSetCount = 0;
TOWERS.forEach((tower, towerIndex) => {
  if (tower && tower.sets) {
    // Tower sets are organized by class
    Object.values(tower.sets).forEach(set => {
      if (set.id && set.bonuses) {
        SET_BONUS_DEFINITIONS[set.id] = {};
        Object.entries(set.bonuses).forEach(([threshold, bonus]) => {
          SET_BONUS_DEFINITIONS[set.id][threshold] = extractStats(bonus);
        });
        towerSetCount++;
      }
    });
  }
});

// ============================================================
// IMPORT VIP SETS
// ============================================================
let vipSetCount = 0;
if (VIP_SETS) {
  Object.values(VIP_SETS).forEach(set => {
    if (set.id && set.setBonus) {
      SET_BONUS_DEFINITIONS[set.id] = {};
      Object.entries(set.setBonus).forEach(([threshold, bonus]) => {
        SET_BONUS_DEFINITIONS[set.id][threshold] = extractStats(bonus);
      });
      vipSetCount++;
      // Debug log
      console.log(`[SetBonuses] Loaded VIP set: ${set.id}`, SET_BONUS_DEFINITIONS[set.id]);
    }
  });
}

// ============================================================
// IMPORT DUNGEON BREAK SETS
// ============================================================
let dungeonSetCount = 0;
if (DUNGEON_BREAK_SETS) {
  Object.values(DUNGEON_BREAK_SETS).forEach(set => {
    if (set.id && set.setBonuses) {
      SET_BONUS_DEFINITIONS[set.id] = {};
      Object.entries(set.setBonuses).forEach(([threshold, bonus]) => {
        SET_BONUS_DEFINITIONS[set.id][threshold] = extractStats(bonus);
      });
      dungeonSetCount++;
    }
  });
}

// ============================================================
// STARTUP LOG
// ============================================================
console.log(`[SetBonuses] Loaded ${Object.keys(SET_BONUS_DEFINITIONS).length} total sets:`);
console.log(`  - Tower sets: ${towerSetCount}`);
console.log(`  - VIP sets: ${vipSetCount}`);
console.log(`  - Dungeon Break sets: ${dungeonSetCount}`);

// Log VIP set definitions specifically for debugging
if (SET_BONUS_DEFINITIONS['vip_premium_set']) {
  console.log('[SetBonuses] vip_premium_set bonuses:', JSON.stringify(SET_BONUS_DEFINITIONS['vip_premium_set'], null, 2));
}
if (SET_BONUS_DEFINITIONS['vip_starter_set']) {
  console.log('[SetBonuses] vip_starter_set bonuses:', JSON.stringify(SET_BONUS_DEFINITIONS['vip_starter_set'], null, 2));
}

// ============================================================
// EXPORT
// ============================================================

export { SET_BONUS_DEFINITIONS };

export default SET_BONUS_DEFINITIONS;
