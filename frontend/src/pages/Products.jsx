import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
  X
} from 'lucide-react';
import { fetchProducts, setFilters } from '../store/productSlice';
import ProductCard from '../components/ProductCard';
import FilterSidebar from '../components/FilterSidebar';
import Pagination from '../components/ui/Pagination';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';

const Products = () => {
  const dispatch = useDispatch();
  const { products, loading, error, filters, totalProducts } = useSelector(state => state.products);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const productsPerPage = 20;
  
  useEffect(() => {
    dispatch(fetchProducts({ ...filters, page: currentPage, limit: productsPerPage }));
  }, [dispatch, filters, currentPage]);
  
  const handleFilterChange = (newFilters) => {
    dispatch(setFilters(newFilters));
    setCurrentPage(1); // Reset to first page when filters change
  };
  
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      handleFilterChange({ ...filters, search: searchTerm });
    }
  };

  const quickFilters = [
    { label: 'All Products', value: '', icon: <Package className="w-4 h-4" /> },
    { label: 'New Arrivals', value: 'new', icon: <TrendingUp className="w-4 h-4" /> },
    { label: 'On Sale', value: 'sale', icon: <Zap className="w-4 h-4" /> },
    { label: 'Best Rated', value: 'rated', icon: <Star className="w-4 h-4" /> },
  ];

  const handleQuickFilter = (filterType) => {
    const newFilters = { ...filters };
    switch (filterType) {
      case 'new':
        newFilters.isNew = true;
        break;
      case 'sale':
        newFilters.onSale = true;
        break;
      case 'rated':
        newFilters.minRating = 4;
        break;
      default:
        // Clear quick filters
        delete newFilters.isNew;
        delete newFilters.onSale;
        delete newFilters.minRating;
    }
    handleFilterChange(newFilters);
  };
  
  if (loading) return <LoadingSpinner />;
  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
      <div className="text-center p-8 bg-white rounded-3xl shadow-xl border border-red-100">
        <div className="text-6xl mb-4">😔</div>
        <h2 className="text-2xl font-bold text-red-600 mb-2">Oops! Something went wrong</h2>
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()} variant="primary">
          Try Again
        </Button>
      </div>
    </div>
  );
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-2">
                Discover Products
              </h1>
              <p className="text-gray-600 text-lg">
                Explore our curated collection of {totalProducts || 0} amazing products
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-md w-full">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-2xl focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-100 transition-all duration-200"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-2 rounded-xl hover:shadow-lg transition-all duration-200"
                >
                  <Search className="w-4 h-4" />
                </motion.button>
              </form>
            </div>
          </div>
        </motion.div>

        {/* Quick Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-wrap gap-3">
            {quickFilters.map((filter, index) => (
              <motion.button
                key={filter.value}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleQuickFilter(filter.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                  filters[filter.value] || (filter.value === '' && !filters.isNew && !filters.onSale && !filters.minRating)
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white hover:shadow-md border border-gray-200'
                }`}
              >
                {filter.icon}
                {filter.label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Controls Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200"
        >
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 lg:hidden"
            >
              <SlidersHorizontal className="w-4 h-4" />
              {showFilters ? 'Hide' : 'Show'} Filters
            </Button>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 font-medium">View:</span>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === 'grid' 
                      ? 'bg-white text-purple-600 shadow-sm' 
                      : 'text-gray-600 hover:text-purple-600'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === 'list' 
                      ? 'bg-white text-purple-600 shadow-sm' 
                      : 'text-gray-600 hover:text-purple-600'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Inline Filter Controls */}
            <div className="hidden lg:flex">
              <FilterSidebar 
                filters={filters} 
                onFilterChange={handleFilterChange} 
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Showing {products.length} of {totalProducts || 0} products
            </span>
          </div>
        </motion.div>
        
        {/* Mobile Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden mb-6 p-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <FilterSidebar 
                filters={filters} 
                onFilterChange={handleFilterChange} 
              />
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Products Grid */}
          <div className="w-full">
            <AnimatePresence mode="wait">
              {products.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="text-center p-12 bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl border-2 border-dashed border-gray-300"
                >
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">No Products Found</h3>
                  <p className="text-gray-600 mb-6">
                    We couldn't find any products matching your criteria. Try adjusting your filters or search terms.
                  </p>
                  <Button
                    onClick={() => handleFilterChange({})}
                    variant="primary"
                    className="px-6 py-3"
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Show All Products
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className={`grid gap-8 ${
                    viewMode === 'grid' 
                      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                      : 'grid-cols-1'
                  }`}>
                    {products.map((product, index) => (
                      <ProductCard 
                        key={product._id} 
                        product={product} 
                        index={index}
                        viewMode={viewMode}
                      />
                    ))}
                  </div>
                  
                  {/* Enhanced Pagination */}
                  {Math.ceil((totalProducts || 0) / productsPerPage) > 1 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                      className="mt-12 flex justify-center"
                    >
                      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-200 shadow-lg">
                        <Pagination 
                          currentPage={currentPage}
                          totalPages={Math.ceil((totalProducts || 0) / productsPerPage)}
                          onPageChange={handlePageChange}
                        />
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Floating Action Button for Mobile Filters */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5 }}
        onClick={() => setShowFilters(true)}
        className="fixed bottom-6 right-6 lg:hidden bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 z-50"
      >
        <Filter className="w-6 h-6" />
      </motion.button>
    </div>
  );
};

export default Products;