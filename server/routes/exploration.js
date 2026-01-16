import express from 'express';
import Character from '../models/Character.js';
import FloorMap from '../models/FloorMap.js';
import { authenticate } from '../middleware/auth.js';
import { TOWERS, ENEMIES } from '../data/towerData.js';

const router = express.Router();
const ENERGY_PER_EXPLORATION = 5;

// ============================================================
// SKILL DATABASE - Balanced MP, AOE, Buffs with descriptions
// ============================================================
const SKILLS = {
  // Swordsman
  slash: { name: 'Slash', mpCost: 12, damage: 1.3, damageType: 'physical', target: 'single', desc: 'Quick slash for 130% P.ATK' },
  heavyStrike: { name: 'Heavy Strike', mpCost: 25, damage: 2.0, damageType: 'physical', target: 'single', desc: 'Heavy blow for 200% P.ATK' },
  shieldBash: { name: 'Shield Bash', mpCost: 18, damage: 1.2, damageType: 'physical', target: 'single', desc: 'Shield bash for 120% P.ATK' },
  warCry: { name: 'War Cry', mpCost: 30, damage: 0, damageType: 'buff', target: 'self', buff: { type: 'attack', value: 30, duration: 3 }, desc: '+30% ATK for 3 turns' },
  whirlwind: { name: 'Whirlwind', mpCost: 35, damage: 0.8, damageType: 'physical', target: 'all', desc: 'Hit ALL enemies for 80% P.ATK' },
  
  // Assassin
  backstab: { name: 'Backstab', mpCost: 18, damage: 2.2, damageType: 'physical', target: 'single', desc: 'Backstab for 220% P.ATK' },
  poisonBlade: { name: 'Poison Blade', mpCost: 22, damage: 1.0, damageType: 'physical', target: 'single', desc: 'Poison attack for 100% P.ATK' },
  smokeScreen: { name: 'Smoke Screen', mpCost: 28, damage: 0, damageType: 'buff', target: 'self', buff: { type: 'evasion', value: 50, duration: 2 }, desc: '+50% Evasion for 2 turns' },
  fanOfKnives: { name: 'Fan of Knives', mpCost: 32, damage: 0.7, damageType: 'physical', target: 'all', desc: 'Hit ALL enemies for 70% P.ATK' },
  
  // Archer
  preciseShot: { name: 'Precise Shot', mpCost: 15, damage: 1.6, damageType: 'physical', target: 'single', desc: 'Precise shot for 160% P.ATK' },
  multiShot: { name: 'Multi Shot', mpCost: 30, damage: 0.6, damageType: 'physical', target: 'all', desc: 'Hit ALL enemies for 60% P.ATK' },
  eagleEye: { name: 'Eagle Eye', mpCost: 25, damage: 0, damageType: 'buff', target: 'self', buff: { type: 'critRate', value: 25, duration: 3 }, desc: '+25% Crit for 3 turns' },
  arrowRain: { name: 'Arrow Rain', mpCost: 40, damage: 1.0, damageType: 'physical', target: 'all', desc: 'Hit ALL enemies for 100% P.ATK' },
  
  // Mage
  fireball: { name: 'Fireball', mpCost: 20, damage: 1.8, damageType: 'magical', target: 'single', desc: 'Fire damage for 180% M.ATK' },
  iceSpear: { name: 'Ice Spear', mpCost: 25, damage: 1.5, damageType: 'magical', target: 'single', desc: 'Ice damage for 150% M.ATK' },
  manaShield: { name: 'Mana Shield', mpCost: 35, damage: 0, damageType: 'buff', target: 'self', buff: { type: 'shield', value: 40, duration: 3 }, desc: '-40% damage taken for 3 turns' },
  thunderbolt: { name: 'Thunderbolt', mpCost: 30, damage: 2.2, damageType: 'magical', target: 'single', desc: 'Lightning for 220% M.ATK' },
  blizzard: { name: 'Blizzard', mpCost: 45, damage: 1.0, damageType: 'magical', target: 'all', desc: 'Hit ALL enemies for 100% M.ATK' },
  meteor: { name: 'Meteor', mpCost: 55, damage: 1.4, damageType: 'magical', target: 'all', desc: 'Hit ALL enemies for 140% M.ATK' }
};

