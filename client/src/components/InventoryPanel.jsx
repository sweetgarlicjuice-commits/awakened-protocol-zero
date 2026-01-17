import React, { useState } from 'react';
import { tavernAPI } from '../services/api';

var EQUIPMENT_SLOTS = [
  { id: 'head', name: 'Head', icon: '🧢' },
  { id: 'body', name: 'Body', icon: '👕' },
  { id: 'leg', name: 'Hands', icon: '🧤' },
  { id: 'shoes', name: 'Feet', icon: '👢' },
  { id: 'rightHand', name: 'Weapon', icon: '⚔️' },
  { id: 'leftHand', name: 'Off-hand', icon: '🛡️' },
  { id: 'ring', name: 'Ring', icon: '💍' },
  { id: 'necklace', name: 'Necklace', icon: '📿' }
];

var ITEMS_PER_PAGE = 10;

// Item type icons
var TYPE_ICONS = {
  material: '🪨',
  consumable: '🧪',
  equipment: '⚔️',
  scroll: '📜',
  special: '💎'
};

// Crafting Recipes
var CRAFTING_RECIPES = [
  // Tower 1 - Crimson Spire (Undead)
  { id: 'craft_bone_ring', name: 'Bone Ring', result: { itemId: 'tower1_ring_bone', name: 'Bone Ring', type: 'equipment', slot: 'ring', rarity: 'uncommon', stats: { pAtk: 3, hp: 20 } },
    materials: [{ itemId: 'death_knight_core', name: 'Death Knight Core', quantity: 5 }], icon: '💀' },
  { id: 'craft_cursed_amulet', name: 'Cursed Amulet', result: { itemId: 'tower1_necklace_cursed', name: 'Cursed Amulet', type: 'equipment', slot: 'necklace', rarity: 'rare', stats: { mAtk: 8, mp: 30 } },
    materials: [{ itemId: 'death_knight_core', name: 'Death Knight Core', quantity: 8 }, { itemId: 'ghost_essence', name: 'Ghost Essence', quantity: 5 }], icon: '📿' },
  
  // Tower 2 - Frost Citadel (Ice)
  { id: 'craft_frost_ring', name: 'Frost Ring', result: { itemId: 'tower2_ring_frost', name: 'Frost Ring', type: 'equipment', slot: 'ring', rarity: 'uncommon', stats: { mAtk: 5, mp: 25 } },
    materials: [{ itemId: 'frost_crystal', name: 'Frost Crystal', quantity: 10 }], icon: '❄️' },
  { id: 'craft_glacial_pendant', name: 'Glacial Pendant', result: { itemId: 'tower2_necklace_glacial', name: 'Glacial Pendant', type: 'equipment', slot: 'necklace', rarity: 'rare', stats: { mAtk: 12, pDef: 5, mp: 40 } },
    materials: [{ itemId: 'frost_crystal', name: 'Frost Crystal', quantity: 15 }, { itemId: 'frozen_heart', name: 'Frozen Heart', quantity: 3 }], icon: '💎' },

  // Tower 3 - Shadow Keep (Dark)
  { id: 'craft_shadow_band', name: 'Shadow Band', result: { itemId: 'tower3_ring_shadow', name: 'Shadow Band', type: 'equipment', slot: 'ring', rarity: 'rare', stats: { pAtk: 8, critRate: 3 } },
    materials: [{ itemId: 'shadow_essence', name: 'Shadow Essence', quantity: 12 }], icon: '🌑' },
  { id: 'craft_void_pendant', name: 'Void Pendant', result: { itemId: 'tower3_necklace_void', name: 'Void Pendant', type: 'equipment', slot: 'necklace', rarity: 'epic', stats: { mAtk: 15, critRate: 5, mp: 50 } },
    materials: [{ itemId: 'shadow_essence', name: 'Shadow Essence', quantity: 20 }, { itemId: 'dark_crystal', name: 'Dark Crystal', quantity: 5 }], icon: '🖤' },

  // Tower 4 - Storm Bastion (Lightning)
  { id: 'craft_storm_ring', name: 'Storm Ring', result: { itemId: 'tower4_ring_storm', name: 'Storm Ring', type: 'equipment', slot: 'ring', rarity: 'rare', stats: { pAtk: 10, speed: 5 } },
    materials: [{ itemId: 'lightning_shard', name: 'Lightning Shard', quantity: 15 }], icon: '⚡' },
  { id: 'craft_tempest_amulet', name: 'Tempest Amulet', result: { itemId: 'tower4_necklace_tempest', name: 'Tempest Amulet', type: 'equipment', slot: 'necklace', rarity: 'epic', stats: { mAtk: 18, speed: 8, critRate: 4 } },
    materials: [{ itemId: 'lightning_shard', name: 'Lightning Shard', quantity: 25 }, { itemId: 'storm_core', name: 'Storm Core', quantity: 3 }], icon: '🌩️' },

  // Tower 5 - Verdant Spire (Nature)
  { id: 'craft_nature_ring', name: 'Nature Ring', result: { itemId: 'tower5_ring_nature', name: 'Nature Ring', type: 'equipment', slot: 'ring', rarity: 'rare', stats: { hp: 80, pDef: 8 } },
    materials: [{ itemId: 'verdant_sap', name: 'Verdant Sap', quantity: 18 }], icon: '🌿' },
  { id: 'craft_lifewood_pendant', name: 'Lifewood Pendant', result: { itemId: 'tower5_necklace_lifewood', name: 'Lifewood Pendant', type: 'equipment', slot: 'necklace', rarity: 'epic', stats: { hp: 120, pDef: 10, mDef: 10, hpRegen: 5 } },
    materials: [{ itemId: 'verdant_sap', name: 'Verdant Sap', quantity: 30 }, { itemId: 'ancient_bark', name: 'Ancient Bark', quantity: 5 }], icon: '🌳' },

  // Memory Crystal (special)
  { id: 'craft_memory_crystal', name: 'Memory Crystal', result: { itemId: 'memory_crystal', name: 'Memory Crystal', type: 'special', rarity: 'legendary', stackable: false },
    materials: [{ itemId: 'memory_crystal_fragment', name: 'Memory Crystal Fragment', quantity: 15 }], icon: '🔷', special: true },
];

