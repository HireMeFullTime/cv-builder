import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseDateString(val: string | null | undefined): Date | undefined {
  if (!val) return undefined;
  const parts = val.split('-');
  if (parts.length >= 2) {
    return new Date(Date.UTC(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, 1));
  }
  return new Date(val);
}

export function formatDate(date?: Date): string {
  if (!date) return '';
  return `${date.getUTCFullYear()}-${(date.getUTCMonth() + 1).toString().padStart(2, '0')}`;
}

export function formatPreviewDate(dateString?: string | Date | null): string {
  if (!dateString) return '';
  const d = new Date(dateString);
  return isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-US', {month: 'short', year: 'numeric', timeZone: 'UTC'});
}
