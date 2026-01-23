/**
 * Planning Algorithm
 * Constraint satisfaction algorithm for auto-arranging plants in a garden bed
 *
 * Priority:
 * 1. Never place enemy plants in adjacent squares (including diagonal)
 * 2. Place companion plants in adjacent squares when possible
 * 3. Efficiently fill available space
 */

import { getPlantById, arePlantsCompatible } from '../data/plantLibrary';

/**
 * Get all 8 adjacent positions (including diagonals)
 * @param {number} row
 * @param {number} col
 * @param {number} width
 * @param {number} height
 * @returns {Array<{row: number, col: number}>}
 */
export const getAdjacentPositions = (row, col, width, height) => {
  const positions = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const newRow = row + dr;
      const newCol = col + dc;
      if (newRow >= 0 && newRow < height && newCol >= 0 && newCol < width) {
        positions.push({ row: newRow, col: newCol });
      }
    }
  }
  return positions;
};

/**
 * Check if placing a plant at a position violates enemy constraints
 * @param {string} plantId
 * @param {number} row
 * @param {number} col
 * @param {Array<Array<string|null>>} grid
 * @returns {boolean} true if placement is valid (no enemy adjacencies)
 */
export const isValidPlacement = (plantId, row, col, grid) => {
  const height = grid.length;
  const width = grid[0].length;
  const adjacentPositions = getAdjacentPositions(row, col, width, height);

  for (const pos of adjacentPositions) {
    const adjacentPlantId = grid[pos.row][pos.col];
    if (adjacentPlantId && !arePlantsCompatible(plantId, adjacentPlantId)) {
      return false;
    }
    if (adjacentPlantId && !arePlantsCompatible(adjacentPlantId, plantId)) {
      return false;
    }
  }
  return true;
};

/**
 * Count companion adjacencies for a plant at a position
 * @param {string} plantId
 * @param {number} row
 * @param {number} col
 * @param {Array<Array<string|null>>} grid
 * @returns {number}
 */
export const countCompanionAdjacencies = (plantId, row, col, grid) => {
  const plant = getPlantById(plantId);
  if (!plant) return 0;

  const height = grid.length;
  const width = grid[0].length;
  const adjacentPositions = getAdjacentPositions(row, col, width, height);
  let count = 0;

  for (const pos of adjacentPositions) {
    const adjacentPlantId = grid[pos.row][pos.col];
    if (adjacentPlantId && plant.companionPlants.includes(adjacentPlantId)) {
      count++;
    }
  }
  return count;
};

/**
 * Calculate constraint difficulty for a plant (how many enemies it has)
 * @param {string} plantId
 * @returns {number}
 */
export const getConstraintDifficulty = (plantId) => {
  const plant = getPlantById(plantId);
  return plant ? plant.avoidPlants.length : 0;
};

/**
 * Sort plants by constraint difficulty (most constrained first)
 * @param {Array<{plantId: string, quantity: number}>} plantSelections
 * @returns {Array<string>} Flattened array of plant IDs sorted by difficulty
 */
export const sortByConstraintDifficulty = (plantSelections) => {
  // Expand selections into individual plant placements
  const expanded = [];
  for (const selection of plantSelections) {
    const plant = getPlantById(selection.plantId);
    if (!plant) continue;

    // quantity now represents square feet directly
    const squaresNeeded = Math.ceil(selection.quantity);
    for (let i = 0; i < squaresNeeded; i++) {
      expanded.push(selection.plantId);
    }
  }

  // Sort by constraint difficulty (descending)
  return expanded.sort((a, b) => getConstraintDifficulty(b) - getConstraintDifficulty(a));
};

/**
 * Find the best position for a plant using scoring
 * @param {string} plantId
 * @param {Array<Array<string|null>>} grid
 * @param {Array<Array<boolean>>} lockedSquares
 * @returns {{row: number, col: number} | null}
 */