// ============================================================
// PHASE 9.3.7: Unified Item Display System
// Format:
// - Consumable: [icon] Name | Description (effect)
// - Equipment: [icon] Name | Requirements | Stats
// - Material: [icon] Name | Description
// ============================================================

// Get icon based on item type/subtype
function getItemIcon(item) {
  if (item.icon && item.icon !== '📦') return item.icon;
  
  // By slot for equipment
  if (item.slot === 'weapon' || item.slot === 'mainHand') return '⚔️';
  if (item.slot === 'head') return '🧢';
  if (item.slot === 'body' || item.slot === 'chest') return '👕';
  if (item.slot === 'hands' || item.slot === 'gloves') return '🧤';
  if (item.slot === 'leg' || item.slot === 'legs') return '👖';
  if (item.slot === 'shoes' || item.slot === 'boots' || item.slot === 'feet') return '👢';
  if (item.slot === 'ring') return '💍';
  if (item.slot === 'necklace') return '📿';
  if (item.slot === 'offhand' || item.slot === 'leftHand' || item.slot === 'cape') return '🛡️';
  
  // By subtype
  if (item.subtype === 'weapon') return '⚔️';
  if (item.subtype === 'armor') return '🛡️';
  if (item.subtype === 'shield') return '🛡️';
  if (item.subtype === 'accessory') return '💍';
  if (item.subtype === 'potion') return '🧪';
  if (item.subtype === 'drop') return '🪨';
  if (item.subtype === 'special') return '💎';
  if (item.subtype === 'hidden_class') return '📜';
  
  // By type
  if (item.type === 'material') return '🪨';
  if (item.type === 'consumable') return '🧪';
  if (item.type === 'equipment' || item.type === 'weapon' || item.type === 'armor') return '⚔️';
  if (item.type === 'scroll') return '📜';
  if (item.type === 'special') return '💎';
  
  return '📦';
}

// Get effect/use text for item
function getItemEffect(item) {
  // Consumables - show effect value
  if (item.type === 'consumable') {
    if (item.effect) {
      if (item.effect.type === 'heal') return '+' + item.effect.value + ' HP';
      if (item.effect.type === 'mana') return '+' + item.effect.value + ' MP';
      if (item.effect.type === 'energy') return '+' + item.effect.value + ' Energy';
      if (item.effect.type === 'buff') return item.effect.buffType || 'Buff';
    }
    // Fallback by name
    var name = (item.name || '').toLowerCase();
    if (name.includes('small health')) return '+50 HP';
    if (name.includes('medium health')) return '+150 HP';
    if (name.includes('large health')) return '+400 HP';
    if (name.includes('mega health')) return '+1000 HP';
    if (name.includes('small mana')) return '+30 MP';
    if (name.includes('medium mana')) return '+80 MP';
    if (name.includes('large mana')) return '+200 MP';
    if (name.includes('mega mana')) return '+500 MP';
    if (name.includes('antidote')) return 'Cure Poison';
    if (name.includes('escape')) return 'Exit Tower';
    if (name.includes('energy')) return '+20 Energy';
    if (name.includes('strength')) return '+20% P.DMG';
    if (name.includes('intelligence')) return '+20% M.DMG';
    if (name.includes('iron skin')) return '+30% P.DEF';
    if (name.includes('swift')) return '+25% Evasion';
    if (name.includes('critical')) return '+15% Crit';
    return 'Use';
  }
  
  // Equipment - show stats summary
  if (isEquipmentType(item) && item.stats) {
    var statList = [];
    var keys = Object.keys(item.stats);
    for (var i = 0; i < keys.length; i++) {
      statList.push(keys[i].toUpperCase() + '+' + item.stats[keys[i]]);
    }
    return statList.join(' ');
  }
  
  // Materials
  if (item.type === 'material') {
    return 'Material';
  }
  
  // Scrolls
  if (item.type === 'scroll') {
    return 'Hidden Class';
  }
  
  // Special
  if (item.type === 'special') {
    if (item.itemId === 'memory_crystal') return 'Remove Class';
    if (item.itemId === 'memory_crystal_fragment') return 'Combine 15';
    return 'Special';
  }
  
  return '';
}

