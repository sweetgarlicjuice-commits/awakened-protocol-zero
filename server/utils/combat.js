// ============================================================
// COMBAT SYSTEM - Phase 7 Complete Overhaul
// ============================================================
// Integrates: statSystem, elementSystem, buffSystem, skillDatabase
// ============================================================

import { calculateDerivedStats, applyBuffsToDerivedStats } from '../data/statSystem.js';
import { getElementMultiplier, getElementEffectivenessText, createElementalStatusEffect, processDotEffects as processElementDots, checkControlEffects, tickEffectDurations } from '../data/elementSystem.js';
import { createBuff, createDot, addBuff, tickBuffs, processDots, processShieldDamage, processReflectDamage, processLifesteal, checkAndConsumeVanish, hasDebuffImmunity, removeAllDebuffs, formatBuffsForDisplay } from '../data/buffSystem.js';
import { getSkill, getAllSkillsForCharacter } from '../data/skillDatabase.js';
import { getSetItemDrop, getRandomEquipment } from '../data/setItemData.js';

// ============================================================
// MAIN DAMAGE CALCULATION
// ============================================================

export function calculateDamage(attacker, defender, skill = null, options = {}) {
  const result = {
    damage: 0,
    isCritical: false,
    element: 'none',
    elementEffect: null,
    hits: 1,
    messages: [],
    lifestealHeal: 0,
    reflectDamage: 0,
    missed: false,
    blocked: false
  };

  // Get attacker's derived stats (with buffs applied)
  const attackerDerived = getEffectiveStats(attacker);
  const defenderDerived = getEffectiveStats(defender);
  
  // Check for control effects (stun/freeze) - attacker can't act
  if (attacker.activeBuffs && attacker.activeBuffs.length > 0) {
    const control = checkControlEffects(attacker.activeBuffs);
    if (control.skipTurn) {
      result.damage = 0;
      result.messages.push(control.reason);
      return result;
    }
  }

  // === ACCURACY CHECK (Can Miss) ===
  if (!options.neverMiss) {
    const hitChance = Math.min(100, attackerDerived.accuracy - (defenderDerived.evasion || 0));
    if (Math.random() * 100 > hitChance) {
      result.missed = true;
      result.messages.push('Attack missed!');
      return result;
    }
  }

  // === BASE DAMAGE CALCULATION ===
  let baseDamage = 0;
  let damageType = 'physical'; // 'physical' or 'magical'
  let element = 'none';
  let hits = 1;
  let critBonus = 0;
  let armorPen = 0;

  if (skill) {
    // Skill-based damage
    const skillData = typeof skill === 'string' ? getSkill(skill) : skill;
    if (!skillData) {
      // Fallback to basic attack if skill not found
      baseDamage = attackerDerived.pDmg;
    } else {
      element = skillData.element || 'none';
      hits = skillData.hits || 1;
      
      if (skillData.scaling) {
        const scalingStat = skillData.scaling.stat;
        const multiplier = skillData.scaling.multiplier;
        
        if (scalingStat === 'pDmg') {
          baseDamage = attackerDerived.pDmg * multiplier;
          damageType = 'physical';
        } else if (scalingStat === 'mDmg') {
          baseDamage = attackerDerived.mDmg * multiplier;
          damageType = 'magical';
        } else if (scalingStat === 'maxHp') {
          // Healing skills
          baseDamage = attackerDerived.maxHp * multiplier;
          damageType = 'heal';
        }
      }
      
      // Process skill effects for bonuses
      if (skillData.effects) {
        skillData.effects.forEach(effect => {
          if (effect.type === 'critBonus') {
            critBonus += effect.value;
          }
          if (effect.type === 'armorPen') {
            armorPen += effect.value;
          }
          if (effect.type === 'neverMiss') {
            options.neverMiss = true;
          }
        });
      }
    }
  } else {
    // Basic attack - use primary damage stat
    const attackerClass = attacker.baseClass || 'swordsman';
    if (attackerClass === 'mage') {
      baseDamage = attackerDerived.mDmg;
      damageType = 'magical';
    } else {
      baseDamage = attackerDerived.pDmg;
      damageType = 'physical';
    }
  }

  // === HEALING (Skip damage calculation) ===
  if (damageType === 'heal') {
    result.damage = Math.floor(baseDamage);
    result.isHeal = true;
    result.messages.push(`Healed for ${result.damage} HP!`);
    return result;
  }

  // === CHECK VANISH BUFF (Auto-crit) ===
  let autoCrit = false;
  let vanishBonus = 0;
  if (attacker.activeBuffs) {
    const vanishResult = checkAndConsumeVanish(attacker.activeBuffs);
    if (vanishResult) {
      autoCrit = true;
      vanishBonus = vanishResult.bonusDamage;
      result.messages.push('💨 Striking from the shadows!');
    }
  }

  // === ELEMENT MULTIPLIER ===
  const defenderElement = defender.element || 'none';
  const defenderResistances = defender.resistances || {};
  const elementMult = getElementMultiplier(element, defenderElement, defenderResistances);
  
  if (element !== 'none') {
    const effectText = getElementEffectivenessText(element, defenderElement);
    if (effectText.text) {
      result.messages.push(effectText.text);
    }
  }
  result.element = element;
  result.elementMultiplier = elementMult;

  // === DEFENSE REDUCTION ===
  let defense = damageType === 'physical' ? defenderDerived.pDef : defenderDerived.mDef;
  
  // Apply armor penetration
  if (armorPen > 0) {
    defense = defense * (1 - armorPen / 100);
  }
  
  // Defense formula: damage reduction = DEF / (DEF + 100)
  const defReduction = defense / (defense + 100);

  // === CRITICAL HIT ===
  let critRate = attackerDerived.critRate + critBonus;
  let critDmg = attackerDerived.critDmg;
  
  // Check for mark debuff on defender (increases crit received)
  if (defender.activeBuffs) {
    const markDebuff = defender.activeBuffs.find(b => b.id === 'critReceivedUp');
    if (markDebuff) {
      critRate += markDebuff.value;
    }
  }
  
  const isCritical = autoCrit || (Math.random() * 100 < critRate);
  
  // === CALCULATE FINAL DAMAGE ===
  let totalDamage = 0;
  
  for (let i = 0; i < hits; i++) {
    let hitDamage = baseDamage / hits; // Divide damage among hits
    
    // Apply element multiplier
    hitDamage *= elementMult;
    
    // Apply defense reduction
    hitDamage *= (1 - defReduction);
    
    // Apply critical
    if (isCritical) {
      hitDamage *= (critDmg / 100);
      if (vanishBonus > 0) {
        hitDamage *= (1 + vanishBonus / 100);
      }
    }
    
    // Damage variance (±10%)
    hitDamage *= (0.9 + Math.random() * 0.2);
    
    // Check for damage taken modifier on defender
    if (defender.activeBuffs) {
      const damageTakenUp = defender.activeBuffs.find(b => b.id === 'damageTakenUp');
      if (damageTakenUp) {
        hitDamage *= (1 + damageTakenUp.value / 100);
      }
    }
    
    totalDamage += Math.max(1, Math.floor(hitDamage));
  }

  // === PROCESS SHIELD ===
  if (defender.activeBuffs) {
    const shieldResult = processShieldDamage(defender.activeBuffs, totalDamage);
    if (shieldResult.shieldAbsorbed > 0) {
      result.messages.push(`🔷 Shield absorbed ${shieldResult.shieldAbsorbed} damage!`);
      if (shieldResult.shieldBroken) {
        result.messages.push('🔷 Shield broken!');
      }
    }
    totalDamage = shieldResult.remainingDamage;
  }

  // === PROCESS REFLECT ===
  if (defender.activeBuffs) {
    const reflectDmg = processReflectDamage(defender.activeBuffs, totalDamage);
    if (reflectDmg > 0) {
      result.reflectDamage = reflectDmg;
      result.messages.push(`🪞 Reflected ${reflectDmg} damage!`);
    }
  }

  // === PROCESS LIFESTEAL (from skill or buff) ===
  let lifestealPercent = 0;
  
  // From skill effect
  if (skill && typeof skill === 'object' && skill.effects) {
    const lsEffect = skill.effects.find(e => e.type === 'lifesteal');
    if (lsEffect) {
      lifestealPercent += lsEffect.value;
    }
  }
  
  // From active buff
  if (attacker.activeBuffs) {
    const lsBuff = attacker.activeBuffs.find(b => b.id === 'lifesteal');
    if (lsBuff) {
      lifestealPercent += lsBuff.value;
    }
  }
  
  if (lifestealPercent > 0) {
    result.lifestealHeal = Math.floor(totalDamage * lifestealPercent / 100);
    result.messages.push(`🩸 Lifesteal healed ${result.lifestealHeal} HP!`);
  }

  result.damage = totalDamage;
  result.isCritical = isCritical;
  result.hits = hits;

  return result;
}

