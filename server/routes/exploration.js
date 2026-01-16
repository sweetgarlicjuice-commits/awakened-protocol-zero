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

const router = express.Router();
const ENERGY_PER_EXPLORATION = 5;

// ============================================================
// SLOT MAPPING - Map character equipment slots to equipment DB slots
// Character uses: head, body, leg, shoes, leftHand, rightHand, ring, necklace
// Equipment DB uses: head, body, hands, feet, mainHand, ring, necklace, cape
// ============================================================
const SLOT_MAPPING = {
  head: 'head',
  body: 'body',
  leg: 'hands',      // Character 'leg' -> equipment 'hands' (gloves/bracers)
  shoes: 'feet',     // Character 'shoes' -> equipment 'feet' (boots)
  leftHand: 'cape',  // Character 'leftHand' -> equipment 'cape' (cloaks)
  rightHand: 'mainHand', // Character 'rightHand' -> equipment 'mainHand' (weapon)
  ring: 'ring',
  necklace: 'necklace'
};

// Reverse mapping for when adding equipment to inventory
const REVERSE_SLOT_MAPPING = {
  head: 'head',
  body: 'body',
  hands: 'leg',
  feet: 'shoes',
  cape: 'leftHand',
  mainHand: 'rightHand',
  ring: 'ring',
  necklace: 'necklace'
};

// ============================================================
// SKILL DATABASE - Clear descriptions with PDmg/MDmg labels
// ============================================================
const SKILLS = {
  // ===== SWORDSMAN =====
  slash: { 
    name: 'Slash', mpCost: 12, damage: 1.3, damageType: 'physical', target: 'single',
    desc: 'Quick slash', dmgText: '130% PDmg'
  },
  heavyStrike: { 
    name: 'Heavy Strike', mpCost: 25, damage: 2.0, damageType: 'physical', target: 'single',
    desc: 'Heavy blow', dmgText: '200% PDmg'
  },
  shieldBash: { 
    name: 'Shield Bash', mpCost: 18, damage: 1.2, damageType: 'physical', target: 'single',
    desc: 'Bash with shield', dmgText: '120% PDmg'
  },
  warCry: { 
    name: 'War Cry', mpCost: 30, damage: 0, damageType: 'buff', target: 'self',
    buff: { type: 'attack', value: 30, duration: 3 },
    desc: 'Battle shout', dmgText: '+30% ATK, 3 turns'
  },
  whirlwind: { 
    name: 'Whirlwind', mpCost: 35, damage: 0.8, damageType: 'physical', target: 'all',
    desc: 'Spin attack, all enemies', dmgText: '80% PDmg each'
  },
  
  // ===== ASSASSIN =====
  backstab: { 
    name: 'Backstab', mpCost: 18, damage: 2.2, damageType: 'physical', target: 'single',
    desc: 'Strike from behind', dmgText: '220% PDmg'
  },
  poisonBlade: { 
    name: 'Poison Blade', mpCost: 22, damage: 1.5, damageType: 'physical', target: 'single',
    desc: 'Poisoned strike', dmgText: '150% PDmg'
  },
  smokeScreen: { 
    name: 'Smoke Screen', mpCost: 28, damage: 0, damageType: 'buff', target: 'self',
    buff: { type: 'evasion', value: 50, duration: 2 },
    desc: 'Evasion boost', dmgText: '+50% Evasion, 2 turns'
  },
  fanOfKnives: { 
    name: 'Fan of Knives', mpCost: 32, damage: 0.7, damageType: 'physical', target: 'all',
    desc: 'Throw knives, all enemies', dmgText: '70% PDmg each'
  },
  
  // ===== ARCHER =====
  preciseShot: { 
    name: 'Precise Shot', mpCost: 15, damage: 1.6, damageType: 'physical', target: 'single',
    desc: 'Aimed shot, single target', dmgText: '160% PDmg'
  },
  multiShot: { 
    name: 'Multi Shot', mpCost: 30, damage: 0.6, damageType: 'physical', target: 'all',
    desc: '3 arrows, all enemies', dmgText: '60% PDmg each'
  },
  eagleEye: { 
    name: 'Eagle Eye', mpCost: 25, damage: 0, damageType: 'buff', target: 'self',
    buff: { type: 'critRate', value: 25, duration: 3 },
    desc: 'Focus aim', dmgText: '+25% Crit, 3 turns'
  },
  arrowRain: { 
    name: 'Arrow Rain', mpCost: 40, damage: 1.0, damageType: 'physical', target: 'all',
    desc: 'Rain of arrows, all enemies', dmgText: '100% PDmg each'
  },
  
  // ===== MAGE =====
  fireball: { 
    name: 'Fireball', mpCost: 20, damage: 1.8, damageType: 'magical', target: 'single',
    desc: 'Fire blast, single target', dmgText: '180% MDmg'
  },
  iceSpear: { 
    name: 'Ice Spear', mpCost: 25, damage: 1.5, damageType: 'magical', target: 'single',
    desc: 'Ice pierce, single target', dmgText: '150% MDmg'
  },
  manaShield: { 
    name: 'Mana Shield', mpCost: 35, damage: 0, damageType: 'buff', target: 'self',
    buff: { type: 'shield', value: 40, duration: 3 },
    desc: 'Magical barrier', dmgText: '-40% Damage taken, 3 turns'
  },
  thunderbolt: { 
    name: 'Thunderbolt', mpCost: 30, damage: 2.2, damageType: 'magical', target: 'single',
    desc: 'Lightning strike, single target', dmgText: '220% MDmg'
  },
  blizzard: { 
    name: 'Blizzard', mpCost: 45, damage: 1.0, damageType: 'magical', target: 'all',
    desc: 'Ice storm, all enemies', dmgText: '100% MDmg each'
  },
  meteor: { 
    name: 'Meteor', mpCost: 55, damage: 1.4, damageType: 'magical', target: 'all',
    desc: 'Meteor strike, all enemies', dmgText: '140% MDmg each'
  }
};

