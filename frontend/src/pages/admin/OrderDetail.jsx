import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrderById, updateOrderStatus, createReturnRequest, updatePaymentStatus } from '../../services/adminService';
import AdminLayout from '../../components/admin/AdminLayout';
import Button from '../../components/ui/Button';
import { RotateCcw, AlertCircle, XCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-toastify';

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateStatusLoading, setUpdateStatusLoading] = useState(false);
  const [updatePaymentLoading, setUpdatePaymentLoading] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnLoading, setReturnLoading] = useState(false);
  const [returnData, setReturnData] = useState({
    reason: 'damaged_product',
    reasonDetails: '',
    refundAmount: 0
  });

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await getOrderById(id);
        const data = response.data.data;
        setOrder(data);
        setReturnData(prev => ({ ...prev, refundAmount: data.total }));
      } catch (error) {
        console.error('Error fetching order details:', error);
        setError('Failed to load order details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  const handleInitiateReturn = async (e) => {
    e.preventDefault();
    try {
      setReturnLoading(true);
      await createReturnRequest({
        orderId: id,
        ...returnData
      });
      toast.success('Return request initiated successfully');
      setShowReturnModal(false);
      // Optional: Redirect to returns page or update local state to show it has a return
    } catch (error) {
      console.error('Error initiating return:', error);
      const message = error.response?.data?.message || 'Failed to initiate return';
      toast.error(message);
    } finally {
      setReturnLoading(false);
    }
  };

  // Function to format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Function to get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-emerald-100 text-emerald-700';
      case 'processing':
        return 'bg-blue-100 text-blue-700';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-700';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  // Function to get badge class for Payment
  const getPaymentBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'bg-emerald-100 text-emerald-700';
      case 'pending':
        return 'bg-amber-100 text-amber-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
      case 'refunded':
        return 'bg-indigo-100 text-indigo-700';
      default:
        return 'bg-slate-100 text-slate-700';
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
      toast.success('Delivery status updated');
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update delivery status');
    } finally {
      setUpdateStatusLoading(false);
    }
  };

  const handleUpdatePaymentStatus = async (newStatus) => {
    try {
      setUpdatePaymentLoading(true);
      await updatePaymentStatus(id, newStatus);

      // Update the order in the local state
      setOrder(prev => ({
        ...prev,
        paymentStatus: newStatus
      }));
      toast.success('Payment status updated');
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error('Failed to update payment status');
    } finally {
      setUpdatePaymentLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
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
          <Link to="/admin/orders" className="text-indigo-600 hover:text-indigo-700">
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
          <div className="bg-amber-100 border border-yellow-400 text-amber-700 px-4 py-3 rounded mb-4">
            Order not found
          </div>
          <Link to="/admin/orders" className="text-indigo-600 hover:text-indigo-700">
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
            <Link to="/admin/orders" className="text-indigo-600 hover:text-indigo-700 mb-2 inline-block">
              &larr; Back to Orders
            </Link>
            <h1 className="text-2xl font-semibold">Order #{order.orderNumber}</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentBadgeClass(order.paymentStatus)}`}>
                Payment: {order.paymentStatus || 'pending'}
              </span>
              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(order.status)}`}>
                Delivery: {order.status}
              </span>
              {order.returnRequest && (
                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-700">
                  Return: {order.returnRequest.status}
                </span>
              )}
              <span className="ml-2 text-sm text-slate-500">
                Placed on {formatDate(order.createdAt)}
              </span>
            </div>
          </div>

          <div className="flex space-x-3 items-center">
            {order.status === 'delivered' && (
              order.returnRequest ? (
                <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-xl border border-amber-200 text-sm font-bold">
                  <RotateCcw className="w-4 h-4" />
                  Return {order.returnRequest.status.replace('_', ' ')}
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setShowReturnModal(true)}
                  className="gap-2 border-amber-200 text-amber-700 hover:bg-amber-50 font-bold h-10 px-4"
                >
                  <RotateCcw className="w-4 h-4" />
                  Initiate Return
                </Button>
              )
            )}

            {/* Payment Status Dropdown */}
            <div className="flex flex-col">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 ml-1 italic">Payment</label>
              {updatePaymentLoading ? (
                <div className="flex items-center justify-center h-10 w-24">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-emerald-600"></div>
                </div>
              ) : (
                <select
                  className="block h-10 pl-3 pr-8 py-2 border-slate-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-xl font-black text-emerald-700 bg-emerald-50/50"
                  value={order.paymentStatus || 'pending'}
                  onChange={(e) => handleUpdatePaymentStatus(e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              )}
            </div>

            {/* Delivery Status Dropdown */}
            <div className="flex flex-col">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 ml-1 italic">Delivery</label>
              {updateStatusLoading ? (
                <div className="flex items-center justify-center h-10 w-24">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-indigo-600"></div>
                </div>
              ) : (
                <select
                  className="block h-10 pl-3 pr-8 py-2 border-slate-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-xl font-black text-indigo-700 bg-indigo-50/50"
                  value={order.status}
                  onChange={(e) => handleUpdateStatus(e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              )}
            </div>
          </div>
        </div>

        {order.returnRequest && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <RotateCcw className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-amber-900 uppercase tracking-tight">Return Requested</p>
                <p className="text-xs text-amber-700 font-medium">
                  A return request (#{order.returnRequest.returnNumber}) is currently <span className="font-bold underline capitalize">{order.returnRequest.status.replace('_', ' ')}</span>
                </p>
              </div>
            </div>
            <Link
              to={`/admin/returns?search=${order.orderNumber}`}
              className="px-4 py-2 bg-white border border-amber-200 text-amber-700 text-xs font-bold rounded-xl hover:bg-amber-100 transition-colors"
            >
              Manage Return
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Order Summary */}
          <div className="md:col-span-2">
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <div className="px-4 py-5 sm:px-6 border-b border-slate-200">
                <h3 className="text-lg leading-6 font-medium text-slate-900">Order Items</h3>
              </div>
              <ul className="divide-y divide-slate-200">
                {order.items.map((item) => (
                  <li key={item._id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-16 w-16 bg-slate-100 rounded-md overflow-hidden">
                        <img
                          src={item.product?.images?.[0]?.url || '/placeholder.png'}
                          alt={item.product?.title}
                          className="h-full w-full object-center object-cover"
                        />
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex justify-between">
                          <h4 className="text-sm font-medium text-slate-900">{item.product?.title || 'Unknown Product'}</h4>
                          <p className="text-sm font-medium text-slate-900">₹{((item.price || 0) * (item.quantity || 0)).toLocaleString()}</p>
                        </div>
                        <div className="flex justify-between mt-1">
                          <p className="text-sm text-slate-500">
                            ₹{(item.price || 0).toLocaleString()} x {item.quantity || 0}
                          </p>
                          {item.product?._id && (
                            <Link
                              to={`/admin/products/${item.product._id}`}
                              className="text-xs text-indigo-600 hover:text-indigo-700"
                            >
                              View Product
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="px-4 py-5 sm:px-6 border-t border-slate-200">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-slate-500">Subtotal</dt>
                    <dd className="mt-1 text-sm text-slate-900">₹{(order.subtotal || 0).toLocaleString()}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-slate-500">Shipping</dt>
                    <dd className="mt-1 text-sm text-slate-900">₹{(order.shippingCost || 0).toLocaleString()}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-slate-500">Tax</dt>
                    <dd className="mt-1 text-sm text-slate-900">₹{(order.tax || 0).toLocaleString()}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-slate-500">Discount</dt>
                    <dd className="mt-1 text-sm text-slate-900">₹{(order.discount || 0).toLocaleString()}</dd>
                  </div>
                  <div className="sm:col-span-2 border-t pt-4">
                    <dt className="text-base font-semibold text-slate-900">Total</dt>
                    <dd className="mt-1 text-base font-semibold text-slate-900">₹{(order.total || 0).toLocaleString()}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          {/* Customer and Shipping Info */}
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <div className="px-4 py-5 sm:px-6 border-b border-slate-200">
                <h3 className="text-lg leading-6 font-medium text-slate-900">Customer Information</h3>
              </div>
              <div className="px-4 py-5 sm:px-6">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-4">
                  <div>
                    <dt className="text-sm font-medium text-slate-500">Name</dt>
                    <dd className="mt-1 text-sm text-slate-900">{order.user?.name || order.shippingAddress.name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-slate-500">Email</dt>
                    <dd className="mt-1 text-sm text-slate-900">{order.user?.email || order.shippingAddress.email}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-slate-500">Phone</dt>
                    <dd className="mt-1 text-sm text-slate-900">{order.shippingAddress.phone}</dd>
                  </div>
                  {order.user && (
                    <div>
                      <dt className="text-sm font-medium text-slate-500">Customer Type</dt>
                      <dd className="mt-1 text-sm text-slate-900">Registered User</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <div className="px-4 py-5 sm:px-6 border-b border-slate-200">
                <h3 className="text-lg leading-6 font-medium text-slate-900">Shipping Address</h3>
              </div>
              <div className="px-4 py-5 sm:px-6">
                <address className="not-italic">
                  <p className="text-sm text-slate-900">{order.shippingAddress.street}</p>
                  {order.shippingAddress.street2 && (
                    <p className="text-sm text-slate-900">{order.shippingAddress.street2}</p>
                  )}
                  <p className="text-sm text-slate-900">
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                  </p>
                  <p className="text-sm text-slate-900">{order.shippingAddress.country}</p>
                </address>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <div className="px-4 py-5 sm:px-6 border-b border-slate-200">
                <h3 className="text-lg leading-6 font-medium text-slate-900">Payment Information</h3>
              </div>
              <div className="px-4 py-5 sm:px-6">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-4">
                  <div>
                    <dt className="text-sm font-medium text-slate-500">Payment Method</dt>
                    <dd className="mt-1 text-sm text-slate-900">{order.paymentMethod}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-slate-500">Payment Status</dt>
                    <dd className="mt-1 text-sm text-slate-900">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {order.isPaid ? 'Paid' : 'Pending'}
                      </span>
                    </dd>
                  </div>
                  {order.isPaid && order.paidAt && (
                    <div>
                      <dt className="text-sm font-medium text-slate-500">Payment Date</dt>
                      <dd className="mt-1 text-sm text-slate-900">{formatDate(order.paidAt)}</dd>
                    </div>
                  )}
                  {order.transactionId && (
                    <div>
                      <dt className="text-sm font-medium text-slate-500">Transaction ID</dt>
                      <dd className="mt-1 text-sm text-slate-900">{order.transactionId}</dd>
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
            <div className="px-4 py-5 sm:px-6 border-b border-slate-200">
              <h3 className="text-lg leading-6 font-medium text-slate-900">Order Notes</h3>
            </div>
            <ul className="divide-y divide-slate-200">
              {order.notes.map((note) => (
                <li key={note._id} className="px-4 py-4 sm:px-6">
                  <div className="flex space-x-3">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium">{note.author}</h3>
                        <p className="text-sm text-slate-500">{formatDate(note.createdAt)}</p>
                      </div>
                      <p className="text-sm text-slate-500">{note.content}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Return Initiation Modal */}
      {showReturnModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <form onSubmit={handleInitiateReturn} className="p-8 space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Initiate Return</h3>
                  <p className="text-slate-500 text-sm font-medium">Create a new return request for #{order.orderNumber}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowReturnModal(false)}
                  className="p-2 h-10 w-10 bg-slate-50 rounded-2xl text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1 italic">Reason for Return</label>
                  <select
                    value={returnData.reason}
                    onChange={(e) => setReturnData({ ...returnData, reason: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all"
                  >
                    <option value="damaged_product">Damaged Product</option>
                    <option value="wrong_item_delivered">Wrong Item Delivered</option>
                    <option value="defective_not_working">Defective / Not Working</option>
                    <option value="size_fit_issue">Size / Fit Issue</option>
                    <option value="no_longer_needed">No Longer Needed</option>
                    <option value="others">Others</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1 italic">Reason Details</label>
                  <textarea
                    required
                    value={returnData.reasonDetails}
                    onChange={(e) => setReturnData({ ...returnData, reasonDetails: e.target.value })}
                    placeholder="Describe the issue in detail..."
                    className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all min-h-[100px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1 italic">Refund Amount (₹)</label>
                  <input
                    type="number"
                    required
                    value={returnData.refundAmount}
                    onChange={(e) => setReturnData({ ...returnData, refundAmount: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all"
                  />
                  <p className="text-[10px] text-slate-400 mt-1 italic">Maximum refund: ₹{order.total.toLocaleString()}</p>
                </div>
              </div>

              <div className="bg-amber-50 rounded-2xl p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <p className="text-xs text-amber-700 font-bold leading-relaxed">
                  This will create a pending return request. You'll need to process it from the Returns section.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={returnLoading}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black px-6 py-4 rounded-2xl h-14 shadow-lg shadow-indigo-200 uppercase tracking-widest text-xs"
                >
                  {returnLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mx-auto"></div>
                  ) : (
                    'Initiate Request'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowReturnModal(false)}
                  className="flex-1 border-slate-200 text-slate-600 font-black px-6 py-4 rounded-2xl h-14 uppercase tracking-widest text-xs"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default OrderDetail;