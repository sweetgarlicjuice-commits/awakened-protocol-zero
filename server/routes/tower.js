import express from 'express';
import Character from '../models/Character.js';
import HiddenClassOwnership from '../models/HiddenClassOwnership.js';
import { authenticate } from '../middleware/auth.js';
import { TOWERS, ENEMIES, DROP_RATES, EQUIPMENT_DROPS } from '../data/gameData.js';
import { FLOOR_REQUIREMENTS, MATERIAL_DROPS, STORY_EVENTS, DOORKEEPER_DIALOGUES, HIDDEN_CLASS_INFO, CRAFTING_RECIPES } from '../data/storyData.js';
import { calculateDamage, scaleEnemyStats, getRandomEnemy, calculateGoldDrop, rollForDrops, rollForScroll } from '../utils/combat.js';

const router = express.Router();
const ENERGY_PER_FLOOR = 10;
const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Helper function to add items with proper stacking
function addItemWithStack(character, itemId, name, icon, type, rarity, quantity, stats) {
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
    stats: stats || {}
  });
  return true;
}

function rollMaterialDrops(enemyId, towerId) {
  const drops = [];
  const materialTable = MATERIAL_DROPS['tower' + towerId];
  const enemyDrops = materialTable?.[enemyId] || [];
  for (const drop of enemyDrops) {
    if (Math.random() < drop.chance) {
      const quantity = Math.floor(drop.quantity.min + Math.random() * (drop.quantity.max - drop.quantity.min + 1));
      drops.push({ id: drop.id, name: drop.name, icon: drop.icon, type: 'material', rarity: 'common', quantity });
    }
  }
  return drops;
}

router.get('/info', authenticate, async (req, res) => {
  try {
    const character = await Character.findOne({ userId: req.userId });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    const towerInfo = Object.values(TOWERS).map(tower => ({
      ...tower,
      isUnlocked: !tower.requirement || character.highestTowerCleared >= tower.requirement.tower,
      currentFloor: character.currentTower === tower.id ? character.currentFloor : 1
    }));
    res.json({ towers: towerInfo });
  } catch (error) { res.status(500).json({ error: 'Server error' }); }
});

router.post('/enter', authenticate, async (req, res) => {
  try {
    const { towerId } = req.body;
    const character = await Character.findOne({ userId: req.userId });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    const tower = TOWERS[towerId];
    if (!tower) return res.status(400).json({ error: 'Invalid tower' });
    if (tower.requirement && character.highestTowerCleared < tower.requirement.tower)
      return res.status(400).json({ error: 'Clear Tower ' + tower.requirement.tower + ' first!' });
    if (character.level < tower.levelRange.min)
      return res.status(400).json({ error: 'Requires level ' + tower.levelRange.min });
    character.currentTower = towerId;
    character.currentFloor = 1;
    await character.save();
    const towerStory = STORY_EVENTS['tower' + towerId];
    res.json({ message: 'Entered ' + tower.name, tower, currentFloor: 1, story: randomFrom(towerStory.entrance) });
  } catch (error) { res.status(500).json({ error: 'Server error' }); }
});

router.post('/explore', authenticate, async (req, res) => {
  try {
    const character = await Character.findOne({ userId: req.userId });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    if (character.energy < ENERGY_PER_FLOOR) return res.status(400).json({ error: 'Not enough energy! (Need ' + ENERGY_PER_FLOOR + ')' });
    if (character.stats.hp <= 0) return res.status(400).json({ error: 'You are defeated! Rest to recover.' });
    const floor = character.currentFloor;
    if (floor === 10) return res.json({ type: 'safe_zone', message: 'You reached the Safe Zone!', story: 'A peaceful sanctuary amidst the chaos.', floor: 10 });
    character.energy -= ENERGY_PER_FLOOR;
    await character.save();
    const towerStory = STORY_EVENTS['tower' + character.currentTower];
    const pathEvent = randomFrom(towerStory.paths);
    res.json({ type: 'exploration', floor, story: randomFrom(towerStory.exploration), pathDescription: pathEvent.description, choices: pathEvent.choices, energyRemaining: character.energy });
  } catch (error) { res.status(500).json({ error: 'Server error' }); }
});

