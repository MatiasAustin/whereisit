import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { testSupabaseConnection } from '@/lib/supabaseServer';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('whereisit_admin_session');
    if (!session || session.value !== 'authenticated') {
      return NextResponse.json({ success: false, error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { url, key } = body;

    const result = await testSupabaseConnection(url, key);
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error testing supabase connection:', error);
    return NextResponse.json({ success: false, error: error.message || 'Gagal menguji koneksi Supabase' }, { status: 500 });
  }
}
