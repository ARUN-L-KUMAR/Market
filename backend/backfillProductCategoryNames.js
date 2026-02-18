/**
 * Backfill Product Category Names Script
 * - Populates categoryName and subcategoryName for all existing products
 * - Uses the existing category and subcategory ObjectIds
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Product = require('./src/models/product.model');
const Category = require('./src/models/category.model');

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error('❌ MONGO_URI is missing in .env');
    process.exit(1);
}

async function backfill() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const products = await Product.find({})
            .populate('category', 'name')
            .populate('subcategory', 'name');

        console.log(`📊 Found ${products.length} products to update`);

        let updatedCount = 0;

        for (const product of products) {
            let updates = {};
            let needsUpdate = false;

            if (product.category && product.category.name && !product.categoryName) {
                updates.categoryName = product.category.name;
                needsUpdate = true;
            }

            if (product.subcategory && product.subcategory.name && !product.subcategoryName) {
                updates.subcategoryName = product.subcategory.name;
                needsUpdate = true;
            }

            if (needsUpdate) {
                await Product.findByIdAndUpdate(product._id, { $set: updates });
                console.log(`  ✅ Updated ${product.title}: ${updates.categoryName || ''} / ${updates.subcategoryName || ''}`);
                updatedCount++;
            }
        }

        console.log(`\n✨ Backfill completed! Updated ${updatedCount} products.`);
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

backfill();
