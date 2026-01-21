import React, { useState } from 'react';
import { tavernAPI } from '../services/api';

var EQUIPMENT_SLOTS = [
  { id: 'head', name: 'Head', icon: '🧢' },
  { id: 'body', name: 'Body', icon: '👕' },
  { id: 'leg', name: 'Hands', icon: '🧤' },
  { id: 'shoes', name: 'Feet', icon: '👢' },
  { id: 'rightHand', name: 'Weapon', icon: '⚔️' },
  { id: 'leftHand', name: 'Cape', icon: '🧥' },
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
  return item.type === 'equipment' || item.type === 'weapon' || item.type === 'armor' || item.type === 'accessory' || item.type === 'vip_equipment';
}

// ============================================================
// PHASE 9.6.3: Hidden Class Scroll Detection
// ============================================================
function isHiddenClassScroll(item) {
  return item.type === 'hidden_class_scroll' || 
         item.type === 'scroll' ||
         (item.name && item.name.toLowerCase().includes('scroll') && item.hiddenClass) ||
         (item.itemId && item.itemId.endsWith('_scroll'));
}

// Base class mapping for scrolls
var SCROLL_BASE_CLASS_MAP = {
  // Swordsman scrolls
  flameblade: 'swordsman', berserker: 'swordsman', paladin: 'swordsman',
  earthshaker: 'swordsman', frostguard: 'swordsman',
  // Thief scrolls
  shadowDancer: 'thief', venomancer: 'thief', assassin: 'thief',
  phantom: 'thief', bloodreaper: 'thief',
  // Archer scrolls
  stormRanger: 'archer', pyroArcher: 'archer', frostSniper: 'archer',
  natureWarden: 'archer', voidHunter: 'archer',
  // Mage scrolls
  frostWeaver: 'mage', pyromancer: 'mage', stormcaller: 'mage',
  necromancer: 'mage', arcanist: 'mage'
};

