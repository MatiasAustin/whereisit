import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { addNotifyListEntry, getNotifyList } from '@/lib/storage';
import { ALL_NOTIFY_PRODUCTS } from '@/data/stravaKeychainConfig';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('whereisit_admin_session');
    if (!session || session.value !== 'authenticated') {
      return NextResponse.json({ success: false, error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    const entries = await getNotifyList();
    return NextResponse.json({ success: true, data: entries });
  } catch (error: any) {
    console.error('Error fetching notify list:', error);
    return NextResponse.json({ success: false, error: 'Gagal memuat daftar minat produk' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, whatsapp, product } = body;

    if (!name || !String(name).trim()) {
      return NextResponse.json({ success: false, error: 'Nama wajib diisi' }, { status: 400 });
    }

    const rawWa = String(whatsapp || '').replace(/\D/g, '');
    if (!rawWa || rawWa.length < 8) {
      return NextResponse.json({ success: false, error: 'Nomor WhatsApp aktif wajib diisi dengan benar' }, { status: 400 });
    }

    const productName = String(product || 'Strava Route Lamp').trim();
    const matched = ALL_NOTIFY_PRODUCTS.find((p) => p.value.toLowerCase() === productName.toLowerCase());
    const categoryGroup = matched
      ? matched.group
      : productName.toLowerCase().includes('lamp')
      ? 'Minat Lamp'
      : productName.toLowerCase().includes('cube')
      ? 'Minat Cube'
      : 'Minat Lineup Lainnya';

    const saved = await addNotifyListEntry({
      name: String(name).trim(),
      whatsapp: String(whatsapp).trim(),
      product: matched ? matched.value : productName,
      categoryGroup,
    });

    return NextResponse.json({
      success: true,
      message: 'Terima kasih! Nomor WhatsApp kamu sudah tercatat dan akan dikabari saat produk tersedia.',
      data: saved,
    });
  } catch (error: any) {
    console.error('Error saving notify entry:', error);
    return NextResponse.json({ success: false, error: 'Gagal mendaftarkan notifikasi' }, { status: 500 });
  }
}
