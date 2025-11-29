require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./src/models/product.model');

/**
 * Script to update product images in MongoDB
 * 
 * Usage:
 * 1. Update the newImages object below with product IDs and their new Cloudinary URLs
 * 2. Run: node updateProductImages.js
 */

// Update this object with your product IDs and new Cloudinary image URLs
const newImages = {
  // Example format:
  '685a5d53b986b1543a16d4d3': [ // Samsung Galaxy S22
    {
      url: 'https://res.cloudinary.com/dxo35vqwm/image/upload/v1234567890/products/samsung-s22-1.jpg',
      alt: 'Samsung Galaxy S22 - Main',
      isPrimary: true
    },
    {
      url: 'https://res.cloudinary.com/dxo35vqwm/image/upload/v1234567890/products/samsung-s22-2.jpg',
      alt: 'Samsung Galaxy S22 - Front View',
      isPrimary: false
    }
  ],
  // Add more products here...
  // '685a5d53b986b1543a16d4d8': [ ... ], // MacBook Pro
  // '685a5d53b986b1543a16d4dc': [ ... ], // T-Shirt
};

async function updateProductImages() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✓ Connected to MongoDB\n');

    let updatedCount = 0;
    let errorCount = 0;

    // Update each product
    for (const [productId, images] of Object.entries(newImages)) {
      try {
        const product = await Product.findById(productId);
        
        if (!product) {
          console.log(`✗ Product not found: ${productId}`);
          errorCount++;
          continue;
        }

        // Update images
        product.images = images;
        await product.save();

        console.log(`✓ Updated: ${product.title} (${productId})`);
        console.log(`  - ${images.length} images\n`);
        updatedCount++;
      } catch (err) {
        console.error(`✗ Error updating ${productId}:`, err.message);
        errorCount++;
      }
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log(`Summary:`);
    console.log(`  ✓ Successfully updated: ${updatedCount} products`);
    console.log(`  ✗ Errors: ${errorCount}`);
    console.log('='.repeat(50));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the script
updateProductImages();
