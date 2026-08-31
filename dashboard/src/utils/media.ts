/**
 * Resolves a media URL (whether relative or absolute) to a full, valid image URL.
 * Handles production vs development backend hostnames dynamically.
 */
export function resolveMediaUrl(url?: string): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Get API base URL from Vite env or fallback
  const apiBase = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) 
    ? import.meta.env.VITE_API_URL 
    : 'http://localhost:5000/api/v1';

  // Strip trailing /api/v1 if present to get server root host
  const serverRoot = apiBase.replace(/\/api\/v1\/?$/, '');
  const cleanPath = url.startsWith('/') ? url : `/${url}`;

  return `${serverRoot}${cleanPath}`;
}