const getSkill = (skillId) => SKILLS[skillId] || { name: 'Attack', mpCost: 0, damage: 1.0, damageType: 'physical', target: 'single', desc: 'Basic attack', dmgText: '100% PDmg' };

// ============================================================
// HELPER: Get equipped item IDs from character equipment
// ============================================================
function getEquippedItemIds(character) {
  const itemIds = [];
  if (!character.equipment) return itemIds;
  
  const slots = ['head', 'body', 'leg', 'shoes', 'leftHand', 'rightHand', 'ring', 'necklace'];
  slots.forEach(slot => {
    if (character.equipment[slot]?.itemId) {
      itemIds.push(character.equipment[slot].itemId);
    }
  });
  
  return itemIds;
}

// ============================================================
// HELPER: Get equipment stats directly from character's equipped items
// This handles both DB items and dynamically generated items
// ============================================================
function getEquipmentStatsFromCharacter(character) {
  const stats = {
    pAtk: 0, mAtk: 0, pDef: 0, mDef: 0,
    hp: 0, mp: 0,
    str: 0, agi: 0, dex: 0, int: 0, vit: 0,
    critRate: 0, critDmg: 0
  };
  
  if (!character.equipment) return stats;
  
  const slots = ['head', 'body', 'leg', 'shoes', 'leftHand', 'rightHand', 'ring', 'necklace'];
  
  slots.forEach(slot => {
    const equippedItem = character.equipment[slot];
    if (equippedItem && equippedItem.stats) {
      // Add stats from the equipped item directly
      Object.keys(equippedItem.stats).forEach(statKey => {
        if (stats.hasOwnProperty(statKey)) {
          stats[statKey] += equippedItem.stats[statKey] || 0;
        }
      });
    }
  });
  
  return stats;
}

