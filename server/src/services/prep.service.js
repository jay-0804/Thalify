import { MealInstance } from '../models/MealInstance.model.js';
import { Provider } from '../models/Provider.model.js';
import { isBeforeDeadline } from '../utils/dates.js';

/**
 * Calculates kitchen prep counts for a provider on a specific date (BR-7)
 * @param {string} providerId
 * @param {string} date - YYYY-MM-DD
 */
export const getKitchenPrepSummary = async (providerId, date) => {
  const provider = await Provider.findById(providerId);
  const cutoffTime = provider ? provider.cutoffTime : '20:00';

  // If now is past cutoff deadline, counts are locked (numbers are final)
  const isLocked = !isBeforeDeadline(date, cutoffTime);

  // Active meals being cooked/delivered/served: scheduled, delivered, failed
  const activeMeals = await MealInstance.find({
    providerId,
    date,
    status: { $in: ['scheduled', 'delivered', 'failed'] },
  }).lean();

  // Skipped or cancelled count
  const skippedCount = await MealInstance.countDocuments({
    providerId,
    date,
    status: { $in: ['skipped', 'cancelled'] },
  });

  // Calculate totals per mealType
  const totals = {
    lunch: 0,
    dinner: 0,
    veg: 0,
    nonveg: 0,
    total: activeMeals.length,
  };

  // Group by (mealType, diet, area)
  const breakdownMap = {};

  for (const meal of activeMeals) {
    if (meal.mealType === 'lunch') totals.lunch++;
    if (meal.mealType === 'dinner') totals.dinner++;
    if (meal.diet === 'veg') totals.veg++;
    if (meal.diet === 'nonveg') totals.nonveg++;

    const key = `${meal.mealType}_${meal.diet}_${meal.area}`;
    if (!breakdownMap[key]) {
      breakdownMap[key] = {
        mealType: meal.mealType,
        diet: meal.diet,
        area: meal.area,
        count: 0,
      };
    }
    breakdownMap[key].count++;
  }

  const breakdown = Object.values(breakdownMap).sort((a, b) =>
    a.mealType.localeCompare(b.mealType) || a.diet.localeCompare(b.diet) || a.area.localeCompare(b.area)
  );

  return {
    date,
    cutoffTime,
    isLocked,
    skippedCount,
    totals,
    breakdown,
  };
};
