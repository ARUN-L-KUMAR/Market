const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./src/models/product.model');
const Movement = require('./src/models/movement.model');
const User = require('./src/models/user.model');

dotenv.config();

async function seedMovements() {
    try {
        console.log('⏳ Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected');

        // Clear existing movements
        await Movement.deleteMany({});
        console.log('🗑️ Cleared old movements');

        const products = await Product.find().limit(10);
        const admin = await User.findOne({ role: 'admin' });

        if (products.length === 0) {
            console.log('❌ No products found to seed movements for.');
            process.exit(1);
        }

        console.log(`🌱 Seeding movements for ${products.length} products...`);

        const reasons = ['restock', 'sale', 'adjustment', 'cancellation', 'return'];
        const movements = [];

        for (const product of products) {
            // Add a restock event
            movements.push({
                product: product._id,
                type: 'in',
                quantity: 50,
                reason: 'restock',
                previousStock: 0,
                currentStock: 50,
                performedBy: admin?._id,
                notes: 'Initial inventory load'
            });

            // Add a sale
            movements.push({
                product: product._id,
                type: 'out',
                quantity: 5,
                reason: 'sale',
                previousStock: 50,
                currentStock: 45,
                notes: 'Order #ORD-TEST-001'
            });

            // Add an adjustment
            movements.push({
                product: product._id,
                type: 'out',
                quantity: 2,
                reason: 'adjustment',
                previousStock: 45,
                currentStock: 43,
                performedBy: admin?._id,
                notes: 'Damaged during handling'
            });
        }

        // Specifically make one product out of stock
        const outOfStockProduct = products[0];
        await Product.findByIdAndUpdate(outOfStockProduct._id, { stock: 0 });
        movements.push({
            product: outOfStockProduct._id,
            type: 'out',
            quantity: 43,
            reason: 'sale',
            previousStock: 43,
            currentStock: 0,
            notes: 'Bulk purchase clearing stock'
        });

        await Movement.insertMany(movements);
        console.log('✨ Success! Movement logs seeded.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

seedMovements();
