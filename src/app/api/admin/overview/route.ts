import { NextResponse } from 'next/server';
import { 
  getProducts, 
  getOrders, 
  getStravaOrders,
  getCustomers, 
  getDesignInquiries, 
  getCharacterInquiries,
  getReviews,
  getStoreSettings
} from '@/lib/storage';

export async function GET() {
  try {
    const products = await getProducts();
    const orders = await getOrders();
    const stravaOrders = await getStravaOrders();
    const customers = await getCustomers();
    const designInquiries = await getDesignInquiries();
    const characterInquiries = await getCharacterInquiries();
    const reviews = await getReviews();
    const settings = await getStoreSettings();

    const storeSales = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const stravaSales = stravaOrders.reduce((sum, o) => sum + (o.total || o.price || 0), 0);
    const totalSales = storeSales + stravaSales;

    const totalOrders = orders.length + stravaOrders.length;
    const avgOrderValue = totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0;
    const totalCatalogValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);
    const lowStockItems = products.filter((p) => p.stock <= 5);
    const pendingInquiriesCount = 
      designInquiries.filter((d) => d.status === 'NEW').length + 
      characterInquiries.filter((c) => c.status === 'NEW').length;

    // Harmonize recent orders from regular store and Strava pre-orders
    const mappedStravaOrders = stravaOrders.map((so) => ({
      id: so.id,
      orderNumber: so.orderNumber || so.id,
      customer: {
        fullName: so.customer?.fullName || 'Pelari',
        city: so.customer?.city || 'Online',
      },
      items: [
        {
          productName: `Keychain Custom Strava (${so.variationName})`,
          quantity: 1,
          price: so.price,
        },
      ],
      shippingCarrier: so.production?.courierName || 'SiCepat / JNE',
      paymentStatus: so.status === 'Menunggu Pembayaran' ? 'UNPAID' : 'PAID',
      orderStatus: so.status,
      total: so.total || so.price,
      createdAt: so.createdAt,
    }));

    const recentOrders = [...orders, ...mappedStravaOrders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    return NextResponse.json({
      success: true,
      data: {
        totalSales,
        totalOrders,
        avgOrderValue,
        totalCatalogValue,
        totalProducts: products.length,
        totalCustomers: customers.length,
        lowStockCount: lowStockItems.length,
        pendingInquiriesCount,
        recentOrders,
        lowStockItems: lowStockItems.slice(0, 5),
        recentDesignInquiries: designInquiries.slice(0, 3),
        recentCharacterInquiries: characterInquiries.slice(0, 3),
        recentReviews: reviews.slice(0, 3),
        settings,
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch overview data' }, { status: 500 });
  }
}
