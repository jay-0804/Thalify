import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';
import { User } from '../models/User.model.js';
import { Provider } from '../models/Provider.model.js';
import { Plan } from '../models/Plan.model.js';
import { MenuItem } from '../models/MenuItem.model.js';
import { Subscription } from '../models/Subscription.model.js';
import { MealInstance } from '../models/MealInstance.model.js';
import { DeliveryTask } from '../models/DeliveryTask.model.js';
import { Payment } from '../models/Payment.model.js';
import {
  getTodayIST,
  getTomorrowIST,
  addDaysIST,
  getMonthString,
} from '../utils/dates.js';

export const seedDatabase = async () => {
  console.log('[Seed] Connecting to MongoDB at', env.MONGODB_URI.replace(/:([^:@]+)@/, ':****@'));
  await mongoose.connect(env.MONGODB_URI, {
    dbName: 'tiffinloop',
    serverSelectionTimeoutMS: 10000,
  });

  console.log('[Seed] Wiping existing collections...');
  await Promise.all([
    User.deleteMany({}),
    Provider.deleteMany({}),
    Plan.deleteMany({}),
    MenuItem.deleteMany({}),
    Subscription.deleteMany({}),
    MealInstance.deleteMany({}),
    DeliveryTask.deleteMany({}),
    Payment.deleteMany({}),
  ]);

  const defaultPasswordHash = await bcrypt.hash('Demo@1234', 10);

  console.log('[Seed] Creating demo provider owners...');
  // Provider 1 Owner: Maa Ki Rasoi
  const providerOwner1 = await User.create({
    name: 'Sunita Sharma',
    email: 'provider@demo.com', // Demo login
    passwordHash: defaultPasswordHash,
    phone: '9876543210',
    role: 'provider',
  });

  const provider1 = await Provider.create({
    ownerId: providerOwner1._id,
    businessName: 'Maa Ki Rasoi',
    description: 'Authentic homestyle North Indian meals made with cold-pressed mustard oil and love.',
    contactPhone: '9876543210',
    deliveryAreas: ['Koramangala', 'HSR Layout', 'BTM'],
    cutoffTime: '20:00',
    isActive: true,
  });

  // Provider 2 Owner: Campus Mess Co
  const providerOwner2 = await User.create({
    name: 'Rajesh Verma',
    email: 'campus@demo.com',
    passwordHash: defaultPasswordHash,
    phone: '9876543211',
    role: 'provider',
  });

  const provider2 = await Provider.create({
    ownerId: providerOwner2._id,
    businessName: 'Campus Mess Co',
    description: 'Budget-friendly, high-protein wholesome meals curated for engineering and college students.',
    contactPhone: '9876543211',
    deliveryAreas: ['Whitefield', 'Marathahalli'],
    cutoffTime: '21:00',
    isActive: true,
  });

  console.log('[Seed] Creating plans for each provider...');
  // 3 plans for Provider 1
  const p1PlanVegLunch = await Plan.create({
    providerId: provider1._id,
    name: 'Daily Veg Thali (Lunch)',
    description: '4 Rotis, Dal Tadka, Seasonal Sabzi, Jeera Rice, Salad, Pickle',
    mealType: 'lunch',
    diet: 'veg',
    pricePerMeal: 90,
    daysOfWeek: [1, 2, 3, 4, 5, 6], // Mon - Sat
    isActive: true,
  });

  const p1PlanVegDinner = await Plan.create({
    providerId: provider1._id,
    name: 'Wholesome Veg Light Dinner',
    description: '3 Phulkas, Khichdi / Dal Fry, Light Sabzi, Curd',
    mealType: 'dinner',
    diet: 'veg',
    pricePerMeal: 100,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6], // Daily
    isActive: true,
  });

  const p1PlanNonVegBoth = await Plan.create({
    providerId: provider1._id,
    name: 'Special Combo (Lunch & Dinner Non-Veg)',
    description: 'Lunch: Homestyle Chicken Curry + Rice/Roti. Dinner: Egg Curry / Paneer + Rotis',
    mealType: 'both',
    diet: 'nonveg',
    pricePerMeal: 140,
    daysOfWeek: [1, 2, 3, 4, 5], // Mon - Fri
    isActive: true,
  });

  // 3 plans for Provider 2
  const p2PlanStudentLunch = await Plan.create({
    providerId: provider2._id,
    name: 'Student Express Lunch',
    description: 'Dal Makhani, Rice, 3 Rotis, Aloo Jeera',
    mealType: 'lunch',
    diet: 'veg',
    pricePerMeal: 85,
    daysOfWeek: [1, 2, 3, 4, 5, 6],
    isActive: true,
  });

  const p2PlanProteinDinner = await Plan.create({
    providerId: provider2._id,
    name: 'High Protein Gym Dinner',
    description: 'Soya chunks / Paneer Bhurji, Brown Rice, Dal, Sprouts salad',
    mealType: 'dinner',
    diet: 'veg',
    pricePerMeal: 110,
    daysOfWeek: [1, 2, 3, 4, 5, 6],
    isActive: true,
  });

  const p2PlanNonVegDinner = await Plan.create({
    providerId: provider2._id,
    name: 'Non-Veg Feast Dinner',
    description: 'Butter Chicken / Chicken Sukka, 4 Rotis, Rice, Raita',
    mealType: 'dinner',
    diet: 'nonveg',
    pricePerMeal: 150,
    daysOfWeek: [1, 3, 5, 0],
    isActive: true,
  });

  console.log('[Seed] Creating 7-day menus for both providers...');
  const today = getTodayIST();
  const sampleDishes = [
    { lunch: ['Paneer Butter Masala', 'Yellow Dal Tadka', 'Phulkas', 'Jeera Rice'], dinner: ['Aloo Gobi Adraki', 'Moong Dal', 'Tawa Roti', 'Steamed Rice'] },
    { lunch: ['Rajma Masala', 'Steamed Basmati Rice', 'Kachumber Salad', 'Boondi Raita'], dinner: ['Bhindi Masala', 'Chana Dal', 'Phulkas'] },
    { lunch: ['Chole Masala', 'Bhature / Rice', 'Sirka Onion', 'Gulab Jamun'], dinner: ['Kadai Paneer', 'Dal Palak', 'Missi Roti'] },
    { lunch: ['Kadhi Pakora', 'Jeera Rice', 'Aloo Beans Poriyal', 'Papad'], dinner: ['Mix Veg Korma', 'Toor Dal Fry', 'Phulkas'] },
    { lunch: ['Chicken Curry / Shahi Paneer', 'Rice', 'Rotis', 'Salad'], dinner: ['Egg Bhurji / Matar Paneer', 'Dal Tadka', 'Parathas'] },
    { lunch: ['Baingan Bharta', 'Panchmel Dal', 'Rotis', 'Pulao'], dinner: ['Dum Aloo Kashmiri', 'Yellow Dal', 'Phulkas'] },
    { lunch: ['Veg Biryani', 'Mirchi Ka Salan', 'Cucumber Raita'], dinner: ['Khichdi with Desi Ghee', 'Roasted Papad', 'Achar', 'Dahi'] },
  ];

  for (let i = -2; i < 7; i++) {
    const d = addDaysIST(today, i);
    const dishIdx = Math.abs(i) % sampleDishes.length;
    await MenuItem.create({
      providerId: provider1._id,
      date: d,
      mealType: 'lunch',
      dishes: sampleDishes[dishIdx].lunch,
    });
    await MenuItem.create({
      providerId: provider1._id,
      date: d,
      mealType: 'dinner',
      dishes: sampleDishes[dishIdx].dinner,
    });

    await MenuItem.create({
      providerId: provider2._id,
      date: d,
      mealType: 'lunch',
      dishes: sampleDishes[(dishIdx + 2) % sampleDishes.length].lunch,
    });
    await MenuItem.create({
      providerId: provider2._id,
      date: d,
      mealType: 'dinner',
      dishes: sampleDishes[(dishIdx + 2) % sampleDishes.length].dinner,
    });
  }

  console.log('[Seed] Creating delivery staff (2 per provider)...');
  const staff1 = await User.create({
    name: 'Ramesh Kumar',
    email: 'delivery@demo.com', // Demo login
    passwordHash: defaultPasswordHash,
    phone: '9123456780',
    role: 'delivery',
    providerId: provider1._id,
  });

  const staff2 = await User.create({
    name: 'Suresh Gowda',
    email: 'suresh.delivery@demo.com',
    passwordHash: defaultPasswordHash,
    phone: '9123456781',
    role: 'delivery',
    providerId: provider1._id,
  });

  const staff3 = await User.create({
    name: 'Manish Singh',
    email: 'manish.delivery@demo.com',
    passwordHash: defaultPasswordHash,
    phone: '9123456782',
    role: 'delivery',
    providerId: provider2._id,
  });

  const staff4 = await User.create({
    name: 'Vikram Yadav',
    email: 'vikram.delivery@demo.com',
    passwordHash: defaultPasswordHash,
    phone: '9123456783',
    role: 'delivery',
    providerId: provider2._id,
  });

  console.log('[Seed] Creating customers (8 customers)...');
  const primaryCustomer = await User.create({
    name: 'Rohan Sharma',
    email: 'customer@demo.com', // Demo login
    passwordHash: defaultPasswordHash,
    phone: '9876543220',
    role: 'customer',
  });

  const otherCustomers = await Promise.all([
    User.create({ name: 'Priya Iyer', email: 'priya@demo.com', passwordHash: defaultPasswordHash, phone: '9876543221', role: 'customer' }),
    User.create({ name: 'Arjun Nair', email: 'arjun@demo.com', passwordHash: defaultPasswordHash, phone: '9876543222', role: 'customer' }),
    User.create({ name: 'Ananya Deshmukh', email: 'ananya@demo.com', passwordHash: defaultPasswordHash, phone: '9876543223', role: 'customer' }),
    User.create({ name: 'Vikrant Roy', email: 'vikrant@demo.com', passwordHash: defaultPasswordHash, phone: '9876543224', role: 'customer' }),
    User.create({ name: 'Sneha Kulkarni', email: 'sneha@demo.com', passwordHash: defaultPasswordHash, phone: '9876543225', role: 'customer' }),
    User.create({ name: 'Karthik Reddy', email: 'karthik@demo.com', passwordHash: defaultPasswordHash, phone: '9876543226', role: 'customer' }),
    User.create({ name: 'Megha Jain', email: 'megha@demo.com', passwordHash: defaultPasswordHash, phone: '9876543227', role: 'customer' }),
  ]);

  const allCustomers = [primaryCustomer, ...otherCustomers];

  console.log('[Seed] Creating subscriptions with historical meal instances & billing ledger...');
  // Subscription 1: Rohan Sharma (Primary Demo Customer) - Maa Ki Rasoi Veg Lunch
  const sub1StartDate = addDaysIST(today, -12); // Started 12 days ago
  const sub1EndDate = addDaysIST(sub1StartDate, 29); // 30 days plan

  const primarySub = await Subscription.create({
    customerId: primaryCustomer._id,
    providerId: provider1._id,
    planId: p1PlanVegLunch._id,
    startDate: sub1StartDate,
    endDate: sub1EndDate,
    durationDays: 30,
    address: {
      line: 'Flat 402, Green Glen Layout, Outer Ring Road',
      area: 'Koramangala',
      landmark: 'Opposite Sony Signal',
    },
    status: 'active',
    pauses: [
      {
        from: addDaysIST(today, 3),
        to: addDaysIST(today, 5),
      },
    ],
  });

  // Populate past 12 days of MealInstances for Rohan
  for (let d = -12; d <= 5; d++) {
    const mealDate = addDaysIST(today, d);
    let status = 'delivered';
    let billable = true;
    let skipReason = null;
    let failureReason = null;

    if (d === -8) {
      status = 'skipped';
      skipReason = 'user';
    } else if (d === -4) {
      status = 'failed';
      failureReason = 'customer_unavailable';
      billable = true;
    } else if (d === 0) {
      status = 'scheduled'; // Today's drop
    } else if (d > 0 && d < 3) {
      status = 'scheduled';
    } else if (d >= 3) {
      status = 'skipped'; // In pause range
      skipReason = 'pause';
    }

    const meal = await MealInstance.create({
      subscriptionId: primarySub._id,
      customerId: primaryCustomer._id,
      providerId: provider1._id,
      planId: p1PlanVegLunch._id,
      date: mealDate,
      mealType: 'lunch',
      diet: 'veg',
      area: 'Koramangala',
      price: 90,
      status,
      skipReason,
      failureReason,
      billable,
    });

    // If today's meal, create a delivery task assigned to Ramesh (staff1)
    if (d === 0) {
      await DeliveryTask.create({
        mealInstanceId: meal._id,
        providerId: provider1._id,
        date: mealDate,
        mealType: 'lunch',
        area: 'Koramangala',
        customerName: primaryCustomer.name,
        phone: primaryCustomer.phone,
        addressLine: primarySub.address.line,
        landmark: primarySub.address.landmark,
        assignedTo: staff1._id,
        status: 'pending',
      });
    }
  }

  // Record an advance partial payment for Rohan
  await Payment.create({
    subscriptionId: primarySub._id,
    providerId: provider1._id,
    month: getMonthString(today),
    amount: 500,
    method: 'upi',
    note: 'Advance UPI payment via PhonePe',
    recordedBy: providerOwner1._id,
  });

  // Seed subscriptions for other 7 customers across both providers
  const areas1 = ['Koramangala', 'HSR Layout', 'BTM'];
  const areas2 = ['Whitefield', 'Marathahalli'];

  for (let i = 0; i < otherCustomers.length; i++) {
    const cust = otherCustomers[i];
    const isProv1 = i % 2 === 0;
    const provider = isProv1 ? provider1 : provider2;
    const plan = isProv1
      ? (i === 0 ? p1PlanNonVegBoth : p1PlanVegDinner)
      : (i === 1 ? p2PlanStudentLunch : p2PlanProteinDinner);
    const assignedStaff = isProv1 ? (i % 4 === 0 ? staff1 : staff2) : (i % 4 === 1 ? staff3 : staff4);
    const area = isProv1 ? areas1[i % areas1.length] : areas2[i % areas2.length];

    const subStart = addDaysIST(today, -8 + i);
    const sub = await Subscription.create({
      customerId: cust._id,
      providerId: provider._id,
      planId: plan._id,
      startDate: subStart,
      endDate: addDaysIST(subStart, 14),
      durationDays: 15,
      address: {
        line: `House No ${100 + i}, 5th Cross, Sector ${i + 1}`,
        area,
        landmark: 'Near Water Tank',
      },
      status: 'active',
    });

    // Populate past few days + today + future 4 days
    for (let dayOffset = -5; dayOffset <= 4; dayOffset++) {
      const mealDate = addDaysIST(today, dayOffset);
      const isPast = dayOffset < 0;
      const isToday = dayOffset === 0;

      const meal = await MealInstance.create({
        subscriptionId: sub._id,
        customerId: cust._id,
        providerId: provider._id,
        planId: plan._id,
        date: mealDate,
        mealType: plan.mealType === 'both' ? 'lunch' : plan.mealType,
        diet: plan.diet,
        area,
        price: plan.pricePerMeal,
        status: isPast ? 'delivered' : 'scheduled',
        billable: true,
      });

      if (isToday) {
        await DeliveryTask.create({
          mealInstanceId: meal._id,
          providerId: provider._id,
          date: mealDate,
          mealType: plan.mealType === 'both' ? 'lunch' : plan.mealType,
          area,
          customerName: cust.name,
          phone: cust.phone,
          addressLine: sub.address.line,
          landmark: sub.address.landmark,
          assignedTo: assignedStaff._id,
          status: 'pending',
        });
      }
    }
  }

  console.log('[Seed] Database successfully seeded with demo accounts:');
  console.log('----------------------------------------------------');
  console.log('👤 Customer: customer@demo.com  / Demo@1234 (Rohan Sharma)');
  console.log('🍳 Provider: provider@demo.com  / Demo@1234 (Maa Ki Rasoi - Sunita Sharma)');
  console.log('🚴 Delivery: delivery@demo.com  / Demo@1234 (Ramesh Kumar)');
  console.log('----------------------------------------------------');

  await mongoose.disconnect();
  console.log('[Seed] Done.');
};

// Run if called directly
if (process.argv[1]?.endsWith('seed.js')) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[Seed Error]', err);
      process.exit(1);
    });
}
