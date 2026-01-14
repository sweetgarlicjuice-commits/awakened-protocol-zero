import express from 'express';
import Character from '../models/Character.js';
import HiddenClassOwnership from '../models/HiddenClassOwnership.js';
import { authenticate } from '../middleware/auth.js';
import { TOWERS, ENEMIES, DROP_RATES, EQUIPMENT_DROPS } from '../data/gameData.js';
import { FLOOR_REQUIREMENTS, MATERIAL_DROPS, STORY_EVENTS, DOORKEEPER_DIALOGUES, HIDDEN_CLASS_INFO, CRAFTING_RECIPES, STORY_EVENTS_EXPANDED, FLOOR_REQUIREMENTS_EXPANDED } from '../data/storyData.js';
import { calculateDamage, scaleEnemyStats, getRandomEnemy, calculateGoldDrop, rollForDrops, rollForScroll } from '../utils/combat.js';

const router = express.Router();
const ENERGY_PER_FLOOR = 10;
const randomFrom = (arr) => arr && arr.length > 0 ? arr[Math.floor(Math.random() * arr.length)] : '';

// Get story events for tower (with fallback to expanded)
function getStoryEvents(towerId) {
  const key = 'tower' + towerId;
  if (STORY_EVENTS && STORY_EVENTS[key]) return STORY_EVENTS[key];
  if (STORY_EVENTS_EXPANDED && STORY_EVENTS_EXPANDED[key]) return STORY_EVENTS_EXPANDED[key];
  return STORY_EVENTS.tower1;
}

// Get floor requirements (with fallback to expanded)
function getFloorRequirements(towerId) {
  const key = 'tower' + towerId;
  if (FLOOR_REQUIREMENTS && FLOOR_REQUIREMENTS[key]) return FLOOR_REQUIREMENTS[key];
  if (FLOOR_REQUIREMENTS_EXPANDED && FLOOR_REQUIREMENTS_EXPANDED[key]) return FLOOR_REQUIREMENTS_EXPANDED[key];
  return {};
}

// Helper function to add items with PROPER stacking
function addItemToInventory(character, itemId, name, icon, type, rarity, quantity, stats, sellPrice) {
  // Check for existing item with SAME itemId
  const existingIndex = character.inventory.findIndex(i => i.itemId === itemId);
  if (existingIndex >= 0) {
    character.inventory[existingIndex].quantity += quantity;
    return true;
  }
  if (character.inventory.length >= character.inventorySize) return false;
  character.inventory.push({
    itemId: itemId,
    name: name,
    icon: icon || '📦',
    type: type,
    subtype: type,
    rarity: rarity || 'common',
    quantity: quantity,
    stackable: type === 'material' || type === 'consumable',
    stats: stats || {},
    sellPrice: sellPrice || 5
  });
  return true;
}

function rollMaterialDrops(enemyId, towerId) {
  const drops = [];
  const materialTable = MATERIAL_DROPS ? MATERIAL_DROPS['tower' + towerId] : null;
  const enemyDrops = materialTable ? materialTable[enemyId] : null;
  if (!enemyDrops) return drops;
  for (const drop of enemyDrops) {
    if (Math.random() < drop.chance) {
      const quantity = Math.floor(drop.quantity.min + Math.random() * (drop.quantity.max - drop.quantity.min + 1));
      drops.push({ itemId: drop.id, name: drop.name, icon: drop.icon, type: 'material', rarity: 'common', quantity, sellPrice: 5 });
    }
  }
  return drops;
}

// ============================================================
// 20 EXPLORATION SCENARIOS
// ============================================================

