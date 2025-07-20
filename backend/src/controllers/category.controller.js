const Category = require('../models/category.model');
const { io } = require('../utils/socket');

// Get all categories
exports.getCategories = async (req, res, next) => {
  try {
    const { parent, includeInactive } = req.query;
    const filter = {};
    
    // Filter by parent category if specified
    if (parent === 'null') {
      filter.parentCategory = null;
    } else if (parent) {
      filter.parentCategory = parent;
    }
    
    // Only include active categories unless specified
    if (!includeInactive || includeInactive === 'false') {
      filter.isActive = true;
    }
    
    const categories = await Category.find(filter).sort({ sortOrder: 1 });
    res.json(categories);
  } catch (err) {
    next(err);
  }
};

// Get category by ID
exports.getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate({
        path: 'subcategories',
        match: { isActive: true },
        options: { sort: { sortOrder: 1 } }
      });
      
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json(category);
  } catch (err) {
    next(err);
  }
};

// Create category (admin only)
exports.createCategory = async (req, res, next) => {
  try {
    const category = new Category(req.body);
    await category.save();
    
    // Emit socket event for real-time updates
    io.emit('categoryCreated', { category });
    
    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
};

// Update category (admin only)
exports.updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndUpdate(id, req.body, { 
      new: true, 
      runValidators: true 
    });
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Emit socket event for real-time updates
    io.emit('categoryUpdated', { category });
    
    res.json(category);
  } catch (err) {
    next(err);
  }
};

// Delete category (admin only)
exports.deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndDelete(id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Check if category has subcategories
    const subcategories = await Category.find({ parentCategory: id });
    if (subcategories.length > 0) {
      // Option 1: Delete subcategories
      await Category.deleteMany({ parentCategory: id });
      
      // Option 2: Move subcategories to parent's parent (not implemented here)
      // Would require more complex logic
    }
    
    // Emit socket event for real-time updates
    io.emit('categoryDeleted', { categoryId: id });
    
    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// Initialize default categories (for development/testing)
exports.initializeCategories = async (req, res, next) => {
  try {
    const count = await Category.countDocuments();
    
    // Only initialize if no categories exist
    if (count === 0) {
      const defaultCategories = [
        { name: 'Electronics', slug: 'electronics', description: 'Electronic devices and gadgets' },
        { name: 'Clothing', slug: 'clothing', description: 'Apparel and fashion items' },
        { name: 'Home & Kitchen', slug: 'home-kitchen', description: 'Home decor and kitchen appliances' },
        { name: 'Books', slug: 'books', description: 'Books, eBooks, and publications' },
        { name: 'Sports & Outdoors', slug: 'sports-outdoors', description: 'Sporting goods and outdoor equipment' }
      ];
      
      const createdCategories = await Category.insertMany(defaultCategories);
        // Create some subcategories for Electronics
      const electronics = createdCategories.find(c => c.name === 'Electronics');
      if (electronics) {
        const electronicsSubcategories = [
          { name: 'Smartphones', slug: 'smartphones', description: 'Mobile phones and accessories', parentCategory: electronics._id },
          { name: 'Laptops', slug: 'laptops', description: 'Notebook computers and accessories', parentCategory: electronics._id },
          { name: 'Audio', slug: 'audio', description: 'Headphones, speakers, and audio equipment', parentCategory: electronics._id }
        ];
        
        await Category.insertMany(electronicsSubcategories);
      }
      
      res.status(201).json({ message: 'Default categories created successfully' });
    } else {
      res.json({ message: 'Categories already exist' });
    }
  } catch (err) {
    next(err);
  }
};
