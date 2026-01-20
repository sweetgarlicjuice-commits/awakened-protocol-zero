// ============================================================
// DUNGEON BREAK MODEL - Limited Time Event System
// ============================================================
// Phase 9.9+: Dungeon Break Events
// Phase 9.9.1: Added boss combat stats & skills (boss counter-attacks!)
// 
// Features:
// - GM-triggered limited time events (e.g., 3 hours)
// - Massive boss with shared HP pool
// - All players contribute damage
// - Boss counter-attacks players! (NEW)
// - Rewards based on damage % contribution
// - Exclusive equipment sets from dungeon break bosses
// ============================================================

import mongoose from 'mongoose';

// ============================================================
// DUNGEON BREAK SCALING TIERS
// ============================================================
// GM selects tier based on active player count
// HP is multiplied by tier multiplier

const DUNGEON_BREAK_TIERS = {
  solo: {
    id: 'solo',
    name: 'Solo',
    description: '1-3 players',
    hpMultiplier: 1,        // Base HP
    rewardMultiplier: 0.5,  // 50% rewards
    minPlayers: 1,
    maxPlayers: 3
  },
  small: {
    id: 'small',
    name: 'Small Raid',
    description: '5-10 players',
    hpMultiplier: 5,        // 5x base HP
    rewardMultiplier: 0.75, // 75% rewards
    minPlayers: 5,
    maxPlayers: 10
  },
  medium: {
    id: 'medium',
    name: 'Medium Raid',
    description: '10-30 players',
    hpMultiplier: 15,       // 15x base HP
    rewardMultiplier: 1.0,  // 100% rewards
    minPlayers: 10,
    maxPlayers: 30
  },
  large: {
    id: 'large',
    name: 'Large Raid',
    description: '30-100 players',
    hpMultiplier: 50,       // 50x base HP
    rewardMultiplier: 1.25, // 125% rewards
    minPlayers: 30,
    maxPlayers: 100
  },
  massive: {
    id: 'massive',
    name: 'Server Event',
    description: '100+ players',
    hpMultiplier: 200,      // 200x base HP
    rewardMultiplier: 1.5,  // 150% rewards
    minPlayers: 100,
    maxPlayers: 9999
  }
};

// ============================================================
// DUNGEON BREAK BOSS DATA
// ============================================================
// Base HP values - multiply by tier for actual HP
// Phase 9.9.1: Added combat stats and skills for counter-attacks

