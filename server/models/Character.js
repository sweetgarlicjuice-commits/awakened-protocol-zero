import mongoose from 'mongoose';
import { SET_BONUS_DEFINITIONS } from '../data/setBonuses.js';

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
    { skillId: 'lifeDrain', name: 'Life Drain', level: 1, unlocked: true },
    { skillId: 'curse', name: 'Curse', level: 1, unlocked: true },
    { skillId: 'soulRend', name: 'Soul Rend', level: 1, unlocked: true },
    { skillId: 'deathPact', name: 'Death Pact', level: 1, unlocked: true }
  ],
  arcanist: [
    { skillId: 'arcaneMissile', name: 'Arcane Missile', level: 1, unlocked: true },
    { skillId: 'empower', name: 'Empower', level: 1, unlocked: true },
    { skillId: 'arcaneBurst', name: 'Arcane Burst', level: 1, unlocked: true },
    { skillId: 'transcendence', name: 'Transcendence', level: 1, unlocked: true }
  ]
};

// ============================================================
// SCHEMAS
// ============================================================

const skillSchema = new mongoose.Schema({
  skillId: String,
  name: String,
  level: { type: Number, default: 1 },
  unlocked: { type: Boolean, default: true }
});

// PHASE 9.3 FIX: Added setId for set bonus tracking
// PHASE 9.9.4: Added VIP expiration fields
const inventoryItemSchema = new mongoose.Schema({
  itemId: String,
  name: String,
  icon: { type: String, default: '📦' },
  type: String,
  subtype: String,
  rarity: { type: String, enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'], default: 'common' },
  quantity: { type: Number, default: 1 },
  stackable: { type: Boolean, default: true },
  stats: mongoose.Schema.Types.Mixed,
  sellPrice: { type: Number, default: 5 },
  setId: { type: String, default: null },
  // PHASE 9.9.4: VIP Item Expiration Fields
  vipOnly: { type: Boolean, default: false },
  expirationType: { type: String, default: null }, // 'on_first_equip' or 'on_grant'
  expirationDays: { type: Number, default: null },
  firstEquippedAt: { type: Date, default: null },
  expiresAt: { type: Date, default: null }
});

// PHASE 9.3 FIX: Added setId for set bonus tracking
// PHASE 9.3.1 FIX: Added subtype for proper re-equip after unequip
// PHASE 9.9.4: Added VIP expiration fields
const equipmentSlotSchema = new mongoose.Schema({
  itemId: { type: String, default: null },
  name: { type: String, default: null },
  icon: { type: String, default: null },
  type: String,
  subtype: { type: String, default: null },
  rarity: String,
  stats: mongoose.Schema.Types.Mixed,
  setId: { type: String, default: null },
  // PHASE 9.9.4: VIP Item Expiration Fields
  vipOnly: { type: Boolean, default: false },
  expirationType: { type: String, default: null },
  expirationDays: { type: Number, default: null },
  firstEquippedAt: { type: Date, default: null },
  expiresAt: { type: Date, default: null }
});

// Active buff schema for combat
const activeBuffSchema = new mongoose.Schema({
  id: String,
  name: String,
  icon: String,
  color: String,
  type: { type: String, enum: ['buff', 'debuff', 'dot', 'control'] },
  category: String,
  value: Number,
  duration: Number,
  damagePerTurn: Number,
  source: String,
  stacks: { type: Number, default: 1 }
});

// ============================================================
// MAIN CHARACTER SCHEMA
// FIX #2 & #3: Remove default stats - they will be set in pre-save based on class
// ============================================================

const characterSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 20,
    trim: true
  },
  
  // Class System
  baseClass: {
    type: String,
    enum: ['swordsman', 'thief', 'archer', 'mage'],
    required: true
  },
  hiddenClass: {
    type: String,
    enum: ['none', 
      // Swordsman
      'flameblade', 'berserker', 'paladin', 'earthshaker', 'frostguard',
      // Thief  
      'shadowDancer', 'venomancer', 'assassin', 'phantom', 'bloodreaper',
      // Archer
      'stormRanger', 'pyroArcher', 'frostSniper', 'natureWarden', 'voidHunter',
      // Mage
      'frostWeaver', 'pyromancer', 'stormcaller', 'necromancer', 'arcanist'
    ],
    default: 'none'
  },
  hiddenClassUnlocked: {
    type: Boolean,
    default: false
  },
  
  // Element (derived from hidden class)
  element: {
    type: String,
    enum: ['none', 'fire', 'water', 'lightning', 'earth', 'nature', 'ice', 'dark', 'holy'],
    default: 'none'
  },
  
  // Level & Experience
  level: {
    type: Number,
    default: 1,
    min: 1,
    max: 200
  },
  experience: {
    type: Number,
    default: 0
  },
  experienceToNextLevel: {
    type: Number,
    default: 100
  },
  
  // FIX #2 & #3: Base Stats - NO DEFAULTS! Set by pre-save hook based on class
  stats: {
    hp: { type: Number },
    maxHp: { type: Number },
    mp: { type: Number },
    maxMp: { type: Number },
    str: { type: Number },
    agi: { type: Number },
    dex: { type: Number },
    int: { type: Number },
    vit: { type: Number }
  },
  
  // Derived Stats (calculated from base + equipment)
  // PHASE 9.9.4: Added expBonus and goldBonus
  derivedStats: {
    pDmg: { type: Number, default: 0 },
    mDmg: { type: Number, default: 0 },
    pDef: { type: Number, default: 0 },
    mDef: { type: Number, default: 0 },
    critRate: { type: Number, default: 5 },
    critDmg: { type: Number, default: 150 },
    accuracy: { type: Number, default: 90 },
    evasion: { type: Number, default: 0 },
    hpRegen: { type: Number, default: 0 },
    mpRegen: { type: Number, default: 0 },
    bonusHp: { type: Number, default: 0 },
    bonusMp: { type: Number, default: 0 },
    expBonus: { type: Number, default: 0 },   // PHASE 9.9.4: +X% EXP
    goldBonus: { type: Number, default: 0 },  // PHASE 9.9.4: +X% Gold
    fireRes: { type: Number, default: 0 },
    waterRes: { type: Number, default: 0 },
    lightningRes: { type: Number, default: 0 },
    earthRes: { type: Number, default: 0 },
    natureRes: { type: Number, default: 0 },
    iceRes: { type: Number, default: 0 },
    darkRes: { type: Number, default: 0 },
    holyRes: { type: Number, default: 0 }
  },
  
  // Stat points from leveling
  statPoints: {
    type: Number,
    default: 0
  },
  
  // Energy System
  energy: {
    type: Number,
    default: 100,
    min: 0,
    max: 100
  },
  lastEnergyUpdate: {
    type: Date,
    default: Date.now
  },
  
  // PHASE 9.5: Track last HP/MP regen separately
  lastRegenUpdate: {
    type: Date,
    default: Date.now
  },
  
  // Gold
  gold: {
    type: Number,
    default: 100
  },
  
  // Tower Progress
  currentTower: {
    type: Number,
    default: 1
  },
  currentFloor: {
    type: Number,
    default: 1
  },
  highestTowerCleared: {
    type: Number,
    default: 0
  },
  highestFloorReached: {
    tower: { type: Number, default: 1 },
    floor: { type: Number, default: 1 }
  },
  towerProgress: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  isInTower: {
    type: Boolean,
    default: false
  },
  towerLockoutUntil: {
    type: Date,
    default: null
  },
  explorationProgress: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  
  // Combat state
  activeBuffs: [activeBuffSchema],
  
  // Skills
  skills: [skillSchema],
  
  // Inventory
  inventory: [inventoryItemSchema],
  inventorySize: {
    type: Number,
    default: 50
  },
  
  // Equipment - 8 slots
  equipment: {
    head: equipmentSlotSchema,
    body: equipmentSlotSchema,
    leg: equipmentSlotSchema,
    shoes: equipmentSlotSchema,
    leftHand: equipmentSlotSchema,
    rightHand: equipmentSlotSchema,
    ring: equipmentSlotSchema,
    necklace: equipmentSlotSchema
  },
  
  // Hidden Class Quest Progress
  hiddenClassQuest: {
    scrollObtained: { type: String, default: null },
    questStarted: { type: Boolean, default: false },
    questStep: { type: Number, default: 0 },
    killCount: { type: Number, default: 0 },
    itemFound: { type: Boolean, default: false },
    miniBossDefeated: { type: Boolean, default: false },
    completed: { type: Boolean, default: false }
  },
  
  // Special Items
  memoryCrystals: {
    type: Number,
    default: 0
  },
  
  // ============================================================
  // PHASE 9.9.2: RAID COINS - Earned from Dungeon Break events
  // ============================================================
  raidCoins: {
    lv5: { type: Number, default: 0 },
    lv10: { type: Number, default: 0 },
    lv20: { type: Number, default: 0 },
    lv30: { type: Number, default: 0 },
    lv40: { type: Number, default: 0 }
  },
  
  // Statistics
  statistics: {
    totalKills: { type: Number, default: 0 },
    bossKills: { type: Number, default: 0 },
    eliteKills: { type: Number, default: 0 },
    deaths: { type: Number, default: 0 },
    totalDamageDealt: { type: Number, default: 0 },
    totalGoldEarned: { type: Number, default: 0 },
    scrollsFound: { type: Number, default: 0 },
    floorsCleared: { type: Number, default: 0 }
  },
  
  // ============================================================
  // PHASE 9.8: SOCIAL FEATURES
  // ============================================================
  
  helperPoints: {
    type: Number,
    default: 10,
    min: 0
  },
  
  maxHelperPoints: {
    type: Number,
    default: 30
  },
  
  lastOnline: {
    type: Date,
    default: Date.now
  },
  
  isOnline: {
    type: Boolean,
    default: false
  },
  
  currentActivity: {
    type: String,
    enum: ['idle', 'in_tower', 'in_combat', 'in_dungeon_break', 'helping_friend'],
    default: 'idle'
  },
  
  socialStats: {
    helpsGiven: { type: Number, default: 0 },
    helpsReceived: { type: Number, default: 0 },
    dungeonBreaksParticipated: { type: Number, default: 0 },
    totalDungeonDamage: { type: Number, default: 0 }
  },
  
  titles: [{
    id: String,
    name: String,
    earnedAt: Date
  }],
  
  activeTitle: {
    type: String,
    default: null
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastPlayed: {
    type: Date,
    default: Date.now
  }
});