// ============================================================
// HELPER: Calculate total combat stats (base + equipment + set bonuses)
// ============================================================
function calculateCombatStats(character) {
  const stats = character.stats;
  const level = character.level || 1;
  
  // Get equipment bonuses - try DB lookup first, fallback to direct stats
  const equippedIds = getEquippedItemIds(character);
  
  // First try to get stats from equipment database (for set bonus support)
  let equipBonus = { pAtk: 0, mAtk: 0, pDef: 0, mDef: 0, hp: 0, mp: 0, str: 0, agi: 0, dex: 0, int: 0, vit: 0, critRate: 0, critDmg: 0 };
  
  try {
    equipBonus = calculateEquipmentStats(equippedIds);
  } catch (err) {
    console.log('[Combat] Equipment DB lookup failed, using direct stats');
  }
  
  // If DB lookup returned nothing, get stats directly from equipped items
  const directStats = getEquipmentStatsFromCharacter(character);
  
  // Use whichever has more stats (combine if needed)
  const totalEquipBonus = {
    pAtk: Math.max(equipBonus.pAtk || 0, directStats.pAtk || 0),
    mAtk: Math.max(equipBonus.mAtk || 0, directStats.mAtk || 0),
    pDef: Math.max(equipBonus.pDef || 0, directStats.pDef || 0),
    mDef: Math.max(equipBonus.mDef || 0, directStats.mDef || 0),
    hp: Math.max(equipBonus.hp || 0, directStats.hp || 0),
    mp: Math.max(equipBonus.mp || 0, directStats.mp || 0),
    str: Math.max(equipBonus.str || 0, directStats.str || 0),
    agi: Math.max(equipBonus.agi || 0, directStats.agi || 0),
    dex: Math.max(equipBonus.dex || 0, directStats.dex || 0),
    int: Math.max(equipBonus.int || 0, directStats.int || 0),
    vit: Math.max(equipBonus.vit || 0, directStats.vit || 0),
    critRate: Math.max(equipBonus.critRate || 0, directStats.critRate || 0),
    critDmg: Math.max(equipBonus.critDmg || 0, directStats.critDmg || 0)
  };
  
  // Get active set bonuses for display
  let setBonus = {};
  try {
    setBonus = calculateSetBonuses(equippedIds);
  } catch (err) {
    console.log('[Combat] Set bonus calculation failed');
  }
  
  // Base stats + equipment bonuses
  const totalStr = (stats.str || 0) + (totalEquipBonus.str || 0);
  const totalAgi = (stats.agi || 0) + (totalEquipBonus.agi || 0);
  const totalDex = (stats.dex || 0) + (totalEquipBonus.dex || 0);
  const totalInt = (stats.int || 0) + (totalEquipBonus.int || 0);
  const totalVit = (stats.vit || 0) + (totalEquipBonus.vit || 0);
  
  // Level bonus (+2% per level)
  const levelBonus = 1 + (level - 1) * 0.02;
  
  return {
    // Physical damage: base formula + equipment pAtk
    pDmg: Math.floor((5 + totalStr * 3 + (totalEquipBonus.pAtk || 0)) * levelBonus),
    // Magical damage: base formula + equipment mAtk
    mDmg: Math.floor((5 + totalInt * 4 + (totalEquipBonus.mAtk || 0)) * levelBonus),
    // Physical defense: base formula + equipment pDef
    pDef: totalStr + totalVit * 2 + (totalEquipBonus.pDef || 0),
    // Magical defense: base formula + equipment mDef
    mDef: totalVit + totalInt + (totalEquipBonus.mDef || 0),
    // Crit rate: base + equipment (capped at 80%)
    critRate: Math.min(5 + totalAgi * 0.5 + (totalEquipBonus.critRate || 0), 80),
    // Crit damage: base + equipment
    critDmg: 150 + totalDex + (totalEquipBonus.critDmg || 0),
    // HP/MP bonuses from equipment
    bonusHp: totalEquipBonus.hp || 0,
    bonusMp: totalEquipBonus.mp || 0,
    // Set bonuses info (for UI display)
    activeSets: setBonus,
    // Debug info
    equipmentBonus: totalEquipBonus
  };
}

// ============================================================
// DROP SYSTEM - Drop rates by node type
// ============================================================
const DROP_RATES = {
  combat: {
    equipment: 0.07,    // 7%
    material: 0.18,     // 18%
    potion: 0.20,       // 20%
    gold: { min: 5, max: 15 }
  },
  elite: {
    equipment: 0.15,    // 15%
    material: 0.30,     // 30%
    potion: 0.20,       // 20%
    gold: { min: 15, max: 40 }
  },
  boss: {
    equipment: 0.25,    // 25%
    hiddenScroll: 0.06, // 6%
    memoryCrystalFragment: 0.10, // 10%
    material: 0.50,     // 50%
    potion: 0.20,       // 20%
    gold: { min: 50, max: 150 }
  }
};

