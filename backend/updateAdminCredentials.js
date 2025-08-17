const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: './config.env' });

// Import User model
const User = require('./models/User');

const updateAdminCredentials = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Find the admin user with old credentials
    const oldAdmin = await User.findOne({ username: 'harsha' });
    
    if (!oldAdmin) {
      console.log('❌ Admin user with username "harsha" not found');
      return;
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Msharsha@777', salt);

    // Update the admin credentials
    oldAdmin.username = 'HaRsHa@219';
    oldAdmin.password = hashedPassword;
    await oldAdmin.save();

    console.log('✅ Admin credentials updated successfully');
    console.log('📝 New username: HaRsHa@219');
    console.log('🔐 New password: Msharsha@777');

    // Verify the update
    const updatedAdmin = await User.findOne({ username: 'HaRsHa@219' });
    if (updatedAdmin) {
      console.log('✅ Verification: Admin user found with new credentials');
    } else {
      console.log('❌ Verification failed: Admin user not found');
    }

  } catch (error) {
    console.error('❌ Error updating admin credentials:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run the update
updateAdminCredentials();
