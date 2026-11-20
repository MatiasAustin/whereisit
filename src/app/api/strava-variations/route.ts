import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getStravaMediaConfig, updateStravaMediaConfig } from '@/lib/storage';
import { STRAVA_PRODUCT_CONFIG } from '@/data/stravaKeychainConfig';
import { StravaVariation } from '@/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  'Pragma': 'no-cache',
  'Expires': '0',
};

async function checkAdminAuth() {
  const cookieStore = await cookies();
  const session = cookieStore.get('whereisit_admin_session');
  return Boolean(session && session.value === 'authenticated');
}

export async function GET() {
  try {
    const config = await getStravaMediaConfig();
    const variations =
      config.customVariations && config.customVariations.length > 0
        ? config.customVariations
        : STRAVA_PRODUCT_CONFIG.variations;

    // Overlay prices and images if set in config
    const merged = variations.map((v) => ({
      ...v,
      price:
        config.variationPrices?.[v.id] !== undefined && Number(config.variationPrices[v.id]) > 0
          ? Number(config.variationPrices[v.id])
          : v.price,
      image: config.variationImages?.[v.id] || v.image,
    }));

    return NextResponse.json(
      { success: true, data: merged },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (error: any) {
    console.error('Error fetching strava variations:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data varian' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

export async function POST(request: Request) {
  try {
    const isAuth = await checkAdminAuth();
    if (!isAuth) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin session required' },
        { status: 401, headers: NO_CACHE_HEADERS }
      );
    }

    const body = await request.json();
    const { variation, variations, resetToDefault } = body;

    const config = await getStravaMediaConfig();
    let currentList: StravaVariation[] =
      config.customVariations && config.customVariations.length > 0
        ? [...config.customVariations]
        : [...STRAVA_PRODUCT_CONFIG.variations];

    // Case 1: Reset to default
    if (resetToDefault) {
      const saved = await updateStravaMediaConfig({
        customVariations: STRAVA_PRODUCT_CONFIG.variations,
      });
      return NextResponse.json(
        { success: true, message: 'Varian berhasil direset ke standar', data: saved.customVariations },
        { headers: NO_CACHE_HEADERS }
      );
    }

    // Case 2: Replace full list of variations
    if (Array.isArray(variations)) {
      const newImages = { ...(config.variationImages || {}) };
      const newPrices = { ...(config.variationPrices || {}) };
      variations.forEach((v) => {
        if (v.image) newImages[v.id] = v.image;
        if (v.price) newPrices[v.id] = v.price;
      });

      const saved = await updateStravaMediaConfig({
        customVariations: variations,
        variationImages: newImages,
        variationPrices: newPrices,
      });

      return NextResponse.json(
        { success: true, message: 'Daftar varian berhasil diperbarui di Supabase & Live Web', data: saved.customVariations },
        { headers: NO_CACHE_HEADERS }
      );
    }

    // Case 3: Add single new variation
    if (variation) {
      const existingIdx = currentList.findIndex((v) => v.id === variation.id);
      if (existingIdx >= 0) {
        currentList[existingIdx] = variation;
      } else {
        currentList.push(variation);
      }

      const newImages = { ...(config.variationImages || {}) };
      const newPrices = { ...(config.variationPrices || {}) };
      if (variation.image) newImages[variation.id] = variation.image;
      if (variation.price) newPrices[variation.id] = variation.price;

      const saved = await updateStravaMediaConfig({
        customVariations: currentList,
        variationImages: newImages,
        variationPrices: newPrices,
      });

      return NextResponse.json(
        {
          success: true,
          message: 'Varian baru berhasil disimpan ke Supabase & Live Web!',
          data: saved.customVariations,
        },
        { headers: NO_CACHE_HEADERS }
      );
    }

    return NextResponse.json({ success: false, error: 'Data varian tidak valid' }, { status: 400 });
  } catch (error: any) {
    console.error('Error saving strava variation:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal menyimpan varian' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const isAuth = await checkAdminAuth();
    if (!isAuth) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin session required' },
        { status: 401, headers: NO_CACHE_HEADERS }
      );
    }

    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID varian wajib diisi' }, { status: 400 });
    }

    const config = await getStravaMediaConfig();
    const currentList: StravaVariation[] =
      config.customVariations && config.customVariations.length > 0
        ? [...config.customVariations]
        : [...STRAVA_PRODUCT_CONFIG.variations];

    const filtered = currentList.filter((v) => v.id !== id);
    if (filtered.length === currentList.length) {
      return NextResponse.json({ success: false, error: 'Varian tidak ditemukan' }, { status: 404 });
    }

    const saved = await updateStravaMediaConfig({
      customVariations: filtered,
    });

    return NextResponse.json(
      { success: true, message: 'Varian berhasil dihapus', data: saved.customVariations },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (error: any) {
    console.error('Error deleting strava variation:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menghapus varian' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
