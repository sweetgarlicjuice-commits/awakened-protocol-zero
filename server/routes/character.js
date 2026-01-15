import express from 'express';
import Character, { CLASS_BASE_STATS, CLASS_DEFAULT_SKILLS } from '../models/Character.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Use CLASS_DEFAULT_SKILLS from Character model for consistency
const CLASS_SKILLS = CLASS_DEFAULT_SKILLS;

// Class descriptions for frontend
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
    }
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
    }
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
    }
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
    }
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
    
    // Get skills for this class
    const classSkills = CLASS_SKILLS[baseClass] || [];
    
    const character = new Character({
      userId: req.userId,
      name: name.trim(),
      baseClass,
      skills: classSkills  // Initialize with class skills!
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
router.get('/', authenticate, async (req, res) => {
  try {
    const character = await Character.findOne({ userId: req.userId });
    
    if (!character) {
      return res.status(404).json({ error: 'No character found. Please create one.' });
    }
    
    // Update energy based on time passed
    character.updateEnergy();
    character.lastPlayed = new Date();
    
    // FIX: If character has no skills, initialize them based on class
    if (!character.skills || character.skills.length === 0) {
      const classSkills = CLASS_SKILLS[character.baseClass] || [];
      character.skills = classSkills;
      console.log('Initialized missing skills for character:', character.name);
    }
    
    await character.save();
    
    res.json({
      character,
      classInfo: CLASS_INFO[character.baseClass]
    });
  } catch (error) {
    console.error('Get character error:', error);
    res.status(500).json({ error: 'Server error fetching character.' });
  }
});

// POST /api/character/repair-skills - Repair missing skills for existing characters
router.post('/repair-skills', authenticate, async (req, res) => {
  try {
    const character = await Character.findOne({ userId: req.userId });
    
    if (!character) {
      return res.status(404).json({ error: 'Character not found.' });
    }
    
    // Get class skills
    const classSkills = CLASS_SKILLS[character.baseClass] || [];
    
    // Check which skills are missing
    const existingSkillIds = (character.skills || []).map(s => s.skillId);
    const missingSkills = classSkills.filter(s => !existingSkillIds.includes(s.skillId));
    
    if (missingSkills.length === 0) {
      return res.json({ 
        message: 'All skills already present!', 
        skills: character.skills 
      });
    }
    
    // Add missing skills
    character.skills = [...(character.skills || []), ...missingSkills];
    await character.save();
    
    res.json({
      message: `Repaired ${missingSkills.length} missing skills!`,
      addedSkills: missingSkills,
      allSkills: character.skills
    });
  } catch (error) {
    console.error('Repair skills error:', error);
    res.status(500).json({ error: 'Server error repairing skills.' });
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
    res.status(500).json({ error: 'Server error during rest.' });
  }
});

export default router;
