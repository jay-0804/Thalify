import { Subscription } from '../models/Subscription.model.js';
import { Plan } from '../models/Plan.model.js';
import { Provider } from '../models/Provider.model.js';
import { MealInstance } from '../models/MealInstance.model.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  getTodayIST,
  getTomorrowIST,
  addDaysIST,
  parseDateIST,
  isBeforeDeadline,
  isDateInRange,
} from '../utils/dates.js';
import { generateMealsForSubscription } from '../services/mealGenerator.service.js';
import { checkCutoffStatus } from '../services/cutoff.service.js';
import { emitPrepChanged } from '../sockets/index.js';

export const createSubscription = asyncHandler(async (req, res) => {
  const customerId = req.user.id;
  const { planId, startDate, durationDays, address } = req.body;

  // 1. Verify plan exists and is active
  const plan = await Plan.findById(planId);
  if (!plan || !plan.isActive) {
    throw ApiError.badRequest('Plan not found or currently inactive');
  }

  // 2. Verify provider exists and is active
  const provider = await Provider.findById(plan.providerId);
  if (!provider || !provider.isActive) {
    throw ApiError.badRequest('Provider is currently inactive');
  }

  // 3. startDate must be tomorrow or later (IST) (BR-2, Acceptance Test 4)
  const tomorrow = getTomorrowIST();
  if (parseDateIST(startDate).isBefore(parseDateIST(tomorrow))) {
    throw ApiError.badRequest(`Start date must be tomorrow (${tomorrow}) or later in IST`, {
      providedStartDate: startDate,
      earliestAllowed: tomorrow,
    });
  }

  // 4. Calculate endDate: startDate + durationDays - 1 (BR-2)
  const endDate = addDaysIST(startDate, durationDays - 1);

  // 5. Verify address.area is in provider.deliveryAreas (BR-2)
  const areaMatch = provider.deliveryAreas.some(
    (a) => a.trim().toLowerCase() === address.area.trim().toLowerCase()
  );
  if (!areaMatch) {
    throw ApiError.badRequest(
      `Delivery area "${address.area}" is not served by provider. Served areas: ${provider.deliveryAreas.join(', ')}`
    );
  }

  // 6. Overlap check: Customer cannot hold two active subscriptions to the same plan with overlapping date ranges (BR-2, Acceptance Test 5)
  const existingActiveSubs = await Subscription.find({
    customerId,
    planId,
    status: 'active',
  });

  const hasOverlap = existingActiveSubs.some((sub) => {
    // Two intervals [s1, e1] and [s2, e2] overlap if max(s1, s2) <= min(e1, e2)
    const latestStart = parseDateIST(startDate).isAfter(parseDateIST(sub.startDate)) ? startDate : sub.startDate;
    const earliestEnd = parseDateIST(endDate).isBefore(parseDateIST(sub.endDate)) ? endDate : sub.endDate;
    return parseDateIST(latestStart).isSameOrBefore(parseDateIST(earliestEnd));
  });

  if (hasOverlap) {
    throw ApiError.duplicateSubscription(
      'You already have an active subscription for this plan that overlaps with the requested date range'
    );
  }

  // 7. Create Subscription
  const subscription = await Subscription.create({
    customerId,
    providerId: provider._id,
    planId: plan._id,
    startDate,
    endDate,
    durationDays,
    address,
    status: 'active',
  });

  // 8. Generate meal instances immediately for the active horizon (BR-2)
  await generateMealsForSubscription(subscription);

  // Notify provider dashboard of potential prep count changes
  emitPrepChanged(provider._id.toString());

  return res.status(201).json({
    success: true,
    data: {
      subscription,
      plan,
      provider: {
        id: provider._id,
        businessName: provider.businessName,
        cutoffTime: provider.cutoffTime,
      },
    },
  });
});

export const getMySubscriptions = asyncHandler(async (req, res) => {
  const customerId = req.user.id;
  const subscriptions = await Subscription.find({ customerId })
    .populate('planId', 'name mealType diet pricePerMeal daysOfWeek')
    .populate('providerId', 'businessName contactPhone cutoffTime')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: { subscriptions },
  });
});

export const getSubscriptionDetail = asyncHandler(async (req, res) => {
  const customerId = req.user.id;
  const subscription = await Subscription.findById(req.params.id)
    .populate('planId')
    .populate('providerId', 'businessName contactPhone cutoffTime deliveryAreas');

  if (!subscription) {
    throw ApiError.notFound('Subscription not found');
  }

  // Authorization check (BR-13, Acceptance Test 3)
  if (subscription.customerId.toString() !== customerId.toString()) {
    throw ApiError.forbidden('You do not own this subscription');
  }

  // Fetch meals for the next 14 days from today
  const today = getTodayIST();
  const next14Days = addDaysIST(today, 14);

  const meals = await MealInstance.find({
    subscriptionId: subscription._id,
    date: { $gte: today, $lte: next14Days },
  }).sort({ date: 1, mealType: 1 }).lean();

  const cutoffTime = subscription.providerId?.cutoffTime || '20:00';

  // Attach canSkip and skipDeadline to each meal for UI convenience (BR-4)
  const mealsWithCutoff = meals.map((meal) => {
    const statusInfo = checkCutoffStatus(meal.date, cutoffTime);
    return {
      ...meal,
      canSkip: statusInfo.canSkip && meal.status === 'scheduled',
      skipDeadline: statusInfo.deadlineIST,
    };
  });

  res.status(200).json({
    success: true,
    data: {
      subscription,
      meals: mealsWithCutoff,
    },
  });
});

