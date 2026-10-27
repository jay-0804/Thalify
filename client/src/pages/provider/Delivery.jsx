import React, { useState, useEffect } from 'react';
import api from '../../api/axios.js';
import { useSocket } from '../../context/SocketContext.jsx';
import { Loader } from '../../components/Loader.jsx';
import { ErrorBanner } from '../../components/ErrorBanner.jsx';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import {
  Truck,
  Calendar,
  UserCheck,
  Send,
  MapPin,
  Phone,
  RefreshCw,
  PlusCircle,
  CheckCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

const getTodayISTString = () => {
  try {
    return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
  } catch {
    return new Date().toISOString().split('T')[0];
  }
};

export const Delivery = () => {
  const { onDeliveryUpdate } = useSocket();

  const [date, setDate] = useState(getTodayISTString);
  const [data, setData] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [assigningArea, setAssigningArea] = useState(null);

  const fetchDeliveryData = async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    setError(null);
    try {
      const [resTasks, resStaff] = await Promise.all([
        api.get(`/provider/delivery?date=${date}`),
        api.get('/provider/staff'),
      ]);

      if (resTasks.success) {
        setData(resTasks.data);
      }
      if (resStaff.success) {
        setStaffList(resStaff.data.staff);
      }
    } catch (err) {
      setError(err.message || 'Failed to load delivery dispatch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveryData(true);
  }, [date]);

  // Live WebSocket refresh when a delivery rider marks delivered or failed
  useEffect(() => {
    const unsubscribe = onDeliveryUpdate(() => {
      fetchDeliveryData(false);
    });
    return () => unsubscribe();
  }, [date, onDeliveryUpdate]);

  // Trigger Task Generation with Auto-Demo Fallback
  const handleGenerateTasks = async () => {
    setGenerating(true);
    try {
      const res = await api.post('/provider/delivery/generate', { date });
      if (res.success) {
        if (res.data.created > 0) {
          toast.success(`Generated ${res.data.created} delivery drops for ${date}!`);
          fetchDeliveryData(false);
        } else {
          // If no active scheduled instances exist for this date, seed demo drops instantly
          const seedRes = await api.post('/provider/delivery/seed-demo', { date });
          if (seedRes.success) {
            toast.success(`Ready! Seeded ${seedRes.data.created || 4} delivery drops across your delivery sectors.`);
            fetchDeliveryData(false);
          }
        }
      }
    } catch (err) {
      toast.error(err.message || 'Failed to generate delivery tasks');
    } finally {
      setGenerating(false);
    }
  };

  // Explicit Seed Demo Drops button
  const handleSeedDemoDrops = async () => {
    setGenerating(true);
    try {
      const seedRes = await api.post('/provider/delivery/seed-demo', { date });
      if (seedRes.success) {
        toast.success(`Seeded demo route with active customer drops for ${date}!`);
        fetchDeliveryData(false);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to seed delivery drops');
    } finally {
      setGenerating(false);
    }
  };

  // Assign delivery rider to an area + mealType (BR-9)
  const handleAssignRider = async (area, mealType, staffId) => {
    if (!staffId) return;
    setAssigningArea(`${area}_${mealType}`);
    try {
      const res = await api.post('/provider/delivery/assign', {
        date,
        mealType,
        area,
        staffId,
      });
      if (res.success) {
        toast.success(res.data.message || 'Tasks assigned to delivery rider');
        fetchDeliveryData(false);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to assign tasks');
    } finally {
      setAssigningArea(null);
    }
  };

  if (loading) return <Loader message="Loading delivery dispatch board..." />;
  if (error) return <ErrorBanner message={error} onRetry={() => fetchDeliveryData(true)} />;
  if (!data) return <ErrorBanner message="Delivery board unavailable" onRetry={() => fetchDeliveryData(true)} />;

  const { totalTasks, groupedByArea } = data;
  const areaKeys = Object.keys(groupedByArea || {});

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-extrabold text-mocha-950 flex items-center space-x-2">
            <Truck className="w-8 h-8 text-amber-600" />
            <span>Delivery Dispatch Board</span>
          </h1>
          <p className="text-sm text-mocha-600 mt-1">
            Dispatch today's cooked meals, assign route batches to delivery staff, and monitor live drops.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-xl border border-mocha-200 shadow-xs">
            <Calendar className="w-4 h-4 text-amber-600" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="text-xs font-bold text-mocha-900 border-none focus:outline-hidden bg-transparent"
            />
          </div>

          <button
            onClick={handleGenerateTasks}
            disabled={generating}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-smooth"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{generating ? 'Processing...' : 'Generate Drops from Active Meals'}</span>
          </button>

          <button
            onClick={handleSeedDemoDrops}
            disabled={generating}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-smooth"
          >
            <span>⚡ Seed Instant Demo Drops</span>
          </button>
        </div>
      </div>

      {/* Summary Banner */}
      <div className="p-4 bg-white rounded-2xl border border-mocha-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4 text-xs">
          <span className="font-semibold text-mocha-800">
            Total Drops for {date}: <strong className="text-mocha-950 text-sm">{totalTasks}</strong>
          </span>
          <span className="text-mocha-400">|</span>
          <span className="text-mocha-600">
            Service Areas Active: <strong className="text-mocha-900">{areaKeys.length}</strong>
          </span>
        </div>

        <div className="text-xs text-mocha-500">
          *Daily background cron auto-generates tasks at 06:00 IST
        </div>
      </div>

      {/* Area-Grouped Drop Cards */}
      {areaKeys.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-mocha-200">
          <p className="text-lg font-serif font-bold text-mocha-900 mb-2">No Delivery Tasks Generated Yet</p>
          <p className="text-xs text-mocha-600 max-w-md mx-auto mb-4">
            Click "Generate Drops from Active Meals" above to create today's delivery tasks from scheduled subscriptions.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleGenerateTasks}
              disabled={generating}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs"
            >
              Generate Drops from Active Subscriptions
            </button>
            <button
              onClick={handleSeedDemoDrops}
              disabled={generating}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs"
            >
              ⚡ Seed Instant Demo Drops
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {areaKeys.map((area) => {
            const tasksInArea = groupedByArea[area];
            const pendingTasks = tasksInArea.filter((t) => t.status === 'pending');
            const deliveredTasks = tasksInArea.filter((t) => t.status === 'delivered');
            const failedTasks = tasksInArea.filter((t) => t.status === 'failed');

            return (
              <div
                key={area}
                className="bg-white rounded-3xl border border-mocha-200/80 shadow-xs overflow-hidden"
              >
                {/* Area Header & Route Assignment Bar */}
                <div className="p-6 bg-canvas-subtle/70 border-b border-mocha-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-5 h-5 text-amber-600" />
                      <h2 className="text-xl font-serif font-bold text-mocha-950">
                        {area} Route
                      </h2>
                    </div>
                    <p className="text-xs text-mocha-600">
                      {tasksInArea.length} Drops ({pendingTasks.length} Pending, {deliveredTasks.length} Delivered, {failedTasks.length} Failed)
                    </p>
                  </div>

                  {/* Bulk Rider Assignment Dropdown */}
                  {pendingTasks.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-semibold text-mocha-700">Assign Route:</span>
                      <select
                        onChange={(e) => handleAssignRider(area, pendingTasks[0]?.mealType || 'lunch', e.target.value)}
                        defaultValue=""
                        className="px-3 py-1.5 text-xs font-semibold bg-white border border-mocha-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                      >
                        <option value="" disabled>
                          Select Delivery Rider
                        </option>
                        {staffList.map((staff) => (
                          <option key={staff._id || staff.id} value={staff._id || staff.id}>
                            {staff.name} ({staff.phone})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Drop Items Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-canvas-subtle/30 text-mocha-800 font-semibold border-b border-mocha-100">
                      <tr>
                        <th className="py-3 px-6">Customer & Phone</th>
                        <th className="py-3 px-6">Delivery Address</th>
                        <th className="py-3 px-6">Meal Type</th>
                        <th className="py-3 px-6">Assigned Rider</th>
                        <th className="py-3 px-6 text-right">Live Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-mocha-100">
                      {tasksInArea.map((task) => (
                        <tr key={task._id} className="hover:bg-mocha-50/40">
                          <td className="py-3 px-6">
                            <p className="font-bold text-mocha-900">{task.customerName}</p>
                            <p className="text-mocha-500 flex items-center space-x-1 mt-0.5">
                              <Phone className="w-3 h-3 text-gold-600" />
                              <span>{task.phone}</span>
                            </p>
                          </td>
                          <td className="py-3 px-6 text-mocha-700 max-w-xs">
                            <p className="font-medium text-mocha-900">{task.addressLine}</p>
                            {task.landmark && (
                              <p className="text-[11px] text-mocha-500">Near: {task.landmark}</p>
                            )}
                          </td>
                          <td className="py-3 px-6 capitalize">
                            <span className="px-2 py-0.5 rounded bg-mocha-100 text-mocha-800 font-semibold">
                              {task.mealType}
                            </span>
                          </td>
                          <td className="py-3 px-6">
                            {task.assignedTo ? (
                              <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                                {task.assignedTo.name || 'Assigned'}
                              </span>
                            ) : (
                              <span className="text-amber-800 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200 font-medium">
                                Unassigned
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-6 text-right">
                            <StatusBadge
                              status={task.status}
                              failureReason={task.failureReason}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Delivery;
