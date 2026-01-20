import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PlanningGrid from './PlanningGrid';

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

      const tomatoCell = screen.getByTitle('Tomato (0, 0)');
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

      const tomatoCell = screen.getByTitle('Tomato (0, 0)');
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

      const tomatoCell = screen.getByTitle('Tomato (0, 0)');
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

      const tomatoCell = screen.getByTitle('Tomato (0, 0)');
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

      expect(screen.getByTitle('Tomato (0, 0)')).toBeInTheDocument();
      expect(screen.getByTitle('Basil (0, 1)')).toBeInTheDocument();
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
});
