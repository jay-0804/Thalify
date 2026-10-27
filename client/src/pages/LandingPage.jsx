import React, { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Thali3DShowcase } from '../components/Thali3DShowcase.jsx';
import {
  UtensilsCrossed,
  ChefHat,
  Truck,
  ShieldCheck,
  Clock,
  Receipt,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Flame,
  Star,
  Zap,
  TrendingDown,
  Store,
  Users,
} from 'lucide-react';

export const LandingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        const navHeight = 80;
        const targetY = el.getBoundingClientRect().top + window.pageYOffset - navHeight;
        setTimeout(() => {
          window.scrollTo({ top: targetY, behavior: 'smooth' });
        }, 150);
      }
    }
  }, [location.hash]);

  const scrollToTarget = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const navHeight = 80;
      const targetY = el.getBoundingClientRect().top + window.pageYOffset - navHeight;
      window.scrollTo({ top: targetY, behavior: 'smooth' });
      window.history.pushState(null, '', `#${id}`);
    }
  };

  return (
    <div className="space-y-24 pb-20 overflow-x-clip">
      {/* 1. HERO SECTION WITH 3D ANIMATED THALI SHOWCASE */}
      <section className="relative overflow-hidden bg-gradient-to-b from-mocha-950 via-mocha-900 to-canvas text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8">
        {/* Ambient atmospheric gradients */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-gold-500/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-gold-500/20 text-gold-300 border border-gold-500/40 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-gold-400" />
              <span>Thalify • The Smart Mess & Tiffin Ecosystem</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-extrabold tracking-tight leading-tight">
              Thalify.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-gold-400 block sm:inline">
                Your daily meals, on your terms.
              </span>
            </h1>

            <p className="text-mocha-200 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Subscribe to verified neighborhood home kitchens and PG messes. Going out with friends? Skip any meal with 1-click before 5:00 PM cutoff. Your bill automatically credits every single rupee.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                to="/providers"
                className="w-full sm:w-auto px-7 py-3.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-smooth flex items-center justify-center space-x-2"
              >
                <span>Browse Kitchens & Plans</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                type="button"
                onClick={() => scrollToTarget('partner-section')}
                className="w-full sm:w-auto px-6 py-3.5 bg-mocha-800/80 hover:bg-mocha-800 text-gold-300 hover:text-gold-200 font-bold text-sm rounded-2xl border border-gold-500/30 transition-smooth flex items-center justify-center space-x-2 cursor-pointer"
              >
                <ChefHat className="w-4 h-4" />
                <span>Partner As a Kitchen</span>
              </button>
            </div>

            {/* Aligned Metrics Bar */}
            <div className="grid grid-cols-3 gap-3 pt-6 max-w-lg mx-auto lg:mx-0">
              <div className="p-3.5 rounded-2xl bg-mocha-900/70 border border-mocha-700/60 text-center flex flex-col justify-center h-20 shadow-xs">
                <p className="text-xl sm:text-2xl font-serif font-black text-gold-400">100%</p>
                <p className="text-[11px] text-mocha-300 font-medium truncate mt-0.5">Skip Credits</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-mocha-900/70 border border-mocha-700/60 text-center flex flex-col justify-center h-20 shadow-xs">
                <p className="text-xl sm:text-2xl font-serif font-black text-amber-400">17:00 IST</p>
                <p className="text-[11px] text-mocha-300 font-medium truncate mt-0.5">Daily Cutoff</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-mocha-900/70 border border-mocha-700/60 text-center flex flex-col justify-center h-20 shadow-xs">
                <p className="text-xl sm:text-2xl font-serif font-black text-white">₹0 Drift</p>
                <p className="text-[11px] text-mocha-300 font-medium truncate mt-0.5">Derived Ledger</p>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Interactive Animated Thali */}
          <div className="lg:col-span-5 flex justify-center">
            <Thali3DShowcase />
          </div>
        </div>
      </section>

      {/* 2. CULINARY VARIETY SHOWCASE (Interactive Food Gallery) */}
      <section id="culinary-variety" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 scroll-mt-20">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-700">
            Catering to Every Palate
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-extrabold text-mocha-950">
            Authentic Regional Cooking
          </h2>
          <p className="text-xs sm:text-sm text-mocha-600">
            Cooked fresh twice daily by passionate neighborhood home cooks and cloud messes
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: North Indian */}
          <div className="bg-white rounded-3xl border border-mocha-200/90 overflow-hidden shadow-xs hover:shadow-xl hover:border-gold-400 transition-smooth group flex flex-col justify-between">
            <div>
              <div className="h-48 overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=700&q=80"
                  alt="North Indian Thali"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-bold bg-mocha-950/85 text-gold-300 backdrop-blur-xs shadow-xs">
                  Desi Ghee Phulkas
                </span>
              </div>
              <div className="p-5 space-y-2">
                <h3 className="text-base font-serif font-bold text-mocha-950 h-7 flex items-center">
                  North Indian Homestyle
                </h3>
                <p className="text-xs text-mocha-600 leading-relaxed min-h-[56px]">
                  Slow-cooked dal makhani, tender paneer, phulkas with desi ghee, jeera rice & seasonal sabzi.
                </p>
              </div>
            </div>
            <div className="p-5 pt-3 flex items-center justify-between text-xs border-t border-mocha-100 bg-mocha-50/20">
              <span className="font-bold text-mocha-900">From ₹95 <span className="font-normal text-mocha-500">/ meal</span></span>
              <Link to="/providers" className="text-amber-700 font-bold hover:text-amber-800 flex items-center group-hover:translate-x-0.5 transition-transform">
                <span>View Plans</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>
          </div>

          {/* Card 2: South Indian */}
          <div className="bg-white rounded-3xl border border-mocha-200/90 overflow-hidden shadow-xs hover:shadow-xl hover:border-gold-400 transition-smooth group flex flex-col justify-between">
            <div>
              <div className="h-48 overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=700&q=80"
                  alt="South Indian Traditional Meal"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-bold bg-mocha-950/85 text-gold-300 backdrop-blur-xs shadow-xs">
                  Banana Leaf Oota
                </span>
              </div>
              <div className="p-5 space-y-2">
                <h3 className="text-base font-serif font-bold text-mocha-950 h-7 flex items-center">
                  Traditional South Indian
                </h3>
                <p className="text-xs text-mocha-600 leading-relaxed min-h-[56px]">
                  Steamed Sona Masoori, drumstick sambar, soothing pepper rasam, seasonal poriyal & curd.
                </p>
              </div>
            </div>
            <div className="p-5 pt-3 flex items-center justify-between text-xs border-t border-mocha-100 bg-mocha-50/20">
              <span className="font-bold text-mocha-900">From ₹85 <span className="font-normal text-mocha-500">/ meal</span></span>
              <Link to="/providers" className="text-amber-700 font-bold hover:text-amber-800 flex items-center group-hover:translate-x-0.5 transition-transform">
                <span>View Plans</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>
          </div>

          {/* Card 3: Fitness & Gym */}
          <div className="bg-white rounded-3xl border border-mocha-200/90 overflow-hidden shadow-xs hover:shadow-xl hover:border-gold-400 transition-smooth group flex flex-col justify-between">
            <div>
              <div className="h-48 overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=700&q=80"
                  alt="High Protein Fitness Meals"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-bold bg-mocha-950/85 text-gold-300 backdrop-blur-xs shadow-xs">
                  35g+ Clean Protein
                </span>
              </div>
              <div className="p-5 space-y-2">
                <h3 className="text-base font-serif font-bold text-mocha-950 h-7 flex items-center">
                  Fitness & Gym Meals
                </h3>
                <p className="text-xs text-mocha-600 leading-relaxed min-h-[56px]">
                  Macro-counted grilled paneer or chicken, boiled eggs, brown rice, whole lentils & fresh salad.
                </p>
              </div>
            </div>
            <div className="p-5 pt-3 flex items-center justify-between text-xs border-t border-mocha-100 bg-mocha-50/20">
              <span className="font-bold text-mocha-900">From ₹145 <span className="font-normal text-mocha-500">/ meal</span></span>
              <Link to="/providers" className="text-amber-700 font-bold hover:text-amber-800 flex items-center group-hover:translate-x-0.5 transition-transform">
                <span>View Plans</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>
          </div>

          {/* Card 4: Pure Satvik & Jain */}
          <div className="bg-white rounded-3xl border border-mocha-200/90 overflow-hidden shadow-xs hover:shadow-xl hover:border-gold-400 transition-smooth group flex flex-col justify-between">
            <div>
              <div className="h-48 overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=700&q=80"
                  alt="Jain & Pure Satvik Food"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-bold bg-mocha-950/85 text-gold-300 backdrop-blur-xs shadow-xs">
                  No Onion No Garlic
                </span>
              </div>
              <div className="p-5 space-y-2">
                <h3 className="text-base font-serif font-bold text-mocha-950 h-7 flex items-center">
                  Pure Satvik & Jain
                </h3>
                <p className="text-xs text-mocha-600 leading-relaxed min-h-[56px]">
                  Sanctified kitchens with no root vegetables, light on digestion, prepared fresh each morning.
                </p>
              </div>
            </div>
            <div className="p-5 pt-3 flex items-center justify-between text-xs border-t border-mocha-100 bg-mocha-50/20">
              <span className="font-bold text-mocha-900">From ₹90 <span className="font-normal text-mocha-500">/ meal</span></span>
              <Link to="/providers" className="text-amber-700 font-bold hover:text-amber-800 flex items-center group-hover:translate-x-0.5 transition-transform">
                <span>View Plans</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. STEP-BY-STEP WORKFLOW SHOWCASE (How Thalify Works) */}
      <section id="how-it-works" className="bg-white py-20 px-4 sm:px-6 lg:px-8 border-y border-mocha-200/80 scroll-mt-20">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-700">
              Simplicity First
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-extrabold text-mocha-950">
              How Thalify Works
            </h2>
            <p className="text-xs sm:text-sm text-mocha-600">
              Designed to solve the daily headache of meal planning, billing disputes, and wasted food
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="p-6 rounded-3xl bg-canvas-subtle/80 border border-mocha-200/80 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white font-serif font-extrabold text-xl flex items-center justify-center shadow-md">
                1
              </div>
              <h3 className="text-lg font-serif font-bold text-mocha-950">
                Choose Your Mess
              </h3>
              <p className="text-xs text-mocha-600 leading-relaxed">
                Filter verified home kitchens by your neighborhood and dietary preferences (Veg, Non-Veg, Satvik).
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-3xl bg-canvas-subtle/80 border border-mocha-200/80 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-gold-600 text-white font-serif font-extrabold text-xl flex items-center justify-center shadow-md">
                2
              </div>
              <h3 className="text-lg font-serif font-bold text-mocha-950">
                Set Your Plan
              </h3>
              <p className="text-xs text-mocha-600 leading-relaxed">
                Pick 7, 15, or 30 days. Your calendar materializes concrete meal instances across a rolling 7-day horizon.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-3xl bg-canvas-subtle/80 border border-mocha-200/80 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-700 text-white font-serif font-extrabold text-xl flex items-center justify-center shadow-md">
                3
              </div>
              <h3 className="text-lg font-serif font-bold text-mocha-950">
                Skip Before 5:00 PM
              </h3>
              <p className="text-xs text-mocha-600 leading-relaxed">
                Eating out? Toggle skip on your calendar before 5:00 PM (or 9:30 AM for lunch). The kitchen's headcount drops, and your bill credits every rupee.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-3xl bg-canvas-subtle/80 border border-mocha-200/80 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white font-serif font-extrabold text-xl flex items-center justify-center shadow-md">
                4
              </div>
              <h3 className="text-lg font-serif font-bold text-mocha-950">
                Pay After Consumption
              </h3>
              <p className="text-xs text-mocha-600 leading-relaxed">
                End-of-month itemized bill calculated only from delivered meals. Pay seamlessly with Razorpay UPI.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. DEDICATED RESTAURANT & KITCHEN PARTNER ONBOARDING SECTION */}
      <section id="partner-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-mocha-950 via-mocha-900 to-amber-950 text-white p-8 sm:p-12 lg:p-16 border border-gold-500/30 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-8 space-y-6">
              <span className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-gold-500/20 text-gold-300 border border-gold-500/40 text-xs font-semibold">
                <Store className="w-4 h-4 text-gold-400" />
                <span>For Cloud Kitchens, PG Messes & Home Chefs</span>
              </span>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-extrabold tracking-tight">
                Grow Your Daily Tiffin Business With Zero Commissions.
              </h2>

              <p className="text-mocha-200 text-xs sm:text-sm leading-relaxed max-w-2xl">
                Tired of losing 30% commission to food delivery apps? Thalify gives you a complete operating system built specifically for daily subscribers: automated headcounts before grocery shopping, zero-dispute billing, and delivery dispatch.
              </p>

              {/* Partner Benefits Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs text-mocha-200">
                <div className="flex items-start space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Zero Food Waste:</strong> Know tomorrow's exact headcount frozen at your cutoff time.</span>
                </div>
                <div className="flex items-start space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Automatic Collections:</strong> Customers pay through online UPI or verified Cash records.</span>
                </div>
                <div className="flex items-start space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Route Dispatch Board:</strong> Assign deliveries to your staff by sector in 1-click.</span>
                </div>
                <div className="flex items-start space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Menu & Plan Control:</strong> Set weekly rotating menus and custom cutoff deadlines.</span>
                </div>
              </div>

              {/* Partner Actions */}
              <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
                <Link
                  to="/register?role=provider"
                  className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white font-bold text-sm rounded-2xl shadow-xl transition-smooth flex items-center justify-center space-x-2 hover:scale-[1.02]"
                >
                  <ChefHat className="w-4 h-4" />
                  <span>Register Your Kitchen (2 Min Setup)</span>
                </Link>

                <Link
                  to="/login"
                  className="text-xs text-gold-300 hover:text-white underline-offset-4 hover:underline font-medium transition-colors"
                >
                  Already registered? Sign in to Kitchen Portal &rarr;
                </Link>
              </div>
            </div>

            {/* Partner Illustration Iconography */}
            <div className="lg:col-span-4 flex justify-center">
              <div className="p-8 rounded-3xl bg-mocha-900/80 border border-gold-500/20 text-center space-y-4 max-w-xs shadow-2xl">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-amber-600 to-gold-500 flex items-center justify-center text-3xl shadow-lg">
                  🍳
                </div>
                <h3 className="text-xl font-serif font-bold text-white">Join 150+ Kitchens</h3>
                <p className="text-xs text-mocha-300 leading-relaxed">
                  Start taking daily recurring subscribers in Koramangala, HSR, BTM, and Whitefield today.
                </p>
                <div className="pt-2 text-[11px] text-gold-400 font-semibold">
                  Setup in less than 2 minutes
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. ROLE GATEWAY & FINAL CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-mocha-200/80 p-8 sm:p-12 text-center space-y-8 shadow-xs">
          <div className="max-w-xl mx-auto space-y-2">
            <h2 className="text-3xl font-serif font-extrabold text-mocha-950">
              Ready to Upgrade Your Daily Food?
            </h2>
            <p className="text-xs sm:text-sm text-mocha-600">
              Sign up today and experience homestyle cooking with total flexibility
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto text-left">
            {/* Customer Box */}
            <div className="p-6 rounded-3xl bg-canvas-subtle/80 border border-mocha-200/90 flex flex-col justify-between h-full shadow-xs">
              <div>
                <span className="text-2xl">👤</span>
                <h3 className="text-base font-serif font-bold text-mocha-950 mt-2 h-7 flex items-center">
                  I am a Customer
                </h3>
                <p className="text-xs text-mocha-600 leading-relaxed h-12 overflow-hidden">
                  Subscribe to healthy daily meals, skip anytime before cutoff with 1-click credits.
                </p>
              </div>
              <div className="space-y-2 pt-4 border-t border-mocha-200/80 mt-4 text-center">
                <Link
                  to="/register?role=customer"
                  className="block w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-smooth hover:scale-[1.02]"
                >
                  Join as Customer
                </Link>
                <Link
                  to="/login"
                  className="inline-block text-[11px] text-mocha-600 hover:text-mocha-950 font-medium hover:underline pt-1"
                >
                  Already have an account? Log In
                </Link>
              </div>
            </div>

            {/* Provider Box */}
            <div className="p-6 rounded-3xl bg-gold-50/50 border border-gold-300/80 flex flex-col justify-between h-full shadow-xs">
              <div>
                <span className="text-2xl">🍳</span>
                <h3 className="text-base font-serif font-bold text-mocha-950 mt-2 h-7 flex items-center">
                  I am a Mess Owner
                </h3>
                <p className="text-xs text-mocha-600 leading-relaxed h-12 overflow-hidden">
                  Eliminate food waste with automated headcount freezing & zero-dispute billing.
                </p>
              </div>
              <div className="space-y-2 pt-4 border-t border-gold-300/80 mt-4 text-center">
                <Link
                  to="/register?role=provider"
                  className="block w-full py-2.5 bg-gold-600 hover:bg-gold-700 text-white text-xs font-bold rounded-xl shadow-xs transition-smooth hover:scale-[1.02]"
                >
                  Register Kitchen
                </Link>
                <Link
                  to="/login"
                  className="inline-block text-[11px] text-gold-900 hover:text-mocha-950 font-medium hover:underline pt-1"
                >
                  Kitchen Partner? Log In
                </Link>
              </div>
            </div>

            {/* Delivery Box */}
            <div className="p-6 rounded-3xl bg-canvas-subtle/80 border border-mocha-200/90 flex flex-col justify-between h-full shadow-xs">
              <div>
                <span className="text-2xl">🚴</span>
                <h3 className="text-base font-serif font-bold text-mocha-950 mt-2 h-7 flex items-center">
                  Delivery Partner
                </h3>
                <p className="text-xs text-mocha-600 leading-relaxed h-12 overflow-hidden">
                  View today's assigned drop checklist and mark doorstep deliveries in real-time.
                </p>
              </div>
              <div className="space-y-2 pt-4 border-t border-mocha-200/80 mt-4 text-center">
                <Link
                  to="/login"
                  className="block w-full py-2.5 bg-mocha-900 hover:bg-mocha-950 text-white text-xs font-bold rounded-xl shadow-xs transition-smooth hover:scale-[1.02]"
                >
                  Rider Sign In
                </Link>
                <span className="inline-block text-[10px] text-mocha-400 font-medium pt-1">
                  Accounts provisioned by kitchen owner
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
