import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Tag,
  Search,
  Eye,
  Plus,
  ArrowLeft
} from 'lucide-react';
import { addToCart } from '../store/cartSlice';
import { toast } from 'react-toastify';
import CurrencyPrice from './CurrencyPrice';
import Badge from './ui/Badge';
import { useNavigate } from 'react-router-dom';
import { getProductImageUrl } from '../utils/imageUtils';

const WishlistRecommendations = ({ wishlistItems = [] }) => {
  const { token, user } = useSelector(state => state.user);
  const isAuthenticated = user && token;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('similar');

  useEffect(() => {
    if (wishlistItems.length > 0 && isAuthenticated) {
      fetchRecommendations();
    }
  }, [wishlistItems, isAuthenticated, selectedCategory]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

      const productIds = wishlistItems
        .filter(item => item && item.product && item.product._id)
        .map(item => item.product._id);

      if (!productIds.length && selectedCategory !== 'trending' && selectedCategory !== 'price-drop') {
        setRecommendations([]);
        setLoading(false);
        return;
      }

      let endpoint = '';
      let params = {};

      switch (selectedCategory) {
        case 'similar':
          endpoint = '/api/products/recommendations/similar';
          params = { productIds: productIds.join(',') };
          break;
        case 'frequently-bought':
          endpoint = '/api/products/recommendations/frequently-bought-together';
          params = { productIds: productIds.join(',') };
          break;
        case 'trending':
          endpoint = '/api/products/recommendations/trending';
          break;
        case 'price-drop':
          endpoint = '/api/products/recommendations/price-drops';
          break;
        default:
          endpoint = '/api/products/recommendations/similar';
          params = { productIds: productIds.join(',') };
      }

      const response = await axios.get(`${apiUrl}${endpoint}`, {
        params,
        headers: { Authorization: `Bearer ${token}` }
      });

      setRecommendations(response.data.products || []);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const response = await axios.get(`${apiUrl}/api/products?limit=8&sortBy=rating&sortOrder=desc`);
        setRecommendations(response.data.products || []);
      } catch (fallbackError) {
        console.error('Error fetching fallback products:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    if (!product.inStock) {
      toast.error('Inventory depleted');
      return;
    }
    dispatch(addToCart({ product, quantity: 1 }));
    toast.success(`${product.title} archived to cart`);
  };

  if (!isAuthenticated || wishlistItems.length === 0) {
    return null;
  }

  const categories = [
    { id: 'similar', label: 'Similar Assets', icon: <Search className="w-3.5 h-3.5" /> },
    { id: 'frequently-bought', label: 'Bundled', icon: <ShoppingBag className="w-3.5 h-3.5" /> },
    { id: 'trending', label: 'Trending', icon: <TrendingUp className="w-3.5 h-3.5" /> },
    { id: 'price-drop', label: 'Valuation Drop', icon: <Tag className="w-3.5 h-3.5" /> }
  ];

  return (
    <div className="mt-24 space-y-12">
      <div className="flex flex-col items-center space-y-8">
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-primary-600 font-bold text-[10px] uppercase tracking-[0.2em]">
            <Sparkles className="w-4 h-4 fill-current" />
            Intelligence Protocol
          </div>
          <h3 className="text-3xl font-bold text-slate-900 font-outfit tracking-tight">Tailored Recommendations</h3>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${selectedCategory === category.id
                ? 'bg-white text-primary-600 shadow-premium border border-slate-100'
                : 'text-slate-400 hover:text-slate-600'
                }`}
            >
              {category.icon}
              {category.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="aspect-[4/5] bg-slate-50 rounded-[2.5rem] animate-pulse" />
          ))
        ) : recommendations.length === 0 ? (
          <div className="col-span-full py-20 text-center">
            <p className="text-slate-400 font-medium font-outfit">Recalibrating intelligence matrix...</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {recommendations.slice(0, 4).map((product, index) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden hover:shadow-premium-lg transition-all duration-500"
              >
                <div className="relative aspect-[4/5] bg-slate-50 overflow-hidden">
                  <img
                    src={getProductImageUrl(product)}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Action Overlays */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-500">
                    <button
                      onClick={() => navigate(`/products/${product._id}`)}
                      className="w-9 h-9 bg-white/90 backdrop-blur-md rounded-xl shadow-premium flex items-center justify-center text-slate-400 hover:text-primary-600 transition-all"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>

                  {product.discount > 0 && (
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-rose-500/90 backdrop-blur-md text-white border-none py-1 px-2.5 text-[8px] font-bold">-{product.discount}% VAL</Badge>
                    </div>
                  )}
                </div>

                <div className="p-6 space-y-4">
                  <div className="space-y-1.5">
                    <h4 className="text-base font-bold text-slate-800 font-outfit line-clamp-1 group-hover:text-primary-600 transition-colors">
                      {product.title}
                    </h4>
                    <CurrencyPrice
                      price={product.price}
                      variant="nexus"
                      weight="bold"
                      showDecimals={false}
                    />
                  </div>

                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={!product.inStock}
                    className="w-full h-10 bg-slate-950 text-white rounded-lg text-[9px] font-bold uppercase tracking-widest hover:bg-primary-600 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-3 h-3" />
                    Archive
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      <div className="pt-12 text-center">
        <button
          onClick={() => navigate('/products')}
          className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] hover:text-primary-600 transition-all flex items-center justify-center gap-3 mx-auto group"
        >
          Explore All Archives
          <ArrowLeft className="w-3.5 h-3.5 rotate-180 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default WishlistRecommendations;
