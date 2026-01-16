import express from 'express';
import Character from '../models/Character.js';
import User from '../models/User.js';
import HiddenClassOwnership from '../models/HiddenClassOwnership.js';
import { authenticate, requireGM } from '../middleware/auth.js';

const router = express.Router();

// Item database - built on first access
let itemDatabase = null;
let dbInitPromise = null;

// Get icon for equipment based on slot/type
function getEquipmentIcon(item) {
  if (item.icon) return item.icon;
  
  const slotIcons = {
    weapon: '⚔️', mainHand: '⚔️',
    head: '🧢', helmet: '🧢',
    body: '👕', chest: '👕', armor: '👕',
    hands: '🧤', gloves: '🧤',
    leg: '👖', legs: '👖', pants: '👖',
    feet: '👢', shoes: '👢', boots: '👢',
    ring: '💍',
    necklace: '📿', amulet: '📿',
    cape: '🧥', cloak: '🧥',
    accessory: '💍',
    offhand: '🛡️', shield: '🛡️'
  };
  
  return slotIcons[item.slot] || slotIcons[item.type] || '📦';
}

// Build item database
async function buildItemDatabase() {
  const items = [];
  
  // Try to import equipment database
  try {
    const equipmentModule = await import('../data/equipment/index.js');
    
    // Get EQUIPMENT (object keyed by ID)
    const EQUIPMENT = equipmentModule.EQUIPMENT || {};
    const allEquipment = Object.values(EQUIPMENT);
    
    if (allEquipment.length > 0) {
      allEquipment.forEach(item => {
        items.push({
          id: item.id,
          name: item.name,
          type: 'equipment',
          subtype: item.type || item.slot,
          slot: item.slot,
          rarity: item.rarity || 'common',
          icon: getEquipmentIcon(item),
          stats: item.stats || {},
          levelReq: item.levelReq,
          dropFloor: item.dropFloor,
          setId: item.setId,
          tower: item.tower,
          classReq: item.class,
          description: item.description
        });
      });
      console.log(`[GM] Loaded ${allEquipment.length} equipment items from database`);
    }
    
    // Get SETS (object keyed by ID)
    const SETS = equipmentModule.SETS || {};
    const allSets = Object.values(SETS);
    
    if (allSets.length > 0) {
      allSets.forEach(set => {
        items.push({
          id: set.id,
          name: set.name,
          type: 'set',
          subtype: 'equipment_set',
          rarity: set.rarity || 'rare',
          icon: set.icon || '🎽',
          class: set.class,
          tower: set.tower,
          levelReq: set.levelReq,
          dropFloor: set.dropFloor,
          pieces: set.pieces,
          bonuses: set.bonuses,
          description: `${set.pieces.length}-piece set for ${set.class}`
        });
      });
      console.log(`[GM] Loaded ${allSets.length} equipment sets`);
    }
    
    // Get MATERIALS (object keyed by ID)
    const MATERIALS = equipmentModule.MATERIALS || {};
    const allMaterials = Object.values(MATERIALS);
    
    if (allMaterials.length > 0) {
      allMaterials.forEach(mat => {
        items.push({
          id: mat.id,
          name: mat.name,
          type: 'material',
          subtype: mat.type || 'drop',
          rarity: mat.rarity || 'common',
          icon: mat.icon || '🧱',
          tower: mat.tower,
          stackable: true,
          sellPrice: mat.sellPrice,
          description: mat.description
        });
      });
      console.log(`[GM] Loaded ${allMaterials.length} materials from database`);
    }
    
    // Get HIDDEN_CLASS_SCROLLS (object keyed by ID)
    const HIDDEN_CLASS_SCROLLS = equipmentModule.HIDDEN_CLASS_SCROLLS || {};
    const allScrolls = Object.values(HIDDEN_CLASS_SCROLLS);
    
    if (allScrolls.length > 0) {
      allScrolls.forEach(scroll => {
        items.push({
          id: scroll.id,
          name: scroll.name,
          type: 'hidden_class_scroll',
          subtype: 'scroll',
          rarity: 'legendary',
          icon: scroll.icon || '📜',
          hiddenClass: scroll.hiddenClass,
          baseClass: scroll.baseClass,
          element: scroll.element,
          dropTowers: scroll.dropTowers,
          stackable: false,
          description: scroll.description || `Awakens ${scroll.hiddenClass} hidden class`
        });
      });
      console.log(`[GM] Loaded ${allScrolls.length} hidden class scrolls`);
    }
    
  } catch (err) {
    console.log('[GM] Equipment index import error:', err.message);
  }
  
  // Try to import consumables
  try {
    const consumablesModule = await import('../data/equipment/consumables.js');
    const CONSUMABLES = consumablesModule.CONSUMABLES || consumablesModule.default || [];
    
    const consumablesList = Array.isArray(CONSUMABLES) ? CONSUMABLES : Object.values(CONSUMABLES);
    
    if (consumablesList.length > 0) {
      consumablesList.forEach(item => {
        // Skip if already added
        if (items.find(i => i.id === item.id)) return;
        
        items.push({
          id: item.id,
          name: item.name,
          type: 'consumable',
          subtype: item.subtype || 'potion',
          rarity: item.rarity || 'common',
          icon: item.icon || '🧪',
          effect: item.effect,
          buyPrice: item.buyPrice,
          sellPrice: item.sellPrice,
          stackable: true,
          description: item.description
        });
      });
      console.log(`[GM] Loaded ${consumablesList.length} consumables`);
    }
  } catch (err) {
    console.log('[GM] Consumables not found:', err.message);
  }
  
  // Try to import special items (memory crystal, etc)
  try {
    const specialModule = await import('../data/equipment/special_items.js');
    
    // Memory Crystal
    if (specialModule.MEMORY_CRYSTAL) {
      const mc = specialModule.MEMORY_CRYSTAL;
      if (!items.find(i => i.id === mc.id)) {
        items.push({
          id: mc.id,
          name: mc.name,
          type: 'special',
          subtype: 'crystal',
          rarity: mc.rarity || 'legendary',
          icon: mc.icon || '🔷',
          stackable: false,
          description: mc.description
        });
      }
    }
    
    // Memory Crystal Fragment
    if (specialModule.MEMORY_CRYSTAL_FRAGMENT) {
      const mcf = specialModule.MEMORY_CRYSTAL_FRAGMENT;
      if (!items.find(i => i.id === mcf.id)) {
        items.push({
          id: mcf.id,
          name: mcf.name,
          type: 'material',
          subtype: 'fragment',
          rarity: mcf.rarity || 'epic',
          icon: mcf.icon || '💠',
          stackable: true,
          description: mcf.description
        });
      }
    }
  } catch (err) {
    console.log('[GM] Special items import error:', err.message);
  }
  
  // Always add fallback materials if not already present
  const materials = [
    // Tower 1 - Crimson Spire
    { id: 'bone_fragment', name: 'Bone Fragment', icon: '🦴', rarity: 'common' },
    { id: 'cursed_cloth', name: 'Cursed Cloth', icon: '🧵', rarity: 'common' },
    { id: 'ghost_essence', name: 'Ghost Essence', icon: '👻', rarity: 'uncommon' },
    { id: 'death_knight_core', name: 'Death Knight Core', icon: '💀', rarity: 'rare' },
    { id: 'soul_shard', name: 'Soul Shard', icon: '💎', rarity: 'uncommon' },
    // Tower 2 - Frost Citadel
    { id: 'frost_crystal', name: 'Frost Crystal', icon: '❄️', rarity: 'common' },
    { id: 'ice_shard', name: 'Ice Shard', icon: '🧊', rarity: 'common' },
    { id: 'frozen_heart', name: 'Frozen Heart', icon: '💙', rarity: 'rare' },
    { id: 'permafrost_chunk', name: 'Permafrost Chunk', icon: '🏔️', rarity: 'uncommon' },
    // Tower 3 - Shadow Keep
    { id: 'shadow_essence', name: 'Shadow Essence', icon: '🌑', rarity: 'uncommon' },
    { id: 'dark_crystal', name: 'Dark Crystal', icon: '🖤', rarity: 'rare' },
    { id: 'nightmare_dust', name: 'Nightmare Dust', icon: '💭', rarity: 'uncommon' },
    { id: 'void_fragment', name: 'Void Fragment', icon: '🌀', rarity: 'epic' },
    // Tower 4 - Storm Bastion
    { id: 'lightning_shard', name: 'Lightning Shard', icon: '⚡', rarity: 'uncommon' },
    { id: 'storm_core', name: 'Storm Core', icon: '🌩️', rarity: 'rare' },
    { id: 'thunder_essence', name: 'Thunder Essence', icon: '🔋', rarity: 'uncommon' },
    // Tower 5 - Verdant Spire
    { id: 'verdant_sap', name: 'Verdant Sap', icon: '🌿', rarity: 'uncommon' },
    { id: 'ancient_bark', name: 'Ancient Bark', icon: '🌳', rarity: 'rare' },
    { id: 'poison_gland', name: 'Poison Gland', icon: '🐍', rarity: 'uncommon' },
    { id: 'life_essence', name: 'Life Essence', icon: '💚', rarity: 'rare' },
    // Special
    { id: 'memory_crystal_fragment', name: 'Memory Crystal Fragment', icon: '💠', rarity: 'epic' },
    { id: 'memory_crystal', name: 'Memory Crystal', icon: '🔷', rarity: 'legendary' },
  ];
  
  materials.forEach(mat => {
    if (!items.find(i => i.id === mat.id)) {
      items.push({
        id: mat.id,
        name: mat.name,
        type: 'material',
        subtype: 'drop',
        rarity: mat.rarity,
        icon: mat.icon,
        stackable: true
      });
    }
  });
  
  // Always add fallback consumables
  const basicConsumables = [
    { id: 'small_health_potion', name: 'Small Health Potion', icon: '🧪', rarity: 'common', effect: { type: 'heal', value: 100 } },
    { id: 'medium_health_potion', name: 'Medium Health Potion', icon: '🧪', rarity: 'uncommon', effect: { type: 'heal', value: 300 } },
    { id: 'large_health_potion', name: 'Large Health Potion', icon: '🧪', rarity: 'rare', effect: { type: 'heal', value: 600 } },
    { id: 'small_mana_potion', name: 'Small Mana Potion', icon: '💙', rarity: 'common', effect: { type: 'mana', value: 50 } },
    { id: 'medium_mana_potion', name: 'Medium Mana Potion', icon: '💙', rarity: 'uncommon', effect: { type: 'mana', value: 150 } },
    { id: 'large_mana_potion', name: 'Large Mana Potion', icon: '💙', rarity: 'rare', effect: { type: 'mana', value: 300 } },
    { id: 'antidote', name: 'Antidote', icon: '💊', rarity: 'common', effect: { type: 'cure', value: 'poison' } },
    { id: 'energy_drink', name: 'Energy Drink', icon: '⚡', rarity: 'uncommon', effect: { type: 'energy', value: 20 } },
  ];
  
  basicConsumables.forEach(con => {
    if (!items.find(i => i.id === con.id)) {
      items.push({
        id: con.id,
        name: con.name,
        type: 'consumable',
        subtype: 'potion',
        rarity: con.rarity,
        icon: con.icon,
        effect: con.effect,
        stackable: true
      });
    }
  });
  
  console.log(`[GM] Item database ready with ${items.length} total items`);
  return items;
}

