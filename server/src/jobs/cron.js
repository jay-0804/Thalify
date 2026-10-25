import cron from 'node-cron';
import { generateMealsForAllActiveSubscriptions } from '../services/mealGenerator.service.js';
import { generateDeliveryTasks } from '../services/delivery.service.js';
import { Provider } from '../models/Provider.model.js';
import { Subscription } from '../models/Subscription.model.js';
import { getTodayIST, parseDateIST, TIMEZONE } from '../utils/dates.js';

export const initCronJobs = () => {
  // 1. 00:05 daily: Extend 7-day horizon for active subscriptions
  cron.schedule(
    '5 0 * * *',
    async () => {
      const startTime = Date.now();
      console.log('[Cron Job] 00:05 - Extending 7-day meal horizon for active subscriptions...');
      try {
        const result = await generateMealsForAllActiveSubscriptions();
        const duration = Date.now() - startTime;
        console.log(
          `[Cron Job] 00:05 Completed in ${duration}ms. Active subs: ${result.activeSubscriptionsCount}, processed meals: ${result.totalProcessed}`
        );
      } catch (err) {
        console.error('[Cron Job Error] 00:05 Horizon Extension Failed:', err);
      }
    },
    { timezone: TIMEZONE }
  );

  // 2. 00:10 daily: Mark expired subscriptions completed
  cron.schedule(
    '10 0 * * *',
    async () => {
      const startTime = Date.now();
      const today = getTodayIST();
      console.log(`[Cron Job] 00:10 - Checking subscriptions completed before ${today}...`);
      try {
        const expired = await Subscription.updateMany(
          {
            status: 'active',
            endDate: { $lt: today },
          },
          {
            $set: { status: 'completed' },
          }
        );
        const duration = Date.now() - startTime;
        console.log(`[Cron Job] 00:10 Completed in ${duration}ms. Marked completed: ${expired.modifiedCount}`);
      } catch (err) {
        console.error('[Cron Job Error] 00:10 Mark Completed Failed:', err);
      }
    },
    { timezone: TIMEZONE }
  );

  // 3. 06:00 daily: Generate today's delivery tasks for all active providers
  cron.schedule(
    '0 6 * * *',
    async () => {
      const startTime = Date.now();
      const today = getTodayIST();
      console.log(`[Cron Job] 06:00 - Generating delivery tasks for ${today}...`);
      try {
        const providers = await Provider.find({ isActive: true });
        let totalCreated = 0;

        for (const p of providers) {
          const res = await generateDeliveryTasks(p._id, today);
          totalCreated += res.created;
        }

        const duration = Date.now() - startTime;
        console.log(
          `[Cron Job] 06:00 Completed in ${duration}ms. Created ${totalCreated} delivery tasks across ${providers.length} providers.`
        );
      } catch (err) {
        console.error('[Cron Job Error] 06:00 Delivery Task Generation Failed:', err);
      }
    },
    { timezone: TIMEZONE }
  );

  console.log('[Cron] Scheduled daily background jobs initialized (Asia/Kolkata)');
};
