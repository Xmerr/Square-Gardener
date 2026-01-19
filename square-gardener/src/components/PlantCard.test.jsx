import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import PlantCard from './PlantCard';

const mockPlant = {
  id: 'tomato',
  name: 'Tomato',
  scientificName: 'Solanum lycopersicum',
  wateringFrequency: 2,
  squaresPerPlant: 1,
  daysToMaturity: 70,
  plantingSeason: ['spring', 'summer'],
  sunRequirement: 'full',
  companionPlants: ['basil', 'carrot', 'marigold', 'parsley'],
  avoidPlants: ['cabbage', 'broccoli']
};

const mockGardenPlant = {
  id: 'garden-123',
  plantId: 'tomato',
  plantedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
  lastWatered: new Date().toISOString(),
  notes: '',
  harvestDateOverride: null
};

describe('PlantCard', () => {
  describe('basic rendering', () => {
    it('renders plant name', () => {
      render(<PlantCard plant={mockPlant} />);
      expect(screen.getByText('Tomato')).toBeInTheDocument();
    });

    it('renders scientific name', () => {
      render(<PlantCard plant={mockPlant} />);
      expect(screen.getByText('Solanum lycopersicum')).toBeInTheDocument();
    });

    it('renders watering frequency', () => {
      render(<PlantCard plant={mockPlant} />);
      expect(screen.getByText('2 days')).toBeInTheDocument();
    });

    it('renders days to maturity', () => {
      render(<PlantCard plant={mockPlant} />);
      expect(screen.getByText('70 days')).toBeInTheDocument();
    });

    it('renders planting seasons', () => {
      render(<PlantCard plant={mockPlant} />);
      expect(screen.getByText('spring, summer')).toBeInTheDocument();
    });

    it('renders companion plants (limited to 3)', () => {
      render(<PlantCard plant={mockPlant} />);
      expect(screen.getByText(/basil, carrot, marigold/)).toBeInTheDocument();
    });

    it('shows ellipsis when more than 3 companion plants', () => {
      render(<PlantCard plant={mockPlant} />);
      expect(screen.getByText(/\.\.\./)).toBeInTheDocument();
    });
  });

  describe('sun requirement icons', () => {
    it('shows sun icon for full sun', () => {
      render(<PlantCard plant={mockPlant} />);
      expect(screen.getByText('☀️')).toBeInTheDocument();
    });

    it('shows partial sun icon', () => {
      const partialPlant = { ...mockPlant, sunRequirement: 'partial' };
      render(<PlantCard plant={partialPlant} />);
      expect(screen.getByText('⛅')).toBeInTheDocument();
    });

    it('shows shade icon', () => {
      const shadePlant = { ...mockPlant, sunRequirement: 'shade' };
      render(<PlantCard plant={shadePlant} />);
      expect(screen.getByText('☁️')).toBeInTheDocument();
    });

    it('shows default sun icon for unknown requirement', () => {
      const unknownPlant = { ...mockPlant, sunRequirement: 'unknown' };
      render(<PlantCard plant={unknownPlant} />);
      expect(screen.getByText('☀️')).toBeInTheDocument();
    });
  });

  describe('plants per square calculation', () => {
    it('calculates 1 plant per square', () => {
      render(<PlantCard plant={mockPlant} />);
      expect(screen.getByText('1 plants')).toBeInTheDocument();
    });

    it('calculates 4 plants per square', () => {
      const lettucePlant = { ...mockPlant, squaresPerPlant: 0.25 };
      render(<PlantCard plant={lettucePlant} />);
      expect(screen.getByText('4 plants')).toBeInTheDocument();
    });

    it('calculates 16 plants per square', () => {
      const carrotPlant = { ...mockPlant, squaresPerPlant: 0.0625 };
      render(<PlantCard plant={carrotPlant} />);
      expect(screen.getByText('16 plants')).toBeInTheDocument();
    });
  });

  describe('garden plant information', () => {
    it('shows planted date when gardenPlant provided', () => {
      render(<PlantCard plant={mockPlant} gardenPlant={mockGardenPlant} />);
      expect(screen.getByText('Planted:')).toBeInTheDocument();
    });

    it('shows harvest countdown when gardenPlant provided', () => {
      render(<PlantCard plant={mockPlant} gardenPlant={mockGardenPlant} />);
      expect(screen.getByText('Harvest in:')).toBeInTheDocument();
      expect(screen.getByText('40 days')).toBeInTheDocument();
    });

    it('shows Ready! when harvest is ready', () => {
      const readyPlant = {
        ...mockGardenPlant,
        plantedDate: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString()
      };
      render(<PlantCard plant={mockPlant} gardenPlant={readyPlant} />);
      expect(screen.getByText('Ready!')).toBeInTheDocument();
    });

    it('does not show harvest info without gardenPlant', () => {
      render(<PlantCard plant={mockPlant} />);
      expect(screen.queryByText('Harvest in:')).not.toBeInTheDocument();
    });
  });

  describe('variety display', () => {
    it('shows variety when gardenPlant has variety', () => {
      const gardenPlantWithVariety = { ...mockGardenPlant, variety: 'Cherokee Purple' };
      render(<PlantCard plant={mockPlant} gardenPlant={gardenPlantWithVariety} />);
      expect(screen.getByText('- Cherokee Purple')).toBeInTheDocument();
    });

    it('does not show variety when gardenPlant.variety is null', () => {
      const gardenPlantWithNullVariety = { ...mockGardenPlant, variety: null };
      render(<PlantCard plant={mockPlant} gardenPlant={gardenPlantWithNullVariety} />);
      expect(screen.queryByText(/-/)).not.toBeInTheDocument();
    });

    it('does not show variety when gardenPlant.variety is undefined', () => {
      render(<PlantCard plant={mockPlant} gardenPlant={mockGardenPlant} />);
      expect(screen.queryByText(/- /)).not.toBeInTheDocument();
    });

    it('does not show variety without gardenPlant', () => {
      render(<PlantCard plant={mockPlant} />);
      expect(screen.queryByText(/- /)).not.toBeInTheDocument();
    });
  });

  describe('add button', () => {
    it('shows add button when showAddButton is true', () => {
      const onAdd = vi.fn();
      render(<PlantCard plant={mockPlant} onAdd={onAdd} showAddButton={true} />);
      expect(screen.getByText('+ Add to Garden')).toBeInTheDocument();
    });

    it('calls onAdd with plant id when clicked', () => {
      const onAdd = vi.fn();
      render(<PlantCard plant={mockPlant} onAdd={onAdd} showAddButton={true} />);
      fireEvent.click(screen.getByText('+ Add to Garden'));
      expect(onAdd).toHaveBeenCalledWith('tomato');
    });

    it('does not show add button by default', () => {
      render(<PlantCard plant={mockPlant} />);
      expect(screen.queryByText('+ Add to Garden')).not.toBeInTheDocument();
    });
  });

  describe('remove button', () => {
    it('shows remove button when gardenPlant provided and showAddButton is false', () => {
      const onRemove = vi.fn();
      render(
        <PlantCard
          plant={mockPlant}
          gardenPlant={mockGardenPlant}
          onRemove={onRemove}
          showAddButton={false}
        />
      );
      expect(screen.getByText('Remove from Garden')).toBeInTheDocument();
    });

    it('calls onRemove with garden plant id when clicked', () => {
      const onRemove = vi.fn();
      render(
        <PlantCard
          plant={mockPlant}
          gardenPlant={mockGardenPlant}
          onRemove={onRemove}
          showAddButton={false}
        />
      );
      fireEvent.click(screen.getByText('Remove from Garden'));
      expect(onRemove).toHaveBeenCalledWith('garden-123');
    });

    it('does not show remove button without gardenPlant', () => {
      const onRemove = vi.fn();
      render(<PlantCard plant={mockPlant} onRemove={onRemove} showAddButton={false} />);
      expect(screen.queryByText('Remove from Garden')).not.toBeInTheDocument();
    });
  });

  describe('companion plants section', () => {
    it('renders companion plants section when companions exist', () => {
      render(<PlantCard plant={mockPlant} />);
      expect(screen.getByText('Good companions:')).toBeInTheDocument();
    });

    it('does not render companion section when empty', () => {
      const noCompanionPlant = { ...mockPlant, companionPlants: [] };
      render(<PlantCard plant={noCompanionPlant} />);
      expect(screen.queryByText('Good companions:')).not.toBeInTheDocument();
    });

    it('does not show ellipsis when 3 or fewer companions', () => {
      const threeCompanionPlant = { ...mockPlant, companionPlants: ['basil', 'carrot'] };
      render(<PlantCard plant={threeCompanionPlant} />);
      expect(screen.queryByText(/\.\.\./)).not.toBeInTheDocument();
    });
  });

  describe('harvest date override display', () => {
    it('shows Expected: prefix for calculated harvest date', () => {
      render(<PlantCard plant={mockPlant} gardenPlant={mockGardenPlant} />);
      expect(screen.getByText(/^Expected:/)).toBeInTheDocument();
    });

    it('shows Harvest: prefix with manual indicator for override', () => {
      const gardenPlantWithOverride = {
        ...mockGardenPlant,
        harvestDateOverride: '2026-04-15T00:00:00.000Z'
      };
      render(<PlantCard plant={mockPlant} gardenPlant={gardenPlantWithOverride} />);
      expect(screen.getByText(/^Harvest:/)).toBeInTheDocument();
      expect(screen.getByText(/\(set manually\)/)).toBeInTheDocument();
    });

    it('uses override date for days remaining calculation', () => {
      // Create a garden plant with a very close override date
      const today = new Date();
      const overrideDate = new Date(today);
      overrideDate.setDate(overrideDate.getDate() + 5);

      const gardenPlantWithOverride = {
        ...mockGardenPlant,
        plantedDate: '2026-01-01T00:00:00.000Z',
        harvestDateOverride: overrideDate.toISOString()
      };
      render(<PlantCard plant={mockPlant} gardenPlant={gardenPlantWithOverride} />);
      expect(screen.getByText('5 days')).toBeInTheDocument();
    });

    it('shows Ready! when override date is in the past', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 5);

      const gardenPlantWithPastOverride = {
        ...mockGardenPlant,
        harvestDateOverride: pastDate.toISOString()
      };
      render(<PlantCard plant={mockPlant} gardenPlant={gardenPlantWithPastOverride} />);
      expect(screen.getByText('Ready!')).toBeInTheDocument();
    });

    it('does not show harvest date display without gardenPlant', () => {
      render(<PlantCard plant={mockPlant} />);
      expect(screen.queryByText(/^Expected:/)).not.toBeInTheDocument();
      expect(screen.queryByText(/^Harvest:/)).not.toBeInTheDocument();
    });
  });
});
