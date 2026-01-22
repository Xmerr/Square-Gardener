import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import MyGarden from './MyGarden';
import * as storage from '../utils/storage';
import * as plantLibraryModule from '../data/plantLibrary';
import * as dateFormatting from '../utils/dateFormatting';

vi.mock('../utils/storage');

// Mock getCurrentSeason to return 'spring' for consistent testing
vi.spyOn(dateFormatting, 'getCurrentSeason').mockReturnValue('spring');

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

const mockBed = {
  id: 'bed-1',
  name: 'Main Garden',
  width: 4,
  height: 4,
  order: 0
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
    storage.getGardenBeds.mockReturnValue([]);
    storage.getBedCapacity.mockReturnValue({ total: 16, used: 0, available: 16, isOvercapacity: false });
    storage.addGardenPlant.mockImplementation((plantId, bedId, quantity) => ({
      id: `garden-${Date.now()}`,
      plantId,
      bedId,
      quantity,
      plantedDate: new Date().toISOString(),
      lastWatered: new Date().toISOString(),
      notes: ''
    }));
    storage.addGardenBed.mockImplementation((name, width, height, options = {}) => ({
      id: `bed-${Date.now()}`,
      name,
      width,
      height,
      is_pot: options.is_pot || false,
      size: options.size,
      order: 0
    }));
    storage.removeGardenPlant.mockImplementation(() => []);

    vi.spyOn(plantLibraryModule, 'getPlantById').mockImplementation((id) => {
      if (id === 'tomato') return mockTomato;
      if (id === 'lettuce') return mockLettuce;
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

    it('shows tab navigation', () => {
      renderMyGarden();
      expect(screen.getByText('Plants')).toBeInTheDocument();
      expect(screen.getByText('Manage Beds')).toBeInTheDocument();
    });
  });

  describe('empty garden state', () => {
    it('shows empty state message', () => {
      renderMyGarden();
      expect(screen.getByText('Your garden is empty')).toBeInTheDocument();
    });

    it('shows create first bed message when no beds exist', () => {
      renderMyGarden();
      expect(screen.getByText('Create a garden bed first, then add plants!')).toBeInTheDocument();
    });

    it('shows create first bed button when no beds exist', () => {
      renderMyGarden();
      expect(screen.getByText('Create Your First Bed')).toBeInTheDocument();
    });

    it('shows browse library message when beds exist', () => {
      storage.getGardenBeds.mockReturnValue([mockBed]);
      renderMyGarden();
      expect(screen.getByText('Add your first plant to start tracking your garden!')).toBeInTheDocument();
    });

    it('shows browse plant library button when beds exist', () => {
      storage.getGardenBeds.mockReturnValue([mockBed]);
      renderMyGarden();
      expect(screen.getByText('Browse Plant Library')).toBeInTheDocument();
    });
  });

  describe('bed creation flow', () => {
    it('opens bed form when create first bed clicked', () => {
      renderMyGarden();
      fireEvent.click(screen.getByText('Create Your First Bed'));
      expect(screen.getByText('Create New Bed')).toBeInTheDocument();
    });

    it('creates bed and closes form', () => {
      renderMyGarden();
      fireEvent.click(screen.getByText('Create Your First Bed'));

      fireEvent.change(screen.getByLabelText('Bed Name'), { target: { value: 'Test Bed' } });
      fireEvent.change(screen.getByLabelText('Width (ft)'), { target: { value: '4' } });
      fireEvent.change(screen.getByLabelText('Height (ft)'), { target: { value: '4' } });
      fireEvent.click(screen.getByText('Create Bed'));

      expect(storage.addGardenBed).toHaveBeenCalledWith('Test Bed', 4, 4, { is_pot: false });
    });

    it('creates pot and closes form', () => {
      renderMyGarden();
      fireEvent.click(screen.getByText('Create Your First Bed'));

      fireEvent.change(screen.getByLabelText('Bed Name'), { target: { value: 'Test Pot' } });
      fireEvent.click(screen.getByLabelText('This is a pot'));
      fireEvent.change(screen.getByLabelText('Size'), { target: { value: 'large' } });
      fireEvent.click(screen.getByText('Create Pot'));

      expect(storage.addGardenBed).toHaveBeenCalledWith('Test Pot', null, null, { is_pot: true, size: 'large' });
    });

    it('closes bed form when cancelled', () => {
      renderMyGarden();
      fireEvent.click(screen.getByText('Create Your First Bed'));
      fireEvent.click(screen.getByText('Cancel'));
      expect(screen.queryByText('Create New Bed')).not.toBeInTheDocument();
    });
  });

  describe('tab navigation', () => {
    it('shows plants tab by default', () => {
      renderMyGarden();
      expect(screen.getByText('Your garden is empty')).toBeInTheDocument();
    });

    it('switches to beds tab when clicked', () => {
      renderMyGarden();
      fireEvent.click(screen.getByText('Manage Beds'));
      expect(screen.getByText('Garden Beds')).toBeInTheDocument();
    });

    it('switches back to plants tab', () => {
      renderMyGarden();
      fireEvent.click(screen.getByText('Manage Beds'));
      fireEvent.click(screen.getByText('Plants'));
      expect(screen.getByText('Your garden is empty')).toBeInTheDocument();
    });
  });

  describe('with garden plants', () => {
    beforeEach(() => {
      storage.getGardenBeds.mockReturnValue([mockBed]);
      storage.getGardenPlants.mockReturnValue([
        {
          id: 'garden-1',
          plantId: 'tomato',
          bedId: 'bed-1',
          quantity: 1,
          plantedDate: new Date().toISOString(),
          lastWatered: new Date().toISOString(),
          notes: ''
        },
        {
          id: 'garden-2',
          plantId: 'lettuce',
          bedId: 'bed-1',
          quantity: 4,
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
          bedId: 'bed-1',
          quantity: 1,
          plantedDate: new Date().toISOString(),
          lastWatered: new Date().toISOString(),
          notes: ''
        }
      ]);
      renderMyGarden();
      expect(screen.getByText('1 plant in your garden')).toBeInTheDocument();
    });

    it('groups plants by bed', () => {
      renderMyGarden();
      expect(screen.getByText('Main Garden')).toBeInTheDocument();
    });

    it('shows bed capacity', () => {
      renderMyGarden();
      expect(screen.getByText('0/16 sq ft')).toBeInTheDocument();
    });

    it('shows overcrowded indicator when overcapacity', () => {
      storage.getBedCapacity.mockReturnValue({ total: 16, used: 20, available: -4, isOvercapacity: true });
      renderMyGarden();
      expect(screen.getByText('Overcrowded')).toBeInTheDocument();
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

  describe('legacy plants without beds', () => {
    beforeEach(() => {
      storage.getGardenBeds.mockReturnValue([mockBed]);
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

    it('shows unassigned plants section', () => {
      renderMyGarden();
      expect(screen.getByText('Unassigned Plants')).toBeInTheDocument();
    });

    it('handles unknown plant in unassigned plants gracefully', () => {
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
      expect(screen.getByText('Unassigned Plants')).toBeInTheDocument();
    });
  });

  describe('plant library modal', () => {
    beforeEach(() => {
      storage.getGardenBeds.mockReturnValue([mockBed]);
    });

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

    it('closes when clicking outside the modal', () => {
      renderMyGarden();
      fireEvent.click(screen.getByText('Browse Plant Library'));

      // Click the backdrop (parent div)
      const backdrop = screen.getByText('Plant Library').closest('.fixed');
      fireEvent.click(backdrop);

      expect(screen.queryByText('Choose plants to add to your garden')).not.toBeInTheDocument();
    });

    it('does not close when clicking inside the modal content', () => {
      renderMyGarden();
      fireEvent.click(screen.getByText('Browse Plant Library'));

      // Click inside the modal content
      const modalContent = screen.getByText('Plant Library');
      fireEvent.click(modalContent);

      expect(screen.getByText('Choose plants to add to your garden')).toBeInTheDocument();
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
    beforeEach(() => {
      storage.getGardenBeds.mockReturnValue([mockBed]);
    });

    it('filters plants by search term', () => {
      renderMyGarden();
      fireEvent.click(screen.getByText('Browse Plant Library'));

      // Set season filter to 'all' to see all plants
      const seasonSelect = screen.getByRole('combobox');
      fireEvent.change(seasonSelect, { target: { value: 'all' } });

      const searchInput = screen.getByPlaceholderText('Search plants...');
      fireEvent.change(searchInput, { target: { value: 'tomato' } });

      expect(screen.getByText('Tomato')).toBeInTheDocument();
    });

    it('filters by scientific name', () => {
      renderMyGarden();
      fireEvent.click(screen.getByText('Browse Plant Library'));

      // Set season filter to 'all' to see all plants
      const seasonSelect = screen.getByRole('combobox');
      fireEvent.change(seasonSelect, { target: { value: 'all' } });

      const searchInput = screen.getByPlaceholderText('Search plants...');
      fireEvent.change(searchInput, { target: { value: 'Solanum' } });

      expect(screen.getByText('Tomato')).toBeInTheDocument();
    });

    it('filters plants by season', () => {
      renderMyGarden();
      fireEvent.click(screen.getByText('Browse Plant Library'));

      const seasonSelect = screen.getByRole('combobox');
      fireEvent.change(seasonSelect, { target: { value: 'summer' } });

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

  describe('adding plants flow', () => {
    beforeEach(() => {
      storage.getGardenBeds.mockReturnValue([mockBed]);
    });

    it('shows bed selection after selecting plant', () => {
      renderMyGarden();
      fireEvent.click(screen.getByText('Browse Plant Library'));

      // Set season filter to 'all' to see all plants
      const seasonSelect = screen.getByRole('combobox');
      fireEvent.change(seasonSelect, { target: { value: 'all' } });

      const addButtons = screen.getAllByText('+ Add to Garden');
      fireEvent.click(addButtons[0]);

      expect(screen.getByText('Select Bed & Quantity')).toBeInTheDocument();
    });

    it('shows quantity input', () => {
      renderMyGarden();
      fireEvent.click(screen.getByText('Browse Plant Library'));

      // Set season filter to 'all' to see all plants
      const seasonSelect = screen.getByRole('combobox');
      fireEvent.change(seasonSelect, { target: { value: 'all' } });

      const addButtons = screen.getAllByText('+ Add to Garden');
      fireEvent.click(addButtons[0]);

      expect(screen.getByText('Quantity')).toBeInTheDocument();
    });

    it('auto-selects bed when only one exists', () => {
      renderMyGarden();
      fireEvent.click(screen.getByText('Browse Plant Library'));

      // Set season filter to 'all' to see all plants
      const seasonSelect = screen.getByRole('combobox');
      fireEvent.change(seasonSelect, { target: { value: 'all' } });

      const addButtons = screen.getAllByText('+ Add to Garden');
      fireEvent.click(addButtons[0]);

      expect(screen.getByText('Add to Garden')).toBeEnabled();
    });

    it('adds plant with bed and quantity', async () => {
      storage.getGardenPlants
        .mockReturnValueOnce([])
        .mockReturnValueOnce([
          {
            id: 'garden-new',
            plantId: 'tomato',
            bedId: 'bed-1',
            quantity: 2,
            plantedDate: new Date().toISOString(),
            lastWatered: new Date().toISOString(),
            notes: ''
          }
        ]);

      renderMyGarden();
      fireEvent.click(screen.getByText('Browse Plant Library'));

      // Set season filter to 'all' to see all plants
      const seasonSelect = screen.getByRole('combobox');
      fireEvent.change(seasonSelect, { target: { value: 'all' } });

      const addButtons = screen.getAllByText('+ Add to Garden');
      fireEvent.click(addButtons[0]);

      const quantityInput = screen.getByRole('spinbutton');
      fireEvent.change(quantityInput, { target: { value: '2' } });

      fireEvent.click(screen.getByText('Add to Garden'));

      expect(storage.addGardenPlant).toHaveBeenCalledWith('tomato', 'bed-1', 2);
    });

    it('can go back from bed selection', () => {
      renderMyGarden();
      fireEvent.click(screen.getByText('Browse Plant Library'));

      // Set season filter to 'all' to see all plants
      const seasonSelect = screen.getByRole('combobox');
      fireEvent.change(seasonSelect, { target: { value: 'all' } });

      const addButtons = screen.getAllByText('+ Add to Garden');
      fireEvent.click(addButtons[0]);

      fireEvent.click(screen.getByText('Back'));

      expect(screen.getByText('Choose plants to add to your garden')).toBeInTheDocument();
    });

    it('closes modal after adding plant', async () => {
      storage.getGardenPlants
        .mockReturnValueOnce([])
        .mockReturnValueOnce([
          {
            id: 'garden-new',
            plantId: 'tomato',
            bedId: 'bed-1',
            quantity: 1,
            plantedDate: new Date().toISOString(),
            lastWatered: new Date().toISOString(),
            notes: ''
          }
        ]);

      renderMyGarden();
      fireEvent.click(screen.getByText('Browse Plant Library'));

      // Set season filter to 'all' to see all plants
      const seasonSelect = screen.getByRole('combobox');
      fireEvent.change(seasonSelect, { target: { value: 'all' } });

      const addButtons = screen.getAllByText('+ Add to Garden');
      fireEvent.click(addButtons[0]);
      fireEvent.click(screen.getByText('Add to Garden'));

      await waitFor(() => {
        expect(screen.queryByText('Select Bed & Quantity')).not.toBeInTheDocument();
      });
    });

    it('does not add plant without bed selection', () => {
      storage.getGardenBeds.mockReturnValue([mockBed, { ...mockBed, id: 'bed-2', name: 'Second Bed' }]);

      renderMyGarden();
      fireEvent.click(screen.getByText('Browse Plant Library'));

      // Set season filter to 'all' to see all plants
      const seasonSelect = screen.getByRole('combobox');
      fireEvent.change(seasonSelect, { target: { value: 'all' } });

      const addButtons = screen.getAllByText('+ Add to Garden');
      fireEvent.click(addButtons[0]);

      const addToGardenButton = screen.getByText('Add to Garden');
      expect(addToGardenButton).toBeDisabled();
    });

    it('handles invalid quantity input', () => {
      renderMyGarden();
      fireEvent.click(screen.getByText('Browse Plant Library'));

      // Set season filter to 'all' to see all plants
      const seasonSelect = screen.getByRole('combobox');
      fireEvent.change(seasonSelect, { target: { value: 'all' } });

      const addButtons = screen.getAllByText('+ Add to Garden');
      fireEvent.click(addButtons[0]);

      const quantityInput = screen.getByRole('spinbutton');
      fireEvent.change(quantityInput, { target: { value: 'abc' } });

      expect(quantityInput).toHaveValue(1);
    });
  });

  describe('removing plants', () => {
    beforeEach(() => {
      storage.getGardenBeds.mockReturnValue([mockBed]);
      storage.getGardenPlants.mockReturnValue([
        {
          id: 'garden-1',
          plantId: 'tomato',
          bedId: 'bed-1',
          quantity: 1,
          plantedDate: new Date().toISOString(),
          lastWatered: new Date().toISOString(),
          notes: ''
        }
      ]);
    });

    it('calls removeGardenPlant when confirmed', () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true);

      renderMyGarden();
      fireEvent.click(screen.getByText('Remove'));

      expect(storage.removeGardenPlant).toHaveBeenCalledWith('garden-1');
    });

    it('does not remove when cancelled', () => {
      vi.spyOn(window, 'confirm').mockReturnValue(false);

      renderMyGarden();
      fireEvent.click(screen.getByText('Remove'));

      expect(storage.removeGardenPlant).not.toHaveBeenCalled();
    });
  });

  describe('unknown plants', () => {
    it('handles unknown plant ids gracefully', () => {
      storage.getGardenBeds.mockReturnValue([mockBed]);
      storage.getGardenPlants.mockReturnValue([
        {
          id: 'garden-1',
          plantId: 'unknown-plant',
          bedId: 'bed-1',
          quantity: 1,
          plantedDate: new Date().toISOString(),
          lastWatered: new Date().toISOString(),
          notes: ''
        }
      ]);
      plantLibraryModule.getPlantById.mockReturnValue(undefined);

      renderMyGarden();
      expect(screen.getByText('1 plant in your garden')).toBeInTheDocument();
    });
  });

  describe('beds with no plants', () => {
    it('does not render empty bed sections', () => {
      storage.getGardenBeds.mockReturnValue([mockBed, { ...mockBed, id: 'bed-2', name: 'Empty Bed' }]);
      storage.getGardenPlants.mockReturnValue([
        {
          id: 'garden-1',
          plantId: 'tomato',
          bedId: 'bed-1',
          quantity: 1,
          plantedDate: new Date().toISOString(),
          lastWatered: new Date().toISOString(),
          notes: ''
        }
      ]);

      renderMyGarden();
      expect(screen.getByText('Main Garden')).toBeInTheDocument();
      expect(screen.queryByText('Empty Bed')).not.toBeInTheDocument();
    });
  });

  describe('bed capacity display', () => {
    beforeEach(() => {
      storage.getGardenBeds.mockReturnValue([mockBed]);
      storage.getGardenPlants.mockReturnValue([
        {
          id: 'garden-1',
          plantId: 'tomato',
          bedId: 'bed-1',
          quantity: 1,
          plantedDate: new Date().toISOString(),
          lastWatered: new Date().toISOString(),
          notes: ''
        }
      ]);
    });

    it('handles missing capacity gracefully', () => {
      storage.getBedCapacity.mockReturnValue(null);
      renderMyGarden();
      expect(screen.getByText('Main Garden')).toBeInTheDocument();
    });
  });

  describe('editing plants', () => {
    const mockGardenPlant = {
      id: 'garden-1',
      plantId: 'tomato',
      bedId: 'bed-1',
      quantity: 2,
      variety: 'Roma',
      plantedDate: '2026-01-15T00:00:00.000Z',
      lastWatered: '2026-01-15T00:00:00.000Z',
      notes: '',
      daysToMaturityOverride: null,
      spacePerPlantOverride: null,
      harvestDateOverride: null
    };

    beforeEach(() => {
      storage.getGardenBeds.mockReturnValue([mockBed]);
      storage.getGardenPlants.mockReturnValue([mockGardenPlant]);
      storage.updateGardenPlant.mockImplementation((id, updates) => ({
        ...mockGardenPlant,
        ...updates
      }));
      storage.getPlantDefaults.mockReturnValue(null);
    });

    it('shows edit button on plant cards', () => {
      renderMyGarden();
      expect(screen.getByText('Edit')).toBeInTheDocument();
    });

    it('opens edit modal when edit button clicked', () => {
      renderMyGarden();
      fireEvent.click(screen.getByText('Edit'));
      expect(screen.getByText('Edit Plant')).toBeInTheDocument();
    });

    it('shows plant form with pre-populated values in edit mode', () => {
      renderMyGarden();
      fireEvent.click(screen.getByText('Edit'));
      expect(screen.getByLabelText('Variety (optional)')).toHaveValue('Roma');
      expect(screen.getByLabelText('Quantity')).toHaveValue(2);
    });

    it('closes edit modal when cancel button clicked', () => {
      renderMyGarden();
      fireEvent.click(screen.getByText('Edit'));
      fireEvent.click(screen.getByText('Cancel'));
      expect(screen.queryByText('Edit Plant')).not.toBeInTheDocument();
    });

    it('calls updateGardenPlant when edit form submitted', async () => {
      storage.getGardenPlants
        .mockReturnValueOnce([mockGardenPlant])
        .mockReturnValueOnce([{ ...mockGardenPlant, quantity: 3 }]);

      renderMyGarden();
      fireEvent.click(screen.getByText('Edit'));

      fireEvent.change(screen.getByLabelText('Quantity'), { target: { value: '3' } });
      fireEvent.click(screen.getByText('Save Changes'));

      expect(storage.updateGardenPlant).toHaveBeenCalledWith('garden-1', expect.objectContaining({
        quantity: 3
      }));
    });

    it('closes edit modal after successful edit', async () => {
      storage.getGardenPlants
        .mockReturnValueOnce([mockGardenPlant])
        .mockReturnValueOnce([{ ...mockGardenPlant, quantity: 3 }]);

      renderMyGarden();
      fireEvent.click(screen.getByText('Edit'));
      fireEvent.change(screen.getByLabelText('Quantity'), { target: { value: '3' } });
      fireEvent.click(screen.getByText('Save Changes'));

      await waitFor(() => {
        expect(screen.queryByText('Edit Plant')).not.toBeInTheDocument();
      });
    });

    it('shows reset to defaults button in edit modal', () => {
      renderMyGarden();
      fireEvent.click(screen.getByText('Edit'));
      expect(screen.getByText('Reset to Default Values')).toBeInTheDocument();
    });

    it('resets overrides when reset to defaults clicked', () => {
      const plantWithOverrides = {
        ...mockGardenPlant,
        daysToMaturityOverride: 80,
        spacePerPlantOverride: 1.5,
        harvestDateOverride: '2026-05-01T00:00:00.000Z'
      };
      storage.getGardenPlants.mockReturnValue([plantWithOverrides]);
      storage.getPlantDefaults.mockReturnValue({ daysToMaturity: 70, squaresPerPlant: 1 });

      renderMyGarden();
      fireEvent.click(screen.getByText('Edit'));
      fireEvent.click(screen.getByText('Reset to Default Values'));

      expect(storage.updateGardenPlant).toHaveBeenCalledWith('garden-1', {
        daysToMaturityOverride: null,
        spacePerPlantOverride: null,
        harvestDateOverride: null
      });
    });

    it('updates edit form state after reset', async () => {
      const plantWithOverrides = {
        ...mockGardenPlant,
        daysToMaturityOverride: 80
      };
      storage.getGardenPlants
        .mockReturnValueOnce([plantWithOverrides])
        .mockReturnValueOnce([{ ...plantWithOverrides, daysToMaturityOverride: null }]);
      storage.getPlantDefaults.mockReturnValue(null);

      renderMyGarden();
      fireEvent.click(screen.getByText('Edit'));
      fireEvent.click(screen.getByText('Reset to Default Values'));

      // After reset, the form should reflect cleared overrides
      expect(storage.updateGardenPlant).toHaveBeenCalled();
    });

    it('allows editing plant bed assignment', async () => {
      const secondBed = { ...mockBed, id: 'bed-2', name: 'Second Bed' };
      storage.getGardenBeds.mockReturnValue([mockBed, secondBed]);
      storage.getGardenPlants
        .mockReturnValueOnce([mockGardenPlant])
        .mockReturnValueOnce([{ ...mockGardenPlant, bedId: 'bed-2' }]);

      renderMyGarden();
      fireEvent.click(screen.getByText('Edit'));
      fireEvent.change(screen.getByLabelText('Bed'), { target: { value: 'bed-2' } });
      fireEvent.click(screen.getByText('Save Changes'));

      expect(storage.updateGardenPlant).toHaveBeenCalledWith('garden-1', expect.objectContaining({
        bedId: 'bed-2'
      }));
    });

    it('allows editing variety', async () => {
      storage.getGardenPlants
        .mockReturnValueOnce([mockGardenPlant])
        .mockReturnValueOnce([{ ...mockGardenPlant, variety: 'Cherry' }]);

      renderMyGarden();
      fireEvent.click(screen.getByText('Edit'));
      fireEvent.change(screen.getByLabelText('Variety (optional)'), { target: { value: 'Cherry' } });
      fireEvent.click(screen.getByText('Save Changes'));

      expect(storage.updateGardenPlant).toHaveBeenCalledWith('garden-1', expect.objectContaining({
        variety: 'Cherry'
      }));
    });

    it('allows editing plant date', async () => {
      storage.getGardenPlants
        .mockReturnValueOnce([mockGardenPlant])
        .mockReturnValueOnce([{ ...mockGardenPlant, plantedDate: '2026-02-01T00:00:00.000Z' }]);

      renderMyGarden();
      fireEvent.click(screen.getByText('Edit'));
      fireEvent.change(screen.getByLabelText('Plant Date'), { target: { value: '2026-02-01' } });
      fireEvent.click(screen.getByText('Save Changes'));

      expect(storage.updateGardenPlant).toHaveBeenCalledWith('garden-1', expect.objectContaining({
        plantedDate: expect.stringContaining('2026-02-01')
      }));
    });

    it('allows editing overrides', async () => {
      storage.getGardenPlants
        .mockReturnValueOnce([mockGardenPlant])
        .mockReturnValueOnce([{ ...mockGardenPlant, daysToMaturityOverride: 60 }]);

      renderMyGarden();
      fireEvent.click(screen.getByText('Edit'));
      fireEvent.click(screen.getByText('Advanced Options'));
      fireEvent.change(screen.getByLabelText('Days to Maturity Override'), { target: { value: '60' } });
      fireEvent.click(screen.getByText('Save Changes'));

      expect(storage.updateGardenPlant).toHaveBeenCalledWith('garden-1', expect.objectContaining({
        daysToMaturityOverride: 60
      }));
    });
  });

  describe('editing unassigned plants', () => {
    const unassignedPlant = {
      id: 'garden-unassigned',
      plantId: 'tomato',
      quantity: 1,
      plantedDate: new Date().toISOString(),
      lastWatered: new Date().toISOString(),
      notes: ''
      // no bedId
    };

    beforeEach(() => {
      storage.getGardenBeds.mockReturnValue([mockBed]);
      storage.getGardenPlants.mockReturnValue([unassignedPlant]);
      storage.updateGardenPlant.mockImplementation((id, updates) => ({
        ...unassignedPlant,
        ...updates
      }));
    });

    it('shows edit button on unassigned plant cards', () => {
      renderMyGarden();
      expect(screen.getByText('Edit')).toBeInTheDocument();
    });

    it('can edit unassigned plants', () => {
      storage.getGardenPlants
        .mockReturnValueOnce([unassignedPlant])
        .mockReturnValueOnce([{ ...unassignedPlant, bedId: 'bed-1' }]);

      renderMyGarden();
      fireEvent.click(screen.getByText('Edit'));
      fireEvent.click(screen.getByText('Save Changes'));

      expect(storage.updateGardenPlant).toHaveBeenCalled();
    });
  });
});
