import React, { useState, useEffect } from 'react';
import { tavernAPI } from '../services/api';

// ============================================================
// PHASE 9.3.6: Complete TavernPanel Overhaul
// - Fixed prop name: refreshCharacter (not onCharacterUpdate)
// - Removed gold display from header (already in left panel)
// - Added filters to Shop & Trading tabs
// - Added pagination (7 items per page) instead of scrolling
// - Added item descriptions/effects
// - Fixed double activity log issue
// ============================================================

const ITEMS_PER_PAGE = 7;

// Item descriptions database
const ITEM_DESCRIPTIONS = {
  // Health Potions
  small_health_potion: { desc: 'Restores 50 HP', effect: '+50 HP' },
  medium_health_potion: { desc: 'Restores 150 HP', effect: '+150 HP' },
  large_health_potion: { desc: 'Restores 400 HP', effect: '+400 HP' },
  mega_health_potion: { desc: 'Restores 1000 HP', effect: '+1000 HP' },
  
  // Mana Potions
  small_mana_potion: { desc: 'Restores 30 MP', effect: '+30 MP' },
  medium_mana_potion: { desc: 'Restores 80 MP', effect: '+80 MP' },
  large_mana_potion: { desc: 'Restores 200 MP', effect: '+200 MP' },
  mega_mana_potion: { desc: 'Restores 500 MP', effect: '+500 MP' },
  
  // Utility
  antidote: { desc: 'Cures poison status', effect: 'Cure Poison' },
  escape_rope: { desc: 'Escape from tower instantly', effect: 'Exit Tower' },
  energy_drink: { desc: 'Restores 20 energy', effect: '+20 Energy' },
  
  // Buff Potions
  strength_elixir: { desc: '+20% Physical DMG for 5 turns', effect: '+20% P.DMG' },
  intelligence_elixir: { desc: '+20% Magic DMG for 5 turns', effect: '+20% M.DMG' },
  iron_skin_potion: { desc: '+30% Physical DEF for 5 turns', effect: '+30% P.DEF' },
  swift_potion: { desc: '+25% Evasion for 5 turns', effect: '+25% Evasion' },
  critical_draught: { desc: '+15% Crit Rate for 5 turns', effect: '+15% Crit' },
  
  // Materials
  bone_fragment: { desc: 'Common crafting material from undead', effect: 'Material' },
  ghost_essence: { desc: 'Ethereal essence from spirits', effect: 'Material' },
  death_knight_core: { desc: 'Rare core from Death Knight', effect: 'Craft Material' },
  frost_crystal: { desc: 'Frozen crystal from ice creatures', effect: 'Material' },
  frozen_heart: { desc: 'Rare drop from ice elementals', effect: 'Craft Material' },
  shadow_essence: { desc: 'Dark essence from shadows', effect: 'Material' },
  lightning_shard: { desc: 'Charged crystal shard', effect: 'Material' },
  verdant_sap: { desc: 'Living sap from nature creatures', effect: 'Material' },
  memory_crystal_fragment: { desc: 'Combine 15 to craft Memory Crystal', effect: 'Special' },
};

// Get item description
const getItemDescription = (item) => {
  const itemId = item.itemId || item.id;
  if (ITEM_DESCRIPTIONS[itemId]) {
    return ITEM_DESCRIPTIONS[itemId];
  }
  
  // Generate description based on type
  if (item.type === 'consumable') {
    if (item.effect) {
      if (item.effect.type === 'heal') return { desc: `Restores ${item.effect.value} HP`, effect: `+${item.effect.value} HP` };
      if (item.effect.type === 'mana') return { desc: `Restores ${item.effect.value} MP`, effect: `+${item.effect.value} MP` };
      if (item.effect.type === 'energy') return { desc: `Restores ${item.effect.value} Energy`, effect: `+${item.effect.value} Energy` };
    }
    return { desc: 'Consumable item', effect: 'Use' };
  }
  
  if (item.type === 'material') {
    return { desc: 'Crafting material', effect: 'Material' };
  }
  
  if (item.type === 'equipment' || item.type === 'weapon' || item.type === 'armor') {
    const stats = item.stats ? Object.entries(item.stats).map(([k, v]) => `${k.toUpperCase()}+${v}`).join(', ') : '';
    return { desc: stats || 'Equipment item', effect: 'Equip' };
  }
  
  return { desc: '', effect: '' };
};

