import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import DashboardCard from '../../components/admin/DashboardCard';
import SalesChart from '../../components/admin/SalesChart';
import ActivityFeed from '../../components/admin/ActivityFeed';
import RecentOrders from '../../components/admin/RecentOrders';
import { getStats } from '../../services/adminService';
import socketService from '../../services/socketService';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const { user } = useSelector(state => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || (!user.isAdmin && user.role !== 'admin')) {
      navigate('/login');
      return;
    }

    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await getStats();
        setStats(response.data.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    const adminSocket = socketService.joinAdminRoom(user.id);

    if (adminSocket) {
      const unsubscribeNewOrder = adminSocket.onNewOrder((order) => {
        setActivities(prev => [{
          type: 'order',
          message: `New order #${order.orderNumber} placed`,
          time: new Date(),
          data: order
        }, ...prev]);
        setStats(prev => ({
          ...prev,
          totalOrders: prev.totalOrders + 1,
          revenue: prev.revenue + order.total
        }));
      });

      const unsubscribeCartActivity = adminSocket.onCartActivity((data) => {
        setActivities(prev => [{
          type: 'cart',
          message: `Cart ${data.action} by user ${data.userId}`,
          time: new Date(),
          data
        }, ...prev]);
      });

      const unsubscribeUserActivity = adminSocket.onUserActivity((data) => {
        setActivities(prev => [{
          type: 'user',
          message: `User ${data.action}: ${data.userName || data.userId}`,
          time: new Date(),
          data
        }, ...prev]);
      });

      const unsubscribeProductActivity = adminSocket.onProductActivity((data) => {
        setActivities(prev => [{
          type: 'product',
          message: `Product ${data.action}: ${data.productName || data.productId}`,
          time: new Date(),
          data
        }, ...prev]);
      });

      const unsubscribeWishlistActivity = adminSocket.onWishlistActivity((data) => {
        setActivities(prev => [{
          type: 'wishlist',
          message: `Wishlist ${data.action} by user ${data.userName || data.userId}`,
          time: new Date(),
          data
        }, ...prev]);
      });

      return () => {
        unsubscribeNewOrder();
        unsubscribeCartActivity();
        unsubscribeUserActivity();
        unsubscribeProductActivity();
        unsubscribeWishlistActivity();
        adminSocket.leaveAdminRoom();
      };
    }
  }, [user, navigate]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <svg className="animate-spin h-8 w-8 text-indigo-600 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-slate-500 text-sm">Loading dashboard data...</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Welcome back! Here's what's happening with your store today.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <DashboardCard title="Total Revenue" value={`$${stats?.revenue?.toFixed(2) || '0.00'}`} icon="💰" change={stats?.revenueChange} />
          <DashboardCard title="Orders" value={stats?.totalOrders || 0} icon="📦" change={stats?.ordersChange} />
          <DashboardCard title="Users" value={stats?.totalUsers || 0} icon="👥" change={stats?.usersChange} />
          <DashboardCard title="Products" value={stats?.totalProducts || 0} icon="🛍️" change={stats?.productsChange} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium text-slate-900 mb-4">Sales Overview</h2>
            <SalesChart data={stats?.salesData} />
          </div>

          <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium text-slate-900 mb-4">Activity Feed</h2>
            <ActivityFeed activities={activities} />
          </div>
        </div>

        <div className="mt-8 bg-white border border-slate-200 rounded-xl shadow-sm p-6 overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Recent Orders</h2>
            <button
              onClick={() => navigate('/admin/orders')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-widest transition-colors"
            >
              View All Orders →
            </button>
          </div>
          <RecentOrders orders={stats?.recentOrders} />
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;