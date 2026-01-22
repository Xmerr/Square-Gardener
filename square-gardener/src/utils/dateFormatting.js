/**
 * Date Formatting Utilities
 */

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Format MM-DD date string to readable format (e.g., "April 15")
 * @param {string} dateString - Date in MM-DD format
 * @returns {string} Formatted date (e.g., "April 15") or empty string if invalid
 */
export const formatMonthDay = (dateString) => {
  if (!dateString || typeof dateString !== 'string') {
    return '';
  }

  const match = dateString.match(/^(\d{2})-(\d{2})$/);
  if (!match) {
    return '';
  }

  const month = parseInt(match[1], 10);
  const day = parseInt(match[2], 10);

  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return '';
  }

  return `${MONTH_NAMES[month - 1]} ${day}`;
};

/**
 * Convert YYYY-MM-DD format to MM-DD format (for backward compatibility)
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {string} Date in MM-DD format or original string if not in expected format
 */
export const convertToMonthDay = (dateString) => {
  if (!dateString || typeof dateString !== 'string') {
    return dateString;
  }

  const match = dateString.match(/^\d{4}-(\d{2}-\d{2})$/);
  if (match) {
    return match[1];
  }

  return dateString;
};

/**
 * Validate MM-DD date string
 * @param {string} dateString - Date in MM-DD format
 * @returns {boolean} True if valid MM-DD format
 */
export const isValidMonthDay = (dateString) => {
  if (!dateString || typeof dateString !== 'string') {
    return false;
  }

  const match = dateString.match(/^(\d{2})-(\d{2})$/);
  if (!match) {
    return false;
  }

  const month = parseInt(match[1], 10);
  const day = parseInt(match[2], 10);

  if (month < 1 || month > 12) {
    return false;
  }

  const daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return day >= 1 && day <= daysInMonth[month - 1];
};

/**
 * Compare two MM-DD dates to determine if first is before second
 * @param {string} date1 - First date in MM-DD format
 * @param {string} date2 - Second date in MM-DD format
 * @returns {boolean} True if date1 is before date2 (crossing year boundary is handled)
 */
export const isBeforeInYear = (date1, date2) => {
  if (!isValidMonthDay(date1) || !isValidMonthDay(date2)) {
    return false;
  }

  const [month1, day1] = date1.split('-').map(Number);
  const [month2, day2] = date2.split('-').map(Number);

  if (month1 < month2) {
    return true;
  }
  if (month1 > month2) {
    return false;
  }
  return day1 < day2;
};

/**
 * Get the current season based on month
 * Spring: March, April, May (months 3-5)
 * Summer: June, July, August (months 6-8)
 * Fall: September, October, November (months 9-11)
 * Winter: December, January, February (months 12, 1-2)
 * @param {Date} [date] - Optional date to check (defaults to current date)
 * @returns {string} Season name: 'spring', 'summer', 'fall', or 'winter'
 */
export const getCurrentSeason = (date = new Date()) => {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    date = new Date();
  }

  const month = date.getMonth() + 1; // getMonth() returns 0-11, we need 1-12

  if (month >= 3 && month <= 5) {
    return 'spring';
  }
  if (month >= 6 && month <= 8) {
    return 'summer';
  }
  if (month >= 9 && month <= 11) {
    return 'fall';
  }
  return 'winter'; // December (12), January (1), February (2)
};
