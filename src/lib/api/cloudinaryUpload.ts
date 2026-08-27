import axios from 'axios';
import type { UploadSignature } from './types';

export type CloudinaryUploadResult = {
  secureUrl: string;
  width?: number;
  height?: number;
  durationSec?: number;
};

/**
 * Uploads a File straight to Cloudinary using a pre-signed payload from
 * POST /api/upload/signature — the browser never sends the file through
 * our own server. Uses a bare `axios.post` (not the shared `apiClient`)
 * since this goes to Cloudinary's domain, not ours, and doesn't want our
 * API's baseURL or auth-token interceptor attached to it.
 */
export async function uploadToCloudinary(
  file: File,
  sig: UploadSignature,
  onProgress?: (fraction: number) => void
): Promise<CloudinaryUploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', sig.apiKey);
  formData.append('timestamp', String(sig.timestamp));
  formData.append('signature', sig.signature);
  formData.append('folder', sig.folder);
  formData.append('public_id', sig.publicId);

  const { data } = await axios.post(sig.uploadUrl, formData, {
    onUploadProgress: (event) => {
      if (event.total) onProgress?.(event.loaded / event.total);
    },
  });

  return {
    secureUrl: data.secure_url,
    width: data.width,
    height: data.height,
    durationSec: data.duration ? Math.round(data.duration) : undefined,
  };
}

/** Cloudinary auto-generates a poster frame at the same public_id with a .jpg extension. */
export function buildVideoThumbnailUrl(secureVideoUrl: string): string {
  return secureVideoUrl.replace(/\.[a-zA-Z0-9]+$/, '.jpg');
}

/** Reads a video File's natural duration/dimensions in the browser before upload, for client-side validation. */
export function readVideoMetadata(file: File): Promise<{ durationSec: number; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      resolve({ durationSec: video.duration, width: video.videoWidth, height: video.videoHeight });
    };
    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error('Couldn\u2019t read video metadata.'));
    };
    video.src = URL.createObjectURL(file);
  });
}

/** Reads an image File's natural dimensions in the browser before upload. */
export function readImageMetadata(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Couldn\u2019t read image metadata.'));
    };
    img.src = URL.createObjectURL(file);
  });
}