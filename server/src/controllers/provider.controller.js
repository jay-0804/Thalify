import bcrypt from 'bcryptjs';
import { Provider } from '../models/Provider.model.js';
import { Plan } from '../models/Plan.model.js';
import { MenuItem } from '../models/MenuItem.model.js';
import { User } from '../models/User.model.js';
import { Subscription } from '../models/Subscription.model.js';
import { MealInstance } from '../models/MealInstance.model.js';
import { DeliveryTask } from '../models/DeliveryTask.model.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getTodayIST, getTomorrowIST, getMonthString } from '../utils/dates.js';
import { getKitchenPrepSummary } from '../services/prep.service.js';
import { calculateMonthlyBill } from '../services/billing.service.js';

// Helper: Get provider record for current authenticated user
export const getProviderForUser = async (userId) => {
  const provider = await Provider.findOne({ ownerId: userId });
  if (!provider) {
    throw ApiError.forbidden('Provider profile not found for this account');
  }
  return provider;
};

// --- PROFILE ---
export const getProfile = asyncHandler(async (req, res) => {
  const provider = await getProviderForUser(req.user.id);
  res.status(200).json({ success: true, data: { provider } });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const provider = await getProviderForUser(req.user.id);
  const { businessName, description, contactPhone, deliveryAreas, cutoffTime, isActive } = req.body;

  if (businessName !== undefined) provider.businessName = businessName;
  if (description !== undefined) provider.description = description;
  if (contactPhone !== undefined) provider.contactPhone = contactPhone;
  if (deliveryAreas !== undefined) provider.deliveryAreas = deliveryAreas;
  if (cutoffTime !== undefined) provider.cutoffTime = cutoffTime;
  if (isActive !== undefined) provider.isActive = isActive;

  await provider.save();
  res.status(200).json({ success: true, data: { provider } });
});

// --- PLANS ---
export const getPlans = asyncHandler(async (req, res) => {
  const provider = await getProviderForUser(req.user.id);
  const plans = await Plan.find({ providerId: provider._id }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: { plans } });
});

export const createPlan = asyncHandler(async (req, res) => {
  const provider = await getProviderForUser(req.user.id);
  const { name, description, mealType, diet, pricePerMeal, daysOfWeek } = req.body;

  const plan = await Plan.create({
    providerId: provider._id,
    name,
    description: description || '',
    mealType,
    diet,
    pricePerMeal,
    daysOfWeek,
    isActive: true,
  });

  res.status(201).json({ success: true, data: { plan } });
});

export const updatePlan = asyncHandler(async (req, res) => {
  const provider = await getProviderForUser(req.user.id);
  const plan = await Plan.findById(req.params.id);

  if (!plan) {
    throw ApiError.notFound('Plan not found');
  }
  if (plan.providerId.toString() !== provider._id.toString()) {
    throw ApiError.forbidden('You do not own this plan');
  }

  const { name, description, mealType, diet, pricePerMeal, daysOfWeek, isActive } = req.body;
  if (name !== undefined) plan.name = name;
  if (description !== undefined) plan.description = description;
  if (mealType !== undefined) plan.mealType = mealType;
  if (diet !== undefined) plan.diet = diet;
  if (pricePerMeal !== undefined) plan.pricePerMeal = pricePerMeal;
  if (daysOfWeek !== undefined) plan.daysOfWeek = daysOfWeek;
  if (isActive !== undefined) plan.isActive = isActive;

  await plan.save();
  res.status(200).json({ success: true, data: { plan } });
});

export const deletePlan = asyncHandler(async (req, res) => {
  const provider = await getProviderForUser(req.user.id);
  const plan = await Plan.findById(req.params.id);

  if (!plan) {
    throw ApiError.notFound('Plan not found');
  }
  if (plan.providerId.toString() !== provider._id.toString()) {
    throw ApiError.forbidden('You do not own this plan');
  }

  // Soft delete / deactivation to preserve historical billing integrity
  plan.isActive = false;
  await plan.save();

  res.status(200).json({ success: true, data: { plan, message: 'Plan deactivated successfully' } });
});

// --- MENU ---
export const getMenu = asyncHandler(async (req, res) => {
  const provider = await getProviderForUser(req.user.id);
  const { from, to } = req.query;

  const query = { providerId: provider._id };
  if (from && to) {
    query.date = { $gte: from, $lte: to };
  } else if (from) {
    query.date = { $gte: from };
  }

  const menu = await MenuItem.find(query).sort({ date: 1, mealType: 1 });
  res.status(200).json({ success: true, data: { menu } });
});

