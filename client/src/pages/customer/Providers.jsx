import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios.js';
import { Loader } from '../../components/Loader.jsx';
import { EmptyState } from '../../components/EmptyState.jsx';
import { ErrorBanner } from '../../components/ErrorBanner.jsx';
import {
  Search,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  Star,
  Sparkles,
  CheckCircle2,
  Calendar,
  Receipt,
  HeartHandshake,
  UtensilsCrossed,
  Flame,
  Award,
} from 'lucide-react';

// Curated authentic culinary images for each home kitchen
const KITCHEN_METADATA = {
  'Maa Ki Rasoi': {
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
    tagline: 'Desi Ghee Phulkas & Slow-Cooked Dal Makhani',
    rating: 4.9,
    reviews: 420,
    cuisine: 'North Indian',
    fssai: 'FSSAI Certified #21224018000124',
    badge: 'Top Rated in Koramangala',
  },
  'Annapurna Homely Mess': {
    image: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=800&q=80',
    tagline: 'Traditional Tamil Sambar, Rasam & Podi Oota',
    rating: 4.8,
    reviews: 385,
    cuisine: 'South Indian',
    fssai: 'FSSAI Certified #21224018000350',
    badge: 'Authentic Comfort Food',
  },
  'Campus Mess Co': {
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80',
    tagline: 'Wholesome Student Budget & Homestyle Thalis',
    rating: 4.7,
    reviews: 512,
    cuisine: 'North Indian',
    fssai: 'FSSAI Certified #21224018000889',
    badge: 'Popular with Tech PGs',
  },
  'Shuddh Satvik Rasoi': {
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80',
    tagline: '100% Jain & No Onion No Garlic Satvik Meals',
    rating: 4.9,
    reviews: 295,
    cuisine: 'Satvik',
    fssai: 'FSSAI Certified #21224018000412',
    badge: 'Sanctified Pure Kitchen',
  },
  'NutriFit Clean Fuel': {
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    tagline: 'Macro-Counted High Protein & Clean Gym Fuel',
    rating: 4.9,
    reviews: 460,
    cuisine: 'Fitness',
    fssai: 'FSSAI Certified #21224018000671',
    badge: '35g+ Verified Protein',
  },
  "Bramhin's Heritage Mess": {
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
    tagline: 'Pure Ghee Udupi Oota, Majjige Huli & Kootu',
    rating: 4.9,
    reviews: 340,
    cuisine: 'South Indian',
    fssai: 'FSSAI Certified #21224018000219',
    badge: 'Heritage Recipe Since 1994',
  },
  'Whitefield Chef Table': {
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
    tagline: 'Nutritious Executive Home Chef Meals for IT Pros',
    rating: 4.8,
    reviews: 310,
    cuisine: 'North Indian',
    fssai: 'FSSAI Certified #21224018000552',
    badge: 'Executive Daily Meals',
  },
  'Dakshin Daily Meals': {
    image: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=800&q=80',
    tagline: 'Homestyle Chettinad & Malabar Daily Tiffin',
    rating: 4.7,
    reviews: 280,
    cuisine: 'South Indian',
    fssai: 'FSSAI Certified #21224018000783',
    badge: 'Coconut Oil & Spices',
  },
};

const DEFAULT_METADATA = {
  image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
  tagline: 'Nutritious & Fresh Homestyle Meals',
  rating: 4.8,
  reviews: 210,
  cuisine: 'North Indian',
  fssai: 'Verified Home Mess',
  badge: 'Neighborhood Favorite',
};