// ============================================================
// HELPER: Generate loot drops after combat victory
// ============================================================
function generateLootDrops(nodeType, towerId, floor, playerLevel, playerClass) {
  const drops = [];
  const rates = DROP_RATES[nodeType] || DROP_RATES.combat;
  
  // Gold drop (always)
  const goldAmount = Math.floor(
    rates.gold.min + Math.random() * (rates.gold.max - rates.gold.min) + floor * 2
  );
  
  // Equipment drop
  if (Math.random() < rates.equipment) {
    const equipment = getRandomEquipment(towerId, floor, playerLevel, playerClass);
    if (equipment) {
      // Map equipment slot to character slot
      const characterSlot = REVERSE_SLOT_MAPPING[equipment.slot] || equipment.slot;
      
      drops.push({
        type: 'equipment',
        item: {
          itemId: equipment.id,
          name: equipment.name,
          icon: equipment.icon,
          type: equipment.type,
          subtype: equipment.slot,
          slot: equipment.slot,           // Original slot from equipment DB
          characterSlot: characterSlot,   // Mapped slot for character equipment
          rarity: equipment.rarity,
          quantity: 1,
          stackable: false,
          stats: equipment.stats,
          sellPrice: equipment.sellPrice || 50,
          levelReq: equipment.levelReq,
          class: equipment.class,
          setId: equipment.setId          // For set bonus tracking
        }
      });
    }
  }
  
  // Material drop
  if (Math.random() < rates.material) {
    const materials = getMaterialsByTower(towerId);
    if (materials && materials.length > 0) {
      const mat = materials[Math.floor(Math.random() * materials.length)];
      drops.push({
        type: 'material',
        item: {
          itemId: mat.id,
          name: mat.name,
          icon: mat.icon || '🧱',
          type: 'material',
          rarity: mat.rarity || 'common',
          quantity: Math.floor(1 + Math.random() * 3),
          stackable: true,
          sellPrice: mat.sellPrice || 10
        }
      });
    }
  }
  
  // Potion drop
  if (Math.random() < rates.potion) {
    // CONSUMABLES might be array or object - handle both
    const potionPool = [];
    
    if (Array.isArray(CONSUMABLES)) {
      // If array, filter for potions
      potionPool.push(...CONSUMABLES.filter(c => 
        c.subtype === 'health_potion' || c.subtype === 'mana_potion'
      ));
    } else if (typeof CONSUMABLES === 'object') {
      // If object, get values and filter
      potionPool.push(...Object.values(CONSUMABLES).filter(c => 
        c && (c.subtype === 'health_potion' || c.subtype === 'mana_potion')
      ));
    }
    
    // Fallback potions if CONSUMABLES not loaded properly
    if (potionPool.length === 0) {
      potionPool.push(
        { id: 'small_health_potion', name: 'Small Health Potion', icon: '🧪', subtype: 'health_potion', rarity: 'common', sellPrice: 25, effect: { type: 'heal', value: 100 } },
        { id: 'small_mana_potion', name: 'Small Mana Potion', icon: '💙', subtype: 'mana_potion', rarity: 'common', sellPrice: 20, effect: { type: 'mana', value: 50 } }
      );
    }
    
    const potion = potionPool[Math.floor(Math.random() * potionPool.length)];
    if (potion) {
      drops.push({
        type: 'consumable',
        item: {
          itemId: potion.id,
          name: potion.name,
          icon: potion.icon || '🧪',
          type: 'consumable',
          subtype: potion.subtype,
          rarity: potion.rarity || 'common',
          quantity: 1,
          stackable: true,
          sellPrice: potion.sellPrice || 25,
          effect: potion.effect
        }
      });
    }
  }
  
  // Boss-only drops
  if (nodeType === 'boss') {
    // Hidden Class Scroll (6% - very rare!)
    if (Math.random() < rates.hiddenScroll) {
      // Get scrolls that can drop from this tower
      const availableScrolls = Object.values(HIDDEN_CLASS_SCROLLS).filter(
        s => s.dropTowers.includes(towerId)
      );
      if (availableScrolls.length > 0) {
        const scroll = availableScrolls[Math.floor(Math.random() * availableScrolls.length)];
        drops.push({
          type: 'hidden_class_scroll',
          item: {
            itemId: scroll.id,
            name: scroll.name,
            icon: scroll.icon,
            type: 'hidden_class_scroll',
            rarity: 'legendary',
            quantity: 1,
            stackable: false,
            sellPrice: null, // Cannot sell
            hiddenClass: scroll.hiddenClass,
            baseClass: scroll.baseClass
          }
        });
      }
    }
    
    // Memory Crystal Fragment (10%)
    if (Math.random() < rates.memoryCrystalFragment) {
      drops.push({
        type: 'material',
        item: {
          itemId: 'memory_crystal_fragment',
          name: MEMORY_CRYSTAL_FRAGMENT.name,
          icon: MEMORY_CRYSTAL_FRAGMENT.icon,
          type: 'material',
          rarity: MEMORY_CRYSTAL_FRAGMENT.rarity,
          quantity: 1,
          stackable: true,
          sellPrice: MEMORY_CRYSTAL_FRAGMENT.sellPrice
        }
      });
    }
  }
  
  return { drops, goldAmount };
}

// ============================================================
// HELPER: Add items to character inventory
// ============================================================
function addItemsToInventory(character, drops) {
  const addedItems = [];
  
  drops.forEach(drop => {
    const item = drop.item;
    
    // Check if stackable item already exists in inventory
    if (item.stackable) {
      const existing = character.inventory.find(i => i.itemId === item.itemId);
      if (existing) {
        existing.quantity += item.quantity;
        addedItems.push({ ...item, action: 'stacked' });
        return;
      }
    }
    
    // Check inventory space
    if (character.inventory.length >= character.inventorySize) {
      addedItems.push({ ...item, action: 'inventory_full' });
      return;
    }
    
    // Add new item
    character.inventory.push(item);
    addedItems.push({ ...item, action: 'added' });
  });
  
  return addedItems;
}

