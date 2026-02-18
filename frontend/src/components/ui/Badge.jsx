import React from 'react';

const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  dot = false,
  ...props
}) => {
  const baseClasses = "inline-flex items-center font-semibold rounded-full";

  const variantClasses = {
    default: "bg-slate-100 text-slate-700 border border-slate-200",
    primary: "bg-primary-50 text-primary-700 border border-primary-100",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    danger: "bg-red-50 text-red-700 border border-red-100",
    warning: "bg-amber-50 text-amber-700 border border-amber-200",
    info: "bg-sky-50 text-sky-700 border border-sky-100",
    dark: "bg-slate-900 text-slate-100",
  };

  const sizeClasses = {
    xs: "text-[10px] px-2 py-0.5",
    sm: "text-[11px] px-2.5 py-0.5",
    md: "text-xs px-3 py-1",
    lg: "text-sm px-4 py-1.5",
  };

  const dotColors = {
    default: "bg-slate-400",
    primary: "bg-primary-500",
    success: "bg-emerald-500",
    danger: "bg-red-500",
    warning: "bg-amber-500",
    info: "bg-sky-500",
    dark: "bg-slate-400",
  };

  return (
    <span
      className={`
        ${baseClasses}
        ${variantClasses[variant] || variantClasses.default} 
        ${sizeClasses[size]} 
        ${className}
      `}
      {...props}
    >
      {dot && (
        <span className={`inline-block w-1.5 h-1.5 mr-1.5 rounded-full ${dotColors[variant] || dotColors.default}`} />
      )}
      {children}
    </span>
  );
};

export default Badge;
