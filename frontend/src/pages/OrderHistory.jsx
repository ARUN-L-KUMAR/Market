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
  Clock,
  ArrowRight,
  ChevronDown,
  Search
} from 'lucide-react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import CurrencyPrice from '../components/CurrencyPrice';
import { getProductImageUrl } from '../utils/imageUtils';
import LoadingSpinner from '../components/ui/LoadingSpinner';

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
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: 'Failed to download invoice', type: 'error' }
      }));
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      await axios.put(`${apiUrl}/api/orders/${orderId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchOrders();
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: 'Order cancelled successfully', type: 'success' }
      }));
    } catch (error) {
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: 'Failed to cancel order', type: 'error' }
      }));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'yellow';
      case 'processing': return 'blue';
      case 'shipped': return 'purple';
      case 'delivered': return 'green';
      case 'cancelled': return 'red';
      default: return 'gray';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  const sortedOrders = filteredOrders.sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
    if (sortBy === 'amount-high') return b.total - a.total;
    if (sortBy === 'amount-low') return a.total - b.total;
    return 0;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[#1A1A1A]">
      <div className="h-28" /> {/* Navbar space */}

      <div className="max-w-6xl mx-auto px-6 pb-24">
        {/* Header section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div>
            <h1 className="text-4xl font-medium tracking-tight mb-4 group">
              Order Manifests
            </h1>
            <p className="text-slate-500 text-sm font-light max-w-md">
              A meticulously curated record of your procurement journey and global asset acquisitions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-100 rounded-full shadow-sm">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-transparent border-none text-[10px] font-bold uppercase tracking-widest outline-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-100 rounded-full shadow-sm">
              <SortAsc className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent border-none text-[10px] font-bold uppercase tracking-widest outline-none cursor-pointer"
              >
                <option value="newest">Latest First</option>
                <option value="oldest">Historical First</option>
                <option value="amount-high">Highest Valuation</option>
                <option value="amount-low">Minimalist Pricing</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <AnimatePresence mode="wait">
          {sortedOrders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-32 bg-slate-50/50 rounded-[3rem] border border-dashed border-slate-200 text-center"
            >
              <div className="w-20 h-20 bg-white rounded-3xl border border-slate-100 flex items-center justify-center mx-auto mb-8 shadow-sm">
                <ShoppingBag className="w-10 h-10 text-slate-200" />
              </div>
              <h2 className="text-2xl font-light text-slate-400 mb-6">No records found within these parameters.</h2>
              <Button onClick={() => navigate('/products')} className="rounded-full px-12">Return to Catalog</Button>
            </motion.div>
          ) : (
            <div className="space-y-8">
              {sortedOrders.map((order, index) => (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden hover:border-slate-200 hover:shadow-2xl transition-all duration-700 group"
                >
                  <div className="p-8 md:p-10">
                    {/* Header: Order Info & Status */}
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 mb-12">
                      <div className="flex items-start gap-6">
                        <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-3 transition-transform duration-500">
                          <Package className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1.5">Manifest Identity</p>
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-bold tracking-tight whitespace-nowrap">#{order.orderNumber || order._id.slice(-8).toUpperCase()}</h3>
                            <Badge color={getStatusColor(order.status)} size="md">{order.status}</Badge>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 xl:flex items-center gap-8 xl:gap-10">
                        <div className="text-right">
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Transmission Date</p>
                          <p className="text-sm font-medium">{formatDate(order.createdAt).split(' at ')[0]}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Items Volume</p>
                          <p className="text-sm font-medium">{order.items.reduce((acc, item) => acc + item.quantity, 0)} Units</p>
                        </div>
                        <div className="flex gap-2 ml-auto">
                          <button
                            onClick={() => navigate(`/orders/${order._id}`)}
                            className="w-11 h-11 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-black transition-all shadow-md"
                            title="View Details"
                          >
                            <ArrowRight className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDownloadInvoice(order._id)}
                            className="w-11 h-11 bg-white border border-slate-100 text-slate-600 rounded-xl flex items-center justify-center hover:bg-slate-50 transition-all shadow-sm"
                            title="Download Invoice"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Preview & Delivery Area */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 pt-8 border-t border-slate-50">
                      {/* Asset Preview */}
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-5">Asset Preview</p>
                        <div className="flex flex-wrap gap-3">
                          {order.items.slice(0, 4).map((item, i) => (
                            <div key={i} className="relative group/item">
                              <div className="w-16 h-20 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 shadow-sm group-hover/item:shadow-lg transition-all duration-500">
                                <img
                                  src={getProductImageUrl(item.product)}
                                  alt={item.product?.title}
                                  className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-700"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800';
                                  }}
                                />
                              </div>
                              <div className="absolute -top-2 -right-2 w-6 h-6 bg-slate-900 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-md">
                                {item.quantity}
                              </div>
                            </div>
                          ))}
                          {order.items.length > 4 && (
                            <div className="w-16 h-20 rounded-xl bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center text-slate-400">
                              <span className="text-base font-semibold">+{order.items.length - 4}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Destination Summary */}
                      <div className="border-l border-slate-50 pl-10 hidden md:block">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-5">Point of Delivery</p>
                        <div className="space-y-2">
                          <p className="text-sm font-bold text-slate-900">{order.shippingAddress?.fullName || 'Identity Secured'}</p>
                          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed max-w-[200px]">
                            {order.shippingAddress?.address}, {order.shippingAddress?.city}
                          </p>
                        </div>
                      </div>

                      {/* Valuation & Action */}
                      <div className="xl:border-l xl:border-slate-50 xl:pl-10 flex flex-col justify-between items-end">
                        <div className="text-right mb-6 xl:mb-0">
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Total Valuation</p>
                          <p className="text-3xl font-bold tracking-tighter text-slate-900">
                            <CurrencyPrice price={order.total} />
                          </p>
                        </div>

                        {order.status === 'pending' && (
                          <button
                            onClick={() => handleCancelOrder(order._id)}
                            className="px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 transition-all border border-rose-100 group-hover:bg-rose-50 shadow-sm"
                          >
                            Abort Transaction
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
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
