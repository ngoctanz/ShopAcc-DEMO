import { format, formatDistance, formatDistanceToNow, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { APP_CONFIG } from '@/constants/config';

/**
 * Format date to string
 */
export function formatDate(
  date: string | Date,
  formatStr: string = APP_CONFIG.DATE_FORMAT.DEFAULT
): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr, { locale: vi });
}

/**
 * Format date with time
 */
export function formatDateTime(date: string | Date): string {
  return formatDate(date, APP_CONFIG.DATE_FORMAT.WITH_TIME);
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true, locale: vi });
}

/**
 * Format distance between two dates
 */
export function formatDateDistance(dateLeft: string | Date, dateRight: string | Date): string {
  const left = typeof dateLeft === 'string' ? parseISO(dateLeft) : dateLeft;
  const right = typeof dateRight === 'string' ? parseISO(dateRight) : dateRight;
  return formatDistance(left, right, { locale: vi });
}

export function formatTimeAgo(isoDate: string): string {
  const now = new Date();
  const then = new Date(isoDate);
  const diff = (now.getTime() - then.getTime()) / 1000; // seconds

  if (diff < 60) return 'vừa xong';
  if (diff < 3600) {
    const minutes = Math.floor(diff / 60);
    return `${minutes} phút trước`;
  }
  if (diff < 86400) {
    const hours = Math.floor(diff / 3600);
    return `${hours} giờ trước`;
  }
  const days = Math.floor(diff / 86400);
  return `${days} ngày trước`;
}

/**
 * Format currency to VND
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

/**
 * Format number with thousand separators
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('vi-VN').format(num);
}
