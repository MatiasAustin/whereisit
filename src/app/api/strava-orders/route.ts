import { NextResponse } from 'next/server';
import {
  getStravaOrders,
  getStravaOrderById,
  updateStravaOrderStatus,
  verifyClickyOrderPayment,
  getQueueSettings,
  computeEstimatedCompletion,
  createStravaOrder,
  deleteStravaOrder,
  clearExampleStravaOrders,
} from '@/lib/storage';
import { generateOrderId } from '@/lib/mayar';
import { cookies } from 'next/headers';
import { StravaOrderStatus, StravaPreOrder } from '@/types';

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('62')) return '0' + digits.slice(2);
  return digits;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const orderId = url.searchParams.get('orderId');
    const phone = url.searchParams.get('phone');

    // Case 1: Specific order tracking / data form retrieval
    if (orderId) {
      const order = await getStravaOrderById(orderId.trim());
      if (!order) {
        return NextResponse.json({ success: false, error: 'Pesanan tidak ditemukan' }, { status: 404 });
      }

      // If phone is provided for authentication, verify it matches
      if (phone) {
        const orderPhoneNorm = normalizePhone(order.customer?.phone || '');
        const inputPhoneNorm = normalizePhone(phone);
        if (orderPhoneNorm && inputPhoneNorm && !orderPhoneNorm.includes(inputPhoneNorm) && !inputPhoneNorm.includes(orderPhoneNorm)) {
          return NextResponse.json({
            success: false,
            error: 'Nomor WhatsApp tidak cocok dengan pesanan ini',
          }, { status: 403 });
        }
      }

      // Compute dynamic estimate from admin settings & queue position
      const queueSettings = await getQueueSettings();
      const allOrders = await getStravaOrders();
      const activeOrders = allOrders.filter((o) =>
        [
          'Data Diterima — Menunggu Konfirmasi Desain',
          'Desain Dikonfirmasi',
          'Produksi',
          'QC / Finishing',
          'Packing',
        ].includes(o.status)
      );
      const qIdx = activeOrders.findIndex((o) => o.id === order.id);
      const computedPos = order.production?.queuePosition || (qIdx >= 0 ? qIdx + 1 : undefined);
      const computedEst = computeEstimatedCompletion(order, queueSettings, computedPos || 1);

      // For public tracking: do not expose private full addresses or full raw emails unless phone matched
      const isVerified = Boolean(phone);
      return NextResponse.json({
        success: true,
        data: {
          ...order,
          production: {
            ...order.production,
            queuePosition: computedPos,
            estimatedCompletionDate: computedEst,
          },
          customer: isVerified ? order.customer : {
            fullName: order.customer.fullName,
            city: order.customer.city,
            // Mask phone & email if not authenticated
            phone: '08' + '*'.repeat(8),
            email: 'c***@***',
            address: order.customer.city,
          },
        },
        queueSettings,
      });
    }

    // Case 2: Admin fetching all Strava pre-orders
    const cookieStore = await cookies();
    const session = cookieStore.get('whereisit_admin_session');
    if (!session || session.value !== 'authenticated') {
      return NextResponse.json({ success: false, error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    const orders = await getStravaOrders();
    return NextResponse.json({ success: true, data: orders });
  } catch (error: any) {
    console.error('Error fetching strava orders:', error);
    return NextResponse.json({ success: false, error: 'Gagal mengambil data pesanan' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    // Admin verification
    const cookieStore = await cookies();
    const session = cookieStore.get('whereisit_admin_session');
    if (!session || session.value !== 'authenticated') {
      return NextResponse.json({ success: false, error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      id, 
      status, 
      customer,
      variationName,
      variationId,
      price,
      subtotal,
      shippingFee,
      total,
      stravaData,
      productionUpdates, 
      notes 
    } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Order ID wajib diisi' }, { status: 400 });
    }

    // Action: Manual verification of Clicky payment by admin
    if (body.action === 'verify_clicky_payment') {
      const verifyRes = await verifyClickyOrderPayment(id, notes);
      if (!verifyRes.success) {
        return NextResponse.json({ success: false, error: verifyRes.error }, { status: 400 });
      }
      return NextResponse.json({
        success: true,
        message: 'Pembayaran Clicky berhasil diverifikasi!',
        data: verifyRes.order,
      });
    }

    const existingOrder = await getStravaOrderById(id);
    if (!existingOrder) {
      return NextResponse.json({ success: false, error: 'Pesanan tidak ditemukan' }, { status: 404 });
    }

    const targetStatus = (status || existingOrder.status) as StravaOrderStatus;

    const validStatuses: StravaOrderStatus[] = [
      'Menunggu Pembayaran',
      'Dibayar — Data Belum Lengkap',
      'Data Diterima — Menunggu Konfirmasi Desain',
      'Desain Dikonfirmasi',
      'Produksi',
      'QC / Finishing',
      'Packing',
      'Dikirim',
      'Selesai',
    ];

    if (!validStatuses.includes(targetStatus)) {
      return NextResponse.json({ success: false, error: 'Status pesanan tidak valid' }, { status: 400 });
    }

    const result = await updateStravaOrderStatus(
      id,
      targetStatus,
      {
        ...(customer ? { customer } : {}),
        ...(variationName ? { variationName } : {}),
        ...(variationId ? { variationId } : {}),
        ...(price !== undefined ? { price: Number(price) } : {}),
        ...(subtotal !== undefined ? { subtotal: Number(subtotal) } : {}),
        ...(shippingFee !== undefined ? { shippingFee: Number(shippingFee) } : {}),
        ...(total !== undefined ? { total: Number(total) } : {}),
        ...(stravaData ? { stravaData } : {}),
        production: productionUpdates,
      },
      body.bypassGuards !== undefined ? Boolean(body.bypassGuards) : true
    );

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Status pesanan Strava berhasil diperbarui' });
  } catch (error: any) {
    console.error('Error updating strava order:', error);
    return NextResponse.json({ success: false, error: error.message || 'Gagal memperbarui pesanan' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Admin verification
    const cookieStore = await cookies();
    const session = cookieStore.get('whereisit_admin_session');
    if (!session || session.value !== 'authenticated') {
      return NextResponse.json({ success: false, error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    const body = await request.json();
    const {
      customer,
      variationId = 'var-57x94',
      variationName = '5.7x9.4 cm',
      price = 119000,
      subtotal = 119000,
      shippingFee = 0,
      total = 119000,
      status = 'Data Diterima — Menunggu Konfirmasi Desain',
      paymentMethod = 'WhatsApp Manual Order',
      stravaData,
      internalAdminNotes,
    } = body;

    if (!customer?.fullName || !customer?.phone) {
      return NextResponse.json({ success: false, error: 'Nama dan nomor WhatsApp pelanggan wajib diisi' }, { status: 400 });
    }

    const orderId = generateOrderId();
    const newOrder: StravaPreOrder = {
      id: orderId,
      orderNumber: orderId,
      productType: 'keychain-strava',
      variationId,
      variationName,
      customer: {
        fullName: customer.fullName.trim(),
        phone: customer.phone.trim(),
        email: customer.email?.trim() || `${customer.phone.replace(/\D/g, '')}@wa.order`,
        address: customer.address?.trim() || 'Alamat dikonfirmasi via WhatsApp',
        city: customer.city?.trim() || 'Indonesia',
        postalCode: customer.postalCode?.trim() || '',
      },
      price: Number(price),
      subtotal: Number(subtotal),
      shippingFee: Number(shippingFee),
      total: Number(total),
      status: status as StravaOrderStatus,
      paymentMethod,
      paymentDetails: {
        channel: 'Manual Admin',
        paidAt: new Date().toISOString(),
      },
      stravaData: stravaData ? {
        stravaUrl: stravaData.stravaUrl || '',
        images: stravaData.images || ['/images/strava-keychain/keychain-04.jpg'],
        eventName: stravaData.eventName || 'Custom Route Run',
        eventDate: stravaData.eventDate || new Date().toISOString().split('T')[0],
        distance: stravaData.distance || '10.0 km',
        pace: stravaData.pace || '05:30 /km',
        duration: stravaData.duration || '00:55:00',
        engravedText: stravaData.engravedText || '',
        adminNotes: stravaData.adminNotes || '',
        submittedAt: new Date().toISOString(),
      } : undefined,
      production: {
        internalAdminNotes: internalAdminNotes || 'Pesanan manual diinput dari Admin Dashboard',
      },
      isExample: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const created = await createStravaOrder(newOrder);
    return NextResponse.json({ success: true, data: created, message: 'Pesanan pre-order berhasil dibuat dan masuk antrian produksi!' }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating manual strava order:', error);
    return NextResponse.json({ success: false, error: error.message || 'Gagal membuat pesanan' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    // Admin verification
    const cookieStore = await cookies();
    const session = cookieStore.get('whereisit_admin_session');
    if (!session || session.value !== 'authenticated') {
      return NextResponse.json({ success: false, error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    const url = new URL(request.url);
    const action = url.searchParams.get('action');
    const queryOrderId = url.searchParams.get('orderId');

    // Action 1: Clear example/mock orders
    if (action === 'clear-examples') {
      const removedCount = await clearExampleStravaOrders();
      return NextResponse.json({
        success: true,
        removedCount,
        message: `${removedCount} pesanan contoh berhasil dibersihkan dari antrian!`,
      });
    }

    // Action 2: Delete specific order
    let orderIdToDelete = queryOrderId;
    if (!orderIdToDelete) {
      try {
        const body = await request.json();
        orderIdToDelete = body.orderId || body.id;
      } catch {
        // no body
      }
    }

    if (!orderIdToDelete) {
      return NextResponse.json({ success: false, error: 'orderId wajib diisi untuk menghapus pesanan' }, { status: 400 });
    }

    const deleted = await deleteStravaOrder(orderIdToDelete.trim());
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Pesanan tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: `Pesanan ${orderIdToDelete} berhasil dihapus dari antrian produksi.` });
  } catch (error: any) {
    console.error('Error deleting strava order:', error);
    return NextResponse.json({ success: false, error: error.message || 'Gagal menghapus pesanan' }, { status: 500 });
  }
}
