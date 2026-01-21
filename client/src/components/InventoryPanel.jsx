import React, { useState } from 'react';
import { tavernAPI } from '../services/api';

var EQUIPMENT_SLOTS = [
  { id: 'head', name: 'Head', icon: '🧢' },
  { id: 'body', name: 'Body', icon: '👕' },
  { id: 'leg', name: 'Hands', icon: '🧤' },
  { id: 'shoes', name: 'Feet', icon: '👢' },
  { id: 'rightHand', name: 'Weapon', icon: '⚔️' },
  { id: 'leftHand', name: 'Off-Hand', icon: '🛡️' },
  { id: 'ring', name: 'Ring', icon: '💍' },
  { id: 'necklace', name: 'Necklace', icon: '📿' }
];

var ITEMS_PER_PAGE = 10;

// ============================================================
// PHASE 9.9.4: Set Bonus Definitions (mirrors server data)
// ============================================================
var SET_BONUS_DEFINITIONS = {
  vip_premium_set: {
    name: 'VIP Premium Set',
    bonuses: {
      4: { pAtkPercent: 5, mAtkPercent: 5 },
      8: { pAtkPercent: 10, mAtkPercent: 10, hpPercent: 10 }
    }
  },
  flame_guardian_set: {
    name: 'Flame Guardian Set',
    bonuses: {
      2: { pAtkPercent: 3 },
      4: { pAtkPercent: 6, hpPercent: 5 }
    }
  },
  shadow_stalker_set: {
    name: 'Shadow Stalker Set',
    bonuses: {
      2: { critRate: 3 },
      4: { critRate: 6, critDmg: 15 }
    }
  },
  arcane_scholar_set: {
    name: 'Arcane Scholar Set',
    bonuses: {
      2: { mAtkPercent: 3 },
      4: { mAtkPercent: 6, mpPercent: 10 }
    }
  },
  iron_bastion_set: {
    name: 'Iron Bastion Set',
    bonuses: {
      2: { pDefPercent: 3 },
      4: { pDefPercent: 6, hpPercent: 8 }
    }
  },
  void_walker_set: {
    name: 'Void Walker Set',
    bonuses: {
      2: { pAtkPercent: 2, mAtkPercent: 2 },
      4: { pAtkPercent: 5, mAtkPercent: 5, critRate: 3 }
    }
  }
};

// Helper to calculate set bonuses from equipment
function calculateSetBonuses(equipment) {
  var setCount = {};
  var totalBonuses = {};
  var activeSets = [];
  
  if (!equipment) return { totalBonuses: {}, activeSets: [] };
  
  var slots = ['head', 'body', 'leg', 'shoes', 'leftHand', 'rightHand', 'ring', 'necklace'];
  
  slots.forEach(function(slot) {
    var item = equipment[slot];
    if (item && item.setId) {
      if (!setCount[item.setId]) {
        setCount[item.setId] = 0;
      }
      setCount[item.setId]++;
    }
  });
  
  Object.keys(setCount).forEach(function(setId) {
    var count = setCount[setId];
    var setDef = SET_BONUS_DEFINITIONS[setId];
    if (setDef && setDef.bonuses && count >= 2) {
      var setActiveBonuses = [];
      Object.keys(setDef.bonuses).forEach(function(threshold) {
        if (count >= parseInt(threshold)) {
          var bonus = setDef.bonuses[threshold];
          setActiveBonuses.push({ pieces: parseInt(threshold), bonus: bonus });
          Object.keys(bonus).forEach(function(stat) {
            totalBonuses[stat] = (totalBonuses[stat] || 0) + bonus[stat];
          });
        }
      });
      if (setActiveBonuses.length > 0) {
        activeSets.push({ id: setId, name: setDef.name, count: count, bonuses: setActiveBonuses });
      }
    }
  });
  
  return { totalBonuses: totalBonuses, activeSets: activeSets };
}

