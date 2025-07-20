const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./src/models/user.model');
const Product = require('./src/models/product.model');
const Category = require('./src/models/category.model');

const setupDatabase = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Create admin user if doesn't exist
    const adminExists = await User.findOne({ email: 'admin@market.com' });
    if (!adminExists) {
      console.log('👤 Creating admin user...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      await User.create({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@market.com',
        password: hashedPassword,
        role: 'admin',
        isAdmin: true
      });
      console.log('✅ Admin user created: admin@market.com / admin123');
    } else {
      console.log('👤 Admin user already exists');
    }

    // Create sample categories if none exist
    const categoryCount = await Category.countDocuments();
    if (categoryCount === 0) {
      console.log('📂 Creating sample categories...');
      const categories = [
        { name: 'Electronics', description: 'Electronic devices and gadgets' },
        { name: 'Clothing', description: 'Fashion and apparel' },
        { name: 'Books', description: 'Books and literature' },
        { name: 'Home & Garden', description: 'Home improvement and gardening' },
        { name: 'Sports', description: 'Sports and fitness equipment' }
      ];
      
      await Category.insertMany(categories);
      console.log('✅ Sample categories created');
    } else {
      console.log('📂 Categories already exist');
    }

    // Create sample products if none exist
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      console.log('📦 Creating sample products...');
      const categories = await Category.find();
      
      const products = [
        {
          title: 'iPhone 15 Pro',
          description: 'Latest iPhone with advanced features',
          price: 999.99,
          category: categories.find(c => c.name === 'Electronics')._id,
          stock: 50,
          images: ['https://via.placeholder.com/300x300?text=iPhone+15+Pro'],
          specifications: {
            brand: 'Apple',
            model: 'iPhone 15 Pro',
            storage: '128GB'
          }
        },
        {
          title: 'Samsung Galaxy S24',
          description: 'High-performance Android smartphone',
          price: 899.99,
          category: categories.find(c => c.name === 'Electronics')._id,
          stock: 30,
          images: ['https://via.placeholder.com/300x300?text=Galaxy+S24'],
          specifications: {
            brand: 'Samsung',
            model: 'Galaxy S24',
            storage: '256GB'
          }
        },
        {
          title: 'MacBook Air M3',
          description: 'Lightweight laptop with M3 chip',
          price: 1299.99,
          category: categories.find(c => c.name === 'Electronics')._id,
          stock: 25,
          images: ['https://via.placeholder.com/300x300?text=MacBook+Air'],
          specifications: {
            brand: 'Apple',
            model: 'MacBook Air',
            processor: 'M3'
          }
        },
        {
          title: 'Classic T-Shirt',
          description: 'Comfortable cotton t-shirt',
          price: 29.99,
          category: categories.find(c => c.name === 'Clothing')._id,
          stock: 100,
          images: ['https://via.placeholder.com/300x300?text=T-Shirt'],
          sizes: ['S', 'M', 'L', 'XL'],
          colors: ['Black', 'White', 'Navy']
        },
        {
          title: 'Running Shoes',
          description: 'Professional running shoes for athletes',
          price: 129.99,
          category: categories.find(c => c.name === 'Sports')._id,
          stock: 75,
          images: ['https://via.placeholder.com/300x300?text=Running+Shoes'],
          sizes: ['7', '8', '9', '10', '11', '12']
        }
      ];
      
      await Product.insertMany(products);
      console.log('✅ Sample products created');
    } else {
      console.log('📦 Products already exist');
    }

    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`👥 Users: ${await User.countDocuments()}`);
    console.log(`📂 Categories: ${await Category.countDocuments()}`);
    console.log(`📦 Products: ${await Product.countDocuments()}`);
    
    console.log('\n🔐 Admin Access:');
    console.log('Email: admin@market.com');
    console.log('Password: admin123');
    console.log('\n💡 Access the admin panel at: http://localhost:3000/admin');
    console.log('💡 View database at: http://localhost:3001/db-viewer.html');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n📴 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the setup
setupDatabase();
