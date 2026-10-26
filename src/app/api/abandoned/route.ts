import { NextResponse } from 'next/server';
import { getAbandonedCheckouts } from '@/lib/storage';

export async function GET() {
  try {
    const abandoned = await getAbandonedCheckouts();
    return NextResponse.json({ success: true, data: abandoned });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch abandoned checkouts' }, { status: 500 });
  }
}
