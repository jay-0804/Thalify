import mongoose from 'mongoose';

const pauseSchema = new mongoose.Schema(
  {
    from: {
      type: String,
      required: true,
      match: [/^\d{4}-\d{2}-\d{2}$/, 'From date must be YYYY-MM-DD'],
    },
    to: {
      type: String,
      required: true,
      match: [/^\d{4}-\d{2}-\d{2}$/, 'To date must be YYYY-MM-DD'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const subscriptionSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Provider',
      required: true,
      index: true,
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plan',
      required: true,
      index: true,
    },
    startDate: {
      type: String,
      required: true,
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Start date must be YYYY-MM-DD'],
    },
    endDate: {
      type: String,
      required: true,
      match: [/^\d{4}-\d{2}-\d{2}$/, 'End date must be YYYY-MM-DD'],
    },
    durationDays: {
      type: Number,
      enum: [7, 15, 30],
      required: true,
    },
    address: {
      line: { type: String, required: true, trim: true },
      area: { type: String, required: true, trim: true },
      landmark: { type: String, default: '', trim: true },
    },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'completed'],
      default: 'active',
      index: true,
    },
    pauses: {
      type: [pauseSchema],
      default: [],
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export const Subscription = mongoose.model('Subscription', subscriptionSchema);
export default Subscription;
