// ============================================================
// ENHANCED SKILL SYSTEM - Stat Scaling
// ============================================================

// Class configurations
export const CLASS_CONFIG = {
  swordsman: { name: 'Swordsman', icon: '⚔️', primaryStat: 'str', secondaryStat: 'vit' },
  thief: { name: 'Thief', icon: '🗡️', primaryStat: 'agi', secondaryStat: 'agi' },
  archer: { name: 'Archer', icon: '🏹', primaryStat: 'dex', secondaryStat: 'dex' },
  mage: { name: 'Mage', icon: '🔮', primaryStat: 'int', secondaryStat: 'int' }
};

// ============================================================
// ALL SKILLS
// ============================================================

export const SKILLS = {
  // SWORDSMAN
  power_strike: { id: 'power_strike', name: 'Power Strike', icon: '⚔️', class: 'swordsman', type: 'damage', baseDamage: 50, baseManaCost: 15, baseCooldown: 2, flatCooldown: false, scaling: { stat: 'str', multiplier: 2.0 }, description: 'DMG = 50 + (STR × 2)' },
  defender_stance: { id: 'defender_stance', name: "Defender's Stance", icon: '🛡️', class: 'swordsman', type: 'buff', baseDamage: 0, baseManaCost: 20, baseCooldown: 4, flatCooldown: true, effect: { type: 'defense', duration: 2, strMult: 0.5, vitMult: 0.3 }, description: 'DEF = (STR × 0.5) + (VIT × 0.3) for 2 turns' },
  whirlwind: { id: 'whirlwind', name: 'Whirlwind', icon: '🌀', class: 'swordsman', type: 'damage', baseDamage: 40, baseManaCost: 25, baseCooldown: 3, flatCooldown: false, scaling: { stat: 'str', multiplier: 1.8 }, description: 'DMG = 40 + (STR × 1.8)' },
  execute: { id: 'execute', name: 'Execute', icon: '💀', class: 'swordsman', type: 'damage', baseDamage: 80, baseManaCost: 35, baseCooldown: 5, flatCooldown: false, scaling: { stat: 'str', multiplier: 2.5 }, bonusEffect: { condition: 'enemy_hp_below', threshold: 0.3, damageBonus: 1.5 }, description: 'DMG = 80 + (STR × 2.5). +50% if enemy HP < 30%' },

  // THIEF
  backstab: { id: 'backstab', name: 'Backstab', icon: '🗡️', class: 'thief', type: 'damage', baseDamage: 100, baseManaCost: 20, baseCooldown: 2, flatCooldown: false, scaling: { stat: 'agi', multiplier: 1.2, critScaling: true }, description: 'DMG = (100 + AGI × 1.2) × (1 + Crit%)' },
  poison_strike: { id: 'poison_strike', name: 'Poison Strike', icon: '☠️', class: 'thief', type: 'damage', baseDamage: 60, baseManaCost: 18, baseCooldown: 3, flatCooldown: false, scaling: { stat: 'agi', multiplier: 1.0 }, effect: { type: 'poison', duration: 3, baseDot: 20, agiMult: 0.2 }, description: 'DMG + Poison for 3 turns' },
  shadow_step: { id: 'shadow_step', name: 'Shadow Step', icon: '👤', class: 'thief', type: 'buff', baseDamage: 0, baseManaCost: 25, baseCooldown: 4, flatCooldown: true, effect: { type: 'evasion', duration: 2, evasionBoost: 50 }, description: '+50% Evasion for 2 turns' },
  assassinate: { id: 'assassinate', name: 'Assassinate', icon: '💀', class: 'thief', type: 'damage', baseDamage: 150, baseManaCost: 40, baseCooldown: 5, flatCooldown: false, scaling: { stat: 'agi', multiplier: 2.0, critScaling: true, guaranteedCrit: true }, description: 'DMG = (150 + AGI × 2) × Crit. Always crits.' },

  // ARCHER
  piercing_shot: { id: 'piercing_shot', name: 'Piercing Shot', icon: '🎯', class: 'archer', type: 'damage', baseDamage: 100, baseManaCost: 18, baseCooldown: 2, flatCooldown: false, scaling: { stat: 'dex', multiplier: 1.5, precisionScaling: true }, description: 'DMG = (100 + DEX × 1.5) × (1 + Prec%)' },
  multi_shot: { id: 'multi_shot', name: 'Multi Shot', icon: '🏹', class: 'archer', type: 'damage', baseDamage: 80, baseManaCost: 25, baseCooldown: 3, flatCooldown: false, hits: 3, scaling: { stat: 'dex', multiplier: 1.2, critScaling: true }, description: '3 hits. Each: (80 + DEX × 1.2)' },
  hawk_eye: { id: 'hawk_eye', name: 'Hawk Eye', icon: '👁️', class: 'archer', type: 'buff', baseDamage: 0, baseManaCost: 20, baseCooldown: 4, flatCooldown: true, effect: { type: 'precision', duration: 3, precisionBoost: 30, critBoost: 20 }, description: '+30% Precision, +20% Crit for 3 turns' },
  arrow_storm: { id: 'arrow_storm', name: 'Arrow Storm', icon: '🌧️', class: 'archer', type: 'damage', baseDamage: 60, baseManaCost: 45, baseCooldown: 5, flatCooldown: false, hits: 5, scaling: { stat: 'dex', multiplier: 1.0, precisionScaling: true }, description: '5 hits. Each: 60 + DEX' },

  // MAGE
  fireball: { id: 'fireball', name: 'Fireball', icon: '🔥', class: 'mage', type: 'damage', baseDamage: 150, baseManaCost: 50, baseCooldown: 3, flatCooldown: false, scaling: { stat: 'int', multiplier: 1.8 }, effect: { type: 'burn', duration: 3, baseDot: 50, manaMult: 0.5 }, manaScaling: true, description: 'DMG = 150 + (INT × 1.8). Burn 3 turns.' },
  frost_nova: { id: 'frost_nova', name: 'Frost Nova', icon: '❄️', class: 'mage', type: 'damage', baseDamage: 100, baseManaCost: 40, baseCooldown: 3, flatCooldown: false, scaling: { stat: 'int', multiplier: 1.5 }, effect: { type: 'freeze', duration: 1 }, manaScaling: true, description: 'DMG = 100 + (INT × 1.5). Freeze 1 turn.' },
  mana_shield: { id: 'mana_shield', name: 'Mana Shield', icon: '🛡️', class: 'mage', type: 'buff', baseDamage: 0, baseManaCost: 30, baseCooldown: 5, flatCooldown: true, effect: { type: 'shield', duration: 3, intMult: 2.0 }, manaScaling: true, description: 'Shield = INT × 2 for 3 turns' },
  thunderbolt: { id: 'thunderbolt', name: 'Thunderbolt', icon: '⚡', class: 'mage', type: 'damage', baseDamage: 200, baseManaCost: 70, baseCooldown: 4, flatCooldown: false, scaling: { stat: 'int', multiplier: 2.2 }, manaScaling: true, description: 'DMG = 200 + (INT × 2.2)' },

  // FLAMEBLADE (Hidden)
  flame_slash: { id: 'flame_slash', name: 'Flame Slash', icon: '🔥', class: 'flameblade', type: 'damage', baseDamage: 80, baseManaCost: 20, baseCooldown: 2, flatCooldown: false, scaling: { stat: 'str', multiplier: 2.2 }, effect: { type: 'burn', duration: 2, baseDot: 30, strMult: 0.3 }, description: 'DMG + Burn 2 turns' },
  inferno_strike: { id: 'inferno_strike', name: 'Inferno Strike', icon: '🌋', class: 'flameblade', type: 'damage', baseDamage: 120, baseManaCost: 35, baseCooldown: 4, flatCooldown: false, scaling: { stat: 'str', multiplier: 2.8 }, description: 'DMG = 120 + (STR × 2.8)' },
  fire_aura: { id: 'fire_aura', name: 'Fire Aura', icon: '🔥', class: 'flameblade', type: 'buff', baseDamage: 0, baseManaCost: 30, baseCooldown: 5, flatCooldown: true, effect: { type: 'aura', duration: 3, atkBoost: 30 }, description: '+30% ATK for 3 turns' },
  volcanic_rage: { id: 'volcanic_rage', name: 'Volcanic Rage', icon: '🌋', class: 'flameblade', type: 'damage', baseDamage: 200, baseManaCost: 50, baseCooldown: 6, flatCooldown: false, scaling: { stat: 'str', multiplier: 3.5 }, description: 'DMG = 200 + (STR × 3.5)' },

  // SHADOW DANCER (Hidden)
  shadow_strike: { id: 'shadow_strike', name: 'Shadow Strike', icon: '🌑', class: 'shadowDancer', type: 'damage', baseDamage: 120, baseManaCost: 22, baseCooldown: 2, flatCooldown: false, scaling: { stat: 'agi', multiplier: 2.5, critScaling: true }, description: 'DMG = (120 + AGI × 2.5) × Crit' },
  vanish: { id: 'vanish', name: 'Vanish', icon: '👻', class: 'shadowDancer', type: 'buff', baseDamage: 0, baseManaCost: 30, baseCooldown: 5, flatCooldown: true, effect: { type: 'vanish', duration: 2, nextAttackCrit: true, damageBonus: 2.0 }, description: 'Vanish 2 turns. Next attack +100% DMG' },
  death_mark: { id: 'death_mark', name: 'Death Mark', icon: '💀', class: 'shadowDancer', type: 'debuff', baseDamage: 50, baseManaCost: 25, baseCooldown: 4, flatCooldown: false, scaling: { stat: 'agi', multiplier: 1.5 }, effect: { type: 'mark', duration: 3, damageTakenBonus: 0.3 }, description: 'Mark: +30% DMG taken 3 turns' },
  shadow_dance: { id: 'shadow_dance', name: 'Shadow Dance', icon: '💃', class: 'shadowDancer', type: 'damage', baseDamage: 80, baseManaCost: 45, baseCooldown: 6, flatCooldown: false, hits: 5, scaling: { stat: 'agi', multiplier: 2.0, critScaling: true }, description: '5 strikes × (80 + AGI × 2)' },

  // STORM RANGER (Hidden)
  lightning_arrow: { id: 'lightning_arrow', name: 'Lightning Arrow', icon: '⚡', class: 'stormRanger', type: 'damage', baseDamage: 130, baseManaCost: 22, baseCooldown: 2, flatCooldown: false, scaling: { stat: 'dex', multiplier: 2.2, precisionScaling: true }, description: 'DMG = (130 + DEX × 2.2) × Prec' },
  chain_lightning: { id: 'chain_lightning', name: 'Chain Lightning', icon: '⛓️', class: 'stormRanger', type: 'damage', baseDamage: 100, baseManaCost: 30, baseCooldown: 3, flatCooldown: false, hits: 3, scaling: { stat: 'dex', multiplier: 1.8 }, description: '3 chains × (100 + DEX × 1.8)' },
  storm_eye: { id: 'storm_eye', name: 'Storm Eye', icon: '🌀', class: 'stormRanger', type: 'buff', baseDamage: 0, baseManaCost: 28, baseCooldown: 5, flatCooldown: true, effect: { type: 'storm', duration: 3, precisionBoost: 50, critBoost: 30 }, description: '+50% Prec, +30% Crit 3 turns' },
  thunderstorm: { id: 'thunderstorm', name: 'Thunderstorm', icon: '🌩️', class: 'stormRanger', type: 'damage', baseDamage: 150, baseManaCost: 55, baseCooldown: 6, flatCooldown: false, hits: 4, scaling: { stat: 'dex', multiplier: 3.0, precisionScaling: true }, description: '4 hits × (150 + DEX × 3)' },

  // FROST WEAVER (Hidden)
  frost_bolt: { id: 'frost_bolt', name: 'Frost Bolt', icon: '❄️', class: 'frostWeaver', type: 'damage', baseDamage: 180, baseManaCost: 45, baseCooldown: 2, flatCooldown: false, scaling: { stat: 'int', multiplier: 2.0 }, effect: { type: 'slow', duration: 2, atkReduction: 0.2 }, manaScaling: true, description: 'DMG + Slow -20% ATK' },
  blizzard: { id: 'blizzard', name: 'Blizzard', icon: '🌨️', class: 'frostWeaver', type: 'damage', baseDamage: 120, baseManaCost: 60, baseCooldown: 4, flatCooldown: false, hits: 3, scaling: { stat: 'int', multiplier: 2.2 }, effect: { type: 'freeze', chance: 0.3 }, manaScaling: true, description: '3 hits. 30% freeze chance' },
  ice_armor: { id: 'ice_armor', name: 'Ice Armor', icon: '🧊', class: 'frostWeaver', type: 'buff', baseDamage: 0, baseManaCost: 40, baseCooldown: 5, flatCooldown: true, effect: { type: 'armor', duration: 3, defBoost: 50, reflectDamage: 0.2 }, manaScaling: true, description: '+50 DEF, 20% reflect 3 turns' },
  absolute_zero: { id: 'absolute_zero', name: 'Absolute Zero', icon: '💠', class: 'frostWeaver', type: 'damage', baseDamage: 300, baseManaCost: 80, baseCooldown: 6, flatCooldown: false, scaling: { stat: 'int', multiplier: 4.0 }, effect: { type: 'freeze', duration: 2 }, manaScaling: true, description: 'DMG = 300 + (INT × 4). Freeze 2 turns' }
};

