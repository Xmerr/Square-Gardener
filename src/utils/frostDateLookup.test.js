import { describe, it, expect } from 'vitest';
import {
  lookupFrostDates,
  isZipCodeSupported,
  getZipCodePrefix
} from './frostDateLookup';

describe('frostDateLookup', () => {
  describe('lookupFrostDates', () => {
    it('should return frost dates for a known NYC ZIP code', () => {
      const result = lookupFrostDates('10001');
      expect(result).toEqual({
        lastSpringFrost: '04-15',
        firstFallFrost: '10-15'
      });
    });

    it('should return frost dates for Los Angeles area', () => {
      const result = lookupFrostDates('90001');
      expect(result).toEqual({
        lastSpringFrost: '02-15',
        firstFallFrost: '12-15'
      });
    });

    it('should return frost dates for Chicago area', () => {
      const result = lookupFrostDates('60601');
      expect(result).toEqual({
        lastSpringFrost: '04-20',
        firstFallFrost: '10-10'
      });
    });

    it('should return frost dates for Miami area', () => {
      const result = lookupFrostDates('33101');
      expect(result).toEqual({
        lastSpringFrost: '02-01',
        firstFallFrost: '12-25'
      });
    });

    it('should return frost dates for Denver area', () => {
      const result = lookupFrostDates('80001');
      expect(result).toEqual({
        lastSpringFrost: '05-05',
        firstFallFrost: '09-25'
      });
    });

    it('should return frost dates for Seattle area', () => {
      const result = lookupFrostDates('98001');
      expect(result).toEqual({
        lastSpringFrost: '04-10',
        firstFallFrost: '10-20'
      });
    });

    it('should return frost dates for Huntsville, AL (issue #45 acceptance criteria)', () => {
      const result = lookupFrostDates('35759');
      expect(result).toEqual({
        lastSpringFrost: '03-25',
        firstFallFrost: '11-05'
      });
    });

    it('should return frost dates for various new states', () => {
      // Vermont
      expect(lookupFrostDates('05401')).toEqual({
        lastSpringFrost: '05-25',
        firstFallFrost: '09-05'
      });

      // Alaska (Anchorage)
      expect(lookupFrostDates('99501')).toEqual({
        lastSpringFrost: '05-20',
        firstFallFrost: '09-10'
      });

      // Hawaii (no frost)
      expect(lookupFrostDates('96701')).toEqual({
        lastSpringFrost: '01-01',
        firstFallFrost: '12-31'
      });
    });

    it('should return frost dates for northernmost Alaska', () => {
      const result = lookupFrostDates('99999');
      expect(result).toEqual({
        lastSpringFrost: '06-20',
        firstFallFrost: '08-10'
      });
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
        lastSpringFrost: '04-15',
        firstFallFrost: '10-15'
      });
    });

    it('should handle ZIP codes with dashes', () => {
      const result = lookupFrostDates('100-01');
      expect(result).toEqual({
        lastSpringFrost: '04-15',
        firstFallFrost: '10-15'
      });
    });

    it('should work with only 3 digits', () => {
      const result = lookupFrostDates('100');
      expect(result).toEqual({
        lastSpringFrost: '04-15',
        firstFallFrost: '10-15'
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
      // Use a ZIP prefix that doesn't exist (like 001, 002, 003, etc.)
      expect(isZipCodeSupported('00100')).toBe(false);
      expect(isZipCodeSupported('00200')).toBe(false);
      expect(isZipCodeSupported('00300')).toBe(false);
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
