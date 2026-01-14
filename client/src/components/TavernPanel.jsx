import React, { useState, useEffect } from 'react';
import { tavernAPI } from '../services/api';

// Item type icons
var TYPE_ICONS = {
  material: '🪨',
  consumable: '🧪',
  equipment: '⚔️',
  scroll: '📜',
  special: '💎'
};

// Get icon based on item type
function getItemIcon(item) {
  if (item.icon && item.icon !== '📦') return item.icon;
  if (item.itemIcon && item.itemIcon !== '📦') return item.itemIcon;
  
  var type = item.type || item.itemType;
  if (type === 'material') return '🪨';
  if (type === 'consumable') return '🧪';
  if (type === 'equipment') return '⚔️';
  if (type === 'scroll') return '📜';
  if (type === 'special') return '💎';
  
  return '📦';
}

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

var TavernPanel = function(props) {
  var character = props.character;
  var onCharacterUpdate = props.onCharacterUpdate;
  var addLog = props.addLog;

  var [activeTab, setActiveTab] = useState('shop');
  var [shopItems, setShopItems] = useState([]);
  var [tradingListings, setTradingListings] = useState([]);
  var [myListings, setMyListings] = useState([]);
  var [isLoading, setIsLoading] = useState(false);
  var [buyModal, setBuyModal] = useState(null);
  var [sellModal, setSellModal] = useState(null);
  var [listModal, setListModal] = useState(null);
  var [quantity, setQuantity] = useState(1);
  
  // Filters
  var [shopFilter, setShopFilter] = useState('all');
  var [tradingFilter, setTradingFilter] = useState('all');
  var [sellFilter, setSellFilter] = useState('all');

  useEffect(function() {
    if (activeTab === 'shop') fetchShop();
    else if (activeTab === 'trading') { fetchTrading(); fetchMyListings(); }
  }, [activeTab]);

  var fetchShop = async function() {
    try {
      var response = await tavernAPI.getShop();
      setShopItems(response.data.items);
    } catch (err) { console.error(err); }
  };

  var fetchTrading = async function() {
    try {
      var response = await tavernAPI.getTradingListings();
      setTradingListings(response.data.listings);
    } catch (err) { console.error(err); }
  };

  var fetchMyListings = async function() {
    try {
      var response = await tavernAPI.getMyListings();
      setMyListings(response.data.listings);
    } catch (err) { console.error(err); }
  };

  var handleBuyFromShop = async function() {
    if (!buyModal) return;
    setIsLoading(true);
    try {
      var response = await tavernAPI.buyFromShop(buyModal.itemId, quantity);
      addLog('success', response.data.message);
      onCharacterUpdate();
      setBuyModal(null);
      setQuantity(1);
    } catch (err) {
      addLog('error', err.response?.data?.error || 'Purchase failed');
    }
    setIsLoading(false);
  };

  var handleSellToShop = async function() {
    if (!sellModal) return;
    setIsLoading(true);
    try {
      var response = await tavernAPI.sellToShop(sellModal.itemId, quantity);
      addLog('success', response.data.message);
      onCharacterUpdate();
      setSellModal(null);
      setQuantity(1);
    } catch (err) {
      addLog('error', err.response?.data?.error || 'Sale failed');
    }
    setIsLoading(false);
  };

  var handleListItem = async function() {
    if (!listModal) return;
    setIsLoading(true);
    try {
      var response = await tavernAPI.listItem(listModal.itemId, listModal.quantity, listModal.price);
      addLog('success', response.data.message);
      onCharacterUpdate();
      fetchMyListings();
      setListModal(null);
    } catch (err) {
      addLog('error', err.response?.data?.error || 'Listing failed');
    }
    setIsLoading(false);
  };

  var handleBuyFromPlayer = async function(listing) {
    setIsLoading(true);
    try {
      var response = await tavernAPI.buyFromPlayer(listing._id, listing.quantity);
      addLog('success', response.data.message);
      onCharacterUpdate();
      fetchTrading();
    } catch (err) {
      addLog('error', err.response?.data?.error || 'Purchase failed');
    }
    setIsLoading(false);
  };

  var handleCancelListing = async function(listingId) {
    setIsLoading(true);
    try {
      var response = await tavernAPI.cancelListing(listingId);
      addLog('info', response.data.message);
      onCharacterUpdate();
      fetchMyListings();
    } catch (err) {
      addLog('error', err.response?.data?.error || 'Cancel failed');
    }
    setIsLoading(false);
  };

  // Filter functions
  var filterItems = function(items, filter, typeKey) {
    if (filter === 'all') return items;
    return items.filter(function(item) {
      var type = item[typeKey] || item.type;
      if (filter === 'material') return type === 'material';
      if (filter === 'consumable') return type === 'consumable';
      if (filter === 'equipment') return type === 'equipment';
      return true;
    });
  };

  // Get filtered items
  var filteredShopItems = filterItems(shopItems, shopFilter, 'type');
  var filteredTradingListings = filterItems(
    tradingListings.filter(function(l) { return l.sellerId !== character.userId; }), 
    tradingFilter, 
    'itemType'
  );
  var sellableItems = character.inventory?.filter(function(item) { 
    return item.type !== 'scroll' && item.itemId !== 'memory_crystal'; 
  }) || [];
  var filteredSellItems = filterItems(sellableItems, sellFilter, 'type');

  // Count items for filter badges
  var getTypeCounts = function(items, typeKey) {
    var counts = { material: 0, consumable: 0, equipment: 0 };
    items.forEach(function(item) {
      var type = item[typeKey] || item.type;
      if (type === 'material') counts.material++;
      else if (type === 'consumable') counts.consumable++;
      else if (type === 'equipment') counts.equipment++;
    });
    return counts;
  };

  var shopCounts = getTypeCounts(shopItems, 'type');
  var tradingCounts = getTypeCounts(tradingListings.filter(function(l) { return l.sellerId !== character.userId; }), 'itemType');
  var sellCounts = getTypeCounts(sellableItems, 'type');

  // Filter buttons component
  var FilterButtons = function(filterProps) {
    var currentFilter = filterProps.filter;
    var setFilter = filterProps.setFilter;
    var counts = filterProps.counts;
    var total = filterProps.total;
    
    return (
      <div className="flex gap-1 mb-3 flex-wrap">
        <button onClick={function() { setFilter('all'); }}
          className={'px-3 py-1 rounded text-xs ' + (currentFilter === 'all' ? 'bg-amber-600 text-white' : 'bg-void-700 text-gray-400')}>
          All ({total})
        </button>
        <button onClick={function() { setFilter('material'); }}
          className={'px-3 py-1 rounded text-xs ' + (currentFilter === 'material' ? 'bg-amber-600 text-white' : 'bg-void-700 text-gray-400')}>
          🪨 ({counts.material})
        </button>
        <button onClick={function() { setFilter('consumable'); }}
          className={'px-3 py-1 rounded text-xs ' + (currentFilter === 'consumable' ? 'bg-amber-600 text-white' : 'bg-void-700 text-gray-400')}>
          🧪 ({counts.consumable})
        </button>
        <button onClick={function() { setFilter('equipment'); }}
          className={'px-3 py-1 rounded text-xs ' + (currentFilter === 'equipment' ? 'bg-amber-600 text-white' : 'bg-void-700 text-gray-400')}>
          ⚔️ ({counts.equipment})
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h2 className="font-display text-2xl text-amber-400 mb-1">🍺 TAVERN</h2>
        <p className="text-gray-500 text-sm">Buy, sell, and trade with other hunters</p>
        <p className="text-yellow-400 mt-2">💰 {character.gold} Gold</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 justify-center mb-4">
        <button onClick={function() { setActiveTab('shop'); }}
          className={'px-4 py-2 rounded-lg text-sm ' + (activeTab === 'shop' ? 'bg-amber-600 text-white' : 'bg-void-800 text-gray-400')}>
          🏪 Shop
        </button>
        <button onClick={function() { setActiveTab('trading'); }}
          className={'px-4 py-2 rounded-lg text-sm ' + (activeTab === 'trading' ? 'bg-amber-600 text-white' : 'bg-void-800 text-gray-400')}>
          🤝 Trading
        </button>
        <button onClick={function() { setActiveTab('sell'); }}
          className={'px-4 py-2 rounded-lg text-sm ' + (activeTab === 'sell' ? 'bg-amber-600 text-white' : 'bg-void-800 text-gray-400')}>
          💰 Sell
        </button>
      </div>

      {/* SHOP TAB */}
      {activeTab === 'shop' && (
        <div className="bg-void-800/50 rounded-xl p-4 neon-border">
          <h3 className="font-display text-lg text-amber-400 mb-3">🏪 Tavern Shop</h3>
          
          {/* Filters */}
          <FilterButtons 
            filter={shopFilter} 
            setFilter={setShopFilter} 
            counts={shopCounts} 
            total={shopItems.length} 
          />
          
          <div className="space-y-2 max-h-80 overflow-auto">
            {filteredShopItems.map(function(item) {
              return (
                <div key={item.itemId} className="flex items-center justify-between bg-void-900/50 p-3 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{getItemIcon(item)}</span>
                    <div>
                      <span className="text-white">{item.name}</span>
                      <span className="text-xs text-gray-500 ml-2">{item.type}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-yellow-400">{item.price}g</span>
                    <button onClick={function() { setBuyModal(item); setQuantity(1); }}
                      className="px-3 py-1 bg-green-600 hover:bg-green-500 rounded text-sm">Buy</button>
                  </div>
                </div>
              );
            })}
            {filteredShopItems.length === 0 && <p className="text-gray-500 text-center py-4">No items match filter</p>}
          </div>
        </div>
      )}

      {/* TRADING TAB */}
      {activeTab === 'trading' && (
        <div className="space-y-4">
          {/* My Listings */}
          {myListings.length > 0 && (
            <div className="bg-void-800/50 rounded-xl p-4 neon-border">
              <h3 className="font-display text-lg text-purple-400 mb-3">📋 My Listings</h3>
              <div className="space-y-2">
                {myListings.map(function(listing) {
                  return (
                    <div key={listing._id} className="flex items-center justify-between bg-void-900/50 p-3 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{getItemIcon(listing)}</span>
                        <div>
                          <span className="text-white">{listing.itemName}</span>
                          <span className="text-gray-400 text-sm ml-2">x{listing.quantity}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-yellow-400">{listing.totalPrice}g</span>
                        <button onClick={function() { handleCancelListing(listing._id); }}
                          className="px-3 py-1 bg-red-600 hover:bg-red-500 rounded text-sm">Cancel</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* All Listings */}
          <div className="bg-void-800/50 rounded-xl p-4 neon-border">
            <h3 className="font-display text-lg text-amber-400 mb-3">🤝 Trading Stall</h3>
            
            {/* Filters */}
            <FilterButtons 
              filter={tradingFilter} 
              setFilter={setTradingFilter} 
              counts={tradingCounts} 
              total={tradingListings.filter(function(l) { return l.sellerId !== character.userId; }).length} 
            />
            
            <div className="space-y-2 max-h-60 overflow-auto">
              {filteredTradingListings.map(function(listing) {
                return (
                  <div key={listing._id} className="flex items-center justify-between bg-void-900/50 p-3 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{getItemIcon(listing)}</span>
                      <div>
                        <span className={getRarityColor(listing.itemRarity)}>{listing.itemName}</span>
                        <span className="text-gray-400 text-sm ml-2">x{listing.quantity}</span>
                        <div className="text-xs text-gray-500">by {listing.characterName}</div>
                        {listing.itemStats && Object.keys(listing.itemStats).length > 0 && (
                          <div className="text-xs text-green-400">
                            {Object.keys(listing.itemStats).map(function(k) { return k.toUpperCase() + '+' + listing.itemStats[k]; }).join(' ')}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-yellow-400">{listing.totalPrice}g</div>
                        <div className="text-xs text-gray-500">{listing.pricePerUnit}g each</div>
                      </div>
                      <button onClick={function() { handleBuyFromPlayer(listing); }} disabled={isLoading || character.gold < listing.totalPrice}
                        className="px-3 py-1 bg-green-600 hover:bg-green-500 rounded text-sm disabled:opacity-50">Buy</button>
                    </div>
                  </div>
                );
              })}
              {filteredTradingListings.length === 0 && 
                <p className="text-gray-500 text-center py-4">No items match filter</p>}
            </div>
          </div>
        </div>
      )}

      {/* SELL TAB */}
      {activeTab === 'sell' && (
        <div className="bg-void-800/50 rounded-xl p-4 neon-border">
          <h3 className="font-display text-lg text-amber-400 mb-3">💰 Sell or List Items</h3>
          
          {/* Filters */}
          <FilterButtons 
            filter={sellFilter} 
            setFilter={setSellFilter} 
            counts={sellCounts} 
            total={sellableItems.length} 
          />
          
          <div className="space-y-2 max-h-80 overflow-auto">
            {filteredSellItems.map(function(item, idx) {
              return (
                <div key={idx} className="flex items-center justify-between bg-void-900/50 p-3 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{getItemIcon(item)}</span>
                    <div>
                      <span className={getRarityColor(item.rarity)}>{item.name}</span>
                      <span className="text-gray-400 text-sm ml-2">x{item.quantity}</span>
                      <span className="text-xs text-gray-500 ml-2">{item.type}</span>
                      {item.stats && Object.keys(item.stats).length > 0 && (
                        <div className="text-xs text-green-400">
                          {Object.keys(item.stats).map(function(k) { return k.toUpperCase() + '+' + item.stats[k]; }).join(' ')}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={function() { setSellModal(item); setQuantity(1); }}
                      className="px-3 py-1 bg-yellow-600 hover:bg-yellow-500 rounded text-sm">Sell</button>
                    <button onClick={function() { setListModal({ itemId: item.itemId, name: item.name, icon: item.icon, maxQty: item.quantity, quantity: 1, price: 10 }); }}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-sm">List</button>
                  </div>
                </div>
              );
            })}
            {filteredSellItems.length === 0 && 
              <p className="text-gray-500 text-center py-4">No items match filter</p>}
          </div>
        </div>
      )}

      {/* BUY MODAL */}
      {buyModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-void-800 rounded-xl p-6 w-full max-w-sm neon-border">
            <h3 className="font-display text-lg text-amber-400 mb-4">Buy {buyModal.name}</h3>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{getItemIcon(buyModal)}</span>
              <div>
                <p className="text-white">{buyModal.name}</p>
                <p className="text-yellow-400">{buyModal.price}g each</p>
              </div>
            </div>
            <div className="mb-4">
              <label className="text-gray-400 text-sm">Quantity:</label>
              <input type="number" value={quantity} onChange={function(e) { setQuantity(Math.max(1, parseInt(e.target.value) || 1)); }}
                className="input-field mt-1" min={1} />
              <p className="text-yellow-400 mt-2">Total: {buyModal.price * quantity}g</p>
            </div>
            <div className="flex gap-3">
              <button onClick={function() { setBuyModal(null); }} className="flex-1 btn-secondary">Cancel</button>
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
              <span className="text-3xl">{getItemIcon(sellModal)}</span>
              <div>
                <p className="text-white">{sellModal.name}</p>
                <p className="text-gray-400">Have: {sellModal.quantity}</p>
              </div>
            </div>
            <div className="mb-4">
              <label className="text-gray-400 text-sm">Quantity to sell:</label>
              <input type="number" value={quantity} onChange={function(e) { setQuantity(Math.min(sellModal.quantity, Math.max(1, parseInt(e.target.value) || 1))); }}
                className="input-field mt-1" min={1} max={sellModal.quantity} />
              <p className="text-green-400 mt-2">You'll receive gold based on item value</p>
            </div>
            <div className="flex gap-3">
              <button onClick={function() { setSellModal(null); }} className="flex-1 btn-secondary">Cancel</button>
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
                <p className="text-gray-400">Have: {listModal.maxQty}</p>
              </div>
            </div>
            <div className="space-y-3 mb-4">
              <div>
                <label className="text-gray-400 text-sm">Quantity to list:</label>
                <input type="number" value={listModal.quantity} 
                  onChange={function(e) { setListModal(Object.assign({}, listModal, { quantity: Math.min(listModal.maxQty, Math.max(1, parseInt(e.target.value) || 1)) })); }}
                  className="input-field mt-1" min={1} max={listModal.maxQty} />
              </div>
              <div>
                <label className="text-gray-400 text-sm">Price per item (gold):</label>
                <input type="number" value={listModal.price}
                  onChange={function(e) { setListModal(Object.assign({}, listModal, { price: Math.max(1, parseInt(e.target.value) || 1) })); }}
                  className="input-field mt-1" min={1} />
              </div>
              <p className="text-yellow-400">Total: {listModal.quantity * listModal.price}g</p>
            </div>
            <div className="flex gap-3">
              <button onClick={function() { setListModal(null); }} className="flex-1 btn-secondary">Cancel</button>
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
