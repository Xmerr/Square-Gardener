import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { getPlantById, getCompanionReason, getEnemyReason } from '../data/plantLibrary';
import { getAdjacentPositions } from '../utils/planningAlgorithm';

function SquareDetails({ square, arrangement, onMove, onSwap, onRemove, onClose }) {
  const row = square?.row;
  const col = square?.col;
  const plantId = square?.plantId;

  const plant = useMemo(() => plantId ? getPlantById(plantId) : null, [plantId]);

  // Get adjacent plants for companion/enemy analysis
  const adjacentRelationships = useMemo(() => {
    if (!plant || !arrangement?.grid || row === undefined || col === undefined) {
      return { companions: [], enemies: [] };
    }

    const grid = arrangement.grid;
    const height = grid.length;
    const width = grid[0].length;
    const adjacentPositions = getAdjacentPositions(row, col, width, height);

    const companions = [];
    const enemies = [];

    for (const pos of adjacentPositions) {
      const adjacentPlantId = grid[pos.row][pos.col];
      if (!adjacentPlantId) continue;

      const adjacentPlant = getPlantById(adjacentPlantId);
      if (!adjacentPlant) continue;

      if (plant.companionPlants.includes(adjacentPlantId)) {
        companions.push({
          plantId: adjacentPlantId,
          name: adjacentPlant.name,
          position: pos,
          reason: getCompanionReason(plantId, adjacentPlantId)
        });
      } else if (plant.avoidPlants.includes(adjacentPlantId)) {
        enemies.push({
          plantId: adjacentPlantId,
          name: adjacentPlant.name,
          position: pos,
          reason: getEnemyReason(plantId, adjacentPlantId)
        });
      }
    }

    return { companions, enemies };
  }, [plant, plantId, arrangement, row, col]);

  // Generate placement reasoning based on relationships
  const reasoning = useMemo(() => {
    if (!plant) return [];

    const reasons = [];

    if (adjacentRelationships.companions.length > 0) {
      const companionNames = adjacentRelationships.companions
        .map(c => c.name)
        .join(', ');
      reasons.push(`Adjacent to ${companionNames} (companion${adjacentRelationships.companions.length > 1 ? 's' : ''})`);
    }

    if (adjacentRelationships.enemies.length > 0) {
      const enemyNames = adjacentRelationships.enemies
        .map(e => e.name)
        .join(', ');
      reasons.push(`Warning: Near ${enemyNames} (should avoid)`);
    }

    if (reasons.length === 0) {
      reasons.push('No significant companion/enemy relationships nearby');
    }

    return reasons;
  }, [plant, adjacentRelationships]);

  if (!square) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">
            Square ({row}, {col})
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          {plant ? (
            <>
              {/* Plant Info */}
              <div>
                <h4 className="font-semibold text-gray-800 text-lg">{plant.name}</h4>
                <p className="text-sm text-gray-600 italic">{plant.scientificName}</p>
              </div>

              {/* Placement Reasoning */}
              <div>
                <h5 className="font-semibold text-gray-700 mb-2">Placement Reasoning:</h5>
                <ul className="space-y-1">
                  {reasoning.map((reason, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-gray-400 mt-0.5">•</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Companion/Enemy Indicators */}
              {(adjacentRelationships.companions.length > 0 || adjacentRelationships.enemies.length > 0) && (
                <div>
                  <h5 className="font-semibold text-gray-700 mb-2">Relationships:</h5>

                  {adjacentRelationships.companions.length > 0 && (
                    <div className="mb-2">
                      <div className="flex items-center gap-2 text-sm text-green-700 mb-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium">Companions:</span>
                      </div>
                      <ul className="ml-6 space-y-2">
                        {adjacentRelationships.companions.map((companion, index) => (
                          <li key={index} className="text-sm">
                            <div className="font-medium text-gray-700">
                              {companion.name} at ({companion.position.row}, {companion.position.col})
                            </div>
                            <div className="text-gray-600 italic mt-0.5">
                              {companion.reason}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {adjacentRelationships.enemies.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 text-sm text-red-700 mb-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium">Enemies:</span>
                      </div>
                      <ul className="ml-6 space-y-2">
                        {adjacentRelationships.enemies.map((enemy, index) => (
                          <li key={index} className="text-sm">
                            <div className="font-medium text-gray-700">
                              {enemy.name} at ({enemy.position.row}, {enemy.position.col})
                            </div>
                            <div className="text-red-600 italic mt-0.5">
                              {enemy.reason}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500">This square is empty</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {plant && (
          <div className="border-t border-gray-200 px-6 py-4 flex gap-3">
            <button
              onClick={() => onMove?.(square)}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              Move
            </button>
            <button
              onClick={() => onSwap?.(square)}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
            >
              Swap
            </button>
            <button
              onClick={() => onRemove?.(square)}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium"
            >
              Remove
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

SquareDetails.propTypes = {
  square: PropTypes.shape({
    row: PropTypes.number.isRequired,
    col: PropTypes.number.isRequired,
    plantId: PropTypes.string
  }),
  arrangement: PropTypes.shape({
    grid: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)),
    placements: PropTypes.arrayOf(PropTypes.shape({
      plantId: PropTypes.string.isRequired,
      row: PropTypes.number.isRequired,
      col: PropTypes.number.isRequired
    })),
    success: PropTypes.bool
  }),
  onMove: PropTypes.func,
  onSwap: PropTypes.func,
  onRemove: PropTypes.func,
  onClose: PropTypes.func.isRequired
};

export default SquareDetails;
