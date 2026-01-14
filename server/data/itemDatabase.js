// Existing functions in itemDatabase.js

// Get all items as array for search
export function getAllItems() {
  return Object.values(ITEMS);
}

// Search items by name
export function searchItems(query) {
  const q = query.toLowerCase();
  return Object.values(ITEMS).filter(item => 
    item.name.toLowerCase().includes(q) || item.id.toLowerCase().includes(q)
  );
}

// Get item by ID
export function getItemById(itemId) {
  return ITEMS[itemId] || null;
}

// Get items by type
export function getItemsByType(type) {
  return Object.values(ITEMS).filter(item => item.type === type);
}

// Check if items can stack
export function canStack(item1, item2) {
  if (!item1.stackable || !item2.stackable) return false;
  if (item1.id !== item2.id) return false;
  return true;
}

// Modify the items database to include descriptions, types, and stackability

export const ITEMS = {
  health_potion_small: {
    id: 'health_potion_small',
    name: 'Small HP Potion',
    icon: '🧪',
    type: 'consumable',
    subtype: 'potion',
    rarity: 'common',
    stackable: true,
    maxStack: 99,
    usable: true,
    effect: { type: 'heal', value: 50 },
    sellPrice: 10,
    buyPrice: 25,
    description: 'A basic healing potion. Restores 50 HP.'  // Adding description
  },
  health_potion_medium: {
    id: 'health_potion_medium',
    name: 'Medium HP Potion',
    icon: '🧪',
    type: 'consumable',
    subtype: 'potion',
    rarity: 'uncommon',
    stackable: true,
    maxStack: 99,
    usable: true,
    effect: { type: 'heal', value: 120 },
    sellPrice: 25,
    buyPrice: 60,
    description: 'A stronger healing potion. Restores 120 HP.'  // Adding description
  },
  bone_fragment: {
    id: 'bone_fragment',
    name: 'Bone Fragment',
    icon: '🦴',
    type: 'material',
    subtype: 'drop',
    rarity: 'common',
    stackable: true,
    maxStack: 999,
    usable: false,
    sellPrice: 2,
    buyPrice: 0,
    description: 'A bone fragment dropped by an enemy. Used for crafting.'  // Adding description
  },
  iron_sword: {
    id: 'iron_sword',
    name: 'Iron Sword',
    icon: '🗡️',
    type: 'equipment',
    subtype: 'weapon',
    rarity: 'uncommon',
    stackable: false,
    maxStack: 1,
    usable: true,
    stats: { str: 10, dex: 5 },
    sellPrice: 100,
    buyPrice: 250,
    description: 'A sturdy sword made of iron. Increases Strength and Dexterity.'  // Adding description
  },
  // Add the rest of your items following the same structure...
};

// Adding a filter system for inventory, shop, and trading items
function filterItemsByType(type) {
  return Object.values(ITEMS).filter(item => item.type === type);
}

export { filterItemsByType };