export const upsertMenu = asyncHandler(async (req, res) => {
  const provider = await getProviderForUser(req.user.id);
  const { date, mealType, dishes } = req.body;

  const menuItem = await MenuItem.findOneAndUpdate(
    { providerId: provider._id, date, mealType },
    { dishes },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  res.status(200).json({ success: true, data: { menuItem } });
});

// --- STAFF ---
export const getStaff = asyncHandler(async (req, res) => {
  const provider = await getProviderForUser(req.user.id);
  const staff = await User.find({
    providerId: provider._id,
    role: 'delivery',
  }).select('-passwordHash').sort({ createdAt: -1 });

  res.status(200).json({ success: true, data: { staff } });
});

export const createStaff = asyncHandler(async (req, res) => {
  const provider = await getProviderForUser(req.user.id);
  const { name, email, password, phone } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    throw ApiError.conflict('EMAIL_EXISTS', 'A user with this email already exists');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const staff = await User.create({
    name,
    email,
    passwordHash,
    phone,
    role: 'delivery',
    providerId: provider._id,
    isActive: true,
  });

  res.status(201).json({
    success: true,
    data: {
      staff: {
        id: staff._id,
        name: staff.name,
        email: staff.email,
        phone: staff.phone,
        role: staff.role,
        providerId: staff.providerId,
        isActive: staff.isActive,
      },
    },
  });
});

export const deleteStaff = asyncHandler(async (req, res) => {
  const provider = await getProviderForUser(req.user.id);
  const staff = await User.findById(req.params.id);

  if (!staff) {
    throw ApiError.notFound('Staff member not found');
  }
  if (!staff.providerId || staff.providerId.toString() !== provider._id.toString()) {
    throw ApiError.forbidden('You do not have permission to manage this staff member');
  }

  staff.isActive = false;
  await staff.save();

  res.status(200).json({ success: true, data: { message: 'Staff member deactivated successfully' } });
});

// --- SUBSCRIBERS ---
export const getSubscribers = asyncHandler(async (req, res) => {
  const provider = await getProviderForUser(req.user.id);
  const subscriptions = await Subscription.find({
    providerId: provider._id,
  })
    .populate('customerId', 'name email phone')
    .populate('planId', 'name mealType diet pricePerMeal')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: { subscriptions },
  });
});

// --- PREP DASHBOARD (BR-7) ---
export const getPrepSummary = asyncHandler(async (req, res) => {
  const provider = await getProviderForUser(req.user.id);
  const date = req.query.date || getTomorrowIST();

  const summary = await getKitchenPrepSummary(provider._id, date);
  res.status(200).json({ success: true, data: summary });
});

// --- ANALYTICS ---
export const getAnalytics = asyncHandler(async (req, res) => {
  const provider = await getProviderForUser(req.user.id);
  const { from, to } = req.query;

  const dateFilter = {};
  if (from && to) {
    dateFilter.date = { $gte: from, $lte: to };
  } else if (from) {
    dateFilter.date = { $gte: from };
  }

  const meals = await MealInstance.find({
    providerId: provider._id,
    ...dateFilter,
  }).lean();

  let deliveredCount = 0;
  let skippedCount = 0;
  let failedCount = 0;
  let revenueCharged = 0;

  for (const m of meals) {
    if (m.status === 'delivered') {
      deliveredCount++;
      revenueCharged += m.price;
    } else if (m.status === 'skipped') {
      skippedCount++;
    } else if (m.status === 'failed') {
      failedCount++;
      if (m.billable) {
        revenueCharged += m.price;
      }
    }
  }

  const totalActioned = deliveredCount + skippedCount + failedCount;
  const skipRate = totalActioned > 0 ? Number(((skippedCount / totalActioned) * 100).toFixed(1)) : 0;

  res.status(200).json({
    success: true,
    data: {
      from,
      to,
      totalMeals: meals.length,
      deliveredCount,
      skippedCount,
      failedCount,
      skipRate, // in percentage
      revenueCharged,
    },
  });
});

// --- MAIN DASHBOARD OVERVIEW ---
export const getDashboardOverview = asyncHandler(async (req, res) => {
  const provider = await getProviderForUser(req.user.id);
  const today = getTodayIST();
  const tomorrow = getTomorrowIST();
  const currentMonth = getMonthString(today);

  // 1. Tomorrow's headcount
  const tomorrowPrep = await getKitchenPrepSummary(provider._id, tomorrow);

  // 2. Today's delivery progress
  const todayTasks = await DeliveryTask.find({ providerId: provider._id, date: today });
  const deliveryProgress = {
    total: todayTasks.length,
    delivered: todayTasks.filter((t) => t.status === 'delivered').length,
    failed: todayTasks.filter((t) => t.status === 'failed').length,
    pending: todayTasks.filter((t) => t.status === 'pending').length,
  };

  // 3. Total unpaid balance across active subscriptions
  const subscriptions = await Subscription.find({ providerId: provider._id, status: 'active' });
  let totalUnpaidBalance = 0;

  for (const sub of subscriptions) {
    const bill = await calculateMonthlyBill(sub._id, currentMonth);
    totalUnpaidBalance += bill.balance;
  }

  res.status(200).json({
    success: true,
    data: {
      tomorrowHeadcount: tomorrowPrep.totals.total,
      tomorrowPrep,
      deliveryProgress,
      totalUnpaidBalance,
      activeSubscribersCount: subscriptions.length,
    },
  });
});
