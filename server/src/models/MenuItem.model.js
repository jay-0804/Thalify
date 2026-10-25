import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema(
  {
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Provider',
      required: true,
      index: true,
    },
    date: {
      type: String,
      required: true,
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD'],
    },
    mealType: {
      type: String,
      enum: ['lunch', 'dinner'],
      required: true,
    },
    dishes: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

// Unique index to prevent duplicate menu entries for the same meal type on a given date
menuItemSchema.index({ providerId: 1, date: 1, mealType: 1 }, { unique: true });

export const MenuItem = mongoose.model('MenuItem', menuItemSchema);
export default MenuItem;
