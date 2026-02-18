const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');

// Models
const User = require('./src/models/user.model');
const Product = require('./src/models/product.model');
const Category = require('./src/models/category.model');
const Order = require('./src/models/order.model');

// Config
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error('❌ MONGO_URI is missing in .env');
    process.exit(1);
}

const categories = [
    { name: 'Electronics', slug: 'electronics', description: 'Gagdets and tech', isActive: true },
    { name: 'Fashion', slug: 'fashion', description: 'Clothing and accessories', isActive: true },
    { name: 'Home & Kitchen', slug: 'home-kitchen', description: 'Appliances and decor', isActive: true },
    { name: 'Sports', slug: 'sports', description: 'Athletic gear and equipment', isActive: true },
    { name: 'Books', slug: 'books', description: 'Knowledge and literature', isActive: true }
];

const users = [
    { name: 'Admin User', email: 'admin@market.com', password: 'password123', role: 'admin', isActive: true, isEmailVerified: true },
    { name: 'Manager User', email: 'manager@market.com', password: 'password123', role: 'manager', isActive: true, isEmailVerified: true },
    { name: 'Support User', email: 'support@market.com', password: 'password123', role: 'support', isActive: true, isEmailVerified: true },
    { name: 'John Doe', email: 'john@example.com', password: 'password123', role: 'user', isActive: true, isEmailVerified: true },
    { name: 'Jane Smith', email: 'jane@example.com', password: 'password123', role: 'user', isActive: true, isEmailVerified: true },
    { name: 'Robert Brown', email: 'robert@example.com', password: 'password123', role: 'user', isActive: true, isEmailVerified: true },
    { name: 'Emily Davis', email: 'emily@example.com', password: 'password123', role: 'user', isActive: true, isEmailVerified: true },
    { name: 'Michael Wilson', email: 'michael@example.com', password: 'password123', role: 'user', isActive: true, isEmailVerified: true },
    { name: 'Sarah Miller', email: 'sarah@example.com', password: 'password123', role: 'user', isActive: true, isEmailVerified: true },
    { name: 'David Taylor', email: 'david@example.com', password: 'password123', role: 'user', isActive: true, isEmailVerified: true }
];

