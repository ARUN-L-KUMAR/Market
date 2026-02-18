const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Category = require('./src/models/category.model');

const MONGO_URI = process.env.MONGO_URI;

async function getHierarchy() {
    try {
        await mongoose.connect(MONGO_URI);
        const categories = await Category.find().lean();

        const hierarchy = categories.map(c => ({
            id: c._id,
            name: c.name,
            parent: c.parentCategory
        }));

        console.log(JSON.stringify(hierarchy, null, 2));
        process.exit(0);
    } catch (error) {
        process.exit(1);
    }
}

getHierarchy();
