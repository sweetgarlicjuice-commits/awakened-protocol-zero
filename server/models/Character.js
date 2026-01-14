import mongoose from 'mongoose';

// Base stats configuration for each class
const CLASS_BASE_STATS = {
  swordsman: { hp: 150, mp: 50, str: 15, agi: 8, dex: 8, int: 5, vit: 14 },
  thief: { hp: 100, mp: 70, str: 8, agi: 15, dex: 12, int: 7, vit: 8 },
  archer: { hp: 110, mp: 60, str: 10, agi: 12, dex: 15, int: 6, vit: 7 },
  mage: { hp: 80, mp: 120, str: 5, agi: 7, dex: 8, int: 15, vit: 5 }
};

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
  
  // Level & Experience
  level: {
    type: Number,
    default: 1,
    min: 1,
    max: 50
  },
  experience: {
    type: Number,
    default: 0
  },
  experienceToNextLevel: {
    type: Number,
    default: 100
  },
  
  // Stats
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
  
  // Unallocated stat points
  statPoints: {
    type: Number,
    default: 0
  },
  
  // Currency
  gold: {
    type: Number,
    default: 100
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
  
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate EXP needed for next level
characterSchema.methods.calculateExpToLevel = function(level) {
  return Math.floor(100 * Math.pow(1.5, level - 1));
};

// Level up check (adjusting stat points to 3)
characterSchema.methods.levelUp = function() {
  let leveledUp = false;
  while (this.experience >= this.experienceToNextLevel && this.level < 50) {
    this.experience -= this.experienceToNextLevel;
    this.level += 1;
    this.statPoints += 3;  // Adjusting stat points to 3 per level-up
    this.experienceToNextLevel = this.calculateExpToLevel(this.level);
    leveledUp = true;
  }
  return leveledUp;
};

// Add GM stat adjustment functionality
characterSchema.methods.adjustStats = function(statName, value) {
  if (this.stats.hasOwnProperty(statName)) {
    this.stats[statName] = value;
  }
};

// Set initial stats based on class
characterSchema.pre('save', function(next) {
  if (this.isNew) {
    const baseStats = CLASS_BASE_STATS[this.baseClass];
    this.stats = {
      ...baseStats,
      maxHp: baseStats.hp,
      maxMp: baseStats.mp
    };
    
    // Initialize basic skills based on class
    const classSkills = getClassSkills(this.baseClass);
    this.skills = classSkills;
  }
  next();
});

// Helper function to get class skills
function getClassSkills(baseClass) {
  const skillSets = {
    swordsman: [
      { skillId: 'slash', name: 'Slash', level: 1, unlocked: true },
      { skillId: 'heavyStrike', name: 'Heavy Strike', level: 1, unlocked: true }
    ],
    thief: [
      { skillId: 'backstab', name: 'Backstab', level: 1, unlocked: true },
      { skillId: 'poisonBlade', name: 'Poison Blade', level: 1, unlocked: true }
    ],
    archer: [
      { skillId: 'preciseShot', name: 'Precise Shot', level: 1, unlocked: true },
      { skillId: 'multiShot', name: 'Multi Shot', level: 1, unlocked: true }
    ],
    mage: [
      { skillId: 'fireball', name: 'Fireball', level: 1, unlocked: true },
      { skillId: 'iceSpear', name: 'Ice Spear', level: 1, unlocked: true }
    ]
  };
  return skillSets[baseClass] || [];
}

export default mongoose.model('Character', characterSchema);
