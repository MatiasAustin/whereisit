import { NextResponse } from 'next/server';
import { verifyMayarTransaction } from '@/lib/mayar';
import { getStravaOrderById, updateStravaOrderStatus } from '@/lib/storage';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const expectedToken = process.env.MAYAR_WEBHOOK_TOKEN || 'sandbox-webhook-token';

    // 1. Protect endpoint with secret token
    if (token !== expectedToken.trim()) {
      console.warn(`[Webhook Mayar] Unauthorized webhook attempt with invalid token: ${token}`);
      return NextResponse.json({ error: 'Unauthorized token' }, { status: 401 });
    }

    const payload = await request.json();
    const event = payload.event || payload.type || 'payment.received';
    const data = payload.data || payload;

    // Only handle payment.received events
    if (event !== 'payment.received' && !event.includes('payment') && !event.includes('paid')) {
      return NextResponse.json({ received: true, ignored: true, reason: 'Event not payment.received' });
    }

    const transactionId = data.id || data.transactionId || data.invoiceId;
    const rawOrderId = data.extraData?.orderId || data.metadata?.orderId || data.orderId;

    if (!rawOrderId) {
      console.error('[Webhook Mayar] Missing extraData.orderId:', data);
      return NextResponse.json({ error: 'Missing extraData.orderId in payload' }, { status: 400 });
    }

    // 2. Fetch order to verify
    const order = await getStravaOrderById(rawOrderId);
    if (!order) {
      console.error(`[Webhook Mayar] Order not found for ID: ${rawOrderId}`);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // 3. IDEMPOTENCY: One transaction processed once
    if (
      order.status !== 'Menunggu Pembayaran' ||
      (transactionId && order.paymentDetails?.mayarTransactionId === transactionId)
    ) {
      return NextResponse.json({
        success: true,
        idempotent: true,
        message: 'Order already verified & marked paid',
        orderId: order.id,
        currentStatus: order.status,
      });
    }

    // 4. VERIFY TRANSACTION (GET /hl/v2/transactions/{transactionId} when key is configured, or strict payload check in sandbox simulation)
    let txRecord = data;
    if (process.env.MAYAR_API_KEY && process.env.MAYAR_API_KEY !== 'your_mayar_api_key_here') {
      if (!transactionId) {
        return NextResponse.json({ error: 'Missing transactionId for Mayar API verification' }, { status: 400 });
      }
      const verified = await verifyMayarTransaction(transactionId);
      if (!verified) {
        console.error(`[Webhook Mayar] GET /hl/v2/transactions/${transactionId} verification failed`);
        return NextResponse.json({ error: 'Transaction verification failed via Mayar API' }, { status: 400 });
      }
      txRecord = verified;
    }

    const txStatus = String(txRecord.status || '').toLowerCase();
    const isPaid = txStatus === 'paid';
    const txAmount = Number(txRecord.amount ?? txRecord.total ?? NaN);
    const amountMatches = !Number.isNaN(txAmount) && Math.abs(txAmount - Number(order.total)) === 0;
    const txOrderId = txRecord.extraData?.orderId;
    const orderIdMatches = txOrderId === order.id;

    if (!isPaid || !amountMatches || !orderIdMatches) {
      console.warn('[Webhook Mayar] Rejected unverified/mismatched payment:', {
        isPaid,
        amountMatches,
        orderIdMatches,
        txStatus,
        txAmount,
        expectedTotal: order.total,
        txOrderId,
        expectedOrderId: order.id,
      });
      return NextResponse.json(
        {
          success: false,
          error: 'Payment verification failed: status must be "paid", amount must match, and extraData.orderId must match.',
        },
        { status: 400 }
      );
    }

    // 5. Verified! Mark order as "Dibayar — Data Belum Lengkap"
    const updateResult = await updateStravaOrderStatus(order.id, 'Dibayar — Data Belum Lengkap', {
      paymentDetails: {
        ...order.paymentDetails,
        mayarTransactionId: transactionId || `TX-${order.id}`,
        paidAt: new Date().toISOString(),
        channel: txRecord.paymentMethod || txRecord.channel || 'Mayar',
      },
    });

    if (!updateResult.success) {
      return NextResponse.json({ error: updateResult.error }, { status: 500 });
    }

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
