import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Star,
  DollarSign,
  Truck,
  AlertTriangle,
  Megaphone,
  Settings,
  ChevronDown,
  ChevronRight,
  Search,
  Bell,
  Plus,
  Moon,
  Sun,
  LogOut,
  User as UserIcon,
  HelpCircle,
  ExternalLink,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { logout } from '../../store/store';

const navItems = [
  {
    name: 'Dashboard',
    icon: <LayoutDashboard className="h-5 w-5" />,
    subItems: [
      { name: 'Overview', path: '/admin' },
      { name: 'Revenue Analytics', path: '/admin/revenue' },
      { name: 'Sales Reports', path: '/admin/sales' },
      { name: 'Traffic Insights', path: '/admin/traffic' },
      { name: 'Low Stock Alerts', path: '/admin/low-stock' },
      { name: 'Recent Activity', path: '/admin/activity' },
    ]
  },
  {
    name: 'Products',
    icon: <Package className="h-5 w-5" />,
    subItems: [
      { name: 'All Products', path: '/admin/products' },
      { name: 'Add Product', path: '/admin/products/add' },
      { name: 'Categories', path: '/admin/products/categories' },
      { name: 'Subcategories', path: '/admin/products/subcategories' },
      { name: 'Brands', path: '/admin/products/brands' },
      { name: 'Inventory', path: '/admin/products/inventory' },
      { name: 'Variants', path: '/admin/products/variants' },
      { name: 'Bulk Upload', path: '/admin/products/bulk' },
      { name: 'Draft Products', path: '/admin/products/drafts' },
    ]
  },
  {
    name: 'Orders',
    icon: <ShoppingBag className="h-5 w-5" />,
    subItems: [
      { name: 'All Orders', path: '/admin/orders' },
      { name: 'Pending Orders', path: '/admin/orders/pending' },
      { name: 'Processing', path: '/admin/orders/processing' },
      { name: 'Shipped', path: '/admin/orders/shipped' },
      { name: 'Delivered', path: '/admin/orders/delivered' },
      { name: 'Cancelled', path: '/admin/orders/cancelled' },
      { name: 'Returns / Refunds', path: '/admin/orders/returns' },
      { name: 'Payments', path: '/admin/orders/payments' },
    ]
  },
  {
    name: 'Users',
    icon: <Users className="h-5 w-5" />,
    subItems: [
      { name: 'All Users', path: '/admin/users' },
      { name: 'Customers', path: '/admin/users/customers' },
      { name: 'Admins', path: '/admin/users/admins' },
      { name: 'Roles & Permissions', path: '/admin/users/roles' },
      { name: 'Blocked Users', path: '/admin/users/blocked' },
    ]
  },
  {
    name: 'Reviews',
    icon: <Star className="h-5 w-5" />,
    subItems: [
      { name: 'All Reviews', path: '/admin/reviews' },
      { name: 'Pending Approval', path: '/admin/reviews/pending' },
      { name: 'Reported', path: '/admin/reviews/reported' },
      { name: 'Spam Filtered', path: '/admin/reviews/spam' },
    ]
  },
  {
    name: 'Finance',
    icon: <DollarSign className="h-5 w-5" />,
    subItems: [
      { name: 'Transactions', path: '/admin/finance/transactions' },
      { name: 'Revenue Reports', path: '/admin/finance/reports' },
      { name: 'Payouts', path: '/admin/finance/payouts' },
      { name: 'Refunds', path: '/admin/finance/refunds' },
      { name: 'Tax Reports', path: '/admin/finance/tax' },
      { name: 'Coupons / Discounts', path: '/admin/finance/coupons' },
    ]
  },
  {
    name: 'Shipping',
    icon: <Truck className="h-5 w-5" />,
    subItems: [
      { name: 'Shipping Methods', path: '/admin/shipping/methods' },
      { name: 'Charges', path: '/admin/shipping/charges' },
      { name: 'Regions / Zones', path: '/admin/shipping/regions' },
      { name: 'Delivery Partners', path: '/admin/shipping/partners' },
    ]
  },
  {
    name: 'Inventory Alerts',
    icon: <AlertTriangle className="h-5 w-5" />,
    subItems: [
      { name: 'Low Stock', path: '/admin/inventory/low' },
      { name: 'Out of Stock', path: '/admin/inventory/out' },
      { name: 'Restock History', path: '/admin/inventory/history' },
      { name: 'Movement Logs', path: '/admin/inventory/logs' },
    ]
  },
  {
    name: 'Marketing',
    icon: <Megaphone className="h-5 w-5" />,
    subItems: [
      { name: 'Coupons', path: '/admin/marketing/coupons' },
      { name: 'Banners', path: '/admin/marketing/banners' },
      { name: 'Featured Products', path: '/admin/marketing/featured' },
      { name: 'Email Campaigns', path: '/admin/marketing/emails' },
      { name: 'Push Notifications', path: '/admin/marketing/push' },
    ]
  },
  {
    name: 'Settings',
    icon: <Settings className="h-5 w-5" />,
    subItems: [
      { name: 'Store Info', path: '/admin/settings/store' },
      { name: 'Branding', path: '/admin/settings/branding' },
      { name: 'Payment Gateway', path: '/admin/settings/payment' },
      { name: 'Tax Config', path: '/admin/settings/tax' },
      { name: 'Currency', path: '/admin/settings/currency' },
      { name: 'Shipping', path: '/admin/settings/shipping' },
      { name: 'Email Config', path: '/admin/settings/email' },
      { name: 'SEO', path: '/admin/settings/seo' },
      { name: 'API Keys', path: '/admin/settings/api' },
      { name: 'Webhooks', path: '/admin/settings/webhooks' },
    ]
  },
];

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.user);

  useEffect(() => {
    if (!user || (!user.isAdmin && user.role !== 'admin')) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Auto-expand the menu containing the active page
  useEffect(() => {
    const currentPath = location.pathname;
    const activeMenu = navItems.find(item =>
      item.subItems?.some(sub =>
        (sub.path === '/admin' && currentPath === '/admin') ||
        (sub.path !== '/admin' && currentPath.startsWith(sub.path))
      )
    );

    if (activeMenu && !expandedMenus.includes(activeMenu.name)) {
      setExpandedMenus(prev => [...new Set([...prev, activeMenu.name])]);
    }
  }, [location.pathname]);

  const toggleMenu = (name) => {
    setExpandedMenus(prev =>
      prev.includes(name)
        ? prev.filter(item => item !== name)
        : [...prev, name]
    );
  };

  const handleNavItemClick = (name) => {
    if (isSidebarCollapsed) {
      setIsSidebarCollapsed(false);
      if (!expandedMenus.includes(name)) {
        setExpandedMenus(prev => [...new Set([...prev, name])]);
      }
    } else {
      toggleMenu(name);
    }
  };

  const isActive = (path) => {
    if (path === '/admin' && location.pathname === '/admin') return true;
    return location.pathname === path || (path !== '/admin' && location.pathname.startsWith(path));
  };

  const isMenuExpanded = (name) => expandedMenus.includes(name);

  return (
    <div className="h-screen flex overflow-hidden bg-slate-50 text-slate-900">
      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <div className="fixed inset-0 flex z-40 md:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative flex-1 flex flex-col max-w-xs w-full bg-[#0f172a]"
            >
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none text-white hover:bg-white/10"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <SidebarContent
                isMobile={true}
                isSidebarCollapsed={isSidebarCollapsed}
                setIsSidebarCollapsed={setIsSidebarCollapsed}
                expandedMenus={expandedMenus}
                handleNavItemClick={handleNavItemClick}
                isActive={isActive}
                isMenuExpanded={isMenuExpanded}
                navItems={navItems}
                user={user}
                dispatch={dispatch}
                logout={logout}
                navigate={navigate}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Static sidebar for desktop */}
      <div className={`hidden md:flex md:flex-shrink-0 transition-all duration-300 ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}>
        <div className="flex flex-col h-full">
          <SidebarContent
            isMobile={false}
            isSidebarCollapsed={isSidebarCollapsed}
            setIsSidebarCollapsed={setIsSidebarCollapsed}
            expandedMenus={expandedMenus}
            handleNavItemClick={handleNavItemClick}
            isActive={isActive}
            isMenuExpanded={isMenuExpanded}
            navItems={navItems}
            user={user}
            dispatch={dispatch}
            logout={logout}
            navigate={navigate}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Topbar */}
        <header className="relative z-10 flex-shrink-0 flex h-16 bg-white border-b border-slate-200">
          <button
            className="px-4 border-r border-slate-200 text-slate-500 focus:outline-none md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex items-center">
              <div className="max-w-md w-full relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Universal Search (Ctrl + K)"
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="ml-4 flex items-center md:ml-6 space-x-2">
              <button
                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all relative"
                title="Notifications"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
              </button>

              <button
                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                title="Toggle Theme"
                onClick={() => setIsDarkMode(!isDarkMode)}
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              <div className="h-6 w-px bg-slate-200 mx-2" />

              <button
                onClick={() => navigate('/admin/products/add')}
                className="hidden sm:flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-500/20 transition-all active:scale-95"
              >
                <Plus className="h-4 w-4 mr-2" />
                Quick Action
              </button>

              <div className="flex items-center space-x-3 pl-4">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-xs font-bold text-slate-900 leading-tight">{user?.name}</span>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Super Admin</span>
                </div>
                <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-900 text-sm font-bold shadow-sm">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 relative overflow-y-auto focus:outline-none bg-slate-50 p-6 sm:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

const SidebarContent = ({
  isMobile,
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  expandedMenus,
  handleNavItemClick,
  isActive,
  isMenuExpanded,
  navItems,
  user,
  dispatch,
  logout,
  navigate
}) => (
  <div className={`flex flex-col h-full bg-[#0f172a] text-slate-300 transition-all duration-300 ${isSidebarCollapsed && !isMobile ? 'w-20' : 'w-64'}`}>
    <div className={`flex items-center flex-shrink-0 px-6 py-5 border-b border-slate-800 ${(isSidebarCollapsed && !isMobile) ? 'justify-center px-0' : 'justify-between'}`}>
      {!(isSidebarCollapsed && !isMobile) ? (
        <>
          <div className="flex items-center">
            <div className="bg-indigo-600 p-1.5 rounded-lg mr-3 shadow-lg shadow-indigo-500/20">
              <Package className="h-6 w-6 text-white" />
            </div>
            <Link to="/" className="text-xl font-bold text-white tracking-tight whitespace-nowrap">
              Market<span className="text-indigo-400">Admin</span>
            </Link>
          </div>
          <button
            onClick={() => setIsSidebarCollapsed(true)}
            className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-all hidden md:block"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        </>
      ) : (
        <button
          onClick={() => setIsSidebarCollapsed(false)}
          className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-all hidden md:block"
        >
          <div className="bg-indigo-600 p-1.5 rounded-lg shadow-lg shadow-indigo-500/20">
            <Package className="h-5 w-5 text-white" />
          </div>
        </button>
      )}
    </div>

    <div className="flex-1 overflow-y-auto custom-scrollbar pt-4 pb-4">
      <nav className="px-3 space-y-1">
        {navItems.map((item) => (
          <div key={item.name} className="space-y-1">
            <button
              onClick={() => handleNavItemClick(item.name)}
              className={`w-full group flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${isMenuExpanded(item.name) || item.subItems.some(sub => isActive(sub.path))
                ? 'text-white'
                : 'hover:text-white hover:bg-slate-800/50'
                }`}
            >
              <div className="flex items-center">
                <div className={`transition-colors duration-200 ${(isSidebarCollapsed && !isMobile) ? 'mr-0' : 'mr-3'} ${isActive(item.path) || item.subItems.some(sub => isActive(sub.path)) ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
                  {item.icon}
                </div>
                {!(isSidebarCollapsed && !isMobile) && <span>{item.name}</span>}
              </div>
              {!(isSidebarCollapsed && !isMobile) && (isMenuExpanded(item.name) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />)}
            </button>

            <AnimatePresence>
              {isMenuExpanded(item.name) && !(isSidebarCollapsed && !isMobile) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden bg-slate-900/40 rounded-lg mx-1"
                >
                  <div className="py-1 ml-9 border-l border-slate-800">
                    {item.subItems.map((sub) => (
                      <Link
                        key={sub.name}
                        to={sub.path}
                        className={`block px-4 py-2 text-xs font-medium transition-colors duration-200 ${isActive(sub.path)
                          ? 'text-indigo-400'
                          : 'text-slate-500 hover:text-white'
                          }`}
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </nav>
    </div>

    <div className={`flex-shrink-0 bg-slate-900/50 border-t border-slate-800 p-4 ${(isSidebarCollapsed && !isMobile) ? 'px-2' : 'p-4'}`}>
      <div className={`flex items-center group ${(isSidebarCollapsed && !isMobile) ? 'justify-center' : 'justify-between'}`}>
        <div className="flex items-center">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-sm font-semibold shadow-md shadow-indigo-500/10 flex-shrink-0">
            {user?.name?.charAt(0).toUpperCase() || 'A'}
          </div>
          {!(isSidebarCollapsed && !isMobile) && (
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-semibold text-slate-200 truncate w-24">
                {user?.name || 'Admin'}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                Level 1 Admin
              </p>
            </div>
          )}
        </div>
        <button
          onClick={() => { dispatch(logout()); navigate('/login'); }}
          className={`p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all ${isSidebarCollapsed && !isMobile ? 'hidden' : 'block'}`}
          title="Logout"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
      {isSidebarCollapsed && !isMobile && (
        <button
          onClick={() => { dispatch(logout()); navigate('/login'); }}
          className="w-9 h-9 mt-4 mx-auto flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
          title="Logout"
        >
          <LogOut className="h-4 w-4" />
        </button>
      )}
    </div>
  </div>
);

export default AdminLayout;