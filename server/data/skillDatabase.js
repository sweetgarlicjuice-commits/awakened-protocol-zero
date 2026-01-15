// ============================================================
// SKILL DATABASE - All 96 Skills
// ============================================================
// Phase 7: 16 Base + 80 Hidden Class Skills
// ============================================================

// ============================================================
// BASE CLASS SKILLS (16)
// ============================================================

const BASE_SKILLS = {
  // === SWORDSMAN (4) ===
  slash: {
    id: 'slash', name: 'Slash', class: 'swordsman', element: 'none', mpCost: 5,
    type: 'damage', scaling: { stat: 'pDmg', multiplier: 1.2 }, effects: [],
    description: 'Quick slash. 120% P.DMG.', hits: 1
  },
  heavyStrike: {
    id: 'heavyStrike', name: 'Heavy Strike', class: 'swordsman', element: 'none', mpCost: 12,
    type: 'damage', scaling: { stat: 'pDmg', multiplier: 1.8 }, effects: [],
    description: 'Powerful strike. 180% P.DMG.', hits: 1
  },
  shieldBash: {
    id: 'shieldBash', name: 'Shield Bash', class: 'swordsman', element: 'none', mpCost: 8,
    type: 'damage', scaling: { stat: 'pDmg', multiplier: 1.0 },
    effects: [{ type: 'debuff', buffType: 'atkDown', value: 15, duration: 2 }],
    description: '100% P.DMG + -15% ATK (2t).', hits: 1
  },
  warCry: {
    id: 'warCry', name: 'War Cry', class: 'swordsman', element: 'none', mpCost: 15,
    type: 'buff', scaling: null,
    effects: [{ type: 'buff', buffType: 'pDmgUp', value: 25, duration: 3, target: 'self' }],
    description: '+25% P.DMG for 3 turns.', hits: 0
  },

  // === THIEF (4) ===
  backstab: {
    id: 'backstab', name: 'Backstab', class: 'thief', element: 'none', mpCost: 8,
    type: 'damage', scaling: { stat: 'pDmg', multiplier: 2.0 },
    effects: [{ type: 'critBonus', value: 30 }],
    description: '200% P.DMG + 30% crit bonus.', hits: 1
  },
  poisonBlade: {
    id: 'poisonBlade', name: 'Poison Blade', class: 'thief', element: 'nature', mpCost: 10,
    type: 'damage', scaling: { stat: 'pDmg', multiplier: 1.0 },
    effects: [{ type: 'dot', dotType: 'poison', scaling: 0.15, duration: 3 }],
    description: '100% P.DMG + Poison 15%/t (3t).', hits: 1
  },
  smokeScreen: {
    id: 'smokeScreen', name: 'Smoke Screen', class: 'thief', element: 'none', mpCost: 12,
    type: 'buff', scaling: null,
    effects: [{ type: 'buff', buffType: 'evasionUp', value: 40, duration: 2, target: 'self' }],
    description: '+40% Evasion for 2 turns.', hits: 0
  },
  steal: {
    id: 'steal', name: 'Steal', class: 'thief', element: 'none', mpCost: 5,
    type: 'utility', scaling: null,
    effects: [{ type: 'steal', minPercent: 5, maxPercent: 15 }],
    description: 'Steal 5-15% enemy gold.', hits: 0
  },

  // === ARCHER (4) ===
  preciseShot: {
    id: 'preciseShot', name: 'Precise Shot', class: 'archer', element: 'none', mpCost: 6,
    type: 'damage', scaling: { stat: 'pDmg', multiplier: 1.5 },
    effects: [{ type: 'neverMiss' }],
    description: '150% P.DMG, never misses.', hits: 1
  },
  multiShot: {
    id: 'multiShot', name: 'Multi Shot', class: 'archer', element: 'none', mpCost: 14,
    type: 'damage', scaling: { stat: 'pDmg', multiplier: 0.6 }, effects: [],
    description: '3 hits × 60% P.DMG.', hits: 3
  },
  eagleEye: {
    id: 'eagleEye', name: 'Eagle Eye', class: 'archer', element: 'none', mpCost: 10,
    type: 'buff', scaling: null,
    effects: [
      { type: 'buff', buffType: 'critRateUp', value: 25, duration: 3, target: 'self' },
      { type: 'buff', buffType: 'critDmgUp', value: 20, duration: 3, target: 'self' }
    ],
    description: '+25% Crit Rate, +20% Crit DMG (3t).', hits: 0
  },
  arrowRain: {
    id: 'arrowRain', name: 'Arrow Rain', class: 'archer', element: 'none', mpCost: 20,
    type: 'damage', scaling: { stat: 'pDmg', multiplier: 2.2 }, effects: [],
    description: '220% P.DMG.', hits: 1
  },

  // === MAGE (4) ===
  fireball: {
    id: 'fireball', name: 'Fireball', class: 'mage', element: 'fire', mpCost: 10,
    type: 'damage', scaling: { stat: 'mDmg', multiplier: 1.6 },
    effects: [{ type: 'dot', dotType: 'burn', scaling: 0.2, duration: 3 }],
    description: '160% M.DMG (🔥) + Burn 20%/t (3t).', hits: 1
  },
  iceSpear: {
    id: 'iceSpear', name: 'Ice Spear', class: 'mage', element: 'ice', mpCost: 12,
    type: 'damage', scaling: { stat: 'mDmg', multiplier: 1.4 },
    effects: [{ type: 'debuff', buffType: 'atkDown', value: 20, duration: 2 }],
    description: '140% M.DMG (❄️) + -20% ATK (2t).', hits: 1
  },
  manaShield: {
    id: 'manaShield', name: 'Mana Shield', class: 'mage', element: 'none', mpCost: 15,
    type: 'buff', scaling: null,
    effects: [{ type: 'shield', scalingStat: 'currentMp', multiplier: 0.5 }],
    description: 'Shield = 50% current MP.', hits: 0
  },
  thunderbolt: {
    id: 'thunderbolt', name: 'Thunderbolt', class: 'mage', element: 'lightning', mpCost: 18,
    type: 'damage', scaling: { stat: 'mDmg', multiplier: 2.0 }, effects: [],
    description: '200% M.DMG (⚡).', hits: 1
  }
};

