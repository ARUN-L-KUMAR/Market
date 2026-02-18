import React, { useState } from 'react';

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
    sm: 'h-10 text-sm px-3 rounded-lg',
    md: 'h-12 text-sm px-4 rounded-xl',
    lg: 'h-14 text-base px-5 rounded-2xl',
  };

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className={`block text-sm font-semibold mb-2 transition-colors duration-200 ${error ? 'text-red-500' : isFocused ? 'text-primary-600' : 'text-slate-700'
            } ${labelClassName}`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative group">
        {startIcon && (
          <div className={`absolute inset-y-0 left-0 flex items-center pl-4 transition-colors duration-200 ${error ? 'text-red-400' : isFocused ? 'text-primary-500' : 'text-slate-400'
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
            w-full border-2 transition-all duration-300 text-slate-900 font-medium
            ${sizeClasses[size]}
            ${error
              ? 'border-red-100 bg-red-50/30 focus:border-red-500 focus:ring-4 focus:ring-red-500/5'
              : 'border-slate-100 bg-slate-50 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10'}
            ${startIcon ? 'pl-12' : ''}
            ${endIcon ? 'pr-12' : ''}
            ${disabled ? 'cursor-not-allowed opacity-50 bg-slate-100' : ''}
            placeholder:text-slate-400 placeholder:font-normal
            focus:outline-none
            ${inputClassName}
          `}
          {...props}
        />

        {endIcon && (
          <div className={`absolute inset-y-0 right-0 flex items-center pr-4 transition-colors duration-200 ${error ? 'text-red-400' : isFocused ? 'text-primary-500' : 'text-slate-400'
            }`}>
            {endIcon}
          </div>
        )}
      </div>

      {(error || helperText) && (
        <p className={`text-xs mt-2 px-1 font-medium ${error ? 'text-red-500' : 'text-slate-500'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
};

export default Input;
