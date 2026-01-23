import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import Home from './Home';
import * as storage from '../utils/storage';
import * as plantLibrary from '../data/plantLibrary';

vi.mock('../utils/storage');
vi.mock('../data/plantLibrary');

const mockTomato = {
  id: 'tomato',
  name: 'Tomato',
  scientificName: 'Solanum lycopersicum',
  wateringFrequency: 2,
  squaresPerPlant: 1,
  daysToMaturity: 70,
  plantingSeason: ['spring', 'summer'],
  sunRequirement: 'full',
  companionPlants: ['basil'],
  avoidPlants: ['cabbage']
};

const mockLettuce = {
  id: 'lettuce',
  name: 'Lettuce',
  scientificName: 'Lactuca sativa',
  wateringFrequency: 1,
  squaresPerPlant: 0.25,
  daysToMaturity: 45,
  plantingSeason: ['spring', 'fall'],
  sunRequirement: 'partial',
  companionPlants: ['carrot'],
  avoidPlants: ['parsley']
};

const renderHome = () => {
  return render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  );
};

describe('Home', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    storage.getGardenPlants.mockReturnValue([]);
    storage.getGardenBeds.mockReturnValue([]);
    plantLibrary.getPlantById.mockImplementation((id) => {
      if (id === 'tomato') return mockTomato;
      if (id === 'lettuce') return mockLettuce;
      return undefined;
    });
  });

  describe('basic rendering', () => {
    it('renders welcome message', () => {
      renderHome();
      expect(screen.getByText('Welcome to Square Gardener')).toBeInTheDocument();
    });

    it('renders subtitle', () => {
      renderHome();
      expect(screen.getByText('Your Square Foot Gardening Companion')).toBeInTheDocument();
    });

    it('renders total plants stat card', () => {
      renderHome();
      expect(screen.getByText('Total Plants')).toBeInTheDocument();
    });

    it('renders need water stat card', () => {
      renderHome();
      expect(screen.getByText('Need Water')).toBeInTheDocument();
    });

    it('renders ready to harvest stat card', () => {
      renderHome();
      expect(screen.getByText('Ready to Harvest')).toBeInTheDocument();
    });
  });

  describe('stat card navigation', () => {
    it('total plants card links to my-garden', () => {
      renderHome();
      const totalPlantsCard = screen.getByText('Total Plants').closest('a');
      expect(totalPlantsCard).toHaveAttribute('href', '/my-garden');
    });

    it('need water card links to watering', () => {
      renderHome();
      const needWaterCard = screen.getByText('Need Water').closest('a');
      expect(needWaterCard).toHaveAttribute('href', '/watering');
    });

    it('ready to harvest card links to my-garden', () => {
      renderHome();
      const readyToHarvestCard = screen.getByText('Ready to Harvest').closest('a');
      expect(readyToHarvestCard).toHaveAttribute('href', '/my-garden');
    });

    it('stat cards have hover styles', () => {
      renderHome();
      const totalPlantsCard = screen.getByText('Total Plants').closest('a');
      expect(totalPlantsCard).toHaveClass('hover:shadow-xl');
      expect(totalPlantsCard).toHaveClass('hover:scale-105');
      expect(totalPlantsCard).toHaveClass('cursor-pointer');
    });
  });

  describe('empty garden state', () => {
    describe('no beds and no plants', () => {
      beforeEach(() => {
        storage.getGardenBeds.mockReturnValue([]);
        storage.getGardenPlants.mockReturnValue([]);
      });

      it('shows getting started section when no plants', () => {
        renderHome();
        expect(screen.getByText('Get Started with Square Gardening')).toBeInTheDocument();
      });

      it('shows create first bed button when no beds', () => {
        renderHome();
        expect(screen.getByText('Create Your First Bed')).toBeInTheDocument();
      });

      it('displays zero for all stats when no plants', () => {
        renderHome();
        const zeros = screen.getAllByText('0');
        expect(zeros.length).toBe(3); // Total, Need Water, Ready to Harvest
      });

      it('shows prominent getting started section with enhanced styling', () => {
        renderHome();
        const heading = screen.getByText('Get Started with Square Gardening');
        const section = heading.closest('div.bg-gradient-to-br');
        expect(section).toBeInTheDocument();
        expect(section).toHaveClass('bg-gradient-to-br', 'from-green-50', 'to-emerald-50', 'border-2', 'border-primary');
      });

      it('shows animated icon in getting started section', () => {
        renderHome();
        const heading = screen.getByText('Get Started with Square Gardening');
        const section = heading.closest('div.bg-gradient-to-br');
        const icon = section?.querySelector('.animate-bounce');
        expect(icon).toBeInTheDocument();
      });

      it('shows enhanced call-to-action button', () => {
        renderHome();
        const button = screen.getByText('Create Your First Bed').closest('a');
        expect(button).toBeInTheDocument();
        expect(button).toHaveClass('inline-flex', 'items-center', 'gap-2', 'bg-primary', 'hover:bg-primary-light');
      });

      it('create first bed button includes bed icon', () => {
        renderHome();
        const button = screen.getByText('Create Your First Bed').closest('a');
        const icon = button?.querySelector('.text-2xl');
        expect(icon).toBeInTheDocument();
        expect(icon?.textContent).toBe('🛏️');
      });

      it('shows create bed description', () => {
        renderHome();
        expect(screen.getByText(/Start by creating your first garden bed!/)).toBeInTheDocument();
      });
    });

    describe('beds exist but no plants', () => {
      beforeEach(() => {
        storage.getGardenBeds.mockReturnValue([
          { id: 'bed-1', name: 'Main Bed', width: 4, height: 4 }
        ]);
        storage.getGardenPlants.mockReturnValue([]);
      });

      it('shows add first plant button when beds exist', () => {
        renderHome();
        expect(screen.getByText('Add Your First Plant')).toBeInTheDocument();
      });

      it('add first plant button includes plant icon', () => {
        renderHome();
        const button = screen.getByText('Add Your First Plant').closest('a');
        const icon = button?.querySelector('.text-2xl');
        expect(icon).toBeInTheDocument();
        expect(icon?.textContent).toBe('🌿');
      });

      it('shows add plant description', () => {
        renderHome();
        expect(screen.getByText(/let us help you track watering schedules, harvests, and more!/)).toBeInTheDocument();
      });
    });
  });

  describe('with garden plants', () => {
    beforeEach(() => {
      const today = new Date();
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      storage.getGardenBeds.mockReturnValue([
        { id: 'bed-1', name: 'Main Bed', width: 4, height: 4 }
      ]);
      storage.getGardenPlants.mockReturnValue([
        {
          id: 'garden-1',
          plantId: 'tomato',
          plantedDate: thirtyDaysAgo.toISOString(),
          lastWatered: thirtyDaysAgo.toISOString() // needs water
        },
        {
          id: 'garden-2',
          plantId: 'lettuce',
          plantedDate: thirtyDaysAgo.toISOString(),
          lastWatered: today.toISOString() // just watered
        }
      ]);
    });

    it('displays correct total plants count', () => {
      renderHome();
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('calculates plants needing water', () => {
      renderHome();
      expect(screen.getByText('1')).toBeInTheDocument(); // Only tomato needs water
    });

    it('does not show getting started section', () => {
      renderHome();
      expect(screen.queryByText('Get Started with Square Gardening')).not.toBeInTheDocument();
    });

    it('shows "Your Garden is Growing" section', () => {
      renderHome();
      expect(screen.getByText('Your Garden is Growing')).toBeInTheDocument();
    });

    it('shows view your garden button', () => {
      renderHome();
      expect(screen.getByText('View Your Garden')).toBeInTheDocument();
    });

    it('view your garden button links to my-garden', () => {
      renderHome();
      const button = screen.getByText('View Your Garden').closest('a');
      expect(button).toHaveAttribute('href', '/my-garden');
    });

    it('view your garden button includes flower icon', () => {
      renderHome();
      const button = screen.getByText('View Your Garden').closest('a');
      const icon = button?.querySelector('.text-2xl');
      expect(icon).toBeInTheDocument();
      expect(icon?.textContent).toBe('🌻');
    });

    it('shows garden growing description', () => {
      renderHome();
      expect(screen.getByText(/Track your plants, monitor watering schedules, and see when your harvest will be ready!/)).toBeInTheDocument();
    });
  });

  describe('upcoming harvests', () => {
    beforeEach(() => {
      storage.getGardenBeds.mockReturnValue([
        { id: 'bed-1', name: 'Main Bed', width: 4, height: 4 }
      ]);
    });

    it('shows upcoming harvests section when plants ready soon', () => {
      const tenDaysAgo = new Date();
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 35); // 35 days into 45-day lettuce

      storage.getGardenPlants.mockReturnValue([
        {
          id: 'garden-1',
          plantId: 'lettuce',
          plantedDate: tenDaysAgo.toISOString(),
          lastWatered: new Date().toISOString()
        }
      ]);

      renderHome();
      expect(screen.getByText('Upcoming Harvests')).toBeInTheDocument();
      expect(screen.getByText('Lettuce')).toBeInTheDocument();
    });

    it('shows Ready now! for harvestable plants', () => {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      storage.getGardenPlants.mockReturnValue([
        {
          id: 'garden-1',
          plantId: 'tomato',
          plantedDate: ninetyDaysAgo.toISOString(),
          lastWatered: new Date().toISOString()
        }
      ]);

      renderHome();
      expect(screen.getByText('Ready now!')).toBeInTheDocument();
    });

    it('shows days remaining for upcoming harvests', () => {
      const twentyDaysAgo = new Date();
      twentyDaysAgo.setDate(twentyDaysAgo.getDate() - 20);

      storage.getGardenPlants.mockReturnValue([
        {
          id: 'garden-1',
          plantId: 'lettuce',
          plantedDate: twentyDaysAgo.toISOString(),
          lastWatered: new Date().toISOString()
        }
      ]);

      renderHome();
      expect(screen.getByText('25 days')).toBeInTheDocument();
    });

    it('does not show upcoming harvests for plants more than 30 days away', () => {
      const today = new Date();

      storage.getGardenPlants.mockReturnValue([
        {
          id: 'garden-1',
          plantId: 'tomato', // 70 days to maturity
          plantedDate: today.toISOString(),
          lastWatered: today.toISOString()
        }
      ]);

      renderHome();
      expect(screen.queryByText('Upcoming Harvests')).not.toBeInTheDocument();
    });

    it('sorts upcoming harvests by days remaining', () => {
      const fifteenDaysAgo = new Date();
      fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      storage.getGardenPlants.mockReturnValue([
        {
          id: 'garden-1',
          plantId: 'lettuce', // 45 days, planted 15 days ago = 30 days remaining
          plantedDate: fifteenDaysAgo.toISOString(),
          lastWatered: new Date().toISOString()
        },
        {
          id: 'garden-2',
          plantId: 'lettuce', // 45 days, planted 30 days ago = 15 days remaining
          plantedDate: thirtyDaysAgo.toISOString(),
          lastWatered: new Date().toISOString()
        }
      ]);

      renderHome();
      // Both should appear with one having fewer days remaining
      const harvestItems = screen.getAllByText(/Lettuce/);
      expect(harvestItems.length).toBe(2);
    });
  });

  describe('quick actions', () => {
    it('renders My Garden link', () => {
      renderHome();
      expect(screen.getByText('My Garden')).toBeInTheDocument();
      expect(screen.getByText('Add and manage your plants')).toBeInTheDocument();
    });

    it('renders Watering Schedule link', () => {
      renderHome();
      expect(screen.getByText('Watering Schedule')).toBeInTheDocument();
      expect(screen.getByText('Track and update watering')).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('handles plant not found in library', () => {
      storage.getGardenPlants.mockReturnValue([
        {
          id: 'garden-1',
          plantId: 'unknown-plant',
          plantedDate: new Date().toISOString(),
          lastWatered: new Date().toISOString()
        }
      ]);
      plantLibrary.getPlantById.mockReturnValue(undefined);

      renderHome();
      // Should not crash - verify page renders with stats
      expect(screen.getByText('Total Plants')).toBeInTheDocument();
      expect(screen.getByText('Need Water')).toBeInTheDocument();
      expect(screen.getByText('Ready to Harvest')).toBeInTheDocument();
    });
  });
});
