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

// Crafting Recipes
var CRAFTING_RECIPES = [
  { id: 'craft_bone_ring', name: 'Bone Ring', result: { itemId: 'tower1_ring_bone', name: 'Bone Ring', type: 'equipment', slot: 'ring', rarity: 'uncommon', stats: { pAtk: 3, hp: 20 } },
    materials: [{ itemId: 'death_knight_core', name: 'Death Knight Core', quantity: 5 }], icon: '💀' },
  { id: 'craft_cursed_amulet', name: 'Cursed Amulet', result: { itemId: 'tower1_necklace_cursed', name: 'Cursed Amulet', type: 'equipment', slot: 'necklace', rarity: 'rare', stats: { mAtk: 8, mp: 30 } },
    materials: [{ itemId: 'death_knight_core', name: 'Death Knight Core', quantity: 8 }, { itemId: 'ghost_essence', name: 'Ghost Essence', quantity: 5 }], icon: '📿' },
  { id: 'craft_frost_ring', name: 'Frost Ring', result: { itemId: 'tower2_ring_frost', name: 'Frost Ring', type: 'equipment', slot: 'ring', rarity: 'uncommon', stats: { mAtk: 5, mp: 25 } },
    materials: [{ itemId: 'frost_crystal', name: 'Frost Crystal', quantity: 10 }], icon: '❄️' },
  { id: 'craft_glacial_pendant', name: 'Glacial Pendant', result: { itemId: 'tower2_necklace_glacial', name: 'Glacial Pendant', type: 'equipment', slot: 'necklace', rarity: 'rare', stats: { mAtk: 12, pDef: 5, mp: 40 } },
    materials: [{ itemId: 'frost_crystal', name: 'Frost Crystal', quantity: 15 }, { itemId: 'frozen_heart', name: 'Frozen Heart', quantity: 3 }], icon: '💎' },
  { id: 'craft_shadow_band', name: 'Shadow Band', result: { itemId: 'tower3_ring_shadow', name: 'Shadow Band', type: 'equipment', slot: 'ring', rarity: 'rare', stats: { pAtk: 8, critRate: 3 } },
    materials: [{ itemId: 'shadow_essence', name: 'Shadow Essence', quantity: 12 }], icon: '🌑' },
  { id: 'craft_void_pendant', name: 'Void Pendant', result: { itemId: 'tower3_necklace_void', name: 'Void Pendant', type: 'equipment', slot: 'necklace', rarity: 'epic', stats: { mAtk: 15, critRate: 5, mp: 50 } },
    materials: [{ itemId: 'shadow_essence', name: 'Shadow Essence', quantity: 20 }, { itemId: 'dark_crystal', name: 'Dark Crystal', quantity: 5 }], icon: '🖤' },
  { id: 'craft_storm_ring', name: 'Storm Ring', result: { itemId: 'tower4_ring_storm', name: 'Storm Ring', type: 'equipment', slot: 'ring', rarity: 'rare', stats: { pAtk: 10, speed: 5 } },
    materials: [{ itemId: 'lightning_shard', name: 'Lightning Shard', quantity: 15 }], icon: '⚡' },
  { id: 'craft_tempest_amulet', name: 'Tempest Amulet', result: { itemId: 'tower4_necklace_tempest', name: 'Tempest Amulet', type: 'equipment', slot: 'necklace', rarity: 'epic', stats: { mAtk: 18, speed: 8, critRate: 4 } },
    materials: [{ itemId: 'lightning_shard', name: 'Lightning Shard', quantity: 25 }, { itemId: 'storm_core', name: 'Storm Core', quantity: 3 }], icon: '🌩️' },
  { id: 'craft_nature_ring', name: 'Nature Ring', result: { itemId: 'tower5_ring_nature', name: 'Nature Ring', type: 'equipment', slot: 'ring', rarity: 'rare', stats: { hp: 80, pDef: 8 } },
    materials: [{ itemId: 'verdant_sap', name: 'Verdant Sap', quantity: 18 }], icon: '🌿' },
  { id: 'craft_lifewood_pendant', name: 'Lifewood Pendant', result: { itemId: 'tower5_necklace_lifewood', name: 'Lifewood Pendant', type: 'equipment', slot: 'necklace', rarity: 'epic', stats: { hp: 120, pDef: 10, mDef: 10, hpRegen: 5 } },
    materials: [{ itemId: 'verdant_sap', name: 'Verdant Sap', quantity: 30 }, { itemId: 'ancient_bark', name: 'Ancient Bark', quantity: 5 }], icon: '🌳' },
  { id: 'craft_memory_crystal', name: 'Memory Crystal', result: { itemId: 'memory_crystal', name: 'Memory Crystal', type: 'special', rarity: 'legendary', stackable: false },
    materials: [{ itemId: 'memory_crystal_fragment', name: 'Memory Crystal Fragment', quantity: 15 }], icon: '🔷', special: true },
];

