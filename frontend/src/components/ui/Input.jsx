import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Input = ({
  type = 'text',
  id,
  name,
  label,
  value,
  onChange,
  onBlur,
  onFocus,
  placeholder,
  error,
  helperText,
  required = false,
  disabled = false,
  className = '',
  labelClassName = '',
  inputClassName = '',
  startIcon = null,
  endIcon = null,
  size = 'md',
  variant = 'default',
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const sizeClasses = {
    sm: 'h-9 text-sm',
    md: 'h-11 text-base',
    lg: 'h-13 text-lg'
  };

  const variantClasses = {
    default: `
      border-2 bg-white
      ${error ? 'border-red-400 focus:border-red-500' : 
        isFocused ? 'border-blue-500' : 'border-gray-300 hover:border-gray-400'}
      focus:ring-4 focus:ring-blue-100
    `,
    filled: `
      border-2 bg-gray-50
      ${error ? 'border-red-400 focus:border-red-500 bg-red-50' : 
        isFocused ? 'border-blue-500 bg-blue-50' : 'border-transparent hover:bg-gray-100'}
      focus:ring-4 focus:ring-blue-100
    `,
    outlined: `
      border-2 bg-transparent
      ${error ? 'border-red-400 focus:border-red-500' : 
        isFocused ? 'border-blue-500' : 'border-gray-400 hover:border-gray-500'}
      focus:ring-4 focus:ring-blue-100
    `
  };

  return (
    <div className={`relative ${className}`}>
      <AnimatePresence>
        {label && (
          <motion.label 
            htmlFor={id} 
            className={`block text-sm font-semibold mb-2 transition-colors duration-200 ${
              error ? 'text-red-600' : 
              isFocused ? 'text-blue-600' : 'text-gray-700'
            } ${labelClassName}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </motion.label>
        )}
      </AnimatePresence>
      
      <div className="relative group">
        {startIcon && (
          <div className={`absolute inset-y-0 left-0 flex items-center pl-3 transition-colors duration-200 ${
            error ? 'text-red-400' : 
            isFocused ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
          }`}>
            {startIcon}
          </div>
        )}
        
        <input
          type={type}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`
            w-full rounded-xl transition-all duration-200 ease-in-out
            ${sizeClasses[size]}
            ${variantClasses[variant]}
            ${startIcon ? 'pl-10' : 'pl-4'}
            ${endIcon ? 'pr-10' : 'pr-4'}
            ${disabled ? 'cursor-not-allowed opacity-60 bg-gray-100' : ''}
            placeholder:text-gray-400
            ${inputClassName}
          `}
          {...props}
        />
        
        {endIcon && (
          <div className={`absolute inset-y-0 right-0 flex items-center pr-3 transition-colors duration-200 ${
            error ? 'text-red-400' : 
            isFocused ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
          }`}>
            {endIcon}
          </div>
        )}
      </div>

      <AnimatePresence>
        {(error || helperText) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className={`text-sm mt-2 ${error ? 'text-red-600' : 'text-gray-500'}`}>
              {error || helperText}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Input;