/**
 * Session Storage Utilities
 * Handles data persistence for the MVP using browser session storage
 */

import { getPlantById } from '../data/plantLibrary';

const STORAGE_KEYS = {
  GARDEN_PLANTS: 'square-gardener-plants',
  GARDEN_BEDS: 'square-gardener-beds'
};

/**
 * Get all garden plants from session storage
 */
export const getGardenPlants = () => {
  try {
    const data = sessionStorage.getItem(STORAGE_KEYS.GARDEN_PLANTS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading garden plants from storage:', error);
    return [];
  }
};

/**
 * Save garden plants to session storage
 */
export const saveGardenPlants = (plants) => {
  try {
    sessionStorage.setItem(STORAGE_KEYS.GARDEN_PLANTS, JSON.stringify(plants));
    return true;
  } catch (error) {
    console.error('Error saving garden plants to storage:', error);
    return false;
  }
};

/**
 * Add a new plant to the garden
 * @param {string} plantId - ID from plant library
 * @param {string} bedId - ID of the bed to assign the plant to
 * @param {number} quantity - Number of plants (default: 1)
 * @param {string} plantedDate - ISO 8601 date string (default: now)
 */
export const addGardenPlant = (plantId, bedId, quantity = 1, plantedDate = new Date().toISOString()) => {
  const plants = getGardenPlants();
  const newPlant = {
    id: `garden-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    plantId,
    bedId,
    quantity,
    plantedDate,
    lastWatered: plantedDate,
    notes: ''
  };

  plants.push(newPlant);
  saveGardenPlants(plants);
  return newPlant;
};

/**
 * Remove a plant from the garden
 */
export const removeGardenPlant = (gardenPlantId) => {
  const plants = getGardenPlants();
  const filtered = plants.filter(plant => plant.id !== gardenPlantId);
  saveGardenPlants(filtered);
  return filtered;
};

/**
 * Update a garden plant
 */
export const updateGardenPlant = (gardenPlantId, updates) => {
  const plants = getGardenPlants();
  const index = plants.findIndex(plant => plant.id === gardenPlantId);

  if (index !== -1) {
    plants[index] = { ...plants[index], ...updates };
    saveGardenPlants(plants);
    return plants[index];
  }

  return null;
};

/**
 * Mark a plant as watered
 */
export const waterPlant = (gardenPlantId) => {
  return updateGardenPlant(gardenPlantId, {
    lastWatered: new Date().toISOString()
  });
};

/**
 * Get all garden beds from session storage
 */
export const getGardenBeds = () => {
  try {
    const data = sessionStorage.getItem(STORAGE_KEYS.GARDEN_BEDS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading garden beds from storage:', error);
    return [];
  }
};

/**
 * Save garden beds to session storage
 */
export const saveGardenBeds = (beds) => {
  try {
    sessionStorage.setItem(STORAGE_KEYS.GARDEN_BEDS, JSON.stringify(beds));
    return true;
  } catch (error) {
    console.error('Error saving garden beds to storage:', error);
    return false;
  }
};

/**
 * Add a new garden bed
 * @param {string} name - Bed name
 * @param {number} width - Width in feet
 * @param {number} height - Height in feet
 */
export const addGardenBed = (name, width, height) => {
  const beds = getGardenBeds();
  const now = new Date().toISOString();
  const newBed = {
    id: `bed-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    width,
    height,
    order: beds.length,
    createdAt: now,
    updatedAt: now
  };

  beds.push(newBed);
  saveGardenBeds(beds);
  return newBed;
};

/**
 * Get a bed by ID
 */
export const getBedById = (bedId) => {
  const beds = getGardenBeds();
  return beds.find(bed => bed.id === bedId) || null;
};

/**
 * Update a garden bed's properties
 */
export const updateGardenBed = (bedId, updates) => {
  const beds = getGardenBeds();
  const index = beds.findIndex(bed => bed.id === bedId);

  if (index !== -1) {
    beds[index] = {
      ...beds[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    saveGardenBeds(beds);
    return beds[index];
  }

  return null;
};

/**
 * Remove a garden bed
 * Returns false if it's the last bed and plants exist in garden
 */
export const removeGardenBed = (bedId) => {
  const beds = getGardenBeds();
  const plants = getGardenPlants();
  const plantsInGarden = plants.length > 0;
  const isLastBed = beds.length === 1;

  if (isLastBed && plantsInGarden) {
    return false;
  }

  const filtered = beds.filter(bed => bed.id !== bedId);
  saveGardenBeds(filtered);
  return true;
};

/**
 * Reorder beds by providing an array of bed IDs in the new order
 */
export const reorderBeds = (bedIds) => {
  const beds = getGardenBeds();
  const reorderedBeds = bedIds.map((id, index) => {
    const bed = beds.find(b => b.id === id);
    if (bed) {
      return { ...bed, order: index };
    }
    return null;
  }).filter(Boolean);

  saveGardenBeds(reorderedBeds);
  return reorderedBeds;
};

/**
 * Get all plants in a specific bed
 */
export const getPlantsByBed = (bedId) => {
  const plants = getGardenPlants();
  return plants.filter(plant => plant.bedId === bedId);
};

/**
 * Calculate capacity for a bed
 * @returns {{ total: number, used: number, available: number, isOvercapacity: boolean }}
 */
export const getBedCapacity = (bedId) => {
  const bed = getBedById(bedId);
  if (!bed) {
    return { total: 0, used: 0, available: 0, isOvercapacity: false };
  }

  const total = bed.width * bed.height;
  const plantsInBed = getPlantsByBed(bedId);

  const used = plantsInBed.reduce((sum, gardenPlant) => {
    const plantInfo = getPlantById(gardenPlant.plantId);
    if (!plantInfo) return sum;
    const quantity = gardenPlant.quantity || 1;
    return sum + (quantity * plantInfo.squaresPerPlant);
  }, 0);

  const available = total - used;
  const isOvercapacity = used > total;

  return {
    total: Math.round(total * 10) / 10,
    used: Math.round(used * 10) / 10,
    available: Math.round(available * 10) / 10,
    isOvercapacity
  };
};

/**
 * Reassign a single plant to a different bed
 */
export const reassignPlant = (gardenPlantId, newBedId) => {
  const bed = getBedById(newBedId);
  if (!bed) return null;

  return updateGardenPlant(gardenPlantId, { bedId: newBedId });
};

/**
 * Bulk reassign multiple plants to a different bed
 */
export const bulkReassignPlants = (gardenPlantIds, newBedId) => {
  const bed = getBedById(newBedId);
  if (!bed) return [];

  const plants = getGardenPlants();
  const updatedPlants = plants.map(plant => {
    if (gardenPlantIds.includes(plant.id)) {
      return { ...plant, bedId: newBedId };
    }
    return plant;
  });

  saveGardenPlants(updatedPlants);
  return updatedPlants.filter(p => gardenPlantIds.includes(p.id));
};

/**
 * Clear all storage (useful for testing)
 */
export const clearAllData = () => {
  sessionStorage.removeItem(STORAGE_KEYS.GARDEN_PLANTS);
  sessionStorage.removeItem(STORAGE_KEYS.GARDEN_BEDS);
};
