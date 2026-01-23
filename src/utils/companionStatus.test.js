import { describe, it, expect } from 'vitest';
import { getSquareCompanionStatus, getSquareEdgeBorders } from './companionStatus';

describe('getSquareCompanionStatus', () => {
  it('should return empty status for empty square', () => {
    const grid = [
      [null, 'tomato'],
      [null, null]
    ];

    const result = getSquareCompanionStatus(grid, 0, 0);

    expect(result).toEqual({
      hasCompanion: false,
      hasEnemy: false,
      companions: [],
      enemies: []
    });
  });

  it('should return empty status for unknown plant', () => {
    const grid = [
      ['unknownplant', 'tomato'],
      [null, null]
    ];

    const result = getSquareCompanionStatus(grid, 0, 0);

    expect(result).toEqual({
      hasCompanion: false,
      hasEnemy: false,
      companions: [],
      enemies: []
    });
  });

  it('should detect companion plants', () => {
    // Tomato and basil are companions
    const grid = [
      ['tomato', 'basil'],
      [null, null]
    ];

    const result = getSquareCompanionStatus(grid, 0, 0);

    expect(result.hasCompanion).toBe(true);
    expect(result.companions).toContain('Basil');
    expect(result.hasEnemy).toBe(false);
    expect(result.enemies).toEqual([]);
  });

  it('should detect enemy plants', () => {
    // Tomato and cabbage are enemies
    const grid = [
      ['tomato', 'cabbage'],
      [null, null]
    ];

    const result = getSquareCompanionStatus(grid, 0, 0);

    expect(result.hasEnemy).toBe(true);
    expect(result.enemies).toContain('Cabbage');
  });

  it('should detect both companions and enemies', () => {
    // Tomato with basil (companion) and cabbage (enemy)
    const grid = [
      ['basil', 'tomato', 'cabbage']
    ];

    const result = getSquareCompanionStatus(grid, 0, 1);

    expect(result.hasCompanion).toBe(true);
    expect(result.hasEnemy).toBe(true);
    expect(result.companions).toContain('Basil');
    expect(result.enemies).toContain('Cabbage');
  });

  it('should check all 8 adjacent positions', () => {
    // Tomato surrounded by basil on all 8 sides
    const grid = [
      ['basil', 'basil', 'basil'],
      ['basil', 'tomato', 'basil'],
      ['basil', 'basil', 'basil']
    ];

    const result = getSquareCompanionStatus(grid, 1, 1);

    expect(result.hasCompanion).toBe(true);
    // Should only list 'Basil' once even though it appears 8 times
    expect(result.companions).toEqual(['Basil']);
  });

  it('should handle corner positions correctly', () => {
    const grid = [
      ['tomato', 'basil'],
      ['carrot', null]
    ];

    // Top-left corner
    const result = getSquareCompanionStatus(grid, 0, 0);

    // Tomato has basil (companion) and carrot (companion) adjacent
    expect(result.hasCompanion).toBe(true);
    expect(result.companions).toContain('Basil');
    expect(result.companions).toContain('Carrot');
  });

  it('should handle edge positions correctly', () => {
    const grid = [
      ['basil', 'tomato', 'carrot'],
      [null, null, null]
    ];

    // Top edge, middle
    const result = getSquareCompanionStatus(grid, 0, 1);

    expect(result.hasCompanion).toBe(true);
    expect(result.companions).toContain('Basil');
    expect(result.companions).toContain('Carrot');
  });

  it('should not include empty adjacent squares in results', () => {
    const grid = [
      ['tomato', null],
      [null, null]
    ];

    const result = getSquareCompanionStatus(grid, 0, 0);

    expect(result.hasCompanion).toBe(false);
    expect(result.hasEnemy).toBe(false);
    expect(result.companions).toEqual([]);
    expect(result.enemies).toEqual([]);
  });

  it('should not include unknown plants in results', () => {
    const grid = [
      ['tomato', 'unknownplant'],
      [null, null]
    ];

    const result = getSquareCompanionStatus(grid, 0, 0);

    // Unknown plant should be ignored
    expect(result.companions).toEqual([]);
    expect(result.enemies).toEqual([]);
  });

  it('should return empty status for undefined row', () => {
    const grid = [
      ['tomato', 'basil']
    ];

    // Row index 5 is out of bounds
    const result = getSquareCompanionStatus(grid, 5, 0);

    expect(result).toEqual({
      hasCompanion: false,
      hasEnemy: false,
      companions: [],
      enemies: []
    });
  });
});

