import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const MAX_IMAGE_SIZE = 1.5 * 1024 * 1024; // 1.5 MB
const MAX_VIDEO_SIZE = 10 * 1024 * 1024;  // 10 MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    // Check for chunked upload parameters
    const chunk = formData.get('chunk') as Blob | null;
    const uploadId = formData.get('uploadId') as string | null;
    const chunkIndexStr = formData.get('chunkIndex') as string | null;
    const totalChunksStr = formData.get('totalChunks') as string | null;
    const fileName = formData.get('fileName') as string | null;
    const totalSizeStr = formData.get('totalSize') as string | null;

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // 1. Handle Chunked Upload (bypasses any reverse proxy or Nginx request size limits!)
    if (chunk && uploadId && chunkIndexStr !== null && totalChunksStr !== null && fileName) {
      const chunkIndex = parseInt(chunkIndexStr, 10);
      const totalChunks = parseInt(totalChunksStr, 10);
      const totalSize = parseInt(totalSizeStr || '0', 10);

      const isVideo = /\.(mp4|webm|mov|mkv|avi)$/i.test(fileName);
      const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
      const maxLabel = isVideo ? '10 MB' : '1.5 MB';

      if (totalSize > maxSize) {
        return NextResponse.json(
          {
            error: `File size exceeds the ${maxLabel} limit (selected file is ${(totalSize / (1024 * 1024)).toFixed(2)} MB).`,
          },
          { status: 413 }
        );
      }

      const chunkBuffer = Buffer.from(await chunk.arrayBuffer());
      const tempPath = path.join(uploadsDir, `temp-${uploadId.replace(/[^a-zA-Z0-9_-]/g, '')}`);

      if (chunkIndex === 0) {
        fs.writeFileSync(tempPath, chunkBuffer);
      } else {
        fs.appendFileSync(tempPath, chunkBuffer);
      }

      // If this was the last chunk, finalize the file
      if (chunkIndex === totalChunks - 1) {
        const originalExt = path.extname(fileName) || (isVideo ? '.mp4' : '.webp');
        const baseName = path.basename(fileName, originalExt).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40) || 'upload';
        const finalFilename = `${baseName}-${Date.now()}${originalExt}`;
        const finalPath = path.join(uploadsDir, finalFilename);

        fs.renameSync(tempPath, finalPath);

        return NextResponse.json({
          url: `/uploads/${finalFilename}`,
          filename: finalFilename,
          size: totalSize,
          complete: true,
          message: 'Upload complete',
        }, { status: 200 });
      }

      return NextResponse.json({
        complete: false,
        chunkIndex,
        totalChunks,
        message: `Chunk ${chunkIndex + 1}/${totalChunks} received`,
      }, { status: 200 });
    }

    // 2. Handle Single File Upload (for smaller files)
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'No file or chunk provided' }, { status: 400 });
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
        complete: true,
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
