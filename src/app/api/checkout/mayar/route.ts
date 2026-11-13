import { NextResponse } from 'next/server';
import { generateOrderId, createMayarInvoice } from '@/lib/mayar';
import { STRAVA_PRODUCT_CONFIG } from '@/data/stravaKeychainConfig';
import { createStravaOrder, getStravaOrderById } from '@/lib/storage';
import { StravaPreOrder } from '@/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customer, variationId, existingOrderId } = body;

    // Validate minimal customer checkout fields
    if (!customer?.fullName?.trim()) {
      return NextResponse.json({ success: false, error: 'Nama lengkap wajib diisi' }, { status: 400 });
    }
    if (!customer?.email?.trim() || !customer.email.includes('@')) {
      return NextResponse.json({ success: false, error: 'Alamat email tidak valid' }, { status: 400 });
    }
    if (!customer?.phone?.trim() || customer.phone.replace(/\D/g, '').length < 8) {
      return NextResponse.json({ success: false, error: 'Nomor WhatsApp / HP wajib diisi dengan benar' }, { status: 400 });
    }
    if (!customer?.address?.trim()) {
      return NextResponse.json({ success: false, error: 'Alamat pengiriman wajib diisi' }, { status: 400 });
    }

    // Find variation
    const variation = STRAVA_PRODUCT_CONFIG.variations.find((v) => v.id === variationId) 
      || STRAVA_PRODUCT_CONFIG.variations[0];

    // If retrying an existing order, reuse the orderId rather than duplicating
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

    const price = variation.price;
    const shippingFee = 0; // Flat free shipping promotion / included
    const total = price + shippingFee;

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://whereisit-coral.vercel.app';
    const redirectUrl = `${siteUrl}/preorder/keychain-strava/success?orderId=${orderId}`;

    // Format clean Indonesian phone number for Mayar (standard digits or +62)
    let cleanMobile = customer.phone.replace(/\D/g, '');
    if (cleanMobile.startsWith('0')) {
      cleanMobile = '62' + cleanMobile.slice(1);
    }

    // 1. Save or update order server-side immediately as 'Menunggu Pembayaran'
    const newOrder: StravaPreOrder = {
      id: orderId,
      orderNumber: orderId,
      productType: 'keychain-strava',
      variationId: variation.id,
      variationName: variation.name,
      customer: {
        fullName: customer.fullName.trim(),
        email: customer.email.trim(),
        phone: customer.phone.trim(),
        address: customer.address.trim(),
        city: customer.city?.trim() || 'Jakarta',
        postalCode: customer.postalCode?.trim() || '',
        notes: customer.notes?.trim() || '',
      },
      price,
      subtotal: price,
      shippingFee,
      total,
      status: existingOrder?.status === 'Dibayar — Data Belum Lengkap' 
        ? existingOrder.status 
        : 'Menunggu Pembayaran',
      paymentMethod: 'Mayar Gateway (QRIS, VA, E-Wallet, Kartu)',
      createdAt: existingOrder?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await createStravaOrder(newOrder);

    // 2. Call Mayar Headless API V2
    const invoiceRes = await createMayarInvoice({
      orderId,
      name: newOrder.customer.fullName,
      email: newOrder.customer.email,
      mobile: cleanMobile,
      items: [
        {
          description: `Keychain Custom Data Strava - ${variation.name}`,
          quantity: 1,
          rate: variation.price,
        },
      ],
      redirectUrl,
    });

    if (!invoiceRes.success || !invoiceRes.paymentUrl) {
      console.error('Mayar invoice error:', invoiceRes.error);
      return NextResponse.json({
        success: false,
        error: invoiceRes.error || 'Gagal membuat invoice pembayaran Mayar. Silakan coba lagi.',
      }, { status: 502 });
    }

    // Save payment details to order record
    newOrder.paymentDetails = {
      invoiceId: invoiceRes.invoiceId,
      paymentUrl: invoiceRes.paymentUrl,
    };
    await createStravaOrder(newOrder);

    return NextResponse.json({
      success: true,
      orderId,
      paymentUrl: invoiceRes.paymentUrl,
      isSandbox: invoiceRes.isSandboxSimulation,
    });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Terjadi kesalahan saat memproses checkout.',
    }, { status: 500 });
  }
}
