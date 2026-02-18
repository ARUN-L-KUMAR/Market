const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Product = require('./src/models/product.model');

const MONGO_URI = process.env.MONGO_URI;

async function cleanup() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Delete products created by the seed script (SKUs starting with SKU-)
        const result = await Product.deleteMany({ sku: /^SKU-/ });

        console.log(`\n🗑️ Deleted ${result.deletedCount} seeded products.`);

        const remaining = await Product.countDocuments();
        console.log(`📦 Remaining products in database: ${remaining}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error during cleanup:', error);
        process.exit(1);
    }
}

cleanup();
