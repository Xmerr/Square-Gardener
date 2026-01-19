import PropTypes from 'prop-types';

const MAX_VISUAL_SIZE = 10;

function BedGridPreview({ width, height, plants, plantLibrary }) {
  const getPlantColor = (plantId) => {
    const colorMap = {
      'tomato': 'bg-red-400',
      'lettuce': 'bg-green-300',
      'carrot': 'bg-orange-400',
      'basil': 'bg-green-500',
      'pepper': 'bg-yellow-400',
      'cucumber': 'bg-green-400',
      'bean': 'bg-green-600',
      'spinach': 'bg-green-200',
      'radish': 'bg-pink-400',
      'onion': 'bg-purple-300'
    };
    return colorMap[plantId] || 'bg-gray-400';
  };

  const getPlantEmoji = (plantId) => {
    const emojiMap = {
      'tomato': '🍅',
      'lettuce': '🥬',
      'carrot': '🥕',
      'pepper': '🌶️',
      'cucumber': '🥒'
    };
    return emojiMap[plantId] || '🌱';
  };

  const visualWidth = Math.min(width, MAX_VISUAL_SIZE);
  const visualHeight = Math.min(height, MAX_VISUAL_SIZE);
  const isScaled = width > MAX_VISUAL_SIZE || height > MAX_VISUAL_SIZE;

  const buildGridData = () => {
    const grid = Array(Math.ceil(visualHeight)).fill(null).map(() =>
      Array(Math.ceil(visualWidth)).fill(null)
    );

    let squareIndex = 0;
    const totalSquares = Math.ceil(visualWidth) * Math.ceil(visualHeight);

    for (const gardenPlant of plants) {
      const plantInfo = plantLibrary.find(p => p.id === gardenPlant.plantId);
      if (!plantInfo) continue;

      const squaresNeeded = Math.ceil((gardenPlant.quantity || 1) * plantInfo.squaresPerPlant);

      for (let i = 0; i < squaresNeeded && squareIndex < totalSquares; i++) {
        const row = Math.floor(squareIndex / Math.ceil(visualWidth));
        const col = squareIndex % Math.ceil(visualWidth);
        grid[row][col] = gardenPlant.plantId;
        squareIndex++;
      }
    }

    return grid;
  };

  const grid = buildGridData();
  const cellSize = visualWidth > 6 ? 'w-4 h-4' : 'w-6 h-6';
  const fontSize = visualWidth > 6 ? 'text-xs' : 'text-sm';

  if (plants.length === 0) {
    return (
      <div className="bg-gray-100 rounded-lg p-3 text-center">
        <p className="text-gray-400 text-sm">No plants yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div
        className="inline-grid gap-0.5 bg-gray-200 p-1 rounded"
        style={{ gridTemplateColumns: `repeat(${Math.ceil(visualWidth)}, minmax(0, 1fr))` }}
      >
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`${cellSize} ${fontSize} rounded-sm flex items-center justify-center ${
                cell ? getPlantColor(cell) : 'bg-white'
              }`}
              title={cell ? cell : 'Empty'}
            >
              {cell && <span>{getPlantEmoji(cell)}</span>}
            </div>
          ))
        )}
      </div>
      {isScaled && (
        <p className="text-xs text-gray-400">
          Showing {visualWidth}×{visualHeight} of {width}×{height}
        </p>
      )}
    </div>
  );
}

BedGridPreview.propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  plants: PropTypes.arrayOf(
    PropTypes.shape({
      plantId: PropTypes.string.isRequired,
      quantity: PropTypes.number
    })
  ).isRequired,
  plantLibrary: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      squaresPerPlant: PropTypes.number.isRequired
    })
  ).isRequired
};

export default BedGridPreview;
