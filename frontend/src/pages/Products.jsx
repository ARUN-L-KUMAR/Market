import { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Filter,
  Grid,
  List,
  Search,
  Star,
  ShoppingBag,
  TrendingUp,
  Zap,
  Package,
  SlidersHorizontal,
  X,
  ChevronRight,
  ArrowRight,
  Archive,
  Layers,
  Sparkles,
  Command,
  Loader2
} from 'lucide-react';
import { fetchProducts, setFilters } from '../store/productSlice';
import ProductCard from '../components/ProductCard';
import FilterSidebar from '../components/FilterSidebar';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';

const Products = () => {
  const dispatch = useDispatch();
  const { products, loading, error, filters, totalProducts } = useSelector(state => state.products);
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category');
  const initialSearch = searchParams.get('search');
  const initialFilter = searchParams.get('filter');
  const initialBrand = searchParams.get('brand');
  const initialMinPrice = searchParams.get('minPrice');
  const initialMaxPrice = searchParams.get('maxPrice');
  const initialMinRating = searchParams.get('minRating');
  const initialInStock = searchParams.get('inStock');
  const initialDiscount = searchParams.get('discount');

  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState(initialSearch || '');
  const [isScrolled, setIsScrolled] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [isInitialMount, setIsInitialMount] = useState(true);
  const productsPerPage = 12;

  const quickFilters = [
    { label: 'Primary Archive', id: 'primary', params: { sortBy: 'createdAt', sortOrder: 'desc', onSale: '', minRating: '' }, icon: <Archive className="w-4 h-4" /> },
    { label: 'New Arrivals', id: 'new', params: { sortBy: 'createdAt', sortOrder: 'desc', onSale: '', minRating: '' }, icon: <TrendingUp className="w-4 h-4" /> },
    { label: 'Global Sales', id: 'sale', params: { onSale: 'true', minRating: '' }, icon: <Zap className="w-4 h-4" /> },
    { label: 'Verified Rating', id: 'rated', params: { minRating: 4, onSale: '' }, icon: <Star className="w-4 h-4" /> },
  ];

  // Resolve Category Name for Breadcrumbs
  useEffect(() => {
    const resolveCategoryName = async () => {
      if (initialCategory) {
        if (/^[0-9a-fA-F]{24}$/.test(initialCategory)) {
          try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/categories/${initialCategory}`);
            setCategoryName(response.data.name);
          } catch (err) {
            setCategoryName(initialCategory);
          }
        } else {
          setCategoryName(initialCategory);
        }
      } else {
        setCategoryName('');
      }
    };
    resolveCategoryName();
  }, [initialCategory]);

  // Sync URL params with filters on mount and when URL changes
  useEffect(() => {
    let appliedFilters = {
      ...quickFilters[0].params,
      quickFilter: 'primary',
      category: initialCategory || '',
      search: initialSearch || '',
      brand: initialBrand || '',
      minPrice: initialMinPrice || '',
      maxPrice: initialMaxPrice || '',
      minRating: initialMinRating || '',
      inStock: initialInStock || '',
      discount: initialDiscount || ''
    };

    if (initialFilter === 'new') {
      const f = quickFilters.find(q => q.id === 'new');
      appliedFilters = { ...appliedFilters, ...f.params, quickFilter: f.id };
    } else if (initialFilter === 'sale') {
      const f = quickFilters.find(q => q.id === 'sale');
      appliedFilters = { ...appliedFilters, ...f.params, quickFilter: f.id };
    }

    dispatch(setFilters(appliedFilters));
    setCurrentPage(1);
  }, [initialCategory, initialSearch, initialFilter, initialBrand, initialMinPrice, initialMaxPrice, initialMinRating, initialInStock, initialDiscount, dispatch]);

  const observer = useRef();
  const lastProductElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && products.length < totalProducts) {
        setCurrentPage(prevPage => prevPage + 1);
      }
    }, {
      rootMargin: '200px',
      threshold: 0.1
    });
    if (node) observer.current.observe(node);
  }, [loading, products.length, totalProducts]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 800);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const isLoadMore = currentPage > 1;
    dispatch(fetchProducts({ ...filters, page: currentPage, limit: productsPerPage, isLoadMore }));
  }, [dispatch, filters, currentPage]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFilterChange = (newFilters) => {
    const params = {};
    Object.keys(newFilters).forEach(key => {
      if (newFilters[key]) params[key] = newFilters[key];
    });

    // Convert to URLSearchParams manually because setFilters from useSearchParams is for setting ALL params
    const searchString = new URLSearchParams(params).toString();
    window.history.pushState({}, '', `${window.location.pathname}?${searchString}`);

    dispatch(setFilters(newFilters));
    setCurrentPage(1);
    window.scrollTo({ top: 700, behavior: 'smooth' });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    handleFilterChange({ ...filters, search: searchTerm });
  };

  const getActiveFilter = () => filters.quickFilter || 'primary';

  if (loading && !products.length) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-[#f8fafc] selection:bg-primary-100 selection:text-primary-900">
      {/* Dynamic Side-Hub (Scrolled State) - MOVED TO LEFT */}
      <AnimatePresence>
        {isScrolled && (
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="fixed left-8 bottom-12 z-50 flex flex-col items-center gap-4"
          >
            <div className="bg-white/95 backdrop-blur-3xl border border-slate-200/50 shadow-2xl p-2.5 rounded-[2.5rem] flex flex-col gap-2.5">
              {quickFilters.map((f, i) => (
                <button
                  key={i}
                  onClick={() => handleFilterChange({ ...filters, ...f.params, quickFilter: f.id })}
                  className={`p-4 rounded-[1.5rem] transition-all duration-500 group relative ${getActiveFilter() === f.id
                    ? 'bg-slate-950 text-white shadow-xl shadow-slate-950/20 scale-105'
                    : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                    }`}
                >
                  <span className={getActiveFilter() === f.id ? 'text-primary-400' : ''}>{f.icon}</span>
                  <span className="absolute left-full ml-5 top-1/2 -translate-y-1/2 px-4 py-2 bg-slate-950 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-500 whitespace-nowrap pointer-events-none border border-white/10 shadow-2xl">
                    {f.label}
                  </span>
                </button>
              ))}

              <div className="h-px w-8 bg-slate-100 mx-auto" />

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-4 rounded-[1.5rem] transition-all duration-500 relative group ${showFilters ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20 scale-105' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                  }`}
              >
                <SlidersHorizontal className="w-5 h-5" />
                <span className="absolute left-full ml-5 top-1/2 -translate-y-1/2 px-4 py-2 bg-slate-950 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-500 whitespace-nowrap pointer-events-none border border-white/10 shadow-2xl">
                  {showFilters ? 'Hide Protocols' : 'Filter Protocols'}
                </span>
              </button>
            </div>

            {/* Global Actions Hub */}
            <div className="bg-white/95 backdrop-blur-3xl border border-slate-200/50 shadow-2xl p-2 rounded-[1.75rem] flex flex-col gap-2">
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="p-3.5 rounded-2xl bg-slate-50 text-slate-400 hover:text-primary-600 hover:bg-white transition-all duration-300 relative group"
              >
                {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
                <span className="absolute left-full ml-5 top-1/2 -translate-y-1/2 px-4 py-2 bg-slate-950 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-500 whitespace-nowrap pointer-events-none border border-white/10 shadow-2xl">
                  Toggle View
                </span>
              </button>
              <button
                onClick={scrollToTop}
                className="p-3.5 rounded-2xl bg-primary-600 text-white shadow-lg shadow-primary-600/20 hover:scale-110 transition-all duration-300 relative group"
              >
                <ChevronRight className="w-5 h-5 -rotate-90" />
                <span className="absolute left-full ml-5 top-1/2 -translate-y-1/2 px-4 py-2 bg-slate-950 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-500 whitespace-nowrap pointer-events-none border border-white/10 shadow-2xl">
                  Archive Top
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isScrolled && showFilters && (
          <>
            {/* Drawer Backdrop - HIGH Z-INDEX */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilters(false)}
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[200]"
            />
            {/* Filter Drawer - MOVED TO LEFT, HIGH Z-INDEX */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-[210] overflow-y-auto px-8 py-12"
            >
              <div className="flex items-center justify-between mb-12">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.3em]">Advanced Protocols</span>
                  <h2 className="text-2xl font-black text-slate-950 font-outfit uppercase tracking-tighter">Strategic Archive Filters</h2>
                </div>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-3 rounded-full bg-slate-50 text-slate-400 hover:text-slate-950 hover:bg-slate-100 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-10">
                <FilterSidebar mode="vertical" filters={filters} onFilterChange={handleFilterChange} />
              </div>

              <div className="mt-16 pt-8 border-t border-slate-100 italic text-[11px] text-slate-400 font-medium leading-relaxed">
                Applied protocols will automatically update the master archive stream in real-time.
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Immersive Collection Hero */}
      <section className="relative pt-36 pb-24 overflow-hidden bg-slate-950">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary-600/20 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/10 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/4" />
        </div>

        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-16">
            <div className="space-y-8 max-w-3xl">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="flex items-center gap-4"
              >
                <div className="h-[2px] w-12 bg-primary-500" />
                <span className="text-[11px] font-black text-primary-500 uppercase tracking-[0.4em]">Nexus Intelligence Archive</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="text-6xl lg:text-8xl font-black text-white tracking-tighter leading-[0.85] font-outfit uppercase"
              >
                The Global <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-indigo-400 to-primary-400 bg-[length:200%_auto] animate-gradient-x">Master Archive.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-xl text-slate-400 font-medium leading-relaxed max-w-xl"
              >
                Encryption-verified access to Tier-1 infrastructure and premium consumer assets across the global node network.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-col items-end gap-10"
            >
              <div className="flex items-center gap-12 border-b border-white/5 pb-8 w-full justify-end">
                <div className="text-right">
                  <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Active Assets</span>
                  <span className="text-4xl font-black text-white font-outfit">{totalProducts || products.length}+</span>
                </div>
                <div className="text-right">
                  <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Global Nodes</span>
                  <span className="text-4xl font-black text-white font-outfit">124</span>
                </div>
              </div>

              {/* Search Interaction */}
              <div className="w-full lg:w-[450px] group/search relative">
                <form onSubmit={handleSearch} className="relative">
                  <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                    <Search className="w-5 h-5 text-slate-500 group-hover/search:text-primary-500 transition-colors duration-500" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search Global Database..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2rem] py-5 pl-16 pr-8 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all duration-500 font-bold"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <div className="bg-slate-800 p-2 rounded-xl text-[10px] font-black text-slate-400 font-mono tracking-tighter">CMD + K</div>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 max-w-7xl pt-16 pb-40">
        {/* Navigation Context / Breadcrumbs */}
        <div className="flex items-center gap-4 mb-16 px-4 text-[11px] font-black uppercase tracking-widest text-slate-400">
          <Link to="/" className="hover:text-primary-600 transition-colors flex items-center gap-2">
            <Command className="w-3.5 h-3.5" /> Nexus Home
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-300" />
          <span className="text-slate-950">Archive</span>
          {categoryName && (
            <>
              <ChevronRight className="w-3 h-3 text-slate-300" />
              <Badge variant="primary" className="bg-primary-50 text-primary-600 border-primary-100 font-black text-[10px] px-4 py-1.5 rounded-full">
                {categoryName}
              </Badge>
            </>
          )}
        </div>

        {/* Access Terminal Hub - Compact & Sleek */}
        <div className="relative z-40 mb-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 py-6 border-b border-slate-200/60">
            {/* Quick Access Stream */}
            <div className="flex flex-wrap items-center gap-2">
              {quickFilters.map((f, i) => (
                <button
                  key={i}
                  onClick={() => handleFilterChange({ ...filters, ...f.params, quickFilter: f.id })}
                  className={`flex items-center gap-2.5 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${getActiveFilter() === f.id
                    ? 'bg-slate-950 text-white shadow-lg shadow-slate-950/20'
                    : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'
                    }`}
                >
                  <span className={getActiveFilter() === f.id ? 'text-primary-400' : 'text-slate-400'}>{f.icon}</span>
                  {f.label}
                </button>
              ))}
            </div>

            {/* Terminal Controls */}
            <div className="flex items-center gap-4">
              <div className="h-8 w-px bg-slate-200 hidden md:block mx-2" />

              {/* View Mode Switcher */}
              <div className="flex items-center bg-slate-50 p-1 rounded-full border border-slate-100">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-full transition-all duration-300 ${viewMode === 'grid' ? 'bg-white shadow-sm text-primary-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-full transition-all duration-300 ${viewMode === 'list' ? 'bg-white shadow-sm text-primary-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 h-10 px-5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${showFilters
                  ? 'bg-primary-50 text-primary-600 border border-primary-200'
                  : 'bg-white text-slate-950 border border-slate-200 hover:bg-slate-50'}`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                {showFilters ? 'Protocols Active' : 'Filter Protocols'}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <div className="py-12 border-b border-slate-100">
                  <FilterSidebar filters={filters} onFilterChange={handleFilterChange} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Assets Feed Grid */}
        <div className="min-h-[600px] relative">
          <AnimatePresence mode="wait">
            {loading && !products.length ? (
              <motion.div
                key="loading"
                className={`grid gap-10 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}
              >
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="aspect-[3/4] rounded-[2.5rem] bg-slate-200 animate-pulse" />
                ))}
              </motion.div>
            ) : products.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center py-40 space-y-8 text-center"
              >
                <div className="group relative">
                  <div className="absolute -inset-4 bg-primary-100 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative w-32 h-32 bg-white border border-slate-100 rounded-[3rem] shadow-premium flex items-center justify-center">
                    <Package className="w-12 h-12 text-slate-200" />
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="text-3xl font-black text-slate-950 font-outfit uppercase tracking-tighter">No Assets Found</h3>
                  <p className="text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">
                    Local nodes could not locate the requested artifacts. Refine procurement filters.
                  </p>
                </div>
                <Button
                  className="h-14 px-8 rounded-2xl bg-slate-950 text-white font-black uppercase tracking-widest text-[10px]"
                  onClick={() => handleFilterChange({})}
                >
                  Reset All Protocols
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-12"
              >
                <div className={`grid gap-10 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
                  {products.map((p, i) => (
                    <ProductCard key={p._id} product={p} index={i} viewMode={viewMode} />
                  ))}
                </div>

                {/* Dedicated Observer Target */}
                <div
                  ref={lastProductElementRef}
                  className="h-20 w-full flex items-center justify-center"
                >
                  {loading && products.length > 0 && (
                    <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
                  )}
                  {!loading && products.length < totalProducts && products.length > 0 && (
                    <div className="h-1 w-1" /> // Invisible anchor
                  )}
                  {products.length >= totalProducts && totalProducts > 0 && (
                    <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
                      End of Stream
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
};

export default Products;