router.post('/choose-path', authenticate, async (req, res) => {
  try {
    const { choice } = req.body;
    const character = await Character.findOne({ userId: req.userId });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    const floor = character.currentFloor;
    const towerStory = STORY_EVENTS['tower' + character.currentTower];
    const towerEnemies = ENEMIES['tower' + character.currentTower];
    let enemy;
    if (floor === 15) {
      enemy = scaleEnemyStats(towerEnemies.boss, floor, character.currentTower);
    } else if (floor >= 13 && Math.random() < 0.4) {
      enemy = getRandomEnemy(towerEnemies.elite, floor);
      enemy = scaleEnemyStats(enemy, floor, character.currentTower);
    } else {
      enemy = getRandomEnemy(towerEnemies.normal, floor);
      enemy = scaleEnemyStats(enemy, floor, character.currentTower);
    }
    const pathEvent = randomFrom(towerStory.paths);
    const outcomeText = pathEvent.outcomes[choice] ? randomFrom(pathEvent.outcomes[choice]).replace('{enemy}', enemy.name) : 'You encounter ' + enemy.name + '!';
    res.json({ type: 'combat_start', story: outcomeText, enemy, floor, isBoss: enemy.isBoss || false, isElite: enemy.isElite || false });
  } catch (error) { res.status(500).json({ error: 'Server error' }); }
});

router.post('/combat/attack', authenticate, async (req, res) => {
  try {
    const { enemy } = req.body;
    const character = await Character.findOne({ userId: req.userId });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    const combatLog = [];
    const playerDamage = calculateDamage({ stats: character.stats, baseClass: character.baseClass }, enemy);
    enemy.hp -= playerDamage.damage;
    combatLog.push({ actor: 'player', damage: playerDamage.damage, isCritical: playerDamage.isCritical, message: playerDamage.isCritical ? 'CRITICAL! You deal ' + playerDamage.damage + ' damage!' : 'You attack for ' + playerDamage.damage + ' damage!' });
    if (enemy.hp <= 0) return await handleVictory(character, enemy, res, combatLog);
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
    const { enemy, skillId } = req.body;
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
    if (enemy.hp <= 0) return await handleVictory(character, enemy, res, combatLog);
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
    const requirements = FLOOR_REQUIREMENTS['tower' + character.currentTower];
    const floorReq = requirements?.[character.currentFloor];
    const playerItems = {};
    character.inventory.forEach(item => { playerItems[item.itemId] = (playerItems[item.itemId] || 0) + item.quantity; });
    const canAdvance = floorReq ? floorReq.items.every(req => (playerItems[req.id] || 0) >= req.quantity) && character.gold >= floorReq.gold : true;
    res.json({ floor: character.currentFloor, nextFloor: character.currentFloor + 1, requirements: floorReq, playerItems, playerGold: character.gold, canAdvance, doorkeeper: randomFrom(DOORKEEPER_DIALOGUES.greeting) });
  } catch (error) { res.status(500).json({ error: 'Server error' }); }
});

