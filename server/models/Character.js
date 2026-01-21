import mongoose from 'mongoose';
import { SET_BONUS_DEFINITIONS } from '../data/setBonuses.js';

// ============================================================
// DEBUG: Log SET_BONUS_DEFINITIONS on server start
// ============================================================
console.log('[Character.js] SET_BONUS_DEFINITIONS loaded:', Object.keys(SET_BONUS_DEFINITIONS || {}).length, 'sets');
if (SET_BONUS_DEFINITIONS && SET_BONUS_DEFINITIONS['vip_premium_set']) {
  console.log('[Character.js] vip_premium_set found:', JSON.stringify(SET_BONUS_DEFINITIONS['vip_premium_set']));
} else {
  console.log('[Character.js] WARNING: vip_premium_set NOT FOUND in SET_BONUS_DEFINITIONS!');
}

// ============================================================
// BASE STATS CONFIGURATION - Different for each class!
// ============================================================

const CLASS_BASE_STATS = {
  swordsman: { hp: 150, mp: 50, str: 15, agi: 8, dex: 8, int: 5, vit: 14 },
  thief: { hp: 100, mp: 70, str: 8, agi: 15, dex: 12, int: 7, vit: 8 },
  archer: { hp: 110, mp: 60, str: 10, agi: 12, dex: 15, int: 6, vit: 7 },
  mage: { hp: 80, mp: 120, str: 5, agi: 7, dex: 8, int: 15, vit: 5 }
};

// ============================================================
// HIDDEN CLASSES (20 Total - 5 per base class)
// ============================================================

const HIDDEN_CLASSES = {
  // Swordsman Hidden Classes
  flameblade: { baseClass: 'swordsman', element: 'fire', icon: '🔥' },
  berserker: { baseClass: 'swordsman', element: 'none', icon: '💢' },
  paladin: { baseClass: 'swordsman', element: 'holy', icon: '✨' },
  earthshaker: { baseClass: 'swordsman', element: 'earth', icon: '🌍' },
  frostguard: { baseClass: 'swordsman', element: 'ice', icon: '❄️' },
  
  // Thief Hidden Classes
  shadowDancer: { baseClass: 'thief', element: 'dark', icon: '🌑' },
  venomancer: { baseClass: 'thief', element: 'nature', icon: '🐍' },
  assassin: { baseClass: 'thief', element: 'none', icon: '⚫' },
  phantom: { baseClass: 'thief', element: 'dark', icon: '👻' },
  bloodreaper: { baseClass: 'thief', element: 'none', icon: '🩸' },
  
  // Archer Hidden Classes
  stormRanger: { baseClass: 'archer', element: 'lightning', icon: '⚡' },
  pyroArcher: { baseClass: 'archer', element: 'fire', icon: '🔥' },
  frostSniper: { baseClass: 'archer', element: 'ice', icon: '❄️' },
  natureWarden: { baseClass: 'archer', element: 'nature', icon: '🌿' },
  voidHunter: { baseClass: 'archer', element: 'dark', icon: '🌀' },
  
  // Mage Hidden Classes
  frostWeaver: { baseClass: 'mage', element: 'ice', icon: '❄️' },
  pyromancer: { baseClass: 'mage', element: 'fire', icon: '🔥' },
  stormcaller: { baseClass: 'mage', element: 'lightning', icon: '⚡' },
  necromancer: { baseClass: 'mage', element: 'dark', icon: '💀' },
  arcanist: { baseClass: 'mage', element: 'holy', icon: '✨' }
};

// ============================================================
// DEFAULT SKILLS BY CLASS
// ============================================================

const CLASS_DEFAULT_SKILLS = {
  swordsman: [
    { skillId: 'slash', name: 'Slash', level: 1, unlocked: true },
    { skillId: 'heavyStrike', name: 'Heavy Strike', level: 1, unlocked: true },
    { skillId: 'shieldBash', name: 'Shield Bash', level: 1, unlocked: true },
    { skillId: 'warCry', name: 'War Cry', level: 1, unlocked: true }
  ],
  thief: [
    { skillId: 'backstab', name: 'Backstab', level: 1, unlocked: true },
    { skillId: 'poisonBlade', name: 'Poison Blade', level: 1, unlocked: true },
    { skillId: 'smokeScreen', name: 'Smoke Screen', level: 1, unlocked: true },
    { skillId: 'steal', name: 'Steal', level: 1, unlocked: true }
  ],
  archer: [
    { skillId: 'preciseShot', name: 'Precise Shot', level: 1, unlocked: true },
    { skillId: 'multiShot', name: 'Multi Shot', level: 1, unlocked: true },
    { skillId: 'eagleEye', name: 'Eagle Eye', level: 1, unlocked: true },
    { skillId: 'arrowRain', name: 'Arrow Rain', level: 1, unlocked: true }
  ],
  mage: [
    { skillId: 'fireball', name: 'Fireball', level: 1, unlocked: true },
    { skillId: 'iceSpear', name: 'Ice Spear', level: 1, unlocked: true },
    { skillId: 'manaShield', name: 'Mana Shield', level: 1, unlocked: true },
    { skillId: 'thunderbolt', name: 'Thunderbolt', level: 1, unlocked: true }
  ]
};

