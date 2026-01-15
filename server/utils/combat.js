// ============================================================
// ENHANCED COMBAT SYSTEM - With Stat Scaling & Null Safety
// ============================================================

import { SKILLS, calculateSkillDamage as calcSkillDmg, calculateManaCost as calcManaCost, calculateBuffEffect as calcBuffEffect } from '../data/skillSystem.js';
import { getSetItemDrop, getRandomEquipment } from '../data/setItemData.js';

// ============================================================
// DAMAGE CALCULATION - With comprehensive null safety
// ============================================================

export function calculateDamage(attacker, defender, skill = null) {
  // Ensure we have valid objects
  if (!attacker) attacker = {};
  if (!defender) defender = {};
  
  let baseDamage;
  let attackStat;
  const stats = attacker.stats || {};
  const baseClass = attacker.baseClass || 'swordsman';
  
  // Get primary stat based on class
  const primaryStatMap = { swordsman: 'str', thief: 'agi', archer: 'dex', mage: 'int' };
  const primaryStat = primaryStatMap[baseClass] || 'str';
  
  if (skill && skill.scaling) {
    // Use skill system calculation
    try {
      const result = calcSkillDmg(skill, stats, defender, attacker.buffs || {});
      return { damage: result.damage || 1, isCritical: false, hits: result.hits || 1 };
    } catch (e) {
      console.error('Skill damage calculation error:', e);
      // Fallback to basic calculation
    }
  }
  
  // Basic attack calculation with null safety
  attackStat = stats[primaryStat] || attacker.baseAtk || 10;
  baseDamage = attackStat + (stats.atk || 0);
  
  // Ensure baseDamage is at least 1
  if (!baseDamage || baseDamage < 1) baseDamage = 10;
  
  // Defense reduction with null safety
  // Check multiple possible defense field names
  const defense = defender.stats?.def || 
                  defender.stats?.vit || 
                  defender.def || 
                  defender.baseDef || 
                  defender.defense || 
                  0;
  
  const damageReduction = defense / (defense + 100);
  
  // Variance (90% to 110%)
  const variance = 0.9 + Math.random() * 0.2;
  let finalDamage = Math.max(1, Math.floor(baseDamage * (1 - damageReduction) * variance));
  
  // Critical hit calculation
  let critChance = 0.05; // Base 5%
  if (baseClass === 'thief') critChance += (stats.agi || 0) * 0.005;
  else if (baseClass === 'archer') critChance += (stats.dex || 0) * 0.003;
  
  const isCritical = Math.random() < critChance;
  if (isCritical) {
    const critDmg = 1.5 + (baseClass === 'thief' ? (stats.agi || 0) * 0.003 : 0);
    finalDamage = Math.floor(finalDamage * critDmg);
  }
  
  // Final safety check
  if (!finalDamage || isNaN(finalDamage) || finalDamage < 1) {
    finalDamage = 1;
  }
  
  return { damage: finalDamage, isCritical };
}

// ============================================================
// ENEMY STAT SCALING (10 Towers)
// ============================================================

export function scaleEnemyStats(enemy, floor, towerId) {
  // Safety check
  if (!enemy) {
    return {
      id: 'unknown_enemy',
      name: 'Unknown Enemy',
      hp: 50,
      maxHp: 50,
      baseHp: 50,
      atk: 10,
      baseAtk: 10,
      def: 5,
      baseDef: 5,
      expReward: 10,
      goldReward: { min: 5, max: 15 },
      isBoss: false,
      isElite: false
    };
  }
  
  // Tower multipliers scale exponentially
  const towerMultipliers = { 1: 1, 2: 1.8, 3: 3, 4: 5, 5: 8, 6: 13, 7: 20, 8: 32, 9: 50, 10: 80 };
  
  const towerMult = towerMultipliers[towerId] || 1;
  const floorMult = 1 + ((floor || 1) - 1) * 0.08;
  const totalMult = towerMult * floorMult;
  
  // Get base values with fallbacks
  const baseHp = enemy.baseHp || enemy.hp || 50;
  const baseAtk = enemy.baseAtk || enemy.atk || enemy.attack || 10;
  const baseDef = enemy.baseDef || enemy.def || enemy.defense || 5;
  const baseExp = enemy.expReward || enemy.exp || 15;
  
  // Handle goldReward - could be object or number
  let goldMin = 5, goldMax = 15;
  if (enemy.goldReward) {
    if (typeof enemy.goldReward === 'object') {
      goldMin = enemy.goldReward.min || 5;
      goldMax = enemy.goldReward.max || 15;
    } else if (typeof enemy.goldReward === 'number') {
      goldMin = Math.floor(enemy.goldReward * 0.8);
      goldMax = Math.floor(enemy.goldReward * 1.2);
    }
  }
  
  return {
    ...enemy,
    id: enemy.id || enemy.name?.toLowerCase().replace(/\s+/g, '_') || 'enemy',
    hp: Math.floor(baseHp * totalMult),
    maxHp: Math.floor(baseHp * totalMult),
    baseHp: baseHp,
    atk: Math.floor(baseAtk * totalMult),
    baseAtk: baseAtk,
    def: Math.floor(baseDef * totalMult),
    baseDef: baseDef,
    expReward: Math.floor(baseExp * totalMult),
    goldReward: {
      min: Math.floor(goldMin * totalMult),
      max: Math.floor(goldMax * totalMult)
    },
    isBoss: enemy.isBoss || false,
    isElite: enemy.isElite || false
  };
}

