import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import Button from '../components/ui/Button';
import { toast } from 'react-toastify';
import Modal from '../components/Modal';
import SupabaseMultiImageUploader from '../components/admin/SupabaseMultiImageUploader';
import CurrencyPrice from '../components/CurrencyPrice';

const Admin = () => {
  const { token, user } = useSelector(state => state.user);
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
      const res = await axios.get(`${apiUrl}/api/admin/products`, {
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
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 max-w-md w-full text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-20 h-20 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
          >
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4"
          >
            Authentication Required
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-gray-600 mb-8 leading-relaxed"
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
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg transform hover:scale-105 transition-all duration-200"
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="container mx-auto px-4 py-16 text-center max-w-md"
        >
          <motion.div
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-gray-200"
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
              className="text-2xl font-bold text-red-600 mb-4"
            >
              Access Denied
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-600 mb-6"
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
                className="bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700"
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Enhanced Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center space-x-4">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg"
              >
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-800 via-purple-800 to-pink-800 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className="text-sm text-gray-600">Welcome back, {user?.name || 'Administrator'}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg text-sm font-medium shadow-md"
              >
                🟢 Online
              </motion.div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  console.log('🔍 Debug - Current auth state:', {
                    token: token ? `${token.substring(0, 20)}...` : 'Missing',
                    user,
                    localStorage: localStorage.getItem('token') ? 'Has token' : 'No token'
                  });
                }}
                className="px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-all"
              >
                Debug
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  console.log('🔄 Manual data fetch triggered');
                  if (activeTab === 'products') fetchProducts();
                  else if (activeTab === 'orders') fetchOrders();
                  else if (activeTab === 'users') fetchUsers();
                }}
                className="px-3 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-all"
              >
                Refresh Data
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/')}
                className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-all"
              >
                <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Back to Store
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Enhanced Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {products.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {orders.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {users.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-2a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
          </motion.div>
        </motion.div>
        
        {/* Enhanced Tab Navigation */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl p-2 mb-8 shadow-xl border border-white/20"
        >
          <div className="flex space-x-2">
            {[
              { key: 'products', label: 'Products', icon: '📦' },
              { key: 'orders', label: 'Orders', icon: '📋' },
              { key: 'users', label: 'Users', icon: '👥' }
            ].map((tab) => (
              <motion.button
                key={tab.key}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-4 px-6 font-semibold rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 ${
                  activeTab === tab.key 
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg transform scale-105' 
                    : 'text-gray-600 hover:bg-gray-50/50 hover:text-indigo-600'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

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
              <motion.form 
                onSubmit={handleProductSubmit} 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 mb-8 space-y-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-800 to-purple-800 bg-clip-text text-transparent flex items-center">
                    <span className="text-2xl mr-3">
                      {editingProduct ? '✏️' : '➕'}
                    </span>
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                  </h2>
                  {editingProduct && (
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={resetProductForm}
                      className="px-4 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors"
                    >
                      Cancel Edit
                    </motion.button>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <motion.div
                      whileFocus={{ scale: 1.02 }}
                      className="relative"
                    >
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Product Title</label>
                      <input 
                        name="title" 
                        value={productForm.title} 
                        onChange={handleProductChange} 
                        placeholder="Enter product title" 
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white/80 backdrop-blur-sm text-gray-800 font-medium" 
                        required 
                      />
                    </motion.div>

                    <div className="grid grid-cols-2 gap-4">
                      <motion.div whileFocus={{ scale: 1.02 }}>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Price ($)</label>
                        <input 
                          name="price" 
                          value={productForm.price} 
                          onChange={handleProductChange} 
                          placeholder="0.00" 
                          type="number" 
                          step="0.01"
                          className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white/80 backdrop-blur-sm text-gray-800 font-medium" 
                          required 
                        />
                      </motion.div>

                      <motion.div whileFocus={{ scale: 1.02 }}>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Stock Quantity</label>
                        <input 
                          name="stock" 
                          value={productForm.stock} 
                          onChange={handleProductChange} 
                          placeholder="0" 
                          type="number" 
                          className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white/80 backdrop-blur-sm text-gray-800 font-medium" 
                          required 
                        />
                      </motion.div>
                    </div>

                    <motion.div whileFocus={{ scale: 1.02 }}>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                      <input 
                        name="category" 
                        value={productForm.category} 
                        onChange={handleProductChange} 
                        placeholder="e.g., Electronics, Clothing, Books" 
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white/80 backdrop-blur-sm text-gray-800 font-medium" 
                        required 
                      />
                    </motion.div>
                  </div>

                  <div className="space-y-6">
                    <motion.div whileFocus={{ scale: 1.02 }}>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Product Description</label>
                      <textarea 
                        name="description" 
                        value={productForm.description} 
                        onChange={handleProductChange} 
                        placeholder="Describe your product features, benefits, and specifications..." 
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white/80 backdrop-blur-sm text-gray-800 font-medium resize-none" 
                        rows="4"
                      />
                    </motion.div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Product Images</label>
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 bg-gray-50/50">
                        <SupabaseMultiImageUploader
                          productId={editingProduct || 'new'}
                          images={productForm.images}
                          onChange={imgs => setProductForm({ ...productForm, images: imgs })}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex justify-end space-x-4 pt-6 border-t border-gray-200"
                >
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{editingProduct ? 'Update Product' : 'Create Product'}</span>
                  </motion.button>
                </motion.div>
              </motion.form>

              {/* Enhanced Products List */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden"
              >
                <div className="p-8 border-b border-gray-100">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-800 to-purple-800 bg-clip-text text-transparent flex items-center">
                    <span className="text-2xl mr-3">📦</span>
                    All Products ({products.length})
                  </h2>
                </div>

                <div className="p-6">
                  {loading ? (
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <motion.div 
                          key={i} 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.1 }}
                          className="h-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl animate-pulse"
                        />
                      ))}
                    </div>
                  ) : error ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center space-x-3"
                    >
                      <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-medium">{error}</span>
                    </motion.div>
                  ) : products.length === 0 ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-12"
                    >
                      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">No Products Yet</h3>
                      <p className="text-gray-600">Start by adding your first product above.</p>
                    </motion.div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b-2 border-gray-100">
                            <th className="py-4 px-6 text-left font-bold text-gray-700">Product</th>
                            <th className="py-4 px-6 text-left font-bold text-gray-700">Price</th>
                            <th className="py-4 px-6 text-left font-bold text-gray-700">Category</th>
                            <th className="py-4 px-6 text-left font-bold text-gray-700">Stock</th>
                            <th className="py-4 px-6 text-left font-bold text-gray-700">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {products.map((product, index) => (
                            <motion.tr 
                              key={product._id} 
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="border-b border-gray-50 hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/50 transition-all duration-200"
                            >
                              <td className="py-6 px-6">
                                <div className="flex items-center space-x-3">
                                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center">
                                    <span className="text-2xl">📦</span>
                                  </div>
                                  <div>
                                    <p className="font-semibold text-gray-800">{product.title}</p>
                                    <p className="text-sm text-gray-500">ID: {product._id.substring(0, 8)}...</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-6 px-6">
                                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-lg font-bold">
                                  <CurrencyPrice price={parseFloat(product.price)} />
                                </span>
                              </td>
                              <td className="py-6 px-6">
                                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg font-medium">
                                  {typeof product.category === 'object' ? product.category?.name : product.category}
                                </span>
                              </td>
                              <td className="py-6 px-6">
                                <span className={`px-3 py-1 rounded-lg font-bold ${
                                  product.stock > 10 
                                    ? 'bg-green-100 text-green-800' 
                                    : product.stock > 0 
                                    ? 'bg-yellow-100 text-yellow-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {product.stock}
                                </span>
                              </td>
                              <td className="py-6 px-6">
                                <div className="flex space-x-2">
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleEditProduct(product)}
                                    className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors font-medium"
                                  >
                                    Edit
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => confirmDeleteProduct(product)}
                                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium"
                                  >
                                    Delete
                                  </motion.button>
                                </div>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </motion.div>
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
              className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-200 p-6 overflow-x-auto"
            >
              <h2 className="text-xl font-bold mb-4 text-gray-800">All Orders</h2>
              {loading ? (
                <div className="animate-pulse space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-12 bg-gray-200 rounded-xl"></div>
                  ))}
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                  {error}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="py-3 px-4 font-semibold text-gray-700">Order ID</th>
                        <th className="py-3 px-4 font-semibold text-gray-700">Date</th>
                        <th className="py-3 px-4 font-semibold text-gray-700">Customer</th>
                        <th className="py-3 px-4 font-semibold text-gray-700">Total</th>
                        <th className="py-3 px-4 font-semibold text-gray-700">Status</th>
                        <th className="py-3 px-4 font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(order => (
                        <motion.tr 
                          key={order._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="py-3 px-4">{order._id.substring(0, 8)}...</td>
                          <td className="py-3 px-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                          <td className="py-3 px-4">{order.user?.name || 'Unknown'}</td>
                          <td className="py-3 px-4"><CurrencyPrice price={parseFloat(order.totalPrice)} /></td>
                          <td className="py-3 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium
                              ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                                order.status === 'delivered' ? 'bg-green-100 text-green-800' :
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
              className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-200 p-6 overflow-x-auto"
            >
              <h2 className="text-xl font-bold mb-4 text-gray-800">All Users</h2>
              {loading ? (
                <div className="animate-pulse space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-12 bg-gray-200 rounded-xl"></div>
                  ))}
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                  {error}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="py-3 px-4 font-semibold text-gray-700">ID</th>
                        <th className="py-3 px-4 font-semibold text-gray-700">Name</th>
                        <th className="py-3 px-4 font-semibold text-gray-700">Email</th>
                        <th className="py-3 px-4 font-semibold text-gray-700">Role</th>
                        <th className="py-3 px-4 font-semibold text-gray-700">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(user => (
                        <motion.tr 
                          key={user._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="py-3 px-4">{user._id.substring(0, 8)}...</td>
                          <td className="py-3 px-4">{user.name}</td>
                          <td className="py-3 px-4">{user.email}</td>
                          <td className="py-3 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
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
                  <p className="text-sm text-gray-600">Order ID</p>
                  <p className="font-medium">{selectedOrder._id}</p>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="font-medium">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600">Customer</p>
                  <p className="font-medium">{selectedOrder.user?.name || 'Unknown'}</p>
                  <p className="text-sm">{selectedOrder.user?.email || 'No email'}</p>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600">Shipping Address</p>
                  <p className="font-medium">
                    {selectedOrder.shippingAddress?.street}, {selectedOrder.shippingAddress?.city}, 
                    {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.zip}
                  </p>
                </div>

                <div className="mb-6">
                  <p className="text-sm text-gray-600">Status</p>
                  <div className="flex items-center gap-4 mt-1">
                    <span className={`px-2 py-1 rounded text-xs font-medium
                      ${selectedOrder.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        selectedOrder.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                        selectedOrder.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                        selectedOrder.status === 'delivered' ? 'bg-green-100 text-green-800' :
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

                <h3 className="font-bold text-lg mb-2">Order Items</h3>
                <div className="border rounded overflow-hidden mb-6">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50">
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
                  <span className="font-bold">Total</span>
                  <span className="font-bold"><CurrencyPrice price={parseFloat(selectedOrder.totalPrice)} /></span>
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