import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getStravaMediaConfig, updateStravaMediaConfig, getDefaultStravaMediaConfig } from '@/lib/storage';

export async function GET() {
  try {
    const config = await getStravaMediaConfig();
    return NextResponse.json({ success: true, data: config });
  } catch (error: any) {
    console.error('Error fetching strava media config:', error);
    return NextResponse.json({ success: false, error: 'Gagal memuat konfigurasi media' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('whereisit_admin_session');
    if (!session || session.value !== 'authenticated') {
      return NextResponse.json({ success: false, error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    const body = await request.json();

    if (body.resetToDefault) {
      const def = getDefaultStravaMediaConfig();
      const saved = await updateStravaMediaConfig(def);
      return NextResponse.json({ success: true, data: saved });
    }

    const saved = await updateStravaMediaConfig({
      heroImage: body.heroImage,
      variationImages: body.variationImages,
      variationPrices: body.variationPrices,
      gallery: body.gallery,
    });

    return NextResponse.json({ success: true, data: saved });
  } catch (error: any) {
    console.error('Error updating strava media config:', error);
    return NextResponse.json({ success: false, error: error.message || 'Gagal menyimpan konfigurasi media' }, { status: 500 });
  }
}
