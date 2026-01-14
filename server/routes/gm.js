import express from 'express';
import Character from '../models/Character.js';
import User from '../models/User.js';
import HiddenClassOwnership from '../models/HiddenClassOwnership.js';
import TradingListing from '../models/Tavern.js';
import { authenticate } from '../middleware/auth.js';
import { getItemById } from '../data/itemDatabase.js';

var router = express.Router();

// Middleware to check GM/Admin role
var requireGM = async function(req, res, next) {
  try {
    var user = await User.findById(req.userId);
    if (!user || (user.role !== 'gm' && user.role !== 'admin')) {
      return res.status(403).json({ error: 'Access denied. GM role required.' });
    }
    req.isAdmin = user.role === 'admin';
    next();
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// GET /api/gm/player/:id - Get player details
router.get('/player/:id', authenticate, requireGM, async function(req, res) {
  try {
    var user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    var character = await Character.findOne({ userId: req.params.id });
    
    res.json({
      user: user,
      character: character
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/gm/player/:id/refresh-energy - Refresh player energy
router.post('/player/:id/refresh-energy', authenticate, requireGM, async function(req, res) {
  try {
    var character = await Character.findOne({ userId: req.params.id });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    
    character.energy = 100;
    await character.save();
    
    res.json({ message: 'Energy refreshed to 100', character: character });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/gm/player/:id/heal - Full heal player
router.post('/player/:id/heal', authenticate, requireGM, async function(req, res) {
  try {
    var character = await Character.findOne({ userId: req.params.id });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    
    character.stats.hp = character.stats.maxHp;
    character.stats.mp = character.stats.maxMp;
    await character.save();
    
    res.json({ message: 'Player fully healed', character: character });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/gm/player/:id/add-gold - Add/remove gold
router.post('/player/:id/add-gold', authenticate, requireGM, async function(req, res) {
  try {
    var amount = req.body.amount;
    var character = await Character.findOne({ userId: req.params.id });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    
    character.gold = Math.max(0, character.gold + amount);
    await character.save();
    
    res.json({ message: 'Gold updated. New total: ' + character.gold, character: character });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/gm/player/:id/set-level - Set player level
router.post('/player/:id/set-level', authenticate, requireGM, async function(req, res) {
  try {
    var level = req.body.level;
    if (level < 1 || level > 200) return res.status(400).json({ error: 'Level must be 1-200' });
    
    var character = await Character.findOne({ userId: req.params.id });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    
    var oldLevel = character.level;
    character.level = level;
    
    // Adjust stat points based on level change (3 points per level)
    var levelDiff = level - oldLevel;
    character.statPoints = Math.max(0, character.statPoints + (levelDiff * 3));
    
    // Recalculate experience for level
    character.experience = 0;
    character.experienceToNextLevel = 100 + (level * 50);
    
    await character.save();
    
    res.json({ message: 'Level set to ' + level, character: character });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/gm/player/:id/edit-stats - Edit player stats
router.post('/player/:id/edit-stats', authenticate, requireGM, async function(req, res) {
  try {
    var stats = req.body.stats;
    var character = await Character.findOne({ userId: req.params.id });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    
    // Update individual stats
    if (stats.str !== undefined) character.stats.str = Math.max(1, stats.str);
    if (stats.agi !== undefined) character.stats.agi = Math.max(1, stats.agi);
    if (stats.dex !== undefined) character.stats.dex = Math.max(1, stats.dex);
    if (stats.int !== undefined) character.stats.int = Math.max(1, stats.int);
    if (stats.vit !== undefined) character.stats.vit = Math.max(1, stats.vit);
    
    // Recalculate HP and MP based on new stats
    character.stats.maxHp = character.stats.vit * 10 + 50;
    character.stats.maxMp = character.stats.int * 8 + 20;
    
    // Set current HP/MP to max
    character.stats.hp = character.stats.maxHp;
    character.stats.mp = character.stats.maxMp;
    
    await character.save();
    
    res.json({ message: 'Stats updated successfully', character: character });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/gm/player/:id/reset-stats - Reset stats to base class values
router.post('/player/:id/reset-stats', authenticate, requireGM, async function(req, res) {
  try {
    var character = await Character.findOne({ userId: req.params.id });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    
    // Base stats by class
    var baseStats = {
      swordsman: { str: 15, agi: 8, dex: 8, int: 5, vit: 14 },
      thief: { str: 8, agi: 15, dex: 12, int: 7, vit: 8 },
      archer: { str: 10, agi: 12, dex: 15, int: 6, vit: 7 },
      mage: { str: 5, agi: 7, dex: 8, int: 15, vit: 5 }
    };
    
    var base = baseStats[character.baseClass] || baseStats.swordsman;
    
    character.stats.str = base.str;
    character.stats.agi = base.agi;
    character.stats.dex = base.dex;
    character.stats.int = base.int;
    character.stats.vit = base.vit;
    
    // Recalculate HP/MP
    character.stats.maxHp = character.stats.vit * 10 + 50;
    character.stats.maxMp = character.stats.int * 8 + 20;
    character.stats.hp = character.stats.maxHp;
    character.stats.mp = character.stats.maxMp;
    
    // Refund stat points based on level (3 per level after 1)
    character.statPoints = (character.level - 1) * 3;
    
    await character.save();
    
    res.json({ message: 'Stats reset to base values. ' + character.statPoints + ' stat points refunded.', character: character });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/gm/player/:id/reset-progress - Reset tower progress
router.post('/player/:id/reset-progress', authenticate, requireGM, async function(req, res) {
  try {
    var character = await Character.findOne({ userId: req.params.id });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    
    character.currentTower = 1;
    character.currentFloor = 1;
    character.highestTowerCleared = 0;
    character.towerProgress = {};
    character.towerLockoutUntil = null;
    character.markModified('towerProgress');
    
    await character.save();
    
    res.json({ message: 'Tower progress reset', character: character });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/gm/player/:id/add-item - Add item to player inventory
router.post('/player/:id/add-item', authenticate, requireGM, async function(req, res) {
  try {
    var itemData = req.body;
    var character = await Character.findOne({ userId: req.params.id });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    
    // Check inventory space
    if (character.inventory.length >= character.inventorySize) {
      return res.status(400).json({ error: 'Player inventory is full' });
    }
    
    // Get item from database if itemId provided
    var item = null;
    if (itemData.itemId) {
      item = getItemById(itemData.itemId);
    }
    
    var newItem = {
      itemId: itemData.itemId || ('gm_item_' + Date.now()),
      name: itemData.name || (item ? item.name : 'Unknown Item'),
      icon: item ? item.icon : '📦',
      type: itemData.type || (item ? item.type : 'material'),
      subtype: item ? item.subtype : itemData.type,
      rarity: itemData.rarity || (item ? item.rarity : 'common'),
      quantity: itemData.quantity || 1,
      stackable: itemData.type === 'material' || itemData.type === 'consumable',
      stats: item ? item.stats : {},
      sellPrice: item ? (item.sellPrice || 10) : 10
    };
    
    // Check if stackable item already exists
    if (newItem.stackable) {
      var existingIndex = -1;
      for (var i = 0; i < character.inventory.length; i++) {
        if (character.inventory[i].itemId === newItem.itemId) {
          existingIndex = i;
          break;
        }
      }
      if (existingIndex >= 0) {
        character.inventory[existingIndex].quantity += newItem.quantity;
        await character.save();
        return res.json({ message: 'Added ' + newItem.quantity + 'x ' + newItem.name + ' (stacked)', character: character });
      }
    }
    
    character.inventory.push(newItem);
    await character.save();
    
    res.json({ message: 'Added ' + newItem.quantity + 'x ' + newItem.name, character: character });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/gm/player/:id/remove-item/:index - Remove item from inventory
router.delete('/player/:id/remove-item/:index', authenticate, requireGM, async function(req, res) {
  try {
    var index = parseInt(req.params.index);
    var character = await Character.findOne({ userId: req.params.id });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    
    if (index < 0 || index >= character.inventory.length) {
      return res.status(400).json({ error: 'Invalid item index' });
    }
    
    var removedItem = character.inventory[index];
    character.inventory.splice(index, 1);
    await character.save();
    
    res.json({ message: 'Removed ' + removedItem.name, character: character });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/gm/player/:id/clear-inventory - Clear all items
router.post('/player/:id/clear-inventory', authenticate, requireGM, async function(req, res) {
  try {
    var character = await Character.findOne({ userId: req.params.id });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    
    var count = character.inventory.length;
    character.inventory = [];
    await character.save();
    
    res.json({ message: 'Cleared ' + count + ' items from inventory', character: character });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/gm/player/:id/remove-hidden-class - Remove hidden class
router.post('/player/:id/remove-hidden-class', authenticate, requireGM, async function(req, res) {
  try {
    var character = await Character.findOne({ userId: req.params.id });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    
    if (character.hiddenClass === 'none') {
      return res.status(400).json({ error: 'Player has no hidden class' });
    }
    
    // Release the hidden class
    await HiddenClassOwnership.releaseClass(character.hiddenClass);
    
    // Remove hidden class skills
    var hiddenClassSkills = {
      flameblade: ['flame_slash', 'inferno_strike', 'fire_aura', 'volcanic_rage'],
      shadowDancer: ['shadow_strike', 'vanish', 'death_mark', 'shadow_dance'],
      stormRanger: ['lightning_arrow', 'chain_lightning', 'storm_eye', 'thunderstorm'],
      frostWeaver: ['frost_bolt', 'blizzard', 'ice_armor', 'absolute_zero']
    };
    
    var skillsToRemove = hiddenClassSkills[character.hiddenClass] || [];
    character.skills = character.skills.filter(function(s) {
      return skillsToRemove.indexOf(s.skillId) === -1;
    });
    
    var oldClass = character.hiddenClass;
    character.hiddenClass = 'none';
    await character.save();
    
    res.json({ message: 'Removed hidden class: ' + oldClass, character: character });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/gm/player/:id - Delete player
router.delete('/player/:id', authenticate, requireGM, async function(req, res) {
  try {
    var user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // Don't allow deleting admins
    if (user.role === 'admin') {
      return res.status(403).json({ error: 'Cannot delete admin accounts' });
    }
    
    // Get character to release hidden class
    var character = await Character.findOne({ userId: req.params.id });
    if (character && character.hiddenClass !== 'none') {
      await HiddenClassOwnership.releaseClass(character.hiddenClass);
    }
    
    // Delete character
    await Character.deleteOne({ userId: req.params.id });
    
    // Delete user
    await User.deleteOne({ _id: req.params.id });
    
    // Remove any trading listings
    await TradingListing.deleteMany({ sellerId: req.params.id });
    
    res.json({ message: 'Player ' + user.username + ' deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/gm/hidden-classes - Get all hidden class ownership status
router.get('/hidden-classes', authenticate, requireGM, async function(req, res) {
  try {
    var classes = ['flameblade', 'shadowDancer', 'stormRanger', 'frostWeaver'];
    var result = [];
    
    for (var i = 0; i < classes.length; i++) {
      var classId = classes[i];
      var ownership = await HiddenClassOwnership.findOne({ classId: classId });
      
      var ownerName = null;
      if (ownership && ownership.ownerId) {
        var ownerChar = await Character.findOne({ userId: ownership.ownerId });
        ownerName = ownerChar ? ownerChar.name : 'Unknown';
      }
      
      result.push({
        classId: classId,
        ownerId: ownership ? ownership.ownerId : null,
        ownerName: ownerName
      });
    }
    
    res.json({ classes: result });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/gm/trading - Get all trading listings
router.get('/trading', authenticate, requireGM, async function(req, res) {
  try {
    var listings = await TradingListing.find({ status: 'active' }).sort({ createdAt: -1 });
    
    // Get seller names
    var result = [];
    for (var i = 0; i < listings.length; i++) {
      var listing = listings[i];
      var seller = await Character.findOne({ userId: listing.sellerId });
      
      result.push({
        _id: listing._id,
        itemId: listing.itemId,
        itemName: listing.itemName,
        itemIcon: listing.itemIcon,
        itemType: listing.itemType,
        itemRarity: listing.itemRarity,
        quantity: listing.quantity,
        pricePerUnit: listing.pricePerUnit,
        totalPrice: listing.totalPrice,
        sellerId: listing.sellerId,
        characterName: seller ? seller.name : 'Unknown',
        createdAt: listing.createdAt
      });
    }
    
    res.json({ listings: result });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/gm/trading/:id - Remove trading listing and return item to seller
router.delete('/trading/:id', authenticate, requireGM, async function(req, res) {
  try {
    var listing = await TradingListing.findById(req.params.id);
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    
    // Try to return item to seller
    var seller = await Character.findOne({ userId: listing.sellerId });
    if (seller && seller.inventory.length < seller.inventorySize) {
      // Check if stackable
      var existingIndex = -1;
      for (var i = 0; i < seller.inventory.length; i++) {
        if (seller.inventory[i].itemId === listing.itemId && seller.inventory[i].stackable) {
          existingIndex = i;
          break;
        }
      }
      
      if (existingIndex >= 0) {
        seller.inventory[existingIndex].quantity += listing.quantity;
      } else {
        seller.inventory.push({
          itemId: listing.itemId,
          name: listing.itemName,
          icon: listing.itemIcon || '📦',
          type: listing.itemType || 'material',
          subtype: listing.itemSubtype || listing.itemType,
          rarity: listing.itemRarity || 'common',
          quantity: listing.quantity,
          stackable: listing.itemType === 'material' || listing.itemType === 'consumable',
          stats: listing.itemStats || {},
          sellPrice: 10
        });
      }
      await seller.save();
    }
    
    // Remove listing
    await TradingListing.deleteOne({ _id: req.params.id });
    
    res.json({ message: 'Listing removed' + (seller ? ' and item returned to ' + seller.name : '') });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
