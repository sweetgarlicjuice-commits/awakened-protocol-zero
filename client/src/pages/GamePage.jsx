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

// ============================================================
// SKILL DATABASE
// ============================================================
const SKILL_DATABASE = {
  // BASE SWORDSMAN
  slash: { name: 'Slash', mpCost: 12, damage: 1.3, element: 'none', desc: 'Quick slash attack.' },
  heavyStrike: { name: 'Heavy Strike', mpCost: 25, damage: 2.0, element: 'none', desc: 'Powerful overhead strike.' },
  shieldBash: { name: 'Shield Bash', mpCost: 18, damage: 1.2, element: 'none', desc: 'Bash with shield.', effect: '-15% ATK' },
  warCry: { name: 'War Cry', mpCost: 30, damage: 0, element: 'none', desc: 'Battle cry.', effect: '+30% ATK 3t' },
  whirlwind: { name: 'Whirlwind', mpCost: 35, damage: 0.8, element: 'none', desc: 'Spin attack, all enemies.', target: 'all' },
  
  // BASE THIEF
  backstab: { name: 'Backstab', mpCost: 18, damage: 2.2, element: 'none', desc: 'Strike from behind.', effect: '+30% crit' },
  poisonBlade: { name: 'Poison Blade', mpCost: 22, damage: 1.5, element: 'nature', desc: 'Poisoned attack.', effect: 'poison' },
  smokeScreen: { name: 'Smoke Screen', mpCost: 28, damage: 0, element: 'none', desc: 'Create smoke.', effect: '+50% evasion 2t' },
  fanOfKnives: { name: 'Fan of Knives', mpCost: 32, damage: 0.7, element: 'none', desc: 'Throw knives, all enemies.', target: 'all' },
  
  // BASE ARCHER
  preciseShot: { name: 'Precise Shot', mpCost: 15, damage: 1.6, element: 'none', desc: 'Aimed shot, single target.' },
  multiShot: { name: 'Multi Shot', mpCost: 30, damage: 0.6, element: 'none', desc: '3 arrows, all enemies.', target: 'all' },
  eagleEye: { name: 'Eagle Eye', mpCost: 25, damage: 0, element: 'none', desc: 'Focus aim.', effect: '+25% crit 3t' },
  arrowRain: { name: 'Arrow Rain', mpCost: 40, damage: 1.0, element: 'none', desc: 'Rain of arrows, all enemies.', target: 'all' },
  
  // BASE MAGE
  fireball: { name: 'Fireball', mpCost: 20, damage: 1.8, element: 'fire', desc: 'Fire blast, single target.', effect: 'burn' },
  iceSpear: { name: 'Ice Spear', mpCost: 25, damage: 1.5, element: 'ice', desc: 'Ice pierce, single target.' },
  manaShield: { name: 'Mana Shield', mpCost: 35, damage: 0, element: 'none', desc: 'Magical barrier.', effect: '-40% dmg 3t' },
  thunderbolt: { name: 'Thunderbolt', mpCost: 30, damage: 2.2, element: 'lightning', desc: 'Lightning strike.' },
  blizzard: { name: 'Blizzard', mpCost: 45, damage: 1.0, element: 'ice', desc: 'Ice storm, all enemies.', target: 'all' },
  meteor: { name: 'Meteor', mpCost: 55, damage: 1.4, element: 'fire', desc: 'Meteor strike, all enemies.', target: 'all' },
  
  // HIDDEN CLASS SKILLS (abbreviated)
  flameSlash: { name: 'Flame Slash', mpCost: 15, damage: 1.8, element: 'fire', desc: 'Fire-infused slash.', effect: 'burn' },
  infernoStrike: { name: 'Inferno Strike', mpCost: 25, damage: 2.8, element: 'fire', desc: 'Powerful fire strike.' },
  fireAura: { name: 'Fire Aura', mpCost: 20, damage: 0, element: 'fire', desc: 'Fire aura buff.', effect: '+30% P.DMG 3t' },
  volcanicRage: { name: 'Volcanic Rage', mpCost: 40, damage: 3.5, element: 'fire', desc: 'Massive fire eruption.', effect: 'burn' },
  rageSlash: { name: 'Rage Slash', mpCost: 10, damage: 2.0, element: 'none', desc: 'Furious slash.', effect: '-5% HP' },
  bloodFury: { name: 'Blood Fury', mpCost: 20, damage: 0, element: 'none', desc: 'Rage mode.', effect: '+50% P.DMG 3t' },
  holyStrike: { name: 'Holy Strike', mpCost: 12, damage: 1.6, element: 'holy', desc: 'Holy attack.' },
  divineShield: { name: 'Divine Shield', mpCost: 18, damage: 0, element: 'holy', desc: 'Divine protection.', effect: 'shield' },
  healingLight: { name: 'Healing Light', mpCost: 20, damage: 0, element: 'holy', desc: 'Heal 35% HP.', effect: 'heal 35%' },
  shadowStrike: { name: 'Shadow Strike', mpCost: 12, damage: 2.2, element: 'dark', desc: 'Strike from shadows.' },
  vanish: { name: 'Vanish', mpCost: 20, damage: 0, element: 'dark', desc: 'Go invisible.', effect: 'stealth' },
  assassinate: { name: 'Assassinate', mpCost: 15, damage: 3.0, element: 'none', desc: 'Execute attack.' },
  lightningArrow: { name: 'Lightning Arrow', mpCost: 14, damage: 2.0, element: 'lightning', desc: 'Electric arrow.' },
  flameArrow: { name: 'Flame Arrow', mpCost: 12, damage: 1.8, element: 'fire', desc: 'Fire arrow.', effect: 'burn' },
  iceArrow: { name: 'Ice Arrow', mpCost: 12, damage: 1.6, element: 'ice', desc: 'Freezing arrow.' },
  frostBolt: { name: 'Frost Bolt', mpCost: 12, damage: 1.6, element: 'ice', desc: 'Ice bolt.' },
  flameBurst: { name: 'Flame Burst', mpCost: 12, damage: 1.8, element: 'fire', desc: 'Fire explosion.', effect: 'burn' },
  lightningBolt: { name: 'Lightning Bolt', mpCost: 14, damage: 1.8, element: 'lightning', desc: 'Lightning strike.' },
  darkBolt: { name: 'Dark Bolt', mpCost: 12, damage: 1.6, element: 'dark', desc: 'Dark attack.', effect: 'lifesteal' },
  arcaneMissile: { name: 'Arcane Missile', mpCost: 10, damage: 0.6, hits: 3, element: 'none', desc: '3 magic missiles.' }
};

