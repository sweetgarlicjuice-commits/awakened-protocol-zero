// ============================================================
// TOWERS INDEX - Main Entry Point
// This file combines all tower data into unified exports
// ============================================================

// Import individual towers
import { TOWER1 } from './tower1/index.js';
import { TOWER2 } from './tower2/index.js';
import { TOWER3 } from './tower3/index.js';
import { TOWER4 } from './tower4/index.js';
import { TOWER5 } from './tower5/index.js';

// Import configs
import { DROP_RATES, RARITY_WEIGHTS, GOLD_FLOOR_MULTIPLIER } from '../config/dropRates.js';
import { 
  generateScaledEnemy, 
  getTowerMultiplier,
  TOWER_MULTIPLIER_BASE 
} from '../config/enemyScaling.js';

// ============================================================
// AUTO-GENERATE TOWERS 6-10 (until custom data is added)
// ============================================================

function generatePlaceholderTower(id, config) {
  const multiplier = getTowerMultiplier(id);
  
  return {
    id,
    name: config.name,
    description: config.description,
    theme: config.theme,
    element: config.element,
    icon: config.icon,
    floors: 15,
    levelRange: config.levelRange,
    lootTier: config.lootTier,
    background: config.background,
    requirement: { tower: id - 1, cleared: true },
    boss: config.boss,
    
    // Auto-generated enemies
    enemies: {
      normal: [
        {
          id: `t${id}_guardian`,
          name: `${config.name} Guardian`,
          icon: '⚔️',
          ...generateScaledEnemy('normal', id),
          floors: [1, 2, 3, 4, 5, 6, 7, 8, 9]
        },
        {
          id: `t${id}_sentinel`,
          name: `${config.name} Sentinel`,
          icon: '🛡️',
          ...generateScaledEnemy('normal', id, {
            hp: 1200, atk: 200, def: 60, exp: 600, gold: { min: 300, max: 600 }
          }),
          floors: [5, 6, 7, 8, 9, 10, 11, 12]
        }
      ],
      elite: [
        {
          id: `t${id}_champion`,
          name: `${config.name} Champion`,
          icon: '💎',
          ...generateScaledEnemy('elite', id),
          floors: [13, 14],
          isElite: true
        }
      ],
      boss: {
        id: `t${id}_boss`,
        name: config.boss.name,
        icon: config.boss.icon,
        ...generateScaledEnemy('boss', id),
        floor: 15,
        isBoss: true
      }
    },
    
    // Placeholder materials
    materials: [
      {
        id: `${config.theme}_essence`,
        name: `${config.name} Essence`,
        icon: config.icon,
        type: 'material',
        rarity: 'uncommon',
        dropChance: 0.20,
        quantity: { min: 1, max: 2 },
        sellPrice: Math.floor(50 * multiplier),
        description: `Essence from ${config.name}.`
      },
      {
        id: `${config.theme}_core`,
        name: `${config.boss.name} Core`,
        icon: '⚫',
        type: 'material',
        rarity: 'rare',
        isBossDrop: true,
        dropChance: 0.60,
        quantity: { min: 1, max: 1 },
        sellPrice: Math.floor(200 * multiplier),
        description: `Core from the ${config.boss.name} boss.`
      }
    ]
  };
}

// Tower 6-10 placeholder configs (aligned with equipment DB)
const TOWER_6_10_CONFIGS = {
  6: {
    name: 'Infernal Fortress',
    description: 'Fortress of eternal flames and demons',
    theme: 'fire',
    element: 'fire',
    icon: '🔥',
    levelRange: { min: 50, max: 65 },
    lootTier: ['epic', 'legendary'],
    background: 'infernal',
    boss: { name: 'Arch Demon', icon: '😈' }
  },
  7: {
    name: 'Abyssal Depths',
    description: 'Underwater ruins of an ancient civilization',
    theme: 'water',
    element: 'water',
    icon: '🌊',
    levelRange: { min: 60, max: 75 },
    lootTier: ['epic', 'legendary'],
    background: 'abyssal',
    boss: { name: 'Leviathan', icon: '🐙' }
  },
  8: {
    name: 'Crystal Caverns',
    description: 'Caverns filled with sacred crystals',
    theme: 'crystal',
    element: 'holy',
    icon: '💎',
    levelRange: { min: 70, max: 85 },
    lootTier: ['legendary'],
    background: 'crystal',
    boss: { name: 'Prism Guardian', icon: '🌈' }
  },
  9: {
    name: 'Void Sanctum',
    description: 'Temple at the edge of reality',
    theme: 'void',
    element: 'dark',
    icon: '🌀',
    levelRange: { min: 80, max: 95 },
    lootTier: ['legendary'],
    background: 'void',
    boss: { name: 'Void Lord', icon: '⬛' }
  },
  10: {
    name: 'Celestial Pinnacle',
    description: 'The highest tower, realm of the divine',
    theme: 'celestial',
    element: 'holy',
    icon: '✨',
    levelRange: { min: 90, max: 100 },
    lootTier: ['legendary'],
    background: 'celestial',
    boss: { name: 'Archangel', icon: '👼' }
  }
};

