// ============================================================
// FRIENDS ROUTES - Friend List System
// ============================================================
// Phase 9.8: Social Features
// 
// Endpoints:
// GET    /api/friends              - Get friend list
// POST   /api/friends/request      - Send friend request
// POST   /api/friends/accept/:id   - Accept request
// POST   /api/friends/decline/:id  - Decline request
// DELETE /api/friends/:id          - Remove friend
// GET    /api/friends/pending      - Get pending requests
// GET    /api/friends/search       - Search users by username
// GET    /api/friends/:id/profile  - Get friend's profile
// ============================================================

import express from 'express';
import { authenticate } from '../middleware/auth.js';
import Friendship from '../models/Friendship.js';
import Character from '../models/Character.js';
import User from '../models/User.js';

const router = express.Router();

// ============================================================
// GET /api/friends - Get friend list with online status
// ============================================================
router.get('/', authenticate, async (req, res) => {
  try {
    const friendships = await Friendship.getFriends(req.user._id);
    
    // Get full friend data with character info
    const friendsData = await Promise.all(friendships.map(async (friendship) => {
      // Determine which user is the friend
      const friendUserId = friendship.requester._id.toString() === req.user._id.toString() 
        ? friendship.recipient._id 
        : friendship.requester._id;
      
      const friendUsername = friendship.requester._id.toString() === req.user._id.toString()
        ? friendship.recipient.username
        : friendship.requester.username;
      
      // Get character data
      const character = await Character.findOne({ userId: friendUserId })
        .select('name level baseClass hiddenClass isOnline lastOnline currentActivity activeTitle');
      
      return {
        friendshipId: friendship._id,
        odUserId: friendUserId,
        username: friendUsername,
        character: character ? {
          name: character.name,
          level: character.level,
          baseClass: character.baseClass,
          hiddenClass: character.hiddenClass,
          isOnline: character.isOnline,
          lastOnline: character.lastOnline,
          currentActivity: character.currentActivity,
          activeTitle: character.activeTitle
        } : null,
        since: friendship.respondedAt || friendship.createdAt
      };
    }));
    
    res.json({ 
      friends: friendsData,
      count: friendsData.length
    });
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({ error: 'Failed to get friends' });
  }
});

// ============================================================
// GET /api/friends/pending - Get pending friend requests
// ============================================================
router.get('/pending', authenticate, async (req, res) => {
  try {
    // Requests I received
    const received = await Friendship.getPendingReceived(req.user._id);
    const receivedData = await Promise.all(received.map(async (fr) => {
      const character = await Character.findOne({ userId: fr.requester._id })
        .select('name level baseClass');
      return {
        friendshipId: fr._id,
        userId: fr.requester._id,
        username: fr.requester.username,
        character: character ? {
          name: character.name,
          level: character.level,
          baseClass: character.baseClass
        } : null,
        requestedAt: fr.requestedAt
      };
    }));
    
    // Requests I sent
    const sent = await Friendship.getPendingSent(req.user._id);
    const sentData = await Promise.all(sent.map(async (fr) => {
      const character = await Character.findOne({ userId: fr.recipient._id })
        .select('name level baseClass');
      return {
        friendshipId: fr._id,
        userId: fr.recipient._id,
        username: fr.recipient.username,
        character: character ? {
          name: character.name,
          level: character.level,
          baseClass: character.baseClass
        } : null,
        requestedAt: fr.requestedAt
      };
    }));
    
    res.json({ 
      received: receivedData,
      sent: sentData,
      receivedCount: receivedData.length,
      sentCount: sentData.length
    });
  } catch (error) {
    console.error('Get pending requests error:', error);
    res.status(500).json({ error: 'Failed to get pending requests' });
  }
});

