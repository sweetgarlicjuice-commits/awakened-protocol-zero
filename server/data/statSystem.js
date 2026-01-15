// ============================================================
// STAT SYSTEM - Derived Stats Calculation
// ============================================================
// Phase 7: All stats have meaningful, visible impact
// Used by: Players, Mobs, Equipment
// ============================================================

// Base stat formulas - how base stats convert to derived stats
export const STAT_FORMULAS = {
  // STR - Physical power
  str: {
    pDmg: 3,      // 1 STR = 3 Physical Damage
    pDef: 1       // 1 STR = 1 Physical Defense
  },
  // AGI - Speed and evasion
  agi: {
    critRate: 0.5,  // 1 AGI = 0.5% Crit Rate
    evasion: 0.3    // 1 AGI = 0.3% Evasion
  },
  // DEX - Precision and critical power
  dex: {
    accuracy: 0.5,  // 1 DEX = 0.5% Accuracy
    critDmg: 1      // 1 DEX = 1% Crit Damage
  },
  // INT - Magic power
  int: {
    mDmg: 4,        // 1 INT = 4 Magic Damage
    mpRegen: 0.5,   // 1 INT = 0.5 MP Regen per turn
    mDef: 1         // 1 INT = 1 Magic Defense
  },
  // VIT - Survivability
  vit: {
    maxHp: 10,      // 1 VIT = 10 Max HP
    hpRegen: 1,     // 1 VIT = 1 HP Regen per turn
    pDef: 2,        // 1 VIT = 2 Physical Defense
    mDef: 1         // 1 VIT = 1 Magic Defense
  }
};

// Base values (before any stats)
export const BASE_DERIVED_STATS = {
  pDmg: 5,        // Base physical damage
  mDmg: 5,        // Base magic damage
  pDef: 0,        // Base physical defense
  mDef: 0,        // Base magic defense
  critRate: 5,    // Base 5% crit rate
  critDmg: 150,   // Base 150% crit damage
  accuracy: 90,   // Base 90% accuracy
  evasion: 0,     // Base 0% evasion
  hpRegen: 0,     // Base HP regen per turn
  mpRegen: 0      // Base MP regen per turn
};

// ============================================================
// CALCULATE DERIVED STATS
// ============================================================
// Combines base stats + equipment bonuses into final derived stats

export function calculateDerivedStats(baseStats, equipment = null, level = 1) {
  // Start with base derived values
  const derived = { ...BASE_DERIVED_STATS };
  
  // Ensure baseStats exists
  const stats = baseStats || { str: 10, agi: 10, dex: 10, int: 10, vit: 10 };
  
  // Apply STR bonuses
  derived.pDmg += (stats.str || 0) * STAT_FORMULAS.str.pDmg;
  derived.pDef += (stats.str || 0) * STAT_FORMULAS.str.pDef;
  
  // Apply AGI bonuses
  derived.critRate += (stats.agi || 0) * STAT_FORMULAS.agi.critRate;
  derived.evasion += (stats.agi || 0) * STAT_FORMULAS.agi.evasion;
  
  // Apply DEX bonuses
  derived.accuracy += (stats.dex || 0) * STAT_FORMULAS.dex.accuracy;
  derived.critDmg += (stats.dex || 0) * STAT_FORMULAS.dex.critDmg;
  
  // Apply INT bonuses
  derived.mDmg += (stats.int || 0) * STAT_FORMULAS.int.mDmg;
  derived.mpRegen += (stats.int || 0) * STAT_FORMULAS.int.mpRegen;
  derived.mDef += (stats.int || 0) * STAT_FORMULAS.int.mDef;
  
  // Apply VIT bonuses
  derived.pDef += (stats.vit || 0) * STAT_FORMULAS.vit.pDef;
  derived.mDef += (stats.vit || 0) * STAT_FORMULAS.vit.mDef;
  derived.hpRegen += (stats.vit || 0) * STAT_FORMULAS.vit.hpRegen;
  
  // Calculate max HP/MP from base stats
  derived.maxHp = 50 + (stats.vit || 0) * STAT_FORMULAS.vit.maxHp;
  derived.maxMp = 20 + (stats.int || 0) * 5; // 1 INT = 5 Max MP
  
  // Apply equipment bonuses (Phase 9)
  if (equipment) {
    derived.pDmg += equipment.pDmg || 0;
    derived.mDmg += equipment.mDmg || 0;
    derived.pDef += equipment.pDef || 0;
    derived.mDef += equipment.mDef || 0;
    derived.critRate += equipment.critRate || 0;
    derived.critDmg += equipment.critDmg || 0;
    derived.accuracy += equipment.accuracy || 0;
    derived.evasion += equipment.evasion || 0;
    derived.hpRegen += equipment.hpRegen || 0;
    derived.mpRegen += equipment.mpRegen || 0;
    derived.maxHp += equipment.hp || 0;
    derived.maxMp += equipment.mp || 0;
  }
  
  // Level scaling bonus (small boost per level)
  const levelBonus = 1 + (level - 1) * 0.02; // +2% per level
  derived.pDmg = Math.floor(derived.pDmg * levelBonus);
  derived.mDmg = Math.floor(derived.mDmg * levelBonus);
  
  // Cap certain stats
  derived.critRate = Math.min(derived.critRate, 80);   // Max 80% crit
  derived.accuracy = Math.min(derived.accuracy, 100);  // Max 100% accuracy
  derived.evasion = Math.min(derived.evasion, 60);     // Max 60% evasion
  
  // Round values
  derived.hpRegen = Math.floor(derived.hpRegen);
  derived.mpRegen = Math.floor(derived.mpRegen);
  
  return derived;
}

