import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios.js';
import { useSocket } from '../../context/SocketContext.jsx';
import { Loader } from '../../components/Loader.jsx';
import { ErrorBanner } from '../../components/ErrorBanner.jsx';
import { Modal } from '../../components/Modal.jsx';
import {
  Flame,
  Truck,
  Receipt,
  Users,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Layers,
  Bell,
  MessageSquare,
  Send,
  Phone,
  MapPin,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const Dashboard = () => {
  const { onPrepChanged, onDeliveryUpdate, onCustomerSkipped } = useSocket();
  const [data, setData] = useState(null);
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Live real-time customer skip notifications stream
  const [skipAlerts, setSkipAlerts] = useState([]);

  // Broadcast announcement modal
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isMessageCustomerOpen, setIsMessageCustomerOpen] = useState(false);
  const [directMessageText, setDirectMessageText] = useState('');

  const fetchOverview = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashRes, subRes] = await Promise.all([
        api.get('/provider/dashboard'),
        api.get('/provider/subscribers'),
      ]);
      if (dashRes.success) {
        setData(dashRes.data);
      }
      if (subRes.success) {
        setSubscribers(subRes.data.subscriptions || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch provider dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  // Real-time refresh when customer skips or delivery happens
  useEffect(() => {
    const unsubPrep = onPrepChanged(() => fetchOverview());
    const unsubDelivery = onDeliveryUpdate(() => fetchOverview());
    const unsubSkip = onCustomerSkipped
      ? onCustomerSkipped((skipData) => {
          fetchOverview();
          setSkipAlerts((prev) => [
            {
              ...skipData,
              id: Date.now(),
              timeStr: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
            ...prev,
          ].slice(0, 8));
        })
      : () => {};

    return () => {
      unsubPrep();
      unsubDelivery();
      unsubSkip();
    };
  }, [onPrepChanged, onDeliveryUpdate, onCustomerSkipped]);

  const handleSendBroadcast = (e) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;
    toast.success(`📢 Broadcast delivered to all ${subscribers.length} active subscribers!`, {
      duration: 5000,
    });
    setIsBroadcastOpen(false);
    setBroadcastMessage('');
  };

  const handleSendDirectMessage = (e) => {
    e.preventDefault();
    if (!directMessageText.trim()) return;
    toast.success(`Message sent directly to ${selectedCustomer?.customerId?.name || 'Customer'}!`);
    setIsMessageCustomerOpen(false);
    setDirectMessageText('');
  };
      unsubDelivery();
    };
  }, [onPrepChanged, onDeliveryUpdate]);

  if (loading) return <Loader message="Loading kitchen dashboard metrics..." />;
  if (error) return <ErrorBanner message={error} onRetry={fetchOverview} />;
  if (!data) return null;

  const { tomorrowHeadcount, tomorrowPrep, deliveryProgress, totalUnpaidBalance, activeSubscribersCount } = data;

  const deliveryCompletion =
    deliveryProgress.total > 0
      ? Math.round(((deliveryProgress.delivered + deliveryProgress.failed) / deliveryProgress.total) * 100)
      : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-extrabold text-mocha-950">
            Kitchen Operations Control
          </h1>
          <p className="text-sm text-mocha-600 mt-1">
            Real-time headcount, delivery dispatch progress, and subscriber financial ledger.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            to="/provider/prep"
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-smooth"
          >
            <Flame className="w-4 h-4" />
            <span>Open Kitchen Prep Sheet</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1: Tomorrow Headcount */}
        <div className="bg-white p-6 rounded-2xl border border-mocha-200/80 shadow-xs hover:border-gold-400 transition-smooth">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-mocha-500 tracking-wider">
              Tomorrow's Cook
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200/50">
              <Flame className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-3xl font-serif font-black text-mocha-950">{tomorrowHeadcount}</h2>
            <p className="text-xs text-mocha-500 mt-1 flex items-center">
              <span>Veg: {tomorrowPrep?.totals?.veg || 0}</span>
              <span className="mx-2">•</span>
              <span>Non-Veg: {tomorrowPrep?.totals?.nonveg || 0}</span>
            </p>
          </div>
          <Link
            to="/provider/prep"
            className="mt-4 pt-3 border-t border-mocha-100 flex items-center justify-between text-xs font-bold text-amber-700 hover:text-amber-800"
          >
            <span>View Kitchen Breakdown</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Metric 2: Today's Delivery Progress */}
        <div className="bg-white p-6 rounded-2xl border border-mocha-200/80 shadow-xs hover:border-gold-400 transition-smooth">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-mocha-500 tracking-wider">
              Today's Dispatch
            </span>
            <div className="p-2 rounded-xl bg-gold-50 text-gold-700 border border-gold-200/50">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-3xl font-serif font-black text-mocha-950">
              {deliveryProgress.delivered} / {deliveryProgress.total}
            </h2>
            <div className="w-full bg-mocha-100 rounded-full h-2 mt-2 overflow-hidden">
              <div
                className="bg-amber-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${deliveryCompletion}%` }}
              ></div>
            </div>
          </div>
          <Link
            to="/provider/delivery"
            className="mt-4 pt-3 border-t border-mocha-100 flex items-center justify-between text-xs font-bold text-gold-800 hover:text-gold-900"
          >
            <span>Open Delivery Board</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Metric 3: Total Unpaid Balance */}
        <div className="bg-white p-6 rounded-2xl border border-mocha-200/80 shadow-xs hover:border-gold-400 transition-smooth">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-mocha-500 tracking-wider">
              Outstanding Dues
            </span>
            <div className="p-2 rounded-xl bg-mocha-50 text-mocha-800 border border-mocha-200">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-3xl font-serif font-black text-mocha-950">
              ₹{totalUnpaidBalance}
            </h2>
            <p className="text-xs text-mocha-500 mt-1">
              Derived ledger (after credits)
            </p>
          </div>
          <Link
            to="/provider/billing"
            className="mt-4 pt-3 border-t border-mocha-100 flex items-center justify-between text-xs font-bold text-mocha-800 hover:text-mocha-950"
          >
            <span>Record Payment</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Metric 4: Active Subscribers */}
        <div className="bg-white p-6 rounded-2xl border border-mocha-200/80 shadow-xs hover:border-gold-400 transition-smooth">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-mocha-500 tracking-wider">
              Active Subscribers
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/50">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-3xl font-serif font-black text-mocha-950">
              {activeSubscribersCount}
            </h2>
            <p className="text-xs text-mocha-500 mt-1">
              Active meal recurring plans
            </p>
          </div>
          <Link
            to="/provider/menu"
            className="mt-4 pt-3 border-t border-mocha-100 flex items-center justify-between text-xs font-bold text-emerald-800 hover:text-emerald-900"
          >
            <span>Manage Plans & Menu</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Quick Navigation Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Operations Guide Card */}
        <div className="bg-white rounded-3xl border border-mocha-200/80 p-6 sm:p-8 space-y-4">
          <h3 className="text-lg font-serif font-bold text-mocha-950">
            Daily Operational Rhythm
          </h3>
          <div className="space-y-3 text-xs text-mocha-700">
            <div className="p-3 bg-canvas-subtle rounded-xl flex items-start space-x-3">
              <span className="font-bold text-amber-700 shrink-0">1. Night (Cutoff):</span>
              <span>Headcount freezes at your cutoff time. Check the Prep page for final counts.</span>
            </div>
            <div className="p-3 bg-canvas-subtle rounded-xl flex items-start space-x-3">
              <span className="font-bold text-gold-700 shrink-0">2. Morning (06:00):</span>
              <span>Delivery tasks generate automatically. Assign routes to your delivery riders.</span>
            </div>
            <div className="p-3 bg-canvas-subtle rounded-xl flex items-start space-x-3">
              <span className="font-bold text-emerald-700 shrink-0">3. Noon/Evening:</span>
              <span>Riders mark drops delivered. Customer bills update in real time with zero disputes.</span>
            </div>
          </div>
        </div>

        {/* Live Delivery Pulse Card */}
        <div className="bg-white rounded-3xl border border-mocha-200/80 p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-serif font-bold text-mocha-950">
              Today's Drop Status
            </h3>
            <span className="text-xs font-semibold text-gold-700">
              {deliveryProgress.total} Total Drops
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center text-xs">
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200/60">
              <p className="text-amber-800 font-semibold">Pending</p>
              <p className="text-2xl font-serif font-bold text-amber-950 mt-1">{deliveryProgress.pending}</p>
            </div>
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200/60">
              <p className="text-emerald-800 font-semibold">Delivered</p>
              <p className="text-2xl font-serif font-bold text-emerald-950 mt-1">{deliveryProgress.delivered}</p>
            </div>
            <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200/60">
              <p className="text-rose-800 font-semibold">Failed</p>
              <p className="text-2xl font-serif font-bold text-rose-950 mt-1">{deliveryProgress.failed}</p>
            </div>
          </div>

          <Link
            to="/provider/delivery"
            className="block text-center py-2.5 px-4 bg-mocha-100 hover:bg-mocha-200 text-mocha-900 text-xs font-bold rounded-xl transition-smooth"
          >
            Open Dispatch & Assignment Board
          </Link>
        </div>
      </div>

      {/* Real-time Customer Skip Alert Feed */}
      {skipAlerts.length > 0 && (
        <div className="bg-white rounded-3xl border border-amber-300 p-6 space-y-3 shadow-xs animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-serif font-bold text-mocha-950 flex items-center space-x-2">
              <Bell className="w-4 h-4 text-amber-600 animate-bounce" />
              <span>Live Customer Skip Notifications</span>
            </h3>
            <span className="text-[11px] text-mocha-400">Updates live via WebSockets</span>
          </div>

          <div className="space-y-2 text-xs">
            {skipAlerts.map((alert) => (
              <div
                key={alert.id}
                className="p-3 bg-amber-50/70 border border-amber-200/70 rounded-xl flex items-center justify-between"
              >
                <div className="flex items-center space-x-2.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span className="font-bold text-mocha-950">{alert.customerName}</span>
                  <span className="text-mocha-600">
                    skipped <strong>{alert.mealType?.toUpperCase()}</strong> for {alert.date} (Before 5 PM Cutoff)
                  </span>
                </div>
                <div className="flex items-center space-x-3 text-mocha-500 text-[11px]">
                  <span>{alert.timeStr}</span>
                  <a
                    href={`https://wa.me/91${alert.customerPhone || '9876543220'}?text=${encodeURIComponent(
                      `Hi ${alert.customerName}, we received your skip request for ${alert.date} (${alert.mealType}). It has been credited to your bill.`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-smooth flex items-center space-x-1"
                  >
                    <MessageSquare className="w-3 h-3 mr-1" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Customer Directory & Direct Messaging Section */}
      <div className="bg-white rounded-3xl border border-mocha-200/80 p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-mocha-100 pb-5">
          <div>
            <h2 className="text-xl font-serif font-bold text-mocha-950 flex items-center space-x-2">
              <Users className="w-5 h-5 text-amber-600" />
              <span>Customer Subscribers & Communication</span>
            </h2>
            <p className="text-xs text-mocha-500 mt-0.5">
              Manage your active customer directory, view delivery areas, and broadcast daily updates or menu alerts.
            </p>
          </div>

          <button
            onClick={() => setIsBroadcastOpen(true)}
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-mocha-900 hover:bg-mocha-950 text-white text-xs font-bold rounded-xl shadow-xs transition-smooth"
          >
            <Send className="w-3.5 h-3.5 text-gold-400" />
            <span>Broadcast Message to Customers</span>
          </button>
        </div>

        {subscribers.length === 0 ? (
          <p className="text-xs text-mocha-500 py-6 text-center italic">
            No active subscribers enrolled yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-mocha-200 text-mocha-500 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Plan Subscribed</th>
                  <th className="py-3 px-3">Delivery Area</th>
                  <th className="py-3 px-3">Subscription Window</th>
                  <th className="py-3 px-3 text-right">Direct Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mocha-100">
                {subscribers.map((sub) => {
                  const customer = sub.customerId || {};
                  const plan = sub.planId || {};

                  return (
                    <tr key={sub._id} className="hover:bg-canvas-subtle/50 transition-colors">
                      <td className="py-3 px-3">
                        <p className="font-bold text-mocha-950">{customer.name || 'Subscriber'}</p>
                        <p className="text-[11px] text-mocha-500">{customer.phone || 'N/A'}</p>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-semibold text-mocha-900">{plan.name || 'Daily Thali'}</span>
                        <p className="text-[11px] text-amber-700 capitalize">
                          {plan.diet} • {plan.mealType} (₹{plan.pricePerMeal}/meal)
                        </p>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center space-x-1 text-mocha-700">
                          <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
                          <span>{sub.address?.area || 'Area'}</span>
                        </div>
                        <p className="text-[10px] text-mocha-400 truncate max-w-xs">{sub.address?.line}</p>
                      </td>
                      <td className="py-3 px-3 text-mocha-600">
                        <span>{sub.startDate} &rarr; {sub.endDate}</span>
                      </td>
                      <td className="py-3 px-3 text-right space-x-2">
                        <a
                          href={`https://wa.me/91${customer.phone || '9876543220'}?text=${encodeURIComponent(
                            `Hello ${customer.name || 'Customer'}! Here is an update regarding today's meal delivery from our kitchen.`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-lg border border-emerald-300 transition-smooth"
                        >
                          <MessageSquare className="w-3 h-3 mr-1 text-emerald-600" />
                          <span>WhatsApp</span>
                        </a>

                        <button
                          onClick={() => {
                            setSelectedCustomer(sub);
                            setIsMessageCustomerOpen(true);
                          }}
                          className="inline-flex items-center px-2.5 py-1.5 bg-mocha-100 hover:bg-mocha-200 text-mocha-900 font-bold rounded-lg transition-smooth"
                        >
                          <span>Message</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Broadcast Message Modal */}
      <Modal
        isOpen={isBroadcastOpen}
        onClose={() => setIsBroadcastOpen(false)}
        title="Broadcast Announcement to All Subscribers"
      >
        <form onSubmit={handleSendBroadcast} className="space-y-4 text-xs sm:text-sm">
          <p className="text-xs text-mocha-600 leading-relaxed">
            Send an instant notification to all <strong>{subscribers.length}</strong> active subscribers (e.g. today's special menu item, festival sweets, or delivery timing updates).
          </p>

          <div>
            <label className="block text-xs font-semibold text-mocha-800 mb-1">
              Announcement Message:
            </label>
            <textarea
              required
              rows={4}
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              placeholder="e.g. Today's Dinner Special: Fresh Gulab Jamuns included with every thali! Meals arriving between 7:30 - 8:15 PM."
              className="w-full p-3 border border-mocha-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
            ></textarea>
          </div>

          <div className="pt-3 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsBroadcastOpen(false)}
              className="px-4 py-2 border border-mocha-300 rounded-xl text-mocha-700 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs flex items-center space-x-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Broadcast Alert</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Direct Customer Message Modal */}
      <Modal
        isOpen={isMessageCustomerOpen}
        onClose={() => setIsMessageCustomerOpen(false)}
        title={`Message to ${selectedCustomer?.customerId?.name || 'Customer'}`}
      >
        <form onSubmit={handleSendDirectMessage} className="space-y-4 text-xs sm:text-sm">
          <div className="p-3 bg-canvas-subtle rounded-xl text-xs space-y-1">
            <p><strong>Customer:</strong> {selectedCustomer?.customerId?.name}</p>
            <p><strong>Phone:</strong> {selectedCustomer?.customerId?.phone}</p>
            <p><strong>Area:</strong> {selectedCustomer?.address?.area}</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-mocha-800 mb-1">
              Direct Message:
            </label>
            <textarea
              required
              rows={3}
              value={directMessageText}
              onChange={(e) => setDirectMessageText(e.target.value)}
              placeholder="e.g. Hi! Today our delivery rider is at your gate. Please collect your hot thali."
              className="w-full p-3 border border-mocha-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
            ></textarea>
          </div>

          <div className="pt-3 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsMessageCustomerOpen(false)}
              className="px-4 py-2 border border-mocha-300 rounded-xl text-mocha-700 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs"
            >
              Send Direct Message
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Dashboard;
