import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext.jsx';
import { SocketProvider } from './context/SocketContext.jsx';

import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

// Auth Pages
import Login from './pages/auth/Login.jsx';
import Register from './pages/auth/Register.jsx';

// Customer Pages
import Providers from './pages/customer/Providers.jsx';
import ProviderDetail from './pages/customer/ProviderDetail.jsx';
import MySubscriptions from './pages/customer/MySubscriptions.jsx';
import SubscriptionDetail from './pages/customer/SubscriptionDetail.jsx';
import Bill from './pages/customer/Bill.jsx';

// Provider Pages
import Dashboard from './pages/provider/Dashboard.jsx';
import Prep from './pages/provider/Prep.jsx';
import Delivery from './pages/provider/Delivery.jsx';
import Billing from './pages/provider/Billing.jsx';
import Menu from './pages/provider/Menu.jsx';

// Delivery Staff Pages
import TodayDrops from './pages/delivery/TodayDrops.jsx';

export const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <div className="min-h-screen flex flex-col bg-canvas text-mocha-950 font-sans selection:bg-amber-100 selection:text-amber-800">
            {/* Professional Navigation Header with Role Badge */}
            <Navbar />

            {/* Main Application Content */}
            <main className="flex-1">
              <Routes>
                {/* Public & Auth Routes */}
                <Route path="/" element={<Navigate to="/providers" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/providers" element={<Providers />} />
                <Route path="/providers/:id" element={<ProviderDetail />} />

                {/* Customer Protected Routes */}
                <Route element={<ProtectedRoute allowedRoles={['customer']} />}>
                  <Route path="/my-subscriptions" element={<MySubscriptions />} />
                  <Route path="/subscriptions/:id" element={<SubscriptionDetail />} />
                </Route>

                {/* Common Protected: Bill View accessible by customer or provider */}
                <Route element={<ProtectedRoute allowedRoles={['customer', 'provider']} />}>
                  <Route path="/billing/:subscriptionId" element={<Bill />} />
                </Route>

                {/* Provider Protected Routes */}
                <Route element={<ProtectedRoute allowedRoles={['provider']} />}>
                  <Route path="/provider" element={<Dashboard />} />
                  <Route path="/provider/prep" element={<Prep />} />
                  <Route path="/provider/delivery" element={<Delivery />} />
                  <Route path="/provider/billing" element={<Billing />} />
                  <Route path="/provider/menu" element={<Menu />} />
                </Route>

                {/* Delivery Staff Protected Routes */}
                <Route element={<ProtectedRoute allowedRoles={['delivery']} />}>
                  <Route path="/delivery" element={<TodayDrops />} />
                </Route>

                {/* Catch-all redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            {/* Premium Culinary Footer */}
            <footer className="bg-mocha-950 text-mocha-200 border-t border-mocha-800 py-10 px-4 sm:px-6 lg:px-8 mt-16 print:hidden">
              <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-xs">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🍱</span>
                  <div>
                    <span className="text-lg font-serif font-bold text-white tracking-tight">
                      Tiffin<span className="text-amber-500">Loop</span>
                    </span>
                    <p className="text-mocha-400 text-[11px]">
                      Mess & Daily Tiffin Subscription Manager • Cutoff-Enforced Daily Meals
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-6 text-mocha-400">
                  <span>Server-Enforced Skip Cutoffs</span>
                  <span>•</span>
                  <span>Zero Food Waste Headcount</span>
                  <span>•</span>
                  <span>Derived Billing Ledger</span>
                </div>

                <div className="text-mocha-400 text-right">
                  <p>© {new Date().getFullYear()} TiffinLoop. All rights reserved.</p>
                </div>
              </div>
            </footer>

            {/* Toast System with warm palette accents */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#2E1C13',
                  color: '#FAF6F2',
                  border: '1px solid #C5A059',
                  borderRadius: '16px',
                  fontSize: '13px',
                },
                success: {
                  iconTheme: {
                    primary: '#C5A059',
                    secondary: '#1F140E',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#EE8843',
                    secondary: '#1F140E',
                  },
                },
              }}
            />
          </div>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