// ============================================================
// HIDDEN CLASS SKILLS (80)
// ============================================================

const HIDDEN_SKILLS = {
  // ========== SWORDSMAN HIDDEN CLASSES ==========
  
  // --- FLAMEBLADE (Fire) ---
  flameSlash: {
    id: 'flameSlash', name: 'Flame Slash', class: 'flameblade', element: 'fire', mpCost: 15,
    type: 'damage', scaling: { stat: 'pDmg', multiplier: 1.8 },
    effects: [{ type: 'dot', dotType: 'burn', scaling: 0.25, duration: 3 }],
    description: '180% P.DMG (🔥) + Burn 25%/t (3t).', hits: 1
  },
  infernoStrike: {
    id: 'infernoStrike', name: 'Inferno Strike', class: 'flameblade', element: 'fire', mpCost: 25,
    type: 'damage', scaling: { stat: 'pDmg', multiplier: 2.8 }, effects: [],
    description: '280% P.DMG (🔥).', hits: 1
  },
  fireAura: {
    id: 'fireAura', name: 'Fire Aura', class: 'flameblade', element: 'fire', mpCost: 20,
    type: 'buff', scaling: null,
    effects: [
      { type: 'buff', buffType: 'pDmgUp', value: 30, duration: 3, target: 'self' },
      { type: 'buff', buffType: 'reflect', value: 10, duration: 3, target: 'self' }
    ],
    description: '+30% P.DMG, reflect 10% (3t).', hits: 0
  },
  volcanicRage: {
    id: 'volcanicRage', name: 'Volcanic Rage', class: 'flameblade', element: 'fire', mpCost: 40,
    type: 'damage', scaling: { stat: 'pDmg', multiplier: 3.5 },
    effects: [{ type: 'dot', dotType: 'burn', scaling: 0.30, duration: 3 }],
    description: '350% P.DMG (🔥) + Burn 30%/t (3t).', hits: 1
  },

  // --- BERSERKER (None) ---
  rageSlash: {
    id: 'rageSlash', name: 'Rage Slash', class: 'berserker', element: 'none', mpCost: 10,
    type: 'damage', scaling: { stat: 'pDmg', multiplier: 2.0 },
    effects: [{ type: 'selfDamage', percent: 5 }],
    description: '200% P.DMG. Costs 5% HP.', hits: 1
  },
  bloodFury: {
    id: 'bloodFury', name: 'Blood Fury', class: 'berserker', element: 'none', mpCost: 20,
    type: 'buff', scaling: null,
    effects: [
      { type: 'buff', buffType: 'pDmgUp', value: 50, duration: 3, target: 'self' },
      { type: 'debuff', buffType: 'defDown', value: 20, duration: 3, target: 'self' }
    ],
    description: '+50% P.DMG, -20% DEF (3t).', hits: 0
  },
  recklessCharge: {
    id: 'recklessCharge', name: 'Reckless Charge', class: 'berserker', element: 'none', mpCost: 15,
    type: 'damage', scaling: { stat: 'pDmg', multiplier: 2.5 },
    effects: [{ type: 'selfDamage', percent: 10 }],
    description: '250% P.DMG. Costs 10% HP.', hits: 1
  },
  deathwish: {
    id: 'deathwish', name: 'Deathwish', class: 'berserker', element: 'none', mpCost: 35,
    type: 'damage', scaling: { stat: 'pDmg', multiplier: 4.0 },
    effects: [{ type: 'selfDamage', percent: 20 }],
    description: '400% P.DMG. Costs 20% HP.', hits: 1
  },

  // --- PALADIN (Holy) ---
  holyStrike: {
    id: 'holyStrike', name: 'Holy Strike', class: 'paladin', element: 'holy', mpCost: 12,
    type: 'damage', scaling: { stat: 'pDmg', multiplier: 1.6 }, effects: [],
    description: '160% P.DMG (✨).', hits: 1
  },
  divineShield: {
    id: 'divineShield', name: 'Divine Shield', class: 'paladin', element: 'holy', mpCost: 18,
    type: 'buff', scaling: null,
    effects: [{ type: 'shield', scalingStat: 'pDef', multiplier: 2.0 }],
    description: 'Shield = 200% P.DEF.', hits: 0
  },
  healingLight: {
    id: 'healingLight', name: 'Healing Light', class: 'paladin', element: 'holy', mpCost: 20,
    type: 'heal', scaling: { stat: 'maxHp', multiplier: 0.35 }, effects: [],
    description: 'Heal 35% Max HP.', hits: 0
  },
  judgment: {
    id: 'judgment', name: 'Judgment', class: 'paladin', element: 'holy', mpCost: 35,
    type: 'damage', scaling: { stat: 'pDmg', multiplier: 3.0 },
    effects: [{ type: 'cleanse', target: 'self' }],
    description: '300% P.DMG (✨) + Purify self.', hits: 1
  },

  // --- EARTHSHAKER (Earth) ---
  groundSlam: {
    id: 'groundSlam', name: 'Ground Slam', class: 'earthshaker', element: 'earth', mpCost: 12,
    type: 'damage', scaling: { stat: 'pDmg', multiplier: 1.5 },
    effects: [{ type: 'debuff', buffType: 'defDown', value: 20, duration: 2 }],
    description: '150% P.DMG (🌍) + -20% DEF (2t).', hits: 1
  },
  stoneSkin: {
    id: 'stoneSkin', name: 'Stone Skin', class: 'earthshaker', element: 'earth', mpCost: 15,
    type: 'buff', scaling: null,
    effects: [{ type: 'buff', buffType: 'pDefUp', value: 50, duration: 3, target: 'self' }],
    description: '+50% P.DEF (3t).', hits: 0
  },
  earthquake: {
    id: 'earthquake', name: 'Earthquake', class: 'earthshaker', element: 'earth', mpCost: 25,
    type: 'damage', scaling: { stat: 'pDmg', multiplier: 2.2 },
    effects: [{ type: 'debuff', buffType: 'defDown', value: 30, duration: 2 }],
    description: '220% P.DMG (🌍) + -30% DEF (2t).', hits: 1
  },
  titansWrath: {
    id: 'titansWrath', name: 'Titan\'s Wrath', class: 'earthshaker', element: 'earth', mpCost: 40,
    type: 'damage', scaling: { stat: 'pDmg', multiplier: 3.2 },
    effects: [{ type: 'control', controlType: 'stun', duration: 1 }],
    description: '320% P.DMG (🌍) + Stun (1t).', hits: 1
  },

  // --- FROSTGUARD (Ice) ---
  frostStrike: {
    id: 'frostStrike', name: 'Frost Strike', class: 'frostguard', element: 'ice', mpCost: 12,
    type: 'damage', scaling: { stat: 'pDmg', multiplier: 1.4 },
    effects: [{ type: 'debuff', buffType: 'atkDown', value: 15, duration: 2 }],
    description: '140% P.DMG (❄️) + -15% ATK (2t).', hits: 1
  },
  iceBarrier: {
    id: 'iceBarrier', name: 'Ice Barrier', class: 'frostguard', element: 'ice', mpCost: 18,
    type: 'buff', scaling: null,
    effects: [
      { type: 'buff', buffType: 'defUp', value: 40, duration: 3, target: 'self' },
      { type: 'buff', buffType: 'reflect', value: 15, duration: 3, target: 'self' }
    ],
    description: '+40% DEF, reflect 15% (3t).', hits: 0
  },
  frozenBlade: {
    id: 'frozenBlade', name: 'Frozen Blade', class: 'frostguard', element: 'ice', mpCost: 20,
    type: 'damage', scaling: { stat: 'pDmg', multiplier: 2.0 },
    effects: [{ type: 'debuff', buffType: 'atkDown', value: 25, duration: 2 }],
    description: '200% P.DMG (❄️) + -25% ATK (2t).', hits: 1
  },
  glacialFortress: {
    id: 'glacialFortress', name: 'Glacial Fortress', class: 'frostguard', element: 'ice', mpCost: 35,
    type: 'buff', scaling: null,
    effects: [
      { type: 'buff', buffType: 'defUp', value: 60, duration: 2, target: 'self' },
      { type: 'buff', buffType: 'immuneDebuff', value: 1, duration: 2, target: 'self' }
    ],
    description: '+60% DEF, immune to debuffs (2t).', hits: 0
  },

  // ========== THIEF HIDDEN CLASSES ==========
  
  // --- SHADOW DANCER (Dark) ---
  shadowStrike: {
    id: 'shadowStrike', name: 'Shadow Strike', class: 'shadowDancer', element: 'dark', mpCost: 12,
    type: 'damage', scaling: { stat: 'pDmg', multiplier: 2.2 },
    effects: [{ type: 'critBonus', value: 40 }],
    description: '220% P.DMG (🌑) + 40% crit bonus.', hits: 1
  },
  vanish: {
    id: 'vanish', name: 'Vanish', class: 'shadowDancer', element: 'dark', mpCost: 20,
    type: 'buff', scaling: null,
    effects: [{ type: 'buff', buffType: 'vanish', value: 100, duration: 99, target: 'self' }],
    description: 'Next attack auto-crits + 100% bonus.', hits: 0
  },
  deathMark: {
    id: 'deathMark', name: 'Death Mark', class: 'shadowDancer', element: 'dark', mpCost: 18,
    type: 'debuff', scaling: null,
    effects: [{ type: 'debuff', buffType: 'damageTakenUp', value: 30, duration: 3 }],
    description: 'Enemy takes +30% damage (3t).', hits: 0
  },
  shadowDance: {
    id: 'shadowDance', name: 'Shadow Dance', class: 'shadowDancer', element: 'dark', mpCost: 35,
    type: 'damage', scaling: { stat: 'pDmg', multiplier: 0.8 }, effects: [],
    description: '5 hits × 80% P.DMG (🌑).', hits: 5
  },

  // --- VENOMANCER (Nature) ---
  toxicStrike: {
    id: 'toxicStrike', name: 'Toxic Strike', class: 'venomancer', element: 'nature', mpCost: 10,
    type: 'damage', scaling: { stat: 'pDmg', multiplier: 1.2 },
    effects: [{ type: 'dot', dotType: 'poison', scaling: 0.20, duration: 3 }],
    description: '120% P.DMG + Poison 20%/t (3t).', hits: 1
  },
  venomCoat: {
    id: 'venomCoat', name: 'Venom Coat', class: 'venomancer', element: 'nature', mpCost: 15,
    type: 'buff', scaling: null,
    effects: [{ type: 'buff', buffType: 'poisonOnHit', value: 10, duration: 3, target: 'self' }],
    description: 'Attacks add Poison 10%/t (3t).', hits: 0
  },
  plague: {
    id: 'plague', name: 'Plague', class: 'venomancer', element: 'nature', mpCost: 22,
    type: 'damage', scaling: { stat: 'pDmg', multiplier: 1.5 },
    effects: [{ type: 'dot', dotType: 'poison', scaling: 0.35, duration: 4 }],
    description: '150% P.DMG (🌿) + Poison 35%/t (4t).', hits: 1
  },
  pandemic: {
    id: 'pandemic', name: 'Pandemic', class: 'venomancer', element: 'nature', mpCost: 38,
    type: 'damage', scaling: { stat: 'pDmg', multiplier: 2.0 },
    effects: [{ type: 'dot', dotType: 'poison', scaling: 0.50, duration: 5 }],
    description: '200% P.DMG (🌿) + Poison 50%/t (5t).', hits: 1
  },

  // --- ASSASSIN (None) ---
  exposeWeakness: {
    id: 'exposeWeakness', name: 'Expose Weakness', class: 'assassin', element: 'none', mpCost: 10,
    type: 'damage', scaling: { stat: 'pDmg', multiplier: 1.3 },
    effects: [{ type: 'debuff', buffType: 'defDown', value: 25, duration: 2 }],
    description: '130% P.DMG + -25% DEF (2t).', hits: 1
  },
  markForDeath: {
    id: 'markForDeath', name: 'Mark for Death', class: 'assassin', element: 'none', mpCost: 15,
    type: 'debuff', scaling: null,
    effects: [{ type: 'debuff', buffType: 'critReceivedUp', value: 40, duration: 3 }],
    description: 'Enemy +40% crit received (3t).', hits: 0
  },
  execute: {
    id: 'execute', name: 'Execute', class: 'assassin', element: 'none', mpCost: 25,
    type: 'damage', scaling: { stat: 'pDmg', multiplier: 2.5 },
    effects: [{ type: 'executeBonus', threshold: 30, bonusMultiplier: 1.0 }],
    description: '250% P.DMG (+100% if enemy <30% HP).', hits: 1
  },
  assassination: {
    id: 'assassination', name: 'Assassination', class: 'assassin', element: 'none', mpCost: 40,
    type: 'damage', scaling: { stat: 'pDmg', multiplier: 5.0 },
    effects: [{ type: 'requireHpThreshold', threshold: 20 }],
    description: '500% P.DMG (only if enemy <20% HP).', hits: 1
  },

  // --- PHANTOM (Dark) ---
  haunt: {
    id: 'haunt', name: 'Haunt', class: 'phantom', element: 'dark', mpCost: 12,
    type: 'damage', scaling: { stat: 'pDmg', multiplier: 1.4 },
    effects: [{ type: 'debuff', buffType: 'allStatsDown', value: 15, duration: 2 }],
    description: '140% P.DMG (🌑) + -15% all stats (2t).', hits: 1
  },
  nightmare: {
    id: 'nightmare', name: 'Nightmare', class: 'phantom', element: 'dark', mpCost: 18,
    type: 'debuff', scaling: null,
    effects: [
      { type: 'debuff', buffType: 'atkDown', value: 30, duration: 3 },
      { type: 'debuff', buffType: 'defDown', value: 30, duration: 3 }
    ],
    description: '-30% ATK, -30% DEF (3t).', hits: 0
  },
  soulDrain: {
    id: 'soulDrain', name: 'Soul Drain', class: 'phantom', element: 'dark', mpCost: 20,
    type: 'damage', scaling: { stat: 'pDmg', multiplier: 1.8 },
    effects: [{ type: 'lifesteal', value: 30 }],
    description: '180% P.DMG (🌑) + Heal 30% dealt.', hits: 1
  },
  dread: {
    id: 'dread', name: 'Dread', class: 'phantom', element: 'dark', mpCost: 40,
    type: 'damage', scaling: { stat: 'pDmg', multiplier: 2.5 },
    effects: [{ type: 'debuff', buffType: 'allStatsDown', value: 40, duration: 3 }],
    description: '250% P.DMG (🌑) + -40% all stats (3t).', hits: 1
  },

  // --- BLOODREAPER (None) ---
  bloodlet: {
    id: 'bloodlet', name: 'Bloodlet', class: 'bloodreaper', element: 'none', mpCost: 10,
    type: 'damage', scaling: { stat: 'pDmg', multiplier: 1.5 },
    effects: [{ type: 'lifesteal', value: 20 }],
    description: '150% P.DMG + Lifesteal 20%.', hits: 1
  },
  sanguineBlade: {
    id: 'sanguineBlade', name: 'Sanguine Blade', class: 'bloodreaper', element: 'none', mpCost: 15,
    type: 'buff', scaling: null,
    effects: [{ type: 'buff', buffType: 'lifesteal', value: 25, duration: 3, target: 'self' }],
    description: 'Attacks lifesteal 25% (3t).', hits: 0
  },
  crimsonSlash: {
    id: 'crimsonSlash', name: 'Crimson Slash', class: 'bloodreaper', element: 'none', mpCost: 22,
    type: 'damage', scaling: { stat: 'pDmg', multiplier: 2.2 },
    effects: [{ type: 'lifesteal', value: 35 }],
    description: '220% P.DMG + Lifesteal 35%.', hits: 1
  },
  exsanguinate: {
    id: 'exsanguinate', name: 'Exsanguinate', class: 'bloodreaper', element: 'none', mpCost: 38,
    type: 'damage', scaling: { stat: 'pDmg', multiplier: 3.0 },
    effects: [{ type: 'lifesteal', value: 50 }],
    description: '300% P.DMG + Lifesteal 50%.', hits: 1
  },

  // ========== ARCHER HIDDEN CLASSES ==========
  
  // --- STORM RANGER (Lightning) ---
  lightningArrow: {
    id: 'lightningArrow', name: 'Lightning Arrow', class: 'stormRanger', element: 'lightning', mpCost: 14,
    type: 'damage', scaling: { stat: 'pDmg', multiplier: 2.0 }, effects: [],
    description: '200% P.DMG (⚡).', hits: 1
  },
  chainLightning: {
    id: 'chainLightning', name: 'Chain Lightning', class: 'stormRanger', element: 'lightning', mpCost: 22,
    type: 'damage', scaling: { stat: 'mDmg', multiplier: 1.0 }, effects: [],
    description: '3 hits × 100% M.DMG (⚡).', hits: 3
  },
  stormEye: {
    id: 'stormEye', name: 'Storm Eye', class: 'stormRanger', element: 'lightning', mpCost: 18,
    type: 'buff', scaling: null,
    effects: [
      { type: 'buff', buffType: 'accuracyUp', value: 30, duration: 3, target: 'self' },
      { type: 'buff', buffType: 'critDmgUp', value: 40, duration: 3, target: 'self' }
    ],
    description: '+30% Accuracy, +40% Crit DMG (3t).', hits: 0
  },
  thunderstorm: {
    id: 'thunderstorm', name: 'Thunderstorm', class: 'stormRanger', element: 'lightning', mpCost: 45,
    type: 'damage', scaling: { stat: 'mDmg', multiplier: 1.2 }, effects: [],
    description: '4 hits × 120% M.DMG (⚡).', hits: 4
  },

  // --- PYRO ARCHER (Fire) ---
  fireArrow: {
    id: 'fireArrow', name: 'Fire Arrow', class: 'pyroArcher', element: 'fire', mpCost: 12,
    type: 'damage', scaling: { stat: 'pDmg', multiplier: 1.7 },
    effects: [{ type: 'dot', dotType: 'burn', scaling: 0.20, duration: 3 }],
    description: '170% P.DMG (🔥) + Burn 20%/t (3t).', hits: 1
  },
  explosiveShot: {
    id: 'explosiveShot', name: 'Explosive Shot', class: 'pyroArcher', element: 'fire', mpCost: 18,
    type: 'damage', scaling: { stat: 'pDmg', multiplier: 2.3 }, effects: [],
    description: '230% P.DMG (🔥).', hits: 1
  },
  ignite: {
    id: 'ignite', name: 'Ignite', class: 'pyroArcher', element: 'fire', mpCost: 15,
    type: 'buff', scaling: null,
    effects: [{ type: 'buff', buffType: 'burnOnHit', value: 15, duration: 3, target: 'self' }],
    description: 'Attacks add Burn 15%/t (3t).', hits: 0
  },
  meteorArrow: {
    id: 'meteorArrow', name: 'Meteor Arrow', class: 'pyroArcher', element: 'fire', mpCost: 40,
    type: 'damage', scaling: { stat: 'pDmg', multiplier: 3.5 },
    effects: [{ type: 'dot', dotType: 'burn', scaling: 0.40, duration: 3 }],
    description: '350% P.DMG (🔥) + Burn 40%/t (3t).', hits: 1
  },

  // --- FROST SNIPER (Ice) ---
  iceArrow: {
    id: 'iceArrow', name: 'Ice Arrow', class: 'frostSniper', element: 'ice', mpCost: 12,
    type: 'damage', scaling: { stat: 'pDmg', multiplier: 1.8 },
    effects: [{ type: 'debuff', buffType: 'atkDown', value: 15, duration: 2 }],
    description: '180% P.DMG (❄️) + -15% ATK (2t).', hits: 1
  },
  frozenAim: {
    id: 'frozenAim', name: 'Frozen Aim', class: 'frostSniper', element: 'ice', mpCost: 15,
    type: 'buff', scaling: null,
    effects: [{ type: 'buff', buffType: 'critDmgUp', value: 50, duration: 3, target: 'self' }],
    description: '+50% Crit DMG (3t).', hits: 0
  },
  piercingCold: {
    id: 'piercingCold', name: 'Piercing Cold', class: 'frostSniper', element: 'ice', mpCost: 22,
    type: 'damage', scaling: { stat: 'pDmg', multiplier: 2.6 },
    effects: [{ type: 'debuff', buffType: 'defDown', value: 25, duration: 2 }],
    description: '260% P.DMG (❄️) + -25% DEF (2t).', hits: 1
  },
  absoluteShot: {
    id: 'absoluteShot', name: 'Absolute Shot', class: 'frostSniper', element: 'ice', mpCost: 42,
    type: 'damage', scaling: { stat: 'pDmg', multiplier: 4.2 },
    effects: [{ type: 'control', controlType: 'freeze', duration: 1 }],
    description: '420% P.DMG (❄️) + Freeze (1t).', hits: 1
  },

  // --- NATURE WARDEN (Nature) ---
  thornArrow: {
    id: 'thornArrow', name: 'Thorn Arrow', class: 'natureWarden', element: 'nature', mpCost: 10,
    type: 'damage', scaling: { stat: 'pDmg', multiplier: 1.5 },
    effects: [{ type: 'dot', dotType: 'poison', scaling: 0.15, duration: 3 }],
    description: '150% P.DMG (🌿) + Poison 15%/t (3t).', hits: 1
  },
  naturesGift: {
    id: 'naturesGift', name: 'Nature\'s Gift', class: 'natureWarden', element: 'nature', mpCost: 18,
    type: 'heal', scaling: { stat: 'maxHp', multiplier: 0.30 },
    effects: [{ type: 'cleanse', target: 'self' }],
    description: 'Heal 30% Max HP + Remove debuffs.', hits: 0
  },
  vineTrap: {
    id: 'vineTrap', name: 'Vine Trap', class: 'natureWarden', element: 'nature', mpCost: 15,
    type: 'damage', scaling: { stat: 'pDmg', multiplier: 1.3 },
    effects: [{ type: 'debuff', buffType: 'evasionDown', value: 40, duration: 2 }],
    description: '130% P.DMG (🌿) + -40% Evasion (2t).', hits: 1
  },
  overgrowth: {
    id: 'overgrowth', name: 'Overgrowth', class: 'natureWarden', element: 'nature', mpCost: 35,
    type: 'damage', scaling: { stat: 'pDmg', multiplier: 2.8 },
    effects: [{ type: 'dot', dotType: 'poison', scaling: 0.30, duration: 4 }],
    description: '280% P.DMG (🌿) + Poison 30%/t (4t).', hits: 1
  },

  // --- VOID HUNTER (Dark) ---
  voidArrow: {
    id: 'voidArrow', name: 'Void Arrow', class: 'voidHunter', element: 'dark', mpCost: 14,
    type: 'damage', scaling: { stat: 'pDmg', multiplier: 1.9 },
    effects: [{ type: 'armorPen', value: 30 }],
    description: '190% P.DMG (🌑), ignores 30% DEF.', hits: 1
  },
  nullZone: {
    id: 'nullZone', name: 'Null Zone', class: 'voidHunter', element: 'dark', mpCost: 18,
    type: 'debuff', scaling: null,
    effects: [{ type: 'debuff', buffType: 'defDown', value: 40, duration: 3 }],
    description: 'Enemy -40% DEF (3t).', hits: 0
  },
  darkVolley: {
    id: 'darkVolley', name: 'Dark Volley', class: 'voidHunter', element: 'dark', mpCost: 25,
    type: 'damage', scaling: { stat: 'pDmg', multiplier: 0.9 }, effects: [],
    description: '3 hits × 90% P.DMG (🌑).', hits: 3
  },
  oblivion: {
    id: 'oblivion', name: 'Oblivion', class: 'voidHunter', element: 'dark', mpCost: 45,
    type: 'damage', scaling: { stat: 'pDmg', multiplier: 3.8 },
    effects: [{ type: 'armorPen', value: 50 }],
    description: '380% P.DMG (🌑), ignores 50% DEF.', hits: 1
  },

  // ========== MAGE HIDDEN CLASSES ==========
  
  // --- FROST WEAVER (Ice) ---
  frostBolt: {
    id: 'frostBolt', name: 'Frost Bolt', class: 'frostWeaver', element: 'ice', mpCost: 12,
    type: 'damage', scaling: { stat: 'mDmg', multiplier: 1.5 },
    effects: [{ type: 'debuff', buffType: 'atkDown', value: 25, duration: 2 }],
    description: '150% M.DMG (❄️) + -25% ATK (2t).', hits: 1
  },
  blizzard: {
    id: 'blizzard', name: 'Blizzard', class: 'frostWeaver', element: 'ice', mpCost: 28,
    type: 'damage', scaling: { stat: 'mDmg', multiplier: 2.0 },
    effects: [{ type: 'debuff', buffType: 'defDown', value: 30, duration: 2 }],
    description: '200% M.DMG (❄️) + -30% DEF (2t).', hits: 1
  },
  iceArmor: {
    id: 'iceArmor', name: 'Ice Armor', class: 'frostWeaver', element: 'ice', mpCost: 20,
    type: 'buff', scaling: null,
    effects: [
      { type: 'buff', buffType: 'pDefUp', value: 40, duration: 3, target: 'self' },
      { type: 'buff', buffType: 'mDefUp', value: 20, duration: 3, target: 'self' }
    ],
    description: '+40% P.DEF, +20% M.DEF (3t).', hits: 0
  },
  absoluteZero: {
    id: 'absoluteZero', name: 'Absolute Zero', class: 'frostWeaver', element: 'ice', mpCost: 50,
    type: 'damage', scaling: { stat: 'mDmg', multiplier: 4.0 },
    effects: [{ type: 'control', controlType: 'freeze', duration: 1 }],
    description: '400% M.DMG (❄️) + Freeze (1t).', hits: 1
  },

  // --- PYROMANCER (Fire) ---
  flameBurst: {
    id: 'flameBurst', name: 'Flame Burst', class: 'pyromancer', element: 'fire', mpCost: 12,
    type: 'damage', scaling: { stat: 'mDmg', multiplier: 1.7 },
    effects: [{ type: 'dot', dotType: 'burn', scaling: 0.20, duration: 3 }],
    description: '170% M.DMG (🔥) + Burn 20%/t (3t).', hits: 1
  },
  combustion: {
    id: 'combustion', name: 'Combustion', class: 'pyromancer', element: 'fire', mpCost: 20,
    type: 'damage', scaling: { stat: 'mDmg', multiplier: 2.4 }, effects: [],
    description: '240% M.DMG (🔥).', hits: 1
  },
  inferno: {
    id: 'inferno', name: 'Inferno', class: 'pyromancer', element: 'fire', mpCost: 30,
    type: 'damage', scaling: { stat: 'mDmg', multiplier: 2.8 },
    effects: [{ type: 'dot', dotType: 'burn', scaling: 0.35, duration: 3 }],
    description: '280% M.DMG (🔥) + Burn 35%/t (3t).', hits: 1
  },
  hellfire: {
    id: 'hellfire', name: 'Hellfire', class: 'pyromancer', element: 'fire', mpCost: 48,
    type: 'damage', scaling: { stat: 'mDmg', multiplier: 4.5 },
    effects: [{ type: 'dot', dotType: 'burn', scaling: 0.50, duration: 4 }],
    description: '450% M.DMG (🔥) + Burn 50%/t (4t).', hits: 1
  },

  // --- STORMCALLER (Lightning) ---
  shock: {
    id: 'shock', name: 'Shock', class: 'stormcaller', element: 'lightning', mpCost: 10,
    type: 'damage', scaling: { stat: 'mDmg', multiplier: 1.4 },
    effects: [{ type: 'control', controlType: 'stun', duration: 1, chance: 0.20 }],
    description: '140% M.DMG (⚡) + 20% Stun (1t).', hits: 1
  },
  lightningBolt: {
    id: 'lightningBolt', name: 'Lightning Bolt', class: 'stormcaller', element: 'lightning', mpCost: 18,
    type: 'damage', scaling: { stat: 'mDmg', multiplier: 2.0 }, effects: [],
    description: '200% M.DMG (⚡).', hits: 1
  },
  thunderChain: {
    id: 'thunderChain', name: 'Thunder Chain', class: 'stormcaller', element: 'lightning', mpCost: 25,
    type: 'damage', scaling: { stat: 'mDmg', multiplier: 0.9 }, effects: [],
    description: '3 hits × 90% M.DMG (⚡).', hits: 3
  },
  tempest: {
    id: 'tempest', name: 'Tempest', class: 'stormcaller', element: 'lightning', mpCost: 45,
    type: 'damage', scaling: { stat: 'mDmg', multiplier: 1.0 }, effects: [],
    description: '5 hits × 100% M.DMG (⚡).', hits: 5
  },

  // --- NECROMANCER (Dark) ---
  lifeDrain: {
    id: 'lifeDrain', name: 'Life Drain', class: 'necromancer', element: 'dark', mpCost: 12,
    type: 'damage', scaling: { stat: 'mDmg', multiplier: 1.4 },
    effects: [{ type: 'lifesteal', value: 30 }],
    description: '140% M.DMG (🌑) + Heal 30% dealt.', hits: 1
  },
  curse: {
    id: 'curse', name: 'Curse', class: 'necromancer', element: 'dark', mpCost: 15,
    type: 'debuff', scaling: null,
    effects: [{ type: 'debuff', buffType: 'allStatsDown', value: 25, duration: 3 }],
    description: 'Enemy -25% all stats (3t).', hits: 0
  },
  soulRend: {
    id: 'soulRend', name: 'Soul Rend', class: 'necromancer', element: 'dark', mpCost: 25,
    type: 'damage', scaling: { stat: 'mDmg', multiplier: 2.2 },
    effects: [{ type: 'lifesteal', value: 40 }],
    description: '220% M.DMG (🌑) + Heal 40% dealt.', hits: 1
  },
  deathPact: {
    id: 'deathPact', name: 'Death Pact', class: 'necromancer', element: 'dark', mpCost: 42,
    type: 'damage', scaling: { stat: 'mDmg', multiplier: 3.5 },
    effects: [{ type: 'lifesteal', value: 50 }],
    description: '350% M.DMG (🌑) + Heal 50% dealt.', hits: 1
  },

  // --- ARCANIST (Holy) ---
  arcaneMissile: {
    id: 'arcaneMissile', name: 'Arcane Missile', class: 'arcanist', element: 'holy', mpCost: 10,
    type: 'damage', scaling: { stat: 'mDmg', multiplier: 1.6 }, effects: [],
    description: '160% M.DMG (✨).', hits: 1
  },
  empower: {
    id: 'empower', name: 'Empower', class: 'arcanist', element: 'holy', mpCost: 18,
    type: 'buff', scaling: null,
    effects: [{ type: 'buff', buffType: 'mDmgUp', value: 35, duration: 3, target: 'self' }],
    description: '+35% M.DMG (3t).', hits: 0
  },
  arcaneBurst: {
    id: 'arcaneBurst', name: 'Arcane Burst', class: 'arcanist', element: 'holy', mpCost: 28,
    type: 'damage', scaling: { stat: 'mDmg', multiplier: 2.8 }, effects: [],
    description: '280% M.DMG (✨).', hits: 1
  },
  transcendence: {
    id: 'transcendence', name: 'Transcendence', class: 'arcanist', element: 'holy', mpCost: 45,
    type: 'buff', scaling: null,
    effects: [
      { type: 'buff', buffType: 'atkUp', value: 50, duration: 3, target: 'self' },
      { type: 'buff', buffType: 'critRateUp', value: 30, duration: 3, target: 'self' }
    ],
    description: '+50% All DMG, +30% Crit Rate (3t).', hits: 0
  }
};

