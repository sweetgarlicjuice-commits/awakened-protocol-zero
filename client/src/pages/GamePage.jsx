import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { characterAPI } from '../services/api';
import TowerPanel from '../components/TowerPanel';
import TavernPanel from '../components/TavernPanel';
import InventoryPanel from '../components/InventoryPanel';

const CLASS_ICONS = {
  swordsman: '⚔️',
  thief: '🗡️',
  archer: '🏹',
  mage: '🔮'
};

const CLASS_COLORS = {
  swordsman: 'text-red-400',
  thief: 'text-indigo-400',
  archer: 'text-green-400',
  mage: 'text-purple-400'
};

// Skill information with descriptions
const SKILL_INFO = {
  // Swordsman
  slash: { mpCost: 5, damage: 1.3, desc: 'Quick slash attack. Low cost, decent DMG.' },
  heavyStrike: { mpCost: 12, damage: 1.8, desc: 'Powerful overhead strike. High single-target DMG.' },
  shieldBash: { mpCost: 8, damage: 1.0, desc: 'Bash with shield. Chance to stun enemy.', effect: 'stun' },
  warCry: { mpCost: 15, damage: 0, desc: 'Battle cry. +20% ATK for 3 turns.', effect: 'buff' },
  // Thief
  backstab: { mpCost: 8, damage: 2.2, desc: 'Strike from behind. +40% crit chance.', effect: '+40% crit' },
  poisonBlade: { mpCost: 10, damage: 1.3, desc: 'Poisoned attack. DoT for 3 turns.', effect: 'poison' },
  smokeScreen: { mpCost: 12, damage: 0, desc: 'Create smoke. +30% evasion for 2 turns.', effect: 'evasion' },
  steal: { mpCost: 5, damage: 0, desc: 'Attempt to steal gold from enemy.', effect: 'gold' },
  // Archer
  preciseShot: { mpCost: 6, damage: 1.6, desc: 'Aimed shot. Never misses, bonus DMG.' },
  multiShot: { mpCost: 14, damage: 0.6, hits: 3, desc: 'Fire 3 arrows at once.' },
  eagleEye: { mpCost: 10, damage: 0, desc: 'Focus aim. +20% crit for 3 turns.', effect: 'crit buff' },
  arrowRain: { mpCost: 20, damage: 2.0, desc: 'Rain of arrows. High DMG attack.' },
  // Mage
  fireball: { mpCost: 10, damage: 1.8, desc: 'Hurl a fireball. Burns for 3 turns.', effect: 'burn' },
  iceSpear: { mpCost: 12, damage: 1.5, desc: 'Ice projectile. Chance to freeze.', effect: 'freeze' },
  manaShield: { mpCost: 15, damage: 0, desc: 'Absorb DMG with MP. Shield = INT × 2.', effect: 'shield' },
  thunderbolt: { mpCost: 18, damage: 2.2, desc: 'Lightning strike. High magic DMG.' },
  // Flameblade
  flame_slash: { mpCost: 15, damage: 2.0, desc: 'Slash with burning blade. DMG + burn effect.', effect: 'burn' },
  inferno_strike: { mpCost: 25, damage: 2.8, desc: 'Powerful fire-infused strike. High single-target DMG.' },
  fire_aura: { mpCost: 20, damage: 0, desc: 'Surround yourself in flames. +30% ATK for 3 turns.', effect: 'buff' },
  volcanic_rage: { mpCost: 40, damage: 3.5, desc: 'Erupt with volcanic power. Massive DMG + burn.', effect: 'burn' },
  // Shadow Dancer
  shadow_strike: { mpCost: 12, damage: 2.5, desc: 'Strike from the shadows. High crit chance.', effect: '+50% crit' },
  vanish: { mpCost: 20, damage: 0, desc: 'Become invisible. Next attack auto-crits +100% DMG.', effect: 'stealth' },
  death_mark: { mpCost: 18, damage: 1.5, desc: 'Mark target. +30% damage taken for 3 turns.', effect: 'debuff' },
  shadow_dance: { mpCost: 35, damage: 2.0, hits: 5, desc: 'Rapid 5-hit combo from the shadows.' },
  // Storm Ranger
  lightning_arrow: { mpCost: 14, damage: 2.2, desc: 'Arrow charged with lightning. High DMG + shock.', effect: 'shock' },
  chain_lightning: { mpCost: 22, damage: 1.8, hits: 3, desc: 'Lightning chains to hit 3 times.' },
  storm_eye: { mpCost: 18, damage: 0, desc: 'Enter focus state. +50% Precision, +30% Crit.', effect: 'buff' },
  thunderstorm: { mpCost: 45, damage: 3.0, hits: 4, desc: 'Call down a devastating thunderstorm.', effect: 'shock' },
  // Frost Weaver
  frost_bolt: { mpCost: 12, damage: 2.0, desc: 'Ice bolt that slows enemy. -20% ATK.', effect: 'slow' },
  blizzard: { mpCost: 28, damage: 2.2, hits: 3, desc: 'Ice storm hits 3 times. 30% freeze chance.', effect: 'freeze' },
  ice_armor: { mpCost: 20, damage: 0, desc: 'Armor of ice. +50 DEF, reflect 20% DMG.', effect: 'defense' },
  absolute_zero: { mpCost: 50, damage: 4.0, desc: 'Ultimate cold. Massive DMG + 2-turn freeze.', effect: 'freeze' }
};