const EXPLORATION_SCENARIOS = [
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

router.get('/info', authenticate, async (req, res) => {
  try {
    const character = await Character.findOne({ userId: req.userId });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    const towerInfo = Object.values(TOWERS).map(tower => ({
      ...tower,
      isUnlocked: !tower.requirement || character.highestTowerCleared >= tower.requirement.tower,
      currentFloor: character.currentTower === tower.id ? character.currentFloor : 1,
      highestFloor: character.towerProgress && character.towerProgress['tower' + tower.id] ? character.towerProgress['tower' + tower.id] : 1
    }));
    res.json({ towers: towerInfo, currentTower: character.currentTower, currentFloor: character.currentFloor });
  } catch (error) { res.status(500).json({ error: 'Server error' }); }
});

router.post('/enter', authenticate, async (req, res) => {
  try {
    const { towerId } = req.body;
    const character = await Character.findOne({ userId: req.userId });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    
    // Check tower lockout
    if (character.towerLockoutUntil && new Date() < character.towerLockoutUntil) {
      const remaining = Math.ceil((character.towerLockoutUntil - new Date()) / 60000);
      return res.status(400).json({ error: 'You are cursed! Cannot enter towers for ' + remaining + ' more minutes.' });
    }
    
    const tower = TOWERS[towerId];
    if (!tower) return res.status(400).json({ error: 'Invalid tower' });
    if (tower.requirement && character.highestTowerCleared < tower.requirement.tower) {
      return res.status(400).json({ error: 'Tower locked! Clear Tower ' + tower.requirement.tower + ' first.' });
    }
    character.currentTower = towerId;
    // Keep progress for this tower if any
    if (!character.towerProgress) character.towerProgress = {};
    const savedFloor = character.towerProgress['tower' + towerId] || 1;
    character.currentFloor = savedFloor;
    await character.save();
    res.json({ message: 'Entered ' + tower.name, tower, currentFloor: character.currentFloor });
  } catch (error) { res.status(500).json({ error: 'Server error' }); }
});

// Get available floors for a tower
router.get('/floors/:towerId', authenticate, async (req, res) => {
  try {
    const { towerId } = req.params;
    const character = await Character.findOne({ userId: req.userId });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    const tower = TOWERS[parseInt(towerId)];
    if (!tower) return res.status(400).json({ error: 'Invalid tower' });
    
    // Get highest unlocked floor for this tower
    if (!character.towerProgress) character.towerProgress = {};
    const highestFloor = character.towerProgress['tower' + towerId] || 1;
    
    const floors = [];
    for (let i = 1; i <= tower.floors; i++) {
      floors.push({
        floor: i,
        unlocked: i <= highestFloor,
        isSafeZone: i === 10,
        isBoss: i === 15,
        isEliteZone: i >= 13 && i < 15
      });
    }
    res.json({ floors, currentFloor: character.currentFloor, highestFloor });
  } catch (error) { res.status(500).json({ error: 'Server error' }); }
});

// Select floor to run
router.post('/select-floor', authenticate, async (req, res) => {
  try {
    const { towerId, floor } = req.body;
    const character = await Character.findOne({ userId: req.userId });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    const tower = TOWERS[parseInt(towerId)];
    if (!tower) return res.status(400).json({ error: 'Invalid tower' });
    
    if (!character.towerProgress) character.towerProgress = {};
    const highestFloor = character.towerProgress['tower' + towerId] || 1;
    
    if (floor < 1 || floor > tower.floors) return res.status(400).json({ error: 'Invalid floor' });
    if (floor > highestFloor) return res.status(400).json({ error: 'Floor not unlocked yet! Highest: ' + highestFloor });
    
    character.currentTower = parseInt(towerId);
    character.currentFloor = floor;
    await character.save();
    res.json({ message: 'Selected Floor ' + floor, currentFloor: floor, tower: tower.name });
  } catch (error) { res.status(500).json({ error: 'Server error' }); }
});

router.post('/explore', authenticate, async (req, res) => {
  try {
    const character = await Character.findOne({ userId: req.userId });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    
    // Check tower lockout
    if (character.towerLockoutUntil && new Date() < character.towerLockoutUntil) {
      const remaining = Math.ceil((character.towerLockoutUntil - new Date()) / 60000);
      return res.status(400).json({ error: 'You are cursed! Cannot explore for ' + remaining + ' more minutes.' });
    }
    
    if (character.energy < ENERGY_PER_FLOOR) return res.status(400).json({ error: 'Not enough energy! (Need ' + ENERGY_PER_FLOOR + ')' });
    if (character.stats.hp <= 0) return res.status(400).json({ error: 'You are defeated! Rest to recover.' });
    const floor = character.currentFloor;
    if (floor === 10) return res.json({ type: 'safe_zone', message: 'You reached the Safe Zone!', story: 'A peaceful sanctuary amidst the chaos.', floor: 10 });
    
    character.energy -= ENERGY_PER_FLOOR;
    await character.save();
    
    // Pick a random scenario
    const scenario = EXPLORATION_SCENARIOS[Math.floor(Math.random() * EXPLORATION_SCENARIOS.length)];
    
    res.json({ 
      type: 'exploration', 
      floor, 
      scenarioId: scenario.id,
      story: scenario.description, 
      choices: scenario.choices, 
      energyRemaining: character.energy 
    });
  } catch (error) { res.status(500).json({ error: 'Server error' }); }
});

router.post('/choose-path', authenticate, async (req, res) => {
  try {
    const { choice, scenarioId } = req.body;
    const character = await Character.findOne({ userId: req.userId });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    const floor = character.currentFloor;
    const towerEnemies = ENEMIES['tower' + character.currentTower];
    
    // Find scenario
    const scenario = EXPLORATION_SCENARIOS.find(s => s.id === scenarioId) || EXPLORATION_SCENARIOS[0];
    const outcome = scenario.outcomes[choice] || scenario.outcomes[scenario.choices[0]];
    
    // Process outcome
    let resultType = outcome.type;
    let message = outcome.message;
    let enemy = null;
    let treasure = null;
    let goldReward = 0;
    let healAmount = 0;
    let damageAmount = 0;
    let lockoutMinutes = 0;
    let nextScenario = null;
    
    // Handle random outcomes
    if (resultType === 'random') {
      const roll = Math.random();
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
        return res.json({ type: 'curse_lockout', message, lockoutMinutes, floor: 1 });
        
      case 'curse_damage':
      case 'trap':
      case 'damage':
        damageAmount = Math.floor(character.stats.maxHp * (outcome.damagePercent || 20) / 100);
        character.stats.hp = Math.max(1, character.stats.hp - damageAmount);
        await character.save();
        return res.json({ type: 'damage', message, damage: damageAmount, hp: character.stats.hp, maxHp: character.stats.maxHp });
        
      case 'blessing':
      case 'heal':
        healAmount = Math.floor(character.stats.maxHp * (outcome.healPercent || 20) / 100);
        character.stats.hp = Math.min(character.stats.maxHp, character.stats.hp + healAmount);
        await character.save();
        return res.json({ type: 'heal', message, heal: healAmount, hp: character.stats.hp, maxHp: character.stats.maxHp });
        
      case 'reward':
        goldReward = outcome.goldReward || 50;
        character.gold += goldReward;
        await character.save();
        return res.json({ type: 'reward', message, gold: goldReward, totalGold: character.gold });
        
      case 'treasure':
        const chestChance = outcome.chestChance || 0.3;
        if (Math.random() < chestChance) {
          // Found chest - give gold + maybe item
          const chestGold = Math.floor(50 + Math.random() * 100);
          character.gold += chestGold;
          await character.save();
          return res.json({ type: 'treasure', message: message + ' You found ' + chestGold + ' gold!', gold: chestGold, totalGold: character.gold, foundChest: true });
        } else {
          return res.json({ type: 'treasure_miss', message: message + ' But the chest was empty...', foundChest: false });
        }
        
      case 'followup':
        nextScenario = EXPLORATION_SCENARIOS.find(s => s.id === outcome.nextScenario);
        if (nextScenario) {
          return res.json({ type: 'exploration', floor, scenarioId: nextScenario.id, story: nextScenario.description, choices: nextScenario.choices, followup: true });
        }
        break;
        
      case 'safe':
      default:
        return res.json({ type: 'safe', message, floor });
    }
    
    // If we have an enemy, start combat
    if (enemy) {
      await character.save();
      return res.json({ type: 'combat_start', story: message, enemy, floor, isBoss: enemy.isBoss || false, isElite: enemy.isElite || false, treasureAfter: treasure });
    }
    
    res.json({ type: 'safe', message: message || 'You continue onward.', floor });
  } catch (error) { 
    console.error(error);
    res.status(500).json({ error: 'Server error' }); 
  }
});

router.post('/combat/attack', authenticate, async (req, res) => {
  try {
    const { enemy, treasureAfter } = req.body;
    const character = await Character.findOne({ userId: req.userId });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    const combatLog = [];
    const playerDamage = calculateDamage({ stats: character.stats, baseClass: character.baseClass }, enemy);
    enemy.hp -= playerDamage.damage;
    combatLog.push({ actor: 'player', damage: playerDamage.damage, isCritical: playerDamage.isCritical, message: playerDamage.isCritical ? 'CRITICAL! You deal ' + playerDamage.damage + ' damage!' : 'You attack for ' + playerDamage.damage + ' damage!' });
    if (enemy.hp <= 0) return await handleVictory(character, enemy, res, combatLog, treasureAfter);
    const enemyDamage = calculateDamage({ baseAtk: enemy.atk }, { stats: character.stats });
    character.stats.hp -= enemyDamage.damage;
    combatLog.push({ actor: 'enemy', damage: enemyDamage.damage, message: enemy.name + ' attacks for ' + enemyDamage.damage + ' damage!' });
    if (character.stats.hp <= 0) return await handleDefeat(character, res, combatLog);
    await character.save();
    res.json({ status: 'ongoing', combatLog, enemy: { ...enemy, hp: Math.max(0, enemy.hp) }, character: { hp: character.stats.hp, maxHp: character.stats.maxHp, mp: character.stats.mp, maxMp: character.stats.maxMp } });
  } catch (error) { res.status(500).json({ error: 'Server error' }); }
});

router.post('/combat/skill', authenticate, async (req, res) => {
  try {
    const { enemy, skillId, treasureAfter } = req.body;
    const character = await Character.findOne({ userId: req.userId });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    const characterSkill = character.skills.find(s => s.skillId === skillId);
    if (!characterSkill || !characterSkill.unlocked) return res.status(400).json({ error: 'Skill not available' });
    const SKILL_DATA = {
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
    const skill = SKILL_DATA[skillId];
    if (!skill) return res.status(400).json({ error: 'Invalid skill' });
    if (character.stats.mp < skill.mpCost) return res.status(400).json({ error: 'Not enough MP!' });
    const combatLog = [];
    character.stats.mp -= skill.mpCost;
    if (skill.damage > 0) {
      let totalDamage = 0;
      const hits = skill.hits || 1;
      for (let i = 0; i < hits; i++) {
        const result = calculateDamage({ stats: character.stats, baseClass: character.baseClass }, enemy, skill);
        totalDamage += result.damage;
      }
      enemy.hp -= totalDamage;
      combatLog.push({ actor: 'player', skillName: skill.name, damage: totalDamage, mpCost: skill.mpCost, message: skill.name + '! ' + totalDamage + ' damage! (-' + skill.mpCost + ' MP)' });
    } else {
      combatLog.push({ actor: 'player', skillName: skill.name, mpCost: skill.mpCost, message: skill.name + ' activated! (-' + skill.mpCost + ' MP)' });
    }
    if (enemy.hp <= 0) return await handleVictory(character, enemy, res, combatLog, treasureAfter);
    const enemyDamage = calculateDamage({ baseAtk: enemy.atk }, { stats: character.stats });
    character.stats.hp -= enemyDamage.damage;
    combatLog.push({ actor: 'enemy', damage: enemyDamage.damage, message: enemy.name + ' attacks for ' + enemyDamage.damage + ' damage!' });
    if (character.stats.hp <= 0) return await handleDefeat(character, res, combatLog);
    await character.save();
    res.json({ status: 'ongoing', combatLog, enemy: { ...enemy, hp: Math.max(0, enemy.hp) }, character: { hp: character.stats.hp, maxHp: character.stats.maxHp, mp: character.stats.mp, maxMp: character.stats.maxMp } });
  } catch (error) { res.status(500).json({ error: 'Server error' }); }
});

router.post('/combat/flee', authenticate, async (req, res) => {
  try {
    const { enemy } = req.body;
    const character = await Character.findOne({ userId: req.userId });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    if (enemy.isBoss) return res.status(400).json({ error: 'Cannot flee from boss battles!' });
    const fleeChance = 0.4 + (character.stats.agi * 0.01);
    if (Math.random() < fleeChance) return res.json({ status: 'fled', message: 'You successfully fled!', success: true });
    const enemyDamage = calculateDamage({ baseAtk: enemy.atk }, { stats: character.stats });
    character.stats.hp -= enemyDamage.damage;
    if (character.stats.hp <= 0) return await handleDefeat(character, res, [{ actor: 'system', message: 'Failed to flee! ' + enemy.name + ' strikes you down!' }]);
    await character.save();
    res.json({ status: 'ongoing', message: 'Failed to flee! ' + enemy.name + ' attacks for ' + enemyDamage.damage + ' damage!', success: false, enemy, character: { hp: character.stats.hp, maxHp: character.stats.maxHp } });
  } catch (error) { res.status(500).json({ error: 'Server error' }); }
});

router.post('/use-potion', authenticate, async (req, res) => {
  try {
    const { potionType } = req.body;
    const character = await Character.findOne({ userId: req.userId });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    const potionId = potionType === 'hp' ? 'health_potion_small' : 'mana_potion_small';
    const itemIndex = character.inventory.findIndex(i => i.itemId === potionId);
    if (itemIndex === -1) return res.status(400).json({ error: 'No ' + potionType.toUpperCase() + ' potions available!' });
    if (character.inventory[itemIndex].quantity > 1) character.inventory[itemIndex].quantity -= 1;
    else character.inventory.splice(itemIndex, 1);
    if (potionType === 'hp') character.stats.hp = Math.min(character.stats.hp + 50, character.stats.maxHp);
    else character.stats.mp = Math.min(character.stats.mp + 30, character.stats.maxMp);
    await character.save();
    res.json({ message: 'Used ' + potionType.toUpperCase() + ' potion!', character: { hp: character.stats.hp, maxHp: character.stats.maxHp, mp: character.stats.mp, maxMp: character.stats.maxMp } });
  } catch (error) { res.status(500).json({ error: 'Server error' }); }
});

router.get('/floor-requirements', authenticate, async (req, res) => {
  try {
    const character = await Character.findOne({ userId: req.userId });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    const requirements = getFloorRequirements(character.currentTower);
    const floorReq = requirements ? requirements[character.currentFloor] : null;
    const playerItems = {};
    character.inventory.forEach(item => { playerItems[item.itemId] = (playerItems[item.itemId] || 0) + item.quantity; });
    const canAdvance = floorReq ? (floorReq.items || []).every(req => (playerItems[req.id] || 0) >= req.quantity) && character.gold >= (floorReq.gold || 0) : true;
    res.json({ floor: character.currentFloor, nextFloor: character.currentFloor + 1, requirements: floorReq, playerItems, playerGold: character.gold, canAdvance, doorkeeper: randomFrom(DOORKEEPER_DIALOGUES.greeting) });
  } catch (error) { res.status(500).json({ error: 'Server error' }); }
});

router.post('/advance', authenticate, async (req, res) => {
  try {
    const character = await Character.findOne({ userId: req.userId });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    const tower = TOWERS[character.currentTower];
    const requirements = getFloorRequirements(character.currentTower);
    const floorReq = requirements ? requirements[character.currentFloor] : null;
    if (floorReq && floorReq.items && floorReq.items.length > 0) {
      for (const req of floorReq.items) {
        const itemIndex = character.inventory.findIndex(i => i.itemId === req.id);
        const itemQuantity = itemIndex >= 0 ? character.inventory[itemIndex].quantity : 0;
        if (itemQuantity < req.quantity) return res.status(400).json({ error: randomFrom(DOORKEEPER_DIALOGUES.failure), missing: { id: req.id, name: req.name, need: req.quantity, have: itemQuantity } });
      }
      for (const req of floorReq.items) {
        const itemIndex = character.inventory.findIndex(i => i.itemId === req.id);
        if (character.inventory[itemIndex].quantity > req.quantity) character.inventory[itemIndex].quantity -= req.quantity;
        else character.inventory.splice(itemIndex, 1);
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

router.post('/leave', authenticate, async (req, res) => {
  try {
    const character = await Character.findOne({ userId: req.userId });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    const checkpoint = character.currentFloor >= 10 ? 10 : 1;
    // Save progress before leaving
    if (!character.towerProgress) character.towerProgress = {};
    character.towerProgress['tower' + character.currentTower] = Math.max(character.towerProgress['tower' + character.currentTower] || 1, checkpoint);
    character.currentFloor = checkpoint;
    character.markModified('towerProgress');
    await character.save();
    res.json({ message: 'You left the tower. Progress saved at floor ' + checkpoint, resetFloor: checkpoint });
  } catch (error) { res.status(500).json({ error: 'Server error' }); }
});

router.get('/hidden-classes', authenticate, async (req, res) => {
  try {
    const character = await Character.findOne({ userId: req.userId });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    const classInfo = HIDDEN_CLASS_INFO;
    const availability = {};
    for (const classId of Object.keys(classInfo)) {
      const isAvailable = await HiddenClassOwnership.isClassAvailable(classId);
      availability[classId] = { ...classInfo[classId], isAvailable, matchesBase: classInfo[classId].baseClass === character.baseClass };
    }
    res.json({ classes: availability, playerBaseClass: character.baseClass, playerHiddenClass: character.hiddenClass });
  } catch (error) { res.status(500).json({ error: 'Server error' }); }
});

router.post('/unlock-hidden-class', authenticate, async (req, res) => {
  try {
    const { scrollItemIndex } = req.body;
    const character = await Character.findOne({ userId: req.userId });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    if (character.hiddenClass !== 'none') return res.status(400).json({ error: 'You already have a hidden class!' });
    const scrollItem = character.inventory[scrollItemIndex];
    if (!scrollItem || scrollItem.type !== 'scroll') return res.status(400).json({ error: 'Invalid scroll' });
    const scrollToClass = { 'scroll_flameblade': { classId: 'flameblade', baseReq: 'swordsman' }, 'scroll_shadow_dancer': { classId: 'shadowDancer', baseReq: 'thief' }, 'scroll_storm_ranger': { classId: 'stormRanger', baseReq: 'archer' }, 'scroll_frost_weaver': { classId: 'frostWeaver', baseReq: 'mage' } };
    const mapping = scrollToClass[scrollItem.itemId];
    if (!mapping) return res.status(400).json({ error: 'Invalid scroll type' });
    if (character.baseClass !== mapping.baseReq) return res.status(400).json({ error: 'This scroll requires ' + mapping.baseReq + ' class!' });
    const classInfo = HIDDEN_CLASS_INFO[mapping.classId];
    if (!classInfo) return res.status(400).json({ error: 'Invalid hidden class' });
    const claimed = await HiddenClassOwnership.claimClass(mapping.classId, req.userId);
    if (!claimed) return res.status(400).json({ error: 'This hidden class is already owned by another player!' });
    character.hiddenClass = mapping.classId;
    classInfo.skills.forEach(skill => { character.skills.push({ skillId: skill.skillId, name: skill.name, unlocked: true }); });
    character.inventory.splice(scrollItemIndex, 1);
    character.statistics.hiddenClassUnlocked = true;
    await character.save();
    res.json({ message: 'You have awakened as a ' + classInfo.name + '!', hiddenClass: classInfo, newSkills: classInfo.skills });
  } catch (error) { res.status(500).json({ error: 'Server error' }); }
});

router.post('/remove-hidden-class', authenticate, async (req, res) => {
  try {
    const character = await Character.findOne({ userId: req.userId });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    if (character.hiddenClass === 'none') return res.status(400).json({ error: 'You do not have a hidden class!' });
    const crystalIndex = character.inventory.findIndex(i => i.itemId === 'memory_crystal');
    if (crystalIndex === -1) return res.status(400).json({ error: 'You need a Memory Crystal to remove your hidden class!' });
    const classToScroll = { 'flameblade': 'scroll_flameblade', 'shadowDancer': 'scroll_shadow_dancer', 'stormRanger': 'scroll_storm_ranger', 'frostWeaver': 'scroll_frost_weaver' };
    const scrollId = classToScroll[character.hiddenClass];
    const scrollNames = { 'scroll_flameblade': 'Flameblade Scroll', 'scroll_shadow_dancer': 'Shadow Dancer Scroll', 'scroll_storm_ranger': 'Storm Ranger Scroll', 'scroll_frost_weaver': 'Frost Weaver Scroll' };
    await HiddenClassOwnership.releaseClass(character.hiddenClass);
    const hiddenClassInfo = HIDDEN_CLASS_INFO[character.hiddenClass];
    if (hiddenClassInfo) {
      const hiddenSkillIds = hiddenClassInfo.skills.map(s => s.skillId);
      character.skills = character.skills.filter(s => !hiddenSkillIds.includes(s.skillId));
    }
    character.hiddenClass = 'none';
    if (character.inventory[crystalIndex].quantity > 1) character.inventory[crystalIndex].quantity -= 1;
    else character.inventory.splice(crystalIndex, 1);
    character.inventory.push({ itemId: scrollId, name: scrollNames[scrollId], icon: '📜', type: 'scroll', rarity: 'legendary', quantity: 1 });
    await character.save();
    res.json({ message: 'Hidden class removed! The scroll has returned to your inventory.', scrollReturned: scrollNames[scrollId] });
  } catch (error) { res.status(500).json({ error: 'Server error' }); }
});

router.post('/craft', authenticate, async (req, res) => {
  try {
    const { recipeId } = req.body;
    const character = await Character.findOne({ userId: req.userId });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    const recipe = CRAFTING_RECIPES[recipeId];
    if (!recipe) return res.status(400).json({ error: 'Invalid recipe' });
    for (const ingredient of recipe.ingredients) {
      const itemIndex = character.inventory.findIndex(i => i.itemId === ingredient.id);
      const quantity = itemIndex >= 0 ? character.inventory[itemIndex].quantity : 0;
      if (quantity < ingredient.quantity) return res.status(400).json({ error: 'Not enough ' + ingredient.name + '! Need ' + ingredient.quantity + ', have ' + quantity });
    }
    for (const ingredient of recipe.ingredients) {
      const itemIndex = character.inventory.findIndex(i => i.itemId === ingredient.id);
      if (character.inventory[itemIndex].quantity > ingredient.quantity) character.inventory[itemIndex].quantity -= ingredient.quantity;
      else character.inventory.splice(itemIndex, 1);
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
  const rewards = { exp: enemy.expReward, gold: calculateGoldDrop(enemy.goldReward), items: [] };
  character.experience += rewards.exp;
  character.gold += rewards.gold;
  character.statistics.totalKills += 1;
  character.statistics.totalGoldEarned += rewards.gold;
  if (enemy.isElite) character.statistics.eliteKills += 1;
  if (enemy.isBoss) character.statistics.bossKills += 1;
  const leveledUp = character.checkLevelUp();
  
  // Material drops - FIX: Use itemId consistently
  const materialDrops = rollMaterialDrops(enemy.id, character.currentTower);
  materialDrops.forEach(drop => {
    addItemToInventory(character, drop.itemId, drop.name, drop.icon, drop.type, drop.rarity, drop.quantity, {}, drop.sellPrice);
    rewards.items.push(drop);
  });
  
  // Equipment drops
  const dropRate = enemy.isBoss ? DROP_RATES.boss : (enemy.isElite ? DROP_RATES.elite : DROP_RATES.normal);
  const equipmentTable = EQUIPMENT_DROPS ? EQUIPMENT_DROPS['tower' + character.currentTower] : null;
  const equipDrops = rollForDrops(enemy, dropRate, equipmentTable, character.baseClass, character.currentTower);
  equipDrops.forEach(item => {
    if (character.inventory.length < character.inventorySize) {
      const itemId = item.itemId || item.id || (item.name.toLowerCase().replace(/\s+/g, '_'));
      addItemToInventory(character, itemId, item.name, item.icon, item.type, item.rarity, item.quantity || 1, item.stats, item.sellPrice);
      rewards.items.push(item);
    }
  });
  
  // Scroll drops
  const scroll = rollForScroll(enemy, character.baseClass);
  if (scroll) {
    const classIdMap = { 'scroll_flameblade': 'flameblade', 'scroll_shadow_dancer': 'shadowDancer', 'scroll_storm_ranger': 'stormRanger', 'scroll_frost_weaver': 'frostWeaver' };
    const mappedClassId = classIdMap[scroll.id];
    try {
      if (mappedClassId) {
        const isAvailable = await HiddenClassOwnership.isClassAvailable(mappedClassId);
        if (isAvailable) {
          addItemToInventory(character, scroll.id, scroll.name, '📜', 'scroll', 'legendary', 1, {}, 0);
          rewards.items.push(scroll);
          rewards.scrollDropped = true;
          character.statistics.scrollsFound += 1;
        }
      }
    } catch (e) {}
  }
  
  // Memory crystal fragment
  if (enemy.isBoss && Math.random() < 0.1) {
    addItemToInventory(character, 'memory_crystal_fragment', 'Memory Crystal Fragment', '💠', 'material', 'epic', 1, {}, 100);
    rewards.items.push({ name: 'Memory Crystal Fragment', icon: '💠' });
    rewards.memoryCrystalFragment = true;
  }
  
  // Treasure after combat (from scenario)
  if (treasureAfter && treasureAfter.chestChance && Math.random() < treasureAfter.chestChance) {
    const chestGold = Math.floor(50 + Math.random() * 100);
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
  const towerStory = getStoryEvents(character.currentTower);
  combatLog.push({ actor: 'system', message: 'Victory! Defeated ' + enemy.name + '!' });
  res.json({ status: 'victory', message: randomFrom(towerStory.victory).replace('{enemy}', enemy.name), combatLog, rewards, leveledUp, restPrompt: randomFrom(towerStory.rest_prompt), character: { level: character.level, experience: character.experience, experienceToNextLevel: character.experienceToNextLevel, gold: character.gold, statPoints: character.statPoints, hp: character.stats.hp, maxHp: character.stats.maxHp, mp: character.stats.mp, maxMp: character.stats.maxMp } });
}

async function handleDefeat(character, res, combatLog) {
  character.stats.hp = 0;
  character.statistics.deaths += 1;
  const checkpoint = character.currentFloor < 10 ? 1 : 10;
  character.currentFloor = checkpoint;
  // Update tower progress to checkpoint
  if (!character.towerProgress) character.towerProgress = {};
  character.towerProgress['tower' + character.currentTower] = Math.max(character.towerProgress['tower' + character.currentTower] || 1, checkpoint);
  character.markModified('towerProgress');
  await character.save();
  combatLog.push({ actor: 'system', message: 'You have been defeated!' });
  res.json({ status: 'defeat', message: 'Defeated! Progress reset to checkpoint.', combatLog, resetFloor: checkpoint, character: { hp: 0, maxHp: character.stats.maxHp } });
}

export default router;
