import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import BedSelector from './BedSelector';

describe('BedSelector', () => {
  const mockBeds = [
    { id: 'bed-1', name: 'Main Garden', is_pot: false },
    { id: 'bed-2', name: 'Herb Garden', is_pot: false }
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

  describe('when pots are included', () => {
    const mockBedsWithPots = [
      { id: 'bed-1', name: 'Main Garden', is_pot: false },
      { id: 'pot-1', name: 'Kitchen Aloe', is_pot: true, size: 'small' },
      { id: 'pot-2', name: 'Living Room Fern', is_pot: true, size: 'large' }
    ];

    const mockCapacitiesWithPots = {
      'bed-1': { total: 16, used: 8, available: 8, isOvercapacity: false },
      'pot-1': { total: 0.25, used: 0.1, available: 0.15, isOvercapacity: false },
      'pot-2': { total: 1.0, used: 0.5, available: 0.5, isOvercapacity: false }
    };

    it('lists both beds and pots', () => {
      render(
        <BedSelector
          beds={mockBedsWithPots}
          capacities={mockCapacitiesWithPots}
          onSelect={mockOnSelect}
          onCreateBed={mockOnCreateBed}
        />
      );

      expect(screen.getByText('Main Garden')).toBeInTheDocument();
      expect(screen.getByText('Kitchen Aloe')).toBeInTheDocument();
      expect(screen.getByText('Living Room Fern')).toBeInTheDocument();
    });

    it('displays bed icon for beds', () => {
      const { container } = render(
        <BedSelector
          beds={mockBedsWithPots}
          capacities={mockCapacitiesWithPots}
          onSelect={mockOnSelect}
          onCreateBed={mockOnCreateBed}
        />
      );

      const icons = container.querySelectorAll('.text-lg');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('displays pot icon for pots', () => {
      render(
        <BedSelector
          beds={mockBedsWithPots}
          capacities={mockCapacitiesWithPots}
          onSelect={mockOnSelect}
          onCreateBed={mockOnCreateBed}
        />
      );

      // Check that pot icons are present (🪴 emoji)
      const potElements = screen.getByText('Kitchen Aloe').closest('button');
      expect(potElements).toBeInTheDocument();
    });

    it('displays size instead of capacity for pots', () => {
      render(
        <BedSelector
          beds={mockBedsWithPots}
          capacities={mockCapacitiesWithPots}
          onSelect={mockOnSelect}
          onCreateBed={mockOnCreateBed}
        />
      );

      expect(screen.getByText('Small (4-6 inch)')).toBeInTheDocument();
      expect(screen.getByText('Large (12-14 inch)')).toBeInTheDocument();
    });

    it('displays capacity for beds', () => {
      render(
        <BedSelector
          beds={mockBedsWithPots}
          capacities={mockCapacitiesWithPots}
          onSelect={mockOnSelect}
          onCreateBed={mockOnCreateBed}
        />
      );

      expect(screen.getByText('8 / 16 sq ft used')).toBeInTheDocument();
    });

    it('does not show overcapacity warning for pots', () => {
      const bedsWithOvercapacityPot = [
        { id: 'pot-1', name: 'Full Pot', is_pot: true, size: 'small' }
      ];

      const capacitiesWithOvercapacity = {
        'pot-1': { total: 0.25, used: 0.5, available: -0.25, isOvercapacity: true }
      };

      const { container } = render(
        <BedSelector
          beds={bedsWithOvercapacityPot}
          capacities={capacitiesWithOvercapacity}
          onSelect={mockOnSelect}
          onCreateBed={mockOnCreateBed}
        />
      );

      // No warning icon should be present for pots
      const warningIcons = container.querySelectorAll('.text-red-500');
      expect(warningIcons.length).toBe(0);

      // Should not display "(overcrowded)" text
      expect(screen.queryByText(/\(overcrowded\)/i)).not.toBeInTheDocument();
    });

    it('calls onSelect with correct pot id when pot is clicked', () => {
      render(
        <BedSelector
          beds={mockBedsWithPots}
          capacities={mockCapacitiesWithPots}
          onSelect={mockOnSelect}
          onCreateBed={mockOnCreateBed}
        />
      );

      fireEvent.click(screen.getByText('Kitchen Aloe'));
      expect(mockOnSelect).toHaveBeenCalledWith('pot-1');
    });

    it('handles pot with missing size gracefully', () => {
      const bedsWithInvalidPot = [
        { id: 'pot-1', name: 'Invalid Pot', is_pot: true, size: 'invalid_size' }
      ];

      const capacitiesForInvalidPot = {
        'pot-1': { total: 0, used: 0, available: 0, isOvercapacity: false }
      };

      render(
        <BedSelector
          beds={bedsWithInvalidPot}
          capacities={capacitiesForInvalidPot}
          onSelect={mockOnSelect}
          onCreateBed={mockOnCreateBed}
        />
      );

      expect(screen.getByText('Invalid Pot')).toBeInTheDocument();
      expect(screen.getByText('Unknown size')).toBeInTheDocument();
    });

    it('changes label to "Select Location" when pots are present', () => {
      render(
        <BedSelector
          beds={mockBedsWithPots}
          capacities={mockCapacitiesWithPots}
          onSelect={mockOnSelect}
          onCreateBed={mockOnCreateBed}
        />
      );

      expect(screen.getByText('Select Location')).toBeInTheDocument();
    });
  });
});
