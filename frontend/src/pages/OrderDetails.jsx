import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import CurrencyPrice from '../components/CurrencyPrice';

const OrderDetails = () => {
  const { id } = useParams();
  const { token } = useSelector(state => state.user);
  const navigate = useNavigate();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchOrderDetails();
  }, [id, token, navigate]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await axios.get(`${apiUrl}/api/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrder(response.data);
    } catch (err) {
      setError('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await axios.get(`${apiUrl}/api/orders/${id}/invoice`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${id}.pdf`);
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTrackingSteps = (status) => {
    const steps = [
      { key: 'pending', label: 'Order Placed', icon: '📋' },
      { key: 'processing', label: 'Processing', icon: '⚙️' },
      { key: 'shipped', label: 'Shipped', icon: '🚚' },
      { key: 'delivered', label: 'Delivered', icon: '📦' }
    ];

    const statusOrder = ['pending', 'processing', 'shipped', 'delivered'];
    const currentIndex = statusOrder.indexOf(status);

    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      active: index === currentIndex
    }));
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error || 'Order not found'}
        </div>
        <Button onClick={() => navigate('/orders')}>
          Back to Order History
        </Button>
      </div>
    );
  }

  const trackingSteps = getTrackingSteps(order.status);

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <Button 
          variant="outline" 
          onClick={() => navigate('/orders')}
          className="mb-4"
        >
          ← Back to Order History
        </Button>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Order #{order.orderNumber || order._id.slice(-8).toUpperCase()}
            </h1>
            <p className="text-gray-600">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant={getStatusColor(order.status)}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Badge>
            <Button onClick={handleDownloadInvoice}>
              Download Invoice
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Order Tracking */}
          {order.status !== 'cancelled' && (
            <div className="bg-white rounded-2xl shadow-subtle border border-gray-200 p-6">
              <h2 className="text-xl font-bold mb-6">Order Tracking</h2>
              <div className="space-y-6">
                {trackingSteps.map((step, index) => (
                  <div key={step.key} className="flex items-center">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                      step.completed 
                        ? 'bg-green-100 text-green-800' 
                        : step.active 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      {step.completed ? '✓' : step.icon}
                    </div>
                    <div className="ml-4 flex-1">
                      <p className={`text-sm font-medium ${
                        step.completed || step.active ? 'text-gray-900' : 'text-gray-400'
                      }`}>
                        {step.label}
                      </p>
                      {step.active && (
                        <p className="text-xs text-blue-600">Current Status</p>
                      )}
                    </div>
                    {index < trackingSteps.length - 1 && (
                      <div className={`absolute left-5 mt-10 w-0.5 h-6 ${
                        step.completed ? 'bg-green-300' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Order Items */}
          <div className="bg-white rounded-2xl shadow-subtle border border-gray-200 p-6">
            <h2 className="text-xl font-bold mb-6">Order Items</h2>
            <div className="space-y-4">
              {order.items?.map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                  <img
                    src={item.product?.images?.[0]?.url || '/placeholder-image.jpg'}
                    alt={item.product?.title || 'Product'}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800">
                      {item.product?.title || 'Product'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {item.product?.description || 'No description available'}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-sm text-gray-500">
                        Quantity: {item.quantity}
                      </span>
                      <span className="text-sm text-gray-500">
                        Price: <CurrencyPrice price={item.price} />
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-800">
                      <CurrencyPrice price={item.quantity * item.price} />
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-white rounded-2xl shadow-subtle border border-gray-200 p-6">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>₹{order.subtotal?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span>₹{order.tax?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span>₹{order.shipping?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary-700">₹{order.total?.toFixed(2) || '0.00'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-2xl shadow-subtle border border-gray-200 p-6">
            <h2 className="text-xl font-bold mb-4">Shipping Address</h2>
            <div className="text-sm text-gray-600 space-y-1">
              <p className="font-medium text-gray-800">{order.shippingAddress?.fullName}</p>
              <p>{order.shippingAddress?.address}</p>
              <p>
                {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}
              </p>
              <p>{order.shippingAddress?.country}</p>
              {order.shippingAddress?.phone && (
                <p className="mt-2">Phone: {order.shippingAddress.phone}</p>
              )}
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-2xl shadow-subtle border border-gray-200 p-6">
            <h2 className="text-xl font-bold mb-4">Payment Method</h2>
            <div className="text-sm text-gray-600">
              <p className="capitalize font-medium">
                {order.paymentMethod?.replace('_', ' ') || 'Not specified'}
              </p>
              {order.paymentMethod === 'credit_card' && (
                <p className="text-xs text-gray-500 mt-1">
                  Payment processed securely
                </p>
              )}
            </div>
          </div>

          {/* Need Help? */}
          <div className="bg-blue-50 rounded-2xl border border-blue-200 p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">Need Help?</h3>
            <p className="text-sm text-blue-700 mb-4">
              If you have questions about your order, our customer support team is here to help.
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/contact')}
              className="w-full"
            >
              Contact Support
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
