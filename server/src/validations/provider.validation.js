import { z } from 'zod';

export const updateProfileSchema = z.object({
  businessName: z.string().min(2, 'Business name must be at least 2 characters').optional(),
  description: z.string().optional(),
  contactPhone: z.string().regex(/^\d{10}$/, 'Phone number must be 10 digits').optional(),
  deliveryAreas: z.array(z.string().min(1)).min(1, 'At least one delivery area required').optional(),
  cutoffTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Cutoff time must be HH:mm (e.g. 20:00)').optional(),
  isActive: z.boolean().optional(),
});

export const planSchema = z.object({
  name: z.string().min(2, 'Plan name must be at least 2 characters'),
  description: z.string().optional(),
  mealType: z.enum(['lunch', 'dinner', 'both']),
  diet: z.enum(['veg', 'nonveg']),
  pricePerMeal: z.number().int().min(1, 'Price per meal must be at least 1 rupee'),
  daysOfWeek: z.array(z.number().int().min(0).max(6)).min(1, 'Select at least one day of week'),
});

export const updatePlanSchema = planSchema.partial();

export const menuUpsertSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  mealType: z.enum(['lunch', 'dinner']),
  dishes: z.array(z.string().min(1)).min(1, 'Provide at least one dish name'),
});

export const createStaffSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(60),
  email: z.string().email('Please provide a valid email').toLowerCase(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().regex(/^\d{10}$/, 'Phone number must be 10 digits'),
});
