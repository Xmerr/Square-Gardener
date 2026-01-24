import { getPlantById, arePlantsCompanions, arePlantsCompatible } from '../data/plantLibrary';
import { getAdjacentPositions } from './planningAlgorithm';

/**
 * Get companion/enemy status for a square
 * @param {Array<Array<string|null>>} grid - The garden grid
 * @param {number} row - Row index
 * @param {number} col - Column index
 * @returns {{ hasCompanion: boolean, hasEnemy: boolean, companions: string[], enemies: string[] }}
 */
export const getSquareCompanionStatus = (grid, row, col) => {
  const plantId = grid[row]?.[col];
  if (!plantId) {
    return { hasCompanion: false, hasEnemy: false, companions: [], enemies: [] };
  }

  const plant = getPlantById(plantId);
  if (!plant) {
    return { hasCompanion: false, hasEnemy: false, companions: [], enemies: [] };
  }

  const height = grid.length;
  const width = grid[0].length;
  const adjacentPositions = getAdjacentPositions(row, col, width, height);

  const companions = [];
  const enemies = [];

  for (const pos of adjacentPositions) {
    const adjacentPlantId = grid[pos.row][pos.col];
    if (!adjacentPlantId) continue;

    const adjacentPlant = getPlantById(adjacentPlantId);
    if (!adjacentPlant) continue;

    // Use union logic: check if EITHER plant lists the other as companion/enemy
    const isCompanion = arePlantsCompanions(plantId, adjacentPlantId);
    const isEnemy = !arePlantsCompatible(plantId, adjacentPlantId);

    if (isCompanion && !companions.includes(adjacentPlant.name)) {
      companions.push(adjacentPlant.name);
    }
    if (isEnemy && !enemies.includes(adjacentPlant.name)) {
      enemies.push(adjacentPlant.name);
    }
  }

  return {
    hasCompanion: companions.length > 0,
    hasEnemy: enemies.length > 0,
    companions,
    enemies
  };
};

/**
 * Get edge borders and corner markers for a square based on companion/enemy relationships
 * @param {Array<Array<string|null>>} grid - The garden grid
 * @param {number} row - Row index
 * @param {number} col - Column index
 * @returns {Object|null} Edge borders and corner statuses, or null for empty squares
 */
export const getSquareEdgeBorders = (grid, row, col) => {
  const plantId = grid[row]?.[col];
  if (!plantId) return null;

  const plant = getPlantById(plantId);
  if (!plant) return null;

  const height = grid.length;
  const width = grid[0].length;

  // Check relationship with specific neighbor using union logic
  const getRelationship = (neighborRow, neighborCol) => {
    const neighborId = grid[neighborRow]?.[neighborCol];
    if (!neighborId) return null;

    const neighborPlant = getPlantById(neighborId);
    if (!neighborPlant) return null;

    // Use union logic: check if EITHER plant lists the other as companion/enemy
    const isCompanion = arePlantsCompanions(plantId, neighborId);
    const isEnemy = !arePlantsCompatible(plantId, neighborId);

    // Enemy takes precedence
    if (isEnemy) return 'enemy';
    if (isCompanion) return 'companion';
    return null;
  };

  return {
    top: row > 0 ? getRelationship(row - 1, col) : null,
    right: col < width - 1 ? getRelationship(row, col + 1) : null,
    bottom: row < height - 1 ? getRelationship(row + 1, col) : null,
    left: col > 0 ? getRelationship(row, col - 1) : null,
    topLeft: row > 0 && col > 0 ? getRelationship(row - 1, col - 1) : null,
    topRight: row > 0 && col < width - 1 ? getRelationship(row - 1, col + 1) : null,
    bottomLeft: row < height - 1 && col > 0 ? getRelationship(row + 1, col - 1) : null,
    bottomRight: row < height - 1 && col < width - 1 ? getRelationship(row + 1, col + 1) : null,
  };
};
