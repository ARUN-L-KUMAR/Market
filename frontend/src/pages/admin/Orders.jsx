import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { getOrders, updateOrderStatus, updatePaymentStatus, deleteOrder } from '../../services/adminService';
import AdminLayout from '../../components/admin/AdminLayout';
import { Eye, CreditCard, Truck, Trash2 } from 'lucide-react';

const Orders = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialStatus = searchParams.get('status') || 'all';
  const initialPaymentStatus = searchParams.get('paymentStatus') || 'all';

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [paymentFilter, setPaymentFilter] = useState(initialPaymentStatus);
  const [dateFilter, setDateFilter] = useState('all');
  const [updateModal, setUpdateModal] = useState(null);
  const [updatePaymentModal, setUpdatePaymentModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null); // order to delete
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchOrders = async (page = 1, status = 'all', paymentStatus = 'all', dateRange = 'all') => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };

      if (status !== 'all') params.status = status;
      if (paymentStatus !== 'all') params.paymentStatus = paymentStatus;
      if (dateRange !== 'all') params.dateRange = dateRange;

      const response = await getOrders(params);
      const { orders, pagination } = response.data.data;
      setOrders(orders);
      setTotalPages(pagination.pages || Math.ceil(pagination.total / 10));
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const statusFromUrl = searchParams.get('status');
    if (statusFromUrl && statusFromUrl !== statusFilter) {
      setStatusFilter(statusFromUrl);
      setCurrentPage(1);
    }
    const paymentStatusFromUrl = searchParams.get('paymentStatus');
    if (paymentStatusFromUrl && paymentStatusFromUrl !== paymentFilter) {
      setPaymentFilter(paymentStatusFromUrl);
      setCurrentPage(1);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchOrders(currentPage, statusFilter, paymentFilter, dateFilter);
  }, [currentPage, statusFilter, paymentFilter, dateFilter]);

  // Function to format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Function to get status badge class for Delivery
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

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setUpdateModal(null);

      // Update the order in the local state
      setOrders(orders.map(order => {
        if (order._id === orderId) {
          return { ...order, status: newStatus };
        }
        return order;
      }));
    } catch (error) {
      console.error('Error updating order status:', error);
      setError('Failed to update order status. Please try again.');
    }
  };

  const handleUpdatePaymentStatus = async (orderId, newStatus) => {
    try {
      await updatePaymentStatus(orderId, newStatus);
      setUpdatePaymentModal(null);
      setOrders(orders.map(order =>
        order._id === orderId ? { ...order, paymentStatus: newStatus } : order
      ));
    } catch (error) {
      console.error('Error updating payment status:', error);
      setError('Failed to update payment status. Please try again.');
    }
  };

  const handleDeleteOrder = async () => {
    if (!deleteModal) return;
    try {
      setDeleteLoading(true);
      await deleteOrder(deleteModal._id);
      setOrders(orders.filter(o => o._id !== deleteModal._id));
      setDeleteModal(null);
    } catch (error) {
      console.error('Error deleting order:', error);
      setError('Failed to delete order. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Orders</h1>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-4 items-end">
          <div>
            <label htmlFor="delivery-filter" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Delivery Status</label>
            <select
              id="delivery-filter"
              className="block pl-3 pr-10 py-2 text-sm border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 rounded-xl shadow-sm font-medium text-slate-700"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
                setSearchParams(prev => {
                  const next = new URLSearchParams(prev);
                  next.set('status', e.target.value);
                  return next;
                });
              }}
            >
              <option value="all">All Delivery</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label htmlFor="payment-filter" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Payment Status</label>
            <select
              id="payment-filter"
              className="block pl-3 pr-10 py-2 text-sm border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 rounded-xl shadow-sm font-medium text-slate-700"
              value={paymentFilter}
              onChange={(e) => {
                setPaymentFilter(e.target.value);
                setCurrentPage(1);
                setSearchParams(prev => {
                  const next = new URLSearchParams(prev);
                  next.set('paymentStatus', e.target.value);
                  return next;
                });
              }}
            >
              <option value="all">All Payments</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          <div>
            <label htmlFor="date-filter" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Date Range</label>
            <select
              id="date-filter"
              className="block pl-3 pr-10 py-2 text-sm border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 rounded-xl shadow-sm font-medium text-slate-700"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>

          {(statusFilter !== 'all' || paymentFilter !== 'all' || dateFilter !== 'all') && (
            <button
              onClick={() => {
                setStatusFilter('all');
                setPaymentFilter('all');
                setDateFilter('all');
                setCurrentPage(1);
                setSearchParams({});
              }}
              className="px-3 py-2 text-xs font-bold text-slate-500 hover:text-red-600 border border-slate-200 hover:border-red-200 bg-white rounded-xl shadow-sm transition-colors"
            >
              ✕ Clear Filters
            </button>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Orders table */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Delivery
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-slate-500">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr
                      key={order._id}
                      onClick={() => navigate(`/admin/orders/${order._id}`)}
                      className="hover:bg-indigo-50/40 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                        <div>#{order.orderNumber}</div>
                        {order.returnRequest && (
                          <div className="mt-1">
                            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-700 rounded uppercase">
                              Return: {order.returnRequest.status.replace('_', ' ')}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {order.user?.name || 'Guest User'}
                        <div className="text-xs">{order.shippingAddress?.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                        ₹{(order.total || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentBadgeClass(order.paymentStatus)}`}>
                          {order.paymentStatus || 'pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* View */}
                          <Link
                            to={`/admin/orders/${order._id}`}
                            title="View Order"
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 rounded-lg text-indigo-500 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          {/* Payment */}
                          <button
                            onClick={(e) => { e.stopPropagation(); setUpdatePaymentModal(order); }}
                            title="Update Payment Status"
                            className="p-1.5 rounded-lg text-emerald-500 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                          >
                            <CreditCard className="w-4 h-4" />
                          </button>
                          {/* Delivery */}
                          <button
                            onClick={(e) => { e.stopPropagation(); setUpdateModal(order); }}
                            title="Update Delivery Status"
                            className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                          >
                            <Truck className="w-4 h-4" />
                          </button>
                          {/* Delete */}
                          <button
                            onClick={(e) => { e.stopPropagation(); setDeleteModal(order); }}
                            title="Delete Order"
                            className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Previous</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>

              {[...Array(totalPages).keys()].map(page => (
                <button
                  key={page + 1}
                  onClick={() => setCurrentPage(page + 1)}
                  className={`relative inline-flex items-center px-4 py-2 border border-slate-300 bg-white text-sm font-medium ${currentPage === page + 1 ? 'text-indigo-600 bg-indigo-50' : 'text-slate-700 hover:bg-slate-50'}`}
                >
                  {page + 1}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Next</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* Update status modal */}
      {updateModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-slate-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-sm transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-slate-900">Update Order Status</h3>
                    <div className="mt-2">
                      <p className="text-sm text-slate-500 mb-4">
                        Order #{updateModal.orderNumber}
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() => handleUpdateStatus(updateModal._id, 'pending')}
                          className={`py-2 px-4 rounded-md text-sm font-medium ${updateModal.status === 'pending' ? 'bg-amber-100 text-amber-700 border-2 border-yellow-300' : 'bg-slate-100 hover:bg-yellow-50 text-slate-800'}`}
                        >
                          Pending
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(updateModal._id, 'processing')}
                          className={`py-2 px-4 rounded-md text-sm font-medium ${updateModal.status === 'processing' ? 'bg-indigo-100 text-indigo-700 border-2 border-blue-300' : 'bg-slate-100 hover:bg-indigo-50 text-slate-800'}`}
                        >
                          Processing
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(updateModal._id, 'shipped')}
                          className={`py-2 px-4 rounded-md text-sm font-medium ${updateModal.status === 'shipped' ? 'bg-indigo-100 text-indigo-700 border-2 border-purple-300' : 'bg-slate-100 hover:bg-purple-50 text-slate-800'}`}
                        >
                          Shipped
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(updateModal._id, 'delivered')}
                          className={`py-2 px-4 rounded-md text-sm font-medium ${updateModal.status === 'delivered' ? 'bg-emerald-100 text-emerald-700 border-2 border-green-300' : 'bg-slate-100 hover:bg-emerald-50 text-slate-800'}`}
                        >
                          Delivered
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(updateModal._id, 'cancelled')}
                          className={`py-2 px-4 rounded-md text-sm font-medium ${updateModal.status === 'cancelled' ? 'bg-red-100 text-red-800 border-2 border-red-300' : 'bg-slate-100 hover:bg-red-50 text-slate-800'}`}
                        >
                          Cancelled
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-slate-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-slate-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setUpdateModal(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update payment status modal */}
      {updatePaymentModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-slate-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-sm transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-slate-900">Update Payment Status</h3>
                    <div className="mt-2">
                      <p className="text-sm text-slate-500 mb-4 italic">
                        Order #{updatePaymentModal.orderNumber}
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() => handleUpdatePaymentStatus(updatePaymentModal._id, 'pending')}
                          className={`py-2 px-4 rounded-md text-sm font-medium ${updatePaymentModal.paymentStatus === 'pending' ? 'bg-amber-100 text-amber-700 border-2 border-yellow-300' : 'bg-slate-100 hover:bg-yellow-50 text-slate-800'}`}
                        >
                          Pending
                        </button>
                        <button
                          onClick={() => handleUpdatePaymentStatus(updatePaymentModal._id, 'paid')}
                          className={`py-2 px-4 rounded-md text-sm font-medium ${updatePaymentModal.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-700 border-2 border-green-300' : 'bg-slate-100 hover:bg-emerald-50 text-slate-800'}`}
                        >
                          Paid
                        </button>
                        <button
                          onClick={() => handleUpdatePaymentStatus(updatePaymentModal._id, 'failed')}
                          className={`py-2 px-4 rounded-md text-sm font-medium ${updatePaymentModal.paymentStatus === 'failed' ? 'bg-red-100 text-red-800 border-2 border-red-300' : 'bg-slate-100 hover:bg-red-50 text-slate-800'}`}
                        >
                          Failed
                        </button>
                        <button
                          onClick={() => handleUpdatePaymentStatus(updatePaymentModal._id, 'refunded')}
                          className={`py-2 px-4 rounded-md text-sm font-medium ${updatePaymentModal.paymentStatus === 'refunded' ? 'bg-indigo-100 text-indigo-700 border-2 border-purple-300' : 'bg-slate-100 hover:bg-purple-50 text-slate-800'}`}
                        >
                          Refunded
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-slate-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-slate-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setUpdatePaymentModal(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteModal && (
        <div className="fixed z-20 inset-0 flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => !deleteLoading && setDeleteModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-red-100 rounded-xl">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Delete Order</h3>
                <p className="text-sm text-slate-500">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 bg-slate-50 rounded-xl p-3 mb-6">
              Are you sure you want to permanently delete order{' '}
              <span className="font-bold text-slate-900">#{deleteModal.orderNumber}</span>?
              This will remove it from the database entirely.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteModal(null)}
                disabled={deleteLoading}
                className="px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteOrder}
                disabled={deleteLoading}
                className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors disabled:opacity-60 flex items-center gap-2"
              >
                {deleteLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete Order
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default Orders;