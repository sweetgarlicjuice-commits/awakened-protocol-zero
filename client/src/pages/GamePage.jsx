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
  
  // ==================== FLAMEBLADE (Swordsman) ====================
  flameSlash: { name: 'Flame Slash', mpCost: 15, damage: 1.8, element: 'fire', desc: 'Fire-infused slash. Applies burn.', effect: 'burn' },
  infernoStrike: { name: 'Inferno Strike', mpCost: 25, damage: 2.8, element: 'fire', desc: 'Powerful fire strike. High single-target DMG.' },
  fireAura: { name: 'Fire Aura', mpCost: 20, damage: 0, element: 'fire', desc: '+30% P.DMG, reflect 15% DMG for 3 turns.', effect: '+30% P.DMG' },
  volcanicRage: { name: 'Volcanic Rage', mpCost: 40, damage: 3.5, element: 'fire', desc: 'Massive fire eruption + burn.', effect: 'burn' },
  
  // ==================== BERSERKER (Swordsman) ====================
  rageSlash: { name: 'Rage Slash', mpCost: 10, damage: 2.0, element: 'none', desc: 'Furious slash. Costs 5% HP.', effect: '-5% HP' },
  bloodFury: { name: 'Blood Fury', mpCost: 20, damage: 0, element: 'none', desc: '+50% P.DMG, -20% DEF for 3 turns.', effect: '+50% P.DMG' },
  recklessCharge: { name: 'Reckless Charge', mpCost: 15, damage: 2.5, element: 'none', desc: 'Charging attack. Costs 10% HP.', effect: '-10% HP' },
  deathwish: { name: 'Deathwish', mpCost: 35, damage: 4.0, element: 'none', desc: 'Ultimate attack. Costs 20% HP.', effect: '-20% HP' },
  
  // ==================== PALADIN (Swordsman) ====================
  holyStrike: { name: 'Holy Strike', mpCost: 12, damage: 1.6, element: 'holy', desc: 'Holy-infused attack. Bonus vs undead.' },
  divineShield: { name: 'Divine Shield', mpCost: 18, damage: 0, element: 'holy', desc: 'Shield = 200% P.DEF.', effect: 'shield' },
  healingLight: { name: 'Healing Light', mpCost: 20, damage: 0, element: 'holy', desc: 'Heal 35% of max HP.', effect: 'heal 35%' },
  judgment: { name: 'Judgment', mpCost: 35, damage: 3.0, element: 'holy', desc: 'Divine judgment. Removes debuffs.', effect: 'purify' },
  
  // ==================== EARTHSHAKER (Swordsman) ====================
  groundSlam: { name: 'Ground Slam', mpCost: 12, damage: 1.5, element: 'earth', desc: 'Slam ground. -20% enemy DEF.', effect: '-20% DEF' },
  stoneSkin: { name: 'Stone Skin', mpCost: 15, damage: 0, element: 'earth', desc: '+50% P.DEF for 3 turns.', effect: '+50% P.DEF' },
  earthquake: { name: 'Earthquake', mpCost: 25, damage: 2.2, element: 'earth', desc: 'Massive quake. -30% enemy DEF.', effect: '-30% DEF' },
  titansWrath: { name: "Titan's Wrath", mpCost: 40, damage: 3.2, element: 'earth', desc: 'Ultimate earth attack + stun.', effect: 'stun' },
  
  // ==================== FROSTGUARD (Swordsman) ====================
  frostStrike: { name: 'Frost Strike', mpCost: 12, damage: 1.4, element: 'ice', desc: 'Ice slash. -15% enemy ATK.', effect: '-15% ATK' },
  iceBarrier: { name: 'Ice Barrier', mpCost: 18, damage: 0, element: 'ice', desc: 'Ice shield = 150% P.DEF, reflect 20%.', effect: 'shield' },
  glacialSlash: { name: 'Glacial Slash', mpCost: 22, damage: 2.0, element: 'ice', desc: 'Powerful ice slash. 30% freeze.', effect: 'freeze' },
  absoluteDefense: { name: 'Absolute Defense', mpCost: 35, damage: 0, element: 'ice', desc: '+100% DEF, immune to debuffs 2 turns.', effect: '+100% DEF' },
  
  // ==================== SHADOW DANCER (Thief) ====================
  shadowStrike: { name: 'Shadow Strike', mpCost: 12, damage: 2.2, element: 'dark', desc: 'Strike from shadows. +40% crit.', effect: '+40% crit' },
  vanish: { name: 'Vanish', mpCost: 20, damage: 0, element: 'dark', desc: 'Invisible. Next attack auto-crits.', effect: 'stealth' },
  deathMark: { name: 'Death Mark', mpCost: 18, damage: 1.2, element: 'dark', desc: 'Mark target. +30% DMG taken.', effect: '+30% vuln' },
  shadowDance: { name: 'Shadow Dance', mpCost: 35, damage: 0.8, hits: 5, element: 'dark', desc: '5-hit combo from the shadows.' },
  
  // ==================== VENOMANCER (Thief) ====================
  toxicStab: { name: 'Toxic Stab', mpCost: 10, damage: 1.4, element: 'nature', desc: 'Poison stab. Strong DoT.', effect: 'poison' },
  acidSpray: { name: 'Acid Spray', mpCost: 15, damage: 1.2, element: 'nature', desc: 'Acid attack. -25% DEF.', effect: '-25% DEF' },
  plagueCloud: { name: 'Plague Cloud', mpCost: 22, damage: 0.8, element: 'nature', desc: 'Poison cloud. Heavy DoT.', effect: 'poison' },
  venomousEnd: { name: 'Venomous End', mpCost: 38, damage: 2.5, element: 'nature', desc: 'Execute <30% HP. Massive poison.', effect: 'execute' },
  
  // ==================== ASSASSIN (Thief) ====================
  assassinate: { name: 'Assassinate', mpCost: 15, damage: 3.0, element: 'none', desc: 'Execute <25% HP. +100% crit DMG.', effect: 'execute' },
  shadowStep: { name: 'Shadow Step', mpCost: 12, damage: 1.5, element: 'dark', desc: 'Teleport strike. +50% evasion.', effect: '+50% evasion' },
  markedForDeath: { name: 'Marked for Death', mpCost: 18, damage: 0, element: 'dark', desc: '+50% crit chance on target.', effect: '+50% crit' },
  deathLotus: { name: 'Death Lotus', mpCost: 40, damage: 1.0, hits: 6, element: 'dark', desc: '6-hit spinning attack.' },
  
  // ==================== PHANTOM (Thief) ====================
  phantomStrike: { name: 'Phantom Strike', mpCost: 12, damage: 1.8, element: 'dark', desc: 'Ghostly attack. Ignores 30% DEF.', effect: 'armor pierce' },
  phaseShift: { name: 'Phase Shift', mpCost: 15, damage: 0, element: 'dark', desc: '+60% evasion for 2 turns.', effect: '+60% evasion' },
  soulDrain: { name: 'Soul Drain', mpCost: 20, damage: 1.5, element: 'dark', desc: 'Drain HP and MP from enemy.', effect: 'lifesteal' },
  etherealBurst: { name: 'Ethereal Burst', mpCost: 35, damage: 3.0, element: 'dark', desc: 'Massive dark explosion.' },
  
  // ==================== BLOODREAPER (Thief) ====================
  bloodSlash: { name: 'Blood Slash', mpCost: 10, damage: 1.8, element: 'dark', desc: 'Slash that heals 20% DMG dealt.', effect: 'lifesteal' },
  crimsonDance: { name: 'Crimson Dance', mpCost: 18, damage: 0.6, hits: 4, element: 'dark', desc: '4-hit attack, each heals.' },
  bloodPact: { name: 'Blood Pact', mpCost: 15, damage: 0, element: 'dark', desc: '-20% HP, +40% P.DMG 3 turns.', effect: '+40% P.DMG' },
  sanguineHarvest: { name: 'Sanguine Harvest', mpCost: 40, damage: 3.5, element: 'dark', desc: 'Massive attack. Heal 50% DMG.', effect: 'lifesteal' },
  
  // ==================== STORM RANGER (Archer) ====================
  lightningArrow: { name: 'Lightning Arrow', mpCost: 14, damage: 2.0, element: 'lightning', desc: 'Electric arrow. High DMG.', effect: 'shock' },
  chainLightning: { name: 'Chain Lightning', mpCost: 22, damage: 0.7, hits: 3, element: 'lightning', desc: 'Lightning chains 3 times.' },
  stormEye: { name: 'Storm Eye', mpCost: 18, damage: 0, element: 'lightning', desc: '+50% accuracy, +30% crit.', effect: '+30% crit' },
  thunderstorm: { name: 'Thunderstorm', mpCost: 45, damage: 0.8, hits: 4, element: 'lightning', desc: '4-hit lightning storm.' },
  
  // ==================== PYRO ARCHER (Archer) ====================
  flameArrow: { name: 'Flame Arrow', mpCost: 12, damage: 1.8, element: 'fire', desc: 'Fire arrow + burn.', effect: 'burn' },
  explosiveShot: { name: 'Explosive Shot', mpCost: 20, damage: 2.5, element: 'fire', desc: 'Exploding arrow. High DMG.' },
  infernoQuiver: { name: 'Inferno Quiver', mpCost: 18, damage: 0, element: 'fire', desc: '+30% fire DMG for 3 turns.', effect: '+30% fire' },
  phoenixArrow: { name: 'Phoenix Arrow', mpCost: 42, damage: 3.8, element: 'fire', desc: 'Ultimate fire arrow + burn.', effect: 'burn' },
  
  // ==================== FROST SNIPER (Archer) ====================
  iceArrow: { name: 'Ice Arrow', mpCost: 12, damage: 1.6, element: 'ice', desc: 'Freezing arrow. -20% ATK.', effect: '-20% ATK' },
  piercingCold: { name: 'Piercing Cold', mpCost: 18, damage: 2.2, element: 'ice', desc: 'Ice shot that ignores 25% DEF.', effect: 'armor pierce' },
  frozenPrecision: { name: 'Frozen Precision', mpCost: 15, damage: 0, element: 'ice', desc: '+40% crit DMG for 3 turns.', effect: '+40% crit DMG' },
  avalancheShot: { name: 'Avalanche Shot', mpCost: 40, damage: 3.2, element: 'ice', desc: 'Massive ice attack + freeze.', effect: 'freeze' },
  
  // ==================== NATURE WARDEN (Archer) ====================
  vineArrow: { name: 'Vine Arrow', mpCost: 10, damage: 1.4, element: 'nature', desc: 'Nature arrow. -15% evasion.', effect: '-15% evasion' },
  natureBounty: { name: "Nature's Bounty", mpCost: 18, damage: 0, element: 'nature', desc: 'Heal 25% HP + regen.', effect: 'heal' },
  thornBarrage: { name: 'Thorn Barrage', mpCost: 22, damage: 0.6, hits: 4, element: 'nature', desc: '4 thorn shots.' },
  gaiaWrath: { name: "Gaia's Wrath", mpCost: 38, damage: 3.0, element: 'nature', desc: 'Nature explosion + heal 20%.', effect: 'heal' },
  
  // ==================== VOID HUNTER (Archer) ====================
  voidArrow: { name: 'Void Arrow', mpCost: 14, damage: 1.8, element: 'dark', desc: 'Dark arrow. Ignores 20% DEF.' },
  dimensionalRift: { name: 'Dimensional Rift', mpCost: 20, damage: 2.0, element: 'dark', desc: 'Create rift. -25% DEF.', effect: '-25% DEF' },
  voidSight: { name: 'Void Sight', mpCost: 16, damage: 0, element: 'dark', desc: '+100% accuracy, see stealth.', effect: '+100% acc' },
  oblivionShot: { name: 'Oblivion Shot', mpCost: 45, damage: 4.0, element: 'dark', desc: 'Ultimate void arrow.' },
  
  // ==================== FROST WEAVER (Mage) ====================
  frostBolt: { name: 'Frost Bolt', mpCost: 12, damage: 1.6, element: 'ice', desc: 'Ice bolt. -20% ATK.', effect: '-20% ATK' },
  blizzard: { name: 'Blizzard', mpCost: 28, damage: 0.8, hits: 3, element: 'ice', desc: '3-hit ice storm. 30% freeze.', effect: 'freeze' },
  iceArmor: { name: 'Ice Armor', mpCost: 20, damage: 0, element: 'ice', desc: '+50 DEF, reflect 20% DMG.', effect: '+50 DEF' },
  absoluteZero: { name: 'Absolute Zero', mpCost: 50, damage: 4.0, element: 'ice', desc: 'Ultimate ice. 2-turn freeze.', effect: 'freeze' },
  
  // ==================== PYROMANCER (Mage) ====================
  flameBurst: { name: 'Flame Burst', mpCost: 12, damage: 1.8, element: 'fire', desc: 'Fire explosion + burn.', effect: 'burn' },
  meteorShower: { name: 'Meteor Shower', mpCost: 30, damage: 0.9, hits: 3, element: 'fire', desc: '3 meteors + burn.', effect: 'burn' },
  combustion: { name: 'Combustion', mpCost: 18, damage: 0, element: 'fire', desc: '+40% fire DMG for 3 turns.', effect: '+40% fire' },
  inferno: { name: 'Inferno', mpCost: 48, damage: 4.2, element: 'fire', desc: 'Ultimate fire + strong burn.', effect: 'burn' },
  
  // ==================== STORMCALLER (Mage) ====================
  lightningBolt: { name: 'Lightning Bolt', mpCost: 14, damage: 1.8, element: 'lightning', desc: 'Lightning strike. High accuracy.' },
  staticField: { name: 'Static Field', mpCost: 18, damage: 1.2, element: 'lightning', desc: 'AoE shock. -20% accuracy.', effect: '-20% acc' },
  stormShield: { name: 'Storm Shield', mpCost: 20, damage: 0, element: 'lightning', desc: 'Shield + 25% reflect.', effect: 'shield' },
  tempest: { name: 'Tempest', mpCost: 45, damage: 1.0, hits: 4, element: 'lightning', desc: '4-hit ultimate storm.' },
  
  // ==================== NECROMANCER (Mage) ====================
  darkBolt: { name: 'Dark Bolt', mpCost: 12, damage: 1.6, element: 'dark', desc: 'Dark attack + lifesteal.', effect: 'lifesteal' },
  curseOfWeakness: { name: 'Curse of Weakness', mpCost: 16, damage: 0.8, element: 'dark', desc: '-30% ATK and DEF.', effect: 'weaken' },
  lifeLeech: { name: 'Life Leech', mpCost: 22, damage: 1.8, element: 'dark', desc: 'Drain HP. Heal 40% DMG.', effect: 'lifesteal' },
  deathCoil: { name: 'Death Coil', mpCost: 42, damage: 3.8, element: 'dark', desc: 'Ultimate dark + massive heal.', effect: 'lifesteal' },
  
  // ==================== ARCANIST (Mage) ====================
  arcaneMissile: { name: 'Arcane Missile', mpCost: 10, damage: 0.6, hits: 3, element: 'none', desc: '3 magic missiles.' },
  spellAmplify: { name: 'Spell Amplify', mpCost: 18, damage: 0, element: 'none', desc: '+50% M.DMG for 3 turns.', effect: '+50% M.DMG' },
  manaSurge: { name: 'Mana Surge', mpCost: 15, damage: 0, element: 'none', desc: 'Restore 30% max MP.', effect: 'MP restore' },
  arcaneBarrage: { name: 'Arcane Barrage', mpCost: 40, damage: 0.7, hits: 6, element: 'none', desc: '6 powerful missiles.' }
};

