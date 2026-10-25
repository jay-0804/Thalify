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
            Sign In to Thalify
          </h2>
          <p className="text-xs text-mocha-600">
            Your daily meals, on your terms.
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
            <div className="mt-3 p-3.5 bg-canvas-subtle rounded-2xl border border-mocha-200/80 space-y-3 text-xs animate-in fade-in">
              <p className="text-[11px] text-mocha-600">
                Click any account to autofill credentials (Password: <code className="bg-white px-1.5 py-0.5 rounded font-bold border border-mocha-200">Demo@1234</code>):
              </p>

              {/* Standard Roles */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-mocha-500 tracking-wider">Default Roles</span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleFillCredentials('customer@demo.com')}
                    className="p-2 bg-white hover:bg-gold-50/70 border border-mocha-200 rounded-xl text-left text-[11px] font-semibold text-mocha-900 shadow-2xs flex items-center justify-between"
                  >
                    <span>👤 Rohan Sharma (Customer)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFillCredentials('delivery@demo.com')}
                    className="p-2 bg-white hover:bg-gold-50/70 border border-mocha-200 rounded-xl text-left text-[11px] font-semibold text-mocha-900 shadow-2xs flex items-center justify-between"
                  >
                    <span>🚴 Ramesh Kumar (Rider)</span>
                  </button>
                </div>
              </div>

              {/* 8 Kitchen Partner Accounts */}
              <div className="space-y-1 pt-1 border-t border-mocha-200/60">
                <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">
                  Kitchen Partners (8 Neighborhood Messes)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {[
                    { name: 'Maa Ki Rasoi', email: 'provider@demo.com', desc: 'North Indian • Koramangala/HSR' },
                    { name: 'Annapurna Homely Mess', email: 'annapurna@demo.com', desc: 'South Indian • BTM/Jayanagar' },
                    { name: 'Campus Mess Co', email: 'campus@demo.com', desc: 'Student Specials • Whitefield' },
                    { name: 'Shuddh Satvik Rasoi', email: 'satvik@demo.com', desc: 'Jain / Pure Satvik • HSR' },
                    { name: 'NutriFit Clean Fuel', email: 'nutrifit@demo.com', desc: 'High Protein Gym • Koramangala' },
                    { name: "Bramhin's Heritage", email: 'heritage@demo.com', desc: 'Udupi Oota • Jayanagar' },
                    { name: 'Whitefield Chef Table', email: 'whitefieldchef@demo.com', desc: 'Executive Tiffin • Whitefield' },
                    { name: 'Dakshin Daily Meals', email: 'dakshin@demo.com', desc: 'Chettinad & Malabar • Indiranagar' },
                  ].map((k) => (
                    <button
                      key={k.email}
                      type="button"
                      onClick={() => handleFillCredentials(k.email)}
                      className="p-2 bg-white hover:bg-amber-50/80 border border-mocha-200 rounded-xl text-left text-[11px] text-mocha-900 shadow-2xs hover:border-amber-300 transition-colors"
                    >
                      <p className="font-bold flex items-center">
                        <span className="mr-1">🍳</span>
                        <span>{k.name}</span>
                      </p>
                      <p className="text-[10px] text-mocha-500 truncate">{k.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="text-center text-xs text-mocha-600 pt-2">
          New to Thalify?{' '}
          <Link to="/register" className="font-bold text-amber-700 hover:underline">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