const ELEMENT_ICONS = {
  fire: '🔥', ice: '❄️', lightning: '⚡', earth: '🌍', nature: '🌿', dark: '🌑', holy: '✨', none: ''
};

const HIDDEN_CLASS_ICONS = {
  flameblade: '🔥', berserker: '💢', paladin: '✨', earthshaker: '🌍', frostguard: '❄️',
  shadowDancer: '🌑', venomancer: '🌿', assassin: '🗡️', phantom: '👻', bloodreaper: '🩸',
  stormRanger: '⚡', pyroArcher: '🔥', frostSniper: '❄️', natureWarden: '🌿', voidHunter: '🌑',
  frostWeaver: '❄️', pyromancer: '🔥', stormcaller: '⚡', necromancer: '💀', arcanist: '✨'
};

const StatBar = ({ label, current, max, color, icon }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-sm">
      <span className="text-gray-400 flex items-center gap-1">{icon} {label}</span>
      <span className={color}>{current} / {max}</span>
    </div>
    <div className="h-3 bg-void-900 rounded-full overflow-hidden">
      <div className={`h-full ${color === 'text-green-400' ? 'bg-green-500' : 'bg-blue-500'} transition-all`} style={{ width: `${(current/max)*100}%` }}></div>
    </div>
  </div>
);

