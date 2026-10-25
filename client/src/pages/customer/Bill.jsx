import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios.js';
import { Loader } from '../../components/Loader.jsx';
import { ErrorBanner } from '../../components/ErrorBanner.jsx';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import {
  Receipt,
  Calendar,
  CreditCard,
  Printer,
  ArrowLeft,
  CheckCircle2,
  TrendingDown,
  ShieldCheck,
} from 'lucide-react';

export const Bill = () => {
  const { subscriptionId } = useParams();

  const currentYearMonth = new Date().toISOString().slice(0, 7);
  const [month, setMonth] = useState(currentYearMonth);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBill = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/billing/${subscriptionId}?month=${month}`);
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch bill data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBill();
  }, [subscriptionId, month]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <Loader message="Calculating itemized bill..." />;
  if (error) return <ErrorBanner message={error} onRetry={fetchBill} />;
  if (!data) return null;

  const { subscription, bill } = data;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top back & actions bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <Link
          to={`/subscriptions/${subscription._id}`}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-mocha-700 hover:text-mocha-950 transition-smooth"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Subscription Calendar</span>
        </Link>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-xl border border-mocha-200">
            <Calendar className="w-4 h-4 text-amber-600" />
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="text-xs font-bold text-mocha-900 border-none focus:outline-hidden bg-transparent"
            />
          </div>

          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-smooth"
          >
            <Printer className="w-4 h-4" />
            <span>Print Statement</span>
          </button>
        </div>
      </div>

      {/* Main Invoice Document Container */}
      <div className="bg-white rounded-3xl border border-mocha-200 p-6 sm:p-10 shadow-sm space-y-8 print:border-none print:shadow-none print:p-0">
        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 border-b border-mocha-200 pb-6">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🍱</span>
              <span className="text-2xl font-serif font-extrabold text-mocha-950">
                Tiffin<span className="text-amber-600">Loop</span>
              </span>
            </div>
            <p className="text-xs text-mocha-500 mt-1">Official Mess & Subscription Tax Invoice</p>
            <div className="mt-3 text-xs text-mocha-700 space-y-0.5">
              <p className="font-bold text-mocha-900">Provider: {subscription.providerId?.businessName}</p>
              <p>Contact: {subscription.providerId?.contactPhone || 'N/A'}</p>
            </div>
          </div>

          <div className="sm:text-right space-y-1 text-xs text-mocha-700">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-gold-100 text-gold-900 border border-gold-300">
              Billing Month: {bill.month}
            </span>
            <p className="pt-2 text-mocha-500">Plan: <strong className="text-mocha-900">{subscription.planId?.name}</strong></p>
            <p className="text-mocha-500">Delivery Area: <strong className="text-mocha-900">{subscription.address?.area}</strong></p>
          </div>
        </div>

        {/* Financial Highlights */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-mocha-50/70 border border-mocha-200/60">
            <p className="text-xs font-semibold text-mocha-600">Total Charged</p>
            <p className="text-2xl font-serif font-extrabold text-mocha-950 mt-1">₹{bill.charged}</p>
            <p className="text-[11px] text-mocha-500 mt-0.5">Delivered & billable meals</p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/60">
            <p className="text-xs font-semibold text-emerald-800 flex items-center">
              <TrendingDown className="w-3.5 h-3.5 mr-1" />
              Credits & Savings
            </p>
            <p className="text-2xl font-serif font-extrabold text-emerald-900 mt-1">₹{bill.credits}</p>
            <p className="text-[11px] text-emerald-700 mt-0.5">Saved by skipping/pauses</p>
          </div>

          <div className="p-4 rounded-2xl bg-gold-50/70 border border-gold-200/60">
            <p className="text-xs font-semibold text-gold-800">Amount Paid</p>
            <p className="text-2xl font-serif font-extrabold text-gold-950 mt-1">₹{bill.paid}</p>
            <p className="text-[11px] text-gold-700 mt-0.5">UPI / Cash received</p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-300/80">
            <p className="text-xs font-bold text-amber-900">Net Due / Balance</p>
            <p className="text-2xl font-serif font-extrabold text-amber-950 mt-1">₹{bill.balance}</p>
            <p className="text-[11px] text-amber-800 mt-0.5 font-medium">Pay after consumption</p>
          </div>
        </div>

        {/* Itemized Meal Ledger Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-serif font-bold text-mocha-950 flex items-center space-x-2">
              <Receipt className="w-4 h-4 text-amber-600" />
              <span>Itemized Consumption Ledger ({bill.lineItems.length} Entries)</span>
            </h3>
            <span className="text-[11px] text-mocha-500 italic">
              Computed directly from server MealInstances (Never drifts)
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-mocha-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-canvas-subtle text-mocha-900 font-semibold border-b border-mocha-200">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Meal & Diet</th>
                  <th className="py-3 px-4">Delivery Status</th>
                  <th className="py-3 px-4">Rate</th>
                  <th className="py-3 px-4 text-right">Amount Billed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mocha-100">
                {bill.lineItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-mocha-500">
                      No meal instances for {bill.month}.
                    </td>
                  </tr>
                ) : (
                  bill.lineItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-mocha-50/40">
                      <td className="py-2.5 px-4 font-semibold text-mocha-900">{item.date}</td>
                      <td className="py-2.5 px-4 capitalize text-mocha-700">
                        {item.mealType} ({item.diet})
                      </td>
                      <td className="py-2.5 px-4">
                        <StatusBadge
                          status={item.status}
                          skipReason={item.skipReason}
                          failureReason={item.failureReason}
                        />
                      </td>
                      <td className="py-2.5 px-4 text-mocha-600">₹{item.price}</td>
                      <td className="py-2.5 px-4 text-right font-bold text-mocha-950">
                        {item.isBillable ? `₹${item.itemCharge}` : <span className="text-emerald-700">₹0 (Credited)</span>}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payments Recorded */}
        {bill.payments?.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-mocha-200">
            <h3 className="text-sm font-serif font-bold text-mocha-950 flex items-center space-x-1.5">
              <CreditCard className="w-4 h-4 text-gold-600" />
              <span>Payments Recorded by Provider</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {bill.payments.map((p) => (
                <div key={p._id} className="p-3 bg-canvas-subtle/70 rounded-xl border border-mocha-200/80 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-mocha-900">₹{p.amount} via {p.method?.toUpperCase()}</p>
                    <p className="text-[11px] text-mocha-500">{new Date(p.createdAt).toLocaleDateString()} • {p.note || 'Regular payment'}</p>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Invoice Footer */}
        <div className="pt-6 border-t border-mocha-200 text-center text-xs text-mocha-500">
          <p>TiffinLoop • Mess & Tiffin Subscription Manager • Certified System Generated Bill</p>
        </div>
      </div>
    </div>
  );
};

export default Bill;