// Hidden class skills mapping
const HIDDEN_CLASS_SKILLS = {
  flameblade: [
    { skillId: 'flameSlash', name: 'Flame Slash', level: 1, unlocked: true },
    { skillId: 'infernoStrike', name: 'Inferno Strike', level: 1, unlocked: true },
    { skillId: 'fireAura', name: 'Fire Aura', level: 1, unlocked: true },
    { skillId: 'volcanicRage', name: 'Volcanic Rage', level: 1, unlocked: true }
  ],
  berserker: [
    { skillId: 'rageSlash', name: 'Rage Slash', level: 1, unlocked: true },
    { skillId: 'bloodFury', name: 'Blood Fury', level: 1, unlocked: true },
    { skillId: 'recklessCharge', name: 'Reckless Charge', level: 1, unlocked: true },
    { skillId: 'deathwish', name: 'Deathwish', level: 1, unlocked: true }
  ],
  paladin: [
    { skillId: 'holyStrike', name: 'Holy Strike', level: 1, unlocked: true },
    { skillId: 'divineShield', name: 'Divine Shield', level: 1, unlocked: true },
    { skillId: 'healingLight', name: 'Healing Light', level: 1, unlocked: true },
    { skillId: 'judgment', name: 'Judgment', level: 1, unlocked: true }
  ],
  earthshaker: [
    { skillId: 'groundSlam', name: 'Ground Slam', level: 1, unlocked: true },
    { skillId: 'stoneSkin', name: 'Stone Skin', level: 1, unlocked: true },
    { skillId: 'earthquake', name: 'Earthquake', level: 1, unlocked: true },
    { skillId: 'titansWrath', name: 'Titan\'s Wrath', level: 1, unlocked: true }
  ],
  frostguard: [
    { skillId: 'frostStrike', name: 'Frost Strike', level: 1, unlocked: true },
    { skillId: 'iceBarrier', name: 'Ice Barrier', level: 1, unlocked: true },
    { skillId: 'frozenBlade', name: 'Frozen Blade', level: 1, unlocked: true },
    { skillId: 'glacialFortress', name: 'Glacial Fortress', level: 1, unlocked: true }
  ],
  shadowDancer: [
    { skillId: 'shadowStrike', name: 'Shadow Strike', level: 1, unlocked: true },
    { skillId: 'vanish', name: 'Vanish', level: 1, unlocked: true },
    { skillId: 'deathMark', name: 'Death Mark', level: 1, unlocked: true },
    { skillId: 'shadowDance', name: 'Shadow Dance', level: 1, unlocked: true }
  ],
  venomancer: [
    { skillId: 'toxicStrike', name: 'Toxic Strike', level: 1, unlocked: true },
    { skillId: 'venomCoat', name: 'Venom Coat', level: 1, unlocked: true },
    { skillId: 'plague', name: 'Plague', level: 1, unlocked: true },
    { skillId: 'pandemic', name: 'Pandemic', level: 1, unlocked: true }
  ],
  assassin: [
    { skillId: 'exposeWeakness', name: 'Expose Weakness', level: 1, unlocked: true },
    { skillId: 'markForDeath', name: 'Mark for Death', level: 1, unlocked: true },
    { skillId: 'execute', name: 'Execute', level: 1, unlocked: true },
    { skillId: 'assassination', name: 'Assassination', level: 1, unlocked: true }
  ],
  phantom: [
    { skillId: 'haunt', name: 'Haunt', level: 1, unlocked: true },
    { skillId: 'nightmare', name: 'Nightmare', level: 1, unlocked: true },
    { skillId: 'soulDrain', name: 'Soul Drain', level: 1, unlocked: true },
    { skillId: 'dread', name: 'Dread', level: 1, unlocked: true }
  ],
  bloodreaper: [
    { skillId: 'bloodlet', name: 'Bloodlet', level: 1, unlocked: true },
    { skillId: 'sanguineBlade', name: 'Sanguine Blade', level: 1, unlocked: true },
    { skillId: 'crimsonSlash', name: 'Crimson Slash', level: 1, unlocked: true },
    { skillId: 'exsanguinate', name: 'Exsanguinate', level: 1, unlocked: true }
  ],
  stormRanger: [
    { skillId: 'lightningArrow', name: 'Lightning Arrow', level: 1, unlocked: true },
    { skillId: 'chainLightning', name: 'Chain Lightning', level: 1, unlocked: true },
    { skillId: 'stormEye', name: 'Storm Eye', level: 1, unlocked: true },
    { skillId: 'thunderstorm', name: 'Thunderstorm', level: 1, unlocked: true }
  ],
  pyroArcher: [
    { skillId: 'fireArrow', name: 'Fire Arrow', level: 1, unlocked: true },
    { skillId: 'explosiveShot', name: 'Explosive Shot', level: 1, unlocked: true },
    { skillId: 'ignite', name: 'Ignite', level: 1, unlocked: true },
    { skillId: 'meteorArrow', name: 'Meteor Arrow', level: 1, unlocked: true }
  ],
  frostSniper: [
    { skillId: 'iceArrow', name: 'Ice Arrow', level: 1, unlocked: true },
    { skillId: 'frozenAim', name: 'Frozen Aim', level: 1, unlocked: true },
    { skillId: 'piercingCold', name: 'Piercing Cold', level: 1, unlocked: true },
    { skillId: 'absoluteShot', name: 'Absolute Shot', level: 1, unlocked: true }
  ],
  natureWarden: [
    { skillId: 'thornArrow', name: 'Thorn Arrow', level: 1, unlocked: true },
    { skillId: 'naturesGift', name: 'Nature\'s Gift', level: 1, unlocked: true },
    { skillId: 'vineTrap', name: 'Vine Trap', level: 1, unlocked: true },
    { skillId: 'overgrowth', name: 'Overgrowth', level: 1, unlocked: true }
  ],
  voidHunter: [
    { skillId: 'voidArrow', name: 'Void Arrow', level: 1, unlocked: true },
    { skillId: 'nullZone', name: 'Null Zone', level: 1, unlocked: true },
    { skillId: 'darkVolley', name: 'Dark Volley', level: 1, unlocked: true },
    { skillId: 'oblivion', name: 'Oblivion', level: 1, unlocked: true }
  ],
  frostWeaver: [
    { skillId: 'frostBolt', name: 'Frost Bolt', level: 1, unlocked: true },
    { skillId: 'blizzard', name: 'Blizzard', level: 1, unlocked: true },
    { skillId: 'iceArmor', name: 'Ice Armor', level: 1, unlocked: true },
    { skillId: 'absoluteZero', name: 'Absolute Zero', level: 1, unlocked: true }
  ],
  pyromancer: [
    { skillId: 'flameBurst', name: 'Flame Burst', level: 1, unlocked: true },
    { skillId: 'combustion', name: 'Combustion', level: 1, unlocked: true },
    { skillId: 'inferno', name: 'Inferno', level: 1, unlocked: true },
    { skillId: 'hellfire', name: 'Hellfire', level: 1, unlocked: true }
  ],
  stormcaller: [
    { skillId: 'shock', name: 'Shock', level: 1, unlocked: true },
    { skillId: 'lightningBolt', name: 'Lightning Bolt', level: 1, unlocked: true },
    { skillId: 'thunderChain', name: 'Thunder Chain', level: 1, unlocked: true },
    { skillId: 'tempest', name: 'Tempest', level: 1, unlocked: true }
  ],
  necromancer: [
    { skillId: 'darkBolt', name: 'Dark Bolt', level: 1, unlocked: true },
    { skillId: 'drainLife', name: 'Drain Life', level: 1, unlocked: true },
    { skillId: 'summonSkeleton', name: 'Summon Skeleton', level: 1, unlocked: true },
    { skillId: 'deathPact', name: 'Death Pact', level: 1, unlocked: true }
  ],
  arcanist: [
    { skillId: 'arcaneBlast', name: 'Arcane Blast', level: 1, unlocked: true },
    { skillId: 'manaBarrier', name: 'Mana Barrier', level: 1, unlocked: true },
    { skillId: 'spellweave', name: 'Spellweave', level: 1, unlocked: true },
    { skillId: 'arcaneNova', name: 'Arcane Nova', level: 1, unlocked: true }
  ]
};

