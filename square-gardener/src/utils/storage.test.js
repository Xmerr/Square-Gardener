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
  addGardenBed,
  getBedById,
  updateGardenBed,
  removeGardenBed,
  reorderBeds,
  getPlantsByBed,
  getBedCapacity,
  reassignPlant,
  bulkReassignPlants,
  clearAllData,
  getGardenDefaults,
  saveGardenDefaults,
  getPlantDefaults,
  setPlantDefaults,
  updatePlantDefaults,
  deletePlantDefaults,
  resolveEffectiveValue,
  resolveAllEffectiveValues,
  POT_SIZES,
  getPotCapacity
} from './storage';

vi.mock('../data/plantLibrary', () => ({
  getPlantById: vi.fn((id) => {
    const plants = {
      'tomato': { id: 'tomato', squaresPerPlant: 1, daysToMaturity: 70 },
      'lettuce': { id: 'lettuce', squaresPerPlant: 0.25, daysToMaturity: 45 },
      'carrot': { id: 'carrot', squaresPerPlant: 0.0625, daysToMaturity: 70 }
    };
    return plants[id] || null;
  })
}));

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
    it('adds a new plant with bedId and default values', () => {
      const result = addGardenPlant('tomato', 'bed-1');
      expect(result.plantId).toBe('tomato');
      expect(result.bedId).toBe('bed-1');
      expect(result.quantity).toBe(1);
      expect(result.id).toMatch(/^garden-/);
      expect(result.notes).toBe('');
      expect(getGardenPlants()).toHaveLength(1);
    });

    it('adds a new plant with custom quantity', () => {
      const result = addGardenPlant('lettuce', 'bed-1', 4);
      expect(result.plantId).toBe('lettuce');
      expect(result.bedId).toBe('bed-1');
      expect(result.quantity).toBe(4);
    });

    it('adds a new plant with custom date', () => {
      const customDate = '2024-01-15T00:00:00.000Z';
      const result = addGardenPlant('lettuce', 'bed-1', 1, customDate);
      expect(result.plantId).toBe('lettuce');
      expect(result.plantedDate).toBe(customDate);
      expect(result.lastWatered).toBe(customDate);
    });

    it('adds multiple plants to existing list', () => {
      addGardenPlant('tomato', 'bed-1');
      addGardenPlant('lettuce', 'bed-1');
      addGardenPlant('carrot', 'bed-2');
      expect(getGardenPlants()).toHaveLength(3);
    });

    it('adds a new plant with null variety by default', () => {
      const result = addGardenPlant('tomato', 'bed-1');
      expect(result.variety).toBeNull();
    });

    it('adds a new plant with custom variety', () => {
      const result = addGardenPlant('tomato', 'bed-1', 1, new Date().toISOString(), 'Cherokee Purple');
      expect(result.variety).toBe('Cherokee Purple');
    });

    it('persists variety field in storage', () => {
      addGardenPlant('tomato', 'bed-1', 1, new Date().toISOString(), 'Brandywine');
      const plants = getGardenPlants();
      expect(plants[0].variety).toBe('Brandywine');
    });

    it('adds a new plant with null harvestDateOverride by default', () => {
      const result = addGardenPlant('tomato', 'bed-1');
      expect(result.harvestDateOverride).toBeNull();
    });

    it('adds a new plant with custom harvestDateOverride', () => {
      const overrideDate = '2026-04-15T00:00:00.000Z';
      const result = addGardenPlant('tomato', 'bed-1', 1, new Date().toISOString(), null, overrideDate);
      expect(result.harvestDateOverride).toBe(overrideDate);
    });

    it('persists harvestDateOverride field in storage', () => {
      const overrideDate = '2026-05-01T00:00:00.000Z';
      addGardenPlant('tomato', 'bed-1', 1, new Date().toISOString(), 'Cherokee Purple', overrideDate);
      const plants = getGardenPlants();
      expect(plants[0].harvestDateOverride).toBe(overrideDate);
    });

    it('allows setting harvestDateOverride with variety', () => {
      const overrideDate = '2026-06-15T00:00:00.000Z';
      const result = addGardenPlant('tomato', 'bed-1', 2, '2026-03-01T00:00:00.000Z', 'Roma', overrideDate);
      expect(result.variety).toBe('Roma');
      expect(result.harvestDateOverride).toBe(overrideDate);
      expect(result.quantity).toBe(2);
    });
  });

  describe('removeGardenPlant', () => {
    it('removes a plant by id', () => {
      const plant = addGardenPlant('tomato', 'bed-1');
      addGardenPlant('lettuce', 'bed-1');

      const result = removeGardenPlant(plant.id);
      expect(result).toHaveLength(1);
      expect(result[0].plantId).toBe('lettuce');
    });

    it('returns empty array when removing only plant', () => {
      const plant = addGardenPlant('tomato', 'bed-1');
      const result = removeGardenPlant(plant.id);
      expect(result).toEqual([]);
    });

    it('does not remove anything if id not found', () => {
      addGardenPlant('tomato', 'bed-1');
      const result = removeGardenPlant('non-existent-id');
      expect(result).toHaveLength(1);
    });
  });

  describe('updateGardenPlant', () => {
    it('updates plant properties', () => {
      const plant = addGardenPlant('tomato', 'bed-1');
      const result = updateGardenPlant(plant.id, { notes: 'Updated note' });
      expect(result.notes).toBe('Updated note');
      expect(result.plantId).toBe('tomato');
    });

    it('returns null if plant not found', () => {
      addGardenPlant('tomato', 'bed-1');
      const result = updateGardenPlant('non-existent-id', { notes: 'Test' });
      expect(result).toBeNull();
    });

    it('preserves other properties when updating', () => {
      const plant = addGardenPlant('tomato', 'bed-1');
      updateGardenPlant(plant.id, { notes: 'New note' });
      const plants = getGardenPlants();
      expect(plants[0].plantId).toBe('tomato');
      expect(plants[0].id).toBe(plant.id);
    });
  });

  describe('waterPlant', () => {
    it('updates lastWatered timestamp', () => {
      const plant = addGardenPlant('tomato', 'bed-1', 1, '2024-01-01T00:00:00.000Z');
      const beforeWater = new Date(plant.lastWatered).getTime();

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

    it('returns stored beds with is_pot field', () => {
      const beds = [{ id: 'bed-1', name: 'Main Bed', is_pot: false }];
      sessionStorage.setItem('square-gardener-beds', JSON.stringify(beds));
      expect(getGardenBeds()).toEqual(beds);
    });

    it('returns empty array on JSON parse error', () => {
      sessionStorage.setItem('square-gardener-beds', 'invalid-json');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      expect(getGardenBeds()).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('migrates beds without is_pot field to have is_pot = false', () => {
      const oldBeds = [
        { id: 'bed-1', name: 'Old Bed', width: 4, height: 4 }
      ];
      sessionStorage.setItem('square-gardener-beds', JSON.stringify(oldBeds));

      const result = getGardenBeds();
      expect(result[0].is_pot).toBe(false);
    });

    it('migrates multiple beds without is_pot field', () => {
      const oldBeds = [
        { id: 'bed-1', name: 'Old Bed 1', width: 4, height: 4 },
        { id: 'bed-2', name: 'Old Bed 2', width: 2, height: 2 }
      ];
      sessionStorage.setItem('square-gardener-beds', JSON.stringify(oldBeds));

      const result = getGardenBeds();
      expect(result[0].is_pot).toBe(false);
      expect(result[1].is_pot).toBe(false);
    });

    it('persists migration to storage', () => {
      const oldBeds = [
        { id: 'bed-1', name: 'Old Bed', width: 4, height: 4 }
      ];
      sessionStorage.setItem('square-gardener-beds', JSON.stringify(oldBeds));

      getGardenBeds(); // Triggers migration

      const stored = JSON.parse(sessionStorage.getItem('square-gardener-beds'));
      expect(stored[0].is_pot).toBe(false);
    });

    it('does not migrate beds that already have is_pot', () => {
      const beds = [
        { id: 'bed-1', name: 'Bed', width: 4, height: 4, is_pot: false },
        { id: 'pot-1', name: 'Pot', size: 'medium', is_pot: true }
      ];
      sessionStorage.setItem('square-gardener-beds', JSON.stringify(beds));

      const result = getGardenBeds();
      expect(result[0].is_pot).toBe(false);
      expect(result[1].is_pot).toBe(true);
    });

    it('handles mixed migrated and non-migrated beds', () => {
      const beds = [
        { id: 'bed-1', name: 'Old Bed', width: 4, height: 4 },
        { id: 'bed-2', name: 'New Bed', width: 2, height: 2, is_pot: false }
      ];
      sessionStorage.setItem('square-gardener-beds', JSON.stringify(beds));

      const result = getGardenBeds();
      expect(result[0].is_pot).toBe(false);
      expect(result[1].is_pot).toBe(false);
    });

    it('migrates beds with is_pot set to null', () => {
      const beds = [
        { id: 'bed-1', name: 'Null Bed', width: 4, height: 4, is_pot: null }
      ];
      sessionStorage.setItem('square-gardener-beds', JSON.stringify(beds));

      const result = getGardenBeds();
      expect(result[0].is_pot).toBe(false);
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
      addGardenPlant('tomato', 'bed-1');
      saveGardenBeds([{ id: 'bed-1' }]);
      setPlantDefaults('tomato', { daysToMaturity: 80 });

      clearAllData();

      expect(getGardenPlants()).toEqual([]);
      expect(getGardenBeds()).toEqual([]);
      expect(getGardenDefaults()).toEqual({});
    });
  });

  describe('POT_SIZES', () => {
    it('defines small pot size correctly', () => {
      expect(POT_SIZES.small).toEqual({
        label: 'Small (4-6 inch)',
        capacity: 0.25,
        diameter: '4-6 inches'
      });
    });

    it('defines medium pot size correctly', () => {
      expect(POT_SIZES.medium).toEqual({
        label: 'Medium (8-10 inch)',
        capacity: 0.56,
        diameter: '8-10 inches'
      });
    });

    it('defines large pot size correctly', () => {
      expect(POT_SIZES.large).toEqual({
        label: 'Large (12-14 inch)',
        capacity: 1.0,
        diameter: '12-14 inches'
      });
    });

    it('defines extra_large pot size correctly', () => {
      expect(POT_SIZES.extra_large).toEqual({
        label: 'Extra Large (16+ inch)',
        capacity: 2.25,
        diameter: '16+ inches'
      });
    });
  });

  describe('getPotCapacity', () => {
    it('returns correct capacity for small pot', () => {
      expect(getPotCapacity('small')).toBe(0.25);
    });

    it('returns correct capacity for medium pot', () => {
      expect(getPotCapacity('medium')).toBe(0.56);
    });

    it('returns correct capacity for large pot', () => {
      expect(getPotCapacity('large')).toBe(1.0);
    });

    it('returns correct capacity for extra_large pot', () => {
      expect(getPotCapacity('extra_large')).toBe(2.25);
    });

    it('returns 0 for invalid size', () => {
      expect(getPotCapacity('invalid')).toBe(0);
    });

    it('returns 0 for undefined size', () => {
      expect(getPotCapacity(undefined)).toBe(0);
    });

    it('returns 0 for null size', () => {
      expect(getPotCapacity(null)).toBe(0);
    });
  });

  describe('addGardenBed', () => {
    it('creates bed with correct schema including is_pot', () => {
      const result = addGardenBed('Main Garden', 4, 4);
      expect(result.id).toMatch(/^bed-/);
      expect(result.name).toBe('Main Garden');
      expect(result.is_pot).toBe(false);
      expect(result.width).toBe(4);
      expect(result.height).toBe(4);
      expect(result.order).toBe(0);
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
    });

    it('assigns sequential order to beds', () => {
      const bed1 = addGardenBed('Bed 1', 4, 4);
      const bed2 = addGardenBed('Bed 2', 2, 4);
      const bed3 = addGardenBed('Bed 3', 3, 3);

      expect(bed1.order).toBe(0);
      expect(bed2.order).toBe(1);
      expect(bed3.order).toBe(2);
      expect(getGardenBeds()).toHaveLength(3);
    });

    it('creates pot with is_pot true and size', () => {
      const result = addGardenBed('Kitchen Aloe', null, null, { is_pot: true, size: 'medium' });
      expect(result.id).toMatch(/^bed-/);
      expect(result.name).toBe('Kitchen Aloe');
      expect(result.is_pot).toBe(true);
      expect(result.size).toBe('medium');
      expect(result.width).toBeUndefined();
      expect(result.height).toBeUndefined();
      expect(result.order).toBe(0);
    });

    it('creates pot with default medium size when no size specified', () => {
      const result = addGardenBed('My Pot', null, null, { is_pot: true });
      expect(result.is_pot).toBe(true);
      expect(result.size).toBe('medium');
    });

    it('creates pot with small size', () => {
      const result = addGardenBed('Small Pot', null, null, { is_pot: true, size: 'small' });
      expect(result.size).toBe('small');
    });

    it('creates pot with large size', () => {
      const result = addGardenBed('Large Pot', null, null, { is_pot: true, size: 'large' });
      expect(result.size).toBe('large');
    });

    it('creates pot with extra_large size', () => {
      const result = addGardenBed('Extra Large Pot', null, null, { is_pot: true, size: 'extra_large' });
      expect(result.size).toBe('extra_large');
    });

    it('does not include size for beds', () => {
      const result = addGardenBed('Main Bed', 4, 4, { is_pot: false });
      expect(result.is_pot).toBe(false);
      expect(result.width).toBe(4);
      expect(result.height).toBe(4);
      expect(result.size).toBeUndefined();
    });

    it('treats missing is_pot option as false', () => {
      const result = addGardenBed('Default Bed', 4, 4, {});
      expect(result.is_pot).toBe(false);
      expect(result.width).toBe(4);
      expect(result.height).toBe(4);
    });

    it('assigns sequential order to mixed beds and pots', () => {
      const bed1 = addGardenBed('Bed 1', 4, 4);
      const pot1 = addGardenBed('Pot 1', null, null, { is_pot: true, size: 'small' });
      const bed2 = addGardenBed('Bed 2', 2, 4);

      expect(bed1.order).toBe(0);
      expect(pot1.order).toBe(1);
      expect(bed2.order).toBe(2);
      expect(getGardenBeds()).toHaveLength(3);
    });
  });

  describe('getBedById', () => {
    it('returns correct bed', () => {
      const bed = addGardenBed('Test Bed', 4, 4);
      const result = getBedById(bed.id);
      expect(result.name).toBe('Test Bed');
    });

    it('returns null for non-existent bed', () => {
      addGardenBed('Test Bed', 4, 4);
      const result = getBedById('non-existent-id');
      expect(result).toBeNull();
    });
  });

  describe('updateGardenBed', () => {
    it('modifies bed properties', () => {
      const bed = addGardenBed('Original Name', 4, 4);
      const result = updateGardenBed(bed.id, { name: 'Updated Name', width: 6 });

      expect(result.name).toBe('Updated Name');
      expect(result.width).toBe(6);
      expect(result.height).toBe(4);
    });

    it('updates updatedAt timestamp', () => {
      const bed = addGardenBed('Test Bed', 4, 4);
      const originalUpdatedAt = bed.updatedAt;

      const result = updateGardenBed(bed.id, { name: 'New Name' });
      expect(new Date(result.updatedAt).getTime()).toBeGreaterThanOrEqual(
        new Date(originalUpdatedAt).getTime()
      );
    });

    it('returns null for non-existent bed', () => {
      addGardenBed('Test Bed', 4, 4);
      const result = updateGardenBed('non-existent-id', { name: 'New Name' });
      expect(result).toBeNull();
    });
  });

  describe('removeGardenBed', () => {
    it('deletes bed when no plants exist', () => {
      const bed = addGardenBed('Test Bed', 4, 4);
      const result = removeGardenBed(bed.id);

      expect(result).toBe(true);
      expect(getGardenBeds()).toHaveLength(0);
    });

    it('deletes bed when not the last and plants exist', () => {
      const bed1 = addGardenBed('Bed 1', 4, 4);
      addGardenBed('Bed 2', 4, 4);
      addGardenPlant('tomato', bed1.id);

      const result = removeGardenBed(bed1.id);
      expect(result).toBe(true);
      expect(getGardenBeds()).toHaveLength(1);
    });

    it('prevents deletion if last bed with plants', () => {
      const bed = addGardenBed('Only Bed', 4, 4);
      addGardenPlant('tomato', bed.id);

      const result = removeGardenBed(bed.id);
      expect(result).toBe(false);
      expect(getGardenBeds()).toHaveLength(1);
    });
  });

  describe('reorderBeds', () => {
    it('updates order array', () => {
      const bed1 = addGardenBed('Bed 1', 4, 4);
      const bed2 = addGardenBed('Bed 2', 4, 4);
      const bed3 = addGardenBed('Bed 3', 4, 4);

      const result = reorderBeds([bed3.id, bed1.id, bed2.id]);

      expect(result[0].id).toBe(bed3.id);
      expect(result[0].order).toBe(0);
      expect(result[1].id).toBe(bed1.id);
      expect(result[1].order).toBe(1);
      expect(result[2].id).toBe(bed2.id);
      expect(result[2].order).toBe(2);
    });

    it('filters out invalid bed ids', () => {
      const bed1 = addGardenBed('Bed 1', 4, 4);
      addGardenBed('Bed 2', 4, 4);

      const result = reorderBeds([bed1.id, 'invalid-id']);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(bed1.id);
    });
  });

  describe('getPlantsByBed', () => {
    it('returns plants for specific bed', () => {
      const bed1 = addGardenBed('Bed 1', 4, 4);
      const bed2 = addGardenBed('Bed 2', 4, 4);

      addGardenPlant('tomato', bed1.id);
      addGardenPlant('lettuce', bed1.id);
      addGardenPlant('carrot', bed2.id);

      const result = getPlantsByBed(bed1.id);
      expect(result).toHaveLength(2);
      expect(result[0].plantId).toBe('tomato');
      expect(result[1].plantId).toBe('lettuce');
    });

    it('returns empty array for bed with no plants', () => {
      const bed = addGardenBed('Empty Bed', 4, 4);
      const result = getPlantsByBed(bed.id);
      expect(result).toEqual([]);
    });
  });

  describe('getBedCapacity', () => {
    it('calculates total capacity correctly', () => {
      const bed = addGardenBed('Test Bed', 4, 4);
      const result = getBedCapacity(bed.id);
      expect(result.total).toBe(16);
    });

    it('calculates used capacity with 1/sq ft plants', () => {
      const bed = addGardenBed('Test Bed', 4, 4);
      addGardenPlant('tomato', bed.id, 4);

      const result = getBedCapacity(bed.id);
      expect(result.used).toBe(4);
      expect(result.available).toBe(12);
    });

    it('calculates used capacity with 4/sq ft plants', () => {
      const bed = addGardenBed('Test Bed', 4, 4);
      addGardenPlant('lettuce', bed.id, 8);

      const result = getBedCapacity(bed.id);
      expect(result.used).toBe(2);
      expect(result.available).toBe(14);
    });

    it('calculates used capacity with 16/sq ft plants', () => {
      const bed = addGardenBed('Test Bed', 4, 4);
      addGardenPlant('carrot', bed.id, 16);

      const result = getBedCapacity(bed.id);
      expect(result.used).toBe(1);
      expect(result.available).toBe(15);
    });

    it('handles mixed plant sizes', () => {
      const bed = addGardenBed('Test Bed', 4, 4);
      addGardenPlant('tomato', bed.id, 4);
      addGardenPlant('lettuce', bed.id, 8);
      addGardenPlant('carrot', bed.id, 16);

      const result = getBedCapacity(bed.id);
      expect(result.used).toBe(7);
      expect(result.available).toBe(9);
    });

    it('identifies overcapacity correctly', () => {
      const bed = addGardenBed('Small Bed', 2, 2);
      addGardenPlant('tomato', bed.id, 5);

      const result = getBedCapacity(bed.id);
      expect(result.total).toBe(4);
      expect(result.used).toBe(5);
      expect(result.available).toBe(-1);
      expect(result.isOvercapacity).toBe(true);
    });

    it('handles empty bed', () => {
      const bed = addGardenBed('Empty Bed', 4, 4);
      const result = getBedCapacity(bed.id);

      expect(result.total).toBe(16);
      expect(result.used).toBe(0);
      expect(result.available).toBe(16);
      expect(result.isOvercapacity).toBe(false);
    });

    it('handles fractional dimensions', () => {
      const bed = addGardenBed('Fractional Bed', 3.5, 4);
      const result = getBedCapacity(bed.id);
      expect(result.total).toBe(14);
    });

    it('returns zeros for non-existent bed', () => {
      const result = getBedCapacity('non-existent-id');
      expect(result).toEqual({ total: 0, used: 0, available: 0, isOvercapacity: false });
    });

    it('handles plants with missing plantId in library', () => {
      const bed = addGardenBed('Test Bed', 4, 4);
      addGardenPlant('unknown-plant', bed.id, 2);

      const result = getBedCapacity(bed.id);
      expect(result.used).toBe(0);
    });

    it('handles plants without quantity field', () => {
      const bed = addGardenBed('Test Bed', 4, 4);
      const plants = getGardenPlants();
      plants.push({ id: 'garden-1', plantId: 'tomato', bedId: bed.id });
      saveGardenPlants(plants);

      const result = getBedCapacity(bed.id);
      expect(result.used).toBe(1);
    });

    it('calculates capacity for small pot', () => {
      const pot = addGardenBed('Small Pot', null, null, { is_pot: true, size: 'small' });
      const result = getBedCapacity(pot.id);
      // 0.25 rounded to 1 decimal place = 0.3 (Math.round(2.5) = 3 in JS)
      expect(result.total).toBe(0.3);
    });

    it('calculates capacity for medium pot', () => {
      const pot = addGardenBed('Medium Pot', null, null, { is_pot: true, size: 'medium' });
      const result = getBedCapacity(pot.id);
      // 0.56 rounded to 1 decimal place = 0.6
      expect(result.total).toBe(0.6);
    });

    it('calculates capacity for large pot', () => {
      const pot = addGardenBed('Large Pot', null, null, { is_pot: true, size: 'large' });
      const result = getBedCapacity(pot.id);
      expect(result.total).toBe(1);
    });

    it('calculates capacity for extra_large pot', () => {
      const pot = addGardenBed('Extra Large Pot', null, null, { is_pot: true, size: 'extra_large' });
      const result = getBedCapacity(pot.id);
      // 2.25 rounded to 1 decimal place = 2.3
      expect(result.total).toBe(2.3);
    });

    it('calculates used capacity in pot', () => {
      const pot = addGardenBed('Medium Pot', null, null, { is_pot: true, size: 'medium' });
      addGardenPlant('lettuce', pot.id, 2); // 2 * 0.25 = 0.5 sq ft

      const result = getBedCapacity(pot.id);
      // 0.56 rounded to 1 decimal place = 0.6
      expect(result.total).toBe(0.6);
      expect(result.used).toBe(0.5);
      expect(result.available).toBe(0.1); // 0.56 - 0.5 = 0.06 rounded to 0.1
    });

    it('identifies overcapacity in pot', () => {
      const pot = addGardenBed('Small Pot', null, null, { is_pot: true, size: 'small' });
      addGardenPlant('tomato', pot.id, 2); // 2 * 1 = 2 sq ft

      const result = getBedCapacity(pot.id);
      // 0.25 rounded to 1 decimal place = 0.3
      expect(result.total).toBe(0.3);
      expect(result.used).toBe(2);
      expect(result.isOvercapacity).toBe(true);
    });
  });

  describe('reassignPlant', () => {
    it('moves plant to new bed', () => {
      const bed1 = addGardenBed('Bed 1', 4, 4);
      const bed2 = addGardenBed('Bed 2', 4, 4);
      const plant = addGardenPlant('tomato', bed1.id);

      const result = reassignPlant(plant.id, bed2.id);
      expect(result.bedId).toBe(bed2.id);

      const plantsInBed1 = getPlantsByBed(bed1.id);
      const plantsInBed2 = getPlantsByBed(bed2.id);
      expect(plantsInBed1).toHaveLength(0);
      expect(plantsInBed2).toHaveLength(1);
    });

    it('returns null for non-existent bed', () => {
      const bed = addGardenBed('Bed 1', 4, 4);
      const plant = addGardenPlant('tomato', bed.id);

      const result = reassignPlant(plant.id, 'non-existent-bed');
      expect(result).toBeNull();
    });
  });

  describe('bulkReassignPlants', () => {
    it('moves multiple plants', () => {
      const bed1 = addGardenBed('Bed 1', 4, 4);
      const bed2 = addGardenBed('Bed 2', 4, 4);
      const plant1 = addGardenPlant('tomato', bed1.id);
      const plant2 = addGardenPlant('lettuce', bed1.id);
      addGardenPlant('carrot', bed1.id);

      const result = bulkReassignPlants([plant1.id, plant2.id], bed2.id);

      expect(result).toHaveLength(2);
      expect(result[0].bedId).toBe(bed2.id);
      expect(result[1].bedId).toBe(bed2.id);

      const plantsInBed1 = getPlantsByBed(bed1.id);
      const plantsInBed2 = getPlantsByBed(bed2.id);
      expect(plantsInBed1).toHaveLength(1);
      expect(plantsInBed2).toHaveLength(2);
    });

    it('returns empty array for non-existent bed', () => {
      const bed = addGardenBed('Bed 1', 4, 4);
      const plant = addGardenPlant('tomato', bed.id);

      const result = bulkReassignPlants([plant.id], 'non-existent-bed');
      expect(result).toEqual([]);
    });
  });

  // ============================================================
  // Garden Defaults Tests
  // ============================================================

  describe('getGardenDefaults', () => {
    it('returns empty object when no defaults stored', () => {
      expect(getGardenDefaults()).toEqual({});
    });

    it('returns stored defaults', () => {
      const defaults = {
        tomato: { daysToMaturity: 80, squaresPerPlant: 2 }
      };
      sessionStorage.setItem('square-gardener-garden-defaults', JSON.stringify(defaults));
      expect(getGardenDefaults()).toEqual(defaults);
    });

    it('returns empty object on JSON parse error', () => {
      sessionStorage.setItem('square-gardener-garden-defaults', 'invalid-json');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      expect(getGardenDefaults()).toEqual({});
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('saveGardenDefaults', () => {
    it('saves defaults to storage', () => {
      const defaults = {
        tomato: { daysToMaturity: 80, squaresPerPlant: null }
      };
      const result = saveGardenDefaults(defaults);
      expect(result).toBe(true);
      expect(JSON.parse(sessionStorage.getItem('square-gardener-garden-defaults'))).toEqual(defaults);
    });

    it('returns false on storage error', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const circularObj = {};
      circularObj.self = circularObj;

      const result = saveGardenDefaults(circularObj);
      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('getPlantDefaults', () => {
    it('returns null for non-existent plant defaults', () => {
      expect(getPlantDefaults('tomato')).toBeNull();
    });

    it('returns defaults for a specific plant', () => {
      const defaults = {
        tomato: { daysToMaturity: 80, squaresPerPlant: 2 },
        lettuce: { daysToMaturity: 30, squaresPerPlant: 0.5 }
      };
      saveGardenDefaults(defaults);

      expect(getPlantDefaults('tomato')).toEqual({ daysToMaturity: 80, squaresPerPlant: 2 });
      expect(getPlantDefaults('lettuce')).toEqual({ daysToMaturity: 30, squaresPerPlant: 0.5 });
    });

    it('returns null for plant not in defaults', () => {
      setPlantDefaults('tomato', { daysToMaturity: 80 });
      expect(getPlantDefaults('carrot')).toBeNull();
    });
  });

  describe('setPlantDefaults', () => {
    it('creates new defaults for a plant', () => {
      const result = setPlantDefaults('tomato', { daysToMaturity: 80, squaresPerPlant: 2 });

      expect(result).toEqual({ daysToMaturity: 80, squaresPerPlant: 2 });
      expect(getPlantDefaults('tomato')).toEqual({ daysToMaturity: 80, squaresPerPlant: 2 });
    });

    it('replaces existing defaults completely', () => {
      setPlantDefaults('tomato', { daysToMaturity: 80, squaresPerPlant: 2 });
      const result = setPlantDefaults('tomato', { daysToMaturity: 90 });

      expect(result).toEqual({ daysToMaturity: 90, squaresPerPlant: null });
    });

    it('sets null for missing properties', () => {
      const result = setPlantDefaults('tomato', {});
      expect(result).toEqual({ daysToMaturity: null, squaresPerPlant: null });
    });

    it('handles undefined values as null', () => {
      const result = setPlantDefaults('tomato', { daysToMaturity: undefined, squaresPerPlant: undefined });
      expect(result).toEqual({ daysToMaturity: null, squaresPerPlant: null });
    });

    it('preserves other plant defaults', () => {
      setPlantDefaults('tomato', { daysToMaturity: 80 });
      setPlantDefaults('lettuce', { daysToMaturity: 30 });

      expect(getPlantDefaults('tomato')).toEqual({ daysToMaturity: 80, squaresPerPlant: null });
      expect(getPlantDefaults('lettuce')).toEqual({ daysToMaturity: 30, squaresPerPlant: null });
    });
  });

  describe('updatePlantDefaults', () => {
    it('updates existing defaults', () => {
      setPlantDefaults('tomato', { daysToMaturity: 80, squaresPerPlant: 2 });
      const result = updatePlantDefaults('tomato', { daysToMaturity: 90 });

      expect(result).toEqual({ daysToMaturity: 90, squaresPerPlant: 2 });
    });

    it('creates defaults if they do not exist', () => {
      const result = updatePlantDefaults('tomato', { daysToMaturity: 80 });

      expect(result).toEqual({ daysToMaturity: 80, squaresPerPlant: null });
    });

    it('merges updates with existing values', () => {
      setPlantDefaults('tomato', { daysToMaturity: 80, squaresPerPlant: 2 });
      const result = updatePlantDefaults('tomato', { squaresPerPlant: 1.5 });

      expect(result).toEqual({ daysToMaturity: 80, squaresPerPlant: 1.5 });
    });

    it('allows setting values to null', () => {
      setPlantDefaults('tomato', { daysToMaturity: 80, squaresPerPlant: 2 });
      const result = updatePlantDefaults('tomato', { daysToMaturity: null });

      expect(result).toEqual({ daysToMaturity: null, squaresPerPlant: 2 });
    });
  });

  describe('deletePlantDefaults', () => {
    it('deletes existing plant defaults', () => {
      setPlantDefaults('tomato', { daysToMaturity: 80 });
      const result = deletePlantDefaults('tomato');

      expect(result).toBe(true);
      expect(getPlantDefaults('tomato')).toBeNull();
    });

    it('returns false when plant has no defaults', () => {
      const result = deletePlantDefaults('tomato');
      expect(result).toBe(false);
    });

    it('preserves other plant defaults when deleting', () => {
      setPlantDefaults('tomato', { daysToMaturity: 80 });
      setPlantDefaults('lettuce', { daysToMaturity: 30 });

      deletePlantDefaults('tomato');

      expect(getPlantDefaults('tomato')).toBeNull();
      expect(getPlantDefaults('lettuce')).toEqual({ daysToMaturity: 30, squaresPerPlant: null });
    });
  });

  describe('resolveEffectiveValue', () => {
    it('returns instance override when provided', () => {
      setPlantDefaults('tomato', { daysToMaturity: 80 });
      const result = resolveEffectiveValue('tomato', 'daysToMaturity', 100);
      expect(result).toBe(100);
    });

    it('returns garden default when no instance override', () => {
      setPlantDefaults('tomato', { daysToMaturity: 80 });
      const result = resolveEffectiveValue('tomato', 'daysToMaturity', null);
      expect(result).toBe(80);
    });

    it('returns garden default when instance override is undefined', () => {
      setPlantDefaults('tomato', { daysToMaturity: 80 });
      const result = resolveEffectiveValue('tomato', 'daysToMaturity', undefined);
      expect(result).toBe(80);
    });

    it('returns library default when no garden default', () => {
      const result = resolveEffectiveValue('tomato', 'daysToMaturity', null);
      expect(result).toBe(70); // Library default from mock
    });

    it('returns null for non-existent plant in library', () => {
      const result = resolveEffectiveValue('unknown-plant', 'daysToMaturity', null);
      expect(result).toBeNull();
    });

    it('returns null when property not found anywhere', () => {
      const result = resolveEffectiveValue('tomato', 'nonExistentProperty', null);
      expect(result).toBeNull();
    });

    it('resolves squaresPerPlant property', () => {
      setPlantDefaults('tomato', { squaresPerPlant: 2 });
      expect(resolveEffectiveValue('tomato', 'squaresPerPlant', null)).toBe(2);
      expect(resolveEffectiveValue('tomato', 'squaresPerPlant', 3)).toBe(3);
    });

    it('returns library squaresPerPlant when no override or default', () => {
      const result = resolveEffectiveValue('tomato', 'squaresPerPlant', null);
      expect(result).toBe(1); // Library default from mock
    });

    it('handles zero as a valid instance override', () => {
      setPlantDefaults('tomato', { daysToMaturity: 80 });
      const result = resolveEffectiveValue('tomato', 'daysToMaturity', 0);
      expect(result).toBe(0);
    });

    it('handles zero as a valid garden default', () => {
      setPlantDefaults('tomato', { daysToMaturity: 0 });
      const result = resolveEffectiveValue('tomato', 'daysToMaturity', null);
      expect(result).toBe(0);
    });

    it('skips garden default when property is null', () => {
      setPlantDefaults('tomato', { daysToMaturity: null });
      const result = resolveEffectiveValue('tomato', 'daysToMaturity', null);
      expect(result).toBe(70); // Falls through to library default
    });
  });

  describe('resolveAllEffectiveValues', () => {
    it('resolves all values with no overrides or defaults', () => {
      const result = resolveAllEffectiveValues('tomato');
      expect(result).toEqual({
        daysToMaturity: 70,
        squaresPerPlant: 1
      });
    });

    it('resolves all values with garden defaults', () => {
      setPlantDefaults('tomato', { daysToMaturity: 80, squaresPerPlant: 2 });
      const result = resolveAllEffectiveValues('tomato');
      expect(result).toEqual({
        daysToMaturity: 80,
        squaresPerPlant: 2
      });
    });

    it('resolves all values with instance overrides', () => {
      setPlantDefaults('tomato', { daysToMaturity: 80, squaresPerPlant: 2 });
      const result = resolveAllEffectiveValues('tomato', { daysToMaturity: 100, squaresPerPlant: 0.5 });
      expect(result).toEqual({
        daysToMaturity: 100,
        squaresPerPlant: 0.5
      });
    });

    it('resolves mixed values (instance + garden + library)', () => {
      setPlantDefaults('tomato', { daysToMaturity: 80, squaresPerPlant: null });
      const result = resolveAllEffectiveValues('tomato', { daysToMaturity: null });
      expect(result).toEqual({
        daysToMaturity: 80,
        squaresPerPlant: 1 // Falls through to library default
      });
    });

    it('handles empty instance overrides object', () => {
      setPlantDefaults('tomato', { daysToMaturity: 80 });
      const result = resolveAllEffectiveValues('tomato', {});
      expect(result).toEqual({
        daysToMaturity: 80,
        squaresPerPlant: 1
      });
    });

    it('handles non-existent plant', () => {
      const result = resolveAllEffectiveValues('unknown-plant');
      expect(result).toEqual({
        daysToMaturity: null,
        squaresPerPlant: null
      });
    });

    it('handles partial instance overrides', () => {
      setPlantDefaults('tomato', { daysToMaturity: 80, squaresPerPlant: 2 });
      const result = resolveAllEffectiveValues('tomato', { daysToMaturity: 100 });
      expect(result).toEqual({
        daysToMaturity: 100,
        squaresPerPlant: 2
      });
    });
  });
});
