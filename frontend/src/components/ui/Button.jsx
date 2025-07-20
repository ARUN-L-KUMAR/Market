import React from 'react';
import { motion } from 'framer-motion';

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  disabled = false, 
  type = 'button', 
  icon = null,
  iconPosition = 'left',
  loading = false,
  fullWidth = false,
  animate = true,
  ...props 
}) => {
  // Base classes for all buttons with enhanced styling
  const baseClasses = "rounded-xl font-semibold transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-offset-2 inline-flex items-center justify-center relative overflow-hidden group";
  
  // Enhanced variant classes with gradients and better hover effects
  const variantClasses = {
    primary: "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:ring-blue-500/50 text-white border border-transparent shadow-lg hover:shadow-xl transform hover:-translate-y-0.5",
    secondary: "bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 focus:ring-gray-500/50 text-gray-800 border border-gray-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5",
    outline: "bg-white hover:bg-gray-50 focus:ring-blue-500/50 text-blue-700 border-2 border-blue-600 hover:border-blue-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5",
    danger: "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 focus:ring-red-500/50 text-white border border-transparent shadow-lg hover:shadow-xl transform hover:-translate-y-0.5",
    success: "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:ring-green-500/50 text-white border border-transparent shadow-lg hover:shadow-xl transform hover:-translate-y-0.5",
    ghost: "bg-transparent hover:bg-gray-100 focus:ring-gray-500/50 text-gray-700 border border-transparent hover:shadow-md",
    link: "bg-transparent hover:bg-blue-50 focus:ring-blue-500/50 text-blue-600 border-none p-0 hover:underline",
    disabled: "bg-gray-300 text-gray-500 cursor-not-allowed border border-transparent shadow-none"
  };
  
  // Enhanced size classes
  const sizeClasses = {
    xs: "text-xs px-2.5 py-1.5 min-h-[28px]",
    sm: "text-sm px-3 py-2 min-h-[36px]",
    md: "text-base px-6 py-3 min-h-[44px]",
    lg: "text-lg px-8 py-4 min-h-[52px]",
    xl: "text-xl px-10 py-5 min-h-[60px]"
  };
  
  // Icon positioning
  const iconLeftClass = iconPosition === 'left' && icon ? 'mr-2' : '';
  const iconRightClass = iconPosition === 'right' && icon ? 'ml-2' : '';
  
  // Button content with enhanced loading state
  const buttonContent = (
    <>
      {/* Ripple effect */}
      <span className="absolute inset-0 bg-white/20 scale-0 group-active:scale-100 transition-transform duration-300 rounded-xl"></span>
      
      {loading ? (
        <div className="flex items-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="mr-2"
          >
            <svg className="h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </motion.div>
          <span>{children}</span>
        </div>
      ) : (
        <div className="flex items-center relative z-10">
          {icon && iconPosition === 'left' && <span className={iconLeftClass}>{icon}</span>}
          <span>{children}</span>
          {icon && iconPosition === 'right' && <span className={iconRightClass}>{icon}</span>}
        </div>
      )}
    </>
  );

  const ButtonComponent = animate ? motion.button : 'button';

  return (
    <ButtonComponent
      type={type}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`
        ${baseClasses} 
        ${disabled ? variantClasses.disabled : variantClasses[variant]} 
        ${sizeClasses[size]} 
        ${fullWidth ? 'w-full' : ''}
        ${className}
        ${loading ? 'cursor-wait' : ''}
      `}
      whileHover={animate && !disabled ? { scale: 1.02 } : {}}
      whileTap={animate && !disabled ? { scale: 0.98 } : {}}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      {...props}
    >
      {buttonContent}
    </ButtonComponent>
  );
};

export default Button;
