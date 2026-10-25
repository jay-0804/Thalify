import mongoose from 'mongoose';

const deliveryTaskSchema = new mongoose.Schema(
  {
    mealInstanceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MealInstance',
      required: true,
      unique: true,
    },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Provider',
      required: true,
      index: true,
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
    area: {
      type: String,
      required: true,
      trim: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    addressLine: {
      type: String,
      required: true,
    },
    landmark: {
      type: String,
      default: '',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'delivered', 'failed'],
      default: 'pending',
      index: true,
    },
    failureReason: {
      type: String,
      enum: ['customer_unavailable', 'provider_fault', null],
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

deliveryTaskSchema.index({ providerId: 1, date: 1, mealType: 1, area: 1 });

export const DeliveryTask = mongoose.model('DeliveryTask', deliveryTaskSchema);
export default DeliveryTask;
