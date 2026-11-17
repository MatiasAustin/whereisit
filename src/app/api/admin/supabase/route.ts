import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  getActiveSupabaseCredentials,
  testSupabaseConnection,
} from '@/lib/supabaseServer';
import {
  getStoredSupabaseConfig,
  saveStoredSupabaseConfig,
} from '@/lib/storage';

function maskKey(key: string): string {
  if (!key) return '';
  if (key.length <= 10) return '********';
  return `${key.slice(0, 6)}...${key.slice(-4)}`;
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('whereisit_admin_session');
    if (!session || session.value !== 'authenticated') {
      return NextResponse.json({ success: false, error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    const creds = getActiveSupabaseCredentials();
    const stored = getStoredSupabaseConfig();
    const health = await testSupabaseConnection();

    return NextResponse.json({
      success: true,
      config: {
        url: creds.url,
        anonKeyMasked: maskKey(creds.anonKey),
        serviceRoleKeyMasked: maskKey(creds.key),
        hasStoredConfig: Boolean(stored.url),
        hasAnonKey: Boolean(creds.anonKey),
        hasServiceRoleKey: Boolean(creds.key),
        isConfigured: creds.isConfigured,
        source: creds.source,
        updatedAt: stored.updatedAt || null,
      },
      health,
    });
  } catch (error: any) {
    console.error('Error fetching supabase settings:', error);
    return NextResponse.json({ success: false, error: error.message || 'Gagal memuat konfigurasi Supabase' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('whereisit_admin_session');
    if (!session || session.value !== 'authenticated') {
      return NextResponse.json({ success: false, error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    const body = await request.json();
    const { url, anonKey, serviceRoleKey, clearStored } = body;

    // Reset to .env defaults if requested
    if (clearStored) {
      saveStoredSupabaseConfig({ url: '', anonKey: '', serviceRoleKey: '' });
      return NextResponse.json({
        success: true,
        message: 'Konfigurasi runtime telah direset ke nilai environment variables (.env)',
      });
    }

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ success: false, error: 'Supabase Project URL wajib diisi' }, { status: 400 });
    }

    const cleanUrl = url.trim();
    if (!cleanUrl.startsWith('https://')) {
      return NextResponse.json({ success: false, error: 'Supabase URL harus diawali dengan https://' }, { status: 400 });
    }

    const currentStored = getStoredSupabaseConfig();
    const newAnonKey = (anonKey !== undefined && anonKey !== '') ? anonKey.trim() : currentStored.anonKey;
    const newServiceKey = (serviceRoleKey !== undefined && serviceRoleKey !== '') ? serviceRoleKey.trim() : currentStored.serviceRoleKey;

    if (!newAnonKey && !newServiceKey) {
      return NextResponse.json({ success: false, error: 'Minimal Anon Key atau Service Role Key harus diisi' }, { status: 400 });
    }

    // Test connection with new credentials before saving
    const testResult = await testSupabaseConnection(cleanUrl, newServiceKey || newAnonKey);
    
    // Save to runtime storage
    saveStoredSupabaseConfig({
      url: cleanUrl,
      anonKey: newAnonKey,
      serviceRoleKey: newServiceKey,
    });

    return NextResponse.json({
      success: true,
      message: testResult.connected
        ? 'Koneksi Supabase berhasil disimpan dan aktif!'
        : 'Konfigurasi disimpan. Catatan: Jalankan SQL schema jika tabel belum dibuat di Supabase.',
      health: testResult,
    });
  } catch (error: any) {
    console.error('Error updating supabase settings:', error);
    return NextResponse.json({ success: false, error: error.message || 'Gagal menyimpan konfigurasi Supabase' }, { status: 500 });
  }
}
