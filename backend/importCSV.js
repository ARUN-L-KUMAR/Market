const csv = require('csv-parser');
const fs = require('fs');
const Product = require('./src/models/product.model');
const Category = require('./src/models/category.model');

async function importProductsFromCSV(filePath) {
  const products = [];
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        // Parse the CSV row into a product object
        const product = {
          title: row.title,
          description: row.description,
          shortDescription: row.shortDescription,
          price: parseFloat(row.price),
          comparePrice: row.comparePrice ? parseFloat(row.comparePrice) : null,
          stock: parseInt(row.stock),
          sku: row.sku,
          brand: row.brand,
          tags: row.tags ? row.tags.split(',').map(tag => tag.trim()) : [],
          isFeatured: row.isFeatured === 'true',
          isActive: row.isActive !== 'false',
          images: row.imageUrl ? [{ url: row.imageUrl, alt: row.title, isPrimary: true }] : [],
          colors: row.colors ? JSON.parse(row.colors) : [],
          sizes: row.sizes ? JSON.parse(row.sizes) : []
        };
        
        products.push(product);
      })
      .on('end', async () => {
        try {
          // Get default category
          let defaultCategory = await Category.findOne({ name: 'Electronics' });
          if (!defaultCategory) {
            defaultCategory = await Category.create({
              name: 'Electronics',
              slug: 'electronics',
              description: 'Electronic devices and gadgets',
              isActive: true
            });
          }

          // Add category to all products
          const productsWithCategory = products.map(product => ({
            ...product,
            category: defaultCategory._id
          }));

          // Insert products
          const result = await Product.insertMany(productsWithCategory);
          console.log(`✅ Successfully imported ${result.length} products`);
          resolve(result);
        } catch (error) {
          console.error('❌ Error importing products:', error);
          reject(error);
        }
      })
      .on('error', (error) => {
        console.error('❌ CSV parsing error:', error);
        reject(error);
      });
  });
}

// Usage
if (require.main === module) {
  const mongoose = require('mongoose');
  
  mongoose.connect('mongodb://localhost:27017/market', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const csvFile = process.argv[2] || './products.csv';
  
  importProductsFromCSV(csvFile)
    .then(() => {
      console.log('Import completed successfully');
      mongoose.connection.close();
    })
    .catch((error) => {
      console.error('Import failed:', error);
      mongoose.connection.close();
    });
}

module.exports = { importProductsFromCSV };
