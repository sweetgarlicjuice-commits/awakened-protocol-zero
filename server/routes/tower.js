import express from 'express';
import Character from '../models/Character.js';
import HiddenClassOwnership from '../models/HiddenClassOwnership.js';
import { authenticate } from '../middleware/auth.js';
import { TOWERS, ENEMIES, DROP_RATES, EQUIPMENT_DROPS } from '../data/gameData.js';
import { FLOOR_REQUIREMENTS, MATERIAL_DROPS, STORY_EVENTS, DOORKEEPER_DIALOGUES, HIDDEN_CLASS_INFO, CRAFTING_RECIPES, STORY_EVENTS_EXPANDED, FLOOR_REQUIREMENTS_EXPANDED } from '../data/storyData.js';
import { calculateDamage, scaleEnemyStats, getRandomEnemy, calculateGoldDrop, rollForDrops, rollForScroll } from '../utils/combat.js';

var router = express.Router();
var ENERGY_PER_FLOOR = 10;

function randomFrom(arr) {
  if (!arr || arr.length === 0) return '';
  return arr[Math.floor(Math.random() * arr.length)];
}

// Get story events for tower (with fallback to expanded)
function getStoryEvents(towerId) {
  var key = 'tower' + towerId;
  if (STORY_EVENTS && STORY_EVENTS[key]) return STORY_EVENTS[key];
  if (STORY_EVENTS_EXPANDED && STORY_EVENTS_EXPANDED[key]) return STORY_EVENTS_EXPANDED[key];
  return STORY_EVENTS.tower1;
}

// Get floor requirements (with fallback to expanded)
function getFloorRequirements(towerId) {
  var key = 'tower' + towerId;
  if (FLOOR_REQUIREMENTS && FLOOR_REQUIREMENTS[key]) return FLOOR_REQUIREMENTS[key];
  if (FLOOR_REQUIREMENTS_EXPANDED && FLOOR_REQUIREMENTS_EXPANDED[key]) return FLOOR_REQUIREMENTS_EXPANDED[key];
  return {};
}

