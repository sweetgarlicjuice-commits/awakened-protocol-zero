import express from 'express';
import Character from '../models/Character.js';
import HiddenClassOwnership from '../models/HiddenClassOwnership.js';
import { authenticate } from '../middleware/auth.js';
import { TOWERS, ENEMIES, DROP_RATES, EQUIPMENT_DROPS } from '../data/gameData.js';
import { FLOOR_REQUIREMENTS, MATERIAL_DROPS, STORY_EVENTS, DOORKEEPER_DIALOGUES, HIDDEN_CLASS_INFO, CRAFTING_RECIPES, STORY_EVENTS_EXPANDED, FLOOR_REQUIREMENTS_EXPANDED } from '../data/storyData.js';
import { 
  calculateDamage, 
  scaleEnemyStats, 
  getRandomEnemy, 
  calculateGoldDrop, 
  rollForDrops, 
  rollForScroll,
  applySkillEffects,
  processTurnStart,
  getEffectiveStats,
  checkExecuteCondition,
  formatCombatMessage
} from '../utils/combat.js';
import { getSkill } from '../data/skillDatabase.js';
import { addBuff, formatBuffsForDisplay } from '../data/buffSystem.js';

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
// 30 EXPLORATION SCENARIOS - DIVERSE REWARDS
// Focus on materials, buffs, consumables, lore - less gold
// ============================================================

