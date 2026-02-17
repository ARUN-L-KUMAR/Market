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
    sm: 'h-8 text-sm',
    md: 'h-10 text-sm',
    lg: 'h-12 text-base',
  };

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className={`block text-sm font-medium mb-1.5 ${error ? 'text-red-600' : 'text-slate-700'
            } ${labelClassName}`}
        >
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}

      <div className="relative">
        {startIcon && (
          <div className={`absolute inset-y-0 left-0 flex items-center pl-3 ${error ? 'text-red-400' : 'text-slate-400'
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
            w-full rounded-md border transition-all duration-200 text-slate-900
            ${sizeClasses[size]}
            ${error
              ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
              : 'border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'}
            ${startIcon ? 'pl-10' : 'pl-3'}
            ${endIcon ? 'pr-10' : 'pr-3'}
            ${disabled ? 'cursor-not-allowed opacity-50 bg-slate-50' : 'bg-white'}
            placeholder:text-slate-400
            focus:outline-none
            ${inputClassName}
          `}
          {...props}
        />

        {endIcon && (
          <div className={`absolute inset-y-0 right-0 flex items-center pr-3 ${error ? 'text-red-400' : 'text-slate-400'
            }`}>
            {endIcon}
          </div>
        )}
      </div>

      {(error || helperText) && (
        <p className={`text-xs mt-1.5 ${error ? 'text-red-600' : 'text-slate-500'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
};

export default Input;