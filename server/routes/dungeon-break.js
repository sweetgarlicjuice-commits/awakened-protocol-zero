// ============================================================
// DUNGEON BREAK ROUTES - Limited Time Event System
// ============================================================
// Phase 9.9: Dungeon Break Events
// Phase 9.9.1: Added boss counter-attack combat system
// 
// Player Endpoints:
// GET    /api/dungeon-break/active       - Get active event
// POST   /api/dungeon-break/attack       - Record attack damage (boss fights back!)
// GET    /api/dungeon-break/leaderboard  - Get rankings
// POST   /api/dungeon-break/claim        - Claim rewards
// GET    /api/dungeon-break/history      - Get past events
// GET    /api/dungeon-break/my-history   - Get my participation history
//
// GM Endpoints:
// GET    /api/dungeon-break/bosses       - Get available bosses
// GET    /api/dungeon-break/tiers        - Get available tiers
// POST   /api/dungeon-break/create       - Create event (GM)
// POST   /api/dungeon-break/cancel       - Cancel event (GM)
// ============================================================

import express from 'express';
import { authenticate, requireGM } from '../middleware/auth.js';
import DungeonBreak, { DUNGEON_BREAK_BOSSES, DUNGEON_BREAK_TIERS } from '../models/DungeonBreak.js';
import Character from '../models/Character.js';

const router = express.Router();

// ============================================================
// CONSTANTS
// ============================================================
const ATTACK_COOLDOWN_MS = 3000;  // 3 second cooldown between attacks

// ============================================================
// GET /api/dungeon-break/active - Get active event
// ============================================================
router.get('/active', authenticate, async (req, res) => {
  try {
    const event = await DungeonBreak.getActiveEvent();
    
    if (!event) {
      return res.json({ active: false, event: null });
    }
    
    // Get player's character for HP display
    const character = await Character.findOne({ userId: req.user._id });
    
    // Get player's participation data
    const participant = event.participants.find(
      p => p.userId.toString() === req.user._id.toString()
    );
    
    // Calculate time remaining
    const now = new Date();
    const timeRemaining = Math.max(0, event.endsAt - now);
    
    // Calculate cooldown remaining
    let cooldownRemaining = 0;
    if (participant?.lastAttack) {
      const timeSinceLastAttack = now - new Date(participant.lastAttack);
      cooldownRemaining = Math.max(0, ATTACK_COOLDOWN_MS - timeSinceLastAttack);
    }
    
    res.json({
      active: true,
      event: {
        id: event._id,
        boss: event.bossData,
        tier: {
          id: event.tier,
          ...event.tierData
        },
        hp: {
          current: event.currentHp,
          max: event.maxHp,
          percent: ((event.currentHp / event.maxHp) * 100).toFixed(1)
        },
        time: {
          started: event.startedAt,
          ends: event.endsAt,
          remaining: timeRemaining,
          remainingFormatted: formatTime(timeRemaining)
        },
        stats: event.stats,
        status: event.status
      },
      myParticipation: participant ? {
        totalDamage: participant.totalDamage,
        attackCount: participant.attackCount,
        highestHit: participant.highestHit,
        rank: DungeonBreak.getPlayerRank(event, req.user._id),
        cooldownRemaining
      } : { cooldownRemaining: 0 },
      // Phase 9.9.1: Include player HP/MP for display
      myStatus: character ? {
        hp: character.stats.hp,
        maxHp: character.stats.maxHp,
        mp: character.stats.mp,
        maxMp: character.stats.maxMp,
        isDead: character.stats.hp <= 0
      } : null
    });
  } catch (error) {
    console.error('Get active event error:', error);
    res.status(500).json({ error: 'Failed to get event' });
  }
});

