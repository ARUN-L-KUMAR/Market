const Wishlist = require('../models/wishlist.model');
const Product = require('../models/product.model');
const { io } = require('../utils/socket');

// Utility function to emit wishlist updates
const emitWishlistUpdate = (userId, type, data = {}) => {
  if (io) {
    io.to(`user_${userId}`).emit('wishlistUpdate', {
      type,
      ...data,
      timestamp: new Date()
    });
    
    // Also notify admin dashboard
    io.to('adminRoom').emit('wishlistActivity', {
      type,
      userId,
      ...data,
      timestamp: new Date()
    });
  }
};

// Utility function to get wishlist with populated products
const getWishlistWithProducts = async (userId) => {
  return await Wishlist.findOne({ user: userId })
    .populate('products.product');
};

// Get user's wishlist
exports.getWishlist = async (req, res) => {
  try {
    const wishlist = await getWishlistWithProducts(req.user.id);
    
    if (!wishlist) {
      return res.status(200).json({ wishlist: [] });
    }
    
    // Filter out products that no longer exist (null after populate)
    const validProducts = wishlist.products.filter(item => item.product !== null);
    
    // If we found invalid products, update the wishlist to remove them
    if (validProducts.length !== wishlist.products.length) {
      wishlist.products = validProducts;
      await wishlist.save();
    }
    
    res.status(200).json({ wishlist: validProducts });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ message: 'Error fetching wishlist', error: error.message });
  }
};

// Add product to wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Find or create wishlist for user
    let wishlist = await Wishlist.findOne({ user: userId });
    
    if (!wishlist) {
      wishlist = new Wishlist({
        user: userId,
        products: [{ product: productId }]
      });
    } else {
      // Check if product is already in wishlist
      const existingProduct = wishlist.products.find(
        item => item.product && item.product.toString() === productId
      );
      
      if (existingProduct) {
        return res.status(400).json({ message: 'Product already in wishlist' });
      }
      
      wishlist.products.push({ product: productId });
    }

    await wishlist.save();
    await wishlist.populate('products.product');
    
    // Emit real-time update
    emitWishlistUpdate(userId, 'PRODUCT_ADDED', {
      product: product,
      totalItems: wishlist.products.length
    });
    
    res.status(201).json({ 
      message: 'Product added to wishlist', 
      wishlist: wishlist.products 
    });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({ message: 'Error adding to wishlist', error: error.message, stack: error.stack });
  }
};

// Remove product from wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    const wishlist = await Wishlist.findOne({ user: userId });
    
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    // Remove product from wishlist
    wishlist.products = wishlist.products.filter(
      item => item.product.toString() !== productId
    );

    await wishlist.save();
    await wishlist.populate('products.product');
    
    // Emit real-time update
    emitWishlistUpdate(userId, 'PRODUCT_REMOVED', {
      productId,
      totalItems: wishlist.products.length
    });
    
    res.status(200).json({ 
      message: 'Product removed from wishlist', 
      wishlist: wishlist.products 
    });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({ message: 'Error removing from wishlist', error: error.message });
  }
};

// Get wishlist analytics
exports.getWishlistAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const wishlist = await getWishlistWithProducts(userId);
    
    if (!wishlist) {
      return res.status(200).json({
        totalItems: 0,
        totalValue: 0,
        avgPrice: 0,
        inStockItems: 0,
        outOfStockItems: 0,
        categoryBreakdown: {},
        priceRanges: {
          under25: 0,
          '25to50': 0,
          '50to100': 0,
          over100: 0
        },
        addedThisWeek: 0,
        addedThisMonth: 0,
        recentlyAdded: []
      });
    }

    // Filter out null products first and ensure all have valid data
    const validItems = wishlist.products.filter(item => item.product !== null);
    const products = validItems.map(item => item.product).filter(p => p && p.price !== undefined);
    
    const totalValue = products.reduce((sum, product) => sum + (Number(product.price) || 0), 0);
    const avgPrice = products.length > 0 ? totalValue / products.length : 0;
    
    // Stock analysis - check both inStock property and stock number
    const inStockItems = products.filter(p => p && (p.inStock || (p.stock && p.stock > 0))).length;
    const outOfStockItems = products.filter(p => p && (!p.inStock && (!p.stock || p.stock === 0))).length;
    
    // Category breakdown
    const categoryBreakdown = {};
    products.forEach(product => {
      if (product && product.category) {
        const category = product.category || 'Uncategorized';
        categoryBreakdown[category] = (categoryBreakdown[category] || 0) + 1;
      }
    });
    
    // Price range analysis
    const priceRanges = { under25: 0, '25to50': 0, '50to100': 0, over100: 0 };
    products.forEach(product => {
      if (product && product.price !== undefined) {
        const price = Number(product.price) || 0;
        if (price < 25) priceRanges.under25++;
        else if (price < 50) priceRanges['25to50']++;
        else if (price < 100) priceRanges['50to100']++;
        else priceRanges.over100++;
      }
    });
    
    // Time-based analysis using addedAt from wishlist items
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const addedThisWeek = validItems.filter(item => 
      item.addedAt && new Date(item.addedAt) >= oneWeekAgo
    ).length;
    
    const addedThisMonth = validItems.filter(item => 
      item.addedAt && new Date(item.addedAt) >= oneMonthAgo
    ).length;

    const analytics = {
      totalItems: products.length,
      totalValue,
      avgPrice: Math.round(avgPrice * 100) / 100,
      inStockItems,
      outOfStockItems,
      categoryBreakdown,
      priceRanges,
      addedThisWeek,
      addedThisMonth,
      recentlyAdded: validItems.slice(-5)
    };

    res.status(200).json(analytics);
  } catch (error) {
    console.error('Error fetching wishlist analytics:', error);
    res.status(500).json({ message: 'Error fetching wishlist analytics', error: error.message });
  }
};

