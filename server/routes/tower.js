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
// 20 EXPLORATION SCENARIOS - REVAMPED
// All scenarios now give meaningful rewards or progression
// ============================================================

const EXPLORATION_SCENARIOS = [
  // 1. Three artifacts - high risk/reward
  {
    id: 'three_artifacts',
    description: 'You discover an ancient chamber with three mystical pedestals. A 👑 Crown radiates dark energy, a 💀 Skull whispers secrets, and a 🗡️ Sword gleams with power. Choose wisely...',
    choices: ['crown', 'skull', 'sword'],
    outcomes: {
      crown: { type: 'curse_lockout', message: 'The crown pulses with forbidden power! A curse befalls you - banished from all towers!', lockoutMinutes: 15 },
      skull: { type: 'combat_then_treasure', message: 'The skull crumbles revealing a guardian spirit protecting treasure!', chestChance: 0.7 },
      sword: { type: 'combat_reward', message: 'The cursed sword animates and attacks! But defeating it grants its power!', goldReward: 80 }
    }
  },
  // 2. Left or right path - both lead somewhere
  {
    id: 'fork_path',
    description: 'The corridor splits. The LEFT path glows faintly with magical runes. The RIGHT echoes with distant battle sounds.',
    choices: ['left', 'right'],
    outcomes: {
      left: { type: 'treasure', message: 'The runes led to a hidden cache!', chestChance: 0.6 },
      right: { type: 'combat_then_treasure', message: 'You find adventurers fighting a monster! Help them for a share of loot!', chestChance: 0.5 }
    }
  },
  // 3. Voice in the dark
  {
    id: 'voice_in_dark',
    description: 'A mysterious voice echoes: "Brave hunter... I offer knowledge or power. LISTEN to my wisdom, or CHALLENGE me for strength."',
    choices: ['listen', 'challenge'],
    outcomes: {
      listen: { type: 'blessing', message: 'The spirit shares ancient knowledge, restoring your vitality!', healPercent: 35 },
      challenge: { type: 'combat_then_treasure', message: 'The spirit materializes to test your worth!', chestChance: 0.6 }
    }
  },
  // 4. Trap corridor - skill check
  {
    id: 'trap_corridor',
    description: 'Pressure plates line the floor ahead. You can DISARM them carefully for salvage, or DASH through relying on reflexes.',
    choices: ['disarm', 'dash'],
    outcomes: {
      disarm: { type: 'reward', message: 'You salvage valuable trap components!', goldReward: 60 },
      dash: { type: 'random', success: { type: 'reward', message: 'You dash through unscathed and find gold dropped by previous victims!', goldReward: 40 }, fail: { message: 'Spikes graze you but you grab some gold on the way!', damagePercent: 15, goldReward: 25 }, successChance: 0.5 }
    }
  },
  // 5. Wounded traveler - moral choice with rewards
  {
    id: 'wounded_traveler',
    description: 'A wounded hunter lies against the wall. "Please... HELP me and I\'ll share my findings. Or SEARCH my pack while I rest..."',
    choices: ['help', 'search'],
    outcomes: {
      help: { type: 'reward', message: 'Grateful, they share their treasure map location!', goldReward: 75 },
      search: { type: 'random', success: { type: 'treasure', message: 'You find valuable items in their pack!', chestChance: 0.7 }, fail: { type: 'combat', message: 'It was a trap! The "wounded" hunter attacks!' }, successChance: 0.4 }
    }
  },
  // 6. Mysterious altar - divine gamble
  {
    id: 'mysterious_altar',
    description: 'An altar pulses with divine energy. OFFER gold (50g) for a blessing, or MEDITATE to absorb ambient energy.',
    choices: ['offer', 'meditate'],
    outcomes: {
      offer: { type: 'blessing_cost', message: 'The gods accept your offering and restore you fully!', healPercent: 50, goldCost: 50 },
      meditate: { type: 'blessing', message: 'You absorb the ambient energy, feeling refreshed!', healPercent: 25 }
    }
  },
  // 7. Crumbling bridge - risk vs safe
  {
    id: 'crumbling_bridge',
    description: 'A treasure chest glimmers on a crumbling bridge. RISK crossing for it, or take the SAFE path around.',
    choices: ['risk', 'safe'],
    outcomes: {
      risk: { type: 'random', success: { type: 'treasure', message: 'You grab the chest and leap to safety!', chestChance: 0.9 }, fail: { type: 'treasure', message: 'The bridge collapses! You grab the chest but take damage!', chestChance: 0.9, damagePercent: 20 }, successChance: 0.6 },
      safe: { type: 'reward', message: 'The safe path leads to a small cache left by cautious travelers.', goldReward: 35 }
    }
  },
  // 8. Treasure guardian - fight or stealth
  {
    id: 'treasure_guardian',
    description: 'A spectral guardian hovers over a treasure hoard. FIGHT for full access, or SNEAK for a smaller share.',
    choices: ['fight', 'sneak'],
    outcomes: {
      fight: { type: 'combat_then_treasure', message: 'The guardian attacks! Victory means all the treasure!', chestChance: 0.85 },
      sneak: { type: 'random', success: { type: 'treasure', message: 'You grab what you can and escape!', chestChance: 0.5 }, fail: { type: 'combat_then_treasure', message: 'Spotted! But you can still fight for treasure!', chestChance: 0.6 }, successChance: 0.5 }
    }
  },
  // 9. Poison gas room - both paths have value
  {
    id: 'poison_gas',
    description: 'Green gas fills the chamber. RUSH through to reach treasure beyond, or WAIT and scavenge from those who failed.',
    choices: ['rush', 'wait'],
    outcomes: {
      rush: { type: 'random', success: { type: 'treasure', message: 'You reach the treasure room!', chestChance: 0.8 }, fail: { type: 'treasure', message: 'The gas weakens you, but treasure awaits!', chestChance: 0.8, damagePercent: 20 }, successChance: 0.5 },
      wait: { type: 'reward', message: 'You find valuables on fallen adventurers.', goldReward: 55 }
    }
  },
  // 10. Ancient riddle - knowledge rewards
  {
    id: 'ancient_riddle',
    description: 'A stone door asks: "I have keys but no locks, space but no room, you can enter but cannot go inside." Answer: KEYBOARD or HOUSE?',
    choices: ['keyboard', 'house'],
    outcomes: {
      keyboard: { type: 'treasure', message: 'Correct! The door reveals a scholar\'s hidden vault!', chestChance: 0.75 },
      house: { type: 'trap_reward', message: 'Wrong! Darts hit you, but a consolation prize drops.', damagePercent: 10, goldReward: 20 }
    }
  },
  // 11. Glowing mushrooms - nature's bounty
  {
    id: 'glowing_mushrooms',
    description: 'Bioluminescent mushrooms fill a cavern. HARVEST them for alchemy, or CONSUME one for immediate effect.',
    choices: ['harvest', 'consume'],
    outcomes: {
      harvest: { type: 'reward', message: 'You gather valuable alchemical ingredients!', goldReward: 45 },
      consume: { type: 'random', success: { type: 'heal', message: 'The mushroom invigorates you greatly!', healPercent: 40 }, fail: { type: 'heal', message: 'Mildly toxic, but still somewhat restorative.', healPercent: 15 }, successChance: 0.5 }
    }
  },
  // 12. Fallen warrior - honor or profit
  {
    id: 'fallen_warrior',
    description: 'A fallen warrior clutches a glowing weapon. PAY RESPECTS and the spirit may bless you, or CLAIM their equipment.',
    choices: ['respects', 'claim'],
    outcomes: {
      respects: { type: 'blessing', message: 'The warrior\'s spirit blesses you for your honor!', healPercent: 30, goldReward: 40 },
      claim: { type: 'random', success: { type: 'treasure', message: 'You claim their valuable equipment!', chestChance: 0.7 }, fail: { type: 'combat', message: 'The warrior rises to defend their honor!' }, successChance: 0.6 }
    }
  },
  // 13. Magic mirror - shadow self
  {
    id: 'magic_mirror',
    description: 'A mirror shows your shadow-self. MERGE with it for power, or SHATTER the mirror to banish it.',
    choices: ['merge', 'shatter'],
    outcomes: {
      merge: { type: 'random', success: { type: 'blessing', message: 'You absorb your shadow\'s strength!', healPercent: 25, goldReward: 30 }, fail: { type: 'combat', message: 'Your shadow overpowers and attacks you!' }, successChance: 0.5 },
      shatter: { type: 'treasure', message: 'The mirror shatters revealing hidden compartments!', chestChance: 0.6 }
    }
  },
  // 14. Crying child illusion
  {
    id: 'crying_child',
    description: 'Crying echoes through the halls. INVESTIGATE the source, or FOCUS and see through the illusion.',
    choices: ['investigate', 'focus'],
    outcomes: {
      investigate: { type: 'random', success: { type: 'treasure', message: 'A lost spirit rewards your kindness!', chestChance: 0.7 }, fail: { type: 'combat_then_treasure', message: 'A monster used the illusion as bait!', chestChance: 0.4 }, successChance: 0.4 },
      focus: { type: 'treasure', message: 'You see through the illusion to a hidden passage!', chestChance: 0.5 }
    }
  },
  // 15. Gambling demon - high stakes
  {
    id: 'gambling_demon',
    description: 'A demon grins: "Gamble with me! WIN and double your gold (up to 100g). LOSE and pay 50g. Or DECLINE for a small gift."',
    choices: ['gamble', 'decline'],
    outcomes: {
      gamble: { type: 'random', success: { type: 'reward', message: 'You WIN! The demon honors the bet!', goldReward: 100 }, fail: { type: 'cost', message: 'You lose... the demon takes its due.', goldCost: 50 }, successChance: 0.5 },
      decline: { type: 'reward', message: 'The demon respects your caution and offers a consolation prize.', goldReward: 25 }
    }
  },
  // 16. Locked door - strength or cunning
  {
    id: 'locked_door',
    description: 'A reinforced door blocks your path. FORCE it with strength, or PICK the lock with finesse.',
    choices: ['force', 'pick'],
    outcomes: {
      force: { type: 'random', success: { type: 'treasure', message: 'You smash through to a storage room!', chestChance: 0.7 }, fail: { type: 'combat', message: 'The noise alerts guards!' }, successChance: 0.5 },
      pick: { type: 'random', success: { type: 'treasure', message: 'The lock clicks open revealing valuables!', chestChance: 0.6 }, fail: { type: 'treasure', message: 'The lock breaks but you squeeze through!', chestChance: 0.4 }, successChance: 0.6 }
    }
  },
  // 17. Flooded room
  {
    id: 'water_room',
    description: 'The room is flooded. DIVE to search underwater ruins, or WADE carefully along the edges.',
    choices: ['dive', 'wade'],
    outcomes: {
      dive: { type: 'random', success: { type: 'treasure', message: 'You find a sunken treasure chest!', chestChance: 0.8 }, fail: { type: 'combat', message: 'Something lurks in the depths!' }, successChance: 0.5 },
      wade: { type: 'reward', message: 'You find coins dropped along the shallow edges.', goldReward: 40 }
    }
  },
  // 18. Statue room - observation rewards
  {
    id: 'statue_room',
    description: 'Warrior statues line the hall. One holds a real gem. EXAMINE carefully to find it, or HURRY through.',
    choices: ['examine', 'hurry'],
    outcomes: {
      examine: { type: 'treasure', message: 'You spot the real gem and claim it!', chestChance: 0.7 },
      hurry: { type: 'random', success: { type: 'reward', message: 'You pass through quickly and find gold ahead!', goldReward: 35 }, fail: { type: 'combat', message: 'A statue animates as you pass!' }, successChance: 0.7 }
    }
  },
  // 19. Echo chamber - stealth vs combat
  {
    id: 'echo_chamber',
    description: 'Your footsteps echo loudly. SILENCE your movement to avoid detection, or let them HEAR you and face what comes.',
    choices: ['silence', 'hear'],
    outcomes: {
      silence: { type: 'treasure', message: 'You sneak past enemies and find their unguarded stash!', chestChance: 0.5 },
      hear: { type: 'combat_then_treasure', message: 'Enemies approach! Defeating them reveals their loot!', chestChance: 0.6 }
    }
  },
  // 20. Cursed gold - greed test
  {
    id: 'cursed_gold',
    description: 'A pile of glittering gold coins. TAKE only a handful to be safe, or TAKE ALL and risk the curse.',
    choices: ['handful', 'all'],
    outcomes: {
      handful: { type: 'reward', message: 'You wisely take a safe amount.', goldReward: 50 },
      all: { type: 'random', success: { type: 'reward', message: 'Fortune favors the bold! It was all real!', goldReward: 150 }, fail: { type: 'curse_damage', message: 'Cursed gold burns you!', damagePercent: 25, goldReward: 50 }, successChance: 0.4 }
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
    let goldReward = outcome.goldReward || 0;
    let goldCost = outcome.goldCost || 0;
    let healAmount = 0;
    let damageAmount = outcome.damagePercent ? Math.floor(character.stats.maxHp * outcome.damagePercent / 100) : 0;
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
        if (outcome.success.damagePercent) damageAmount = Math.floor(character.stats.maxHp * outcome.success.damagePercent / 100);
      } else {
        // Fail
        if (outcome.fail.type) resultType = outcome.fail.type;
        else resultType = 'damage';
        message = outcome.fail.message;
        if (outcome.fail.damagePercent) damageAmount = Math.floor(character.stats.maxHp * outcome.fail.damagePercent / 100);
        if (outcome.fail.goldReward) goldReward = outcome.fail.goldReward;
        if (outcome.fail.chestChance) treasure = { chestChance: outcome.fail.chestChance };
      }
    }
    
    // Apply effects based on type
    switch (resultType) {
      case 'combat':
      case 'combat_then_treasure':
      case 'combat_reward':
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
        if (resultType === 'combat_reward') treasure = { goldReward: outcome.goldReward || 50 };
        break;
        
      case 'curse_lockout':
        lockoutMinutes = outcome.lockoutMinutes || 15;
        character.towerLockoutUntil = new Date(Date.now() + lockoutMinutes * 60000);
        character.currentFloor = 1;
        await character.save();
        return res.json({ type: 'curse_lockout', message, lockoutMinutes, floor: 1 });
        
      case 'curse_damage':
      case 'trap':
      case 'damage':
        damageAmount = damageAmount || Math.floor(character.stats.maxHp * (outcome.damagePercent || 20) / 100);
        character.stats.hp = Math.max(1, character.stats.hp - damageAmount);
        // Also give gold if specified (trap_reward type)
        if (goldReward > 0) character.gold += goldReward;
        await character.save();
        return res.json({ type: 'damage', message, damage: damageAmount, gold: goldReward, hp: character.stats.hp, maxHp: character.stats.maxHp, totalGold: character.gold });
      
      case 'trap_reward':
        damageAmount = Math.floor(character.stats.maxHp * (outcome.damagePercent || 10) / 100);
        character.stats.hp = Math.max(1, character.stats.hp - damageAmount);
        character.gold += outcome.goldReward || 20;
        await character.save();
        return res.json({ type: 'trap_reward', message, damage: damageAmount, gold: outcome.goldReward || 20, hp: character.stats.hp, maxHp: character.stats.maxHp, totalGold: character.gold });
        
      case 'blessing':
      case 'heal':
        healAmount = Math.floor(character.stats.maxHp * (outcome.healPercent || 20) / 100);
        character.stats.hp = Math.min(character.stats.maxHp, character.stats.hp + healAmount);
        // Also give gold if specified
        if (outcome.goldReward) {
          character.gold += outcome.goldReward;
          goldReward = outcome.goldReward;
        }
        await character.save();
        return res.json({ type: 'heal', message, heal: healAmount, gold: goldReward, hp: character.stats.hp, maxHp: character.stats.maxHp, totalGold: character.gold });
      
      case 'blessing_cost':
        // Costs gold but heals
        if (character.gold < (outcome.goldCost || 50)) {
          return res.json({ type: 'safe', message: 'You don\'t have enough gold for the offering. The altar remains silent.', floor });
        }
        character.gold -= outcome.goldCost || 50;
        healAmount = Math.floor(character.stats.maxHp * (outcome.healPercent || 30) / 100);
        character.stats.hp = Math.min(character.stats.maxHp, character.stats.hp + healAmount);
        await character.save();
        return res.json({ type: 'blessing_cost', message, heal: healAmount, goldSpent: outcome.goldCost || 50, hp: character.stats.hp, maxHp: character.stats.maxHp, totalGold: character.gold });
        
      case 'reward':
        goldReward = goldReward || outcome.goldReward || 50;
        character.gold += goldReward;
        await character.save();
        return res.json({ type: 'reward', message, gold: goldReward, totalGold: character.gold });
      
      case 'cost':
        // Lose gold
        goldCost = outcome.goldCost || 50;
        character.gold = Math.max(0, character.gold - goldCost);
        await character.save();
        return res.json({ type: 'cost', message, goldLost: goldCost, totalGold: character.gold });
        
      case 'treasure':
        const chestChance = outcome.chestChance || treasure?.chestChance || 0.5;
        const chestGold = Math.floor(50 + Math.random() * 100);
        character.gold += chestGold;
        // Apply damage if outcome has it (risky treasure)
        if (damageAmount > 0) {
          character.stats.hp = Math.max(1, character.stats.hp - damageAmount);
        }
        await character.save();
        return res.json({ type: 'treasure', message: message + ' You found ' + chestGold + ' gold!', gold: chestGold, damage: damageAmount, totalGold: character.gold, foundChest: true, hp: character.stats.hp, maxHp: character.stats.maxHp });
        
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
  
  // NEW DROP RATES:
  // Normal: 10% other drops, 5% equipment
  // Elite: 20% other drops, 9% equipment
  // Boss: 25% other drops, 14% equipment, 5% memory crystal fragment
  
  const otherDropRate = enemy.isBoss ? 0.25 : (enemy.isElite ? 0.20 : 0.10);
  const equipDropRate = enemy.isBoss ? 0.14 : (enemy.isElite ? 0.09 : 0.05);
  const crystalFragmentRate = enemy.isBoss ? 0.05 : 0;
  
  // Material/Other drops
  if (Math.random() < otherDropRate) {
    const materialDrops = rollMaterialDrops(enemy.id, character.currentTower);
    materialDrops.forEach(drop => {
      addItemToInventory(character, drop.itemId, drop.name, drop.icon, drop.type, drop.rarity, drop.quantity, {}, drop.sellPrice);
      rewards.items.push(drop);
    });
  }
  
  // Equipment drops
  if (Math.random() < equipDropRate) {
    const equipmentTable = EQUIPMENT_DROPS ? EQUIPMENT_DROPS['tower' + character.currentTower] : null;
    const customDropRate = { equipment: 1.0, setItem: enemy.isBoss ? 0.15 : (enemy.isElite ? 0.05 : 0.01) };
    const equipDrops = rollForDrops(enemy, customDropRate, equipmentTable, character.baseClass, character.currentTower);
    equipDrops.forEach(item => {
      if (character.inventory.length < character.inventorySize) {
        const itemId = item.itemId || item.id || (item.name.toLowerCase().replace(/\s+/g, '_'));
        addItemToInventory(character, itemId, item.name, item.icon, item.type, item.rarity, item.quantity || 1, item.stats, item.sellPrice);
        rewards.items.push(item);
      }
    });
  }
  
  // Scroll drops (unchanged - keep rare)
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
  
  // Memory crystal fragment - NEW: 5% for boss only
  if (Math.random() < crystalFragmentRate) {
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
