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

// Complete Skill Database with damage types
const SKILL_DATABASE = {
  // BASE SWORDSMAN
  slash: { name: 'Slash', mpCost: 5, damage: 1.2, damageType: 'physical', element: 'none', desc: 'Quick slash attack' },
  heavyStrike: { name: 'Heavy Strike', mpCost: 12, damage: 1.8, damageType: 'physical', element: 'none', desc: 'Powerful overhead strike' },
  shieldBash: { name: 'Shield Bash', mpCost: 8, damage: 1.0, damageType: 'physical', element: 'none', desc: 'Bash with shield', effect: '-15% enemy ATK' },
  warCry: { name: 'War Cry', mpCost: 15, damage: 0, damageType: 'buff', element: 'none', desc: 'Battle cry', effect: '+25% P.DMG (3 turns)' },
  // BASE THIEF
  backstab: { name: 'Backstab', mpCost: 8, damage: 2.0, damageType: 'physical', element: 'none', desc: 'Strike from behind', effect: '+30% crit chance' },
  poisonBlade: { name: 'Poison Blade', mpCost: 10, damage: 1.0, damageType: 'physical', element: 'nature', desc: 'Poisoned attack', effect: 'Poison 3 turns' },
  smokeScreen: { name: 'Smoke Screen', mpCost: 12, damage: 0, damageType: 'buff', element: 'none', desc: 'Create smoke', effect: '+40% evasion (2 turns)' },
  steal: { name: 'Steal', mpCost: 5, damage: 0, damageType: 'utility', element: 'none', desc: 'Steal gold', effect: '5-15% enemy gold' },
  // BASE ARCHER
  preciseShot: { name: 'Precise Shot', mpCost: 6, damage: 1.5, damageType: 'physical', element: 'none', desc: 'Aimed shot, never misses' },
  multiShot: { name: 'Multi Shot', mpCost: 14, damage: 0.6, hits: 3, damageType: 'physical', element: 'none', desc: 'Fire 3 arrows' },
  eagleEye: { name: 'Eagle Eye', mpCost: 10, damage: 0, damageType: 'buff', element: 'none', desc: 'Focus aim', effect: '+25% Crit, +20% Crit DMG' },
  arrowRain: { name: 'Arrow Rain', mpCost: 20, damage: 2.2, damageType: 'physical', element: 'none', desc: 'Rain of arrows' },
  // BASE MAGE
  fireball: { name: 'Fireball', mpCost: 10, damage: 1.6, damageType: 'magical', element: 'fire', desc: 'Fire projectile', effect: 'Burn 3 turns' },
  iceSpear: { name: 'Ice Spear', mpCost: 12, damage: 1.4, damageType: 'magical', element: 'ice', desc: 'Ice projectile', effect: '-20% enemy ATK' },
  manaShield: { name: 'Mana Shield', mpCost: 15, damage: 0, damageType: 'buff', element: 'none', desc: 'Create shield', effect: 'Shield = 50% MP' },
  thunderbolt: { name: 'Thunderbolt', mpCost: 18, damage: 2.0, damageType: 'magical', element: 'lightning', desc: 'Lightning strike' },
  // FLAMEBLADE
  flameSlash: { name: 'Flame Slash', mpCost: 15, damage: 1.8, damageType: 'physical', element: 'fire', desc: 'Fire slash', effect: 'Burn' },
  infernoStrike: { name: 'Inferno Strike', mpCost: 25, damage: 2.8, damageType: 'physical', element: 'fire', desc: 'Powerful fire strike' },
  fireAura: { name: 'Fire Aura', mpCost: 20, damage: 0, damageType: 'buff', element: 'fire', desc: 'Flame aura', effect: '+30% P.DMG' },
  volcanicRage: { name: 'Volcanic Rage', mpCost: 40, damage: 3.5, damageType: 'physical', element: 'fire', desc: 'Massive eruption', effect: 'Burn' },
  // BERSERKER
  rageSlash: { name: 'Rage Slash', mpCost: 10, damage: 2.0, damageType: 'physical', element: 'none', desc: 'Furious slash', effect: 'Costs 5% HP' },
  bloodFury: { name: 'Blood Fury', mpCost: 20, damage: 0, damageType: 'buff', element: 'none', desc: 'Blood rage', effect: '+50% P.DMG, -20% DEF' },
  recklessCharge: { name: 'Reckless Charge', mpCost: 15, damage: 2.5, damageType: 'physical', element: 'none', desc: 'Charge attack', effect: 'Costs 10% HP' },
  deathwish: { name: 'Deathwish', mpCost: 35, damage: 4.0, damageType: 'physical', element: 'none', desc: 'Ultimate attack', effect: 'Costs 20% HP' },
  // PALADIN
  holyStrike: { name: 'Holy Strike', mpCost: 12, damage: 1.6, damageType: 'physical', element: 'holy', desc: 'Holy attack', effect: '+50% vs undead' },
  divineShield: { name: 'Divine Shield', mpCost: 18, damage: 0, damageType: 'buff', element: 'holy', desc: 'Divine protection', effect: 'Shield = 200% P.DEF' },
  healingLight: { name: 'Healing Light', mpCost: 20, damage: 0, damageType: 'heal', element: 'holy', desc: 'Heal spell', effect: 'Heal 35% max HP' },
  judgment: { name: 'Judgment', mpCost: 35, damage: 3.0, damageType: 'physical', element: 'holy', desc: 'Divine judgment', effect: 'Removes debuffs' },
  // EARTHSHAKER
  groundSlam: { name: 'Ground Slam', mpCost: 12, damage: 1.5, damageType: 'physical', element: 'earth', desc: 'Slam ground', effect: '-20% DEF' },
  stoneSkin: { name: 'Stone Skin', mpCost: 15, damage: 0, damageType: 'buff', element: 'earth', desc: 'Stone armor', effect: '+50% P.DEF' },
  earthquake: { name: 'Earthquake', mpCost: 25, damage: 2.2, damageType: 'physical', element: 'earth', desc: 'Massive quake', effect: '-30% DEF' },
  titansWrath: { name: "Titan's Wrath", mpCost: 40, damage: 3.2, damageType: 'physical', element: 'earth', desc: 'Ultimate earth', effect: 'Stun' },
  // FROSTGUARD
  frostStrike: { name: 'Frost Strike', mpCost: 12, damage: 1.4, damageType: 'physical', element: 'ice', desc: 'Ice slash', effect: '-15% ATK' },
  iceBarrier: { name: 'Ice Barrier', mpCost: 18, damage: 0, damageType: 'buff', element: 'ice', desc: 'Ice shield', effect: 'Shield + reflect' },
  glacialSlash: { name: 'Glacial Slash', mpCost: 22, damage: 2.0, damageType: 'physical', element: 'ice', desc: 'Powerful ice slash', effect: '30% freeze' },
  absoluteDefense: { name: 'Absolute Defense', mpCost: 35, damage: 0, damageType: 'buff', element: 'ice', desc: 'Ultimate defense', effect: '+100% DEF' },
  // SHADOW DANCER
  shadowStrike: { name: 'Shadow Strike', mpCost: 12, damage: 2.2, damageType: 'physical', element: 'dark', desc: 'Shadow attack', effect: '+40% crit' },
  vanish: { name: 'Vanish', mpCost: 20, damage: 0, damageType: 'buff', element: 'dark', desc: 'Invisibility', effect: 'Next attack crits' },
  deathMark: { name: 'Death Mark', mpCost: 18, damage: 1.2, damageType: 'physical', element: 'dark', desc: 'Mark target', effect: '+30% DMG taken' },
  shadowDance: { name: 'Shadow Dance', mpCost: 35, damage: 0.8, hits: 5, damageType: 'physical', element: 'dark', desc: '5-hit combo' },
  // VENOMANCER
  toxicStab: { name: 'Toxic Stab', mpCost: 10, damage: 1.4, damageType: 'physical', element: 'nature', desc: 'Poison stab', effect: 'Strong poison' },
  acidSpray: { name: 'Acid Spray', mpCost: 15, damage: 1.2, damageType: 'physical', element: 'nature', desc: 'Acid attack', effect: '-25% DEF' },
  plagueCloud: { name: 'Plague Cloud', mpCost: 22, damage: 0.8, damageType: 'physical', element: 'nature', desc: 'Poison cloud', effect: 'Heavy DoT' },
  venomousEnd: { name: 'Venomous End', mpCost: 38, damage: 2.5, damageType: 'physical', element: 'nature', desc: 'Execute <30% HP', effect: 'Massive poison' },
  // ASSASSIN
  assassinate: { name: 'Assassinate', mpCost: 15, damage: 3.0, damageType: 'physical', element: 'none', desc: 'Execute <25% HP', effect: '+100% crit DMG' },
  shadowStep: { name: 'Shadow Step', mpCost: 12, damage: 1.5, damageType: 'physical', element: 'dark', desc: 'Teleport strike', effect: '+50% evasion' },
  markedForDeath: { name: 'Marked for Death', mpCost: 18, damage: 0, damageType: 'debuff', element: 'dark', desc: 'Mark target', effect: '+50% crit chance' },
  deathLotus: { name: 'Death Lotus', mpCost: 40, damage: 1.0, hits: 6, damageType: 'physical', element: 'dark', desc: '6-hit spinning attack' },
  // PHANTOM
  phantomStrike: { name: 'Phantom Strike', mpCost: 12, damage: 1.8, damageType: 'physical', element: 'dark', desc: 'Ghostly attack', effect: 'Ignore 30% DEF' },
  phaseShift: { name: 'Phase Shift', mpCost: 15, damage: 0, damageType: 'buff', element: 'dark', desc: 'Phase out', effect: '+60% evasion' },
  soulDrain: { name: 'Soul Drain', mpCost: 20, damage: 1.5, damageType: 'physical', element: 'dark', desc: 'Drain HP/MP', effect: 'Lifesteal' },
  etherealBurst: { name: 'Ethereal Burst', mpCost: 35, damage: 3.0, damageType: 'physical', element: 'dark', desc: 'Dark explosion' },
  // BLOODREAPER
  bloodSlash: { name: 'Blood Slash', mpCost: 10, damage: 1.8, damageType: 'physical', element: 'dark', desc: 'Slash + heal', effect: '20% lifesteal' },
  crimsonDance: { name: 'Crimson Dance', mpCost: 18, damage: 0.6, hits: 4, damageType: 'physical', element: 'dark', desc: '4-hit attack', effect: 'Each heals' },
  bloodPact: { name: 'Blood Pact', mpCost: 15, damage: 0, damageType: 'buff', element: 'dark', desc: 'Blood sacrifice', effect: '-20% HP, +40% P.DMG' },
  sanguineHarvest: { name: 'Sanguine Harvest', mpCost: 40, damage: 3.5, damageType: 'physical', element: 'dark', desc: 'Ultimate attack', effect: '50% lifesteal' },
  // STORM RANGER
  lightningArrow: { name: 'Lightning Arrow', mpCost: 14, damage: 2.0, damageType: 'physical', element: 'lightning', desc: 'Electric arrow', effect: 'Shock' },
  chainLightning: { name: 'Chain Lightning', mpCost: 22, damage: 0.7, hits: 3, damageType: 'magical', element: 'lightning', desc: 'Lightning chains' },
  stormEye: { name: 'Storm Eye', mpCost: 18, damage: 0, damageType: 'buff', element: 'lightning', desc: 'Focus', effect: '+50% acc, +30% crit' },
  thunderstorm: { name: 'Thunderstorm', mpCost: 45, damage: 0.8, hits: 4, damageType: 'magical', element: 'lightning', desc: '4-hit storm' },
  // PYRO ARCHER
  flameArrow: { name: 'Flame Arrow', mpCost: 12, damage: 1.8, damageType: 'physical', element: 'fire', desc: 'Fire arrow', effect: 'Burn' },
  explosiveShot: { name: 'Explosive Shot', mpCost: 20, damage: 2.5, damageType: 'physical', element: 'fire', desc: 'Explosive arrow' },
  infernoQuiver: { name: 'Inferno Quiver', mpCost: 18, damage: 0, damageType: 'buff', element: 'fire', desc: 'Fire buff', effect: '+30% fire DMG' },
  phoenixArrow: { name: 'Phoenix Arrow', mpCost: 42, damage: 3.8, damageType: 'physical', element: 'fire', desc: 'Ultimate fire arrow', effect: 'Burn' },
  // FROST SNIPER
  iceArrow: { name: 'Ice Arrow', mpCost: 12, damage: 1.6, damageType: 'physical', element: 'ice', desc: 'Freezing arrow', effect: '-20% ATK' },
  piercingCold: { name: 'Piercing Cold', mpCost: 18, damage: 2.2, damageType: 'physical', element: 'ice', desc: 'Armor pierce shot', effect: 'Ignore 25% DEF' },
  frozenPrecision: { name: 'Frozen Precision', mpCost: 15, damage: 0, damageType: 'buff', element: 'ice', desc: 'Focus', effect: '+40% crit DMG' },
  avalancheShot: { name: 'Avalanche Shot', mpCost: 40, damage: 3.2, damageType: 'physical', element: 'ice', desc: 'Massive ice shot', effect: 'Freeze' },
  // NATURE WARDEN
  vineArrow: { name: 'Vine Arrow', mpCost: 10, damage: 1.4, damageType: 'physical', element: 'nature', desc: 'Nature arrow', effect: '-15% evasion' },
  natureBounty: { name: "Nature's Bounty", mpCost: 18, damage: 0, damageType: 'heal', element: 'nature', desc: 'Heal', effect: 'Heal 25% + regen' },
  thornBarrage: { name: 'Thorn Barrage', mpCost: 22, damage: 0.6, hits: 4, damageType: 'physical', element: 'nature', desc: '4 thorn shots' },
  gaiaWrath: { name: "Gaia's Wrath", mpCost: 38, damage: 3.0, damageType: 'physical', element: 'nature', desc: 'Nature explosion', effect: 'Heal 20%' },
  // VOID HUNTER
  voidArrow: { name: 'Void Arrow', mpCost: 14, damage: 1.8, damageType: 'physical', element: 'dark', desc: 'Dark arrow', effect: 'Ignore 20% DEF' },
  dimensionalRift: { name: 'Dimensional Rift', mpCost: 20, damage: 2.0, damageType: 'physical', element: 'dark', desc: 'Create rift', effect: '-25% DEF' },
  voidSight: { name: 'Void Sight', mpCost: 16, damage: 0, damageType: 'buff', element: 'dark', desc: 'Void vision', effect: '+100% accuracy' },
  oblivionShot: { name: 'Oblivion Shot', mpCost: 45, damage: 4.0, damageType: 'physical', element: 'dark', desc: 'Ultimate void arrow' },
  // FROST WEAVER
  frostBolt: { name: 'Frost Bolt', mpCost: 12, damage: 1.6, damageType: 'magical', element: 'ice', desc: 'Ice bolt', effect: '-20% ATK' },
  blizzard: { name: 'Blizzard', mpCost: 28, damage: 0.8, hits: 3, damageType: 'magical', element: 'ice', desc: 'Ice storm', effect: '30% freeze' },
  iceArmor: { name: 'Ice Armor', mpCost: 20, damage: 0, damageType: 'buff', element: 'ice', desc: 'Ice armor', effect: '+50 DEF, reflect' },
  absoluteZero: { name: 'Absolute Zero', mpCost: 50, damage: 4.0, damageType: 'magical', element: 'ice', desc: 'Ultimate ice', effect: '2-turn freeze' },
  // PYROMANCER
  flameBurst: { name: 'Flame Burst', mpCost: 12, damage: 1.8, damageType: 'magical', element: 'fire', desc: 'Fire explosion', effect: 'Burn' },
  meteorShower: { name: 'Meteor Shower', mpCost: 30, damage: 0.9, hits: 3, damageType: 'magical', element: 'fire', desc: '3 meteors', effect: 'Burn' },
  combustion: { name: 'Combustion', mpCost: 18, damage: 0, damageType: 'buff', element: 'fire', desc: 'Fire boost', effect: '+40% fire DMG' },
  inferno: { name: 'Inferno', mpCost: 48, damage: 4.2, damageType: 'magical', element: 'fire', desc: 'Ultimate fire', effect: 'Strong burn' },
  // STORMCALLER
  lightningBolt: { name: 'Lightning Bolt', mpCost: 14, damage: 1.8, damageType: 'magical', element: 'lightning', desc: 'Lightning strike' },
  staticField: { name: 'Static Field', mpCost: 18, damage: 1.2, damageType: 'magical', element: 'lightning', desc: 'AoE shock', effect: '-20% accuracy' },
  stormShield: { name: 'Storm Shield', mpCost: 20, damage: 0, damageType: 'buff', element: 'lightning', desc: 'Lightning shield', effect: '25% reflect' },
  tempest: { name: 'Tempest', mpCost: 45, damage: 1.0, hits: 4, damageType: 'magical', element: 'lightning', desc: '4-hit storm' },
  // NECROMANCER
  darkBolt: { name: 'Dark Bolt', mpCost: 12, damage: 1.6, damageType: 'magical', element: 'dark', desc: 'Dark attack', effect: 'Lifesteal' },
  curseOfWeakness: { name: 'Curse of Weakness', mpCost: 16, damage: 0.8, damageType: 'magical', element: 'dark', desc: 'Curse', effect: '-30% ATK/DEF' },
  lifeLeech: { name: 'Life Leech', mpCost: 22, damage: 1.8, damageType: 'magical', element: 'dark', desc: 'Drain HP', effect: '40% lifesteal' },
  deathCoil: { name: 'Death Coil', mpCost: 42, damage: 3.8, damageType: 'magical', element: 'dark', desc: 'Ultimate dark', effect: 'Massive lifesteal' },
  // ARCANIST
  arcaneMissile: { name: 'Arcane Missile', mpCost: 10, damage: 0.6, hits: 3, damageType: 'magical', element: 'none', desc: '3 missiles' },
  spellAmplify: { name: 'Spell Amplify', mpCost: 18, damage: 0, damageType: 'buff', element: 'none', desc: 'Magic boost', effect: '+50% M.DMG' },
  manaSurge: { name: 'Mana Surge', mpCost: 15, damage: 0, damageType: 'utility', element: 'none', desc: 'Restore MP', effect: '+30% max MP' },
  arcaneBarrage: { name: 'Arcane Barrage', mpCost: 40, damage: 0.7, hits: 6, damageType: 'magical', element: 'none', desc: '6 missiles' }
};

