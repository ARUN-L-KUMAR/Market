const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') });

const Order = require('./src/models/order.model');

const migrateStatuses = async () => {
    try {
        console.log('Connecting to MongoDB...');
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not defined in .env file');
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        console.log('Updating "completed" orders to "delivered"...');
        const result = await Order.updateMany(
            { status: 'completed' },
            { $set: { status: 'delivered' } }
        );

        console.log(`Updated ${result.modifiedCount} orders.`);

        console.log('Migration finished.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

migrateStatuses();
