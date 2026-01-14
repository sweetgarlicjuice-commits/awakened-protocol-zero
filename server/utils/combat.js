// ============================================================
// ENHANCED COMBAT SYSTEM - With Stat Scaling
// ============================================================

import { SKILLS, calculateSkillDamage as calcSkillDmg, calculateManaCost as calcManaCost, calculateBuffEffect as calcBuffEffect } from '../data/skillSystem.js';
import { getSetItemDrop, getRandomEquipment } from '../data/setItemData.js';

// ============================================================
// DAMAGE CALCULATION
// ============================================================

export function calculateDamage(attacker, defender, skill = null) {
  let baseDamage;
  let attackStat;
  const stats = attacker.stats || {};
  const baseClass = attacker.baseClass || 'swordsman';
  
  // Get primary stat based on class
  const primaryStatMap = { swordsman: 'str', thief: 'agi', archer: 'dex', mage: 'int' };
  const primaryStat = primaryStatMap[baseClass] || 'str';
  
  if (skill && skill.scaling) {
    // Use skill system calculation
    const result = calcSkillDmg(skill, stats, defender, attacker.buffs || {});
    return { damage: result.damage, isCritical: false, hits: result.hits };
  }
  
  // Basic attack
  attackStat = stats[primaryStat] || attacker.baseAtk || 10;
  baseDamage = attackStat + (stats.atk || 0);
  
  // Defense reduction
  const defense = defender.stats?.def || defender.baseDef || defender.def || 0;
  const damageReduction = defense / (defense + 100);
  
  // Variance
  const variance = 0.9 + Math.random() * 0.2;
  let finalDamage = Math.max(1, Math.floor(baseDamage * (1 - damageReduction) * variance));
  
  // Critical hit (based on AGI for thief, DEX for archer)
  let critChance = 0.05; // Base 5%
  if (baseClass === 'thief') critChance += (stats.agi || 0) * 0.005;
  else if (baseClass === 'archer') critChance += (stats.dex || 0) * 0.003;
  
  const isCritical = Math.random() < critChance;
  if (isCritical) {
    const critDmg = 1.5 + (baseClass === 'thief' ? (stats.agi || 0) * 0.003 : 0);
    finalDamage = Math.floor(finalDamage * critDmg);
  }
  
  return { damage: finalDamage, isCritical };
}

// ============================================================
// ENEMY STAT SCALING (10 Towers)
// ============================================================

export function scaleEnemyStats(enemy, floor, towerId) {
  // Tower multipliers scale exponentially
  const towerMultipliers = { 1: 1, 2: 1.8, 3: 3, 4: 5, 5: 8, 6: 13, 7: 20, 8: 32, 9: 50, 10: 80 };
  
  const towerMult = towerMultipliers[towerId] || 1;
  const floorMult = 1 + (floor - 1) * 0.08;
  const totalMult = towerMult * floorMult;
  
  return {
    ...enemy,
    hp: Math.floor(enemy.baseHp * totalMult),
    maxHp: Math.floor(enemy.baseHp * totalMult),
    atk: Math.floor(enemy.baseAtk * totalMult),
    def: Math.floor(enemy.baseDef * totalMult),
    expReward: Math.floor(enemy.expReward * totalMult),
    goldReward: {
      min: Math.floor(enemy.goldReward.min * totalMult),
      max: Math.floor(enemy.goldReward.max * totalMult)
    }
  };
}

// ============================================================
// RANDOM ENEMY SELECTION
// ============================================================

export function getRandomEnemy(enemies, floor) {
  if (!enemies || enemies.length === 0) return null;
  if (!enemies[0]?.floors) {
    return enemies[Math.floor(Math.random() * enemies.length)];
  }
  const available = enemies.filter(e => e.floors?.includes(floor));
  if (available.length === 0) return enemies[0];
  return available[Math.floor(Math.random() * available.length)];
}

// ============================================================
// GOLD DROP CALCULATION
// ============================================================

export function calculateGoldDrop(goldReward) {
  return Math.floor(goldReward.min + Math.random() * (goldReward.max - goldReward.min));
}

// ============================================================
// ITEM DROPS (Enhanced with Set Items)
// ============================================================

export function rollForDrops(enemy, dropRates, equipmentTable, playerClass, towerId) {
  const drops = [];
  const tid = towerId || 1;
  
  // Set item drop (rare)
  if (enemy.isBoss && Math.random() < (dropRates.setItem || 0.15)) {
    const setItem = getSetItemDrop(tid, playerClass);
    if (setItem) drops.push({ ...setItem, quantity: 1, isSetItem: true });
  } else if (enemy.isElite && Math.random() < (dropRates.setItem || 0.05)) {
    const setItem = getSetItemDrop(tid, playerClass);
    if (setItem) drops.push({ ...setItem, quantity: 1, isSetItem: true });
  }
  
  // Regular equipment drop
  if (Math.random() < dropRates.equipment) {
    const item = getRandomEquipment(tid, playerClass, enemy.isElite, enemy.isBoss);
    if (item) drops.push({ ...item, quantity: 1 });
  }
  
  // Potion drop
  if (Math.random() < dropRates.potion) {
    if (Math.random() < 0.5) {
      drops.push({ itemId: 'health_potion_small', name: 'Small HP Potion', icon: '🧪', type: 'consumable', quantity: 1, stackable: true });
    } else {
      drops.push({ itemId: 'mana_potion_small', name: 'Small MP Potion', icon: '💎', type: 'consumable', quantity: 1, stackable: true });
    }
  }
  
  return drops;
}

// ============================================================
// HIDDEN CLASS SCROLL DROP
// ============================================================

export function rollForScroll(enemy, playerClass) {
  let dropChance = 0;
  if (enemy.isBoss) dropChance = 0.05;
  else if (enemy.isElite) dropChance = 0.02;
  else if (enemy.scrollDropChance) dropChance = enemy.scrollDropChance;
  
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
  const effect = skill.effect;
  if (!effect) return effects;
  
  const stats = source.stats || {};
  
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
  
  if (!combatant.statusEffects) return { damage, skipTurn, expiredEffects, messages };
  
  combatant.statusEffects.forEach((effect, index) => {
    switch (effect.type) {
      case 'poison':
        damage += effect.damage;
        messages.push(combatant.name + ' takes ' + effect.damage + ' poison damage!');
        break;
      case 'burn':
        damage += effect.damage;
        messages.push(combatant.name + ' takes ' + effect.damage + ' burn damage!');
        break;
      case 'freeze':
      case 'stun':
        skipTurn = true;
        messages.push(combatant.name + ' is ' + effect.type + 'ed!');
        break;
    }
    
    effect.duration--;
    if (effect.duration <= 0) {
      expiredEffects.push(index);
    }
  });
  
  return { damage, skipTurn, expiredEffects, messages };
}

// Re-export skill functions
export const calculateManaCost = calcManaCost;
export const calculateSkillDamage = calcSkillDmg;
export const calculateBuffEffect = calcBuffEffect;
