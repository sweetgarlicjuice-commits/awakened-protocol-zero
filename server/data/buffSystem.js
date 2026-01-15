// ============================================================
// BUFF/DEBUFF SYSTEM
// ============================================================
// Phase 7: All buffs and debuffs with icons for combat UI
// ============================================================

// ============================================================
// BUFF DEFINITIONS
// ============================================================

export const BUFF_TYPES = {
  // === OFFENSIVE BUFFS ===
  atkUp: {
    id: 'atkUp',
    name: 'ATK Up',
    icon: '⚔️',
    color: 'text-red-400',
    type: 'buff',
    category: 'offensive',
    stackable: false,
    description: 'Increases Physical and Magic damage'
  },
  pDmgUp: {
    id: 'pDmgUp',
    name: 'P.DMG Up',
    icon: '🗡️',
    color: 'text-red-400',
    type: 'buff',
    category: 'offensive',
    stackable: false,
    description: 'Increases Physical damage'
  },
  mDmgUp: {
    id: 'mDmgUp',
    name: 'M.DMG Up',
    icon: '✨',
    color: 'text-purple-400',
    type: 'buff',
    category: 'offensive',
    stackable: false,
    description: 'Increases Magic damage'
  },
  critRateUp: {
    id: 'critRateUp',
    name: 'Crit Rate Up',
    icon: '🎯',
    color: 'text-yellow-400',
    type: 'buff',
    category: 'offensive',
    stackable: false,
    description: 'Increases Critical Hit chance'
  },
  critDmgUp: {
    id: 'critDmgUp',
    name: 'Crit DMG Up',
    icon: '💥',
    color: 'text-orange-400',
    type: 'buff',
    category: 'offensive',
    stackable: false,
    description: 'Increases Critical Hit damage'
  },
  accuracyUp: {
    id: 'accuracyUp',
    name: 'Accuracy Up',
    icon: '👁️',
    color: 'text-blue-400',
    type: 'buff',
    category: 'offensive',
    stackable: false,
    description: 'Increases hit chance'
  },
  
  // === DEFENSIVE BUFFS ===
  defUp: {
    id: 'defUp',
    name: 'DEF Up',
    icon: '🛡️',
    color: 'text-gray-300',
    type: 'buff',
    category: 'defensive',
    stackable: false,
    description: 'Increases Physical and Magic defense'
  },
  pDefUp: {
    id: 'pDefUp',
    name: 'P.DEF Up',
    icon: '🛡️',
    color: 'text-amber-400',
    type: 'buff',
    category: 'defensive',
    stackable: false,
    description: 'Increases Physical defense'
  },
  mDefUp: {
    id: 'mDefUp',
    name: 'M.DEF Up',
    icon: '🔰',
    color: 'text-indigo-400',
    type: 'buff',
    category: 'defensive',
    stackable: false,
    description: 'Increases Magic defense'
  },
  evasionUp: {
    id: 'evasionUp',
    name: 'Evasion Up',
    icon: '💨',
    color: 'text-cyan-400',
    type: 'buff',
    category: 'defensive',
    stackable: false,
    description: 'Increases dodge chance'
  },
  
  // === SPECIAL BUFFS ===
  shield: {
    id: 'shield',
    name: 'Shield',
    icon: '🔷',
    color: 'text-blue-300',
    type: 'buff',
    category: 'special',
    stackable: false,
    description: 'Absorbs incoming damage'
  },
  lifesteal: {
    id: 'lifesteal',
    name: 'Lifesteal',
    icon: '🩸',
    color: 'text-red-500',
    type: 'buff',
    category: 'special',
    stackable: false,
    description: 'Heals for a portion of damage dealt'
  },
  reflect: {
    id: 'reflect',
    name: 'Reflect',
    icon: '🪞',
    color: 'text-purple-300',
    type: 'buff',
    category: 'special',
    stackable: false,
    description: 'Reflects a portion of damage back to attacker'
  },
  vanish: {
    id: 'vanish',
    name: 'Vanish',
    icon: '👻',
    color: 'text-gray-500',
    type: 'buff',
    category: 'special',
    stackable: false,
    description: 'Next attack auto-crits with bonus damage'
  },
  immuneDebuff: {
    id: 'immuneDebuff',
    name: 'Debuff Immunity',
    icon: '🌟',
    color: 'text-yellow-300',
    type: 'buff',
    category: 'special',
    stackable: false,
    description: 'Immune to debuffs'
  },
  allStatsUp: {
    id: 'allStatsUp',
    name: 'Blessed',
    icon: '😇',
    color: 'text-yellow-200',
    type: 'buff',
    category: 'special',
    stackable: false,
    description: 'All stats increased'
  },
  
  // === DEBUFFS ===
  atkDown: {
    id: 'atkDown',
    name: 'ATK Down',
    icon: '⚔️',
    color: 'text-red-600',
    type: 'debuff',
    category: 'offensive',
    stackable: false,
    description: 'Physical and Magic damage reduced'
  },
  defDown: {
    id: 'defDown',
    name: 'DEF Down',
    icon: '🛡️',
    color: 'text-gray-600',
    type: 'debuff',
    category: 'defensive',
    stackable: false,
    description: 'Physical and Magic defense reduced'
  },
  pDefDown: {
    id: 'pDefDown',
    name: 'P.DEF Down',
    icon: '🛡️',
    color: 'text-amber-600',
    type: 'debuff',
    category: 'defensive',
    stackable: false,
    description: 'Physical defense reduced'
  },
  mDefDown: {
    id: 'mDefDown',
    name: 'M.DEF Down',
    icon: '🔰',
    color: 'text-indigo-600',
    type: 'debuff',
    category: 'defensive',
    stackable: false,
    description: 'Magic defense reduced'
  },
  evasionDown: {
    id: 'evasionDown',
    name: 'Evasion Down',
    icon: '💨',
    color: 'text-cyan-600',
    type: 'debuff',
    category: 'defensive',
    stackable: false,
    description: 'Dodge chance reduced'
  },
  allStatsDown: {
    id: 'allStatsDown',
    name: 'Cursed',
    icon: '💀',
    color: 'text-purple-600',
    type: 'debuff',
    category: 'special',
    stackable: false,
    description: 'All stats reduced'
  },
  damageTakenUp: {
    id: 'damageTakenUp',
    name: 'Marked',
    icon: '🎯',
    color: 'text-red-500',
    type: 'debuff',
    category: 'special',
    stackable: false,
    description: 'Takes increased damage'
  },
  critReceivedUp: {
    id: 'critReceivedUp',
    name: 'Exposed',
    icon: '💢',
    color: 'text-orange-500',
    type: 'debuff',
    category: 'special',
    stackable: false,
    description: 'More likely to receive critical hits'
  },
  
  // === CONTROL EFFECTS ===
  stun: {
    id: 'stun',
    name: 'Stunned',
    icon: '💫',
    color: 'text-yellow-500',
    type: 'control',
    category: 'control',
    stackable: false,
    description: 'Cannot act'
  },
  freeze: {
    id: 'freeze',
    name: 'Frozen',
    icon: '🧊',
    color: 'text-cyan-300',
    type: 'control',
    category: 'control',
    stackable: false,
    description: 'Cannot act'
  },
  
  // === DOT EFFECTS ===
  burn: {
    id: 'burn',
    name: 'Burning',
    icon: '🔥',
    color: 'text-orange-400',
    type: 'dot',
    category: 'dot',
    stackable: true,
    maxStacks: 3,
    description: 'Takes fire damage each turn'
  },
  poison: {
    id: 'poison',
    name: 'Poisoned',
    icon: '🐍',
    color: 'text-green-500',
    type: 'dot',
    category: 'dot',
    stackable: true,
    maxStacks: 5,
    description: 'Takes poison damage each turn'
  },
  bleed: {
    id: 'bleed',
    name: 'Bleeding',
    icon: '🩸',
    color: 'text-red-400',
    type: 'dot',
    category: 'dot',
    stackable: true,
    maxStacks: 3,
    description: 'Takes bleed damage each turn'
  }
};

