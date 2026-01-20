import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import BedCard from './BedCard';

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
      render(
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
      render(
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
      render(
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
      render(
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
      render(
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
      render(
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
      render(
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
      render(
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
      render(
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
      render(
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
      render(
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
      render(
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
      render(
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
      render(
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
      render(
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

      render(
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
      render(
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
      render(
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
      render(
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

      render(
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

      render(
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

      render(
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
      render(
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
      render(
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

      render(
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
      render(
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
      render(
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

      render(
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

      render(
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

      render(
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

      render(
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

      render(
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

      render(
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

      render(
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
