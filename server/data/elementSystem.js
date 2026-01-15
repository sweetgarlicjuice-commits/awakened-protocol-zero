// ============================================================
// ELEMENT SYSTEM - Elemental Damage & Resistances
// ============================================================
// Phase 7: 8 Elements with rock-paper-scissors style matchups
// Used by: Skills, Mobs, Equipment
// ============================================================

// All available elements
export const ELEMENTS = {
  none: {
    id: 'none',
    name: 'None',
    icon: '⚪',
    color: 'text-gray-400',
    strongAgainst: [],
    weakAgainst: [],
    statusEffect: null
  },
  fire: {
    id: 'fire',
    name: 'Fire',
    icon: '🔥',
    color: 'text-orange-400',
    strongAgainst: ['nature', 'ice'],
    weakAgainst: ['water'],
    statusEffect: 'burn'
  },
  water: {
    id: 'water',
    name: 'Water',
    icon: '💧',
    color: 'text-blue-400',
    strongAgainst: ['fire'],
    weakAgainst: ['lightning'],
    statusEffect: 'wet'
  },
  lightning: {
    id: 'lightning',
    name: 'Lightning',
    icon: '⚡',
    color: 'text-yellow-400',
    strongAgainst: ['water'],
    weakAgainst: ['earth'],
    statusEffect: 'shock'
  },
  earth: {
    id: 'earth',
    name: 'Earth',
    icon: '🌍',
    color: 'text-amber-600',
    strongAgainst: ['lightning'],
    weakAgainst: ['nature'],
    statusEffect: 'shatter'
  },
  nature: {
    id: 'nature',
    name: 'Nature',
    icon: '🌿',
    color: 'text-green-400',
    strongAgainst: ['water', 'earth'],
    weakAgainst: ['fire', 'ice'],
    statusEffect: 'poison'
  },
  ice: {
    id: 'ice',
    name: 'Ice',
    icon: '❄️',
    color: 'text-cyan-300',
    strongAgainst: ['nature'],
    weakAgainst: ['fire'],
    statusEffect: 'chill'
  },
  dark: {
    id: 'dark',
    name: 'Dark',
    icon: '🌑',
    color: 'text-purple-600',
    strongAgainst: ['holy'],
    weakAgainst: ['holy'],
    statusEffect: 'curse'
  },
  holy: {
    id: 'holy',
    name: 'Holy',
    icon: '✨',
    color: 'text-yellow-200',
    strongAgainst: ['dark'],
    weakAgainst: ['dark'],
    statusEffect: 'blessed'
  }
};

// Element damage multipliers
export const ELEMENT_MULTIPLIERS = {
  strong: 1.5,      // 150% damage when strong against
  weak: 0.5,        // 50% damage when weak against
  same: 0.75,       // 75% damage when same element (resistance)
  neutral: 1.0      // 100% normal damage
};

// ============================================================
// STATUS EFFECTS FROM ELEMENTS
// ============================================================

