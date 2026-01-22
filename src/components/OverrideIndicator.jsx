import PropTypes from 'prop-types';

function OverrideIndicator({ isOverride, defaultValue }) {
  const icon = isOverride ? (
    // Pencil icon for manual/override
    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
    </svg>
  ) : (
    // Auto/sparkles icon for calculated
    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
      <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
    </svg>
  );

  const tooltipText = isOverride
    ? 'Manually set'
    : `Calculated from library${defaultValue ? ` (${defaultValue})` : ''}`;

  return (
    <span
      className="inline-flex items-center text-gray-400 hover:text-gray-600 transition-colors cursor-help ml-1"
      title={tooltipText}
      aria-label={tooltipText}
    >
      {icon}
    </span>
  );
}

OverrideIndicator.propTypes = {
  isOverride: PropTypes.bool.isRequired,
  defaultValue: PropTypes.string
};

export default OverrideIndicator;
