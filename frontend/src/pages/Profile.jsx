import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import socket from '../utils/socket';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';
import CurrencyPrice from '../components/CurrencyPrice';
import CurrencySwitcher from '../components/CurrencySwitcher';
import {
  User,
  Package,
  MapPin,
  Settings,
  Shield,
  CreditCard,
  ShoppingBag,
  TrendingUp,
  Heart,
  Clock,
  ChevronRight,
  LogOut,
  Plus,
  ArrowRight,
  Zap,
  Award,
  Lock,
  Mail,
  Phone,
  Edit3,
  Calendar,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';
import { getProductImageUrl } from '../utils/imageUtils';
import { setUser, logout } from '../store/store';
import Modal from '../components/Modal';
import { toast } from 'react-toastify';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
};

const getStatusColor = (status) => {
  const colors = {
    pending: 'yellow',
    processing: 'blue',
    shipped: 'purple',
    delivered: 'green',
    cancelled: 'red'
  };
  return colors[status] || 'gray';
};

const Profile = () => {
  const { user, token } = useSelector(state => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState('overview');
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [error, setError] = useState(null);

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Sync form when user data loads
  useEffect(() => {
    if (user) {
      setProfileForm(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      }));
    }
  }, [user]);

  const [isSaving, setIsSaving] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressFormData, setAddressFormData] = useState({
    type: 'home',
    fullName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    phone: '',
    isDefault: false
  });

  const openAddressModal = (address = null) => {
    if (address) {
      setEditingAddress(address);
      setAddressFormData({
        type: address.type || 'home',
        fullName: address.fullName || '',
        address: address.address || '',
        city: address.city || '',
        state: address.state || '',
        zipCode: address.zipCode || '',
        country: address.country || '',
        phone: address.phone || '',
        isDefault: address.isDefault || false
      });
    } else {
      setEditingAddress(null);
      setAddressFormData({
        type: 'home',
        fullName: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
        phone: '',
        isDefault: addresses.length === 0
      });
    }
    setIsAddressModalOpen(true);
  };

  const closeAddressModal = () => {
    setIsAddressModalOpen(false);
    setEditingAddress(null);
  };

  const handleAddressFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmitAddress = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://market-backend-getv.onrender.com';
      if (editingAddress) {
        await axios.put(`${apiUrl}/api/users/addresses/${editingAddress._id}`, addressFormData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Address updated successfully');
      } else {
        await axios.post(`${apiUrl}/api/users/addresses`, addressFormData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Address added successfully');
      }
      fetchUserData();
      closeAddressModal();
    } catch (error) {
      console.error('Error saving address:', error);
      toast.error(error.response?.data?.message || 'Failed to save address');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Are you sure you want to archive this delivery module?')) return;
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://market-backend-getv.onrender.com';
      await axios.delete(`${apiUrl}/api/users/addresses/${addressId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Address archived successfully');
      fetchUserData();
    } catch (error) {
      console.error('Error deleting address:', error);
      toast.error('Failed to delete address');
    }
  };

  // User stats from backend or calculated
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    totalSaved: 0,
    wishlistItems: 0,
    loyaltyPoints: 0
  });

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'orders', label: 'Orders', icon: <Package className="w-4 h-4" /> },
    { id: 'addresses', label: 'Addresses', icon: <MapPin className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> }
  ];

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchUserProfile();
    fetchUserData();
    fetchUserStats();
  }, [token, navigate]);

  const fetchUserProfile = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://market-backend-getv.onrender.com';
      const response = await axios.get(`${apiUrl}/api/users/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      dispatch(setUser({ user: response.data, token }));
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchUserData = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://market-backend-getv.onrender.com';
      const ordersResponse = await axios.get(`${apiUrl}/api/orders/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(ordersResponse.data || []);
      setLoadingOrders(false);

      const addressesResponse = await axios.get(`${apiUrl}/api/users/addresses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAddresses(addressesResponse.data || []);
      setLoadingAddresses(false);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setLoadingOrders(false);
      setLoadingAddresses(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://market-backend-getv.onrender.com';
      const response = await axios.get(`${apiUrl}/api/users/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data || stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://market-backend-getv.onrender.com';

      // 1. Update Profile Info (Name & Phone)
      const updateData = { name: profileForm.name, phone: profileForm.phone };
      const profileResponse = await axios.put(`${apiUrl}/api/users/profile`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update Redux state with new user info
      dispatch(setUser({ user: profileResponse.data, token }));

      // 2. Handle Password Change if requested
      if (profileForm.newPassword) {
        if (profileForm.newPassword !== profileForm.confirmPassword) {
          toast.error('New passwords do not match');
          setIsSaving(false);
          return;
        }

        await axios.put(`${apiUrl}/api/users/change-password`, {
          currentPassword: profileForm.currentPassword,
          newPassword: profileForm.newPassword
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Reset password fields
        setProfileForm(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
        toast.success('Identity and Password updated successfully');
      } else {
        toast.success('Identity protocols updated successfully');
      }
    } catch (err) {
      console.error('Update error:', err);
      toast.error(err.response?.data?.message || 'Update failed. Check your current access key.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[#1A1A1A]">
      <div className="h-28" /> {/* Navbar space */}

      <div className="max-w-6xl mx-auto px-6 pb-24">
        {/* Header section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 px-2">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center text-lg font-medium shadow-xl">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-medium tracking-tight">Bonjour, {user?.name ? user.name.split(' ')[0] : 'Member'}</h1>
                <p className="text-slate-500 text-sm font-light">Welcome back to your personal sanctuary.</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-400 mb-1">Loyalty Points</p>
              <p className="text-xl font-medium tracking-tight">{stats.loyaltyPoints} credits</p>
            </div>
            <div className="w-px h-10 bg-slate-100 mx-2 hidden sm:block" />
            <button
              onClick={() => dispatch(logout())}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-slate-100 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mb-12 border-b border-slate-100 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-8 py-4 text-[11px] font-bold uppercase tracking-widest transition-all relative ${activeTab === tab.id ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-400 hover:text-slate-600'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' ? (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-12 gap-12"
            >
              <div className="md:col-span-8 space-y-12">
                {/* Visual Stats Card */}
                <div className="relative h-[280px] rounded-[3rem] bg-gradient-to-br from-slate-900 to-slate-800 p-10 overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/5 blur-[100px] rounded-full -mr-48 -mt-48" />
                  <div className="relative z-10 h-full flex flex-col justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/50 mb-4">Total Portfolio Value</p>
                      <h2 className="text-5xl font-light text-white">
                        <CurrencyPrice price={stats.totalSpent} />
                      </h2>
                    </div>
                    <div className="flex items-end justify-between">
                      <div className="flex gap-10">
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-widest text-white/40 mb-1">Total Assets</p>
                          <p className="text-xl font-medium text-white">{orders.length}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-widest text-white/40 mb-1">Credits Saved</p>
                          <p className="text-xl font-medium text-white"><CurrencyPrice price={stats.totalSaved} /></p>
                        </div>
                      </div>
                      <button onClick={() => setActiveTab('orders')} className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-slate-900 transition-all duration-500">
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Recent Manifests */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between px-2">
                    <h3 className="text-xl font-medium tracking-tight">Recent Manifests</h3>
                    <button onClick={() => setActiveTab('orders')} className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900">View History</button>
                  </div>
                  <div className="space-y-4">
                    {orders.slice(0, 3).map((order) => (
                      <div key={order._id} className="p-4 rounded-[1.5rem] bg-white border border-slate-100 hover:border-slate-200 hover:shadow-lg transition-all duration-500 flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 group-hover:scale-105 transition-transform">
                            <Package className="w-4 h-4 text-slate-400" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-900 whitespace-nowrap">Order #{order.orderNumber}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">{formatDate(order.createdAt).split(' at ')[0]}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-10">
                          <div className="text-right hidden sm:block">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total</p>
                            <p className="text-sm font-bold text-slate-900"><CurrencyPrice price={order.total} /></p>
                          </div>
                          <Badge color={getStatusColor(order.status)}>{order.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="md:col-span-4 space-y-8">
                {/* Profile module info */}
                <div className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-6">Account Identity</h4>
                  <div className="space-y-5">
                    <div className="flex gap-4">
                      <div className="p-2 bg-white rounded-lg border border-slate-100">
                        <User className="w-4 h-4 text-slate-900" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Alias</p>
                        <p className="text-sm font-medium">{user?.name}</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="p-2 bg-white rounded-lg border border-slate-100">
                        <Mail className="w-4 h-4 text-slate-900" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Communication</p>
                        <p className="text-sm font-medium truncate max-w-[180px]">{user?.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="p-2 bg-white rounded-lg border border-slate-100">
                        <Phone className="w-4 h-4 text-slate-900" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Secure Link</p>
                        <p className="text-sm font-medium">{user?.phone || 'Not Configured'}</p>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setActiveTab('settings')} className="w-full mt-8 py-3 bg-white border border-slate-100 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all duration-500">
                    Modify Protocols
                  </button>
                </div>

                {/* Account Status section */}
                <div className="p-8 rounded-[2.5rem] border border-slate-100">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-6">Nexus Credentials</h4>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${user?.isEmailVerified ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      <p className="text-xs font-medium">{user?.isEmailVerified ? 'Email Link Verified' : 'Email Pending Verification'}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-slate-900" />
                      <p className="text-xs font-medium text-slate-950">Active Member</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-slate-200" />
                      <p className="text-xs font-medium text-slate-400">Since {user?.createdAt ? formatDate(user.createdAt).split(' ').slice(-1) : 'Launch'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : activeTab === 'orders' ? (
            <motion.div
              key="orders"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-10"
            >
              <div className="flex items-end justify-between px-2">
                <div>
                  <h1 className="text-3xl font-medium tracking-tight">Full Manifest History</h1>
                  <p className="text-slate-400 text-sm font-light mt-1">Detailed logs of all your procurement transactions.</p>
                </div>
                <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full border border-slate-100 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  <Clock className="w-3.5 h-3.5" /> Synchronized: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              {loadingOrders ? (
                <div className="space-y-6">
                  {[1, 2, 3].map(i => <div key={i} className="h-48 bg-slate-50 animate-pulse rounded-[2.5rem]" />)}
                </div>
              ) : orders.length > 0 ? (
                <div className="space-y-6">
                  {orders.map((order) => (
                    <div key={order._id} className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden hover:border-slate-200 hover:shadow-2xl transition-all duration-500 group">
                      <div className="p-8 md:p-10">
                        {/* Top: Info & Actions */}
                        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 mb-10">
                          <div className="flex items-start gap-6">
                            <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center shrink-0 shadow-lg group-hover:rotate-6 transition-transform">
                              <ShoppingBag className="w-7 h-7 text-white" />
                            </div>
                            <div>
                              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1.5">Manifest Identity</p>
                              <div className="flex items-center gap-3">
                                <h3 className="text-lg font-bold tracking-tight whitespace-nowrap">#{order.orderNumber}</h3>
                                <Badge color={getStatusColor(order.status)} size="md">{order.status}</Badge>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-3 xl:flex items-center gap-8 xl:gap-10">
                            <div className="text-right">
                              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Transmission Date</p>
                              <p className="text-sm font-medium">{formatDate(order.createdAt)}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Items Volume</p>
                              <p className="text-sm font-medium">{order.items.reduce((acc, item) => acc + item.quantity, 0)} Units</p>
                            </div>
                            <div className="flex gap-2 ml-auto">
                              <button
                                onClick={() => navigate(`/orders/${order._id}`)}
                                className="h-12 px-6 bg-slate-950 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg flex items-center gap-3"
                              >
                                Inspect Details
                                <ArrowRight className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Lower: Assets & Valuation */}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 pt-8 border-t border-slate-50">
                          <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-5">Manifest Assets</p>
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

                          <div className="border-l border-slate-50 pl-10 hidden md:block">
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-5">Destination Summary</p>
                            <div className="space-y-2">
                              <p className="text-sm font-bold text-slate-900">{order.shippingAddress?.fullName || 'Identity Secured'}</p>
                              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed max-w-[200px]">
                                {order.shippingAddress?.city}, {order.shippingAddress?.country}
                              </p>
                            </div>
                          </div>

                          <div className="xl:border-l xl:border-slate-50 xl:pl-10 flex flex-col justify-between items-end">
                            <div className="text-right">
                              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Total Valuation</p>
                              <p className="text-3xl font-bold tracking-tighter text-slate-900">
                                <CurrencyPrice price={order.total} />
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-32 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
                  <Package className="w-16 h-16 text-slate-300 mx-auto mb-6" />
                  <h2 className="text-2xl font-light tracking-tight mb-4 text-slate-400 italic font-serif">Your manifest history is empty.</h2>
                  <Button onClick={() => navigate('/products')} className="rounded-full px-12">Start Your First Manifest</Button>
                </div>
              )}
            </motion.div>
          ) : activeTab === 'addresses' ? (
            <motion.div
              key="addresses"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-10"
            >
              <div className="flex items-end justify-between px-2">
                <div>
                  <h1 className="text-3xl font-medium tracking-tight">Stored Modules</h1>
                  <p className="text-slate-400 text-sm font-light mt-1">Management of your global delivery coordinates.</p>
                </div>
                <Button
                  onClick={() => openAddressModal()}
                  className="rounded-full px-8 flex items-center gap-3 font-bold text-[10px] uppercase tracking-widest shadow-xl"
                >
                  <Plus className="w-4 h-4" /> Add Coordinates
                </Button>
              </div>

              {loadingAddresses ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {[1, 2].map(i => <div key={i} className="h-48 bg-slate-50 animate-pulse rounded-[2.5rem]" />)}
                </div>
              ) : addresses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {addresses.map((address, idx) => (
                    <div key={idx} className={`p-10 rounded-[3rem] border transition-all duration-500 relative group overflow-hidden ${address.isDefault ? 'border-slate-900 bg-white shadow-2xl scale-105 z-10' : 'border-slate-100 hover:border-slate-200'}`}>
                      {address.isDefault && (
                        <div className="absolute top-8 right-10">
                          <div className="px-5 py-2 bg-slate-900 text-white rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                            <CheckCircle2 className="w-3 h-3 text-primary-400" /> Primary
                          </div>
                        </div>
                      )}
                      <div className="bg-slate-50 w-14 h-14 rounded-2xl flex items-center justify-center border border-slate-100 mb-8 group-hover:rotate-6 transition-transform">
                        <MapPin className={`w-6 h-6 ${address.isDefault ? 'text-slate-900' : 'text-slate-400'}`} />
                      </div>
                      <h3 className="text-xl font-medium text-slate-950 mb-3">{address.fullName}</h3>
                      <p className="text-sm text-slate-500 font-light leading-relaxed mb-10 max-w-[240px]">
                        {address.address}<br />
                        {address.city}, {address.state} {address.zipCode}<br />
                        {address.country}
                      </p>
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => openAddressModal(address)}
                          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-800 hover:text-black transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Modify
                        </button>
                        <div className="w-px h-3 bg-slate-200" />
                        <button
                          onClick={() => handleDeleteAddress(address._id)}
                          className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-600 transition-colors"
                        >
                          Archive
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-32 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
                  <MapPin className="w-16 h-16 text-slate-300 mx-auto mb-6" />
                  <h2 className="text-2xl font-light tracking-tight mb-4 text-slate-400 italic font-serif">No stored modules detected.</h2>
                  <Button onClick={() => openAddressModal()} className="rounded-full px-12">Initialize Location Module</Button>
                </div>
              )}


              {/* Address Management Modal */}
              <Modal
                isOpen={isAddressModalOpen}
                onClose={closeAddressModal}
                title={editingAddress ? "Modify Delivery Module" : "Initialize New Module"}
                size="2xl"
              >
                <form onSubmit={handleSubmitAddress} className="space-y-6 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Identity Name</label>
                      <Input
                        name="fullName"
                        value={addressFormData.fullName}
                        onChange={handleAddressFormChange}
                        placeholder="Full Name"
                        required
                        className="rounded-2xl border-slate-100 bg-slate-50/50"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Relay Number</label>
                      <Input
                        name="phone"
                        value={addressFormData.phone}
                        onChange={handleAddressFormChange}
                        placeholder="Phone"
                        required
                        className="rounded-2xl border-slate-100 bg-slate-50/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Primary Coordinates (Address)</label>
                    <Input
                      name="address"
                      value={addressFormData.address}
                      onChange={handleAddressFormChange}
                      placeholder="Street Address"
                      required
                      className="rounded-2xl border-slate-100 bg-slate-50/50"
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="col-span-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sector (City)</label>
                      <Input
                        name="city"
                        value={addressFormData.city}
                        onChange={handleAddressFormChange}
                        placeholder="City"
                        required
                        className="rounded-2xl border-slate-100 bg-slate-50/50"
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Zone (State)</label>
                      <Input
                        name="state"
                        value={addressFormData.state}
                        onChange={handleAddressFormChange}
                        placeholder="State"
                        required
                        className="rounded-2xl border-slate-100 bg-slate-50/50"
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Grid (Zip)</label>
                      <Input
                        name="zipCode"
                        value={addressFormData.zipCode}
                        onChange={handleAddressFormChange}
                        placeholder="Zip"
                        required
                        className="rounded-2xl border-slate-100 bg-slate-50/50"
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Region</label>
                      <Input
                        name="country"
                        value={addressFormData.country}
                        onChange={handleAddressFormChange}
                        placeholder="Country"
                        required
                        className="rounded-2xl border-slate-100 bg-slate-50/50"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <input
                      type="checkbox"
                      id="isDefault"
                      name="isDefault"
                      checked={addressFormData.isDefault}
                      onChange={handleAddressFormChange}
                      className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                    />
                    <label htmlFor="isDefault" className="text-xs font-medium text-slate-600">Designate as primary delivery module</label>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={closeAddressModal}
                      className="flex-1 rounded-2xl h-12"
                    >
                      Abort
                    </Button>
                    <Button
                      type="submit"
                      loading={isSaving}
                      className="flex-1 rounded-2xl h-12 shadow-xl"
                    >
                      Commit Coordinates
                    </Button>
                  </div>
                </form>
              </Modal>

            </motion.div>
          ) : activeTab === 'settings' ? (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-4xl mx-auto space-y-16"
            >
              <div className="text-center">
                <h1 className="text-3xl font-medium tracking-tight">Core Protocols</h1>
                <p className="text-slate-400 text-sm font-light mt-2 italic font-serif">Profile configuration and high-level security settings.</p>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-12">
                {/* Visual grouping: Identity */}
                <div className="p-10 rounded-[3rem] bg-white border border-slate-100 shadow-premium">
                  <div className="flex items-center gap-4 mb-10">
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <Shield className="w-5 h-5 text-slate-900" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">Identity Module</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Base protocols</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <Input
                      label="Public Alias"
                      name="name"
                      value={profileForm.name}
                      onChange={handleProfileChange}
                      required
                      placeholder="Enter your name"
                      className="rounded-2xl border-slate-100 bg-slate-50/50"
                    />
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Core Link (Email)</label>
                      <div className="h-12 w-full bg-slate-100/50 rounded-2xl flex items-center px-4 border border-slate-100 text-slate-400 text-sm font-medium">
                        {profileForm.email}
                        <Lock className="w-3.5 h-3.5 ml-auto opacity-50" />
                      </div>
                    </div>
                    <Input
                      label="Emergency Relay (Phone)"
                      name="phone"
                      value={profileForm.phone}
                      onChange={handleProfileChange}
                      placeholder="+91 XXXXX XXXXX"
                      className="rounded-2xl border-slate-100 bg-slate-50/50"
                    />
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Valuation Display</label>
                      <div className="h-12 w-full bg-white rounded-2xl flex items-center justify-between px-4 border border-slate-100">
                        <p className="text-xs font-bold text-slate-400 uppercase">Currency Select</p>
                        <CurrencySwitcher />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Visual grouping: Security */}
                <div className="p-10 rounded-[3rem] bg-white border border-slate-100 shadow-premium">
                  <div className="flex items-center gap-4 mb-10">
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <Lock className="w-5 h-5 text-slate-900" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">Access Credentials</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Security Update</p>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <Input
                      label="Current Access Key"
                      name="currentPassword"
                      type="password"
                      value={profileForm.currentPassword}
                      onChange={handleProfileChange}
                      placeholder="Enter current password to initiate update"
                      className="rounded-2xl border-slate-100 bg-slate-50/50"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <Input
                        label="Deploy New Key"
                        name="newPassword"
                        type="password"
                        value={profileForm.newPassword}
                        onChange={handleProfileChange}
                        placeholder="At least 8 characters"
                        className="rounded-2xl border-slate-100 bg-slate-50/50"
                      />
                      <Input
                        label="Validate New Key"
                        name="confirmPassword"
                        type="password"
                        value={profileForm.confirmPassword}
                        onChange={handleProfileChange}
                        placeholder="Repeat new password"
                        className="rounded-2xl border-slate-100 bg-slate-50/50"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-6 pt-4">
                  <Button
                    type="submit"
                    disabled={isSaving}
                    loading={isSaving}
                    className="h-16 px-16 rounded-full font-black text-xs uppercase tracking-[0.2em] shadow-2xl bg-slate-900 text-white hover:bg-black transition-all"
                  >
                    {profileForm.newPassword ? 'Update Identity & Password' : 'Save Protocol Changes'}
                  </Button>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">All protocol updates are immediate across the Nexus mesh.</p>
                </div>
              </form>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Address Management Modal */}
        <Modal
          isOpen={isAddressModalOpen}
          onClose={closeAddressModal}
          title={editingAddress ? "Modify Delivery Module" : "Initialize New Module"}
          size="2xl"
        >
          <form onSubmit={handleSubmitAddress} className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Identity Name</label>
                <Input
                  name="fullName"
                  value={addressFormData.fullName}
                  onChange={handleAddressFormChange}
                  placeholder="Full Name"
                  required
                  className="rounded-2xl border-slate-100 bg-slate-50/50"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Relay Number</label>
                <Input
                  name="phone"
                  value={addressFormData.phone}
                  onChange={handleAddressFormChange}
                  placeholder="Phone"
                  required
                  className="rounded-2xl border-slate-100 bg-slate-50/50"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Primary Coordinates (Address)</label>
              <Input
                name="address"
                value={addressFormData.address}
                onChange={handleAddressFormChange}
                placeholder="Street Address"
                required
                className="rounded-2xl border-slate-100 bg-slate-50/50"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="col-span-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sector (City)</label>
                <Input
                  name="city"
                  value={addressFormData.city}
                  onChange={handleAddressFormChange}
                  placeholder="City"
                  required
                  className="rounded-2xl border-slate-100 bg-slate-50/50"
                />
              </div>
              <div className="col-span-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Zone (State)</label>
                <Input
                  name="state"
                  value={addressFormData.state}
                  onChange={handleAddressFormChange}
                  placeholder="State"
                  required
                  className="rounded-2xl border-slate-100 bg-slate-50/50"
                />
              </div>
              <div className="col-span-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Grid (Zip)</label>
                <Input
                  name="zipCode"
                  value={addressFormData.zipCode}
                  onChange={handleAddressFormChange}
                  placeholder="Zip"
                  required
                  className="rounded-2xl border-slate-100 bg-slate-50/50"
                />
              </div>
              <div className="col-span-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Region</label>
                <Input
                  name="country"
                  value={addressFormData.country}
                  onChange={handleAddressFormChange}
                  placeholder="Country"
                  required
                  className="rounded-2xl border-slate-100 bg-slate-50/50"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <input
                type="checkbox"
                id="isDefault"
                name="isDefault"
                checked={addressFormData.isDefault}
                onChange={handleAddressFormChange}
                className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
              />
              <label htmlFor="isDefault" className="text-xs font-medium text-slate-600">Designate as primary delivery module</label>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={closeAddressModal}
                className="flex-1 rounded-2xl h-12"
              >
                Abort
              </Button>
              <Button
                type="submit"
                loading={isSaving}
                className="flex-1 rounded-2xl h-12 shadow-xl"
              >
                Commit Coordinates
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};

export default Profile;