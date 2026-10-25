import bcrypt from 'bcryptjs';
import { User, Provider, Plan, MenuItem, Subscription, MealInstance, DeliveryTask, Payment } from '../models/index.js';
import { getTodayIST, addDaysIST, getMonthString } from '../utils/dates.js';

export const seedDataDirectly = async () => {
  const existingCount = await Provider.countDocuments();
  if (existingCount > 0) {
    console.log('[Seed] Data already exists. Skipping auto-seed.');
    return;
  }

  console.log('[Seed] Auto-seeding rich culinary ecosystem into database...');
  const defaultPasswordHash = await bcrypt.hash('Demo@1234', 10);

  // 1. Kitchen 1: Maa Ki Rasoi (North Indian Homestyle)
  const owner1 = await User.create({
    name: 'Sunita Sharma',
    email: 'provider@demo.com', // Demo provider login
    passwordHash: defaultPasswordHash,
    phone: '9876543210',
    role: 'provider',
  });

  const provider1 = await Provider.create({
    ownerId: owner1._id,
    businessName: 'Maa Ki Rasoi',
    description: 'Authentic Punjabi & North Indian homestyle meals prepared with fresh cold-pressed mustard oil, desi ghee phulkas, and farm-fresh vegetables.',
    contactPhone: '9876543210',
    deliveryAreas: ['Koramangala', 'HSR Layout', 'BTM Layout'],
    cutoffTime: '20:00',
    isActive: true,
  });

  // 2. Kitchen 2: Annapurna Homely Mess (South Indian Traditional)
  const owner2 = await User.create({
    name: 'Lakshmi Narayanan',
    email: 'annapurna@demo.com',
    passwordHash: defaultPasswordHash,
    phone: '9876543212',
    role: 'provider',
  });

  const provider2 = await Provider.create({
    ownerId: owner2._id,
    businessName: 'Annapurna Homely Mess',
    description: 'Traditional Tamil & Andhra homestyle meals cooked with homemade podis, ghee sambar, comforting rasam, seasonal vegetable poriyal, and soothing curd.',
    contactPhone: '9876543212',
    deliveryAreas: ['BTM Layout', 'Koramangala', 'Jayanagar'],
    cutoffTime: '19:30',
    isActive: true,
  });

  // 3. Kitchen 3: Campus Mess Co (Budget & High-Protein)
  const owner3 = await User.create({
    name: 'Rajesh Verma',
    email: 'campus@demo.com',
    passwordHash: defaultPasswordHash,
    phone: '9876543211',
    role: 'provider',
  });

  const provider3 = await Provider.create({
    ownerId: owner3._id,
    businessName: 'Campus Mess Co',
    description: 'Curated for college students and working professionals needing clean, nutritious, high-protein wholesome meals without deep-fried junk.',
    contactPhone: '9876543211',
    deliveryAreas: ['Whitefield', 'Marathahalli', 'Bellandur'],
    cutoffTime: '21:00',
    isActive: true,
  });

  // 4. Kitchen 4: Shuddh Satvik Rasoi (Jain & Pure Veg)
  const owner4 = await User.create({
    name: 'Manish Jain',
    email: 'satvik@demo.com',
    passwordHash: defaultPasswordHash,
    phone: '9876543213',
    role: 'provider',
  });

  const provider4 = await Provider.create({
    ownerId: owner4._id,
    businessName: 'Shuddh Satvik Rasoi',
    description: '100% Pure Jain & Satvik food cooked without onion, garlic, or root vegetables. Light on digestion, wholesome, and prepared in a sanctified kitchen.',
    contactPhone: '9876543213',
    deliveryAreas: ['HSR Layout', 'Koramangala'],
    cutoffTime: '19:00',
    isActive: true,
  });

  // Create Plans for Kitchen 1 (Maa Ki Rasoi)
  const p1PlanVegLunch = await Plan.create({
    providerId: provider1._id,
    name: 'Ghar Ki Thali (Lunch)',
    description: '4 Desi Ghee Phulkas, Yellow Dal Tadka, Seasonal Sabzi, Steamed Basmati Rice, Salad, Pickle',
    mealType: 'lunch',
    diet: 'veg',
    pricePerMeal: 95,
    daysOfWeek: [1, 2, 3, 4, 5, 6], // Mon - Sat
    isActive: true,
  });

  const p1PlanVegDinner = await Plan.create({
    providerId: provider1._id,
    name: 'Comfort Light Dinner',
    description: '3 Soft Rotis, Dal Fry or Moong Dal Khichdi, Dry Sabzi, Fresh Curd',
    mealType: 'dinner',
    diet: 'veg',
    pricePerMeal: 100,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6], // Daily
    isActive: true,
  });

  const p1PlanNonVegBoth = await Plan.create({
    providerId: provider1._id,
    name: 'Executive Non-Veg Combo (Lunch & Dinner)',
    description: 'Lunch: Tariwala Chicken Curry with Rice & 3 Rotis. Dinner: Homestyle Egg Bhurji / Curry with Rotis',
    mealType: 'both',
    diet: 'nonveg',
    pricePerMeal: 145,
    daysOfWeek: [1, 2, 3, 4, 5], // Mon - Fri
    isActive: true,
  });

  // Create Plans for Kitchen 2 (Annapurna)
  const p2PlanSouthLunch = await Plan.create({
    providerId: provider2._id,
    name: 'Traditional South Indian Oota (Lunch)',
    description: 'Sona Masoori Rice, Murungakkai Sambar, Pepper Rasam, Poriyal, Kootu, Curd & Appalam',
    mealType: 'lunch',
    diet: 'veg',
    pricePerMeal: 85,
    daysOfWeek: [1, 2, 3, 4, 5, 6],
    isActive: true,
  });

  // Create Plans for Kitchen 3 (Campus Mess)
  const p3PlanStudentLunch = await Plan.create({
    providerId: provider3._id,
    name: 'Student Budget Power Lunch',
    description: 'Dal Makhani, Jeera Rice, 4 Phulkas, Aloo Gobi & Onion Salad',
    mealType: 'lunch',
    diet: 'veg',
    pricePerMeal: 80,
    daysOfWeek: [1, 2, 3, 4, 5, 6],
    isActive: true,
  });

  const p3PlanGymDinner = await Plan.create({
    providerId: provider3._id,
    name: 'High Protein Gym Dinner (35g Protein)',
    description: 'Grilled Paneer / Chicken Breast (200g), Boiled Egg Whites, Brown Rice, Dal & Green Sprouts Salad',
    mealType: 'dinner',
    diet: 'nonveg',
    pricePerMeal: 160,
    daysOfWeek: [1, 2, 3, 4, 5, 6],
    isActive: true,
  });

  // Rolling 7-day Menus
  const today = getTodayIST();
  const sampleDishes = [
    { lunch: ['Shahi Paneer', 'Dal Makhani', '4 Desi Ghee Phulkas', 'Jeera Rice'], dinner: ['Aloo Matar', 'Yellow Dal Tadka', '3 Rotis', 'Steamed Rice'] },
    { lunch: ['Rajma Masala', 'Steamed Basmati Rice', 'Kachumber Salad', 'Boondi Raita'], dinner: ['Bhindi Do Pyaza', 'Chana Dal Fry', 'Phulkas'] },
    { lunch: ['Amritsari Chole', 'Jeera Pulao', 'Sirka Onion', 'Sweet Gulab Jamun'], dinner: ['Kadai Paneer', 'Moong Dal', 'Phulkas', 'Curd'] },
    { lunch: ['Punjabi Kadhi Pakora', 'Steamed Rice', 'Aloo Beans Poriyal', 'Roasted Papad'], dinner: ['Mix Veg Handi', 'Toor Dal Fry', 'Phulkas'] },
    { lunch: ['Homestyle Chicken Curry / Paneer Lababdar', 'Rice', 'Rotis', 'Cucumber Salad'], dinner: ['Egg Curry / Matar Paneer', 'Dal Tadka', 'Parathas'] },
    { lunch: ['Baingan Bharta', 'Panchmel Dal', 'Rotis', 'Pulao'], dinner: ['Dum Aloo Kashmiri', 'Yellow Dal', 'Phulkas'] },
    { lunch: ['Veg Biryani', 'Mirchi Ka Salan', 'Cucumber Raita'], dinner: ['Khichdi with Desi Ghee', 'Roasted Papad', 'Achar', 'Dahi'] },
  ];

  for (let i = -3; i < 8; i++) {
    const d = addDaysIST(today, i);
    const dish = sampleDishes[Math.abs(i) % sampleDishes.length];
    await MenuItem.create({ providerId: provider1._id, date: d, mealType: 'lunch', dishes: dish.lunch });
    await MenuItem.create({ providerId: provider1._id, date: d, mealType: 'dinner', dishes: dish.dinner });
    await MenuItem.create({ providerId: provider2._id, date: d, mealType: 'lunch', dishes: ['Mysore Sambar', 'Rasam', 'Rice', 'Beans Poriyal', 'Appalam'] });
    await MenuItem.create({ providerId: provider3._id, date: d, mealType: 'lunch', dishes: dish.lunch });
  }

  // Delivery Staff
  const staff1 = await User.create({
    name: 'Ramesh Kumar',
    email: 'delivery@demo.com', // Demo delivery login
    passwordHash: defaultPasswordHash,
    phone: '9123456780',
    role: 'delivery',
    providerId: provider1._id,
  });

  const staff2 = await User.create({
    name: 'Suresh Gowda',
    email: 'suresh@demo.com',
    passwordHash: defaultPasswordHash,
    phone: '9123456781',
    role: 'delivery',
    providerId: provider1._id,
  });

  // Customer: Rohan Sharma
  const customer1 = await User.create({
    name: 'Rohan Sharma',
    email: 'customer@demo.com', // Demo customer login
    passwordHash: defaultPasswordHash,
    phone: '9876543220',
    role: 'customer',
  });

  // Subscriptions & History
  const sub1StartDate = addDaysIST(today, -10);
  const sub1EndDate = addDaysIST(sub1StartDate, 29);

  const sub1 = await Subscription.create({
    customerId: customer1._id,
    providerId: provider1._id,
    planId: p1PlanVegLunch._id,
    startDate: sub1StartDate,
    endDate: sub1EndDate,
    durationDays: 30,
    address: {
      line: 'Flat 402, Green Glen Layout, Outer Ring Road',
      area: 'Koramangala',
      landmark: 'Near Sony Signal',
    },
    status: 'active',
    pauses: [{ from: addDaysIST(today, 3), to: addDaysIST(today, 5) }],
  });

  // Generate Past & Today Meals for Rohan
  for (let offset = -10; offset <= 5; offset++) {
    const mealDate = addDaysIST(today, offset);
    let status = 'delivered';
    let billable = true;
    let skipReason = null;
    let failureReason = null;

    if (offset === -7) {
      status = 'skipped';
      skipReason = 'user';
    } else if (offset === -3) {
      status = 'failed';
      failureReason = 'customer_unavailable';
      billable = true;
    } else if (offset === 0) {
      status = 'scheduled'; // Today
    } else if (offset > 0 && offset < 3) {
      status = 'scheduled';
    } else if (offset >= 3) {
      status = 'skipped';
      skipReason = 'pause';
    }

    const meal = await MealInstance.create({
      subscriptionId: sub1._id,
      customerId: customer1._id,
      providerId: provider1._id,
      planId: p1PlanVegLunch._id,
      date: mealDate,
      mealType: 'lunch',
      diet: 'veg',
      area: 'Koramangala',
      price: 95,
      status,
      skipReason,
      failureReason,
      billable,
    });

    if (offset === 0) {
      await DeliveryTask.create({
        mealInstanceId: meal._id,
        providerId: provider1._id,
        date: mealDate,
        mealType: 'lunch',
        area: 'Koramangala',
        customerName: customer1.name,
        phone: customer1.phone,
        addressLine: sub1.address.line,
        landmark: sub1.address.landmark,
        assignedTo: staff1._id,
        status: 'pending',
      });
    }
  }

  // Record an initial payment
  await Payment.create({
    subscriptionId: sub1._id,
    providerId: provider1._id,
    month: getMonthString(today),
    amount: 500,
    method: 'upi',
    note: 'Initial Advance Payment via UPI',
    recordedBy: owner1._id,
  });

  console.log('✅ [Seed Completed] 4 Kitchens, Plans, Menus, Riders & Demo Accounts Ready!');
};
