import { z } from 'zod';

export const createSubscriptionSchema = z.object({
  planId: z.string().min(1, 'planId is required'),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be formatted YYYY-MM-DD'),
  durationDays: z.union([z.literal(7), z.literal(15), z.literal(30)]),
  address: z.object({
    line: z.string().min(3, 'Address line must be at least 3 characters'),
    area: z.string().min(1, 'Delivery area is required'),
    landmark: z.string().optional(),
  }),
});

export const pauseSubscriptionSchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'From date must be YYYY-MM-DD'),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'To date must be YYYY-MM-DD'),
});

export const recordPaymentSchema = z.object({
  subscriptionId: z.string().min(1, 'subscriptionId is required'),
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must be YYYY-MM'),
  amount: z.number().int().min(1, 'Amount must be at least 1 rupee'),
  method: z.enum(['upi', 'cash', 'other']).default('upi'),
  note: z.string().optional(),
});

export const assignDeliverySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  mealType: z.enum(['lunch', 'dinner']),
  area: z.string().min(1, 'Area is required'),
  staffId: z.string().min(1, 'staffId is required'),
});

export const updateTaskStatusSchema = z.object({
  status: z.enum(['delivered', 'failed']),
  failureReason: z.enum(['customer_unavailable', 'provider_fault']).optional(),
});
