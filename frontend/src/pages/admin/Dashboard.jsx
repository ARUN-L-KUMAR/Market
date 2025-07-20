import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
    if (!user || !user.isAdmin) {
      navigate('/login');
      return;
    }
    
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await getStats();
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
    
    // Join admin room for real-time updates
    const adminSocket = socketService.joinAdminRoom(user.id);
    
    if (adminSocket) {
      // Listen for new order events
      const unsubscribeNewOrder = adminSocket.onNewOrder((order) => {
        setActivities(prev => [{
          type: 'order',
          message: `New order #${order.orderNumber} placed`,
          time: new Date(),
          data: order
        }, ...prev]);
        
        // Update stats
        setStats(prev => ({
          ...prev,
          totalOrders: prev.totalOrders + 1,
          revenue: prev.revenue + order.total
        }));
      });
      
      // Listen for cart activity events
      const unsubscribeCartActivity = adminSocket.onCartActivity((data) => {
        setActivities(prev => [{
          type: 'cart',
          message: `Cart ${data.action} by user ${data.userId}`,
          time: new Date(),
          data
        }, ...prev]);
      });
      
      // Listen for user activity events
      const unsubscribeUserActivity = adminSocket.onUserActivity((data) => {
        setActivities(prev => [{
          type: 'user',
          message: `User ${data.action}: ${data.userName || data.userId}`,
          time: new Date(),
          data
        }, ...prev]);
      });
      
      // Listen for product activity events
      const unsubscribeProductActivity = adminSocket.onProductActivity((data) => {
        setActivities(prev => [{
          type: 'product',
          message: `Product ${data.action}: ${data.productName || data.productId}`,
          time: new Date(),
          data
        }, ...prev]);
      });
      
      // Listen for wishlist activity events
      const unsubscribeWishlistActivity = adminSocket.onWishlistActivity((data) => {
        setActivities(prev => [{
          type: 'wishlist',
          message: `Wishlist ${data.action} by user ${data.userName || data.userId}`,
          time: new Date(),
          data
        }, ...prev]);
      });
      
      // Cleanup function
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
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="h-12 w-12 border-4 border-primary-600 border-t-transparent rounded-full"
          />
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="ml-3 text-gray-600 font-medium"
          >
            Loading dashboard data...
          </motion.span>
        </div>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout>
      <div className="p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
            Dashboard
          </h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your store today.</p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <DashboardCard 
            title="Total Revenue"
            value={`$${stats?.revenue?.toFixed(2) || '0.00'}`}
            icon="💰"
            change={stats?.revenueChange}
          />
          <DashboardCard 
            title="Orders"
            value={stats?.totalOrders || 0}
            icon="📦"
            change={stats?.ordersChange}
          />
          <DashboardCard 
            title="Users"
            value={stats?.totalUsers || 0}
            icon="👥"
            change={stats?.usersChange}
          />
          <DashboardCard 
            title="Products"
            value={stats?.totalProducts || 0}
            icon="🛍️"
            change={stats?.productsChange}
          />
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 bg-white/80 backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-gray-100"
          >
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Sales Overview</h2>
            <SalesChart data={stats?.salesData} />
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/80 backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-gray-100"
          >
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Activity Feed</h2>
            <ActivityFeed activities={activities} />
          </motion.div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-white/80 backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-gray-100"
        >
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Recent Orders</h2>
          <RecentOrders orders={stats?.recentOrders} />
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;