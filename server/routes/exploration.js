// ============================================================
// EXPLORATION ROUTES - Tower Combat & Exploration
// ============================================================
// Phase 9.7.3: Bug Fixes
// - Fixed defeat handling (HP/MP now properly saved to DB)
// - Added shrine blessing system (generates, stores, applies blessings)
// - Added potion use in combat (useItem action)
// 
// ARCHITECTURE:
// - Skill data: ../data/skillDatabase.js (edit skills here)
// - Combat logic: ../data/combat/combatEngine.js (edit effects here)
// - This file: Route handlers only
// ============================================================

import express from 'express';
import Character from '../models/Character.js';
import FloorMap from '../models/FloorMap.js';
import { authenticate } from '../middleware/auth.js';
import { TOWERS, ENEMIES } from '../data/towerData.js';

// Equipment Database v2
import { 
  EQUIPMENT, 
  getRandomEquipment, 
  calculateEquipmentStats,
  calculateSetBonuses,
  getMaterialsByTower,
  CONSUMABLES
} from '../data/equipment/index.js';
import { HIDDEN_CLASS_SCROLLS, MEMORY_CRYSTAL_FRAGMENT } from '../data/equipment/special_items.js';

// ============================================================
// COMBAT SYSTEM IMPORTS - All skill/combat logic comes from here
// ============================================================
import {
  getSkill,
  calculateSkillDamage,
  processSkillEffects,
  calculateHealAmount,
  processDotEffects,
  tickBuffs,
  tickDots,
  formatSkillMessage,
  ELEMENTS,
  DOT_TYPES,
  CONTROL_TYPES
} from '../data/combat/index.js';

import { ALL_SKILLS, formatSkillForDisplay } from '../data/skillDatabase.js';

const router = express.Router();
const ENERGY_PER_EXPLORATION = 5;

// ============================================================
// PHASE 9.7.2: BALANCE CONFIG
// ============================================================
// Tunable values for game balance. Edit these to adjust progression speed.
// 
// Target Progression:
// Tower 1 (F1-15): Level 1 → 8
// Tower 2 (F1-15): Level 8 → 16
// Tower 3 (F1-15): Level 16 → 24
// Tower 4 (F1-15): Level 24 → 32
// Tower 5 (F1-15): Level 32 → 40
// 
const BALANCE = {
  expBase: {
    normal: 6,      // Reduced from 8 - base EXP per normal enemy
    elite: 18,      // Reduced from 25 - base EXP per elite enemy
    boss: 45        // Reduced from 60 - base EXP per boss
  },
  goldBase: {
    normal: { min: 3, max: 8 },
    elite: { min: 8, max: 18 },
    boss: { min: 20, max: 50 }
  },
  floorExpBonus: 0.03,      // +3% per floor (was 5%) - slower floor scaling
  towerExpBonus: 0.20,      // +20% per tower (was 25%) - slower tower scaling
  expCurveBase: 100,        // Base EXP needed for level 2
  expCurveMultiplier: 1.30  // 30% more EXP needed per level (was 25%) - steeper curve
};

// ============================================================
// PHASE 9.7.3: SHRINE BLESSING SYSTEM
// ============================================================
const SHRINE_BLESSINGS = [
  { id: 'strength', name: 'Blessing of Strength', icon: '⚔️', desc: '+15% ATK', stat: 'attack', value: 15 },
  { id: 'iron', name: 'Blessing of Iron', icon: '🛡️', desc: '+15% DEF', stat: 'defense', value: 15 },
  { id: 'precision', name: 'Blessing of Precision', icon: '🎯', desc: '+10% Crit', stat: 'critRate', value: 10 },
  { id: 'vitality', name: 'Blessing of Vitality', icon: '❤️', desc: '+20% Max HP', stat: 'maxHp', value: 20 },
  { id: 'wisdom', name: 'Blessing of Wisdom', icon: '💎', desc: '+20% Max MP', stat: 'maxMp', value: 20 },
  { id: 'wind', name: 'Blessing of Wind', icon: '💨', desc: '+8% Evasion', stat: 'evasion', value: 8 },
  { id: 'power', name: 'Blessing of Power', icon: '💥', desc: '+10% All DMG', stat: 'allDamage', value: 10 }
];

function getRandomBlessing() {
  return SHRINE_BLESSINGS[Math.floor(Math.random() * SHRINE_BLESSINGS.length)];
}

// ============================================================
// SLOT MAPPING
// ============================================================
const SLOT_MAPPING = {
  head: 'head', body: 'body', leg: 'hands', shoes: 'feet',
  leftHand: 'cape', rightHand: 'mainHand', ring: 'ring', necklace: 'necklace'
};

