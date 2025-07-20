// Initialize sample products
const mongoose = require('mongoose');
const Product = require('../models/product.model');
const Category = require('../models/category.model');

exports.initializeProducts = async (req, res, next) => {
  try {
    const productCount = await Product.countDocuments();
    
    // Only initialize if no products exist
    if (productCount === 0) {
      // Get categories
      const categories = await Category.find();
      
      if (categories.length === 0) {
        return res.status(400).json({ 
          message: 'No categories found. Please initialize categories first.' 
        });
      }
      
      // Find specific categories we'll need
      const electronicsCategory = categories.find(c => c.name === 'Electronics');
      const clothingCategory = categories.find(c => c.name === 'Clothing');
      const homeCategory = categories.find(c => c.name === 'Home & Kitchen');
      const smartphonesCategory = categories.find(c => c.name === 'Smartphones');
      const laptopsCategory = categories.find(c => c.name === 'Laptops');
      
      // Sample products
      const sampleProducts = [
        // Electronics - Smartphones
        {
          title: 'Samsung Galaxy S22',
          slug: 'samsung-galaxy-s22',
          description: 'The latest flagship smartphone from Samsung with 5G capability and advanced camera features.',
          shortDescription: 'Latest Samsung flagship with 5G and advanced camera',
          images: [
            { 
              url: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?q=80&w=1000', 
              alt: 'Samsung Galaxy S22', 
              isPrimary: true 
            }
          ],
          category: electronicsCategory._id,
          subcategory: smartphonesCategory ? smartphonesCategory._id : null,
          brand: 'Samsung',
          sku: 'SAMS22-2025',
          sizes: [],
          colors: [
            { name: 'Phantom Black', hexCode: '#000000', stock: 25 },
            { name: 'Phantom White', hexCode: '#FFFFFF', stock: 15 },
            { name: 'Green', hexCode: '#1B5E20', stock: 20 }
          ],
          price: 72999, // INR
          comparePrice: 79999, // INR
          costPrice: 65000, // INR
          stock: 60,
          lowStockThreshold: 10,
          weight: 0.4,
          dimensions: {
            length: 15,
            width: 7.5,
            height: 0.8
          },
          tags: ['smartphone', 'android', 'samsung', '5g'],
          isActive: true,
          isFeatured: true,
          rating: {
            average: 4.5,
            count: 124
          },
          currency: 'INR'
        },
        
        // Electronics - Laptops
        {
          title: 'MacBook Pro M2',
          slug: 'macbook-pro-m2',
          description: 'Apple MacBook Pro with M2 chip, 16GB RAM, and 512GB SSD.',
          shortDescription: 'Apple laptop with M2 chip, 16GB RAM, 512GB SSD',
          images: [
            { 
              url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1000', 
              alt: 'MacBook Pro', 
              isPrimary: true 
            }
          ],
          category: electronicsCategory._id,
          subcategory: laptopsCategory ? laptopsCategory._id : null,
          brand: 'Apple',
          sku: 'APL-MBP-M2',
          sizes: [],
          colors: [
            { name: 'Space Gray', hexCode: '#666666', stock: 18 },
            { name: 'Silver', hexCode: '#CCCCCC', stock: 12 }
          ],
          price: 124499, // INR
          comparePrice: 132799, // INR
          costPrice: 110000, // INR
          stock: 30,
          lowStockThreshold: 5,
          weight: 1.6,
          dimensions: {
            length: 35,
            width: 25,
            height: 1.5
          },
          tags: ['laptop', 'apple', 'macbook', 'm2'],
          isActive: true,
          isFeatured: true,
          rating: {
            average: 4.8,
            count: 86
          },
          currency: 'INR'
        },
        
        // Clothing
        {
          title: 'Premium Cotton T-Shirt',
          slug: 'premium-cotton-tshirt',
          description: 'Soft and comfortable premium cotton t-shirt, perfect for everyday wear.',
          shortDescription: 'Soft premium cotton t-shirt for everyday wear',
          images: [
            { 
              url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1000', 
              alt: 'Cotton T-Shirt', 
              isPrimary: true 
            }
          ],
          category: clothingCategory._id,
          brand: 'Essentials',
          sku: 'CLO-TSHIRT-01',
          sizes: [
            { name: 'S', stock: 25 },
            { name: 'M', stock: 30 },
            { name: 'L', stock: 20 },
            { name: 'XL', stock: 15 }
          ],
          colors: [
            { name: 'Black', hexCode: '#000000', stock: 30 },
            { name: 'White', hexCode: '#FFFFFF', stock: 30 },
            { name: 'Navy Blue', hexCode: '#000080', stock: 30 }
          ],
          price: 1659, // INR
          comparePrice: 2074, // INR
          costPrice: 800, // INR
          stock: 90,
          lowStockThreshold: 15,
          weight: 0.2,
          tags: ['clothing', 't-shirt', 'cotton', 'essentials'],
          isActive: true,
          isFeatured: false,
          rating: {
            average: 4.3,
            count: 215
          },
          currency: 'INR'
        },
        
        // Home & Kitchen
        {
          title: 'Smart Coffee Maker',
          slug: 'smart-coffee-maker',
          description: 'Programmable coffee maker with smartphone connectivity and auto brew feature.',
          shortDescription: 'Smart coffee maker with mobile app control',
          images: [
            { 
              url: 'https://images.unsplash.com/photo-1572119865084-43c285814d63?q=80&w=1000', 
              alt: 'Smart Coffee Maker', 
              isPrimary: true 
            }
          ],
          category: homeCategory._id,
          brand: 'HomeBot',
          sku: 'HK-COFFEE-01',
          sizes: [],
          colors: [
            { name: 'Black', hexCode: '#000000', stock: 20 },
            { name: 'Silver', hexCode: '#C0C0C0', stock: 15 }
          ],
          price: 10789, // INR
          comparePrice: 12449, // INR
          costPrice: 9000, // INR
          stock: 35,
          lowStockThreshold: 8,
          weight: 3.5,
          dimensions: {
            length: 25,
            width: 20,
            height: 35
          },
          tags: ['home', 'kitchen', 'coffee', 'smart', 'appliance'],
          isActive: true,
          isFeatured: true,
          rating: {
            average: 4.2,
            count: 78
          },
          currency: 'INR'
        }
      ];
      
      // Create the products
      const createdProducts = await Product.create(sampleProducts);
      
      res.status(201).json({ 
        message: 'Sample products created successfully',
        count: createdProducts.length,
        products: createdProducts
      });
    } else {
      res.json({ 
        message: 'Products already exist in the database',
        count: productCount
      });
    }
  } catch (err) {
    console.error('Error initializing products:', err);
    next(err);
  }
};
