import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getSettings,
  saveSettings,
  getFrostDates,
  saveFrostDates,
  hasFrostDatesConfigured,
  clearFrostDates
} from './frostDateStorage';

describe('frostDateStorage', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  describe('getSettings', () => {
    it('should return default settings when storage is empty', () => {
      const settings = getSettings();
      expect(settings).toEqual({
        frostDates: {
          lastSpringFrost: null,
          firstFallFrost: null,
          zipCode: null
        }
      });
    });

    it('should return stored settings when available', () => {
      const storedSettings = {
        frostDates: {
          lastSpringFrost: '2024-04-15',
          firstFallFrost: '2024-10-15',
          zipCode: '12345'
        }
      };
      sessionStorage.setItem('square-gardener-settings', JSON.stringify(storedSettings));

      const settings = getSettings();
      expect(settings).toEqual(storedSettings);
    });

    it('should merge stored settings with defaults for partial data', () => {
      const partialSettings = {
        frostDates: {
          lastSpringFrost: '2024-04-15'
        }
      };
      sessionStorage.setItem('square-gardener-settings', JSON.stringify(partialSettings));

      const settings = getSettings();
      expect(settings.frostDates.lastSpringFrost).toBe('2024-04-15');
      expect(settings.frostDates.firstFallFrost).toBe(null);
      expect(settings.frostDates.zipCode).toBe(null);
    });

    it('should handle settings without frostDates property', () => {
      const settingsWithoutFrostDates = { otherSetting: 'value' };
      sessionStorage.setItem('square-gardener-settings', JSON.stringify(settingsWithoutFrostDates));

      const settings = getSettings();
      expect(settings.frostDates).toEqual({
        lastSpringFrost: null,
        firstFallFrost: null,
        zipCode: null
      });
    });

    it('should return default settings on parse error', () => {
      sessionStorage.setItem('square-gardener-settings', 'invalid json');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const settings = getSettings();
      expect(settings).toEqual({
        frostDates: {
          lastSpringFrost: null,
          firstFallFrost: null,
          zipCode: null
        }
      });
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('saveSettings', () => {
    it('should save settings to session storage', () => {
      const settings = {
        frostDates: {
          lastSpringFrost: '2024-04-15',
          firstFallFrost: '2024-10-15',
          zipCode: '12345'
        }
      };

      const result = saveSettings(settings);
      expect(result).toBe(true);

      const stored = JSON.parse(sessionStorage.getItem('square-gardener-settings'));
      expect(stored).toEqual(settings);
    });

    it('should return false on storage error', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Storage full');
      });

      const result = saveSettings({ frostDates: {} });
      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('getFrostDates', () => {
    it('should return frost dates from settings', () => {
      const settings = {
        frostDates: {
          lastSpringFrost: '2024-04-15',
          firstFallFrost: '2024-10-15',
          zipCode: '12345'
        }
      };
      sessionStorage.setItem('square-gardener-settings', JSON.stringify(settings));

      const frostDates = getFrostDates();
      expect(frostDates).toEqual(settings.frostDates);
    });

    it('should return default frost dates when not set', () => {
      const frostDates = getFrostDates();
      expect(frostDates).toEqual({
        lastSpringFrost: null,
        firstFallFrost: null,
        zipCode: null
      });
    });
  });

  describe('saveFrostDates', () => {
    it('should save frost dates to settings', () => {
      const frostDates = {
        lastSpringFrost: '2024-04-15',
        firstFallFrost: '2024-10-15',
        zipCode: '12345'
      };

      const result = saveFrostDates(frostDates);
      expect(result).toBe(true);

      const stored = JSON.parse(sessionStorage.getItem('square-gardener-settings'));
      expect(stored.frostDates).toEqual(frostDates);
    });

    it('should merge with existing frost dates', () => {
      const initialDates = {
        lastSpringFrost: '2024-04-15',
        firstFallFrost: '2024-10-15',
        zipCode: '12345'
      };
      sessionStorage.setItem('square-gardener-settings', JSON.stringify({ frostDates: initialDates }));

      saveFrostDates({ lastSpringFrost: '2024-04-20' });

      const stored = JSON.parse(sessionStorage.getItem('square-gardener-settings'));
      expect(stored.frostDates.lastSpringFrost).toBe('2024-04-20');
      expect(stored.frostDates.firstFallFrost).toBe('2024-10-15');
      expect(stored.frostDates.zipCode).toBe('12345');
    });
  });

  describe('hasFrostDatesConfigured', () => {
    it('should return true when both dates are set', () => {
      saveFrostDates({
        lastSpringFrost: '2024-04-15',
        firstFallFrost: '2024-10-15'
      });

      expect(hasFrostDatesConfigured()).toBe(true);
    });

    it('should return false when only spring date is set', () => {
      saveFrostDates({
        lastSpringFrost: '2024-04-15',
        firstFallFrost: null
      });

      expect(hasFrostDatesConfigured()).toBe(false);
    });

    it('should return false when only fall date is set', () => {
      saveFrostDates({
        lastSpringFrost: null,
        firstFallFrost: '2024-10-15'
      });

      expect(hasFrostDatesConfigured()).toBe(false);
    });

    it('should return false when no dates are set', () => {
      expect(hasFrostDatesConfigured()).toBe(false);
    });
  });

  describe('clearFrostDates', () => {
    it('should clear all frost dates', () => {
      saveFrostDates({
        lastSpringFrost: '2024-04-15',
        firstFallFrost: '2024-10-15',
        zipCode: '12345'
      });

      const result = clearFrostDates();
      expect(result).toBe(true);

      const frostDates = getFrostDates();
      expect(frostDates).toEqual({
        lastSpringFrost: null,
        firstFallFrost: null,
        zipCode: null
      });
    });
  });
});
