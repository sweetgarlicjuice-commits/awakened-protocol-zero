// ============================================================
// DUNGEON BREAK ROUTES - Limited Time Event System
// ============================================================
// Phase 9.9: Dungeon Break Events
// Phase 9.9.1: Added boss counter-attack combat system
// Phase 9.9.2: Raid Coins reward system + Redeem shop
// 
// Player Endpoints:
// GET    /api/dungeon-break/active       - Get active event
// POST   /api/dungeon-break/attack       - Record attack damage
// GET    /api/dungeon-break/leaderboard  - Get rankings
// POST   /api/dungeon-break/claim        - Claim rewards (coins)
// GET    /api/dungeon-break/history      - Get past events
// GET    /api/dungeon-break/my-history   - Get my participation history
// GET    /api/dungeon-break/my-coins     - Get my raid coins (NEW)
// GET    /api/dungeon-break/shop         - Get redeemable sets (NEW)
// POST   /api/dungeon-break/redeem       - Redeem coins for equipment (NEW)
//
// GM Endpoints:
// GET    /api/dungeon-break/bosses       - Get available bosses
// GET    /api/dungeon-break/tiers        - Get available tiers
// POST   /api/dungeon-break/create       - Create event (GM)
// POST   /api/dungeon-break/cancel       - Cancel event (GM)
// ============================================================

import express from 'express';
import { authenticate, requireGM } from '../middleware/auth.js';
import DungeonBreak, { DUNGEON_BREAK_BOSSES, DUNGEON_BREAK_TIERS, COIN_TO_SET_MAP } from '../models/DungeonBreak.js';
import Character from '../models/Character.js';
import { DUNGEON_BREAK_SETS } from '../data/equipment/dungeonBreakSets.js';

// Phase 9.9.7: Import combat engine for skill support
import {
  getSkill,
  calculateSkillDamage,
  processSkillEffects
} from '../data/combat/index.js';

const router = express.Router();

// ============================================================
// CONSTANTS
// ============================================================
const ATTACK_COOLDOWN_MS = 3000;
const REDEEM_COST = 25;  // Phase 9.9.2: Cost per piece

// Coin level display names
const COIN_NAMES = {
  lv5: 'R-Coin Lv.5',
  lv10: 'R-Coin Lv.10',
  lv20: 'R-Coin Lv.20',
  lv30: 'R-Coin Lv.30',
  lv40: 'R-Coin Lv.40'
};

// ============================================================
// GET /api/dungeon-break/active - Get active event
// Phase 9.9.7: Added character skills to response
// ============================================================
router.get('/active', authenticate, async (req, res) => {
  try {
    const event = await DungeonBreak.getActiveEvent();
    
    if (!event) {
      return res.json({ active: false, event: null });
    }
    
    const character = await Character.findOne({ userId: req.user._id });
    
    const participant = event.participants.find(
      p => p.userId.toString() === req.user._id.toString()
    );
    
    const now = new Date();
    const timeRemaining = Math.max(0, event.endsAt - now);
    
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
        status: event.status,
        coinLevel: event.bossData.coinLevel,
        coinName: COIN_NAMES[event.bossData.coinLevel]
      },
      myParticipation: participant ? {
        totalDamage: participant.totalDamage,
        attackCount: participant.attackCount,
        highestHit: participant.highestHit,
        rank: DungeonBreak.getPlayerRank(event, req.user._id),
        cooldownRemaining
      } : { cooldownRemaining: 0 },
      myStatus: character ? {
        hp: character.stats.hp,
        maxHp: character.stats.maxHp,
        mp: character.stats.mp,
        maxMp: character.stats.maxMp,
        isDead: character.stats.hp <= 0
      } : null,
      // Phase 9.9.7: Include character skills
      mySkills: character?.skills || []
    });
  } catch (error) {
    console.error('Get active event error:', error);
    res.status(500).json({ error: 'Failed to get event' });
  }
});

