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

// Item descriptions by type/subtype
var ITEM_DESCRIPTIONS = {
  // Materials - Tower 1
  bone_fragment: 'Common drop from undead. Used for basic crafting.',
  cursed_cloth: 'Tattered cloth infused with dark energy.',
  ghost_essence: 'Ethereal essence from defeated spirits. Used for crafting.',
  dark_crystal: 'A crystal pulsing with shadow energy.',
  death_mark: 'A sinister mark left by powerful undead.',
  soul_shard: 'Fragment of a departed soul.',
  death_knight_core: '💀 Core from a Death Knight. Craft: Bone Ring (5x), Cursed Amulet (8x)',
  
  // Materials - Tower 2
  frost_crystal: '❄️ Frozen crystal shard. Craft: Frost Ring (10x), Glacial Pendant (15x)',
  ice_shard: 'Sharp fragment of magical ice.',
  frozen_heart: '💙 Rare drop from ice elementals. Used for crafting.',
  permafrost_chunk: 'Never-melting ice from the citadel depths.',
  
  // Materials - Tower 3
  shadow_essence: '🌑 Dark essence from shadow creatures. Craft: Shadow Band (12x), Void Pendant (20x)',
  dark_crystal: '🖤 Crystal of pure darkness. Used for advanced crafting.',
  nightmare_dust: 'Residue from dark dreams.',
  void_fragment: 'A piece of the void itself.',
  
  // Materials - Tower 4
  lightning_shard: '⚡ Charged crystal shard. Craft: Storm Ring (15x), Tempest Amulet (25x)',
  storm_core: '🌩️ Core of a storm elemental. Used for crafting.',
  thunder_essence: 'Bottled lightning energy.',
  
  // Materials - Tower 5
  verdant_sap: '🌿 Living sap from ancient trees. Craft: Nature Ring (18x), Lifewood Pendant (30x)',
  ancient_bark: '🌳 Bark from millennial trees. Used for crafting.',
  poison_gland: 'Venomous gland from creatures.',
  
  // Special
  memory_crystal_fragment: '💠 Combine 15 to craft Memory Crystal.',
  memory_crystal: '🔷 Use to remove Hidden Class and receive scroll back.',
  
  // Consumables
  health_potion_small: 'Restores 100 HP when used.',
  health_potion_medium: 'Restores 300 HP when used.',
  health_potion_large: 'Restores 600 HP when used.',
  mana_potion_small: 'Restores 50 MP when used.',
  mana_potion_medium: 'Restores 150 MP when used.',
  mana_potion_large: 'Restores 300 MP when used.',
  antidote: 'Cures poison status effect.',
  energy_drink: 'Restores 20 Energy.',
};

// Get icon based on item type/subtype
function getItemIcon(item) {
  if (item.icon && item.icon !== '📦') return item.icon;
  
  // By slot for equipment
  if (item.slot === 'weapon' || item.slot === 'leftHand') return '⚔️';
  if (item.slot === 'head') return '🧢';
  if (item.slot === 'body' || item.slot === 'chest') return '👕';
  if (item.slot === 'leg' || item.slot === 'legs') return '👖';
  if (item.slot === 'shoes' || item.slot === 'boots') return '👢';
  if (item.slot === 'ring') return '💍';
  if (item.slot === 'necklace') return '📿';
  if (item.slot === 'rightHand' || item.slot === 'offhand') return '🛡️';
  
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
  if (item.type === 'equipment') return '⚔️';
  if (item.type === 'scroll') return '📜';
  if (item.type === 'special') return '💎';
  
  return '📦';
}

// Get description for item
function getItemDescription(item) {
  // Check specific item ID first
  if (ITEM_DESCRIPTIONS[item.itemId]) {
    return ITEM_DESCRIPTIONS[item.itemId];
  }
  
  // Check if item has description field
  if (item.description) {
    return item.description;
  }
  
  // Generate description based on type
  if (item.type === 'equipment') {
    var desc = '';
    if (item.classReq) desc += 'Class: ' + item.classReq.charAt(0).toUpperCase() + item.classReq.slice(1) + '. ';
    if (item.levelReq) desc += 'Lv.' + item.levelReq + '+ required. ';
    if (item.stats) {
      var statList = [];
      var keys = Object.keys(item.stats);
      for (var i = 0; i < keys.length; i++) {
        statList.push(keys[i].toUpperCase() + '+' + item.stats[keys[i]]);
      }
      if (statList.length > 0) desc += 'Stats: ' + statList.join(', ');
    }
    return desc || 'Equippable item.';
  }
  
  if (item.type === 'consumable') {
    if (item.effect) {
      if (item.effect.type === 'heal') return 'Restores ' + item.effect.value + ' HP.';
      if (item.effect.type === 'mana') return 'Restores ' + item.effect.value + ' MP.';
      if (item.effect.type === 'energy') return 'Restores ' + item.effect.value + ' Energy.';
    }
    return 'Consumable item.';
  }
  
  if (item.type === 'material') {
    return 'Crafting material. Can be sold or traded.';
  }
  
  if (item.type === 'scroll') {
    return 'Hidden Class scroll. Use to unlock special abilities.';
  }
  
  return '';
}

