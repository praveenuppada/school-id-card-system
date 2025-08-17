const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: './config.env' });

// Import User model
const User = require('./models/User');

const fixAdminLogin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Find all admin users
    const adminUsers = await User.find({ role: 'ROLE_ADMIN' });
    console.log('📋 Found admin users:', adminUsers.length);
    
    adminUsers.forEach((user, index) => {
      console.log(`${index + 1}. Username: ${user.username}, Role: ${user.role}`);
    });

    // Check if the new admin user exists
    let adminUser = await User.findOne({ username: 'HaRsHa@219' });
    
    if (adminUser) {
      console.log('✅ Found admin user with username HaRsHa@219');
      
      // Test the current password
      const isCurrentPasswordValid = await adminUser.comparePassword('Msharsha@777');
      console.log('🔐 Current password valid:', isCurrentPasswordValid);
      
      if (!isCurrentPasswordValid) {
        // Update the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('Msharsha@777', salt);
        adminUser.password = hashedPassword;
        await adminUser.save();
        console.log('✅ Admin password updated successfully');
      }
    } else {
      console.log('❌ Admin user with username HaRsHa@219 not found, creating...');
      
      // Create new admin user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Msharsha@777', salt);

      adminUser = new User({
        username: 'HaRsHa@219',
        password: hashedPassword,
        role: 'ROLE_ADMIN',
        email: 'admin@schoolidcard.com'
      });

      await adminUser.save();
      console.log('✅ New admin user created successfully');
    }

    // Test login
    console.log('\n🧪 Testing admin login...');
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

// Run the fix
fixAdminLogin();
