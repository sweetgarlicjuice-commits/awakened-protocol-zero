import express from 'express';
import Character from '../models/Character.js';
import { authenticate } from '../middleware/auth.js';
import { TOWERS, ENEMIES, DROP_RATES, EQUIPMENT_DROPS, SCROLLS } from '../data/gameData.js';
import { 
  calculateDamage, 
  scaleEnemyStats, 
  getRandomEnemy, 
  calculateGoldDrop,
  rollForDrops,
  rollForScroll,
  applySkillEffect,
  processStatusEffects
} from '../utils/combat.js';

const router = express.Router();

// GET /api/tower/info - Get all tower information
router.get('/info', authenticate, async (req, res) => {
  try {
    const character = await Character.findOne({ userId: req.userId });
    
    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }
    
    // Build tower info with unlock status
    const towerInfo = Object.values(TOWERS).map(tower => {
      let isUnlocked = true;
      
      if (tower.requirement) {
        isUnlocked = character.highestTowerCleared >= tower.requirement.tower;
      }
      
      return {
        ...tower,
        isUnlocked,
        currentFloor: character.currentTower === tower.id ? character.currentFloor : 1
      };
    });
    
    res.json({ towers: towerInfo });
  } catch (error) {
    console.error('Get tower info error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/tower/enter - Enter a tower
router.post('/enter', authenticate, async (req, res) => {
  try {
    const { towerId } = req.body;
    const character = await Character.findOne({ userId: req.userId });
    
    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }
    
    const tower = TOWERS[towerId];
    if (!tower) {
      return res.status(400).json({ error: 'Invalid tower' });
    }
    
    // Check tower unlock requirement
    if (tower.requirement && character.highestTowerCleared < tower.requirement.tower) {
      return res.status(400).json({ error: `Clear Tower ${tower.requirement.tower} first!` });
    }
    
    // Check level requirement
    if (character.level < tower.levelRange.min) {
      return res.status(400).json({ error: `Requires level ${tower.levelRange.min}` });
    }
    
    character.currentTower = towerId;
    if (character.currentTower !== towerId) {
      character.currentFloor = 1;
    }
    await character.save();
    
    res.json({
      message: `Entered ${tower.name}`,
      tower,
      currentFloor: character.currentFloor
    });
  } catch (error) {
    console.error('Enter tower error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/tower/explore - Explore current floor (start encounter)
router.post('/explore', authenticate, async (req, res) => {
  try {
    const character = await Character.findOne({ userId: req.userId });
    
    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }
    
    // Check energy
    if (character.energy < 25) {
      return res.status(400).json({ error: 'Not enough energy! (Need 25)' });
    }
    
    // Check HP
    if (character.stats.hp <= 0) {
      return res.status(400).json({ error: 'You are defeated! Rest to recover.' });
    }
    
    const tower = TOWERS[character.currentTower];
    const floor = character.currentFloor;
    
    // Floor 10 is safe zone
    if (floor === 10) {
      return res.json({
        type: 'safe_zone',
        message: 'You are in the Safe Zone. Rest, trade, or continue to the next floor.',
        floor: 10
      });
    }
    
    // Floor 15 is boss
    if (floor === 15) {
      const towerEnemies = ENEMIES[`tower${character.currentTower}`];
      const boss = scaleEnemyStats(towerEnemies.boss, floor, character.currentTower);
      
      // Deduct energy
      character.energy -= 25;
      await character.save();
      
      return res.json({
        type: 'boss',
        message: `⚠️ BOSS BATTLE: ${boss.name} appears!`,
        enemy: boss,
        floor,
        energyRemaining: character.energy
      });
    }
    
    // Floors 13-14 have elite enemies
    const isEliteFloor = floor >= 13 && floor <= 14;
    const towerEnemies = ENEMIES[`tower${character.currentTower}`];
    
    let enemy;
    if (isEliteFloor && Math.random() < 0.4) { // 40% chance for elite on elite floors
      enemy = getRandomEnemy(towerEnemies.elite, floor);
    } else {
      enemy = getRandomEnemy(towerEnemies.normal, floor);
    }
    
    enemy = scaleEnemyStats(enemy, floor, character.currentTower);
    
    // Deduct energy
    character.energy -= 25;
    await character.save();
    
    res.json({
      type: enemy.isElite ? 'elite' : 'normal',
      message: enemy.isElite ? `⚡ ELITE: ${enemy.name} appears!` : `${enemy.name} appears!`,
      enemy,
      floor,
      energyRemaining: character.energy
    });
  } catch (error) {
    console.error('Explore error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/tower/combat/attack - Basic attack
router.post('/combat/attack', authenticate, async (req, res) => {
  try {
    const { enemy } = req.body;
    const character = await Character.findOne({ userId: req.userId });
    
    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }
    
    const combatLog = [];
    
    // Player attacks
    const playerDamage = calculateDamage(
      { stats: character.stats, baseClass: character.baseClass },
      enemy
    );
    
    enemy.hp -= playerDamage.damage;
    combatLog.push({
      actor: 'player',
      action: 'attack',
      damage: playerDamage.damage,
      isCritical: playerDamage.isCritical,
      message: playerDamage.isCritical 
        ? `💥 CRITICAL! You deal ${playerDamage.damage} damage!`
        : `You attack for ${playerDamage.damage} damage!`
    });
    
    // Check if enemy is defeated
    if (enemy.hp <= 0) {
      return await handleVictory(character, enemy, res, combatLog);
    }
    
    // Enemy attacks back
    const enemyDamage = calculateDamage(
      { baseAtk: enemy.atk },
      { stats: character.stats }
    );
    
    character.stats.hp -= enemyDamage.damage;
    combatLog.push({
      actor: 'enemy',
      action: 'attack',
      damage: enemyDamage.damage,
      message: `${enemy.name} attacks for ${enemyDamage.damage} damage!`
    });
    
    // Check if player is defeated
    if (character.stats.hp <= 0) {
      character.stats.hp = 0;
      character.statistics.deaths += 1;
      await character.save();
      
      return res.json({
        status: 'defeat',
        message: '💀 You have been defeated!',
        combatLog,
        character: {
          hp: character.stats.hp,
          maxHp: character.stats.maxHp
        }
      });
    }
    
    await character.save();
    
    res.json({
      status: 'ongoing',
      combatLog,
      enemy: {
        ...enemy,
        hp: Math.max(0, enemy.hp)
      },
      character: {
        hp: character.stats.hp,
        maxHp: character.stats.maxHp,
        mp: character.stats.mp,
        maxMp: character.stats.maxMp
      }
    });
  } catch (error) {
    console.error('Combat attack error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/tower/combat/skill - Use a skill
router.post('/combat/skill', authenticate, async (req, res) => {
  try {
    const { enemy, skillId } = req.body;
    const character = await Character.findOne({ userId: req.userId });
    
    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }
    
    // Find the skill
    const characterSkill = character.skills.find(s => s.skillId === skillId);
    if (!characterSkill || !characterSkill.unlocked) {
      return res.status(400).json({ error: 'Skill not available' });
    }
    
    // Skill data
    const SKILL_DATA = {
      // Swordsman
      slash: { name: 'Slash', mpCost: 5, damage: 1.3, type: 'physical' },
      heavyStrike: { name: 'Heavy Strike', mpCost: 12, damage: 1.8, type: 'physical' },
      shieldBash: { name: 'Shield Bash', mpCost: 8, damage: 1.0, effect: 'stun', type: 'physical' },
      warCry: { name: 'War Cry', mpCost: 15, damage: 0, effect: 'buff_atk', type: 'buff' },
      
      // Thief
      backstab: { name: 'Backstab', mpCost: 8, damage: 2.2, critBonus: 0.4, type: 'physical' },
      poisonBlade: { name: 'Poison Blade', mpCost: 10, damage: 1.3, effect: 'poison', type: 'physical' },
      smokeScreen: { name: 'Smoke Screen', mpCost: 12, damage: 0, effect: 'evasion', type: 'buff' },
      steal: { name: 'Steal', mpCost: 5, damage: 0, effect: 'steal', type: 'special' },
      
      // Archer
      preciseShot: { name: 'Precise Shot', mpCost: 6, damage: 1.6, type: 'physical' },
      multiShot: { name: 'Multi Shot', mpCost: 14, damage: 0.6, hits: 3, type: 'physical' },
      eagleEye: { name: 'Eagle Eye', mpCost: 10, damage: 0, effect: 'accuracy', type: 'buff' },
      arrowRain: { name: 'Arrow Rain', mpCost: 20, damage: 2.0, type: 'physical' },
      
      // Mage
      fireball: { name: 'Fireball', mpCost: 10, damage: 1.8, type: 'magic' },
      iceSpear: { name: 'Ice Spear', mpCost: 12, damage: 1.5, effect: 'slow', type: 'magic' },
      manaShield: { name: 'Mana Shield', mpCost: 15, damage: 0, effect: 'shield', type: 'buff' },
      thunderbolt: { name: 'Thunderbolt', mpCost: 18, damage: 2.2, type: 'magic' }
    };
    
    const skill = SKILL_DATA[skillId];
    if (!skill) {
      return res.status(400).json({ error: 'Invalid skill' });
    }
    
    // Check MP
    if (character.stats.mp < skill.mpCost) {
      return res.status(400).json({ error: 'Not enough MP!' });
    }
    
    const combatLog = [];
    
    // Deduct MP
    character.stats.mp -= skill.mpCost;
    
    // Calculate and apply damage
    if (skill.damage > 0) {
      let totalDamage = 0;
      const hits = skill.hits || 1;
      
      for (let i = 0; i < hits; i++) {
        const result = calculateDamage(
          { stats: character.stats, baseClass: character.baseClass },
          enemy,
          skill
        );
        totalDamage += result.damage;
        
        if (hits > 1) {
          combatLog.push({
            actor: 'player',
            action: 'skill_hit',
            damage: result.damage,
            message: `Hit ${i + 1}: ${result.damage} damage!`
          });
        }
      }
      
      enemy.hp -= totalDamage;
      
      combatLog.push({
        actor: 'player',
        action: 'skill',
        skillName: skill.name,
        damage: totalDamage,
        mpCost: skill.mpCost,
        message: `✨ ${skill.name}! ${totalDamage} total damage! (-${skill.mpCost} MP)`
      });
    } else {
      // Buff skill
      combatLog.push({
        actor: 'player',
        action: 'skill',
        skillName: skill.name,
        mpCost: skill.mpCost,
        message: `✨ ${skill.name} activated! (-${skill.mpCost} MP)`
      });
    }
    
    // Check if enemy is defeated
    if (enemy.hp <= 0) {
      return await handleVictory(character, enemy, res, combatLog);
    }
    
    // Enemy attacks back
    const enemyDamage = calculateDamage(
      { baseAtk: enemy.atk },
      { stats: character.stats }
    );
    
    character.stats.hp -= enemyDamage.damage;
    combatLog.push({
      actor: 'enemy',
      action: 'attack',
      damage: enemyDamage.damage,
      message: `${enemy.name} attacks for ${enemyDamage.damage} damage!`
    });
    
    // Check if player is defeated
    if (character.stats.hp <= 0) {
      character.stats.hp = 0;
      character.statistics.deaths += 1;
      await character.save();
      
      return res.json({
        status: 'defeat',
        message: '💀 You have been defeated!',
        combatLog,
        character: {
          hp: character.stats.hp,
          maxHp: character.stats.maxHp,
          mp: character.stats.mp,
          maxMp: character.stats.maxMp
        }
      });
    }
    
    await character.save();
    
    res.json({
      status: 'ongoing',
      combatLog,
      enemy: {
        ...enemy,
        hp: Math.max(0, enemy.hp)
      },
      character: {
        hp: character.stats.hp,
        maxHp: character.stats.maxHp,
        mp: character.stats.mp,
        maxMp: character.stats.maxMp
      }
    });
  } catch (error) {
    console.error('Combat skill error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/tower/combat/flee - Attempt to flee
router.post('/combat/flee', authenticate, async (req, res) => {
  try {
    const { enemy } = req.body;
    const character = await Character.findOne({ userId: req.userId });
    
    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }
    
    // Can't flee from bosses
    if (enemy.isBoss) {
      return res.status(400).json({ error: 'Cannot flee from boss battles!' });
    }
    
    // Flee chance based on agility
    const fleeChance = 0.4 + (character.stats.agi * 0.01);
    const success = Math.random() < fleeChance;
    
    if (success) {
      return res.json({
        status: 'fled',
        message: '🏃 You successfully fled from battle!',
        success: true
      });
    }
    
    // Failed flee - enemy gets free attack
    const enemyDamage = calculateDamage(
      { baseAtk: enemy.atk },
      { stats: character.stats }
    );
    
    character.stats.hp -= enemyDamage.damage;
    
    if (character.stats.hp <= 0) {
      character.stats.hp = 0;
      character.statistics.deaths += 1;
    }
    
    await character.save();
    
    res.json({
      status: character.stats.hp <= 0 ? 'defeat' : 'ongoing',
      message: `Failed to flee! ${enemy.name} attacks for ${enemyDamage.damage} damage!`,
      success: false,
      enemy,
      character: {
        hp: character.stats.hp,
        maxHp: character.stats.maxHp
      }
    });
  } catch (error) {
    console.error('Flee error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/tower/advance - Move to next floor
router.post('/advance', authenticate, async (req, res) => {
  try {
    const character = await Character.findOne({ userId: req.userId });
    
    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }
    
    const tower = TOWERS[character.currentTower];
    
    if (character.currentFloor >= tower.floors) {
      // Tower completed!
      if (character.highestTowerCleared < character.currentTower) {
        character.highestTowerCleared = character.currentTower;
      }
      
      await character.save();
      
      return res.json({
        status: 'tower_complete',
        message: `🏆 Congratulations! You have conquered ${tower.name}!`,
        towerCleared: character.currentTower,
        nextTowerUnlocked: TOWERS[character.currentTower + 1] ? true : false
      });
    }
    
    character.currentFloor += 1;
    
    // Update highest floor reached
    if (character.currentTower === character.highestFloorReached.towerId) {
      if (character.currentFloor > character.highestFloorReached.floor) {
        character.highestFloorReached.floor = character.currentFloor;
      }
    } else if (character.currentTower > character.highestFloorReached.towerId) {
      character.highestFloorReached.towerId = character.currentTower;
      character.highestFloorReached.floor = character.currentFloor;
    }
    
    character.statistics.floorsCleared += 1;
    await character.save();
    
    // Check for special floors
    let floorType = 'normal';
    let floorMessage = `You advance to Floor ${character.currentFloor}`;
    
    if (character.currentFloor === 10) {
      floorType = 'safe_zone';
      floorMessage = '🏠 You reached the Safe Zone! (Floor 10)';
    } else if (character.currentFloor === 15) {
      floorType = 'boss';
      floorMessage = '⚠️ You stand before the Boss Room! (Floor 15)';
    } else if (character.currentFloor >= 13) {
      floorType = 'elite';
      floorMessage = `⚡ Elite Territory! (Floor ${character.currentFloor})`;
    }
    
    res.json({
      status: 'advanced',
      message: floorMessage,
      floor: character.currentFloor,
      floorType,
      tower: tower.name
    });
  } catch (error) {
    console.error('Advance error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Helper function to handle victory
async function handleVictory(character, enemy, res, combatLog) {
  const rewards = {
    exp: enemy.expReward,
    gold: calculateGoldDrop(enemy.goldReward),
    items: []
  };
  
  // Update character
  character.experience += rewards.exp;
  character.gold += rewards.gold;
  character.statistics.totalKills += 1;
  character.statistics.totalGoldEarned += rewards.gold;
  
  if (enemy.isElite) {
    character.statistics.eliteKills += 1;
  }
  if (enemy.isBoss) {
    character.statistics.bossKills += 1;
  }
  
  // Check for level up
  const leveledUp = character.checkLevelUp();
  
  // Roll for item drops
  const dropRate = enemy.isBoss ? DROP_RATES.boss : (enemy.isElite ? DROP_RATES.elite : DROP_RATES.normal);
  const equipmentTable = EQUIPMENT_DROPS[`tower${character.currentTower}`];
  const drops = rollForDrops(enemy, dropRate, equipmentTable, character.baseClass);
  
  // Add drops to inventory
  drops.forEach(item => {
    if (character.inventory.length < character.inventorySize) {
      character.inventory.push({
        itemId: item.id,
        name: item.name,
        type: item.type || 'equipment',
        rarity: item.rarity || 'common',
        quantity: item.quantity || 1,
        stats: item.stats
      });
      rewards.items.push(item);
    }
  });
  
  // Roll for hidden class scroll
  const scroll = rollForScroll(enemy, character.baseClass);
  if (scroll) {
    character.inventory.push({
      itemId: scroll.id,
      name: scroll.name,
      type: 'scroll',
      rarity: scroll.rarity,
      quantity: 1
    });
    rewards.items.push(scroll);
    rewards.scrollDropped = true;
    character.statistics.scrollsFound += 1;
    
    // Update hidden class quest if scroll obtained
    if (!character.hiddenClassQuest.scrollObtained) {
      character.hiddenClassQuest.scrollObtained = scroll.id;
    }
  }
  
  // Memory crystal drop from bosses
  if (enemy.isBoss && Math.random() < DROP_RATES.boss.memoryCrystal) {
    character.memoryCrystals += 1;
    rewards.memoryCrystal = true;
  }
  
  await character.save();
  
  combatLog.push({
    actor: 'system',
    action: 'victory',
    message: `🎉 Victory! Defeated ${enemy.name}!`
  });
  
  res.json({
    status: 'victory',
    message: `🎉 Victory! Defeated ${enemy.name}!`,
    combatLog,
    rewards,
    leveledUp,
    character: {
      level: character.level,
      experience: character.experience,
      experienceToNextLevel: character.experienceToNextLevel,
      gold: character.gold,
      statPoints: character.statPoints,
      hp: character.stats.hp,
      maxHp: character.stats.maxHp,
      mp: character.stats.mp,
      maxMp: character.stats.maxMp
    }
  });
}

export default router;
