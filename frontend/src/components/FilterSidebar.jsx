import { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ChevronDown,
  Star,
  Check,
  X,
  RotateCcw,
  ArrowRight,
  Filter
} from 'lucide-react';
import { categoriesAPI, productsAPI } from '../services/api';

const FilterSidebar = ({ filters, onFilterChange, mode = 'vertical' }) => {
  const [apiCategories, setApiCategories] = useState([]);
  const [allAvailableBrands, setAllAvailableBrands] = useState([]);
  const [brandSearch, setBrandSearch] = useState('');
  const [collapsedSections, setCollapsedSections] = useState({
    categories: false,
    subcategories: false,
    price: true,
    brands: true,
    rating: true,
    discount: true
  });
  const [priceInputs, setPriceInputs] = useState({
    min: filters.minPrice || '',
    max: filters.maxPrice || ''
  });

  const { currentCurrency, supportedCurrencies } = useSelector(state => state.currency);
  const currencySymbol = supportedCurrencies[currentCurrency]?.symbol || '₹';

  const isVertical = mode === 'vertical';

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catRes, optRes] = await Promise.all([
          categoriesAPI.getAll(),
          productsAPI.getFilterOptions()
        ]);

        const categories = catRes.data;
        const mainCats = categories.filter(c => !c.parentCategory);
        const subCatsMap = {};

        categories.forEach(c => {
          if (c.parentCategory) {
            const parentId = typeof c.parentCategory === 'object' ? c.parentCategory._id : c.parentCategory;
            if (!subCatsMap[parentId]) subCatsMap[parentId] = [];
            subCatsMap[parentId].push(c);
          }
        });

        const structured = mainCats.map(cat => ({
          ...cat,
          subcategories: subCatsMap[cat._id] || []
        }));

        setApiCategories(structured);
        setAllAvailableBrands(optRes.data.brands || []);
      } catch (err) {
        console.error('Error fetching filter metadata:', err);
      }
    };
    fetchMetadata();
  }, []);

  useEffect(() => {
    setPriceInputs({
      min: filters.minPrice || '',
      max: filters.maxPrice || ''
    });
  }, [filters.minPrice, filters.maxPrice]);

  const toggleSection = (section) => {
    setCollapsedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const activeCategoryIds = filters.category ? filters.category.split(',') : [];

  const handleMainCategoryClick = (id) => {
    // If clicking the already active main category, clear it
    // Otherwise, set it as the sole category
    if (filters.category === id) {
      onFilterChange({ ...filters, category: '' });
    } else {
      onFilterChange({ ...filters, category: id });
    }
  };

  const handleSubcategoryToggle = (id) => {
    // Get all category IDs currently in filter
    let newIds = [...activeCategoryIds];

    // Toggle the clicked subcategory
    if (newIds.includes(id)) {
      newIds = newIds.filter(cid => cid !== id);
    } else {
      newIds.push(id);
    }

    // Determine the current main category
    const mainCat = apiCategories.find(cat =>
      cat._id === id || cat.subcategories.some(sub => sub._id === id)
    );

    if (mainCat) {
      // If we have subcategories selected for this main category, 
      // remove the main category ID itself from the filter list
      const selectedSubsInThisMain = mainCat.subcategories.filter(sub => newIds.includes(sub._id));

      if (selectedSubsInThisMain.length > 0) {
        newIds = newIds.filter(cid => cid !== mainCat._id);
      } else {
        // If no subcategories left for this main category, add the main category back
        // but ONLY if the user was already in this category context
        if (activeMainCat?._id === mainCat._id) {
          if (!newIds.includes(mainCat._id)) newIds.push(mainCat._id);
        }
      }
    }

    onFilterChange({ ...filters, category: newIds.join(',') });
  };

  const handleBrandToggle = (brand) => {
    const currentBrands = filters.brand ? filters.brand.split(',') : [];
    const newBrands = currentBrands.includes(brand)
      ? currentBrands.filter(b => b !== brand)
      : [...currentBrands, brand];
    onFilterChange({ ...filters, brand: newBrands.join(',') });
  };

  const handlePriceApply = (e) => {
    if (e) e.preventDefault();
    onFilterChange({ ...filters, minPrice: priceInputs.min, maxPrice: priceInputs.max });
  };

  const handleRatingToggle = (val) => {
    onFilterChange({ ...filters, minRating: filters.minRating === val.toString() ? '' : val.toString() });
  };

  const handleDiscountToggle = (val) => {
    onFilterChange({ ...filters, discount: filters.discount === val.toString() ? '' : val.toString() });
  };

  const handleAvailabilityToggle = () => {
    onFilterChange({ ...filters, inStock: filters.inStock === 'true' ? '' : 'true' });
  };

  const filteredBrands = useMemo(() => {
    return allAvailableBrands.filter(b => b.toLowerCase().includes(brandSearch.toLowerCase()));
  }, [allAvailableBrands, brandSearch]);

  const SectionHeader = ({ title, section, count }) => (
    <button
      onClick={() => toggleSection(section)}
      className="flex items-center justify-between w-full py-4 text-left group"
    >
      <div className="flex items-center gap-2">
        <span className="text-sm font-black text-slate-900 uppercase tracking-tight">{title}</span>
        {count > 0 && (
          <span className="inline-flex items-center justify-center bg-primary-600 text-white text-[9px] font-black min-w-4 h-4 rounded-full px-1">
            {count}
          </span>
        )}
      </div>
      <ChevronDown
        className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${collapsedSections[section] ? '-rotate-90' : ''}`}
      />
    </button>
  );

  const CheckboxItem = ({ label, checked, onChange, count, isSub }) => (
    <label className="flex items-center gap-3 py-2 cursor-pointer group select-none">
      <div className={`
        w-4.5 h-4.5 rounded flex items-center justify-center transition-all border
        ${checked
          ? 'bg-primary-600 border-primary-600 shadow-sm'
          : 'border-slate-300 bg-white group-hover:border-primary-400'}
      `}>
        {checked && <Check className="w-3 h-3 text-white stroke-[3px]" />}
      </div>
      <input type="checkbox" className="hidden" checked={checked} onChange={onChange} />
      <span className={`text-[13px] transition-colors ${checked ? 'text-slate-900 font-bold' : 'text-slate-600 group-hover:text-slate-900'}`}>
        {label}
      </span>
      {count !== undefined && <span className="text-[11px] text-slate-400 ml-auto">{count}</span>}
    </label>
  );

  const activeMainCat = useMemo(() => {
    return apiCategories.find(cat =>
      activeCategoryIds.includes(cat._id) || cat.subcategories.some(sub => activeCategoryIds.includes(sub._id))
    );
  }, [apiCategories, activeCategoryIds]);

  return (
    <div className={`flex flex-col gap-2 ${isVertical ? 'w-full' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'}`}>

      {/* Categories - Different UI: Buttons/Pills */}
      <div className="border-b border-slate-100 pb-2">
        <SectionHeader title="Categories" section="categories" />
        <AnimatePresence initial={false}>
          {!collapsedSections.categories && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden space-y-2 mb-4"
            >
              {apiCategories.map(cat => {
                const isActive = activeCategoryIds.includes(cat._id) || (activeMainCat?._id === cat._id);
                return (
                  <button
                    key={cat._id}
                    onClick={() => handleMainCategoryClick(cat._id)}
                    className={`flex items-center gap-3 w-full py-2.5 px-4 rounded-xl text-[13px] transition-all relative overflow-hidden group border
                      ${isActive
                        ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200'
                        : 'bg-white text-slate-600 border-slate-100 hover:border-primary-200 hover:bg-slate-50'
                      }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full transition-colors ${isActive ? 'bg-primary-400' : 'bg-slate-200 group-hover:bg-primary-300'}`} />
                    <span className="font-bold tracking-tight">{cat.name}</span>
                    {activeCategoryIds.includes(cat._id) && <Check className="w-3.5 h-3.5 ml-auto text-primary-400" />}
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Subcategories - Different UI: Checkboxes */}
      {activeMainCat && activeMainCat.subcategories.length > 0 && (
        <div className="border-b border-slate-100 pb-2">
          <SectionHeader
            title="Subcategories"
            section="subcategories"
            count={activeMainCat.subcategories.filter(sub => activeCategoryIds.includes(sub._id)).length}
          />
          <AnimatePresence initial={false}>
            {!collapsedSections.subcategories && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden space-y-1 mb-4 pl-1"
              >
                {activeMainCat.subcategories.map(sub => (
                  <CheckboxItem
                    key={sub._id}
                    label={sub.name}
                    isSub={true}
                    checked={activeCategoryIds.includes(sub._id)}
                    onChange={() => handleSubcategoryToggle(sub._id)}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Price Range */}
      <div className="border-b border-slate-100 pb-2">
        <SectionHeader title="Price Range" section="price" />
        <AnimatePresence initial={false}>
          {!collapsedSections.price && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden pb-4 px-1"
            >
              <div className="flex items-center gap-2 mt-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] font-bold">{currencySymbol}</span>
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceInputs.min}
                    onChange={(e) => setPriceInputs(p => ({ ...p, min: e.target.value }))}
                    className="w-full pl-7 pr-3 py-2.5 text-[12px] font-bold bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all"
                  />
                </div>
                <span className="text-slate-300 font-bold text-[10px] uppercase">to</span>
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] font-bold">{currencySymbol}</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceInputs.max}
                    onChange={(e) => setPriceInputs(p => ({ ...p, max: e.target.value }))}
                    className="w-full pl-7 pr-3 py-2.5 text-[12px] font-bold bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all"
                  />
                </div>
                <button
                  onClick={handlePriceApply}
                  className="p-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 active:scale-90"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Brands */}
      <div className="border-b border-slate-100 pb-2">
        <SectionHeader
          title="Brands"
          section="brands"
          count={filters.brand ? filters.brand.split(',').filter(Boolean).length : 0}
        />
        <AnimatePresence initial={false}>
          {!collapsedSections.brands && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden pb-4 space-y-3 px-1"
            >
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Find Brand..."
                  value={brandSearch}
                  onChange={(e) => setBrandSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-[11px] font-bold bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-primary-500/5 focus:border-primary-500 outline-none transition-all"
                />
              </div>
              <div className="max-h-56 overflow-y-auto pr-2 custom-scrollbar space-y-1">
                {filteredBrands.length > 0 ? (
                  filteredBrands.map(brand => (
                    <CheckboxItem
                      key={brand}
                      label={brand}
                      checked={filters.brand?.split(',').includes(brand)}
                      onChange={() => handleBrandToggle(brand)}
                    />
                  ))
                ) : (
                  <p className="text-[11px] text-slate-400 text-center py-4 italic font-bold uppercase tracking-widest">No matching brands</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Customer Ratings */}
      <div className="border-b border-slate-100 pb-2">
        <SectionHeader title="Customer Ratings" section="rating" />
        <AnimatePresence initial={false}>
          {!collapsedSections.rating && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden pb-4 space-y-1 px-1"
            >
              {[4, 3, 2, 1].map(r => (
                <button
                  key={r}
                  onClick={() => handleRatingToggle(r)}
                  className={`flex items-center gap-3 w-full py-2.5 px-3 rounded-xl text-[13px] transition-all group border
                    ${filters.minRating === r.toString()
                      ? 'bg-amber-50 text-amber-900 border-amber-200'
                      : 'bg-white text-slate-600 border-transparent hover:bg-slate-50 hover:text-slate-900'
                    }`}
                >
                  <div className="flex items-center gap-1 font-black">
                    {r} <Star className={`w-3.5 h-3.5 ${filters.minRating === r.toString() ? 'fill-amber-500 text-amber-500' : 'text-slate-300 group-hover:text-amber-500'} transition-colors`} />
                    <span className="font-bold text-slate-400 ml-1">& Up</span>
                  </div>
                  {filters.minRating === r.toString() && <Check className="w-3.5 h-3.5 ml-auto text-amber-600" />}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Discount */}
      <div className="border-b border-slate-100 pb-2">
        <SectionHeader title="Discount" section="discount" />
        <AnimatePresence initial={false}>
          {!collapsedSections.discount && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden pb-4 space-y-1 px-1"
            >
              {[10, 25, 40, 50, 70].map(d => (
                <CheckboxItem
                  key={d}
                  label={`${d}% or more`}
                  checked={filters.discount === d.toString()}
                  onChange={() => {
                    onFilterChange({ ...filters, discount: filters.discount === d.toString() ? '' : d.toString() });
                  }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Availability */}
      <div className="pt-4 px-1">
        <CheckboxItem
          label="In Stock Only"
          checked={filters.inStock === 'true'}
          onChange={handleAvailabilityToggle}
        />
      </div>

      {/* Reset All */}
      {isVertical && (
        <div className="mt-8 pt-6 border-t border-slate-100">
          <button
            onClick={() => onFilterChange({})}
            className="flex items-center justify-center gap-2 w-full py-4 px-4 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-[0.98]"
          >
            <RotateCcw className="w-4 h-4" /> Reset All Metrics
          </button>
        </div>
      )}

    </div>
  );
};

export default FilterSidebar;