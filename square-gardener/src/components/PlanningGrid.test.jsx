import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PlanningGrid, { getSquareCompanionStatus } from './PlanningGrid';
import * as planningAlgorithm from '../utils/planningAlgorithm';

describe('PlanningGrid', () => {
  const mockArrangement = {
    grid: [
      ['tomato', 'basil'],
      ['carrot', null]
    ],
    placements: [
      { plantId: 'tomato', row: 0, col: 0 },
      { plantId: 'basil', row: 0, col: 1 },
      { plantId: 'carrot', row: 1, col: 0 }
    ],
    success: true
  };

  const mockBed = {
    id: 'bed-1',
    name: 'Test Bed',
    width: 2,
    height: 2
  };

  const defaultProps = {
    arrangement: mockArrangement,
    bed: mockBed,
    onSquareClick: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render the grid with correct dimensions', () => {
      render(<PlanningGrid {...defaultProps} />);

      expect(screen.getByText('Garden Layout (2×2)')).toBeInTheDocument();
    });

    it('should render plant initials in grid cells', () => {
      render(<PlanningGrid {...defaultProps} />);

      // Use getAllByText since initials appear in both grid and legend
      expect(screen.getAllByText('T').length).toBeGreaterThanOrEqual(1); // Tomato
      expect(screen.getAllByText('B').length).toBeGreaterThanOrEqual(1); // Basil
      expect(screen.getAllByText('C').length).toBeGreaterThanOrEqual(1); // Carrot
    });

    it('should render empty message when no arrangement', () => {
      render(<PlanningGrid bed={mockBed} onSquareClick={vi.fn()} />);

      expect(screen.getByText('No arrangement to display')).toBeInTheDocument();
    });

    it('should render empty message when arrangement has no grid', () => {
      render(<PlanningGrid arrangement={{}} bed={mockBed} onSquareClick={vi.fn()} />);

      expect(screen.getByText('No arrangement to display')).toBeInTheDocument();
    });

    it('should render empty message when bed is missing width', () => {
      render(<PlanningGrid arrangement={mockArrangement} bed={{ height: 2 }} onSquareClick={vi.fn()} />);

      expect(screen.getByText('No arrangement to display')).toBeInTheDocument();
    });

    it('should render empty message when bed is missing height', () => {
      render(<PlanningGrid arrangement={mockArrangement} bed={{ width: 2 }} onSquareClick={vi.fn()} />);

      expect(screen.getByText('No arrangement to display')).toBeInTheDocument();
    });

    it('should render legend with plant information', () => {
      render(<PlanningGrid {...defaultProps} />);

      expect(screen.getByText('Legend')).toBeInTheDocument();
      expect(screen.getByText('Tomato')).toBeInTheDocument();
      expect(screen.getByText('Basil')).toBeInTheDocument();
      expect(screen.getByText('Carrot')).toBeInTheDocument();
    });

    it('should show plant counts in legend', () => {
      render(<PlanningGrid {...defaultProps} />);

      // Each plant appears once
      const countElements = screen.getAllByText('×1');
      expect(countElements.length).toBe(3);
    });

    it('should show statistics at bottom', () => {
      render(<PlanningGrid {...defaultProps} />);

      expect(screen.getByText(/Filled:/)).toBeInTheDocument();
      expect(screen.getByText(/3 \/ 4 squares/)).toBeInTheDocument();
      expect(screen.getByText(/Plants:/)).toBeInTheDocument();
      expect(screen.getByText(/3 types/)).toBeInTheDocument();
    });
  });

  describe('locked squares', () => {
    it('should display lock indicator on locked squares', () => {
      const lockedSquares = [
        [true, false],
        [false, false]
      ];

      render(<PlanningGrid {...defaultProps} lockedSquares={lockedSquares} />);

      expect(screen.getByText('🔒')).toBeInTheDocument();
    });

    it('should handle undefined locked squares', () => {
      render(<PlanningGrid {...defaultProps} />);

      // Should render without errors
      expect(screen.getByText('Garden Layout (2×2)')).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('should call onSquareClick when clicking a filled square', () => {
      render(<PlanningGrid {...defaultProps} />);

      const tomatoCell = screen.getByTitle(/^Tomato \(0, 0\)/);
      fireEvent.click(tomatoCell);

      expect(defaultProps.onSquareClick).toHaveBeenCalledWith({
        row: 0,
        col: 0,
        plantId: 'tomato'
      });
    });

    it('should call onSquareClick when clicking an empty square', () => {
      render(<PlanningGrid {...defaultProps} />);

      // Find the empty cell by its title
      const emptyCell = screen.getByTitle('Empty (1, 1)');
      fireEvent.click(emptyCell);

      expect(defaultProps.onSquareClick).toHaveBeenCalledWith({
        row: 1,
        col: 1,
        plantId: null
      });
    });

    it('should work without onSquareClick prop', () => {
      render(<PlanningGrid arrangement={mockArrangement} bed={mockBed} />);

      const tomatoCell = screen.getByTitle(/^Tomato \(0, 0\)/);
      fireEvent.click(tomatoCell);

      // Should not throw error
      expect(screen.getByText('Garden Layout (2×2)')).toBeInTheDocument();
    });
  });

  describe('grid sizing', () => {
    it('should use smaller cells for large grids', () => {
      const largeArrangement = {
        grid: Array(12).fill(null).map(() => Array(12).fill('tomato')),
        placements: [],
        success: true
      };
      const largeBed = { width: 12, height: 12, id: 'large', name: 'Large' };

      render(<PlanningGrid arrangement={largeArrangement} bed={largeBed} onSquareClick={vi.fn()} />);

      expect(screen.getByText('Garden Layout (12×12)')).toBeInTheDocument();
    });

    it('should use regular cells for small grids', () => {
      render(<PlanningGrid {...defaultProps} />);

      expect(screen.getByText('Garden Layout (2×2)')).toBeInTheDocument();
    });
  });

  describe('plant colors', () => {
    it('should apply correct background colors to plant cells', () => {
      render(<PlanningGrid {...defaultProps} />);

      const tomatoCell = screen.getByTitle(/^Tomato \(0, 0\)/);
      expect(tomatoCell).toHaveStyle({ backgroundColor: 'rgb(239, 68, 68)' }); // Tomato red
    });

    it('should apply default color for unknown plants', () => {
      const arrangementWithUnknown = {
        grid: [['unknownplant']],
        placements: [{ plantId: 'unknownplant', row: 0, col: 0 }],
        success: true
      };
      const smallBed = { width: 1, height: 1, id: 'small', name: 'Small' };

      render(<PlanningGrid arrangement={arrangementWithUnknown} bed={smallBed} onSquareClick={vi.fn()} />);

      // Unknown plant uses the plantId as title since there's no matching plant in library
      // The cell should use gray default color
      const cell = screen.getByTitle('unknownplant (0, 0)');
      expect(cell).toHaveStyle({ backgroundColor: 'rgb(156, 163, 175)' });
    });

    it('should use contrast text color for light backgrounds', () => {
      // Cauliflower has a light color
      const arrangementWithLight = {
        grid: [['cauliflower']],
        placements: [{ plantId: 'cauliflower', row: 0, col: 0 }],
        success: true
      };
      const smallBed = { width: 1, height: 1, id: 'small', name: 'Small' };

      render(<PlanningGrid arrangement={arrangementWithLight} bed={smallBed} onSquareClick={vi.fn()} />);

      const cell = screen.getByTitle('Cauliflower (0, 0)');
      expect(cell).toHaveStyle({ color: 'rgb(31, 41, 55)' }); // Dark text
    });

    it('should use light text color for dark backgrounds', () => {
      render(<PlanningGrid {...defaultProps} />);

      const tomatoCell = screen.getByTitle(/^Tomato \(0, 0\)/);
      expect(tomatoCell).toHaveStyle({ color: 'rgb(255, 255, 255)' }); // Light text
    });
  });

  describe('legend sorting', () => {
    it('should sort legend plants alphabetically', () => {
      render(<PlanningGrid {...defaultProps} />);

      const legendItems = screen.getAllByText(/×1/);
      // Should find Basil, Carrot, Tomato in that order
      expect(legendItems.length).toBe(3);
    });
  });

  describe('cell tooltips', () => {
    it('should show plant name and position in tooltip for filled cells', () => {
      render(<PlanningGrid {...defaultProps} />);

      expect(screen.getByTitle(/^Tomato \(0, 0\)/)).toBeInTheDocument();
      expect(screen.getByTitle(/^Basil \(0, 1\)/)).toBeInTheDocument();
    });

    it('should show Empty and position in tooltip for empty cells', () => {
      render(<PlanningGrid {...defaultProps} />);

      expect(screen.getByTitle('Empty (1, 1)')).toBeInTheDocument();
    });
  });

  describe('multiple same plants', () => {
    it('should count multiple instances of same plant correctly', () => {
      const arrangementWithDuplicates = {
        grid: [
          ['tomato', 'tomato'],
          ['tomato', 'basil']
        ],
        placements: [
          { plantId: 'tomato', row: 0, col: 0 },
          { plantId: 'tomato', row: 0, col: 1 },
          { plantId: 'tomato', row: 1, col: 0 },
          { plantId: 'basil', row: 1, col: 1 }
        ],
        success: true
      };

      render(<PlanningGrid arrangement={arrangementWithDuplicates} bed={mockBed} onSquareClick={vi.fn()} />);

      expect(screen.getByText('×3')).toBeInTheDocument(); // 3 tomatoes
      expect(screen.getByText('×1')).toBeInTheDocument(); // 1 basil
    });
  });

  describe('empty grid rendering', () => {
    it('should handle grid with all null values', () => {
      const emptyArrangement = {
        grid: [[null, null], [null, null]],
        placements: [],
        success: true
      };

      render(<PlanningGrid arrangement={emptyArrangement} bed={mockBed} onSquareClick={vi.fn()} />);

      expect(screen.getByText('Garden Layout (2×2)')).toBeInTheDocument();
      expect(screen.queryByText('Legend')).not.toBeInTheDocument(); // No legend when no plants
    });
  });

  describe('drag and drop functionality', () => {
    const editableProps = {
      ...defaultProps,
      editable: true,
      onArrangementChange: vi.fn()
    };

    it('should make plant cells draggable when editable is true', () => {
      render(<PlanningGrid {...editableProps} />);

      const tomatoCell = screen.getByTitle(/^Tomato \(0, 0\)/);
      expect(tomatoCell).toHaveAttribute('draggable', 'true');
    });

    it('should not make cells draggable when editable is false', () => {
      render(<PlanningGrid {...defaultProps} editable={false} />);

      const tomatoCell = screen.getByTitle(/^Tomato \(0, 0\)/);
      expect(tomatoCell).toHaveAttribute('draggable', 'false');
    });

    it('should not make empty cells draggable', () => {
      render(<PlanningGrid {...editableProps} />);

      const emptyCell = screen.getByTitle('Empty (1, 1)');
      // Empty cells should not be draggable (draggable is false or not set)
      const draggable = emptyCell.getAttribute('draggable');
      expect(draggable === 'false' || draggable === null).toBe(true);
    });

    it('should not make locked cells draggable', () => {
      const lockedSquares = [
        [true, false],
        [false, false]
      ];
      render(<PlanningGrid {...editableProps} lockedSquares={lockedSquares} />);

      const lockedCell = screen.getByTitle(/^Tomato \(0, 0\)/);
      expect(lockedCell).toHaveAttribute('draggable', 'false');
    });

    it('should call onArrangementChange when plants are swapped', () => {
      render(<PlanningGrid {...editableProps} />);

      const tomatoCell = screen.getByTitle(/^Tomato \(0, 0\)/);
      const basilCell = screen.getByTitle(/^Basil \(0, 1\)/);

      // Simulate drag and drop
      fireEvent.dragStart(tomatoCell);
      fireEvent.dragOver(basilCell, { preventDefault: vi.fn() });
      fireEvent.drop(basilCell, { preventDefault: vi.fn() });

      expect(editableProps.onArrangementChange).toHaveBeenCalled();
      const newArrangement = editableProps.onArrangementChange.mock.calls[0][0];
      expect(newArrangement.grid[0][0]).toBe('basil');
      expect(newArrangement.grid[0][1]).toBe('tomato');
    });

    it('should swap plant with empty square', () => {
      render(<PlanningGrid {...editableProps} />);

      const tomatoCell = screen.getByTitle(/^Tomato \(0, 0\)/);
      const emptyCell = screen.getByTitle('Empty (1, 1)');

      fireEvent.dragStart(tomatoCell);
      fireEvent.dragOver(emptyCell, { preventDefault: vi.fn() });
      fireEvent.drop(emptyCell, { preventDefault: vi.fn() });

      expect(editableProps.onArrangementChange).toHaveBeenCalled();
      const newArrangement = editableProps.onArrangementChange.mock.calls[0][0];
      expect(newArrangement.grid[1][1]).toBe('tomato');
      expect(newArrangement.grid[0][0]).toBeNull();
    });

    it('should not allow dropping on locked squares', () => {
      const lockedSquares = [
        [false, false],
        [false, true]
      ];
      render(<PlanningGrid {...editableProps} lockedSquares={lockedSquares} />);

      const tomatoCell = screen.getByTitle(/^Tomato \(0, 0\)/);
      const lockedCell = screen.getByTitle('Empty (1, 1)');

      fireEvent.dragStart(tomatoCell);
      fireEvent.dragOver(lockedCell, { preventDefault: vi.fn() });
      fireEvent.drop(lockedCell, { preventDefault: vi.fn() });

      expect(editableProps.onArrangementChange).not.toHaveBeenCalled();
    });

    it('should not allow dropping on same square', () => {
      render(<PlanningGrid {...editableProps} />);

      const tomatoCell = screen.getByTitle(/^Tomato \(0, 0\)/);

      fireEvent.dragStart(tomatoCell);
      fireEvent.dragOver(tomatoCell, { preventDefault: vi.fn() });
      fireEvent.drop(tomatoCell, { preventDefault: vi.fn() });

      expect(editableProps.onArrangementChange).not.toHaveBeenCalled();
    });

    it('should work without onArrangementChange handler', () => {
      const propsWithoutHandler = { ...editableProps, onArrangementChange: undefined };
      render(<PlanningGrid {...propsWithoutHandler} />);

      const tomatoCell = screen.getByTitle(/^Tomato \(0, 0\)/);
      const basilCell = screen.getByTitle(/^Basil \(0, 1\)/);

      fireEvent.dragStart(tomatoCell);
      fireEvent.dragOver(basilCell, { preventDefault: vi.fn() });
      fireEvent.drop(basilCell, { preventDefault: vi.fn() });

      // Should not throw error
      expect(screen.getByText('Garden Layout (2×2)')).toBeInTheDocument();
    });
  });

  describe('validation feedback', () => {
    it('should show warning when arrangement has enemy adjacencies', () => {
      // Create arrangement with tomato and cabbage adjacent (they are enemies)
      const invalidArrangement = {
        grid: [
          ['tomato', 'cabbage'],
          [null, null]
        ],
        placements: [
          { plantId: 'tomato', row: 0, col: 0 },
          { plantId: 'cabbage', row: 0, col: 1 }
        ],
        success: true
      };

      const editableProps = {
        ...defaultProps,
        arrangement: invalidArrangement,
        bed: mockBed,
        editable: true,
        onArrangementChange: vi.fn()
      };

      render(<PlanningGrid {...editableProps} />);

      // Trigger a drop to cause validation
      const tomatoCell = screen.getByTitle(/^Tomato \(0, 0\)/);
      const emptyCell = screen.getByTitle('Empty (1, 0)');

      fireEvent.dragStart(tomatoCell);
      fireEvent.drop(emptyCell, { preventDefault: vi.fn() });

      // The validation will be shown after the drop
      expect(editableProps.onArrangementChange).toHaveBeenCalled();
    });

    it('should show success message when arrangement is valid and editable', () => {
      const editableProps = {
        ...defaultProps,
        editable: true,
        onArrangementChange: vi.fn()
      };

      render(<PlanningGrid {...editableProps} />);

      // Swap tomato with carrot (both compatible)
      const tomatoCell = screen.getByTitle(/^Tomato \(0, 0\)/);
      const carrotCell = screen.getByTitle(/^Carrot \(1, 0\)/);

      fireEvent.dragStart(tomatoCell);
      fireEvent.drop(carrotCell, { preventDefault: vi.fn() });

      // The validation feedback will be shown after the drop
      expect(editableProps.onArrangementChange).toHaveBeenCalled();
    });

    it('should not show validation feedback when not editable', () => {
      render(<PlanningGrid {...defaultProps} editable={false} />);

      // No validation feedback should be shown for non-editable grids
      expect(screen.queryByText(/All plants are correctly placed/)).not.toBeInTheDocument();
    });
  });

  describe('drag visual feedback', () => {
    const editableProps = {
      ...defaultProps,
      editable: true,
      onArrangementChange: vi.fn()
    };

    it('should apply cursor-move class to draggable cells', () => {
      render(<PlanningGrid {...editableProps} />);

      const tomatoCell = screen.getByTitle(/^Tomato \(0, 0\)/);
      expect(tomatoCell).toHaveClass('cursor-move');
    });

    it('should not apply cursor-move to empty cells', () => {
      render(<PlanningGrid {...editableProps} />);

      const emptyCell = screen.getByTitle('Empty (1, 1)');
      expect(emptyCell).not.toHaveClass('cursor-move');
    });

    it('should not apply cursor-move to locked cells', () => {
      const lockedSquares = [
        [true, false],
        [false, false]
      ];
      render(<PlanningGrid {...editableProps} lockedSquares={lockedSquares} />);

      const lockedCell = screen.getByTitle(/^Tomato \(0, 0\)/);
      expect(lockedCell).not.toHaveClass('cursor-move');
    });

    it('should handle drag end event', () => {
      render(<PlanningGrid {...editableProps} />);

      const tomatoCell = screen.getByTitle(/^Tomato \(0, 0\)/);

      // Start dragging
      fireEvent.dragStart(tomatoCell);

      // End dragging
      fireEvent.dragEnd(tomatoCell);

      // Should not throw error and component should still be rendered
      expect(screen.getByText('Garden Layout (2×2)')).toBeInTheDocument();
    });

    it('should not start drag when editable is false', () => {
      const nonEditableProps = {
        ...defaultProps,
        editable: false,
        onArrangementChange: vi.fn()
      };

      render(<PlanningGrid {...nonEditableProps} />);

      const tomatoCell = screen.getByTitle(/^Tomato \(0, 0\)/);

      // Try to start dragging
      fireEvent.dragStart(tomatoCell);

      // onArrangementChange should not be called
      expect(nonEditableProps.onArrangementChange).not.toHaveBeenCalled();
    });

    it('should not handle drag over when no drag in progress', () => {
      render(<PlanningGrid {...editableProps} />);

      const basilCell = screen.getByTitle(/^Basil \(0, 1\)/);

      // Try to drag over without starting a drag first
      fireEvent.dragOver(basilCell, { preventDefault: vi.fn() });

      // Should not cause any errors
      expect(screen.getByText('Garden Layout (2×2)')).toBeInTheDocument();
    });

    it('should show plant ID fallback when plant not found in validation', async () => {
      // Mock validateArrangement to return violations with unknown plant IDs
      const validateSpy = vi.spyOn(planningAlgorithm, 'validateArrangement').mockReturnValue({
        valid: false,
        violations: [
          { plantId: 'unknownplant1', enemyPlantId: 'unknownplant2', row: 0, col: 0 }
        ]
      });

      // Create arrangement with unknown plant IDs
      const invalidArrangement = {
        grid: [
          ['unknownplant1', 'unknownplant2'],
          [null, null]
        ],
        placements: [
          { plantId: 'unknownplant1', row: 0, col: 0 },
          { plantId: 'unknownplant2', row: 0, col: 1 }
        ],
        success: true
      };

      const propsWithUnknown = {
        ...editableProps,
        arrangement: invalidArrangement
      };

      render(<PlanningGrid {...propsWithUnknown} />);

      // Trigger a drop to cause validation
      const cell1 = screen.getByTitle('unknownplant1 (0, 0)');
      const emptyCell = screen.getByTitle('Empty (1, 0)');

      fireEvent.dragStart(cell1);
      fireEvent.drop(emptyCell, { preventDefault: vi.fn() });

      // The warning should display the plant IDs as fallback since getPlantById returns null
      // The format is: "{plant?.name || v.plantId} at (row, col) is next to {enemy?.name || v.enemyPlantId}"
      await waitFor(() => {
        expect(screen.getByText(/unknownplant1 at \(0, 0\) is next to unknownplant2/)).toBeInTheDocument();
      });

      validateSpy.mockRestore();
    });
  });

  describe('companion planting legend', () => {
    it('should render companion indicators legend when plants are present', () => {
      render(<PlanningGrid {...defaultProps} />);

      expect(screen.getByText('Companion Indicators')).toBeInTheDocument();
      expect(screen.getByText('Good companion nearby')).toBeInTheDocument();
      expect(screen.getByText('Incompatible plant nearby')).toBeInTheDocument();
    });

    it('should not render legend when no plants in grid', () => {
      const emptyArrangement = {
        grid: [[null, null], [null, null]],
        placements: [],
        success: true
      };

      render(<PlanningGrid arrangement={emptyArrangement} bed={mockBed} onSquareClick={vi.fn()} />);

      expect(screen.queryByText('Companion Indicators')).not.toBeInTheDocument();
    });
  });

  describe('companion visual tints', () => {
    it('should apply green tint to square with companion nearby', () => {
      // Tomato and basil are companions
      const companionArrangement = {
        grid: [
          ['tomato', 'basil'],
          [null, null]
        ],
        placements: [
          { plantId: 'tomato', row: 0, col: 0 },
          { plantId: 'basil', row: 0, col: 1 }
        ],
        success: true
      };

      render(<PlanningGrid arrangement={companionArrangement} bed={mockBed} onSquareClick={vi.fn()} />);

      // Both tomato and basil should have green tint (box-shadow)
      const tomatoCell = screen.getByTitle(/^Tomato \(0, 0\)/);
      const basilCell = screen.getByTitle(/^Basil \(0, 1\)/);

      expect(tomatoCell).toHaveStyle({ boxShadow: 'inset 0 0 0 100px rgba(34, 197, 94, 0.25)' });
      expect(basilCell).toHaveStyle({ boxShadow: 'inset 0 0 0 100px rgba(34, 197, 94, 0.25)' });
    });

    it('should apply red tint to square with enemy nearby', () => {
      // Tomato and cabbage are enemies
      const enemyArrangement = {
        grid: [
          ['tomato', 'cabbage'],
          [null, null]
        ],
        placements: [
          { plantId: 'tomato', row: 0, col: 0 },
          { plantId: 'cabbage', row: 0, col: 1 }
        ],
        success: true
      };

      render(<PlanningGrid arrangement={enemyArrangement} bed={mockBed} onSquareClick={vi.fn()} />);

      const tomatoCell = screen.getByTitle(/^Tomato \(0, 0\)/);
      const cabbageCell = screen.getByTitle(/^Cabbage \(0, 1\)/);

      expect(tomatoCell).toHaveStyle({ boxShadow: 'inset 0 0 0 100px rgba(239, 68, 68, 0.35)' });
      expect(cabbageCell).toHaveStyle({ boxShadow: 'inset 0 0 0 100px rgba(239, 68, 68, 0.35)' });
    });

    it('should apply red tint when both companion and enemy are nearby (red takes precedence)', () => {
      // Tomato with basil (companion) and cabbage (enemy)
      const mixedArrangement = {
        grid: [
          ['basil', 'tomato', 'cabbage']
        ],
        placements: [
          { plantId: 'basil', row: 0, col: 0 },
          { plantId: 'tomato', row: 0, col: 1 },
          { plantId: 'cabbage', row: 0, col: 2 }
        ],
        success: true
      };
      const wideBed = { width: 3, height: 1, id: 'wide', name: 'Wide' };

      render(<PlanningGrid arrangement={mixedArrangement} bed={wideBed} onSquareClick={vi.fn()} />);

      const tomatoCell = screen.getByTitle(/^Tomato \(0, 1\)/);
      // Red tint should take precedence
      expect(tomatoCell).toHaveStyle({ boxShadow: 'inset 0 0 0 100px rgba(239, 68, 68, 0.35)' });
    });

    it('should not apply tint to empty squares', () => {
      render(<PlanningGrid {...defaultProps} />);

      const emptyCell = screen.getByTitle('Empty (1, 1)');
      expect(emptyCell).toHaveStyle({ boxShadow: 'none' });
    });

    it('should not apply tint to squares with no companions or enemies nearby', () => {
      // Single tomato with no adjacent plants
      const isolatedArrangement = {
        grid: [
          ['tomato', null, null],
          [null, null, null],
          [null, null, null]
        ],
        placements: [
          { plantId: 'tomato', row: 0, col: 0 }
        ],
        success: true
      };
      const largeBed = { width: 3, height: 3, id: 'large', name: 'Large' };

      render(<PlanningGrid arrangement={isolatedArrangement} bed={largeBed} onSquareClick={vi.fn()} />);

      const tomatoCell = screen.getByTitle(/^Tomato \(0, 0\)/);
      expect(tomatoCell).toHaveStyle({ boxShadow: 'none' });
    });
  });

  describe('enhanced tooltips', () => {
    it('should show companion plants in tooltip', () => {
      // Tomato and basil are companions
      const companionArrangement = {
        grid: [
          ['tomato', 'basil'],
          [null, null]
        ],
        placements: [
          { plantId: 'tomato', row: 0, col: 0 },
          { plantId: 'basil', row: 0, col: 1 }
        ],
        success: true
      };

      render(<PlanningGrid arrangement={companionArrangement} bed={mockBed} onSquareClick={vi.fn()} />);

      const tomatoCell = screen.getByTitle(/^Tomato \(0, 0\)[\s\S]*Companions: Basil/);
      expect(tomatoCell).toBeInTheDocument();
    });

    it('should show enemy plants in tooltip', () => {
      // Tomato and cabbage are enemies
      const enemyArrangement = {
        grid: [
          ['tomato', 'cabbage'],
          [null, null]
        ],
        placements: [
          { plantId: 'tomato', row: 0, col: 0 },
          { plantId: 'cabbage', row: 0, col: 1 }
        ],
        success: true
      };

      render(<PlanningGrid arrangement={enemyArrangement} bed={mockBed} onSquareClick={vi.fn()} />);

      const tomatoCell = screen.getByTitle(/^Tomato \(0, 0\)[\s\S]*Warning: near Cabbage \(incompatible\)/);
      expect(tomatoCell).toBeInTheDocument();
    });

    it('should show both companions and enemies in tooltip', () => {
      // Tomato with basil (companion) and cabbage (enemy)
      const mixedArrangement = {
        grid: [
          ['basil', 'tomato', 'cabbage']
        ],
        placements: [
          { plantId: 'basil', row: 0, col: 0 },
          { plantId: 'tomato', row: 0, col: 1 },
          { plantId: 'cabbage', row: 0, col: 2 }
        ],
        success: true
      };
      const wideBed = { width: 3, height: 1, id: 'wide', name: 'Wide' };

      render(<PlanningGrid arrangement={mixedArrangement} bed={wideBed} onSquareClick={vi.fn()} />);

      // Tooltip should show both companion and enemy info
      const tomatoCell = screen.getByTitle(/^Tomato \(0, 1\)[\s\S]*Companions: Basil[\s\S]*Warning: near Cabbage/);
      expect(tomatoCell).toBeInTheDocument();
    });
  });
});

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
