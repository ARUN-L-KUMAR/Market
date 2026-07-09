const mongoose = require('mongoose');
const User = require('../src/models/user.model');

mongoose.connect('mongodb://localhost:27017/market', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.once('open', async () => {
  try {
    const users = await User.find({});
    console.log('📋 Users in database:');
    
    if (users.length === 0) {
      console.log('❌ No users found in database');
    } else {
      users.forEach((user, index) => {
        console.log(`${index + 1}. Email: ${user.email}, Role: ${user.role}, Name: ${user.name}`);
      });
    }

    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error);
    mongoose.connection.close();
  }
});
