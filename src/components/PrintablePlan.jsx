import PropTypes from 'prop-types';
import { getPlantById } from '../data/plantLibrary';
import { formatDate } from '../utils/plantingSchedule';

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

function PrintablePlan({ arrangement, bed, plantSelections, schedule, frostDates }) {
  if (!arrangement || !bed || !plantSelections || plantSelections.length === 0) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <p className="text-center text-gray-500">No plan to print</p>
      </div>
    );
  }

  const grid = arrangement.grid || [];
  const width = bed.width || 0;
  const height = bed.height || 0;

  const plantCounts = {};
  for (const row of grid) {
    for (const plantId of row) {
      if (plantId) {
        plantCounts[plantId] = (plantCounts[plantId] || 0) + 1;
      }
    }
  }

  const legendPlants = Object.keys(plantCounts).map(plantId => {
    const plant = getPlantById(plantId);
    return {
      id: plantId,
      name: plant?.name || plantId,
      color: getPlantColor(plantId),
      count: plantCounts[plantId],
      companionPlants: plant?.companionPlants || [],
      avoidPlants: plant?.avoidPlants || []
    };
  }).sort((a, b) => a.name.localeCompare(b.name));

  const plantSummary = plantSelections.map(selection => {
    const plant = getPlantById(selection.plantId);
    return {
      ...selection,
      name: plant?.name || selection.plantId,
      spaceNeeded: selection.quantity * (plant?.squaresPerPlant || 1)
    };
  });

  const companionRelationships = [];
  const stats = arrangement.stats || {
    companionAdjacencies: 0,
    filledSquares: arrangement.placements?.length || 0,
    totalSquares: width * height
  };

  legendPlants.forEach(plant1 => {
    legendPlants.forEach(plant2 => {
      if (plant1.id !== plant2.id && plant1.companionPlants.includes(plant2.id)) {
        const relationship = `${plant1.name} + ${plant2.name}`;
        const reverse = `${plant2.name} + ${plant1.name}`;
        if (!companionRelationships.includes(relationship) && !companionRelationships.includes(reverse)) {
          companionRelationships.push(relationship);
        }
      }
    });
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="printable-plan">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-plan, .printable-plan * {
            visibility: visible;
          }
          .printable-plan {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white;
          }
          .no-print {
            display: none !important;
          }
          .page-break {
            page-break-before: always;
          }
        }
      `}</style>

      <div className="p-8 max-w-4xl mx-auto bg-white">
        <div className="no-print mb-4">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors"
          >
            Print Plan
          </button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Garden Plan: {bed.name}</h1>
          <p className="text-gray-600">Bed Size: {width}×{height} ft ({width * height} sq ft)</p>
          {frostDates && frostDates.lastSpringFrost && frostDates.firstFallFrost && (
            <p className="text-sm text-gray-500 mt-1">
              Frost Dates: {formatDate(frostDates.lastSpringFrost)} - {formatDate(frostDates.firstFallFrost)}
            </p>
          )}
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Grid Layout</h2>
          <div
            className="inline-grid gap-0.5 p-2 bg-gray-100 border-2 border-gray-800"
            style={{
              gridTemplateColumns: `repeat(${width}, minmax(0, 1fr))`
            }}
          >
            {grid.map((row, rowIndex) =>
              row.map((plantId, colIndex) => {
                const bgColor = plantId ? getPlantColor(plantId) : '#ffffff';
                const textColor = plantId ? getContrastColor(bgColor) : '#9ca3af';
                const plant = plantId ? getPlantById(plantId) : null;
                const displayInitial = plant ? plant.name.charAt(0).toUpperCase() : '';

                return (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className="w-12 h-12 flex items-center justify-center font-bold text-base border border-gray-300"
                    style={{ backgroundColor: bgColor, color: textColor }}
                  >
                    {displayInitial}
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Plant Legend</h2>
          <div className="grid grid-cols-2 gap-3">
            {legendPlants.map(({ id, name, color, count }) => (
              <div key={id} className="flex items-center gap-2 p-2 border border-gray-200 rounded">
                <div
                  className="w-8 h-8 rounded flex items-center justify-center text-sm font-bold border border-gray-300"
                  style={{ backgroundColor: color, color: getContrastColor(color) }}
                >
                  {name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-900">{name}</span>
                  <span className="text-xs text-gray-500 ml-2">({count} squares)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {schedule && schedule.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Planting Schedule</h2>
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">Plant</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Season</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Planting Window</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((item) => (
                  <tr key={item.plantId}>
                    <td className="border border-gray-300 px-4 py-2">{item.plantName}</td>
                    <td className="border border-gray-300 px-4 py-2 capitalize">{item.season}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      {formatDate(item.plantingWindow.start)} - {formatDate(item.plantingWindow.end)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Plan Summary</h2>
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 border border-gray-200 rounded">
              <p className="text-sm"><strong>Total Plants:</strong> {legendPlants.length} types</p>
              <p className="text-sm"><strong>Space Used:</strong> {stats.filledSquares} of {stats.totalSquares} squares ({Math.round((stats.filledSquares / stats.totalSquares) * 100)}%)</p>
              {stats.companionAdjacencies > 0 && (
                <p className="text-sm"><strong>Companion Adjacencies:</strong> {stats.companionAdjacencies}</p>
              )}
            </div>

            {companionRelationships.length > 0 && (
              <div className="p-3 bg-green-50 border border-green-200 rounded">
                <p className="text-sm font-semibold mb-2">Companion Relationships:</p>
                <ul className="text-sm space-y-1">
                  {companionRelationships.map((relationship, idx) => (
                    <li key={idx}>• {relationship}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Plant Notes</h2>
          <div className="space-y-3">
            {plantSummary.map(({ plantId, name, quantity, spaceNeeded }) => {
              const plant = getPlantById(plantId);
              return (
                <div key={plantId} className="p-3 border border-gray-200 rounded">
                  <h3 className="font-semibold text-gray-900">{name}</h3>
                  <div className="text-sm text-gray-600 mt-1 space-y-1">
                    <p><strong>Quantity:</strong> {quantity} plants</p>
                    <p><strong>Space Required:</strong> {spaceNeeded} sq ft</p>
                    {plant?.companionPlants && plant.companionPlants.length > 0 && (
                      <p>
                        <strong>Companions:</strong>{' '}
                        {plant.companionPlants.map(id => {
                          const companion = getPlantById(id);
                          return companion?.name || id;
                        }).join(', ')}
                      </p>
                    )}
                    {plant?.avoidPlants && plant.avoidPlants.length > 0 && (
                      <p>
                        <strong>Avoid:</strong>{' '}
                        {plant.avoidPlants.map(id => {
                          const avoid = getPlantById(id);
                          return avoid?.name || id;
                        }).join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-xs text-gray-400 text-center pt-4 border-t border-gray-200">
          Generated by Square Gardener - {new Date().toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}

PrintablePlan.propTypes = {
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
  schedule: PropTypes.arrayOf(
    PropTypes.shape({
      plantId: PropTypes.string.isRequired,
      plantName: PropTypes.string.isRequired,
      plantingWindow: PropTypes.shape({
        start: PropTypes.string.isRequired,
        end: PropTypes.string.isRequired
      }).isRequired,
      season: PropTypes.string.isRequired
    })
  ),
  frostDates: PropTypes.shape({
    lastSpringFrost: PropTypes.string,
    firstFallFrost: PropTypes.string,
    zipCode: PropTypes.string
  })
};

export default PrintablePlan;
