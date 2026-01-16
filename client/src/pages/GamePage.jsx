import React, { useState, useEffect, useCallback, useRef } from 'react';
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
// PHASE 7: Complete Skill Database for Display
// ============================================================
const SKILL_DATABASE = {
  // ==================== BASE SWORDSMAN ====================
  slash: { name: 'Slash', mpCost: 5, damage: 1.2, element: 'none', desc: 'Quick slash attack. Low cost, decent DMG.' },
  heavyStrike: { name: 'Heavy Strike', mpCost: 12, damage: 1.8, element: 'none', desc: 'Powerful overhead strike. High single-target DMG.' },
  shieldBash: { name: 'Shield Bash', mpCost: 8, damage: 1.0, element: 'none', desc: 'Bash with shield. Reduces enemy ATK by 15%.', effect: '-15% ATK' },
  warCry: { name: 'War Cry', mpCost: 15, damage: 0, element: 'none', desc: 'Battle cry. +25% P.DMG for 3 turns.', effect: '+25% P.DMG' },
  
  // ==================== BASE THIEF ====================
  backstab: { name: 'Backstab', mpCost: 8, damage: 2.0, element: 'none', desc: 'Strike from behind. +30% crit chance.', effect: '+30% crit' },
  poisonBlade: { name: 'Poison Blade', mpCost: 10, damage: 1.0, element: 'nature', desc: 'Poisoned attack. DoT for 3 turns.', effect: 'poison' },
  smokeScreen: { name: 'Smoke Screen', mpCost: 12, damage: 0, element: 'none', desc: 'Create smoke. +40% evasion for 2 turns.', effect: '+40% evasion' },
  steal: { name: 'Steal', mpCost: 5, damage: 0, element: 'none', desc: 'Attempt to steal 5-15% gold from enemy.', effect: 'gold steal' },
  
  // ==================== BASE ARCHER ====================
  preciseShot: { name: 'Precise Shot', mpCost: 6, damage: 1.5, element: 'none', desc: 'Aimed shot. Never misses, bonus DMG.' },
  multiShot: { name: 'Multi Shot', mpCost: 14, damage: 0.6, hits: 3, element: 'none', desc: 'Fire 3 arrows at once.' },
  eagleEye: { name: 'Eagle Eye', mpCost: 10, damage: 0, element: 'none', desc: 'Focus aim. +25% crit, +20% crit DMG for 3 turns.', effect: '+25% crit' },
  arrowRain: { name: 'Arrow Rain', mpCost: 20, damage: 2.2, element: 'none', desc: 'Rain of arrows. High DMG attack.' },
  
  // ==================== BASE MAGE ====================
  fireball: { name: 'Fireball', mpCost: 10, damage: 1.6, element: 'fire', desc: 'Hurl a fireball. Burns for 3 turns.', effect: 'burn' },
  iceSpear: { name: 'Ice Spear', mpCost: 12, damage: 1.4, element: 'ice', desc: 'Ice projectile. -20% enemy ATK.', effect: '-20% ATK' },
  manaShield: { name: 'Mana Shield', mpCost: 15, damage: 0, element: 'none', desc: 'Create shield equal to 50% of current MP.', effect: 'shield' },
  thunderbolt: { name: 'Thunderbolt', mpCost: 18, damage: 2.0, element: 'lightning', desc: 'Lightning strike. High magic DMG.' },
  
  // Hidden class skills... (keeping them for reference but truncating for brevity)
  flameSlash: { name: 'Flame Slash', mpCost: 15, damage: 1.8, element: 'fire', desc: 'Fire-infused slash. Applies burn.', effect: 'burn' },
  infernoStrike: { name: 'Inferno Strike', mpCost: 25, damage: 2.8, element: 'fire', desc: 'Powerful fire strike. High single-target DMG.' },
  fireAura: { name: 'Fire Aura', mpCost: 20, damage: 0, element: 'fire', desc: '+30% P.DMG, reflect 15% DMG for 3 turns.', effect: '+30% P.DMG' },
  volcanicRage: { name: 'Volcanic Rage', mpCost: 40, damage: 3.5, element: 'fire', desc: 'Massive fire eruption + burn.', effect: 'burn' },
  rageSlash: { name: 'Rage Slash', mpCost: 10, damage: 2.0, element: 'none', desc: 'Furious slash. Costs 5% HP.', effect: '-5% HP' },
  bloodFury: { name: 'Blood Fury', mpCost: 20, damage: 0, element: 'none', desc: '+50% P.DMG, -20% DEF for 3 turns.', effect: '+50% P.DMG' },
  recklessCharge: { name: 'Reckless Charge', mpCost: 15, damage: 2.5, element: 'none', desc: 'Charging attack. Costs 10% HP.', effect: '-10% HP' },
  deathwish: { name: 'Deathwish', mpCost: 35, damage: 4.0, element: 'none', desc: 'Ultimate attack. Costs 20% HP.', effect: '-20% HP' },
  holyStrike: { name: 'Holy Strike', mpCost: 12, damage: 1.6, element: 'holy', desc: 'Holy-infused attack. Bonus vs undead.' },
  divineShield: { name: 'Divine Shield', mpCost: 18, damage: 0, element: 'holy', desc: 'Shield = 200% P.DEF.', effect: 'shield' },
  healingLight: { name: 'Healing Light', mpCost: 20, damage: 0, element: 'holy', desc: 'Heal 35% of max HP.', effect: 'heal 35%' },
  judgment: { name: 'Judgment', mpCost: 35, damage: 3.0, element: 'holy', desc: 'Divine judgment. Removes debuffs.', effect: 'purify' }
};

