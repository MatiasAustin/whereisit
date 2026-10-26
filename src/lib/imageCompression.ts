/**
 * Reusable High-Performance Client-Side Image Auto-Compression Utility
 * Compresses large JPEG/PNG photos before uploading to save bandwidth and storage.
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0 (default 0.82)
  preserveAlpha?: boolean; // Keep transparent background for PNG/WebP logos
}

export interface CompressionResult {
  dataUrl: string;
  blob: Blob;
  file: File;
  originalSize: number;
  compressedSize: number;
  originalSizeFormatted: string;
  compressedSizeFormatted: string;
  savedPercent: number;
  width: number;
  height: number;
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const {
    maxWidth = 1400,
    maxHeight = 1400,
    quality = 0.82,
    preserveAlpha = true,
  } = options;

  return new Promise((resolve, reject) => {
    // If SVG, no need to compress with canvas
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        resolve({
          dataUrl,
          blob: file,
          file,
          originalSize: file.size,
          compressedSize: file.size,
          originalSizeFormatted: formatBytes(file.size),
          compressedSizeFormatted: formatBytes(file.size),
          savedPercent: 0,
          width: 0,
          height: 0,
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect-ratio preserved dimensions
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context could not be created'));
          return;
        }

        // Enable high quality image downsampling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Check if image is PNG and whether we should preserve transparency
        const isPng = file.type === 'image/png';
        
        if (!isPng || !preserveAlpha) {
          // Fill background with white if alpha is not preserved
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Determine output MIME type
        // Use webp if supported, or preserve png for transparent logos
        let outputType = 'image/webp';
        if (isPng && preserveAlpha) {
          // Test if browser supports image/webp with alpha or keep image/png
          outputType = 'image/png';
        }

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image to blob'));
              return;
            }

            // Convert to dataUrl for immediate preview and DB storage
            const dataUrl = canvas.toDataURL(outputType, quality);
            const compressedSize = blob.size;
            const originalSize = file.size;
            const saved = Math.max(0, Math.round(((originalSize - compressedSize) / originalSize) * 100));

            const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '') + (outputType === 'image/webp' ? '.webp' : '.png'), {
              type: outputType,
              lastModified: Date.now(),
            });

            resolve({
              dataUrl,
              blob,
              file: compressedFile,
              originalSize,
              compressedSize,
              originalSizeFormatted: formatBytes(originalSize),
              compressedSizeFormatted: formatBytes(compressedSize),
              savedPercent: saved,
              width,
              height,
            });
          },
          outputType,
          quality
        );
      };

      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}