export const pauseSubscription = asyncHandler(async (req, res) => {
  const customerId = req.user.id;
  const { from, to } = req.body;
  const subscription = await Subscription.findById(req.params.id).populate('providerId');

  if (!subscription) {
    throw ApiError.notFound('Subscription not found');
  }
  if (subscription.customerId.toString() !== customerId.toString()) {
    throw ApiError.forbidden('You do not own this subscription');
  }
  if (subscription.status !== 'active') {
    throw ApiError.invalidState(`Cannot pause a ${subscription.status} subscription`);
  }

  if (parseDateIST(from).isAfter(parseDateIST(to))) {
    throw ApiError.badRequest('From date must be on or before To date');
  }

  // Range of at most 30 days (BR-5)
  const duration = parseDateIST(to).diff(parseDateIST(from), 'day') + 1;
  if (duration > 30) {
    throw ApiError.badRequest('Pause duration cannot exceed 30 days');
  }

  // Range must fall inside subscription dates
  if (
    parseDateIST(from).isBefore(parseDateIST(subscription.startDate)) ||
    parseDateIST(to).isAfter(parseDateIST(subscription.endDate))
  ) {
    throw ApiError.badRequest(
      `Pause range must fall within subscription dates (${subscription.startDate} to ${subscription.endDate})`
    );
  }

  const cutoffTime = subscription.providerId?.cutoffTime || '20:00';

  // Find all scheduled meals in this range (BR-5, Acceptance Test 11)
  const scheduledMeals = await MealInstance.find({
    subscriptionId: subscription._id,
    date: { $gte: from, $lte: to },
    status: 'scheduled',
  });

  let skippedCount = 0;
  let lockedMeals = 0;

  for (const meal of scheduledMeals) {
    const { canSkip } = checkCutoffStatus(meal.date, cutoffTime);
    if (canSkip) {
      meal.status = 'skipped';
      meal.skipReason = 'pause';
      await meal.save();
      skippedCount++;
    } else {
      lockedMeals++;
    }
  }

  // Add pause range to subscription
  subscription.pauses.push({ from, to });
  await subscription.save();

  emitPrepChanged(subscription.providerId?._id.toString());

  res.status(200).json({
    success: true,
    data: {
      message: `Subscription paused from ${from} to ${to}`,
      skippedCount,
      lockedMeals,
      pauses: subscription.pauses,
    },
  });
});

export const resumeSubscription = asyncHandler(async (req, res) => {
  const customerId = req.user.id;
  const { from, to } = req.body;
  const subscription = await Subscription.findById(req.params.id).populate('providerId');

  if (!subscription) {
    throw ApiError.notFound('Subscription not found');
  }
  if (subscription.customerId.toString() !== customerId.toString()) {
    throw ApiError.forbidden('You do not own this subscription');
  }

  const cutoffTime = subscription.providerId?.cutoffTime || '20:00';

  // Restore skipped (pause) meals whose deadline has not passed (BR-5, Acceptance Test 12)
  const pausedMeals = await MealInstance.find({
    subscriptionId: subscription._id,
    date: { $gte: from, $lte: to },
    status: 'skipped',
    skipReason: 'pause',
  });

  let restoredCount = 0;
  for (const meal of pausedMeals) {
    const { canSkip } = checkCutoffStatus(meal.date, cutoffTime);
    if (canSkip) {
      meal.status = 'scheduled';
      meal.skipReason = null;
      await meal.save();
      restoredCount++;
    }
  }

  // Remove matching pause range
  subscription.pauses = subscription.pauses.filter(
    (p) => !(p.from === from && p.to === to)
  );
  await subscription.save();

  emitPrepChanged(subscription.providerId?._id.toString());

  res.status(200).json({
    success: true,
    data: {
      message: `Resumed meals from ${from} to ${to}`,
      restoredCount,
      pauses: subscription.pauses,
    },
  });
});

export const cancelSubscription = asyncHandler(async (req, res) => {
  const customerId = req.user.id;
  const subscription = await Subscription.findById(req.params.id).populate('providerId');

  if (!subscription) {
    throw ApiError.notFound('Subscription not found');
  }
  if (subscription.customerId.toString() !== customerId.toString()) {
    throw ApiError.forbidden('You do not own this subscription');
  }
  if (subscription.status === 'cancelled') {
    throw ApiError.invalidState('Subscription is already cancelled');
  }

  const cutoffTime = subscription.providerId?.cutoffTime || '20:00';

  // BR-6: Future scheduled meals whose deadline has not passed become cancelled. Meals past deadline remain.
  const futureScheduledMeals = await MealInstance.find({
    subscriptionId: subscription._id,
    status: 'scheduled',
  });

  let cancelledMealsCount = 0;
  let remainingMealsCount = 0;

  for (const meal of futureScheduledMeals) {
    const { canSkip } = checkCutoffStatus(meal.date, cutoffTime);
    if (canSkip) {
      meal.status = 'cancelled';
      await meal.save();
      cancelledMealsCount++;
    } else {
      remainingMealsCount++;
    }
  }

  subscription.status = 'cancelled';
  subscription.cancelledAt = new Date();
  await subscription.save();

  emitPrepChanged(subscription.providerId?._id.toString());

  res.status(200).json({
    success: true,
    data: {
      message: 'Subscription cancelled successfully',
      cancelledMealsCount,
      remainingMealsCount,
    },
  });
});
