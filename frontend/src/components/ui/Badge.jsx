import React from 'react';

const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  dot = false,
  ...props
}) => {
  const baseClasses = "inline-flex items-center font-medium";

  const variantClasses = {
    default: "bg-slate-100 text-slate-700 border border-slate-200",
    primary: "bg-indigo-50 text-indigo-700 border border-indigo-100",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    danger: "bg-red-50 text-red-700 border border-red-100",
    warning: "bg-amber-50 text-amber-700 border border-amber-100",
    info: "bg-sky-50 text-sky-700 border border-sky-100",
    dark: "bg-slate-900 text-slate-100",
  };

  const sizeClasses = {
    xs: "text-xs px-1.5 py-0.5",
    sm: "text-xs px-2 py-0.5",
    md: "text-xs px-2.5 py-1",
    lg: "text-sm px-3 py-1",
  };

  const dotColors = {
    default: "bg-slate-500",
    primary: "bg-indigo-500",
    success: "bg-emerald-500",
    danger: "bg-red-500",
    warning: "bg-amber-500",
    info: "bg-sky-500",
    dark: "bg-slate-300",
  };

  return (
    <span
      className={`
        ${baseClasses}
        ${variantClasses[variant]} 
        ${sizeClasses[size]} 
        rounded-md
        ${className}
      `}
      {...props}
    >
      {dot && (
        <span className={`inline-block w-1.5 h-1.5 mr-1.5 rounded-full ${dotColors[variant]}`} />
      )}
      {children}
    </span>
  );
};

export default Badge;