function getScrollBaseClass(item) {
  // Check direct baseClass property
  if (item.baseClass) return item.baseClass.toLowerCase();
  
  // Check hiddenClass and map to base class
  if (item.hiddenClass && SCROLL_BASE_CLASS_MAP[item.hiddenClass]) {
    return SCROLL_BASE_CLASS_MAP[item.hiddenClass];
  }
  
  // Try to extract from itemId (e.g., frostSniper_scroll -> frostSniper)
  if (item.itemId && item.itemId.endsWith('_scroll')) {
    var hiddenClass = item.itemId.replace('_scroll', '');
    if (SCROLL_BASE_CLASS_MAP[hiddenClass]) {
      return SCROLL_BASE_CLASS_MAP[hiddenClass];
    }
  }
  
  return null;
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
  if (item.slot === 'offhand' || item.slot === 'leftHand' || item.slot === 'cape') return '🧥';
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

// ============================================================
// PHASE 9.9.4: Format stat names for display
// Handles both flat stats and percentage stats
// ============================================================
function formatStatName(statKey) {
  var statNames = {
    // Flat stats
    pAtk: 'P.ATK', mAtk: 'M.ATK', pDef: 'P.DEF', mDef: 'M.DEF',
    hp: 'HP', mp: 'MP', str: 'STR', agi: 'AGI', dex: 'DEX', int: 'INT', vit: 'VIT',
    critRate: 'CRIT', critDmg: 'CRIT DMG',
    // Percentage stats
    pAtkPercent: 'P.ATK', mAtkPercent: 'M.ATK', 
    pDefPercent: 'P.DEF', mDefPercent: 'M.DEF',
    hpPercent: 'HP', mpPercent: 'MP',
    critRatePercent: 'CRIT', critDmgPercent: 'CRIT DMG',
    // Special bonuses
    expBonus: 'EXP', goldBonus: 'GOLD'
  };
  return statNames[statKey] || statKey.toUpperCase();
}

function isPercentStat(statKey) {
  return statKey.includes('Percent') || statKey === 'expBonus' || statKey === 'goldBonus';
}

function formatStat(statKey, value) {
  var name = formatStatName(statKey);
  if (isPercentStat(statKey)) {
    return '+' + value + '% ' + name;
  }
  return name + '+' + value;
}

function getItemEffect(item) {
  if (isEquipmentType(item) && item.stats) {
    var statList = [];
    var keys = Object.keys(item.stats);
    for (var i = 0; i < keys.length; i++) {
      statList.push(formatStat(keys[i], item.stats[keys[i]]));
    }
    return statList.join(' ');
  }
  if (item.type === 'consumable') {
    // FIXED: Check effect object first and use its value
    if (item.effect) {
      if (item.effect.type === 'heal') return '+' + item.effect.value + ' HP';
      if (item.effect.type === 'mana') return '+' + item.effect.value + ' MP';
      if (item.effect.type === 'restore_energy') return '+' + item.effect.value + ' Energy';
      if (item.effect.type === 'energy') return '+' + item.effect.value + ' Energy';
    }
    // Fallback for items without effect object (legacy support)
    var name = (item.name || '').toLowerCase();
    if (name.includes('small health')) return '+50 HP';
    if (name.includes('medium health')) return '+150 HP';
    if (name.includes('large health')) return '+400 HP';
    if (name.includes('small mana')) return '+30 MP';
    if (name.includes('medium mana')) return '+80 MP';
    if (name.includes('large mana')) return '+200 MP';
    if (name.includes('antidote')) return 'Cure Poison';
    if (name.includes('escape')) return 'Exit Tower';
    // Removed hardcoded energy fallback - should use effect.value
    return 'Use';
  }
  return '';
}

// ============================================================
// PHASE 9.9.4: Format stat badge for total bonuses display
// ============================================================
function formatStatBadge(statKey, value) {
  var name = formatStatName(statKey);
  if (isPercentStat(statKey)) {
    return '+' + value + '% ' + name;
  }
  return name + '+' + value;
}

function getRarityColor(rarity) {
  var colors = {
    common: 'text-gray-300',
    uncommon: 'text-green-400',
    rare: 'text-blue-400',
    epic: 'text-purple-400',
    legendary: 'text-amber-400'
  };
  return colors[rarity] || 'text-gray-300';
}

function getRarityBorder(rarity) {
  var colors = {
    common: 'border-gray-600',
    uncommon: 'border-green-600',
    rare: 'border-blue-600',
    epic: 'border-purple-600',
    legendary: 'border-amber-500'
  };
  return colors[rarity] || 'border-gray-600';
}

var InventoryPanel = function(props) {
  var character = props.character;
  var onUpdate = props.onUpdate;
  var inTower = props.inTower;
  var activeTab = useState('inventory');
  var inventoryFilter = useState('all');
  var currentPage = useState(0);
  var isLoading = useState(false);
  var splitModal = useState(null);
  var splitQty = useState(1);
  var craftingMessage = useState(null);

  var setActiveTab = activeTab[1]; activeTab = activeTab[0];
  var setInventoryFilter = inventoryFilter[1]; inventoryFilter = inventoryFilter[0];
  var setCurrentPage = currentPage[1]; currentPage = currentPage[0];
  var setIsLoading = isLoading[1]; isLoading = isLoading[0];
  var setSplitModal = splitModal[1]; splitModal = splitModal[0];
  var setSplitQty = splitQty[1]; splitQty = splitQty[0];
  var setCraftingMessage = craftingMessage[1]; craftingMessage = craftingMessage[0];

  // PHASE 9.6.6: Check how many memory crystal fragments the player has
  var fragments = 0;
  var hasCrystal = false;
  if (character && character.inventory) {
    var fragItem = character.inventory.find(function(i) { return i.itemId === 'memory_crystal_fragment'; });
    if (fragItem) fragments = fragItem.quantity || 0;
    hasCrystal = character.inventory.some(function(i) { return i.itemId === 'memory_crystal'; });
  }

  var handleEquip = async function(itemId) {
    setIsLoading(true);
    try {
      var response = await tavernAPI.equipItem(itemId);
      if (onUpdate) onUpdate(response.data);
    } catch (err) {
      console.error('Equip failed:', err);
      alert(err.response?.data?.error || 'Failed to equip');
    }
    setIsLoading(false);
  };

  var handleUnequip = async function(slot) {
    setIsLoading(true);
    try {
      var response = await tavernAPI.unequipItem(slot);
      if (onUpdate) onUpdate(response.data);
    } catch (err) {
      console.error('Unequip failed:', err);
      alert(err.response?.data?.error || 'Failed to unequip');
    }
    setIsLoading(false);
  };

  var handleSell = async function(itemId) {
    if (!confirm('Sell this item?')) return;
    setIsLoading(true);
    try {
      var response = await tavernAPI.sellItem(itemId, 1);
      if (onUpdate) onUpdate(response.data);
    } catch (err) {
      console.error('Sell failed:', err);
      alert(err.response?.data?.error || 'Failed to sell');
    }
    setIsLoading(false);
  };

  var handleUse = async function(item) {
    setIsLoading(true);
    try {
      // Use correct endpoint for consumables
      if (item.type === 'consumable') {
        var response = await tavernAPI.useItem(item.itemId);
        if (onUpdate) onUpdate(response.data);
      } else if (isHiddenClassScroll(item)) {
        // Hidden class scroll
        var scrollResponse = await tavernAPI.useScroll(item.itemId);
        if (onUpdate) onUpdate(scrollResponse.data);
        if (scrollResponse.data.message) {
          alert(scrollResponse.data.message);
        }
      }
    } catch (err) {
      console.error('Use failed:', err);
      alert(err.response?.data?.error || 'Failed to use item');
    }
    setIsLoading(false);
  };

  var handleSplitStack = async function() {
    if (!splitModal) return;
    setIsLoading(true);
    try {
      var response = await tavernAPI.splitStack(splitModal.itemId, splitQty);
      if (onUpdate) onUpdate(response.data);
      setSplitModal(null);
    } catch (err) {
      console.error('Split failed:', err);
      alert(err.response?.data?.error || 'Failed to split');
    }
    setIsLoading(false);
  };

  var handleCombine = async function(itemId) {
    setIsLoading(true);
    try {
      var response = await tavernAPI.combineStacks(itemId);
      if (onUpdate) onUpdate(response.data);
    } catch (err) {
      console.error('Combine failed:', err);
      alert(err.response?.data?.error || 'Failed to combine');
    }
    setIsLoading(false);
  };

  // PHASE 9.6.6: Craft Memory Crystal
  var handleCraftMemoryCrystal = async function() {
    if (fragments < 15) {
      setCraftingMessage({ type: 'error', text: 'Need 15 fragments. Have: ' + fragments });
      return;
    }
    setIsLoading(true);
    try {
      var response = await tavernAPI.craftMemoryCrystal();
      if (onUpdate) onUpdate(response.data);
      setCraftingMessage({ type: 'success', text: response.data.message || 'Memory Crystal crafted!' });
    } catch (err) {
      console.error('Craft failed:', err);
      setCraftingMessage({ type: 'error', text: err.response?.data?.error || 'Failed to craft' });
    }
    setIsLoading(false);
  };

  // PHASE 9.6.6: Use Memory Crystal to remove hidden class
  var handleUseMemoryCrystal = async function() {
    if (!confirm('Use Memory Crystal to remove your hidden class? You will receive the scroll back.')) return;
    setIsLoading(true);
    try {
      var response = await tavernAPI.useMemoryCrystal();
      if (onUpdate) onUpdate(response.data);
      setCraftingMessage({ type: 'success', text: response.data.message || 'Hidden class removed!' });
    } catch (err) {
      console.error('Use crystal failed:', err);
      setCraftingMessage({ type: 'error', text: err.response?.data?.error || 'Failed to use crystal' });
    }
    setIsLoading(false);
  };

  // Crafting helpers
  var getMaterialCount = function(itemId) {
    if (!character || !character.inventory) return 0;
    var item = character.inventory.find(function(i) { return i.itemId === itemId; });
    return item ? item.quantity : 0;
  };

  var canCraftRecipe = function(recipe) {
    for (var i = 0; i < recipe.materials.length; i++) {
      var mat = recipe.materials[i];
      if (getMaterialCount(mat.itemId) < mat.quantity) return false;
    }
    return true;
  };

  var handleCraft = async function(recipe) {
    if (!canCraftRecipe(recipe)) {
      setCraftingMessage({ type: 'error', text: 'Not enough materials' });
      return;
    }
    setIsLoading(true);
    try {
      var response = await tavernAPI.craft(recipe.id);
      if (onUpdate) onUpdate(response.data);
      setCraftingMessage({ type: 'success', text: 'Crafted ' + recipe.name + '!' });
    } catch (err) {
      console.error('Craft failed:', err);
      setCraftingMessage({ type: 'error', text: err.response?.data?.error || 'Failed to craft' });
    }
    setIsLoading(false);
  };

  // Filter inventory
  var filteredInventory = character && character.inventory ? character.inventory.filter(function(item) {
    if (inventoryFilter === 'all') return true;
    if (inventoryFilter === 'equipment') return isEquipmentType(item);
    if (inventoryFilter === 'materials') return item.type === 'material';
    if (inventoryFilter === 'consumables') return item.type === 'consumable';
    if (inventoryFilter === 'special') return item.type === 'special' || item.type === 'scroll' || item.type === 'hidden_class_scroll';
    return true;
  }) : [];

  // Count items by type
  var equipmentCount = character && character.inventory ? character.inventory.filter(function(i) { return isEquipmentType(i); }).length : 0;
  var materialCount = character && character.inventory ? character.inventory.filter(function(i) { return i.type === 'material'; }).length : 0;
  var consumableCount = character && character.inventory ? character.inventory.filter(function(i) { return i.type === 'consumable'; }).length : 0;
  var specialCount = character && character.inventory ? character.inventory.filter(function(i) { return i.type === 'special' || i.type === 'scroll' || i.type === 'hidden_class_scroll'; }).length : 0;

  // Pagination
  var totalPages = Math.ceil(filteredInventory.length / ITEMS_PER_PAGE);
  var startIdx = currentPage * ITEMS_PER_PAGE;
  var pagedInventory = filteredInventory.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  if (!character) {
    return <div className="text-gray-400">Loading...</div>;
  }

  return (
    <div className="space-y-3">
      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={function() { setActiveTab('inventory'); }} 
          className={'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ' + 
            (activeTab === 'inventory' ? 'bg-purple-600 text-white' : 'bg-void-700 text-gray-300 hover:bg-void-600')}>
          📦 Inventory
        </button>
        <button onClick={function() { setActiveTab('equipment'); }}
          className={'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ' +
            (activeTab === 'equipment' ? 'bg-purple-600 text-white' : 'bg-void-700 text-gray-300 hover:bg-void-600')}>
          ⚔️ Equipment
        </button>
        <button onClick={function() { setActiveTab('craft'); }}
          className={'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ' +
            (activeTab === 'craft' ? 'bg-purple-600 text-white' : 'bg-void-700 text-gray-300 hover:bg-void-600')}>
          🔨 Craft
        </button>
      </div>

      {/* INVENTORY TAB */}
      {activeTab === 'inventory' && (
        <div className="bg-void-800/50 rounded-xl p-4 neon-border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display text-lg text-purple-400">📦 Inventory</h3>
            <span className="text-gray-400 text-sm">{character.inventory ? character.inventory.length : 0}/{character.inventorySize || 50}</span>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-1 mb-3 flex-wrap">
            <button onClick={function() { setInventoryFilter('all'); setCurrentPage(0); }}
              className={'px-2 py-1 rounded text-xs ' + (inventoryFilter === 'all' ? 'bg-purple-600' : 'bg-void-700')}>
              All ({character.inventory ? character.inventory.length : 0})
            </button>
            <button onClick={function() { setInventoryFilter('equipment'); setCurrentPage(0); }}
              className={'px-2 py-1 rounded text-xs ' + (inventoryFilter === 'equipment' ? 'bg-purple-600' : 'bg-void-700')}>
              ⚔️ ({equipmentCount})
            </button>
            <button onClick={function() { setInventoryFilter('materials'); setCurrentPage(0); }}
              className={'px-2 py-1 rounded text-xs ' + (inventoryFilter === 'materials' ? 'bg-purple-600' : 'bg-void-700')}>
              🪨 ({materialCount})
            </button>
            <button onClick={function() { setInventoryFilter('consumables'); setCurrentPage(0); }}
              className={'px-2 py-1 rounded text-xs ' + (inventoryFilter === 'consumables' ? 'bg-purple-600' : 'bg-void-700')}>
              🧪 ({consumableCount})
            </button>
            <button onClick={function() { setInventoryFilter('special'); setCurrentPage(0); }}
              className={'px-2 py-1 rounded text-xs ' + (inventoryFilter === 'special' ? 'bg-purple-600' : 'bg-void-700')}>
              📜 ({specialCount})
            </button>
          </div>

          {/* Items */}
          <div className="space-y-1">
            {pagedInventory.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">No items</p>
            ) : pagedInventory.map(function(item, index) {
              var actualIndex = startIdx + index;
              var isScroll = isHiddenClassScroll(item);
              var scrollBaseClass = isScroll ? getScrollBaseClass(item) : null;
              var canUseScroll = isScroll && scrollBaseClass && scrollBaseClass === character.baseClass.toLowerCase();
              
              // Check for VIP item expiration
              var isVipItem = item.vipOnly || (item.itemId && item.itemId.startsWith('vip_'));
              var expiresAt = item.expiresAt ? new Date(item.expiresAt) : null;
              var daysRemaining = expiresAt ? Math.max(0, Math.ceil((expiresAt - new Date()) / (1000 * 60 * 60 * 24))) : null;
              
              return (
                <div key={actualIndex} className={'flex items-center gap-2 p-2 rounded-lg border ' + getRarityBorder(item.rarity) + ' bg-void-900/50 hover:bg-void-800/50'}>
                  <span className="text-xl w-8 text-center">{getItemIcon(item)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={getRarityColor(item.rarity) + ' text-sm truncate'}>{item.name}</span>
                      {item.quantity > 1 && <span className="text-gray-400 text-xs">x{item.quantity}</span>}
                      {isVipItem && <span className="text-amber-400 text-xs">⭐VIP</span>}
                    </div>
                    {item.stats && Object.keys(item.stats).length > 0 && (
                      <p className="text-green-400 text-xs truncate">({getItemEffect(item)})</p>
                    )}
                    {isScroll && scrollBaseClass && (
                      <p className={'text-xs ' + (canUseScroll ? 'text-green-400' : 'text-red-400')}>
                        Requires: {scrollBaseClass}
                      </p>
                    )}
                    {isVipItem && daysRemaining !== null && (
                      <p className="text-amber-400 text-xs">⏰ {daysRemaining}d remaining</p>
                    )}
                    {isVipItem && !expiresAt && (
                      <p className="text-gray-400 text-xs">Timer starts on equip</p>
                    )}
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    {isEquipmentType(item) && (
                      <button onClick={function() { handleEquip(item.itemId); }} disabled={isLoading}
                        className="px-2 py-1 bg-blue-600 hover:bg-blue-500 rounded text-xs disabled:opacity-50">Equip</button>
                    )}
                    {item.type === 'consumable' && (
                      <button onClick={function() { handleUse(item); }} disabled={isLoading}
                        className="px-2 py-1 bg-green-600 hover:bg-green-500 rounded text-xs disabled:opacity-50">Use</button>
                    )}
                    {isScroll && canUseScroll && character.hiddenClass === 'none' && (
                      <button onClick={function() { handleUse(item); }} disabled={isLoading}
                        className="px-2 py-1 bg-purple-600 hover:bg-purple-500 rounded text-xs disabled:opacity-50">Awaken</button>
                    )}
                    {item.stackable && item.quantity > 1 && (
                      <button onClick={function() { setSplitModal(item); setSplitQty(1); }}
                        className="px-2 py-1 bg-gray-600 hover:bg-gray-500 rounded text-xs">Split</button>
                    )}
                    {!item.vipOnly && (
                      <button onClick={function() { handleSell(item.itemId); }} disabled={isLoading}
                        className="px-2 py-1 bg-red-600/50 hover:bg-red-500 rounded text-xs disabled:opacity-50">🗑️</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-3">
              <button onClick={function() { setCurrentPage(Math.max(0, currentPage - 1)); }}
                disabled={currentPage === 0}
                className="px-2 py-1 bg-void-700 rounded text-xs disabled:opacity-50">←</button>
              <span className="text-gray-400 text-xs">{currentPage + 1} / {totalPages}</span>
              <button onClick={function() { setCurrentPage(Math.min(totalPages - 1, currentPage + 1)); }}
                disabled={currentPage >= totalPages - 1}
                className="px-2 py-1 bg-void-700 rounded text-xs disabled:opacity-50">→</button>
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
              var hasItem = equippedItem && equippedItem.itemId;
              
              // Check VIP expiration for equipped items
              var isVipItem = hasItem && (equippedItem.vipOnly || (equippedItem.itemId && equippedItem.itemId.startsWith('vip_')));
              var expiresAt = hasItem && equippedItem.expiresAt ? new Date(equippedItem.expiresAt) : null;
              var daysRemaining = expiresAt ? Math.max(0, Math.ceil((expiresAt - new Date()) / (1000 * 60 * 60 * 24))) : null;
              
              return (
                <div key={slot.id} className={'p-2 rounded-lg border ' + (hasItem ? getRarityBorder(equippedItem.rarity) : 'border-gray-700') + ' bg-void-900/50'}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-lg">{hasItem ? (equippedItem.icon || slot.icon) : slot.icon}</span>
                      <div className="min-w-0">
                        <p className="text-gray-500 text-xs">{slot.name}</p>
                        {hasItem ? (
                          <p className={getRarityColor(equippedItem.rarity) + ' text-sm truncate'}>{equippedItem.name}</p>
                        ) : (
                          <p className="text-gray-600 text-xs">Empty</p>
                        )}
                        {isVipItem && daysRemaining !== null && (
                          <p className="text-amber-400 text-xs">⏰ {daysRemaining}d</p>
                        )}
                      </div>
                    </div>
                    {hasItem && (
                      <button onClick={function() { handleUnequip(slot.id); }} disabled={isLoading}
                        className="px-2 py-1 bg-red-600/50 hover:bg-red-500 rounded text-xs disabled:opacity-50">✕</button>
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
                  // PHASE 9.9.4: Use proper formatting for percentage stats
                  var formattedStat = formatStatBadge(stat, totalStats[stat]);
                  var isPercent = isPercentStat(stat);
                  return (
                    <span key={stat} className={'px-1.5 py-0.5 rounded text-xs ' + (isPercent ? 'bg-amber-900/30 text-amber-400' : 'bg-green-900/30 text-green-400')}>
                      {formattedStat}
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
                            ({Object.keys(recipe.result.stats).map(function(s) { return formatStat(s, recipe.result.stats[s]); }).join(' ')})
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
