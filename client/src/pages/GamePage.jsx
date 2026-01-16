import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { characterAPI } from '../services/api';
import TowerPanel from '../components/TowerPanel';
import TavernPanel from '../components/TavernPanel';
import InventoryPanel from '../components/InventoryPanel';

const CLASS_ICONS = { swordsman: '⚔️', thief: '🗡️', archer: '🏹', mage: '🔮' };
const CLASS_COLORS = { swordsman: 'text-red-400', thief: 'text-indigo-400', archer: 'text-green-400', mage: 'text-purple-400' };

const SKILL_DATABASE = {
  slash: { name: 'Slash', mpCost: 5, damage: 1.2, damageType: 'physical', element: 'none', desc: 'Quick slash' },
  heavyStrike: { name: 'Heavy Strike', mpCost: 12, damage: 1.8, damageType: 'physical', element: 'none', desc: 'Powerful strike' },
  shieldBash: { name: 'Shield Bash', mpCost: 8, damage: 1.0, damageType: 'physical', element: 'none', desc: 'Bash', effect: '-15% ATK' },
  warCry: { name: 'War Cry', mpCost: 15, damage: 0, damageType: 'buff', element: 'none', desc: 'Battle cry', effect: '+25% P.DMG' },
  backstab: { name: 'Backstab', mpCost: 8, damage: 2.0, damageType: 'physical', element: 'none', desc: 'Strike from behind', effect: '+30% crit' },
  poisonBlade: { name: 'Poison Blade', mpCost: 10, damage: 1.0, damageType: 'physical', element: 'nature', desc: 'Poison attack', effect: 'Poison' },
  smokeScreen: { name: 'Smoke Screen', mpCost: 12, damage: 0, damageType: 'buff', element: 'none', desc: 'Create smoke', effect: '+40% eva' },
  steal: { name: 'Steal', mpCost: 5, damage: 0, damageType: 'utility', element: 'none', desc: 'Steal gold', effect: '5-15% gold' },
  preciseShot: { name: 'Precise Shot', mpCost: 6, damage: 1.5, damageType: 'physical', element: 'none', desc: 'Aimed shot' },
  multiShot: { name: 'Multi Shot', mpCost: 14, damage: 0.6, hits: 3, damageType: 'physical', element: 'none', desc: '3 arrows' },
  eagleEye: { name: 'Eagle Eye', mpCost: 10, damage: 0, damageType: 'buff', element: 'none', desc: 'Focus', effect: '+25% crit' },
  arrowRain: { name: 'Arrow Rain', mpCost: 20, damage: 2.2, damageType: 'physical', element: 'none', desc: 'Rain of arrows' },
  fireball: { name: 'Fireball', mpCost: 10, damage: 1.6, damageType: 'magical', element: 'fire', desc: 'Fire attack', effect: 'Burn' },
  iceSpear: { name: 'Ice Spear', mpCost: 12, damage: 1.4, damageType: 'magical', element: 'ice', desc: 'Ice attack', effect: '-20% ATK' },
  manaShield: { name: 'Mana Shield', mpCost: 15, damage: 0, damageType: 'buff', element: 'none', desc: 'Shield', effect: '50% MP shield' },
  thunderbolt: { name: 'Thunderbolt', mpCost: 18, damage: 2.0, damageType: 'magical', element: 'lightning', desc: 'Lightning' },
  flameSlash: { name: 'Flame Slash', mpCost: 15, damage: 1.8, damageType: 'physical', element: 'fire', desc: 'Fire slash', effect: 'Burn' },
  infernoStrike: { name: 'Inferno Strike', mpCost: 25, damage: 2.8, damageType: 'physical', element: 'fire', desc: 'Fire strike' },
  fireAura: { name: 'Fire Aura', mpCost: 20, damage: 0, damageType: 'buff', element: 'fire', desc: 'Fire aura', effect: '+30% P.DMG' },
  volcanicRage: { name: 'Volcanic Rage', mpCost: 40, damage: 3.5, damageType: 'physical', element: 'fire', desc: 'Eruption', effect: 'Burn' },
  rageSlash: { name: 'Rage Slash', mpCost: 10, damage: 2.0, damageType: 'physical', element: 'none', desc: 'Fury slash', effect: '-5% HP' },
  bloodFury: { name: 'Blood Fury', mpCost: 20, damage: 0, damageType: 'buff', element: 'none', desc: 'Blood rage', effect: '+50% P.DMG' },
  recklessCharge: { name: 'Reckless Charge', mpCost: 15, damage: 2.5, damageType: 'physical', element: 'none', desc: 'Charge', effect: '-10% HP' },
  deathwish: { name: 'Deathwish', mpCost: 35, damage: 4.0, damageType: 'physical', element: 'none', desc: 'Ultimate', effect: '-20% HP' },
  holyStrike: { name: 'Holy Strike', mpCost: 12, damage: 1.6, damageType: 'physical', element: 'holy', desc: 'Holy attack' },
  divineShield: { name: 'Divine Shield', mpCost: 18, damage: 0, damageType: 'buff', element: 'holy', desc: 'Divine shield' },
  healingLight: { name: 'Healing Light', mpCost: 20, damage: 0, damageType: 'heal', element: 'holy', desc: 'Heal', effect: '+35% HP' },
  judgment: { name: 'Judgment', mpCost: 35, damage: 3.0, damageType: 'physical', element: 'holy', desc: 'Judgment' },
  groundSlam: { name: 'Ground Slam', mpCost: 12, damage: 1.5, damageType: 'physical', element: 'earth', desc: 'Slam', effect: '-20% DEF' },
  stoneSkin: { name: 'Stone Skin', mpCost: 15, damage: 0, damageType: 'buff', element: 'earth', desc: 'Stone armor', effect: '+50% P.DEF' },
  earthquake: { name: 'Earthquake', mpCost: 25, damage: 2.2, damageType: 'physical', element: 'earth', desc: 'Quake', effect: '-30% DEF' },
  titansWrath: { name: "Titan's Wrath", mpCost: 40, damage: 3.2, damageType: 'physical', element: 'earth', desc: 'Ultimate' },
  frostStrike: { name: 'Frost Strike', mpCost: 12, damage: 1.4, damageType: 'physical', element: 'ice', desc: 'Ice slash', effect: '-15% ATK' },
  iceBarrier: { name: 'Ice Barrier', mpCost: 18, damage: 0, damageType: 'buff', element: 'ice', desc: 'Ice shield' },
  glacialSlash: { name: 'Glacial Slash', mpCost: 22, damage: 2.0, damageType: 'physical', element: 'ice', desc: 'Ice slash', effect: 'Freeze' },
  absoluteDefense: { name: 'Absolute Defense', mpCost: 35, damage: 0, damageType: 'buff', element: 'ice', desc: 'Defense', effect: '+100% DEF' },
  shadowStrike: { name: 'Shadow Strike', mpCost: 12, damage: 2.2, damageType: 'physical', element: 'dark', desc: 'Shadow attack', effect: '+40% crit' },
  vanish: { name: 'Vanish', mpCost: 20, damage: 0, damageType: 'buff', element: 'dark', desc: 'Invisible', effect: 'Auto-crit' },
  deathMark: { name: 'Death Mark', mpCost: 18, damage: 1.2, damageType: 'physical', element: 'dark', desc: 'Mark', effect: '+30% vuln' },
  shadowDance: { name: 'Shadow Dance', mpCost: 35, damage: 0.8, hits: 5, damageType: 'physical', element: 'dark', desc: '5-hit combo' },
  toxicStab: { name: 'Toxic Stab', mpCost: 10, damage: 1.4, damageType: 'physical', element: 'nature', desc: 'Poison stab' },
  acidSpray: { name: 'Acid Spray', mpCost: 15, damage: 1.2, damageType: 'physical', element: 'nature', desc: 'Acid', effect: '-25% DEF' },
  plagueCloud: { name: 'Plague Cloud', mpCost: 22, damage: 0.8, damageType: 'physical', element: 'nature', desc: 'Poison cloud' },
  venomousEnd: { name: 'Venomous End', mpCost: 38, damage: 2.5, damageType: 'physical', element: 'nature', desc: 'Execute <30%' },
  assassinate: { name: 'Assassinate', mpCost: 15, damage: 3.0, damageType: 'physical', element: 'none', desc: 'Execute <25%' },
  shadowStep: { name: 'Shadow Step', mpCost: 12, damage: 1.5, damageType: 'physical', element: 'dark', desc: 'Teleport' },
  markedForDeath: { name: 'Marked for Death', mpCost: 18, damage: 0, damageType: 'debuff', element: 'dark', desc: 'Mark' },
  deathLotus: { name: 'Death Lotus', mpCost: 40, damage: 1.0, hits: 6, damageType: 'physical', element: 'dark', desc: '6-hit spin' },
  phantomStrike: { name: 'Phantom Strike', mpCost: 12, damage: 1.8, damageType: 'physical', element: 'dark', desc: 'Ghost attack' },
  phaseShift: { name: 'Phase Shift', mpCost: 15, damage: 0, damageType: 'buff', element: 'dark', desc: 'Phase', effect: '+60% eva' },
  soulDrain: { name: 'Soul Drain', mpCost: 20, damage: 1.5, damageType: 'physical', element: 'dark', desc: 'Drain' },
  etherealBurst: { name: 'Ethereal Burst', mpCost: 35, damage: 3.0, damageType: 'physical', element: 'dark', desc: 'Dark burst' },
  bloodSlash: { name: 'Blood Slash', mpCost: 10, damage: 1.8, damageType: 'physical', element: 'dark', desc: 'Lifesteal slash' },
  crimsonDance: { name: 'Crimson Dance', mpCost: 18, damage: 0.6, hits: 4, damageType: 'physical', element: 'dark', desc: '4-hit' },
  bloodPact: { name: 'Blood Pact', mpCost: 15, damage: 0, damageType: 'buff', element: 'dark', desc: 'Sacrifice' },
  sanguineHarvest: { name: 'Sanguine Harvest', mpCost: 40, damage: 3.5, damageType: 'physical', element: 'dark', desc: 'Ultimate' },
  lightningArrow: { name: 'Lightning Arrow', mpCost: 14, damage: 2.0, damageType: 'physical', element: 'lightning', desc: 'Electric arrow' },
  chainLightning: { name: 'Chain Lightning', mpCost: 22, damage: 0.7, hits: 3, damageType: 'magical', element: 'lightning', desc: 'Chain' },
  stormEye: { name: 'Storm Eye', mpCost: 18, damage: 0, damageType: 'buff', element: 'lightning', desc: 'Focus' },
  thunderstorm: { name: 'Thunderstorm', mpCost: 45, damage: 0.8, hits: 4, damageType: 'magical', element: 'lightning', desc: '4-hit storm' },
  flameArrow: { name: 'Flame Arrow', mpCost: 12, damage: 1.8, damageType: 'physical', element: 'fire', desc: 'Fire arrow', effect: 'Burn' },
  explosiveShot: { name: 'Explosive Shot', mpCost: 20, damage: 2.5, damageType: 'physical', element: 'fire', desc: 'Explosive' },
  infernoQuiver: { name: 'Inferno Quiver', mpCost: 18, damage: 0, damageType: 'buff', element: 'fire', desc: 'Fire buff' },
  phoenixArrow: { name: 'Phoenix Arrow', mpCost: 42, damage: 3.8, damageType: 'physical', element: 'fire', desc: 'Ultimate fire' },
  iceArrow: { name: 'Ice Arrow', mpCost: 12, damage: 1.6, damageType: 'physical', element: 'ice', desc: 'Ice arrow' },
  piercingCold: { name: 'Piercing Cold', mpCost: 18, damage: 2.2, damageType: 'physical', element: 'ice', desc: 'Pierce' },
  frozenPrecision: { name: 'Frozen Precision', mpCost: 15, damage: 0, damageType: 'buff', element: 'ice', desc: 'Focus' },
  avalancheShot: { name: 'Avalanche Shot', mpCost: 40, damage: 3.2, damageType: 'physical', element: 'ice', desc: 'Ultimate ice' },
  vineArrow: { name: 'Vine Arrow', mpCost: 10, damage: 1.4, damageType: 'physical', element: 'nature', desc: 'Nature arrow' },
  natureBounty: { name: "Nature's Bounty", mpCost: 18, damage: 0, damageType: 'heal', element: 'nature', desc: 'Heal' },
  thornBarrage: { name: 'Thorn Barrage', mpCost: 22, damage: 0.6, hits: 4, damageType: 'physical', element: 'nature', desc: '4 thorns' },
  gaiaWrath: { name: "Gaia's Wrath", mpCost: 38, damage: 3.0, damageType: 'physical', element: 'nature', desc: 'Nature burst' },
  voidArrow: { name: 'Void Arrow', mpCost: 14, damage: 1.8, damageType: 'physical', element: 'dark', desc: 'Dark arrow' },
  dimensionalRift: { name: 'Dimensional Rift', mpCost: 20, damage: 2.0, damageType: 'physical', element: 'dark', desc: 'Rift' },
  voidSight: { name: 'Void Sight', mpCost: 16, damage: 0, damageType: 'buff', element: 'dark', desc: 'Void vision' },
  oblivionShot: { name: 'Oblivion Shot', mpCost: 45, damage: 4.0, damageType: 'physical', element: 'dark', desc: 'Ultimate void' },
  frostBolt: { name: 'Frost Bolt', mpCost: 12, damage: 1.6, damageType: 'magical', element: 'ice', desc: 'Ice bolt' },
  blizzard: { name: 'Blizzard', mpCost: 28, damage: 0.8, hits: 3, damageType: 'magical', element: 'ice', desc: 'Ice storm' },
  iceArmor: { name: 'Ice Armor', mpCost: 20, damage: 0, damageType: 'buff', element: 'ice', desc: 'Ice armor' },
  absoluteZero: { name: 'Absolute Zero', mpCost: 50, damage: 4.0, damageType: 'magical', element: 'ice', desc: 'Ultimate ice' },
  flameBurst: { name: 'Flame Burst', mpCost: 12, damage: 1.8, damageType: 'magical', element: 'fire', desc: 'Fire burst' },
  meteorShower: { name: 'Meteor Shower', mpCost: 30, damage: 0.9, hits: 3, damageType: 'magical', element: 'fire', desc: '3 meteors' },
  combustion: { name: 'Combustion', mpCost: 18, damage: 0, damageType: 'buff', element: 'fire', desc: 'Fire boost' },
  inferno: { name: 'Inferno', mpCost: 48, damage: 4.2, damageType: 'magical', element: 'fire', desc: 'Ultimate fire' },
  lightningBolt: { name: 'Lightning Bolt', mpCost: 14, damage: 1.8, damageType: 'magical', element: 'lightning', desc: 'Lightning' },
  staticField: { name: 'Static Field', mpCost: 18, damage: 1.2, damageType: 'magical', element: 'lightning', desc: 'AoE shock' },
  stormShield: { name: 'Storm Shield', mpCost: 20, damage: 0, damageType: 'buff', element: 'lightning', desc: 'Shield' },
  tempest: { name: 'Tempest', mpCost: 45, damage: 1.0, hits: 4, damageType: 'magical', element: 'lightning', desc: '4-hit storm' },
  darkBolt: { name: 'Dark Bolt', mpCost: 12, damage: 1.6, damageType: 'magical', element: 'dark', desc: 'Dark attack' },
  curseOfWeakness: { name: 'Curse of Weakness', mpCost: 16, damage: 0.8, damageType: 'magical', element: 'dark', desc: 'Curse' },
  lifeLeech: { name: 'Life Leech', mpCost: 22, damage: 1.8, damageType: 'magical', element: 'dark', desc: 'Drain' },
  deathCoil: { name: 'Death Coil', mpCost: 42, damage: 3.8, damageType: 'magical', element: 'dark', desc: 'Ultimate dark' },
  arcaneMissile: { name: 'Arcane Missile', mpCost: 10, damage: 0.6, hits: 3, damageType: 'magical', element: 'none', desc: '3 missiles' },
  spellAmplify: { name: 'Spell Amplify', mpCost: 18, damage: 0, damageType: 'buff', element: 'none', desc: 'Magic boost' },
  manaSurge: { name: 'Mana Surge', mpCost: 15, damage: 0, damageType: 'utility', element: 'none', desc: 'Restore MP' },
  arcaneBarrage: { name: 'Arcane Barrage', mpCost: 40, damage: 0.7, hits: 6, damageType: 'magical', element: 'none', desc: '6 missiles' }
};