// ============================================================
// PRE-SAVE MIDDLEWARE - Initialize stats and skills based on class
// ============================================================

characterSchema.pre('save', function(next) {
  // Initialize stats from CLASS_BASE_STATS if not set
  if (this.isNew || !this.stats || !this.stats.str) {
    const baseStats = CLASS_BASE_STATS[this.baseClass];
    if (baseStats) {
      this.stats = {
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
      console.log(`Initialized stats for ${this.baseClass}:`, this.stats);
    }
  }
  
  // Initialize base class skills if empty
  if (!this.skills || this.skills.length === 0) {
    const baseSkills = CLASS_DEFAULT_SKILLS[this.baseClass] || [];
    this.skills = [...baseSkills];
  }
  
  // Add hidden class skills if they have one and don't have them yet
  if (this.hiddenClass && this.hiddenClass !== 'none') {
    const hiddenSkills = HIDDEN_CLASS_SKILLS[this.hiddenClass] || [];
    const existingSkillIds = this.skills.map(s => s.skillId);
    
    hiddenSkills.forEach(skill => {
      if (!existingSkillIds.includes(skill.skillId)) {
        this.skills.push(skill);
      }
    });
    
    // Set element from hidden class
    const hiddenClassInfo = HIDDEN_CLASSES[this.hiddenClass];
    if (hiddenClassInfo) {
      this.element = hiddenClassInfo.element;
    }
  }
  
  // Calculate and update derived stats
  this.derivedStats = Character.calculateDerivedStats(this);
  
  next();
});

// ============================================================
// PHASE 9.5: METHOD - Update energy AND HP/MP based on time passed
// ============================================================

characterSchema.methods.updateEnergy = function() {
  const now = new Date();
  
  // ===== ENERGY REGEN (always happens) =====
  const lastEnergyUpdate = this.lastEnergyUpdate || now;
  const energyHoursPassed = (now - lastEnergyUpdate) / (1000 * 60 * 60);
  const energyGain = Math.floor(energyHoursPassed * 25);
  
  if (energyGain > 0) {
    this.energy = Math.min(100, this.energy + energyGain);
    this.lastEnergyUpdate = now;
  }
  
  // ===== HP/MP REGEN (only when NOT in tower) =====
  if (!this.isInTower) {
    const lastRegenUpdate = this.lastRegenUpdate || now;
    const regenHoursPassed = (now - lastRegenUpdate) / (1000 * 60 * 60);
    
    if (regenHoursPassed >= 0.1) {
      const hpRegenRate = 0.05;
      const hpGain = Math.floor(this.stats.maxHp * hpRegenRate * regenHoursPassed);
      
      const mpRegenRate = 0.10;
      const mpGain = Math.floor(this.stats.maxMp * mpRegenRate * regenHoursPassed);
      
      if (hpGain > 0 || mpGain > 0) {
        this.stats.hp = Math.min(this.stats.maxHp, this.stats.hp + hpGain);
        this.stats.mp = Math.min(this.stats.maxMp, this.stats.mp + mpGain);
        this.lastRegenUpdate = now;
      }
    }
  }
  
  return {
    energy: this.energy,
    hp: this.stats.hp,
    mp: this.stats.mp
  };
};

// ============================================================
// METHOD - Check and process level up
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
      if (item) {
        // Track equipped item IDs for set bonuses
        if (item.itemId) {
          equippedItemIds.push(item.itemId);
        }
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
  // Set bonuses are imported from ../data/setBonuses.js which aggregates
  // all sets from towers, VIP, and dungeon break automatically!
  // ============================================================
  
  // Apply set bonuses based on piece count
  Object.entries(equippedSetIds).forEach(([setId, pieceCount]) => {
    const setBonus = SET_BONUS_DEFINITIONS[setId];
    if (setBonus) {
      // Check each threshold (2, 3, 4, 5, 6, 8 pieces)
      Object.keys(setBonus).forEach(threshold => {
        if (pieceCount >= parseInt(threshold)) {
          const bonus = setBonus[threshold];
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
    }
  });
  
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
    activeSets: equippedSetIds
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
