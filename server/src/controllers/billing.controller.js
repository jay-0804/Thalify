import { Subscription } from '../models/Subscription.model.js';
import { User } from '../models/User.model.js';
import { calculateMonthlyBill, recordPaymentWithCheck } from '../services/billing.service.js';
import { getProviderForUser } from './provider.controller.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getTodayIST, getMonthString } from '../utils/dates.js';

export const getCustomerBill = asyncHandler(async (req, res) => {
  const { subscriptionId } = req.params;
  const month = req.query.month || getMonthString(getTodayIST());

  const subscription = await Subscription.findById(subscriptionId)
    .populate('planId', 'name pricePerMeal mealType diet')
    .populate('providerId', 'businessName contactPhone');

  if (!subscription) {
    throw ApiError.notFound('Subscription not found');
  }

  // Authorization: Customer must own subscription OR provider must own it
  if (
    subscription.customerId.toString() !== req.user.id.toString() &&
    subscription.providerId._id.toString() !== req.user.providerId
  ) {
    throw ApiError.forbidden('You do not have permission to view this bill');
  }

  const bill = await calculateMonthlyBill(subscriptionId, month);

  res.status(200).json({
    success: true,
    data: {
      subscription,
      bill,
    },
  });
});

export const getProviderBillingOverview = asyncHandler(async (req, res) => {
  const provider = await getProviderForUser(req.user.id);
  const month = req.query.month || getMonthString(getTodayIST());

  // Find all subscriptions of this provider
  const subscriptions = await Subscription.find({ providerId: provider._id })
    .populate('customerId', 'name email phone')
    .populate('planId', 'name mealType diet pricePerMeal')
    .sort({ createdAt: -1 });

  const rows = [];
  let totalCharged = 0;
  let totalPaid = 0;
  let totalBalance = 0;

  for (const sub of subscriptions) {
    const bill = await calculateMonthlyBill(sub._id, month);
    totalCharged += bill.charged;
    totalPaid += bill.paid;
    totalBalance += bill.balance;

    rows.push({
      subscriptionId: sub._id,
      customer: sub.customerId,
      plan: sub.planId,
      status: sub.status,
      startDate: sub.startDate,
      endDate: sub.endDate,
      charged: bill.charged,
      credits: bill.credits,
      paid: bill.paid,
      balance: bill.balance,
    });
  }

  res.status(200).json({
    success: true,
    data: {
      month,
      summary: {
        totalSubscribers: subscriptions.length,
        totalCharged,
        totalPaid,
        totalBalance,
      },
      subscribers: rows,
    },
  });
});

export const recordPayment = asyncHandler(async (req, res) => {
  const provider = await getProviderForUser(req.user.id);
  const { subscriptionId, month, amount, method, note } = req.body;

  const result = await recordPaymentWithCheck(provider._id, req.user.id, {
    subscriptionId,
    month,
    amount,
    method,
    note,
  });

  res.status(201).json({
    success: true,
    data: {
      message: 'Payment recorded successfully',
      payment: result.payment,
      updatedBill: result.updatedBill,
    },
  });
});