// ============================================================
// COMBINED SKILLS
// ============================================================

export const ALL_SKILLS = { ...BASE_SKILLS, ...HIDDEN_SKILLS };

// ============================================================
// HELPER FUNCTIONS
// ============================================================

export function getSkill(skillId) {
  return ALL_SKILLS[skillId] || null;
}

export function getSkillsForClass(classId) {
  return Object.values(ALL_SKILLS).filter(s => s.class === classId);
}

export function getBaseClassSkills(baseClassId) {
  return Object.values(BASE_SKILLS).filter(s => s.class === baseClassId);
}

export function getHiddenClassSkills(hiddenClassId) {
  return Object.values(HIDDEN_SKILLS).filter(s => s.class === hiddenClassId);
}

export function getAllSkillsForCharacter(baseClassId, hiddenClassId = null) {
  const skills = getBaseClassSkills(baseClassId);
  if (hiddenClassId && hiddenClassId !== 'none') {
    skills.push(...getHiddenClassSkills(hiddenClassId));
  }
  return skills;
}

export function formatSkillForDisplay(skill) {
  if (!skill) return null;
  
  const elementIcons = {
    none: '', fire: '🔥', water: '💧', lightning: '⚡', earth: '🌍',
    nature: '🌿', ice: '❄️', dark: '🌑', holy: '✨'
  };
  
  return {
    id: skill.id,
    name: skill.name,
    mpCost: skill.mpCost,
    element: skill.element,
    elementIcon: elementIcons[skill.element] || '',
    description: skill.description,
    type: skill.type,
    hits: skill.hits || 1,
    scaling: skill.scaling
  };
}

export default {
  BASE_SKILLS,
  HIDDEN_SKILLS,
  ALL_SKILLS,
  getSkill,
  getSkillsForClass,
  getBaseClassSkills,
  getHiddenClassSkills,
  getAllSkillsForCharacter,
  formatSkillForDisplay
};
