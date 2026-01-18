import express from 'express';
import Character, { CLASS_BASE_STATS } from '../models/Character.js';
import { authenticate } from '../middleware/auth.js';
import { getEquipmentById } from '../data/equipment/index.js';
import { CONSUMABLES } from '../data/equipment/consumables.js';

const router = express.Router();

// ============================================================
// PHASE 9.3.9: Helper to get any item by ID
// ============================================================
const CONSUMABLES_BY_ID = {};
if (Array.isArray(CONSUMABLES)) {
  CONSUMABLES.forEach(c => { CONSUMABLES_BY_ID[c.id] = c; });
} else if (typeof CONSUMABLES === 'object' && CONSUMABLES) {
  Object.assign(CONSUMABLES_BY_ID, CONSUMABLES);
}

function getItemById(itemId) {
  // Check equipment
  const equipment = getEquipmentById ? getEquipmentById(itemId) : null;
  if (equipment) return equipment;
  
  // Check consumables
  if (CONSUMABLES_BY_ID[itemId]) return CONSUMABLES_BY_ID[itemId];
  
  return null;
}

// Enrich inventory item with full data from equipment database
function enrichInventoryItem(invItem) {
  const fullItemData = getItemById(invItem.itemId);
  
  if (fullItemData) {
    return {
      ...invItem,
      stats: fullItemData.stats || invItem.stats || {},
      slot: fullItemData.slot || invItem.slot || invItem.subtype || null,
      levelReq: fullItemData.levelReq || invItem.levelReq || null,
      classReq: fullItemData.classReq || fullItemData.class || invItem.classReq || null,
      rarity: fullItemData.rarity || invItem.rarity || 'common',
      effect: fullItemData.effect || invItem.effect || null,
      setId: fullItemData.setId || invItem.setId || null
    };
  }
  
  return invItem;
}

