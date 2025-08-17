const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: './config.env' });

// Import User model
const User = require('./models/User');

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Delete existing admin user if exists
    await User.deleteOne({ username: 'HaRsHa@219' });
    console.log('🗑️ Deleted existing admin user if any');

    // Create new admin user with plain password (will be hashed by pre-save hook)
    const adminUser = new User({
      username: 'HaRsHa@219',
      password: 'Msharsha@777',
      role: 'ROLE_ADMIN',
      email: 'admin@schoolidcard.com'
    });

    await adminUser.save();
    console.log('✅ New admin user created successfully');

    // Test the login
    const testUser = await User.findOne({ username: 'HaRsHa@219' });
    if (testUser) {
      const isPasswordValid = await testUser.comparePassword('Msharsha@777');
      console.log('🔐 Password test result:', isPasswordValid);
      
      if (isPasswordValid) {
        console.log('✅ Admin login should work!');
        console.log('📝 Admin credentials:');
        console.log('👤 Username: HaRsHa@219');
        console.log('🔐 Password: Msharsha@777');
      } else {
        console.log('❌ Password test failed!');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run the script
createAdminUser();
