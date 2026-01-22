import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { getPlantById } from '../data/plantLibrary';
import { validateArrangement } from '../utils/planningAlgorithm';
import { getSquareCompanionStatus } from '../utils/companionStatus';

const PLANT_COLORS = {
  tomato: '#ef4444',
  lettuce: '#22c55e',
  carrot: '#f97316',
  basil: '#16a34a',
  pepper: '#dc2626',
  cucumber: '#84cc16',
  bean: '#65a30d',
  spinach: '#15803d',
  radish: '#f43f5e',
  onion: '#a855f7',
  broccoli: '#14532d',
  cabbage: '#166534',
  cauliflower: '#fef3c7',
  zucchini: '#a3e635',
  pea: '#4ade80',
  potato: '#d4a574',
  beet: '#9f1239',
  kale: '#166534',
  cilantro: '#22d3ee',
  parsley: '#34d399',
  strawberry: '#fb7185',
  oregano: '#059669',
  thyme: '#6ee7b7',
  marigold: '#fbbf24',
  'swiss-chard': '#10b981',
  eggplant: '#7c3aed',
  garlic: '#f5f5f4',
  arugula: '#86efac',
  corn: '#fde047',
  sage: '#a78bfa'
};

const getPlantColor = (plantId) => {
  return PLANT_COLORS[plantId] || '#9ca3af';
};

const getContrastColor = (hexColor) => {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#1f2937' : '#ffffff';
};