// Get description text for item
function getItemDescription(item) {
  // Consumables - brief use description
  if (item.type === 'consumable') {
    if (item.effect) {
      if (item.effect.type === 'heal') return 'Restores ' + item.effect.value + ' HP';
      if (item.effect.type === 'mana') return 'Restores ' + item.effect.value + ' MP';
      if (item.effect.type === 'energy') return 'Restores ' + item.effect.value + ' Energy';
    }
    var name = (item.name || '').toLowerCase();
    if (name.includes('antidote')) return 'Cures poison status';
    if (name.includes('escape')) return 'Escape tower instantly';
    if (name.includes('strength')) return '+20% Physical DMG for 5 turns';
    if (name.includes('intelligence')) return '+20% Magic DMG for 5 turns';
    if (name.includes('iron skin')) return '+30% Physical DEF for 5 turns';
    if (name.includes('swift')) return '+25% Evasion for 5 turns';
    if (name.includes('critical')) return '+15% Crit Rate for 5 turns';
    return 'Consumable item';
  }
  
  // Materials
  if (item.type === 'material') {
    var itemId = item.itemId || '';
    if (itemId.includes('death_knight')) return 'Rare core for crafting';
    if (itemId.includes('frost_crystal')) return 'Ice crystal for crafting';
    if (itemId.includes('frozen_heart')) return 'Rare ice elemental drop';
    if (itemId.includes('shadow_essence')) return 'Dark essence for crafting';
    if (itemId.includes('lightning_shard')) return 'Charged crystal shard';
    if (itemId.includes('verdant_sap')) return 'Nature sap for crafting';
    if (itemId.includes('memory_crystal')) return 'Combine 15 for Memory Crystal';
    return 'Crafting material';
  }
  
  // Scrolls
  if (item.type === 'scroll') {
    return 'Use to unlock hidden class';
  }
  
  // Special
  if (item.type === 'special') {
    if (item.itemId === 'memory_crystal') return 'Remove hidden class (returns scroll)';
    return 'Special item';
  }
  
  return item.description || '';
}

// Get requirements text for equipment
function getItemRequirements(item, character) {
  if (!isEquipmentType(item)) return null;
  
  var reqs = [];
  
  if (item.levelReq) {
    var meetsLevel = !character || character.level >= item.levelReq;
    reqs.push({
      text: 'Lv.' + item.levelReq,
      met: meetsLevel
    });
  }
  
  if (item.classReq || item.class) {
    var reqClass = item.classReq || item.class;
    var meetsClass = !character || reqClass.toLowerCase() === character.baseClass.toLowerCase();
    reqs.push({
      text: reqClass.charAt(0).toUpperCase() + reqClass.slice(1),
      met: meetsClass
    });
  }
  
  return reqs.length > 0 ? reqs : null;
}

// Map slot names to equipment slot IDs
function getEquipSlotId(item) {
  if (!item.slot && !item.subtype) return null;
  var slotValue = item.slot || item.subtype;
  
  var slotMap = {
    'weapon': 'rightHand',
    'mainHand': 'rightHand',
    'mainhand': 'rightHand',
    'rightHand': 'rightHand',
    'offhand': 'leftHand',
    'offHand': 'leftHand',
    'leftHand': 'leftHand',
    'shield': 'leftHand',
    'cape': 'leftHand',
    'head': 'head',
    'helmet': 'head',
    'body': 'body',
    'chest': 'body',
    'armor': 'body',
    'hands': 'leg',
    'gloves': 'leg',
    'gauntlets': 'leg',
    'leg': 'leg',
    'legs': 'leg',
    'pants': 'leg',
    'shoes': 'shoes',
    'boots': 'shoes',
    'feet': 'shoes',
    'ring': 'ring',
    'necklace': 'necklace',
    'pendant': 'necklace',
    'amulet': 'necklace',
    'accessory': 'ring'
  };
  
  return slotMap[slotValue] || slotMap[slotValue.toLowerCase()] || slotValue;
}

// Helper function to check if item is equipment type
function isEquipmentType(item) {
  return item.type === 'equipment' || item.type === 'weapon' || item.type === 'armor' || item.type === 'accessory';
}

