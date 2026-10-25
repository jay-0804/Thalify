import { Router } from 'express';
import { getMyTodayDrops, updateDropStatus } from '../controllers/delivery.controller.js';
import { auth } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import { validate, validateObjectId } from '../middleware/validate.js';
import { updateTaskStatusSchema } from '../validations/subscription.validation.js';

const router = Router();

// Only delivery staff
router.use(auth, requireRole('delivery'));

router.get('/today', getMyTodayDrops);
router.patch('/tasks/:id', validateObjectId('id'), validate({ body: updateTaskStatusSchema }), updateDropStatus);

export default router;