// ============================================================
// CALCULATION FUNCTIONS
// ============================================================

export function calculateManaCost(skill, stats, baseClass) {
  if (baseClass === 'mage' || skill.manaScaling) {
    const reduction = Math.min(0.5, (stats.int || 0) * 0.02);
    return Math.floor(skill.baseManaCost * (1 - reduction));
  }
  return skill.baseManaCost;
}

export function calculateCooldown(skill, level) {
  if (skill.flatCooldown) return skill.baseCooldown;
  return skill.baseCooldown + Math.floor(level / 10);
}

export function calculateSkillDamage(skill, stats, enemy, buffs = {}) {
  if (skill.type !== 'damage') return { damage: 0, hits: 0, perHit: 0 };
  
  const scaling = skill.scaling;
  let baseDamage = skill.baseDamage;
  
  if (scaling) {
    const statValue = stats[scaling.stat] || 0;
    baseDamage += statValue * scaling.multiplier;
  }
  
  // Crit scaling
  if (scaling?.critScaling) {
    const critChance = (stats.agi || 0) * 0.5 / 100;
    const bonusCrit = (buffs.critBoost || 0) / 100;
    baseDamage *= (1 + critChance + bonusCrit);
  }
  
  // Precision scaling
  if (scaling?.precisionScaling) {
    const precision = (stats.dex || 0) * 0.3 / 100;
    const bonusPrecision = (buffs.precisionBoost || 0) / 100;
    baseDamage *= (1 + precision + bonusPrecision);
  }
  
  // Execute bonus
  if (skill.bonusEffect?.condition === 'enemy_hp_below') {
    const threshold = skill.bonusEffect.threshold;
    const enemyHpPercent = enemy.hp / (enemy.maxHp || enemy.hp);
    if (enemyHpPercent < threshold) {
      baseDamage *= skill.bonusEffect.damageBonus;
    }
  }
  
  const hits = skill.hits || 1;
  const defense = enemy.def || enemy.baseDef || 0;
  const damageReduction = defense / (defense + 100);
  const finalDamage = Math.floor(baseDamage * (1 - damageReduction));
  
  return { damage: finalDamage * hits, hits, perHit: finalDamage };
}

