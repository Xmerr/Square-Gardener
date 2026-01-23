import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PlantPalette from './PlantPalette';

// Mock the plant library
vi.mock('../data/plantLibrary', () => ({
  getPlantById: vi.fn((id) => {
    const plants = {
      tomato: { id: 'tomato', name: 'Tomato' },
      basil: { id: 'basil', name: 'Basil' },
      carrot: { id: 'carrot', name: 'Carrot' },
      lettuce: { id: 'lettuce', name: 'Lettuce' },
      pepper: { id: 'pepper', name: 'Pepper' }
    };
    return plants[id] || null;
  })
}));

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
      const plantIds = ['tomato', 'basil', 'carrot'];
      render(<PlantPalette plantIds={plantIds} />);

      const plantNames = screen.getAllByText(/^(Basil|Carrot|Tomato)$/);
      expect(plantNames[0]).toHaveTextContent('Basil');
      expect(plantNames[1]).toHaveTextContent('Carrot');
      expect(plantNames[2]).toHaveTextContent('Tomato');
    });

    it('should render plant initials', () => {
      const plantIds = ['tomato', 'basil'];
      render(<PlantPalette plantIds={plantIds} />);

      // Check for initials (first letter of plant names)
      expect(screen.getByText('T')).toBeInTheDocument();
      expect(screen.getByText('B')).toBeInTheDocument();
    });
  });

  describe('drag and drop', () => {
    it('should make plant items draggable', () => {
      const plantIds = ['tomato'];
      const { container } = render(<PlantPalette plantIds={plantIds} />);

      const draggableElement = container.querySelector('[draggable="true"]');
      expect(draggableElement).toBeInTheDocument();
    });

    it('should have data-plant-id attribute', () => {
      const plantIds = ['tomato'];
      const { container } = render(<PlantPalette plantIds={plantIds} />);

      const plantElement = container.querySelector('[data-plant-id="tomato"]');
      expect(plantElement).toBeInTheDocument();
    });

    it('should apply opacity when dragging starts', () => {
      const plantIds = ['tomato'];
      const { container } = render(<PlantPalette plantIds={plantIds} />);

      const plantElement = container.querySelector('[data-plant-id="tomato"]');

      const mockDataTransfer = {
        effectAllowed: '',
        setData: vi.fn()
      };

      fireEvent.dragStart(plantElement, { dataTransfer: mockDataTransfer });

      expect(plantElement).toHaveClass('opacity-50');
    });

    it('should remove opacity when drag ends', () => {
      const plantIds = ['tomato'];
      const { container } = render(<PlantPalette plantIds={plantIds} />);

      const plantElement = container.querySelector('[data-plant-id="tomato"]');

      const mockDataTransfer = {
        effectAllowed: '',
        setData: vi.fn()
      };

      fireEvent.dragStart(plantElement, { dataTransfer: mockDataTransfer });
      fireEvent.dragEnd(plantElement);

      expect(plantElement).toHaveClass('opacity-100');
    });

    it('should set dataTransfer data on drag start', () => {
      const plantIds = ['tomato'];
      const { container } = render(<PlantPalette plantIds={plantIds} />);

      const plantElement = container.querySelector('[data-plant-id="tomato"]');

      const mockDataTransfer = {
        effectAllowed: '',
        setData: vi.fn()
      };

      fireEvent.dragStart(plantElement, { dataTransfer: mockDataTransfer });

      expect(mockDataTransfer.setData).toHaveBeenCalledWith('plant-id', 'tomato');
      expect(mockDataTransfer.effectAllowed).toBe('copy');
    });
  });

  describe('styling', () => {
    it('should apply plant-specific colors', () => {
      const plantIds = ['tomato'];
      const { container } = render(<PlantPalette plantIds={plantIds} />);

      const plantElement = container.querySelector('[data-plant-id="tomato"]');
      expect(plantElement).toHaveStyle({ backgroundColor: '#ef4444' });
    });

    it('should apply cursor-move class to draggable elements', () => {
      const plantIds = ['tomato'];
      const { container } = render(<PlantPalette plantIds={plantIds} />);

      const plantElement = container.querySelector('[data-plant-id="tomato"]');
      expect(plantElement).toHaveClass('cursor-move');
    });
  });
});
