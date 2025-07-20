import React from 'react';
import { motion } from 'framer-motion';

const Badge = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  rounded = true,
  dot = false,
  animate = true,
  pulse = false,
  ...props 
}) => {
  const baseClasses = "inline-flex items-center font-semibold transition-all duration-200";
  
  const variantClasses = {
    primary: "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300",
    secondary: "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300",
    success: "bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300",
    danger: "bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300", 
    warning: "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-300",
    info: "bg-gradient-to-r from-cyan-100 to-cyan-200 text-cyan-800 border border-cyan-300",
    light: "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-600 border border-gray-200",
    dark: "bg-gradient-to-r from-gray-800 to-gray-900 text-white border border-gray-700"
  };
  
  const sizeClasses = {
    xs: "text-xs px-2 py-1",
    sm: "text-xs px-2.5 py-1",
    md: "text-sm px-3 py-1.5", 
    lg: "text-base px-4 py-2"
  };
  
  const roundedClasses = rounded ? 'rounded-full' : 'rounded-lg';
  
  const BadgeComponent = animate ? motion.span : 'span';
  
  return (
    <BadgeComponent
      className={`
        ${baseClasses}
        ${variantClasses[variant]} 
        ${sizeClasses[size]} 
        ${roundedClasses}
        ${pulse ? 'animate-pulse' : ''}
        ${className}
      `}
      initial={animate ? { scale: 0, opacity: 0 } : {}}
      animate={animate ? { scale: 1, opacity: 1 } : {}}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      {...props}
    >
      {dot && (
        <motion.span 
          className={`inline-block w-2 h-2 mr-2 rounded-full ${
            variant === 'primary' ? 'bg-blue-500' :
            variant === 'secondary' ? 'bg-gray-500' :
            variant === 'success' ? 'bg-green-500' :
            variant === 'danger' ? 'bg-red-500' :
            variant === 'warning' ? 'bg-yellow-500' :
            variant === 'info' ? 'bg-cyan-500' :
            variant === 'light' ? 'bg-gray-400' :
            'bg-gray-200'
          }`}
          animate={pulse ? { scale: [1, 1.2, 1] } : {}}
          transition={pulse ? { duration: 1, repeat: Infinity } : {}}
        />
      )}
      {children}
    </BadgeComponent>
  );
};

export default Badge;
