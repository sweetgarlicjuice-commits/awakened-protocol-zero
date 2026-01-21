// ============================================================
// COMBAT ENGINE - Skill Execution & Effect Processing
// ============================================================
// Phase 9.9.5: Fixed damage calculation
// 
// FIXES:
// 1. Added debug logging for damage calculation
// 2. Fixed defense formula (was too aggressive)
// 3. Ensured mDmg is properly read from combatStats
// 
// This file contains ONLY LOGIC, no skill data.
// All skill data comes from ../skillDatabase.js
// ============================================================

import { ALL_SKILLS, getSkill as getSkillFromDB } from '../skillDatabase.js';

// ============================================================
// ELEMENT SYSTEM
// ============================================================

export const ELEMENTS = {
  none: { icon: '', name: 'None' },
  fire: { icon: '🔥', name: 'Fire' },
  ice: { icon: '❄️', name: 'Ice' },
  lightning: { icon: '⚡', name: 'Lightning' },
  nature: { icon: '🌿', name: 'Nature' },
  earth: { icon: '🌍', name: 'Earth' },
  water: { icon: '💧', name: 'Water' },
  dark: { icon: '🌑', name: 'Dark' },
  holy: { icon: '✨', name: 'Holy' }
};

// Element weakness chart: attacker element -> weak defender elements
// Deals 25% bonus damage
export const ELEMENT_WEAKNESSES = {
  fire: ['nature', 'ice'],      // Fire melts ice, burns nature
  ice: ['lightning', 'water'],  // Ice freezes water, grounds lightning
  lightning: ['water', 'earth'], // Lightning shocks water, breaks earth
  nature: ['water', 'earth'],   // Nature absorbs water, grows from earth
  water: ['fire', 'earth'],     // Water extinguishes fire, erodes earth
  earth: ['lightning', 'fire'], // Earth grounds lightning, smothers fire
  dark: ['holy'],               // Dark corrupts holy
  holy: ['dark']                // Holy purifies dark
};

// Element resistance: element -> resistant against
export const ELEMENT_RESISTANCES = {
  fire: ['fire'],
  ice: ['ice'],
  lightning: ['lightning'],
  nature: ['nature'],
  water: ['water'],
  earth: ['earth'],
  dark: ['dark'],
  holy: ['holy']
};

// ============================================================
// DOT (Damage Over Time) TYPES
// ============================================================

export const DOT_TYPES = {
  burn: { 
    icon: '🔥', 
    name: 'Burn', 
    element: 'fire',
    message: (name, dmg) => `${name} burns for ${dmg} damage!`
  },
  poison: { 
    icon: '☠️', 
    name: 'Poison', 
    element: 'nature',
    message: (name, dmg) => `${name} takes ${dmg} poison damage!`
  },
  bleed: { 
    icon: '🩸', 
    name: 'Bleed', 
    element: 'none',
    message: (name, dmg) => `${name} bleeds for ${dmg} damage!`
  },
  frostbite: {
    icon: '❄️',
    name: 'Frostbite',
    element: 'ice',
    message: (name, dmg) => `${name} takes ${dmg} frostbite damage!`
  }
};

// ============================================================
// CONTROL EFFECTS
// ============================================================

export const CONTROL_TYPES = {
  stun: {
    icon: '💫',
    name: 'Stunned',
    skipTurn: true,
    message: (name) => `${name} is stunned and cannot act!`
  },
  freeze: {
    icon: '🧊',
    name: 'Frozen',
    skipTurn: true,
    message: (name) => `${name} is frozen solid!`
  },
  sleep: {
    icon: '💤',
    name: 'Asleep',
    skipTurn: true,
    breakOnDamage: true,
    message: (name) => `${name} is asleep!`
  },
  silence: {
    icon: '🔇',
    name: 'Silenced',
    blockSkills: true,
    message: (name) => `${name} is silenced and cannot use skills!`
  }
};

// ============================================================
// SKILL LOOKUP
// ============================================================

/**
 * Get skill from database with fallback to basic attack
 */
export function getSkill(skillId) {
  const skill = getSkillFromDB(skillId);
  if (skill) return skill;
  
  // Fallback basic attack
  return {
    id: 'basicAttack',
    name: 'Attack',
    class: 'any',
    element: 'none',
    mpCost: 0,
    type: 'damage',
    scaling: { stat: 'pDmg', multiplier: 1.0 },
    effects: [],
    description: 'Basic attack. 100% P.DMG.',
    hits: 1
  };
}