// ============================================================
// POST /api/dungeon-break/attack - Record attack damage
// Phase 9.9.1: Now includes boss counter-attack!
// ============================================================
router.post('/attack', authenticate, async (req, res) => {
  try {
    const event = await DungeonBreak.getActiveEvent();
    
    if (!event) {
      return res.status(400).json({ error: 'No active dungeon break event' });
    }
    
    // Get player's character
    const character = await Character.findOne({ userId: req.user._id });
    
    if (!character) {
      return res.status(400).json({ error: 'Character not found' });
    }
    
    // ============================================================
    // Phase 9.9.1: CHECK IF PLAYER IS DEAD
    // ============================================================
    if (character.stats.hp <= 0) {
      return res.status(400).json({ 
        error: 'You are dead! Use a potion or rest to recover HP before attacking.',
        isDead: true,
        hp: 0,
        maxHp: character.stats.maxHp
      });
    }
    
    // Check level requirement
    if (character.level < event.bossData.levelReq) {
      return res.status(400).json({ 
        error: `Minimum level ${event.bossData.levelReq} required` 
      });
    }
    
    // ============================================================
    // Phase 9.9.1: CHECK COOLDOWN
    // ============================================================
    const participant = event.participants.find(
      p => p.userId.toString() === req.user._id.toString()
    );
    
    if (participant?.lastAttack) {
      const timeSinceLastAttack = Date.now() - new Date(participant.lastAttack).getTime();
      if (timeSinceLastAttack < ATTACK_COOLDOWN_MS) {
        const remaining = Math.ceil((ATTACK_COOLDOWN_MS - timeSinceLastAttack) / 1000);
        return res.status(400).json({ 
          error: `Cooldown! Wait ${remaining}s before attacking again.`,
          cooldownRemaining: ATTACK_COOLDOWN_MS - timeSinceLastAttack
        });
      }
    }
    
    // ============================================================
    // CALCULATE PLAYER DAMAGE
    // ============================================================
    const derivedStats = Character.calculateDerivedStats(character);
    
    // Base damage formula
    let playerBaseDamage = derivedStats.pDmg + derivedStats.mDmg;
    
    // Add some randomness (90-110% of base)
    const variance = 0.9 + (Math.random() * 0.2);
    playerBaseDamage = Math.floor(playerBaseDamage * variance);
    
    // Check for player crit
    const playerCritRoll = Math.random() * 100;
    let playerIsCrit = playerCritRoll < derivedStats.critRate;
    if (playerIsCrit) {
      playerBaseDamage = Math.floor(playerBaseDamage * (derivedStats.critDmg / 100));
    }
    
    // Minimum damage of 1
    const playerFinalDamage = Math.max(1, playerBaseDamage);
    
    // Record the damage to boss
    const result = await DungeonBreak.recordDamage(
      event._id,
      req.user._id,
      character._id,
      {
        name: character.name,
        level: character.level,
        baseClass: character.baseClass,
        hiddenClass: character.hiddenClass
      },
      playerFinalDamage
    );
    
    // ============================================================
    // Phase 9.9.1: BOSS COUNTER-ATTACK (if boss not defeated)
    // ============================================================
    let bossAttack = null;
    let playerDied = false;
    
    if (!result.bossDefeated && event.bossData.stats) {
      // Calculate boss damage to player
      bossAttack = DungeonBreak.calculateBossAttack(event.bossData, derivedStats);
      
      // Apply damage to player
      character.stats.hp = Math.max(0, character.stats.hp - bossAttack.damage);
      
      // Check if player died
      playerDied = character.stats.hp <= 0;
      
      // Save character HP
      await character.save();
    }
    
    // Update character's activity
    character.currentActivity = 'in_dungeon_break';
    character.lastOnline = new Date();
    await character.save();
    
    // ============================================================
    // BUILD RESPONSE
    // ============================================================
    res.json({
      // Player attack info
      playerAttack: {
        damage: playerFinalDamage,
        isCrit: playerIsCrit
      },
      // Boss counter-attack info (if any)
      bossAttack: bossAttack ? {
        damage: bossAttack.damage,
        isCrit: bossAttack.isCrit,
        usedSkill: bossAttack.usedSkill,
        skillName: bossAttack.skillName,
        skillIcon: bossAttack.skillIcon
      } : null,
      // Boss status
      boss: {
        currentHp: result.bossHp,
        maxHp: result.bossMaxHp,
        percent: ((result.bossHp / result.bossMaxHp) * 100).toFixed(1),
        defeated: result.bossDefeated
      },
      // Player status
      player: {
        hp: character.stats.hp,
        maxHp: character.stats.maxHp,
        mp: character.stats.mp,
        maxMp: character.stats.maxMp,
        died: playerDied
      },
      // My stats
      myStats: {
        totalDamage: result.yourTotalDamage,
        rank: result.yourRank
      },
      // Cooldown
      cooldownMs: ATTACK_COOLDOWN_MS
    });
  } catch (error) {
    console.error('Attack error:', error);
    res.status(400).json({ error: error.message || 'Attack failed' });
  }
});