// ============================================================
// PHASE 9.3.8: Compact Item Display with Inline Buttons
// ============================================================

function isEquipmentType(item) {
  return item.type === 'equipment' || item.type === 'weapon' || item.type === 'armor' || item.type === 'accessory';
}

function getItemIcon(item) {
  if (item.icon && item.icon !== '📦') return item.icon;
  if (item.slot === 'weapon' || item.slot === 'mainHand') return '⚔️';
  if (item.slot === 'head') return '🧢';
  if (item.slot === 'body' || item.slot === 'chest') return '👕';
  if (item.slot === 'hands' || item.slot === 'gloves') return '🧤';
  if (item.slot === 'leg' || item.slot === 'legs') return '👖';
  if (item.slot === 'shoes' || item.slot === 'boots' || item.slot === 'feet') return '👢';
  if (item.slot === 'ring') return '💍';
  if (item.slot === 'necklace') return '📿';
  if (item.slot === 'offhand' || item.slot === 'leftHand' || item.slot === 'cape') return '🛡️';
  if (item.subtype === 'weapon') return '⚔️';
  if (item.subtype === 'armor') return '🛡️';
  if (item.subtype === 'potion') return '🧪';
  if (item.subtype === 'drop') return '🪨';
  if (item.type === 'material') return '🪨';
  if (item.type === 'consumable') return '🧪';
  if (isEquipmentType(item)) return '⚔️';
  if (item.type === 'scroll') return '📜';
  if (item.type === 'special') return '💎';
  return '📦';
}

function getItemEffect(item) {
  if (isEquipmentType(item) && item.stats) {
    var statList = [];
    var keys = Object.keys(item.stats);
    for (var i = 0; i < keys.length; i++) {
      statList.push(keys[i].toUpperCase() + '+' + item.stats[keys[i]]);
    }
    return statList.join(' ');
  }
  if (item.type === 'consumable') {
    if (item.effect) {
      if (item.effect.type === 'heal') return '+' + item.effect.value + ' HP';
      if (item.effect.type === 'mana') return '+' + item.effect.value + ' MP';
      if (item.effect.type === 'energy') return '+' + item.effect.value + ' Energy';
    }
    var name = (item.name || '').toLowerCase();
    if (name.includes('small health')) return '+50 HP';
    if (name.includes('medium health')) return '+150 HP';
    if (name.includes('large health')) return '+400 HP';
    if (name.includes('small mana')) return '+30 MP';
    if (name.includes('medium mana')) return '+80 MP';
    if (name.includes('large mana')) return '+200 MP';
    if (name.includes('antidote')) return 'Cure Poison';
    if (name.includes('escape')) return 'Exit Tower';
    if (name.includes('energy')) return '+20 Energy';
    return 'Use';
  }
  if (item.type === 'material') return 'Material';
  if (item.type === 'scroll') return 'Hidden Class';
  if (item.type === 'special') {
    if (item.itemId === 'memory_crystal') return 'Remove Class';
    return 'Special';
  }
  return '';
}

function getItemRequirements(item, character) {
  if (!isEquipmentType(item)) return null;
  var reqs = [];
  if (item.levelReq) {
    var meetsLevel = !character || character.level >= item.levelReq;
    reqs.push({ text: 'Lv.' + item.levelReq, met: meetsLevel });
  }
  if (item.classReq || item.class) {
    var reqClass = item.classReq || item.class;
    var meetsClass = !character || reqClass.toLowerCase() === character.baseClass.toLowerCase();
    reqs.push({ text: reqClass.charAt(0).toUpperCase() + reqClass.slice(1), met: meetsClass });
  }
  return reqs.length > 0 ? reqs : null;
}

