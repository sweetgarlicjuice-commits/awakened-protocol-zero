// ============================================================
// HELP REQUEST ROUTES - Co-op Boss Help System
// ============================================================
// Phase 10: Co-op Boss Help
// 
// Features:
// - Request help on boss floors (5, 10, 15)
// - Friends can accept and help
// - Helper uses full power, spends Helper Points
// - 3 helps per day limit
// - Simulated async combat (helper doesn't need to be online)
//
// Endpoints:
// GET    /api/help/active           - Get my active request
// POST   /api/help/request          - Create help request
// DELETE /api/help/cancel/:id       - Cancel request
// GET    /api/help/available        - Get friends' requests
// POST   /api/help/accept/:id       - Accept and help (simulated combat)
// GET    /api/help/history          - Get help history
// GET    /api/help/stats            - Get helper stats
// ============================================================

import express from 'express';
import Character from '../models/Character.js';
import HelpRequest from '../models/HelpRequest.js';
import Friendship from '../models/Friendship.js';
import { authenticate } from '../middleware/auth.js';
import { TOWERS, ENEMIES } from '../data/towerData.js';

const router = express.Router();

// ============================================================
// HELPER FUNCTION: Calculate combat stats for a character
// ============================================================
function calculateCombatPower(character) {
  const stats = character.stats || {};
  const level = character.level || 1;
  
  // Base stats
  const str = stats.str || 10;
  const agi = stats.agi || 10;
  const dex = stats.dex || 10;
  const int = stats.int || 10;
  const vit = stats.vit || 10;
  
  // Calculate damage
  const levelBonus = 1 + (level - 1) * 0.02;
  const pDmg = Math.floor((5 + str * 3) * levelBonus);
  const mDmg = Math.floor((5 + int * 4) * levelBonus);
  const critRate = Math.min(5 + agi * 0.5, 80);
  const critDmg = 150 + dex;
  
  return {
    pDmg,
    mDmg,
    critRate,
    critDmg,
    totalPower: pDmg + mDmg + (critRate * critDmg / 100)
  };
}

// ============================================================
// HELPER FUNCTION: Simulate co-op boss combat
// ============================================================
function simulateCoopCombat(requesterChar, helperChar, boss) {
  const requesterPower = calculateCombatPower(requesterChar);
  const helperPower = calculateCombatPower(helperChar);
  
  // Combined power vs boss HP
  const combinedDmgPerTurn = (requesterPower.pDmg + requesterPower.mDmg) * 0.8 + 
                             (helperPower.pDmg + helperPower.mDmg) * 1.0; // Helper at full power
  
  const bossHp = boss.hp || 500;
  const bossAtk = boss.atk || 50;
  
  // Simulate turns
  let turns = 0;
  let currentBossHp = bossHp;
  let requesterDamage = 0;
  let helperDamage = 0;
  let requesterHp = requesterChar.stats.hp;
  const combatLog = [];
  
  while (currentBossHp > 0 && requesterHp > 0 && turns < 50) {
    turns++;
    
    // Requester attacks (80% power due to needing help)
    let reqDmg = Math.floor((requesterPower.pDmg + requesterPower.mDmg) * 0.8 * (0.9 + Math.random() * 0.2));
    if (Math.random() * 100 < requesterPower.critRate) {
      reqDmg = Math.floor(reqDmg * requesterPower.critDmg / 100);
      combatLog.push(`${requesterChar.name} deals ${reqDmg} CRIT damage!`);
    } else {
      combatLog.push(`${requesterChar.name} deals ${reqDmg} damage`);
    }
    requesterDamage += reqDmg;
    currentBossHp -= reqDmg;
    
    if (currentBossHp <= 0) break;
    
    // Helper attacks (100% power)
    let helpDmg = Math.floor((helperPower.pDmg + helperPower.mDmg) * (0.9 + Math.random() * 0.2));
    if (Math.random() * 100 < helperPower.critRate) {
      helpDmg = Math.floor(helpDmg * helperPower.critDmg / 100);
      combatLog.push(`${helperChar.name} deals ${helpDmg} CRIT damage!`);
    } else {
      combatLog.push(`${helperChar.name} deals ${helpDmg} damage`);
    }
    helperDamage += helpDmg;
    currentBossHp -= helpDmg;
    
    if (currentBossHp <= 0) break;
    
    // Boss attacks requester (reduced due to helper tanking)
    const bossDmg = Math.floor(bossAtk * (0.5 + Math.random() * 0.3)); // 50-80% damage
    requesterHp -= bossDmg;
    combatLog.push(`${boss.name} attacks ${requesterChar.name} for ${bossDmg} damage`);
  }
  
  const victory = currentBossHp <= 0;
  
  if (victory) {
    combatLog.push(`🎉 Victory! ${boss.name} defeated!`);
  } else {
    combatLog.push(`💀 Defeat! ${requesterChar.name} was overwhelmed.`);
  }
  
  return {
    victory,
    turns,
    requesterDamage,
    helperDamage,
    totalDamage: requesterDamage + helperDamage,
    combatLog
  };
}

