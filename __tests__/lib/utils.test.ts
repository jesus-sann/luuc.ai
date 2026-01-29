import { describe, it, expect } from 'vitest';
import { cn, formatDate, getRiskColor, getRiskBorderColor } from '@/lib/utils';

describe('utils', () => {
  describe('cn (className merger)', () => {
    it('should merge class names correctly', () => {
      expect(cn('foo', 'bar')).toBe('foo bar');
    });

    it('should handle conditional classes', () => {
      expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz');
    });

    it('should merge Tailwind classes correctly (no conflicts)', () => {
      // tailwind-merge removes conflicting classes, keeping the last one
      const result = cn('px-2 py-1', 'px-4');
      expect(result).toContain('px-4');
      expect(result).toContain('py-1');
      expect(result).not.toContain('px-2');
    });

    it('should handle empty/undefined inputs', () => {
      expect(cn('foo', undefined, null, 'bar')).toBe('foo bar');
    });
  });

  describe('formatDate', () => {
    it('should format a date string in Spanish', () => {
      const date = '2024-01-15';
      const result = formatDate(date);
      expect(result).toContain('2024');
      expect(result).toContain('enero'); // Month name in Spanish
      // Note: Date parsing can be affected by timezone
    });

    it('should handle Date objects', () => {
      const date = new Date('2024-01-15');
      const result = formatDate(date);
      expect(result).toContain('2024');
    });

    it('should format dates consistently', () => {
      const date1 = formatDate('2024-01-15');
      const date2 = formatDate(new Date('2024-01-15'));
      expect(date1).toBe(date2);
    });
  });

  describe('getRiskColor', () => {
    it('should return correct color for CRITICO', () => {
      expect(getRiskColor('CRITICO')).toBe('bg-red-500 text-white');
    });

    it('should return correct color for ALTO', () => {
      expect(getRiskColor('ALTO')).toBe('bg-orange-500 text-white');
    });

    it('should return correct color for MEDIO', () => {
      expect(getRiskColor('MEDIO')).toBe('bg-yellow-500 text-black');
    });

    it('should return correct color for BAJO', () => {
      expect(getRiskColor('BAJO')).toBe('bg-green-500 text-white');
    });

    it('should return default color for unknown levels', () => {
      expect(getRiskColor('UNKNOWN')).toBe('bg-gray-500 text-white');
    });

    it('should handle case sensitivity', () => {
      // Current implementation is case-sensitive
      expect(getRiskColor('critico')).toBe('bg-gray-500 text-white');
    });
  });

  describe('getRiskBorderColor', () => {
    it('should return correct border color for CRITICO', () => {
      expect(getRiskBorderColor('CRITICO')).toBe('border-red-500');
    });

    it('should return correct border color for ALTO', () => {
      expect(getRiskBorderColor('ALTO')).toBe('border-orange-500');
    });

    it('should return correct border color for MEDIO', () => {
      expect(getRiskBorderColor('MEDIO')).toBe('border-yellow-500');
    });

    it('should return correct border color for BAJO', () => {
      expect(getRiskBorderColor('BAJO')).toBe('border-green-500');
    });

    it('should return default border color for unknown levels', () => {
      expect(getRiskBorderColor('UNKNOWN')).toBe('border-gray-500');
    });
  });
});
