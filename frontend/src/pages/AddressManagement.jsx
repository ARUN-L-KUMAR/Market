import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { 
  MapPin, 
  Plus, 
  Edit3, 
  Trash2, 
  Home, 
  Building2, 
  CheckCircle,
  ArrowLeft
} from 'lucide-react';

const AddressManagement = () => {
  const { token } = useSelector(state => state.user);
  const navigate = useNavigate();
  
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  
  const [formData, setFormData] = useState({
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
  
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchAddresses();
  }, [token, navigate]);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await axios.get(`${apiUrl}/api/users/addresses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAddresses(response.data || []);
    } catch (error) {
      console.error('Error fetching addresses:', error);
      const event = new CustomEvent('show-toast', { 
        detail: { message: 'Failed to load addresses', type: 'error' }
      });
      window.dispatchEvent(event);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State/Province is required';
    if (!formData.zipCode.trim()) newErrors.zipCode = 'ZIP/Postal code is required';
    if (!formData.country.trim()) newErrors.country = 'Country is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setSaving(true);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      
      if (editingAddress) {
        // Update existing address
        await axios.put(`${apiUrl}/api/users/addresses/${editingAddress._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const event = new CustomEvent('show-toast', { 
          detail: { message: 'Address updated successfully', type: 'success' }
        });
        window.dispatchEvent(event);
      } else {
        // Create new address
        await axios.post(`${apiUrl}/api/users/addresses`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const event = new CustomEvent('show-toast', { 
          detail: { message: 'Address added successfully', type: 'success' }
        });
        window.dispatchEvent(event);
      }
      
      // Reset form and refresh addresses
      resetForm();
      fetchAddresses();
    } catch (error) {
      console.error('Error saving address:', error);
      const event = new CustomEvent('show-toast', { 
        detail: { message: 'Failed to save address', type: 'error' }
      });
      window.dispatchEvent(event);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (address) => {
    setEditingAddress(address);
    setFormData({
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
    setShowForm(true);
  };

  const handleDelete = async (addressId) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      await axios.delete(`${apiUrl}/api/users/addresses/${addressId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const event = new CustomEvent('show-toast', { 
        detail: { message: 'Address deleted successfully', type: 'success' }
      });
      window.dispatchEvent(event);
      
      fetchAddresses();
    } catch (error) {
      console.error('Error deleting address:', error);
      const event = new CustomEvent('show-toast', { 
        detail: { message: 'Failed to delete address', type: 'error' }
      });
      window.dispatchEvent(event);
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      await axios.put(`${apiUrl}/api/users/addresses/${addressId}`, { isDefault: true }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const event = new CustomEvent('show-toast', { 
        detail: { message: 'Default address updated', type: 'success' }
      });
      window.dispatchEvent(event);
      
      fetchAddresses();
    } catch (error) {
      console.error('Error setting default address:', error);
      const event = new CustomEvent('show-toast', { 
        detail: { message: 'Failed to update default address', type: 'error' }
      });
      window.dispatchEvent(event);
    }
  };

  const resetForm = () => {
    setFormData({
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
    setEditingAddress(null);
    setShowForm(false);
    setErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 pt-20">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center mb-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/profile')}
              className="flex items-center text-gray-600 hover:text-purple-600 transition-colors mr-4"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Profile
            </motion.button>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black leading-tight bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent mb-4">
            Address Management
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">Manage your shipping and billing addresses</p>
        </motion.div>        {/* Add New Address Button */}
        {!showForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <Button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add New Address
            </Button>
          </motion.div>
        )}

      {/* Address Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-subtle border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">
              {editingAddress ? 'Edit Address' : 'Add New Address'}
            </h2>
            <Button variant="outline" onClick={resetForm}>
              Cancel
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Address Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="home">Home</option>
                <option value="work">Work</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Full Name"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                error={errors.fullName}
                required
              />
              <Input
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                error={errors.phone}
                required
              />
            </div>

            {/* Address */}
            <Input
              label="Street Address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              error={errors.address}
              required
            />

            {/* Location Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input
                label="City"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                error={errors.city}
                required
              />
              <Input
                label="State/Province"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                error={errors.state}
                required
              />
              <Input
                label="ZIP/Postal Code"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleInputChange}
                error={errors.zipCode}
                required
              />
            </div>

            <Input
              label="Country"
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              error={errors.country}
              required
            />

            {/* Default Address Checkbox */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isDefault"
                name="isDefault"
                checked={formData.isDefault}
                onChange={handleInputChange}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="isDefault" className="ml-2 text-sm text-gray-700">
                Set as default address
              </label>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button
                type="submit"
                loading={saving}
                disabled={saving}
                className="flex-1"
              >
                {editingAddress ? 'Update Address' : 'Save Address'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Addresses List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-800">Saved Addresses</h2>
        
        {addresses.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-subtle border border-gray-200 p-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Addresses Saved</h3>
            <p className="text-gray-500 mb-6">
              Add your first address to make checkout faster and easier.
            </p>
            <Button onClick={() => setShowForm(true)}>
              Add Your First Address
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {addresses.map((address) => (
              <div
                key={address._id}
                className={`bg-white rounded-2xl shadow-subtle border p-6 ${
                  address.isDefault ? 'border-primary-300 bg-primary-50' : 'border-gray-200'
                }`}
              >
                {/* Address Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium capitalize px-2 py-1 bg-gray-100 text-gray-700 rounded">
                      {address.type}
                    </span>
                    {address.isDefault && (
                      <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(address)}
                      className="text-sm text-primary-600 hover:text-primary-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(address._id)}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Address Details */}
                <div className="text-sm text-gray-600 space-y-1">
                  <p className="font-medium text-gray-800">{address.fullName}</p>
                  <p>{address.address}</p>
                  <p>{address.city}, {address.state} {address.zipCode}</p>
                  <p>{address.country}</p>
                  <p className="mt-2">Phone: {address.phone}</p>
                </div>

                {/* Set Default Button */}
                {!address.isDefault && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetDefault(address._id)}
                    className="mt-4 w-full"
                  >
                    Set as Default
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default AddressManagement;