const ELEMENT_ICONS = {
  fire: '🔥', ice: '❄️', lightning: '⚡', nature: '🌿',
  dark: '🌑', holy: '✨', earth: '🌍', none: '⚔️'
};

const HIDDEN_CLASS_ICONS = {
  flameblade: '🔥', berserker: '💢', paladin: '✨', earthshaker: '🌍', frostguard: '❄️',
  shadowDancer: '🌑', venomancer: '🐍', assassin: '⚫', phantom: '👻', bloodreaper: '🩸',
  stormRanger: '⚡', pyroArcher: '🔥', frostSniper: '❄️', natureWarden: '🌿', voidHunter: '🌀',
  frostWeaver: '❄️', pyromancer: '🔥', stormcaller: '⚡', necromancer: '💀', arcanist: '✨'
};

// Components
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
      <div className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-500" style={{ width: energy + '%' }}></div>
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

// Derived Stats Calculator
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
  const levelBonus = 1 + (level - 1) * 0.02;
  derived.pDmg = Math.floor(derived.pDmg * levelBonus);
  derived.mDmg = Math.floor(derived.mDmg * levelBonus);
  derived.critRate = Math.min(derived.critRate, 80);
  derived.accuracy = Math.min(derived.accuracy, 100);
  derived.evasion = Math.min(derived.evasion, 60);
  return derived;
};

