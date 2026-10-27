import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { Loader } from '../../components/Loader.jsx';
import { ErrorBanner } from '../../components/ErrorBanner.jsx';
import { Modal } from '../../components/Modal.jsx';
import {
  Clock,
  MapPin,
  Calendar,
  CheckCircle2,
  Utensils,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import toast from 'react-hot-toast';

// Safe date formatting helper to prevent any invalid date crashes
const formatDateSafe = (dateStr, options) => {
  if (!dateStr) return '';
  try {
    const clean = String(dateStr).slice(0, 10);
    const parts = clean.split('-');
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);
      const dt = new Date(y, m, d);
      if (!isNaN(dt.getTime())) {
        return dt.toLocaleDateString('en-IN', options);
      }
    }
    const dt = new Date(dateStr);
    return isNaN(dt.getTime()) ? String(dateStr) : dt.toLocaleDateString('en-IN', options);
  } catch {
    return String(dateStr);
  }
};

export const ProviderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMenuDate, setSelectedMenuDate] = useState(null);

  // Subscribe Modal State
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [startDate, setStartDate] = useState('');
  const [durationDays, setDurationDays] = useState(15);
  const [addressLine, setAddressLine] = useState('');
  const [addressArea, setAddressArea] = useState('');
  const [landmark, setLandmark] = useState('');

  // Earliest allowed start date is tomorrow (BR-2)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minStartDate = tomorrow.toISOString().split('T')[0];

  const fetchDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/providers/${id}`);
      if (res.success) {
        setData(res.data);
        if (res.data.provider.deliveryAreas?.length > 0) {
          setAddressArea(res.data.provider.deliveryAreas[0]);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load provider profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
    setStartDate(minStartDate);
  }, [id]);

  const handleOpenSubscribe = (plan) => {
    if (!isAuthenticated) {
      toast.error('Please log in as a customer to subscribe');
      navigate('/login');
      return;
    }
    if (user.role !== 'customer') {
      toast.error('Only customer accounts can subscribe to meal plans');
      return;
    }
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  const handleSubscribeSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPlan) return;

    setSubmitting(true);
    try {
      const payload = {
        planId: selectedPlan._id,
        startDate,
        durationDays: Number(durationDays),
        address: {
          line: addressLine,
          area: addressArea,
          landmark,
        },
      };

      const res = await api.post('/subscriptions', payload);
      if (res.success) {
        toast.success(`Subscribed to ${selectedPlan.name}! Meals scheduled.`);
        setIsModalOpen(false);
        navigate('/my-subscriptions');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create subscription');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader message="Loading kitchen details..." />;
  if (error) return <ErrorBanner message={error} onRetry={fetchDetails} />;
  if (!data || !data.provider) return <ErrorBanner message="Kitchen profile not found" onRetry={fetchDetails} />;

  const { provider, plans, menu } = data;

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const groupedMenu = useMemo(() => {
    if (!menu || !menu.length) return [];
    const map = {};
    menu.forEach((item) => {
      if (!map[item.date]) {
        map[item.date] = {
          date: item.date,
          lunch: null,
          dinner: null,
        };
      }
      if (item.mealType === 'lunch') {
        map[item.date].lunch = item.dishes;
      } else if (item.mealType === 'dinner') {
        map[item.date].dinner = item.dishes;
      }
    });

    return Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
  }, [menu]);

  const activeDateData = useMemo(() => {
    if (!groupedMenu.length) return null;
    if (selectedMenuDate) {
      const found = groupedMenu.find((d) => d.date === selectedMenuDate);
      if (found) return found;
    }
    const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
    const todayItem = groupedMenu.find((d) => d.date === todayStr);
    return todayItem || groupedMenu[0];
  }, [groupedMenu, selectedMenuDate]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Provider Header Card */}
      <div className="bg-white rounded-3xl border border-mocha-200/80 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gold-100 text-mocha-900 border border-gold-300">
              Homestyle Kitchen
            </span>
            <h1 className="text-3xl sm:text-4xl font-serif font-extrabold text-mocha-950">
              {provider.businessName}
            </h1>
            <p className="text-sm text-mocha-600 max-w-2xl leading-relaxed">
              {provider.description || 'Nutritious homestyle recipes prepared daily.'}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-mocha-700">
              <div className="flex items-center space-x-1.5 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200/60 font-semibold text-amber-900">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Skip Cutoff: {provider.cutoffTime} IST (Previous Day)</span>
              </div>
              <div className="flex items-center space-x-1.5 bg-mocha-50 px-3 py-1.5 rounded-lg border border-mocha-200">
                <MapPin className="w-3.5 h-3.5 text-gold-600" />
                <span>Areas: {provider.deliveryAreas?.join(', ')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Available Meal Plans */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-serif font-bold text-mocha-950">
            Available Subscription Plans
          </h2>
          <span className="text-xs text-mocha-500 font-medium">
            Server-guaranteed skip cutoff & billing credits
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan._id}
              className="bg-white rounded-2xl border border-mocha-200/80 p-6 shadow-xs hover:border-gold-400 hover:shadow-md transition-smooth flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider border ${
                      plan.diet === 'veg'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-rose-50 text-rose-800 border-rose-300'
                    }`}
                  >
                    <span className="w-2 h-2 mr-1 rounded-full bg-current"></span>
                    {plan.diet} • {plan.mealType}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-serif font-bold text-mocha-900">{plan.name}</h3>
                  <p className="text-xs text-mocha-600 mt-1 line-clamp-2">
                    {plan.description || 'Standard meal set.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-mocha-100 flex items-baseline justify-between">
                  <div className="text-2xl font-bold text-mocha-950 font-serif">
                    ₹{plan.pricePerMeal}
                    <span className="text-xs font-normal text-mocha-500"> / meal</span>
                  </div>
                  <div className="text-[11px] font-semibold text-gold-700">
                    {plan.daysOfWeek?.map((d) => dayNames[d]).join(', ')}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleOpenSubscribe(plan)}
                className="mt-6 w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-smooth flex items-center justify-center space-x-1.5"
              >
                <span>Subscribe to Plan</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 7-Day Revolving Daily Menu Explorer (One Day at a Time in a Dedicated Box) */}
      <div className="bg-white rounded-3xl border border-mocha-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-mocha-100 pb-4">
          <div>
            <h2 className="text-xl font-serif font-bold text-mocha-950 flex items-center space-x-2">
              <Utensils className="w-5 h-5 text-amber-600" />
              <span>7-Day Revolving Menu Schedule</span>
            </h2>
            <p className="text-xs text-mocha-500 mt-0.5">
              Select a date below to view the freshly cooked lunch & dinner menu for that day
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-gold-50 text-gold-900 border border-gold-200 rounded-full w-fit">
            Rotated weekly with seasonal vegetables
          </span>
        </div>

        {groupedMenu.length === 0 ? (
          <p className="text-sm text-mocha-500 py-6 text-center">Menu updating for upcoming days...</p>
        ) : (
          <div className="space-y-5">
            {/* Day Selector Pills Bar */}
            <div className="flex items-center space-x-2.5 overflow-x-auto pb-2 scrollbar-thin">
              {groupedMenu.map((dayGroup) => {
                const isSelected = activeDateData?.date === dayGroup.date;
                const dayName = formatDateSafe(dayGroup.date, { weekday: 'short' });
                const dayNum = formatDateSafe(dayGroup.date, { day: 'numeric', month: 'short' });
                const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
                const isToday = dayGroup.date === todayStr;

                return (
                  <button
                    key={dayGroup.date}
                    type="button"
                    onClick={() => setSelectedMenuDate(dayGroup.date)}
                    className={`shrink-0 px-4 py-2.5 rounded-2xl text-xs font-bold transition-smooth flex flex-col items-center justify-center min-w-[90px] border cursor-pointer ${
                      isSelected
                        ? 'bg-amber-600 text-white border-amber-600 shadow-md scale-105'
                        : 'bg-canvas-subtle/80 text-mocha-700 border-mocha-200 hover:bg-gold-50 hover:border-gold-300'
                    }`}
                  >
                    <span className="text-[10px] uppercase tracking-wider opacity-90">
                      {isToday ? 'Today' : dayName}
                    </span>
                    <span className="text-xs font-extrabold">{dayNum}</span>
                  </button>
                );
              })}
            </div>

            {/* Focused Single-Day Box */}
            {activeDateData && (
              <div className="p-6 rounded-3xl bg-canvas-subtle/80 border border-mocha-200/90 shadow-2xs space-y-5">
                {/* Day Header with Pagination */}
                <div className="flex items-center justify-between pb-3 border-b border-mocha-200/70">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-amber-700 tracking-wider">
                      {activeDateData.date === new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })
                        ? "Today's Fresh Cook"
                        : 'Scheduled Day Menu'}
                    </span>
                    <h3 className="text-lg font-serif font-extrabold text-mocha-950">
                      {formatDateSafe(activeDateData.date, {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </h3>
                  </div>

                  {/* Day Navigation Chevrons */}
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      disabled={groupedMenu.findIndex((d) => d.date === activeDateData.date) === 0}
                      onClick={() => {
                        const currIdx = groupedMenu.findIndex((d) => d.date === activeDateData.date);
                        if (currIdx > 0) setSelectedMenuDate(groupedMenu[currIdx - 1].date);
                      }}
                      className="p-2 rounded-xl border border-mocha-200 bg-white hover:bg-mocha-50 disabled:opacity-30 disabled:cursor-not-allowed transition-smooth shadow-2xs cursor-pointer"
                      title="Previous Day"
                    >
                      <ChevronLeft className="w-4 h-4 text-mocha-700" />
                    </button>
                    <button
                      type="button"
                      disabled={
                        groupedMenu.findIndex((d) => d.date === activeDateData.date) === groupedMenu.length - 1
                      }
                      onClick={() => {
                        const currIdx = groupedMenu.findIndex((d) => d.date === activeDateData.date);
                        if (currIdx < groupedMenu.length - 1) setSelectedMenuDate(groupedMenu[currIdx + 1].date);
                      }}
                      className="p-2 rounded-xl border border-mocha-200 bg-white hover:bg-mocha-50 disabled:opacity-30 disabled:cursor-not-allowed transition-smooth shadow-2xs cursor-pointer"
                      title="Next Day"
                    >
                      <ChevronRight className="w-4 h-4 text-mocha-700" />
                    </button>
                  </div>
                </div>

                {/* Lunch & Dinner Services for this Date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Lunch Service Box */}
                  <div className="p-5 bg-white rounded-2xl border border-amber-200/90 shadow-xs space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-amber-100">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-100/80 text-amber-900">
                        ☀️ Lunch Service
                      </span>
                      <span className="text-[11px] text-mocha-500 font-medium">12:30 PM – 2:30 PM</span>
                    </div>

                    {activeDateData.lunch && activeDateData.lunch.length > 0 ? (
                      <ul className="space-y-2 pt-1 text-xs sm:text-sm text-mocha-800">
                        {activeDateData.lunch.map((dish, i) => (
                          <li key={i} className="flex items-start space-x-2">
                            <span className="text-amber-600 font-bold mt-0.5">•</span>
                            <span className="font-medium">{dish}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-mocha-400 italic py-4">No lunch items scheduled for this date.</p>
                    )}
                  </div>

                  {/* Dinner Service Box */}
                  <div className="p-5 bg-white rounded-2xl border border-gold-300/80 shadow-xs space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-gold-100">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-gold-100/80 text-gold-900">
                        🌙 Dinner Service
                      </span>
                      <span className="text-[11px] text-mocha-500 font-medium">7:30 PM – 9:30 PM</span>
                    </div>

                    {activeDateData.dinner && activeDateData.dinner.length > 0 ? (
                      <ul className="space-y-2 pt-1 text-xs sm:text-sm text-mocha-800">
                        {activeDateData.dinner.map((dish, i) => (
                          <li key={i} className="flex items-start space-x-2">
                            <span className="text-gold-600 font-bold mt-0.5">•</span>
                            <span className="font-medium">{dish}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-mocha-400 italic py-4">No dinner items scheduled for this date.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Subscribe Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Subscribe to ${selectedPlan?.name}`}
      >
        <form onSubmit={handleSubscribeSubmit} className="space-y-4 text-xs sm:text-sm">
          <div className="p-3 bg-gold-50 border border-gold-200 rounded-xl flex items-center justify-between">
            <div>
              <p className="font-bold text-mocha-900">{selectedPlan?.name}</p>
              <p className="text-xs text-mocha-600">₹{selectedPlan?.pricePerMeal} per meal ({selectedPlan?.diet})</p>
            </div>
            <span className="text-xs font-semibold px-2 py-1 bg-white rounded border border-gold-300 text-gold-800">
              Cutoff: {provider.cutoffTime}
            </span>
          </div>

          <div>
            <label className="block font-semibold text-mocha-800 mb-1">
              Start Date (Must be tomorrow or later):
            </label>
            <input
              type="date"
              required
              min={minStartDate}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-mocha-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
            />
            <p className="text-[11px] text-mocha-500 mt-1">
              *Server enforces IST date validation. Earliest allowed: {minStartDate}
            </p>
          </div>

          <div>
            <label className="block font-semibold text-mocha-800 mb-1">
              Subscription Duration:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[7, 15, 30].map((days) => (
                <button
                  type="button"
                  key={days}
                  onClick={() => setDurationDays(days)}
                  className={`py-2 text-xs font-bold rounded-xl border transition-smooth ${
                    durationDays === days
                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                      : 'bg-mocha-50 text-mocha-800 border-mocha-200 hover:bg-mocha-100'
                  }`}
                >
                  {days} Days
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-mocha-800 mb-1">
              Delivery Area (Served by provider):
            </label>
            <select
              required
              value={addressArea}
              onChange={(e) => setAddressArea(e.target.value)}
              className="w-full px-3 py-2 border border-mocha-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
            >
              {provider.deliveryAreas?.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-mocha-800 mb-1">
              Delivery Street Address / Flat No:
            </label>
            <textarea
              required
              rows={2}
              value={addressLine}
              onChange={(e) => setAddressLine(e.target.value)}
              placeholder="e.g. Flat 304, Sunshine Heights, 4th Main"
              className="w-full px-3 py-2 border border-mocha-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block font-semibold text-mocha-800 mb-1">
              Landmark (Optional):
            </label>
            <input
              type="text"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              placeholder="e.g. Near HDFC Bank ATM"
              className="w-full px-3 py-2 border border-mocha-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
            />
          </div>

          <div className="pt-4 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-mocha-300 rounded-xl text-mocha-700 font-semibold hover:bg-mocha-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-xs transition-smooth"
            >
              {submitting ? 'Creating Subscription...' : 'Confirm & Schedule Meals'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProviderDetail;
