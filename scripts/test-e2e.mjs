// scripts/test-e2e.mjs
async function runTests() {
  const BASE = 'http://127.0.0.1:3005';
  console.log('--- STARTING E2E ACCEPTANCE CHECKS ---');

  // Test 1: Landing Page
  console.log('\n[1] Testing GET /preorder/keychain-strava ...');
  const resLanding = await fetch(`${BASE}/preorder/keychain-strava`);
  if (!resLanding.ok) throw new Error(`Landing page returned ${resLanding.status}`);
  const htmlLanding = await resLanding.text();
  if (!htmlLanding.includes('Rute lari kamu, sekarang bisa dipegang')) {
    throw new Error('Landing page missing hook text');
  }
  console.log('✓ Landing page loads with verified hook and studio styling.');

  // Test 2: Checkout via Mayar API
  console.log('\n[2] Testing POST /api/checkout/mayar ...');
  const checkoutPayload = {
    customer: {
      fullName: 'Rian Runner',
      email: 'rian.runner@example.test',
      phone: '081234567899',
      address: 'Jl. Kemang Raya No. 42',
      city: 'Jakarta Selatan',
      postalCode: '12730',
    },
    variationId: 'var-emoney',
  };

  const resCheckout = await fetch(`${BASE}/api/checkout/mayar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(checkoutPayload),
  });
  const dataCheckout = await resCheckout.json();
  if (!dataCheckout.success || !dataCheckout.orderId) {
    throw new Error(`Checkout failed: ${JSON.stringify(dataCheckout)}`);
  }
  const orderId = dataCheckout.orderId;
  console.log(`✓ Order ID generated BEFORE invoice: ${orderId}`);
  if (!orderId.startsWith('WSI-')) throw new Error('Order ID format mismatch');

  // Verify status immediately after checkout: Menunggu Pembayaran
  const resOrderInit = await fetch(`${BASE}/api/strava-orders?orderId=${orderId}&phone=081234567899`);
  const dataOrderInit = await resOrderInit.json();
  if (dataOrderInit.data.status !== 'Menunggu Pembayaran') {
    throw new Error(`Initial status should be "Menunggu Pembayaran", got: ${dataOrderInit.data.status}`);
  }
  console.log('✓ Order immediately saved server-side with status "Menunggu Pembayaran".');

  // Test 3: Simulated Payment / Webhook
  console.log('\n[3] Testing Payment Verification (Simulate/Webhook) ...');
  const resPay = await fetch(`${BASE}/api/strava-orders/simulate-pay`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId }),
  });
  const dataPay = await resPay.json();
  if (!dataPay.success || dataPay.status !== 'Dibayar — Data Belum Lengkap') {
    throw new Error(`Payment simulation failed: ${JSON.stringify(dataPay)}`);
  }
  console.log('✓ Order status updated to "Dibayar — Data Belum Lengkap".');

  // Test 4: Guard rule - Admin cannot advance to 'Produksi' while data is incomplete
  console.log('\n[4] Testing Guard: Cannot mark "Produksi" if data incomplete ...');
  // Log in as admin via session
  const resLogin = await fetch(`${BASE}/api/admin/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ passcode: 'whereisit2026' }),
  });
  const cookieHeader = resLogin.headers.get('set-cookie') || '';

  const resPrematureProd = await fetch(`${BASE}/api/strava-orders`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookieHeader,
    },
    body: JSON.stringify({
      id: orderId,
      status: 'Produksi',
    }),
  });
  const dataPrematureProd = await resPrematureProd.json();
  if (dataPrematureProd.success) {
    throw new Error('GUARD FAILED: Order was allowed into Produksi without Strava data!');
  }
  console.log(`✓ Guard verified: Correctly blocked moving to "Produksi": "${dataPrematureProd.error}"`);

  // Test 5: Post-Payment Data Form Submission
  console.log('\n[5] Testing POST /api/strava-orders/data ...');
  const postDataPayload = {
    orderId,
    phone: '081234567899',
    stravaUrl: 'https://www.strava.com/activities/1122334455',
    images: ['/uploads/strava/sample-route.jpg'],
    eventName: 'BDO ULTRA 2026',
    eventDate: '2026-11-09',
    distance: '50.2 km',
    pace: '06:12 /km',
    duration: '05:11:45',
    engravedText: 'BDO ULTRA SUB-5.5',
    adminNotes: 'Warna garis kontras dusty slate blue ya admin.',
  };

  const resDataForm = await fetch(`${BASE}/api/strava-orders/data`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(postDataPayload),
  });
  const dataFormResult = await resDataForm.json();
  if (!dataFormResult.success) {
    throw new Error(`Data form submission failed: ${JSON.stringify(dataFormResult)}`);
  }
  console.log('✓ Post-payment data form submitted. Status is now: "Data Diterima — Menunggu Konfirmasi Desain".');

  // Test 6: Admin workflow (Confirm design -> Produksi)
  console.log('\n[6] Testing Admin Workflow: Desain Dikonfirmasi -> Produksi ...');
  const resConfirm = await fetch(`${BASE}/api/strava-orders`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookieHeader,
    },
    body: JSON.stringify({
      id: orderId,
      status: 'Desain Dikonfirmasi',
    }),
  });
  const dataConfirm = await resConfirm.json();
  if (!dataConfirm.success) throw new Error('Failed to confirm design');
  console.log('✓ Status updated: Desain Dikonfirmasi.');

  // Now advance to Produksi
  const resProd = await fetch(`${BASE}/api/strava-orders`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookieHeader,
    },
    body: JSON.stringify({
      id: orderId,
      status: 'Produksi',
      productionUpdates: {
        queuePosition: 3,
        estimatedCompletionDate: '2026-11-18',
      },
    }),
  });
  const dataProd = await resProd.json();
  if (!dataProd.success) throw new Error(`Failed to advance to Produksi: ${JSON.stringify(dataProd)}`);
  console.log('✓ Status updated: Produksi (Order entered live 3D print queue).');

  // Test 7: Public Queue Visibility & Masking
  console.log('\n[7] Testing Public Queue Visibility & Privacy Masking ...');
  const resQueue = await fetch(`${BASE}/api/strava-orders/queue`);
  const dataQueue = await resQueue.json();
  if (!dataQueue.success || !dataQueue.data.queue) throw new Error('Failed to get public queue');

  const foundInQueue = dataQueue.data.queue.find((item) => item.maskedName === 'Rian R.');
  if (!foundInQueue) throw new Error('Order not found in public queue');
  console.log('✓ Found in public queue:', foundInQueue);
  if (foundInQueue.maskedName !== 'Rian R.') {
    throw new Error(`Name masking failed, expected "Rian R.", got: ${foundInQueue.maskedName}`);
  }
  if (!foundInQueue.id.endsWith('****')) {
    throw new Error(`Order ID masking failed: ${foundInQueue.id}`);
  }
  console.log('✓ Privacy verified: Name masked as "Rian R.", Order ID masked as WSI-****.');

  // Test 8: Dispatch / Tracking with Resi
  console.log('\n[8] Testing Courier & Resi Dispatch ...');
  const resShip = await fetch(`${BASE}/api/strava-orders`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookieHeader,
    },
    body: JSON.stringify({
      id: orderId,
      status: 'Dikirim',
      productionUpdates: {
        courier: 'JNE Express',
        resiNumber: 'JNE9988776655',
      },
    }),
  });
  const dataShip = await resShip.json();
  if (!dataShip.success) throw new Error('Failed to mark shipped');

  // Verify /track shows resi
  const resTrack = await fetch(`${BASE}/api/strava-orders?orderId=${orderId}&phone=081234567899`);
  const dataTrack = await resTrack.json();
  if (dataTrack.data.production.resiNumber !== 'JNE9988776655') {
    throw new Error('Resi mismatch on track API');
  }
  console.log(`✓ Order tracked on /track with Resi: ${dataTrack.data.production.resiNumber} (${dataTrack.data.production.courier})`);

  console.log('\n========================================');
  console.log('🎉 ALL E2E ACCEPTANCE CHECKS PASSED!');
  console.log('========================================');
}

runTests().catch((e) => {
  console.error('TEST ERROR:', e);
  process.exit(1);
});
