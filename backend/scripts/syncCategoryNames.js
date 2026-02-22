/**
 * Synchronization Script for Product Category Names
 * - Iterates through all products
 * - Re-populates 'categoryName' and 'subcategoryName' arrays based on their IDs
 * - Ensures denormalized data is in sync with the actual Category records
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const Product = require('../src/models/product.model');
const Category = require('../src/models/category.model');

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error('❌ MONGO_URI is missing in .env');
    process.exit(1);
}

async function sync() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const products = await Product.find({}).populate('category subcategory');
        console.log(`📊 Found ${products.length} products to synchronize...`);

        let updatedCount = 0;

        for (const product of products) {
            // Get category names
            const categoryNames = product.category
                ? product.category.map(c => c.name)
                : [];

            // Get subcategory names
            const subcategoryNames = product.subcategory
                ? product.subcategory.map(s => s.name)
                : [];

            // If no subcategories, use "N/A" to match existing pattern if that's what's expected, 
            // but the model says it's an array of strings. 
            // If the user says "every product have N/A sub category", it might be because it was seeded that way.
            // Let's ensure it's accurate based on actual database relations.

            const finalSubcategoryNames = subcategoryNames.length > 0 ? subcategoryNames : ['N/A'];

            await Product.findByIdAndUpdate(product._id, {
                categoryName: categoryNames,
                subcategoryName: finalSubcategoryNames
            });

            if (updatedCount % 10 === 0) {
                process.stdout.write('♻️ ');
            }
            updatedCount++;
        }

        console.log(`\n\n✅ Successfully synchronized ${updatedCount} products.`);
        console.log('✨ Denormalized fields are now accurate.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during synchronization:', error);
        process.exit(1);
    }
}

sync();
