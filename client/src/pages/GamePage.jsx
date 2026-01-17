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
  fireArrow: { name: 'Fire Arrow', mpCost: 12, damage: 1.6, element: 'fire', desc: 'Flaming arrow. Burns.', effect: 'burn' },
  explosiveShot: { name: 'Explosive Shot', mpCost: 20, damage: 1.8, element: 'fire', desc: 'Exploding arrow. AoE damage.' },
  igniteTrap: { name: 'Ignite Trap', mpCost: 15, damage: 0.5, element: 'fire', desc: 'Fire trap. Burns for 4 turns.', effect: 'burn' },
  phoenixArrow: { name: 'Phoenix Arrow', mpCost: 42, damage: 3.2, element: 'fire', desc: 'Massive fire arrow. High DMG + burn.' },
  
  // ==================== FROST SNIPER (Archer) ====================
  iceArrow: { name: 'Ice Arrow', mpCost: 12, damage: 1.5, element: 'ice', desc: 'Freezing arrow. Slows enemy.', effect: 'slow' },
  frozenAim: { name: 'Frozen Aim', mpCost: 18, damage: 0, element: 'ice', desc: '+40% crit, +50% crit DMG for 2 turns.', effect: '+40% crit' },
  piercingCold: { name: 'Piercing Cold', mpCost: 22, damage: 2.2, element: 'ice', desc: 'Armor-piercing ice shot.', effect: 'armor pierce' },
  absoluteZero: { name: 'Absolute Zero', mpCost: 45, damage: 2.8, element: 'ice', desc: 'Ultimate ice attack. 50% freeze.', effect: 'freeze' },
  
  // ==================== NATURE WARDEN (Archer) ====================
  thornArrow: { name: 'Thorn Arrow', mpCost: 10, damage: 1.4, element: 'nature', desc: 'Thorny arrow. DoT.', effect: 'thorn' },
  naturesBlessing: { name: "Nature's Blessing", mpCost: 20, damage: 0, element: 'nature', desc: 'Heal 25% HP, +20% DEF.', effect: 'heal' },
  vineSnare: { name: 'Vine Snare', mpCost: 15, damage: 0.8, element: 'nature', desc: 'Root enemy. -30% evasion.', effect: 'root' },
  wildHunt: { name: 'Wild Hunt', mpCost: 40, damage: 0.7, hits: 5, element: 'nature', desc: '5 nature arrows.' },
  
  // ==================== VOID HUNTER (Archer) ====================
  voidArrow: { name: 'Void Arrow', mpCost: 15, damage: 1.8, element: 'dark', desc: 'Dark arrow. Ignores 40% DEF.', effect: 'armor pierce' },
  nullField: { name: 'Null Field', mpCost: 20, damage: 0, element: 'dark', desc: 'Nullify enemy buffs.', effect: 'dispel' },
  darkVolley: { name: 'Dark Volley', mpCost: 28, damage: 0.6, hits: 4, element: 'dark', desc: '4 void arrows.' },
  oblivionShot: { name: 'Oblivion Shot', mpCost: 45, damage: 3.5, element: 'dark', desc: 'Ultimate void attack. Massive DMG.' },
  
  // ==================== FROST WEAVER (Mage) ====================
  frostBolt: { name: 'Frost Bolt', mpCost: 12, damage: 1.5, element: 'ice', desc: 'Ice bolt. Slows enemy.', effect: 'slow' },
  blizzard: { name: 'Blizzard', mpCost: 30, damage: 1.2, element: 'ice', desc: 'AoE ice storm. Slows all.', effect: 'slow' },
  iceArmor: { name: 'Ice Armor', mpCost: 20, damage: 0, element: 'ice', desc: '+40% P.DEF, reflect 10% DMG.', effect: '+40% P.DEF' },
  glacialSpike: { name: 'Glacial Spike', mpCost: 45, damage: 3.0, element: 'ice', desc: 'Massive ice spike. 40% freeze.', effect: 'freeze' },
  
  // ==================== PYROMANCER (Mage) ====================
  flameBurst: { name: 'Flame Burst', mpCost: 14, damage: 1.8, element: 'fire', desc: 'Fire explosion. Burns.', effect: 'burn' },
  combustion: { name: 'Combustion', mpCost: 22, damage: 2.2, element: 'fire', desc: 'Spontaneous combustion. High DMG.' },
  inferno: { name: 'Inferno', mpCost: 35, damage: 1.5, element: 'fire', desc: 'AoE fire wave. Burns all.', effect: 'burn' },
  hellfire: { name: 'Hellfire', mpCost: 50, damage: 3.8, element: 'fire', desc: 'Ultimate fire magic. Massive DMG.' },
  
  // ==================== STORMCALLER (Mage) ====================
  shock: { name: 'Shock', mpCost: 10, damage: 1.4, element: 'lightning', desc: 'Electric shock.', effect: 'shock' },
  lightningBolt: { name: 'Lightning Bolt', mpCost: 18, damage: 2.0, element: 'lightning', desc: 'Powerful lightning strike.' },
  thunderChain: { name: 'Thunder Chain', mpCost: 28, damage: 0.8, hits: 4, element: 'lightning', desc: '4-chain lightning.' },
  tempest: { name: 'Tempest', mpCost: 48, damage: 1.4, element: 'lightning', desc: 'AoE lightning storm. Massive DMG.' },
  
  // ==================== NECROMANCER (Mage) ====================
  darkBolt: { name: 'Dark Bolt', mpCost: 12, damage: 1.5, element: 'dark', desc: 'Dark magic bolt.', effect: 'drain' },
  lifeSteal: { name: 'Life Steal', mpCost: 18, damage: 1.2, element: 'dark', desc: 'Drain HP = 50% DMG.', effect: 'lifesteal' },
  curseOfDeath: { name: 'Curse of Death', mpCost: 25, damage: 0, element: 'dark', desc: '-30% ATK, -30% DEF.', effect: 'curse' },
  deathCoil: { name: 'Death Coil', mpCost: 45, damage: 3.2, element: 'dark', desc: 'Ultimate dark magic. Heal 30% DMG.' },
  
  // ==================== ARCANIST (Mage) ====================
  arcaneMissile: { name: 'Arcane Missile', mpCost: 10, damage: 0.5, hits: 3, element: 'holy', desc: '3 arcane missiles.' },
  manaSurge: { name: 'Mana Surge', mpCost: 0, damage: 0, element: 'holy', desc: 'Restore 30% MP.', effect: 'mana restore' },
  arcaneBarrier: { name: 'Arcane Barrier', mpCost: 22, damage: 0, element: 'holy', desc: 'Shield = 150% M.DEF.', effect: 'shield' },
  arcaneNova: { name: 'Arcane Nova', mpCost: 50, damage: 1.2, hits: 4, element: 'holy', desc: '4-hit arcane explosion.' }
};