// Generate placeholder towers
const TOWER6 = generatePlaceholderTower(6, TOWER_6_10_CONFIGS[6]);
const TOWER7 = generatePlaceholderTower(7, TOWER_6_10_CONFIGS[7]);
const TOWER8 = generatePlaceholderTower(8, TOWER_6_10_CONFIGS[8]);
const TOWER9 = generatePlaceholderTower(9, TOWER_6_10_CONFIGS[9]);
const TOWER10 = generatePlaceholderTower(10, TOWER_6_10_CONFIGS[10]);

// ============================================================
// COMBINED EXPORTS
// ============================================================

// All towers object (keyed by ID)
export const TOWERS = {
  1: TOWER1,
  2: TOWER2,
  3: TOWER3,
  4: TOWER4,
  5: TOWER5,
  6: TOWER6,
  7: TOWER7,
  8: TOWER8,
  9: TOWER9,
  10: TOWER10
};

// Enemies object (for backward compatibility with old towerData.js)
export const ENEMIES = {};
Object.keys(TOWERS).forEach(id => {
  ENEMIES[`tower${id}`] = TOWERS[id].enemies;
});

// Materials object (for backward compatibility)
export const TOWER_MATERIALS = {};
Object.keys(TOWERS).forEach(id => {
  TOWER_MATERIALS[`tower${id}`] = TOWERS[id].materials;
});

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Get tower by ID
 */
export function getTowerById(towerId) {
  return TOWERS[towerId] || null;
}

/**
 * Get enemies for a specific tower and floor
 */
export function getEnemiesForFloor(towerId, floor) {
  const tower = TOWERS[towerId];
  if (!tower || !tower.enemies) return [];
  
  const enemies = tower.enemies;
  const result = [];
  
  // Check normal enemies
  if (enemies.normal) {
    enemies.normal.forEach(enemy => {
      if (enemy.floors && enemy.floors.includes(floor)) {
        result.push({ ...enemy, type: 'normal' });
      }
    });
  }
  
  // Check elites
  if (enemies.elite) {
    enemies.elite.forEach(enemy => {
      if (enemy.floors && enemy.floors.includes(floor)) {
        result.push({ ...enemy, type: 'elite' });
      }
    });
  }
  
  // Check boss
  if (enemies.boss && enemies.boss.floor === floor) {
    result.push({ ...enemies.boss, type: 'boss' });
  }
  
  return result;
}

/**
 * Get random enemy for a floor
 */
export function getRandomEnemy(towerId, floor, forceBoss = false) {
  const tower = TOWERS[towerId];
  if (!tower || !tower.enemies) return null;
  
  const enemies = tower.enemies;
  
  // Boss floor check
  if (floor === 15 || forceBoss) {
    return { ...enemies.boss, type: 'boss' };
  }
  
  // Elite floors (13-14)
  if (floor >= 13 && enemies.elite && enemies.elite.length > 0) {
    // 30% chance for elite on floors 13-14
    if (Math.random() < 0.30) {
      const elites = enemies.elite.filter(e => e.floors.includes(floor));
      if (elites.length > 0) {
        return { ...elites[Math.floor(Math.random() * elites.length)], type: 'elite' };
      }
    }
  }
  
  // Normal enemies
  const available = enemies.normal.filter(e => e.floors.includes(floor));
  if (available.length === 0) return null;
  
  return { ...available[Math.floor(Math.random() * available.length)], type: 'normal' };
}

/**
 * Get materials for a tower
 */
export function getMaterialsForTower(towerId) {
  const tower = TOWERS[towerId];
  return tower?.materials || [];
}

/**
 * Get random material drop for a tower
 */
export function getRandomMaterial(towerId) {
  const materials = getMaterialsForTower(towerId);
  if (materials.length === 0) return null;
  
  // Filter by drop chance
  for (const mat of materials) {
    if (Math.random() < mat.dropChance) {
      const qty = mat.quantity 
        ? Math.floor(mat.quantity.min + Math.random() * (mat.quantity.max - mat.quantity.min + 1))
        : 1;
      return { ...mat, quantity: qty };
    }
  }
  
  return null;
}

// ============================================================
// DEFAULT EXPORT
// ============================================================

export default {
  TOWERS,
  ENEMIES,
  TOWER_MATERIALS,
  DROP_RATES,
  getTowerById,
  getEnemiesForFloor,
  getRandomEnemy,
  getMaterialsForTower,
  getRandomMaterial
};