const REVERSE_SLOT_MAPPING = {
  head: 'head', body: 'body', hands: 'leg', feet: 'shoes',
  cape: 'leftHand', mainHand: 'rightHand', ring: 'ring', necklace: 'necklace'
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================
function getEquippedItemIds(character) {
  const itemIds = [];
  if (!character.equipment) return itemIds;
  ['head', 'body', 'leg', 'shoes', 'leftHand', 'rightHand', 'ring', 'necklace'].forEach(slot => {
    if (character.equipment[slot]?.itemId) itemIds.push(character.equipment[slot].itemId);
  });
  return itemIds;
}

function getEquipmentStatsFromCharacter(character) {
  const stats = { pAtk: 0, mAtk: 0, pDef: 0, mDef: 0, hp: 0, mp: 0, str: 0, agi: 0, dex: 0, int: 0, vit: 0, critRate: 0, critDmg: 0 };
  if (!character.equipment) return stats;
  ['head', 'body', 'leg', 'shoes', 'leftHand', 'rightHand', 'ring', 'necklace'].forEach(slot => {
    const equippedItem = character.equipment[slot];
    if (equippedItem?.stats) {
      Object.keys(equippedItem.stats).forEach(statKey => {
        if (stats.hasOwnProperty(statKey)) stats[statKey] += equippedItem.stats[statKey] || 0;
      });
    }
  });
  return stats;
}

function calculateCombatStats(character, shrineBuffs = []) {
  const stats = character.stats;
  const level = character.level || 1;
  const equippedIds = getEquippedItemIds(character);
  
  let equipBonus = { pAtk: 0, mAtk: 0, pDef: 0, mDef: 0, hp: 0, mp: 0, str: 0, agi: 0, dex: 0, int: 0, vit: 0, critRate: 0, critDmg: 0 };
  try { equipBonus = calculateEquipmentStats(equippedIds); } catch (err) { }
  
  const directStats = getEquipmentStatsFromCharacter(character);
  const totalEquipBonus = {};
  Object.keys(equipBonus).forEach(key => {
    totalEquipBonus[key] = Math.max(equipBonus[key] || 0, directStats[key] || 0);
  });
  
  let setBonus = {};
  try { setBonus = calculateSetBonuses(equippedIds); } catch (err) { }
  
  const totalStr = (stats.str || 0) + (totalEquipBonus.str || 0);
  const totalAgi = (stats.agi || 0) + (totalEquipBonus.agi || 0);
  const totalDex = (stats.dex || 0) + (totalEquipBonus.dex || 0);
  const totalInt = (stats.int || 0) + (totalEquipBonus.int || 0);
  const totalVit = (stats.vit || 0) + (totalEquipBonus.vit || 0);
  const levelBonus = 1 + (level - 1) * 0.02;
  
  // Base combat stats
  let pDmg = Math.floor((5 + totalStr * 3 + (totalEquipBonus.pAtk || 0)) * levelBonus);
  let mDmg = Math.floor((5 + totalInt * 4 + (totalEquipBonus.mAtk || 0)) * levelBonus);
  let pDef = totalStr + totalVit * 2 + (totalEquipBonus.pDef || 0);
  let mDef = totalVit + totalInt + (totalEquipBonus.mDef || 0);
  let critRate = Math.min(5 + totalAgi * 0.5 + (totalEquipBonus.critRate || 0), 80);
  let critDmg = 150 + totalDex + (totalEquipBonus.critDmg || 0);
  let bonusHp = totalEquipBonus.hp || 0;
  let bonusMp = totalEquipBonus.mp || 0;
  let evasion = 0;
  let allDamageBonus = 0;
  
  // ============================================================
  // PHASE 9.7.3: Apply Shrine Blessings to combat stats
  // ============================================================
  for (const blessing of shrineBuffs) {
    switch (blessing.stat) {
      case 'attack':
        pDmg = Math.floor(pDmg * (1 + blessing.value / 100));
        mDmg = Math.floor(mDmg * (1 + blessing.value / 100));
        break;
      case 'defense':
        pDef = Math.floor(pDef * (1 + blessing.value / 100));
        mDef = Math.floor(mDef * (1 + blessing.value / 100));
        break;
      case 'critRate':
        critRate = Math.min(critRate + blessing.value, 80);
        break;
      case 'maxHp':
        bonusHp += Math.floor(stats.maxHp * blessing.value / 100);
        break;
      case 'maxMp':
        bonusMp += Math.floor(stats.maxMp * blessing.value / 100);
        break;
      case 'evasion':
        evasion += blessing.value;
        break;
      case 'allDamage':
        allDamageBonus += blessing.value;
        break;
    }
  }
  
  return {
    pDmg,
    mDmg,
    pDef,
    mDef,
    critRate,
    critDmg,
    bonusHp,
    bonusMp,
    evasion,
    allDamageBonus,
    activeSets: setBonus,
    equipmentBonus: totalEquipBonus
  };
}

// ============================================================
// DROP RATES & LOOT (Phase 9.7.2: Updated gold values)
// ============================================================
const DROP_RATES = {
  combat: { equipment: 0.05, material: 0.15, potion: 0.15, gold: BALANCE.goldBase.normal },
  elite: { equipment: 0.12, material: 0.25, potion: 0.15, gold: BALANCE.goldBase.elite },
  boss: { equipment: 0.20, hiddenScroll: 0.06, memoryCrystalFragment: 0.10, material: 0.40, potion: 0.15, gold: BALANCE.goldBase.boss }
};

function generateLootDrops(nodeType, towerId, floor, playerLevel, playerClass) {
  const drops = [];
  const rates = DROP_RATES[nodeType] || DROP_RATES.combat;
  const goldAmount = Math.floor(rates.gold.min + Math.random() * (rates.gold.max - rates.gold.min) + floor * 2);
  
  if (Math.random() < rates.equipment) {
    const equipment = getRandomEquipment(towerId, floor, playerLevel, playerClass);
    if (equipment) {
      drops.push({ type: 'equipment', item: {
        itemId: equipment.id, name: equipment.name, icon: equipment.icon, type: equipment.type,
        subtype: equipment.slot, slot: equipment.slot, characterSlot: REVERSE_SLOT_MAPPING[equipment.slot] || equipment.slot,
        rarity: equipment.rarity, quantity: 1, stackable: false, stats: equipment.stats,
        sellPrice: equipment.sellPrice || 50, levelReq: equipment.levelReq, class: equipment.class, setId: equipment.setId
      }});
    }
  }
  
  if (Math.random() < rates.material) {
    const materials = getMaterialsByTower(towerId);
    if (materials?.length > 0) {
      const mat = materials[Math.floor(Math.random() * materials.length)];
      drops.push({ type: 'material', item: {
        itemId: mat.id, name: mat.name, icon: mat.icon || '🧱', type: 'material',
        rarity: mat.rarity || 'common', quantity: Math.floor(1 + Math.random() * 3), stackable: true, sellPrice: mat.sellPrice || 10
      }});
    }
  }
  
  if (Math.random() < rates.potion) {
    let potionPool = [];
    if (Array.isArray(CONSUMABLES)) potionPool = CONSUMABLES.filter(c => c.subtype === 'health_potion' || c.subtype === 'mana_potion');
    else if (typeof CONSUMABLES === 'object') potionPool = Object.values(CONSUMABLES).filter(c => c && (c.subtype === 'health_potion' || c.subtype === 'mana_potion'));
    if (potionPool.length === 0) potionPool = [
      { id: 'small_health_potion', name: 'Small Health Potion', icon: '🧪', subtype: 'health_potion', rarity: 'common', sellPrice: 25, effect: { type: 'heal', value: 100 } },
      { id: 'small_mana_potion', name: 'Small Mana Potion', icon: '💙', subtype: 'mana_potion', rarity: 'common', sellPrice: 20, effect: { type: 'mana', value: 50 } }
    ];
    const potion = potionPool[Math.floor(Math.random() * potionPool.length)];
    if (potion) drops.push({ type: 'consumable', item: {
      itemId: potion.id, name: potion.name, icon: potion.icon || '🧪', type: 'consumable',
      subtype: potion.subtype, rarity: potion.rarity || 'common', quantity: 1, stackable: true, sellPrice: potion.sellPrice || 25, effect: potion.effect
    }});
  }
  
  if (nodeType === 'boss') {
    if (Math.random() < rates.hiddenScroll) {
      const availableScrolls = Object.values(HIDDEN_CLASS_SCROLLS).filter(s => s.dropTowers.includes(towerId));
      if (availableScrolls.length > 0) {
        const scroll = availableScrolls[Math.floor(Math.random() * availableScrolls.length)];
        drops.push({ type: 'hidden_class_scroll', item: {
          itemId: scroll.id, name: scroll.name, icon: scroll.icon, type: 'hidden_class_scroll',
          rarity: 'legendary', quantity: 1, stackable: false, sellPrice: null, hiddenClass: scroll.hiddenClass, baseClass: scroll.baseClass
        }});
      }
    }
    if (Math.random() < rates.memoryCrystalFragment) {
      drops.push({ type: 'material', item: {
        itemId: 'memory_crystal_fragment', name: MEMORY_CRYSTAL_FRAGMENT.name, icon: MEMORY_CRYSTAL_FRAGMENT.icon,
        type: 'material', rarity: MEMORY_CRYSTAL_FRAGMENT.rarity, quantity: 1, stackable: true, sellPrice: MEMORY_CRYSTAL_FRAGMENT.sellPrice
      }});
    }
  }
  
  return { drops, goldAmount };
}

function addItemsToInventory(character, drops) {
  const addedItems = [];
  drops.forEach(drop => {
    const item = drop.item;
    if (item.stackable) {
      const existing = character.inventory.find(i => i.itemId === item.itemId);
      if (existing) { existing.quantity += item.quantity; addedItems.push({ ...item, action: 'stacked' }); return; }
    }
    if (character.inventory.length >= character.inventorySize) { addedItems.push({ ...item, action: 'inventory_full' }); return; }
    character.inventory.push(item);
    addedItems.push({ ...item, action: 'added' });
  });
  return addedItems;
}

// ============================================================
// FLOOR MAP & ENEMY GENERATION
// ============================================================
function generateFloorMap(characterId, towerId, floor) {
  const nodes = [], isBossFloor = floor % 5 === 0, isEliteFloor = floor % 3 === 0 && !isBossFloor;
  const rows = isBossFloor ? 5 : 4, nodesPerRow = [1, 2, 3, 2, 1];
  let nodeId = 0;
  const nodeGrid = [];
  
  for (let row = 0; row < rows; row++) {
    const rowNodes = [], colCount = nodesPerRow[Math.min(row, nodesPerRow.length - 1)];
    for (let col = 0; col < colCount; col++) {
      const id = `node_${nodeId++}`;
      let type = 'combat';
      if (row === 0) type = 'start';
      else if (row === rows - 1) type = isBossFloor ? 'boss' : (isEliteFloor ? 'elite' : 'combat');
      else { const roll = Math.random(); type = roll < 0.45 ? 'combat' : roll < 0.60 ? 'treasure' : roll < 0.72 ? 'rest' : roll < 0.85 ? 'mystery' : 'shrine'; }
      
      const node = { id, type, row, col, connections: [], visited: row === 0, cleared: row === 0, enemies: [], waves: 1, isExit: row === rows - 1 };
      if (['combat', 'elite', 'boss'].includes(type)) {
        node.enemies = generateEnemies(type, towerId, floor);
        node.waves = type === 'boss' ? 1 : (type === 'elite' ? 1 : Math.min(1 + Math.floor(floor / 5), 3));
      }
      if (type === 'treasure') node.rewards = { gold: Math.floor(8 + floor * 2), exp: Math.floor(1 + floor * 0.5), healPercent: Math.random() < 0.3 ? 15 : 0 };
      if (type === 'mystery') node.scenario = [
        { id: 'chest', description: 'An old chest. Open or leave?', choices: ['open', 'leave'] },
        { id: 'altar', description: 'A glowing altar. Pray or destroy?', choices: ['pray', 'destroy'] },
        { id: 'fountain', description: 'Mysterious fountain. Drink or avoid?', choices: ['drink', 'avoid'] }
      ][Math.floor(Math.random() * 3)];
      rowNodes.push(node); nodes.push(node);
    }
    nodeGrid.push(rowNodes);
  }
  
  for (let row = 0; row < rows - 1; row++) {
    nodeGrid[row].forEach((node, colIndex) => {
      const nextRow = nodeGrid[row + 1], connectCount = Math.min(nextRow.length, Math.random() < 0.5 ? 1 : 2);
      const sorted = nextRow.map((n, i) => ({ node: n, dist: Math.abs(i - colIndex) })).sort((a, b) => a.dist - b.dist);
      for (let i = 0; i < connectCount && i < sorted.length; i++) node.connections.push(sorted[i].node.id);
    });
  }
  for (let row = 1; row < rows; row++) {
    nodeGrid[row].forEach(node => {
      if (!nodeGrid[row - 1].some(prev => prev.connections.includes(node.id)))
        nodeGrid[row - 1][Math.floor(Math.random() * nodeGrid[row - 1].length)].connections.push(node.id);
    });
  }
  
  // Initialize empty shrineBuffs array for the floor
  return { characterId, towerId, floor, nodes, currentNodeId: nodes[0].id, startNodeId: nodes[0].id, bossNodeId: nodes[nodes.length - 1].id, shrineBuffs: [] };
}

function generateEnemies(type, towerId, floor) {
  const enemies = [], towerEnemies = ENEMIES[`tower${towerId}`] || ENEMIES.tower1;
  if (!towerEnemies) return [{ id: 'skeleton', name: 'Skeleton', icon: '💀', hp: 80, maxHp: 80, atk: 15, def: 6, expReward: BALANCE.expBase.normal, goldReward: BALANCE.goldBase.normal }];
  
  const floorScale = 1 + (floor - 1) * 0.15;
  if (type === 'boss' && towerEnemies.boss) {
    const b = { ...towerEnemies.boss };
    b.hp = Math.floor((b.baseHp || 800) * floorScale); b.maxHp = b.hp;
    b.atk = Math.floor((b.baseAtk || 50) * floorScale); b.def = Math.floor((b.baseDef || 20) * floorScale);
    b.expReward = b.expReward || BALANCE.expBase.boss;
    b.goldReward = b.goldReward || BALANCE.goldBase.boss;
    enemies.push(b);
  } else if (type === 'elite' && towerEnemies.elite?.length > 0) {
    const e = { ...towerEnemies.elite[Math.floor(Math.random() * towerEnemies.elite.length)] };
    e.hp = Math.floor((e.baseHp || 300) * floorScale); e.maxHp = e.hp;
    e.atk = Math.floor((e.baseAtk || 30) * floorScale); e.def = Math.floor((e.baseDef || 12) * floorScale);
    e.expReward = e.expReward || BALANCE.expBase.elite;
    e.goldReward = e.goldReward || BALANCE.goldBase.elite;
    enemies.push(e);
  } else if (towerEnemies.normal?.length > 0) {
    const count = 1 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) {
      const t = towerEnemies.normal[Math.floor(Math.random() * towerEnemies.normal.length)];
      const e = { ...t };
      e.hp = Math.floor((e.baseHp || 80) * floorScale); e.maxHp = e.hp;
      e.atk = Math.floor((e.baseAtk || 15) * floorScale); e.def = Math.floor((e.baseDef || 6) * floorScale);
      e.expReward = e.expReward || BALANCE.expBase.normal;
      e.goldReward = e.goldReward || BALANCE.goldBase.normal;
      e.instanceId = `${e.id}_${i}`;
      enemies.push(e);
    }
  }
  return enemies;
}

