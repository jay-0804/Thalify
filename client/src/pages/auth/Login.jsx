import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { Lock, Mail, ArrowRight, ShieldCheck, UserCheck, ChefHat, Bike } from 'lucide-react';

export const Login = () => {
  const { login, quickLoginAs } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === 'customer') navigate('/providers');
      else if (user.role === 'provider') navigate('/provider');
      else if (user.role === 'delivery') navigate('/delivery');
    } catch (err) {
      // toast shown in context
    } finally {
      setLoading(false);
    }
  };

  const handleQuick = async (role) => {
    setLoading(true);
    try {
      const user = await quickLoginAs(role);
      if (user.role === 'customer') navigate('/providers');
      else if (user.role === 'provider') navigate('/provider');
      else if (user.role === 'delivery') navigate('/delivery');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-mocha-200/80 shadow-lg">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-amber-600 to-amber-700 text-white flex items-center justify-center text-3xl shadow-md">
            🍱
          </div>
          <h2 className="text-3xl font-serif font-extrabold text-mocha-950">
            Welcome Back
          </h2>
          <p className="text-xs text-mocha-600">
            Sign in to manage your tiffin subscription or kitchen prep
          </p>
        </div>

        {/* Quick Demo Logins for Evaluators */}
        <div className="p-4 bg-canvas-subtle/80 rounded-2xl border border-mocha-200/80 space-y-2">
          <p className="text-xs font-bold text-mocha-900 flex items-center">
            <ShieldCheck className="w-4 h-4 mr-1 text-gold-600" />
            Evaluator 1-Click Demo Logins:
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuick('customer')}
              className="py-1.5 px-2 bg-white hover:bg-gold-50 border border-mocha-200 rounded-lg text-[11px] font-bold text-mocha-900 shadow-2xs transition-smooth"
            >
              👤 Customer
            </button>
            <button
              type="button"
              onClick={() => handleQuick('provider')}
              className="py-1.5 px-2 bg-white hover:bg-gold-50 border border-mocha-200 rounded-lg text-[11px] font-bold text-mocha-900 shadow-2xs transition-smooth"
            >
              🍳 Provider
            </button>
            <button
              type="button"
              onClick={() => handleQuick('delivery')}
              className="py-1.5 px-2 bg-white hover:bg-gold-50 border border-mocha-200 rounded-lg text-[11px] font-bold text-mocha-900 shadow-2xs transition-smooth"
            >
              🚴 Delivery
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-mocha-800 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-mocha-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="customer@demo.com"
                className="w-full pl-9 pr-3 py-2 text-xs border border-mocha-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-mocha-800 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-mocha-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Demo@1234"
                className="w-full pl-9 pr-3 py-2 text-xs border border-mocha-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-smooth flex items-center justify-center space-x-1.5"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-mocha-600">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-bold text-amber-700 hover:underline">
            Register as Customer or Mess Provider
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