// ============================================================
// GET /api/dungeon-break/leaderboard - Get rankings
// ============================================================
router.get('/leaderboard', authenticate, async (req, res) => {
  try {
    const { eventId } = req.query;
    
    let event;
    if (eventId) {
      event = await DungeonBreak.findById(eventId);
    } else {
      event = await DungeonBreak.getActiveEvent();
    }
    
    if (!event) {
      return res.json({ leaderboard: [], total: 0 });
    }
    
    const leaderboard = await DungeonBreak.getLeaderboard(event._id, 100);
    
    // Find player's rank
    const myRank = DungeonBreak.getPlayerRank(event, req.user._id);
    
    res.json({
      leaderboard,
      total: event.participants.length,
      myRank,
      eventStatus: event.status
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ error: 'Failed to get leaderboard' });
  }
});

// ============================================================
// POST /api/dungeon-break/claim - Claim rewards
// ============================================================
router.post('/claim', authenticate, async (req, res) => {
  try {
    const { eventId } = req.body;
    
    if (!eventId) {
      return res.status(400).json({ error: 'Event ID required' });
    }
    
    // Calculate rewards
    const rewardInfo = await DungeonBreak.calculateRewards(eventId, req.user._id);
    
    // Get character to apply rewards
    const character = await Character.findOne({ userId: req.user._id });
    
    if (!character) {
      return res.status(400).json({ error: 'Character not found' });
    }
    
    // Apply gold and exp
    character.gold += rewardInfo.rewards.gold;
    character.experience += rewardInfo.rewards.exp;
    
    // Update social stats
    if (!character.socialStats) {
      character.socialStats = {};
    }
    character.socialStats.dungeonBreaksParticipated = 
      (character.socialStats.dungeonBreaksParticipated || 0) + 1;
    
    // Check for level up
    const levelsGained = character.checkLevelUp();
    
    // Add title if rank 1
    if (rewardInfo.rewards.title) {
      await character.addTitle('dungeon_break_champion', rewardInfo.rewards.title);
    }
    
    await character.save();
    
    // Mark rewards as claimed
    await DungeonBreak.claimRewards(eventId, req.user._id);
    
    res.json({
      claimed: true,
      rank: rewardInfo.rank,
      damagePercent: rewardInfo.damagePercent,
      rewards: rewardInfo.rewards,
      levelsGained
    });
  } catch (error) {
    console.error('Claim rewards error:', error);
    res.status(400).json({ error: error.message || 'Failed to claim rewards' });
  }
});