// ============================================================
// CALCULATE EQUIPMENT TOTALS
// ============================================================
// Sums all equipped item stats into one object

export function calculateEquipmentStats(equipment) {
  const totals = {
    pDmg: 0, mDmg: 0, pDef: 0, mDef: 0,
    critRate: 0, critDmg: 0, accuracy: 0, evasion: 0,
    hpRegen: 0, mpRegen: 0, hp: 0, mp: 0,
    // Elemental
    elementDmg: 0,
    fireRes: 0, waterRes: 0, lightningRes: 0, earthRes: 0,
    natureRes: 0, iceRes: 0, darkRes: 0, holyRes: 0
  };
  
  if (!equipment) return totals;
  
  // Sum all equipped slots
  const slots = ['head', 'body', 'leg', 'shoes', 'leftHand', 'rightHand', 'ring', 'necklace'];
  
  slots.forEach(slot => {
    const item = equipment[slot];
    if (item && item.stats) {
      Object.keys(totals).forEach(stat => {
        if (item.stats[stat]) {
          totals[stat] += item.stats[stat];
        }
      });
    }
  });
  
  return totals;
}

// ============================================================
// GET STAT DESCRIPTION
// ============================================================
// Returns human-readable description of what each stat does

export function getStatDescription(statId) {
  const descriptions = {
    str: {
      name: 'Strength',
      icon: '💪',
      color: 'text-red-400',
      effects: [
        `+${STAT_FORMULAS.str.pDmg} Physical DMG per point`,
        `+${STAT_FORMULAS.str.pDef} Physical DEF per point`
      ]
    },
    agi: {
      name: 'Agility',
      icon: '⚡',
      color: 'text-yellow-400',
      effects: [
        `+${STAT_FORMULAS.agi.critRate}% Crit Rate per point`,
        `+${STAT_FORMULAS.agi.evasion}% Evasion per point`
      ]
    },
    dex: {
      name: 'Dexterity',
      icon: '🎯',
      color: 'text-green-400',
      effects: [
        `+${STAT_FORMULAS.dex.accuracy}% Accuracy per point`,
        `+${STAT_FORMULAS.dex.critDmg}% Crit DMG per point`
      ]
    },
    int: {
      name: 'Intelligence',
      icon: '🔮',
      color: 'text-purple-400',
      effects: [
        `+${STAT_FORMULAS.int.mDmg} Magic DMG per point`,
        `+${STAT_FORMULAS.int.mpRegen} MP Regen per point`,
        `+${STAT_FORMULAS.int.mDef} Magic DEF per point`
      ]
    },
    vit: {
      name: 'Vitality',
      icon: '❤️',
      color: 'text-pink-400',
      effects: [
        `+${STAT_FORMULAS.vit.maxHp} Max HP per point`,
        `+${STAT_FORMULAS.vit.hpRegen} HP Regen per point`,
        `+${STAT_FORMULAS.vit.pDef} Physical DEF per point`,
        `+${STAT_FORMULAS.vit.mDef} Magic DEF per point`
      ]
    }
  };
  
  return descriptions[statId] || null;
}

// ============================================================
// FORMAT DERIVED STATS FOR DISPLAY
// ============================================================

