import React, { useState, useEffect } from 'react';
import { helpAPI } from '../services/api';

// ============================================
// HELP REQUEST PANEL - Co-op Boss Help System
// ============================================
// Phase 10: Co-op Boss Help UI
//
// Features:
// - View active help request status
// - See available requests from friends
// - Accept and help friends with boss fights
// - View help history and stats
// ============================================

const CLASS_ICONS = {
  swordsman: '⚔️',
  thief: '🗡️',
  archer: '🏹',
  mage: '🔮',
  // Hidden classes
  flameblade: '🔥', berserker: '💢', paladin: '✨', earthshaker: '🌍', frostguard: '❄️',
  shadowDancer: '🌑', venomancer: '🐍', assassin: '⚫', phantom: '👻', bloodreaper: '🩸',
  stormRanger: '⚡', pyroArcher: '🔥', frostSniper: '❄️', natureWarden: '🌿', voidHunter: '🌀',
  frostWeaver: '❄️', pyromancer: '🔥', stormcaller: '⚡', necromancer: '💀', arcanist: '✨'
};

const HelpRequestPanel = ({ character, onClose, refreshCharacter }) => {
  const [activeTab, setActiveTab] = useState('available'); // available, myRequest, history
  const [myRequest, setMyRequest] = useState(null);
  const [availableRequests, setAvailableRequests] = useState([]);
  const [myStats, setMyStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isHelping, setIsHelping] = useState(false);
  const [helpResult, setHelpResult] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setIsLoading(true);
    await Promise.all([
      fetchMyRequest(),
      fetchAvailable(),
      fetchHistory()
    ]);
    setIsLoading(false);
  };

  const fetchMyRequest = async () => {
    try {
      const { data } = await helpAPI.getActive();
      setMyRequest(data.hasActiveRequest ? data.request : null);
    } catch (err) {
      console.error('Failed to fetch active request:', err);
    }
  };

  const fetchAvailable = async () => {
    try {
      const { data } = await helpAPI.getAvailable();
      setAvailableRequests(data.requests || []);
      setMyStats(data.myStats);
    } catch (err) {
      console.error('Failed to fetch available requests:', err);
    }
  };

  const fetchHistory = async () => {
    try {
      const { data } = await helpAPI.getHistory();
      setHistory(data.history || []);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const handleCancelRequest = async () => {
    if (!myRequest) return;
    if (!confirm('Cancel your help request?')) return;
    
    try {
      await helpAPI.cancel(myRequest.id);
      showMessage('success', 'Help request cancelled');
      setMyRequest(null);
      fetchAll();
    } catch (err) {
      showMessage('error', err.response?.data?.error || 'Failed to cancel');
    }
  };

  const handleAcceptHelp = async (requestId) => {
    if (isHelping) return;
    
    // Check if can help
    if (myStats && myStats.helpsToday >= myStats.dailyLimit) {
      showMessage('error', `Daily help limit reached (${myStats.dailyLimit}/day)`);
      return;
    }
    
    if (myStats && myStats.helperPoints < 1) {
      showMessage('error', 'Not enough Helper Points!');
      return;
    }
    
    setIsHelping(true);
    setHelpResult(null);
    
    try {
      const { data } = await helpAPI.accept(requestId);
      
      setHelpResult({
        victory: data.victory,
        message: data.message,
        combat: data.combat,
        rewards: data.rewards
      });
      
      showMessage('success', data.message);
      
      // Refresh data
      fetchAll();
      if (refreshCharacter) refreshCharacter();
      
    } catch (err) {
      showMessage('error', err.response?.data?.error || 'Failed to help');
    }
    
    setIsHelping(false);
  };

  const formatTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const now = new Date();
    const diff = d - now;
    
    if (diff < 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="text-purple-400 text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-void-900 rounded-xl w-full max-w-2xl max-h-[85vh] overflow-hidden neon-border">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 p-4 border-b border-blue-500/30 flex justify-between items-center">
          <h2 className="font-display text-xl text-blue-400 flex items-center gap-2">
            🤝 Co-op Boss Help
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">×</button>
        </div>

        {/* Stats Bar */}
        <div className="bg-void-800 p-3 border-b border-purple-500/30 flex justify-between items-center text-sm">
          <div className="flex gap-4">
            <span className="text-blue-400">
              💎 Helper Points: <strong>{myStats?.helperPoints || 0}</strong>/{myStats?.maxHelperPoints || 30}
            </span>
            <span className="text-yellow-400">
              📅 Today: <strong>{myStats?.helpsToday || 0}</strong>/{myStats?.dailyLimit || 3}
            </span>
          </div>
        </div>

        {/* Message */}
        {message.text && (
          <div className={`p-3 text-center text-sm ${
            message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}>
            {message.text}
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-purple-500/30">
          <button
            onClick={() => setActiveTab('available')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'available' 
                ? 'bg-blue-500/20 text-blue-400 border-b-2 border-blue-500' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            🆘 Help Friends ({availableRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('myRequest')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors relative ${
              activeTab === 'myRequest' 
                ? 'bg-purple-500/20 text-purple-400 border-b-2 border-purple-500' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            📋 My Request
            {myRequest && (
              <span className="absolute top-2 right-4 w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'history' 
                ? 'bg-gray-500/20 text-gray-300 border-b-2 border-gray-500' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            📜 History
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[50vh]">
          
          {/* Help Result Modal */}
          {helpResult && (
            <div className="mb-4 bg-void-800 rounded-xl p-4 border border-green-500/30">
              <div className="text-center mb-3">
                <span className="text-4xl">{helpResult.victory ? '🎉' : '💀'}</span>
                <h3 className={`text-lg font-display mt-2 ${helpResult.victory ? 'text-green-400' : 'text-red-400'}`}>
                  {helpResult.victory ? 'VICTORY!' : 'DEFEAT'}
                </h3>
              </div>
              
              {/* Combat Summary */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-void-900 rounded p-2 text-center">
                  <p className="text-xs text-gray-400">Your Damage</p>
                  <p className="text-lg font-bold text-green-400">{helpResult.combat?.helperDamage?.toLocaleString()}</p>
                </div>
                <div className="bg-void-900 rounded p-2 text-center">
                  <p className="text-xs text-gray-400">Turns</p>
                  <p className="text-lg font-bold text-blue-400">{helpResult.combat?.turns}</p>
                </div>
              </div>
              
              {/* Rewards */}
              <div className="bg-green-500/10 rounded p-3">
                <p className="text-xs text-gray-400 mb-1">Your Rewards:</p>
                <div className="flex gap-4 text-sm">
                  <span className="text-yellow-400">+{helpResult.rewards?.gold || 0} Gold</span>
                  <span className="text-purple-400">+{helpResult.rewards?.exp || 0} EXP</span>
                  <span className="text-blue-400">+{helpResult.rewards?.helperPoints || 0} HP</span>
                </div>
              </div>
              
              <button
                onClick={() => setHelpResult(null)}
                className="w-full mt-3 py-2 bg-void-700 hover:bg-void-600 rounded text-sm"
              >
                Close
              </button>
            </div>
          )}

          {/* Available Tab */}
          {activeTab === 'available' && (
            <div className="space-y-3">
              {availableRequests.length === 0 ? (
                <div className="text-center py-8">
                  <span className="text-4xl">😴</span>
                  <p className="text-gray-400 mt-2">No friends need help right now</p>
                  <p className="text-xs text-gray-500 mt-1">Check back later!</p>
                </div>
              ) : (
                availableRequests.map((request) => (
                  <div
                    key={request.id}
                    className="bg-void-800 rounded-lg p-4 border border-blue-500/20"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {CLASS_ICONS[request.requester?.character?.class] || '👤'}
                        </span>
                        <div>
                          <p className="text-white font-medium">
                            {request.requester?.character?.name || request.requester?.username}
                          </p>
                          <p className="text-xs text-gray-400">
                            Lv.{request.requester?.character?.level || 1} • 
                            Needs help with boss
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-yellow-400">
                        {formatTime(request.expiresAt)}
                      </span>
                    </div>
                    
                    {/* Boss Info */}
                    <div className="bg-void-900 rounded p-3 mb-3 flex items-center gap-3">
                      <span className="text-3xl">{request.boss?.icon || '👹'}</span>
                      <div>
                        <p className="text-red-400 font-medium">{request.boss?.name}</p>
                        <p className="text-xs text-gray-400">
                          Tower {request.towerId} • Floor {request.floor} • 
                          HP: {request.boss?.hp?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    {/* Help Button */}
                    <button
                      onClick={() => handleAcceptHelp(request.id)}
                      disabled={isHelping || (myStats && myStats.helpsToday >= myStats.dailyLimit) || (myStats && myStats.helperPoints < request.helperPointsCost)}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isHelping ? (
                        <span className="animate-pulse">⚔️ Fighting...</span>
                      ) : (
                        <>
                          <span>🤝 Help ({request.helperPointsCost} HP)</span>
                        </>
                      )}
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* My Request Tab */}
          {activeTab === 'myRequest' && (
            <div>
              {myRequest ? (
                <div className="bg-void-800 rounded-xl p-4 border border-purple-500/30">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg text-purple-400 font-medium">Active Help Request</h3>
                      <p className="text-xs text-gray-400">
                        Status: <span className={
                          myRequest.status === 'pending' ? 'text-yellow-400' :
                          myRequest.status === 'accepted' ? 'text-blue-400' :
                          'text-green-400'
                        }>
                          {myRequest.status?.toUpperCase()}
                        </span>
                      </p>
                    </div>
                    <span className="text-xs text-gray-500">{formatTime(myRequest.expiresAt)}</span>
                  </div>
                  
                  {/* Boss Info */}
                  <div className="bg-void-900 rounded p-4 mb-4 flex items-center gap-4">
                    <span className="text-4xl">{myRequest.boss?.icon || '👹'}</span>
                    <div>
                      <p className="text-red-400 font-medium text-lg">{myRequest.boss?.name}</p>
                      <p className="text-sm text-gray-400">
                        Tower {myRequest.towerId} • Floor {myRequest.floor}
                      </p>
                      <p className="text-xs text-gray-500">
                        HP: {myRequest.boss?.hp?.toLocaleString()} • ATK: {myRequest.boss?.atk}
                      </p>
                    </div>
                  </div>
                  
                  {/* Helper Info */}
                  {myRequest.helper ? (
                    <div className="bg-green-500/10 rounded p-3 mb-4">
                      <p className="text-xs text-gray-400 mb-1">Helper:</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">
                          {CLASS_ICONS[myRequest.helper?.character?.class] || '👤'}
                        </span>
                        <div>
                          <p className="text-white">{myRequest.helper?.character?.name}</p>
                          <p className="text-xs text-gray-400">
                            Lv.{myRequest.helper?.character?.level}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-yellow-500/10 rounded p-3 mb-4 text-center">
                      <p className="text-yellow-400 text-sm animate-pulse">
                        ⏳ Waiting for a friend to help...
                      </p>
                    </div>
                  )}
                  
                  {/* Cancel Button */}
                  {myRequest.status === 'pending' && (
                    <button
                      onClick={handleCancelRequest}
                      className="w-full py-2 bg-red-600/30 hover:bg-red-600/50 rounded text-red-400 text-sm"
                    >
                      Cancel Request
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <span className="text-4xl">📋</span>
                  <p className="text-gray-400 mt-2">No active help request</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Create a request from a boss floor (5, 10, 15) in the tower
                  </p>
                </div>
              )}
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-2">
              {history.length === 0 ? (
                <div className="text-center py-8">
                  <span className="text-4xl">📜</span>
                  <p className="text-gray-400 mt-2">No help history yet</p>
                </div>
              ) : (
                history.map((entry, idx) => (
                  <div
                    key={idx}
                    className="bg-void-800 rounded-lg p-3 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-xl ${entry.victory ? 'text-green-400' : 'text-red-400'}`}>
                        {entry.victory ? '✅' : '❌'}
                      </span>
                      <div>
                        <p className="text-white text-sm">
                          {entry.role === 'helper' ? 'Helped' : 'Helped by'} <strong>{entry.partner}</strong>
                        </p>
                        <p className="text-xs text-gray-400">
                          Tower {entry.towerId} F{entry.floor} • {entry.boss}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-green-400">{entry.myDamage?.toLocaleString()} dmg</p>
                      <p className="text-xs text-gray-500">
                        {new Date(entry.completedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-void-800 p-3 border-t border-purple-500/30">
          <p className="text-xs text-gray-500 text-center">
            💡 Help friends on boss floors (5, 10, 15) to earn Helper Points and rewards!
          </p>
        </div>
      </div>
    </div>
  );
};

export default HelpRequestPanel;
