const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
dotenv.config();

const Product = require('./src/models/product.model');
const Order = require('./src/models/order.model');
const User = require('./src/models/user.model');

async function testStats() {
    const results = {};
    try {
        await mongoose.connect(process.env.MONGO_URI);

        results.connected = true;
        results.totalOrders = await Order.countDocuments();
        results.totalProducts = await Product.countDocuments();
        results.totalUsers = await User.countDocuments();
        results.orderStatuses = await Order.distinct('status');

        const revenueData = await Order.aggregate([
            { $match: { status: { $in: ['completed', 'delivered'] } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        results.totalRevenueModel = revenueData.length > 0 ? revenueData[0].total : 0;

        const revenueDataFixed = await Order.aggregate([
            { $match: { status: { $in: ['completed', 'delivered', 'paid', 'success'] } } },
            { $group: { _id: null, total: { $sum: '$total' } } }
        ]);
        results.totalRevenueFixed = revenueDataFixed.length > 0 ? revenueDataFixed[0].total : 0;

        fs.writeFileSync('stats_result.json', JSON.stringify(results, null, 2));
        process.exit(0);
    } catch (err) {
        fs.writeFileSync('stats_result.json', JSON.stringify({ error: err.message }, null, 2));
        process.exit(1);
    }
}

testStats();
