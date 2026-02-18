import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, deleteProduct, getBrands } from '../../services/adminService';
import apiClient from '../../services/api';
import AdminLayout from '../../components/admin/AdminLayout';
import Button from '../../components/ui/Button';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Package,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  MoreVertical,
  Filter,
  Download,
  X,
  ChevronDown
} from 'lucide-react';
import { toast } from 'react-toastify';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [filters, setFilters] = useState({ category: '', brand: '', stockStatus: '' });

  const fetchProducts = async (page = 1, search = '') => {
    try {
      setLoading(true);
      const response = await getProducts({ page, limit: 10, search });
      const { products, pagination } = response.data.data;
      setProducts(products);
      setTotalPages(pagination.pages || Math.ceil(pagination.total / 10));
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(currentPage, searchTerm);
  }, [currentPage]);

  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          apiClient.get('/api/categories?parent=null'),
          getBrands()
        ]);
        setCategories(catRes.data || []);
        setBrands(brandRes.data.brands || []);
      } catch (err) {
        console.error('Error loading filter options:', err);
      }
    };
    loadFilterOptions();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts(1, searchTerm);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteProduct(deleteConfirm);
      toast.success('Product deleted successfully');
      setDeleteConfirm(null);
      fetchProducts(currentPage, searchTerm);
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const getStockStatus = (stock) => {
    if (stock <= 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-700 border-red-200' };
    if (stock <= 10) return { label: 'Low Stock', color: 'bg-amber-100 text-amber-700 border-amber-200' };
    return { label: 'In Stock', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
  };

  const activeFilterCount = [filters.category, filters.brand, filters.stockStatus].filter(Boolean).length;

  const filteredProducts = products.filter(p => {
    if (filters.category) {
      const catName = typeof p.category === 'object' ? p.category?.name : p.category;
      if (catName !== filters.category) return false;
    }
    if (filters.brand && p.brand !== filters.brand) return false;
    if (filters.stockStatus) {
      const status = getStockStatus(p.stock).label;
      if (status !== filters.stockStatus) return false;
    }
    return true;
  });

  const clearFilters = () => {
    setFilters({ category: '', brand: '', stockStatus: '' });
  };

  return (
    <AdminLayout>
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Products Catalog</h1>
            <p className="text-slate-500 mt-1">Manage, track, and update your global inventory.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center px-4 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all shadow-sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
            <Link to="/admin/products/add">
              <button className="flex items-center px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0">
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </button>
            </Link>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <form onSubmit={handleSearch} className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by title, SKU, or category..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </form>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex-1 md:flex-none flex items-center justify-center px-4 py-2.5 border text-sm font-medium rounded-xl transition-all relative ${showFilters || activeFilterCount > 0
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="ml-2 h-5 w-5 flex items-center justify-center bg-indigo-600 text-white text-[10px] font-black rounded-full">
                    {activeFilterCount}
                  </span>
                )}
                <ChevronDown className={`h-3.5 w-3.5 ml-1.5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 px-3 py-2.5 text-xs font-bold text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                >
                  <X className="h-3.5 w-3.5" />
                  Clear
                </button>
              )}
              <div className="h-8 w-[1px] bg-slate-200 hidden md:block"></div>
              <p className="text-sm text-slate-500 font-medium whitespace-nowrap">
                Showing <span className="text-slate-900">{filteredProducts.length}</span> products
              </p>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100 animate-in slide-in-from-top duration-200">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="">All Categories</option>
                  {categories.map(c => (
                    <option key={c._id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Brand</label>
                <select
                  value={filters.brand}
                  onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="">All Brands</option>
                  {brands.map(b => (
                    <option key={b._id} value={b.name}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Stock Status</label>
                <select
                  value={filters.stockStatus}
                  onChange={(e) => setFilters({ ...filters, stockStatus: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="">All Status</option>
                  <option value="In Stock">In Stock</option>
                  <option value="Low Stock">Low Stock</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-4 rounded-2xl mb-6 flex items-center shadow-sm">
            <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Table/Content Area */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
          {loading ? (
            <div className="flex flex-col justify-center items-center h-96">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
              <p className="text-slate-500 font-medium animate-pulse">Syncing catalog...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-bottom border-slate-100">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Product Details</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Category</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Price</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Inventory</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-24 text-center">
                        <div className="flex flex-col items-center">
                          <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                            <Package className="h-8 w-8 text-slate-300" />
                          </div>
                          <h3 className="text-lg font-bold text-slate-900">No products found</h3>
                          <p className="text-slate-500 text-sm mt-1 max-w-xs mx-auto">
                            Try adjusting your search or filters to find what you're looking for.
                          </p>
                          {activeFilterCount > 0 && (
                            <button onClick={clearFilters} className="mt-4 px-4 py-2 text-sm font-bold text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-all">
                              Clear All Filters
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => {
                      const status = getStockStatus(product.stock);
                      return (
                        <tr key={product._id} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className="h-12 w-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 shadow-sm">
                                <img
                                  className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                                  src={product.images?.[0]?.url || '/placeholder.png'}
                                  alt={product.title}
                                />
                              </div>
                              <div>
                                <div className="text-sm font-bold text-slate-900 truncate max-w-[200px]">{product.title}</div>
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">SKU: {product.sku || 'N/A'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">
                              {typeof product.category === 'object' ? product.category?.name || 'General' : product.category || 'General'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-black text-slate-900">₹{product.price?.toLocaleString()}</div>
                            {product.discount > 0 && (
                              <div className="text-[10px] text-rose-600 font-bold mt-0.5">-{product.discount}% Sale</div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className={`text-sm font-bold ${product.stock <= 10 ? 'text-rose-600' : 'text-slate-900'}`}>{product.stock} Units</div>
                            <div className="w-20 bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${product.stock <= 10 ? 'bg-rose-500' : 'bg-indigo-500'}`}
                                style={{ width: `${Math.min((product.stock / 50) * 100, 100)}%` }}
                              ></div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${status.color}`}>
                              <span className={`h-1.5 w-1.5 rounded-full mr-1.5 ${status.label === 'In Stock' ? 'bg-emerald-500' : status.label === 'Low Stock' ? 'bg-amber-500' : 'bg-rose-500'}`}></span>
                              {status.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end items-center gap-2">
                              <Link to={`/admin/products/${product._id}/edit`}>
                                <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" title="Edit Product">
                                  <Edit2 className="h-4 w-4" />
                                </button>
                              </Link>
                              <button
                                onClick={() => setDeleteConfirm(product._id)}
                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                title="Delete Product"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modern Pagination */}
        {!loading && totalPages > 1 && (
          <div className="mt-8 flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-sm text-slate-500 font-medium whitespace-nowrap hidden sm:block">
              Page <span className="text-slate-900 font-bold">{currentPage}</span> of <span className="text-slate-900 font-bold">{totalPages}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center px-4 py-2 bg-slate-50 text-slate-600 text-sm font-bold rounded-xl border border-slate-200 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </button>
              <div className="flex gap-1">
                {[...Array(totalPages).keys()].map(page => {
                  const isActive = currentPage === page + 1;
                  return (
                    <button
                      key={page + 1}
                      onClick={() => setCurrentPage(page + 1)}
                      className={`h-10 w-10 flex items-center justify-center rounded-xl text-sm font-bold transition-all ${isActive
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                        : 'text-slate-500 hover:bg-slate-100'
                        }`}
                    >
                      {page + 1}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="flex items-center px-4 py-2 bg-slate-50 text-slate-600 text-sm font-bold rounded-xl border border-slate-200 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Overlay */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 text-center">
              <div className="h-16 w-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Confirm Deletion</h3>
              <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                Are you sure you want to remove this product? This action is permanent and will delete all associated data.
              </p>
            </div>
            <div className="flex border-t border-slate-100">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-4 text-sm font-bold text-slate-500 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 py-4 text-sm font-bold text-rose-600 hover:bg-rose-50 transition-colors border-l border-slate-100"
              >
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default Products;
