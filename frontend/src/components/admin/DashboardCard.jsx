import React from 'react';
import { motion } from 'framer-motion';

const DashboardCard = ({ title, value, icon, change }) => {
  // Determine if change is positive, negative, or neutral
  const isPositive = change > 0;
  const isNegative = change < 0;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="bg-white/80 backdrop-blur-lg p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
        <motion.div 
          whileHover={{ rotate: 5, scale: 1.1 }}
          className="text-2xl bg-gradient-to-r from-primary-50 to-purple-50 text-primary-600 p-3 rounded-xl"
        >
          {icon}
        </motion.div>
      </div>
      
      <div className="flex flex-col">
        <motion.span 
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1 }}
          className="text-3xl font-bold mb-1 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent"
        >
          {value}
        </motion.span>
        
        {change !== undefined && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center"
          >
            {isPositive && (
              <span className="text-green-500 flex items-center text-sm font-medium bg-green-50 px-2 py-1 rounded-full">
                <motion.svg 
                  initial={{ y: 2 }}
                  animate={{ y: 0 }}
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-4 w-4 mr-1" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </motion.svg>
                {Math.abs(change)}%
              </span>
            )}
            
            {isNegative && (
              <span className="text-red-500 flex items-center text-sm font-medium bg-red-50 px-2 py-1 rounded-full">
                <motion.svg 
                  initial={{ y: -2 }}
                  animate={{ y: 0 }}
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-4 w-4 mr-1" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </motion.svg>
                {Math.abs(change)}%
              </span>
            )}
            
            {!isPositive && !isNegative && change !== undefined && (
              <span className="text-gray-500 text-sm bg-gray-50 px-2 py-1 rounded-full">No change</span>
            )}
            
            <span className="text-gray-400 text-xs ml-2">vs last month</span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default DashboardCard;