// ============================================================
// PHASE 9.9.4: Stat Formatting Functions
// ============================================================
function formatStatName(statKey) {
  var statNames = {
    pAtk: 'P.ATK', mAtk: 'M.ATK', pDef: 'P.DEF', mDef: 'M.DEF',
    hp: 'HP', mp: 'MP', str: 'STR', agi: 'AGI', dex: 'DEX', int: 'INT', vit: 'VIT',
    critRate: 'CRIT', critDmg: 'CRIT DMG',
    pAtkPercent: 'P.ATK', mAtkPercent: 'M.ATK', 
    pDefPercent: 'P.DEF', mDefPercent: 'M.DEF',
    hpPercent: 'HP', mpPercent: 'MP',
    critRatePercent: 'CRIT', critDmgPercent: 'CRIT DMG',
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
  return name + ' +' + value;
}

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
  { id: 'craft_memory_crystal', name: 'Memory Crystal', result: { itemId: 'memory_crystal', name: 'Memory Crystal', type: 'special', rarity: 'legendary', stackable: false },
    materials: [{ itemId: 'memory_crystal_fragment', name: 'Memory Crystal Fragment', quantity: 15 }], icon: '🔷', special: true },
];

function isEquipmentType(item) {
  return item.type === 'equipment' || item.type === 'weapon' || item.type === 'armor' || item.type === 'accessory' || item.type === 'vip_equipment';
}

function isHiddenClassScroll(item) {
  return item.type === 'hidden_class_scroll' || 
         item.type === 'scroll' ||
         (item.name && item.name.toLowerCase().includes('scroll') && item.hiddenClass) ||
         (item.itemId && item.itemId.startsWith('scroll_'));
}

var SCROLL_BASE_CLASS_MAP = {
  flameblade: 'swordsman', berserker: 'swordsman', paladin: 'swordsman', earthshaker: 'swordsman', frostguard: 'swordsman',
  shadowDancer: 'thief', venomancer: 'thief', assassin: 'thief', phantom: 'thief', bloodreaper: 'thief',
  stormRanger: 'archer', pyroArcher: 'archer', frostSniper: 'archer', natureWarden: 'archer', voidHunter: 'archer',
  frostWeaver: 'mage', pyromancer: 'mage', stormcaller: 'mage', necromancer: 'mage', arcanist: 'mage'
};

function getScrollBaseClass(item) {
  if (item.baseClass) return item.baseClass.toLowerCase();
  if (item.hiddenClass && SCROLL_BASE_CLASS_MAP[item.hiddenClass]) {
    return SCROLL_BASE_CLASS_MAP[item.hiddenClass];
  }
  if (item.itemId && item.itemId.startsWith('scroll_')) {
    var hiddenClass = item.itemId.replace('scroll_', '');
    if (SCROLL_BASE_CLASS_MAP[hiddenClass]) {
      return SCROLL_BASE_CLASS_MAP[hiddenClass];
    }
  }
  return null;
}

function getItemIcon(item) {
  if (item.icon && item.icon !== '📦') return item.icon;
  if (item.slot === 'weapon' || item.slot === 'mainHand' || item.subtype === 'mainHand') return '⚔️';
  if (item.slot === 'head') return '🧢';
  if (item.slot === 'body') return '👕';
  if (item.slot === 'hands' || item.slot === 'leg') return '🧤';
  if (item.slot === 'feet' || item.slot === 'shoes') return '👢';
  if (item.slot === 'ring') return '💍';
  if (item.slot === 'necklace') return '📿';
  if (item.slot === 'offHand' || item.slot === 'leftHand' || item.slot === 'cape') return '🛡️';
  if (item.type === 'material') return '🪨';
  if (item.type === 'consumable') return '🧪';
  if (item.type === 'scroll' || item.type === 'hidden_class_scroll') return '📜';
  if (item.type === 'special') return '💎';
  return '📦';
}

