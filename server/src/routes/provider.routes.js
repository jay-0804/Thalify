import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  getPlans,
  createPlan,
  updatePlan,
  deletePlan,
  getMenu,
  upsertMenu,
  getStaff,
  createStaff,
  deleteStaff,
  getSubscribers,
  getPrepSummary,
  getAnalytics,
  getDashboardOverview,
} from '../controllers/provider.controller.js';
import {
  getProviderBillingOverview,
  recordPayment,
} from '../controllers/billing.controller.js';
import {
  triggerGenerateTasks,
  getProviderDeliveryTasks,
  assignStaff,
} from '../controllers/delivery.controller.js';
import { auth } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import { validate, validateObjectId } from '../middleware/validate.js';
import {
  updateProfileSchema,
  planSchema,
  updatePlanSchema,
  menuUpsertSchema,
  createStaffSchema,
} from '../validations/provider.validation.js';
import {
  recordPaymentSchema,
  assignDeliverySchema,
} from '../validations/subscription.validation.js';

const router = Router();

// Protect all provider routes
router.use(auth, requireRole('provider'));

// Dashboard Overview
router.get('/dashboard', getDashboardOverview);

// Profile
router.get('/profile', getProfile);
router.put('/profile', validate({ body: updateProfileSchema }), updateProfile);

// Plans
router.get('/plans', getPlans);
router.post('/plans', validate({ body: planSchema }), createPlan);
router.put('/plans/:id', validateObjectId('id'), validate({ body: updatePlanSchema }), updatePlan);
router.delete('/plans/:id', validateObjectId('id'), deletePlan);

// Menu
router.get('/menu', getMenu);
router.put('/menu', validate({ body: menuUpsertSchema }), upsertMenu);

// Staff
router.get('/staff', getStaff);
router.post('/staff', validate({ body: createStaffSchema }), createStaff);
router.delete('/staff/:id', validateObjectId('id'), deleteStaff);

// Subscribers
router.get('/subscribers', getSubscribers);

// Kitchen Prep
router.get('/prep', getPrepSummary);

// Delivery Dispatch
router.post('/delivery/generate', triggerGenerateTasks);
router.get('/delivery', getProviderDeliveryTasks);
router.post('/delivery/assign', validate({ body: assignDeliverySchema }), assignStaff);

// Billing & Payments
router.get('/billing', getProviderBillingOverview);
router.post('/billing/payments', validate({ body: recordPaymentSchema }), recordPayment);

// Analytics
router.get('/analytics', getAnalytics);

export default router;
