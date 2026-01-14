// Helper function to ensure consistent item structure with itemId
// This prevents stacking bugs by ensuring all items have proper itemId field

const itemDatabase = require('../data/itemDatabase');

/**
 * Create a properly structured inventory item with consistent itemId
 * @param {string} itemId - The item ID from itemDatabase
 * @param {number} quantity - Quantity to add (default 1)
 * @returns {object} - Properly structured item object
 */
function createInventoryItem(itemId, quantity = 1) {
  const itemData = itemDatabase.find(item => item.id === itemId);
  
  if (!itemData) {
    console.error('Item not found in database:', itemId);
    return null;
  }

  const baseItem = {
    itemId: itemId, // CRITICAL: Always use itemId (not id)
    name: itemData.name,
    type: itemData.type,
    rarity: itemData.rarity || 'common',
    quantity: quantity,
  };

  // Add stackable properties
  if (itemData.stackable) {
    baseItem.stackable = true;
    baseItem.maxStack = itemData.maxStack || 999;
  } else {
    baseItem.stackable = false;
  }

  // Add equipment-specific properties
  if (itemData.type === 'equipment') {
    baseItem.stats = itemData.stats || {};
    baseItem.slot = itemData.slot;
    baseItem.classReq = itemData.classReq || null;
    baseItem.levelReq = itemData.levelReq || null;
    baseItem.setName = itemData.setName || null;
    baseItem.setPiece = itemData.setPiece || null;
  }

  // Add consumable properties
  if (itemData.type === 'consumable') {
    baseItem.effects = itemData.effects || {};
  }

  // Add material properties
  if (itemData.type === 'material') {
    baseItem.description = itemData.description || '';
  }

  return baseItem;
}

/**
 * Add item to inventory with proper stacking
 * @param {Array} inventory - Character's inventory array
 * @param {string} itemId - Item ID to add
 * @param {number} quantity - Quantity to add
 * @returns {boolean} - Success status
 */
function addToInventory(inventory, itemId, quantity = 1) {
  const itemData = itemDatabase.find(item => item.id === itemId);
  
  if (!itemData) {
    console.error('Cannot add item - not found in database:', itemId);
    return false;
  }

  // Handle stackable items
  if (itemData.stackable) {
    // Find existing stack with room
    const existingStack = inventory.find(
      item => item.itemId === itemId && 
              item.quantity < (itemData.maxStack || 999)
    );

    if (existingStack) {
      const maxStack = itemData.maxStack || 999;
      const spaceAvailable = maxStack - existingStack.quantity;
      const amountToAdd = Math.min(quantity, spaceAvailable);
      
      existingStack.quantity += amountToAdd;
      
      // If we couldn't add everything, create new stack for remainder
      if (amountToAdd < quantity) {
        const newItem = createInventoryItem(itemId, quantity - amountToAdd);
        if (newItem) {
          inventory.push(newItem);
        }
      }
    } else {
      // No existing stack found, create new one
      const newItem = createInventoryItem(itemId, quantity);
      if (newItem) {
        inventory.push(newItem);
      }
    }
  } else {
    // Non-stackable items - add individually
    for (let i = 0; i < quantity; i++) {
      const newItem = createInventoryItem(itemId, 1);
      if (newItem) {
        inventory.push(newItem);
      }
    }
  }

  return true;
}

/**
 * Find item in inventory by itemId
 * @param {Array} inventory - Character's inventory array
 * @param {string} itemId - Item ID to find
 * @returns {number} - Index of item, or -1 if not found
 */
function findItemInInventory(inventory, itemId) {
  return inventory.findIndex(item => item.itemId === itemId);
}

/**
 * Get total quantity of an item in inventory
 * @param {Array} inventory - Character's inventory array
 * @param {string} itemId - Item ID to count
 * @returns {number} - Total quantity
 */
function getItemQuantity(inventory, itemId) {
  return inventory
    .filter(item => item.itemId === itemId)
    .reduce((total, item) => total + (item.quantity || 1), 0);
}

/**
 * Remove quantity of item from inventory
 * @param {Array} inventory - Character's inventory array
 * @param {string} itemId - Item ID to remove
 * @param {number} quantity - Quantity to remove
 * @returns {boolean} - Success status
 */
function removeFromInventory(inventory, itemId, quantity) {
  let remaining = quantity;
  
  for (let i = inventory.length - 1; i >= 0 && remaining > 0; i--) {
    if (inventory[i].itemId === itemId) {
      const itemQuantity = inventory[i].quantity || 1;
      
      if (itemQuantity <= remaining) {
        remaining -= itemQuantity;
        inventory.splice(i, 1);
      } else {
        inventory[i].quantity -= remaining;
        remaining = 0;
      }
    }
  }
  
  return remaining === 0;
}

/**
 * Validate item structure (useful for debugging)
 * @param {object} item - Item to validate
 * @returns {object} - { valid: boolean, errors: array }
 */
function validateItem(item) {
  const errors = [];
  
  if (!item.itemId) {
    errors.push('Missing itemId field');
  }
  
  if (!item.name) {
    errors.push('Missing name field');
  }
  
  if (!item.type) {
    errors.push('Missing type field');
  }
  
  if (item.quantity === undefined || item.quantity < 1) {
    errors.push('Invalid quantity');
  }
  
  if (item.stackable && !item.maxStack) {
    errors.push('Stackable item missing maxStack');
  }
  
  return {
    valid: errors.length === 0,
    errors: errors
  };
}

module.exports = {
  createInventoryItem,
  addToInventory,
  findItemInInventory,
  getItemQuantity,
  removeFromInventory,
  validateItem
};
