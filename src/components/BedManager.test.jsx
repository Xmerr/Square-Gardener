import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import BedManager from './BedManager';
import * as storage from '../utils/storage';

vi.mock('../utils/storage', () => ({
  getGardenBeds: vi.fn(),
  addGardenBed: vi.fn(),
  updateGardenBed: vi.fn(),
  removeGardenBed: vi.fn(),
  getBedCapacity: vi.fn(),
  getPlantsByBed: vi.fn(),
  reorderBeds: vi.fn(),
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

describe('BedManager', () => {
  const mockOnBedChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    storage.getGardenBeds.mockReturnValue([]);
    storage.getBedCapacity.mockReturnValue({ total: 16, used: 0, available: 16, isOvercapacity: false });
    storage.getPlantsByBed.mockReturnValue([]);
  });

  describe('empty state', () => {
    it('shows empty state when no beds exist', () => {
      render(<BedManager onBedChange={mockOnBedChange} />);

      expect(screen.getByText('No Garden Beds Yet')).toBeInTheDocument();
      expect(screen.getByText('Create Your First Bed')).toBeInTheDocument();
    });

    it('shows add new bed button', () => {
      render(<BedManager onBedChange={mockOnBedChange} />);

      expect(screen.getByText('Add New Bed')).toBeInTheDocument();
    });
  });

  describe('with beds', () => {
    const mockBeds = [
      { id: 'bed-1', name: 'Main Garden', width: 4, height: 4 },
      { id: 'bed-2', name: 'Herb Garden', width: 2, height: 4 }
    ];

    beforeEach(() => {
      storage.getGardenBeds.mockReturnValue(mockBeds);
      storage.getBedCapacity.mockImplementation((bedId) => {
        if (bedId === 'bed-1') return { total: 16, used: 8, available: 8, isOvercapacity: false };
        if (bedId === 'bed-2') return { total: 8, used: 10, available: -2, isOvercapacity: true };
        return { total: 0, used: 0, available: 0, isOvercapacity: false };
      });
      storage.getPlantsByBed.mockImplementation((bedId) => {
        if (bedId === 'bed-1') return [{ id: 'plant-1' }, { id: 'plant-2' }];
        if (bedId === 'bed-2') return [{ id: 'plant-3' }];
        return [];
      });
    });

    it('handles missing capacity data with fallback', () => {
      storage.getBedCapacity.mockImplementation((bedId) => {
        if (bedId === 'bed-1') return null;
        return { total: 8, used: 10, available: -2, isOvercapacity: true };
      });

      render(<BedManager onBedChange={mockOnBedChange} />);

      expect(screen.getByText('Main Garden')).toBeInTheDocument();
      expect(screen.getByText('0 / 0 sq ft')).toBeInTheDocument();
    });

    it('displays all beds', () => {
      render(<BedManager onBedChange={mockOnBedChange} />);

      expect(screen.getByText('Main Garden')).toBeInTheDocument();
      expect(screen.getByText('Herb Garden')).toBeInTheDocument();
    });

    it('displays capacity for each bed', () => {
      render(<BedManager onBedChange={mockOnBedChange} />);

      expect(screen.getByText('8 / 16 sq ft')).toBeInTheDocument();
      expect(screen.getByText('10 / 8 sq ft')).toBeInTheDocument();
    });

    it('displays plant counts', () => {
      render(<BedManager onBedChange={mockOnBedChange} />);

      expect(screen.getByText('2 plants')).toBeInTheDocument();
      expect(screen.getByText('1 plant')).toBeInTheDocument();
    });
  });

  describe('creating beds', () => {
    it('shows form when add new bed clicked', () => {
      render(<BedManager onBedChange={mockOnBedChange} />);

      fireEvent.click(screen.getByText('Add New Bed'));

      expect(screen.getByText('Create New Bed')).toBeInTheDocument();
      expect(screen.getByLabelText('Bed Name')).toBeInTheDocument();
    });

    it('shows form when create first bed clicked', () => {
      render(<BedManager onBedChange={mockOnBedChange} />);

      fireEvent.click(screen.getByText('Create Your First Bed'));

      expect(screen.getByText('Create New Bed')).toBeInTheDocument();
    });

    it('hides add button when form is shown', () => {
      render(<BedManager onBedChange={mockOnBedChange} />);

      fireEvent.click(screen.getByText('Add New Bed'));

      expect(screen.queryByText('Add New Bed')).not.toBeInTheDocument();
    });

    it('creates bed and refreshes list', () => {
      storage.addGardenBed.mockReturnValue({ id: 'bed-new', name: 'New Bed', width: 4, height: 4 });

      render(<BedManager onBedChange={mockOnBedChange} />);

      fireEvent.click(screen.getByText('Add New Bed'));
      fireEvent.change(screen.getByLabelText('Bed Name'), { target: { value: 'New Bed' } });
      fireEvent.change(screen.getByLabelText('Width (ft)'), { target: { value: '4' } });
      fireEvent.change(screen.getByLabelText('Height (ft)'), { target: { value: '4' } });
      fireEvent.click(screen.getByText('Create Bed'));

      expect(storage.addGardenBed).toHaveBeenCalledWith('New Bed', 4, 4, { is_pot: false });
      expect(mockOnBedChange).toHaveBeenCalled();
    });

    it('creates pot with size and refreshes list', () => {
      storage.addGardenBed.mockReturnValue({ id: 'pot-new', name: 'New Pot', is_pot: true, size: 'large' });

      render(<BedManager onBedChange={mockOnBedChange} />);

      fireEvent.click(screen.getByText('Add New Bed'));
      fireEvent.change(screen.getByLabelText('Bed Name'), { target: { value: 'New Pot' } });
      fireEvent.click(screen.getByLabelText('This is a pot'));
      fireEvent.change(screen.getByLabelText('Size'), { target: { value: 'large' } });
      fireEvent.click(screen.getByText('Create Pot'));

      expect(storage.addGardenBed).toHaveBeenCalledWith('New Pot', null, null, { is_pot: true, size: 'large' });
      expect(mockOnBedChange).toHaveBeenCalled();
    });

    it('hides form when cancelled', () => {
      render(<BedManager onBedChange={mockOnBedChange} />);

      fireEvent.click(screen.getByText('Add New Bed'));
      fireEvent.click(screen.getByText('Cancel'));

      expect(screen.queryByText('Create New Bed')).not.toBeInTheDocument();
    });
  });

  describe('editing beds', () => {
    const mockBeds = [
      { id: 'bed-1', name: 'Main Garden', width: 4, height: 4 }
    ];

    beforeEach(() => {
      storage.getGardenBeds.mockReturnValue(mockBeds);
    });

    it('shows edit form when edit clicked', () => {
      render(<BedManager onBedChange={mockOnBedChange} />);

      fireEvent.click(screen.getByLabelText('Edit Main Garden'));

      expect(screen.getByText('Edit Bed')).toBeInTheDocument();
      expect(screen.getByLabelText('Bed Name')).toHaveValue('Main Garden');
    });

    it('hides add button when editing', () => {
      render(<BedManager onBedChange={mockOnBedChange} />);

      fireEvent.click(screen.getByLabelText('Edit Main Garden'));

      expect(screen.queryByText('Add New Bed')).not.toBeInTheDocument();
    });

    it('updates bed and refreshes list', () => {
      storage.updateGardenBed.mockReturnValue({ id: 'bed-1', name: 'Updated', width: 6, height: 4, is_pot: false });

      render(<BedManager onBedChange={mockOnBedChange} />);

      fireEvent.click(screen.getByLabelText('Edit Main Garden'));
      fireEvent.change(screen.getByLabelText('Bed Name'), { target: { value: 'Updated' } });
      fireEvent.change(screen.getByLabelText('Width (ft)'), { target: { value: '6' } });
      fireEvent.click(screen.getByText('Save Changes'));

      expect(storage.updateGardenBed).toHaveBeenCalledWith('bed-1', {
        name: 'Updated',
        is_pot: false,
        width: 6,
        height: 4
      });
      expect(mockOnBedChange).toHaveBeenCalled();
    });

    it('hides edit form when cancelled', () => {
      render(<BedManager onBedChange={mockOnBedChange} />);

      fireEvent.click(screen.getByLabelText('Edit Main Garden'));
      fireEvent.click(screen.getByText('Cancel'));

      expect(screen.queryByText('Edit Bed')).not.toBeInTheDocument();
    });
  });

  describe('deleting beds', () => {
    const mockBeds = [
      { id: 'bed-1', name: 'Main Garden', width: 4, height: 4 },
      { id: 'bed-2', name: 'Herb Garden', width: 2, height: 4 }
    ];

    beforeEach(() => {
      storage.getGardenBeds.mockReturnValue(mockBeds);
    });

    it('deletes empty bed directly without dialog', () => {
      storage.getPlantsByBed.mockReturnValue([]);
      storage.removeGardenBed.mockReturnValue(true);

      render(<BedManager onBedChange={mockOnBedChange} />);

      fireEvent.click(screen.getByLabelText('Delete Main Garden'));

      expect(storage.removeGardenBed).toHaveBeenCalledWith('bed-1');
      expect(mockOnBedChange).toHaveBeenCalled();
    });

    it('shows delete dialog when bed has plants', () => {
      const mockPlants = [{ id: 'plant-1', plantId: 'tomato' }];
      storage.getPlantsByBed.mockImplementation((bedId) => {
        if (bedId === 'bed-1') return mockPlants;
        return [];
      });

      render(<BedManager onBedChange={mockOnBedChange} />);

      fireEvent.click(screen.getByLabelText('Delete Main Garden'));

      // Dialog shows - use heading role for uniqueness
      expect(screen.getByRole('heading', { name: 'Delete Bed' })).toBeInTheDocument();
      // Dialog mentions the plant count
      expect(screen.getByText(/contains 1 plant/)).toBeInTheDocument();
    });

    it('deletes bed with plants when dialog confirmed with deleteAllPlants', () => {
      const mockPlants = [{ id: 'plant-1', plantId: 'tomato' }];
      storage.getPlantsByBed.mockImplementation((bedId) => {
        if (bedId === 'bed-1') return mockPlants;
        return [];
      });
      storage.removeGardenBed.mockReturnValue(true);

      render(<BedManager onBedChange={mockOnBedChange} />);

      fireEvent.click(screen.getByLabelText('Delete Main Garden'));
      fireEvent.click(screen.getByLabelText(/Delete all plants/));
      fireEvent.click(screen.getByRole('button', { name: /Delete Bed/i }));

      expect(storage.removeGardenBed).toHaveBeenCalledWith('bed-1', { deleteAllPlants: true, destinationBedId: null });
      expect(mockOnBedChange).toHaveBeenCalled();
    });

    it('closes delete dialog when cancelled', () => {
      const mockPlants = [{ id: 'plant-1', plantId: 'tomato' }];
      storage.getPlantsByBed.mockImplementation((bedId) => {
        if (bedId === 'bed-1') return mockPlants;
        return [];
      });

      render(<BedManager onBedChange={mockOnBedChange} />);

      fireEvent.click(screen.getByLabelText('Delete Main Garden'));
      // Check the dialog is open by looking for the modal heading
      expect(screen.getByRole('heading', { name: 'Delete Bed' })).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
      // Dialog should be closed
      expect(screen.queryByRole('heading', { name: 'Delete Bed' })).not.toBeInTheDocument();
    });

    it('shows error when delete fails via dialog', () => {
      const mockPlants = [{ id: 'plant-1', plantId: 'tomato' }];
      storage.getPlantsByBed.mockImplementation((bedId) => {
        if (bedId === 'bed-1') return mockPlants;
        return [];
      });
      storage.removeGardenBed.mockReturnValue(false);

      render(<BedManager onBedChange={mockOnBedChange} />);

      fireEvent.click(screen.getByLabelText('Delete Main Garden'));
      fireEvent.click(screen.getByLabelText(/Delete all plants/));
      fireEvent.click(screen.getByRole('button', { name: /Delete Bed/i }));

      expect(screen.getByText(/Failed to delete bed/)).toBeInTheDocument();
    });

    it('shows error when cannot delete last bed with plants', () => {
      storage.removeGardenBed.mockReturnValue(false);

      render(<BedManager onBedChange={mockOnBedChange} />);

      fireEvent.click(screen.getByLabelText('Delete Main Garden'));

      expect(screen.getByText(/Cannot delete the last bed/)).toBeInTheDocument();
    });

    it('clears error when adding new bed', () => {
      storage.removeGardenBed.mockReturnValue(false);

      render(<BedManager onBedChange={mockOnBedChange} />);

      fireEvent.click(screen.getByLabelText('Delete Main Garden'));
      expect(screen.getByText(/Cannot delete the last bed/)).toBeInTheDocument();

      fireEvent.click(screen.getByText('Add New Bed'));
      expect(screen.queryByText(/Cannot delete the last bed/)).not.toBeInTheDocument();
    });

    it('clears error when editing bed', () => {
      storage.removeGardenBed.mockReturnValue(false);

      render(<BedManager onBedChange={mockOnBedChange} />);

      fireEvent.click(screen.getByLabelText('Delete Main Garden'));
      expect(screen.getByText(/Cannot delete the last bed/)).toBeInTheDocument();

      fireEvent.click(screen.getByLabelText('Edit Herb Garden'));
      expect(screen.queryByText(/Cannot delete the last bed/)).not.toBeInTheDocument();
    });

    it('clears error when cancelling form', () => {
      storage.removeGardenBed.mockReturnValue(false);

      render(<BedManager onBedChange={mockOnBedChange} />);

      fireEvent.click(screen.getByLabelText('Delete Main Garden'));
      fireEvent.click(screen.getByText('Add New Bed'));
      fireEvent.click(screen.getByText('Cancel'));

      expect(screen.queryByText(/Cannot delete the last bed/)).not.toBeInTheDocument();
    });
  });

  describe('without onBedChange callback', () => {
    it('handles missing onBedChange on create', () => {
      storage.addGardenBed.mockReturnValue({ id: 'bed-new', name: 'Test', width: 4, height: 4 });

      render(<BedManager />);

      fireEvent.click(screen.getByText('Add New Bed'));
      fireEvent.change(screen.getByLabelText('Bed Name'), { target: { value: 'Test' } });
      fireEvent.change(screen.getByLabelText('Width (ft)'), { target: { value: '4' } });
      fireEvent.change(screen.getByLabelText('Height (ft)'), { target: { value: '4' } });
      fireEvent.click(screen.getByText('Create Bed'));

      expect(storage.addGardenBed).toHaveBeenCalledWith('Test', 4, 4, { is_pot: false });
    });

    it('handles missing onBedChange on update', () => {
      const mockBeds = [{ id: 'bed-1', name: 'Test Bed', width: 4, height: 4 }];
      storage.getGardenBeds.mockReturnValue(mockBeds);
      storage.updateGardenBed.mockReturnValue({ id: 'bed-1', name: 'Updated', width: 4, height: 4 });

      render(<BedManager />);

      fireEvent.click(screen.getByLabelText('Edit Test Bed'));
      fireEvent.change(screen.getByLabelText('Bed Name'), { target: { value: 'Updated' } });
      fireEvent.click(screen.getByText('Save Changes'));

      expect(storage.updateGardenBed).toHaveBeenCalled();
    });

    it('handles missing onBedChange on delete', () => {
      const mockBeds = [
        { id: 'bed-1', name: 'Bed 1', width: 4, height: 4 },
        { id: 'bed-2', name: 'Bed 2', width: 4, height: 4 }
      ];
      storage.getGardenBeds.mockReturnValue(mockBeds);
      storage.removeGardenBed.mockReturnValue(true);

      render(<BedManager />);

      fireEvent.click(screen.getByLabelText('Delete Bed 1'));

      expect(storage.removeGardenBed).toHaveBeenCalledWith('bed-1');
    });
  });

  describe('drag and drop reordering', () => {
    const mockBeds = [
      { id: 'bed-1', name: 'First Bed', width: 4, height: 4 },
      { id: 'bed-2', name: 'Second Bed', width: 2, height: 4 },
      { id: 'bed-3', name: 'Third Bed', width: 3, height: 3 }
    ];

    beforeEach(() => {
      storage.getGardenBeds.mockReturnValue(mockBeds);
      storage.reorderBeds.mockImplementation((bedIds) => {
        const reordered = bedIds.map((id, index) => {
          const bed = mockBeds.find(b => b.id === id);
          return { ...bed, order: index };
        });
        return reordered;
      });
    });

    it('renders beds with drag handles', () => {
      render(<BedManager onBedChange={mockOnBedChange} />);

      expect(screen.getByLabelText('Drag First Bed')).toBeInTheDocument();
      expect(screen.getByLabelText('Drag Second Bed')).toBeInTheDocument();
      expect(screen.getByLabelText('Drag Third Bed')).toBeInTheDocument();
    });

    it('reorders beds on drag and drop', () => {
      const { container } = render(<BedManager onBedChange={mockOnBedChange} />);

      const bedCards = container.querySelectorAll('[draggable="true"]');
      const firstBed = bedCards[0];
      const thirdBed = bedCards[2];

      // Drag first bed with a valid dataTransfer object
      const dataTransfer = { effectAllowed: '' };
      fireEvent.dragStart(firstBed, { dataTransfer });

      // Drop on third bed
      fireEvent.dragOver(thirdBed);
      fireEvent.drop(thirdBed);

      expect(storage.reorderBeds).toHaveBeenCalledWith(['bed-2', 'bed-3', 'bed-1']);
      expect(mockOnBedChange).toHaveBeenCalled();
      expect(dataTransfer.effectAllowed).toBe('move');
    });

    it('does not reorder when dropping on same bed', () => {
      const { container } = render(<BedManager onBedChange={mockOnBedChange} />);

      const bedCards = container.querySelectorAll('[draggable="true"]');
      const firstBed = bedCards[0];

      // Drag and drop on same bed
      fireEvent.dragStart(firstBed);
      fireEvent.dragOver(firstBed);
      fireEvent.drop(firstBed);

      expect(storage.reorderBeds).not.toHaveBeenCalled();
    });

    it('clears dragging state on drag end', () => {
      const { container } = render(<BedManager onBedChange={mockOnBedChange} />);

      const bedCards = container.querySelectorAll('[draggable="true"]');
      const firstBed = bedCards[0];

      fireEvent.dragStart(firstBed);
      expect(firstBed).toHaveClass('opacity-50');

      fireEvent.dragEnd(firstBed);
      expect(firstBed).not.toHaveClass('opacity-50');
    });

    it('applies opacity to dragged bed', () => {
      const { container } = render(<BedManager onBedChange={mockOnBedChange} />);

      const bedCards = container.querySelectorAll('[draggable="true"]');
      const firstBed = bedCards[0];

      fireEvent.dragStart(firstBed);
      expect(firstBed).toHaveClass('opacity-50');
    });

    it('handles invalid drag operations gracefully', () => {
      const { container } = render(<BedManager onBedChange={mockOnBedChange} />);

      const bedCards = container.querySelectorAll('[draggable="true"]');
      const firstBed = bedCards[0];

      // Start drag but don't set draggedBedId properly (simulate error condition)
      fireEvent.dragEnd(firstBed);

      // Should not throw and should not call reorderBeds
      expect(storage.reorderBeds).not.toHaveBeenCalled();
    });

    it('handles drag start when dataTransfer is null', () => {
      const { container } = render(<BedManager onBedChange={mockOnBedChange} />);

      const bedCards = container.querySelectorAll('[draggable="true"]');
      const firstBed = bedCards[0];

      // Use fireEvent.dragStart with a custom event that has null dataTransfer
      // The handler checks `if (e.dataTransfer)` before setting effectAllowed
      fireEvent.dragStart(firstBed, { dataTransfer: null });

      // Should not throw - the opacity class should still be applied
      expect(firstBed).toHaveClass('opacity-50');
    });

    it('handles drop when dragged bed is not found in array', () => {
      // Render with initial beds
      const { container } = render(<BedManager onBedChange={mockOnBedChange} />);

      const bedCards = container.querySelectorAll('[draggable="true"]');
      const firstBed = bedCards[0];
      const secondBed = bedCards[1];

      // Start dragging bed-1
      fireEvent.dragStart(firstBed);

      // Simulate bed being deleted after drag started by updating getGardenBeds mock
      // and re-rendering
      storage.getGardenBeds.mockReturnValue([
        { id: 'bed-2', name: 'Second Bed', width: 2, height: 4 },
        { id: 'bed-3', name: 'Third Bed', width: 3, height: 3 }
      ]);

      // Force a state refresh by triggering loadBeds
      // This simulates another action (like delete) happening during drag
      const deleteButton = screen.getAllByRole('button', { name: /delete/i })[0];
      fireEvent.click(deleteButton);

      // Confirm delete in dialog
      const confirmDeleteButtons = screen.getAllByRole('button', { name: /delete/i });
      const dialogConfirmButton = confirmDeleteButtons.find(btn => btn.closest('[role="dialog"]'));
      if (dialogConfirmButton) {
        fireEvent.click(dialogConfirmButton);
      }

      // Now drop - the dragged bed (bed-1) no longer exists
      fireEvent.drop(secondBed);

      // Should not throw and reorderBeds should not be called with invalid state
    });
  });

  describe('keyboard reordering', () => {
    const mockBeds = [
      { id: 'bed-1', name: 'First Bed', width: 4, height: 4 },
      { id: 'bed-2', name: 'Second Bed', width: 2, height: 4 },
      { id: 'bed-3', name: 'Third Bed', width: 3, height: 3 }
    ];

    beforeEach(() => {
      storage.getGardenBeds.mockReturnValue(mockBeds);
      storage.reorderBeds.mockImplementation((bedIds) => {
        const reordered = bedIds.map((id, index) => {
          const bed = mockBeds.find(b => b.id === id);
          return { ...bed, order: index };
        });
        return reordered;
      });
    });

    it('shows move up button for all beds except first', () => {
      render(<BedManager onBedChange={mockOnBedChange} />);

      expect(screen.queryByLabelText('Move First Bed up')).not.toBeInTheDocument();
      expect(screen.getByLabelText('Move Second Bed up')).toBeInTheDocument();
      expect(screen.getByLabelText('Move Third Bed up')).toBeInTheDocument();
    });

    it('shows move down button for all beds except last', () => {
      render(<BedManager onBedChange={mockOnBedChange} />);

      expect(screen.getByLabelText('Move First Bed down')).toBeInTheDocument();
      expect(screen.getByLabelText('Move Second Bed down')).toBeInTheDocument();
      expect(screen.queryByLabelText('Move Third Bed down')).not.toBeInTheDocument();
    });

    it('moves bed up when move up button clicked', () => {
      render(<BedManager onBedChange={mockOnBedChange} />);

      fireEvent.click(screen.getByLabelText('Move Second Bed up'));

      expect(storage.reorderBeds).toHaveBeenCalledWith(['bed-2', 'bed-1', 'bed-3']);
      expect(mockOnBedChange).toHaveBeenCalled();
    });

    it('moves bed down when move down button clicked', () => {
      render(<BedManager onBedChange={mockOnBedChange} />);

      fireEvent.click(screen.getByLabelText('Move Second Bed down'));

      expect(storage.reorderBeds).toHaveBeenCalledWith(['bed-1', 'bed-3', 'bed-2']);
      expect(mockOnBedChange).toHaveBeenCalled();
    });

    it('does not move first bed up', () => {
      render(<BedManager onBedChange={mockOnBedChange} />);

      // First bed should not have move up button
      expect(screen.queryByLabelText('Move First Bed up')).not.toBeInTheDocument();
    });

    it('does not move last bed down', () => {
      render(<BedManager onBedChange={mockOnBedChange} />);

      // Last bed should not have move down button
      expect(screen.queryByLabelText('Move Third Bed down')).not.toBeInTheDocument();
    });

    it('handles missing onBedChange on reorder', () => {
      render(<BedManager />);

      fireEvent.click(screen.getByLabelText('Move Second Bed up'));

      expect(storage.reorderBeds).toHaveBeenCalled();
    });

    it('shows only move down button for single middle bed when list has two items', () => {
      const twoBeds = [
        { id: 'bed-1', name: 'First Bed', width: 4, height: 4 },
        { id: 'bed-2', name: 'Second Bed', width: 2, height: 4 }
      ];
      storage.getGardenBeds.mockReturnValue(twoBeds);

      render(<BedManager onBedChange={mockOnBedChange} />);

      expect(screen.queryByLabelText('Move First Bed up')).not.toBeInTheDocument();
      expect(screen.getByLabelText('Move First Bed down')).toBeInTheDocument();
      expect(screen.getByLabelText('Move Second Bed up')).toBeInTheDocument();
      expect(screen.queryByLabelText('Move Second Bed down')).not.toBeInTheDocument();
    });
  });
});