router.post('/advance', authenticate, async (req, res) => {
  try {
    const character = await Character.findOne({ userId: req.userId });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    const tower = TOWERS[character.currentTower];
    const requirements = FLOOR_REQUIREMENTS['tower' + character.currentTower];
    const floorReq = requirements?.[character.currentFloor];
    if (floorReq && floorReq.items.length > 0) {
      for (const req of floorReq.items) {
        const itemIndex = character.inventory.findIndex(i => i.itemId === req.id);
        const itemQuantity = itemIndex >= 0 ? character.inventory[itemIndex].quantity : 0;
        if (itemQuantity < req.quantity) return res.status(400).json({ error: randomFrom(DOORKEEPER_DIALOGUES.failure), missing: { id: req.id, name: req.name, need: req.quantity, have: itemQuantity } });
      }
      if (character.gold < floorReq.gold) return res.status(400).json({ error: randomFrom(DOORKEEPER_DIALOGUES.failure), missing: { id: 'gold', name: 'Gold', need: floorReq.gold, have: character.gold } });
      for (const req of floorReq.items) {
        const itemIndex = character.inventory.findIndex(i => i.itemId === req.id);
        if (character.inventory[itemIndex].quantity > req.quantity) character.inventory[itemIndex].quantity -= req.quantity;
        else character.inventory.splice(itemIndex, 1);
      }
      character.gold -= floorReq.gold;
    }
    if (character.currentFloor >= tower.floors) {
      if (character.highestTowerCleared < character.currentTower) character.highestTowerCleared = character.currentTower;
      await character.save();
      return res.json({ status: 'tower_complete', message: 'Congratulations! You conquered ' + tower.name + '!', towerCleared: character.currentTower, nextTowerUnlocked: !!TOWERS[character.currentTower + 1] });
    }
    character.currentFloor += 1;
    if (character.currentTower > character.highestFloorReached.towerId || (character.currentTower === character.highestFloorReached.towerId && character.currentFloor > character.highestFloorReached.floor)) {
      character.highestFloorReached.towerId = character.currentTower;
      character.highestFloorReached.floor = character.currentFloor;
    }
    character.statistics.floorsCleared += 1;
    await character.save();
    let floorType = 'normal';
    let floorMessage = randomFrom(DOORKEEPER_DIALOGUES.success);
    if (character.currentFloor === 10) floorType = 'safe_zone';
    else if (character.currentFloor === 15) { floorType = 'boss'; floorMessage = randomFrom(DOORKEEPER_DIALOGUES.boss_warning); }
    else if (character.currentFloor >= 13) floorType = 'elite';
    res.json({ status: 'advanced', message: floorMessage, floor: character.currentFloor, floorType, tower: tower.name });
  } catch (error) { res.status(500).json({ error: 'Server error' }); }
});

router.post('/leave', authenticate, async (req, res) => {
  try {
    const character = await Character.findOne({ userId: req.userId });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    const safeFloors = [10, 15];
    const currentFloor = character.currentFloor;
    if (!safeFloors.includes(currentFloor) && currentFloor < 10) character.currentFloor = 1;
    else if (!safeFloors.includes(currentFloor) && currentFloor > 10) character.currentFloor = 10;
    await character.save();
    res.json({ message: safeFloors.includes(currentFloor) ? 'Progress saved.' : 'Progress reset to last checkpoint.', savedFloor: character.currentFloor });
  } catch (error) { res.status(500).json({ error: 'Server error' }); }
});

router.get('/hidden-classes', authenticate, async (req, res) => {
  try {
    const character = await Character.findOne({ userId: req.userId });
    const classes = await HiddenClassOwnership.getAllClassStatus();
    const classInfo = Object.values(HIDDEN_CLASS_INFO).map(cls => {
      const ownership = classes.find(c => c.classId === cls.id);
      return { ...cls, isAvailable: ownership?.ownerId === null, owner: ownership?.ownerName || null, canUnlock: cls.baseClass === character?.baseClass };
    });
    res.json({ classes: classInfo });
  } catch (error) { res.status(500).json({ error: 'Server error' }); }
});

