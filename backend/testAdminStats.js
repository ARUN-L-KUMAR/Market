const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Product = require('./src/models/product.model');
const Order = require('./src/models/order.model');
const User = require('./src/models/user.model');

async function testStats() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected');

        // Exact logic from admin.controller.js
        const revenueData = await Order.aggregate([
            { $match: { status: { $in: ['completed', 'delivered'] } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;
        console.log('Total Revenue (using totalAmount):', totalRevenue);

        // Fixed logic
        const revenueDataFixed = await Order.aggregate([
            { $match: { status: { $in: ['completed', 'delivered'] } } },
            { $group: { _id: null, total: { $sum: '$total' } } }
        ]);
        const totalRevenueFixed = revenueDataFixed.length > 0 ? revenueDataFixed[0].total : 0;
        console.log('Total Revenue (using total):', totalRevenueFixed);

        const totalOrders = await Order.countDocuments();
        const totalProducts = await Product.countDocuments();
        const totalUsers = await User.countDocuments();

        console.log('Total Orders:', totalOrders);
        console.log('Total Products:', totalProducts);
        console.log('Total Users:', totalUsers);

        // Check statuses of orders
        const statuses = await Order.distinct('status');
        console.log('Order Statuses present in DB:', statuses);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

testStats();
