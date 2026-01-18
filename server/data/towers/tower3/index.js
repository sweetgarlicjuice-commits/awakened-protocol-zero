// ============================================================
// TOWER 3 - Combined Data Export
// ============================================================

import TOWER3_CONFIG from './config.js';
import TOWER3_ENEMIES from './enemies.js';
import TOWER3_MATERIALS from './materials.js';

export const TOWER3 = {
  ...TOWER3_CONFIG,
  enemies: TOWER3_ENEMIES,
  materials: TOWER3_MATERIALS
};

export { TOWER3_CONFIG, TOWER3_ENEMIES, TOWER3_MATERIALS };

export default TOWER3;
