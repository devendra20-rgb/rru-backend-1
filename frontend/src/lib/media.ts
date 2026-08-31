/**
 * Media URL resolution utility for frontend Next.js application
 */
export function resolveMediaUrl(url?: string): string {
  if (!url) return '';

  const rawUrl = url.trim();

  // If it's a private S3 URL, rewrite to the backend media file streaming endpoint
  const s3Pattern = /https:\/\/[^/]*s3[^/]*\.amazonaws\.com\/([^?#]+)/i;
  const match = rawUrl.match(s3Pattern);
  if (match && match[1]) {
    const storageKey = match[1];
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    return `${baseUrl.replace(/\/$/, '')}/api/v1/media/file/${storageKey}`;
  }

  // If already absolute http/https, return as-is
  if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://') || rawUrl.startsWith('data:')) {
    return rawUrl;
  }

  // Otherwise, prefix with backend API URL
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const cleanPath = rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`;
  return `${baseUrl.replace(/\/$/, '')}${cleanPath}`;
}
