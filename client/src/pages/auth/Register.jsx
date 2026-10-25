import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { Lock, Mail, User, Phone, Store, MapPin, Clock, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Parse query param e.g. /register?role=provider
  const queryParams = new URLSearchParams(location.search);
  const initialRole = queryParams.get('role') === 'provider' ? 'provider' : 'customer';

  const [role, setRole] = useState(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  // Restaurant Partner Specific Fields
  const [businessName, setBusinessName] = useState('');
  const [cuisineType, setCuisineType] = useState('North Indian Homestyle');
  const [cutoffTime, setCutoffTime] = useState('20:00');
  const [deliveryAreasStr, setDeliveryAreasStr] = useState('Koramangala, HSR Layout, BTM Layout');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (queryParams.get('role') === 'provider') {
      setRole('provider');
    }
  }, [location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      name,
      email,
      password,
      phone,
      role,
    };

    if (role === 'provider') {
      const areas = deliveryAreasStr
        .split(',')
        .map((a) => a.trim())
        .filter(Boolean);

      payload.businessName = businessName;
      payload.deliveryAreas = areas;
      payload.description = `${cuisineType ? `[${cuisineType}] ` : ''}${description}`;
      payload.cutoffTime = cutoffTime;
    }

    try {
      const user = await register(payload);
      if (user.role === 'provider') navigate('/provider');
      else navigate('/providers');
    } catch (err) {
      // toast shown in context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-mocha-200/80 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-amber-600 to-amber-700 text-white flex items-center justify-center text-3xl shadow-md">
            🍱
          </div>
          <h2 className="text-3xl font-serif font-extrabold text-mocha-950">
            {role === 'provider' ? 'Partner As a Kitchen / Mess' : 'Join Thalify'}
          </h2>
          <p className="text-xs text-mocha-600">
            {role === 'provider'
              ? 'Onboard your home kitchen to start receiving daily meal subscribers'
              : 'Your daily meals, on your terms. Browse neighborhood home kitchens & start your subscription.'}
          </p>
        </div>

        {/* Role Switcher Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-canvas-subtle rounded-2xl border border-mocha-200">
          <button
            type="button"
            onClick={() => setRole('customer')}
            className={`py-2.5 text-xs font-bold rounded-xl transition-smooth flex items-center justify-center space-x-1.5 ${
              role === 'customer'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-mocha-700 hover:text-mocha-950'
            }`}
          >
            <span>👤 Customer / Student</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('provider')}
            className={`py-2.5 text-xs font-bold rounded-xl transition-smooth flex items-center justify-center space-x-1.5 ${
              role === 'provider'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-mocha-700 hover:text-mocha-950'
            }`}
          >
            <span>🍳 Kitchen / Mess Owner</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Personal Account Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-mocha-800 mb-1">
                {role === 'provider' ? 'Owner / Chef Name' : 'Full Name'}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-mocha-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Sunita Sharma"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-mocha-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-mocha-800 mb-1">
                Contact Phone (10 digits)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-mocha-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  required
                  pattern="[0-9]{10}"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-mocha-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-mocha-800 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-mocha-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="kitchen@example.com"
                className="w-full pl-9 pr-3 py-2 text-xs border border-mocha-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-mocha-800 mb-1">Password (min 8 chars)</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-mocha-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-xs border border-mocha-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Restaurant Partner Details Section */}
          {role === 'provider' && (
            <div className="p-4 bg-canvas-subtle/80 rounded-2xl border border-mocha-200/80 space-y-4">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-900 border-b border-mocha-200 pb-2">
                <Store className="w-4 h-4 text-amber-600" />
                <span>Restaurant / Kitchen Profile Details</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-mocha-800 mb-1">
                  Kitchen / Mess Name
                </label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Maa Ki Rasoi / Bangalore Homely Tiffins"
                  className="w-full px-3 py-2 text-xs border border-mocha-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-mocha-800 mb-1">
                    Cuisine Specialization
                  </label>
                  <select
                    value={cuisineType}
                    onChange={(e) => setCuisineType(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-mocha-300 rounded-xl bg-white"
                  >
                    <option value="North Indian Homestyle">North Indian Homestyle</option>
                    <option value="South Indian Traditional">South Indian Traditional</option>
                    <option value="Pure Satvik / Jain">Pure Satvik / Jain</option>
                    <option value="Fitness & High Protein">Fitness & High Protein</option>
                    <option value="Bengali / Eastern Homestyle">Bengali Homestyle</option>
                    <option value="Student Budget Express">Student Budget Express</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-mocha-800 mb-1">
                    Previous-Day Skip Cutoff (IST)
                  </label>
                  <select
                    value={cutoffTime}
                    onChange={(e) => setCutoffTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-mocha-300 rounded-xl bg-white"
                  >
                    <option value="19:00">19:00 (7:00 PM IST)</option>
                    <option value="19:30">19:30 (7:30 PM IST)</option>
                    <option value="20:00">20:00 (8:00 PM IST) [Recommended]</option>
                    <option value="20:30">20:30 (8:30 PM IST)</option>
                    <option value="21:00">21:00 (9:00 PM IST)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-mocha-800 mb-1">
                  Delivery Service Neighborhoods (Comma-separated)
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-mocha-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={deliveryAreasStr}
                    onChange={(e) => setDeliveryAreasStr(e.target.value)}
                    placeholder="e.g. Koramangala, HSR Layout, BTM Layout"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-mocha-300 rounded-xl bg-white"
                  />
                </div>
                <p className="text-[11px] text-mocha-500 mt-1">
                  Only customers with addresses in these areas will be able to subscribe.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-mocha-800 mb-1">
                  Kitchen Bio & Specialties
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Cooked with cold-pressed oils, fresh desi ghee rotis daily, and no artificial colors or preservatives."
                  className="w-full px-3 py-2 text-xs border border-mocha-300 rounded-xl bg-white"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition-smooth flex items-center justify-center space-x-1.5"
          >
            <span>
              {loading
                ? 'Creating Account...'
                : role === 'provider'
                ? 'Complete Kitchen Partner Onboarding'
                : 'Complete Customer Sign Up'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-mocha-600">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-amber-700 hover:underline">
            Log in directly
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
