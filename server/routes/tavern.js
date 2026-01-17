import express from 'express';
import Character from '../models/Character.js';
import { TavernShop, TradingListing } from '../models/Tavern.js';
import HiddenClassOwnership from '../models/HiddenClassOwnership.js';
import { authenticate, requireGM } from '../middleware/auth.js';
// Import from Equipment Database v2
import { 
  EQUIPMENT, 
  CONSUMABLES,
  getEquipmentById
} from '../data/equipment/index.js';
import { 
  HIDDEN_CLASS_SCROLLS, 
  HIDDEN_CLASS_SCROLL_HELPERS,
  MEMORY_CRYSTAL,
  MEMORY_CRYSTAL_FRAGMENT
} from '../data/equipment/special_items.js';
import { HIDDEN_CLASS_INFO } from '../data/storyData.js';
import { HIDDEN_CLASS_SKILLS } from '../models/Character.js';

const router = express.Router();

// ============ CONSUMABLES HELPER ============
// Convert CONSUMABLES to object keyed by id for easy lookup
const CONSUMABLES_BY_ID = {};
if (Array.isArray(CONSUMABLES)) {
  CONSUMABLES.forEach(c => { CONSUMABLES_BY_ID[c.id] = c; });
} else if (typeof CONSUMABLES === 'object') {
  Object.assign(CONSUMABLES_BY_ID, CONSUMABLES);
}

// ============ ITEM DATABASE HELPERS ============
// Get item by ID from equipment database or consumables
function getItemById(itemId) {
  // Check equipment first
  const equipment = getEquipmentById ? getEquipmentById(itemId) : (EQUIPMENT ? EQUIPMENT[itemId] : null);
  if (equipment) return equipment;
  
  // Check consumables
  if (CONSUMABLES_BY_ID[itemId]) return CONSUMABLES_BY_ID[itemId];
  
  // Check special items
  if (HIDDEN_CLASS_SCROLLS) {
    const scroll = Object.values(HIDDEN_CLASS_SCROLLS).find(s => s.id === itemId);
    if (scroll) return scroll;
  }
  
  // Check memory crystal
  if (MEMORY_CRYSTAL && MEMORY_CRYSTAL.id === itemId) return MEMORY_CRYSTAL;
  if (MEMORY_CRYSTAL_FRAGMENT && MEMORY_CRYSTAL_FRAGMENT.id === itemId) return MEMORY_CRYSTAL_FRAGMENT;
  
  return null;
}

// Search items
function searchItems(query) {
  const results = [];
  const q = query.toLowerCase();
  
  // Search equipment
  if (EQUIPMENT) {
    Object.values(EQUIPMENT).forEach(item => {
      if (item.name.toLowerCase().includes(q) || item.id.toLowerCase().includes(q)) {
        results.push(item);
      }
    });
  }
  
  // Search consumables
  Object.values(CONSUMABLES_BY_ID).forEach(item => {
    if (item.name.toLowerCase().includes(q) || item.id.toLowerCase().includes(q)) {
      results.push(item);
    }
  });
  
  return results.slice(0, 50);
}

// Get all items
function getAllItems() {
  const items = [];
  if (EQUIPMENT) items.push(...Object.values(EQUIPMENT));
  items.push(...Object.values(CONSUMABLES_BY_ID));
  return items;
}

// ============ INVENTORY HELPERS ============

// Add item to inventory with stacking
function addItemToInventory(character, itemId, quantity, itemData) {
  var item = itemData || getItemById(itemId);
  if (!item) return { success: false, error: 'Item not found' };

  // Check if stackable and exists
  if (item.stackable) {
    var existingIndex = character.inventory.findIndex(function(i) { return i.itemId === itemId; });
    if (existingIndex >= 0) {
      var newQty = character.inventory[existingIndex].quantity + quantity;
      if (newQty <= (item.maxStack || 999)) {
        character.inventory[existingIndex].quantity = newQty;
        return { success: true, stacked: true };
      }
    }
  }

  // Add as new item
  if (character.inventory.length >= character.inventorySize) {
    return { success: false, error: 'Inventory full' };
  }

  // PHASE 9.3 FIX: Include setId for set bonus tracking
  character.inventory.push({
    itemId: item.id || itemId,
    name: item.name,
    icon: item.icon || '📦',
    type: item.type,
    subtype: item.subtype,
    rarity: item.rarity || 'common',
    quantity: quantity,
    stackable: item.stackable || false,
    stats: item.stats || {},
    setId: item.setId || null  // PHASE 9.3 FIX: Include setId!
  });

  return { success: true, stacked: false };
}

// Remove item from inventory
function removeItemFromInventory(character, itemId, quantity) {
  var index = character.inventory.findIndex(function(i) { return i.itemId === itemId; });
  if (index === -1) return { success: false, error: 'Item not found' };

  var item = character.inventory[index];
  if (item.quantity < quantity) return { success: false, error: 'Not enough items' };

  if (item.quantity === quantity) {
    character.inventory.splice(index, 1);
  } else {
    character.inventory[index].quantity -= quantity;
  }

  return { success: true };
}

// Helper function to get item data from inventory or database
function getItemDataFromInventoryOrDB(itemId, invItem) {
  // First try database
  var dbItem = getItemById(itemId);
  if (dbItem) return dbItem;
  
  // If not in database, use inventory item data (for dynamically generated equipment)
  if (invItem) {
    return {
      id: invItem.itemId,
      name: invItem.name,
      icon: invItem.icon || '📦',
      type: invItem.type,
      subtype: invItem.subtype,
      rarity: invItem.rarity || 'common',
      stackable: invItem.stackable || false,
      stats: invItem.stats || {},
      setId: invItem.setId || null,  // PHASE 9.3 FIX: Include setId
      sellPrice: calculateSellPrice(invItem),
      buyPrice: 0
    };
  }
  
  return null;
}

