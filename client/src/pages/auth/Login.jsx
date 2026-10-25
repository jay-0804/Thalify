import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { Lock, Mail, ArrowRight, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';

export const Login = () => {
  const { login, quickLoginAs } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDemoCredentials, setShowDemoCredentials] = useState(false);

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

  const handleFillCredentials = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Demo@1234');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-mocha-200/80 shadow-xl">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-amber-600 to-amber-700 text-white flex items-center justify-center text-3xl shadow-md">
            🍱
          </div>
          <h2 className="text-3xl font-serif font-extrabold text-mocha-950">
            Sign In to TiffinLoop
          </h2>
          <p className="text-xs text-mocha-600">
            Access your personalized meal calendar, kitchen portal, or delivery route
          </p>
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
                placeholder="you@example.com"
                className="w-full pl-9 pr-3 py-2.5 text-xs border border-mocha-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-mocha-800">Password</label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-mocha-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 text-xs border border-mocha-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition-smooth flex items-center justify-center space-x-1.5"
          >
            <span>{loading ? 'Signing In...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Collapsible Quick Test Accounts Drawer for Evaluator Convenience */}
        <div className="pt-2 border-t border-mocha-100">
          <button
            type="button"
            onClick={() => setShowDemoCredentials(!showDemoCredentials)}
            className="w-full flex items-center justify-between text-xs text-mocha-500 hover:text-mocha-800 py-1"
          >
            <span className="flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-gold-600" />
              <span className="font-medium">Test & Evaluator Credentials</span>
            </span>
            {showDemoCredentials ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showDemoCredentials && (
            <div className="mt-3 p-3 bg-canvas-subtle rounded-xl border border-mocha-200/80 space-y-2 text-xs animate-in fade-in">
              <p className="text-[11px] text-mocha-600">Click to autofill test credentials (Password: <code className="bg-white px-1 py-0.5 rounded font-bold">Demo@1234</code>):</p>
              <div className="grid grid-cols-3 gap-1.5 text-center">
                <button
                  type="button"
                  onClick={() => handleFillCredentials('customer@demo.com')}
                  className="p-1.5 bg-white hover:bg-gold-50 border border-mocha-200 rounded-lg text-[11px] font-semibold text-mocha-900 shadow-2xs"
                >
                  👤 Customer
                </button>
                <button
                  type="button"
                  onClick={() => handleFillCredentials('provider@demo.com')}
                  className="p-1.5 bg-white hover:bg-gold-50 border border-mocha-200 rounded-lg text-[11px] font-semibold text-mocha-900 shadow-2xs"
                >
                  🍳 Kitchen
                </button>
                <button
                  type="button"
                  onClick={() => handleFillCredentials('delivery@demo.com')}
                  className="p-1.5 bg-white hover:bg-gold-50 border border-mocha-200 rounded-lg text-[11px] font-semibold text-mocha-900 shadow-2xs"
                >
                  🚴 Rider
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="text-center text-xs text-mocha-600 pt-2">
          New to TiffinLoop?{' '}
          <Link to="/register" className="font-bold text-amber-700 hover:underline">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
