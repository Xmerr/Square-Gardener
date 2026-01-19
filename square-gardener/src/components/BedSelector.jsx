import PropTypes from 'prop-types';

function BedSelector({ beds, capacities, selectedBedId, onSelect, onCreateBed }) {
  if (beds.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-gray-600 mb-4">You need to create a bed before adding plants.</p>
        {onCreateBed && (
          <button
            onClick={onCreateBed}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors"
          >
            Create Your First Bed
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Select Bed
      </label>
      {beds.map((bed) => {
        const capacity = capacities[bed.id] || { total: 0, used: 0, available: 0, isOvercapacity: false };
        const isSelected = selectedBedId === bed.id;

        return (
          <button
            key={bed.id}
            onClick={() => onSelect(bed.id)}
            className={`w-full text-left p-3 rounded-lg border transition-colors ${
              isSelected
                ? 'border-primary bg-green-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    isSelected ? 'border-primary' : 'border-gray-400'
                  }`}
                >
                  {isSelected && <div className="w-2 h-2 rounded-full bg-primary" />}
                </div>
                <span className="font-medium text-gray-800">{bed.name}</span>
              </div>
              {capacity.isOvercapacity && (
                <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <p className={`text-sm mt-1 ml-6 ${capacity.isOvercapacity ? 'text-red-600' : 'text-gray-500'}`}>
              {capacity.used} / {capacity.total} sq ft used
              {capacity.isOvercapacity && ' (overcrowded)'}
            </p>
          </button>
        );
      })}
    </div>
  );
}

BedSelector.propTypes = {
  beds: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired
    })
  ).isRequired,
  capacities: PropTypes.objectOf(
    PropTypes.shape({
      total: PropTypes.number.isRequired,
      used: PropTypes.number.isRequired,
      available: PropTypes.number.isRequired,
      isOvercapacity: PropTypes.bool.isRequired
    })
  ).isRequired,
  selectedBedId: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
  onCreateBed: PropTypes.func
};

export default BedSelector;
