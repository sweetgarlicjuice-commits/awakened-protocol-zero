import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth.js';
import characterRoutes from './routes/character.js';
import towerRoutes from './routes/tower.js';
import gmRoutes from './routes/gm.js';
import explorationRoutes from './routes/exploration.js';

// Initialize Express
const app = express();

// ============================================================
// MIDDLEWARE
// ============================================================

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://apz-client-vst6.onrender.com',
    process.env.CLIENT_URL
  ].filter(Boolean),
  credentials: true
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging (development)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// ============================================================
// DATABASE CONNECTION
// ============================================================

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// ============================================================
// ROUTES
// ============================================================

// Health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'APZ Server Running',
    version: '1.0.0',
    status: 'online'
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/character', characterRoutes);
app.use('/api/tower', towerRoutes);
app.use('/api/gm', gmRoutes);
app.use('/api/exploration', explorationRoutes);

// ============================================================
// ERROR HANDLING
// ============================================================

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// ============================================================
// START SERVER
// ============================================================

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  
  app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════╗
║     APZ Server Started Successfully       ║
╠═══════════════════════════════════════════╣
║  Port: ${PORT}                              ║
║  Mode: ${process.env.NODE_ENV || 'development'}                    ║
║  Time: ${new Date().toLocaleTimeString()}                        ║
╚═══════════════════════════════════════════╝
    `);
  });
};

startServer();

export default app;
