import mongoose from 'mongoose';

// ============================================================
// BASE STATS CONFIGURATION
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

const inventoryItemSchema = new mongoose.Schema({
  itemId: String,
  name: String,
  icon: { type: String, default: '📦' },
  type: String,
  subtype: String,
  rarity: { type: String, enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'], default: 'common' },
  quantity: { type: Number, default: 1 },
  stackable: { type: Boolean, default: true },
  stats: mongoose.Schema.Types.Mixed
});

const equipmentSlotSchema = new mongoose.Schema({
  itemId: { type: String, default: null },
  name: { type: String, default: null },
  icon: { type: String, default: null },
  type: String,
  rarity: String,
  stats: mongoose.Schema.Types.Mixed
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
  damagePerTurn: Number,  // For DoTs
  source: String,
  stacks: { type: Number, default: 1 }
});

// ============================================================
// MAIN CHARACTER SCHEMA
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
    max: 200  // Increased for 10 towers
  },
  experience: {
    type: Number,
    default: 0
  },
  experienceToNextLevel: {
    type: Number,
    default: 100
  },
  
  // Base Stats (allocated by player)
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
  
  // Derived Stats (calculated from base + equipment)
  derivedStats: {
    pDmg: { type: Number, default: 0 },     // Physical Damage
    mDmg: { type: Number, default: 0 },     // Magic Damage
    pDef: { type: Number, default: 0 },     // Physical Defense
    mDef: { type: Number, default: 0 },     // Magic Defense
    critRate: { type: Number, default: 5 }, // Critical Rate %
    critDmg: { type: Number, default: 150 },// Critical Damage %
    accuracy: { type: Number, default: 90 },// Hit Rate %
    evasion: { type: Number, default: 0 },  // Dodge %
    hpRegen: { type: Number, default: 0 },  // HP per turn
    mpRegen: { type: Number, default: 0 },  // MP per turn
    // Elemental Resistances
    fireRes: { type: Number, default: 0 },
    waterRes: { type: Number, default: 0 },
    lightningRes: { type: Number, default: 0 },
    earthRes: { type: Number, default: 0 },
    natureRes: { type: Number, default: 0 },
    iceRes: { type: Number, default: 0 },
    darkRes: { type: Number, default: 0 },
    holyRes: { type: Number, default: 0 }
  },
  
  // Active Buffs/Debuffs (for combat persistence)
  activeBuffs: [activeBuffSchema],
  
  // Unallocated stat points
  statPoints: {
    type: Number,
    default: 0
  },
  
  // Energy System
  energy: {
    type: Number,
    default: 100,
    max: 100
  },
  lastEnergyUpdate: {
    type: Date,
    default: Date.now
  },
  
  // Currency
  gold: {
    type: Number,
    default: 100
  },
  gems: {
    type: Number,
    default: 0
  },
  
  // Progress
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
    towerId: { type: Number, default: 1 },
    floor: { type: Number, default: 1 }
  },
  towerProgress: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  towerLockoutUntil: {
    type: Date,
    default: null
  },
  isInTower: { type: Boolean, default: false },
  
  // Exploration progress for multi-event system
  explorationProgress: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  
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
// PRE-SAVE MIDDLEWARE - Initialize skills if empty
// ============================================================

characterSchema.pre('save', function(next) {
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
  
  next();
});

// ============================================================
// STATIC METHOD - Calculate derived stats
// ============================================================

characterSchema.statics.calculateDerivedStats = function(character) {
  const stats = character.stats;
  const equipment = character.equipment;
  
  // Base formulas
  const derived = {
    pDmg: 5 + (stats.str * 3),
    mDmg: 5 + (stats.int * 4),
    pDef: (stats.str * 1) + (stats.vit * 2),
    mDef: (stats.vit * 1) + (stats.int * 1),
    critRate: 5 + (stats.agi * 0.5),
    critDmg: 150 + (stats.dex * 1),
    accuracy: 90 + (stats.dex * 0.5),
    evasion: (stats.agi * 0.3),
    hpRegen: Math.floor(stats.vit * 1),
    mpRegen: Math.floor(stats.int * 0.5),
    fireRes: 0, waterRes: 0, lightningRes: 0, earthRes: 0,
    natureRes: 0, iceRes: 0, darkRes: 0, holyRes: 0
  };
  
  // Add equipment bonuses
  if (equipment) {
    const slots = ['head', 'body', 'leg', 'shoes', 'leftHand', 'rightHand', 'ring', 'necklace'];
    slots.forEach(slot => {
      const item = equipment[slot];
      if (item && item.stats) {
        Object.keys(item.stats).forEach(stat => {
          if (derived[stat] !== undefined) {
            derived[stat] += item.stats[stat];
          }
        });
      }
    });
  }
  
  // Apply level bonus (+2% per level)
  const levelBonus = 1 + (character.level - 1) * 0.02;
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
  
  // Add missing base skills
  baseSkills.forEach(skill => {
    if (!existingSkillIds.includes(skill.skillId)) {
      character.skills.push({ ...skill });
    }
  });
  
  // Add hidden class skills if applicable
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
// EXPORTS
// ============================================================

export { 
  CLASS_BASE_STATS, 
  HIDDEN_CLASSES, 
  CLASS_DEFAULT_SKILLS, 
  HIDDEN_CLASS_SKILLS 
};

export default mongoose.model('Character', characterSchema);
