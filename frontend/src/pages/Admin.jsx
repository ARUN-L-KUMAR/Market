import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import Button from '../components/ui/Button';
import { toast } from 'react-toastify';
import Modal from '../components/Modal';
import CloudinaryMultiImageUploader from '../components/admin/CloudinaryMultiImageUploader';
import CurrencyPrice from '../components/CurrencyPrice';
import { ShoppingBag, Package, User } from 'lucide-react';
import { logout } from '../store/store';

const Admin = () => {
  const { token, user } = useSelector(state => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('products');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Products state
  const [products, setProducts] = useState([]);
  const [productForm, setProductForm] = useState({
    title: '',
    price: '',
    description: '',
    category: '',
    stock: '',
    images: []
  });
  const [editingProduct, setEditingProduct] = useState(null);
  const [showDeleteProductModal, setShowDeleteProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Orders state
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  // Users state
  const [users, setUsers] = useState([]);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  // Fetch products
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    console.log('🔍 Fetching products with:', {
      apiUrl,
      token: token ? 'Present' : 'Missing',
      endpoint: `${apiUrl}/api/admin/products`
    });

    try {
      const res = await axios.get(`${apiUrl}/api/admin/products?limit=100`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Products response:', res.data);
      setProducts(res.data.data?.products || res.data.products || []);
    } catch (err) {
      setError('Failed to load products');
      toast.error('Failed to load products');
      console.error('❌ Products fetch error:', err.response?.data || err.message);
      console.error('❌ Error details:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data
      });
    }
    setLoading(false);
  };

  // Fetch orders
  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    console.log('🔍 Fetching orders with:', {
      apiUrl,
      token: token ? 'Present' : 'Missing',
      endpoint: `${apiUrl}/api/admin/orders`
    });

    try {
      const res = await axios.get(`${apiUrl}/api/admin/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Orders response:', res.data);
      setOrders(res.data.data?.orders || res.data.orders || []);
    } catch (err) {
      setError('Failed to load orders');
      toast.error('Failed to load orders');
      console.error('❌ Orders fetch error:', err.response?.data || err.message);
    }
    setLoading(false);
  };

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    console.log('🔍 Fetching users with:', {
      apiUrl,
      token: token ? 'Present' : 'Missing',
      endpoint: `${apiUrl}/api/admin/users`
    });

    try {
      const res = await axios.get(`${apiUrl}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Users response:', res.data);
      setUsers(Array.isArray(res.data) ? res.data : res.data.users || []);
    } catch (err) {
      setError('Failed to load users');
      toast.error('Failed to load users');
      console.error('❌ Users fetch error:', err.response?.data || err.message);
    }
    setLoading(false);
  };

  // Fetch data based on active tab
  useEffect(() => {
    console.log('🔍 useEffect triggered with:', {
      token: token ? `${token.substring(0, 20)}...` : 'Missing',
      userIsAdmin: user?.isAdmin,
      userRole: user?.role,
      userName: user?.name,
      activeTab,
      localStorageToken: localStorage.getItem('token') ? 'Present in localStorage' : 'Missing in localStorage'
    });

    // Check if user has admin permissions (either isAdmin flag or role)
    const hasAdminAccess = user?.isAdmin === true || user?.role === 'admin';

    if (!token || !hasAdminAccess) {
      console.log('❌ Authentication check failed:', {
        hasToken: !!token,
        isAdmin: user?.isAdmin,
        userRole: user?.role,
        hasAdminAccess
      });
      return;
    }

    console.log('✅ Authentication passed, fetching data for tab:', activeTab);

    // Load all data immediately when component mounts
    if (activeTab === 'products' && products.length === 0) {
      fetchProducts();
      fetchOrders(); // Also load orders data
      fetchUsers();  // Also load users data
    } else if (activeTab === 'orders') {
      fetchOrders();
    } else if (activeTab === 'users') {
      fetchUsers();
    }
  }, [token, activeTab, user?.isAdmin, user?.role]);

  // Product form handlers
  const handleProductChange = e => {
    const { name, value } = e.target;
    setProductForm({ ...productForm, [name]: value });
  };

  const handleProductSubmit = async e => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await axios.put(`${apiUrl}/api/products/${editingProduct}`, productForm, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Product updated successfully');
      } else {
        await axios.post(`${apiUrl}/api/products`, productForm, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Product created successfully');
      }
      resetProductForm();
      fetchProducts();
    } catch (err) {
      toast.error(editingProduct ? 'Failed to update product' : 'Failed to create product');
      console.error('Product submit error:', err.response?.data || err.message);
    }
  };

  const resetProductForm = () => {
    setProductForm({ title: '', price: '', description: '', category: '', stock: '', images: [] });
    setEditingProduct(null);
  };

  const handleEditProduct = product => {
    setProductForm({
      title: product.title,
      price: product.price,
      description: product.description,
      category: product.category,
      stock: product.stock,
      images: product.images || []
    });
    setEditingProduct(product._id);
  };

  const confirmDeleteProduct = product => {
    setSelectedProduct(product);
    setShowDeleteProductModal(true);
  };

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;

    try {
      await axios.delete(`${apiUrl}/api/admin/products/${selectedProduct._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Product deleted successfully');
      fetchProducts();
      setShowDeleteProductModal(false);
    } catch (err) {
      toast.error('Failed to delete product');
      console.error('Product delete error:', err.response?.data || err.message);
    }
  };

  // Order handlers
  const viewOrderDetails = order => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await axios.put(`${apiUrl}/api/admin/orders/${orderId}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Order status updated');
      fetchOrders();
      if (selectedOrder?._id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status }));
      }
    } catch (err) {
      toast.error('Failed to update order status');
      console.error('Order status update error:', err.response?.data || err.message);
    }
  };

  // Access control - simplified check
  if (!token) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-lg p-8 shadow-sm border border-slate-200 max-w-md w-full text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm"
          >
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-semibold text-slate-900 mb-4"
          >
            Authentication Required
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-slate-600 mb-8 leading-relaxed"
          >
            Please log in to access the admin dashboard
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Button
              onClick={() => navigate('/login')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-semibold shadow-sm transform hover:scale-105 transition-all duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Go to Login
            </Button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (!user?.isAdmin && user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="container mx-auto px-4 py-16 text-center max-w-md"
        >
          <motion.div
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg p-8 shadow-sm border border-slate-200"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-semibold text-red-600 mb-4"
            >
              Access Denied
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-slate-600 mb-6"
            >
              You need administrator privileges to access this page.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Button
                onClick={() => navigate('/')}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Return to Homepage
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Enhanced Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-5">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Admin Management
              </h1>
              <p className="text-sm text-slate-500 font-medium">Control center for your digital storefront</p>
            </div>

            <div className="flex items-center space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (activeTab === 'products') fetchProducts();
                  else if (activeTab === 'orders') fetchOrders();
                  else if (activeTab === 'users') fetchUsers();
                }}
                className="p-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all border border-slate-200 bg-white shadow-sm"
                title="Refresh Data"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </motion.button>

              <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block" />

              <div className="flex items-center space-x-3 bg-slate-50 border border-slate-200 pl-3 pr-1.5 py-1.5 rounded-xl shadow-sm">
                <div className="flex flex-col items-end">
                  <span className="text-xs font-bold text-slate-900 leading-tight">{user?.name}</span>
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Admin</span>
                </div>
                <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-indigo-500/10">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Enhanced Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <motion.div
            whileHover={{ y: -4 }}
            className="bg-white rounded-2xl p-7 shadow-sm border border-slate-200 group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Store Inventory</span>
            </div>
            <p className="text-sm font-bold text-slate-500 mb-1">Total Products</p>
            <p className="text-4xl font-bold text-slate-900 tracking-tight">
              {products.length}
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="bg-white rounded-2xl p-7 shadow-sm border border-slate-200 group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Order Volume</span>
            </div>
            <p className="text-sm font-bold text-slate-500 mb-1">Total Orders</p>
            <p className="text-4xl font-bold text-slate-900 tracking-tight">
              {orders.length}
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="bg-white rounded-2xl p-7 shadow-sm border border-slate-200 group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center border border-amber-100 group-hover:bg-amber-600 group-hover:text-white transition-all duration-300">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-2a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">User Base</span>
            </div>
            <p className="text-sm font-bold text-slate-500 mb-1">Total Users</p>
            <p className="text-4xl font-bold text-slate-900 tracking-tight">
              {users.length}
            </p>
          </motion.div>
        </div>

        {/* Enhanced Tab Navigation */}
        <div className="bg-slate-100 p-1.5 rounded-2xl mb-12 max-w-2xl">
          <div className="flex space-x-1">
            {[
              { key: 'products', label: 'Products', icon: <Package className="w-4 h-4" /> },
              { key: 'orders', label: 'Orders', icon: <ShoppingBag className="w-4 h-4" /> },
              { key: 'users', label: 'Users', icon: <User className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-3 px-6 text-sm font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === tab.key
                  ? 'bg-white text-slate-900 shadow-md transform scale-[1.02]'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
                  }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Products Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'products' && (
            <motion.div
              key="products"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Enhanced Product Form */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-12">
                <div className="bg-slate-50 border-b border-slate-200 px-8 py-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                      {editingProduct ? <Settings className="w-5 h-5" /> : <Package className="w-5 h-5" />}
                    </div>
                    <h2 className="text-lg font-bold text-slate-900">
                      {editingProduct ? 'Edit Product' : 'Add New Product'}
                    </h2>
                  </div>
                  {editingProduct && (
                    <button
                      type="button"
                      onClick={resetProductForm}
                      className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
                    >
                      Cancel Editing
                    </button>
                  )}
                </div>

                <form onSubmit={handleProductSubmit} className="p-8">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-8 space-y-8">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Product Title</label>
                        <input
                          name="title"
                          value={productForm.title}
                          onChange={handleProductChange}
                          placeholder="e.g. Premium Wireless Headphones"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700 ml-1">Price ($)</label>
                          <input
                            name="price"
                            value={productForm.price}
                            onChange={handleProductChange}
                            placeholder="0.00"
                            type="number"
                            step="0.01"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700 ml-1">Stock Level</label>
                          <input
                            name="stock"
                            value={productForm.stock}
                            onChange={handleProductChange}
                            placeholder="0"
                            type="number"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Category</label>
                        <input
                          name="category"
                          value={productForm.category}
                          onChange={handleProductChange}
                          placeholder="Search or enter category"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Description</label>
                        <textarea
                          name="description"
                          value={productForm.description}
                          onChange={handleProductChange}
                          placeholder="Tell your customers about this product..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium min-h-[160px] resize-none"
                        />
                      </div>
                    </div>

                    <div className="lg:col-span-4">
                      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 sticky top-24">
                        <label className="block text-sm font-bold text-slate-700 mb-4">Product Assets</label>
                        <div className="bg-white border-2 border-dashed border-slate-200 rounded-xl p-4 hover:border-indigo-400 transition-colors">
                          <CloudinaryMultiImageUploader
                            productId={editingProduct || 'new'}
                            images={productForm.images}
                            onChange={imgs => setProductForm({ ...productForm, images: imgs })}
                          />
                        </div>
                        <p className="mt-4 text-xs text-slate-500 font-medium text-center">
                          Upload high-resolution images for best results.
                        </p>

                        <div className="mt-8">
                          <Button
                            type="submit"
                            className="w-full py-4 text-base font-bold shadow-lg shadow-indigo-500/20"
                          >
                            {editingProduct ? 'Save Changes' : 'Publish Product'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              </div>

              {/* Enhanced Products List */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-8 py-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">Inventory Management</h2>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{products.length} Products Found</p>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  {loading ? (
                    <div className="p-8 space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
                      ))}
                    </div>
                  ) : error ? (
                    <div className="p-8">
                      <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center space-x-3">
                        <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-bold">{error}</span>
                      </div>
                    </div>
                  ) : products.length === 0 ? (
                    <div className="p-20 text-center">
                      <div className="w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-slate-100">
                        <Package className="w-10 h-10 text-slate-300" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">No Products Yet</h3>
                      <p className="text-slate-500 font-medium">Add some items to get your store up and running.</p>
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="py-4 px-8 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Product Info</th>
                          <th className="py-4 px-6 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Pricing</th>
                          <th className="py-4 px-6 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Category</th>
                          <th className="py-4 px-6 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Stock Level</th>
                          <th className="py-4 px-8 text-right text-xs font-bold text-slate-500 uppercase tracking-widest">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {products.map((product) => (
                          <tr key={product._id} className="hover:bg-slate-50/80 transition-all group">
                            <td className="py-5 px-8">
                              <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 flex-shrink-0 group-hover:border-indigo-200 transition-colors">
                                  {product.images && product.images[0] ? (
                                    <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-50">
                                      <Package className="w-6 h-6 text-slate-300" />
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-bold text-slate-900 truncate max-w-[200px]">{product.title}</p>
                                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">ID: {product._id.substring(0, 8)}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-5 px-6">
                              <span className="inline-flex items-center px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-bold border border-emerald-100">
                                <CurrencyPrice price={parseFloat(product.price)} />
                              </span>
                            </td>
                            <td className="py-5 px-6">
                              <span className="inline-flex items-center px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-bold border border-indigo-100">
                                {typeof product.category === 'object' ? product.category?.name : product.category}
                              </span>
                            </td>
                            <td className="py-5 px-6">
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${product.stock > 10 ? 'bg-emerald-500' : product.stock > 0 ? 'bg-amber-500' : 'bg-red-500'}`} />
                                <span className={`text-sm font-bold ${product.stock > 10 ? 'text-slate-700' : product.stock > 0 ? 'text-amber-700' : 'text-red-700'}`}>
                                  {product.stock} units
                                </span>
                              </div>
                            </td>
                            <td className="py-5 px-8 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleEditProduct(product)}
                                  className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                  title="Edit Product"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => confirmDeleteProduct(product)}
                                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                  title="Delete Product"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Orders Tab Content */}
          {activeTab === 'orders' && (
            <motion.div
              key="orders"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 overflow-x-auto"
            >
              <h2 className="text-xl font-semibold mb-4 text-slate-800">All Orders</h2>
              {loading ? (
                <div className="animate-pulse space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-12 bg-slate-200 rounded-lg"></div>
                  ))}
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="py-3 px-4 font-semibold text-slate-700">Order ID</th>
                        <th className="py-3 px-4 font-semibold text-slate-700">Date</th>
                        <th className="py-3 px-4 font-semibold text-slate-700">Customer</th>
                        <th className="py-3 px-4 font-semibold text-slate-700">Total</th>
                        <th className="py-3 px-4 font-semibold text-slate-700">Status</th>
                        <th className="py-3 px-4 font-semibold text-slate-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(order => (
                        <motion.tr
                          key={order._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="border-b border-slate-200 hover:bg-slate-50/50 transition-colors"
                        >
                          <td className="py-3 px-4">{order._id.substring(0, 8)}...</td>
                          <td className="py-3 px-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                          <td className="py-3 px-4">{order.user?.name || 'Unknown'}</td>
                          <td className="py-3 px-4"><CurrencyPrice price={parseFloat(order.totalPrice)} /></td>
                          <td className="py-3 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium
                              ${order.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                order.status === 'processing' ? 'bg-indigo-100 text-indigo-700' :
                                  order.status === 'shipped' ? 'bg-indigo-100 text-indigo-700' :
                                    order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                                      'bg-red-100 text-red-800'}`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <Button size="xs" variant="outline" onClick={() => viewOrderDetails(order)}>
                              View Details
                            </Button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}

          {/* Users Tab Content */}
          {activeTab === 'users' && (
            <motion.div
              key="users"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 overflow-x-auto"
            >
              <h2 className="text-xl font-semibold mb-4 text-slate-800">All Users</h2>
              {loading ? (
                <div className="animate-pulse space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-12 bg-slate-200 rounded-lg"></div>
                  ))}
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="py-3 px-4 font-semibold text-slate-700">ID</th>
                        <th className="py-3 px-4 font-semibold text-slate-700">Name</th>
                        <th className="py-3 px-4 font-semibold text-slate-700">Email</th>
                        <th className="py-3 px-4 font-semibold text-slate-700">Role</th>
                        <th className="py-3 px-4 font-semibold text-slate-700">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(user => (
                        <motion.tr
                          key={user._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="border-b border-slate-200 hover:bg-slate-50/50 transition-colors"
                        >
                          <td className="py-3 px-4">{user._id.substring(0, 8)}...</td>
                          <td className="py-3 px-4">{user.name}</td>
                          <td className="py-3 px-4">{user.email}</td>
                          <td className="py-3 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-indigo-100 text-indigo-700'
                              }`}>
                              {user.role === 'admin' ? 'Admin' : 'Customer'}
                            </span>
                          </td>
                          <td className="py-3 px-4">{new Date(user.createdAt).toLocaleDateString()}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Product Confirmation Modal */}
        <AnimatePresence>
          {showDeleteProductModal && selectedProduct && (
            <Modal title="Confirm Deletion" onClose={() => setShowDeleteProductModal(false)}>
              <div className="p-6">
                <p className="mb-6">Are you sure you want to delete <strong>{selectedProduct.title}</strong>? This action cannot be undone.</p>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setShowDeleteProductModal(false)}>
                    Cancel
                  </Button>
                  <Button variant="danger" onClick={handleDeleteProduct}>
                    Delete Product
                  </Button>
                </div>
              </div>
            </Modal>
          )}
        </AnimatePresence>

        {/* Order Details Modal */}
        <AnimatePresence>
          {showOrderModal && selectedOrder && (
            <Modal title="Order Details" onClose={() => setShowOrderModal(false)}>
              <div className="p-6">
                <div className="mb-4">
                  <p className="text-sm text-slate-600">Order ID</p>
                  <p className="font-medium">{selectedOrder._id}</p>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-slate-600">Date</p>
                  <p className="font-medium">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-slate-600">Customer</p>
                  <p className="font-medium">{selectedOrder.user?.name || 'Unknown'}</p>
                  <p className="text-sm">{selectedOrder.user?.email || 'No email'}</p>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-slate-600">Shipping Address</p>
                  <p className="font-medium">
                    {selectedOrder.shippingAddress?.street}, {selectedOrder.shippingAddress?.city},
                    {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.zip}
                  </p>
                </div>

                <div className="mb-6">
                  <p className="text-sm text-slate-600">Status</p>
                  <div className="flex items-center gap-4 mt-1">
                    <span className={`px-2 py-1 rounded text-xs font-medium
                      ${selectedOrder.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        selectedOrder.status === 'processing' ? 'bg-indigo-100 text-indigo-700' :
                          selectedOrder.status === 'shipped' ? 'bg-indigo-100 text-indigo-700' :
                            selectedOrder.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                              'bg-red-100 text-red-800'}`}>
                      {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                    </span>

                    <div className="flex gap-2">
                      <Button
                        size="xs"
                        variant={selectedOrder.status === 'pending' ? 'primary' : 'outline'}
                        disabled={selectedOrder.status === 'pending'}
                        onClick={() => updateOrderStatus(selectedOrder._id, 'pending')}
                      >
                        Pending
                      </Button>
                      <Button
                        size="xs"
                        variant={selectedOrder.status === 'processing' ? 'primary' : 'outline'}
                        disabled={selectedOrder.status === 'processing'}
                        onClick={() => updateOrderStatus(selectedOrder._id, 'processing')}
                      >
                        Processing
                      </Button>
                      <Button
                        size="xs"
                        variant={selectedOrder.status === 'shipped' ? 'primary' : 'outline'}
                        disabled={selectedOrder.status === 'shipped'}
                        onClick={() => updateOrderStatus(selectedOrder._id, 'shipped')}
                      >
                        Shipped
                      </Button>
                      <Button
                        size="xs"
                        variant={selectedOrder.status === 'delivered' ? 'primary' : 'outline'}
                        disabled={selectedOrder.status === 'delivered'}
                        onClick={() => updateOrderStatus(selectedOrder._id, 'delivered')}
                      >
                        Delivered
                      </Button>
                    </div>
                  </div>
                </div>

                <h3 className="font-semibold text-lg mb-2">Order Items</h3>
                <div className="border rounded overflow-hidden mb-6">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="py-2 px-4">Product</th>
                        <th className="py-2 px-4">Quantity</th>
                        <th className="py-2 px-4">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items?.map((item, index) => (
                        <tr key={index} className="border-t">
                          <td className="py-3 px-4">{item.product?.title || 'Unknown Product'}</td>
                          <td className="py-3 px-4">{item.quantity}</td>
                          <td className="py-3 px-4"><CurrencyPrice price={parseFloat(item.price)} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-between border-t pt-4">
                  <span className="font-semibold">Total</span>
                  <span className="font-semibold"><CurrencyPrice price={parseFloat(selectedOrder.totalPrice)} /></span>
                </div>
              </div>
            </Modal>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Admin;