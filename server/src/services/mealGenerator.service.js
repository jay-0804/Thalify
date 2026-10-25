import { MealInstance } from '../models/MealInstance.model.js';
import { Plan } from '../models/Plan.model.js';
import { Subscription } from '../models/Subscription.model.js';
import {
  getTodayIST,
  addDaysIST,
  getDayOfWeekIST,
  parseDateIST,
  isDateInRange,
} from '../utils/dates.js';

/**
 * Idempotently generates MealInstances for a subscription within the rolling horizon [today, min(today + 7 days, endDate)]
 * @param {Object} subscription - Subscription document or populated object
 * @returns {Promise<number>} - Count of meal instances processed
 */
export const generateMealsForSubscription = async (subscription) => {
  if (subscription.status !== 'active') {
    return 0;
  }

  const plan = await Plan.findById(subscription.planId);
  if (!plan) {
    return 0;
  }

  const today = getTodayIST();
  const sevenDaysAhead = addDaysIST(today, 7);

  // Range start is max(today, subscription.startDate)
  const rangeStart = parseDateIST(today).isAfter(parseDateIST(subscription.startDate))
    ? today
    : subscription.startDate;

  // Range end is min(today + 7, subscription.endDate)
  const rangeEnd = parseDateIST(sevenDaysAhead).isBefore(parseDateIST(subscription.endDate))
    ? sevenDaysAhead
    : subscription.endDate;

  if (parseDateIST(rangeStart).isAfter(parseDateIST(rangeEnd))) {
    return 0;
  }

  // Determine meal types to generate
  const mealTypes = plan.mealType === 'both' ? ['lunch', 'dinner'] : [plan.mealType];

  let currentDate = rangeStart;
  let count = 0;

  while (parseDateIST(currentDate).isSameOrBefore(parseDateIST(rangeEnd))) {
    const weekday = getDayOfWeekIST(currentDate);

    // Only generate on days included in plan
    if (plan.daysOfWeek.includes(weekday)) {
      // Check if date falls in any subscription pause ranges
      const isPaused = (subscription.pauses || []).some((pause) =>
        isDateInRange(currentDate, pause.from, pause.to)
      );

      for (const mealType of mealTypes) {
        // Upsert meal instance using atomic findOneAndUpdate with $setOnInsert to be strictly idempotent
        const updateDoc = {
          $setOnInsert: {
            subscriptionId: subscription._id,
            customerId: subscription.customerId,
            providerId: subscription.providerId,
            planId: subscription.planId,
            date: currentDate,
            mealType,
            diet: plan.diet,
            area: subscription.address.area,
            price: plan.pricePerMeal, // Snapshotted at generation time
            status: isPaused ? 'skipped' : 'scheduled',
            skipReason: isPaused ? 'pause' : null,
            billable: true,
          },
        };

        const result = await MealInstance.findOneAndUpdate(
          {
            subscriptionId: subscription._id,
            date: currentDate,
            mealType,
          },
          updateDoc,
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        if (result) count++;
      }
    }

    currentDate = addDaysIST(currentDate, 1);
  }

  return count;
};

/**
 * Run meal generator for all currently active subscriptions across the platform (used in daily cron)
 */
export const generateMealsForAllActiveSubscriptions = async () => {
  const activeSubscriptions = await Subscription.find({ status: 'active' });
  let totalProcessed = 0;

  for (const sub of activeSubscriptions) {
    try {
      const processed = await generateMealsForSubscription(sub);
      totalProcessed += processed;
    } catch (err) {
      console.error(`[MealGenerator] Error for subscription ${sub._id}:`, err);
    }
  }

  return { activeSubscriptionsCount: activeSubscriptions.length, totalProcessed };
};
