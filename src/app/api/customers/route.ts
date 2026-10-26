import { NextResponse } from 'next/server';
import { getCustomers, createCustomer } from '@/lib/storage';

export async function GET() {
  try {
    const customers = await getCustomers();
    return NextResponse.json({ success: true, data: customers });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch customers' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.firstName || !body.email) {
      return NextResponse.json({ success: false, error: 'First name and email are required' }, { status: 400 });
    }
    const newCustomer = await createCustomer({
      firstName: body.firstName,
      lastName: body.lastName || '',
      email: body.email,
      phone: body.phone,
      customerType: body.customerType || 'RETAIL',
      city: body.city || 'Jakarta',
      ordersCount: 0,
      totalSpent: 0,
      notes: body.notes,
    });
    return NextResponse.json({ success: true, data: newCustomer }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create customer' }, { status: 500 });
  }
}
