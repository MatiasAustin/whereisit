import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...rest] = trimmed.split('=');
      const val = rest.join('=').replace(/^["']|["']$/g, '');
      process.env[key.trim()] = val.trim();
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase credentials missing. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function readData(filename) {
  const filePath = path.resolve(process.cwd(), 'data', filename);
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }
  return null;
}

async function runSeed() {
  console.log('🌱 Starting Supabase migration and data sync...');

  // 1. Products
  const products = readData('products.json');
  if (products && products.length) {
    console.log(`📦 Syncing ${products.length} products...`);
    const formatted = products.map(p => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      category: p.category,
      price: p.price,
      compare_at_price: p.compareAtPrice || null,
      badge: p.badge || null,
      description: p.description,
      short_description: p.shortDescription,
      materials: p.materials,
      dimensions: p.dimensions,
      weight: p.weight,
      layer_resolution: p.layerResolution,
      color_options: p.colorOptions || [],
      images: p.images || [],
      featured: p.featured || false,
      stock: p.stock || 10,
      status: p.status || 'ACTIVE',
      rating: p.rating || 5.0,
      tags: p.tags || [],
      created_at: p.createdAt || new Date().toISOString(),
      updated_at: p.updatedAt || new Date().toISOString(),
    }));
    const { error } = await supabase.from('products').upsert(formatted);
    if (error) console.error('  ⚠️ Error syncing products:', error.message);
    else console.log('  ✅ Products synced.');
  }

  // 2. Collections
  const collections = readData('collections.json');
  if (collections && collections.length) {
    console.log(`📂 Syncing ${collections.length} collections...`);
    const formatted = collections.map(c => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      description: c.description,
      image: c.image,
      product_count: c.productCount || 0,
      status: c.status || 'ACTIVE',
    }));
    const { error } = await supabase.from('collections').upsert(formatted);
    if (error) console.error('  ⚠️ Error syncing collections:', error.message);
    else console.log('  ✅ Collections synced.');
  }

  // 3. Store Settings
  const settings = readData('settings.json');
  if (settings) {
    console.log('⚙️ Syncing store settings...');
    const { error } = await supabase.from('store_settings').upsert({
      id: 'default',
      data: settings,
      updated_at: new Date().toISOString(),
    });
    if (error) console.error('  ⚠️ Error syncing settings:', error.message);
    else console.log('  ✅ Settings synced.');
  }

  // 4. Customers
  const customers = readData('customers.json');
  if (customers && customers.length) {
    console.log(`👥 Syncing ${customers.length} customers...`);
    const formatted = customers.map(c => ({
      id: c.id,
      first_name: c.firstName,
      last_name: c.lastName,
      email: c.email,
      phone: c.phone || null,
      customer_type: c.customerType || 'RETAIL',
      city: c.city || null,
      orders_count: c.ordersCount || 0,
      total_spent: c.totalSpent || 0,
      notes: c.notes || null,
      created_at: c.createdAt || new Date().toISOString(),
    }));
    const { error } = await supabase.from('customers').upsert(formatted);
    if (error) console.error('  ⚠️ Error syncing customers:', error.message);
    else console.log('  ✅ Customers synced.');
  }

  // 5. Discounts
  const discounts = readData('discounts.json');
  if (discounts && discounts.length) {
    console.log(`🎟️ Syncing ${discounts.length} discounts...`);
    const formatted = discounts.map(d => ({
      id: d.id,
      code: d.code,
      type: d.type,
      value: d.value,
      min_purchase: d.minPurchase || null,
      usage_limit: d.usageLimit || null,
      usage_count: d.usageCount || 0,
      status: d.status || 'ACTIVE',
      starts_at: d.startsAt || null,
      ends_at: d.endsAt || null,
      created_at: d.createdAt || new Date().toISOString(),
    }));
    const { error } = await supabase.from('discounts').upsert(formatted);
    if (error) console.error('  ⚠️ Error syncing discounts:', error.message);
    else console.log('  ✅ Discounts synced.');
  }

  // 6. Journal Articles
  const journal = readData('journal.json');
  if (journal && journal.length) {
    console.log(`📰 Syncing ${journal.length} journal articles...`);
    const formatted = journal.map(j => ({
      id: j.id,
      slug: j.slug,
      title: j.title,
      excerpt: j.excerpt,
      content: j.content,
      cover_image: j.coverImage,
      author: j.author,
      status: j.status || 'PUBLISHED',
      published_at: j.publishedAt || new Date().toISOString(),
    }));
    const { error } = await supabase.from('journal_articles').upsert(formatted);
    if (error) console.error('  ⚠️ Error syncing journal articles:', error.message);
    else console.log('  ✅ Journal articles synced.');
  }

  console.log('\n✨ Supabase sync finished!');
}

runSeed().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
