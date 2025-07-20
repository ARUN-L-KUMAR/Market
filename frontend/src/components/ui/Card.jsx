import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ 
  children, 
  className = '', 
  hover = false,
  shadow = 'md', 
  padding = 'default',
  animate = true,
  gradient = false,
  border = true,
  ...props 
}) => {
  const baseStyles = `
    ${gradient ? 'bg-gradient-to-br from-white to-gray-50' : 'bg-white'} 
    rounded-2xl 
    ${border ? 'border border-gray-200' : ''} 
    overflow-hidden 
    backdrop-blur-sm
  `;
  
  const hoverStyles = hover ? "transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer" : "";
  
  const shadowVariants = {
    none: "",
    sm: "shadow-sm",
    md: "shadow-lg shadow-gray-200/50",
    lg: "shadow-xl shadow-gray-300/50",
    xl: "shadow-2xl shadow-gray-400/25"
  };
  
  const paddingVariants = {
    none: "",
    sm: "p-3",
    default: "p-6",
    lg: "p-8",
    xl: "p-10"
  };

  const CardComponent = animate ? motion.div : 'div';

  return (
    <CardComponent
      className={`${baseStyles} ${shadowVariants[shadow]} ${paddingVariants[padding]} ${hoverStyles} ${className}`}
      initial={animate ? { opacity: 0, y: 20 } : {}}
      animate={animate ? { opacity: 1, y: 0 } : {}}
      whileHover={animate && hover ? { 
        scale: 1.02, 
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" 
      } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      {...props}
    >
      {children}
    </CardComponent>
  );
};

// Enhanced Card subcomponents
Card.Header = ({ children, className = '', divider = true, ...props }) => (
  <div className={`${divider ? 'border-b border-gray-100 pb-4 mb-6' : 'mb-4'} ${className}`} {...props}>
    {children}
  </div>
);

Card.Body = ({ children, className = '', ...props }) => (
  <div className={`${className}`} {...props}>
    {children}
  </div>
);

Card.Footer = ({ children, className = '', divider = true, ...props }) => (
  <div className={`${divider ? 'border-t border-gray-100 pt-4 mt-6' : 'mt-4'} ${className}`} {...props}>
    {children}
  </div>
);

Card.Footer = ({ children, className = '', ...props }) => (
  <div className={`border-t border-gray-200 pt-3 mt-3 ${className}`} {...props}>
    {children}
  </div>
);

Card.Image = ({ src, alt = '', className = '', height = '180px', ...props }) => (
  <div className="w-full overflow-hidden flex items-center justify-center" style={{ height }}>
    <img 
      src={src} 
      alt={alt} 
      className={`w-full h-full object-contain ${className}`} 
      style={{ objectFit: 'contain', objectPosition: 'center', height: '100%', width: '100%' }}
      {...props}
    />
  </div>
);

Card.Title = ({ children, className = '', ...props }) => (
  <h3 className={`font-semibold text-lg ${className}`} {...props}>
    {children}
  </h3>
);

export default Card;
