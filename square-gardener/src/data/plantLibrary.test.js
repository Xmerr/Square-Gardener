import { describe, it, expect } from 'vitest';
import {
  plantLibrary,
  getPlantById,
  getPlantsBySeason,
  getCompanionPlants,
  arePlantsCompatible
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

    it('returns true if second plant not in avoid list', () => {
      expect(arePlantsCompatible('basil', 'tomato')).toBe(true);
    });

    it('returns false if second plant is in avoid list', () => {
      expect(arePlantsCompatible('basil', 'sage')).toBe(false);
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
