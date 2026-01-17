import React, { useState, useEffect } from 'react';
import { tavernAPI } from '../services/api';

// ============================================================
// PHASE 9.3.7: Unified Item Display System
// Format:
// - Consumable: [icon] Name | Description (effect)
// - Equipment: [icon] Name | Requirements | Stats
// - Material: [icon] Name | Description
// ============================================================

const ITEMS_PER_PAGE = 7;

// Helper function to check if item is equipment type
const isEquipmentType = (item) => {
  return item.type === 'equipment' || item.type === 'weapon' || item.type === 'armor' || item.type === 'accessory';
};

// Get icon based on item type/subtype
const getItemIcon = (item) => {
  if (item.icon && item.icon !== '📦') return item.icon;
  if (item.itemIcon) return item.itemIcon;
  
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
  if (item.subtype === 'potion') return '🧪';
  if (item.subtype === 'drop') return '🪨';
  
  // By type
  if (item.type === 'material') return '🪨';
  if (item.type === 'consumable') return '🧪';
  if (isEquipmentType(item)) return '⚔️';
  if (item.type === 'scroll') return '📜';
  if (item.type === 'special') return '💎';
  
  return '📦';
};

// Get effect/use text for item (short version for display)
const getItemEffect = (item) => {
  // Consumables - show effect value
  if (item.type === 'consumable') {
    if (item.effect) {
      if (item.effect.type === 'heal') return '+' + item.effect.value + ' HP';
      if (item.effect.type === 'mana') return '+' + item.effect.value + ' MP';
      if (item.effect.type === 'energy') return '+' + item.effect.value + ' Energy';
      if (item.effect.type === 'buff') return item.effect.buffType || 'Buff';
    }
    // Fallback by name
    const name = (item.name || item.itemName || '').toLowerCase();
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
    const statList = Object.entries(item.stats).map(([k, v]) => k.toUpperCase() + '+' + v);
    return statList.join(' ');
  }
  
  // Materials
  if (item.type === 'material') {
    return 'Material';
  }
  
  return '';
};

// Get description text for item
const getItemDescription = (item) => {
  // Consumables
  if (item.type === 'consumable') {
    if (item.effect) {
      if (item.effect.type === 'heal') return 'Restores ' + item.effect.value + ' HP';
      if (item.effect.type === 'mana') return 'Restores ' + item.effect.value + ' MP';
      if (item.effect.type === 'energy') return 'Restores ' + item.effect.value + ' Energy';
    }
    const name = (item.name || item.itemName || '').toLowerCase();
    if (name.includes('antidote')) return 'Cures poison status';
    if (name.includes('escape')) return 'Escape tower instantly';
    if (name.includes('strength')) return '+20% Physical DMG for 5 turns';
    if (name.includes('intelligence')) return '+20% Magic DMG for 5 turns';
    if (name.includes('iron skin')) return '+30% Physical DEF for 5 turns';
    if (name.includes('swift')) return '+25% Evasion for 5 turns';
    if (name.includes('critical')) return '+15% Crit Rate for 5 turns';
    return '';
  }
  
  // Materials
  if (item.type === 'material') {
    return 'Crafting material';
  }
  
  return '';
};

// Get requirements for equipment
const getItemRequirements = (item, character) => {
  if (!isEquipmentType(item)) return null;
  
  const reqs = [];
  
  if (item.levelReq) {
    const meetsLevel = !character || character.level >= item.levelReq;
    reqs.push({ text: 'Lv.' + item.levelReq, met: meetsLevel });
  }
  
  if (item.classReq || item.class) {
    const reqClass = item.classReq || item.class;
    const meetsClass = !character || reqClass.toLowerCase() === character.baseClass.toLowerCase();
    reqs.push({ text: reqClass.charAt(0).toUpperCase() + reqClass.slice(1), met: meetsClass });
  }
  
  return reqs.length > 0 ? reqs : null;
};

// Get item type for filtering
const getItemFilterType = (item) => {
  if (item.type === 'material') return 'material';
  if (item.type === 'consumable') return 'consumable';
  if (isEquipmentType(item)) return 'equipment';
  return 'other';
};

// Rarity colors
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

const getRarityBorder = (rarity) => {
  const colors = {
    common: 'border-gray-600',
    uncommon: 'border-green-500/50',
    rare: 'border-blue-500/50',
    epic: 'border-purple-500/50',
    legendary: 'border-amber-500/50'
  };
  return colors[rarity] || 'border-gray-600';
};

const getRarityBg = (rarity) => {
  const colors = {
    common: 'bg-gray-800/50',
    uncommon: 'bg-green-900/20',
    rare: 'bg-blue-900/20',
    epic: 'bg-purple-900/20',
    legendary: 'bg-amber-900/20'
  };
  return colors[rarity] || 'bg-gray-800/50';
};