// ============================================================
// GET /api/friends/search - Search users by username
// ============================================================
router.get('/search', authenticate, async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({ users: [] });
    }
    
    // Find users matching the query (exclude self)
    const users = await User.find({
      username: { $regex: q, $options: 'i' },
      _id: { $ne: req.user._id }
    })
    .select('username')
    .limit(10);
    
    // Get character data and friendship status for each user
    const usersData = await Promise.all(users.map(async (user) => {
      const character = await Character.findOne({ userId: user._id })
        .select('name level baseClass');
      
      // Check existing friendship
      const existingFriendship = await Friendship.findOne({
        $or: [
          { requester: req.user._id, recipient: user._id },
          { requester: user._id, recipient: req.user._id }
        ]
      });
      
      let friendshipStatus = 'none';
      if (existingFriendship) {
        if (existingFriendship.status === 'accepted') {
          friendshipStatus = 'friends';
        } else if (existingFriendship.status === 'pending') {
          friendshipStatus = existingFriendship.requester.toString() === req.user._id.toString() 
            ? 'request_sent' 
            : 'request_received';
        }
      }
      
      return {
        userId: user._id,
        username: user.username,
        character: character ? {
          name: character.name,
          level: character.level,
          baseClass: character.baseClass
        } : null,
        friendshipStatus
      };
    }));
    
    res.json({ users: usersData });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// ============================================================
// POST /api/friends/request - Send friend request
// ============================================================
router.post('/request', authenticate, async (req, res) => {
  try {
    const { username } = req.body;
    
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }
    
    // Find the recipient by username
    const recipient = await User.findOne({ username: { $regex: `^${username}$`, $options: 'i' } });
    
    if (!recipient) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Send the request
    const friendship = await Friendship.sendRequest(req.user._id, recipient._id);
    
    res.json({ 
      message: `Friend request sent to ${username}`,
      friendshipId: friendship._id
    });
  } catch (error) {
    console.error('Send friend request error:', error);
    res.status(400).json({ error: error.message || 'Failed to send request' });
  }
});

// ============================================================
// POST /api/friends/accept/:id - Accept friend request
// ============================================================
router.post('/accept/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    const friendship = await Friendship.acceptRequest(id, req.user._id);
    
    // Get requester info for response
    const requester = await User.findById(friendship.requester).select('username');
    
    res.json({ 
      message: `You are now friends with ${requester?.username || 'user'}`,
      friendship: {
        friendshipId: friendship._id,
        status: friendship.status
      }
    });
  } catch (error) {
    console.error('Accept friend request error:', error);
    res.status(400).json({ error: error.message || 'Failed to accept request' });
  }
});

// ============================================================
// POST /api/friends/decline/:id - Decline friend request
// ============================================================
router.post('/decline/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    await Friendship.declineRequest(id, req.user._id);
    
    res.json({ message: 'Friend request declined' });
  } catch (error) {
    console.error('Decline friend request error:', error);
    res.status(400).json({ error: error.message || 'Failed to decline request' });
  }
});

// ============================================================
// DELETE /api/friends/:id - Remove friend
// ============================================================
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    await Friendship.removeFriend(id, req.user._id);
    
    res.json({ message: 'Friend removed' });
  } catch (error) {
    console.error('Remove friend error:', error);
    res.status(400).json({ error: error.message || 'Failed to remove friend' });
  }
});

// ============================================================
// GET /api/friends/:id/profile - Get friend's profile
// ============================================================
router.get('/:id/profile', authenticate, async (req, res) => {
  try {
    const { id } = req.params; // This is the friendshipId
    
    const friendship = await Friendship.findById(id);
    
    if (!friendship || friendship.status !== 'accepted') {
      return res.status(404).json({ error: 'Friendship not found' });
    }
    
    // Verify the requesting user is part of this friendship
    const isParticipant = 
      friendship.requester.toString() === req.user._id.toString() ||
      friendship.recipient.toString() === req.user._id.toString();
    
    if (!isParticipant) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    // Get the friend's user ID
    const friendUserId = friendship.requester.toString() === req.user._id.toString()
      ? friendship.recipient
      : friendship.requester;
    
    // Get character data
    const character = await Character.findOne({ userId: friendUserId });
    
    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }
    
    res.json({
      profile: character.getPublicProfile()
    });
  } catch (error) {
    console.error('Get friend profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// ============================================================
// GET /api/friends/count - Get friend count
// ============================================================
router.get('/count', authenticate, async (req, res) => {
  try {
    const count = await Friendship.getFriendCount(req.user._id);
    res.json({ count });
  } catch (error) {
    console.error('Get friend count error:', error);
    res.status(500).json({ error: 'Failed to get count' });
  }
});

export default router;
