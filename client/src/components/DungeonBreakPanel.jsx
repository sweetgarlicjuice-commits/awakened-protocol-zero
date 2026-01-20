import React, { useState, useEffect, useCallback } from 'react';
import { dungeonBreakAPI } from '../services/api';

// ============================================
// DUNGEON BREAK PANEL - Player View (Phase 9.9.2)
// ============================================

const DungeonBreakPanel = ({ character, onClose, refreshCharacter }) => {
  const [activeEvent, setActiveEvent] = useState(null);
  const [myParticipation, setMyParticipation] = useState(null);
  const [myStatus, setMyStatus] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [history, setHistory] = useState([]);
  const [myCoins, setMyCoins] = useState(null);
  const [shop, setShop] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAttacking, setIsAttacking] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [lastCombat, setLastCombat] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('event');
  const [cooldown, setCooldown] = useState(0);
  const [selectedSet, setSelectedSet] = useState(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown(prev => Math.max(0, prev - 100)), 100);
    return () => clearInterval(timer);
  }, [cooldown]);

  const fetchActiveEvent = useCallback(async () => {
    try {
      const { data } = await dungeonBreakAPI.getActive();
      setActiveEvent(data.active ? data.event : null);
      setMyParticipation(data.myParticipation || null);
      setMyStatus(data.myStatus || null);
      if (data.myParticipation?.cooldownRemaining > 0) setCooldown(data.myParticipation.cooldownRemaining);
      if (data.active && data.event?.id) {
        const lbData = await dungeonBreakAPI.getLeaderboard(data.event.id);
        setLeaderboard(lbData.data?.leaderboard || []);
      }
    } catch (err) { console.error('Failed to fetch event:', err); }
    setIsLoading(false);
  }, []);

  const fetchHistory = async () => {
    try {
      const { data } = await dungeonBreakAPI.getMyHistory();
      setHistory(data.history || []);
    } catch (err) { console.error('Failed to fetch history:', err); }
  };

  const fetchCoins = async () => {
    try {
      const { data } = await dungeonBreakAPI.getMyCoins();
      setMyCoins(data);
    } catch (err) { console.error('Failed to fetch coins:', err); }
  };

  const fetchShop = async () => {
    try {
      const { data } = await dungeonBreakAPI.getShop();
      setShop(data.shop || []);
    } catch (err) { console.error('Failed to fetch shop:', err); }
  };

  useEffect(() => {
    fetchActiveEvent();
    fetchHistory();
    fetchCoins();
    fetchShop();
    const interval = setInterval(fetchActiveEvent, 5000);
    return () => clearInterval(interval);
  }, [fetchActiveEvent]);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const handleAttack = async () => {
    if (!activeEvent || isAttacking || cooldown > 0) return;
    if (character.level < activeEvent.boss?.levelReq) {
      showMessage('error', `You need to be level ${activeEvent.boss.levelReq} to participate!`);
      return;
    }
    if (myStatus?.isDead || myStatus?.hp <= 0) {
      showMessage('error', '💀 You are dead! Use a potion to heal first.');
      return;
    }
    
    setIsAttacking(true);
    try {
      const { data } = await dungeonBreakAPI.attack();
      if (data.cooldownMs) setCooldown(data.cooldownMs);
      setLastCombat({ playerAttack: data.playerAttack, bossAttack: data.bossAttack, timestamp: Date.now() });
      setMyStatus({ hp: data.player.hp, maxHp: data.player.maxHp, mp: data.player.mp, maxMp: data.player.maxMp, isDead: data.player.died });
      setMyParticipation(prev => ({ ...prev, totalDamage: data.myStats?.totalDamage, rank: data.myStats?.rank }));
      
      let msg = data.playerAttack.isCrit ? `💥 CRIT! ${formatNumber(data.playerAttack.damage)} dmg! ` : `⚔️ ${formatNumber(data.playerAttack.damage)} dmg! `;
      if (data.bossAttack) {
        if (data.bossAttack.usedSkill) msg += `${data.bossAttack.skillIcon} ${data.bossAttack.skillName}! `;
        msg += `Boss: ${formatNumber(data.bossAttack.damage)} dmg`;
      }
      
      if (data.player.died) showMessage('error', `${msg} 💀 YOU DIED!`);
      else if (data.boss?.defeated) { showMessage('success', '🎉 BOSS DEFEATED!'); fetchActiveEvent(); }
      else showMessage(data.bossAttack?.usedSkill ? 'warning' : 'success', msg);
      
      if (refreshCharacter) refreshCharacter();
    } catch (err) {
      showMessage('error', err.response?.data?.error || 'Attack failed!');
      if (err.response?.data?.cooldownRemaining) setCooldown(err.response.data.cooldownRemaining);
    }
    setIsAttacking(false);
  };

  const handleClaimRewards = async (eventId) => {
    setIsClaiming(true);
    try {
      const { data } = await dungeonBreakAPI.claimRewards(eventId);
      showMessage('success', `🎁 +${data.rewards.coins} ${data.rewards.coinName}, +${data.rewards.gold}g, +${data.rewards.exp} EXP`);
      fetchHistory(); fetchCoins();
      if (refreshCharacter) refreshCharacter();
    } catch (err) { showMessage('error', err.response?.data?.error || 'Failed to claim'); }
    setIsClaiming(false);
  };

  const handleRedeem = async (setId, pieceSlot) => {
    setIsRedeeming(true);
    try {
      const { data } = await dungeonBreakAPI.redeem(setId, pieceSlot);
      showMessage('success', `🎉 ${data.message}`);
      fetchCoins(); fetchShop();
      if (refreshCharacter) refreshCharacter();
    } catch (err) { showMessage('error', err.response?.data?.error || 'Failed to redeem'); }
    setIsRedeeming(false);
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num?.toLocaleString() || '0';
  };

  const getRarityColor = (rarity) => {
    switch(rarity) {
      case 'legendary': return 'text-orange-400 border-orange-500/50';
      case 'mythic': return 'text-pink-400 border-pink-500/50';
      case 'epic': return 'text-purple-400 border-purple-500/50';
      default: return 'text-gray-400 border-gray-500/50';
    }
  };

  const canParticipate = activeEvent && character.level >= (activeEvent.boss?.levelReq || 0);
  const isDead = myStatus?.isDead || myStatus?.hp <= 0;
  const isOnCooldown = cooldown > 0;

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="text-purple-400 text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-void-900 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden neon-border">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-900/50 to-purple-900/50 p-4 border-b border-red-500/30 flex justify-between items-center">
          <h2 className="font-display text-xl text-red-400">🔥 Dungeon Break</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">×</button>
        </div>

        {/* Player HP Bar (during event) */}
        {myStatus && activeEvent && (
          <div className="bg-void-800 px-4 py-2 border-b border-purple-500/30">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-red-400">❤️ HP</span>
                  <span className={isDead ? 'text-red-500 font-bold' : 'text-gray-300'}>
                    {isDead ? '💀 DEAD' : `${myStatus.hp}/${myStatus.maxHp}`}
                  </span>
                </div>
                <div className="h-2 bg-void-700 rounded-full overflow-hidden">
                  <div className={`h-full transition-all ${isDead ? 'bg-gray-600' : 'bg-red-500'}`}
                    style={{ width: `${Math.max(0, (myStatus.hp / myStatus.maxHp) * 100)}%` }} />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-blue-400">💧 MP</span>
                  <span className="text-gray-300">{myStatus.mp}/{myStatus.maxMp}</span>
                </div>
                <div className="h-2 bg-void-700 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500" style={{ width: `${(myStatus.mp / myStatus.maxMp) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Coin Display */}
        {myCoins && (
          <div className="bg-void-800/50 px-4 py-2 border-b border-purple-500/30 flex items-center gap-3 overflow-x-auto text-xs">
            <span className="text-gray-400">Coins:</span>
            {Object.entries(myCoins.coins).map(([level, coin]) => (
              <span key={level} className="text-yellow-400 whitespace-nowrap">
                🪙{coin.amount} <span className="text-gray-500">{level.toUpperCase()}</span>
              </span>
            ))}
          </div>
        )}

        {/* Message */}
        {message.text && (
          <div className={`p-2 text-center text-sm ${
            message.type === 'success' ? 'bg-green-500/20 text-green-400' : 
            message.type === 'warning' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
          }`}>{message.text}</div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-purple-500/30">
          {[
            { id: 'event', label: '⚔️ Event', color: 'red' },
            { id: 'leaderboard', label: '🏆 Ranks', color: 'yellow' },
            { id: 'history', label: '📜 History', color: 'purple' },
            { id: 'redeem', label: '🛒 Redeem', color: 'green' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 px-3 text-sm font-medium transition-colors ${
                activeTab === tab.id ? `bg-${tab.color}-500/20 text-${tab.color}-400 border-b-2 border-${tab.color}-500` : 'text-gray-400 hover:text-white'
              }`}
            >{tab.label}</button>
          ))}
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[50vh]">
          
          {/* EVENT TAB */}
          {activeTab === 'event' && (
            activeEvent ? (
              <div className="space-y-4">
                {/* Boss Card */}
                <div className="bg-gradient-to-r from-red-900/30 to-purple-900/30 rounded-xl p-4 border border-red-500/30">
                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-4xl">{activeEvent.boss?.icon}</span>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-red-400">{activeEvent.boss?.name}</h3>
                      <div className="flex gap-2 mt-1 flex-wrap">
                        <span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded">Lv.{activeEvent.boss?.levelReq}+</span>
                        <span className="text-xs px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded">🪙 {activeEvent.coinName}</span>
                      </div>
                    </div>
                    <div className="text-right text-sm text-yellow-400">⏱️ {activeEvent.time?.remainingFormatted}</div>
                  </div>
                  
                  {/* Boss HP */}
                  <div className="mb-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400">Boss HP</span>
                      <span className="text-red-400">{formatNumber(activeEvent.hp?.current)} / {formatNumber(activeEvent.hp?.max)}</span>
                    </div>
                    <div className="h-3 bg-void-800 rounded-full overflow-hidden border border-red-500/30">
                      <div className="h-full bg-gradient-to-r from-red-600 to-red-400" style={{ width: `${activeEvent.hp?.percent}%` }} />
                    </div>
                  </div>
                </div>

                {/* Attack Button */}
                <button
                  onClick={handleAttack}
                  disabled={!canParticipate || isAttacking || isOnCooldown || isDead}
                  className={`w-full py-3 rounded-lg font-bold text-lg transition-all ${
                    !canParticipate ? 'bg-gray-700 text-gray-500' :
                    isDead ? 'bg-gray-700 text-gray-500' :
                    isOnCooldown ? 'bg-gray-700 text-gray-400' :
                    isAttacking ? 'bg-yellow-600' :
                    'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500'
                  }`}
                >
                  {!canParticipate ? `⚠️ Need Lv.${activeEvent.boss?.levelReq}` :
                   isDead ? '💀 DEAD - Heal First' :
                   isOnCooldown ? `⏳ ${(cooldown/1000).toFixed(1)}s` :
                   isAttacking ? '⚔️ ...' : '⚔️ ATTACK!'}
                </button>

                {/* Combat Result */}
                {lastCombat && (
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className={`p-2 rounded text-center ${lastCombat.playerAttack?.isCrit ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
                      You: {formatNumber(lastCombat.playerAttack?.damage)} {lastCombat.playerAttack?.isCrit && '💥'}
                    </div>
                    {lastCombat.bossAttack && (
                      <div className={`p-2 rounded text-center ${lastCombat.bossAttack?.usedSkill ? 'bg-purple-500/20 text-purple-400' : 'bg-orange-500/20 text-orange-400'}`}>
                        Boss: {formatNumber(lastCombat.bossAttack?.damage)} {lastCombat.bossAttack?.usedSkill && lastCombat.bossAttack.skillIcon}
                      </div>
                    )}
                  </div>
                )}

                {/* My Stats */}
                {myParticipation?.totalDamage > 0 && (
                  <div className="bg-void-800 rounded-lg p-3 flex justify-around text-center">
                    <div><p className="text-xl font-bold text-green-400">{formatNumber(myParticipation.totalDamage)}</p><p className="text-xs text-gray-400">Damage</p></div>
                    <div><p className="text-xl font-bold text-yellow-400">#{myParticipation.rank}</p><p className="text-xs text-gray-400">Rank</p></div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">😴</div>
                <p className="text-gray-400">No Active Event</p>
                <p className="text-sm text-gray-500 mt-2">Wait for GM to start one!</p>
              </div>
            )
          )}

          {/* LEADERBOARD TAB */}
          {activeTab === 'leaderboard' && (
            <div className="space-y-2">
              {leaderboard.length > 0 ? leaderboard.map((entry, idx) => (
                <div key={idx} className={`flex items-center justify-between p-2 rounded-lg ${entry.rank <= 3 ? 'bg-yellow-900/20 border border-yellow-500/30' : 'bg-void-800'}`}>
                  <div className="flex items-center gap-2">
                    <span className={`w-7 text-center font-bold ${entry.rank === 1 ? 'text-yellow-400' : entry.rank === 2 ? 'text-gray-300' : entry.rank === 3 ? 'text-amber-600' : 'text-gray-500'}`}>
                      {entry.rank <= 3 ? ['🥇','🥈','🥉'][entry.rank-1] : `#${entry.rank}`}
                    </span>
                    <div>
                      <p className="text-white text-sm">{entry.name}</p>
                      <p className="text-xs text-gray-500">Lv.{entry.level}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-green-400 text-sm font-bold">{formatNumber(entry.damage)}</p>
                    <p className="text-xs text-yellow-400">🪙 {entry.coinsEarned}</p>
                  </div>
                </div>
              )) : <div className="text-center py-8 text-gray-400">No participants</div>}
            </div>
          )}

          {/* HISTORY TAB */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              {history.length > 0 ? history.map((event, idx) => (
                <div key={idx} className="bg-void-800 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{event.boss?.icon}</span>
                      <div>
                        <p className="text-white text-sm">{event.boss?.name}</p>
                        <p className="text-xs text-gray-500">{new Date(event.completedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${event.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {event.status}
                    </span>
                  </div>
                  {event.myStats && (
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-void-700">
                      <div className="flex gap-3 text-xs">
                        <span className="text-green-400">⚔️ {formatNumber(event.myStats.totalDamage)}</span>
                        <span className="text-yellow-400">#{event.myStats.rank}</span>
                        <span className="text-yellow-400">🪙 {event.myStats.coinsEarned}</span>
                      </div>
                      {!event.myStats.rewardsClaimed && event.status === 'completed' ? (
                        <button onClick={() => handleClaimRewards(event.id)} disabled={isClaiming}
                          className="px-3 py-1 bg-green-600 hover:bg-green-500 rounded text-xs disabled:opacity-50">
                          {isClaiming ? '...' : '🎁 Claim'}
                        </button>
                      ) : event.myStats.rewardsClaimed && <span className="text-xs text-gray-500">✓</span>}
                    </div>
                  )}
                </div>
              )) : <div className="text-center py-8 text-gray-400">No history</div>}
            </div>
          )}

          {/* REDEEM TAB */}
          {activeTab === 'redeem' && (
            <div className="space-y-4">
              {/* Set Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {shop.map(set => (
                  <button
                    key={set.setId}
                    onClick={() => setSelectedSet(selectedSet?.setId === set.setId ? null : set)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      selectedSet?.setId === set.setId ? `${getRarityColor(set.rarity)} bg-void-700` : 'border-void-600 bg-void-800 hover:border-purple-500/50'
                    }`}
                  >
                    <div className="flex justify-between">
                      <div>
                        <h4 className={`font-medium text-sm ${getRarityColor(set.rarity).split(' ')[0]}`}>{set.name}</h4>
                        <p className="text-xs text-gray-500">Lv.{set.levelReq}+ • {set.rarity}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">{set.coinName}</p>
                        <p className={`text-sm font-bold ${set.playerCoins >= 25 ? 'text-green-400' : 'text-red-400'}`}>🪙 {set.playerCoins}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Selected Set Pieces */}
              {selectedSet && (
                <div className={`bg-void-800 rounded-xl p-4 border ${getRarityColor(selectedSet.rarity)}`}>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className={`font-bold ${getRarityColor(selectedSet.rarity).split(' ')[0]}`}>{selectedSet.name}</h3>
                    <span className="text-xs text-gray-400">Cost: 25 {selectedSet.coinName}</span>
                  </div>
                  
                  {/* Level Check */}
                  {character.level < selectedSet.levelReq && (
                    <div className="mb-3 p-2 bg-red-900/30 border border-red-500/50 rounded text-center text-sm text-red-400">
                      ⚠️ Requires Level {selectedSet.levelReq} (You: Lv.{character.level})
                    </div>
                  )}
                  
                  {/* Pieces */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedSet.pieces.map(piece => {
                      const canAfford = selectedSet.playerCoins >= 25;
                      const meetsLevel = character.level >= selectedSet.levelReq;
                      const canRedeem = canAfford && meetsLevel;
                      
                      return (
                        <div key={piece.slot} className="bg-void-900 rounded-lg p-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{piece.icon}</span>
                            <div>
                              <p className="text-white text-sm">{piece.name}</p>
                              <p className="text-xs text-gray-500">{piece.slot}</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {Object.entries(piece.stats).map(([stat, val]) => (
                                  <span key={stat} className="text-xs text-green-400">+{val} {stat}</span>
                                ))}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRedeem(selectedSet.setId, piece.slot)}
                            disabled={!canRedeem || isRedeeming}
                            className={`px-3 py-1 rounded text-sm font-medium ${
                              canRedeem ? 'bg-green-600 hover:bg-green-500 text-white' : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            {isRedeeming ? '...' : '🪙 25'}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Set Bonuses */}
                  <div className="mt-4 pt-3 border-t border-void-700">
                    <h4 className="text-sm text-purple-400 mb-2">Set Bonuses</h4>
                    <div className="space-y-1 text-xs">
                      {Object.entries(selectedSet.setBonuses).map(([count, bonus]) => (
                        <div key={count} className="flex justify-between text-gray-400">
                          <span className="text-yellow-400">{bonus.name}:</span>
                          <span>{bonus.effect}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {!selectedSet && (
                <div className="text-center py-8 text-gray-500 text-sm">
                  👆 Select a set above to see pieces and redeem
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-void-800 p-2 border-t border-purple-500/30 flex justify-between items-center text-xs">
          <span className="text-gray-500">{activeEvent ? '🔴 Event Active' : '⚫ No Event'}</span>
          <button onClick={() => { fetchActiveEvent(); fetchCoins(); fetchShop(); }}
            className="px-2 py-1 bg-void-700 hover:bg-void-600 rounded text-gray-300">🔄</button>
        </div>
      </div>
    </div>
  );
};

export default DungeonBreakPanel;