// Calculate sell price for items not in database
function calculateSellPrice(item) {
  if (!item) return 0;
  
  // Base price by rarity
  var rarityPrices = {
    common: 5,
    uncommon: 15,
    rare: 50,
    epic: 150,
    legendary: 500
  };
  
  var basePrice = rarityPrices[item.rarity] || 5;
  
  // Add stat value
  if (item.stats) {
    var statTotal = 0;
    var statKeys = Object.keys(item.stats);
    for (var i = 0; i < statKeys.length; i++) {
      statTotal += item.stats[statKeys[i]] || 0;
    }
    basePrice += statTotal * 2;
  }
  
  return basePrice;
}

// ============ ITEM DATABASE ROUTES ============

// GET /api/tavern/items/search - Search items
router.get('/items/search', authenticate, async function(req, res) {
  try {
    var q = req.query.q;
    if (!q || q.length < 1) {
      return res.json({ items: getAllItems().slice(0, 20) });
    }
    var items = searchItems(q);
    res.json({ items: items });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/tavern/items/all - Get all items
router.get('/items/all', authenticate, async function(req, res) {
  try {
    res.json({ items: getAllItems() });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ============ TAVERN SHOP ROUTES ============

// Helper: Populate shop with consumables from database
async function populateShopWithConsumables(shop) {
  // Default consumables to add to shop
  const defaultShopItems = [
    // Health Potions
    { id: 'small_health_potion', price: 50 },
    { id: 'medium_health_potion', price: 150 },
    { id: 'large_health_potion', price: 400 },
    { id: 'mega_health_potion', price: 1000 },
    // Mana Potions
    { id: 'small_mana_potion', price: 40 },
    { id: 'medium_mana_potion', price: 120 },
    { id: 'large_mana_potion', price: 320 },
    { id: 'mega_mana_potion', price: 800 },
    // Utility
    { id: 'antidote', price: 30 },
    { id: 'escape_rope', price: 100 },
    { id: 'energy_drink', price: 200 },
    // Buffs
    { id: 'strength_elixir', price: 300 },
    { id: 'intelligence_elixir', price: 300 },
    { id: 'iron_skin_potion', price: 250 },
    { id: 'swift_potion', price: 250 },
    { id: 'critical_draught', price: 400 }
  ];
  
  let addedCount = 0;
  
  for (const shopDef of defaultShopItems) {
    // Skip if already in shop
    const exists = shop.items.some(i => i.itemId === shopDef.id);
    if (exists) continue;
    
    // Try to find in consumables database
    const itemData = CONSUMABLES_BY_ID[shopDef.id];
    if (itemData) {
      shop.items.push({
        itemId: itemData.id,
        name: itemData.name,
        icon: itemData.icon || '🧪',
        type: itemData.type || 'consumable',
        subtype: itemData.subtype,
        rarity: itemData.rarity || 'common',
        price: shopDef.price || itemData.buyPrice || 50,
        stock: -1, // Unlimited
        isActive: true
      });
      addedCount++;
    }
  }
  
  if (addedCount > 0) {
    shop.lastUpdated = new Date();
    await shop.save();
    console.log(`[Shop] Added ${addedCount} consumables to shop`);
  }
  
  return shop;
}

// GET /api/tavern/shop - Get shop items
router.get('/shop', authenticate, async function(req, res) {
  try {
    var shop = await TavernShop.findOne();
    if (!shop) {
      shop = await TavernShop.initializeShop();
    }
    
    // Auto-populate with consumables if shop is empty or missing items
    if (shop.items.length < 10) {
      shop = await populateShopWithConsumables(shop);
    }
    
    res.json({ items: shop.items.filter(function(i) { return i.isActive; }) });
  } catch (error) {
    console.error('Get shop error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/tavern/shop/buy - Buy from shop
router.post('/shop/buy', authenticate, async function(req, res) {
  try {
    var itemId = req.body.itemId;
    var quantity = req.body.quantity;
    if (!itemId || !quantity || quantity < 1) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    var character = await Character.findOne({ userId: req.userId });
    if (!character) return res.status(404).json({ error: 'Character not found' });

    var shop = await TavernShop.findOne();
    var shopItem = shop.items.find(function(i) { return i.itemId === itemId && i.isActive; });
    if (!shopItem) return res.status(404).json({ error: 'Item not in shop' });

    var totalCost = shopItem.price * quantity;
    if (character.gold < totalCost) {
      return res.status(400).json({ error: 'Not enough gold. Need ' + totalCost + ', have ' + character.gold });
    }

    // Check stock
    if (shopItem.stock !== -1 && shopItem.stock < quantity) {
      return res.status(400).json({ error: 'Not enough stock' });
    }

    // Add item with stacking
    var itemData = getItemById(itemId);
    var result = addItemToInventory(character, itemId, quantity, itemData);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    // Deduct gold
    character.gold -= totalCost;

    // Update stock if limited
    if (shopItem.stock !== -1) {
      shopItem.stock -= quantity;
      await shop.save();
    }

    await character.save();

    res.json({
      message: 'Purchased ' + quantity + 'x ' + shopItem.name + ' for ' + totalCost + ' gold',
      gold: character.gold,
      inventory: character.inventory
    });
  } catch (error) {
    console.error('Shop buy error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/tavern/shop/sell - Sell to shop
router.post('/shop/sell', authenticate, async function(req, res) {
  try {
    var itemId = req.body.itemId;
    var quantity = req.body.quantity;
    if (!itemId || !quantity || quantity < 1) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    var character = await Character.findOne({ userId: req.userId });
    if (!character) return res.status(404).json({ error: 'Character not found' });

    // Find item in inventory first
    var invItem = character.inventory.find(function(i) { return i.itemId === itemId; });
    if (!invItem) {
      return res.status(400).json({ error: 'Item not found in inventory' });
    }

    // Get item data from DB or inventory
    var itemData = getItemDataFromInventoryOrDB(itemId, invItem);
    if (!itemData) {
      return res.status(400).json({ error: 'Item data not found' });
    }

    // Check if item can be sold
    if (itemData.sellPrice === 0 || itemData.type === 'scroll' || itemData.type === 'special') {
      return res.status(400).json({ error: 'This item cannot be sold' });
    }

    var result = removeItemFromInventory(character, itemId, quantity);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    var totalGold = itemData.sellPrice * quantity;
    character.gold += totalGold;
    await character.save();

    res.json({
      message: 'Sold ' + quantity + 'x ' + itemData.name + ' for ' + totalGold + ' gold',
      gold: character.gold,
      inventory: character.inventory
    });
  } catch (error) {
    console.error('Shop sell error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============ TRADING STALL ROUTES ============

// GET /api/tavern/trading - Get all active listings
router.get('/trading', authenticate, async function(req, res) {
  try {
    var listings = await TradingListing.find({ isActive: true })
      .sort({ listedAt: -1 })
      .limit(100);
    res.json({ listings: listings });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/tavern/trading/my - Get my listings
router.get('/trading/my', authenticate, async function(req, res) {
  try {
    var listings = await TradingListing.find({ sellerId: req.userId, isActive: true });
    res.json({ listings: listings });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/tavern/trading/list - List item for sale
router.post('/trading/list', authenticate, async function(req, res) {
  try {
    var itemId = req.body.itemId;
    var quantity = req.body.quantity;
    var pricePerUnit = req.body.pricePerUnit;
    
    if (!itemId || !quantity || !pricePerUnit || quantity < 1 || pricePerUnit < 1) {
      return res.status(400).json({ error: 'Invalid request - missing itemId, quantity, or price' });
    }

    var character = await Character.findOne({ userId: req.userId });
    if (!character) return res.status(404).json({ error: 'Character not found' });

    // Check if player has the item
    var invItem = character.inventory.find(function(i) { return i.itemId === itemId; });
    if (!invItem || invItem.quantity < quantity) {
      return res.status(400).json({ error: 'Not enough items in inventory' });
    }

    // Get item data from DB or inventory
    var itemData = getItemDataFromInventoryOrDB(itemId, invItem);
    
    // Cannot sell scrolls or memory crystals
    if (itemData && (itemData.type === 'scroll' || itemData.id === 'memory_crystal' || itemData.type === 'special')) {
      return res.status(400).json({ error: 'This item cannot be traded' });
    }

    // Remove from inventory
    var result = removeItemFromInventory(character, itemId, quantity);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    // Create listing using inventory item data (more reliable than DB for dynamic items)
    var listing = await TradingListing.create({
      sellerId: req.userId,
      sellerName: req.user.username,
      characterName: character.name,
      itemId: invItem.itemId,
      itemName: invItem.name,
      itemIcon: invItem.icon || '📦',
      itemType: invItem.type,
      itemSubtype: invItem.subtype || '',
      itemRarity: invItem.rarity || 'common',
      itemStats: invItem.stats || {},
      quantity: quantity,
      pricePerUnit: pricePerUnit,
      totalPrice: quantity * pricePerUnit
    });

    await character.save();

    res.json({
      message: 'Listed ' + quantity + 'x ' + invItem.name + ' for ' + (quantity * pricePerUnit) + ' gold',
      listing: listing,
      inventory: character.inventory
    });
  } catch (error) {
    console.error('Trading list error:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// POST /api/tavern/trading/buy/:listingId - Buy from player
router.post('/trading/buy/:listingId', authenticate, async function(req, res) {
  try {
    var quantity = req.body.quantity;
    var listing = await TradingListing.findById(req.params.listingId);

    if (!listing || !listing.isActive) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    if (listing.sellerId.equals(req.userId)) {
      return res.status(400).json({ error: 'Cannot buy your own listing' });
    }

    var buyQty = quantity || listing.quantity;
    if (buyQty > listing.quantity) {
      return res.status(400).json({ error: 'Not enough quantity available' });
    }

    var buyer = await Character.findOne({ userId: req.userId });
    if (!buyer) return res.status(404).json({ error: 'Character not found' });

    var totalCost = listing.pricePerUnit * buyQty;
    if (buyer.gold < totalCost) {
      return res.status(400).json({ error: 'Not enough gold' });
    }

    // Get seller
    var seller = await Character.findOne({ userId: listing.sellerId });

    // Transfer gold
    buyer.gold -= totalCost;
    if (seller) {
      seller.gold += totalCost;
      await seller.save();
    }

    // Build item data from listing (includes dynamically generated items)
    var itemData = {
      id: listing.itemId,
      name: listing.itemName,
      icon: listing.itemIcon || '📦',
      type: listing.itemType,
      subtype: listing.itemSubtype || '',
      rarity: listing.itemRarity || 'common',
      stackable: listing.itemType === 'material' || listing.itemType === 'consumable',
      stats: listing.itemStats || {}
    };

    var result = addItemToInventory(buyer, listing.itemId, buyQty, itemData);
    if (!result.success) {
      // Refund
      buyer.gold += totalCost;
      if (seller) {
        seller.gold -= totalCost;
        await seller.save();
      }
      return res.status(400).json({ error: result.error });
    }

    // Update listing
    if (buyQty >= listing.quantity) {
      listing.isActive = false;
      listing.quantity = 0;
    } else {
      listing.quantity -= buyQty;
      listing.totalPrice = listing.quantity * listing.pricePerUnit;
    }
    await listing.save();
    await buyer.save();

    res.json({
      message: 'Purchased ' + buyQty + 'x ' + listing.itemName + ' for ' + totalCost + ' gold',
      gold: buyer.gold,
      inventory: buyer.inventory
    });
  } catch (error) {
    console.error('Trading buy error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/tavern/trading/:listingId - Cancel listing
router.delete('/trading/:listingId', authenticate, async function(req, res) {
  try {
    var listing = await TradingListing.findById(req.params.listingId);

    if (!listing || !listing.isActive) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    if (!listing.sellerId.equals(req.userId)) {
      return res.status(403).json({ error: 'Not your listing' });
    }

    var character = await Character.findOne({ userId: req.userId });

    // Build item data from listing
    var itemData = {
      id: listing.itemId,
      name: listing.itemName,
      icon: listing.itemIcon || '📦',
      type: listing.itemType,
      subtype: listing.itemSubtype || '',
      rarity: listing.itemRarity || 'common',
      stackable: listing.itemType === 'material' || listing.itemType === 'consumable',
      stats: listing.itemStats || {}
    };

    var result = addItemToInventory(character, listing.itemId, listing.quantity, itemData);
    if (!result.success) {
      return res.status(400).json({ error: 'Cannot return items: ' + result.error });
    }

    listing.isActive = false;
    await listing.save();
    await character.save();

    res.json({
      message: 'Listing cancelled. Items returned to inventory.',
      inventory: character.inventory
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ============ INVENTORY MANAGEMENT ============

// POST /api/tavern/inventory/use - Use consumable item
router.post('/inventory/use', authenticate, async function(req, res) {
  try {
    var itemId = req.body.itemId;
    var character = await Character.findOne({ userId: req.userId });
    if (!character) return res.status(404).json({ error: 'Character not found' });

    // Find item in inventory first
    var invItem = character.inventory.find(function(i) { return i.itemId === itemId; });
    if (!invItem) {
      return res.status(400).json({ error: 'Item not found in inventory' });
    }

    // Get item data from database or inventory
    var itemData = getItemById(itemId);
    
    // Check if item can be used (consumable type or has effect)
    var canUse = (itemData && (itemData.usable || itemData.type === 'consumable' || itemData.effect)) ||
                 (invItem && (invItem.type === 'consumable' || invItem.effect));
    
    if (!canUse) {
      return res.status(400).json({ error: 'Item cannot be used' });
    }

    // Use effect from database or inventory item
    var effect = (itemData && itemData.effect) || invItem.effect;

    var result = removeItemFromInventory(character, itemId, 1);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    // Apply effect
    var message = '';
    var itemName = (itemData && itemData.name) || invItem.name || 'Item';
    
    if (effect) {
      switch (effect.type) {
        case 'heal':
          var healAmt = effect.value || 100;
          character.stats.hp = Math.min(character.stats.hp + healAmt, character.stats.maxHp);
          message = 'Restored ' + healAmt + ' HP';
          break;
        case 'mana':
          var manaAmt = effect.value || 50;
          character.stats.mp = Math.min(character.stats.mp + manaAmt, character.stats.maxMp);
          message = 'Restored ' + manaAmt + ' MP';
          break;
        case 'energy':
          var energyAmt = effect.value || 20;
          character.energy = Math.min(character.energy + energyAmt, 100);
          message = 'Restored ' + energyAmt + ' Energy';
          break;
        case 'exp':
          var expAmt = effect.value || 100;
          character.experience += expAmt;
          // Check for level up
          var levelsGained = character.checkLevelUp ? character.checkLevelUp() : 0;
          message = 'Gained ' + expAmt + ' EXP' + (levelsGained > 0 ? ' and leveled up!' : '');
          break;
        case 'cure':
          // Remove status effects (poison, etc)
          message = 'Cured status effects';
          break;
        default:
          message = 'Used ' + itemName;
      }
    } else {
      message = 'Used ' + itemName;
    }

    await character.save();

    res.json({
      message: message,
      character: {
        hp: character.stats.hp,
        maxHp: character.stats.maxHp,
        mp: character.stats.mp,
        maxMp: character.stats.maxMp,
        energy: character.energy,
        level: character.level,
        experience: character.experience
      },
      inventory: character.inventory
    });
  } catch (error) {
    console.error('Use item error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/tavern/inventory/split - Split stack
router.post('/inventory/split', authenticate, async function(req, res) {
  try {
    var itemId = req.body.itemId;
    var quantity = req.body.quantity;
    var character = await Character.findOne({ userId: req.userId });
    if (!character) return res.status(404).json({ error: 'Character not found' });

    var index = character.inventory.findIndex(function(i) { return i.itemId === itemId; });
    if (index === -1) return res.status(400).json({ error: 'Item not found' });

    var item = character.inventory[index];
    if (item.quantity <= quantity || quantity < 1) {
      return res.status(400).json({ error: 'Invalid split quantity' });
    }

    if (character.inventory.length >= character.inventorySize) {
      return res.status(400).json({ error: 'Inventory full' });
    }

    // Reduce original stack
    character.inventory[index].quantity -= quantity;

    // Create new stack
    var newItem = {
      itemId: item.itemId,
      name: item.name,
      icon: item.icon,
      type: item.type,
      subtype: item.subtype,
      rarity: item.rarity,
      quantity: quantity,
      stackable: item.stackable,
      stats: item.stats,
      setId: item.setId || null  // PHASE 9.3 FIX: Preserve setId when splitting
    };
    character.inventory.push(newItem);

    await character.save();

    res.json({
      message: 'Split ' + quantity + 'x ' + item.name,
      inventory: character.inventory
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/tavern/inventory/combine - Combine stacks
router.post('/inventory/combine', authenticate, async function(req, res) {
  try {
    var itemId = req.body.itemId;
    var character = await Character.findOne({ userId: req.userId });
    if (!character) return res.status(404).json({ error: 'Character not found' });

    // Find item in inventory to check stackable
    var invItem = character.inventory.find(function(i) { return i.itemId === itemId; });
    if (!invItem || !invItem.stackable) {
      return res.status(400).json({ error: 'Item cannot be stacked' });
    }

    // Get max stack from database or default
    var itemData = getItemById(itemId);
    var maxStack = (itemData && itemData.maxStack) ? itemData.maxStack : 999;

    // Find all stacks of this item
    var indices = [];
    var totalQty = 0;
    character.inventory.forEach(function(item, idx) {
      if (item.itemId === itemId) {
        indices.push(idx);
        totalQty += item.quantity;
      }
    });

    if (indices.length <= 1) {
      return res.status(400).json({ error: 'Nothing to combine' });
    }

    // Remove all but first, set first to total
    var firstIndex = indices[0];

    // Remove from end to not mess up indices
    for (var i = indices.length - 1; i > 0; i--) {
      character.inventory.splice(indices[i], 1);
    }

    // Set combined quantity (cap at max stack)
    character.inventory[firstIndex].quantity = Math.min(totalQty, maxStack);

    await character.save();

    res.json({
      message: 'Combined ' + totalQty + 'x ' + invItem.name,
      inventory: character.inventory
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/tavern/inventory/:itemId - Remove/discard item
router.delete('/inventory/:itemId', authenticate, async function(req, res) {
  try {
    var quantity = req.body.quantity;
    var character = await Character.findOne({ userId: req.userId });
    if (!character) return res.status(404).json({ error: 'Character not found' });

    var result = removeItemFromInventory(character, req.params.itemId, quantity || 1);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    await character.save();

    res.json({
      message: 'Discarded item',
      inventory: character.inventory
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ============ EQUIPMENT ROUTES ============

// POST /api/tavern/equip - Equip item
router.post('/equip', authenticate, async function(req, res) {
  try {
    var itemId = req.body.itemId;
    var character = await Character.findOne({ userId: req.userId });
    if (!character) return res.status(404).json({ error: 'Character not found' });

    // Find item in inventory first
    var invIndex = character.inventory.findIndex(function(i) { return i.itemId === itemId; });
    if (invIndex === -1) {
      return res.status(400).json({ error: 'Item not in inventory' });
    }
    var invItem = character.inventory[invIndex];

    // Get item data from DB or inventory
    var itemData = getItemDataFromInventoryOrDB(itemId, invItem);
    if (!itemData || !itemData.equippable) {
      // Check if inventory item is equippable (for dynamic equipment)
      if (invItem.type !== 'equipment') {
        return res.status(400).json({ error: 'Item cannot be equipped' });
      }
      // Use inventory data for dynamic equipment
      // PHASE 9.3.1 FIX: Complete slot mapping for all equipment subtypes
      var slotFromSubtype = function(subtype) {
        var mapping = {
          'weapon': 'rightHand',
          'mainHand': 'rightHand',
          'shield': 'leftHand',
          'cape': 'leftHand',
          'armor': 'body',
          'body': 'body',
          'head': 'head',
          'helmet': 'head',
          'hands': 'leg',
          'gloves': 'leg',
          'gauntlets': 'leg',
          'feet': 'shoes',
          'boots': 'shoes',
          'ring': 'ring',
          'necklace': 'necklace',
          'pendant': 'necklace',
          'accessory': 'ring'
        };
        return mapping[subtype] || mapping[subtype.toLowerCase()] || 'body';
      };
      
      itemData = {
        id: invItem.itemId,
        name: invItem.name,
        icon: invItem.icon || '📦',
        type: invItem.type,
        subtype: invItem.subtype,
        slot: slotFromSubtype(invItem.subtype || 'body'),
        rarity: invItem.rarity,
        stats: invItem.stats || {},
        classReq: invItem.classReq,
        setId: invItem.setId || null,
        equippable: true
      };
    }

    // Check class requirement
    if (itemData.classReq && itemData.classReq !== character.baseClass) {
      return res.status(400).json({ error: 'Wrong class for this item' });
    }

    var slot = itemData.slot;
    if (!slot) return res.status(400).json({ error: 'Invalid equipment slot' });

    // Unequip current item in slot (if any)
    var currentEquip = character.equipment[slot];
    if (currentEquip && currentEquip.itemId) {
      // Add current to inventory - PHASE 9.3.1 FIX: Include subtype
      // Derive subtype from slot if not stored
      var deriveSubtype = function(slotName) {
        var mapping = {
          'rightHand': 'weapon',
          'leftHand': 'cape',
          'body': 'armor',
          'head': 'head',
          'leg': 'hands',
          'shoes': 'feet',
          'ring': 'ring',
          'necklace': 'necklace'
        };
        return mapping[slotName] || 'equipment';
      };
      
      var currentItemData = getItemById(currentEquip.itemId) || {
        id: currentEquip.itemId,
        name: currentEquip.name,
        icon: currentEquip.icon || '📦',
        type: currentEquip.type || 'equipment',
        subtype: currentEquip.subtype || deriveSubtype(slot),
        rarity: currentEquip.rarity,
        stats: currentEquip.stats,
        setId: currentEquip.setId || null,
        stackable: false
      };
      addItemToInventory(character, currentEquip.itemId, 1, currentItemData);
    }

    // Equip new item - PHASE 9.3.1 FIX: Store subtype for proper unequip
    character.equipment[slot] = {
      itemId: itemData.id || itemId,
      name: itemData.name,
      icon: itemData.icon,
      type: itemData.type,
      subtype: itemData.subtype,  // PHASE 9.3.1 FIX: Store subtype!
      rarity: itemData.rarity,
      stats: itemData.stats,
      setId: itemData.setId || null
    };

    // Remove from inventory
    if (character.inventory[invIndex].quantity > 1) {
      character.inventory[invIndex].quantity -= 1;
    } else {
      character.inventory.splice(invIndex, 1);
    }

    await character.save();

    res.json({
      message: 'Equipped ' + itemData.name,
      equipment: character.equipment,
      inventory: character.inventory
    });
  } catch (error) {
    console.error('Equip error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/tavern/unequip - Unequip item
router.post('/unequip', authenticate, async function(req, res) {
  try {
    var slot = req.body.slot;
    var character = await Character.findOne({ userId: req.userId });
    if (!character) return res.status(404).json({ error: 'Character not found' });

    var currentEquip = character.equipment[slot];
    if (!currentEquip || !currentEquip.itemId) {
      return res.status(400).json({ error: 'Nothing equipped in that slot' });
    }

    // Add to inventory - PHASE 9.3.1 FIX: Preserve subtype for re-equipping
    // Derive subtype from slot if not stored
    var deriveSubtypeFromSlot = function(slotName) {
      var mapping = {
        'rightHand': 'weapon',
        'leftHand': 'cape',
        'body': 'armor',
        'head': 'head',
        'leg': 'hands',
        'shoes': 'feet',
        'ring': 'ring',
        'necklace': 'necklace'
      };
      return mapping[slotName] || 'equipment';
    };
    
    var itemData = getItemById(currentEquip.itemId) || {
      id: currentEquip.itemId,
      name: currentEquip.name,
      icon: currentEquip.icon || '📦',
      type: currentEquip.type || 'equipment',
      subtype: currentEquip.subtype || deriveSubtypeFromSlot(slot),
      rarity: currentEquip.rarity,
      stats: currentEquip.stats,
      setId: currentEquip.setId || null,
      stackable: false
    };
    var result = addItemToInventory(character, currentEquip.itemId, 1, itemData);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    // Clear slot
    character.equipment[slot] = {
      itemId: null,
      name: null,
      type: null,
      subtype: null,  // PHASE 9.3.1 FIX: Clear subtype too
      rarity: null,
      stats: null,
      setId: null
    };

    await character.save();

    res.json({
      message: 'Unequipped ' + currentEquip.name,
      equipment: character.equipment,
      inventory: character.inventory
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ============ CRAFTING ============

// POST /api/tavern/craft/memory-crystal - Craft Memory Crystal
router.post('/craft/memory-crystal', authenticate, async function(req, res) {
  try {
    var character = await Character.findOne({ userId: req.userId });
    if (!character) return res.status(404).json({ error: 'Character not found' });

    // Check fragments
    var fragIndex = character.inventory.findIndex(function(i) { return i.itemId === 'memory_crystal_fragment'; });
    if (fragIndex === -1 || character.inventory[fragIndex].quantity < 15) {
      var have = fragIndex >= 0 ? character.inventory[fragIndex].quantity : 0;
      return res.status(400).json({ error: 'Need 15 Memory Crystal Fragments. Have: ' + have });
    }

    // Remove fragments
    character.inventory[fragIndex].quantity -= 15;
    if (character.inventory[fragIndex].quantity === 0) {
      character.inventory.splice(fragIndex, 1);
    }

    // Add Memory Crystal
    var itemData = getItemById('memory_crystal');
    addItemToInventory(character, 'memory_crystal', 1, itemData);

    await character.save();

    res.json({
      message: 'Crafted Memory Crystal!',
      inventory: character.inventory
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/tavern/use-memory-crystal - Remove hidden class, return scroll
router.post('/use-memory-crystal', authenticate, async function(req, res) {
  try {
    var character = await Character.findOne({ userId: req.userId });
    if (!character) return res.status(404).json({ error: 'Character not found' });

    if (character.hiddenClass === 'none') {
      return res.status(400).json({ error: 'You have no hidden class to remove' });
    }

    // Check Memory Crystal
    var crystalIndex = character.inventory.findIndex(function(i) { return i.itemId === 'memory_crystal'; });
    if (crystalIndex === -1) {
      return res.status(400).json({ error: 'You need a Memory Crystal!' });
    }

    // Remove Memory Crystal
    if (character.inventory[crystalIndex].quantity > 1) {
      character.inventory[crystalIndex].quantity -= 1;
    } else {
      character.inventory.splice(crystalIndex, 1);
    }

    // Release class ownership
    await HiddenClassOwnership.releaseClass(character.hiddenClass, character._id);

    // Get scroll ID for the hidden class (all 20 classes)
    var scrollId = 'scroll_' + character.hiddenClass.toLowerCase();
    
    // Try to get scroll data from HIDDEN_CLASS_SCROLLS
    var scrollData = null;
    if (HIDDEN_CLASS_SCROLLS) {
      scrollData = Object.values(HIDDEN_CLASS_SCROLLS).find(s => s.hiddenClass === character.hiddenClass);
    }
    
    if (!scrollData) {
      // Fallback scroll data
      scrollData = {
        id: scrollId,
        name: character.hiddenClass + ' Awakening Scroll',
        icon: '📜',
        type: 'hidden_class_scroll',
        rarity: 'legendary',
        stackable: false
      };
    }

    // Add scroll back to inventory
    addItemToInventory(character, scrollData.id || scrollId, 1, scrollData);

    var oldClass = character.hiddenClass;

    // Remove hidden class and skills
    character.hiddenClass = 'none';
    character.hiddenClassUnlocked = false;
    character.element = 'none';

    var baseSkillIds = [
      'slash', 'heavyStrike', 'shieldBash', 'warCry',
      'backstab', 'poisonBlade', 'smokeScreen', 'steal',
      'preciseShot', 'multiShot', 'eagleEye', 'arrowRain',
      'fireball', 'iceSpear', 'manaShield', 'thunderbolt'
    ];
    character.skills = character.skills.filter(function(s) { return baseSkillIds.indexOf(s.skillId) >= 0; });

    await character.save();

    res.json({
      message: 'Removed ' + oldClass + ' class. Scroll returned to inventory!',
      hiddenClass: 'none',
      inventory: character.inventory
    });
  } catch (error) {
    console.error('Use memory crystal error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// POST /api/tavern/use-scroll - Use hidden class scroll to awaken
router.post('/use-scroll', authenticate, async function(req, res) {
  try {
    var scrollItemId = req.body.itemId;
    if (!scrollItemId) {
      return res.status(400).json({ error: 'No scroll specified' });
    }

    var character = await Character.findOne({ userId: req.userId });
    if (!character) return res.status(404).json({ error: 'Character not found' });

    // Check if player already has a hidden class
    if (character.hiddenClass !== 'none') {
      return res.status(400).json({ error: 'You already have a hidden class! Use Memory Crystal to remove it first.' });
    }

    // Find scroll in inventory - check multiple possible type values
    var scrollIndex = character.inventory.findIndex(function(i) { 
      return i.itemId === scrollItemId && 
        (i.type === 'hidden_class_scroll' || i.type === 'special' || i.type === 'scroll' || 
         i.subtype === 'scroll' || (i.name && i.name.toLowerCase().includes('scroll')));
    });
    if (scrollIndex === -1) {
      return res.status(400).json({ error: 'Scroll not found in inventory' });
    }

    var scrollItem = character.inventory[scrollIndex];
    
    // Get scroll data from HIDDEN_CLASS_SCROLLS
    var scrollData = null;
    var hiddenClassName = null;
    var baseClassName = null;
    var element = 'none';
    
    if (HIDDEN_CLASS_SCROLLS) {
      scrollData = Object.values(HIDDEN_CLASS_SCROLLS).find(s => s.id === scrollItemId);
      if (scrollData) {
        hiddenClassName = scrollData.hiddenClass;
        baseClassName = scrollData.baseClass;
        element = scrollData.element || 'none';
      }
    }
    
    // Fallback: try to extract from scroll item data stored in inventory
    if (!hiddenClassName && scrollItem.hiddenClass) {
      hiddenClassName = scrollItem.hiddenClass;
      baseClassName = scrollItem.baseClass;
      element = scrollItem.element || 'none';
    }
    
    // Fallback: try to extract hidden class from scroll ID (e.g., scroll_assassin -> assassin)
    if (!hiddenClassName && scrollItemId.startsWith('scroll_')) {
      hiddenClassName = scrollItemId.replace('scroll_', '');
      // Convert snake_case to camelCase if needed (e.g., shadow_dancer -> shadowDancer)
      hiddenClassName = hiddenClassName.replace(/_([a-z])/g, function(match, letter) {
        return letter.toUpperCase();
      });
    }
    
    if (!hiddenClassName) {
      return res.status(400).json({ error: 'Invalid scroll - cannot determine hidden class. Scroll ID: ' + scrollItemId });
    }

    // Determine base class from hidden class name if not provided
    if (!baseClassName) {
      var hiddenClassToBase = {
        // Swordsman
        flameblade: 'swordsman', berserker: 'swordsman', paladin: 'swordsman',
        earthshaker: 'swordsman', frostguard: 'swordsman',
        // Thief
        shadowDancer: 'thief', venomancer: 'thief', assassin: 'thief',
        phantom: 'thief', bloodreaper: 'thief',
        // Archer
        stormRanger: 'archer', pyroArcher: 'archer', frostSniper: 'archer',
        natureWarden: 'archer', voidHunter: 'archer',
        // Mage
        frostWeaver: 'mage', pyromancer: 'mage', stormcaller: 'mage',
        necromancer: 'mage', arcanist: 'mage'
      };
      baseClassName = hiddenClassToBase[hiddenClassName];
    }

    // Check if scroll matches player's base class (CASE INSENSITIVE)
    if (baseClassName) {
      var playerBaseClass = character.baseClass.toLowerCase();
      var requiredBaseClass = baseClassName.toLowerCase();
      
      if (playerBaseClass !== requiredBaseClass) {
        return res.status(400).json({ 
          error: 'This scroll is for ' + baseClassName + ' class. You are a ' + character.baseClass + '.' 
        });
      }
    }

    // Check if hidden class is already owned by someone else (UNIQUE system)
    var isAvailable = await HiddenClassOwnership.isClassAvailable(hiddenClassName);
    if (!isAvailable) {
      return res.status(400).json({ 
        error: 'This hidden class is already owned by another player! The scroll crumbles to dust...',
        scrollLost: true
      });
    }

    // Remove scroll from inventory
    if (scrollItem.quantity > 1) {
      character.inventory[scrollIndex].quantity -= 1;
    } else {
      character.inventory.splice(scrollIndex, 1);
    }

    // Claim the hidden class
    await HiddenClassOwnership.claimClass(hiddenClassName, character._id, character.name);

    // Apply hidden class to character
    character.hiddenClass = hiddenClassName;
    character.hiddenClassUnlocked = true;
    character.element = element;

    // Add hidden class skills
    var hiddenClassSkills = [];
    if (HIDDEN_CLASS_SKILLS && HIDDEN_CLASS_SKILLS[hiddenClassName]) {
      hiddenClassSkills = HIDDEN_CLASS_SKILLS[hiddenClassName];
    }
    
    // Add skills that don't already exist
    hiddenClassSkills.forEach(function(skill) {
      var exists = character.skills.some(function(s) { return s.skillId === skill.skillId; });
      if (!exists) {
        character.skills.push({
          skillId: skill.skillId,
          name: skill.name,
          level: skill.level || 1,
          unlocked: true
        });
      }
    });

    await character.save();

    res.json({
      message: 'You have awakened as a ' + hiddenClassName + '!',
      hiddenClass: hiddenClassName,
      element: element,
      newSkills: hiddenClassSkills.map(function(s) { return s.name; }),
      inventory: character.inventory
    });
  } catch (error) {
    console.error('Use scroll error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// ============ GM SHOP MANAGEMENT ============

// GET /api/tavern/gm/shop - Get shop for editing
router.get('/gm/shop', authenticate, requireGM, async function(req, res) {
  try {
    var shop = await TavernShop.findOne();
    if (!shop) shop = await TavernShop.initializeShop();
    res.json({ shop: shop });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/tavern/gm/shop/add - Add item to shop
router.post('/gm/shop/add', authenticate, requireGM, async function(req, res) {
  try {
    var itemId = req.body.itemId;
    var price = req.body.price;
    var stock = req.body.stock;
    var itemData = getItemById(itemId);
    if (!itemData) {
      return res.status(400).json({ error: 'Item not found in database' });
    }

    var shop = await TavernShop.findOne();
    if (!shop) shop = await TavernShop.initializeShop();

    // Check if already exists
    var existing = shop.items.find(function(i) { return i.itemId === itemId; });
    if (existing) {
      existing.price = price;
      existing.stock = stock || -1;
      existing.isActive = true;
    } else {
      shop.items.push({
        itemId: itemData.id,
        name: itemData.name,
        icon: itemData.icon,
        type: itemData.type,
        price: price,
        stock: stock || -1,
        isActive: true
      });
    }

    shop.lastUpdated = new Date();
    shop.updatedBy = req.userId;
    await shop.save();

    res.json({ message: 'Added ' + itemData.name + ' to shop', shop: shop });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/tavern/gm/shop/:itemId - Update shop item
router.patch('/gm/shop/:itemId', authenticate, requireGM, async function(req, res) {
  try {
    var price = req.body.price;
    var stock = req.body.stock;
    var isActive = req.body.isActive;
    var shop = await TavernShop.findOne();

    var item = shop.items.find(function(i) { return i.itemId === req.params.itemId; });
    if (!item) return res.status(404).json({ error: 'Item not in shop' });

    if (price !== undefined) item.price = price;
    if (stock !== undefined) item.stock = stock;
    if (isActive !== undefined) item.isActive = isActive;

    shop.lastUpdated = new Date();
    await shop.save();

    res.json({ message: 'Updated ' + item.name, shop: shop });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/tavern/gm/shop/:itemId - Remove from shop
router.delete('/gm/shop/:itemId', authenticate, requireGM, async function(req, res) {
  try {
    var shop = await TavernShop.findOne();
    var index = shop.items.findIndex(function(i) { return i.itemId === req.params.itemId; });
    if (index === -1) return res.status(404).json({ error: 'Item not in shop' });

    var removed = shop.items.splice(index, 1)[0];
    await shop.save();

    res.json({ message: 'Removed ' + removed.name + ' from shop', shop: shop });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/tavern/gm/shop/repopulate - Reset and repopulate shop with consumables
router.post('/gm/shop/repopulate', authenticate, requireGM, async function(req, res) {
  try {
    var shop = await TavernShop.findOne();
    if (!shop) {
      shop = await TavernShop.initializeShop();
    }
    
    // Clear existing items if requested
    if (req.body.clearExisting) {
      shop.items = [];
    }
    
    // Repopulate with consumables
    shop = await populateShopWithConsumables(shop);
    
    res.json({ 
      message: 'Shop repopulated with ' + shop.items.length + ' items',
      shop: shop 
    });
  } catch (error) {
    console.error('Repopulate shop error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