export const findBestPosition = (plantId, grid, lockedSquares) => {
  const height = grid.length;
  const width = grid[0].length;
  let bestPosition = null;
  let bestScore = -Infinity;

  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      // Skip if square is occupied or locked
      if (grid[row][col] !== null) continue;
      if (lockedSquares[row][col]) continue;

      // Check if placement is valid (no enemy adjacencies)
      if (!isValidPlacement(plantId, row, col, grid)) continue;

      // Score based on companion adjacencies
      const score = countCompanionAdjacencies(plantId, row, col, grid);

      if (score > bestScore) {
        bestScore = score;
        bestPosition = { row, col };
      }
    }
  }

  return bestPosition;
};

/**
 * Generate a garden arrangement using constraint satisfaction
 * @param {Object} options
 * @param {number} options.width - Bed width in feet
 * @param {number} options.height - Bed height in feet
 * @param {Array<{plantId: string, quantity: number}>} options.plantSelections - Plants to arrange
 * @param {Array<Array<boolean>>} [options.lockedSquares] - Optional grid of locked squares
 * @returns {{
 *   grid: Array<Array<string|null>>,
 *   placements: Array<{plantId: string, row: number, col: number}>,
 *   success: boolean,
 *   unplacedPlants: Array<string>
 * }}
 * @throws {Error} If no valid arrangement is possible
 */
export const generateArrangement = ({ width, height, plantSelections, lockedSquares }) => {
  // Validate inputs
  if (!width || !height || width < 1 || height < 1) {
    throw new Error('Invalid bed dimensions');
  }
  if (!plantSelections || !Array.isArray(plantSelections)) {
    throw new Error('Plant selections must be an array');
  }

  // Initialize grid with nulls
  const grid = Array.from({ length: height }, () => Array(width).fill(null));

  // Initialize locked squares if not provided
  const locked = lockedSquares || Array.from({ length: height }, () => Array(width).fill(false));

  // Track placements
  const placements = [];
  const unplacedPlants = [];

  // Sort plants by constraint difficulty
  const plantsToPlace = sortByConstraintDifficulty(plantSelections);

  // Check if we have more plants than available squares
  const availableSquares = grid.flat().filter((_, i) => {
    const row = Math.floor(i / width);
    const col = i % width;
    return !locked[row][col];
  }).length;

  if (plantsToPlace.length > availableSquares) {
    throw new Error(`Not enough space: ${plantsToPlace.length} plants require more than ${availableSquares} available squares`);
  }

  // Place each plant using greedy algorithm with scoring
  for (const plantId of plantsToPlace) {
    const position = findBestPosition(plantId, grid, locked);

    if (!position) {
      // No valid position found
      unplacedPlants.push(plantId);
    } else {
      // Place the plant
      grid[position.row][position.col] = plantId;
      placements.push({ plantId, row: position.row, col: position.col });
    }
  }

  // Check if any plants couldn't be placed due to constraints
  if (unplacedPlants.length > 0) {
    const uniqueUnplaced = [...new Set(unplacedPlants)];
    // Note: Plants in unplacedPlants are always valid (filtered in sortByConstraintDifficulty)
    const plantNames = uniqueUnplaced.map(id => getPlantById(id).name);
    throw new Error(
      `Could not place all plants due to companion/enemy constraints. ` +
      `Unable to place: ${plantNames.join(', ')}. ` +
      `Consider removing plants with many enemies or reducing quantities.`
    );
  }

  return {
    grid,
    placements,
    success: true,
    unplacedPlants: []
  };
};

/**
 * Validate an existing arrangement for constraint violations
 * @param {Array<Array<string|null>>} grid
 * @returns {{
 *   valid: boolean,
 *   violations: Array<{row: number, col: number, plantId: string, enemyPlantId: string}>
 * }}
 */
export const validateArrangement = (grid) => {
  const violations = [];
  const height = grid.length;
  const width = grid[0].length;

  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const plantId = grid[row][col];
      if (!plantId) continue;

      const adjacentPositions = getAdjacentPositions(row, col, width, height);
      for (const pos of adjacentPositions) {
        const adjacentPlantId = grid[pos.row][pos.col];
        if (!adjacentPlantId) continue;

        if (!arePlantsCompatible(plantId, adjacentPlantId)) {
          // Avoid duplicate violations (only report once per pair)
          const existing = violations.find(
            v => (v.row === pos.row && v.col === pos.col && v.plantId === adjacentPlantId && v.enemyPlantId === plantId)
          );
          if (!existing) {
            violations.push({ row, col, plantId, enemyPlantId: adjacentPlantId });
          }
        }
      }
    }
  }

  return {
    valid: violations.length === 0,
    violations
  };
};

