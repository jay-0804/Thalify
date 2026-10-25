import { Router } from 'express';
import { listProviders, getProviderDetails } from '../controllers/public.controller.js';
import { validateObjectId } from '../middleware/validate.js';

const router = Router();

router.get('/', listProviders);
router.get('/:id', validateObjectId('id'), getProviderDetails);

export default router;
