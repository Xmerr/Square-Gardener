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
});
