import React, { useState, useEffect } from 'react';
import api from '../../api/axios.js';
import { Loader } from '../../components/Loader.jsx';
import { ErrorBanner } from '../../components/ErrorBanner.jsx';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import { Modal } from '../../components/Modal.jsx';
import {
  Truck,
  CheckCircle,
  XCircle,
  Phone,
  MapPin,
  Clock,
  AlertCircle,
  ShieldAlert,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const TodayDrops = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionInProgressId, setActionInProgressId] = useState(null);

  // Failure Modal
  const [failedTaskId, setFailedTaskId] = useState(null);
  const [failureReason, setFailureReason] = useState('customer_unavailable');
  const [isFailModalOpen, setIsFailModalOpen] = useState(false);

  const fetchTodayDrops = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/delivery/today');
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load assigned delivery drops');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayDrops();
  }, []);

  // Mark Delivered (BR-10)
  const handleMarkDelivered = async (taskId) => {
    setActionInProgressId(taskId);
    try {
      const res = await api.patch(`/delivery/tasks/${taskId}`, {
        status: 'delivered',
      });
      if (res.success) {
        toast.success('Meal delivered successfully!');
        // Update local state instantly
        setData((prev) => {
          if (!prev) return prev;
          const updatedTasks = prev.tasks.map((t) =>
            t._id === taskId ? { ...t, status: 'delivered' } : t
          );
          return {
            ...prev,
            deliveredCount: prev.deliveredCount + 1,
            pendingCount: Math.max(0, prev.pendingCount - 1),
            tasks: updatedTasks,
          };
        });
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update delivery');
    } finally {
      setActionInProgressId(null);
    }
  };

  // Open Fail Modal
  const handleOpenFailModal = (taskId) => {
    setFailedTaskId(taskId);
    setFailureReason('customer_unavailable');
    setIsFailModalOpen(true);
  };

  // Submit Mark Failed (BR-10 & Acceptance Test 15)
  const handleMarkFailedSubmit = async (e) => {
    e.preventDefault();
    if (!failedTaskId) return;

    setActionInProgressId(failedTaskId);
    try {
      const res = await api.patch(`/delivery/tasks/${failedTaskId}`, {
        status: 'failed',
        failureReason,
      });

      if (res.success) {
        toast.error(`Drop marked as failed (${failureReason.replace('_', ' ')})`);
        setIsFailModalOpen(false);
        fetchTodayDrops();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update delivery');
    } finally {
      setActionInProgressId(null);
    }
  };

  if (loading) return <Loader message="Loading assigned delivery route..." />;
  if (error) return <ErrorBanner message={error} onRetry={fetchTodayDrops} />;
  if (!data) return null;

  const { date, totalDrops, pendingCount, deliveredCount, failedCount, tasks } = data;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Route Header */}
      <div className="bg-white rounded-3xl border border-mocha-200/80 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gold-100 text-mocha-900 border border-gold-300">
              Delivery Route
            </span>
            <h1 className="text-3xl font-serif font-extrabold text-mocha-950">
              Today's Meal Drops
            </h1>
            <p className="text-xs text-mocha-600">
              Assigned drops for {date} (IST). Mark status after reaching doorstep.
            </p>
          </div>

          <div className="flex items-center space-x-3 text-center text-xs">
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/60">
              <p className="text-amber-800 font-semibold">Pending</p>
              <p className="text-2xl font-serif font-bold text-amber-950">{pendingCount}</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200/60">
              <p className="text-emerald-800 font-semibold">Delivered</p>
              <p className="text-2xl font-serif font-bold text-emerald-950">{deliveredCount}</p>
            </div>
            <div className="p-3 bg-rose-50 rounded-xl border border-rose-200/60">
              <p className="text-rose-800 font-semibold">Failed</p>
              <p className="text-2xl font-serif font-bold text-rose-950">{failedCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Drops Cards List */}
      <div className="space-y-4">
        {tasks.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-mocha-200">
            <p className="text-base font-serif font-bold text-mocha-900">No Drops Assigned for Today</p>
            <p className="text-xs text-mocha-500 mt-1">
              Check with your kitchen manager on the provider portal to assign today's route.
            </p>
          </div>
        ) : (
          tasks.map((task) => {
            const isPending = task.status === 'pending';
            const isBusy = actionInProgressId === task._id;

            return (
              <div
                key={task._id}
                className={`p-6 rounded-3xl border transition-smooth ${
                  isPending
                    ? 'bg-white border-mocha-200/90 shadow-sm'
                    : 'bg-canvas-subtle/50 border-mocha-200/60 opacity-80'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gold-800 bg-gold-50 px-2.5 py-0.5 rounded-full border border-gold-200">
                        {task.area}
                      </span>
                      <StatusBadge status={task.status} failureReason={task.failureReason} />
                    </div>

                    <div>
                      <h3 className="text-lg font-serif font-bold text-mocha-950">
                        {task.customerName}
                      </h3>
                      <a
                        href={`tel:${task.phone}`}
                        className="inline-flex items-center space-x-1.5 text-xs text-amber-700 font-bold hover:underline mt-0.5"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>{task.phone}</span>
                      </a>
                    </div>

                    <div className="text-xs text-mocha-700 flex items-start space-x-1.5 pt-1">
                      <MapPin className="w-4 h-4 text-gold-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-mocha-900">{task.addressLine}</p>
                        {task.landmark && (
                          <p className="text-mocha-500 text-[11px]">Near: {task.landmark}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions for Rider */}
                  {isPending ? (
                    <div className="flex items-center space-x-2 shrink-0 pt-2 md:pt-0">
                      <button
                        onClick={() => handleMarkDelivered(task._id)}
                        disabled={isBusy}
                        className="flex-1 md:flex-none px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-smooth flex items-center justify-center space-x-1.5"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Delivered</span>
                      </button>

                      <button
                        onClick={() => handleOpenFailModal(task._id)}
                        disabled={isBusy}
                        className="flex-1 md:flex-none px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-300 transition-smooth flex items-center justify-center space-x-1.5"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Failed Drop</span>
                      </button>
                    </div>
                  ) : (
                    <div className="text-right text-xs text-mocha-500 font-medium">
                      Finalized at {new Date(task.completedAt || Date.now()).toLocaleTimeString()}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Mark Failed Drop Modal */}
      <Modal
        isOpen={isFailModalOpen}
        onClose={() => setIsFailModalOpen(false)}
        title="Record Delivery Issue"
      >
        <form onSubmit={handleMarkFailedSubmit} className="space-y-4 text-xs sm:text-sm">
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs">
            <p className="font-bold flex items-center">
              <ShieldAlert className="w-4 h-4 mr-1 text-rose-600" />
              Billing Impact Policy (PRD BR-10):
            </p>
            <p className="mt-1">
              • <strong>Customer Unavailable:</strong> Customer pays for the meal (Billable).
              <br />
              • <strong>Provider Fault (Spill/Delay):</strong> Customer receives 100% credit (Not billable).
            </p>
          </div>

          <div>
            <label className="block font-semibold text-mocha-800 mb-1">Select Failure Reason:</label>
            <select
              value={failureReason}
              onChange={(e) => setFailureReason(e.target.value)}
              className="w-full px-3 py-2 border border-mocha-300 rounded-xl focus:ring-2 focus:ring-amber-500"
            >
              <option value="customer_unavailable">
                Customer Unavailable / Door Locked (Billable)
              </option>
              <option value="provider_fault">
                Kitchen Spill / Delay / Rider Issue (Credited to customer)
              </option>
            </select>
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsFailModalOpen(false)}
              className="px-4 py-2 border border-mocha-300 rounded-xl text-mocha-700 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs"
            >
              Confirm Failed Drop
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TodayDrops;