// ============================================================
// GET EFFECTIVE STATS (Base + Equipment + Buffs)
// ============================================================

export function getEffectiveStats(combatant) {
  // If already has derivedStats calculated, use those
  if (combatant.derivedStats) {
    // Apply active buffs
    if (combatant.activeBuffs && combatant.activeBuffs.length > 0) {
      return applyBuffsToDerivedStats(combatant.derivedStats, combatant.activeBuffs);
    }
    return combatant.derivedStats;
  }
  
  // Calculate from base stats
  const baseStats = combatant.stats || {
    str: combatant.baseAtk || 10,
    agi: 10,
    dex: 10,
    int: 10,
    vit: combatant.baseDef || 10
  };
  
  const derived = calculateDerivedStats(baseStats, null, combatant.level || 1);
  
  // For mobs, also add their base atk/def
  if (combatant.atk) {
    derived.pDmg += combatant.atk;
    derived.mDmg += combatant.atk;
  }
  if (combatant.def) {
    derived.pDef += combatant.def;
    derived.mDef += combatant.def;
  }
  
  // Apply buffs
  if (combatant.activeBuffs && combatant.activeBuffs.length > 0) {
    return applyBuffsToDerivedStats(derived, combatant.activeBuffs);
  }
  
  return derived;
}

// ============================================================
// APPLY SKILL EFFECTS (Buffs, Debuffs, DoTs)
// ============================================================