// ============================================================
// DAMAGE CALCULATION - PHASE 9.9.5 FIX
// ============================================================

/**
 * Calculate base damage for a skill
 * @param {Object} skill - Skill definition from database
 * @param {Object} combatStats - Player's combat stats (pDmg, mDmg, etc.)
 * @param {Object} target - Target enemy
 * @param {Array} playerBuffs - Active player buffs
 * @param {Array} targetDebuffs - Active debuffs on target
 * @returns {Object} { baseDamage, isCrit, finalDamage, hits, damageType }
 */
export function calculateSkillDamage(skill, combatStats, target, playerBuffs = [], targetDebuffs = []) {
  // ============================================================
  // DEBUG: Log input values
  // ============================================================
  console.log('[calculateSkillDamage] ========== START ==========');
  console.log('[calculateSkillDamage] Skill:', skill?.id, skill?.name);
  console.log('[calculateSkillDamage] Skill scaling:', JSON.stringify(skill?.scaling));
  console.log('[calculateSkillDamage] combatStats:', JSON.stringify(combatStats));
  console.log('[calculateSkillDamage] Target:', target?.name, 'def:', target?.def, 'mDef:', target?.mDef);
  
  if (!skill.scaling || skill.type !== 'damage') {
    console.log('[calculateSkillDamage] No scaling or not damage type, returning 0');
    return { baseDamage: 0, isCrit: false, finalDamage: 0, hits: 0, damageType: 'none' };
  }

  const scaling = skill.scaling;
  const hits = skill.hits || 1;
  
  // ============================================================
  // FIX: Properly get base stat (pDmg or mDmg)
  // The scaling.stat should be 'pDmg' or 'mDmg'
  // ============================================================
  const statKey = scaling.stat; // 'pDmg' or 'mDmg'
  const baseStat = combatStats[statKey] || combatStats.pDmg || 10;
  
  console.log('[calculateSkillDamage] statKey:', statKey);
  console.log('[calculateSkillDamage] baseStat (combatStats[' + statKey + ']):', baseStat);
  console.log('[calculateSkillDamage] multiplier:', scaling.multiplier);
  
  let damage = Math.floor(baseStat * scaling.multiplier);
  console.log('[calculateSkillDamage] Raw damage (baseStat * multiplier):', damage);
  
  // Damage type for log messages
  const damageType = scaling.stat === 'mDmg' ? 'M.DMG' : 'P.DMG';
  
  // === BUFF MODIFIERS ===
  let damageMultiplier = 1.0;
  let critRateBonus = 0;
  let critDmgBonus = 0;
  let armorPenBonus = 0;
  
  playerBuffs.forEach(buff => {
    if (buff.type === 'pDmgUp' && scaling.stat === 'pDmg') damageMultiplier += buff.value / 100;
    if (buff.type === 'mDmgUp' && scaling.stat === 'mDmg') damageMultiplier += buff.value / 100;
    if (buff.type === 'atkUp') damageMultiplier += buff.value / 100;
    if (buff.type === 'critRateUp') critRateBonus += buff.value;
    if (buff.type === 'critDmgUp') critDmgBonus += buff.value;
    if (buff.type === 'vanish') {
      damageMultiplier += 1.0; // +100% damage from vanish
      critRateBonus += 100;    // Guaranteed crit
    }
  });
  
  console.log('[calculateSkillDamage] damageMultiplier from buffs:', damageMultiplier);
  
  // === SKILL EFFECT MODIFIERS ===
  skill.effects?.forEach(effect => {
    if (effect.type === 'critBonus') critRateBonus += effect.value;
    if (effect.type === 'armorPen') armorPenBonus += effect.value;
  });
  
  // === TARGET DEBUFF MODIFIERS ===
  let targetDefReduction = 0;
  let damageTakenMultiplier = 1.0;
  
  targetDebuffs.forEach(debuff => {
    if (debuff.type === 'defDown') targetDefReduction += debuff.value;
    if (debuff.type === 'damageTakenUp') damageTakenMultiplier += debuff.value / 100;
    if (debuff.type === 'critReceivedUp') critRateBonus += debuff.value;
  });
  
  // === ELEMENT WEAKNESS BONUS ===
  let elementMultiplier = 1.0;
  if (skill.element && skill.element !== 'none' && target.element) {
    const weaknesses = ELEMENT_WEAKNESSES[skill.element] || [];
    if (weaknesses.includes(target.element)) {
      elementMultiplier = 1.25; // 25% bonus damage
    }
    const resistances = ELEMENT_RESISTANCES[target.element] || [];
    if (resistances.includes(skill.element)) {
      elementMultiplier = 0.75; // 25% reduced damage
    }
  }
  
  console.log('[calculateSkillDamage] elementMultiplier:', elementMultiplier);
  
  // === DEFENSE CALCULATION ===
  // Use mDef for magical damage, def/pDef for physical
  const targetDef = scaling.stat === 'mDmg' 
    ? (target.mDef || target.def || 0)
    : (target.def || target.pDef || 0);
  
  console.log('[calculateSkillDamage] targetDef (before reduction):', targetDef);
  
  // Apply armor penetration and def reduction
  const effectiveDef = Math.max(0, targetDef * (1 - armorPenBonus / 100) * (1 - targetDefReduction / 100));
  
  // ============================================================
  // FIX: Use a more balanced defense formula
  // Old formula: defReduction = def / (def + 100) - way too aggressive at high def
  // New formula: defReduction = def / (def + 150 + damage*0.5) - scales with damage
  // This ensures high damage skills aren't negated by low defense
  // ============================================================
  const defReduction = effectiveDef / (effectiveDef + 150 + damage * 0.3);
  
  console.log('[calculateSkillDamage] effectiveDef:', effectiveDef);
  console.log('[calculateSkillDamage] defReduction (%):', (defReduction * 100).toFixed(2) + '%');
  
  // === CRIT CALCULATION ===
  const critRate = Math.min(80, (combatStats.critRate || 5) + critRateBonus);
  const critDmg = (combatStats.critDmg || 150) + critDmgBonus;
  const isCrit = Math.random() * 100 < critRate;
  
  // === FINAL DAMAGE ===
  damage = Math.floor(damage * damageMultiplier * elementMultiplier * damageTakenMultiplier);
  console.log('[calculateSkillDamage] After multipliers:', damage);
  
  damage = Math.floor(damage * (1 - defReduction));
  console.log('[calculateSkillDamage] After defense reduction:', damage);
  
  if (isCrit) {
    damage = Math.floor(damage * critDmg / 100);
    console.log('[calculateSkillDamage] After crit (critDmg=' + critDmg + '%):', damage);
  }
  
  // Minimum damage
  damage = Math.max(1, damage);
  
  const result = {
    baseDamage: damage,
    isCrit,
    finalDamage: damage * hits,
    perHit: damage,
    hits,
    damageType,
    element: skill.element,
    elementIcon: ELEMENTS[skill.element]?.icon || ''
  };
  
  console.log('[calculateSkillDamage] FINAL RESULT:', JSON.stringify(result));
  console.log('[calculateSkillDamage] ========== END ==========');
  
  return result;
}