const sampleProducts = [
    {
        title: "MacBook Air M2",
        description: "Strikingly thin design, up to 18 hours of battery life, and a gorgeous Liquid Retina display.",
        shortDescription: "Thin, light, and powerful laptop.",
        price: 1199,
        comparePrice: 1299,
        stock: 25,
        sku: "APPLE-MBA-M2-001",
        brand: "Apple",
        categoryName: "Electronics",
        images: [{ url: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=500", alt: "MacBook Air", isPrimary: true }],
        tags: ["laptop", "apple", "m2"],
        isActive: true,
        isFeatured: true
    },
    {
        title: "Sony PlayStation 5",
        description: "Experience lightning-fast loading with an ultra-high speed SSD, deeper immersion with support for haptic feedback.",
        shortDescription: "Next-gen gaming console.",
        price: 499,
        comparePrice: 549,
        stock: 15,
        sku: "SONY-PS5-001",
        brand: "Sony",
        categoryName: "Electronics",
        images: [{ url: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=500", alt: "PS5", isPrimary: true }],
        tags: ["gaming", "sony", "console"],
        isActive: true,
        isFeatured: true
    },
    {
        title: "Nike Air Jordan 1",
        description: "The classic sneaker that started it all. High-top design with premium leather.",
        shortDescription: "Iconic basketball sneakers.",
        price: 170,
        comparePrice: 200,
        stock: 50,
        sku: "NIKE-AJ1-001",
        brand: "Nike",
        categoryName: "Fashion",
        images: [{ url: "https://images.unsplash.com/photo-1584441484744-8390f7794e7c?w=500", alt: "Jordan 1", isPrimary: true }],
        tags: ["shoes", "nike", "fashion"],
        isActive: true
    },
    {
        title: "Instant Pot Duo 7-in-1",
        description: "Pressure cook, slow cook, rice cook, yogurt maker, steamer, sauté pan and food warmer.",
        shortDescription: "Versatile multi-cooker.",
        price: 99,
        comparePrice: 129,
        stock: 40,
        sku: "INSTANT-POT-D01",
        brand: "Instant Pot",
        categoryName: "Home & Kitchen",
        images: [{ url: "https://images.unsplash.com/photo-1584990344667-51ce38637e6b?w=500", alt: "Instant Pot", isPrimary: true }],
        tags: ["kitchen", "cooking", "appliances"],
        isActive: true
    }
];

// Add more products dynamically to reach ~25
for (let i = 5; i <= 25; i++) {
    const cat = categories[i % categories.length].name;
    sampleProducts.push({
        title: `Product ${i} - ${cat}`,
        description: `Detailed description for Product ${i} in category ${cat}.`,
        shortDescription: `Short description for Product ${i}.`,
        price: Math.floor(Math.random() * 500) + 10,
        comparePrice: Math.floor(Math.random() * 600) + 20,
        stock: Math.floor(Math.random() * 100) + 5,
        sku: `SKU-MARKET-${i.toString().padStart(3, '0')}`,
        brand: "Generic Brand",
        categoryName: cat,
        images: [{ url: `https://images.unsplash.com/photo-${1500000000000 + i}?w=500`, alt: `Product ${i}`, isPrimary: true }],
        tags: [cat.toLowerCase(), "test", "mock"],
        isActive: true
    });
}

async function seed() {
    try {
        console.log('⏳ Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        console.log('🗑️ Clearing existing data (Categories, Products, Users, Orders)...');
        await Category.deleteMany({});
        await Product.deleteMany({});
        await User.deleteMany({});
        await Order.deleteMany({});

        // Seed Categories
        console.log('🌱 Seeding Categories...');
        const createdCategories = await Category.insertMany(categories);
        console.log(`✅ Created ${createdCategories.length} categories`);

        // Seed Users
        console.log('🌱 Seeding Users...');
        // We don't need to hash because User model has pre-save hook
        const createdUsers = await User.insertMany(users);
        console.log(`✅ Created ${createdUsers.length} users`);

        // Seed Products
        console.log('🌱 Seeding Products...');
        const productsToInsert = sampleProducts.map(p => {
            const category = createdCategories.find(c => c.name === p.categoryName);
            return { ...p, category: category._id };
        });
        const createdProducts = await Product.insertMany(productsToInsert);
        console.log(`✅ Created ${createdProducts.length} products`);

        // Seed Orders
        console.log('🌱 Seeding Orders...');
        const orderStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        const paymentMethods = ['credit_card', 'debit_card', 'paypal', 'cash_on_delivery'];
        const orders = [];

        for (let i = 1; i <= 20; i++) {
            const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];
            const numItems = Math.floor(Math.random() * 3) + 1;
            const items = [];
            let subtotal = 0;

            for (let j = 0; j < numItems; j++) {
                const randomProduct = createdProducts[Math.floor(Math.random() * createdProducts.length)];
                const quantity = Math.floor(Math.random() * 2) + 1;
                items.push({
                    product: randomProduct._id,
                    quantity,
                    price: randomProduct.price
                });
                subtotal += randomProduct.price * quantity;
            }

            const shipping = 10;
            const tax = subtotal * 0.1;
            const total = subtotal + shipping + tax;

            orders.push({
                user: randomUser._id,
                items,
                subtotal,
                tax,
                shipping,
                total,
                status: orderStatuses[Math.floor(Math.random() * orderStatuses.length)],
                paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
                paymentStatus: Math.random() > 0.2 ? 'paid' : 'pending',
                shippingAddress: {
                    fullName: randomUser.name,
                    address: `${Math.floor(Math.random() * 999)} Mock St`,
                    city: 'Mockville',
                    state: 'MS',
                    zipCode: '12345',
                    country: 'USA'
                }
            });
        }

        const createdOrders = await Order.insertMany(orders);
        console.log(`✅ Created ${createdOrders.length} orders`);

        console.log('✨ Seeding completed successfully!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error seeding data:', error);
        process.exit(1);
    }
}

seed();
