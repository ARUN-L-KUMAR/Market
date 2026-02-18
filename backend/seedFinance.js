const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./src/models/user.model');
const Product = require('./src/models/product.model');
const Order = require('./src/models/order.model');
const Return = require('./src/models/return.model');
const Transaction = require('./src/models/transaction.model');

const MONGO_URI = process.env.MONGO_URI;

const seedFinance = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // 1. Get/Create User
        let user = await User.findOne({ email: 'john@example.com' });
        if (!user) {
            user = await User.create({
                name: 'John Doe',
                email: 'john@example.com',
                password: 'password123',
                role: 'user',
                isActive: true,
                isEmailVerified: true
            });
            console.log('👤 Created user John Doe');
        }

        // 2. Get some products
        const products = await Product.find({ isActive: true }).limit(5);
        if (products.length === 0) {
            console.log('❌ No products found. Please seed products first.');
            process.exit(1);
        }

        // 3. Create mock orders with different statuses
        console.log('🛒 Creating mock orders...');
        const orderData = [
            { status: 'delivered', paymentStatus: 'paid', date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
            { status: 'delivered', paymentStatus: 'paid', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
            { status: 'shipped', paymentStatus: 'paid', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
            { status: 'processing', paymentStatus: 'paid', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
            { status: 'pending', paymentStatus: 'pending', date: new Date() }
        ];

        const createdOrders = [];
        for (let i = 0; i < orderData.length; i++) {
            const data = orderData[i];
            const product = products[i % products.length];

            const order = new Order({
                user: user._id,
                items: [{
                    product: product._id,
                    quantity: 1,
                    price: product.price
                }],
                subtotal: product.price,
                total: product.price + 10, // Plus shipping
                shipping: 10,
                status: data.status,
                paymentStatus: data.paymentStatus,
                paymentMethod: i % 2 === 0 ? 'razorpay' : 'cash_on_delivery',
                shippingAddress: {
                    fullName: 'John Doe',
                    address: '123 Main St',
                    city: 'New York',
                    state: 'NY',
                    zipCode: '10001',
                    country: 'USA'
                },
                createdAt: data.date
            });
            await order.save();
            createdOrders.push(order);

            // Create transaction for paid orders
            if (data.paymentStatus === 'paid') {
                const txn = new Transaction({
                    user: user._id,
                    order: order._id,
                    type: 'payment',
                    amount: order.total,
                    paymentGateway: order.paymentMethod === 'cash_on_delivery' ? 'cod' : order.paymentMethod,
                    gatewayTransactionId: order.paymentMethod === 'cash_on_delivery' ? null : `pay_${Math.random().toString(36).substr(2, 9)}`,
                    status: 'success',
                    description: `Payment for Order #${order.orderNumber}`,
                    createdAt: data.date,
                    processedAt: data.date
                });
                await txn.save();
            }
        }
        console.log(`✅ Created ${createdOrders.length} mock orders and transactions`);

        // 4. Create Return Requests for delivered orders
        console.log('📦 Creating return requests...');
        const deliveredOrders = createdOrders.filter(o => o.status === 'delivered');

        for (let i = 0; i < deliveredOrders.length; i++) {
            const order = deliveredOrders[i];
            const returnStatus = i === 0 ? 'pending' : 'approved';

            const retReq = new Return({
                order: order._id,
                user: user._id,
                items: order.items,
                reason: i % 2 === 0 ? 'damaged_product' : 'size_fit_issue',
                reasonDetails: 'The product arrived with significant damage to the outer casing.',
                refundAmount: order.total - order.shipping,
                status: returnStatus,
                refundStatus: returnStatus === 'approved' ? 'pending' : 'not_applicable'
            });
            await retReq.save();

            // If approved, create a potentially upcoming refund transaction
            if (returnStatus === 'approved') {
                // We'll create a pending refund transaction log
                const refundTxn = new Transaction({
                    user: user._id,
                    order: order._id,
                    type: 'refund',
                    amount: retReq.refundAmount,
                    paymentGateway: order.paymentMethod === 'cash_on_delivery' ? 'cod' : order.paymentMethod,
                    status: 'pending',
                    description: `Refund for Return #${retReq.returnNumber}`
                });
                await refundTxn.save();
            }
        }
        console.log(`✅ Created ${deliveredOrders.length} return requests`);

        console.log('🎉 Finance Seeding Completed Successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error seeding finance data:', err);
        process.exit(1);
    }
};

seedFinance();
