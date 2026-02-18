import React, { useEffect, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../store/productSlice';
import { addToCart } from '../store/cartSlice';
import socket from '../utils/socket';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Heart,
  Eye,
  Star,
  AlertCircle,
  Search,
  Zap,
  ZapOff,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import Card from './ui/Card';
import Button from './ui/Button';
import Badge from './ui/Badge';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import CurrencyPrice from './CurrencyPrice';

const ProductSkeleton = () => (
  <div className="space-y-6">
    <div className="aspect-[4/5] bg-slate-100 rounded-[2.5rem] animate-pulse" />
    <div className="space-y-3 px-4">
      <div className="h-4 bg-slate-100 rounded-full w-2/3 animate-pulse" />
      <div className="h-3 bg-slate-100 rounded-full w-1/3 animate-pulse" />
    </div>
  </div>
);

const ProductList = ({
  category = 'all',
  searchQuery = '',
  sortBy = 'newest',
  priceRange = { min: '', max: '' }
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { products, loading, error } = useSelector(state => state.products);
  const { user } = useSelector(state => state.user);

  const [addingId, setAddingId] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);

  const loadProducts = useCallback(async () => {
    try {
      const params = {
        category: category !== 'all' ? category : undefined,
        search: searchQuery || undefined,
        sortBy: sortBy === 'newest' ? 'createdAt' : sortBy,
        sortOrder: sortBy === 'newest' ? 'desc' : 'asc'
      };

      if (priceRange.min) params.minPrice = priceRange.min;
      if (priceRange.max) params.maxPrice = priceRange.max;

      Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

      dispatch(fetchProducts(params));
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  }, [category, searchQuery, priceRange.min, priceRange.max, sortBy, dispatch]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const [shouldRefresh, setShouldRefresh] = useState(false);

  useEffect(() => {
    const handleProductChange = () => setShouldRefresh(true);
    socket.on('productCreated', handleProductChange);
    socket.on('productUpdated', handleProductChange);
    socket.on('productDeleted', handleProductChange);

    return () => {
      socket.off('productCreated', handleProductChange);
      socket.off('productUpdated', handleProductChange);
      socket.off('productDeleted', handleProductChange);
    };
  }, []);

  useEffect(() => {
    if (shouldRefresh) {
      const timer = setTimeout(() => {
        loadProducts();
        setShouldRefresh(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [shouldRefresh, loadProducts]);

  useEffect(() => {
    if (!products?.length) {
      setFilteredProducts([]);
      return;
    }

    let sorted = [...products];
    switch (sortBy) {
      case 'newest':
        sorted = sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        sorted = sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'price_asc':
        sorted = sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        sorted = sorted.sort((a, b) => b.price - a.price);
        break;
      case 'name_asc':
        sorted = sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'name_desc':
        sorted = sorted.sort((a, b) => b.title.localeCompare(a.title));
        break;
      default:
        break;
    }
    setFilteredProducts(sorted);
  }, [products, sortBy]);

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    if (!product.inStock || product.stock <= 0) {
      toast.error('Asset currently unavailable in local nodes');
      return;
    }
    if (!user) {
      toast.warning('Authentication required for collection');
      navigate('/login');
      return;
    }

    setAddingId(product._id);
    dispatch(addToCart({ product, quantity: 1 }));

    setTimeout(() => {
      setAddingId(null);
      toast.success(`${product.title} archived in cart`, {
        icon: <ShoppingBag className="text-emerald-500 w-5 h-5" />
      });
    }, 600);
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
  };

  if (loading) return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {[...Array(8)].map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center space-y-6 bg-slate-50 rounded-[3rem] border border-slate-100 border-dashed">
      <div className="p-6 bg-rose-50 rounded-full">
        <AlertCircle className="w-12 h-12 text-rose-500" />
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-black text-slate-950 font-outfit uppercase tracking-tight">System Interruption</h3>
        <p className="text-sm font-medium text-slate-500 max-w-xs mx-auto uppercase tracking-widest leading-relaxed">
          Error code: {error}. The procurement node is currently unreachable.
        </p>
      </div>
      <Button onClick={() => loadProducts()} variant="primary" className="rounded-2xl px-8 bg-slate-950 font-black uppercase tracking-widest text-xs">
        Reset Connection
      </Button>
    </div>
  );

  if (filteredProducts.length === 0) return (
    <div className="flex flex-col items-center justify-center py-32 px-4 text-center space-y-8 bg-white rounded-[3rem] shadow-premium">
      <div className="relative">
        <div className="p-10 bg-slate-50 rounded-full">
          <Search className="w-16 h-16 text-slate-200" />
        </div>
        <div className="absolute -top-2 -right-2 p-3 bg-slate-950 rounded-2xl shadow-xl">
          <Zap className="w-5 h-5 text-primary-500" />
        </div>
      </div>
      <div className="space-y-3">
        <h3 className="text-2xl font-black text-slate-950 font-outfit uppercase tracking-tighter">Zero Match Found</h3>
        <p className="text-sm font-medium text-slate-500 max-w-sm mx-auto uppercase tracking-widest leading-relaxed">
          No assets matched your current search parameters. Broaden your search or check again later.
        </p>
      </div>
      <Button onClick={() => window.location.reload()} variant="outline" className="rounded-2xl border-slate-200 font-black uppercase tracking-widest text-xs px-10">
        Clear Parameters
      </Button>
    </div>
  );

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
    >
      {filteredProducts.map(product => (
        <motion.div
          key={product._id}
          variants={item}
          className="group relative cursor-pointer"
          onClick={() => navigate(`/products/${product._id}`)}
        >
          {/* Action Hub */}
          <div className="absolute top-6 right-6 z-20 flex flex-col gap-2 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300">
            <button className="p-3 bg-white/90 backdrop-blur-xl border border-white rounded-2xl shadow-xl text-slate-400 hover:text-rose-500 hover:scale-110 transition-all" onClick={(e) => e.stopPropagation()}>
              <Heart className="w-5 h-5" />
            </button>
            <button className="p-3 bg-white/90 backdrop-blur-xl border border-white rounded-2xl shadow-xl text-slate-400 hover:text-primary-600 hover:scale-110 transition-all" onClick={(e) => e.stopPropagation()}>
              <Eye className="w-5 h-5" />
            </button>
          </div>

          {/* Visual Container */}
          <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-slate-50 shadow-premium border border-slate-100 transition-all duration-500 group-hover:shadow-2xl group-hover:-translate-y-2">
            <img
              src={product.images && product.images[0] ? product.images[0].url : 'https://placehold.co/400x500?text=No+Image'}
              alt={product.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            {product.stock <= 5 && product.stock > 0 && (
              <div className="absolute bottom-6 left-6 right-6">
                <div className="px-4 py-2 bg-rose-500 text-white text-[9px] font-black uppercase tracking-widest rounded-xl shadow-lg flex items-center gap-2">
                  <ZapOff className="w-3 h-3" /> Critical Stock: {product.stock} Left
                </div>
              </div>
            )}
          </div>

          {/* Meta Data */}
          <div className="mt-8 px-2 space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest">{product.category && (typeof product.category === 'object' ? product.category.name : product.category)}</span>
                <h3 className="text-xl font-black text-slate-950 font-outfit uppercase tracking-tighter leading-none group-hover:text-primary-600 transition-colors line-clamp-1">{product.title}</h3>
              </div>
              <div className="flex flex-col items-end">
                <CurrencyPrice
                  price={product.price}
                  variant="nexus"
                  size="xl"
                  weight="extrabold"
                  showDecimals={false}
                  className="font-outfit tracking-tighter"
                />
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">4.8</span>
                </div>
              </div>
            </div>

            <Button
              onClick={(e) => handleAddToCart(e, product)}
              loading={addingId === product._id}
              className={`w-full h-14 rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] font-outfit transition-all duration-300 ${addingId === product._id
                ? 'bg-emerald-500 text-white'
                : 'bg-slate-950 text-white group-hover:bg-primary-600 group-hover:shadow-xl group-hover:shadow-primary-600/20'
                }`}
            >
              {addingId === product._id ? 'Archiving...' : 'Add to Collection'}
            </Button>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};


export default ProductList;