// Get item type for filtering
const getItemFilterType = (item) => {
  if (item.type === 'material') return 'material';
  if (item.type === 'consumable') return 'consumable';
  if (item.type === 'equipment' || item.type === 'weapon' || item.type === 'armor' || item.type === 'accessory') return 'equipment';
  return 'other';
};

// Pagination component
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  
  return (
    <div className="flex items-center justify-center gap-2 mt-3">
      <button 
        onClick={() => onPageChange(Math.max(0, currentPage - 1))} 
        disabled={currentPage === 0}
        className="px-3 py-1 bg-void-700 rounded disabled:opacity-50 text-sm"
      >
        ←
      </button>
      <span className="text-gray-400 text-sm">{currentPage + 1} / {totalPages}</span>
      <button 
        onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))} 
        disabled={currentPage >= totalPages - 1}
        className="px-3 py-1 bg-void-700 rounded disabled:opacity-50 text-sm"
      >
        →
      </button>
    </div>
  );
};

// PHASE 9.3.6 FIX: Changed prop from onCharacterUpdate to refreshCharacter
const TavernPanel = ({ character, refreshCharacter, addLog }) => {
  const [activeTab, setActiveTab] = useState('shop');
  const [shopItems, setShopItems] = useState([]);
  const [tradingListings, setTradingListings] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [buyModal, setBuyModal] = useState(null);
  const [sellModal, setSellModal] = useState(null);
  const [listModal, setListModal] = useState(null);
  const [quantity, setQuantity] = useState(1);
  
  // Filters
  const [shopFilter, setShopFilter] = useState('all');
  const [tradingFilter, setTradingFilter] = useState('all');
  const [sellFilter, setSellFilter] = useState('all');
  
  // Pagination
  const [shopPage, setShopPage] = useState(0);
  const [tradingPage, setTradingPage] = useState(0);
  const [sellPage, setSellPage] = useState(0);
  const [myListingsPage, setMyListingsPage] = useState(0);

  useEffect(() => {
    if (activeTab === 'shop') fetchShop();
    else if (activeTab === 'trading') { fetchTrading(); fetchMyListings(); }
  }, [activeTab]);

  // Reset page when filter changes
  useEffect(() => { setShopPage(0); }, [shopFilter]);
  useEffect(() => { setTradingPage(0); }, [tradingFilter]);
  useEffect(() => { setSellPage(0); }, [sellFilter]);

  const fetchShop = async () => {
    try {
      const { data } = await tavernAPI.getShop();
      setShopItems(data.items || []);
    } catch (err) { console.error(err); }
  };

  const fetchTrading = async () => {
    try {
      const { data } = await tavernAPI.getListings();
      setTradingListings(data.listings || []);
    } catch (err) { console.error(err); }
  };

  const fetchMyListings = async () => {
    try {
      const { data } = await tavernAPI.getMyListings();
      setMyListings(data.listings || []);
    } catch (err) { console.error(err); }
  };

  // PHASE 9.3.6 FIX: Use refreshCharacter, single log, proper error handling
  const handleBuyFromShop = async () => {
    if (!buyModal) return;
    setIsLoading(true);
    try {
      const { data } = await tavernAPI.buy(buyModal.itemId, quantity);
      addLog('success', data.message);
      await refreshCharacter();
      setBuyModal(null);
      setQuantity(1);
    } catch (err) {
      addLog('error', err.response?.data?.error || 'Purchase failed');
    }
    setIsLoading(false);
  };

  const handleSellToShop = async () => {
    if (!sellModal) return;
    setIsLoading(true);
    try {
      const { data } = await tavernAPI.sell(sellModal.itemId, quantity);
      addLog('success', data.message);
      await refreshCharacter();
      setSellModal(null);
      setQuantity(1);
    } catch (err) {
      addLog('error', err.response?.data?.error || 'Sale failed');
    }
    setIsLoading(false);
  };

  const handleListItem = async () => {
    if (!listModal) return;
    setIsLoading(true);
    try {
      const { data } = await tavernAPI.createListing(listModal.itemId, listModal.quantity, listModal.price);
      addLog('success', data.message);
      await refreshCharacter();
      fetchMyListings();
      setListModal(null);
    } catch (err) {
      addLog('error', err.response?.data?.error || 'Listing failed');
    }
    setIsLoading(false);
  };

  const handleBuyFromPlayer = async (listing) => {
    setIsLoading(true);
    try {
      const { data } = await tavernAPI.buyListing(listing._id, listing.quantity);
      addLog('success', data.message);
      await refreshCharacter();
      fetchTrading();
    } catch (err) {
      addLog('error', err.response?.data?.error || 'Purchase failed');
    }
    setIsLoading(false);
  };

  const handleCancelListing = async (listingId) => {
    setIsLoading(true);
    try {
      const { data } = await tavernAPI.cancelListing(listingId);
      addLog('info', data.message);
      await refreshCharacter();
      fetchMyListings();
    } catch (err) {
      addLog('error', err.response?.data?.error || 'Cancel failed');
    }
    setIsLoading(false);
  };

  // Filter shop items
  const filteredShopItems = shopItems.filter(item => {
    if (shopFilter === 'all') return true;
    return getItemFilterType(item) === shopFilter;
  });
  
  // Filter trading listings (exclude own)
  const filteredTradingListings = tradingListings
    .filter(l => l.sellerId !== character.userId)
    .filter(item => {
      if (tradingFilter === 'all') return true;
      return getItemFilterType(item) === tradingFilter;
    });
  
  // Filter sell items
  const sellableInventory = (character.inventory || []).filter(item => 
    item.type !== 'scroll' && item.itemId !== 'memory_crystal'
  );
  const filteredSellItems = sellableInventory.filter(item => {
    if (sellFilter === 'all') return true;
    return getItemFilterType(item) === sellFilter;
  });

  // Calculate counts for filters
  const shopCounts = {
    all: shopItems.length,
    consumable: shopItems.filter(i => getItemFilterType(i) === 'consumable').length,
    material: shopItems.filter(i => getItemFilterType(i) === 'material').length,
    equipment: shopItems.filter(i => getItemFilterType(i) === 'equipment').length,
  };
  
  const tradingCounts = {
    all: tradingListings.filter(l => l.sellerId !== character.userId).length,
    consumable: tradingListings.filter(l => l.sellerId !== character.userId && getItemFilterType(l) === 'consumable').length,
    material: tradingListings.filter(l => l.sellerId !== character.userId && getItemFilterType(l) === 'material').length,
    equipment: tradingListings.filter(l => l.sellerId !== character.userId && getItemFilterType(l) === 'equipment').length,
  };
  
  const sellCounts = {
    all: sellableInventory.length,
    consumable: sellableInventory.filter(i => getItemFilterType(i) === 'consumable').length,
    material: sellableInventory.filter(i => getItemFilterType(i) === 'material').length,
    equipment: sellableInventory.filter(i => getItemFilterType(i) === 'equipment').length,
  };

  // Paginate items
  const paginatedShopItems = filteredShopItems.slice(shopPage * ITEMS_PER_PAGE, (shopPage + 1) * ITEMS_PER_PAGE);
  const paginatedTradingListings = filteredTradingListings.slice(tradingPage * ITEMS_PER_PAGE, (tradingPage + 1) * ITEMS_PER_PAGE);
  const paginatedSellItems = filteredSellItems.slice(sellPage * ITEMS_PER_PAGE, (sellPage + 1) * ITEMS_PER_PAGE);
  const paginatedMyListings = myListings.slice(myListingsPage * ITEMS_PER_PAGE, (myListingsPage + 1) * ITEMS_PER_PAGE);

  // Filter buttons component
  const FilterButtons = ({ filter, setFilter, counts }) => (
    <div className="flex gap-2 mb-4 flex-wrap">
      <button onClick={() => setFilter('all')}
        className={'px-3 py-1 rounded text-xs ' + (filter === 'all' ? 'bg-purple-600 text-white' : 'bg-void-900 text-gray-400')}>
        All ({counts.all})
      </button>
      <button onClick={() => setFilter('consumable')}
        className={'px-3 py-1 rounded text-xs ' + (filter === 'consumable' ? 'bg-purple-600 text-white' : 'bg-void-900 text-gray-400')}>
        🧪 ({counts.consumable})
      </button>
      <button onClick={() => setFilter('material')}
        className={'px-3 py-1 rounded text-xs ' + (filter === 'material' ? 'bg-purple-600 text-white' : 'bg-void-900 text-gray-400')}>
        📦 ({counts.material})
      </button>
      <button onClick={() => setFilter('equipment')}
        className={'px-3 py-1 rounded text-xs ' + (filter === 'equipment' ? 'bg-purple-600 text-white' : 'bg-void-900 text-gray-400')}>
        ⚔️ ({counts.equipment})
      </button>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* PHASE 9.3.6: Removed gold display - already shown in left panel */}
      <div className="text-center mb-4">
        <h2 className="font-display text-2xl text-amber-400 mb-1">🍺 TAVERN</h2>
        <p className="text-gray-500 text-sm">Buy, sell, and trade with other hunters</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 justify-center mb-4">
        <button onClick={() => setActiveTab('shop')}
          className={'px-4 py-2 rounded-lg text-sm ' + (activeTab === 'shop' ? 'bg-amber-600 text-white' : 'bg-void-800 text-gray-400')}>
          🏪 Shop
        </button>
        <button onClick={() => setActiveTab('trading')}
          className={'px-4 py-2 rounded-lg text-sm ' + (activeTab === 'trading' ? 'bg-amber-600 text-white' : 'bg-void-800 text-gray-400')}>
          🤝 Trading Stall
        </button>
        <button onClick={() => setActiveTab('sell')}
          className={'px-4 py-2 rounded-lg text-sm ' + (activeTab === 'sell' ? 'bg-amber-600 text-white' : 'bg-void-800 text-gray-400')}>
          💰 Sell Items
        </button>
      </div>

      {/* SHOP TAB */}
      {activeTab === 'shop' && (
        <div className="bg-void-800/50 rounded-xl p-4 neon-border">
          <h3 className="font-display text-lg text-amber-400 mb-4">🏪 Tavern Shop</h3>
          
          {/* Filter buttons */}
          <FilterButtons filter={shopFilter} setFilter={setShopFilter} counts={shopCounts} />
          
          {/* Item list */}
          <div className="space-y-2">
            {paginatedShopItems.map(item => {
              const itemDesc = getItemDescription(item);
              return (
                <div key={item.itemId} className="flex items-center justify-between bg-void-900/50 p-3 rounded-lg">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-xl">{item.icon || '📦'}</span>
                    <div className="flex-1">
                      <span className="text-white">{item.name}</span>
                      {itemDesc.effect && (
                        <span className="text-green-400 text-xs ml-2">({itemDesc.effect})</span>
                      )}
                      {itemDesc.desc && (
                        <p className="text-gray-500 text-xs">{itemDesc.desc}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-yellow-400">{item.price}g</span>
                    <button onClick={() => { setBuyModal(item); setQuantity(1); }}
                      className="px-3 py-1 bg-green-600 hover:bg-green-500 rounded text-sm">Buy</button>
                  </div>
                </div>
              );
            })}
            {filteredShopItems.length === 0 && <p className="text-gray-500 text-center py-4">No items found</p>}
          </div>
          
          {/* Pagination */}
          <Pagination 
            currentPage={shopPage} 
            totalPages={Math.ceil(filteredShopItems.length / ITEMS_PER_PAGE)} 
            onPageChange={setShopPage} 
          />
        </div>
      )}

      {/* TRADING TAB */}
      {activeTab === 'trading' && (
        <div className="space-y-4">
          {/* My Listings */}
          {myListings.length > 0 && (
            <div className="bg-void-800/50 rounded-xl p-4 neon-border">
              <h3 className="font-display text-lg text-purple-400 mb-3">📋 My Listings ({myListings.length})</h3>
              <div className="space-y-2">
                {paginatedMyListings.map(listing => (
                  <div key={listing._id} className="flex items-center justify-between bg-void-900/50 p-3 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{listing.itemIcon || '📦'}</span>
                      <div>
                        <span className="text-white">{listing.itemName}</span>
                        <span className="text-gray-400 text-sm ml-2">x{listing.quantity}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-yellow-400">{listing.totalPrice}g</span>
                      <button onClick={() => handleCancelListing(listing._id)} disabled={isLoading}
                        className="px-3 py-1 bg-red-600 hover:bg-red-500 rounded text-sm">Cancel</button>
                    </div>
                  </div>
                ))}
              </div>
              <Pagination 
                currentPage={myListingsPage} 
                totalPages={Math.ceil(myListings.length / ITEMS_PER_PAGE)} 
                onPageChange={setMyListingsPage} 
              />
            </div>
          )}

          {/* All Listings */}
          <div className="bg-void-800/50 rounded-xl p-4 neon-border">
            <h3 className="font-display text-lg text-amber-400 mb-3">🤝 Trading Stall</h3>
            
            {/* Filter buttons */}
            <FilterButtons filter={tradingFilter} setFilter={setTradingFilter} counts={tradingCounts} />
            
            <div className="space-y-2">
              {paginatedTradingListings.map(listing => {
                const itemDesc = getItemDescription(listing);
                return (
                  <div key={listing._id} className="flex items-center justify-between bg-void-900/50 p-3 rounded-lg">
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-xl">{listing.itemIcon || '📦'}</span>
                      <div className="flex-1">
                        <span className="text-white">{listing.itemName}</span>
                        <span className="text-gray-400 text-sm ml-2">x{listing.quantity}</span>
                        {itemDesc.effect && (
                          <span className="text-green-400 text-xs ml-2">({itemDesc.effect})</span>
                        )}
                        <p className="text-xs text-gray-500">Seller: {listing.characterName || listing.sellerName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-yellow-400">{listing.totalPrice}g</p>
                        <p className="text-xs text-gray-500">{listing.pricePerUnit}g each</p>
                      </div>
                      <button onClick={() => handleBuyFromPlayer(listing)} disabled={isLoading || character.gold < listing.totalPrice}
                        className="px-3 py-1 bg-green-600 hover:bg-green-500 rounded text-sm disabled:opacity-50">Buy</button>
                    </div>
                  </div>
                );
              })}
              {filteredTradingListings.length === 0 && 
                <p className="text-gray-500 text-center py-4">No items for sale</p>}
            </div>
            
            <Pagination 
              currentPage={tradingPage} 
              totalPages={Math.ceil(filteredTradingListings.length / ITEMS_PER_PAGE)} 
              onPageChange={setTradingPage} 
            />
          </div>
        </div>
      )}

      {/* SELL TAB */}
      {activeTab === 'sell' && (
        <div className="bg-void-800/50 rounded-xl p-4 neon-border">
          <h3 className="font-display text-lg text-amber-400 mb-4">💰 Sell or List Items</h3>
          
          {/* Filter buttons */}
          <FilterButtons filter={sellFilter} setFilter={setSellFilter} counts={sellCounts} />
          
          {/* Item list */}
          <div className="space-y-2">
            {paginatedSellItems.map((item, idx) => {
              const sellPrice = item.sellPrice || Math.max(2, Math.floor((item.stats?.value || 5) * 0.4));
              const itemDesc = getItemDescription(item);
              
              return (
                <div key={idx} className="flex items-center justify-between bg-void-900/50 p-3 rounded-lg">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-xl">{item.icon || '📦'}</span>
                    <div className="flex-1">
                      <span className="text-white">{item.name}</span>
                      <span className="text-gray-400 text-sm ml-2">x{item.quantity}</span>
                      {itemDesc.effect && (
                        <span className="text-green-400 text-xs ml-2">({itemDesc.effect})</span>
                      )}
                      <span className="text-gray-500 text-xs ml-2">({item.type})</span>
                    </div>
                    <div className="text-yellow-400 text-sm mr-4">
                      💰 {sellPrice}g each
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => { setSellModal({ ...item, sellPrice }); setQuantity(1); }}
                      className="px-3 py-1 bg-yellow-600 hover:bg-yellow-500 rounded text-sm">Sell</button>
                    <button onClick={() => setListModal({ ...item, quantity: 1, price: sellPrice * 2 })}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-sm">List</button>
                  </div>
                </div>
              );
            })}
            {filteredSellItems.length === 0 && 
              <p className="text-gray-500 text-center py-4">No items to sell</p>}
          </div>
          
          <Pagination 
            currentPage={sellPage} 
            totalPages={Math.ceil(filteredSellItems.length / ITEMS_PER_PAGE)} 
            onPageChange={setSellPage} 
          />
        </div>
      )}

      {/* BUY MODAL */}
      {buyModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-void-800 rounded-xl p-6 w-full max-w-sm neon-border">
            <h3 className="font-display text-lg text-amber-400 mb-4">Buy {buyModal.name}</h3>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{buyModal.icon || '📦'}</span>
              <div>
                <p className="text-white">{buyModal.name}</p>
                <p className="text-yellow-400">{buyModal.price}g each</p>
                {(() => {
                  const desc = getItemDescription(buyModal);
                  return desc.desc && <p className="text-gray-400 text-sm">{desc.desc}</p>;
                })()}
              </div>
            </div>
            <div className="mb-4">
              <label className="text-gray-400 text-sm">Quantity:</label>
              <input type="number" value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="input-field mt-1" min={1} />
              <p className="text-yellow-400 mt-2">Total: {buyModal.price * quantity}g</p>
              <p className="text-gray-500 text-xs mt-1">Your gold: {character.gold}g</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setBuyModal(null)} className="flex-1 btn-secondary">Cancel</button>
              <button onClick={handleBuyFromShop} disabled={isLoading || character.gold < buyModal.price * quantity}
                className="flex-1 btn-primary disabled:opacity-50">Buy</button>
            </div>
          </div>
        </div>
      )}

      {/* SELL MODAL */}
      {sellModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-void-800 rounded-xl p-6 w-full max-w-sm neon-border">
            <h3 className="font-display text-lg text-amber-400 mb-4">Sell {sellModal.name}</h3>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{sellModal.icon || '📦'}</span>
              <div>
                <p className="text-white">{sellModal.name}</p>
                <p className="text-gray-400">Have: {sellModal.quantity}</p>
                <p className="text-green-400 text-sm">{sellModal.sellPrice}g each</p>
              </div>
            </div>
            <div className="mb-4">
              <label className="text-gray-400 text-sm">Quantity to sell:</label>
              <input type="number" value={quantity} onChange={(e) => setQuantity(Math.min(sellModal.quantity, Math.max(1, parseInt(e.target.value) || 1)))}
                className="input-field mt-1" min={1} max={sellModal.quantity} />
              <p className="text-green-400 mt-2">You'll receive: {quantity * sellModal.sellPrice}g</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setSellModal(null)} className="flex-1 btn-secondary">Cancel</button>
              <button onClick={handleSellToShop} disabled={isLoading}
                className="flex-1 btn-primary disabled:opacity-50">Sell</button>
            </div>
          </div>
        </div>
      )}

      {/* LIST MODAL */}
      {listModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-void-800 rounded-xl p-6 w-full max-w-sm neon-border">
            <h3 className="font-display text-lg text-blue-400 mb-4">List {listModal.name}</h3>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{listModal.icon || '📦'}</span>
              <div>
                <p className="text-white">{listModal.name}</p>
                <p className="text-gray-400">Have: {character.inventory.find(i => i.itemId === listModal.itemId)?.quantity || listModal.quantity}</p>
              </div>
            </div>
            <div className="space-y-3 mb-4">
              <div>
                <label className="text-gray-400 text-sm">Quantity to list:</label>
                <input type="number" value={listModal.quantity} 
                  onChange={(e) => setListModal({...listModal, quantity: Math.min(character.inventory.find(i => i.itemId === listModal.itemId)?.quantity || 1, Math.max(1, parseInt(e.target.value) || 1))})}
                  className="input-field mt-1" min={1} />
              </div>
              <div>
                <label className="text-gray-400 text-sm">Price per item (gold):</label>
                <input type="number" value={listModal.price}
                  onChange={(e) => setListModal({...listModal, price: Math.max(1, parseInt(e.target.value) || 1)})}
                  className="input-field mt-1" min={1} />
              </div>
              <p className="text-yellow-400">Total: {listModal.quantity * listModal.price}g</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setListModal(null)} className="flex-1 btn-secondary">Cancel</button>
              <button onClick={handleListItem} disabled={isLoading}
                className="flex-1 btn-primary disabled:opacity-50">List for Sale</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TavernPanel;