export function calculateBuffEffect(skill, stats) {
  const effect = skill.effect;
  if (!effect) return null;
  
  let value = 0;
  if (effect.type === 'defense') {
    value = (stats.str || 0) * (effect.strMult || 0) + (stats.vit || 0) * (effect.vitMult || 0);
  } else if (effect.type === 'shield') {
    value = (stats.int || 0) * (effect.intMult || 0);
  } else if (effect.evasionBoost) {
    value = effect.evasionBoost;
  } else if (effect.precisionBoost) {
    value = effect.precisionBoost;
  }
  
  return { type: effect.type, value: Math.floor(value), duration: effect.duration, extra: effect };
}

export function getSkillsForClass(baseClass, hiddenClass = 'none') {
  const skills = [];
  Object.values(SKILLS).forEach(skill => {
    if (skill.class === baseClass) skills.push(skill);
  });
  if (hiddenClass !== 'none') {
    Object.values(SKILLS).forEach(skill => {
      if (skill.class === hiddenClass) skills.push(skill);
    });
  }
  return skills;
}

export function getDerivedStats(stats, baseClass) {
  const derived = { critChance: 5, critDamage: 150, precision: 0, evasion: 5, damageBonus: 0 };
  
  switch (baseClass) {
    case 'swordsman':
      derived.damageBonus = (stats.str || 0) * 0.5;
      break;
    case 'thief':
      derived.critChance += (stats.agi || 0) * 0.5;
      derived.critDamage += (stats.agi || 0) * 0.3;
      derived.evasion += (stats.agi || 0) * 0.3;
      break;
    case 'archer':
      derived.precision = (stats.dex || 0) * 0.3;
      derived.critChance += (stats.dex || 0) * 0.2;
      break;
    case 'mage':
      derived.damageBonus = (stats.int || 0) * 0.5;
      break;
  }
  
  return derived;
}
