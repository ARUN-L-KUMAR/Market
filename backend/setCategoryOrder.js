const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Category = require('./src/models/category.model');

const MONGO_URI = process.env.MONGO_URI;

const categoryOrder = {
    'Electronics': 1,
    'Fashion': 2,
    'Home & Kitchen': 3,
    'Sports': 4,
    'Books': 5,
    // Subcategories for Electronics
    'Mobile': 11,
    'Laptops': 12,
    'Audio': 13,
    'Cameras': 14,
    'Gaming': 15,
    'Smart Home': 16,
    'Wearables': 17,
    'Tablets': 18,
    // Subcategories for Fashion
    'Men': 21,
    'Women': 22,
    'Footwear': 23,
    'Accessories': 24,
    // Subcategories for Home & Kitchen
    'Appliances': 31,
    'Furniture': 32,
    'Kitchen': 33,
    'Decor': 34,
    // Subcategories for Sports
    'Fitness': 41,
    'Outdoor': 42,
    // Subcategories for Books
    'Fiction': 51,
    'Non-Fiction': 52
};

async function setOrder() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const categories = await Category.find({});
        let updatedCount = 0;

        for (const cat of categories) {
            const order = categoryOrder[cat.name];
            if (order !== undefined) {
                await Category.findByIdAndUpdate(cat._id, { sortOrder: order });
                console.log(`  ✅ Set ${cat.name} order to ${order}`);
                updatedCount++;
            }
        }

        console.log(`\n✨ Successfully updated order for ${updatedCount} categories.`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

setOrder();
