import { NextResponse } from 'next/server';
import { generateOrderId } from '@/lib/mayar';
import { createStravaOrder, getStravaOrderById, getStravaVariations } from '@/lib/storage';
import {
  getClickyPaymentLink,
  CLICKY_SHIPPING_RATES,
  ClickyShippingRegion,
  normalizeVariationId,
  calculateClickyEstimatedFee,
} from '@/lib/clicky';
import { StravaPreOrder } from '@/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customer, variationId, shippingRegion, existingOrderId } = body;

    // 1. Validate customer checkout fields
    if (!customer?.fullName?.trim()) {
      return NextResponse.json({ success: false, error: 'Nama lengkap wajib diisi' }, { status: 400 });
    }
    if (!customer?.phone?.trim() || customer.phone.replace(/\D/g, '').length < 8) {
      return NextResponse.json(
        { success: false, error: 'Nomor WhatsApp / HP wajib diisi dengan benar (min. 8 digit)' },
        { status: 400 }
      );
    }
    if (!customer?.address?.trim()) {
      return NextResponse.json({ success: false, error: 'Alamat pengiriman lengkap wajib diisi' }, { status: 400 });
    }

    // 2. Validate Region (Jabodetabek vs Luar Jabodetabek)
    const validRegion: ClickyShippingRegion =
      shippingRegion === 'Luar Jabodetabek' ? 'Luar Jabodetabek' : 'Jabodetabek';
    const shippingFee = CLICKY_SHIPPING_RATES[validRegion];

    // 3. Resolve Variation & Price
    const variations = await getStravaVariations();
    const normalizedId = normalizeVariationId(variationId);
    const variation =
      variations.find((v) => normalizeVariationId(v.id) === normalizedId) || variations[0];

    const price = variation.price;
    const total = price + shippingFee;

    // 4. Resolve Clicky link
    const clickyPaymentUrl = getClickyPaymentLink(variation.id, validRegion);

    // 5. Order ID Management (Prevent duplicates on retry)
    let orderId = existingOrderId;
    let existingOrder: StravaPreOrder | undefined;

    if (orderId) {
      existingOrder = await getStravaOrderById(orderId);
    }

    if (!existingOrder) {
      orderId = generateOrderId();
    } else {
      orderId = existingOrder.id;
    }

    // 6. Record estimated Clicky Fee (QRIS 5% / VA Rp6.500)
    const estimatedClickyFee = calculateClickyEstimatedFee(total, 'QRIS');

    // 7. Save order server-side before redirect
    const newOrder: StravaPreOrder = {
      id: orderId,
      orderNumber: orderId,
      productType: 'keychain-strava',
      variationId: variation.id,
      variationName: variation.name,
      customer: {
        fullName: customer.fullName.trim(),
        email: customer.email?.trim() || '',
        phone: customer.phone.trim(),
        address: customer.address.trim(),
        city: customer.city?.trim() || validRegion,
        postalCode: customer.postalCode?.trim() || '',
        notes: customer.notes?.trim() || '',
      },
      price,
      subtotal: price,
      shippingFee,
      shippingRegion: validRegion,
      total,
      status: existingOrder?.status === 'Dibayar — Data Belum Lengkap' 
        ? existingOrder.status 
        : 'Menunggu Pembayaran',
      paymentMethod: 'Clicky',
      paymentVerified: false,
      clickyFee: estimatedClickyFee,
      paymentDetails: {
        paymentUrl: clickyPaymentUrl,
        clickyLink: clickyPaymentUrl,
      },
      createdAt: existingOrder?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await createStravaOrder(newOrder);

    return NextResponse.json({
      success: true,
      orderId,
      orderNumber: orderId,
      paymentUrl: clickyPaymentUrl,
      price,
      shippingFee,
      shippingRegion: validRegion,
      total,
      variationId: variation.id,
      variationName: variation.name,
      customerName: newOrder.customer.fullName,
      customerPhone: newOrder.customer.phone,
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      }
    });
  } catch (error: any) {
    console.error('Clicky checkout creation error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal memproses pesanan Clicky' },
      { status: 500 }
    );
  }
}
