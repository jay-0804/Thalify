import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { Loader } from '../../components/Loader.jsx';
import { ErrorBanner } from '../../components/ErrorBanner.jsx';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import { Modal } from '../../components/Modal.jsx';
import {
  Receipt,
  Calendar,
  CreditCard,
  Printer,
  ArrowLeft,
  CheckCircle2,
  TrendingDown,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const Bill = () => {
  const { subscriptionId } = useParams();
  const { user } = useAuth();

  const currentYearMonth = new Date().toISOString().slice(0, 7);
  const [month, setMonth] = useState(currentYearMonth);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Razorpay Payment States
  const [payingWithRazorpay, setPayingWithRazorpay] = useState(false);
  const [simulatedModalOpen, setSimulatedModalOpen] = useState(false);
  const [simulatedOrderData, setSimulatedOrderData] = useState(null);

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

  // Helper to load Razorpay Checkout script dynamically
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        return resolve(true);
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Trigger Razorpay Payment Flow
  const handleRazorpayPayment = async () => {
    if (!data || data.bill.balance <= 0) return;

    setPayingWithRazorpay(true);
    try {
      const res = await api.post('/billing/razorpay/order', {
        subscriptionId,
        month,
        amount: data.bill.balance,
      });

      if (!res.success) {
        throw new Error(res.error?.message || 'Could not initiate Razorpay order');
      }

      const orderData = res.data;

      // If simulated mode (e.g. no real keys yet in server/.env):
      if (orderData.simulated || !orderData.keyId.startsWith('rzp_')) {
        setSimulatedOrderData(orderData);
        setSimulatedModalOpen(true);
        setPayingWithRazorpay(false);
        return;
      }

      // Real or Test Key flow via Razorpay SDK popup
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        toast.error('Failed to load Razorpay SDK. Check your internet connection.');
        setPayingWithRazorpay(false);
        return;
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: data.subscription.providerId?.businessName || 'TiffinLoop Mess',
        description: `Tiffin Bill for ${month} (${data.subscription.planId?.name})`,
        order_id: orderData.orderId,
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone || '9876543210',
        },
        theme: {
          color: '#C25E00', // Burnt amber brand color
        },
        handler: async function (response) {
          try {
            const verifyRes = await api.post('/billing/razorpay/verify', {
              subscriptionId,
              month,
              amount: data.bill.balance,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              simulated: false,
            });

            if (verifyRes.success) {
              toast.success('🎉 Razorpay Payment Verified! Ledger updated.');
              fetchBill();
            }
          } catch (err) {
            toast.error(err.message || 'Signature verification failed');
          }
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      toast.error(err.message || 'Payment initiation failed');
    } finally {
      setPayingWithRazorpay(false);
    }
  };

  // Complete Simulated Razorpay payment (for dev demo without real keys)
  const handleCompleteSimulated = async () => {
    try {
      const verifyRes = await api.post('/billing/razorpay/verify', {
        subscriptionId,
        month,
        amount: data.bill.balance,
        razorpay_order_id: simulatedOrderData.orderId,
        razorpay_payment_id: `pay_test_${Date.now()}`,
        razorpay_signature: 'simulated_valid_signature',
        simulated: true,
      });

      if (verifyRes.success) {
        toast.success('🎉 Razorpay Payment Completed & Balance Cleared!');
        setSimulatedModalOpen(false);
        fetchBill();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to record simulated payment');
    }
  };

  if (loading) return <Loader message="Calculating itemized bill..." />;
  if (error) return <ErrorBanner message={error} onRetry={fetchBill} />;
  if (!data || !data.bill) return <ErrorBanner message="Bill records not found" onRetry={fetchBill} />;

  const { subscription, bill } = data;
  const isCustomer = user?.role === 'customer';

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
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-mocha-900 hover:bg-mocha-950 text-white text-xs font-bold rounded-xl shadow-xs transition-smooth"
          >
            <Printer className="w-4 h-4 text-gold-400" />
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
                Thali<span className="text-amber-600">fy</span>
              </span>
            </div>
            <p className="text-xs text-mocha-500 mt-1">Official Mess & Subscription Tax Invoice • Your daily meals, on your terms.</p>
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
            <p className="text-[11px] text-gold-700 mt-0.5">UPI / Razorpay received</p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-300/80">
            <p className="text-xs font-bold text-amber-900">Net Due / Balance</p>
            <p className="text-2xl font-serif font-extrabold text-amber-950 mt-1">₹{bill.balance}</p>
            <p className="text-[11px] text-amber-800 mt-0.5 font-medium">Pay after consumption</p>
          </div>
        </div>

        {/* Razorpay Online Payment CTA Banner for Customers */}
        {isCustomer && bill.balance > 0 && (
          <div className="p-5 bg-gradient-to-r from-amber-600 to-amber-700 rounded-2xl text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
            <div className="space-y-1 text-center sm:text-left">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/20 text-white border border-white/30">
                <Zap className="w-3.5 h-3.5 mr-1 text-gold-300" />
                Instant Online Clearance
              </span>
              <h3 className="text-lg font-serif font-bold">
                Clear Outstanding Balance (₹{bill.balance})
              </h3>
              <p className="text-xs text-amber-100">
                Supports UPI (GPay, PhonePe, Paytm), Debit/Credit Cards & Netbanking via Razorpay.
              </p>
            </div>

            <button
              onClick={handleRazorpayPayment}
              disabled={payingWithRazorpay}
              className="px-6 py-3 bg-white hover:bg-gold-50 text-mocha-950 text-xs font-extrabold rounded-xl shadow-lg transition-smooth flex items-center space-x-2 shrink-0"
            >
              <CreditCard className="w-4 h-4 text-amber-700" />
              <span>{payingWithRazorpay ? 'Opening Gateway...' : `Pay ₹${bill.balance} with Razorpay`}</span>
            </button>
          </div>
        )}

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
              <span>Payments Recorded & Verified</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {bill.payments.map((p) => (
                <div key={p._id} className="p-3 bg-canvas-subtle/70 rounded-xl border border-mocha-200/80 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-mocha-900">₹{p.amount} via {p.method?.toUpperCase()}</p>
                    <p className="text-[11px] text-mocha-500">{new Date(p.createdAt).toLocaleDateString()} • {p.note || 'Online payment'}</p>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Invoice Footer */}
        <div className="pt-6 border-t border-mocha-200 text-center text-xs text-mocha-500">
          <p>Thalify • Your daily meals, on your terms. • Certified System Generated Bill</p>
        </div>
      </div>

      {/* Simulated Razorpay Test Checkout Dialog (Used when test keys are pending) */}
      <Modal
        isOpen={simulatedModalOpen}
        onClose={() => setSimulatedModalOpen(false)}
        title="Razorpay Payment Gateway (Test Mode)"
      >
        <div className="space-y-4 text-xs sm:text-sm">
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-mocha-900 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-800 text-xs">GATEWAY: RAZORPAY TEST MODE</span>
              <span className="font-mono text-[11px] text-mocha-500">{simulatedOrderData?.orderId}</span>
            </div>
            <p className="text-xl font-serif font-extrabold text-mocha-950">
              ₹{bill.balance}
            </p>
            <p className="text-xs text-mocha-600 leading-relaxed">
              To wire your live credentials, paste your keys in <code className="bg-white px-1 py-0.5 rounded text-amber-800">server/.env</code>:
              <br />
              <code className="text-[11px] text-mocha-700">RAZORPAY_KEY_ID=rzp_test_...</code>
            </p>
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 text-xs">
            <p className="font-semibold flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-600" />
              Demo Simulation Ready:
            </p>
            <p className="mt-0.5 text-[11px]">
              You can test the entire payment verification flow right now with 1 click.
            </p>
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setSimulatedModalOpen(false)}
              className="px-4 py-2 border border-mocha-300 rounded-xl text-mocha-700 font-semibold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCompleteSimulated}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs"
            >
              Simulate Successful Payment (₹{bill.balance})
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Bill;
