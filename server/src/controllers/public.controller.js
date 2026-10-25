import { Provider } from '../models/Provider.model.js';
import { Plan } from '../models/Plan.model.js';
import { MenuItem } from '../models/MenuItem.model.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getTodayIST, addDaysIST } from '../utils/dates.js';

export const listProviders = asyncHandler(async (req, res) => {
  const { area } = req.query;
  const filter = { isActive: true };

  if (area) {
    filter.deliveryAreas = { $regex: new RegExp(`^${area.trim()}$`, 'i') };
  }

  const providers = await Provider.find(filter).lean();

  // Attach plan count for each active provider
  const providerList = await Promise.all(
    providers.map(async (p) => {
      const planCount = await Plan.countDocuments({ providerId: p._id, isActive: true });
      return {
        ...p,
        planCount,
      };
    })
  );

  res.status(200).json({ success: true, data: { providers: providerList } });
});

export const getProviderDetails = asyncHandler(async (req, res) => {
  const provider = await Provider.findOne({ _id: req.params.id, isActive: true });
  if (!provider) {
    throw ApiError.notFound('Provider not found or currently inactive');
  }

  const plans = await Plan.find({ providerId: provider._id, isActive: true }).lean();

  // Menu for the next 7 days
  const today = getTodayIST();
  const nextWeek = addDaysIST(today, 7);

  const menu = await MenuItem.find({
    providerId: provider._id,
    date: { $gte: today, $lte: nextWeek },
  }).sort({ date: 1, mealType: 1 }).lean();

  res.status(200).json({
    success: true,
    data: {
      provider,
      plans,
      menu,
    },
  });
});
