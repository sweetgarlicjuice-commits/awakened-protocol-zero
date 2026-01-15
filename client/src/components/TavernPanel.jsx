import React, { useState, useEffect } from 'react';
import { tavernAPI } from '../services/api';

const TavernPanel = ({ character, onCharacterUpdate, addLog }) => {
  const [activeTab, setActiveTab] = useState('shop');
  const [shopItems, setShopItems] = useState([]);
  const [tradingListings, setTradingListings] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [buyModal, setBuyModal] = useState(null);
  const [sellModal, setSellModal] = useState(null);
  const [listModal, setListModal] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [sellFilter, setSellFilter] = useState('all'); // Filter for sell tab

  useEffect(() => {
    if (activeTab === 'shop') fetchShop();
    else if (activeTab === 'trading') { fetchTrading(); fetchMyListings(); }
  }, [activeTab]);

  const fetchShop = async () => {
    try {
      const { data } = await tavernAPI.getShop();
      setShopItems(data.items);
    } catch (err) { console.error(err); }
  };

  const fetchTrading = async () => {
    try {
      const { data } = await tavernAPI.getTradingListings();
      setTradingListings(data.listings);
    } catch (err) { console.error(err); }
  };

  const fetchMyListings = async () => {
    try {
      const { data } = await tavernAPI.getMyListings();
      setMyListings(data.listings);
    } catch (err) { console.error(err); }
  };

  const handleBuyFromShop = async () => {
    if (!buyModal) return;
    setIsLoading(true);
    try {
      const { data } = await tavernAPI.buyFromShop(buyModal.itemId, quantity);
      addLog('success', data.message);
      onCharacterUpdate();
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
      const { data } = await tavernAPI.sellToShop(sellModal.itemId, quantity);
      addLog('success', data.message);
      onCharacterUpdate();
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
      const { data } = await tavernAPI.listItem(listModal.itemId, listModal.quantity, listModal.price);
      addLog('success', data.message);
      onCharacterUpdate();
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
      const { data } = await tavernAPI.buyFromPlayer(listing._id, listing.quantity);
      addLog('success', data.message);
      onCharacterUpdate();
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
      onCharacterUpdate();
      fetchMyListings();
    } catch (err) {
      addLog('error', err.response?.data?.error || 'Cancel failed');
    }
    setIsLoading(false);
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
          <div className="space-y-2 max-h-80 overflow-auto">
            {shopItems.map(item => (
              <div key={item.itemId} className="flex items-center justify-between bg-void-900/50 p-3 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-white">{item.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-yellow-400">{item.price}g</span>
                  <button onClick={() => { setBuyModal(item); setQuantity(1); }}
                    className="px-3 py-1 bg-green-600 hover:bg-green-500 rounded text-sm">Buy</button>
                </div>
              </div>
            ))}
            {shopItems.length === 0 && <p className="text-gray-500 text-center py-4">Shop is empty</p>}
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
                {myListings.map(listing => (
                  <div key={listing._id} className="flex items-center justify-between bg-void-900/50 p-3 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{listing.itemIcon}</span>
                      <div>
                        <span className="text-white">{listing.itemName}</span>
                        <span className="text-gray-400 text-sm ml-2">x{listing.quantity}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-yellow-400">{listing.totalPrice}g</span>
                      <button onClick={() => handleCancelListing(listing._id)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-500 rounded text-sm">Cancel</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Listings */}
          <div className="bg-void-800/50 rounded-xl p-4 neon-border">
            <h3 className="font-display text-lg text-amber-400 mb-3">🤝 Trading Stall</h3>
            <div className="space-y-2 max-h-60 overflow-auto">
              {tradingListings.filter(l => l.sellerId !== character.userId).map(listing => (
                <div key={listing._id} className="flex items-center justify-between bg-void-900/50 p-3 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{listing.itemIcon}</span>
                    <div>
                      <span className="text-white">{listing.itemName}</span>
                      <span className="text-gray-400 text-sm ml-2">x{listing.quantity}</span>
                      <div className="text-xs text-gray-500">by {listing.characterName}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-yellow-400">{listing.totalPrice}g</div>
                      <div className="text-xs text-gray-500">{listing.pricePerUnit}g each</div>
                    </div>
                    <button onClick={() => handleBuyFromPlayer(listing)} disabled={isLoading || character.gold < listing.totalPrice}
                      className="px-3 py-1 bg-green-600 hover:bg-green-500 rounded text-sm disabled:opacity-50">Buy</button>
                  </div>
                </div>
              ))}
              {tradingListings.filter(l => l.sellerId !== character.userId).length === 0 && 
                <p className="text-gray-500 text-center py-4">No items for sale</p>}
            </div>
          </div>
        </div>
      )}

      {/* SELL TAB */}
      {activeTab === 'sell' && (
        <div className="bg-void-800/50 rounded-xl p-4 neon-border">
          <h3 className="font-display text-lg text-amber-400 mb-4">💰 Sell or List Items</h3>
          
          {/* Filter buttons */}
          {(() => {
            const inventory = character.inventory?.filter(item => item.type !== 'scroll' && item.itemId !== 'memory_crystal') || [];
            const materialCount = inventory.filter(i => i.type === 'material').length;
            const consumableCount = inventory.filter(i => i.type === 'consumable').length;
            const equipmentCount = inventory.filter(i => i.type === 'equipment' || i.type === 'weapon' || i.type === 'armor').length;
            
            return (
              <div className="flex gap-2 mb-4 flex-wrap">
                <button onClick={() => setSellFilter('all')}
                  className={'px-3 py-1 rounded text-xs ' + (sellFilter === 'all' ? 'bg-purple-600 text-white' : 'bg-void-900 text-gray-400')}>
                  All ({inventory.length})
                </button>
                <button onClick={() => setSellFilter('material')}
                  className={'px-3 py-1 rounded text-xs ' + (sellFilter === 'material' ? 'bg-purple-600 text-white' : 'bg-void-900 text-gray-400')}>
                  📦 ({materialCount})
                </button>
                <button onClick={() => setSellFilter('consumable')}
                  className={'px-3 py-1 rounded text-xs ' + (sellFilter === 'consumable' ? 'bg-purple-600 text-white' : 'bg-void-900 text-gray-400')}>
                  🧪 ({consumableCount})
                </button>
                <button onClick={() => setSellFilter('equipment')}
                  className={'px-3 py-1 rounded text-xs ' + (sellFilter === 'equipment' ? 'bg-purple-600 text-white' : 'bg-void-900 text-gray-400')}>
                  ⚔️ ({equipmentCount})
                </button>
              </div>
            );
          })()}
          
          {/* Item list with sell prices */}
          <div className="space-y-2 max-h-80 overflow-auto">
            {character.inventory?.filter(item => {
              if (item.type === 'scroll' || item.itemId === 'memory_crystal') return false;
              if (sellFilter === 'all') return true;
              if (sellFilter === 'material') return item.type === 'material';
              if (sellFilter === 'consumable') return item.type === 'consumable';
              if (sellFilter === 'equipment') return item.type === 'equipment' || item.type === 'weapon' || item.type === 'armor';
              return true;
            }).map((item, idx) => {
              // Calculate sell price (items sell for ~40% of their value, minimum 2g)
              const sellPrice = item.sellPrice || Math.max(2, Math.floor((item.stats?.value || 5) * 0.4));
              
              return (
                <div key={idx} className="flex items-center justify-between bg-void-900/50 p-3 rounded-lg">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-xl">{item.icon || '📦'}</span>
                    <div className="flex-1">
                      <span className="text-white">{item.name}</span>
                      <span className="text-gray-400 text-sm ml-2">x{item.quantity}</span>
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
            {(!character.inventory || character.inventory.filter(i => i.type !== 'scroll' && i.itemId !== 'memory_crystal').length === 0) && 
              <p className="text-gray-500 text-center py-4">No items to sell</p>}
          </div>
        </div>
      )}

      {/* BUY MODAL */}
      {buyModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-void-800 rounded-xl p-6 w-full max-w-sm neon-border">
            <h3 className="font-display text-lg text-amber-400 mb-4">Buy {buyModal.name}</h3>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{buyModal.icon}</span>
              <div>
                <p className="text-white">{buyModal.name}</p>
                <p className="text-yellow-400">{buyModal.price}g each</p>
              </div>
            </div>
            <div className="mb-4">
              <label className="text-gray-400 text-sm">Quantity:</label>
              <input type="number" value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="input-field mt-1" min={1} />
              <p className="text-yellow-400 mt-2">Total: {buyModal.price * quantity}g</p>
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
              </div>
            </div>
            <div className="mb-4">
              <label className="text-gray-400 text-sm">Quantity to sell:</label>
              <input type="number" value={quantity} onChange={(e) => setQuantity(Math.min(sellModal.quantity, Math.max(1, parseInt(e.target.value) || 1)))}
                className="input-field mt-1" min={1} max={sellModal.quantity} />
              <p className="text-green-400 mt-2">You'll receive: ~{quantity * 5}g (varies by item)</p>
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
                <p className="text-gray-400">Have: {listModal.quantity}</p>
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
