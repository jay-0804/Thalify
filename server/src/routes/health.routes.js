import { Router } from 'express';
import { nowIST, getTodayIST } from '../utils/dates.js';

const router = Router();

router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'healthy',
      service: 'TiffinLoop API',
      serverTimeIST: nowIST().format('YYYY-MM-DD HH:mm:ss [IST]'),
      todayIST: getTodayIST(),
      uptime: process.uptime(),
    },
  });
});

export default router;