// ============================================================
// PHASE 7: Updated Class Info with 5 Hidden Classes per Base
// ============================================================
const CLASS_INFO = {
  swordsman: {
    name: 'Swordsman',
    description: 'A mighty warrior who excels in close combat. High HP and strength make them formidable tanks.',
    icon: '⚔️',
    primaryStat: 'STR',
    playstyle: 'Melee Tank/DPS',
    hiddenClass: {
      name: 'Flameblade',
      description: 'Masters the power of fire, dealing burn damage over time and wielding blazing weapons.',
      icon: '🔥'
    },
    // All 5 available hidden classes for this base
    hiddenClasses: [
      { id: 'flameblade', name: 'Flameblade', icon: '🔥', description: 'Masters fire, deals burn DoT' },
      { id: 'berserker', name: 'Berserker', icon: '💢', description: 'Sacrifice HP for massive damage' },
      { id: 'paladin', name: 'Paladin', icon: '✨', description: 'Holy warrior with healing powers' },
      { id: 'earthshaker', name: 'Earthshaker', icon: '🌍', description: 'Earth magic, defense debuffs' },
      { id: 'frostguard', name: 'Frostguard', icon: '❄️', description: 'Ice tank with frost shields' }
    ]
  },
  thief: {
    name: 'Thief',
    description: 'A swift assassin who strikes from the shadows. High agility grants evasion and critical hits.',
    icon: '🗡️',
    primaryStat: 'AGI',
    playstyle: 'Stealth Assassin',
    hiddenClass: {
      name: 'Shadow Dancer',
      description: 'One with the darkness, capable of true invisibility and devastating backstabs.',
      icon: '🌑'
    },
    hiddenClasses: [
      { id: 'shadowDancer', name: 'Shadow Dancer', icon: '🌑', description: 'Stealth and shadow attacks' },
      { id: 'venomancer', name: 'Venomancer', icon: '🐍', description: 'Poison master with deadly DoTs' },
      { id: 'assassin', name: 'Assassin', icon: '⚫', description: 'Execute skills, instant kills' },
      { id: 'phantom', name: 'Phantom', icon: '👻', description: 'Ethereal, ignores defense' },
      { id: 'bloodreaper', name: 'Bloodreaper', icon: '🩸', description: 'Lifesteal specialist' }
    ]
  },
  archer: {
    name: 'Archer',
    description: 'A precise marksman who rains death from afar. Dexterity ensures every shot counts.',
    icon: '🏹',
    primaryStat: 'DEX',
    playstyle: 'Ranged DPS',
    hiddenClass: {
      name: 'Storm Ranger',
      description: 'Commands lightning itself, arrows that chain between enemies with electric fury.',
      icon: '⚡'
    },
    hiddenClasses: [
      { id: 'stormRanger', name: 'Storm Ranger', icon: '⚡', description: 'Lightning arrows, chain attacks' },
      { id: 'pyroArcher', name: 'Pyro Archer', icon: '🔥', description: 'Fire arrows with explosions' },
      { id: 'frostSniper', name: 'Frost Sniper', icon: '❄️', description: 'Ice shots, freeze enemies' },
      { id: 'natureWarden', name: 'Nature Warden', icon: '🌿', description: 'Nature magic with healing' },
      { id: 'voidHunter', name: 'Void Hunter', icon: '🌀', description: 'Dark arrows, armor pierce' }
    ]
  },
  mage: {
    name: 'Mage',
    description: 'A master of arcane arts who wields devastating elemental spells. Intelligence is their weapon.',
    icon: '🔮',
    primaryStat: 'INT',
    playstyle: 'Elemental Caster',
    hiddenClass: {
      name: 'Frost Weaver',
      description: 'Absolute zero incarnate, freezing enemies solid before shattering them completely.',
      icon: '❄️'
    },
    hiddenClasses: [
      { id: 'frostWeaver', name: 'Frost Weaver', icon: '❄️', description: 'Ice magic, freeze specialist' },
      { id: 'pyromancer', name: 'Pyromancer', icon: '🔥', description: 'Fire magic, burn everything' },
      { id: 'stormcaller', name: 'Stormcaller', icon: '⚡', description: 'Lightning spells, AoE damage' },
      { id: 'necromancer', name: 'Necromancer', icon: '💀', description: 'Dark magic, lifesteal' },
      { id: 'arcanist', name: 'Arcanist', icon: '✨', description: 'Pure arcane, multi-hit spells' }
    ]
  }
};

// GET /api/character/classes - Get class information
router.get('/classes', (req, res) => {
  const classes = Object.entries(CLASS_INFO).map(([key, info]) => ({
    id: key,
    ...info,
    baseStats: CLASS_BASE_STATS[key]
  }));
  res.json({ classes });
});

// POST /api/character/create - Create new character
router.post('/create', authenticate, async (req, res) => {
  try {
    const { name, baseClass } = req.body;
    
    // Check if user already has a character
    const existingCharacter = await Character.findOne({ userId: req.userId });
    if (existingCharacter) {
      return res.status(400).json({ error: 'You already have a character.' });
    }
    
    // Validate class
    if (!['swordsman', 'thief', 'archer', 'mage'].includes(baseClass)) {
      return res.status(400).json({ error: 'Invalid class selected.' });
    }
    
    // Validate name
    if (!name || name.length < 2 || name.length > 20) {
      return res.status(400).json({ error: 'Character name must be 2-20 characters.' });
    }
    
    // Check if character name is taken
    const nameTaken = await Character.findOne({ name: name.trim() });
    if (nameTaken) {
      return res.status(400).json({ error: 'Character name is already taken.' });
    }
    
    const character = new Character({
      userId: req.userId,
      name: name.trim(),
      baseClass
    });
    
    await character.save();
    
    res.status(201).json({
      message: 'Character created successfully',
      character
    });
  } catch (error) {
    console.error('Create character error:', error);
    res.status(500).json({ error: 'Server error creating character.' });
  }
});

