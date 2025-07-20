import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { 
  ShoppingBag, 
  Download, 
  Eye, 
  X, 
  Filter, 
  SortAsc, 
  Calendar,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import CurrencyPrice from '../components/CurrencyPrice';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Card from '../components/ui/Card';

const OrderHistory = () => {
  const { token } = useSelector(state => state.user);
  const navigate = useNavigate();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [token, navigate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await axios.get(`${apiUrl}/api/orders/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (Array.isArray(response.data)) {
        setOrders(response.data);
        setError(null);
      } else if (response.data && response.data.message) {
        setOrders([]);
        setError(response.data.message);
      } else {
        setOrders([]);
        setError('Failed to load order history');
      }
    } catch (err) {
      setOrders([]);
      setError('Failed to load order history');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async (orderId) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await axios.get(`${apiUrl}/api/orders/${orderId}/invoice`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading invoice:', error);
      const event = new CustomEvent('show-toast', { 
        detail: { message: 'Failed to download invoice', type: 'error' }
      });
      window.dispatchEvent(event);
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      await axios.put(`${apiUrl}/api/orders/${orderId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Refresh orders
      fetchOrders();
      
      const event = new CustomEvent('show-toast', { 
        detail: { message: 'Order cancelled successfully', type: 'success' }
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.error('Error cancelling order:', error);
      const event = new CustomEvent('show-toast', { 
        detail: { message: 'Failed to cancel order', type: 'error' }
      });
      window.dispatchEvent(event);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'processing': return 'info';
      case 'shipped': return 'primary';
      case 'delivered': return 'success';
      case 'cancelled': return 'danger';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'processing': return <Package className="w-4 h-4" />;
      case 'shipped': return <Truck className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  const sortedOrders = filteredOrders.sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else if (sortBy === 'oldest') {
      return new Date(a.createdAt) - new Date(b.createdAt);
    } else if (sortBy === 'amount-high') {
      return b.total - a.total;
    } else if (sortBy === 'amount-low') {
      return a.total - b.total;
    }
    return 0;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <div className="container mx-auto px-4 py-12 max-w-7xl">
          <div className="flex items-center justify-center min-h-[400px]">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <div className="container mx-auto px-4 py-12 max-w-7xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-2xl shadow-lg"
          >
            <div className="flex items-center">
              <XCircle className="w-5 h-5 mr-3" />
              {error}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="bg-blue-100 p-3 rounded-2xl mr-4">
              <ShoppingBag className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Order History
            </h1>
          </div>
          <p className="text-gray-600 text-lg">Track and manage your past orders</p>
        </motion.div>

        {/* Filters and Sorting */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="mb-8" shadow="lg" gradient>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* Filter by Status */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-gray-700">
                  <Filter className="w-5 h-5" />
                  <span className="font-semibold">Filter:</span>
                </div>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                >
                  <option value="all">All Orders</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Sort Options */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-gray-700">
                  <SortAsc className="w-5 h-5" />
                  <span className="font-semibold">Sort by:</span>
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="amount-high">Highest Amount</option>
                  <option value="amount-low">Lowest Amount</option>
                </select>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Orders List */}
        <AnimatePresence>
          {sortedOrders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="text-center py-16" shadow="xl" gradient>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                  className="mb-6"
                >
                  <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                    <ShoppingBag className="w-12 h-12 text-gray-400" />
                  </div>
                </motion.div>
                <h2 className="text-3xl font-bold text-gray-700 mb-4">No Orders Found</h2>
                <p className="text-gray-500 mb-8 max-w-md mx-auto text-lg">
                  {filter === 'all' 
                    ? "You haven't placed any orders yet. Start shopping to see your order history here!" 
                    : `No orders found with status "${filter}". Try adjusting your filters.`}
                </p>
                <Button 
                  variant="primary" 
                  size="lg"
                  onClick={() => navigate('/products')}
                  icon={<ShoppingBag className="w-5 h-5" />}
                >
                  Start Shopping
                </Button>
              </Card>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {sortedOrders.map((order, index) => (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden" shadow="xl" gradient hover>
                    {/* Order Header */}
                    <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-100">
                      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
                        <div className="flex items-center gap-6">
                          <div>
                            <h3 className="text-xl font-bold text-gray-800 mb-1">
                              Order #{order.orderNumber || order._id.slice(-8).toUpperCase()}
                            </h3>
                            <div className="flex items-center text-sm text-gray-600">
                              <Calendar className="w-4 h-4 mr-2" />
                              {formatDate(order.createdAt)}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={getStatusColor(order.status)}
                              size="md"
                              dot
                              pulse={order.status === 'processing'}
                            >
                              <span className="flex items-center gap-1">
                                {getStatusIcon(order.status)}
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </span>
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-sm text-gray-500 mb-1">Total Amount</div>
                            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                             ₹{order.total?.toFixed(2) || '0.00'}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/orders/${order._id}`)}
                              icon={<Eye className="w-4 h-4" />}
                            >
                              View Details
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDownloadInvoice(order._id)}
                              icon={<Download className="w-4 h-4" />}
                            >
                              Invoice
                            </Button>
                            {order.status === 'pending' && (
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => handleCancelOrder(order._id)}
                                icon={<X className="w-4 h-4" />}
                              >
                                Cancel
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="px-8 py-6">
                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        {/* Items List */}
                        <div>
                          <h4 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                            <Package className="w-5 h-5 mr-2" />
                            Items Ordered
                          </h4>
                          <div className="space-y-4">
                            {order.items?.slice(0, 3).map((item, itemIndex) => (
                              <motion.div 
                                key={itemIndex}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: (index * 0.1) + (itemIndex * 0.05) }}
                                className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200"
                              >
                                <div className="relative">
                                  <img
                                    src={item.product?.images?.[0]?.url || 'https://via.placeholder.com/80'}
                                    alt={item.product?.title || 'Product'}
                                    className="w-16 h-16 object-cover rounded-lg shadow-md"
                                    onError={e => { e.target.src = 'https://via.placeholder.com/80'; }}
                                  />
                                  <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                                    {item.quantity}
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-semibold text-gray-800 truncate">
                                    {item.product?.title || 'Product'}
                                  </div>
                                  <span className="text-xs text-gray-500">
                                    <CurrencyPrice price={item.price} /> each
                                  </span>
                                  <span className="text-sm font-medium text-blue-600">
                                    Total: <CurrencyPrice price={item.quantity * item.price} />
                                  </span>
                                </div>
                              </motion.div>
                            ))}
                            {order.items?.length > 3 && (
                              <div className="text-center">
                                <Badge variant="secondary" size="sm">
                                  +{order.items.length - 3} more items
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Shipping Info */}
                        <div>
                          <h4 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                            <Truck className="w-5 h-5 mr-2" />
                            Shipping Address
                          </h4>
                          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                            <div className="text-sm text-gray-700 space-y-2">
                              <p className="font-semibold text-lg text-gray-800">
                                {order.shippingAddress?.fullName}
                              </p>
                              <p className="text-gray-600">{order.shippingAddress?.address}</p>
                              <p className="text-gray-600">
                                {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}
                              </p>
                              <p className="text-gray-600">{order.shippingAddress?.country}</p>
                              {order.shippingAddress?.phone && (
                                <p className="text-gray-600 mt-3 pt-2 border-t border-blue-200">
                                  📞 {order.shippingAddress.phone}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OrderHistory;
