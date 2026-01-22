import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import BedDeleteDialog from './BedDeleteDialog';
import * as storage from '../utils/storage';
import * as plantLibrary from '../data/plantLibrary';

vi.mock('../utils/storage');
vi.mock('../data/plantLibrary');

describe('BedDeleteDialog Component', () => {
  const mockBed = {
    id: 'bed-1',
    name: 'Test Bed',
    is_pot: false,
    width: 4,
    height: 4
  };

  const mockPot = {
    id: 'pot-1',
    name: 'Test Pot',
    is_pot: true,
    size: 'medium'
  };

  const mockPlants = [
    {
      id: 'plant-1',
      plantId: 'tomato',
      bedId: 'bed-1',
      quantity: 2,
      variety: 'Roma'
    },
    {
      id: 'plant-2',
      plantId: 'lettuce',
      bedId: 'bed-1',
      quantity: 1,
      variety: null
    }
  ];

  const mockOtherBeds = [
    {
      id: 'bed-2',
      name: 'Other Bed',
      is_pot: false,
      width: 8,
      height: 4
    },
    {
      id: 'pot-2',
      name: 'Other Pot',
      is_pot: true,
      size: 'large'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    plantLibrary.getPlantById.mockImplementation((id) => {
      if (id === 'tomato') return { id: 'tomato', name: 'Tomato', squaresPerPlant: 1 };
      if (id === 'lettuce') return { id: 'lettuce', name: 'Lettuce', squaresPerPlant: 0.25 };
      return null;
    });
    storage.getBedCapacity.mockReturnValue({
      total: 32,
      used: 10,
      available: 22,
      isOvercapacity: false
    });
  });

  describe('Empty Bed Deletion', () => {
    beforeEach(() => {
      storage.getPlantsByBed.mockReturnValue([]);
      storage.getGardenBeds.mockReturnValue([mockBed, ...mockOtherBeds]);
    });

    it('should render confirmation dialog for empty bed', () => {
      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      render(<BedDeleteDialog bed={mockBed} onConfirm={onConfirm} onCancel={onCancel} />);

      expect(screen.getByRole('heading', { name: 'Delete Bed' })).toBeInTheDocument();
      expect(screen.getByText(/Are you sure you want to delete/)).toBeInTheDocument();
      expect(screen.getByText('Test Bed', { exact: false })).toBeInTheDocument();
    });

    it('should call onConfirm with correct options when deleting empty bed', () => {
      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      render(<BedDeleteDialog bed={mockBed} onConfirm={onConfirm} onCancel={onCancel} />);

      const deleteButton = screen.getByRole('button', { name: /Delete bed/i });
      fireEvent.click(deleteButton);

      expect(onConfirm).toHaveBeenCalledWith({
        deleteAllPlants: false,
        destinationBedId: null
      });
    });

    it('should call onCancel when cancel button is clicked', () => {
      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      render(<BedDeleteDialog bed={mockBed} onConfirm={onConfirm} onCancel={onCancel} />);

      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      fireEvent.click(cancelButton);

      expect(onCancel).toHaveBeenCalled();
      expect(onConfirm).not.toHaveBeenCalled();
    });

    it('should render confirmation dialog for empty pot', () => {
      storage.getPlantsByBed.mockReturnValue([]);
      storage.getGardenBeds.mockReturnValue([mockPot, ...mockOtherBeds]);

      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      render(<BedDeleteDialog bed={mockPot} onConfirm={onConfirm} onCancel={onCancel} />);

      expect(screen.getByRole('heading', { name: 'Delete Pot' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Delete pot/i })).toBeInTheDocument();
    });
  });

  describe('Bed with Plants Deletion', () => {
    beforeEach(() => {
      storage.getPlantsByBed.mockReturnValue(mockPlants);
      storage.getGardenBeds.mockReturnValue([mockBed, ...mockOtherBeds]);
    });

    it('should display list of plants in bed', () => {
      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      render(<BedDeleteDialog bed={mockBed} onConfirm={onConfirm} onCancel={onCancel} />);

      expect(screen.getByText(/contains 2 plants/)).toBeInTheDocument();
      expect(screen.getByText(/2x Tomato \(Roma\)/)).toBeInTheDocument();
      expect(screen.getByText(/Lettuce/)).toBeInTheDocument();
    });

    it('should display destination bed dropdown with other beds', () => {
      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      render(<BedDeleteDialog bed={mockBed} onConfirm={onConfirm} onCancel={onCancel} />);

      const dropdown = screen.getByLabelText(/Move plants to:/);
      expect(dropdown).toBeInTheDocument();
      expect(screen.getByText('Other Bed', { exact: false })).toBeInTheDocument();
      expect(screen.getByText('Other Pot', { exact: false })).toBeInTheDocument();
    });

    it('should show icons for beds and pots in dropdown', () => {
      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      render(<BedDeleteDialog bed={mockBed} onConfirm={onConfirm} onCancel={onCancel} />);

      const dropdown = screen.getByLabelText(/Move plants to:/);
      expect(dropdown.innerHTML).toContain('🌱');
      expect(dropdown.innerHTML).toContain('🪴');
    });

    it('should display delete all plants checkbox', () => {
      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      render(<BedDeleteDialog bed={mockBed} onConfirm={onConfirm} onCancel={onCancel} />);

      const checkbox = screen.getByLabelText(/Delete all plants in this bed/);
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).not.toBeChecked();
    });

    it('should show error when submitting without selecting destination or delete option', () => {
      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      render(<BedDeleteDialog bed={mockBed} onConfirm={onConfirm} onCancel={onCancel} />);

      const deleteButton = screen.getByRole('button', { name: /Delete Bed/i });
      fireEvent.click(deleteButton);

      expect(screen.getByText(/Please select a destination/)).toBeInTheDocument();
      expect(onConfirm).not.toHaveBeenCalled();
    });

    it('should call onConfirm with destinationBedId when bed is selected', () => {
      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      render(<BedDeleteDialog bed={mockBed} onConfirm={onConfirm} onCancel={onCancel} />);

      const dropdown = screen.getByLabelText(/Move plants to:/);
      fireEvent.change(dropdown, { target: { value: 'bed-2' } });

      const deleteButton = screen.getByRole('button', { name: /Delete Bed/i });
      fireEvent.click(deleteButton);

      expect(onConfirm).toHaveBeenCalledWith({
        deleteAllPlants: false,
        destinationBedId: 'bed-2'
      });
    });

    it('should call onConfirm with deleteAllPlants when checkbox is checked', () => {
      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      render(<BedDeleteDialog bed={mockBed} onConfirm={onConfirm} onCancel={onCancel} />);

      const checkbox = screen.getByLabelText(/Delete all plants in this bed/);
      fireEvent.click(checkbox);

      const deleteButton = screen.getByRole('button', { name: /Delete Bed/i });
      fireEvent.click(deleteButton);

      expect(onConfirm).toHaveBeenCalledWith({
        deleteAllPlants: true,
        destinationBedId: null
      });
    });

    it('should hide destination dropdown when delete all plants is checked', () => {
      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      render(<BedDeleteDialog bed={mockBed} onConfirm={onConfirm} onCancel={onCancel} />);

      let dropdown = screen.getByLabelText(/Move plants to:/);
      expect(dropdown).toBeInTheDocument();

      const checkbox = screen.getByLabelText(/Delete all plants in this bed/);
      fireEvent.click(checkbox);

      dropdown = screen.queryByLabelText(/Move plants to:/);
      expect(dropdown).not.toBeInTheDocument();
    });

    it('should display plant quantity correctly for single plant', () => {
      storage.getPlantsByBed.mockReturnValue([
        {
          id: 'plant-1',
          plantId: 'tomato',
          bedId: 'bed-1',
          quantity: 1,
          variety: null
        }
      ]);

      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      render(<BedDeleteDialog bed={mockBed} onConfirm={onConfirm} onCancel={onCancel} />);

      expect(screen.getByText('Tomato')).toBeInTheDocument();
      expect(screen.queryByText(/1x Tomato/)).not.toBeInTheDocument();
    });

    it('should handle plant without quantity field (defaults to 1)', () => {
      storage.getPlantsByBed.mockReturnValue([
        {
          id: 'plant-1',
          plantId: 'lettuce',
          bedId: 'bed-1',
          // quantity field is missing/undefined
          variety: null
        }
      ]);

      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      render(<BedDeleteDialog bed={mockBed} onConfirm={onConfirm} onCancel={onCancel} />);

      // Should display just "Lettuce" without quantity prefix
      expect(screen.getByText('Lettuce')).toBeInTheDocument();
      expect(screen.queryByText(/x Lettuce/)).not.toBeInTheDocument();
    });

    it('should handle unknown plant gracefully', () => {
      storage.getPlantsByBed.mockReturnValue([
        {
          id: 'plant-1',
          plantId: 'unknown',
          bedId: 'bed-1',
          quantity: 1,
          variety: null
        }
      ]);

      plantLibrary.getPlantById.mockReturnValue(null);

      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      render(<BedDeleteDialog bed={mockBed} onConfirm={onConfirm} onCancel={onCancel} />);

      expect(screen.getByText('Unknown')).toBeInTheDocument();
    });

    it('should handle unknown plant with variety', () => {
      storage.getPlantsByBed.mockReturnValue([
        {
          id: 'plant-1',
          plantId: 'unknown',
          bedId: 'bed-1',
          quantity: 1,
          variety: 'Special Variety'
        }
      ]);

      plantLibrary.getPlantById.mockReturnValue(null);

      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      render(<BedDeleteDialog bed={mockBed} onConfirm={onConfirm} onCancel={onCancel} />);

      expect(screen.getByText('Unknown (Special Variety)')).toBeInTheDocument();
    });
  });

  describe('Last Bed Scenario', () => {
    beforeEach(() => {
      storage.getPlantsByBed.mockReturnValue(mockPlants);
      storage.getGardenBeds.mockReturnValue([mockBed]); // Only one bed
    });

    it('should show warning when deleting last bed with plants', () => {
      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      render(<BedDeleteDialog bed={mockBed} onConfirm={onConfirm} onCancel={onCancel} />);

      expect(screen.getByText(/This is the only location/)).toBeInTheDocument();
      expect(screen.getByText(/You must delete the plants/)).toBeInTheDocument();
    });

    it('should not show destination dropdown when no other beds exist', () => {
      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      render(<BedDeleteDialog bed={mockBed} onConfirm={onConfirm} onCancel={onCancel} />);

      const dropdown = screen.queryByLabelText(/Move plants to:/);
      expect(dropdown).not.toBeInTheDocument();
    });

    it('should allow deletion with delete all plants checkbox', () => {
      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      render(<BedDeleteDialog bed={mockBed} onConfirm={onConfirm} onCancel={onCancel} />);

      const checkbox = screen.getByLabelText(/Delete all plants in this bed/);
      fireEvent.click(checkbox);

      const deleteButton = screen.getByRole('button', { name: /Delete Bed/i });
      fireEvent.click(deleteButton);

      expect(onConfirm).toHaveBeenCalledWith({
        deleteAllPlants: true,
        destinationBedId: null
      });
    });
  });

  describe('Pot Deletion', () => {
    beforeEach(() => {
      storage.getPlantsByBed.mockReturnValue(mockPlants);
      storage.getGardenBeds.mockReturnValue([mockPot, ...mockOtherBeds]);
    });

    it('should render pot-specific text', () => {
      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      render(<BedDeleteDialog bed={mockPot} onConfirm={onConfirm} onCancel={onCancel} />);

      expect(screen.getByRole('heading', { name: 'Delete Pot' })).toBeInTheDocument();
      expect(screen.getByLabelText(/Delete all plants in this pot/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Delete Pot/i })).toBeInTheDocument();
    });

    it('should allow reassignment from pot to bed', () => {
      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      render(<BedDeleteDialog bed={mockPot} onConfirm={onConfirm} onCancel={onCancel} />);

      const dropdown = screen.getByLabelText(/Move plants to:/);
      fireEvent.change(dropdown, { target: { value: 'bed-2' } });

      const deleteButton = screen.getByRole('button', { name: /Delete Pot/i });
      fireEvent.click(deleteButton);

      expect(onConfirm).toHaveBeenCalledWith({
        deleteAllPlants: false,
        destinationBedId: 'bed-2'
      });
    });

    it('should allow reassignment from pot to another pot', () => {
      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      render(<BedDeleteDialog bed={mockPot} onConfirm={onConfirm} onCancel={onCancel} />);

      const dropdown = screen.getByLabelText(/Move plants to:/);
      fireEvent.change(dropdown, { target: { value: 'pot-2' } });

      const deleteButton = screen.getByRole('button', { name: /Delete Pot/i });
      fireEvent.click(deleteButton);

      expect(onConfirm).toHaveBeenCalledWith({
        deleteAllPlants: false,
        destinationBedId: 'pot-2'
      });
    });
  });

  describe('Overcrowding Validation', () => {
    beforeEach(() => {
      storage.getPlantsByBed.mockReturnValue(mockPlants);
      storage.getGardenBeds.mockReturnValue([mockBed, ...mockOtherBeds]);
    });

    it('should not show warning when destination has enough space', () => {
      storage.getBedCapacity.mockReturnValue({
        total: 32,
        used: 10,
        available: 22,
        isOvercapacity: false
      });

      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      render(<BedDeleteDialog bed={mockBed} onConfirm={onConfirm} onCancel={onCancel} />);

      const dropdown = screen.getByLabelText(/Move plants to:/);
      fireEvent.change(dropdown, { target: { value: 'bed-2' } });

      expect(screen.queryByText(/Warning.*overcrowd/i)).not.toBeInTheDocument();
    });

    it('should show warning when destination would be overcrowded', () => {
      storage.getBedCapacity.mockReturnValue({
        total: 32,
        used: 30,
        available: 2,
        isOvercapacity: false
      });

      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      render(<BedDeleteDialog bed={mockBed} onConfirm={onConfirm} onCancel={onCancel} />);

      const dropdown = screen.getByLabelText(/Move plants to:/);
      fireEvent.change(dropdown, { target: { value: 'bed-2' } });

      expect(screen.getByText(/Warning.*overcrowd/i)).toBeInTheDocument();
    });

    it('should calculate correct overage amount in warning', () => {
      // Plants need 2.25 squares (2 tomatoes @ 1 each + 1 lettuce @ 0.25)
      // Available space: 2 squares
      // Overage: 0.25 squares (displayed as 0.3 due to toFixed(1) rounding)
      storage.getBedCapacity.mockReturnValue({
        total: 32,
        used: 30,
        available: 2,
        isOvercapacity: false
      });

      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      render(<BedDeleteDialog bed={mockBed} onConfirm={onConfirm} onCancel={onCancel} />);

      const dropdown = screen.getByLabelText(/Move plants to:/);
      fireEvent.change(dropdown, { target: { value: 'bed-2' } });

      expect(screen.getByText(/overcrowd the destination by 0\.3 square/i)).toBeInTheDocument();
    });

    it('should show singular "square" when overage is exactly 1', () => {
      // Set available to 1.25 so that 2.25 - 1.25 = 1.0 square overage
      storage.getBedCapacity.mockReturnValue({
        total: 32,
        used: 30.75,
        available: 1.25,
        isOvercapacity: false
      });

      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      render(<BedDeleteDialog bed={mockBed} onConfirm={onConfirm} onCancel={onCancel} />);

      const dropdown = screen.getByLabelText(/Move plants to:/);
      fireEvent.change(dropdown, { target: { value: 'bed-2' } });

      // Should use singular "square" when overage is exactly 1.0
      expect(screen.getByText(/1\.0 square\./i)).toBeInTheDocument();
      expect(screen.queryByText(/1\.0 squares/i)).not.toBeInTheDocument();
    });

    it('should show plural "squares" when overage is greater than 1', () => {
      storage.getBedCapacity.mockReturnValue({
        total: 32,
        used: 30,
        available: 0.5,
        isOvercapacity: false
      });

      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      render(<BedDeleteDialog bed={mockBed} onConfirm={onConfirm} onCancel={onCancel} />);

      const dropdown = screen.getByLabelText(/Move plants to:/);
      fireEvent.change(dropdown, { target: { value: 'bed-2' } });

      expect(screen.getByText(/1\.8 squares/i)).toBeInTheDocument();
    });

    it('should not show warning when delete all plants is checked', () => {
      storage.getBedCapacity.mockReturnValue({
        total: 32,
        used: 30,
        available: 2,
        isOvercapacity: false
      });

      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      render(<BedDeleteDialog bed={mockBed} onConfirm={onConfirm} onCancel={onCancel} />);

      const dropdown = screen.getByLabelText(/Move plants to:/);
      fireEvent.change(dropdown, { target: { value: 'bed-2' } });

      // Warning should appear
      expect(screen.getByText(/Warning.*overcrowd/i)).toBeInTheDocument();

      // Check delete all plants
      const checkbox = screen.getByLabelText(/Delete all plants in this bed/);
      fireEvent.click(checkbox);

      // Warning should disappear
      expect(screen.queryByText(/Warning.*overcrowd/i)).not.toBeInTheDocument();
    });

    it('should hide warning when destination is deselected', () => {
      storage.getBedCapacity.mockReturnValue({
        total: 32,
        used: 30,
        available: 2,
        isOvercapacity: false
      });

      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      render(<BedDeleteDialog bed={mockBed} onConfirm={onConfirm} onCancel={onCancel} />);

      const dropdown = screen.getByLabelText(/Move plants to:/);
      fireEvent.change(dropdown, { target: { value: 'bed-2' } });

      // Warning should appear
      expect(screen.getByText(/Warning.*overcrowd/i)).toBeInTheDocument();

      // Deselect destination
      fireEvent.change(dropdown, { target: { value: '' } });

      // Warning should disappear
      expect(screen.queryByText(/Warning.*overcrowd/i)).not.toBeInTheDocument();
    });

    it('should still allow submission when overcrowding warning is shown', () => {
      storage.getBedCapacity.mockReturnValue({
        total: 32,
        used: 30,
        available: 2,
        isOvercapacity: false
      });

      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      render(<BedDeleteDialog bed={mockBed} onConfirm={onConfirm} onCancel={onCancel} />);

      const dropdown = screen.getByLabelText(/Move plants to:/);
      fireEvent.change(dropdown, { target: { value: 'bed-2' } });

      expect(screen.getByText(/Warning.*overcrowd/i)).toBeInTheDocument();

      const deleteButton = screen.getByRole('button', { name: /Delete Bed/i });
      fireEvent.click(deleteButton);

      expect(onConfirm).toHaveBeenCalledWith({
        deleteAllPlants: false,
        destinationBedId: 'bed-2'
      });
    });

    it('should calculate total squares needed correctly with multiple plants', () => {
      // 2 tomatoes @ 1 square each = 2
      // 1 lettuce @ 0.25 square = 0.25
      // Total needed: 2.25 squares
      storage.getBedCapacity.mockReturnValue({
        total: 10,
        used: 8,
        available: 2,
        isOvercapacity: false
      });

      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      render(<BedDeleteDialog bed={mockBed} onConfirm={onConfirm} onCancel={onCancel} />);

      const dropdown = screen.getByLabelText(/Move plants to:/);
      fireEvent.change(dropdown, { target: { value: 'bed-2' } });

      // Should show warning because 2.25 > 2 (overage of 0.25)
      expect(screen.getByText(/overcrowd/i)).toBeInTheDocument();
    });

    it('should handle plants with missing quantity field in calculation', () => {
      storage.getPlantsByBed.mockReturnValue([
        {
          id: 'plant-1',
          plantId: 'tomato',
          bedId: 'bed-1'
          // quantity field is missing, should default to 1
        }
      ]);

      storage.getBedCapacity.mockReturnValue({
        total: 10,
        used: 9.5,
        available: 0.5,
        isOvercapacity: false
      });

      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      render(<BedDeleteDialog bed={mockBed} onConfirm={onConfirm} onCancel={onCancel} />);

      const dropdown = screen.getByLabelText(/Move plants to:/);
      fireEvent.change(dropdown, { target: { value: 'bed-2' } });

      // 1 tomato needs 1 square, available is 0.5, so should warn
      expect(screen.getByText(/overcrowd/i)).toBeInTheDocument();
    });

    it('should handle unknown plants gracefully in calculation', () => {
      storage.getPlantsByBed.mockReturnValue([
        {
          id: 'plant-1',
          plantId: 'unknown',
          bedId: 'bed-1',
          quantity: 5
        }
      ]);

      plantLibrary.getPlantById.mockReturnValue(null);

      storage.getBedCapacity.mockReturnValue({
        total: 10,
        used: 9.5,
        available: 0.5,
        isOvercapacity: false
      });

      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      render(<BedDeleteDialog bed={mockBed} onConfirm={onConfirm} onCancel={onCancel} />);

      const dropdown = screen.getByLabelText(/Move plants to:/);
      fireEvent.change(dropdown, { target: { value: 'bed-2' } });

      // Unknown plants should be ignored in calculation, so no warning
      expect(screen.queryByText(/overcrowd/i)).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle form submission when onConfirm callback is triggered', () => {
      storage.getPlantsByBed.mockReturnValue([]);
      storage.getGardenBeds.mockReturnValue([mockBed, ...mockOtherBeds]);

      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      render(<BedDeleteDialog bed={mockBed} onConfirm={onConfirm} onCancel={onCancel} />);

      // Click the delete button which should trigger form submission
      const deleteButton = screen.getByRole('button', { name: /Delete bed/i });
      fireEvent.click(deleteButton);

      expect(onConfirm).toHaveBeenCalled();
    });

    it('should clear error when destination is selected after error', () => {
      storage.getPlantsByBed.mockReturnValue(mockPlants);
      storage.getGardenBeds.mockReturnValue([mockBed, ...mockOtherBeds]);

      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      render(<BedDeleteDialog bed={mockBed} onConfirm={onConfirm} onCancel={onCancel} />);

      // First, trigger error
      const deleteButton = screen.getByRole('button', { name: /Delete Bed/i });
      fireEvent.click(deleteButton);
      expect(screen.getByText(/Please select a destination/)).toBeInTheDocument();

      // Then select a destination and submit
      const dropdown = screen.getByLabelText(/Move plants to:/);
      fireEvent.change(dropdown, { target: { value: 'bed-2' } });
      fireEvent.click(deleteButton);

      expect(screen.queryByText(/Please select a destination/)).not.toBeInTheDocument();
      expect(onConfirm).toHaveBeenCalled();
    });
  });
});
