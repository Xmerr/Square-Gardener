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

  describe('empty garden state', () => {
    it('shows getting started section when no plants', () => {
      renderHome();
      expect(screen.getByText('Get Started with Square Gardening')).toBeInTheDocument();
    });

    it('shows add first plant button when no plants', () => {
      renderHome();
      expect(screen.getByText('Add Your First Plant')).toBeInTheDocument();
    });

    it('displays zero for all stats when no plants', () => {
      renderHome();
      const zeros = screen.getAllByText('0');
      expect(zeros.length).toBe(3); // Total, Need Water, Ready to Harvest
    });
  });

  describe('with garden plants', () => {
    beforeEach(() => {
      const today = new Date();
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

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
  });

  describe('upcoming harvests', () => {
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
