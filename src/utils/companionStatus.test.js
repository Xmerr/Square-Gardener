import { describe, it, expect } from 'vitest';
import { getSquareCompanionStatus } from './companionStatus';

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