// Map slot names to equipment slot IDs
// PHASE 9.3.3 FIX: Corrected weapon→rightHand mapping
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

var InventoryPanel = function(props) {
  var character = props.character;
  var onCharacterUpdate = props.onCharacterUpdate;
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
  // PHASE 9.3.3 FIX: Equipment filter also includes weapon/armor types from DB
  var filteredInventory = inventory.filter(function(item) {
    if (filter === 'all') return true;
    if (filter === 'material') return item.type === 'material';
    if (filter === 'consumable') return item.type === 'consumable';
    if (filter === 'equipment') return item.type === 'equipment' || item.type === 'weapon' || item.type === 'armor' || item.type === 'accessory';
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
      onCharacterUpdate();
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
      onCharacterUpdate();
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
      onCharacterUpdate();
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
      onCharacterUpdate();
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
      onCharacterUpdate();
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
      // Special case for memory crystal
      if (recipe.id === 'craft_memory_crystal') {
        var response = await tavernAPI.craftMemoryCrystal();
        addLog('success', response.data.message);
        onCharacterUpdate();
        setCraftingMessage({ type: 'success', text: 'Crafted Memory Crystal!' });
      } else {
        // Generic craft API call
        var response = await tavernAPI.craftItem(recipe.id);
        addLog('success', response.data.message || 'Crafted ' + recipe.name + '!');
        onCharacterUpdate();
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
      onCharacterUpdate();
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
      onCharacterUpdate();
    } catch (err) {
      addLog('error', err.response?.data?.error || 'Failed');
    }
    setIsLoading(false);
  };

  var isUsable = function(item) { return item.type === 'consumable'; };
  
  // Check if item can be equipped (has slot/subtype and is equipment/weapon/armor type)
  // PHASE 9.3.3 FIX: Also accept type 'weapon' and 'armor' from equipment database
  var isEquippable = function(item) { 
    var isEquipType = item.type === 'equipment' || item.type === 'weapon' || item.type === 'armor' || item.type === 'accessory';
    var hasSlot = item.slot || item.subtype;
    return isEquipType && hasSlot;
  };
  
  // Check equipment requirements and return status
  // PHASE 9.3.3 FIX: Also accept type 'weapon' and 'armor' from equipment database
  var getEquipStatus = function(item) {
    var isEquipType = item.type === 'equipment' || item.type === 'weapon' || item.type === 'armor' || item.type === 'accessory';
    if (!isEquipType) return { canEquip: false, reason: 'Not equipment' };
    
    var reasons = [];
    var canEquip = true;
    
    // Check level requirement
    if (item.levelReq && character.level < item.levelReq) {
      canEquip = false;
      reasons.push('Requires Lv.' + item.levelReq + ' (You: Lv.' + character.level + ')');
    }
    
    // Check class requirement
    if (item.classReq || item.class) {
      var reqClass = (item.classReq || item.class).toLowerCase();
      var playerClass = character.baseClass.toLowerCase();
      if (reqClass !== playerClass && reqClass !== 'all' && reqClass !== 'any') {
        canEquip = false;
        reasons.push('Requires ' + reqClass.charAt(0).toUpperCase() + reqClass.slice(1) + ' class');
      }
    }
    
    // Check if has valid slot
    if (!item.slot && !item.subtype) {
      canEquip = false;
      reasons.push('Missing equipment slot');
    }
    
    return {
      canEquip: canEquip,
      reason: reasons.length > 0 ? reasons.join(', ') : null
    };
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

  // Count items by type for filter badges
  // PHASE 9.3.3 FIX: Count weapon/armor types as equipment
  var counts = { material: 0, consumable: 0, equipment: 0, scroll: 0 };
  for (var k = 0; k < inventory.length; k++) {
    var type = inventory[k].type;
    if (type === 'material') counts.material++;
    else if (type === 'consumable') counts.consumable++;
    else if (type === 'equipment' || type === 'weapon' || type === 'armor' || type === 'accessory') counts.equipment++;
    else if (type === 'scroll' || type === 'special') counts.scroll++;
  }

  return (
    <div className="space-y-4">
      {/* Tabs */}
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
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-display text-lg text-purple-400">📦 Inventory</h3>
            <span className="text-gray-400 text-sm">{inventory.length}/{character.inventorySize}</span>
          </div>

          {/* Filters */}
          <div className="flex gap-1 mb-3 flex-wrap">
            <button onClick={function() { handleFilterChange('all'); }}
              className={'px-3 py-1 rounded text-xs ' + (filter === 'all' ? 'bg-purple-600 text-white' : 'bg-void-700 text-gray-400')}>
              All ({inventory.length})
            </button>
            <button onClick={function() { handleFilterChange('material'); }}
              className={'px-3 py-1 rounded text-xs ' + (filter === 'material' ? 'bg-purple-600 text-white' : 'bg-void-700 text-gray-400')}>
              🪨 Material ({counts.material})
            </button>
            <button onClick={function() { handleFilterChange('consumable'); }}
              className={'px-3 py-1 rounded text-xs ' + (filter === 'consumable' ? 'bg-purple-600 text-white' : 'bg-void-700 text-gray-400')}>
              🧪 Consumable ({counts.consumable})
            </button>
            <button onClick={function() { handleFilterChange('equipment'); }}
              className={'px-3 py-1 rounded text-xs ' + (filter === 'equipment' ? 'bg-purple-600 text-white' : 'bg-void-700 text-gray-400')}>
              ⚔️ Equipment ({counts.equipment})
            </button>
            <button onClick={function() { handleFilterChange('scroll'); }}
              className={'px-3 py-1 rounded text-xs ' + (filter === 'scroll' ? 'bg-purple-600 text-white' : 'bg-void-700 text-gray-400')}>
              📜 Special ({counts.scroll})
            </button>
          </div>

          {/* Item List */}
          <div className="space-y-2 mb-4">
            {paginatedItems.map(function(item, idx) {
              var isSelected = selectedItem && selectedItem.itemId === item.itemId;
              var equipStatus = item.type === 'equipment' ? getEquipStatus(item) : null;
              
              return (
                <div key={idx} 
                  onClick={function() { setSelectedItem(isSelected ? null : item); }}
                  className={'p-3 rounded-lg cursor-pointer transition border ' + getRarityBorder(item.rarity) + ' ' + getRarityBg(item.rarity) + ' ' + (isSelected ? 'ring-2 ring-purple-500' : 'hover:bg-void-700')}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getItemIcon(item)}</span>
                      <div>
                        <span className={getRarityColor(item.rarity) + ' font-medium'}>{item.name}</span>
                        <span className="text-gray-500 text-sm ml-2">x{item.quantity}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.type === 'equipment' && equipStatus && !equipStatus.canEquip && (
                        <span className="text-xs text-red-400">⚠️</span>
                      )}
                      <span className="text-xs text-gray-500">{item.type}</span>
                    </div>
                  </div>
                  
                  {/* Expanded Details */}
                  {isSelected && (
                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <p className="text-gray-400 text-sm mb-2">{getItemDescription(item)}</p>
                      
                      {/* Stats for equipment */}
                      {item.stats && Object.keys(item.stats).length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {Object.keys(item.stats).map(function(stat) {
                            return (
                              <span key={stat} className="px-2 py-1 bg-void-900 rounded text-xs text-green-400">
                                {stat.toUpperCase()} +{item.stats[stat]}
                              </span>
                            );
                          })}
                        </div>
                      )}
                      
                      {/* Equipment Requirements */}
                      {item.type === 'equipment' && (
                        <div className="mb-2 space-y-1">
                          {item.levelReq && (
                            <p className={'text-xs ' + (character.level >= item.levelReq ? 'text-green-400' : 'text-red-400')}>
                              📊 Level Required: {item.levelReq} {character.level >= item.levelReq ? '✓' : '(You: Lv.' + character.level + ')'}
                            </p>
                          )}
                          {(item.classReq || item.class) && (
                            <p className={'text-xs ' + ((item.classReq || item.class).toLowerCase() === character.baseClass.toLowerCase() ? 'text-green-400' : 'text-red-400')}>
                              👤 Class Required: {(item.classReq || item.class).charAt(0).toUpperCase() + (item.classReq || item.class).slice(1)}
                              {(item.classReq || item.class).toLowerCase() !== character.baseClass.toLowerCase() && ' (You: ' + character.baseClass + ')'}
                            </p>
                          )}
                          {item.slot && (
                            <p className="text-xs text-gray-400">
                              📍 Slot: {item.slot.charAt(0).toUpperCase() + item.slot.slice(1)}
                            </p>
                          )}
                        </div>
                      )}
                      
                      {/* Equip status warning */}
                      {equipStatus && !equipStatus.canEquip && (
                        <div className="mb-2 p-2 bg-red-900/30 border border-red-500/30 rounded">
                          <p className="text-xs text-red-400">⚠️ Cannot equip: {equipStatus.reason}</p>
                        </div>
                      )}
                      
                      {/* Action buttons */}
                      <div className="flex gap-2 flex-wrap">
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
                          className="px-3 py-1 bg-red-600 hover:bg-red-500 rounded text-xs">🗑️ Discard</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {filteredInventory.length === 0 && (
              <p className="text-gray-500 text-center py-4">
                {filter === 'all' ? 'Inventory is empty' : 'No ' + filter + ' items'}
              </p>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <button onClick={function() { setCurrentPage(Math.max(0, currentPage - 1)); }} disabled={currentPage === 0}
                className="px-3 py-1 bg-void-700 rounded disabled:opacity-50">←</button>
              <span className="text-gray-400 py-1">{currentPage + 1} / {totalPages}</span>
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
          <div className="grid grid-cols-2 gap-3">
            {EQUIPMENT_SLOTS.map(function(slot) {
              var equipped = character.equipment?.[slot.id];
              var hasItem = equipped && equipped.itemId;
              return (
                <div key={slot.id} className={'p-3 rounded-lg border ' + (hasItem ? 'border-purple-500/50 ' + getRarityBg(equipped.rarity) : 'bg-void-900/50 border-gray-700/50')}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-xs">{slot.name}</span>
                    <span className="text-lg">{slot.icon}</span>
                  </div>
                  {hasItem ? (
                    <div>
                      <div className="flex items-center gap-2">
                        <span>{equipped.icon || getItemIcon(equipped)}</span>
                        <span className={getRarityColor(equipped.rarity) + ' text-sm'}>{equipped.name}</span>
                      </div>
                      {equipped.stats && (
                        <div className="text-xs text-green-400 mt-1">
                          {Object.keys(equipped.stats).map(function(k) { return k.toUpperCase() + '+' + equipped.stats[k]; }).join(' ')}
                        </div>
                      )}
                      <button onClick={function() { handleUnequipItem(slot.id); }} disabled={isLoading}
                        className="mt-2 w-full px-2 py-1 bg-red-600/50 hover:bg-red-600 rounded text-xs">Unequip</button>
                    </div>
                  ) : (
                    <p className="text-gray-600 text-xs">Empty</p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Total Stats from Equipment */}
          <div className="mt-4 p-3 bg-void-900/50 rounded-lg">
            <h4 className="text-sm font-bold text-gray-400 mb-2">Equipment Bonus</h4>
            <div className="flex flex-wrap gap-2">
              {(function() {
                var totalStats = {};
                EQUIPMENT_SLOTS.forEach(function(slot) {
                  var eq = character.equipment?.[slot.id];
                  if (eq && eq.stats) {
                    Object.keys(eq.stats).forEach(function(stat) {
                      totalStats[stat] = (totalStats[stat] || 0) + eq.stats[stat];
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
                <p className="text-gray-400 text-sm">Use to remove Hidden Class (returns scroll)</p>
              </div>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400">Requires: 15x 💠 Memory Crystal Fragment</span>
              <span className={'text-sm ' + (fragments >= 15 ? 'text-green-400' : 'text-red-400')}>
                Have: {fragments}/15
              </span>
            </div>
            <button onClick={handleCraftMemoryCrystal} disabled={isLoading || fragments < 15}
              className="w-full btn-primary disabled:opacity-50">Craft Memory Crystal</button>
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
              <p className="text-yellow-400 text-sm mb-3">⚠️ You will lose all hidden class skills but get the scroll back!</p>
              <button onClick={handleUseMemoryCrystal} disabled={isLoading}
                className="w-full bg-purple-600 hover:bg-purple-500 py-2 rounded">Use Memory Crystal</button>
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
                      {canCraft ? '✓ Can Craft' : '✗ Missing Materials'}
                    </span>
                  </div>
                  
                  {/* Result preview */}
                  {recipe.result.stats && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {Object.keys(recipe.result.stats).map(function(stat) {
                        return (
                          <span key={stat} className="px-2 py-0.5 bg-void-800 rounded text-xs text-green-400">
                            {stat.toUpperCase()} +{recipe.result.stats[stat]}
                          </span>
                        );
                      })}
                    </div>
                  )}
                  
                  {/* Materials */}
                  <div className="text-xs text-gray-400 mb-2">
                    Materials: {recipe.materials.map(function(mat, i) {
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
