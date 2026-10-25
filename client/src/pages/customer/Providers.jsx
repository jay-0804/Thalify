import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios.js';
import { Loader } from '../../components/Loader.jsx';
import { EmptyState } from '../../components/EmptyState.jsx';
import { ErrorBanner } from '../../components/ErrorBanner.jsx';
import { Search, MapPin, Clock, ArrowRight, ShieldCheck } from 'lucide-react';

export const Providers = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedArea, setSelectedArea] = useState('');

  const fetchProviders = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = selectedArea ? `/providers?area=${encodeURIComponent(selectedArea)}` : '/providers';
      const res = await api.get(url);
      if (res.success) {
        setProviders(res.data.providers);
      }
    } catch (err) {
      setError(err.message || 'Failed to load mess providers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, [selectedArea]);

  const allAreas = Array.from(
    new Set(providers.flatMap((p) => p.deliveryAreas || []))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-mocha-950 via-mocha-900 to-amber-950 text-white p-8 md:p-12 shadow-xl border border-gold-500/20">
        <div className="relative z-10 max-w-2xl space-y-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gold-500/20 text-gold-300 border border-gold-500/40">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" />
            Verified Homestyle Kitchens
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-extrabold tracking-tight leading-tight">
            Fresh, Homely Mess Subscriptions Delivered Daily.
          </h1>
          <p className="text-mocha-200 text-sm sm:text-base leading-relaxed">
            No WhatsApp chaos. Flexible skips before cutoff with automatic bill credits. Choose your trusted neighborhood kitchen.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 opacity-15 text-9xl transform translate-x-8 translate-y-8 select-none">
          🍱
        </div>
      </div>

      {/* Area Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 bg-white/80 backdrop-blur-xs rounded-2xl border border-mocha-200/80 shadow-xs">
        <div className="flex items-center space-x-2 text-mocha-900 font-semibold text-sm">
          <MapPin className="w-4 h-4 text-amber-600" />
          <span>Filter by Service Area:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedArea('')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-smooth ${
              selectedArea === ''
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-mocha-100 text-mocha-700 hover:bg-mocha-200'
            }`}
          >
            All Areas
          </button>
          {['Koramangala', 'HSR Layout', 'BTM', 'Whitefield', 'Marathahalli'].map((area) => (
            <button
              key={area}
              onClick={() => setSelectedArea(area)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-smooth ${
                selectedArea === area
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-mocha-100 text-mocha-700 hover:bg-mocha-200'
              }`}
            >
              {area}
            </button>
          ))}
        </div>
      </div>

      {/* Error state */}
      <ErrorBanner message={error} onRetry={fetchProviders} />

      {/* Loading state */}
      {loading ? (
        <Loader message="Discovering home kitchens near you..." />
      ) : providers.length === 0 ? (
        <EmptyState
          icon="🍲"
          title="No providers found in this area"
          description="Try selecting 'All Areas' or check back soon as more kitchens onboard."
          actionText="Show All Kitchens"
          onAction={() => setSelectedArea('')}
        />
      ) : (
        /* Provider Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {providers.map((p) => (
            <div
              key={p._id}
              className="group bg-white rounded-2xl border border-mocha-200/80 shadow-xs hover:shadow-lg hover:border-gold-400 transition-smooth flex flex-col overflow-hidden"
            >
              <div className="p-6 flex-1 space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-xl font-serif font-bold text-mocha-950 group-hover:text-amber-700 transition-colors">
                      {p.businessName}
                    </h3>
                    <p className="text-xs text-mocha-500 mt-1 line-clamp-2">
                      {p.description || 'Authentic daily meals cooked fresh.'}
                    </p>
                  </div>
                  <span className="shrink-0 px-2.5 py-1 rounded-lg text-xs font-bold bg-gold-100 text-mocha-900 border border-gold-300">
                    {p.planCount} {p.planCount === 1 ? 'Plan' : 'Plans'}
                  </span>
                </div>

                <div className="pt-2 border-t border-mocha-100 space-y-2 text-xs text-mocha-700">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>
                      Daily Cutoff: <strong className="text-mocha-900">{p.cutoffTime} IST</strong>
                    </span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-3.5 h-3.5 text-gold-600 shrink-0 mt-0.5" />
                    <span className="flex-1">
                      Serves: {p.deliveryAreas?.join(', ')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-canvas-subtle/50 border-t border-mocha-100 flex items-center justify-between">
                <span className="text-xs font-medium text-mocha-600">
                  Rolling Weekly Menu
                </span>
                <Link
                  to={`/providers/${p._id}`}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-smooth group-hover:translate-x-0.5"
                >
                  <span>View Plans</span>
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

export default Providers;
