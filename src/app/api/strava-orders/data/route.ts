import { NextResponse } from 'next/server';
import { getStravaOrderById, saveStravaCustomerData } from '@/lib/storage';

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('62')) return '0' + digits.slice(2);
  return digits;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      orderId,
      phone,
      stravaUrl,
      images,
      eventName,
      eventDate,
      distance,
      pace,
      duration,
      engravedText,
      adminNotes,
    } = body;

    if (!orderId?.trim()) {
      return NextResponse.json({ success: false, error: 'Order ID wajib diisi' }, { status: 400 });
    }

    // 1. Fetch order
    const order = await getStravaOrderById(orderId.trim());
    if (!order) {
      return NextResponse.json({ success: false, error: 'Order ID tidak ditemukan' }, { status: 404 });
    }

    // 2. Verify buyer authorization via WhatsApp / phone match
    if (phone) {
      const orderPhoneNorm = normalizePhone(order.customer.phone);
      const inputPhoneNorm = normalizePhone(phone);
      if (orderPhoneNorm && inputPhoneNorm && !orderPhoneNorm.includes(inputPhoneNorm) && !inputPhoneNorm.includes(orderPhoneNorm)) {
        return NextResponse.json({
          success: false,
          error: 'Nomor WhatsApp tidak sesuai dengan data pemesanan Order ID ini.',
        }, { status: 403 });
      }
    }

    // 3. Validation: Strava URL
    if (!stravaUrl || !stravaUrl.toLowerCase().includes('strava.com')) {
      return NextResponse.json({
        success: false,
        error: 'Tautan Strava wajib valid dan mengandung domain strava.com',
      }, { status: 400 });
    }

    // 4. Validation: Images (1 - 3 files)
    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Wajib mengunggah minimal 1 gambar screenshot rute / data Strava kamu',
      }, { status: 400 });
    }

    if (images.length > 3) {
      return NextResponse.json({
        success: false,
        error: 'Maksimal 3 gambar screenshot Strava',
      }, { status: 400 });
    }

    // 5. Validation: Run details
    if (!eventName?.trim()) {
      return NextResponse.json({ success: false, error: 'Nama event / momen lari wajib diisi' }, { status: 400 });
    }
    if (!eventDate?.trim()) {
      return NextResponse.json({ success: false, error: 'Tanggal event wajib diisi' }, { status: 400 });
    }
    if (!distance?.trim()) {
      return NextResponse.json({ success: false, error: 'Jarak tempuh lari wajib diisi' }, { status: 400 });
    }
    if (!pace?.trim()) {
      return NextResponse.json({ success: false, error: 'Pace rata-rata wajib diisi' }, { status: 400 });
    }
    if (!duration?.trim()) {
      return NextResponse.json({ success: false, error: 'Durasi waktu lari wajib diisi' }, { status: 400 });
    }

    // 6. Save customer Strava data and update status to 'Data Diterima — Menunggu Konfirmasi Desain'
    const result = await saveStravaCustomerData(order.id, {
      stravaUrl: stravaUrl.trim(),
      images,
      eventName: eventName.trim(),
      eventDate: eventDate.trim(),
      distance: distance.trim(),
      pace: pace.trim(),
      duration: duration.trim(),
      engravedText: engravedText?.trim() || undefined,
      adminNotes: adminNotes?.trim() || undefined,
      submittedAt: new Date().toISOString(),
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }

    // 7. Admin notification trigger (Logged to studio operator)
    console.log(`[Strava Order Notification] New customer Strava data submitted!
      Order ID: ${order.id}
      Customer: ${order.customer.fullName} (${order.customer.phone})
      Event: ${eventName} (${distance}, ${pace}, ${duration})
      Strava: ${stravaUrl}
      Notify Admin: whereisit26@gmail.com
    `);

    return NextResponse.json({
      success: true,
      message: 'Data Strava berhasil disimpan. Menunggu konfirmasi preview desain dari tim WhereIsIt.',
      orderId: order.id,
      status: 'Data Diterima — Menunggu Konfirmasi Desain',
    });
  } catch (error: any) {
    console.error('Error submitting strava form data:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Terjadi kesalahan saat menyimpan formulir Strava',
    }, { status: 500 });
  }
}
