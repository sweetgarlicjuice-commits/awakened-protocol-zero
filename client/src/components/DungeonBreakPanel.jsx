import React, { useState, useEffect, useCallback } from 'react';
import { dungeonBreakAPI } from '../services/api';

// ============================================
// DUNGEON BREAK PANEL - Player View (Phase 9.9.1)
// ============================================
// Features:
// - See active dungeon break event
// - Attack boss and deal damage
// - Boss counter-attacks! (NEW)
// - Player HP/MP display (NEW)
// - Attack cooldown (NEW)
// - Death state handling (NEW)
// - View real-time leaderboard
// - Claim rewards after event ends
// - View participation history
// ============================================

const DungeonBreakPanel = ({ character, onClose, refreshCharacter }) => {
  const [activeEvent, setActiveEvent] = useState(null);
  const [myParticipation, setMyParticipation] = useState(null);
  const [myStatus, setMyStatus] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAttacking, setIsAttacking] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [lastCombat, setLastCombat] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('event'); // event, leaderboard, history
  const [cooldown, setCooldown] = useState(0);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    
    const timer = setInterval(() => {
      setCooldown(prev => Math.max(0, prev - 100));
    }, 100);
    
    return () => clearInterval(timer);
  }, [cooldown]);

  // Fetch active event
  const fetchActiveEvent = useCallback(async () => {
    try {
      const { data } = await dungeonBreakAPI.getActive();
      setActiveEvent(data.active ? data.event : null);
      setMyParticipation(data.myParticipation || null);
      setMyStatus(data.myStatus || null);
      
      // Set initial cooldown if any
      if (data.myParticipation?.cooldownRemaining > 0) {
        setCooldown(data.myParticipation.cooldownRemaining);
      }
      
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
    if (!activeEvent || isAttacking || cooldown > 0) return;
    
    // Check level requirement
    if (character.level < activeEvent.boss?.levelReq) {
      showMessage('error', `You need to be level ${activeEvent.boss.levelReq} to participate!`);
      return;
    }
    
    // Check if dead
    if (myStatus?.isDead || myStatus?.hp <= 0) {
      showMessage('error', '💀 You are dead! Use a potion to heal first.');
      return;
    }
    
    setIsAttacking(true);
    try {
      const { data } = await dungeonBreakAPI.attack();
      
      // Set cooldown
      if (data.cooldownMs) {
        setCooldown(data.cooldownMs);
      }
      
      // Update combat result
      setLastCombat({
        playerAttack: data.playerAttack,
        bossAttack: data.bossAttack,
        timestamp: Date.now()
      });
      
      // Update player status
      setMyStatus({
        hp: data.player.hp,
        maxHp: data.player.maxHp,
        mp: data.player.mp,
        maxMp: data.player.maxMp,
        isDead: data.player.died
      });
      
      // Update participation stats
      setMyParticipation(prev => ({
        ...prev,
        totalDamage: data.myStats?.totalDamage || (prev?.totalDamage || 0) + data.playerAttack.damage,
        rank: data.myStats?.rank
      }));
      
      // Build message
      let msg = '';
      if (data.playerAttack.isCrit) {
        msg += `💥 CRIT! You dealt ${formatNumber(data.playerAttack.damage)} damage! `;
      } else {
        msg += `⚔️ You dealt ${formatNumber(data.playerAttack.damage)} damage! `;
      }
      
      if (data.bossAttack) {
        if (data.bossAttack.usedSkill) {
          msg += `${data.bossAttack.skillIcon} Boss used ${data.bossAttack.skillName}! `;
        }
        if (data.bossAttack.isCrit) {
          msg += `💥 Boss CRIT for ${formatNumber(data.bossAttack.damage)}!`;
        } else {
          msg += `Boss hit you for ${formatNumber(data.bossAttack.damage)}!`;
        }
      }
      
      if (data.player.died) {
        showMessage('error', `${msg} 💀 YOU DIED! Heal to continue.`);
      } else if (data.boss?.defeated) {
        showMessage('success', '🎉 BOSS DEFEATED! Claim your rewards!');
        fetchActiveEvent();
      } else {
        showMessage(data.bossAttack?.usedSkill ? 'warning' : 'success', msg);
      }
      
      // Refresh character for HP updates
      if (refreshCharacter) refreshCharacter();
      
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Attack failed!';
      showMessage('error', errorMsg);
      
      // Handle cooldown error
      if (err.response?.data?.cooldownRemaining) {
        setCooldown(err.response.data.cooldownRemaining);
      }
      
      // Handle dead state
      if (err.response?.data?.isDead) {
        setMyStatus(prev => ({ ...prev, isDead: true, hp: 0 }));
      }
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
  const isDead = myStatus?.isDead || myStatus?.hp <= 0;
  const isOnCooldown = cooldown > 0;

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

        {/* Player Status Bar (NEW in 9.9.1) */}
        {myStatus && activeEvent && (
          <div className="bg-void-800 px-4 py-2 border-b border-purple-500/30">
            <div className="flex items-center gap-4">
              {/* HP Bar */}
              <div className="flex-1">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-red-400">❤️ HP</span>
                  <span className={isDead ? 'text-red-500 font-bold' : 'text-gray-300'}>
                    {isDead ? '💀 DEAD' : `${myStatus.hp} / ${myStatus.maxHp}`}
                  </span>
                </div>
                <div className="h-3 bg-void-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${
                      isDead ? 'bg-gray-600' : 
                      (myStatus.hp / myStatus.maxHp) < 0.3 ? 'bg-red-600 animate-pulse' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.max(0, (myStatus.hp / myStatus.maxHp) * 100)}%` }}
                  />
                </div>
              </div>
              
              {/* MP Bar */}
              <div className="flex-1">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-blue-400">💧 MP</span>
                  <span className="text-gray-300">{myStatus.mp} / {myStatus.maxMp}</span>
                </div>
                <div className="h-3 bg-void-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${(myStatus.mp / myStatus.maxMp) * 100}%` }}
                  />
                </div>
              </div>
            </div>
            
            {/* Dead Warning */}
            {isDead && (
              <div className="mt-2 p-2 bg-red-900/30 border border-red-500/50 rounded text-center">
                <span className="text-red-400 text-sm">💀 You are dead! Use a potion from your inventory to heal.</span>
              </div>
            )}
          </div>
        )}

        {/* Message */}
        {message.text && (
          <div className={`p-3 text-center text-sm ${
            message.type === 'success' ? 'bg-green-500/20 text-green-400' : 
            message.type === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
            'bg-red-500/20 text-red-400'
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
        <div className="p-4 overflow-y-auto max-h-[50vh]">
          {/* Active Event Tab */}
          {activeTab === 'event' && (
            <>
              {activeEvent ? (
                <div className="space-y-4">
                  {/* Boss Info */}
                  <div className="bg-gradient-to-r from-red-900/30 to-purple-900/30 rounded-xl p-4 border border-red-500/30">
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-5xl">{activeEvent.boss?.icon}</span>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-red-400">{activeEvent.boss?.name}</h3>
                        <p className="text-sm text-gray-400">{activeEvent.boss?.description}</p>
                        <div className="flex gap-2 mt-1">
                          <span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded">
                            Lv.{activeEvent.boss?.levelReq}+
                          </span>
                          <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded">
                            {activeEvent.tier?.name}
                          </span>
                          <span className="text-xs px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded">
                            {activeEvent.boss?.element}
                          </span>
                        </div>
                        {/* Boss Skill Info */}
                        {activeEvent.boss?.skill && (
                          <div className="mt-2 text-xs text-gray-500">
                            <span className="text-yellow-400">{activeEvent.boss.skill.icon} {activeEvent.boss.skill.name}</span>
                            <span className="ml-2">({activeEvent.boss.skill.chance}% chance)</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* HP Bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Boss HP</span>
                        <span className="text-red-400">
                          {formatNumber(activeEvent.hp?.current)} / {formatNumber(activeEvent.hp?.max)}
                        </span>
                      </div>
                      <div className="h-4 bg-void-800 rounded-full overflow-hidden border border-red-500/30">
                        <div 
                          className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-300"
                          style={{ width: `${activeEvent.hp?.percent}%` }}
                        />
                      </div>
                      <div className="text-right text-xs text-gray-500 mt-1">
                        {activeEvent.hp?.percent}% remaining
                      </div>
                    </div>

                    {/* Time Remaining */}
                    <div className="text-center text-sm text-yellow-400">
                      ⏱️ {activeEvent.time?.remainingFormatted} remaining
                    </div>
                  </div>

                  {/* Attack Section */}
                  <div className="bg-void-800 rounded-xl p-4 border border-purple-500/30">
                    {!canParticipate ? (
                      <div className="text-center py-4">
                        <p className="text-red-400">
                          ⚠️ Minimum level {activeEvent.boss?.levelReq} required
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Your level: {character.level}
                        </p>
                      </div>
                    ) : (
                      <button
                        onClick={handleAttack}
                        disabled={isAttacking || isOnCooldown || isDead || activeEvent.status !== 'active'}
                        className={`w-full py-4 rounded-lg font-bold text-lg transition-all ${
                          isDead 
                            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                            : isOnCooldown
                              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                              : isAttacking
                                ? 'bg-yellow-600 text-white'
                                : 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white transform hover:scale-[1.02]'
                        }`}
                      >
                        {isDead ? (
                          <span>💀 DEAD - Heal to Attack</span>
                        ) : isAttacking ? (
                          <span className="animate-pulse">⚔️ Attacking...</span>
                        ) : isOnCooldown ? (
                          <span>⏳ Cooldown ({(cooldown / 1000).toFixed(1)}s)</span>
                        ) : (
                          <span>⚔️ ATTACK!</span>
                        )}
                      </button>
                    )}

                    {/* Cooldown Bar */}
                    {isOnCooldown && !isDead && (
                      <div className="mt-2">
                        <div className="h-1 bg-void-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-yellow-500 transition-all"
                            style={{ width: `${(cooldown / 3000) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Last Combat Result */}
                    {lastCombat && (
                      <div className="mt-3 space-y-2">
                        {/* Player Attack */}
                        <div className={`p-2 rounded-lg text-center ${
                          lastCombat.playerAttack?.isCrit 
                            ? 'bg-yellow-500/20 text-yellow-400' 
                            : 'bg-green-500/20 text-green-400'
                        }`}>
                          {lastCombat.playerAttack?.isCrit ? '💥 CRIT! ' : '⚔️ '}
                          You dealt {formatNumber(lastCombat.playerAttack?.damage)} damage!
                        </div>
                        
                        {/* Boss Counter-Attack */}
                        {lastCombat.bossAttack && (
                          <div className={`p-2 rounded-lg text-center ${
                            lastCombat.bossAttack?.usedSkill 
                              ? 'bg-purple-500/20 text-purple-400' 
                              : lastCombat.bossAttack?.isCrit
                                ? 'bg-red-500/20 text-red-400'
                                : 'bg-orange-500/20 text-orange-400'
                          }`}>
                            {lastCombat.bossAttack?.usedSkill && (
                              <span>{lastCombat.bossAttack.skillIcon} {lastCombat.bossAttack.skillName}! </span>
                            )}
                            {lastCombat.bossAttack?.isCrit ? '💥 CRIT! ' : ''}
                            Boss hit you for {formatNumber(lastCombat.bossAttack?.damage)}!
                          </div>
                        )}
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
            {isDead && activeEvent && <span className="ml-2 text-red-400">• 💀 Dead</span>}
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
