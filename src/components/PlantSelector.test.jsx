import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PlantSelector from './PlantSelector';
import * as dateFormatting from '../utils/dateFormatting';

// Mock getCurrentSeason to return 'spring' for consistent testing
vi.spyOn(dateFormatting, 'getCurrentSeason').mockReturnValue('spring');

describe('PlantSelector', () => {
  const defaultProps = {
    availableSpace: 16,
    onSelectionChange: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render the component with title', () => {
      render(<PlantSelector {...defaultProps} />);

      expect(screen.getByText('Select Plants for Your Plan')).toBeInTheDocument();
    });

    it('should render space calculation section', () => {
      render(<PlantSelector {...defaultProps} />);

      expect(screen.getByText('Space Required')).toBeInTheDocument();
      expect(screen.getByText('0 / 16 sq ft')).toBeInTheDocument();
    });

    it('should render search input', () => {
      render(<PlantSelector {...defaultProps} />);

      expect(screen.getByPlaceholderText('Search plants...')).toBeInTheDocument();
    });

    it('should render season filter defaulted to current season', () => {
      render(<PlantSelector {...defaultProps} />);

      const seasonSelect = screen.getByRole('combobox');
      expect(seasonSelect).toBeInTheDocument();
      expect(seasonSelect.value).toBe('spring');
    });

    it('should render plant cards', () => {
      render(<PlantSelector {...defaultProps} />);

      expect(screen.getByText('Tomato')).toBeInTheDocument();
      expect(screen.getByText('Lettuce')).toBeInTheDocument();
      expect(screen.getByText('Carrot')).toBeInTheDocument();
    });

    it('should render with initial selections', () => {
      const initialSelections = { tomato: 2, basil: 3 };
      render(<PlantSelector {...defaultProps} initialSelections={initialSelections} />);

      expect(screen.getByText('Selected Plants (2)')).toBeInTheDocument();
      // Tomato appears multiple times (in grid and in selected list)
      expect(screen.getAllByText('Tomato').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('2 sq ft')).toBeInTheDocument();
    });
  });

  describe('plant selection', () => {
    it('should add plant when clicking Add button', () => {
      render(<PlantSelector {...defaultProps} />);

      const addButtons = screen.getAllByText('+ Add');
      fireEvent.click(addButtons[0]);

      expect(defaultProps.onSelectionChange).toHaveBeenCalled();
    });

    it('should toggle selection when clicking on unselected plant card', () => {
      render(<PlantSelector {...defaultProps} />);

      // Find a plant card and click it
      const tomatoCard = screen.getByText('Tomato').closest('div[class*="rounded-lg border"]');
      fireEvent.click(tomatoCard);

      expect(defaultProps.onSelectionChange).toHaveBeenCalledWith([
        { plantId: 'tomato', quantity: 1 }
      ]);
    });

    it('should show quantity input when plant is selected', () => {
      render(<PlantSelector {...defaultProps} initialSelections={{ tomato: 1 }} />);

      expect(screen.getByLabelText('Sq ft:')).toBeInTheDocument();
    });

    it('should update quantity when input changes', () => {
      render(<PlantSelector {...defaultProps} initialSelections={{ tomato: 1 }} />);

      const quantityInput = screen.getByLabelText('Sq ft:');
      fireEvent.change(quantityInput, { target: { value: '3' } });

      expect(defaultProps.onSelectionChange).toHaveBeenCalledWith([
        { plantId: 'tomato', quantity: 3 }
      ]);
    });

    it('should remove plant when quantity is set to 0', () => {
      render(<PlantSelector {...defaultProps} initialSelections={{ tomato: 1 }} />);

      const quantityInput = screen.getByLabelText('Sq ft:');
      fireEvent.change(quantityInput, { target: { value: '0' } });

      expect(defaultProps.onSelectionChange).toHaveBeenCalledWith([]);
    });

    it('should handle invalid quantity input', () => {
      render(<PlantSelector {...defaultProps} initialSelections={{ tomato: 1 }} />);

      const quantityInput = screen.getByLabelText('Sq ft:');
      fireEvent.change(quantityInput, { target: { value: 'abc' } });

      // Should treat invalid input as 0
      expect(defaultProps.onSelectionChange).toHaveBeenCalledWith([]);
    });

    it('should handle negative quantity input', () => {
      render(<PlantSelector {...defaultProps} initialSelections={{ tomato: 1 }} />);

      const quantityInput = screen.getByLabelText('Sq ft:');
      fireEvent.change(quantityInput, { target: { value: '-5' } });

      // Should treat negative as 0
      expect(defaultProps.onSelectionChange).toHaveBeenCalledWith([]);
    });

    it('should remove plant when clicking remove button in selected plants list', () => {
      render(<PlantSelector {...defaultProps} initialSelections={{ tomato: 1 }} />);

      const removeButton = screen.getByLabelText('Remove Tomato');
      fireEvent.click(removeButton);

      expect(defaultProps.onSelectionChange).toHaveBeenCalledWith([]);
    });
  });

  describe('space calculation', () => {
    it('should calculate space correctly for single plant selection', () => {
      // Tomato uses 1 sq ft per plant
      render(<PlantSelector {...defaultProps} initialSelections={{ tomato: 2 }} />);

      expect(screen.getByText('2 / 16 sq ft')).toBeInTheDocument();
      expect(screen.getByText('14 sq ft remaining')).toBeInTheDocument();
    });

    it('should calculate space correctly for fractional plants', () => {
      // quantity now represents sq ft directly (4 sq ft = 4 sq ft)
      render(<PlantSelector {...defaultProps} initialSelections={{ lettuce: 4 }} />);

      expect(screen.getByText('4 / 16 sq ft')).toBeInTheDocument();
    });

    it('should ignore invalid plant ids in initial selections', () => {
      // Unknown plant ID should be ignored in space calculation
      render(<PlantSelector {...defaultProps} initialSelections={{ 'unknown-plant': 5 }} />);

      // Space should still show 0 since the plant doesn't exist
      expect(screen.getByText('0 / 16 sq ft')).toBeInTheDocument();
    });

    it('should ignore zero quantities in selections', () => {
      render(<PlantSelector {...defaultProps} initialSelections={{ tomato: 0 }} />);

      // No selected plants section should appear
      expect(screen.queryByText('Selected Plants')).not.toBeInTheDocument();
    });

    it('should show over capacity warning', () => {
      // 5 sq ft exceeds 4 sq ft capacity
      render(<PlantSelector {...defaultProps} availableSpace={4} initialSelections={{ tomato: 5 }} />);

      expect(screen.getByText(/Over capacity by/)).toBeInTheDocument();
    });

    it('should not show remaining space when exactly at capacity', () => {
      render(<PlantSelector {...defaultProps} availableSpace={2} initialSelections={{ tomato: 2 }} />);

      expect(screen.queryByText(/remaining/)).not.toBeInTheDocument();
    });
  });

  describe('search and filtering', () => {
    it('should filter plants by search term', () => {
      render(<PlantSelector {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('Search plants...');
      fireEvent.change(searchInput, { target: { value: 'tom' } });

      expect(screen.getByText('Tomato')).toBeInTheDocument();
      expect(screen.queryByText('Lettuce')).not.toBeInTheDocument();
    });

    it('should filter by scientific name', () => {
      render(<PlantSelector {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('Search plants...');
      fireEvent.change(searchInput, { target: { value: 'Solanum' } });

      expect(screen.getByText('Tomato')).toBeInTheDocument();
    });

    it('should filter by season', () => {
      render(<PlantSelector {...defaultProps} />);

      const seasonSelect = screen.getByRole('combobox');
      fireEvent.change(seasonSelect, { target: { value: 'fall' } });

      // Lettuce is a fall plant
      expect(screen.getByText('Lettuce')).toBeInTheDocument();
    });

    it('should allow user to change season filter to all seasons', () => {
      render(<PlantSelector {...defaultProps} />);

      const seasonSelect = screen.getByRole('combobox');
      expect(seasonSelect.value).toBe('spring');

      fireEvent.change(seasonSelect, { target: { value: 'all' } });
      expect(seasonSelect.value).toBe('all');
    });

    it('should show no results message when no plants match', () => {
      render(<PlantSelector {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('Search plants...');
      fireEvent.change(searchInput, { target: { value: 'xyz123' } });

      expect(screen.getByText('No plants found matching your criteria.')).toBeInTheDocument();
    });

    it('should combine search and season filters', () => {
      render(<PlantSelector {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('Search plants...');
      const seasonSelect = screen.getByRole('combobox');

      fireEvent.change(searchInput, { target: { value: 'carrot' } });
      fireEvent.change(seasonSelect, { target: { value: 'spring' } });

      expect(screen.getByText('Carrot')).toBeInTheDocument();
    });
  });

  describe('display formatting', () => {
    it('should display space for plants that use 1+ sq ft', () => {
      render(<PlantSelector {...defaultProps} />);

      // Tomato uses 1 sq ft - multiple plants show this
      expect(screen.getAllByText('1 sq ft').length).toBeGreaterThan(0);
    });

    it('should display plants per square for fractional space', () => {
      render(<PlantSelector {...defaultProps} />);

      // Lettuce uses 0.25 sq ft = 4 plants per square
      expect(screen.getAllByText('4/sq ft').length).toBeGreaterThan(0);
    });

    it('should display sun icons correctly', () => {
      render(<PlantSelector {...defaultProps} />);

      // Full sun icon for tomato
      expect(screen.getAllByText('☀️').length).toBeGreaterThan(0);
    });

    it('should display partial sun icon for partial shade plants', () => {
      render(<PlantSelector {...defaultProps} />);

      // Partial sun icon for lettuce (partial shade)
      expect(screen.getAllByText('⛅').length).toBeGreaterThan(0);
    });


    it('should display plant seasons', () => {
      render(<PlantSelector {...defaultProps} />);

      expect(screen.getAllByText(/Spring/).length).toBeGreaterThan(0);
    });
  });

  describe('selected plants display', () => {
    it('should show selected plants section when plants are selected', () => {
      render(<PlantSelector {...defaultProps} initialSelections={{ tomato: 2, basil: 1 }} />);

      expect(screen.getByText('Selected Plants (2)')).toBeInTheDocument();
    });

    it('should not show selected plants section when no plants selected', () => {
      render(<PlantSelector {...defaultProps} />);

      expect(screen.queryByText(/Selected Plants/)).not.toBeInTheDocument();
    });

    it('should show plant count in selected list', () => {
      // 2 sq ft of tomatoes = 2 plants (tomato is 1 sq ft per plant)
      render(<PlantSelector {...defaultProps} initialSelections={{ tomato: 2 }} />);

      expect(screen.getByText('(2 plants)')).toBeInTheDocument();
    });
  });

  describe('interaction edge cases', () => {
    it('should not toggle selection when clicking quantity input area', () => {
      render(<PlantSelector {...defaultProps} initialSelections={{ tomato: 1 }} />);

      const quantityInput = screen.getByLabelText('Sq ft:');
      fireEvent.click(quantityInput);

      // Should not remove the selection
      expect(screen.getByText('Selected Plants (1)')).toBeInTheDocument();
    });

    it('should handle removing plant via selected plants list', () => {
      render(<PlantSelector {...defaultProps} initialSelections={{ tomato: 1 }} />);

      // Use the remove button in the selected plants section
      const removeButton = screen.getByLabelText('Remove Tomato');
      fireEvent.click(removeButton);

      // The plant should be deselected through handleQuantityChange(plantId, 0)
      expect(defaultProps.onSelectionChange).toHaveBeenCalledWith([]);
    });

    it('should work without onSelectionChange prop', () => {
      render(<PlantSelector availableSpace={16} />);

      const addButtons = screen.getAllByText('+ Add');
      fireEvent.click(addButtons[0]);

      // Should not throw error
      expect(screen.getByText('Selected Plants (1)')).toBeInTheDocument();
    });

    it('should stop propagation when clicking Add button', () => {
      render(<PlantSelector {...defaultProps} />);

      // Click the Add button - it should add the plant, not toggle off
      const addButtons = screen.getAllByText('+ Add');
      fireEvent.click(addButtons[0]);

      expect(defaultProps.onSelectionChange).toHaveBeenCalledTimes(1);
    });
  });
});
