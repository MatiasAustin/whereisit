import { NextResponse } from 'next/server';
import { getOrders, createOrder, updateOrderStatus } from '@/lib/storage';

export async function GET() {
  try {
    const orders = getOrders();
    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.customer || !body.items || !body.items.length) {
      return NextResponse.json({ success: false, error: 'Customer information and items are required' }, { status: 400 });
    }

    const newOrder = createOrder({
      customer: body.customer,
      items: body.items,
      subtotal: body.subtotal,
      shippingFee: body.shippingFee || 35000,
      total: body.total,
      shippingCarrier: body.shippingCarrier || 'JNE Express Standard',
      paymentMethod: body.paymentMethod || 'QRIS Instant',
      paymentStatus: 'PAID',
      orderStatus: 'PROCESSING',
    });

    return NextResponse.json({ success: true, data: newOrder }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create order' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, orderStatus, paymentStatus } = body;
    if (!id || !orderStatus) {
      return NextResponse.json({ success: false, error: 'Order ID and status are required' }, { status: 400 });
    }

    const success = updateOrderStatus(id, orderStatus, paymentStatus);
    if (!success) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Order status updated' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update order' }, { status: 500 });
  }
}
