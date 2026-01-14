import mongoose from 'mongoose';

// This model tracks which player owns which hidden class
// Each hidden class can only be owned by ONE player at a time
const hiddenClassOwnershipSchema = new mongoose.Schema({
  classId: {
    type: String,
    enum: ['flameblade', 'shadowDancer', 'stormRanger', 'frostWeaver'],
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

// Initialize all hidden classes as available
hiddenClassOwnershipSchema.statics.initializeClasses = async function() {
  const classes = ['flameblade', 'shadowDancer', 'stormRanger', 'frostWeaver'];
  
  for (const classId of classes) {
    const existing = await this.findOne({ classId });
    if (!existing) {
      await this.create({ classId, ownerId: null, ownerName: null });
    }
  }
};

// Check if a class is available
hiddenClassOwnershipSchema.statics.isClassAvailable = async function(classId) {
  const classRecord = await this.findOne({ classId });
  return classRecord && classRecord.ownerId === null;
};

// Claim a class for a player
hiddenClassOwnershipSchema.statics.claimClass = async function(classId, characterId, characterName) {
  const classRecord = await this.findOne({ classId });
  
  if (!classRecord) {
    throw new Error('Invalid class');
  }
  
  if (classRecord.ownerId !== null) {
    throw new Error('This class is already owned by another player');
  }
  
  classRecord.ownerId = characterId;
  classRecord.ownerName = characterName;
  classRecord.acquiredAt = new Date();
  await classRecord.save();
  
  return classRecord;
};

// Release a class (when player uses Memory Crystal)
hiddenClassOwnershipSchema.statics.releaseClass = async function(classId, characterId) {
  const classRecord = await this.findOne({ classId });
  
  if (!classRecord) {
    throw new Error('Invalid class');
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
  
  // Clear current owner
  classRecord.ownerId = null;
  classRecord.ownerName = null;
  classRecord.acquiredAt = null;
  await classRecord.save();
  
  return classRecord;
};

// Get all classes with their status
hiddenClassOwnershipSchema.statics.getAllClassStatus = async function() {
  return await this.find({}).lean();
};

export default mongoose.model('HiddenClassOwnership', hiddenClassOwnershipSchema);
