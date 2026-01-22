import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { getGardenBeds, getPlantsByBed, getBedCapacity } from '../utils/storage';
import { getPlantById } from '../data/plantLibrary';

function BedDeleteDialog({ bed, onConfirm, onCancel }) {
  const [destinationBedId, setDestinationBedId] = useState('');
  const [deleteAllPlants, setDeleteAllPlants] = useState(false);
  const [error, setError] = useState('');

  const plantsInBed = useMemo(() => getPlantsByBed(bed.id), [bed.id]);
  const otherBeds = useMemo(() => getGardenBeds().filter(b => b.id !== bed.id), [bed.id]);

  // Calculate total squares needed by plants being moved
  const totalSquaresNeeded = useMemo(() => {
    return plantsInBed.reduce((sum, gardenPlant) => {
      const plantInfo = getPlantById(gardenPlant.plantId);
      if (!plantInfo) return sum;
      const quantity = gardenPlant.quantity || 1;
      return sum + (quantity * plantInfo.squaresPerPlant);
    }, 0);
  }, [plantsInBed]);

  // Calculate overcrowding status for destination bed
  const overcrowdingWarning = useMemo(() => {
    if (!destinationBedId || deleteAllPlants) return null;

    const capacity = getBedCapacity(destinationBedId);
    const spaceAfterMove = capacity.available - totalSquaresNeeded;

    if (spaceAfterMove < 0) {
      const overage = Math.abs(spaceAfterMove);
      return `Warning: This will overcrowd the destination by ${overage.toFixed(1)} square${overage !== 1 ? 's' : ''}. Consider moving fewer plants or choosing a larger location.`;
    }

    return null;
  }, [destinationBedId, deleteAllPlants, totalSquaresNeeded]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // If user wants to delete all plants, confirm
    if (deleteAllPlants) {
      onConfirm({ deleteAllPlants: true, destinationBedId: null });
      return;
    }

    // If reassigning plants, validate destination is selected
    if (!destinationBedId) {
      setError('Please select a destination for the plants or choose to delete them.');
      return;
    }

    onConfirm({ deleteAllPlants: false, destinationBedId });
  };

  const locationName = bed.is_pot ? 'pot' : 'bed';
  const LocationName = bed.is_pot ? 'Pot' : 'Bed';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Delete {LocationName}
        </h2>

        {plantsInBed.length === 0 ? (
          <div>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete <span className="font-semibold">{bed.name}</span>?
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => onConfirm({ deleteAllPlants: false, destinationBedId: null })}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete {LocationName}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <p className="text-gray-700 mb-2">
                <span className="font-semibold">{bed.name}</span> contains {plantsInBed.length} {plantsInBed.length === 1 ? 'plant' : 'plants'}:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 mb-4 max-h-32 overflow-y-auto">
                {plantsInBed.map((gardenPlant) => {
                  const plantInfo = getPlantById(gardenPlant.plantId);
                  const quantity = gardenPlant.quantity || 1;
                  const displayName = gardenPlant.variety
                    ? `${plantInfo?.name || 'Unknown'} (${gardenPlant.variety})`
                    : plantInfo?.name || 'Unknown';
                  return (
                    <li key={gardenPlant.id}>
                      {quantity > 1 ? `${quantity}x ` : ''}{displayName}
                    </li>
                  );
                })}
              </ul>
              <p className="text-gray-700">
                What would you like to do with {plantsInBed.length === 1 ? 'this plant' : 'these plants'}?
              </p>
            </div>

            {!deleteAllPlants && otherBeds.length > 0 && (
              <div className="mb-4">
                <label htmlFor="destination-bed" className="block text-sm font-medium text-gray-700 mb-2">
                  Move plants to:
                </label>
                <select
                  id="destination-bed"
                  value={destinationBedId}
                  onChange={(e) => setDestinationBedId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">-- Select a location --</option>
                  {otherBeds.map((otherBed) => (
                    <option key={otherBed.id} value={otherBed.id}>
                      {otherBed.is_pot ? '🪴' : '🌱'} {otherBed.name}
                      {otherBed.is_pot
                        ? ` (${otherBed.size} pot)`
                        : ` (${otherBed.width} × ${otherBed.height} ft)`
                      }
                    </option>
                  ))}
                </select>
              </div>
            )}

            {otherBeds.length === 0 && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  This is the only location in your garden. You must delete the plants to proceed.
                </p>
              </div>
            )}

            <div className="mb-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={deleteAllPlants}
                  onChange={(e) => setDeleteAllPlants(e.target.checked)}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Delete all plants in this {locationName}
                </span>
              </label>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {overcrowdingWarning && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">{overcrowdingWarning}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete {LocationName}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

BedDeleteDialog.propTypes = {
  bed: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    is_pot: PropTypes.bool,
    width: PropTypes.number,
    height: PropTypes.number,
    size: PropTypes.string
  }).isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
};

export default BedDeleteDialog;
