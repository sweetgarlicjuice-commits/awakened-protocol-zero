// ============================================================
// COMBAT SYSTEM - Module Index
// ============================================================
// Phase 9.7: Modular combat architecture
//
// Import from here for combat functionality:
//   import { getSkill, calculateSkillDamage } from '../data/combat/index.js';
// ============================================================

export {
  // Core functions
  getSkill,
  calculateSkillDamage,
  processSkillEffects,
  calculateHealAmount,
  processDotEffects,
  tickBuffs,
  tickDots,
  formatSkillMessage,
  
  // Constants
  ELEMENTS,
  ELEMENT_WEAKNESSES,
  ELEMENT_RESISTANCES,
  DOT_TYPES,
  CONTROL_TYPES
} from './combatEngine.js';

// Re-export skill database functions for convenience
export {
  ALL_SKILLS,
  getSkill as getSkillData,
  getSkillsForClass,
  getBaseClassSkills,
  getHiddenClassSkills,
  getAllSkillsForCharacter,
  formatSkillForDisplay
} from '../skillDatabase.js';
