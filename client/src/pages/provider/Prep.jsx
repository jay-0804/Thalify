import React, { useState, useEffect } from 'react';
import api from '../../api/axios.js';
import { useSocket } from '../../context/SocketContext.jsx';
import { Loader } from '../../components/Loader.jsx';
import { ErrorBanner } from '../../components/ErrorBanner.jsx';
import {
  Flame,
  Calendar,
  Lock,
  Unlock,
  Printer,
  RefreshCw,
  Utensils,
  MapPin,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export const Prep = () => {
  const { onPrepChanged } = useSocket();

  // Default date to tomorrow in local IST
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const defaultDateStr = tomorrowDate.toISOString().split('T')[0];

  const [date, setDate] = useState(defaultDateStr);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchPrep = async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    else setIsRefreshing(true);
    setError(null);
    try {
      const res = await api.get(`/provider/prep?date=${date}`);
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load prep summary');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPrep(true);
  }, [date]);

  // Real-time live update over WebSocket when customer skips/unskips/pauses
  useEffect(() => {
    const unsubscribe = onPrepChanged((payload) => {
      console.log('[Prep] Live prep change event received', payload);
      fetchPrep(false);
    });
    return () => unsubscribe();
  }, [date, onPrepChanged]);

  const handlePrintKOT = () => {
    window.print();
  };

  if (loading) return <Loader message="Aggregating kitchen headcount..." />;
  if (error) return <ErrorBanner message={error} onRetry={() => fetchPrep(true)} />;
  if (!data) return null;

  const { isLocked, cutoffTime, skippedCount, totals, breakdown } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header & Date Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-3xl font-serif font-extrabold text-mocha-950">
              Kitchen Cooking Sheet
            </h1>
            {isRefreshing && (
              <RefreshCw className="w-4 h-4 text-amber-600 animate-spin" />
            )}
          </div>
          <p className="text-sm text-mocha-600 mt-1">
            Real-time headcount aggregated directly from active subscriptions, excluding skips and pauses.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-xl border border-mocha-200 shadow-xs">
            <Calendar className="w-4 h-4 text-amber-600" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="text-xs font-bold text-mocha-900 border-none focus:outline-hidden bg-transparent"
            />
          </div>

          <button
            onClick={handlePrintKOT}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-mocha-900 hover:bg-mocha-950 text-white text-xs font-bold rounded-xl shadow-xs transition-smooth"
          >
            <Printer className="w-4 h-4 text-gold-400" />
            <span>Print Kitchen KOT</span>
          </button>
        </div>
      </div>

      {/* Printable KOT & Screen Card Container */}
      <div className="bg-white rounded-3xl border border-mocha-200/80 p-6 sm:p-8 shadow-xs space-y-8 print:p-0 print:border-none print:shadow-none">
        {/* Status Lock Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border bg-canvas-subtle/80">
          <div className="flex items-center space-x-3">
            <div
              className={`p-2 rounded-xl ${
                isLocked
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
              }`}
            >
              {isLocked ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
            </div>
            <div>
              <p className="text-sm font-serif font-bold text-mocha-950">
                {isLocked ? 'Headcount Locked & Final' : 'Live Headcount (Open for Skips)'}
              </p>
              <p className="text-xs text-mocha-600">
                {isLocked
                  ? `Cutoff deadline of ${cutoffTime} IST on previous day has passed. Numbers are frozen.`
                  : `Customers can skip until ${cutoffTime} IST on previous day. Counts update in real-time.`}
              </p>
            </div>
          </div>

          <div className="text-right text-xs text-mocha-700">
            <span className="font-semibold">Target Date:</span>{' '}
            <strong className="text-mocha-950 text-sm">{date}</strong>
          </div>
        </div>

        {/* Headcount Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="p-4 rounded-2xl bg-amber-500 text-white shadow-md">
            <p className="text-xs uppercase font-bold tracking-wider opacity-90">Total Meals</p>
            <p className="text-3xl font-serif font-black mt-1">{totals.total}</p>
            <p className="text-[11px] opacity-80 mt-1">Ready for kitchen prep</p>
          </div>

          <div className="p-4 rounded-2xl bg-mocha-50 border border-mocha-200">
            <p className="text-xs font-semibold text-mocha-600">Lunch Count</p>
            <p className="text-2xl font-serif font-extrabold text-mocha-950 mt-1">{totals.lunch}</p>
            <p className="text-[11px] text-mocha-500 mt-1">Midday deliveries</p>
          </div>

          <div className="p-4 rounded-2xl bg-mocha-50 border border-mocha-200">
            <p className="text-xs font-semibold text-mocha-600">Dinner Count</p>
            <p className="text-2xl font-serif font-extrabold text-mocha-950 mt-1">{totals.dinner}</p>
            <p className="text-[11px] text-mocha-500 mt-1">Evening deliveries</p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
            <p className="text-xs font-semibold text-emerald-800">Pure Veg</p>
            <p className="text-2xl font-serif font-extrabold text-emerald-950 mt-1">{totals.veg}</p>
            <p className="text-[11px] text-emerald-700 mt-1">Vegetarian prep</p>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200">
            <p className="text-xs font-semibold text-rose-800">Non-Veg</p>
            <p className="text-2xl font-serif font-extrabold text-rose-950 mt-1">{totals.nonveg}</p>
            <p className="text-[11px] text-rose-700 mt-1">Meat / egg prep</p>
          </div>
        </div>

        {/* Skipped Notice */}
        <div className="p-3 bg-gold-50 border border-gold-200 rounded-xl text-xs text-mocha-800 flex items-center justify-between">
          <span className="flex items-center space-x-1.5 font-medium">
            <CheckCircle2 className="w-4 h-4 text-gold-700" />
            <span>
              <strong>{skippedCount} Meals</strong> skipped/paused for this date (Excluded from cooking plan).
            </span>
          </span>
          <span className="text-[11px] text-gold-800">No Food Waste</span>
        </div>

        {/* Partitioned Breakdown Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-serif font-bold text-mocha-950 flex items-center space-x-2">
              <Utensils className="w-4 h-4 text-amber-600" />
              <span>Area & Diet Distribution</span>
            </h3>
            <span className="text-xs text-mocha-500">
              Kitchen cooking partition
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-mocha-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-canvas-subtle text-mocha-900 font-semibold border-b border-mocha-200">
                <tr>
                  <th className="py-3 px-4">Meal Slot</th>
                  <th className="py-3 px-4">Diet Preference</th>
                  <th className="py-3 px-4">Delivery Route / Area</th>
                  <th className="py-3 px-4 text-right">Cook Quantity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mocha-100">
                {breakdown.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-mocha-500">
                      No active meals scheduled for {date}.
                    </td>
                  </tr>
                ) : (
                  breakdown.map((row, idx) => (
                    <tr key={idx} className="hover:bg-mocha-50/50">
                      <td className="py-3 px-4 font-semibold text-mocha-900 capitalize">
                        {row.mealType}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                            row.diet === 'veg'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                              : 'bg-rose-50 text-rose-800 border border-rose-300'
                          }`}
                        >
                          {row.diet}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-mocha-800 font-medium">
                        <span className="inline-flex items-center">
                          <MapPin className="w-3.5 h-3.5 mr-1 text-gold-600" />
                          {row.area}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-base font-serif font-bold text-mocha-950">
                          {row.count}
                        </span>{' '}
                        <span className="text-mocha-500 text-[11px]">tiffins</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Prep;
