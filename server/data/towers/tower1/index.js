// ============================================================
// TOWER 1 - Combined Data Export
// This file imports all Tower 1 modules
// ============================================================

import TOWER1_CONFIG from './config.js';
import TOWER1_ENEMIES from './enemies.js';
import TOWER1_MATERIALS from './materials.js';

export const TOWER1 = {
  ...TOWER1_CONFIG,
  enemies: TOWER1_ENEMIES,
  materials: TOWER1_MATERIALS
};

export { TOWER1_CONFIG, TOWER1_ENEMIES, TOWER1_MATERIALS };

export default TOWER1;
