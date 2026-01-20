import { useState } from 'react';
import PropTypes from 'prop-types';
import { getFrostDates, saveFrostDates } from '../utils/frostDateStorage';
import { lookupFrostDates, isZipCodeSupported } from '../utils/frostDateLookup';

const getInitialState = (initialFrostDates) => {
  const frostDates = initialFrostDates || getFrostDates();
  return {
    lastSpringFrost: frostDates.lastSpringFrost || '',
    firstFallFrost: frostDates.firstFallFrost || '',
    zipCode: frostDates.zipCode || ''
  };
};

function FrostDateForm({ onSave, initialFrostDates }) {
  const initialState = getInitialState(initialFrostDates);
  const [lastSpringFrost, setLastSpringFrost] = useState(initialState.lastSpringFrost);
  const [firstFallFrost, setFirstFallFrost] = useState(initialState.firstFallFrost);
  const [zipCode, setZipCode] = useState(initialState.zipCode);
  const [errors, setErrors] = useState({});
  const [lookupMessage, setLookupMessage] = useState('');

  const validateDates = () => {
    const newErrors = {};

    if (!lastSpringFrost) {
      newErrors.lastSpringFrost = 'Last spring frost date is required';
    }

    if (!firstFallFrost) {
      newErrors.firstFallFrost = 'First fall frost date is required';
    }

    if (lastSpringFrost && firstFallFrost) {
      const springDate = new Date(lastSpringFrost);
      const fallDate = new Date(firstFallFrost);
      if (springDate >= fallDate) {
        newErrors.firstFallFrost = 'Fall frost must be after spring frost';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleZipLookup = () => {
    setLookupMessage('');

    if (!zipCode || zipCode.trim().length < 3) {
      setLookupMessage('Enter at least 3 digits of your ZIP code');
      return;
    }

    const frostDates = lookupFrostDates(zipCode);
    if (frostDates) {
      setLastSpringFrost(frostDates.lastSpringFrost);
      setFirstFallFrost(frostDates.firstFallFrost);
      setLookupMessage('Frost dates found for your area!');
      setErrors({});
    } else {
      setLookupMessage('ZIP code not found. Please enter dates manually.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateDates()) {
      return;
    }

    const frostDates = {
      lastSpringFrost,
      firstFallFrost,
      zipCode: zipCode || null
    };

    saveFrostDates(frostDates);

    if (onSave) {
      onSave(frostDates);
    }
  };

  const handleClear = () => {
    setLastSpringFrost('');
    setFirstFallFrost('');
    setZipCode('');
    setErrors({});
    setLookupMessage('');
    saveFrostDates({
      lastSpringFrost: null,
      firstFallFrost: null,
      zipCode: null
    });
    if (onSave) {
      onSave(null);
    }
  };

  const hasCurrentDates = lastSpringFrost && firstFallFrost;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Frost Date Settings</h2>

      {hasCurrentDates && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            <span className="font-medium">Current frost dates:</span>
            <br />
            Last Spring Frost: {new Date(lastSpringFrost + 'T00:00:00').toLocaleDateString()}
            <br />
            First Fall Frost: {new Date(firstFallFrost + 'T00:00:00').toLocaleDateString()}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="zip-code" className="block text-sm font-medium text-gray-700 mb-1">
            ZIP Code (optional)
          </label>
          <div className="flex gap-2">
            <input
              id="zip-code"
              type="text"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              placeholder="Enter ZIP code"
              maxLength={5}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            />
            <button
              type="button"
              onClick={handleZipLookup}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Look Up
            </button>
          </div>
          {lookupMessage && (
            <p className={`mt-1 text-sm ${isZipCodeSupported(zipCode) ? 'text-green-600' : 'text-amber-600'}`}>
              {lookupMessage}
            </p>
          )}
        </div>

        <div className="border-t border-gray-200 pt-4">
          <p className="text-sm text-gray-600 mb-3">Or enter dates manually:</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="last-spring-frost" className="block text-sm font-medium text-gray-700 mb-1">
                Last Spring Frost
              </label>
              <input
                id="last-spring-frost"
                type="date"
                value={lastSpringFrost}
                onChange={(e) => setLastSpringFrost(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
                  errors.lastSpringFrost ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.lastSpringFrost && (
                <p className="mt-1 text-sm text-red-500">{errors.lastSpringFrost}</p>
              )}
            </div>

            <div>
              <label htmlFor="first-fall-frost" className="block text-sm font-medium text-gray-700 mb-1">
                First Fall Frost
              </label>
              <input
                id="first-fall-frost"
                type="date"
                value={firstFallFrost}
                onChange={(e) => setFirstFallFrost(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
                  errors.firstFallFrost ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.firstFallFrost && (
                <p className="mt-1 text-sm text-red-500">{errors.firstFallFrost}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors"
          >
            Save Frost Dates
          </button>
          {hasCurrentDates && (
            <button
              type="button"
              onClick={handleClear}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

FrostDateForm.propTypes = {
  onSave: PropTypes.func,
  initialFrostDates: PropTypes.shape({
    lastSpringFrost: PropTypes.string,
    firstFallFrost: PropTypes.string,
    zipCode: PropTypes.string
  })
};

export default FrostDateForm;