// GET /api/character - Get current character
// PHASE 9.3.9: Enrich inventory items with full data from equipment database
router.get('/', authenticate, async (req, res) => {
  try {
    const character = await Character.findOne({ userId: req.userId });
    
    if (!character) {
      return res.status(404).json({ error: 'No character found. Please create one.' });
    }
    
    // Update energy based on time passed
    character.updateEnergy();
    character.lastPlayed = new Date();
    await character.save();
    
    // Convert to plain object so we can modify it
    const charObj = character.toObject();
    
    // Enrich inventory items with full data from equipment database
    if (charObj.inventory && charObj.inventory.length > 0) {
      charObj.inventory = charObj.inventory.map(enrichInventoryItem);
    }
    
    res.json({
      character: charObj,
      classInfo: CLASS_INFO[character.baseClass]
    });
  } catch (error) {
    console.error('Get character error:', error);
    res.status(500).json({ error: 'Server error fetching character.' });
  }
});

// POST /api/character/allocate-stats - Allocate stat points
router.post('/allocate-stats', authenticate, async (req, res) => {
  try {
    const { stats } = req.body; // { str: 2, agi: 1, etc. }
    
    const character = await Character.findOne({ userId: req.userId });
    
    if (!character) {
      return res.status(404).json({ error: 'Character not found.' });
    }
    
    // Calculate total points being allocated
    const totalPoints = Object.values(stats).reduce((sum, val) => sum + val, 0);
    
    if (totalPoints > character.statPoints) {
      return res.status(400).json({ error: 'Not enough stat points.' });
    }
    
    // Validate stat names
    const validStats = ['str', 'agi', 'dex', 'int', 'vit'];
    for (const stat of Object.keys(stats)) {
      if (!validStats.includes(stat)) {
        return res.status(400).json({ error: `Invalid stat: ${stat}` });
      }
      if (stats[stat] < 0) {
        return res.status(400).json({ error: 'Cannot allocate negative points.' });
      }
    }
    
    // Apply stats
    for (const [stat, points] of Object.entries(stats)) {
      character.stats[stat] += points;
    }
    
    // Update derived stats
    character.stats.maxHp = character.stats.vit * 10 + 50;
    character.stats.maxMp = character.stats.int * 8 + 20;
    character.stats.hp = Math.min(character.stats.hp, character.stats.maxHp);
    character.stats.mp = Math.min(character.stats.mp, character.stats.maxMp);
    
    character.statPoints -= totalPoints;
    await character.save();
    
    res.json({
      message: 'Stats allocated successfully',
      character
    });
  } catch (error) {
    console.error('Allocate stats error:', error);
    res.status(500).json({ error: 'Server error allocating stats.' });
  }
});

// POST /api/character/rest - Rest to recover HP/MP (costs gold)
// REST COST = level × 250 gold
router.post('/rest', authenticate, async (req, res) => {
  try {
    const character = await Character.findOne({ userId: req.userId });
    
    if (!character) {
      return res.status(404).json({ error: 'Character not found.' });
    }
    
    // Check if player is inside tower - cannot rest while in tower
    if (character.isInTower) {
      return res.status(400).json({ error: 'Cannot rest while inside a tower! Leave the tower first.' });
    }
    
    const restCost = character.level * 250;
    
    if (character.gold < restCost) {
      return res.status(400).json({ error: `Not enough gold. Rest costs ${restCost} gold.` });
    }
    
    character.gold -= restCost;
    character.stats.hp = character.stats.maxHp;
    character.stats.mp = character.stats.maxMp;
    await character.save();
    
    res.json({
      message: 'You rest and recover fully.',
      goldSpent: restCost,
      character
    });
  } catch (error) {
    console.error('Rest error:', error);
    res.status(500).json({ error: 'Server error during rests.' });
  }
});

export default router;