// ============================================================
// EFFECT HANDLERS
// ============================================================

const EFFECT_HANDLERS = {
  // Damage over Time (DoT)
  dot: (effect, damage, combatStats, target, character, skill) => {
    const baseDmg = combatStats[skill.scaling?.stat] || combatStats.pDmg || 10;
    const dotDamage = Math.floor(baseDmg * effect.scaling);
    return {
      type: 'dot',
      dotType: effect.dotType,
      damage: dotDamage,
      duration: effect.duration,
      icon: DOT_TYPES[effect.dotType]?.icon || '💀',
      message: `Applied ${DOT_TYPES[effect.dotType]?.name || effect.dotType}: ${dotDamage}/turn for ${effect.duration}t`
    };
  },
  
  // Buffs
  buff: (effect, damage, combatStats, target, character, skill) => {
    return {
      type: 'buff',
      buffType: effect.buffType,
      value: effect.value,
      duration: effect.duration,
      target: effect.target || 'self',
      message: `+${effect.value}% ${formatBuffType(effect.buffType)} for ${effect.duration}t`
    };
  },
  
  // Debuffs
  debuff: (effect, damage, combatStats, target, character, skill) => {
    return {
      type: 'debuff',
      buffType: effect.buffType,
      value: effect.value,
      duration: effect.duration,
      target: 'enemy',
      message: `${target.name}: -${effect.value}% ${formatBuffType(effect.buffType)} for ${effect.duration}t`
    };
  },
  
  // Lifesteal
  lifesteal: (effect, damage, combatStats, target, character, skill) => {
    const healAmount = Math.floor(damage.finalDamage * effect.value / 100);
    return {
      type: 'heal',
      value: healAmount,
      target: 'self',
      message: `Lifesteal: +${healAmount} HP`
    };
  },
  
  // Shield
  shield: (effect, damage, combatStats, target, character, skill) => {
    let shieldValue = 0;
    if (effect.scalingStat === 'currentMp') {
      shieldValue = Math.floor((character.stats?.mp || 0) * effect.multiplier);
    } else if (effect.scalingStat === 'pDef') {
      shieldValue = Math.floor((combatStats.pDef || 0) * effect.multiplier);
    } else if (effect.scalingStat === 'maxHp') {
      shieldValue = Math.floor((character.stats?.maxHp || 100) * effect.multiplier);
    }
    return {
      type: 'shield',
      value: shieldValue,
      duration: effect.duration || 3,
      target: 'self',
      message: `Shield: ${shieldValue} HP`
    };
  },
  
  // Control effects (stun, freeze, silence)
  control: (effect, damage, combatStats, target, character, skill) => {
    // Check if control effect applies (some have chance)
    if (effect.chance && Math.random() > effect.chance) {
      return null;
    }
    return {
      type: 'control',
      controlType: effect.controlType,
      duration: effect.duration,
      target: 'enemy',
      icon: CONTROL_TYPES[effect.controlType]?.icon || '💫',
      message: `${target.name} is ${CONTROL_TYPES[effect.controlType]?.name || effect.controlType}!`
    };
  },
  
  // Self damage (berserker skills)
  selfDamage: (effect, damage, combatStats, target, character, skill) => {
    const selfDmg = Math.floor((character.stats?.maxHp || 100) * effect.percent / 100);
    return {
      type: 'selfDamage',
      value: selfDmg,
      target: 'self',
      message: `Self damage: -${selfDmg} HP`
    };
  },
  
  // Execute bonus (extra damage when enemy low HP)
  executeBonus: (effect, damage, combatStats, target, character, skill) => {
    const enemyHpPercent = (target.hp / (target.maxHp || target.hp)) * 100;
    if (enemyHpPercent < effect.threshold) {
      return {
        type: 'damageModifier',
        multiplier: 1 + effect.bonusMultiplier,
        message: `Execute! +${effect.bonusMultiplier * 100}% damage (enemy below ${effect.threshold}% HP)`
      };
    }
    return null;
  },
  
  // Armor penetration (handled in damage calc, but log it)
  armorPen: (effect, damage, combatStats, target, character, skill) => {
    return {
      type: 'info',
      message: `Ignores ${effect.value}% armor`
    };
  },
  
  // Crit bonus (handled in damage calc)
  critBonus: (effect, damage, combatStats, target, character, skill) => {
    return null; // Handled in calculateSkillDamage
  },
  
  // Cleanse debuffs
  cleanse: (effect, damage, combatStats, target, character, skill) => {
    return {
      type: 'cleanse',
      target: effect.target || 'self',
      message: 'Debuffs removed!'
    };
  },
  
  // Steal gold
  steal: (effect, damage, combatStats, target, character, skill) => {
    const stealPercent = effect.minPercent + Math.random() * (effect.maxPercent - effect.minPercent);
    const stolenGold = Math.floor((target.goldReward?.max || 20) * stealPercent / 100);
    return {
      type: 'steal',
      value: stolenGold,
      target: 'self',
      message: `Stole ${stolenGold} gold!`
    };
  },
  
  // Require HP threshold (Assassination)
  requireHpThreshold: (effect, damage, combatStats, target, character, skill) => {
    const enemyHpPercent = (target.hp / (target.maxHp || target.hp)) * 100;
    if (enemyHpPercent >= effect.threshold) {
      return {
        type: 'skillBlocked',
        message: `Cannot use ${skill.name} - enemy HP above ${effect.threshold}%`
      };
    }
    return null;
  },
  
  // Never miss
  neverMiss: (effect, damage, combatStats, target, character, skill) => {
    return {
      type: 'accuracy',
      value: 100,
      message: 'Attack cannot miss'
    };
  },
  
  // Reflect damage
  reflect: (effect, damage, combatStats, target, character, skill) => {
    return {
      type: 'buff',
      buffType: 'reflect',
      value: effect.value,
      duration: effect.duration,
      target: 'self',
      message: `Reflect ${effect.value}% damage for ${effect.duration}t`
    };
  }
};

