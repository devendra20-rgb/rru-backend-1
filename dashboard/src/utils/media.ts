/**
 * Resolves any media URL to a fully qualified, accessible URL for browsers.
 * Handles:
 * 1. Raw private AWS S3 URLs -> transforms to backend /api/v1/media/file proxy
 * 2. Relative paths (e.g., /uploads/media/...) -> prepends backend API origin
 * 3. Empty/undefined URLs -> returns empty string or placeholder
 */
export function resolveMediaUrl(url?: string): string {
  if (!url) return '';

  const rawUrl = url.trim();

  // If it's a private S3 URL (and not on a custom cloudfront/domain), route it through backend proxy
  const s3Pattern = /https:\/\/[^/]*s3[^/]*\.amazonaws\.com\/([^?#]+)/i;
  const match = rawUrl.match(s3Pattern);
  if (match && match[1]) {
    const storageKey = match[1];
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
    const cleanBase = baseUrl.replace(/\/api\/v1\/?$/, '');
    return `${cleanBase}/api/v1/media/file/${storageKey}`;
  }

  // If already absolute http/https, return as-is
  if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://') || rawUrl.startsWith('data:')) {
    return rawUrl;
  }

  // Otherwise, it's a relative path on backend
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
  const cleanBase = baseUrl.replace(/\/api\/v1\/?$/, '');
  const cleanPath = rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`;
  return `${cleanBase}${cleanPath}`;
}

export function getPlaceholderImage(text = 'No Image', width = 300, height = 200): string {
  return `https://placehold.co/${width}x${height}/f1f5f9/94a3b8?text=${encodeURIComponent(text)}`;
}
