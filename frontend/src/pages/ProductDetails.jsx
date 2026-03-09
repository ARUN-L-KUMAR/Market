import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Zap,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  Package,
  Command,
  ArrowRight,
  Loader2,
  Trash2,
  Plus,
  Minus,
  Heart,
  Share2,
  CheckCircle2,
  Info
} from 'lucide-react';
import socket from '../utils/socket';
import { addToCart } from '../store/cartSlice';
import { getProductImageUrl } from '../utils/imageUtils';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import CurrencyPrice from '../components/CurrencyPrice';
import Card from '../components/ui/Card';
import ProductCard from '../components/ProductCard';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentCurrency, supportedCurrencies } = useSelector(state => state.currency);
  const currencySymbol = supportedCurrencies[currentCurrency]?.symbol || '₹';

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('description');

  const scrollRef = useRef(null);

  // Fetch product data and related products
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

        // Fetch current product
        const response = await axios.get(`${apiUrl}/api/products/${id}`);
        const productData = response.data;
        setProduct(productData);

        // Set default selections if available
        if (productData.colors && productData.colors.length > 0) {
          setSelectedColor(productData.colors[0].name);
        }
        if (productData.sizes && productData.sizes.length > 0) {
          setSelectedSize(productData.sizes[0].name);
        }

        // Fetch related products (using trending for now, or by category if we had that endpoint)
        try {
          const relatedResponse = await axios.get(`${apiUrl}/api/products/trending?limit=5`);
          // Ensure we filter out current product and have valid images
          setRelatedProducts(relatedResponse.data.products.filter(p => p._id !== id).slice(0, 4));
        } catch (relErr) {
          console.error("Error fetching related products:", relErr);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Failed to locate artifact in global node network.");
        setLoading(false);
      }
    };

    fetchProductDetails();
    window.scrollTo(0, 0);

    // Listen for real-time product updates
    const handleProductUpdate = (data) => {
      if (data.product?._id === id) {
        setProduct(data.product);
      }
    };

    socket.on('productUpdated', handleProductUpdate);
    socket.on('stockUpdate', handleProductUpdate);

    return () => {
      socket.off('productUpdated', handleProductUpdate);
      socket.off('stockUpdate', handleProductUpdate);
    };
  }, [id]);

  // Handle quantity change
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= product.stock) {
      setQuantity(value);
    }
  };

  const incrementQuantity = () => {
    if (quantity < product.stock) setQuantity(prev => prev + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) setQuantity(prev => prev - 1);
  };

  // Add to cart
  const handleAddToCart = () => {
    dispatch(addToCart({
      product,
      quantity,
      color: selectedColor,
      size: selectedSize
    }));

    // Show toast notification
    const event = new CustomEvent('show-toast', {
      detail: {
        message: `Artifact synchronized: ${product.title} added to cache.`,
        type: 'success'
      }
    });
    window.dispatchEvent(event);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Decoding Artifact...</span>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#f8fafc] py-32">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <div className="bg-white border border-slate-200 p-12 rounded-[2.5rem] shadow-premium">
            <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <Package className="w-10 h-10 text-rose-500" />
            </div>
            <h2 className="text-3xl font-black text-slate-950 font-outfit uppercase tracking-tighter mb-4">Access Denied</h2>
            <p className="text-slate-500 font-medium mb-8 leading-relaxed max-w-md mx-auto">{error || "The requested artifact could not be located in the global network."}</p>
            <Button
              className="h-14 px-8 rounded-2xl bg-slate-950 text-white font-black uppercase tracking-widest text-[10px]"
              onClick={() => navigate('/products')}
            >
              Back to Archive
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const discountPercentage = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-[#f8fafc] selection:bg-primary-100 selection:text-primary-900 pb-32">
      {/* Immersive Header Context */}
      <section className="relative pt-32 pb-24 overflow-hidden bg-slate-950 px-4 md:px-0">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary-600/20 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/10 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/4" />
        </div>

        <div className="container mx-auto max-w-7xl relative z-10 pt-4">
          <div className="flex flex-col gap-6">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 ml-1">
              <Link to="/" className="hover:text-primary-400 transition-all">Nexus</Link>
              <ChevronRight className="w-3 h-3 text-slate-800" />
              <Link to="/products" className="hover:text-primary-400 transition-all">Archive</Link>
              <ChevronRight className="w-3 h-3 text-slate-800" />
              <span className="text-primary-500 truncate">{product.categoryName?.[0] || 'Artifact'}</span>
            </nav>

            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10 lg:gap-16">
              <div className="space-y-6 flex-1">
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3"
                >
                  <span className="bg-primary-600 px-3 py-1 rounded text-[9px] font-black text-white uppercase tracking-widest">
                    {product.brand || 'Nexus'}
                  </span>
                  <div className="h-px w-6 bg-white/20" />
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Protocol ID: {product._id?.slice(-8).toUpperCase()}</span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-3xl md:text-5xl font-black text-white tracking-tighter leading-[1.1] font-outfit uppercase max-w-4xl"
                >
                  {product.title}
                </motion.h1>
              </div>

              <div className="flex items-center gap-10 border-l border-white/5 pl-10 h-24 hidden md:flex">
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Asset Value</span>
                  <div className="flex items-center gap-4">
                    {product.comparePrice > product.price && (
                      <span className="text-lg text-slate-700 line-through font-medium">
                        {currencySymbol}{product.comparePrice.toLocaleString()}
                      </span>
                    )}
                    <span className="text-5xl font-black text-white font-outfit tabular-nums">
                      {currencySymbol}{product.price.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="container mx-auto max-w-7xl -mt-12 relative z-20 px-4 md:px-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

          {/* Left Column: Media & Info (8 Cols) */}
          <div className="lg:col-span-8 space-y-8 lg:space-y-12">

            {/* Gallery Section */}
            <div className="bg-white border border-slate-200/50 rounded-[2rem] shadow-premium p-6 md:p-10 flex flex-col md:flex-row gap-8 lg:gap-12">
              {/* Thumbnails */}
              <div className="flex md:flex-col gap-4 order-2 md:order-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
                {(product.images && product.images.length > 0 ? product.images : [{ url: `https://picsum.photos/seed/${product._id}/600/800` }]).map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-16 h-16 md:w-20 md:h-20 rounded-xl border-2 transition-all duration-300 overflow-hidden flex-shrink-0 relative ${selectedImageIndex === idx ? 'border-primary-600 ring-4 ring-primary-600/10' : 'border-slate-50 hover:border-slate-200'}`}
                  >
                    <img
                      src={getProductImageUrl(product, idx)}
                      alt={`View ${idx}`}
                      className={`w-full h-full object-cover ${selectedImageIndex !== idx ? 'opacity-60 grayscale hover:opacity-100 hover:grayscale-0' : ''}`}
                      onError={e => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400';
                      }}
                    />
                  </button>
                ))}
              </div>

              {/* Main Image View */}
              <div className="flex-1 aspect-square bg-slate-50/50 rounded-2xl overflow-hidden relative group order-1 md:order-2 border border-slate-100">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={selectedImageIndex}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                    transition={{ duration: 0.4 }}
                    src={getProductImageUrl(product, selectedImageIndex)}
                    className="w-full h-full object-contain p-8 md:p-12"
                    onError={e => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800';
                    }}
                  />
                </AnimatePresence>

                {discountPercentage > 0 && (
                  <div className="absolute top-6 left-6">
                    <div className="bg-rose-600 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded shadow-xl">
                      -{discountPercentage}% Protocol Offset
                    </div>
                  </div>
                )}

                <div className="absolute bottom-6 right-6 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button className="w-12 h-12 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-primary-600 transition-all shadow-xl hover:-translate-y-1 flex items-center justify-center">
                    <Share2 className="w-5 h-5" />
                  </button>
                  <button className="w-12 h-12 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-rose-500 transition-all shadow-xl hover:-translate-y-1 flex items-center justify-center">
                    <Heart className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Structured Information Tabs */}
            <div className="bg-white border border-slate-200/50 rounded-[2.5rem] shadow-premium overflow-hidden">
              <nav className="flex border-b border-slate-100 px-6 lg:px-10 overflow-x-auto no-scrollbar">
                {[
                  { id: 'description', label: 'Analysis' },
                  { id: 'specs', label: 'Technical' },
                  { id: 'reviews', label: 'Protocol Logs' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 lg:px-8 py-6 text-[10px] font-black uppercase tracking-[0.25em] relative transition-all whitespace-nowrap ${activeTab === tab.id ? 'text-primary-600' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    {tab.label}
                    {activeTab === tab.id && (
                      <motion.div layoutId="detail-tab-line" className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600" />
                    )}
                  </button>
                ))}
              </nav>

              <div className="p-8 lg:p-12">
                <AnimatePresence mode="wait">
                  {activeTab === 'description' && (
                    <motion.div
                      key="desc-tab"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="space-y-8"
                    >
                      <div className="space-y-4">
                        <h3 className="text-xl font-black text-slate-950 font-outfit uppercase tracking-tight">Executive Artifact Overview</h3>
                        <p className="text-slate-600 leading-[1.8] text-base md:text-lg font-medium">
                          {product.description}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-10 border-t border-slate-50">
                        <div className="space-y-2">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Verification Status</span>
                          <div className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${product.stock > 0 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500'}`} />
                            <span className="text-[11px] font-black text-slate-900 uppercase tracking-wider">{product.stock > 0 ? 'Synchronized' : 'Offline'}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Asset Class</span>
                          <span className="text-[11px] font-black text-slate-900 uppercase tracking-wider">{product.categoryName?.[0] || 'Standard'}</span>
                        </div>
                        <div className="space-y-2">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Security Tier</span>
                          <span className="text-[11px] font-black text-slate-900 uppercase tracking-wider">Level-1 Secure</span>
                        </div>
                        <div className="space-y-2">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Nexus Origin</span>
                          <span className="text-[11px] font-black text-slate-900 uppercase tracking-wider">{product.brand || 'Global'}</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'specs' && (
                    <motion.div
                      key="specs-tab"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="space-y-8"
                    >
                      <h3 className="text-xl font-black text-slate-950 font-outfit uppercase tracking-tight">Hard-Data Specifications</h3>
                      <div className="grid border border-slate-100 rounded-2xl overflow-hidden divide-y divide-slate-100">
                        {[
                          { label: 'Artifact SKU', value: product.sku || 'N/A' },
                          { label: 'System Domain', value: product.categoryName?.[0] || 'Unclassified' },
                          { label: 'Sub-Protocol', value: Array.isArray(product.subcategoryName) ? product.subcategoryName.join(', ') : product.subcategoryName || 'N/A' },
                          { label: 'Manufacturer Node', value: product.brand || 'Nexus Internal' },
                          { label: 'Physical Load', value: product.weight ? `${product.weight}g` : 'Standard' },
                          { label: 'Dimensions', value: product.dimensions ? `${product.dimensions.length}x${product.dimensions.width}x${product.dimensions.height} (mm)` : 'Variable' }
                        ].map((spec, i) => (
                          <div key={i} className="flex flex-col md:flex-row md:items-center p-6 bg-white hover:bg-slate-50/50 transition-colors">
                            <span className="w-full md:w-1/3 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 md:mb-0">{spec.label}</span>
                            <span className="flex-1 text-[13px] font-bold text-slate-900 uppercase tracking-wide">{spec.value}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'reviews' && (
                    <motion.div
                      key="reviews-tab"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="space-y-8"
                    >
                      <div className="flex items-center justify-between pb-6 border-b border-slate-50">
                        <h3 className="text-xl font-black text-slate-950 font-outfit uppercase tracking-tight">Global Feedback Stream</h3>
                        <div className="flex items-center gap-3 px-5 py-2.5 bg-slate-900 text-white rounded-2xl shadow-xl">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          <span className="text-[13px] font-black tabular-nums">{product.rating?.average?.toFixed(1) || '0.0'}</span>
                          <div className="h-3 w-px bg-white/20 mx-1" />
                          <span className="text-[10px] font-black opacity-60 uppercase tracking-widest">{product.rating?.count || 0} LOGS</span>
                        </div>
                      </div>

                      {product.reviews && product.reviews.length > 0 ? (
                        <div className="grid gap-6">
                          {product.reviews.map((review, i) => (
                            <div key={i} className="p-8 bg-slate-50/30 rounded-3xl border border-slate-100 flex flex-col md:flex-row gap-6">
                              <div className="flex-shrink-0 flex items-center md:items-start gap-4">
                                <div className="w-14 h-14 bg-white border border-slate-200 rounded-2xl flex items-center justify-center font-black text-primary-600 text-lg shadow-sm">
                                  {review.user?.name?.[0].toUpperCase() || 'U'}
                                </div>
                                <div className="md:hidden">
                                  <span className="block text-sm font-black text-slate-950 uppercase">{review.user?.name || 'Authorized User'}</span>
                                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{new Date(review.createdAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                              <div className="flex-1 space-y-3">
                                <div className="hidden md:flex items-center justify-between">
                                  <span className="text-sm font-black text-slate-950 uppercase tracking-tight">{review.user?.name || 'Authorized User'}</span>
                                  <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">{new Date(review.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex gap-0.5 mb-2">
                                  {[...Array(5)].map((_, idx) => (
                                    <Star key={idx} className={`w-3 h-3 ${idx < review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-100'}`} />
                                  ))}
                                </div>
                                <p className="text-slate-600 text-sm md:text-base leading-relaxed font-medium italic">"{review.comment}"</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-20 bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-slate-100">
                          <Info className="w-12 h-12 text-slate-200 mx-auto mb-6" />
                          <p className="text-slate-400 font-black uppercase text-[11px] tracking-[0.3em]">No incoming transmission data retrieved.</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Related Products: Synchronized Data Stream */}
            {relatedProducts.length > 0 && (
              <div className="space-y-10 pt-8">
                <div className="flex items-center gap-6">
                  <div className="h-0.5 flex-1 bg-slate-200/50" />
                  <h2 className="text-2xl font-black text-slate-950 font-outfit uppercase tracking-tighter">Synchronized Asset stream</h2>
                  <div className="h-0.5 flex-1 bg-slate-200/50" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {relatedProducts.map((p, i) => (
                    <ProductCard key={p._id} product={p} index={i} viewMode="grid" />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Control Terminal (4 Cols) */}
          <div className="lg:col-span-4 lg:sticky lg:top-36 h-fit space-y-8">
            <Card className="rounded-[2.5rem] border-slate-200/50 shadow-premium p-10 overflow-visible relative bg-white">
              <div className="absolute -top-5 -right-5">
                <div className="bg-slate-900 text-white p-5 rounded-[2rem] shadow-2xl rotate-12 border border-white/10 group hover:rotate-0 transition-transform duration-500">
                  <Package className="w-7 h-7" />
                </div>
              </div>

              <div className="space-y-10">
                <header className="space-y-2">
                  <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.4em] block">Status: Ready</span>
                  <h3 className="text-4xl font-black text-slate-950 font-outfit uppercase tracking-tighter leading-none">Access Control</h3>
                </header>

                {/* Sub-Configurations */}
                <div className="space-y-10 divide-y divide-slate-50 pt-2">

                  {/* Color Matrix */}
                  {product.colors && product.colors.length > 0 && (
                    <div className="space-y-5 pt-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Spectral Profile</span>
                        <span className="text-[10px] font-black text-slate-950 uppercase bg-slate-100 px-2 py-0.5 rounded">{selectedColor}</span>
                      </div>
                      <div className="flex flex-wrap gap-4">
                        {product.colors.map(color => (
                          <button
                            key={color.name}
                            onClick={() => setSelectedColor(color.name)}
                            className={`w-11 h-11 rounded-xl flex items-center justify-center border-2 transition-all group ${selectedColor === color.name ? 'border-primary-600 bg-primary-50 scale-110 shadow-lg shadow-primary-600/10' : 'border-slate-50 hover:border-slate-200'}`}
                          >
                            <div className="w-7 h-7 rounded-lg shadow-inner" style={{ backgroundColor: color.hexCode }} />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Size Protocol */}
                  {product.sizes && product.sizes.length > 0 && (
                    <div className="space-y-5 pt-8">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dimension ID</span>
                        <span className="text-[10px] font-black text-slate-950 uppercase bg-slate-100 px-2 py-0.5 rounded">{selectedSize}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {product.sizes.map(size => (
                          <button
                            key={size.name}
                            disabled={size.stock <= 0}
                            onClick={() => setSelectedSize(size.name)}
                            className={`py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${size.stock <= 0 ? 'opacity-20 cursor-not-allowed border-slate-50' : selectedSize === size.name ? 'border-primary-600 bg-slate-950 text-white shadow-xl' : 'border-slate-50 bg-white text-slate-600 hover:border-slate-200'}`}
                          >
                            {size.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quantity Matrix */}
                  <div className="space-y-5 pt-8">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Unit Frequency</span>
                    <div className="flex items-center bg-slate-50 p-2 rounded-2xl border border-slate-200/50">
                      <button onClick={decrementQuantity} className="w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:border-rose-100 transition-all shadow-sm active:scale-95">
                        <Minus className="w-4 h-4" />
                      </button>
                      <input type="number" readOnly value={quantity} className="flex-1 bg-transparent text-center font-black text-slate-950 text-lg tabular-nums" />
                      <button onClick={incrementQuantity} className="w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary-600 hover:border-primary-100 transition-all shadow-sm active:scale-95">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Logistics Info */}
                <div className="p-6 bg-slate-950 rounded-3xl border border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Inventory Status</span>
                    </div>
                    <span className={`text-[11px] font-black uppercase ${product.stock > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {product.stock > 0 ? `${product.stock} Units Sync'd` : 'Offline'}
                    </span>
                  </div>
                </div>

                {/* Final Execution Actions */}
                <div className="space-y-5 pt-4">
                  <Button
                    onClick={handleAddToCart}
                    disabled={product.stock <= 0}
                    className="h-20 rounded-[2rem] bg-primary-600 text-white text-[11px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-primary-600/30 group"
                  >
                    <ShoppingBag className="w-6 h-6 group-hover:animate-bounce" />
                    Add to Cart
                  </Button>
                  <button
                    onClick={() => navigate('/products')}
                    className="w-full py-4 flex items-center justify-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] hover:text-slate-950 transition-colors"
                  >
                    Close Protocol
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </Card>

            {/* Immersive Trust Banner */}
            <div className="bg-slate-50/50 rounded-[2.5rem] p-10 space-y-8 border border-slate-200/50">
              {[
                { icon: <ShieldCheck className="w-6 h-6 text-primary-600" />, title: 'Encryption Standard', desc: 'Financial data protected by Node-to-Node SSL.' },
                { icon: <Truck className="w-6 h-6 text-indigo-600" />, title: 'Expedited Logistics', desc: 'Priority deployment from Global Hub nodes.' },
                { icon: <RotateCcw className="w-6 h-6 text-rose-600" />, title: 'Protocol Correction', desc: 'Secure 30-day artifact return window.' }
              ].map((item, i) => (
                <div key={i} className="flex gap-6 group">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-premium border border-slate-100 group-hover:scale-110 transition-transform duration-300">
                    {item.icon}
                  </div>
                  <div className="space-y-1">
                    <span className="block text-[10px] font-black text-slate-950 uppercase tracking-widest">{item.title}</span>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProductDetails;