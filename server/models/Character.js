import mongoose from 'mongoose';

// Base stats configuration for each class
const CLASS_BASE_STATS = {
  swordsman: { hp: 150, mp: 50, str: 15, agi: 8, dex: 8, int: 5, vit: 14 },
  thief: { hp: 100, mp: 70, str: 8, agi: 15, dex: 12, int: 7, vit: 8 },
  archer: { hp: 110, mp: 60, str: 10, agi: 12, dex: 15, int: 6, vit: 7 },
  mage: { hp: 80, mp: 120, str: 5, agi: 7, dex: 8, int: 15, vit: 5 }
};

// Hidden classes configuration
const HIDDEN_CLASSES = {
  flameblade: { baseClass: 'swordsman', tier: 'rare', element: 'fire' },
  shadowDancer: { baseClass: 'thief', tier: 'rare', element: 'dark' },
  stormRanger: { baseClass: 'archer', tier: 'rare', element: 'lightning' },
  frostWeaver: { baseClass: 'mage', tier: 'rare', element: 'ice' }
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

const equipmentSlotSchema = new mongoose.Schema({
  itemId: { type: String, default: null },
  name: { type: String, default: null },
  icon: { type: String, default: null },
  type: String,
  rarity: String,
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
  hiddenClass: {
    type: String,
    enum: ['none', 'flameblade', 'shadowDancer', 'stormRanger', 'frostWeaver'],
    default: 'none'
  },
  hiddenClassUnlocked: {
    type: Boolean,
    default: false
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
  // Per-tower progress tracking
  towerProgress: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  // Tower lockout (curse effect)
  towerLockoutUntil: {
    type: Date,
    default: null
  },
  
  // New Field - Add isInTower to track tower entry
  isInTower: { type: Boolean, default: false },
  
  // Skills
  skills: [skillSchema],
  
  // Inventory (max 50 slots for Phase 1)
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
    leftHand: equipmentSlotSchema,  // Main weapon
    rightHand: equipmentSlotSchema, // Offhand/Shield
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

// Helper functions (keep your current methods here)

export { CLASS_BASE_STATS, HIDDEN_CLASSES };
export default mongoose.model('Character', characterSchema);
