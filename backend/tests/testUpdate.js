require('dotenv').config();
const mongoose = require('mongoose');

async function testDirectUpdate() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    // Test the exact same method our controller uses
    const testId = "6879fd2d308401741e5f69ee"; // Philips Hue product
    const testData = {
      images: [
        {
          url: "https://res.cloudinary.com/dxo35vqwm/image/upload/v1733008123/test-image.jpg",
          alt: "Test image",
          isPrimary: true,
          publicId: "test-image"
        }
      ]
    };
    
    console.log('🔄 Testing direct MongoDB collection update...');
    
    // Same method as our controller
    const result = await mongoose.connection.collection('products').updateOne(
      { _id: new mongoose.Types.ObjectId(testId) },
      { $set: testData }
    );
    
    console.log('📊 Update result:', result);
    
    if (result.matchedCount > 0) {
      console.log('✅ Update successful!');
      
      // Fetch updated product
      const updated = await mongoose.connection.collection('products').findOne(
        { _id: new mongoose.Types.ObjectId(testId) }
      );
      console.log('📦 Updated product images:', updated.images);
    } else {
      console.log('❌ No document matched');
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Test failed:', error);
    await mongoose.disconnect();
  }
}

testDirectUpdate();