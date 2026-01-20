import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SquareDetails from './SquareDetails';

describe('SquareDetails', () => {
  const mockArrangement = {
    grid: [
      ['tomato', 'basil', 'carrot'],
      ['cabbage', null, 'lettuce'],
      ['onion', 'bean', 'radish']
    ],
    placements: [
      { plantId: 'tomato', row: 0, col: 0 },
      { plantId: 'basil', row: 0, col: 1 },
      { plantId: 'carrot', row: 0, col: 2 },
      { plantId: 'cabbage', row: 1, col: 0 },
      { plantId: 'lettuce', row: 1, col: 2 },
      { plantId: 'onion', row: 2, col: 0 },
      { plantId: 'bean', row: 2, col: 1 },
      { plantId: 'radish', row: 2, col: 2 }
    ],
    success: true
  };

  const defaultProps = {
    square: { row: 0, col: 1, plantId: 'basil' },
    arrangement: mockArrangement,
    onMove: vi.fn(),
    onSwap: vi.fn(),
    onRemove: vi.fn(),
    onClose: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render square details with plant info', () => {
      render(<SquareDetails {...defaultProps} />);

      expect(screen.getByText('Square (0, 1)')).toBeInTheDocument();
      expect(screen.getByText('Basil')).toBeInTheDocument();
      expect(screen.getByText('Ocimum basilicum')).toBeInTheDocument();
    });

    it('should render placement reasoning section', () => {
      render(<SquareDetails {...defaultProps} />);

      expect(screen.getByText('Placement Reasoning:')).toBeInTheDocument();
    });

    it('should render relationships section', () => {
      render(<SquareDetails {...defaultProps} />);

      expect(screen.getByText('Relationships:')).toBeInTheDocument();
    });

    it('should render action buttons for filled squares', () => {
      render(<SquareDetails {...defaultProps} />);

      expect(screen.getByText('Move')).toBeInTheDocument();
      expect(screen.getByText('Swap')).toBeInTheDocument();
      expect(screen.getByText('Remove')).toBeInTheDocument();
    });

    it('should render close button', () => {
      render(<SquareDetails {...defaultProps} />);

      const closeButton = screen.getByLabelText('Close');
      expect(closeButton).toBeInTheDocument();
    });

    it('should render empty square message when no plant', () => {
      const emptySquare = { row: 1, col: 1, plantId: null };
      render(<SquareDetails {...defaultProps} square={emptySquare} />);

      expect(screen.getByText('This square is empty')).toBeInTheDocument();
      expect(screen.queryByText('Move')).not.toBeInTheDocument();
      expect(screen.queryByText('Swap')).not.toBeInTheDocument();
      expect(screen.queryByText('Remove')).not.toBeInTheDocument();
    });

    it('should return null when no square provided', () => {
      const { container } = render(<SquareDetails {...defaultProps} square={null} />);

      // Component should return null, so the container should be empty
      expect(container.querySelector('.fixed')).toBeNull();
    });

    it('should return null when square is undefined', () => {
      const { container } = render(<SquareDetails {...defaultProps} square={undefined} />);

      // Component should return null, so the container should be empty
      expect(container.querySelector('.fixed')).toBeNull();
    });
  });

  describe('companion relationships', () => {
    it('should display companion plants', () => {
      // Basil at (0,1) is adjacent to Tomato at (0,0) - they are companions
      render(<SquareDetails {...defaultProps} />);

      expect(screen.getByText('Companions:')).toBeInTheDocument();
      expect(screen.getByText(/Tomato at \(0, 0\)/)).toBeInTheDocument();
    });

    it('should show companion in reasoning', () => {
      render(<SquareDetails {...defaultProps} />);

      expect(screen.getByText(/Adjacent to Tomato \(companion\)/)).toBeInTheDocument();
    });

    it('should display multiple companions', () => {
      // Create a grid where a plant has multiple companions
      // Carrot at (1,1) is adjacent to Lettuce (1,2) and Tomato (0,0) - both are companions
      const gridWithMultipleCompanions = {
        grid: [
          ['tomato', 'basil', null],
          ['pea', 'carrot', 'lettuce'],
          [null, null, null]
        ],
        placements: [
          { plantId: 'tomato', row: 0, col: 0 },
          { plantId: 'basil', row: 0, col: 1 },
          { plantId: 'pea', row: 1, col: 0 },
          { plantId: 'carrot', row: 1, col: 1 },
          { plantId: 'lettuce', row: 1, col: 2 }
        ],
        success: true
      };
      const carrotSquare = { row: 1, col: 1, plantId: 'carrot' };
      render(<SquareDetails {...defaultProps} arrangement={gridWithMultipleCompanions} square={carrotSquare} />);

      expect(screen.getByText('Companions:')).toBeInTheDocument();
      expect(screen.getByText(/Lettuce at \(1, 2\)/)).toBeInTheDocument();
      expect(screen.getByText(/Tomato at \(0, 0\)/)).toBeInTheDocument();
      expect(screen.getByText(/Pea at \(1, 0\)/)).toBeInTheDocument();
    });

    it('should show plural companions in reasoning when multiple', () => {
      // Carrot at (1,1) has multiple companions
      const gridWithMultipleCompanions = {
        grid: [
          ['tomato', 'basil', null],
          ['pea', 'carrot', 'lettuce'],
          [null, null, null]
        ],
        placements: [
          { plantId: 'tomato', row: 0, col: 0 },
          { plantId: 'basil', row: 0, col: 1 },
          { plantId: 'pea', row: 1, col: 0 },
          { plantId: 'carrot', row: 1, col: 1 },
          { plantId: 'lettuce', row: 1, col: 2 }
        ],
        success: true
      };
      const carrotSquare = { row: 1, col: 1, plantId: 'carrot' };
      render(<SquareDetails {...defaultProps} arrangement={gridWithMultipleCompanions} square={carrotSquare} />);

      expect(screen.getByText(/Adjacent to .* \(companions\)/)).toBeInTheDocument();
    });
  });

  describe('enemy relationships', () => {
    it('should display enemy plants', () => {
      // Tomato at (0,0) is adjacent to Cabbage at (1,0) - they are enemies
      const tomatoSquare = { row: 0, col: 0, plantId: 'tomato' };
      render(<SquareDetails {...defaultProps} square={tomatoSquare} />);

      expect(screen.getByText('Enemies:')).toBeInTheDocument();
      expect(screen.getByText(/Cabbage at \(1, 0\)/)).toBeInTheDocument();
    });

    it('should show enemy warning in reasoning', () => {
      const tomatoSquare = { row: 0, col: 0, plantId: 'tomato' };
      render(<SquareDetails {...defaultProps} square={tomatoSquare} />);

      expect(screen.getByText(/Warning: Near Cabbage \(should avoid\)/)).toBeInTheDocument();
    });

    it('should display multiple enemies', () => {
      // Bean at (2,1) is adjacent to Onion at (2,0) which is an enemy
      const beanSquare = { row: 2, col: 1, plantId: 'bean' };
      render(<SquareDetails {...defaultProps} square={beanSquare} />);

      expect(screen.getByText('Enemies:')).toBeInTheDocument();
      expect(screen.getByText(/Onion at \(2, 0\)/)).toBeInTheDocument();
    });
  });

  describe('no relationships', () => {
    it('should show message when no companions or enemies nearby', () => {
      // Create a grid with lettuce isolated
      const isolatedArrangement = {
        grid: [
          [null, null, null],
          [null, 'lettuce', null],
          [null, null, null]
        ],
        placements: [{ plantId: 'lettuce', row: 1, col: 1 }],
        success: true
      };
      const lettuceSquare = { row: 1, col: 1, plantId: 'lettuce' };

      render(<SquareDetails {...defaultProps} arrangement={isolatedArrangement} square={lettuceSquare} />);

      expect(screen.getByText('No significant companion/enemy relationships nearby')).toBeInTheDocument();
      expect(screen.queryByText('Companions:')).not.toBeInTheDocument();
      expect(screen.queryByText('Enemies:')).not.toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('should call onClose when close button clicked', () => {
      render(<SquareDetails {...defaultProps} />);

      const closeButton = screen.getByLabelText('Close');
      fireEvent.click(closeButton);

      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('should call onMove when Move button clicked', () => {
      render(<SquareDetails {...defaultProps} />);

      const moveButton = screen.getByText('Move');
      fireEvent.click(moveButton);

      expect(defaultProps.onMove).toHaveBeenCalledWith(defaultProps.square);
    });

    it('should call onSwap when Swap button clicked', () => {
      render(<SquareDetails {...defaultProps} />);

      const swapButton = screen.getByText('Swap');
      fireEvent.click(swapButton);

      expect(defaultProps.onSwap).toHaveBeenCalledWith(defaultProps.square);
    });

    it('should call onRemove when Remove button clicked', () => {
      render(<SquareDetails {...defaultProps} />);

      const removeButton = screen.getByText('Remove');
      fireEvent.click(removeButton);

      expect(defaultProps.onRemove).toHaveBeenCalledWith(defaultProps.square);
    });

    it('should work without onMove handler', () => {
      const propsWithoutMove = { ...defaultProps, onMove: undefined };
      render(<SquareDetails {...propsWithoutMove} />);

      const moveButton = screen.getByText('Move');
      fireEvent.click(moveButton);

      // Should not throw error
      expect(screen.getByText('Basil')).toBeInTheDocument();
    });

    it('should work without onSwap handler', () => {
      const propsWithoutSwap = { ...defaultProps, onSwap: undefined };
      render(<SquareDetails {...propsWithoutSwap} />);

      const swapButton = screen.getByText('Swap');
      fireEvent.click(swapButton);

      // Should not throw error
      expect(screen.getByText('Basil')).toBeInTheDocument();
    });

    it('should work without onRemove handler', () => {
      const propsWithoutRemove = { ...defaultProps, onRemove: undefined };
      render(<SquareDetails {...propsWithoutRemove} />);

      const removeButton = screen.getByText('Remove');
      fireEvent.click(removeButton);

      // Should not throw error
      expect(screen.getByText('Basil')).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle unknown plant ID gracefully', () => {
      const unknownSquare = { row: 0, col: 0, plantId: 'unknownplant' };
      render(<SquareDetails {...defaultProps} square={unknownSquare} />);

      // Should show empty message when plant is not found
      expect(screen.getByText('This square is empty')).toBeInTheDocument();
    });

    it('should handle missing arrangement grid', () => {
      const noGridArrangement = { placements: [], success: true };
      render(<SquareDetails {...defaultProps} arrangement={noGridArrangement} />);

      // Should still render without crashing
      expect(screen.getByText('Basil')).toBeInTheDocument();
      expect(screen.getByText('No significant companion/enemy relationships nearby')).toBeInTheDocument();
    });

    it('should handle null arrangement', () => {
      render(<SquareDetails {...defaultProps} arrangement={null} />);

      // Should still render without crashing
      expect(screen.getByText('Basil')).toBeInTheDocument();
      expect(screen.getByText('No significant companion/enemy relationships nearby')).toBeInTheDocument();
    });

    it('should handle adjacent plants with unknown IDs', () => {
      const gridWithUnknown = {
        grid: [
          ['basil', 'unknownplant'],
          [null, null]
        ],
        placements: [{ plantId: 'basil', row: 0, col: 0 }],
        success: true
      };
      const basilSquare = { row: 0, col: 0, plantId: 'basil' };

      render(<SquareDetails {...defaultProps} arrangement={gridWithUnknown} square={basilSquare} />);

      // Should handle unknown adjacent plant gracefully
      expect(screen.getByText('Basil')).toBeInTheDocument();
    });

    it('should show position coordinates for companions', () => {
      render(<SquareDetails {...defaultProps} />);

      // Basil at (0,1) has Tomato companion at (0,0)
      expect(screen.getByText(/Tomato at \(0, 0\)/)).toBeInTheDocument();
    });

    it('should show position coordinates for enemies', () => {
      const tomatoSquare = { row: 0, col: 0, plantId: 'tomato' };
      render(<SquareDetails {...defaultProps} square={tomatoSquare} />);

      // Tomato at (0,0) has Cabbage enemy at (1,0)
      expect(screen.getByText(/Cabbage at \(1, 0\)/)).toBeInTheDocument();
    });

    it('should handle corner square with limited adjacencies', () => {
      // Top-left corner only has 3 adjacent squares
      const cornerSquare = { row: 0, col: 0, plantId: 'tomato' };
      render(<SquareDetails {...defaultProps} square={cornerSquare} />);

      expect(screen.getByText('Tomato')).toBeInTheDocument();
      expect(screen.getByText('Placement Reasoning:')).toBeInTheDocument();
    });

    it('should handle edge square with limited adjacencies', () => {
      // Top edge has 5 adjacent squares
      const edgeSquare = { row: 0, col: 1, plantId: 'basil' };
      render(<SquareDetails {...defaultProps} square={edgeSquare} />);

      expect(screen.getByText('Basil')).toBeInTheDocument();
      expect(screen.getByText('Placement Reasoning:')).toBeInTheDocument();
    });

    it('should handle center square with all 8 adjacencies', () => {
      // Center square has all 8 adjacent squares
      const centerSquare = { row: 1, col: 1, plantId: null };
      const gridWithCenter = {
        grid: [
          ['tomato', 'basil', 'carrot'],
          ['cabbage', 'pepper', 'lettuce'],
          ['onion', 'bean', 'radish']
        ],
        placements: [{ plantId: 'pepper', row: 1, col: 1 }],
        success: true
      };

      render(<SquareDetails {...defaultProps} square={centerSquare} arrangement={gridWithCenter} />);

      expect(screen.getByText('This square is empty')).toBeInTheDocument();
    });
  });

  describe('backdrop interaction', () => {
    it('should render modal backdrop', () => {
      const { container } = render(<SquareDetails {...defaultProps} />);

      const backdrop = container.querySelector('.fixed.inset-0.bg-black.bg-opacity-50');
      expect(backdrop).toBeInTheDocument();
    });
  });
});
