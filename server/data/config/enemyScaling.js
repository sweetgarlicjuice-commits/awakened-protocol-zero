// ============================================================
// ENEMY SCALING CONFIGURATION
// Formulas for auto-generating tower 6-10 enemies
// Edit this to tune difficulty progression
// ============================================================

// Base multiplier per tower (1.5x per tower after tower 5)
export const TOWER_MULTIPLIER_BASE = 1.5;

// Starting tower for scaling (towers after this use formula)
export const SCALING_START_TOWER = 5;

// Base stats for auto-generated enemies (tower 6 baseline)
export const BASE_SCALED_ENEMY = {
  normal: {
    hp: 1000,
    atk: 180,
    def: 50,
    exp: 500,
    gold: { min: 250, max: 500 }
  },
  elite: {
    hp: 4000,
    atk: 300,
    def: 100,
    exp: 2000,
    gold: { min: 1000, max: 2000 }
  },
  boss: {
    hp: 15000,
    atk: 400,
    def: 150,
    exp: 8000,
    gold: { min: 4000, max: 8000 }
  }
};

// Function to calculate multiplier for a tower
export function getTowerMultiplier(towerId) {
  if (towerId <= SCALING_START_TOWER) return 1;
  return Math.pow(TOWER_MULTIPLIER_BASE, towerId - SCALING_START_TOWER);
}

// Generate scaled enemy stats
export function generateScaledEnemy(type, towerId, baseStats = null) {
  const multiplier = getTowerMultiplier(towerId);
  const base = baseStats || BASE_SCALED_ENEMY[type];
  
  return {
    baseHp: Math.floor(base.hp * multiplier),
    baseAtk: Math.floor(base.atk * multiplier),
    baseDef: Math.floor(base.def * multiplier),
    expReward: Math.floor(base.exp * multiplier),
    goldReward: {
      min: Math.floor(base.gold.min * multiplier),
      max: Math.floor(base.gold.max * multiplier)
    }
  };
}

export default {
  TOWER_MULTIPLIER_BASE,
  SCALING_START_TOWER,
  BASE_SCALED_ENEMY,
  getTowerMultiplier,
  generateScaledEnemy
};