export function applySkillEffects(skill, attacker, defender) {
  const results = {
    attackerBuffs: [],
    defenderDebuffs: [],
    messages: []
  };
  
  const skillData = typeof skill === 'string' ? getSkill(skill) : skill;
  if (!skillData || !skillData.effects) return results;
  
  const attackerDerived = getEffectiveStats(attacker);
  
  // Check if defender has debuff immunity
  const defenderImmune = defender.activeBuffs ? hasDebuffImmunity(defender.activeBuffs) : false;
  
  skillData.effects.forEach(effect => {
    switch (effect.type) {
      case 'buff': {
        const buff = createBuff(effect.buffType, effect.value, effect.duration);
        if (buff) {
          if (effect.target === 'self') {
            results.attackerBuffs.push(buff);
            results.messages.push(`${buff.icon} ${attacker.name || 'You'} gained ${buff.name}!`);
          }
        }
        break;
      }
      
      case 'debuff': {
        if (defenderImmune) {
          results.messages.push(`🌟 ${defender.name || 'Enemy'} is immune to debuffs!`);
          break;
        }
        const debuff = createBuff(effect.buffType, effect.value, effect.duration);
        if (debuff) {
          results.defenderDebuffs.push(debuff);
          results.messages.push(`${debuff.icon} ${defender.name || 'Enemy'} received ${debuff.name}!`);
        }
        break;
      }
      
      case 'dot': {
        if (defenderImmune) {
          results.messages.push(`🌟 ${defender.name || 'Enemy'} is immune to debuffs!`);
          break;
        }
        // Calculate DoT damage based on scaling
        const scalingStat = effect.dotType === 'burn' ? attackerDerived.mDmg : attackerDerived.pDmg;
        const dotDamage = Math.floor(scalingStat * effect.scaling);
        const dot = createDot(effect.dotType, dotDamage, effect.duration);
        if (dot) {
          results.defenderDebuffs.push(dot);
          results.messages.push(`${dot.icon} ${defender.name || 'Enemy'} is ${dot.name}! (${dotDamage}/turn)`);
        }
        break;
      }
      
      case 'control': {
        if (defenderImmune) {
          results.messages.push(`🌟 ${defender.name || 'Enemy'} is immune to debuffs!`);
          break;
        }
        const chance = effect.chance || 1.0;
        if (Math.random() < chance) {
          const controlBuff = createBuff(effect.controlType, 0, effect.duration);
          if (controlBuff) {
            results.defenderDebuffs.push(controlBuff);
            results.messages.push(`💫 ${defender.name || 'Enemy'} is ${effect.controlType}ned!`);
          }
        }
        break;
      }
      
      case 'shield': {
        let shieldValue = 0;
        if (effect.scalingStat === 'currentMp') {
          shieldValue = Math.floor((attacker.stats?.mp || 50) * effect.multiplier);
        } else if (effect.scalingStat === 'pDef') {
          shieldValue = Math.floor(attackerDerived.pDef * effect.multiplier);
        } else if (effect.scalingStat === 'maxHp') {
          shieldValue = Math.floor(attackerDerived.maxHp * effect.multiplier);
        }
        const shieldBuff = createBuff('shield', shieldValue, 99);
        if (shieldBuff) {
          results.attackerBuffs.push(shieldBuff);
          results.messages.push(`🔷 Created shield (${shieldValue} HP)!`);
        }
        break;
      }
      
      case 'cleanse': {
        if (effect.target === 'self' && attacker.activeBuffs) {
          attacker.activeBuffs = removeAllDebuffs(attacker.activeBuffs);
          results.messages.push('✨ Debuffs removed!');
        }
        break;
      }
      
      case 'selfDamage': {
        const selfDmg = Math.floor((attacker.stats?.hp || 100) * effect.percent / 100);
        results.selfDamage = selfDmg;
        results.messages.push(`💢 Took ${selfDmg} self-damage!`);
        break;
      }
    }
  });
  
  return results;
}

