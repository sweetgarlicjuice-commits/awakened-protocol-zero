import express from 'express';
import mongoose from 'mongoose';
import Character from '../models/Character.js';
import FloorMap from '../models/FloorMap.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
const ENERGY_PER_EXPLORATION = 5;

// Import tower data with error handling
let TOWERS = {};
let ENEMIES = {};

try {
  const towerData = await import('../data/towerData.js');
  TOWERS = towerData.TOWERS || {};
  ENEMIES = towerData.ENEMIES || {};
  console.log('✅ Tower data loaded for exploration');
} catch (err) {
  console.error('❌ Failed to load tower data:', err.message);
  // Fallback data
  TOWERS = {
    1: { id: 1, name: 'Crimson Spire', description: 'Ancient ruins', theme: 'undead' }
  };
  ENEMIES = {
    tower1: {
      normal: [
        { id: 'skeleton', name: 'Skeleton', icon: '💀', baseHp: 50, baseAtk: 8, baseDef: 3, expReward: 15, goldReward: { min: 5, max: 15 } }
      ],
      elite: [
        { id: 'death_knight', name: 'Death Knight', icon: '⚔️', baseHp: 200, baseAtk: 25, baseDef: 10, expReward: 100, goldReward: { min: 50, max: 100 }, isElite: true }
      ],
      boss: { id: 'lich_king', name: 'Lich King', icon: '👑', baseHp: 500, baseAtk: 40, baseDef: 15, expReward: 300, goldReward: { min: 150, max: 300 }, isBoss: true }
    }
  };
}

// Simple skill lookup
const getSkill = (skillId) => {
  const SKILLS = {
    slash: { name: 'Slash', mpCost: 5, damage: 1.2, damageType: 'physical' },
    heavyStrike: { name: 'Heavy Strike', mpCost: 12, damage: 1.8, damageType: 'physical' },
    backstab: { name: 'Backstab', mpCost: 8, damage: 2.0, damageType: 'physical' },
    preciseShot: { name: 'Precise Shot', mpCost: 6, damage: 1.5, damageType: 'physical' },
    fireball: { name: 'Fireball', mpCost: 10, damage: 1.6, damageType: 'magical' },
    iceSpear: { name: 'Ice Spear', mpCost: 12, damage: 1.4, damageType: 'magical' },
    thunderbolt: { name: 'Thunderbolt', mpCost: 18, damage: 2.0, damageType: 'magical' }
  };
  return SKILLS[skillId] || { name: 'Attack', mpCost: 0, damage: 1.0, damageType: 'physical' };
};

