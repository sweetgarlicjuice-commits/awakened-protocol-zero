import React, { useState, useEffect, useCallback } from 'react';
import { dungeonBreakAPI } from '../services/api';

// ============================================
// DUNGEON BREAK PANEL - Player View (Phase 9.9)
// ============================================
// Features:
// - See active dungeon break event
// - Attack boss and deal damage
// - View real-time leaderboard
// - Claim rewards after event ends
// - View participation history
// ============================================

const DungeonBreakPanel = ({ character, onClose, refreshCharacter }) => {
  const [activeEvent, setActiveEvent] = useState(null);
  const [myParticipation, setMyParticipation] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAttacking, setIsAttacking] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [lastAttack, setLastAttack] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('event'); // event, leaderboard, history

  // Fetch active event
  const fetchActiveEvent = useCallback(async () => {
    try {
      const { data } = await dungeonBreakAPI.getActive();
      setActiveEvent(data.active ? data.event : null);
      setMyParticipation(data.myParticipation || null);
      
      if (data.active && data.event?.id) {
        const lbData = await dungeonBreakAPI.getLeaderboard(data.event.id);
        setLeaderboard(lbData.data?.leaderboard || []);
      }
    } catch (err) {
      console.error('Failed to fetch event:', err);
    }
    setIsLoading(false);
  }, []);

  // Fetch history
  const fetchHistory = async () => {
    try {
      const { data } = await dungeonBreakAPI.getMyHistory();
      setHistory(data.history || []);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  };

  useEffect(() => {
    fetchActiveEvent();
    fetchHistory();
    
    // Poll for updates every 5 seconds during active event
    const interval = setInterval(fetchActiveEvent, 5000);
    return () => clearInterval(interval);
  }, [fetchActiveEvent]);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  // Attack the boss
  const handleAttack = async () => {
    if (!activeEvent || isAttacking) return;
    
    // Check level requirement
    if (character.level < activeEvent.boss?.levelReq) {
      showMessage('error', `You need to be level ${activeEvent.boss.levelReq} to participate!`);
      return;
    }
    
    setIsAttacking(true);
    try {
      const { data } = await dungeonBreakAPI.attack();
      
      setLastAttack({
        damage: data.damage,
        isCrit: data.isCrit,
        timestamp: Date.now()
      });
      
      // Update local state
      setMyParticipation(prev => ({
        ...prev,
        totalDamage: data.myStats?.totalDamage || (prev?.totalDamage || 0) + data.damage,
        rank: data.myStats?.rank
      }));
      
      // Show damage message
      if (data.isCrit) {
        showMessage('success', `💥 CRITICAL HIT! ${formatNumber(data.damage)} damage!`);
      } else {
        showMessage('success', `⚔️ ${formatNumber(data.damage)} damage dealt!`);
      }
      
      // Check if boss defeated
      if (data.boss?.defeated) {
        showMessage('success', '🎉 BOSS DEFEATED! Claim your rewards!');
        fetchActiveEvent();
      }
      
      // Refresh character for any stat updates
      if (refreshCharacter) refreshCharacter();
      
    } catch (err) {
      showMessage('error', err.response?.data?.error || 'Attack failed!');
    }
    setIsAttacking(false);
  };

  // Claim rewards
  const handleClaimRewards = async (eventId) => {
    setIsClaiming(true);
    try {
      const { data } = await dungeonBreakAPI.claimRewards(eventId);
      
      showMessage('success', `🎁 Claimed! +${data.rewards.gold}g, +${data.rewards.exp} EXP`);
      
      // Refresh data
      fetchHistory();
      if (refreshCharacter) refreshCharacter();
      
    } catch (err) {
      showMessage('error', err.response?.data?.error || 'Failed to claim rewards');
    }
    setIsClaiming(false);
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num?.toLocaleString() || '0';
  };

  const formatTime = (ms) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  const canParticipate = activeEvent && character.level >= (activeEvent.boss?.levelReq || 0);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="text-purple-400 text-lg">Loading Dungeon Break...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-void-900 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden neon-border">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-900/50 to-purple-900/50 p-4 border-b border-red-500/30 flex justify-between items-center">
          <h2 className="font-display text-xl text-red-400 flex items-center gap-2">
            🔥 Dungeon Break
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">×</button>
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
            onClick={() => setActiveTab('event')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'event' 
                ? 'bg-red-500/20 text-red-400 border-b-2 border-red-500' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            ⚔️ Active Event
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'leaderboard' 
                ? 'bg-yellow-500/20 text-yellow-400 border-b-2 border-yellow-500' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            🏆 Leaderboard
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'history' 
                ? 'bg-purple-500/20 text-purple-400 border-b-2 border-purple-500' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            📜 History
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          
          {/* Active Event Tab */}
          {activeTab === 'event' && (
            <>
              {activeEvent ? (
                <div className="space-y-4">
                  {/* Boss Info Card */}
                  <div className="bg-gradient-to-br from-red-900/30 to-void-800 rounded-xl p-6 border border-red-500/30">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="text-6xl animate-pulse">{activeEvent.boss?.icon}</div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-display text-white">{activeEvent.boss?.name}</h3>
                        <p className="text-sm text-gray-400">{activeEvent.boss?.description}</p>
                        <div className="flex gap-4 mt-2 text-xs">
                          <span className="text-yellow-400">⭐ Lv.{activeEvent.boss?.levelReq}+</span>
                          <span className="text-blue-400">🎯 {activeEvent.tier?.name}</span>
                          <span className="text-purple-400">⏱️ {activeEvent.time?.remainingFormatted}</span>
                        </div>
                      </div>
                    </div>

                    {/* HP Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Boss HP</span>
                        <span className="text-red-400 font-bold">
                          {formatNumber(activeEvent.hp?.current)} / {formatNumber(activeEvent.hp?.max)}
                        </span>
                      </div>
                      <div className="h-6 bg-void-900 rounded-full overflow-hidden border border-red-500/30">
                        <div 
                          className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-300 relative"
                          style={{ width: `${activeEvent.hp?.percent || 0}%` }}
                        >
                          <div className="absolute inset-0 bg-white/20 animate-pulse" />
                        </div>
                      </div>
                      <div className="text-center text-xs text-gray-500 mt-1">
                        {activeEvent.hp?.percent}% remaining
                      </div>
                    </div>

                    {/* Level Check */}
                    {!canParticipate && (
                      <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3 mb-4 text-center">
                        <p className="text-yellow-400 text-sm">
                          ⚠️ You need to be Level {activeEvent.boss?.levelReq} to participate!
                        </p>
                        <p className="text-gray-400 text-xs mt-1">Your level: {character.level}</p>
                      </div>
                    )}

                    {/* Attack Button */}
                    {canParticipate && (
                      <button
                        onClick={handleAttack}
                        disabled={isAttacking}
                        className="w-full py-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 rounded-xl font-display text-xl text-white shadow-lg shadow-red-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isAttacking ? (
                          <span className="animate-pulse">⚔️ Attacking...</span>
                        ) : (
                          <span>⚔️ ATTACK!</span>
                        )}
                      </button>
                    )}

                    {/* Last Attack Result */}
                    {lastAttack && (
                      <div className={`mt-3 text-center p-2 rounded-lg ${
                        lastAttack.isCrit ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'
                      }`}>
                        {lastAttack.isCrit ? '💥 CRIT! ' : ''}
                        {formatNumber(lastAttack.damage)} damage dealt!
                      </div>
                    )}
                  </div>

                  {/* My Stats */}
                  {myParticipation && (
                    <div className="bg-void-800 rounded-xl p-4 border border-purple-500/30">
                      <h4 className="text-sm font-medium text-purple-400 mb-3">📊 Your Contribution</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-400">{formatNumber(myParticipation.totalDamage)}</p>
                          <p className="text-xs text-gray-400">Total Damage</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-yellow-400">#{myParticipation.rank || '?'}</p>
                          <p className="text-xs text-gray-400">Rank</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-400">{myParticipation.attackCount || 0}</p>
                          <p className="text-xs text-gray-400">Attacks</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Event Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-void-800 rounded-lg p-3 text-center">
                      <p className="text-lg font-bold text-purple-400">{activeEvent.stats?.uniqueParticipants || 0}</p>
                      <p className="text-xs text-gray-400">Hunters</p>
                    </div>
                    <div className="bg-void-800 rounded-lg p-3 text-center">
                      <p className="text-lg font-bold text-blue-400">{activeEvent.stats?.totalAttacks || 0}</p>
                      <p className="text-xs text-gray-400">Total Attacks</p>
                    </div>
                    <div className="bg-void-800 rounded-lg p-3 text-center">
                      <p className="text-lg font-bold text-green-400">{formatNumber(activeEvent.stats?.totalDamage || 0)}</p>
                      <p className="text-xs text-gray-400">Total Damage</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">😴</div>
                  <h3 className="text-xl text-gray-400 mb-2">No Active Dungeon Break</h3>
                  <p className="text-sm text-gray-500">
                    Wait for the Game Master to start an event!
                  </p>
                  <p className="text-xs text-gray-600 mt-4">
                    Check back later or ask your GM to start a Dungeon Break event.
                  </p>
                </div>
              )}
            </>
          )}

          {/* Leaderboard Tab */}
          {activeTab === 'leaderboard' && (
            <div>
              {leaderboard.length > 0 ? (
                <div className="space-y-2">
                  {leaderboard.map((entry, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        entry.rank <= 3 
                          ? 'bg-gradient-to-r from-yellow-900/30 to-void-800 border border-yellow-500/30' 
                          : 'bg-void-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-8 text-center font-bold text-lg ${
                          entry.rank === 1 ? 'text-yellow-400' :
                          entry.rank === 2 ? 'text-gray-300' :
                          entry.rank === 3 ? 'text-amber-600' :
                          'text-gray-500'
                        }`}>
                          {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
                        </span>
                        <div>
                          <p className="text-white font-medium">{entry.name}</p>
                          <p className="text-xs text-gray-400">Lv.{entry.level} • {entry.attacks} attacks</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-green-400 font-bold">{formatNumber(entry.damage)}</p>
                        <p className="text-xs text-gray-500">{entry.damagePercent}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <p>No participants yet</p>
                  {activeEvent && <p className="text-sm mt-2">Be the first to attack!</p>}
                </div>
              )}
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div>
              {history.length > 0 ? (
                <div className="space-y-3">
                  {history.map((event, idx) => (
                    <div key={idx} className="bg-void-800 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{event.boss?.icon}</span>
                          <div>
                            <p className="text-white font-medium">{event.boss?.name}</p>
                            <p className="text-xs text-gray-400">
                              {new Date(event.completedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs ${
                          event.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                          event.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {event.status}
                        </span>
                      </div>
                      
                      {event.myStats && (
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-void-700">
                          <div className="flex gap-4 text-sm">
                            <span className="text-green-400">
                              ⚔️ {formatNumber(event.myStats.totalDamage)} dmg
                            </span>
                            <span className="text-yellow-400">
                              🏆 Rank #{event.myStats.rank}
                            </span>
                          </div>
                          
                          {!event.myStats.rewardsClaimed && event.status === 'completed' ? (
                            <button
                              onClick={() => handleClaimRewards(event.id)}
                              disabled={isClaiming}
                              className="px-4 py-1 bg-green-600 hover:bg-green-500 rounded text-sm font-medium disabled:opacity-50"
                            >
                              {isClaiming ? 'Claiming...' : '🎁 Claim Rewards'}
                            </button>
                          ) : event.myStats.rewardsClaimed ? (
                            <span className="text-xs text-gray-500">✓ Claimed</span>
                          ) : null}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <p>No participation history yet</p>
                  <p className="text-sm mt-2">Join a Dungeon Break event to get started!</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-void-800 p-3 border-t border-purple-500/30 flex justify-between items-center">
          <div className="text-xs text-gray-500">
            {activeEvent ? '🔴 Event Active' : '⚫ No Event'}
          </div>
          <button
            onClick={fetchActiveEvent}
            className="px-3 py-1 bg-void-700 hover:bg-void-600 rounded text-sm text-gray-300"
          >
            🔄 Refresh
          </button>
        </div>
      </div>
    </div>
  );
};

export default DungeonBreakPanel;
