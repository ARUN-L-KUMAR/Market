import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ 
  size = 'md', 
  color = 'blue', 
  text = '',
  variant = 'spinner',
  className = '' 
}) => {
  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colorClasses = {
    blue: 'text-blue-600',
    red: 'text-red-600',
    green: 'text-green-600',
    yellow: 'text-yellow-600',
    gray: 'text-gray-600',
    purple: 'text-purple-600'
  };

  const SpinnerVariant = () => (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className={`${sizeClasses[size]} ${colorClasses[color]} ${className}`}
    >
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle 
          className="opacity-25" 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="4"
        />
        <path 
          className="opacity-75" 
          fill="currentColor" 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </motion.div>
  );

  const DotsVariant = () => (
    <div className={`flex space-x-1 ${className}`}>
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className={`${colorClasses[color]} bg-current rounded-full`}
          style={{ 
            width: size === 'xs' ? '4px' : size === 'sm' ? '6px' : size === 'md' ? '8px' : size === 'lg' ? '12px' : '16px',
            height: size === 'xs' ? '4px' : size === 'sm' ? '6px' : size === 'md' ? '8px' : size === 'lg' ? '12px' : '16px' 
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: index * 0.2
          }}
        />
      ))}
    </div>
  );

  const PulseVariant = () => (
    <motion.div
      className={`${sizeClasses[size]} ${colorClasses[color]} bg-current rounded-full ${className}`}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [1, 0.5, 1]
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity
      }}
    />
  );

  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return <DotsVariant />;
      case 'pulse':
        return <PulseVariant />;
      default:
        return <SpinnerVariant />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[200px]">
      {renderSpinner()}
      {text && (
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className={`mt-3 text-sm font-medium ${colorClasses[color]}`}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
};

export default LoadingSpinner;