const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Models
const Product = require('./src/models/product.model');
const Category = require('./src/models/category.model');

// Config
dotenv.config();
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error('❌ MONGO_URI is missing in .env');
    process.exit(1);
}

const defaultCategories = [
    { name: 'Electronics', description: 'Computing, mobile, and digital hardware.' },
    { name: 'Fashion', description: 'Apparel and accessories.' },
    { name: 'Home & Kitchen', description: 'Kitchenware, appliances and decor.' },
    { name: 'Sports', description: 'Fitness and athletic gear.' },
    { name: 'Books', description: 'Knowledge and literature.' },
    { name: 'General', description: 'Miscellaneous items.' }
];

// Mapping keywords to categories based on test.products.json analysis
const categoryMapping = [
    {
        name: 'Electronics',
        keywords: ['smartphone', 'laptop', 'macbook', 'camera', 'echo', 'tablet', 'samsung', 'apple', 'nikon', 'amazon', '5g', 'm2'],
        subcategories: ['Mobile', 'Laptops', 'Cameras', 'Smart Home']
    },
    {
        name: 'Fashion',
        keywords: ['t-shirt', 'apparel', 'clothing', 'fashion', 'shoes', 'nike', 'jordan'],
        subcategories: ['Men', 'Women', 'Footwear']
    },
    {
        name: 'Home & Kitchen',
        keywords: ['coffee', 'maker', 'kitchen', 'appliances', 'duo'],
        subcategories: ['Appliances', 'Cookware']
    }
];

async function migrate() {
    try {
        console.log('⏳ Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected');

        // 1. Ensure Categories Exist and get their IDs
        console.log('🌱 Synchronizing Category Hierarchy...');
        const catMap = {};
        const subCatMap = {};

        for (const catData of defaultCategories) {
            let cat = await Category.findOne({ name: catData.name });
            if (!cat) {
                cat = await Category.create({
                    ...catData,
                    slug: catData.name.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')
                });
                console.log(`+ Created Category: ${catData.name}`);
            }
            catMap[catData.name] = cat._id;

            // Create subcategories for major nodes
            const mapping = categoryMapping.find(m => m.name === catData.name);
            if (mapping && mapping.subcategories) {
                for (const subName of mapping.subcategories) {
                    let subCat = await Category.findOne({ name: subName, parentCategory: cat._id });
                    if (!subCat) {
                        subCat = await Category.create({
                            name: subName,
                            slug: subName.toLowerCase().replace(/ /g, '-'),
                            parentCategory: cat._id,
                            description: `${subName} subcategory of ${catData.name}`
                        });
                        console.log(`  + Created Subcategory: ${subName} under ${catData.name}`);
                    }
                    subCatMap[subName] = subCat._id;
                }
            }
        }

        // 2. Identify and Map Products
        const products = await Product.find({});
        console.log(`📦 Analyzing ${products.length} products...`);

        let updatedCount = 0;
        for (const product of products) {
            let targetCategoryName = 'General';
            let targetSubCategoryName = null;

            // Heuristic matching based on Title, Brand, and Tags
            const metadata = (
                (product.title || '') + ' ' +
                (product.brand || '') + ' ' +
                (product.description || '') + ' ' +
                (product.tags || []).join(' ')
            ).toLowerCase();

            for (const mapping of categoryMapping) {
                if (mapping.keywords.some(kw => metadata.includes(kw.toLowerCase()))) {
                    targetCategoryName = mapping.name;

                    // Specific subcategory logic for Electronics
                    if (targetCategoryName === 'Electronics') {
                        if (metadata.includes('macbook') || metadata.includes('laptop')) targetSubCategoryName = 'Laptops';
                        else if (metadata.includes('smartphone') || metadata.includes('galaxy')) targetSubCategoryName = 'Mobile';
                        else if (metadata.includes('camera') || metadata.includes('nikon')) targetSubCategoryName = 'Cameras';
                        else if (metadata.includes('echo') || metadata.includes('smart')) targetSubCategoryName = 'Smart Home';
                    }
                    else if (targetCategoryName === 'Fashion') {
                        if (metadata.includes('men')) targetSubCategoryName = 'Men';
                        else if (metadata.includes('women')) targetSubCategoryName = 'Women';
                        else if (metadata.includes('shoes')) targetSubCategoryName = 'Footwear';
                    }
                    else if (targetCategoryName === 'Home & Kitchen') {
                        if (metadata.includes('coffee') || metadata.includes('maker')) targetSubCategoryName = 'Appliances';
                    }
                    break;
                }
            }

            product.category = catMap[targetCategoryName];
            if (targetSubCategoryName) {
                product.subcategory = subCatMap[targetSubCategoryName];
            }

            // Also update the category name field if it exists for backward compatibility/reporting
            if (product.categoryName) {
                product.categoryName = targetCategoryName;
            }

            await product.save();
            console.log(`  -> Mapping product "${product.title}" to [${targetCategoryName}${targetSubCategoryName ? ' > ' + targetSubCategoryName : ''}]`);
            updatedCount++;
        }

        console.log(`\n✨ Migration Complete: ${updatedCount} products re-indexed under new architecture.`);
        process.exit(0);

    } catch (error) {
        console.error('❌ Migration Protocol Failed:', error);
        process.exit(1);
    }
}

migrate();
