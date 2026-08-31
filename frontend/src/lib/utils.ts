// Utility functions

import { DEFAULT_CURRENCY } from './constants';

/**
 * Format a price with currency and locale
 */
export function formatPrice(
  amount: number,
  currency: string = DEFAULT_CURRENCY,
  compact = false
): string {
  if (compact && amount >= 1000) {
    const k = amount / 1000;
    return `${currency} ${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}k`;
  }
  return `${currency} ${amount.toLocaleString('en-US')}`;
}

/**
 * Format a monthly cost display
 */
export function formatMonthlyCost(amount: number, currency: string = DEFAULT_CURRENCY): string {
  return `${currency} ${amount.toLocaleString('en-US')}/mo`;
}

/**
 * Generate a slug from a string
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Truncate text to a max length
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '…';
}

/**
 * Calculate reading time for an article
 */
export function readingTime(text: string): number {
  const wordsPerMinute = 200;
  const wordCount = text.split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

/**
 * Format a date for display
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Classname merge utility (lightweight clsx alternative)
 */
export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Generate percentage from two numbers
 */
export function percentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

/**
 * Resolves relative or full media URLs against NEXT_PUBLIC_API_URL or backend origin
 */
export function resolveMediaUrl(url?: string): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
  const serverRoot = apiBase.replace(/\/api\/v1\/?$/, '');
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${serverRoot}${cleanPath}`;
}