const getSkill = (skillId) => SKILLS[skillId] || { name: 'Attack', mpCost: 0, damage: 1.0, damageType: 'physical', target: 'single', desc: 'Basic attack' };

// Get all skills for frontend
router.get('/skills', authenticate, (req, res) => res.json({ skills: SKILLS }));

// ============================================================
// HELPER: Generate floor map
// FIX #1: Every floor has exit node that advances to next floor
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
        // FIX: Last row is always boss/elite/exit combat that advances floor
        type = isBossFloor ? 'boss' : (isEliteFloor ? 'elite' : 'combat');
      } else {
        const roll = Math.random();
        if (roll < 0.45) type = 'combat';
        else if (roll < 0.60) type = 'treasure';
        else if (roll < 0.72) type = 'rest';
        else if (roll < 0.85) type = 'mystery';
        else type = 'shrine';
      }
      
      const node = {
        id, type, row, col,
        connections: [],
        visited: row === 0,
        cleared: row === 0,
        enemies: [],
        waves: 1,
        isExit: row === rows - 1 // Last row = exit to next floor
      };
      
      if (['combat', 'elite', 'boss'].includes(type)) {
        node.enemies = generateEnemies(type, towerId, floor);
        node.waves = type === 'boss' ? 1 : (type === 'elite' ? 1 : Math.min(1 + Math.floor(floor / 5), 3));
      }
      
      if (type === 'treasure') {
        node.rewards = { gold: Math.floor(8 + floor * 2), exp: Math.floor(1 + floor * 0.5), healPercent: Math.random() < 0.3 ? 15 : 0 };
      }
      
      if (type === 'mystery') {
        const scenarios = [
          { id: 'chest', description: 'An old chest. Open or leave?', choices: ['open', 'leave'] },
          { id: 'altar', description: 'A glowing altar. Pray or destroy?', choices: ['pray', 'destroy'] },
          { id: 'fountain', description: 'Mysterious fountain. Drink or avoid?', choices: ['drink', 'avoid'] }
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
    nodeGrid[row].forEach((node, colIndex) => {
      const nextRow = nodeGrid[row + 1];
      const connectCount = Math.min(nextRow.length, Math.random() < 0.5 ? 1 : 2);
      const sorted = nextRow.map((n, i) => ({ node: n, dist: Math.abs(i - colIndex) })).sort((a, b) => a.dist - b.dist);
      for (let i = 0; i < connectCount && i < sorted.length; i++) node.connections.push(sorted[i].node.id);
    });
  }
  
  // Ensure connectivity
  for (let row = 1; row < rows; row++) {
    nodeGrid[row].forEach(node => {
      if (!nodeGrid[row - 1].some(prev => prev.connections.includes(node.id))) {
        nodeGrid[row - 1][Math.floor(Math.random() * nodeGrid[row - 1].length)].connections.push(node.id);
      }
    });
  }
  
  return { characterId, towerId, floor, nodes, currentNodeId: nodes[0].id, startNodeId: nodes[0].id, bossNodeId: nodes[nodes.length - 1].id };
}

