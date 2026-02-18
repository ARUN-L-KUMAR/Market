const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Product = require('./src/models/product.model');

const MONGO_URI = process.env.MONGO_URI;

async function diagnose() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const products = await Product.find({
            $or: [
                { title: { $regex: /samsung/i } },
                { subcategoryName: 'Mobile' }
            ]
        });

        console.log(`\nFound ${products.length} products:`);
        products.forEach(p => {
            console.log(`- Title: ${p.title}`);
            console.log(`  SKU: ${p.sku}`);
            console.log(`  CategoryName: ${p.categoryName}`);
            console.log(`  SubcategoryName: ${p.subcategoryName}`);
            console.log(`  Category ID: ${p.category}`);
            console.log(`  Subcategory ID: ${p.subcategory}`);
            console.log('---');
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

diagnose();