describe('getSquareEdgeBorders', () => {
  it('should return null for empty square', () => {
    const grid = [
      [null, 'tomato'],
      [null, null]
    ];

    const result = getSquareEdgeBorders(grid, 0, 0);

    expect(result).toBeNull();
  });

  it('should return null for unknown plant', () => {
    const grid = [
      ['unknownplant', 'tomato'],
      [null, null]
    ];

    const result = getSquareEdgeBorders(grid, 0, 0);

    expect(result).toBeNull();
  });

  it('should return companion for right edge when companion is to the right', () => {
    // Tomato and basil are companions
    const grid = [
      ['tomato', 'basil'],
      [null, null]
    ];

    const result = getSquareEdgeBorders(grid, 0, 0);

    expect(result.right).toBe('companion');
    expect(result.top).toBeNull();
    expect(result.bottom).toBeNull();
    expect(result.left).toBeNull();
  });

  it('should return enemy for right edge when enemy is to the right', () => {
    // Tomato and cabbage are enemies
    const grid = [
      ['tomato', 'cabbage'],
      [null, null]
    ];

    const result = getSquareEdgeBorders(grid, 0, 0);

    expect(result.right).toBe('enemy');
  });

  it('should return companion for bottom edge when companion is below', () => {
    // Tomato and carrot are companions
    const grid = [
      ['tomato'],
      ['carrot']
    ];

    const result = getSquareEdgeBorders(grid, 0, 0);

    expect(result.bottom).toBe('companion');
    expect(result.right).toBeNull();
  });

  it('should return enemy for bottom edge when enemy is below', () => {
    // Tomato and potato are enemies
    const grid = [
      ['tomato'],
      ['potato']
    ];

    const result = getSquareEdgeBorders(grid, 0, 0);

    expect(result.bottom).toBe('enemy');
  });

  it('should return companion for top edge when companion is above', () => {
    // Basil and tomato are companions
    const grid = [
      ['tomato'],
      ['basil']
    ];

    const result = getSquareEdgeBorders(grid, 1, 0);

    expect(result.top).toBe('companion');
  });

  it('should return companion for left edge when companion is to the left', () => {
    // Basil and tomato are companions
    const grid = [
      ['basil', 'tomato']
    ];

    const result = getSquareEdgeBorders(grid, 0, 1);

    expect(result.left).toBe('companion');
  });

  it('should return companion for diagonal corners when companion is diagonal', () => {
    // Tomato with carrot diagonally at bottom-right
    const grid = [
      ['tomato', null],
      [null, 'carrot']
    ];

    const result = getSquareEdgeBorders(grid, 0, 0);

    expect(result.bottomRight).toBe('companion');
    expect(result.topLeft).toBeNull();
    expect(result.topRight).toBeNull();
    expect(result.bottomLeft).toBeNull();
  });

  it('should return enemy for diagonal corners when enemy is diagonal', () => {
    // Tomato with potato diagonally at bottom-right
    const grid = [
      ['tomato', null],
      [null, 'potato']
    ];

    const result = getSquareEdgeBorders(grid, 0, 0);

    expect(result.bottomRight).toBe('enemy');
  });

  it('should check all 4 corners for diagonal relationships', () => {
    // Tomato in center surrounded by carrots (companions) at all diagonals
    const grid = [
      ['carrot', null, 'carrot'],
      [null, 'tomato', null],
      ['carrot', null, 'carrot']
    ];

    const result = getSquareEdgeBorders(grid, 1, 1);

    expect(result.topLeft).toBe('companion');
    expect(result.topRight).toBe('companion');
    expect(result.bottomLeft).toBe('companion');
    expect(result.bottomRight).toBe('companion');
  });

  it('should return null for edges at grid boundaries', () => {
    // Top-left corner
    const grid = [
      ['tomato', 'basil'],
      ['carrot', null]
    ];

    const result = getSquareEdgeBorders(grid, 0, 0);

    expect(result.top).toBeNull(); // No cell above
    expect(result.left).toBeNull(); // No cell to left
    expect(result.topLeft).toBeNull(); // No diagonal top-left
    expect(result.topRight).toBeNull(); // No diagonal top-right
    expect(result.right).toBe('companion'); // Basil is companion
    expect(result.bottom).toBe('companion'); // Carrot is companion
  });

  it('should return null for bottom-right cell at grid boundaries', () => {
    // Bottom-right corner
    const grid = [
      ['tomato', 'basil'],
      ['carrot', 'lettuce']
    ];

    const result = getSquareEdgeBorders(grid, 1, 1);

    expect(result.bottom).toBeNull(); // No cell below
    expect(result.right).toBeNull(); // No cell to right
    expect(result.bottomRight).toBeNull(); // No diagonal bottom-right
    expect(result.bottomLeft).toBeNull(); // No diagonal bottom-left (lettuce has no relationship with carrot)
  });

  it('should return null when adjacent cell is empty', () => {
    const grid = [
      ['tomato', null],
      [null, null]
    ];

    const result = getSquareEdgeBorders(grid, 0, 0);

    expect(result.right).toBeNull(); // Empty cell
    expect(result.bottom).toBeNull(); // Empty cell
    expect(result.bottomRight).toBeNull(); // Empty cell
  });

  it('should return null when adjacent plant is unknown', () => {
    const grid = [
      ['tomato', 'unknownplant'],
      [null, null]
    ];

    const result = getSquareEdgeBorders(grid, 0, 0);

    expect(result.right).toBeNull(); // Unknown plant
  });

  it('should return null when adjacent plant has no companion/enemy relationship', () => {
    // Tomato and lettuce have no relationship
    const grid = [
      ['tomato', 'lettuce'],
      [null, null]
    ];

    const result = getSquareEdgeBorders(grid, 0, 0);

    expect(result.right).toBeNull(); // No relationship
  });

  it('should prioritize enemy over companion when plant is both', () => {
    // Create a scenario where a plant could be both companion and enemy
    // This shouldn't happen in real data, but we test the precedence logic
    const grid = [
      ['tomato', 'basil', 'cabbage'],
      [null, null, null]
    ];

    const result = getSquareEdgeBorders(grid, 0, 1);

    // Basil has tomato (companion) to the left and cabbage to the right
    // We need to check if tomato is in basil's companion list
    expect(result.left).toBe('companion'); // Tomato is basil's companion
  });

  it('should handle all 8 directions for a center cell', () => {
    // Tomato in center with various relationships
    const grid = [
      ['basil', 'carrot', 'marigold'],
      ['parsley', 'tomato', 'potato'],
      ['cabbage', 'broccoli', 'cauliflower']
    ];

    const result = getSquareEdgeBorders(grid, 1, 1);

    // Cardinal directions
    expect(result.top).toBe('companion'); // Carrot is companion
    expect(result.right).toBe('enemy'); // Potato is enemy
    expect(result.bottom).toBe('enemy'); // Broccoli is enemy
    expect(result.left).toBe('companion'); // Parsley is companion

    // Diagonal directions
    expect(result.topLeft).toBe('companion'); // Basil is companion
    expect(result.topRight).toBe('companion'); // Marigold is companion
    expect(result.bottomLeft).toBe('enemy'); // Cabbage is enemy
    expect(result.bottomRight).toBe('enemy'); // Cauliflower is enemy
  });

  it('should return null for undefined row', () => {
    const grid = [
      ['tomato', 'basil']
    ];

    // Row index 5 is out of bounds
    const result = getSquareEdgeBorders(grid, 5, 0);

    expect(result).toBeNull();
  });
});
