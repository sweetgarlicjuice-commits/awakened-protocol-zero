// ============================================================
// DUNGEON BREAK MODEL - Limited Time Event System
// ============================================================
// Phase 9.9: Dungeon Break Events
// Phase 9.9.1: Added boss combat stats & skills (boss counter-attacks!)
// Phase 9.9.2: Raid Coins reward system (replaces direct set drops)
// 
// Features:
// - GM-triggered limited time events (e.g., 3 hours)
// - Massive boss with shared HP pool
// - All players contribute damage
// - Boss counter-attacks players!
// - Raid Coins based on damage leaderboard rank
// - Redeem coins for specific equipment pieces
// ============================================================

import mongoose from 'mongoose';

// ============================================================
// RAID COIN REWARDS BY RANK
// ============================================================
const RAID_COIN_REWARDS = {
  1: 20,      // Rank 1
  2: 15,      // Rank 2
  3: 10,      // Rank 3
  top10: 7,   // Rank 4-10
  top20: 5,   // Rank 11-20
  participant: 2  // Rank 21+
};

// ============================================================
// BOSS TO COIN LEVEL MAPPING
// ============================================================
const BOSS_COIN_LEVELS = {
  1: 'lv5',   // Shadow Monarch -> R-Coin Lv.5
  2: 'lv10',  // Demon King -> R-Coin Lv.10
  3: 'lv20',  // Ice Dragon -> R-Coin Lv.20
  4: 'lv30',  // Architect -> R-Coin Lv.30
  5: 'lv40'   // Absolute Being -> R-Coin Lv.40
};

// Coin level to set mapping (for redeem)
const COIN_TO_SET_MAP = {
  lv5: 'shadow_monarch_set',
  lv10: 'demon_king_set',
  lv20: 'ice_dragon_set',
  lv30: 'architect_set',
  lv40: 'absolute_being_set'
};

// ============================================================
// DUNGEON BREAK SCALING TIERS
// ============================================================
const DUNGEON_BREAK_TIERS = {
  solo: {
    id: 'solo',
    name: 'Solo',
    description: '1-3 players',
    hpMultiplier: 1,
    rewardMultiplier: 0.5,
    minPlayers: 1,
    maxPlayers: 3
  },
  small: {
    id: 'small',
    name: 'Small Raid',
    description: '5-10 players',
    hpMultiplier: 5,
    rewardMultiplier: 0.75,
    minPlayers: 5,
    maxPlayers: 10
  },
  medium: {
    id: 'medium',
    name: 'Medium Raid',
    description: '10-30 players',
    hpMultiplier: 15,
    rewardMultiplier: 1.0,
    minPlayers: 10,
    maxPlayers: 30
  },
  large: {
    id: 'large',
    name: 'Large Raid',
    description: '30-100 players',
    hpMultiplier: 50,
    rewardMultiplier: 1.25,
    minPlayers: 30,
    maxPlayers: 100
  },
  massive: {
    id: 'massive',
    name: 'Server Event',
    description: '100+ players',
    hpMultiplier: 200,
    rewardMultiplier: 1.5,
    minPlayers: 100,
    maxPlayers: 9999
  }
};

