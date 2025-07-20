import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { getSettings, updateSettings } from '../../services/adminService';

const Settings = () => {
  const [settings, setSettings] = useState({
    storeName: '',
    storeEmail: '',
    storePhone: '',
    storeAddress: '',
    currency: 'USD',
    taxRate: 0,
    shippingFee: 0,
    freeShippingThreshold: 0,
    enableGuestCheckout: true,
    enableReviews: true,
    enableWishlist: true,
    enableRealTimeUpdates: true,
    maintenanceMode: false,
    logo: '',
    favicon: '',
    socialLinks: {
      facebook: '',
      twitter: '',
      instagram: '',
      youtube: ''
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState('general');
  
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const response = await getSettings();
        setSettings(response.data);
      } catch (error) {
        console.error('Error fetching settings:', error);
        setError('Failed to load settings. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, []);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setSettings(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };
  
  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      await updateSettings(settings);
      setSuccess('Settings updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error) {
      console.error('Error updating settings:', error);
      setError('Failed to update settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  
  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'shipping', label: 'Shipping & Tax' },
    { id: 'features', label: 'Features' },
    { id: 'appearance', label: 'Appearance' },
    { id: 'social', label: 'Social Media' }
  ];
  
  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Store Settings</h1>
        </div>
        
        {/* Error and success messages */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}
        
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
                <div className="md:grid md:grid-cols-3 md:gap-6">
                  <div className="md:col-span-1">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Store Information</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Basic information about your store.
                    </p>
                  </div>
                  <div className="mt-5 md:mt-0 md:col-span-2">
                    <div className="grid grid-cols-6 gap-6">
                      <div className="col-span-6 sm:col-span-4">
                        <label htmlFor="storeName" className="block text-sm font-medium text-gray-700">Store Name</label>
                        <input
                          type="text"
                          name="storeName"
                          id="storeName"
                          value={settings.storeName}
                          onChange={handleChange}
                          className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                      
                      <div className="col-span-6 sm:col-span-4">
                        <label htmlFor="storeEmail" className="block text-sm font-medium text-gray-700">Email Address</label>
                        <input
                          type="email"
                          name="storeEmail"
                          id="storeEmail"
                          value={settings.storeEmail}
                          onChange={handleChange}
                          className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                      
                      <div className="col-span-6 sm:col-span-4">
                        <label htmlFor="storePhone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                        <input
                          type="text"
                          name="storePhone"
                          id="storePhone"
                          value={settings.storePhone}
                          onChange={handleChange}
                          className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                      
                      <div className="col-span-6">
                        <label htmlFor="storeAddress" className="block text-sm font-medium text-gray-700">Address</label>
                        <textarea
                          name="storeAddress"
                          id="storeAddress"
                          rows="3"
                          value={settings.storeAddress}
                          onChange={handleChange}
                          className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        ></textarea>
                      </div>
                      
                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor="currency" className="block text-sm font-medium text-gray-700">Currency</label>
                        <select
                          id="currency"
                          name="currency"
                          value={settings.currency}
                          onChange={handleChange}
                          className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        >
                          <option value="USD">USD - US Dollar</option>
                          <option value="EUR">EUR - Euro</option>
                          <option value="GBP">GBP - British Pound</option>
                          <option value="JPY">JPY - Japanese Yen</option>
                          <option value="CAD">CAD - Canadian Dollar</option>
                          <option value="AUD">AUD - Australian Dollar</option>
                          <option value="INR">INR - Indian Rupee</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Shipping & Tax Settings */}
          {activeTab === 'shipping' && (
            <div className="space-y-6">
              <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
                <div className="md:grid md:grid-cols-3 md:gap-6">
                  <div className="md:col-span-1">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Shipping & Tax</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Configure shipping and tax settings for your store.
                    </p>
                  </div>
                  <div className="mt-5 md:mt-0 md:col-span-2">
                    <div className="grid grid-cols-6 gap-6">
                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor="taxRate" className="block text-sm font-medium text-gray-700">Tax Rate (%)</label>
                        <input
                          type="number"
                          name="taxRate"
                          id="taxRate"
                          min="0"
                          step="0.01"
                          value={settings.taxRate}
                          onChange={handleNumberChange}
                          className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                      
                      <div className="col-span-6 sm:col-span-3">
                        <label htmlFor="shippingFee" className="block text-sm font-medium text-gray-700">Default Shipping Fee</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">
                              {settings.currency === 'USD' ? '$' : settings.currency + ' '}
                            </span>
                          </div>
                          <input
                            type="number"
                            name="shippingFee"
                            id="shippingFee"
                            min="0"
                            step="0.01"
                            value={settings.shippingFee}
                            onChange={handleNumberChange}
                            className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-7 sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>
                      </div>
                      
                      <div className="col-span-6 sm:col-span-4">
                        <label htmlFor="freeShippingThreshold" className="block text-sm font-medium text-gray-700">Free Shipping Threshold</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">
                              {settings.currency === 'USD' ? '$' : settings.currency + ' '}
                            </span>
                          </div>
                          <input
                            type="number"
                            name="freeShippingThreshold"
                            id="freeShippingThreshold"
                            min="0"
                            step="0.01"
                            value={settings.freeShippingThreshold}
                            onChange={handleNumberChange}
                            className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-7 sm:text-sm border-gray-300 rounded-md"
                          />
                          <div className="mt-1 text-sm text-gray-500">Set to 0 to disable free shipping</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Features Settings */}
          {activeTab === 'features' && (
            <div className="space-y-6">
              <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
                <div className="md:grid md:grid-cols-3 md:gap-6">
                  <div className="md:col-span-1">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Features</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Enable or disable store features.
                    </p>
                  </div>
                  <div className="mt-5 md:mt-0 md:col-span-2">
                    <div className="space-y-6">
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="enableGuestCheckout"
                            name="enableGuestCheckout"
                            type="checkbox"
                            checked={settings.enableGuestCheckout}
                            onChange={handleChange}
                            className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="enableGuestCheckout" className="font-medium text-gray-700">Enable Guest Checkout</label>
                          <p className="text-gray-500">Allow customers to checkout without creating an account.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="enableReviews"
                            name="enableReviews"
                            type="checkbox"
                            checked={settings.enableReviews}
                            onChange={handleChange}
                            className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="enableReviews" className="font-medium text-gray-700">Enable Product Reviews</label>
                          <p className="text-gray-500">Allow customers to leave reviews on products.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="enableWishlist"
                            name="enableWishlist"
                            type="checkbox"
                            checked={settings.enableWishlist}
                            onChange={handleChange}
                            className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="enableWishlist" className="font-medium text-gray-700">Enable Wishlist</label>
                          <p className="text-gray-500">Allow customers to save products to a wishlist.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="enableRealTimeUpdates"
                            name="enableRealTimeUpdates"
                            type="checkbox"
                            checked={settings.enableRealTimeUpdates}
                            onChange={handleChange}
                            className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="enableRealTimeUpdates" className="font-medium text-gray-700">Enable Real-time Updates</label>
                          <p className="text-gray-500">Show real-time inventory and order updates to customers.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="maintenanceMode"
                            name="maintenanceMode"
                            type="checkbox"
                            checked={settings.maintenanceMode}
                            onChange={handleChange}
                            className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="maintenanceMode" className="font-medium text-gray-700">Maintenance Mode</label>
                          <p className="text-gray-500">Put the store in maintenance mode. Only admins can access the site.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Appearance Settings */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
                <div className="md:grid md:grid-cols-3 md:gap-6">
                  <div className="md:col-span-1">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Appearance</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Customize the look and feel of your store.
                    </p>
                  </div>
                  <div className="mt-5 md:mt-0 md:col-span-2">
                    <div className="grid grid-cols-6 gap-6">
                      <div className="col-span-6">
                        <label className="block text-sm font-medium text-gray-700">Store Logo</label>
                        <div className="mt-1 flex items-center">
                          {settings.logo ? (
                            <div className="mr-4">
                              <img src={settings.logo} alt="Store Logo" className="h-12 w-auto" />
                            </div>
                          ) : (
                            <div className="mr-4 flex items-center justify-center h-12 w-12 rounded-md bg-gray-100 text-gray-300">
                              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                          <input
                            type="text"
                            name="logo"
                            id="logo"
                            value={settings.logo}
                            onChange={handleChange}
                            className="focus:ring-primary-500 focus:border-primary-500 flex-1 block w-full rounded-md sm:text-sm border-gray-300"
                            placeholder="Enter logo URL"
                          />
                        </div>
                      </div>
                      
                      <div className="col-span-6">
                        <label className="block text-sm font-medium text-gray-700">Favicon</label>
                        <div className="mt-1 flex items-center">
                          {settings.favicon ? (
                            <div className="mr-4">
                              <img src={settings.favicon} alt="Favicon" className="h-8 w-8" />
                            </div>
                          ) : (
                            <div className="mr-4 flex items-center justify-center h-8 w-8 rounded-md bg-gray-100 text-gray-300">
                              <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                          <input
                            type="text"
                            name="favicon"
                            id="favicon"
                            value={settings.favicon}
                            onChange={handleChange}
                            className="focus:ring-primary-500 focus:border-primary-500 flex-1 block w-full rounded-md sm:text-sm border-gray-300"
                            placeholder="Enter favicon URL"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Social Media Settings */}
          {activeTab === 'social' && (
            <div className="space-y-6">
              <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
                <div className="md:grid md:grid-cols-3 md:gap-6">
                  <div className="md:col-span-1">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Social Media</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Connect your store to social media platforms.
                    </p>
                  </div>
                  <div className="mt-5 md:mt-0 md:col-span-2">
                    <div className="grid grid-cols-6 gap-6">
                      <div className="col-span-6 sm:col-span-4">
                        <label htmlFor="socialLinks.facebook" className="block text-sm font-medium text-gray-700">
                          <span className="flex items-center">
                            <svg className="h-5 w-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                            Facebook
                          </span>
                        </label>
                        <input
                          type="text"
                          name="socialLinks.facebook"
                          id="socialLinks.facebook"
                          value={settings.socialLinks.facebook}
                          onChange={handleChange}
                          className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          placeholder="https://facebook.com/yourstorepage"
                        />
                      </div>
                      
                      <div className="col-span-6 sm:col-span-4">
                        <label htmlFor="socialLinks.twitter" className="block text-sm font-medium text-gray-700">
                          <span className="flex items-center">
                            <svg className="h-5 w-5 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                            </svg>
                            Twitter
                          </span>
                        </label>
                        <input
                          type="text"
                          name="socialLinks.twitter"
                          id="socialLinks.twitter"
                          value={settings.socialLinks.twitter}
                          onChange={handleChange}
                          className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          placeholder="https://twitter.com/yourstorehandle"
                        />
                      </div>
                      
                      <div className="col-span-6 sm:col-span-4">
                        <label htmlFor="socialLinks.instagram" className="block text-sm font-medium text-gray-700">
                          <span className="flex items-center">
                            <svg className="h-5 w-5 mr-2 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
                            </svg>
                            Instagram
                          </span>
                        </label>
                        <input
                          type="text"
                          name="socialLinks.instagram"
                          id="socialLinks.instagram"
                          value={settings.socialLinks.instagram}
                          onChange={handleChange}
                          className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          placeholder="https://instagram.com/yourstorehandle"
                        />
                      </div>
                      
                      <div className="col-span-6 sm:col-span-4">
                        <label htmlFor="socialLinks.youtube" className="block text-sm font-medium text-gray-700">
                          <span className="flex items-center">
                            <svg className="h-5 w-5 mr-2 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                            </svg>
                            YouTube
                          </span>
                        </label>
                        <input
                          type="text"
                          name="socialLinks.youtube"
                          id="socialLinks.youtube"
                          value={settings.socialLinks.youtube}
                          onChange={handleChange}
                          className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          placeholder="https://youtube.com/c/yourstorename"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default Settings;