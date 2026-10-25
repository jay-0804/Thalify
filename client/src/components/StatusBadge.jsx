import React from 'react';

export const StatusBadge = ({ status, skipReason, failureReason }) => {
  const getBadgeStyle = () => {
    switch (status) {
      case 'scheduled':
        return 'bg-gold-100 text-mocha-900 border-gold-400';
      case 'delivered':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300';
      case 'skipped':
        return skipReason === 'pause'
          ? 'bg-mocha-100 text-mocha-700 border-mocha-200'
          : 'bg-amber-100 text-amber-800 border-amber-300';
      case 'cancelled':
        return 'bg-gray-100 text-gray-600 border-gray-300';
      case 'failed':
        return 'bg-rose-50 text-rose-800 border-rose-300';
      case 'active':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300';
      case 'pending':
        return 'bg-amber-50 text-amber-800 border-amber-300';
      case 'completed':
        return 'bg-mocha-100 text-mocha-700 border-mocha-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getLabel = () => {
    if (status === 'skipped') {
      return skipReason === 'pause' ? 'Skipped (Paused)' : 'Skipped (User)';
    }
    if (status === 'failed') {
      return failureReason ? `Failed (${failureReason.replace('_', ' ')})` : 'Failed';
    }
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border shadow-xs ${getBadgeStyle()}`}
    >
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current opacity-70"></span>
      {getLabel()}
    </span>
  );
};

export default StatusBadge;
