import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabaseServerClient } from '@/lib/supabaseServer';
import {
  getProducts,
  getStravaOrders,
  getNotifyList,
  getStoreSettings,
  getCollections,
  getCustomers,
  getDiscounts,
  getReviews,
  getJournalArticles,
} from '@/lib/storage';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('whereisit_admin_session');
    if (!session || session.value !== 'authenticated') {
      return NextResponse.json({ success: false, error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    const supabase = getSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json({
        success: false,
        error: 'Supabase belum terkonfigurasi. Silakan isi URL dan API Key terlebih dahulu.',
      }, { status: 400 });
    }

    const report: Record<string, { count: number; error?: string }> = {};

    // 1. Products & Purge Duplicates
    try {
      // Clean up duplicate legacy id if present in Supabase
      await supabase.from('products').delete().in('id', [
        'keychain-strava',
        'prod-001',
        'prod-002',
        'prod-003',
        'prod-004',
        'prod-005',
        'prod-006',
      ]);

      const products = await getProducts();
      if (products.length > 0) {
        const payload = products.map((p) => ({
          id: p.id,
          slug: p.slug,
          name: p.name,
          category: p.category,
          price: Number(p.price),
          compare_at_price: p.compareAtPrice ? Number(p.compareAtPrice) : null,
          badge: p.badge || null,
          description: p.description || '',
          short_description: p.shortDescription || '',
          materials: p.materials || '',
          dimensions: p.dimensions || '',
          weight: p.weight || '',
          layer_resolution: p.layerResolution || '',
          color_options: p.colorOptions || ['10x5 cm', '10x5 cm Emoney', '10x5 cm Flazz'],
          images: [
            '/images/strava-keychain/keychain-04.jpg',
            '/images/strava-keychain/keychain-05.jpg',
            '/images/strava-keychain/keychain-06.jpg',
          ],
          featured: Boolean(p.featured),
          stock: Number(p.stock ?? 10),
          status: p.status || 'ACTIVE',
          rating: Number(p.rating ?? 5.0),
          tags: p.tags || [],
          created_at: p.createdAt || new Date().toISOString(),
          updated_at: p.updatedAt || new Date().toISOString(),
        }));
        const { error } = await supabase.from('products').upsert(payload, { onConflict: 'id' });
        report['products'] = { count: products.length, error: error?.message };
      }
    } catch (e: any) {
      report['products'] = { count: 0, error: e.message };
    }

    // 2. Strava Orders
    try {
      const stravaOrders = await getStravaOrders();
      if (stravaOrders.length > 0) {
        const payload = stravaOrders.map((o) => ({
          id: o.id,
          order_number: o.orderNumber,
          product_type: o.productType || 'keychain-strava',
          variation_id: o.variationId,
          variation_name: o.variationName,
          customer: o.customer,
          price: Number(o.price),
          subtotal: Number(o.subtotal),
          shipping_fee: Number(o.shippingFee || 0),
          total: Number(o.total),
          status: o.status,
          payment_method: o.paymentMethod,
          payment_details: o.paymentDetails || null,
          strava_data: o.stravaData || null,
          production: o.production || null,
          is_example: Boolean(o.isExample),
          created_at: o.createdAt || new Date().toISOString(),
          updated_at: o.updatedAt || new Date().toISOString(),
        }));
        const { error } = await supabase.from('strava_orders').upsert(payload, { onConflict: 'id' });
        report['strava_orders'] = { count: stravaOrders.length, error: error?.message };
      }
    } catch (e: any) {
      report['strava_orders'] = { count: 0, error: e.message };
    }

    // 3. Store Settings
    try {
      const settings = await getStoreSettings();
      const { error } = await supabase.from('store_settings').upsert({
        id: 'default',
        data: settings,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });
      report['store_settings'] = { count: 1, error: error?.message };
    } catch (e: any) {
      report['store_settings'] = { count: 0, error: e.message };
    }

    // 4. Notify List
    try {
      const notify = await getNotifyList();
      if (notify.length > 0) {
        const payload = notify.map((n) => ({
          id: n.id,
          name: n.name,
          whatsapp: n.whatsapp,
          product: n.product,
          category_group: n.categoryGroup || 'Umum',
          created_at: n.createdAt || new Date().toISOString(),
        }));
        const { error } = await supabase.from('notify_list').upsert(payload, { onConflict: 'id' });
        report['notify_list'] = { count: notify.length, error: error?.message };
      }
    } catch (e: any) {
      report['notify_list'] = { count: 0, error: e.message };
    }

    // 5. Collections
    try {
      // Purge any legacy template collections
      await supabase.from('collections').delete().not('id', 'in', '("col-strava","col-coming-soon")');

      const collections = await getCollections();
      if (collections.length > 0) {
        const payload = collections.map((c) => ({
          id: c.id,
          slug: c.slug,
          name: c.name,
          description: c.description || '',
          image: c.id === 'col-strava' ? '/images/strava-keychain/keychain-04.jpg' : c.image || '',
          product_count: c.productCount || 0,
          status: c.status || 'ACTIVE',
        }));
        const { error } = await supabase.from('collections').upsert(payload, { onConflict: 'id' });
        report['collections'] = { count: collections.length, error: error?.message };
      }
    } catch (e: any) {
      report['collections'] = { count: 0, error: e.message };
    }

    // 6. Customers
    try {
      const customers = await getCustomers();
      if (customers.length > 0) {
        const payload = customers.map((c) => ({
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
        const { error } = await supabase.from('customers').upsert(payload, { onConflict: 'id' });
        report['customers'] = { count: customers.length, error: error?.message };
      }
    } catch (e: any) {
      report['customers'] = { count: 0, error: e.message };
    }

    // 7. Discounts
    try {
      const discounts = await getDiscounts();
      if (discounts.length > 0) {
        const payload = discounts.map((d) => ({
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
        const { error } = await supabase.from('discounts').upsert(payload, { onConflict: 'id' });
        report['discounts'] = { count: discounts.length, error: error?.message };
      }
    } catch (e: any) {
      report['discounts'] = { count: 0, error: e.message };
    }

    // 8. Reviews
    try {
      const reviews = await getReviews();
      if (reviews.length > 0) {
        const payload = reviews.map((r: any) => ({
          id: r.id,
          product_id: r.productId,
          product_name: r.productName,
          author: r.author,
          email: r.email,
          rating: r.rating,
          title: r.title,
          content: r.content,
          verified_purchase: Boolean(r.verifiedPurchase),
          status: r.status || 'APPROVED',
          created_at: r.createdAt || new Date().toISOString(),
        }));
        const { error } = await supabase.from('product_reviews').upsert(payload, { onConflict: 'id' });
        report['product_reviews'] = { count: reviews.length, error: error?.message };
      }
    } catch (e: any) {
      report['product_reviews'] = { count: 0, error: e.message };
    }

    // 9. Journal
    try {
      const articles = await getJournalArticles();
      if (articles.length > 0) {
        const payload = articles.map((j) => ({
          id: j.id,
          slug: j.slug,
          title: j.title,
          excerpt: j.excerpt || '',
          content: j.content || '',
          cover_image: j.coverImage || '',
          author: j.author || 'Studio Team',
          status: j.status || 'PUBLISHED',
          published_at: j.publishedAt || new Date().toISOString(),
        }));
        const { error } = await supabase.from('journal_articles').upsert(payload, { onConflict: 'id' });
        report['journal_articles'] = { count: articles.length, error: error?.message };
      }
    } catch (e: any) {
      report['journal_articles'] = { count: 0, error: e.message };
    }

    return NextResponse.json({
      success: true,
      message: 'Sinkronisasi data ke Supabase selesai!',
      report,
    });
  } catch (error: any) {
    console.error('Error syncing to Supabase:', error);
    return NextResponse.json({ success: false, error: error.message || 'Gagal sinkronisasi ke Supabase' }, { status: 500 });
  }
}
