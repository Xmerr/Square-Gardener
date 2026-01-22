/**
 * Frost Date Storage Utilities
 * Handles frost date persistence for planning mode
 */

const STORAGE_KEY = 'square-gardener-settings';

/**
 * Get default settings structure
 */
const getDefaultSettings = () => ({
  frostDates: {
    lastSpringFrost: null,
    firstFallFrost: null,
    zipCode: null
  }
});

/**
 * Get all settings from session storage
 */
export const getSettings = () => {
  try {
    const data = sessionStorage.getItem(STORAGE_KEY);
    if (!data) {
      return getDefaultSettings();
    }
    const parsed = JSON.parse(data);
    return {
      ...getDefaultSettings(),
      ...parsed,
      frostDates: {
        ...getDefaultSettings().frostDates,
        ...(parsed.frostDates || {})
      }
    };
  } catch (error) {
    console.error('Error reading settings from storage:', error);
    return getDefaultSettings();
  }
};

/**
 * Save settings to session storage
 */
export const saveSettings = (settings) => {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Error saving settings to storage:', error);
    return false;
  }
};

/**
 * Get frost dates from settings
 * @returns {{ lastSpringFrost: string | null, firstFallFrost: string | null, zipCode: string | null }}
 */
export const getFrostDates = () => {
  const settings = getSettings();
  return settings.frostDates;
};

/**
 * Save frost dates to settings
 * @param {{ lastSpringFrost?: string | null, firstFallFrost?: string | null, zipCode?: string | null }} frostDates
 */
export const saveFrostDates = (frostDates) => {
  const settings = getSettings();
  settings.frostDates = {
    ...settings.frostDates,
    ...frostDates
  };
  return saveSettings(settings);
};

/**
 * Check if frost dates are configured
 * @returns {boolean}
 */
export const hasFrostDatesConfigured = () => {
  const { lastSpringFrost, firstFallFrost } = getFrostDates();
  return lastSpringFrost !== null && firstFallFrost !== null;
};

/**
 * Clear frost dates
 */
export const clearFrostDates = () => {
  return saveFrostDates({
    lastSpringFrost: null,
    firstFallFrost: null,
    zipCode: null
  });
};