// ============================================================
// ItemDisplay Component - Unified item rendering
// ============================================================
const ItemDisplay = ({ item, character, showQuantity = true, rightContent }) => {
  const icon = getItemIcon(item);
  const effect = getItemEffect(item);
  const description = getItemDescription(item);
  const requirements = getItemRequirements(item, character);
  const isEquip = isEquipmentType(item);
  const itemName = item.name || item.itemName;
  const quantity = item.quantity;

  return (
    <div className={'p-3 rounded-lg border ' + getRarityBorder(item.rarity) + ' ' + getRarityBg(item.rarity)}>
      <div className="flex items-start gap-3">
        {/* Icon */}
        <span className="text-2xl mt-0.5">{icon}</span>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Top Row: Name + Quantity */}
          <div className="flex items-center gap-2">
            <span className={getRarityColor(item.rarity) + ' font-medium truncate'}>{itemName}</span>
            {showQuantity && quantity > 1 && (
              <span className="text-gray-500 text-sm">x{quantity}</span>
            )}
          </div>
          
          {/* Middle Row: Requirements (Equipment only) */}
          {isEquip && requirements && (
            <div className="flex flex-wrap gap-1 mt-1">
              {requirements.map((req, idx) => (
                <span key={idx} className={'text-xs px-1.5 py-0.5 rounded ' + (req.met ? 'bg-green-900/40 text-green-400' : 'bg-red-900/40 text-red-400')}>
                  {req.text} {req.met ? '✓' : '✗'}
                </span>
              ))}
            </div>
          )}
          
          {/* Bottom Row: Effect/Description */}
          {effect && (
            <p className="text-green-400 text-xs mt-1">({effect})</p>
          )}
          {description && !effect && (
            <p className="text-gray-500 text-xs mt-1">{description}</p>
          )}
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

// ============================================================
// Main TavernPanel Component
// ============================================================
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

  return (
    <div className="space-y-4">
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
          🤝 Trading
        </button>
        <button onClick={() => setActiveTab('sell')}
          className={'px-4 py-2 rounded-lg text-sm ' + (activeTab === 'sell' ? 'bg-amber-600 text-white' : 'bg-void-800 text-gray-400')}>
          💰 Sell
        </button>
      </div>

      {/* SHOP TAB */}
      {activeTab === 'shop' && (
        <div className="bg-void-800/50 rounded-xl p-4 neon-border">
          <h3 className="font-display text-lg text-amber-400 mb-4">🏪 Tavern Shop</h3>
          
          <FilterButtons filter={shopFilter} setFilter={setShopFilter} counts={shopCounts} />
          
          <div className="space-y-2">
            {paginatedShopItems.map(item => (
              <ItemDisplay 
                key={item.itemId}
                item={item}
                character={character}
                showQuantity={false}
                rightContent={
                  <div className="flex items-center gap-3">
                    <span className="text-yellow-400 text-sm">{item.price}g</span>
                    <button 
                      onClick={() => { setBuyModal(item); setQuantity(1); }}
                      className="px-3 py-1 bg-green-600 hover:bg-green-500 rounded text-sm"
                    >
                      Buy
                    </button>
                  </div>
                }
              />
            ))}
            {filteredShopItems.length === 0 && 
              <p className="text-gray-500 text-center py-4">No items found</p>}
          </div>
          
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
                  <div key={listing._id} className="p-3 rounded-lg border border-purple-500/30 bg-purple-900/20">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{listing.itemIcon || '📦'}</span>
                      <div className="flex-1">
                        <span className="text-white">{listing.itemName}</span>
                        <span className="text-gray-400 text-sm ml-2">x{listing.quantity}</span>
                        <p className="text-yellow-400 text-xs">{listing.totalPrice}g total</p>
                      </div>
                      <button 
                        onClick={() => handleCancelListing(listing._id)} 
                        disabled={isLoading}
                        className="px-3 py-1 bg-red-600 hover:bg-red-500 rounded text-sm"
                      >
                        Cancel
                      </button>
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
            
            <FilterButtons filter={tradingFilter} setFilter={setTradingFilter} counts={tradingCounts} />
            
            <div className="space-y-2">
              {paginatedTradingListings.map(listing => (
                <ItemDisplay 
                  key={listing._id}
                  item={listing}
                  character={character}
                  rightContent={
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-yellow-400 text-sm">{listing.totalPrice}g</span>
                      <span className="text-gray-500 text-xs">{listing.pricePerUnit}g ea</span>
                      <button 
                        onClick={() => handleBuyFromPlayer(listing)} 
                        disabled={isLoading || character.gold < listing.totalPrice}
                        className="px-3 py-1 bg-green-600 hover:bg-green-500 rounded text-sm disabled:opacity-50"
                      >
                        Buy
                      </button>
                    </div>
                  }
                />
              ))}
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
          
          <FilterButtons filter={sellFilter} setFilter={setSellFilter} counts={sellCounts} />
          
          <div className="space-y-2">
            {paginatedSellItems.map((item, idx) => {
              const sellPrice = item.sellPrice || Math.max(2, Math.floor((item.stats?.value || 5) * 0.4));
              
              return (
                <ItemDisplay 
                  key={idx}
                  item={item}
                  character={character}
                  rightContent={
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-yellow-400 text-sm">{sellPrice}g ea</span>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => { setSellModal({ ...item, sellPrice }); setQuantity(1); }}
                          className="px-2 py-1 bg-yellow-600 hover:bg-yellow-500 rounded text-xs"
                        >
                          Sell
                        </button>
                        <button 
                          onClick={() => setListModal({ ...item, quantity: 1, price: sellPrice * 2 })}
                          className="px-2 py-1 bg-blue-600 hover:bg-blue-500 rounded text-xs"
                        >
                          List
                        </button>
                      </div>
                    </div>
                  }
                />
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
            <h3 className="font-display text-lg text-amber-400 mb-4">Buy Item</h3>
            
            <ItemDisplay item={buyModal} character={character} showQuantity={false} />
            
            <div className="mt-4 mb-4">
              <label className="text-gray-400 text-sm">Quantity:</label>
              <input 
                type="number" 
                value={quantity} 
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="input-field mt-1" 
                min={1} 
              />
              <p className="text-yellow-400 mt-2">Total: {buyModal.price * quantity}g</p>
              <p className="text-gray-500 text-xs mt-1">Your gold: {character.gold}g</p>
            </div>
            
            <div className="flex gap-3">
              <button onClick={() => setBuyModal(null)} className="flex-1 btn-secondary">Cancel</button>
              <button 
                onClick={handleBuyFromShop} 
                disabled={isLoading || character.gold < buyModal.price * quantity}
                className="flex-1 btn-primary disabled:opacity-50"
              >
                Buy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SELL MODAL */}
      {sellModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-void-800 rounded-xl p-6 w-full max-w-sm neon-border">
            <h3 className="font-display text-lg text-amber-400 mb-4">Sell Item</h3>
            
            <ItemDisplay item={sellModal} character={character} />
            
            <div className="mt-4 mb-4">
              <label className="text-gray-400 text-sm">Quantity to sell:</label>
              <input 
                type="number" 
                value={quantity} 
                onChange={(e) => setQuantity(Math.min(sellModal.quantity, Math.max(1, parseInt(e.target.value) || 1)))}
                className="input-field mt-1" 
                min={1} 
                max={sellModal.quantity} 
              />
              <p className="text-green-400 mt-2">You'll receive: {quantity * sellModal.sellPrice}g</p>
            </div>
            
            <div className="flex gap-3">
              <button onClick={() => setSellModal(null)} className="flex-1 btn-secondary">Cancel</button>
              <button 
                onClick={handleSellToShop} 
                disabled={isLoading}
                className="flex-1 btn-primary disabled:opacity-50"
              >
                Sell
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LIST MODAL */}
      {listModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-void-800 rounded-xl p-6 w-full max-w-sm neon-border">
            <h3 className="font-display text-lg text-blue-400 mb-4">List for Trading</h3>
            
            <ItemDisplay item={listModal} character={character} />
            
            <div className="space-y-3 mt-4 mb-4">
              <div>
                <label className="text-gray-400 text-sm">Quantity to list:</label>
                <input 
                  type="number" 
                  value={listModal.quantity} 
                  onChange={(e) => setListModal({
                    ...listModal, 
                    quantity: Math.min(
                      character.inventory.find(i => i.itemId === listModal.itemId)?.quantity || 1, 
                      Math.max(1, parseInt(e.target.value) || 1)
                    )
                  })}
                  className="input-field mt-1" 
                  min={1} 
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm">Price per item (gold):</label>
                <input 
                  type="number" 
                  value={listModal.price}
                  onChange={(e) => setListModal({...listModal, price: Math.max(1, parseInt(e.target.value) || 1)})}
                  className="input-field mt-1" 
                  min={1} 
                />
              </div>
              <p className="text-yellow-400">Total: {listModal.quantity * listModal.price}g</p>
            </div>
            
            <div className="flex gap-3">
              <button onClick={() => setListModal(null)} className="flex-1 btn-secondary">Cancel</button>
              <button 
                onClick={handleListItem} 
                disabled={isLoading}
                className="flex-1 btn-primary disabled:opacity-50"
              >
                List for Sale
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TavernPanel;
