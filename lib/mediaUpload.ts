export const MAX_IMAGE_SIZE = 1.5 * 1024 * 1024; // 1.5 MB
export const MAX_VIDEO_SIZE = 10 * 1024 * 1024;  // 10 MB

/**
 * Upload any media file (images up to 1.5MB, videos up to 10MB) in small chunks
 * (512 KB per chunk) so that it NEVER exceeds Nginx's default 1MB request entity limit.
 */
export async function uploadMediaFileInChunks(
  file: File,
  onProgress?: (percent: number, statusText: string) => void
): Promise<string> {
  const isVideo = file.type.startsWith('video/') || /\.(mp4|webm|mov|mkv|avi)$/i.test(file.name);
  const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
  const maxLabel = isVideo ? '10 MB' : '1.5 MB';

  if (file.size > maxSize) {
    const mb = (file.size / (1024 * 1024)).toFixed(2);
    throw new Error(`File exceeds the ${maxLabel} limit (selected file is ${mb} MB).`);
  }

  // 512 KB chunks guarantee we never exceed Nginx 1M client_max_body_size
  const CHUNK_SIZE = 512 * 1024;
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
  const uploadId = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  for (let i = 0; i < totalChunks; i++) {
    const start = i * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, file.size);
    const chunkBlob = file.slice(start, end);

    const fd = new FormData();
    fd.append('chunk', chunkBlob);
    fd.append('uploadId', uploadId);
    fd.append('chunkIndex', String(i));
    fd.append('totalChunks', String(totalChunks));
    fd.append('fileName', file.name);
    fd.append('fileType', file.type);
    fd.append('totalSize', String(file.size));

    const res = await fetch('/api/admin/upload', {
      method: 'POST',
      body: fd,
    });

    if (!res.ok) {
      let errMsg = `Upload failed on chunk ${i + 1}/${totalChunks}`;
      try {
        const errJson = await res.json();
        errMsg = errJson.error || errMsg;
      } catch {}
      throw new Error(errMsg);
    }

    const data = await res.json();
    const percent = Math.round(((i + 1) / totalChunks) * 100);
    if (onProgress) {
      onProgress(percent, `Uploading: ${percent}%`);
    }

    if (data.complete && data.url) {
      return data.url;
    }
  }

  throw new Error('Upload completed without receiving a file URL.');
}
