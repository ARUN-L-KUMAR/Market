import React from 'react';
import { Link } from 'react-router-dom';

const RecentOrders = ({ orders = [] }) => {
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-emerald-100 text-emerald-700';
      case 'processing':
        return 'bg-indigo-100 text-indigo-700';
      case 'shipped':
        return 'bg-sky-100 text-sky-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      case 'pending':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="overflow-x-auto">
      {orders.length === 0 ? (
        <div className="text-center py-8 text-slate-400 text-sm">No recent orders found</div>
      ) : (
        <table className="min-w-full divide-y divide-slate-200">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Order ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Customer</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Amount</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {orders.map((order) => (
              <tr key={order._id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-slate-900">
                  #{order.orderNumber}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">
                  {order.user?.name || 'Guest User'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">
                  {formatDate(order.createdAt)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-slate-900">
                  ${order.total.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${getStatusBadgeClass(order.status)}`}>
                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${order.status.toLowerCase() === 'completed' ? 'bg-emerald-500' :
                        order.status.toLowerCase() === 'processing' ? 'bg-indigo-500' :
                          order.status.toLowerCase() === 'cancelled' ? 'bg-red-500' :
                            'bg-amber-500'
                      }`}></span>
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  <Link to={`/admin/orders/${order._id}`} className="text-indigo-600 hover:text-indigo-700 font-medium">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="mt-4 text-right">
        <Link to="/admin/orders" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
          View All Orders →
        </Link>
      </div>
    </div>
  );
};

export default RecentOrders;