// ============================================================
// CHARACTER SCHEMA
// ============================================================

const characterSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, unique: true },
  baseClass: { 
    type: String, 
    required: true, 
    enum: ['swordsman', 'thief', 'archer', 'mage'] 
  },
  hiddenClass: { type: String, default: 'none' },
  hiddenClassUnlocked: { type: Boolean, default: false },
  element: { type: String, default: 'none' },
  level: { type: Number, default: 1 },
  experience: { type: Number, default: 0 },
  experienceToNextLevel: { type: Number, default: 100 },
  gold: { type: Number, default: 100 },
  
  // Core stats
  stats: {
    hp: { type: Number, default: 100 },
    maxHp: { type: Number, default: 100 },
    mp: { type: Number, default: 50 },
    maxMp: { type: Number, default: 50 },
    str: { type: Number, default: 10 },
    agi: { type: Number, default: 10 },
    dex: { type: Number, default: 10 },
    int: { type: Number, default: 10 },
    vit: { type: Number, default: 10 }
  },
  
  statPoints: { type: Number, default: 0 },
  
  // Equipment slots
  equipment: {
    head: {
      itemId: { type: String, default: null },
      name: { type: String, default: null },
      icon: { type: String, default: null },
      type: { type: String, default: null },
      subtype: { type: String, default: null },
      rarity: { type: String, default: null },
      stats: { type: mongoose.Schema.Types.Mixed, default: null },
      setId: { type: String, default: null },
      vipOnly: { type: Boolean, default: false },
      expirationType: { type: String, default: null },
      expirationDays: { type: Number, default: null },
      firstEquippedAt: { type: Date, default: null },
      expiresAt: { type: Date, default: null }
    },
    body: {
      itemId: { type: String, default: null },
      name: { type: String, default: null },
      icon: { type: String, default: null },
      type: { type: String, default: null },
      subtype: { type: String, default: null },
      rarity: { type: String, default: null },
      stats: { type: mongoose.Schema.Types.Mixed, default: null },
      setId: { type: String, default: null },
      vipOnly: { type: Boolean, default: false },
      expirationType: { type: String, default: null },
      expirationDays: { type: Number, default: null },
      firstEquippedAt: { type: Date, default: null },
      expiresAt: { type: Date, default: null }
    },
    leg: {
      itemId: { type: String, default: null },
      name: { type: String, default: null },
      icon: { type: String, default: null },
      type: { type: String, default: null },
      subtype: { type: String, default: null },
      rarity: { type: String, default: null },
      stats: { type: mongoose.Schema.Types.Mixed, default: null },
      setId: { type: String, default: null },
      vipOnly: { type: Boolean, default: false },
      expirationType: { type: String, default: null },
      expirationDays: { type: Number, default: null },
      firstEquippedAt: { type: Date, default: null },
      expiresAt: { type: Date, default: null }
    },
    shoes: {
      itemId: { type: String, default: null },
      name: { type: String, default: null },
      icon: { type: String, default: null },
      type: { type: String, default: null },
      subtype: { type: String, default: null },
      rarity: { type: String, default: null },
      stats: { type: mongoose.Schema.Types.Mixed, default: null },
      setId: { type: String, default: null },
      vipOnly: { type: Boolean, default: false },
      expirationType: { type: String, default: null },
      expirationDays: { type: Number, default: null },
      firstEquippedAt: { type: Date, default: null },
      expiresAt: { type: Date, default: null }
    },
    leftHand: {
      itemId: { type: String, default: null },
      name: { type: String, default: null },
      icon: { type: String, default: null },
      type: { type: String, default: null },
      subtype: { type: String, default: null },
      rarity: { type: String, default: null },
      stats: { type: mongoose.Schema.Types.Mixed, default: null },
      setId: { type: String, default: null },
      vipOnly: { type: Boolean, default: false },
      expirationType: { type: String, default: null },
      expirationDays: { type: Number, default: null },
      firstEquippedAt: { type: Date, default: null },
      expiresAt: { type: Date, default: null }
    },
    rightHand: {
      itemId: { type: String, default: null },
      name: { type: String, default: null },
      icon: { type: String, default: null },
      type: { type: String, default: null },
      subtype: { type: String, default: null },
      rarity: { type: String, default: null },
      stats: { type: mongoose.Schema.Types.Mixed, default: null },
      setId: { type: String, default: null },
      vipOnly: { type: Boolean, default: false },
      expirationType: { type: String, default: null },
      expirationDays: { type: Number, default: null },
      firstEquippedAt: { type: Date, default: null },
      expiresAt: { type: Date, default: null }
    },
    ring: {
      itemId: { type: String, default: null },
      name: { type: String, default: null },
      icon: { type: String, default: null },
      type: { type: String, default: null },
      subtype: { type: String, default: null },
      rarity: { type: String, default: null },
      stats: { type: mongoose.Schema.Types.Mixed, default: null },
      setId: { type: String, default: null },
      vipOnly: { type: Boolean, default: false },
      expirationType: { type: String, default: null },
      expirationDays: { type: Number, default: null },
      firstEquippedAt: { type: Date, default: null },
      expiresAt: { type: Date, default: null }
    },
    necklace: {
      itemId: { type: String, default: null },
      name: { type: String, default: null },
      icon: { type: String, default: null },
      type: { type: String, default: null },
      subtype: { type: String, default: null },
      rarity: { type: String, default: null },
      stats: { type: mongoose.Schema.Types.Mixed, default: null },
      setId: { type: String, default: null },
      vipOnly: { type: Boolean, default: false },
      expirationType: { type: String, default: null },
      expirationDays: { type: Number, default: null },
      firstEquippedAt: { type: Date, default: null },
      expiresAt: { type: Date, default: null }
    }
  },
  
  // Inventory
  inventory: [{
    itemId: String,
    name: String,
    icon: String,
    type: String,
    subtype: String,
    slot: String,
    rarity: String,
    quantity: { type: Number, default: 1 },
    stackable: { type: Boolean, default: false },
    stats: mongoose.Schema.Types.Mixed,
    setId: String,
    levelReq: Number,
    classReq: String,
    // VIP fields
    vipOnly: { type: Boolean, default: false },
    expirationType: { type: String, default: null },
    expirationDays: { type: Number, default: null },
    firstEquippedAt: { type: Date, default: null },
    expiresAt: { type: Date, default: null }
  }],
  inventorySize: { type: Number, default: 30 },
  
  // Skills
  skills: [{
    skillId: String,
    name: String,
    level: { type: Number, default: 1 },
    unlocked: { type: Boolean, default: false }
  }],
  
  // Tower progress
  currentTower: { type: Number, default: 1 },
  currentFloor: { type: Number, default: 1 },
  highestFloor: { type: Number, default: 1 },
  towerProgress: {
    type: Map,
    of: Number,
    default: () => new Map([['1', 1]])
  },
  
  // Energy system
  energy: { type: Number, default: 100 },
  maxEnergy: { type: Number, default: 100 },
  lastEnergyUpdate: { type: Date, default: Date.now },
  
  // Statistics
  statistics: {
    monstersKilled: { type: Number, default: 0 },
    bossKills: { type: Number, default: 0 },
    totalDamageDealt: { type: Number, default: 0 },
    totalGoldEarned: { type: Number, default: 0 },
    totalExpEarned: { type: Number, default: 0 },
    floorsCleared: { type: Number, default: 0 },
    deathCount: { type: Number, default: 0 },
    itemsFound: { type: Number, default: 0 },
    questsCompleted: { type: Number, default: 0 }
  },
  
  // Phase 9.8: Social Features
  isOnline: { type: Boolean, default: false },
  lastOnline: { type: Date, default: Date.now },
  currentActivity: { type: String, default: 'idle' },
  
  // Helper points for co-op
  helperPoints: { type: Number, default: 100 },
  maxHelperPoints: { type: Number, default: 100 },
  
  // Titles
  titles: [{
    id: String,
    name: String,
    earnedAt: { type: Date, default: Date.now }
  }],
  activeTitle: { type: String, default: null },
  
  // Social stats
  socialStats: {
    helpGiven: { type: Number, default: 0 },
    helpReceived: { type: Number, default: 0 },
    coopBattles: { type: Number, default: 0 },
    raidParticipations: { type: Number, default: 0 }
  },
  
  // Phase 9.9.2: Raid Coins
  raidCoins: { type: Number, default: 0 },
  
  createdAt: { type: Date, default: Date.now },
  lastPlayed: { type: Date, default: Date.now }
});