// FIX #2: Reduced EXP rewards
function generateEnemies(type, towerId, floor) {
  const enemies = [];
  const towerEnemies = ENEMIES[`tower${towerId}`] || ENEMIES.tower1;
  
  if (!towerEnemies) {
    return [{ id: 'enemy', name: 'Enemy', icon: '👹', hp: 80, maxHp: 80, atk: 15, def: 6, expReward: 2, goldReward: { min: 2, max: 5 } }];
  }
  
  const floorScale = 1 + (floor - 1) * 0.15;
  
  if (type === 'boss' && towerEnemies.boss) {
    const b = { ...towerEnemies.boss };
    b.hp = Math.floor((b.baseHp || 800) * floorScale); b.maxHp = b.hp;
    b.atk = Math.floor((b.baseAtk || 50) * floorScale);
    b.def = Math.floor((b.baseDef || 20) * floorScale);
    b.expReward = Math.floor(10 + floor); // Reduced
    enemies.push(b);
  } else if (type === 'elite' && towerEnemies.elite?.length > 0) {
    const e = { ...towerEnemies.elite[Math.floor(Math.random() * towerEnemies.elite.length)] };
    e.hp = Math.floor((e.baseHp || 300) * floorScale); e.maxHp = e.hp;
    e.atk = Math.floor((e.baseAtk || 30) * floorScale);
    e.def = Math.floor((e.baseDef || 12) * floorScale);
    e.expReward = Math.floor(5 + floor * 0.5); // Reduced
    enemies.push(e);
  } else if (towerEnemies.normal?.length > 0) {
    const count = 1 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) {
      const t = towerEnemies.normal[Math.floor(Math.random() * towerEnemies.normal.length)];
      const e = { ...t };
      e.hp = Math.floor((e.baseHp || 80) * floorScale); e.maxHp = e.hp;
      e.atk = Math.floor((e.baseAtk || 15) * floorScale);
      e.def = Math.floor((e.baseDef || 6) * floorScale);
      e.expReward = Math.floor(1 + floor * 0.3); // Reduced
      e.instanceId = `${e.id}_${i}`;
      enemies.push(e);
    }
  }
  return enemies;
}

