/**
 * MongoDB Data Viewer Utility
 * 
 * Run this script with node to view the data stored in your database
 * Usage: node viewData.js [collection]
 * 
 * Example:
 *   node viewData.js products - View all products
 *   node viewData.js categories - View all categories
 *   node viewData.js reviews - View all reviews
 */

require('dotenv').config();
const mongoose = require('mongoose');

// Import models
require('../models/product.model');
require('../models/category.model');
require('../models/review.model');
require('../models/user.model');

// Get collection name from command line argument
const collectionName = process.argv[2]?.toLowerCase() || 'products';

async function viewData() {
  try {
    // Connect to MongoDB
    console.log(`Connecting to MongoDB at ${process.env.MONGO_URI}...`);
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB successfully');

    // Get collection
    const validCollections = ['products', 'categories', 'reviews', 'users', 'orders'];
    
    if (!validCollections.includes(collectionName)) {
      console.log(`Invalid collection name. Please use one of: ${validCollections.join(', ')}`);
      process.exit(1);
    }

    // Get model based on collection name (singular, capitalized)
    const modelName = collectionName.charAt(0).toUpperCase() + 
                      collectionName.slice(1, -1); // Remove 's' at the end
    
    const Model = mongoose.model(modelName);
    
    // Find all documents in the collection
    const documents = await Model.find({}).limit(10);
    
    if (documents.length === 0) {
      console.log(`No documents found in ${collectionName} collection`);
    } else {
      console.log(`Found ${documents.length} documents in ${collectionName} collection:`);
      
      // Print the documents in a readable format
      documents.forEach((doc, index) => {
        console.log(`\n------- Document ${index + 1} -------`);
        
        // Format each document for better readability
        const formattedDoc = {
          _id: doc._id.toString(),
          ...doc.toObject()
        };
        
        // Remove _id from the nested object
        delete formattedDoc._doc;
        
        console.log(JSON.stringify(formattedDoc, null, 2));
      });
      
      // Show total count
      const count = await Model.countDocuments({});
      console.log(`\nTotal documents in ${collectionName} collection: ${count}`);
    }
  } catch (error) {
    console.error('Error viewing data:', error);
  } finally {
    // Close connection
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

viewData();