// Clear entire wishlist
exports.clearWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const wishlist = await Wishlist.findOne({ user: userId });
    
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    wishlist.products = [];
    await wishlist.save();
    
    // Emit real-time update
    emitWishlistUpdate(userId, 'WISHLIST_CLEARED', {
      totalItems: 0
    });
    
    res.status(200).json({ message: 'Wishlist cleared successfully' });
  } catch (error) {
    console.error('Error clearing wishlist:', error);
    res.status(500).json({ message: 'Error clearing wishlist', error: error.message });
  }
};

// Get wishlist recommendations
exports.getWishlistRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type = 'similar', limit = 10 } = req.query;
    
    const wishlist = await Wishlist.findOne({ user: userId })
      .populate('products.product');
    
    if (!wishlist || wishlist.products.length === 0) {
      return res.status(200).json({ recommendations: [] });
    }

    let recommendations = [];
    const products = wishlist.products.map(item => item.product);
    
    switch (type) {
      case 'similar':
        // Find products from same categories
        const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
        const wishlistProductIds = products.map(p => p._id.toString());
        
        recommendations = await Product.find({
          category: { $in: categories },
          _id: { $nin: wishlistProductIds },
          stock: { $gt: 0 }
        }).limit(parseInt(limit));
        break;
        
      case 'trending':
        // Find trending products (most recently added or high stock turnover)
        recommendations = await Product.find({
          stock: { $gt: 0 }
        }).sort({ createdAt: -1 }).limit(parseInt(limit));
        break;
        
      case 'price-drop':
        // Find products with potential price drops (you can implement price history later)
        recommendations = await Product.find({
          stock: { $gt: 0 },
          price: { $lt: 50 } // Example: products under $50
        }).limit(parseInt(limit));
        break;
        
      default:
        recommendations = await Product.find({
          stock: { $gt: 0 }
        }).limit(parseInt(limit));
    }
    
    res.status(200).json({ 
      type,
      recommendations,
      total: recommendations.length 
    });
  } catch (error) {
    console.error('Error fetching wishlist recommendations:', error);
    res.status(500).json({ message: 'Error fetching recommendations', error: error.message });
  }
};

// Compare wishlist products
exports.compareWishlistProducts = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productIds } = req.body;
    
    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ message: 'Product IDs are required for comparison' });
    }
    
    if (productIds.length > 3) {
      return res.status(400).json({ message: 'You can compare up to 3 products at once' });
    }
    
    // Verify user owns these products in wishlist
    const wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }
    
    const wishlistProductIds = wishlist.products.map(item => item.product.toString());
    const invalidIds = productIds.filter(id => !wishlistProductIds.includes(id));
    
    if (invalidIds.length > 0) {
      return res.status(400).json({ 
        message: 'Some products are not in your wishlist',
        invalidIds 
      });
    }
    
    // Get product details for comparison
    const products = await Product.find({ _id: { $in: productIds } });
    
    const comparison = {
      products,
      features: [
        { key: 'price', label: 'Price' },
        { key: 'stock', label: 'Availability' },
        { key: 'category', label: 'Category' },
        { key: 'brand', label: 'Brand' },
        { key: 'rating', label: 'Rating' }
      ],
      summary: {
        lowestPrice: Math.min(...products.map(p => p.price || 0)),
        highestPrice: Math.max(...products.map(p => p.price || 0)),
        avgPrice: products.reduce((sum, p) => sum + (p.price || 0), 0) / products.length,
        inStockCount: products.filter(p => p.stock > 0).length
      }
    };
    
    res.status(200).json(comparison);
  } catch (error) {
    console.error('Error comparing products:', error);
    res.status(500).json({ message: 'Error comparing products', error: error.message });
  }
};

