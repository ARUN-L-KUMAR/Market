import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Heart,
  User,
  Menu,
  X,
  Search,
  Settings,
  LogOut,
  Home,
  Package
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/store';
import { useNavigate, Link } from 'react-router-dom';
import CartIcon from './CartIcon';
import WishlistSidebar from './WishlistSidebar';
import Button from './ui/Button';
import Badge from './ui/Badge';
import CurrencySwitcher from './CurrencySwitcher';
import StatusIndicator from './ui/StatusIndicator';

const Navbar = ({ isConnected = true }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, token } = useSelector(state => state.user);
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
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center group">
                <div className="bg-indigo-600 p-2 rounded-lg mr-3">
                  <ShoppingBag className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-semibold text-slate-900">
                  Market
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              <Link to="/" className="nav-link">
                <Home className="w-4 h-4 mr-2" />
                Home
              </Link>
              <Link to="/products" className="nav-link">
                <Package className="w-4 h-4 mr-2" />
                Products
              </Link>
              <Link to="/deals" className="nav-link">
                <span className="w-4 h-4 mr-2">🔥</span>
                Deals
              </Link>
              <Link to="/trending" className="nav-link">
                <span className="w-4 h-4 mr-2">📈</span>
                Trending
              </Link>
              {(user?.isAdmin || user?.role === 'admin') && (
                <Link to="/admin" className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors">
                  <Settings className="w-4 h-4 mr-2" />
                  Admin
                </Link>
              )}
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-2">
              <CurrencySwitcher />

              {/* Search */}
              <button className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors">
                <Search className="w-5 h-5" />
              </button>

              <StatusIndicator
                status={isConnected ? 'online' : 'offline'}
                label={isConnected ? 'Connected' : 'Disconnected'}
                animated={!isConnected}
              />

              {/* Wishlist */}
              {user && (
                <button
                  onClick={() => setIsWishlistOpen(true)}
                  className="relative p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                >
                  <Heart className="w-5 h-5" />
                  {wishlistCount > 0 && (
                    <Badge variant="danger" size="xs" className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center">
                      {wishlistCount}
                    </Badge>
                  )}
                </button>
              )}

              {/* Cart */}
              <CartIcon />

              {/* User Menu */}
              {user ? (
                <div className="relative">
                  <button
                    className="flex items-center space-x-2 p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors cursor-pointer border border-transparent hover:border-slate-200"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  >
                    <div className="w-8 h-8 bg-indigo-600 rounded-md flex items-center justify-center">
                      <span className="text-white text-xs font-semibold">
                        {user.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="hidden sm:flex flex-col items-start">
                      <span className="font-semibold text-xs text-slate-900 leading-tight">{user.name}</span>
                      <span className="text-[10px] text-slate-500 font-medium">Account</span>
                    </div>
                    <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown */}
                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-sm border border-slate-200 py-1 z-50"
                      >
                        <Link to="/profile" className="flex items-center px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors" onClick={() => setIsUserMenuOpen(false)}>
                          <User className="w-4 h-4 mr-3 text-slate-400" />
                          Profile
                        </Link>
                        <Link to="/orders" className="flex items-center px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors" onClick={() => setIsUserMenuOpen(false)}>
                          <Package className="w-4 h-4 mr-3 text-slate-400" />
                          Orders
                        </Link>
                        <Link to="/addresses" className="flex items-center px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors" onClick={() => setIsUserMenuOpen(false)}>
                          <Settings className="w-4 h-4 mr-3 text-slate-400" />
                          Addresses
                        </Link>
                        {(user?.isAdmin || user?.role === 'admin') && (
                          <Link to="/admin" className="flex items-center px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors border-t border-slate-200" onClick={() => setIsUserMenuOpen(false)}>
                            <Settings className="w-4 h-4 mr-3 text-slate-400" />
                            Admin Panel
                          </Link>
                        )}
                        <div className="border-t border-slate-200 mt-1 pt-1">
                          <button onClick={handleLogout} className="flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left">
                            <LogOut className="w-4 h-4 mr-3" />
                            Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                    Login
                  </Button>
                  <Button variant="primary" size="sm" onClick={() => navigate('/signup')}>
                    Sign Up
                  </Button>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="lg:hidden border-t border-slate-200 py-3"
              >
                <div className="flex flex-col space-y-1">
                  <Link to="/" className="flex items-center px-3 py-2.5 text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" onClick={() => setIsMenuOpen(false)}>
                    <Home className="w-4 h-4 mr-3" />
                    Home
                  </Link>
                  <Link to="/products" className="flex items-center px-3 py-2.5 text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" onClick={() => setIsMenuOpen(false)}>
                    <Package className="w-4 h-4 mr-3" />
                    Products
                  </Link>
                  <Link to="/deals" className="flex items-center px-3 py-2.5 text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" onClick={() => setIsMenuOpen(false)}>
                    <span className="w-4 h-4 mr-3">🔥</span>
                    Deals
                  </Link>
                  <Link to="/trending" className="flex items-center px-3 py-2.5 text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" onClick={() => setIsMenuOpen(false)}>
                    <span className="w-4 h-4 mr-3">📈</span>
                    Trending
                  </Link>
                  <Link to="/about" className="flex items-center px-3 py-2.5 text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" onClick={() => setIsMenuOpen(false)}>
                    <span className="w-4 h-4 mr-3">ℹ️</span>
                    About Us
                  </Link>
                  <Link to="/contact" className="flex items-center px-3 py-2.5 text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" onClick={() => setIsMenuOpen(false)}>
                    <span className="w-4 h-4 mr-3">📞</span>
                    Contact Us
                  </Link>
                  <Link to="/faq" className="flex items-center px-3 py-2.5 text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" onClick={() => setIsMenuOpen(false)}>
                    <span className="w-4 h-4 mr-3">❓</span>
                    FAQ
                  </Link>

                  <div className="px-3 py-2">
                    <CurrencySwitcher />
                  </div>

                  {(user?.isAdmin || user?.role === 'admin') && (
                    <Link to="/admin" className="flex items-center px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md border border-slate-200 transition-colors" onClick={() => setIsMenuOpen(false)}>
                      <Settings className="w-4 h-4 mr-3" />
                      Admin Panel
                    </Link>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      <WishlistSidebar
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
      />

      {isUserMenuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} />
      )}
    </>
  );
};

export default Navbar;
