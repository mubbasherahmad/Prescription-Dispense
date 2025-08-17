import { useState, useEffect } from 'react';

const Toast = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    setIsVisible(true);
    
    // Auto-remove after duration
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onRemove(toast.id), 300); // Wait for exit animation
    }, toast.duration || 4000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  const getToastStyles = () => {
    const baseStyles = "fixed right-4 z-50 max-w-sm w-full bg-white rounded-lg shadow-lg border-l-4 p-4 transition-all duration-300 transform";
    
    const typeStyles = {
      success: "border-green-500 bg-green-50",
      error: "border-red-500 bg-red-50", 
      info: "border-blue-500 bg-blue-50",
      warning: "border-yellow-500 bg-yellow-50"
    };

    const visibilityStyles = isVisible 
      ? "translate-x-0 opacity-100" 
      : "translate-x-full opacity-0";

    return `${baseStyles} ${typeStyles[toast.type] || typeStyles.info} ${visibilityStyles}`;
  };

  const getIcon = () => {
    const icons = {
      success: "✅",
      error: "❌", 
      info: "ℹ️",
      warning: "⚠️"
    };
    return icons[toast.type] || icons.info;
  };

  const getTextColor = () => {
    const colors = {
      success: "text-green-800",
      error: "text-red-800",
      info: "text-blue-800", 
      warning: "text-yellow-800"
    };
    return colors[toast.type] || colors.info;
  };

  return (
    <div 
      className={getToastStyles()}
      style={{ top: `${20 + (toast.index * 80)}px` }}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <span className="text-lg">{getIcon()}</span>
        </div>
        <div className="ml-3 w-0 flex-1">
          <p className={`text-sm font-medium ${getTextColor()}`}>
            {toast.message}
          </p>
          {toast.description && (
            <p className={`mt-1 text-sm ${getTextColor()} opacity-75`}>
              {toast.description}
            </p>
          )}
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            className={`inline-flex ${getTextColor()} hover:opacity-75 focus:outline-none`}
            onClick={() => {
              setIsVisible(false);
              setTimeout(() => onRemove(toast.id), 300);
            }}
          >
            <span className="sr-only">Close</span>
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toast;