/**
 * Calculate arrangement statistics
 * @param {Array<Array<string|null>>} grid
 * @returns {{
 *   totalSquares: number,
 *   filledSquares: number,
 *   emptySquares: number,
 *   companionAdjacencies: number,
 *   uniquePlants: number
 * }}
 */
export const getArrangementStats = (grid) => {
  const height = grid.length;
  const width = grid[0].length;
  const totalSquares = width * height;
  let filledSquares = 0;
  let companionAdjacencies = 0;
  const plantSet = new Set();

  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const plantId = grid[row][col];
      if (plantId) {
        filledSquares++;
        plantSet.add(plantId);
        companionAdjacencies += countCompanionAdjacencies(plantId, row, col, grid);
      }
    }
  }

  // Divide by 2 to avoid double-counting adjacencies
  companionAdjacencies = Math.floor(companionAdjacencies / 2);

  return {
    totalSquares,
    filledSquares,
    emptySquares: totalSquares - filledSquares,
    companionAdjacencies,
    uniquePlants: plantSet.size
  };
};

/**
 * Check if a plant is a bridge between two enemy plants
 * @param {string} bridgePlantId - Potential bridge plant
 * @param {string} plantId1 - First plant
 * @param {string} plantId2 - Second plant
 * @returns {boolean} true if bridge plant is compatible with both enemies
 */
export const isBridgePlant = (bridgePlantId, plantId1, plantId2) => {
  // Check if the two plants are enemies
  if (arePlantsCompatible(plantId1, plantId2)) {
    return false; // Not enemies, no bridge needed
  }

  // Check if bridge is compatible with both
  return arePlantsCompatible(bridgePlantId, plantId1) &&
         arePlantsCompatible(bridgePlantId, plantId2);
};

/**
 * Find bridge plants that can connect two enemy plant groups
 * @param {string} plantId1 - First plant
 * @param {string} plantId2 - Second plant
 * @param {Array<string>} availablePlantIds - Plant IDs available for placement
 * @returns {Array<string>} Array of plant IDs that can bridge the two enemies
 */
export const findBridgePlants = (plantId1, plantId2, availablePlantIds) => {
  return availablePlantIds.filter(bridgeId =>
    isBridgePlant(bridgeId, plantId1, plantId2)
  );
};

/**
 * Generate arrangement with fill mode - uses quantities as minimums and fills remaining space
 * @param {Object} options
 * @param {number} options.width - Bed width in feet
 * @param {number} options.height - Bed height in feet
 * @param {Array<{plantId: string, quantity: number}>} options.plantSelections - Plants to arrange (minimums)
 * @param {Array<Array<boolean>>} [options.lockedSquares] - Optional grid of locked squares
 * @param {boolean} [options.fillMode=false] - If true, fill all available space
 * @returns {{
 *   grid: Array<Array<string|null>>,
 *   placements: Array<{plantId: string, row: number, col: number}>,
 *   success: boolean,
 *   unplacedPlants: Array<string>
 * }}
 */
