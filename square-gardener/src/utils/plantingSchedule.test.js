import { describe, test, expect, vi } from 'vitest';
import {
  addDays,
  subtractDays,
  calculatePlantingWindow,
  generatePlantingSchedule,
  groupScheduleByMonth,
  getMonthLabel,
  formatDate,
  getSeasonColor
} from './plantingSchedule';
import { plantLibrary } from '../data/plantLibrary';
import * as plantLibraryModule from '../data/plantLibrary';

describe('plantingSchedule utilities', () => {
  describe('addDays', () => {
    test('should add days to a date', () => {
      expect(addDays('2026-04-15', 7)).toBe('2026-04-22');
      expect(addDays('2026-04-15', 0)).toBe('2026-04-15');
      expect(addDays('2026-04-15', 30)).toBe('2026-05-15');
    });

    test('should handle month boundaries', () => {
      expect(addDays('2026-04-30', 1)).toBe('2026-05-01');
      expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    });

    test('should handle null date', () => {
      expect(addDays(null, 7)).toBeNull();
      expect(addDays(undefined, 7)).toBeNull();
      expect(addDays('', 7)).toBeNull();
    });
  });

  describe('subtractDays', () => {
    test('should subtract days from a date', () => {
      expect(subtractDays('2026-04-22', 7)).toBe('2026-04-15');
      expect(subtractDays('2026-04-15', 0)).toBe('2026-04-15');
      expect(subtractDays('2026-05-15', 30)).toBe('2026-04-15');
    });

    test('should handle month boundaries', () => {
      expect(subtractDays('2026-05-01', 1)).toBe('2026-04-30');
      expect(subtractDays('2027-01-01', 1)).toBe('2026-12-31');
    });

    test('should handle null date', () => {
      expect(subtractDays(null, 7)).toBeNull();
      expect(subtractDays(undefined, 7)).toBeNull();
      expect(subtractDays('', 7)).toBeNull();
    });
  });

  describe('calculatePlantingWindow', () => {
    const frostDates = {
      lastSpringFrost: '2026-04-15',
      firstFallFrost: '2026-10-15'
    };

    test('should calculate spring planting window', () => {
      const tomato = plantLibrary.find(p => p.id === 'tomato');
      const window = calculatePlantingWindow(tomato, frostDates);

      expect(window).toEqual({
        start: '2026-04-22', // 7 days after last frost
        end: '2026-05-27', // 42 days after last frost
        season: 'spring'
      });
    });

    test('should calculate fall planting window', () => {
      const lettuce = plantLibrary.find(p => p.id === 'lettuce');
      const window = calculatePlantingWindow(lettuce, frostDates);

      // Lettuce has spring and fall seasons, should return spring (first in array)
      expect(window.season).toBe('spring');
    });

    test('should calculate summer planting window', () => {
      const summerPlant = {
        id: 'test-summer',
        name: 'Test Summer Plant',
        plantingSeason: ['summer'],
        daysToMaturity: 60
      };
      const window = calculatePlantingWindow(summerPlant, frostDates);

      expect(window).toEqual({
        start: '2026-06-14', // 60 days after last frost
        end: '2026-08-16', // firstFallFrost - daysToMaturity
        season: 'summer'
      });
    });

    test('should return null if plant has no planting season', () => {
      const noSeasonPlant = {
        id: 'test',
        name: 'Test',
        plantingSeason: [],
        daysToMaturity: 60
      };
      const window = calculatePlantingWindow(noSeasonPlant, frostDates);
      expect(window).toBeNull();
    });

    test('should return null if frost dates are missing', () => {
      const tomato = plantLibrary.find(p => p.id === 'tomato');
      expect(calculatePlantingWindow(tomato, null)).toBeNull();
      expect(calculatePlantingWindow(tomato, {})).toBeNull();
      expect(calculatePlantingWindow(tomato, { lastSpringFrost: '2026-04-15' })).toBeNull();
      expect(calculatePlantingWindow(tomato, { firstFallFrost: '2026-10-15' })).toBeNull();
    });

    test('should return null if plant is null', () => {
      expect(calculatePlantingWindow(null, frostDates)).toBeNull();
      expect(calculatePlantingWindow(undefined, frostDates)).toBeNull();
    });

    test('should handle fall-only plants', () => {
      const fallPlant = {
        id: 'test-fall',
        name: 'Test Fall Plant',
        plantingSeason: ['fall'],
        daysToMaturity: 45
      };
      const window = calculatePlantingWindow(fallPlant, frostDates);

      expect(window.season).toBe('fall');
      // Should plant before first frost minus daysToMaturity minus 14 days
      // End date: 2026-10-15 - 45 - 14 = 2026-08-17
      expect(window.end).toBe('2026-08-17');
      // Start date: end - 21 days = 2026-07-27
      expect(window.start).toBe('2026-07-27');
    });

    test('should use default daysToMaturity if not specified', () => {
      const plantNoMaturity = {
        id: 'test',
        name: 'Test',
        plantingSeason: ['spring']
      };
      const window = calculatePlantingWindow(plantNoMaturity, frostDates);
      expect(window).not.toBeNull();
      expect(window.season).toBe('spring');
    });

    test('should handle plant with no plantingSeason property', () => {
      const plantNoSeason = {
        id: 'test',
        name: 'Test',
        daysToMaturity: 60
      };
      const window = calculatePlantingWindow(plantNoSeason, frostDates);
      expect(window).toBeNull();
    });

    test('should handle plant with undefined plantingSeason', () => {
      const plantUndefinedSeason = {
        id: 'test',
        name: 'Test',
        plantingSeason: undefined,
        daysToMaturity: 60
      };
      const window = calculatePlantingWindow(plantUndefinedSeason, frostDates);
      expect(window).toBeNull();
    });
  });

  describe('generatePlantingSchedule', () => {
    const frostDates = {
      lastSpringFrost: '2026-04-15',
      firstFallFrost: '2026-10-15'
    };

    test('should generate schedule for multiple plants', () => {
      const selections = [
        { plantId: 'tomato', quantity: 4 },
        { plantId: 'basil', quantity: 8 }
      ];

      const schedule = generatePlantingSchedule(selections, frostDates);

      expect(schedule).toHaveLength(2);
      expect(schedule[0].plantId).toBe('tomato');
      expect(schedule[0].plantName).toBe('Tomato');
      expect(schedule[0].plantingWindow).toHaveProperty('start');
      expect(schedule[0].plantingWindow).toHaveProperty('end');
      expect(schedule[0].season).toBe('spring');

      expect(schedule[1].plantId).toBe('basil');
      expect(schedule[1].plantName).toBe('Basil');
    });

    test('should sort schedule by start date', () => {
      const selections = [
        { plantId: 'basil', quantity: 8 },
        { plantId: 'tomato', quantity: 4 }
      ];

      const schedule = generatePlantingSchedule(selections, frostDates);

      // Both are spring plants, should be sorted by start date
      expect(schedule.length).toBeGreaterThan(0);
      for (let i = 1; i < schedule.length; i++) {
        const prevDate = new Date(schedule[i - 1].plantingWindow.start);
        const currDate = new Date(schedule[i].plantingWindow.start);
        expect(prevDate.getTime()).toBeLessThanOrEqual(currDate.getTime());
      }
    });

    test('should skip invalid plant IDs', () => {
      const selections = [
        { plantId: 'tomato', quantity: 4 },
        { plantId: 'invalid-plant', quantity: 2 }
      ];

      const schedule = generatePlantingSchedule(selections, frostDates);

      expect(schedule).toHaveLength(1);
      expect(schedule[0].plantId).toBe('tomato');
    });

    test('should return empty array if frost dates missing', () => {
      const selections = [{ plantId: 'tomato', quantity: 4 }];

      expect(generatePlantingSchedule(selections, null)).toEqual([]);
      expect(generatePlantingSchedule(selections, {})).toEqual([]);
      expect(generatePlantingSchedule(selections, { lastSpringFrost: '2026-04-15' })).toEqual([]);
    });

    test('should return empty array if selections invalid', () => {
      expect(generatePlantingSchedule(null, frostDates)).toEqual([]);
      expect(generatePlantingSchedule(undefined, frostDates)).toEqual([]);
      expect(generatePlantingSchedule('invalid', frostDates)).toEqual([]);
      expect(generatePlantingSchedule([], frostDates)).toEqual([]);
    });

    test('should handle empty selections array', () => {
      const schedule = generatePlantingSchedule([], frostDates);
      expect(schedule).toEqual([]);
    });

    test('should skip plants without planting windows', () => {
      // Spy on getPlantById to return a plant with no valid seasons
      const spy = vi.spyOn(plantLibraryModule, 'getPlantById');
      spy.mockImplementation((id) => {
        if (id === 'no-season-plant') {
          return {
            id: 'no-season-plant',
            name: 'No Season Plant',
            plantingSeason: [], // Empty season array - calculatePlantingWindow returns null
            daysToMaturity: 60
          };
        }
        // Return tomato normally
        return plantLibrary.find(p => p.id === id) || null;
      });

      const selections = [
        { plantId: 'tomato', quantity: 4 },
        { plantId: 'no-season-plant', quantity: 2 }
      ];

      const schedule = generatePlantingSchedule(selections, frostDates);

      // Should only include tomato, not the plant with no seasons
      expect(schedule).toHaveLength(1);
      expect(schedule[0].plantId).toBe('tomato');

      spy.mockRestore();
    });
  });

  describe('groupScheduleByMonth', () => {
    test('should group schedule items by month', () => {
      const schedule = [
        {
          plantId: 'tomato',
          plantName: 'Tomato',
          plantingWindow: { start: '2026-04-22', end: '2026-05-27' },
          season: 'spring'
        },
        {
          plantId: 'basil',
          plantName: 'Basil',
          plantingWindow: { start: '2026-04-22', end: '2026-05-27' },
          season: 'spring'
        },
        {
          plantId: 'lettuce',
          plantName: 'Lettuce',
          plantingWindow: { start: '2026-05-01', end: '2026-06-10' },
          season: 'spring'
        }
      ];

      const grouped = groupScheduleByMonth(schedule);

      expect(grouped['2026-04']).toHaveLength(2);
      expect(grouped['2026-05']).toHaveLength(1);
      expect(grouped['2026-04'][0].plantId).toBe('tomato');
      expect(grouped['2026-04'][1].plantId).toBe('basil');
      expect(grouped['2026-05'][0].plantId).toBe('lettuce');
    });

    test('should handle empty schedule', () => {
      expect(groupScheduleByMonth([])).toEqual({});
    });

    test('should handle null/undefined schedule', () => {
      expect(groupScheduleByMonth(null)).toEqual({});
      expect(groupScheduleByMonth(undefined)).toEqual({});
      expect(groupScheduleByMonth('invalid')).toEqual({});
    });

    test('should handle schedule with single item', () => {
      const schedule = [
        {
          plantId: 'tomato',
          plantName: 'Tomato',
          plantingWindow: { start: '2026-04-22', end: '2026-05-27' },
          season: 'spring'
        }
      ];

      const grouped = groupScheduleByMonth(schedule);
      expect(grouped['2026-04']).toHaveLength(1);
      expect(Object.keys(grouped)).toHaveLength(1);
    });
  });

  describe('getMonthLabel', () => {
    test('should format month label', () => {
      expect(getMonthLabel('2026-04')).toBe('April 2026');
      expect(getMonthLabel('2026-12')).toBe('December 2026');
      expect(getMonthLabel('2027-01')).toBe('January 2027');
    });

    test('should handle null/empty input', () => {
      expect(getMonthLabel(null)).toBe('');
      expect(getMonthLabel(undefined)).toBe('');
      expect(getMonthLabel('')).toBe('');
    });
  });

  describe('formatDate', () => {
    test('should format date for display', () => {
      expect(formatDate('2026-04-22')).toBe('Apr 22');
      expect(formatDate('2026-12-25')).toBe('Dec 25');
      expect(formatDate('2027-01-01')).toBe('Jan 1');
    });

    test('should handle null/empty input', () => {
      expect(formatDate(null)).toBe('');
      expect(formatDate(undefined)).toBe('');
      expect(formatDate('')).toBe('');
    });
  });

  describe('getSeasonColor', () => {
    test('should return correct color classes for seasons', () => {
      expect(getSeasonColor('spring')).toBe('text-green-600 bg-green-50 border-green-200');
      expect(getSeasonColor('summer')).toBe('text-amber-600 bg-amber-50 border-amber-200');
      expect(getSeasonColor('fall')).toBe('text-orange-600 bg-orange-50 border-orange-200');
    });

    test('should return default color for unknown season', () => {
      expect(getSeasonColor('winter')).toBe('text-gray-600 bg-gray-50 border-gray-200');
      expect(getSeasonColor(null)).toBe('text-gray-600 bg-gray-50 border-gray-200');
      expect(getSeasonColor(undefined)).toBe('text-gray-600 bg-gray-50 border-gray-200');
      expect(getSeasonColor('')).toBe('text-gray-600 bg-gray-50 border-gray-200');
    });
  });
});
