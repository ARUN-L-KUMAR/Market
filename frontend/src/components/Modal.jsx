import React, { useEffect, useRef } from 'react';
import Button from './ui/Button';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  actions,
  size = 'md',
  closeOnClickOutside = true,
  showCloseButton = true,
  className = ''
}) => {
  const modalRef = useRef(null);

  // Close modal on Escape key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);

    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Handle click outside
  const handleOutsideClick = (e) => {
    if (closeOnClickOutside && modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Size classes
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    'full': 'max-w-full'
  };

  // Return null if modal is closed
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-600 bg-opacity-50 flex justify-center items-center p-4"
      onClick={handleOutsideClick}
    >
      <div
        ref={modalRef}
        className={`
          bg-white rounded-lg shadow-sm w-full ${sizeClasses[size]} ${className}
        `}
      >
        {/* Header */}
        <div className="px-6 py-4 flex justify-between items-center border-b border-slate-200">
          <h3 className="text-lg font-medium text-slate-900">{title}</h3>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          {children}
        </div>

        {/* Footer */}
        {actions && (
          <div className="px-6 py-4 border-t border-slate-200 flex justify-end space-x-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

// Predefined modal types
export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary',
  size = 'md'
}) => {
  // If message is a string, render as <p>. If it's a React element, render as <span> to avoid <div> in <p>.
  const isString = typeof message === 'string';
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size={size}
      actions={[
        <Button key="cancel" variant="outline" onClick={onClose}>
          {cancelText}
        </Button>,
        <Button key="confirm" variant={confirmVariant} onClick={() => { console.log('Confirm button clicked'); onConfirm(); }}>
          {confirmText}
        </Button>
      ]}
    >
      {isString ? (
        <p className="text-slate-700">{message}</p>
      ) : (
        <span className="text-slate-700">{message}</span>
      )}
    </Modal>
  );
};

export const AlertModal = ({
  isOpen,
  onClose,
  title,
  message,
  buttonText = 'OK',
  variant = 'primary',
  size = 'md'
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size={size}
      actions={[
        <Button key="ok" variant={variant} onClick={onClose}>
          {buttonText}
        </Button>
      ]}
    >
      <p className="text-slate-700">{message}</p>
    </Modal>
  );
};

export default Modal;