const EnergyBar = ({ energy }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-sm">
      <span className="text-gray-400">⚡ ENERGY</span>
      <span className="text-amber-400">{energy} / 100</span>
    </div>
    <div className="h-2 bg-void-900 rounded-full overflow-hidden">
      <div className="h-full bg-gradient-to-r from-amber-500 to-amber-400" style={{ width: `${energy}%` }}></div>
    </div>
  </div>
);

const ExpBar = ({ exp, expToLevel, level }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-xs">
      <span className="text-gray-500">Level {level}</span>
      <span className="text-purple-400">{exp} / {expToLevel} EXP</span>
    </div>
    <div className="h-2 bg-void-900 rounded-full overflow-hidden">
      <div className="h-full bg-gradient-to-r from-purple-600 to-purple-400" style={{ width: `${(exp/expToLevel)*100}%` }}></div>
    </div>
  </div>
);

const calculateDerivedStats = (stats, level = 1) => {
  if (!stats) return null;
  return {
    pDmg: 5 + (stats.str || 0) * 3,
    mDmg: 5 + (stats.int || 0) * 4,
    pDef: (stats.str || 0) * 1 + (stats.vit || 0) * 2,
    mDef: (stats.vit || 0) * 1 + (stats.int || 0) * 1,
    critRate: 5 + (stats.agi || 0) * 0.5,
    critDmg: 150 + (stats.dex || 0) * 1,
    accuracy: 90 + (stats.dex || 0) * 0.5,
    evasion: (stats.agi || 0) * 0.3
  };
};

