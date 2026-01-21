// ============================================================
// EXPLORATION ROUTES - Tower Combat & Exploration
// ============================================================
// Phase 9.9.5: Fixed mDef scaling for enemies
// Phase 9.9.6: Added debug logging and fallback for enemy generation
// - generateEnemies() now properly scales baseMDef -> mDef
// - Added fallback skeleton enemy if no enemies are generated
// - Added debug logging to diagnose ENEMIES import issues
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

// ============================================================
// PHASE 9.9.6: DEBUG - Log ENEMIES structure on startup
// ============================================================
console.log('[exploration.js] ENEMIES imported. Keys:', Object.keys(ENEMIES || {}));
if (ENEMIES?.tower1) {
  console.log('[exploration.js] ENEMIES.tower1 exists. Structure:', {
    hasNormal: Array.isArray(ENEMIES.tower1.normal),
    normalCount: ENEMIES.tower1.normal?.length || 0,
    hasElite: Array.isArray(ENEMIES.tower1.elite),
    eliteCount: ENEMIES.tower1.elite?.length || 0,
    hasBoss: !!ENEMIES.tower1.boss
  });
} else {
  console.log('[exploration.js] WARNING: ENEMIES.tower1 is undefined!');
}

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
// PHASE 9.7.3: BALANCE CONFIG - Further reduced EXP
// ============================================================
// Tunable values for game balance. Edit these to adjust progression speed.
// 
// Target Progression:
// Tower 1 (F1-15): Level 1 → 4
// Tower 2 (F1-15): Level 4 → 8
// Tower 3 (F1-15): Level 8 → 12
// Tower 4 (F1-15): Level 12 → 16
// Tower 5 (F1-15): Level 16 → 20
// 
const BALANCE = {
  expBase: {
    normal: 3,      // Reduced from 6 - base EXP per normal enemy
    elite: 10,      // Reduced from 18 - base EXP per elite enemy
    boss: 25        // Reduced from 45 - base EXP per boss
  },
  goldBase: {
    normal: { min: 3, max: 8 },
    elite: { min: 8, max: 18 },
    boss: { min: 20, max: 50 }
  },
  floorExpBonus: 0.02,      // +2% per floor (was 3%) - slower floor scaling
  towerExpBonus: 0.15,      // +15% per tower (was 20%) - slower tower scaling
  expCurveBase: 100,        // Base EXP needed for level 2
  expCurveMultiplier: 1.35  // 35% more EXP needed per level (was 30%) - steeper curve
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
  // ============================================================
  // PHASE 9.9.4: Use Character.calculateDerivedStats for percentage stat support
  // This ensures VIP items with percentage stats work in combat
  // ============================================================
  const derivedStats = Character.calculateDerivedStats(character);
  
  // Get base values from the server-calculated derived stats
  let pDmg = derivedStats.pDmg || 0;
  let mDmg = derivedStats.mDmg || 0;
  let pDef = derivedStats.pDef || 0;
  let mDef = derivedStats.mDef || 0;
  let critRate = Math.min(derivedStats.critRate || 5, 80);
  let critDmg = derivedStats.critDmg || 150;
  let bonusHp = derivedStats.bonusHp || 0;
  let bonusMp = derivedStats.bonusMp || 0;
  let evasion = derivedStats.evasion || 0;
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
        bonusHp += Math.floor((character.stats.maxHp || 100) * blessing.value / 100);
        break;
      case 'maxMp':
        bonusMp += Math.floor((character.stats.maxMp || 50) * blessing.value / 100);
        break;
      case 'evasion':
        evasion = Math.min(evasion + blessing.value, 60);
        break;
      case 'allDamage':
        allDamageBonus += blessing.value;
        break;
    }
  }
  
  // Apply all damage bonus
  if (allDamageBonus > 0) {
    pDmg = Math.floor(pDmg * (1 + allDamageBonus / 100));
    mDmg = Math.floor(mDmg * (1 + allDamageBonus / 100));
  }
  
  // Get set bonuses from equipment
  const equippedIds = getEquippedItemIds(character);
  let setBonus = {};
  try { setBonus = calculateSetBonuses(equippedIds); } catch (err) { }
  
  return { 
    pDmg, mDmg, pDef, mDef, 
    critRate, critDmg, 
    bonusHp, bonusMp,
    evasion,
    setBonus,
    // Include special bonuses from VIP items
    expBonus: derivedStats.expBonus || 0,
    goldBonus: derivedStats.goldBonus || 0
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

// ============================================================
// PHASE 9.9.6: FIXED - generateEnemies with debug logging and fallback
// ============================================================
function generateEnemies(type, towerId, floor) {
  // ============================================================
  // DEBUG: Log enemy generation details
  // ============================================================
  console.log(`[generateEnemies] Called with type=${type}, towerId=${towerId}, floor=${floor}`);
  console.log(`[generateEnemies] ENEMIES object exists:`, !!ENEMIES);
  console.log(`[generateEnemies] ENEMIES keys:`, Object.keys(ENEMIES || {}));
  
  const enemies = [];
  const towerKey = `tower${towerId}`;
  const towerEnemies = ENEMIES?.[towerKey] || ENEMIES?.tower1;
  
  console.log(`[generateEnemies] Looking for ENEMIES['${towerKey}']:`, !!ENEMIES?.[towerKey]);
  console.log(`[generateEnemies] towerEnemies found:`, !!towerEnemies);
  
  if (towerEnemies) {
    console.log(`[generateEnemies] towerEnemies structure:`, {
      hasNormal: !!towerEnemies.normal,
      normalLength: towerEnemies.normal?.length,
      hasElite: !!towerEnemies.elite,
      eliteLength: towerEnemies.elite?.length,
      hasBoss: !!towerEnemies.boss
    });
  }
  
  // ============================================================
  // FALLBACK: If no tower enemies data, return default skeleton
  // ============================================================
  if (!towerEnemies) {
    console.log('[generateEnemies] WARNING: No towerEnemies found, using fallback skeleton');
    const floorScale = 1 + (floor - 1) * 0.15;
    return [{ 
      id: 'skeleton', 
      name: 'Skeleton', 
      icon: '💀', 
      hp: Math.floor(80 * floorScale), 
      maxHp: Math.floor(80 * floorScale), 
      atk: Math.floor(15 * floorScale), 
      def: Math.floor(6 * floorScale), 
      mDef: Math.floor(3 * floorScale),
      expReward: BALANCE.expBase.normal, 
      goldReward: BALANCE.goldBase.normal,
      instanceId: 'skeleton_0'
    }];
  }
  
  const floorScale = 1 + (floor - 1) * 0.15;
  
  if (type === 'boss' && towerEnemies.boss) {
    const b = { ...towerEnemies.boss };
    b.hp = Math.floor((b.baseHp || 800) * floorScale); 
    b.maxHp = b.hp;
    b.atk = Math.floor((b.baseAtk || 50) * floorScale); 
    b.def = Math.floor((b.baseDef || 20) * floorScale);
    // ============================================================
    // FIX: Scale mDef from baseMDef (fallback to 50% of baseDef)
    // ============================================================
    b.mDef = Math.floor((b.baseMDef || Math.floor((b.baseDef || 20) * 0.5)) * floorScale);
    b.expReward = b.expReward || BALANCE.expBase.boss;
    b.goldReward = b.goldReward || BALANCE.goldBase.boss;
    
    console.log(`[generateEnemies] BOSS: ${b.name} - def: ${b.def}, mDef: ${b.mDef}`);
    enemies.push(b);
    
  } else if (type === 'elite' && towerEnemies.elite?.length > 0) {
    const e = { ...towerEnemies.elite[Math.floor(Math.random() * towerEnemies.elite.length)] };
    e.hp = Math.floor((e.baseHp || 300) * floorScale); 
    e.maxHp = e.hp;
    e.atk = Math.floor((e.baseAtk || 30) * floorScale); 
    e.def = Math.floor((e.baseDef || 12) * floorScale);
    // ============================================================
    // FIX: Scale mDef from baseMDef (fallback to 50% of baseDef)
    // ============================================================
    e.mDef = Math.floor((e.baseMDef || Math.floor((e.baseDef || 12) * 0.5)) * floorScale);
    e.expReward = e.expReward || BALANCE.expBase.elite;
    e.goldReward = e.goldReward || BALANCE.goldBase.elite;
    
    console.log(`[generateEnemies] ELITE: ${e.name} - def: ${e.def}, mDef: ${e.mDef}`);
    enemies.push(e);
    
  } else if (towerEnemies.normal?.length > 0) {
    const count = 1 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) {
      const t = towerEnemies.normal[Math.floor(Math.random() * towerEnemies.normal.length)];
      const e = { ...t };
      e.hp = Math.floor((e.baseHp || 80) * floorScale); 
      e.maxHp = e.hp;
      e.atk = Math.floor((e.baseAtk || 15) * floorScale); 
      e.def = Math.floor((e.baseDef || 6) * floorScale);
      // ============================================================
      // FIX: Scale mDef from baseMDef (fallback to 50% of baseDef)
      // ============================================================
      e.mDef = Math.floor((e.baseMDef || Math.floor((e.baseDef || 6) * 0.5)) * floorScale);
      e.expReward = e.expReward || BALANCE.expBase.normal;
      e.goldReward = e.goldReward || BALANCE.goldBase.normal;
      e.instanceId = `${e.id}_${i}`;
      
      console.log(`[generateEnemies] NORMAL: ${e.name} - def: ${e.def}, mDef: ${e.mDef}`);
      enemies.push(e);
    }
  }
  
  // ============================================================
  // PHASE 9.9.6: FALLBACK - Return skeleton if no enemies generated
  // This prevents "Cannot read properties of undefined (reading 'name')" error
  // ============================================================
  if (enemies.length === 0) {
    console.log('[generateEnemies] WARNING: No enemies generated, using fallback skeleton');
    return [{ 
      id: 'skeleton', 
      name: 'Skeleton', 
      icon: '💀', 
      hp: Math.floor(80 * floorScale), 
      maxHp: Math.floor(80 * floorScale), 
      atk: Math.floor(15 * floorScale), 
      def: Math.floor(6 * floorScale), 
      mDef: Math.floor(3 * floorScale),
      expReward: BALANCE.expBase.normal, 
      goldReward: BALANCE.goldBase.normal,
      instanceId: 'skeleton_0'
    }];
  }
  
  console.log(`[generateEnemies] Returning ${enemies.length} enemies`);
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
    
    // ============================================================
    // PHASE 9.9.7 FIX: Handle towerId and floor query params
    // Client calls: GET /exploration/map?towerId=1&floor=1
    // If no active map exists, create one for the requested tower/floor
    // ============================================================
    const requestedTowerId = parseInt(req.query.towerId) || null;
    const requestedFloor = parseInt(req.query.floor) || null;
    
    let floorMap = await FloorMap.findOne({ characterId: character._id, completed: false });
    
    // If towerId/floor provided and no active map (or different tower/floor), create new map
    if (requestedTowerId && requestedFloor) {
      // Check if we need to create a new map
      const needNewMap = !floorMap || 
                         floorMap.towerId !== requestedTowerId || 
                         floorMap.floor !== requestedFloor;
      
      if (needNewMap) {
        // Validate tower exists
        const tower = TOWERS[requestedTowerId];
        if (!tower) {
          return res.status(400).json({ error: 'Invalid tower' });
        }
        
        // Check energy
        if ((character.energy || 0) < ENERGY_PER_EXPLORATION) {
          return res.status(400).json({ error: `Not enough energy. Need ${ENERGY_PER_EXPLORATION}, have ${character.energy || 0}` });
        }
        
        // Validate floor is unlocked
        const towerKey = `tower_${requestedTowerId}`;
        const highestUnlocked = character.towerProgress?.[towerKey] || 1;
        if (requestedFloor > highestUnlocked) {
          return res.status(400).json({ error: `Floor ${requestedFloor} is locked. Highest unlocked: ${highestUnlocked}` });
        }
        
        // Clear any existing incomplete maps
        await FloorMap.deleteMany({ characterId: character._id, completed: false });
        
        // Generate new floor map
        const mapData = generateFloorMap(character._id, requestedTowerId, requestedFloor);
        floorMap = new FloorMap(mapData);
        await floorMap.save();
        
        // Deduct energy and update character state
        character.energy -= ENERGY_PER_EXPLORATION;
        character.isInTower = true;
        character.currentTowerId = requestedTowerId;
        character.currentFloor = requestedFloor;
        await character.save();
      }
    }
    
    // If still no map, return empty state
    if (!floorMap) {
      return res.json({ map: null, inTower: false, shrineBuffs: [], tower: null, floor: null });
    }
    
    // Get tower data for the response
    const tower = TOWERS[floorMap.towerId];
    
    res.json({ 
      map: floorMap, 
      inTower: true, 
      currentNode: floorMap.nodes.find(n => n.id === floorMap.currentNodeId),
      shrineBuffs: floorMap.shrineBuffs || [],
      tower: tower || { id: floorMap.towerId, name: `Tower ${floorMap.towerId}` },
      floor: floorMap.floor,
      highestFloor: character.towerProgress?.[`tower_${floorMap.towerId}`] || 1,
      energy: character.energy
    });
  } catch (error) {
    console.error('Get map error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/enter', authenticate, async (req, res) => {
  try {
    const { towerId } = req.body;
    const character = await Character.findOne({ userId: req.userId });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    
    // Check energy
    if ((character.energy || 0) < ENERGY_PER_EXPLORATION) {
      return res.status(400).json({ error: `Not enough energy. Need ${ENERGY_PER_EXPLORATION}, have ${character.energy || 0}` });
    }
    
    // Check tower unlock
    // FIX: TOWERS is an object keyed by ID, not an array
    const tower = TOWERS[towerId];
    if (!tower) return res.status(400).json({ error: 'Invalid tower' });
    if (tower.levelReq > character.level) return res.status(400).json({ error: `Need level ${tower.levelReq}` });
    
    // Clear any existing maps
    await FloorMap.deleteMany({ characterId: character._id, completed: false });
    
    // Determine starting floor
    const towerKey = `tower_${towerId}`;
    const unlockedFloor = character.towerProgress?.[towerKey] || 1;
    const startFloor = Math.min(unlockedFloor, tower.floors || 15);
    
    // Generate new floor map
    const mapData = generateFloorMap(character._id, towerId, startFloor);
    const floorMap = new FloorMap(mapData);
    await floorMap.save();
    
    // Deduct energy
    character.energy -= ENERGY_PER_EXPLORATION;
    character.isInTower = true;
    character.currentTowerId = towerId;
    character.currentFloor = startFloor;
    await character.save();
    
    res.json({ 
      success: true, 
      map: floorMap, 
      floor: startFloor,
      energy: character.energy,
      shrineBuffs: []
    });
  } catch (error) {
    console.error('Enter tower error:', error);
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
    
    // ============================================================
    // PHASE 9.9.7 FIX: Current node must be cleared before moving
    // ============================================================
    if (!currentNode.cleared) {
      return res.status(400).json({ error: 'Clear the current node before moving' });
    }
    
    if (!currentNode.connections.includes(nodeId)) {
      return res.status(400).json({ error: 'Cannot move to that node' });
    }
    
    const targetNode = floorMap.nodes.find(n => n.id === nodeId);
    if (!targetNode) return res.status(400).json({ error: 'Invalid node' });
    
    floorMap.currentNodeId = nodeId;
    const nodeIndex = floorMap.nodes.findIndex(n => n.id === nodeId);
    if (nodeIndex >= 0) {
      floorMap.nodes[nodeIndex].visited = true;
      floorMap.markModified('nodes');
    }
    await floorMap.save();
    
    res.json({ 
      success: true, 
      currentNode: targetNode, 
      map: floorMap,
      shrineBuffs: floorMap.shrineBuffs || []
    });
  } catch (error) {
    console.error('Move error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// COMBAT START
// ============================================================
router.post('/combat/start', authenticate, async (req, res) => {
  try {
    const character = await Character.findOne({ userId: req.userId });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    
    const floorMap = await FloorMap.findOne({ characterId: character._id, completed: false });
    if (!floorMap) return res.status(404).json({ error: 'No active map' });
    
    const currentNode = floorMap.nodes.find(n => n.id === floorMap.currentNodeId);
    if (!['combat', 'elite', 'boss'].includes(currentNode.type)) {
      return res.status(400).json({ error: 'Not a combat node' });
    }
    if (currentNode.cleared) {
      return res.status(400).json({ error: 'Node already cleared' });
    }
    
    // ============================================================
    // PHASE 9.9.6: Regenerate enemies if they're empty or don't have mDef
    // ============================================================
    let enemies = currentNode.enemies;
    if (!enemies || enemies.length === 0 || (enemies.length > 0 && enemies[0].mDef === undefined)) {
      console.log('[combat/start] Regenerating enemies (empty or missing mDef)...');
      enemies = generateEnemies(currentNode.type, floorMap.towerId, floorMap.floor);
      currentNode.enemies = enemies;
      floorMap.markModified('nodes');
    }
    
    // Calculate combat stats with shrine buffs
    const fullCombatStats = calculateCombatStats(character, floorMap.shrineBuffs || []);
    
    // Initialize combat state
    floorMap.activeCombat = {
      enemies: enemies.map(e => ({ ...e })),
      currentWave: 1,
      totalWaves: currentNode.waves || 1,
      turnCount: 0,
      combatLog: [`Combat started! Wave 1/${currentNode.waves || 1}`],
      playerBuffs: [],
      playerDots: [],
      enemyDebuffs: [],
      playerShield: 0
    };
    floorMap.markModified('activeCombat');
    await floorMap.save();
    
    // Get usable potions for combat UI
    const usablePotions = character.inventory.filter(item => {
      if (item.type !== 'consumable' || item.quantity <= 0) return false;
      if (item.subType === 'potion') return true;
      if (item.subtype === 'health_potion' || item.subtype === 'mana_potion') return true;
      if (item.effect?.type === 'heal_hp' || item.effect?.type === 'heal_mp') return true;
      if (item.effect?.type === 'heal' || item.effect?.type === 'health') return true;
      if (item.effect?.type === 'mana' || item.effect?.type === 'mp') return true;
      if (item.name?.toLowerCase().includes('health potion')) return true;
      if (item.name?.toLowerCase().includes('mana potion')) return true;
      return false;
    });
    
    res.json({ 
      combat: floorMap.activeCombat, 
      combatStats: fullCombatStats,
      playerBuffs: [],
      shrineBuffs: floorMap.shrineBuffs || [],
      usablePotions,
      character: { hp: character.stats.hp, maxHp: character.stats.maxHp, mp: character.stats.mp, maxMp: character.stats.maxMp, skills: character.skills }
    });
  } catch (error) {
    console.error('Combat start error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// COMBAT ACTION - Main combat logic
// ============================================================
router.post('/combat/action', authenticate, async (req, res) => {
  try {
    const { action, skillId, targetIndex, itemId } = req.body;
    const character = await Character.findOne({ userId: req.userId });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    
    const floorMap = await FloorMap.findOne({ characterId: character._id, completed: false });
    if (!floorMap || !floorMap.activeCombat) return res.status(404).json({ error: 'No active combat' });
    
    const combat = floorMap.activeCombat;
    const currentNode = floorMap.nodes.find(n => n.id === floorMap.currentNodeId);
    const newLogs = [];
    
    // Calculate combat stats with shrine buffs
    const fullCombatStats = calculateCombatStats(character, floorMap.shrineBuffs || []);
    
    // ============================================================
    // PHASE 9.9.5: Debug logging for mDmg
    // ============================================================
    console.log('[combat/action] fullCombatStats:', JSON.stringify({
      pDmg: fullCombatStats.pDmg,
      mDmg: fullCombatStats.mDmg,
      pDef: fullCombatStats.pDef,
      mDef: fullCombatStats.mDef
    }));
    
    // Get target enemy
    const aliveEnemies = combat.enemies.filter(e => e.hp > 0);
    if (aliveEnemies.length === 0) {
      return res.status(400).json({ error: 'No enemies alive' });
    }
    const targetIdx = targetIndex !== undefined ? targetIndex : 0;
    const target = aliveEnemies[Math.min(targetIdx, aliveEnemies.length - 1)];
    
    // ============================================================
    // PHASE 9.9.5: Debug logging for target enemy
    // ============================================================
    console.log('[combat/action] Target enemy:', target.name, 'def:', target.def, 'mDef:', target.mDef);
    
    // ============================================================
    // POTION USE ACTION
    // ============================================================
    if (action === 'useItem' && itemId) {
      const inventoryItem = character.inventory.find(i => i.itemId === itemId);
      if (!inventoryItem || inventoryItem.quantity <= 0) {
        return res.status(400).json({ error: 'Item not found or depleted' });
      }
      
      let effectApplied = false;
      let effectMessage = '';
      
      // Check for health potion
      if (inventoryItem.subtype === 'health_potion' || 
          inventoryItem.effect?.type === 'heal_hp' || 
          inventoryItem.effect?.type === 'heal' ||
          inventoryItem.effect?.type === 'health' ||
          inventoryItem.name?.toLowerCase().includes('health potion')) {
        const healValue = inventoryItem.effect?.value || 100;
        const oldHp = character.stats.hp;
        character.stats.hp = Math.min(character.stats.maxHp, character.stats.hp + healValue);
        const actualHeal = character.stats.hp - oldHp;
        effectMessage = `Used ${inventoryItem.name}: +${actualHeal} HP`;
        effectApplied = true;
      }
      // Check for mana potion
      else if (inventoryItem.subtype === 'mana_potion' || 
               inventoryItem.effect?.type === 'heal_mp' || 
               inventoryItem.effect?.type === 'mana' ||
               inventoryItem.effect?.type === 'mp' ||
               inventoryItem.name?.toLowerCase().includes('mana potion')) {
        const manaValue = inventoryItem.effect?.value || 50;
        const oldMp = character.stats.mp;
        character.stats.mp = Math.min(character.stats.maxMp, character.stats.mp + manaValue);
        const actualMana = character.stats.mp - oldMp;
        effectMessage = `Used ${inventoryItem.name}: +${actualMana} MP`;
        effectApplied = true;
      }
      
      if (!effectApplied) {
        return res.status(400).json({ error: 'Cannot use this item in combat' });
      }
      
      // Deduct item
      inventoryItem.quantity -= 1;
      if (inventoryItem.quantity <= 0) {
        character.inventory = character.inventory.filter(i => i.itemId !== itemId);
      }
      character.markModified('inventory');
      
      newLogs.push({ type: 'buff', message: effectMessage });
      
      // Enemy turn after using item
      for (const enemy of aliveEnemies) {
        if (enemy.hp <= 0) continue;
        
        // Check evasion
        if (Math.random() * 100 < (fullCombatStats.evasion || 0)) {
          newLogs.push({ type: 'miss', message: `Dodged ${enemy.name}'s attack!` });
          continue;
        }
        
        const enemyDamage = Math.max(1, enemy.atk - Math.floor(fullCombatStats.pDef * 0.5));
        character.stats.hp = Math.max(0, character.stats.hp - enemyDamage);
        newLogs.push({ type: 'enemy', message: `${enemy.name} dealt ${enemyDamage} damage!` });
        
        if (character.stats.hp <= 0) {
          newLogs.push({ type: 'defeat', message: 'You have been defeated!' });
          floorMap.activeCombat = null;
          character.isInTower = false;
          floorMap.markModified('activeCombat');
          await character.save();
          await floorMap.save();
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
      }
      
      combat.turnCount++;
      combat.combatLog = [...(combat.combatLog || []), ...newLogs];
      floorMap.markModified('activeCombat');
      
      character.markModified('stats');
      await character.save();
      await floorMap.save();
      
      // Get updated usable potions
      const updatedUsablePotions = character.inventory.filter(item => {
        if (item.type !== 'consumable' || item.quantity <= 0) return false;
        if (item.subType === 'potion') return true;
        if (item.subtype === 'health_potion' || item.subtype === 'mana_potion') return true;
        if (item.effect?.type === 'heal_hp' || item.effect?.type === 'heal_mp') return true;
        if (item.effect?.type === 'heal' || item.effect?.type === 'health') return true;
        if (item.effect?.type === 'mana' || item.effect?.type === 'mp') return true;
        if (item.name?.toLowerCase().includes('health potion')) return true;
        if (item.name?.toLowerCase().includes('mana potion')) return true;
        return false;
      });
      
      return res.json({ 
        status: 'ongoing', 
        combat: floorMap.activeCombat, 
        playerBuffs: combat.playerBuffs || [], 
        shrineBuffs: floorMap.shrineBuffs || [],
        usablePotions: updatedUsablePotions,
        character: { hp: character.stats.hp, maxHp: character.stats.maxHp, mp: character.stats.mp, maxMp: character.stats.maxMp } 
      });
    }
    
    // ============================================================
    // DEFEND ACTION
    // ============================================================
    if (action === 'defend') {
      // Add or refresh defend buff
      const existingDefend = combat.playerBuffs?.find(b => b.type === 'defend');
      if (existingDefend) {
        existingDefend.duration = 2;
        existingDefend.value = 50;
      } else {
        if (!combat.playerBuffs) combat.playerBuffs = [];
        combat.playerBuffs.push({ type: 'defend', value: 50, duration: 2 });
      }
      newLogs.push({ type: 'buff', message: 'You take a defensive stance! (+50% DEF for 2 turns)' });
      
      // Enemy turn
      for (const enemy of aliveEnemies) {
        if (enemy.hp <= 0) continue;
        
        // Check evasion
        if (Math.random() * 100 < (fullCombatStats.evasion || 0)) {
          newLogs.push({ type: 'miss', message: `Dodged ${enemy.name}'s attack!` });
          continue;
        }
        
        // Apply defend buff to defense
        const defendBuff = combat.playerBuffs?.find(b => b.type === 'defend');
        const effectiveDef = defendBuff ? fullCombatStats.pDef * (1 + defendBuff.value / 100) : fullCombatStats.pDef;
        
        const enemyDamage = Math.max(1, enemy.atk - Math.floor(effectiveDef * 0.5));
        character.stats.hp = Math.max(0, character.stats.hp - enemyDamage);
        newLogs.push({ type: 'enemy', message: `${enemy.name} dealt ${enemyDamage} damage!` });
        
        if (character.stats.hp <= 0) {
          newLogs.push({ type: 'defeat', message: 'You have been defeated!' });
          floorMap.activeCombat = null;
          character.isInTower = false;
          floorMap.markModified('activeCombat');
          await character.save();
          await floorMap.save();
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
      }
      
      // Tick down buff durations
      if (combat.playerBuffs) {
        combat.playerBuffs = combat.playerBuffs.map(b => ({ ...b, duration: b.duration - 1 })).filter(b => b.duration > 0);
      }
      
      combat.turnCount++;
      combat.combatLog = [...(combat.combatLog || []), ...newLogs];
      floorMap.markModified('activeCombat');
      
      character.markModified('stats');
      await character.save();
      await floorMap.save();
      
      const usablePotions = character.inventory.filter(item => {
        if (item.type !== 'consumable' || item.quantity <= 0) return false;
        if (item.subType === 'potion') return true;
        if (item.subtype === 'health_potion' || item.subtype === 'mana_potion') return true;
        if (item.effect?.type === 'heal_hp' || item.effect?.type === 'heal_mp') return true;
        if (item.effect?.type === 'heal' || item.effect?.type === 'health') return true;
        if (item.effect?.type === 'mana' || item.effect?.type === 'mp') return true;
        if (item.name?.toLowerCase().includes('health potion')) return true;
        if (item.name?.toLowerCase().includes('mana potion')) return true;
        return false;
      });
      
      return res.json({ 
        status: 'ongoing', 
        combat: floorMap.activeCombat, 
        playerBuffs: combat.playerBuffs || [], 
        shrineBuffs: floorMap.shrineBuffs || [],
        usablePotions,
        character: { hp: character.stats.hp, maxHp: character.stats.maxHp, mp: character.stats.mp, maxMp: character.stats.maxMp } 
      });
    }
    
    // ============================================================
    // ATTACK / SKILL ACTION
    // ============================================================
    let playerDamage = 0;
    let damageType = 'physical';
    let isCrit = false;
    let skillUsed = null;
    
    if (action === 'skill' && skillId) {
      // Get skill from database
      skillUsed = getSkill(skillId);
      if (!skillUsed) {
        return res.status(400).json({ error: 'Skill not found' });
      }
      
      // Check MP cost
      if (character.stats.mp < skillUsed.mpCost) {
        return res.status(400).json({ error: 'Not enough MP' });
      }
      
      // Deduct MP
      character.stats.mp -= skillUsed.mpCost;
      
      // Calculate skill damage using combat engine
      const skillResult = calculateSkillDamage(skillUsed, fullCombatStats, target, combat.playerBuffs || []);
      playerDamage = skillResult.damage;
      isCrit = skillResult.isCrit;
      damageType = skillUsed.damageType || 'physical';
      
      // Process skill effects (buffs, debuffs, heals, etc.)
      const effectResult = processSkillEffects(skillUsed, character, combat, fullCombatStats);
      if (effectResult.logs) {
        newLogs.push(...effectResult.logs);
      }
      if (effectResult.healAmount) {
        character.stats.hp = Math.min(character.stats.maxHp, character.stats.hp + effectResult.healAmount);
      }
      
      // Format skill message
      const skillMsg = formatSkillMessage(skillUsed, playerDamage, isCrit, target.name);
      newLogs.push({ type: isCrit ? 'crit' : 'skill', message: skillMsg });
      
    } else {
      // Basic attack
      const baseDamage = fullCombatStats.pDmg;
      const defense = target.def || 0;
      
      // Crit check
      if (Math.random() * 100 < fullCombatStats.critRate) {
        isCrit = true;
        playerDamage = Math.floor((baseDamage - defense * 0.5) * (fullCombatStats.critDmg / 100));
      } else {
        playerDamage = Math.max(1, baseDamage - Math.floor(defense * 0.5));
      }
      
      newLogs.push({ 
        type: isCrit ? 'crit' : 'player', 
        message: isCrit ? `CRITICAL HIT! You dealt ${playerDamage} damage to ${target.name}!` : `You dealt ${playerDamage} damage to ${target.name}.` 
      });
    }
    
    // Apply damage to target
    const targetInCombat = combat.enemies.find(e => (e.instanceId || e.id) === (target.instanceId || target.id));
    if (targetInCombat) {
      targetInCombat.hp = Math.max(0, targetInCombat.hp - playerDamage);
      
      if (targetInCombat.hp <= 0) {
        newLogs.push({ type: 'victory', message: `${targetInCombat.name} defeated!` });
      }
    }
    
    // Check if all enemies defeated
    const remainingEnemies = combat.enemies.filter(e => e.hp > 0);
    if (remainingEnemies.length === 0) {
      // Victory!
      newLogs.push({ type: 'victory', message: '🎉 Victory!' });
      
      // Calculate rewards with VIP bonuses
      let totalExp = 0;
      let totalGold = 0;
      
      combat.enemies.forEach(enemy => {
        totalExp += enemy.expReward || BALANCE.expBase.normal;
        const goldReward = enemy.goldReward || BALANCE.goldBase.normal;
        totalGold += typeof goldReward === 'object' 
          ? Math.floor(goldReward.min + Math.random() * (goldReward.max - goldReward.min))
          : goldReward;
      });
      
      // Apply VIP bonuses
      if (fullCombatStats.expBonus) {
        const bonusExp = Math.floor(totalExp * fullCombatStats.expBonus / 100);
        totalExp += bonusExp;
        if (bonusExp > 0) newLogs.push({ type: 'buff', message: `+${bonusExp} bonus EXP from VIP!` });
      }
      if (fullCombatStats.goldBonus) {
        const bonusGold = Math.floor(totalGold * fullCombatStats.goldBonus / 100);
        totalGold += bonusGold;
        if (bonusGold > 0) newLogs.push({ type: 'buff', message: `+${bonusGold} bonus Gold from VIP!` });
      }
      
      // Apply floor/tower scaling
      totalExp = Math.floor(totalExp * (1 + floorMap.floor * BALANCE.floorExpBonus) * (1 + (floorMap.towerId - 1) * BALANCE.towerExpBonus));
      
      // Award rewards
      character.experience += totalExp;
      character.gold += totalGold;
      
      // Check level up
      let leveledUp = false;
      while (character.experience >= character.experienceToNextLevel) {
        character.experience -= character.experienceToNextLevel;
        character.level += 1;
        character.experienceToNextLevel = Math.floor(BALANCE.expCurveBase * Math.pow(BALANCE.expCurveMultiplier, character.level - 1));
        
        // Stat gains on level up
        character.stats.maxHp += 10;
        character.stats.maxMp += 5;
        character.stats.hp = character.stats.maxHp;
        character.stats.mp = character.stats.maxMp;
        
        leveledUp = true;
        newLogs.push({ type: 'victory', message: `⬆️ Level Up! Now level ${character.level}!` });
      }
      
      // Generate loot
      const { drops, goldAmount } = generateLootDrops(currentNode.type, floorMap.towerId, floorMap.floor, character.level, character.class);
      const addedItems = addItemsToInventory(character, drops);
      
      // Mark node as cleared
      const nodeIdx = floorMap.nodes.findIndex(n => n.id === floorMap.currentNodeId);
      if (nodeIdx >= 0) {
        floorMap.nodes[nodeIdx].cleared = true;
        floorMap.markModified('nodes');
      }
      
      // Check if floor complete (exit node cleared)
      let floorComplete = false;
      if (currentNode.isExit) {
        character.currentFloor += 1;
        character.statistics = character.statistics || {};
        character.statistics.floorsCleared = (character.statistics.floorsCleared || 0) + 1;
        
        // Update tower progress
        if (!character.towerProgress) character.towerProgress = {};
        const towerKey = `tower_${floorMap.towerId}`;
        if (!character.towerProgress[towerKey] || character.currentFloor > character.towerProgress[towerKey]) {
          character.towerProgress[towerKey] = character.currentFloor;
          character.markModified('towerProgress');
        }
        
        floorMap.completed = true;
        character.isInTower = false;
        floorComplete = true;
        
        // Clear shrine buffs
        floorMap.shrineBuffs = [];
        floorMap.markModified('shrineBuffs');
      }
      
      floorMap.activeCombat = null;
      floorMap.markModified('activeCombat');
      
      character.markModified('stats');
      character.markModified('inventory');
      await character.save();
      await floorMap.save();
      
      return res.json({
        status: 'victory',
        combatLog: [...(combat.combatLog || []), ...newLogs],
        rewards: { exp: totalExp, gold: totalGold, items: addedItems },
        floorComplete,
        leveledUp,
        character: {
          hp: character.stats.hp,
          maxHp: character.stats.maxHp,
          mp: character.stats.mp,
          maxMp: character.stats.maxMp,
          gold: character.gold,
          level: character.level,
          experience: character.experience,
          experienceToNextLevel: character.experienceToNextLevel
        }
      });
    }
    
    // Enemy turn
    for (const enemy of remainingEnemies) {
      if (enemy.hp <= 0) continue;
      
      // Check evasion
      if (Math.random() * 100 < (fullCombatStats.evasion || 0)) {
        newLogs.push({ type: 'miss', message: `Dodged ${enemy.name}'s attack!` });
        continue;
      }
      
      // Apply defend buff to defense
      const defendBuff = combat.playerBuffs?.find(b => b.type === 'defend');
      const effectiveDef = defendBuff ? fullCombatStats.pDef * (1 + defendBuff.value / 100) : fullCombatStats.pDef;
      
      const enemyDamage = Math.max(1, enemy.atk - Math.floor(effectiveDef * 0.5));
      character.stats.hp = Math.max(0, character.stats.hp - enemyDamage);
      newLogs.push({ type: 'enemy', message: `${enemy.name} dealt ${enemyDamage} damage!` });
      
      if (character.stats.hp <= 0) {
        newLogs.push({ type: 'defeat', message: 'You have been defeated!' });
        floorMap.activeCombat = null;
        character.isInTower = false;
        floorMap.markModified('activeCombat');
        await character.save();
        await floorMap.save();
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
    }
    
    // Tick down buff durations
    if (combat.playerBuffs) {
      combat.playerBuffs = combat.playerBuffs.map(b => ({ ...b, duration: b.duration - 1 })).filter(b => b.duration > 0);
    }
    
    combat.turnCount++;
    combat.combatLog = [...(combat.combatLog || []), ...newLogs];
    floorMap.markModified('activeCombat');
    
    // Mark stats as modified to ensure HP/MP changes are saved
    character.markModified('stats');
    await character.save();
    await floorMap.save();
    
    // Get updated usable potions (flexible check matching consumables.js)
    const usablePotions = character.inventory.filter(item => {
      if (item.type !== 'consumable' || item.quantity <= 0) return false;
      if (item.subType === 'potion') return true;
      if (item.subtype === 'health_potion' || item.subtype === 'mana_potion') return true;
      if (item.effect?.type === 'heal_hp' || item.effect?.type === 'heal_mp') return true;
      if (item.effect?.type === 'heal' || item.effect?.type === 'health') return true;
      if (item.effect?.type === 'mana' || item.effect?.type === 'mp') return true;
      if (item.name?.toLowerCase().includes('health potion')) return true;
      if (item.name?.toLowerCase().includes('mana potion')) return true;
      return false;
    });
    
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
