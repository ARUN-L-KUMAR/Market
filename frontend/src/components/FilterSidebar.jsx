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
  Star
} from 'lucide-react';

const FilterSidebar = ({ filters, onFilterChange }) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const [priceRange, setPriceRange] = useState({
    min: filters.minPrice || '',
    max: filters.maxPrice || ''
  });

  // Get all products to extract categories, colors, sizes
  const { items: allProducts } = useSelector(state => state.products);
  const { currentCurrency, supportedCurrencies } = useSelector(state => state.currency);

  // Get current currency symbol
  const currencySymbol = supportedCurrencies[currentCurrency]?.symbol || '₹';

  // Extract unique categories, colors, and sizes from all products
  const categories = [...new Set((allProducts || []).map(product => 
    typeof product.category === 'object' ? product.category?.name : product.category
  ).filter(Boolean))];
  const colors = [...new Set((allProducts || []).flatMap(product => product.colors || []))];
  const sizes = [...new Set((allProducts || []).flatMap(product => product.sizes || []))];

  // Update local filters when props change
  useEffect(() => {
    setLocalFilters(filters);
    setPriceRange({
      min: filters.minPrice || '',
      max: filters.maxPrice || ''
    });
  }, [filters]);

  const handleCategoryChange = (category) => {
    const newFilters = {
      ...localFilters,
      category: category === localFilters.category ? '' : category
    };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleColorChange = (color) => {
    const newFilters = {
      ...localFilters,
      color: color === localFilters.color ? '' : color
    };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSizeChange = (size) => {
    const newFilters = {
      ...localFilters,
      size: size === localFilters.size ? '' : size
    };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleRatingChange = (rating) => {
    const newFilters = {
      ...localFilters,
      minRating: rating === localFilters.minRating ? '' : rating
    };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    const newPriceRange = { ...priceRange, [name]: value };
    setPriceRange(newPriceRange);
  };

  const applyPriceFilter = () => {
    const newFilters = {
      ...localFilters,
      minPrice: priceRange.min,
      maxPrice: priceRange.max
    };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSortChange = (e) => {
    const [sortBy, sortOrder] = e.target.value.split('-');
    const newFilters = {
      ...localFilters,
      sortBy,
      sortOrder
    };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      category: '',
      color: '',
      size: '',
      minPrice: '',
      maxPrice: '',
      minRating: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };
    setLocalFilters(clearedFilters);
    setPriceRange({ min: '', max: '' });
    onFilterChange(clearedFilters);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (localFilters.category) count++;
    if (localFilters.color) count++;
    if (localFilters.size) count++;
    if (localFilters.minPrice || localFilters.maxPrice) count++;
    if (localFilters.minRating) count++;
    return count;
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Filters Title */}
      <div className="flex items-center gap-1">
        <Filter className="w-4 h-4 text-purple-600" />
        <span className="text-sm font-medium text-gray-700">Filters:</span>
        {getActiveFilterCount() > 0 && (
          <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
            {getActiveFilterCount()}
          </span>
        )}
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div className="flex items-center gap-1">
          <Tag className="w-4 h-4 text-gray-500" />
          <select
            value={localFilters.category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="px-2 py-1 bg-gray-50 border border-gray-200 rounded text-sm focus:border-purple-400 focus:outline-none"
          >
            <option value="">Category</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {typeof category === 'object' ? category?.name || 'Unknown' : category}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Price Range */}
      <div className="flex items-center gap-1">
        <DollarSign className="w-4 h-4 text-gray-500" />
        <input
          type="number"
          name="min"
          value={priceRange.min}
          onChange={handlePriceChange}
          onBlur={applyPriceFilter}
          placeholder={`Min ${currencySymbol}`}
          className="w-16 px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs focus:border-purple-400 focus:outline-none"
        />
        <span className="text-gray-400 text-xs">-</span>
        <input
          type="number"
          name="max"
          value={priceRange.max}
          onChange={handlePriceChange}
          onBlur={applyPriceFilter}
          placeholder={`Max ${currencySymbol}`}
          className="w-16 px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs focus:border-purple-400 focus:outline-none"
        />
      </div>

      {/* Colors */}
      {colors.length > 0 && (
        <div className="flex items-center gap-1">
          <Palette className="w-4 h-4 text-gray-500" />
          <div className="flex gap-0.5">
            {colors.slice(0, 4).map(color => (
              <motion.button
                key={color}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleColorChange(color)}
                className={`w-5 h-5 rounded-full border transition-all duration-200 ${
                  localFilters.color === color 
                    ? 'border-purple-500 ring-1 ring-purple-300' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                style={{ backgroundColor: color.toLowerCase() }}
                title={color}
              />
            ))}
          </div>
        </div>
      )}

      {/* Rating */}
      <div className="flex items-center gap-1">
        <Star className="w-4 h-4 text-gray-500" />
        <select
          value={localFilters.minRating}
          onChange={(e) => handleRatingChange(parseInt(e.target.value) || '')}
          className="px-2 py-1 bg-gray-50 border border-gray-200 rounded text-sm focus:border-purple-400 focus:outline-none"
        >
          <option value="">Rating</option>
          {[5, 4, 3, 2, 1].map(rating => (
            <option key={rating} value={rating}>
              {rating}+ ⭐
            </option>
          ))}
        </select>
      </div>

      {/* Sizes */}
      {sizes.length > 0 && (
        <div className="flex items-center gap-1">
          <Ruler className="w-4 h-4 text-gray-500" />
          <div className="flex gap-0.5">
            {sizes.slice(0, 3).map(size => (
              <motion.button
                key={size}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSizeChange(size)}
                className={`px-1.5 py-0.5 text-xs rounded transition-all duration-200 ${
                  localFilters.size === size
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {size}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Sort */}
      <div className="flex items-center gap-1">
        <TrendingUp className="w-4 h-4 text-gray-500" />
        <select
          value={`${localFilters.sortBy}-${localFilters.sortOrder}`}
          onChange={handleSortChange}
          className="px-2 py-1 bg-gray-50 border border-gray-200 rounded text-sm focus:border-purple-400 focus:outline-none"
        >
          <option value="createdAt-desc">Newest</option>
          <option value="createdAt-asc">Oldest</option>
          <option value="price-asc">Price ↑</option>
          <option value="price-desc">Price ↓</option>
          <option value="title-asc">A-Z</option>
          <option value="title-desc">Z-A</option>
        </select>
      </div>

      {/* Clear Filters */}
      {getActiveFilterCount() > 0 && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={clearAllFilters}
          className="flex items-center gap-1 px-2 py-1 text-xs text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded transition-all duration-200"
        >
          <RotateCcw className="w-3 h-3" />
          Clear ({getActiveFilterCount()})
        </motion.button>
      )}
    </div>
  );
};

export default FilterSidebar;