// ============================================================
// PRE-SAVE HOOKS
// ============================================================

characterSchema.pre('save', function(next) {
  // Initialize class-based stats for new characters
  if (this.isNew && this.baseClass) {
    const baseStats = CLASS_BASE_STATS[this.baseClass];
    if (baseStats) {
      this.stats.hp = baseStats.hp;
      this.stats.maxHp = baseStats.hp;
      this.stats.mp = baseStats.mp;
      this.stats.maxMp = baseStats.mp;
      this.stats.str = baseStats.str;
      this.stats.agi = baseStats.agi;
      this.stats.dex = baseStats.dex;
      this.stats.int = baseStats.int;
      this.stats.vit = baseStats.vit;
    }
    
    // Initialize skills based on class
    this.skills = CLASS_DEFAULT_SKILLS[this.baseClass] || [];
  }
  
  next();
});

// ============================================================
// VIRTUAL: Derived stats
// ============================================================

characterSchema.virtual('derivedStats').get(function() {
  return this.constructor.calculateDerivedStats(this);
});

// ============================================================
// INSTANCE METHODS
// ============================================================

characterSchema.methods.checkLevelUp = function() {
  let levelsGained = 0;
  
  while (this.experience >= this.experienceToNextLevel && this.level < 200) {
    this.experience -= this.experienceToNextLevel;
    this.level += 1;
    this.statPoints += 5;
    this.experienceToNextLevel = Math.floor(100 * Math.pow(1.15, this.level - 1));
    levelsGained++;
    
    // Heal on level up
    this.stats.hp = this.stats.maxHp;
    this.stats.mp = this.stats.maxMp;
  }
  
  return levelsGained;
};

