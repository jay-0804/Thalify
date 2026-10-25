import React, { useState, useEffect } from 'react';
import api from '../../api/axios.js';
import { Loader } from '../../components/Loader.jsx';
import { ErrorBanner } from '../../components/ErrorBanner.jsx';
import { Modal } from '../../components/Modal.jsx';
import {
  Receipt,
  Calendar,
  CreditCard,
  PlusCircle,
  TrendingDown,
  CheckCircle,
  AlertCircle,
  ArrowUpRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const Billing = () => {
  const currentYearMonth = new Date().toISOString().slice(0, 7);
  const [month, setMonth] = useState(currentYearMonth);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Record Payment Modal State
  const [selectedSub, setSelectedSub] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('upi');
  const [payNote, setPayNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchBillingOverview = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/provider/billing?month=${month}`);
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch billing overview');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBillingOverview();
  }, [month]);

  const handleOpenPayment = (sub) => {
    setSelectedSub(sub);
    setPayAmount(sub.balance); // default to full outstanding balance
    setPayNote('');
    setIsModalOpen(true);
  };

  const handleRecordPaymentSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSub) return;

    const amountNum = Number(payAmount);
    if (amountNum > selectedSub.balance) {
      toast.error(`Cannot record ₹${amountNum}. Exceeds balance of ₹${selectedSub.balance}`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/provider/billing/payments', {
        subscriptionId: selectedSub.subscriptionId,
        month,
        amount: amountNum,
        method: payMethod,
        note: payNote,
      });

      if (res.success) {
        toast.success(`Payment of ₹${amountNum} recorded successfully!`);
        setIsModalOpen(false);
        fetchBillingOverview();
      }
    } catch (err) {
      toast.error(err.message || 'Payment recording failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader message="Aggregating provider financial ledgers..." />;
  if (error) return <ErrorBanner message={error} onRetry={fetchBillingOverview} />;
  if (!data) return null;

  const { summary, subscribers } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header & Month Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-extrabold text-mocha-950 flex items-center space-x-2">
            <Receipt className="w-8 h-8 text-amber-600" />
            <span>Monthly Billing & Collections Ledger</span>
          </h1>
          <p className="text-sm text-mocha-600 mt-1">
            Pay-after-consumption model. All numbers are computed strictly from verified delivered meals.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-xl border border-mocha-200 shadow-xs self-start sm:self-auto">
          <Calendar className="w-4 h-4 text-amber-600" />
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="text-xs font-bold text-mocha-900 border-none focus:outline-hidden bg-transparent"
          />
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-mocha-200 shadow-xs">
          <p className="text-xs font-semibold text-mocha-500 uppercase tracking-wider">Subscribers</p>
          <p className="text-3xl font-serif font-black text-mocha-950 mt-1">{summary.totalSubscribers}</p>
          <p className="text-[11px] text-mocha-500 mt-1">Active customer contracts</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-mocha-200 shadow-xs">
          <p className="text-xs font-semibold text-mocha-500 uppercase tracking-wider">Revenue Charged</p>
          <p className="text-3xl font-serif font-black text-mocha-950 mt-1">₹{summary.totalCharged}</p>
          <p className="text-[11px] text-mocha-500 mt-1">Delivered meals billable</p>
        </div>

        <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-xs">
          <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Payments Collected</p>
          <p className="text-3xl font-serif font-black text-emerald-950 mt-1">₹{summary.totalPaid}</p>
          <p className="text-[11px] text-emerald-700 mt-1">Recorded via UPI / Cash</p>
        </div>

        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-300 shadow-xs">
          <p className="text-xs font-bold text-amber-900 uppercase tracking-wider">Net Outstanding Due</p>
          <p className="text-3xl font-serif font-black text-amber-950 mt-1">₹{summary.totalBalance}</p>
          <p className="text-[11px] text-amber-800 mt-1">Collect from customers</p>
        </div>
      </div>

      {/* Subscriber Billing Table */}
      <div className="bg-white rounded-3xl border border-mocha-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-mocha-100 flex items-center justify-between">
          <h2 className="text-lg font-serif font-bold text-mocha-950">
            Subscriber Ledger for {month}
          </h2>
          <span className="text-xs text-mocha-500">
            Click 'Record Payment' to credit an incoming customer UPI transfer
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-canvas-subtle text-mocha-900 font-semibold border-b border-mocha-200">
              <tr>
                <th className="py-3.5 px-6">Customer & Phone</th>
                <th className="py-3.5 px-6">Plan</th>
                <th className="py-3.5 px-6">Delivered & Billed</th>
                <th className="py-3.5 px-6">Credits (Skips)</th>
                <th className="py-3.5 px-6">Paid</th>
                <th className="py-3.5 px-6">Balance Due</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-mocha-100">
              {subscribers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-mocha-500">
                    No active subscriptions found for {month}.
                  </td>
                </tr>
              ) : (
                subscribers.map((row) => (
                  <tr key={row.subscriptionId} className="hover:bg-mocha-50/40">
                    <td className="py-3.5 px-6">
                      <p className="font-bold text-mocha-950">{row.customer?.name}</p>
                      <p className="text-mocha-500 text-[11px]">{row.customer?.phone} • {row.customer?.email}</p>
                    </td>
                    <td className="py-3.5 px-6">
                      <p className="font-semibold text-mocha-900">{row.plan?.name}</p>
                      <p className="text-mocha-500 text-[11px]">₹{row.plan?.pricePerMeal} / meal</p>
                    </td>
                    <td className="py-3.5 px-6 font-bold text-mocha-950">
                      ₹{row.charged}
                    </td>
                    <td className="py-3.5 px-6 text-emerald-700 font-semibold">
                      ₹{row.credits}
                    </td>
                    <td className="py-3.5 px-6 text-gold-800 font-semibold">
                      ₹{row.paid}
                    </td>
                    <td className="py-3.5 px-6">
                      {row.balance > 0 ? (
                        <span className="font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
                          ₹{row.balance} Due
                        </span>
                      ) : (
                        <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200 flex items-center w-max">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Settled
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      {row.balance > 0 ? (
                        <button
                          onClick={() => handleOpenPayment(row)}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow-xs transition-smooth"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Record Payment</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-mocha-400 italic">No balance</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Subscriber Payment"
      >
        <form onSubmit={handleRecordPaymentSubmit} className="space-y-4 text-xs sm:text-sm">
          <div className="p-3 bg-canvas-subtle rounded-xl border border-mocha-200">
            <p className="font-bold text-mocha-950">{selectedSub?.customer?.name}</p>
            <p className="text-xs text-mocha-600">
              Outstanding Balance: <strong className="text-amber-800">₹{selectedSub?.balance}</strong>
            </p>
          </div>

          <div>
            <label className="block font-semibold text-mocha-800 mb-1">
              Payment Amount (₹):
            </label>
            <input
              type="number"
              required
              min={1}
              max={selectedSub?.balance || 1}
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              className="w-full px-3 py-2 border border-mocha-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
            />
            <p className="text-[11px] text-mocha-500 mt-1">
              *Server prevents overpayment: cannot exceed ₹{selectedSub?.balance}
            </p>
          </div>

          <div>
            <label className="block font-semibold text-mocha-800 mb-1">Payment Method:</label>
            <select
              value={payMethod}
              onChange={(e) => setPayMethod(e.target.value)}
              className="w-full px-3 py-2 border border-mocha-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
            >
              <option value="upi">UPI (GPay / PhonePe / Paytm)</option>
              <option value="cash">Cash on Hand</option>
              <option value="other">Bank Transfer / Other</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-mocha-800 mb-1">Note / Reference (Optional):</label>
            <input
              type="text"
              value={payNote}
              onChange={(e) => setPayNote(e.target.value)}
              placeholder="e.g. UPI Ref #402919..."
              className="w-full px-3 py-2 border border-mocha-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
            />
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-mocha-300 rounded-xl text-mocha-700 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-xs"
            >
              {submitting ? 'Recording...' : 'Record Payment in Ledger'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Billing;