// ============================================================
// DUNGEON BREAK BOSS DATA
// ============================================================
const DUNGEON_BREAK_BOSSES = {
  1: {
    id: 'shadow_monarch_fragment',
    name: 'Shadow Monarch Fragment',
    icon: '👤',
    description: 'A fragment of the Shadow Monarch\'s power has escaped into our world.',
    levelReq: 5,
    baseHp: 5000,
    element: 'dark',
    coinLevel: 'lv5',  // Phase 9.9.2: Coin type this boss gives
    stats: {
      pDmg: 40,
      mDmg: 60,
      pDef: 15,
      mDef: 20,
      critRate: 10,
      critDmg: 150
    },
    skill: {
      name: 'Arise',
      icon: '💀',
      description: 'Summons shadow soldiers to attack',
      damageMultiplier: 1.8,
      chance: 20,
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
    coinLevel: 'lv10',
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
    coinLevel: 'lv20',
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
    coinLevel: 'lv30',
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
    coinLevel: 'lv40',
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
// PARTICIPANT SCHEMA
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
  totalDamage: { type: Number, default: 0 },
  attackCount: { type: Number, default: 0 },
  highestHit: { type: Number, default: 0 },
  firstAttack: { type: Date, default: null },
  lastAttack: { type: Date, default: null },
  rewardsClaimed: { type: Boolean, default: false },
  // Phase 9.9.2: Track coins earned
  coinsEarned: { type: Number, default: 0 }
}, { _id: false });

// ============================================================
// DUNGEON BREAK EVENT SCHEMA
// ============================================================
const dungeonBreakSchema = new mongoose.Schema({
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
    coinLevel: String,  // Phase 9.9.2: Which coin this boss gives
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
  
  maxHp: { type: Number, required: true },
  currentHp: { type: Number, required: true },
  
  status: {
    type: String,
    enum: ['scheduled', 'active', 'completed', 'failed', 'cancelled'],
    default: 'scheduled'
  },
  
  scheduledStart: { type: Date, required: true },
  startedAt: { type: Date, default: null },
  duration: { type: Number, default: 3 * 60 * 60 * 1000 },
  endsAt: { type: Date, required: true },
  completedAt: { type: Date, default: null },
  
  participants: [participantSchema],
  
  stats: {
    totalDamage: { type: Number, default: 0 },
    totalAttacks: { type: Number, default: 0 },
    uniqueParticipants: { type: Number, default: 0 },
    peakParticipants: { type: Number, default: 0 }
  },
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  rewards: {
    setId: String,
    setLevel: Number,
    goldBase: Number,
    expBase: Number,
    coinLevel: String  // Phase 9.9.2
  }
  
}, { timestamps: true });

// ============================================================
// STATIC METHODS
// ============================================================

/**
 * Phase 9.9.2: Calculate raid coins based on rank
 */
dungeonBreakSchema.statics.calculateRaidCoins = function(rank) {
  if (rank === 1) return RAID_COIN_REWARDS[1];
  if (rank === 2) return RAID_COIN_REWARDS[2];
  if (rank === 3) return RAID_COIN_REWARDS[3];
  if (rank >= 4 && rank <= 10) return RAID_COIN_REWARDS.top10;
  if (rank >= 11 && rank <= 20) return RAID_COIN_REWARDS.top20;
  return RAID_COIN_REWARDS.participant;
};

/**
 * Create a new Dungeon Break event
 */
dungeonBreakSchema.statics.createEvent = async function(gmUserId, bossId, tier = 'small', durationHours = 3, scheduledStart = null) {
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
  
  return await this.create({
    bossId,
    bossData: {
      id: boss.id,
      name: boss.name,
      icon: boss.icon,
      description: boss.description,
      levelReq: boss.levelReq,
      element: boss.element,
      coinLevel: boss.coinLevel,  // Phase 9.9.2
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
    rewards: {
      setId: boss.rewards.setId,
      setLevel: boss.rewards.setLevel,
      goldBase: Math.floor(boss.rewards.goldBase * tierInfo.rewardMultiplier),
      expBase: Math.floor(boss.rewards.expBase * tierInfo.rewardMultiplier),
      coinLevel: boss.coinLevel  // Phase 9.9.2
    }
  });
};

/**
 * Start a scheduled event
 */
dungeonBreakSchema.statics.startEvent = async function(eventId) {
  const event = await this.findById(eventId);
  
  if (!event) throw new Error('Event not found');
  if (event.status !== 'scheduled') throw new Error('Event is not in scheduled status');
  
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
  
  if (!event) throw new Error('Event not found');
  if (!['scheduled', 'active'].includes(event.status)) {
    throw new Error('Cannot cancel event in current status');
  }
  
  event.status = 'cancelled';
  event.completedAt = new Date();
  
  return await event.save();
};

/**
 * Calculate boss counter-attack damage
 */
dungeonBreakSchema.statics.calculateBossAttack = function(bossData, playerDerivedStats) {
  const bossStats = bossData.stats;
  const skill = bossData.skill;
  
  const useSkill = Math.random() * 100 < skill.chance;
  let baseDamage = bossStats.pDmg + bossStats.mDmg;
  
  if (useSkill) {
    baseDamage = Math.floor(baseDamage * skill.damageMultiplier);
  }
  
  const variance = 0.9 + (Math.random() * 0.2);
  baseDamage = Math.floor(baseDamage * variance);
  
  const isCrit = Math.random() * 100 < bossStats.critRate;
  if (isCrit) {
    baseDamage = Math.floor(baseDamage * (bossStats.critDmg / 100));
  }
  
  const playerDefense = (playerDerivedStats.pDef + playerDerivedStats.mDef) / 2;
  const defenseReduction = playerDefense / (playerDefense + 100);
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
 * Record damage from a player
 */
dungeonBreakSchema.statics.recordDamage = async function(eventId, userId, characterId, characterInfo, damage) {
  const event = await this.findById(eventId);
  
  if (!event) throw new Error('Event not found');
  if (event.status !== 'active') throw new Error('Event is not active');
  
  if (new Date() > event.endsAt) {
    event.status = 'failed';
    await event.save();
    throw new Error('Event has ended');
  }
  
  if (characterInfo.level < event.bossData.levelReq) {
    throw new Error(`Minimum level ${event.bossData.levelReq} required`);
  }
  
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
      lastAttack: new Date(),
      coinsEarned: 0
    };
    event.participants.push(participant);
    event.stats.uniqueParticipants++;
  }
  
  const pIndex = event.participants.findIndex(p => p.userId.toString() === userId.toString());
  event.participants[pIndex].totalDamage += damage;
  event.participants[pIndex].attackCount++;
  event.participants[pIndex].highestHit = Math.max(event.participants[pIndex].highestHit, damage);
  event.participants[pIndex].lastAttack = new Date();
  
  event.stats.totalDamage += damage;
  event.stats.totalAttacks++;
  event.stats.peakParticipants = Math.max(event.stats.peakParticipants, event.participants.length);
  
  event.currentHp = Math.max(0, event.currentHp - damage);
  
  if (event.currentHp <= 0) {
    event.status = 'completed';
    event.completedAt = new Date();
    
    // Phase 9.9.2: Calculate and store coins for all participants
    const sorted = [...event.participants].sort((a, b) => b.totalDamage - a.totalDamage);
    sorted.forEach((p, index) => {
      const rank = index + 1;
      const coins = this.calculateRaidCoins(rank);
      const realIndex = event.participants.findIndex(ep => ep.userId.toString() === p.userId.toString());
      if (realIndex !== -1) {
        event.participants[realIndex].coinsEarned = coins;
      }
    });
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
  
  if (!event) return [];
  
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
      damagePercent: ((p.totalDamage / event.stats.totalDamage) * 100).toFixed(2),
      coinsEarned: p.coinsEarned || this.calculateRaidCoins(index + 1)  // Phase 9.9.2
    }));
};

