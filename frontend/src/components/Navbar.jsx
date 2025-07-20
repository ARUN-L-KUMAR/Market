import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, 
  Heart, 
  User, 
  Menu, 
  X, 
  Search,
  ShoppingCart,
  Settings,
  LogOut,
  Home,
  Package
} from 'lucide-react';
import StatusIndicator from './ui/StatusIndicator';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/store';
import { useNavigate, Link } from 'react-router-dom';
import CartIcon from './CartIcon';
import WishlistSidebar from './WishlistSidebar';
import Button from './ui/Button';
import Badge from './ui/Badge';
import CurrencySwitcher from './CurrencySwitcher';

const Navbar = ({ isConnected = true }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user } = useSelector(state => state.user);
  const { items: cartItems } = useSelector(state => state.cart);
  const { items: wishlistItems } = useSelector(state => state.wishlist);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    setIsUserMenuOpen(false);
  };

  const cartItemsCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const wishlistCount = wishlistItems.length;

  return (
    <>
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div 
              className="flex items-center"
              whileHover={{ scale: 1.05 }}
            >
              <Link to="/" className="flex items-center group">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl mr-3 group-hover:shadow-lg transition-shadow duration-200">
                  <ShoppingBag className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Market
                </span>
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-2">
              <Link to="/" className="flex items-center px-3 py-2 rounded-xl text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200">
                <Home className="w-4 h-4 mr-2" />
                Home
              </Link>
              <Link to="/products" className="flex items-center px-3 py-2 rounded-xl text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200">
                <Package className="w-4 h-4 mr-2" />
                Products
              </Link>
              <Link to="/deals" className="flex items-center px-3 py-2 rounded-xl text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200">
                <span className="w-4 h-4 mr-2">🔥</span>
                Deals
              </Link>
              <Link to="/trending" className="flex items-center px-3 py-2 rounded-xl text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200">
                <span className="w-4 h-4 mr-2">📈</span>
                Trending
              </Link>
              {/* <Link to="/about" className="flex items-center px-3 py-2 rounded-xl text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200">
                <span className="w-4 h-4 mr-2">ℹ️</span>
                About
              </Link>
              <Link to="/contact" className="flex items-center px-3 py-2 rounded-xl text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200">
                <span className="w-4 h-4 mr-2">📞</span>
                Contact
              </Link>
              <Link to="/faq" className="flex items-center px-3 py-2 rounded-xl text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200">
                <span className="w-4 h-4 mr-2">❓</span>
                FAQ
              </Link> */}
              {user?.isAdmin && (
                <Link to="/admin" className="flex items-center px-3 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 hover:from-indigo-100 hover:to-purple-100 border border-indigo-200 hover:border-indigo-300 transition-all duration-200 shadow-sm hover:shadow-md">
                  <Settings className="w-4 h-4 mr-2" />
                  Admin Panel
                </Link>
              )}
            </div>

            {/* Right Side Icons */}
            <div className="flex items-center space-x-3">
              {/* Currency Switcher */}
              <CurrencySwitcher />

              {/* Search Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
              >
                <Search className="w-5 h-5" />
              </motion.button>

              {/* Connection Status */}
              <StatusIndicator 
                status={isConnected ? 'online' : 'offline'} 
                label={isConnected ? 'Connected' : 'Disconnected'} 
                animated={!isConnected}
              />

              {/* Wishlist */}
              {user && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsWishlistOpen(true)}
                  className="relative p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
                >
                  <Heart className="w-5 h-5" />
                  {wishlistCount > 0 && (
                    <Badge 
                      variant="danger" 
                      size="xs" 
                      className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center"
                    >
                      {wishlistCount}
                    </Badge>
                  )}
                </motion.button>
              )}

              {/* Cart */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <CartIcon />
              </motion.div>

              {/* User Menu */}
              {user ? (
                <div className="relative">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center space-x-2 p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 cursor-pointer"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-md">
                      <span className="text-white text-sm font-semibold">
                        {user.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="hidden sm:flex flex-col">
                      <span className="font-medium text-sm leading-tight">{user.name}</span>
                      {user?.isAdmin && (
                        <span className="text-xs text-indigo-600 font-medium">Admin</span>
                      )}
                    </div>
                    <motion.div
                      animate={{ rotate: isUserMenuOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-gray-400"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </motion.div>
                  </motion.div>

                  {/* User Dropdown */}
                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-200 py-2 z-50"
                      >
                        <Link 
                          to="/profile" 
                          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200 group"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <User className="w-4 h-4 mr-3 group-hover:text-blue-600 transition-colors duration-200" />
                          Profile
                        </Link>
                        <Link 
                          to="/orders" 
                          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200 group"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Package className="w-4 h-4 mr-3 group-hover:text-blue-600 transition-colors duration-200" />
                          Orders
                        </Link>
                        <Link 
                          to="/addresses" 
                          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200 group"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Settings className="w-4 h-4 mr-3 group-hover:text-blue-600 transition-colors duration-200" />
                          Addresses
                        </Link>
                        {user?.isAdmin && (
                          <Link 
                            to="/admin" 
                            className="flex items-center px-4 py-3 text-sm text-indigo-700 bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 transition-colors duration-200 group border-t border-gray-200"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <Settings className="w-4 h-4 mr-3 group-hover:text-indigo-800 transition-colors duration-200" />
                            Admin Panel
                          </Link>
                        )}
                        <hr className="my-1 border-gray-200" />
                        <button 
                          onClick={handleLogout}
                          className="flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 w-full text-left group"
                        >
                          <LogOut className="w-4 h-4 mr-3 group-hover:text-red-700 transition-colors duration-200" />
                          Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => navigate('/login')}
                  >
                    Login
                  </Button>
                  <Button 
                    variant="primary" 
                    size="sm"
                    onClick={() => navigate('/signup')}
                  >
                    Sign Up
                  </Button>
                </div>
              )}

              {/* Mobile Menu Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </motion.button>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="lg:hidden border-t border-gray-200 py-4"
              >
                <div className="flex flex-col space-y-2">
                  <Link to="/" className="flex items-center px-4 py-3 text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200" onClick={() => setIsMenuOpen(false)}>
                    <Home className="w-4 h-4 mr-3" />
                    Home
                  </Link>
                  <Link to="/products" className="flex items-center px-4 py-3 text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200" onClick={() => setIsMenuOpen(false)}>
                    <Package className="w-4 h-4 mr-3" />
                    Products
                  </Link>
                  <Link to="/deals" className="flex items-center px-4 py-3 text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200" onClick={() => setIsMenuOpen(false)}>
                    <span className="w-4 h-4 mr-3">🔥</span>
                    Deals
                  </Link>
                  <Link to="/trending" className="flex items-center px-4 py-3 text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200" onClick={() => setIsMenuOpen(false)}>
                    <span className="w-4 h-4 mr-3">📈</span>
                    Trending
                  </Link>
                  <Link to="/about" className="flex items-center px-4 py-3 text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200" onClick={() => setIsMenuOpen(false)}>
                    <span className="w-4 h-4 mr-3">ℹ️</span>
                    About Us
                  </Link>
                  <Link to="/contact" className="flex items-center px-4 py-3 text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200" onClick={() => setIsMenuOpen(false)}>
                    <span className="w-4 h-4 mr-3">📞</span>
                    Contact Us
                  </Link>
                  <Link to="/faq" className="flex items-center px-4 py-3 text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200" onClick={() => setIsMenuOpen(false)}>
                    <span className="w-4 h-4 mr-3">❓</span>
                    FAQ
                  </Link>
                  
                  {/* Currency Switcher in Mobile Menu */}
                  <div className="px-4 py-3">
                    <CurrencySwitcher />
                  </div>
                  
                  {user?.isAdmin && (
                    <Link to="/admin" className="flex items-center px-4 py-3 text-base font-medium bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 hover:from-indigo-100 hover:to-purple-100 rounded-xl border border-indigo-200 hover:border-indigo-300 transition-all duration-200 shadow-sm" onClick={() => setIsMenuOpen(false)}>
                      <Settings className="w-4 h-4 mr-3" />
                      Admin Panel
                    </Link>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      {/* Wishlist Sidebar */}
      <WishlistSidebar 
        isOpen={isWishlistOpen} 
        onClose={() => setIsWishlistOpen(false)} 
      />

      {/* Click outside to close user menu */}
      {isUserMenuOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}

      {/* No custom styles needed - all classes are in Tailwind */}
    </>
  );
};

export default Navbar;
