import React, { useState, useEffect } from 'react';
import { dungeonBreakAPI } from '../services/api';

// ============================================
// DUNGEON BREAK GM PANEL - Phase 9.8
// ============================================
// Features:
// - View available bosses and tiers
// - Create new dungeon break events
// - Monitor active events
// - View event history
// - Cancel active events
// ============================================

const DungeonBreakGMPanel = () => {
  const [bosses, setBosses] = useState([]);
  const [tiers, setTiers] = useState([]);
  const [activeEvent, setActiveEvent] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Create event form
  const [selectedBoss, setSelectedBoss] = useState(1);
  const [selectedTier, setSelectedTier] = useState('small');
  const [duration, setDuration] = useState(3);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchAll();
    // Poll for active event updates
    const interval = setInterval(fetchActiveEvent, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchAll = async () => {
    setIsLoading(true);
    await Promise.all([
      fetchBosses(),
      fetchTiers(),
      fetchActiveEvent(),
      fetchHistory()
    ]);
    setIsLoading(false);
  };

  const fetchBosses = async () => {
    try {
      const { data } = await dungeonBreakAPI.getBosses();
      setBosses(data.bosses || []);
    } catch (err) {
      console.error('Failed to fetch bosses:', err);
    }
  };

  const fetchTiers = async () => {
    try {
      const { data } = await dungeonBreakAPI.getTiers();
      setTiers(data.tiers || []);
    } catch (err) {
      console.error('Failed to fetch tiers:', err);
    }
  };

  const fetchActiveEvent = async () => {
    try {
      const { data } = await dungeonBreakAPI.getActive();
      setActiveEvent(data.active ? data.event : null);
      
      if (data.active && data.event?.id) {
        const lbData = await dungeonBreakAPI.getLeaderboard(data.event.id);
        setLeaderboard(lbData.data?.leaderboard || []);
      } else {
        setLeaderboard([]);
      }
    } catch (err) {
      console.error('Failed to fetch active event:', err);
    }
  };

  const fetchHistory = async () => {
    try {
      const { data } = await dungeonBreakAPI.getHistory();
      setHistory(data.events || []);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleCreateEvent = async () => {
    if (activeEvent) {
      showMessage('error', 'An event is already active!');
      return;
    }
    
    setIsCreating(true);
    try {
      const { data } = await dungeonBreakAPI.createEvent(selectedBoss, selectedTier, duration);
      showMessage('success', data.message);
      fetchActiveEvent();
    } catch (err) {
      showMessage('error', err.response?.data?.error || 'Failed to create event');
    }
    setIsCreating(false);
  };

  const handleCancelEvent = async () => {
    if (!confirm('Cancel this Dungeon Break event? All progress will be lost!')) return;
    
    try {
      await dungeonBreakAPI.cancelEvent();
      showMessage('success', 'Event cancelled');
      setActiveEvent(null);
      setLeaderboard([]);
      fetchHistory();
    } catch (err) {
      showMessage('error', err.response?.data?.error || 'Failed to cancel event');
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num?.toString() || '0';
  };

  const getSelectedBoss = () => bosses.find(b => b.id === selectedBoss);
  const getSelectedTier = () => tiers.find(t => t.id === selectedTier);

  const calculateHP = () => {
    const boss = getSelectedBoss();
    const tier = getSelectedTier();
    if (!boss || !tier) return 0;
    return boss.baseHp * tier.hpMultiplier;
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="text-purple-400 text-lg">Loading Dungeon Break...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Message */}
      {message.text && (
        <div className={`p-3 rounded-lg text-center ${
          message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      {/* Active Event Monitor */}
      {activeEvent && (
        <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-display text-red-400 flex items-center gap-2">
                🔥 ACTIVE EVENT
              </h3>
              <p className="text-gray-400 text-sm">
                {activeEvent.tier?.name} • Ends: {activeEvent.time?.remainingFormatted}
              </p>
            </div>
            <button
              onClick={handleCancelEvent}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-sm"
            >
              Cancel Event
            </button>
          </div>

          {/* Boss Info */}
          <div className="bg-void-800 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-4">
              <span className="text-4xl">{activeEvent.boss?.icon}</span>
              <div className="flex-1">
                <h4 className="text-lg text-white">{activeEvent.boss?.name}</h4>
                <p className="text-sm text-gray-400">Level Req: {activeEvent.boss?.levelReq}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-red-400">
                  {formatNumber(activeEvent.hp?.current)} / {formatNumber(activeEvent.hp?.max)}
                </p>
                <p className="text-sm text-gray-400">HP Remaining: {activeEvent.hp?.percent}%</p>
              </div>
            </div>
            
            {/* HP Bar */}
            <div className="mt-3 h-4 bg-void-900 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-500"
                style={{ width: `${activeEvent.hp?.percent || 0}%` }}
              />
            </div>
          </div>

          {/* Event Stats */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="bg-void-800 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-purple-400">{activeEvent.stats?.uniqueParticipants || 0}</p>
              <p className="text-xs text-gray-400">Participants</p>
            </div>
            <div className="bg-void-800 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-blue-400">{activeEvent.stats?.totalAttacks || 0}</p>
              <p className="text-xs text-gray-400">Total Attacks</p>
            </div>
            <div className="bg-void-800 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-green-400">{formatNumber(activeEvent.stats?.totalDamage || 0)}</p>
              <p className="text-xs text-gray-400">Total Damage</p>
            </div>
            <div className="bg-void-800 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-yellow-400">{activeEvent.time?.remainingFormatted}</p>
              <p className="text-xs text-gray-400">Time Left</p>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="bg-void-800 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-400 mb-3">Top Damage Dealers</h4>
            {leaderboard.length > 0 ? (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {leaderboard.slice(0, 10).map((entry, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className={`w-6 text-center font-bold ${
                        idx === 0 ? 'text-yellow-400' : idx === 1 ? 'text-gray-300' : idx === 2 ? 'text-amber-600' : 'text-gray-500'
                      }`}>
                        #{entry.rank}
                      </span>
                      <span className="text-white">{entry.name}</span>
                      <span className="text-gray-500 text-xs">Lv.{entry.level}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-green-400">{formatNumber(entry.damage)}</span>
                      <span className="text-gray-500 text-xs ml-2">({entry.damagePercent}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-2">No participants yet</p>
            )}
          </div>
          
          <button
            onClick={fetchActiveEvent}
            className="mt-4 w-full py-2 bg-void-700 hover:bg-void-600 rounded-lg text-sm text-gray-300"
          >
            🔄 Refresh
          </button>
        </div>
      )}

      {/* Create Event Section */}
      {!activeEvent && (
        <div className="bg-void-800/50 rounded-xl p-6 neon-border">
          <h3 className="text-lg font-display text-purple-400 mb-4">⚔️ Create Dungeon Break Event</h3>
          
          {/* Boss Selection */}
          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-2">Select Boss</label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {bosses.map((boss) => (
                <button
                  key={boss.id}
                  onClick={() => setSelectedBoss(boss.id)}
                  className={`p-3 rounded-lg text-left transition-colors ${
                    selectedBoss === boss.id 
                      ? 'bg-purple-600/30 border border-purple-500' 
                      : 'bg-void-700 hover:bg-void-600 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{boss.icon}</span>
                    <div>
                      <p className="text-white text-sm font-medium">{boss.name}</p>
                      <p className="text-xs text-gray-400">Lv.{boss.levelReq}+ • Base HP: {formatNumber(boss.baseHp)}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Tier Selection */}
          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-2">Select Tier (scales boss HP)</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {tiers.map((tier) => (
                <button
                  key={tier.id}
                  onClick={() => setSelectedTier(tier.id)}
                  className={`p-3 rounded-lg text-center transition-colors ${
                    selectedTier === tier.id 
                      ? 'bg-blue-600/30 border border-blue-500' 
                      : 'bg-void-700 hover:bg-void-600 border border-transparent'
                  }`}
                >
                  <p className="text-white text-sm font-medium">{tier.name}</p>
                  <p className="text-xs text-gray-400">{tier.description}</p>
                  <p className="text-xs text-blue-400 mt-1">{tier.hpMultiplier}x HP</p>
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-2">Duration (hours)</label>
            <div className="flex gap-2">
              {[1, 2, 3, 6, 12, 24].map((h) => (
                <button
                  key={h}
                  onClick={() => setDuration(h)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    duration === h 
                      ? 'bg-green-600 text-white' 
                      : 'bg-void-700 text-gray-400 hover:bg-void-600'
                  }`}
                >
                  {h}h
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="bg-void-900 rounded-lg p-4 mb-4">
            <h4 className="text-sm text-gray-400 mb-2">Event Preview</h4>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{getSelectedBoss()?.icon}</span>
                <div>
                  <p className="text-white font-medium">{getSelectedBoss()?.name}</p>
                  <p className="text-sm text-gray-400">{getSelectedTier()?.name} • {duration} hours</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-red-400">{formatNumber(calculateHP())}</p>
                <p className="text-xs text-gray-400">Total HP</p>
              </div>
            </div>
          </div>

          {/* Create Button */}
          <button
            onClick={handleCreateEvent}
            disabled={isCreating}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-red-600 hover:from-purple-500 hover:to-red-500 rounded-lg font-display text-lg disabled:opacity-50"
          >
            {isCreating ? '⏳ Creating...' : '🔥 START DUNGEON BREAK'}
          </button>
        </div>
      )}

      {/* Event History */}
      <div className="bg-void-800/50 rounded-xl p-6 neon-border">
        <h3 className="text-lg font-display text-purple-400 mb-4">📜 Event History</h3>
        {history.length > 0 ? (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {history.map((event, idx) => (
              <div key={idx} className="flex items-center justify-between bg-void-700 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{event.boss?.icon}</span>
                  <div>
                    <p className="text-white text-sm">{event.boss?.name}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(event.completedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-gray-400">{event.stats?.uniqueParticipants || 0} players</p>
                    <p className="text-xs text-green-400">{formatNumber(event.stats?.totalDamage || 0)} dmg</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    event.status === 'completed' ? 'bg-green-500/20 text-green-400' : 
                    event.status === 'failed' ? 'bg-red-500/20 text-red-400' : 
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {event.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No events yet</p>
        )}
      </div>
    </div>
  );
};

export default DungeonBreakGMPanel;
