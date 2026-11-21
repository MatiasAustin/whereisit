import { NextResponse } from 'next/server';
import { 
  getStravaOrders, 
  getOrders, 
  updateStravaOrderStatus, 
  createStravaOrder, 
  getProductionBatches, 
  createProductionBatch, 
  updateProductionBatch, 
  deleteProductionBatch, 
  batchImportStravaOrders 
} from '@/lib/storage';
import { generateOrderId } from '@/lib/mayar';
import { cookies } from 'next/headers';
import { StravaOrderStatus, StravaPreOrder } from '@/types';

async function checkAdminAuth() {
  const cookieStore = await cookies();
  const session = cookieStore.get('whereisit_admin_session');
  return Boolean(session && session.value === 'authenticated');
}

export async function GET() {
  try {
    const isAuth = await checkAdminAuth();
    if (!isAuth) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    const [batches, stravaOrders, storeOrders] = await Promise.all([
      getProductionBatches(),
      getStravaOrders(),
      getOrders(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        batches,
        stravaOrders,
        storeOrders,
      },
    });
  } catch (error: any) {
    console.error('Error fetching production data:', error);
    return NextResponse.json({ success: false, error: 'Gagal mengambil data produksi' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const isAuth = await checkAdminAuth();
    if (!isAuth) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    // 1. Import from Spreadsheet (CSV, TSV, or Google Sheet rows)
    if (action === 'import_sheet') {
      const { orders } = body;
      if (!Array.isArray(orders) || orders.length === 0) {
        return NextResponse.json({ success: false, error: 'Data pesanan sheet tidak valid atau kosong' }, { status: 400 });
      }

      const importResult = await batchImportStravaOrders(orders);
      return NextResponse.json({
        success: true,
        message: `${importResult.count} baru, ${importResult.skippedCount} duplikat dilewati`,
        count: importResult.count,
        skippedCount: importResult.skippedCount,
        data: importResult.imported,
      });
    }

    // 2. Create Single Production Item Manually
    if (action === 'create_item') {
      const {
        customerName,
        phone,
        email,
        address,
        stravaUrl,
        pace,
        engravedText,
        eventName,
        batchName,
        scheduledDate,
        assignedMachine,
        notes,
        status = 'Desain Dikonfirmasi',
        variationName = '5.7x9.4 cm',
        price = 119000,
      } = body;

      if (!customerName || !phone) {
        return NextResponse.json({ success: false, error: 'Nama dan WhatsApp wajib diisi' }, { status: 400 });
      }

      const now = new Date().toISOString();
      const orderId = generateOrderId();

      const newOrder: StravaPreOrder = {
        id: orderId,
        orderNumber: orderId,
        productType: 'keychain-strava',
        variationId: 'var-57x94',
        variationName: variationName || '5.7x9.4 cm',
        customer: {
          fullName: customerName.trim(),
          phone: phone.trim(),
          email: email?.trim() || `${phone.replace(/\D/g, '')}@manual.order`,
          address: address?.trim() || 'Alamat dikonfirmasi via WhatsApp',
          city: 'Indonesia',
        },
        price: Number(price),
        subtotal: Number(price),
        shippingFee: 0,
        total: Number(price),
        status: status as StravaOrderStatus,
        paymentMethod: 'Manual Production Add',
        paymentVerified: true,
        paymentVerifiedAt: now,
        paymentDetails: {
          channel: 'Workshop Admin',
          paidAt: now,
        },
        stravaData: {
          stravaUrl: stravaUrl?.trim() || '',
          images: ['/images/strava-keychain/keychain-04.jpg'],
          eventName: eventName?.trim() || 'Strava Keychain Run',
          eventDate: now.split('T')[0],
          distance: '10.0 km',
          pace: pace?.trim() || 'Pace',
          duration: '00:50:00',
          engravedText: engravedText?.trim() || customerName.trim(),
          adminNotes: notes?.trim() || '',
          submittedAt: now,
        },
        production: {
          batchName: batchName || 'Batch 1 — Reguler',
          scheduledDate: scheduledDate || now.split('T')[0],
          assignedMachine: assignedMachine || 'Bambu Lab X1C',
          internalAdminNotes: notes?.trim() || 'Manual add via Production Board',
          confirmedAt: now,
        },
        isExample: false,
        createdAt: now,
        updatedAt: now,
      };

      const saved = await createStravaOrder(newOrder);
      return NextResponse.json({
        success: true,
        message: 'Pesanan berhasil ditambahkan ke antrian produksi!',
        data: saved,
      });
    }

    // 3. Batch Management
    if (action === 'create_batch') {
      const { name, scheduledDate, notes } = body;
      if (!name || !name.trim()) {
        return NextResponse.json({ success: false, error: 'Nama batch wajib diisi' }, { status: 400 });
      }
      const newBatch = await createProductionBatch({ name, scheduledDate, notes });
      return NextResponse.json({ success: true, data: newBatch });
    }

    if (action === 'update_batch') {
      const { id, updates } = body;
      if (!id) {
        return NextResponse.json({ success: false, error: 'ID batch wajib diisi' }, { status: 400 });
      }
      const updated = await updateProductionBatch(id, updates);
      return NextResponse.json({ success: true, data: updated });
    }

    if (action === 'delete_batch') {
      const { id } = body;
      if (!id) {
        return NextResponse.json({ success: false, error: 'ID batch wajib diisi' }, { status: 400 });
      }
      await deleteProductionBatch(id);
      return NextResponse.json({ success: true, message: 'Batch berhasil dihapus' });
    }

    return NextResponse.json({ success: false, error: 'Aksi tidak dikenali' }, { status: 400 });
  } catch (error: any) {
    console.error('Error in production POST:', error);
    return NextResponse.json({ success: false, error: error.message || 'Gagal memproses data produksi' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const isAuth = await checkAdminAuth();
    if (!isAuth) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      id, 
      status, 
      batchName, 
      scheduledDate, 
      assignedMachine, 
      internalAdminNotes, 
      stravaData,
      customer
    } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID pesanan wajib disertakan' }, { status: 400 });
    }

    const updatePayload: any = {
      ...(customer ? { customer } : {}),
      ...(stravaData ? { stravaData } : {}),
      production: {
        ...(body.productionUpdates || {}),
        ...(batchName !== undefined ? { batchName } : {}),
        ...(scheduledDate !== undefined ? { scheduledDate } : {}),
        ...(assignedMachine !== undefined ? { assignedMachine } : {}),
        ...(internalAdminNotes !== undefined ? { internalAdminNotes } : {}),
      },
    };

    if (status === 'Produksi') {
      updatePayload.production.startedAt = new Date().toISOString();
    } else if (status === 'Selesai') {
      updatePayload.production.completedAt = new Date().toISOString();
    }

    const result = await updateStravaOrderStatus(id, status as StravaOrderStatus, updatePayload, true);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Status produksi berhasil diperbarui' });
  } catch (error: any) {
    console.error('Error updating production item:', error);
    return NextResponse.json({ success: false, error: error.message || 'Gagal memperbarui status produksi' }, { status: 500 });
  }
}
