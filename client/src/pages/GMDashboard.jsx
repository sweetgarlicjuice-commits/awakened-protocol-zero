import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI, gmAPI, tavernAPI } from '../services/api';

const GMDashboard = () => {
  const { user, logout, isAdmin } = useAuth();
  const [players, setPlayers] = useState([]);
  const [hiddenClasses, setHiddenClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('players');
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [playerDetails, setPlayerDetails] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [createForm, setCreateForm] = useState({ username: '', password: '', role: 'player' });
  const [addItemForm, setAddItemForm] = useState({ itemId: '', name: '', type: 'material', rarity: 'common', quantity: 1 });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [shopItems, setShopItems] = useState([]);
  const [itemSearch, setItemSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [newShopPrice, setNewShopPrice] = useState(10);
  const navigate = useNavigate();

  useEffect(() => { fetchPlayers(); fetchHiddenClasses(); fetchShop(); }, []);

  const fetchPlayers = async () => {
    try {
      const { data } = await authAPI.getPlayers();
      setPlayers(data.players);
    } catch (err) { console.error(err); }
    setIsLoading(false);
  };

  const fetchHiddenClasses = async () => {
    try {
      const { data } = await gmAPI.getHiddenClasses();
      setHiddenClasses(data.classes);
    } catch (err) { console.error(err); }
  };

  const fetchShop = async () => {
    try {
      const { data } = await tavernAPI.getGMShop();
      setShopItems(data.shop.items);
    } catch (err) { console.error(err); }
  };

  const handleItemSearch = async (query) => {
    setItemSearch(query);
    if (query.length < 1) {
      setSearchResults([]);
      return;
    }
    try {
      const { data } = await tavernAPI.searchItems(query);
      setSearchResults(data.items.slice(0, 10));
    } catch (err) { console.error(err); }
  };

  const handleAddToShop = async () => {
    if (!selectedItem) return;
    try {
      await tavernAPI.addToShop(selectedItem.id, newShopPrice, -1);
      showMessage('success', 'Added ' + selectedItem.name + ' to shop');
      setSelectedItem(null);
      setItemSearch('');
      setSearchResults([]);
      fetchShop();
    } catch (err) { showMessage('error', err.response?.data?.error || 'Failed'); }
  };

  const handleUpdateShopPrice = async (itemId, newPrice) => {
    try {
      await tavernAPI.updateShopItem(itemId, { price: newPrice });
      showMessage('success', 'Price updated');
      fetchShop();
    } catch (err) { showMessage('error', 'Failed'); }
  };

  const handleRemoveFromShop = async (itemId) => {
    if (!confirm('Remove from shop?')) return;
    try {
      await tavernAPI.removeFromShop(itemId);
      showMessage('success', 'Removed from shop');
      fetchShop();
    } catch (err) { showMessage('error', 'Failed'); }
  };

  const fetchPlayerDetails = async (userId) => {
    try {
      const { data } = await gmAPI.getPlayer(userId);
      setPlayerDetails(data);
      setSelectedPlayer(userId);
    } catch (err) { showMessage('error', 'Failed to load player'); }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    try {
      await authAPI.createAccount(createForm.username, createForm.password, createForm.role);
      showMessage('success', 'Account created!');
      setCreateForm({ username: '', password: '', role: 'player' });
      setShowCreateModal(false);
      fetchPlayers();
    } catch (err) { showMessage('error', err.response?.data?.error || 'Failed'); }
  };

  const handleRefreshEnergy = async () => {
    try {
      await gmAPI.refreshEnergy(selectedPlayer);
      showMessage('success', 'Energy refreshed!');
      fetchPlayerDetails(selectedPlayer);
    } catch (err) { showMessage('error', 'Failed'); }
  };

  const handleHealPlayer = async () => {
    try {
      await gmAPI.healPlayer(selectedPlayer);
      showMessage('success', 'Player healed!');
      fetchPlayerDetails(selectedPlayer);
    } catch (err) { showMessage('error', 'Failed'); }
  };

  const handleAddGold = async (amount) => {
    try {
      await gmAPI.addGold(selectedPlayer, amount);
      showMessage('success', 'Gold updated!');
      fetchPlayerDetails(selectedPlayer);
    } catch (err) { showMessage('error', 'Failed'); }
  };

  const handleResetStats = async () => {
    if (!confirm('Reset all stats?')) return;
    try {
      await gmAPI.resetStats(selectedPlayer);
      showMessage('success', 'Stats reset!');
      fetchPlayerDetails(selectedPlayer);
    } catch (err) { showMessage('error', 'Failed'); }
  };

  const handleResetProgress = async () => {
    if (!confirm('Reset tower progress?')) return;
    try {
      await gmAPI.resetProgress(selectedPlayer);
      showMessage('success', 'Progress reset!');
      fetchPlayerDetails(selectedPlayer);
    } catch (err) { showMessage('error', 'Failed'); }
  };

  const handleRemoveHiddenClass = async () => {
    if (!confirm('Remove hidden class?')) return;
    try {
      await gmAPI.removeHiddenClass(selectedPlayer);
      showMessage('success', 'Class removed!');
      fetchPlayerDetails(selectedPlayer);
      fetchHiddenClasses();
    } catch (err) { showMessage('error', err.response?.data?.error || 'Failed'); }
  };

  const handleSetLevel = async () => {
    const level = prompt('Set level (1-50):', playerDetails?.character?.level || 1);
    if (!level) return;
    try {
      await gmAPI.setLevel(selectedPlayer, parseInt(level));
      showMessage('success', 'Level set!');
      fetchPlayerDetails(selectedPlayer);
    } catch (err) { showMessage('error', err.response?.data?.error || 'Failed'); }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      await gmAPI.addItem(selectedPlayer, addItemForm);
      showMessage('success', 'Item added!');
      setShowAddItemModal(false);
      setAddItemForm({ itemId: '', name: '', type: 'material', rarity: 'common', quantity: 1 });
      fetchPlayerDetails(selectedPlayer);
    } catch (err) { showMessage('error', err.response?.data?.error || 'Failed'); }
  };

  const handleRemoveItem = async (index) => {
    if (!confirm('Remove this item?')) return;
    try {
      await gmAPI.removeItem(selectedPlayer, index);
      showMessage('success', 'Item removed');
      fetchPlayerDetails(selectedPlayer);
    } catch (err) { showMessage('error', 'Failed'); }
  };

  const handleClearInventory = async () => {
    if (!confirm('Clear ALL items?')) return;
    try {
      await gmAPI.clearInventory(selectedPlayer);
      showMessage('success', 'Inventory cleared');
      fetchPlayerDetails(selectedPlayer);
    } catch (err) { showMessage('error', 'Failed'); }
  };

  const handleDeletePlayer = async () => {
    const player = players.find(p => p._id === selectedPlayer);
    if (!confirm('DELETE player ' + player?.username + '?')) return;
    try {
      await gmAPI.deletePlayer(selectedPlayer);
      showMessage('success', 'Player deleted');
      setSelectedPlayer(null);
      setPlayerDetails(null);
      fetchPlayers();
      fetchHiddenClasses();
    } catch (err) { showMessage('error', err.response?.data?.error || 'Failed'); }
  };

  const handleToggleAccount = async (userId) => {
    try {
      await authAPI.toggleAccount(userId);
      fetchPlayers();
    } catch (err) { showMessage('error', 'Failed'); }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-void-800 border-b border-purple-500/20 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-xl text-purple-400">APZ</h1>
            <span className="text-amber-400 text-sm font-semibold">{isAdmin ? '👑 ADMIN' : '🔧 GM'}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-400 text-sm">{user?.username}</span>
            <button onClick={() => { logout(); navigate('/login'); }} className="text-gray-400 hover:text-red-400 text-sm">Logout</button>
          </div>
        </div>
      </header>

      {message.text && (
        <div className={'mx-4 mt-4 p-3 rounded-lg text-center ' + (message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400')}>
          {message.text}
        </div>
      )}

      <div className="flex-1 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-void-800/50 rounded-xl p-4 neon-border">
              <div className="text-3xl font-bold text-purple-400">{players.length}</div>
              <div className="text-sm text-gray-500">Players</div>
            </div>
            <div className="bg-void-800/50 rounded-xl p-4 neon-border">
              <div className="text-3xl font-bold text-green-400">{players.filter(p => p.isActive).length}</div>
              <div className="text-sm text-gray-500">Active</div>
            </div>
            <div className="bg-void-800/50 rounded-xl p-4 neon-border">
              <div className="text-3xl font-bold text-blue-400">{hiddenClasses.filter(c => c.ownerId).length}/4</div>
              <div className="text-sm text-gray-500">Classes Claimed</div>
            </div>
            <div className="bg-void-800/50 rounded-xl p-4 neon-border">
              <div className="text-3xl font-bold text-amber-400">{hiddenClasses.filter(c => !c.ownerId).length}</div>
              <div className="text-sm text-gray-500">Available</div>
            </div>
          </div>

          <div className="flex gap-2 mb-6">
            <button onClick={() => setActiveTab('players')} className={'px-4 py-2 rounded-lg ' + (activeTab === 'players' ? 'bg-purple-600 text-white' : 'bg-void-800 text-gray-400')}>
              👥 Players
            </button>
            <button onClick={() => setActiveTab('classes')} className={'px-4 py-2 rounded-lg ' + (activeTab === 'classes' ? 'bg-purple-600 text-white' : 'bg-void-800 text-gray-400')}>
              📜 Hidden Classes
            </button>
            <button onClick={() => setActiveTab('tavern')} className={'px-4 py-2 rounded-lg ' + (activeTab === 'tavern' ? 'bg-purple-600 text-white' : 'bg-void-800 text-gray-400')}>
              🍺 Tavern Shop
            </button>
            <button onClick={() => setShowCreateModal(true)} className="px-4 py-2 rounded-lg bg-green-600 text-white">➕ Create Account</button>
          </div>

          {activeTab === 'players' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 bg-void-800/50 rounded-xl p-4 neon-border max-h-96 overflow-auto">
                <h3 className="font-display text-lg text-purple-400 mb-4">Player List</h3>
                {players.map(player => (
                  <div key={player._id} onClick={() => fetchPlayerDetails(player._id)}
                    className={'p-3 rounded-lg mb-2 cursor-pointer transition-colors ' + (selectedPlayer === player._id ? 'bg-purple-600/30 border border-purple-500' : 'bg-void-700/50 hover:bg-void-700')}>
                    <div className="flex justify-between items-center">
                      <span className="text-white">{player.username}</span>
                      <span className={'text-xs px-2 py-1 rounded ' + (player.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400')}>
                        {player.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </div>
                    {player.character && (
                      <div className="text-xs text-gray-400 mt-1">
                        {player.character.name} • Lv.{player.character.level} • {player.character.baseClass}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="lg:col-span-2 bg-void-800/50 rounded-xl p-6 neon-border">
                {playerDetails ? (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-display text-xl text-purple-400">{playerDetails.user?.username}</h3>
                      <button onClick={() => handleToggleAccount(selectedPlayer)}
                        className={'text-sm px-3 py-1 rounded ' + (playerDetails.user?.isActive ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400')}>
                        {playerDetails.user?.isActive ? 'Disable' : 'Enable'}
                      </button>
                    </div>

                    {playerDetails.character ? (
                      <div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                          <div className="bg-void-900/50 p-3 rounded-lg">
                            <div className="text-gray-400 text-xs">Name</div>
                            <div className="text-white">{playerDetails.character.name}</div>
                          </div>
                          <div className="bg-void-900/50 p-3 rounded-lg">
                            <div className="text-gray-400 text-xs">Level</div>
                            <div className="text-amber-400">{playerDetails.character.level}</div>
                          </div>
                          <div className="bg-void-900/50 p-3 rounded-lg">
                            <div className="text-gray-400 text-xs">Class</div>
                            <div className="text-white capitalize">{playerDetails.character.baseClass}</div>
                          </div>
                          <div className="bg-void-900/50 p-3 rounded-lg">
                            <div className="text-gray-400 text-xs">Hidden Class</div>
                            <div className={playerDetails.character.hiddenClass !== 'none' ? 'text-purple-400' : 'text-gray-600'}>
                              {playerDetails.character.hiddenClass !== 'none' ? playerDetails.character.hiddenClass : 'None'}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-6">
                          <div className="bg-void-900/50 p-2 rounded text-center">
                            <div className="text-xs text-gray-400">HP</div>
                            <div className="text-green-400">{playerDetails.character.stats.hp}/{playerDetails.character.stats.maxHp}</div>
                          </div>
                          <div className="bg-void-900/50 p-2 rounded text-center">
                            <div className="text-xs text-gray-400">MP</div>
                            <div className="text-blue-400">{playerDetails.character.stats.mp}/{playerDetails.character.stats.maxMp}</div>
                          </div>
                          <div className="bg-void-900/50 p-2 rounded text-center">
                            <div className="text-xs text-gray-400">Energy</div>
                            <div className="text-amber-400">{playerDetails.character.energy}/100</div>
                          </div>
                          <div className="bg-void-900/50 p-2 rounded text-center">
                            <div className="text-xs text-gray-400">Gold</div>
                            <div className="text-yellow-400">{playerDetails.character.gold}</div>
                          </div>
                          <div className="bg-void-900/50 p-2 rounded text-center">
                            <div className="text-xs text-gray-400">Tower</div>
                            <div className="text-white">{playerDetails.character.currentTower}</div>
                          </div>
                          <div className="bg-void-900/50 p-2 rounded text-center">
                            <div className="text-xs text-gray-400">Floor</div>
                            <div className="text-white">{playerDetails.character.currentFloor}</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
                          <button onClick={handleRefreshEnergy} className="btn-secondary text-sm py-2">⚡ Energy</button>
                          <button onClick={handleHealPlayer} className="btn-secondary text-sm py-2">❤️ Heal</button>
                          <button onClick={() => handleAddGold(1000)} className="btn-secondary text-sm py-2">💰 +1000g</button>
                          <button onClick={handleSetLevel} className="btn-secondary text-sm py-2">📈 Level</button>
                          <button onClick={handleResetStats} className="btn-secondary text-sm py-2">🔄 Stats</button>
                          <button onClick={handleResetProgress} className="btn-secondary text-sm py-2">🗼 Tower</button>
                          {playerDetails.character.hiddenClass !== 'none' && (
                            <button onClick={handleRemoveHiddenClass} className="btn-secondary text-sm py-2">📜 Class</button>
                          )}
                          <button onClick={handleDeletePlayer} className="btn-danger text-sm py-2">🗑️ Delete</button>
                        </div>

                        <div className="bg-void-900/50 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="text-gray-400">Inventory ({playerDetails.character.inventory?.length || 0}/{playerDetails.character.inventorySize})</h4>
                            <div className="flex gap-2">
                              <button onClick={() => setShowAddItemModal(true)} className="text-xs bg-green-600 px-2 py-1 rounded">+ Add</button>
                              <button onClick={handleClearInventory} className="text-xs bg-red-600 px-2 py-1 rounded">Clear</button>
                            </div>
                          </div>
                          <div className="grid grid-cols-4 md:grid-cols-6 gap-2 max-h-40 overflow-auto">
                            {playerDetails.character.inventory?.map((item, i) => (
                              <div key={i} onClick={() => handleRemoveItem(i)} title={item.name + ' x' + item.quantity}
                                className="bg-void-800 p-2 rounded text-center cursor-pointer hover:bg-red-900/30">
                                <div className="text-lg">{item.icon || '📦'}</div>
                                <div className="text-xs text-gray-400 truncate">{item.name}</div>
                                <div className="text-xs text-gray-500">x{item.quantity}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-400 text-center py-8">No character yet</p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-8">Select a player</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'classes' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {hiddenClasses.map(cls => (
                <div key={cls.classId} className={'bg-void-800/50 rounded-xl p-6 border-2 ' + (cls.ownerId ? 'border-purple-500/50' : 'border-green-500/50')}>
                  <div className="text-4xl text-center mb-4">
                    {cls.classId === 'flameblade' ? '🔥' : cls.classId === 'shadowDancer' ? '🌑' : cls.classId === 'stormRanger' ? '⚡' : '❄️'}
                  </div>
                  <h3 className="font-display text-xl text-white text-center mb-2 capitalize">{cls.classId}</h3>
                  <p className="text-gray-400 text-sm text-center mb-4">
                    Requires: {cls.classId === 'flameblade' ? 'Swordsman' : cls.classId === 'shadowDancer' ? 'Thief' : cls.classId === 'stormRanger' ? 'Archer' : 'Mage'}
                  </p>
                  <div className={'text-center py-2 rounded ' + (cls.ownerId ? 'bg-purple-500/20 text-purple-400' : 'bg-green-500/20 text-green-400')}>
                    {cls.ownerId ? 'Owned by: ' + cls.ownerName : 'Available'}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'tavern' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Add Item to Shop */}
              <div className="bg-void-800/50 rounded-xl p-6 neon-border">
                <h3 className="font-display text-lg text-amber-400 mb-4">➕ Add Item to Shop</h3>
                <div className="space-y-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search items..."
                      value={itemSearch}
                      onChange={(e) => handleItemSearch(e.target.value)}
                      className="input-field"
                    />
                    {searchResults.length > 0 && (
                      <div className="absolute top-full left-0 right-0 bg-void-800 border border-purple-500/30 rounded-lg mt-1 max-h-60 overflow-auto z-10">
                        {searchResults.map(item => (
                          <div
                            key={item.id}
                            onClick={() => { setSelectedItem(item); setItemSearch(item.name); setSearchResults([]); }}
                            className="p-3 hover:bg-void-700 cursor-pointer flex items-center gap-2"
                          >
                            <span>{item.icon}</span>
                            <span className="text-white">{item.name}</span>
                            <span className="text-gray-500 text-xs">({item.type})</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {selectedItem && (
                    <div className="bg-void-900/50 p-4 rounded-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">{selectedItem.icon}</span>
                        <div>
                          <p className="text-white">{selectedItem.name}</p>
                          <p className="text-gray-500 text-xs">{selectedItem.type} • {selectedItem.rarity}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="text-gray-400 text-sm">Price:</label>
                        <input
                          type="number"
                          value={newShopPrice}
                          onChange={(e) => setNewShopPrice(parseInt(e.target.value) || 1)}
                          className="input-field w-24"
                          min={1}
                        />
                        <span className="text-yellow-400">gold</span>
                      </div>
                    </div>
                  )}
                  <button
                    onClick={handleAddToShop}
                    disabled={!selectedItem}
                    className="w-full btn-primary disabled:opacity-50"
                  >
                    Add to Shop
                  </button>
                </div>
              </div>

              {/* Current Shop Items */}
              <div className="bg-void-800/50 rounded-xl p-6 neon-border">
                <h3 className="font-display text-lg text-amber-400 mb-4">🏪 Current Shop Items</h3>
                <div className="space-y-2 max-h-96 overflow-auto">
                  {shopItems.map(item => (
                    <div key={item.itemId} className="flex items-center justify-between bg-void-900/50 p-3 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{item.icon}</span>
                        <span className="text-white">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          defaultValue={item.price}
                          onBlur={(e) => {
                            const newPrice = parseInt(e.target.value) || 1;
                            if (newPrice !== item.price) {
                              handleUpdateShopPrice(item.itemId, newPrice);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.target.blur();
                            }
                          }}
                          className="w-20 bg-void-800 border border-gray-600 rounded px-2 py-1 text-yellow-400 text-sm"
                          min={1}
                        />
                        <span className="text-gray-400 text-sm">g</span>
                        <button
                          onClick={() => handleRemoveFromShop(item.itemId)}
                          className="px-2 py-1 bg-red-600 hover:bg-red-500 rounded text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                  {shopItems.length === 0 && (
                    <p className="text-gray-500 text-center py-4">Shop is empty</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-void-800 rounded-xl p-6 w-full max-w-md neon-border">
            <h2 className="font-display text-xl text-purple-400 mb-6">Create Account</h2>
            <form onSubmit={handleCreateAccount} className="space-y-4">
              <input type="text" placeholder="Username" value={createForm.username} onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                className="input-field" required minLength={3} />
              <input type="password" placeholder="Password" value={createForm.password} onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                className="input-field" required minLength={6} />
              {isAdmin && (
                <select value={createForm.role} onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })} className="input-field">
                  <option value="player">Player</option>
                  <option value="gm">Game Master</option>
                </select>
              )}
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 btn-secondary">Cancel</button>
                <button type="submit" className="flex-1 btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddItemModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-void-800 rounded-xl p-6 w-full max-w-md neon-border">
            <h2 className="font-display text-xl text-purple-400 mb-6">Add Item to Player</h2>
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search items..."
                  value={addItemForm.name}
                  onChange={async (e) => {
                    setAddItemForm({ ...addItemForm, name: e.target.value });
                    if (e.target.value.length >= 1) {
                      const { data } = await tavernAPI.searchItems(e.target.value);
                      setSearchResults(data.items.slice(0, 8));
                    } else {
                      setSearchResults([]);
                    }
                  }}
                  className="input-field"
                />
                {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-void-900 border border-purple-500/30 rounded-lg mt-1 max-h-48 overflow-auto z-10">
                    {searchResults.map(item => (
                      <div
                        key={item.id}
                        onClick={() => {
                          setAddItemForm({
                            itemId: item.id,
                            name: item.name,
                            type: item.type,
                            rarity: item.rarity,
                            quantity: 1
                          });
                          setSearchResults([]);
                        }}
                        className="p-2 hover:bg-void-700 cursor-pointer flex items-center gap-2"
                      >
                        <span>{item.icon}</span>
                        <span className="text-white text-sm">{item.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {addItemForm.itemId && (
                <div className="bg-void-900/50 p-3 rounded-lg">
                  <p className="text-gray-400 text-sm">Selected: <span className="text-white">{addItemForm.name}</span></p>
                </div>
              )}
              <input
                type="number"
                placeholder="Quantity"
                value={addItemForm.quantity}
                onChange={(e) => setAddItemForm({ ...addItemForm, quantity: parseInt(e.target.value) || 1 })}
                className="input-field"
                min={1}
              />
              <div className="flex gap-3">
                <button type="button" onClick={() => { setShowAddItemModal(false); setSearchResults([]); }} className="flex-1 btn-secondary">Cancel</button>
                <button
                  type="button"
                  onClick={async () => {
                    if (!addItemForm.itemId) return;
                    await handleAddItem({ preventDefault: () => {} });
                  }}
                  disabled={!addItemForm.itemId}
                  className="flex-1 btn-primary disabled:opacity-50"
                >
                  Add Item
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GMDashboard;
