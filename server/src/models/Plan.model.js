import mongoose from 'mongoose';

const planSchema = new mongoose.Schema(
  {
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Provider',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Plan name is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    mealType: {
      type: String,
      enum: ['lunch', 'dinner', 'both'],
      required: true,
    },
    diet: {
      type: String,
      enum: ['veg', 'nonveg'],
      required: true,
    },
    pricePerMeal: {
      type: Number,
      required: true,
      min: [1, 'Price per meal must be at least 1'],
      validate: {
        validator: Number.isInteger,
        message: 'Price must be an integer (in rupees)',
      },
    },
    daysOfWeek: {
      type: [Number],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length >= 1 && v.every((day) => day >= 0 && day <= 6);
        },
        message: 'Plan must include at least one valid day of week (0 to 6)',
      },
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const Plan = mongoose.model('Plan', planSchema);
export default Plan;