const DUNGEON_BREAK_BOSSES = {
  1: {
    id: 'shadow_monarch_fragment',
    name: 'Shadow Monarch Fragment',
    icon: '👤',
    description: 'A fragment of the Shadow Monarch\'s power has escaped into our world.',
    levelReq: 5,
    baseHp: 5000,
    element: 'dark',
    // Combat stats for counter-attacks
    stats: {
      pDmg: 40,
      mDmg: 60,
      pDef: 15,
      mDef: 20,
      critRate: 10,
      critDmg: 150
    },
    // Boss skill
    skill: {
      name: 'Arise',
      icon: '💀',
      description: 'Summons shadow soldiers to attack',
      damageMultiplier: 1.8,  // 180% of normal attack
      chance: 20,             // 20% chance to use
      element: 'dark'
    },
    rewards: {
      setId: 'shadow_monarch_set',
      setLevel: 20,
      goldBase: 100,
      expBase: 50
    }
  },
  2: {
    id: 'demon_king_baran',
    name: 'Demon King Baran',
    icon: '👹',
    description: 'The Demon King has breached the gate. All hunters must respond!',
    levelReq: 10,
    baseHp: 15000,
    element: 'fire',
    stats: {
      pDmg: 70,
      mDmg: 90,
      pDef: 25,
      mDef: 30,
      critRate: 12,
      critDmg: 160
    },
    skill: {
      name: 'Hellfire Breath',
      icon: '🔥',
      description: 'Unleashes a devastating fire breath',
      damageMultiplier: 2.0,
      chance: 18,
      element: 'fire'
    },
    rewards: {
      setId: 'demon_king_set',
      setLevel: 30,
      goldBase: 200,
      expBase: 100
    }
  },
  3: {
    id: 'ice_dragon_kaisel',
    name: 'Ice Dragon Kaisel',
    icon: '🐉',
    description: 'An ancient ice dragon has awakened from its slumber.',
    levelReq: 20,
    baseHp: 50000,
    element: 'ice',
    stats: {
      pDmg: 100,
      mDmg: 140,
      pDef: 45,
      mDef: 55,
      critRate: 15,
      critDmg: 170
    },
    skill: {
      name: 'Absolute Zero',
      icon: '❄️',
      description: 'Freezes the air, dealing massive ice damage',
      damageMultiplier: 2.2,
      chance: 15,
      element: 'ice'
    },
    rewards: {
      setId: 'ice_dragon_set',
      setLevel: 40,
      goldBase: 400,
      expBase: 200
    }
  },
  4: {
    id: 'architect_of_chaos',
    name: 'Architect of Chaos',
    icon: '🏛️',
    description: 'The Architect who designed the dungeons has emerged.',
    levelReq: 30,
    baseHp: 150000,
    element: 'holy',
    stats: {
      pDmg: 150,
      mDmg: 200,
      pDef: 65,
      mDef: 80,
      critRate: 18,
      critDmg: 180
    },
    skill: {
      name: 'System Collapse',
      icon: '💫',
      description: 'Warps reality to crush all hunters',
      damageMultiplier: 2.5,
      chance: 12,
      element: 'holy'
    },
    rewards: {
      setId: 'architect_set',
      setLevel: 50,
      goldBase: 800,
      expBase: 400
    }
  },
  5: {
    id: 'absolute_being',
    name: 'The Absolute Being',
    icon: '✨',
    description: 'The creator of all. This is the ultimate challenge.',
    levelReq: 40,
    baseHp: 500000,
    element: 'none',
    stats: {
      pDmg: 250,
      mDmg: 350,
      pDef: 100,
      mDef: 120,
      critRate: 25,
      critDmg: 200
    },
    skill: {
      name: 'Divine Judgment',
      icon: '⚡',
      description: 'The ultimate attack that judges all existence',
      damageMultiplier: 3.0,
      chance: 10,
      element: 'holy'
    },
    rewards: {
      setId: 'absolute_being_set',
      setLevel: 60,
      goldBase: 1500,
      expBase: 750
    }
  }
};

// ============================================================
// PARTICIPANT SCHEMA (embedded)
// ============================================================

const participantSchema = new mongoose.Schema({
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
  
  characterName: String,
  characterLevel: Number,
  characterClass: String,
  
  // Damage tracking
  totalDamage: {
    type: Number,
    default: 0
  },
  
  // Attack count
  attackCount: {
    type: Number,
    default: 0
  },
  
  // Highest single hit
  highestHit: {
    type: Number,
    default: 0
  },
  
  // First attack time
  firstAttack: {
    type: Date,
    default: null
  },
  
  // Last attack time (used for cooldown)
  lastAttack: {
    type: Date,
    default: null
  },
  
  // Rewards claimed
  rewardsClaimed: {
    type: Boolean,
    default: false
  }
}, { _id: false });

// ============================================================
// DUNGEON BREAK EVENT SCHEMA
// ============================================================

const dungeonBreakSchema = new mongoose.Schema({
  // Boss info
  bossId: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  
  bossData: {
    id: String,
    name: String,
    icon: String,
    description: String,
    levelReq: Number,
    element: String,
    // Phase 9.9.1: Store boss combat stats
    stats: {
      pDmg: Number,
      mDmg: Number,
      pDef: Number,
      mDef: Number,
      critRate: Number,
      critDmg: Number
    },
    skill: {
      name: String,
      icon: String,
      description: String,
      damageMultiplier: Number,
      chance: Number,
      element: String
    }
  },
  
  // Tier selection (determines HP and rewards)
  tier: {
    type: String,
    enum: ['solo', 'small', 'medium', 'large', 'massive'],
    default: 'small',
    required: true
  },
  
  tierData: {
    name: String,
    description: String,
    hpMultiplier: Number,
    rewardMultiplier: Number
  },
  
  // HP tracking
  maxHp: {
    type: Number,
    required: true
  },
  
  currentHp: {
    type: Number,
    required: true
  },
  
  // Event status
  status: {
    type: String,
    enum: ['scheduled', 'active', 'completed', 'failed', 'cancelled'],
    default: 'scheduled'
  },
  
  // Timing
  scheduledStart: {
    type: Date,
    required: true
  },
  
  startedAt: {
    type: Date,
    default: null
  },
  
  duration: {
    type: Number,
    default: 3 * 60 * 60 * 1000  // 3 hours in milliseconds
  },
  
  endsAt: {
    type: Date,
    required: true
  },
  
  completedAt: {
    type: Date,
    default: null
  },
  
  // Participants
  participants: [participantSchema],
  
  // Statistics
  stats: {
    totalDamage: { type: Number, default: 0 },
    totalAttacks: { type: Number, default: 0 },
    uniqueParticipants: { type: Number, default: 0 },
    peakParticipants: { type: Number, default: 0 }
  },
  
  // GM who created the event
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Rewards configuration
  rewards: {
    setId: String,
    setLevel: Number,
    goldBase: Number,
    expBase: Number,
    guaranteedRewardTop: { type: Number, default: 3 }  // Top 3 get guaranteed drops
  }
  
}, { timestamps: true });

