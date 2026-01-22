/**
 * Planting Schedule Calculation Utilities
 * Generates planting windows based on frost dates and plant requirements
 */

import { getPlantById } from '../data/plantLibrary';

/**
 * Add days to a date
 * @param {string} dateStr - ISO date string (YYYY-MM-DD)
 * @param {number} days - Number of days to add
 * @returns {string} ISO date string
 */
export const addDays = (dateStr, days) => {
  if (!dateStr) return null;
  const date = new Date(dateStr + 'T00:00:00');
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

/**
 * Subtract days from a date
 * @param {string} dateStr - ISO date string (YYYY-MM-DD)
 * @param {number} days - Number of days to subtract
 * @returns {string} ISO date string
 */
export const subtractDays = (dateStr, days) => {
  if (!dateStr) return null;
  const date = new Date(dateStr + 'T00:00:00');
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
};

/**
 * Calculate planting window for a single plant
 * @param {Object} plant - Plant object from library
 * @param {Object} frostDates - Frost dates object
 * @param {string} frostDates.lastSpringFrost - Last spring frost date (ISO)
 * @param {string} frostDates.firstFallFrost - First fall frost date (ISO)
 * @returns {Object|null} Planting window with start, end, and season
 */
export const calculatePlantingWindow = (plant, frostDates) => {
  if (!plant || !frostDates) return null;

  const { lastSpringFrost, firstFallFrost } = frostDates;
  if (!lastSpringFrost || !firstFallFrost) return null;

  const plantingSeason = plant.plantingSeason || [];
  const daysToMaturity = plant.daysToMaturity || 60;

  // Spring planting: after last frost + 1 week, window of 6 weeks
  if (plantingSeason.includes('spring')) {
    return {
      start: addDays(lastSpringFrost, 7),
      end: addDays(lastSpringFrost, 42),
      season: 'spring'
    };
  }

  // Fall planting: before first frost minus days to maturity
  // Plant by date with 3-week window before deadline
  if (plantingSeason.includes('fall')) {
    const plantByDeadline = subtractDays(firstFallFrost, daysToMaturity + 14);
    return {
      start: subtractDays(plantByDeadline, 21),
      end: plantByDeadline,
      season: 'fall'
    };
  }

  // Summer planting (rare): between frosts
  if (plantingSeason.includes('summer')) {
    const summerStart = addDays(lastSpringFrost, 60);
    const summerEnd = subtractDays(firstFallFrost, daysToMaturity);
    return {
      start: summerStart,
      end: summerEnd,
      season: 'summer'
    };
  }

  return null;
};

/**
 * Generate planting schedule for multiple plants
 * @param {Array<{plantId: string, quantity: number}>} plantSelections - Selected plants
 * @param {Object} frostDates - Frost dates object
 * @returns {Array<{plantId: string, plantName: string, plantingWindow: Object, season: string}>}
 */
export const generatePlantingSchedule = (plantSelections, frostDates) => {
  if (!plantSelections || !Array.isArray(plantSelections)) {
    return [];
  }

  if (!frostDates || !frostDates.lastSpringFrost || !frostDates.firstFallFrost) {
    return [];
  }

  const schedule = [];

  for (const selection of plantSelections) {
    const plant = getPlantById(selection.plantId);
    if (!plant) continue;

    const window = calculatePlantingWindow(plant, frostDates);
    if (!window) continue;

    // For plants with multiple seasons, prioritize the first listed season
    schedule.push({
      plantId: plant.id,
      plantName: plant.name,
      plantingWindow: {
        start: window.start,
        end: window.end
      },
      season: window.season
    });
  }

  // Sort by planting start date
  return schedule.sort((a, b) => {
    const dateA = new Date(a.plantingWindow.start + 'T00:00:00');
    const dateB = new Date(b.plantingWindow.start + 'T00:00:00');
    return dateA - dateB;
  });
};

/**
 * Group schedule items by month
 * @param {Array} schedule - Schedule items from generatePlantingSchedule
 * @returns {Object} Schedule grouped by month (e.g., { "2026-04": [...items], "2026-05": [...items] })
 */
export const groupScheduleByMonth = (schedule) => {
  if (!schedule || !Array.isArray(schedule)) {
    return {};
  }

  const grouped = {};

  for (const item of schedule) {
    const startDate = item.plantingWindow.start;
    const month = startDate.substring(0, 7); // YYYY-MM

    if (!grouped[month]) {
      grouped[month] = [];
    }

    grouped[month].push(item);
  }

  return grouped;
};

/**
 * Get month label from YYYY-MM format
 * @param {string} monthKey - Month key (YYYY-MM)
 * @returns {string} Formatted month label (e.g., "April 2026")
 */
export const getMonthLabel = (monthKey) => {
  if (!monthKey) return '';
  const [year, month] = monthKey.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

/**
 * Format date for display
 * @param {string} dateStr - ISO date string
 * @returns {string} Formatted date (e.g., "Apr 22")
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

/**
 * Get season color for styling
 * @param {string} season - Season name (spring, summer, fall)
 * @returns {string} Tailwind color class
 */
export const getSeasonColor = (season) => {
  const colors = {
    spring: 'text-green-600 bg-green-50 border-green-200',
    summer: 'text-amber-600 bg-amber-50 border-amber-200',
    fall: 'text-orange-600 bg-orange-50 border-orange-200'
  };
  return colors[season] || 'text-gray-600 bg-gray-50 border-gray-200';
};
