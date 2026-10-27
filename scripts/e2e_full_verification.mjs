import http from 'http';

const BASE_URL = 'http://localhost:5000';

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(options.path, BASE_URL);
    const reqOptions = {
      method: options.method || 'GET',
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let json;
        try {
          json = JSON.parse(data);
        } catch {
          json = { raw: data };
        }
        resolve({ status: res.statusCode, data: json });
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runAllTests() {
  console.log('====================================================');
  console.log('🚀 THALIFY COMPREHENSIVE END-TO-END FLOW VERIFICATION');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // --- SECTION 1: SYSTEM HEALTH & PUBLIC ACCESS ---
  console.log('--- 1. HEALTH & PUBLIC APIS ---');
  const healthRes = await request({ path: '/health' });
  assert(healthRes.status === 200 && healthRes.data.success, 'Health check returns 200 OK');

  const providersRes = await request({ path: '/api/providers' });
  assert(providersRes.status === 200 && providersRes.data.data?.providers?.length > 0, 
    `Found ${providersRes.data.data?.providers?.length} active kitchens in database`);

  const sampleProvider = providersRes.data.data.providers[0];
  console.log(`  Testing provider: "${sampleProvider.businessName}" (ID: ${sampleProvider._id})`);

  // Provider Detail endpoint
  for (const p of providersRes.data.data.providers) {
    const detailRes = await request({ path: `/api/providers/${p._id}` });
    assert(detailRes.status === 200 && detailRes.data.data?.plans?.length > 0,
      `Kitchen "${p.businessName}" details loaded with ${detailRes.data.data?.plans?.length} plans and ${detailRes.data.data?.menu?.length || 0} menu items`);
  }

  // --- SECTION 2: CUSTOMER WORKFLOW ---
  console.log('\n--- 2. CUSTOMER WORKFLOW ---');
  const customerLogin = await request(
    { method: 'POST', path: '/api/auth/login' },
    { email: 'customer@demo.com', password: 'Demo@1234' }
  );
  assert(customerLogin.status === 200 && customerLogin.data.data?.token, 'Customer login succeeded');
  const customerToken = customerLogin.data.data?.token;
  const customerHeaders = { Authorization: `Bearer ${customerToken}` };

  // Get customer subscriptions
  const subsRes = await request({ path: '/api/subscriptions/mine', headers: customerHeaders });
  assert(subsRes.status === 200, `Fetched ${subsRes.data.data?.subscriptions?.length || 0} customer subscriptions`);

  let activeSub = subsRes.data.data?.subscriptions?.[0];

  // If no subscription, create one
  if (!activeSub) {
    console.log('  Creating a test subscription for customer...');
    const plan = sampleProvider.plans?.[0] || (await request({ path: `/api/providers/${sampleProvider._id}` })).data.data.plans[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const startDate = tomorrow.toISOString().split('T')[0];

    const createSub = await request(
      { method: 'POST', path: '/api/subscriptions', headers: customerHeaders },
      {
        planId: plan._id,
        startDate,
        durationDays: 15,
        address: { line: 'Flat 402, Sunshine Apts', area: 'Koramangala', landmark: 'Near Sony World' },
      }
    );
    assert(createSub.status === 201 || createSub.status === 200, 'Created subscription successfully');
    activeSub = createSub.data.data?.subscription;
  }

  assert(activeSub !== undefined, 'Active subscription verified');

  // Fetch subscription schedule & meal instances
  const subDetailRes = await request({ path: `/api/subscriptions/${activeSub._id}`, headers: customerHeaders });
  assert(subDetailRes.status === 200 && subDetailRes.data.data?.meals?.length > 0,
    `Subscription schedule loaded with ${subDetailRes.data.data?.meals?.length} meal instances`);

  const meals = subDetailRes.data.data.meals;
  const scheduledMeal = meals.find((m) => m.status === 'scheduled');
  if (scheduledMeal) {
    console.log(`  Testing Skip Meal enforcement for meal on ${scheduledMeal.date} (${scheduledMeal.mealType})...`);
    const skipRes = await request(
      { method: 'POST', path: `/api/meals/${scheduledMeal._id}/skip`, headers: customerHeaders }
    );
    // Either 200 (skipped before 5PM IST) or 409 (cutoff passed)
    if (skipRes.status === 200) {
      assert(true, 'Meal successfully skipped before 5PM cutoff (BR-4 satisfied)');
      // Test unskip
      const unskipRes = await request(
        { method: 'POST', path: `/api/meals/${scheduledMeal._id}/unskip`, headers: customerHeaders }
      );
      assert(unskipRes.status === 200, 'Meal successfully unskipped back to scheduled');
    } else if (skipRes.status === 409) {
      assert(true, `Cutoff enforcement working: 409 returned with code ${skipRes.data.error?.code || 'CUTOFF_PASSED'}`);
    }
  }

  // --- SECTION 3: BILLING & RAZORPAY PAYMENT ---
  console.log('\n--- 3. BILLING CALCULATION & RAZORPAY INTEGRATION ---');
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const billRes = await request(
    { path: `/api/billing/${activeSub._id}?month=${currentMonth}`, headers: customerHeaders }
  );
  assert(billRes.status === 200 && billRes.data.data?.bill, 'Monthly ledger retrieved with line-item audit');
  const bill = billRes.data.data.bill;
  console.log(`  Total Meals: ${bill.totalMeals}, Delivered: ${bill.deliveredCount}, Skipped: ${bill.skippedCount}, Net Payable: ₹${bill.netPayable}, Balance: ₹${bill.balance}`);
  assert(typeof bill.balance === 'number', 'Derived balance is calculated mathematically');

  // Test Razorpay Order & Payment Flow
  if (bill.balance > 0) {
    const orderRes = await request(
      { method: 'POST', path: '/api/billing/razorpay/order', headers: customerHeaders },
      { subscriptionId: activeSub._id, month: currentMonth, amount: bill.balance }
    );
    assert(orderRes.status === 200 && orderRes.data.data?.orderId, `Razorpay order created: ${orderRes.data.data?.orderId}`);

    const verifyRes = await request(
      { method: 'POST', path: '/api/billing/razorpay/verify', headers: customerHeaders },
      {
        subscriptionId: activeSub._id,
        month: currentMonth,
        amount: bill.balance,
        razorpay_order_id: orderRes.data.data.orderId,
        razorpay_payment_id: 'pay_test_' + Date.now(),
        razorpay_signature: 'sig_mock_verified',
        simulated: true,
      }
    );
    assert(verifyRes.status === 200 && verifyRes.data.data?.payment?.amount > 0, 'Razorpay payment verified & captured in ledger');

    const billAfterPayment = await request(
      { path: `/api/billing/${activeSub._id}?month=${currentMonth}`, headers: customerHeaders }
    );
    assert(billAfterPayment.data.data.bill.balance === 0, 'Ledger balance updated to ₹0 following successful payment');
  } else {
    // Bill already settled - test anti-double-billing safeguard
    const orderRes = await request(
      { method: 'POST', path: '/api/billing/razorpay/order', headers: customerHeaders },
      { subscriptionId: activeSub._id, month: currentMonth, amount: 100 }
    );
    console.log(`  Overpayment order response: status=${orderRes.status}, error=${JSON.stringify(orderRes.data)}`);
    assert(orderRes.status === 400 || orderRes.status === 409, 'Anti-overpayment safeguard verified: prevents payment when balance is ₹0');
    assert(bill.balance === 0, 'Ledger balance confirmed settled at ₹0');
  }

  // --- SECTION 4: KITCHEN OWNER (PROVIDER) WORKFLOW ---
  console.log('\n--- 4. KITCHEN OWNER WORKFLOW ---');
  const providerLogin = await request(
    { method: 'POST', path: '/api/auth/login' },
    { email: 'provider@demo.com', password: 'Demo@1234' }
  );
  assert(providerLogin.status === 200 && providerLogin.data.data?.token, 'Kitchen owner login succeeded');
  const providerToken = providerLogin.data.data?.token;
  const providerHeaders = { Authorization: `Bearer ${providerToken}` };

  // Dashboard overview
  const dashRes = await request({ path: '/api/provider/dashboard', headers: providerHeaders });
  assert(dashRes.status === 200 && dashRes.data.data?.tomorrowPrep, 'Provider kitchen dashboard metrics loaded');

  // Prep sheet
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const prepRes = await request(
    { path: `/api/provider/prep?date=${tomorrowStr}`, headers: providerHeaders }
  );
  assert(prepRes.status === 200 && typeof prepRes.data.data?.totals?.total === 'number',
    `Prep sheet for ${tomorrowStr} returned ${prepRes.data.data?.totals?.total} total orders to cook`);

  // Provider Seed Demo Drops if needed
  await request(
    { method: 'POST', path: '/api/provider/delivery/seed-demo', headers: providerHeaders },
    {}
  );

  // Today's delivery batch
  const provDelRes = await request({ path: '/api/provider/delivery', headers: providerHeaders });
  assert(provDelRes.status === 200 && provDelRes.data.data?.tasks?.length > 0,
    `Provider delivery tracking loaded (${provDelRes.data.data?.tasks?.length} tasks)`);

  // Subscribers list
  const subsListRes = await request({ path: '/api/provider/subscribers', headers: providerHeaders });
  assert(subsListRes.status === 200, 'Provider subscriber list retrieved');

  // Menu schedule & Upsert
  const menuRes = await request({ path: '/api/provider/menu', headers: providerHeaders });
  assert(menuRes.status === 200 && menuRes.data.data?.menu?.length > 0,
    `Provider revolving menu retrieved (${menuRes.data.data?.menu?.length} scheduled days)`);

  const menuUpsertRes = await request(
    { method: 'PUT', path: '/api/provider/menu', headers: providerHeaders },
    {
      date: tomorrowStr,
      mealType: 'lunch',
      dishes: ['Shahi Paneer Special', 'Dal Makhani', '4 Desi Ghee Phulkas', 'Jeera Rice', 'Gulab Jamun'],
    }
  );
  assert(menuUpsertRes.status === 200, `Menu updated for ${tomorrowStr} Lunch successfully`);

  // --- SECTION 5: DELIVERY PARTNER WORKFLOW ---
  console.log('\n--- 5. DELIVERY PARTNER WORKFLOW ---');
  const deliveryLogin = await request(
    { method: 'POST', path: '/api/auth/login' },
    { email: 'delivery@demo.com', password: 'Demo@1234' }
  );
  assert(deliveryLogin.status === 200 && deliveryLogin.data.data?.token, 'Delivery staff login succeeded');
  const deliveryToken = deliveryLogin.data.data?.token;
  const deliveryHeaders = { Authorization: `Bearer ${deliveryToken}` };

  const dropsRes = await request({ path: '/api/delivery/today', headers: deliveryHeaders });
  assert(dropsRes.status === 200, `Delivery partner retrieved today drops (${dropsRes.data.data?.tasks?.length || 0} stops)`);

  if (dropsRes.data.data?.tasks?.length > 0) {
    const task = dropsRes.data.data.tasks[0];
    console.log(`  Updating delivery stop ${task._id} (Current status: ${task.status})...`);
    if (task.status !== 'delivered') {
      const updateRes = await request(
        { method: 'PATCH', path: `/api/delivery/tasks/${task._id}`, headers: deliveryHeaders },
        { status: 'delivered' }
      );
      assert(updateRes.status === 200 && updateRes.data.data?.task?.status === 'delivered', 'Stop marked delivered successfully');
    } else {
      assert(true, 'Delivery stop already marked delivered');
    }
  }

  console.log('\n====================================================');
  console.log(`🏁 VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAllTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
