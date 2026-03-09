import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  TrendingUp,
  Sparkles,
  Eye,
  ShoppingBag,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Flame,
  Globe,
  Zap,
  BarChart3,
  Activity,
  ChevronRight,
  ArrowRight,
  Package
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import CurrencyPrice from '../components/CurrencyPrice';
import { getProductImageUrl } from '../utils/imageUtils';

// Animated counter hook
const useCounter = (target, duration = 1500, inView = true) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, inView]);
  return count;
};

// Stat card with animated counter
const StatCard = ({ label, value, icon: Icon, color = 'text-slate-900', suffix = '', prefix = '' }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const count = useCounter(value, 1200, inView);
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="p-6 rounded-3xl bg-white border border-slate-100 shadow-premium space-y-3"
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</span>
        <div className="p-2 bg-slate-50 rounded-xl">
          <Icon className="w-4 h-4 text-primary-500" />
        </div>
      </div>
      <div className={`text-3xl font-black font-outfit tracking-tight ${color}`}>
        {prefix}{count.toLocaleString()}{suffix}
      </div>
    </motion.div>
  );
};

// Rank badge
const RankBadge = ({ rank }) => {
  const colors = {
    1: 'bg-amber-400 text-amber-950',
    2: 'bg-slate-300 text-slate-800',
    3: 'bg-amber-700/80 text-amber-100',
  };
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-[11px] shadow-lg ${colors[rank] || 'bg-slate-900 text-white'}`}>
      {rank}
    </div>
  );
};

const TrendingProducts = () => {
  const navigate = useNavigate();
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('trending');
  const [timeFilter, setTimeFilter] = useState('week');
  const [totalViews, setTotalViews] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);

  useEffect(() => {
    fetchProducts();
  }, [timeFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

      // Fetch real trending data (sorted by order count + rating from backend)
      const [trendingRes, newArrivalsRes] = await Promise.all([
        axios.get(`${apiUrl}/api/products/trending?limit=24`),
        axios.get(`${apiUrl}/api/products/new-arrivals?limit=16`)
      ]);

      const trendingData = trendingRes.data.products || [];
      const newArrivalsData = newArrivalsRes.data.products || [];

      // Enrich trending products with derived display fields
      const enrichedTrending = trendingData.map((p, idx) => ({
        ...p,
        // Trend direction: products with discounts or high ratings trend up
        trend: (p.comparePrice && p.comparePrice > p.price) || (p.rating?.average >= 4) ? 'up' : 'down',
        // Trend percentage: based on discount or rating
        trendPercentage: p.comparePrice && p.comparePrice > p.price
          ? Math.round(((p.comparePrice - p.price) / p.comparePrice) * 100)
          : Math.round((p.rating?.average || 0) * 10),
        // Category display
        categoryDisplay: Array.isArray(p.categoryName) ? p.categoryName[0] : (p.categoryName || 'General'),
      }));

      const enrichedNewArrivals = newArrivalsData.map(p => ({
        ...p,
        categoryDisplay: Array.isArray(p.categoryName) ? p.categoryName[0] : (p.categoryName || 'General'),
      }));

      setTrendingProducts(enrichedTrending);
      setNewArrivals(enrichedNewArrivals);

      // Real stats from API
      setTotalViews(trendingRes.data.total || trendingData.length);
      setTotalOrders(trendingRes.data.totalOrders || 0);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner text="Analyzing Global Trends..." />;

  const topProduct = trendingProducts[0];
  const leaderboard = trendingProducts.slice(0, 5);
  const mainGrid = trendingProducts.slice(0, 12);

  // Real aggregate stats
  const totalRatingCount = trendingProducts.reduce((sum, p) => sum + (p.rating?.count || 0), 0);
  const avgRating = trendingProducts.length > 0
    ? (trendingProducts.reduce((sum, p) => sum + (p.rating?.average || 0), 0) / trendingProducts.length)
    : 0;

  return (
    <div className="min-h-screen bg-white">

      {/* ── HERO HEADER ── */}
      <section className="relative pt-32 pb-0 overflow-hidden">
        {/* Subtle grid bg */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:60px_60px] -z-10" />

        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 pb-16 border-b border-slate-100">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-6 max-w-2xl"
            >
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary-600 border border-primary-100/50">
                  <Globe className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Global Intelligence</span>
                </div>
                {/* Live pulse */}
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Live</span>
                </div>
              </div>
              <div className="space-y-3">
                <h1 className="text-6xl md:text-7xl font-black text-slate-900 font-outfit tracking-tighter leading-none">
                  Trending<br />
                  <span className="text-primary-600">&amp; New</span>
                </h1>
                <p className="text-slate-500 text-lg font-medium leading-relaxed max-w-lg">
                  Real-time market intelligence identifying the highest-demand assets shaping the current distribution network.
                </p>
              </div>
            </motion.div>

            {/* Tab Switcher */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col items-end gap-4"
            >
              <div className="bg-slate-50 p-1.5 rounded-2xl flex items-center border border-slate-100">
                {[
                  { id: 'trending', label: 'Trending', icon: Flame },
                  { id: 'new', label: 'New Arrivals', icon: Sparkles }
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`relative px-8 py-3 rounded-xl text-xs font-bold tracking-widest uppercase transition-all duration-300 ${activeTab === id ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    {activeTab === id && (
                      <motion.div layoutId="tab-indicator" className="absolute inset-0 bg-white shadow-premium rounded-xl -z-10" />
                    )}
                    <div className="flex items-center gap-2">
                      <Icon className={`w-3.5 h-3.5 ${activeTab === id ? 'text-primary-600' : ''}`} />
                      {label}
                    </div>
                  </button>
                ))}
              </div>
              {/* Time filter — only for trending */}
              <AnimatePresence>
                {activeTab === 'trending' && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="flex gap-1 p-1 bg-slate-50 rounded-xl border border-slate-100"
                  >
                    {['day', 'week', 'month'].map(f => (
                      <button
                        key={f}
                        onClick={() => setTimeFilter(f)}
                        className={`px-4 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all ${timeFilter === f ? 'bg-white text-slate-900 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        {f}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT ── */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        <AnimatePresence mode="wait">

          {/* ══ TRENDING TAB ══ */}
          {activeTab === 'trending' && (
            <motion.div
              key="trending"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="space-y-20"
            >
              {/* Stats Row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard label="Total Orders" value={totalOrders} icon={ShoppingBag} color="text-primary-600" />
                <StatCard label="Active Assets" value={trendingProducts.length} icon={Package} color="text-emerald-600" />
                <StatCard label="Total Reviews" value={totalRatingCount} icon={Star} color="text-amber-500" />
                <StatCard label="Avg. Rating" value={Math.round(avgRating * 10)} suffix="/50" icon={Eye} color="text-indigo-600" />
              </div>

              {/* Featured #1 + Leaderboard */}
              {topProduct && (
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

                  {/* #1 Hero Card */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.97 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="lg:col-span-3 relative overflow-hidden rounded-[3rem] bg-slate-950 text-white group cursor-pointer min-h-[480px] flex flex-col"
                    onClick={() => navigate(`/products/${topProduct._id}`)}
                  >
                    {/* Background image */}
                    <div className="absolute inset-0">
                      <img
                        src={getProductImageUrl(topProduct)}
                        alt={topProduct.title}
                        className="w-full h-full object-cover opacity-40 group-hover:opacity-50 group-hover:scale-105 transition-all duration-1000"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
                    </div>

                    {/* Content */}
                    <div className="relative z-10 flex flex-col h-full p-10 md:p-14">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center font-black text-amber-950 text-sm shadow-xl">
                            #1
                          </div>
                          <div className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">Top Trending</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-full border border-emerald-400/20">
                          <ArrowUpRight className="w-3.5 h-3.5" />
                          <span className="text-xs font-bold">{topProduct.trendPercentage}%</span>
                        </div>
                      </div>

                      <div className="mt-auto space-y-6">
                        <div className="space-y-2">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-primary-400">
                            {topProduct.categoryDisplay}
                          </span>
                          <h2 className="text-3xl md:text-4xl font-black font-outfit leading-tight">
                            {topProduct.title}
                          </h2>
                        </div>

                        <div className="flex items-end justify-between">
                          <div className="space-y-1">
                            <CurrencyPrice
                              price={topProduct.price}
                              variant="white"
                              size="2xl"
                              weight="bold"
                              showDecimals={false}
                            />
                            <div className="flex items-center gap-3 text-[10px] font-bold text-white/50 uppercase tracking-widest">
                              <span className="flex items-center gap-1"><ShoppingBag className="w-3 h-3" />{topProduct.orderCount || 0} orders</span>
                              <span className="flex items-center gap-1"><Star className="w-3 h-3" />{topProduct.rating?.average?.toFixed(1) || '—'} ({topProduct.rating?.count || 0} reviews)</span>
                            </div>
                          </div>
                          <button className="h-12 px-8 bg-white text-slate-950 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-primary-500 hover:text-white transition-all duration-300 flex items-center gap-2 group/btn">
                            View
                            <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Leaderboard Sidebar */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center gap-2 mb-6">
                      <BarChart3 className="w-4 h-4 text-primary-600" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Rank Board</span>
                    </div>
                    {leaderboard.map((product, idx) => (
                      <motion.div
                        key={product._id}
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.08 }}
                        onClick={() => navigate(`/products/${product._id}`)}
                        className="group flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 hover:border-primary-200 hover:shadow-premium transition-all duration-300 cursor-pointer"
                      >
                        <RankBadge rank={idx + 1} />
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-50 shrink-0">
                          <img
                            src={getProductImageUrl(product)}
                            alt={product.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                          <h4 className="text-sm font-bold text-slate-800 line-clamp-1 group-hover:text-primary-600 transition-colors">
                            {product.title}
                          </h4>
                          <CurrencyPrice price={product.price} variant="nexus" size="sm" weight="bold" showDecimals={false} />
                          {product.orderCount > 0 && (
                            <span className="text-[9px] font-bold text-slate-400">{product.orderCount} sold</span>
                          )}
                        </div>
                        <div className={`flex items-center gap-0.5 text-xs font-bold ${product.trend === 'up' ? 'text-emerald-500' : 'text-slate-400'}`}>
                          {product.trend === 'up' ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                          {product.trendPercentage}%
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Full Trending Grid */}
              <div className="space-y-10">
                <div className="flex items-end justify-between border-b border-slate-100 pb-8">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-primary-600">
                      <Activity className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Full Rankings</span>
                    </div>
                    <h2 className="text-3xl font-bold font-outfit text-slate-900">
                      All Trending Assets
                    </h2>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full border border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {trendingProducts.length} Active
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {mainGrid.map((product, idx) => (
                    <motion.div
                      key={product._id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.04 }}
                      onClick={() => navigate(`/products/${product._id}`)}
                      className="group relative bg-white rounded-[2rem] border border-slate-100 shadow-premium hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 overflow-hidden cursor-pointer flex flex-col"
                    >
                      {/* Image */}
                      <div className="relative aspect-[4/3] overflow-hidden bg-slate-50">
                        <img
                          src={getProductImageUrl(product)}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        {/* Rank overlay */}
                        <div className="absolute top-4 left-4 flex items-center gap-2">
                          <RankBadge rank={idx + 1} />
                          <div className={`flex items-center gap-0.5 px-2 py-1 rounded-full text-[9px] font-bold backdrop-blur-md ${product.trend === 'up' ? 'bg-emerald-500/90 text-white' : 'bg-white/80 text-slate-500'}`}>
                            {product.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            {product.trendPercentage}%
                          </div>
                        </div>
                        {/* Views badge */}
                        <div className="absolute bottom-4 right-4 flex items-center gap-1 px-2 py-1 bg-slate-900/80 backdrop-blur-md rounded-lg border border-white/10">
                          <Eye className="w-3 h-3 text-white/60" />
                          <span className="text-[9px] font-bold text-white/80">{(product.views / 1000).toFixed(1)}k</span>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-6 flex-1 flex flex-col space-y-4">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-primary-500 uppercase tracking-widest">
                            {product.categoryDisplay}
                          </span>
                          <h3 className="font-bold text-slate-800 text-sm leading-tight line-clamp-2 group-hover:text-primary-600 transition-colors">
                            {product.title}
                          </h3>
                        </div>

                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                          <div className="space-y-1">
                            <CurrencyPrice price={product.price} variant="nexus" size="lg" weight="bold" showDecimals={false} />
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                              <span className="text-[10px] font-bold text-slate-400">{product.rating?.average?.toFixed(1) || '—'}</span>
                              {product.orderCount > 0 && (
                                <span className="text-[9px] text-slate-300 font-bold ml-1">{product.orderCount} sold</span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); navigate(`/products/${product._id}`); }}
                            className="h-9 px-5 bg-slate-50 text-slate-900 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-950 hover:text-white transition-all duration-300"
                          >
                            View
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ══ NEW ARRIVALS TAB ══ */}
          {activeTab === 'new' && (
            <motion.div
              key="new"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
              className="space-y-16"
            >
              {/* Editorial Banner */}
              <div className="relative overflow-hidden rounded-[3rem] bg-slate-950 min-h-[400px] flex items-center">
                {/* BG collage */}
                <div className="absolute inset-0 grid grid-cols-4 gap-0 opacity-20">
                  {newArrivals.slice(0, 8).map((p, i) => (
                    <div key={i} className="overflow-hidden">
                      <img src={getProductImageUrl(p)} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/50" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600/20 blur-[120px] rounded-full" />

                <div className="relative z-10 p-12 md:p-20 max-w-2xl space-y-8">
                  <div className="flex items-center gap-3">
                    <div className="h-px w-8 bg-primary-500" />
                    <span className="text-xs font-bold uppercase tracking-widest text-primary-400">Fresh Drop</span>
                  </div>
                  <h2 className="text-5xl md:text-6xl font-black font-outfit tracking-tighter text-white leading-none">
                    Zero-Hour<br />
                    <span className="text-primary-400">Arrivals</span>
                  </h2>
                  <p className="text-slate-400 font-medium leading-relaxed max-w-sm">
                    Be the first to integrate the latest tiers of innovation. Fresh stock added directly to our global warehouses.
                  </p>
                  <div className="flex items-center gap-10">
                    <div className="space-y-1">
                      <div className="text-3xl font-black font-outfit text-white">{newArrivals.length}</div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">New Items</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-3xl font-black font-outfit text-white">24H</div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Processing</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-3xl font-black font-outfit text-emerald-400">Live</div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Inventory</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* New Arrivals Grid */}
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-primary-600">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Latest Additions</span>
                  </div>
                  <span className="text-sm font-bold text-slate-400">{newArrivals.length} items</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {newArrivals.map((product, idx) => (
                    <motion.div
                      key={product._id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── CTA SECTION ── */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-32"
        >
          <div className="relative overflow-hidden rounded-[3rem] bg-white border border-slate-100 p-16 text-center">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.04),transparent)]" />
            <div className="max-w-2xl mx-auto space-y-10 relative z-10">
              <div className="flex items-center justify-center gap-2 text-primary-600">
                <Globe className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Distribution Network</span>
              </div>
              <div className="space-y-4">
                <h3 className="text-4xl font-black font-outfit text-slate-900 tracking-tight">Stay Ahead of the Market.</h3>
                <p className="text-slate-500 font-medium leading-relaxed">
                  Join our elite distribution network for weekly analytical summaries and priority access to high-demand assets.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Professional email address"
                  className="flex-1 px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 outline-none focus:bg-white focus:border-primary-500 transition-all font-medium text-sm"
                />
                <button className="h-14 px-10 rounded-2xl bg-slate-950 text-white font-bold text-xs uppercase tracking-widest hover:bg-primary-600 transition-all shadow-xl flex items-center gap-2 justify-center">
                  Subscribe
                  <Zap className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default TrendingProducts;