export const ELEMENT_STATUS_EFFECTS = {
  burn: {
    id: 'burn',
    name: 'Burn',
    icon: '🔥',
    type: 'dot',           // Damage over time
    description: 'Takes fire damage each turn',
    defaultDuration: 3,
    scaling: 'mDmg',       // Scales with magic damage
    baseMultiplier: 0.2    // 20% of mDmg per turn
  },
  wet: {
    id: 'wet',
    name: 'Wet',
    icon: '💧',
    type: 'debuff',
    description: 'Physical Defense reduced',
    defaultDuration: 2,
    effect: 'pDefDown',
    value: 20              // -20% P.DEF
  },
  shock: {
    id: 'shock',
    name: 'Shock',
    icon: '⚡',
    type: 'control',
    description: 'Chance to skip turn',
    defaultDuration: 2,
    skipChance: 0.15       // 15% chance to skip turn each turn
  },
  shatter: {
    id: 'shatter',
    name: 'Shatter',
    icon: '💔',
    type: 'debuff',
    description: 'All Defense reduced',
    defaultDuration: 2,
    effect: 'defDown',
    value: 25              // -25% all DEF
  },
  poison: {
    id: 'poison',
    name: 'Poison',
    icon: '🐍',
    type: 'dot',
    description: 'Takes nature damage each turn',
    defaultDuration: 3,
    scaling: 'pDmg',       // Scales with physical damage
    baseMultiplier: 0.15   // 15% of pDmg per turn
  },
  chill: {
    id: 'chill',
    name: 'Chill',
    icon: '❄️',
    type: 'debuff',
    description: 'Attack reduced',
    defaultDuration: 2,
    effect: 'atkDown',
    value: 20              // -20% ATK
  },
  curse: {
    id: 'curse',
    name: 'Curse',
    icon: '💀',
    type: 'debuff',
    description: 'All stats reduced',
    defaultDuration: 3,
    effect: 'allStatsDown',
    value: 15              // -15% all stats
  },
  blessed: {
    id: 'blessed',
    name: 'Blessed',
    icon: '😇',
    type: 'buff',
    description: 'All stats increased',
    defaultDuration: 3,
    effect: 'allStatsUp',
    value: 15              // +15% all stats
  }
};

// ============================================================
// CALCULATE ELEMENT MULTIPLIER
// ============================================================

export function getElementMultiplier(attackElement, defenderElement, defenderResistances = {}) {
  // No element = neutral
  if (!attackElement || attackElement === 'none') {
    return ELEMENT_MULTIPLIERS.neutral;
  }
  
  const attacker = ELEMENTS[attackElement];
  if (!attacker) return ELEMENT_MULTIPLIERS.neutral;
  
  // Check for resistance from equipment/buffs
  const resistanceKey = attackElement + 'Res';
  const resistance = defenderResistances[resistanceKey] || 0;
  
  let multiplier = ELEMENT_MULTIPLIERS.neutral;
  
  // Same element = resistance
  if (attackElement === defenderElement) {
    multiplier = ELEMENT_MULTIPLIERS.same;
  }
  // Attacker is strong against defender
  else if (attacker.strongAgainst.includes(defenderElement)) {
    multiplier = ELEMENT_MULTIPLIERS.strong;
  }
  // Attacker is weak against defender
  else if (attacker.weakAgainst.includes(defenderElement)) {
    multiplier = ELEMENT_MULTIPLIERS.weak;
  }
  
  // Apply resistance reduction (capped at 75% reduction)
  const resistanceReduction = Math.min(0.75, resistance / 100);
  multiplier *= (1 - resistanceReduction);
  
  return multiplier;
}

// ============================================================
// GET ELEMENT EFFECTIVENESS TEXT
// ============================================================

export function getElementEffectivenessText(attackElement, defenderElement) {
  if (!attackElement || attackElement === 'none') {
    return { text: '', color: 'text-gray-400' };
  }
  
  const attacker = ELEMENTS[attackElement];
  if (!attacker) return { text: '', color: 'text-gray-400' };
  
  if (attackElement === defenderElement) {
    return { text: 'Resisted!', color: 'text-gray-400' };
  }
  
  if (attacker.strongAgainst.includes(defenderElement)) {
    return { text: 'Super Effective!', color: 'text-green-400' };
  }
  
  if (attacker.weakAgainst.includes(defenderElement)) {
    return { text: 'Not Very Effective...', color: 'text-red-400' };
  }
  
  return { text: '', color: 'text-gray-400' };
}

// ============================================================
// CREATE STATUS EFFECT FROM ELEMENT
// ============================================================

export function createElementalStatusEffect(element, sourceDerivedStats, customDuration = null) {
  const elementData = ELEMENTS[element];
  if (!elementData || !elementData.statusEffect) return null;
  
  const effectTemplate = ELEMENT_STATUS_EFFECTS[elementData.statusEffect];
  if (!effectTemplate) return null;
  
  const effect = {
    id: effectTemplate.id,
    name: effectTemplate.name,
    icon: effectTemplate.icon,
    type: effectTemplate.type,
    duration: customDuration || effectTemplate.defaultDuration,
    source: element
  };
  
  // Calculate effect value based on type
  if (effectTemplate.type === 'dot') {
    const scalingStat = sourceDerivedStats[effectTemplate.scaling] || 10;
    effect.damagePerTurn = Math.floor(scalingStat * effectTemplate.baseMultiplier);
  } else if (effectTemplate.type === 'debuff' || effectTemplate.type === 'buff') {
    effect.effect = effectTemplate.effect;
    effect.value = effectTemplate.value;
  } else if (effectTemplate.type === 'control') {
    effect.skipChance = effectTemplate.skipChance;
  }
  
  return effect;
}

// ============================================================
// PROCESS DOT EFFECTS
// ============================================================

export function processDotEffects(activeEffects) {
  let totalDamage = 0;
  const messages = [];
  
  activeEffects.forEach(effect => {
    if (effect.type === 'dot' && effect.damagePerTurn) {
      totalDamage += effect.damagePerTurn;
      messages.push({
        text: `${effect.icon} ${effect.name} deals ${effect.damagePerTurn} damage!`,
        color: ELEMENTS[effect.source]?.color || 'text-gray-400'
      });
    }
  });
  
  return { totalDamage, messages };
}

// ============================================================
// CHECK FOR CONTROL EFFECTS (Skip Turn)
// ============================================================

export function checkControlEffects(activeEffects) {
  for (const effect of activeEffects) {
    if (effect.type === 'control' && effect.skipChance) {
      if (Math.random() < effect.skipChance) {
        return {
          skipTurn: true,
          reason: `${effect.icon} ${effect.name} caused a skip!`
        };
      }
    }
    // Stun always skips
    if (effect.id === 'stun' || effect.id === 'freeze') {
      return {
        skipTurn: true,
        reason: `${effect.icon} ${effect.name}!`
      };
    }
  }
  
  return { skipTurn: false, reason: null };
}

// ============================================================
// TICK DOWN EFFECT DURATIONS
// ============================================================

export function tickEffectDurations(activeEffects) {
  const remaining = [];
  const expired = [];
  
  activeEffects.forEach(effect => {
    effect.duration--;
    if (effect.duration <= 0) {
      expired.push(effect);
    } else {
      remaining.push(effect);
    }
  });
  
  return { remaining, expired };
}

// ============================================================
// FORMAT EFFECTS FOR DISPLAY
// ============================================================

export function formatEffectsForDisplay(activeEffects) {
  return activeEffects.map(effect => ({
    icon: effect.icon,
    name: effect.name,
    duration: effect.duration,
    color: ELEMENTS[effect.source]?.color || 'text-gray-400',
    tooltip: getEffectTooltip(effect)
  }));
}

function getEffectTooltip(effect) {
  if (effect.type === 'dot') {
    return `${effect.damagePerTurn} damage/turn (${effect.duration}t)`;
  }
  if (effect.type === 'debuff') {
    return `-${effect.value}% ${effect.effect.replace('Down', '')} (${effect.duration}t)`;
  }
  if (effect.type === 'buff') {
    return `+${effect.value}% ${effect.effect.replace('Up', '')} (${effect.duration}t)`;
  }
  return `${effect.duration} turns remaining`;
}

// ============================================================
// GET ELEMENT INFO FOR UI
// ============================================================

export function getElementInfo(elementId) {
  return ELEMENTS[elementId] || ELEMENTS.none;
}

export function getAllElements() {
  return Object.values(ELEMENTS).filter(e => e.id !== 'none');
}

export default {
  ELEMENTS,
  ELEMENT_MULTIPLIERS,
  ELEMENT_STATUS_EFFECTS,
  getElementMultiplier,
  getElementEffectivenessText,
  createElementalStatusEffect,
  processDotEffects,
  checkControlEffects,
  tickEffectDurations,
  formatEffectsForDisplay,
  getElementInfo,
  getAllElements
};
