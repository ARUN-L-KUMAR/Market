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
    // Electronics - SPECIFIC FIRST
    'Tablets': [/\bipads?\b/, /\btab\b/, /\btablets?\b/, /\bsurface\b/, /\bgalaxy tab\b/],
    'Wearables': [/\bwatch(es)?\b/, /\bfitbit\b/, /\bbands?\b/, /\btrackers?\b/, /\bgalaxy watch\b/],
    'Laptops': [/\blaptops?\b/, /\bmacbooks?\b/, /\bxps\b/, /\bthinkpad\b/, /\bchromebooks?\b/, /\bnotebooks?\b/],
    'Mobile': [/\bphones?\b/, /\bgalaxy s22\b/, /\biphones?\b/, /\bpixel\b/, /\boneplus\b/, /\bredmi\b/, /\bpoco\b/, /\bsmartphones?\b/],
    'Audio': [/\bheadphones?\b/, /\bearbuds?\b/, /\bairpods?\b/, /\bspeakers?\b/, /\bsoundbars?\b/, /\bbose\b/, /\bjbl\b/, /\bsony wh\b/],
    'Cameras': [/\bcameras?\b/, /\bnikon\b/, /\bcanon\b/, /\bgopro\b/, /\bfujifilm\b/, /\bmirrorless\b/, /\bdslr\b/],
    'Gaming': [/\bplaystations?\b/, /\bxbox\b/, /\nintendo\b/, /\bps5\b/, /\bgaming\b/, /\bcontrollers?\b/, /\bconsoles?\b/],
    'Smart Home': [/\becho\b/, /\balexa\b/, /\bgoogle home\b/, /\bsmart speaker\b/, /\bnest\b/, /\bring\b/],

    // Fashion
    'Footwear': [/\bnike\b/, /\bjordan\b/, /\bsneakers?\b/, /\bshoes?\b/, /\bboots?\b/, /\badidas\b/, /\bfootwear\b/],
    'Men': [/\bmen\b/, /\bshirts?\b/, /\bpants?\b/, /\bjeans\b/, /\bt-shirts?\b/],

    // Home & Kitchen
    'Appliances': [/\bcoffee\b/, /\bmakers?\b/, /\bblenders?\b/, /\bvacuums?\b/, /\bappliance\b/, /\bfridge\b/, /\brefrigerators?\b/],
    'Furniture': [/\bchairs?\b/, /\bsofas?\b/, /\btables?\b/, /\bdesks?\b/, /\bfurniture\b/],

    // Sports
    'Fitness': [/\byoga\b/, /\bdumbbells?\b/, /\btreadmills?\b/, /\bgym\b/, /\bfitness\b/],
    'Outdoor': [/\btent\b/, /\bcamping\b/, /\bbackpacks?\b/, /\boutdoor\b/]
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

    'Fitness': 'Sports',
    'Outdoor': 'Sports',

    'Fiction': 'Books',
    'Non-Fiction': 'Books'
};

async function importAndFix() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // 1. Load Data
        let rawData;
        try {
            rawData = fs.readFileSync(DATA_FILE, 'utf8');
        } catch (err) {
            console.error('❌ Error reading data file:', err);
            process.exit(1);
        }

        let productsData;
        try {
            productsData = cleanData(JSON.parse(rawData));
            console.log(`✅ Loaded ${productsData.length} products from JSON`);
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
        const summary = {};

        for (let p of productsData) {
            // Determine correct category/subcategory
            const title = (p.title || '').toLowerCase();
            const description = (p.description || '').toLowerCase();

            let matchedSubs = [];
            let matchedParents = new Set();

            // 1. Try matching only the TITLE first (more accurate)
            if (matchedSubs.length === 0) {
                for (const [subName, keywords] of Object.entries(subcategoryKeywords)) {
                    if (keywords.some(kw => {
                        if (kw instanceof RegExp) return kw.test(title);
                        return title.includes(kw.toLowerCase());
                    })) {
                        if (!matchedSubs.includes(subName)) matchedSubs.push(subName);
                    }
                }
            }

            // 2. Try matching the DESCRIPTION for all possible matches
            const searchText = `${title} ${description}`;
            for (const [subName, keywords] of Object.entries(subcategoryKeywords)) {
                if (keywords.some(kw => {
                    if (kw instanceof RegExp) return kw.test(searchText);
                    return searchText.includes(kw.toLowerCase());
                })) {
                    if (!matchedSubs.includes(subName)) matchedSubs.push(subName);
                }
            }

            // Refine "Men" fashion match - ensure it's not actually footwear or something else
            if (matchedSubs.includes('Men') && /\bshoes?\b/.test(searchText)) {
                matchedSubs = matchedSubs.filter(s => s !== 'Men');
                if (!matchedSubs.includes('Footwear')) matchedSubs.push('Footwear');
            }

            // Fallback for special cases in the JSON
            if (matchedSubs.length === 0) {
                if (/\bt-shirts?\b/.test(title)) matchedSubs.push('Men');
            }

            if (matchedSubs.length > 0) {
                matchedSubs.forEach(sub => {
                    const parent = subcategoryToParent[sub];
                    if (parent) matchedParents.add(parent);
                });
            }

            // Smart fallback based on common keywords if no specific category matched
            if (matchedParents.size === 0) {
                if (/\bkitchen\b|\bcoffee\b|\bappliances?\b|\bvacuums?\b/.test(searchText)) {
                    matchedParents.add('Home & Kitchen');
                    if (matchedSubs.length === 0) matchedSubs.push('Appliances');
                } else if (/\bshirts?\b|\bpants?\b|\bclothing\b/.test(searchText)) {
                    matchedParents.add('Fashion');
                    if (matchedSubs.length === 0) matchedSubs.push('Men');
                } else {
                    matchedParents.add('Electronics');
                }
            }

            // Prepare update object
            const productData = { ...p };
            delete productData._id;
            delete productData.__v;
            delete productData.createdAt;
            delete productData.updatedAt;

            // Set new category data
            const parentArray = Array.from(matchedParents);
            const parentIds = parentArray.map(name => categoryMap[name]).filter(id => id);

            productData.category = parentIds;
            productData.categoryName = parentArray;

            const subIds = matchedSubs.map(name => categoryMap[name]).filter(id => id);
            productData.subcategory = subIds;
            productData.subcategoryName = matchedSubs;

            // Formatting price numbers if strings in JSON
            if (typeof productData.price === 'string') productData.price = parseFloat(productData.price);

            // Upsert based on SKU
            if (productData.sku) {
                await Product.findOneAndUpdate(
                    { sku: productData.sku },
                    productData,
                    { upsert: true, new: true }
                );
                console.log(`  ✅ Processed ${p.title} -> [${parentArray.join(', ')}] / [${matchedSubs.join(', ')}]`);
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
