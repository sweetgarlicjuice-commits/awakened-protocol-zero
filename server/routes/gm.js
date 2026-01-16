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
    weapon: '⚔️', mainHand: '⚔️', head: '🧢', helmet: '🧢', body: '👕', chest: '👕',
    armor: '👕', leg: '👖', legs: '👖', pants: '👖', shoes: '👢',
    boots: '👢', feet: '👢', ring: '💍', necklace: '📿', amulet: '📿',
    accessory: '💍', offhand: '🛡️', shield: '🛡️', hands: '🧤', cape: '🧥'
  };
  
  return slotIcons[item.slot] || slotIcons[item.type] || '📦';
}

// Build item database
async function buildItemDatabase() {
  const items = [];
  
  // Try to import equipment from index.js
  try {
    const equipmentModule = await import('../data/equipment/index.js');
    
    // FIXED: EQUIPMENT is exported as an object, not an array
    // Convert it to an array using Object.values()
    const EQUIPMENT = equipmentModule.EQUIPMENT || {};
    const allEquipment = Object.values(EQUIPMENT);
    
    if (Array.isArray(allEquipment) && allEquipment.length > 0) {
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
          classReq: item.class,
          tower: item.tower,
          setId: item.setId,
          description: item.description
        });
      });
      console.log(`[GM] Loaded ${allEquipment.length} equipment items from database`);
    } else {
      console.log('[GM] No equipment found in EQUIPMENT export');
    }
    
    // Also load MATERIALS if available
    const MATERIALS = equipmentModule.MATERIALS || {};
    const allMaterials = Object.values(MATERIALS);
    if (allMaterials.length > 0) {
      allMaterials.forEach(mat => {
        if (!items.find(i => i.id === mat.id)) {
          items.push({
            id: mat.id,
            name: mat.name,
            type: 'material',
            subtype: 'drop',
            rarity: mat.rarity || 'common',
            icon: mat.icon || '📦',
            tower: mat.tower,
            stackable: true
          });
        }
      });
      console.log(`[GM] Loaded ${allMaterials.length} materials from database`);
    }
    
    // Also load SETS if available
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
          tower: set.tower,
          class: set.class,
          levelReq: set.levelReq,
          dropFloor: set.dropFloor,
          pieces: set.pieces,
          bonuses: set.bonuses,
          description: `${set.pieces?.length || 0}-piece set for ${set.class || 'any'} class`
        });
      });
      console.log(`[GM] Loaded ${allSets.length} equipment sets from database`);
    }
  } catch (err) {
    console.log('[GM] Equipment index import error:', err.message);
  }
  
  // Try to import consumables
  try {
    const consumablesModule = await import('../data/equipment/consumables.js');
    const CONSUMABLES = consumablesModule.CONSUMABLES || consumablesModule.default || [];
    
    if (Array.isArray(CONSUMABLES)) {
      CONSUMABLES.forEach(item => {
        items.push({
          id: item.id,
          name: item.name,
          type: 'consumable',
          subtype: item.subtype || 'potion',
          rarity: item.rarity || 'common',
          icon: item.icon || '🧪',
          effect: item.effect,
          stackable: true,
          description: item.description
        });
      });
      console.log(`[GM] Loaded ${CONSUMABLES.length} consumables`);
    }
  } catch (err) {
    console.log('[GM] Consumables not found:', err.message);
  }
  
  // Try to import special items (scrolls)
  try {
    const specialModule = await import('../data/equipment/special_items.js');
    // FIXED: The export is HIDDEN_CLASS_SCROLLS, not SPECIAL_ITEMS
    const HIDDEN_CLASS_SCROLLS = specialModule.HIDDEN_CLASS_SCROLLS || 
                                  specialModule.SPECIAL_ITEMS || 
                                  specialModule.hiddenClassScrolls || 
                                  specialModule.scrolls ||
                                  specialModule.default || [];
    
    if (Array.isArray(HIDDEN_CLASS_SCROLLS)) {
      HIDDEN_CLASS_SCROLLS.forEach(item => {
        items.push({
          id: item.id,
          name: item.name,
          type: item.type || 'special',
          subtype: item.subtype || 'scroll',
          rarity: item.rarity || 'legendary',
          icon: item.icon || '📜',
          targetClass: item.targetClass,
          baseClass: item.baseClass,
          stackable: false,
          description: item.description
        });
      });
      console.log(`[GM] Loaded ${HIDDEN_CLASS_SCROLLS.length} special items (scrolls)`);
    }
  } catch (err) {
    console.log('[GM] Special items not found:', err.message);
  }
  
  // Always add fallback materials (only if not already loaded)
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
  
  // Always add fallback consumables (only if not already loaded)
  const basicConsumables = [
    { id: 'health_potion_small', name: 'Small Health Potion', icon: '🧪', rarity: 'common', effect: { type: 'heal', value: 100 } },
    { id: 'health_potion_medium', name: 'Medium Health Potion', icon: '🧪', rarity: 'uncommon', effect: { type: 'heal', value: 300 } },
    { id: 'health_potion_large', name: 'Large Health Potion', icon: '🧪', rarity: 'rare', effect: { type: 'heal', value: 600 } },
    { id: 'mana_potion_small', name: 'Small Mana Potion', icon: '💙', rarity: 'common', effect: { type: 'mana', value: 50 } },
    { id: 'mana_potion_medium', name: 'Medium Mana Potion', icon: '💙', rarity: 'uncommon', effect: { type: 'mana', value: 150 } },
    { id: 'mana_potion_large', name: 'Large Mana Potion', icon: '💙', rarity: 'rare', effect: { type: 'mana', value: 300 } },
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
    const { q, type, rarity, tower } = req.query;
    let items = await getItemDatabase();
    
    // Filter by search query
    if (q && q.trim()) {
      const query = q.toLowerCase().trim();
      items = items.filter(item => 
        item.name.toLowerCase().includes(query) ||
        item.id.toLowerCase().includes(query) ||
        (item.description && item.description.toLowerCase().includes(query))
      );
    }
    
    // Filter by type
    if (type && type !== 'all') {
      items = items.filter(item => item.type === type);
    }
    
    // Filter by rarity
    if (rarity && rarity !== 'all') {
      items = items.filter(item => item.rarity === rarity);
    }
    
    // Filter by tower
    if (tower && tower !== 'all') {
      const towerNum = parseInt(tower);
      items = items.filter(item => item.tower === towerNum);
    }
    
    res.json({ items: items.slice(0, 50) }); // Limit to 50 results
  } catch (error) {
    console.error('Item search error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/gm/items/all - Get all items (paginated)
router.get('/items/all', authenticate, requireGM, async (req, res) => {
  try {
    const { page = 1, limit = 50, type, rarity } = req.query;
    let items = await getItemDatabase();
    
    // Filter by type
    if (type && type !== 'all') {
      items = items.filter(item => item.type === type);
    }
    
    // Filter by rarity
    if (rarity && rarity !== 'all') {
      items = items.filter(item => item.rarity === rarity);
    }
    
    const total = items.length;
    const startIndex = (page - 1) * limit;
    const paginatedItems = items.slice(startIndex, startIndex + parseInt(limit));
    
    res.json({
      items: paginatedItems,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all items error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// PLAYER MANAGEMENT ROUTES
// ============================================

// GET /api/gm/players - Get all players
router.get('/players', authenticate, requireGM, async (req, res) => {
  try {
    const users = await User.find({ role: 'player' }).select('-password');
    const playersWithCharacters = await Promise.all(users.map(async (user) => {
      const character = await Character.findOne({ userId: user._id });
      return {
        user: user.toObject(),
        character: character ? character.toObject() : null
      };
    }));
    res.json({ players: playersWithCharacters });
  } catch (error) {
    console.error('Get players error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/gm/player/:id - Get player profile
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

// POST /api/gm/player/:id/edit-stats - Edit player stats
router.post('/player/:id/edit-stats', authenticate, requireGM, async (req, res) => {
  try {
    const { stats } = req.body;
    const character = await Character.findOne({ userId: req.params.id });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    
    // Update only provided stats
    Object.keys(stats).forEach(key => {
      if (character.stats.hasOwnProperty(key)) {
        character.stats[key] = stats[key];
      }
    });
    
    await character.save();
    res.json({ message: 'Stats updated', stats: character.stats });
  } catch (error) {
    console.error('Edit stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/gm/player/:id/reset-stats - Reset stats to base
router.post('/player/:id/reset-stats', authenticate, requireGM, async (req, res) => {
  try {
    const character = await Character.findOne({ userId: req.params.id });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    
    // Get base stats for class
    const baseStats = {
      swordsman: { str: 10, agi: 5, dex: 5, int: 3, vit: 8 },
      thief: { str: 5, agi: 10, dex: 8, int: 3, vit: 5 },
      archer: { str: 5, agi: 8, dex: 10, int: 3, vit: 5 },
      mage: { str: 3, agi: 5, dex: 5, int: 10, vit: 5 }
    };
    
    const base = baseStats[character.class.toLowerCase()] || baseStats.swordsman;
    
    character.stats.str = base.str;
    character.stats.agi = base.agi;
    character.stats.dex = base.dex;
    character.stats.int = base.int;
    character.stats.vit = base.vit;
    
    // Recalculate derived stats
    character.stats.maxHp = 100 + (character.stats.vit * 10) + ((character.level - 1) * 15);
    character.stats.maxMp = 50 + (character.stats.int * 5) + ((character.level - 1) * 8);
    character.stats.hp = character.stats.maxHp;
    character.stats.mp = character.stats.maxMp;
    
    // Return stat points
    character.statPoints = (character.level - 1) * 5;
    
    await character.save();
    res.json({ message: 'Stats reset', character });
  } catch (error) {
    console.error('Reset stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/gm/player/:id/refresh-energy - Refresh energy to 100
router.post('/player/:id/refresh-energy', authenticate, requireGM, async (req, res) => {
  try {
    const character = await Character.findOne({ userId: req.params.id });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    
    character.energy = 100;
    character.lastEnergyUpdate = new Date();
    await character.save();
    
    res.json({ message: 'Energy refreshed', energy: character.energy });
  } catch (error) {
    console.error('Refresh energy error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/gm/player/:id/add-gold - Add/remove gold
router.post('/player/:id/add-gold', authenticate, requireGM, async (req, res) => {
  try {
    const { amount } = req.body;
    const character = await Character.findOne({ userId: req.params.id });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    
    character.gold = Math.max(0, character.gold + amount);
    await character.save();
    
    res.json({ message: `Gold ${amount >= 0 ? 'added' : 'removed'}`, gold: character.gold });
  } catch (error) {
    console.error('Add gold error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/gm/player/:id/add-item - Add item to inventory
router.post('/player/:id/add-item', authenticate, requireGM, async (req, res) => {
  try {
    const { itemId, quantity = 1 } = req.body;
    const character = await Character.findOne({ userId: req.params.id });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    
    const items = await getItemDatabase();
    const item = items.find(i => i.id === itemId);
    if (!item) return res.status(404).json({ error: 'Item not found in database' });
    
    // Check if stackable and already in inventory
    if (item.stackable) {
      const existingIndex = character.inventory.findIndex(i => i.itemId === itemId);
      if (existingIndex >= 0) {
        character.inventory[existingIndex].quantity += quantity;
        await character.save();
        return res.json({ message: `Added ${quantity}x ${item.name}`, inventory: character.inventory });
      }
    }
    
    // Check inventory space
    if (character.inventory.length >= character.inventorySize) {
      return res.status(400).json({ error: 'Inventory full' });
    }
    
    // Add new item
    character.inventory.push({
      itemId: item.id,
      name: item.name,
      icon: item.icon,
      type: item.type,
      subtype: item.subtype,
      slot: item.slot,
      rarity: item.rarity,
      quantity: quantity,
      stackable: item.stackable || false,
      stats: item.stats || {},
      effect: item.effect,
      levelReq: item.levelReq,
      classReq: item.classReq
    });
    
    await character.save();
    res.json({ message: `Added ${quantity}x ${item.name}`, inventory: character.inventory });
  } catch (error) {
    console.error('Add item error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/gm/player/:id/remove-item/:index
router.delete('/player/:id/remove-item/:index', authenticate, requireGM, async (req, res) => {
  try {
    const character = await Character.findOne({ userId: req.params.id });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    
    const index = parseInt(req.params.index);
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
