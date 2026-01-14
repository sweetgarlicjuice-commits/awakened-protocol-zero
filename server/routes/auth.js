import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Character from '../models/Character.js';
import { authenticate, requireGM } from '../middleware/auth.js';

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// POST /api/auth/login - Player login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }
    
    const user = await User.findOne({ username: username.toLowerCase() });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }
    
    if (!user.isActive) {
      return res.status(403).json({ error: 'Account is deactivated. Contact GM.' });
    }
    
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    // Check if user has a character
    const character = await Character.findOne({ userId: user._id });
    
    const token = generateToken(user._id);
    
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      },
      hasCharacter: !!character
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// POST /api/auth/gm/create-account - GM creates player account
router.post('/gm/create-account', authenticate, requireGM, async (req, res) => {
  try {
    const { username, password, role = 'player' } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }
    
    // Only admin can create GM accounts
    if (role === 'gm' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admin can create GM accounts.' });
    }
    
    // Check if username exists
    const existingUser = await User.findOne({ username: username.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists.' });
    }
    
    const newUser = new User({
      username: username.toLowerCase(),
      password,
      role,
      createdBy: req.user._id
    });
    
    await newUser.save();
    
    res.status(201).json({
      message: 'Account created successfully',
      user: {
        id: newUser._id,
        username: newUser.username,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Create account error:', error);
    res.status(500).json({ error: 'Server error creating account.' });
  }
});

// GET /api/auth/gm/players - GM view all players
router.get('/gm/players', authenticate, requireGM, async (req, res) => {
  try {
    const users = await User.find({ role: 'player' })
      .select('-password')
      .sort({ createdAt: -1 });
    
    // Get character info for each user
    const playersWithCharacters = await Promise.all(
      users.map(async (user) => {
        const character = await Character.findOne({ userId: user._id });
        return {
          ...user.toObject(),
          character: character ? {
            name: character.name,
            level: character.level,
            baseClass: character.baseClass,
            hiddenClass: character.hiddenClass
          } : null
        };
      })
    );
    
    res.json({ players: playersWithCharacters });
  } catch (error) {
    console.error('Get players error:', error);
    res.status(500).json({ error: 'Server error fetching players.' });
  }
});

// PATCH /api/auth/gm/toggle-account/:userId - GM activate/deactivate account
router.patch('/gm/toggle-account/:userId', authenticate, requireGM, async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    
    // Can't deactivate self or higher roles
    if (user._id.equals(req.user._id)) {
      return res.status(400).json({ error: 'Cannot modify your own account.' });
    }
    
    if (user.role === 'admin' || (user.role === 'gm' && req.user.role !== 'admin')) {
      return res.status(403).json({ error: 'Cannot modify this account.' });
    }
    
    user.isActive = !user.isActive;
    await user.save();
    
    res.json({
      message: `Account ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      isActive: user.isActive
    });
  } catch (error) {
    console.error('Toggle account error:', error);
    res.status(500).json({ error: 'Server error toggling account.' });
  }
});

// GET /api/auth/me - Get current user info
router.get('/me', authenticate, async (req, res) => {
  try {
    const character = await Character.findOne({ userId: req.user._id });
    
    res.json({
      user: {
        id: req.user._id,
        username: req.user.username,
        role: req.user.role
      },
      hasCharacter: !!character,
      character: character || null
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
});

export default router;