// ============================================================
// HELPER: Generate floor map
// ============================================================
function generateFloorMap(characterId, towerId, floor) {
  const nodes = [];
  const isBossFloor = floor % 5 === 0;
  const isEliteFloor = floor % 3 === 0 && !isBossFloor;
  const rows = isBossFloor ? 5 : 4;
  const nodesPerRow = [1, 2, 3, 2, 1];
  
  let nodeId = 0;
  const nodeGrid = [];
  
  for (let row = 0; row < rows; row++) {
    const rowNodes = [];
    const colCount = nodesPerRow[Math.min(row, nodesPerRow.length - 1)];
    
    for (let col = 0; col < colCount; col++) {
      const id = `node_${nodeId++}`;
      let type = 'combat';
      
      if (row === 0) {
        type = 'start';
      } else if (row === rows - 1) {
        type = isBossFloor ? 'boss' : 'combat';
      } else {
        const roll = Math.random();
        if (isEliteFloor && row === rows - 2) {
          type = 'elite';
        } else if (roll < 0.50) {
          type = 'combat';
        } else if (roll < 0.65) {
          type = 'treasure';
        } else if (roll < 0.75) {
          type = 'rest';
        } else if (roll < 0.85) {
          type = 'mystery';
        } else {
          type = 'shrine';
        }
      }
      
      const node = {
        id,
        type,
        row,
        col,
        connections: [],
        visited: row === 0,
        cleared: false,
        enemies: [],
        waves: 1
      };
      
      // Generate enemies for combat nodes
      if (['combat', 'elite', 'boss'].includes(type)) {
        node.enemies = generateEnemies(type, towerId, floor);
        node.waves = type === 'boss' ? 1 : (type === 'elite' ? 1 : Math.min(1 + Math.floor(floor / 5), 3));
      }
      
      // Generate rewards for treasure
      if (type === 'treasure') {
        node.rewards = {
          gold: Math.floor(50 + floor * 20 + Math.random() * 50),
          exp: Math.floor(20 + floor * 5),
          healPercent: Math.random() < 0.3 ? 20 : 0
        };
      }
      
      // Generate mystery scenario
      if (type === 'mystery') {
        const scenarios = [
          { id: 'chest', description: 'An old chest sits in the corner. Open it or leave?', choices: ['open', 'leave'] },
          { id: 'altar', description: 'A glowing altar. Pray or destroy?', choices: ['pray', 'destroy'] },
          { id: 'fountain', description: 'A mysterious fountain. Drink or avoid?', choices: ['drink', 'avoid'] }
        ];
        node.scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
      }
      
      rowNodes.push(node);
      nodes.push(node);
    }
    nodeGrid.push(rowNodes);
  }
  
  // Connect nodes
  for (let row = 0; row < rows - 1; row++) {
    const currentRow = nodeGrid[row];
    const nextRow = nodeGrid[row + 1];
    
    currentRow.forEach((node, colIndex) => {
      const connectCount = Math.min(nextRow.length, Math.random() < 0.5 ? 1 : 2);
      const sorted = nextRow.map((n, i) => ({ node: n, dist: Math.abs(i - colIndex) }))
        .sort((a, b) => a.dist - b.dist);
      
      for (let i = 0; i < connectCount && i < sorted.length; i++) {
        node.connections.push(sorted[i].node.id);
      }
    });
  }
  
  // Ensure all nodes have incoming connections
  for (let row = 1; row < rows; row++) {
    nodeGrid[row].forEach(node => {
      const hasIncoming = nodeGrid[row - 1].some(prev => prev.connections.includes(node.id));
      if (!hasIncoming && nodeGrid[row - 1].length > 0) {
        const randomPrev = nodeGrid[row - 1][Math.floor(Math.random() * nodeGrid[row - 1].length)];
        randomPrev.connections.push(node.id);
      }
    });
  }
  
  return {
    characterId,
    towerId,
    floor,
    nodes,
    currentNodeId: nodes[0].id,
    startNodeId: nodes[0].id,
    bossNodeId: nodes[nodes.length - 1].id
  };
}

function generateEnemies(type, towerId, floor) {
  const enemies = [];
  const towerEnemies = ENEMIES[`tower${towerId}`] || ENEMIES.tower1;
  if (!towerEnemies) return enemies;
  
  const floorScale = 1 + (floor - 1) * 0.1;
  
  if (type === 'boss' && towerEnemies.boss) {
    const boss = { ...towerEnemies.boss };
    boss.hp = Math.floor((boss.baseHp || 500) * floorScale);
    boss.maxHp = boss.hp;
    boss.atk = Math.floor((boss.baseAtk || 40) * floorScale);
    boss.def = Math.floor((boss.baseDef || 15) * floorScale);
    enemies.push(boss);
  } else if (type === 'elite' && towerEnemies.elite?.length > 0) {
    const elite = { ...towerEnemies.elite[Math.floor(Math.random() * towerEnemies.elite.length)] };
    elite.hp = Math.floor((elite.baseHp || 200) * floorScale);
    elite.maxHp = elite.hp;
    elite.atk = Math.floor((elite.baseAtk || 25) * floorScale);
    elite.def = Math.floor((elite.baseDef || 10) * floorScale);
    enemies.push(elite);
  } else if (towerEnemies.normal?.length > 0) {
    const count = Math.min(1 + Math.floor(Math.random() * 3), 3);
    for (let i = 0; i < count; i++) {
      const enemy = { ...towerEnemies.normal[Math.floor(Math.random() * towerEnemies.normal.length)] };
      enemy.hp = Math.floor((enemy.baseHp || 50) * floorScale);
      enemy.maxHp = enemy.hp;
      enemy.atk = Math.floor((enemy.baseAtk || 10) * floorScale);
      enemy.def = Math.floor((enemy.baseDef || 5) * floorScale);
      enemy.instanceId = `${enemy.id}_${i}`;
      enemies.push(enemy);
    }
  }
  
  return enemies;
}

