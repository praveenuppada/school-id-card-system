const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config({ path: './config.env' });

// Import routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const teacherRoutes = require('./routes/teacher');

const app = express();
const PORT = process.env.PORT || 8081;

// CORS configuration - must come before other middleware
app.use(cors({
  origin: [
    'https://school-id-card-system.vercel.app', 
    'https://school-id-card-s-git-4c6b03-praveenuppada1812gmailcoms-projects.vercel.app', 
    'http://localhost:5175', 
    'http://localhost:3000',
    'https://www.harshaidsolution.co.in',
    'https://harshaidsolution.co.in'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Origin', 'Accept']
}));

// Handle preflight requests
app.options('*', cors());

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Optimized rate limiting for concurrent uploads
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Increased limit for concurrent uploads
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Specific rate limit for photo uploads
const uploadLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 50, // Allow 50 uploads per minute per IP
  message: {
    success: false,
    message: 'Too many photo uploads, please slow down.'
  },
  skipSuccessfulRequests: true, // Don't count successful uploads
});

app.use(limiter);

// Body parsing middleware - optimized for large files
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// MongoDB Connection with optimized settings for concurrent operations
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      maxPoolSize: 50, // Increased connection pool for concurrent operations
      minPoolSize: 10, // Minimum connections
      maxIdleTimeMS: 30000, // Close idle connections after 30s
      retryWrites: true, // Enable retry for write operations
      w: 'majority', // Write concern for better reliability
    });
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('⚠️  Server will continue without database connection');
    console.log('💡 Please check your MongoDB Atlas IP whitelist settings');
  }
};

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/teacher', uploadLimiter, teacherRoutes); // Apply upload limiter to teacher routes

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({ 
    status: 'OK', 
    message: 'School ID Card Backend is running',
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