export function formatDerivedStats(derived) {
  return {
    offensive: [
      { name: 'Physical DMG', value: derived.pDmg, icon: '⚔️', color: 'text-red-400' },
      { name: 'Magic DMG', value: derived.mDmg, icon: '✨', color: 'text-purple-400' },
      { name: 'Crit Rate', value: derived.critRate.toFixed(1) + '%', icon: '🎯', color: 'text-yellow-400' },
      { name: 'Crit DMG', value: derived.critDmg + '%', icon: '💥', color: 'text-orange-400' },
      { name: 'Accuracy', value: derived.accuracy.toFixed(1) + '%', icon: '👁️', color: 'text-blue-400' }
    ],
    defensive: [
      { name: 'Physical DEF', value: derived.pDef, icon: '🛡️', color: 'text-gray-400' },
      { name: 'Magic DEF', value: derived.mDef, icon: '🔰', color: 'text-indigo-400' },
      { name: 'Evasion', value: derived.evasion.toFixed(1) + '%', icon: '💨', color: 'text-cyan-400' },
      { name: 'HP Regen', value: derived.hpRegen + '/turn', icon: '💚', color: 'text-green-400' },
      { name: 'MP Regen', value: derived.mpRegen + '/turn', icon: '💙', color: 'text-blue-400' }
    ]
  };
}

// ============================================================
// APPLY BUFF MODIFIERS TO DERIVED STATS
// ============================================================

export function applyBuffsToDerivedStats(derived, activeBuffs) {
  if (!activeBuffs || activeBuffs.length === 0) return derived;
  
  const modified = { ...derived };
  
  activeBuffs.forEach(buff => {
    switch (buff.type) {
      case 'atkUp':
        modified.pDmg = Math.floor(modified.pDmg * (1 + buff.value / 100));
        modified.mDmg = Math.floor(modified.mDmg * (1 + buff.value / 100));
        break;
      case 'pDmgUp':
        modified.pDmg = Math.floor(modified.pDmg * (1 + buff.value / 100));
        break;
      case 'mDmgUp':
        modified.mDmg = Math.floor(modified.mDmg * (1 + buff.value / 100));
        break;
      case 'defUp':
        modified.pDef = Math.floor(modified.pDef * (1 + buff.value / 100));
        modified.mDef = Math.floor(modified.mDef * (1 + buff.value / 100));
        break;
      case 'pDefUp':
        modified.pDef = Math.floor(modified.pDef * (1 + buff.value / 100));
        break;
      case 'mDefUp':
        modified.mDef = Math.floor(modified.mDef * (1 + buff.value / 100));
        break;
      case 'critRateUp':
        modified.critRate = Math.min(80, modified.critRate + buff.value);
        break;
      case 'critDmgUp':
        modified.critDmg += buff.value;
        break;
      case 'evasionUp':
        modified.evasion = Math.min(60, modified.evasion + buff.value);
        break;
      case 'accuracyUp':
        modified.accuracy = Math.min(100, modified.accuracy + buff.value);
        break;
      // Debuffs (negative values)
      case 'atkDown':
        modified.pDmg = Math.floor(modified.pDmg * (1 - buff.value / 100));
        modified.mDmg = Math.floor(modified.mDmg * (1 - buff.value / 100));
        break;
      case 'defDown':
        modified.pDef = Math.floor(modified.pDef * (1 - buff.value / 100));
        modified.mDef = Math.floor(modified.mDef * (1 - buff.value / 100));
        break;
      case 'allStatsDown':
        modified.pDmg = Math.floor(modified.pDmg * (1 - buff.value / 100));
        modified.mDmg = Math.floor(modified.mDmg * (1 - buff.value / 100));
        modified.pDef = Math.floor(modified.pDef * (1 - buff.value / 100));
        modified.mDef = Math.floor(modified.mDef * (1 - buff.value / 100));
        break;
    }
  });
  
  // Ensure no negative values
  modified.pDmg = Math.max(1, modified.pDmg);
  modified.mDmg = Math.max(1, modified.mDmg);
  modified.pDef = Math.max(0, modified.pDef);
  modified.mDef = Math.max(0, modified.mDef);
  
  return modified;
}

export default {
  STAT_FORMULAS,
  BASE_DERIVED_STATS,
  calculateDerivedStats,
  calculateEquipmentStats,
  getStatDescription,
  formatDerivedStats,
  applyBuffsToDerivedStats
};
