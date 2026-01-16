import express from 'express';
import Character from '../models/Character.js';
import User from '../models/User.js';
import HiddenClassOwnership from '../models/HiddenClassOwnership.js';
import { authenticate, requireGM } from '../middleware/auth.js';

const router = express.Router();

// Safely import equipment database with fallbacks
let allEquipment = [];
let CONSUMABLES = [];
let SPECIAL_ITEMS = [];

// Try to import equipment database
try {
  const equipmentModule = await import('../data/equipment/index.js');
  allEquipment = equipmentModule.allEquipment || [];
} catch (err) {
  console.log('Equipment index not found, using empty array');
}

// Try to import consumables
try {
  const consumablesModule = await import('../data/equipment/consumables.js');
  CONSUMABLES = consumablesModule.CONSUMABLES || consumablesModule.default || [];
} catch (err) {
  console.log('Consumables not found, using empty array');
}

// Try to import special items
try {
  const specialModule = await import('../data/equipment/special_items.js');
  SPECIAL_ITEMS = specialModule.SPECIAL_ITEMS || specialModule.hiddenClassScrolls || specialModule.default || [];
} catch (err) {
  console.log('Special items not found, using empty array');
}

// Get icon for equipment based on slot/type
function getEquipmentIcon(item) {
  if (item.icon) return item.icon;
  
  const slotIcons = {
    weapon: '⚔️',
    head: '🧢',
    helmet: '🧢',
    body: '👕',
    chest: '👕',
    armor: '👕',
    leg: '👖',
    legs: '👖',
    pants: '👖',
    shoes: '👢',
    boots: '👢',
    feet: '👢',
    ring: '💍',
    necklace: '📿',
    amulet: '📿',
    accessory: '💍',
    offhand: '🛡️',
    shield: '🛡️'
  };
  
  return slotIcons[item.slot] || slotIcons[item.type] || '📦';
}

// Build complete item database for search
function buildItemDatabase() {
  const items = [];
  
  // Add all equipment
  if (Array.isArray(allEquipment)) {
    allEquipment.forEach(item => {
      items.push({
        id: item.id,
        name: item.name,
        type: 'equipment',
        subtype: item.type,
        slot: item.slot,
        rarity: item.rarity || 'common',
        icon: getEquipmentIcon(item),
        stats: item.stats || {},
        levelReq: item.levelReq,
        classReq: item.class,
        description: item.description
      });
    });
  }
  
  // Add consumables
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
  }
  
  // Add special items (scrolls, memory crystals, etc.)
  if (Array.isArray(SPECIAL_ITEMS)) {
    SPECIAL_ITEMS.forEach(item => {
      items.push({
        id: item.id,
        name: item.name,
        type: item.type || 'special',
        subtype: item.subtype,
        rarity: item.rarity || 'legendary',
        icon: item.icon || '📜',
        stackable: item.stackable !== false,
        description: item.description
      });
    });
  }
  
  // Add crafting materials (always available as fallback)
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
    
    // Special materials
    { id: 'memory_crystal_fragment', name: 'Memory Crystal Fragment', icon: '💠', rarity: 'epic' },
    { id: 'memory_crystal', name: 'Memory Crystal', icon: '🔷', rarity: 'legendary' },
  ];
  
  materials.forEach(mat => {
    items.push({
      id: mat.id,
      name: mat.name,
      type: 'material',
      subtype: 'drop',
      rarity: mat.rarity,
      icon: mat.icon,
      stackable: true
    });
  });
  
  // Add basic consumables as fallback
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
    // Only add if not already present
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
  
  return items;
}

// Cache the item database
let itemDatabase = null;
function getItemDatabase() {
  if (!itemDatabase) {
    itemDatabase = buildItemDatabase();
    console.log(`Item database built with ${itemDatabase.length} items`);
  }
  return itemDatabase;
}