// ============================================================
// RANDOM ENEMY SELECTION
// ============================================================

export function getRandomEnemy(enemies, floor) {
  if (!enemies || enemies.length === 0) {
    // Return a default enemy if none provided
    return {
      id: 'default_enemy',
      name: 'Monster',
      icon: '👹',
      baseHp: 50,
      baseAtk: 10,
      baseDef: 5,
      expReward: 15,
      goldReward: { min: 5, max: 15 }
    };
  }
  
  // Check if enemies have floor restrictions
  if (!enemies[0]?.floors) {
    return enemies[Math.floor(Math.random() * enemies.length)];
  }
  
  const available = enemies.filter(e => e.floors?.includes(floor));
  if (available.length === 0) return enemies[0];
  return available[Math.floor(Math.random() * available.length)];
}

// ============================================================
// GOLD DROP CALCULATION - With null safety
// ============================================================

export function calculateGoldDrop(goldReward) {
  // Handle different goldReward formats
  if (!goldReward) return 10;
  
  if (typeof goldReward === 'number') {
    // If it's just a number, add some variance
    return Math.floor(goldReward * (0.8 + Math.random() * 0.4));
  }
  
  if (typeof goldReward === 'object') {
    const min = goldReward.min || 5;
    const max = goldReward.max || min + 10;
    return Math.floor(min + Math.random() * (max - min));
  }
  
  return 10; // Default fallback
}

// ============================================================
// ITEM DROPS (Enhanced with Set Items)
// ============================================================

export function rollForDrops(enemy, dropRates, equipmentTable, playerClass, towerId) {
  const drops = [];
  const tid = towerId || 1;
  
  // Safety check for dropRates
  if (!dropRates) dropRates = { equipment: 0.1, setItem: 0.05, potion: 0.15 };
  
  try {
    // Set item drop (rare)
    if (enemy?.isBoss && Math.random() < (dropRates.setItem || 0.15)) {
      const setItem = getSetItemDrop(tid, playerClass);
      if (setItem) drops.push({ ...setItem, quantity: 1, isSetItem: true });
    } else if (enemy?.isElite && Math.random() < (dropRates.setItem || 0.05)) {
      const setItem = getSetItemDrop(tid, playerClass);
      if (setItem) drops.push({ ...setItem, quantity: 1, isSetItem: true });
    }
    
    // Regular equipment drop
    if (Math.random() < (dropRates.equipment || 0.1)) {
      const item = getRandomEquipment(tid, playerClass, enemy?.isElite, enemy?.isBoss);
      if (item) drops.push({ ...item, quantity: 1 });
    }
  } catch (e) {
    console.error('Error rolling for drops:', e);
  }
  
  // Potion drop
  if (Math.random() < (dropRates.potion || 0.15)) {
    if (Math.random() < 0.5) {
      drops.push({ 
        itemId: 'health_potion_small', 
        name: 'Small HP Potion', 
        icon: '🧪', 
        type: 'consumable', 
        quantity: 1, 
        stackable: true,
        sellPrice: 10
      });
    } else {
      drops.push({ 
        itemId: 'mana_potion_small', 
        name: 'Small MP Potion', 
        icon: '💎', 
        type: 'consumable', 
        quantity: 1, 
        stackable: true,
        sellPrice: 10
      });
    }
  }
  
  return drops;
}

// ============================================================
// HIDDEN CLASS SCROLL DROP
// ============================================================

export function rollForScroll(enemy, playerClass) {
  let dropChance = 0;
  if (enemy?.isBoss) dropChance = 0.05;
  else if (enemy?.isElite) dropChance = 0.02;
  else if (enemy?.scrollDropChance) dropChance = enemy.scrollDropChance;
  
  if (dropChance <= 0 || Math.random() >= dropChance) return null;
  
  const scrollMap = {
    swordsman: { id: 'scroll_flameblade', name: 'Flameblade Scroll', icon: '📜🔥', rarity: 'legendary' },
    thief: { id: 'scroll_shadow_dancer', name: 'Shadow Dancer Scroll', icon: '📜🌑', rarity: 'legendary' },
    archer: { id: 'scroll_storm_ranger', name: 'Storm Ranger Scroll', icon: '📜⚡', rarity: 'legendary' },
    mage: { id: 'scroll_frost_weaver', name: 'Frost Weaver Scroll', icon: '📜❄️', rarity: 'legendary' }
  };
  
  return scrollMap[playerClass] || null;
}

