// ============================================================
// TOWER 5 - Combined Data Export
// ============================================================

import TOWER5_CONFIG from './config.js';
import TOWER5_ENEMIES from './enemies.js';
import TOWER5_MATERIALS from './materials.js';

export const TOWER5 = {
  ...TOWER5_CONFIG,
  enemies: TOWER5_ENEMIES,
  materials: TOWER5_MATERIALS
};

export { TOWER5_CONFIG, TOWER5_ENEMIES, TOWER5_MATERIALS };

export default TOWER5;
