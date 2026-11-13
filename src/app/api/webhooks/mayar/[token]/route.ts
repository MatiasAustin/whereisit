import { NextResponse } from 'next/server';
import { verifyMayarTransaction } from '@/lib/mayar';
import { getStravaOrderById, updateStravaOrderStatus } from '@/lib/storage';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const expectedToken = process.env.MAYAR_WEBHOOK_TOKEN;

    // 1. Verify Secret Webhook Token
    if (expectedToken && expectedToken.trim() !== '' && token !== expectedToken.trim()) {
      console.warn(`[Webhook Mayar] Unauthorized webhook attempt with invalid token: ${token}`);
      return NextResponse.json({ error: 'Unauthorized token' }, { status: 401 });
    }

    const payload = await request.json();
    const event = payload.event || payload.type;
    const data = payload.data || payload;

    // Only handle payment received events
    if (event && !event.includes('payment') && !event.includes('paid') && !event.includes('settlement')) {
      return NextResponse.json({ received: true, ignored: true, reason: 'Event not payment related' });
    }

    const transactionId = data.id || data.transactionId || data.invoiceId;
    const rawOrderId = data.extraData?.orderId || data.metadata?.orderId || data.orderId;

    if (!rawOrderId) {
      console.error('[Webhook Mayar] Missing orderId in extraData:', data);
      return NextResponse.json({ error: 'Missing orderId in payload' }, { status: 400 });
    }

    // 2. Fetch order to verify
    const order = await getStravaOrderById(rawOrderId);
    if (!order) {
      console.error(`[Webhook Mayar] Order not found for ID: ${rawOrderId}`);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // 3. IDEMPOTENCY: If order is already paid, do not process again
    if (order.status !== 'Menunggu Pembayaran') {
      return NextResponse.json({
        success: true,
        message: 'Order already verified & marked paid',
        orderId: order.id,
        currentStatus: order.status,
      });
    }

    // 4. VERIFY WITH MAYAR HEADLESS API (GET /transactions/{id})
    // Do NOT trust webhook payload alone if MAYAR_API_KEY is configured
    if (process.env.MAYAR_API_KEY && process.env.MAYAR_API_KEY !== 'your_mayar_api_key_here') {
      if (transactionId) {
        const verified = await verifyMayarTransaction(transactionId);
        if (!verified) {
          console.error(`[Webhook Mayar] Verification failed for transaction ${transactionId}`);
          return NextResponse.json({ error: 'Transaction verification failed' }, { status: 400 });
        }

        const isPaid = verified.status === 'paid' || verified.status === 'settlement' || verified.status === 'SUCCESS';
        const amountMatches = Math.abs(Number(verified.amount) - Number(order.total)) < 100;
        const orderIdMatches = verified.extraData?.orderId === order.id;

        if (!isPaid || !amountMatches || !orderIdMatches) {
          console.error('[Webhook Mayar] Verification mismatch:', {
            isPaid,
            amountMatches,
            orderIdMatches,
            verifiedStatus: verified.status,
            verifiedAmount: verified.amount,
            orderTotal: order.total,
          });
          return NextResponse.json({ error: 'Transaction verification parameters mismatch' }, { status: 400 });
        }
      }
    }

    // 5. Update order to 'Dibayar — Data Belum Lengkap'
    const updateResult = await updateStravaOrderStatus(order.id, 'Dibayar — Data Belum Lengkap', {
      paymentDetails: {
        ...order.paymentDetails,
        mayarTransactionId: transactionId || order.paymentDetails?.mayarTransactionId,
        paidAt: new Date().toISOString(),
        channel: data.paymentMethod || data.channel || 'Mayar',
      },
    });

    if (!updateResult.success) {
      return NextResponse.json({ error: updateResult.error }, { status: 500 });
    }

    console.log(`[Webhook Mayar] Order ${order.id} verified and updated to 'Dibayar — Data Belum Lengkap'`);
    return NextResponse.json({
      success: true,
      orderId: order.id,
      status: 'Dibayar — Data Belum Lengkap',
    });
  } catch (error: any) {
    console.error('[Webhook Mayar] Exception handling webhook:', error);
    return NextResponse.json({ error: error.message || 'Webhook internal error' }, { status: 500 });
  }
}
