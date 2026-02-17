import React from 'react';

const Card = ({
  children,
  className = '',
  hover = false,
  padding = 'default',
  ...props
}) => {
  const paddingVariants = {
    none: "",
    sm: "p-4",
    default: "p-6",
    lg: "p-8",
  };

  return (
    <div
      className={`
        bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden
        ${hover ? 'hover:shadow transition-shadow duration-200' : ''}
        ${paddingVariants[padding]}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

Card.Header = ({ children, className = '', ...props }) => (
  <div className={`border-b border-slate-200 pb-4 mb-4 ${className}`} {...props}>
    {children}
  </div>
);

Card.Body = ({ children, className = '', ...props }) => (
  <div className={className} {...props}>
    {children}
  </div>
);

Card.Footer = ({ children, className = '', ...props }) => (
  <div className={`border-t border-slate-200 pt-4 mt-4 ${className}`} {...props}>
    {children}
  </div>
);

Card.Image = ({ src, alt = '', className = '', height = '180px', ...props }) => (
  <div className="w-full overflow-hidden flex items-center justify-center rounded-t-lg" style={{ height }}>
    <img
      src={src}
      alt={alt}
      className={`w-full h-full object-contain ${className}`}
      {...props}
    />
  </div>
);

Card.Title = ({ children, className = '', ...props }) => (
  <h3 className={`text-lg font-semibold text-slate-900 ${className}`} {...props}>
    {children}
  </h3>
);

export default Card;
