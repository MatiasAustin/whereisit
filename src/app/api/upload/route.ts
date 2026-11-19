import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getSupabaseServerClient } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    // Validate size (max 10MB)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ success: false, error: 'Ukuran file melebihi batas 10MB' }, { status: 400 });
    }

    // Validate type
    const validMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validMimes.includes(file.type)) {
      return NextResponse.json({ success: false, error: 'Format file harus JPG, PNG, atau WebP' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `strava-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

    // 1. TIER 1: Try Supabase Storage (if configured)
    try {
      const supabase = getSupabaseServerClient();
      if (supabase) {
        let { data: uploadData, error: uploadErr } = await supabase.storage
          .from('strava-uploads')
          .upload(filename, buffer, {
            contentType: file.type || 'image/jpeg',
            upsert: true,
          });

        // If bucket does not exist, attempt to auto-create 'strava-uploads' bucket as public
        if (
          uploadErr &&
          (uploadErr.message?.toLowerCase().includes('not found') ||
            uploadErr.message?.toLowerCase().includes('bucket') ||
            (uploadErr as any).statusCode === '404' ||
            (uploadErr as any).status === 404)
        ) {
          try {
            await supabase.storage.createBucket('strava-uploads', {
              public: true,
              fileSizeLimit: 10485760,
              allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
            });

            const retry = await supabase.storage
              .from('strava-uploads')
              .upload(filename, buffer, {
                contentType: file.type || 'image/jpeg',
                upsert: true,
              });

            uploadData = retry.data;
            uploadErr = retry.error;
          } catch (createErr) {
            console.warn('Auto createBucket error:', createErr);
          }
        }

        if (!uploadErr && uploadData?.path) {
          const { data: publicUrlData } = supabase.storage
            .from('strava-uploads')
            .getPublicUrl(uploadData.path);

          if (publicUrlData?.publicUrl) {
            return NextResponse.json({
              success: true,
              url: publicUrlData.publicUrl,
              filename: file.name,
              source: 'supabase',
            });
          }
        } else if (uploadErr) {
          console.warn('Supabase storage upload error:', uploadErr);
        }
      }
    } catch (storageErr) {
      console.warn('Supabase Storage attempt skipped/failed, proceeding to fallback:', storageErr);
    }

    // 2. TIER 2: Try Local Filesystem (active in local dev environment when NOT on Vercel/serverless)
    const isServerless = Boolean(
      process.env.VERCEL ||
      process.env.AWS_LAMBDA_FUNCTION_NAME ||
      process.env.NETLIFY
    );

    if (!isServerless) {
      try {
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'strava');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        const filePath = path.join(uploadDir, filename);
        fs.writeFileSync(filePath, buffer);
        const publicUrl = `/uploads/strava/${filename}`;
        return NextResponse.json({
          success: true,
          url: publicUrl,
          filename: file.name,
          source: 'local',
        });
      } catch (fsErr) {
        console.warn('Local filesystem write failed, using base64 fallback:', fsErr);
      }
    }

    // 3. TIER 3: Universal Base64 Data URI Fallback
    // Guaranteed to work on Vercel, AWS Lambda, Docker, or any read-only disk environment.
    const mime = file.type || 'image/jpeg';
    const base64Url = `data:${mime};base64,${buffer.toString('base64')}`;

    return NextResponse.json({
      success: true,
      url: base64Url,
      filename: file.name,
      source: 'base64',
    });
  } catch (error: any) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal mengunggah gambar' },
      { status: 500 }
    );
  }
}