const StatBar = ({ label, current, max, color, icon }) => {
  const percentage = Math.round((current / max) * 100);
  
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-400 flex items-center gap-1">
          {icon} {label}
        </span>
        <span className={color}>{current} / {max}</span>
      </div>
      <div className="h-3 bg-void-900 rounded-full overflow-hidden">
        <div 
          className={'h-full ' + (color === 'text-green-400' ? 'bg-green-500' : 'bg-blue-500') + ' stat-bar transition-all duration-500'}
          style={{ width: percentage + '%' }}
        ></div>
      </div>
    </div>
  );
};

const EnergyBar = ({ energy }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-sm">
      <span className="text-gray-400">⚡ ENERGY</span>
      <span className="text-amber-400">{energy} / 100</span>
    </div>
    <div className="h-2 bg-void-900 rounded-full overflow-hidden">
      <div className="h-full bg-gradient-to-r from-amber-500 to-amber-400 stat-bar transition-all duration-500" style={{ width: energy + '%' }}></div>
    </div>
  </div>
);

const ExpBar = ({ exp, expToLevel, level }) => {
  const percentage = Math.round((exp / expToLevel) * 100);
  
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-gray-500">Level {level}</span>
        <span className="text-purple-400">{exp} / {expToLevel} EXP</span>
      </div>
      <div className="h-2 bg-void-900 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-500" style={{ width: percentage + '%' }}></div>
      </div>
    </div>
  );
};

