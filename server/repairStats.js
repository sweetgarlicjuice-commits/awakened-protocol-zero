// ============================================================
// REPAIR SCRIPT: Fix existing characters with default stats
// Run this ONCE after deploying the new Character.js
// ============================================================
// 
// How to use:
// 1. Add this to server/scripts/repairStats.js
// 2. Run: node server/scripts/repairStats.js
// OR
// 3. Add as a GM endpoint in server/routes/gm.js
// ============================================================

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Base stats configuration - MUST match Character.js
const CLASS_BASE_STATS = {
  swordsman: { hp: 150, mp: 50, str: 15, agi: 8, dex: 8, int: 5, vit: 14 },
  thief: { hp: 100, mp: 70, str: 8, agi: 15, dex: 12, int: 7, vit: 8 },
  archer: { hp: 110, mp: 60, str: 10, agi: 12, dex: 15, int: 6, vit: 7 },
  mage: { hp: 80, mp: 120, str: 5, agi: 7, dex: 8, int: 15, vit: 5 }
};

async function repairAllCharacters() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Get Character model
    const Character = mongoose.model('Character', new mongoose.Schema({}, { strict: false }));
    
    // Find all characters
    const characters = await Character.find({});
    console.log(`Found ${characters.length} characters to check`);
    
    let repaired = 0;
    
    for (const char of characters) {
      const baseStats = CLASS_BASE_STATS[char.baseClass];
      if (!baseStats) {
        console.log(`Skipping ${char.name}: unknown class ${char.baseClass}`);
        continue;
      }
      
      // Check if stats are default (10 for all) - indicates broken character
      const isDefault = char.stats.str === 10 && 
                        char.stats.agi === 10 && 
                        char.stats.dex === 10 && 
                        char.stats.int === 10 && 
                        char.stats.vit === 10;
      
      if (isDefault) {
        console.log(`\nRepairing ${char.name} (${char.baseClass})...`);
        console.log(`  Before: STR=${char.stats.str} AGI=${char.stats.agi} DEX=${char.stats.dex} INT=${char.stats.int} VIT=${char.stats.vit}`);
        
        // Apply class base stats
        char.stats.str = baseStats.str;
        char.stats.agi = baseStats.agi;
        char.stats.dex = baseStats.dex;
        char.stats.int = baseStats.int;
        char.stats.vit = baseStats.vit;
        char.stats.hp = baseStats.hp;
        char.stats.maxHp = baseStats.hp;
        char.stats.mp = baseStats.mp;
        char.stats.maxMp = baseStats.mp;
        
        await char.save();
        
        console.log(`  After:  STR=${char.stats.str} AGI=${char.stats.agi} DEX=${char.stats.dex} INT=${char.stats.int} VIT=${char.stats.vit}`);
        repaired++;
      } else {
        console.log(`${char.name} (${char.baseClass}): OK`);
      }
    }
    
    console.log(`\n========================================`);
    console.log(`Repair complete! Fixed ${repaired}/${characters.length} characters`);
    console.log(`========================================`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run if called directly
repairAllCharacters();
