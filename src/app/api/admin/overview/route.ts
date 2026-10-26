import { NextResponse } from 'next/server';
import { 
  getProducts, 
  getOrders, 
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
    const customers = await getCustomers();
    const designInquiries = await getDesignInquiries();
    const characterInquiries = await getCharacterInquiries();
    const reviews = await getReviews();
    const settings = await getStoreSettings();

    const totalSales = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0;
    const totalCatalogValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);
    const lowStockItems = products.filter((p) => p.stock <= 5);
    const pendingInquiriesCount = designInquiries.filter((d) => d.status === 'NEW').length + characterInquiries.filter((c) => c.status === 'NEW').length;

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
        recentOrders: orders.slice(0, 5),
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