// ============================================================
// PROCESS TURN START (DoTs, Buff Ticks)
// ============================================================

export function processTurnStart(combatant) {
  const results = {
    damage: 0,
    healing: 0,
    skipTurn: false,
    messages: [],
    expiredBuffs: []
  };
  
  if (!combatant.activeBuffs || combatant.activeBuffs.length === 0) {
    return results;
  }
  
  // Check for stun/freeze
  const controlCheck = checkControlEffects(combatant.activeBuffs);
  if (controlCheck.skipTurn) {
    results.skipTurn = true;
    results.messages.push(controlCheck.reason);
  }
  
  // Process DoTs
  const dotResult = processDots(combatant.activeBuffs);
  results.damage = dotResult.totalDamage;
  results.messages.push(...dotResult.messages.map(m => m.text));
  
  // Tick buff durations
  const tickResult = tickBuffs(combatant.activeBuffs);
  combatant.activeBuffs = tickResult.remaining;
  
  tickResult.expired.forEach(buff => {
    results.expiredBuffs.push(buff);
    results.messages.push(`${buff.icon} ${buff.name} expired.`);
  });
  
  // HP/MP Regen (if not a mob)
  if (combatant.derivedStats && !combatant.isMob) {
    if (combatant.derivedStats.hpRegen > 0 && combatant.stats.hp < combatant.stats.maxHp) {
      results.healing = combatant.derivedStats.hpRegen;
      results.messages.push(`💚 Regenerated ${results.healing} HP.`);
    }
  }
  
  return results;
}

// ============================================================
// ENEMY STAT SCALING (10 Towers)
// ============================================================

export function scaleEnemyStats(enemy, floor, towerId) {
  const towerMultipliers = { 1: 1, 2: 1.8, 3: 3, 4: 5, 5: 8, 6: 13, 7: 20, 8: 32, 9: 50, 10: 80 };
  
  const towerMult = towerMultipliers[towerId] || 1;
  const floorMult = 1 + (floor - 1) * 0.08;
  const totalMult = towerMult * floorMult;
  
  // Create base stats for enemy
  const enemyStats = {
    str: Math.floor(10 * totalMult),
    agi: Math.floor(8 * totalMult),
    dex: Math.floor(8 * totalMult),
    int: Math.floor(6 * totalMult),
    vit: Math.floor(12 * totalMult)
  };
  
  const scaledEnemy = {
    ...enemy,
    hp: Math.floor(enemy.baseHp * totalMult),
    maxHp: Math.floor(enemy.baseHp * totalMult),
    atk: Math.floor(enemy.baseAtk * totalMult),
    def: Math.floor(enemy.baseDef * totalMult),
    expReward: Math.floor(enemy.expReward * totalMult),
    goldReward: {
      min: Math.floor((enemy.goldReward?.min || 10) * totalMult),
      max: Math.floor((enemy.goldReward?.max || 20) * totalMult)
    },
    stats: enemyStats,
    activeBuffs: [],
    element: enemy.element || 'none',
    resistances: enemy.resistances || {}
  };
  
  // Calculate derived stats for enemy
  scaledEnemy.derivedStats = calculateDerivedStats(enemyStats, null, floor);
  scaledEnemy.derivedStats.pDmg += scaledEnemy.atk;
  scaledEnemy.derivedStats.mDmg += scaledEnemy.atk;
  scaledEnemy.derivedStats.pDef += scaledEnemy.def;
  scaledEnemy.derivedStats.mDef += Math.floor(scaledEnemy.def * 0.5);
  
  return scaledEnemy;
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
  if (typeof goldReward === 'number') return goldReward;
  if (!goldReward || typeof goldReward !== 'object') return 10;
  return Math.floor(goldReward.min + Math.random() * (goldReward.max - goldReward.min));
}

