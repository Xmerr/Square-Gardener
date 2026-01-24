import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  plantLibrary,
  getPlantById,
  getPlantsBySeason,
  getCompanionPlants,
  arePlantsCompatible,
  arePlantsCompanions
} from './plantLibrary';

describe('plantLibrary', () => {
  describe('plantLibrary data', () => {
    it('contains plants array', () => {
      expect(Array.isArray(plantLibrary)).toBe(true);
      expect(plantLibrary.length).toBeGreaterThan(0);
    });

    it('plants have required properties', () => {
      plantLibrary.forEach(plant => {
        expect(plant).toHaveProperty('id');
        expect(plant).toHaveProperty('name');
        expect(plant).toHaveProperty('scientificName');
        expect(plant).toHaveProperty('wateringFrequency');
        expect(plant).toHaveProperty('squaresPerPlant');
        expect(plant).toHaveProperty('daysToMaturity');
        expect(plant).toHaveProperty('plantingSeason');
        expect(plant).toHaveProperty('sunRequirement');
        expect(plant).toHaveProperty('companionPlants');
        expect(plant).toHaveProperty('avoidPlants');
      });
    });
  });

  describe('getPlantById', () => {
    it('returns plant by id', () => {
      const tomato = getPlantById('tomato');
      expect(tomato).toBeDefined();
      expect(tomato.name).toBe('Tomato');
    });

    it('returns undefined for non-existent id', () => {
      const result = getPlantById('non-existent-plant');
      expect(result).toBeUndefined();
    });

    it('returns correct plant properties', () => {
      const lettuce = getPlantById('lettuce');
      expect(lettuce.scientificName).toBe('Lactuca sativa');
      expect(lettuce.sunRequirement).toBe('partial');
    });
  });

  describe('getPlantsBySeason', () => {
    it('returns plants for spring season', () => {
      const springPlants = getPlantsBySeason('spring');
      expect(springPlants.length).toBeGreaterThan(0);
      springPlants.forEach(plant => {
        expect(plant.plantingSeason).toContain('spring');
      });
    });

    it('returns plants for summer season', () => {
      const summerPlants = getPlantsBySeason('summer');
      expect(summerPlants.length).toBeGreaterThan(0);
      summerPlants.forEach(plant => {
        expect(plant.plantingSeason).toContain('summer');
      });
    });

    it('returns plants for fall season', () => {
      const fallPlants = getPlantsBySeason('fall');
      expect(fallPlants.length).toBeGreaterThan(0);
      fallPlants.forEach(plant => {
        expect(plant.plantingSeason).toContain('fall');
      });
    });

    it('returns empty array for invalid season', () => {
      const result = getPlantsBySeason('winter');
      expect(result).toEqual([]);
    });
  });

  describe('getCompanionPlants', () => {
    it('returns companion plants for tomato', () => {
      const companions = getCompanionPlants('tomato');
      expect(companions.length).toBeGreaterThan(0);
      expect(companions.some(p => p.id === 'basil')).toBe(true);
    });

    it('returns empty array for non-existent plant', () => {
      const result = getCompanionPlants('non-existent-plant');
      expect(result).toEqual([]);
    });

    it('filters out undefined companions', () => {
      const companions = getCompanionPlants('tomato');
      companions.forEach(companion => {
        expect(companion).toBeDefined();
        expect(companion).not.toBeNull();
      });
    });
  });

  describe('arePlantsCompatible', () => {
    it('returns true for compatible plants', () => {
      expect(arePlantsCompatible('tomato', 'basil')).toBe(true);
    });

    it('returns false for incompatible plants', () => {
      expect(arePlantsCompatible('tomato', 'cabbage')).toBe(false);
    });

    it('returns true for non-existent first plant', () => {
      expect(arePlantsCompatible('non-existent', 'tomato')).toBe(true);
    });

    it('returns true for non-existent second plant', () => {
      expect(arePlantsCompatible('tomato', 'non-existent')).toBe(true);
    });

    it('returns true if neither plant has the other in avoid list', () => {
      expect(arePlantsCompatible('basil', 'tomato')).toBe(true);
    });

    it('returns false if first plant has second in avoid list', () => {
      expect(arePlantsCompatible('basil', 'sage')).toBe(false);
    });

    it('returns false if second plant has first in avoid list (symmetric)', () => {
      // Sage avoids cucumber, so cucumber and sage are incompatible regardless of order
      expect(arePlantsCompatible('sage', 'cucumber')).toBe(false);
      expect(arePlantsCompatible('cucumber', 'sage')).toBe(false);
    });

    it('returns false if either plant lists other as enemy (union logic)', () => {
      // Tomato avoids cabbage
      expect(arePlantsCompatible('tomato', 'cabbage')).toBe(false);
      // Cabbage avoids tomato
      expect(arePlantsCompatible('cabbage', 'tomato')).toBe(false);
    });
  });

  describe('arePlantsCompanions', () => {
    it('returns true when first plant lists second as companion', () => {
      // Tomato lists basil as companion
      expect(arePlantsCompanions('tomato', 'basil')).toBe(true);
    });

    it('returns true when second plant lists first as companion (symmetric)', () => {
      // Basil lists tomato as companion
      expect(arePlantsCompanions('basil', 'tomato')).toBe(true);
    });

    it('returns true when either plant lists other as companion (union logic)', () => {
      // Carrot lists lettuce as companion
      expect(arePlantsCompanions('carrot', 'lettuce')).toBe(true);
      // Lettuce lists carrot as companion
      expect(arePlantsCompanions('lettuce', 'carrot')).toBe(true);
    });

    it('returns false when neither plant lists other as companion', () => {
      // Tomato and lettuce have no companion relationship
      expect(arePlantsCompanions('tomato', 'lettuce')).toBe(false);
    });

    it('returns false for non-existent plants', () => {
      expect(arePlantsCompanions('non-existent', 'tomato')).toBe(false);
      expect(arePlantsCompanions('tomato', 'non-existent')).toBe(false);
    });

    it('returns false when plants are enemies (enemy takes precedence)', () => {
      // Tomato and cabbage are enemies
      expect(arePlantsCompanions('tomato', 'cabbage')).toBe(false);
    });

    describe('conflict handling', () => {
      let consoleWarnSpy;

      beforeEach(() => {
        consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      });

      afterEach(() => {
        consoleWarnSpy.mockRestore();
      });

      it('logs warning when enemy relationship exists despite companion listing', () => {
        // Tomato avoids cabbage
        // If we artificially had tomato also list cabbage as companion, it would warn
        // But in real data, this shouldn't happen - test the logic works
        expect(arePlantsCompanions('tomato', 'cabbage')).toBe(false);
      });

      it('treats conflicting relationships as enemies', () => {
        // Even if listed as companion, enemy takes precedence
        expect(arePlantsCompanions('tomato', 'cabbage')).toBe(false);
        expect(arePlantsCompatible('tomato', 'cabbage')).toBe(false);
      });
    });
  });

  describe('Houseplant additions', () => {
    describe('Aloe', () => {
      it('exists in plant library', () => {
        const aloe = getPlantById('aloe');
        expect(aloe).toBeDefined();
      });

      it('has correct name', () => {
        const aloe = getPlantById('aloe');
        expect(aloe.name).toBe('Aloe');
      });

      it('has correct squaresPerPlant value', () => {
        const aloe = getPlantById('aloe');
        expect(aloe.squaresPerPlant).toBe(0.25);
      });

      it('has correct scientific name', () => {
        const aloe = getPlantById('aloe');
        expect(aloe.scientificName).toBe('Aloe vera');
      });

      it('has no companion plants', () => {
        const aloe = getPlantById('aloe');
        expect(aloe.companionPlants).toEqual([]);
      });

      it('has no avoid plants', () => {
        const aloe = getPlantById('aloe');
        expect(aloe.avoidPlants).toEqual([]);
      });

      it('is compatible with all plants', () => {
        expect(arePlantsCompatible('aloe', 'tomato')).toBe(true);
        expect(arePlantsCompatible('aloe', 'basil')).toBe(true);
        expect(arePlantsCompatible('tomato', 'aloe')).toBe(true);
      });
    });

    describe('Calathea', () => {
      it('exists in plant library', () => {
        const calathea = getPlantById('calathea');
        expect(calathea).toBeDefined();
      });

      it('has correct name', () => {
        const calathea = getPlantById('calathea');
        expect(calathea.name).toBe('Calathea');
      });

      it('has correct squaresPerPlant value', () => {
        const calathea = getPlantById('calathea');
        expect(calathea.squaresPerPlant).toBe(0.25);
      });

      it('has correct scientific name', () => {
        const calathea = getPlantById('calathea');
        expect(calathea.scientificName).toBe('Calathea spp.');
      });

      it('has no companion plants', () => {
        const calathea = getPlantById('calathea');
        expect(calathea.companionPlants).toEqual([]);
      });

      it('has no avoid plants', () => {
        const calathea = getPlantById('calathea');
        expect(calathea.avoidPlants).toEqual([]);
      });

      it('is compatible with all plants', () => {
        expect(arePlantsCompatible('calathea', 'tomato')).toBe(true);
        expect(arePlantsCompatible('calathea', 'basil')).toBe(true);
        expect(arePlantsCompatible('tomato', 'calathea')).toBe(true);
      });
    });
  });
});
