import mongoose from 'mongoose';

// ============================================================
// FLOOR MAP MODEL - Node-based exploration system
// ============================================================

const nodeSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['start', 'combat', 'elite', 'boss', 'treasure', 'rest', 'mystery', 'merchant', 'shrine'],
    required: true 
  },
  row: { type: Number, required: true },
  col: { type: Number, required: true },
  connections: [String],
  visited: { type: Boolean, default: false },
  cleared: { type: Boolean, default: false },
  enemies: [{
    id: String,
    instanceId: String,
    name: String,
    icon: String,
    hp: Number,
    maxHp: Number,
    atk: Number,
    def: Number,
    expReward: Number,
    goldReward: {
      min: Number,
      max: Number
    },
    isElite: Boolean,
    isBoss: Boolean
  }],
  waves: { type: Number, default: 1 },
  currentWave: { type: Number, default: 0 },
  rewards: {
    gold: Number,
    exp: Number,
    items: mongoose.Schema.Types.Mixed,
    healPercent: Number,
    buffType: String
  },
  scenario: {
    id: String,
    description: String,
    choices: [String],
    resolved: Boolean
  }
}, { _id: false });

const floorMapSchema = new mongoose.Schema({
  characterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Character', required: true },
  towerId: { type: Number, required: true },
  floor: { type: Number, required: true },
  nodes: [nodeSchema],
  currentNodeId: { type: String, default: null },
  startNodeId: { type: String },
  bossNodeId: { type: String },
  completed: { type: Boolean, default: false },
  // Combat state - use Mixed type to avoid schema validation issues
  activeCombat: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) }
});

// Indexes
floorMapSchema.index({ characterId: 1, towerId: 1, floor: 1 });
floorMapSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('FloorMap', floorMapSchema);