// ============================================================
// ITEM DROPS
// ============================================================

export function rollForDrops(enemy, dropRates, equipmentTable, playerClass, towerId) {
  const drops = [];
  const tid = towerId || 1;
  
  // Set item drop
  if (enemy.isBoss && Math.random() < (dropRates.setItem || 0.18)) {
    const setItem = getSetItemDrop(tid, playerClass);
    if (setItem) drops.push({ ...setItem, quantity: 1, isSetItem: true });
  } else if (enemy.isElite && Math.random() < (dropRates.setItemElite || 0.07)) {
    const setItem = getSetItemDrop(tid, playerClass);
    if (setItem) drops.push({ ...setItem, quantity: 1, isSetItem: true });
  } else if (Math.random() < (dropRates.setItemNormal || 0.02)) {
    const setItem = getSetItemDrop(tid, playerClass);
    if (setItem) drops.push({ ...setItem, quantity: 1, isSetItem: true });
  }
  
  // Regular equipment drop
  const equipRate = enemy.isBoss ? 0.25 : (enemy.isElite ? 0.15 : 0.07);
  if (Math.random() < (dropRates.equipment || equipRate)) {
    const item = getRandomEquipment(tid, playerClass, enemy.isElite, enemy.isBoss);
    if (item) drops.push({ ...item, quantity: 1 });
  }
  
  // Material drop
  const matRate = enemy.isBoss ? 0.50 : (enemy.isElite ? 0.30 : 0.18);
  if (Math.random() < (dropRates.material || matRate)) {
    drops.push({
      itemId: `material_t${tid}_${Math.random().toString(36).substr(2, 5)}`,
      name: `Tower ${tid} Material`,
      icon: '💎',
      type: 'material',
      quantity: enemy.isBoss ? 3 : (enemy.isElite ? 2 : 1),
      stackable: true,
      rarity: enemy.isBoss ? 'rare' : 'common'
    });
  }
  
  // Potion drop
  if (Math.random() < (dropRates.potion || 0.20)) {
    if (Math.random() < 0.5) {
      drops.push({ itemId: 'health_potion_small', name: 'Small HP Potion', icon: '🧪', type: 'consumable', quantity: 1, stackable: true });
    } else {
      drops.push({ itemId: 'mana_potion_small', name: 'Small MP Potion', icon: '💎', type: 'consumable', quantity: 1, stackable: true });
    }
  }
  
  return drops;
}

// ============================================================
// HIDDEN CLASS SCROLL DROP (Boss Only)
// ============================================================

