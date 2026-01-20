import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { getPlantById } from '../data/plantLibrary';

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

function PlanningGrid({ arrangement, bed, onSquareClick, lockedSquares }) {
  const grid = useMemo(() => arrangement?.grid || [], [arrangement]);
  const width = bed?.width || 0;
  const height = bed?.height || 0;

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
                const bgColor = plantId ? getPlantColor(plantId) : '#f5f5f4';
                const textColor = plantId ? getContrastColor(bgColor) : '#9ca3af';
                const plant = plantId ? getPlantById(plantId) : null;

                const displayName = plant ? plant.name : (plantId || 'Empty');
                const displayInitial = plant ? plant.name.charAt(0).toUpperCase() : (plantId ? plantId.charAt(0).toUpperCase() : '');

                return (
                  <button
                    key={`${rowIndex}-${colIndex}`}
                    onClick={() => handleSquareClick(rowIndex, colIndex, plantId)}
                    className={`${cellSize} rounded flex items-center justify-center font-medium transition-transform hover:scale-105 relative ${
                      isLocked ? 'ring-2 ring-gray-400' : ''
                    }`}
                    style={{ backgroundColor: bgColor, color: textColor }}
                    title={`${displayName} (${rowIndex}, ${colIndex})`}
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
          </div>
        )}
      </div>

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
  lockedSquares: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.bool))
};

export default PlanningGrid;
