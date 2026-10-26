import { NextResponse } from 'next/server';
import { getSubscribers, addSubscriber } from '@/lib/storage';

export async function GET() {
  try {
    const subs = getSubscribers();
    return NextResponse.json({ success: true, data: subs });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch subscribers' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
    }
    const sub = addSubscriber(body.email, body.source || 'Storefront');
    return NextResponse.json({ success: true, data: sub });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to add subscriber' }, { status: 500 });
  }
}
