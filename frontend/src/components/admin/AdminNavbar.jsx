import React from 'react';
import { motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../store/store';
import { 
  Settings, 
  LogOut, 
  User, 
  Home,
  Shield
} from 'lucide-react';

const AdminNavbar = () => {
  const { user } = useSelector(state => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleBackToStore = () => {
    navigate('/');
  };

  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200 sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Admin Logo */}
          <motion.div 
            className="flex items-center"
            whileHover={{ scale: 1.02 }}
          >
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-2 rounded-xl mr-3 shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Admin Panel
              </span>
              <span className="text-xs text-gray-500">Market Management</span>
            </div>
          </motion.div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Back to Store */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBackToStore}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Store
            </motion.button>

            {/* Admin User Info */}
            <div className="flex items-center space-x-3 px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center shadow-md">
                <span className="text-white text-sm font-semibold">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-800">{user?.name}</span>
                <span className="text-xs text-indigo-600 font-medium">Administrator</span>
              </div>
            </div>

            {/* Logout Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-200"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </motion.button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default AdminNavbar;