// ============================================================
// GET /api/dungeon-break/history - Get past events
// ============================================================
router.get('/history', authenticate, async (req, res) => {
  try {
    const events = await DungeonBreak.getHistory(20);
    
    res.json({
      events: events.map(e => ({
        id: e._id,
        boss: e.bossData,
        status: e.status,
        stats: e.stats,
        completedAt: e.completedAt
      }))
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Failed to get history' });
  }
});

// ============================================================
// GET /api/dungeon-break/my-history - Get my participation
// ============================================================
router.get('/my-history', authenticate, async (req, res) => {
  try {
    const events = await DungeonBreak.getPlayerHistory(req.user._id, 10);
    
    const history = events.map(event => {
      const participant = event.participants.find(
        p => p.userId.toString() === req.user._id.toString()
      );
      
      return {
        id: event._id,
        boss: event.bossData,
        status: event.status,
        completedAt: event.completedAt,
        myStats: participant ? {
          totalDamage: participant.totalDamage,
          attackCount: participant.attackCount,
          rank: DungeonBreak.getPlayerRank(event, req.user._id),
          rewardsClaimed: participant.rewardsClaimed
        } : null
      };
    });
    
    res.json({ history });
  } catch (error) {
    console.error('Get my history error:', error);
    res.status(500).json({ error: 'Failed to get history' });
  }
});

// ============================================================
// GM ENDPOINTS
// ============================================================

// GET /api/dungeon-break/bosses - Get available bosses (GM)
router.get('/bosses', authenticate, requireGM, async (req, res) => {
  try {
    const bosses = Object.entries(DUNGEON_BREAK_BOSSES).map(([id, boss]) => ({
      id: parseInt(id),
      name: boss.name,
      icon: boss.icon,
      description: boss.description,
      levelReq: boss.levelReq,
      baseHp: boss.baseHp,
      element: boss.element,
      stats: boss.stats,     // Phase 9.9.1: Include combat stats
      skill: boss.skill,     // Phase 9.9.1: Include skill info
      rewards: boss.rewards
    }));
    
    res.json({ bosses });
  } catch (error) {
    console.error('Get bosses error:', error);
    res.status(500).json({ error: 'Failed to get bosses' });
  }
});

// GET /api/dungeon-break/tiers - Get available tiers (GM)
router.get('/tiers', authenticate, requireGM, async (req, res) => {
  try {
    const tiers = Object.entries(DUNGEON_BREAK_TIERS).map(([id, tier]) => ({
      id,
      name: tier.name,
      description: tier.description,
      hpMultiplier: tier.hpMultiplier,
      rewardMultiplier: tier.rewardMultiplier,
      minPlayers: tier.minPlayers,
      maxPlayers: tier.maxPlayers
    }));
    
    res.json({ tiers });
  } catch (error) {
    console.error('Get tiers error:', error);
    res.status(500).json({ error: 'Failed to get tiers' });
  }
});

// POST /api/dungeon-break/create - Create event (GM)
router.post('/create', authenticate, requireGM, async (req, res) => {
  try {
    const { bossId, tier = 'small', durationHours = 3 } = req.body;
    
    if (!bossId) {
      return res.status(400).json({ error: 'Boss ID required' });
    }
    
    const event = await DungeonBreak.createEvent(
      req.user._id,
      bossId,
      tier,
      durationHours
    );
    
    res.json({
      message: `Dungeon Break started! ${event.bossData.name} has appeared!`,
      event: {
        id: event._id,
        boss: event.bossData,
        tier: event.tier,
        hp: event.maxHp,
        duration: durationHours,
        endsAt: event.endsAt
      }
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(400).json({ error: error.message || 'Failed to create event' });
  }
});

// POST /api/dungeon-break/cancel - Cancel event (GM)
router.post('/cancel', authenticate, requireGM, async (req, res) => {
  try {
    const event = await DungeonBreak.getActiveEvent();
    
    if (!event) {
      return res.status(400).json({ error: 'No active event to cancel' });
    }
    
    await DungeonBreak.cancelEvent(event._id, req.user._id);
    
    res.json({ message: 'Dungeon Break event cancelled' });
  } catch (error) {
    console.error('Cancel event error:', error);
    res.status(400).json({ error: error.message || 'Failed to cancel event' });
  }
});

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function formatTime(ms) {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((ms % (1000 * 60)) / 1000);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
}

export default router;