// ============================================================
// STATIC METHODS
// ============================================================

/**
 * Create a new Dungeon Break event
 */
dungeonBreakSchema.statics.createEvent = async function(gmUserId, bossId, tier = 'small', durationHours = 3, scheduledStart = null) {
  // Check for existing active event
  const existingActive = await this.findOne({ status: 'active' });
  if (existingActive) {
    throw new Error('There is already an active Dungeon Break event');
  }
  
  const boss = DUNGEON_BREAK_BOSSES[bossId];
  if (!boss) {
    throw new Error('Invalid boss ID');
  }
  
  const tierInfo = DUNGEON_BREAK_TIERS[tier];
  if (!tierInfo) {
    throw new Error('Invalid tier');
  }
  
  const calculatedHp = boss.baseHp * tierInfo.hpMultiplier;
  const durationMs = durationHours * 60 * 60 * 1000;
  const startTime = scheduledStart ? new Date(scheduledStart) : new Date();
  const endTime = new Date(startTime.getTime() + durationMs);
  
  // Apply tier reward multiplier
  const adjustedRewards = {
    setId: boss.rewards.setId,
    setLevel: boss.rewards.setLevel,
    goldBase: Math.floor(boss.rewards.goldBase * tierInfo.rewardMultiplier),
    expBase: Math.floor(boss.rewards.expBase * tierInfo.rewardMultiplier),
    guaranteedRewardTop: 3
  };
  
  return await this.create({
    bossId,
    bossData: {
      id: boss.id,
      name: boss.name,
      icon: boss.icon,
      description: boss.description,
      levelReq: boss.levelReq,
      element: boss.element,
      // Phase 9.9.1: Include combat stats
      stats: boss.stats,
      skill: boss.skill
    },
    tier,
    tierData: {
      name: tierInfo.name,
      description: tierInfo.description,
      hpMultiplier: tierInfo.hpMultiplier,
      rewardMultiplier: tierInfo.rewardMultiplier
    },
    maxHp: calculatedHp,
    currentHp: calculatedHp,
    status: scheduledStart ? 'scheduled' : 'active',
    scheduledStart: startTime,
    startedAt: scheduledStart ? null : startTime,
    duration: durationMs,
    endsAt: endTime,
    createdBy: gmUserId,
    rewards: adjustedRewards
  });
};

/**
 * Start a scheduled event
 */
dungeonBreakSchema.statics.startEvent = async function(eventId) {
  const event = await this.findById(eventId);
  
  if (!event) {
    throw new Error('Event not found');
  }
  
  if (event.status !== 'scheduled') {
    throw new Error('Event is not in scheduled status');
  }
  
  event.status = 'active';
  event.startedAt = new Date();
  event.endsAt = new Date(Date.now() + event.duration);
  
  return await event.save();
};

/**
 * Cancel an event (GM only)
 */
dungeonBreakSchema.statics.cancelEvent = async function(eventId, gmUserId) {
  const event = await this.findById(eventId);
  
  if (!event) {
    throw new Error('Event not found');
  }
  
  if (!['scheduled', 'active'].includes(event.status)) {
    throw new Error('Cannot cancel event in current status');
  }
  
  event.status = 'cancelled';
  event.completedAt = new Date();
  
  return await event.save();
};

/**
 * Phase 9.9.1: Calculate boss counter-attack damage
 */
