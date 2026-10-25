import mongoose from 'mongoose';
import { DeliveryTask } from '../models/DeliveryTask.model.js';
import { MealInstance } from '../models/MealInstance.model.js';
import { User } from '../models/User.model.js';
import { generateDeliveryTasks, assignDeliveryStaff, updateDeliveryTaskStatus } from '../services/delivery.service.js';
import { getProviderForUser } from './provider.controller.js';
import { emitDeliveryUpdate } from '../sockets/index.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getTodayIST } from '../utils/dates.js';

// Provider: trigger delivery task generation manually
export const triggerGenerateTasks = asyncHandler(async (req, res) => {
  const provider = await getProviderForUser(req.user.id);
  const date = req.body.date || getTodayIST();

  const result = await generateDeliveryTasks(provider._id, date);
  res.status(200).json({ success: true, data: result });
});

// Provider: seed instant demo drops for demonstration & route dispatch testing
export const seedDemoDrops = asyncHandler(async (req, res) => {
  const provider = await getProviderForUser(req.user.id);
  const date = req.body.date || getTodayIST();

  // Find staff for this provider to assign tasks
  let staff = await User.findOne({ providerId: provider._id, role: 'delivery' });
  if (!staff) {
    staff = await User.findOne({ role: 'delivery' });
  }

  // Find or create scheduled meals for this provider
  let scheduledMeals = await MealInstance.find({
    providerId: provider._id,
    date,
    status: 'scheduled',
  });

  if (scheduledMeals.length === 0) {
    const demoCustomers = await User.find({ role: 'customer' }).limit(5);
    const areas = provider.deliveryAreas && provider.deliveryAreas.length > 0
      ? provider.deliveryAreas
      : ['Koramangala', 'HSR Layout', 'BTM Layout'];

    for (let i = 0; i < (demoCustomers.length || 4); i++) {
      const cust = demoCustomers[i] || { _id: new mongoose.Types.ObjectId(), name: `Customer ${i + 1}`, phone: '9876543220' };
      const area = areas[i % areas.length];
      const newMeal = await MealInstance.create({
        subscriptionId: new mongoose.Types.ObjectId(),
        customerId: cust._id,
        providerId: provider._id,
        date,
        mealType: i % 2 === 0 ? 'lunch' : 'dinner',
        diet: i % 3 === 0 ? 'nonveg' : 'veg',
        price: 95,
        area,
        status: 'scheduled',
      });
      scheduledMeals.push(newMeal);
    }
  }

  let created = 0;
  for (let i = 0; i < scheduledMeals.length; i++) {
    const meal = scheduledMeals[i];
    const existing = await DeliveryTask.findOne({ mealInstanceId: meal._id });
    if (existing) continue;

    const user = await User.findById(meal.customerId);

    await DeliveryTask.create({
      mealInstanceId: meal._id,
      providerId: meal.providerId,
      date: meal.date,
      mealType: meal.mealType,
      area: meal.area || 'Koramangala',
      customerName: user ? user.name : `Customer ${i + 1}`,
      phone: user ? user.phone : '9876543220',
      addressLine: `Flat ${101 + i * 15}, Tower B, Lotus Apartments`,
      landmark: 'Near Main Gate',
      status: 'pending',
      assignedTo: staff ? staff._id : null,
    });
    created++;
  }

  const allTasks = await DeliveryTask.find({ providerId: provider._id, date })
    .populate('assignedTo', 'name phone')
    .sort({ area: 1, mealType: 1 });

  res.status(200).json({
    success: true,
    data: {
      message: `Seeded ${created} delivery tasks for ${date}`,
      created,
      tasks: allTasks,
    },
  });
});

// Provider: get delivery tasks grouped by area & mealType
export const getProviderDeliveryTasks = asyncHandler(async (req, res) => {
  const provider = await getProviderForUser(req.user.id);
  const date = req.query.date || getTodayIST();

  const tasks = await DeliveryTask.find({ providerId: provider._id, date })
    .populate('assignedTo', 'name phone')
    .populate('mealInstanceId', 'diet price')
    .sort({ area: 1, mealType: 1 });

  // Group by area
  const groupedByArea = {};
  for (const task of tasks) {
    if (!groupedByArea[task.area]) {
      groupedByArea[task.area] = [];
    }
    groupedByArea[task.area].push(task);
  }

  res.status(200).json({
    success: true,
    data: {
      date,
      totalTasks: tasks.length,
      groupedByArea,
      tasks,
    },
  });
});

// Provider: assign delivery tasks
export const assignStaff = asyncHandler(async (req, res) => {
  const provider = await getProviderForUser(req.user.id);
  const { date, mealType, area, staffId } = req.body;

  const result = await assignDeliveryStaff(provider._id, { date, mealType, area, staffId });

  res.status(200).json({
    success: true,
    data: {
      message: `Assigned ${result.modifiedCount} tasks successfully`,
      ...result,
    },
  });
});

// Delivery Staff: get today's assigned drops
export const getMyTodayDrops = asyncHandler(async (req, res) => {
  const staffUserId = req.user.id;
  const today = getTodayIST();

  const tasks = await DeliveryTask.find({
    assignedTo: staffUserId,
    date: today,
  }).populate('mealInstanceId', 'diet price mealType').sort({ area: 1, status: -1 });

  // Group by area
  const groupedByArea = {};
  for (const task of tasks) {
    if (!groupedByArea[task.area]) {
      groupedByArea[task.area] = [];
    }
    groupedByArea[task.area].push(task);
  }

  res.status(200).json({
    success: true,
    data: {
      date: today,
      totalDrops: tasks.length,
      pendingCount: tasks.filter((t) => t.status === 'pending').length,
      deliveredCount: tasks.filter((t) => t.status === 'delivered').length,
      failedCount: tasks.filter((t) => t.status === 'failed').length,
      groupedByArea,
      tasks,
    },
  });
});

// Delivery Staff: update task status (delivered / failed)
export const updateDropStatus = asyncHandler(async (req, res) => {
  const staffUserId = req.user.id;
  const taskId = req.params.id;
  const { status, failureReason } = req.body;

  const { task, meal } = await updateDeliveryTaskStatus(taskId, staffUserId, {
    status,
    failureReason,
  });

  // Emit WebSocket real-time update to customer and provider (Section 21)
  if (meal) {
    emitDeliveryUpdate({
      customerId: meal.customerId?.toString(),
      providerId: meal.providerId?.toString(),
      mealId: meal._id,
      subscriptionId: meal.subscriptionId,
      date: meal.date,
      mealType: meal.mealType,
      status: meal.status,
      failureReason: meal.failureReason,
      completedAt: task.completedAt,
    });
  }

  res.status(200).json({
    success: true,
    data: {
      message: `Delivery drop marked as ${status}`,
      task,
      meal,
    },
  });
});
