import { MealInstance } from '../models/MealInstance.model.js';
import { Payment } from '../models/Payment.model.js';
import { Subscription } from '../models/Subscription.model.js';
import { User } from '../models/User.model.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * Calculates billing summary and line items for a subscription in a given month (BR-11)
 * @param {string} subscriptionId
 * @param {string} monthStr - Format YYYY-MM
 */
export const calculateMonthlyBill = async (subscriptionId, monthStr) => {
  // Find all meal instances for this subscription that fall in monthStr (matching regex ^YYYY-MM)
  const dateRegex = new RegExp(`^${monthStr}`);

  const meals = await MealInstance.find({
    subscriptionId,
    date: { $regex: dateRegex },
  }).sort({ date: 1, mealType: 1 }).lean();

  let charged = 0;
  let credits = 0;

  const lineItems = meals.map((m) => {
    let itemCharge = 0;
    let isBillable = false;
    let description = '';

    if (m.status === 'delivered') {
      itemCharge = m.price;
      isBillable = true;
      description = `Delivered ${m.mealType} (${m.diet})`;
      charged += itemCharge;
    } else if (m.status === 'failed') {
      if (m.billable) {
        itemCharge = m.price;
        isBillable = true;
        description = `Failed (${m.failureReason || 'customer_unavailable'}) - Billable`;
        charged += itemCharge;
      } else {
        credits += m.price;
        description = `Failed (${m.failureReason || 'provider_fault'}) - Credited (₹0)`;
      }
    } else if (m.status === 'skipped') {
      credits += m.price;
      description = `Skipped (${m.skipReason || 'user'}) - Saved`;
    } else if (m.status === 'cancelled') {
      credits += m.price;
      description = 'Cancelled - Saved';
    } else {
      description = `Scheduled ${m.mealType} (${m.diet})`;
    }

    return {
      mealId: m._id,
      date: m.date,
      mealType: m.mealType,
      diet: m.diet,
      status: m.status,
      skipReason: m.skipReason,
      failureReason: m.failureReason,
      price: m.price,
      itemCharge,
      isBillable,
      description,
    };
  });

  // Calculate total payments made for this subscription in this month
  const payments = await Payment.find({
    subscriptionId,
    month: monthStr,
  }).sort({ createdAt: -1 }).lean();

  const paid = payments.reduce((sum, p) => sum + p.amount, 0);
  const balance = Math.max(0, charged - paid);

  return {
    month: monthStr,
    charged,
    credits,
    paid,
    balance,
    payments,
    lineItems,
  };
};

/**
 * Record a payment for a subscription and month, verifying overpayment constraint (BR-12)
 */
export const recordPaymentWithCheck = async (providerId, userId, { subscriptionId, month, amount, method, note }) => {
  const subscription = await Subscription.findById(subscriptionId);
  if (!subscription) {
    throw ApiError.notFound('Subscription not found');
  }

  // Authorization check (BR-12, BR-13)
  if (subscription.providerId.toString() !== providerId.toString()) {
    throw ApiError.forbidden('You can only record payments for your own subscriptions');
  }

  // Calculate current balance before this payment
  const currentBill = await calculateMonthlyBill(subscriptionId, month);

  // BR-12 & Acceptance Test 17: amount must not exceed balance
  if (amount > currentBill.balance) {
    throw ApiError.overpayment(
      `Payment amount of ₹${amount} exceeds the outstanding balance of ₹${currentBill.balance}`,
      {
        currentBalance: currentBill.balance,
        attemptedAmount: amount,
      }
    );
  }

  const payment = await Payment.create({
    subscriptionId,
    providerId,
    month,
    amount,
    method: method || 'upi',
    note: note || '',
    recordedBy: userId,
  });

  const updatedBill = await calculateMonthlyBill(subscriptionId, month);

  return {
    payment,
    updatedBill,
  };
};
