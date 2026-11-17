import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

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
    const validMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validMimes.includes(file.type)) {
      return NextResponse.json({ success: false, error: 'Format file harus JPG, PNG, atau WebP' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to public/uploads/strava/ (or base64 fallback on read-only serverless disk)
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'strava');
    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `strava-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const filePath = path.join(uploadDir, filename);

    try {
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      fs.writeFileSync(filePath, buffer);
      const publicUrl = `/uploads/strava/${filename}`;
      return NextResponse.json({ success: true, url: publicUrl, filename: file.name });
    } catch (fsErr: any) {
      // In Serverless environments like Vercel Lambda, /var/task is read-only (EROFS).
      // Return highly optimized data URI instead so upload never fails.
      if (
        fsErr?.code === 'EROFS' ||
        fsErr?.code === 'EACCES' ||
        fsErr?.code === 'EPERM' ||
        String(fsErr?.message).toLowerCase().includes('read-only')
      ) {
        const base64Url = `data:${file.type};base64,${buffer.toString('base64')}`;
        return NextResponse.json({ success: true, url: base64Url, filename: file.name });
      }
      throw fsErr;
    }
  } catch (error: any) {
    console.error('File upload error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Gagal mengunggah gambar' }, { status: 500 });
  }
}
