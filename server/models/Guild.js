// ============================================================
// GUILD MODEL - Guild System (Future Implementation)
// ============================================================
// Phase 9.9+: Guild Features
// 
// Planned Features:
// - Create/disband guild
// - Guild master, officers, members
// - Guild name, icon, description
// - Guild level and perks
// - Guild announcements
// - Member management (invite, kick, promote)
// ============================================================

import mongoose from 'mongoose';

const guildMemberSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  characterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Character',
    required: true
  },
  
  role: {
    type: String,
    enum: ['master', 'officer', 'member'],
    default: 'member'
  },
  
  joinedAt: {
    type: Date,
    default: Date.now
  },
  
  // Contribution tracking
  contribution: {
    totalDamage: { type: Number, default: 0 },      // Dungeon break damage
    totalHelps: { type: Number, default: 0 },       // Co-op helps given
    weeklyActivity: { type: Number, default: 0 }    // Floors cleared this week
  },
  
  lastActive: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const guildSchema = new mongoose.Schema({
  // Basic info
  name: {
    type: String,
    required: true,
    unique: true,
    minlength: 3,
    maxlength: 20,
    trim: true
  },
  
  tag: {
    type: String,
    required: true,
    unique: true,
    minlength: 2,
    maxlength: 5,
    uppercase: true,
    trim: true
  },
  
  icon: {
    type: String,
    default: '🏰'
  },
  
  description: {
    type: String,
    maxlength: 200,
    default: ''
  },
  
  // Guild master (owner)
  masterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Members list
  members: [guildMemberSchema],
  
  // Guild settings
  settings: {
    isPublic: { type: Boolean, default: true },        // Can be found in search
    autoAccept: { type: Boolean, default: false },     // Auto-accept join requests
    minLevel: { type: Number, default: 1 },            // Minimum level to join
    maxMembers: { type: Number, default: 30 }          // Member cap
  },
  
  // Guild level and experience
  level: {
    type: Number,
    default: 1,
    min: 1,
    max: 10
  },
  
  experience: {
    type: Number,
    default: 0
  },
  
  experienceToNextLevel: {
    type: Number,
    default: 1000
  },
  
  // Guild perks (unlocked by level)
  perks: {
    expBonus: { type: Number, default: 0 },           // +X% EXP for members
    goldBonus: { type: Number, default: 0 },          // +X% Gold for members
    memberSlots: { type: Number, default: 0 },        // +X member slots
    storageSlots: { type: Number, default: 0 }        // Guild storage slots
  },
  
  // Guild statistics
  stats: {
    totalDungeonDamage: { type: Number, default: 0 },
    dungeonBossesKilled: { type: Number, default: 0 },
    totalHelpsGiven: { type: Number, default: 0 },
    floorsCleared: { type: Number, default: 0 }
  },
  
  // Announcements (latest 10)
  announcements: [{
    message: String,
    authorId: mongoose.Schema.Types.ObjectId,
    createdAt: { type: Date, default: Date.now }
  }],
  
  // Join requests (for non-public guilds)
  joinRequests: [{
    userId: mongoose.Schema.Types.ObjectId,
    characterId: mongoose.Schema.Types.ObjectId,
    message: String,
    requestedAt: { type: Date, default: Date.now }
  }],
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  disbandedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// ============================================================
// INDEXES
// ============================================================

guildSchema.index({ name: 1 });
guildSchema.index({ tag: 1 });
guildSchema.index({ masterId: 1 });
guildSchema.index({ 'members.userId': 1 });
guildSchema.index({ level: -1 }); // For leaderboards

// ============================================================
// GUILD LEVEL PERKS
// ============================================================

const GUILD_PERKS = {
  1: { expBonus: 0, goldBonus: 0, memberSlots: 0, storageSlots: 0 },
  2: { expBonus: 2, goldBonus: 2, memberSlots: 5, storageSlots: 10 },
  3: { expBonus: 4, goldBonus: 4, memberSlots: 10, storageSlots: 20 },
  4: { expBonus: 6, goldBonus: 6, memberSlots: 15, storageSlots: 30 },
  5: { expBonus: 8, goldBonus: 8, memberSlots: 20, storageSlots: 40 },
  6: { expBonus: 10, goldBonus: 10, memberSlots: 25, storageSlots: 50 },
  7: { expBonus: 12, goldBonus: 12, memberSlots: 30, storageSlots: 60 },
  8: { expBonus: 14, goldBonus: 14, memberSlots: 35, storageSlots: 70 },
  9: { expBonus: 16, goldBonus: 16, memberSlots: 40, storageSlots: 80 },
  10: { expBonus: 20, goldBonus: 20, memberSlots: 50, storageSlots: 100 }
};

const GUILD_EXP_REQUIREMENTS = {
  1: 0,
  2: 1000,
  3: 3000,
  4: 6000,
  5: 10000,
  6: 15000,
  7: 25000,
  8: 40000,
  9: 60000,
  10: 100000
};

// ============================================================
// STATIC METHODS
// ============================================================

/**
 * Create a new guild
 */
guildSchema.statics.createGuild = async function(userId, characterId, name, tag, icon = '🏰') {
  // Check if user is already in a guild
  const existingGuild = await this.findOne({ 'members.userId': userId });
  if (existingGuild) {
    throw new Error('You are already in a guild');
  }
  
  // Check if name or tag is taken
  const nameTaken = await this.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
  if (nameTaken) {
    throw new Error('Guild name is already taken');
  }
  
  const tagTaken = await this.findOne({ tag: tag.toUpperCase() });
  if (tagTaken) {
    throw new Error('Guild tag is already taken');
  }
  
  const guild = await this.create({
    name,
    tag: tag.toUpperCase(),
    icon,
    masterId: userId,
    members: [{
      userId,
      characterId,
      role: 'master',
      joinedAt: new Date()
    }]
  });
  
  return guild;
};

/**
 * Disband a guild (master only)
 */
guildSchema.statics.disbandGuild = async function(guildId, userId) {
  const guild = await this.findById(guildId);
  
  if (!guild) {
    throw new Error('Guild not found');
  }
  
  if (guild.masterId.toString() !== userId.toString()) {
    throw new Error('Only the guild master can disband the guild');
  }
  
  guild.disbandedAt = new Date();
  guild.members = [];
  return await guild.save();
};

/**
 * Join a guild
 */
guildSchema.statics.joinGuild = async function(guildId, userId, characterId, Character) {
  const guild = await this.findById(guildId);
  
  if (!guild) {
    throw new Error('Guild not found');
  }
  
  if (guild.disbandedAt) {
    throw new Error('Guild has been disbanded');
  }
  
  // Check if already in a guild
  const existingGuild = await this.findOne({ 'members.userId': userId });
  if (existingGuild) {
    throw new Error('You are already in a guild');
  }
  
  // Check member cap
  const maxMembers = guild.settings.maxMembers + (guild.perks.memberSlots || 0);
  if (guild.members.length >= maxMembers) {
    throw new Error('Guild is full');
  }
  
  // Check level requirement
  const character = await Character.findById(characterId);
  if (character.level < guild.settings.minLevel) {
    throw new Error(`Minimum level ${guild.settings.minLevel} required`);
  }
  
  // Add member
  guild.members.push({
    userId,
    characterId,
    role: 'member',
    joinedAt: new Date()
  });
  
  return await guild.save();
};

/**
 * Leave a guild
 */
guildSchema.statics.leaveGuild = async function(guildId, userId) {
  const guild = await this.findById(guildId);
  
  if (!guild) {
    throw new Error('Guild not found');
  }
  
  // Master cannot leave (must transfer or disband)
  if (guild.masterId.toString() === userId.toString()) {
    throw new Error('Guild master cannot leave. Transfer leadership or disband the guild.');
  }
  
  guild.members = guild.members.filter(m => m.userId.toString() !== userId.toString());
  return await guild.save();
};

/**
 * Kick a member (master/officer only)
 */
guildSchema.statics.kickMember = async function(guildId, kickerId, targetUserId) {
  const guild = await this.findById(guildId);
  
  if (!guild) {
    throw new Error('Guild not found');
  }
  
  const kicker = guild.members.find(m => m.userId.toString() === kickerId.toString());
  if (!kicker || !['master', 'officer'].includes(kicker.role)) {
    throw new Error('Not authorized to kick members');
  }
  
  const target = guild.members.find(m => m.userId.toString() === targetUserId.toString());
  if (!target) {
    throw new Error('Member not found in guild');
  }
  
  // Officers cannot kick other officers or master
  if (kicker.role === 'officer' && target.role !== 'member') {
    throw new Error('Officers can only kick regular members');
  }
  
  // Cannot kick yourself
  if (kickerId.toString() === targetUserId.toString()) {
    throw new Error('Cannot kick yourself');
  }
  
  guild.members = guild.members.filter(m => m.userId.toString() !== targetUserId.toString());
  return await guild.save();
};

/**
 * Promote/demote a member
 */
guildSchema.statics.setMemberRole = async function(guildId, masterId, targetUserId, newRole) {
  const guild = await this.findById(guildId);
  
  if (!guild) {
    throw new Error('Guild not found');
  }
  
  if (guild.masterId.toString() !== masterId.toString()) {
    throw new Error('Only the guild master can change roles');
  }
  
  const member = guild.members.find(m => m.userId.toString() === targetUserId.toString());
  if (!member) {
    throw new Error('Member not found in guild');
  }
  
  if (newRole === 'master') {
    // Transfer leadership
    const currentMaster = guild.members.find(m => m.role === 'master');
    if (currentMaster) {
      currentMaster.role = 'officer';
    }
    member.role = 'master';
    guild.masterId = targetUserId;
  } else {
    member.role = newRole;
  }
  
  return await guild.save();
};

/**
 * Add guild experience
 */
guildSchema.statics.addExperience = async function(guildId, amount) {
  const guild = await this.findById(guildId);
  
  if (!guild || guild.disbandedAt) {
    return null;
  }
  
  guild.experience += amount;
  
  // Check for level up
  while (guild.level < 10 && guild.experience >= GUILD_EXP_REQUIREMENTS[guild.level + 1]) {
    guild.level++;
    guild.perks = GUILD_PERKS[guild.level];
    guild.experienceToNextLevel = GUILD_EXP_REQUIREMENTS[guild.level + 1] || 0;
  }
  
  return await guild.save();
};

/**
 * Get guild by member
 */
guildSchema.statics.getByMember = async function(userId) {
  return await this.findOne({ 
    'members.userId': userId,
    disbandedAt: null
  });
};

/**
 * Search guilds
 */
guildSchema.statics.searchGuilds = async function(query, limit = 20) {
  return await this.find({
    disbandedAt: null,
    'settings.isPublic': true,
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { tag: { $regex: query, $options: 'i' } }
    ]
  })
  .select('name tag icon level members.length settings.minLevel')
  .limit(limit);
};

/**
 * Get guild leaderboard
 */
guildSchema.statics.getLeaderboard = async function(sortBy = 'level', limit = 50) {
  const sortOptions = {
    level: { level: -1, experience: -1 },
    damage: { 'stats.totalDungeonDamage': -1 },
    members: { 'members.length': -1 }
  };
  
  return await this.find({ disbandedAt: null })
    .sort(sortOptions[sortBy] || sortOptions.level)
    .limit(limit)
    .select('name tag icon level stats members');
};

// Export constants
guildSchema.statics.GUILD_PERKS = GUILD_PERKS;
guildSchema.statics.GUILD_EXP_REQUIREMENTS = GUILD_EXP_REQUIREMENTS;

const Guild = mongoose.model('Guild', guildSchema);

export default Guild;