/**
 * Phase 9.9.2: Calculate rewards (now gives coins instead of items)
 */
dungeonBreakSchema.statics.calculateRewards = async function(eventId, userId) {
  const event = await this.findById(eventId);
  
  if (!event) throw new Error('Event not found');
  if (event.status !== 'completed') throw new Error('Event is not completed (boss not defeated)');
  
  const participant = event.participants.find(p => p.userId.toString() === userId.toString());
  
  if (!participant) throw new Error('You did not participate in this event');
  if (participant.rewardsClaimed) throw new Error('Rewards already claimed');
  
  const rank = this.getPlayerRank(event, userId);
  const damagePercent = participant.totalDamage / event.stats.totalDamage;
  const coins = participant.coinsEarned || this.calculateRaidCoins(rank);
  
  // Phase 9.9.2: Rewards now include coins instead of equipment
  const rewards = {
    gold: Math.floor(event.rewards.goldBase * damagePercent * 10),
    exp: Math.floor(event.rewards.expBase * damagePercent * 10),
    coins: coins,
    coinLevel: event.bossData.coinLevel
  };
  
  // Bonus gold/exp for high ranks
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
  
  if (!event) throw new Error('Event not found');
  
  const pIndex = event.participants.findIndex(p => p.userId.toString() === userId.toString());
  
  if (pIndex === -1) throw new Error('You did not participate in this event');
  if (event.participants[pIndex].rewardsClaimed) throw new Error('Rewards already claimed');
  
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

// Export constants
dungeonBreakSchema.statics.BOSSES = DUNGEON_BREAK_BOSSES;
dungeonBreakSchema.statics.TIERS = DUNGEON_BREAK_TIERS;
dungeonBreakSchema.statics.RAID_COIN_REWARDS = RAID_COIN_REWARDS;
dungeonBreakSchema.statics.BOSS_COIN_LEVELS = BOSS_COIN_LEVELS;
dungeonBreakSchema.statics.COIN_TO_SET_MAP = COIN_TO_SET_MAP;

const DungeonBreak = mongoose.model('DungeonBreak', dungeonBreakSchema);

export { DUNGEON_BREAK_BOSSES, DUNGEON_BREAK_TIERS, RAID_COIN_REWARDS, BOSS_COIN_LEVELS, COIN_TO_SET_MAP };
export default DungeonBreak;
