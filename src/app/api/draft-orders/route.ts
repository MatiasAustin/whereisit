import { NextResponse } from 'next/server';
import { getDraftOrders, createDraftOrder } from '@/lib/storage';

export async function GET() {
  try {
    const drafts = await getDraftOrders();
    return NextResponse.json({ success: true, data: drafts });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch draft orders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.customerName || !body.items || !body.items.length) {
      return NextResponse.json({ success: false, error: 'Customer name and items are required' }, { status: 400 });
    }
    const newDraft = await createDraftOrder({
      customerName: body.customerName,
      email: body.email,
      phone: body.phone,
      items: body.items,
      subtotal: body.subtotal,
      shippingFee: body.shippingFee || 0,
      total: body.total,
      status: body.status || 'DRAFT',
      notes: body.notes,
    });
    return NextResponse.json({ success: true, data: newDraft }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create draft order' }, { status: 500 });
  }
}
