import { Router } from 'express';
import { skipMeal, unskipMeal } from '../controllers/meal.controller.js';
import { auth } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import { validateObjectId } from '../middleware/validate.js';

const router = Router();

// Only customers can skip/unskip meals
router.use(auth, requireRole('customer'));

router.post('/:id/skip', validateObjectId('id'), skipMeal);
router.post('/:id/unskip', validateObjectId('id'), unskipMeal);

export default router;
