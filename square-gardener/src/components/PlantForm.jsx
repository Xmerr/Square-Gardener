import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { plantLibrary, getPlantById } from '../data/plantLibrary';
import { getGardenBeds, getBedCapacity, getPlantDefaults, resolveEffectiveValue } from '../utils/storage';
import { calculateHarvestDate, formatHarvestDateDisplay } from '../utils/harvestDate';

function PlantForm({ mode, plant, onSubmit, onCancel }) {
  const isEditMode = mode === 'edit';
  const beds = getGardenBeds();

  // Initialize state based on mode
  const [plantId, setPlantId] = useState(plant?.plantId || '');
  const [bedId, setBedId] = useState(plant?.bedId || (beds.length > 0 ? beds[0].id : ''));
  const [variety, setVariety] = useState(plant?.variety || '');
  const [plantDate, setPlantDate] = useState(
    plant?.plantedDate
      ? new Date(plant.plantedDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
  );
  const [quantity, setQuantity] = useState(plant?.quantity?.toString() || '1');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [daysToMaturityOverride, setDaysToMaturityOverride] = useState(
    plant?.daysToMaturityOverride?.toString() || ''
  );
  const [spacePerPlantOverride, setSpacePerPlantOverride] = useState(
    plant?.spacePerPlantOverride?.toString() || ''
  );
  const [errors, setErrors] = useState({});

  // Get selected plant info from library
  const selectedPlant = useMemo(() => {
    return getPlantById(isEditMode ? plant?.plantId : plantId);
  }, [isEditMode, plant?.plantId, plantId]);

  // Get garden defaults for selected plant
  const gardenDefaults = useMemo(() => {
    const id = isEditMode ? plant?.plantId : plantId;
    return id ? getPlantDefaults(id) : null;
  }, [isEditMode, plant?.plantId, plantId]);

  // Calculate effective values for display placeholders
  const effectiveDaysToMaturity = useMemo(() => {
    if (!selectedPlant) return null;
    const id = isEditMode ? plant?.plantId : plantId;
    return resolveEffectiveValue(id, 'daysToMaturity', null);
  }, [selectedPlant, isEditMode, plant?.plantId, plantId]);

  const effectiveSpacePerPlant = useMemo(() => {
    if (!selectedPlant) return null;
    const id = isEditMode ? plant?.plantId : plantId;
    return resolveEffectiveValue(id, 'squaresPerPlant', null);
  }, [selectedPlant, isEditMode, plant?.plantId, plantId]);

  // Calculate harvest date preview
  const harvestDatePreview = useMemo(() => {
    if (!plantDate || !selectedPlant) return null;

    const daysOverride = daysToMaturityOverride ? parseInt(daysToMaturityOverride, 10) : null;
    const id = isEditMode ? plant?.plantId : plantId;
    const effectiveDays = resolveEffectiveValue(id, 'daysToMaturity', daysOverride);

    if (!effectiveDays) return null;

    const harvestDate = calculateHarvestDate(new Date(plantDate).toISOString(), effectiveDays);
    return formatHarvestDateDisplay(harvestDate, false);
  }, [plantDate, selectedPlant, daysToMaturityOverride, isEditMode, plant?.plantId, plantId]);

  // Get placeholder text for override fields
  const daysToMaturityPlaceholder = useMemo(() => {
    if (gardenDefaults?.daysToMaturity) {
      return `${gardenDefaults.daysToMaturity} (garden default)`;
    }
    if (selectedPlant?.daysToMaturity) {
      return `${selectedPlant.daysToMaturity} (library default)`;
    }
    return '';
  }, [gardenDefaults, selectedPlant]);

  const spacePerPlantPlaceholder = useMemo(() => {
    if (gardenDefaults?.squaresPerPlant) {
      return `${gardenDefaults.squaresPerPlant} (garden default)`;
    }
    if (selectedPlant?.squaresPerPlant) {
      return `${selectedPlant.squaresPerPlant} (library default)`;
    }
    return '';
  }, [gardenDefaults, selectedPlant]);

  // Compute bed capacities for display
  const bedCapacities = useMemo(() => {
    const capacities = {};
    beds.forEach(bed => {
      capacities[bed.id] = getBedCapacity(bed.id);
    });
    return capacities;
  }, [beds]);

  const validate = () => {
    const newErrors = {};

    if (!isEditMode && !plantId) {
      newErrors.plantId = 'Please select a plant';
    }

    if (!bedId) {
      newErrors.bedId = 'Please select a bed';
    }

    const quantityNum = parseInt(quantity, 10);
    if (!quantity || isNaN(quantityNum)) {
      newErrors.quantity = 'Quantity is required';
    } else if (quantityNum <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }

    if (!plantDate) {
      newErrors.plantDate = 'Plant date is required';
    }

    if (daysToMaturityOverride) {
      const daysNum = parseInt(daysToMaturityOverride, 10);
      if (isNaN(daysNum) || daysNum <= 0) {
        newErrors.daysToMaturityOverride = 'Must be a positive number';
      }
    }

    if (spacePerPlantOverride) {
      const spaceNum = parseFloat(spacePerPlantOverride);
      if (isNaN(spaceNum) || spaceNum <= 0) {
        newErrors.spacePerPlantOverride = 'Must be a positive number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const formData = {
        bedId,
        variety: variety.trim() || null,
        plantedDate: new Date(plantDate).toISOString(),
        quantity: parseInt(quantity, 10),
        daysToMaturityOverride: daysToMaturityOverride ? parseInt(daysToMaturityOverride, 10) : null,
        spacePerPlantOverride: spacePerPlantOverride ? parseFloat(spacePerPlantOverride) : null
      };

      if (!isEditMode) {
        formData.plantId = plantId;
      }

      onSubmit(formData);
    }
  };

  const toggleAdvanced = () => {
    setShowAdvanced(!showAdvanced);
  };

  const title = isEditMode ? 'Edit Plant' : 'Add Plant';
  const submitText = isEditMode ? 'Save Changes' : 'Add Plant';

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <h2 className="text-xl font-semibold text-gray-800">{title}</h2>

      {/* Plant Type - only shown in add mode */}
      {!isEditMode && (
        <div>
          <label htmlFor="plant-type" className="block text-sm font-medium text-gray-700 mb-1">
            Plant Type
          </label>
          <select
            id="plant-type"
            value={plantId}
            onChange={(e) => setPlantId(e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.plantId ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select a plant...</option>
            {plantLibrary.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          {errors.plantId && (
            <p className="mt-1 text-sm text-red-500">{errors.plantId}</p>
          )}
        </div>
      )}

      {/* Show plant name in edit mode */}
      {isEditMode && selectedPlant && (
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-sm text-gray-600">Plant Type</p>
          <p className="font-medium text-gray-800">{selectedPlant.name}</p>
        </div>
      )}

      {/* Bed Selection */}
      <div>
        <label htmlFor="bed-select" className="block text-sm font-medium text-gray-700 mb-1">
          Bed
        </label>
        {beds.length === 0 ? (
          <p className="text-sm text-gray-500">No beds available. Create a bed first.</p>
        ) : (
          <select
            id="bed-select"
            value={bedId}
            onChange={(e) => setBedId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {beds.map((bed) => {
              const capacity = bedCapacities[bed.id];
              return (
                <option key={bed.id} value={bed.id}>
                  {bed.name} ({capacity.used}/{capacity.total} sq ft)
                </option>
              );
            })}
          </select>
        )}
      </div>

      {/* Variety */}
      <div>
        <label htmlFor="variety" className="block text-sm font-medium text-gray-700 mb-1">
          Variety (optional)
        </label>
        <input
          id="variety"
          type="text"
          value={variety}
          onChange={(e) => setVariety(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="e.g., Roma, Cherry, Beefsteak"
        />
      </div>

      {/* Plant Date */}
      <div>
        <label htmlFor="plant-date" className="block text-sm font-medium text-gray-700 mb-1">
          Plant Date
        </label>
        <input
          id="plant-date"
          type="date"
          value={plantDate}
          onChange={(e) => setPlantDate(e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
            errors.plantDate ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.plantDate && (
          <p className="mt-1 text-sm text-red-500">{errors.plantDate}</p>
        )}
      </div>

      {/* Quantity */}
      <div>
        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
          Quantity
        </label>
        <input
          id="quantity"
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
            errors.quantity ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.quantity && (
          <p className="mt-1 text-sm text-red-500">{errors.quantity}</p>
        )}
      </div>

      {/* Harvest Date Preview */}
      {harvestDatePreview && (
        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
          <p className="text-sm text-green-800">
            <span className="font-medium">Harvest Date Preview:</span> {harvestDatePreview}
          </p>
        </div>
      )}

      {/* Advanced Section Toggle */}
      <button
        type="button"
        onClick={toggleAdvanced}
        className="flex items-center gap-2 text-sm text-primary hover:text-primary-light transition-colors"
        aria-expanded={showAdvanced}
      >
        <svg
          className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-90' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        Advanced Options
      </button>

      {/* Advanced Section */}
      {showAdvanced && (
        <div className="space-y-4 pl-4 border-l-2 border-gray-200">
          <div>
            <label htmlFor="days-to-maturity" className="block text-sm font-medium text-gray-700 mb-1">
              Days to Maturity Override
            </label>
            <input
              id="days-to-maturity"
              type="number"
              min="1"
              value={daysToMaturityOverride}
              onChange={(e) => setDaysToMaturityOverride(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.daysToMaturityOverride ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={daysToMaturityPlaceholder}
            />
            {errors.daysToMaturityOverride && (
              <p className="mt-1 text-sm text-red-500">{errors.daysToMaturityOverride}</p>
            )}
            {effectiveDaysToMaturity && !daysToMaturityOverride && (
              <p className="mt-1 text-xs text-gray-500">
                Using: {effectiveDaysToMaturity} days
              </p>
            )}
          </div>

          <div>
            <label htmlFor="space-per-plant" className="block text-sm font-medium text-gray-700 mb-1">
              Space per Plant Override (sq ft)
            </label>
            <input
              id="space-per-plant"
              type="number"
              min="0.01"
              step="0.01"
              value={spacePerPlantOverride}
              onChange={(e) => setSpacePerPlantOverride(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.spacePerPlantOverride ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={spacePerPlantPlaceholder}
            />
            {errors.spacePerPlantOverride && (
              <p className="mt-1 text-sm text-red-500">{errors.spacePerPlantOverride}</p>
            )}
            {effectiveSpacePerPlant && !spacePerPlantOverride && (
              <p className="mt-1 text-xs text-gray-500">
                Using: {effectiveSpacePerPlant} sq ft per plant
              </p>
            )}
          </div>
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors"
        >
          {submitText}
        </button>
      </div>
    </form>
  );
}

PlantForm.propTypes = {
  mode: PropTypes.oneOf(['add', 'edit']).isRequired,
  plant: PropTypes.shape({
    id: PropTypes.string,
    plantId: PropTypes.string,
    bedId: PropTypes.string,
    variety: PropTypes.string,
    plantedDate: PropTypes.string,
    quantity: PropTypes.number,
    daysToMaturityOverride: PropTypes.number,
    spacePerPlantOverride: PropTypes.number
  }),
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
};

export default PlantForm;
