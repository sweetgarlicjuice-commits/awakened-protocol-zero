import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { characterAPI } from '../services/api';
import TowerPanel from '../components/TowerPanel';
import TavernPanel from '../components/TavernPanel';
import InventoryPanel from '../components/InventoryPanel';
import FriendsPanel from '../components/FriendsPanel';

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
// PHASE 9.7.2: Complete Skill Database with Clear Player Info
// Shows: Damage Type (P.DMG/M.DMG), Scaling %, DoT values, Effect details
// ============================================================
const SKILL_DATABASE = {
  // ==================== BASE SWORDSMAN ====================
  slash: { name: 'Slash', mpCost: 5, damage: 1.2, damageType: 'physical', element: 'none', desc: 'Quick slash attack.', details: '120% P.DMG' },
  heavyStrike: { name: 'Heavy Strike', mpCost: 12, damage: 1.8, damageType: 'physical', element: 'none', desc: 'Powerful overhead strike.', details: '180% P.DMG' },
  shieldBash: { name: 'Shield Bash', mpCost: 8, damage: 1.0, damageType: 'physical', element: 'none', desc: 'Bash with shield.', details: '100% P.DMG | -15% ATK (3t)' },
  warCry: { name: 'War Cry', mpCost: 15, damage: 0, damageType: 'buff', element: 'none', desc: 'Battle cry buff.', details: '+25% P.DMG (3t)' },
  
  // ==================== BASE THIEF ====================
  backstab: { name: 'Backstab', mpCost: 8, damage: 2.0, damageType: 'physical', element: 'none', desc: 'Strike from behind.', details: '200% P.DMG | +30% Crit' },
  poisonBlade: { name: 'Poison Blade', mpCost: 10, damage: 1.0, damageType: 'physical', element: 'nature', desc: 'Poisoned attack.', details: '100% P.DMG | Poison 20% P.DMG/t (3t)' },
  smokeScreen: { name: 'Smoke Screen', mpCost: 12, damage: 0, damageType: 'buff', element: 'none', desc: 'Create smoke cover.', details: '+40% Evasion (2t)' },
  steal: { name: 'Steal', mpCost: 5, damage: 0, damageType: 'utility', element: 'none', desc: 'Steal enemy gold.', details: 'Steal 5-15% Gold' },
  
  // ==================== BASE ARCHER ====================
  preciseShot: { name: 'Precise Shot', mpCost: 6, damage: 1.5, damageType: 'physical', element: 'none', desc: 'Aimed shot. Never misses.', details: '150% P.DMG | 100% Hit' },
  multiShot: { name: 'Multi Shot', mpCost: 14, damage: 0.6, hits: 3, damageType: 'physical', element: 'none', desc: 'Fire multiple arrows.', details: '60% P.DMG x3 Hits' },
  eagleEye: { name: 'Eagle Eye', mpCost: 10, damage: 0, damageType: 'buff', element: 'none', desc: 'Focus your aim.', details: '+25% Crit | +20% Crit DMG (3t)' },
  arrowRain: { name: 'Arrow Rain', mpCost: 20, damage: 2.2, damageType: 'physical', element: 'none', desc: 'Rain of arrows.', details: '220% P.DMG' },
  
  // ==================== BASE MAGE ====================
  fireball: { name: 'Fireball', mpCost: 10, damage: 1.6, damageType: 'magical', element: 'fire', desc: 'Hurl a fireball.', details: '160% M.DMG | Burn 25% M.DMG/t (3t)' },
  iceSpear: { name: 'Ice Spear', mpCost: 12, damage: 1.4, damageType: 'magical', element: 'ice', desc: 'Ice projectile.', details: '140% M.DMG | -20% ATK (2t)' },
  manaShield: { name: 'Mana Shield', mpCost: 15, damage: 0, damageType: 'buff', element: 'none', desc: 'Create MP shield.', details: 'Shield = 50% Current MP' },
  thunderbolt: { name: 'Thunderbolt', mpCost: 18, damage: 2.0, damageType: 'magical', element: 'lightning', desc: 'Lightning strike.', details: '200% M.DMG' },
  
  // ==================== FLAMEBLADE (Swordsman) ====================
  flameSlash: { name: 'Flame Slash', mpCost: 15, damage: 1.8, damageType: 'physical', element: 'fire', desc: 'Fire-infused slash.', details: '180% P.DMG | Burn 20% P.DMG/t (3t)' },
  infernoStrike: { name: 'Inferno Strike', mpCost: 25, damage: 2.8, damageType: 'physical', element: 'fire', desc: 'Powerful fire strike.', details: '280% P.DMG' },
  fireAura: { name: 'Fire Aura', mpCost: 20, damage: 0, damageType: 'buff', element: 'fire', desc: 'Surround in flames.', details: '+30% P.DMG | Reflect 15% (3t)' },
  volcanicRage: { name: 'Volcanic Rage', mpCost: 40, damage: 3.5, damageType: 'physical', element: 'fire', desc: 'Massive fire eruption.', details: '350% P.DMG | Burn 35% P.DMG/t (3t)' },
  
  // ==================== BERSERKER (Swordsman) ====================
  rageSlash: { name: 'Rage Slash', mpCost: 10, damage: 2.0, damageType: 'physical', element: 'none', desc: 'Furious slash.', details: '200% P.DMG | Cost 5% HP' },
  bloodFury: { name: 'Blood Fury', mpCost: 20, damage: 0, damageType: 'buff', element: 'none', desc: 'Enter blood rage.', details: '+50% P.DMG | -20% DEF (3t)' },
  recklessCharge: { name: 'Reckless Charge', mpCost: 15, damage: 2.5, damageType: 'physical', element: 'none', desc: 'Charging attack.', details: '250% P.DMG | Cost 10% HP' },
  deathwish: { name: 'Deathwish', mpCost: 35, damage: 4.0, damageType: 'physical', element: 'none', desc: 'Ultimate attack.', details: '400% P.DMG | Cost 20% HP' },
  
  // ==================== PALADIN (Swordsman) ====================
  holyStrike: { name: 'Holy Strike', mpCost: 12, damage: 1.6, damageType: 'physical', element: 'holy', desc: 'Holy-infused attack.', details: '160% P.DMG | +50% vs Undead' },
  divineShield: { name: 'Divine Shield', mpCost: 18, damage: 0, damageType: 'buff', element: 'holy', desc: 'Divine protection.', details: 'Shield = 200% P.DEF' },
  healingLight: { name: 'Healing Light', mpCost: 20, damage: 0, damageType: 'heal', element: 'holy', desc: 'Healing magic.', details: 'Heal 35% Max HP' },
  judgment: { name: 'Judgment', mpCost: 35, damage: 3.0, damageType: 'physical', element: 'holy', desc: 'Divine judgment.', details: '300% P.DMG | Purify Debuffs' },
  
  // ==================== EARTHSHAKER (Swordsman) ====================
  groundSlam: { name: 'Ground Slam', mpCost: 12, damage: 1.5, damageType: 'physical', element: 'earth', desc: 'Slam the ground.', details: '150% P.DMG | -20% DEF (2t)' },
  stoneSkin: { name: 'Stone Skin', mpCost: 15, damage: 0, damageType: 'buff', element: 'earth', desc: 'Harden skin.', details: '+50% P.DEF (3t)' },
  earthquake: { name: 'Earthquake', mpCost: 25, damage: 2.2, damageType: 'physical', element: 'earth', desc: 'Massive quake.', details: '220% P.DMG | -30% DEF (2t)' },
  titansWrath: { name: "Titan's Wrath", mpCost: 40, damage: 3.2, damageType: 'physical', element: 'earth', desc: 'Ultimate earth attack.', details: '320% P.DMG | Stun (1t)' },
  
  // ==================== FROSTGUARD (Swordsman) ====================
  frostStrike: { name: 'Frost Strike', mpCost: 12, damage: 1.4, damageType: 'physical', element: 'ice', desc: 'Ice-infused slash.', details: '140% P.DMG | -15% ATK (2t)' },
  iceBarrier: { name: 'Ice Barrier', mpCost: 18, damage: 0, damageType: 'buff', element: 'ice', desc: 'Ice shield.', details: 'Shield 150% P.DEF | Reflect 20%' },
  frozenBlade: { name: 'Frozen Blade', mpCost: 22, damage: 2.0, damageType: 'physical', element: 'ice', desc: 'Powerful ice slash.', details: '200% P.DMG | 30% Freeze (1t)' },
  glacialFortress: { name: 'Glacial Fortress', mpCost: 35, damage: 0, damageType: 'buff', element: 'ice', desc: 'Ice fortress.', details: '+100% DEF | Debuff Immune (2t)' },
  
  // ==================== SHADOW DANCER (Thief) ====================
  shadowStrike: { name: 'Shadow Strike', mpCost: 12, damage: 2.2, damageType: 'physical', element: 'dark', desc: 'Strike from shadows.', details: '220% P.DMG | +40% Crit' },
  vanish: { name: 'Vanish', mpCost: 20, damage: 0, damageType: 'buff', element: 'dark', desc: 'Become invisible.', details: 'Stealth | Next Attack Auto-Crit' },
  deathMark: { name: 'Death Mark', mpCost: 18, damage: 1.2, damageType: 'physical', element: 'dark', desc: 'Mark target.', details: '120% P.DMG | Target +30% DMG Taken (3t)' },
  shadowDance: { name: 'Shadow Dance', mpCost: 35, damage: 0.8, hits: 5, damageType: 'physical', element: 'dark', desc: '5-hit shadow combo.', details: '80% P.DMG x5 Hits' },
  
  // ==================== VENOMANCER (Thief) ====================
  toxicStrike: { name: 'Toxic Strike', mpCost: 10, damage: 1.4, damageType: 'physical', element: 'nature', desc: 'Poison strike.', details: '140% P.DMG | Poison 25% P.DMG/t (3t)' },
  venomCoat: { name: 'Venom Coat', mpCost: 15, damage: 0, damageType: 'buff', element: 'nature', desc: 'Coat weapons.', details: '+25% Poison DMG (3t)' },
  plague: { name: 'Plague', mpCost: 22, damage: 0.8, damageType: 'physical', element: 'nature', desc: 'Poison cloud.', details: '80% P.DMG | Poison 35% P.DMG/t (4t)' },
  pandemic: { name: 'Pandemic', mpCost: 38, damage: 2.5, damageType: 'physical', element: 'nature', desc: 'Massive poison.', details: '250% P.DMG | Poison 40% P.DMG/t (3t)' },
  
  // ==================== ASSASSIN (Thief) ====================
  exposeWeakness: { name: 'Expose Weakness', mpCost: 12, damage: 1.2, damageType: 'physical', element: 'none', desc: 'Find weakness.', details: '120% P.DMG | Target +30% DMG Taken (3t)' },
  markForDeath: { name: 'Mark for Death', mpCost: 18, damage: 0, damageType: 'debuff', element: 'dark', desc: 'Mark for death.', details: 'Target +50% Crit Taken (3t)' },
  execute: { name: 'Execute', mpCost: 25, damage: 3.0, damageType: 'physical', element: 'none', desc: 'Execute low HP.', details: '300% P.DMG | +100% Crit DMG if <25% HP' },
  assassination: { name: 'Assassination', mpCost: 40, damage: 4.0, damageType: 'physical', element: 'dark', desc: 'Ultimate kill.', details: '400% P.DMG' },
  
  // ==================== PHANTOM (Thief) ====================
  haunt: { name: 'Haunt', mpCost: 12, damage: 1.8, damageType: 'physical', element: 'dark', desc: 'Ghostly attack.', details: '180% P.DMG | Ignores 30% DEF' },
  nightmare: { name: 'Nightmare', mpCost: 15, damage: 0, damageType: 'debuff', element: 'dark', desc: 'Terrify enemy.', details: '-30% ATK (2t)' },
  soulDrain: { name: 'Soul Drain', mpCost: 20, damage: 1.5, damageType: 'magical', element: 'dark', desc: 'Drain life force.', details: '150% M.DMG | Heal 30% Dealt' },
  dread: { name: 'Dread', mpCost: 35, damage: 3.0, damageType: 'magical', element: 'dark', desc: 'Dark explosion.', details: '300% M.DMG | Fear (1t)' },
  
  // ==================== BLOODREAPER (Thief) ====================
  bloodlet: { name: 'Bloodlet', mpCost: 10, damage: 1.8, damageType: 'physical', element: 'none', desc: 'Vampiric slash.', details: '180% P.DMG | Heal 20% Dealt' },
  sanguineBlade: { name: 'Sanguine Blade', mpCost: 15, damage: 0, damageType: 'buff', element: 'none', desc: 'Blood-coat weapons.', details: 'Attacks Heal 25% (3t)' },
  crimsonSlash: { name: 'Crimson Slash', mpCost: 22, damage: 2.2, damageType: 'physical', element: 'none', desc: 'Bloody slash.', details: '220% P.DMG | Heal 35% Dealt' },
  exsanguinate: { name: 'Exsanguinate', mpCost: 40, damage: 3.5, damageType: 'physical', element: 'none', desc: 'Drain all blood.', details: '350% P.DMG | Heal 50% Dealt' },
  
  // ==================== STORM RANGER (Archer) ====================
  lightningArrow: { name: 'Lightning Arrow', mpCost: 14, damage: 2.0, damageType: 'physical', element: 'lightning', desc: 'Electric arrow.', details: '200% P.DMG' },
  chainLightning: { name: 'Chain Lightning', mpCost: 22, damage: 0.7, hits: 3, damageType: 'magical', element: 'lightning', desc: 'Chained lightning.', details: '70% M.DMG x3 Hits' },
  stormEye: { name: 'Storm Eye', mpCost: 18, damage: 0, damageType: 'buff', element: 'lightning', desc: 'Storm focus.', details: '+50% Accuracy | +30% Crit (3t)' },
  thunderstorm: { name: 'Thunderstorm', mpCost: 45, damage: 0.8, hits: 4, damageType: 'magical', element: 'lightning', desc: 'Lightning storm.', details: '80% M.DMG x4 Hits' },
  
  // ==================== PYRO ARCHER (Archer) ====================
  fireArrow: { name: 'Fire Arrow', mpCost: 12, damage: 1.7, damageType: 'physical', element: 'fire', desc: 'Flaming arrow.', details: '170% P.DMG | Burn 20% P.DMG/t (3t)' },
  explosiveShot: { name: 'Explosive Shot', mpCost: 18, damage: 2.3, damageType: 'physical', element: 'fire', desc: 'Explosive arrow.', details: '230% P.DMG | Burn 25% P.DMG/t (2t)' },
  ignite: { name: 'Ignite', mpCost: 15, damage: 0, damageType: 'buff', element: 'fire', desc: 'Ignite attacks.', details: 'All Attacks Burn 15%/t (3t)' },
  meteorArrow: { name: 'Meteor Arrow', mpCost: 40, damage: 3.5, damageType: 'physical', element: 'fire', desc: 'Meteor strike.', details: '350% P.DMG | Burn 40% P.DMG/t (3t)' },
  
  // ==================== FROST SNIPER (Archer) ====================
  iceArrow: { name: 'Ice Arrow', mpCost: 12, damage: 1.5, damageType: 'physical', element: 'ice', desc: 'Freezing arrow.', details: '150% P.DMG | Slow -20% SPD (2t)' },
  frozenAim: { name: 'Frozen Aim', mpCost: 18, damage: 0, damageType: 'buff', element: 'ice', desc: 'Cold focus.', details: '+40% Crit | +50% Crit DMG (2t)' },
  piercingCold: { name: 'Piercing Cold', mpCost: 22, damage: 2.2, damageType: 'physical', element: 'ice', desc: 'Armor-piercing ice.', details: '220% P.DMG | Ignores 40% DEF' },
  absoluteShot: { name: 'Absolute Shot', mpCost: 42, damage: 4.2, damageType: 'physical', element: 'ice', desc: 'Ultimate ice arrow.', details: '420% P.DMG | Freeze (1t)' },
  
  // ==================== NATURE WARDEN (Archer) ====================
  thornArrow: { name: 'Thorn Arrow', mpCost: 10, damage: 1.5, damageType: 'physical', element: 'nature', desc: 'Thorn-covered arrow.', details: '150% P.DMG | Poison 15% P.DMG/t (3t)' },
  naturesGift: { name: "Nature's Gift", mpCost: 20, damage: 0, damageType: 'heal', element: 'nature', desc: "Nature's blessing.", details: 'Heal 25% HP | +20% DEF (2t)' },
  vineTrap: { name: 'Vine Trap', mpCost: 15, damage: 0.8, damageType: 'physical', element: 'nature', desc: 'Root with vines.', details: '80% P.DMG | Root -30% Evasion (2t)' },
  overgrowth: { name: 'Overgrowth', mpCost: 40, damage: 0.7, hits: 5, damageType: 'physical', element: 'nature', desc: 'Nature barrage.', details: '70% P.DMG x5 Hits' },
  
  // ==================== VOID HUNTER (Archer) ====================
  voidArrow: { name: 'Void Arrow', mpCost: 15, damage: 1.8, damageType: 'physical', element: 'dark', desc: 'Dark void arrow.', details: '180% P.DMG | Ignores 40% DEF' },
  nullZone: { name: 'Null Zone', mpCost: 20, damage: 0, damageType: 'debuff', element: 'dark', desc: 'Nullify buffs.', details: 'Dispel All Enemy Buffs' },
  darkVolley: { name: 'Dark Volley', mpCost: 28, damage: 0.6, hits: 4, damageType: 'physical', element: 'dark', desc: 'Void volley.', details: '60% P.DMG x4 Hits' },
  oblivion: { name: 'Oblivion', mpCost: 45, damage: 3.5, damageType: 'physical', element: 'dark', desc: 'Ultimate void.', details: '350% P.DMG | Ignores 50% DEF' },
  
  // ==================== FROST WEAVER (Mage) ====================
  frostBolt: { name: 'Frost Bolt', mpCost: 12, damage: 1.5, damageType: 'magical', element: 'ice', desc: 'Ice magic bolt.', details: '150% M.DMG | -25% ATK (2t)' },
  blizzard: { name: 'Blizzard', mpCost: 28, damage: 2.0, damageType: 'magical', element: 'ice', desc: 'Ice storm.', details: '200% M.DMG | -30% DEF (2t)' },
  iceArmor: { name: 'Ice Armor', mpCost: 20, damage: 0, damageType: 'buff', element: 'ice', desc: 'Ice armor.', details: '+40% P.DEF | +20% M.DEF (3t)' },
  absoluteZero: { name: 'Absolute Zero', mpCost: 50, damage: 4.0, damageType: 'magical', element: 'ice', desc: 'Ultimate ice magic.', details: '400% M.DMG | Freeze (1t)' },
  
  // ==================== PYROMANCER (Mage) ====================
  flameBurst: { name: 'Flame Burst', mpCost: 14, damage: 1.8, damageType: 'magical', element: 'fire', desc: 'Fire explosion.', details: '180% M.DMG | Burn 20% M.DMG/t (3t)' },
  combustion: { name: 'Combustion', mpCost: 22, damage: 2.2, damageType: 'magical', element: 'fire', desc: 'Spontaneous fire.', details: '220% M.DMG' },
  inferno: { name: 'Inferno', mpCost: 35, damage: 1.5, damageType: 'magical', element: 'fire', desc: 'AoE fire wave.', details: '150% M.DMG | Burn 30% M.DMG/t (3t)' },
  hellfire: { name: 'Hellfire', mpCost: 50, damage: 3.8, damageType: 'magical', element: 'fire', desc: 'Ultimate fire magic.', details: '380% M.DMG' },
  
  // ==================== STORMCALLER (Mage) ====================
  shock: { name: 'Shock', mpCost: 10, damage: 1.4, damageType: 'magical', element: 'lightning', desc: 'Electric shock.', details: '140% M.DMG' },
  lightningBolt: { name: 'Lightning Bolt', mpCost: 18, damage: 2.0, damageType: 'magical', element: 'lightning', desc: 'Lightning strike.', details: '200% M.DMG' },
  thunderChain: { name: 'Thunder Chain', mpCost: 28, damage: 0.8, hits: 4, damageType: 'magical', element: 'lightning', desc: 'Chained lightning.', details: '80% M.DMG x4 Hits' },
  tempest: { name: 'Tempest', mpCost: 48, damage: 1.4, damageType: 'magical', element: 'lightning', desc: 'AoE lightning.', details: '140% M.DMG (AoE)' },
  
  // ==================== NECROMANCER (Mage) ====================
  lifeDrain: { name: 'Life Drain', mpCost: 12, damage: 1.4, damageType: 'magical', element: 'dark', desc: 'Drain life.', details: '140% M.DMG | Heal 30% Dealt' },
  curse: { name: 'Curse', mpCost: 15, damage: 0, damageType: 'debuff', element: 'dark', desc: 'Dark curse.', details: '-25% All Stats (3t)' },
  soulRend: { name: 'Soul Rend', mpCost: 25, damage: 2.2, damageType: 'magical', element: 'dark', desc: 'Rend soul.', details: '220% M.DMG | Heal 40% Dealt' },
  deathPact: { name: 'Death Pact', mpCost: 42, damage: 3.5, damageType: 'magical', element: 'dark', desc: 'Ultimate dark magic.', details: '350% M.DMG | Heal 50% Dealt' },
  
  // ==================== ARCANIST (Mage) ====================
  arcaneMissile: { name: 'Arcane Missile', mpCost: 10, damage: 1.6, damageType: 'magical', element: 'holy', desc: 'Pure arcane bolt.', details: '160% M.DMG' },
  empower: { name: 'Empower', mpCost: 18, damage: 0, damageType: 'buff', element: 'holy', desc: 'Arcane power.', details: '+35% M.DMG (3t)' },
  arcaneBurst: { name: 'Arcane Burst', mpCost: 28, damage: 2.8, damageType: 'magical', element: 'holy', desc: 'Arcane explosion.', details: '280% M.DMG' },
  transcendence: { name: 'Transcendence', mpCost: 45, damage: 0, damageType: 'buff', element: 'holy', desc: 'Ultimate buff.', details: '+50% All DMG | +30% Crit (3t)' }
};

