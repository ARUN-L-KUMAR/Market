# Market E-Commerce Application

A complete, real-time e-commerce web application built with React + Tailwind CSS (frontend) and Node.js/Express/MongoDB (backend).

## Features

- **Product Management**: Browse, search, filter, and view detailed product information
- **Shopping Cart**: Add products, update quantities, and remove items from cart
- **User Authentication**: Register, login, and password recovery
- **User Account**: View order history, manage account details, and saved addresses
- **Checkout Flow**: Seamless checkout process with address and payment options
- **Order Management**: Real-time order status updates
- **Wishlist**: Save products for later and sync across devices
- **Admin Dashboard**: Manage products, orders, and users
- **Real-Time Updates**: Live stock information, order status, and more using Socket.io
- **Responsive Design**: Works on mobile, tablet, and desktop devices

## Technology Stack

### Frontend
- React 18
- Redux for state management
- React Router for navigation
- Socket.io client for real-time features
- Tailwind CSS for styling
- Vite for build tooling

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT for authentication
- Socket.io for real-time communication

## Installation and Setup

### Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas)
- npm or yarn

### Environment Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/market.git
cd market
```

2. Backend Setup:
```bash
cd backend
npm install

# Create a .env file with the following variables:
# PORT=3000
# MONGODB_URI=mongodb://localhost:27017/market
# JWT_SECRET=your_jwt_secret
# CORS_ORIGIN=http://localhost:5173

# Start the backend server
npm run dev
```

3. Frontend Setup:
```bash
cd frontend
npm install

# Create a .env file with the following variables:
# VITE_API_URL=http://localhost:3000

# Start the development server
npm run dev
```

4. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000/api

## Project Structure

```
market/
├── backend/            # Node.js backend
│   ├── src/
│   │   ├── controllers/  # Route controllers
│   │   ├── middleware/   # Express middleware
│   │   ├── models/       # Mongoose models
│   │   ├── routes/       # API routes
│   │   ├── utils/        # Utility functions
│   │   ├── app.js        # Express app setup
│   │   └── server.js     # Server entry point
│   └── package.json
│
└── frontend/           # React frontend
    ├── public/         # Static assets
    ├── src/
    │   ├── assets/       # Images and other assets
    │   ├── components/   # Reusable components
    │   │   ├── ui/       # UI components (buttons, inputs, etc.)
    │   ├── pages/        # Page components
    │   ├── store/        # Redux store
    │   ├── utils/        # Utility functions
    │   ├── App.jsx       # Main App component
    │   └── main.jsx      # Entry point
    └── package.json
```

## API Endpoints

### Authentication
- POST `/api/auth/register` - User registration
- POST `/api/auth/login` - User login
- POST `/api/auth/forgot-password` - Request password reset code
- POST `/api/auth/verify-reset-code` - Verify reset code
- POST `/api/auth/reset-password` - Reset password with code

### Products
- GET `/api/products` - Get all products with optional filtering
- GET `/api/products/:id` - Get a single product
- POST `/api/products` - Create a new product (admin only)
- PUT `/api/products/:id` - Update a product (admin only)
- DELETE `/api/products/:id` - Delete a product (admin only)

### Categories
- GET `/api/categories` - Get all categories
- POST `/api/categories` - Create a category (admin only)

### Orders
- GET `/api/orders` - Get current user's orders
- GET `/api/orders/:id` - Get order details
- POST `/api/orders` - Create a new order
- PUT `/api/orders/:id/status` - Update order status (admin only)
- GET `/api/orders/admin/all` - Get all orders (admin only)

### Wishlist
- GET `/api/wishlist` - Get current user's wishlist
- POST `/api/wishlist/:productId` - Add product to wishlist
- DELETE `/api/wishlist/:productId` - Remove product from wishlist

### User
- GET `/api/users/profile` - Get current user's profile
- PUT `/api/users/profile` - Update user profile
- GET `/api/users/admin/all` - Get all users (admin only)

## Socket.IO Events

### Server Emits
- `productUpdated` - When a product is updated (stock, price, etc.)
- `productCreated` - When a new product is added
- `productDeleted` - When a product is deleted
- `orderStatusChanged` - When an order's status changes
- `wishlistUpdated` - When a user's wishlist is updated

### Client Emits
- `joinRoom` - Join a specific product or order room for updates
- `leaveRoom` - Leave a specific room

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
