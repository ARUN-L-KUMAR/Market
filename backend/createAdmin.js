// Admin User Setup Script
// Run this with: node createAdmin.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Simple User model for this script
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

const User = mongoose.model('User', userSchema);

async function createAdminUser() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to database');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists:');
      console.log('Email:', existingAdmin.email);
      console.log('Name:', existingAdmin.name);
      console.log('\nIf you forgot the password, you can update it manually in the database.');
      return;
    }

    // Create default admin user
    const adminUser = new User({
      name: 'Admin',
      email: 'admin@market.com',
      password: 'admin123',
      role: 'admin'
    });

    await adminUser.save();
    console.log('✅ Admin user created successfully!');
    console.log('Email: admin@market.com');
    console.log('Password: admin123');
    console.log('\n⚠️  Please change the password after first login for security.');

  } catch (error) {
    console.error('Error:', error.message);
    
    if (error.code === 11000) {
      console.log('\n📧 Checking existing users with admin role...');
      const adminUsers = await User.find({ role: 'admin' });
      if (adminUsers.length > 0) {
        console.log('Found admin users:');
        adminUsers.forEach(admin => {
          console.log(`- Email: ${admin.email}, Name: ${admin.name}`);
        });
      }
    }
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from database');
  }
}

// Check for existing admin users
async function listAdminUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to database\n');

    const adminUsers = await User.find({ role: 'admin' });
    
    if (adminUsers.length === 0) {
      console.log('❌ No admin users found in the database.');
      console.log('Run this script to create one.');
    } else {
      console.log('📋 Found admin users:');
      adminUsers.forEach((admin, index) => {
        console.log(`${index + 1}. Email: ${admin.email}`);
        console.log(`   Name: ${admin.name}`);
        console.log(`   ID: ${admin._id}`);
        console.log('');
      });
    }

    // Also show all users for reference
    const allUsers = await User.find({});
    console.log(`\n📊 Total users in database: ${allUsers.length}`);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

// Main execution
const action = process.argv[2];

if (action === 'list') {
  listAdminUsers();
} else if (action === 'create') {
  createAdminUser();
} else {
  console.log('🔧 Admin User Management Script');
  console.log('');
  console.log('Usage:');
  console.log('  node createAdmin.js list    - List existing admin users');
  console.log('  node createAdmin.js create  - Create default admin user');
  console.log('');
  console.log('Default admin credentials (when created):');
  console.log('  Email: admin@market.com');
  console.log('  Password: admin123');
  console.log('');
  
  // Run list by default
  listAdminUsers();
}
