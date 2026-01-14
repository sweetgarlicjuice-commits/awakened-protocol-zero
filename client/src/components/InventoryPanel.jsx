import React, { useState } from 'react';
import { tavernAPI } from '../services/api';

const EQUIPMENT_SLOTS = [
  { id: 'head', name: 'Head', icon: '🧢' },
  { id: 'body', name: 'Body', icon: '👕' },
  { id: 'leg', name: 'Leg', icon: '👖' },
  { id: 'shoes', name: 'Shoes', icon: '👢' },
  { id: 'leftHand', name: 'Left Hand', icon: '🗡️' },
  { id: 'rightHand', name: 'Right Hand', icon: '🛡️' },
  { id: 'ring', name: 'Ring', icon: '💍' },
  { id: 'necklace', name: 'Necklace', icon: '📿' }
];

const ITEMS_PER_PAGE = 10;

const InventoryPanel = ({ character, onCharacterUpdate, addLog }) => {
  const [activeTab, setActiveTab] = useState('inventory');
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [splitModal, setSplitModal] = useState(null);
  const [splitQty, setSplitQty] = useState(1);

  const inventory = character.inventory || [];
  const totalPages = Math.ceil(inventory.length / ITEMS_PER_PAGE);
  const paginatedItems = inventory.slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE);

  const handleUseItem = async (itemId) => {
    setIsLoading(true);
    try {
      const { data } = await tavernAPI.useItem(itemId);
      addLog('success', data.message);
      onCharacterUpdate();
    } catch (err) {
      addLog('error', err.response?.data?.error || 'Failed to use item');
    }
    setIsLoading(false);
  };

  const handleEquipItem = async (itemId) => {
    setIsLoading(true);
    try {
      const { data } = await tavernAPI.equipItem(itemId);
      addLog('success', data.message);
      onCharacterUpdate();
    } catch (err) {
      addLog('error', err.response?.data?.error || 'Failed to equip');
    }
    setIsLoading(false);
  };

  const handleUnequipItem = async (slot) => {
    setIsLoading(true);
    try {
      const { data } = await tavernAPI.unequipItem(slot);
      addLog('success', data.message);
      onCharacterUpdate();
    } catch (err) {
      addLog('error', err.response?.data?.error || 'Failed to unequip');
    }
    setIsLoading(false);
  };

  const handleDiscardItem = async (itemId) => {
    if (!confirm('Discard this item?')) return;
    setIsLoading(true);
    try {
      const { data } = await tavernAPI.discardItem(itemId, 1);
      addLog('info', data.message);
      onCharacterUpdate();
    } catch (err) {
      addLog('error', err.response?.data?.error || 'Failed');
    }
    setIsLoading(false);
  };

  const handleSplitStack = async () => {
    if (!splitModal) return;
    setIsLoading(true);
    try {
      const { data } = await tavernAPI.splitStack(splitModal.itemId, splitQty);
      addLog('success', data.message);
      onCharacterUpdate();
      setSplitModal(null);
    } catch (err) {
      addLog('error', err.response?.data?.error || 'Failed');
    }
    setIsLoading(false);
  };

  const handleCombineStacks = async (itemId) => {
    setIsLoading(true);
    try {
      const { data } = await tavernAPI.combineStacks(itemId);
      addLog('success', data.message);
      onCharacterUpdate();
    } catch (err) {
      addLog('error', err.response?.data?.error || 'Failed');
    }
    setIsLoading(false);
  };

  const handleCraftMemoryCrystal = async () => {
    setIsLoading(true);
    try {
      const { data } = await tavernAPI.craftMemoryCrystal();
      addLog('success', data.message);
      onCharacterUpdate();
    } catch (err) {
      addLog('error', err.response?.data?.error || 'Failed');
    }
    setIsLoading(false);
  };

  const handleUseMemoryCrystal = async () => {
    if (!confirm('Remove your hidden class? You will get the scroll back.')) return;
    setIsLoading(true);
    try {
      const { data } = await tavernAPI.useMemoryCrystal();
      addLog('success', data.message);
      onCharacterUpdate();
    } catch (err) {
      addLog('error', err.response?.data?.error || 'Failed');
    }
    setIsLoading(false);
  };

  const isUsable = (item) => item.type === 'consumable';
  const isEquippable = (item) => item.type === 'equipment';
  const canSplit = (item) => item.stackable && item.quantity > 1;

  const getRarityColor = (rarity) => {
    const colors = {
      common: 'text-gray-300',
      uncommon: 'text-green-400',
      rare: 'text-blue-400',
      epic: 'text-purple-400',
      legendary: 'text-amber-400'
    };
    return colors[rarity] || 'text-gray-300';
  };

  // Count memory crystal fragments
  const fragments = inventory.find(i => i.itemId === 'memory_crystal_fragment')?.quantity || 0;
  const hasCrystal = inventory.some(i => i.itemId === 'memory_crystal');

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2 justify-center">
        <button onClick={() => setActiveTab('inventory')}
          className={'px-4 py-2 rounded-lg text-sm ' + (activeTab === 'inventory' ? 'bg-purple-600 text-white' : 'bg-void-800 text-gray-400')}>
          📦 Inventory
        </button>
        <button onClick={() => setActiveTab('equipment')}
          className={'px-4 py-2 rounded-lg text-sm ' + (activeTab === 'equipment' ? 'bg-purple-600 text-white' : 'bg-void-800 text-gray-400')}>
          ⚔️ Equipment
        </button>
        <button onClick={() => setActiveTab('craft')}
          className={'px-4 py-2 rounded-lg text-sm ' + (activeTab === 'craft' ? 'bg-purple-600 text-white' : 'bg-void-800 text-gray-400')}>
          🔨 Craft
        </button>
      </div>

      {/* INVENTORY TAB */}
      {activeTab === 'inventory' && (
        <div className="bg-void-800/50 rounded-xl p-4 neon-border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-display text-lg text-purple-400">📦 Inventory</h3>
            <span className="text-gray-400 text-sm">{inventory.length}/{character.inventorySize}</span>
          </div>

          {/* Item List */}
          <div className="space-y-2 mb-4">
            {paginatedItems.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between bg-void-900/50 p-3 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{item.icon || '📦'}</span>
                  <div>
                    <span className={getRarityColor(item.rarity)}>{item.name}</span>
                    <span className="text-gray-500 text-sm ml-2">x{item.quantity}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {isUsable(item) && (
                    <button onClick={() => handleUseItem(item.itemId)} disabled={isLoading}
                      className="px-2 py-1 bg-green-600 hover:bg-green-500 rounded text-xs">Use</button>
                  )}
                  {isEquippable(item) && (
                    <button onClick={() => handleEquipItem(item.itemId)} disabled={isLoading}
                      className="px-2 py-1 bg-blue-600 hover:bg-blue-500 rounded text-xs">Equip</button>
                  )}
                  {canSplit(item) && (
                    <button onClick={() => { setSplitModal(item); setSplitQty(1); }} disabled={isLoading}
                      className="px-2 py-1 bg-gray-600 hover:bg-gray-500 rounded text-xs">Split</button>
                  )}
                  <button onClick={() => handleDiscardItem(item.itemId)} disabled={isLoading}
                    className="px-2 py-1 bg-red-600 hover:bg-red-500 rounded text-xs">🗑️</button>
                </div>
              </div>
            ))}
            {inventory.length === 0 && (
              <p className="text-gray-500 text-center py-4">Inventory is empty</p>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <button onClick={() => setCurrentPage(Math.max(0, currentPage - 1))} disabled={currentPage === 0}
                className="px-3 py-1 bg-void-700 rounded disabled:opacity-50">←</button>
              <span className="text-gray-400 py-1">{currentPage + 1} / {totalPages}</span>
              <button onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))} disabled={currentPage >= totalPages - 1}
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
            {EQUIPMENT_SLOTS.map(slot => {
              const equipped = character.equipment?.[slot.id];
              const hasItem = equipped && equipped.itemId;
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
                        <div className="text-xs text-gray-400 mt-1">
                          {Object.entries(equipped.stats).map(([k, v]) => k.toUpperCase() + '+' + v).join(' ')}
                        </div>
                      )}
                      <button onClick={() => handleUnequipItem(slot.id)} disabled={isLoading}
                        className="mt-2 w-full px-2 py-1 bg-red-600/50 hover:bg-red-600 rounded text-xs">Unequip</button>
                    </div>
                  ) : (
                    <p className="text-gray-600 text-xs">Empty</p>
                  )}
                </div>
              );
            })}
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
              <span className="text-3xl">{splitModal.icon || '📦'}</span>
              <div>
                <p className="text-white">{splitModal.name}</p>
                <p className="text-gray-400">Have: {splitModal.quantity}</p>
              </div>
            </div>
            <div className="mb-4">
              <label className="text-gray-400 text-sm">Split amount:</label>
              <input type="number" value={splitQty} 
                onChange={(e) => setSplitQty(Math.min(splitModal.quantity - 1, Math.max(1, parseInt(e.target.value) || 1)))}
                className="input-field mt-1" min={1} max={splitModal.quantity - 1} />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setSplitModal(null)} className="flex-1 btn-secondary">Cancel</button>
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
