import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  UtensilsCrossed,
  LogOut,
  User,
  Calendar,
  Receipt,
  ChefHat,
  Truck,
  Layers,
  Settings,
  Flame,
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkStyle = ({ isActive }) =>
    `inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-smooth ${
      isActive
        ? 'bg-amber-100/70 text-amber-800 font-semibold border border-amber-300/60 shadow-xs'
        : 'text-mocha-700 hover:text-mocha-950 hover:bg-mocha-100/60'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-canvas/90 backdrop-blur-md border-b border-mocha-200/70 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-amber-700 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-smooth">
              <span className="text-xl">🍱</span>
            </div>
            <div>
              <span className="text-xl font-serif font-extrabold tracking-tight text-mocha-950">
                Thali<span className="text-amber-600">fy</span>
              </span>
              <span className="hidden sm:block text-[10px] tracking-wide font-medium text-gold-700">
                Your daily meals, on your terms.
              </span>
            </div>
          </Link>

          {/* Navigation Links according to user role */}
          <nav className="hidden md:flex items-center space-x-1">
            {isAuthenticated ? (
              <>
                {user.role === 'customer' && (
                  <>
                    <NavLink to="/providers" className={navLinkStyle}>
                      <UtensilsCrossed className="w-4 h-4 mr-1.5 text-amber-600" />
                      Browse Messes
                    </NavLink>
                    <NavLink to="/my-subscriptions" className={navLinkStyle}>
                      <Calendar className="w-4 h-4 mr-1.5 text-gold-600" />
                      My Subscriptions
                    </NavLink>
                  </>
                )}

                {user.role === 'provider' && (
                  <>
                    <NavLink to="/provider" end className={navLinkStyle}>
                      <ChefHat className="w-4 h-4 mr-1.5 text-amber-600" />
                      Dashboard
                    </NavLink>
                    <NavLink to="/provider/prep" className={navLinkStyle}>
                      <Flame className="w-4 h-4 mr-1.5 text-amber-600" />
                      Kitchen Prep
                    </NavLink>
                    <NavLink to="/provider/delivery" className={navLinkStyle}>
                      <Truck className="w-4 h-4 mr-1.5 text-gold-600" />
                      Delivery Board
                    </NavLink>
                    <NavLink to="/provider/billing" className={navLinkStyle}>
                      <Receipt className="w-4 h-4 mr-1.5 text-gold-600" />
                      Billing
                    </NavLink>
                    <NavLink to="/provider/menu" className={navLinkStyle}>
                      <Layers className="w-4 h-4 mr-1.5 text-mocha-600" />
                      Menu & Plans
                    </NavLink>
                  </>
                )}

                {user.role === 'delivery' && (
                  <NavLink to="/delivery" className={navLinkStyle}>
                    <Truck className="w-4 h-4 mr-1.5 text-amber-600" />
                    Today's Deliveries
                  </NavLink>
                )}
              </>
            ) : (
              <div className="hidden lg:flex items-center space-x-6 text-xs font-medium text-mocha-600">
                <a href="#how-it-works" className="hover:text-mocha-950 transition-colors">How It Works</a>
                <a href="#culinary-variety" className="hover:text-mocha-950 transition-colors">Cuisines</a>
                <a href="#partner-section" className="hover:text-mocha-950 transition-colors">For Kitchens</a>
              </div>
            )}
          </nav>

          {/* User profile & Auth action */}
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-sm font-semibold text-mocha-900 leading-tight">
                    {user.name}
                  </span>
                  <span className="text-[11px] font-medium text-amber-700 capitalize">
                    {user.role} {user.provider?.businessName ? `• ${user.provider.businessName}` : ''}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-2 text-mocha-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-smooth"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2.5">
                <Link
                  to="/register?role=provider"
                  className="hidden sm:inline-flex items-center px-3 py-1.5 text-xs font-semibold text-gold-800 hover:text-gold-900 hover:bg-gold-50/70 rounded-xl transition-smooth"
                >
                  <ChefHat className="w-3.5 h-3.5 mr-1 text-gold-600" />
                  <span>Partner Kitchen</span>
                </Link>
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-semibold text-mocha-700 hover:text-mocha-950 hover:bg-mocha-100/60 rounded-xl transition-smooth"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition-smooth hover:scale-105"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