const GamePage = () => {
  const { character, logout, refreshCharacter } = useAuth();
  const [activeTab, setActiveTab] = useState('status');
  const [isResting, setIsResting] = useState(false);
  const [showStatModal, setShowStatModal] = useState(false);
  const [pendingStats, setPendingStats] = useState({ str: 0, agi: 0, dex: 0, int: 0, vit: 0 });
  const [isAllocating, setIsAllocating] = useState(false);
  const [gameLog, setGameLog] = useState([
    { type: 'system', message: 'Welcome to Awakened Protocol: Zero', timestamp: new Date() },
    { type: 'info', message: 'Hunter ' + (character?.name || 'Unknown') + ' has entered the realm.', timestamp: new Date() }
  ]);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => refreshCharacter(), 60000);
    return () => clearInterval(interval);
  }, [refreshCharacter]);

  const addLog = (type, message) => {
    setGameLog(prev => [...prev, { type, message, timestamp: new Date() }].slice(-50));
  };

  const handleRest = async () => {
    setIsResting(true);
    try {
      const { data } = await characterAPI.rest();
      addLog('success', 'You rest and recover fully. (-' + data.goldSpent + ' gold)');
      await refreshCharacter();
    } catch (err) {
      addLog('error', err.response?.data?.error || 'Failed to rest');
    }
    setIsResting(false);
  };

  const handleAllocateStats = async () => {
    const total = Object.values(pendingStats).reduce((a, b) => a + b, 0);
    if (total === 0) return;
    setIsAllocating(true);
    try {
      await characterAPI.allocateStats(pendingStats);
      addLog('success', 'Stats allocated successfully!');
      setPendingStats({ str: 0, agi: 0, dex: 0, int: 0, vit: 0 });
      setShowStatModal(false);
      await refreshCharacter();
    } catch (err) {
      addLog('error', err.response?.data?.error || 'Failed to allocate stats');
    }
    setIsAllocating(false);
  };

  const addPendingStat = (stat, amount) => {
    const total = Object.values(pendingStats).reduce((a, b) => a + b, 0);
    const newValue = pendingStats[stat] + amount;
    if (newValue >= 0 && total + amount <= character.statPoints) {
      setPendingStats({ ...pendingStats, [stat]: newValue });
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!character) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-void-800 border-b border-purple-500/20 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-xl text-purple-400">APZ</h1>
            <div className="hidden md:block text-gray-500 text-sm">|</div>
            <span className="hidden md:block text-gray-400 text-sm">Awakened Protocol: Zero</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={handleLogout} className="text-gray-400 hover:text-red-400 transition-colors text-sm">Logout</button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row">
        <aside className="lg:w-80 bg-void-800/50 border-b lg:border-b-0 lg:border-r border-purple-500/10 p-4">
          <div className="text-center mb-6">
            <div className="w-24 h-24 mx-auto mb-3 rounded-full bg-gradient-to-br from-purple-600/30 to-purple-800/30 border-2 border-purple-500/30 flex items-center justify-center text-5xl">
              {CLASS_ICONS[character.baseClass]}
            </div>
            <h2 className="font-display text-xl text-white">{character.name}</h2>
            <p className={`text-sm ${CLASS_COLORS[character.baseClass]} capitalize`}>
              {character.hiddenClass !== 'none' ? character.hiddenClass : character.baseClass}
            </p>
          </div>

          <div className="mb-6">
            <ExpBar exp={character.experience} expToLevel={character.experienceToNextLevel} level={character.level}/>
          </div>

          <div className="space-y-3 mb-6">
            <StatBar label="HP" current={character.stats.hp} max={character.stats.maxHp} color="text-green-400" icon="❤️"/>
            <StatBar label="MP" current={character.stats.mp} max={character.stats.maxMp} color="text-blue-400" icon="💎"/>
          </div>

          <div className="mb-6">
            <EnergyBar energy={character.energy} />
            <p className="text-xs text-gray-600 mt-1">+25 energy per hour</p>
          </div>

          <div className="space-y-2">
            <button onClick={handleRest} disabled={isResting || character.stats.hp >= character.stats.maxHp} className="w-full btn-secondary text-sm py-2 disabled:opacity-50">
              {isResting ? 'Resting...' : `🛏️ Rest (${character.level * 5}g)`}
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-700/50">
            <h3 className="text-gray-400 text-sm mb-3 font-semibold">STATS</h3>
            {character.statPoints > 0 && (
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-2 mb-3 text-center">
                <span className="text-purple-400 text-sm">{character.statPoints} points available!</span>
                <button onClick={() => setShowStatModal(true)} className="ml-2 px-2 py-1 bg-purple-600 hover:bg-purple-500 rounded text-xs">Allocate</button>
              </div>
            )}
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between p-2 bg-void-900/50 rounded"><span className="text-gray-500">STR</span><span className="text-red-400">{character.stats.str}</span></div>
              <div className="flex justify-between p-2 bg-void-900/50 rounded"><span className="text-gray-500">AGI</span><span className="text-indigo-400">{character.stats.agi}</span></div>
              <div className="flex justify-between p-2 bg-void-900/50 rounded"><span className="text-gray-500">DEX</span><span className="text-green-400">{character.stats.dex}</span></div>
              <div className="flex justify-between p-2 bg-void-900/50 rounded"><span className="text-gray-500">INT</span><span className="text-purple-400">{character.stats.int}</span></div>
              <div className="col-span-2 flex justify-between p-2 bg-void-900/50 rounded"><span className="text-gray-500">VIT</span><span className="text-amber-400">{character.stats.vit}</span></div>
            </div>
          </div>
        </aside>

        <main className="flex-1 flex flex-col">
          <nav className="bg-void-800/30 border-b border-purple-500/10">
            <div className="flex">
              {[
                { id: 'status', label: '📊 Status', icon: '📊' },
                { id: 'tower', label: '🗼 Tower', icon: '🗼' },
                { id: 'inventory', label: '🎒 Items', icon: '🎒' },
                { id: 'tavern', label: '🍺 Tavern', icon: '🍺' },
                { id: 'skills', label: '⚡ Skills', icon: '⚡' }
              ].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${activeTab === tab.id ? 'text-purple-400 border-b-2 border-purple-500 bg-purple-500/5' : 'text-gray-500 hover:text-gray-300'}`}>
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.icon}</span>
                </button>
              ))}
            </div>
          </nav>

          <div className="flex-1 p-4 md:p-6 overflow-auto">
            {activeTab === 'status' && (
              <div className="max-w-4xl mx-auto space-y-6">
                <div className="bg-void-800/50 rounded-xl p-6 neon-border">
                  <h3 className="font-display text-lg text-purple-400 mb-4">HUNTER STATUS</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex justify-between py-2 border-b border-gray-700/30"><span className="text-gray-400">Name</span><span className="text-white">{character.name}</span></div>
                      <div className="flex justify-between py-2 border-b border-gray-700/30"><span className="text-gray-400">Class</span><span className={CLASS_COLORS[character.baseClass]}>{CLASS_ICONS[character.baseClass]} {character.baseClass.charAt(0).toUpperCase() + character.baseClass.slice(1)}</span></div>
                      <div className="flex justify-between py-2 border-b border-gray-700/30"><span className="text-gray-400">Hidden Class</span><span className={character.hiddenClass !== 'none' ? 'text-purple-400' : 'text-gray-600'}>{character.hiddenClass !== 'none' ? character.hiddenClass : 'Not Unlocked'}</span></div>
                      <div className="flex justify-between py-2 border-b border-gray-700/30"><span className="text-gray-400">Level</span><span className="text-amber-400">{character.level}</span></div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between py-2 border-b border-gray-700/30"><span className="text-gray-400">Current Tower</span><span className="text-white">{character.currentTower}</span></div>
                      <div className="flex justify-between py-2 border-b border-gray-700/30"><span className="text-gray-400">Current Floor</span><span className="text-white">{character.currentFloor}</span></div>
                      <div className="flex justify-between py-2 border-b border-gray-700/30"><span className="text-gray-400">Gold</span><span className="text-amber-400">💰 {character.gold}</span></div>
                      <div className="flex justify-between py-2 border-b border-gray-700/30"><span className="text-gray-400">Memory Crystals</span><span className="text-cyan-400">💎 {character.memoryCrystals}</span></div>
                    </div>
                  </div>
                </div>
                <div className="bg-void-800/50 rounded-xl p-6 neon-border">
                  <h3 className="font-display text-lg text-purple-400 mb-4">STATISTICS</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-void-900/50 rounded-lg"><div className="text-2xl font-bold text-red-400">{character.statistics?.totalKills || 0}</div><div className="text-xs text-gray-500">Total Kills</div></div>
                    <div className="text-center p-3 bg-void-900/50 rounded-lg"><div className="text-2xl font-bold text-purple-400">{character.statistics?.bossKills || 0}</div><div className="text-xs text-gray-500">Boss Kills</div></div>
                    <div className="text-center p-3 bg-void-900/50 rounded-lg"><div className="text-2xl font-bold text-blue-400">{character.statistics?.floorsCleared || 0}</div><div className="text-xs text-gray-500">Floors Cleared</div></div>
                    <div className="text-center p-3 bg-void-900/50 rounded-lg"><div className="text-2xl font-bold text-amber-400">{character.statistics?.scrollsFound || 0}</div><div className="text-xs text-gray-500">Scrolls Found</div></div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'tower' && (
              <div className="max-w-4xl mx-auto">
                <TowerPanel 
                  character={character} 
                  onCharacterUpdate={refreshCharacter}
                  addLog={addLog}
                />
              </div>
            )}

            {activeTab === 'inventory' && (
              <div className="max-w-4xl mx-auto">
                <InventoryPanel 
                  character={character} 
                  onCharacterUpdate={refreshCharacter}
                  addLog={addLog}
                />
              </div>
            )}

            {activeTab === 'tavern' && (
              <div className="max-w-4xl mx-auto">
                <TavernPanel 
                  character={character} 
                  onCharacterUpdate={refreshCharacter}
                  addLog={addLog}
                />
              </div>
            )}

            {activeTab === 'skills' && (
              <div className="max-w-4xl mx-auto">
                <div className="bg-void-800/50 rounded-xl p-6 neon-border">
                  <h3 className="font-display text-lg text-purple-400 mb-4">⚔️ COMBAT SKILLS</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {character.skills?.map((skill, index) => {
                      const skillInfo = SKILL_INFO[skill.skillId] || {};
                      return (
                        <div key={index} className={`p-4 rounded-lg border ${skill.unlocked ? 'bg-void-900/50 border-purple-500/30' : 'bg-void-900/20 border-gray-700/30 opacity-50'}`}>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className={`font-semibold ${skill.unlocked ? 'text-white' : 'text-gray-500'}`}>{skill.name}</h4>
                            <span className="text-xs px-2 py-1 rounded bg-blue-600/30 text-blue-400">{skillInfo.mpCost || '?'} MP</span>
                          </div>
                          <p className="text-sm text-gray-400">{skillInfo.desc || 'No description available.'}</p>
                          {skillInfo.damage && (
                            <div className="mt-2 text-xs text-gray-500">
                              DMG: {skillInfo.damage}x {skillInfo.hits && '× ' + skillInfo.hits + ' hits'}
                              {skillInfo.effect && <span className="ml-2 text-purple-400">• {skillInfo.effect}</span>}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {character.hiddenClass === 'none' && (
                    <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                      <p className="text-purple-400 text-sm text-center">🔮 Unlock a Hidden Class to gain 4 additional powerful skills!</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="h-40 bg-void-900 border-t border-purple-500/10 p-3 overflow-auto">
            <div className="font-mono text-xs space-y-1">
              {gameLog.map((log, index) => (
                <div key={index} className={(log.type === 'system' ? 'text-purple-400' : log.type === 'success' ? 'text-green-400' : log.type === 'error' ? 'text-red-400' : log.type === 'combat' ? 'text-amber-400' : 'text-gray-400')}>
                  <span className="text-gray-600 mr-2">[{log.timestamp.toLocaleTimeString()}]</span>
                  {log.message}
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* Stat Allocation Modal */}
      {showStatModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-void-800 rounded-xl p-6 w-full max-w-md neon-border">
            <h2 className="font-display text-xl text-purple-400 mb-4">Allocate Stats</h2>
            <p className="text-gray-400 mb-4">Points available: <span className="text-purple-400">{character.statPoints - Object.values(pendingStats).reduce((a, b) => a + b, 0)}</span></p>
            
            <div className="space-y-3">
              {[
                { id: 'str', name: 'Strength', color: 'text-red-400', desc: 'Physical damage' },
                { id: 'agi', name: 'Agility', color: 'text-indigo-400', desc: 'Crit & evasion' },
                { id: 'dex', name: 'Dexterity', color: 'text-green-400', desc: 'Accuracy & precision' },
                { id: 'int', name: 'Intelligence', color: 'text-purple-400', desc: 'Magic damage & MP' },
                { id: 'vit', name: 'Vitality', color: 'text-amber-400', desc: 'HP & defense' }
              ].map(stat => (
                <div key={stat.id} className="flex items-center justify-between bg-void-900/50 p-3 rounded-lg">
                  <div>
                    <span className={stat.color + ' font-bold'}>{stat.name}</span>
                    <span className="text-gray-500 text-xs ml-2">({stat.desc})</span>
                    <div className="text-sm text-gray-400">
                      Current: {character.stats[stat.id]} {pendingStats[stat.id] > 0 && <span className="text-green-400">+{pendingStats[stat.id]}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => addPendingStat(stat.id, -1)} disabled={pendingStats[stat.id] <= 0}
                      className="w-8 h-8 bg-red-600 hover:bg-red-500 rounded disabled:opacity-30">-</button>
                    <span className="w-8 text-center text-white">{pendingStats[stat.id]}</span>
                    <button onClick={() => addPendingStat(stat.id, 1)} 
                      disabled={Object.values(pendingStats).reduce((a, b) => a + b, 0) >= character.statPoints}
                      className="w-8 h-8 bg-green-600 hover:bg-green-500 rounded disabled:opacity-30">+</button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowStatModal(false); setPendingStats({ str: 0, agi: 0, dex: 0, int: 0, vit: 0 }); }} 
                className="flex-1 btn-secondary">Cancel</button>
              <button onClick={handleAllocateStats} 
                disabled={isAllocating || Object.values(pendingStats).reduce((a, b) => a + b, 0) === 0}
                className="flex-1 btn-primary disabled:opacity-50">
                {isAllocating ? 'Allocating...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GamePage;
