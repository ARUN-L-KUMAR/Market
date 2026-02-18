const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Product = require('./src/models/product.model');

const MONGO_URI = process.env.MONGO_URI;

async function count() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const total = await Product.countDocuments({});
        console.log(`TOTAL_PRODUCTS: ${total}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

count();
