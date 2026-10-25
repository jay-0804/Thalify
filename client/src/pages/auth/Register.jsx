import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { Lock, Mail, User, Phone, Store, MapPin, ArrowRight } from 'lucide-react';

export const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('customer'); // 'customer' or 'provider' (delivery accounts created by provider)
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [deliveryAreasStr, setDeliveryAreasStr] = useState('Koramangala, HSR Layout, BTM');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

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
      payload.description = description;
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
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-mocha-200/80 shadow-lg">
        <div className="text-center space-y-1">
          <h2 className="text-3xl font-serif font-extrabold text-mocha-950">
            Create an Account
          </h2>
          <p className="text-xs text-mocha-600">
            Join TiffinLoop to subscribe to daily meals or run your kitchen
          </p>
        </div>

        {/* Role Switcher */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-canvas-subtle rounded-2xl border border-mocha-200">
          <button
            type="button"
            onClick={() => setRole('customer')}
            className={`py-2 text-xs font-bold rounded-xl transition-smooth ${
              role === 'customer'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-mocha-700 hover:text-mocha-950'
            }`}
          >
            👤 I am a Customer / PG Student
          </button>
          <button
            type="button"
            onClick={() => setRole('provider')}
            className={`py-2 text-xs font-bold rounded-xl transition-smooth ${
              role === 'provider'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-mocha-700 hover:text-mocha-950'
            }`}
          >
            🍳 I am a Home Kitchen / Mess
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-mocha-800 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-mocha-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Rohan Sharma"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-mocha-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-mocha-800 mb-1">Phone Number (10 digits)</label>
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
                placeholder="rohan@example.com"
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

          {/* Provider Extra Fields */}
          {role === 'provider' && (
            <div className="pt-2 border-t border-mocha-200 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-mocha-800 mb-1">Kitchen / Business Name</label>
                <div className="relative">
                  <Store className="w-4 h-4 text-mocha-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Maa Ki Rasoi"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-mocha-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-mocha-800 mb-1">
                  Delivery Service Areas (Comma-separated):
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-mocha-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={deliveryAreasStr}
                    onChange={(e) => setDeliveryAreasStr(e.target.value)}
                    placeholder="Koramangala, HSR Layout, BTM"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-mocha-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-mocha-800 mb-1">Short Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Authentic homestyle lunch and dinner cooked fresh daily."
                  className="w-full px-3 py-2 text-xs border border-mocha-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-smooth flex items-center justify-center space-x-1.5"
          >
            <span>{loading ? 'Registering...' : `Complete ${role === 'provider' ? 'Kitchen' : 'Customer'} Sign Up`}</span>
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
