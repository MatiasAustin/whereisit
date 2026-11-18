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
    const { 
      defaultLeadDays, 
      customLeadNote,
      queueTitle,
      queueSubtitle,
      card1Title,
      card1Subtitle,
      card2Title,
      card2Subtitle,
      card3Title,
      card3Subtitle,
      card4Title,
      card4Subtitle,
      card4Value,
      stageLabels,
    } = body;

    await updateQueueSettings({
      ...(defaultLeadDays !== undefined ? { defaultLeadDays: Number(defaultLeadDays) } : {}),
      ...(customLeadNote !== undefined ? { customLeadNote: customLeadNote.trim() } : {}),
      ...(queueTitle !== undefined ? { queueTitle: queueTitle.trim() } : {}),
      ...(queueSubtitle !== undefined ? { queueSubtitle: queueSubtitle.trim() } : {}),
      ...(card1Title !== undefined ? { card1Title: card1Title.trim() } : {}),
      ...(card1Subtitle !== undefined ? { card1Subtitle: card1Subtitle.trim() } : {}),
      ...(card2Title !== undefined ? { card2Title: card2Title.trim() } : {}),
      ...(card2Subtitle !== undefined ? { card2Subtitle: card2Subtitle.trim() } : {}),
      ...(card3Title !== undefined ? { card3Title: card3Title.trim() } : {}),
      ...(card3Subtitle !== undefined ? { card3Subtitle: card3Subtitle.trim() } : {}),
      ...(card4Title !== undefined ? { card4Title: card4Title.trim() } : {}),
      ...(card4Subtitle !== undefined ? { card4Subtitle: card4Subtitle.trim() } : {}),
      ...(card4Value !== undefined ? { card4Value: card4Value.trim() } : {}),
      ...(stageLabels ? { stageLabels } : {}),
    });

    const updated = await getPublicProductionQueue();
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Gagal mengubah pengaturan antrian' }, { status: 500 });
  }
}
