import express from 'express';
import Character from '../models/Character.js';
import FloorMap from '../models/FloorMap.js';
import { authenticate } from '../middleware/auth.js';
import { TOWERS, ENEMIES } from '../data/towerData.js';

const router = express.Router();
const ENERGY_PER_EXPLORATION = 5;

// Simple skill lookup
const getSkill = (skillId) => {
  const SKILLS = {
    slash: { name: 'Slash', mpCost: 5, damage: 1.2, damageType: 'physical' },
    heavyStrike: { name: 'Heavy Strike', mpCost: 12, damage: 1.8, damageType: 'physical' },
    shieldBash: { name: 'Shield Bash', mpCost: 8, damage: 1.0, damageType: 'physical' },
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
        cleared: row === 0, // Start node auto-cleared
        enemies: [],
        waves: 1
      };
      
      if (['combat', 'elite', 'boss'].includes(type)) {
        node.enemies = generateEnemies(type, towerId, floor);
        node.waves = type === 'boss' ? 1 : (type === 'elite' ? 1 : Math.min(1 + Math.floor(floor / 5), 3));
      }
      
      if (type === 'treasure') {
        node.rewards = {
          gold: Math.floor(50 + floor * 20 + Math.random() * 50),
          exp: Math.floor(20 + floor * 5),
          healPercent: Math.random() < 0.3 ? 20 : 0
        };
      }
      
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
  const towerKey = `tower${towerId}`;
  const towerEnemies = ENEMIES[towerKey] || ENEMIES.tower1;
  
  if (!towerEnemies) {
    return [{ id: 'enemy', name: 'Enemy', icon: '👹', hp: 50, maxHp: 50, atk: 10, def: 5, expReward: 20, goldReward: { min: 10, max: 20 } }];
  }
  
  const floorScale = 1 + (floor - 1) * 0.1;
  
  if (type === 'boss' && towerEnemies.boss) {
    const boss = { ...towerEnemies.boss };
    boss.hp = Math.floor((boss.baseHp || 500) * floorScale);
    boss.maxHp = boss.hp;
    boss.atk = Math.floor((boss.baseAtk || 40) * floorScale);
    boss.def = Math.floor((boss.baseDef || 15) * floorScale);
    enemies.push(boss);
  } else if (type === 'elite' && towerEnemies.elite && towerEnemies.elite.length > 0) {
    const elite = { ...towerEnemies.elite[Math.floor(Math.random() * towerEnemies.elite.length)] };
    elite.hp = Math.floor((elite.baseHp || 200) * floorScale);
    elite.maxHp = elite.hp;
    elite.atk = Math.floor((elite.baseAtk || 25) * floorScale);
    elite.def = Math.floor((elite.baseDef || 10) * floorScale);
    enemies.push(elite);
  } else if (towerEnemies.normal && towerEnemies.normal.length > 0) {
    const count = Math.min(1 + Math.floor(Math.random() * 3), 3);
    for (let i = 0; i < count; i++) {
      const template = towerEnemies.normal[Math.floor(Math.random() * towerEnemies.normal.length)];
      const enemy = { ...template };
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
// GET /api/exploration/map
// ============================================================
router.get('/map', authenticate, async (req, res) => {
  try {
    const character = await Character.findOne({ userId: req.userId });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    
    const towerId = parseInt(req.query.towerId) || character.currentTower || 1;
    const floor = parseInt(req.query.floor) || character.currentFloor || 1;
    
    let floorMap = await FloorMap.findOne({
      characterId: character._id,
      towerId,
      floor,
      completed: false
    });
    
    if (!floorMap) {
      const mapData = generateFloorMap(character._id, towerId, floor);
      floorMap = new FloorMap(mapData);
      await floorMap.save();
    }
    
    const tower = TOWERS[towerId] || { id: towerId, name: `Tower ${towerId}`, description: 'Unknown' };
    
    res.json({
      map: floorMap,
      tower: { id: tower.id, name: tower.name, description: tower.description, theme: tower.theme },
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
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// POST /api/exploration/move
// FIX: Only allow moving to CONNECTED nodes from CURRENT cleared node
// ============================================================
router.post('/move', authenticate, async (req, res) => {
  try {
    const { nodeId } = req.body;
    const character = await Character.findOne({ userId: req.userId });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    
    const floorMap = await FloorMap.findOne({ characterId: character._id, completed: false });
    if (!floorMap) return res.status(404).json({ error: 'No active floor map' });
    
    const currentNode = floorMap.nodes.find(n => n.id === floorMap.currentNodeId);
    const targetNode = floorMap.nodes.find(n => n.id === nodeId);
    
    if (!targetNode) return res.status(400).json({ error: 'Invalid node' });
    
    // FIX: Must be connected from current node AND current node must be cleared
    if (!currentNode.connections.includes(nodeId)) {
      return res.status(400).json({ error: 'Cannot reach that node - not connected' });
    }
    
    if (!currentNode.cleared) {
      return res.status(400).json({ error: 'Clear current node first' });
    }
    
    if (character.energy < ENERGY_PER_EXPLORATION) {
      return res.status(400).json({ error: 'Not enough energy' });
    }
    
    character.energy -= ENERGY_PER_EXPLORATION;
    character.isInTower = true;
    floorMap.currentNodeId = nodeId;
    
    const idx = floorMap.nodes.findIndex(n => n.id === nodeId);
    if (idx >= 0) {
      floorMap.nodes[idx].visited = true;
      floorMap.markModified('nodes');
    }
    
    await character.save();
    await floorMap.save();
    
    res.json({ success: true, node: targetNode, energy: character.energy, nodeType: targetNode.type });
  } catch (error) {
    console.error('Move error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// POST /api/exploration/combat/start
// FIX: combatLog must be array of objects, not string
// ============================================================
router.post('/combat/start', authenticate, async (req, res) => {
  try {
    const character = await Character.findOne({ userId: req.userId });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    
    const floorMap = await FloorMap.findOne({ characterId: character._id, completed: false });
    if (!floorMap) return res.status(404).json({ error: 'No active floor map' });
    
    const currentNode = floorMap.nodes.find(n => n.id === floorMap.currentNodeId);
    if (!['combat', 'elite', 'boss'].includes(currentNode.type)) {
      return res.status(400).json({ error: 'Not a combat node' });
    }
    if (currentNode.cleared) {
      return res.status(400).json({ error: 'Already cleared' });
    }
    
    // FIX: Properly create the combat log as an array of plain objects
    const initialLog = {
      actor: 'system',
      message: 'Combat started! Wave 1/' + currentNode.waves,
      damage: 0,
      type: 'info'
    };
    
    // FIX: Create activeCombat with proper structure
    floorMap.activeCombat = {
      nodeId: currentNode.id,
      wave: 1,
      enemies: currentNode.enemies.map(e => ({
        id: e.id,
        name: e.name,
        icon: e.icon,
        hp: e.hp,
        maxHp: e.maxHp,
        atk: e.atk,
        def: e.def,
        expReward: e.expReward,
        goldReward: e.goldReward,
        isElite: e.isElite || false,
        isBoss: e.isBoss || false,
        buffs: [],
        debuffs: []
      })),
      turnCount: 0,
      combatLog: [initialLog],
      playerBuffs: []
    };
    
    floorMap.markModified('activeCombat');
    await floorMap.save();
    
    res.json({
      combat: floorMap.activeCombat,
      waves: currentNode.waves,
      character: { hp: character.stats.hp, maxHp: character.stats.maxHp, mp: character.stats.mp, maxMp: character.stats.maxMp, skills: character.skills }
    });
  } catch (error) {
    console.error('Combat start error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// POST /api/exploration/combat/action
// ============================================================
router.post('/combat/action', authenticate, async (req, res) => {
  try {
    const { action, skillId, targetIndex } = req.body;
    const character = await Character.findOne({ userId: req.userId });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    
    const floorMap = await FloorMap.findOne({ characterId: character._id, completed: false });
    if (!floorMap || !floorMap.activeCombat) return res.status(400).json({ error: 'No active combat' });
    
    const combat = floorMap.activeCombat;
    const currentNode = floorMap.nodes.find(n => n.id === combat.nodeId);
    const newLogs = [];
    
    const pDmg = Math.floor((5 + character.stats.str * 3) * (1 + (character.level - 1) * 0.02));
    const mDmg = Math.floor((5 + character.stats.int * 4) * (1 + (character.level - 1) * 0.02));
    const pDef = character.stats.str + character.stats.vit * 2;
    const critRate = Math.min(5 + character.stats.agi * 0.5, 80);
    const critDmg = 150 + character.stats.dex;
    
    let actualTarget = combat.enemies[targetIndex || 0];
    if (!actualTarget || actualTarget.hp <= 0) {
      actualTarget = combat.enemies.find(e => e.hp > 0);
    }
    if (!actualTarget) return res.status(400).json({ error: 'No targets' });
    
    if (action === 'attack') {
      const isCrit = Math.random() * 100 < critRate;
      const baseDmg = Math.max(1, pDmg - (actualTarget.def || 0) * 0.5);
      const damage = isCrit ? Math.floor(baseDmg * critDmg / 100) : Math.floor(baseDmg);
      actualTarget.hp = Math.max(0, actualTarget.hp - damage);
      newLogs.push({ actor: 'player', message: 'Attack ' + actualTarget.name + ' for ' + damage + (isCrit ? ' CRIT!' : ''), damage: damage, type: isCrit ? 'crit' : 'damage' });
    } else if (action === 'skill' && skillId) {
      const skill = getSkill(skillId);
      if (character.stats.mp < skill.mpCost) return res.status(400).json({ error: 'Not enough MP' });
      character.stats.mp -= skill.mpCost;
      const baseStat = skill.damageType === 'magical' ? mDmg : pDmg;
      const damage = Math.floor(baseStat * skill.damage);
      actualTarget.hp = Math.max(0, actualTarget.hp - damage);
      newLogs.push({ actor: 'player', message: skill.name + ' on ' + actualTarget.name + ' for ' + damage + '!', damage: damage, type: 'skill' });
    } else if (action === 'defend') {
      combat.playerBuffs = combat.playerBuffs || [];
      combat.playerBuffs.push({ type: 'defend', duration: 1, value: 50 });
      newLogs.push({ actor: 'player', message: 'Defending!', damage: 0, type: 'buff' });
    }
    
    const aliveEnemies = combat.enemies.filter(e => e.hp > 0);
    
    if (aliveEnemies.length === 0) {
      const baseExp = currentNode.enemies.reduce((s, e) => s + (e.expReward || 20), 0);
      const baseGold = currentNode.enemies.reduce((s, e) => s + Math.floor((e.goldReward?.min || 10) + Math.random() * ((e.goldReward?.max || 30) - (e.goldReward?.min || 10))), 0);
      const mult = currentNode.type === 'boss' ? 3 : currentNode.type === 'elite' ? 2 : 1;
      const rewards = { exp: Math.floor(baseExp * mult), gold: Math.floor(baseGold * mult) };
      
      character.experience += rewards.exp;
      character.gold += rewards.gold;
      character.statistics.totalKills += currentNode.enemies.length;
      if (currentNode.type === 'elite') character.statistics.eliteKills++;
      if (currentNode.type === 'boss') character.statistics.bossKills++;
      
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
      
      const idx = floorMap.nodes.findIndex(n => n.id === currentNode.id);
      if (idx >= 0) { floorMap.nodes[idx].cleared = true; floorMap.markModified('nodes'); }
      
      // Clear combat state
      floorMap.activeCombat = undefined;
      floorMap.markModified('activeCombat');
      
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
      
      newLogs.push({ actor: 'system', message: 'Victory!', damage: 0, type: 'victory' });
      
      return res.json({
        status: 'victory',
        combatLog: [...(combat.combatLog || []), ...newLogs],
        rewards, leveledUp, floorComplete,
        character: { hp: character.stats.hp, maxHp: character.stats.maxHp, mp: character.stats.mp, maxMp: character.stats.maxMp, level: character.level, gold: character.gold }
      });
    }
    
    // Enemy turn
    for (const enemy of aliveEnemies) {
      const def = (combat.playerBuffs || []).find(b => b.type === 'defend');
      const reduction = def ? def.value / 100 : 0;
      const dmg = Math.max(1, Math.floor((enemy.atk - pDef * 0.3) * (1 - reduction)));
      character.stats.hp = Math.max(0, character.stats.hp - dmg);
      newLogs.push({ actor: 'enemy', message: enemy.name + ' attacks for ' + dmg + '!', damage: dmg, type: 'enemy' });
    }
    
    combat.playerBuffs = (combat.playerBuffs || []).map(b => ({ ...b, duration: b.duration - 1 })).filter(b => b.duration > 0);
    
    if (character.stats.hp <= 0) {
      character.stats.hp = 0;
      character.statistics.deaths++;
      character.isInTower = false;
      floorMap.activeCombat = undefined;
      floorMap.markModified('activeCombat');
      await character.save();
      await floorMap.save();
      newLogs.push({ actor: 'system', message: 'Defeated!', damage: 0, type: 'defeat' });
      return res.json({ status: 'defeat', combatLog: [...(combat.combatLog || []), ...newLogs], character: { hp: 0, maxHp: character.stats.maxHp } });
    }
    
    combat.turnCount++;
    combat.combatLog = [...(combat.combatLog || []), ...newLogs];
    floorMap.markModified('activeCombat');
    await character.save();
    await floorMap.save();
    
    res.json({ status: 'ongoing', combat: floorMap.activeCombat, character: { hp: character.stats.hp, maxHp: character.stats.maxHp, mp: character.stats.mp, maxMp: character.stats.maxMp } });
  } catch (error) {
    console.error('Combat action error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// POST /api/exploration/interact
// ============================================================
router.post('/interact', authenticate, async (req, res) => {
  try {
    const { choice } = req.body;
    const character = await Character.findOne({ userId: req.userId });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    
    const floorMap = await FloorMap.findOne({ characterId: character._id, completed: false });
    if (!floorMap) return res.status(404).json({ error: 'No active map' });
    
    const currentNode = floorMap.nodes.find(n => n.id === floorMap.currentNodeId);
    if (currentNode.cleared) return res.status(400).json({ error: 'Already cleared' });
    
    let result = { message: '', rewards: {} };
    
    if (currentNode.type === 'treasure' && currentNode.rewards) {
      character.gold += currentNode.rewards.gold || 0;
      character.experience += currentNode.rewards.exp || 0;
      if (currentNode.rewards.healPercent) {
        const heal = Math.floor(character.stats.maxHp * currentNode.rewards.healPercent / 100);
        character.stats.hp = Math.min(character.stats.maxHp, character.stats.hp + heal);
      }
      result.message = 'Found ' + currentNode.rewards.gold + 'g, ' + currentNode.rewards.exp + ' exp!';
      result.rewards = currentNode.rewards;
    } else if (currentNode.type === 'rest') {
      const hpH = Math.floor(character.stats.maxHp * 0.3);
      const mpH = Math.floor(character.stats.maxMp * 0.3);
      character.stats.hp = Math.min(character.stats.maxHp, character.stats.hp + hpH);
      character.stats.mp = Math.min(character.stats.maxMp, character.stats.mp + mpH);
      result.message = 'Rested! +' + hpH + ' HP, +' + mpH + ' MP';
    } else if (currentNode.type === 'shrine') {
      result.message = 'The shrine blesses you!';
    } else if (currentNode.type === 'mystery') {
      if (choice === 'open' || choice === 'pray' || choice === 'drink') {
        if (Math.random() < 0.6) {
          const gold = Math.floor(30 + Math.random() * 70);
          character.gold += gold;
          result.message = 'Lucky! +' + gold + 'g';
        } else {
          const dmg = Math.floor(character.stats.maxHp * 0.15);
          character.stats.hp = Math.max(1, character.stats.hp - dmg);
          result.message = 'Ouch! -' + dmg + ' HP';
        }
      } else {
        result.message = 'Nothing happened.';
      }
    }
    
    const idx = floorMap.nodes.findIndex(n => n.id === currentNode.id);
    if (idx >= 0) { floorMap.nodes[idx].cleared = true; floorMap.markModified('nodes'); }
    
    await character.save();
    await floorMap.save();
    
    res.json({ success: true, ...result, character: { hp: character.stats.hp, maxHp: character.stats.maxHp, mp: character.stats.mp, maxMp: character.stats.maxMp, gold: character.gold } });
  } catch (error) {
    console.error('Interact error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// POST /api/exploration/leave
// ============================================================
router.post('/leave', authenticate, async (req, res) => {
  try {
    const character = await Character.findOne({ userId: req.userId });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    
    await FloorMap.deleteMany({ characterId: character._id, completed: false });
    character.isInTower = false;
    await character.save();
    
    res.json({ success: true, message: 'Left tower' });
  } catch (error) {
    console.error('Leave error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
