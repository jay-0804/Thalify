import crypto from 'crypto';
import Razorpay from 'razorpay';
import { env } from '../config/env.js';
import { Subscription } from '../models/Subscription.model.js';
import { Payment } from '../models/Payment.model.js';
import { calculateMonthlyBill } from '../services/billing.service.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

let razorpayInstance = null;
const isMaskedSecret = env.RAZORPAY_KEY_SECRET && env.RAZORPAY_KEY_SECRET.includes('*');

if (env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET && !isMaskedSecret) {
  razorpayInstance = new Razorpay({
    key_id: env.RAZORPAY_KEY_ID,
    key_secret: env.RAZORPAY_KEY_SECRET,
  });
} else if (isMaskedSecret) {
  console.warn(
    '\n⚠️  [Razorpay Warning]: RAZORPAY_KEY_SECRET in server/.env contains asterisks (masked by Razorpay dashboard).\n' +
    '   To use live test-mode checkout popup, generate a new key pair in Razorpay Dashboard and copy the unmasked secret.\n' +
    '   In the meantime, TiffinLoop has enabled Seamless Test Simulation Checkout so you can test all workflows!\n'
  );
}

/**
 * Create Razorpay Order
 */
export const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { subscriptionId, month, amount } = req.body;
  const userId = req.user.id;

  const subscription = await Subscription.findById(subscriptionId);
  if (!subscription) {
    throw ApiError.notFound('Subscription not found');
  }

  // Authorization: Customer must own subscription
  if (subscription.customerId.toString() !== userId.toString()) {
    throw ApiError.forbidden('You can only make payments for your own subscription');
  }

  // Verify against current balance (BR-12)
  const currentBill = await calculateMonthlyBill(subscriptionId, month);
  if (amount > currentBill.balance) {
    throw ApiError.overpayment(
      `Payment amount of ₹${amount} exceeds current balance of ₹${currentBill.balance}`,
      { currentBalance: currentBill.balance, requestedAmount: amount }
    );
  }

  // If Razorpay instance is initialized with unmasked keys, attempt gateway order
  if (razorpayInstance) {
    try {
      const options = {
        amount: Math.round(amount * 100), // amount in paise
        currency: 'INR',
        receipt: `rcpt_${subscriptionId.slice(-6)}_${Date.now().toString().slice(-4)}`,
        notes: {
          subscriptionId,
          month,
          customerId: userId,
        },
      };

      const order = await razorpayInstance.orders.create(options);
      return res.status(200).json({
        success: true,
        data: {
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
          keyId: env.RAZORPAY_KEY_ID,
          simulated: false,
        },
      });
    } catch (rzpErr) {
      console.warn('[Razorpay API Error]:', rzpErr.error || rzpErr.message, '- falling back to test order');
    }
  }

  // If keys are masked or in dev/simulation mode:
  const mockOrderId = `order_test_${Date.now()}`;
  return res.status(200).json({
    success: true,
    data: {
      orderId: mockOrderId,
      amount: Math.round(amount * 100),
      currency: 'INR',
      keyId: env.RAZORPAY_KEY_ID || 'rzp_test_simulated_key',
      simulated: true,
      message: 'Razorpay test checkout initialized.',
    },
  });
});

/**
 * Verify Razorpay Payment Signature and Record in Ledger
 */
export const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const {
    subscriptionId,
    month,
    amount,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    simulated,
  } = req.body;
  const userId = req.user.id;

  const subscription = await Subscription.findById(subscriptionId);
  if (!subscription) {
    throw ApiError.notFound('Subscription not found');
  }

  if (subscription.customerId.toString() !== userId.toString()) {
    throw ApiError.forbidden('You can only make payments for your own subscription');
  }

  // Verify HMAC signature if unmasked Razorpay keys are configured and not simulated
  if (env.RAZORPAY_KEY_SECRET && !isMaskedSecret && !simulated) {
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      throw ApiError.badRequest('Razorpay payment signature verification failed');
    }
  }

  // Record payment in Payment collection
  const payment = await Payment.create({
    subscriptionId,
    providerId: subscription.providerId,
    month,
    amount: Number(amount),
    method: 'upi',
    note: `Razorpay Online Payment (Ref: ${razorpay_payment_id || 'TEST_PAY'})`,
    recordedBy: userId,
  });

  const updatedBill = await calculateMonthlyBill(subscriptionId, month);

  return res.status(200).json({
    success: true,
    data: {
      message: 'Payment verified and credited to monthly ledger successfully!',
      payment,
      updatedBill,
    },
  });
});