// ============================================================
// STATIC METHOD - Calculate derived stats
// PHASE 9.9.4: NOW SUPPORTS BOTH FLAT AND PERCENTAGE BONUSES!
// 
// Flat stats: pAtk, mAtk, pDef, mDef, hp, mp, str, agi, dex, int, vit
// Percent stats: pAtkPercent, mAtkPercent, pDefPercent, mDefPercent, hpPercent, mpPercent
// Special: expBonus, goldBonus
// ============================================================

characterSchema.statics.calculateDerivedStats = function(character) {
  const stats = character.stats || {};
  const equipment = character.equipment;
  
  // ============================================================
  // FLAT BONUSES (e.g., +15 P.DEF)
  // ============================================================
  let equipPAtk = 0, equipMAtk = 0, equipPDef = 0, equipMDef = 0;
  let equipStr = 0, equipAgi = 0, equipDex = 0, equipInt = 0, equipVit = 0;
  let equipCritRate = 0, equipCritDmg = 0, equipHp = 0, equipMp = 0;
  
  // ============================================================
  // PERCENTAGE BONUSES (e.g., +15% P.DEF) - NEW IN PHASE 9.9.4!
  // ============================================================
  let pAtkPercent = 0, mAtkPercent = 0, pDefPercent = 0, mDefPercent = 0;
  let hpPercent = 0, mpPercent = 0;
  let critRatePercent = 0, critDmgPercent = 0;
  let expBonus = 0, goldBonus = 0;
  
  // Collect equipped item IDs for set bonus calculation
  const equippedItemIds = [];
  const equippedSetIds = {};
  
  // Add equipment bonuses from all slots
  if (equipment) {
    const slots = ['head', 'body', 'leg', 'shoes', 'leftHand', 'rightHand', 'ring', 'necklace'];
    slots.forEach(slot => {
      const item = equipment[slot];
      if (item && item.itemId) {
        // Track equipped item IDs for set bonuses
        equippedItemIds.push(item.itemId);
        
        // Track set IDs
        if (item.setId) {
          equippedSetIds[item.setId] = (equippedSetIds[item.setId] || 0) + 1;
        }
        
        if (item.stats) {
          // ============================================================
          // FLAT BONUSES
          // ============================================================
          equipPAtk += item.stats.pAtk || 0;
          equipMAtk += item.stats.mAtk || 0;
          equipPDef += item.stats.pDef || 0;
          equipMDef += item.stats.mDef || 0;
          equipStr += item.stats.str || 0;
          equipAgi += item.stats.agi || 0;
          equipDex += item.stats.dex || 0;
          equipInt += item.stats.int || 0;
          equipVit += item.stats.vit || 0;
          equipCritRate += item.stats.critRate || 0;
          equipCritDmg += item.stats.critDmg || 0;
          equipHp += item.stats.hp || 0;
          equipMp += item.stats.mp || 0;
          
          // ============================================================
          // PERCENTAGE BONUSES (NEW IN PHASE 9.9.4!)
          // ============================================================
          pAtkPercent += item.stats.pAtkPercent || 0;
          mAtkPercent += item.stats.mAtkPercent || 0;
          pDefPercent += item.stats.pDefPercent || 0;
          mDefPercent += item.stats.mDefPercent || 0;
          hpPercent += item.stats.hpPercent || 0;
          mpPercent += item.stats.mpPercent || 0;
          critRatePercent += item.stats.critRatePercent || 0;
          critDmgPercent += item.stats.critDmgPercent || 0;
          
          // Special bonuses
          expBonus += item.stats.expBonus || 0;
          goldBonus += item.stats.goldBonus || 0;
        }
      }
    });
  }
  
  // ============================================================
  // PHASE 9.9.4: APPLY SET BONUSES (including percentage stats!)
  // ============================================================
  
  // DEBUG: Log equipped sets and available definitions
  console.log('[calculateDerivedStats] Equipped sets:', JSON.stringify(equippedSetIds));
  console.log('[calculateDerivedStats] SET_BONUS_DEFINITIONS available:', Object.keys(SET_BONUS_DEFINITIONS || {}));
  
  // Apply set bonuses based on piece count
  Object.entries(equippedSetIds).forEach(([setId, pieceCount]) => {
    console.log(`[calculateDerivedStats] Checking set: ${setId} with ${pieceCount} pieces`);
    
    const setBonus = SET_BONUS_DEFINITIONS[setId];
    if (setBonus) {
      console.log(`[calculateDerivedStats] Found set bonus definition for ${setId}:`, JSON.stringify(setBonus));
      
      // Check each threshold (2, 3, 4, 5, 6, 8 pieces)
      Object.keys(setBonus).forEach(threshold => {
        const thresholdNum = parseInt(threshold);
        console.log(`[calculateDerivedStats] Checking threshold ${thresholdNum}, pieceCount: ${pieceCount}, meets: ${pieceCount >= thresholdNum}`);
        
        if (pieceCount >= thresholdNum) {
          const bonus = setBonus[threshold];
          console.log(`[calculateDerivedStats] APPLYING ${threshold}-piece bonus:`, JSON.stringify(bonus));
          
          // Apply flat bonuses
          equipPAtk += bonus.pAtk || 0;
          equipMAtk += bonus.mAtk || 0;
          equipPDef += bonus.pDef || 0;
          equipMDef += bonus.mDef || 0;
          equipStr += bonus.str || 0;
          equipAgi += bonus.agi || 0;
          equipDex += bonus.dex || 0;
          equipInt += bonus.int || 0;
          equipVit += bonus.vit || 0;
          equipCritRate += bonus.critRate || 0;
          equipCritDmg += bonus.critDmg || 0;
          equipHp += bonus.hp || 0;
          equipMp += bonus.mp || 0;
          
          // Apply percentage bonuses from set
          pAtkPercent += bonus.pAtkPercent || 0;
          mAtkPercent += bonus.mAtkPercent || 0;
          pDefPercent += bonus.pDefPercent || 0;
          mDefPercent += bonus.mDefPercent || 0;
          hpPercent += bonus.hpPercent || 0;
          mpPercent += bonus.mpPercent || 0;
          critRatePercent += bonus.critRatePercent || 0;
          critDmgPercent += bonus.critDmgPercent || 0;
          
          // Special bonuses from set
          expBonus += bonus.expBonus || 0;
          goldBonus += bonus.goldBonus || 0;
        }
      });
    } else {
      console.log(`[calculateDerivedStats] WARNING: No bonus definition found for set: ${setId}`);
    }
  });
  
  // DEBUG: Log final percentage values
  console.log(`[calculateDerivedStats] Final pAtkPercent: ${pAtkPercent}, mAtkPercent: ${mAtkPercent}`);
  
  // Total base stats = character stats + flat equipment bonuses
  const totalStr = (stats.str || 0) + equipStr;
  const totalAgi = (stats.agi || 0) + equipAgi;
  const totalDex = (stats.dex || 0) + equipDex;
  const totalInt = (stats.int || 0) + equipInt;
  const totalVit = (stats.vit || 0) + equipVit;
  
  // ============================================================
  // BASE CALCULATIONS (before percentage multipliers)
  // ============================================================
  let basePDmg = 5 + (totalStr * 3) + equipPAtk;
  let baseMDmg = 5 + (totalInt * 4) + equipMAtk;
  let basePDef = totalStr + (totalVit * 2) + equipPDef;
  let baseMDef = totalVit + totalInt + equipMDef;
  let baseCritRate = 5 + (totalAgi * 0.5) + equipCritRate;
  let baseCritDmg = 150 + totalDex + equipCritDmg;
  
  // ============================================================
  // APPLY PERCENTAGE BONUSES
  // Formula: final = base * (1 + percent/100)
  // ============================================================
  const derived = {
    pDmg: Math.floor(basePDmg * (1 + pAtkPercent / 100)),
    mDmg: Math.floor(baseMDmg * (1 + mAtkPercent / 100)),
    pDef: Math.floor(basePDef * (1 + pDefPercent / 100)),
    mDef: Math.floor(baseMDef * (1 + mDefPercent / 100)),
    critRate: baseCritRate * (1 + critRatePercent / 100),
    critDmg: baseCritDmg * (1 + critDmgPercent / 100),
    accuracy: 90 + (totalDex * 0.5),
    evasion: totalAgi * 0.3,
    hpRegen: Math.floor(totalVit * 1),
    mpRegen: Math.floor(totalInt * 0.5),
    // HP/MP bonuses - flat + percentage of max
    bonusHp: Math.floor(equipHp + ((stats.maxHp || 100) * hpPercent / 100)),
    bonusMp: Math.floor(equipMp + ((stats.maxMp || 50) * mpPercent / 100)),
    // Special bonuses (for use in tower/combat)
    expBonus: expBonus,
    goldBonus: goldBonus,
    // Resistances
    fireRes: 0, waterRes: 0, lightningRes: 0, earthRes: 0,
    natureRes: 0, iceRes: 0, darkRes: 0, holyRes: 0,
    // Store active set info for display
    activeSets: equippedSetIds,
    // DEBUG: Store percentage values
    _debug: {
      pAtkPercent,
      mAtkPercent,
      pDefPercent,
      mDefPercent,
      hpPercent,
      mpPercent
    }
  };
  
  // Apply level bonus (+2% per level)
  const levelBonus = 1 + ((character.level || 1) - 1) * 0.02;
  derived.pDmg = Math.floor(derived.pDmg * levelBonus);
  derived.mDmg = Math.floor(derived.mDmg * levelBonus);
  
  // Cap certain stats
  derived.critRate = Math.min(derived.critRate, 80);
  derived.accuracy = Math.min(derived.accuracy, 100);
  derived.evasion = Math.min(derived.evasion, 60);
  
  return derived;
};

