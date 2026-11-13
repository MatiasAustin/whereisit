import { NextResponse } from 'next/server';
import { getPublicProductionQueue, updateQueueSettings } from '@/lib/storage';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const queueData = await getPublicProductionQueue();
    return NextResponse.json({ success: true, data: queueData });
  } catch (error: any) {
    console.error('Error fetching public queue:', error);
    return NextResponse.json({ success: false, error: 'Gagal memuat antrian produksi' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    // Admin protection check
    const cookieStore = await cookies();
    const session = cookieStore.get('whereisit_admin_session');
    if (!session || session.value !== 'authenticated') {
      return NextResponse.json({ success: false, error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    const body = await request.json();
    const { defaultLeadDays, customLeadNote } = body;

    await updateQueueSettings({
      defaultLeadDays: defaultLeadDays ? Number(defaultLeadDays) : undefined,
      customLeadNote: customLeadNote?.trim() || undefined,
    });

    const updated = await getPublicProductionQueue();
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Gagal mengubah pengaturan antrian' }, { status: 500 });
  }
}
