const mongoose = require('mongoose');
require('dotenv').config();
const Category = require('./src/models/category.model');
const Product = require('./src/models/product.model');

async function verify() {
    await mongoose.connect(process.env.MONGO_URI);

    console.log('=== CATEGORIES ===');
    const cats = await Category.find({});
    cats.forEach(c => {
        const type = c.parentCategory ? 'SUB' : 'TOP';
        const parent = c.parentCategory ? ' -> parent: ' + c.parentCategory : '';
        console.log('  [' + type + '] ' + c.name + ' (' + c._id + ')' + parent);
    });

    console.log('\n=== PRODUCTS ===');
    const products = await Product.find({}).populate('category', 'name').populate('subcategory', 'name');
    products.forEach(p => {
        const cat = p.category ? p.category.name : 'NONE';
        const sub = p.subcategory ? p.subcategory.name : 'NONE';
        console.log('  ' + p.title + ' -> Category: ' + cat + ' | Sub: ' + sub);
    });

    const unmapped = products.filter(p => !p.category);
    console.log('\n=== SUMMARY ===');
    console.log('Total Products: ' + products.length);
    console.log('Categorized: ' + (products.length - unmapped.length));
    console.log('Unmapped: ' + unmapped.length);

    process.exit(0);
}

verify().catch(err => { console.error(err); process.exit(1); });
