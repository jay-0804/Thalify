import { Provider } from '../models/Provider.model.js';
import { MealInstance } from '../models/MealInstance.model.js';
import { ApiError } from '../utils/ApiError.js';
import {
  nowIST,
  getSkipDeadline,
  isBeforeDeadline,
  parseDateIST,
} from '../utils/dates.js';

/**
 * Service to validate and execute cutoff rules for meal skipping, unskipping, pausing, and kitchen prep lock state
 */

/**
 * Checks if a meal can be skipped/modified based on provider cutoff time in IST
 * @param {string} mealDateStr - YYYY-MM-DD
 * @param {string} providerCutoffTime - HH:mm
 * @returns {{ canSkip: boolean, deadlineIST: string, nowIST: string }}
 */
export const checkCutoffStatus = (mealDateStr, providerCutoffTime = '20:00') => {
  const deadline = getSkipDeadline(mealDateStr, providerCutoffTime);
  const current = nowIST();
  const canSkip = current.isBefore(deadline);

  return {
    canSkip,
    deadlineIST: deadline.format('YYYY-MM-DD HH:mm:ss [IST]'),
    nowIST: current.format('YYYY-MM-DD HH:mm:ss [IST]'),
  };
};

/**
 * Atomically skips a meal instance if before cutoff and currently in scheduled state
 */
export const skipMealWithCutoff = async (mealInstanceId, customerId) => {
  const meal = await MealInstance.findById(mealInstanceId);
  if (!meal) {
    throw ApiError.notFound('Meal instance not found');
  }

  // Authorization check (BR-13)
  if (meal.customerId.toString() !== customerId.toString()) {
    throw ApiError.forbidden('You do not own this meal');
  }

  // State check (Acceptance Test 10)
  if (meal.status === 'delivered' || meal.status === 'failed') {
    throw ApiError.invalidState(`Cannot skip a meal that has already been ${meal.status}`);
  }
  if (meal.status === 'skipped') {
    throw ApiError.invalidState('Meal is already skipped');
  }
  if (meal.status !== 'scheduled') {
    throw ApiError.invalidState(`Cannot skip meal with status: ${meal.status}`);
  }

  // Server-authoritative cutoff verification (BR-4)
  const provider = await Provider.findById(meal.providerId);
  const cutoffTime = provider ? provider.cutoffTime : '20:00';
  const cutoffCheck = checkCutoffStatus(meal.date, cutoffTime);

  if (!cutoffCheck.canSkip) {
    throw ApiError.cutoffPassed(
      `Cutoff time of ${cutoffTime} on the day prior has passed for meal on ${meal.date}`,
      {
        deadline: cutoffCheck.deadlineIST,
        serverTime: cutoffCheck.nowIST,
      }
    );
  }

  // Concurrency-safe atomic transition (BR-4)
  const updatedMeal = await MealInstance.findOneAndUpdate(
    { _id: mealInstanceId, status: 'scheduled' },
    { status: 'skipped', skipReason: 'user' },
    { new: true }
  );

  if (!updatedMeal) {
    throw ApiError.invalidState('Meal status was concurrently modified by another request');
  }

  return { meal: updatedMeal, providerId: meal.providerId, date: meal.date };
};

/**
 * Atomically unskips a meal instance if before cutoff and was skipped by user
 */
export const unskipMealWithCutoff = async (mealInstanceId, customerId) => {
  const meal = await MealInstance.findById(mealInstanceId);
  if (!meal) {
    throw ApiError.notFound('Meal instance not found');
  }

  if (meal.customerId.toString() !== customerId.toString()) {
    throw ApiError.forbidden('You do not own this meal');
  }

  if (meal.status !== 'skipped' || meal.skipReason !== 'user') {
    throw ApiError.invalidState('Only user-skipped meals can be unskipped');
  }

  const provider = await Provider.findById(meal.providerId);
  const cutoffTime = provider ? provider.cutoffTime : '20:00';
  const cutoffCheck = checkCutoffStatus(meal.date, cutoffTime);

  if (!cutoffCheck.canSkip) {
    throw ApiError.cutoffPassed(
      `Cutoff time of ${cutoffTime} on the day prior has passed for meal on ${meal.date}`,
      {
        deadline: cutoffCheck.deadlineIST,
        serverTime: cutoffCheck.nowIST,
      }
    );
  }

  const updatedMeal = await MealInstance.findOneAndUpdate(
    { _id: mealInstanceId, status: 'skipped', skipReason: 'user' },
    { status: 'scheduled', skipReason: null },
    { new: true }
  );

  if (!updatedMeal) {
    throw ApiError.invalidState('Meal status was concurrently modified');
  }

  return { meal: updatedMeal, providerId: meal.providerId, date: meal.date };
};
