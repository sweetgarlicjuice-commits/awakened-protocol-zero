// ============================================================
// FRIENDSHIP MODEL - Friend List System
// ============================================================
// Phase 9.8: Social Features
// 
// Features:
// - Add friend by username
// - Accept/decline requests
// - See friend status (online, in tower, level)
// - View friend profile (class, level)
// - Remove friend
// ============================================================

import mongoose from 'mongoose';

const friendshipSchema = new mongoose.Schema({
  // The user who sent the friend request
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // The user who received the friend request
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Status of the friendship
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'blocked'],
    default: 'pending'
  },
  
  // Timestamps
  requestedAt: {
    type: Date,
    default: Date.now
  },
  
  respondedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// ============================================================
// INDEXES
// ============================================================

// Find all friendships for a user (as requester or recipient)
friendshipSchema.index({ requester: 1, status: 1 });
friendshipSchema.index({ recipient: 1, status: 1 });

// Prevent duplicate friend requests
friendshipSchema.index({ requester: 1, recipient: 1 }, { unique: true });

// ============================================================
// STATIC METHODS
// ============================================================

/**
 * Send a friend request
 */
friendshipSchema.statics.sendRequest = async function(requesterId, recipientId) {
  // Check if they're the same user
  if (requesterId.toString() === recipientId.toString()) {
    throw new Error('Cannot send friend request to yourself');
  }
  
  // Check if friendship already exists (in either direction)
  const existing = await this.findOne({
    $or: [
      { requester: requesterId, recipient: recipientId },
      { requester: recipientId, recipient: requesterId }
    ]
  });
  
  if (existing) {
    if (existing.status === 'accepted') {
      throw new Error('Already friends');
    } else if (existing.status === 'pending') {
      throw new Error('Friend request already pending');
    } else if (existing.status === 'blocked') {
      throw new Error('Cannot send request');
    } else if (existing.status === 'declined') {
      // Allow re-requesting if previously declined
      existing.status = 'pending';
      existing.requester = requesterId;
      existing.recipient = recipientId;
      existing.requestedAt = new Date();
      existing.respondedAt = null;
      return await existing.save();
    }
  }
  
  return await this.create({
    requester: requesterId,
    recipient: recipientId,
    status: 'pending'
  });
};

/**
 * Accept a friend request
 */
friendshipSchema.statics.acceptRequest = async function(friendshipId, userId) {
  const friendship = await this.findById(friendshipId);
  
  if (!friendship) {
    throw new Error('Friend request not found');
  }
  
  if (friendship.recipient.toString() !== userId.toString()) {
    throw new Error('Not authorized to accept this request');
  }
  
  if (friendship.status !== 'pending') {
    throw new Error('Request is not pending');
  }
  
  friendship.status = 'accepted';
  friendship.respondedAt = new Date();
  return await friendship.save();
};

/**
 * Decline a friend request
 */
friendshipSchema.statics.declineRequest = async function(friendshipId, userId) {
  const friendship = await this.findById(friendshipId);
  
  if (!friendship) {
    throw new Error('Friend request not found');
  }
  
  if (friendship.recipient.toString() !== userId.toString()) {
    throw new Error('Not authorized to decline this request');
  }
  
  if (friendship.status !== 'pending') {
    throw new Error('Request is not pending');
  }
  
  friendship.status = 'declined';
  friendship.respondedAt = new Date();
  return await friendship.save();
};

/**
 * Remove a friend (either user can remove)
 */
friendshipSchema.statics.removeFriend = async function(friendshipId, userId) {
  const friendship = await this.findById(friendshipId);
  
  if (!friendship) {
    throw new Error('Friendship not found');
  }
  
  const isParticipant = 
    friendship.requester.toString() === userId.toString() ||
    friendship.recipient.toString() === userId.toString();
  
  if (!isParticipant) {
    throw new Error('Not authorized to remove this friendship');
  }
  
  return await this.findByIdAndDelete(friendshipId);
};

/**
 * Get all friends for a user (accepted only)
 */
friendshipSchema.statics.getFriends = async function(userId) {
  return await this.find({
    $or: [
      { requester: userId, status: 'accepted' },
      { recipient: userId, status: 'accepted' }
    ]
  }).populate('requester recipient', 'username');
};

/**
 * Get pending requests received by user
 */
friendshipSchema.statics.getPendingReceived = async function(userId) {
  return await this.find({
    recipient: userId,
    status: 'pending'
  }).populate('requester', 'username');
};

/**
 * Get pending requests sent by user
 */
friendshipSchema.statics.getPendingSent = async function(userId) {
  return await this.find({
    requester: userId,
    status: 'pending'
  }).populate('recipient', 'username');
};

/**
 * Check if two users are friends
 */
friendshipSchema.statics.areFriends = async function(userId1, userId2) {
  const friendship = await this.findOne({
    $or: [
      { requester: userId1, recipient: userId2, status: 'accepted' },
      { requester: userId2, recipient: userId1, status: 'accepted' }
    ]
  });
  return !!friendship;
};

/**
 * Get friend count for a user
 */
friendshipSchema.statics.getFriendCount = async function(userId) {
  return await this.countDocuments({
    $or: [
      { requester: userId, status: 'accepted' },
      { recipient: userId, status: 'accepted' }
    ]
  });
};

const Friendship = mongoose.model('Friendship', friendshipSchema);

export default Friendship;
