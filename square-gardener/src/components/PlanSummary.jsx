import { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { getPlantById } from '../data/plantLibrary';
import { getBedById, addGardenBed, addGardenPlant } from '../utils/storage';
import { getFrostDates } from '../utils/frostDateStorage';

/**
 * Calculate the suggested planting date for a plant based on frost dates
 * @param {Object} plant - Plant from library
 * @param {Object} frostDates - { lastSpringFrost, firstFallFrost }
 * @returns {string} ISO date string
 */
const calculatePlantingDate = (plant, frostDates) => {
  const { lastSpringFrost, firstFallFrost } = frostDates;

  if (!lastSpringFrost || !firstFallFrost) {
    return new Date().toISOString();
  }

  const lastSpring = new Date(lastSpringFrost);
  const firstFall = new Date(firstFallFrost);

  if (plant.plantingSeason.includes('spring')) {
    const plantingDate = new Date(lastSpring);
    plantingDate.setDate(plantingDate.getDate() + 7);
    return plantingDate.toISOString();
  }

  if (plant.plantingSeason.includes('fall')) {
    const daysToMaturity = plant.daysToMaturity || 60;
    const plantByDate = new Date(firstFall);
    plantByDate.setDate(plantByDate.getDate() - daysToMaturity - 14);
    return plantByDate.toISOString();
  }

  const summerDate = new Date(lastSpring);
  summerDate.setDate(summerDate.getDate() + 60);
  return summerDate.toISOString();
};

function PlanSummary({ arrangement, bed, plantSelections, onApplySuccess }) {
  const navigate = useNavigate();
  const [isApplying, setIsApplying] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  if (!arrangement || !bed || !plantSelections || plantSelections.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-center text-gray-500">No plan to display</p>
      </div>
    );
  }

  const stats = arrangement.stats || {
    uniquePlants: plantSelections.length,
    filledSquares: arrangement.placements?.length || 0,
    totalSquares: bed.width * bed.height,
    companionAdjacencies: 0
  };

  const handleApplyClick = () => {
    setShowConfirmation(true);
  };

  const handleConfirmApply = async () => {
    setIsApplying(true);
    try {
      const frostDates = getFrostDates();
      let targetBed = getBedById(bed.id);

      if (!targetBed) {
        targetBed = addGardenBed(bed.name, bed.width, bed.height);
      }

      const plantCountByType = {};
      arrangement.placements.forEach(placement => {
        plantCountByType[placement.plantId] = (plantCountByType[placement.plantId] || 0) + 1;
      });

      for (const [plantId, count] of Object.entries(plantCountByType)) {
        const plant = getPlantById(plantId);
        if (plant) {
          const plantingDate = calculatePlantingDate(plant, frostDates);
          addGardenPlant(plantId, targetBed.id, count, plantingDate);
        }
      }

      setShowConfirmation(false);
      setIsApplying(false);

      if (onApplySuccess) {
        onApplySuccess();
      }

      setTimeout(() => {
        navigate('/my-garden');
      }, 100);
    } catch (error) {
      console.error('Error applying plan:', error);
      setIsApplying(false);
      alert('Failed to apply plan. Please try again.');
    }
  };

  const handleCancelConfirmation = () => {
    setShowConfirmation(false);
  };

  const plantSummary = plantSelections.map(selection => {
    const plant = getPlantById(selection.plantId);
    return {
      ...selection,
      name: plant?.name || selection.plantId,
      spaceNeeded: selection.quantity * (plant?.squaresPerPlant || 1)
    };
  });

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Plan Summary</h2>

      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm text-gray-600">Bed</p>
            <p className="text-lg font-medium text-gray-800">{bed.name}</p>
            <p className="text-sm text-gray-500">{bed.width}×{bed.height} ft</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Space Usage</p>
            <p className="text-lg font-medium text-gray-800">
              {stats.filledSquares} / {stats.totalSquares} squares
            </p>
            <p className="text-sm text-gray-500">
              {Math.round((stats.filledSquares / stats.totalSquares) * 100)}% filled
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            Plants to Add ({stats.uniquePlants})
          </h3>
          <div className="space-y-2">
            {plantSummary.map(({ plantId, name, quantity, spaceNeeded }) => (
              <div key={plantId} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="font-medium text-gray-800">{name}</span>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>Qty: {quantity}</span>
                  <span>Space: {spaceNeeded} sq ft</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {stats.companionAdjacencies > 0 && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              ✓ {stats.companionAdjacencies} companion plant adjacencies
            </p>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleApplyClick}
          disabled={isApplying}
          className="flex-1 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isApplying ? 'Applying...' : 'Apply to Garden'}
        </button>
      </div>

      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Confirm Apply Plan</h3>
            <p className="text-gray-600 mb-4">
              This will add {stats.uniquePlants} plant type(s) with a total of {stats.filledSquares} plants to your garden in the bed "{bed.name}".
            </p>
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">Plants to add:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                {plantSummary.map(({ plantId, name, quantity }) => (
                  <li key={plantId}>• {name} ({quantity})</li>
                ))}
              </ul>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCancelConfirmation}
                disabled={isApplying}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmApply}
                disabled={isApplying}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors disabled:opacity-50 font-medium"
              >
                {isApplying ? 'Applying...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

PlanSummary.propTypes = {
  arrangement: PropTypes.shape({
    grid: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)),
    placements: PropTypes.arrayOf(PropTypes.shape({
      plantId: PropTypes.string.isRequired,
      row: PropTypes.number.isRequired,
      col: PropTypes.number.isRequired
    })),
    success: PropTypes.bool,
    stats: PropTypes.shape({
      uniquePlants: PropTypes.number,
      filledSquares: PropTypes.number,
      totalSquares: PropTypes.number,
      companionAdjacencies: PropTypes.number
    })
  }),
  bed: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired
  }),
  plantSelections: PropTypes.arrayOf(PropTypes.shape({
    plantId: PropTypes.string.isRequired,
    quantity: PropTypes.number.isRequired
  })),
  onApplySuccess: PropTypes.func
};

export default PlanSummary;