function getItemEffect(item) {
  if (isEquipmentType(item) && item.stats) {
    var statList = [];
    var keys = Object.keys(item.stats);
    for (var i = 0; i < keys.length; i++) {
      statList.push(formatStat(keys[i], item.stats[keys[i]]));
    }
    return statList.join(', ');
  }
  if (item.type === 'consumable' && item.effect) {
    if (item.effect.type === 'heal') return '+' + item.effect.value + ' HP';
    if (item.effect.type === 'mana') return '+' + item.effect.value + ' MP';
    if (item.effect.type === 'energy' || item.effect.type === 'restore_energy') return '+' + item.effect.value + ' Energy';
  }
  return '';
}

function getRarityColor(rarity) {
  var colors = { common: 'text-gray-300', uncommon: 'text-green-400', rare: 'text-blue-400', epic: 'text-purple-400', legendary: 'text-amber-400' };
  return colors[rarity] || 'text-gray-300';
}

function getRarityBorder(rarity) {
  var colors = { common: 'border-gray-600', uncommon: 'border-green-500/50', rare: 'border-blue-500/50', epic: 'border-purple-500/50', legendary: 'border-amber-500/50' };
  return colors[rarity] || 'border-gray-600';
}

var InventoryPanel = function(props) {
  var character = props.character;
  var refreshCharacter = props.refreshCharacter;
  var addLog = props.addLog || function() {}; // Default no-op if not provided
  
  var [activeTab, setActiveTab] = useState('inventory');
  var [currentPage, setCurrentPage] = useState(0);
  var [isLoading, setIsLoading] = useState(false);
  var [splitModal, setSplitModal] = useState(null);
  var [splitQty, setSplitQty] = useState(1);
  var [filter, setFilter] = useState('all');
  var [craftingMessage, setCraftingMessage] = useState(null);

  var inventory = character.inventory || [];
  
  var filteredInventory = inventory.filter(function(item) {
    if (filter === 'all') return true;
    if (filter === 'material') return item.type === 'material';
    if (filter === 'consumable') return item.type === 'consumable';
    if (filter === 'equipment') return isEquipmentType(item);
    if (filter === 'scroll') return item.type === 'scroll' || item.type === 'special' || item.type === 'hidden_class_scroll' || isHiddenClassScroll(item);
    return true;
  });
  
  var totalPages = Math.ceil(filteredInventory.length / ITEMS_PER_PAGE);
  var startIdx = currentPage * ITEMS_PER_PAGE;
  var pagedItems = filteredInventory.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  // Count by type
  var equipCount = inventory.filter(function(i) { return isEquipmentType(i); }).length;
  var matCount = inventory.filter(function(i) { return i.type === 'material'; }).length;
  var consumeCount = inventory.filter(function(i) { return i.type === 'consumable'; }).length;
  var scrollCount = inventory.filter(function(i) { return i.type === 'scroll' || i.type === 'special' || i.type === 'hidden_class_scroll'; }).length;

  // Memory crystal fragment count
  var fragments = 0;
  var fragItem = inventory.find(function(i) { return i.itemId === 'memory_crystal_fragment'; });
  if (fragItem) fragments = fragItem.quantity || 0;
  var hasCrystal = inventory.some(function(i) { return i.itemId === 'memory_crystal'; });

  // ============================================================
  // PHASE 9.9.4 FIX: Properly refresh character after equip/unequip
  // ============================================================
  var handleEquip = async function(item) {
    setIsLoading(true);
    try {
      var response = await tavernAPI.equipItem(item.itemId);
      addLog('success', '⚔️ Equipped ' + item.name);
      // Refresh character to get updated stats
      if (refreshCharacter) await refreshCharacter();
    } catch (err) {
      console.error('Equip failed:', err);
      addLog('error', err.response?.data?.error || 'Failed to equip ' + item.name);
    }
    setIsLoading(false);
  };

  var handleUnequip = async function(slot) {
    var equippedItem = character.equipment && character.equipment[slot];
    var itemName = equippedItem ? equippedItem.name : 'item';
    setIsLoading(true);
    try {
      var response = await tavernAPI.unequipItem(slot);
      addLog('info', '📦 Unequipped ' + itemName);
      // Refresh character to get updated stats
      if (refreshCharacter) await refreshCharacter();
    } catch (err) {
      console.error('Unequip failed:', err);
      addLog('error', err.response?.data?.error || 'Failed to unequip');
    }
    setIsLoading(false);
  };

  var handleSell = async function(item) {
    if (!confirm('Sell ' + item.name + '?')) return;
    setIsLoading(true);
    try {
      var response = await tavernAPI.sell(item.itemId, 1);
      addLog('success', '💰 Sold ' + item.name + ' for ' + (response.data.goldEarned || '?') + ' gold');
      if (refreshCharacter) await refreshCharacter();
    } catch (err) {
      console.error('Sell failed:', err);
      addLog('error', err.response?.data?.error || 'Failed to sell');
    }
    setIsLoading(false);
  };

  var handleUse = async function(item) {
    setIsLoading(true);
    try {
      if (item.type === 'consumable') {
        var response = await tavernAPI.useItem(item.itemId);
        addLog('success', '✨ Used ' + item.name + (response.data.message ? ' - ' + response.data.message : ''));
      } else if (isHiddenClassScroll(item)) {
        var scrollResponse = await tavernAPI.useScroll(item.itemId);
        addLog('success', '📜 ' + (scrollResponse.data.message || 'Scroll activated!'));
      }
      if (refreshCharacter) await refreshCharacter();
    } catch (err) {
      console.error('Use failed:', err);
      addLog('error', err.response?.data?.error || 'Failed to use item');
    }
    setIsLoading(false);
  };

  var handleSplitStack = async function() {
    if (!splitModal) return;
    setIsLoading(true);
    try {
      await tavernAPI.splitStack(splitModal.itemId, splitQty);
      addLog('info', '📦 Split ' + splitQty + 'x ' + splitModal.name);
      setSplitModal(null);
      if (refreshCharacter) await refreshCharacter();
    } catch (err) {
      console.error('Split failed:', err);
      addLog('error', err.response?.data?.error || 'Failed to split');
    }
    setIsLoading(false);
  };

  var handleCraftMemoryCrystal = async function() {
    if (fragments < 15) {
      setCraftingMessage({ type: 'error', text: 'Need 15 fragments. Have: ' + fragments });
      return;
    }
    setIsLoading(true);
    try {
      var response = await tavernAPI.craftMemoryCrystal();
      setCraftingMessage({ type: 'success', text: response.data.message || 'Memory Crystal crafted!' });
      addLog('success', '🔷 Crafted Memory Crystal!');
      if (refreshCharacter) await refreshCharacter();
    } catch (err) {
      console.error('Craft failed:', err);
      setCraftingMessage({ type: 'error', text: err.response?.data?.error || 'Failed to craft' });
    }
    setIsLoading(false);
  };

  var handleUseMemoryCrystal = async function() {
    if (!confirm('Use Memory Crystal to remove your hidden class? You will receive the scroll back.')) return;
    setIsLoading(true);
    try {
      var response = await tavernAPI.useMemoryCrystal();
      setCraftingMessage({ type: 'success', text: response.data.message || 'Hidden class removed!' });
      addLog('success', '🔷 ' + (response.data.message || 'Hidden class removed!'));
      if (refreshCharacter) await refreshCharacter();
    } catch (err) {
      console.error('Use crystal failed:', err);
      setCraftingMessage({ type: 'error', text: err.response?.data?.error || 'Failed to use crystal' });
    }
    setIsLoading(false);
  };

  if (!character) {
    return <div className="text-gray-400">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={function() { setActiveTab('inventory'); }} 
          className={'px-4 py-2 rounded-lg text-sm font-medium transition-colors ' + 
            (activeTab === 'inventory' ? 'bg-purple-600 text-white' : 'bg-void-700 text-gray-300 hover:bg-void-600')}>
          📦 Inventory
        </button>
        <button onClick={function() { setActiveTab('equipment'); }}
          className={'px-4 py-2 rounded-lg text-sm font-medium transition-colors ' +
            (activeTab === 'equipment' ? 'bg-purple-600 text-white' : 'bg-void-700 text-gray-300 hover:bg-void-600')}>
          ⚔️ Equipment
        </button>
        <button onClick={function() { setActiveTab('craft'); }}
          className={'px-4 py-2 rounded-lg text-sm font-medium transition-colors ' +
            (activeTab === 'craft' ? 'bg-purple-600 text-white' : 'bg-void-700 text-gray-300 hover:bg-void-600')}>
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

          {/* Filter Buttons */}
          <div className="flex gap-1 mb-3 flex-wrap">
            <button onClick={function() { setFilter('all'); setCurrentPage(0); }}
              className={'px-2 py-1 rounded text-xs ' + (filter === 'all' ? 'bg-purple-600' : 'bg-void-700')}>
              All ({inventory.length})
            </button>
            <button onClick={function() { setFilter('equipment'); setCurrentPage(0); }}
              className={'px-2 py-1 rounded text-xs ' + (filter === 'equipment' ? 'bg-purple-600' : 'bg-void-700')}>
              ⚔️ ({equipCount})
            </button>
            <button onClick={function() { setFilter('material'); setCurrentPage(0); }}
              className={'px-2 py-1 rounded text-xs ' + (filter === 'material' ? 'bg-purple-600' : 'bg-void-700')}>
              🪨 ({matCount})
            </button>
            <button onClick={function() { setFilter('consumable'); setCurrentPage(0); }}
              className={'px-2 py-1 rounded text-xs ' + (filter === 'consumable' ? 'bg-purple-600' : 'bg-void-700')}>
              🧪 ({consumeCount})
            </button>
            <button onClick={function() { setFilter('scroll'); setCurrentPage(0); }}
              className={'px-2 py-1 rounded text-xs ' + (filter === 'scroll' ? 'bg-purple-600' : 'bg-void-700')}>
              📜 ({scrollCount})
            </button>
          </div>

          {/* Items List */}
          <div className="space-y-2">
            {pagedItems.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">No items</p>
            ) : pagedItems.map(function(item, index) {
              var isScroll = isHiddenClassScroll(item);
              var scrollBaseClass = isScroll ? getScrollBaseClass(item) : null;
              var canUseScroll = isScroll && scrollBaseClass && scrollBaseClass === character.baseClass.toLowerCase() && character.hiddenClass === 'none';
              
              // VIP item info
              var isVipItem = item.vipOnly || (item.itemId && item.itemId.startsWith('vip_'));
              var expiresAt = item.expiresAt ? new Date(item.expiresAt) : null;
              var daysRemaining = expiresAt ? Math.max(0, Math.ceil((expiresAt - new Date()) / (1000 * 60 * 60 * 24))) : null;
              
              return (
                <div key={startIdx + index} className={'flex items-center gap-3 p-3 rounded-lg border ' + getRarityBorder(item.rarity) + ' bg-void-900/50 hover:bg-void-800/50'}>
                  <span className="text-2xl w-10 text-center flex-shrink-0">{getItemIcon(item)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={getRarityColor(item.rarity) + ' font-medium'}>{item.name}</span>
                      {item.quantity > 1 && <span className="text-gray-400 text-sm">x{item.quantity}</span>}
                      {isVipItem && <span className="text-amber-400 text-xs px-1 bg-amber-900/30 rounded">⭐VIP</span>}
                    </div>
                    {item.stats && Object.keys(item.stats).length > 0 && (
                      <p className="text-green-400 text-xs mt-0.5">{getItemEffect(item)}</p>
                    )}
                    {isScroll && scrollBaseClass && (
                      <p className={'text-xs mt-0.5 ' + (canUseScroll ? 'text-green-400' : 'text-red-400')}>
                        Requires: {scrollBaseClass} {canUseScroll ? '✓' : '✗'}
                      </p>
                    )}
                    {isVipItem && daysRemaining !== null && (
                      <p className="text-amber-400 text-xs mt-0.5">⏰ {daysRemaining} days remaining</p>
                    )}
                    {isVipItem && !expiresAt && (
                      <p className="text-gray-500 text-xs mt-0.5">Timer starts on equip</p>
                    )}
                  </div>
                  <div className="flex gap-1 flex-shrink-0 flex-wrap justify-end">
                    {isEquipmentType(item) && (
                      <button onClick={function() { handleEquip(item); }} disabled={isLoading}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded text-xs font-medium disabled:opacity-50">
                        Equip
                      </button>
                    )}
                    {item.type === 'consumable' && (
                      <button onClick={function() { handleUse(item); }} disabled={isLoading}
                        className="px-3 py-1.5 bg-green-600 hover:bg-green-500 rounded text-xs font-medium disabled:opacity-50">
                        Use
                      </button>
                    )}
                    {canUseScroll && (
                      <button onClick={function() { handleUse(item); }} disabled={isLoading}
                        className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 rounded text-xs font-medium disabled:opacity-50">
                        Awaken
                      </button>
                    )}
                    {item.stackable && item.quantity > 1 && (
                      <button onClick={function() { setSplitModal(item); setSplitQty(1); }}
                        className="px-2 py-1.5 bg-gray-600 hover:bg-gray-500 rounded text-xs">
                        Split
                      </button>
                    )}
                    {!item.vipOnly && (
                      <button onClick={function() { handleSell(item); }} disabled={isLoading}
                        className="px-2 py-1.5 bg-red-600/50 hover:bg-red-500 rounded text-xs disabled:opacity-50">
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-4">
              <button onClick={function() { setCurrentPage(Math.max(0, currentPage - 1)); }}
                disabled={currentPage === 0}
                className="px-3 py-1 bg-void-700 rounded text-sm disabled:opacity-50">← Prev</button>
              <span className="text-gray-400 text-sm">{currentPage + 1} / {totalPages}</span>
              <button onClick={function() { setCurrentPage(Math.min(totalPages - 1, currentPage + 1)); }}
                disabled={currentPage >= totalPages - 1}
                className="px-3 py-1 bg-void-700 rounded text-sm disabled:opacity-50">Next →</button>
            </div>
          )}
        </div>
      )}

      {/* EQUIPMENT TAB */}
      {activeTab === 'equipment' && (
        <div className="bg-void-800/50 rounded-xl p-4 neon-border">
          <h3 className="font-display text-lg text-purple-400 mb-4">⚔️ Equipment</h3>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            {EQUIPMENT_SLOTS.map(function(slot) {
              var equippedItem = character.equipment ? character.equipment[slot.id] : null;
              var hasItem = equippedItem && equippedItem.itemId;
              
              // VIP expiration
              var isVipItem = hasItem && (equippedItem.vipOnly || (equippedItem.itemId && equippedItem.itemId.startsWith('vip_')));
              var expiresAt = hasItem && equippedItem.expiresAt ? new Date(equippedItem.expiresAt) : null;
              var daysRemaining = expiresAt ? Math.max(0, Math.ceil((expiresAt - new Date()) / (1000 * 60 * 60 * 24))) : null;
              
              return (
                <div key={slot.id} className={'p-3 rounded-lg border ' + (hasItem ? getRarityBorder(equippedItem.rarity) : 'border-gray-700') + ' bg-void-900/50'}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="text-xl">{hasItem ? (equippedItem.icon || slot.icon) : slot.icon}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-gray-500 text-xs">{slot.name}</p>
                        {hasItem ? (
                          <p className={getRarityColor(equippedItem.rarity) + ' text-sm truncate'}>{equippedItem.name}</p>
                        ) : (
                          <p className="text-gray-600 text-sm">Empty</p>
                        )}
                      </div>
                    </div>
                    {hasItem && (
                      <button onClick={function() { handleUnequip(slot.id); }} disabled={isLoading}
                        className="px-2 py-1 bg-red-600/50 hover:bg-red-500 rounded text-xs ml-2 disabled:opacity-50">✕</button>
                    )}
                  </div>
                  {hasItem && equippedItem.stats && (
                    <p className="text-green-400 text-xs mt-1 truncate">{getItemEffect(equippedItem)}</p>
                  )}
                  {isVipItem && daysRemaining !== null && (
                    <p className="text-amber-400 text-xs mt-1">⏰ {daysRemaining}d</p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Total Equipment Stats */}
          <div className="p-3 rounded-lg border border-gray-700 bg-void-900/50">
            <p className="text-gray-400 text-sm mb-2">📊 Total Equipment Bonuses:</p>
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
                if (statKeys.length === 0) return <span className="text-gray-500 text-sm">None equipped</span>;
                return statKeys.map(function(stat) {
                  var isPct = isPercentStat(stat);
                  return (
                    <span key={stat} className={'px-2 py-1 rounded text-xs font-medium ' + (isPct ? 'bg-amber-900/30 text-amber-400' : 'bg-green-900/30 text-green-400')}>
                      {formatStat(stat, totalStats[stat])}
                    </span>
                  );
                });
              })()}
            </div>
            
            {/* Set Bonuses Section */}
            {(function() {
              var setData = calculateSetBonuses(character.equipment);
              if (setData.activeSets.length === 0) return null;
              return (
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <p className="text-amber-400 text-sm mb-2">⚔️ Set Bonuses:</p>
                  {setData.activeSets.map(function(set) {
                    return (
                      <div key={set.id} className="mb-2">
                        <p className="text-amber-300 text-xs font-semibold">{set.name} ({set.count}pc)</p>
                        {set.bonuses.map(function(b, idx) {
                          var bonusText = Object.keys(b.bonus).map(function(stat) {
                            return '+' + b.bonus[stat] + '% ' + formatStatName(stat);
                          }).join(', ');
                          return (
                            <p key={idx} className="text-green-400 text-xs ml-2">✓ {b.pieces}-piece: {bonusText}</p>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* CRAFT TAB */}
      {activeTab === 'craft' && (
        <div className="bg-void-800/50 rounded-xl p-4 neon-border">
          <h3 className="font-display text-lg text-purple-400 mb-4">🔨 Crafting</h3>
          
          {craftingMessage && (
            <div className={'p-3 rounded-lg mb-4 ' + (craftingMessage.type === 'success' ? 'bg-green-900/30 border border-green-500/30' : 'bg-red-900/30 border border-red-500/30')}>
              <p className={'text-sm ' + (craftingMessage.type === 'success' ? 'text-green-400' : 'text-red-400')}>
                {craftingMessage.type === 'success' ? '✓' : '✗'} {craftingMessage.text}
              </p>
            </div>
          )}

          {/* Memory Crystal */}
          <div className="bg-void-900/50 p-4 rounded-lg mb-4 border border-purple-500/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🔷</span>
                <div>
                  <p className="text-white font-bold">Memory Crystal</p>
                  <p className="text-gray-400 text-sm">15x 💠 Fragment ({fragments}/15)</p>
                </div>
              </div>
              <button onClick={handleCraftMemoryCrystal} disabled={isLoading || fragments < 15}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded text-sm font-medium disabled:opacity-50">Craft</button>
            </div>
          </div>

          {hasCrystal && character.hiddenClass !== 'none' && (
            <div className="bg-purple-900/30 p-4 rounded-lg border border-purple-500/50 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-400 font-bold">Remove Hidden Class</p>
                  <p className="text-gray-400 text-sm">Current: {character.hiddenClass} (returns scroll)</p>
                </div>
                <button onClick={handleUseMemoryCrystal} disabled={isLoading}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded text-sm font-medium disabled:opacity-50">Use Crystal</button>
              </div>
            </div>
          )}

          <h4 className="text-gray-300 font-medium mb-3">📜 Equipment Recipes</h4>
          <div className="space-y-2 text-sm text-gray-500">
            <p>More recipes coming soon...</p>
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
