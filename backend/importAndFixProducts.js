/**
 * Import and Fix Products Script
 * - Reads market-data/test.products.json
 * - Correctly categorizes products based on keywords (fixing the "everything is Electronics" issue)
 * - Upserts products into MongoDB
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
dotenv.config();

const Product = require('./src/models/product.model');
const Category = require('./src/models/category.model');

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error('❌ MONGO_URI is missing in .env');
    process.exit(1);
}

const DATA_FILE = path.join(__dirname, '../market-data/test.products.json');

// Helper to clean MongoDB extended JSON
const cleanData = (obj) => {
    if (Array.isArray(obj)) {
        return obj.map(v => cleanData(v));
    } else if (obj !== null && typeof obj === 'object') {
        if (obj.$oid) return obj.$oid;
        if (obj.$date) return new Date(obj.$date);

        const newObj = {};
        for (const key in obj) {
            newObj[key] = cleanData(obj[key]);
        }
        return newObj;
    }
    return obj;
};

// Keyword-to-subcategory mapping
const subcategoryKeywords = {
    // Electronics
    'Mobile': ['phone', 'galaxy s', 'iphone', 'pixel', 'oneplus', 'redmi', 'poco', 'mobile', 'smartphone'],
    'Laptops': ['laptop', 'macbook', 'xps', 'thinkpad', 'chromebook', 'notebook', 'dell xps'],
    'Cameras': ['camera', 'nikon', 'canon', 'sony a7', 'gopro', 'fujifilm', 'mirrorless', 'dslr'],
    'Smart Home': ['echo', 'alexa', 'google home', 'smart speaker', 'smart home', 'nest', 'ring'],
    'Audio': ['headphone', 'earbuds', 'airpods', 'speaker', 'soundbar', 'bose', 'jbl', 'sony wh'],
    'Gaming': ['playstation', 'xbox', 'nintendo', 'ps5', 'gaming', 'controller', 'console'],
    'Wearables': ['watch', 'fitbit', 'apple watch', 'galaxy watch', 'band', 'tracker'],
    'Tablets': ['ipad', 'tab s', 'tablet', 'surface'],

    // Fashion
    'Men': ['men', 'shirt', 'pant', 'jeans', 't-shirt'], // Broad match, refine order
    'Footwear': ['nike', 'jordan', 'sneaker', 'shoe', 'boot', 'adidas', 'footwear'],

    // Home & Kitchen
    'Appliances': ['coffee', 'maker', 'blender', 'vacuum', 'appliance', 'fridge'],
    'Furniture': ['chair', 'sofa', 'table', 'desk', 'furniture'],

    // Sports
    'Fitness': ['yoga', 'dumbbell', 'treadmill', 'gym', 'fitness'],
    'Outdoor': ['tent', 'camping', 'backpack', 'outdoor']
};

// Parent category mapping
const subcategoryToParent = {
    'Mobile': 'Electronics',
    'Laptops': 'Electronics',
    'Cameras': 'Electronics',
    'Smart Home': 'Electronics',
    'Audio': 'Electronics',
    'Gaming': 'Electronics',
    'Wearables': 'Electronics',
    'Tablets': 'Electronics',

    'Men': 'Fashion',
    'Women': 'Fashion',
    'Footwear': 'Fashion',
    'Accessories': 'Fashion',

    'Appliances': 'Home & Kitchen',
    'Furniture': 'Home & Kitchen',
    'Decor': 'Home & Kitchen',
    'Kitchen': 'Home & Kitchen',
    'Smart Home': 'Home & Kitchen',

    'Fitness': 'Sports',
    'Outdoor': 'Sports',

    'Fiction': 'Books',
    'Non-Fiction': 'Books'
};

async function importAndFix() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');



        let productsData;
        try {
            productsData = cleanData(JSON.parse(rawData));
            console.log(`Pb Loaded ${productsData.length} products from JSON`);
        } catch (err) {
            console.error('❌ Error processing JSON data:', err);
            process.exit(1);
        }

        // 2. Load Categories to get ObjectIds
        const categories = await Category.find({});
        const categoryMap = {}; // name -> ObjectId

        categories.forEach(c => {
            categoryMap[c.name] = c._id;
        });

        let updatedCount = 0;

        for (let p of productsData) {
            // Determine correct category/subcategory
            const title = (p.title || '').toLowerCase();
            const description = (p.description || '').toLowerCase();
            const searchText = `${title} ${description}`;

            let matchedSub = null;
            let matchedParent = null;

            // Find subcategory match
            for (const [subName, keywords] of Object.entries(subcategoryKeywords)) {
                if (keywords.some(kw => searchText.includes(kw.toLowerCase()))) {
                    matchedSub = subName;
                    break;
                }
            }

            // Refine "Men" fashion match - ensure it's not actually footwear or something else
            if (matchedSub === 'Men' && searchText.includes('shoe')) {
                matchedSub = 'Footwear';
            }

            // Fallback for special cases in the JSON
            if (!matchedSub) {
                if (title.includes('t-shirt')) matchedSub = 'Men'; // Assume men's for now or add 'Clothing'
            }

            if (matchedSub) {
                matchedParent = subcategoryToParent[matchedSub];
            }

            // Default fallback
            if (!matchedParent) matchedParent = 'Electronics';

            // Prepare update object
            // Remove _id from data to allow mongoose to handle or use it as criteria
            const productData = { ...p };
            delete productData._id;
            delete productData.__v;
            delete productData.createdAt;
            delete productData.updatedAt;

            // Set new category data
            if (matchedParent && categoryMap[matchedParent]) {
                productData.category = categoryMap[matchedParent];
                productData.categoryName = matchedParent;
            }

            if (matchedSub && categoryMap[matchedSub]) {
                productData.subcategory = categoryMap[matchedSub];
                productData.subcategoryName = matchedSub;
            }

            // Formatting price numbers if strings in JSON
            if (typeof productData.price === 'string') productData.price = parseFloat(productData.price);

            // Upsert based on SKU
            if (productData.sku) {
                await Product.findOneAndUpdate(
                    { sku: productData.sku },
                    productData,
                    { upsert: true, new: true }
                );
                console.log(`  ✅ Processed ${p.title} -> ${matchedParent} / ${matchedSub}`);
                updatedCount++;
            }
        }

        console.log(`\n✨ Import and fix completed! Processed ${updatedCount} products.`);
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

importAndFix();