const GamePage = () => {
  const { character, logout, refreshCharacter } = useAuth();
  const [activeTab, setActiveTab] = useState('tower');
  const [isResting, setIsResting] = useState(false);
  const [showStatModal, setShowStatModal] = useState(false);
  const [pendingStats, setPendingStats] = useState({ str: 0, agi: 0, dex: 0, int: 0, vit: 0 });
  const [isAllocating, setIsAllocating] = useState(false);
  const [isInTower, setIsInTower] = useState(false);
  const [localCharacter, setLocalCharacter] = useState(null);
  const [gameLog, setGameLog] = useState([{ type: 'system', message: 'Welcome to Awakened Protocol: Zero', timestamp: new Date() }]);
  const [towerState, setTowerState] = useState(null);
  const navigate = useNavigate();
  const logRef = useRef(null);

  useEffect(() => {
    if (character) {
      setLocalCharacter(character);
      setIsInTower(character.isInTower || false);
      if (gameLog.length === 1) {
        setGameLog(prev => [...prev, { type: 'info', message: `Hunter ${character.name} has entered the realm.`, timestamp: new Date() }]);
      }
    }
  }, [character]);

  const displayCharacter = localCharacter || character;
  const derivedStats = displayCharacter ? calculateDerivedStats(displayCharacter.stats, displayCharacter.level) : null;

  useEffect(() => {
    const interval = setInterval(async () => {
      const updated = await refreshCharacter();
      if (updated && !isInTower) setLocalCharacter(updated);
    }, 60000);
    return () => clearInterval(interval);
  }, [refreshCharacter, isInTower]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [gameLog]);

  const addLog = useCallback((type, message) => {
    setGameLog(prev => [...prev, { type, message, timestamp: new Date() }].slice(-100));
  }, []);

  const updateLocalCharacter = useCallback((updates) => {
    setLocalCharacter(prev => {
      if (!prev) return prev;
      return { ...prev, ...updates, stats: updates.stats ? { ...prev.stats, ...updates.stats } : prev.stats };
    });
  }, []);

  const handleCharacterUpdate = useCallback(async (immediateUpdates = null) => {
    if (immediateUpdates) updateLocalCharacter(immediateUpdates);
    try {
      const updated = await refreshCharacter();
      if (updated) setLocalCharacter(updated);
    } catch (err) { console.error('Failed to refresh character:', err); }
  }, [refreshCharacter, updateLocalCharacter]);

  const handleRest = async () => {
    if (isInTower) { addLog('error', 'Cannot rest while inside a tower!'); return; }
    setIsResting(true);
    try {
      const { data } = await characterAPI.rest();
      addLog('success', 'You rest and recover fully. (-' + data.goldSpent + ' gold)');
      await handleCharacterUpdate();
    } catch (err) { addLog('error', err.response?.data?.error || 'Failed to rest'); }
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
    } catch (err) { addLog('error', err.response?.data?.error || 'Failed to allocate stats'); }
    setIsAllocating(false);
  };

  const addPendingStat = (stat, amount) => {
    const total = Object.values(pendingStats).reduce((a, b) => a + b, 0);
    const newValue = pendingStats[stat] + amount;
    if (newValue >= 0 && total + amount <= displayCharacter.statPoints) {
      setPendingStats({ ...pendingStats, [stat]: newValue });
    }
  };

  const handleLogout = () => { logout(); navigate('/login'); };
  const handleTowerStateChange = useCallback((inTower) => { setIsInTower(inTower); }, []);
  const handleSaveTowerState = useCallback((state) => { setTowerState(state); }, []);

  const getSkillDamageDisplay = (skillInfo, derivedStats) => {
    if (!skillInfo || !derivedStats || skillInfo.damage === 0) return null;
    const baseDmg = skillInfo.damageType === 'magical' ? derivedStats.mDmg : derivedStats.pDmg;
    const totalDmg = Math.floor(baseDmg * (skillInfo.damage || 1));
    const hits = skillInfo.hits || 1;
    const dmgType = skillInfo.damageType === 'magical' ? 'M.DMG' : 'P.DMG';
    return hits > 1 ? `${hits}x ${totalDmg} ${dmgType}` : `${totalDmg} ${dmgType}`;
  };

  if (!displayCharacter) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  const restCost = displayCharacter.level * 250;

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <header className="bg-void-800 border-b border-purple-500/20 px-4 py-3 flex-shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-xl text-purple-400">APZ</h1>
            <span className="hidden md:block text-gray-400 text-sm">Awakened Protocol: Zero</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-amber-400 text-sm">💰 {displayCharacter.gold}</span>
            <button onClick={handleLogout} className="text-gray-400 hover:text-red-400 text-sm">Logout</button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <aside className="lg:w-72 bg-void-800/50 border-b lg:border-b-0 lg:border-r border-purple-500/10 p-4 flex flex-col flex-shrink-0">
          <div className="text-center mb-4">
            <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gradient-to-br from-purple-600/30 to-purple-800/30 border-2 border-purple-500/30 flex items-center justify-center text-3xl">
              {CLASS_ICONS[displayCharacter.baseClass]}
            </div>
            <h2 className="font-display text-lg text-white">{displayCharacter.name}</h2>
            <p className={`text-xs ${CLASS_COLORS[displayCharacter.baseClass]} capitalize`}>
              {displayCharacter.hiddenClass !== 'none' ? `${HIDDEN_CLASS_ICONS[displayCharacter.hiddenClass] || ''} ${displayCharacter.hiddenClass}` : displayCharacter.baseClass}
            </p>
          </div>
          <div className="mb-3"><ExpBar exp={displayCharacter.experience} expToLevel={displayCharacter.experienceToNextLevel} level={displayCharacter.level}/></div>
          <div className="space-y-2 mb-3">
            <StatBar label="HP" current={displayCharacter.stats.hp} max={displayCharacter.stats.maxHp} color="text-green-400" icon="❤️"/>
            <StatBar label="MP" current={displayCharacter.stats.mp} max={displayCharacter.stats.maxMp} color="text-blue-400" icon="💎"/>
          </div>
          <div className="mb-3"><EnergyBar energy={displayCharacter.energy} /></div>
          <button onClick={handleRest} disabled={isResting || displayCharacter.stats.hp >= displayCharacter.stats.maxHp || isInTower} 
            className={`w-full btn-secondary text-xs py-2 disabled:opacity-50 mb-3 ${isInTower ? 'cursor-not-allowed' : ''}`}>
            {isResting ? 'Resting...' : `🛏️ Rest (${restCost}g)`}
          </button>
          <div className="flex-1 flex flex-col min-h-0 border-t border-gray-700/50 pt-3">
            <h3 className="text-gray-400 text-xs mb-2 font-semibold flex-shrink-0">📜 ACTIVITY LOG</h3>
            <div ref={logRef} className="flex-1 overflow-y-auto bg-void-900/50 rounded-lg p-2 text-xs space-y-1">
              {gameLog.slice(-50).map((log, i) => (
                <div key={i} className={`${log.type === 'error' ? 'text-red-400' : log.type === 'success' ? 'text-green-400' : log.type === 'combat' ? 'text-yellow-400' : log.type === 'enemy' ? 'text-orange-400' : log.type === 'system' ? 'text-purple-400' : 'text-gray-400'}`}>
                  {log.message}
                </div>
              ))}
            </div>
          </div>
        </aside>

        <main className="flex-1 flex flex-col overflow-hidden">
          <nav className="bg-void-800/30 border-b border-purple-500/10 flex-shrink-0">
            <div className="flex">
              {[
                { id: 'tower', label: '🗼 Tower', icon: '🗼', disabledInTower: false },
                { id: 'inventory', label: '🎒 Items', icon: '🎒', disabledInTower: false },
                { id: 'skills', label: '⚡ Skills', icon: '⚡', disabledInTower: false },
                { id: 'tavern', label: '🍺 Tavern', icon: '🍺', disabledInTower: true },
                { id: 'status', label: '📊 Status', icon: '📊', disabledInTower: false }
              ].map(tab => {
                const isDisabled = isInTower && tab.disabledInTower;
                return (
                  <button key={tab.id} onClick={() => !isDisabled && setActiveTab(tab.id)} disabled={isDisabled}
                    className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${activeTab === tab.id ? 'text-purple-400 border-b-2 border-purple-500 bg-purple-500/5' : isDisabled ? 'text-gray-600 cursor-not-allowed opacity-50' : 'text-gray-500 hover:text-gray-300'}`}>
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.icon}</span>
                    {isDisabled && <span className="ml-1 text-xs">🔒</span>}
                  </button>
                );
              })}
            </div>
          </nav>

          <div className="flex-1 p-4 md:p-6 overflow-auto">
            {activeTab === 'tower' && (
              <div className="h-full">
                <TowerPanel character={displayCharacter} onCharacterUpdate={handleCharacterUpdate} updateLocalCharacter={updateLocalCharacter}
                  addLog={addLog} onTowerStateChange={handleTowerStateChange} savedState={towerState} onSaveState={handleSaveTowerState}/>
              </div>
            )}

            {activeTab === 'inventory' && (
              <div className="max-w-4xl mx-auto">
                <InventoryPanel character={displayCharacter} onCharacterUpdate={handleCharacterUpdate} addLog={addLog}/>
              </div>
            )}

            {activeTab === 'skills' && (
              <div className="max-w-4xl mx-auto space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-void-800/50 rounded-xl p-4 neon-border">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-display text-sm text-purple-400">BASE STATS</h3>
                      {displayCharacter.statPoints > 0 && (
                        <button onClick={() => setShowStatModal(true)} className="px-3 py-1 bg-purple-600 hover:bg-purple-500 rounded text-xs text-white">
                          +{displayCharacter.statPoints} Points
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex justify-between p-2 bg-void-900/50 rounded"><span className="text-gray-500">💪 STR</span><span className="text-red-400 font-medium">{displayCharacter.stats.str}</span></div>
                      <div className="flex justify-between p-2 bg-void-900/50 rounded"><span className="text-gray-500">⚡ AGI</span><span className="text-indigo-400 font-medium">{displayCharacter.stats.agi}</span></div>
                      <div className="flex justify-between p-2 bg-void-900/50 rounded"><span className="text-gray-500">🎯 DEX</span><span className="text-green-400 font-medium">{displayCharacter.stats.dex}</span></div>
                      <div className="flex justify-between p-2 bg-void-900/50 rounded"><span className="text-gray-500">🔮 INT</span><span className="text-purple-400 font-medium">{displayCharacter.stats.int}</span></div>
                      <div className="col-span-2 flex justify-between p-2 bg-void-900/50 rounded"><span className="text-gray-500">❤️ VIT</span><span className="text-amber-400 font-medium">{displayCharacter.stats.vit}</span></div>
                    </div>
                  </div>
                  {derivedStats && (
                    <div className="bg-void-800/50 rounded-xl p-4 neon-border">
                      <h3 className="font-display text-sm text-purple-400 mb-3">⚔️ COMBAT STATS</h3>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2 bg-void-900/50 rounded flex justify-between"><span className="text-gray-500">P.DMG</span><span className="text-red-400 font-medium">{derivedStats.pDmg}</span></div>
                        <div className="p-2 bg-void-900/50 rounded flex justify-between"><span className="text-gray-500">M.DMG</span><span className="text-purple-400 font-medium">{derivedStats.mDmg}</span></div>
                        <div className="p-2 bg-void-900/50 rounded flex justify-between"><span className="text-gray-500">P.DEF</span><span className="text-gray-300 font-medium">{derivedStats.pDef}</span></div>
                        <div className="p-2 bg-void-900/50 rounded flex justify-between"><span className="text-gray-500">M.DEF</span><span className="text-indigo-400 font-medium">{derivedStats.mDef}</span></div>
                        <div className="p-2 bg-void-900/50 rounded flex justify-between"><span className="text-gray-500">Crit Rate</span><span className="text-yellow-400 font-medium">{derivedStats.critRate.toFixed(1)}%</span></div>
                        <div className="p-2 bg-void-900/50 rounded flex justify-between"><span className="text-gray-500">Crit DMG</span><span className="text-orange-400 font-medium">{derivedStats.critDmg}%</span></div>
                        <div className="p-2 bg-void-900/50 rounded flex justify-between"><span className="text-gray-500">Accuracy</span><span className="text-blue-400 font-medium">{derivedStats.accuracy.toFixed(1)}%</span></div>
                        <div className="p-2 bg-void-900/50 rounded flex justify-between"><span className="text-gray-500">Evasion</span><span className="text-cyan-400 font-medium">{derivedStats.evasion.toFixed(1)}%</span></div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="bg-void-800/50 rounded-xl p-4 neon-border">
                  <h3 className="font-display text-sm text-purple-400 mb-3">⚡ SKILLS</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(displayCharacter.skills || []).map((skill, i) => {
                      const skillInfo = SKILL_DATABASE[skill.skillId] || {};
                      const damageDisplay = getSkillDamageDisplay(skillInfo, derivedStats);
                      return (
                        <div key={i} className="p-3 bg-void-900/50 rounded-lg border border-purple-500/20 hover:border-purple-500/40 transition-colors">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{ELEMENT_ICONS[skillInfo.element] || '⚔️'}</span>
                              <span className="font-medium text-white text-sm">{skill.name}</span>
                            </div>
                            <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded">{skillInfo.mpCost || '?'} MP</span>
                          </div>
                          <p className="text-xs text-gray-400 mb-2">{skillInfo.desc || 'No description'}</p>
                          <div className="flex flex-wrap gap-2 text-xs">
                            {damageDisplay && (
                              <span className={`px-2 py-0.5 rounded ${skillInfo.damageType === 'magical' ? 'bg-purple-500/20 text-purple-400' : 'bg-red-500/20 text-red-400'}`}>
                                {damageDisplay}
                              </span>
                            )}
                            {skillInfo.effect && <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded">{skillInfo.effect}</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'tavern' && !isInTower && (
              <div className="max-w-4xl mx-auto">
                <TavernPanel character={displayCharacter} onCharacterUpdate={handleCharacterUpdate} addLog={addLog}/>
              </div>
            )}
            {activeTab === 'tavern' && isInTower && (
              <div className="max-w-4xl mx-auto">
                <div className="bg-void-800/50 rounded-xl p-6 neon-border text-center">
                  <div className="text-6xl mb-4">🔒</div>
                  <h3 className="font-display text-xl text-red-400 mb-2">Tavern Locked</h3>
                  <p className="text-gray-400">You cannot access the tavern while inside a tower.</p>
                </div>
              </div>
            )}

            {activeTab === 'status' && (
              <div className="max-w-4xl mx-auto space-y-4">
                <div className="bg-void-800/50 rounded-xl p-4 neon-border">
                  <h3 className="font-display text-sm text-purple-400 mb-3">HUNTER STATUS</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div className="p-3 bg-void-900/50 rounded-lg text-center">
                      <div className="text-gray-500 text-xs mb-1">Class</div>
                      <div className={CLASS_COLORS[displayCharacter.baseClass]}>{CLASS_ICONS[displayCharacter.baseClass]} {displayCharacter.baseClass}</div>
                    </div>
                    <div className="p-3 bg-void-900/50 rounded-lg text-center">
                      <div className="text-gray-500 text-xs mb-1">Hidden Class</div>
                      <div className={displayCharacter.hiddenClass !== 'none' ? 'text-purple-400' : 'text-gray-600'}>
                        {displayCharacter.hiddenClass !== 'none' ? `${HIDDEN_CLASS_ICONS[displayCharacter.hiddenClass] || ''} ${displayCharacter.hiddenClass}` : 'Not Unlocked'}
                      </div>
                    </div>
                    <div className="p-3 bg-void-900/50 rounded-lg text-center">
                      <div className="text-gray-500 text-xs mb-1">Tower</div>
                      <div className="text-white">{displayCharacter.currentTower} - F{displayCharacter.currentFloor}</div>
                    </div>
                    <div className="p-3 bg-void-900/50 rounded-lg text-center">
                      <div className="text-gray-500 text-xs mb-1">Crystals</div>
                      <div className="text-cyan-400">💎 {displayCharacter.memoryCrystals}</div>
                    </div>
                  </div>
                </div>
                <div className="bg-void-800/50 rounded-xl p-4 neon-border">
                  <h3 className="font-display text-sm text-purple-400 mb-3">📈 STATISTICS</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="text-center p-3 bg-void-900/50 rounded-lg">
                      <div className="text-xl font-bold text-red-400">{displayCharacter.statistics?.totalKills || 0}</div>
                      <div className="text-xs text-gray-500">Total Kills</div>
                    </div>
                    <div className="text-center p-3 bg-void-900/50 rounded-lg">
                      <div className="text-xl font-bold text-purple-400">{displayCharacter.statistics?.bossKills || 0}</div>
                      <div className="text-xs text-gray-500">Boss Kills</div>
                    </div>
                    <div className="text-center p-3 bg-void-900/50 rounded-lg">
                      <div className="text-xl font-bold text-blue-400">{displayCharacter.statistics?.floorsCleared || 0}</div>
                      <div className="text-xs text-gray-500">Floors Cleared</div>
                    </div>
                    <div className="text-center p-3 bg-void-900/50 rounded-lg">
                      <div className="text-xl font-bold text-amber-400">{displayCharacter.statistics?.scrollsFound || 0}</div>
                      <div className="text-xs text-gray-500">Scrolls Found</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

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
                    {pendingStats[stat] > 0 && <span className="text-green-400">+{pendingStats[stat]}</span>}
                    <div className="flex gap-1">
                      <button onClick={() => addPendingStat(stat, -1)} disabled={pendingStats[stat] <= 0}
                        className="w-8 h-8 bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 rounded text-red-400 disabled:opacity-30">-</button>
                      <button onClick={() => addPendingStat(stat, 1)} disabled={Object.values(pendingStats).reduce((a, b) => a + b, 0) >= displayCharacter.statPoints}
                        className="w-8 h-8 bg-green-600/20 hover:bg-green-600/40 border border-green-500/30 rounded text-green-400 disabled:opacity-30">+</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowStatModal(false); setPendingStats({ str: 0, agi: 0, dex: 0, int: 0, vit: 0 }); }} className="flex-1 btn-secondary">Cancel</button>
              <button onClick={handleAllocateStats} disabled={isAllocating || Object.values(pendingStats).reduce((a, b) => a + b, 0) === 0}
                className="flex-1 btn-primary disabled:opacity-50">{isAllocating ? 'Allocating...' : 'Confirm'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GamePage;
