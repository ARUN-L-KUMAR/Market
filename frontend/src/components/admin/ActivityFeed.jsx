import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const ActivityFeed = ({ activities = [] }) => {
  // Function to format date
  const formatTime = (date) => {
    const now = new Date();
    const activityDate = new Date(date);
    const diffInSeconds = Math.floor((now - activityDate) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`;
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
    
    // For older activities, show the actual date
    return activityDate.toLocaleDateString();
  };
  
  // Function to get activity icon
  const getActivityIcon = (type) => {
    switch (type) {
      case 'order':
        return (
          <motion.div 
            whileHover={{ scale: 1.1 }}
            className="bg-gradient-to-r from-blue-100 to-blue-200 p-2 rounded-xl shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </motion.div>
        );
      case 'user':
        return (
          <motion.div 
            whileHover={{ scale: 1.1 }}
            className="bg-gradient-to-r from-green-100 to-green-200 p-2 rounded-xl shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </motion.div>
        );
      case 'product':
        return (
          <motion.div 
            whileHover={{ scale: 1.1 }}
            className="bg-gradient-to-r from-purple-100 to-purple-200 p-2 rounded-xl shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </motion.div>
        );
      case 'cart':
        return (
          <motion.div 
            whileHover={{ scale: 1.1 }}
            className="bg-gradient-to-r from-yellow-100 to-yellow-200 p-2 rounded-xl shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </motion.div>
        );
      case 'wishlist':
        return (
          <motion.div 
            whileHover={{ scale: 1.1 }}
            className="bg-gradient-to-r from-red-100 to-red-200 p-2 rounded-xl shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </motion.div>
        );
      default:
        return (
          <motion.div 
            whileHover={{ scale: 1.1 }}
            className="bg-gradient-to-r from-gray-100 to-gray-200 p-2 rounded-xl shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </motion.div>
        );
    }
  };
  
  // Function to get activity link
  const getActivityLink = (activity) => {
    switch (activity.type) {
      case 'order':
        return `/admin/orders/${activity.data?._id}`;
      case 'user':
        return `/admin/users/${activity.data?._id}`;
      case 'product':
        return `/admin/products/${activity.data?._id}`;
      default:
        return '#';
    }
  };
  
  return (
    <div className="flow-root max-h-96 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
      <AnimatePresence>
        {activities.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
          >
            <div className="text-gray-400 mb-2">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">No recent activity</p>
            <p className="text-sm text-gray-400">Activity will appear here as users interact with your store</p>
          </motion.div>
        ) : (
          <motion.ul 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="-mb-8"
          >
            {activities.map((activity, index) => (
              <motion.li 
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ x: 4 }}
              >
                <div className="relative pb-8">
                  {index !== activities.length - 1 && (
                    <span className="absolute top-6 left-6 -ml-px h-full w-0.5 bg-gradient-to-b from-gray-200 to-transparent" aria-hidden="true"></span>
                  )}
                  <div className="relative flex items-start space-x-4">
                    <div className="relative">
                      {getActivityIcon(activity.type)}
                      {index === 0 && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1 -right-1 w-3 h-3 bg-primary-500 rounded-full border-2 border-white"
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1 bg-gray-50/50 rounded-lg p-3 hover:bg-gray-100/50 transition-colors">
                      <div>
                        <div className="text-sm">
                          <Link 
                            to={getActivityLink(activity)}
                            className="font-medium text-gray-900 hover:text-primary-600 transition-colors"
                          >
                            {activity.message}
                          </Link>
                        </div>
                        <p className="mt-1 text-xs text-gray-500 flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {formatTime(activity.time)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ActivityFeed;