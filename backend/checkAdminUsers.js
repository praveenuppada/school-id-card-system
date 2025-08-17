const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: './config.env' });

// Import User model
const User = require('./models/User');

const checkAndUpdateAdmin = async () => {
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

    // Find the specific admin user
    const adminUser = await User.findOne({ username: 'HaRsHa@219' });
    
    if (adminUser) {
      console.log('✅ Found admin user with username HaRsHa@219');
      
      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Msharsha@777', salt);

      // Update the password
      adminUser.password = hashedPassword;
      await adminUser.save();

      console.log('✅ Admin password updated successfully');
      console.log('📝 Admin credentials:');
      console.log('👤 Username: HaRsHa@219');
      console.log('🔐 Password: Msharsha@777');
    } else {
      console.log('❌ Admin user with username HaRsHa@219 not found');
      
      // Create new admin user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Msharsha@777', salt);

      const newAdminUser = new User({
        username: 'HaRsHa@219',
        password: hashedPassword,
        role: 'ROLE_ADMIN',
        email: 'admin@schoolidcard.com'
      });

      await newAdminUser.save();
      console.log('✅ New admin user created successfully');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run the check and update
checkAndUpdateAdmin();