// Helper function to generate consistent itemId from name
function generateItemId(name) {
  if (!name) return 'unknown_item';
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

// Helper function to add items with PROPER stacking
function addItemToInventory(character, itemId, name, icon, type, rarity, quantity, stats, sellPrice, subtype) {
  // Normalize itemId to ensure consistency
  var normalizedId = itemId || generateItemId(name);
  
  // Determine if stackable
  var isStackable = type === 'material' || type === 'consumable';
  
  // Check for existing item with SAME itemId (only for stackable items)
  if (isStackable) {
    var existingIndex = -1;
    for (var i = 0; i < character.inventory.length; i++) {
      if (character.inventory[i].itemId === normalizedId) {
        existingIndex = i;
        break;
      }
    }
    if (existingIndex >= 0) {
      character.inventory[existingIndex].quantity += quantity;
      return true;
    }
  }
  
  // Check inventory space
  if (character.inventory.length >= character.inventorySize) return false;
  
  // Add as new item
  character.inventory.push({
    itemId: normalizedId,
    name: name,
    icon: icon || '📦',
    type: type,
    subtype: subtype || type,
    rarity: rarity || 'common',
    quantity: quantity,
    stackable: isStackable,
    stats: stats || {},
    sellPrice: sellPrice || 5
  });
  return true;
}

function rollMaterialDrops(enemyId, towerId) {
  var drops = [];
  var materialTable = MATERIAL_DROPS ? MATERIAL_DROPS['tower' + towerId] : null;
  var enemyDrops = materialTable ? materialTable[enemyId] : null;
  if (!enemyDrops) return drops;
  
  for (var i = 0; i < enemyDrops.length; i++) {
    var drop = enemyDrops[i];
    if (Math.random() < drop.chance) {
      var minQty = drop.quantity.min || 1;
      var maxQty = drop.quantity.max || 1;
      var quantity = Math.floor(minQty + Math.random() * (maxQty - minQty + 1));
      
      // Use drop.id as itemId - this should match itemDatabase.js
      drops.push({ 
        itemId: drop.id, 
        name: drop.name, 
        icon: drop.icon || '📦', 
        type: 'material', 
        rarity: drop.rarity || 'common', 
        quantity: quantity, 
        sellPrice: drop.sellPrice || 5 
      });
    }
  }
  return drops;
}

// ============================================================
// 20 EXPLORATION SCENARIOS
// ============================================================

var EXPLORATION_SCENARIOS = [
  // 1. Three artifacts
  {
    id: 'three_artifacts',
    description: 'You find an ancient chamber with three pedestals. On them rest a 👑 Crown, a 💀 Skull, and a 🗡️ Sword.',
    choices: ['crown', 'skull', 'sword'],
    outcomes: {
      crown: { type: 'curse_lockout', message: 'The crown pulses with dark energy! A curse befalls you - you are banished from all towers!', lockoutMinutes: 15 },
      skull: { type: 'combat', message: 'The skull crumbles and reveals a guardian spirit!' },
      sword: { type: 'curse_damage', message: 'The sword was cursed! Dark energy drains your life force!', damagePercent: 30 }
    }
  },
  // 2. Left or right path
  {
    id: 'fork_path',
    description: 'The corridor splits into two paths. The LEFT path is dimly lit. The RIGHT path echoes with strange sounds.',
    choices: ['left', 'right'],
    outcomes: {
      left: { type: 'combat', message: 'An enemy was lurking in the shadows!' },
      right: { type: 'followup', nextScenario: 'voice_in_dark' }
    }
  },
  // 3. Voice in the dark (followup)
  {
    id: 'voice_in_dark',
    description: 'You hear a mysterious voice calling from deeper within. "Come... treasure awaits..."',
    choices: ['follow', 'ignore'],
    outcomes: {
      follow: { type: 'treasure', message: 'The voice led you to a hidden treasure chest!', chestChance: 0.3 },
      ignore: { type: 'combat', message: 'As you turn back, an enemy blocks your path!' }
    }
  },
  // 4. Trap corridor
  {
    id: 'trap_corridor',
    description: 'The floor ahead looks unstable. Do you proceed CAREFULLY or RUN across?',
    choices: ['carefully', 'run'],
    outcomes: {
      carefully: { type: 'safe', message: 'Your caution pays off. You navigate safely.' },
      run: { type: 'trap', message: 'You trigger a trap! Spikes pierce your legs!', damagePercent: 20 }
    }
  },
  // 5. Wounded traveler
  {
    id: 'wounded_traveler',
    description: 'You find a wounded traveler on the ground. They beg for HELP, or you could IGNORE them.',
    choices: ['help', 'ignore'],
    outcomes: {
      help: { type: 'reward', message: 'The traveler thanks you and shares their hidden stash!', goldReward: 50 },
      ignore: { type: 'combat', message: 'The "traveler" was a trap! An assassin attacks!' }
    }
  },
  // 6. Mysterious altar
  {
    id: 'mysterious_altar',
    description: 'An ancient altar glows with power. Do you PRAY at it or DESTROY it?',
    choices: ['pray', 'destroy'],
    outcomes: {
      pray: { type: 'blessing', message: 'The altar blesses you with renewed vigor!', healPercent: 30 },
      destroy: { type: 'curse_damage', message: 'Dark energy explodes from the altar!', damagePercent: 25 }
    }
  },
  // 7. Crumbling bridge
  {
    id: 'crumbling_bridge',
    description: 'A crumbling bridge spans a dark chasm. CROSS it or find ANOTHER way?',
    choices: ['cross', 'another'],
    outcomes: {
      cross: { type: 'random', success: { message: 'You make it across!' }, fail: { message: 'The bridge collapses! You barely survive!', damagePercent: 15 }, successChance: 0.6 },
      another: { type: 'combat', message: 'The detour leads you into an ambush!' }
    }
  },
  // 8. Treasure guardian
  {
    id: 'treasure_guardian',
    description: 'A treasure chest sits in the open, but a spectral guardian hovers nearby. FIGHT or SNEAK?',
    choices: ['fight', 'sneak'],
    outcomes: {
      fight: { type: 'combat_then_treasure', message: 'The guardian attacks!', chestChance: 0.8 },
      sneak: { type: 'random', success: { type: 'treasure', message: 'You grab the chest and escape!', chestChance: 0.6 }, fail: { type: 'combat', message: 'The guardian spots you!' }, successChance: 0.4 }
    }
  },
  // 9. Poison gas room
  {
    id: 'poison_gas',
    description: 'Green gas fills the chamber ahead. HOLD BREATH and run, or WAIT for it to clear?',
    choices: ['hold', 'wait'],
    outcomes: {
      hold: { type: 'random', success: { message: 'You make it through!' }, fail: { message: 'The gas overwhelms you!', damagePercent: 20 }, successChance: 0.5 },
      wait: { type: 'combat', message: 'While waiting, an enemy finds you!' }
    }
  },
  // 10. Ancient riddle
  {
    id: 'ancient_riddle',
    description: 'A stone door bears a riddle: "I have keys but no locks, space but no room." Answer KEYBOARD or PIANO?',
    choices: ['keyboard', 'piano'],
    outcomes: {
      keyboard: { type: 'treasure', message: 'Correct! The door reveals a hidden chamber!', chestChance: 0.5 },
      piano: { type: 'trap', message: 'Wrong! The door shoots darts at you!', damagePercent: 15 }
    }
  },
  // 11. Glowing mushrooms
  {
    id: 'glowing_mushrooms',
    description: 'Bioluminescent mushrooms light a cavern. EAT one for energy or IGNORE them?',
    choices: ['eat', 'ignore'],
    outcomes: {
      eat: { type: 'random', success: { type: 'heal', message: 'The mushroom restores your health!', healPercent: 20 }, fail: { type: 'damage', message: 'It was poisonous!', damagePercent: 25 }, successChance: 0.5 },
      ignore: { type: 'safe', message: 'You continue safely.' }
    }
  },
  // 12. Fallen warrior
  {
    id: 'fallen_warrior',
    description: 'A fallen warrior lies dead with their equipment. LOOT the body or pay RESPECTS?',
    choices: ['loot', 'respects'],
    outcomes: {
      loot: { type: 'combat', message: 'The warrior rises as an undead!' },
      respects: { type: 'reward', message: 'The spirit thanks you and grants a blessing!', goldReward: 30 }
    }
  },
  // 13. Magic mirror
  {
    id: 'magic_mirror',
    description: 'A magic mirror shows your reflection, but darker. TOUCH it or BREAK it?',
    choices: ['touch', 'break'],
    outcomes: {
      touch: { type: 'random', success: { message: 'You absorb power from your shadow!', healPercent: 15 }, fail: { message: 'Your shadow attacks you!', damagePercent: 20 }, successChance: 0.4 },
      break: { type: 'curse_damage', message: 'Seven years bad luck! Glass shards cut you!', damagePercent: 10 }
    }
  },
  // 14. Crying child
  {
    id: 'crying_child',
    description: 'You hear a child crying in the darkness. INVESTIGATE or FLEE?',
    choices: ['investigate', 'flee'],
    outcomes: {
      investigate: { type: 'random', success: { message: 'It was an illusion hiding treasure!', chestChance: 0.4 }, fail: { type: 'combat', message: 'It was a monster luring prey!' }, successChance: 0.3 },
      flee: { type: 'safe', message: 'You escape whatever lurked there.' }
    }
  },
  // 15. Gambling demon
  {
    id: 'gambling_demon',
    description: 'A demon offers a gamble: "Win, take treasure. Lose, pay with blood." ACCEPT or DECLINE?',
    choices: ['accept', 'decline'],
    outcomes: {
      accept: { type: 'random', success: { type: 'treasure', message: 'You win! The demon hands over riches!', chestChance: 0.7 }, fail: { message: 'You lose! The demon takes its due!', damagePercent: 35 }, successChance: 0.5 },
      decline: { type: 'combat', message: 'The demon is offended and attacks!' }
    }
  },
  // 16. Locked door
  {
    id: 'locked_door',
    description: 'A heavy locked door blocks your path. FORCE it open or search for a KEY?',
    choices: ['force', 'key'],
    outcomes: {
      force: { type: 'random', success: { message: 'You break through!' }, fail: { message: 'The door triggers an alarm! Guards arrive!', type: 'combat' }, successChance: 0.4 },
      key: { type: 'treasure', message: 'You find the key and a hidden cache behind the door!', chestChance: 0.3 }
    }
  },
  // 17. Water room
  {
    id: 'water_room',
    description: 'The room is flooded waist-high. WADE through or CLIMB the walls?',
    choices: ['wade', 'climb'],
    outcomes: {
      wade: { type: 'combat', message: 'Something in the water attacks!' },
      climb: { type: 'random', success: { message: 'You traverse safely!' }, fail: { message: 'You slip and fall into the water!', damagePercent: 10 }, successChance: 0.6 }
    }
  },
  // 18. Statue room
  {
    id: 'statue_room',
    description: 'A room full of warrior statues. One seems different. EXAMINE it or PASS through quickly?',
    choices: ['examine', 'pass'],
    outcomes: {
      examine: { type: 'treasure', message: 'Hidden treasure behind the statue!', chestChance: 0.4 },
      pass: { type: 'random', success: { message: 'You pass safely.' }, fail: { type: 'combat', message: 'A statue comes to life!' }, successChance: 0.7 }
    }
  },
  // 19. Echo chamber
  {
    id: 'echo_chamber',
    description: 'Your footsteps echo loudly. Move SILENTLY or keep NORMAL pace?',
    choices: ['silent', 'normal'],
    outcomes: {
      silent: { type: 'safe', message: 'You move undetected.' },
      normal: { type: 'combat', message: 'Your echoes attract attention!' }
    }
  },
  // 20. Cursed gold
  {
    id: 'cursed_gold',
    description: 'A pile of gold coins glitters ahead. TAKE the gold or LEAVE it?',
    choices: ['take', 'leave'],
    outcomes: {
      take: { type: 'random', success: { message: 'Real gold! Fortune smiles on you!', goldReward: 100 }, fail: { message: 'The gold was cursed! It burns your hands!', damagePercent: 20 }, successChance: 0.4 },
      leave: { type: 'safe', message: 'Wisdom over greed. You continue safely.' }
    }
  }
];

// ============================================================
// ROUTES
// ============================================================

router.get('/info', authenticate, async function(req, res) {
  try {
    var character = await Character.findOne({ userId: req.userId });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    var towerInfo = Object.values(TOWERS).map(function(tower) {
      return {
        id: tower.id,
        name: tower.name,
        description: tower.description,
        floors: tower.floors,
        levelRange: tower.levelRange,
        isUnlocked: !tower.requirement || character.highestTowerCleared >= tower.requirement.tower,
        currentFloor: character.currentTower === tower.id ? character.currentFloor : 1,
        highestFloor: character.towerProgress && character.towerProgress['tower' + tower.id] ? character.towerProgress['tower' + tower.id] : 1
      };
    });
    res.json({ towers: towerInfo, currentTower: character.currentTower, currentFloor: character.currentFloor });
  } catch (error) { res.status(500).json({ error: 'Server error' }); }
});

router.post('/enter', authenticate, async function(req, res) {
  try {
    var towerId = req.body.towerId;
    var character = await Character.findOne({ userId: req.userId });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    
    // Check tower lockout
    if (character.towerLockoutUntil && new Date() < character.towerLockoutUntil) {
      var remaining = Math.ceil((character.towerLockoutUntil - new Date()) / 60000);
      return res.status(400).json({ error: 'You are cursed! Cannot enter towers for ' + remaining + ' more minutes.' });
    }
    
    var tower = TOWERS[towerId];
    if (!tower) return res.status(400).json({ error: 'Invalid tower' });
    if (tower.requirement && character.highestTowerCleared < tower.requirement.tower) {
      return res.status(400).json({ error: 'Tower locked! Clear Tower ' + tower.requirement.tower + ' first.' });
    }
    character.currentTower = towerId;
    // Keep progress for this tower if any
    if (!character.towerProgress) character.towerProgress = {};
    var savedFloor = character.towerProgress['tower' + towerId] || 1;
    character.currentFloor = savedFloor;
    await character.save();
    res.json({ message: 'Entered ' + tower.name, tower: tower, currentFloor: character.currentFloor });
  } catch (error) { res.status(500).json({ error: 'Server error' }); }
});

// Get available floors for a tower
router.get('/floors/:towerId', authenticate, async function(req, res) {
  try {
    var towerId = req.params.towerId;
    var character = await Character.findOne({ userId: req.userId });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    var tower = TOWERS[parseInt(towerId)];
    if (!tower) return res.status(400).json({ error: 'Invalid tower' });
    
    // Get highest unlocked floor for this tower
    if (!character.towerProgress) character.towerProgress = {};
    var highestFloor = character.towerProgress['tower' + towerId] || 1;
    
    var floors = [];
    for (var i = 1; i <= tower.floors; i++) {
      floors.push({
        floor: i,
        unlocked: i <= highestFloor,
        isSafeZone: i === 10,
        isBoss: i === 15,
        isEliteZone: i >= 13 && i < 15
      });
    }
    res.json({ floors: floors, currentFloor: character.currentFloor, highestFloor: highestFloor });
  } catch (error) { res.status(500).json({ error: 'Server error' }); }
});

// Select floor to run
router.post('/select-floor', authenticate, async function(req, res) {
  try {
    var towerId = req.body.towerId;
    var floor = req.body.floor;
    var character = await Character.findOne({ userId: req.userId });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    var tower = TOWERS[parseInt(towerId)];
    if (!tower) return res.status(400).json({ error: 'Invalid tower' });
    
    if (!character.towerProgress) character.towerProgress = {};
    var highestFloor = character.towerProgress['tower' + towerId] || 1;
    
    if (floor < 1 || floor > tower.floors) return res.status(400).json({ error: 'Invalid floor' });
    if (floor > highestFloor) return res.status(400).json({ error: 'Floor not unlocked yet! Highest: ' + highestFloor });
    
    character.currentTower = parseInt(towerId);
    character.currentFloor = floor;
    await character.save();
    res.json({ message: 'Selected Floor ' + floor, currentFloor: floor, tower: tower.name });
  } catch (error) { res.status(500).json({ error: 'Server error' }); }
});

router.post('/explore', authenticate, async function(req, res) {
  try {
    var character = await Character.findOne({ userId: req.userId });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    
    // Check tower lockout
    if (character.towerLockoutUntil && new Date() < character.towerLockoutUntil) {
      var remaining = Math.ceil((character.towerLockoutUntil - new Date()) / 60000);
      return res.status(400).json({ error: 'You are cursed! Cannot explore for ' + remaining + ' more minutes.' });
    }
    
    if (character.energy < ENERGY_PER_FLOOR) return res.status(400).json({ error: 'Not enough energy! (Need ' + ENERGY_PER_FLOOR + ')' });
    if (character.stats.hp <= 0) return res.status(400).json({ error: 'You are defeated! Rest to recover.' });
    var floor = character.currentFloor;
    if (floor === 10) return res.json({ type: 'safe_zone', message: 'You reached the Safe Zone!', story: 'A peaceful sanctuary amidst the chaos.', floor: 10 });
    
    character.energy -= ENERGY_PER_FLOOR;
    await character.save();
    
    // Pick a random scenario
    var scenario = EXPLORATION_SCENARIOS[Math.floor(Math.random() * EXPLORATION_SCENARIOS.length)];
    
    res.json({ 
      type: 'exploration', 
      floor: floor, 
      scenarioId: scenario.id,
      story: scenario.description, 
      choices: scenario.choices, 
      energyRemaining: character.energy 
    });
  } catch (error) { res.status(500).json({ error: 'Server error' }); }
});

router.post('/choose-path', authenticate, async function(req, res) {
  try {
    var choice = req.body.choice;
    var scenarioId = req.body.scenarioId;
    var character = await Character.findOne({ userId: req.userId });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    var floor = character.currentFloor;
    var towerEnemies = ENEMIES['tower' + character.currentTower];
    
    // Find scenario
    var scenario = null;
    for (var i = 0; i < EXPLORATION_SCENARIOS.length; i++) {
      if (EXPLORATION_SCENARIOS[i].id === scenarioId) {
        scenario = EXPLORATION_SCENARIOS[i];
        break;
      }
    }
    if (!scenario) scenario = EXPLORATION_SCENARIOS[0];
    
    var outcome = scenario.outcomes[choice] || scenario.outcomes[scenario.choices[0]];
    
    // Process outcome
    var resultType = outcome.type;
    var message = outcome.message;
    var enemy = null;
    var treasure = null;
    var goldReward = 0;
    var healAmount = 0;
    var damageAmount = 0;
    var lockoutMinutes = 0;
    var nextScenario = null;
    
    // Handle random outcomes
    if (resultType === 'random') {
      var roll = Math.random();
      if (roll < (outcome.successChance || 0.5)) {
        // Success
        if (outcome.success.type) resultType = outcome.success.type;
        else resultType = 'safe';
        message = outcome.success.message;
        if (outcome.success.chestChance) treasure = { chestChance: outcome.success.chestChance };
        if (outcome.success.goldReward) goldReward = outcome.success.goldReward;
        if (outcome.success.healPercent) healAmount = Math.floor(character.stats.maxHp * outcome.success.healPercent / 100);
      } else {
        // Fail
        if (outcome.fail.type) resultType = outcome.fail.type;
        else resultType = 'damage';
        message = outcome.fail.message;
        if (outcome.fail.damagePercent) damageAmount = Math.floor(character.stats.maxHp * outcome.fail.damagePercent / 100);
      }
    }
    
    // Apply effects based on type
    switch (resultType) {
      case 'combat':
      case 'combat_then_treasure':
        // Spawn enemy
        if (floor === 15) {
          enemy = scaleEnemyStats(towerEnemies.boss, floor, character.currentTower);
        } else if (floor >= 13 && Math.random() < 0.4) {
          enemy = getRandomEnemy(towerEnemies.elite, floor);
          enemy = scaleEnemyStats(enemy, floor, character.currentTower);
        } else {
          enemy = getRandomEnemy(towerEnemies.normal, floor);
          enemy = scaleEnemyStats(enemy, floor, character.currentTower);
        }
        if (resultType === 'combat_then_treasure') treasure = { chestChance: outcome.chestChance || 0.5 };
        break;
        
      case 'curse_lockout':
        lockoutMinutes = outcome.lockoutMinutes || 15;
        character.towerLockoutUntil = new Date(Date.now() + lockoutMinutes * 60000);
        character.currentFloor = 1; // Kicked from tower
        await character.save();
        return res.json({ type: 'curse_lockout', message: message, lockoutMinutes: lockoutMinutes, floor: 1 });
        
      case 'curse_damage':
      case 'trap':
      case 'damage':
        damageAmount = Math.floor(character.stats.maxHp * (outcome.damagePercent || 20) / 100);
        character.stats.hp = Math.max(1, character.stats.hp - damageAmount);
        await character.save();
        return res.json({ type: 'damage', message: message, damage: damageAmount, hp: character.stats.hp, maxHp: character.stats.maxHp });
        
      case 'blessing':
      case 'heal':
        healAmount = Math.floor(character.stats.maxHp * (outcome.healPercent || 20) / 100);
        character.stats.hp = Math.min(character.stats.maxHp, character.stats.hp + healAmount);
        await character.save();
        return res.json({ type: 'heal', message: message, heal: healAmount, hp: character.stats.hp, maxHp: character.stats.maxHp });
        
      case 'reward':
        goldReward = outcome.goldReward || 50;
        character.gold += goldReward;
        await character.save();
        return res.json({ type: 'reward', message: message, gold: goldReward, totalGold: character.gold });
        
      case 'treasure':
        var chestChance = outcome.chestChance || 0.3;
        if (Math.random() < chestChance) {
          // Found chest - give gold + maybe item
          var chestGold = Math.floor(50 + Math.random() * 100);
          character.gold += chestGold;
          await character.save();
          return res.json({ type: 'treasure', message: message + ' You found ' + chestGold + ' gold!', gold: chestGold, totalGold: character.gold, foundChest: true });
        } else {
          return res.json({ type: 'treasure_miss', message: message + ' But the chest was empty...', foundChest: false });
        }
        
      case 'followup':
        for (var j = 0; j < EXPLORATION_SCENARIOS.length; j++) {
          if (EXPLORATION_SCENARIOS[j].id === outcome.nextScenario) {
            nextScenario = EXPLORATION_SCENARIOS[j];
            break;
          }
        }
        if (nextScenario) {
          return res.json({ type: 'exploration', floor: floor, scenarioId: nextScenario.id, story: nextScenario.description, choices: nextScenario.choices, followup: true });
        }
        break;
        
      case 'safe':
      default:
        return res.json({ type: 'safe', message: message, floor: floor });
    }
    
    // If we have an enemy, start combat
    if (enemy) {
      await character.save();
      return res.json({ type: 'combat_start', story: message, enemy: enemy, floor: floor, isBoss: enemy.isBoss || false, isElite: enemy.isElite || false, treasureAfter: treasure });
    }
    
    res.json({ type: 'safe', message: message || 'You continue onward.', floor: floor });
  } catch (error) { 
    console.error(error);
    res.status(500).json({ error: 'Server error' }); 
  }
});

router.post('/combat/attack', authenticate, async function(req, res) {
  try {
    var enemy = req.body.enemy;
    var treasureAfter = req.body.treasureAfter;
    var character = await Character.findOne({ userId: req.userId });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    var combatLog = [];
    var playerDamage = calculateDamage({ stats: character.stats, baseClass: character.baseClass }, enemy);
    enemy.hp -= playerDamage.damage;
    combatLog.push({ actor: 'player', damage: playerDamage.damage, isCritical: playerDamage.isCritical, message: playerDamage.isCritical ? 'CRITICAL! You deal ' + playerDamage.damage + ' damage!' : 'You attack for ' + playerDamage.damage + ' damage!' });
    if (enemy.hp <= 0) return await handleVictory(character, enemy, res, combatLog, treasureAfter);
    var enemyDamage = calculateDamage({ baseAtk: enemy.atk }, { stats: character.stats });
    character.stats.hp -= enemyDamage.damage;
    combatLog.push({ actor: 'enemy', damage: enemyDamage.damage, message: enemy.name + ' attacks for ' + enemyDamage.damage + ' damage!' });
    if (character.stats.hp <= 0) return await handleDefeat(character, res, combatLog);
    await character.save();
    res.json({ status: 'ongoing', combatLog: combatLog, enemy: { name: enemy.name, hp: Math.max(0, enemy.hp), maxHp: enemy.maxHp, atk: enemy.atk, isBoss: enemy.isBoss, isElite: enemy.isElite }, character: { hp: character.stats.hp, maxHp: character.stats.maxHp, mp: character.stats.mp, maxMp: character.stats.maxMp } });
  } catch (error) { res.status(500).json({ error: 'Server error' }); }
});

router.post('/combat/skill', authenticate, async function(req, res) {
  try {
    var enemy = req.body.enemy;
    var skillId = req.body.skillId;
    var treasureAfter = req.body.treasureAfter;
    var character = await Character.findOne({ userId: req.userId });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    
    var characterSkill = null;
    for (var i = 0; i < character.skills.length; i++) {
      if (character.skills[i].skillId === skillId) {
        characterSkill = character.skills[i];
        break;
      }
    }
    if (!characterSkill || !characterSkill.unlocked) return res.status(400).json({ error: 'Skill not available' });
    
    var SKILL_DATA = {
      slash: { name: 'Slash', mpCost: 5, damage: 1.3 }, heavyStrike: { name: 'Heavy Strike', mpCost: 12, damage: 1.8 },
      shieldBash: { name: 'Shield Bash', mpCost: 8, damage: 1.0 }, warCry: { name: 'War Cry', mpCost: 15, damage: 0 },
      backstab: { name: 'Backstab', mpCost: 8, damage: 2.2, critBonus: 0.4 }, poisonBlade: { name: 'Poison Blade', mpCost: 10, damage: 1.3 },
      smokeScreen: { name: 'Smoke Screen', mpCost: 12, damage: 0 }, steal: { name: 'Steal', mpCost: 5, damage: 0 },
      preciseShot: { name: 'Precise Shot', mpCost: 6, damage: 1.6 }, multiShot: { name: 'Multi Shot', mpCost: 14, damage: 0.6, hits: 3 },
      eagleEye: { name: 'Eagle Eye', mpCost: 10, damage: 0 }, arrowRain: { name: 'Arrow Rain', mpCost: 20, damage: 2.0 },
      fireball: { name: 'Fireball', mpCost: 10, damage: 1.8 }, iceSpear: { name: 'Ice Spear', mpCost: 12, damage: 1.5 },
      manaShield: { name: 'Mana Shield', mpCost: 15, damage: 0 }, thunderbolt: { name: 'Thunderbolt', mpCost: 18, damage: 2.2 },
      flame_slash: { name: 'Flame Slash', mpCost: 15, damage: 2.0 }, inferno_strike: { name: 'Inferno Strike', mpCost: 25, damage: 2.8 },
      fire_aura: { name: 'Fire Aura', mpCost: 20, damage: 0 }, volcanic_rage: { name: 'Volcanic Rage', mpCost: 40, damage: 3.5 },
      shadow_strike: { name: 'Shadow Strike', mpCost: 12, damage: 2.5, critBonus: 0.5 }, vanish: { name: 'Vanish', mpCost: 20, damage: 0 },
      death_mark: { name: 'Death Mark', mpCost: 18, damage: 1.5 }, shadow_dance: { name: 'Shadow Dance', mpCost: 35, damage: 2.0, hits: 5 },
      lightning_arrow: { name: 'Lightning Arrow', mpCost: 14, damage: 2.2 }, chain_lightning: { name: 'Chain Lightning', mpCost: 22, damage: 1.8, hits: 3 },
      storm_eye: { name: 'Storm Eye', mpCost: 18, damage: 0 }, thunderstorm: { name: 'Thunderstorm', mpCost: 45, damage: 3.0 },
      frost_bolt: { name: 'Frost Bolt', mpCost: 12, damage: 2.0 }, blizzard: { name: 'Blizzard', mpCost: 28, damage: 2.2 },
      ice_armor: { name: 'Ice Armor', mpCost: 20, damage: 0 }, absolute_zero: { name: 'Absolute Zero', mpCost: 50, damage: 4.0 }
    };
    
    var skill = SKILL_DATA[skillId];
    if (!skill) return res.status(400).json({ error: 'Invalid skill' });
    if (character.stats.mp < skill.mpCost) return res.status(400).json({ error: 'Not enough MP!' });
    
    var combatLog = [];
    character.stats.mp -= skill.mpCost;
    
    if (skill.damage > 0) {
      var totalDamage = 0;
      var hits = skill.hits || 1;
      for (var h = 0; h < hits; h++) {
        var result = calculateDamage({ stats: character.stats, baseClass: character.baseClass }, enemy, skill);
        totalDamage += result.damage;
      }
      enemy.hp -= totalDamage;
      combatLog.push({ actor: 'player', skillName: skill.name, damage: totalDamage, mpCost: skill.mpCost, message: skill.name + '! ' + totalDamage + ' damage! (-' + skill.mpCost + ' MP)' });
    } else {
      combatLog.push({ actor: 'player', skillName: skill.name, mpCost: skill.mpCost, message: skill.name + ' activated! (-' + skill.mpCost + ' MP)' });
    }
    
    if (enemy.hp <= 0) return await handleVictory(character, enemy, res, combatLog, treasureAfter);
    
    var enemyDamage = calculateDamage({ baseAtk: enemy.atk }, { stats: character.stats });
    character.stats.hp -= enemyDamage.damage;
    combatLog.push({ actor: 'enemy', damage: enemyDamage.damage, message: enemy.name + ' attacks for ' + enemyDamage.damage + ' damage!' });
    
    if (character.stats.hp <= 0) return await handleDefeat(character, res, combatLog);
    
    await character.save();
    res.json({ status: 'ongoing', combatLog: combatLog, enemy: { name: enemy.name, hp: Math.max(0, enemy.hp), maxHp: enemy.maxHp, atk: enemy.atk, isBoss: enemy.isBoss, isElite: enemy.isElite }, character: { hp: character.stats.hp, maxHp: character.stats.maxHp, mp: character.stats.mp, maxMp: character.stats.maxMp } });
  } catch (error) { res.status(500).json({ error: 'Server error' }); }
});

router.post('/combat/flee', authenticate, async function(req, res) {
  try {
    var enemy = req.body.enemy;
    var character = await Character.findOne({ userId: req.userId });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    if (enemy.isBoss) return res.status(400).json({ error: 'Cannot flee from boss battles!' });
    var fleeChance = 0.4 + (character.stats.agi * 0.01);
    if (Math.random() < fleeChance) return res.json({ status: 'fled', message: 'You successfully fled!', success: true });
    var enemyDamage = calculateDamage({ baseAtk: enemy.atk }, { stats: character.stats });
    character.stats.hp -= enemyDamage.damage;
    if (character.stats.hp <= 0) return await handleDefeat(character, res, [{ actor: 'system', message: 'Failed to flee! ' + enemy.name + ' strikes you down!' }]);
    await character.save();
    res.json({ status: 'ongoing', message: 'Failed to flee! ' + enemy.name + ' attacks for ' + enemyDamage.damage + ' damage!', success: false, enemy: enemy, character: { hp: character.stats.hp, maxHp: character.stats.maxHp } });
  } catch (error) { res.status(500).json({ error: 'Server error' }); }
});

router.post('/use-potion', authenticate, async function(req, res) {
  try {
    var potionType = req.body.potionType;
    var character = await Character.findOne({ userId: req.userId });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    var potionId = potionType === 'hp' ? 'health_potion_small' : 'mana_potion_small';
    var itemIndex = -1;
    for (var i = 0; i < character.inventory.length; i++) {
      if (character.inventory[i].itemId === potionId) {
        itemIndex = i;
        break;
      }
    }
    if (itemIndex === -1) return res.status(400).json({ error: 'No ' + potionType.toUpperCase() + ' potions available!' });
    if (character.inventory[itemIndex].quantity > 1) character.inventory[itemIndex].quantity -= 1;
    else character.inventory.splice(itemIndex, 1);
    if (potionType === 'hp') character.stats.hp = Math.min(character.stats.hp + 50, character.stats.maxHp);
    else character.stats.mp = Math.min(character.stats.mp + 30, character.stats.maxMp);
    await character.save();
    res.json({ message: 'Used ' + potionType.toUpperCase() + ' potion!', character: { hp: character.stats.hp, maxHp: character.stats.maxHp, mp: character.stats.mp, maxMp: character.stats.maxMp } });
  } catch (error) { res.status(500).json({ error: 'Server error' }); }
});

router.get('/floor-requirements', authenticate, async function(req, res) {
  try {
    var character = await Character.findOne({ userId: req.userId });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    var requirements = getFloorRequirements(character.currentTower);
    var floorReq = requirements ? requirements[character.currentFloor] : null;
    var playerItems = {};
    for (var i = 0; i < character.inventory.length; i++) {
      var item = character.inventory[i];
      playerItems[item.itemId] = (playerItems[item.itemId] || 0) + item.quantity;
    }
    var canAdvance = true;
    if (floorReq) {
      if (floorReq.items && floorReq.items.length > 0) {
        for (var j = 0; j < floorReq.items.length; j++) {
          if ((playerItems[floorReq.items[j].id] || 0) < floorReq.items[j].quantity) {
            canAdvance = false;
            break;
          }
        }
      }
      if (character.gold < (floorReq.gold || 0)) canAdvance = false;
    }
    res.json({ floor: character.currentFloor, nextFloor: character.currentFloor + 1, requirements: floorReq, playerItems: playerItems, playerGold: character.gold, canAdvance: canAdvance, doorkeeper: randomFrom(DOORKEEPER_DIALOGUES.greeting) });
  } catch (error) { res.status(500).json({ error: 'Server error' }); }
});

router.post('/advance', authenticate, async function(req, res) {
  try {
    var character = await Character.findOne({ userId: req.userId });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    var tower = TOWERS[character.currentTower];
    var requirements = getFloorRequirements(character.currentTower);
    var floorReq = requirements ? requirements[character.currentFloor] : null;
    
    if (floorReq && floorReq.items && floorReq.items.length > 0) {
      for (var i = 0; i < floorReq.items.length; i++) {
        var req = floorReq.items[i];
        var itemIndex = -1;
        for (var j = 0; j < character.inventory.length; j++) {
          if (character.inventory[j].itemId === req.id) {
            itemIndex = j;
            break;
          }
        }
        var itemQuantity = itemIndex >= 0 ? character.inventory[itemIndex].quantity : 0;
        if (itemQuantity < req.quantity) return res.status(400).json({ error: randomFrom(DOORKEEPER_DIALOGUES.failure), missing: { id: req.id, name: req.name, need: req.quantity, have: itemQuantity } });
      }
      for (var k = 0; k < floorReq.items.length; k++) {
        var req2 = floorReq.items[k];
        var itemIndex2 = -1;
        for (var l = 0; l < character.inventory.length; l++) {
          if (character.inventory[l].itemId === req2.id) {
            itemIndex2 = l;
            break;
          }
        }
        if (character.inventory[itemIndex2].quantity > req2.quantity) character.inventory[itemIndex2].quantity -= req2.quantity;
        else character.inventory.splice(itemIndex2, 1);
      }
    }
    
    if (floorReq && floorReq.gold && character.gold < floorReq.gold) return res.status(400).json({ error: randomFrom(DOORKEEPER_DIALOGUES.failure), missing: { id: 'gold', name: 'Gold', need: floorReq.gold, have: character.gold } });
    if (floorReq && floorReq.gold) character.gold -= floorReq.gold;
    
    if (character.currentFloor >= tower.floors) {
      if (character.highestTowerCleared < character.currentTower) character.highestTowerCleared = character.currentTower;
      await character.save();
      return res.json({ status: 'tower_complete', message: 'Congratulations! You conquered ' + tower.name + '!', towerCleared: character.currentTower, nextTowerUnlocked: !!TOWERS[character.currentTower + 1] });
    }
    character.currentFloor += 1;
    // Save progress
    if (!character.towerProgress) character.towerProgress = {};
    if (character.currentFloor > (character.towerProgress['tower' + character.currentTower] || 1)) {
      character.towerProgress['tower' + character.currentTower] = character.currentFloor;
    }
    character.markModified('towerProgress');
    await character.save();
    res.json({ status: 'advanced', message: randomFrom(DOORKEEPER_DIALOGUES.success), newFloor: character.currentFloor, doorkeeper: randomFrom(DOORKEEPER_DIALOGUES.success) });
  } catch (error) { res.status(500).json({ error: 'Server error' }); }
});

router.post('/leave', authenticate, async function(req, res) {
  try {
    var character = await Character.findOne({ userId: req.userId });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    var checkpoint = character.currentFloor >= 10 ? 10 : 1;
    // Save progress before leaving
    if (!character.towerProgress) character.towerProgress = {};
    character.towerProgress['tower' + character.currentTower] = Math.max(character.towerProgress['tower' + character.currentTower] || 1, checkpoint);
    character.currentFloor = checkpoint;
    character.markModified('towerProgress');
    await character.save();
    res.json({ message: 'You left the tower. Progress saved at floor ' + checkpoint, resetFloor: checkpoint });
  } catch (error) { res.status(500).json({ error: 'Server error' }); }
});

router.get('/hidden-classes', authenticate, async function(req, res) {
  try {
    var character = await Character.findOne({ userId: req.userId });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    var classInfo = HIDDEN_CLASS_INFO;
    var availability = {};
    var classIds = Object.keys(classInfo);
    for (var i = 0; i < classIds.length; i++) {
      var classId = classIds[i];
      var isAvailable = await HiddenClassOwnership.isClassAvailable(classId);
      availability[classId] = { 
        name: classInfo[classId].name,
        description: classInfo[classId].description,
        baseClass: classInfo[classId].baseClass,
        skills: classInfo[classId].skills,
        isAvailable: isAvailable, 
        matchesBase: classInfo[classId].baseClass === character.baseClass 
      };
    }
    res.json({ classes: availability, playerBaseClass: character.baseClass, playerHiddenClass: character.hiddenClass });
  } catch (error) { res.status(500).json({ error: 'Server error' }); }
});

router.post('/unlock-hidden-class', authenticate, async function(req, res) {
  try {
    var scrollItemIndex = req.body.scrollItemIndex;
    var character = await Character.findOne({ userId: req.userId });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    if (character.hiddenClass !== 'none') return res.status(400).json({ error: 'You already have a hidden class!' });
    var scrollItem = character.inventory[scrollItemIndex];
    if (!scrollItem || scrollItem.type !== 'scroll') return res.status(400).json({ error: 'Invalid scroll' });
    var scrollToClass = { 
      'scroll_flameblade': { classId: 'flameblade', baseReq: 'swordsman' }, 
      'scroll_shadow_dancer': { classId: 'shadowDancer', baseReq: 'thief' }, 
      'scroll_storm_ranger': { classId: 'stormRanger', baseReq: 'archer' }, 
      'scroll_frost_weaver': { classId: 'frostWeaver', baseReq: 'mage' } 
    };
    var mapping = scrollToClass[scrollItem.itemId];
    if (!mapping) return res.status(400).json({ error: 'Invalid scroll type' });
    if (character.baseClass !== mapping.baseReq) return res.status(400).json({ error: 'This scroll requires ' + mapping.baseReq + ' class!' });
    var classInfo = HIDDEN_CLASS_INFO[mapping.classId];
    if (!classInfo) return res.status(400).json({ error: 'Invalid hidden class' });
    var claimed = await HiddenClassOwnership.claimClass(mapping.classId, req.userId);
    if (!claimed) return res.status(400).json({ error: 'This hidden class is already owned by another player!' });
    character.hiddenClass = mapping.classId;
    for (var i = 0; i < classInfo.skills.length; i++) {
      character.skills.push({ skillId: classInfo.skills[i].skillId, name: classInfo.skills[i].name, unlocked: true });
    }
    character.inventory.splice(scrollItemIndex, 1);
    character.statistics.hiddenClassUnlocked = true;
    await character.save();
    res.json({ message: 'You have awakened as a ' + classInfo.name + '!', hiddenClass: classInfo, newSkills: classInfo.skills });
  } catch (error) { res.status(500).json({ error: 'Server error' }); }
});

router.post('/remove-hidden-class', authenticate, async function(req, res) {
  try {
    var character = await Character.findOne({ userId: req.userId });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    if (character.hiddenClass === 'none') return res.status(400).json({ error: 'You do not have a hidden class!' });
    var crystalIndex = -1;
    for (var i = 0; i < character.inventory.length; i++) {
      if (character.inventory[i].itemId === 'memory_crystal') {
        crystalIndex = i;
        break;
      }
    }
    if (crystalIndex === -1) return res.status(400).json({ error: 'You need a Memory Crystal to remove your hidden class!' });
    var classToScroll = { 
      'flameblade': 'scroll_flameblade', 
      'shadowDancer': 'scroll_shadow_dancer', 
      'stormRanger': 'scroll_storm_ranger', 
      'frostWeaver': 'scroll_frost_weaver' 
    };
    var scrollId = classToScroll[character.hiddenClass];
    var scrollNames = { 
      'scroll_flameblade': 'Flameblade Scroll', 
      'scroll_shadow_dancer': 'Shadow Dancer Scroll', 
      'scroll_storm_ranger': 'Storm Ranger Scroll', 
      'scroll_frost_weaver': 'Frost Weaver Scroll' 
    };
    await HiddenClassOwnership.releaseClass(character.hiddenClass);
    var hiddenClassInfo = HIDDEN_CLASS_INFO[character.hiddenClass];
    if (hiddenClassInfo) {
      var hiddenSkillIds = [];
      for (var j = 0; j < hiddenClassInfo.skills.length; j++) {
        hiddenSkillIds.push(hiddenClassInfo.skills[j].skillId);
      }
      var newSkills = [];
      for (var k = 0; k < character.skills.length; k++) {
        if (hiddenSkillIds.indexOf(character.skills[k].skillId) === -1) {
          newSkills.push(character.skills[k]);
        }
      }
      character.skills = newSkills;
    }
    character.hiddenClass = 'none';
    if (character.inventory[crystalIndex].quantity > 1) character.inventory[crystalIndex].quantity -= 1;
    else character.inventory.splice(crystalIndex, 1);
    character.inventory.push({ itemId: scrollId, name: scrollNames[scrollId], icon: '📜', type: 'scroll', rarity: 'legendary', quantity: 1 });
    await character.save();
    res.json({ message: 'Hidden class removed! The scroll has returned to your inventory.', scrollReturned: scrollNames[scrollId] });
  } catch (error) { res.status(500).json({ error: 'Server error' }); }
});

router.post('/craft', authenticate, async function(req, res) {
  try {
    var recipeId = req.body.recipeId;
    var character = await Character.findOne({ userId: req.userId });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    var recipe = CRAFTING_RECIPES[recipeId];
    if (!recipe) return res.status(400).json({ error: 'Invalid recipe' });
    
    for (var i = 0; i < recipe.ingredients.length; i++) {
      var ingredient = recipe.ingredients[i];
      var itemIndex = -1;
      for (var j = 0; j < character.inventory.length; j++) {
        if (character.inventory[j].itemId === ingredient.id) {
          itemIndex = j;
          break;
        }
      }
      var quantity = itemIndex >= 0 ? character.inventory[itemIndex].quantity : 0;
      if (quantity < ingredient.quantity) return res.status(400).json({ error: 'Not enough ' + ingredient.name + '! Need ' + ingredient.quantity + ', have ' + quantity });
    }
    
    for (var k = 0; k < recipe.ingredients.length; k++) {
      var ingredient2 = recipe.ingredients[k];
      var itemIndex2 = -1;
      for (var l = 0; l < character.inventory.length; l++) {
        if (character.inventory[l].itemId === ingredient2.id) {
          itemIndex2 = l;
          break;
        }
      }
      if (character.inventory[itemIndex2].quantity > ingredient2.quantity) character.inventory[itemIndex2].quantity -= ingredient2.quantity;
      else character.inventory.splice(itemIndex2, 1);
    }
    
    addItemToInventory(character, recipe.result.id, recipe.result.name || recipe.name, recipe.icon, 'material', 'epic', recipe.result.quantity, {}, 100);
    await character.save();
    res.json({ message: 'Crafted ' + recipe.name + '!', item: recipe.result });
  } catch (error) { res.status(500).json({ error: 'Server error' }); }
});

// ============================================================
// HELPER FUNCTIONS
// ============================================================

async function handleVictory(character, enemy, res, combatLog, treasureAfter) {
  var rewards = { exp: enemy.expReward, gold: calculateGoldDrop(enemy.goldReward), items: [] };
  character.experience += rewards.exp;
  character.gold += rewards.gold;
  character.statistics.totalKills += 1;
  character.statistics.totalGoldEarned += rewards.gold;
  if (enemy.isElite) character.statistics.eliteKills += 1;
  if (enemy.isBoss) character.statistics.bossKills += 1;
  var leveledUp = character.checkLevelUp();
  
  // Material drops - Use consistent itemId
  var materialDrops = rollMaterialDrops(enemy.id, character.currentTower);
  for (var i = 0; i < materialDrops.length; i++) {
    var drop = materialDrops[i];
    addItemToInventory(character, drop.itemId, drop.name, drop.icon, drop.type, drop.rarity, drop.quantity, {}, drop.sellPrice, 'material');
    rewards.items.push(drop);
  }
  
  // Equipment drops
  var dropRate = enemy.isBoss ? DROP_RATES.boss : (enemy.isElite ? DROP_RATES.elite : DROP_RATES.normal);
  var equipmentTable = EQUIPMENT_DROPS ? EQUIPMENT_DROPS['tower' + character.currentTower] : null;
  var equipDrops = rollForDrops(enemy, dropRate, equipmentTable, character.baseClass, character.currentTower);
  
  for (var j = 0; j < equipDrops.length; j++) {
    var item = equipDrops[j];
    if (character.inventory.length < character.inventorySize) {
      // Generate consistent itemId for equipment
      var itemId = item.itemId || item.id || generateItemId(item.name);
      addItemToInventory(character, itemId, item.name, item.icon || '⚔️', item.type || 'equipment', item.rarity, item.quantity || 1, item.stats, item.sellPrice || 10, item.subtype || 'equipment');
      rewards.items.push(item);
    }
  }
  
  // Scroll drops
  var scroll = rollForScroll(enemy, character.baseClass);
  if (scroll) {
    var classIdMap = { 
      'scroll_flameblade': 'flameblade', 
      'scroll_shadow_dancer': 'shadowDancer', 
      'scroll_storm_ranger': 'stormRanger', 
      'scroll_frost_weaver': 'frostWeaver' 
    };
    var mappedClassId = classIdMap[scroll.id];
    try {
      if (mappedClassId) {
        var isAvailable = await HiddenClassOwnership.isClassAvailable(mappedClassId);
        if (isAvailable) {
          addItemToInventory(character, scroll.id, scroll.name, '📜', 'scroll', 'legendary', 1, {}, 0, 'scroll');
          rewards.items.push(scroll);
          rewards.scrollDropped = true;
          character.statistics.scrollsFound += 1;
        }
      }
    } catch (e) {}
  }
  
  // Memory crystal fragment
  if (enemy.isBoss && Math.random() < 0.1) {
    addItemToInventory(character, 'memory_crystal_fragment', 'Memory Crystal Fragment', '💠', 'material', 'epic', 1, {}, 100, 'special');
    rewards.items.push({ name: 'Memory Crystal Fragment', icon: '💠' });
    rewards.memoryCrystalFragment = true;
  }
  
  // Treasure after combat (from scenario)
  if (treasureAfter && treasureAfter.chestChance && Math.random() < treasureAfter.chestChance) {
    var chestGold = Math.floor(50 + Math.random() * 100);
    character.gold += chestGold;
    rewards.treasureGold = chestGold;
  }
  
  // Update tower progress
  if (!character.towerProgress) character.towerProgress = {};
  if (character.currentFloor > (character.towerProgress['tower' + character.currentTower] || 1)) {
    character.towerProgress['tower' + character.currentTower] = character.currentFloor;
  }
  character.markModified('towerProgress');
  
  await character.save();
  var towerStory = getStoryEvents(character.currentTower);
  combatLog.push({ actor: 'system', message: 'Victory! Defeated ' + enemy.name + '!' });
  res.json({ 
    status: 'victory', 
    message: randomFrom(towerStory.victory).replace('{enemy}', enemy.name), 
    combatLog: combatLog, 
    rewards: rewards, 
    leveledUp: leveledUp, 
    restPrompt: randomFrom(towerStory.rest_prompt), 
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

async function handleDefeat(character, res, combatLog) {
  character.stats.hp = 0;
  character.statistics.deaths += 1;
  var checkpoint = character.currentFloor < 10 ? 1 : 10;
  character.currentFloor = checkpoint;
  // Update tower progress to checkpoint
  if (!character.towerProgress) character.towerProgress = {};
  character.towerProgress['tower' + character.currentTower] = Math.max(character.towerProgress['tower' + character.currentTower] || 1, checkpoint);
  character.markModified('towerProgress');
  await character.save();
  combatLog.push({ actor: 'system', message: 'You have been defeated!' });
  res.json({ status: 'defeat', message: 'Defeated! Progress reset to checkpoint.', combatLog: combatLog, resetFloor: checkpoint, character: { hp: 0, maxHp: character.stats.maxHp } });
}

export default router;
