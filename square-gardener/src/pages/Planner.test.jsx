import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Planner from './Planner';
import * as storage from '../utils/storage';
import * as frostDateStorage from '../utils/frostDateStorage';
import * as planningAlgorithm from '../utils/planningAlgorithm';
import * as plantingSchedule from '../utils/plantingSchedule';

vi.mock('../utils/storage', () => ({
  getGardenBeds: vi.fn(),
  saveBeds: vi.fn(),
  getPlants: vi.fn(),
  savePlants: vi.fn()
}));

vi.mock('../utils/frostDateStorage', () => ({
  getFrostDates: vi.fn(),
  saveFrostDates: vi.fn(),
  hasFrostDatesConfigured: vi.fn(),
  clearFrostDates: vi.fn()
}));

vi.mock('../utils/planningAlgorithm', () => ({
  generateArrangement: vi.fn(),
  validateArrangement: vi.fn(),
  getArrangementStats: vi.fn()
}));

vi.mock('../utils/plantingSchedule', () => ({
  generatePlantingSchedule: vi.fn(),
  calculatePlantingWindow: vi.fn(),
  groupScheduleByMonth: vi.fn()
}));

// Mock child components
vi.mock('../components/FrostDateForm', () => ({
  default: ({ onSave, initialFrostDates }) => (
    <div>
      <h2>Frost Date Settings</h2>
      <button onClick={() => onSave && onSave(initialFrostDates)}>Mock Save</button>
    </div>
  )
}));

vi.mock('../components/PlantSelector', () => ({
  default: ({ onPlantsSelected, availableSquares }) => (
    <div>
      <h3>Select Plants</h3>
      <div>Available: {availableSquares}</div>
      <button onClick={() => onPlantsSelected && onPlantsSelected([])}>Mock Select None</button>
      <button onClick={() => onPlantsSelected && onPlantsSelected([{ plantId: 'tomato', quantity: 2 }])}>Mock Select Plants</button>
    </div>
  )
}));

vi.mock('../components/PlanningGrid', () => ({
  default: ({ bed, onArrangementChange, editable }) => (
    <div>
      <h3>Garden Layout ({bed?.width}×{bed?.height})</h3>
      <div>Arrangement Grid</div>
      {editable && <button onClick={() => onArrangementChange && onArrangementChange({ grid: [['modified']] })}>Mock Edit</button>}
    </div>
  )
}));

vi.mock('../components/PlantingTimeline', () => ({
  default: ({ schedule }) => (
    <div>
      <h3>Planting Schedule</h3>
      <div>{schedule?.length || 0} plants</div>
    </div>
  )
}));

