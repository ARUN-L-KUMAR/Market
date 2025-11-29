require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./src/models/product.model');

/**
 * Quick script to update a single product's images
 * 
 * Usage: node updateSingleProduct.js
 */

// 🔧 EDIT THESE VALUES:
const PRODUCT_ID = '685a5d53b986b1543a16d4d3'; // Product ID to update

const NEW_IMAGES = [
  {
    url: 'https://res.cloudinary.com/dxo35vqwm/image/upload/v1234567890/products/image1.jpg',
    alt: 'Product Image 1',
    isPrimary: true
  },
  {
    url: 'https://res.cloudinary.com/dxo35vqwm/image/upload/v1234567890/products/image2.jpg',
    alt: 'Product Image 2',
    isPrimary: false
  }
  // Add more images as needed
];

async function updateProduct() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✓ Connected\n');

    const product = await Product.findById(PRODUCT_ID);
    
    if (!product) {
      console.log('✗ Product not found!');
      return;
    }

    console.log(`Found product: ${product.title}`);
    console.log(`Current images: ${product.images.length}`);
    console.log(`New images: ${NEW_IMAGES.length}\n`);

    // Update images
    product.images = NEW_IMAGES;
    await product.save();

    console.log('✓ Product images updated successfully!');
    console.log('\nNew images:');
    NEW_IMAGES.forEach((img, i) => {
      console.log(`  ${i + 1}. ${img.alt} ${img.isPrimary ? '(PRIMARY)' : ''}`);
      console.log(`     ${img.url}`);
    });

  } catch (error) {
    console.error('✗ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n✓ Done!');
  }
}

updateProduct();