// Element icons for skills
const ELEMENT_ICONS = {
  fire: '🔥',
  ice: '❄️',
  lightning: '⚡',
  earth: '🌍',
  nature: '🌿',
  dark: '🌑',
  holy: '✨',
  none: ''
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
  const [statusSubTab, setStatusSubTab] = useState('info'); // 'info' or 'combat'
  const [isResting, setIsResting] = useState(false);
  const [showStatModal, setShowStatModal] = useState(false);
  const [showCombatStats, setShowCombatStats] = useState(false);
  const [pendingStats, setPendingStats] = useState({ str: 0, agi: 0, dex: 0, int: 0, vit: 0 });
  const [isAllocating, setIsAllocating] = useState(false);
  const [isInTower, setIsInTower] = useState(false);
  const [showActivityLog, setShowActivityLog] = useState(true);
  const [gameLog, setGameLog] = useState([
    { type: 'system', message: 'Welcome to Awakened Protocol: Zero', timestamp: new Date() },
    { type: 'info', message: 'Hunter ' + (character?.name || 'Unknown') + ' has entered the realm.', timestamp: new Date() }
  ]);
  const navigate = useNavigate();

  // Calculate derived stats for display
  const derivedStats = character ? calculateDerivedStats(character.stats, character.level) : null;

  useEffect(() => {
    const interval = setInterval(() => refreshCharacter(), 60000);
    return () => clearInterval(interval);
  }, [refreshCharacter]);

  // Sync isInTower state with character data
  useEffect(() => {
    if (character) {
      setIsInTower(character.isInTower || false);
    }
  }, [character]);

  const addLog = (type, message) => {
    setGameLog(prev => [...prev, { type, message, timestamp: new Date() }].slice(-50));
  };

  const handleRest = async () => {
    if (isInTower) {
      addLog('error', 'Cannot rest while inside a tower! Leave the tower first.');
      return;
    }
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

  // Handler for TowerPanel to update isInTower state
  const handleTowerStateChange = (inTower) => {
    setIsInTower(inTower);
  };

  if (!character) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  // Calculate rest cost
  const restCost = character.level * 250;

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
              {character.hiddenClass !== 'none' 
                ? `${HIDDEN_CLASS_ICONS[character.hiddenClass] || ''} ${character.hiddenClass}` 
                : character.baseClass}
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
            {/* Rest button - disabled when in tower */}
            <button 
              onClick={handleRest} 
              disabled={isResting || character.stats.hp >= character.stats.maxHp || isInTower} 
              className={`w-full btn-secondary text-sm py-2 disabled:opacity-50 ${isInTower ? 'cursor-not-allowed' : ''}`}
              title={isInTower ? 'Cannot rest while inside tower' : ''}
            >
              {isResting ? 'Resting...' : `🛏️ Rest (${restCost}g)`}
            </button>
            {isInTower && (
              <p className="text-xs text-red-400 text-center">⚠️ Leave tower to rest</p>
            )}
          </div>

          {/* Collapsible Activity Log - Latest at top */}
          <div className="mt-4">
            <button 
              onClick={() => setShowActivityLog(!showActivityLog)} 
              className="w-full flex items-center justify-between text-gray-400 text-sm py-2 px-3 bg-void-900/50 rounded-lg hover:bg-void-900 transition-colors"
            >
              <span>📜 Activity Log</span>
              <span className="text-xs">{showActivityLog ? '▼' : '▶'}</span>
            </button>
            {showActivityLog && (
              <div className="mt-2 h-32 bg-void-900/50 rounded-lg p-2 overflow-y-auto">
                <div className="font-mono text-xs space-y-1">
                  {[...gameLog].reverse().slice(0, 20).map((log, i) => (
                    <div key={i} className={log.type === 'system' ? 'text-purple-400' : log.type === 'success' ? 'text-green-400' : log.type === 'error' ? 'text-red-400' : log.type === 'combat' ? 'text-amber-400' : 'text-gray-400'}>
                      <span className="text-gray-600 mr-1">[{log.timestamp.toLocaleTimeString()}]</span>
                      {log.message}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        <main className="flex-1 flex flex-col">
          <nav className="bg-void-800/30 border-b border-purple-500/10">
            <div className="flex">
              {/* Tab order: Status, Tower, Items, Tavern */}
              {[
                { id: 'status', label: '📊 Status', icon: '📊', disabledInTower: false },
                { id: 'tower', label: '🗼 Tower', icon: '🗼', disabledInTower: false },
                { id: 'inventory', label: '🎒 Items', icon: '🎒', disabledInTower: false },
                { id: 'tavern', label: '🍺 Tavern', icon: '🍺', disabledInTower: true }
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
            {/* STATUS TAB with Sub-tabs */}
            {activeTab === 'status' && (
              <div className="max-w-4xl mx-auto space-y-4">
                {/* Sub-tab Navigation */}
                <div className="flex gap-2">
                  <button 
                    onClick={() => setStatusSubTab('info')}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                      statusSubTab === 'info' 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-void-800/50 text-gray-400 hover:text-white'
                    }`}
                  >
                    👤 Hunter Info
                  </button>
                  <button 
                    onClick={() => setStatusSubTab('combat')}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                      statusSubTab === 'combat' 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-void-800/50 text-gray-400 hover:text-white'
                    }`}
                  >
                    ⚔️ Combat Info
                  </button>
                </div>

                {/* Hunter Info Sub-tab (Hunter Status + Statistics) */}
                {statusSubTab === 'info' && (
                  <div className="space-y-6">
                    {/* Hunter Status Card */}
                    <div className="bg-void-800/50 rounded-xl p-6 neon-border">
                      <h3 className="font-display text-lg text-purple-400 mb-4">HUNTER STATUS</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="flex justify-between py-2 border-b border-gray-700/30">
                            <span className="text-gray-400">Name</span>
                            <span className="text-white">{character.name}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-700/30">
                            <span className="text-gray-400">Class</span>
                            <span className={CLASS_COLORS[character.baseClass]}>
                              {CLASS_ICONS[character.baseClass]} {character.baseClass.charAt(0).toUpperCase() + character.baseClass.slice(1)}
                            </span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-700/30">
                            <span className="text-gray-400">Hidden Class</span>
                            <span className={character.hiddenClass !== 'none' ? 'text-purple-400' : 'text-gray-600'}>
                              {character.hiddenClass !== 'none' 
                                ? `${HIDDEN_CLASS_ICONS[character.hiddenClass] || ''} ${character.hiddenClass}` 
                                : 'Not Unlocked'}
                            </span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-700/30">
                            <span className="text-gray-400">Level</span>
                            <span className="text-amber-400">{character.level}</span>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="flex justify-between py-2 border-b border-gray-700/30">
                            <span className="text-gray-400">Current Tower</span>
                            <span className="text-white">{character.currentTower}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-700/30">
                            <span className="text-gray-400">Current Floor</span>
                            <span className="text-white">{character.currentFloor}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-700/30">
                            <span className="text-gray-400">Gold</span>
                            <span className="text-amber-400">💰 {character.gold}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-700/30">
                            <span className="text-gray-400">Memory Crystals</span>
                            <span className="text-cyan-400">💎 {character.memoryCrystals}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Statistics Card */}
                    <div className="bg-void-800/50 rounded-xl p-6 neon-border">
                      <h3 className="font-display text-lg text-purple-400 mb-4">📈 STATISTICS</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-void-900/50 rounded-lg">
                          <div className="text-2xl font-bold text-red-400">{character.statistics?.totalKills || 0}</div>
                          <div className="text-xs text-gray-500">Total Kills</div>
                        </div>
                        <div className="text-center p-3 bg-void-900/50 rounded-lg">
                          <div className="text-2xl font-bold text-purple-400">{character.statistics?.bossKills || 0}</div>
                          <div className="text-xs text-gray-500">Boss Kills</div>
                        </div>
                        <div className="text-center p-3 bg-void-900/50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-400">{character.statistics?.floorsCleared || 0}</div>
                          <div className="text-xs text-gray-500">Floors Cleared</div>
                        </div>
                        <div className="text-center p-3 bg-void-900/50 rounded-lg">
                          <div className="text-2xl font-bold text-amber-400">{character.statistics?.scrollsFound || 0}</div>
                          <div className="text-xs text-gray-500">Scrolls Found</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Combat Info Sub-tab (Stats + Combat Stats + Skills) */}
                {statusSubTab === 'combat' && (
                  <div className="space-y-6">
                    {/* Stats + Combat Stats Row */}
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

                    {/* Skills Section */}
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
              </div>
            )}

            {activeTab === 'tower' && (
              <div className="max-w-4xl mx-auto">
                <TowerPanel 
                  character={character} 
                  onCharacterUpdate={refreshCharacter}
                  addLog={addLog}
                  onTowerStateChange={handleTowerStateChange}
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

            {activeTab === 'tavern' && !isInTower && (
              <div className="max-w-4xl mx-auto">
                <TavernPanel 
                  character={character} 
                  onCharacterUpdate={refreshCharacter}
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

      {/* NEW: Combat Stats Modal */}
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
