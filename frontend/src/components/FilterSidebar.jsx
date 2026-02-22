import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
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
  Layers,
  Box,
  Percent,
  CheckCircle2,
  Circle
} from 'lucide-react';
import Badge from './ui/Badge';
import Button from './ui/Button';
import { categoriesAPI } from '../services/api';

const FilterSidebar = ({ filters, onFilterChange, mode = 'horizontal' }) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const [apiCategories, setApiCategories] = useState([]);
  const [priceRange, setPriceRange] = useState({
    min: filters.minPrice || '',
    max: filters.maxPrice || ''
  });

  const { products: currentProducts } = useSelector(state => state.products);
  const { currentCurrency, supportedCurrencies } = useSelector(state => state.currency);
  const currencySymbol = supportedCurrencies[currentCurrency]?.symbol || '₹';

  const isVertical = mode === 'vertical';

  useEffect(() => {
    const fetchAllCategories = async () => {
      try {
        const response = await categoriesAPI.getAll();
        setApiCategories(response.data);
      } catch (err) {
        console.error('Error fetching categories for filter:', err);
      }
    };
    fetchAllCategories();
  }, []);

  // Derived brands from current view products
  const brands = [...new Set((currentProducts || []).map(p => p.brand).filter(Boolean))];

  useEffect(() => {
    setLocalFilters(filters);
    setPriceRange({
      min: filters.minPrice || '',
      max: filters.maxPrice || ''
    });
  }, [filters]);

  const handleCategoryChange = (id) => onFilterChange({ ...localFilters, category: id === localFilters.category ? '' : id });
  const handleBrandChange = (brand) => onFilterChange({ ...localFilters, brand: brand === localFilters.brand ? '' : brand });
  const handleRatingChange = (val) => onFilterChange({ ...localFilters, minRating: val === localFilters.minRating ? '' : val });
  const handleAvailabilityChange = () => onFilterChange({ ...localFilters, inStock: localFilters.inStock === 'true' ? '' : 'true' });
  const handleDiscountChange = (val) => onFilterChange({ ...localFilters, discount: val === localFilters.discount ? '' : val });

  const handleSortChange = (e) => {
    const [sortBy, sortOrder] = e.target.value.split('-');
    onFilterChange({ ...localFilters, sortBy, sortOrder });
  };

  const applyPriceFilter = () => onFilterChange({ ...localFilters, minPrice: priceRange.min, maxPrice: priceRange.max });

  const clearAllFilters = () => onFilterChange({
    category: '', brand: '', color: '', size: '', minPrice: '', maxPrice: '', minRating: '',
    onSale: '', inStock: '', discount: '',
    sortBy: 'createdAt', sortOrder: 'desc', quickFilter: 'primary'
  });

  const activeCount = () => {
    let count = 0;
    if (localFilters.category) count++;
    if (localFilters.brand) count++;
    if (localFilters.minPrice || localFilters.maxPrice) count++;
    if (localFilters.minRating) count++;
    if (localFilters.inStock) count++;
    if (localFilters.discount) count++;
    return count;
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  const SectionLabel = ({ icon: Icon, label }) => (
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-4">
      <Icon className="w-3.5 h-3.5 text-primary-600" /> {label}
    </label>
  );

  const FilterSection = ({ children, className = "" }) => (
    <motion.div variants={item} className={`space-y-4 ${className}`}>
      {children}
    </motion.div>
  );

  return (
    <motion.div
      initial="hidden"
      animate="show"
      className={`grid gap-12 ${isVertical ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'}`}
    >
      {/* Category Section */}
      <FilterSection>
        <SectionLabel icon={Layers} label="Asset Verticals" />
        <div className="relative group/select">
          <select
            value={localFilters.category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full appearance-none pl-5 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-900 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/5 outline-none transition-all cursor-pointer shadow-sm hover:shadow-md font-outfit"
          >
            <option value="">Global Inventory</option>
            {apiCategories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover/select:text-primary-500 transition-colors">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </FilterSection>

      {/* Procurement Budget */}
      <FilterSection>
        <SectionLabel icon={DollarSign} label="Procurement Range" />
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
      </FilterSection>

      {/* Brand Selection */}
      {brands.length > 0 && (
        <FilterSection>
          <SectionLabel icon={ShieldCheck} label="Origin Nodes" />
          <div className="relative group/select">
            <select
              value={localFilters.brand}
              onChange={(e) => handleBrandChange(e.target.value)}
              className="w-full appearance-none pl-5 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-900 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/5 outline-none transition-all cursor-pointer shadow-sm hover:shadow-md font-outfit"
            >
              <option value="">All Origins</option>
              {brands.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover/select:text-primary-500 transition-colors">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </FilterSection>
      )}

      {/* Asset Rating */}
      <FilterSection>
        <SectionLabel icon={Star} label="Quality Index" />
        <div className="flex gap-2">
          {[4, 3, 2].map(r => (
            <button
              key={r}
              onClick={() => handleRatingChange(r)}
              className={`flex-1 py-3.5 rounded-xl border text-[10px] font-black transition-all duration-300 flex items-center justify-center gap-1.5 font-outfit ${localFilters.minRating === r
                ? 'bg-slate-950 border-slate-950 text-white shadow-lg'
                : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-slate-300'}`}
            >
              {r}+ <Star className={`w-3 h-3 ${localFilters.minRating === r ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} />
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Value Propositions */}
      <FilterSection className={isVertical ? "space-y-6" : ""}>
        <SectionLabel icon={Percent} label="Value Propositions" />
        <div className="flex flex-col gap-3">
          <button
            onClick={handleAvailabilityChange}
            className={`flex items-center justify-between px-5 py-3.5 rounded-2xl border transition-all duration-300 ${localFilters.inStock === 'true'
              ? 'bg-primary-50 border-primary-200 text-primary-700 shadow-sm'
              : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100'}`}
          >
            <span className="text-[10px] font-black uppercase tracking-widest">In Stock Only</span>
            {localFilters.inStock === 'true' ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4 opacity-20" />}
          </button>

          <div className="grid grid-cols-2 gap-2">
            {[25, 50].map(d => (
              <button
                key={d}
                onClick={() => handleDiscountChange(d)}
                className={`py-3 rounded-xl border text-[9px] font-black uppercase tracking-tighter transition-all ${localFilters.discount === d
                  ? 'bg-indigo-600 border-indigo-700 text-white shadow-md'
                  : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100'}`}
              >
                {d}%+ OFF
              </button>
            ))}
          </div>
        </div>
      </FilterSection>

      {/* Priority Sorting - Pre-applied in Horizontal mode from Products.jsx, but useful in Vertical drawer */}
      {isVertical && (
        <FilterSection>
          <SectionLabel icon={Zap} label="Priority Feed" />
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
        </FilterSection>
      )}

      {/* Reset Controls */}
      <AnimatePresence>
        {activeCount() > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={`${isVertical ? 'col-span-1' : 'col-span-full'} flex justify-center pt-8`}
          >
            <Button
              onClick={clearAllFilters}
              className="h-12 px-10 rounded-2xl bg-slate-950 text-white shadow-xl shadow-slate-950/20 font-black uppercase tracking-[0.2em] text-[10px] font-outfit gap-3 transition-all hover:scale-105 active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Purge Filter Protocols
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FilterSidebar;