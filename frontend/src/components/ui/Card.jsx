import React from 'react';
import { motion } from 'framer-motion';

const Card = ({
  children,
  className = '',
  hover = false,
  padding = 'default',
  animate = false,
  ...props
}) => {
  const paddingVariants = {
    none: "",
    sm: "p-4",
    default: "p-6",
    lg: "p-8",
    xl: "p-10",
  };

  const Container = animate ? motion.div : 'div';
  const animationProps = animate ? {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5 }
  } : {};

  return (
    <Container
      {...animationProps}
      className={`
        bg-white border border-slate-100 rounded-2xl shadow-premium overflow-hidden
        ${hover ? 'hover:shadow-xl hover:-translate-y-1 transition-all duration-300' : ''}
        ${paddingVariants[padding]}
        ${className}
      `}
      {...props}
    >
      {children}
    </Container>
  );
};

Card.Header = ({ children, className = '', ...props }) => (
  <div className={`border-b border-slate-50 pb-5 mb-5 ${className}`} {...props}>
    {children}
  </div>
);

Card.Body = ({ children, className = '', ...props }) => (
  <div className={className} {...props}>
    {children}
  </div>
);

Card.Footer = ({ children, className = '', ...props }) => (
  <div className={`border-t border-slate-50 pt-5 mt-5 ${className}`} {...props}>
    {children}
  </div>
);

Card.Image = ({ src, alt = '', className = '', height = '200px', ...props }) => (
  <div className="w-full overflow-hidden flex items-center justify-center rounded-t-2xl bg-slate-50" style={{ height }}>
    <img
      src={src}
      alt={alt}
      className={`w-full h-full object-contain hover:scale-105 transition-transform duration-500 ${className}`}
      {...props}
    />
  </div>
);

Card.Title = ({ children, className = '', ...props }) => (
  <h3 className={`text-xl font-bold text-slate-900 tracking-tight ${className}`} {...props}>
    {children}
  </h3>
);

export default Card;