const EXPLORATION_SCENARIOS = [
  // 1. Abandoned Camp
  {
    id: 'abandoned_camp',
    description: 'You discover an abandoned adventurer\'s camp. Supplies are scattered about. Do you SEARCH the belongings carefully or LEAVE them undisturbed?',
    choices: ['search', 'leave'],
    outcomes: {
      search: { type: 'random', successChance: 0.6, 
        success: { type: 'item_reward', message: 'You find useful supplies left behind!', itemType: 'consumable' },
        fail: { type: 'combat', message: 'A trap activates! The camp\'s guardian attacks!' }
      },
      leave: { type: 'safe_progress', message: 'You respectfully leave the camp. The path ahead feels clearer.', progressBonus: true }
    }
  },
  // 2. Mysterious Portal
  {
    id: 'mysterious_portal',
    description: 'A shimmering portal pulses with arcane energy. Strange whispers beckon you. ENTER the unknown or OBSERVE from safety?',
    choices: ['enter', 'observe'],
    outcomes: {
      enter: { type: 'combat_then_treasure', message: 'You step through into a pocket dimension! A guardian awaits!', chestChance: 0.8, itemReward: true },
      observe: { type: 'lore_reward', message: 'By studying the portal, you gain ancient knowledge.', loreType: 'arcane', expBonus: 25 }
    }
  },
  // 3. Lost Treasure Map
  {
    id: 'treasure_map',
    description: 'A half-burned treasure map lies on the ground. The remaining text hints at nearby riches. FOLLOW the clues or KEEP the map for later?',
    choices: ['follow', 'keep'],
    outcomes: {
      follow: { type: 'random', successChance: 0.5,
        success: { type: 'material_reward', message: 'The map leads you to a hidden cache of rare materials!', materialType: 'rare' },
        fail: { type: 'trap', message: 'The map was a decoy! You trigger a trap!', damagePercent: 15 }
      },
      keep: { type: 'item_gain', message: 'You pocket the map. It might be useful later.', itemId: 'treasure_map_fragment', itemName: 'Treasure Map Fragment' }
    }
  },
  // 4. Elder's Warning
  {
    id: 'elders_warning',
    description: 'A blind elder blocks your path. "Turn back," they rasp, "or accept my blessing to face what lies ahead." HEED their warning or ACCEPT the blessing?',
    choices: ['heed', 'accept'],
    outcomes: {
      heed: { type: 'safe_retreat', message: 'You take a different path, avoiding danger but finding a small shrine.', healPercent: 15 },
      accept: { type: 'buff_reward', message: 'The elder grants you a temporary blessing!', buffType: 'protection', buffDuration: 3 }
    }
  },
  // 5. Shifting Walls
  {
    id: 'shifting_walls',
    description: 'The walls begin to shift, creating a maze! Solve the PUZZLE to find the way, or FORCE through with brute strength?',
    choices: ['puzzle', 'force'],
    outcomes: {
      puzzle: { type: 'random', successChance: 0.6,
        success: { type: 'secret_room', message: 'You solve the puzzle! A hidden chamber opens!', chestChance: 0.9 },
        fail: { type: 'safe', message: 'The puzzle resets. You find the normal path.' }
      },
      force: { type: 'random', successChance: 0.4,
        success: { type: 'material_reward', message: 'You break through! Debris contains valuable ore!', materialType: 'ore' },
        fail: { type: 'damage', message: 'The walls crush you momentarily!', damagePercent: 20 }
      }
    }
  },
  // 6. Ancient Ruins
  {
    id: 'ancient_ruins',
    description: 'Crumbling ruins emerge from the shadows. Ancient power lingers here. EXPLORE the depths or STUDY the inscriptions?',
    choices: ['explore', 'study'],
    outcomes: {
      explore: { type: 'random', successChance: 0.5,
        success: { type: 'artifact_find', message: 'You discover an ancient artifact!', itemType: 'artifact' },
        fail: { type: 'combat', message: 'You disturb ancient guardians!' }
      },
      study: { type: 'lore_reward', message: 'The inscriptions reveal forgotten knowledge.', loreType: 'ancient', expBonus: 30, intBonus: true }
    }
  },
  // 7. Collapsed Bridge
  {
    id: 'collapsed_bridge',
    description: 'The bridge ahead has partially collapsed. You can see treasure glinting below. CLIMB down to investigate or JUMP across the gap?',
    choices: ['climb', 'jump'],
    outcomes: {
      climb: { type: 'random', successChance: 0.7,
        success: { type: 'material_reward', message: 'You find rare crystals in the chasm!', materialType: 'crystal' },
        fail: { type: 'damage', message: 'You slip and fall!', damagePercent: 15 }
      },
      jump: { type: 'random', successChance: 0.6,
        success: { type: 'safe_progress', message: 'You leap across gracefully!', progressBonus: true },
        fail: { type: 'damage', message: 'You barely make it, scraping yourself!', damagePercent: 10 }
      }
    }
  },
  // 8. Haunted Portrait
  {
    id: 'haunted_portrait',
    description: 'A portrait\'s eyes seem to follow you. The painting depicts a warrior holding a glowing sword. TOUCH the portrait or SPEAK to it?',
    choices: ['touch', 'speak'],
    outcomes: {
      touch: { type: 'random', successChance: 0.4,
        success: { type: 'buff_reward', message: 'The warrior\'s spirit empowers you!', buffType: 'attack', buffDuration: 3 },
        fail: { type: 'curse', message: 'A curse seeps into you!', debuffType: 'weakness', debuffDuration: 2 }
      },
      speak: { type: 'lore_reward', message: 'The spirit shares tales of ancient battles.', loreType: 'warrior', expBonus: 20 }
    }
  },
  // 9. Underground River
  {
    id: 'underground_river',
    description: 'An underground river blocks your path. Something shimmers beneath the surface. SWIM across or SEARCH for another way?',
    choices: ['swim', 'search'],
    outcomes: {
      swim: { type: 'random', successChance: 0.5,
        success: { type: 'material_reward', message: 'You grab glowing river stones!', materialType: 'aquatic' },
        fail: { type: 'combat', message: 'Aquatic creatures attack!' }
      },
      search: { type: 'safe_progress', message: 'You find a hidden crossing. Safe passage.', healPercent: 10 }
    }
  },
  // 10. Abandoned Forge
  {
    id: 'abandoned_forge',
    description: 'An ancient forge still burns with magical fire. Tools and materials lie scattered. REPAIR something or SALVAGE materials?',
    choices: ['repair', 'salvage'],
    outcomes: {
      repair: { type: 'random', successChance: 0.5,
        success: { type: 'equipment_upgrade', message: 'You enhance your equipment!', statBoost: true },
        fail: { type: 'damage', message: 'The forge explodes!', damagePercent: 20 }
      },
      salvage: { type: 'material_reward', message: 'You gather valuable smithing materials.', materialType: 'smithing', quantity: 3 }
    }
  },
  // 11. Frozen Statue
  {
    id: 'frozen_statue',
    description: 'A warrior frozen in ice blocks the path. Their expression shows determination. THAW them with fire or BREAK the ice?',
    choices: ['thaw', 'break'],
    outcomes: {
      thaw: { type: 'random', successChance: 0.5,
        success: { type: 'ally_reward', message: 'The warrior awakens and aids you briefly!', tempAlly: true },
        fail: { type: 'combat', message: 'The warrior awakens hostile and confused!' }
      },
      break: { type: 'material_reward', message: 'The ice shatters into magical shards.', materialType: 'ice', quantity: 2 }
    }
  },
  // 12. Injured Beast
  {
    id: 'injured_beast',
    description: 'A majestic beast lies wounded, watching you warily. It could be dangerous or grateful. HEAL it or LEAVE it be?',
    choices: ['heal', 'leave'],
    outcomes: {
      heal: { type: 'random', successChance: 0.7,
        success: { type: 'companion_buff', message: 'The beast becomes a temporary ally!', buffType: 'companion', buffDuration: 3 },
        fail: { type: 'damage', message: 'The beast lashes out in fear!', damagePercent: 15 }
      },
      leave: { type: 'safe', message: 'You carefully back away. The beast watches you go.' }
    }
  },
  // 13. Ancient Shrine
  {
    id: 'ancient_shrine',
    description: 'A shrine pulses with divine energy. Offerings lie at its base. PRAY for blessing or TAKE the offerings?',
    choices: ['pray', 'take'],
    outcomes: {
      pray: { type: 'blessing', message: 'Divine energy restores you!', healPercent: 30, mpRestore: 20 },
      take: { type: 'random', successChance: 0.3,
        success: { type: 'material_reward', message: 'You claim the offerings safely.', materialType: 'divine' },
        fail: { type: 'curse', message: 'The gods are displeased!', damagePercent: 25 }
      }
    }
  },
  // 14. Dark Silhouette
  {
    id: 'dark_silhouette',
    description: 'A dark figure watches from the shadows. It doesn\'t move, but you sense power. CONFRONT it or SNEAK past?',
    choices: ['confront', 'sneak'],
    outcomes: {
      confront: { type: 'combat_elite', message: 'The shadow reveals itself - an elite enemy!' },
      sneak: { type: 'random', successChance: 0.6,
        success: { type: 'safe_progress', message: 'You slip past unnoticed.', progressBonus: true },
        fail: { type: 'combat', message: 'It spots you and attacks!' }
      }
    }
  },
  // 15. Poisonous Garden
  {
    id: 'poisonous_garden',
    description: 'Beautiful but deadly flowers fill this chamber. Their pollen could be valuable. HARVEST carefully or PASS through quickly?',
    choices: ['harvest', 'pass'],
    outcomes: {
      harvest: { type: 'random', successChance: 0.5,
        success: { type: 'item_reward', message: 'You gather rare alchemical ingredients!', itemType: 'alchemy' },
        fail: { type: 'poison', message: 'The spores overwhelm you!', damagePercent: 15, poisonDuration: 2 }
      },
      pass: { type: 'safe_progress', message: 'You hold your breath and hurry through.' }
    }
  },
  // 16. Falling Debris
  {
    id: 'falling_debris',
    description: 'The ceiling is unstable. Rocks begin to fall. CLEAR the path or FIND cover and wait?',
    choices: ['clear', 'cover'],
    outcomes: {
      clear: { type: 'random', successChance: 0.5,
        success: { type: 'material_reward', message: 'You find ore in the rubble!', materialType: 'ore', quantity: 2 },
        fail: { type: 'damage', message: 'Rocks strike you!', damagePercent: 20 }
      },
      cover: { type: 'safe', message: 'You wait safely until the dust settles.' }
    }
  },
  // 17. Magic Mirror
  {
    id: 'magic_mirror',
    description: 'A mirror shows a twisted version of yourself. It beckons. MERGE with your reflection or SHATTER the mirror?',
    choices: ['merge', 'shatter'],
    outcomes: {
      merge: { type: 'random', successChance: 0.4,
        success: { type: 'buff_reward', message: 'You absorb shadow power!', buffType: 'shadow', buffDuration: 3 },
        fail: { type: 'combat', message: 'Your shadow self attacks!' }
      },
      shatter: { type: 'material_reward', message: 'Enchanted glass shards fall.', materialType: 'enchanted', quantity: 2 }
    }
  },
  // 18. Hidden Chamber
  {
    id: 'hidden_chamber',
    description: 'A wall panel slides open revealing a hidden room. It could be a treasury or a trap. ENTER carefully or SEAL it back?',
    choices: ['enter', 'seal'],
    outcomes: {
      enter: { type: 'random', successChance: 0.6,
        success: { type: 'treasure_room', message: 'A small treasury! Various valuables!', chestChance: 0.9, materialReward: true },
        fail: { type: 'trap', message: 'It was a trap room!', damagePercent: 20 }
      },
      seal: { type: 'lore_reward', message: 'You notice inscriptions before sealing. Knowledge gained.', loreType: 'secret', expBonus: 15 }
    }
  },
  // 19. Spirit Tomb
  {
    id: 'spirit_tomb',
    description: 'An ornate tomb emanates spectral energy. The spirit within might grant power or demand tribute. COMMUNE or RESPECT from afar?',
    choices: ['commune', 'respect'],
    outcomes: {
      commune: { type: 'random', successChance: 0.5,
        success: { type: 'artifact_find', message: 'The spirit gifts you an artifact!', itemType: 'spirit_artifact' },
        fail: { type: 'curse', message: 'The spirit drains your energy!', damagePercent: 20, mpDrain: 30 }
      },
      respect: { type: 'blessing', message: 'The spirit appreciates your reverence.', healPercent: 15, expBonus: 10 }
    }
  },
  // 20. Cursed Relic
  {
    id: 'cursed_relic',
    description: 'A glowing relic pulses with corrupted energy. Power emanates from it. CLEANSE it or ABSORB its power?',
    choices: ['cleanse', 'absorb'],
    outcomes: {
      cleanse: { type: 'random', successChance: 0.6,
        success: { type: 'purified_relic', message: 'You purify the relic!', itemType: 'purified_relic' },
        fail: { type: 'safe', message: 'The corruption resists. The relic crumbles.' }
      },
      absorb: { type: 'random', successChance: 0.4,
        success: { type: 'buff_reward', message: 'Dark power surges through you!', buffType: 'dark_power', buffDuration: 3, damageBoost: 30 },
        fail: { type: 'curse', message: 'The corruption overwhelms you!', damagePercent: 25, debuffDuration: 3 }
      }
    }
  },
  // 21. Temporal Anomaly
  {
    id: 'temporal_anomaly',
    description: 'Time itself warps here. A broken timepiece floats in the distortion. REPAIR the timepiece or PASS through the anomaly?',
    choices: ['repair', 'pass'],
    outcomes: {
      repair: { type: 'random', successChance: 0.5,
        success: { type: 'time_buff', message: 'Time slows around you!', buffType: 'haste', buffDuration: 3 },
        fail: { type: 'debuff', message: 'Time accelerates against you!', debuffType: 'slow', debuffDuration: 2 }
      },
      pass: { type: 'random', successChance: 0.7,
        success: { type: 'safe_progress', message: 'You navigate the anomaly safely.' },
        fail: { type: 'damage', message: 'Temporal energy burns you!', damagePercent: 15 }
      }
    }
  },
  // 22. Blood Moon Chamber
  {
    id: 'blood_moon',
    description: 'A crimson glow fills this chamber. The blood moon\'s power is concentrated here. EMBRACE the power or RESIST its call?',
    choices: ['embrace', 'resist'],
    outcomes: {
      embrace: { type: 'buff_with_cost', message: 'Power surges through you, but at a cost!', buffType: 'berserker', buffDuration: 3, damagePercent: 10 },
      resist: { type: 'safe_progress', message: 'You resist the corruption and find inner strength.', healPercent: 10, mpRestore: 15 }
    }
  },
  // 23. Collapsed Tunnel
  {
    id: 'collapsed_tunnel',
    description: 'A side tunnel has collapsed, but you hear water and see light through cracks. DIG through or CONTINUE on the main path?',
    choices: ['dig', 'continue'],
    outcomes: {
      dig: { type: 'random', successChance: 0.5,
        success: { type: 'secret_area', message: 'You discover a hidden spring!', healPercent: 40, materialReward: true },
        fail: { type: 'combat', message: 'Burrowing creatures attack!' }
      },
      continue: { type: 'safe_progress', message: 'You continue safely on the known path.' }
    }
  },
  // 24. Cursed Fountain
  {
    id: 'cursed_fountain',
    description: 'A fountain of dark water bubbles before you. It might heal or corrupt. DRINK from it or PURIFY it first?',
    choices: ['drink', 'purify'],
    outcomes: {
      drink: { type: 'random', successChance: 0.3,
        success: { type: 'major_heal', message: 'The water is miraculously healing!', healPercent: 50 },
        fail: { type: 'curse', message: 'Corruption seeps into you!', damagePercent: 20, debuffDuration: 2 }
      },
      purify: { type: 'blessing', message: 'You cleanse the fountain. Pure water flows.', healPercent: 25, mpRestore: 25 }
    }
  },
  // 25. Undead Patrol
  {
    id: 'undead_patrol',
    description: 'A patrol of undead marches past. They haven\'t noticed you yet. AMBUSH them or FOLLOW silently?',
    choices: ['ambush', 'follow'],
    outcomes: {
      ambush: { type: 'combat_advantage', message: 'You strike first with advantage!', firstStrike: true },
      follow: { type: 'random', successChance: 0.7,
        success: { type: 'treasure_discovery', message: 'They lead you to their treasure hoard!', chestChance: 0.8 },
        fail: { type: 'combat', message: 'They spot you and attack!' }
      }
    }
  },
  // 26. Cryptic Message
  {
    id: 'cryptic_message',
    description: 'Strange symbols are carved into the wall. They seem to form a message or spell. DECIPHER them or COPY them for later?',
    choices: ['decipher', 'copy'],
    outcomes: {
      decipher: { type: 'random', successChance: 0.6,
        success: { type: 'spell_knowledge', message: 'You understand! Magical knowledge floods your mind!', expBonus: 40, intBonus: true },
        fail: { type: 'confusion', message: 'The symbols make your head spin.', debuffType: 'confusion', debuffDuration: 1 }
      },
      copy: { type: 'item_gain', message: 'You carefully copy the symbols.', itemId: 'cryptic_scroll', itemName: 'Cryptic Scroll' }
    }
  },
  // 27. Ruined Library
  {
    id: 'ruined_library',
    description: 'Ancient books line collapsed shelves. Knowledge waits to be discovered. SEARCH the shelves or STUDY the readable tomes?',
    choices: ['search', 'study'],
    outcomes: {
      search: { type: 'random', successChance: 0.6,
        success: { type: 'rare_book', message: 'You find a rare skill tome!', itemType: 'skill_tome' },
        fail: { type: 'safe', message: 'Most books are too damaged. You find nothing special.' }
      },
      study: { type: 'lore_reward', message: 'You gain wisdom from ancient texts.', loreType: 'wisdom', expBonus: 35, intBonus: true }
    }
  },
  // 28. Whispering Woods (Chamber)
  {
    id: 'whispering_woods',
    description: 'This chamber is overgrown with strange trees. Whispers echo from within. LISTEN to the whispers or CUT through quickly?',
    choices: ['listen', 'cut'],
    outcomes: {
      listen: { type: 'random', successChance: 0.5,
        success: { type: 'nature_blessing', message: 'The forest spirits bless you!', healPercent: 25, buffType: 'nature', buffDuration: 3 },
        fail: { type: 'curse', message: 'The whispers drive you mad momentarily!', debuffType: 'confusion', debuffDuration: 2 }
      },
      cut: { type: 'material_reward', message: 'You harvest rare wood and herbs.', materialType: 'nature', quantity: 3 }
    }
  },
  // 29. Merchant Spirit
  {
    id: 'merchant_spirit',
    description: 'A ghostly merchant appears, offering trades. They want materials, not gold. TRADE with them or BANISH the spirit?',
    choices: ['trade', 'banish'],
    outcomes: {
      trade: { type: 'spirit_trade', message: 'The merchant offers mystical goods!', tradeAvailable: true },
      banish: { type: 'random', successChance: 0.5,
        success: { type: 'spirit_essence', message: 'The spirit leaves behind essence!', materialType: 'spirit', quantity: 2 },
        fail: { type: 'curse', message: 'The merchant curses you before fleeing!', debuffType: 'bad_luck', debuffDuration: 2 }
      }
    }
  },
  // 30. Final Challenge
  {
    id: 'final_challenge',
    description: 'A glowing doorway blocks the path. It demands proof of worth. DEMONSTRATE strength or SHOW wisdom?',
    choices: ['strength', 'wisdom'],
    outcomes: {
      strength: { type: 'combat_trial', message: 'A trial by combat begins!', eliteChance: 0.5, rewardBonus: true },
      wisdom: { type: 'random', successChance: 0.6,
        success: { type: 'wisdom_reward', message: 'Your knowledge impresses the door!', expBonus: 50, itemReward: true },
        fail: { type: 'safe', message: 'The door finds you lacking, but allows passage.' }
      }
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
    
    // Check energy - consume 10 energy ONLY when entering tower
    if (character.energy < ENERGY_PER_FLOOR) {
      return res.status(400).json({ error: 'Not enough energy! Need ' + ENERGY_PER_FLOOR + ' energy to enter tower.' });
    }
    
    // Consume energy on entry
    character.energy -= ENERGY_PER_FLOOR;
    
    character.currentTower = towerId;
    // Keep progress for this tower if any
    if (!character.towerProgress) character.towerProgress = {};
    const savedFloor = character.towerProgress['tower' + towerId] || 1;
    character.currentFloor = savedFloor;
    
    // Set in-tower flag
    character.isInTower = true;
    
    await character.save();
    res.json({ message: 'Entered ' + tower.name + ' (-' + ENERGY_PER_FLOOR + ' energy)', tower, currentFloor: character.currentFloor, energyUsed: ENERGY_PER_FLOOR });
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
    
    // NO ENERGY CHECK HERE - energy is consumed on tower entry only
    if (character.stats.hp <= 0) return res.status(400).json({ error: 'You are defeated! Rest to recover.' });
    const floor = character.currentFloor;
    if (floor === 10) return res.json({ type: 'safe_zone', message: 'You reached the Safe Zone!', story: 'A peaceful sanctuary amidst the chaos. Your progress is saved here.', floor: 10 });
    
    // NO ENERGY DEDUCTION - already consumed on tower entry
    
    // MULTI-EVENT SYSTEM: Determine how many events this exploration will have (2-3)
    const totalEvents = Math.random() < 0.4 ? 3 : 2;
    const currentEvent = 1;
    
    // Store exploration progress in character (temporary)
    character.explorationProgress = {
      totalEvents: totalEvents,
      currentEvent: currentEvent,
      eventsCompleted: [],
      floor: floor
    };
    character.markModified('explorationProgress');
    
    await character.save();
    
    // Pick a random scenario for the first event
    const scenario = EXPLORATION_SCENARIOS[Math.floor(Math.random() * EXPLORATION_SCENARIOS.length)];
    
    res.json({ 
      type: 'exploration', 
      floor, 
      scenarioId: scenario.id,
      story: '📍 Event ' + currentEvent + ' of ' + totalEvents + '\n\n' + scenario.description, 
      choices: scenario.choices, 
      energyRemaining: character.energy,
      eventProgress: {
        current: currentEvent,
        total: totalEvents
      }
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
    
    // Get exploration progress
    const progress = character.explorationProgress || { totalEvents: 1, currentEvent: 1 };
    
    // Find scenario
    const scenario = EXPLORATION_SCENARIOS.find(s => s.id === scenarioId) || EXPLORATION_SCENARIOS[0];
    const outcome = scenario.outcomes[choice] || scenario.outcomes[scenario.choices[0]];
    
    // Process outcome
    let resultType = outcome.type;
    let message = outcome.message;
    let enemy = null;
    let treasure = null;
    let rewards = { items: [], materials: [], buffs: [], exp: 0, gold: 0 };
    let healAmount = 0;
    let mpRestore = 0;
    let damageAmount = outcome.damagePercent ? Math.floor(character.stats.maxHp * outcome.damagePercent / 100) : 0;
    
    // Handle random outcomes
    if (resultType === 'random') {
      const roll = Math.random();
      if (roll < (outcome.successChance || 0.5)) {
        // Success
        resultType = outcome.success.type || 'safe';
        message = outcome.success.message;
        if (outcome.success.healPercent) healAmount = Math.floor(character.stats.maxHp * outcome.success.healPercent / 100);
        if (outcome.success.damagePercent) damageAmount = Math.floor(character.stats.maxHp * outcome.success.damagePercent / 100);
        if (outcome.success.chestChance) treasure = { chestChance: outcome.success.chestChance };
        if (outcome.success.expBonus) rewards.exp = outcome.success.expBonus;
        if (outcome.success.materialType) rewards.materials.push({ type: outcome.success.materialType, quantity: outcome.success.quantity || 1 });
        if (outcome.success.buffType) rewards.buffs.push({ type: outcome.success.buffType, duration: outcome.success.buffDuration || 3 });
      } else {
        // Fail
        resultType = outcome.fail.type || 'damage';
        message = outcome.fail.message;
        if (outcome.fail.damagePercent) damageAmount = Math.floor(character.stats.maxHp * outcome.fail.damagePercent / 100);
        if (outcome.fail.debuffType) rewards.buffs.push({ type: outcome.fail.debuffType, duration: outcome.fail.debuffDuration || 2, isDebuff: true });
      }
    }
    
    // Helper function to give material rewards
    const giveMaterial = (materialType, quantity) => {
      const materials = {
        rare: { id: 'rare_material', name: 'Rare Material', icon: '💎' },
        ore: { id: 'tower_ore', name: 'Tower Ore', icon: '🪨' },
        crystal: { id: 'magic_crystal', name: 'Magic Crystal', icon: '🔮' },
        aquatic: { id: 'aquatic_essence', name: 'Aquatic Essence', icon: '💧' },
        smithing: { id: 'smithing_material', name: 'Smithing Material', icon: '⚒️' },
        ice: { id: 'frost_shard', name: 'Frost Shard', icon: '❄️' },
        divine: { id: 'divine_essence', name: 'Divine Essence', icon: '✨' },
        enchanted: { id: 'enchanted_glass', name: 'Enchanted Glass', icon: '🪞' },
        spirit: { id: 'spirit_essence', name: 'Spirit Essence', icon: '👻' },
        nature: { id: 'nature_essence', name: 'Nature Essence', icon: '🌿' }
      };
      const mat = materials[materialType] || materials.rare;
      addItemToInventory(character, mat.id, mat.name, mat.icon, 'material', 'uncommon', quantity, {}, 15);
      return mat;
    };
    
    // Helper to check for next event in multi-event exploration
    const checkNextEvent = async () => {
      if (progress.currentEvent < progress.totalEvents) {
        progress.currentEvent += 1;
        progress.eventsCompleted.push(scenarioId);
        character.explorationProgress = progress;
        character.markModified('explorationProgress');
        await character.save();
        
        // Get next scenario (avoid repeats)
        let nextScenario;
        do {
          nextScenario = EXPLORATION_SCENARIOS[Math.floor(Math.random() * EXPLORATION_SCENARIOS.length)];
        } while (progress.eventsCompleted.includes(nextScenario.id) && progress.eventsCompleted.length < EXPLORATION_SCENARIOS.length);
        
        return {
          hasNext: true,
          nextScenario: nextScenario,
          eventProgress: { current: progress.currentEvent, total: progress.totalEvents }
        };
      }
      // Clear progress after last event
      character.explorationProgress = null;
      character.markModified('explorationProgress');
      return { hasNext: false };
    };
    
    // Apply effects based on type
    switch (resultType) {
      case 'combat':
      case 'combat_then_treasure':
      case 'combat_reward':
      case 'combat_elite':
      case 'combat_advantage':
      case 'combat_trial':
        // Spawn enemy based on type
        if (floor === 15) {
          enemy = scaleEnemyStats(towerEnemies.boss, floor, character.currentTower);
        } else if (resultType === 'combat_elite' || (resultType === 'combat_trial' && Math.random() < 0.5) || (floor >= 13 && Math.random() < 0.4)) {
          enemy = getRandomEnemy(towerEnemies.elite, floor);
          enemy = scaleEnemyStats(enemy, floor, character.currentTower);
        } else {
          enemy = getRandomEnemy(towerEnemies.normal, floor);
          enemy = scaleEnemyStats(enemy, floor, character.currentTower);
        }
        if (resultType === 'combat_then_treasure') treasure = { chestChance: outcome.chestChance || 0.5 };
        if (resultType === 'combat_advantage') treasure = { firstStrike: true };
        if (resultType === 'combat_trial') treasure = { bonusRewards: true };
        break;
        
      case 'curse':
      case 'curse_damage':
      case 'trap':
      case 'damage':
      case 'poison':
        damageAmount = damageAmount || Math.floor(character.stats.maxHp * (outcome.damagePercent || 15) / 100);
        character.stats.hp = Math.max(1, character.stats.hp - damageAmount);
        await character.save();
        const nextAfterDamage = await checkNextEvent();
        if (nextAfterDamage.hasNext) {
          return res.json({ 
            type: 'damage_continue', 
            message: message + '\n\n⚠️ -' + damageAmount + ' HP', 
            damage: damageAmount, 
            hp: character.stats.hp, 
            maxHp: character.stats.maxHp,
            nextEvent: {
              scenarioId: nextAfterDamage.nextScenario.id,
              story: '📍 Event ' + nextAfterDamage.eventProgress.current + ' of ' + nextAfterDamage.eventProgress.total + '\n\n' + nextAfterDamage.nextScenario.description,
              choices: nextAfterDamage.nextScenario.choices
            },
            eventProgress: nextAfterDamage.eventProgress
          });
        }
        return res.json({ type: 'damage', message, damage: damageAmount, hp: character.stats.hp, maxHp: character.stats.maxHp });
        
      case 'blessing':
      case 'heal':
      case 'major_heal':
      case 'nature_blessing':
        healAmount = Math.floor(character.stats.maxHp * (outcome.healPercent || 20) / 100);
        character.stats.hp = Math.min(character.stats.maxHp, character.stats.hp + healAmount);
        if (outcome.mpRestore) {
          mpRestore = outcome.mpRestore;
          character.stats.mp = Math.min(character.stats.maxMp, character.stats.mp + mpRestore);
        }
        if (outcome.expBonus) {
          character.experience += outcome.expBonus;
          rewards.exp = outcome.expBonus;
        }
        await character.save();
        const nextAfterHeal = await checkNextEvent();
        if (nextAfterHeal.hasNext) {
          return res.json({ 
            type: 'heal_continue', 
            message: message + '\n\n💚 +' + healAmount + ' HP' + (mpRestore ? ' | +' + mpRestore + ' MP' : ''), 
            heal: healAmount, 
            mpRestore: mpRestore,
            hp: character.stats.hp, 
            maxHp: character.stats.maxHp,
            nextEvent: {
              scenarioId: nextAfterHeal.nextScenario.id,
              story: '📍 Event ' + nextAfterHeal.eventProgress.current + ' of ' + nextAfterHeal.eventProgress.total + '\n\n' + nextAfterHeal.nextScenario.description,
              choices: nextAfterHeal.nextScenario.choices
            },
            eventProgress: nextAfterHeal.eventProgress
          });
        }
        return res.json({ type: 'heal', message, heal: healAmount, mpRestore, hp: character.stats.hp, maxHp: character.stats.maxHp, mp: character.stats.mp, maxMp: character.stats.maxMp });
      
      case 'buff_reward':
      case 'buff_with_cost':
        if (resultType === 'buff_with_cost' && outcome.damagePercent) {
          damageAmount = Math.floor(character.stats.maxHp * outcome.damagePercent / 100);
          character.stats.hp = Math.max(1, character.stats.hp - damageAmount);
        }
        // Buffs are temporary - just message for now
        await character.save();
        const nextAfterBuff = await checkNextEvent();
        if (nextAfterBuff.hasNext) {
          return res.json({ 
            type: 'buff_continue', 
            message: message + '\n\n✨ Gained ' + (outcome.buffType || 'unknown') + ' buff!', 
            buffType: outcome.buffType,
            buffDuration: outcome.buffDuration || 3,
            damage: damageAmount,
            hp: character.stats.hp,
            maxHp: character.stats.maxHp,
            nextEvent: {
              scenarioId: nextAfterBuff.nextScenario.id,
              story: '📍 Event ' + nextAfterBuff.eventProgress.current + ' of ' + nextAfterBuff.eventProgress.total + '\n\n' + nextAfterBuff.nextScenario.description,
              choices: nextAfterBuff.nextScenario.choices
            },
            eventProgress: nextAfterBuff.eventProgress
          });
        }
        return res.json({ type: 'buff', message, buffType: outcome.buffType, buffDuration: outcome.buffDuration || 3, damage: damageAmount, hp: character.stats.hp, maxHp: character.stats.maxHp });
      
      case 'material_reward':
      case 'spirit_essence':
        const matType = outcome.materialType || 'rare';
        const matQty = outcome.quantity || 1;
        const material = giveMaterial(matType, matQty);
        await character.save();
        const nextAfterMat = await checkNextEvent();
        if (nextAfterMat.hasNext) {
          return res.json({ 
            type: 'material_continue', 
            message: message + '\n\n📦 +' + matQty + ' ' + material.name, 
            material: material,
            quantity: matQty,
            nextEvent: {
              scenarioId: nextAfterMat.nextScenario.id,
              story: '📍 Event ' + nextAfterMat.eventProgress.current + ' of ' + nextAfterMat.eventProgress.total + '\n\n' + nextAfterMat.nextScenario.description,
              choices: nextAfterMat.nextScenario.choices
            },
            eventProgress: nextAfterMat.eventProgress
          });
        }
        return res.json({ type: 'material', message, material: material, quantity: matQty });
      
      case 'item_reward':
      case 'item_gain':
      case 'artifact_find':
      case 'rare_book':
      case 'purified_relic':
        // Give a consumable or special item
        const itemTypes = {
          consumable: { id: 'health_potion_small', name: 'Health Potion', icon: '🧪' },
          alchemy: { id: 'alchemy_ingredient', name: 'Alchemy Ingredient', icon: '⚗️' },
          artifact: { id: 'ancient_artifact', name: 'Ancient Artifact', icon: '🏺' },
          skill_tome: { id: 'skill_tome', name: 'Skill Tome', icon: '📖' },
          spirit_artifact: { id: 'spirit_artifact', name: 'Spirit Artifact', icon: '👻' },
          purified_relic: { id: 'purified_relic', name: 'Purified Relic', icon: '🌟' }
        };
        const itemInfo = itemTypes[outcome.itemType] || itemTypes.consumable;
        if (outcome.itemId) {
          addItemToInventory(character, outcome.itemId, outcome.itemName || 'Unknown Item', '📜', 'material', 'uncommon', 1, {}, 10);
        } else {
          addItemToInventory(character, itemInfo.id, itemInfo.name, itemInfo.icon, 'consumable', 'uncommon', 1, {}, 20);
        }
        await character.save();
        const nextAfterItem = await checkNextEvent();
        if (nextAfterItem.hasNext) {
          return res.json({ 
            type: 'item_continue', 
            message: message + '\n\n📦 Received ' + (outcome.itemName || itemInfo.name) + '!', 
            item: outcome.itemName || itemInfo.name,
            nextEvent: {
              scenarioId: nextAfterItem.nextScenario.id,
              story: '📍 Event ' + nextAfterItem.eventProgress.current + ' of ' + nextAfterItem.eventProgress.total + '\n\n' + nextAfterItem.nextScenario.description,
              choices: nextAfterItem.nextScenario.choices
            },
            eventProgress: nextAfterItem.eventProgress
          });
        }
        return res.json({ type: 'item', message, item: outcome.itemName || itemInfo.name });
      
      case 'lore_reward':
      case 'spell_knowledge':
      case 'wisdom_reward':
        const expGain = outcome.expBonus || 20;
        character.experience += expGain;
        character.checkLevelUp();
        await character.save();
        const nextAfterLore = await checkNextEvent();
        if (nextAfterLore.hasNext) {
          return res.json({ 
            type: 'lore_continue', 
            message: message + '\n\n📚 +' + expGain + ' EXP', 
            exp: expGain,
            loreType: outcome.loreType,
            nextEvent: {
              scenarioId: nextAfterLore.nextScenario.id,
              story: '📍 Event ' + nextAfterLore.eventProgress.current + ' of ' + nextAfterLore.eventProgress.total + '\n\n' + nextAfterLore.nextScenario.description,
              choices: nextAfterLore.nextScenario.choices
            },
            eventProgress: nextAfterLore.eventProgress
          });
        }
        return res.json({ type: 'lore', message, exp: expGain, loreType: outcome.loreType });
        
      case 'safe':
      case 'safe_progress':
      case 'safe_retreat':
        if (outcome.healPercent) {
          healAmount = Math.floor(character.stats.maxHp * outcome.healPercent / 100);
          character.stats.hp = Math.min(character.stats.maxHp, character.stats.hp + healAmount);
        }
        await character.save();
        const nextAfterSafe = await checkNextEvent();
        if (nextAfterSafe.hasNext) {
          return res.json({ 
            type: 'safe_continue', 
            message: message + (healAmount ? '\n\n💚 +' + healAmount + ' HP' : ''), 
            heal: healAmount,
            hp: character.stats.hp,
            maxHp: character.stats.maxHp,
            nextEvent: {
              scenarioId: nextAfterSafe.nextScenario.id,
              story: '📍 Event ' + nextAfterSafe.eventProgress.current + ' of ' + nextAfterSafe.eventProgress.total + '\n\n' + nextAfterSafe.nextScenario.description,
              choices: nextAfterSafe.nextScenario.choices
            },
            eventProgress: nextAfterSafe.eventProgress
          });
        }
        return res.json({ type: 'safe', message, heal: healAmount, hp: character.stats.hp, maxHp: character.stats.maxHp });
      
      case 'secret_room':
      case 'treasure_room':
      case 'secret_area':
      case 'treasure':
      case 'treasure_discovery':
        // Give treasure
        const treasureGold = Math.floor(30 + Math.random() * 70);
        character.gold += treasureGold;
        if (outcome.healPercent) {
          healAmount = Math.floor(character.stats.maxHp * outcome.healPercent / 100);
          character.stats.hp = Math.min(character.stats.maxHp, character.stats.hp + healAmount);
        }
        if (outcome.materialReward) {
          giveMaterial('rare', 1);
        }
        await character.save();
        const nextAfterTreasure = await checkNextEvent();
        if (nextAfterTreasure.hasNext) {
          return res.json({ 
            type: 'treasure_continue', 
            message: message + '\n\n💰 +' + treasureGold + ' gold!' + (healAmount ? ' | +' + healAmount + ' HP' : ''), 
            gold: treasureGold,
            totalGold: character.gold,
            heal: healAmount,
            hp: character.stats.hp,
            maxHp: character.stats.maxHp,
            nextEvent: {
              scenarioId: nextAfterTreasure.nextScenario.id,
              story: '📍 Event ' + nextAfterTreasure.eventProgress.current + ' of ' + nextAfterTreasure.eventProgress.total + '\n\n' + nextAfterTreasure.nextScenario.description,
              choices: nextAfterTreasure.nextScenario.choices
            },
            eventProgress: nextAfterTreasure.eventProgress
          });
        }
        return res.json({ type: 'treasure', message, gold: treasureGold, totalGold: character.gold, heal: healAmount, hp: character.stats.hp, maxHp: character.stats.maxHp, foundChest: true });
      
      case 'spirit_trade':
        // Special trade event - give small gold for now
        character.gold += 25;
        await character.save();
        return res.json({ type: 'spirit_trade', message, gold: 25, totalGold: character.gold });
      
      case 'ally_reward':
      case 'companion_buff':
        await character.save();
        const nextAfterAlly = await checkNextEvent();
        if (nextAfterAlly.hasNext) {
          return res.json({ 
            type: 'ally_continue', 
            message: message + '\n\n🐾 Temporary ally gained!', 
            nextEvent: {
              scenarioId: nextAfterAlly.nextScenario.id,
              story: '📍 Event ' + nextAfterAlly.eventProgress.current + ' of ' + nextAfterAlly.eventProgress.total + '\n\n' + nextAfterAlly.nextScenario.description,
              choices: nextAfterAlly.nextScenario.choices
            },
            eventProgress: nextAfterAlly.eventProgress
          });
        }
        return res.json({ type: 'ally', message });
      
      case 'time_buff':
      case 'debuff':
      case 'confusion':
        await character.save();
        const nextAfterDebuff = await checkNextEvent();
        if (nextAfterDebuff.hasNext) {
          return res.json({ 
            type: 'effect_continue', 
            message: message, 
            effectType: outcome.debuffType || outcome.buffType,
            nextEvent: {
              scenarioId: nextAfterDebuff.nextScenario.id,
              story: '📍 Event ' + nextAfterDebuff.eventProgress.current + ' of ' + nextAfterDebuff.eventProgress.total + '\n\n' + nextAfterDebuff.nextScenario.description,
              choices: nextAfterDebuff.nextScenario.choices
            },
            eventProgress: nextAfterDebuff.eventProgress
          });
        }
        return res.json({ type: 'effect', message, effectType: outcome.debuffType || outcome.buffType });
      
      case 'equipment_upgrade':
        // Temporary stat boost message
        await character.save();
        return res.json({ type: 'upgrade', message });
        
      default:
        await character.save();
        const nextDefault = await checkNextEvent();
        if (nextDefault.hasNext) {
          return res.json({ 
            type: 'continue', 
            message: message, 
            nextEvent: {
              scenarioId: nextDefault.nextScenario.id,
              story: '📍 Event ' + nextDefault.eventProgress.current + ' of ' + nextDefault.eventProgress.total + '\n\n' + nextDefault.nextScenario.description,
              choices: nextDefault.nextScenario.choices
            },
            eventProgress: nextDefault.eventProgress
          });
        }
        return res.json({ type: 'safe', message: message || 'You continue onward.', floor });
    }
    
    // If we have an enemy, start combat
    if (enemy) {
      await character.save();
      return res.json({ 
        type: 'combat_start', 
        story: message, 
        enemy, 
        floor, 
        isBoss: enemy.isBoss || false, 
        isElite: enemy.isElite || false, 
        treasureAfter: treasure,
        eventProgress: { current: progress.currentEvent, total: progress.totalEvents }
      });
    }
    
    res.json({ type: 'safe', message: message || 'You continue onward.', floor });
  } catch (error) { 
    console.error(error);
    res.status(500).json({ error: 'Server error' }); 
  }
});

// combat/attack
router.post('/combat/attack', authenticate, async (req, res) => {
  try {
    const { enemy, treasureAfter } = req.body;
    const character = await Character.findOne({ userId: req.userId });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    
    // Initialize activeBuffs if not exists
    if (!character.activeBuffs) character.activeBuffs = [];
    if (!enemy.activeBuffs) enemy.activeBuffs = [];
    
    const combatLog = [];
    
    // === PLAYER TURN START ===
    const playerTurnStart = processTurnStart(character);
    if (playerTurnStart.damage > 0) {
      character.stats.hp -= playerTurnStart.damage;
      playerTurnStart.messages.forEach(msg => combatLog.push({ actor: 'system', message: msg }));
    }
    if (playerTurnStart.healing > 0) {
      character.stats.hp = Math.min(character.stats.hp + playerTurnStart.healing, character.stats.maxHp);
    }
    
    // Check if player dies from DoT
    if (character.stats.hp <= 0) {
      return await handleDefeat(character, res, combatLog);
    }
    
    // Check stun/freeze
    if (playerTurnStart.skipTurn) {
      // Enemy turn
      const enemyDamage = calculateDamage(enemy, character);
      if (!enemyDamage.missed) {
        character.stats.hp -= enemyDamage.damage;
        combatLog.push({ 
          actor: 'enemy', 
          damage: enemyDamage.damage, 
          message: `${enemy.name} attacks for ${enemyDamage.damage} damage!` 
        });
      }
      if (character.stats.hp <= 0) return await handleDefeat(character, res, combatLog);
      await character.save();
      return res.json({ 
        status: 'ongoing', 
        combatLog, 
        enemy: { ...enemy, hp: Math.max(0, enemy.hp), activeBuffs: enemy.activeBuffs },
        character: { 
          hp: character.stats.hp, 
          maxHp: character.stats.maxHp, 
          mp: character.stats.mp, 
          maxMp: character.stats.maxMp,
          activeBuffs: formatBuffsForDisplay(character.activeBuffs)
        }
      });
    }
    
    // === PLAYER ATTACK ===
    const playerDamage = calculateDamage(character, enemy);
    
    if (playerDamage.missed) {
      combatLog.push({ actor: 'player', message: 'Your attack missed!' });
    } else {
      enemy.hp -= playerDamage.damage;
      
      // Apply reflect damage
      if (playerDamage.reflectDamage > 0) {
        character.stats.hp -= playerDamage.reflectDamage;
      }
      
      // Apply lifesteal healing
      if (playerDamage.lifestealHeal > 0) {
        character.stats.hp = Math.min(character.stats.hp + playerDamage.lifestealHeal, character.stats.maxHp);
      }
      
      const messages = formatCombatMessage(playerDamage, 'You', enemy.name);
      messages.forEach(msg => combatLog.push({ 
        actor: 'player', 
        damage: playerDamage.damage, 
        isCritical: playerDamage.isCritical,
        element: playerDamage.element,
        message: msg 
      }));
    }
    
    // Check victory
    if (enemy.hp <= 0) {
      return await handleVictory(character, enemy, res, combatLog, treasureAfter);
    }
    
    // === ENEMY TURN START ===
    const enemyTurnStart = processTurnStart(enemy);
    if (enemyTurnStart.damage > 0) {
      enemy.hp -= enemyTurnStart.damage;
      enemyTurnStart.messages.forEach(msg => combatLog.push({ actor: 'system', message: msg }));
    }
    
    // Check if enemy dies from DoT
    if (enemy.hp <= 0) {
      return await handleVictory(character, enemy, res, combatLog, treasureAfter);
    }
    
    // Enemy attack (if not stunned)
    if (!enemyTurnStart.skipTurn) {
      const enemyDamage = calculateDamage(enemy, character);
      
      if (!enemyDamage.missed) {
        character.stats.hp -= enemyDamage.damage;
        combatLog.push({ 
          actor: 'enemy', 
          damage: enemyDamage.damage, 
          message: `${enemy.name} attacks for ${enemyDamage.damage} damage!` 
        });
        
        // Enemy reflect damage
        if (enemyDamage.reflectDamage > 0) {
          enemy.hp -= enemyDamage.reflectDamage;
          combatLog.push({ actor: 'system', message: `🪞 Reflected ${enemyDamage.reflectDamage} damage!` });
        }
      } else {
        combatLog.push({ actor: 'enemy', message: `${enemy.name}'s attack missed!` });
      }
    } else {
      enemyTurnStart.messages.forEach(msg => combatLog.push({ actor: 'system', message: msg }));
    }
    
    if (character.stats.hp <= 0) return await handleDefeat(character, res, combatLog);
    
    await character.save();
    res.json({ 
      status: 'ongoing', 
      combatLog, 
      enemy: { 
        ...enemy, 
        hp: Math.max(0, enemy.hp),
        activeBuffs: formatBuffsForDisplay(enemy.activeBuffs, 'debuff')
      },
      character: { 
        hp: character.stats.hp, 
        maxHp: character.stats.maxHp, 
        mp: character.stats.mp, 
        maxMp: character.stats.maxMp,
        activeBuffs: formatBuffsForDisplay(character.activeBuffs, 'buff')
      }
    });
  } catch (error) {
    console.error('Combat attack error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// combat/skill
router.post('/combat/skill', authenticate, async (req, res) => {
  try {
    const { enemy, skillId, treasureAfter } = req.body;
    const character = await Character.findOne({ userId: req.userId });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    
    // Initialize activeBuffs if not exists
    if (!character.activeBuffs) character.activeBuffs = [];
    if (!enemy.activeBuffs) enemy.activeBuffs = [];
    
    // Validate skill
    const characterSkill = character.skills.find(s => s.skillId === skillId);
    if (!characterSkill || !characterSkill.unlocked) {
      return res.status(400).json({ error: 'Skill not available' });
    }
    
    // Get skill data from database
    const skill = getSkill(skillId);
    if (!skill) {
      return res.status(400).json({ error: 'Invalid skill' });
    }
    
    // Check MP
    if (character.stats.mp < skill.mpCost) {
      return res.status(400).json({ error: 'Not enough MP!' });
    }
    
    // Check execute conditions
    const executeCheck = checkExecuteCondition(skill, enemy);
    if (!executeCheck.canUse) {
      return res.status(400).json({ error: executeCheck.reason });
    }
    
    const combatLog = [];
    
    // === PLAYER TURN START (DoTs, etc) ===
    const playerTurnStart = processTurnStart(character);
    if (playerTurnStart.damage > 0) {
      character.stats.hp -= playerTurnStart.damage;
      playerTurnStart.messages.forEach(msg => combatLog.push({ actor: 'system', message: msg }));
    }
    if (playerTurnStart.healing > 0) {
      character.stats.hp = Math.min(character.stats.hp + playerTurnStart.healing, character.stats.maxHp);
    }
    
    if (character.stats.hp <= 0) {
      return await handleDefeat(character, res, combatLog);
    }
    
    // Check stun
    if (playerTurnStart.skipTurn) {
      // Skip to enemy turn
      const enemyDamage = calculateDamage(enemy, character);
      if (!enemyDamage.missed) {
        character.stats.hp -= enemyDamage.damage;
        combatLog.push({ actor: 'enemy', damage: enemyDamage.damage, message: `${enemy.name} attacks for ${enemyDamage.damage} damage!` });
      }
      if (character.stats.hp <= 0) return await handleDefeat(character, res, combatLog);
      await character.save();
      return res.json({ 
        status: 'ongoing', 
        combatLog, 
        enemy: { ...enemy, hp: Math.max(0, enemy.hp), activeBuffs: enemy.activeBuffs },
        character: { hp: character.stats.hp, maxHp: character.stats.maxHp, mp: character.stats.mp, maxMp: character.stats.maxMp, activeBuffs: formatBuffsForDisplay(character.activeBuffs) }
      });
    }
    
    // === USE SKILL ===
    character.stats.mp -= skill.mpCost;
    
    // Calculate damage (if damaging skill)
    if (skill.type === 'damage' || (skill.scaling && skill.scaling.stat)) {
      const damageResult = calculateDamage(character, enemy, skill, {
        neverMiss: skill.effects?.some(e => e.type === 'neverMiss')
      });
      
      // Apply execute bonus
      if (executeCheck.bonusMultiplier > 0) {
        damageResult.damage = Math.floor(damageResult.damage * (1 + executeCheck.bonusMultiplier));
        combatLog.push({ actor: 'system', message: '💀 Execute bonus!' });
      }
      
      if (damageResult.isHeal) {
        // Healing skill
        character.stats.hp = Math.min(character.stats.hp + damageResult.damage, character.stats.maxHp);
        combatLog.push({ 
          actor: 'player', 
          skillName: skill.name, 
          healing: damageResult.damage,
          mpCost: skill.mpCost,
          message: `${skill.name}! Healed ${damageResult.damage} HP! (-${skill.mpCost} MP)`
        });
      } else if (!damageResult.missed) {
        enemy.hp -= damageResult.damage;
        
        // Handle reflect
        if (damageResult.reflectDamage > 0) {
          character.stats.hp -= damageResult.reflectDamage;
        }
        
        // Handle lifesteal
        if (damageResult.lifestealHeal > 0) {
          character.stats.hp = Math.min(character.stats.hp + damageResult.lifestealHeal, character.stats.maxHp);
        }
        
        const elementIcon = { fire: '🔥', water: '💧', lightning: '⚡', earth: '🌍', nature: '🌿', ice: '❄️', dark: '🌑', holy: '✨' }[skill.element] || '';
        
        combatLog.push({ 
          actor: 'player', 
          skillName: skill.name, 
          damage: damageResult.damage,
          isCritical: damageResult.isCritical,
          element: skill.element,
          hits: damageResult.hits,
          mpCost: skill.mpCost,
          message: `${skill.name}${elementIcon}! ${damageResult.hits > 1 ? `${damageResult.hits} hits for ` : ''}${damageResult.damage} damage!${damageResult.isCritical ? ' 💥CRIT!' : ''} (-${skill.mpCost} MP)`
        });
        
        // Add additional messages
        if (damageResult.messages) {
          damageResult.messages.forEach(msg => combatLog.push({ actor: 'system', message: msg }));
        }
      } else {
        combatLog.push({ actor: 'player', skillName: skill.name, mpCost: skill.mpCost, message: `${skill.name} missed! (-${skill.mpCost} MP)` });
      }
    }
    
    // === APPLY SKILL EFFECTS (Buffs/Debuffs) ===
    const effectResults = applySkillEffects(skill, character, enemy);
    
    // Apply buffs to attacker
    effectResults.attackerBuffs.forEach(buff => {
      character.activeBuffs = addBuff(character.activeBuffs, buff);
    });
    
    // Apply debuffs to defender
    effectResults.defenderDebuffs.forEach(debuff => {
      enemy.activeBuffs = addBuff(enemy.activeBuffs, debuff);
    });
    
    // Log effect messages
    effectResults.messages.forEach(msg => combatLog.push({ actor: 'system', message: msg }));
    
    // Handle self-damage (Berserker skills)
    if (effectResults.selfDamage) {
      character.stats.hp -= effectResults.selfDamage;
    }
    
    // Pure buff skills (no damage)
    if (skill.type === 'buff' || skill.type === 'debuff' || skill.type === 'utility') {
      combatLog.push({ 
        actor: 'player', 
        skillName: skill.name, 
        mpCost: skill.mpCost,
        message: `${skill.name} activated! (-${skill.mpCost} MP)`
      });
    }
    
    // Check victory
    if (enemy.hp <= 0) {
      return await handleVictory(character, enemy, res, combatLog, treasureAfter);
    }
    
    // Check player death from self-damage
    if (character.stats.hp <= 0) {
      return await handleDefeat(character, res, combatLog);
    }
    
    // === ENEMY TURN ===
    const enemyTurnStart = processTurnStart(enemy);
    if (enemyTurnStart.damage > 0) {
      enemy.hp -= enemyTurnStart.damage;
      enemyTurnStart.messages.forEach(msg => combatLog.push({ actor: 'system', message: msg }));
    }
    
    if (enemy.hp <= 0) {
      return await handleVictory(character, enemy, res, combatLog, treasureAfter);
    }
    
    if (!enemyTurnStart.skipTurn) {
      const enemyDamage = calculateDamage(enemy, character);
      if (!enemyDamage.missed) {
        character.stats.hp -= enemyDamage.damage;
        combatLog.push({ actor: 'enemy', damage: enemyDamage.damage, message: `${enemy.name} attacks for ${enemyDamage.damage} damage!` });
        
        if (enemyDamage.reflectDamage > 0) {
          enemy.hp -= enemyDamage.reflectDamage;
          combatLog.push({ actor: 'system', message: `🪞 Reflected ${enemyDamage.reflectDamage} damage!` });
        }
      }
    } else {
      enemyTurnStart.messages.forEach(msg => combatLog.push({ actor: 'system', message: msg }));
    }
    
    if (character.stats.hp <= 0) return await handleDefeat(character, res, combatLog);
    
    await character.save();
    res.json({ 
      status: 'ongoing', 
      combatLog, 
      enemy: { 
        ...enemy, 
        hp: Math.max(0, enemy.hp),
        activeBuffs: formatBuffsForDisplay(enemy.activeBuffs, 'debuff')
      },
      character: { 
        hp: character.stats.hp, 
        maxHp: character.stats.maxHp, 
        mp: character.stats.mp, 
        maxMp: character.stats.maxMp,
        activeBuffs: formatBuffsForDisplay(character.activeBuffs, 'buff')
      }
    });
  } catch (error) {
    console.error('Combat skill error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// combat/flee
router.post('/combat/flee', authenticate, async (req, res) => {
  try {
    const { enemy } = req.body;
    const character = await Character.findOne({ userId: req.userId });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    
    if (enemy.isBoss) {
      return res.status(400).json({ error: 'Cannot flee from boss battles!' });
    }
    
    // Calculate flee chance based on AGI (evasion)
    const derived = getEffectiveStats(character);
    const fleeChance = 0.3 + (derived.evasion / 100);
    
    if (Math.random() < fleeChance) {
      // Clear combat buffs on flee
      character.activeBuffs = [];
      await character.save();
      return res.json({ status: 'fled', message: 'You successfully fled!', success: true });
    }
    
    // Failed to flee - enemy attacks
    const enemyDamage = calculateDamage(enemy, character);
    character.stats.hp -= enemyDamage.damage;
    
    if (character.stats.hp <= 0) {
      return await handleDefeat(character, res, [{ 
        actor: 'system', 
        message: `Failed to flee! ${enemy.name} strikes you down!` 
      }]);
    }
    
    await character.save();
    res.json({ 
      status: 'ongoing', 
      message: `Failed to flee! ${enemy.name} attacks for ${enemyDamage.damage} damage!`, 
      success: false, 
      enemy,
      character: { 
        hp: character.stats.hp, 
        maxHp: character.stats.maxHp,
        activeBuffs: formatBuffsForDisplay(character.activeBuffs || [])
      }
    });
  } catch (error) {
    console.error('Flee error:', error);
    res.status(500).json({ error: 'Server error' });
  }
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
    
    // Clear in-tower flag
    character.isInTower = false;
    
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
  
  // BALANCED DROP RATES (Phase 6.1):
  // Normal: 18% materials, 7% equipment, 2% set item
  // Elite: 30% materials, 15% equipment, 7% set item
  // Boss: 50% materials, 25% equipment, 18% set item, 6% scroll, 10% memory fragment
  
  const otherDropRate = enemy.isBoss ? 0.50 : (enemy.isElite ? 0.30 : 0.18);
  const equipDropRate = enemy.isBoss ? 0.25 : (enemy.isElite ? 0.15 : 0.07);
  const crystalFragmentRate = enemy.isBoss ? 0.10 : 0;
  
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
    // Set item rates: Boss 18%, Elite 7%, Normal 2%
    const customDropRate = { equipment: 1.0, setItem: enemy.isBoss ? 0.18 : (enemy.isElite ? 0.07 : 0.02) };
    const equipDrops = rollForDrops(enemy, customDropRate, equipmentTable, character.baseClass, character.currentTower);
    equipDrops.forEach(item => {
      if (character.inventory.length < character.inventorySize) {
        const itemId = item.itemId || item.id || (item.name.toLowerCase().replace(/\s+/g, '_'));
        addItemToInventory(character, itemId, item.name, item.icon, item.type, item.rarity, item.quantity || 1, item.stats, item.sellPrice);
        rewards.items.push(item);
      }
    });
  }
  
  // Scroll drops - BOSS ONLY at 6%
  if (enemy.isBoss) {
    const scrollChance = 0.06;
    if (Math.random() < scrollChance) {
      const scrollMap = {
        swordsman: { id: 'scroll_flameblade', name: 'Flameblade Scroll' },
        thief: { id: 'scroll_shadow_dancer', name: 'Shadow Dancer Scroll' },
        archer: { id: 'scroll_storm_ranger', name: 'Storm Ranger Scroll' },
        mage: { id: 'scroll_frost_weaver', name: 'Frost Weaver Scroll' }
      };
      const scroll = scrollMap[character.baseClass];
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
    }
  }
  
  // Memory crystal fragment - 10% for boss only
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
  
   // Clear combat buffs on victory
  character.activeBuffs = [];
  
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
  
  // Clear in-tower flag on defeat
  character.isInTower = false;
  
   // Clear combat buffs on defeat
  character.activeBuffs = [];
  
  await character.save();
  combatLog.push({ actor: 'system', message: 'You have been defeated!' });
  res.json({ status: 'defeat', message: 'Defeated! Progress reset to checkpoint.', combatLog, resetFloor: checkpoint, character: { hp: 0, maxHp: character.stats.maxHp } });
}

export default router;
