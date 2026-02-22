const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const productRoutes = require('./routes/product.routes');
const authRoutes = require('./routes/auth.routes');
const orderRoutes = require('./routes/order.routes');
const userRoutes = require('./routes/user.routes');
const categoryRoutes = require('./routes/category.routes');
const reviewRoutes = require('./routes/review.routes');
const adminRoutes = require('./routes/admin.routes');
const wishlistRoutes = require('./routes/wishlist.routes');
const paymentRoutes = require('./routes/payment.routes');
const supportRoutes = require('./routes/support.routes');
const errorMiddleware = require('./middleware/error.middleware');
const { trackTraffic } = require('./middleware/traffic.middleware');

const app = express();

app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// Track real traffic
app.use(trackTraffic);

// Trust proxy — required for rate limiting and HTTPS behind Render/Vercel reverse proxy
app.set('trust proxy', 1);

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false // Disable CSP for API server
}));

// Enhanced CORS configuration for deployment
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'https://akmarket.vercel.app',
  'https://market-nz1afvikx-arun-kumars-projects-0de1d555.vercel.app',
  'https://market-git-master-arun-kumars-projects-0de1d555.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

// Add root route for testing
app.get('/', (req, res) => {
  res.json({
    message: 'MARKET API is running!',
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
app.use('/api/support', supportRoutes);

// Global error handler (must be after routes)
app.use(errorMiddleware);

module.exports = app;