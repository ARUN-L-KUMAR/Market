import React from 'react';

const StatusIndicator = ({ 
  status = 'online', 
  label = '', 
  size = 'sm', 
  animated = false, 
  hideLabel = false,
  className = ''
}) => {
  // Status colors
  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-red-500',
    away: 'bg-yellow-500',
    busy: 'bg-orange-500',
    pending: 'bg-blue-500',
    custom: 'bg-purple-500'
  };
  
  // Size classes
  const sizeClasses = {
    xs: 'h-1.5 w-1.5',
    sm: 'h-2.5 w-2.5',
    md: 'h-3 w-3',
    lg: 'h-4 w-4'
  };
  
  // Label size classes
  const labelSizeClasses = {
    xs: 'text-xs',
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-sm'
  };
  
  const colorClass = statusColors[status] || statusColors.custom;
  
  return (
    <div className={`flex items-center ${className}`}>
      <div className="relative flex-shrink-0">
        <div className={`rounded-full ${sizeClasses[size]} ${colorClass}`}></div>
        
        {/* Ping animation */}
        {animated && (
          <div className="absolute inset-0">
            <div className={`animate-ping rounded-full ${sizeClasses[size]} ${colorClass} opacity-75`}></div>
          </div>
        )}
      </div>
      
      {!hideLabel && label && (
        <span className={`ml-1.5 ${labelSizeClasses[size]}`}>{label}</span>
      )}
    </div>
  );
};

export default StatusIndicator;
