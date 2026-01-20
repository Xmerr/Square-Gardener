import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  calculateHarvestDate,
  getEffectiveHarvestDate,
  formatHarvestDateDisplay,
  getDaysUntilHarvest,
  shouldRecalculateHarvestDate
} from './harvestDate';

describe('harvestDate utilities', () => {
  describe('calculateHarvestDate', () => {
    it('calculates harvest date correctly', () => {
      const plantedDate = '2026-01-01T00:00:00.000Z';
      const daysToMaturity = 70;

      const result = calculateHarvestDate(plantedDate, daysToMaturity);
      const harvestDate = new Date(result);

      // Jan 1 + 70 days = March 12
      // Jan: 31 days, Feb: 28 days (2026 not leap) = 59 days to Mar 1
      // 70 - 59 = 11 more days into March = March 12
      expect(harvestDate.getUTCFullYear()).toBe(2026);
      expect(harvestDate.getUTCMonth()).toBe(2); // March (0-indexed)
      expect(harvestDate.getUTCDate()).toBe(12);
    });

    it('handles year boundary correctly', () => {
      const plantedDate = '2025-12-01T00:00:00.000Z';
      const daysToMaturity = 60;

      const result = calculateHarvestDate(plantedDate, daysToMaturity);
      const harvestDate = new Date(result);

      expect(harvestDate.getUTCFullYear()).toBe(2026);
      expect(harvestDate.getUTCMonth()).toBe(0); // January
      expect(harvestDate.getUTCDate()).toBe(30);
    });

    it('handles short maturity periods', () => {
      const plantedDate = '2026-06-15T00:00:00.000Z';
      const daysToMaturity = 25; // Radishes

      const result = calculateHarvestDate(plantedDate, daysToMaturity);
      const harvestDate = new Date(result);

      expect(harvestDate.getUTCMonth()).toBe(6); // July
      expect(harvestDate.getUTCDate()).toBe(10);
    });

    it('handles long maturity periods', () => {
      const plantedDate = '2026-03-01T00:00:00.000Z';
      const daysToMaturity = 240; // Garlic

      const result = calculateHarvestDate(plantedDate, daysToMaturity);
      const harvestDate = new Date(result);

      expect(harvestDate.getUTCFullYear()).toBe(2026);
      expect(harvestDate.getUTCMonth()).toBe(9); // October
    });

    it('returns ISO 8601 formatted string', () => {
      const plantedDate = '2026-01-01T00:00:00.000Z';
      const result = calculateHarvestDate(plantedDate, 30);

      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/);
    });
  });

  describe('getEffectiveHarvestDate', () => {
    it('returns override date when provided', () => {
      const plantedDate = '2026-01-01T00:00:00.000Z';
      const daysToMaturity = 70;
      const override = '2026-04-15T00:00:00.000Z';

      const result = getEffectiveHarvestDate(plantedDate, daysToMaturity, override);

      expect(result.date).toBe(override);
      expect(result.isOverride).toBe(true);
    });

    it('returns calculated date when override is null', () => {
      const plantedDate = '2026-01-01T00:00:00.000Z';
      const daysToMaturity = 70;

      const result = getEffectiveHarvestDate(plantedDate, daysToMaturity, null);

      expect(result.isOverride).toBe(false);
      expect(new Date(result.date).getUTCMonth()).toBe(2); // March
    });

    it('returns calculated date when override is undefined', () => {
      const plantedDate = '2026-01-01T00:00:00.000Z';
      const daysToMaturity = 70;

      const result = getEffectiveHarvestDate(plantedDate, daysToMaturity, undefined);

      expect(result.isOverride).toBe(false);
    });

    it('returns calculated date when override is empty string', () => {
      const plantedDate = '2026-01-01T00:00:00.000Z';
      const daysToMaturity = 70;

      const result = getEffectiveHarvestDate(plantedDate, daysToMaturity, '');

      expect(result.isOverride).toBe(false);
    });
  });

  describe('formatHarvestDateDisplay', () => {
    it('formats calculated date with Expected prefix', () => {
      // Use a date that won't be affected by timezone conversion
      const result = formatHarvestDateDisplay('2026-03-15T12:00:00.000Z', false);

      expect(result).toMatch(/^Expected:/);
      expect(result).toMatch(/2026/);
    });

    it('formats override date with Harvest prefix and manual indicator', () => {
      const result = formatHarvestDateDisplay('2026-03-15T12:00:00.000Z', true);

      expect(result).toMatch(/^Harvest:/);
      expect(result).toMatch(/\(set manually\)/);
      expect(result).toMatch(/2026/);
    });

    it('formats with month day and year', () => {
      // Just verify the format includes all parts
      const result = formatHarvestDateDisplay('2026-06-15T12:00:00.000Z', false);

      // Check that result has Expected: prefix and year
      expect(result).toMatch(/^Expected:/);
      expect(result).toMatch(/2026/);
      // Contains some month abbreviation and a day number
      expect(result).toMatch(/\w{3}/);
      expect(result).toMatch(/\d+/);
    });
  });

  describe('getDaysUntilHarvest', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('returns positive days for future harvest', () => {
      // Set a specific date/time for the test
      vi.setSystemTime(new Date('2026-01-01T12:00:00.000Z'));
      const harvestDate = '2026-01-15T12:00:00.000Z';

      const result = getDaysUntilHarvest(harvestDate);

      expect(result).toBe(14);
    });

    it('returns zero when harvest is today', () => {
      vi.setSystemTime(new Date('2026-03-15T12:00:00.000Z'));
      const harvestDate = '2026-03-15T12:00:00.000Z';

      const result = getDaysUntilHarvest(harvestDate);

      expect(result).toBe(0);
    });

    it('returns negative days for overdue harvest', () => {
      vi.setSystemTime(new Date('2026-03-20T12:00:00.000Z'));
      const harvestDate = '2026-03-15T12:00:00.000Z';

      const result = getDaysUntilHarvest(harvestDate);

      expect(result).toBe(-5);
    });

    it('handles harvest date tomorrow', () => {
      vi.setSystemTime(new Date('2026-01-01T08:00:00.000Z'));
      const harvestDate = '2026-01-02T08:00:00.000Z';

      const result = getDaysUntilHarvest(harvestDate);

      expect(result).toBe(1);
    });
  });

  describe('shouldRecalculateHarvestDate', () => {
    it('returns true when override is null', () => {
      expect(shouldRecalculateHarvestDate(null)).toBe(true);
    });

    it('returns true when override is undefined', () => {
      expect(shouldRecalculateHarvestDate(undefined)).toBe(true);
    });

    it('returns true when override is empty string', () => {
      expect(shouldRecalculateHarvestDate('')).toBe(true);
    });

    it('returns false when override is set', () => {
      expect(shouldRecalculateHarvestDate('2026-03-15T00:00:00.000Z')).toBe(false);
    });
  });
});
