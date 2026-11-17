import fs from 'fs';
import path from 'path';

async function runTests() {
  const BASE = 'http://127.0.0.1:3005';
  console.log('--- STARTING PRODUCTION READINESS E2E SANDBOX CHECKS ---');

  // Test 1: Homepage + Coming Soon Pages + Lineup & Contact Audit
  console.log('\n[1] Testing Homepage, Coming Soon Pages & Contacts ...');
  const resHome = await fetch(`${BASE}/`);
  if (!resHome.ok) throw new Error(`Homepage returned ${resHome.status}`);
  const htmlHome = await resHome.text();
  if (!htmlHome.includes('6287776523066') || !htmlHome.includes('whereisit26@gmail.com') || !htmlHome.includes('@whereisit.ofc')) {
    throw new Error('Homepage footer/page missing updated official contacts');
  }
  if (htmlHome.includes('812-3456-7890') || htmlHome.includes('studio@whereisit.design') || htmlHome.includes('@whereisit.studio')) {
    throw new Error('Homepage still contains wrong placeholder contacts!');
  }
  if (!htmlHome.includes('Activity Ring Lamp') || !htmlHome.includes('Floating Magnetic Lamp')) {
    throw new Error('Homepage missing Segera Hadir lineup items');
  }
  console.log('✓ Homepage verified (official contacts, Coming Soon lineup, no placeholder products).');

  // Check /strava-route-lamp and /smart-cube
  const resLamp = await fetch(`${BASE}/strava-route-lamp`);
  if (!resLamp.ok) throw new Error(`/strava-route-lamp returned ${resLamp.status}`);
  const htmlLamp = await resLamp.text();
  if (!htmlLamp.includes('Personalized Strava Route Lamp') || htmlLamp.includes('599.000')) {
    throw new Error('Strava Route Lamp Coming Soon check failed (missing title or leaked unconfirmed price)');
  }

  const resCube = await fetch(`${BASE}/smart-cube`);
  if (!resCube.ok) throw new Error(`/smart-cube returned ${resCube.status}`);
  const htmlCube = await resCube.text();
  if (!htmlCube.includes('Smart Cube') || htmlCube.includes('1.554.000')) {
    throw new Error('Smart Cube Coming Soon check failed (missing title or leaked HPP estimate)');
  }
  console.log('✓ /strava-route-lamp and /smart-cube verified as Coming Soon with zero prices.');

  // Test 2: Landing Page /preorder/keychain-strava (Exact Shopee Names, 3 Unique Photos)
  console.log('\n[2] Testing GET /preorder/keychain-strava ...');
  const resLanding = await fetch(`${BASE}/preorder/keychain-strava`);
  if (!resLanding.ok) throw new Error(`Landing page returned ${resLanding.status}`);
  const htmlLanding = await resLanding.text();
  if (!htmlLanding.includes('Keychain Custom Data Strava x Where Is It? 3D print Custom')) {
    throw new Error('Landing page missing exact Shopee product name');
  }
  if (!htmlLanding.includes('10x5 cm') || !htmlLanding.includes('10x5 cm Emoney') || !htmlLanding.includes('10x5 cm Flazz')) {
    throw new Error('Landing page missing exact 3 Shopee variation names');
  }
  if (!htmlLanding.includes('keychain-04.jpg') || !htmlLanding.includes('keychain-05.jpg') || !htmlLanding.includes('keychain-06.jpg')) {
    throw new Error('Landing page missing unique photos keychain-04/05/06');
  }
  if (htmlLanding.includes('keychain-01.jpg') || htmlLanding.includes('keychain-02.jpg') || htmlLanding.includes('keychain-03.jpg')) {
    throw new Error('Landing page still references deleted duplicate photos 01/02/03');
  }
  console.log('✓ Keychain landing page verified (exact Shopee product/variations + 3 unique photos).');

  // Test 3: Notify List Signup & Admin Grouping
  console.log('\n[3] Testing Coming Soon Notify List API ...');
  const resNotifyLamp = await fetch(`${BASE}/api/notify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test Runner', whatsapp: '081299990001', product: 'Strava Route Lamp' }),
  });
  const dataNotifyLamp = await resNotifyLamp.json();
  if (!dataNotifyLamp.success || dataNotifyLamp.data.categoryGroup !== 'Minat Lamp') {
    throw new Error(`Notify Lamp failed: ${JSON.stringify(dataNotifyLamp)}`);
  }
  const resNotifyCube = await fetch(`${BASE}/api/notify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test Runner', whatsapp: '081299990001', product: 'Smart Cube' }),
  });
  const dataNotifyCube = await resNotifyCube.json();
  if (!dataNotifyCube.success || dataNotifyCube.data.categoryGroup !== 'Minat Cube') {
    throw new Error(`Notify Cube failed: ${JSON.stringify(dataNotifyCube)}`);
  }
  console.log('✓ Notify List verified ("Minat Lamp" and "Minat Cube" stored server-side).');

  // Test 4: Checkout Variant 3 ("10x5 cm Flazz", Rp200.000) via Mayar Sandbox
  console.log('\n[4] Testing Checkout for Variant 3 ("10x5 cm Flazz", Rp200.000) ...');
  const checkoutPayload = {
    customer: {
      fullName: 'Rian Runner',
      email: 'rian.runner@example.test',
      phone: '081234567899',
      address: 'Jl. Kemang Raya No. 42',
      city: 'Jakarta Selatan',
      postalCode: '12730',
    },
    variationId: 'var-flazz',
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

  const resOrderInit = await fetch(`${BASE}/api/strava-orders?orderId=${orderId}&phone=081234567899`);
  const dataOrderInit = await resOrderInit.json();
  if (dataOrderInit.data.variationName !== '10x5 cm Flazz' || dataOrderInit.data.total !== 200000 || dataOrderInit.data.status !== 'Menunggu Pembayaran') {
    throw new Error(`Order check mismatch: ${JSON.stringify(dataOrderInit.data)}`);
  }
  console.log('✓ Variant 3 saved server-side ("10x5 cm Flazz", Rp200.000, status "Menunggu Pembayaran").');

  // Test 5: Webhook Security & Negative Verification + Positive Payment + Idempotency
  console.log('\n[5] Testing Mayar Webhook Verification & Guard Rules ...');
  const resWrongToken = await fetch(`${BASE}/api/webhooks/mayar/invalid-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event: 'payment.received', data: { id: 'TX-BAD', status: 'paid', amount: 200000, extraData: { orderId } } }),
  });
  if (resWrongToken.status !== 401) throw new Error('Webhook failed to reject invalid token!');

  const resUnpaidStatus = await fetch(`${BASE}/api/webhooks/mayar/sandbox-webhook-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event: 'payment.received', data: { id: 'TX-UNPAID', status: 'pending', amount: 200000, extraData: { orderId } } }),
  });
  if (resUnpaidStatus.ok) throw new Error('Webhook allowed non-paid status!');

  const resWrongAmount = await fetch(`${BASE}/api/webhooks/mayar/sandbox-webhook-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event: 'payment.received', data: { id: 'TX-MISMATCH', status: 'paid', amount: 119000, extraData: { orderId } } }),
  });
  if (resWrongAmount.ok) throw new Error('Webhook allowed mismatched amount!');

  // Positive verified webhook
  const resValidWebhook = await fetch(`${BASE}/api/webhooks/mayar/sandbox-webhook-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event: 'payment.received',
      data: { id: `TX-SBX-${orderId}`, status: 'paid', amount: 200000, paymentMethod: 'QRIS', extraData: { orderId } },
    }),
  });
  const dataValidWebhook = await resValidWebhook.json();
  if (!dataValidWebhook.success || dataValidWebhook.status !== 'Dibayar — Data Belum Lengkap') {
    throw new Error(`Valid webhook failed: ${JSON.stringify(dataValidWebhook)}`);
  }

  // Idempotent second call
  const resIdempotent = await fetch(`${BASE}/api/webhooks/mayar/sandbox-webhook-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event: 'payment.received',
      data: { id: `TX-SBX-${orderId}`, status: 'paid', amount: 200000, extraData: { orderId } },
    }),
  });
  const dataIdemp = await resIdempotent.json();
  if (!dataIdemp.success || !dataIdemp.idempotent) {
    throw new Error(`Idempotency check failed: ${JSON.stringify(dataIdemp)}`);
  }
  console.log('✓ Webhook verified: Rejects bad tokens/unpaid/mismatched amounts, approves exact match once (idempotent).');

  // Test 6: Admin Session & Production Guard Check
  console.log('\n[6] Testing Admin Production Guard & Post-Payment Data Form ...');
  const resLogin = await fetch(`${BASE}/api/admin/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ passcode: 'whereisit2026' }),
  });
  const cookieHeader = resLogin.headers.get('set-cookie') || '';

  const resGuard = await fetch(`${BASE}/api/strava-orders`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: cookieHeader },
    body: JSON.stringify({ id: orderId, status: 'Produksi' }),
  });
  const dataGuard = await resGuard.json();
  if (dataGuard.success) throw new Error('GUARD FAILED: Moved incomplete order into Produksi!');
  console.log('✓ Guard blocked moving incomplete order into Produksi.');

  const resDataForm = await fetch(`${BASE}/api/strava-orders/data`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
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
      adminNotes: 'Warna garis rute dusty slate blue.',
    }),
  });
  const dataFormResult = await resDataForm.json();
  if (!dataFormResult.success) throw new Error(`Data form submit failed: ${JSON.stringify(dataFormResult)}`);

  // Confirm design & move to Produksi
  await fetch(`${BASE}/api/strava-orders`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: cookieHeader },
    body: JSON.stringify({ id: orderId, status: 'Desain Dikonfirmasi' }),
  });
  const resProd = await fetch(`${BASE}/api/strava-orders`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: cookieHeader },
    body: JSON.stringify({ id: orderId, status: 'Produksi' }),
  });
  const dataProd = await resProd.json();
  if (!dataProd.success) throw new Error(`Failed moving to Produksi: ${JSON.stringify(dataProd)}`);
  console.log('✓ Post-payment data form submitted & order moved to Produksi.');

  // Test 7: Public Queue Masking & Dynamic Estimate Calculation
  console.log('\n[7] Testing Public Queue Privacy & Dynamic Estimate Calculation ...');
  const resQueue = await fetch(`${BASE}/api/strava-orders/queue`);
  const dataQueue = await resQueue.json();
  const foundInQueue = dataQueue.data.queue.find((item) => item.maskedName === 'Rian R.');
  if (!foundInQueue) throw new Error('Order missing from public queue');
  if (!foundInQueue.id.endsWith('****') || !foundInQueue.estimatedDate) {
    throw new Error(`Masking or computed estimate missing: ${JSON.stringify(foundInQueue)}`);
  }
  const rawQueueJson = JSON.stringify(foundInQueue);
  if (rawQueueJson.includes('081234567899') || rawQueueJson.includes('strava.com') || rawQueueJson.includes('Kemang')) {
    throw new Error('PRIVACY LEAK DETECTED IN PUBLIC QUEUE!');
  }
  console.log(`✓ Queue verified: ${foundInQueue.id} | ${foundInQueue.maskedName} | Est: ${foundInQueue.estimatedDate}`);

  // Test 8: Strava Media Manager + YouTube Shorts (9:16) vs Full (16:9) Detection
  console.log('\n[8] Testing Media Manager & YouTube Shorts/Full Ratio Detection ...');
  const resMetaShort = await fetch(`${BASE}/api/media/youtube-meta?url=${encodeURIComponent('https://www.youtube.com/shorts/dQw4w9WgXcQ')}`);
  const metaShort = await resMetaShort.json();
  if (!metaShort.success || metaShort.data.detectedFormat !== 'short' || metaShort.data.detectedRatio !== '9:16') {
    throw new Error(`YouTube Shorts detection failed: ${JSON.stringify(metaShort)}`);
  }

  const resMetaFull = await fetch(`${BASE}/api/media/youtube-meta?url=${encodeURIComponent('https://youtu.be/dQw4w9WgXcQ')}`);
  const metaFull = await resMetaFull.json();
  if (!metaFull.success || metaFull.data.detectedFormat !== 'full' || metaFull.data.detectedRatio !== '16:9') {
    throw new Error(`YouTube Full detection failed: ${JSON.stringify(metaFull)}`);
  }

  const resMediaPage = await fetch(`${BASE}/admin/content/keychain-media`);
  if (!resMediaPage.ok) throw new Error(`Media admin page returned ${resMediaPage.status}`);

  const resMediaPut = await fetch(`${BASE}/api/strava-media`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Cookie: cookieHeader },
    body: JSON.stringify({
      heroImage: '/images/strava-keychain/keychain-04.jpg',
      gallery: [
        {
          id: 'vid-yt-test',
          type: 'video',
          title: 'Test Shorts MRT',
          caption: 'Video 9:16',
          src: 'https://www.youtube.com/shorts/dQw4w9WgXcQ',
          videoFormat: 'short',
          aspectRatio: '9:16',
          isTodo: false,
        },
      ],
    }),
  });
  const mediaPutJson = await resMediaPut.json();
  if (!mediaPutJson.success || mediaPutJson.data.gallery[0].aspectRatio !== '9:16') {
    throw new Error(`Failed saving YouTube media config: ${JSON.stringify(mediaPutJson)}`);
  }

  // Restore clean default media config
  await fetch(`${BASE}/api/strava-media`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Cookie: cookieHeader },
    body: JSON.stringify({ resetToDefault: true }),
  });
  console.log('✓ YouTube Shorts (9:16) / Full Video (16:9) detection & /api/strava-media persistence verified.');

  // Clean up synthetic test records so seed data stays pristine
  const ordersFile = path.join(process.cwd(), 'data', 'strava-orders.json');
  if (fs.existsSync(ordersFile)) {
    const orders = JSON.parse(fs.readFileSync(ordersFile, 'utf-8'));
    const cleaned = orders.filter((o) => o.id !== orderId);
    fs.writeFileSync(ordersFile, JSON.stringify(cleaned, null, 2));
  }
  const notifyFile = path.join(process.cwd(), 'data', 'notify-list.json');
  if (fs.existsSync(notifyFile)) {
    const entries = JSON.parse(fs.readFileSync(notifyFile, 'utf-8'));
    const cleaned = entries.filter((n) => n.whatsapp !== '081299990001');
    fs.writeFileSync(notifyFile, JSON.stringify(cleaned, null, 2));
  }

  console.log('\n========================================');
  console.log('ALL PRODUCTION SANDBOX & E2E CHECKS PASSED!');
  console.log('========================================');
}

runTests().catch((e) => {
  console.error('TEST ERROR:', e);
  process.exit(1);
});
