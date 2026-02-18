const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Order = require('./src/models/order.model');

async function checkOrders() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected');

        const stats = await Order.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    firstDate: { $min: '$createdAt' },
                    lastDate: { $max: '$createdAt' }
                }
            }
        ]);

        console.log('\n--- Order Status & Date Breakdown ---');
        console.log(JSON.stringify(stats, null, 2));

        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

checkOrders();