const ELEMENT_ICONS = { fire: '🔥', ice: '❄️', lightning: '⚡', nature: '🌿', dark: '🌑', holy: '✨', earth: '🌍', none: '⚔️' };
const HIDDEN_CLASS_ICONS = {
  flameblade: '🔥', berserker: '💢', paladin: '✨', earthshaker: '🌍', frostguard: '❄️',
  shadowDancer: '🌑', venomancer: '🐍', assassin: '⚫', phantom: '👻', bloodreaper: '🩸',
  stormRanger: '⚡', pyroArcher: '🔥', frostSniper: '❄️', natureWarden: '🌿', voidHunter: '🌀',
  frostWeaver: '❄️', pyromancer: '🔥', stormcaller: '⚡', necromancer: '💀', arcanist: '✨'
};

const StatBar = ({ label, current, max, color, icon }) => {
  const pct = Math.round((current / max) * 100);
  const barColor = label === 'HP' ? (pct > 50 ? 'from-green-500 to-green-400' : pct > 25 ? 'from-yellow-500 to-yellow-400' : 'from-red-500 to-red-400') : 'from-blue-500 to-blue-400';
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm"><span className={color}>{icon} {label}</span><span className="text-gray-300">{current}/{max}</span></div>
      <div className="h-3 bg-void-900 rounded-full overflow-hidden"><div className={`h-full bg-gradient-to-r ${barColor} transition-all`} style={{ width: `${pct}%` }}></div></div>
    </div>
  );
};

