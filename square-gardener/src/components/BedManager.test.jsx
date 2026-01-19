import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import BedManager from './BedManager';
import * as storage from '../utils/storage';

vi.mock('../utils/storage');

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

      expect(storage.addGardenBed).toHaveBeenCalledWith('New Bed', 4, 4);
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
      storage.updateGardenBed.mockReturnValue({ id: 'bed-1', name: 'Updated', width: 6, height: 4 });

      render(<BedManager onBedChange={mockOnBedChange} />);

      fireEvent.click(screen.getByLabelText('Edit Main Garden'));
      fireEvent.change(screen.getByLabelText('Bed Name'), { target: { value: 'Updated' } });
      fireEvent.change(screen.getByLabelText('Width (ft)'), { target: { value: '6' } });
      fireEvent.click(screen.getByText('Save Changes'));

      expect(storage.updateGardenBed).toHaveBeenCalledWith('bed-1', {
        name: 'Updated',
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

    it('deletes bed when confirmed', () => {
      storage.removeGardenBed.mockReturnValue(true);

      render(<BedManager onBedChange={mockOnBedChange} />);

      fireEvent.click(screen.getByLabelText('Delete Main Garden'));

      expect(storage.removeGardenBed).toHaveBeenCalledWith('bed-1');
      expect(mockOnBedChange).toHaveBeenCalled();
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

      expect(storage.addGardenBed).toHaveBeenCalled();
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
});
