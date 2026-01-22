import { describe, it, expect } from 'vitest';
import {
  formatMonthDay,
  convertToMonthDay,
  isValidMonthDay,
  isBeforeInYear,
  getCurrentSeason
} from './dateFormatting';

describe('dateFormatting', () => {
  describe('formatMonthDay', () => {
    it('should format MM-DD to readable month day', () => {
      expect(formatMonthDay('04-15')).toBe('April 15');
      expect(formatMonthDay('01-01')).toBe('January 1');
      expect(formatMonthDay('12-31')).toBe('December 31');
    });

    it('should format all months correctly', () => {
      expect(formatMonthDay('01-15')).toBe('January 15');
      expect(formatMonthDay('02-15')).toBe('February 15');
      expect(formatMonthDay('03-15')).toBe('March 15');
      expect(formatMonthDay('04-15')).toBe('April 15');
      expect(formatMonthDay('05-15')).toBe('May 15');
      expect(formatMonthDay('06-15')).toBe('June 15');
      expect(formatMonthDay('07-15')).toBe('July 15');
      expect(formatMonthDay('08-15')).toBe('August 15');
      expect(formatMonthDay('09-15')).toBe('September 15');
      expect(formatMonthDay('10-15')).toBe('October 15');
      expect(formatMonthDay('11-15')).toBe('November 15');
      expect(formatMonthDay('12-15')).toBe('December 15');
    });

    it('should return empty string for invalid input', () => {
      expect(formatMonthDay('')).toBe('');
      expect(formatMonthDay(null)).toBe('');
      expect(formatMonthDay(undefined)).toBe('');
      expect(formatMonthDay(123)).toBe('');
    });

    it('should return empty string for invalid format', () => {
      expect(formatMonthDay('2024-04-15')).toBe('');
      expect(formatMonthDay('04/15')).toBe('');
      expect(formatMonthDay('April 15')).toBe('');
      expect(formatMonthDay('4-15')).toBe('');
      expect(formatMonthDay('04-5')).toBe('');
    });

    it('should return empty string for invalid month', () => {
      expect(formatMonthDay('00-15')).toBe('');
      expect(formatMonthDay('13-15')).toBe('');
    });

    it('should return empty string for invalid day', () => {
      expect(formatMonthDay('04-00')).toBe('');
      expect(formatMonthDay('04-32')).toBe('');
    });
  });

  describe('convertToMonthDay', () => {
    it('should convert YYYY-MM-DD to MM-DD', () => {
      expect(convertToMonthDay('2024-04-15')).toBe('04-15');
      expect(convertToMonthDay('2023-12-31')).toBe('12-31');
      expect(convertToMonthDay('2025-01-01')).toBe('01-01');
    });

    it('should return original string if already in MM-DD format', () => {
      expect(convertToMonthDay('04-15')).toBe('04-15');
      expect(convertToMonthDay('12-31')).toBe('12-31');
    });

    it('should return original string for invalid format', () => {
      expect(convertToMonthDay('04/15/2024')).toBe('04/15/2024');
      expect(convertToMonthDay('April 15')).toBe('April 15');
    });

    it('should handle null and undefined', () => {
      expect(convertToMonthDay(null)).toBe(null);
      expect(convertToMonthDay(undefined)).toBe(undefined);
      expect(convertToMonthDay('')).toBe('');
    });

    it('should handle non-string input', () => {
      expect(convertToMonthDay(123)).toBe(123);
    });
  });

  describe('isValidMonthDay', () => {
    it('should return true for valid MM-DD dates', () => {
      expect(isValidMonthDay('01-01')).toBe(true);
      expect(isValidMonthDay('04-15')).toBe(true);
      expect(isValidMonthDay('12-31')).toBe(true);
      expect(isValidMonthDay('02-29')).toBe(true); // Leap day allowed
    });

    it('should return false for invalid month', () => {
      expect(isValidMonthDay('00-15')).toBe(false);
      expect(isValidMonthDay('13-15')).toBe(false);
    });

    it('should return false for invalid day', () => {
      expect(isValidMonthDay('04-00')).toBe(false);
      expect(isValidMonthDay('04-32')).toBe(false);
    });

    it('should validate days in month correctly', () => {
      expect(isValidMonthDay('01-31')).toBe(true); // January has 31 days
      expect(isValidMonthDay('02-29')).toBe(true); // February can have 29 days
      expect(isValidMonthDay('02-30')).toBe(false); // February never has 30 days
      expect(isValidMonthDay('04-30')).toBe(true); // April has 30 days
      expect(isValidMonthDay('04-31')).toBe(false); // April doesn't have 31 days
    });

    it('should return false for invalid format', () => {
      expect(isValidMonthDay('2024-04-15')).toBe(false);
      expect(isValidMonthDay('04/15')).toBe(false);
      expect(isValidMonthDay('4-15')).toBe(false);
      expect(isValidMonthDay('04-5')).toBe(false);
    });

    it('should return false for invalid input', () => {
      expect(isValidMonthDay('')).toBe(false);
      expect(isValidMonthDay(null)).toBe(false);
      expect(isValidMonthDay(undefined)).toBe(false);
      expect(isValidMonthDay(123)).toBe(false);
    });
  });

  describe('isBeforeInYear', () => {
    it('should return true when first date is before second', () => {
      expect(isBeforeInYear('04-15', '10-15')).toBe(true);
      expect(isBeforeInYear('01-01', '12-31')).toBe(true);
      expect(isBeforeInYear('03-20', '03-25')).toBe(true);
    });

    it('should return false when first date is after second', () => {
      expect(isBeforeInYear('10-15', '04-15')).toBe(false);
      expect(isBeforeInYear('12-31', '01-01')).toBe(false);
      expect(isBeforeInYear('03-25', '03-20')).toBe(false);
    });

    it('should return false when dates are the same', () => {
      expect(isBeforeInYear('04-15', '04-15')).toBe(false);
      expect(isBeforeInYear('12-31', '12-31')).toBe(false);
    });

    it('should compare by month first, then day', () => {
      expect(isBeforeInYear('04-30', '05-01')).toBe(true);
      expect(isBeforeInYear('05-01', '04-30')).toBe(false);
    });

    it('should return false for invalid dates', () => {
      expect(isBeforeInYear('invalid', '04-15')).toBe(false);
      expect(isBeforeInYear('04-15', 'invalid')).toBe(false);
      expect(isBeforeInYear('', '04-15')).toBe(false);
      expect(isBeforeInYear('04-15', '')).toBe(false);
    });
  });

  describe('getCurrentSeason', () => {
    it('should return spring for March, April, May', () => {
      expect(getCurrentSeason(new Date(2024, 2, 1))).toBe('spring'); // March 1
      expect(getCurrentSeason(new Date(2024, 2, 15))).toBe('spring'); // March 15
      expect(getCurrentSeason(new Date(2024, 2, 31))).toBe('spring'); // March 31
      expect(getCurrentSeason(new Date(2024, 3, 1))).toBe('spring'); // April 1
      expect(getCurrentSeason(new Date(2024, 3, 15))).toBe('spring'); // April 15
      expect(getCurrentSeason(new Date(2024, 3, 30))).toBe('spring'); // April 30
      expect(getCurrentSeason(new Date(2024, 4, 1))).toBe('spring'); // May 1
      expect(getCurrentSeason(new Date(2024, 4, 15))).toBe('spring'); // May 15
      expect(getCurrentSeason(new Date(2024, 4, 31))).toBe('spring'); // May 31
    });

    it('should return summer for June, July, August', () => {
      expect(getCurrentSeason(new Date(2024, 5, 1))).toBe('summer'); // June 1
      expect(getCurrentSeason(new Date(2024, 5, 15))).toBe('summer'); // June 15
      expect(getCurrentSeason(new Date(2024, 5, 30))).toBe('summer'); // June 30
      expect(getCurrentSeason(new Date(2024, 6, 1))).toBe('summer'); // July 1
      expect(getCurrentSeason(new Date(2024, 6, 15))).toBe('summer'); // July 15
      expect(getCurrentSeason(new Date(2024, 6, 31))).toBe('summer'); // July 31
      expect(getCurrentSeason(new Date(2024, 7, 1))).toBe('summer'); // August 1
      expect(getCurrentSeason(new Date(2024, 7, 15))).toBe('summer'); // August 15
      expect(getCurrentSeason(new Date(2024, 7, 31))).toBe('summer'); // August 31
    });

    it('should return fall for September, October, November', () => {
      expect(getCurrentSeason(new Date(2024, 8, 1))).toBe('fall'); // September 1
      expect(getCurrentSeason(new Date(2024, 8, 15))).toBe('fall'); // September 15
      expect(getCurrentSeason(new Date(2024, 8, 30))).toBe('fall'); // September 30
      expect(getCurrentSeason(new Date(2024, 9, 1))).toBe('fall'); // October 1
      expect(getCurrentSeason(new Date(2024, 9, 15))).toBe('fall'); // October 15
      expect(getCurrentSeason(new Date(2024, 9, 31))).toBe('fall'); // October 31
      expect(getCurrentSeason(new Date(2024, 10, 1))).toBe('fall'); // November 1
      expect(getCurrentSeason(new Date(2024, 10, 15))).toBe('fall'); // November 15
      expect(getCurrentSeason(new Date(2024, 10, 30))).toBe('fall'); // November 30
    });

    it('should return winter for December, January, February', () => {
      expect(getCurrentSeason(new Date(2024, 11, 1))).toBe('winter'); // December 1
      expect(getCurrentSeason(new Date(2024, 11, 15))).toBe('winter'); // December 15
      expect(getCurrentSeason(new Date(2024, 11, 31))).toBe('winter'); // December 31
      expect(getCurrentSeason(new Date(2024, 0, 1))).toBe('winter'); // January 1
      expect(getCurrentSeason(new Date(2024, 0, 15))).toBe('winter'); // January 15
      expect(getCurrentSeason(new Date(2024, 0, 31))).toBe('winter'); // January 31
      expect(getCurrentSeason(new Date(2024, 1, 1))).toBe('winter'); // February 1
      expect(getCurrentSeason(new Date(2024, 1, 15))).toBe('winter'); // February 15
      expect(getCurrentSeason(new Date(2024, 1, 29))).toBe('winter'); // February 29
    });

    it('should use current date when no parameter is provided', () => {
      const result = getCurrentSeason();
      expect(['spring', 'summer', 'fall', 'winter']).toContain(result);
    });

    it('should handle invalid date input by using current date', () => {
      const result = getCurrentSeason(new Date('invalid'));
      expect(['spring', 'summer', 'fall', 'winter']).toContain(result);
    });

    it('should handle non-Date input by using current date', () => {
      const result = getCurrentSeason('not a date');
      expect(['spring', 'summer', 'fall', 'winter']).toContain(result);
    });
  });
});
