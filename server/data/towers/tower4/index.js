// ============================================================
// TOWER 4 - Combined Data Export
// ============================================================

import TOWER4_CONFIG from './config.js';
import TOWER4_ENEMIES from './enemies.js';
import TOWER4_MATERIALS from './materials.js';

export const TOWER4 = {
  ...TOWER4_CONFIG,
  enemies: TOWER4_ENEMIES,
  materials: TOWER4_MATERIALS
};

export { TOWER4_CONFIG, TOWER4_ENEMIES, TOWER4_MATERIALS };

export default TOWER4;
