const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Product = require('./src/models/product.model');
const Brand = require('./src/models/brand.model');

const MONGO_URI = process.env.MONGO_URI;

async function verify() {
    try {
        await mongoose.connect(MONGO_URI);

        const totalProducts = await Product.countDocuments();
        const seededProducts = await Product.find({ sku: /^SKU-/ });

        const brandStats = {};
        seededProducts.forEach(p => {
            brandStats[p.brand] = (brandStats[p.brand] || 0) + 1;
        });

        console.log('\n--- Brand Distribution Stats ---');
        console.log(`Total Products: ${totalProducts}`);
        console.log(`Seeded Products (starting with SKU-): ${seededProducts.length}`);
        console.log(`Unique Brands in Seeded Data: ${Object.keys(brandStats).length}`);

        console.log('\nTop 10 Brands in Seeded Data:');
        Object.entries(brandStats)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .forEach(([brand, count]) => {
                console.log(`- ${brand}: ${count} products`);
            });

        process.exit(0);
    } catch (error) {
        process.exit(1);
    }
}

verify();
