import { Router } from 'express';
import { getCustomerBill } from '../controllers/billing.controller.js';
import { createRazorpayOrder, verifyRazorpayPayment } from '../controllers/razorpay.controller.js';
import { auth } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import { validateObjectId } from '../middleware/validate.js';

const router = Router();

// Customer views monthly bill
router.get('/:subscriptionId', auth, validateObjectId('subscriptionId'), getCustomerBill);

// Razorpay Payment Routes (Customer only)
router.post('/razorpay/order', auth, requireRole('customer'), createRazorpayOrder);
router.post('/razorpay/verify', auth, requireRole('customer'), verifyRazorpayPayment);

export default router;
