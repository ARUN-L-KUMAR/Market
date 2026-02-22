import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

/**
 * Premium Dropdown Component
 * @param {Object} props
 * @param {Array} props.options - Array of { label, value } or strings
 * @param {any} props.value - Current selected value
 * @param {Function} props.onChange - Selection handler
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.label - Optional label for the dropdown
 * @param {string} props.className - Additional wrapper classes
 * @param {boolean} props.fullWidth - If true, takes 100% width
 */
const Dropdown = ({
    options = [],
    value,
    onChange,
    placeholder = 'Select option',
    label,
    className = '',
    fullWidth = true
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Normalize options to { label, value } objects
    const normalizedOptions = options.map(opt =>
        typeof opt === 'string' ? { label: opt, value: opt } : opt
    );

    const selectedOption = normalizedOptions.find(opt => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (optionValue) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    return (
        <div className={`relative ${fullWidth ? 'w-full' : 'w-auto'} ${className}`} ref={dropdownRef}>
            {label && (
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block ml-1">
                    {label}
                </label>
            )}

            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`
          flex items-center justify-between w-full px-5 py-4 
          bg-slate-50 border border-slate-100 rounded-2xl 
          text-[11px] font-black uppercase tracking-widest text-slate-900 
          hover:bg-white hover:border-primary-500 hover:shadow-md 
          transition-all duration-300 font-outfit outline-none
          ${isOpen ? 'ring-4 ring-primary-500/5 border-primary-500 bg-white' : ''}
        `}
            >
                <span className={!selectedOption ? 'text-slate-400' : ''}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: "anticipate" }}
                >
                    <ChevronDown className={`w-4 h-4 transition-colors ${isOpen ? 'text-primary-600' : 'text-slate-400'}`} />
                </motion.div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="absolute z-[100] w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl shadow-slate-200/50 overflow-hidden max-h-64 overflow-y-auto"
                    >
                        <div className="p-2 space-y-1">
                            {normalizedOptions.map((option, index) => {
                                const isActive = option.value === value;
                                return (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => handleSelect(option.value)}
                                        className={`
                      flex items-center justify-between w-full px-4 py-3 rounded-xl 
                      text-[10px] font-black uppercase tracking-widest transition-all duration-200
                      ${isActive
                                                ? 'bg-primary-50 text-primary-600'
                                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                    `}
                                    >
                                        <span>{option.label}</span>
                                        {isActive && <Check className="w-3.5 h-3.5" />}
                                    </button>
                                );
                            })}
                            {normalizedOptions.length === 0 && (
                                <div className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
                                    No options available
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Dropdown;