var getRarityColor = function(rarity) {
  var colors = { common: 'text-gray-300', uncommon: 'text-green-400', rare: 'text-blue-400', epic: 'text-purple-400', legendary: 'text-amber-400' };
  return colors[rarity] || 'text-gray-300';
};

var getRarityBorder = function(rarity) {
  var colors = { common: 'border-gray-600', uncommon: 'border-green-500/50', rare: 'border-blue-500/50', epic: 'border-purple-500/50', legendary: 'border-amber-500/50' };
  return colors[rarity] || 'border-gray-600';
};

var getRarityBg = function(rarity) {
  var colors = { common: 'bg-gray-800/50', uncommon: 'bg-green-900/20', rare: 'bg-blue-900/20', epic: 'bg-purple-900/20', legendary: 'bg-amber-900/20' };
  return colors[rarity] || 'bg-gray-800/50';
};

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

  var handleCraft = async function(recipe) {
    setIsLoading(true);
    setCraftingMessage(null);
    try {
      if (recipe.id === 'craft_memory_crystal') {
        var response = await tavernAPI.craftMemoryCrystal();
        addLog('success', response.data.message);
        setCraftingMessage({ type: 'success', text: 'Crafted Memory Crystal!' });
      } else {
        var response = await tavernAPI.craftItem(recipe.id);
        addLog('success', response.data.message || 'Crafted ' + recipe.name + '!');
        setCraftingMessage({ type: 'success', text: 'Crafted ' + recipe.name + '!' });
      }
      await refreshCharacter();
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
  var isEquippable = function(item) { return isEquipmentType(item) && (item.slot || item.subtype); };
  var canSplit = function(item) { return item.stackable && item.quantity > 1; };

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

  var fragments = 0;
  for (var i = 0; i < inventory.length; i++) {
    if (inventory[i].itemId === 'memory_crystal_fragment') {
      fragments = inventory[i].quantity;
      break;
    }
  }
  
  var hasCrystal = inventory.some(function(item) { return item.itemId === 'memory_crystal'; });

  var getMaterialCount = function(itemId) {
    for (var i = 0; i < inventory.length; i++) {
      if (inventory[i].itemId === itemId) return inventory[i].quantity || 0;
    }
    return 0;
  };

  var canCraftRecipe = function(recipe) {
    for (var i = 0; i < recipe.materials.length; i++) {
      if (getMaterialCount(recipe.materials[i].itemId) < recipe.materials[i].quantity) return false;
    }
    return true;
  };

  var counts = { material: 0, consumable: 0, equipment: 0, scroll: 0 };
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
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display text-lg text-purple-400">📦 Inventory</h3>
            <span className="text-gray-400 text-sm">{inventory.length}/{character.inventorySize || 50}</span>
          </div>

          {/* Filter buttons */}
          <div className="flex gap-2 mb-3 flex-wrap">
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

          {/* Item List - COMPACT with inline buttons */}
          <div className="space-y-1 mb-3">
            {paginatedItems.map(function(item, idx) {
              var isSelected = selectedItem && selectedItem.itemId === item.itemId;
              var equipStatus = isEquipmentType(item) ? getEquipStatus(item) : null;
              var effect = getItemEffect(item);
              var requirements = getItemRequirements(item, character);
              
              return (
                <div 
                  key={idx}
                  onClick={function() { setSelectedItem(isSelected ? null : item); }}
                  className={'py-2 px-3 rounded-lg border cursor-pointer transition ' + getRarityBorder(item.rarity) + ' ' + getRarityBg(item.rarity) + ' ' + (isSelected ? 'ring-2 ring-purple-500' : 'hover:bg-void-700')}
                >
                  <div className="flex items-center gap-3">
                    {/* Icon */}
                    <span className="text-xl">{getItemIcon(item)}</span>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Name + Quantity */}
                      <div className="flex items-center gap-2">
                        <span className={getRarityColor(item.rarity) + ' font-medium text-sm'}>{item.name}</span>
                        {item.quantity > 1 && <span className="text-gray-500 text-xs">x{item.quantity}</span>}
                      </div>
                      {/* Requirements (equipment only) */}
                      {isEquipmentType(item) && requirements && (
                        <div className="flex gap-1">
                          {requirements.map(function(req, i) {
                            return (
                              <span key={i} className={'text-xs ' + (req.met ? 'text-green-400' : 'text-red-400')}>
                                {req.text}{req.met ? '✓' : '✗'}
                              </span>
                            );
                          })}
                        </div>
                      )}
                      {/* Effect */}
                      {effect && <p className="text-green-400 text-xs">({effect})</p>}
                    </div>
                    
                    {/* Action Buttons - INLINE on right */}
                    {isSelected && (
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {isUsable(item) && (
                          <button onClick={function(e) { e.stopPropagation(); handleUseItem(item.itemId); }} disabled={isLoading}
                            className="px-2 py-1 bg-green-600 hover:bg-green-500 rounded text-xs">Use</button>
                        )}
                        {isEquippable(item) && (
                          <button 
                            onClick={function(e) { e.stopPropagation(); handleEquipItem(item.itemId); }} 
                            disabled={isLoading || (equipStatus && !equipStatus.canEquip)}
                            className={'px-2 py-1 rounded text-xs ' + (equipStatus && equipStatus.canEquip ? 'bg-blue-600 hover:bg-blue-500' : 'bg-gray-600 opacity-50')}
                          >
                            Equip
                          </button>
                        )}
                        {canSplit(item) && (
                          <button onClick={function(e) { e.stopPropagation(); setSplitModal(item); setSplitQty(1); }} disabled={isLoading}
                            className="px-2 py-1 bg-gray-600 hover:bg-gray-500 rounded text-xs">Split</button>
                        )}
                        <button onClick={function(e) { e.stopPropagation(); handleDiscardItem(item.itemId); }} disabled={isLoading}
                          className="px-2 py-1 bg-red-600/80 hover:bg-red-600 rounded text-xs">🗑️</button>
                      </div>
                    )}
                  </div>
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
                className="px-3 py-1 bg-void-700 rounded disabled:opacity-50 text-sm">←</button>
              <span className="text-gray-400 text-sm">{currentPage + 1} / {totalPages}</span>
              <button onClick={function() { setCurrentPage(Math.min(totalPages - 1, currentPage + 1)); }} disabled={currentPage >= totalPages - 1}
                className="px-3 py-1 bg-void-700 rounded disabled:opacity-50 text-sm">→</button>
            </div>
          )}
        </div>
      )}

      {/* EQUIPMENT TAB */}
      {activeTab === 'equipment' && (
        <div className="bg-void-800/50 rounded-xl p-4 neon-border">
          <h3 className="font-display text-lg text-purple-400 mb-3">⚔️ Equipment</h3>
          
          <div className="grid grid-cols-2 gap-2 mb-3">
            {EQUIPMENT_SLOTS.map(function(slot) {
              var equippedItem = character.equipment ? character.equipment[slot.id] : null;
              return (
                <div key={slot.id} className={'p-2 rounded-lg border ' + (equippedItem ? 'border-purple-500/50 bg-purple-900/20' : 'border-gray-700 bg-void-900/50')}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{equippedItem ? getItemIcon(equippedItem) : slot.icon}</span>
                      <div>
                        <p className="text-xs text-gray-500">{slot.name}</p>
                        <p className={'text-xs truncate max-w-[80px] ' + (equippedItem ? 'text-white' : 'text-gray-600')}>
                          {equippedItem ? equippedItem.name : 'Empty'}
                        </p>
                      </div>
                    </div>
                    {equippedItem && (
                      <button onClick={function() { handleUnequipItem(slot.id); }} disabled={isLoading}
                        className="px-1.5 py-0.5 bg-red-600/50 hover:bg-red-600 rounded text-xs">✕</button>
                    )}
                  </div>
                  {equippedItem && equippedItem.stats && (
                    <p className="text-green-400 text-xs mt-1">({getItemEffect(equippedItem)})</p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Equipment Stats Summary */}
          <div className="p-2 rounded-lg border border-gray-700 bg-void-900/50">
            <p className="text-xs text-gray-400 mb-1">Total Bonuses:</p>
            <div className="flex flex-wrap gap-1">
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
                if (statKeys.length === 0) return <span className="text-gray-500 text-xs">None</span>;
                return statKeys.map(function(stat) {
                  return <span key={stat} className="px-1.5 py-0.5 bg-green-900/30 rounded text-xs text-green-400">{stat.toUpperCase()}+{totalStats[stat]}</span>;
                });
              })()}
            </div>
          </div>
        </div>
      )}

      {/* CRAFT TAB */}
      {activeTab === 'craft' && (
        <div className="bg-void-800/50 rounded-xl p-4 neon-border">
          <h3 className="font-display text-lg text-purple-400 mb-3">🔨 Crafting</h3>
          
          {craftingMessage && (
            <div className={'p-2 rounded-lg mb-3 ' + (craftingMessage.type === 'success' ? 'bg-green-900/30 border border-green-500/30' : 'bg-red-900/30 border border-red-500/30')}>
              <p className={'text-xs ' + (craftingMessage.type === 'success' ? 'text-green-400' : 'text-red-400')}>
                {craftingMessage.type === 'success' ? '✓' : '✗'} {craftingMessage.text}
              </p>
            </div>
          )}

          {/* Memory Crystal */}
          <div className="bg-void-900/50 p-3 rounded-lg mb-3 border border-purple-500/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🔷</span>
                <div>
                  <p className="text-white text-sm font-bold">Memory Crystal</p>
                  <p className="text-gray-400 text-xs">15x 💠 Fragment ({fragments}/15)</p>
                </div>
              </div>
              <button onClick={handleCraftMemoryCrystal} disabled={isLoading || fragments < 15}
                className="px-3 py-1 bg-purple-600 hover:bg-purple-500 rounded text-xs disabled:opacity-50">Craft</button>
            </div>
          </div>

          {hasCrystal && character.hiddenClass !== 'none' && (
            <div className="bg-purple-900/30 p-3 rounded-lg border border-purple-500/50 mb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-400 text-sm font-bold">Remove Hidden Class</p>
                  <p className="text-gray-400 text-xs">Current: {character.hiddenClass} (returns scroll)</p>
                </div>
                <button onClick={handleUseMemoryCrystal} disabled={isLoading}
                  className="px-3 py-1 bg-purple-600 hover:bg-purple-500 rounded text-xs">Use</button>
              </div>
            </div>
          )}

          <h4 className="text-gray-300 text-sm mb-2">📜 Equipment Recipes</h4>
          <div className="space-y-2">
            {CRAFTING_RECIPES.filter(function(r) { return !r.special; }).map(function(recipe) {
              var canCraft = canCraftRecipe(recipe);
              return (
                <div key={recipe.id} className={'p-2 rounded-lg border ' + (canCraft ? 'border-green-500/30 bg-green-900/10' : 'border-gray-700/50 bg-void-900/50')}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{recipe.icon}</span>
                      <div>
                        <span className={getRarityColor(recipe.result.rarity) + ' text-sm'}>{recipe.name}</span>
                        {recipe.result.stats && (
                          <p className="text-green-400 text-xs">
                            ({Object.keys(recipe.result.stats).map(function(s) { return s.toUpperCase() + '+' + recipe.result.stats[s]; }).join(' ')})
                          </p>
                        )}
                      </div>
                    </div>
                    <button onClick={function() { handleCraft(recipe); }} disabled={isLoading || !canCraft}
                      className={'px-3 py-1 rounded text-xs ' + (canCraft ? 'bg-green-600 hover:bg-green-500' : 'bg-gray-700 opacity-50')}>
                      Craft
                    </button>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {recipe.materials.map(function(mat, i) {
                      var have = getMaterialCount(mat.itemId);
                      return (
                        <span key={mat.itemId} className={have >= mat.quantity ? 'text-green-400' : 'text-red-400'}>
                          {mat.name} ({have}/{mat.quantity}){i < recipe.materials.length - 1 ? ', ' : ''}
                        </span>
                      );
                    })}
                  </div>
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
                <p className="text-gray-400 text-sm">Have: {splitModal.quantity}</p>
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