dungeonBreakSchema.statics.calculateBossAttack = function(bossData, playerDerivedStats) {
  const bossStats = bossData.stats;
  const skill = bossData.skill;
  
  // Determine if boss uses skill
  const useSkill = Math.random() * 100 < skill.chance;
  
  // Base damage (mix of physical and magical)
  let baseDamage = bossStats.pDmg + bossStats.mDmg;
  
  // Apply skill multiplier if using skill
  if (useSkill) {
    baseDamage = Math.floor(baseDamage * skill.damageMultiplier);
  }
  
  // Add variance (90-110%)
  const variance = 0.9 + (Math.random() * 0.2);
  baseDamage = Math.floor(baseDamage * variance);
  
  // Check for crit
  const isCrit = Math.random() * 100 < bossStats.critRate;
  if (isCrit) {
    baseDamage = Math.floor(baseDamage * (bossStats.critDmg / 100));
  }
  
  // Apply player defense reduction (pDef + mDef average)
  const playerDefense = (playerDerivedStats.pDef + playerDerivedStats.mDef) / 2;
  const defenseReduction = playerDefense / (playerDefense + 100); // Diminishing returns
  const finalDamage = Math.max(1, Math.floor(baseDamage * (1 - defenseReduction)));
  
  return {
    damage: finalDamage,
    isCrit,
    usedSkill: useSkill,
    skillName: useSkill ? skill.name : null,
    skillIcon: useSkill ? skill.icon : null
  };
};

/**
 * Record damage from a player (Updated with counter-attack)
 */
dungeonBreakSchema.statics.recordDamage = async function(eventId, userId, characterId, characterInfo, damage) {
  const event = await this.findById(eventId);
  
  if (!event) {
    throw new Error('Event not found');
  }
  
  if (event.status !== 'active') {
    throw new Error('Event is not active');
  }
  
  if (new Date() > event.endsAt) {
    event.status = 'failed';
    await event.save();
    throw new Error('Event has ended');
  }
  
  // Check level requirement
  if (characterInfo.level < event.bossData.levelReq) {
    throw new Error(`Minimum level ${event.bossData.levelReq} required`);
  }
  
  // Find or create participant entry
  let participant = event.participants.find(p => p.userId.toString() === userId.toString());
  
  if (!participant) {
    participant = {
      userId,
      characterId,
      characterName: characterInfo.name,
      characterLevel: characterInfo.level,
      characterClass: characterInfo.hiddenClass || characterInfo.baseClass,
      totalDamage: 0,
      attackCount: 0,
      highestHit: 0,
      firstAttack: new Date(),
      lastAttack: new Date()
    };
    event.participants.push(participant);
    event.stats.uniqueParticipants++;
  }
  
  // Update participant stats
  const pIndex = event.participants.findIndex(p => p.userId.toString() === userId.toString());
  event.participants[pIndex].totalDamage += damage;
  event.participants[pIndex].attackCount++;
  event.participants[pIndex].highestHit = Math.max(event.participants[pIndex].highestHit, damage);
  event.participants[pIndex].lastAttack = new Date();
  
  // Update event stats
  event.stats.totalDamage += damage;
  event.stats.totalAttacks++;
  event.stats.peakParticipants = Math.max(event.stats.peakParticipants, event.participants.length);
  
  // Apply damage to boss
  event.currentHp = Math.max(0, event.currentHp - damage);
  
  // Check if boss is defeated
  if (event.currentHp <= 0) {
    event.status = 'completed';
    event.completedAt = new Date();
  }
  
  event.markModified('participants');
  event.markModified('stats');
  
  await event.save();
  
  return {
    damage,
    bossHp: event.currentHp,
    bossMaxHp: event.maxHp,
    bossDefeated: event.currentHp <= 0,
    yourTotalDamage: event.participants[pIndex].totalDamage,
    yourRank: this.getPlayerRank(event, userId)
  };
};

/**
 * Get player's rank in the event
 */
dungeonBreakSchema.statics.getPlayerRank = function(event, userId) {
  const sorted = [...event.participants].sort((a, b) => b.totalDamage - a.totalDamage);
  const index = sorted.findIndex(p => p.userId.toString() === userId.toString());
  return index >= 0 ? index + 1 : null;
};

/**
 * Get the current active event
 */
dungeonBreakSchema.statics.getActiveEvent = async function() {
  const event = await this.findOne({ status: 'active' });
  
  if (event && new Date() > event.endsAt) {
    // Event has expired, mark as failed
    event.status = 'failed';
    event.completedAt = new Date();
    await event.save();
    return null;
  }
  
  return event;
};

/**
 * Get event leaderboard
 */
