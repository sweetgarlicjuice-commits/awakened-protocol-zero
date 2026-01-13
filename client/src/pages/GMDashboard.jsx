import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

const GMDashboard = () => {
  const { user, logout, isAdmin } = useAuth();
  const [players, setPlayers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('players');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ username: '', password: '', role: 'player' });
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      const { data } = await authAPI.getPlayers();
      setPlayers(data.players);
    } catch (err) {
      console.error('Failed to fetch players:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setCreateError('');
    setCreateSuccess('');

    try {
      await authAPI.createAccount(createForm.username, createForm.password, createForm.role);
      setCreateSuccess(`Account "${createForm.username}" created successfully!`);
      setCreateForm({ username: '', password: '', role: 'player' });
      fetchPlayers();
      setTimeout(() => {
        setShowCreateModal(false);
        setCreateSuccess('');
      }, 2000);
    } catch (err) {
      setCreateError(err.response?.data?.error || 'Failed to create account');
    }
  };

  const handleToggleAccount = async (userId, username) => {
    if (!confirm(`Are you sure you want to toggle account status for "${username}"?`)) return;
    
    try {
      await authAPI.toggleAccount(userId);
      fetchPlayers();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to toggle account');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-void-800 border-b border-purple-500/20 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-xl text-purple-400">APZ</h1>
            <div className="text-gray-500 text-sm">|</div>
            <span className="text-amber-400 text-sm font-semibold">
              {isAdmin ? '👑 ADMIN' : '🔧 GM'} DASHBOARD
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-400 text-sm">{user?.username}</span>
            <button onClick={handleLogout} className="text-gray-400 hover:text-red-400 transition-colors text-sm">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-void-800/50 rounded-xl p-4 neon-border">
              <div className="text-3xl font-bold text-purple-400">{players.length}</div>
              <div className="text-sm text-gray-500">Total Players</div>
            </div>
            <div className="bg-void-800/50 rounded-xl p-4 neon-border">
              <div className="text-3xl font-bold text-green-400">
                {players.filter(p => p.isActive).length}
              </div>
              <div className="text-sm text-gray-500">Active Accounts</div>
            </div>
            <div className="bg-void-800/50 rounded-xl p-4 neon-border">
              <div className="text-3xl font-bold text-blue-400">
                {players.filter(p => p.character).length}
              </div>
              <div className="text-sm text-gray-500">With Characters</div>
            </div>
            <div className="bg-void-800/50 rounded-xl p-4 neon-border">
              <div className="text-3xl font-bold text-amber-400">
                {players.filter(p => p.character?.hiddenClass !== 'none').length}
              </div>
              <div className="text-sm text-gray-500">Hidden Classes</div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('players')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'players'
                  ? 'bg-purple-600 text-white'
                  : 'bg-void-800 text-gray-400 hover:text-white'
              }`}
            >
              👥 Players
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 rounded-lg font-medium bg-green-600 text-white hover:bg-green-500 transition-colors"
            >
              ➕ Create Account
            </button>
          </div>

          {/* Players Table */}
          {activeTab === 'players' && (
            <div className="bg-void-800/50 rounded-xl neon-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-void-900/50">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Username</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Character</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Level</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Class</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Created</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/30">
                    {isLoading ? (
                      <tr>
                        <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                          Loading players...
                        </td>
                      </tr>
                    ) : players.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                          No players yet. Create the first account!
                        </td>
                      </tr>
                    ) : (
                      players.map((player) => (
                        <tr key={player._id} className="hover:bg-void-700/30 transition-colors">
                          <td className="px-4 py-3">
                            <span className="text-white font-medium">{player.username}</span>
                          </td>
                          <td className="px-4 py-3">
                            {player.character ? (
                              <span className="text-purple-400">{player.character.name}</span>
                            ) : (
                              <span className="text-gray-600">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {player.character ? (
                              <span className="text-amber-400">{player.character.level}</span>
                            ) : (
                              <span className="text-gray-600">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {player.character ? (
                              <div>
                                <span className="text-gray-300 capitalize">{player.character.baseClass}</span>
                                {player.character.hiddenClass !== 'none' && (
                                  <span className="text-purple-400 text-xs ml-2">
                                    → {player.character.hiddenClass}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-600">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                              player.isActive 
                                ? 'bg-green-500/20 text-green-400' 
                                : 'bg-red-500/20 text-red-400'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${player.isActive ? 'bg-green-400' : 'bg-red-400'}`}></span>
                              {player.isActive ? 'Active' : 'Disabled'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-500 text-sm">
                            {new Date(player.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => handleToggleAccount(player._id, player.username)}
                              className={`text-xs px-3 py-1 rounded ${
                                player.isActive
                                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                  : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                              } transition-colors`}
                            >
                              {player.isActive ? 'Disable' : 'Enable'}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Account Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-void-800 rounded-xl p-6 w-full max-w-md neon-border">
            <h2 className="font-display text-xl text-purple-400 mb-6">CREATE NEW ACCOUNT</h2>
            
            {createError && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4 text-red-400 text-sm">
                {createError}
              </div>
            )}
            
            {createSuccess && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 mb-4 text-green-400 text-sm">
                {createSuccess}
              </div>
            )}

            <form onSubmit={handleCreateAccount} className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Username</label>
                <input
                  type="text"
                  value={createForm.username}
                  onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                  className="input-field"
                  placeholder="Enter username"
                  required
                  minLength={3}
                  maxLength={20}
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Password</label>
                <input
                  type="password"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  className="input-field"
                  placeholder="Enter password"
                  required
                  minLength={6}
                />
              </div>

              {isAdmin && (
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Role</label>
                  <select
                    value={createForm.role}
                    onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                    className="input-field"
                  >
                    <option value="player">Player</option>
                    <option value="gm">Game Master</option>
                  </select>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setCreateError('');
                    setCreateSuccess('');
                    setCreateForm({ username: '', password: '', role: 'player' });
                  }}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GMDashboard;
