import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import store from './store/store'
import './index.css'
import App from './App'
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetails from './pages/ProductDetails'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Profile from './pages/Profile'
import OrderConfirmation from './pages/OrderConfirmation'
import OrderHistory from './pages/OrderHistory'
import OrderDetails from './pages/OrderDetails'
import AddressManagement from './pages/AddressManagement'
import DealsOfTheDay from './pages/DealsOfTheDay'
import TrendingProducts from './pages/TrendingProducts'
import AboutUs from './pages/AboutUs'
import ContactUs from './pages/ContactUs'
import FAQ from './pages/FAQ'
import ProtectedRoute from './components/ProtectedRoute'
import ForgotPassword from './pages/ForgotPassword'
import Wishlist from './pages/Wishlist'
import ErrorBoundary from './components/ErrorBoundary'
import AdminRoutes from './routes/adminRoutes'
import PayUPayment from './pages/payu-payment';
import PaymentSuccess from './pages/payment-success';
import PaymentFailure from './pages/payment-failure';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <ErrorBoundary>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route path="/" element={<App />}>
              <Route index element={<Home />} />
              <Route path="products" element={<Products />} />
              <Route path="products/:id" element={<ProductDetails />} />
              <Route path="cart" element={<Cart />} />
              <Route path="checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
              <Route path="login" element={<Login />} />
              <Route path="signup" element={<Signup />} />
              <Route path="forgot-password" element={<ForgotPassword />} />
              <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
              <Route path="order-confirmation/:id" element={<ProtectedRoute><OrderConfirmation /></ProtectedRoute>} />
              <Route path="orders" element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
              <Route path="orders/:id" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />
              <Route path="addresses" element={<ProtectedRoute><AddressManagement /></ProtectedRoute>} />
              <Route path="deals" element={<DealsOfTheDay />} />
              <Route path="trending" element={<TrendingProducts />} />
              <Route path="about" element={<AboutUs />} />
              <Route path="contact" element={<ContactUs />} />
              <Route path="faq" element={<FAQ />} />
              <Route path="payu-payment" element={<ProtectedRoute><PayUPayment /></ProtectedRoute>} />
              <Route path="payment-success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
              <Route path="payment-failure" element={<ProtectedRoute><PaymentFailure /></ProtectedRoute>} />
              {AdminRoutes}
              <Route path="*" element={
                <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-6 text-center">
                  <div className="bg-white rounded-2xl shadow-card p-8 max-w-lg w-full">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Page Not Found</h2>
                    <p className="text-gray-600 mb-6">The page you are looking for doesn't exist or has been moved.</p>
                    <button 
                      onClick={() => window.location.href = '/'}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                    >
                      Go to Homepage
                    </button>
                  </div>
                </div>
              } />
            </Route>
          </Routes>
        </BrowserRouter>
      </ErrorBoundary>
    </Provider>
  </React.StrictMode>,
)
