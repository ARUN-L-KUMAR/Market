import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import socket from '../utils/socket';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';
import CurrencyPrice from '../components/CurrencyPrice';
import {
  User,
  Package,
  MapPin,
  Settings,
  Edit3,
  Save,
  Eye,
  EyeOff,
  Phone,
  Mail,
  Lock,
  CheckCircle,
  XCircle,
  Calendar,
  Star,
  TrendingUp,
  Heart,
  ShoppingBag,
  CreditCard,
  Truck,
  ArrowRight,
  Shield,
  Award,
  Gift
} from 'lucide-react';

const Profile = () => {
  const { info, token } = useSelector(state => state.user);
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  const [profileForm, setProfileForm] = useState({
    name: info?.name || '',
    email: info?.email || '',
    phone: info?.phone || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [profileErrors, setProfileErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // User stats
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    totalSaved: 0,
    wishlistItems: 0,
    loyaltyPoints: 0
  });

  // Tab configurations
  const tabs = [
    { id: 'overview', label: 'Overview', icon: <User className="w-5 h-5" /> },
    { id: 'orders', label: 'Orders', icon: <Package className="w-5 h-5" /> },
    { id: 'addresses', label: 'Addresses', icon: <MapPin className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> }
  ];
  
  // Load user data and stats
  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    
    fetchUserData();
    fetchUserStats();
  }, [token, navigate]);

  const fetchUserData = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      
      // Fetch orders
      const ordersResponse = await axios.get(`${apiUrl}/api/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(ordersResponse.data || []);
      setLoadingOrders(false);
      
      // Fetch addresses
      const addressesResponse = await axios.get(`${apiUrl}/api/users/addresses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAddresses(addressesResponse.data || []);
      setLoadingAddresses(false);
      
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Failed to load user data');
      setLoadingOrders(false);
      setLoadingAddresses(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await axios.get(`${apiUrl}/api/users/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setStats(response.data || {
        totalOrders: 0,
        totalSpent: 0,
        totalSaved: 0,
        wishlistItems: 0,
        loyaltyPoints: 0
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };
  
  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoadingOrders(true);
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const response = await axios.get(`${apiUrl}/api/orders/my`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setOrders(response.data);
        setLoadingOrders(false);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load your orders. Please try again.');
        setLoadingOrders(false);
      }
    };
    
    if (activeTab === 'orders') {
      fetchOrders();
    }
    
    // Real-time order updates
    const handleOrderUpdate = (data) => {
      if (data.order && data.order.user === info?._id) {
        setOrders(prevOrders => {
          const updatedOrders = [...prevOrders];
          const index = updatedOrders.findIndex(order => order._id === data.order._id);
          
          if (index !== -1) {
            updatedOrders[index] = data.order;
          }
          
          return updatedOrders;
        });
        
        // Show toast notification
        const event = new CustomEvent('show-toast', { 
          detail: { 
            message: `Order #${data.order.orderNumber} updated to ${data.order.status}`, 
            type: 'info' 
          }
        });
        window.dispatchEvent(event);
      }
    };
    
    socket.on('orderUpdated', handleOrderUpdate);
    
    return () => {
      socket.off('orderUpdated', handleOrderUpdate);
    };
  }, [token, activeTab, info?._id]);
  
  // Fetch addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        setLoadingAddresses(true);
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const response = await axios.get(`${apiUrl}/api/users/addresses`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setAddresses(response.data || []);
        setLoadingAddresses(false);
      } catch (err) {
        console.error('Error fetching addresses:', err);
        setError('Failed to load your addresses. Please try again.');
        setLoadingAddresses(false);
      }
    };
    
    if (activeTab === 'addresses') {
      fetchAddresses();
    }
  }, [token, activeTab]);
  
  // Handle form changes
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm({
      ...profileForm,
      [name]: value
    });
    
    setProfileErrors({
      ...profileErrors,
      [name]: ''
    });
  };
  
  // Validate profile form
  const validateProfileForm = () => {
    const errors = {};
    
    if (!profileForm.name.trim()) errors.name = 'Name is required';
    
    if (profileForm.newPassword || profileForm.confirmPassword) {
      if (!profileForm.currentPassword) errors.currentPassword = 'Current password is required';
      if (profileForm.newPassword.length < 6) errors.newPassword = 'New password must be at least 6 characters';
      if (profileForm.newPassword !== profileForm.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    }
    
    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Save profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    
    if (!validateProfileForm()) return;
    
    try {
      setIsSaving(true);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      
      // Prepare data
      const updateData = {
        name: profileForm.name,
        phone: profileForm.phone
      };
      
      // Add password data if changing password
      if (profileForm.newPassword && profileForm.currentPassword) {
        updateData.currentPassword = profileForm.currentPassword;
        updateData.newPassword = profileForm.newPassword;
      }
      
      await axios.patch(`${apiUrl}/api/users/profile`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Show success toast
      const event = new CustomEvent('show-toast', { 
        detail: { message: 'Profile updated successfully', type: 'success' }
      });
      window.dispatchEvent(event);
      
      // Clear password fields
      setProfileForm({
        ...profileForm,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setIsSaving(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      
      const errorMessage = err.response?.data?.message || 'Failed to update profile';
      
      // Show error toast
      const event = new CustomEvent('show-toast', { 
        detail: { message: errorMessage, type: 'error' }
      });
      window.dispatchEvent(event);
      
      setIsSaving(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 pt-20">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-4xl lg:text-5xl font-black leading-tight bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent mb-4">
            My Account
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">Manage your account settings and preferences</p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="md:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6 sticky top-24"
            >
              {/* User info */}
              <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-gray-200">
                <div className="h-16 w-16 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg">
                  {info?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <h2 className="font-bold text-gray-800 text-lg">{info?.name}</h2>
                  <p className="text-gray-500 text-sm">{info?.email}</p>
                </div>
              </div>
            
            {/* Navigation */}
            <nav>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${activeTab === 'orders' ? 'bg-primary-100 text-primary-800 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
                  >
                    Orders
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('addresses')}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${activeTab === 'addresses' ? 'bg-primary-100 text-primary-800 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
                  >
                    Addresses
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${activeTab === 'profile' ? 'bg-primary-100 text-primary-800 font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
                  >
                    Profile Settings
                  </button>
                </li>
              </ul>
            </nav>
          </motion.div>
        </aside>
        
        {/* Main content */}
        <div className="md:col-span-3">
          {/* Orders tab */}
          {activeTab === 'orders' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6">
                <h2 className="text-2xl font-bold flex items-center">
                  <Package className="w-6 h-6 mr-3" />
                  Order History
                </h2>
                <p className="text-purple-100 mt-2">Track all your orders and their status</p>
              </div>
              
              {loadingOrders ? (
                <div className="p-6 animate-pulse space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-24 bg-gray-200 rounded"></div>
                  ))}
                </div>
              ) : orders.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {orders.map(order => (
                    <div key={order._id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-wrap justify-between items-center mb-4">
                        <div>
                          <p className="font-semibold text-gray-800">Order #{order.orderNumber}</p>
                          <p className="text-gray-500 text-sm">Placed on {formatDate(order.createdAt)}</p>
                        </div>
                        <Badge color={getStatusColor(order.status)}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="text-gray-800">
                          {order.items.length} item{order.items.length !== 1 ? 's' : ''} · 
                          <span className="font-semibold ml-2"><CurrencyPrice price={order.total} /></span>
                        </div>
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/order-confirmation/${order._id}`)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <div className="h-16 w-16 mx-auto mb-4 text-gray-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No orders yet</h3>
                  <p className="text-gray-500 mb-6">You haven't placed any orders yet.</p>
                  <Button onClick={() => navigate('/products')}>
                    Start Shopping
                  </Button>
                </div>
              )}
            </motion.div>
          )}
          
          {/* Addresses tab */}
          {activeTab === 'addresses' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-6">
                <h2 className="text-2xl font-bold flex items-center">
                  <MapPin className="w-6 h-6 mr-3" />
                  Saved Addresses
                </h2>
                <p className="text-blue-100 mt-2">Manage your delivery addresses</p>
              </div>
              
              {loadingAddresses ? (
                <div className="p-6 animate-pulse space-y-4">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="h-32 bg-gray-200 rounded"></div>
                  ))}
                </div>
              ) : addresses.length > 0 ? (
                <div className="p-6 grid gap-4 sm:grid-cols-2">
                  {addresses.map((address, index) => (
                    <div 
                      key={index} 
                      className="border rounded-lg p-4 relative"
                    >
                      {address.isDefault && (
                        <span className="absolute right-2 top-2 bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded">
                          Default
                        </span>
                      )}
                      <p className="font-semibold">{address.fullName}</p>
                      <p className="text-gray-600 text-sm mt-1">{address.address}</p>
                      <p className="text-gray-600 text-sm">
                        {address.city}, {address.state} {address.zipCode}
                      </p>
                      <p className="text-gray-600 text-sm">{address.country}</p>
                      {address.phone && (
                        <p className="text-gray-600 text-sm mt-1">{address.phone}</p>
                      )}
                      
                      <div className="mt-4 flex space-x-2">
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        {!address.isDefault && (
                          <Button variant="outline" size="sm">
                            Set as Default
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  <div className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center text-center h-full min-h-[160px]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <p className="text-gray-600 mb-4">Add a new address</p>
                    <Button>
                      Add Address
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center">
                  <div className="h-16 w-16 mx-auto mb-4 text-gray-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No addresses saved</h3>
                  <p className="text-gray-500 mb-6">Add an address for faster checkout.</p>
                  <Button>
                    Add New Address
                  </Button>
                </div>
              )}
            </motion.div>
          )}
          
          {/* Profile tab */}
          {activeTab === 'profile' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white p-6">
                <h2 className="text-2xl font-bold flex items-center">
                  <Settings className="w-6 h-6 mr-3" />
                  Profile Settings
                </h2>
                <p className="text-green-100 mt-2">Update your account information</p>
              </div>
              
              <form onSubmit={handleSaveProfile} className="p-6">
                <div className="space-y-6">
                  <Input
                    label="Full Name"
                    name="name"
                    value={profileForm.name}
                    onChange={handleProfileChange}
                    error={profileErrors.name}
                    required
                  />
                  
                  <Input
                    label="Email Address"
                    name="email"
                    value={profileForm.email}
                    disabled
                    helperText="Email address cannot be changed"
                  />
                  
                  <Input
                    label="Phone Number"
                    name="phone"
                    value={profileForm.phone}
                    onChange={handleProfileChange}
                    error={profileErrors.phone}
                  />
                  
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold mb-4">Change Password</h3>
                    <Input
                      label="Current Password"
                      name="currentPassword"
                      type="password"
                      value={profileForm.currentPassword}
                      onChange={handleProfileChange}
                      error={profileErrors.currentPassword}
                    />
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                      <Input
                        label="New Password"
                        name="newPassword"
                        type="password"
                        value={profileForm.newPassword}
                        onChange={handleProfileChange}
                        error={profileErrors.newPassword}
                        helperText="At least 6 characters"
                      />
                      <Input
                        label="Confirm New Password"
                        name="confirmPassword"
                        type="password"
                        value={profileForm.confirmPassword}
                        onChange={handleProfileChange}
                        error={profileErrors.confirmPassword}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end pt-4">
                    <Button
                      type="submit"
                      loading={isSaving}
                      disabled={isSaving}
                    >
                      Save Changes
                    </Button>
                  </div>
                </div>
              </form>
            </motion.div>
          )}
        </div>        </div>
      </div>
    </div>
  );
};

export default Profile;