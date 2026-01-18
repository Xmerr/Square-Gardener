/**
 * Session Storage Utilities
 * Handles data persistence for the MVP using browser session storage
 */

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
 */
export const addGardenPlant = (plantId, plantedDate = new Date().toISOString()) => {
  const plants = getGardenPlants();
  const newPlant = {
    id: `garden-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    plantId,
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
 * Clear all storage (useful for testing)
 */
export const clearAllData = () => {
  sessionStorage.removeItem(STORAGE_KEYS.GARDEN_PLANTS);
  sessionStorage.removeItem(STORAGE_KEYS.GARDEN_BEDS);
};
