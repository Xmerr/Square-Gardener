import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  lookupFrostDates,
  isZipCodeSupported,
  getZipCodePrefix
} from './frostDateLookup';

describe('frostDateLookup', () => {
  const mockYear = 2024;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(mockYear, 5, 15)); // June 15, 2024
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('lookupFrostDates', () => {
    it('should return frost dates for a known NYC ZIP code', () => {
      const result = lookupFrostDates('10001');
      expect(result).toEqual({
        lastSpringFrost: '2024-04-15',
        firstFallFrost: '2024-10-15'
      });
    });

    it('should return frost dates for Los Angeles area', () => {
      const result = lookupFrostDates('90001');
      expect(result).toEqual({
        lastSpringFrost: '2024-02-15',
        firstFallFrost: '2024-12-15'
      });
    });

    it('should return frost dates for Chicago area', () => {
      const result = lookupFrostDates('60601');
      expect(result).toEqual({
        lastSpringFrost: '2024-04-20',
        firstFallFrost: '2024-10-10'
      });
    });

    it('should return frost dates for Miami area', () => {
      const result = lookupFrostDates('33101');
      expect(result).toEqual({
        lastSpringFrost: '2024-02-01',
        firstFallFrost: '2024-12-25'
      });
    });

    it('should return frost dates for Denver area', () => {
      const result = lookupFrostDates('80001');
      expect(result).toEqual({
        lastSpringFrost: '2024-05-05',
        firstFallFrost: '2024-09-25'
      });
    });

    it('should return frost dates for Seattle area', () => {
      const result = lookupFrostDates('98001');
      expect(result).toEqual({
        lastSpringFrost: '2024-04-10',
        firstFallFrost: '2024-10-20'
      });
    });

    it('should return null for unknown ZIP code prefix', () => {
      const result = lookupFrostDates('99999');
      expect(result).toBe(null);
    });

    it('should return null for empty ZIP code', () => {
      const result = lookupFrostDates('');
      expect(result).toBe(null);
    });

    it('should return null for null input', () => {
      const result = lookupFrostDates(null);
      expect(result).toBe(null);
    });

    it('should return null for undefined input', () => {
      const result = lookupFrostDates(undefined);
      expect(result).toBe(null);
    });

    it('should return null for non-string input', () => {
      const result = lookupFrostDates(12345);
      expect(result).toBe(null);
    });

    it('should return null for ZIP code with fewer than 3 digits', () => {
      const result = lookupFrostDates('12');
      expect(result).toBe(null);
    });

    it('should handle ZIP codes with spaces', () => {
      const result = lookupFrostDates('100 01');
      expect(result).toEqual({
        lastSpringFrost: '2024-04-15',
        firstFallFrost: '2024-10-15'
      });
    });

    it('should handle ZIP codes with dashes', () => {
      const result = lookupFrostDates('100-01');
      expect(result).toEqual({
        lastSpringFrost: '2024-04-15',
        firstFallFrost: '2024-10-15'
      });
    });

    it('should work with only 3 digits', () => {
      const result = lookupFrostDates('100');
      expect(result).toEqual({
        lastSpringFrost: '2024-04-15',
        firstFallFrost: '2024-10-15'
      });
    });
  });

  describe('isZipCodeSupported', () => {
    it('should return true for supported ZIP codes', () => {
      expect(isZipCodeSupported('10001')).toBe(true);
      expect(isZipCodeSupported('90001')).toBe(true);
      expect(isZipCodeSupported('60601')).toBe(true);
    });

    it('should return false for unsupported ZIP codes', () => {
      expect(isZipCodeSupported('99999')).toBe(false);
      expect(isZipCodeSupported('00000')).toBe(false);
    });

    it('should return false for invalid input', () => {
      expect(isZipCodeSupported('')).toBe(false);
      expect(isZipCodeSupported(null)).toBe(false);
      expect(isZipCodeSupported('12')).toBe(false);
    });
  });

  describe('getZipCodePrefix', () => {
    it('should return first 3 digits for valid ZIP code', () => {
      expect(getZipCodePrefix('10001')).toBe('100');
      expect(getZipCodePrefix('90210')).toBe('902');
      expect(getZipCodePrefix('60601')).toBe('606');
    });

    it('should return first 3 digits for 3-digit input', () => {
      expect(getZipCodePrefix('100')).toBe('100');
    });

    it('should strip non-digit characters', () => {
      expect(getZipCodePrefix('100-01')).toBe('100');
      expect(getZipCodePrefix('100 01')).toBe('100');
      expect(getZipCodePrefix('1A0B0C0D1')).toBe('100');
    });

    it('should return null for null input', () => {
      expect(getZipCodePrefix(null)).toBe(null);
    });

    it('should return null for undefined input', () => {
      expect(getZipCodePrefix(undefined)).toBe(null);
    });

    it('should return null for non-string input', () => {
      expect(getZipCodePrefix(12345)).toBe(null);
    });

    it('should return null for input with fewer than 3 digits', () => {
      expect(getZipCodePrefix('12')).toBe(null);
      expect(getZipCodePrefix('1')).toBe(null);
      expect(getZipCodePrefix('')).toBe(null);
    });

    it('should return null for input with only non-digits', () => {
      expect(getZipCodePrefix('abc')).toBe(null);
    });
  });
});
