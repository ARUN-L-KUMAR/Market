import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { clearCart } from '../store/cartSlice';
import axios from 'axios';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { ConfirmModal } from '../components/Modal';
import CurrencyPrice from '../components/CurrencyPrice';
import { ShoppingBag, MapPin, CreditCard, ArrowLeft, Lock } from 'lucide-react';

const Checkout = () => {
  const { items } = useSelector(state => state.cart);
  const info = useSelector(state => state.user.user);
  const token = useSelector(state => state.user.token);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  // Order summary state
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [total, setTotal] = useState(0);

  // Payment and address state
  const [paymentMethod, setPaymentMethod] = useState('payu');
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [isAddressLoading, setIsAddressLoading] = useState(true);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);

  // Modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Form state for new address
  const [addressForm, setAddressForm] = useState({
    fullName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    phone: '',
    isDefault: false
  });

  // Form errors
  const [addressErrors, setAddressErrors] = useState({});

  useEffect(() => {
    if (!token) {
      navigate('/login', { state: { redirect: '/checkout' } });
      return;
    }
    if (items.length === 0) {
      navigate('/cart');
      return;
    }
    // Calculate order totals
    const newSubtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const newTax = Math.round(newSubtotal * 0.08 * 100) / 100;
    const newShipping = newSubtotal > 100 ? 0 : 10;
    setSubtotal(newSubtotal);
    setTax(newTax);
    setShipping(newShipping);
    const newTotal = Math.round((newSubtotal + newTax + newShipping) * 100) / 100;
    setTotal(newTotal);
    // Fetch user's addresses
    const fetchAddresses = async () => {
      setIsAddressLoading(true);
      try {
        const response = await axios.get(`${apiUrl}/api/users/addresses`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const addresses = response.data || [];
        console.log('Fetched addresses:', addresses); // Debug log
        setSavedAddresses(addresses);

        if (addresses.length > 0) {
          const defaultAddress = addresses.find(addr => addr.isDefault);
          const addressToSelect = defaultAddress || addresses[0];
          setSelectedAddress(addressToSelect);
          console.log('Selected address:', addressToSelect); // Debug log
          setIsAddingNewAddress(false);
        } else {
          console.log('No saved addresses found, showing add form'); // Debug log
          setIsAddingNewAddress(true);
        }
      } catch (error) {
        console.error('Error fetching addresses:', error);
        window.dispatchEvent(new CustomEvent('show-toast', { 
          detail: { 
            message: 'Failed to load saved addresses. Please add a new address.', 
            type: 'error' 
          } 
        }));
        setIsAddingNewAddress(true); // Fallback to add form on error
      } finally {
        setIsAddressLoading(false);
      }
    };
    fetchAddresses();
  }, [token, items, navigate]);

  const handleAddressChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressForm({ ...addressForm, [name]: type === 'checkbox' ? checked : value });
    setAddressErrors({ ...addressErrors, [name]: '' });
  };

  const validateAddressForm = () => {
    const errors = {};
    if (!addressForm.fullName.trim()) errors.fullName = 'Full name is required';
    if (!addressForm.address.trim()) errors.address = 'Address is required';
    if (!addressForm.city.trim()) errors.city = 'City is required';
    if (!addressForm.state.trim()) errors.state = 'State/Province is required';
    if (!addressForm.zipCode.trim()) errors.zipCode = 'ZIP/Postal code is required';
    if (!addressForm.country.trim()) errors.country = 'Country is required';
    setAddressErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveAddress = async () => {
    if (!validateAddressForm()) return;
    try {
      const response = await axios.post(
        `${apiUrl}/api/users/addresses`,
        addressForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const responseData = response.data;
      const newAddress = Array.isArray(responseData)
        ? responseData[responseData.length - 1]
        : responseData;

      const updatedAddresses = Array.isArray(responseData)
        ? responseData
        : [...savedAddresses, responseData];

      console.log('Address saved successfully:', newAddress); // Debug log
      setSavedAddresses(updatedAddresses);
      setSelectedAddress(newAddress);
      setIsAddingNewAddress(false);
      
      // Reset form
      setAddressForm({
        fullName: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
        phone: '',
        isDefault: false
      });
      
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Address saved successfully!', type: 'success' } }));
    } catch (error) {
      console.error('Error saving address:', error);
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { 
          message: error.response?.data?.message || 'Failed to save address. Please try again.', 
          type: 'error' 
        } 
      }));
    }
  };

  const handlePlaceOrder = async () => {
    console.log('User info:', info);
    console.log('Cart items:', items);
    console.log('Selected address:', selectedAddress);
    console.log('Payment method:', paymentMethod);
    const userId = info && (info._id || info.id);
    if (!userId) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'You must be logged in to place an order.', type: 'error' } }));
      return;
    }
    if (!selectedAddress) {
      setShowConfirmModal(false);
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Please select or add a shipping address', type: 'error' } }));
      return;
    }
    if (!paymentMethod) {
      setShowConfirmModal(false);
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Please select a payment method', type: 'error' } }));
      return;
    }
    setIsProcessingOrder(true);
    // Defensive check for required order totals
    if (
      typeof subtotal !== 'number' || isNaN(subtotal) ||
      typeof tax !== 'number' || isNaN(tax) ||
      typeof shipping !== 'number' || isNaN(shipping) ||
      typeof total !== 'number' || isNaN(total)
    ) {
      setIsProcessingOrder(false);
      setShowConfirmModal(false);
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Order totals are invalid. Please refresh the page and try again.', type: 'error' } }));
      return;
    }
    try {
      if (paymentMethod === 'payu') {
        const orderData = {
          user: userId,
          items: items.map(item => ({
            product: item.product._id,
            quantity: item.quantity,
            price: item.product.price,
            color: item.color,
            size: item.size
          })),
          shippingAddress: selectedAddress,
          paymentMethod: 'payu',
          subtotal,
          tax,
          shipping,
          total,
          email: info.email,
          firstname: info.name || info.fullName || 'Customer'
        };
        console.log('Placing order with data:', orderData);
        const response = await axios.post(`${apiUrl}/api/payment/payu/initiate`, orderData);
        console.log('PayU API response:', response.data);
        setShowConfirmModal(false);
        setIsProcessingOrder(false);
        navigate('/payu-payment', { state: response.data });
        return;
      } else if (paymentMethod === 'cash_on_delivery') {
        const orderData = {
          user: userId,
          items: items.map(item => ({
            product: item.product._id,
            quantity: item.quantity,
            price: item.product.price,
            color: item.color,
            size: item.size
          })),
          shippingAddress: selectedAddress,
          paymentMethod: 'cash_on_delivery',
          subtotal,
          tax,
          shipping,
          total,
          email: info.email,
          firstname: info.name || info.fullName || 'Customer'
        };
        const response = await axios.post(`${apiUrl}/api/orders`, orderData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setShowConfirmModal(false);
        setIsProcessingOrder(false);
        const orderId = response.data?._id || response.data?.order?._id;
        if (orderId) {
          console.log('Navigating to order confirmation:', orderId);
          navigate(`/order-confirmation/${orderId}`);
          setTimeout(() => dispatch(clearCart()), 500); // clear cart after navigation
        } else {
          window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Order placed but could not find order ID for confirmation page.', type: 'error' } }));
        }
        return;
      } else if (paymentMethod.startsWith('upi_')) {
        setIsProcessingOrder(false);
        setShowConfirmModal(false);
        window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'UPI payment methods are coming soon!', type: 'info' } }));
        return;
      } else {
        setIsProcessingOrder(false);
        window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Selected payment method is not implemented yet.', type: 'error' } }));
        setShowConfirmModal(false);
        return;
      }
    } catch (error) {
      setIsProcessingOrder(false);
      console.error('Error placing order:', error, error?.stack);
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Failed to initiate payment', type: 'error' } }));
      setShowConfirmModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-8">
          <div className="flex items-center mb-4">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate('/cart')} className="flex items-center text-slate-600 hover:text-slate-800 transition-colors mr-4">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Cart
            </motion.button>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black leading-tight text-slate-900 mb-4">Checkout</h1>
          <p className="text-xl text-slate-600 leading-relaxed">Complete your order securely</p>
        </motion.div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content - shipping & payment */}
          <div className="lg:col-span-2 space-y-8">
            {/* Shipping address */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="bg-slate-700 text-white p-3 rounded-full mr-4">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-slate-800">Shipping Address</h2>
                    <p className="text-slate-600">Where should we deliver your order?</p>
                  </div>
                </div>
                {!isAddressLoading && savedAddresses.length > 0 && selectedAddress && (
                  <div className="hidden md:block text-right">
                    <p className="text-xs text-slate-500 uppercase tracking-wide">Currently Selected</p>
                    <p className="text-sm font-semibold text-indigo-600">{selectedAddress.fullName}</p>
                  </div>
                )}
              </div>
              {/* Saved addresses */}
              {isAddressLoading ? (
                <div className="flex flex-col justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-3"></div>
                  <p className="text-sm text-slate-600">Loading your saved addresses...</p>
                </div>
              ) : (
                <>
                  {!isAddingNewAddress && savedAddresses.length > 0 && (
                    <div className="space-y-4 mb-6">
                      {savedAddresses.map((address, index) => (
                        <div 
key={address._id || index} 
                          className={`border rounded-lg p-4 cursor-pointer transition ${
                            selectedAddress && selectedAddress._id === address._id 
                              ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200' 
                              : 'border-slate-200 hover:border-slate-300'
                          }`} 
                          onClick={() => setSelectedAddress(address)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-semibold text-slate-900">{address.fullName}</p>
                                {selectedAddress && selectedAddress._id === address._id && (
                                  <span className="bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full">Selected</span>
                                )}
                              </div>
                              <p className="text-slate-600 text-sm">{address.address}</p>
                              <p className="text-slate-600 text-sm">{address.city}, {address.state} {address.zipCode}</p>
                              <p className="text-slate-600 text-sm">{address.country}</p>
                              {address.phone && (<p className="text-slate-600 text-sm mt-1">📱 {address.phone}</p>)}
                            </div>
                            {address.isDefault && (<span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded ml-2">Default</span>)}
                          </div>
                        </div>
                      ))}
                      <Button variant="outline" onClick={() => setIsAddingNewAddress(true)}>Add New Address</Button>
                    </div>
                  )}

                  {/* Add new address form */}
                  {isAddingNewAddress && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Full Name" name="fullName" value={addressForm.fullName} onChange={handleAddressChange} error={addressErrors.fullName} required />
                        <Input label="Phone Number" name="phone" value={addressForm.phone} onChange={handleAddressChange} error={addressErrors.phone} />
                      </div>
                      <Input label="Address" name="address" value={addressForm.address} onChange={handleAddressChange} error={addressErrors.address} required />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="City" name="city" value={addressForm.city} onChange={handleAddressChange} error={addressErrors.city} required />
                        <Input label="State/Province" name="state" value={addressForm.state} onChange={handleAddressChange} error={addressErrors.state} required />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="ZIP/Postal Code" name="zipCode" value={addressForm.zipCode} onChange={handleAddressChange} error={addressErrors.zipCode} required />
                        <Input label="Country" name="country" value={addressForm.country} onChange={handleAddressChange} error={addressErrors.country} required />
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" id="isDefault" name="isDefault" checked={addressForm.isDefault} onChange={handleAddressChange} className="h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500" />
                        <label htmlFor="isDefault" className="ml-2 text-sm text-slate-700">Set as default address</label>
                      </div>
                      <div className="flex space-x-4 pt-4">
                        {savedAddresses.length > 0 && (<Button variant="outline" onClick={() => setIsAddingNewAddress(false)}>Cancel</Button>)}
                        <Button onClick={handleSaveAddress}>Save Address</Button>
                      </div>
                    </div>
                  )}

                  {/* Empty state fallback */}
                  {!isAddingNewAddress && savedAddresses.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-slate-500 mb-4">No shipping addresses found.</p>
                      <Button onClick={() => setIsAddingNewAddress(true)}>Add Shipping Address</Button>
                    </div>
                  )}
                </>
              )}
            </motion.div>
            {/* Payment method */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }} className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <div className="flex items-center mb-6">
                <div className="bg-slate-600 text-white p-3 rounded-full mr-4">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-slate-800">Payment Method</h2>
                  <p className="text-slate-600">Choose your preferred payment option</p>
                </div>
              </div>
              <div className="space-y-4">
                {/* PayU (Recommended) */}
                <div className={`border rounded-lg p-4 cursor-pointer transition ${paymentMethod === 'payu' ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'}`} onClick={() => setPaymentMethod('payu')}>
                  <div className="flex items-center">
                    <div className={`w-5 h-5 rounded-full border ${paymentMethod === 'payu' ? 'border-indigo-500' : 'border-slate-300'} flex items-center justify-center mr-3`}>
                      {paymentMethod === 'payu' && <div className="w-3 h-3 rounded-full bg-indigo-500"></div>}
                    </div>
                    <div className="flex-grow">
                      <p className="font-medium">PayU (Credit/Debit Card, UPI, Netbanking)</p>
                      <p className="text-slate-500 text-sm">Pay securely via PayU payment gateway</p>
                    </div>
                    <div className="bg-slate-100 rounded p-1">
                      {/* Inline PayU SVG icon */}
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="24" height="24" rx="4" fill="#F5F5F5" />
                        <path d="M7 12C7 9.23858 9.23858 7 12 7C14.7614 7 17 9.23858 17 12C17 14.7614 14.7614 17 12 17C9.23858 17 7 14.7614 7 12Z" fill="#F9B233" />
                        <path d="M10.5 12C10.5 11.1716 11.1716 10.5 12 10.5C12.8284 10.5 13.5 11.1716 13.5 12C13.5 12.8284 12.8284 13.5 12 13.5C11.1716 13.5 10.5 12.8284 10.5 12Z" fill="#6A1B9A" />
                      </svg>
                    </div>
                  </div>
                </div>
                {/* Credit Card (not implemented) */}
                <div className={`border rounded-lg p-4 cursor-pointer transition ${paymentMethod === 'credit_card' ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'}`} onClick={() => setPaymentMethod('credit_card')}>
                  <div className="flex items-center">
                    <div className={`w-5 h-5 rounded-full border ${paymentMethod === 'credit_card' ? 'border-indigo-500' : 'border-slate-300'} flex items-center justify-center mr-3`}>
                      {paymentMethod === 'credit_card' && <div className="w-3 h-3 rounded-full bg-indigo-500"></div>}
                    </div>
                    <div className="flex-grow">
                      <p className="font-medium">Credit Card</p>
                      <p className="text-slate-500 text-sm">Pay securely with your credit card</p>
                    </div>
                  </div>
                </div>
                {/* PayPal (not implemented) */}
                <div className={`border rounded-lg p-4 cursor-pointer transition ${paymentMethod === 'paypal' ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'}`} onClick={() => setPaymentMethod('paypal')}>
                  <div className="flex items-center">
                    <div className={`w-5 h-5 rounded-full border ${paymentMethod === 'paypal' ? 'border-indigo-500' : 'border-slate-300'} flex items-center justify-center mr-3`}>
                      {paymentMethod === 'paypal' && <div className="w-3 h-3 rounded-full bg-indigo-500"></div>}
                    </div>
                    <div className="flex-grow">
                      <p className="font-medium">PayPal</p>
                      <p className="text-slate-500 text-sm">Pay with your PayPal account</p>
                    </div>
                  </div>
                </div>
                {/* UPI group */}
                <div className="border rounded-lg p-4 cursor-pointer transition mb-2">
                  <div className="font-medium mb-2">UPI</div>
                  <div className="flex gap-4">
                    <div className={`border rounded-lg px-4 py-2 flex items-center cursor-pointer ${paymentMethod === 'upi_paytm' ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'}`} onClick={() => setPaymentMethod('upi_paytm')}>
                      <img src="..\paytm-logo.png" alt="Paytm" className="w-6 h-6 mr-2" /> Paytm
                    </div>
                    <div className={`border rounded-lg px-4 py-2 flex items-center cursor-pointer ${paymentMethod === 'upi_gpay' ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'}`} onClick={() => setPaymentMethod('upi_gpay')}>
                      <img src="..\gpay-logo.png" alt="GPay" className="w-6 h-6 mr-2" /> GPay
                    </div>
                    <div className={`border rounded-lg px-4 py-2 flex items-center cursor-pointer ${paymentMethod === 'upi_phonepe' ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'}`} onClick={() => setPaymentMethod('upi_phonepe')}>
                      <img src="..\phonpe-logo.jpeg" alt="PhonePe" className="w-6 h-6 mr-2" /> PhonePe
                    </div>
                  </div>
                </div>
                {/* Cash on Delivery (not implemented) */}
                <div className={`border rounded-lg p-4 cursor-pointer transition ${paymentMethod === 'cash_on_delivery' ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'}`} onClick={() => setPaymentMethod('cash_on_delivery')}>
                  <div className="flex items-center">
                    <div className={`w-5 h-5 rounded-full border ${paymentMethod === 'cash_on_delivery' ? 'border-indigo-500' : 'border-slate-300'} flex items-center justify-center mr-3`}>
                      {paymentMethod === 'cash_on_delivery' && <div className="w-3 h-3 rounded-full bg-indigo-500"></div>}
                    </div>
                    <div>
                      <p className="font-medium">Cash on Delivery</p>
                      <p className="text-slate-500 text-sm">Pay when you receive the order</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
          {/* Order summary sidebar */}
          <div className="lg:col-span-1">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.8 }} className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 sticky top-24">
              <div className="flex items-center mb-6">
                <div className="bg-slate-800 text-white p-3 rounded-full mr-4">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-slate-800">Order Summary</h2>
                  <p className="text-slate-600">Review your items</p>
                </div>
              </div>
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={`${item.product._id}-${item.color}-${item.size}`} className="flex items-center">
                    <div className="h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                      <img src={item.product.images && item.product.images.length > 0 ? item.product.images[0].url : "https://via.placeholder.com/80"} alt={item.product.title} className="h-full w-full object-cover" />
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-sm font-medium text-slate-800">{item.product.title}</h3>
                      <p className="text-xs text-slate-500">{item.color && `Color: ${item.color}`}{item.color && item.size && ' | '}{item.size && `Size: ${item.size}`}</p>
                      <div className="flex justify-between mt-1">
                        <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                        <div className="text-sm font-bold text-slate-900"><CurrencyPrice price={item.product.price * item.quantity} variant="nexus" showDecimals={false} /></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-200 pt-4 pb-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Subtotal</span>
                    <span className="font-medium"><CurrencyPrice price={subtotal} /></span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Tax</span>
                    <span className="font-medium"><CurrencyPrice price={tax} /></span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Shipping</span>
                    <span className="font-medium">{shipping > 0 ? <CurrencyPrice price={shipping} /> : 'Free'}</span>
                  </div>
                </div>
              </div>
              <div className="border-t border-slate-200 pt-4">
                <div className="flex justify-between">
                  <span className="text-xl font-bold text-slate-900 uppercase tracking-tighter">Total Valuation</span>
                  <CurrencyPrice
                    price={total}
                    variant="nexus"
                    size="xl"
                    weight="bold"
                    showDecimals={false}
                  />
                </div>
                <div className="mt-6">
                  <Button variant="primary" size="lg" className="w-full" onClick={() => setShowConfirmModal(true)} loading={isProcessingOrder} disabled={isProcessingOrder || !paymentMethod}>Place Order</Button>
                  <p className="mt-4 text-xs text-slate-500 text-center">By placing your order, you agree to our <a href="#" className="text-indigo-600 hover:underline">Terms of Service</a> and <a href="#" className="text-indigo-600 hover:underline">Privacy Policy</a>.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      <ConfirmModal isOpen={showConfirmModal} onClose={() => setShowConfirmModal(false)} onConfirm={handlePlaceOrder} title="Confirm Your Order" message={<span>Are you sure you want to place this order for <CurrencyPrice price={total} />?</span>} confirmText="Place Order" cancelText="Cancel" />
    </div>
  );
};

export default Checkout;