import express from 'express';
import Character from '../models/Character.js';
import User from '../models/User.js';
import HiddenClassOwnership from '../models/HiddenClassOwnership.js';
import { authenticate, requireGM } from '../middleware/auth.js';

const router = express.Router();

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
    
    // Refund stat points based on level
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

// POST /api/gm/player/:id/add-item - Add item to inventory
router.post('/player/:id/add-item', authenticate, requireGM, async (req, res) => {
  try {
    const { itemId, name, type, rarity, quantity, stats } = req.body;
    const character = await Character.findOne({ userId: req.params.id });
    
    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }
    
    if (character.inventory.length >= character.inventorySize) {
      return res.status(400).json({ error: 'Inventory is full' });
    }
    
    character.inventory.push({
      itemId,
      name,
      type: type || 'item',
      rarity: rarity || 'common',
      quantity: quantity || 1,
      stats: stats || {}
    });
    
    await character.save();
    
    res.json({
      message: `Added ${name} to inventory`,
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
      inventory: character.inventory
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
    
    // Remove class from character
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
    
    // Don't allow deleting admins or self
    if (user.role === 'admin') {
      return res.status(403).json({ error: 'Cannot delete admin accounts' });
    }
    
    if (user._id.equals(req.user._id)) {
      return res.status(403).json({ error: 'Cannot delete your own account' });
    }
    
    // Get character to release hidden class if any
    const character = await Character.findOne({ userId: user._id });
    if (character && character.hiddenClass !== 'none') {
      await HiddenClassOwnership.releaseClass(character.hiddenClass, character._id);
    }
    
    // Delete character
    await Character.deleteOne({ userId: user._id });
    
    // Delete user
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
    character.experienceToNextLevel = character.calculateExpToLevel(level);
    
    // Adjust stat points
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
    
    // Get seller info for each listing
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
    
    // Check if seller still exists
    const seller = await Character.findOne({ userId: listing.sellerId });
    
    if (seller) {
      // Return item to seller's inventory
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
      
      // Delete listing
      await TradingListing.findByIdAndDelete(req.params.id);
      
      res.json({
        message: 'Listing removed. Item returned to player inventory.',
        returnedTo: seller.name
      });
    } else {
      // Seller doesn't exist, just delete the listing
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
