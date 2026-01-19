import PropTypes from 'prop-types';
import {
  getEffectiveHarvestDate,
  formatHarvestDateDisplay,
  getDaysUntilHarvest
} from '../utils/harvestDate';

function PlantCard({ plant, gardenPlant, onAdd, onRemove, showAddButton = false }) {
  const getSunIcon = (requirement) => {
    switch (requirement) {
      case 'full':
        return '☀️';
      case 'partial':
        return '⛅';
      case 'shade':
        return '☁️';
      default:
        return '☀️';
    }
  };

  const getPlantsPerSquare = (squaresPerPlant) => {
    return Math.round(1 / squaresPerPlant);
  };

  const getHarvestInfo = () => {
    if (!gardenPlant) return null;

    const { date, isOverride } = getEffectiveHarvestDate(
      gardenPlant.plantedDate,
      plant.daysToMaturity,
      gardenPlant.harvestDateOverride
    );

    return {
      daysRemaining: getDaysUntilHarvest(date),
      displayText: formatHarvestDateDisplay(date, isOverride),
      isOverride
    };
  };

  const harvestInfo = getHarvestInfo();

  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-semibold text-primary">
            {plant.name}
            {gardenPlant?.variety && (
              <span className="text-gray-600 font-normal"> - {gardenPlant.variety}</span>
            )}
          </h3>
          <p className="text-sm text-gray-500 italic">{plant.scientificName}</p>
        </div>
        <div className="text-2xl">{getSunIcon(plant.sunRequirement)}</div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Water every:</span>
          <span className="font-medium">{plant.wateringFrequency} days</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Per square:</span>
          <span className="font-medium">{getPlantsPerSquare(plant.squaresPerPlant)} plants</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Days to harvest:</span>
          <span className="font-medium">{plant.daysToMaturity} days</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Season:</span>
          <span className="font-medium capitalize">{plant.plantingSeason.join(', ')}</span>
        </div>

        {gardenPlant && harvestInfo && (
          <div className="pt-2 border-t border-gray-200 space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-600">Harvest in:</span>
              <span className={`font-bold ${harvestInfo.daysRemaining <= 0 ? 'text-green-600' : 'text-primary'}`}>
                {harvestInfo.daysRemaining <= 0 ? 'Ready!' : `${harvestInfo.daysRemaining} days`}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              {harvestInfo.displayText}
            </div>
          </div>
        )}

        {gardenPlant && (
          <div className="flex justify-between text-xs text-gray-500">
            <span>Planted:</span>
            <span>{new Date(gardenPlant.plantedDate).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      <div className="mt-4">
        {showAddButton && onAdd && (
          <button
            onClick={() => onAdd(plant.id)}
            className="w-full bg-primary hover:bg-primary-light text-white font-medium py-2 px-4 rounded transition-colors"
          >
            + Add to Garden
          </button>
        )}

        {!showAddButton && onRemove && gardenPlant && (
          <button
            onClick={() => onRemove(gardenPlant.id)}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded transition-colors"
          >
            Remove from Garden
          </button>
        )}
      </div>

      {plant.companionPlants && plant.companionPlants.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            <span className="font-semibold">Good companions:</span>{' '}
            <span className="capitalize">{plant.companionPlants.slice(0, 3).join(', ')}</span>
            {plant.companionPlants.length > 3 && '...'}
          </p>
        </div>
      )}
    </div>
  );
}

PlantCard.propTypes = {
  plant: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    scientificName: PropTypes.string.isRequired,
    wateringFrequency: PropTypes.number.isRequired,
    squaresPerPlant: PropTypes.number.isRequired,
    daysToMaturity: PropTypes.number.isRequired,
    plantingSeason: PropTypes.arrayOf(PropTypes.string).isRequired,
    sunRequirement: PropTypes.string.isRequired,
    companionPlants: PropTypes.arrayOf(PropTypes.string),
    avoidPlants: PropTypes.arrayOf(PropTypes.string)
  }).isRequired,
  gardenPlant: PropTypes.shape({
    id: PropTypes.string.isRequired,
    plantId: PropTypes.string.isRequired,
    plantedDate: PropTypes.string.isRequired,
    lastWatered: PropTypes.string.isRequired,
    notes: PropTypes.string,
    variety: PropTypes.string,
    harvestDateOverride: PropTypes.string
  }),
  onAdd: PropTypes.func,
  onRemove: PropTypes.func,
  showAddButton: PropTypes.bool
};

export default PlantCard;