// ============================================================
// ItemDisplay Component - Unified item rendering
// ============================================================
function ItemDisplay(props) {
  var item = props.item;
  var character = props.character;
  var showQuantity = props.showQuantity !== false;
  var compact = props.compact || false;
  var onClick = props.onClick;
  var isSelected = props.isSelected;
  var rightContent = props.rightContent;
  
  var icon = getItemIcon(item);
  var effect = getItemEffect(item);
  var description = getItemDescription(item);
  var requirements = getItemRequirements(item, character);
  var isEquip = isEquipmentType(item);
  
  var getRarityColor = function(rarity) {
    var colors = {
      common: 'text-gray-300',
      uncommon: 'text-green-400',
      rare: 'text-blue-400',
      epic: 'text-purple-400',
      legendary: 'text-amber-400'
    };
    return colors[rarity] || 'text-gray-300';
  };
  
  var getRarityBorder = function(rarity) {
    var colors = {
      common: 'border-gray-600',
      uncommon: 'border-green-500/50',
      rare: 'border-blue-500/50',
      epic: 'border-purple-500/50',
      legendary: 'border-amber-500/50'
    };
    return colors[rarity] || 'border-gray-600';
  };
  
  var getRarityBg = function(rarity) {
    var colors = {
      common: 'bg-gray-800/50',
      uncommon: 'bg-green-900/20',
      rare: 'bg-blue-900/20',
      epic: 'bg-purple-900/20',
      legendary: 'bg-amber-900/20'
    };
    return colors[rarity] || 'bg-gray-800/50';
  };

  return (
    <div 
      onClick={onClick}
      className={'p-3 rounded-lg border transition ' + getRarityBorder(item.rarity) + ' ' + getRarityBg(item.rarity) + ' ' + (onClick ? 'cursor-pointer hover:bg-void-700' : '') + ' ' + (isSelected ? 'ring-2 ring-purple-500' : '')}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <span className="text-2xl mt-0.5">{icon}</span>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Top Row: Name + Quantity */}
          <div className="flex items-center gap-2">
            <span className={getRarityColor(item.rarity) + ' font-medium truncate'}>{item.name}</span>
            {showQuantity && item.quantity > 1 && (
              <span className="text-gray-500 text-sm">x{item.quantity}</span>
            )}
          </div>
          
          {/* Middle Row: Requirements (Equipment only) */}
          {isEquip && requirements && (
            <div className="flex flex-wrap gap-2 mt-1">
              {requirements.map(function(req, idx) {
                return (
                  <span key={idx} className={'text-xs px-1.5 py-0.5 rounded ' + (req.met ? 'bg-green-900/40 text-green-400' : 'bg-red-900/40 text-red-400')}>
                    {req.text} {req.met ? '✓' : '✗'}
                  </span>
                );
              })}
            </div>
          )}
          
          {/* Bottom Row: Description/Effect */}
          <div className="mt-1">
            {effect && (
              <span className="text-green-400 text-xs">({effect})</span>
            )}
            {!compact && description && (
              <p className="text-gray-500 text-xs mt-0.5">{description}</p>
            )}
          </div>
        </div>
        
        {/* Right Content (price, buttons, etc) */}
        {rightContent && (
          <div className="flex-shrink-0">
            {rightContent}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Main InventoryPanel Component
// ============================================================
var InventoryPanel = function(props) {
  var character = props.character;
  var refreshCharacter = props.refreshCharacter;
  var addLog = props.addLog;
  
  var [activeTab, setActiveTab] = useState('inventory');
  var [currentPage, setCurrentPage] = useState(0);
  var [isLoading, setIsLoading] = useState(false);
  var [splitModal, setSplitModal] = useState(null);
  var [splitQty, setSplitQty] = useState(1);
  var [filter, setFilter] = useState('all');
  var [selectedItem, setSelectedItem] = useState(null);
  var [craftingMessage, setCraftingMessage] = useState(null);

  var inventory = character.inventory || [];
  
  // Apply filter
  var filteredInventory = inventory.filter(function(item) {
    if (filter === 'all') return true;
    if (filter === 'material') return item.type === 'material';
    if (filter === 'consumable') return item.type === 'consumable';
    if (filter === 'equipment') return isEquipmentType(item);
    if (filter === 'scroll') return item.type === 'scroll' || item.type === 'special';
    return true;
  });
  
  var totalPages = Math.ceil(filteredInventory.length / ITEMS_PER_PAGE);
  var paginatedItems = filteredInventory.slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE);

  // Reset page when filter changes
  var handleFilterChange = function(newFilter) {
    setFilter(newFilter);
    setCurrentPage(0);
    setSelectedItem(null);
  };

  var handleUseItem = async function(itemId) {
    setIsLoading(true);
    try {
      var response = await tavernAPI.useItem(itemId);
      addLog('success', response.data.message);
      await refreshCharacter();
    } catch (err) {
      addLog('error', err.response?.data?.error || 'Failed to use item');
    }
    setIsLoading(false);
  };

  var handleEquipItem = async function(itemId) {
    setIsLoading(true);
    try {
      var response = await tavernAPI.equipItem(itemId);
      addLog('success', response.data.message);
      await refreshCharacter();
      setSelectedItem(null);
    } catch (err) {
      addLog('error', err.response?.data?.error || 'Failed to equip');
    }
    setIsLoading(false);
  };

  var handleUnequipItem = async function(slot) {
    setIsLoading(true);
    try {
      var response = await tavernAPI.unequipItem(slot);
      addLog('success', response.data.message);
      await refreshCharacter();
    } catch (err) {
      addLog('error', err.response?.data?.error || 'Failed to unequip');
    }
    setIsLoading(false);
  };

  var handleDiscardItem = async function(itemId) {
    if (!confirm('Discard this item?')) return;
    setIsLoading(true);
    try {
      var response = await tavernAPI.discardItem(itemId, 1);
      addLog('info', response.data.message);
      await refreshCharacter();
      setSelectedItem(null);
    } catch (err) {
      addLog('error', err.response?.data?.error || 'Failed');
    }
    setIsLoading(false);
  };

  var handleSplitStack = async function() {
    if (!splitModal) return;
    setIsLoading(true);
    try {
      var response = await tavernAPI.splitStack(splitModal.itemId, splitQty);
      addLog('success', response.data.message);
      await refreshCharacter();
      setSplitModal(null);
    } catch (err) {
      addLog('error', err.response?.data?.error || 'Failed');
    }
    setIsLoading(false);
  };

  // Generic crafting handler
  var handleCraft = async function(recipe) {
    setIsLoading(true);
    setCraftingMessage(null);
    
    try {
      if (recipe.id === 'craft_memory_crystal') {
        var response = await tavernAPI.craftMemoryCrystal();
        addLog('success', response.data.message);
        await refreshCharacter();
        setCraftingMessage({ type: 'success', text: 'Crafted Memory Crystal!' });
      } else {
        var response = await tavernAPI.craftItem(recipe.id);
        addLog('success', response.data.message || 'Crafted ' + recipe.name + '!');
        await refreshCharacter();
        setCraftingMessage({ type: 'success', text: 'Crafted ' + recipe.name + '!' });
      }
    } catch (err) {
      var errorMsg = err.response?.data?.error || 'Crafting failed';
      addLog('error', errorMsg);
      setCraftingMessage({ type: 'error', text: errorMsg });
    }
    setIsLoading(false);
  };

  var handleCraftMemoryCrystal = async function() {
    setIsLoading(true);
    try {
      var response = await tavernAPI.craftMemoryCrystal();
      addLog('success', response.data.message);
      await refreshCharacter();
    } catch (err) {
      addLog('error', err.response?.data?.error || 'Failed');
    }
    setIsLoading(false);
  };

  var handleUseMemoryCrystal = async function() {
    if (!confirm('Remove your hidden class? You will get the scroll back.')) return;
    setIsLoading(true);
    try {
      var response = await tavernAPI.useMemoryCrystal();
      addLog('success', response.data.message);
      await refreshCharacter();
    } catch (err) {
      addLog('error', err.response?.data?.error || 'Failed');
    }
    setIsLoading(false);
  };

  var isUsable = function(item) { return item.type === 'consumable'; };
  
  var isEquippable = function(item) { 
    var hasSlot = item.slot || item.subtype;
    return isEquipmentType(item) && hasSlot;
  };

  // Check if character meets equipment requirements
  var getEquipStatus = function(item) {
    var result = { canEquip: true, reason: '' };
    
    if (item.levelReq && character.level < item.levelReq) {
      result.canEquip = false;
      result.reason = 'Level ' + item.levelReq + ' required';
      return result;
    }
    
    if (item.classReq || item.class) {
      var reqClass = (item.classReq || item.class).toLowerCase();
      if (reqClass !== character.baseClass.toLowerCase()) {
        result.canEquip = false;
        result.reason = (item.classReq || item.class) + ' class required';
        return result;
      }
    }
    
    return result;
  };

  var canSplit = function(item) { return item.stackable && item.quantity > 1; };

  var getRarityColor = function(rarity) {
    var colors = {
      common: 'text-gray-300',
      uncommon: 'text-green-400',
      rare: 'text-blue-400',
      epic: 'text-purple-400',
      legendary: 'text-amber-400'
    };
    return colors[rarity] || 'text-gray-300';
  };

  // Count memory crystal fragments
  var fragments = 0;
  for (var i = 0; i < inventory.length; i++) {
    if (inventory[i].itemId === 'memory_crystal_fragment') {
      fragments = inventory[i].quantity;
      break;
    }
  }
  
  var hasCrystal = false;
  for (var j = 0; j < inventory.length; j++) {
    if (inventory[j].itemId === 'memory_crystal') {
      hasCrystal = true;
      break;
    }
  }

  // Helper to get material count from inventory
  var getMaterialCount = function(itemId) {
    for (var i = 0; i < inventory.length; i++) {
      if (inventory[i].itemId === itemId) {
        return inventory[i].quantity || 0;
      }
    }
    return 0;
  };

  // Check if recipe can be crafted
  var canCraftRecipe = function(recipe) {
    for (var i = 0; i < recipe.materials.length; i++) {
      var mat = recipe.materials[i];
      if (getMaterialCount(mat.itemId) < mat.quantity) {
        return false;
      }
    }
    return true;
  };

  // Calculate item counts by type
  var counts = {
    material: 0,
    consumable: 0,
    equipment: 0,
    scroll: 0
  };
  for (var k = 0; k < inventory.length; k++) {
    var itemType = inventory[k].type;
    if (itemType === 'material') counts.material++;
    else if (itemType === 'consumable') counts.consumable++;
    else if (isEquipmentType(inventory[k])) counts.equipment++;
    else if (itemType === 'scroll' || itemType === 'special') counts.scroll++;
  }

  return (
    <div className="space-y-4">
      {/* Sub-tabs */}
      <div className="flex gap-2 justify-center">
        <button onClick={function() { setActiveTab('inventory'); }}
          className={'px-4 py-2 rounded-lg text-sm ' + (activeTab === 'inventory' ? 'bg-purple-600 text-white' : 'bg-void-800 text-gray-400')}>
          📦 Inventory
        </button>
        <button onClick={function() { setActiveTab('equipment'); }}
          className={'px-4 py-2 rounded-lg text-sm ' + (activeTab === 'equipment' ? 'bg-purple-600 text-white' : 'bg-void-800 text-gray-400')}>
          ⚔️ Equipment
        </button>
        <button onClick={function() { setActiveTab('craft'); }}
          className={'px-4 py-2 rounded-lg text-sm ' + (activeTab === 'craft' ? 'bg-purple-600 text-white' : 'bg-void-800 text-gray-400')}>
          🔨 Craft
        </button>
      </div>

      {/* INVENTORY TAB */}
      {activeTab === 'inventory' && (
        <div className="bg-void-800/50 rounded-xl p-4 neon-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg text-purple-400">📦 Inventory</h3>
            <span className="text-gray-400">{inventory.length}/{character.inventorySize || 50}</span>
          </div>

          {/* Filter buttons */}
          <div className="flex gap-2 mb-4 flex-wrap">
            <button onClick={function() { handleFilterChange('all'); }}
              className={'px-3 py-1 rounded text-xs ' + (filter === 'all' ? 'bg-purple-600 text-white' : 'bg-void-700 text-gray-400')}>
              All ({inventory.length})
            </button>
            <button onClick={function() { handleFilterChange('material'); }}
              className={'px-3 py-1 rounded text-xs ' + (filter === 'material' ? 'bg-purple-600 text-white' : 'bg-void-700 text-gray-400')}>
              🪨 ({counts.material})
            </button>
            <button onClick={function() { handleFilterChange('consumable'); }}
              className={'px-3 py-1 rounded text-xs ' + (filter === 'consumable' ? 'bg-purple-600 text-white' : 'bg-void-700 text-gray-400')}>
              🧪 ({counts.consumable})
            </button>
            <button onClick={function() { handleFilterChange('equipment'); }}
              className={'px-3 py-1 rounded text-xs ' + (filter === 'equipment' ? 'bg-purple-600 text-white' : 'bg-void-700 text-gray-400')}>
              ⚔️ ({counts.equipment})
            </button>
            <button onClick={function() { handleFilterChange('scroll'); }}
              className={'px-3 py-1 rounded text-xs ' + (filter === 'scroll' ? 'bg-purple-600 text-white' : 'bg-void-700 text-gray-400')}>
              📜 ({counts.scroll})
            </button>
          </div>

          {/* Item List */}
          <div className="space-y-2 mb-4">
            {paginatedItems.map(function(item, idx) {
              var isSelected = selectedItem && selectedItem.itemId === item.itemId;
              var equipStatus = isEquipmentType(item) ? getEquipStatus(item) : null;
              
              return (
                <div key={idx}>
                  <ItemDisplay 
                    item={item}
                    character={character}
                    isSelected={isSelected}
                    onClick={function() { setSelectedItem(isSelected ? null : item); }}
                  />
                  
                  {/* Expanded Action Buttons */}
                  {isSelected && (
                    <div className="mt-2 ml-11 flex gap-2 flex-wrap">
                      {isUsable(item) && (
                        <button onClick={function(e) { e.stopPropagation(); handleUseItem(item.itemId); }} disabled={isLoading}
                          className="px-3 py-1 bg-green-600 hover:bg-green-500 rounded text-xs">Use</button>
                      )}
                      {isEquippable(item) && (
                        <button 
                          onClick={function(e) { e.stopPropagation(); handleEquipItem(item.itemId); }} 
                          disabled={isLoading || (equipStatus && !equipStatus.canEquip)}
                          className={'px-3 py-1 rounded text-xs ' + (equipStatus && equipStatus.canEquip ? 'bg-blue-600 hover:bg-blue-500' : 'bg-gray-600 cursor-not-allowed opacity-50')}
                          title={equipStatus && !equipStatus.canEquip ? equipStatus.reason : 'Equip this item'}
                        >
                          {equipStatus && equipStatus.canEquip ? 'Equip' : '🔒 Equip'}
                        </button>
                      )}
                      {canSplit(item) && (
                        <button onClick={function(e) { e.stopPropagation(); setSplitModal(item); setSplitQty(1); }} disabled={isLoading}
                          className="px-3 py-1 bg-gray-600 hover:bg-gray-500 rounded text-xs">Split</button>
                      )}
                      <button onClick={function(e) { e.stopPropagation(); handleDiscardItem(item.itemId); }} disabled={isLoading}
                        className="px-3 py-1 bg-red-600 hover:bg-red-500 rounded text-xs">🗑️</button>
                    </div>
                  )}
                </div>
              );
            })}
            {paginatedItems.length === 0 && (
              <p className="text-gray-500 text-center py-4">No items found</p>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button onClick={function() { setCurrentPage(Math.max(0, currentPage - 1)); }} disabled={currentPage === 0}
                className="px-3 py-1 bg-void-700 rounded disabled:opacity-50">←</button>
              <span className="text-gray-400">{currentPage + 1} / {totalPages}</span>
              <button onClick={function() { setCurrentPage(Math.min(totalPages - 1, currentPage + 1)); }} disabled={currentPage >= totalPages - 1}
                className="px-3 py-1 bg-void-700 rounded disabled:opacity-50">→</button>
            </div>
          )}
        </div>
      )}

      {/* EQUIPMENT TAB */}
      {activeTab === 'equipment' && (
        <div className="bg-void-800/50 rounded-xl p-4 neon-border">
          <h3 className="font-display text-lg text-purple-400 mb-4">⚔️ Equipment</h3>
          
          <div className="grid grid-cols-2 gap-2 mb-4">
            {EQUIPMENT_SLOTS.map(function(slot) {
              var equippedItem = character.equipment ? character.equipment[slot.id] : null;
              return (
                <div key={slot.id} className={'p-3 rounded-lg border ' + (equippedItem ? 'border-purple-500/50 bg-purple-900/20' : 'border-gray-700 bg-void-900/50')}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{equippedItem ? getItemIcon(equippedItem) : slot.icon}</span>
                      <div>
                        <p className="text-xs text-gray-500">{slot.name}</p>
                        <p className={'text-sm truncate max-w-[100px] ' + (equippedItem ? 'text-white' : 'text-gray-600')}>
                          {equippedItem ? equippedItem.name : 'Empty'}
                        </p>
                      </div>
                    </div>
                    {equippedItem && (
                      <button onClick={function() { handleUnequipItem(slot.id); }} disabled={isLoading}
                        className="px-2 py-1 bg-red-600/50 hover:bg-red-600 rounded text-xs">✕</button>
                    )}
                  </div>
                  {equippedItem && equippedItem.stats && (
                    <div className="mt-2">
                      <p className="text-green-400 text-xs">({getItemEffect(equippedItem)})</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Equipment Stats Summary */}
          <div className="p-3 rounded-lg border border-gray-700 bg-void-900/50">
            <p className="text-sm text-gray-400 mb-2">Total Equipment Bonuses:</p>
            <div className="flex flex-wrap gap-2">
              {(function() {
                var totalStats = {};
                EQUIPMENT_SLOTS.forEach(function(slot) {
                  var item = character.equipment ? character.equipment[slot.id] : null;
                  if (item && item.stats) {
                    Object.keys(item.stats).forEach(function(stat) {
                      totalStats[stat] = (totalStats[stat] || 0) + item.stats[stat];
                    });
                  }
                });
                var statKeys = Object.keys(totalStats);
                if (statKeys.length === 0) {
                  return <span className="text-gray-500 text-xs">No equipment bonuses</span>;
                }
                return statKeys.map(function(stat) {
                  return (
                    <span key={stat} className="px-2 py-1 bg-green-900/30 rounded text-xs text-green-400">
                      {stat.toUpperCase()} +{totalStats[stat]}
                    </span>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      )}

      {/* CRAFT TAB */}
      {activeTab === 'craft' && (
        <div className="bg-void-800/50 rounded-xl p-4 neon-border">
          <h3 className="font-display text-lg text-purple-400 mb-4">🔨 Crafting</h3>
          
          {/* Crafting Message */}
          {craftingMessage && (
            <div className={'p-3 rounded-lg mb-4 ' + (craftingMessage.type === 'success' ? 'bg-green-900/30 border border-green-500/30' : 'bg-red-900/30 border border-red-500/30')}>
              <p className={'text-sm ' + (craftingMessage.type === 'success' ? 'text-green-400' : 'text-red-400')}>
                {craftingMessage.type === 'success' ? '✓' : '✗'} {craftingMessage.text}
              </p>
            </div>
          )}

          {/* Memory Crystal Section */}
          <div className="bg-void-900/50 p-4 rounded-lg mb-4 border border-purple-500/30">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">🔷</span>
              <div>
                <h4 className="text-white font-bold">Memory Crystal</h4>
                <p className="text-gray-400 text-sm">(Remove Class)</p>
              </div>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400 text-sm">15x 💠 Fragment</span>
              <span className={'text-sm ' + (fragments >= 15 ? 'text-green-400' : 'text-red-400')}>
                {fragments}/15
              </span>
            </div>
            <button onClick={handleCraftMemoryCrystal} disabled={isLoading || fragments < 15}
              className="w-full btn-primary disabled:opacity-50">Craft</button>
          </div>

          {/* Use Memory Crystal */}
          {hasCrystal && character.hiddenClass !== 'none' && (
            <div className="bg-purple-900/30 p-4 rounded-lg border border-purple-500/50 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">🔷</span>
                <div>
                  <h4 className="text-purple-400 font-bold">Remove Hidden Class</h4>
                  <p className="text-gray-400 text-sm">Current: {character.hiddenClass}</p>
                </div>
              </div>
              <p className="text-yellow-400 text-sm mb-3">⚠️ Returns scroll to inventory</p>
              <button onClick={handleUseMemoryCrystal} disabled={isLoading}
                className="w-full bg-purple-600 hover:bg-purple-500 py-2 rounded">Use Crystal</button>
            </div>
          )}

          {/* Other Crafting Recipes */}
          <h4 className="font-display text-md text-gray-300 mb-3 mt-6">📜 Equipment Recipes</h4>
          <div className="space-y-3">
            {CRAFTING_RECIPES.filter(function(r) { return !r.special; }).map(function(recipe) {
              var canCraft = canCraftRecipe(recipe);
              return (
                <div key={recipe.id} className={'p-3 rounded-lg border ' + (canCraft ? 'border-green-500/30 bg-green-900/10' : 'border-gray-700/50 bg-void-900/50')}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{recipe.icon}</span>
                      <span className={getRarityColor(recipe.result.rarity) + ' font-medium'}>{recipe.name}</span>
                    </div>
                    <span className={'text-xs ' + (canCraft ? 'text-green-400' : 'text-red-400')}>
                      {canCraft ? '✓' : '✗'}
                    </span>
                  </div>
                  
                  {/* Result preview - stats only */}
                  {recipe.result.stats && (
                    <p className="text-green-400 text-xs mb-2">
                      ({Object.keys(recipe.result.stats).map(function(stat) {
                        return stat.toUpperCase() + '+' + recipe.result.stats[stat];
                      }).join(' ')})
                    </p>
                  )}
                  
                  {/* Materials */}
                  <div className="text-xs text-gray-400 mb-2">
                    {recipe.materials.map(function(mat, i) {
                      var have = getMaterialCount(mat.itemId);
                      return (
                        <span key={mat.itemId} className={have >= mat.quantity ? 'text-green-400' : 'text-red-400'}>
                          {mat.name} ({have}/{mat.quantity}){i < recipe.materials.length - 1 ? ', ' : ''}
                        </span>
                      );
                    })}
                  </div>
                  
                  <button 
                    onClick={function() { handleCraft(recipe); }} 
                    disabled={isLoading || !canCraft}
                    className={'w-full py-1 rounded text-sm ' + (canCraft ? 'bg-green-600 hover:bg-green-500' : 'bg-gray-700 opacity-50 cursor-not-allowed')}
                  >
                    Craft
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SPLIT MODAL */}
      {splitModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-void-800 rounded-xl p-6 w-full max-w-sm neon-border">
            <h3 className="font-display text-lg text-purple-400 mb-4">Split Stack</h3>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{getItemIcon(splitModal)}</span>
              <div>
                <p className="text-white">{splitModal.name}</p>
                <p className="text-gray-400">Have: {splitModal.quantity}</p>
              </div>
            </div>
            <div className="mb-4">
              <label className="text-gray-400 text-sm">Split amount:</label>
              <input type="number" value={splitQty} 
                onChange={function(e) { setSplitQty(Math.min(splitModal.quantity - 1, Math.max(1, parseInt(e.target.value) || 1))); }}
                className="input-field mt-1" min={1} max={splitModal.quantity - 1} />
            </div>
            <div className="flex gap-3">
              <button onClick={function() { setSplitModal(null); }} className="flex-1 btn-secondary">Cancel</button>
              <button onClick={handleSplitStack} disabled={isLoading}
                className="flex-1 btn-primary disabled:opacity-50">Split</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPanel;
