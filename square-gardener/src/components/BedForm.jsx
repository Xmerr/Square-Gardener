import { useState } from 'react';
import PropTypes from 'prop-types';
import { POT_SIZES } from '../utils/storage';

function BedForm({ bed, onSubmit, onCancel }) {
  const [name, setName] = useState(bed?.name || '');
  const [isPot, setIsPot] = useState(bed?.is_pot || false);
  const [width, setWidth] = useState(bed?.width?.toString() || '');
  const [height, setHeight] = useState(bed?.height?.toString() || '');
  const [size, setSize] = useState(bed?.size || 'medium');
  const [errors, setErrors] = useState({});

  const validateField = (fieldName, value) => {
    if (fieldName === 'name') {
      return value.trim() ? null : 'Name is required';
    }
    if (fieldName === 'width') {
      const widthNum = parseFloat(value);
      if (!value || isNaN(widthNum)) return 'Width is required';
      if (widthNum <= 0) return 'Width must be greater than 0';
      return null;
    }
    // fieldName === 'height'
    const heightNum = parseFloat(value);
    if (!value || isNaN(heightNum)) return 'Height is required';
    if (heightNum <= 0) return 'Height must be greater than 0';
    return null;
  };

  const validate = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!isPot) {
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
    }
    // Note: Pot size validation not needed since size always has valid default
    // and select only offers valid options from POT_SIZES

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      if (isPot) {
        onSubmit({
          name: name.trim(),
          is_pot: true,
          size
        });
      } else {
        onSubmit({
          name: name.trim(),
          is_pot: false,
          width: parseFloat(width),
          height: parseFloat(height)
        });
      }
    }
  };

  const isEditing = !!bed;
  const squareFootage = width && height && !isNaN(parseFloat(width)) && !isNaN(parseFloat(height))
    ? (parseFloat(width) * parseFloat(height)).toFixed(1)
    : '0';

  // Size always has valid default, so POT_SIZES[size] is always defined
  const potCapacity = POT_SIZES[size].capacity;

  // Determine the title and button text based on editing mode and type
  let title;
  let submitText;
  if (isEditing) {
    title = isPot ? 'Edit Pot' : 'Edit Bed';
    submitText = 'Save Changes';
  } else {
    title = isPot ? 'Create New Pot' : 'Create New Bed';
    submitText = isPot ? 'Create Pot' : 'Create Bed';
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">
        {title}
      </h2>

      <div>
        <label htmlFor="bed-name" className="block text-sm font-medium text-gray-700 mb-1">
          {isPot ? 'Pot Name' : 'Bed Name'}
        </label>
        <input
          id="bed-name"
          type="text"
          value={name}
          onChange={(e) => {
            const newValue = e.target.value;
            setName(newValue);
            if (errors.name) {
              const error = validateField('name', newValue);
              if (!error) {
                setErrors(prev => {
                  const next = { ...prev };
                  delete next.name;
                  return next;
                });
              }
            }
          }}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder={isPot ? 'e.g., Kitchen Window Aloe' : 'e.g., Main Vegetable Bed'}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-500">{errors.name}</p>
        )}
      </div>

      <div className="flex items-center">
        <input
          id="is-pot"
          type="checkbox"
          checked={isPot}
          onChange={(e) => {
            const newValue = e.target.checked;
            setIsPot(newValue);
            if (newValue && (errors.width || errors.height)) {
              setErrors(prev => {
                const next = { ...prev };
                delete next.width;
                delete next.height;
                return next;
              });
            }
          }}
          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
        />
        <label htmlFor="is-pot" className="ml-2 block text-sm text-gray-700">
          This is a pot
        </label>
      </div>

      {isPot ? (
        <div>
          <label htmlFor="pot-size" className="block text-sm font-medium text-gray-700 mb-1">
            Size
          </label>
          <select
            id="pot-size"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {Object.entries(POT_SIZES).map(([key, value]) => (
              <option key={key} value={key}>
                {value.label}
              </option>
            ))}
          </select>
        </div>
      ) : (
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
              onChange={(e) => {
                const newValue = e.target.value;
                setWidth(newValue);
                if (errors.width) {
                  const error = validateField('width', newValue);
                  if (!error) {
                    setErrors(prev => {
                      const next = { ...prev };
                      delete next.width;
                      return next;
                    });
                  }
                }
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.width ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., 4"
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
              onChange={(e) => {
                const newValue = e.target.value;
                setHeight(newValue);
                if (errors.height) {
                  const error = validateField('height', newValue);
                  if (!error) {
                    setErrors(prev => {
                      const next = { ...prev };
                      delete next.height;
                      return next;
                    });
                  }
                }
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.height ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., 4"
            />
            {errors.height && (
              <p className="mt-1 text-sm text-red-500">{errors.height}</p>
            )}
          </div>
        </div>
      )}

      <div className="bg-gray-50 p-3 rounded-lg">
        <p className="text-sm text-gray-600">
          {isPot ? (
            <>Capacity: <span className="font-semibold">{potCapacity} sq ft</span></>
          ) : (
            <>Total Area: <span className="font-semibold">{squareFootage} sq ft</span></>
          )}
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
          {submitText}
        </button>
      </div>
    </form>
  );
}

BedForm.propTypes = {
  bed: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    is_pot: PropTypes.bool,
    width: PropTypes.number,
    height: PropTypes.number,
    size: PropTypes.string
  }),
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
};

export default BedForm;
