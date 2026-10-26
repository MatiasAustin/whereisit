import { NextResponse } from 'next/server';
import { getReviews, updateReviewStatus } from '@/lib/storage';

export async function GET() {
  try {
    const reviews = getReviews();
    return NextResponse.json({ success: true, data: reviews });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;
    if (!id || !status) {
      return NextResponse.json({ success: false, error: 'ID and status are required' }, { status: 400 });
    }
    const updated = updateReviewStatus(id, status);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Review not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Review status updated' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update review' }, { status: 500 });
  }
}
