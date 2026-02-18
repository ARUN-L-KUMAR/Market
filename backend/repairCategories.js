/**
 * Repair Categories Script
 * - Re-creates categories and subcategories
 * - Re-links existing products to the correct category/subcategory
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Category = require('./src/models/category.model');
const Product = require('./src/models/product.model');

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error('❌ MONGO_URI is missing in .env');
    process.exit(1);
}

// Category tree definition
const categoryTree = [
    {
        name: 'Electronics',
        slug: 'electronics',
        description: 'Computing, Mobile, and Digital Hardware.',
        subcategories: [
            { name: 'Mobile', slug: 'mobile', description: 'Mobile subcategory of Electronics' },
            { name: 'Laptops', slug: 'laptops', description: 'Laptops subcategory of Electronics' },
            { name: 'Cameras', slug: 'cameras', description: 'Cameras subcategory of Electronics' },
            { name: 'Smart Home', slug: 'smart-home', description: 'Smart Home subcategory of Electronics' },
            { name: 'Audio', slug: 'audio', description: 'Audio subcategory of Electronics' },
            { name: 'Gaming', slug: 'gaming', description: 'Gaming subcategory of Electronics' },
            { name: 'Wearables', slug: 'wearables', description: 'Wearables subcategory of Electronics' },
            { name: 'Tablets', slug: 'tablets', description: 'Tablets subcategory of Electronics' }
        ]
    },
    {
        name: 'Fashion',
        slug: 'fashion',
        description: 'Clothing, footwear, and accessories.',
        subcategories: [
            { name: 'Men', slug: 'men', description: 'Men fashion' },
            { name: 'Women', slug: 'women', description: 'Women fashion' },
            { name: 'Footwear', slug: 'footwear', description: 'Shoes and sneakers' },
            { name: 'Accessories', slug: 'accessories', description: 'Fashion accessories' }
        ]
    },
    {
        name: 'Home & Kitchen',
        slug: 'home-kitchen',
        description: 'Appliances, decor, and kitchen essentials.',
        subcategories: [
            { name: 'Appliances', slug: 'appliances', description: 'Home appliances' },
            { name: 'Furniture', slug: 'furniture', description: 'Home furniture' },
            { name: 'Decor', slug: 'decor', description: 'Home decor' },
            { name: 'Kitchen', slug: 'kitchen', description: 'Kitchen tools and essentials' }
        ]
    },
    {
        name: 'Sports',
        slug: 'sports',
        description: 'Athletic gear and outdoor equipment.',
        subcategories: [
            { name: 'Fitness', slug: 'fitness', description: 'Fitness equipment' },
            { name: 'Outdoor', slug: 'outdoor', description: 'Outdoor gear' }
        ]
    },
    {
        name: 'Books',
        slug: 'books',
        description: 'Knowledge and literature.',
        subcategories: [
            { name: 'Fiction', slug: 'fiction', description: 'Fiction books' },
            { name: 'Non-Fiction', slug: 'non-fiction', description: 'Non-fiction books' }
        ]
    }
];

// Keyword-to-subcategory mapping for auto-assigning products
const subcategoryKeywords = {
    'Mobile': ['phone', 'galaxy s', 'iphone', 'pixel', 'oneplus', 'redmi', 'poco', 'mobile'],
    'Laptops': ['laptop', 'macbook', 'xps', 'thinkpad', 'chromebook', 'notebook', 'dell xps'],
    'Cameras': ['camera', 'nikon', 'canon eos', 'sony a7', 'gopro', 'fujifilm', 'mirrorless', 'dslr'],
    'Smart Home': ['echo', 'alexa', 'google home', 'smart speaker', 'smart home', 'nest', 'ring'],
    'Audio': ['headphone', 'earbuds', 'airpods', 'speaker', 'soundbar', 'bose', 'jbl'],
    'Gaming': ['playstation', 'xbox', 'nintendo', 'ps5', 'gaming', 'controller'],
    'Wearables': ['watch', 'fitbit', 'apple watch', 'galaxy watch', 'band', 'tracker'],
    'Tablets': ['ipad', 'tab s', 'tablet', 'surface'],
    'Footwear': ['nike', 'jordan', 'sneaker', 'shoe', 'boot', 'adidas'],
    'Fitness': ['yoga', 'dumbbell', 'treadmill', 'gym', 'fitness'],
};

async function repair() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Step 1: Check current state
        const existingCategories = await Category.countDocuments();
        const existingProducts = await Product.countDocuments();
        console.log(`📊 Current state: ${existingCategories} categories, ${existingProducts} products`);

        // Step 2: Clear existing categories (they're broken/empty anyway)
        if (existingCategories > 0) {
            await Category.deleteMany({});
            console.log('🗑️  Cleared existing categories');
        }

        // Step 3: Create parent categories
        const categoryMap = {}; // name -> ObjectId
        const subcategoryMap = {}; // name -> ObjectId

        for (const cat of categoryTree) {
            const parent = await Category.create({
                name: cat.name,
                slug: cat.slug,
                description: cat.description,
                isActive: true,
                parentCategory: null
            });
            categoryMap[cat.name] = parent._id;
            console.log(`  ✅ Created parent: ${cat.name} (${parent._id})`);

            // Create subcategories
            for (const sub of cat.subcategories) {
                const child = await Category.create({
                    name: sub.name,
                    slug: sub.slug,
                    description: sub.description,
                    isActive: true,
                    parentCategory: parent._id
                });
                subcategoryMap[sub.name] = child._id;
                console.log(`     ↳ Created sub: ${sub.name} (${child._id})`);
            }
        }

        const totalCreated = await Category.countDocuments();
        console.log(`\n✅ Created ${totalCreated} categories total\n`);

        // Step 4: Re-link products to categories
        const products = await Product.find({});
        let linked = 0;
        let unlinked = 0;

        for (const product of products) {
            const title = (product.title || '').toLowerCase();
            const brand = (product.brand || '').toLowerCase();
            const searchText = `${title} ${brand}`;

            let matchedParent = null;
            let matchedSub = null;

            // Try to match subcategory by keywords
            for (const [subName, keywords] of Object.entries(subcategoryKeywords)) {
                const found = keywords.some(kw => searchText.includes(kw.toLowerCase()));
                if (found) {
                    matchedSub = subName;
                    break;
                }
            }

            // Determine parent from subcategory
            if (matchedSub) {
                for (const cat of categoryTree) {
                    if (cat.subcategories.some(s => s.name === matchedSub)) {
                        matchedParent = cat.name;
                        break;
                    }
                }
            }

            // Fallback: assign to Electronics if no match
            if (!matchedParent) {
                matchedParent = 'Electronics';
            }

            const updateData = { category: categoryMap[matchedParent] };
            if (matchedSub && subcategoryMap[matchedSub]) {
                updateData.subcategory = subcategoryMap[matchedSub];
            }

            await Product.findByIdAndUpdate(product._id, updateData);
            console.log(`  📦 ${product.title} → ${matchedParent}${matchedSub ? ' > ' + matchedSub : ''}`);
            linked++;
        }

        console.log(`\n✅ Re-linked ${linked} products`);
        if (unlinked > 0) {
            console.log(`⚠️  ${unlinked} products could not be auto-linked`);
        }

        console.log('\n✨ Repair completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

repair();