// Element icons for display
const ELEMENT_ICONS = {
  fire: '🔥', ice: '❄️', lightning: '⚡', nature: '🌿', 
  dark: '🌑', holy: '✨', earth: '🪨', none: ''
};

// Damage type colors
const DAMAGE_TYPE_COLORS = {
  physical: 'text-orange-400',
  magical: 'text-cyan-400',
  buff: 'text-blue-400',
  debuff: 'text-red-400',
  heal: 'text-green-400',
  utility: 'text-yellow-400'
};

// Component for skill cards - reusable with clear info
const SkillCard = ({ skill, skillData }) => {
  if (!skillData) return null;
  
  const elementIcon = ELEMENT_ICONS[skillData.element] || '';
  const dmgTypeColor = DAMAGE_TYPE_COLORS[skillData.damageType] || 'text-gray-400';
  
  return (
    <div className="p-3 bg-void-800/50 rounded-lg border border-purple-500/10 hover:border-purple-500/30 transition-colors">
      <div className="flex justify-between items-start mb-1">
        <span className="font-medium text-purple-300">
          {elementIcon} {skillData.name}
        </span>
        <span className="text-xs text-blue-400 font-medium">{skillData.mpCost} MP</span>
      </div>
      <p className="text-xs text-gray-400 mb-2">{skillData.desc}</p>
      {/* Clear damage/effect info */}
      <div className={`text-xs font-medium ${dmgTypeColor} bg-void-900/50 rounded px-2 py-1`}>
        {skillData.details}
      </div>
    </div>
  );
};