// ============================================================
// CREATE BUFF/DEBUFF
// ============================================================

export function createBuff(typeId, value, duration, source = null) {
  const template = BUFF_TYPES[typeId];
  if (!template) {
    console.error(`Unknown buff type: ${typeId}`);
    return null;
  }
  
  return {
    id: template.id,
    name: template.name,
    icon: template.icon,
    color: template.color,
    type: template.type,
    category: template.category,
    value: value,
    duration: duration,
    source: source,
    stackable: template.stackable,
    maxStacks: template.maxStacks || 1,
    stacks: 1
  };
}

// ============================================================
// CREATE DOT EFFECT
// ============================================================

export function createDot(typeId, damagePerTurn, duration, source = null) {
  const template = BUFF_TYPES[typeId];
  if (!template || template.type !== 'dot') {
    console.error(`Unknown DOT type: ${typeId}`);
    return null;
  }
  
  return {
    id: template.id,
    name: template.name,
    icon: template.icon,
    color: template.color,
    type: 'dot',
    category: 'dot',
    damagePerTurn: damagePerTurn,
    duration: duration,
    source: source,
    stackable: template.stackable,
    maxStacks: template.maxStacks || 1,
    stacks: 1
  };
}

// ============================================================
// ADD BUFF TO ACTIVE BUFFS
// ============================================================

