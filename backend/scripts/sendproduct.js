const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const Product = require('../src/models/product.model');

const importData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // The processed product.json only had 5 products.
        // I will define the full list here to ensure nothing is lost.
        const products = [

            {
                "title": "Apple Watch Series 9 GPS 45mm",
                "slug": "apple-watch-series-9-gps-45mm",
                "description": "Apple Watch Series 9 with S9 SiP chip, Retina display, advanced health tracking and crash detection.",
                "shortDescription": "S9 Chip | 45mm | Health Tracking",
                "category": "69958d7d2cd735f0f3a65da2",
                "subcategory": "69958d7f2cd735f0f3a65db0",
                "brand": "Apple",
                "sku": "APL-WATCH9-45",
                "price": 41900,
                "comparePrice": 44900,
                "costPrice": 32000,
                "stock": 24,
                "lowStockThreshold": 5,
                "tags": ["apple", "smartwatch", "wearable"],
                "isActive": true,
                "isFeatured": true,
                "rating": { "average": 4.8, "count": 38 },
                "images": [{ "url": "https://store.storeimages.cdn-apple.com/watch-series-9-45mm.png" }]
            },

            {
                "title": "Samsung Galaxy Watch 6 Classic 47mm",
                "slug": "samsung-galaxy-watch-6-classic-47mm",
                "description": "Samsung Galaxy Watch 6 Classic with rotating bezel, AMOLED display and advanced fitness tracking.",
                "shortDescription": "47mm | AMOLED | Fitness Tracking",
                "category": "69958d7d2cd735f0f3a65da2",
                "subcategory": "69958d7f2cd735f0f3a65db0",
                "brand": "Samsung",
                "sku": "SAMS-WATCH6-47",
                "price": 36999,
                "comparePrice": 39999,
                "costPrice": 28000,
                "stock": 20,
                "lowStockThreshold": 4,
                "tags": ["samsung", "smartwatch", "fitness"],
                "isActive": true,
                "isFeatured": true,
                "rating": { "average": 4.6, "count": 21 },
                "images": [{ "url": "https://images.samsung.com/galaxy-watch6-classic.png" }]
            },

            {
                "title": "Noise ColorFit Ultra 3 Bluetooth Calling Smartwatch",
                "slug": "noise-colorfit-ultra-3",
                "description": "Noise ColorFit Ultra 3 with 1.96-inch AMOLED display, Bluetooth calling and 100+ sports modes.",
                "shortDescription": "AMOLED | BT Calling | 100+ Modes",
                "category": "69958d7d2cd735f0f3a65da2",
                "subcategory": "69958d7f2cd735f0f3a65db0",
                "brand": "Noise",
                "sku": "NOISE-CF-ULTRA3",
                "price": 4999,
                "comparePrice": 5999,
                "costPrice": 3600,
                "stock": 65,
                "lowStockThreshold": 12,
                "tags": ["noise", "smartwatch", "budget"],
                "isActive": true,
                "isFeatured": false,
                "rating": { "average": 4.2, "count": 72 },
                "images": [{ "url": "https://cdn.gonoise.com/colorfit-ultra-3.png" }]
            },

            {
                "title": "Boat Wave Sigma Smartwatch",
                "slug": "boat-wave-sigma-smartwatch",
                "description": "Boat Wave Sigma smartwatch with 2.01-inch display, Bluetooth calling and 7-day battery life.",
                "shortDescription": "BT Calling | 7-Day Battery",
                "category": "69958d7d2cd735f0f3a65da2",
                "subcategory": "69958d7f2cd735f0f3a65db0",
                "brand": "Boat",
                "sku": "BOAT-WAVE-SIGMA",
                "price": 2299,
                "comparePrice": 2999,
                "costPrice": 1650,
                "stock": 90,
                "lowStockThreshold": 15,
                "tags": ["boat", "smartwatch", "budget"],
                "isActive": true,
                "isFeatured": false,
                "rating": { "average": 4.1, "count": 105 },
                "images": [{ "url": "https://cdn.boat-lifestyle.com/wave-sigma.png" }]
            },

            {
                "title": "Garmin Venu 3 GPS Smartwatch",
                "slug": "garmin-venu-3-gps-smartwatch",
                "description": "Garmin Venu 3 premium GPS smartwatch with AMOLED display, advanced health metrics and 14-day battery life.",
                "shortDescription": "GPS | AMOLED | 14-Day Battery",
                "category": "69958d7d2cd735f0f3a65da2",
                "subcategory": "69958d7f2cd735f0f3a65db0",
                "brand": "Garmin",
                "sku": "GARMIN-VENU3",
                "price": 44990,
                "comparePrice": 47990,
                "costPrice": 34000,
                "stock": 12,
                "lowStockThreshold": 3,
                "tags": ["garmin", "gps", "fitness"],
                "isActive": true,
                "isFeatured": true,
                "rating": { "average": 4.7, "count": 9 },
                "images": [{ "url": "https://static.garmincdn.com/venu-3.png" }]
            }

        ];

        console.log(`Prepared ${products.length} products for import.`);

        // Insert or update
        for (const p of products) {
            await Product.findOneAndUpdate(
                { slug: p.slug },
                p,
                { upsert: true, new: true }
            );
        }

        console.log('✅ Products imported/updated successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Import failed:', err);
        process.exit(1);
    }
};

importData();
