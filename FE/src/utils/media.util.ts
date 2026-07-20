/**
 * Media utilities for handling images and videos
 */

// Supported image extensions
const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'ico', 'bmp', 'avif'];

// Supported video extensions
const VIDEO_EXTENSIONS = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'];

export type MediaType = 'image' | 'video' | 'unknown';

/**
 * Get file extension from URL or path
 */
export function getFileExtension(url: string): string {
  if (!url) return '';

  // Remove query params and hash
  const cleanUrl = url.split('?')[0].split('#')[0];
  const parts = cleanUrl.split('.');

  if (parts.length < 2) return '';

  return parts[parts.length - 1].toLowerCase();
}

/**
 * Check if URL is an image
 */
export function isImage(url: string): boolean {
  const ext = getFileExtension(url);
  return IMAGE_EXTENSIONS.includes(ext);
}

/**
 * Check if URL is a video
 */
export function isVideo(url: string): boolean {
  const ext = getFileExtension(url);
  return VIDEO_EXTENSIONS.includes(ext);
}

/**
 * Check if URL is a GIF
 */
export function isGif(url: string): boolean {
  return getFileExtension(url) === 'gif';
}

/**
 * Get media type from URL
 */
export function getMediaType(url: string): MediaType {
  if (isImage(url)) return 'image';
  if (isVideo(url)) return 'video';
  return 'unknown';
}

/**
 * Validate media URL against allowed types
 */
export function validateMediaUrl(
  url: string,
  allowedTypes: MediaType[] = ['image', 'video']
): boolean {
  const type = getMediaType(url);
  return allowedTypes.includes(type);
}

/**
 * Get appropriate MIME type for video
 */
export function getVideoMimeType(url: string): string {
  const ext = getFileExtension(url);
  const mimeTypes: Record<string, string> = {
    mp4: 'video/mp4',
    webm: 'video/webm',
    ogg: 'video/ogg',
    mov: 'video/quicktime',
    avi: 'video/x-msvideo',
    mkv: 'video/x-matroska',
  };
  return mimeTypes[ext] || 'video/mp4';
}
