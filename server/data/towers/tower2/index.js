// ============================================================
// TOWER 2 - Combined Data Export
// This file imports all Tower 2 modules
// ============================================================

import TOWER2_CONFIG from './config.js';
import TOWER2_ENEMIES from './enemies.js';
import TOWER2_MATERIALS from './materials.js';

export const TOWER2 = {
  ...TOWER2_CONFIG,
  enemies: TOWER2_ENEMIES,
  materials: TOWER2_MATERIALS
};

export { TOWER2_CONFIG, TOWER2_ENEMIES, TOWER2_MATERIALS };

export default TOWER2;
