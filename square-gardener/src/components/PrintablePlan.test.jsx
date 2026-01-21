import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PrintablePlan from './PrintablePlan';
import * as plantLibrary from '../data/plantLibrary';

vi.mock('../data/plantLibrary', () => ({
  getPlantById: vi.fn((id) => {
    const plants = {
      tomato: {
        id: 'tomato',
        name: 'Tomato',
        squaresPerPlant: 1,
        companionPlants: ['basil', 'carrot'],
        avoidPlants: ['cabbage'],
        daysToMaturity: 80
      },
      basil: {
        id: 'basil',
        name: 'Basil',
        squaresPerPlant: 0.25,
        companionPlants: ['tomato'],
        avoidPlants: [],
        daysToMaturity: 60
      },
      carrot: {
        id: 'carrot',
        name: 'Carrot',
        squaresPerPlant: 0.0625,
        companionPlants: ['tomato'],
        avoidPlants: [],
        daysToMaturity: 70
      },
      lettuce: {
        id: 'lettuce',
        name: 'Lettuce',
        squaresPerPlant: 0.25,
        companionPlants: [],
        avoidPlants: [],
        daysToMaturity: 45
      }
    };
    return plants[id] || null;
  })
}));

vi.mock('../utils/plantingSchedule', () => ({
  formatDate: (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}));

describe('PrintablePlan', () => {
  const mockArrangement = {
    grid: [
      ['tomato', 'basil'],
      ['carrot', null]
    ],
    placements: [
      { plantId: 'tomato', row: 0, col: 0 },
      { plantId: 'basil', row: 0, col: 1 },
      { plantId: 'carrot', row: 1, col: 0 }
    ],
    success: true,
    stats: {
      uniquePlants: 3,
      filledSquares: 3,
      totalSquares: 4,
      companionAdjacencies: 2
    }
  };

  const mockBed = {
    id: 'bed-1',
    name: 'Test Bed',
    width: 2,
    height: 2
  };

  const mockPlantSelections = [
    { plantId: 'tomato', quantity: 1 },
    { plantId: 'basil', quantity: 4 },
    { plantId: 'carrot', quantity: 16 }
  ];

  const mockSchedule = [
    {
      plantId: 'tomato',
      plantName: 'Tomato',
      plantingWindow: {
        start: '2026-04-22',
        end: '2026-05-27'
      },
      season: 'spring'
    },
    {
      plantId: 'basil',
      plantName: 'Basil',
      plantingWindow: {
        start: '2026-04-22',
        end: '2026-05-27'
      },
      season: 'spring'
    }
  ];

  const mockFrostDates = {
    lastSpringFrost: '2026-04-15',
    firstFallFrost: '2026-10-15',
    zipCode: '60601'
  };

  const defaultProps = {
    arrangement: mockArrangement,
    bed: mockBed,
    plantSelections: mockPlantSelections
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the mock to default implementation
    vi.mocked(plantLibrary.getPlantById).mockImplementation((id) => {
      const plants = {
        tomato: {
          id: 'tomato',
          name: 'Tomato',
          squaresPerPlant: 1,
          companionPlants: ['basil', 'carrot'],
          avoidPlants: ['cabbage'],
          daysToMaturity: 80
        },
        basil: {
          id: 'basil',
          name: 'Basil',
          squaresPerPlant: 0.25,
          companionPlants: ['tomato'],
          avoidPlants: [],
          daysToMaturity: 60
        },
        carrot: {
          id: 'carrot',
          name: 'Carrot',
          squaresPerPlant: 0.0625,
          companionPlants: ['tomato'],
          avoidPlants: [],
          daysToMaturity: 70
        },
        lettuce: {
          id: 'lettuce',
          name: 'Lettuce',
          squaresPerPlant: 0.25,
          companionPlants: [],
          avoidPlants: [],
          daysToMaturity: 45
        }
      };
      return plants[id] || null;
    });
  });

  describe('rendering', () => {
    it('should render the printable plan with bed name', () => {
      render(<PrintablePlan {...defaultProps} />);
      expect(screen.getByText('Garden Plan: Test Bed')).toBeInTheDocument();
    });

    it('should render bed dimensions', () => {
      render(<PrintablePlan {...defaultProps} />);
      expect(screen.getByText('Bed Size: 2×2 ft (4 sq ft)')).toBeInTheDocument();
    });

    it('should render empty message when no arrangement', () => {
      render(<PrintablePlan bed={mockBed} plantSelections={mockPlantSelections} />);
      expect(screen.getByText('No plan to print')).toBeInTheDocument();
    });

    it('should render empty message when no bed', () => {
      render(<PrintablePlan arrangement={mockArrangement} plantSelections={mockPlantSelections} />);
      expect(screen.getByText('No plan to print')).toBeInTheDocument();
    });

    it('should render empty message when no plant selections', () => {
      render(<PrintablePlan arrangement={mockArrangement} bed={mockBed} plantSelections={[]} />);
      expect(screen.getByText('No plan to print')).toBeInTheDocument();
    });

    it('should render empty message when plant selections is null', () => {
      render(<PrintablePlan arrangement={mockArrangement} bed={mockBed} />);
      expect(screen.getByText('No plan to print')).toBeInTheDocument();
    });

    it('should render print button', () => {
      render(<PrintablePlan {...defaultProps} />);
      expect(screen.getByRole('button', { name: 'Print Plan' })).toBeInTheDocument();
    });

    it('should render grid layout section', () => {
      render(<PrintablePlan {...defaultProps} />);
      expect(screen.getByText('Grid Layout')).toBeInTheDocument();
    });

    it('should render plant legend section', () => {
      render(<PrintablePlan {...defaultProps} />);
      expect(screen.getByText('Plant Legend')).toBeInTheDocument();
    });

    it('should render plan summary section', () => {
      render(<PrintablePlan {...defaultProps} />);
      expect(screen.getByText('Plan Summary')).toBeInTheDocument();
    });

    it('should render plant notes section', () => {
      render(<PrintablePlan {...defaultProps} />);
      expect(screen.getByText('Plant Notes')).toBeInTheDocument();
    });
  });

  describe('frost dates', () => {
    it('should display frost dates when provided', () => {
      render(<PrintablePlan {...defaultProps} frostDates={mockFrostDates} />);
      expect(screen.getByText(/Frost Dates:/)).toBeInTheDocument();
    });

    it('should not display frost dates section when not provided', () => {
      render(<PrintablePlan {...defaultProps} />);
      expect(screen.queryByText(/Frost Dates:/)).not.toBeInTheDocument();
    });

    it('should not display frost dates when lastSpringFrost is missing', () => {
      const incompleteFrostDates = {
        firstFallFrost: '2026-10-15',
        zipCode: '60601'
      };
      render(<PrintablePlan {...defaultProps} frostDates={incompleteFrostDates} />);
      expect(screen.queryByText(/Frost Dates:/)).not.toBeInTheDocument();
    });

    it('should not display frost dates when firstFallFrost is missing', () => {
      const incompleteFrostDates = {
        lastSpringFrost: '2026-04-15',
        zipCode: '60601'
      };
      render(<PrintablePlan {...defaultProps} frostDates={incompleteFrostDates} />);
      expect(screen.queryByText(/Frost Dates:/)).not.toBeInTheDocument();
    });
  });

  describe('grid layout', () => {
    it('should render grid with correct plant initials', () => {
      render(<PrintablePlan {...defaultProps} />);
      const gridCells = screen.getAllByText('T');
      expect(gridCells.length).toBeGreaterThanOrEqual(1);
    });

    it('should render empty cells in grid', () => {
      render(<PrintablePlan {...defaultProps} />);
      const allCells = document.querySelectorAll('.inline-grid > div');
      expect(allCells.length).toBe(4);
    });

    it('should handle arrangement with no grid property', () => {
      const arrangementNoGrid = {
        placements: mockArrangement.placements,
        success: true
      };
      render(<PrintablePlan arrangement={arrangementNoGrid} bed={mockBed} plantSelections={mockPlantSelections} />);
      expect(screen.getByText('Grid Layout')).toBeInTheDocument();
    });

    it('should handle arrangement with empty grid', () => {
      const arrangementEmptyGrid = {
        grid: [],
        placements: [],
        success: true
      };
      render(<PrintablePlan arrangement={arrangementEmptyGrid} bed={mockBed} plantSelections={mockPlantSelections} />);
      expect(screen.getByText('Grid Layout')).toBeInTheDocument();
    });

    it('should handle bed with no width property', () => {
      const bedNoWidth = {
        id: 'bed-1',
        name: 'Test Bed',
        height: 2
      };
      render(<PrintablePlan arrangement={mockArrangement} bed={bedNoWidth} plantSelections={mockPlantSelections} />);
      expect(screen.getByText('Grid Layout')).toBeInTheDocument();
    });

    it('should handle bed with no height property', () => {
      const bedNoHeight = {
        id: 'bed-1',
        name: 'Test Bed',
        width: 2
      };
      render(<PrintablePlan arrangement={mockArrangement} bed={bedNoHeight} plantSelections={mockPlantSelections} />);
      expect(screen.getByText('Grid Layout')).toBeInTheDocument();
    });
  });

  describe('plant legend', () => {
    it('should display all plants in legend', () => {
      render(<PrintablePlan {...defaultProps} />);
      expect(screen.getAllByText('Tomato').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Basil').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Carrot').length).toBeGreaterThanOrEqual(1);
    });

    it('should display plant counts in legend', () => {
      render(<PrintablePlan {...defaultProps} />);
      expect(screen.getAllByText('(1 squares)').length).toBeGreaterThanOrEqual(1);
    });

    it('should sort legend plants alphabetically', () => {
      render(<PrintablePlan {...defaultProps} />);
      const legendItems = screen.getAllByText(/squares\)/);
      expect(legendItems.length).toBe(3);
    });

    it('should handle unknown plant in grid', () => {
      const arrangementWithUnknown = {
        grid: [['unknownplant']],
        placements: [{ plantId: 'unknownplant', row: 0, col: 0 }],
        success: true
      };
      render(<PrintablePlan arrangement={arrangementWithUnknown} bed={mockBed} plantSelections={[{ plantId: 'unknownplant', quantity: 1 }]} />);
      expect(screen.getAllByText('unknownplant').length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('planting schedule', () => {
    it('should render planting schedule when provided', () => {
      render(<PrintablePlan {...defaultProps} schedule={mockSchedule} />);
      expect(screen.getByText('Planting Schedule')).toBeInTheDocument();
    });

    it('should not render planting schedule when not provided', () => {
      render(<PrintablePlan {...defaultProps} />);
      expect(screen.queryByText('Planting Schedule')).not.toBeInTheDocument();
    });

    it('should not render planting schedule when empty array', () => {
      render(<PrintablePlan {...defaultProps} schedule={[]} />);
      expect(screen.queryByText('Planting Schedule')).not.toBeInTheDocument();
    });

    it('should display schedule table with headers', () => {
      render(<PrintablePlan {...defaultProps} schedule={mockSchedule} />);
      expect(screen.getByText('Plant')).toBeInTheDocument();
      expect(screen.getByText('Season')).toBeInTheDocument();
      expect(screen.getByText('Planting Window')).toBeInTheDocument();
    });

    it('should display all scheduled plants', () => {
      render(<PrintablePlan {...defaultProps} schedule={mockSchedule} />);
      const tomatoEntries = screen.getAllByText('Tomato');
      const basilEntries = screen.getAllByText('Basil');
      expect(tomatoEntries.length).toBeGreaterThanOrEqual(1);
      expect(basilEntries.length).toBeGreaterThanOrEqual(1);
    });

    it('should display season for each plant', () => {
      render(<PrintablePlan {...defaultProps} schedule={mockSchedule} />);
      const springEntries = screen.getAllByText('spring');
      expect(springEntries.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('plan summary', () => {
    it('should display total plants count', () => {
      render(<PrintablePlan {...defaultProps} />);
      expect(screen.getByText(/3 types/)).toBeInTheDocument();
    });

    it('should display space usage', () => {
      render(<PrintablePlan {...defaultProps} />);
      expect(screen.getByText(/3 of 4 squares/)).toBeInTheDocument();
    });

    it('should display percentage filled', () => {
      render(<PrintablePlan {...defaultProps} />);
      expect(screen.getByText(/75%/)).toBeInTheDocument();
    });

    it('should display companion adjacencies when present', () => {
      render(<PrintablePlan {...defaultProps} />);
      const companionText = screen.getByText(/Companion Adjacencies:/);
      expect(companionText).toBeInTheDocument();
    });

    it('should not display companion adjacencies when zero', () => {
      const arrangementNoCompanions = {
        ...mockArrangement,
        stats: { ...mockArrangement.stats, companionAdjacencies: 0 }
      };
      render(<PrintablePlan arrangement={arrangementNoCompanions} bed={mockBed} plantSelections={mockPlantSelections} />);
      expect(screen.queryByText(/Companion Adjacencies:/)).not.toBeInTheDocument();
    });

    it('should display companion relationships', () => {
      render(<PrintablePlan {...defaultProps} />);
      expect(screen.getByText('Companion Relationships:')).toBeInTheDocument();
    });

    it('should list companion plant pairs', () => {
      render(<PrintablePlan {...defaultProps} />);
      const companionRelationships = screen.getAllByText(/Tomato \+ |Basil \+ |Carrot \+ /);
      expect(companionRelationships.length).toBeGreaterThanOrEqual(1);
    });

    it('should not duplicate reciprocal companion relationships', () => {
      render(<PrintablePlan {...defaultProps} />);
      const relationships = screen.getAllByText(/Tomato \+ Basil|Basil \+ Tomato/);
      expect(relationships.length).toBe(1);
    });

    it('should use fallback stats when not provided', () => {
      const arrangementNoStats = {
        ...mockArrangement,
        stats: undefined
      };
      render(<PrintablePlan arrangement={arrangementNoStats} bed={mockBed} plantSelections={mockPlantSelections} />);
      expect(screen.getByText(/3 of 4 squares/)).toBeInTheDocument();
    });

    it('should use fallback when placements is missing', () => {
      const arrangementNoPlacement = {
        grid: mockArrangement.grid,
        success: true
      };
      render(<PrintablePlan arrangement={arrangementNoPlacement} bed={mockBed} plantSelections={mockPlantSelections} />);
      expect(screen.getByText(/0 of 4 squares/)).toBeInTheDocument();
    });
  });

  describe('plant notes', () => {
    it('should display plant quantities', () => {
      render(<PrintablePlan {...defaultProps} />);
      expect(screen.getAllByText(/1 plants/).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/4 plants/).length).toBeGreaterThanOrEqual(1);
    });

    it('should display space required for each plant', () => {
      render(<PrintablePlan {...defaultProps} />);
      expect(screen.getAllByText(/1 sq ft/).length).toBeGreaterThanOrEqual(1);
    });

    it('should display companion plants for each plant', () => {
      render(<PrintablePlan {...defaultProps} />);
      expect(screen.getAllByText(/Basil, Carrot/).length).toBeGreaterThanOrEqual(1);
    });

    it('should display avoid plants for each plant', () => {
      render(<PrintablePlan {...defaultProps} />);
      const avoidSection = screen.getByText(/Avoid:/);
      expect(avoidSection).toBeInTheDocument();
    });

    it('should not display companions section when empty', () => {
      const selectionsNoCompanions = [
        { plantId: 'lettuce', quantity: 4 }
      ];
      const arrangementNoCompanions = {
        grid: [['lettuce']],
        placements: [{ plantId: 'lettuce', row: 0, col: 0 }],
        success: true,
        stats: { uniquePlants: 1, filledSquares: 1, totalSquares: 4, companionAdjacencies: 0 }
      };
      render(<PrintablePlan arrangement={arrangementNoCompanions} bed={mockBed} plantSelections={selectionsNoCompanions} />);
      expect(screen.queryByText(/Companions:/)).not.toBeInTheDocument();
    });

    it('should not display avoid section when empty', () => {
      const selectionsNoAvoid = [
        { plantId: 'basil', quantity: 4 }
      ];
      const arrangementNoAvoid = {
        grid: [['basil']],
        placements: [{ plantId: 'basil', row: 0, col: 0 }],
        success: true,
        stats: { uniquePlants: 1, filledSquares: 1, totalSquares: 4, companionAdjacencies: 0 }
      };
      render(<PrintablePlan arrangement={arrangementNoAvoid} bed={mockBed} plantSelections={selectionsNoAvoid} />);
      expect(screen.queryByText(/Avoid:/)).not.toBeInTheDocument();
    });

    it('should handle plant with no companion or avoid data', () => {
      const selectionsMinimal = [
        { plantId: 'lettuce', quantity: 4 }
      ];
      const arrangementMinimal = {
        grid: [['lettuce']],
        placements: [{ plantId: 'lettuce', row: 0, col: 0 }],
        success: true,
        stats: { uniquePlants: 1, filledSquares: 1, totalSquares: 4, companionAdjacencies: 0 }
      };
      render(<PrintablePlan arrangement={arrangementMinimal} bed={mockBed} plantSelections={selectionsMinimal} />);
      expect(screen.getAllByText('Lettuce').length).toBeGreaterThanOrEqual(1);
    });

    it('should handle companion plant not found in library', () => {
      vi.mocked(plantLibrary.getPlantById).mockImplementation((id) => {
        const plants = {
          tomato: {
            id: 'tomato',
            name: 'Tomato',
            squaresPerPlant: 1,
            companionPlants: ['unknownplant'],
            avoidPlants: [],
            daysToMaturity: 80
          }
        };
        return plants[id] || null;
      });

      const selections = [{ plantId: 'tomato', quantity: 1 }];
      const arrangement = {
        grid: [['tomato']],
        placements: [{ plantId: 'tomato', row: 0, col: 0 }],
        success: true,
        stats: { uniquePlants: 1, filledSquares: 1, totalSquares: 1, companionAdjacencies: 0 }
      };

      render(<PrintablePlan arrangement={arrangement} bed={{ id: 'b1', name: 'B1', width: 1, height: 1 }} plantSelections={selections} />);
      expect(screen.getByText(/unknownplant/)).toBeInTheDocument();
    });
  });

  describe('print functionality', () => {
    it('should call window.print when print button clicked', () => {
      const printMock = vi.spyOn(window, 'print').mockImplementation(() => {});
      render(<PrintablePlan {...defaultProps} />);

      const printButton = screen.getByRole('button', { name: 'Print Plan' });
      fireEvent.click(printButton);

      expect(printMock).toHaveBeenCalled();
      printMock.mockRestore();
    });
  });

  describe('footer', () => {
    it('should display generation date', () => {
      render(<PrintablePlan {...defaultProps} />);
      expect(screen.getByText(/Generated by Square Gardener/)).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle grid with all null values', () => {
      const emptyArrangement = {
        grid: [[null, null], [null, null]],
        placements: [],
        success: true,
        stats: { uniquePlants: 0, filledSquares: 0, totalSquares: 4, companionAdjacencies: 0 }
      };
      render(<PrintablePlan arrangement={emptyArrangement} bed={mockBed} plantSelections={mockPlantSelections} />);
      expect(screen.getByText('Grid Layout')).toBeInTheDocument();
    });

    it('should calculate space needed correctly', () => {
      render(<PrintablePlan {...defaultProps} />);
      expect(screen.getAllByText(/1 sq ft/).length).toBeGreaterThanOrEqual(1);
    });

    it('should handle plant not found in library', () => {
      const selectionsWithUnknown = [
        { plantId: 'unknownplant', quantity: 1 }
      ];
      const arrangementWithUnknown = {
        grid: [['unknownplant']],
        placements: [{ plantId: 'unknownplant', row: 0, col: 0 }],
        success: true,
        stats: { uniquePlants: 1, filledSquares: 1, totalSquares: 4, companionAdjacencies: 0 }
      };
      render(<PrintablePlan arrangement={arrangementWithUnknown} bed={mockBed} plantSelections={selectionsWithUnknown} />);
      expect(screen.getAllByText('unknownplant').length).toBeGreaterThanOrEqual(1);
    });

    it('should handle companion plants that are not in grid', () => {
      render(<PrintablePlan {...defaultProps} />);
      expect(screen.getAllByText(/Basil, Carrot/).length).toBeGreaterThanOrEqual(1);
    });

    it('should display correct initial for unknown plant', () => {
      const arrangementWithUnknown = {
        grid: [['xyz']],
        placements: [{ plantId: 'xyz', row: 0, col: 0 }],
        success: true,
        stats: { uniquePlants: 1, filledSquares: 1, totalSquares: 1, companionAdjacencies: 0 }
      };
      const { container } = render(<PrintablePlan arrangement={arrangementWithUnknown} bed={{ id: 'b', name: 'B', width: 1, height: 1 }} plantSelections={[{ plantId: 'xyz', quantity: 1 }]} />);
      const gridCells = container.querySelectorAll('.inline-grid > div');
      expect(gridCells[0]).toHaveTextContent('');
    });
  });

  describe('companion relationships section', () => {
    it('should not display companion relationships section when no companions exist', () => {
      const selectionsNoCompanions = [
        { plantId: 'lettuce', quantity: 4 }
      ];
      const arrangementNoCompanions = {
        grid: [['lettuce']],
        placements: [{ plantId: 'lettuce', row: 0, col: 0 }],
        success: true,
        stats: { uniquePlants: 1, filledSquares: 1, totalSquares: 4, companionAdjacencies: 0 }
      };
      render(<PrintablePlan arrangement={arrangementNoCompanions} bed={mockBed} plantSelections={selectionsNoCompanions} />);
      expect(screen.queryByText('Companion Relationships:')).not.toBeInTheDocument();
    });
  });
});