// ============================================================
// POST /api/dungeon-break/attack - Record attack damage
// Phase 9.9.7: Added skill support
// ============================================================
router.post('/attack', authenticate, async (req, res) => {
  try {
    const { skillId } = req.body; // Phase 9.9.7: Optional skillId
    
    const event = await DungeonBreak.getActiveEvent();
    
    if (!event) {
      return res.status(400).json({ error: 'No active dungeon break event' });
    }
    
    const character = await Character.findOne({ userId: req.user._id });
    
    if (!character) {
      return res.status(400).json({ error: 'Character not found' });
    }
    
    // Check if player is dead
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
    
    // Check cooldown
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
    
    // Calculate player damage
    const derivedStats = Character.calculateDerivedStats(character);
    
    let playerFinalDamage = 0;
    let playerIsCrit = false;
    let skillUsed = null;
    let skillName = null;
    
    // ============================================================
    // Phase 9.9.7: Skill-based attack
    // ============================================================
    if (skillId) {
      skillUsed = getSkill(skillId);
      
      if (!skillUsed) {
        return res.status(400).json({ error: 'Skill not found' });
      }
      
      // Check MP cost
      if (character.stats.mp < skillUsed.mpCost) {
        return res.status(400).json({ error: `Not enough MP! Need ${skillUsed.mpCost}, have ${character.stats.mp}` });
      }
      
      // Deduct MP
      character.stats.mp -= skillUsed.mpCost;
      
      // Create a mock target for damage calculation
      const bossAsTarget = {
        name: event.bossData.name,
        def: event.bossData.stats?.def || 50,
        mDef: event.bossData.stats?.mDef || 50,
        element: event.bossData.element || 'none'
      };
      
      // Calculate skill damage
      const skillResult = calculateSkillDamage(skillUsed, derivedStats, bossAsTarget, []);
      
      if (skillResult && skillResult.finalDamage) {
        playerFinalDamage = skillResult.finalDamage;
        playerIsCrit = skillResult.isCrit || false;
      } else {
        // Fallback calculation
        const baseDmg = skillUsed.scaling?.stat === 'mDmg' ? derivedStats.mDmg : derivedStats.pDmg;
        const multiplier = skillUsed.scaling?.multiplier || 1.0;
        playerFinalDamage = Math.floor(baseDmg * multiplier);
        playerIsCrit = Math.random() * 100 < derivedStats.critRate;
        if (playerIsCrit) {
          playerFinalDamage = Math.floor(playerFinalDamage * (derivedStats.critDmg / 100));
        }
      }
      
      skillName = skillUsed.name;
      
    } else {
      // ============================================================
      // Normal attack (original logic)
      // ============================================================
      let playerBaseDamage = derivedStats.pDmg + derivedStats.mDmg;
      const variance = 0.9 + (Math.random() * 0.2);
      playerBaseDamage = Math.floor(playerBaseDamage * variance);
      
      const playerCritRoll = Math.random() * 100;
      playerIsCrit = playerCritRoll < derivedStats.critRate;
      if (playerIsCrit) {
        playerBaseDamage = Math.floor(playerBaseDamage * (derivedStats.critDmg / 100));
      }
      
      playerFinalDamage = Math.max(1, playerBaseDamage);
    }
    
    // Ensure minimum damage
    playerFinalDamage = Math.max(1, playerFinalDamage);
    
    // Record damage
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
    
    // Boss counter-attack
    let bossAttack = null;
    let playerDied = false;
    
    if (!result.bossDefeated && event.bossData.stats) {
      bossAttack = DungeonBreak.calculateBossAttack(event.bossData, derivedStats);
      character.stats.hp = Math.max(0, character.stats.hp - bossAttack.damage);
      playerDied = character.stats.hp <= 0;
    }
    
    // Update character
    character.currentActivity = 'in_dungeon_break';
    character.lastOnline = new Date();
    character.markModified('stats');
    await character.save();
    
    res.json({
      playerAttack: {
        damage: playerFinalDamage,
        isCrit: playerIsCrit,
        usedSkill: !!skillUsed,
        skillName: skillName
      },
      bossAttack: bossAttack ? {
        damage: bossAttack.damage,
        isCrit: bossAttack.isCrit,
        usedSkill: bossAttack.usedSkill,
        skillName: bossAttack.skillName,
        skillIcon: bossAttack.skillIcon
      } : null,
      boss: {
        currentHp: result.bossHp,
        maxHp: result.bossMaxHp,
        percent: ((result.bossHp / result.bossMaxHp) * 100).toFixed(1),
        defeated: result.bossDefeated
      },
      player: {
        hp: character.stats.hp,
        maxHp: character.stats.maxHp,
        mp: character.stats.mp,
        maxMp: character.stats.maxMp,
        died: playerDied
      },
      myStats: {
        totalDamage: result.yourTotalDamage,
        rank: result.yourRank
      },
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
    const myRank = DungeonBreak.getPlayerRank(event, req.user._id);
    
    res.json({
      leaderboard,
      total: event.participants.length,
      myRank,
      eventStatus: event.status,
      coinLevel: event.bossData?.coinLevel,
      coinName: COIN_NAMES[event.bossData?.coinLevel]
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ error: 'Failed to get leaderboard' });
  }
});

// ============================================================
// POST /api/dungeon-break/claim - Claim rewards (now gives coins)
// ============================================================
router.post('/claim', authenticate, async (req, res) => {
  try {
    const { eventId } = req.body;
    
    if (!eventId) {
      return res.status(400).json({ error: 'Event ID required' });
    }
    
    // Calculate rewards
    const rewardInfo = await DungeonBreak.calculateRewards(eventId, req.user._id);
    
    // Get character
    const character = await Character.findOne({ userId: req.user._id });
    
    if (!character) {
      return res.status(400).json({ error: 'Character not found' });
    }
    
    // Apply gold and exp
    character.gold += rewardInfo.rewards.gold;
    character.experience += rewardInfo.rewards.exp;
    
    // Phase 9.9.2: Apply raid coins
    const coinLevel = rewardInfo.rewards.coinLevel;
    if (!character.raidCoins) {
      character.raidCoins = { lv5: 0, lv10: 0, lv20: 0, lv30: 0, lv40: 0 };
    }
    character.raidCoins[coinLevel] = (character.raidCoins[coinLevel] || 0) + rewardInfo.rewards.coins;
    character.markModified('raidCoins');
    
    // Update social stats
    if (!character.socialStats) {
      character.socialStats = {};
    }
    character.socialStats.dungeonBreaksParticipated = 
      (character.socialStats.dungeonBreaksParticipated || 0) + 1;
    
    // Check for level up
    const levelsGained = character.checkLevelUp ? character.checkLevelUp() : 0;
    
    // Add title if rank 1
    if (rewardInfo.rewards.title && character.addTitle) {
      await character.addTitle('dungeon_break_champion', rewardInfo.rewards.title);
    }
    
    await character.save();
    
    // Mark rewards as claimed
    await DungeonBreak.claimRewards(eventId, req.user._id);
    
    res.json({
      claimed: true,
      rank: rewardInfo.rank,
      damagePercent: rewardInfo.damagePercent,
      rewards: {
        ...rewardInfo.rewards,
        coinName: COIN_NAMES[coinLevel]
      },
      levelsGained,
      newCoinBalance: character.raidCoins[coinLevel]
    });
  } catch (error) {
    console.error('Claim rewards error:', error);
    res.status(400).json({ error: error.message || 'Failed to claim rewards' });
  }
});

// ============================================================
// GET /api/dungeon-break/my-coins - Get player's raid coins
// ============================================================
router.get('/my-coins', authenticate, async (req, res) => {
  try {
    const character = await Character.findOne({ userId: req.user._id });
    
    if (!character) {
      return res.status(400).json({ error: 'Character not found' });
    }
    
    const coins = character.raidCoins || { lv5: 0, lv10: 0, lv20: 0, lv30: 0, lv40: 0 };
    
    res.json({
      coins: {
        lv5: { amount: coins.lv5 || 0, name: COIN_NAMES.lv5, icon: '🪙' },
        lv10: { amount: coins.lv10 || 0, name: COIN_NAMES.lv10, icon: '🪙' },
        lv20: { amount: coins.lv20 || 0, name: COIN_NAMES.lv20, icon: '🪙' },
        lv30: { amount: coins.lv30 || 0, name: COIN_NAMES.lv30, icon: '🪙' },
        lv40: { amount: coins.lv40 || 0, name: COIN_NAMES.lv40, icon: '🪙' }
      },
      redeemCost: REDEEM_COST
    });
  } catch (error) {
    console.error('Get my coins error:', error);
    res.status(500).json({ error: 'Failed to get coins' });
  }
});

// ============================================================
// GET /api/dungeon-break/shop - Get redeemable sets
// ============================================================
router.get('/shop', authenticate, async (req, res) => {
  try {
    const character = await Character.findOne({ userId: req.user._id });
    const coins = character?.raidCoins || { lv5: 0, lv10: 0, lv20: 0, lv30: 0, lv40: 0 };
    
    // Build shop data from sets
    const shop = Object.entries(DUNGEON_BREAK_SETS).map(([setId, set]) => {
      // Find which coin level this set requires
      let coinLevel = null;
      for (const [level, sId] of Object.entries(COIN_TO_SET_MAP)) {
        if (sId === setId) {
          coinLevel = level;
          break;
        }
      }
      
      return {
        setId,
        name: set.name,
        description: set.description,
        levelReq: set.levelReq,
        rarity: set.rarity,
        coinLevel,
        coinName: COIN_NAMES[coinLevel],
        playerCoins: coins[coinLevel] || 0,
        redeemCost: REDEEM_COST,
        pieces: Object.entries(set.pieces).map(([slot, piece]) => ({
          slot,
          id: piece.id,
          name: piece.name,
          icon: piece.icon,
          stats: piece.stats
        })),
        setBonuses: set.setBonuses
      };
    });
    
    res.json({
      shop,
      playerCoins: coins,
      redeemCost: REDEEM_COST
    });
  } catch (error) {
    console.error('Get shop error:', error);
    res.status(500).json({ error: 'Failed to get shop' });
  }
});

// ============================================================
// POST /api/dungeon-break/redeem - Redeem coins for equipment
// ============================================================
router.post('/redeem', authenticate, async (req, res) => {
  try {
    const { setId, pieceSlot } = req.body;
    
    if (!setId || !pieceSlot) {
      return res.status(400).json({ error: 'Set ID and piece slot required' });
    }
    
    // Get set data
    const set = DUNGEON_BREAK_SETS[setId];
    if (!set) {
      return res.status(400).json({ error: 'Invalid set ID' });
    }
    
    // Get piece data
    const piece = set.pieces[pieceSlot];
    if (!piece) {
      return res.status(400).json({ error: 'Invalid piece slot' });
    }
    
    // Find coin level for this set
    let coinLevel = null;
    for (const [level, sId] of Object.entries(COIN_TO_SET_MAP)) {
      if (sId === setId) {
        coinLevel = level;
        break;
      }
    }
    
    if (!coinLevel) {
      return res.status(400).json({ error: 'Cannot determine coin type for this set' });
    }
    
    // Get character
    const character = await Character.findOne({ userId: req.user._id });
    
    if (!character) {
      return res.status(400).json({ error: 'Character not found' });
    }
    
    // Check level requirement
    if (character.level < set.levelReq) {
      return res.status(400).json({ error: `You must be level ${set.levelReq} to redeem this set` });
    }
    
    // Check coins
    if (!character.raidCoins) {
      character.raidCoins = { lv5: 0, lv10: 0, lv20: 0, lv30: 0, lv40: 0 };
    }
    
    const currentCoins = character.raidCoins[coinLevel] || 0;
    if (currentCoins < REDEEM_COST) {
      return res.status(400).json({ 
        error: `Not enough ${COIN_NAMES[coinLevel]}! Need ${REDEEM_COST}, have ${currentCoins}` 
      });
    }
    
    // Check inventory space
    if (character.inventory.length >= character.inventorySize) {
      return res.status(400).json({ error: 'Inventory full!' });
    }
    
    // Deduct coins
    character.raidCoins[coinLevel] -= REDEEM_COST;
    character.markModified('raidCoins');
    
    // Create equipment item
    const newItem = {
      itemId: piece.id,
      name: piece.name,
      icon: piece.icon,
      type: 'equipment',
      subtype: piece.slot,
      rarity: set.rarity,
      quantity: 1,
      stackable: false,
      stats: piece.stats,
      setId: setId,
      levelReq: set.levelReq,
      sellPrice: set.levelReq * 10
    };
    
    character.inventory.push(newItem);
    await character.save();
    
    res.json({
      success: true,
      message: `Redeemed ${piece.name}!`,
      item: newItem,
      coinsSpent: REDEEM_COST,
      remainingCoins: character.raidCoins[coinLevel]
    });
  } catch (error) {
    console.error('Redeem error:', error);
    res.status(400).json({ error: error.message || 'Failed to redeem' });
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
      
      const rank = DungeonBreak.getPlayerRank(event, req.user._id);
      
      return {
        id: event._id,
        boss: event.bossData,
        status: event.status,
        completedAt: event.completedAt,
        coinLevel: event.bossData?.coinLevel,
        coinName: COIN_NAMES[event.bossData?.coinLevel],
        myStats: participant ? {
          totalDamage: participant.totalDamage,
          attackCount: participant.attackCount,
          rank,
          coinsEarned: participant.coinsEarned || DungeonBreak.calculateRaidCoins(rank),
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
      coinLevel: boss.coinLevel,
      coinName: COIN_NAMES[boss.coinLevel],
      stats: boss.stats,
      skill: boss.skill,
      rewards: boss.rewards
    }));
    
    res.json({ bosses });
  } catch (error) {
    console.error('Get bosses error:', error);
    res.status(500).json({ error: 'Failed to get bosses' });
  }
});

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
        endsAt: event.endsAt,
        coinLevel: event.bossData.coinLevel,
        coinName: COIN_NAMES[event.bossData.coinLevel]
      }
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(400).json({ error: error.message || 'Failed to create event' });
  }
});

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
  
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

export default router;
