import React, { useState, useEffect, useRef } from 'react';
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
  Package,
  ChevronDown,
  Bell,
  Command
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/store';
import { useNavigate, Link, useLocation } from 'react-router-dom';
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
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);

  const { user, token } = useSelector(state => state.user);
  const { items: cartItems } = useSelector(state => state.cart);
  const { items: wishlistItems } = useSelector(state => state.wishlist);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Only Home and Products pages get the transparent dark-bg navbar
  const isDarkPage = location.pathname === '/' || location.pathname === '/products';
  // isTransparent = on a dark page AND not yet scrolled
  const isTransparent = isDarkPage && !scrolled;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    setIsUserMenuOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const cartItemsCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const wishlistCount = wishlistItems.length;

  const navLinks = [
    { name: 'Home', path: '/', icon: <Home className="w-4 h-4" /> },
    { name: 'Catalogue', path: '/products', icon: <Package className="w-4 h-4" /> },
    { name: 'Flash', path: '/deals', emoji: '🔥' },
    { name: 'Momentum', path: '/trending', emoji: '📈' },
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${!isTransparent
        ? 'py-4 px-6'
        : 'py-8 px-6'
        }`}>
        <div className={`relative max-w-7xl mx-auto transition-all duration-500 shadow-premium ${!isTransparent
          ? 'bg-white/80 backdrop-blur-xl border border-white/20 rounded-[2rem] px-6 h-16'
          : 'bg-transparent border border-transparent px-2 h-20'
          } flex items-center gap-4`}>

          {/* Logo + Nav — left */}
          <div className="flex items-center gap-6 shrink-0">
            <Link to="/" className="flex items-center group gap-3">
              <div className="relative">
                <div className={`p-2.5 rounded-2xl group-hover:rotate-[15deg] transition-all duration-500 shadow-xl overflow-hidden ${!isTransparent ? 'bg-slate-950' : 'bg-white/20 backdrop-blur-sm border border-white/20'}`}>
                  <ShoppingBag className="w-5 h-5 text-white relative z-10" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="absolute -inset-1 bg-primary-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="flex flex-col">
                <span className={`text-xl font-black tracking-tighter font-outfit leading-none transition-colors duration-500 ${!isTransparent ? 'text-slate-950' : 'text-white'}`}>
                  NEXUS
                </span>
                <span className={`text-[8px] font-black tracking-[0.3em] uppercase transition-colors duration-500 ${!isTransparent ? 'text-primary-600' : 'text-white/50'}`}>
                  Intelligence
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 group ${location.pathname === link.path
                    ? 'bg-white text-slate-950 shadow-lg'
                    : !isTransparent
                      ? 'text-slate-500 hover:text-slate-950 hover:bg-slate-50'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                >
                  <span className={`${location.pathname === link.path
                    ? 'text-slate-950'
                    : !isTransparent
                      ? 'text-slate-400 group-hover:text-primary-600'
                      : 'text-white/50 group-hover:text-white'
                    }`}>
                    {link.icon || link.emoji}
                  </span>
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Center Search Bar — always visible */}
          <form
            onSubmit={handleSearch}
            className={`hidden md:flex flex-1 items-center gap-2 mx-4 px-4 py-2 rounded-2xl border transition-all duration-300 ${!isTransparent
              ? 'bg-slate-100/80 border-slate-200 hover:border-slate-300 focus-within:border-primary-400 focus-within:bg-white focus-within:shadow-md'
              : 'bg-white/10 border-white/15 hover:border-white/30 focus-within:border-white/40 focus-within:bg-white/15 backdrop-blur-sm'
              }`}
          >
            <Search className={`w-4 h-4 shrink-0 transition-colors ${!isTransparent ? 'text-slate-400' : 'text-white/50'
              }`} />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Escape' && setSearchQuery('')}
              placeholder="Search products, brands..."
              className={`flex-1 bg-transparent border-none outline-none text-sm font-medium placeholder:font-normal min-w-0 ${!isTransparent
                ? 'text-slate-900 placeholder:text-slate-400'
                : 'text-white placeholder:text-white/40'
                }`}
            />
            <AnimatePresence>
              {searchQuery && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className={`p-0.5 rounded-lg transition-all ${!isTransparent
                    ? 'text-slate-400 hover:text-slate-700'
                    : 'text-white/40 hover:text-white'
                    }`}
                >
                  <X className="w-3.5 h-3.5" />
                </motion.button>
              )}
            </AnimatePresence>
          </form>

          {/* Right Icons */}
          <div className="flex items-center gap-2 shrink-0">

            {user && (
              <>
                <button
                  onClick={() => setIsWishlistOpen(true)}
                  className={`relative p-3 rounded-2xl transition-all group ${!isTransparent ? 'text-slate-400 hover:text-rose-500 hover:bg-rose-50' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
                >
                  <Heart className="w-5 h-5 group-hover:fill-rose-500 transition-all" />
                  {wishlistCount > 0 && (
                    <motion.div
                      layoutId="wishlist-badge"
                      className="absolute top-2 right-2 min-w-[18px] h-[18px] bg-slate-950 text-white text-[9px] font-black flex items-center justify-center rounded-full border-2 border-white"
                    >
                      {wishlistCount}
                    </motion.div>
                  )}
                </button>
                <div className="hidden sm:block">
                  <CartIcon />
                </div>
              </>
            )}

            {/* Profile / Login */}
            {user ? (
              <div className="relative ml-2">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className={`flex items-center gap-3 p-1.5 pl-3 rounded-2xl border transition-all group ${!isTransparent ? 'bg-slate-50 hover:bg-slate-100 border-slate-100' : 'bg-white/10 hover:bg-white/20 border-white/10 backdrop-blur-sm'}`}
                >
                  {/* DB status dot */}
                  <StatusIndicator
                    status={isConnected ? 'online' : 'offline'}
                    size="sm"
                  />
                  <div className="flex flex-col items-end">
                    <span className={`text-[10px] font-black leading-none transition-colors ${!isTransparent ? 'text-slate-950' : 'text-white'}`}>{user.name}</span>
                    <span className={`text-[8px] font-bold uppercase tracking-widest transition-colors ${!isTransparent ? 'text-slate-400' : 'text-white/50'}`}>{user.role || 'Member'}</span>
                  </div>
                  <div className="w-9 h-9 bg-slate-950 rounded-xl flex items-center justify-center text-white text-xs font-black shadow-lg group-hover:scale-105 transition-transform">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-300 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 top-full mt-4 w-60 bg-white/90 backdrop-blur-2xl rounded-[1.5rem] shadow-premium border border-white/20 p-2 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-slate-50 mb-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Account Hub</p>
                      </div>
                      {[
                        { label: 'Profile Intelligence', path: '/profile', icon: <User className="w-4 h-4" /> },
                        { label: 'Manifest History', path: '/orders', icon: <Package className="w-4 h-4" /> },
                      ].map((item, idx) => (
                        <Link
                          key={idx}
                          to={item.path}
                          className="flex items-center gap-3 px-4 py-3 text-xs font-bold text-slate-600 hover:text-slate-950 hover:bg-slate-50 rounded-xl transition-all"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <span className="text-slate-400">{item.icon}</span>
                          {item.label}
                        </Link>
                      ))}


                      {user.role === 'admin' && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-3 px-4 py-3 text-xs font-black text-primary-600 hover:bg-primary-50 rounded-xl transition-all mt-1 border-t border-slate-50"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Command className="w-4 h-4" />
                          Nexus Command Center
                        </Link>
                      )}

                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 text-xs font-black text-rose-600 hover:bg-rose-50 rounded-xl transition-all w-full text-left mt-1 border-t border-slate-50"
                      >
                        <LogOut className="w-4 h-4" />
                        Terminate Session
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={() => navigate('/login')}
                  className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${!isTransparent ? 'text-slate-600 hover:text-slate-950 hover:bg-slate-50' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className={`px-6 py-2 h-10 text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg transition-all ${!isTransparent ? 'bg-slate-950 text-white hover:bg-primary-600' : 'bg-white text-slate-950 hover:bg-primary-50'}`}
                >
                  Join Circle
                </button>
              </div>
            )}

            {/* Mobile Trigger */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`lg:hidden p-3 rounded-2xl transition-all ${!isTransparent ? 'text-slate-950 bg-slate-50' : 'text-white bg-white/10'}`}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="lg:hidden mt-4 bg-white rounded-[2rem] shadow-premium border border-slate-100 p-6 overflow-hidden"
            >
              <div className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="flex items-center justify-between px-5 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-600 hover:text-slate-950 hover:bg-slate-50 transition-all"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400">{link.icon || link.emoji}</span>
                      {link.name}
                    </div>
                    <ChevronDown className="-rotate-90 w-3 h-3 text-slate-300" />
                  </Link>
                ))}

                <div className="pt-4 mt-4 border-t border-slate-50 flex flex-col gap-4">
                  <Button onClick={() => navigate('/login')} className="w-full h-14 rounded-2xl bg-white border border-slate-200 text-slate-950 font-black uppercase tracking-widest text-[11px]">Login</Button>
                  <Button onClick={() => navigate('/signup')} className="w-full h-14 rounded-2xl bg-slate-950 text-white font-black uppercase tracking-widest text-[11px] shadow-lg">Join Circle</Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <WishlistSidebar
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
      />

      {isUserMenuOpen && (
        <div className="fixed inset-0 z-[90]" onClick={() => setIsUserMenuOpen(false)} />
      )}
    </>
  );
};

export default Navbar;