function PlanningGrid({ arrangement, bed, onSquareClick, lockedSquares, onArrangementChange, editable = false }) {
  const grid = useMemo(() => arrangement?.grid || [], [arrangement]);
  const width = bed?.width || 0;
  const height = bed?.height || 0;

  const [draggedSquare, setDraggedSquare] = useState(null);
  const [dragOverSquare, setDragOverSquare] = useState(null);
  const [validation, setValidation] = useState(null);

  const plantCounts = useMemo(() => {
    const counts = {};
    for (const row of grid) {
      for (const plantId of row) {
        if (plantId) {
          counts[plantId] = (counts[plantId] || 0) + 1;
        }
      }
    }
    return counts;
  }, [grid]);

  const legendPlants = useMemo(() => {
    return Object.keys(plantCounts).map(plantId => {
      const plant = getPlantById(plantId);
      return {
        id: plantId,
        name: plant?.name || plantId,
        color: getPlantColor(plantId),
        count: plantCounts[plantId]
      };
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [plantCounts]);

  const handleSquareClick = (row, col, plantId) => {
    if (onSquareClick) {
      onSquareClick({ row, col, plantId });
    }
  };

  const handleDragStart = (row, col, plantId) => {
    if (!editable || !plantId || lockedSquares?.[row]?.[col]) {
      return;
    }
    setDraggedSquare({ row, col, plantId });
  };

  const handleDragEnd = () => {
    setDraggedSquare(null);
    setDragOverSquare(null);
  };

  const handleDragOver = (e, row, col) => {
    if (!editable || !draggedSquare) return;

    e.preventDefault();
    setDragOverSquare({ row, col });
  };

  const handleDrop = (e, targetRow, targetCol) => {
    e.preventDefault();

    if (!editable || !draggedSquare || lockedSquares?.[targetRow]?.[targetCol]) {
      setDraggedSquare(null);
      setDragOverSquare(null);
      return;
    }

    // Don't allow dropping on same square
    if (draggedSquare.row === targetRow && draggedSquare.col === targetCol) {
      setDraggedSquare(null);
      setDragOverSquare(null);
      return;
    }

    // Create new grid with swapped plants
    const newGrid = grid.map(row => [...row]);
    const draggedPlant = newGrid[draggedSquare.row][draggedSquare.col];
    const targetPlant = newGrid[targetRow][targetCol];

    newGrid[targetRow][targetCol] = draggedPlant;
    newGrid[draggedSquare.row][draggedSquare.col] = targetPlant;

    // Validate the new arrangement
    const validationResult = validateArrangement(newGrid);
    setValidation(validationResult);

    // Update the arrangement
    if (onArrangementChange) {
      onArrangementChange({
        ...arrangement,
        grid: newGrid
      });
    }

    setDraggedSquare(null);
    setDragOverSquare(null);
  };

  if (!grid.length || !width || !height) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-center text-gray-500">No arrangement to display</p>
      </div>
    );
  }

  const cellSize = width > 10 || height > 10 ? 'w-8 h-8 text-xs' : 'w-12 h-12 text-sm';

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Garden Layout ({width}×{height})
          </h3>
          <div
            className="inline-grid gap-1 p-2 bg-amber-50 rounded-lg border border-amber-200"
            style={{
              gridTemplateColumns: `repeat(${width}, minmax(0, 1fr))`
            }}
          >
            {grid.map((row, rowIndex) =>
              row.map((plantId, colIndex) => {
                const isLocked = lockedSquares?.[rowIndex]?.[colIndex];
                const isDragging = draggedSquare?.row === rowIndex && draggedSquare?.col === colIndex;
                const isDragOver = dragOverSquare?.row === rowIndex && dragOverSquare?.col === colIndex;
                const bgColor = plantId ? getPlantColor(plantId) : '#f5f5f4';
                const textColor = plantId ? getContrastColor(bgColor) : '#9ca3af';
                const plant = plantId ? getPlantById(plantId) : null;

                const displayName = plant ? plant.name : (plantId || 'Empty');
                const displayInitial = plant ? plant.name.charAt(0).toUpperCase() : (plantId ? plantId.charAt(0).toUpperCase() : '');

                // Get companion/enemy status for visual tints
                const companionStatus = getSquareCompanionStatus(grid, rowIndex, colIndex);

                // Build tooltip with companion/enemy information
                let tooltip = `${displayName} (${rowIndex}, ${colIndex})`;
                if (companionStatus.companions.length > 0) {
                  tooltip += `\nCompanions: ${companionStatus.companions.join(', ')}`;
                }
                if (companionStatus.enemies.length > 0) {
                  tooltip += `\nWarning: near ${companionStatus.enemies.join(', ')} (incompatible)`;
                }

                // Determine box shadow for companion/enemy tint (enemy takes precedence)
                let boxShadow = 'none';
                if (companionStatus.hasEnemy) {
                  boxShadow = 'inset 0 0 0 100px rgba(239, 68, 68, 0.35)';
                } else if (companionStatus.hasCompanion) {
                  boxShadow = 'inset 0 0 0 100px rgba(34, 197, 94, 0.25)';
                }

                return (
                  <button
                    key={`${rowIndex}-${colIndex}`}
                    onClick={() => handleSquareClick(rowIndex, colIndex, plantId)}
                    draggable={editable && plantId && !isLocked}
                    onDragStart={() => handleDragStart(rowIndex, colIndex, plantId)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => handleDragOver(e, rowIndex, colIndex)}
                    onDrop={(e) => handleDrop(e, rowIndex, colIndex)}
                    className={`${cellSize} rounded flex items-center justify-center font-medium transition-transform hover:scale-105 relative ${
                      isLocked ? 'ring-2 ring-gray-400' : ''
                    } ${isDragging ? 'opacity-50' : ''} ${isDragOver ? 'ring-2 ring-blue-400' : ''} ${editable && plantId && !isLocked ? 'cursor-move' : ''}`}
                    style={{ backgroundColor: bgColor, color: textColor, boxShadow }}
                    title={tooltip}
                  >
                    {displayInitial}
                    {isLocked && (
                      <span className="absolute -top-1 -right-1 text-xs">🔒</span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {legendPlants.length > 0 && (
          <div className="lg:w-48">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Legend</h3>
            <div className="space-y-2">
              {legendPlants.map(({ id, name, color, count }) => (
                <div key={id} className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded flex items-center justify-center text-xs font-medium"
                    style={{ backgroundColor: color, color: getContrastColor(color) }}
                  >
                    {name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-gray-700 flex-1">{name}</span>
                  <span className="text-xs text-gray-500">×{count}</span>
                </div>
              ))}
            </div>

            {/* Companion Planting Legend */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Companion Indicators</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded border border-gray-300"
                    style={{ backgroundColor: '#d1d5db', boxShadow: 'inset 0 0 0 100px rgba(34, 197, 94, 0.25)' }}
                    aria-hidden="true"
                  />
                  <span className="text-xs text-gray-600">Good companion nearby</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded border border-gray-300"
                    style={{ backgroundColor: '#d1d5db', boxShadow: 'inset 0 0 0 100px rgba(239, 68, 68, 0.35)' }}
                    aria-hidden="true"
                  />
                  <span className="text-xs text-gray-600">Incompatible plant nearby</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {validation && validation.violations.length > 0 && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-2 mb-2">
            <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="font-semibold text-red-800 mb-1">Enemy Adjacency Warning</h4>
              <p className="text-sm text-red-700 mb-2">
                The following plants are adjacent to their enemies and should be separated:
              </p>
              <ul className="space-y-1">
                {validation.violations.map((v, index) => {
                  const plant = getPlantById(v.plantId);
                  const enemy = getPlantById(v.enemyPlantId);
                  return (
                    <li key={index} className="text-sm text-red-700">
                      {plant?.name || v.plantId} at ({v.row}, {v.col}) is next to {enemy?.name || v.enemyPlantId}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      )}

      {validation && validation.valid && editable && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-green-700 font-medium">
              All plants are correctly placed with no enemy adjacencies
            </p>
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <span>
            <strong>Filled:</strong> {Object.values(plantCounts).reduce((a, b) => a + b, 0)} / {width * height} squares
          </span>
          <span>
            <strong>Plants:</strong> {legendPlants.length} types
          </span>
        </div>
      </div>
    </div>
  );
}

PlanningGrid.propTypes = {
  arrangement: PropTypes.shape({
    grid: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)),
    placements: PropTypes.arrayOf(PropTypes.shape({
      plantId: PropTypes.string.isRequired,
      row: PropTypes.number.isRequired,
      col: PropTypes.number.isRequired
    })),
    success: PropTypes.bool
  }),
  bed: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired
  }),
  onSquareClick: PropTypes.func,
  lockedSquares: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.bool)),
  onArrangementChange: PropTypes.func,
  editable: PropTypes.bool
};

export default PlanningGrid;
