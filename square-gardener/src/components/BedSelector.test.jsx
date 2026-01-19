import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import BedSelector from './BedSelector';

describe('BedSelector', () => {
  const mockBeds = [
    { id: 'bed-1', name: 'Main Garden' },
    { id: 'bed-2', name: 'Herb Garden' }
  ];

  const mockCapacities = {
    'bed-1': { total: 16, used: 8, available: 8, isOvercapacity: false },
    'bed-2': { total: 8, used: 10, available: -2, isOvercapacity: true }
  };

  const mockOnSelect = vi.fn();
  const mockOnCreateBed = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('when beds exist', () => {
    it('lists all available beds', () => {
      render(
        <BedSelector
          beds={mockBeds}
          capacities={mockCapacities}
          onSelect={mockOnSelect}
          onCreateBed={mockOnCreateBed}
        />
      );

      expect(screen.getByText('Main Garden')).toBeInTheDocument();
      expect(screen.getByText('Herb Garden')).toBeInTheDocument();
    });

    it('shows capacity for each bed', () => {
      render(
        <BedSelector
          beds={mockBeds}
          capacities={mockCapacities}
          onSelect={mockOnSelect}
          onCreateBed={mockOnCreateBed}
        />
      );

      expect(screen.getByText('8 / 16 sq ft used')).toBeInTheDocument();
      expect(screen.getByText('10 / 8 sq ft used (overcrowded)')).toBeInTheDocument();
    });

    it('highlights overcrowded beds with warning icon', () => {
      const { container } = render(
        <BedSelector
          beds={mockBeds}
          capacities={mockCapacities}
          onSelect={mockOnSelect}
          onCreateBed={mockOnCreateBed}
        />
      );

      const warningIcons = container.querySelectorAll('.text-red-500');
      expect(warningIcons.length).toBeGreaterThan(0);
    });

    it('calls onSelect with correct bedId', () => {
      render(
        <BedSelector
          beds={mockBeds}
          capacities={mockCapacities}
          onSelect={mockOnSelect}
          onCreateBed={mockOnCreateBed}
        />
      );

      fireEvent.click(screen.getByText('Main Garden'));
      expect(mockOnSelect).toHaveBeenCalledWith('bed-1');
    });

    it('shows selected bed with visual indicator', () => {
      const { container } = render(
        <BedSelector
          beds={mockBeds}
          capacities={mockCapacities}
          selectedBedId="bed-1"
          onSelect={mockOnSelect}
          onCreateBed={mockOnCreateBed}
        />
      );

      const selectedButton = container.querySelector('.border-primary');
      expect(selectedButton).toBeInTheDocument();
    });

    it('handles missing capacity data gracefully', () => {
      const bedsWithMissingCapacity = [
        ...mockBeds,
        { id: 'bed-3', name: 'New Bed' }
      ];

      render(
        <BedSelector
          beds={bedsWithMissingCapacity}
          capacities={mockCapacities}
          onSelect={mockOnSelect}
          onCreateBed={mockOnCreateBed}
        />
      );

      expect(screen.getByText('New Bed')).toBeInTheDocument();
      expect(screen.getByText('0 / 0 sq ft used')).toBeInTheDocument();
    });
  });

  describe('when no beds exist', () => {
    it('shows create bed prompt if no beds', () => {
      render(
        <BedSelector
          beds={[]}
          capacities={{}}
          onSelect={mockOnSelect}
          onCreateBed={mockOnCreateBed}
        />
      );

      expect(screen.getByText('You need to create a bed before adding plants.')).toBeInTheDocument();
      expect(screen.getByText('Create Your First Bed')).toBeInTheDocument();
    });

    it('calls onCreateBed when create button clicked', () => {
      render(
        <BedSelector
          beds={[]}
          capacities={{}}
          onSelect={mockOnSelect}
          onCreateBed={mockOnCreateBed}
        />
      );

      fireEvent.click(screen.getByText('Create Your First Bed'));
      expect(mockOnCreateBed).toHaveBeenCalled();
    });

    it('hides create button when onCreateBed is not provided', () => {
      render(
        <BedSelector
          beds={[]}
          capacities={{}}
          onSelect={mockOnSelect}
        />
      );

      expect(screen.getByText('You need to create a bed before adding plants.')).toBeInTheDocument();
      expect(screen.queryByText('Create Your First Bed')).not.toBeInTheDocument();
    });
  });
});