const StatBar = ({ label, current, max, color, icon, regenTimer, regenAmount }) => {
  const percentage = Math.round((current / max) * 100);
  const barColor = label === 'HP' 
    ? 'from-green-500 to-green-400' 
    : 'from-blue-500 to-blue-400';
  
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-400">{icon} {label}</span>
        <div className="flex items-center gap-2">
          <span className={color}>{current} / {max}</span>
          {regenTimer !== undefined && regenAmount > 0 && current < max && (
            <span className="text-xs text-gray-500">(+{regenAmount} in {regenTimer}s)</span>
          )}
        </div>
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

const EnergyBar = ({ energy, regenTimer }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-sm">
      <span className="text-gray-400">⚡ ENERGY</span>
      <div className="flex items-center gap-2">
        <span className="text-amber-400">{energy} / 100</span>
        {regenTimer !== undefined && energy < 100 && (
          <span className="text-xs text-gray-500">(+1 in {regenTimer}s)</span>
        )}
      </div>
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
  const [regenTimer, setRegenTimer] = useState(60); // Phase 9.7.2: Regen countdown timer
  const [showGuide, setShowGuide] = useState(false); // Phase 9.7.2: Game guide popup
  const [showFriends, setShowFriends] = useState(false); // Phase 9.8: Friends panel
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

  // Phase 9.7.2: Regen timer countdown (server regens HP/MP/Energy every 60s)
  useEffect(() => {
    const timer = setInterval(() => {
      setRegenTimer(prev => {
        if (prev <= 1) {
          refreshCharacter(); // Refresh when timer hits 0
          return 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
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
            <button onClick={() => setShowFriends(true)} className="text-gray-400 hover:text-purple-400 transition-colors text-sm">👥 Friends</button>
            <button onClick={() => setShowGuide(true)} className="text-gray-400 hover:text-purple-400 transition-colors text-sm">📖 Guide</button>
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
            <StatBar label="HP" current={character.stats.hp} max={character.stats.maxHp + (derivedStats?.bonusHp || 0)} color="text-green-400" icon="❤️" regenTimer={regenTimer} regenAmount={derivedStats?.hpRegen || 0}/>
            <StatBar label="MP" current={character.stats.mp} max={character.stats.maxMp + (derivedStats?.bonusMp || 0)} color="text-blue-400" icon="💎" regenTimer={regenTimer} regenAmount={derivedStats?.mpRegen || 0}/>
          </div>

          <div className="mb-6">
            <EnergyBar energy={character.energy} regenTimer={regenTimer}/>
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
                        { key: 'str', label: 'STR', icon: '💪', color: 'text-red-400', borderColor: 'border-red-500/30' },
                        { key: 'agi', label: 'AGI', icon: '⚡', color: 'text-yellow-400', borderColor: 'border-yellow-500/30' },
                        { key: 'dex', label: 'DEX', icon: '🎯', color: 'text-green-400', borderColor: 'border-green-500/30' },
                        { key: 'int', label: 'INT', icon: '🔮', color: 'text-blue-400', borderColor: 'border-blue-500/30' },
                        { key: 'vit', label: 'VIT', icon: '❤️', color: 'text-pink-400', borderColor: 'border-pink-500/30' }
                      ].map(stat => {
                        const equipBonus = derivedStats?.equipmentBonus?.[stat.key] || 0;
                        return (
                          <div key={stat.key} className={`text-center p-2 bg-void-900/50 rounded-lg border ${stat.borderColor}`}>
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
                          head: '🧢', body: '👕', leftHand: '🧥', rightHand: '⚔️',
                          leg: '🧤', shoes: '👢', ring: '💍', necklace: '📿'
                        };
                        const slotLabels = {
                          head: 'Head', body: 'Body', leftHand: 'Cape', rightHand: 'Weapon',
                          leg: 'Hands', shoes: 'Feet', ring: 'Ring', necklace: 'Necklace'
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
      {/* GAME GUIDE MODAL */}
      {showGuide && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-void-800 rounded-xl p-6 w-full max-w-2xl neon-border my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-2xl text-purple-400">📖 Hunter's Guide</h2>
              <button 
                onClick={() => setShowGuide(false)}
                className="text-gray-400 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>
            
            {/* Getting Started */}
            <div className="mb-6">
              <h3 className="text-lg text-purple-300 font-semibold mb-2">🎮 Getting Started</h3>
              <div className="text-sm text-gray-300 space-y-2">
                <p>Welcome to <span className="text-purple-400">Awakened Protocol: Zero</span>! You are a Hunter exploring dangerous towers filled with monsters, treasures, and secrets.</p>
                <p>Your goal: Climb all 10 towers, defeat powerful bosses, and unlock a <span className="text-yellow-400">Hidden Class</span> to become the ultimate Hunter!</p>
              </div>
            </div>

            {/* How to Progress */}
            <div className="mb-6">
              <h3 className="text-lg text-purple-300 font-semibold mb-2">🏰 Tower Exploration</h3>
              <div className="text-sm text-gray-300 space-y-2">
                <p><span className="text-green-400">1.</span> Go to the <span className="text-amber-400">Tower</span> tab and select a floor</p>
                <p><span className="text-green-400">2.</span> Navigate through nodes - each node costs <span className="text-amber-400">5 Energy</span></p>
                <p><span className="text-green-400">3.</span> Clear the <span className="text-red-400">Boss</span> node to unlock the next floor</p>
                <p><span className="text-green-400">4.</span> Complete Floor 15 to unlock the next Tower</p>
              </div>
              <div className="mt-3 p-3 bg-void-900/50 rounded-lg">
                <div className="text-xs text-gray-400 mb-2">Node Types:</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-red-400">⚔️ Combat</span> - Fight monsters</div>
                  <div><span className="text-purple-400">💀 Elite</span> - Stronger enemies, better loot</div>
                  <div><span className="text-red-600">👹 Boss</span> - Floor boss (must clear)</div>
                  <div><span className="text-yellow-400">💰 Treasure</span> - Free loot!</div>
                  <div><span className="text-blue-400">🏕️ Rest</span> - Recover HP/MP</div>
                  <div><span className="text-cyan-400">📜 Shrine</span> - Random buffs</div>
                  <div><span className="text-indigo-400">❓ Mystery</span> - Random event</div>
                  <div><span className="text-emerald-400">🛒 Merchant</span> - Buy items</div>
                </div>
              </div>
            </div>

            {/* Combat */}
            <div className="mb-6">
              <h3 className="text-lg text-purple-300 font-semibold mb-2">⚔️ Combat</h3>
              <div className="text-sm text-gray-300 space-y-2">
                <p><span className="text-orange-400">Attack</span> - Basic attack using P.DMG</p>
                <p><span className="text-blue-400">Defend</span> - Reduce damage taken this turn</p>
                <p><span className="text-purple-400">Skills</span> - Use MP for powerful abilities</p>
                <p><span className="text-red-400">Flee</span> - Escape combat (lose progress)</p>
              </div>
              <div className="mt-3 p-3 bg-void-900/50 rounded-lg text-xs">
                <div className="text-gray-400 mb-1">Damage Types:</div>
                <div><span className="text-orange-400">P.DMG</span> = Physical Damage (scales with STR)</div>
                <div><span className="text-cyan-400">M.DMG</span> = Magic Damage (scales with INT)</div>
              </div>
            </div>

            {/* Stats */}
            <div className="mb-6">
              <h3 className="text-lg text-purple-300 font-semibold mb-2">📊 Stats</h3>
              <div className="text-sm text-gray-300 space-y-1">
                <p><span className="text-red-400">💪 STR</span> → Physical DMG (+3), Physical DEF (+1)</p>
                <p><span className="text-yellow-400">⚡ AGI</span> → Crit Rate (+0.5%), Evasion (+0.3%)</p>
                <p><span className="text-green-400">🎯 DEX</span> → Accuracy (+0.5%), Crit DMG (+1%)</p>
                <p><span className="text-blue-400">🔮 INT</span> → Magic DMG (+4), Magic DEF (+1), MP Regen</p>
                <p><span className="text-pink-400">❤️ VIT</span> → Physical DEF (+2), Magic DEF (+1), HP Regen</p>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                You get <span className="text-purple-400">5 stat points</span> per level. Allocate them in the Status tab!
              </div>
            </div>

            {/* Hidden Classes */}
            <div className="mb-6">
              <h3 className="text-lg text-purple-300 font-semibold mb-2">⭐ Hidden Classes</h3>
              <div className="text-sm text-gray-300 space-y-2">
                <p>Each base class has <span className="text-yellow-400">5 Hidden Classes</span> with unique powerful skills!</p>
                <p><span className="text-green-400">How to unlock:</span></p>
                <p className="pl-4">1. Find a <span className="text-purple-400">Class Scroll</span> from boss drops</p>
                <p className="pl-4">2. Use the scroll in your <span className="text-amber-400">Inventory</span></p>
                <p className="pl-4">3. Gain 4 new powerful skills!</p>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                ⚠️ Each scroll is <span className="text-red-400">unique</span> - only one player can own each Hidden Class at a time!
              </div>
            </div>

            {/* Tips */}
            <div className="mb-6">
              <h3 className="text-lg text-purple-300 font-semibold mb-2">💡 Tips</h3>
              <div className="text-sm text-gray-300 space-y-2">
                <p>• <span className="text-amber-400">Energy</span> regenerates over time (1 per minute)</p>
                <p>• <span className="text-green-400">HP/MP</span> regenerate based on your VIT/INT stats</p>
                <p>• Use <span className="text-blue-400">Rest</span> in town to fully recover (costs gold)</p>
                <p>• <span className="text-purple-400">Equipment</span> greatly boosts your stats - check the Items tab</p>
                <p>• <span className="text-yellow-400">Set Bonuses</span> activate when wearing multiple items from the same set</p>
                <p>• Visit the <span className="text-amber-400">Tavern</span> to buy potions and sell loot</p>
              </div>
            </div>

            {/* Class Recommendations */}
            <div className="mb-6">
              <h3 className="text-lg text-purple-300 font-semibold mb-2">🎭 Class Guide</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-2 bg-red-900/20 rounded border border-red-500/20">
                  <div className="text-red-400 font-semibold">⚔️ Swordsman</div>
                  <div className="text-xs text-gray-400">Balanced fighter. Focus STR & VIT.</div>
                </div>
                <div className="p-2 bg-indigo-900/20 rounded border border-indigo-500/20">
                  <div className="text-indigo-400 font-semibold">🗡️ Thief</div>
                  <div className="text-xs text-gray-400">High crit damage. Focus AGI & DEX.</div>
                </div>
                <div className="p-2 bg-green-900/20 rounded border border-green-500/20">
                  <div className="text-green-400 font-semibold">🏹 Archer</div>
                  <div className="text-xs text-gray-400">Accurate & deadly. Focus DEX & AGI.</div>
                </div>
                <div className="p-2 bg-purple-900/20 rounded border border-purple-500/20">
                  <div className="text-purple-400 font-semibold">🔮 Mage</div>
                  <div className="text-xs text-gray-400">Powerful magic. Focus INT & VIT.</div>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => setShowGuide(false)}
              className="w-full mt-4 btn-primary"
            >
              Got it, let's hunt! ⚔️
            </button>
          </div>
        </div>
      )}

      {/* Friends Panel Modal */}
      {showFriends && (
        <FriendsPanel onClose={() => setShowFriends(false)} />
      )}
    </div>
  );
};

export default GamePage;