dungeonBreakSchema.statics.getLeaderboard = async function(eventId, limit = 100) {
  const event = await this.findById(eventId);
  
  if (!event) {
    return [];
  }
  
  return [...event.participants]
    .sort((a, b) => b.totalDamage - a.totalDamage)
    .slice(0, limit)
    .map((p, index) => ({
      rank: index + 1,
      name: p.characterName,
      level: p.characterLevel,
      class: p.characterClass,
      damage: p.totalDamage,
      attacks: p.attackCount,
      damagePercent: ((p.totalDamage / event.stats.totalDamage) * 100).toFixed(2)
    }));
};

/**
 * Calculate rewards for a participant
 */
dungeonBreakSchema.statics.calculateRewards = async function(eventId, userId) {
  const event = await this.findById(eventId);
  
  if (!event) {
    throw new Error('Event not found');
  }
  
  if (event.status !== 'completed') {
    throw new Error('Event is not completed (boss not defeated)');
  }
  
  const participant = event.participants.find(p => p.userId.toString() === userId.toString());
  
  if (!participant) {
    throw new Error('You did not participate in this event');
  }
  
  if (participant.rewardsClaimed) {
    throw new Error('Rewards already claimed');
  }
  
  const rank = this.getPlayerRank(event, userId);
  const damagePercent = participant.totalDamage / event.stats.totalDamage;
  
  // Base rewards scaled by damage contribution
  const rewards = {
    gold: Math.floor(event.rewards.goldBase * damagePercent * 10), // 10x multiplier for participation
    exp: Math.floor(event.rewards.expBase * damagePercent * 10),
    items: []
  };
  
  // Guaranteed set piece for top players
  if (rank <= event.rewards.guaranteedRewardTop) {
    rewards.items.push({
      type: 'equipment',
      setId: event.rewards.setId,
      guaranteed: true
    });
  } else {
    // Chance-based reward for others (higher damage = higher chance)
    const dropChance = Math.min(0.5, damagePercent * 5); // Max 50% chance
    if (Math.random() < dropChance) {
      rewards.items.push({
        type: 'equipment',
        setId: event.rewards.setId,
        guaranteed: false
      });
    }
  }
  
  // Bonus rewards for high ranks
  if (rank === 1) {
    rewards.gold *= 3;
    rewards.exp *= 3;
    rewards.title = 'Dungeon Break Champion';
  } else if (rank <= 3) {
    rewards.gold *= 2;
    rewards.exp *= 2;
  } else if (rank <= 10) {
    rewards.gold = Math.floor(rewards.gold * 1.5);
    rewards.exp = Math.floor(rewards.exp * 1.5);
  }
  
  return {
    rank,
    damagePercent: (damagePercent * 100).toFixed(2),
    rewards
  };
};

/**
 * Claim rewards for a participant
 */
dungeonBreakSchema.statics.claimRewards = async function(eventId, userId) {
  const event = await this.findById(eventId);
  
  if (!event) {
    throw new Error('Event not found');
  }
  
  const pIndex = event.participants.findIndex(p => p.userId.toString() === userId.toString());
  
  if (pIndex === -1) {
    throw new Error('You did not participate in this event');
  }
  
  if (event.participants[pIndex].rewardsClaimed) {
    throw new Error('Rewards already claimed');
  }
  
  event.participants[pIndex].rewardsClaimed = true;
  event.markModified('participants');
  await event.save();
  
  return true;
};

/**
 * Get event history
 */
dungeonBreakSchema.statics.getHistory = async function(limit = 20) {
  return await this.find({
    status: { $in: ['completed', 'failed'] }
  })
  .sort({ completedAt: -1 })
  .limit(limit)
  .select('bossData status stats completedAt');
};

/**
 * Get player's participation history
 */
dungeonBreakSchema.statics.getPlayerHistory = async function(userId, limit = 10) {
  return await this.find({
    'participants.userId': userId,
    status: { $in: ['completed', 'failed'] }
  })
  .sort({ completedAt: -1 })
  .limit(limit);
};

// Export boss data and tiers for reference
dungeonBreakSchema.statics.BOSSES = DUNGEON_BREAK_BOSSES;
dungeonBreakSchema.statics.TIERS = DUNGEON_BREAK_TIERS;

const DungeonBreak = mongoose.model('DungeonBreak', dungeonBreakSchema);

export { DUNGEON_BREAK_BOSSES, DUNGEON_BREAK_TIERS };
export default DungeonBreak;
