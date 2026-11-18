import { NextResponse } from 'next/server';
import { getStoreSettings, updateStoreSettings } from '@/lib/storage';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  'Pragma': 'no-cache',
  'Expires': '0',
};

export async function GET() {
  try {
    const settings = await getStoreSettings();
    return NextResponse.json(
      { success: true, data: settings },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch settings' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const updated = await updateStoreSettings(body);
    return NextResponse.json(
      { success: true, data: updated },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update settings' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
