import PropTypes from 'prop-types';
import { POT_SIZES } from '../utils/storage';
import { getPlantById } from '../data/plantLibrary';

function BedCard({ bed, capacity, plantCount, plants, onEdit, onDelete }) {
  const isPot = bed.is_pot === true;

  const getCapacityColor = () => {
    if (capacity.isOvercapacity) return 'bg-red-500';
    if (capacity.used >= capacity.total * 0.9) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getCapacityPercent = () => {
    if (capacity.total === 0) return 0;
    return Math.min((capacity.used / capacity.total) * 100, 100);
  };

  const squareFootage = bed.width * bed.height;

  // Get size label for pots
  const getSizeLabel = () => {
    if (!isPot || !bed.size) return '';
    return POT_SIZES[bed.size]?.label || bed.size;
  };

  // Render plant list for pots
  const renderPlantList = () => {
    if (!plants || plants.length === 0) {
      return <span className="text-gray-400">No plants</span>;
    }

    const plantSummary = plants.reduce((acc, gardenPlant) => {
      const plantInfo = getPlantById(gardenPlant.plantId);
      if (!plantInfo) return acc;

      const name = plantInfo.name;
      if (acc[name]) {
        acc[name] += gardenPlant.quantity || 1;
      } else {
        acc[name] = gardenPlant.quantity || 1;
      }
      return acc;
    }, {});

    const plantNames = Object.entries(plantSummary)
      .map(([name, count]) => `${name} (${count})`)
      .join(', ');

    return plantNames;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl" role="img" aria-label={isPot ? 'pot' : 'bed'}>
              {isPot ? '🪴' : '🌱'}
            </span>
            <h3 className="text-lg font-semibold text-gray-800">{bed.name}</h3>
          </div>
          <p className="text-sm text-gray-500">
            {isPot ? (
              getSizeLabel()
            ) : (
              `${bed.width} ft × ${bed.height} ft (${squareFootage} sq ft)`
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(bed)}
            className="text-gray-500 hover:text-primary transition-colors"
            aria-label={`Edit ${bed.name}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(bed)}
            className="text-gray-500 hover:text-red-500 transition-colors"
            aria-label={`Delete ${bed.name}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {!isPot && (
        <div className="mb-3">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Capacity</span>
            <span className={capacity.isOvercapacity ? 'text-red-600 font-medium' : 'text-gray-600'}>
              {capacity.used} / {capacity.total} sq ft
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${getCapacityColor()}`}
              style={{ width: `${getCapacityPercent()}%` }}
              role="progressbar"
              aria-valuenow={capacity.used}
              aria-valuemin={0}
              aria-valuemax={capacity.total}
            />
          </div>
          {capacity.isOvercapacity && (
            <div className="flex items-center gap-1 mt-1">
              <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-xs text-red-600">
                Overcrowded by {Math.abs(capacity.available)} sq ft
              </span>
            </div>
          )}
        </div>
      )}

      <div className="text-sm text-gray-600">
        <div className="flex items-center mb-1">
          <svg className="w-4 h-4 mr-1 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.5 2a3.5 3.5 0 101.665 6.58L8.585 10l-1.42 1.42a3.5 3.5 0 101.414 1.414L10 11.414l1.42 1.42a3.5 3.5 0 101.414-1.414L11.414 10l1.42-1.42A3.5 3.5 0 1014.5 2 3.5 3.5 0 0010 5.5 3.5 3.5 0 005.5 2z" clipRule="evenodd" />
          </svg>
          {plantCount} {plantCount === 1 ? 'plant' : 'plants'}
        </div>
        {isPot && (
          <div className="text-xs text-gray-500 ml-5">
            {renderPlantList()}
          </div>
        )}
      </div>
    </div>
  );
}

BedCard.propTypes = {
  bed: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    is_pot: PropTypes.bool,
    // For beds (is_pot = false or undefined)
    width: PropTypes.number,
    height: PropTypes.number,
    // For pots (is_pot = true)
    size: PropTypes.string
  }).isRequired,
  capacity: PropTypes.shape({
    total: PropTypes.number.isRequired,
    used: PropTypes.number.isRequired,
    available: PropTypes.number.isRequired,
    isOvercapacity: PropTypes.bool.isRequired
  }).isRequired,
  plantCount: PropTypes.number.isRequired,
  plants: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      plantId: PropTypes.string.isRequired,
      bedId: PropTypes.string.isRequired,
      quantity: PropTypes.number
    })
  ),
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired
};

export default BedCard;
