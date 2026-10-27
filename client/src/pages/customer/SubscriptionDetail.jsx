import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios.js';
import { useSocket } from '../../context/SocketContext.jsx';
import { Loader } from '../../components/Loader.jsx';
import { ErrorBanner } from '../../components/ErrorBanner.jsx';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import { Modal } from '../../components/Modal.jsx';
import {
  Calendar,
  Clock,
  MapPin,
  AlertTriangle,
  Receipt,
  Pause,
  Play,
  XCircle,
  HelpCircle,
  CheckCircle,
  Flame,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const SubscriptionDetail = () => {
  const { id } = useParams();
  const { onDeliveryUpdate } = useSocket();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionInProgressId, setActionInProgressId] = useState(null);

  // Modals
  const [isPauseOpen, setIsPauseOpen] = useState(false);
  const [isResumeOpen, setIsResumeOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);

  // Form State
  const [pauseFrom, setPauseFrom] = useState('');
  const [pauseTo, setPauseTo] = useState('');
  const [modalSubmitting, setModalSubmitting] = useState(false);

  const fetchDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/subscriptions/${id}`);
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch subscription schedule');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  // Subscribe to live WebSocket updates
  useEffect(() => {
    const unsubscribe = onDeliveryUpdate((payload) => {
      if (payload.subscriptionId === id) {
        // Update local meal in real time
        setData((prev) => {
          if (!prev) return prev;
          const updatedMeals = prev.meals.map((m) =>
            m._id === payload.mealId
              ? {
                  ...m,
                  status: payload.status,
                  failureReason: payload.failureReason,
                  canSkip: false,
                }
              : m
          );
          return { ...prev, meals: updatedMeals };
        });
      }
    });

    return () => unsubscribe();
  }, [id, onDeliveryUpdate]);

  // Handle Skip Meal (BR-4)
  const handleSkip = async (mealId) => {
    setActionInProgressId(mealId);
    try {
      const res = await api.post(`/meals/${mealId}/skip`);
      if (res.success) {
        toast.success(res.data.message || 'Meal skipped! Credited to bill.');
        // Update local state
        setData((prev) => {
          if (!prev) return prev;
          const updated = prev.meals.map((m) =>
            m._id === mealId
              ? { ...m, status: 'skipped', skipReason: 'user' }
              : m
          );
          return { ...prev, meals: updated };
        });
      }
    } catch (err) {
      toast.error(err.message || 'Could not skip meal');
    } finally {
      setActionInProgressId(null);
    }
  };

  // Handle Unskip Meal (BR-4)
  const handleUnskip = async (mealId) => {
    setActionInProgressId(mealId);
    try {
      const res = await api.post(`/meals/${mealId}/unskip`);
      if (res.success) {
        toast.success(res.data.message || 'Meal restored to cooking schedule!');
        setData((prev) => {
          if (!prev) return prev;
          const updated = prev.meals.map((m) =>
            m._id === mealId
              ? { ...m, status: 'scheduled', skipReason: null }
              : m
          );
          return { ...prev, meals: updated };
        });
      }
    } catch (err) {
      toast.error(err.message || 'Could not unskip meal');
    } finally {
      setActionInProgressId(null);
    }
  };

  // Handle Pause Subscription (BR-5)
  const handlePauseSubmit = async (e) => {
    e.preventDefault();
    setModalSubmitting(true);
    try {
      const res = await api.post(`/subscriptions/${id}/pause`, {
        from: pauseFrom,
        to: pauseTo,
      });
      if (res.success) {
        toast.success(
          `Paused: ${res.data.skippedCount} meals skipped. ${
            res.data.lockedMeals > 0 ? `(${res.data.lockedMeals} already past cutoff)` : ''
          }`
        );
        setIsPauseOpen(false);
        fetchDetail();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to pause subscription');
    } finally {
      setModalSubmitting(false);
    }
  };

  // Handle Resume Subscription (BR-5)
  const handleResumeSubmit = async (e) => {
    e.preventDefault();
    setModalSubmitting(true);
    try {
      const res = await api.post(`/subscriptions/${id}/resume`, {
        from: pauseFrom,
        to: pauseTo,
      });
      if (res.success) {
        toast.success(`Resumed: ${res.data.restoredCount} meals restored to cooking schedule.`);
        setIsResumeOpen(false);
        fetchDetail();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to resume subscription');
    } finally {
      setModalSubmitting(false);
    }
  };

  // Handle Cancel Subscription (BR-6)
  const handleCancelSubmit = async () => {
    setModalSubmitting(true);
    try {
      const res = await api.post(`/subscriptions/${id}/cancel`);
      if (res.success) {
        toast.success('Subscription cancelled successfully');
        setIsCancelOpen(false);
        fetchDetail();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to cancel subscription');
    } finally {
      setModalSubmitting(false);
    }
  };

  if (loading) return <Loader message="Loading 14-day meal schedule..." />;
  if (error) return <ErrorBanner message={error} onRetry={fetchDetail} />;
  if (!data || !data.subscription) {
    return <ErrorBanner message="Subscription details not found" onRetry={fetchDetail} />;
  }

  const subscription = data.subscription;
  const meals = Array.isArray(data.meals) ? data.meals : [];
  const cutoffTime = subscription.providerId?.cutoffTime || '17:00';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Details Card */}
      <div className="bg-white rounded-3xl border border-mocha-200/80 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={subscription.status} />
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                {subscription.planId?.diet?.toUpperCase()} • {subscription.planId?.mealType?.toUpperCase()}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-serif font-extrabold text-mocha-950">
              {subscription.planId?.name}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-mocha-700">
              <div className="flex items-center space-x-1.5 font-semibold text-mocha-900">
                <span>Kitchen:</span>
                <span className="text-amber-700">{subscription.providerId?.businessName}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>
                  Skip Cutoff: <strong>{cutoffTime} IST</strong> (Day Prior)
                </span>
              </div>
              <div className="flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-gold-600" />
                <span>{subscription.address?.line}, {subscription.address?.area}</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to={`/billing/${subscription._id}`}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-mocha-100 hover:bg-mocha-200 text-mocha-900 text-xs font-bold rounded-xl transition-smooth"
            >
              <Receipt className="w-4 h-4 text-amber-600" />
              <span>View Monthly Bill</span>
            </Link>

            {subscription.status === 'active' && (
              <>
                <button
                  onClick={() => setIsPauseOpen(true)}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-gold-100 hover:bg-gold-200 text-mocha-900 text-xs font-bold rounded-xl border border-gold-300 transition-smooth"
                >
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause Range</span>
                </button>

                {subscription.pauses?.length > 0 && (
                  <button
                    onClick={() => setIsResumeOpen(true)}
                    className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-300 transition-smooth"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Resume</span>
                  </button>
                )}

                <button
                  onClick={() => setIsCancelOpen(true)}
                  className="inline-flex items-center space-x-1.5 px-3 py-2 text-rose-700 hover:bg-rose-50 text-xs font-semibold rounded-xl transition-smooth"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Existing Pauses notice if any */}
        {subscription.pauses?.length > 0 && (
          <div className="mt-4 p-3 bg-gold-50 border border-gold-200 rounded-xl text-xs text-mocha-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Pause className="w-4 h-4 text-gold-700" />
              <span>
                Active Pauses Scheduled:{' '}
                {subscription.pauses.map((p) => `${p.from} to ${p.to}`).join(', ')}
              </span>
            </div>
            <button
              onClick={() => setIsResumeOpen(true)}
              className="text-amber-700 font-bold hover:underline"
            >
              Manage / Resume
            </button>
          </div>
        )}
      </div>

      {/* Payment Due & Settle Balance Quick-Bar */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-mocha-900 rounded-3xl p-5 sm:p-6 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/20 text-white border border-white/30">
            💳 Outstanding Monthly Due
          </span>
          <h3 className="text-xl sm:text-2xl font-serif font-extrabold text-white">
            Current Balance Due: ₹490
          </h3>
          <p className="text-xs text-amber-100 max-w-xl">
            Delivered meals are billed after consumption. Settle your balance instantly with 1-click via Razorpay (UPI, Cards, NetBanking).
          </p>
        </div>

        <Link
          to={`/billing/${subscription._id}`}
          className="inline-flex items-center space-x-2 px-6 py-3 bg-white hover:bg-gold-50 text-amber-950 font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg transition-smooth self-start sm:self-auto hover:scale-105 cursor-pointer shrink-0"
        >
          <Receipt className="w-4 h-4 text-amber-600" />
          <span>Pay Due with Razorpay →</span>
        </Link>
      </div>

      {/* 14-Day Interactive Meal Schedule */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-mocha-950 flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-amber-600" />
              <span>14-Day Rolling Meal Schedule</span>
            </h2>
            <p className="text-xs text-mocha-500 mt-0.5">
              Skip meals freely before the previous day's cutoff ({cutoffTime} IST). Skipped meals become credits on your monthly bill.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {meals.map((meal) => {
            const isActionBusy = actionInProgressId === meal._id;

            return (
              <div
                key={meal._id}
                className="bg-white rounded-2xl border border-mocha-200/80 p-5 shadow-xs hover:border-gold-300 transition-smooth flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-mocha-900 bg-mocha-50 px-2 py-0.5 rounded border border-mocha-200">
                      {meal.date}
                    </span>
                    <StatusBadge
                      status={meal.status}
                      skipReason={meal.skipReason}
                      failureReason={meal.failureReason}
                    />
                  </div>

                  <div>
                    <h3 className="text-base font-serif font-bold text-mocha-950 capitalize">
                      {meal.mealType} ({meal.diet})
                    </h3>
                    <p className="text-xs text-mocha-500">
                      Snapshotted Price: <strong className="text-mocha-900">₹{meal.price}</strong>
                    </p>
                  </div>

                  {/* Daily Thali Menu Dishes */}
                  <div className="p-3 bg-canvas-subtle/90 rounded-xl border border-mocha-200/70 text-xs space-y-1">
                    <p className="text-[10px] uppercase font-bold text-amber-700 tracking-wider flex items-center">
                      <Flame className="w-3 h-3 mr-1 text-amber-600" />
                      Daily Thali Items
                    </p>
                    {meal.dishes && meal.dishes.length > 0 ? (
                      <p className="text-mocha-800 font-medium leading-relaxed">
                        {meal.dishes.join(' • ')}
                      </p>
                    ) : (
                      <p className="text-mocha-500 italic text-[11px]">
                        Fresh homestyle daily cook (Dal, Seasonal Sabzi, Roti & Rice)
                      </p>
                    )}
                  </div>
                </div>

                {/* Bottom Action Section */}
                <div className="pt-4 mt-3 border-t border-mocha-100 flex items-center justify-between">
                  {meal.status === 'scheduled' ? (
                    meal.canSkip ? (
                      <button
                        onClick={() => handleSkip(meal._id)}
                        disabled={isActionBusy}
                        className="w-full py-2 px-3 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-smooth"
                      >
                        {isActionBusy ? 'Processing...' : 'Skip This Meal (Credit Rupee)'}
                      </button>
                    ) : (
                      <div className="w-full text-center">
                        <span
                          title={`Cutoff was: ${meal.skipDeadline}`}
                          className="inline-flex items-center justify-center w-full py-2 px-3 bg-gray-100 text-gray-400 text-xs font-medium rounded-xl cursor-not-allowed border border-gray-200"
                        >
                          <Clock className="w-3 h-3 mr-1 text-gray-400" />
                          Cutoff Passed (5:00 PM)
                        </span>
                      </div>
                    )
                  ) : meal.status === 'skipped' && meal.skipReason === 'user' ? (
                    meal.canUnskip ? (
                      <button
                        onClick={() => handleUnskip(meal._id)}
                        disabled={isActionBusy}
                        className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-smooth"
                      >
                        {isActionBusy ? 'Processing...' : 'Undo Skip (Before 5 PM)'}
                      </button>
                    ) : (
                      <div className="w-full text-center">
                        <span
                          title="Cannot undo skip after 5:00 PM cutoff"
                          className="inline-flex items-center justify-center w-full py-2 px-3 bg-mocha-100/60 text-mocha-500 text-xs font-medium rounded-xl border border-mocha-200"
                        >
                          <Clock className="w-3 h-3 mr-1 text-mocha-400" />
                          Cutoff Passed — Cannot Undo
                        </span>
                      </div>
                    )
                  ) : meal.status === 'delivered' ? (
                    <span className="text-xs font-semibold text-emerald-700 flex items-center justify-center w-full">
                      <CheckCircle className="w-3.5 h-3.5 mr-1" />
                      Delivered & Billed
                    </span>
                  ) : (
                    <span className="text-xs text-mocha-400 capitalize text-center w-full">
                      {meal.status}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pause Modal */}
      <Modal
        isOpen={isPauseOpen}
        onClose={() => setIsPauseOpen(false)}
        title="Pause Meal Subscription"
      >
        <form onSubmit={handlePauseSubmit} className="space-y-4 text-xs sm:text-sm">
          <p className="text-xs text-mocha-600 leading-relaxed">
            Specify the date range you will be away (e.g. going on vacation or traveling). All meals scheduled within this range whose cutoff deadline has not passed will be skipped and credited.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-mocha-800 mb-1">From Date:</label>
              <input
                type="date"
                required
                min={subscription.startDate}
                max={subscription.endDate}
                value={pauseFrom}
                onChange={(e) => setPauseFrom(e.target.value)}
                className="w-full px-3 py-2 border border-mocha-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold text-mocha-800 mb-1">To Date:</label>
              <input
                type="date"
                required
                min={pauseFrom || subscription.startDate}
                max={subscription.endDate}
                value={pauseTo}
                onChange={(e) => setPauseTo(e.target.value)}
                className="w-full px-3 py-2 border border-mocha-300 rounded-xl"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsPauseOpen(false)}
              className="px-4 py-2 border border-mocha-300 rounded-xl text-mocha-700 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={modalSubmitting}
              className="px-5 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold rounded-xl"
            >
              {modalSubmitting ? 'Pausing...' : 'Confirm Pause'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Resume Modal */}
      <Modal
        isOpen={isResumeOpen}
        onClose={() => setIsResumeOpen(false)}
        title="Resume Paused Subscription"
      >
        <form onSubmit={handleResumeSubmit} className="space-y-4 text-xs sm:text-sm">
          <p className="text-xs text-mocha-600">
            Select the pause range you wish to remove and restore to cooking schedule:
          </p>

          <div className="space-y-2">
            {subscription.pauses?.map((p, idx) => (
              <label
                key={idx}
                className="flex items-center space-x-3 p-3 border border-mocha-200 rounded-xl cursor-pointer hover:bg-mocha-50"
              >
                <input
                  type="radio"
                  name="pauseRange"
                  required
                  onChange={() => {
                    setPauseFrom(p.from);
                    setPauseTo(p.to);
                  }}
                  className="text-amber-600 focus:ring-amber-500"
                />
                <span className="font-semibold text-mocha-900">
                  {p.from} to {p.to}
                </span>
              </label>
            ))}
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsResumeOpen(false)}
              className="px-4 py-2 border border-mocha-300 rounded-xl text-mocha-700 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={modalSubmitting || !pauseFrom}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl"
            >
              {modalSubmitting ? 'Resuming...' : 'Resume Meals'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={isCancelOpen}
        onClose={() => setIsCancelOpen(false)}
        title="Cancel Subscription"
      >
        <div className="space-y-4 text-xs sm:text-sm">
          <div className="flex items-start space-x-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <p>
              Cancelling your subscription will immediately cancel all upcoming scheduled meals whose cutoff has not yet passed. Meals past cutoff for tomorrow will still be delivered and billed normally.
            </p>
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsCancelOpen(false)}
              className="px-4 py-2 border border-mocha-300 rounded-xl text-mocha-700 font-semibold"
            >
              Keep Subscription
            </button>
            <button
              type="button"
              onClick={handleCancelSubmit}
              disabled={modalSubmitting}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold rounded-xl"
            >
              {modalSubmitting ? 'Cancelling...' : 'Yes, Cancel Subscription'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SubscriptionDetail;
