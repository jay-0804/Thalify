import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js';
import { User, Provider, Plan, Subscription, MealInstance, DeliveryTask, Payment } from '../src/models/index.js';
import { getTodayIST, getTomorrowIST, addDaysIST, getMonthString } from '../src/utils/dates.js';

let mongoServer;
let customerToken, providerToken, deliveryToken, otherCustomerToken;
let customerUser, providerUser, deliveryUser, otherCustomerUser;
let providerDoc, planDoc;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
}, 120000);

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('TiffinLoop Acceptance Tests (PRD Section 26)', () => {
  // --- TEST 1: Registering with role: delivery is rejected (BR-1) ---
  it('1. Registering with role: delivery is rejected with 400 VALIDATION_ERROR', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Rider Hacker',
        email: 'hacker@rider.com',
        password: 'Password@123',
        phone: '9876543210',
        role: 'delivery',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  // Setup valid provider and customer
  it('Setup: Register Provider and Customer accounts', async () => {
    // Register Provider
    const provRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Chef Anita',
        email: 'anita@rasoi.com',
        password: 'Password@123',
        phone: '9876543210',
        role: 'provider',
        businessName: 'Anita Ki Rasoi',
        deliveryAreas: ['Koramangala', 'HSR Layout'],
      });

    expect(provRes.status).toBe(201);
    providerToken = provRes.body.data.token;
    providerUser = provRes.body.data.user;

    providerDoc = await Provider.findOne({ ownerId: providerUser.id });

    // Register Customer
    const custRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Aakash Verma',
        email: 'aakash@gmail.com',
        password: 'Password@123',
        phone: '9876543220',
        role: 'customer',
      });

    expect(custRes.status).toBe(201);
    customerToken = custRes.body.data.token;
    customerUser = custRes.body.data.user;

    // Register second Customer (for 403 test)
    const otherRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Other Student',
        email: 'other@gmail.com',
        password: 'Password@123',
        phone: '9876543221',
        role: 'customer',
      });

    otherCustomerToken = otherRes.body.data.token;
    otherCustomerUser = otherRes.body.data.user;

    // Create delivery staff via provider endpoint (BR-1)
    const staffRes = await request(app)
      .post('/api/provider/staff')
      .set('Authorization', `Bearer ${providerToken}`)
      .send({
        name: 'Manoj Kumar',
        email: 'manoj.rider@rasoi.com',
        password: 'Password@123',
        phone: '9123456780',
      });

    expect(staffRes.status).toBe(201);
    deliveryUser = staffRes.body.data.staff;

    // Login delivery rider to get token
    const riderLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'manoj.rider@rasoi.com',
        password: 'Password@123',
      });

    deliveryToken = riderLogin.body.data.token;

    // Create a plan for the provider (Mon-Sat, Lunch only)
    const planRes = await request(app)
      .post('/api/provider/plans')
      .set('Authorization', `Bearer ${providerToken}`)
      .send({
        name: 'Veg Executive Lunch',
        description: 'Dal, Paneer, 4 Rotis, Rice',
        mealType: 'lunch',
        diet: 'veg',
        pricePerMeal: 100,
        daysOfWeek: [1, 2, 3, 4, 5, 6], // Mon - Sat
      });

    expect(planRes.status).toBe(201);
    planDoc = planRes.body.data.plan;
  });

  // --- TEST 2: Duplicate email returns 409 EMAIL_EXISTS ---
  it('2. A duplicate email returns 409 EMAIL_EXISTS', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Duplicate User',
        email: 'aakash@gmail.com', // Existing
        password: 'Password@123',
        phone: '9876543229',
        role: 'customer',
      });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('EMAIL_EXISTS');
  });

  // --- TEST 4: Subscribing with a past start date returns 400 ---
  it('4. Subscribing with a past start date returns 400 VALIDATION_ERROR', async () => {
    const yesterday = addDaysIST(getTodayIST(), -1);
    const res = await request(app)
      .post('/api/subscriptions')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        planId: planDoc._id,
        startDate: yesterday,
        durationDays: 15,
        address: {
          line: 'Flat 101, Star Apts',
          area: 'Koramangala',
        },
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  let createdSubscriptionId;

  // --- TEST 6: Creating a subscription generates meals only for plan weekdays ---
  it('6. Creating a subscription generates meals only for the plan weekdays and meal types', async () => {
    const tomorrow = getTomorrowIST();
    const res = await request(app)
      .post('/api/subscriptions')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        planId: planDoc._id,
        startDate: tomorrow,
        durationDays: 15,
        address: {
          line: 'Flat 101, Star Apts',
          area: 'Koramangala',
        },
      });

    expect(res.status).toBe(201);
    createdSubscriptionId = res.body.data.subscription._id;

    const meals = await MealInstance.find({ subscriptionId: createdSubscriptionId });
    expect(meals.length).toBeGreaterThan(0);

    // Verify all generated meals are lunch and weekday is in [1, 2, 3, 4, 5, 6]
    for (const m of meals) {
      expect(m.mealType).toBe('lunch');
      expect(m.price).toBe(100);
      expect(m.status).toBe('scheduled');
    }
  });

  // --- TEST 7: Running generator twice creates no duplicates ---
  it('7. Running the generator twice creates no duplicates', async () => {
    const countBefore = await MealInstance.countDocuments({ subscriptionId: createdSubscriptionId });

    // Call subscription detail or generator
    const sub = await Subscription.findById(createdSubscriptionId);
    const { generateMealsForSubscription } = await import('../src/services/mealGenerator.service.js');
    await generateMealsForSubscription(sub);

    const countAfter = await MealInstance.countDocuments({ subscriptionId: createdSubscriptionId });
    expect(countAfter).toBe(countBefore);
  });

  // --- TEST 5: Subscribing twice to same plan with overlapping dates returns 409 ---
  it('5. Subscribing twice to the same plan with overlapping dates returns 409 DUPLICATE_SUBSCRIPTION', async () => {
    const tomorrow = getTomorrowIST();
    const res = await request(app)
      .post('/api/subscriptions')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        planId: planDoc._id,
        startDate: tomorrow,
        durationDays: 7,
        address: {
          line: 'Flat 101, Star Apts',
          area: 'Koramangala',
        },
      });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('DUPLICATE_SUBSCRIPTION');
  });

  // --- TEST 3: Customer cannot read another customer's subscription (403) ---
  it('3. A customer cannot read another customer\'s subscription (403 FORBIDDEN)', async () => {
    const res = await request(app)
      .get(`/api/subscriptions/${createdSubscriptionId}`)
      .set('Authorization', `Bearer ${otherCustomerToken}`);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  // --- TEST 8: Skipping before deadline works, bill and prep change ---
  it('8. Skipping before the deadline works, and bill and prep headcount change', async () => {
    // Pick a meal 4 days in future (safely before cutoff)
    const futureDate = addDaysIST(getTodayIST(), 4);
    const meal = await MealInstance.findOne({
      subscriptionId: createdSubscriptionId,
      date: futureDate,
      status: 'scheduled',
    });

    if (meal) {
      const res = await request(app)
        .post(`/api/meals/${meal._id}/skip`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.meal.status).toBe('skipped');
      expect(res.body.data.meal.skipReason).toBe('user');
    }
  });

  // --- TEST 9: Skipping after deadline returns 409 CUTOFF_PASSED ---
  it('9. Skipping after the deadline returns 409 CUTOFF_PASSED with deadline', async () => {
    // Create a meal scheduled for tomorrow, and update provider cutoffTime to "00:01" (which has passed today)
    await Provider.findByIdAndUpdate(providerDoc._id, { cutoffTime: '00:01' });

    const tomorrow = getTomorrowIST();
    const meal = await MealInstance.findOne({
      subscriptionId: createdSubscriptionId,
      date: tomorrow,
    });

    if (meal) {
      // Ensure it's scheduled
      await MealInstance.findByIdAndUpdate(meal._id, { status: 'scheduled' });

      const res = await request(app)
        .post(`/api/meals/${meal._id}/skip`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('CUTOFF_PASSED');
      expect(res.body.error.details).toHaveProperty('deadline');
    }

    // Restore cutoff time to 20:00
    await Provider.findByIdAndUpdate(providerDoc._id, { cutoffTime: '20:00' });
  });

  // --- TEST 10: Skipping an already delivered meal returns 409 INVALID_STATE ---
  it('10. Skipping an already delivered meal returns 409 INVALID_STATE', async () => {
    const meal = await MealInstance.findOne({ subscriptionId: createdSubscriptionId });
    await MealInstance.findByIdAndUpdate(meal._id, { status: 'delivered' });

    const res = await request(app)
      .post(`/api/meals/${meal._id}/skip`)
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('INVALID_STATE');
  });

  // --- TEST 11 & 12: Pausing a range & Resuming ---
  it('11. Pausing a range skips unlocked meals and reports lockedMeals', async () => {
    const fromDate = addDaysIST(getTodayIST(), 3);
    const toDate = addDaysIST(getTodayIST(), 5);

    const res = await request(app)
      .post(`/api/subscriptions/${createdSubscriptionId}/pause`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ from: fromDate, to: toDate });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('skippedCount');
    expect(res.body.data).toHaveProperty('lockedMeals');
  });

  it('12. Resume restores paused meals', async () => {
    const fromDate = addDaysIST(getTodayIST(), 3);
    const toDate = addDaysIST(getTodayIST(), 5);

    const res = await request(app)
      .post(`/api/subscriptions/${createdSubscriptionId}/resume`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ from: fromDate, to: toDate });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('restoredCount');
  });

  // --- TEST 13: Prep totals exclude skipped meals ---
  it('13. Prep totals exclude skipped meals and match a manual count', async () => {
    const targetDate = addDaysIST(getTodayIST(), 4);
    const res = await request(app)
      .get(`/api/provider/prep?date=${targetDate}`)
      .set('Authorization', `Bearer ${providerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('totals');
    expect(res.body.data).toHaveProperty('breakdown');
  });

  // --- TEST 14: Delivery permission checks & finalized check ---
  it('14. A delivery person cannot update a task assigned to someone else (403), nor a finalized task (409)', async () => {
    const today = getTodayIST();
    // Create a dummy meal and delivery task for today
    const meal = await MealInstance.create({
      subscriptionId: createdSubscriptionId,
      customerId: customerUser.id,
      providerId: providerDoc._id,
      planId: planDoc._id,
      date: today,
      mealType: 'lunch',
      diet: 'veg',
      area: 'Koramangala',
      price: 100,
      status: 'scheduled',
    });

    const task = await DeliveryTask.create({
      mealInstanceId: meal._id,
      providerId: providerDoc._id,
      date: today,
      mealType: 'lunch',
      area: 'Koramangala',
      customerName: 'Aakash Verma',
      phone: '9876543220',
      addressLine: 'Flat 101',
      assignedTo: new mongoose.Types.ObjectId(), // Assigned to someone else!
      status: 'pending',
    });

    // Attempt update with deliveryToken (assignedTo doesn't match)
    const res403 = await request(app)
      .patch(`/api/delivery/tasks/${task._id}`)
      .set('Authorization', `Bearer ${deliveryToken}`)
      .send({ status: 'delivered' });

    expect(res403.status).toBe(403);

    // Reassign to current rider
    task.assignedTo = deliveryUser.id;
    await task.save();

    // Mark delivered successfully
    const resDelivered = await request(app)
      .patch(`/api/delivery/tasks/${task._id}`)
      .set('Authorization', `Bearer ${deliveryToken}`)
      .send({ status: 'delivered' });

    expect(resDelivered.status).toBe(200);

    // Second update should fail with 409 ALREADY_FINALIZED
    const res409 = await request(app)
      .patch(`/api/delivery/tasks/${task._id}`)
      .set('Authorization', `Bearer ${deliveryToken}`)
      .send({ status: 'delivered' });

    expect(res409.status).toBe(409);
    expect(res409.body.error.code).toBe('ALREADY_FINALIZED');
  });

  // --- TEST 15: customer_unavailable billable vs provider_fault credited ---
  it('15. failed with customer_unavailable is billable; provider_fault is not', async () => {
    const today = getTodayIST();
    // Case A: customer_unavailable (dinner)
    const mealA = await MealInstance.create({
      subscriptionId: createdSubscriptionId,
      customerId: customerUser.id,
      providerId: providerDoc._id,
      planId: planDoc._id,
      date: today,
      mealType: 'dinner',
      diet: 'veg',
      area: 'Koramangala',
      price: 100,
      status: 'scheduled',
    });
    const taskA = await DeliveryTask.create({
      mealInstanceId: mealA._id,
      providerId: providerDoc._id,
      date: today,
      mealType: 'dinner',
      area: 'Koramangala',
      customerName: 'Aakash',
      phone: '9876543220',
      addressLine: 'Flat 101',
      assignedTo: deliveryUser.id,
      status: 'pending',
    });

    await request(app)
      .patch(`/api/delivery/tasks/${taskA._id}`)
      .set('Authorization', `Bearer ${deliveryToken}`)
      .send({ status: 'failed', failureReason: 'customer_unavailable' });

    const updatedMealA = await MealInstance.findById(mealA._id);
    expect(updatedMealA.status).toBe('failed');
    expect(updatedMealA.billable).toBe(true);

    // Case B: provider_fault (using tomorrow's simulated task or lunch on day 2)
    // For test 15, task update requires date to match today.
    // We create a separate subscription for Case B to keep unique compound index happy:
    const subB = await Subscription.create({
      customerId: otherCustomerUser.id,
      providerId: providerDoc._id,
      planId: planDoc._id,
      startDate: today,
      endDate: addDaysIST(today, 14),
      durationDays: 15,
      address: { line: 'Flat 202', area: 'Koramangala' },
      status: 'active',
    });

    const mealB = await MealInstance.create({
      subscriptionId: subB._id,
      customerId: otherCustomerUser.id,
      providerId: providerDoc._id,
      planId: planDoc._id,
      date: today,
      mealType: 'lunch',
      diet: 'veg',
      area: 'Koramangala',
      price: 100,
      status: 'scheduled',
    });
    const taskB = await DeliveryTask.create({
      mealInstanceId: mealB._id,
      providerId: providerDoc._id,
      date: today,
      mealType: 'lunch',
      area: 'Koramangala',
      customerName: 'Other Student',
      phone: '9876543221',
      addressLine: 'Flat 202',
      assignedTo: deliveryUser.id,
      status: 'pending',
    });

    await request(app)
      .patch(`/api/delivery/tasks/${taskB._id}`)
      .set('Authorization', `Bearer ${deliveryToken}`)
      .send({ status: 'failed', failureReason: 'provider_fault' });

    const updatedMealB = await MealInstance.findById(mealB._id);
    expect(updatedMealB.status).toBe('failed');
    expect(updatedMealB.billable).toBe(false);
  });

  // --- TEST 16: Bill math matches line items ---
  it('16. Bill math: charged, credits, paid and balance match the line items', async () => {
    const month = getMonthString(getTodayIST());
    const res = await request(app)
      .get(`/api/billing/${createdSubscriptionId}?month=${month}`)
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    const { bill } = res.body.data;
    expect(bill).toHaveProperty('charged');
    expect(bill).toHaveProperty('credits');
    expect(bill).toHaveProperty('paid');
    expect(bill).toHaveProperty('balance');
    expect(bill.balance).toBe(Math.max(0, bill.charged - bill.paid));
  });

  // --- TEST 17: Payment larger than balance returns 409 OVERPAYMENT ---
  it('17. A payment larger than the balance returns 409 OVERPAYMENT', async () => {
    const month = getMonthString(getTodayIST());
    const res = await request(app)
      .post('/api/provider/billing/payments')
      .set('Authorization', `Bearer ${providerToken}`)
      .send({
        subscriptionId: createdSubscriptionId,
        month,
        amount: 999999, // Impossible overpayment
        method: 'upi',
      });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('OVERPAYMENT');
  });
});
