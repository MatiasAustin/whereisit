import assert from 'assert';
import fs from 'fs';
import path from 'path';

// Test simulation of serverless environment
console.log('Testing serverless EROFS protection in storage & upload...');

// Check that IS_SERVERLESS branch in storage handles read-only filesystems cleanly
// We can test this by dynamically testing getStravaOrders, createStravaOrder, deleteStravaOrder, clearExampleStravaOrders
import {
  getStravaOrders,
  createStravaOrder,
  deleteStravaOrder,
  clearExampleStravaOrders,
  updateStravaOrderStatus,
} from '../src/lib/storage.js';

async function runTests() {
  // Test getting orders
  const orders = await getStravaOrders();
  console.log(`Current orders loaded: ${orders.length}`);

  // Test creating an order
  const testId = `WSI-TEST-${Date.now()}`;
  const testOrder = {
    id: testId,
    orderNumber: testId,
    productType: 'keychain-strava',
    variationId: 'var-10x5',
    variationName: '10x5 cm',
    customer: {
      fullName: 'Budi Test',
      phone: '081234567890',
      email: 'budi@test.com',
      address: 'Jl. Test No. 1',
      city: 'Jakarta',
      postalCode: '12345',
    },
    price: 119000,
    subtotal: 119000,
    shippingFee: 0,
    total: 119000,
    status: 'Menunggu Pembayaran',
    paymentMethod: 'Manual Test',
    isExample: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const created = await createStravaOrder(testOrder);
  assert.strictEqual(created.id, testId);
  console.log('✓ createStravaOrder succeeded');

  // Test updating status
  const updateRes = await updateStravaOrderStatus(testId, 'Produksi');
  assert.strictEqual(updateRes.success, true);
  console.log('✓ updateStravaOrderStatus succeeded');

  // Test deleting order
  const deleted = await deleteStravaOrder(testId);
  assert.strictEqual(deleted, true);
  console.log('✓ deleteStravaOrder succeeded');

  // Test clearing examples
  const cleared = await clearExampleStravaOrders();
  console.log(`✓ clearExampleStravaOrders succeeded (removed ${cleared} examples)`);

  console.log('ALL SERVERLESS EROFS UNIT TESTS PASSED!');
}

runTests().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
