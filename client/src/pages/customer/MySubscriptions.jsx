import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios.js';
import { Loader } from '../../components/Loader.jsx';
import { EmptyState } from '../../components/EmptyState.jsx';
import { ErrorBanner } from '../../components/ErrorBanner.jsx';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import { Calendar, ArrowRight, MapPin, Receipt, Clock } from 'lucide-react';

export const MySubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSubscriptions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/subscriptions/mine');
      if (res.success) {
        setSubscriptions(res.data.subscriptions);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch subscriptions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-extrabold text-mocha-950">
            My Meal Subscriptions
          </h1>
          <p className="text-sm text-mocha-600 mt-1">
            Manage your daily meal skips, pauses, and monthly ledger without WhatsApp arguments.
          </p>
        </div>

        <Link
          to="/providers"
          className="inline-flex items-center space-x-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-smooth self-start sm:self-auto"
        >
          <span>Explore More Kitchens</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <ErrorBanner message={error} onRetry={fetchSubscriptions} />

      {loading ? (
        <Loader message="Fetching your meal subscriptions..." />
      ) : subscriptions.length === 0 ? (
        <EmptyState
          icon="🍱"
          title="No Active Subscriptions Yet"
          description="Browse nearby home kitchens and start a weekly or monthly subscription."
          actionText="Browse Kitchens"
          onAction={() => (window.location.href = '/providers')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subscriptions.map((sub) => (
            <div
              key={sub._id}
              className="bg-white rounded-2xl border border-mocha-200/80 p-6 shadow-xs hover:border-gold-400 hover:shadow-md transition-smooth flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <StatusBadge status={sub.status} />
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/50">
                    {sub.durationDays} Days Plan
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-serif font-bold text-mocha-950">
                    {sub.planId?.name || 'Tiffin Plan'}
                  </h3>
                  <p className="text-xs font-semibold text-gold-700 mt-0.5">
                    {sub.providerId?.businessName}
                  </p>
                </div>

                <div className="pt-3 border-t border-mocha-100 space-y-2 text-xs text-mocha-700">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-3.5 h-3.5 text-mocha-500 shrink-0" />
                    <span>
                      {sub.startDate} to {sub.endDate}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>
                      Cutoff: <strong>{sub.providerId?.cutoffTime || '20:00'} IST</strong>
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3.5 h-3.5 text-gold-600 shrink-0" />
                    <span className="truncate">{sub.address?.area}</span>
                  </div>
                </div>
              </div>

              <div className="pt-5 mt-4 border-t border-mocha-100 flex items-center justify-between gap-2">
                <Link
                  to={`/billing/${sub._id}`}
                  className="inline-flex items-center space-x-1 text-xs font-bold text-gold-800 hover:text-gold-950 px-3 py-1.5 rounded-lg hover:bg-gold-50 transition-smooth"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>Itemized Bill</span>
                </Link>

                <Link
                  to={`/subscriptions/${sub._id}`}
                  className="inline-flex items-center space-x-1 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-smooth"
                >
                  <span>Meal Calendar</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MySubscriptions;
