import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import MyGarden from './MyGarden';
import * as storage from '../utils/storage';
import * as plantLibraryModule from '../data/plantLibrary';

vi.mock('../utils/storage');

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

const mockGarlic = {
  id: 'garlic',
  name: 'Garlic',
  scientificName: 'Allium sativum',
  wateringFrequency: 4,
  squaresPerPlant: 0.11,
  daysToMaturity: 240,
  plantingSeason: ['fall'],
  sunRequirement: 'full',
  companionPlants: ['tomato'],
  avoidPlants: ['bean']
};

const renderMyGarden = () => {
  return render(
    <MemoryRouter>
      <MyGarden />
    </MemoryRouter>
  );
};

describe('MyGarden', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    storage.getGardenPlants.mockReturnValue([]);
    storage.addGardenPlant.mockImplementation((plantId) => ({
      id: `garden-${Date.now()}`,
      plantId,
      plantedDate: new Date().toISOString(),
      lastWatered: new Date().toISOString(),
      notes: ''
    }));
    storage.removeGardenPlant.mockImplementation(() => []);

    // Spy on the real plantLibrary module
    vi.spyOn(plantLibraryModule, 'getPlantById').mockImplementation((id) => {
      if (id === 'tomato') return mockTomato;
      if (id === 'lettuce') return mockLettuce;
      if (id === 'garlic') return mockGarlic;
      return undefined;
    });
  });

  describe('basic rendering', () => {
    it('renders page title', () => {
      renderMyGarden();
      expect(screen.getByText('My Garden')).toBeInTheDocument();
    });

    it('renders page subtitle', () => {
      renderMyGarden();
      expect(screen.getByText('Track your plants and their progress')).toBeInTheDocument();
    });
  });

  describe('empty garden state', () => {
    it('shows empty state message', () => {
      renderMyGarden();
      expect(screen.getByText('Your garden is empty')).toBeInTheDocument();
    });

    it('shows browse plant library button', () => {
      renderMyGarden();
      expect(screen.getByText('Browse Plant Library')).toBeInTheDocument();
    });

    it('shows add plant prompt', () => {
      renderMyGarden();
      expect(screen.getByText('Add your first plant to start tracking your garden!')).toBeInTheDocument();
    });
  });

  describe('with garden plants', () => {
    beforeEach(() => {
      storage.getGardenPlants.mockReturnValue([
        {
          id: 'garden-1',
          plantId: 'tomato',
          plantedDate: new Date().toISOString(),
          lastWatered: new Date().toISOString(),
          notes: ''
        },
        {
          id: 'garden-2',
          plantId: 'lettuce',
          plantedDate: new Date().toISOString(),
          lastWatered: new Date().toISOString(),
          notes: ''
        }
      ]);
    });

    it('displays plant count', () => {
      renderMyGarden();
      expect(screen.getByText('2 plants in your garden')).toBeInTheDocument();
    });

    it('displays single plant text correctly', () => {
      storage.getGardenPlants.mockReturnValue([
        {
          id: 'garden-1',
          plantId: 'tomato',
          plantedDate: new Date().toISOString(),
          lastWatered: new Date().toISOString(),
          notes: ''
        }
      ]);
      renderMyGarden();
      expect(screen.getByText('1 plant in your garden')).toBeInTheDocument();
    });

    it('shows add plant button', () => {
      renderMyGarden();
      expect(screen.getByText('+ Add Plant')).toBeInTheDocument();
    });

    it('opens library modal when add plant button clicked', () => {
      renderMyGarden();
      fireEvent.click(screen.getByText('+ Add Plant'));
      expect(screen.getByText('Plant Library')).toBeInTheDocument();
    });

    it('does not show empty state', () => {
      renderMyGarden();
      expect(screen.queryByText('Your garden is empty')).not.toBeInTheDocument();
    });
  });

  describe('plant library modal', () => {
    it('opens when browse button clicked', () => {
      renderMyGarden();
      fireEvent.click(screen.getByText('Browse Plant Library'));
      expect(screen.getByText('Plant Library')).toBeInTheDocument();
    });

    it('closes when X button clicked', () => {
      renderMyGarden();
      fireEvent.click(screen.getByText('Browse Plant Library'));
      fireEvent.click(screen.getByText('×'));
      expect(screen.queryByText('Choose plants to add to your garden')).not.toBeInTheDocument();
    });

    it('shows search input', () => {
      renderMyGarden();
      fireEvent.click(screen.getByText('Browse Plant Library'));
      expect(screen.getByPlaceholderText('Search plants...')).toBeInTheDocument();
    });

    it('shows season filter', () => {
      renderMyGarden();
      fireEvent.click(screen.getByText('Browse Plant Library'));
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
  });

  describe('search and filter', () => {
    it('filters plants by search term', () => {
      renderMyGarden();
      fireEvent.click(screen.getByText('Browse Plant Library'));

      const searchInput = screen.getByPlaceholderText('Search plants...');
      fireEvent.change(searchInput, { target: { value: 'tomato' } });

      // Should show tomato
      expect(screen.getByText('Tomato')).toBeInTheDocument();
    });

    it('filters by scientific name', () => {
      renderMyGarden();
      fireEvent.click(screen.getByText('Browse Plant Library'));

      const searchInput = screen.getByPlaceholderText('Search plants...');
      fireEvent.change(searchInput, { target: { value: 'Solanum' } });

      // Should show tomato (Solanum lycopersicum)
      expect(screen.getByText('Tomato')).toBeInTheDocument();
    });

    it('filters plants by season', () => {
      renderMyGarden();
      fireEvent.click(screen.getByText('Browse Plant Library'));

      const seasonSelect = screen.getByRole('combobox');
      fireEvent.change(seasonSelect, { target: { value: 'summer' } });

      // Only summer plants should remain visible
      expect(screen.getByText('Tomato')).toBeInTheDocument();
    });

    it('shows no results message when no matches', () => {
      renderMyGarden();
      fireEvent.click(screen.getByText('Browse Plant Library'));

      const searchInput = screen.getByPlaceholderText('Search plants...');
      fireEvent.change(searchInput, { target: { value: 'xyz-not-found' } });

      expect(screen.getByText('No plants found matching your criteria')).toBeInTheDocument();
    });
  });

  describe('adding plants', () => {
    it('adds plant when add button clicked', async () => {
      storage.getGardenPlants
        .mockReturnValueOnce([]) // Initial load
        .mockReturnValueOnce([
          {
            id: 'garden-new',
            plantId: 'tomato',
            plantedDate: new Date().toISOString(),
            lastWatered: new Date().toISOString(),
            notes: ''
          }
        ]); // After add

      renderMyGarden();
      fireEvent.click(screen.getByText('Browse Plant Library'));

      // Find and click the first Add to Garden button
      const addButtons = screen.getAllByText('+ Add to Garden');
      fireEvent.click(addButtons[0]);

      expect(storage.addGardenPlant).toHaveBeenCalled();
    });

    it('closes modal after adding plant', async () => {
      storage.getGardenPlants
        .mockReturnValueOnce([])
        .mockReturnValueOnce([
          {
            id: 'garden-new',
            plantId: 'tomato',
            plantedDate: new Date().toISOString(),
            lastWatered: new Date().toISOString(),
            notes: ''
          }
        ]);

      renderMyGarden();
      fireEvent.click(screen.getByText('Browse Plant Library'));

      const addButtons = screen.getAllByText('+ Add to Garden');
      fireEvent.click(addButtons[0]);

      await waitFor(() => {
        expect(screen.queryByText('Choose plants to add to your garden')).not.toBeInTheDocument();
      });
    });
  });

  describe('removing plants', () => {
    beforeEach(() => {
      storage.getGardenPlants.mockReturnValue([
        {
          id: 'garden-1',
          plantId: 'tomato',
          plantedDate: new Date().toISOString(),
          lastWatered: new Date().toISOString(),
          notes: ''
        }
      ]);
    });

    it('calls removeGardenPlant when confirmed', () => {
      // Mock window.confirm
      vi.spyOn(window, 'confirm').mockReturnValue(true);

      renderMyGarden();
      fireEvent.click(screen.getByText('Remove from Garden'));

      expect(storage.removeGardenPlant).toHaveBeenCalledWith('garden-1');
    });

    it('does not remove when cancelled', () => {
      vi.spyOn(window, 'confirm').mockReturnValue(false);

      renderMyGarden();
      fireEvent.click(screen.getByText('Remove from Garden'));

      expect(storage.removeGardenPlant).not.toHaveBeenCalled();
    });
  });

  describe('unknown plants', () => {
    it('handles unknown plant ids gracefully', () => {
      storage.getGardenPlants.mockReturnValue([
        {
          id: 'garden-1',
          plantId: 'unknown-plant',
          plantedDate: new Date().toISOString(),
          lastWatered: new Date().toISOString(),
          notes: ''
        }
      ]);
      plantLibraryModule.getPlantById.mockReturnValue(undefined);

      renderMyGarden();
      // Should not crash, and unknown plant should not be rendered
      expect(screen.getByText('1 plant in your garden')).toBeInTheDocument();
    });
  });
});
