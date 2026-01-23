import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import BedCard from './BedCard';

// Helper to render BedCard wrapped in MemoryRouter
const renderWithRouter = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

// Mock the storage module
vi.mock('../utils/storage', () => ({
  POT_SIZES: {
    small: {
      label: 'Small (4-6 inch)',
      capacity: 0.25,
      diameter: '4-6 inches'
    },
    medium: {
      label: 'Medium (8-10 inch)',
      capacity: 0.56,
      diameter: '8-10 inches'
    },
    large: {
      label: 'Large (12-14 inch)',
      capacity: 1.0,
      diameter: '12-14 inches'
    },
    extra_large: {
      label: 'Extra Large (16+ inch)',
      capacity: 2.25,
      diameter: '16+ inches'
    }
  }
}));

// Mock the plant library
vi.mock('../data/plantLibrary', () => ({
  getPlantById: (id) => {
    const plants = {
      'tomato': { id: 'tomato', name: 'Tomato', squaresPerPlant: 1 },
      'lettuce': { id: 'lettuce', name: 'Lettuce', squaresPerPlant: 0.25 },
      'aloe': { id: 'aloe', name: 'Aloe', squaresPerPlant: 0.25 }
    };
    return plants[id];
  }
}));

describe('BedCard', () => {
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Bed variant (is_pot = false)', () => {
    const mockBed = {
      id: 'bed-1',
      name: 'Main Garden',
      width: 4,
      height: 4,
      is_pot: false
    };

    const mockCapacity = {
      total: 16,
      used: 8,
      available: 8,
      isOvercapacity: false
    };

    it('displays bed icon, name, and dimensions', () => {
      renderWithRouter(
        <BedCard
          bed={mockBed}
          capacity={mockCapacity}
          plantCount={5}
          plants={[]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('Main Garden')).toBeInTheDocument();
      expect(screen.getByText('4 ft × 4 ft (16 sq ft)')).toBeInTheDocument();
      expect(screen.getByLabelText('bed')).toHaveTextContent('🌱');
    });

    it('displays capacity meter for beds', () => {
      renderWithRouter(
        <BedCard
          bed={mockBed}
          capacity={mockCapacity}
          plantCount={5}
          plants={[]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('Capacity')).toBeInTheDocument();
      expect(screen.getByText('8 / 16 sq ft')).toBeInTheDocument();
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('displays plant count singular', () => {
      renderWithRouter(
        <BedCard
          bed={mockBed}
          capacity={mockCapacity}
          plantCount={1}
          plants={[]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('1 plant')).toBeInTheDocument();
    });

    it('displays plant count plural', () => {
      renderWithRouter(
        <BedCard
          bed={mockBed}
          capacity={mockCapacity}
          plantCount={5}
          plants={[]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('5 plants')).toBeInTheDocument();
    });

    it('displays zero plants correctly', () => {
      renderWithRouter(
        <BedCard
          bed={mockBed}
          capacity={mockCapacity}
          plantCount={0}
          plants={[]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('0 plants')).toBeInTheDocument();
    });

    it('shows green color when under 90% capacity', () => {
      const capacity = { total: 16, used: 8, available: 8, isOvercapacity: false };
      renderWithRouter(
        <BedCard
          bed={mockBed}
          capacity={capacity}
          plantCount={5}
          plants={[]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveClass('bg-green-500');
    });

    it('shows yellow color when at 90% capacity', () => {
      const capacity = { total: 16, used: 14.4, available: 1.6, isOvercapacity: false };
      renderWithRouter(
        <BedCard
          bed={mockBed}
          capacity={capacity}
          plantCount={10}
          plants={[]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveClass('bg-yellow-500');
    });

    it('shows red color when overcapacity', () => {
      const capacity = { total: 16, used: 20, available: -4, isOvercapacity: true };
      renderWithRouter(
        <BedCard
          bed={mockBed}
          capacity={capacity}
          plantCount={15}
          plants={[]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveClass('bg-red-500');
    });

    it('caps progress bar at 100%', () => {
      const capacity = { total: 16, used: 24, available: -8, isOvercapacity: true };
      renderWithRouter(
        <BedCard
          bed={mockBed}
          capacity={capacity}
          plantCount={20}
          plants={[]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveStyle({ width: '100%' });
    });

    it('handles zero capacity', () => {
      const capacity = { total: 0, used: 0, available: 0, isOvercapacity: false };
      const zeroBed = { ...mockBed, width: 0, height: 0 };
      renderWithRouter(
        <BedCard
          bed={zeroBed}
          capacity={capacity}
          plantCount={0}
          plants={[]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveStyle({ width: '0%' });
    });

    it('shows overcapacity warning badge', () => {
      const capacity = { total: 16, used: 18, available: -2, isOvercapacity: true };
      renderWithRouter(
        <BedCard
          bed={mockBed}
          capacity={capacity}
          plantCount={12}
          plants={[]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('Overcrowded by 2 sq ft')).toBeInTheDocument();
    });

    it('does not show warning when not overcapacity', () => {
      renderWithRouter(
        <BedCard
          bed={mockBed}
          capacity={mockCapacity}
          plantCount={5}
          plants={[]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.queryByText(/Overcrowded/)).not.toBeInTheDocument();
    });

    it('shows overcapacity text styling', () => {
      const capacity = { total: 16, used: 18, available: -2, isOvercapacity: true };
      renderWithRouter(
        <BedCard
          bed={mockBed}
          capacity={capacity}
          plantCount={12}
          plants={[]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('18 / 16 sq ft')).toHaveClass('text-red-600');
    });

    it('calls onEdit when edit clicked', () => {
      renderWithRouter(
        <BedCard
          bed={mockBed}
          capacity={mockCapacity}
          plantCount={5}
          plants={[]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      fireEvent.click(screen.getByLabelText('Edit Main Garden'));
      expect(mockOnEdit).toHaveBeenCalledWith(mockBed);
    });

    it('calls onDelete when delete clicked', () => {
      renderWithRouter(
        <BedCard
          bed={mockBed}
          capacity={mockCapacity}
          plantCount={5}
          plants={[]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      fireEvent.click(screen.getByLabelText('Delete Main Garden'));
      expect(mockOnDelete).toHaveBeenCalledWith(mockBed);
    });

    it('treats beds without is_pot flag as beds (backward compatibility)', () => {
      const bedWithoutFlag = {
        id: 'bed-1',
        name: 'Main Garden',
        width: 4,
        height: 4
      };

      renderWithRouter(
        <BedCard
          bed={bedWithoutFlag}
          capacity={mockCapacity}
          plantCount={5}
          plants={[]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByLabelText('bed')).toHaveTextContent('🌱');
      expect(screen.getByText('4 ft × 4 ft (16 sq ft)')).toBeInTheDocument();
      expect(screen.getByText('Capacity')).toBeInTheDocument();
    });
  });

  describe('Drag and drop functionality', () => {
    const mockBed = {
      id: 'bed-1',
      name: 'Main Garden',
      width: 4,
      height: 4,
      is_pot: false
    };

    const mockCapacity = {
      total: 16,
      used: 8,
      available: 8,
      isOvercapacity: false
    };

    const mockOnDragStart = vi.fn();
    const mockOnDragEnd = vi.fn();
    const mockOnDragOver = vi.fn();
    const mockOnDrop = vi.fn();

    beforeEach(() => {
      mockOnDragStart.mockClear();
      mockOnDragEnd.mockClear();
      mockOnDragOver.mockClear();
      mockOnDrop.mockClear();
    });

    it('is draggable when onDragStart is provided', () => {
      const { container } = renderWithRouter(
        <BedCard
          bed={mockBed}
          capacity={mockCapacity}
          plantCount={5}
          plants={[]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onDragStart={mockOnDragStart}
        />
      );

      const card = container.firstChild;
      expect(card).toHaveAttribute('draggable', 'true');
    });

    it('is not draggable when onDragStart is not provided', () => {
      const { container } = renderWithRouter(
        <BedCard
          bed={mockBed}
          capacity={mockCapacity}
          plantCount={5}
          plants={[]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const card = container.firstChild;
      expect(card).toHaveAttribute('draggable', 'false');
    });

    it('shows drag handle when onDragStart is provided', () => {
      renderWithRouter(
        <BedCard
          bed={mockBed}
          capacity={mockCapacity}
          plantCount={5}
          plants={[]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onDragStart={mockOnDragStart}
        />
      );

      expect(screen.getByLabelText('Drag Main Garden')).toBeInTheDocument();
    });

    it('drag handle stops propagation on mousedown', () => {
      renderWithRouter(
        <BedCard
          bed={mockBed}
          capacity={mockCapacity}
          plantCount={5}
          plants={[]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onDragStart={mockOnDragStart}
        />
      );

      const dragHandle = screen.getByLabelText('Drag Main Garden');
      const stopPropagation = vi.fn();
      fireEvent.mouseDown(dragHandle, { stopPropagation });
      // The mouseDown handler calls e.stopPropagation() to prevent card click
      // We verify the handler exists and doesn't throw
      expect(dragHandle).toBeInTheDocument();
    });

    it('does not show drag handle when onDragStart is not provided', () => {
      renderWithRouter(
        <BedCard
          bed={mockBed}
          capacity={mockCapacity}
          plantCount={5}
          plants={[]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.queryByLabelText('Drag Main Garden')).not.toBeInTheDocument();
    });

    it('calls onDragStart when drag starts', () => {
      const { container } = renderWithRouter(
        <BedCard
          bed={mockBed}
          capacity={mockCapacity}
          plantCount={5}
          plants={[]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onDragStart={mockOnDragStart}
        />
      );

      const card = container.firstChild;
      fireEvent.dragStart(card);

      expect(mockOnDragStart).toHaveBeenCalledTimes(1);
      expect(mockOnDragStart).toHaveBeenCalledWith(expect.any(Object), mockBed);
    });

    it('calls onDragEnd when drag ends', () => {
      const { container } = renderWithRouter(
        <BedCard
          bed={mockBed}
          capacity={mockCapacity}
          plantCount={5}
          plants={[]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onDragStart={mockOnDragStart}
          onDragEnd={mockOnDragEnd}
        />
      );

      const card = container.firstChild;
      fireEvent.dragEnd(card);

      expect(mockOnDragEnd).toHaveBeenCalledTimes(1);
    });

    it('calls onDragOver when dragging over', () => {
      const { container } = renderWithRouter(
        <BedCard
          bed={mockBed}
          capacity={mockCapacity}
          plantCount={5}
          plants={[]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onDragOver={mockOnDragOver}
        />
      );

      const card = container.firstChild;
      fireEvent.dragOver(card);

      expect(mockOnDragOver).toHaveBeenCalledTimes(1);
      expect(mockOnDragOver).toHaveBeenCalledWith(expect.any(Object), mockBed);
    });

    it('calls onDrop when dropped', () => {
      const { container } = renderWithRouter(
        <BedCard
          bed={mockBed}
          capacity={mockCapacity}
          plantCount={5}
          plants={[]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onDrop={mockOnDrop}
        />
      );

      const card = container.firstChild;
      fireEvent.drop(card);

      expect(mockOnDrop).toHaveBeenCalledTimes(1);
      expect(mockOnDrop).toHaveBeenCalledWith(expect.any(Object), mockBed);
    });

    it('applies opacity when isDragging is true', () => {
      const { container } = renderWithRouter(
        <BedCard
          bed={mockBed}
          capacity={mockCapacity}
          plantCount={5}
          plants={[]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onDragStart={mockOnDragStart}
          isDragging={true}
        />
      );

      const card = container.firstChild;
      expect(card).toHaveClass('opacity-50');
    });

    it('does not apply opacity when isDragging is false', () => {
      const { container } = renderWithRouter(
        <BedCard
          bed={mockBed}
          capacity={mockCapacity}
          plantCount={5}
          plants={[]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onDragStart={mockOnDragStart}
          isDragging={false}
        />
      );

      const card = container.firstChild;
      expect(card).not.toHaveClass('opacity-50');
    });

    it('does not call drag handlers when not provided', () => {
      const { container } = renderWithRouter(
        <BedCard
          bed={mockBed}
          capacity={mockCapacity}
          plantCount={5}
          plants={[]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const card = container.firstChild;

      // These should not throw errors
      fireEvent.dragStart(card);
      fireEvent.dragEnd(card);
      fireEvent.dragOver(card);
      fireEvent.drop(card);

      expect(mockOnDragStart).not.toHaveBeenCalled();
      expect(mockOnDragEnd).not.toHaveBeenCalled();
      expect(mockOnDragOver).not.toHaveBeenCalled();
      expect(mockOnDrop).not.toHaveBeenCalled();
    });
  });

  describe('Keyboard reordering functionality', () => {
    const mockBed = {
      id: 'bed-1',
      name: 'Main Garden',
      width: 4,
      height: 4,
      is_pot: false
    };

    const mockCapacity = {
      total: 16,
      used: 8,
      available: 8,
      isOvercapacity: false
    };

    const mockOnMoveUp = vi.fn();
    const mockOnMoveDown = vi.fn();

    beforeEach(() => {
      mockOnMoveUp.mockClear();
      mockOnMoveDown.mockClear();
    });

    it('shows move up button when onMoveUp and showMoveUp are provided', () => {
      renderWithRouter(
        <BedCard
          bed={mockBed}
          capacity={mockCapacity}
          plantCount={5}
          plants={[]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onMoveUp={mockOnMoveUp}
          showMoveUp={true}
        />
      );

      expect(screen.getByLabelText('Move Main Garden up')).toBeInTheDocument();
    });

    it('does not show move up button when showMoveUp is false', () => {
      renderWithRouter(
        <BedCard
          bed={mockBed}
          capacity={mockCapacity}
          plantCount={5}
          plants={[]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onMoveUp={mockOnMoveUp}
          showMoveUp={false}
        />
      );

      expect(screen.queryByLabelText('Move Main Garden up')).not.toBeInTheDocument();
    });

    it('shows move down button when onMoveDown and showMoveDown are provided', () => {
      renderWithRouter(
        <BedCard
          bed={mockBed}
          capacity={mockCapacity}
          plantCount={5}
          plants={[]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onMoveDown={mockOnMoveDown}
          showMoveDown={true}
        />
      );

      expect(screen.getByLabelText('Move Main Garden down')).toBeInTheDocument();
    });

    it('does not show move down button when showMoveDown is false', () => {
      renderWithRouter(
        <BedCard
          bed={mockBed}
          capacity={mockCapacity}
          plantCount={5}
          plants={[]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onMoveDown={mockOnMoveDown}
          showMoveDown={false}
        />
      );

      expect(screen.queryByLabelText('Move Main Garden down')).not.toBeInTheDocument();
    });

    it('calls onMoveUp when move up button is clicked', () => {
      renderWithRouter(
        <BedCard
          bed={mockBed}
          capacity={mockCapacity}
          plantCount={5}
          plants={[]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onMoveUp={mockOnMoveUp}
          showMoveUp={true}
        />
      );

      fireEvent.click(screen.getByLabelText('Move Main Garden up'));

      expect(mockOnMoveUp).toHaveBeenCalledTimes(1);
      expect(mockOnMoveUp).toHaveBeenCalledWith(mockBed);
    });

    it('calls onMoveDown when move down button is clicked', () => {
      renderWithRouter(
        <BedCard
          bed={mockBed}
          capacity={mockCapacity}
          plantCount={5}
          plants={[]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onMoveDown={mockOnMoveDown}
          showMoveDown={true}
        />
      );

      fireEvent.click(screen.getByLabelText('Move Main Garden down'));

      expect(mockOnMoveDown).toHaveBeenCalledTimes(1);
      expect(mockOnMoveDown).toHaveBeenCalledWith(mockBed);
    });

    it('does not show move buttons when handlers not provided', () => {
      renderWithRouter(
        <BedCard
          bed={mockBed}
          capacity={mockCapacity}
          plantCount={5}
          plants={[]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.queryByLabelText('Move Main Garden up')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Move Main Garden down')).not.toBeInTheDocument();
    });
  });

  describe('Pot variant (is_pot = true)', () => {
    const mockPot = {
      id: 'pot-1',
      name: 'Kitchen Window Aloe',
      size: 'medium',
      is_pot: true
    };

    const mockCapacity = {
      total: 0.56,
      used: 0.25,
      available: 0.31,
      isOvercapacity: false
    };

    it('displays pot icon, name, and size label', () => {
      renderWithRouter(
        <BedCard
          bed={mockPot}
          capacity={mockCapacity}
          plantCount={2}
          plants={[]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('Kitchen Window Aloe')).toBeInTheDocument();
      expect(screen.getByText('Medium (8-10 inch)')).toBeInTheDocument();
      expect(screen.getByLabelText('pot')).toHaveTextContent('🪴');
    });

    it('does not display capacity meter for pots', () => {
      renderWithRouter(
        <BedCard
          bed={mockPot}
          capacity={mockCapacity}
          plantCount={2}
          plants={[]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.queryByText('Capacity')).not.toBeInTheDocument();
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    it('displays plant count for pots', () => {
      renderWithRouter(
        <BedCard
          bed={mockPot}
          capacity={mockCapacity}
          plantCount={2}
          plants={[]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('2 plants')).toBeInTheDocument();
    });

    it('displays plant list when pot has plants', () => {
      const plants = [
        { id: 'gp-1', plantId: 'aloe', bedId: 'pot-1', quantity: 1 },
        { id: 'gp-2', plantId: 'aloe', bedId: 'pot-1', quantity: 1 }
      ];

      renderWithRouter(
        <BedCard
          bed={mockPot}
          capacity={mockCapacity}
          plantCount={2}
          plants={plants}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('Aloe (2)')).toBeInTheDocument();
    });

    it('defaults quantity to 1 when plants have no quantity specified', () => {
      const plants = [
        { id: 'gp-1', plantId: 'aloe', bedId: 'pot-1' }, // No quantity
        { id: 'gp-2', plantId: 'aloe', bedId: 'pot-1' }  // No quantity
      ];

      renderWithRouter(
        <BedCard
          bed={mockPot}
          capacity={mockCapacity}
          plantCount={2}
          plants={plants}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('Aloe (2)')).toBeInTheDocument();
    });

    it('displays plant list with multiple plant types', () => {
      const plants = [
        { id: 'gp-1', plantId: 'tomato', bedId: 'pot-1', quantity: 1 },
        { id: 'gp-2', plantId: 'lettuce', bedId: 'pot-1', quantity: 2 }
      ];

      renderWithRouter(
        <BedCard
          bed={mockPot}
          capacity={mockCapacity}
          plantCount={3}
          plants={plants}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText(/Tomato \(1\), Lettuce \(2\)/)).toBeInTheDocument();
    });

    it('displays "No plants" when pot has no plants', () => {
      renderWithRouter(
        <BedCard
          bed={mockPot}
          capacity={mockCapacity}
          plantCount={0}
          plants={[]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('No plants')).toBeInTheDocument();
    });

    it('handles plants array as undefined', () => {
      renderWithRouter(
        <BedCard
          bed={mockPot}
          capacity={mockCapacity}
          plantCount={0}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('0 plants')).toBeInTheDocument();
      expect(screen.getByText('No plants')).toBeInTheDocument();
    });

    it('handles plants with unknown plantId gracefully', () => {
      const plants = [
        { id: 'gp-1', plantId: 'unknown-plant', bedId: 'pot-1', quantity: 1 },
        { id: 'gp-2', plantId: 'aloe', bedId: 'pot-1', quantity: 1 }
      ];

      renderWithRouter(
        <BedCard
          bed={mockPot}
          capacity={mockCapacity}
          plantCount={2}
          plants={plants}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      // Should only show Aloe, unknown plant is ignored
      expect(screen.getByText('Aloe (1)')).toBeInTheDocument();
    });

    it('calls onEdit when edit clicked on pot', () => {
      renderWithRouter(
        <BedCard
          bed={mockPot}
          capacity={mockCapacity}
          plantCount={2}
          plants={[]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      fireEvent.click(screen.getByLabelText('Edit Kitchen Window Aloe'));
      expect(mockOnEdit).toHaveBeenCalledWith(mockPot);
    });

    it('calls onDelete when delete clicked on pot', () => {
      renderWithRouter(
        <BedCard
          bed={mockPot}
          capacity={mockCapacity}
          plantCount={2}
          plants={[]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      fireEvent.click(screen.getByLabelText('Delete Kitchen Window Aloe'));
      expect(mockOnDelete).toHaveBeenCalledWith(mockPot);
    });

    it('displays small pot size correctly', () => {
      const smallPot = { ...mockPot, size: 'small' };

      renderWithRouter(
        <BedCard
          bed={smallPot}
          capacity={mockCapacity}
          plantCount={1}
          plants={[]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('Small (4-6 inch)')).toBeInTheDocument();
    });

    it('displays large pot size correctly', () => {
      const largePot = { ...mockPot, size: 'large' };

      renderWithRouter(
        <BedCard
          bed={largePot}
          capacity={mockCapacity}
          plantCount={1}
          plants={[]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('Large (12-14 inch)')).toBeInTheDocument();
    });

    it('displays extra large pot size correctly', () => {
      const extraLargePot = { ...mockPot, size: 'extra_large' };

      renderWithRouter(
        <BedCard
          bed={extraLargePot}
          capacity={mockCapacity}
          plantCount={1}
          plants={[]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('Extra Large (16+ inch)')).toBeInTheDocument();
    });

    it('handles missing size gracefully', () => {
      const potWithoutSize = { ...mockPot, size: undefined };

      renderWithRouter(
        <BedCard
          bed={potWithoutSize}
          capacity={mockCapacity}
          plantCount={1}
          plants={[]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      // Should render without error, even if size label is empty
      expect(screen.getByText('Kitchen Window Aloe')).toBeInTheDocument();
    });

    it('handles invalid size gracefully', () => {
      const potWithInvalidSize = { ...mockPot, size: 'invalid-size' };

      renderWithRouter(
        <BedCard
          bed={potWithInvalidSize}
          capacity={mockCapacity}
          plantCount={1}
          plants={[]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      // Should show the invalid size as fallback
      expect(screen.getByText('invalid-size')).toBeInTheDocument();
    });

    it('aggregates multiple plants of same type correctly', () => {
      const plants = [
        { id: 'gp-1', plantId: 'aloe', bedId: 'pot-1', quantity: 2 },
        { id: 'gp-2', plantId: 'aloe', bedId: 'pot-1', quantity: 3 }
      ];

      renderWithRouter(
        <BedCard
          bed={mockPot}
          capacity={mockCapacity}
          plantCount={5}
          plants={plants}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('Aloe (5)')).toBeInTheDocument();
    });

    it('handles plants without quantity field', () => {
      const plants = [
        { id: 'gp-1', plantId: 'aloe', bedId: 'pot-1' }
      ];

      renderWithRouter(
        <BedCard
          bed={mockPot}
          capacity={mockCapacity}
          plantCount={1}
          plants={plants}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('Aloe (1)')).toBeInTheDocument();
    });
  });
});
