import express from 'express';
import Character from '../models/Character.js';
import FloorMap from '../models/FloorMap.js';
import { authenticate } from '../middleware/auth.js';
import { TOWERS, ENEMIES } from '../data/towerData.js';

// Skill database (simplified - you can import from skillDatabase.js if you have it)
const getSkill = (skillId) => {
  const SKILLS = {
    slash: { name: 'Slash', mpCost: 5, damage: 1.2, damageType: 'physical' },
    heavyStrike: { name: 'Heavy Strike', mpCost: 12, damage: 1.8, damageType: 'physical' },
    shieldBash: { name: 'Shield Bash', mpCost: 8, damage: 1.0, damageType: 'physical' },
    warCry: { name: 'War Cry', mpCost: 15, damage: 0, damageType: 'buff' },
    backstab: { name: 'Backstab', mpCost: 8, damage: 2.0, damageType: 'physical' },
    poisonBlade: { name: 'Poison Blade', mpCost: 10, damage: 1.0, damageType: 'physical' },
    smokeScreen: { name: 'Smoke Screen', mpCost: 12, damage: 0, damageType: 'buff' },
    steal: { name: 'Steal', mpCost: 5, damage: 0, damageType: 'utility' },
    preciseShot: { name: 'Precise Shot', mpCost: 6, damage: 1.5, damageType: 'physical' },
    multiShot: { name: 'Multi Shot', mpCost: 14, damage: 0.6, hits: 3, damageType: 'physical' },
    eagleEye: { name: 'Eagle Eye', mpCost: 10, damage: 0, damageType: 'buff' },
    arrowRain: { name: 'Arrow Rain', mpCost: 20, damage: 2.2, damageType: 'physical' },
    fireball: { name: 'Fireball', mpCost: 10, damage: 1.6, damageType: 'magical' },
    iceSpear: { name: 'Ice Spear', mpCost: 12, damage: 1.4, damageType: 'magical' },
    manaShield: { name: 'Mana Shield', mpCost: 15, damage: 0, damageType: 'buff' },
    thunderbolt: { name: 'Thunderbolt', mpCost: 18, damage: 2.0, damageType: 'magical' },
    // Hidden class skills
    flameSlash: { name: 'Flame Slash', mpCost: 15, damage: 1.8, damageType: 'physical' },
    infernoStrike: { name: 'Inferno Strike', mpCost: 25, damage: 2.8, damageType: 'physical' },
    shadowStrike: { name: 'Shadow Strike', mpCost: 12, damage: 2.2, damageType: 'physical' },
    lightningArrow: { name: 'Lightning Arrow', mpCost: 14, damage: 2.0, damageType: 'physical' },
    frostBolt: { name: 'Frost Bolt', mpCost: 12, damage: 1.6, damageType: 'magical' }
  };
  return SKILLS[skillId] || { name: 'Attack', mpCost: 0, damage: 1.0, damageType: 'physical' };
};

const router = express.Router();
const ENERGY_PER_EXPLORATION = 5;

