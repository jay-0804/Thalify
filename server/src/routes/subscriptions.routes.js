import { Router } from 'express';
import {
  createSubscription,
  getMySubscriptions,
  getSubscriptionDetail,
  pauseSubscription,
  resumeSubscription,
  cancelSubscription,
} from '../controllers/subscription.controller.js';
import { auth } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import { validate, validateObjectId } from '../middleware/validate.js';
import {
  createSubscriptionSchema,
  pauseSubscriptionSchema,
} from '../validations/subscription.validation.js';

const router = Router();

// Customer only routes
router.post(
  '/',
  auth,
  requireRole('customer'),
  validate({ body: createSubscriptionSchema }),
  createSubscription
);

router.get('/mine', auth, requireRole('customer'), getMySubscriptions);

router.get('/:id', auth, validateObjectId('id'), getSubscriptionDetail);

router.post(
  '/:id/pause',
  auth,
  requireRole('customer'),
  validateObjectId('id'),
  validate({ body: pauseSubscriptionSchema }),
  pauseSubscription
);

router.post(
  '/:id/resume',
  auth,
  requireRole('customer'),
  validateObjectId('id'),
  validate({ body: pauseSubscriptionSchema }),
  resumeSubscription
);

router.post(
  '/:id/cancel',
  auth,
  requireRole('customer'),
  validateObjectId('id'),
  cancelSubscription
);

export default router;
