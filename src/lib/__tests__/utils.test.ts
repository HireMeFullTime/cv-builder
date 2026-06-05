import { cn, parseDateString, formatDate, formatPreviewDate } from '../utils';

describe('Utility Functions', () => {
  describe('cn (Tailwind class merger)', () => {
    it('merges multiple class names', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2');
    });

    it('resolves Tailwind conflicts correctly', () => {
      // p-4 should be overridden by p-8
      expect(cn('p-4', 'p-8')).toBe('p-8');
    });

    it('handles conditional classes', () => {
      expect(cn('base-class', true && 'active', false && 'inactive')).toBe('base-class active');
    });
  });

  describe('parseDateString', () => {
    it('returns undefined for empty strings or null', () => {
      expect(parseDateString('')).toBeUndefined();
      expect(parseDateString(null)).toBeUndefined();
      expect(parseDateString(undefined)).toBeUndefined();
    });

    it('parses YYYY-MM strings correctly to UTC Date', () => {
      const date = parseDateString('2023-05');
      expect(date).toBeDefined();
      expect(date?.getUTCFullYear()).toBe(2023);
      expect(date?.getUTCMonth()).toBe(4); // 0-indexed, so May is 4
      expect(date?.getUTCDate()).toBe(1);
    });

    it('falls back to standard Date constructor for full ISO strings', () => {
      const date = parseDateString('2023-12-25T10:00:00.000Z');
      expect(date).toBeDefined();
      expect(date?.getUTCFullYear()).toBe(2023);
      expect(date?.getUTCMonth()).toBe(11);
    });
  });

  describe('formatDate', () => {
    it('returns empty string if no date is provided', () => {
      expect(formatDate(undefined)).toBe('');
    });

    it('formats UTC dates to YYYY-MM', () => {
      const date = new Date(Date.UTC(2024, 8, 15)); // Sept 15, 2024
      expect(formatDate(date)).toBe('2024-09');
    });

    it('pads single-digit months correctly', () => {
      const date = new Date(Date.UTC(2024, 0, 5)); // Jan 5, 2024
      expect(formatDate(date)).toBe('2024-01');
    });
  });

  describe('formatPreviewDate', () => {
    it('returns empty string for invalid inputs', () => {
      expect(formatPreviewDate('')).toBe('');
      expect(formatPreviewDate(null)).toBe('');
      expect(formatPreviewDate(undefined)).toBe('');
    });

    it('returns empty string for invalid date formats', () => {
      expect(formatPreviewDate('not-a-date')).toBe('');
    });

    it('formats date string to MMM YYYY', () => {
      const formatted = formatPreviewDate('2023-10-15T00:00:00.000Z');
      expect(formatted).toBe('Oct 2023');
    });

    it('handles Date objects', () => {
      const date = new Date(Date.UTC(2024, 2, 10)); // March 10, 2024
      const formatted = formatPreviewDate(date);
      expect(formatted).toBe('Mar 2024');
    });
  });
});
