import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PlantPalette from './PlantPalette';

describe('PlantPalette', () => {
  describe('rendering', () => {
    it('should render with plant list', () => {
      const plantIds = ['tomato', 'basil', 'carrot'];
      render(<PlantPalette plantIds={plantIds} />);

      expect(screen.getByText('Plant Palette')).toBeInTheDocument();
      expect(screen.getByText('Tomato')).toBeInTheDocument();
      expect(screen.getByText('Basil')).toBeInTheDocument();
      expect(screen.getByText('Carrot')).toBeInTheDocument();
    });

    it('should render null when plantIds is empty', () => {
      const { container } = render(<PlantPalette plantIds={[]} />);
      expect(container.firstChild).toBeNull();
    });

    it('should render null when plantIds is null', () => {
      const { container } = render(<PlantPalette plantIds={null} />);
      expect(container.firstChild).toBeNull();
    });

    it('should filter out invalid plant IDs', () => {
      const plantIds = ['tomato', 'invalid-plant-id', 'basil'];
      render(<PlantPalette plantIds={plantIds} />);

      expect(screen.getByText('Tomato')).toBeInTheDocument();
      expect(screen.getByText('Basil')).toBeInTheDocument();
      expect(screen.queryByText('invalid-plant-id')).not.toBeInTheDocument();
    });

    it('should sort plants alphabetically', () => {
      const plantIds = ['zucchini', 'basil', 'tomato'];
      render(<PlantPalette plantIds={plantIds} />);

      const plantElements = screen.getAllByText(/^(Basil|Tomato|Zucchini)$/);
      expect(plantElements[0].textContent).toBe('Basil');
      expect(plantElements[1].textContent).toBe('Tomato');
      expect(plantElements[2].textContent).toBe('Zucchini');
    });

    it('should render plant initials', () => {
      const plantIds = ['tomato', 'basil'];
      render(<PlantPalette plantIds={plantIds} />);

      const initials = screen.getAllByText(/^[TB]$/);
      expect(initials.length).toBeGreaterThanOrEqual(2);
    });

    it('should display usage instructions', () => {
      const plantIds = ['tomato'];
      render(<PlantPalette plantIds={plantIds} />);

      expect(screen.getByText('Drag plants onto the grid to replace existing placements')).toBeInTheDocument();
      expect(screen.getByText('Drag a plant onto a grid square to replace it')).toBeInTheDocument();
      expect(screen.getByText('Drop on empty squares to fill them')).toBeInTheDocument();
    });
  });

  describe('drag and drop', () => {
    it('should make plant items draggable', () => {
      const plantIds = ['tomato', 'basil'];
      render(<PlantPalette plantIds={plantIds} />);

      const tomatoElement = screen.getByText('Tomato').closest('div');
      expect(tomatoElement).toHaveAttribute('draggable', 'true');
    });

    it('should have data-plant-id attribute', () => {
      const plantIds = ['tomato', 'basil'];
      render(<PlantPalette plantIds={plantIds} />);

      const tomatoElement = screen.getByText('Tomato').closest('div');
      expect(tomatoElement).toHaveAttribute('data-plant-id', 'tomato');
    });

    it('should apply opacity when dragging starts', () => {
      const plantIds = ['tomato'];
      render(<PlantPalette plantIds={plantIds} />);

      const plantElement = screen.getByText('Tomato').closest('div');
      expect(plantElement).toHaveClass('opacity-100');

      fireEvent.dragStart(plantElement);
      expect(plantElement).toHaveClass('opacity-50');
    });

    it('should remove opacity when drag ends', () => {
      const plantIds = ['tomato'];
      render(<PlantPalette plantIds={plantIds} />);

      const plantElement = screen.getByText('Tomato').closest('div');

      fireEvent.dragStart(plantElement);
      expect(plantElement).toHaveClass('opacity-50');

      fireEvent.dragEnd(plantElement);
      expect(plantElement).toHaveClass('opacity-100');
    });

    it('should handle drag start for multiple plants independently', () => {
      const plantIds = ['tomato', 'basil'];
      render(<PlantPalette plantIds={plantIds} />);

      const tomatoElement = screen.getByText('Tomato').closest('div');
      const basilElement = screen.getByText('Basil').closest('div');

      fireEvent.dragStart(tomatoElement);
      expect(tomatoElement).toHaveClass('opacity-50');
      expect(basilElement).toHaveClass('opacity-100');
    });

    it('should reset drag state when switching between plants', () => {
      const plantIds = ['tomato', 'basil'];
      render(<PlantPalette plantIds={plantIds} />);

      const tomatoElement = screen.getByText('Tomato').closest('div');
      const basilElement = screen.getByText('Basil').closest('div');

      fireEvent.dragStart(tomatoElement);
      expect(tomatoElement).toHaveClass('opacity-50');

      fireEvent.dragEnd(tomatoElement);
      fireEvent.dragStart(basilElement);

      expect(tomatoElement).toHaveClass('opacity-100');
      expect(basilElement).toHaveClass('opacity-50');
    });
  });

  describe('styling', () => {
    it('should apply plant-specific colors', () => {
      const plantIds = ['tomato'];
      render(<PlantPalette plantIds={plantIds} />);

      const plantElement = screen.getByText('Tomato').closest('div');
      expect(plantElement).toHaveStyle({ backgroundColor: '#ef4444' });
    });

    it('should use default color for unknown plants', () => {
      vi.mock('../data/plantLibrary', () => ({
        getPlantById: vi.fn((id) => {
          if (id === 'unknown') {
            return { id: 'unknown', name: 'Unknown' };
          }
          return null;
        })
      }));

      const plantIds = ['unknown'];
      render(<PlantPalette plantIds={plantIds} />);

      const plantElement = screen.getByText('Unknown').closest('div');
      expect(plantElement).toHaveStyle({ backgroundColor: '#9ca3af' });
    });

    it('should apply cursor-move class to draggable elements', () => {
      const plantIds = ['tomato'];
      render(<PlantPalette plantIds={plantIds} />);

      const plantElement = screen.getByText('Tomato').closest('div');
      expect(plantElement).toHaveClass('cursor-move');
    });
  });
});
