import React from 'react';

export const Loader = ({ message = 'Loading delicious meals...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 space-y-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-gold-200 opacity-30"></div>
        <div className="absolute inset-0 rounded-full border-4 border-amber-600 border-t-transparent animate-spin"></div>
      </div>
      <p className="text-sm font-medium text-mocha-700 animate-pulse">{message}</p>
    </div>
  );
};

export default Loader;