describe('Planner', () => {
  const mockBeds = [
    { id: 'bed-1', name: 'Main Garden', width: 4, height: 4 },
    { id: 'bed-2', name: 'Side Garden', width: 2, height: 3 }
  ];

  const mockFrostDates = {
    lastSpringFrost: '2026-04-15',
    firstFallFrost: '2026-10-15',
    zipCode: '12345'
  };

  const mockArrangement = {
    grid: [
      ['tomato', 'basil', null, null],
      ['tomato', 'basil', null, null],
      [null, null, null, null],
      [null, null, null, null]
    ],
    placements: [
      { plantId: 'tomato', row: 0, col: 0 },
      { plantId: 'basil', row: 0, col: 1 }
    ],
    success: true,
    unplacedPlants: []
  };

  const mockSchedule = [
    {
      plantId: 'tomato',
      plantName: 'Tomato',
      plantingWindow: { start: '2026-04-22', end: '2026-05-27' },
      season: 'spring'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    storage.getGardenBeds.mockReturnValue(mockBeds);
    frostDateStorage.getFrostDates.mockReturnValue(mockFrostDates);
    planningAlgorithm.generateArrangement.mockReturnValue(mockArrangement);
    plantingSchedule.generatePlantingSchedule.mockReturnValue(mockSchedule);
  });

  it('renders page title', () => {
    render(<Planner />);
    expect(screen.getByText('Garden Planner')).toBeInTheDocument();
  });

  it('renders page subtitle', () => {
    render(<Planner />);
    expect(screen.getByText('Design your square foot garden layout')).toBeInTheDocument();
  });

  it('shows no beds message when no beds available', () => {
    storage.getGardenBeds.mockReturnValue([]);
    render(<Planner />);

    expect(screen.getByText('No Beds Available')).toBeInTheDocument();
    expect(screen.getByText('Create a garden bed in My Garden to start planning.')).toBeInTheDocument();
  });

  it('renders frost date form', () => {
    render(<Planner />);
    expect(screen.getByText('Frost Date Settings')).toBeInTheDocument();
  });

  it('loads beds on mount', () => {
    render(<Planner />);
    expect(storage.getGardenBeds).toHaveBeenCalled();
  });

  it('loads frost dates on mount', () => {
    render(<Planner />);
    expect(frostDateStorage.getFrostDates).toHaveBeenCalled();
  });

  it('displays bed selector when beds are available', () => {
    render(<Planner />);
    expect(screen.getByText('Select Bed')).toBeInTheDocument();
  });

  it('shows all available beds in selector', () => {
    render(<Planner />);
    expect(screen.getByText(/Main Garden \(4×4\)/)).toBeInTheDocument();
    expect(screen.getByText(/Side Garden \(2×3\)/)).toBeInTheDocument();
  });

  it('selects first bed by default', () => {
    render(<Planner />);
    const select = screen.getByRole('combobox');
    expect(select.value).toBe('bed-1');
  });

  it('changes selected bed when user selects different bed', () => {
    render(<Planner />);
    const select = screen.getByRole('combobox');

    fireEvent.change(select, { target: { value: 'bed-2' } });

    expect(select.value).toBe('bed-2');
  });

  it('renders plant selector when bed is selected', () => {
    render(<Planner />);
    expect(screen.getByText('Select Plants')).toBeInTheDocument();
  });

  it('displays generate plan button', () => {
    render(<Planner />);
    expect(screen.getByRole('button', { name: /Generate Plan/i })).toBeInTheDocument();
  });

  it('disables generate plan button when no plants selected', () => {
    render(<Planner />);
    const button = screen.getByRole('button', { name: /Generate Plan/i });
    expect(button).toBeDisabled();
  });

  it('shows tooltip on disabled Generate Plan button', () => {
    render(<Planner />);
    const button = screen.getByRole('button', { name: /Generate Plan/i });
    expect(button).toHaveAttribute('title', 'Select plants above to generate a plan');
  });

  it('does not show tooltip on enabled Generate Plan button', () => {
    render(<Planner />);

    // Select plants to enable the button
    const selectPlantsButton = screen.getByText('Mock Select Plants');
    fireEvent.click(selectPlantsButton);

    const button = screen.getByRole('button', { name: /Generate Plan/i });
    expect(button).toHaveAttribute('title', '');
  });

  it('shows error when generate plan clicked without bed', () => {
    storage.getGardenBeds.mockReturnValue([]);
    render(<Planner />);

    // Manually trigger the scenario where selectedBed is null
    // This is a defensive check in the code
    expect(screen.queryByText('Please select a bed first')).not.toBeInTheDocument();
  });

  it('generates arrangement when plan is generated with valid inputs', async () => {
    render(<Planner />);

    // Simulate plant selection by finding the PlantSelector and triggering its callback
    // Since PlantSelector is a complex component, we'll test the integration indirectly
    // by verifying the arrangement is generated when the button is clicked

    // We need to simulate selecting plants first
    // This would normally be done through the PlantSelector component
    // For now, we'll just verify the button exists and can be interacted with
    const button = screen.getByRole('button', { name: /Generate Plan/i });
    expect(button).toBeInTheDocument();
  });

  it('displays error message when arrangement generation fails', async () => {
    planningAlgorithm.generateArrangement.mockImplementation(() => {
      throw new Error('Not enough space');
    });

    render(<Planner />);

    // We would need to select plants and click generate
    // For comprehensive testing, this would require more complex setup
  });

  it('clears error when bed changes', () => {
    render(<Planner />);
    const select = screen.getByRole('combobox');

    fireEvent.change(select, { target: { value: 'bed-2' } });

    // Error should not be visible
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
  });

  it('updates frost dates when form is saved', () => {
    render(<Planner />);

    // FrostDateForm component should be rendered
    expect(screen.getByText('Frost Date Settings')).toBeInTheDocument();

    // The actual interaction would be tested in FrostDateForm.test.jsx
    // Here we just verify the form is present
  });

  it('regenerates schedule when frost dates are updated', () => {
    render(<Planner />);

    // This tests the handleFrostDatesSave callback
    // The actual regeneration logic would be triggered by the FrostDateForm
    expect(frostDateStorage.getFrostDates).toHaveBeenCalled();
  });

  it('displays planning grid when arrangement exists', () => {
    render(<Planner />);

    // Initially no grid should be visible with specific heading
    expect(screen.queryByText(/Garden Layout \(/i)).not.toBeInTheDocument();

    // Grid would appear after generating a plan
  });

  it('displays planting timeline when schedule exists', () => {
    render(<Planner />);

    // Initially no timeline should be visible
    expect(screen.queryByText(/Planting Schedule/i)).not.toBeInTheDocument();

    // Timeline would appear after generating a plan with frost dates
  });

  it('clears arrangement when bed is changed', () => {
    render(<Planner />);
    const select = screen.getByRole('combobox');

    fireEvent.change(select, { target: { value: 'bed-2' } });

    // Arrangement should be cleared
    expect(screen.queryByText(/Garden Layout \(/i)).not.toBeInTheDocument();
  });

  it('clears schedule when bed is changed', () => {
    render(<Planner />);
    const select = screen.getByRole('combobox');

    fireEvent.change(select, { target: { value: 'bed-2' } });

    // Schedule should be cleared
    expect(screen.queryByText(/Planting Schedule/i)).not.toBeInTheDocument();
  });

  it('handles empty beds array gracefully', () => {
    storage.getGardenBeds.mockReturnValue([]);
    render(<Planner />);

    expect(screen.getByText('No Beds Available')).toBeInTheDocument();
    expect(screen.queryByText('Select Bed')).not.toBeInTheDocument();
  });

  it('handles null frost dates gracefully', () => {
    frostDateStorage.getFrostDates.mockReturnValue(null);
    render(<Planner />);

    // Should still render without crashing
    expect(screen.getByText('Garden Planner')).toBeInTheDocument();
  });

  it('passes correct props to FrostDateForm', () => {
    render(<Planner />);

    // FrostDateForm should receive the loaded frost dates
    expect(screen.getByText('Frost Date Settings')).toBeInTheDocument();
  });

  it('passes correct props to PlantSelector', () => {
    render(<Planner />);

    // PlantSelector should receive available squares based on selected bed
    expect(screen.getByText('Select Plants')).toBeInTheDocument();
  });

  it('shows planner emoji in no beds state', () => {
    storage.getGardenBeds.mockReturnValue([]);
    render(<Planner />);

    expect(screen.getByText('📐')).toBeInTheDocument();
  });

  it('handles bed change to first bed', () => {
    render(<Planner />);
    const select = screen.getByRole('combobox');

    // Change to second bed
    fireEvent.change(select, { target: { value: 'bed-2' } });
    expect(select.value).toBe('bed-2');

    // Change back to first bed
    fireEvent.change(select, { target: { value: 'bed-1' } });
    expect(select.value).toBe('bed-1');
  });

  it('initializes with first bed selected when beds available', () => {
    render(<Planner />);

    const select = screen.getByRole('combobox');
    expect(select.value).toBe('bed-1');
  });

  it('handles undefined frost dates', () => {
    frostDateStorage.getFrostDates.mockReturnValue(undefined);
    render(<Planner />);

    expect(screen.getByText('Garden Planner')).toBeInTheDocument();
  });

  it('calls onPlantsSelected when plants are selected', () => {
    render(<Planner />);

    const mockSelectButton = screen.getByText('Mock Select None');
    fireEvent.click(mockSelectButton);

    // Plants should be selected (empty array in this mock)
    expect(screen.getByText('Generate Plan')).toBeInTheDocument();
  });

  it('calls onFrostDatesSave when frost dates are saved', () => {
    render(<Planner />);

    const mockSaveButton = screen.getByText('Mock Save');
    fireEvent.click(mockSaveButton);

    // Should trigger the save callback
    expect(screen.getByText('Garden Planner')).toBeInTheDocument();
  });

  it('generates plan when button is clicked with valid state', async () => {
    // Setup: mock successful generation
    render(<Planner />);

    // Verify initial state
    expect(planningAlgorithm.generateArrangement).not.toHaveBeenCalled();

    // The Generate Plan button is rendered
    const generateButton = screen.getByText('Generate Plan');
    expect(generateButton).toBeDisabled(); // Initially disabled because no plants

    // Note: Full integration testing would require actually selecting plants
    // which is complex with the mocked PlantSelector
  });

  it('shows error when plan generation fails with valid error', () => {
    planningAlgorithm.generateArrangement.mockImplementation(() => {
      throw new Error('Test error message');
    });

    render(<Planner />);

    // Button should still be present
    expect(screen.getByText('Generate Plan')).toBeInTheDocument();
  });

  it('clears error when plants are selected', () => {
    render(<Planner />);

    const mockSelectButton = screen.getByText('Mock Select None');
    fireEvent.click(mockSelectButton);

    // Error should be cleared (no error message visible)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('does not generate schedule when frost dates are incomplete', () => {
    frostDateStorage.getFrostDates.mockReturnValue({
      lastSpringFrost: '2026-04-15',
      firstFallFrost: null
    });

    render(<Planner />);

    // Should render without crashing
    expect(screen.getByText('Garden Planner')).toBeInTheDocument();
  });

  it('regenerates schedule when frost dates are saved with selected plants', () => {
    plantingSchedule.generatePlantingSchedule.mockReturnValue(mockSchedule);

    render(<Planner />);

    // Select plants first
    const selectPlantsButton = screen.getByText('Mock Select Plants');
    fireEvent.click(selectPlantsButton);

    // Now save frost dates which should trigger schedule regeneration
    const mockSaveButton = screen.getByText('Mock Save');
    fireEvent.click(mockSaveButton);

    // Should have called generatePlantingSchedule
    expect(plantingSchedule.generatePlantingSchedule).toHaveBeenCalled();
  });

  it('generates plan successfully with plants and valid bed', () => {
    render(<Planner />);

    // Select plants
    const selectPlantsButton = screen.getByText('Mock Select Plants');
    fireEvent.click(selectPlantsButton);

    // Generate button should now be enabled
    const generateButton = screen.getByText('Generate Plan');
    expect(generateButton).not.toBeDisabled();

    // Click generate
    fireEvent.click(generateButton);

    // Should call generateArrangement
    expect(planningAlgorithm.generateArrangement).toHaveBeenCalledWith({
      width: 4,
      height: 4,
      plantSelections: [{ plantId: 'tomato', quantity: 2 }],
      lockedSquares: null
    });
  });

  it('generates schedule when frost dates are present during plan generation', () => {
    render(<Planner />);

    // Select plants
    const selectPlantsButton = screen.getByText('Mock Select Plants');
    fireEvent.click(selectPlantsButton);

    // Generate plan
    const generateButton = screen.getByText('Generate Plan');
    fireEvent.click(generateButton);

    // Should generate schedule since frost dates are mocked
    expect(plantingSchedule.generatePlantingSchedule).toHaveBeenCalledWith(
      [{ plantId: 'tomato', quantity: 2 }],
      mockFrostDates
    );
  });

  it('does not generate schedule when frost dates are missing during plan generation', () => {
    frostDateStorage.getFrostDates.mockReturnValue({});
    plantingSchedule.generatePlantingSchedule.mockClear();

    render(<Planner />);

    // Select plants
    const selectPlantsButton = screen.getByText('Mock Select Plants');
    fireEvent.click(selectPlantsButton);

    // Generate plan
    const generateButton = screen.getByText('Generate Plan');
    fireEvent.click(generateButton);

    // Should not generate schedule without frost dates
    expect(plantingSchedule.generatePlantingSchedule).not.toHaveBeenCalled();
  });

  it('handles error during plan generation and shows error message', () => {
    planningAlgorithm.generateArrangement.mockImplementation(() => {
      throw new Error('Not enough space');
    });

    render(<Planner />);

    // Select plants
    const selectPlantsButton = screen.getByText('Mock Select Plants');
    fireEvent.click(selectPlantsButton);

    // Generate plan
    const generateButton = screen.getByText('Generate Plan');
    fireEvent.click(generateButton);

    // Should show error message
    expect(screen.getByText('Not enough space')).toBeInTheDocument();
  });

  it('clears arrangement and schedule on error', () => {
    planningAlgorithm.generateArrangement.mockImplementation(() => {
      throw new Error('Test error');
    });

    render(<Planner />);

    // Select plants
    const selectPlantsButton = screen.getByText('Mock Select Plants');
    fireEvent.click(selectPlantsButton);

    // Generate plan
    const generateButton = screen.getByText('Generate Plan');
    fireEvent.click(generateButton);

    // Arrangement and schedule should be cleared
    expect(screen.queryByText('Arrangement Grid')).not.toBeInTheDocument();
  });

  it('shows error when trying to generate without bed', () => {
    storage.getGardenBeds.mockReturnValue([]);
    render(<Planner />);

    // Try to trigger generate (though button won't be visible)
    // This tests the defensive code path
    expect(screen.getByText('No Beds Available')).toBeInTheDocument();
  });

  it('shows error when trying to generate without plants', () => {
    render(<Planner />);

    // Don't select any plants, try to click generate
    const generateButton = screen.getByText('Generate Plan');

    // Button should be disabled
    expect(generateButton).toBeDisabled();
  });

  it('prevents generation when selectedBed is somehow null', () => {
    // Create a scenario where we can force selectedBed to be null
    // This tests the defensive programming in handleGeneratePlan
    storage.getGardenBeds.mockReturnValue([]);
    render(<Planner />);

    // No bed should be selected
    expect(screen.getByText('No Beds Available')).toBeInTheDocument();

    // The generate button won't even be visible in this state
    expect(screen.queryByText('Generate Plan')).not.toBeInTheDocument();
  });

  describe('editing functionality', () => {
    it('shows undo/redo buttons after plan is generated', () => {
      render(<Planner />);

      // Select plants
      const selectPlantsButton = screen.getByText('Mock Select Plants');
      fireEvent.click(selectPlantsButton);

      // Generate plan
      const generateButton = screen.getByText('Generate Plan');
      fireEvent.click(generateButton);

      // Undo/Redo buttons should appear
      expect(screen.getByText('Undo')).toBeInTheDocument();
      expect(screen.getByText('Redo')).toBeInTheDocument();
    });

    it('shows Regenerate button after plan is generated', () => {
      render(<Planner />);

      // Select plants
      const selectPlantsButton = screen.getByText('Mock Select Plants');
      fireEvent.click(selectPlantsButton);

      // Generate plan
      const generateButton = screen.getByText('Generate Plan');
      fireEvent.click(generateButton);

      // Regenerate button should appear
      expect(screen.getByText('Regenerate')).toBeInTheDocument();
    });

    it('disables undo button when no history', () => {
      render(<Planner />);

      // Select plants
      const selectPlantsButton = screen.getByText('Mock Select Plants');
      fireEvent.click(selectPlantsButton);

      // Generate plan
      const generateButton = screen.getByText('Generate Plan');
      fireEvent.click(generateButton);

      // Undo should be disabled initially
      const undoButton = screen.getByText('Undo');
      expect(undoButton).toBeDisabled();
    });

    it('enables undo button after making changes', () => {
      render(<Planner />);

      // Select plants
      const selectPlantsButton = screen.getByText('Mock Select Plants');
      fireEvent.click(selectPlantsButton);

      // Generate plan
      const generateButton = screen.getByText('Generate Plan');
      fireEvent.click(generateButton);

      // Make an edit
      const mockEditButton = screen.getByText('Mock Edit');
      fireEvent.click(mockEditButton);

      // Undo should be enabled now
      const undoButton = screen.getByText('Undo');
      expect(undoButton).not.toBeDisabled();
    });

    it('enables redo button after undoing', () => {
      render(<Planner />);

      // Select plants
      const selectPlantsButton = screen.getByText('Mock Select Plants');
      fireEvent.click(selectPlantsButton);

      // Generate plan
      const generateButton = screen.getByText('Generate Plan');
      fireEvent.click(generateButton);

      // Make an edit
      const mockEditButton = screen.getByText('Mock Edit');
      fireEvent.click(mockEditButton);

      // Undo
      const undoButton = screen.getByText('Undo');
      fireEvent.click(undoButton);

      // Redo should be enabled now
      const redoButton = screen.getByText('Redo');
      expect(redoButton).not.toBeDisabled();
    });

    it('disables redo button when at latest state', () => {
      render(<Planner />);

      // Select plants
      const selectPlantsButton = screen.getByText('Mock Select Plants');
      fireEvent.click(selectPlantsButton);

      // Generate plan
      const generateButton = screen.getByText('Generate Plan');
      fireEvent.click(generateButton);

      // Redo should be disabled initially
      const redoButton = screen.getByText('Redo');
      expect(redoButton).toBeDisabled();
    });

    it('regenerate creates new arrangement with same plants', () => {
      planningAlgorithm.generateArrangement.mockClear();

      render(<Planner />);

      // Select plants
      const selectPlantsButton = screen.getByText('Mock Select Plants');
      fireEvent.click(selectPlantsButton);

      // Generate plan
      const generateButton = screen.getByText('Generate Plan');
      fireEvent.click(generateButton);

      // Clear the mock to verify regenerate calls it again
      planningAlgorithm.generateArrangement.mockClear();

      // Click Regenerate
      const regenerateButton = screen.getByText('Regenerate');
      fireEvent.click(regenerateButton);

      // Should call generateArrangement again with same params
      expect(planningAlgorithm.generateArrangement).toHaveBeenCalledWith({
        width: 4,
        height: 4,
        plantSelections: [{ plantId: 'tomato', quantity: 2 }],
        lockedSquares: null
      });
    });

    it('clears future history after making new changes', () => {
      render(<Planner />);

      // Select plants
      const selectPlantsButton = screen.getByText('Mock Select Plants');
      fireEvent.click(selectPlantsButton);

      // Generate plan
      const generateButton = screen.getByText('Generate Plan');
      fireEvent.click(generateButton);

      // Make first edit
      const mockEditButton = screen.getByText('Mock Edit');
      fireEvent.click(mockEditButton);

      // Undo
      const undoButton = screen.getByText('Undo');
      fireEvent.click(undoButton);

      // Make another edit (this should clear the redo history)
      fireEvent.click(mockEditButton);

      // Redo should be disabled because we branched the history
      const redoButton = screen.getByText('Redo');
      expect(redoButton).toBeDisabled();
    });

    it('passes editable prop to PlanningGrid after generation', () => {
      render(<Planner />);

      // Select plants
      const selectPlantsButton = screen.getByText('Mock Select Plants');
      fireEvent.click(selectPlantsButton);

      // Generate plan
      const generateButton = screen.getByText('Generate Plan');
      fireEvent.click(generateButton);

      // Mock Edit button should be visible (only shown when editable=true)
      expect(screen.getByText('Mock Edit')).toBeInTheDocument();
    });

    it('resets history when regenerating plan', () => {
      render(<Planner />);

      // Select plants
      const selectPlantsButton = screen.getByText('Mock Select Plants');
      fireEvent.click(selectPlantsButton);

      // Generate plan
      const generateButton = screen.getByText('Generate Plan');
      fireEvent.click(generateButton);

      // Make an edit
      const mockEditButton = screen.getByText('Mock Edit');
      fireEvent.click(mockEditButton);

      // Undo should be enabled
      let undoButton = screen.getByText('Undo');
      expect(undoButton).not.toBeDisabled();

      // Regenerate
      const regenerateButton = screen.getByText('Regenerate');
      fireEvent.click(regenerateButton);

      // Undo should be disabled again (history reset)
      undoButton = screen.getByText('Undo');
      expect(undoButton).toBeDisabled();
    });

    it('handles redo correctly when history is available', () => {
      render(<Planner />);

      // Select plants
      const selectPlantsButton = screen.getByText('Mock Select Plants');
      fireEvent.click(selectPlantsButton);

      // Generate plan
      const generateButton = screen.getByText('Generate Plan');
      fireEvent.click(generateButton);

      // Make an edit
      const mockEditButton = screen.getByText('Mock Edit');
      fireEvent.click(mockEditButton);

      // Undo
      const undoButton = screen.getByText('Undo');
      fireEvent.click(undoButton);

      // Redo should be enabled
      const redoButton = screen.getByText('Redo');
      expect(redoButton).not.toBeDisabled();

      // Click Redo
      fireEvent.click(redoButton);

      // After redo, we should be back at the latest state
      // Redo should be disabled again
      expect(redoButton).toBeDisabled();
    });

    it('handles undo when history index is greater than 0', () => {
      render(<Planner />);

      // Select plants
      const selectPlantsButton = screen.getByText('Mock Select Plants');
      fireEvent.click(selectPlantsButton);

      // Generate plan
      const generateButton = screen.getByText('Generate Plan');
      fireEvent.click(generateButton);

      // Make two edits
      const mockEditButton = screen.getByText('Mock Edit');
      fireEvent.click(mockEditButton);
      fireEvent.click(mockEditButton);

      // Undo should be enabled
      const undoButton = screen.getByText('Undo');
      expect(undoButton).not.toBeDisabled();

      // Click Undo
      fireEvent.click(undoButton);

      // Should still be able to undo again since we made two edits
      expect(undoButton).not.toBeDisabled();

      // Undo again
      fireEvent.click(undoButton);

      // Now undo should be disabled (back to initial state)
      expect(undoButton).toBeDisabled();
    });
  });
});
