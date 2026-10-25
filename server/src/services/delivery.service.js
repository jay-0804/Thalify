import { DeliveryTask } from '../models/DeliveryTask.model.js';
import { MealInstance } from '../models/MealInstance.model.js';
import { User } from '../models/User.model.js';
import { Subscription } from '../models/Subscription.model.js';
import { ApiError } from '../utils/ApiError.js';
import { getTodayIST } from '../utils/dates.js';

/**
 * Generate delivery tasks for a provider on a specific date from scheduled meal instances (BR-8)
 * Idempotent: existing tasks are not duplicated because of unique index on mealInstanceId
 */
export const generateDeliveryTasks = async (providerId, date) => {
  const scheduledMeals = await MealInstance.find({
    providerId,
    date,
    status: 'scheduled',
  }).lean();

  let created = 0;

  for (const meal of scheduledMeals) {
    const existing = await DeliveryTask.findOne({ mealInstanceId: meal._id });
    if (existing) continue;

    const user = await User.findById(meal.customerId);
    const subscription = await Subscription.findById(meal.subscriptionId);

    const task = await DeliveryTask.create({
      mealInstanceId: meal._id,
      providerId: meal.providerId,
      date: meal.date,
      mealType: meal.mealType,
      area: meal.area,
      customerName: user ? user.name : 'Valued Customer',
      phone: user ? user.phone : '',
      addressLine: subscription ? subscription.address.line : '',
      landmark: subscription ? subscription.address.landmark : '',
      status: 'pending',
    });

    if (task) created++;
  }

  return { created, totalEligible: scheduledMeals.length };
};

/**
 * Provider assigns delivery staff by date, mealType, area (BR-9)
 */
export const assignDeliveryStaff = async (providerId, { date, mealType, area, staffId }) => {
  // Validate that staff belongs to this provider
  const staff = await User.findById(staffId);
  if (!staff || staff.role !== 'delivery' || staff.providerId?.toString() !== providerId.toString()) {
    throw ApiError.forbidden('Staff member does not belong to this provider');
  }

  const result = await DeliveryTask.updateMany(
    {
      providerId,
      date,
      mealType,
      area,
      status: 'pending',
    },
    {
      $set: { assignedTo: staff._id },
    }
  );

  return { modifiedCount: result.modifiedCount };
};

/**
 * Delivery staff marks task as delivered or failed (BR-10)
 */
export const updateDeliveryTaskStatus = async (taskId, staffUserId, { status, failureReason }) => {
  const task = await DeliveryTask.findById(taskId);
  if (!task) {
    throw ApiError.notFound('Delivery task not found');
  }

  // Authorization check: Only assigned staff can update (BR-10, Acceptance Test 14)
  if (!task.assignedTo || task.assignedTo.toString() !== staffUserId.toString()) {
    throw ApiError.forbidden('You are not assigned to this delivery task');
  }

  // Only today's tasks can be updated (IST)
  const today = getTodayIST();
  if (task.date !== today) {
    throw ApiError.invalidState(`Delivery tasks can only be updated on the scheduled day (${task.date} vs today ${today})`);
  }

  // Terminal state check (Acceptance Test 14)
  if (task.status !== 'pending') {
    throw ApiError.alreadyFinalized(`Task is already finalized with status: ${task.status}`);
  }

  if (status === 'failed' && !failureReason) {
    throw ApiError.badRequest('failureReason is required when marking delivery as failed');
  }

  // Atomically update task
  task.status = status;
  task.failureReason = status === 'failed' ? failureReason : null;
  task.completedAt = new Date();
  await task.save();

  // Atomically update associated MealInstance (BR-10, Acceptance Test 15)
  const meal = await MealInstance.findById(task.mealInstanceId);
  if (meal) {
    meal.status = status; // 'delivered' or 'failed'
    if (status === 'delivered') {
      meal.billable = true;
      meal.failureReason = null;
    } else if (status === 'failed') {
      meal.failureReason = failureReason;
      // BR-10 & 15: customer_unavailable is billable; provider_fault is NOT billable
      meal.billable = failureReason === 'customer_unavailable';
    }
    await meal.save();
  }

  return { task, meal };
};
