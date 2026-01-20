import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

// Import routes
import authRoutes from './routes/auth.js';
import characterRoutes from './routes/character.js';
import gmRoutes from './routes/gm.js';
import tavernRoutes from './routes/tavern.js';
import explorationRoutes from './routes/exploration.js';

// Import models
import User from './models/User.js';
import HiddenClassOwnership from './models/HiddenClassOwnership.js';
import { TavernShop } from './models/Tavern.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/character', characterRoutes);
app.use('/api/gm', gmRoutes);
app.use('/api/tavern', tavernRoutes);
app.use('/api/exploration', explorationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    game: 'Awakened Protocol: Zero',
    version: '1.0.0-alpha',
    phase: '9.7'
  });
});

// Game info endpoint
app.get('/api/info', (req, res) => {
  res.json({
    name: 'Awakened Protocol: Zero',
    description: 'A Solo Leveling inspired text-based turn-based RPG',
    version: '1.0.0-alpha',
    phase: '9.7',
    features: {
      towers: 10,
      baseClasses: 4,
      hiddenClasses: 20,
      maxLevel: 100,
      skills: 96
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Initialize admin/GM account if not exists
async function initializeGMAccount() {
  try {
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (!existingAdmin) {
      console.log('Creating initial admin account...');
      const admin = new User({
        username: process.env.GM_USERNAME || 'admin',
        password: process.env.GM_PASSWORD || 'admin123',
        role: 'admin'
      });
      await admin.save();
      console.log(`Admin account created: ${admin.username}`);
      console.log('⚠️  IMPORTANT: Change the admin password immediately!');
    }
    
    // Initialize hidden class ownership tracking
    await HiddenClassOwnership.initializeClasses();
    console.log('✅ Hidden class ownership initialized');
    
    // Initialize tavern shop
    await TavernShop.initializeShop();
    console.log('✅ Tavern shop initialized');
  } catch (error) {
    console.error('Error initializing GM account:', error);
  }
}

// Connect to MongoDB and start server
async function startServer() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      console.error('❌ MONGODB_URI not found in environment variables');
      console.log('Please create a .env file with your MongoDB Atlas connection string');
      console.log('See .env.example for reference');
      process.exit(1);
    }
    
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB Atlas');
    
    // Initialize GM account
    await initializeGMAccount();
    
    app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║        ⚔️  AWAKENED PROTOCOL: ZERO  ⚔️               ║
║              Server Started                           ║
║                                                       ║
║        Port: ${PORT}                                    ║
║        Phase: 9.7 - Modular Combat                    ║
║        Exploration: ENABLED                           ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