// ============================================================
// ROUTES
// ============================================================
router.get('/skills', authenticate, (req, res) => {
  const skills = {};
  Object.entries(ALL_SKILLS).forEach(([id, skill]) => { skills[id] = formatSkillForDisplay(skill); });
  res.json({ skills });
});

router.get('/map', authenticate, async (req, res) => {
  try {
    const character = await Character.findOne({ userId: req.userId });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    
    const towerId = parseInt(req.query.towerId) || character.currentTower || 1;
    let floor = parseInt(req.query.floor) || character.currentFloor || 1;
    const highestFloor = character.towerProgress?.[`tower_${towerId}`] || 1;
    if (floor > highestFloor) floor = highestFloor;
    if (floor < 1) floor = 1;
    
    let floorMap = await FloorMap.findOne({ characterId: character._id, towerId, floor, completed: false });
    if (!floorMap) { floorMap = new FloorMap(generateFloorMap(character._id, towerId, floor)); await floorMap.save(); }
    
    character.currentFloor = floor; character.isInTower = true; await character.save();
    const tower = TOWERS[towerId] || { id: towerId, name: `Tower ${towerId}` };
    
    // Return shrine buffs with the map
    res.json({ 
      map: floorMap, 
      tower, 
      floor, 
      highestFloor, 
      shrineBuffs: floorMap.shrineBuffs || [],
      character: { hp: character.stats.hp, maxHp: character.stats.maxHp, mp: character.stats.mp, maxMp: character.stats.maxMp, energy: character.energy } 
    });
  } catch (error) { console.error('Get map error:', error); res.status(500).json({ error: error.message }); }
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
    
    character.energy -= ENERGY_PER_EXPLORATION; character.isInTower = true;
    floorMap.currentNodeId = nodeId;
    const idx = floorMap.nodes.findIndex(n => n.id === nodeId);
    if (idx >= 0) { floorMap.nodes[idx].visited = true; floorMap.markModified('nodes'); }
    await character.save(); await floorMap.save();
    res.json({ success: true, node: targetNode, energy: character.energy, nodeType: targetNode.type, shrineBuffs: floorMap.shrineBuffs || [] });
  } catch (error) { console.error('Move error:', error); res.status(500).json({ error: error.message }); }
});

