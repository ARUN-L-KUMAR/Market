const express = require('express');
const cors = require('cors');
const productRoutes = require('./routes/product.routes');
const authRoutes = require('./routes/auth.routes');
const orderRoutes = require('./routes/order.routes');
const userRoutes = require('./routes/user.routes');
const categoryRoutes = require('./routes/category.routes');
const reviewRoutes = require('./routes/review.routes');
const adminRoutes = require('./routes/admin.routes');
const wishlistRoutes = require('./routes/wishlist.routes');
const paymentRoutes = require('./routes/payment.routes');
// const errorMiddleware = require('./middleware/error.middleware');

const app = express();

// Enhanced CORS configuration for deployment
app.use(cors({
 // ...existing code...
origin: [
    'http://localhost:3000', 
    'http://127.0.0.1:3000',
    'http://localhost:5173', // Vite dev server
    'https://akmarket.vercel.app',
    'https://market-5tcb6b794-arun-kumars-projects-0de1d555.vercel.app', // Your actual Vercel URL
    process.env.FRONTEND_URL // Add this environment variable in Render
],
// ...existing code...
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

app.use(express.json());
app.use(express.static('public'));

// Add root route for testing
app.get('/', (req, res) => {
  res.json({ 
    message: 'Market Backend API is running!',
    status: 'success',
    endpoints: {
      products: '/api/products',
      auth: '/api/auth',
      orders: '/api/orders',
      users: '/api/users',
      categories: '/api/categories',
      reviews: '/api/reviews',
      admin: '/api/admin',
      wishlist: '/api/wishlist',
      payment: '/api/payment'
    }
  });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is healthy' });
});

app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/payment', paymentRoutes);

// app.use(errorMiddleware);

module.exports = app;