// Share wishlist
exports.shareWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { shareType = 'link', email } = req.body;
    
    const wishlist = await Wishlist.findOne({ user: userId })
      .populate('products.product')
      .populate('user', 'name email');
    
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }
    
    // Generate a shareable link (you can implement JWT-based sharing)
    const shareToken = Buffer.from(`${userId}-${Date.now()}`).toString('base64');
    const shareUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/wishlist/shared/${shareToken}`;
    
    const shareData = {
      shareUrl,
      shareToken,
      wishlistSummary: {
        ownerName: wishlist.user.name,
        totalItems: wishlist.products.length,
        totalValue: wishlist.products.reduce((sum, item) => sum + (item.product.price || 0), 0),
        products: wishlist.products.slice(0, 5).map(item => item.product) // First 5 products for preview
      }
    };
    
    if (shareType === 'email' && email) {
      // Here you can implement email sharing functionality
      // For now, we'll just return the share data
      shareData.emailSent = false;
      shareData.message = 'Email sharing not implemented yet';
    }
    
    res.status(200).json(shareData);
  } catch (error) {
    console.error('Error sharing wishlist:', error);
    res.status(500).json({ message: 'Error sharing wishlist', error: error.message });
  }
};

// Move items from wishlist to cart
exports.moveToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productIds, removeFromWishlist = true } = req.body;
    
    if (!productIds || !Array.isArray(productIds)) {
      return res.status(400).json({ message: 'Product IDs are required' });
    }
    
    const wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }
    
    // Verify products are in wishlist
    const wishlistProductIds = wishlist.products.map(item => item.product.toString());
    const validIds = productIds.filter(id => wishlistProductIds.includes(id));
    
    if (validIds.length === 0) {
      return res.status(400).json({ message: 'No valid products found in wishlist' });
    }
    
    // Get product details to check stock
    const products = await Product.find({ _id: { $in: validIds } });
    const availableProducts = products.filter(p => p.stock > 0);
    const unavailableProducts = products.filter(p => p.stock === 0);
    
    // Here you would typically add to cart using your cart model/controller
    // For now, we'll simulate the response
    
    if (removeFromWishlist && availableProducts.length > 0) {
      // Remove successfully moved items from wishlist
      const movedProductIds = availableProducts.map(p => p._id.toString());
      wishlist.products = wishlist.products.filter(
        item => !movedProductIds.includes(item.product.toString())
      );
      await wishlist.save();
    }
    
    res.status(200).json({
      message: 'Items processed for cart',
      movedToCart: availableProducts.length,
      unavailable: unavailableProducts.length,
      availableProducts: availableProducts.map(p => ({
        _id: p._id,
        title: p.title,
        price: p.price
      })),
      unavailableProducts: unavailableProducts.map(p => ({
        _id: p._id,
        title: p.title,
        reason: 'Out of stock'
      }))
    });
  } catch (error) {
    console.error('Error moving to cart:', error);
    res.status(500).json({ message: 'Error moving items to cart', error: error.message });
  }
};

// Get shared wishlist (public access)
exports.getSharedWishlist = async (req, res) => {
  try {
    const { shareToken } = req.params;
    
    // Decode the share token (basic implementation)
    let userId;
    try {
      const decoded = Buffer.from(shareToken, 'base64').toString();
      const [id, timestamp] = decoded.split('-');
      userId = id;
      
      // Check if token is not too old (e.g., 30 days)
      const tokenAge = Date.now() - parseInt(timestamp);
      const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
      
      if (tokenAge > maxAge) {
        return res.status(400).json({ message: 'Share link has expired' });
      }
    } catch (error) {
      return res.status(400).json({ message: 'Invalid share token' });
    }
    
    const wishlist = await Wishlist.findOne({ user: userId })
      .populate('products.product')
      .populate('user', 'name');
    
    if (!wishlist) {
      return res.status(404).json({ message: 'Shared wishlist not found' });
    }
    
    // Return public view of wishlist (no sensitive user data)
    const publicWishlist = {
      ownerName: wishlist.user.name,
      totalItems: wishlist.products.length,
      totalValue: wishlist.products.reduce((sum, item) => sum + (item.product.price || 0), 0),
      products: wishlist.products.map(item => ({
        _id: item.product._id,
        title: item.product.title,
        price: item.product.price,
        image: item.product.image,
        category: item.product.category,
        stock: item.product.stock,
        addedAt: item.addedAt
      })),
      sharedAt: new Date()
    };
    
    res.status(200).json({ wishlist: publicWishlist });
  } catch (error) {
    console.error('Error fetching shared wishlist:', error);
    res.status(500).json({ message: 'Error fetching shared wishlist', error: error.message });
  }
};
