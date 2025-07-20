import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import socket from '../utils/socket';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import CurrencyPrice from '../components/CurrencyPrice';

const OrderConfirmation = () => {
  const { id } = useParams();
  const { token } = useSelector(state => state.user);
  const navigate = useNavigate();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch order data
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        if (!token) {
          navigate('/login');
          return;
        }
        
        setLoading(true);
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const response = await axios.get(`${apiUrl}/api/orders/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setOrder(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Could not load order details. Please try again.');
        setLoading(false);
      }
    };
    
    fetchOrder();
    
    // Listen for real-time order updates
    const handleOrderUpdate = (data) => {
      if (data.order && data.order._id === id) {
        setOrder(data.order);
        
        // Show toast notification
        const event = new CustomEvent('show-toast', { 
          detail: { 
            message: `Order status updated to ${data.order.status}`, 
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
  }, [id, token, navigate]);
  
  // Get status badge color
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
  
  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="bg-white rounded-2xl shadow-subtle border border-gray-200 p-6 mb-8">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-6"></div>
            <div className="h-20 bg-gray-200 rounded mb-4"></div>
          </div>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="bg-red-50 p-6 rounded-2xl border border-red-100 text-center">
          <h2 className="text-2xl font-bold text-red-700 mb-2">Error</h2>
          <p className="text-red-600 mb-6">{error || 'Order not found'}</p>
          <Button 
            variant="outline" 
            onClick={() => navigate('/account/orders')}
          >
            View Your Orders
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <div className="text-center mb-8">
        <div className="inline-block mb-6">
          <div className="h-16 w-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        
        <h1 className="text-3xl font-bold mb-2 text-gray-800">Order Confirmed!</h1>
        <p className="text-gray-600 max-w-md mx-auto">
          Thank you for your purchase. Your order has been received and is being processed.
        </p>
      </div>
      
      {/* Order details card */}
      <div className="bg-white rounded-2xl shadow-subtle border border-gray-200 p-6 mb-8">
        <div className="flex flex-wrap justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Order #{order.orderNumber}</h2>
            <p className="text-gray-500">Placed on {formatDate(order.createdAt)}</p>
          </div>
          
          <Badge 
            color={getStatusColor(order.status)}
            size="lg"
            className="mt-2 sm:mt-0"
          >
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Shipping info */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Shipping Address</h3>
            <p className="text-gray-600">
              {order.shippingAddress.fullName}<br />
              {order.shippingAddress.address}<br />
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}<br />
              {order.shippingAddress.country}
            </p>
          </div>
          
          {/* Payment info */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Payment Method</h3>
            <p className="text-gray-600 capitalize">
              {order.paymentMethod.replace(/_/g, ' ')}
            </p>
            
            <h3 className="font-semibold text-gray-800 mt-4 mb-2">Payment Status</h3>
            <Badge color={order.paymentStatus === 'paid' ? 'success' : 'warning'}>
              {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
            </Badge>
          </div>
          
          {/* Order summary */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Order Summary</h3>
            <div className="space-y-1">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span>₹{order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax:</span>
                <span>₹{order.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping:</span>
                <span>{order.shipping > 0 ? `$₹{order.shipping.toFixed(2)}` : 'Free'}</span>
              </div>
              <div className="flex justify-between font-semibold text-gray-800 border-t border-gray-200 pt-2 mt-2">
                <span>Total:</span>
                <span>₹{order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Order items */}
      <div className="bg-white rounded-2xl shadow-subtle border border-gray-200 overflow-hidden">
        <h2 className="text-xl font-bold p-6 border-b border-gray-200">Order Items</h2>
        
        <ul className="divide-y divide-gray-200">
          {order.items.map((item, index) => (
            <li key={index} className="p-6 flex items-center">
              <div className="h-20 w-20 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                <img 
                  src={item.product.images && item.product.images.length > 0 
                    ? item.product.images[0].url 
                    : "https://via.placeholder.com/80"}
                  alt={item.product.title}
                  className="h-full w-full object-cover"
                />
              </div>
              
              <div className="ml-6 flex-grow">
                <h3 className="text-base font-medium text-gray-800">{item.product.title}</h3>
                <div className="text-sm text-gray-500 mt-1">
                  {item.size && <span className="mr-3">Size: {item.size}</span>}
                  {item.color && <span>Color: {item.color}</span>}
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-500">Qty: {item.quantity}</span>
                  <span className="font-medium"><CurrencyPrice price={item.price * item.quantity} /></span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      
      {/* Order tracking */}
      {order.status !== 'cancelled' && (
        <div className="mt-8 bg-white rounded-2xl shadow-subtle border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Order Status</h2>
          
          <div className="relative">
            {/* Progress bar */}
            <div className="h-1 bg-gray-200 absolute left-0 right-0 top-4">
              <div 
                className="h-1 bg-primary-500 absolute left-0"
                style={{ 
                  width: order.status === 'pending' ? '0%' : 
                         order.status === 'processing' ? '33%' : 
                         order.status === 'shipped' ? '67%' : '100%' 
                }}
              ></div>
            </div>
            
            {/* Steps */}
            <div className="flex justify-between relative">
              <div className="text-center w-1/4">
                <div className={`
                  h-8 w-8 rounded-full mb-2 mx-auto flex items-center justify-center
                  ${order.status !== 'pending' ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-500'}
                `}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="text-sm font-medium">Confirmed</div>
              </div>
              
              <div className="text-center w-1/4">
                <div className={`
                  h-8 w-8 rounded-full mb-2 mx-auto flex items-center justify-center
                  ${order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered' 
                    ? 'bg-primary-500 text-white' 
                    : 'bg-gray-200 text-gray-500'}
                `}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="text-sm font-medium">Processing</div>
              </div>
              
              <div className="text-center w-1/4">
                <div className={`
                  h-8 w-8 rounded-full mb-2 mx-auto flex items-center justify-center
                  ${order.status === 'shipped' || order.status === 'delivered' 
                    ? 'bg-primary-500 text-white' 
                    : 'bg-gray-200 text-gray-500'}
                `}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8" />
                  </svg>
                </div>
                <div className="text-sm font-medium">Shipped</div>
                {order.trackingNumber && order.status === 'shipped' && (
                  <div className="text-xs text-gray-500 mt-1">
                    Tracking#: {order.trackingNumber}
                  </div>
                )}
              </div>
              
              <div className="text-center w-1/4">
                <div className={`
                  h-8 w-8 rounded-full mb-2 mx-auto flex items-center justify-center
                  ${order.status === 'delivered' 
                    ? 'bg-primary-500 text-white' 
                    : 'bg-gray-200 text-gray-500'}
                `}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <div className="text-sm font-medium">Delivered</div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Actions */}
      <div className="flex justify-center space-x-4 mt-8">
        <Button
          variant="outline"
          onClick={() => navigate('/products')}
        >
          Continue Shopping
        </Button>
        <Button
          variant="primary"
          onClick={() => navigate('/orders')}
        >
          View All Orders
        </Button>
      </div>
    </div>
  );
};

export default OrderConfirmation;