router.post('/unlock-hidden-class', authenticate, async (req, res) => {
  try {
    const { scrollId } = req.body;
    const character = await Character.findOne({ userId: req.userId });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    if (character.hiddenClass !== 'none') return res.status(400).json({ error: 'You already have a hidden class!' });
    const scrollMap = { 'scroll_flameblade': 'flameblade', 'scroll_shadow_dancer': 'shadowDancer', 'scroll_storm_ranger': 'stormRanger', 'scroll_frost_weaver': 'frostWeaver' };
    const classId = scrollMap[scrollId];
    if (!classId) return res.status(400).json({ error: 'Invalid scroll' });
    const scrollIndex = character.inventory.findIndex(i => i.itemId === scrollId);
    if (scrollIndex === -1) return res.status(400).json({ error: 'Scroll not found' });
    const classInfo = HIDDEN_CLASS_INFO[classId];
    if (classInfo.baseClass !== character.baseClass) return res.status(400).json({ error: 'Requires ' + classInfo.baseClass + ' class!' });
    const isAvailable = await HiddenClassOwnership.isClassAvailable(classId);
    if (!isAvailable) return res.status(400).json({ error: 'This class is already owned!' });
    await HiddenClassOwnership.claimClass(classId, character._id, character.name);
    character.inventory.splice(scrollIndex, 1);
    character.hiddenClass = classId;
    character.hiddenClassUnlocked = true;
    classInfo.skills.forEach(skill => { character.skills.push({ skillId: skill.skillId, name: skill.name, level: 1, unlocked: true }); });
    await character.save();
    res.json({ message: 'You awakened as ' + classInfo.name + '!', hiddenClass: classId, newSkills: classInfo.skills });
  } catch (error) { res.status(500).json({ error: error.message || 'Server error' }); }
});

router.post('/remove-hidden-class', authenticate, async (req, res) => {
  try {
    const character = await Character.findOne({ userId: req.userId });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    if (character.hiddenClass === 'none') return res.status(400).json({ error: 'No hidden class to remove' });
    const crystalIndex = character.inventory.findIndex(i => i.itemId === 'memory_crystal');
    if (crystalIndex === -1) return res.status(400).json({ error: 'Need Memory Crystal!' });
    await HiddenClassOwnership.releaseClass(character.hiddenClass, character._id);
    if (character.inventory[crystalIndex].quantity > 1) character.inventory[crystalIndex].quantity -= 1;
    else character.inventory.splice(crystalIndex, 1);
    const oldClass = character.hiddenClass;
    character.hiddenClass = 'none';
    character.hiddenClassUnlocked = false;
    const baseSkillIds = ['slash', 'heavyStrike', 'shieldBash', 'warCry', 'backstab', 'poisonBlade', 'smokeScreen', 'steal', 'preciseShot', 'multiShot', 'eagleEye', 'arrowRain', 'fireball', 'iceSpear', 'manaShield', 'thunderbolt'];
    character.skills = character.skills.filter(s => baseSkillIds.includes(s.skillId));
    await character.save();
    res.json({ message: 'Removed ' + oldClass + '. Now available for others.', hiddenClass: 'none' });
  } catch (error) { res.status(500).json({ error: error.message || 'Server error' }); }
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
      if (quantity < ingredient.quantity) return res.status(400).json({ error: 'Not enough ' + ingredient.name + '. Need ' + ingredient.quantity + ', have ' + quantity + '.' });
    }
    for (const ingredient of recipe.ingredients) {
      const itemIndex = character.inventory.findIndex(i => i.itemId === ingredient.id);
      if (character.inventory[itemIndex].quantity > ingredient.quantity) character.inventory[itemIndex].quantity -= ingredient.quantity;
      else character.inventory.splice(itemIndex, 1);
    }
    character.inventory.push({ itemId: recipe.result.id, name: recipe.result.name, type: 'special', rarity: 'rare', quantity: recipe.result.quantity });
    await character.save();
    res.json({ message: 'Crafted ' + recipe.result.name + '!', item: recipe.result });
  } catch (error) { res.status(500).json({ error: 'Server error' }); }
});

