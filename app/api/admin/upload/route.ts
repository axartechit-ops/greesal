import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const MAX_IMAGE_SIZE = 1.5 * 1024 * 1024; // 1.5 MB
const MAX_VIDEO_SIZE = 10 * 1024 * 1024;  // 10 MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const mime = file.type.toLowerCase();
    const isVideo = mime.startsWith('video/') || /\.(mp4|webm|mov|mkv|avi)$/i.test(file.name);
    const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
    const maxLabel = isVideo ? '10 MB' : '1.5 MB';

    if (file.size > maxSize) {
      const actualMb = (file.size / (1024 * 1024)).toFixed(2);
      return NextResponse.json(
        {
          error: `File size exceeds the ${maxLabel} limit (selected file is ${actualMb} MB). Please choose a smaller file.`,
          maxAllowedBytes: maxSize,
          actualBytes: file.size,
        },
        { status: 413 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const originalExt = path.extname(file.name) || (isVideo ? '.mp4' : '.webp');
    const baseName = path.basename(file.name, originalExt).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40) || 'upload';
    const filename = `${baseName}-${Date.now()}${originalExt}`;
    const targetPath = path.join(uploadsDir, filename);

    fs.writeFileSync(targetPath, buffer);

    return NextResponse.json(
      {
        url: `/uploads/${filename}`,
        filename,
        size: file.size,
        type: file.type,
        message: 'File uploaded successfully',
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error('Error in /api/admin/upload:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to upload file' },
      { status: 500 }
    );
  }
}