// ============================================================
// STATIC METHOD - Repair skills for existing characters
// ============================================================

characterSchema.statics.repairSkills = function(character) {
  const baseSkills = CLASS_DEFAULT_SKILLS[character.baseClass] || [];
  const existingSkillIds = (character.skills || []).map(s => s.skillId);
  
  baseSkills.forEach(skill => {
    if (!existingSkillIds.includes(skill.skillId)) {
      character.skills.push({ ...skill });
    }
  });
  
  if (character.hiddenClass && character.hiddenClass !== 'none') {
    const hiddenSkills = HIDDEN_CLASS_SKILLS[character.hiddenClass] || [];
    hiddenSkills.forEach(skill => {
      if (!existingSkillIds.includes(skill.skillId)) {
        character.skills.push({ ...skill });
      }
    });
  }
  
  return character;
};

// ============================================================
// STATIC METHOD - Repair stats for existing characters
// ============================================================

characterSchema.statics.repairStats = function(character) {
  const baseStats = CLASS_BASE_STATS[character.baseClass];
  if (!baseStats) return character;
  
  const isDefault = character.stats.str === 10 && 
                    character.stats.agi === 10 && 
                    character.stats.dex === 10 && 
                    character.stats.int === 10 && 
                    character.stats.vit === 10;
  
  if (isDefault) {
    character.stats = {
      hp: baseStats.hp,
      maxHp: baseStats.hp,
      mp: baseStats.mp,
      maxMp: baseStats.mp,
      str: baseStats.str,
      agi: baseStats.agi,
      dex: baseStats.dex,
      int: baseStats.int,
      vit: baseStats.vit
    };
    console.log(`Repaired stats for ${character.name} (${character.baseClass}):`, character.stats);
  }
  
  return character;
};

