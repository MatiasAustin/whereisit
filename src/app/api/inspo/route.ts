import { NextResponse } from 'next/server';
import { getInspoList, createInspoItem, updateInspoItem, deleteInspoItem } from '@/lib/storage';
import { cookies } from 'next/headers';

async function checkAdminAuth() {
  const cookieStore = await cookies();
  const session = cookieStore.get('whereisit_admin_session');
  return Boolean(session && session.value === 'authenticated');
}

export async function GET() {
  try {
    const list = await getInspoList();
    return NextResponse.json({ success: true, data: list });
  } catch (error: any) {
    console.error('Error fetching inspo list:', error);
    return NextResponse.json({ success: false, error: 'Gagal mengambil data inspirasi' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const isAuth = await checkAdminAuth();
    if (!isAuth) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    const body = await request.json();
    const { url, notes, title, description, imageUrl, platform, favicon, siteName } = body;

    if (!url || !url.trim()) {
      return NextResponse.json({ success: false, error: 'Link URL wajib diisi' }, { status: 400 });
    }

    // Auto extract preview if not passed
    let previewData: any = { title, description, imageUrl, platform, favicon, siteName };
    if (!imageUrl || !title) {
      try {
        const previewUrl = new URL(request.url).origin + '/api/inspo/preview';
        const res = await fetch(previewUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
          signal: AbortSignal.timeout(6000),
        });
        if (res.ok) {
          const previewJson = await res.json();
          if (previewJson.success && previewJson.data) {
            previewData = {
              title: previewJson.data.title,
              description: previewJson.data.description,
              imageUrl: previewJson.data.imageUrl,
              platform: previewJson.data.platform,
              favicon: previewJson.data.favicon,
              siteName: previewJson.data.siteName,
            };
          }
        }
      } catch (e) {
        console.warn('Auto preview on save failed, proceeding with basic info:', e);
      }
    }

    const newItem = await createInspoItem({
      url: url.trim(),
      notes: (notes || '').trim(),
      title: previewData.title || title,
      description: previewData.description || description,
      imageUrl: previewData.imageUrl || imageUrl,
      platform: previewData.platform || platform,
      favicon: previewData.favicon || favicon,
      siteName: previewData.siteName || siteName,
    });

    return NextResponse.json({ success: true, data: newItem });
  } catch (error: any) {
    console.error('Error creating inspo item:', error);
    return NextResponse.json({ success: false, error: error.message || 'Gagal menyimpan inspirasi' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const isAuth = await checkAdminAuth();
    if (!isAuth) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    const body = await request.json();
    const { id, notes, status, title } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID inspirasi wajib disertakan' }, { status: 400 });
    }

    const updated = await updateInspoItem(id, {
      ...(notes !== undefined ? { notes: notes.trim() } : {}),
      ...(status ? { status } : {}),
      ...(title ? { title: title.trim() } : {}),
    });

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Inspirasi tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Error updating inspo item:', error);
    return NextResponse.json({ success: false, error: 'Gagal memperbarui inspirasi' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const isAuth = await checkAdminAuth();
    if (!isAuth) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID inspirasi wajib disertakan' }, { status: 400 });
    }

    const success = await deleteInspoItem(id);
    if (!success) {
      return NextResponse.json({ success: false, error: 'Inspirasi tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Inspirasi berhasil dihapus' });
  } catch (error: any) {
    console.error('Error deleting inspo item:', error);
    return NextResponse.json({ success: false, error: 'Gagal menghapus inspirasi' }, { status: 500 });
  }
}
