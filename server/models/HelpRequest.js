// ============================================================
// HELP REQUEST MODEL - Co-op Boss Help System
// ============================================================
// Phase 9.8: Social Features
// 
// Features:
// - Request help for boss floors
// - Friends can see and accept help requests
// - Helper uses full power, spends Helper Points (not energy)
// - Limit: 3 helps given per day
// - Async: Requester cannot enter tower while request is active
// ============================================================

import mongoose from 'mongoose';

const helpRequestSchema = new mongoose.Schema({
  // The user requesting help
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // The user's character (for reference)
  requesterCharacter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Character',
    required: true
  },
  
  // Tower and floor info
  towerId: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  
  floor: {
    type: Number,
    required: true,
    min: 1,
    max: 15
  },
  
  // Boss info (snapshot at time of request)
  bossInfo: {
    id: String,
    name: String,
    icon: String,
    hp: Number,
    maxHp: Number,
    atk: Number,
    def: Number
  },
  
  // Status of the help request
  status: {
    type: String,
    enum: ['pending', 'accepted', 'in_progress', 'completed', 'failed', 'cancelled', 'expired'],
    default: 'pending'
  },
  
  // The helper who accepted (null until accepted)
  helper: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  helperCharacter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Character',
    default: null
  },
  
  // Combat result (filled after completion)
  result: {
    victory: { type: Boolean, default: null },
    
    // Damage dealt by each participant
    requesterDamage: { type: Number, default: 0 },
    helperDamage: { type: Number, default: 0 },
    
    // Rewards
    requesterRewards: {
      exp: { type: Number, default: 0 },
      gold: { type: Number, default: 0 },
      items: { type: Array, default: [] }
    },
    helperRewards: {
      exp: { type: Number, default: 0 },
      gold: { type: Number, default: 0 },
      helperPoints: { type: Number, default: 0 }
    },
    
    // Combat log
    combatLog: { type: Array, default: [] }
  },
  
  // Helper points cost (default 1 per help)
  helperPointsCost: {
    type: Number,
    default: 1
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  acceptedAt: {
    type: Date,
    default: null
  },
  
  completedAt: {
    type: Date,
    default: null
  },
  
  // Auto-expire after 24 hours
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  }
}, {
  timestamps: true
});

// ============================================================
// INDEXES
// ============================================================

// Find active request for a user (only one allowed at a time)
helpRequestSchema.index({ requester: 1, status: 1 });

// Find requests available to help
helpRequestSchema.index({ status: 1, expiresAt: 1 });

// Find requests by helper
helpRequestSchema.index({ helper: 1, status: 1 });

// Auto-expire index
helpRequestSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// ============================================================
// CONSTANTS
// ============================================================

const DAILY_HELP_LIMIT = 3;
const HELPER_POINTS_REWARD = 10; // Points earned for helping
const HELPER_POINTS_COST = 1;    // Points spent to help

// ============================================================
// STATIC METHODS
// ============================================================

/**
 * Create a help request (only for boss floors: 5, 10, 15)
 */
helpRequestSchema.statics.createRequest = async function(userId, characterId, towerId, floor, bossInfo) {
  // Validate boss floor
  if (floor % 5 !== 0) {
    throw new Error('Help requests can only be created for boss floors (5, 10, 15)');
  }
  
  // Check if user already has an active request
  const existingRequest = await this.findOne({
    requester: userId,
    status: { $in: ['pending', 'accepted', 'in_progress'] }
  });
  
  if (existingRequest) {
    throw new Error('You already have an active help request');
  }
  
  return await this.create({
    requester: userId,
    requesterCharacter: characterId,
    towerId,
    floor,
    bossInfo,
    status: 'pending',
    helperPointsCost: HELPER_POINTS_COST
  });
};

/**
 * Cancel a help request (only requester can cancel)
 */
helpRequestSchema.statics.cancelRequest = async function(requestId, userId) {
  const request = await this.findById(requestId);
  
  if (!request) {
    throw new Error('Help request not found');
  }
  
  if (request.requester.toString() !== userId.toString()) {
    throw new Error('Not authorized to cancel this request');
  }
  
  if (!['pending', 'accepted'].includes(request.status)) {
    throw new Error('Cannot cancel request in current status');
  }
  
  request.status = 'cancelled';
  return await request.save();
};

/**
 * Accept a help request (must be friends, have helper points, not exceeded daily limit)
 */
