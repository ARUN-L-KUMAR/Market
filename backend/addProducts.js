const mongoose = require('mongoose');
const Product = require('./src/models/product.model');
const Category = require('./src/models/category.model');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/market', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const sampleProducts = [
  {
    title: "iPhone 14 Pro",
    description: "Latest iPhone with A16 Bionic chip, 48MP Main camera, and Always-On display",
    shortDescription: "Latest iPhone with advanced features",
    price: 999,
    comparePrice: 1199,
    stock: 50,
    sku: "IPHONE-14-PRO-001",
    brand: "Apple",
    images: [
      {
        url: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500",
        alt: "iPhone 14 Pro",
        isPrimary: true
      }
    ],
    colors: [
      { name: "Deep Purple", hexCode: "#5A4B8C", stock: 20 },
      { name: "Gold", hexCode: "#FFD700", stock: 15 },
      { name: "Silver", hexCode: "#C0C0C0", stock: 15 }
    ],
    sizes: [
      { name: "128GB", stock: 20 },
      { name: "256GB", stock: 20 },
      { name: "512GB", stock: 10 }
    ],
    tags: ["smartphone", "apple", "iphone", "5g", "premium"],
    isFeatured: true,
    isActive: true
  },
  {
    title: "Samsung Galaxy S23 Ultra",
    description: "Ultimate Android flagship with S Pen, 200MP camera, and 5000mAh battery",
    shortDescription: "Premium Android flagship with S Pen",
    price: 1199,
    comparePrice: 1399,
    stock: 30,
    sku: "SAMSUNG-S23-ULTRA-001",
    brand: "Samsung",
    images: [
      {
        url: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500",
        alt: "Samsung Galaxy S23 Ultra",
        isPrimary: true
      }
    ],
    colors: [
      { name: "Phantom Black", hexCode: "#000000", stock: 10 },
      { name: "Cream", hexCode: "#F5F5DC", stock: 10 },
      { name: "Green", hexCode: "#228B22", stock: 10 }
    ],
    sizes: [
      { name: "256GB", stock: 15 },
      { name: "512GB", stock: 10 },
      { name: "1TB", stock: 5 }
    ],
    tags: ["smartphone", "samsung", "android", "s-pen", "premium"],
    isFeatured: true,
    isActive: true
  },
  {
    title: "MacBook Pro 14-inch",
    description: "Powerful laptop with M2 Pro chip, Liquid Retina XDR display, and all-day battery",
    shortDescription: "Professional laptop with M2 Pro chip",
    price: 1999,
    comparePrice: 2299,
    stock: 25,
    sku: "MACBOOK-PRO-14-001",
    brand: "Apple",
    images: [
      {
        url: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500",
        alt: "MacBook Pro 14-inch",
        isPrimary: true
      }
    ],
    colors: [
      { name: "Space Gray", hexCode: "#5D5D5D", stock: 15 },
      { name: "Silver", hexCode: "#C0C0C0", stock: 10 }
    ],
    sizes: [
      { name: "512GB SSD", stock: 15 },
      { name: "1TB SSD", stock: 10 }
    ],
    tags: ["laptop", "apple", "macbook", "professional", "m2"],
    isFeatured: true,
    isActive: true
  },
  {
    title: "Sony WH-1000XM4 Headphones",
    description: "Industry-leading noise canceling headphones with 30-hour battery life",
    shortDescription: "Premium noise-canceling headphones",
    price: 349,
    comparePrice: 399,
    stock: 40,
    sku: "SONY-WH1000XM4-001",
    brand: "Sony",
    images: [
      {
        url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
        alt: "Sony WH-1000XM4 Headphones",
        isPrimary: true
      }
    ],
    colors: [
      { name: "Black", hexCode: "#000000", stock: 20 },
      { name: "Silver", hexCode: "#C0C0C0", stock: 20 }
    ],
    tags: ["headphones", "sony", "noise-canceling", "wireless", "audio"],
    isFeatured: false,
    isActive: true
  },
  {
    title: "Nike Air Max 270",
    description: "Comfortable running shoes with Max Air unit and breathable mesh upper",
    shortDescription: "Comfortable running shoes with Max Air",
    price: 150,
    comparePrice: 180,
    stock: 60,
    sku: "NIKE-AIRMAX270-001",
    brand: "Nike",
    images: [
      {
        url: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500",
        alt: "Nike Air Max 270",
        isPrimary: true
      }
    ],
    colors: [
      { name: "Black/White", hexCode: "#000000", stock: 20 },
      { name: "Blue/White", hexCode: "#0066CC", stock: 20 },
      { name: "Red/White", hexCode: "#FF0000", stock: 20 }
    ],
    sizes: [
      { name: "US 7", stock: 10 },
      { name: "US 8", stock: 15 },
      { name: "US 9", stock: 15 },
      { name: "US 10", stock: 10 },
      { name: "US 11", stock: 10 }
    ],
    tags: ["shoes", "nike", "running", "sneakers", "sports"],
    isFeatured: false,
    isActive: true
  }
];

async function addProducts() {
  try {
    // First, let's make sure we have a default category
    let defaultCategory = await Category.findOne({ name: 'Electronics' });
    
    if (!defaultCategory) {
      defaultCategory = await Category.create({
        name: 'Electronics',
        slug: 'electronics',
        description: 'Electronic devices and gadgets',
        isActive: true
      });
      console.log('✅ Created default Electronics category');
    }

    // Add the category to all products
    const productsWithCategory = sampleProducts.map(product => ({
      ...product,
      category: defaultCategory._id
    }));

    // Clear existing products (optional - remove this line if you want to keep existing products)
    // await Product.deleteMany({});
    // console.log('🗑️ Cleared existing products');

    // Add new products
    const createdProducts = await Product.insertMany(productsWithCategory);
    
    console.log(`✅ Successfully added ${createdProducts.length} products:`);
    createdProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.title} - $${product.price}`);
    });

  } catch (error) {
    console.error('❌ Error adding products:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the script
addProducts();
