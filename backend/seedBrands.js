const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { faker } = require('@faker-js/faker');
dotenv.config();

const Brand = require('./src/models/brand.model');

const MONGO_URI = process.env.MONGO_URI;

const slugify = (text) => {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
};

const seedBrands = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        console.log('🌱 Seeding 60 unique brands...');

        const existingBrands = await Brand.find().select('name');
        const existingNames = new Set(existingBrands.map(b => b.name));

        let createdCount = 0;
        const targetCount = 60;

        while (createdCount < targetCount) {
            const companyName = faker.company.name();

            if (!existingNames.has(companyName)) {
                const brand = new Brand({
                    name: companyName,
                    slug: slugify(companyName) + '-' + faker.string.alphanumeric(4),
                    description: faker.company.catchPhrase() + '. ' + faker.lorem.sentence(),
                    website: faker.internet.url(),
                    logo: `https://logo.clearbit.com/${faker.internet.domainName() || 'example.com'}`,
                    status: 'Active'
                });

                await brand.save();
                existingNames.add(companyName);
                createdCount++;
                if (createdCount % 10 === 0) console.log(`   Processed ${createdCount} brands...`);
            }
        }

        console.log(`\n🎉 Successfully seeded ${createdCount} new brands!`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding brands:', error);
        process.exit(1);
    }
};

seedBrands();
