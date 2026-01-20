import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import PlantForm from './PlantForm';

// Mock the storage module
vi.mock('../utils/storage', () => ({
  getGardenBeds: vi.fn(),
  getBedCapacity: vi.fn(),
  getPlantDefaults: vi.fn(),
  resolveEffectiveValue: vi.fn()
}));

// Mock harvestDate module
vi.mock('../utils/harvestDate', () => ({
  calculateHarvestDate: vi.fn(),
  formatHarvestDateDisplay: vi.fn()
}));

import { getGardenBeds, getBedCapacity, getPlantDefaults, resolveEffectiveValue } from '../utils/storage';
import { calculateHarvestDate, formatHarvestDateDisplay } from '../utils/harvestDate';

describe('PlantForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();
  const mockBeds = [
    { id: 'bed-1', name: 'Main Garden', width: 4, height: 4 },
    { id: 'bed-2', name: 'Herb Garden', width: 2, height: 2 }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    getGardenBeds.mockReturnValue(mockBeds);
    getBedCapacity.mockImplementation((bedId) => {
      if (bedId === 'bed-1') return { total: 16, used: 4, available: 12, isOvercapacity: false };
      return { total: 4, used: 1, available: 3, isOvercapacity: false };
    });
    getPlantDefaults.mockReturnValue(null);
    resolveEffectiveValue.mockImplementation((plantId, property) => {
      if (property === 'daysToMaturity') return 70;
      if (property === 'squaresPerPlant') return 1;
      return null;
    });
    calculateHarvestDate.mockReturnValue('2026-04-01T00:00:00.000Z');
    formatHarvestDateDisplay.mockReturnValue('Expected: Apr 1, 2026');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('add mode rendering', () => {
    it('renders add form with correct title', () => {
      render(<PlantForm mode="add" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
      expect(screen.getByRole('heading', { name: 'Add Plant' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Add Plant' })).toBeInTheDocument();
    });

    it('shows plant type selector in add mode', () => {
      render(<PlantForm mode="add" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
      expect(screen.getByLabelText('Plant Type')).toBeInTheDocument();
    });

    it('renders all plant options', () => {
      render(<PlantForm mode="add" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
      const select = screen.getByLabelText('Plant Type');
      expect(select).toContainHTML('Tomato');
      expect(select).toContainHTML('Lettuce');
      expect(select).toContainHTML('Carrot');
    });

    it('renders bed selector with capacities', () => {
      render(<PlantForm mode="add" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
      const bedSelect = screen.getByLabelText('Bed');
      expect(bedSelect).toContainHTML('Main Garden (4/16 sq ft)');
      expect(bedSelect).toContainHTML('Herb Garden (1/4 sq ft)');
    });

    it('renders variety input', () => {
      render(<PlantForm mode="add" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
      expect(screen.getByLabelText('Variety (optional)')).toBeInTheDocument();
    });

    it('renders plant date input', () => {
      render(<PlantForm mode="add" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
      expect(screen.getByLabelText('Plant Date')).toBeInTheDocument();
    });

    it('renders quantity input', () => {
      render(<PlantForm mode="add" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
      expect(screen.getByLabelText('Quantity')).toHaveValue(1);
    });

    it('renders advanced options toggle', () => {
      render(<PlantForm mode="add" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
      expect(screen.getByText('Advanced Options')).toBeInTheDocument();
    });

    it('defaults plant date to today', () => {
      render(<PlantForm mode="add" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
      const today = new Date().toISOString().split('T')[0];
      expect(screen.getByLabelText('Plant Date')).toHaveValue(today);
    });

    it('defaults to first bed when beds exist', () => {
      render(<PlantForm mode="add" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
      expect(screen.getByLabelText('Bed')).toHaveValue('bed-1');
    });
  });

  describe('edit mode rendering', () => {
    const existingPlant = {
      id: 'plant-1',
      plantId: 'tomato',
      bedId: 'bed-2',
      variety: 'Roma',
      plantedDate: '2026-01-15T00:00:00.000Z',
      quantity: 3,
      daysToMaturityOverride: 65,
      spacePerPlantOverride: 1.5
    };

    it('renders edit form with correct title', () => {
      render(
        <PlantForm mode="edit" plant={existingPlant} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );
      expect(screen.getByText('Edit Plant')).toBeInTheDocument();
      expect(screen.getByText('Save Changes')).toBeInTheDocument();
    });

    it('does not show plant type selector in edit mode', () => {
      render(
        <PlantForm mode="edit" plant={existingPlant} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );
      expect(screen.queryByLabelText('Plant Type')).not.toBeInTheDocument();
    });

    it('shows plant name in edit mode', () => {
      render(
        <PlantForm mode="edit" plant={existingPlant} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );
      expect(screen.getByText('Plant Type')).toBeInTheDocument();
      expect(screen.getByText('Tomato')).toBeInTheDocument();
    });

    it('pre-fills form with existing plant data', () => {
      render(
        <PlantForm mode="edit" plant={existingPlant} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );
      expect(screen.getByLabelText('Bed')).toHaveValue('bed-2');
      expect(screen.getByLabelText('Variety (optional)')).toHaveValue('Roma');
      expect(screen.getByLabelText('Plant Date')).toHaveValue('2026-01-15');
      expect(screen.getByLabelText('Quantity')).toHaveValue(3);
    });

    it('pre-fills advanced options with existing overrides', () => {
      render(
        <PlantForm mode="edit" plant={existingPlant} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );
      fireEvent.click(screen.getByText('Advanced Options'));
      expect(screen.getByLabelText('Days to Maturity Override')).toHaveValue(65);
      expect(screen.getByLabelText('Squares per Plant Override')).toHaveValue(1.5);
    });
  });

  describe('advanced section', () => {
    it('advanced options are hidden by default', () => {
      render(<PlantForm mode="add" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
      expect(screen.queryByLabelText('Days to Maturity Override')).not.toBeInTheDocument();
    });

    it('toggles advanced options on click', () => {
      render(<PlantForm mode="add" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      fireEvent.click(screen.getByText('Advanced Options'));
      expect(screen.getByLabelText('Days to Maturity Override')).toBeInTheDocument();
      expect(screen.getByLabelText('Squares per Plant Override')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Advanced Options'));
      expect(screen.queryByLabelText('Days to Maturity Override')).not.toBeInTheDocument();
    });

    it('shows aria-expanded state', () => {
      render(<PlantForm mode="add" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const advancedButton = screen.getByText('Advanced Options');
      expect(advancedButton).toHaveAttribute('aria-expanded', 'false');

      fireEvent.click(advancedButton);
      expect(advancedButton).toHaveAttribute('aria-expanded', 'true');
    });
  });

  describe('placeholders and defaults', () => {
    it('shows library default as placeholder when no garden default', () => {
      render(<PlantForm mode="add" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      fireEvent.change(screen.getByLabelText('Plant Type'), { target: { value: 'tomato' } });
      fireEvent.click(screen.getByText('Advanced Options'));

      expect(screen.getByLabelText('Days to Maturity Override')).toHaveAttribute('placeholder', '70 (library default)');
      expect(screen.getByLabelText('Squares per Plant Override')).toHaveAttribute('placeholder', '1 (library default)');
    });

    it('shows garden default as placeholder when set', () => {
      getPlantDefaults.mockReturnValue({ daysToMaturity: 60, squaresPerPlant: 0.5 });

      render(<PlantForm mode="add" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      fireEvent.change(screen.getByLabelText('Plant Type'), { target: { value: 'tomato' } });
      fireEvent.click(screen.getByText('Advanced Options'));

      expect(screen.getByLabelText('Days to Maturity Override')).toHaveAttribute('placeholder', '60 (garden default)');
      expect(screen.getByLabelText('Squares per Plant Override')).toHaveAttribute('placeholder', '0.5 (garden default)');
    });

    it('shows effective value text when no override entered', () => {
      render(<PlantForm mode="add" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      fireEvent.change(screen.getByLabelText('Plant Type'), { target: { value: 'tomato' } });
      fireEvent.click(screen.getByText('Advanced Options'));

      expect(screen.getByText('Using: 70 days')).toBeInTheDocument();
      expect(screen.getByText('Using: 1 sq ft per plant')).toBeInTheDocument();
    });

    it('hides effective value text when override is entered', () => {
      render(<PlantForm mode="add" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      fireEvent.change(screen.getByLabelText('Plant Type'), { target: { value: 'tomato' } });
      fireEvent.click(screen.getByText('Advanced Options'));

      fireEvent.change(screen.getByLabelText('Days to Maturity Override'), { target: { value: '50' } });
      expect(screen.queryByText('Using: 70 days')).not.toBeInTheDocument();
    });
  });

  describe('harvest date preview', () => {
    it('shows harvest date preview when plant is selected', () => {
      render(<PlantForm mode="add" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      fireEvent.change(screen.getByLabelText('Plant Type'), { target: { value: 'tomato' } });

      expect(screen.getByText(/Harvest Date Preview:/)).toBeInTheDocument();
      expect(screen.getByText(/Expected: Apr 1, 2026/)).toBeInTheDocument();
    });

    it('does not show harvest date preview when no plant selected', () => {
      render(<PlantForm mode="add" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
      expect(screen.queryByText(/Harvest Date Preview:/)).not.toBeInTheDocument();
    });

    it('updates preview when plant date changes', () => {
      render(<PlantForm mode="add" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      fireEvent.change(screen.getByLabelText('Plant Type'), { target: { value: 'tomato' } });
      fireEvent.change(screen.getByLabelText('Plant Date'), { target: { value: '2026-02-01' } });

      expect(calculateHarvestDate).toHaveBeenCalled();
    });

    it('updates preview when days to maturity override changes', () => {
      render(<PlantForm mode="add" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      fireEvent.change(screen.getByLabelText('Plant Type'), { target: { value: 'tomato' } });
      fireEvent.click(screen.getByText('Advanced Options'));
      fireEvent.change(screen.getByLabelText('Days to Maturity Override'), { target: { value: '50' } });

      expect(resolveEffectiveValue).toHaveBeenCalledWith('tomato', 'daysToMaturity', 50);
    });
  });

  describe('no beds scenario', () => {
    it('shows message when no beds available', () => {
      getGardenBeds.mockReturnValue([]);

      render(<PlantForm mode="add" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      expect(screen.getByText('No beds available. Create a bed first.')).toBeInTheDocument();
    });

    it('does not show bed selector when no beds', () => {
      getGardenBeds.mockReturnValue([]);

      render(<PlantForm mode="add" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      expect(screen.queryByRole('combobox', { name: 'Bed' })).not.toBeInTheDocument();
    });
  });

  describe('validation', () => {
    it('validates plant type is required in add mode', () => {
      render(<PlantForm mode="add" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      fireEvent.click(screen.getByText('Add Plant', { selector: 'button[type="submit"]' }));

      expect(screen.getByText('Please select a plant')).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('validates bed when no beds exist', () => {
      getGardenBeds.mockReturnValue([]);

      render(<PlantForm mode="add" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      fireEvent.change(screen.getByLabelText('Plant Type'), { target: { value: 'tomato' } });
      fireEvent.click(screen.getByRole('button', { name: 'Add Plant' }));

      // When no beds exist, bedId is empty and validation should fail
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('defaults to first bed when plant has empty bedId', () => {
      // When plant has empty bedId, component defaults to first available bed
      const plantWithNoBed = {
        id: 'plant-1',
        plantId: 'tomato',
        bedId: '',  // Empty bed ID
        plantedDate: '2026-01-15T00:00:00.000Z',
        quantity: 1
      };

      render(
        <PlantForm mode="edit" plant={plantWithNoBed} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      // Component should default to first bed
      expect(screen.getByLabelText('Bed')).toHaveValue('bed-1');

      fireEvent.click(screen.getByText('Save Changes'));

      // Form should submit with defaulted bedId
      expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
        bedId: 'bed-1'
      }));
    });

    it('validates quantity is required', () => {
      render(<PlantForm mode="add" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      fireEvent.change(screen.getByLabelText('Plant Type'), { target: { value: 'tomato' } });
      fireEvent.change(screen.getByLabelText('Quantity'), { target: { value: '' } });
      fireEvent.click(screen.getByText('Add Plant', { selector: 'button[type="submit"]' }));

      expect(screen.getByText('Quantity is required')).toBeInTheDocument();
    });

    it('validates quantity must be at least 1', () => {
      render(<PlantForm mode="add" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      fireEvent.change(screen.getByLabelText('Plant Type'), { target: { value: 'tomato' } });
      // Directly clear and set the value to simulate entering 0
      const quantityInput = screen.getByLabelText('Quantity');
      // Clear first
      fireEvent.change(quantityInput, { target: { value: '' } });
      // Then set to 0
      fireEvent.input(quantityInput, { target: { value: '0' } });
      fireEvent.change(quantityInput, { target: { value: '0' } });
      fireEvent.click(screen.getByRole('button', { name: 'Add Plant' }));

      // Form should not submit with invalid quantity
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('validates quantity is a number', () => {
      render(<PlantForm mode="add" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      fireEvent.change(screen.getByLabelText('Plant Type'), { target: { value: 'tomato' } });
      fireEvent.change(screen.getByLabelText('Quantity'), { target: { value: 'abc' } });
      fireEvent.click(screen.getByText('Add Plant', { selector: 'button[type="submit"]' }));

      expect(screen.getByText('Quantity is required')).toBeInTheDocument();
    });

    it('validates plant date is required', () => {
      render(<PlantForm mode="add" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      fireEvent.change(screen.getByLabelText('Plant Type'), { target: { value: 'tomato' } });
      fireEvent.change(screen.getByLabelText('Plant Date'), { target: { value: '' } });
      fireEvent.click(screen.getByText('Add Plant', { selector: 'button[type="submit"]' }));

      expect(screen.getByText('Plant date is required')).toBeInTheDocument();
    });

    it('prevents submission with invalid days to maturity override', () => {
      render(<PlantForm mode="add" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      fireEvent.change(screen.getByLabelText('Plant Type'), { target: { value: 'tomato' } });
      fireEvent.click(screen.getByText('Advanced Options'));
      // Use 0 as test case
      const daysInput = screen.getByLabelText('Days to Maturity Override');
      fireEvent.input(daysInput, { target: { value: '0' } });
      fireEvent.change(daysInput, { target: { value: '0' } });
      fireEvent.click(screen.getByRole('button', { name: 'Add Plant' }));

      // Validation should fail because 0 is not positive
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('accepts valid days to maturity override', () => {
      render(<PlantForm mode="add" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      fireEvent.change(screen.getByLabelText('Plant Type'), { target: { value: 'tomato' } });
      fireEvent.click(screen.getByText('Advanced Options'));
      fireEvent.change(screen.getByLabelText('Days to Maturity Override'), { target: { value: '50' } });
      fireEvent.click(screen.getByRole('button', { name: 'Add Plant' }));

      expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
        daysToMaturityOverride: 50
      }));
    });

    it('prevents submission with invalid space per plant override', () => {
      render(<PlantForm mode="add" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      fireEvent.change(screen.getByLabelText('Plant Type'), { target: { value: 'tomato' } });
      fireEvent.click(screen.getByText('Advanced Options'));
      const spaceInput = screen.getByLabelText('Squares per Plant Override');
      fireEvent.input(spaceInput, { target: { value: '0' } });
      fireEvent.change(spaceInput, { target: { value: '0' } });
      fireEvent.click(screen.getByRole('button', { name: 'Add Plant' }));

      // Validation should fail because 0 is not positive
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('accepts valid space per plant override', () => {
      render(<PlantForm mode="add" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      fireEvent.change(screen.getByLabelText('Plant Type'), { target: { value: 'tomato' } });
      fireEvent.click(screen.getByText('Advanced Options'));
      fireEvent.change(screen.getByLabelText('Squares per Plant Override'), { target: { value: '0.5' } });
      fireEvent.click(screen.getByRole('button', { name: 'Add Plant' }));

      expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
        spacePerPlantOverride: 0.5
      }));
    });

    it('allows empty overrides (uses defaults)', () => {
      render(<PlantForm mode="add" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      fireEvent.change(screen.getByLabelText('Plant Type'), { target: { value: 'tomato' } });
      fireEvent.click(screen.getByText('Add Plant', { selector: 'button[type="submit"]' }));

      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  describe('form submission', () => {
    it('submits form with correct data in add mode', () => {
      render(<PlantForm mode="add" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      fireEvent.change(screen.getByLabelText('Plant Type'), { target: { value: 'tomato' } });
      fireEvent.change(screen.getByLabelText('Bed'), { target: { value: 'bed-2' } });
      fireEvent.change(screen.getByLabelText('Variety (optional)'), { target: { value: 'Cherry' } });
      fireEvent.change(screen.getByLabelText('Plant Date'), { target: { value: '2026-03-15' } });
      fireEvent.change(screen.getByLabelText('Quantity'), { target: { value: '5' } });
      fireEvent.click(screen.getByText('Add Plant', { selector: 'button[type="submit"]' }));

      expect(mockOnSubmit).toHaveBeenCalledWith({
        plantId: 'tomato',
        bedId: 'bed-2',
        variety: 'Cherry',
        plantedDate: expect.stringContaining('2026-03-15'),
        quantity: 5,
        daysToMaturityOverride: null,
        spacePerPlantOverride: null
      });
    });

    it('submits form with overrides when provided', () => {
      render(<PlantForm mode="add" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      fireEvent.change(screen.getByLabelText('Plant Type'), { target: { value: 'tomato' } });
      fireEvent.click(screen.getByText('Advanced Options'));
      fireEvent.change(screen.getByLabelText('Days to Maturity Override'), { target: { value: '55' } });
      fireEvent.change(screen.getByLabelText('Squares per Plant Override'), { target: { value: '0.75' } });
      fireEvent.click(screen.getByText('Add Plant', { selector: 'button[type="submit"]' }));

      expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
        daysToMaturityOverride: 55,
        spacePerPlantOverride: 0.75
      }));
    });

    it('submits form without plantId in edit mode', () => {
      const existingPlant = {
        id: 'plant-1',
        plantId: 'tomato',
        bedId: 'bed-1',
        variety: 'Roma',
        plantedDate: '2026-01-15T00:00:00.000Z',
        quantity: 2
      };

      render(
        <PlantForm mode="edit" plant={existingPlant} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      fireEvent.click(screen.getByText('Save Changes'));

      const submittedData = mockOnSubmit.mock.calls[0][0];
      expect(submittedData).not.toHaveProperty('plantId');
      expect(submittedData.bedId).toBe('bed-1');
    });

    it('trims variety whitespace', () => {
      render(<PlantForm mode="add" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      fireEvent.change(screen.getByLabelText('Plant Type'), { target: { value: 'tomato' } });
      fireEvent.change(screen.getByLabelText('Variety (optional)'), { target: { value: '  Cherry  ' } });
      fireEvent.click(screen.getByText('Add Plant', { selector: 'button[type="submit"]' }));

      expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
        variety: 'Cherry'
      }));
    });

    it('sets variety to null when empty', () => {
      render(<PlantForm mode="add" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      fireEvent.change(screen.getByLabelText('Plant Type'), { target: { value: 'tomato' } });
      fireEvent.change(screen.getByLabelText('Variety (optional)'), { target: { value: '' } });
      fireEvent.click(screen.getByText('Add Plant', { selector: 'button[type="submit"]' }));

      expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
        variety: null
      }));
    });

    it('calls onCancel when cancel button is clicked', () => {
      render(<PlantForm mode="add" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      fireEvent.click(screen.getByText('Cancel'));

      expect(mockOnCancel).toHaveBeenCalled();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('handles plant with null values', () => {
      const plantWithNulls = {
        id: 'plant-1',
        plantId: 'tomato',
        bedId: 'bed-1',
        variety: null,
        plantedDate: '2026-01-15T00:00:00.000Z',
        quantity: 1,
        daysToMaturityOverride: null,
        spacePerPlantOverride: null
      };

      render(
        <PlantForm mode="edit" plant={plantWithNulls} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      expect(screen.getByLabelText('Variety (optional)')).toHaveValue('');
    });

    it('handles missing plant in edit mode', () => {
      render(
        <PlantForm mode="edit" plant={undefined} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      expect(screen.getByText('Edit Plant')).toBeInTheDocument();
    });

    it('handles empty beds array with default bed', () => {
      getGardenBeds.mockReturnValue([]);

      render(<PlantForm mode="add" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      expect(screen.getByText('No beds available. Create a bed first.')).toBeInTheDocument();
    });

    it('rejects zero days to maturity override in edit mode', () => {
      const plantWithZeroOverride = {
        id: 'plant-1',
        plantId: 'tomato',
        bedId: 'bed-1',
        plantedDate: '2026-01-15T00:00:00.000Z',
        quantity: 1,
        daysToMaturityOverride: 0,  // Pre-set to zero to trigger validation
        spacePerPlantOverride: null
      };

      render(
        <PlantForm mode="edit" plant={plantWithZeroOverride} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      // Expand advanced section to see the override value
      fireEvent.click(screen.getByText('Advanced Options'));
      fireEvent.click(screen.getByText('Save Changes'));

      // Validation should prevent submission - this exercises the error assignment line
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('rejects zero space per plant override in edit mode', () => {
      const plantWithZeroOverride = {
        id: 'plant-1',
        plantId: 'tomato',
        bedId: 'bed-1',
        plantedDate: '2026-01-15T00:00:00.000Z',
        quantity: 1,
        daysToMaturityOverride: null,
        spacePerPlantOverride: 0  // Pre-set to zero to trigger validation
      };

      render(
        <PlantForm mode="edit" plant={plantWithZeroOverride} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      // Expand advanced section to see the override value
      fireEvent.click(screen.getByText('Advanced Options'));
      fireEvent.click(screen.getByText('Save Changes'));

      // Validation should prevent submission - this exercises the error assignment line
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('rejects zero quantity in edit mode', () => {
      const plantWithZeroQuantity = {
        id: 'plant-1',
        plantId: 'tomato',
        bedId: 'bed-1',
        plantedDate: '2026-01-15T00:00:00.000Z',
        quantity: 0,  // Pre-set to zero
        daysToMaturityOverride: null,
        spacePerPlantOverride: null
      };

      render(
        <PlantForm mode="edit" plant={plantWithZeroQuantity} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      fireEvent.click(screen.getByText('Save Changes'));

      // Validation should prevent submission - this exercises the error assignment line
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('does not validate plant type in edit mode', () => {
      const existingPlant = {
        id: 'plant-1',
        plantId: 'tomato',
        bedId: 'bed-1',
        plantedDate: '2026-01-15T00:00:00.000Z',
        quantity: 1
      };

      render(
        <PlantForm mode="edit" plant={existingPlant} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      fireEvent.click(screen.getByText('Save Changes'));

      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  describe('placeholder edge cases', () => {
    it('shows empty placeholder when no plant selected', () => {
      render(<PlantForm mode="add" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      fireEvent.click(screen.getByText('Advanced Options'));

      expect(screen.getByLabelText('Days to Maturity Override')).toHaveAttribute('placeholder', '');
      expect(screen.getByLabelText('Squares per Plant Override')).toHaveAttribute('placeholder', '');
    });

    it('handles null garden defaults gracefully', () => {
      getPlantDefaults.mockReturnValue(null);

      render(<PlantForm mode="add" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      fireEvent.change(screen.getByLabelText('Plant Type'), { target: { value: 'tomato' } });
      fireEvent.click(screen.getByText('Advanced Options'));

      expect(screen.getByLabelText('Days to Maturity Override')).toHaveAttribute('placeholder', '70 (library default)');
    });

    it('handles garden defaults with null values', () => {
      getPlantDefaults.mockReturnValue({ daysToMaturity: null, squaresPerPlant: null });

      render(<PlantForm mode="add" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      fireEvent.change(screen.getByLabelText('Plant Type'), { target: { value: 'tomato' } });
      fireEvent.click(screen.getByText('Advanced Options'));

      expect(screen.getByLabelText('Days to Maturity Override')).toHaveAttribute('placeholder', '70 (library default)');
    });
  });

  describe('harvest date preview edge cases', () => {
    it('shows preview in edit mode', () => {
      const existingPlant = {
        id: 'plant-1',
        plantId: 'tomato',
        bedId: 'bed-1',
        plantedDate: '2026-01-15T00:00:00.000Z',
        quantity: 1
      };

      render(
        <PlantForm mode="edit" plant={existingPlant} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      expect(screen.getByText(/Harvest Date Preview:/)).toBeInTheDocument();
    });

    it('handles null effective days to maturity', () => {
      resolveEffectiveValue.mockReturnValue(null);

      render(<PlantForm mode="add" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      fireEvent.change(screen.getByLabelText('Plant Type'), { target: { value: 'tomato' } });

      expect(screen.queryByText(/Harvest Date Preview:/)).not.toBeInTheDocument();
    });
  });

  describe('form state changes', () => {
    it('updates bed selection', () => {
      render(<PlantForm mode="add" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      fireEvent.change(screen.getByLabelText('Bed'), { target: { value: 'bed-2' } });

      expect(screen.getByLabelText('Bed')).toHaveValue('bed-2');
    });

    it('updates plant type selection', () => {
      render(<PlantForm mode="add" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      fireEvent.change(screen.getByLabelText('Plant Type'), { target: { value: 'lettuce' } });

      expect(screen.getByLabelText('Plant Type')).toHaveValue('lettuce');
    });

    it('updates variety input', () => {
      render(<PlantForm mode="add" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      fireEvent.change(screen.getByLabelText('Variety (optional)'), { target: { value: 'Butterhead' } });

      expect(screen.getByLabelText('Variety (optional)')).toHaveValue('Butterhead');
    });
  });
});
