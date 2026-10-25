import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios.js';
import { useSocket } from '../../context/SocketContext.jsx';
import { Loader } from '../../components/Loader.jsx';
import { ErrorBanner } from '../../components/ErrorBanner.jsx';
import {
  Flame,
  Truck,
  Receipt,
  Users,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Layers,
} from 'lucide-react';

export const Dashboard = () => {
  const { onPrepChanged, onDeliveryUpdate } = useSocket();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOverview = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/provider/dashboard');
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch provider dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  // Real-time refresh when customer skips or delivery happens
  useEffect(() => {
    const unsubPrep = onPrepChanged(() => fetchOverview());
    const unsubDelivery = onDeliveryUpdate(() => fetchOverview());
    return () => {
      unsubPrep();
      unsubDelivery();
    };
  }, [onPrepChanged, onDeliveryUpdate]);

  if (loading) return <Loader message="Loading kitchen dashboard metrics..." />;
  if (error) return <ErrorBanner message={error} onRetry={fetchOverview} />;
  if (!data) return null;

  const { tomorrowHeadcount, tomorrowPrep, deliveryProgress, totalUnpaidBalance, activeSubscribersCount } = data;

  const deliveryCompletion =
    deliveryProgress.total > 0
      ? Math.round(((deliveryProgress.delivered + deliveryProgress.failed) / deliveryProgress.total) * 100)
      : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-extrabold text-mocha-950">
            Kitchen Operations Control
          </h1>
          <p className="text-sm text-mocha-600 mt-1">
            Real-time headcount, delivery dispatch progress, and subscriber financial ledger.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            to="/provider/prep"
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-smooth"
          >
            <Flame className="w-4 h-4" />
            <span>Open Kitchen Prep Sheet</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1: Tomorrow Headcount */}
        <div className="bg-white p-6 rounded-2xl border border-mocha-200/80 shadow-xs hover:border-gold-400 transition-smooth">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-mocha-500 tracking-wider">
              Tomorrow's Cook
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200/50">
              <Flame className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-3xl font-serif font-black text-mocha-950">{tomorrowHeadcount}</h2>
            <p className="text-xs text-mocha-500 mt-1 flex items-center">
              <span>Veg: {tomorrowPrep?.totals?.veg || 0}</span>
              <span className="mx-2">•</span>
              <span>Non-Veg: {tomorrowPrep?.totals?.nonveg || 0}</span>
            </p>
          </div>
          <Link
            to="/provider/prep"
            className="mt-4 pt-3 border-t border-mocha-100 flex items-center justify-between text-xs font-bold text-amber-700 hover:text-amber-800"
          >
            <span>View Kitchen Breakdown</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Metric 2: Today's Delivery Progress */}
        <div className="bg-white p-6 rounded-2xl border border-mocha-200/80 shadow-xs hover:border-gold-400 transition-smooth">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-mocha-500 tracking-wider">
              Today's Dispatch
            </span>
            <div className="p-2 rounded-xl bg-gold-50 text-gold-700 border border-gold-200/50">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-3xl font-serif font-black text-mocha-950">
              {deliveryProgress.delivered} / {deliveryProgress.total}
            </h2>
            <div className="w-full bg-mocha-100 rounded-full h-2 mt-2 overflow-hidden">
              <div
                className="bg-amber-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${deliveryCompletion}%` }}
              ></div>
            </div>
          </div>
          <Link
            to="/provider/delivery"
            className="mt-4 pt-3 border-t border-mocha-100 flex items-center justify-between text-xs font-bold text-gold-800 hover:text-gold-900"
          >
            <span>Open Delivery Board</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Metric 3: Total Unpaid Balance */}
        <div className="bg-white p-6 rounded-2xl border border-mocha-200/80 shadow-xs hover:border-gold-400 transition-smooth">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-mocha-500 tracking-wider">
              Outstanding Dues
            </span>
            <div className="p-2 rounded-xl bg-mocha-50 text-mocha-800 border border-mocha-200">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-3xl font-serif font-black text-mocha-950">
              ₹{totalUnpaidBalance}
            </h2>
            <p className="text-xs text-mocha-500 mt-1">
              Derived ledger (after credits)
            </p>
          </div>
          <Link
            to="/provider/billing"
            className="mt-4 pt-3 border-t border-mocha-100 flex items-center justify-between text-xs font-bold text-mocha-800 hover:text-mocha-950"
          >
            <span>Record Payment</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Metric 4: Active Subscribers */}
        <div className="bg-white p-6 rounded-2xl border border-mocha-200/80 shadow-xs hover:border-gold-400 transition-smooth">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-mocha-500 tracking-wider">
              Active Subscribers
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/50">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-3xl font-serif font-black text-mocha-950">
              {activeSubscribersCount}
            </h2>
            <p className="text-xs text-mocha-500 mt-1">
              Active meal recurring plans
            </p>
          </div>
          <Link
            to="/provider/menu"
            className="mt-4 pt-3 border-t border-mocha-100 flex items-center justify-between text-xs font-bold text-emerald-800 hover:text-emerald-900"
          >
            <span>Manage Plans & Menu</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Quick Navigation Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Operations Guide Card */}
        <div className="bg-white rounded-3xl border border-mocha-200/80 p-6 sm:p-8 space-y-4">
          <h3 className="text-lg font-serif font-bold text-mocha-950">
            Daily Operational Rhythm
          </h3>
          <div className="space-y-3 text-xs text-mocha-700">
            <div className="p-3 bg-canvas-subtle rounded-xl flex items-start space-x-3">
              <span className="font-bold text-amber-700 shrink-0">1. Night (Cutoff):</span>
              <span>Headcount freezes at your cutoff time. Check the Prep page for final counts.</span>
            </div>
            <div className="p-3 bg-canvas-subtle rounded-xl flex items-start space-x-3">
              <span className="font-bold text-gold-700 shrink-0">2. Morning (06:00):</span>
              <span>Delivery tasks generate automatically. Assign routes to your delivery riders.</span>
            </div>
            <div className="p-3 bg-canvas-subtle rounded-xl flex items-start space-x-3">
              <span className="font-bold text-emerald-700 shrink-0">3. Noon/Evening:</span>
              <span>Riders mark drops delivered. Customer bills update in real time with zero disputes.</span>
            </div>
          </div>
        </div>

        {/* Live Delivery Pulse Card */}
        <div className="bg-white rounded-3xl border border-mocha-200/80 p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-serif font-bold text-mocha-950">
              Today's Drop Status
            </h3>
            <span className="text-xs font-semibold text-gold-700">
              {deliveryProgress.total} Total Drops
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center text-xs">
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200/60">
              <p className="text-amber-800 font-semibold">Pending</p>
              <p className="text-2xl font-serif font-bold text-amber-950 mt-1">{deliveryProgress.pending}</p>
            </div>
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200/60">
              <p className="text-emerald-800 font-semibold">Delivered</p>
              <p className="text-2xl font-serif font-bold text-emerald-950 mt-1">{deliveryProgress.delivered}</p>
            </div>
            <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200/60">
              <p className="text-rose-800 font-semibold">Failed</p>
              <p className="text-2xl font-serif font-bold text-rose-950 mt-1">{deliveryProgress.failed}</p>
            </div>
          </div>

          <Link
            to="/provider/delivery"
            className="block text-center py-2.5 px-4 bg-mocha-100 hover:bg-mocha-200 text-mocha-900 text-xs font-bold rounded-xl transition-smooth"
          >
            Open Dispatch & Assignment Board
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
