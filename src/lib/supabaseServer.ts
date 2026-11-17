import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getStoredSupabaseConfig } from './storage';

let cachedClient: SupabaseClient | null = null;
let cachedKey = '';

export function getActiveSupabaseCredentials() {
  let storedUrl = '';
  let storedKey = '';
  let storedAnonKey = '';

  try {
    const stored = getStoredSupabaseConfig();
    storedUrl = stored.url?.trim() || '';
    storedKey = stored.serviceRoleKey?.trim() || stored.anonKey?.trim() || '';
    storedAnonKey = stored.anonKey?.trim() || '';
  } catch {
    // Fall back to env
  }

  const envUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
  const envKey = (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    ''
  ).trim();
  const envAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();

  const url = storedUrl || envUrl;
  const key = storedKey || envKey;
  const anonKey = storedAnonKey || envAnonKey;

  const isConfigured = Boolean(
    url &&
    key &&
    !url.includes('your-project') &&
    !key.includes('your-')
  );

  return {
    url,
    key,
    anonKey,
    isConfigured,
    source: storedUrl ? 'dashboard' : envUrl ? 'env' : 'none',
  };
}

export const isSupabaseServerConfigured = Boolean(
  (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL) &&
  (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
);

// Server-side Supabase client for Route Handlers and Server Actions
export function getSupabaseServerClient(): SupabaseClient | null {
  const { url, key, isConfigured } = getActiveSupabaseCredentials();
  if (!isConfigured) return null;

  const cacheId = `${url}::${key}`;
  if (cachedClient && cachedKey === cacheId) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    cachedKey = cacheId;
    return cachedClient;
  } catch (err) {
    console.warn('Failed to initialize Supabase client:', err);
    return null;
  }
}

export interface TableStatus {
  name: string;
  exists: boolean;
  count: number;
  error?: string;
}

export async function testSupabaseConnection(
  overrideUrl?: string,
  overrideKey?: string
): Promise<{
  connected: boolean;
  url: string;
  tables: TableStatus[];
  error?: string;
}> {
  const creds = getActiveSupabaseCredentials();
  const targetUrl = overrideUrl?.trim() || creds.url;
  const targetKey = overrideKey?.trim() || creds.key;

  if (!targetUrl || !targetKey) {
    return {
      connected: false,
      url: targetUrl || '',
      tables: [],
      error: 'Supabase URL dan API Key belum diisi.',
    };
  }

  let client: SupabaseClient;
  try {
    client = createClient(targetUrl, targetKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  } catch (err: any) {
    return {
      connected: false,
      url: targetUrl,
      tables: [],
      error: err.message || 'URL atau Key tidak valid',
    };
  }

  const tableNames = [
    'products',
    'collections',
    'store_settings',
    'customers',
    'orders',
    'draft_orders',
    'abandoned_checkouts',
    'custom_design_inquiries',
    'custom_character_inquiries',
    'product_reviews',
    'journal_articles',
    'discounts',
    'subscribers',
    'strava_orders',
    'notify_list',
  ];

  // Fast connection probe with 3-second timeout
  try {
    const probePromise = client.from('products').select('*', { count: 'exact', head: true });
    const timeoutPromise = new Promise<{ data: null; error: { message: string } }>((_, reject) =>
      setTimeout(() => reject(new Error('Koneksi timeout setelah 3 detik. Pastikan Project URL benar.')), 3000)
    );
    await Promise.race([probePromise, timeoutPromise]);
  } catch (probeErr: any) {
    return {
      connected: false,
      url: targetUrl,
      tables: [],
      error: probeErr.message || 'Gagal terhubung ke host Supabase',
    };
  }

  // Probe succeeded (Postgres responded), now check all tables in parallel
  const tableChecks = await Promise.all(
    tableNames.map(async (name) => {
      try {
        const { count, error } = await client
          .from(name)
          .select('*', { count: 'exact', head: true });
        if (error) {
          return { name, exists: false, count: 0, error: error.message };
        }
        return { name, exists: true, count: count || 0 };
      } catch (e: any) {
        return { name, exists: false, count: 0, error: e.message };
      }
    })
  );

  const atLeastOneSuccess = tableChecks.some((t) => t.exists);

  return {
    connected: atLeastOneSuccess,
    url: targetUrl,
    tables: tableChecks,
    error: atLeastOneSuccess ? undefined : 'Koneksi berhasil tetapi tabel belum dibuat (jalankan SQL schema).',
  };
}
