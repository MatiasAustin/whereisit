import assert from 'assert';

const BASE = 'http://localhost:3005';

async function testSupabaseApi() {
  console.log('Testing Supabase Admin API...');

  // 1. Test unauthorized access without session
  const resUnauth = await fetch(`${BASE}/api/admin/supabase`);
  assert.strictEqual(resUnauth.status, 401, 'Should reject unauthenticated requests');
  console.log('✓ Unauthorized access properly rejected (401)');

  // 2. Test with admin session cookie
  const headers = {
    'Cookie': 'whereisit_admin_session=authenticated',
    'Content-Type': 'application/json',
  };

  const resAuth = await fetch(`${BASE}/api/admin/supabase`, { headers });
  assert.strictEqual(resAuth.status, 200);
  const data = await resAuth.json();
  assert.strictEqual(data.success, true);
  console.log('✓ Admin GET /api/admin/supabase succeeded. Current source:', data.config.source);

  // 3. Test testing connection with mock / placeholder
  const resTest = await fetch(`${BASE}/api/admin/supabase/test`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      url: 'https://demo-test-project.supabase.co',
      key: 'test-key-mock',
    }),
  });
  const testData = await resTest.json();
  assert.strictEqual(testData.success, true);
  console.log('✓ POST /api/admin/supabase/test returned connection check:', testData.data.connected);

  // 4. Test downloading / viewing SQL schema
  const resSql = await fetch(`${BASE}/supabase-schema.sql`);
  assert.strictEqual(resSql.status, 200);
  const sql = await resSql.text();
  assert(sql.includes('CREATE TABLE IF NOT EXISTS public.products'), 'SQL schema missing products table');
  assert(sql.includes('CREATE TABLE IF NOT EXISTS public.strava_orders'), 'SQL schema missing strava_orders table');
  assert(sql.includes('CREATE TABLE IF NOT EXISTS public.notify_list'), 'SQL schema missing notify_list table');
  console.log('✓ /supabase-schema.sql served and verified (contains all core tables)');

  console.log('ALL SUPABASE ADMIN API CHECKS PASSED!');
}

testSupabaseApi().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
