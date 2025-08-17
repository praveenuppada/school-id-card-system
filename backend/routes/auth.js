const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('🔐 Login attempt for username:', username);

    // Validate input
    if (!username || !password) {
      console.log('❌ Missing username or password');
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    // Find user by username
    const user = await User.findOne({ username });
    console.log('🔍 User found:', user ? 'Yes' : 'No');
    if (user) {
      console.log('👤 User details:', {
        id: user._id,
        username: user.username,
        role: user.role,
        schoolId: user.schoolId
      });
    }
    
    if (!user) {
      console.log('❌ User not found');
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    console.log('🔑 Password valid:', isPasswordValid);
    if (!isPasswordValid) {
      console.log('❌ Invalid password');
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id,
        username: user.username,
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Return response
    res.json({
      success: true,
      token,
      role: user.role,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        schoolId: user.schoolId,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create navodhaya user (temporary endpoint for testing)
router.post('/create-navodhaya', async (req, res) => {
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ username: 'navodhaya' });
    if (existingUser) {
      return res.json({
        success: true,
        message: 'User navodhaya already exists'
      });
    }

    // Create new user
    const user = new User({
      username: 'navodhaya',
      password: 'navodhaya',
      role: 'ROLE_TEACHER',
      schoolId: 'navodhaya_school',
      email: 'navodhaya@school.com'
    });

    await user.save();

    console.log('✅ Created navodhaya user with encoded password');
    res.json({
      success: true,
      message: 'User navodhaya created successfully'
    });

  } catch (error) {
    console.error('❌ Error creating navodhaya user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user: ' + error.message
    });
  }
});

// Create admin user (temporary endpoint for testing)
router.post('/create-admin', async (req, res) => {
  try {
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ username: 'HaRsHa@219' });
    if (existingAdmin) {
      // Update password if user exists
      existingAdmin.password = 'Msharsha@777';
      await existingAdmin.save();
      console.log('✅ Updated admin user password');
      return res.json({
        success: true,
        message: 'Admin user updated successfully'
      });
    }

    // Create new admin user
    const adminUser = new User({
      username: 'HaRsHa@219',
      password: 'Msharsha@777',
      role: 'ROLE_ADMIN',
      email: 'admin@schoolidcard.com'
    });

    await adminUser.save();

    console.log('✅ Created admin user with encoded password');
    res.json({
      success: true,
      message: 'Admin user created successfully'
    });

  } catch (error) {
    console.error('❌ Error creating navodhaya user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user: ' + error.message
    });
  }
});

// Check navodhaya user (temporary endpoint for testing)
router.get('/check-navodhaya', async (req, res) => {
  try {
    const user = await User.findOne({ username: 'navodhaya' });
    if (user) {
      res.json({
        success: true,
        user: {
          username: user.username,
          role: user.role,
          schoolId: user.schoolId,
          email: user.email,
          passwordStartsWith: user.password.substring(0, 10) + '...',
          passwordLength: user.password.length
        }
      });
    } else {
      res.json({
        success: false,
        message: 'User navodhaya not found'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error: ' + error.message
    });
  }
});

// Get current user profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Test password encoding
router.get('/test-encode', async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    const encodedPassword = await bcrypt.hash('Admin@123', 10);
    console.log('Encoded password for Admin@123 is:', encodedPassword);
    res.json({
      success: true,
      encodedPassword
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error encoding password: ' + error.message
    });
  }
});

module.exports = router;
