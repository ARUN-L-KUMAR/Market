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
    const newTax = newSubtotal * 0.08;
    const newShipping = newSubtotal > 100 ? 0 : 10;
    setSubtotal(newSubtotal);
    setTax(newTax);
    setShipping(newShipping);
    setTotal(newSubtotal + newTax + newShipping);
    // Fetch user's addresses
    const fetchAddresses = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const response = await axios.get(`${apiUrl}/api/users/addresses`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSavedAddresses(response.data || []);
        const defaultAddress = response.data.find(addr => addr.isDefault);
        if (defaultAddress) setSelectedAddress(defaultAddress);
        else if (response.data.length > 0) setSelectedAddress(response.data[0]);
        else setIsAddingNewAddress(true);
      } catch (error) {
        console.error('Error fetching addresses:', error);
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
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await axios.post(
        `${apiUrl}/api/users/addresses`,
        addressForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSavedAddresses([...savedAddresses, response.data]);
      setSelectedAddress(response.data);
      setIsAddingNewAddress(false);
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Address saved successfully', type: 'success' } }));
    } catch (error) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Failed to save address', type: 'error' } }));
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
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Please select or add a shipping address', type: 'error' } }));
      return;
    }
    if (!paymentMethod) {
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
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
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
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 pt-20">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-8">
          <div className="flex items-center mb-4">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate('/cart')} className="flex items-center text-gray-600 hover:text-purple-600 transition-colors mr-4">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Cart
            </motion.button>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black leading-tight bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent mb-4">Checkout</h1>
          <p className="text-xl text-gray-600 leading-relaxed">Complete your order securely</p>
        </motion.div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content - shipping & payment */}
          <div className="lg:col-span-2 space-y-8">
            {/* Shipping address */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-3 rounded-full mr-4">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Shipping Address</h2>
                  <p className="text-gray-600">Where should we deliver your order?</p>
                </div>
              </div>
              {/* Saved addresses */}
              {!isAddingNewAddress && savedAddresses.length > 0 && (
                <div className="space-y-4 mb-6">
                  {savedAddresses.map((address, index) => (
                    <div key={index} className={`border rounded-lg p-4 cursor-pointer transition ${selectedAddress === address ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`} onClick={() => setSelectedAddress(address)}>
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold">{address.fullName}</p>
                          <p className="text-gray-600 text-sm">{address.address}</p>
                          <p className="text-gray-600 text-sm">{address.city}, {address.state} {address.zipCode}</p>
                          <p className="text-gray-600 text-sm">{address.country}</p>
                          {address.phone && (<p className="text-gray-600 text-sm mt-1">{address.phone}</p>)}
                        </div>
                        {address.isDefault && (<span className="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded">Default</span>)}
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
                    <input type="checkbox" id="isDefault" name="isDefault" checked={addressForm.isDefault} onChange={handleAddressChange} className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" />
                    <label htmlFor="isDefault" className="ml-2 text-sm text-gray-700">Set as default address</label>
                  </div>
                  <div className="flex space-x-4 pt-4">
                    {savedAddresses.length > 0 && (<Button variant="outline" onClick={() => setIsAddingNewAddress(false)}>Cancel</Button>)}
                    <Button onClick={handleSaveAddress}>Save Address</Button>
                  </div>
                </div>
              )}
            </motion.div>
            {/* Payment method */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }} className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white p-3 rounded-full mr-4">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Payment Method</h2>
                  <p className="text-gray-600">Choose your preferred payment option</p>
                </div>
              </div>
              <div className="space-y-4">
                {/* PayU (Recommended) */}
                <div className={`border rounded-lg p-4 cursor-pointer transition ${paymentMethod === 'payu' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`} onClick={() => setPaymentMethod('payu')}>
                  <div className="flex items-center">
                    <div className={`w-5 h-5 rounded-full border ${paymentMethod === 'payu' ? 'border-primary-500' : 'border-gray-300'} flex items-center justify-center mr-3`}>
                      {paymentMethod === 'payu' && <div className="w-3 h-3 rounded-full bg-primary-500"></div>}
                    </div>
                    <div className="flex-grow">
                      <p className="font-medium">PayU (Credit/Debit Card, UPI, Netbanking)</p>
                      <p className="text-gray-500 text-sm">Pay securely via PayU payment gateway</p>
                    </div>
                    <div className="bg-gray-100 rounded p-1">
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
                <div className={`border rounded-lg p-4 cursor-pointer transition ${paymentMethod === 'credit_card' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`} onClick={() => setPaymentMethod('credit_card')}>
                  <div className="flex items-center">
                    <div className={`w-5 h-5 rounded-full border ${paymentMethod === 'credit_card' ? 'border-primary-500' : 'border-gray-300'} flex items-center justify-center mr-3`}>
                      {paymentMethod === 'credit_card' && <div className="w-3 h-3 rounded-full bg-primary-500"></div>}
                    </div>
                    <div className="flex-grow">
                      <p className="font-medium">Credit Card</p>
                      <p className="text-gray-500 text-sm">Pay securely with your credit card</p>
                    </div>
                  </div>
                </div>
                {/* PayPal (not implemented) */}
                <div className={`border rounded-lg p-4 cursor-pointer transition ${paymentMethod === 'paypal' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`} onClick={() => setPaymentMethod('paypal')}>
                  <div className="flex items-center">
                    <div className={`w-5 h-5 rounded-full border ${paymentMethod === 'paypal' ? 'border-primary-500' : 'border-gray-300'} flex items-center justify-center mr-3`}>
                      {paymentMethod === 'paypal' && <div className="w-3 h-3 rounded-full bg-primary-500"></div>}
                    </div>
                    <div className="flex-grow">
                      <p className="font-medium">PayPal</p>
                      <p className="text-gray-500 text-sm">Pay with your PayPal account</p>
                    </div>
                  </div>
                </div>
                {/* UPI group */}
                <div className="border rounded-lg p-4 cursor-pointer transition mb-2">
                  <div className="font-medium mb-2">UPI</div>
                  <div className="flex gap-4">
                    <div className={`border rounded-lg px-4 py-2 flex items-center cursor-pointer ${paymentMethod === 'upi_paytm' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`} onClick={() => setPaymentMethod('upi_paytm')}>
                      <img src="..\paytm-logo.png" alt="Paytm" className="w-6 h-6 mr-2" /> Paytm
                    </div>
                    <div className={`border rounded-lg px-4 py-2 flex items-center cursor-pointer ${paymentMethod === 'upi_gpay' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`} onClick={() => setPaymentMethod('upi_gpay')}>
                      <img src="..\gpay-logo.png" alt="GPay" className="w-6 h-6 mr-2" /> GPay
                    </div>
                    <div className={`border rounded-lg px-4 py-2 flex items-center cursor-pointer ${paymentMethod === 'upi_phonepe' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`} onClick={() => setPaymentMethod('upi_phonepe')}>
                      <img src="..\phonpe-logo.jpeg" alt="PhonePe" className="w-6 h-6 mr-2" /> PhonePe
                    </div>
                  </div>
                </div>
                {/* Cash on Delivery (not implemented) */}
                <div className={`border rounded-lg p-4 cursor-pointer transition ${paymentMethod === 'cash_on_delivery' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`} onClick={() => setPaymentMethod('cash_on_delivery')}>
                  <div className="flex items-center">
                    <div className={`w-5 h-5 rounded-full border ${paymentMethod === 'cash_on_delivery' ? 'border-primary-500' : 'border-gray-300'} flex items-center justify-center mr-3`}>
                      {paymentMethod === 'cash_on_delivery' && <div className="w-3 h-3 rounded-full bg-primary-500"></div>}
                    </div>
                    <div>
                      <p className="font-medium">Cash on Delivery</p>
                      <p className="text-gray-500 text-sm">Pay when you receive the order</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
          {/* Order summary sidebar */}
          <div className="lg:col-span-1">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.8 }} className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6 sticky top-24">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-3 rounded-full mr-4">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Order Summary</h2>
                  <p className="text-gray-600">Review your items</p>
                </div>
              </div>
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={`${item.product._id}-${item.color}-${item.size}`} className="flex items-center">
                    <div className="h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                      <img src={item.product.images && item.product.images.length > 0 ? item.product.images[0].url : "https://via.placeholder.com/80"} alt={item.product.title} className="h-full w-full object-cover" />
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-sm font-medium text-gray-800">{item.product.title}</h3>
                      <p className="text-xs text-gray-500">{item.color && `Color: ${item.color}`}{item.color && item.size && ' | '}{item.size && `Size: ${item.size}`}</p>
                      <div className="flex justify-between mt-1">
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        <div className="text-sm font-medium text-gray-800"><CurrencyPrice price={item.product.price * item.quantity} /></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 pt-4 pb-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium"><CurrencyPrice price={subtotal} /></span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium"><CurrencyPrice price={tax} /></span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">{shipping > 0 ? <CurrencyPrice price={shipping} /> : 'Free'}</span>
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold text-gray-800">Total</span>
                  <span className="text-lg font-bold text-primary-700"><CurrencyPrice price={total} /></span>
                </div>
                <div className="mt-6">
                  <Button variant="primary" size="lg" className="w-full" onClick={() => setShowConfirmModal(true)} loading={isProcessingOrder} disabled={isProcessingOrder || !paymentMethod}>Place Order</Button>
                  <p className="mt-4 text-xs text-gray-500 text-center">By placing your order, you agree to our <a href="#" className="text-primary-600 hover:underline">Terms of Service</a> and <a href="#" className="text-primary-600 hover:underline">Privacy Policy</a>.</p>
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