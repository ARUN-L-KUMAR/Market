const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { faker } = require('@faker-js/faker');
dotenv.config();

const Product = require('./src/models/product.model');
const Category = require('./src/models/category.model');
const Brand = require('./src/models/brand.model');

const MONGO_URI = process.env.MONGO_URI;

const seedProducts = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const categories = await Category.find().lean();
        // Exclude problematic or legacy brands from the pool
        const allBrands = await Brand.find({ name: { $ne: 'TestBrand' } }).lean();

        if (categories.length === 0) {
            console.error('❌ No categories found.');
            process.exit(1);
        }

        const subcategories = categories.filter(c => c.parentCategory);
        const parentCategories = categories.filter(c => !c.parentCategory);

        const brandNames = allBrands.length > 0
            ? allBrands.map(b => b.name)
            : ['Apple', 'Samsung', 'Sony', 'Nike', 'Adidas', 'Logitech', 'Dell', 'Canon'];

        console.log(`Found ${parentCategories.length} parent categories, ${subcategories.length} subcategories, and ${brandNames.length} available target brands.`);

        let totalCreated = 0;

        for (const sub of subcategories) {
            const parent = categories.find(c => c._id.toString() === sub.parentCategory.toString());

            for (let i = 1; i <= 5; i++) {
                const title = `${sub.name} ${faker.commerce.productName()} ${faker.string.alphanumeric(4).toUpperCase()}`;
                const price = parseFloat(faker.commerce.price({ min: 100, max: 50000 }));

                const productData = {
                    title: title,
                    description: `${faker.commerce.productDescription()} This premium ${sub.name} is designed for excellence.`,
                    shortDescription: `Top-tier ${sub.name} from our curated collection.`,
                    category: [parent._id],
                    subcategory: [sub._id],
                    brand: faker.helpers.arrayElement(brandNames),
                    sku: `SKU-${sub.name.substring(0, 3).toUpperCase()}-${faker.string.alphanumeric(8).toUpperCase()}-${totalCreated}`,
                    price: price,
                    comparePrice: price * 1.25,
                    costPrice: price * 0.65,
                    stock: faker.number.int({ min: 10, max: 200 }),
                    isActive: true,
                    images: [
                        {
                            url: `https://picsum.photos/seed/${faker.string.uuid()}/800/600`,
                            alt: title,
                            isPrimary: true
                        }
                    ],
                    tags: [sub.name.toLowerCase(), 'premium', 'new-arrival']
                };

                const product = new Product(productData);
                await product.save();
                totalCreated++;
            }
            process.stdout.write('📦');
        }

        console.log(`\n\n🎉 Successfully seeded ${totalCreated} products across ${brandNames.length} unique brands!`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding products:', error);
        process.exit(1);
    }
};

seedProducts();