// ============================================================
// GET /api/exploration/map - Get or generate floor map
// ============================================================
router.get('/map', authenticate, async (req, res) => {
  try {
    const character = await Character.findOne({ userId: req.userId });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    
    const { towerId, floor } = req.query;
    const towerNum = parseInt(towerId) || character.currentTower;
    const floorNum = parseInt(floor) || character.currentFloor;
    
    // Check if map exists
    let floorMap = await FloorMap.findOne({
      characterId: character._id,
      towerId: towerNum,
      floor: floorNum,
      completed: false
    });
    
    // Generate new map if none exists
    if (!floorMap) {
      floorMap = FloorMap.generateFloorMap(
        character._id,
        towerNum,
        floorNum,
        TOWERS[towerNum],
        ENEMIES
      );
      await floorMap.save();
    }
    
    // Get tower info
    const tower = TOWERS[towerNum];
    
    res.json({
      map: floorMap,
      tower: {
        id: tower.id,
        name: tower.name,
        description: tower.description,
        theme: tower.theme
      },
      floor: floorNum,
      character: {
        hp: character.stats.hp,
        maxHp: character.stats.maxHp,
        mp: character.stats.mp,
        maxMp: character.stats.maxMp,
        energy: character.energy
      }
    });
  } catch (error) {
    console.error('Get map error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================================
// POST /api/exploration/move - Move to a node
// ============================================================
router.post('/move', authenticate, async (req, res) => {
  try {
    const { nodeId } = req.body;
    const character = await Character.findOne({ userId: req.userId });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    
    const floorMap = await FloorMap.findOne({
      characterId: character._id,
      towerId: character.currentTower,
      floor: character.currentFloor,
      completed: false
    });
    
    if (!floorMap) return res.status(404).json({ error: 'No active floor map' });
    
    // Find current and target nodes
    const currentNode = floorMap.nodes.find(n => n.id === floorMap.currentNodeId);
    const targetNode = floorMap.nodes.find(n => n.id === nodeId);
    
    if (!targetNode) return res.status(400).json({ error: 'Invalid node' });
    
    // Check if movement is valid (must be connected from current)
    if (!currentNode.connections.includes(nodeId) && currentNode.id !== nodeId) {
      return res.status(400).json({ error: 'Cannot move to that node' });
    }
    
    // Check energy
    if (character.energy < ENERGY_PER_EXPLORATION) {
      return res.status(400).json({ error: 'Not enough energy' });
    }
    
    // Deduct energy and move
    character.energy -= ENERGY_PER_EXPLORATION;
    character.isInTower = true;
    floorMap.currentNodeId = nodeId;
    targetNode.visited = true;
    
    await character.save();
    await floorMap.save();
    
    // Return node data for frontend to handle
    res.json({
      success: true,
      node: targetNode,
      energy: character.energy,
      nodeType: targetNode.type
    });
  } catch (error) {
    console.error('Move error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================================
// POST /api/exploration/combat/start - Start combat at node
// ============================================================
router.post('/combat/start', authenticate, async (req, res) => {
  try {
    const character = await Character.findOne({ userId: req.userId });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    
    const floorMap = await FloorMap.findOne({
      characterId: character._id,
      towerId: character.currentTower,
      floor: character.currentFloor,
      completed: false
    });
    
    if (!floorMap) return res.status(404).json({ error: 'No active floor map' });
    
    const currentNode = floorMap.nodes.find(n => n.id === floorMap.currentNodeId);
    if (!['combat', 'elite', 'boss'].includes(currentNode.type)) {
      return res.status(400).json({ error: 'Not a combat node' });
    }
    
    if (currentNode.cleared) {
      return res.status(400).json({ error: 'Node already cleared' });
    }
    
    // Initialize combat state
    floorMap.activeCombat = {
      nodeId: currentNode.id,
      wave: 1,
      enemies: currentNode.enemies.map(e => ({
        ...e,
        buffs: [],
        debuffs: []
      })),
      turnCount: 0,
      combatLog: [{ actor: 'system', message: `Combat started! Wave 1/${currentNode.waves}`, type: 'info' }],
      playerBuffs: []
    };
    
    await floorMap.save();
    
    res.json({
      combat: floorMap.activeCombat,
      waves: currentNode.waves,
      character: {
        hp: character.stats.hp,
        maxHp: character.stats.maxHp,
        mp: character.stats.mp,
        maxMp: character.stats.maxMp,
        skills: character.skills
      }
    });
  } catch (error) {
    console.error('Combat start error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================================
// POST /api/exploration/combat/action - Player combat action
// ============================================================
router.post('/combat/action', authenticate, async (req, res) => {
  try {
    const { action, skillId, targetIndex } = req.body;
    const character = await Character.findOne({ userId: req.userId });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    
    const floorMap = await FloorMap.findOne({
      characterId: character._id,
      completed: false,
      'activeCombat.nodeId': { $exists: true }
    });
    
    if (!floorMap || !floorMap.activeCombat) {
      return res.status(400).json({ error: 'No active combat' });
    }
    
    const combat = floorMap.activeCombat;
    const currentNode = floorMap.nodes.find(n => n.id === combat.nodeId);
    const combatLog = [];
    
    // Calculate derived stats
    const derivedStats = Character.calculateDerivedStats(character);
    
    // ========== PLAYER TURN ==========
    if (action === 'attack') {
      // Basic attack
      const target = combat.enemies[targetIndex || 0];
      if (!target || target.hp <= 0) {
        return res.status(400).json({ error: 'Invalid target' });
      }
      
      const damage = calculateDamage(derivedStats.pDmg, target.def, derivedStats.critRate, derivedStats.critDmg);
      target.hp = Math.max(0, target.hp - damage.total);
      
      combatLog.push({
        actor: 'player',
        message: `You attack ${target.name} for ${damage.total} damage${damage.isCrit ? ' (CRITICAL!)' : ''}!`,
        damage: damage.total,
        type: damage.isCrit ? 'crit' : 'damage'
      });
      
    } else if (action === 'skill') {
      // Use skill
      const skill = getSkill(skillId);
      if (!skill) return res.status(400).json({ error: 'Invalid skill' });
      
      if (character.stats.mp < skill.mpCost) {
        return res.status(400).json({ error: 'Not enough MP' });
      }
      
      character.stats.mp -= skill.mpCost;
      
      const target = combat.enemies[targetIndex || 0];
      if (!target || target.hp <= 0) {
        return res.status(400).json({ error: 'Invalid target' });
      }
      
      const baseDmg = skill.damageType === 'magical' ? derivedStats.mDmg : derivedStats.pDmg;
      const skillDmg = Math.floor(baseDmg * (skill.damage || 1));
      const hits = skill.hits || 1;
      let totalDamage = 0;
      
      for (let i = 0; i < hits; i++) {
        const damage = calculateDamage(skillDmg, target.def, derivedStats.critRate, derivedStats.critDmg);
        target.hp = Math.max(0, target.hp - damage.total);
        totalDamage += damage.total;
      }
      
      combatLog.push({
        actor: 'player',
        message: `You use ${skill.name} on ${target.name} for ${totalDamage} damage!`,
        damage: totalDamage,
        type: 'skill'
      });
      
    } else if (action === 'defend') {
      // Defend - reduce damage taken next turn
      combat.playerBuffs.push({ type: 'defend', duration: 1, value: 50 });
      combatLog.push({
        actor: 'player',
        message: 'You take a defensive stance! (50% damage reduction)',
        type: 'buff'
      });
    }
    
    // Check if all enemies dead
    const aliveEnemies = combat.enemies.filter(e => e.hp > 0);
    
    if (aliveEnemies.length === 0) {
      // Wave/combat complete
      if (combat.wave < currentNode.waves) {
        // Next wave
        combat.wave++;
        combat.enemies = generateWaveEnemies(currentNode, combat.wave, character.currentTower, character.currentFloor);
        combatLog.push({ actor: 'system', message: `Wave ${combat.wave}/${currentNode.waves} begins!`, type: 'info' });
      } else {
        // Combat victory!
        const rewards = calculateRewards(currentNode, character);
        
        // Apply rewards
        character.experience += rewards.exp;
        character.gold += rewards.gold;
        character.statistics.totalKills += currentNode.enemies.length;
        if (currentNode.type === 'elite') character.statistics.eliteKills++;
        if (currentNode.type === 'boss') character.statistics.bossKills++;
        
        // Check level up
        const leveledUp = checkLevelUp(character);
        
        // Mark node as cleared
        currentNode.cleared = true;
        floorMap.activeCombat = null;
        
        // Check if boss - advance floor
        if (currentNode.type === 'boss') {
          character.currentFloor++;
          character.statistics.floorsCleared++;
          floorMap.completed = true;
          character.isInTower = false;
        }
        
        await character.save();
        await floorMap.save();
        
        return res.json({
          status: 'victory',
          combatLog: [...combat.combatLog, ...combatLog, { actor: 'system', message: 'Victory!', type: 'victory' }],
          rewards,
          leveledUp,
          floorComplete: currentNode.type === 'boss',
          character: {
            hp: character.stats.hp,
            maxHp: character.stats.maxHp,
            mp: character.stats.mp,
            maxMp: character.stats.maxMp,
            level: character.level,
            exp: character.experience,
            expToLevel: character.experienceToNextLevel,
            gold: character.gold
          }
        });
      }
    }
    
    // ========== ENEMY TURN ==========
    for (const enemy of aliveEnemies) {
      // Check defend buff
      const defendBuff = combat.playerBuffs.find(b => b.type === 'defend');
      const damageReduction = defendBuff ? defendBuff.value / 100 : 0;
      
      const enemyDamage = calculateEnemyDamage(enemy.atk, derivedStats.pDef, damageReduction);
      character.stats.hp = Math.max(0, character.stats.hp - enemyDamage);
      
      combatLog.push({
        actor: 'enemy',
        message: `${enemy.name} attacks you for ${enemyDamage} damage!`,
        damage: enemyDamage,
        type: 'enemy'
      });
    }
    
    // Reduce buff durations
    combat.playerBuffs = combat.playerBuffs
      .map(b => ({ ...b, duration: b.duration - 1 }))
      .filter(b => b.duration > 0);
    
    // Check player death
    if (character.stats.hp <= 0) {
      character.stats.hp = 0;
      character.statistics.deaths++;
      character.currentFloor = Math.max(1, character.currentFloor - 1);
      character.isInTower = false;
      floorMap.activeCombat = null;
      
      await character.save();
      await floorMap.save();
      
      return res.json({
        status: 'defeat',
        combatLog: [...combat.combatLog, ...combatLog, { actor: 'system', message: 'You have been defeated!', type: 'defeat' }],
        character: {
          hp: 0,
          maxHp: character.stats.maxHp
        }
      });
    }
    
    // Update combat state
    combat.turnCount++;
    combat.combatLog = [...combat.combatLog, ...combatLog];
    
    await character.save();
    await floorMap.save();
    
    res.json({
      status: 'ongoing',
      combat: floorMap.activeCombat,
      character: {
        hp: character.stats.hp,
        maxHp: character.stats.maxHp,
        mp: character.stats.mp,
        maxMp: character.stats.maxMp
      }
    });
    
  } catch (error) {
    console.error('Combat action error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================================
// POST /api/exploration/interact - Interact with non-combat node
// ============================================================
router.post('/interact', authenticate, async (req, res) => {
  try {
    const { choice } = req.body;
    const character = await Character.findOne({ userId: req.userId });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    
    const floorMap = await FloorMap.findOne({
      characterId: character._id,
      completed: false
    });
    
    if (!floorMap) return res.status(404).json({ error: 'No active floor map' });
    
    const currentNode = floorMap.nodes.find(n => n.id === floorMap.currentNodeId);
    if (currentNode.cleared) {
      return res.status(400).json({ error: 'Node already cleared' });
    }
    
    let result = { message: '', rewards: {} };
    
    switch (currentNode.type) {
      case 'treasure':
        // Collect treasure
        if (currentNode.rewards) {
          character.gold += currentNode.rewards.gold || 0;
          character.experience += currentNode.rewards.exp || 0;
          if (currentNode.rewards.healPercent) {
            const healAmount = Math.floor(character.stats.maxHp * currentNode.rewards.healPercent / 100);
            character.stats.hp = Math.min(character.stats.maxHp, character.stats.hp + healAmount);
          }
          result.message = `Found treasure! +${currentNode.rewards.gold} gold, +${currentNode.rewards.exp} exp`;
          result.rewards = currentNode.rewards;
        }
        break;
        
      case 'rest':
        // Rest and heal
        const healPercent = 30;
        const healAmount = Math.floor(character.stats.maxHp * healPercent / 100);
        const mpHeal = Math.floor(character.stats.maxMp * healPercent / 100);
        character.stats.hp = Math.min(character.stats.maxHp, character.stats.hp + healAmount);
        character.stats.mp = Math.min(character.stats.maxMp, character.stats.mp + mpHeal);
        result.message = `You rest and recover ${healAmount} HP and ${mpHeal} MP.`;
        result.rewards = { healedHp: healAmount, healedMp: mpHeal };
        break;
        
      case 'mystery':
        // Handle mystery choice
        result = handleMysteryChoice(currentNode.scenario, choice, character);
        break;
        
      case 'shrine':
        // Random buff
        const buffs = ['strength', 'defense', 'speed', 'luck'];
        const buff = buffs[Math.floor(Math.random() * buffs.length)];
        result.message = `The shrine grants you a blessing of ${buff}!`;
        result.rewards = { buff };
        break;
        
      case 'merchant':
        // Return merchant inventory (frontend handles shop)
        result.message = 'A merchant appears!';
        result.merchant = generateMerchantStock(character.currentTower, character.currentFloor);
        break;
    }
    
    currentNode.cleared = true;
    await character.save();
    await floorMap.save();
    
    res.json({
      success: true,
      ...result,
      character: {
        hp: character.stats.hp,
        maxHp: character.stats.maxHp,
        mp: character.stats.mp,
        maxMp: character.stats.maxMp,
        gold: character.gold,
        exp: character.experience
      }
    });
    
  } catch (error) {
    console.error('Interact error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================================
// POST /api/exploration/leave - Leave tower (forfeit current floor)
// ============================================================
router.post('/leave', authenticate, async (req, res) => {
  try {
    const character = await Character.findOne({ userId: req.userId });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    
    // Clear active floor map
    await FloorMap.deleteMany({
      characterId: character._id,
      completed: false
    });
    
    character.isInTower = false;
    await character.save();
    
    res.json({
      success: true,
      message: 'You retreat from the tower.'
    });
  } catch (error) {
    console.error('Leave error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function calculateDamage(atk, def, critRate, critDmg) {
  const isCrit = Math.random() * 100 < critRate;
  const baseDamage = Math.max(1, atk - def * 0.5);
  const finalDamage = isCrit ? Math.floor(baseDamage * (critDmg / 100)) : Math.floor(baseDamage);
  return { total: finalDamage, isCrit };
}

function calculateEnemyDamage(atk, def, reduction = 0) {
  const baseDamage = Math.max(1, atk - def * 0.3);
  return Math.floor(baseDamage * (1 - reduction));
}

function calculateRewards(node, character) {
  const baseExp = node.enemies.reduce((sum, e) => sum + (e.expReward || 20), 0);
  const baseGold = node.enemies.reduce((sum, e) => {
    const reward = e.goldReward || { min: 10, max: 30 };
    return sum + Math.floor(reward.min + Math.random() * (reward.max - reward.min));
  }, 0);
  
  const multiplier = node.type === 'boss' ? 3 : (node.type === 'elite' ? 2 : 1);
  
  return {
    exp: Math.floor(baseExp * multiplier),
    gold: Math.floor(baseGold * multiplier),
    items: [] // TODO: Add item drops
  };
}

function checkLevelUp(character) {
  let leveledUp = false;
  while (character.experience >= character.experienceToNextLevel) {
    character.experience -= character.experienceToNextLevel;
    character.level++;
    character.statPoints += 5;
    character.experienceToNextLevel = Math.floor(100 * Math.pow(1.15, character.level - 1));
    
    // Increase max HP/MP
    character.stats.maxHp += 10 + character.stats.vit * 2;
    character.stats.maxMp += 5 + character.stats.int;
    character.stats.hp = character.stats.maxHp;
    character.stats.mp = character.stats.maxMp;
    
    leveledUp = true;
  }
  return leveledUp;
}

function generateWaveEnemies(node, wave, towerId, floor) {
  // Generate new enemies for next wave (simplified)
  const towerEnemies = ENEMIES[`tower${towerId}`];
  if (!towerEnemies || !towerEnemies.normal) return [];
  
  const floorScale = 1 + (floor - 1) * 0.1;
  const waveScale = 1 + (wave - 1) * 0.15;
  const count = Math.min(wave + 1, 3);
  
  const enemies = [];
  for (let i = 0; i < count; i++) {
    const template = towerEnemies.normal[Math.floor(Math.random() * towerEnemies.normal.length)];
    enemies.push({
      ...template,
      instanceId: `${template.id}_w${wave}_${i}`,
      hp: Math.floor(template.baseHp * floorScale * waveScale),
      maxHp: Math.floor(template.baseHp * floorScale * waveScale),
      atk: Math.floor(template.baseAtk * floorScale * waveScale),
      def: Math.floor(template.baseDef * floorScale * waveScale),
      buffs: [],
      debuffs: []
    });
  }
  
  return enemies;
}

function handleMysteryChoice(scenario, choice, character) {
  const outcomes = {
    'ancient_chest': {
      'open': () => {
        if (Math.random() < 0.6) {
          const gold = Math.floor(50 + Math.random() * 100);
          character.gold += gold;
          return { message: `The chest contains ${gold} gold!`, rewards: { gold } };
        } else {
          const damage = Math.floor(character.stats.maxHp * 0.15);
          character.stats.hp = Math.max(1, character.stats.hp - damage);
          return { message: `It was a trap! You take ${damage} damage!`, rewards: { damage } };
        }
      },
      'leave': () => ({ message: 'You leave the chest alone. Better safe than sorry.', rewards: {} })
    },
    'wounded_traveler': {
      'help': () => {
        const exp = 30;
        character.experience += exp;
        return { message: `The traveler thanks you and shares wisdom. +${exp} EXP`, rewards: { exp } };
      },
      'ignore': () => ({ message: 'You continue on your way.', rewards: {} })
    },
    'strange_altar': {
      'pray': () => {
        if (Math.random() < 0.7) {
          const heal = Math.floor(character.stats.maxHp * 0.25);
          character.stats.hp = Math.min(character.stats.maxHp, character.stats.hp + heal);
          return { message: `Divine light heals you for ${heal} HP!`, rewards: { heal } };
        } else {
          return { message: 'Nothing happens...', rewards: {} };
        }
      },
      'destroy': () => {
        const gold = Math.floor(30 + Math.random() * 70);
        character.gold += gold;
        return { message: `You find ${gold} gold hidden inside!`, rewards: { gold } };
      }
    },
    'gambling_imp': {
      'accept': () => {
        const bet = Math.min(character.gold, 100);
        if (Math.random() < 0.4) {
          character.gold += bet;
          return { message: `You win! +${bet} gold!`, rewards: { gold: bet } };
        } else {
          character.gold -= bet;
          return { message: `You lose ${bet} gold...`, rewards: { gold: -bet } };
        }
      },
      'decline': () => ({ message: 'The imp vanishes in a puff of smoke.', rewards: {} })
    },
    'poison_fountain': {
      'drink': () => {
        if (Math.random() < 0.5) {
          character.stats.mp = character.stats.maxMp;
          return { message: 'The liquid restores your MP completely!', rewards: { mpRestored: true } };
        } else {
          const damage = Math.floor(character.stats.maxHp * 0.2);
          character.stats.hp = Math.max(1, character.stats.hp - damage);
          return { message: `It was poison! You take ${damage} damage!`, rewards: { damage } };
        }
      },
      'avoid': () => ({ message: 'You wisely avoid the suspicious liquid.', rewards: {} })
    }
  };
  
  const handler = outcomes[scenario.id]?.[choice];
  return handler ? handler() : { message: 'Nothing happens.', rewards: {} };
}

function generateMerchantStock(towerId, floor) {
  const basePrice = 50 + towerId * 30 + floor * 10;
  return [
    { id: 'health_potion', name: 'Health Potion', icon: '🧪', type: 'consumable', price: basePrice, effect: 'Restore 30% HP' },
    { id: 'mana_potion', name: 'Mana Potion', icon: '💧', type: 'consumable', price: basePrice, effect: 'Restore 30% MP' },
    { id: 'antidote', name: 'Antidote', icon: '💊', type: 'consumable', price: Math.floor(basePrice * 0.7), effect: 'Cure poison' }
  ];
}

export default router;
