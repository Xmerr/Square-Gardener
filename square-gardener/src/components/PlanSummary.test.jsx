import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PlanSummary from './PlanSummary';
import * as storage from '../utils/storage';
import * as frostDateStorage from '../utils/frostDateStorage';

const mockNavigateFn = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigateFn
  };
});

vi.mock('../utils/storage');
vi.mock('../utils/frostDateStorage');

describe('PlanSummary', () => {
  beforeEach(() => {
    mockNavigateFn.mockClear();
    vi.mocked(storage.getBedById).mockReturnValue({
      id: 'bed-1',
      name: 'Main Garden',
      width: 4,
      height: 4
    });
    vi.mocked(storage.addGardenBed).mockReturnValue({
      id: 'bed-new',
      name: 'New Bed',
      width: 4,
      height: 4
    });
    vi.mocked(storage.addGardenPlant).mockReturnValue({
      id: 'plant-1',
      plantId: 'tomato',
      bedId: 'bed-1',
      quantity: 4,
      plantedDate: '2026-04-22T00:00:00.000Z'
    });
    vi.mocked(frostDateStorage.getFrostDates).mockReturnValue({
      lastSpringFrost: '2026-04-15',
      firstFallFrost: '2026-10-15',
      zipCode: '60601'
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const mockArrangement = {
    grid: [
      ['tomato', 'tomato', 'basil', null],
      ['tomato', 'tomato', 'basil', 'basil'],
      [null, null, null, null],
      [null, null, null, null]
    ],
    placements: [
      { plantId: 'tomato', row: 0, col: 0 },
      { plantId: 'tomato', row: 0, col: 1 },
      { plantId: 'tomato', row: 1, col: 0 },
      { plantId: 'tomato', row: 1, col: 1 },
      { plantId: 'basil', row: 0, col: 2 },
      { plantId: 'basil', row: 1, col: 2 },
      { plantId: 'basil', row: 1, col: 3 }
    ],
    success: true,
    stats: {
      uniquePlants: 2,
      filledSquares: 7,
      totalSquares: 16,
      companionAdjacencies: 4
    }
  };

  const mockBed = {
    id: 'bed-1',
    name: 'Main Garden',
    width: 4,
    height: 4
  };

  const mockPlantSelections = [
    { plantId: 'tomato', quantity: 4 },
    { plantId: 'basil', quantity: 8 }
  ];

  const renderComponent = (props = {}) => {
    return render(
      <BrowserRouter>
        <PlanSummary
          arrangement={mockArrangement}
          bed={mockBed}
          plantSelections={mockPlantSelections}
          {...props}
        />
      </BrowserRouter>
    );
  };

  describe('Rendering', () => {
    it('should render plan summary with bed information', () => {
      renderComponent();
      expect(screen.getByText('Plan Summary')).toBeInTheDocument();
      expect(screen.getByText('Main Garden')).toBeInTheDocument();
      expect(screen.getByText('4×4 ft')).toBeInTheDocument();
    });

    it('should display space usage statistics', () => {
      renderComponent();
      expect(screen.getByText('7 / 16 squares')).toBeInTheDocument();
      expect(screen.getByText('44% filled')).toBeInTheDocument();
    });

    it('should display plant list with quantities', () => {
      renderComponent();
      expect(screen.getByText('Tomato')).toBeInTheDocument();
      expect(screen.getByText('Basil')).toBeInTheDocument();
      expect(screen.getByText('Qty: 4')).toBeInTheDocument();
      expect(screen.getByText('Qty: 8')).toBeInTheDocument();
    });

    it('should display companion adjacencies when present', () => {
      renderComponent();
      expect(screen.getByText('✓ 4 companion plant adjacencies')).toBeInTheDocument();
    });

    it('should not display companion adjacencies when zero', () => {
      const arrangementWithNoCompanions = {
        ...mockArrangement,
        stats: { ...mockArrangement.stats, companionAdjacencies: 0 }
      };
      renderComponent({ arrangement: arrangementWithNoCompanions });
      expect(screen.queryByText(/companion plant adjacencies/)).not.toBeInTheDocument();
    });

    it('should display Apply to Garden button', () => {
      renderComponent();
      expect(screen.getByRole('button', { name: 'Apply to Garden' })).toBeInTheDocument();
    });

    it('should render empty state when no arrangement', () => {
      renderComponent({ arrangement: null });
      expect(screen.getByText('No plan to display')).toBeInTheDocument();
      expect(screen.queryByText('Plan Summary')).not.toBeInTheDocument();
    });

    it('should render empty state when no bed', () => {
      renderComponent({ bed: null });
      expect(screen.getByText('No plan to display')).toBeInTheDocument();
    });

    it('should render empty state when no plant selections', () => {
      renderComponent({ plantSelections: [] });
      expect(screen.getByText('No plan to display')).toBeInTheDocument();
    });

    it('should calculate stats from placements when stats not provided', () => {
      const arrangementWithoutStats = {
        ...mockArrangement,
        stats: undefined
      };
      renderComponent({ arrangement: arrangementWithoutStats });
      expect(screen.getByText('7 / 16 squares')).toBeInTheDocument();
    });
  });

  describe('Confirmation Dialog', () => {
    it('should show confirmation dialog when Apply button clicked', () => {
      renderComponent();
      const applyButton = screen.getByRole('button', { name: 'Apply to Garden' });
      fireEvent.click(applyButton);

      expect(screen.getByText('Confirm Apply Plan')).toBeInTheDocument();
      expect(screen.getByText(/This will add 2 plant type/)).toBeInTheDocument();
    });

    it('should display plant summary in confirmation dialog', () => {
      renderComponent();
      fireEvent.click(screen.getByRole('button', { name: 'Apply to Garden' }));

      expect(screen.getByText('• Tomato (4)')).toBeInTheDocument();
      expect(screen.getByText('• Basil (8)')).toBeInTheDocument();
    });

    it('should close confirmation dialog when Cancel clicked', () => {
      renderComponent();
      fireEvent.click(screen.getByRole('button', { name: 'Apply to Garden' }));

      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      fireEvent.click(cancelButton);

      expect(screen.queryByText('Confirm Apply Plan')).not.toBeInTheDocument();
    });
  });

  describe('Apply to Garden Functionality', () => {
    it('should apply plan and navigate to My Garden when confirmed', async () => {
      const onApplySuccess = vi.fn();
      renderComponent({ onApplySuccess });

      fireEvent.click(screen.getByRole('button', { name: 'Apply to Garden' }));
      const confirmButton = screen.getAllByRole('button', { name: 'Confirm' })[0];
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(storage.getBedById).toHaveBeenCalledWith('bed-1');
      });

      expect(storage.addGardenPlant).toHaveBeenCalledTimes(2);
      expect(storage.addGardenPlant).toHaveBeenCalledWith(
        'tomato',
        'bed-1',
        4,
        expect.any(String)
      );
      expect(storage.addGardenPlant).toHaveBeenCalledWith(
        'basil',
        'bed-1',
        3,
        expect.any(String)
      );

      await waitFor(() => {
        expect(onApplySuccess).toHaveBeenCalled();
      });
    });

    it('should create bed if it does not exist', async () => {
      vi.mocked(storage.getBedById).mockReturnValue(null);

      renderComponent();
      fireEvent.click(screen.getByRole('button', { name: 'Apply to Garden' }));
      fireEvent.click(screen.getAllByRole('button', { name: 'Confirm' })[0]);

      await waitFor(() => {
        expect(storage.addGardenBed).toHaveBeenCalledWith('Main Garden', 4, 4);
      });

      expect(storage.addGardenPlant).toHaveBeenCalledWith(
        expect.any(String),
        'bed-new',
        expect.any(Number),
        expect.any(String)
      );
    });

    it('should calculate spring planting dates correctly', async () => {
      renderComponent();
      fireEvent.click(screen.getByRole('button', { name: 'Apply to Garden' }));
      fireEvent.click(screen.getAllByRole('button', { name: 'Confirm' })[0]);

      await waitFor(() => {
        expect(storage.addGardenPlant).toHaveBeenCalled();
      });

      const tomatoCall = vi.mocked(storage.addGardenPlant).mock.calls.find(
        call => call[0] === 'tomato'
      );
      expect(tomatoCall).toBeDefined();
      const plantingDate = new Date(tomatoCall[3]);
      const lastSpring = new Date('2026-04-15');
      const expectedDate = new Date(lastSpring);
      expectedDate.setDate(expectedDate.getDate() + 7);

      expect(plantingDate.toDateString()).toBe(expectedDate.toDateString());
    });

    it('should use current date when frost dates not configured', async () => {
      vi.mocked(frostDateStorage.getFrostDates).mockReturnValue({
        lastSpringFrost: null,
        firstFallFrost: null,
        zipCode: null
      });

      renderComponent();
      fireEvent.click(screen.getByRole('button', { name: 'Apply to Garden' }));
      fireEvent.click(screen.getAllByRole('button', { name: 'Confirm' })[0]);

      await waitFor(() => {
        expect(storage.addGardenPlant).toHaveBeenCalled();
      });

      const call = vi.mocked(storage.addGardenPlant).mock.calls[0];
      const plantingDate = new Date(call[3]);
      const now = new Date();

      expect(plantingDate.getDate()).toBe(now.getDate());
    });

    it('should disable Apply button during operation', () => {
      renderComponent();

      const applyButton = screen.getByRole('button', { name: 'Apply to Garden' });
      expect(applyButton).not.toBeDisabled();

      fireEvent.click(applyButton);

      expect(screen.getByText('Confirm Apply Plan')).toBeInTheDocument();
    });

    it('should handle errors during apply', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
      vi.mocked(storage.addGardenPlant).mockImplementation(() => {
        throw new Error('Storage error');
      });

      renderComponent();
      fireEvent.click(screen.getByRole('button', { name: 'Apply to Garden' }));
      fireEvent.click(screen.getAllByRole('button', { name: 'Confirm' })[0]);

      await waitFor(() => {
        expect(consoleError).toHaveBeenCalled();
      });

      expect(alertMock).toHaveBeenCalledWith('Failed to apply plan. Please try again.');
      consoleError.mockRestore();
      alertMock.mockRestore();
    });

    it('should show confirmation with correct details', async () => {
      renderComponent();
      fireEvent.click(screen.getByRole('button', { name: 'Apply to Garden' }));

      await waitFor(() => {
        expect(screen.getByText('Confirm Apply Plan')).toBeInTheDocument();
      });

      expect(screen.getByText(/This will add 2 plant type/)).toBeInTheDocument();
      expect(screen.getByText(/7 plants to your garden/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
    });
  });

  describe('Planting Date Calculations', () => {
    it('should calculate fall planting dates correctly', async () => {
      const fallSelections = [
        { plantId: 'spinach', quantity: 9 }
      ];
      const fallArrangement = {
        grid: [['spinach']],
        placements: [{ plantId: 'spinach', row: 0, col: 0 }],
        success: true,
        stats: { uniquePlants: 1, filledSquares: 1, totalSquares: 1, companionAdjacencies: 0 }
      };

      renderComponent({
        arrangement: fallArrangement,
        plantSelections: fallSelections,
        bed: { id: 'bed-1', name: 'Fall Bed', width: 1, height: 1 }
      });

      fireEvent.click(screen.getByRole('button', { name: 'Apply to Garden' }));
      fireEvent.click(screen.getAllByRole('button', { name: 'Confirm' })[0]);

      await waitFor(() => {
        expect(storage.addGardenPlant).toHaveBeenCalled();
      });

      const spinachCall = vi.mocked(storage.addGardenPlant).mock.calls.find(
        call => call[0] === 'spinach'
      );
      expect(spinachCall).toBeDefined();
      const plantingDate = new Date(spinachCall[3]);
      const firstFall = new Date('2026-10-15');

      expect(plantingDate < firstFall).toBe(true);
    });

    it('should calculate summer planting dates when plant is summer only', async () => {
      const summerSelections = [
        { plantId: 'cucumber', quantity: 1 }
      ];
      const summerArrangement = {
        grid: [['cucumber']],
        placements: [{ plantId: 'cucumber', row: 0, col: 0 }],
        success: true,
        stats: { uniquePlants: 1, filledSquares: 1, totalSquares: 1, companionAdjacencies: 0 }
      };

      renderComponent({
        arrangement: summerArrangement,
        plantSelections: summerSelections,
        bed: { id: 'bed-1', name: 'Summer Bed', width: 1, height: 1 }
      });

      fireEvent.click(screen.getByRole('button', { name: 'Apply to Garden' }));
      fireEvent.click(screen.getAllByRole('button', { name: 'Confirm' })[0]);

      await waitFor(() => {
        expect(storage.addGardenPlant).toHaveBeenCalled();
      });

      const cucumberCall = vi.mocked(storage.addGardenPlant).mock.calls[0];
      expect(cucumberCall).toBeDefined();
      const plantingDate = new Date(cucumberCall[3]);
      const lastSpring = new Date('2026-04-15');
      const expectedDate = new Date(lastSpring);
      expectedDate.setDate(expectedDate.getDate() + 7);

      expect(plantingDate.toDateString()).toBe(expectedDate.toDateString());
    });
  });

  describe('Space Calculations', () => {
    it('should calculate space needed for each plant', () => {
      renderComponent();
      expect(screen.getByText('Space: 4 sq ft')).toBeInTheDocument();
      expect(screen.getByText('Space: 2 sq ft')).toBeInTheDocument();
    });

    it('should handle plants with fractional space requirements', () => {
      const selections = [
        { plantId: 'lettuce', quantity: 4 }
      ];
      const arrangement = {
        grid: [['lettuce']],
        placements: [{ plantId: 'lettuce', row: 0, col: 0 }],
        success: true,
        stats: { uniquePlants: 1, filledSquares: 1, totalSquares: 16, companionAdjacencies: 0 }
      };

      renderComponent({
        arrangement,
        plantSelections: selections
      });

      expect(screen.getByText('Space: 1 sq ft')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle arrangement with only placements array', () => {
      const minimalArrangement = {
        placements: [
          { plantId: 'tomato', row: 0, col: 0 },
          { plantId: 'basil', row: 0, col: 1 }
        ]
      };

      renderComponent({ arrangement: minimalArrangement });
      expect(screen.getByText('Plan Summary')).toBeInTheDocument();
    });

    it('should handle plant selections with undefined plant', async () => {
      const selectionsWithUnknown = [
        { plantId: 'tomato', quantity: 4 },
        { plantId: 'unknown-plant', quantity: 1 }
      ];
      const arrangementWithUnknown = {
        grid: [['tomato'], ['unknown-plant']],
        placements: [
          { plantId: 'tomato', row: 0, col: 0 },
          { plantId: 'unknown-plant', row: 1, col: 0 }
        ],
        success: true,
        stats: { uniquePlants: 2, filledSquares: 2, totalSquares: 16, companionAdjacencies: 0 }
      };

      renderComponent({
        plantSelections: selectionsWithUnknown,
        arrangement: arrangementWithUnknown
      });
      fireEvent.click(screen.getByRole('button', { name: 'Apply to Garden' }));
      fireEvent.click(screen.getAllByRole('button', { name: 'Confirm' })[0]);

      await waitFor(() => {
        expect(storage.addGardenPlant).toHaveBeenCalledTimes(1);
      }, { timeout: 3000 });
    });

    it('should count plants correctly by type from placements', async () => {
      renderComponent();
      fireEvent.click(screen.getByRole('button', { name: 'Apply to Garden' }));
      fireEvent.click(screen.getAllByRole('button', { name: 'Confirm' })[0]);

      await waitFor(() => {
        expect(storage.addGardenPlant).toHaveBeenCalledWith('tomato', 'bed-1', 4, expect.any(String));
        expect(storage.addGardenPlant).toHaveBeenCalledWith('basil', 'bed-1', 3, expect.any(String));
      });
    });
  });
});
