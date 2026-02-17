import React from 'react';

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
  const baseClasses = "inline-flex items-center justify-center font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variantClasses = {
    primary: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm border border-transparent focus:ring-indigo-500",
    secondary: "bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-sm focus:ring-indigo-500",
    outline: "bg-transparent hover:bg-slate-50 text-slate-700 border border-slate-300 focus:ring-indigo-500",
    danger: "bg-red-600 hover:bg-red-700 text-white shadow-sm border border-transparent focus:ring-red-500",
    success: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm border border-transparent focus:ring-emerald-500",
    ghost: "bg-transparent hover:bg-slate-100 text-slate-700 focus:ring-slate-500",
    link: "bg-transparent hover:underline text-indigo-600 p-0 shadow-none focus:ring-indigo-500",
  };

  const sizeClasses = {
    xs: "text-xs px-2 py-1 rounded",
    sm: "text-sm px-3 py-1.5 rounded-md",
    md: "text-sm px-4 py-2 rounded-md",
    lg: "text-base px-5 py-2.5 rounded-md",
    xl: "text-base px-6 py-3 rounded-md",
  };

  const iconLeftClass = iconPosition === 'left' && icon ? 'mr-2' : '';
  const iconRightClass = iconPosition === 'right' && icon ? 'ml-2' : '';

  return (
    <button
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
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>{children}</span>
        </div>
      ) : (
        <div className="flex items-center">
          {icon && iconPosition === 'left' && <span className={iconLeftClass}>{icon}</span>}
          <span>{children}</span>
          {icon && iconPosition === 'right' && <span className={iconRightClass}>{icon}</span>}
        </div>
      )}
    </button>
  );
};

export default Button;