/**
 * Process all effects from a skill
 */
export function processSkillEffects(skill, damageResult, combatStats, target, character) {
  const results = [];
  
  if (!skill.effects || skill.effects.length === 0) {
    return results;
  }
  
  for (const effect of skill.effects) {
    const handler = EFFECT_HANDLERS[effect.type];
    if (handler) {
      const result = handler(effect, damageResult, combatStats, target, character, skill);
      if (result) {
        results.push(result);
      }
    }
  }
  
  return results;
}

// ============================================================
// HEAL CALCULATION
// ============================================================

export function calculateHealAmount(skill, combatStats, character) {
  if (skill.type !== 'heal' || !skill.scaling) return 0;
  
  let healValue = 0;
  const scaling = skill.scaling;
  
  if (scaling.stat === 'maxHp') {
    healValue = Math.floor((character.stats?.maxHp || 100) * scaling.multiplier);
  } else if (scaling.stat === 'mDmg') {
    healValue = Math.floor((combatStats.mDmg || 50) * scaling.multiplier);
  } else if (scaling.stat === 'pDmg') {
    healValue = Math.floor((combatStats.pDmg || 50) * scaling.multiplier);
  }
  
  return healValue;
}

// ============================================================
// DOT PROCESSING (called each turn)
// ============================================================

