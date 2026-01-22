import { useState } from 'react';
import PropTypes from 'prop-types';
import MonthDayPicker from './MonthDayPicker';
import { getFrostDates, saveFrostDates } from '../utils/frostDateStorage';
import { lookupFrostDates, isZipCodeSupported } from '../utils/frostDateLookup';
import { formatMonthDay, convertToMonthDay, isValidMonthDay, isBeforeInYear } from '../utils/dateFormatting';

const getInitialState = (initialFrostDates) => {
  const frostDates = initialFrostDates || getFrostDates();
  return {
    lastSpringFrost: convertToMonthDay(frostDates.lastSpringFrost) || '',
    firstFallFrost: convertToMonthDay(frostDates.firstFallFrost) || '',
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
  const [zipError, setZipError] = useState('');

  const validateField = (fieldName, value, otherValue) => {
    if (fieldName === 'lastSpringFrost') {
      if (!value) return 'Last spring frost date is required';
      if (!isValidMonthDay(value)) return 'Invalid date format';
      return null;
    }
    // fieldName === 'firstFallFrost'
    if (!value) return 'First fall frost date is required';
    if (!isValidMonthDay(value)) return 'Invalid date format';
    if (otherValue && isValidMonthDay(otherValue) && !isBeforeInYear(otherValue, value)) {
      return 'Fall frost must be after spring frost';
    }
    return null;
  };

  const validateDates = () => {
    const newErrors = {};

    if (!lastSpringFrost) {
      newErrors.lastSpringFrost = 'Last spring frost date is required';
    } else if (!isValidMonthDay(lastSpringFrost)) {
      newErrors.lastSpringFrost = 'Invalid date format';
    }

    if (!firstFallFrost) {
      newErrors.firstFallFrost = 'First fall frost date is required';
    } else if (!isValidMonthDay(firstFallFrost)) {
      newErrors.firstFallFrost = 'Invalid date format';
    }

    if (lastSpringFrost && firstFallFrost && isValidMonthDay(lastSpringFrost) && isValidMonthDay(firstFallFrost)) {
      if (!isBeforeInYear(lastSpringFrost, firstFallFrost)) {
        newErrors.firstFallFrost = 'Fall frost must be after spring frost';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleZipChange = (e) => {
    const value = e.target.value;
    setZipCode(value);
    setLookupMessage('');

    // Validate ZIP code input
    if (value === '') {
      setZipError('');
      return;
    }

    // Check for non-numeric characters
    if (!/^\d*$/.test(value)) {
      setZipError('ZIP code must contain only numbers');
      return;
    }

    // Check length (max 5 digits for US ZIP codes)
    if (value.length > 5) {
      setZipError('ZIP code must be 5 digits or less');
      return;
    }

    setZipError('');
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
    setZipError('');
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
            Last Spring Frost: {formatMonthDay(lastSpringFrost)}
            <br />
            First Fall Frost: {formatMonthDay(firstFallFrost)}
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
              onChange={handleZipChange}
              placeholder="Enter ZIP code"
              maxLength={5}
              className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
                zipError ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <button
              type="button"
              onClick={handleZipLookup}
              disabled={!!zipError}
              className={`px-4 py-2 rounded-lg transition-colors ${
                zipError
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Look Up
            </button>
          </div>
          {zipError && (
            <p className="mt-1 text-sm text-red-500">{zipError}</p>
          )}
          {!zipError && lookupMessage && (
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
              <MonthDayPicker
                id="last-spring-frost"
                value={lastSpringFrost}
                onChange={(newValue) => {
                  setLastSpringFrost(newValue);
                  if (errors.lastSpringFrost || errors.firstFallFrost) {
                    const error = validateField('lastSpringFrost', newValue);
                    if (!error) {
                      setErrors(prev => {
                        const next = { ...prev };
                        delete next.lastSpringFrost;
                        // Also revalidate firstFallFrost in case the order issue is resolved
                        if (next.firstFallFrost && firstFallFrost) {
                          const fallError = validateField('firstFallFrost', firstFallFrost, newValue);
                          if (!fallError) {
                            delete next.firstFallFrost;
                          }
                        }
                        return next;
                      });
                    }
                  }
                }}
                hasError={!!errors.lastSpringFrost}
              />
              {errors.lastSpringFrost && (
                <p className="mt-1 text-sm text-red-500">{errors.lastSpringFrost}</p>
              )}
            </div>

            <div>
              <label htmlFor="first-fall-frost" className="block text-sm font-medium text-gray-700 mb-1">
                First Fall Frost
              </label>
              <MonthDayPicker
                id="first-fall-frost"
                value={firstFallFrost}
                onChange={(newValue) => {
                  setFirstFallFrost(newValue);
                  if (errors.firstFallFrost) {
                    const error = validateField('firstFallFrost', newValue, lastSpringFrost);
                    if (!error) {
                      setErrors(prev => {
                        const next = { ...prev };
                        delete next.firstFallFrost;
                        return next;
                      });
                    }
                  }
                }}
                hasError={!!errors.firstFallFrost}
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
