import mongoose from 'mongoose';
import dns from 'dns';
import bcrypt from 'bcryptjs';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Ignore DNS config failure
}
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

  console.log('[Seed] Creating demo provider owners & 8 neighborhood kitchens...');
  // Provider 1: Maa Ki Rasoi (North Indian Homestyle)
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
    description: 'Authentic homestyle North Indian meals made with cold-pressed mustard oil, desi ghee phulkas, and fresh seasonal vegetables.',
    contactPhone: '9876543210',
    deliveryAreas: ['Koramangala', 'HSR Layout', 'BTM Layout'],
    cutoffTime: '17:00',
    isActive: true,
  });

  // Provider 2: Annapurna Homely Mess (South Indian Traditional)
  const providerOwner2 = await User.create({
    name: 'Lakshmi Narayanan',
    email: 'annapurna@demo.com',
    passwordHash: defaultPasswordHash,
    phone: '9876543212',
    role: 'provider',
  });

  const provider2 = await Provider.create({
    ownerId: providerOwner2._id,
    businessName: 'Annapurna Homely Mess',
    description: 'Traditional Tamil & Andhra homestyle meals cooked with homemade podis, ghee sambar, soothing rasam, seasonal poriyal, and fresh curd.',
    contactPhone: '9876543212',
    deliveryAreas: ['BTM Layout', 'Koramangala', 'Jayanagar'],
    cutoffTime: '17:00',
    isActive: true,
  });

  // Provider 3: Campus Mess Co (Budget & Student Specials)
  const providerOwner3 = await User.create({
    name: 'Rajesh Verma',
    email: 'campus@demo.com',
    passwordHash: defaultPasswordHash,
    phone: '9876543211',
    role: 'provider',
  });

  const provider3 = await Provider.create({
    ownerId: providerOwner3._id,
    businessName: 'Campus Mess Co',
    description: 'Budget-friendly, wholesome meals curated for engineering students and young tech professionals with zero compromise on hygiene.',
    contactPhone: '9876543211',
    deliveryAreas: ['Whitefield', 'BTM Layout', 'Koramangala'],
    cutoffTime: '17:00',
    isActive: true,
  });

  // Provider 4: Shuddh Satvik Rasoi (Pure Satvik & Jain)
  const providerOwner4 = await User.create({
    name: 'Manish Jain',
    email: 'satvik@demo.com',
    passwordHash: defaultPasswordHash,
    phone: '9876543213',
    role: 'provider',
  });

  const provider4 = await Provider.create({
    ownerId: providerOwner4._id,
    businessName: 'Shuddh Satvik Rasoi',
    description: '100% Pure Jain & Satvik food cooked without onion, garlic, or root vegetables. Light on digestion, wholesome, and sanctified.',
    contactPhone: '9876543213',
    deliveryAreas: ['HSR Layout', 'Koramangala', 'Jayanagar'],
    cutoffTime: '17:00',
    isActive: true,
  });

  // Provider 5: NutriFit Clean Fuel (High-Protein & Gym Meals)
  const providerOwner5 = await User.create({
    name: 'Coach Rohan Mehra',
    email: 'nutrifit@demo.com',
    passwordHash: defaultPasswordHash,
    phone: '9876543214',
    role: 'provider',
  });

  const provider5 = await Provider.create({
    ownerId: providerOwner5._id,
    businessName: 'NutriFit Clean Fuel',
    description: 'Clean macro-counted fitness meals with 35g+ verified protein: grilled chicken/paneer, boiled eggs, quinoa/brown rice, and fresh sprouts.',
    contactPhone: '9876543214',
    deliveryAreas: ['Koramangala', 'HSR Layout', 'Whitefield', 'Indiranagar'],
    cutoffTime: '17:00',
    isActive: true,
  });

  // Provider 6: Bramhin's Heritage Mess (Authentic Udupi & Traditional)
  const providerOwner6 = await User.create({
    name: 'Shankar Bhat',
    email: 'heritage@demo.com',
    passwordHash: defaultPasswordHash,
    phone: '9876543215',
    role: 'provider',
  });

  const provider6 = await Provider.create({
    ownerId: providerOwner6._id,
    businessName: "Bramhin's Heritage Mess",
    description: 'Authentic Udupi Oota prepared according to traditional culinary shlokas: Majjige Huli, Bisi Bele Bath, fresh Kosambari, and home-churned ghee.',
    contactPhone: '9876543215',
    deliveryAreas: ['Jayanagar', 'BTM Layout'],
    cutoffTime: '17:00',
    isActive: true,
  });

  // Provider 7: Whitefield Chef Table (Executive Home Chef Meals)
  const providerOwner7 = await User.create({
    name: 'Kavita Chawla',
    email: 'whitefieldchef@demo.com',
    passwordHash: defaultPasswordHash,
    phone: '9876543216',
    role: 'provider',
  });

  const provider7 = await Provider.create({
    ownerId: providerOwner7._id,
    businessName: 'Whitefield Chef Table',
    description: 'Nutritious homestyle lunch and dinner boxes prepared for IT corridor professionals. Balanced oils, premium grains, and homestyle taste.',
    contactPhone: '9876543216',
    deliveryAreas: ['Whitefield', 'Indiranagar'],
    cutoffTime: '17:00',
    isActive: true,
  });

  // Provider 8: Dakshin Daily Meals (Tamil & Malabar Homestyle)
  const providerOwner8 = await User.create({
    name: 'Murugan Pillai',
    email: 'dakshin@demo.com',
    passwordHash: defaultPasswordHash,
    phone: '9876543217',
    role: 'provider',
  });

  const provider8 = await Provider.create({
    ownerId: providerOwner8._id,
    businessName: 'Dakshin Daily Meals',
    description: 'Flavor-rich Chettinad and Malabar homestyle tiffins: fluffy Appams, Ghee Roast Dosa, Malabar Parotta with Veg Kurma, and Pepper Chicken Curry.',
    contactPhone: '9876543217',
    deliveryAreas: ['Indiranagar', 'HSR Layout'],
    cutoffTime: '17:00',
    isActive: true,
  });

  console.log('[Seed] Creating plans for each provider...');
  // Plans for Provider 1 (Maa Ki Rasoi)
  const p1PlanVegLunch = await Plan.create({
    providerId: provider1._id,
    name: 'Daily Veg Thali (Lunch)',
    description: '4 Rotis, Dal Tadka, Seasonal Sabzi, Jeera Rice, Salad, Pickle',
    mealType: 'lunch',
    diet: 'veg',
    pricePerMeal: 95,
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

  // Plans for Provider 2 (Annapurna Homely Mess)
  await Plan.create({
    providerId: provider2._id,
    name: 'Traditional Tamil Oota (Lunch)',
    description: 'Steamed Sona Masoori, Ghee Sambar, Pepper Rasam, Poriyal, Curd, Appalam',
    mealType: 'lunch',
    diet: 'veg',
    pricePerMeal: 85,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    isActive: true,
  });

  await Plan.create({
    providerId: provider2._id,
    name: 'South Tiffin Dinner',
    description: '3 Soft Idlis or 2 Phulkas, Sambar, Coconut Chutney, Vegetable Kurma',
    mealType: 'dinner',
    diet: 'veg',
    pricePerMeal: 85,
    daysOfWeek: [1, 2, 3, 4, 5, 6],
    isActive: true,
  });

  // Plans for Provider 3 (Campus Mess Co)
  const p2PlanStudentLunch = await Plan.create({
    providerId: provider3._id,
    name: 'Student Express Lunch',
    description: 'Dal Makhani, Rice, 3 Rotis, Aloo Jeera',
    mealType: 'lunch',
    diet: 'veg',
    pricePerMeal: 85,
    daysOfWeek: [1, 2, 3, 4, 5, 6],
    isActive: true,
  });

  const p2PlanProteinDinner = await Plan.create({
    providerId: provider3._id,
    name: 'High Protein Gym Dinner',
    description: 'Soya chunks / Paneer Bhurji, Brown Rice, Dal, Sprouts salad',
    mealType: 'dinner',
    diet: 'veg',
    pricePerMeal: 110,
    daysOfWeek: [1, 2, 3, 4, 5, 6],
    isActive: true,
  });

  const p2PlanNonVegDinner = await Plan.create({
    providerId: provider3._id,
    name: 'Non-Veg Feast Dinner',
    description: 'Butter Chicken / Chicken Sukka, 4 Rotis, Rice, Raita',
    mealType: 'dinner',
    diet: 'nonveg',
    pricePerMeal: 150,
    daysOfWeek: [1, 3, 5, 0],
    isActive: true,
  });

  // Plans for Provider 4 (Shuddh Satvik Rasoi)
  await Plan.create({
    providerId: provider4._id,
    name: 'Satvik Pure Veg Thali (Lunch)',
    description: '4 Desi Ghee Phulkas, Toor Dal, Lauki/Karela Sabzi, Steamed Basmati, Chaas (No Onion No Garlic)',
    mealType: 'lunch',
    diet: 'veg',
    pricePerMeal: 90,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    isActive: true,
  });

  // Plans for Provider 5 (NutriFit Clean Fuel)
  await Plan.create({
    providerId: provider5._id,
    name: '35g+ Protein Power Bowl (Lunch)',
    description: '200g Grilled Chicken/Paneer, Herb Quinoa & Brown Rice, Boiled Eggs, Green Sprouts, Broccoli Salad',
    mealType: 'lunch',
    diet: 'nonveg',
    pricePerMeal: 145,
    daysOfWeek: [1, 2, 3, 4, 5, 6],
    isActive: true,
  });

  await Plan.create({
    providerId: provider5._id,
    name: 'Clean Lean Veg Protein (Dinner)',
    description: 'Tofu/Paneer Stir-fry, Yellow Moong Dal, 2 Multigrain Rotis, Cucumber & Flaxseed Salad',
    mealType: 'dinner',
    diet: 'veg',
    pricePerMeal: 135,
    daysOfWeek: [1, 2, 3, 4, 5, 6],
    isActive: true,
  });

  // Plans for Provider 6 (Bramhin's Heritage Mess)
  await Plan.create({
    providerId: provider6._id,
    name: 'Heritage Udupi Full Oota',
    description: 'Bisi Bele Bath, Kosambari, Majjige Huli, Steamed Rice, 2 Phulkas, Payasa',
    mealType: 'lunch',
    diet: 'veg',
    pricePerMeal: 90,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    isActive: true,
  });

  // Plans for Provider 7 (Whitefield Chef Table)
  await Plan.create({
    providerId: provider7._id,
    name: 'Executive Homestyle Tiffin',
    description: 'Punjabi Dal Makhani, Paneer Lababdar / Chicken Masala, 3 Butter Rotis, Pulao, Dessert',
    mealType: 'dinner',
    diet: 'veg',
    pricePerMeal: 110,
    daysOfWeek: [1, 2, 3, 4, 5],
    isActive: true,
  });

  // Plans for Provider 8 (Dakshin Daily Meals)
  await Plan.create({
    providerId: provider8._id,
    name: 'Chettinad Special Lunch Box',
    description: 'Steamed Rice, Chettinad Pepper Gravy, Kootu, 2 Kerala Parottas or Rotis, Curd',
    mealType: 'lunch',
    diet: 'nonveg',
    pricePerMeal: 95,
    daysOfWeek: [1, 2, 3, 4, 5, 6],
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

  const allProvidersList = [
    provider1,
    provider2,
    provider3,
    provider4,
    provider5,
    provider6,
    provider7,
    provider8,
  ];

  for (let i = -2; i < 7; i++) {
    const d = addDaysIST(today, i);
    for (let pIdx = 0; pIdx < allProvidersList.length; pIdx++) {
      const p = allProvidersList[pIdx];
      const dishIdx = (Math.abs(i) + pIdx) % sampleDishes.length;
      await MenuItem.create({
        providerId: p._id,
        date: d,
        mealType: 'lunch',
        dishes: sampleDishes[dishIdx].lunch,
      });
      await MenuItem.create({
        providerId: p._id,
        date: d,
        mealType: 'dinner',
        dishes: sampleDishes[dishIdx].dinner,
      });
    }
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
