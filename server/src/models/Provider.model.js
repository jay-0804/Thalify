import mongoose from 'mongoose';

const providerSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    businessName: {
      type: String,
      required: [true, 'Business name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    contactPhone: {
      type: String,
      trim: true,
      default: '',
    },
    deliveryAreas: {
      type: [String],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length >= 1;
        },
        message: 'At least one delivery area is required',
      },
      required: true,
    },
    cutoffTime: {
      type: String,
      default: '20:00',
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Cutoff time must be HH:mm format (e.g. 20:00)'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const Provider = mongoose.model('Provider', providerSchema);
export default Provider;
