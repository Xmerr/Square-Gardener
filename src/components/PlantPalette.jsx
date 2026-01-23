import { useState } from 'react';
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

function PlantPalette({ plantIds }) {
  const [draggedPlant, setDraggedPlant] = useState(null);

  const handleDragStart = (e, plantId) => {
    setDraggedPlant(plantId);
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('plant-id', plantId);
  };

  const handleDragEnd = () => {
    setDraggedPlant(null);
  };

  if (!plantIds || plantIds.length === 0) {
    return null;
  }

  const plants = plantIds
    .map(id => {
      const plant = getPlantById(id);
      return plant ? { id, name: plant.name } : null;
    })
    .filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Plant Palette</h3>
      <p className="text-sm text-gray-600 mb-3">Drag plants onto the grid to replace existing placements</p>
      <div className="space-y-2">
        {plants.map(({ id, name }) => {
          const bgColor = getPlantColor(id);
          const textColor = getContrastColor(bgColor);
          const isDragging = draggedPlant === id;

          return (
            <div
              key={id}
              draggable
              onDragStart={(e) => handleDragStart(e, id)}
              onDragEnd={handleDragEnd}
              className={`flex items-center gap-2 p-2 rounded-lg cursor-move transition-opacity ${
                isDragging ? 'opacity-50' : 'opacity-100'
              }`}
              style={{ backgroundColor: bgColor }}
              data-plant-id={id}
            >
              <div
                className="w-8 h-8 rounded flex items-center justify-center text-sm font-medium flex-shrink-0"
                style={{ backgroundColor: bgColor, color: textColor }}
              >
                {name.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium" style={{ color: textColor }}>
                {name}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-600 space-y-1">
          <p>Drag a plant onto a grid square to replace it</p>
          <p>Drop on empty squares to fill them</p>
        </div>
      </div>
    </div>
  );
}

PlantPalette.propTypes = {
  plantIds: PropTypes.arrayOf(PropTypes.string).isRequired
};

export default PlantPalette;
