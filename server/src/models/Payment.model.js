import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription',
      required: true,
      index: true,
    },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Provider',
      required: true,
      index: true,
    },
    month: {
      type: String,
      required: true,
      match: [/^\d{4}-\d{2}$/, 'Month must be formatted as YYYY-MM'],
    },
    amount: {
      type: Number,
      required: true,
      min: [1, 'Amount must be at least 1 rupee'],
      validate: {
        validator: Number.isInteger,
        message: 'Payment amount must be an integer (in rupees)',
      },
    },
    method: {
      type: String,
      enum: ['upi', 'cash', 'other'],
      default: 'upi',
    },
    note: {
      type: String,
      default: '',
      trim: true,
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

paymentSchema.index({ subscriptionId: 1, month: 1 });

export const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
