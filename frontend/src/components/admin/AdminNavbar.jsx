import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../store/store';
import { Home, LogOut, Shield } from 'lucide-react';

const AdminNavbar = () => {
  const { user } = useSelector(state => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="bg-indigo-600 p-1.5 rounded-md mr-3">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-semibold text-slate-900">Admin Panel</span>
              <span className="text-xs text-slate-400">Market Management</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/')}
              className="flex items-center px-3 py-2 text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Store
            </button>

            <div className="flex items-center space-x-3 px-3 py-2 bg-slate-50 rounded-md border border-slate-200">
              <div className="w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-slate-700">{user?.name}</span>
                <span className="text-xs text-indigo-600 font-medium">Administrator</span>
              </div>
            </div>

            <button
              onClick={() => { dispatch(logout()); navigate('/login'); }}
              className="flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
