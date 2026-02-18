import React from 'react';

const LoadingSpinner = ({
  size = 'md',
  text = '',
  className = ''
}) => {
  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return (
    <div className={`flex flex-col items-center justify-center min-h-[400px] ${className}`}>
      <div className="relative">
        <svg
          className={`animate-spin ${sizeClasses[size]} text-primary-600`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-10" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <div className={`absolute inset-0 blur-xl bg-primary-500/20 rounded-full animate-pulse`} />
      </div>
      {text && (
        <p className="mt-6 text-[10px] font-bold uppercase tracking-widest text-slate-400 animate-pulse">{text}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;