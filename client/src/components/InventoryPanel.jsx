import React, { useState } from 'react';
import { tavernAPI } from '../services/api';

var EQUIPMENT_SLOTS = [
  { id: 'head', name: 'Head', icon: '🧢' },
  { id: 'body', name: 'Body', icon: '👕' },
  { id: 'leg', name: 'Leg', icon: '👖' },
  { id: 'shoes', name: 'Shoes', icon: '👢' },
  { id: 'leftHand', name: 'Weapon', icon: '🗡️' },
  { id: 'rightHand', name: 'Off-hand', icon: '🛡️' },
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

// Item descriptions by type/subtype
var ITEM_DESCRIPTIONS = {
  // Materials
  bone_fragment: 'Common drop from undead. Used for floor advancement.',
  cursed_cloth: 'Tattered cloth infused with dark energy.',
  ghost_essence: 'Ethereal essence from defeated spirits.',
  dark_crystal: 'A crystal pulsing with shadow energy.',
  death_mark: 'A sinister mark left by powerful undead.',
  soul_shard: 'Fragment of a departed soul.',
  sea_scale: 'Shimmering scale from aquatic creatures.',
  coral_piece: 'Colorful coral from the deep.',
  siren_tear: 'Crystallized tear of a siren.',
  deep_pearl: 'A pearl from the ocean depths.',
  abyssal_ink: 'Ink from deep sea creatures.',
  kraken_tooth: 'Massive tooth from a kraken spawn.',
  leviathan_scale: 'Legendary scale of immense power.',
  memory_crystal_fragment: 'Combine 15 to craft Memory Crystal.',
  
  // Consumables
  health_potion_small: 'Restores 50 HP when used.',
  health_potion_medium: 'Restores 120 HP when used.',
  mana_potion_small: 'Restores 30 MP when used.',
  mana_potion_medium: 'Restores 80 MP when used.',
  antidote: 'Cures poison status effect.',
  energy_drink: 'Restores 25 Energy.',
  
  // Special
  memory_crystal: 'Use to remove Hidden Class and receive scroll back.'
};

// Get icon based on item type/subtype
function getItemIcon(item) {
  if (item.icon && item.icon !== '📦') return item.icon;
  
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

  var inventory = character.inventory || [];
  
  // Apply filter
  var filteredInventory = inventory.filter(function(item) {
    if (filter === 'all') return true;
    if (filter === 'material') return item.type === 'material';
    if (filter === 'consumable') return item.type === 'consumable';
    if (filter === 'equipment') return item.type === 'equipment';
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

  var handleCombineStacks = async function(itemId) {
    setIsLoading(true);
    try {
      var response = await tavernAPI.combineStacks(itemId);
      addLog('success', response.data.message);
      onCharacterUpdate();
    } catch (err) {
      addLog('error', err.response?.data?.error || 'Failed');
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
  var isEquippable = function(item) { return item.type === 'equipment'; };
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

  var getRarityBg = function(rarity) {
    var colors = {
      common: 'bg-gray-700',
      uncommon: 'bg-green-900/30',
      rare: 'bg-blue-900/30',
      epic: 'bg-purple-900/30',
      legendary: 'bg-amber-900/30'
    };
    return colors[rarity] || 'bg-gray-700';
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

  // Count items by type for filter badges
  var counts = { material: 0, consumable: 0, equipment: 0, scroll: 0 };
  for (var k = 0; k < inventory.length; k++) {
    var type = inventory[k].type;
    if (type === 'material') counts.material++;
    else if (type === 'consumable') counts.consumable++;
    else if (type === 'equipment') counts.equipment++;
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
              return (
                <div key={idx} 
                  onClick={function() { setSelectedItem(isSelected ? null : item); }}
                  className={'p-3 rounded-lg cursor-pointer transition ' + getRarityBg(item.rarity) + ' ' + (isSelected ? 'ring-2 ring-purple-500' : 'hover:bg-void-700')}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{getItemIcon(item)}</span>
                      <div>
                        <span className={getRarityColor(item.rarity)}>{item.name}</span>
                        <span className="text-gray-500 text-sm ml-2">x{item.quantity}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
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
                      
                      {/* Class requirement */}
                      {item.classReq && (
                        <p className={'text-xs mb-2 ' + (item.classReq === character.baseClass ? 'text-green-400' : 'text-red-400')}>
                          Class: {item.classReq.charAt(0).toUpperCase() + item.classReq.slice(1)}
                          {item.classReq !== character.baseClass && ' (Wrong class!)'}
                        </p>
                      )}
                      
                      {/* Action buttons */}
                      <div className="flex gap-2 flex-wrap">
                        {isUsable(item) && (
                          <button onClick={function(e) { e.stopPropagation(); handleUseItem(item.itemId); }} disabled={isLoading}
                            className="px-3 py-1 bg-green-600 hover:bg-green-500 rounded text-xs">Use</button>
                        )}
                        {isEquippable(item) && (
                          <button onClick={function(e) { e.stopPropagation(); handleEquipItem(item.itemId); }} disabled={isLoading}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-xs">Equip</button>
                        )}
                        {canSplit(item) && (
                          <button onClick={function(e) { e.stopPropagation(); setSplitModal(item); setSplitQty(1); }} disabled={isLoading}
                            className="px-3 py-1 bg-gray-600 hover:bg-gray-500 rounded text-xs">Split</button>
                        )}
                        {item.stackable && (
                          <button onClick={function(e) { e.stopPropagation(); handleCombineStacks(item.itemId); }} disabled={isLoading}
                            className="px-3 py-1 bg-yellow-600 hover:bg-yellow-500 rounded text-xs">Combine</button>
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
                <div key={slot.id} className={'p-3 rounded-lg border ' + (hasItem ? 'bg-void-700 border-purple-500/50' : 'bg-void-900/50 border-gray-700/50')}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-xs">{slot.name}</span>
                    <span className="text-lg">{slot.icon}</span>
                  </div>
                  {hasItem ? (
                    <div>
                      <div className="flex items-center gap-2">
                        <span>{equipped.icon || '📦'}</span>
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
          
          {/* Memory Crystal */}
          <div className="bg-void-900/50 p-4 rounded-lg mb-4">
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
            <div className="bg-purple-900/30 p-4 rounded-lg border border-purple-500/50">
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
