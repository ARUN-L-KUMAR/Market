const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

async function checkDb() {
    try {
        console.log('Connecting to:', MONGO_URI.replace(/:([^@]+)@/, ':****@')); // Hide password
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected');

        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('\n--- Database Stats ---');
        for (const col of collections) {
            const count = await mongoose.connection.db.collection(col.name).countDocuments();
            console.log(`Collection: ${col.name.padEnd(15)} Count: ${count}`);
        }

        // Check specifically for Admin users
        const usersCol = mongoose.connection.db.collection('users');
        const adminCount = await usersCol.countDocuments({ role: 'admin' });
        console.log(`\nAdmin Users: ${adminCount}`);

        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

checkDb();
