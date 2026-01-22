import { describe, it, expect } from 'vitest';
import {
  getAdjacentPositions,
  isValidPlacement,
  countCompanionAdjacencies,
  getConstraintDifficulty,
  sortByConstraintDifficulty,
  findBestPosition,
  generateArrangement,
  validateArrangement,
  getArrangementStats
} from './planningAlgorithm';

describe('planningAlgorithm', () => {
  describe('getAdjacentPositions', () => {
    it('should return 8 adjacent positions for center cell in 3x3 grid', () => {
      const positions = getAdjacentPositions(1, 1, 3, 3);
      expect(positions).toHaveLength(8);
      expect(positions).toContainEqual({ row: 0, col: 0 });
      expect(positions).toContainEqual({ row: 0, col: 1 });
      expect(positions).toContainEqual({ row: 0, col: 2 });
      expect(positions).toContainEqual({ row: 1, col: 0 });
      expect(positions).toContainEqual({ row: 1, col: 2 });
      expect(positions).toContainEqual({ row: 2, col: 0 });
      expect(positions).toContainEqual({ row: 2, col: 1 });
      expect(positions).toContainEqual({ row: 2, col: 2 });
    });

    it('should return 3 adjacent positions for corner cell', () => {
      const positions = getAdjacentPositions(0, 0, 3, 3);
      expect(positions).toHaveLength(3);
      expect(positions).toContainEqual({ row: 0, col: 1 });
      expect(positions).toContainEqual({ row: 1, col: 0 });
      expect(positions).toContainEqual({ row: 1, col: 1 });
    });

    it('should return 5 adjacent positions for edge cell', () => {
      const positions = getAdjacentPositions(0, 1, 3, 3);
      expect(positions).toHaveLength(5);
    });

    it('should handle 1x1 grid', () => {
      const positions = getAdjacentPositions(0, 0, 1, 1);
      expect(positions).toHaveLength(0);
    });

    it('should handle rectangular grids', () => {
      const positions = getAdjacentPositions(1, 1, 4, 2);
      expect(positions).toHaveLength(5);
    });
  });

  describe('isValidPlacement', () => {
    it('should return true for empty grid', () => {
      const grid = [[null, null], [null, null]];
      expect(isValidPlacement('tomato', 0, 0, grid)).toBe(true);
    });

    it('should return true for compatible adjacent plants', () => {
      const grid = [['basil', null], [null, null]];
      expect(isValidPlacement('tomato', 0, 1, grid)).toBe(true);
    });

    it('should return false for enemy adjacent plants', () => {
      const grid = [['cabbage', null], [null, null]];
      expect(isValidPlacement('tomato', 0, 1, grid)).toBe(false);
    });

    it('should check diagonal adjacency for enemies', () => {
      const grid = [['cabbage', null], [null, null]];
      expect(isValidPlacement('tomato', 1, 1, grid)).toBe(false);
    });

    it('should return true when enemy is not adjacent', () => {
      const grid = [
        ['cabbage', null, null],
        [null, null, null],
        [null, null, null]
      ];
      expect(isValidPlacement('tomato', 2, 2, grid)).toBe(true);
    });

    it('should check both directions of compatibility', () => {
      // Bean avoids onion, and we should check if the existing plant also avoids the new one
      const grid = [['bean', null], [null, null]];
      expect(isValidPlacement('onion', 0, 1, grid)).toBe(false);
    });

    it('should return false when existing plant avoids new plant (reverse check)', () => {
      // Kale avoids tomato, but tomato does NOT avoid kale
      // So tomato is "compatible" with kale (first check passes)
      // But kale is NOT compatible with tomato (second check fails)
      // This tests the reverse compatibility check (line 54-55)
      const grid = [['kale', null], [null, null]];
      // Placing tomato next to kale should fail because kale avoids tomato
      expect(isValidPlacement('tomato', 0, 1, grid)).toBe(false);
    });
  });

  describe('countCompanionAdjacencies', () => {
    it('should return 0 for empty grid', () => {
      const grid = [[null, null], [null, null]];
      expect(countCompanionAdjacencies('tomato', 0, 0, grid)).toBe(0);
    });

    it('should count companion plants', () => {
      const grid = [['basil', null], [null, null]];
      expect(countCompanionAdjacencies('tomato', 0, 1, grid)).toBe(1);
    });

    it('should count multiple companions', () => {
      const grid = [
        ['basil', null, 'carrot'],
        [null, null, null],
        ['marigold', null, null]
      ];
      expect(countCompanionAdjacencies('tomato', 1, 1, grid)).toBe(3);
    });

    it('should return 0 for unknown plant', () => {
      const grid = [['basil', null], [null, null]];
      expect(countCompanionAdjacencies('unknown-plant', 0, 1, grid)).toBe(0);
    });

    it('should not count non-companion plants', () => {
      const grid = [['lettuce', null], [null, null]];
      expect(countCompanionAdjacencies('tomato', 0, 1, grid)).toBe(0);
    });
  });

  describe('getConstraintDifficulty', () => {
    it('should return number of enemies for known plant', () => {
      // Tomato avoids cabbage, broccoli, cauliflower, potato (4 enemies)
      expect(getConstraintDifficulty('tomato')).toBe(4);
    });

    it('should return 0 for plant with no enemies', () => {
      // Oregano has no avoidPlants
      expect(getConstraintDifficulty('oregano')).toBe(0);
    });

    it('should return 0 for unknown plant', () => {
      expect(getConstraintDifficulty('unknown-plant')).toBe(0);
    });
  });

  describe('sortByConstraintDifficulty', () => {
    it('should expand plant selections based on squaresPerPlant', () => {
      const selections = [{ plantId: 'tomato', quantity: 2 }];
      const sorted = sortByConstraintDifficulty(selections);
      expect(sorted).toHaveLength(2);
      expect(sorted.every(id => id === 'tomato')).toBe(true);
    });

    it('should sort plants with more enemies first', () => {
      const selections = [
        { plantId: 'oregano', quantity: 1 }, // 0 enemies
        { plantId: 'tomato', quantity: 1 }   // 4 enemies
      ];
      const sorted = sortByConstraintDifficulty(selections);
      expect(sorted[0]).toBe('tomato');
      expect(sorted[1]).toBe('oregano');
    });

    it('should handle unknown plants by filtering them out', () => {
      const selections = [{ plantId: 'unknown', quantity: 1 }];
      const sorted = sortByConstraintDifficulty(selections);
      // Unknown plants are filtered out (plant is undefined so squaresNeeded calculation is skipped)
      expect(sorted).toHaveLength(0);
    });

    it('should handle mix of known and unknown plants', () => {
      const selections = [
        { plantId: 'tomato', quantity: 1 },
        { plantId: 'unknown', quantity: 5 }  // Should be filtered
      ];
      const sorted = sortByConstraintDifficulty(selections);
      expect(sorted).toHaveLength(1);
      expect(sorted[0]).toBe('tomato');
    });

    it('should handle plants with fractional squaresPerPlant', () => {
      // Lettuce is 0.25 sq ft per plant, so 4 plants need 1 square
      const selections = [{ plantId: 'lettuce', quantity: 4 }];
      const sorted = sortByConstraintDifficulty(selections);
      expect(sorted).toHaveLength(1);
    });
  });

  describe('findBestPosition', () => {
    it('should find an empty position in the grid', () => {
      const grid = [[null, null], [null, null]];
      const locked = [[false, false], [false, false]];
      const position = findBestPosition('tomato', grid, locked);
      expect(position).not.toBe(null);
      expect(position.row).toBeGreaterThanOrEqual(0);
      expect(position.col).toBeGreaterThanOrEqual(0);
    });

    it('should skip occupied positions', () => {
      const grid = [['basil', null], [null, null]];
      const locked = [[false, false], [false, false]];
      const position = findBestPosition('tomato', grid, locked);
      expect(position).not.toEqual({ row: 0, col: 0 });
    });

    it('should skip locked positions', () => {
      const grid = [[null, null], [null, null]];
      const locked = [[true, false], [false, false]];
      const position = findBestPosition('tomato', grid, locked);
      expect(position).not.toEqual({ row: 0, col: 0 });
    });

    it('should prefer positions with companion plants', () => {
      const grid = [
        ['basil', null, null],
        [null, null, null],
        [null, null, null]
      ];
      const locked = [
        [false, false, false],
        [false, false, false],
        [false, false, false]
      ];
      const position = findBestPosition('tomato', grid, locked);
      // Should choose position adjacent to basil
      expect(
        (position.row === 0 && position.col === 1) ||
        (position.row === 1 && position.col === 0) ||
        (position.row === 1 && position.col === 1)
      ).toBe(true);
    });

    it('should return null when no valid position exists', () => {
      const grid = [['cabbage']];
      const locked = [[false]];
      const position = findBestPosition('tomato', grid, locked);
      expect(position).toBe(null);
    });

    it('should skip positions that would create enemy adjacencies', () => {
      const grid = [['cabbage', null]];
      const locked = [[false, false]];
      const position = findBestPosition('tomato', grid, locked);
      expect(position).toBe(null);
    });
  });

  describe('generateArrangement', () => {
    it('should generate a valid arrangement for simple case', () => {
      const result = generateArrangement({
        width: 2,
        height: 2,
        plantSelections: [{ plantId: 'tomato', quantity: 2 }]
      });

      expect(result.success).toBe(true);
      expect(result.grid).toHaveLength(2);
      expect(result.grid[0]).toHaveLength(2);
      expect(result.placements).toHaveLength(2);
      expect(result.unplacedPlants).toHaveLength(0);
    });

    it('should respect companion/enemy constraints', () => {
      const result = generateArrangement({
        width: 3,
        height: 3,
        plantSelections: [
          { plantId: 'tomato', quantity: 1 },
          { plantId: 'basil', quantity: 1 }
        ]
      });

      expect(result.success).toBe(true);
      const validation = validateArrangement(result.grid);
      expect(validation.valid).toBe(true);
    });

    it('should handle locked squares', () => {
      const lockedSquares = [
        [true, false],
        [false, false]
      ];

      const result = generateArrangement({
        width: 2,
        height: 2,
        plantSelections: [{ plantId: 'tomato', quantity: 1 }],
        lockedSquares
      });

      expect(result.success).toBe(true);
      expect(result.grid[0][0]).toBe(null);
    });

    it('should throw error for invalid dimensions', () => {
      expect(() => generateArrangement({
        width: 0,
        height: 2,
        plantSelections: []
      })).toThrow('Invalid bed dimensions');

      expect(() => generateArrangement({
        width: 2,
        height: 0,
        plantSelections: []
      })).toThrow('Invalid bed dimensions');

      expect(() => generateArrangement({
        width: null,
        height: 2,
        plantSelections: []
      })).toThrow('Invalid bed dimensions');
    });

    it('should throw error for invalid plant selections', () => {
      expect(() => generateArrangement({
        width: 2,
        height: 2,
        plantSelections: null
      })).toThrow('Plant selections must be an array');

      expect(() => generateArrangement({
        width: 2,
        height: 2,
        plantSelections: 'not an array'
      })).toThrow('Plant selections must be an array');
    });

    it('should throw error when plants exceed available space', () => {
      expect(() => generateArrangement({
        width: 2,
        height: 2,
        plantSelections: [{ plantId: 'tomato', quantity: 5 }]
      })).toThrow(/Not enough space/);
    });

    it('should throw error when enemies cannot be separated', () => {
      // Fill a 3x3 grid with tomatoes (9 total), then try to add cabbage (enemy)
      // All squares are filled with tomatoes, so cabbage cannot be placed anywhere
      expect(() => generateArrangement({
        width: 3,
        height: 3,
        plantSelections: [
          { plantId: 'tomato', quantity: 9 },
          { plantId: 'cabbage', quantity: 1 }
        ]
      })).toThrow(/Not enough space/);
    });

    it('should handle scenarios where arrangement is possible with spacing', () => {
      // In a 3x1 grid, tomato and potato can be placed at ends with empty middle
      const result = generateArrangement({
        width: 3,
        height: 1,
        plantSelections: [
          { plantId: 'tomato', quantity: 1 },
          { plantId: 'potato', quantity: 1 }  // Potato avoids tomato
        ]
      });
      // The algorithm should successfully place them with separation
      expect(result.success).toBe(true);
      const validation = validateArrangement(result.grid);
      expect(validation.valid).toBe(true);
    });

    it('should throw error when enemy plants cannot be separated in small grid', () => {
      // In a 1x2 grid, tomato and potato MUST be adjacent
      // This should throw since they avoid each other
      expect(() => generateArrangement({
        width: 1,
        height: 2,
        plantSelections: [
          { plantId: 'tomato', quantity: 1 },
          { plantId: 'potato', quantity: 1 }  // Potato avoids tomato and vice versa
        ]
      })).toThrow(/Could not place all plants/);
    });

    it('should include plant name in error message for known plants', () => {
      try {
        generateArrangement({
          width: 1,
          height: 2,
          plantSelections: [
            { plantId: 'tomato', quantity: 1 },
            { plantId: 'potato', quantity: 1 }
          ]
        });
        // If we get here, the test should fail
        expect(true).toBe(false);
      } catch (error) {
        // Error message should contain plant names
        expect(error.message).toContain('Potato');
      }
    });

    it('should handle empty plant selections', () => {
      const result = generateArrangement({
        width: 2,
        height: 2,
        plantSelections: []
      });

      expect(result.success).toBe(true);
      expect(result.placements).toHaveLength(0);
    });

    it('should successfully place compatible plants in small grid', () => {
      // Test placing compatible plants - should work fine
      const result = generateArrangement({
        width: 2,
        height: 2,
        plantSelections: [
          { plantId: 'tomato', quantity: 1 },
          { plantId: 'basil', quantity: 1 },
          { plantId: 'carrot', quantity: 1 }
        ]
      });

      expect(result.success).toBe(true);
      expect(result.placements).toHaveLength(3);
      // Verify no violations
      const validation = validateArrangement(result.grid);
      expect(validation.valid).toBe(true);
    });

    it('should handle complex placement with multiple constraint-heavy plants', () => {
      // Create a scenario with multiple constraint-heavy plants
      const result = generateArrangement({
        width: 4,
        height: 4,
        plantSelections: [
          { plantId: 'tomato', quantity: 2 },   // Avoids cabbage, broccoli, cauliflower, potato
          { plantId: 'cabbage', quantity: 2 },  // Avoids tomato, strawberry
          { plantId: 'basil', quantity: 2 },    // Avoids sage, rue
          { plantId: 'carrot', quantity: 2 }    // Avoids dill, parsnip
        ]
      });

      // Should successfully find an arrangement even with constraints
      expect(result.success).toBe(true);
      expect(result.placements.length).toBeGreaterThan(0);

      // Verify the arrangement is valid
      const validation = validateArrangement(result.grid);
      expect(validation.valid).toBe(true);
    });

    it('should use default locked squares when not provided', () => {
      const result = generateArrangement({
        width: 2,
        height: 2,
        plantSelections: [{ plantId: 'tomato', quantity: 1 }]
      });

      expect(result.success).toBe(true);
    });
  });

  describe('validateArrangement', () => {
    it('should return valid for arrangement with no violations', () => {
      const grid = [
        ['tomato', 'basil'],
        ['carrot', null]
      ];

      const result = validateArrangement(grid);
      expect(result.valid).toBe(true);
      expect(result.violations).toHaveLength(0);
    });

    it('should detect enemy adjacencies', () => {
      const grid = [
        ['tomato', 'cabbage'],
        [null, null]
      ];

      const result = validateArrangement(grid);
      expect(result.valid).toBe(false);
      expect(result.violations.length).toBeGreaterThan(0);
    });

    it('should detect diagonal enemy adjacencies', () => {
      const grid = [
        ['tomato', null],
        [null, 'cabbage']
      ];

      const result = validateArrangement(grid);
      expect(result.valid).toBe(false);
    });

    it('should handle empty grid', () => {
      const grid = [[null, null], [null, null]];
      const result = validateArrangement(grid);
      expect(result.valid).toBe(true);
    });

    it('should not duplicate violations', () => {
      const grid = [
        ['tomato', 'cabbage'],
        [null, null]
      ];

      const result = validateArrangement(grid);
      // Should only report the violation once, not from both directions
      expect(result.violations.length).toBe(1);
    });
  });

  describe('getArrangementStats', () => {
    it('should calculate correct statistics', () => {
      const grid = [
        ['tomato', 'basil'],
        ['carrot', null]
      ];

      const stats = getArrangementStats(grid);
      expect(stats.totalSquares).toBe(4);
      expect(stats.filledSquares).toBe(3);
      expect(stats.emptySquares).toBe(1);
      expect(stats.uniquePlants).toBe(3);
    });

    it('should count companion adjacencies correctly', () => {
      const grid = [
        ['tomato', 'basil'],
        [null, null]
      ];

      const stats = getArrangementStats(grid);
      // tomato and basil are companions
      expect(stats.companionAdjacencies).toBe(1);
    });

    it('should handle empty grid', () => {
      const grid = [[null, null], [null, null]];
      const stats = getArrangementStats(grid);
      expect(stats.filledSquares).toBe(0);
      expect(stats.uniquePlants).toBe(0);
      expect(stats.companionAdjacencies).toBe(0);
    });

    it('should count same plant multiple times in filled squares', () => {
      const grid = [
        ['tomato', 'tomato'],
        ['tomato', null]
      ];

      const stats = getArrangementStats(grid);
      expect(stats.filledSquares).toBe(3);
      expect(stats.uniquePlants).toBe(1);
    });
  });
});