// Component for skill cards - reusable
const SkillCard = ({ skill, skillData }) => {
  if (!skillData) return null;
  
  return (
    <div className="p-3 bg-void-800/50 rounded-lg border border-purple-500/10 hover:border-purple-500/30 transition-colors">
      <div className="flex justify-between items-start mb-1">
        <span className="font-medium text-purple-300">{skillData.name}</span>
        <span className="text-xs text-blue-400">{skillData.mpCost} MP</span>
      </div>
      <p className="text-xs text-gray-400 mb-1">{skillData.desc}</p>
      <div className="flex gap-2 text-xs">
        {skillData.damage > 0 && (
          <span className="text-red-400">
            {skillData.hits ? `${Math.round(skillData.damage * 100)}% x${skillData.hits}` : `${Math.round(skillData.damage * 100)}%`}
          </span>
        )}
        {skillData.effect && <span className="text-green-400">{skillData.effect}</span>}
        {skillData.element !== 'none' && (
          <span className="text-amber-400 capitalize">{skillData.element}</span>
        )}
      </div>
    </div>
  );
};

const StatBar = ({ label, current, max, color, icon }) => {
  const percentage = Math.round((current / max) * 100);
  const barColor = label === 'HP' 
    ? 'from-green-500 to-green-400' 
    : 'from-blue-500 to-blue-400';
  
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-400">{icon} {label}</span>
        <span className={color}>{current} / {max}</span>
      </div>
      <div className="h-3 bg-void-900 rounded-full overflow-hidden">
        <div 
          className={`h-full bg-gradient-to-r ${barColor} stat-bar transition-all duration-500`} 
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
// PHASE 9.3 FIX: Get equipment stats from character.equipment
// ============================================================
const getEquipmentStatsFromCharacter = (equipment) => {
  const stats = {
    pAtk: 0, mAtk: 0, pDef: 0, mDef: 0,
    hp: 0, mp: 0,
    str: 0, agi: 0, dex: 0, int: 0, vit: 0,
    critRate: 0, critDmg: 0
  };
  
  if (!equipment) return stats;
  
  const slots = ['head', 'body', 'leg', 'shoes', 'leftHand', 'rightHand', 'ring', 'necklace'];
  
  slots.forEach(slot => {
    const equippedItem = equipment[slot];
    if (equippedItem && equippedItem.stats) {
      Object.keys(equippedItem.stats).forEach(statKey => {
        if (stats.hasOwnProperty(statKey)) {
          stats[statKey] += equippedItem.stats[statKey] || 0;
        }
      });
    }
  });
  
  return stats;
};

// ============================================================
// PHASE 9.3 FIX: Calculate set bonuses from equipped items
// ============================================================
const calculateSetBonusesFromEquipment = (equipment) => {
  // This is a simplified version - the backend has the full set database
  // For display purposes, we show what sets are active based on setId
  const setBonuses = {};
  const setCount = {};
  
  if (!equipment) return { bonuses: {}, activeSets: [] };
  
  const slots = ['head', 'body', 'leg', 'shoes', 'leftHand', 'rightHand', 'ring', 'necklace'];
  
  // Count items per set
  slots.forEach(slot => {
    const item = equipment[slot];
    if (item && item.setId) {
      if (!setCount[item.setId]) {
        setCount[item.setId] = { count: 0, name: item.setId };
      }
      setCount[item.setId].count++;
    }
  });
  
  // Build active sets list for display
  const activeSets = Object.entries(setCount)
    .filter(([_, data]) => data.count >= 2)
    .map(([setId, data]) => ({
      id: setId,
      pieces: data.count,
      // Note: actual bonus values come from the server during combat
      // This is just for UI indication
    }));
  
  return { activeSets };
};

// ============================================================
// PHASE 9.3 FIX: Derived Stats Calculator WITH EQUIPMENT
// ============================================================
const calculateDerivedStats = (stats, level = 1, equipment = null) => {
  if (!stats) return null;
  
  // Get equipment bonuses
  const equipBonus = getEquipmentStatsFromCharacter(equipment);
  
  // Total stats = base + equipment stat bonuses (str, agi, etc.)
  const totalStr = (stats.str || 0) + (equipBonus.str || 0);
  const totalAgi = (stats.agi || 0) + (equipBonus.agi || 0);
  const totalDex = (stats.dex || 0) + (equipBonus.dex || 0);
  const totalInt = (stats.int || 0) + (equipBonus.int || 0);
  const totalVit = (stats.vit || 0) + (equipBonus.vit || 0);
  
  const derived = {
    // Physical damage: base formula + equipment pAtk
    pDmg: 5 + totalStr * 3 + (equipBonus.pAtk || 0),
    // Magical damage: base formula + equipment mAtk
    mDmg: 5 + totalInt * 4 + (equipBonus.mAtk || 0),
    // Physical defense: base formula + equipment pDef
    pDef: totalStr * 1 + totalVit * 2 + (equipBonus.pDef || 0),
    // Magical defense: base formula + equipment mDef
    mDef: totalVit * 1 + totalInt * 1 + (equipBonus.mDef || 0),
    // Crit rate: base + equipment critRate
    critRate: 5 + totalAgi * 0.5 + (equipBonus.critRate || 0),
    // Crit damage: base + equipment critDmg
    critDmg: 150 + totalDex * 1 + (equipBonus.critDmg || 0),
    accuracy: 90 + totalDex * 0.5,
    evasion: totalAgi * 0.3,
    hpRegen: Math.floor(totalVit * 1),
    mpRegen: Math.floor(totalInt * 0.5),
    // Bonus HP/MP from equipment
    bonusHp: equipBonus.hp || 0,
    bonusMp: equipBonus.mp || 0,
    // Equipment totals for display
    equipmentBonus: equipBonus
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
  const { character, logout, refreshCharacter, updateLocalCharacter } = useAuth();
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

  // FIXED: Calculate derived stats WITH EQUIPMENT
  const derivedStats = character ? calculateDerivedStats(character.stats, character.level, character.equipment) : null;
  
  // Get set bonus info for display
  const setInfo = character ? calculateSetBonusesFromEquipment(character.equipment) : { activeSets: [] };

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
            <StatBar label="HP" current={character.stats.hp} max={character.stats.maxHp + (derivedStats?.bonusHp || 0)} color="text-green-400" icon="❤️"/>
            <StatBar label="MP" current={character.stats.mp} max={character.stats.maxMp + (derivedStats?.bonusMp || 0)} color="text-blue-400" icon="💎"/>
          </div>

          <div className="mb-6">
            <EnergyBar energy={character.energy}/>
          </div>

          <div className="flex items-center justify-between p-3 bg-amber-500/10 rounded-lg border border-amber-500/20 mb-4">
            <span className="text-amber-400 flex items-center gap-2">
              <span>💰</span>
              <span className="font-bold">{character.gold.toLocaleString()}</span>
            </span>
            <span className="text-gray-500 text-xs">Gold</span>
          </div>

          {/* QUICK STATS WITH EQUIPMENT */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="p-2 bg-void-800/30 rounded border border-red-500/10 text-center">
              <div className="text-lg font-bold text-red-400">{derivedStats?.pDmg || 0}</div>
              <div className="text-[10px] text-gray-500">⚔️ P.DMG</div>
            </div>
            <div className="p-2 bg-void-800/30 rounded border border-purple-500/10 text-center">
              <div className="text-lg font-bold text-purple-400">{derivedStats?.mDmg || 0}</div>
              <div className="text-[10px] text-gray-500">✨ M.DMG</div>
            </div>
            <div className="p-2 bg-void-800/30 rounded border border-gray-500/10 text-center">
              <div className="text-lg font-bold text-gray-300">{derivedStats?.pDef || 0}</div>
              <div className="text-[10px] text-gray-500">🛡️ P.DEF</div>
            </div>
            <div className="p-2 bg-void-800/30 rounded border border-indigo-500/10 text-center">
              <div className="text-lg font-bold text-indigo-400">{derivedStats?.mDef || 0}</div>
              <div className="text-[10px] text-gray-500">🔰 M.DEF</div>
            </div>
          </div>
          
          {/* ACTIVE SET BONUSES INDICATOR */}
          {setInfo.activeSets.length > 0 && (
            <div className="mb-4 p-2 bg-green-500/10 rounded border border-green-500/20">
              <div className="text-xs text-green-400 font-semibold mb-1">🎯 Active Sets</div>
              {setInfo.activeSets.map((set, idx) => (
                <div key={idx} className="text-xs text-green-300">
                  {set.id} ({set.pieces}pc)
                </div>
              ))}
            </div>
          )}

          <button 
            onClick={() => setShowCombatStats(true)}
            className="w-full mb-2 py-2 text-sm bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-lg text-purple-300 transition-colors"
          >
            ⚔️ View Combat Stats
          </button>

          <button 
            onClick={handleRest}
            disabled={isResting || character.gold < restCost || isInTower}
            className="w-full py-2 text-sm bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 rounded-lg text-green-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isInTower ? '🏰 In Tower...' : isResting ? 'Resting...' : `🛏️ Rest (${restCost}g)`}
          </button>
        </aside>

        <main className="flex-1 p-4">
          <div className="flex border-b border-purple-500/20 mb-4 overflow-x-auto">
            {[
              { id: 'status', label: '👤 Status', icon: '👤' },
              { id: 'tower', label: '🏰 Tower', icon: '🏰' },
              { id: 'inventory', label: '🎒 Items', icon: '🎒' },
              { id: 'tavern', label: '🍺 Tavern', icon: '🍺' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-purple-400 border-b-2 border-purple-400'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'status' && (
            <div className="space-y-4">
              {/* Sub-tabs for Status */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setStatusSubTab('info')}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                    statusSubTab === 'info' 
                      ? 'bg-purple-600/30 text-purple-300 border border-purple-500/30' 
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  👤 Hunter Info
                </button>
                <button
                  onClick={() => setStatusSubTab('combat')}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                    statusSubTab === 'combat' 
                      ? 'bg-purple-600/30 text-purple-300 border border-purple-500/30' 
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  ⚔️ Combat Info
                </button>
              </div>

              {statusSubTab === 'info' && (
                <>
                  {/* Base Stats */}
                  <div className="game-panel p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-display text-lg text-purple-400">Base Stats</h3>
                      {character.statPoints > 0 && (
                        <button
                          onClick={() => setShowStatModal(true)}
                          className="px-3 py-1 bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/30 rounded text-purple-300 text-sm transition-colors"
                        >
                          +{character.statPoints} Points
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      {[
                        { key: 'str', label: 'STR', icon: '💪', color: 'text-red-400' },
                        { key: 'agi', label: 'AGI', icon: '⚡', color: 'text-yellow-400' },
                        { key: 'dex', label: 'DEX', icon: '🎯', color: 'text-green-400' },
                        { key: 'int', label: 'INT', icon: '🔮', color: 'text-blue-400' },
                        { key: 'vit', label: 'VIT', icon: '❤️', color: 'text-pink-400' }
                      ].map(stat => {
                        const equipBonus = derivedStats?.equipmentBonus?.[stat.key] || 0;
                        return (
                          <div key={stat.key} className="text-center p-2 bg-void-800/30 rounded-lg">
                            <div className="text-xl mb-1">{stat.icon}</div>
                            <div className={`text-lg font-bold ${stat.color}`}>
                              {character.stats[stat.key]}
                              {equipBonus > 0 && (
                                <span className="text-green-400 text-sm"> +{equipBonus}</span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500">{stat.label}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Equipment Preview */}
                  <div className="game-panel p-4">
                    <h3 className="font-display text-lg text-purple-400 mb-3">Equipment</h3>
                    <div className="grid grid-cols-4 gap-2">
                      {['head', 'body', 'leftHand', 'rightHand', 'leg', 'shoes', 'ring', 'necklace'].map(slot => {
                        const item = character.equipment?.[slot];
                        const slotIcons = {
                          head: '⛑️', body: '🛡️', leftHand: '🧥', rightHand: '⚔️',
                          leg: '🧤', shoes: '👢', ring: '💍', necklace: '📿'
                        };
                        const slotLabels = {
                          head: 'Head', body: 'Body', leftHand: 'Cape', rightHand: 'Weapon',
                          leg: 'Hands', shoes: 'Feet', ring: 'Ring', necklace: 'Neck'
                        };
                        return (
                          <div 
                            key={slot} 
                            className={`p-2 rounded-lg text-center ${
                              item?.itemId 
                                ? 'bg-purple-600/20 border border-purple-500/30' 
                                : 'bg-void-800/30 border border-gray-700/30'
                            }`}
                            title={item?.name || 'Empty'}
                          >
                            <div className="text-xl">{item?.icon || slotIcons[slot]}</div>
                            <div className="text-[10px] text-gray-500">{slotLabels[slot]}</div>
                            {item?.name && (
                              <div className="text-[9px] text-purple-300 truncate">{item.name}</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Skills Section */}
                  <div className="game-panel p-4">
                    <h3 className="font-display text-lg text-purple-400 mb-3">Skills</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-96 overflow-y-auto">
                      {(character.skills || []).map((skill, idx) => {
                        const skillData = SKILL_DATABASE[skill.skillId];
                        return skillData ? (
                          <SkillCard key={idx} skill={skill} skillData={skillData} />
                        ) : (
                          <div key={idx} className="p-3 bg-void-800/50 rounded-lg border border-gray-700/30">
                            <span className="text-gray-400">{skill.name || skill.skillId}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {statusSubTab === 'combat' && (
                <div className="game-panel p-4">
                  <h3 className="font-display text-lg text-purple-400 mb-4">Combat Statistics</h3>
                  
                  {derivedStats && (
                    <div className="space-y-4">
                      {/* Offensive */}
                      <div>
                        <h4 className="text-sm text-gray-500 mb-2 font-semibold">OFFENSIVE</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
                      
                      {/* Defensive */}
                      <div>
                        <h4 className="text-sm text-gray-500 mb-2 font-semibold">DEFENSIVE</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
                      
                      {/* Equipment Bonuses */}
                      {derivedStats.equipmentBonus && (
                        <div>
                          <h4 className="text-sm text-gray-500 mb-2 font-semibold">EQUIPMENT BONUSES</h4>
                          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                            {Object.entries(derivedStats.equipmentBonus).map(([stat, value]) => (
                              value > 0 && (
                                <div key={stat} className="p-2 bg-green-500/10 rounded border border-green-500/20 text-center">
                                  <div className="text-sm font-bold text-green-400">+{value}</div>
                                  <div className="text-[10px] text-gray-500 uppercase">{stat}</div>
                                </div>
                              )
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Active Sets */}
                      {setInfo.activeSets.length > 0 && (
                        <div>
                          <h4 className="text-sm text-gray-500 mb-2 font-semibold">ACTIVE SET BONUSES</h4>
                          <div className="space-y-2">
                            {setInfo.activeSets.map((set, idx) => (
                              <div key={idx} className="p-3 bg-amber-500/10 rounded border border-amber-500/20">
                                <div className="text-amber-400 font-semibold">{set.id}</div>
                                <div className="text-xs text-amber-300">{set.pieces} pieces equipped</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'tower' && (
            <TowerPanel 
              character={character} 
              addLog={addLog} 
              refreshCharacter={refreshCharacter}
              updateLocalCharacter={updateLocalCharacter}
              onTowerStateChange={handleTowerStateChange}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryPanel 
              character={character} 
              addLog={addLog} 
              refreshCharacter={refreshCharacter}
            />
          )}

          {activeTab === 'tavern' && (
            <TavernPanel 
              character={character} 
              addLog={addLog} 
              refreshCharacter={refreshCharacter}
            />
          )}
        </main>

        {/* Activity Log - Collapsible */}
        <aside className={`lg:w-64 bg-void-800/30 border-t lg:border-t-0 lg:border-l border-purple-500/10 transition-all ${showActivityLog ? 'p-3' : 'p-1'}`}>
          <button 
            onClick={() => setShowActivityLog(!showActivityLog)}
            className="w-full flex items-center justify-between text-sm text-gray-500 hover:text-gray-300 mb-2"
          >
            <span>📜 Activity Log</span>
            <span>{showActivityLog ? '▼' : '▲'}</span>
          </button>
          {showActivityLog && (
            <div className="space-y-1 max-h-96 overflow-y-auto text-xs">
              {[...gameLog].reverse().map((log, idx) => (
                <div 
                  key={idx}
                  className={`p-2 rounded ${
                    log.type === 'error' ? 'bg-red-500/10 text-red-400' :
                    log.type === 'success' ? 'bg-green-500/10 text-green-400' :
                    log.type === 'combat' ? 'bg-orange-500/10 text-orange-400' :
                    log.type === 'system' ? 'bg-purple-500/10 text-purple-400' :
                    'bg-void-800/50 text-gray-400'
                  }`}
                >
                  {log.message}
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>

      {/* Stat Allocation Modal */}
      {showStatModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-void-800 rounded-xl p-6 w-full max-w-md neon-border">
            <h2 className="font-display text-xl text-purple-400 mb-4">Allocate Stats</h2>
            <p className="text-gray-400 text-sm mb-4">Available points: <span className="text-purple-400 font-bold">{character.statPoints - Object.values(pendingStats).reduce((a, b) => a + b, 0)}</span></p>
            
            <div className="space-y-3">
              {[
                { key: 'str', label: 'Strength', icon: '💪', desc: '+3 P.DMG, +1 P.DEF' },
                { key: 'agi', label: 'Agility', icon: '⚡', desc: '+0.5% Crit, +0.3% Evasion' },
                { key: 'dex', label: 'Dexterity', icon: '🎯', desc: '+0.5% Accuracy, +1% Crit DMG' },
                { key: 'int', label: 'Intelligence', icon: '🔮', desc: '+4 M.DMG, +1 M.DEF' },
                { key: 'vit', label: 'Vitality', icon: '❤️', desc: '+2 P.DEF, +1 M.DEF' }
              ].map(stat => (
                <div key={stat.key} className="flex items-center justify-between p-3 bg-void-900/50 rounded-lg">
                  <div>
                    <span className="text-lg mr-2">{stat.icon}</span>
                    <span className="text-white">{stat.label}</span>
                    <span className="text-gray-500 ml-2">({character.stats[stat.key]})</span>
                    {pendingStats[stat.key] > 0 && (
                      <span className="text-green-400 ml-1">+{pendingStats[stat.key]}</span>
                    )}
                    <div className="text-xs text-gray-600 mt-1">{stat.desc}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => addPendingStat(stat.key, -1)}
                      className="w-8 h-8 rounded bg-red-600/30 text-red-400 hover:bg-red-600/50"
                      disabled={pendingStats[stat.key] === 0}
                    >-</button>
                    <button 
                      onClick={() => addPendingStat(stat.key, 1)}
                      className="w-8 h-8 rounded bg-green-600/30 text-green-400 hover:bg-green-600/50"
                    >+</button>
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
            
            {/* Equipment Bonuses in Modal */}
            {derivedStats.equipmentBonus && Object.values(derivedStats.equipmentBonus).some(v => v > 0) && (
              <div className="mb-4">
                <h3 className="text-sm text-gray-500 mb-2 font-semibold">EQUIPMENT BONUSES</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(derivedStats.equipmentBonus).map(([stat, value]) => (
                    value > 0 && (
                      <span key={stat} className="px-2 py-1 bg-green-500/20 rounded text-green-400 text-xs">
                        +{value} {stat.toUpperCase()}
                      </span>
                    )
                  ))}
                </div>
              </div>
            )}
            
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
