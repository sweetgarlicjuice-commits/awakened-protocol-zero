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
          className={`h-full ${color === 'text-green-400' ? 'bg-green-500' : 'bg-blue-500'} stat-bar transition-all duration-500`}
          style={{ width: `${percentage}%` }}
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
      <div className="h-full bg-gradient-to-r from-amber-500 to-amber-400 stat-bar transition-all duration-500" style={{ width: `${energy}%` }}></div>
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
        <div className="h-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-500" style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
};

const GamePage = () => {
  const { character, logout, refreshCharacter } = useAuth();
  const [activeTab, setActiveTab] = useState('status');
  const [isResting, setIsResting] = useState(false);
  const [gameLog, setGameLog] = useState([
    { type: 'system', message: 'Welcome to Awakened Protocol: Zero', timestamp: new Date() },
    { type: 'info', message: `Hunter ${character?.name} has entered the realm.`, timestamp: new Date() }
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
      addLog('success', `You rest and recover fully. (-${data.goldSpent} gold)`);
      await refreshCharacter();
    } catch (err) {
      addLog('error', err.response?.data?.error || 'Failed to rest');
    }
    setIsResting(false);
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
            <span className="hidden md:block text-gray-400 text-sm">Phase 1</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-sm text-gray-400">
                <span className={CLASS_COLORS[character.baseClass]}>{CLASS_ICONS[character.baseClass]}</span>
                {' '}{character.name}
              </div>
              <div className="text-xs text-gray-500">Level {character.level} • 💰 {character.gold}</div>
            </div>
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
                  <h3 className="font-display text-lg text-purple-400 mb-4">SKILLS</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {character.skills?.map((skill, index) => (
                      <div key={index} className={`p-4 rounded-lg border ${skill.unlocked ? 'bg-void-900/50 border-purple-500/30' : 'bg-void-900/20 border-gray-700/30 opacity-50'}`}>
                        <div className="flex items-center justify-between">
                          <h4 className={`font-semibold ${skill.unlocked ? 'text-white' : 'text-gray-500'}`}>{skill.name}</h4>
                          <span className="text-xs text-gray-500">Lv. {skill.level}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{skill.unlocked ? 'Available' : 'Locked - Unlock at higher level'}</p>
                      </div>
                    ))}
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
                <div key={index} className={`${log.type === 'system' ? 'text-purple-400' : log.type === 'success' ? 'text-green-400' : log.type === 'error' ? 'text-red-400' : log.type === 'combat' ? 'text-amber-400' : 'text-gray-400'}`}>
                  <span className="text-gray-600 mr-2">[{log.timestamp.toLocaleTimeString()}]</span>
                  {log.message}
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default GamePage;
