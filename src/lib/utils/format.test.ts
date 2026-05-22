import { describe, it, expect } from 'vitest';
import { formatDate, formatRelativeDate, formatCurrency, truncateText, formatCpvCode } from './format';

describe('Formatting Utilities', () => {
  describe('formatDate', () => {
    it('should format a valid date string', () => {
      expect(formatDate('2025-06-16T12:00:00Z')).toBe('16 juin 2025');
    });

    it('should return an empty string for an invalid date', () => {
      expect(formatDate('invalid-date')).toBe('');
    });
  });

  describe('formatRelativeDate', () => {
    it('should return a relative time string', () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const result = formatRelativeDate(fiveMinutesAgo);
      // The exact phrasing can vary, so we check for substrings
      expect(result).toContain('il y a');
      expect(result).toContain('minutes');
    });

    it('should return an empty string for an invalid date', () => {
      expect(formatRelativeDate('invalid-date')).toBe('');
    });
  });

  describe('formatCurrency', () => {
    it('should format a number into Euro currency string', () => {
      // The space might be a non-breaking space, so we use a regex
      expect(formatCurrency(1234.56)).toMatch(/1\s*234,56\s*€/);
    });
  });

  describe('truncateText', () => {
    it('should not truncate text shorter than maxLength', () => {
      expect(truncateText('hello world', 20)).toBe('hello world');
    });

    it('should truncate text longer than maxLength and not cut words', () => {
      // The function correctly truncates to 'this is a' before adding '...'
      // The test is updated to reflect this expected behavior.
      expect(truncateText('this is a long sentence', 12)).toBe('this is a...');
    });

    it('should handle edge case where maxLength is at a space', () => {
      const truncated = truncateText('A B C D', 3);
      expect(truncated).toBe('A...');
    });

    it('should handle text with no spaces', () => {
      expect(truncateText('longwordwithoutspaces', 10)).toBe('longwordwi...');
    });
  });

  describe('formatCpvCode', () => {
    it('should return the code as is (placeholder)', () => {
      expect(formatCpvCode('71000000')).toBe('71000000');
    });
  });
});