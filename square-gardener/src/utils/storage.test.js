import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getGardenPlants,
  saveGardenPlants,
  addGardenPlant,
  removeGardenPlant,
  updateGardenPlant,
  waterPlant,
  getGardenBeds,
  saveGardenBeds,
  clearAllData
} from './storage';

describe('storage utilities', () => {
  beforeEach(() => {
    // Clear sessionStorage before each test
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  describe('getGardenPlants', () => {
    it('returns empty array when no plants stored', () => {
      expect(getGardenPlants()).toEqual([]);
    });

    it('returns stored plants', () => {
      const plants = [{ id: 'test-1', plantId: 'tomato' }];
      sessionStorage.setItem('square-gardener-plants', JSON.stringify(plants));
      expect(getGardenPlants()).toEqual(plants);
    });

    it('returns empty array on JSON parse error', () => {
      sessionStorage.setItem('square-gardener-plants', 'invalid-json');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      expect(getGardenPlants()).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('saveGardenPlants', () => {
    it('saves plants to storage', () => {
      const plants = [{ id: 'test-1', plantId: 'tomato' }];
      const result = saveGardenPlants(plants);
      expect(result).toBe(true);
      expect(JSON.parse(sessionStorage.getItem('square-gardener-plants'))).toEqual(plants);
    });

    it('returns false on storage error', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      // Create an object that throws when serialized
      const circularObj = {};
      circularObj.self = circularObj;

      const result = saveGardenPlants(circularObj);
      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('addGardenPlant', () => {
    it('adds a new plant with default date', () => {
      const result = addGardenPlant('tomato');
      expect(result.plantId).toBe('tomato');
      expect(result.id).toMatch(/^garden-/);
      expect(result.notes).toBe('');
      expect(getGardenPlants()).toHaveLength(1);
    });

    it('adds a new plant with custom date', () => {
      const customDate = '2024-01-15T00:00:00.000Z';
      const result = addGardenPlant('lettuce', customDate);
      expect(result.plantId).toBe('lettuce');
      expect(result.plantedDate).toBe(customDate);
      expect(result.lastWatered).toBe(customDate);
    });

    it('adds multiple plants to existing list', () => {
      addGardenPlant('tomato');
      addGardenPlant('lettuce');
      addGardenPlant('carrot');
      expect(getGardenPlants()).toHaveLength(3);
    });
  });

  describe('removeGardenPlant', () => {
    it('removes a plant by id', () => {
      const plant = addGardenPlant('tomato');
      addGardenPlant('lettuce');

      const result = removeGardenPlant(plant.id);
      expect(result).toHaveLength(1);
      expect(result[0].plantId).toBe('lettuce');
    });

    it('returns empty array when removing only plant', () => {
      const plant = addGardenPlant('tomato');
      const result = removeGardenPlant(plant.id);
      expect(result).toEqual([]);
    });

    it('does not remove anything if id not found', () => {
      addGardenPlant('tomato');
      const result = removeGardenPlant('non-existent-id');
      expect(result).toHaveLength(1);
    });
  });

  describe('updateGardenPlant', () => {
    it('updates plant properties', () => {
      const plant = addGardenPlant('tomato');
      const result = updateGardenPlant(plant.id, { notes: 'Updated note' });
      expect(result.notes).toBe('Updated note');
      expect(result.plantId).toBe('tomato');
    });

    it('returns null if plant not found', () => {
      addGardenPlant('tomato');
      const result = updateGardenPlant('non-existent-id', { notes: 'Test' });
      expect(result).toBeNull();
    });

    it('preserves other properties when updating', () => {
      const plant = addGardenPlant('tomato');
      updateGardenPlant(plant.id, { notes: 'New note' });
      const plants = getGardenPlants();
      expect(plants[0].plantId).toBe('tomato');
      expect(plants[0].id).toBe(plant.id);
    });
  });

  describe('waterPlant', () => {
    it('updates lastWatered timestamp', () => {
      const plant = addGardenPlant('tomato', '2024-01-01T00:00:00.000Z');
      const beforeWater = new Date(plant.lastWatered).getTime();

      // Wait a tiny bit to ensure time difference
      const result = waterPlant(plant.id);
      const afterWater = new Date(result.lastWatered).getTime();

      expect(afterWater).toBeGreaterThanOrEqual(beforeWater);
    });

    it('returns null if plant not found', () => {
      const result = waterPlant('non-existent-id');
      expect(result).toBeNull();
    });
  });

  describe('getGardenBeds', () => {
    it('returns empty array when no beds stored', () => {
      expect(getGardenBeds()).toEqual([]);
    });

    it('returns stored beds', () => {
      const beds = [{ id: 'bed-1', name: 'Main Bed' }];
      sessionStorage.setItem('square-gardener-beds', JSON.stringify(beds));
      expect(getGardenBeds()).toEqual(beds);
    });

    it('returns empty array on JSON parse error', () => {
      sessionStorage.setItem('square-gardener-beds', 'invalid-json');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      expect(getGardenBeds()).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('saveGardenBeds', () => {
    it('saves beds to storage', () => {
      const beds = [{ id: 'bed-1', name: 'Main Bed' }];
      const result = saveGardenBeds(beds);
      expect(result).toBe(true);
      expect(JSON.parse(sessionStorage.getItem('square-gardener-beds'))).toEqual(beds);
    });

    it('returns false on storage error', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      // Create an object that throws when serialized
      const circularObj = {};
      circularObj.self = circularObj;

      const result = saveGardenBeds(circularObj);
      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('clearAllData', () => {
    it('clears all stored data', () => {
      addGardenPlant('tomato');
      saveGardenBeds([{ id: 'bed-1' }]);

      clearAllData();

      expect(getGardenPlants()).toEqual([]);
      expect(getGardenBeds()).toEqual([]);
    });
  });
});