// ============================================================
// ROUTES
// ============================================================
router.get('/map', authenticate, async (req, res) => {
  try {
    const character = await Character.findOne({ userId: req.userId });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    
    const towerId = parseInt(req.query.towerId) || character.currentTower || 1;
    const floor = parseInt(req.query.floor) || character.currentFloor || 1;
    
    let floorMap = await FloorMap.findOne({ characterId: character._id, towerId, floor, completed: false });
    
    if (!floorMap) {
      floorMap = new FloorMap(generateFloorMap(character._id, towerId, floor));
      await floorMap.save();
    }
    
    const tower = TOWERS[towerId] || { id: towerId, name: `Tower ${towerId}` };
    res.json({ map: floorMap, tower, floor, character: { hp: character.stats.hp, maxHp: character.stats.maxHp, mp: character.stats.mp, maxMp: character.stats.maxMp, energy: character.energy } });
  } catch (error) {
    console.error('Get map error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/move', authenticate, async (req, res) => {
  try {
    const { nodeId } = req.body;
    const character = await Character.findOne({ userId: req.userId });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    
    const floorMap = await FloorMap.findOne({ characterId: character._id, completed: false });
    if (!floorMap) return res.status(404).json({ error: 'No active map' });
    
    const currentNode = floorMap.nodes.find(n => n.id === floorMap.currentNodeId);
    const targetNode = floorMap.nodes.find(n => n.id === nodeId);
    
    if (!targetNode) return res.status(400).json({ error: 'Invalid node' });
    if (!currentNode.connections.includes(nodeId)) return res.status(400).json({ error: 'Not connected' });
    if (!currentNode.cleared) return res.status(400).json({ error: 'Clear current node first' });
    if (character.energy < ENERGY_PER_EXPLORATION) return res.status(400).json({ error: 'Not enough energy' });
    
    character.energy -= ENERGY_PER_EXPLORATION;
    character.isInTower = true;
    floorMap.currentNodeId = nodeId;
    
    const idx = floorMap.nodes.findIndex(n => n.id === nodeId);
    if (idx >= 0) { floorMap.nodes[idx].visited = true; floorMap.markModified('nodes'); }
    
    await character.save();
    await floorMap.save();
    
    res.json({ success: true, node: targetNode, energy: character.energy, nodeType: targetNode.type });
  } catch (error) {
    console.error('Move error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/combat/start', authenticate, async (req, res) => {
  try {
    const character = await Character.findOne({ userId: req.userId });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    
    const floorMap = await FloorMap.findOne({ characterId: character._id, completed: false });
    if (!floorMap) return res.status(404).json({ error: 'No active map' });
    
    const currentNode = floorMap.nodes.find(n => n.id === floorMap.currentNodeId);
    if (!['combat', 'elite', 'boss'].includes(currentNode.type)) return res.status(400).json({ error: 'Not combat node' });
    if (currentNode.cleared) return res.status(400).json({ error: 'Already cleared' });
    
    floorMap.activeCombat = {
      nodeId: currentNode.id,
      wave: 1,
      enemies: currentNode.enemies.map(e => ({ ...e, buffs: [], debuffs: [] })),
      turnCount: 0,
      combatLog: [{ actor: 'system', message: `Combat started! Wave 1/${currentNode.waves}`, damage: 0, type: 'info' }],
      playerBuffs: []
    };
    floorMap.markModified('activeCombat');
    await floorMap.save();
    
    // Return skills with descriptions
    const playerSkills = (character.skills || []).map(s => {
      const skillData = getSkill(s.skillId);
      return { ...s, ...skillData };
    });
    
    res.json({ combat: floorMap.activeCombat, waves: currentNode.waves, character: { hp: character.stats.hp, maxHp: character.stats.maxHp, mp: character.stats.mp, maxMp: character.stats.maxMp, skills: playerSkills } });
  } catch (error) {
    console.error('Combat start error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// COMBAT ACTION - FIX #4,5,6: AOE, Buff logic, Buff display
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
    
    // Calculate player stats with buffs
    let atkBonus = 0, critBonus = 0;
    (combat.playerBuffs || []).forEach(b => {
      if (b.type === 'attack') atkBonus += b.value;
      if (b.type === 'critRate') critBonus += b.value;
    });
    
    const pDmg = Math.floor((5 + character.stats.str * 3) * (1 + (character.level - 1) * 0.02) * (1 + atkBonus / 100));
    const mDmg = Math.floor((5 + character.stats.int * 4) * (1 + (character.level - 1) * 0.02) * (1 + atkBonus / 100));
    const pDef = character.stats.str + character.stats.vit * 2;
    const critRate = Math.min(5 + character.stats.agi * 0.5 + critBonus, 80);
    const critDmg = 150 + character.stats.dex;
    
    const aliveEnemies = combat.enemies.filter(e => e.hp > 0);
    
    if (action === 'attack') {
      // Single target attack
      let target = combat.enemies[targetIndex || 0];
      if (!target || target.hp <= 0) target = aliveEnemies[0];
      if (!target) return res.status(400).json({ error: 'No targets' });
      
      const isCrit = Math.random() * 100 < critRate;
      const baseDmg = Math.max(1, pDmg - (target.def || 0) * 0.5);
      const damage = isCrit ? Math.floor(baseDmg * critDmg / 100) : Math.floor(baseDmg);
      target.hp = Math.max(0, target.hp - damage);
      newLogs.push({ actor: 'player', message: `Attack ${target.name} for ${damage}${isCrit ? ' CRIT!' : ''}`, damage, type: isCrit ? 'crit' : 'damage' });
      
    } else if (action === 'skill' && skillId) {
      const skill = getSkill(skillId);
      if (character.stats.mp < skill.mpCost) return res.status(400).json({ error: 'Not enough MP' });
      character.stats.mp -= skill.mpCost;
      
      // FIX #6: Buff skills should NOT deal damage
      if (skill.damageType === 'buff' && skill.buff) {
        // Apply buff to player
        combat.playerBuffs = combat.playerBuffs || [];
        combat.playerBuffs.push({ type: skill.buff.type, value: skill.buff.value, duration: skill.buff.duration });
        newLogs.push({ actor: 'player', message: `Used ${skill.name}! +${skill.buff.value}% ${skill.buff.type} for ${skill.buff.duration} turns`, damage: 0, type: 'buff' });
        
      } else if (skill.target === 'all') {
        // FIX #4: AOE - hit all enemies
        const baseStat = skill.damageType === 'magical' ? mDmg : pDmg;
        const skillDmg = Math.floor(baseStat * skill.damage);
        let totalDmg = 0;
        aliveEnemies.forEach(enemy => {
          const dmg = Math.max(1, skillDmg - (enemy.def || 0) * 0.3);
          enemy.hp = Math.max(0, enemy.hp - dmg);
          totalDmg += dmg;
        });
        newLogs.push({ actor: 'player', message: `${skill.name} hits ALL for ${totalDmg} total damage!`, damage: totalDmg, type: 'skill' });
        
      } else {
        // Single target skill
        let target = combat.enemies[targetIndex || 0];
        if (!target || target.hp <= 0) target = aliveEnemies[0];
        if (!target) return res.status(400).json({ error: 'No targets' });
        
        const baseStat = skill.damageType === 'magical' ? mDmg : pDmg;
        const skillDmg = Math.floor(baseStat * skill.damage);
        const isCrit = Math.random() * 100 < critRate;
        const damage = isCrit ? Math.floor(skillDmg * critDmg / 100) : skillDmg;
        target.hp = Math.max(0, target.hp - damage);
        newLogs.push({ actor: 'player', message: `${skill.name} on ${target.name} for ${damage}${isCrit ? ' CRIT!' : ''}`, damage, type: 'skill' });
      }
      
    } else if (action === 'defend') {
      combat.playerBuffs = combat.playerBuffs || [];
      combat.playerBuffs.push({ type: 'defend', value: 50, duration: 1 });
      newLogs.push({ actor: 'player', message: 'Defending! -50% damage for 1 turn', damage: 0, type: 'buff' });
    }
    
    // Check victory
    const stillAlive = combat.enemies.filter(e => e.hp > 0);
    
    if (stillAlive.length === 0) {
      // FIX #2: Reduced EXP
      const baseExp = currentNode.enemies.reduce((s, e) => s + (e.expReward || 2), 0);
      const baseGold = currentNode.enemies.reduce((s, e) => s + Math.floor((e.goldReward?.min || 2) + Math.random() * ((e.goldReward?.max || 5) - (e.goldReward?.min || 2))), 0);
      const mult = currentNode.type === 'boss' ? 2 : currentNode.type === 'elite' ? 1.5 : 1;
      const rewards = { exp: Math.floor(baseExp * mult), gold: Math.floor(baseGold * mult) };
      
      character.experience += rewards.exp;
      character.gold += rewards.gold;
      character.statistics.totalKills = (character.statistics.totalKills || 0) + currentNode.enemies.length;
      
      let leveledUp = false;
      while (character.experience >= character.experienceToNextLevel) {
        character.experience -= character.experienceToNextLevel;
        character.level++;
        character.statPoints += 5;
        character.experienceToNextLevel = Math.floor(100 * Math.pow(1.2, character.level - 1)); // Slower leveling
        character.stats.maxHp += 10 + character.stats.vit * 2;
        character.stats.maxMp += 5 + character.stats.int;
        character.stats.hp = character.stats.maxHp;
        character.stats.mp = character.stats.maxMp;
        leveledUp = true;
      }
      
      // Mark cleared
      const idx = floorMap.nodes.findIndex(n => n.id === currentNode.id);
      if (idx >= 0) { floorMap.nodes[idx].cleared = true; floorMap.markModified('nodes'); }
      floorMap.activeCombat = undefined;
      floorMap.markModified('activeCombat');
      
      // FIX #1: Exit node advances floor
      let floorComplete = false;
      if (currentNode.isExit) {
        character.currentFloor++;
        character.statistics.floorsCleared = (character.statistics.floorsCleared || 0) + 1;
        floorMap.completed = true;
        character.isInTower = false;
        floorComplete = true;
      }
      
      await character.save();
      await floorMap.save();
      
      newLogs.push({ actor: 'system', message: floorComplete ? 'Victory! Floor cleared!' : 'Victory!', damage: 0, type: 'victory' });
      
      return res.json({
        status: 'victory',
        combatLog: [...(combat.combatLog || []), ...newLogs],
        rewards, leveledUp, floorComplete,
        character: { hp: character.stats.hp, maxHp: character.stats.maxHp, mp: character.stats.mp, maxMp: character.stats.maxMp, level: character.level, gold: character.gold }
      });
    }
    
    // Enemy turn
    // FIX #5,6: Calculate damage reduction from buffs
    let damageReduction = 0;
    let evasionChance = 0;
    (combat.playerBuffs || []).forEach(b => {
      if (b.type === 'defend' || b.type === 'shield') damageReduction += b.value;
      if (b.type === 'evasion') evasionChance += b.value;
    });
    
    for (const enemy of stillAlive) {
      // Check evasion
      if (Math.random() * 100 < evasionChance) {
        newLogs.push({ actor: 'enemy', message: `${enemy.name} attacks but you dodged!`, damage: 0, type: 'miss' });
        continue;
      }
      
      const rawDmg = Math.max(1, enemy.atk - pDef * 0.3);
      const dmg = Math.max(1, Math.floor(rawDmg * (1 - damageReduction / 100)));
      character.stats.hp = Math.max(0, character.stats.hp - dmg);
      newLogs.push({ actor: 'enemy', message: `${enemy.name} attacks for ${dmg}!`, damage: dmg, type: 'enemy' });
    }
    
    // Reduce buff durations
    combat.playerBuffs = (combat.playerBuffs || []).map(b => ({ ...b, duration: b.duration - 1 })).filter(b => b.duration > 0);
    
    // Check defeat
    if (character.stats.hp <= 0) {
      character.stats.hp = 0;
      character.statistics.deaths = (character.statistics.deaths || 0) + 1;
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
    
    // FIX #5: Return active buffs with duration
    res.json({ 
      status: 'ongoing', 
      combat: floorMap.activeCombat, 
      playerBuffs: combat.playerBuffs || [],
      character: { hp: character.stats.hp, maxHp: character.stats.maxHp, mp: character.stats.mp, maxMp: character.stats.maxMp } 
    });
  } catch (error) {
    console.error('Combat action error:', error);
    res.status(500).json({ error: error.message });
  }
});

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
      result.message = `Found ${currentNode.rewards.gold}g, ${currentNode.rewards.exp} exp!`;
    } else if (currentNode.type === 'rest') {
      const hpH = Math.floor(character.stats.maxHp * 0.3);
      const mpH = Math.floor(character.stats.maxMp * 0.3);
      character.stats.hp = Math.min(character.stats.maxHp, character.stats.hp + hpH);
      character.stats.mp = Math.min(character.stats.maxMp, character.stats.mp + mpH);
      result.message = `Rested! +${hpH} HP, +${mpH} MP`;
    } else if (currentNode.type === 'shrine') {
      result.message = 'The shrine blesses you!';
    } else if (currentNode.type === 'mystery') {
      if (['open', 'pray', 'drink'].includes(choice)) {
        if (Math.random() < 0.6) {
          const gold = Math.floor(15 + Math.random() * 30);
          character.gold += gold;
          result.message = `Lucky! +${gold}g`;
        } else {
          const dmg = Math.floor(character.stats.maxHp * 0.1);
          character.stats.hp = Math.max(1, character.stats.hp - dmg);
          result.message = `Ouch! -${dmg} HP`;
        }
      } else {
        result.message = 'You left it alone.';
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
