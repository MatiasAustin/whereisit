import { NextResponse } from 'next/server';
import {
  getStravaOrders,
  getStravaOrderById,
  updateStravaOrderStatus,
  getQueueSettings,
  computeEstimatedCompletion,
} from '@/lib/storage';
import { cookies } from 'next/headers';
import { StravaOrderStatus } from '@/types';

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
    const { id, status, productionUpdates, notes } = body;

    if (!id || !status) {
      return NextResponse.json({ success: false, error: 'Order ID dan status wajib diisi' }, { status: 400 });
    }

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

    if (!validStatuses.includes(status)) {
      return NextResponse.json({ success: false, error: 'Status pesanan tidak valid' }, { status: 400 });
    }

    const result = await updateStravaOrderStatus(id, status, {
      production: productionUpdates,
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Status pesanan Strava berhasil diperbarui' });
  } catch (error: any) {
    console.error('Error updating strava order:', error);
    return NextResponse.json({ success: false, error: error.message || 'Gagal memperbarui pesanan' }, { status: 500 });
  }
}