// ============================================================
// STATIC METHOD - Get skills for class combo
// ============================================================

characterSchema.statics.getSkillsForClass = function(baseClass, hiddenClass = 'none') {
  const skills = [...(CLASS_DEFAULT_SKILLS[baseClass] || [])];
  
  if (hiddenClass && hiddenClass !== 'none') {
    skills.push(...(HIDDEN_CLASS_SKILLS[hiddenClass] || []));
  }
  
  return skills;
};

// ============================================================
// PHASE 9.8: SOCIAL FEATURE METHODS
// ============================================================

characterSchema.methods.addHelperPoints = function(amount) {
  this.helperPoints = Math.min(this.maxHelperPoints, this.helperPoints + amount);
  return this.save();
};

characterSchema.methods.spendHelperPoints = function(amount) {
  if (this.helperPoints < amount) {
    throw new Error('Not enough Helper Points');
  }
  this.helperPoints -= amount;
  return this.save();
};

characterSchema.methods.updateOnlineStatus = function(isOnline, activity = 'idle') {
  this.isOnline = isOnline;
  this.lastOnline = new Date();
  this.currentActivity = activity;
  return this.save();
};

characterSchema.methods.addTitle = function(titleId, titleName) {
  if (!this.titles.find(t => t.id === titleId)) {
    this.titles.push({
      id: titleId,
      name: titleName,
      earnedAt: new Date()
    });
  }
  return this.save();
};

characterSchema.methods.getPublicProfile = function() {
  return {
    name: this.name,
    level: this.level,
    baseClass: this.baseClass,
    hiddenClass: this.hiddenClass,
    isOnline: this.isOnline,
    lastOnline: this.lastOnline,
    currentActivity: this.currentActivity,
    activeTitle: this.activeTitle,
    statistics: {
      bossKills: this.statistics.bossKills,
      floorsCleared: this.statistics.floorsCleared
    },
    socialStats: this.socialStats
  };
};

// ============================================================
// EXPORTS
// ============================================================

const Character = mongoose.model('Character', characterSchema);

export { 
  CLASS_BASE_STATS, 
  HIDDEN_CLASSES, 
  CLASS_DEFAULT_SKILLS, 
  HIDDEN_CLASS_SKILLS 
};

export default Character;