// ============================================================
// GET /api/exploration/map - Get or generate floor map
// ============================================================
router.get('/map', authenticate, async (req, res) => {
  try {
    const character = await Character.findOne({ userId: req.userId });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    
    const towerId = parseInt(req.query.towerId) || character.currentTower || 1;
    const floor = parseInt(req.query.floor) || character.currentFloor || 1;
    
    // Check if map exists in DB
    let floorMap = await FloorMap.findOne({
      characterId: character._id,
      towerId,
      floor,
      completed: false
    });
    
    // Generate new map if none exists
    if (!floorMap) {
      const mapData = generateFloorMap(character._id, towerId, floor);
      floorMap = new FloorMap(mapData);
      await floorMap.save();
    }
    
    const tower = TOWERS[towerId] || { id: towerId, name: `Tower ${towerId}`, description: 'Unknown tower' };
    
    res.json({
      map: floorMap,
      tower: {
        id: tower.id,
        name: tower.name,
        description: tower.description,
        theme: tower.theme
      },
      floor,
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
    res.status(500).json({ error: error.message || 'Server error' });
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
      completed: false
    });
    
    if (!floorMap) return res.status(404).json({ error: 'No active floor map' });
    
    const currentNode = floorMap.nodes.find(n => n.id === floorMap.currentNodeId);
    const targetNode = floorMap.nodes.find(n => n.id === nodeId);
    
    if (!targetNode) return res.status(400).json({ error: 'Invalid node' });
    
    if (!currentNode.connections.includes(nodeId) && currentNode.id !== nodeId) {
      return res.status(400).json({ error: 'Cannot move to that node' });
    }
    
    if (character.energy < ENERGY_PER_EXPLORATION) {
      return res.status(400).json({ error: 'Not enough energy' });
    }
    
    character.energy -= ENERGY_PER_EXPLORATION;
    character.isInTower = true;
    floorMap.currentNodeId = nodeId;
    
    // Mark as visited
    const nodeIndex = floorMap.nodes.findIndex(n => n.id === nodeId);
    if (nodeIndex >= 0) {
      floorMap.nodes[nodeIndex].visited = true;
      floorMap.markModified('nodes');
    }
    
    await character.save();
    await floorMap.save();
    
    res.json({
      success: true,
      node: targetNode,
      energy: character.energy,
      nodeType: targetNode.type
    });
  } catch (error) {
    console.error('Move error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
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
    
    floorMap.activeCombat = {
      nodeId: currentNode.id,
      wave: 1,
      enemies: currentNode.enemies.map(e => ({ ...e, buffs: [], debuffs: [] })),
      turnCount: 0,
      combatLog: [{ actor: 'system', message: `Combat started! Wave 1/${currentNode.waves}`, type: 'info' }],
      playerBuffs: []
    };
    
    floorMap.markModified('activeCombat');
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
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// ============================================================
// POST /api/exploration/combat/action - Combat action
// ============================================================
router.post('/combat/action', authenticate, async (req, res) => {
  try {
    const { action, skillId, targetIndex } = req.body;
    const character = await Character.findOne({ userId: req.userId });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    
    const floorMap = await FloorMap.findOne({
      characterId: character._id,
      completed: false
    });
    
    if (!floorMap || !floorMap.activeCombat) {
      return res.status(400).json({ error: 'No active combat' });
    }
    
    const combat = floorMap.activeCombat;
    const currentNode = floorMap.nodes.find(n => n.id === combat.nodeId);
    const combatLog = [];
    
    // Calculate stats
    const pDmg = Math.floor((5 + character.stats.str * 3) * (1 + (character.level - 1) * 0.02));
    const mDmg = Math.floor((5 + character.stats.int * 4) * (1 + (character.level - 1) * 0.02));
    const pDef = character.stats.str + character.stats.vit * 2;
    const critRate = Math.min(5 + character.stats.agi * 0.5, 80);
    const critDmg = 150 + character.stats.dex;
    
    // Player action
    const target = combat.enemies[targetIndex || 0];
    if (!target || target.hp <= 0) {
      const aliveTarget = combat.enemies.find(e => e.hp > 0);
      if (!aliveTarget) {
        return res.status(400).json({ error: 'No valid targets' });
      }
    }
    
    const actualTarget = target?.hp > 0 ? target : combat.enemies.find(e => e.hp > 0);
    
    if (action === 'attack') {
      const isCrit = Math.random() * 100 < critRate;
      const baseDmg = Math.max(1, pDmg - (actualTarget.def || 0) * 0.5);
      const damage = isCrit ? Math.floor(baseDmg * critDmg / 100) : Math.floor(baseDmg);
      actualTarget.hp = Math.max(0, actualTarget.hp - damage);
      
      combatLog.push({
        actor: 'player',
        message: `You attack ${actualTarget.name} for ${damage} damage${isCrit ? ' (CRIT!)' : ''}!`,
        damage,
        type: isCrit ? 'crit' : 'damage'
      });
      
    } else if (action === 'skill' && skillId) {
      const skill = getSkill(skillId);
      if (character.stats.mp < skill.mpCost) {
        return res.status(400).json({ error: 'Not enough MP' });
      }
      
      character.stats.mp -= skill.mpCost;
      const baseStat = skill.damageType === 'magical' ? mDmg : pDmg;
      const skillDmg = Math.floor(baseStat * skill.damage);
      const isCrit = Math.random() * 100 < critRate;
      const damage = isCrit ? Math.floor(skillDmg * critDmg / 100) : skillDmg;
      actualTarget.hp = Math.max(0, actualTarget.hp - damage);
      
      combatLog.push({
        actor: 'player',
        message: `You use ${skill.name} on ${actualTarget.name} for ${damage} damage!`,
        damage,
        type: 'skill'
      });
      
    } else if (action === 'defend') {
      combat.playerBuffs = combat.playerBuffs || [];
      combat.playerBuffs.push({ type: 'defend', duration: 1, value: 50 });
      combatLog.push({
        actor: 'player',
        message: 'You take a defensive stance!',
        type: 'buff'
      });
    }
    
    // Check victory
    const aliveEnemies = combat.enemies.filter(e => e.hp > 0);
    
    if (aliveEnemies.length === 0) {
      // Calculate rewards
      const baseExp = currentNode.enemies.reduce((sum, e) => sum + (e.expReward || 20), 0);
      const baseGold = currentNode.enemies.reduce((sum, e) => {
        const gr = e.goldReward || { min: 10, max: 30 };
        return sum + Math.floor(gr.min + Math.random() * (gr.max - gr.min));
      }, 0);
      
      const multiplier = currentNode.type === 'boss' ? 3 : (currentNode.type === 'elite' ? 2 : 1);
      const rewards = {
        exp: Math.floor(baseExp * multiplier),
        gold: Math.floor(baseGold * multiplier)
      };
      
      character.experience += rewards.exp;
      character.gold += rewards.gold;
      character.statistics.totalKills += currentNode.enemies.length;
      if (currentNode.type === 'elite') character.statistics.eliteKills++;
      if (currentNode.type === 'boss') character.statistics.bossKills++;
      
      // Level up check
      let leveledUp = false;
      while (character.experience >= character.experienceToNextLevel) {
        character.experience -= character.experienceToNextLevel;
        character.level++;
        character.statPoints += 5;
        character.experienceToNextLevel = Math.floor(100 * Math.pow(1.15, character.level - 1));
        character.stats.maxHp += 10 + character.stats.vit * 2;
        character.stats.maxMp += 5 + character.stats.int;
        character.stats.hp = character.stats.maxHp;
        character.stats.mp = character.stats.maxMp;
        leveledUp = true;
      }
      
      // Mark node cleared
      const nodeIndex = floorMap.nodes.findIndex(n => n.id === currentNode.id);
      if (nodeIndex >= 0) {
        floorMap.nodes[nodeIndex].cleared = true;
        floorMap.markModified('nodes');
      }
      
      floorMap.activeCombat = null;
      
      // Boss = floor complete
      let floorComplete = false;
      if (currentNode.type === 'boss') {
        character.currentFloor++;
        character.statistics.floorsCleared++;
        floorMap.completed = true;
        character.isInTower = false;
        floorComplete = true;
      }
      
      await character.save();
      await floorMap.save();
      
      return res.json({
        status: 'victory',
        combatLog: [...combat.combatLog, ...combatLog, { actor: 'system', message: 'Victory!', type: 'victory' }],
        rewards,
        leveledUp,
        floorComplete,
        character: {
          hp: character.stats.hp,
          maxHp: character.stats.maxHp,
          mp: character.stats.mp,
          maxMp: character.stats.maxMp,
          level: character.level,
          gold: character.gold
        }
      });
    }
    
    // Enemy turn
    for (const enemy of aliveEnemies) {
      const defendBuff = (combat.playerBuffs || []).find(b => b.type === 'defend');
      const reduction = defendBuff ? defendBuff.value / 100 : 0;
      const enemyDmg = Math.max(1, Math.floor((enemy.atk - pDef * 0.3) * (1 - reduction)));
      character.stats.hp = Math.max(0, character.stats.hp - enemyDmg);
      
      combatLog.push({
        actor: 'enemy',
        message: `${enemy.name} attacks you for ${enemyDmg} damage!`,
        damage: enemyDmg,
        type: 'enemy'
      });
    }
    
    // Reduce buff durations
    combat.playerBuffs = (combat.playerBuffs || [])
      .map(b => ({ ...b, duration: b.duration - 1 }))
      .filter(b => b.duration > 0);
    
    // Check defeat
    if (character.stats.hp <= 0) {
      character.stats.hp = 0;
      character.statistics.deaths++;
      character.isInTower = false;
      floorMap.activeCombat = null;
      
      await character.save();
      await floorMap.save();
      
      return res.json({
        status: 'defeat',
        combatLog: [...combat.combatLog, ...combatLog, { actor: 'system', message: 'Defeated!', type: 'defeat' }],
        character: { hp: 0, maxHp: character.stats.maxHp }
      });
    }
    
    // Continue combat
    combat.turnCount++;
    combat.combatLog = [...combat.combatLog, ...combatLog];
    floorMap.markModified('activeCombat');
    
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
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// ============================================================
// POST /api/exploration/interact - Non-combat interaction
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
        if (currentNode.rewards) {
          character.gold += currentNode.rewards.gold || 0;
          character.experience += currentNode.rewards.exp || 0;
          if (currentNode.rewards.healPercent) {
            const heal = Math.floor(character.stats.maxHp * currentNode.rewards.healPercent / 100);
            character.stats.hp = Math.min(character.stats.maxHp, character.stats.hp + heal);
          }
          result.message = `Found treasure! +${currentNode.rewards.gold} gold, +${currentNode.rewards.exp} exp`;
          result.rewards = currentNode.rewards;
        }
        break;
        
      case 'rest':
        const hpHeal = Math.floor(character.stats.maxHp * 0.3);
        const mpHeal = Math.floor(character.stats.maxMp * 0.3);
        character.stats.hp = Math.min(character.stats.maxHp, character.stats.hp + hpHeal);
        character.stats.mp = Math.min(character.stats.maxMp, character.stats.mp + mpHeal);
        result.message = `Rested! +${hpHeal} HP, +${mpHeal} MP`;
        result.rewards = { hpHeal, mpHeal };
        break;
        
      case 'shrine':
        const buffs = ['strength', 'defense', 'speed'];
        const buff = buffs[Math.floor(Math.random() * buffs.length)];
        result.message = `The shrine grants you ${buff}!`;
        result.rewards = { buff };
        break;
        
      case 'mystery':
        if (choice === 'open' || choice === 'pray' || choice === 'drink') {
          if (Math.random() < 0.6) {
            const gold = Math.floor(30 + Math.random() * 70);
            character.gold += gold;
            result.message = `Lucky! Found ${gold} gold!`;
            result.rewards = { gold };
          } else {
            const dmg = Math.floor(character.stats.maxHp * 0.15);
            character.stats.hp = Math.max(1, character.stats.hp - dmg);
            result.message = `Ouch! Took ${dmg} damage!`;
            result.rewards = { damage: dmg };
          }
        } else {
          result.message = 'You decided to be careful. Nothing happened.';
        }
        break;
    }
    
    // Mark cleared
    const nodeIndex = floorMap.nodes.findIndex(n => n.id === currentNode.id);
    if (nodeIndex >= 0) {
      floorMap.nodes[nodeIndex].cleared = true;
      floorMap.markModified('nodes');
    }
    
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
        gold: character.gold
      }
    });
    
  } catch (error) {
    console.error('Interact error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// ============================================================
// POST /api/exploration/leave - Leave tower
// ============================================================
router.post('/leave', authenticate, async (req, res) => {
  try {
    const character = await Character.findOne({ userId: req.userId });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    
    await FloorMap.deleteMany({
      characterId: character._id,
      completed: false
    });
    
    character.isInTower = false;
    await character.save();
    
    res.json({ success: true, message: 'Left the tower' });
  } catch (error) {
    console.error('Leave error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

export default router;