export function processDotEffects(dots, targetName) {
  const results = [];
  let totalDamage = 0;
  
  for (const dot of dots) {
    if (dot.duration > 0) {
      totalDamage += dot.damage;
      const dotInfo = DOT_TYPES[dot.dotType] || { icon: '💀', message: (n, d) => `${n} takes ${d} damage!` };
      results.push({
        type: 'dot_tick',
        dotType: dot.dotType,
        damage: dot.damage,
        icon: dotInfo.icon,
        message: dotInfo.message(targetName, dot.damage)
      });
    }
  }
  
  return { results, totalDamage };
}

// ============================================================
// BUFF/DEBUFF TICK (called each turn)
// ============================================================

export function tickBuffs(buffs) {
  return buffs
    .map(b => ({ ...b, duration: b.duration - 1 }))
    .filter(b => b.duration > 0);
}

export function tickDots(dots) {
  return dots
    .map(d => ({ ...d, duration: d.duration - 1 }))
    .filter(d => d.duration > 0);
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function formatBuffType(buffType) {
  const formats = {
    pDmgUp: 'P.DMG',
    mDmgUp: 'M.DMG',
    atkUp: 'ATK',
    pDefUp: 'P.DEF',
    mDefUp: 'M.DEF',
    defUp: 'DEF',
    critRateUp: 'Crit Rate',
    critDmgUp: 'Crit DMG',
    evasionUp: 'Evasion',
    accuracyUp: 'Accuracy',
    atkDown: 'ATK',
    defDown: 'DEF',
    evasionDown: 'Evasion',
    allStatsDown: 'All Stats',
    damageTakenUp: 'Damage Taken'
  };
  return formats[buffType] || buffType;
}

/**
 * Format combat log message for a skill
 */
export function formatSkillMessage(skill, damage, target, effects = []) {
  const elementIcon = ELEMENTS[skill.element]?.icon || '';
  let message = `${skill.name}`;
  
  if (damage.finalDamage > 0) {
    if (damage.hits > 1) {
      message += ` hits ${target.name} ${damage.hits}x for ${damage.finalDamage} ${damage.damageType}`;
    } else {
      message += ` on ${target.name} for ${damage.finalDamage} ${damage.damageType}`;
    }
    if (elementIcon) message += ` ${elementIcon}`;
    if (damage.isCrit) message += ' CRIT!';
  }
  
  return message;
}

// ============================================================
// EXPORTS
// ============================================================

export default {
  ELEMENTS,
  ELEMENT_WEAKNESSES,
  ELEMENT_RESISTANCES,
  DOT_TYPES,
  CONTROL_TYPES,
  getSkill,
  calculateSkillDamage,
  processSkillEffects,
  calculateHealAmount,
  processDotEffects,
  tickBuffs,
  tickDots,
  formatSkillMessage
};