export const Providers = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedArea, setSelectedArea] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('All');

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

  // Filter by search query and cuisine
  const filteredProviders = providers.filter((p) => {
    const meta = KITCHEN_METADATA[p.businessName] || DEFAULT_METADATA;
    const matchesSearch =
      p.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.deliveryAreas || []).some((a) => a.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCuisine =
      selectedCuisine === 'All' ||
      meta.cuisine.toLowerCase().includes(selectedCuisine.toLowerCase());

    return matchesSearch && matchesCuisine;
  });

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section with Warm Culinary Palette & Visual Depth */}
      <section className="relative overflow-hidden bg-gradient-to-br from-mocha-950 via-mocha-900 to-amber-950 text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8 border-b border-gold-500/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(217,107,39,0.18),transparent_50%)] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(197,160,89,0.12),transparent_50%)] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-gold-500/20 text-gold-300 border border-gold-500/40 text-xs font-semibold backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-gold-400" />
              <span>Zero-Dispute Daily Tiffin & Mess Subscriptions</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-extrabold tracking-tight leading-tight">
              Hot Homestyle Meals. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-gold-400">
                Skip Anytime Before 5:00 PM.
              </span>
            </h1>

            <p className="text-mocha-200 text-sm sm:text-base leading-relaxed max-w-xl">
              Subscribe to verified neighborhood home kitchens. Going out with friends? Skip a meal with 1-click on your calendar. Your bill automatically credits every missed rupee—no arguments, no WhatsApp disputes.
            </p>

            {/* Quick Value Pillars */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-mocha-800/80 text-xs">
              <div className="space-y-1">
                <p className="text-lg sm:text-2xl font-serif font-black text-gold-400">100%</p>
                <p className="text-mocha-300 font-medium">Auto-Credit on Skips</p>
              </div>
              <div className="space-y-1">
                <p className="text-lg sm:text-2xl font-serif font-black text-amber-400">IST 17:00</p>
                <p className="text-mocha-300 font-medium">Server-Guaranteed Cutoff</p>
              </div>
              <div className="space-y-1">
                <p className="text-lg sm:text-2xl font-serif font-black text-white">₹0 Drift</p>
                <p className="text-mocha-300 font-medium">Mathematical Ledger</p>
              </div>
            </div>
          </div>

          {/* Hero Visual Card Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-gold-500/30 group">
              <img
                src="https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80"
                alt="Fresh Indian Thali"
                className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-mocha-950 via-mocha-950/40 to-transparent"></div>

              <div className="absolute bottom-0 left-0 right-0 p-6 space-y-2">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-600 text-white">
                  Today's Featured Mess
                </span>
                <h3 className="text-xl font-serif font-bold text-white">Maa Ki Rasoi</h3>
                <p className="text-xs text-mocha-200">
                  Phulkas with desi ghee, Punjabi rajma, dal tadka & steamed rice.
                </p>
                <div className="flex items-center justify-between text-xs pt-2 text-gold-300 font-semibold">
                  <span>Starting at ₹95 / meal</span>
                  <span className="flex items-center text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-current mr-1" />
                    4.9 (420+ reviews)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Interactive Search & Filter Control Bar */}
        <div className="bg-white rounded-3xl border border-mocha-200/80 p-6 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-mocha-400 absolute left-4 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by kitchen name, dish, or neighborhood..."
                className="w-full pl-11 pr-4 py-2.5 text-xs sm:text-sm border border-mocha-200 rounded-2xl bg-canvas focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>

            {/* Cuisine Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              {['All', 'North Indian', 'South Indian', 'Satvik', 'Fitness'].map((cuisine) => (
                <button
                  key={cuisine}
                  onClick={() => setSelectedCuisine(cuisine)}
                  className={`px-3.5 py-2 rounded-xl transition-smooth ${
                    selectedCuisine === cuisine
                      ? 'bg-mocha-950 text-white shadow-xs'
                      : 'bg-canvas-subtle text-mocha-700 hover:bg-mocha-100'
                  }`}
                >
                  {cuisine}
                </button>
              ))}
            </div>
          </div>

          {/* Area Selector Bar */}
          <div className="pt-4 border-t border-mocha-100 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-mocha-800 flex items-center mr-2">
              <MapPin className="w-3.5 h-3.5 mr-1 text-amber-600" />
              Service Areas:
            </span>
            <button
              onClick={() => setSelectedArea('')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-smooth ${
                selectedArea === ''
                  ? 'bg-amber-600 text-white'
                  : 'bg-mocha-50 text-mocha-700 hover:bg-mocha-100'
              }`}
            >
              All Neighborhoods
            </button>
            {['Koramangala', 'HSR Layout', 'BTM Layout', 'Whitefield', 'Jayanagar', 'Indiranagar'].map((area) => (
              <button
                key={area}
                onClick={() => setSelectedArea(area)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-smooth ${
                  selectedArea === area
                    ? 'bg-amber-600 text-white'
                    : 'bg-mocha-50 text-mocha-700 hover:bg-mocha-100'
                }`}
              >
                {area}
              </button>
            ))}
          </div>
        </div>

        {/* Error state */}
        <ErrorBanner message={error} onRetry={fetchProviders} />

        {/* Kitchen Discovery Grid */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-serif font-bold text-mocha-950">
                Verified Neighborhood Kitchens
              </h2>
              <p className="text-xs text-mocha-500 mt-0.5">
                Showing {filteredProviders.length} home mess providers serving your area
              </p>
            </div>
          </div>

          {loading ? (
            <Loader message="Discovering home kitchens near you..." />
          ) : filteredProviders.length === 0 ? (
            <EmptyState
              icon="🍲"
              title="No kitchens found matching your selection"
              description="Try selecting 'All Neighborhoods' or clearing your search term to see all kitchens."
              actionText="Reset Filters"
              onAction={() => {
                setSelectedArea('');
                setSearchQuery('');
                setSelectedCuisine('All');
              }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProviders.map((p) => {
                const meta = KITCHEN_METADATA[p.businessName] || DEFAULT_METADATA;

                return (
                  <div
                    key={p._id}
                    className="group bg-white rounded-3xl border border-mocha-200/80 shadow-xs hover:shadow-xl hover:border-gold-400 transition-smooth flex flex-col overflow-hidden"
                  >
                    {/* Visual Kitchen Food Banner */}
                    <div className="relative h-48 overflow-hidden bg-mocha-100">
                      <img
                        src={meta.image}
                        alt={p.businessName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-mocha-950/80 backdrop-blur-xs text-gold-300 border border-gold-500/30">
                          {meta.badge}
                        </span>
                        <span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-white text-mocha-900 shadow-sm flex items-center">
                          <Star className="w-3 h-3 text-amber-500 fill-current mr-1" />
                          {meta.rating}
                        </span>
                      </div>

                      {/* Bottom Image Tagline */}
                      <div className="absolute bottom-3 left-3 right-3">
                        <p className="text-xs font-semibold text-white truncate drop-shadow-sm">
                          {meta.tagline}
                        </p>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-6 flex-1 space-y-4 flex flex-col justify-between">
                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
                              {meta.cuisine}
                            </span>
                            <span className="text-[11px] text-mocha-500 font-medium">
                              {p.planCount || 3} Plans
                            </span>
                          </div>
                          <h3 className="text-xl font-serif font-bold text-mocha-950 group-hover:text-amber-700 transition-colors mt-0.5">
                            {p.businessName}
                          </h3>
                        </div>

                        <p className="text-xs text-mocha-600 line-clamp-2 leading-relaxed">
                          {p.description}
                        </p>

                        {/* Operational Metrics */}
                        <div className="space-y-2 pt-2 border-t border-mocha-100 text-xs text-mocha-700">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>
                              Skip Cutoff: <strong className="text-mocha-950">{p.cutoffTime} IST</strong> (Previous Day)
                            </span>
                          </div>
                          <div className="flex items-start space-x-2">
                            <MapPin className="w-3.5 h-3.5 text-gold-600 shrink-0 mt-0.5" />
                            <span className="flex-1 truncate">
                              Areas: {p.deliveryAreas?.join(', ')}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Action Footer */}
                      <div className="pt-4 border-t border-mocha-100 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] uppercase font-bold text-mocha-400">Starting at</p>
                          <p className="text-base font-serif font-extrabold text-mocha-950">
                            ₹85 <span className="text-xs font-normal text-mocha-500">/ meal</span>
                          </p>
                        </div>

                        <Link
                          to={`/providers/${p._id}`}
                          className="inline-flex items-center space-x-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-smooth group-hover:translate-x-0.5"
                        >
                          <span>Explore Plans</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* "Why Thalify" - Interactive Visual Comparison Section */}
        <section className="bg-canvas-subtle/80 rounded-3xl border border-mocha-200/80 p-8 sm:p-12 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-3xl font-serif font-extrabold text-mocha-950">
              The Smarter Way to Eat Daily
            </h2>
            <p className="text-xs sm:text-sm text-mocha-600">
              Compare the traditional mess experience against Thalify's guaranteed software workflow
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* The Old Way */}
            <div className="bg-white/80 p-6 rounded-2xl border border-rose-200 space-y-4">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200">
                ❌ Traditional WhatsApp & Notebook Mess
              </span>
              <ul className="space-y-3 text-xs text-mocha-700">
                <li className="flex items-start space-x-2">
                  <span className="text-rose-600 font-bold">✕</span>
                  <span><strong>WhatsApp Message Chaos:</strong> Messages get buried; cooks forget you notified a skip.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-rose-600 font-bold">✕</span>
                  <span><strong>End-of-Month Bill Fights:</strong> No paper trail; you pay for meals you never ate.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-rose-600 font-bold">✕</span>
                  <span><strong>Kitchen Guesswork:</strong> Cooks over-prepare food resulting in stale meals and waste.</span>
                </li>
              </ul>
            </div>

            {/* The Thalify Way */}
            <div className="bg-white p-6 rounded-2xl border border-emerald-300 shadow-sm space-y-4">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                ✅ With Thalify
              </span>
              <ul className="space-y-3 text-xs text-mocha-900">
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>1-Click Calendar Skip:</strong> Toggle skip before 5:00 PM. Server automatically validates and freezes counts.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Mathematical Itemized Ledger:</strong> Exact rupee breakdown per meal. Every skip is credited automatically.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Real-Time Kitchen Headcount:</strong> Cooks know exact counts before shopping. Fresh food guaranteed.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Providers;