export default function GamePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [character, setCharacter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('status');
  const [gameLog, setGameLog] = useState([]);
  const [showStatModal, setShowStatModal] = useState(false);
  const [pendingStats, setPendingStats] = useState({ str: 0, agi: 0, dex: 0, int: 0, vit: 0 });
  const [isResting, setIsResting] = useState(false);
  const [isInTower, setIsInTower] = useState(false);
  const [showCombatStats, setShowCombatStats] = useState(false);
  const [showActivityLog, setShowActivityLog] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchCharacter();
  }, [user, navigate]);

  useEffect(() => {
    if (character) setIsInTower(character.isInTower || false);
  }, [character]);

  useEffect(() => {
    if (isInTower) {
      const interval = setInterval(fetchCharacter, 30000);
      return () => clearInterval(interval);
    }
  }, [isInTower]);

  const fetchCharacter = async () => {
    try {
      const { data } = await characterAPI.get();
      setCharacter(data);
      if (gameLog.length === 0) {
        addLog('system', 'Welcome to Awakened Protocol: Zero');
        addLog('info', `Hunter ${data.name} has entered the realm.`);
      }
    } catch (error) {
      if (error.response?.status === 404) navigate('/create');
      else console.error('Error fetching character:', error);
    } finally {
      setLoading(false);
    }
  };

  const addLog = (type, message) => {
    setGameLog(prev => [...prev.slice(-49), { type, message, timestamp: new Date() }]);
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const handleRest = async () => {
    if (isInTower) { addLog('error', 'Cannot rest while inside tower!'); return; }
    setIsResting(true);
    try {
      const { data } = await characterAPI.rest();
      setCharacter(data.character);
      addLog('success', data.message);
    } catch (error) {
      addLog('error', error.response?.data?.error || 'Rest failed');
    } finally {
      setIsResting(false);
    }
  };

  const handleAllocateStats = async () => {
    const total = Object.values(pendingStats).reduce((a, b) => a + b, 0);
    if (total === 0) return;
    try {
      const { data } = await characterAPI.allocateStats(pendingStats);
      setCharacter(data.character);
      setPendingStats({ str: 0, agi: 0, dex: 0, int: 0, vit: 0 });
      setShowStatModal(false);
      addLog('success', 'Stats allocated!');
    } catch (error) {
      addLog('error', error.response?.data?.error || 'Failed to allocate stats');
    }
  };

  const updateLocalCharacter = (updates) => {
    setCharacter(prev => {
      if (!prev) return prev;
      const updated = { ...prev };
      if (updates.stats) updated.stats = { ...prev.stats, ...updates.stats };
      if (updates.energy !== undefined) updated.energy = updates.energy;
      if (updates.gold !== undefined) updated.gold = updates.gold;
      if (updates.experience !== undefined) updated.experience = updates.experience;
      return updated;
    });
  };

  const handleTowerStateChange = (inTower) => setIsInTower(inTower);

  if (loading) return <div className="min-h-screen bg-void-900 flex items-center justify-center"><div className="text-purple-400">Loading...</div></div>;
  if (!character) return null;

  const derivedStats = calculateDerivedStats(character.stats, character.level);
  const restCost = character.level * 250;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-void-800 border-b border-purple-500/20 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-xl text-purple-400">APZ</h1>
            <span className="hidden md:block text-gray-400 text-sm">| Awakened Protocol: Zero</span>
          </div>
          <button onClick={handleLogout} className="text-gray-400 hover:text-red-400 text-sm">Logout</button>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* LEFT SIDEBAR */}
        <aside className="lg:w-80 bg-void-800/50 border-b lg:border-b-0 lg:border-r border-purple-500/10 p-4">
          <div className="text-center mb-6">
            <div className="w-24 h-24 mx-auto mb-3 rounded-full bg-gradient-to-br from-purple-600/30 to-purple-800/30 border-2 border-purple-500/30 flex items-center justify-center text-5xl">
              {CLASS_ICONS[character.baseClass]}
            </div>
            <h2 className="font-display text-xl text-white">{character.name}</h2>
            <p className={`text-sm ${CLASS_COLORS[character.baseClass]} capitalize`}>
              {character.hiddenClass !== 'none' ? `${HIDDEN_CLASS_ICONS[character.hiddenClass] || ''} ${character.hiddenClass}` : character.baseClass}
            </p>
          </div>

          <div className="mb-4"><ExpBar exp={character.experience} expToLevel={character.experienceToNextLevel} level={character.level}/></div>
          
          <div className="space-y-3 mb-4">
            <StatBar label="HP" current={character.stats.hp} max={character.stats.maxHp} color="text-green-400" icon="❤️"/>
            <StatBar label="MP" current={character.stats.mp} max={character.stats.maxMp} color="text-blue-400" icon="💎"/>
          </div>

          <div className="mb-4">
            <EnergyBar energy={character.energy} />
            <p className="text-xs text-gray-600 mt-1">+25 energy per hour</p>
          </div>

          <button onClick={handleRest} disabled={isResting || character.stats.hp >= character.stats.maxHp || isInTower} 
            className={`w-full btn-secondary text-sm py-2 disabled:opacity-50 ${isInTower ? 'cursor-not-allowed' : ''}`}>
            {isResting ? 'Resting...' : `🛏️ Rest (${restCost}g)`}
          </button>
          {isInTower && <p className="text-xs text-red-400 text-center mt-1">⚠️ Leave tower to rest</p>}

          {/* COLLAPSIBLE ACTIVITY LOG */}
          <div className="mt-4">
            <button onClick={() => setShowActivityLog(!showActivityLog)} 
              className="w-full flex items-center justify-between text-gray-400 text-sm py-2 px-2 bg-void-900/50 rounded hover:bg-void-900 transition-colors">
              <span>📜 Activity Log</span>
              <span>{showActivityLog ? '▼' : '▶'}</span>
            </button>
            {showActivityLog && (
              <div className="mt-2 h-32 bg-void-900/50 rounded-lg p-2 overflow-y-auto">
                <div className="font-mono text-xs space-y-1">
                  {gameLog.slice(-20).map((log, i) => (
                    <div key={i} className={log.type === 'system' ? 'text-purple-400' : log.type === 'success' ? 'text-green-400' : log.type === 'error' ? 'text-red-400' : 'text-gray-400'}>
                      <span className="text-gray-600 mr-1">[{log.timestamp.toLocaleTimeString()}]</span>
                      {log.message}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 flex flex-col">
          <nav className="bg-void-800/30 border-b border-purple-500/10">
            <div className="flex">
              {[
                { id: 'status', label: '📊 Status', disabledInTower: false },
                { id: 'tower', label: '🗼 Tower', disabledInTower: false },
                { id: 'inventory', label: '🎒 Items', disabledInTower: false },
                { id: 'tavern', label: '🍺 Tavern', disabledInTower: true }
              ].map(tab => {
                const isDisabled = isInTower && tab.disabledInTower;
                return (
                  <button key={tab.id} onClick={() => !isDisabled && setActiveTab(tab.id)} 
                    className={`flex-1 py-3 px-4 text-sm transition-colors ${activeTab === tab.id ? 'text-purple-400 border-b-2 border-purple-500 bg-purple-500/5' : isDisabled ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 hover:text-purple-300'}`}>
                    {tab.label} {isDisabled && '🔒'}
                  </button>
                );
              })}
            </div>
          </nav>

          <div className="flex-1 p-4 overflow-y-auto bg-void-900/50">
            {/* ============ STATUS TAB (Combined) ============ */}
            {activeTab === 'status' && (
              <div className="max-w-4xl mx-auto space-y-6">
                {/* Hunter Status */}
                <div className="bg-void-800/50 rounded-xl p-6 neon-border">
                  <h3 className="font-display text-lg text-purple-400 mb-4">HUNTER STATUS</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="p-3 bg-void-900/50 rounded-lg"><span className="text-gray-500 block">Name</span><span className="text-white">{character.name}</span></div>
                    <div className="p-3 bg-void-900/50 rounded-lg"><span className="text-gray-500 block">Class</span><span className={CLASS_COLORS[character.baseClass]}>{CLASS_ICONS[character.baseClass]} {character.baseClass}</span></div>
                    <div className="p-3 bg-void-900/50 rounded-lg"><span className="text-gray-500 block">Level</span><span className="text-amber-400">{character.level}</span></div>
                    <div className="p-3 bg-void-900/50 rounded-lg"><span className="text-gray-500 block">Gold</span><span className="text-amber-400">💰 {character.gold}</span></div>
                    <div className="p-3 bg-void-900/50 rounded-lg"><span className="text-gray-500 block">Tower</span><span className="text-white">{character.currentTower}</span></div>
                    <div className="p-3 bg-void-900/50 rounded-lg"><span className="text-gray-500 block">Floor</span><span className="text-white">{character.currentFloor}</span></div>
                    <div className="p-3 bg-void-900/50 rounded-lg"><span className="text-gray-500 block">Hidden Class</span><span className={character.hiddenClass !== 'none' ? 'text-purple-400' : 'text-gray-600'}>{character.hiddenClass !== 'none' ? character.hiddenClass : 'None'}</span></div>
                    <div className="p-3 bg-void-900/50 rounded-lg"><span className="text-gray-500 block">Crystals</span><span className="text-cyan-400">💎 {character.memoryCrystals}</span></div>
                  </div>
                </div>

                {/* Statistics */}
                <div className="bg-void-800/50 rounded-xl p-6 neon-border">
                  <h3 className="font-display text-lg text-purple-400 mb-4">📈 STATISTICS</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-void-900/50 rounded-lg"><div className="text-2xl font-bold text-red-400">{character.statistics?.totalKills || 0}</div><div className="text-xs text-gray-500">Total Kills</div></div>
                    <div className="text-center p-3 bg-void-900/50 rounded-lg"><div className="text-2xl font-bold text-purple-400">{character.statistics?.bossKills || 0}</div><div className="text-xs text-gray-500">Boss Kills</div></div>
                    <div className="text-center p-3 bg-void-900/50 rounded-lg"><div className="text-2xl font-bold text-blue-400">{character.statistics?.floorsCleared || 0}</div><div className="text-xs text-gray-500">Floors Cleared</div></div>
                    <div className="text-center p-3 bg-void-900/50 rounded-lg"><div className="text-2xl font-bold text-amber-400">{character.statistics?.deaths || 0}</div><div className="text-xs text-gray-500">Deaths</div></div>
                  </div>
                </div>

                {/* Stats + Combat Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Base Stats */}
                  <div className="bg-void-800/50 rounded-xl p-6 neon-border">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-display text-lg text-purple-400">📊 STATS</h3>
                      {character.statPoints > 0 && (
                        <button onClick={() => setShowStatModal(true)} className="px-3 py-1 bg-purple-600 hover:bg-purple-500 rounded text-xs">
                          +{character.statPoints} Points
                        </button>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between p-2 bg-void-900/50 rounded"><span className="text-gray-400">STR</span><span className="text-red-400 font-bold">{character.stats.str}</span></div>
                      <div className="flex justify-between p-2 bg-void-900/50 rounded"><span className="text-gray-400">AGI</span><span className="text-indigo-400 font-bold">{character.stats.agi}</span></div>
                      <div className="flex justify-between p-2 bg-void-900/50 rounded"><span className="text-gray-400">DEX</span><span className="text-green-400 font-bold">{character.stats.dex}</span></div>
                      <div className="flex justify-between p-2 bg-void-900/50 rounded"><span className="text-gray-400">INT</span><span className="text-purple-400 font-bold">{character.stats.int}</span></div>
                      <div className="flex justify-between p-2 bg-void-900/50 rounded"><span className="text-gray-400">VIT</span><span className="text-amber-400 font-bold">{character.stats.vit}</span></div>
                    </div>
                  </div>

                  {/* Combat Stats */}
                  <div className="bg-void-800/50 rounded-xl p-6 neon-border">
                    <h3 className="font-display text-lg text-purple-400 mb-4">⚔️ COMBAT STATS</h3>
                    {derivedStats && (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between p-2 bg-void-900/50 rounded"><span className="text-gray-400">P.ATK</span><span className="text-orange-400">{derivedStats.pDmg}</span></div>
                        <div className="flex justify-between p-2 bg-void-900/50 rounded"><span className="text-gray-400">M.ATK</span><span className="text-cyan-400">{derivedStats.mDmg}</span></div>
                        <div className="flex justify-between p-2 bg-void-900/50 rounded"><span className="text-gray-400">P.DEF</span><span className="text-amber-400">{derivedStats.pDef}</span></div>
                        <div className="flex justify-between p-2 bg-void-900/50 rounded"><span className="text-gray-400">Crit Rate</span><span className="text-yellow-400">{derivedStats.critRate.toFixed(1)}%</span></div>
                        <div className="flex justify-between p-2 bg-void-900/50 rounded"><span className="text-gray-400">Crit DMG</span><span className="text-red-400">{derivedStats.critDmg}%</span></div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Skills */}
                <div className="bg-void-800/50 rounded-xl p-6 neon-border">
                  <h3 className="font-display text-lg text-purple-400 mb-4">⚡ SKILLS ({character.skills?.length || 0})</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {character.skills?.map((skill, index) => {
                      const skillData = SKILL_DATABASE[skill.skillId] || {};
                      const elementIcon = ELEMENT_ICONS[skillData.element] || '';
                      let dmgText = '';
                      if (skillData.damage > 0) {
                        const dmgPercent = Math.round(skillData.damage * 100);
                        const dmgType = ['fire', 'ice', 'lightning', 'dark', 'holy', 'nature'].includes(skillData.element) ? 'MDmg' : 'PDmg';
                        dmgText = skillData.hits > 1 ? `${skillData.hits}x${dmgPercent}% ${dmgType}` : `${dmgPercent}% ${dmgType}`;
                      }
                      return (
                        <div key={index} className="p-4 rounded-lg border bg-void-900/50 border-purple-500/30">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-white">{elementIcon} {skillData.name || skill.name}</h4>
                            <span className="text-xs px-2 py-1 rounded bg-blue-600/30 text-blue-400">{skillData.mpCost}MP</span>
                          </div>
                          <p className="text-sm text-gray-400 mb-2">{skillData.desc}</p>
                          <div className="flex flex-wrap gap-2">
                            {dmgText && <span className={`text-xs px-2 py-0.5 rounded ${['fire','ice','lightning','dark','holy','nature'].includes(skillData.element) ? 'bg-cyan-500/20 text-cyan-400' : 'bg-orange-500/20 text-orange-400'}`}>{dmgText}</span>}
                            {skillData.effect && <span className="text-xs px-2 py-0.5 bg-purple-500/20 rounded text-purple-400">{skillData.effect}</span>}
                            {skillData.target === 'all' && <span className="text-xs px-2 py-0.5 bg-purple-500/20 rounded text-purple-300">AOE</span>}
                          </div>
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

            {/* TOWER TAB */}
            {activeTab === 'tower' && (
              <div className="max-w-4xl mx-auto">
                <TowerPanel character={character} onCharacterUpdate={fetchCharacter} updateLocalCharacter={updateLocalCharacter} addLog={addLog} onTowerStateChange={handleTowerStateChange}/>
              </div>
            )}

            {/* INVENTORY TAB */}
            {activeTab === 'inventory' && (
              <div className="max-w-4xl mx-auto">
                <InventoryPanel character={character} onCharacterUpdate={fetchCharacter} addLog={addLog}/>
              </div>
            )}

            {/* TAVERN TAB */}
            {activeTab === 'tavern' && !isInTower && (
              <div className="max-w-6xl mx-auto">
                <TavernPanel character={character} onCharacterUpdate={fetchCharacter} addLog={addLog}/>
              </div>
            )}
            {activeTab === 'tavern' && isInTower && (
              <div className="max-w-4xl mx-auto text-center py-12">
                <div className="bg-void-800/50 rounded-xl p-8 neon-border">
                  <h3 className="font-display text-xl text-red-400 mb-2">Tavern Locked</h3>
                  <p className="text-gray-400">Leave the tower to access the tavern.</p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* STAT ALLOCATION MODAL */}
      {showStatModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-void-800 rounded-xl p-6 w-full max-w-md neon-border">
            <h2 className="font-display text-xl text-purple-400 mb-4">Allocate Stats</h2>
            <p className="text-gray-400 mb-4">Points: <span className="text-purple-400">{character.statPoints - Object.values(pendingStats).reduce((a,b)=>a+b,0)}</span></p>
            <div className="space-y-3">
              {[{id:'str',name:'STR',color:'text-red-400'},{id:'agi',name:'AGI',color:'text-indigo-400'},{id:'dex',name:'DEX',color:'text-green-400'},{id:'int',name:'INT',color:'text-purple-400'},{id:'vit',name:'VIT',color:'text-amber-400'}].map(stat => (
                <div key={stat.id} className="flex items-center justify-between">
                  <span className={stat.color}>{stat.name}: {character.stats[stat.id]}{pendingStats[stat.id] > 0 && <span className="text-green-400"> +{pendingStats[stat.id]}</span>}</span>
                  <div className="flex gap-2">
                    <button onClick={() => setPendingStats(p => ({...p, [stat.id]: Math.max(0, p[stat.id]-1)}))} disabled={pendingStats[stat.id] <= 0} className="w-8 h-8 bg-void-900 rounded disabled:opacity-30">-</button>
                    <button onClick={() => setPendingStats(p => ({...p, [stat.id]: p[stat.id]+1}))} disabled={Object.values(pendingStats).reduce((a,b)=>a+b,0) >= character.statPoints} className="w-8 h-8 bg-void-900 rounded disabled:opacity-30">+</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => {setShowStatModal(false);setPendingStats({str:0,agi:0,dex:0,int:0,vit:0});}} className="flex-1 btn-secondary py-2">Cancel</button>
              <button onClick={handleAllocateStats} disabled={Object.values(pendingStats).reduce((a,b)=>a+b,0)===0} className="flex-1 btn-primary py-2 disabled:opacity-50">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
