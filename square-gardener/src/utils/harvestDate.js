/**
 * Harvest Date Utilities
 * Handles calculation and formatting of expected harvest dates
 */

/**
 * Calculate expected harvest date from planted date and days to maturity
 * @param {string} plantedDate - ISO 8601 date string
 * @param {number} daysToMaturity - Number of days until harvest
 * @returns {string} ISO 8601 date string of expected harvest
 */
export const calculateHarvestDate = (plantedDate, daysToMaturity) => {
  const planted = new Date(plantedDate);
  const harvest = new Date(planted);
  harvest.setUTCDate(harvest.getUTCDate() + daysToMaturity);
  return harvest.toISOString();
};

/**
 * Get the effective harvest date - override if set, otherwise calculated
 * @param {string} plantedDate - ISO 8601 date string
 * @param {number} daysToMaturity - Number of days until harvest
 * @param {string|null} harvestDateOverride - Override date (ISO 8601) or null
 * @returns {{ date: string, isOverride: boolean }} Harvest date and whether it was overridden
 */
export const getEffectiveHarvestDate = (plantedDate, daysToMaturity, harvestDateOverride) => {
  if (harvestDateOverride) {
    return {
      date: harvestDateOverride,
      isOverride: true
    };
  }

  return {
    date: calculateHarvestDate(plantedDate, daysToMaturity),
    isOverride: false
  };
};

/**
 * Format harvest date for display
 * @param {string} dateString - ISO 8601 date string
 * @param {boolean} isOverride - Whether the date was manually set
 * @returns {string} Formatted display string
 */
export const formatHarvestDateDisplay = (dateString, isOverride) => {
  const date = new Date(dateString);
  const formattedDate = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  if (isOverride) {
    return `Harvest: ${formattedDate} (set manually)`;
  }

  return `Expected: ${formattedDate}`;
};

/**
 * Get days until harvest from harvest date
 * @param {string} harvestDate - ISO 8601 date string
 * @returns {number} Days remaining (negative if overdue)
 */
export const getDaysUntilHarvest = (harvestDate) => {
  const harvest = new Date(harvestDate);
  const today = new Date();
  // Reset time to midnight for accurate day calculation
  today.setHours(0, 0, 0, 0);
  harvest.setHours(0, 0, 0, 0);
  const diffTime = harvest.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Check if harvest date should be recalculated when plant date changes
 * @param {string|null} harvestDateOverride - Current override value
 * @returns {boolean} True if should recalculate
 */
export const shouldRecalculateHarvestDate = (harvestDateOverride) => {
  return !harvestDateOverride;
};