// Get item database (lazy async initialization)
async function getItemDatabase() {
  if (itemDatabase) return itemDatabase;
  
  if (!dbInitPromise) {
    dbInitPromise = buildItemDatabase().then(db => {
      itemDatabase = db;
      return db;
    });
  }
  
  return dbInitPromise;
}

// ============================================
// ITEM SEARCH ROUTES
// ============================================

// GET /api/gm/items/search - Search all items
router.get('/items/search', authenticate, requireGM, async (req, res) => {
  try {
    const { q } = req.query;
    const items = await getItemDatabase();
    
    if (!q || q.length < 1) {
      return res.json({ items: items.slice(0, 20) });
    }
    
    const query = q.toLowerCase();
    const results = items.filter(item => 
      item.name.toLowerCase().includes(query) ||
      item.id.toLowerCase().includes(query) ||
      (item.type && item.type.toLowerCase().includes(query))
    );
    
    res.json({ items: results.slice(0, 20) });
  } catch (error) {
    console.error('Item search error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/gm/items/all - Get all items (paginated)
router.get('/items/all', authenticate, requireGM, async (req, res) => {
  try {
    const { page = 0, limit = 50, type } = req.query;
    let items = await getItemDatabase();
    
    if (type) {
      items = items.filter(item => item.type === type);
    }
    
    const start = parseInt(page) * parseInt(limit);
    const paginatedItems = items.slice(start, start + parseInt(limit));
    
    res.json({ 
      items: paginatedItems,
      total: items.length,
      page: parseInt(page),
      totalPages: Math.ceil(items.length / parseInt(limit))
    });
  } catch (error) {
    console.error('Get all items error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// PLAYER MANAGEMENT ROUTES
// ============================================

// GET /api/gm/player/:id
router.get('/player/:id', authenticate, requireGM, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const character = await Character.findOne({ userId: user._id });
    res.json({ user, character });
  } catch (error) {
    console.error('Get player error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/gm/player/:id/edit-stats
router.post('/player/:id/edit-stats', authenticate, requireGM, async (req, res) => {
  try {
    const { stats } = req.body;
    const character = await Character.findOne({ userId: req.params.id });
    
    if (!character) return res.status(404).json({ error: 'Character not found' });
    
    if (stats.str !== undefined) character.stats.str = Math.max(1, stats.str);
    if (stats.agi !== undefined) character.stats.agi = Math.max(1, stats.agi);
    if (stats.dex !== undefined) character.stats.dex = Math.max(1, stats.dex);
    if (stats.int !== undefined) character.stats.int = Math.max(1, stats.int);
    if (stats.vit !== undefined) character.stats.vit = Math.max(1, stats.vit);
    
    character.stats.maxHp = character.stats.vit * 10 + 50;
    character.stats.maxMp = character.stats.int * 8 + 20;
    character.stats.hp = character.stats.maxHp;
    character.stats.mp = character.stats.maxMp;
    
    await character.save();
    res.json({ message: 'Stats updated successfully', character });
  } catch (error) {
    console.error('Edit stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/gm/player/:id/reset-stats
router.post('/player/:id/reset-stats', authenticate, requireGM, async (req, res) => {
  try {
    const character = await Character.findOne({ userId: req.params.id });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    
    const CLASS_BASE_STATS = {
      swordsman: { hp: 150, mp: 50, str: 15, agi: 8, dex: 8, int: 5, vit: 14 },
      thief: { hp: 100, mp: 70, str: 8, agi: 15, dex: 12, int: 7, vit: 8 },
      archer: { hp: 110, mp: 60, str: 10, agi: 12, dex: 15, int: 6, vit: 7 },
      mage: { hp: 80, mp: 120, str: 5, agi: 7, dex: 8, int: 15, vit: 5 }
    };
    
    const baseStats = CLASS_BASE_STATS[character.baseClass];
    character.stats = { ...baseStats, maxHp: baseStats.hp, maxMp: baseStats.mp };
    character.statPoints = (character.level - 1) * 5;
    
    await character.save();
    res.json({ message: 'Stats reset successfully', character });
  } catch (error) {
    console.error('Reset stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/gm/player/:id/refresh-energy
router.post('/player/:id/refresh-energy', authenticate, requireGM, async (req, res) => {
  try {
    const character = await Character.findOne({ userId: req.params.id });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    
    character.energy = 100;
    character.lastEnergyUpdate = new Date();
    await character.save();
    
    res.json({ message: 'Energy refreshed to 100', energy: character.energy });
  } catch (error) {
    console.error('Refresh energy error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/gm/player/:id/add-gold
router.post('/player/:id/add-gold', authenticate, requireGM, async (req, res) => {
  try {
    const { amount } = req.body;
    const character = await Character.findOne({ userId: req.params.id });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    
    character.gold = Math.max(0, character.gold + amount);
    await character.save();
    
    res.json({ message: `Gold ${amount >= 0 ? 'added' : 'removed'}: ${Math.abs(amount)}`, gold: character.gold });
  } catch (error) {
    console.error('Add gold error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/gm/player/:id/add-item
router.post('/player/:id/add-item', authenticate, requireGM, async (req, res) => {
  try {
    const { itemId, name, type, rarity, quantity, stats, slot, icon, classReq, levelReq, effect, subtype, stackable } = req.body;
    const character = await Character.findOne({ userId: req.params.id });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    
    // Try to find item in database
    const items = await getItemDatabase();
    const dbItem = items.find(i => i.id === itemId);
    
    // Build item data
    const itemData = {
      itemId: itemId,
      name: dbItem?.name || name,
      type: dbItem?.type || type || 'item',
      subtype: dbItem?.subtype || subtype,
      rarity: dbItem?.rarity || rarity || 'common',
      quantity: quantity || 1,
      stats: dbItem?.stats || stats || {},
      slot: dbItem?.slot || slot,
      icon: dbItem?.icon || icon || '📦',
      classReq: dbItem?.classReq || classReq,
      levelReq: dbItem?.levelReq || levelReq,
      effect: dbItem?.effect || effect,
      stackable: dbItem?.stackable !== undefined ? dbItem.stackable : (stackable !== false && type !== 'equipment')
    };
    
    // Stack if possible
    if (itemData.stackable) {
      const existingIndex = character.inventory.findIndex(i => i.itemId === itemId);
      if (existingIndex >= 0) {
        character.inventory[existingIndex].quantity += itemData.quantity;
        await character.save();
        return res.json({ message: `Added ${itemData.quantity}x ${itemData.name} (stacked)`, inventory: character.inventory });
      }
    }
    
    if (character.inventory.length >= character.inventorySize) {
      return res.status(400).json({ error: 'Inventory is full' });
    }
    
    character.inventory.push(itemData);
    await character.save();
    res.json({ message: `Added ${itemData.name} to inventory`, inventory: character.inventory });
  } catch (error) {
    console.error('Add item error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/gm/player/:id/remove-item/:itemIndex
router.delete('/player/:id/remove-item/:itemIndex', authenticate, requireGM, async (req, res) => {
  try {
    const { itemIndex } = req.params;
    const character = await Character.findOne({ userId: req.params.id });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    
    const index = parseInt(itemIndex);
    if (index < 0 || index >= character.inventory.length) {
      return res.status(400).json({ error: 'Invalid item index' });
    }
    
    const removedItem = character.inventory.splice(index, 1)[0];
    await character.save();
    res.json({ message: `Removed ${removedItem.name}`, inventory: character.inventory });
  } catch (error) {
    console.error('Remove item error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/gm/player/:id/clear-inventory
router.post('/player/:id/clear-inventory', authenticate, requireGM, async (req, res) => {
  try {
    const character = await Character.findOne({ userId: req.params.id });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    
    character.inventory = [];
    await character.save();
    res.json({ message: 'Inventory cleared', inventory: [] });
  } catch (error) {
    console.error('Clear inventory error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/gm/player/:id/reset-progress
router.post('/player/:id/reset-progress', authenticate, requireGM, async (req, res) => {
  try {
    const character = await Character.findOne({ userId: req.params.id });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    
    character.currentTower = 1;
    character.currentFloor = 1;
    character.highestTowerCleared = 0;
    character.highestFloorReached = { towerId: 1, floor: 1 };
    
    await character.save();
    res.json({ message: 'Tower progress reset', character });
  } catch (error) {
    console.error('Reset progress error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/gm/player/:id/remove-hidden-class
router.post('/player/:id/remove-hidden-class', authenticate, requireGM, async (req, res) => {
  try {
    const character = await Character.findOne({ userId: req.params.id });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    if (character.hiddenClass === 'none') return res.status(400).json({ error: 'No hidden class' });
    
    await HiddenClassOwnership.releaseClass(character.hiddenClass, character._id);
    
    const oldClass = character.hiddenClass;
    character.hiddenClass = 'none';
    character.hiddenClassUnlocked = false;
    
    // Remove hidden class skills
    const baseSkills = [
      'slash', 'heavyStrike', 'shieldBash', 'warCry',
      'backstab', 'poisonBlade', 'smokeScreen', 'steal',
      'preciseShot', 'multiShot', 'eagleEye', 'arrowRain',
      'fireball', 'iceSpear', 'manaShield', 'thunderbolt'
    ];
    character.skills = character.skills.filter(s => baseSkills.includes(s.skillId));
    
    await character.save();
    res.json({ message: `Removed ${oldClass}`, character });
  } catch (error) {
    console.error('Remove hidden class error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/gm/player/:id/set-level
router.post('/player/:id/set-level', authenticate, requireGM, async (req, res) => {
  try {
    const { level } = req.body;
    const character = await Character.findOne({ userId: req.params.id });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    if (level < 1 || level > 50) return res.status(400).json({ error: 'Level must be 1-50' });
    
    const oldLevel = character.level;
    character.level = level;
    character.experience = 0;
    character.experienceToNextLevel = Math.floor(100 * Math.pow(1.15, level - 1));
    character.statPoints = Math.max(0, character.statPoints + (level - oldLevel) * 5);
    
    await character.save();
    res.json({ message: `Level set to ${level}`, character });
  } catch (error) {
    console.error('Set level error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/gm/player/:id/heal
router.post('/player/:id/heal', authenticate, requireGM, async (req, res) => {
  try {
    const character = await Character.findOne({ userId: req.params.id });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    
    character.stats.hp = character.stats.maxHp;
    character.stats.mp = character.stats.maxMp;
    await character.save();
    
    res.json({ message: 'Player healed', stats: character.stats });
  } catch (error) {
    console.error('Heal error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/gm/player/:id
router.delete('/player/:id', authenticate, requireGM, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ error: 'Cannot delete admin' });
    if (user._id.equals(req.user._id)) return res.status(403).json({ error: 'Cannot delete self' });
    
    const character = await Character.findOne({ userId: user._id });
    if (character?.hiddenClass !== 'none') {
      await HiddenClassOwnership.releaseClass(character.hiddenClass, character._id);
    }
    
    await Character.deleteOne({ userId: user._id });
    await User.deleteOne({ _id: user._id });
    
    res.json({ message: 'Player deleted' });
  } catch (error) {
    console.error('Delete player error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/gm/hidden-classes
router.get('/hidden-classes', authenticate, requireGM, async (req, res) => {
  try {
    const classes = await HiddenClassOwnership.getAllClassStatus();
    res.json({ classes });
  } catch (error) {
    console.error('Get hidden classes error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/gm/trading
router.get('/trading', authenticate, requireGM, async (req, res) => {
  try {
    const { TradingListing } = await import('../models/Tavern.js');
    const listings = await TradingListing.find({}).sort({ createdAt: -1 });
    
    const listingsWithSellers = await Promise.all(listings.map(async (listing) => {
      const user = await User.findById(listing.sellerId).select('username');
      const character = await Character.findOne({ userId: listing.sellerId }).select('name');
      return {
        ...listing.toObject(),
        sellerUsername: user?.username || 'Unknown',
        sellerCharacter: character?.name || 'Unknown'
      };
    }));
    
    res.json({ listings: listingsWithSellers });
  } catch (error) {
    console.error('Get trading error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/gm/trading/:id
router.delete('/trading/:id', authenticate, requireGM, async (req, res) => {
  try {
    const { TradingListing } = await import('../models/Tavern.js');
    const listing = await TradingListing.findById(req.params.id);
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    
    const seller = await Character.findOne({ userId: listing.sellerId });
    
    if (seller) {
      const existingIndex = seller.inventory.findIndex(i => i.itemId === listing.itemId);
      if (existingIndex >= 0) {
        seller.inventory[existingIndex].quantity += listing.quantity;
      } else if (seller.inventory.length < seller.inventorySize) {
        seller.inventory.push({
          itemId: listing.itemId,
          name: listing.itemName,
          icon: listing.icon || '📦',
          type: listing.itemType || 'item',
          rarity: listing.rarity || 'common',
          quantity: listing.quantity,
          stackable: true,
          stats: listing.stats || {}
        });
      }
      await seller.save();
    }
    
    await TradingListing.findByIdAndDelete(req.params.id);
    res.json({ message: 'Listing removed', returnedTo: seller?.name || null });
  } catch (error) {
    console.error('Remove trading error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
