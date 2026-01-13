import { SKILLS } from '../data/gameData.js';

// Calculate damage dealt
export function calculateDamage(attacker, defender, skill = null) {
  let baseDamage;
  let attackStat;
  
  // Determine attack type and stat
  if (skill && skill.type === 'magic') {
    attackStat = attacker.stats?.int || attacker.baseAtk;
    baseDamage = attackStat * (skill.damage || 1);
  } else {
    // Physical damage uses STR for swordsman, AGI for thief, DEX for archer
    attackStat = attacker.stats?.str || attacker.stats?.agi || attacker.stats?.dex || attacker.baseAtk;
    baseDamage = attackStat * (skill?.damage || 1);
  }
  
  // Apply skill multiplier
  if (skill && skill.hits) {
    baseDamage = baseDamage * skill.hits * 0.4; // Multi-hit skills
  }
  
  // Defense reduction
  const defense = defender.stats?.vit || defender.baseDef || 0;
  const damageReduction = defense * 0.5;
  
  // Final damage calculation with randomness
  const variance = 0.9 + Math.random() * 0.2; // 90% - 110%
  let finalDamage = Math.max(1, Math.floor((baseDamage - damageReduction) * variance));
  
  // Critical hit check
  const critChance = (attacker.stats?.agi || 0) * 0.01 + (skill?.critBonus || 0);
  const isCritical = Math.random() < critChance;
  if (isCritical) {
    finalDamage = Math.floor(finalDamage * 1.5);
  }
  
  return { damage: finalDamage, isCritical };
}

// Calculate enemy stats based on floor level
export function scaleEnemyStats(enemy, floor, towerId) {
  const towerMultiplier = towerId === 1 ? 1 : 1.8;
  const floorMultiplier = 1 + (floor - 1) * 0.1;
  const totalMultiplier = towerMultiplier * floorMultiplier;
  
  return {
    ...enemy,
    hp: Math.floor(enemy.baseHp * totalMultiplier),
    maxHp: Math.floor(enemy.baseHp * totalMultiplier),
    atk: Math.floor(enemy.baseAtk * totalMultiplier),
    def: Math.floor(enemy.baseDef * totalMultiplier),
    expReward: Math.floor(enemy.expReward * totalMultiplier),
    goldReward: {
      min: Math.floor(enemy.goldReward.min * totalMultiplier),
      max: Math.floor(enemy.goldReward.max * totalMultiplier)
    }
  };
}

// Get random enemy for floor
export function getRandomEnemy(enemies, floor) {
  // Filter enemies that can appear on this floor
  const availableEnemies = enemies.filter(e => e.floors.includes(floor));
  
  if (availableEnemies.length === 0) {
    return enemies[0]; // Fallback
  }
  
  return availableEnemies[Math.floor(Math.random() * availableEnemies.length)];
}

// Calculate gold drop
export function calculateGoldDrop(goldReward) {
  return Math.floor(
    goldReward.min + Math.random() * (goldReward.max - goldReward.min)
  );
}

// Check for item drops
export function rollForDrops(enemy, dropRates, equipmentTable, playerClass) {
  const drops = [];
  
  // Equipment drop
  if (Math.random() < dropRates.equipment) {
    const rarityRoll = Math.random();
    let pool;
    
    if (rarityRoll < 0.7 && equipmentTable.common) {
      pool = equipmentTable.common;
    } else if (equipmentTable.uncommon) {
      pool = equipmentTable.uncommon;
    } else if (equipmentTable.rare) {
      pool = equipmentTable.rare;
    }
    
    if (pool && pool.length > 0) {
      // Filter by class or get class-neutral items
      const classItems = pool.filter(item => !item.classReq || item.classReq === playerClass);
      if (classItems.length > 0) {
        const item = classItems[Math.floor(Math.random() * classItems.length)];
        drops.push({ ...item, quantity: 1 });
      }
    }
  }
  
  // Potion drop
  if (Math.random() < dropRates.potion) {
    const potionRoll = Math.random();
    if (potionRoll < 0.5) {
      drops.push({ id: 'health_potion_small', name: 'Small Health Potion', icon: '🧪', type: 'consumable', quantity: 1 });
    } else {
      drops.push({ id: 'mana_potion_small', name: 'Small Mana Potion', icon: '💎', type: 'consumable', quantity: 1 });
    }
  }
  
  return drops;
}

// Check for hidden class scroll drop
export function rollForScroll(enemy, playerClass) {
  if (!enemy.scrollDropChance) return null;
  
  if (Math.random() < enemy.scrollDropChance) {
    // Return scroll matching player's class
    const scrollMap = {
      swordsman: { id: 'scroll_flameblade', name: 'Flameblade Scroll', icon: '📜🔥', rarity: 'rare' },
      thief: { id: 'scroll_shadow_dancer', name: 'Shadow Dancer Scroll', icon: '📜🌑', rarity: 'rare' },
      archer: { id: 'scroll_storm_ranger', name: 'Storm Ranger Scroll', icon: '📜⚡', rarity: 'rare' },
      mage: { id: 'scroll_frost_weaver', name: 'Frost Weaver Scroll', icon: '📜❄️', rarity: 'rare' }
    };
    
    return scrollMap[playerClass] || null;
  }
  
  return null;
}

// Apply skill effects
export function applySkillEffect(skill, target, source) {
  const effects = [];
  
  if (!skill.effect) return effects;
  
  switch (skill.effect) {
    case 'poison':
      effects.push({ type: 'poison', duration: 3, damage: Math.floor(source.stats.agi * 0.3) });
      break;
    case 'stun':
      if (Math.random() < 0.3) {
        effects.push({ type: 'stun', duration: 1 });
      }
      break;
    case 'slow':
      effects.push({ type: 'slow', duration: 2 });
      break;
    case 'buff_atk':
      effects.push({ type: 'buff_atk', duration: 3, value: Math.floor(source.stats.str * 0.2) });
      break;
    case 'evasion':
      effects.push({ type: 'evasion', duration: 2, value: 0.3 });
      break;
    case 'accuracy':
      effects.push({ type: 'accuracy', duration: 3, value: 0.2 });
      break;
    case 'shield':
      effects.push({ type: 'shield', duration: 3, value: Math.floor(source.stats.int * 2) });
      break;
  }
  
  return effects;
}

// Process status effects at turn start
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
        messages.push(`${combatant.name} takes ${effect.damage} poison damage!`);
        break;
      case 'stun':
        skipTurn = true;
        messages.push(`${combatant.name} is stunned!`);
        break;
    }
    
    effect.duration--;
    if (effect.duration <= 0) {
      expiredEffects.push(index);
    }
  });
  
  return { damage, skipTurn, expiredEffects, messages };
}