// ============================================================
// SKILL EFFECT APPLICATION
// ============================================================

export function applySkillEffect(skill, target, source) {
  const effects = [];
  const effect = skill?.effect;
  if (!effect) return effects;
  
  const stats = source?.stats || {};
  
  switch (effect.type) {
    case 'poison':
      const poisonDmg = (effect.baseDot || 20) + (stats.agi || 0) * (effect.agiMult || 0.2);
      effects.push({ type: 'poison', duration: effect.duration || 3, damage: Math.floor(poisonDmg) });
      break;
    case 'burn':
      const burnDmg = (effect.baseDot || 30) + (stats.str || 0) * (effect.strMult || 0.3) + (stats.mp || 0) * (effect.manaMult || 0);
      effects.push({ type: 'burn', duration: effect.duration || 3, damage: Math.floor(burnDmg) });
      break;
    case 'freeze':
      if (!effect.chance || Math.random() < effect.chance) effects.push({ type: 'freeze', duration: effect.duration || 1 });
      break;
    case 'slow':
      effects.push({ type: 'slow', duration: effect.duration || 2, atkReduction: effect.atkReduction || 0.2 });
      break;
    case 'defense':
      const defBoost = (stats.str || 0) * (effect.strMult || 0.5) + (stats.vit || 0) * (effect.vitMult || 0.3);
      effects.push({ type: 'defense', duration: effect.duration || 2, value: Math.floor(defBoost) });
      break;
    case 'evasion':
      effects.push({ type: 'evasion', duration: effect.duration || 2, value: effect.evasionBoost || 50 });
      break;
    case 'precision':
      effects.push({ type: 'precision', duration: effect.duration || 3, precisionBoost: effect.precisionBoost || 30, critBoost: effect.critBoost || 20 });
      break;
    case 'shield':
      const shieldValue = (stats.int || 0) * (effect.intMult || 2);
      effects.push({ type: 'shield', duration: effect.duration || 3, value: Math.floor(shieldValue) });
      break;
    case 'mark':
      effects.push({ type: 'mark', duration: effect.duration || 3, damageTakenBonus: effect.damageTakenBonus || 0.3 });
      break;
    case 'vanish':
      effects.push({ type: 'vanish', duration: effect.duration || 2, nextAttackCrit: true, damageBonus: effect.damageBonus || 2.0 });
      break;
    case 'aura':
      effects.push({ type: 'aura', duration: effect.duration || 3, atkBoost: effect.atkBoost || 30 });
      break;
    case 'armor':
      effects.push({ type: 'armor', duration: effect.duration || 3, defBoost: effect.defBoost || 50, reflectDamage: effect.reflectDamage || 0.2 });
      break;
  }
  
  return effects;
}

// ============================================================
// STATUS EFFECT PROCESSING
// ============================================================

export function processStatusEffects(combatant) {
  let damage = 0;
  let skipTurn = false;
  const expiredEffects = [];
  const messages = [];
  
  if (!combatant?.statusEffects) return { damage, skipTurn, expiredEffects, messages };
  
  combatant.statusEffects.forEach((effect, index) => {
    switch (effect.type) {
      case 'poison':
        damage += effect.damage || 0;
        messages.push((combatant.name || 'Target') + ' takes ' + (effect.damage || 0) + ' poison damage!');
        break;
      case 'burn':
        damage += effect.damage || 0;
        messages.push((combatant.name || 'Target') + ' takes ' + (effect.damage || 0) + ' burn damage!');
        break;
      case 'freeze':
      case 'stun':
        skipTurn = true;
        messages.push((combatant.name || 'Target') + ' is ' + effect.type + 'ed!');
        break;
    }
    
    effect.duration--;
    if (effect.duration <= 0) {
      expiredEffects.push(index);
    }
  });
  
  return { damage, skipTurn, expiredEffects, messages };
}

// Re-export skill functions with safety wrappers
export const calculateManaCost = (skill, stats) => {
  try {
    return calcManaCost(skill, stats);
  } catch (e) {
    return skill?.mpCost || 10;
  }
};

export const calculateSkillDamage = (skill, stats, defender, buffs) => {
  try {
    return calcSkillDmg(skill, stats, defender, buffs);
  } catch (e) {
    return { damage: 10, hits: 1 };
  }
};

export const calculateBuffEffect = (buff, stats) => {
  try {
    return calcBuffEffect(buff, stats);
  } catch (e) {
    return { value: 0 };
  }
};