export function addBuff(activeBuffs, newBuff) {
  if (!newBuff) return activeBuffs;
  
  const existing = activeBuffs.find(b => b.id === newBuff.id);
  
  if (existing) {
    if (newBuff.stackable && existing.stacks < (newBuff.maxStacks || 1)) {
      // Stack the buff
      existing.stacks++;
      if (newBuff.type === 'dot') {
        existing.damagePerTurn += newBuff.damagePerTurn;
      } else {
        existing.value += newBuff.value;
      }
      // Refresh duration to the longer one
      existing.duration = Math.max(existing.duration, newBuff.duration);
    } else {
      // Refresh duration only
      existing.duration = Math.max(existing.duration, newBuff.duration);
      // Use higher value if not stackable
      if (!newBuff.stackable && newBuff.value > existing.value) {
        existing.value = newBuff.value;
      }
    }
    return activeBuffs;
  }
  
  // Add new buff
  return [...activeBuffs, newBuff];
}

// ============================================================
// REMOVE BUFF
// ============================================================

export function removeBuff(activeBuffs, buffId) {
  return activeBuffs.filter(b => b.id !== buffId);
}

// ============================================================
// REMOVE ALL DEBUFFS (Purify)
// ============================================================

export function removeAllDebuffs(activeBuffs) {
  return activeBuffs.filter(b => b.type === 'buff');
}

// ============================================================
// CHECK IF HAS DEBUFF IMMUNITY
// ============================================================

export function hasDebuffImmunity(activeBuffs) {
  return activeBuffs.some(b => b.id === 'immuneDebuff');
}

// ============================================================
// GET BUFFS MODIFIER VALUE
// ============================================================

export function getBuffValue(activeBuffs, buffId) {
  const buff = activeBuffs.find(b => b.id === buffId);
  return buff ? buff.value : 0;
}

// ============================================================
// PROCESS SHIELD DAMAGE
// ============================================================

export function processShieldDamage(activeBuffs, damage) {
  const shield = activeBuffs.find(b => b.id === 'shield');
  if (!shield) {
    return { remainingDamage: damage, shieldBroken: false, shieldAbsorbed: 0 };
  }
  
  const absorbed = Math.min(shield.value, damage);
  shield.value -= absorbed;
  
  const shieldBroken = shield.value <= 0;
  if (shieldBroken) {
    // Remove broken shield
    const idx = activeBuffs.indexOf(shield);
    if (idx > -1) activeBuffs.splice(idx, 1);
  }
  
  return {
    remainingDamage: damage - absorbed,
    shieldBroken,
    shieldAbsorbed: absorbed
  };
}

// ============================================================
// PROCESS REFLECT DAMAGE
// ============================================================