router.get('/skills', authenticate, (req, res) => res.json({ skills: SKILLS }));

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
        isExit: row === rows - 1
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
  
  for (let row = 0; row < rows - 1; row++) {
    nodeGrid[row].forEach((node, colIndex) => {
      const nextRow = nodeGrid[row + 1];
      const connectCount = Math.min(nextRow.length, Math.random() < 0.5 ? 1 : 2);
      const sorted = nextRow.map((n, i) => ({ node: n, dist: Math.abs(i - colIndex) })).sort((a, b) => a.dist - b.dist);
      for (let i = 0; i < connectCount && i < sorted.length; i++) node.connections.push(sorted[i].node.id);
    });
  }
  
  for (let row = 1; row < rows; row++) {
    nodeGrid[row].forEach(node => {
      if (!nodeGrid[row - 1].some(prev => prev.connections.includes(node.id))) {
        nodeGrid[row - 1][Math.floor(Math.random() * nodeGrid[row - 1].length)].connections.push(node.id);
      }
    });
  }
  
  return { characterId, towerId, floor, nodes, currentNodeId: nodes[0].id, startNodeId: nodes[0].id, bossNodeId: nodes[nodes.length - 1].id };
}

function generateEnemies(type, towerId, floor) {
  const enemies = [];
  const towerEnemies = ENEMIES[`tower${towerId}`] || ENEMIES.tower1;
  
  if (!towerEnemies) {
    return [{ id: 'skeleton', name: 'Skeleton', icon: '💀', hp: 80, maxHp: 80, atk: 15, def: 6, expReward: 2, goldReward: { min: 2, max: 5 } }];
  }
  
  const floorScale = 1 + (floor - 1) * 0.15;
  
  if (type === 'boss' && towerEnemies.boss) {
    const b = { ...towerEnemies.boss };
    b.hp = Math.floor((b.baseHp || 800) * floorScale); b.maxHp = b.hp;
    b.atk = Math.floor((b.baseAtk || 50) * floorScale);
    b.def = Math.floor((b.baseDef || 20) * floorScale);
    b.expReward = Math.floor(10 + floor);
    enemies.push(b);
  } else if (type === 'elite' && towerEnemies.elite?.length > 0) {
    const e = { ...towerEnemies.elite[Math.floor(Math.random() * towerEnemies.elite.length)] };
    e.hp = Math.floor((e.baseHp || 300) * floorScale); e.maxHp = e.hp;
    e.atk = Math.floor((e.baseAtk || 30) * floorScale);
    e.def = Math.floor((e.baseDef || 12) * floorScale);
    e.expReward = Math.floor(5 + floor * 0.5);
    enemies.push(e);
  } else if (towerEnemies.normal?.length > 0) {
    const count = 1 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) {
      const t = towerEnemies.normal[Math.floor(Math.random() * towerEnemies.normal.length)];
      const e = { ...t };
      e.hp = Math.floor((e.baseHp || 80) * floorScale); e.maxHp = e.hp;
      e.atk = Math.floor((e.baseAtk || 15) * floorScale);
      e.def = Math.floor((e.baseDef || 6) * floorScale);
      e.expReward = Math.floor(1 + floor * 0.3);
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
    let floor = parseInt(req.query.floor) || character.currentFloor || 1;
    
    // Get highest floor reached for this tower
    const towerKey = `tower_${towerId}`;
    const highestFloor = character.towerProgress?.[towerKey] || 1;
    
    // Validate floor selection - can only select floors up to highest reached
    if (floor > highestFloor) {
      floor = highestFloor;
    }
    if (floor < 1) floor = 1;
    
    let floorMap = await FloorMap.findOne({ characterId: character._id, towerId, floor, completed: false });
    
    if (!floorMap) {
      floorMap = new FloorMap(generateFloorMap(character._id, towerId, floor));
      await floorMap.save();
    }
    
    // Update character's current floor to selected floor
    character.currentFloor = floor;
    character.isInTower = true;
    await character.save();
    
    const tower = TOWERS[towerId] || { id: towerId, name: `Tower ${towerId}` };
    res.json({ 
      map: floorMap, 
      tower, 
      floor,
      highestFloor,
      character: { hp: character.stats.hp, maxHp: character.stats.maxHp, mp: character.stats.mp, maxMp: character.stats.maxMp, energy: character.energy } 
    });
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
    if (!currentNode) return res.status(400).json({ error: 'No current node' });
    if (!['combat', 'elite', 'boss'].includes(currentNode.type)) return res.status(400).json({ error: 'Not combat node' });
    if (currentNode.cleared) return res.status(400).json({ error: 'Already cleared' });
    
    // Ensure enemies array exists and has enemies
    let enemyList = currentNode.enemies || [];
    if (enemyList.length === 0) {
      // Generate enemies if missing
      enemyList = generateEnemies(currentNode.type, floorMap.towerId, floorMap.floor);
    }
    
    // Ensure enemies have all required fields
    const enemies = enemyList.map((e, i) => ({
      id: e.id || `enemy_${i}`,
      instanceId: e.instanceId || `${e.id || 'enemy'}_${i}`,
      name: e.name || 'Enemy',
      icon: e.icon || '👹',
      hp: e.hp || e.maxHp || 50,
      maxHp: e.maxHp || e.hp || 50,
      atk: e.atk || 10,
      def: e.def || 5,
      expReward: e.expReward || 2,
      goldReward: e.goldReward || { min: 2, max: 5 },
      isElite: e.isElite || false,
      isBoss: e.isBoss || false
    }));
    
    floorMap.activeCombat = {
      nodeId: currentNode.id,
      wave: 1,
      enemies: enemies,
      turnCount: 0,
      combatLog: [{ actor: 'system', message: `Combat started! Wave 1/${currentNode.waves}`, damage: 0, type: 'info' }],
      playerBuffs: []
    };
    floorMap.markModified('activeCombat');
    await floorMap.save();
    
    // Return skills with full info
    const playerSkills = (character.skills || []).map(s => {
      const skillData = getSkill(s.skillId);
      return { 
        skillId: s.skillId,
        name: skillData.name,
        mpCost: skillData.mpCost,
        damage: skillData.damage,
        damageType: skillData.damageType,
        target: skillData.target,
        desc: skillData.desc,
        dmgText: skillData.dmgText,
        buff: skillData.buff
      };
    });
    
    res.json({ 
      combat: floorMap.activeCombat, 
      waves: currentNode.waves, 
      character: { 
        hp: character.stats.hp, 
        maxHp: character.stats.maxHp, 
        mp: character.stats.mp, 
        maxMp: character.stats.maxMp, 
        skills: playerSkills 
      } 
    });
  } catch (error) {
    console.error('Combat start error:', error);
    res.status(500).json({ error: error.message });
  }
});

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
    
    // Calculate player stats with EQUIPMENT BONUSES + buffs
    const combatStats = calculateCombatStats(character);
    
    let atkBonus = 0, critBonus = 0;
    (combat.playerBuffs || []).forEach(b => {
      if (b.type === 'attack') atkBonus += b.value;
      if (b.type === 'critRate') critBonus += b.value;
    });
    
    // Apply buff bonuses to equipment-enhanced stats
    const pDmg = Math.floor(combatStats.pDmg * (1 + atkBonus / 100));
    const mDmg = Math.floor(combatStats.mDmg * (1 + atkBonus / 100));
    const pDef = combatStats.pDef;
    const mDef = combatStats.mDef;
    const critRate = Math.min(combatStats.critRate + critBonus, 80);
    const critDmg = combatStats.critDmg;
    
    const aliveEnemies = combat.enemies.filter(e => e.hp > 0);
    
    if (action === 'attack') {
      let target = combat.enemies[targetIndex || 0];
      if (!target || target.hp <= 0) target = aliveEnemies[0];
      if (!target) return res.status(400).json({ error: 'No targets' });
      
      const isCrit = Math.random() * 100 < critRate;
      const baseDmg = Math.max(1, pDmg - (target.def || 0) * 0.5);
      const damage = isCrit ? Math.floor(baseDmg * critDmg / 100) : Math.floor(baseDmg);
      target.hp = Math.max(0, target.hp - damage);
      newLogs.push({ actor: 'player', message: `Attack ${target.name} for ${damage} PDmg${isCrit ? ' CRIT!' : ''}`, damage, type: isCrit ? 'crit' : 'damage' });
      
    } else if (action === 'skill' && skillId) {
      const skill = getSkill(skillId);
      if (character.stats.mp < skill.mpCost) return res.status(400).json({ error: 'Not enough MP' });
      character.stats.mp -= skill.mpCost;
      
      if (skill.damageType === 'buff' && skill.buff) {
        // BUFF - no damage
        combat.playerBuffs = combat.playerBuffs || [];
        combat.playerBuffs.push({ type: skill.buff.type, value: skill.buff.value, duration: skill.buff.duration });
        newLogs.push({ actor: 'player', message: `${skill.name}! ${skill.dmgText}`, damage: 0, type: 'buff' });
        
      } else if (skill.target === 'all') {
        // AOE - hit all enemies
        const baseStat = skill.damageType === 'magical' ? mDmg : pDmg;
        const dmgType = skill.damageType === 'magical' ? 'MDmg' : 'PDmg';
        let totalDmg = 0;
        let hitCount = 0;
        aliveEnemies.forEach(enemy => {
          const dmg = Math.max(1, Math.floor(baseStat * skill.damage) - (enemy.def || 0) * 0.3);
          enemy.hp = Math.max(0, enemy.hp - dmg);
          totalDmg += dmg;
          hitCount++;
        });
        newLogs.push({ actor: 'player', message: `${skill.name}! Hit ${hitCount} enemies for ${totalDmg} ${dmgType} total`, damage: totalDmg, type: 'skill' });
        
      } else {
        // Single target
        let target = combat.enemies[targetIndex || 0];
        if (!target || target.hp <= 0) target = aliveEnemies[0];
        if (!target) return res.status(400).json({ error: 'No targets' });
        
        const baseStat = skill.damageType === 'magical' ? mDmg : pDmg;
        const dmgType = skill.damageType === 'magical' ? 'MDmg' : 'PDmg';
        const isCrit = Math.random() * 100 < critRate;
        const skillDmg = Math.floor(baseStat * skill.damage);
        const damage = isCrit ? Math.floor(skillDmg * critDmg / 100) : skillDmg;
        target.hp = Math.max(0, target.hp - damage);
        newLogs.push({ actor: 'player', message: `${skill.name} on ${target.name} for ${damage} ${dmgType}${isCrit ? ' CRIT!' : ''}`, damage, type: 'skill' });
      }
      
    } else if (action === 'defend') {
      combat.playerBuffs = combat.playerBuffs || [];
      combat.playerBuffs.push({ type: 'defend', value: 50, duration: 1 });
      newLogs.push({ actor: 'player', message: 'Defending! -50% Damage taken, 1 turn', damage: 0, type: 'buff' });
    }
    
    // Check victory
    const stillAlive = combat.enemies.filter(e => e.hp > 0);
    
    if (stillAlive.length === 0) {
      const baseExp = combat.enemies.reduce((s, e) => s + (e.expReward || 2), 0);
      const baseGold = combat.enemies.reduce((s, e) => s + Math.floor((e.goldReward?.min || 2) + Math.random() * ((e.goldReward?.max || 5) - (e.goldReward?.min || 2))), 0);
      const mult = currentNode.type === 'boss' ? 2 : currentNode.type === 'elite' ? 1.5 : 1;
      const rewards = { exp: Math.floor(baseExp * mult), gold: Math.floor(baseGold * mult), items: [] };
      
      // Generate loot drops based on node type
      const playerClass = character.hiddenClass !== 'none' 
        ? character.baseClass  // Hidden class uses base class for equipment
        : character.baseClass;
      const loot = generateLootDrops(currentNode.type, floorMap.towerId, floorMap.floor, character.level, playerClass);
      
      // Add extra gold from loot
      rewards.gold += loot.goldAmount;
      
      // Add items to inventory
      if (loot.drops.length > 0) {
        const addedItems = addItemsToInventory(character, loot.drops);
        rewards.items = addedItems;
        character.markModified('inventory');
        
        // Log dropped items
        addedItems.forEach(item => {
          if (item.action === 'added' || item.action === 'stacked') {
            const rarityColors = { common: '', uncommon: '🟢', rare: '🔵', epic: '🟣', legendary: '🟡' };
            const rarityIcon = rarityColors[item.rarity] || '';
            newLogs.push({ 
              actor: 'system', 
              message: `${rarityIcon} Obtained: ${item.icon || '📦'} ${item.name}${item.quantity > 1 ? ` x${item.quantity}` : ''}`, 
              damage: 0, 
              type: 'loot' 
            });
          } else if (item.action === 'inventory_full') {
            newLogs.push({ 
              actor: 'system', 
              message: `⚠️ Inventory full! Lost: ${item.name}`, 
              damage: 0, 
              type: 'warning' 
            });
          }
        });
        
        // Track scroll finds in statistics
        const scrollDrops = addedItems.filter(i => i.type === 'hidden_class_scroll');
        if (scrollDrops.length > 0) {
          character.statistics.scrollsFound = (character.statistics.scrollsFound || 0) + scrollDrops.length;
        }
      }
      
      character.experience += rewards.exp;
      character.gold += rewards.gold;
      character.statistics = character.statistics || {};
      character.statistics.totalKills = (character.statistics.totalKills || 0) + combat.enemies.length;
      character.statistics.totalGoldEarned = (character.statistics.totalGoldEarned || 0) + rewards.gold;
      
      // Track boss/elite kills
      if (currentNode.type === 'boss') {
        character.statistics.bossKills = (character.statistics.bossKills || 0) + 1;
      } else if (currentNode.type === 'elite') {
        character.statistics.eliteKills = (character.statistics.eliteKills || 0) + 1;
      }
      
      let leveledUp = false;
      while (character.experience >= character.experienceToNextLevel) {
        character.experience -= character.experienceToNextLevel;
        character.level++;
        character.statPoints += 5;
        character.experienceToNextLevel = Math.floor(100 * Math.pow(1.2, character.level - 1));
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
        // Advance to next floor
        character.currentFloor++;
        character.statistics.floorsCleared = (character.statistics.floorsCleared || 0) + 1;
        
        // Track highest floor reached for this tower
        if (!character.highestFloorReached) {
          character.highestFloorReached = { towerId: floorMap.towerId, floor: 1 };
        }
        if (floorMap.towerId === character.highestFloorReached.towerId) {
          if (character.currentFloor > character.highestFloorReached.floor) {
            character.highestFloorReached.floor = character.currentFloor;
          }
        }
        
        // Also track per-tower progress
        if (!character.towerProgress) character.towerProgress = {};
        const towerKey = `tower_${floorMap.towerId}`;
        if (!character.towerProgress[towerKey] || character.currentFloor > character.towerProgress[towerKey]) {
          character.towerProgress[towerKey] = character.currentFloor;
          character.markModified('towerProgress');
        }
        
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
    let damageReduction = 0, evasionChance = 0;
    (combat.playerBuffs || []).forEach(b => {
      if (b.type === 'defend' || b.type === 'shield') damageReduction += b.value;
      if (b.type === 'evasion') evasionChance += b.value;
    });
    
    for (const enemy of stillAlive) {
      if (Math.random() * 100 < evasionChance) {
        newLogs.push({ actor: 'enemy', message: `${enemy.name} attacks but you dodged!`, damage: 0, type: 'miss' });
        continue;
      }
      const rawDmg = Math.max(1, (enemy.atk || 10) - pDef * 0.3);
      const dmg = Math.max(1, Math.floor(rawDmg * (1 - damageReduction / 100)));
      character.stats.hp = Math.max(0, character.stats.hp - dmg);
      newLogs.push({ actor: 'enemy', message: `${enemy.name} attacks for ${dmg}!`, damage: dmg, type: 'enemy' });
    }
    
    combat.playerBuffs = (combat.playerBuffs || []).map(b => ({ ...b, duration: b.duration - 1 })).filter(b => b.duration > 0);
    
    if (character.stats.hp <= 0) {
      character.stats.hp = 0;
      character.statistics = character.statistics || {};
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
    
    // Check if this is an exit node - advance floor!
    let floorComplete = false;
    if (currentNode.isExit) {
      // Advance to next floor
      character.currentFloor++;
      character.statistics = character.statistics || {};
      character.statistics.floorsCleared = (character.statistics.floorsCleared || 0) + 1;
      
      // Track highest floor reached for this tower
      if (!character.highestFloorReached) {
        character.highestFloorReached = { towerId: floorMap.towerId, floor: 1 };
      }
      if (floorMap.towerId === character.highestFloorReached.towerId) {
        if (character.currentFloor > character.highestFloorReached.floor) {
          character.highestFloorReached.floor = character.currentFloor;
        }
      }
      
      // Track per-tower progress
      if (!character.towerProgress) character.towerProgress = {};
      const towerKey = `tower_${floorMap.towerId}`;
      if (!character.towerProgress[towerKey] || character.currentFloor > character.towerProgress[towerKey]) {
        character.towerProgress[towerKey] = character.currentFloor;
        character.markModified('towerProgress');
      }
      
      floorMap.completed = true;
      character.isInTower = false;
      floorComplete = true;
      result.message += ` Floor cleared! Floor ${character.currentFloor} unlocked!`;
    }
    
    await character.save();
    await floorMap.save();
    
    res.json({ success: true, ...result, floorComplete, character: { hp: character.stats.hp, maxHp: character.stats.maxHp, mp: character.stats.mp, maxMp: character.stats.maxMp, gold: character.gold } });
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
