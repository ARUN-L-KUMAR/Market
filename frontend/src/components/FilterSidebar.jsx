import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Filter,
  Tag,
  DollarSign,
  Palette,
  Ruler,
  RotateCcw,
  TrendingUp,
  Star,
  ChevronDown,
  X,
  Target,
  ShieldCheck,
  Zap,
  Layers
} from 'lucide-react';
import Badge from './ui/Badge';
import Button from './ui/Button';

const FilterSidebar = ({ filters, onFilterChange, mode = 'horizontal' }) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const [priceRange, setPriceRange] = useState({
    min: filters.minPrice || '',
    max: filters.maxPrice || ''
  });

  const { items: allProducts } = useSelector(state => state.products);
  const { currentCurrency, supportedCurrencies } = useSelector(state => state.currency);
  const currencySymbol = supportedCurrencies[currentCurrency]?.symbol || '₹';

  const isVertical = mode === 'vertical';

  // Extract unique categories
  const categories = [...new Set((allProducts || []).flatMap(product => {
    if (Array.isArray(product.categoryName)) return product.categoryName;
    const cat = typeof product.category === 'object' ? product.category?.name : product.category;
    return cat ? [cat] : [];
  }).filter(Boolean))];

  useEffect(() => {
    setLocalFilters(filters);
    setPriceRange({
      min: filters.minPrice || '',
      max: filters.maxPrice || ''
    });
  }, [filters]);

  const handleCategoryChange = (val) => onFilterChange({ ...localFilters, category: val === localFilters.category ? '' : val });
  const handleRatingChange = (val) => onFilterChange({ ...localFilters, minRating: val === localFilters.minRating ? '' : val });
  const handleSortChange = (e) => {
    const [sortBy, sortOrder] = e.target.value.split('-');
    onFilterChange({ ...localFilters, sortBy, sortOrder });
  };
  const applyPriceFilter = () => onFilterChange({ ...localFilters, minPrice: priceRange.min, maxPrice: priceRange.max });
  const clearAllFilters = () => onFilterChange({
    category: '', color: '', size: '', minPrice: '', maxPrice: '', minRating: '',
    sortBy: 'createdAt', sortOrder: 'desc'
  });

  const activeCount = () => {
    let count = 0;
    if (localFilters.category) count++;
    if (localFilters.minPrice || localFilters.maxPrice) count++;
    if (localFilters.minRating) count++;
    return count;
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className={`grid gap-12 ${isVertical ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'}`}
    >
      {/* Strategic Intelligence Header (Mobile/Visual only) */}
      {!isVertical && (
        <div className="lg:hidden col-span-full flex items-center gap-4 mb-4">
          <div className="bg-slate-950 p-3 rounded-2xl shadow-xl">
            <Filter className="w-5 h-5 text-primary-500" />
          </div>
          <h3 className="text-xl font-black text-slate-950 font-outfit uppercase tracking-tighter">Filter Protocols</h3>
        </div>
      )}

      {/* Category Selection */}
      <motion.div variants={item} className="space-y-4">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-primary-600" /> Asset Verticals
        </label>
        <div className="relative group/select">
          <select
            value={localFilters.category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full appearance-none pl-5 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-900 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/5 outline-none transition-all cursor-pointer shadow-sm hover:shadow-md font-outfit"
          >
            <option value="">Global Inventory</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover/select:text-primary-500 transition-colors">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </motion.div>

      {/* Procurement Budget */}
      <motion.div variants={item} className="space-y-4">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-primary-600" /> Procurement Range
        </label>
        <div className={`flex items-center gap-3 ${isVertical ? 'flex-col items-stretch' : ''}`}>
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400 font-outfit">{currencySymbol}</span>
            <input
              type="number"
              value={priceRange.min}
              onChange={(e) => setPriceRange(p => ({ ...p, min: e.target.value }))}
              onBlur={applyPriceFilter}
              placeholder="MIN"
              className="w-full pl-8 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-black text-slate-900 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/5 outline-none transition-all font-outfit placeholder:text-slate-300 shadow-sm"
            />
          </div>
          {!isVertical && <div className="h-px w-4 bg-slate-200" />}
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400 font-outfit">{currencySymbol}</span>
            <input
              type="number"
              value={priceRange.max}
              onChange={(e) => setPriceRange(p => ({ ...p, max: e.target.value }))}
              onBlur={applyPriceFilter}
              placeholder="MAX"
              className="w-full pl-8 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-black text-slate-900 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/5 outline-none transition-all font-outfit placeholder:text-slate-300 shadow-sm"
            />
          </div>
        </div>
      </motion.div>

      {/* Asset Rating */}
      <motion.div variants={item} className="space-y-4">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
          <Star className="w-3.5 h-3.5 text-primary-600" /> Quality Index
        </label>
        <div className="flex gap-3">
          {[4, 3].map(r => (
            <button
              key={r}
              onClick={() => handleRatingChange(r)}
              className={`flex-1 py-4 rounded-2xl border text-[11px] font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 font-outfit shadow-sm ${localFilters.minRating === r
                ? 'bg-slate-950 border-slate-950 text-white shadow-xl shadow-slate-950/20'
                : 'bg-slate-50 border-slate-100 text-slate-600 hover:border-slate-300 hover:bg-slate-100 active:scale-95'}`}
            >
              {r}+ <Star className={`w-3.5 h-3.5 ${localFilters.minRating === r ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} />
            </button>
          ))}
        </div>
      </motion.div>

      {/* Priority Sorting */}
      <motion.div variants={item} className="space-y-4">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-primary-600" /> Priority Feed
        </label>
        <div className="relative group/select">
          <select
            value={`${localFilters.sortBy}-${localFilters.sortOrder}`}
            onChange={handleSortChange}
            className="w-full appearance-none pl-5 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-900 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/5 outline-none transition-all cursor-pointer shadow-sm hover:shadow-md font-outfit"
          >
            <option value="createdAt-desc">Newest Arrivals</option>
            <option value="price-asc">Price Index: Low-High</option>
            <option value="price-desc">Price Index: High-Low</option>
            <option value="title-asc">Alpha Sort: A-Z</option>
          </select>
          <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover/select:text-primary-500 transition-colors">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </motion.div>

      {/* Global Reset Protocols */}
      <AnimatePresence>
        {activeCount() > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={`${isVertical ? 'col-span-1' : 'md:col-span-2 lg:col-span-4'} flex justify-center pt-6`}
          >
            <Button
              onClick={clearAllFilters}
              className="h-12 px-8 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100 font-black uppercase tracking-[0.2em] text-[10px] font-outfit gap-3 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Protocols
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FilterSidebar;