// ============================================================
// GET /api/help/active - Get my active help request
// ============================================================
router.get('/active', authenticate, async (req, res) => {
  try {
    const request = await HelpRequest.getActiveRequest(req.userId);
    
    if (!request) {
      return res.json({ hasActiveRequest: false, request: null });
    }
    
    // Populate helper info if accepted
    await request.populate('helper helperCharacter', 'username name level baseClass hiddenClass');
    
    res.json({
      hasActiveRequest: true,
      request: {
        id: request._id,
        towerId: request.towerId,
        floor: request.floor,
        boss: request.bossInfo,
        status: request.status,
        helper: request.helper ? {
          username: request.helper.username,
          character: request.helperCharacter ? {
            name: request.helperCharacter.name,
            level: request.helperCharacter.level,
            class: request.helperCharacter.hiddenClass !== 'none' 
              ? request.helperCharacter.hiddenClass 
              : request.helperCharacter.baseClass
          } : null
        } : null,
        createdAt: request.createdAt,
        expiresAt: request.expiresAt
      }
    });
  } catch (error) {
    console.error('Get active request error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// POST /api/help/request - Create a help request
// ============================================================
router.post('/request', authenticate, async (req, res) => {
  try {
    const { towerId, floor } = req.body;
    
    // Validate boss floor
    if (!floor || floor % 5 !== 0 || floor > 15) {
      return res.status(400).json({ error: 'Help requests can only be created for boss floors (5, 10, 15)' });
    }
    
    const character = await Character.findOne({ userId: req.userId });
    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }
    
    // Check if already has active request
    const existingRequest = await HelpRequest.getActiveRequest(req.userId);
    if (existingRequest) {
      return res.status(400).json({ error: 'You already have an active help request' });
    }
    
    // Get boss info from tower data
    const tower = TOWERS.find(t => t.id === towerId);
    if (!tower) {
      return res.status(400).json({ error: 'Invalid tower' });
    }
    
    // Find boss enemy for this floor
    const bossKey = `tower${towerId}_boss${floor === 5 ? 1 : floor === 10 ? 2 : 3}`;
    const bossEnemy = ENEMIES[bossKey] || {
      id: bossKey,
      name: `Floor ${floor} Boss`,
      icon: '👹',
      hp: 300 + (towerId * 100) + (floor * 20),
      atk: 30 + (towerId * 10) + (floor * 2),
      def: 10 + (towerId * 5)
    };
    
    const bossInfo = {
      id: bossEnemy.id || bossKey,
      name: bossEnemy.name,
      icon: bossEnemy.icon || '👹',
      hp: bossEnemy.hp,
      maxHp: bossEnemy.hp,
      atk: bossEnemy.atk,
      def: bossEnemy.def || 10
    };
    
    const request = await HelpRequest.createRequest(
      req.userId,
      character._id,
      towerId,
      floor,
      bossInfo
    );
    
    // Update character activity
    character.currentActivity = 'idle'; // Still idle but has pending request
    await character.save();
    
    res.json({
      success: true,
      message: `Help request created for ${tower.name} Floor ${floor}`,
      request: {
        id: request._id,
        towerId: request.towerId,
        floor: request.floor,
        boss: request.bossInfo,
        status: request.status,
        expiresAt: request.expiresAt
      }
    });
  } catch (error) {
    console.error('Create help request error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// DELETE /api/help/cancel/:id - Cancel a help request
// ============================================================
router.delete('/cancel/:id', authenticate, async (req, res) => {
  try {
    const request = await HelpRequest.cancelRequest(req.params.id, req.userId);
    
    res.json({
      success: true,
      message: 'Help request cancelled'
    });
  } catch (error) {
    console.error('Cancel request error:', error);
    res.status(400).json({ error: error.message });
  }
});

// ============================================================
// GET /api/help/available - Get friends' requests available to help
// ============================================================
router.get('/available', authenticate, async (req, res) => {
  try {
    const requests = await HelpRequest.getAvailableRequests(req.userId, Friendship);
    
    // Get helper's daily help count
    const todayHelpCount = await HelpRequest.getTodayHelpCount(req.userId);
    
    // Get helper's character for helper points
    const myCharacter = await Character.findOne({ userId: req.userId });
    
    res.json({
      requests: requests.map(r => ({
        id: r._id,
        requester: {
          username: r.requester?.username,
          character: r.requesterCharacter ? {
            name: r.requesterCharacter.name,
            level: r.requesterCharacter.level,
            class: r.requesterCharacter.hiddenClass !== 'none' 
              ? r.requesterCharacter.hiddenClass 
              : r.requesterCharacter.baseClass
          } : null
        },
        towerId: r.towerId,
        floor: r.floor,
        boss: r.bossInfo,
        helperPointsCost: r.helperPointsCost,
        createdAt: r.createdAt,
        expiresAt: r.expiresAt
      })),
      myStats: {
        helpsToday: todayHelpCount,
        dailyLimit: HelpRequest.DAILY_HELP_LIMIT,
        helperPoints: myCharacter?.helperPoints || 0,
        maxHelperPoints: myCharacter?.maxHelperPoints || 30
      }
    });
  } catch (error) {
    console.error('Get available requests error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// POST /api/help/accept/:id - Accept and complete help (simulated combat)
// ============================================================
router.post('/accept/:id', authenticate, async (req, res) => {
  try {
    const helperCharacter = await Character.findOne({ userId: req.userId });
    if (!helperCharacter) {
      return res.status(404).json({ error: 'Character not found' });
    }
    
    // Accept the request (deducts helper points, validates friendship)
    const request = await HelpRequest.acceptRequest(
      req.params.id,
      req.userId,
      helperCharacter._id,
      Friendship,
      Character
    );
    
    // Get requester character
    const requesterCharacter = await Character.findById(request.requesterCharacter);
    if (!requesterCharacter) {
      return res.status(404).json({ error: 'Requester character not found' });
    }
    
    // Start combat
    await HelpRequest.startCombat(request._id, req.userId);
    
    // Simulate the co-op combat
    const combatResult = simulateCoopCombat(
      requesterCharacter,
      helperCharacter,
      request.bossInfo
    );
    
    // Calculate rewards
    const baseExp = 20 + (request.towerId * 10) + (request.floor * 5);
    const baseGold = 30 + (request.towerId * 15) + (request.floor * 8);
    
    const requesterRewards = {
      exp: combatResult.victory ? baseExp : Math.floor(baseExp * 0.3),
      gold: combatResult.victory ? baseGold : Math.floor(baseGold * 0.2),
      items: []
    };
    
    const helperRewards = {
      exp: combatResult.victory ? Math.floor(baseExp * 0.5) : Math.floor(baseExp * 0.1),
      gold: combatResult.victory ? Math.floor(baseGold * 0.3) : 0,
      helperPoints: combatResult.victory ? HelpRequest.HELPER_POINTS_REWARD : Math.floor(HelpRequest.HELPER_POINTS_REWARD / 2)
    };
    
    // Complete the request
    await HelpRequest.completeRequest(request._id, combatResult.victory, {
      requesterDamage: combatResult.requesterDamage,
      helperDamage: combatResult.helperDamage,
      requesterRewards,
      helperRewards,
      combatLog: combatResult.combatLog
    });
    
    // Apply rewards to requester
    requesterCharacter.experience += requesterRewards.exp;
    requesterCharacter.gold += requesterRewards.gold;
    requesterCharacter.socialStats = requesterCharacter.socialStats || {};
    requesterCharacter.socialStats.helpsReceived = (requesterCharacter.socialStats.helpsReceived || 0) + 1;
    
    // Check level up for requester
    const expToLevel = 100 * Math.pow(1.35, requesterCharacter.level - 1);
    if (requesterCharacter.experience >= expToLevel) {
      requesterCharacter.experience -= expToLevel;
      requesterCharacter.level++;
      requesterCharacter.statPoints += 5;
    }
    
    await requesterCharacter.save();
    
    // Apply rewards to helper
    helperCharacter.experience += helperRewards.exp;
    helperCharacter.gold += helperRewards.gold;
    helperCharacter.helperPoints = Math.min(
      (helperCharacter.helperPoints || 0) + helperRewards.helperPoints,
      helperCharacter.maxHelperPoints || 30
    );
    helperCharacter.socialStats = helperCharacter.socialStats || {};
    helperCharacter.socialStats.helpsGiven = (helperCharacter.socialStats.helpsGiven || 0) + 1;
    
    // Check level up for helper
    const helperExpToLevel = 100 * Math.pow(1.35, helperCharacter.level - 1);
    if (helperCharacter.experience >= helperExpToLevel) {
      helperCharacter.experience -= helperExpToLevel;
      helperCharacter.level++;
      helperCharacter.statPoints += 5;
    }
    
    await helperCharacter.save();
    
    res.json({
      success: true,
      victory: combatResult.victory,
      message: combatResult.victory 
        ? `Victory! You helped ${requesterCharacter.name} defeat ${request.bossInfo.name}!`
        : `Defeat! The boss was too strong, but you still earned rewards for trying.`,
      combat: {
        turns: combatResult.turns,
        requesterDamage: combatResult.requesterDamage,
        helperDamage: combatResult.helperDamage,
        totalDamage: combatResult.totalDamage,
        log: combatResult.combatLog.slice(-10) // Last 10 entries
      },
      rewards: helperRewards,
      requesterRewards
    });
  } catch (error) {
    console.error('Accept help request error:', error);
    res.status(400).json({ error: error.message });
  }
});

// ============================================================
// GET /api/help/history - Get help history
// ============================================================
router.get('/history', authenticate, async (req, res) => {
  try {
    const history = await HelpRequest.getHelpHistory(req.userId, 20);
    
    res.json({
      history: history.map(h => ({
        id: h._id,
        role: h.requester?._id?.toString() === req.userId ? 'requester' : 'helper',
        partner: h.requester?._id?.toString() === req.userId 
          ? h.helper?.username 
          : h.requester?.username,
        towerId: h.towerId,
        floor: h.floor,
        boss: h.bossInfo?.name,
        victory: h.result?.victory,
        myDamage: h.requester?._id?.toString() === req.userId 
          ? h.result?.requesterDamage 
          : h.result?.helperDamage,
        completedAt: h.completedAt
      }))
    });
  } catch (error) {
    console.error('Get help history error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// GET /api/help/stats - Get helper stats
// ============================================================
router.get('/stats', authenticate, async (req, res) => {
  try {
    const character = await Character.findOne({ userId: req.userId });
    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }
    
    const todayHelpCount = await HelpRequest.getTodayHelpCount(req.userId);
    
    res.json({
      helperPoints: character.helperPoints || 0,
      maxHelperPoints: character.maxHelperPoints || 30,
      helpsToday: todayHelpCount,
      dailyLimit: HelpRequest.DAILY_HELP_LIMIT,
      totalHelpsGiven: character.socialStats?.helpsGiven || 0,
      totalHelpsReceived: character.socialStats?.helpsReceived || 0
    });
  } catch (error) {
    console.error('Get help stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
