import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(60, 'Name cannot exceed 60 characters'),
  email: z.string().email('Please provide a valid email').toLowerCase(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().regex(/^\d{10}$/, 'Phone number must be exactly 10 digits'),
  role: z.enum(['customer', 'provider'], {
    errorMap: () => ({ message: 'Public registration allows only "customer" or "provider" roles' }),
  }),
  businessName: z.string().min(2, 'Business name must be at least 2 characters').optional(),
  deliveryAreas: z.array(z.string().min(1)).min(1, 'At least one delivery area is required').optional(),
  description: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.role === 'provider') {
    if (!data.businessName || data.businessName.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['businessName'],
        message: 'businessName is required for provider registration',
      });
    }
    if (!data.deliveryAreas || data.deliveryAreas.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['deliveryAreas'],
        message: 'deliveryAreas is required and must contain at least one area for provider registration',
      });
    }
  }
});

export const loginSchema = z.object({
  email: z.string().email('Please provide a valid email').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});
