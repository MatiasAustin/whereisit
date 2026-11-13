import { NextResponse } from 'next/server';
import { getStravaOrderById, updateStravaOrderStatus } from '@/lib/storage';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 });
    }

    const order = await getStravaOrderById(orderId);
    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    // Simulate verified payment
    const result = await updateStravaOrderStatus(order.id, 'Dibayar — Data Belum Lengkap', {
      paymentDetails: {
        ...order.paymentDetails,
        invoiceId: order.paymentDetails?.invoiceId || `INV-SIM-${order.id}`,
        mayarTransactionId: `TRX-SIM-${Date.now()}`,
        paidAt: new Date().toISOString(),
        channel: 'Sandbox Simulation (QRIS/VA)',
      },
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Pembayaran sandbox berhasil disimulasikan!',
      orderId: order.id,
      status: 'Dibayar — Data Belum Lengkap',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
