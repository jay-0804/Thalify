import { skipMealWithCutoff, unskipMealWithCutoff } from '../services/cutoff.service.js';
import { emitPrepChanged } from '../sockets/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const skipMeal = asyncHandler(async (req, res) => {
  const customerId = req.user.id;
  const mealId = req.params.id;

  const { meal, providerId, date } = await skipMealWithCutoff(mealId, customerId);

  // Notify provider dashboard to refresh prep headcount live (Section 21)
  emitPrepChanged(providerId.toString(), { date, mealId });

  res.status(200).json({
    success: true,
    data: {
      message: 'Meal skipped successfully. Amount credited towards bill.',
      meal,
    },
  });
});

export const unskipMeal = asyncHandler(async (req, res) => {
  const customerId = req.user.id;
  const mealId = req.params.id;

  const { meal, providerId, date } = await unskipMealWithCutoff(mealId, customerId);

  emitPrepChanged(providerId.toString(), { date, mealId });

  res.status(200).json({
    success: true,
    data: {
      message: 'Meal unskipped successfully and restored to cooking schedule.',
      meal,
    },
  });
});
