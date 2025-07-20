import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrderById, updateOrderStatus } from '../../services/adminService';
import AdminLayout from '../../components/admin/AdminLayout';

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateStatusLoading, setUpdateStatusLoading] = useState(false);
  
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await getOrderById(id);
        setOrder(response.data);
      } catch (error) {
        console.error('Error fetching order details:', error);
        setError('Failed to load order details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrder();
  }, [id]);
  
  // Function to format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Function to get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const handleUpdateStatus = async (newStatus) => {
    try {
      setUpdateStatusLoading(true);
      await updateOrderStatus(id, newStatus);
      
      // Update the order in the local state
      setOrder(prev => ({
        ...prev,
        status: newStatus
      }));
    } catch (error) {
      console.error('Error updating order status:', error);
      setError('Failed to update order status. Please try again.');
    } finally {
      setUpdateStatusLoading(false);
    }
  };
  
  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </AdminLayout>
    );
  }
  
  if (error) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
          <Link to="/admin/orders" className="text-primary-600 hover:text-primary-900">
            &larr; Back to Orders
          </Link>
        </div>
      </AdminLayout>
    );
  }
  
  if (!order) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
            Order not found
          </div>
          <Link to="/admin/orders" className="text-primary-600 hover:text-primary-900">
            &larr; Back to Orders
          </Link>
        </div>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <Link to="/admin/orders" className="text-primary-600 hover:text-primary-900 mb-2 inline-block">
              &larr; Back to Orders
            </Link>
            <h1 className="text-2xl font-bold">Order #{order.orderNumber}</h1>
            <div className="flex items-center mt-2">
              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(order.status)}`}>
                {order.status}
              </span>
              <span className="ml-2 text-sm text-gray-500">
                Placed on {formatDate(order.createdAt)}
              </span>
            </div>
          </div>
          
          <div className="flex space-x-2">
            {updateStatusLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary-600"></div>
            ) : (
              <div className="relative">
                <select
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                  value={order.status}
                  onChange={(e) => handleUpdateStatus(e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Order Summary */}
          <div className="md:col-span-2">
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Order Items</h3>
              </div>
              <ul className="divide-y divide-gray-200">
                {order.items.map((item) => (
                  <li key={item._id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-16 w-16 bg-gray-100 rounded-md overflow-hidden">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="h-full w-full object-center object-cover"
                        />
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex justify-between">
                          <h4 className="text-sm font-medium text-gray-900">{item.product.name}</h4>
                          <p className="text-sm font-medium text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                        <div className="flex justify-between mt-1">
                          <p className="text-sm text-gray-500">
                            ${item.price.toFixed(2)} x {item.quantity}
                          </p>
                          <Link 
                            to={`/admin/products/${item.product._id}`}
                            className="text-xs text-primary-600 hover:text-primary-900"
                          >
                            View Product
                          </Link>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="px-4 py-5 sm:px-6 border-t border-gray-200">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Subtotal</dt>
                    <dd className="mt-1 text-sm text-gray-900">${order.subtotal.toFixed(2)}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Shipping</dt>
                    <dd className="mt-1 text-sm text-gray-900">${order.shippingCost.toFixed(2)}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Tax</dt>
                    <dd className="mt-1 text-sm text-gray-900">${order.tax.toFixed(2)}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Discount</dt>
                    <dd className="mt-1 text-sm text-gray-900">${order.discount.toFixed(2)}</dd>
                  </div>
                  <div className="sm:col-span-2 border-t pt-4">
                    <dt className="text-base font-bold text-gray-900">Total</dt>
                    <dd className="mt-1 text-base font-bold text-gray-900">${order.total.toFixed(2)}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
          
          {/* Customer and Shipping Info */}
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Customer Information</h3>
              </div>
              <div className="px-4 py-5 sm:px-6">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Name</dt>
                    <dd className="mt-1 text-sm text-gray-900">{order.user?.name || order.shippingAddress.name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1 text-sm text-gray-900">{order.user?.email || order.shippingAddress.email}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Phone</dt>
                    <dd className="mt-1 text-sm text-gray-900">{order.shippingAddress.phone}</dd>
                  </div>
                  {order.user && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Customer Type</dt>
                      <dd className="mt-1 text-sm text-gray-900">Registered User</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
            
            {/* Shipping Address */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Shipping Address</h3>
              </div>
              <div className="px-4 py-5 sm:px-6">
                <address className="not-italic">
                  <p className="text-sm text-gray-900">{order.shippingAddress.street}</p>
                  {order.shippingAddress.street2 && (
                    <p className="text-sm text-gray-900">{order.shippingAddress.street2}</p>
                  )}
                  <p className="text-sm text-gray-900">
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                  </p>
                  <p className="text-sm text-gray-900">{order.shippingAddress.country}</p>
                </address>
              </div>
            </div>
            
            {/* Payment Info */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Payment Information</h3>
              </div>
              <div className="px-4 py-5 sm:px-6">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Payment Method</dt>
                    <dd className="mt-1 text-sm text-gray-900">{order.paymentMethod}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Payment Status</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.isPaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {order.isPaid ? 'Paid' : 'Pending'}
                      </span>
                    </dd>
                  </div>
                  {order.isPaid && order.paidAt && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Payment Date</dt>
                      <dd className="mt-1 text-sm text-gray-900">{formatDate(order.paidAt)}</dd>
                    </div>
                  )}
                  {order.transactionId && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Transaction ID</dt>
                      <dd className="mt-1 text-sm text-gray-900">{order.transactionId}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        {/* Order Notes/History */}
        {order.notes && order.notes.length > 0 && (
          <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Order Notes</h3>
            </div>
            <ul className="divide-y divide-gray-200">
              {order.notes.map((note) => (
                <li key={note._id} className="px-4 py-4 sm:px-6">
                  <div className="flex space-x-3">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium">{note.author}</h3>
                        <p className="text-sm text-gray-500">{formatDate(note.createdAt)}</p>
                      </div>
                      <p className="text-sm text-gray-500">{note.content}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default OrderDetail;