import { describe, it, expect } from 'vitest';
import { formatDepartments, isValidDepartment } from './department-formatter';

describe('formatDepartments', () => {
  it('should format a single valid department code', () => {
    expect(formatDepartments('75')).toBe('75');
    expect(formatDepartments('01')).toBe('01');
    expect(formatDepartments('2A')).toBe('2A');
    expect(formatDepartments('971')).toBe('971');
  });

  it('should normalize single digit codes', () => {
    expect(formatDepartments('1')).toBe('01');
    expect(formatDepartments('9')).toBe('09');
  });

  it('should handle arrays of department codes', () => {
    expect(formatDepartments(['75', '92', '93'])).toBe('75, 92, 93');
    expect(formatDepartments(['01', '02', '03'])).toBe('01, 02, 03');
  });

  it('should filter out invalid codes', () => {
    expect(formatDepartments(['75', '929578', '92'])).toBe('75, 92');
    expect(formatDepartments(['invalid', '75'])).toBe('75');
    expect(formatDepartments('929578')).toBe('N/A');
  });

  it('should remove duplicates', () => {
    expect(formatDepartments(['75', '75', '92'])).toBe('75, 92');
    expect(formatDepartments(['01', '01', '01'])).toBe('01');
  });

  it('should sort department codes', () => {
    expect(formatDepartments(['93', '75', '92'])).toBe('75, 92, 93');
    expect(formatDepartments(['10', '01', '05'])).toBe('01, 05, 10');
  });

  it('should handle mixed valid and invalid codes', () => {
    expect(formatDepartments(['75', 'xyz', '92', '999999'])).toBe('75, 92');
  });

  it('should extract valid codes from zero-padded strings', () => {
    expect(formatDepartments('750000')).toBe('75');
    expect(formatDepartments('920000')).toBe('92');
  });

  it('should reject codes with non-zero digits after valid prefix', () => {
    expect(formatDepartments('929578')).toBe('N/A');
    expect(formatDepartments('751234')).toBe('N/A');
  });

  it('should return N/A for null or undefined', () => {
    expect(formatDepartments(null)).toBe('N/A');
    expect(formatDepartments(undefined)).toBe('N/A');
  });

  it('should return N/A for empty arrays', () => {
    expect(formatDepartments([])).toBe('N/A');
  });

  it('should return N/A when all codes are invalid', () => {
    expect(formatDepartments(['invalid', 'xyz', '999999'])).toBe('N/A');
  });

  it('should handle Corsica codes', () => {
    expect(formatDepartments('2a')).toBe('2A');
    expect(formatDepartments('2b')).toBe('2B');
    expect(formatDepartments(['2A', '2B'])).toBe('2A, 2B');
  });

  it('should handle overseas territories', () => {
    expect(formatDepartments('971')).toBe('971');
    expect(formatDepartments('972')).toBe('972');
    expect(formatDepartments(['971', '972', '973'])).toBe('971, 972, 973');
  });

  it('should handle numeric input', () => {
    expect(formatDepartments(75)).toBe('75');
    expect(formatDepartments([75, 92, 93])).toBe('75, 92, 93');
  });
});

describe('isValidDepartment', () => {
  it('should validate correct department codes', () => {
    expect(isValidDepartment('75')).toBe(true);
    expect(isValidDepartment('01')).toBe(true);
    expect(isValidDepartment('2A')).toBe(true);
    expect(isValidDepartment('971')).toBe(true);
  });

  it('should reject invalid codes', () => {
    expect(isValidDepartment('00')).toBe(false);
    expect(isValidDepartment('96')).toBe(false);
    expect(isValidDepartment('999')).toBe(false);
    expect(isValidDepartment('929578')).toBe(false);
    expect(isValidDepartment('invalid')).toBe(false);
  });

  it('should handle numeric input', () => {
    expect(isValidDepartment(75)).toBe(true);
    expect(isValidDepartment(1)).toBe(true);
    expect(isValidDepartment(999)).toBe(false);
  });
});