helpRequestSchema.statics.acceptRequest = async function(requestId, helperId, helperCharacterId, Friendship, Character) {
  const request = await this.findById(requestId);
  
  if (!request) {
    throw new Error('Help request not found');
  }
  
  if (request.status !== 'pending') {
    throw new Error('Request is no longer available');
  }
  
  if (request.requester.toString() === helperId.toString()) {
    throw new Error('Cannot help yourself');
  }
  
  // Check if they are friends
  const areFriends = await Friendship.areFriends(request.requester, helperId);
  if (!areFriends) {
    throw new Error('You must be friends to help');
  }
  
  // Check helper's daily help count
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  
  const helpsToday = await this.countDocuments({
    helper: helperId,
    status: { $in: ['completed', 'in_progress'] },
    acceptedAt: { $gte: todayStart }
  });
  
  if (helpsToday >= DAILY_HELP_LIMIT) {
    throw new Error(`Daily help limit reached (${DAILY_HELP_LIMIT}/day)`);
  }
  
  // Check helper points
  const helperChar = await Character.findById(helperCharacterId);
  if (!helperChar) {
    throw new Error('Helper character not found');
  }
  
  if ((helperChar.helperPoints || 0) < request.helperPointsCost) {
    throw new Error(`Not enough Helper Points (need ${request.helperPointsCost})`);
  }
  
  // Deduct helper points
  helperChar.helperPoints = (helperChar.helperPoints || 0) - request.helperPointsCost;
  await helperChar.save();
  
  // Update request
  request.helper = helperId;
  request.helperCharacter = helperCharacterId;
  request.status = 'accepted';
  request.acceptedAt = new Date();
  
  return await request.save();
};

/**
 * Start the co-op combat
 */
helpRequestSchema.statics.startCombat = async function(requestId, userId) {
  const request = await this.findById(requestId);
  
  if (!request) {
    throw new Error('Help request not found');
  }
  
  // Either requester or helper can start
  const isParticipant = 
    request.requester.toString() === userId.toString() ||
    request.helper?.toString() === userId.toString();
  
  if (!isParticipant) {
    throw new Error('Not a participant in this request');
  }
  
  if (request.status !== 'accepted') {
    throw new Error('Request must be accepted before starting combat');
  }
  
  request.status = 'in_progress';
  return await request.save();
};

/**
 * Complete the help request (after combat)
 */
helpRequestSchema.statics.completeRequest = async function(requestId, victory, combatResult) {
  const request = await this.findById(requestId);
  
  if (!request) {
    throw new Error('Help request not found');
  }
  
  request.status = victory ? 'completed' : 'failed';
  request.completedAt = new Date();
  request.result = {
    victory,
    requesterDamage: combatResult.requesterDamage || 0,
    helperDamage: combatResult.helperDamage || 0,
    requesterRewards: combatResult.requesterRewards || {},
    helperRewards: {
      ...combatResult.helperRewards,
      helperPoints: victory ? HELPER_POINTS_REWARD : Math.floor(HELPER_POINTS_REWARD / 2)
    },
    combatLog: combatResult.combatLog || []
  };
  
  return await request.save();
};

/**
 * Get active request for a user (as requester)
 */
helpRequestSchema.statics.getActiveRequest = async function(userId) {
  return await this.findOne({
    requester: userId,
    status: { $in: ['pending', 'accepted', 'in_progress'] }
  }).populate('helper', 'username');
};

/**
 * Get requests available to help (from friends only)
 */
helpRequestSchema.statics.getAvailableRequests = async function(userId, Friendship) {
  // Get user's friends
  const friendships = await Friendship.getFriends(userId);
  const friendIds = friendships.map(f => 
    f.requester._id.toString() === userId.toString() ? f.recipient._id : f.requester._id
  );
  
  // Find pending requests from friends
  return await this.find({
    requester: { $in: friendIds },
    status: 'pending',
    expiresAt: { $gt: new Date() }
  }).populate('requester requesterCharacter', 'username name level baseClass hiddenClass');
};

/**
 * Get help history for a user
 */
helpRequestSchema.statics.getHelpHistory = async function(userId, limit = 20) {
  return await this.find({
    $or: [
      { requester: userId },
      { helper: userId }
    ],
    status: { $in: ['completed', 'failed'] }
  })
  .sort({ completedAt: -1 })
  .limit(limit)
  .populate('requester helper', 'username');
};

/**
 * Get today's help count for a user (as helper)
 */
helpRequestSchema.statics.getTodayHelpCount = async function(userId) {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  
  return await this.countDocuments({
    helper: userId,
    status: { $in: ['completed', 'in_progress', 'accepted'] },
    acceptedAt: { $gte: todayStart }
  });
};

/**
 * Check if user can enter tower (no active request)
 */
helpRequestSchema.statics.canEnterTower = async function(userId) {
  const activeRequest = await this.findOne({
    requester: userId,
    status: { $in: ['pending', 'accepted', 'in_progress'] }
  });
  
  return !activeRequest;
};

// Export constants for use elsewhere
helpRequestSchema.statics.DAILY_HELP_LIMIT = DAILY_HELP_LIMIT;
helpRequestSchema.statics.HELPER_POINTS_REWARD = HELPER_POINTS_REWARD;
helpRequestSchema.statics.HELPER_POINTS_COST = HELPER_POINTS_COST;

const HelpRequest = mongoose.model('HelpRequest', helpRequestSchema);

export default HelpRequest;