// ============================================================
// COMPONENTS
// ============================================================

const StatBar = ({ label, current, max, color, icon }) => {
  const percentage = Math.round((current / max) * 100);
  const getBarColor = () => {
    if (label === 'HP') return percentage > 50 ? 'from-green-500 to-green-400' : percentage > 25 ? 'from-yellow-500 to-yellow-400' : 'from-red-500 to-red-400';
    return 'from-blue-500 to-blue-400';
  };
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className={color}>{icon} {label}</span>
        <span className="text-gray-300">{current} / {max}</span>
      </div>
      <div className="h-3 bg-void-900 rounded-full overflow-hidden">
        <div className={`h-full bg-gradient-to-r ${getBarColor()} stat-bar transition-all duration-300`} style={{ width: `${percentage}%` }}></div>
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

// ============================================================
// PHASE 7: Derived Stats Calculator
// ============================================================
const calculateDerivedStats = (stats, level = 1) => {
  if (!stats) return null;
  
  const derived = {
    pDmg: 5 + (stats.str || 0) * 3,
    mDmg: 5 + (stats.int || 0) * 4,
    pDef: (stats.str || 0) * 1 + (stats.vit || 0) * 2,
    mDef: (stats.vit || 0) * 1 + (stats.int || 0) * 1,
    critRate: 5 + (stats.agi || 0) * 0.5,
    critDmg: 150 + (stats.dex || 0) * 1,
    accuracy: 90 + (stats.dex || 0) * 0.5,
    evasion: (stats.agi || 0) * 0.3,
    hpRegen: Math.floor((stats.vit || 0) * 1),
    mpRegen: Math.floor((stats.int || 0) * 0.5)
  };
  
  // Level bonus (+2% per level)
  const levelBonus = 1 + (level - 1) * 0.02;
  derived.pDmg = Math.floor(derived.pDmg * levelBonus);
  derived.mDmg = Math.floor(derived.mDmg * levelBonus);
  
  // Caps
  derived.critRate = Math.min(derived.critRate, 80);
  derived.accuracy = Math.min(derived.accuracy, 100);
  derived.evasion = Math.min(derived.evasion, 60);
  
  return derived;
};

// Hidden class icons
const HIDDEN_CLASS_ICONS = {
  flameblade: '🔥', berserker: '💢', paladin: '✨', earthshaker: '🌍', frostguard: '❄️',
  shadowDancer: '🌑', venomancer: '🐍', assassin: '⚫', phantom: '👻', bloodreaper: '🩸',
  stormRanger: '⚡', pyroArcher: '🔥', frostSniper: '❄️', natureWarden: '🌿', voidHunter: '🌀',
  frostWeaver: '❄️', pyromancer: '🔥', stormcaller: '⚡', necromancer: '💀', arcanist: '✨'
};

const GamePage = () => {
  const { character, logout, refreshCharacter } = useAuth();
  const [activeTab, setActiveTab] = useState('status');
  const [isResting, setIsResting] = useState(false);
  const [showStatModal, setShowStatModal] = useState(false);
  const [showCombatStats, setShowCombatStats] = useState(false);
  const [pendingStats, setPendingStats] = useState({ str: 0, agi: 0, dex: 0, int: 0, vit: 0 });
  const [isAllocating, setIsAllocating] = useState(false);
  const [isInTower, setIsInTower] = useState(false);
  
  // FIX #1: Local character state for real-time updates
  const [localCharacter, setLocalCharacter] = useState(null);
  
  // FIX #2: Shared game log that TowerPanel can use
  const [gameLog, setGameLog] = useState([
    { type: 'system', message: 'Welcome to Awakened Protocol: Zero', timestamp: new Date() }
  ]);
  
  // FIX #3: Preserve tower state when switching tabs
  const [towerState, setTowerState] = useState(null);
  
  const navigate = useNavigate();
  const logRef = useRef(null);

  // Initialize local character from auth context
  useEffect(() => {
    if (character) {
      setLocalCharacter(character);
      setIsInTower(character.isInTower || false);
      // Add welcome message only once
      if (gameLog.length === 1) {
        setGameLog(prev => [...prev, { 
          type: 'info', 
          message: `Hunter ${character.name} has entered the realm.`, 
          timestamp: new Date() 
        }]);
      }
    }
  }, [character]);

  // Use localCharacter for display, fallback to context character
  const displayCharacter = localCharacter || character;

  // Calculate derived stats for display
  const derivedStats = displayCharacter ? calculateDerivedStats(displayCharacter.stats, displayCharacter.level) : null;

  // Periodic refresh (but don't override local state immediately)
  useEffect(() => {
    const interval = setInterval(async () => {
      const updated = await refreshCharacter();
      if (updated && !isInTower) {
        // Only auto-update if not in tower (to avoid overwriting combat state)
        setLocalCharacter(updated);
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [refreshCharacter, isInTower]);

  // Auto-scroll log
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [gameLog]);

  // FIX #1 & #2: Add log function that updates both local state and can be passed to children
  const addLog = useCallback((type, message) => {
    setGameLog(prev => [...prev, { type, message, timestamp: new Date() }].slice(-100));
  }, []);

  // FIX #1: Update local character state immediately (for real-time HP/MP updates)
  const updateLocalCharacter = useCallback((updates) => {
    setLocalCharacter(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        ...updates,
        stats: updates.stats ? { ...prev.stats, ...updates.stats } : prev.stats
      };
    });
  }, []);

  // FIX #1: Enhanced character update that also refreshes from server
  const handleCharacterUpdate = useCallback(async (immediateUpdates = null) => {
    // Apply immediate updates first for instant UI feedback
    if (immediateUpdates) {
      updateLocalCharacter(immediateUpdates);
    }
    
    // Then refresh from server to get accurate data
    try {
      const updated = await refreshCharacter();
      if (updated) {
        setLocalCharacter(updated);
      }
    } catch (err) {
      console.error('Failed to refresh character:', err);
    }
  }, [refreshCharacter, updateLocalCharacter]);

  const handleRest = async () => {
    if (isInTower) {
      addLog('error', 'Cannot rest while inside a tower! Leave the tower first.');
      return;
    }
    setIsResting(true);
    try {
      const { data } = await characterAPI.rest();
      addLog('success', 'You rest and recover fully. (-' + data.goldSpent + ' gold)');
      await handleCharacterUpdate();
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
      await handleCharacterUpdate();
    } catch (err) {
      addLog('error', err.response?.data?.error || 'Failed to allocate stats');
    }
    setIsAllocating(false);
  };

  const addPendingStat = (stat, amount) => {
    const total = Object.values(pendingStats).reduce((a, b) => a + b, 0);
    const newValue = pendingStats[stat] + amount;
    if (newValue >= 0 && total + amount <= displayCharacter.statPoints) {
      setPendingStats({ ...pendingStats, [stat]: newValue });
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Handler for TowerPanel to update isInTower state
  const handleTowerStateChange = useCallback((inTower) => {
    setIsInTower(inTower);
  }, []);

  // FIX #3: Save/restore tower state when switching tabs
  const handleSaveTowerState = useCallback((state) => {
    setTowerState(state);
  }, []);

  if (!displayCharacter) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  // Calculate rest cost
  const restCost = displayCharacter.level * 250;

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
              {CLASS_ICONS[displayCharacter.baseClass]}
            </div>
            <h2 className="font-display text-xl text-white">{displayCharacter.name}</h2>
            <p className={`text-sm ${CLASS_COLORS[displayCharacter.baseClass]} capitalize`}>
              {displayCharacter.hiddenClass !== 'none' 
                ? `${HIDDEN_CLASS_ICONS[displayCharacter.hiddenClass] || ''} ${displayCharacter.hiddenClass}` 
                : displayCharacter.baseClass}
            </p>
          </div>

          <div className="mb-6">
            <ExpBar exp={displayCharacter.experience} expToLevel={displayCharacter.experienceToNextLevel} level={displayCharacter.level}/>
          </div>

          {/* FIX #1: Use displayCharacter for real-time HP/MP updates */}
          <div className="space-y-3 mb-6">
            <StatBar label="HP" current={displayCharacter.stats.hp} max={displayCharacter.stats.maxHp} color="text-green-400" icon="❤️"/>
            <StatBar label="MP" current={displayCharacter.stats.mp} max={displayCharacter.stats.maxMp} color="text-blue-400" icon="💎"/>
          </div>

          <div className="mb-6">
            <EnergyBar energy={displayCharacter.energy} />
            <p className="text-xs text-gray-600 mt-1">+25 energy per hour</p>
          </div>

          <div className="space-y-2">
            {/* Rest button - disabled when in tower */}
            <button 
              onClick={handleRest} 
              disabled={isResting || displayCharacter.stats.hp >= displayCharacter.stats.maxHp || isInTower} 
              className={`w-full btn-secondary text-sm py-2 disabled:opacity-50 ${isInTower ? 'cursor-not-allowed' : ''}`}
              title={isInTower ? 'Cannot rest while inside tower' : ''}
            >
              {isResting ? 'Resting...' : `🛏️ Rest (${restCost}g)`}
            </button>
            {isInTower && (
              <p className="text-xs text-red-400 text-center">⚠️ Leave tower to rest</p>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-700/50">
            <h3 className="text-gray-400 text-sm mb-3 font-semibold">STATS</h3>
            {displayCharacter.statPoints > 0 && (
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-2 mb-3 text-center">
                <span className="text-purple-400 text-sm">{displayCharacter.statPoints} points available!</span>
                <button onClick={() => setShowStatModal(true)} className="ml-2 px-2 py-1 bg-purple-600 hover:bg-purple-500 rounded text-xs">Allocate</button>
              </div>
            )}
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between p-2 bg-void-900/50 rounded"><span className="text-gray-500">STR</span><span className="text-red-400">{displayCharacter.stats.str}</span></div>
              <div className="flex justify-between p-2 bg-void-900/50 rounded"><span className="text-gray-500">AGI</span><span className="text-indigo-400">{displayCharacter.stats.agi}</span></div>
              <div className="flex justify-between p-2 bg-void-900/50 rounded"><span className="text-gray-500">DEX</span><span className="text-green-400">{displayCharacter.stats.dex}</span></div>
              <div className="flex justify-between p-2 bg-void-900/50 rounded"><span className="text-gray-500">INT</span><span className="text-purple-400">{displayCharacter.stats.int}</span></div>
              <div className="col-span-2 flex justify-between p-2 bg-void-900/50 rounded"><span className="text-gray-500">VIT</span><span className="text-amber-400">{displayCharacter.stats.vit}</span></div>
            </div>
            
            {/* Combat Stats Button */}
            <button 
              onClick={() => setShowCombatStats(true)}
              className="w-full mt-3 py-2 px-3 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-lg text-purple-400 text-sm hover:from-purple-600/30 hover:to-blue-600/30 transition-all flex items-center justify-center gap-2"
            >
              ⚔️ Combat Stats
            </button>
          </div>

          {/* FIX #2: Game Log in Sidebar */}
          <div className="mt-6 pt-6 border-t border-gray-700/50">
            <h3 className="text-gray-400 text-sm mb-3 font-semibold">📜 ACTIVITY LOG</h3>
            <div 
              ref={logRef}
              className="h-32 overflow-y-auto bg-void-900/50 rounded-lg p-2 text-xs space-y-1"
            >
              {gameLog.slice(-20).map((log, i) => (
                <div key={i} className={`${
                  log.type === 'error' ? 'text-red-400' :
                  log.type === 'success' ? 'text-green-400' :
                  log.type === 'combat' ? 'text-yellow-400' :
                  log.type === 'system' ? 'text-purple-400' :
                  'text-gray-400'
                }`}>
                  {log.message}
                </div>
              ))}
            </div>
          </div>
        </aside>

        <main className="flex-1 flex flex-col">
          <nav className="bg-void-800/30 border-b border-purple-500/10">
            <div className="flex">
              {/* Tab order: Status, Inventory, Tavern (disabled in tower), Skills, Tower */}
              {[
                { id: 'status', label: '📊 Status', icon: '📊', disabledInTower: false },
                { id: 'inventory', label: '🎒 Items', icon: '🎒', disabledInTower: false },
                { id: 'tavern', label: '🍺 Tavern', icon: '🍺', disabledInTower: true },
                { id: 'skills', label: '⚡ Skills', icon: '⚡', disabledInTower: false },
                { id: 'tower', label: '🗼 Tower', icon: '🗼', disabledInTower: false }
              ].map(tab => {
                const isDisabled = isInTower && tab.disabledInTower;
                return (
                  <button 
                    key={tab.id} 
                    onClick={() => !isDisabled && setActiveTab(tab.id)} 
                    disabled={isDisabled}
                    className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                      activeTab === tab.id 
                        ? 'text-purple-400 border-b-2 border-purple-500 bg-purple-500/5' 
                        : isDisabled
                          ? 'text-gray-600 cursor-not-allowed opacity-50'
                          : 'text-gray-500 hover:text-gray-300'
                    }`}
                    title={isDisabled ? 'Cannot access while in tower' : ''}
                  >
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.icon}</span>
                    {isDisabled && <span className="ml-1 text-xs">🔒</span>}
                  </button>
                );
              })}
            </div>
          </nav>

          <div className="flex-1 p-4 md:p-6 overflow-auto">
            {/* STATUS TAB */}
            {activeTab === 'status' && (
              <div className="max-w-4xl mx-auto space-y-6">
                {/* Hunter Status Card */}
                <div className="bg-void-800/50 rounded-xl p-6 neon-border">
                  <h3 className="font-display text-lg text-purple-400 mb-4">HUNTER STATUS</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex justify-between py-2 border-b border-gray-700/30">
                        <span className="text-gray-400">Name</span>
                        <span className="text-white">{displayCharacter.name}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-700/30">
                        <span className="text-gray-400">Class</span>
                        <span className={CLASS_COLORS[displayCharacter.baseClass]}>
                          {CLASS_ICONS[displayCharacter.baseClass]} {displayCharacter.baseClass.charAt(0).toUpperCase() + displayCharacter.baseClass.slice(1)}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-700/30">
                        <span className="text-gray-400">Hidden Class</span>
                        <span className={displayCharacter.hiddenClass !== 'none' ? 'text-purple-400' : 'text-gray-600'}>
                          {displayCharacter.hiddenClass !== 'none' 
                            ? `${HIDDEN_CLASS_ICONS[displayCharacter.hiddenClass] || ''} ${displayCharacter.hiddenClass}` 
                            : 'Not Unlocked'}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-700/30">
                        <span className="text-gray-400">Level</span>
                        <span className="text-amber-400">{displayCharacter.level}</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between py-2 border-b border-gray-700/30">
                        <span className="text-gray-400">Current Tower</span>
                        <span className="text-white">{displayCharacter.currentTower}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-700/30">
                        <span className="text-gray-400">Current Floor</span>
                        <span className="text-white">{displayCharacter.currentFloor}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-700/30">
                        <span className="text-gray-400">Gold</span>
                        <span className="text-amber-400">💰 {displayCharacter.gold}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-700/30">
                        <span className="text-gray-400">Memory Crystals</span>
                        <span className="text-cyan-400">💎 {displayCharacter.memoryCrystals}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Statistics Card */}
                <div className="bg-void-800/50 rounded-xl p-6 neon-border">
                  <h3 className="font-display text-lg text-purple-400 mb-4">📈 STATISTICS</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-void-900/50 rounded-lg">
                      <div className="text-2xl font-bold text-red-400">{displayCharacter.statistics?.totalKills || 0}</div>
                      <div className="text-xs text-gray-500">Total Kills</div>
                    </div>
                    <div className="text-center p-3 bg-void-900/50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-400">{displayCharacter.statistics?.bossKills || 0}</div>
                      <div className="text-xs text-gray-500">Boss Kills</div>
                    </div>
                    <div className="text-center p-3 bg-void-900/50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-400">{displayCharacter.statistics?.floorsCleared || 0}</div>
                      <div className="text-xs text-gray-500">Floors Cleared</div>
                    </div>
                    <div className="text-center p-3 bg-void-900/50 rounded-lg">
                      <div className="text-2xl font-bold text-amber-400">{displayCharacter.statistics?.scrollsFound || 0}</div>
                      <div className="text-xs text-gray-500">Scrolls Found</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'tower' && (
              <div className="max-w-4xl mx-auto">
                {/* FIX #1, #2, #3: Pass all necessary props to TowerPanel */}
                <TowerPanel 
                  character={displayCharacter} 
                  onCharacterUpdate={handleCharacterUpdate}
                  updateLocalCharacter={updateLocalCharacter}
                  addLog={addLog}
                  onTowerStateChange={handleTowerStateChange}
                  savedState={towerState}
                  onSaveState={handleSaveTowerState}
                />
              </div>
            )}

            {activeTab === 'inventory' && (
              <div className="max-w-4xl mx-auto">
                <InventoryPanel 
                  character={displayCharacter} 
                  onCharacterUpdate={handleCharacterUpdate}
                  addLog={addLog}
                />
              </div>
            )}

            {activeTab === 'tavern' && !isInTower && (
              <div className="max-w-4xl mx-auto">
                <TavernPanel 
                  character={displayCharacter} 
                  onCharacterUpdate={handleCharacterUpdate}
                  addLog={addLog}
                />
              </div>
            )}

            {activeTab === 'tavern' && isInTower && (
              <div className="max-w-4xl mx-auto">
                <div className="bg-void-800/50 rounded-xl p-6 neon-border text-center">
                  <div className="text-6xl mb-4">🔒</div>
                  <h3 className="font-display text-xl text-red-400 mb-2">Tavern Locked</h3>
                  <p className="text-gray-400">You cannot access the tavern while inside a tower.</p>
                  <p className="text-gray-500 text-sm mt-2">Leave the tower first to buy, sell, or trade items.</p>
                </div>
              </div>
            )}

            {/* SKILLS TAB */}
            {activeTab === 'skills' && (
              <div className="max-w-4xl mx-auto space-y-6">
                <div className="bg-void-800/50 rounded-xl p-6 neon-border">
                  <h3 className="font-display text-lg text-purple-400 mb-4">⚡ SKILLS</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(displayCharacter.skills || []).map((skill, i) => {
                      const skillInfo = SKILL_DATABASE[skill.skillId] || {};
                      return (
                        <div key={i} className="p-4 bg-void-900/50 rounded-lg border border-purple-500/20 hover:border-purple-500/40 transition-colors">
                          <div className="flex items-start justify-between mb-2">
                            <span className="font-medium text-white">{skill.name}</span>
                            <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded">
                              {skillInfo.mpCost || '?'} MP
                            </span>
                          </div>
                          <p className="text-sm text-gray-400">{skillInfo.desc || 'No description'}</p>
                          {skillInfo.effect && (
                            <div className="mt-2 text-xs text-purple-400">Effect: {skillInfo.effect}</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Stat Allocation Modal */}
      {showStatModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-void-800 rounded-xl p-6 w-full max-w-md neon-border">
            <h2 className="font-display text-xl text-purple-400 mb-4">Allocate Stats</h2>
            <p className="text-gray-400 text-sm mb-4">
              Available Points: <span className="text-purple-400 font-bold">{displayCharacter.statPoints - Object.values(pendingStats).reduce((a, b) => a + b, 0)}</span>
            </p>
            
            <div className="space-y-3">
              {['str', 'agi', 'dex', 'int', 'vit'].map(stat => (
                <div key={stat} className="flex items-center justify-between p-3 bg-void-900/50 rounded-lg">
                  <span className="text-gray-300 uppercase font-medium">{stat}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400">{displayCharacter.stats[stat]}</span>
                    {pendingStats[stat] > 0 && (
                      <span className="text-green-400">+{pendingStats[stat]}</span>
                    )}
                    <div className="flex gap-1">
                      <button 
                        onClick={() => addPendingStat(stat, -1)} 
                        disabled={pendingStats[stat] <= 0}
                        className="w-8 h-8 bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 rounded text-red-400 disabled:opacity-30"
                      >-</button>
                      <button 
                        onClick={() => addPendingStat(stat, 1)} 
                        disabled={Object.values(pendingStats).reduce((a, b) => a + b, 0) >= displayCharacter.statPoints}
                        className="w-8 h-8 bg-green-600/20 hover:bg-green-600/40 border border-green-500/30 rounded text-green-400 disabled:opacity-30"
                      >+</button>
                    </div>
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

      {/* Combat Stats Modal */}
      {showCombatStats && derivedStats && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-void-800 rounded-xl p-6 w-full max-w-lg neon-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl text-purple-400">⚔️ Combat Stats</h2>
              <button 
                onClick={() => setShowCombatStats(false)}
                className="text-gray-400 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>
            
            {/* Offensive Stats */}
            <div className="mb-4">
              <h3 className="text-sm text-gray-500 mb-2 font-semibold">OFFENSIVE</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-void-900/50 rounded-lg border border-red-500/20">
                  <div className="text-2xl font-bold text-red-400">{derivedStats.pDmg}</div>
                  <div className="text-xs text-gray-500">⚔️ Physical DMG</div>
                </div>
                <div className="p-3 bg-void-900/50 rounded-lg border border-purple-500/20">
                  <div className="text-2xl font-bold text-purple-400">{derivedStats.mDmg}</div>
                  <div className="text-xs text-gray-500">✨ Magic DMG</div>
                </div>
                <div className="p-3 bg-void-900/50 rounded-lg border border-yellow-500/20">
                  <div className="text-2xl font-bold text-yellow-400">{derivedStats.critRate.toFixed(1)}%</div>
                  <div className="text-xs text-gray-500">🎯 Crit Rate</div>
                </div>
                <div className="p-3 bg-void-900/50 rounded-lg border border-orange-500/20">
                  <div className="text-2xl font-bold text-orange-400">{derivedStats.critDmg}%</div>
                  <div className="text-xs text-gray-500">💥 Crit DMG</div>
                </div>
              </div>
            </div>
            
            {/* Defensive Stats */}
            <div className="mb-4">
              <h3 className="text-sm text-gray-500 mb-2 font-semibold">DEFENSIVE</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-void-900/50 rounded-lg border border-gray-500/20">
                  <div className="text-2xl font-bold text-gray-300">{derivedStats.pDef}</div>
                  <div className="text-xs text-gray-500">🛡️ Physical DEF</div>
                </div>
                <div className="p-3 bg-void-900/50 rounded-lg border border-indigo-500/20">
                  <div className="text-2xl font-bold text-indigo-400">{derivedStats.mDef}</div>
                  <div className="text-xs text-gray-500">🔰 Magic DEF</div>
                </div>
                <div className="p-3 bg-void-900/50 rounded-lg border border-cyan-500/20">
                  <div className="text-2xl font-bold text-cyan-400">{derivedStats.evasion.toFixed(1)}%</div>
                  <div className="text-xs text-gray-500">💨 Evasion</div>
                </div>
                <div className="p-3 bg-void-900/50 rounded-lg border border-blue-500/20">
                  <div className="text-2xl font-bold text-blue-400">{derivedStats.accuracy.toFixed(1)}%</div>
                  <div className="text-xs text-gray-500">👁️ Accuracy</div>
                </div>
              </div>
            </div>
            
            {/* Regen Stats */}
            <div className="mb-4">
              <h3 className="text-sm text-gray-500 mb-2 font-semibold">REGENERATION</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-void-900/50 rounded-lg border border-green-500/20">
                  <div className="text-2xl font-bold text-green-400">{derivedStats.hpRegen}</div>
                  <div className="text-xs text-gray-500">💚 HP Regen/turn</div>
                </div>
                <div className="p-3 bg-void-900/50 rounded-lg border border-blue-500/20">
                  <div className="text-2xl font-bold text-blue-400">{derivedStats.mpRegen}</div>
                  <div className="text-xs text-gray-500">💙 MP Regen/turn</div>
                </div>
              </div>
            </div>
            
            {/* Stat Formulas */}
            <div className="text-xs text-gray-600 space-y-1 border-t border-gray-700/50 pt-3">
              <div className="font-semibold text-gray-500 mb-1">Stat Formulas:</div>
              <div>💪 STR → P.DMG (+3), P.DEF (+1)</div>
              <div>⚡ AGI → Crit Rate (+0.5%), Evasion (+0.3%)</div>
              <div>🎯 DEX → Accuracy (+0.5%), Crit DMG (+1%)</div>
              <div>🔮 INT → M.DMG (+4), M.DEF (+1), MP Regen (+0.5)</div>
              <div>❤️ VIT → P.DEF (+2), M.DEF (+1), HP Regen (+1)</div>
            </div>
            
            <button 
              onClick={() => setShowCombatStats(false)}
              className="w-full mt-4 btn-primary"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GamePage;
