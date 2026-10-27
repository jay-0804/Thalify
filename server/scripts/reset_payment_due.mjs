import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from '../src/config/db.js';
import { Payment, User, Subscription } from '../src/models/index.js';
import { calculateMonthlyBill } from '../src/services/billing.service.js';

async function reset() {
  await connectDB();
  const user = await User.findOne({ email: 'customer@demo.com' });
  const sub = await Subscription.findOne({ customerId: user._id });

  // Delete all test Razorpay payments so balance is due
  const del = await Payment.deleteMany({
    subscriptionId: sub._id,
    note: { $regex: /Razorpay/i },
  });
  console.log('Deleted Razorpay test payments:', del.deletedCount);

  const bill = await calculateMonthlyBill(sub._id, '2026-10');
  console.log('✅ Outstanding Due Balance for Rohan:', bill.balance);
  console.log('   Charged:', bill.charged, 'Paid:', bill.paid, 'Credits:', bill.credits);
  process.exit(0);
}

reset().catch((e) => {
  console.error(e);
  process.exit(1);
});
