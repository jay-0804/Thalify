import React, { useState, useEffect, useMemo } from 'react';
import api from '../../api/axios.js';
import { Loader } from '../../components/Loader.jsx';
import { ErrorBanner } from '../../components/ErrorBanner.jsx';
import { Modal } from '../../components/Modal.jsx';
import {
  Layers,
  Utensils,
  PlusCircle,
  Calendar,
  Clock,
  Trash2,
  CheckCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

// Safe date formatting helper to prevent any invalid date crashes
const formatDateSafe = (dateStr, options) => {
  if (!dateStr) return '';
  try {
    const clean = String(dateStr).slice(0, 10);
    const parts = clean.split('-');
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);
      const dt = new Date(y, m, d);
      if (!isNaN(dt.getTime())) {
        return dt.toLocaleDateString('en-IN', options);
      }
    }
    const dt = new Date(dateStr);
    return isNaN(dt.getTime()) ? String(dateStr) : dt.toLocaleDateString('en-IN', options);
  } catch {
    return String(dateStr);
  }
};

export const Menu = () => {
  const [plans, setPlans] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // New Plan Modal State
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [planName, setPlanName] = useState('');
  const [planDesc, setPlanDesc] = useState('');
  const [mealType, setMealType] = useState('lunch');
  const [diet, setDiet] = useState('veg');
  const [price, setPrice] = useState(90);
  const [selectedDays, setSelectedDays] = useState([1, 2, 3, 4, 5, 6]);
  const [submittingPlan, setSubmittingPlan] = useState(false);

  // Menu Upsert State
  const todayStr = new Date().toISOString().split('T')[0];
  const [menuDate, setMenuDate] = useState(todayStr);
  const [menuMealType, setMenuMealType] = useState('lunch');
  const [dishesText, setDishesText] = useState('Paneer Butter Masala, Dal Tadka, 4 Rotis, Rice');
  const [submittingMenu, setSubmittingMenu] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [resPlans, resMenu] = await Promise.all([
        api.get('/provider/plans'),
        api.get('/provider/menu'),
      ]);
      if (resPlans.success) setPlans(resPlans.data.plans);
      if (resMenu.success) setMenuItems(resMenu.data.menu);
    } catch (err) {
      setError(err.message || 'Failed to load plans and menus');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    if (selectedDays.length === 0) {
      toast.error('Select at least one day of the week');
      return;
    }
    setSubmittingPlan(true);
    try {
      const res = await api.post('/provider/plans', {
        name: planName,
        description: planDesc,
        mealType,
        diet,
        pricePerMeal: Number(price),
        daysOfWeek: selectedDays,
      });
      if (res.success) {
        toast.success('New meal plan created successfully');
        setIsPlanModalOpen(false);
        setPlanName('');
        setPlanDesc('');
        fetchData();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create plan');
    } finally {
      setSubmittingPlan(false);
    }
  };

  const handleDeactivatePlan = async (planId) => {
    if (!confirm('Deactivate this plan? Existing subscriptions will remain valid.')) return;
    try {
      const res = await api.delete(`/provider/plans/${planId}`);
      if (res.success) {
        toast.success('Plan deactivated');
        fetchData();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to deactivate plan');
    }
  };

  const handleUpsertMenu = async (e) => {
    e.preventDefault();
    const dishes = dishesText
      .split(',')
      .map((d) => d.trim())
      .filter(Boolean);

    if (dishes.length === 0) {
      toast.error('Enter at least one dish name');
      return;
    }

    setSubmittingMenu(true);
    try {
      const res = await api.put('/provider/menu', {
        date: menuDate,
        mealType: menuMealType,
        dishes,
      });
      if (res.success) {
        toast.success(`Menu updated for ${menuDate} (${menuMealType})`);
        fetchData();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update menu');
    } finally {
      setSubmittingMenu(false);
    }
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const toggleDay = (dayIndex) => {
    setSelectedDays((prev) =>
      prev.includes(dayIndex) ? prev.filter((d) => d !== dayIndex) : [...prev, dayIndex].sort()
    );
  };

  const groupedMenuItems = useMemo(() => {
    if (!menuItems || !menuItems.length) return [];
    const map = {};
    menuItems.forEach((item) => {
      if (!map[item.date]) {
        map[item.date] = { date: item.date, lunch: null, dinner: null };
      }
      if (item.mealType === 'lunch') map[item.date].lunch = item.dishes;
      if (item.mealType === 'dinner') map[item.date].dinner = item.dishes;
    });
    return Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
  }, [menuItems]);

  if (loading) return <Loader message="Loading plans and menus..." />;
  if (error) return <ErrorBanner message={error} onRetry={fetchData} />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Plans Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-extrabold text-mocha-950 flex items-center space-x-2">
              <Layers className="w-8 h-8 text-amber-600" />
              <span>Subscription Plans</span>
            </h1>
            <p className="text-sm text-mocha-600 mt-1">
              Create and manage meal tiers (Veg, Non-Veg, Lunch, Dinner, Combos).
            </p>
          </div>

          <button
            onClick={() => setIsPlanModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-smooth self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Plan</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan._id}
              className={`p-6 rounded-2xl border transition-smooth flex flex-col justify-between ${
                plan.isActive
                  ? 'bg-white border-mocha-200/80 shadow-xs'
                  : 'bg-gray-50 border-gray-200 opacity-60'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                      plan.diet === 'veg'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                        : 'bg-rose-50 text-rose-800 border border-rose-300'
                    }`}
                  >
                    {plan.diet} • {plan.mealType}
                  </span>
                  {!plan.isActive && (
                    <span className="text-[10px] text-gray-500 font-semibold bg-gray-200 px-2 py-0.5 rounded">
                      Deactivated
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-serif font-bold text-mocha-950">{plan.name}</h3>
                <p className="text-xs text-mocha-600">{plan.description}</p>

                <div className="pt-2 border-t border-mocha-100 flex items-baseline justify-between text-xs">
                  <span className="text-2xl font-serif font-bold text-mocha-950">
                    ₹{plan.pricePerMeal}{' '}
                    <span className="text-xs font-normal text-mocha-500">/ meal</span>
                  </span>
                  <span className="font-semibold text-gold-700">
                    {plan.daysOfWeek?.map((d) => dayNames[d]).join(', ')}
                  </span>
                </div>
              </div>

              {plan.isActive && (
                <button
                  onClick={() => handleDeactivatePlan(plan._id)}
                  className="mt-4 pt-3 border-t border-mocha-100 flex items-center justify-center space-x-1 text-xs text-rose-600 hover:text-rose-800 font-semibold transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Deactivate Plan</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Rolling Menu Section */}
      <div className="bg-white rounded-3xl border border-mocha-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h2 className="text-2xl font-serif font-bold text-mocha-950 flex items-center space-x-2">
            <Utensils className="w-6 h-6 text-amber-600" />
            <span>Update Daily Menu</span>
          </h2>
          <p className="text-xs text-mocha-600 mt-1">
            Keep customers informed about what is cooking for lunch and dinner each day.
          </p>
        </div>

        <form onSubmit={handleUpsertMenu} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-mocha-800 mb-1">Date:</label>
            <input
              type="date"
              required
              value={menuDate}
              onChange={(e) => setMenuDate(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-mocha-300 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-mocha-800 mb-1">Meal Slot:</label>
            <select
              value={menuMealType}
              onChange={(e) => setMenuMealType(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-mocha-300 rounded-xl"
            >
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-mocha-800 mb-1">
              Dishes (Comma-separated list):
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                required
                value={dishesText}
                onChange={(e) => setDishesText(e.target.value)}
                placeholder="e.g. Rajma Masala, Steamed Rice, 3 Rotis, Salad"
                className="flex-1 px-3 py-2 text-xs border border-mocha-300 rounded-xl"
              />
              <button
                type="submit"
                disabled={submittingMenu}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs shrink-0"
              >
                {submittingMenu ? 'Saving...' : 'Save Menu'}
              </button>
            </div>
          </div>
        </form>

        {/* Existing Menu List Preview (Grouped by Day) */}
        <div className="pt-4 border-t border-mocha-100 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-serif font-bold text-mocha-950">
              Active Daily Menu Schedule (Organized by Day)
            </h3>
            <span className="text-[11px] text-mocha-500 font-medium">
              Showing Lunch & Dinner together per day
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groupedMenuItems.map((dayGroup) => {
              const formattedDate = formatDateSafe(dayGroup.date, {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
              });

              return (
                <div
                  key={dayGroup.date}
                  className="p-4 bg-canvas-subtle/80 rounded-2xl border border-mocha-200/90 text-xs space-y-3 shadow-2xs"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-mocha-200/60">
                    <span className="font-bold text-mocha-950 text-sm">{formattedDate}</span>
                    <span className="text-[10px] text-mocha-500 font-mono">{dayGroup.date}</span>
                  </div>

                  {/* Lunch Details */}
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-amber-800 bg-amber-100/70 px-1.5 py-0.5 rounded">
                      ☀️ Lunch
                    </span>
                    <p className="text-mocha-800 font-medium pt-0.5 pl-1 leading-relaxed">
                      {dayGroup.lunch ? (
                        dayGroup.lunch.join(' • ')
                      ) : (
                        <span className="text-mocha-400 italic">No lunch set</span>
                      )}
                    </p>
                  </div>

                  {/* Dinner Details */}
                  <div className="space-y-1 pt-1 border-t border-mocha-100">
                    <span className="text-[10px] uppercase font-bold text-gold-900 bg-gold-100/70 px-1.5 py-0.5 rounded">
                      🌙 Dinner
                    </span>
                    <p className="text-mocha-800 font-medium pt-0.5 pl-1 leading-relaxed">
                      {dayGroup.dinner ? (
                        dayGroup.dinner.join(' • ')
                      ) : (
                        <span className="text-mocha-400 italic">No dinner set</span>
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Create Plan Modal */}
      <Modal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        title="Create New Subscription Plan"
      >
        <form onSubmit={handleCreatePlan} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block font-semibold text-mocha-800 mb-1">Plan Name:</label>
            <input
              type="text"
              required
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              placeholder="e.g. Executive Lunch Thali"
              className="w-full px-3 py-2 border border-mocha-300 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold text-mocha-800 mb-1">Description:</label>
            <textarea
              rows={2}
              value={planDesc}
              onChange={(e) => setPlanDesc(e.target.value)}
              placeholder="e.g. Includes 4 rotis, seasonal curry, dal and steamed basmati rice"
              className="w-full px-3 py-2 border border-mocha-300 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-mocha-800 mb-1">Meal Type:</label>
              <select
                value={mealType}
                onChange={(e) => setMealType(e.target.value)}
                className="w-full px-3 py-2 border border-mocha-300 rounded-xl"
              >
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="both">Both (Lunch + Dinner)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-mocha-800 mb-1">Diet:</label>
              <select
                value={diet}
                onChange={(e) => setDiet(e.target.value)}
                className="w-full px-3 py-2 border border-mocha-300 rounded-xl"
              >
                <option value="veg">Vegetarian</option>
                <option value="nonveg">Non-Vegetarian</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-mocha-800 mb-1">Price per Meal (₹):</label>
            <input
              type="number"
              required
              min={1}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-3 py-2 border border-mocha-300 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold text-mocha-800 mb-1">Days of Week:</label>
            <div className="flex flex-wrap gap-2">
              {dayNames.map((name, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => toggleDay(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-smooth ${
                    selectedDays.includes(idx)
                      ? 'bg-amber-600 text-white border-amber-600'
                      : 'bg-mocha-50 text-mocha-700 border-mocha-200 hover:bg-mocha-100'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsPlanModalOpen(false)}
              className="px-4 py-2 border border-mocha-300 rounded-xl text-mocha-700 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingPlan}
              className="px-5 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-xs"
            >
              {submittingPlan ? 'Saving...' : 'Create Plan'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Menu;