export function processReflectDamage(activeBuffs, damageReceived) {
  const reflect = activeBuffs.find(b => b.id === 'reflect');
  if (!reflect) return 0;
  
  return Math.floor(damageReceived * (reflect.value / 100));
}

// ============================================================
// PROCESS LIFESTEAL
// ============================================================

export function processLifesteal(activeBuffs, damageDealt) {
  const lifesteal = activeBuffs.find(b => b.id === 'lifesteal');
  if (!lifesteal) return 0;
  
  return Math.floor(damageDealt * (lifesteal.value / 100));
}

// ============================================================
// CHECK VANISH (Auto-crit next attack)
// ============================================================

export function checkAndConsumeVanish(activeBuffs) {
  const vanishIdx = activeBuffs.findIndex(b => b.id === 'vanish');
  if (vanishIdx === -1) return null;
  
  const vanish = activeBuffs[vanishIdx];
  activeBuffs.splice(vanishIdx, 1); // Consume vanish
  
  return {
    autoCrit: true,
    bonusDamage: vanish.value // Usually 100% = 2x damage
  };
}

// ============================================================
// TICK BUFFS (Reduce duration)
// ============================================================

export function tickBuffs(activeBuffs) {
  const remaining = [];
  const expired = [];
  
  activeBuffs.forEach(buff => {
    buff.duration--;
    if (buff.duration <= 0) {
      expired.push(buff);
    } else {
      remaining.push(buff);
    }
  });
  
  return { remaining, expired };
}

// ============================================================
// PROCESS ALL DOTS
// ============================================================

export function processDots(activeBuffs) {
  let totalDamage = 0;
  const messages = [];
  
  activeBuffs.forEach(buff => {
    if (buff.type === 'dot' && buff.damagePerTurn) {
      totalDamage += buff.damagePerTurn;
      messages.push({
        icon: buff.icon,
        text: `${buff.name} deals ${buff.damagePerTurn} damage!`,
        color: buff.color
      });
    }
  });
  
  return { totalDamage, messages };
}

// ============================================================
// FORMAT BUFFS FOR UI DISPLAY
// ============================================================

export function formatBuffsForDisplay(activeBuffs, filterType = 'all') {
  let filtered = activeBuffs;
  
  if (filterType === 'buff') {
    filtered = activeBuffs.filter(b => b.type === 'buff');
  } else if (filterType === 'debuff') {
    filtered = activeBuffs.filter(b => b.type === 'debuff' || b.type === 'dot' || b.type === 'control');
  }
  
  return filtered.map(buff => {
    let valueText = '';
    if (buff.type === 'dot') {
      valueText = `${buff.damagePerTurn}/t`;
    } else if (buff.value) {
      const sign = buff.type === 'debuff' ? '-' : '+';
      valueText = `${sign}${buff.value}%`;
    } else if (buff.id === 'shield') {
      valueText = `${buff.value} HP`;
    }
    
    return {
      icon: buff.icon,
      name: buff.name,
      value: valueText,
      duration: buff.duration,
      color: buff.color,
      stacks: buff.stacks > 1 ? buff.stacks : null
    };
  });
}

// ============================================================
// GET BUFF DISPLAY STRING (Compact)
// ============================================================

export function getBuffDisplayString(buff) {
  if (buff.type === 'dot') {
    return `${buff.icon} ${buff.damagePerTurn}/t (${buff.duration}t)`;
  }
  if (buff.id === 'shield') {
    return `${buff.icon} ${buff.value}HP`;
  }
  const sign = buff.type === 'debuff' ? '-' : '+';
  return `${buff.icon}${sign}${buff.value}% (${buff.duration}t)`;
}

export default {
  BUFF_TYPES,
  createBuff,
  createDot,
  addBuff,
  removeBuff,
  removeAllDebuffs,
  hasDebuffImmunity,
  getBuffValue,
  processShieldDamage,
  processReflectDamage,
  processLifesteal,
  checkAndConsumeVanish,
  tickBuffs,
  processDots,
  formatBuffsForDisplay,
  getBuffDisplayString
};
