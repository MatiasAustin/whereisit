import { NextResponse } from 'next/server';
import { getDiscounts, createDiscount, updateDiscount, deleteDiscount } from '@/lib/storage';

export async function GET() {
  try {
    const discounts = getDiscounts();
    return NextResponse.json({ success: true, data: discounts });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch discounts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.code || !body.value) {
      return NextResponse.json({ success: false, error: 'Code and value are required' }, { status: 400 });
    }
    const newDiscount = createDiscount({
      code: body.code.toUpperCase().trim(),
      type: body.type || 'PERCENTAGE',
      value: Number(body.value),
      minPurchase: body.minPurchase ? Number(body.minPurchase) : 0,
      usageLimit: body.usageLimit ? Number(body.usageLimit) : undefined,
      status: body.status || 'ACTIVE',
      startsAt: body.startsAt,
      endsAt: body.endsAt,
    });
    return NextResponse.json({ success: true, data: newDiscount }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create discount' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    }
    const updated = updateDiscount(id, updates);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Discount not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update discount' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    }
    const deleted = deleteDiscount(id);
    return NextResponse.json({ success: deleted });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete discount' }, { status: 500 });
  }
}
