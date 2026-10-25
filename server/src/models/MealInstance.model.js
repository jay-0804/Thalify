import mongoose from 'mongoose';

const mealInstanceSchema = new mongoose.Schema(
  {
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription',
      required: true,
      index: true,
    },
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
    },
    date: {
      type: String,
      required: true,
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'],
    },
    mealType: {
      type: String,
      enum: ['lunch', 'dinner'],
      required: true,
    },
    diet: {
      type: String,
      enum: ['veg', 'nonveg'],
      required: true,
    },
    area: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      validate: {
        validator: Number.isInteger,
        message: 'Price must be an integer (in rupees)',
      },
    },
    status: {
      type: String,
      enum: ['scheduled', 'skipped', 'cancelled', 'delivered', 'failed'],
      default: 'scheduled',
      index: true,
    },
    skipReason: {
      type: String,
      enum: ['user', 'pause', null],
      default: null,
    },
    failureReason: {
      type: String,
      enum: ['customer_unavailable', 'provider_fault', null],
      default: null,
    },
    billable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Unique index makes meal generation strictly idempotent
mealInstanceSchema.index({ subscriptionId: 1, date: 1, mealType: 1 }, { unique: true });

// Optimized compound indexes for Kitchen Prep and Billing aggregation
mealInstanceSchema.index({ providerId: 1, date: 1, status: 1 });
mealInstanceSchema.index({ subscriptionId: 1, date: 1 });

export const MealInstance = mongoose.model('MealInstance', mealInstanceSchema);
export default MealInstance;