async function handleVictory(character, enemy, res, combatLog) {
  const rewards = { exp: enemy.expReward, gold: calculateGoldDrop(enemy.goldReward), items: [] };
  character.experience += rewards.exp;
  character.gold += rewards.gold;
  character.statistics.totalKills += 1;
  character.statistics.totalGoldEarned += rewards.gold;
  if (enemy.isElite) character.statistics.eliteKills += 1;
  if (enemy.isBoss) character.statistics.bossKills += 1;
  const leveledUp = character.checkLevelUp();
  const materialDrops = rollMaterialDrops(enemy.id, character.currentTower);
  materialDrops.forEach(drop => {
    const existingIndex = character.inventory.findIndex(i => i.itemId === drop.id);
    if (existingIndex >= 0) character.inventory[existingIndex].quantity += drop.quantity;
    else if (character.inventory.length < character.inventorySize) character.inventory.push(drop);
    rewards.items.push(drop);
  });
  const dropRate = enemy.isBoss ? DROP_RATES.boss : (enemy.isElite ? DROP_RATES.elite : DROP_RATES.normal);
  const equipmentTable = EQUIPMENT_DROPS['tower' + character.currentTower];
  const equipDrops = rollForDrops(enemy, dropRate, equipmentTable, character.baseClass);
  equipDrops.forEach(item => { if (character.inventory.length < character.inventorySize) { character.inventory.push(item); rewards.items.push(item); } });
  const scroll = rollForScroll(enemy, character.baseClass);
  if (scroll) {
    const classIdMap = { 'scroll_flameblade': 'flameblade', 'scroll_shadow_dancer': 'shadowDancer', 'scroll_storm_ranger': 'stormRanger', 'scroll_frost_weaver': 'frostWeaver' };
    const mappedClassId = classIdMap[scroll.id];
    try {
      if (mappedClassId) {
        const isAvailable = await HiddenClassOwnership.isClassAvailable(mappedClassId);
        if (isAvailable) { character.inventory.push({ itemId: scroll.id, name: scroll.name, type: 'scroll', rarity: 'rare', quantity: 1 }); rewards.items.push(scroll); rewards.scrollDropped = true; character.statistics.scrollsFound += 1; }
      }
    } catch (e) {}
  }
  if (enemy.isBoss && Math.random() < 0.1) {
    const existingIndex = character.inventory.findIndex(i => i.itemId === 'memory_crystal_fragment');
    if (existingIndex >= 0) character.inventory[existingIndex].quantity += 1;
    else character.inventory.push({ itemId: 'memory_crystal_fragment', name: 'Memory Crystal Fragment', icon: '💠', type: 'material', rarity: 'epic', quantity: 1 });
    rewards.items.push({ name: 'Memory Crystal Fragment', icon: '💠' });
    rewards.memoryCrystalFragment = true;
  }
  await character.save();
  const towerStory = STORY_EVENTS['tower' + character.currentTower];
  combatLog.push({ actor: 'system', message: 'Victory! Defeated ' + enemy.name + '!' });
  res.json({ status: 'victory', message: randomFrom(towerStory.victory).replace('{enemy}', enemy.name), combatLog, rewards, leveledUp, restPrompt: randomFrom(towerStory.rest_prompt), character: { level: character.level, experience: character.experience, experienceToNextLevel: character.experienceToNextLevel, gold: character.gold, statPoints: character.statPoints, hp: character.stats.hp, maxHp: character.stats.maxHp, mp: character.stats.mp, maxMp: character.stats.maxMp } });
}

async function handleDefeat(character, res, combatLog) {
  character.stats.hp = 0;
  character.statistics.deaths += 1;
  if (character.currentFloor < 10) character.currentFloor = 1;
  else if (character.currentFloor < 15) character.currentFloor = 10;
  await character.save();
  combatLog.push({ actor: 'system', message: 'You have been defeated!' });
  res.json({ status: 'defeat', message: 'Defeated! Progress reset to checkpoint.', combatLog, resetFloor: character.currentFloor, character: { hp: 0, maxHp: character.stats.maxHp } });
}

export default router;
