// ============================================================
// DROP RATES CONFIGURATION
// Edit this file to tune drop rates
// ============================================================

export const DROP_RATES = {
  // Regular combat encounters
  combat: {
    equipment: 0.07,      // 7% - chance for equipment drop
    material: 0.18,       // 18% - chance for material drop
    potion: 0.20,         // 20% - chance for potion drop
    gold: { min: 5, max: 15 }  // Base gold range (multiplied by floor)
  },
  
  // Elite enemies
  elite: {
    equipment: 0.15,      // 15%
    material: 0.30,       // 30%
    potion: 0.20,         // 20%
    gold: { min: 15, max: 40 }
  },
  
  // Boss encounters
  boss: {
    equipment: 0.25,            // 25%
    hiddenScroll: 0.06,         // 6% - hidden class scroll
    memoryCrystalFragment: 0.10, // 10% - memory crystal fragment
    material: 0.50,             // 50%
    potion: 0.20,               // 20%
    gold: { min: 50, max: 150 }
  }
};

// Rarity weights for random equipment selection
export const RARITY_WEIGHTS = {
  common: 60,
  uncommon: 25,
  rare: 10,
  epic: 4,
  legendary: 1
};

// Floor-based gold multiplier
export const GOLD_FLOOR_MULTIPLIER = 2; // gold += floor * multiplier

export default {
  DROP_RATES,
  RARITY_WEIGHTS,
  GOLD_FLOOR_MULTIPLIER
};
