import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import BedGridPreview from './BedGridPreview';

describe('BedGridPreview', () => {
  const mockPlantLibrary = [
    { id: 'tomato', squaresPerPlant: 1 },
    { id: 'lettuce', squaresPerPlant: 0.25 },
    { id: 'carrot', squaresPerPlant: 0.0625 },
    { id: 'basil', squaresPerPlant: 0.25 },
    { id: 'unknown-plant', squaresPerPlant: 0.5 }
  ];

  describe('rendering', () => {
    it('renders grid for 4×4 bed', () => {
      const plants = [{ plantId: 'tomato', quantity: 2 }];
      const { container } = render(
        <BedGridPreview
          width={4}
          height={4}
          plants={plants}
          plantLibrary={mockPlantLibrary}
        />
      );

      const gridCells = container.querySelectorAll('.rounded-sm');
      expect(gridCells).toHaveLength(16);
    });

    it('renders grid for 8×4 bed', () => {
      const plants = [{ plantId: 'tomato', quantity: 1 }];
      const { container } = render(
        <BedGridPreview
          width={8}
          height={4}
          plants={plants}
          plantLibrary={mockPlantLibrary}
        />
      );

      const gridCells = container.querySelectorAll('.rounded-sm');
      expect(gridCells).toHaveLength(32);
    });

    it('shows plant icons in correct squares', () => {
      const plants = [{ plantId: 'tomato', quantity: 2 }];
      render(
        <BedGridPreview
          width={4}
          height={4}
          plants={plants}
          plantLibrary={mockPlantLibrary}
        />
      );

      const tomatoEmojis = screen.getAllByText('🍅');
      expect(tomatoEmojis).toHaveLength(2);
    });

    it('shows empty squares', () => {
      const plants = [{ plantId: 'tomato', quantity: 1 }];
      const { container } = render(
        <BedGridPreview
          width={4}
          height={4}
          plants={plants}
          plantLibrary={mockPlantLibrary}
        />
      );

      const emptyCells = container.querySelectorAll('.bg-white');
      expect(emptyCells.length).toBe(15);
    });

    it('handles beds with no plants', () => {
      render(
        <BedGridPreview
          width={4}
          height={4}
          plants={[]}
          plantLibrary={mockPlantLibrary}
        />
      );

      expect(screen.getByText('No plants yet')).toBeInTheDocument();
    });
  });

  describe('scaling', () => {
    it('scales down grids larger than 10×10', () => {
      const plants = [{ plantId: 'tomato', quantity: 1 }];
      const { container } = render(
        <BedGridPreview
          width={12}
          height={12}
          plants={plants}
          plantLibrary={mockPlantLibrary}
        />
      );

      const gridCells = container.querySelectorAll('.rounded-sm');
      expect(gridCells).toHaveLength(100);
      expect(screen.getByText('Showing 10×10 of 12×12')).toBeInTheDocument();
    });

    it('scales width only when needed', () => {
      const plants = [{ plantId: 'tomato', quantity: 1 }];
      render(
        <BedGridPreview
          width={15}
          height={4}
          plants={plants}
          plantLibrary={mockPlantLibrary}
        />
      );

      expect(screen.getByText('Showing 10×4 of 15×4')).toBeInTheDocument();
    });

    it('scales height only when needed', () => {
      const plants = [{ plantId: 'tomato', quantity: 1 }];
      render(
        <BedGridPreview
          width={4}
          height={15}
          plants={plants}
          plantLibrary={mockPlantLibrary}
        />
      );

      expect(screen.getByText('Showing 4×10 of 4×15')).toBeInTheDocument();
    });

    it('does not show scaling message for small grids', () => {
      const plants = [{ plantId: 'tomato', quantity: 1 }];
      render(
        <BedGridPreview
          width={4}
          height={4}
          plants={plants}
          plantLibrary={mockPlantLibrary}
        />
      );

      expect(screen.queryByText(/Showing/)).not.toBeInTheDocument();
    });
  });

  describe('plant types', () => {
    it('renders different plant colors', () => {
      const plants = [
        { plantId: 'tomato', quantity: 1 },
        { plantId: 'lettuce', quantity: 4 },
        { plantId: 'carrot', quantity: 16 }
      ];
      const { container } = render(
        <BedGridPreview
          width={4}
          height={4}
          plants={plants}
          plantLibrary={mockPlantLibrary}
        />
      );

      expect(container.querySelectorAll('.bg-red-400')).toHaveLength(1);
      expect(container.querySelectorAll('.bg-green-300')).toHaveLength(1);
      expect(container.querySelectorAll('.bg-orange-400')).toHaveLength(1);
    });

    it('renders lettuce emoji', () => {
      const plants = [{ plantId: 'lettuce', quantity: 4 }];
      render(
        <BedGridPreview
          width={4}
          height={4}
          plants={plants}
          plantLibrary={mockPlantLibrary}
        />
      );

      expect(screen.getAllByText('🥬')).toHaveLength(1);
    });

    it('renders carrot emoji', () => {
      const plants = [{ plantId: 'carrot', quantity: 16 }];
      render(
        <BedGridPreview
          width={4}
          height={4}
          plants={plants}
          plantLibrary={mockPlantLibrary}
        />
      );

      expect(screen.getAllByText('🥕')).toHaveLength(1);
    });

    it('renders pepper emoji', () => {
      const plants = [{ plantId: 'pepper', quantity: 1 }];
      const mockLibraryWithPepper = [...mockPlantLibrary, { id: 'pepper', squaresPerPlant: 1 }];
      render(
        <BedGridPreview
          width={4}
          height={4}
          plants={plants}
          plantLibrary={mockLibraryWithPepper}
        />
      );

      expect(screen.getAllByText('🌶️')).toHaveLength(1);
    });

    it('renders cucumber emoji', () => {
      const plants = [{ plantId: 'cucumber', quantity: 1 }];
      const mockLibraryWithCucumber = [...mockPlantLibrary, { id: 'cucumber', squaresPerPlant: 1 }];
      render(
        <BedGridPreview
          width={4}
          height={4}
          plants={plants}
          plantLibrary={mockLibraryWithCucumber}
        />
      );

      expect(screen.getAllByText('🥒')).toHaveLength(1);
    });

    it('renders generic emoji for unknown plants', () => {
      const plants = [{ plantId: 'basil', quantity: 4 }];
      render(
        <BedGridPreview
          width={4}
          height={4}
          plants={plants}
          plantLibrary={mockPlantLibrary}
        />
      );

      expect(screen.getAllByText('🌱')).toHaveLength(1);
    });

    it('uses default color for unmapped plants', () => {
      const plants = [{ plantId: 'unknown-plant', quantity: 2 }];
      const { container } = render(
        <BedGridPreview
          width={4}
          height={4}
          plants={plants}
          plantLibrary={mockPlantLibrary}
        />
      );

      expect(container.querySelectorAll('.bg-gray-400')).toHaveLength(1);
    });
  });

  describe('capacity handling', () => {
    it('handles plants with no quantity (defaults to 1)', () => {
      const plants = [{ plantId: 'tomato' }];
      render(
        <BedGridPreview
          width={4}
          height={4}
          plants={plants}
          plantLibrary={mockPlantLibrary}
        />
      );

      expect(screen.getAllByText('🍅')).toHaveLength(1);
    });

    it('handles plants not in library', () => {
      const plants = [
        { plantId: 'nonexistent', quantity: 4 },
        { plantId: 'tomato', quantity: 1 }
      ];
      render(
        <BedGridPreview
          width={4}
          height={4}
          plants={plants}
          plantLibrary={mockPlantLibrary}
        />
      );

      expect(screen.getAllByText('🍅')).toHaveLength(1);
    });

    it('stops filling grid when full', () => {
      const plants = [{ plantId: 'tomato', quantity: 20 }];
      const { container } = render(
        <BedGridPreview
          width={4}
          height={4}
          plants={plants}
          plantLibrary={mockPlantLibrary}
        />
      );

      const filledCells = container.querySelectorAll('.bg-red-400');
      expect(filledCells).toHaveLength(16);
    });
  });

  describe('cell sizing', () => {
    it('uses smaller cells for wide grids', () => {
      const plants = [{ plantId: 'tomato', quantity: 1 }];
      const { container } = render(
        <BedGridPreview
          width={8}
          height={4}
          plants={plants}
          plantLibrary={mockPlantLibrary}
        />
      );

      expect(container.querySelectorAll('.w-4')).toHaveLength(32);
    });

    it('uses larger cells for small grids', () => {
      const plants = [{ plantId: 'tomato', quantity: 1 }];
      const { container } = render(
        <BedGridPreview
          width={4}
          height={4}
          plants={plants}
          plantLibrary={mockPlantLibrary}
        />
      );

      expect(container.querySelectorAll('.w-6')).toHaveLength(16);
    });
  });

  describe('large plant visualization', () => {
    const largePlantLibrary = [
      ...mockPlantLibrary,
      { id: 'pumpkin', squaresPerPlant: 2 },
      { id: 'watermelon', squaresPerPlant: 4 },
      { id: 'squash', squaresPerPlant: 3 }
    ];

    it('renders large plant spanning multiple squares', () => {
      const plants = [{ plantId: 'pumpkin', quantity: 1 }];
      const { container } = render(
        <BedGridPreview
          width={4}
          height={4}
          plants={plants}
          plantLibrary={largePlantLibrary}
        />
      );

      const largePlantCells = container.querySelectorAll('.border-purple-700');
      expect(largePlantCells).toHaveLength(2);
    });

    it('shows "Takes X squares" label on first square of large plant', () => {
      const plants = [{ plantId: 'pumpkin', quantity: 1 }];
      render(
        <BedGridPreview
          width={4}
          height={4}
          plants={plants}
          plantLibrary={largePlantLibrary}
        />
      );

      expect(screen.getByText('2sq')).toBeInTheDocument();
    });

    it('applies gradient background to large plants', () => {
      const plants = [{ plantId: 'watermelon', quantity: 1 }];
      const { container } = render(
        <BedGridPreview
          width={4}
          height={4}
          plants={plants}
          plantLibrary={largePlantLibrary}
        />
      );

      const gradientCells = container.querySelectorAll('.bg-gradient-to-br');
      expect(gradientCells).toHaveLength(4);
    });

    it('adds borders to connect squares of same plant instance', () => {
      const plants = [{ plantId: 'pumpkin', quantity: 1 }];
      const { container } = render(
        <BedGridPreview
          width={4}
          height={4}
          plants={plants}
          plantLibrary={largePlantLibrary}
        />
      );

      const borderedCells = container.querySelectorAll('.border-purple-700');
      expect(borderedCells).toHaveLength(2);
    });

    it('shows tooltip with square count for large plants', () => {
      const plants = [{ plantId: 'watermelon', quantity: 1 }];
      const { container } = render(
        <BedGridPreview
          width={4}
          height={4}
          plants={plants}
          plantLibrary={largePlantLibrary}
        />
      );

      const largePlantCell = container.querySelector('[title*="Takes"]');
      expect(largePlantCell).toHaveAttribute('title', 'watermelon (Takes 4 squares)');
    });

    it('handles multiple large plant instances', () => {
      const plants = [{ plantId: 'pumpkin', quantity: 2 }];
      const { container } = render(
        <BedGridPreview
          width={4}
          height={4}
          plants={plants}
          plantLibrary={largePlantLibrary}
        />
      );

      const labels = container.querySelectorAll('.text-purple-900');
      expect(labels).toHaveLength(2);
      expect(screen.getAllByText('2sq')).toHaveLength(2);
    });

    it('handles large plant with odd square count', () => {
      const plants = [{ plantId: 'squash', quantity: 1 }];
      render(
        <BedGridPreview
          width={4}
          height={4}
          plants={plants}
          plantLibrary={largePlantLibrary}
        />
      );

      expect(screen.getByText('3sq')).toBeInTheDocument();
    });

    it('handles mix of regular and large plants', () => {
      const plants = [
        { plantId: 'tomato', quantity: 2 },
        { plantId: 'pumpkin', quantity: 1 },
        { plantId: 'lettuce', quantity: 4 }
      ];
      render(
        <BedGridPreview
          width={4}
          height={4}
          plants={plants}
          plantLibrary={largePlantLibrary}
        />
      );

      expect(screen.getAllByText('🍅')).toHaveLength(2);
      expect(screen.getByText('2sq')).toBeInTheDocument();
      expect(screen.getByText('🥬')).toBeInTheDocument();
    });

    it('shows square label instead of emoji for large plant squares', () => {
      const plants = [{ plantId: 'pumpkin', quantity: 1 }];
      render(
        <BedGridPreview
          width={4}
          height={4}
          plants={plants}
          plantLibrary={largePlantLibrary}
        />
      );

      // Large plant should show "2sq" label on first square only
      expect(screen.getByText('2sq')).toBeInTheDocument();
      // Should not show emojis for pumpkin
      expect(screen.queryByText('🌱')).not.toBeInTheDocument();
    });

    it('applies correct borders for top-left square in grid', () => {
      const plants = [{ plantId: 'pumpkin', quantity: 1 }];
      const { container } = render(
        <BedGridPreview
          width={4}
          height={4}
          plants={plants}
          plantLibrary={largePlantLibrary}
        />
      );

      const borderedCells = container.querySelectorAll('.border-purple-700');
      const firstCell = borderedCells[0];
      expect(firstCell).toHaveClass('border-t-2');
      expect(firstCell).toHaveClass('border-l-2');
    });

    it('stops filling grid at capacity with large plants', () => {
      const plants = [{ plantId: 'watermelon', quantity: 10 }];
      const { container } = render(
        <BedGridPreview
          width={4}
          height={4}
          plants={plants}
          plantLibrary={largePlantLibrary}
        />
      );

      const gridCells = container.querySelectorAll('.rounded-sm');
      expect(gridCells).toHaveLength(16);
    });

    it('omits internal borders between connected large plant squares', () => {
      // Use a 2x2 grid with a 4-square plant to test all internal border removal
      const plants = [{ plantId: 'watermelon', quantity: 1 }];
      const { container } = render(
        <BedGridPreview
          width={2}
          height={2}
          plants={plants}
          plantLibrary={largePlantLibrary}
        />
      );

      const borderedCells = container.querySelectorAll('.border-purple-700');
      expect(borderedCells).toHaveLength(4);

      // First cell (0,0): top-left corner - has top and left borders, no right or bottom
      const firstCell = borderedCells[0];
      expect(firstCell).toHaveClass('border-t-2');
      expect(firstCell).toHaveClass('border-l-2');
      expect(firstCell).not.toHaveClass('border-r-2');
      expect(firstCell).not.toHaveClass('border-b-2');

      // Second cell (0,1): top-right corner - has top and right borders, no left or bottom
      const secondCell = borderedCells[1];
      expect(secondCell).toHaveClass('border-t-2');
      expect(secondCell).toHaveClass('border-r-2');
      expect(secondCell).not.toHaveClass('border-l-2');
      expect(secondCell).not.toHaveClass('border-b-2');

      // Third cell (1,0): bottom-left corner - has bottom and left borders, no right or top
      const thirdCell = borderedCells[2];
      expect(thirdCell).toHaveClass('border-b-2');
      expect(thirdCell).toHaveClass('border-l-2');
      expect(thirdCell).not.toHaveClass('border-r-2');
      expect(thirdCell).not.toHaveClass('border-t-2');

      // Fourth cell (1,1): bottom-right corner - has bottom and right borders, no left or top
      const fourthCell = borderedCells[3];
      expect(fourthCell).toHaveClass('border-b-2');
      expect(fourthCell).toHaveClass('border-r-2');
      expect(fourthCell).not.toHaveClass('border-l-2');
      expect(fourthCell).not.toHaveClass('border-t-2');
    });
  });
});
