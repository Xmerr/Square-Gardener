/**
 * Session Storage Utilities
 * Handles data persistence for the MVP using browser session storage
 */

import { getPlantById } from '../data/plantLibrary';

const STORAGE_KEYS = {
  GARDEN_PLANTS: 'square-gardener-plants',
  GARDEN_BEDS: 'square-gardener-beds',
  GARDEN_DEFAULTS: 'square-gardener-garden-defaults'
};

/**
 * Pot size definitions with capacity mappings
 */
export const POT_SIZES = {
  small: {
    label: 'Small (4-6 inch)',
    capacity: 0.25,
    diameter: '4-6 inches'
  },
  medium: {
    label: 'Medium (8-10 inch)',
    capacity: 0.56,
    diameter: '8-10 inches'
  },
  large: {
    label: 'Large (12-14 inch)',
    capacity: 1.0,
    diameter: '12-14 inches'
  },
  extra_large: {
    label: 'Extra Large (16+ inch)',
    capacity: 2.25,
    diameter: '16+ inches'
  }
};

/**
 * Get pot capacity based on size
 * @param {string} size - Pot size key
 * @returns {number} - Capacity in square feet
 */
export const getPotCapacity = (size) => {
  return POT_SIZES[size]?.capacity ?? 0;
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
 * @param {string|null} variety - Plant variety/cultivar name (default: null)
 * @param {string|null} harvestDateOverride - Manual harvest date override (ISO 8601) or null for calculated
 */
export const addGardenPlant = (plantId, bedId, quantity = 1, plantedDate = new Date().toISOString(), variety = null, harvestDateOverride = null) => {
  const plants = getGardenPlants();
  const newPlant = {
    id: `garden-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    plantId,
    bedId,
    quantity,
    variety,
    harvestDateOverride,
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
 * Automatically migrates existing beds to include is_pot field (defaults to false)
 */
export const getGardenBeds = () => {
  try {
    const data = sessionStorage.getItem(STORAGE_KEYS.GARDEN_BEDS);
    if (!data) return [];

    const beds = JSON.parse(data);
    let needsMigration = false;

    // Migrate existing beds that don't have is_pot field
    const migratedBeds = beds.map(bed => {
      if (bed.is_pot === undefined || bed.is_pot === null) {
        needsMigration = true;
        return { ...bed, is_pot: false };
      }
      return bed;
    });

    // Save migrated data back to storage if changes were made
    if (needsMigration) {
      sessionStorage.setItem(STORAGE_KEYS.GARDEN_BEDS, JSON.stringify(migratedBeds));
    }

    return migratedBeds;
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
 * Add a new garden bed or pot
 * @param {string} name - Bed/pot name
 * @param {number} width - Width in feet (for beds only)
 * @param {number} height - Height in feet (for beds only)
 * @param {Object} options - Optional parameters
 * @param {boolean} options.is_pot - True if this is a pot, false for beds (default: false)
 * @param {string} options.size - Pot size ('small' | 'medium' | 'large' | 'extra_large') - required for pots
 */
export const addGardenBed = (name, width, height, options = {}) => {
  const beds = getGardenBeds();
  const now = new Date().toISOString();
  const is_pot = options.is_pot === true;

  const newBed = {
    id: `bed-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    is_pot,
    order: beds.length,
    createdAt: now,
    updatedAt: now
  };

  if (is_pot) {
    // For pots, store size instead of dimensions
    newBed.size = options.size || 'medium';
  } else {
    // For beds, store width and height
    newBed.width = width;
    newBed.height = height;
  }

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
 * Clears the grid if width or height changes
 */
export const updateGardenBed = (bedId, updates) => {
  const beds = getGardenBeds();
  const index = beds.findIndex(bed => bed.id === bedId);

  if (index !== -1) {
    const currentBed = beds[index];
    const updatedBed = {
      ...currentBed,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    // Clear grid if dimensions changed (only for beds, not pots)
    if (!currentBed.is_pot) {
      const widthChanged = updates.width !== undefined && updates.width !== currentBed.width;
      const heightChanged = updates.height !== undefined && updates.height !== currentBed.height;
      if (widthChanged || heightChanged) {
        updatedBed.grid = null;
      }
    }

    beds[index] = updatedBed;
    saveGardenBeds(beds);
    return beds[index];
  }

  return null;
};

/**
 * Update a garden bed's grid arrangement
 * @param {string} bedId - ID of the bed to update
 * @param {Array<Array<string|null>>} grid - 2D array of plant IDs
 * @returns {Object|null} - Updated bed or null if not found
 */
export const updateBedGrid = (bedId, grid) => {
  const beds = getGardenBeds();
  const index = beds.findIndex(bed => bed.id === bedId);

  if (index !== -1) {
    beds[index] = {
      ...beds[index],
      grid,
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
 * @param {string} bedId - ID of the bed to remove
 * @param {Object} options - Optional settings for plant handling
 * @param {boolean} options.deleteAllPlants - If true, delete all plants in the bed
 * @param {string} options.destinationBedId - If provided, reassign plants to this bed
 */
export const removeGardenBed = (bedId, options = {}) => {
  const beds = getGardenBeds();
  const plants = getGardenPlants();
  const plantsInBed = plants.filter(p => p.bedId === bedId);
  const isLastBed = beds.length === 1;

  // Handle plants in the bed being deleted
  if (plantsInBed.length > 0) {
    if (options.deleteAllPlants) {
      // Remove all plants in this bed
      const remainingPlants = plants.filter(p => p.bedId !== bedId);
      saveGardenPlants(remainingPlants);
    } else if (options.destinationBedId) {
      // Reassign plants to destination bed
      const updatedPlants = plants.map(p => {
        if (p.bedId === bedId) {
          return { ...p, bedId: options.destinationBedId };
        }
        return p;
      });
      saveGardenPlants(updatedPlants);
    } else if (isLastBed) {
      // Can't delete last bed with plants without specifying what to do with them
      return false;
    }
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
 * Calculate capacity for a bed or pot
 * @returns {{ total: number, used: number, available: number, isOvercapacity: boolean }}
 */
export const getBedCapacity = (bedId) => {
  const bed = getBedById(bedId);
  if (!bed) {
    return { total: 0, used: 0, available: 0, isOvercapacity: false };
  }

  // Calculate total capacity based on bed type
  let total;
  if (bed.is_pot) {
    total = getPotCapacity(bed.size);
  } else {
    total = bed.width * bed.height;
  }

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
  sessionStorage.removeItem(STORAGE_KEYS.GARDEN_DEFAULTS);
};

// ============================================================
// Garden Defaults Storage
// ============================================================
// Enables users to set custom default values per plant type
// that apply to all new instances in the garden.
//
// Data Model:
// {
//   [plantId]: {
//     daysToMaturity: number | null,
//     squaresPerPlant: number | null
//   }
// }
// ============================================================

/**
 * Get all garden defaults from session storage
 * @returns {Object.<string, {daysToMaturity: number|null, squaresPerPlant: number|null}>}
 */
export const getGardenDefaults = () => {
  try {
    const data = sessionStorage.getItem(STORAGE_KEYS.GARDEN_DEFAULTS);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error reading garden defaults from storage:', error);
    return {};
  }
};

/**
 * Save all garden defaults to session storage
 * @param {Object.<string, {daysToMaturity: number|null, squaresPerPlant: number|null}>} defaults
 * @returns {boolean}
 */
export const saveGardenDefaults = (defaults) => {
  try {
    sessionStorage.setItem(STORAGE_KEYS.GARDEN_DEFAULTS, JSON.stringify(defaults));
    return true;
  } catch (error) {
    console.error('Error saving garden defaults to storage:', error);
    return false;
  }
};

/**
 * Get garden defaults for a specific plant type
 * @param {string} plantId - ID from plant library
 * @returns {{daysToMaturity: number|null, squaresPerPlant: number|null}|null}
 */
export const getPlantDefaults = (plantId) => {
  const defaults = getGardenDefaults();
  return defaults[plantId] || null;
};

/**
 * Set garden defaults for a specific plant type
 * Creates or replaces the defaults for the given plant
 * @param {string} plantId - ID from plant library
 * @param {{daysToMaturity?: number|null, squaresPerPlant?: number|null}} plantDefaults
 * @returns {{daysToMaturity: number|null, squaresPerPlant: number|null}}
 */
export const setPlantDefaults = (plantId, plantDefaults) => {
  const defaults = getGardenDefaults();
  const newDefaults = {
    daysToMaturity: plantDefaults.daysToMaturity ?? null,
    squaresPerPlant: plantDefaults.squaresPerPlant ?? null
  };
  defaults[plantId] = newDefaults;
  saveGardenDefaults(defaults);
  return newDefaults;
};

/**
 * Update garden defaults for a specific plant type
 * Merges updates with existing defaults for the plant
 * @param {string} plantId - ID from plant library
 * @param {{daysToMaturity?: number|null, squaresPerPlant?: number|null}} updates
 * @returns {{daysToMaturity: number|null, squaresPerPlant: number|null}}
 */
export const updatePlantDefaults = (plantId, updates) => {
  const defaults = getGardenDefaults();
  const existing = defaults[plantId] || { daysToMaturity: null, squaresPerPlant: null };
  const updated = { ...existing, ...updates };
  defaults[plantId] = updated;
  saveGardenDefaults(defaults);
  return updated;
};

/**
 * Delete garden defaults for a specific plant type
 * @param {string} plantId - ID from plant library
 * @returns {boolean} - true if deleted, false if not found
 */
export const deletePlantDefaults = (plantId) => {
  const defaults = getGardenDefaults();
  if (!(plantId in defaults)) {
    return false;
  }
  delete defaults[plantId];
  saveGardenDefaults(defaults);
  return true;
};

/**
 * Resolve effective values for a plant property
 * Priority: instance override > garden default > library default
 *
 * @param {string} plantId - ID from plant library
 * @param {string} property - Property name ('daysToMaturity' or 'squaresPerPlant')
 * @param {number|null|undefined} instanceOverride - Value set on the instance (optional)
 * @returns {number|null} - The resolved value or null if not found
 */
export const resolveEffectiveValue = (plantId, property, instanceOverride) => {
  // Instance override takes highest precedence
  if (instanceOverride !== null && instanceOverride !== undefined) {
    return instanceOverride;
  }

  // Garden default takes second precedence
  const plantDefaults = getPlantDefaults(plantId);
  if (plantDefaults && plantDefaults[property] !== null && plantDefaults[property] !== undefined) {
    return plantDefaults[property];
  }

  // Library default takes lowest precedence
  const libraryPlant = getPlantById(plantId);
  if (libraryPlant && libraryPlant[property] !== null && libraryPlant[property] !== undefined) {
    return libraryPlant[property];
  }

  return null;
};

/**
 * Resolve all effective values for a plant
 * Returns an object with resolved daysToMaturity and squaresPerPlant
 *
 * @param {string} plantId - ID from plant library
 * @param {{daysToMaturity?: number|null, squaresPerPlant?: number|null}} instanceOverrides - Values set on the instance
 * @returns {{daysToMaturity: number|null, squaresPerPlant: number|null}}
 */
export const resolveAllEffectiveValues = (plantId, instanceOverrides = {}) => {
  return {
    daysToMaturity: resolveEffectiveValue(plantId, 'daysToMaturity', instanceOverrides.daysToMaturity),
    squaresPerPlant: resolveEffectiveValue(plantId, 'squaresPerPlant', instanceOverrides.squaresPerPlant)
  };
};