export function rollForScroll(enemy, playerClass) {
  // Only bosses can drop scrolls
  if (!enemy.isBoss) return null;
  
  const dropChance = 0.06; // 6% from bosses
  if (Math.random() >= dropChance) return null;
  
  // All possible scrolls for the player's base class
  const scrollMap = {
    swordsman: [
      { id: 'scroll_flameblade', name: 'Flameblade Scroll', icon: '📜🔥', hiddenClass: 'flameblade' },
      { id: 'scroll_berserker', name: 'Berserker Scroll', icon: '📜💢', hiddenClass: 'berserker' },
      { id: 'scroll_paladin', name: 'Paladin Scroll', icon: '📜✨', hiddenClass: 'paladin' },
      { id: 'scroll_earthshaker', name: 'Earthshaker Scroll', icon: '📜🌍', hiddenClass: 'earthshaker' },
      { id: 'scroll_frostguard', name: 'Frostguard Scroll', icon: '📜❄️', hiddenClass: 'frostguard' }
    ],
    thief: [
      { id: 'scroll_shadowDancer', name: 'Shadow Dancer Scroll', icon: '📜🌑', hiddenClass: 'shadowDancer' },
      { id: 'scroll_venomancer', name: 'Venomancer Scroll', icon: '📜🐍', hiddenClass: 'venomancer' },
      { id: 'scroll_assassin', name: 'Assassin Scroll', icon: '📜⚫', hiddenClass: 'assassin' },
      { id: 'scroll_phantom', name: 'Phantom Scroll', icon: '📜👻', hiddenClass: 'phantom' },
      { id: 'scroll_bloodreaper', name: 'Bloodreaper Scroll', icon: '📜🩸', hiddenClass: 'bloodreaper' }
    ],
    archer: [
      { id: 'scroll_stormRanger', name: 'Storm Ranger Scroll', icon: '📜⚡', hiddenClass: 'stormRanger' },
      { id: 'scroll_pyroArcher', name: 'Pyro Archer Scroll', icon: '📜🔥', hiddenClass: 'pyroArcher' },
      { id: 'scroll_frostSniper', name: 'Frost Sniper Scroll', icon: '📜❄️', hiddenClass: 'frostSniper' },
      { id: 'scroll_natureWarden', name: 'Nature Warden Scroll', icon: '📜🌿', hiddenClass: 'natureWarden' },
      { id: 'scroll_voidHunter', name: 'Void Hunter Scroll', icon: '📜🌀', hiddenClass: 'voidHunter' }
    ],
    mage: [
      { id: 'scroll_frostWeaver', name: 'Frost Weaver Scroll', icon: '📜❄️', hiddenClass: 'frostWeaver' },
      { id: 'scroll_pyromancer', name: 'Pyromancer Scroll', icon: '📜🔥', hiddenClass: 'pyromancer' },
      { id: 'scroll_stormcaller', name: 'Stormcaller Scroll', icon: '📜⚡', hiddenClass: 'stormcaller' },
      { id: 'scroll_necromancer', name: 'Necromancer Scroll', icon: '📜💀', hiddenClass: 'necromancer' },
      { id: 'scroll_arcanist', name: 'Arcanist Scroll', icon: '📜✨', hiddenClass: 'arcanist' }
    ]
  };
  
  const scrolls = scrollMap[playerClass];
  if (!scrolls || scrolls.length === 0) return null;
  
  // Pick random scroll
  const scroll = scrolls[Math.floor(Math.random() * scrolls.length)];
  return { ...scroll, rarity: 'legendary', type: 'scroll', quantity: 1 };
}

// ============================================================
// CHECK EXECUTE CONDITION
// ============================================================

export function checkExecuteCondition(skill, defender) {
  const skillData = typeof skill === 'string' ? getSkill(skill) : skill;
  if (!skillData || !skillData.effects) return { canUse: true, bonusMultiplier: 0 };
  
  const hpPercent = (defender.hp / defender.maxHp) * 100;
  
  for (const effect of skillData.effects) {
    // Execute bonus (extra damage below threshold)
    if (effect.type === 'executeBonus') {
      if (hpPercent < effect.threshold) {
        return { canUse: true, bonusMultiplier: effect.bonusMultiplier };
      }
    }
    
    // Require HP threshold (can only use below threshold)
    if (effect.type === 'requireHpThreshold') {
      if (hpPercent >= effect.threshold) {
        return { canUse: false, reason: `Can only use when enemy HP < ${effect.threshold}%` };
      }
    }
  }
  
  return { canUse: true, bonusMultiplier: 0 };
}

// ============================================================
// FORMAT COMBAT LOG MESSAGE
// ============================================================

export function formatCombatMessage(result, attackerName, defenderName, skillName = null) {
  const messages = [];
  
  if (result.missed) {
    messages.push(`${attackerName}'s attack missed!`);
    return messages;
  }
  
  if (result.isHeal) {
    messages.push(`${attackerName} healed for ${result.damage} HP!`);
    return messages;
  }
  
  let mainMsg = '';
  if (skillName) {
    mainMsg = `${attackerName} used ${skillName}`;
  } else {
    mainMsg = `${attackerName} attacked`;
  }
  
  if (result.hits > 1) {
    mainMsg += ` (${result.hits} hits)`;
  }
  
  mainMsg += ` for ${result.damage} damage`;
  
  if (result.isCritical) {
    mainMsg += ' 💥CRIT!';
  }
  
  if (result.element && result.element !== 'none') {
    const elementIcons = { fire: '🔥', water: '💧', lightning: '⚡', earth: '🌍', nature: '🌿', ice: '❄️', dark: '🌑', holy: '✨' };
    mainMsg += ` ${elementIcons[result.element] || ''}`;
  }
  
  messages.push(mainMsg);
  
  // Add additional messages
  if (result.messages) {
    messages.push(...result.messages);
  }
  
  return messages;
}

// ============================================================
// EXPORTS
// ============================================================

export default {
  calculateDamage,
  getEffectiveStats,
  applySkillEffects,
  processTurnStart,
  scaleEnemyStats,
  getRandomEnemy,
  calculateGoldDrop,
  rollForDrops,
  rollForScroll,
  checkExecuteCondition,
  formatCombatMessage
};