export const generateArrangementWithFill = ({ width, height, plantSelections, lockedSquares, fillMode = false }) => {
  // Validate inputs
  if (!width || !height || width < 1 || height < 1) {
    throw new Error('Invalid bed dimensions');
  }
  if (!plantSelections || !Array.isArray(plantSelections)) {
    throw new Error('Plant selections must be an array');
  }

  // Initialize grid with nulls
  const grid = Array.from({ length: height }, () => Array(width).fill(null));

  // Initialize locked squares if not provided
  const locked = lockedSquares || Array.from({ length: height }, () => Array(width).fill(false));

  // Track placements
  const placements = [];
  const unplacedPlants = [];

  // Calculate available squares
  const availableSquares = grid.flat().filter((_, i) => {
    const row = Math.floor(i / width);
    const col = i % width;
    return !locked[row][col];
  }).length;

  if (!fillMode) {
    // Original behavior - exact quantities
    const plantsToPlace = sortByConstraintDifficulty(plantSelections);

    if (plantsToPlace.length > availableSquares) {
      throw new Error(`Not enough space: ${plantsToPlace.length} plants require more than ${availableSquares} available squares`);
    }

    // Place each plant using greedy algorithm with scoring
    for (const plantId of plantsToPlace) {
      const position = findBestPosition(plantId, grid, locked);

      if (!position) {
        unplacedPlants.push(plantId);
      } else {
        grid[position.row][position.col] = plantId;
        placements.push({ plantId, row: position.row, col: position.col });
      }
    }

    // Check if any plants couldn't be placed due to constraints
    if (unplacedPlants.length > 0) {
      const uniqueUnplaced = [...new Set(unplacedPlants)];
      const plantNames = uniqueUnplaced.map(id => getPlantById(id).name);
      throw new Error(
        `Could not place all plants due to companion/enemy constraints. ` +
        `Unable to place: ${plantNames.join(', ')}. ` +
        `Consider removing plants with many enemies or reducing quantities.`
      );
    }

    return {
      grid,
      placements,
      success: true,
      unplacedPlants: []
    };
  }

  // Fill mode - treat quantities as minimums

  // Step 1: Place minimum quantities (sorted by constraint difficulty)
  const plantsToPlace = sortByConstraintDifficulty(plantSelections);

  if (plantsToPlace.length > availableSquares) {
    throw new Error(`Not enough space: ${plantsToPlace.length} plants require more than ${availableSquares} available squares`);
  }

  for (const plantId of plantsToPlace) {
    const position = findBestPosition(plantId, grid, locked);

    if (!position) {
      unplacedPlants.push(plantId);
    } else {
      grid[position.row][position.col] = plantId;
      placements.push({ plantId, row: position.row, col: position.col });
    }
  }

  if (unplacedPlants.length > 0) {
    const uniqueUnplaced = [...new Set(unplacedPlants)];
    const plantNames = uniqueUnplaced.map(id => getPlantById(id).name);
    throw new Error(
      `Could not place minimum plant quantities due to companion/enemy constraints. ` +
      `Unable to place: ${plantNames.join(', ')}. ` +
      `Consider removing plants with many enemies or reducing quantities.`
    );
  }

  // Step 2: Calculate remaining space and proportional targets
  const filledCount = placements.length;
  const remainingSquares = availableSquares - filledCount;

  if (remainingSquares > 0) {
    // Get unique plant IDs from selections
    const selectedPlantIds = [...new Set(plantSelections.map(s => s.plantId))];

    // Calculate current counts per plant
    const currentCounts = {};
    selectedPlantIds.forEach(id => {
      currentCounts[id] = placements.filter(p => p.plantId === id).length;
    });

    // Fill remaining squares proportionally
    for (let i = 0; i < remainingSquares; i++) {
      // Find plant with lowest current ratio (current / total)
      let selectedPlantId = null;
      let lowestRatio = Infinity;

      for (const plantId of selectedPlantIds) {
        const current = currentCounts[plantId] || 0;
        const ratio = current / (filledCount + i + 1);

        if (ratio < lowestRatio) {
          // Try to find a valid position for this plant
          const testPosition = findBestPosition(plantId, grid, locked);
          if (testPosition) {
            lowestRatio = ratio;
            selectedPlantId = plantId;
          }
        }
      }

      if (selectedPlantId) {
        const position = findBestPosition(selectedPlantId, grid, locked);
        if (position) {
          grid[position.row][position.col] = selectedPlantId;
          placements.push({ plantId: selectedPlantId, row: position.row, col: position.col });
          currentCounts[selectedPlantId] = (currentCounts[selectedPlantId] || 0) + 1;
        } else {
          // No valid position found, try bridge plant strategy
          break;
        }
      } else {
        // No plant could be placed, stop filling
        break;
      }
    }
  }

  return {
    grid,
    placements,
    success: true,
    unplacedPlants: []
  };
};
