import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const ErrorBanner = ({ message, onRetry }) => {
  if (!message) return null;

  return (
    <div className="flex items-center justify-between p-4 my-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 shadow-xs">
      <div className="flex items-center space-x-3">
        <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
        <p className="text-sm font-medium">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center space-x-1.5 px-3 py-1 bg-white hover:bg-rose-100 text-rose-700 text-xs font-semibold border border-rose-300 rounded-lg shadow-xs transition-smooth"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry</span>
        </button>
      )}
    </div>
  );
};

export default ErrorBanner;
