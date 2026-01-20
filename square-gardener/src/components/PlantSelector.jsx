import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { plantLibrary, getPlantById } from '../data/plantLibrary';

function PlantSelector({ availableSpace, onSelectionChange, initialSelections }) {
  const [selections, setSelections] = useState(() => {
    if (initialSelections) {
      return initialSelections;
    }
    return {};
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [seasonFilter, setSeasonFilter] = useState('all');

  const filteredPlants = useMemo(() => {
    return plantLibrary.filter(plant => {
      const matchesSearch = plant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plant.scientificName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSeason = seasonFilter === 'all' ||
        plant.plantingSeason.includes(seasonFilter);

      return matchesSearch && matchesSeason;
    });
  }, [searchTerm, seasonFilter]);

  const spaceCalculation = useMemo(() => {
    let totalRequired = 0;
    const selectedPlants = [];

    for (const [plantId, quantity] of Object.entries(selections)) {
      if (quantity > 0) {
        const plant = getPlantById(plantId);
        if (plant) {
          const spaceNeeded = quantity * plant.squaresPerPlant;
          totalRequired += spaceNeeded;
          selectedPlants.push({
            plantId,
            name: plant.name,
            quantity,
            spaceNeeded
          });
        }
      }
    }

    return {
      required: Math.round(totalRequired * 100) / 100,
      available: availableSpace,
      remaining: Math.round((availableSpace - totalRequired) * 100) / 100,
      isOverCapacity: totalRequired > availableSpace,
      selectedPlants
    };
  }, [selections, availableSpace]);

  const handleQuantityChange = (plantId, quantity) => {
    const newQuantity = Math.max(0, parseInt(quantity, 10) || 0);
    const newSelections = { ...selections };

    if (newQuantity === 0) {
      delete newSelections[plantId];
    } else {
      newSelections[plantId] = newQuantity;
    }

    setSelections(newSelections);

    if (onSelectionChange) {
      const selectionArray = Object.entries(newSelections).map(([id, qty]) => ({
        plantId: id,
        quantity: qty
      }));
      onSelectionChange(selectionArray);
    }
  };

  const handleAddSelection = (plantId) => {
    handleQuantityChange(plantId, 1);
  };

  const getCapacityBarColor = () => {
    const percentage = (spaceCalculation.required / availableSpace) * 100;
    if (spaceCalculation.isOverCapacity) return 'bg-red-500';
    if (percentage > 90) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getSunIcon = (requirement) => {
    if (requirement === 'partial') return '⛅';
    return '☀️'; // full or any other value
  };

  const getSpaceDisplay = (squaresPerPlant) => {
    if (squaresPerPlant >= 1) {
      return `${squaresPerPlant} sq ft`;
    }
    const plantsPerSquare = Math.round(1 / squaresPerPlant);
    return `${plantsPerSquare}/sq ft`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Select Plants for Your Plan</h2>

      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Space Required</span>
          <span className={`text-sm font-semibold ${spaceCalculation.isOverCapacity ? 'text-red-600' : 'text-gray-700'}`}>
            {spaceCalculation.required} / {availableSpace} sq ft
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all ${getCapacityBarColor()}`}
            style={{ width: `${Math.min((spaceCalculation.required / availableSpace) * 100, 100)}%` }}
          />
        </div>
        {spaceCalculation.isOverCapacity && (
          <p className="mt-2 text-sm text-red-600">
            Over capacity by {Math.abs(spaceCalculation.remaining)} sq ft. Reduce plant quantities to generate a plan.
          </p>
        )}
        {!spaceCalculation.isOverCapacity && spaceCalculation.remaining > 0 && (
          <p className="mt-2 text-sm text-gray-600">
            {spaceCalculation.remaining} sq ft remaining
          </p>
        )}
      </div>

      {spaceCalculation.selectedPlants.length > 0 && (
        <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Selected Plants ({spaceCalculation.selectedPlants.length})</h3>
          <div className="flex flex-wrap gap-2">
            {spaceCalculation.selectedPlants.map(({ plantId, name, quantity, spaceNeeded }) => (
              <span
                key={plantId}
                className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-full text-sm border border-primary/30"
              >
                <span className="font-medium">{name}</span>
                <span className="text-gray-500">×{quantity}</span>
                <span className="text-xs text-gray-400">({spaceNeeded} sq ft)</span>
                <button
                  onClick={() => handleQuantityChange(plantId, 0)}
                  className="ml-1 text-gray-400 hover:text-red-500"
                  aria-label={`Remove ${name}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="text"
          placeholder="Search plants..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
        />
        <select
          value={seasonFilter}
          onChange={(e) => setSeasonFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
        >
          <option value="all">All Seasons</option>
          <option value="spring">Spring</option>
          <option value="summer">Summer</option>
          <option value="fall">Fall</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
        {filteredPlants.map(plant => {
          const isSelected = selections[plant.id] > 0;
          const quantity = selections[plant.id] || 0;

          return (
            <div
              key={plant.id}
              className={`p-3 rounded-lg border transition-all cursor-pointer ${
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => !isSelected && handleAddSelection(plant.id)}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium text-gray-800">{plant.name}</h3>
                  <p className="text-xs text-gray-500 italic">{plant.scientificName}</p>
                </div>
                <span title={plant.sunRequirement}>{getSunIcon(plant.sunRequirement)}</span>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>{getSpaceDisplay(plant.squaresPerPlant)}</span>
                <span className="text-xs">
                  {plant.plantingSeason.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ')}
                </span>
              </div>

              {isSelected && (
                <div className="flex items-center gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
                  <label htmlFor={`quantity-${plant.id}`} className="text-sm text-gray-600">
                    Qty:
                  </label>
                  <input
                    id={`quantity-${plant.id}`}
                    type="number"
                    min="0"
                    value={quantity}
                    onChange={(e) => handleQuantityChange(plant.id, e.target.value)}
                    className="w-16 px-2 py-1 text-center border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                  <span className="text-xs text-gray-500">
                    = {Math.round(quantity * plant.squaresPerPlant * 100) / 100} sq ft
                  </span>
                </div>
              )}

              {!isSelected && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddSelection(plant.id);
                  }}
                  className="w-full mt-2 px-3 py-1 text-sm bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors"
                >
                  + Add
                </button>
              )}
            </div>
          );
        })}
      </div>

      {filteredPlants.length === 0 && (
        <p className="text-center text-gray-500 py-8">
          No plants found matching your criteria.
        </p>
      )}
    </div>
  );
}

PlantSelector.propTypes = {
  availableSpace: PropTypes.number.isRequired,
  onSelectionChange: PropTypes.func,
  initialSelections: PropTypes.objectOf(PropTypes.number)
};

export default PlantSelector;