router.post('/combat/start', authenticate, async (req, res) => {
  try {
    const character = await Character.findOne({ userId: req.userId });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    
    const floorMap = await FloorMap.findOne({ characterId: character._id, completed: false });
    if (!floorMap) return res.status(404).json({ error: 'No active map' });
    
    const currentNode = floorMap.nodes.find(n => n.id === floorMap.currentNodeId);
    if (!currentNode) return res.status(400).json({ error: 'No current node' });
    if (!['combat', 'elite', 'boss'].includes(currentNode.type)) return res.status(400).json({ error: 'Not combat node' });
    if (currentNode.cleared) return res.status(400).json({ error: 'Already cleared' });
    
    let enemyList = currentNode.enemies || [];
    if (enemyList.length === 0) enemyList = generateEnemies(currentNode.type, floorMap.towerId, floorMap.floor);
    
    const enemies = enemyList.map((e, i) => ({
      id: e.id || `enemy_${i}`, instanceId: e.instanceId || `${e.id || 'enemy'}_${i}`,
      name: e.name || 'Enemy', icon: e.icon || '👹',
      hp: e.hp || e.maxHp || 50, maxHp: e.maxHp || e.hp || 50,
      atk: e.atk || 10, def: e.def || 5, mDef: e.mDef || e.def || 5, element: e.element || 'none',
      expReward: e.expReward || BALANCE.expBase.normal, goldReward: e.goldReward || BALANCE.goldBase.normal,
      isElite: e.isElite || false, isBoss: e.isBoss || false
    }));
    
    // Build combat log with shrine blessings info
    const combatLogs = [{ actor: 'system', message: `Combat started! Wave 1/${currentNode.waves}`, damage: 0, type: 'info' }];
    if (floorMap.shrineBuffs && floorMap.shrineBuffs.length > 0) {
      const blessingIcons = floorMap.shrineBuffs.map(b => b.icon).join(' ');
      combatLogs.push({ actor: 'system', message: `Shrine blessings active: ${blessingIcons}`, damage: 0, type: 'blessing' });
    }
    
    floorMap.activeCombat = {
      nodeId: currentNode.id, wave: 1, enemies, turnCount: 0,
      combatLog: combatLogs,
      playerBuffs: [], playerDots: [], enemyDebuffs: [], enemyDots: []
    };
    floorMap.markModified('activeCombat'); await floorMap.save();
    
    const playerSkills = (character.skills || []).map(s => {
      const skillData = getSkill(s.skillId);
      return { skillId: s.skillId, name: skillData.name, mpCost: skillData.mpCost, type: skillData.type, element: skillData.element, elementIcon: ELEMENTS[skillData.element]?.icon || '', description: skillData.description, hits: skillData.hits || 1, scaling: skillData.scaling };
    });
    
    // Get usable potions from inventory for combat
    const usablePotions = character.inventory.filter(item => 
      item.type === 'consumable' && 
      (item.subtype === 'health_potion' || item.subtype === 'mana_potion') &&
      item.quantity > 0
    );
    
    res.json({ 
      combat: floorMap.activeCombat, 
      waves: currentNode.waves, 
      shrineBuffs: floorMap.shrineBuffs || [],
      usablePotions,
      character: { hp: character.stats.hp, maxHp: character.stats.maxHp, mp: character.stats.mp, maxMp: character.stats.maxMp, skills: playerSkills } 
    });
  } catch (error) { console.error('Combat start error:', error); res.status(500).json({ error: error.message }); }
});

