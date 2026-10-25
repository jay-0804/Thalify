import { Router } from 'express';
import { getCustomerBill } from '../controllers/billing.controller.js';
import { auth } from '../middleware/auth.js';
import { validateObjectId } from '../middleware/validate.js';

const router = Router();

router.get('/:subscriptionId', auth, validateObjectId('subscriptionId'), getCustomerBill);

export default router;
