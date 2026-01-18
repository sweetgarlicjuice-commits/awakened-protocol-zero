import mongoose from 'mongoose';

// ============================================================
// HIDDEN CLASS OWNERSHIP MODEL
// Tracks which player owns which hidden class
// Each hidden class can only be owned by ONE player at a time
// ============================================================

// All 20 hidden classes (5 per base class)
const ALL_HIDDEN_CLASSES = [
  // Swordsman (5)
  'flameblade', 'berserker', 'paladin', 'earthshaker', 'frostguard',
  // Thief (5)
  'shadowDancer', 'venomancer', 'assassin', 'phantom', 'bloodreaper',
  // Archer (5)
  'stormRanger', 'pyroArcher', 'frostSniper', 'natureWarden', 'voidHunter',
  // Mage (5)
  'frostWeaver', 'pyromancer', 'stormcaller', 'necromancer', 'arcanist'
];

const hiddenClassOwnershipSchema = new mongoose.Schema({
  classId: {
    type: String,
    enum: ALL_HIDDEN_CLASSES,
    required: true,
    unique: true
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Character',
    default: null
  },
  ownerName: {
    type: String,
    default: null
  },
  acquiredAt: {
    type: Date,
    default: null
  },
  previousOwners: [{
    ownerId: mongoose.Schema.Types.ObjectId,
    ownerName: String,
    acquiredAt: Date,
    removedAt: Date
  }]
});

// ============================================================
// STATIC METHODS
// ============================================================

/**
 * Initialize all 20 hidden classes as available
 * Call this on server startup to ensure all classes exist in DB
 */
hiddenClassOwnershipSchema.statics.initializeClasses = async function() {
  for (const classId of ALL_HIDDEN_CLASSES) {
    const existing = await this.findOne({ classId });
    if (!existing) {
      await this.create({ classId, ownerId: null, ownerName: null });
      console.log(`[HiddenClass] Initialized ${classId} as available`);
    }
  }
  console.log(`[HiddenClass] All ${ALL_HIDDEN_CLASSES.length} hidden classes initialized`);
};

/**
 * Check if a class is available (not owned by anyone)
 */
hiddenClassOwnershipSchema.statics.isClassAvailable = async function(classId) {
  // First check if it's a valid class
  if (!ALL_HIDDEN_CLASSES.includes(classId)) {
    console.warn(`[HiddenClass] Invalid class ID: ${classId}`);
    return false;
  }
  
  const classRecord = await this.findOne({ classId });
  
  // If no record exists, create it (class is available)
  if (!classRecord) {
    await this.create({ classId, ownerId: null, ownerName: null });
    return true;
  }
  
  return classRecord.ownerId === null;
};

/**
 * Claim a class for a player
 */
hiddenClassOwnershipSchema.statics.claimClass = async function(classId, characterId, characterName) {
  // Validate class ID
  if (!ALL_HIDDEN_CLASSES.includes(classId)) {
    throw new Error(`Invalid hidden class: ${classId}`);
  }
  
  let classRecord = await this.findOne({ classId });
  
  // Create record if doesn't exist
  if (!classRecord) {
    classRecord = await this.create({ classId, ownerId: null, ownerName: null });
  }
  
  if (classRecord.ownerId !== null) {
    throw new Error('This class is already owned by another player');
  }
  
  classRecord.ownerId = characterId;
  classRecord.ownerName = characterName;
  classRecord.acquiredAt = new Date();
  await classRecord.save();
  
  console.log(`[HiddenClass] ${characterName} claimed ${classId}`);
  return classRecord;
};

/**
 * Release a class (when player uses Memory Crystal)
 * Makes the scroll available for others to find again
 */
hiddenClassOwnershipSchema.statics.releaseClass = async function(classId, characterId) {
  const classRecord = await this.findOne({ classId });
  
  if (!classRecord) {
    throw new Error(`Invalid class: ${classId}`);
  }
  
  if (!classRecord.ownerId || !classRecord.ownerId.equals(characterId)) {
    throw new Error('You do not own this class');
  }
  
  // Add to previous owners history
  classRecord.previousOwners.push({
    ownerId: classRecord.ownerId,
    ownerName: classRecord.ownerName,
    acquiredAt: classRecord.acquiredAt,
    removedAt: new Date()
  });
  
  const releasedBy = classRecord.ownerName;
  
  // Clear current owner - class is now available again
  classRecord.ownerId = null;
  classRecord.ownerName = null;
  classRecord.acquiredAt = null;
  await classRecord.save();
  
  console.log(`[HiddenClass] ${releasedBy} released ${classId} - now available`);
  return classRecord;
};

/**
 * Get all classes with their ownership status
 */
hiddenClassOwnershipSchema.statics.getAllClassStatus = async function() {
  // Ensure all classes exist
  await this.initializeClasses();
  return await this.find({}).lean();
};

/**
 * Get available classes (not owned by anyone)
 */
hiddenClassOwnershipSchema.statics.getAvailableClasses = async function() {
  await this.initializeClasses();
  return await this.find({ ownerId: null }).lean();
};

/**
 * Get classes owned by a specific character
 */
hiddenClassOwnershipSchema.statics.getClassesByOwner = async function(characterId) {
  return await this.find({ ownerId: characterId }).lean();
};

/**
 * Check if a scroll can drop (class must be available)
 * Used by drop system to prevent dropping owned scrolls
 */
hiddenClassOwnershipSchema.statics.canScrollDrop = async function(classId) {
  return await this.isClassAvailable(classId);
};

// Export the list for use elsewhere
export { ALL_HIDDEN_CLASSES };

export default mongoose.model('HiddenClassOwnership', hiddenClassOwnershipSchema);
