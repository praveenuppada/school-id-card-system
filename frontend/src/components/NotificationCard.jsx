import React, { useState, useEffect } from 'react';

const NotificationCard = ({ 
  type = 'info', 
  title, 
  message, 
  duration = 5000, 
  onClose,
  show = true 
}) => {
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    setIsVisible(show);
    
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  if (!isVisible) return null;

  const getCardStyles = () => {
    const baseStyles = "fixed top-4 right-4 max-w-sm w-full bg-white rounded-lg shadow-lg border-l-4 p-4 z-50 transform transition-all duration-300 ease-in-out";
    
    switch (type) {
      case 'success':
        return `${baseStyles} border-green-500`;
      case 'error':
        return `${baseStyles} border-red-500`;
      case 'warning':
        return `${baseStyles} border-yellow-500`;
      case 'info':
      default:
        return `${baseStyles} border-blue-500`;
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  const getTitleColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      case 'info':
      default:
        return 'text-blue-800';
    }
  };

  return (
    <div className={getCardStyles()}>
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-3">
          <span className="text-2xl">{getIcon()}</span>
        </div>
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className={`text-sm font-semibold ${getTitleColor()} mb-1`}>
              {title}
            </h4>
          )}
          {message && (
            <p className="text-sm text-gray-700">
              {message}
            </p>
          )}
        </div>
        <div className="flex-shrink-0 ml-2">
          <button
            onClick={() => {
              setIsVisible(false);
              if (onClose) onClose();
            }}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationCard;
