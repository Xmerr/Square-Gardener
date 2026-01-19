import { useState } from 'react';
import PropTypes from 'prop-types';

function BedForm({ bed, onSubmit, onCancel }) {
  const [name, setName] = useState(bed?.name || '');
  const [width, setWidth] = useState(bed?.width?.toString() || '');
  const [height, setHeight] = useState(bed?.height?.toString() || '');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    const widthNum = parseFloat(width);
    if (!width || isNaN(widthNum)) {
      newErrors.width = 'Width is required';
    } else if (widthNum <= 0) {
      newErrors.width = 'Width must be greater than 0';
    }

    const heightNum = parseFloat(height);
    if (!height || isNaN(heightNum)) {
      newErrors.height = 'Height is required';
    } else if (heightNum <= 0) {
      newErrors.height = 'Height must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        name: name.trim(),
        width: parseFloat(width),
        height: parseFloat(height)
      });
    }
  };

  const isEditing = !!bed;
  const squareFootage = width && height && !isNaN(parseFloat(width)) && !isNaN(parseFloat(height))
    ? (parseFloat(width) * parseFloat(height)).toFixed(1)
    : '0';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">
        {isEditing ? 'Edit Bed' : 'Create New Bed'}
      </h2>

      <div>
        <label htmlFor="bed-name" className="block text-sm font-medium text-gray-700 mb-1">
          Bed Name
        </label>
        <input
          id="bed-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="e.g., Main Vegetable Bed"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-500">{errors.name}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="bed-width" className="block text-sm font-medium text-gray-700 mb-1">
            Width (ft)
          </label>
          <input
            id="bed-width"
            type="number"
            step="0.5"
            value={width}
            onChange={(e) => setWidth(e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.width ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="4"
          />
          {errors.width && (
            <p className="mt-1 text-sm text-red-500">{errors.width}</p>
          )}
        </div>

        <div>
          <label htmlFor="bed-height" className="block text-sm font-medium text-gray-700 mb-1">
            Height (ft)
          </label>
          <input
            id="bed-height"
            type="number"
            step="0.5"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.height ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="4"
          />
          {errors.height && (
            <p className="mt-1 text-sm text-red-500">{errors.height}</p>
          )}
        </div>
      </div>

      <div className="bg-gray-50 p-3 rounded-lg">
        <p className="text-sm text-gray-600">
          Total Area: <span className="font-semibold">{squareFootage} sq ft</span>
        </p>
      </div>

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
          {isEditing ? 'Save Changes' : 'Create Bed'}
        </button>
      </div>
    </form>
  );
}

BedForm.propTypes = {
  bed: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    width: PropTypes.number,
    height: PropTypes.number
  }),
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
};

export default BedForm;