// ============================================================
// COMBAT ACTION - Main combat logic using combat engine
// ============================================================
router.post('/combat/action', authenticate, async (req, res) => {
  try {
    const { action, skillId, targetIndex, itemId } = req.body;
    const character = await Character.findOne({ userId: req.userId });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    
    const floorMap = await FloorMap.findOne({ characterId: character._id, completed: false });
    if (!floorMap || !floorMap.activeCombat) return res.status(400).json({ error: 'No active combat' });
    
    const combat = floorMap.activeCombat;
    const currentNode = floorMap.nodes.find(n => n.id === combat.nodeId);
    const newLogs = [];
    
    // Initialize combat arrays
    combat.playerBuffs = combat.playerBuffs || [];
    combat.playerDots = combat.playerDots || [];
    combat.enemyDebuffs = combat.enemyDebuffs || [];
    combat.enemyDots = combat.enemyDots || [];
    
    // Get shrine buffs for combat stat calculation
    const shrineBuffs = floorMap.shrineBuffs || [];
    
    // Calculate combat stats WITH shrine buffs applied
    const combatStats = calculateCombatStats(character, shrineBuffs);
    
    // Apply buff bonuses
    let damageMultiplier = 1.0 + (combatStats.allDamageBonus / 100);
    let critBonus = 0, critDmgBonus = 0, defBonus = 0, evasionBonus = combatStats.evasion;
    combat.playerBuffs.forEach(b => {
      if (['pDmgUp', 'atkUp', 'attack', 'mDmgUp'].includes(b.type)) damageMultiplier += b.value / 100;
      if (['critRateUp', 'critRate'].includes(b.type)) critBonus += b.value;
      if (b.type === 'critDmgUp') critDmgBonus += b.value;
      if (['pDefUp', 'defUp', 'defend'].includes(b.type)) defBonus += b.value;
      if (['evasionUp', 'evasion'].includes(b.type)) evasionBonus += b.value;
      if (b.type === 'vanish') { damageMultiplier += 1.0; critBonus += 100; }
    });
    
    const pDmg = Math.floor(combatStats.pDmg * damageMultiplier);
    const mDmg = Math.floor(combatStats.mDmg * damageMultiplier);
    const pDef = combatStats.pDef + defBonus;
    const critRate = Math.min(combatStats.critRate + critBonus, 80);
    const critDmg = combatStats.critDmg + critDmgBonus;
    const fullCombatStats = { pDmg, mDmg, pDef, mDef: combatStats.mDef, critRate, critDmg };
    
    const aliveEnemies = combat.enemies.filter(e => e.hp > 0);
    
    // ============================================================
    // PHASE 9.7.3: USE ITEM ACTION (Potions in combat)
    // ============================================================
    if (action === 'useItem' && itemId) {
      const inventoryItem = character.inventory.find(item => item.itemId === itemId);
      if (!inventoryItem || inventoryItem.quantity <= 0) {
        return res.status(400).json({ error: 'Item not found in inventory' });
      }
      
      if (inventoryItem.type !== 'consumable') {
        return res.status(400).json({ error: 'Item is not consumable' });
      }
      
      const effect = inventoryItem.effect;
      let effectMessage = '';
      
      if (inventoryItem.subtype === 'health_potion' && effect?.type === 'heal') {
        const healAmount = effect.value || 100;
        const actualHeal = Math.min(healAmount, character.stats.maxHp - character.stats.hp);
        character.stats.hp = Math.min(character.stats.maxHp, character.stats.hp + healAmount);
        effectMessage = `Used ${inventoryItem.name}! +${actualHeal} HP`;
        newLogs.push({ actor: 'player', message: `🧪 ${effectMessage}`, damage: 0, type: 'heal' });
      } else if (inventoryItem.subtype === 'mana_potion' && effect?.type === 'mana') {
        const manaAmount = effect.value || 50;
        const actualMana = Math.min(manaAmount, character.stats.maxMp - character.stats.mp);
        character.stats.mp = Math.min(character.stats.maxMp, character.stats.mp + manaAmount);
        effectMessage = `Used ${inventoryItem.name}! +${actualMana} MP`;
        newLogs.push({ actor: 'player', message: `💙 ${effectMessage}`, damage: 0, type: 'mana' });
      } else {
        return res.status(400).json({ error: 'Cannot use this item in combat' });
      }
      
      // Reduce item quantity
      inventoryItem.quantity -= 1;
      if (inventoryItem.quantity <= 0) {
        character.inventory = character.inventory.filter(item => item.itemId !== itemId);
      }
      character.markModified('inventory');
      
      // Using an item counts as your turn - enemies still attack
      
    // PLAYER ACTION - ATTACK
    } else if (action === 'attack') {
      let target = combat.enemies[targetIndex || 0];
      if (!target || target.hp <= 0) target = aliveEnemies[0];
      if (!target) return res.status(400).json({ error: 'No targets' });
      
      const isCrit = Math.random() * 100 < critRate;
      const baseDmg = Math.max(1, pDmg - (target.def || 0) * 0.5);
      const damage = isCrit ? Math.floor(baseDmg * critDmg / 100) : Math.floor(baseDmg);
      target.hp = Math.max(0, target.hp - damage);
      newLogs.push({ actor: 'player', message: `Attack ${target.name} for ${damage} P.DMG${isCrit ? ' CRIT!' : ''}`, damage, type: isCrit ? 'crit' : 'damage' });
      combat.playerBuffs = combat.playerBuffs.filter(b => b.type !== 'vanish');
      
    } else if (action === 'skill' && skillId) {
      const skill = getSkill(skillId);
      if (character.stats.mp < skill.mpCost) return res.status(400).json({ error: 'Not enough MP' });
      
      // Check blocking effects
      const blockingEffects = skill.effects?.filter(e => e.type === 'requireHpThreshold') || [];
      for (const effect of blockingEffects) {
        const target = aliveEnemies[0];
        if (target && (target.hp / (target.maxHp || target.hp)) * 100 >= effect.threshold) {
          return res.status(400).json({ error: `Cannot use ${skill.name} - enemy HP must be below ${effect.threshold}%` });
        }
      }
      
      character.stats.mp -= skill.mpCost;
      let target = combat.enemies[targetIndex || 0];
      if (!target || target.hp <= 0) target = aliveEnemies[0];
      
      if (skill.type === 'damage') {
        if (!target) return res.status(400).json({ error: 'No targets' });
        
        const damageResult = calculateSkillDamage(skill, fullCombatStats, target, combat.playerBuffs, combat.enemyDebuffs);
        
        // Execute bonus
        const executeEffect = skill.effects?.find(e => e.type === 'executeBonus');
        if (executeEffect && (target.hp / (target.maxHp || target.hp)) * 100 < executeEffect.threshold) {
          damageResult.finalDamage = Math.floor(damageResult.finalDamage * (1 + executeEffect.bonusMultiplier));
        }
        
        target.hp = Math.max(0, target.hp - damageResult.finalDamage);
        newLogs.push({ actor: 'player', message: formatSkillMessage(skill, damageResult, target), damage: damageResult.finalDamage, type: damageResult.isCrit ? 'crit' : 'skill' });
        
        // Process effects
        const effectResults = processSkillEffects(skill, damageResult, fullCombatStats, target, character);
        for (const effect of effectResults) {
          if (effect.type === 'dot') {
            combat.enemyDots.push({ targetId: target.instanceId || target.id, dotType: effect.dotType, damage: effect.damage, duration: effect.duration, icon: effect.icon });
            newLogs.push({ actor: 'player', message: effect.message, damage: 0, type: 'debuff' });
          } else if (effect.type === 'debuff') {
            combat.enemyDebuffs.push({ type: effect.buffType, value: effect.value, duration: effect.duration });
            newLogs.push({ actor: 'player', message: effect.message, damage: 0, type: 'debuff' });
          } else if (effect.type === 'heal') {
            character.stats.hp = Math.min(character.stats.maxHp, character.stats.hp + effect.value);
            newLogs.push({ actor: 'player', message: effect.message, damage: 0, type: 'heal' });
          } else if (effect.type === 'selfDamage') {
            character.stats.hp = Math.max(1, character.stats.hp - effect.value);
            newLogs.push({ actor: 'player', message: effect.message, damage: effect.value, type: 'self_damage' });
          } else if (effect.type === 'control') {
            newLogs.push({ actor: 'player', message: effect.message, damage: 0, type: 'control' });
          }
        }
        combat.playerBuffs = combat.playerBuffs.filter(b => b.type !== 'vanish');
        
      } else if (skill.type === 'buff') {
        const effectResults = processSkillEffects(skill, { baseDamage: 0, finalDamage: 0 }, fullCombatStats, target, character);
        if (effectResults.length > 0) {
          for (const effect of effectResults) {
            if (effect.type === 'buff' || effect.type === 'shield') {
              combat.playerBuffs.push({ type: effect.buffType || effect.type, value: effect.value, duration: effect.duration });
              newLogs.push({ actor: 'player', message: `${skill.name}! ${effect.message}`, damage: 0, type: 'buff' });
            }
          }
        } else if (skill.effects) {
          for (const effect of skill.effects) {
            if (effect.type === 'buff') {
              combat.playerBuffs.push({ type: effect.buffType, value: effect.value, duration: effect.duration });
              newLogs.push({ actor: 'player', message: `${skill.name}! +${effect.value}% ${effect.buffType} for ${effect.duration}t`, damage: 0, type: 'buff' });
            }
          }
        }
        
      } else if (skill.type === 'heal') {
        const healAmount = calculateHealAmount(skill, fullCombatStats, character);
        character.stats.hp = Math.min(character.stats.maxHp, character.stats.hp + healAmount);
        newLogs.push({ actor: 'player', message: `${skill.name}! Healed ${healAmount} HP`, damage: 0, type: 'heal' });
        
      } else if (skill.type === 'debuff') {
        if (!target) return res.status(400).json({ error: 'No targets' });
        const effectResults = processSkillEffects(skill, { baseDamage: 0, finalDamage: 0 }, fullCombatStats, target, character);
        for (const effect of effectResults) {
          if (effect.type === 'debuff') {
            combat.enemyDebuffs.push({ type: effect.buffType, value: effect.value, duration: effect.duration });
            newLogs.push({ actor: 'player', message: `${skill.name}! ${effect.message}`, damage: 0, type: 'debuff' });
          }
        }
        
      } else if (skill.type === 'utility') {
        const effectResults = processSkillEffects(skill, { baseDamage: 0, finalDamage: 0 }, fullCombatStats, target, character);
        for (const effect of effectResults) {
          if (effect.type === 'steal') {
            character.gold += effect.value;
            newLogs.push({ actor: 'player', message: `${skill.name}! ${effect.message}`, damage: 0, type: 'steal' });
          }
        }
      }
      
    } else if (action === 'defend') {
      combat.playerBuffs.push({ type: 'defend', value: 50, duration: 1 });
      newLogs.push({ actor: 'player', message: 'Defending! -50% Damage taken, 1 turn', damage: 0, type: 'buff' });
    }
    
    // Process enemy DoTs
    for (const dot of combat.enemyDots) {
      const enemy = combat.enemies.find(e => (e.instanceId || e.id) === dot.targetId);
      if (enemy && enemy.hp > 0 && dot.duration > 0) {
        enemy.hp = Math.max(0, enemy.hp - dot.damage);
        const dotInfo = DOT_TYPES[dot.dotType] || { icon: '💀', message: (n, d) => `${n} takes ${d} damage!` };
        newLogs.push({ actor: 'system', message: `${dot.icon} ${dotInfo.message(enemy.name, dot.damage)}`, damage: dot.damage, type: 'dot' });
      }
    }
    combat.enemyDots = tickDots(combat.enemyDots);
    combat.enemyDebuffs = tickBuffs(combat.enemyDebuffs);
    
    // Check victory
    const stillAlive = combat.enemies.filter(e => e.hp > 0);
    
    if (stillAlive.length === 0) {
      // ============================================================
      // PHASE 9.7.2: Victory rewards with BALANCE config
      // ============================================================
      const baseExp = combat.enemies.reduce((s, e) => s + (e.expReward || BALANCE.expBase.normal), 0);
      const baseGold = combat.enemies.reduce((s, e) => {
        const goldRange = e.goldReward || BALANCE.goldBase.normal;
        return s + Math.floor(goldRange.min + Math.random() * (goldRange.max - goldRange.min));
      }, 0);
      
      const towerMultiplier = 1.0 + (floorMap.towerId - 1) * BALANCE.towerExpBonus;
      const floorMultiplier = 1.0 + (floorMap.floor - 1) * BALANCE.floorExpBonus;
      const nodeMultiplier = currentNode.type === 'boss' ? 2 : currentNode.type === 'elite' ? 1.5 : 1;
      
      const rewards = { 
        exp: Math.floor(baseExp * towerMultiplier * floorMultiplier * nodeMultiplier), 
        gold: Math.floor(baseGold * towerMultiplier * floorMultiplier * (currentNode.type === 'boss' ? 1.5 : currentNode.type === 'elite' ? 1.25 : 1)), 
        items: [] 
      };
      
      const loot = generateLootDrops(currentNode.type, floorMap.towerId, floorMap.floor, character.level, character.baseClass);
      rewards.gold += loot.goldAmount;
      
      if (loot.drops.length > 0) {
        const addedItems = addItemsToInventory(character, loot.drops);
        rewards.items = addedItems;
        character.markModified('inventory');
        addedItems.forEach(item => {
          if (item.action === 'added' || item.action === 'stacked') {
            const rarityColors = { common: '', uncommon: '🟢', rare: '🔵', epic: '🟣', legendary: '🟡' };
            newLogs.push({ actor: 'system', message: `${rarityColors[item.rarity] || ''} Obtained: ${item.icon || '📦'} ${item.name}${item.quantity > 1 ? ` x${item.quantity}` : ''}`, damage: 0, type: 'loot' });
          } else if (item.action === 'inventory_full') {
            newLogs.push({ actor: 'system', message: `⚠️ Inventory full! Lost: ${item.name}`, damage: 0, type: 'warning' });
          }
        });
      }
      
      character.experience += rewards.exp;
      character.gold += rewards.gold;
      character.statistics = character.statistics || {};
      character.statistics.totalKills = (character.statistics.totalKills || 0) + combat.enemies.length;
      character.statistics.totalGoldEarned = (character.statistics.totalGoldEarned || 0) + rewards.gold;
      if (currentNode.type === 'boss') character.statistics.bossKills = (character.statistics.bossKills || 0) + 1;
      else if (currentNode.type === 'elite') character.statistics.eliteKills = (character.statistics.eliteKills || 0) + 1;
      
      // ============================================================
      // PHASE 9.7.2: Level up curve with BALANCE config
      // ============================================================
      let leveledUp = false;
      while (character.experience >= character.experienceToNextLevel) {
        character.experience -= character.experienceToNextLevel;
        character.level++;
        character.statPoints += 5;
        character.experienceToNextLevel = Math.floor(BALANCE.expCurveBase * Math.pow(BALANCE.expCurveMultiplier, character.level - 1));
        character.stats.maxHp += 10 + character.stats.vit * 2;
        character.stats.maxMp += 5 + character.stats.int;
        character.stats.hp = character.stats.maxHp;
        character.stats.mp = character.stats.maxMp;
        leveledUp = true;
      }
      
      const idx = floorMap.nodes.findIndex(n => n.id === currentNode.id);
      if (idx >= 0) { floorMap.nodes[idx].cleared = true; floorMap.markModified('nodes'); }
      floorMap.activeCombat = undefined;
      floorMap.markModified('activeCombat');
      
      let floorComplete = false;
      if (currentNode.isExit) {
        character.currentFloor++;
        character.statistics.floorsCleared = (character.statistics.floorsCleared || 0) + 1;
        if (!character.highestFloorReached) character.highestFloorReached = { towerId: floorMap.towerId, floor: 1 };
        if (floorMap.towerId === character.highestFloorReached.towerId && character.currentFloor > character.highestFloorReached.floor) {
          character.highestFloorReached.floor = character.currentFloor;
        }
        if (!character.towerProgress) character.towerProgress = {};
        const towerKey = `tower_${floorMap.towerId}`;
        if (!character.towerProgress[towerKey] || character.currentFloor > character.towerProgress[towerKey]) {
          character.towerProgress[towerKey] = character.currentFloor;
          character.markModified('towerProgress');
        }
        floorMap.completed = true;
        character.isInTower = false;
        floorComplete = true;
        
        // Clear shrine buffs on floor completion
        floorMap.shrineBuffs = [];
        floorMap.markModified('shrineBuffs');
      }
      
      await character.save();
      await floorMap.save();
      
      newLogs.push({ actor: 'system', message: floorComplete ? 'Victory! Floor cleared!' : 'Victory!', damage: 0, type: 'victory' });
      
      return res.json({
        status: 'victory',
        combatLog: [...(combat.combatLog || []), ...newLogs],
        rewards, leveledUp, floorComplete,
        character: { hp: character.stats.hp, maxHp: character.stats.maxHp, mp: character.stats.mp, maxMp: character.stats.maxMp, level: character.level, gold: character.gold, experience: character.experience, experienceToNextLevel: character.experienceToNextLevel }
      });
    }
    
    // Enemy turn
    let damageReduction = 0;
    combat.playerBuffs.forEach(b => {
      if (b.type === 'defend' || b.type === 'shield') damageReduction += b.value;
      if (b.type === 'evasion') evasionBonus += b.value;
    });
    
    for (const enemy of stillAlive) {
      if (Math.random() * 100 < evasionBonus) {
        newLogs.push({ actor: 'enemy', message: `${enemy.name} attacks but you dodged!`, damage: 0, type: 'miss' });
        continue;
      }
      const rawDmg = Math.max(1, (enemy.atk || 10) - pDef * 0.3);
      const dmg = Math.max(1, Math.floor(rawDmg * (1 - damageReduction / 100)));
      character.stats.hp = Math.max(0, character.stats.hp - dmg);
      newLogs.push({ actor: 'enemy', message: `${enemy.name} attacks for ${dmg}!`, damage: dmg, type: 'enemy' });
    }
    
    combat.playerBuffs = tickBuffs(combat.playerBuffs);
    
    // ============================================================
    // PHASE 9.7.3: Defeat handling - restore 50% HP/MP AND SAVE PROPERLY
    // ============================================================
    if (character.stats.hp <= 0) {
      // Restore to 50% HP/MP on defeat
      character.stats.hp = Math.floor(character.stats.maxHp * 0.5);
      character.stats.mp = Math.floor(character.stats.maxMp * 0.5);
      character.statistics = character.statistics || {};
      character.statistics.deaths = (character.statistics.deaths || 0) + 1;
      character.isInTower = false;
      
      // Clear shrine buffs on defeat
      floorMap.shrineBuffs = [];
      floorMap.markModified('shrineBuffs');
      floorMap.activeCombat = undefined;
      floorMap.markModified('activeCombat');
      
      // Mark stats as modified to ensure HP/MP are saved
      character.markModified('stats');
      character.markModified('statistics');
      
      await character.save();
      await floorMap.save();
      
      newLogs.push({ actor: 'system', message: 'Defeated! Returned to town with 50% HP/MP.', damage: 0, type: 'defeat' });
      return res.json({ 
        status: 'defeat', 
        combatLog: [...(combat.combatLog || []), ...newLogs], 
        character: { 
          hp: character.stats.hp, 
          maxHp: character.stats.maxHp,
          mp: character.stats.mp,
          maxMp: character.stats.maxMp
        } 
      });
    }
    
    combat.turnCount++;
    combat.combatLog = [...(combat.combatLog || []), ...newLogs];
    floorMap.markModified('activeCombat');
    
    // Mark stats as modified to ensure HP/MP changes are saved
    character.markModified('stats');
    await character.save();
    await floorMap.save();
    
    // Get updated usable potions
    const usablePotions = character.inventory.filter(item => 
      item.type === 'consumable' && 
      (item.subtype === 'health_potion' || item.subtype === 'mana_potion') &&
      item.quantity > 0
    );
    
    res.json({ 
      status: 'ongoing', 
      combat: floorMap.activeCombat, 
      playerBuffs: combat.playerBuffs || [], 
      shrineBuffs: floorMap.shrineBuffs || [],
      usablePotions,
      character: { hp: character.stats.hp, maxHp: character.stats.maxHp, mp: character.stats.mp, maxMp: character.stats.maxMp } 
    });
  } catch (error) {
    console.error('Combat action error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// INTERACT - Treasure, Rest, Shrine, Mystery
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
      result.message = `Found ${currentNode.rewards.gold}g, ${currentNode.rewards.exp} exp!`;
    } else if (currentNode.type === 'rest') {
      const hpH = Math.floor(character.stats.maxHp * 0.3);
      const mpH = Math.floor(character.stats.maxMp * 0.3);
      character.stats.hp = Math.min(character.stats.maxHp, character.stats.hp + hpH);
      character.stats.mp = Math.min(character.stats.maxMp, character.stats.mp + mpH);
      result.message = `Rested! +${hpH} HP, +${mpH} MP`;
    } else if (currentNode.type === 'shrine') {
      // ============================================================
      // PHASE 9.7.3: SHRINE BLESSING SYSTEM
      // ============================================================
      const blessing = getRandomBlessing();
      
      // Initialize shrineBuffs array if it doesn't exist
      if (!floorMap.shrineBuffs) floorMap.shrineBuffs = [];
      
      // Check if player already has this blessing (stacking at 50% effectiveness)
      const existingBlessing = floorMap.shrineBuffs.find(b => b.id === blessing.id);
      if (existingBlessing) {
        // Stack at 50% effectiveness
        const stackValue = Math.floor(blessing.value * 0.5);
        existingBlessing.value += stackValue;
        existingBlessing.desc = `+${existingBlessing.value}% ${blessing.stat === 'attack' ? 'ATK' : blessing.stat === 'defense' ? 'DEF' : blessing.stat === 'critRate' ? 'Crit' : blessing.stat === 'maxHp' ? 'Max HP' : blessing.stat === 'maxMp' ? 'Max MP' : blessing.stat === 'evasion' ? 'Evasion' : 'All DMG'}`;
        result.message = `The shrine strengthens ${blessing.name}! ${blessing.icon} +${stackValue}% (Total: +${existingBlessing.value}%)`;
      } else {
        // Add new blessing
        floorMap.shrineBuffs.push({
          id: blessing.id,
          name: blessing.name,
          icon: blessing.icon,
          desc: blessing.desc,
          stat: blessing.stat,
          value: blessing.value
        });
        result.message = `The shrine grants ${blessing.name}! ${blessing.icon} ${blessing.desc}`;
      }
      
      floorMap.markModified('shrineBuffs');
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
    
    let floorComplete = false;
    if (currentNode.isExit) {
      character.currentFloor++;
      character.statistics = character.statistics || {};
      character.statistics.floorsCleared = (character.statistics.floorsCleared || 0) + 1;
      if (!character.highestFloorReached) character.highestFloorReached = { towerId: floorMap.towerId, floor: 1 };
      if (floorMap.towerId === character.highestFloorReached.towerId && character.currentFloor > character.highestFloorReached.floor) {
        character.highestFloorReached.floor = character.currentFloor;
      }
      if (!character.towerProgress) character.towerProgress = {};
      const towerKey = `tower_${floorMap.towerId}`;
      if (!character.towerProgress[towerKey] || character.currentFloor > character.towerProgress[towerKey]) {
        character.towerProgress[towerKey] = character.currentFloor;
        character.markModified('towerProgress');
      }
      floorMap.completed = true;
      character.isInTower = false;
      floorComplete = true;
      
      // Clear shrine buffs on floor completion
      floorMap.shrineBuffs = [];
      floorMap.markModified('shrineBuffs');
      
      result.message += ` Floor cleared! Floor ${character.currentFloor} unlocked!`;
    }
    
    await character.save();
    await floorMap.save();
    
    res.json({ 
      success: true, 
      ...result, 
      floorComplete, 
      shrineBuffs: floorMap.shrineBuffs || [],
      character: { hp: character.stats.hp, maxHp: character.stats.maxHp, mp: character.stats.mp, maxMp: character.stats.maxMp, gold: character.gold } 
    });
  } catch (error) {
    console.error('Interact error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/leave', authenticate, async (req, res) => {
  try {
    const character = await Character.findOne({ userId: req.userId });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    
    // Clear shrine buffs when leaving
    const floorMap = await FloorMap.findOne({ characterId: character._id, completed: false });
    if (floorMap) {
      floorMap.shrineBuffs = [];
      floorMap.markModified('shrineBuffs');
      await floorMap.save();
    }
    
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
