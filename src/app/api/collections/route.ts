import { NextResponse } from 'next/server';
import { getCollections, updateCollection } from '@/lib/storage';

export async function GET() {
  try {
    const collections = getCollections();
    return NextResponse.json({ success: true, data: collections });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch collections' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    }
    const updated = updateCollection(id, updates);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Collection not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update collection' }, { status: 500 });
  }
}