const EnergyBar = ({ energy }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-sm"><span className="text-gray-400">⚡ ENERGY</span><span className="text-amber-400">{energy}/100</span></div>
    <div className="h-2 bg-void-900 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all" style={{ width: energy + '%' }}></div></div>
  </div>
);

const ExpBar = ({ exp, expToLevel, level }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-xs"><span className="text-gray-500">Lv.{level}</span><span className="text-purple-400">{exp}/{expToLevel}</span></div>
    <div className="h-2 bg-void-900 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all" style={{ width: Math.round((exp/expToLevel)*100) + '%' }}></div></div>
  </div>
);

const calculateDerivedStats = (stats, level = 1) => {
  if (!stats) return null;
  return {
    pDmg: Math.floor((5 + stats.str * 3) * (1 + (level-1) * 0.02)),
    mDmg: Math.floor((5 + stats.int * 4) * (1 + (level-1) * 0.02)),
    pDef: stats.str + stats.vit * 2,
    mDef: stats.vit + stats.int,
    critRate: Math.min(5 + stats.agi * 0.5, 80),
    critDmg: 150 + stats.dex,
    accuracy: Math.min(90 + stats.dex * 0.5, 100),
    evasion: Math.min(stats.agi * 0.3, 60)
  };
};

const GamePage = () => {
  const { character, logout, refreshCharacter } = useAuth();
  const [activeTab, setActiveTab] = useState('status');
  const [isResting, setIsResting] = useState(false);
  const [showStatModal, setShowStatModal] = useState(false);
  const [pendingStats, setPendingStats] = useState({ str: 0, agi: 0, dex: 0, int: 0, vit: 0 });
  const [isAllocating, setIsAllocating] = useState(false);
  const [isInTower, setIsInTower] = useState(false);
  const [localCharacter, setLocalCharacter] = useState(null);
  const [gameLog, setGameLog] = useState([{ type: 'system', message: 'Welcome to APZ', timestamp: new Date() }]);
  const [towerState, setTowerState] = useState(null);
  const navigate = useNavigate();
  const logRef = useRef(null);

  useEffect(() => { if (character) { setLocalCharacter(character); setIsInTower(character.isInTower || false); } }, [character]);
  const displayCharacter = localCharacter || character;
  const derivedStats = displayCharacter ? calculateDerivedStats(displayCharacter.stats, displayCharacter.level) : null;

  useEffect(() => {
    const interval = setInterval(async () => { const updated = await refreshCharacter(); if (updated && !isInTower) setLocalCharacter(updated); }, 60000);
    return () => clearInterval(interval);
  }, [refreshCharacter, isInTower]);

  useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [gameLog]);

  const addLog = useCallback((type, message) => { setGameLog(prev => [...prev, { type, message, timestamp: new Date() }].slice(-100)); }, []);
  const updateLocalCharacter = useCallback((updates) => { setLocalCharacter(prev => prev ? { ...prev, ...updates, stats: updates.stats ? { ...prev.stats, ...updates.stats } : prev.stats } : prev); }, []);
  const handleCharacterUpdate = useCallback(async (immediateUpdates = null) => {
    if (immediateUpdates) updateLocalCharacter(immediateUpdates);
    try { const updated = await refreshCharacter(); if (updated) setLocalCharacter(updated); } catch (err) { console.error(err); }
  }, [refreshCharacter, updateLocalCharacter]);

  const handleRest = async () => {
    if (isInTower) { addLog('error', 'Cannot rest in tower!'); return; }
    setIsResting(true);
    try { const { data } = await characterAPI.rest(); addLog('success', `Rested! -${data.goldSpent}g`); await handleCharacterUpdate(); } catch (err) { addLog('error', err.response?.data?.error || 'Failed'); }
    setIsResting(false);
  };

  const handleAllocateStats = async () => {
    const total = Object.values(pendingStats).reduce((a, b) => a + b, 0);
    if (total === 0) return;
    setIsAllocating(true);
    try { await characterAPI.allocateStats(pendingStats); addLog('success', 'Stats allocated!'); setPendingStats({ str: 0, agi: 0, dex: 0, int: 0, vit: 0 }); setShowStatModal(false); await handleCharacterUpdate(); } catch (err) { addLog('error', err.response?.data?.error || 'Failed'); }
    setIsAllocating(false);
  };

  const addPendingStat = (stat, amt) => {
    const total = Object.values(pendingStats).reduce((a, b) => a + b, 0);
    const newVal = pendingStats[stat] + amt;
    if (newVal >= 0 && total + amt <= displayCharacter.statPoints) setPendingStats({ ...pendingStats, [stat]: newVal });
  };

  const handleLogout = () => { logout(); navigate('/login'); };
  const handleTowerStateChange = useCallback((inTower) => setIsInTower(inTower), []);
  const handleSaveTowerState = useCallback((state) => setTowerState(state), []);

  const getSkillDmg = (info, stats) => {
    if (!info || !stats || info.damage === 0) return null;
    const base = info.damageType === 'magical' ? stats.mDmg : stats.pDmg;
    const dmg = Math.floor(base * (info.damage || 1));
    const type = info.damageType === 'magical' ? 'M' : 'P';
    return info.hits > 1 ? `${info.hits}x${dmg} ${type}` : `${dmg} ${type}`;
  };

  if (!displayCharacter) return <div className="min-h-screen flex items-center justify-center text-purple-400">Loading...</div>;

  const restCost = displayCharacter.level * 250;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-void-900">
      {/* Header */}
      <header className="bg-void-800 border-b border-purple-500/20 px-3 py-2 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="font-display text-lg text-purple-400">APZ</h1>
            <span className="hidden sm:block text-gray-500 text-xs">|</span>
            <span className="hidden sm:block text-gray-400 text-xs">Awakened Protocol: Zero</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-amber-400 text-sm">💰{displayCharacter.gold}</span>
            <button onClick={handleLogout} className="text-gray-400 hover:text-red-400 text-xs">Logout</button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Sidebar */}
        <aside className="lg:w-64 bg-void-800/50 border-b lg:border-b-0 lg:border-r border-purple-500/10 p-3 flex flex-col flex-shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600/30 to-purple-800/30 border border-purple-500/30 flex items-center justify-center text-2xl flex-shrink-0">{CLASS_ICONS[displayCharacter.baseClass]}</div>
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-sm text-white truncate">{displayCharacter.name}</h2>
              <p className={`text-xs ${CLASS_COLORS[displayCharacter.baseClass]} truncate`}>{displayCharacter.hiddenClass !== 'none' ? `${HIDDEN_CLASS_ICONS[displayCharacter.hiddenClass] || ''} ${displayCharacter.hiddenClass}` : displayCharacter.baseClass}</p>
            </div>
          </div>
          <div className="mb-2"><ExpBar exp={displayCharacter.experience} expToLevel={displayCharacter.experienceToNextLevel} level={displayCharacter.level}/></div>
          <div className="space-y-2 mb-2">
            <StatBar label="HP" current={displayCharacter.stats.hp} max={displayCharacter.stats.maxHp} color="text-green-400" icon="❤️"/>
            <StatBar label="MP" current={displayCharacter.stats.mp} max={displayCharacter.stats.maxMp} color="text-blue-400" icon="💎"/>
          </div>
          <div className="mb-2"><EnergyBar energy={displayCharacter.energy}/></div>
          <button onClick={handleRest} disabled={isResting || displayCharacter.stats.hp >= displayCharacter.stats.maxHp || isInTower} className="w-full btn-secondary text-xs py-1.5 disabled:opacity-50 mb-2">{isResting ? '...' : `🛏️ Rest (${restCost}g)`}</button>
          <div className="flex-1 flex flex-col min-h-0 border-t border-gray-700/50 pt-2">
            <h3 className="text-gray-500 text-xs mb-1 font-semibold">📜 LOG</h3>
            <div ref={logRef} className="flex-1 overflow-y-auto bg-void-900/50 rounded p-1.5 text-xs space-y-0.5">
              {gameLog.slice(-30).map((log, i) => (<div key={i} className={`${log.type === 'error' ? 'text-red-400' : log.type === 'success' ? 'text-green-400' : log.type === 'combat' || log.type === 'enemy' ? 'text-yellow-400' : 'text-gray-500'}`}>{log.message}</div>))}
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <nav className="bg-void-800/30 border-b border-purple-500/10 flex-shrink-0">
            <div className="flex">
              {[
                { id: 'status', label: '📊 Status', icon: '📊' },
                { id: 'tower', label: '🗼 Tower', icon: '🗼' },
                { id: 'inventory', label: '🎒 Items', icon: '🎒' },
                { id: 'tavern', label: '🍺 Tavern', icon: '🍺', disabled: isInTower }
              ].map(tab => (
                <button key={tab.id} onClick={() => !tab.disabled && setActiveTab(tab.id)} disabled={tab.disabled}
                  className={`flex-1 py-2.5 px-2 text-xs sm:text-sm font-medium transition-colors ${activeTab === tab.id ? 'text-purple-400 border-b-2 border-purple-500 bg-purple-500/5' : tab.disabled ? 'text-gray-600 cursor-not-allowed opacity-50' : 'text-gray-500 hover:text-gray-300'}`}>
                  <span className="sm:hidden">{tab.icon}</span><span className="hidden sm:inline">{tab.label}</span>{tab.disabled && <span className="ml-1">🔒</span>}
                </button>
              ))}
            </div>
          </nav>

          <div className="flex-1 overflow-auto p-3">
            {/* STATUS TAB - Combined: Hunter Info, Stats, Combat Stats, Skills */}
            {activeTab === 'status' && (
              <div className="max-w-3xl mx-auto space-y-3">
                {/* Hunter Info + Statistics Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-void-800/50 rounded-lg p-3 neon-border">
                    <h3 className="text-xs text-purple-400 font-semibold mb-2">HUNTER INFO</h3>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-void-900/50 p-2 rounded"><span className="text-gray-500 block">Class</span><span className={CLASS_COLORS[displayCharacter.baseClass]}>{CLASS_ICONS[displayCharacter.baseClass]} {displayCharacter.baseClass}</span></div>
                      <div className="bg-void-900/50 p-2 rounded"><span className="text-gray-500 block">Hidden</span><span className={displayCharacter.hiddenClass !== 'none' ? 'text-purple-400' : 'text-gray-600'}>{displayCharacter.hiddenClass !== 'none' ? displayCharacter.hiddenClass : 'None'}</span></div>
                      <div className="bg-void-900/50 p-2 rounded"><span className="text-gray-500 block">Tower</span><span className="text-white">{displayCharacter.currentTower} F{displayCharacter.currentFloor}</span></div>
                      <div className="bg-void-900/50 p-2 rounded"><span className="text-gray-500 block">Crystals</span><span className="text-cyan-400">💎 {displayCharacter.memoryCrystals}</span></div>
                    </div>
                  </div>
                  <div className="bg-void-800/50 rounded-lg p-3 neon-border">
                    <h3 className="text-xs text-purple-400 font-semibold mb-2">📈 STATISTICS</h3>
                    <div className="grid grid-cols-4 gap-1">
                      {[{ label: 'Kills', value: displayCharacter.statistics?.totalKills || 0, color: 'text-red-400' },
                        { label: 'Boss', value: displayCharacter.statistics?.bossKills || 0, color: 'text-purple-400' },
                        { label: 'Floors', value: displayCharacter.statistics?.floorsCleared || 0, color: 'text-blue-400' },
                        { label: 'Scrolls', value: displayCharacter.statistics?.scrollsFound || 0, color: 'text-amber-400' }
                      ].map(s => (<div key={s.label} className="text-center bg-void-900/50 p-1.5 rounded"><div className={`text-sm font-bold ${s.color}`}>{s.value}</div><div className="text-xs text-gray-500">{s.label}</div></div>))}
                    </div>
                  </div>
                </div>

                {/* Base Stats + Combat Stats Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-void-800/50 rounded-lg p-3 neon-border">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xs text-purple-400 font-semibold">BASE STATS</h3>
                      {displayCharacter.statPoints > 0 && <button onClick={() => setShowStatModal(true)} className="px-2 py-0.5 bg-purple-600 hover:bg-purple-500 rounded text-xs">+{displayCharacter.statPoints}</button>}
                    </div>
                    <div className="grid grid-cols-5 gap-1 text-xs">
                      {[{ key: 'str', icon: '💪', color: 'text-red-400' }, { key: 'agi', icon: '⚡', color: 'text-indigo-400' }, { key: 'dex', icon: '🎯', color: 'text-green-400' }, { key: 'int', icon: '🔮', color: 'text-purple-400' }, { key: 'vit', icon: '❤️', color: 'text-amber-400' }].map(s => (
                        <div key={s.key} className="bg-void-900/50 p-1.5 rounded text-center"><div className="text-xs">{s.icon}</div><div className={`font-bold ${s.color}`}>{displayCharacter.stats[s.key]}</div><div className="text-gray-600 text-xs uppercase">{s.key}</div></div>
                      ))}
                    </div>
                  </div>
                  {derivedStats && (
                    <div className="bg-void-800/50 rounded-lg p-3 neon-border">
                      <h3 className="text-xs text-purple-400 font-semibold mb-2">⚔️ COMBAT STATS</h3>
                      <div className="grid grid-cols-2 gap-1 text-xs">
                        {[{ label: 'P.DMG', value: derivedStats.pDmg, color: 'text-red-400' }, { label: 'M.DMG', value: derivedStats.mDmg, color: 'text-purple-400' },
                          { label: 'P.DEF', value: derivedStats.pDef, color: 'text-gray-300' }, { label: 'M.DEF', value: derivedStats.mDef, color: 'text-indigo-400' },
                          { label: 'Crit%', value: derivedStats.critRate.toFixed(1), color: 'text-yellow-400' }, { label: 'CritDMG', value: derivedStats.critDmg + '%', color: 'text-orange-400' },
                          { label: 'ACC', value: derivedStats.accuracy.toFixed(1) + '%', color: 'text-blue-400' }, { label: 'EVA', value: derivedStats.evasion.toFixed(1) + '%', color: 'text-cyan-400' }
                        ].map(s => (<div key={s.label} className="bg-void-900/50 p-1.5 rounded flex justify-between"><span className="text-gray-500">{s.label}</span><span className={s.color}>{s.value}</span></div>))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Skills */}
                <div className="bg-void-800/50 rounded-lg p-3 neon-border">
                  <h3 className="text-xs text-purple-400 font-semibold mb-2">⚡ SKILLS ({displayCharacter.skills?.length || 0})</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(displayCharacter.skills || []).map((skill, i) => {
                      const info = SKILL_DATABASE[skill.skillId] || {};
                      const dmg = getSkillDmg(info, derivedStats);
                      return (
                        <div key={i} className="bg-void-900/50 p-2 rounded border border-purple-500/10">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1.5"><span>{ELEMENT_ICONS[info.element] || '⚔️'}</span><span className="text-white text-xs font-medium">{skill.name}</span></div>
                            <span className="text-xs text-blue-400">{info.mpCost}MP</span>
                          </div>
                          <p className="text-xs text-gray-500 mb-1">{info.desc || '-'}</p>
                          <div className="flex flex-wrap gap-1">
                            {dmg && <span className={`text-xs px-1.5 py-0.5 rounded ${info.damageType === 'magical' ? 'bg-purple-500/20 text-purple-400' : 'bg-red-500/20 text-red-400'}`}>{dmg}</span>}
                            {info.effect && <span className="text-xs px-1.5 py-0.5 bg-green-500/20 text-green-400 rounded">{info.effect}</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'tower' && <div className="h-full"><TowerPanel character={displayCharacter} onCharacterUpdate={handleCharacterUpdate} updateLocalCharacter={updateLocalCharacter} addLog={addLog} onTowerStateChange={handleTowerStateChange} savedState={towerState} onSaveState={handleSaveTowerState}/></div>}
            {activeTab === 'inventory' && <InventoryPanel character={displayCharacter} onCharacterUpdate={handleCharacterUpdate} addLog={addLog}/>}
            {activeTab === 'tavern' && !isInTower && <TavernPanel character={displayCharacter} onCharacterUpdate={handleCharacterUpdate} addLog={addLog}/>}
            {activeTab === 'tavern' && isInTower && <div className="bg-void-800/50 rounded-lg p-6 neon-border text-center"><div className="text-4xl mb-2">🔒</div><h3 className="text-red-400 font-semibold">Tavern Locked</h3><p className="text-gray-500 text-sm">Leave tower first</p></div>}
          </div>
        </main>
      </div>

      {showStatModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-void-800 rounded-xl p-4 w-full max-w-sm neon-border">
            <h2 className="font-display text-lg text-purple-400 mb-3">Allocate Stats</h2>
            <p className="text-gray-400 text-xs mb-3">Points: <span className="text-purple-400 font-bold">{displayCharacter.statPoints - Object.values(pendingStats).reduce((a,b)=>a+b,0)}</span></p>
            <div className="space-y-2">
              {['str','agi','dex','int','vit'].map(stat => (
                <div key={stat} className="flex items-center justify-between p-2 bg-void-900/50 rounded">
                  <span className="text-gray-300 uppercase text-sm">{stat}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-sm">{displayCharacter.stats[stat]}</span>
                    {pendingStats[stat] > 0 && <span className="text-green-400 text-sm">+{pendingStats[stat]}</span>}
                    <button onClick={() => addPendingStat(stat, -1)} disabled={pendingStats[stat] <= 0} className="w-7 h-7 bg-red-600/20 border border-red-500/30 rounded text-red-400 disabled:opacity-30">-</button>
                    <button onClick={() => addPendingStat(stat, 1)} disabled={Object.values(pendingStats).reduce((a,b)=>a+b,0) >= displayCharacter.statPoints} className="w-7 h-7 bg-green-600/20 border border-green-500/30 rounded text-green-400 disabled:opacity-30">+</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => { setShowStatModal(false); setPendingStats({str:0,agi:0,dex:0,int:0,vit:0}); }} className="flex-1 btn-secondary text-sm">Cancel</button>
              <button onClick={handleAllocateStats} disabled={isAllocating || Object.values(pendingStats).reduce((a,b)=>a+b,0)===0} className="flex-1 btn-primary text-sm disabled:opacity-50">{isAllocating ? '...' : 'Confirm'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GamePage;
