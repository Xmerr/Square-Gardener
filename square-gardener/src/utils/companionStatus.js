import { getPlantById } from '../data/plantLibrary';
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

    if (plant.companionPlants.includes(adjacentPlantId)) {
      if (!companions.includes(adjacentPlant.name)) {
        companions.push(adjacentPlant.name);
      }
    }
    if (plant.avoidPlants.includes(adjacentPlantId)) {
      if (!enemies.includes(adjacentPlant.name)) {
        enemies.push(adjacentPlant.name);
      }
    }
  }

  return {
    hasCompanion: companions.length > 0,
    hasEnemy: enemies.length > 0,
    companions,
    enemies
  };
};
