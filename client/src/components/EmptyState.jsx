import React from 'react';

export const EmptyState = ({
  icon = '🍱',
  title = 'No items found',
  description = 'There are no records matching your current selection.',
  actionText,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 my-6 text-center bg-white/70 border border-mocha-200/60 rounded-2xl shadow-xs">
      <div className="w-16 h-16 mb-4 flex items-center justify-center text-3xl bg-gold-50 border border-gold-200 rounded-full shadow-inner">
        {icon}
      </div>
      <h3 className="text-lg font-serif font-bold text-mocha-900 mb-1">{title}</h3>
      <p className="text-sm text-mocha-600 max-w-sm mb-5">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-smooth"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