// GET /api/gm/items/search - Search all items in database
router.get('/items/search', authenticate, requireGM, async (req, res) => {
  try {
    const { q } = req.query;
    const items = getItemDatabase();
    
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
    let items = getItemDatabase();
    
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

// GET /api/gm/player/:id - Get full player profile
router.get('/player/:id', authenticate, requireGM, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const character = await Character.findOne({ userId: user._id });
    
    res.json({
      user,
      character
    });
  } catch (error) {
    console.error('Get player error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/gm/player/:id/stats - Edit player stats
router.patch('/player/:id/stats', authenticate, requireGM, async (req, res) => {
  try {
    const { stats, statPoints } = req.body;
    const character = await Character.findOne({ userId: req.params.id });
    
    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }
    
    if (stats) {
      character.stats = { ...character.stats, ...stats };
    }
    
    if (statPoints !== undefined) {
      character.statPoints = statPoints;
    }
    
    await character.save();
    
    res.json({
      message: 'Stats updated successfully',
      character
    });
  } catch (error) {
    console.error('Update stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/gm/player/:id/edit-stats - Edit individual player stats (for GM modal)
router.post('/player/:id/edit-stats', authenticate, requireGM, async (req, res) => {
  try {
    const { stats } = req.body;
    const character = await Character.findOne({ userId: req.params.id });
    
    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }
    
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
    
    res.json({
      message: 'Stats updated successfully',
      character
    });
  } catch (error) {
    console.error('Edit stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/gm/player/:id/reset-stats - Reset all stats to base
router.post('/player/:id/reset-stats', authenticate, requireGM, async (req, res) => {
  try {
    const character = await Character.findOne({ userId: req.params.id });
    
    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }
    
    const CLASS_BASE_STATS = {
      swordsman: { hp: 150, mp: 50, str: 15, agi: 8, dex: 8, int: 5, vit: 14 },
      thief: { hp: 100, mp: 70, str: 8, agi: 15, dex: 12, int: 7, vit: 8 },
      archer: { hp: 110, mp: 60, str: 10, agi: 12, dex: 15, int: 6, vit: 7 },
      mage: { hp: 80, mp: 120, str: 5, agi: 7, dex: 8, int: 15, vit: 5 }
    };
    
    const baseStats = CLASS_BASE_STATS[character.baseClass];
    character.stats = {
      ...baseStats,
      maxHp: baseStats.hp,
      maxMp: baseStats.mp
    };
    
    character.statPoints = (character.level - 1) * 5;
    
    await character.save();
    
    res.json({
      message: 'Stats reset successfully',
      character
    });
  } catch (error) {
    console.error('Reset stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/gm/player/:id/refresh-energy - Set energy to 100
router.post('/player/:id/refresh-energy', authenticate, requireGM, async (req, res) => {
  try {
    const character = await Character.findOne({ userId: req.params.id });
    
    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }
    
    character.energy = 100;
    character.lastEnergyUpdate = new Date();
    await character.save();
    
    res.json({
      message: 'Energy refreshed to 100',
      energy: character.energy
    });
  } catch (error) {
    console.error('Refresh energy error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/gm/player/:id/add-gold - Add gold to player
router.post('/player/:id/add-gold', authenticate, requireGM, async (req, res) => {
  try {
    const { amount } = req.body;
    const character = await Character.findOne({ userId: req.params.id });
    
    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }
    
    character.gold += amount;
    if (character.gold < 0) character.gold = 0;
    
    await character.save();
    
    res.json({
      message: `Gold ${amount >= 0 ? 'added' : 'removed'}: ${Math.abs(amount)}`,
      gold: character.gold
    });
  } catch (error) {
    console.error('Add gold error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/gm/player/:id/add-item - Add item to inventory (IMPROVED)
router.post('/player/:id/add-item', authenticate, requireGM, async (req, res) => {
  try {
    const { itemId, name, type, rarity, quantity, stats, slot, icon, classReq, levelReq, effect, subtype, stackable } = req.body;
    const character = await Character.findOne({ userId: req.params.id });
    
    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }
    
    // Try to find item in database first
    const dbItem = getItemDatabase().find(i => i.id === itemId);
    
    // Build item data - prefer database values, fall back to request values
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
    
    // Check if stackable and already exists
    if (itemData.stackable) {
      const existingIndex = character.inventory.findIndex(i => i.itemId === itemId);
      if (existingIndex >= 0) {
        character.inventory[existingIndex].quantity += itemData.quantity;
        await character.save();
        return res.json({
          message: `Added ${itemData.quantity}x ${itemData.name} to inventory (stacked)`,
          inventory: character.inventory
        });
      }
    }
    
    // Check inventory space
    if (character.inventory.length >= character.inventorySize) {
      return res.status(400).json({ error: 'Inventory is full' });
    }
    
    character.inventory.push(itemData);
    await character.save();
    
    res.json({
      message: `Added ${itemData.name} to inventory`,
      inventory: character.inventory
    });
  } catch (error) {
    console.error('Add item error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/gm/player/:id/remove-item/:itemIndex - Remove item from inventory
router.delete('/player/:id/remove-item/:itemIndex', authenticate, requireGM, async (req, res) => {
  try {
    const { itemIndex } = req.params;
    const character = await Character.findOne({ userId: req.params.id });
    
    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }
    
    const index = parseInt(itemIndex);
    if (index < 0 || index >= character.inventory.length) {
      return res.status(400).json({ error: 'Invalid item index' });
    }
    
    const removedItem = character.inventory.splice(index, 1)[0];
    await character.save();
    
    res.json({
      message: `Removed ${removedItem.name} from inventory`,
      inventory: character.inventory
    });
  } catch (error) {
    console.error('Remove item error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/gm/player/:id/clear-inventory - Clear all items
router.post('/player/:id/clear-inventory', authenticate, requireGM, async (req, res) => {
  try {
    const character = await Character.findOne({ userId: req.params.id });
    
    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }
    
    character.inventory = [];
    await character.save();
    
    res.json({
      message: 'Inventory cleared',
      inventory: []
    });
  } catch (error) {
    console.error('Clear inventory error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/gm/player/:id/reset-progress - Reset tower progress
router.post('/player/:id/reset-progress', authenticate, requireGM, async (req, res) => {
  try {
    const character = await Character.findOne({ userId: req.params.id });
    
    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }
    
    character.currentTower = 1;
    character.currentFloor = 1;
    character.highestTowerCleared = 0;
    character.highestFloorReached = { towerId: 1, floor: 1 };
    
    await character.save();
    
    res.json({
      message: 'Tower progress reset',
      character
    });
  } catch (error) {
    console.error('Reset progress error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/gm/player/:id/remove-hidden-class - Force remove hidden class
router.post('/player/:id/remove-hidden-class', authenticate, requireGM, async (req, res) => {
  try {
    const character = await Character.findOne({ userId: req.params.id });
    
    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }
    
    if (character.hiddenClass === 'none') {
      return res.status(400).json({ error: 'Player has no hidden class' });
    }
    
    // Release the class ownership
    await HiddenClassOwnership.releaseClass(character.hiddenClass, character._id);
    
    const oldClass = character.hiddenClass;
    character.hiddenClass = 'none';
    character.hiddenClassUnlocked = false;
    
    // Remove hidden class skills
    character.skills = character.skills.filter(s => 
      ['slash', 'heavyStrike', 'shieldBash', 'warCry',
       'backstab', 'poisonBlade', 'smokeScreen', 'steal',
       'preciseShot', 'multiShot', 'eagleEye', 'arrowRain',
       'fireball', 'iceSpear', 'manaShield', 'thunderbolt'].includes(s.skillId)
    );
    
    await character.save();
    
    res.json({
      message: `Removed ${oldClass} from player`,
      character
    });
  } catch (error) {
    console.error('Remove hidden class error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/gm/player/:id - Delete player and character
router.delete('/player/:id', authenticate, requireGM, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (user.role === 'admin') {
      return res.status(403).json({ error: 'Cannot delete admin accounts' });
    }
    
    if (user._id.equals(req.user._id)) {
      return res.status(403).json({ error: 'Cannot delete your own account' });
    }
    
    const character = await Character.findOne({ userId: user._id });
    if (character && character.hiddenClass !== 'none') {
      await HiddenClassOwnership.releaseClass(character.hiddenClass, character._id);
    }
    
    await Character.deleteOne({ userId: user._id });
    await User.deleteOne({ _id: user._id });
    
    res.json({
      message: 'Player deleted successfully'
    });
  } catch (error) {
    console.error('Delete player error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/gm/hidden-classes - Get all hidden class status
router.get('/hidden-classes', authenticate, requireGM, async (req, res) => {
  try {
    const classes = await HiddenClassOwnership.getAllClassStatus();
    res.json({ classes });
  } catch (error) {
    console.error('Get hidden classes error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/gm/player/:id/set-level - Set player level
router.post('/player/:id/set-level', authenticate, requireGM, async (req, res) => {
  try {
    const { level } = req.body;
    const character = await Character.findOne({ userId: req.params.id });
    
    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }
    
    if (level < 1 || level > 50) {
      return res.status(400).json({ error: 'Level must be between 1 and 50' });
    }
    
    const oldLevel = character.level;
    character.level = level;
    character.experience = 0;
    character.experienceToNextLevel = Math.floor(100 * Math.pow(1.15, level - 1));
    
    const levelDiff = level - oldLevel;
    character.statPoints = Math.max(0, character.statPoints + (levelDiff * 5));
    
    await character.save();
    
    res.json({
      message: `Level set to ${level}`,
      character
    });
  } catch (error) {
    console.error('Set level error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/gm/player/:id/heal - Full heal player
router.post('/player/:id/heal', authenticate, requireGM, async (req, res) => {
  try {
    const character = await Character.findOne({ userId: req.params.id });
    
    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }
    
    character.stats.hp = character.stats.maxHp;
    character.stats.mp = character.stats.maxMp;
    await character.save();
    
    res.json({
      message: 'Player fully healed',
      stats: character.stats
    });
  } catch (error) {
    console.error('Heal error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/gm/trading - Get all trading listings for GM
router.get('/trading', authenticate, requireGM, async (req, res) => {
  try {
    const { TradingListing } = await import('../models/Tavern.js');
    const listings = await TradingListing.find({}).sort({ createdAt: -1 });
    
    const listingsWithSellers = await Promise.all(listings.map(async (listing) => {
      const user = await User.findById(listing.sellerId).select('username');
      const character = await Character.findOne({ userId: listing.sellerId }).select('name');
      return {
        ...listing.toObject(),
        sellerUsername: user ? user.username : 'Unknown',
        sellerCharacter: character ? character.name : 'Unknown'
      };
    }));
    
    res.json({ listings: listingsWithSellers });
  } catch (error) {
    console.error('Get trading listings error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/gm/trading/:id - Remove trading listing and return item to player
router.delete('/trading/:id', authenticate, requireGM, async (req, res) => {
  try {
    const { TradingListing } = await import('../models/Tavern.js');
    const listing = await TradingListing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    
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
      
      await TradingListing.findByIdAndDelete(req.params.id);
      
      res.json({
        message: 'Listing removed. Item returned to player inventory.',
        returnedTo: seller.name
      });
    } else {
      await TradingListing.findByIdAndDelete(req.params.id);
      
      res.json({
        message: 'Listing removed. Seller no longer exists, item deleted.',
        returnedTo: null
      });
    }
  } catch (error) {
    console.error('Remove trading listing error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
