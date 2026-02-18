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
  ...props
}) => {
  const baseClasses = "btn-premium inline-flex items-center justify-center font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none";

  const variantClasses = {
    primary: "bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-500/25 border-transparent focus:ring-primary-500",
    secondary: "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm focus:ring-slate-500",
    outline: "bg-transparent hover:bg-slate-50 text-slate-700 border-2 border-slate-200 focus:ring-slate-500 hover:border-slate-300",
    danger: "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25 focus:ring-red-500",
    success: "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25 focus:ring-emerald-500",
    ghost: "bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900 focus:ring-slate-500",
    link: "bg-transparent hover:text-primary-600 text-slate-600 p-0 shadow-none focus:ring-primary-500 underline-offset-4 hover:underline",
    premium: "bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-800 text-white shadow-xl shadow-primary-900/20 hover:shadow-primary-900/40 hover:-translate-y-0.5"
  };

  const sizeClasses = {
    xs: "text-xs px-2.5 py-1.5 rounded-md",
    sm: "text-sm px-4 py-2 rounded-lg",
    md: "text-sm px-6 py-3 rounded-xl",
    lg: "text-base px-8 py-4 rounded-2xl",
    xl: "text-lg px-10 py-5 rounded-3xl",
  };

  const iconLeftClass = iconPosition === 'left' && icon ? 'mr-2.5' : '';
  const iconRightClass = iconPosition === 'right' && icon ? 'ml-2.5' : '';

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      type={type}
      onClick={disabled || loading ? undefined : onClick}
      disabled={disabled || loading}
      className={`
        ${baseClasses} 
        ${variantClasses[variant] || variantClasses.primary} 
        ${sizeClasses[size]} 
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <div className="flex items-center">
          <svg className="animate-spin -ml-1 mr-2.5 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="opacity-90">{children}</span>
        </div>
      ) : (
        <div className="flex items-center">
          {icon && iconPosition === 'left' && <span className={iconLeftClass}>{icon}</span>}
          <span className="relative z-10">{children}</span>
          {icon && iconPosition === 'right' && <span className={iconRightClass}>{icon}</span>}
        </div>
      )}
    </motion.button>
  );
};

export default Button;
