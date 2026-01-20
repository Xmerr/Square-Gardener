/**
 * ZIP Code Frost Date Lookup
 * Provides frost dates based on ZIP code prefix (first 3 digits)
 */

/**
 * Frost date data by ZIP code prefix (first 3 digits)
 * Data represents average last spring frost and first fall frost dates
 * Format: { lastSpring: 'MM-DD', firstFall: 'MM-DD' }
 */
const FROST_DATE_DATA = {
  // Northeast
  '100': { lastSpring: '04-15', firstFall: '10-15' }, // NYC area
  '101': { lastSpring: '04-15', firstFall: '10-15' },
  '102': { lastSpring: '04-15', firstFall: '10-15' },
  '103': { lastSpring: '04-15', firstFall: '10-15' },
  '104': { lastSpring: '04-20', firstFall: '10-10' },
  '105': { lastSpring: '04-25', firstFall: '10-05' },
  '106': { lastSpring: '04-25', firstFall: '10-05' },
  '107': { lastSpring: '04-25', firstFall: '10-05' },
  '108': { lastSpring: '04-20', firstFall: '10-10' },
  '109': { lastSpring: '04-20', firstFall: '10-10' },
  '110': { lastSpring: '04-15', firstFall: '10-20' }, // Long Island
  '111': { lastSpring: '04-15', firstFall: '10-20' },
  '112': { lastSpring: '04-15', firstFall: '10-15' }, // Brooklyn
  '113': { lastSpring: '04-15', firstFall: '10-15' },
  '114': { lastSpring: '04-15', firstFall: '10-15' }, // Queens
  '115': { lastSpring: '04-15', firstFall: '10-20' },
  '116': { lastSpring: '04-15', firstFall: '10-20' },
  '117': { lastSpring: '04-10', firstFall: '10-25' }, // Long Island South
  '118': { lastSpring: '04-10', firstFall: '10-25' },
  '119': { lastSpring: '04-15', firstFall: '10-20' },

  // Boston area
  '021': { lastSpring: '04-20', firstFall: '10-10' },
  '022': { lastSpring: '04-20', firstFall: '10-10' },
  '023': { lastSpring: '04-25', firstFall: '10-05' },
  '024': { lastSpring: '04-25', firstFall: '10-05' },

  // Philadelphia area
  '190': { lastSpring: '04-10', firstFall: '10-20' },
  '191': { lastSpring: '04-10', firstFall: '10-20' },
  '192': { lastSpring: '04-10', firstFall: '10-20' },
  '193': { lastSpring: '04-15', firstFall: '10-15' },
  '194': { lastSpring: '04-15', firstFall: '10-15' },

  // Washington DC area
  '200': { lastSpring: '04-05', firstFall: '10-25' },
  '201': { lastSpring: '04-05', firstFall: '10-25' },
  '202': { lastSpring: '04-05', firstFall: '10-25' },
  '203': { lastSpring: '04-10', firstFall: '10-20' },
  '204': { lastSpring: '04-10', firstFall: '10-20' },
  '220': { lastSpring: '04-10', firstFall: '10-20' }, // Northern Virginia
  '221': { lastSpring: '04-10', firstFall: '10-20' },
  '222': { lastSpring: '04-10', firstFall: '10-20' },

  // Southeast
  '303': { lastSpring: '03-20', firstFall: '11-15' }, // Atlanta
  '304': { lastSpring: '03-20', firstFall: '11-15' },
  '305': { lastSpring: '03-15', firstFall: '11-20' },
  '330': { lastSpring: '02-15', firstFall: '12-15' }, // Miami
  '331': { lastSpring: '02-01', firstFall: '12-25' },
  '332': { lastSpring: '02-01', firstFall: '12-25' },
  '333': { lastSpring: '02-01', firstFall: '12-25' },
  '334': { lastSpring: '02-10', firstFall: '12-20' },
  '335': { lastSpring: '02-20', firstFall: '12-10' }, // Tampa
  '336': { lastSpring: '02-20', firstFall: '12-10' },
  '337': { lastSpring: '02-15', firstFall: '12-15' },
  '327': { lastSpring: '02-25', firstFall: '12-01' }, // Orlando
  '328': { lastSpring: '02-25', firstFall: '12-01' },
  '329': { lastSpring: '02-20', firstFall: '12-10' },
  '322': { lastSpring: '03-01', firstFall: '11-25' }, // Jacksonville
  '323': { lastSpring: '03-01', firstFall: '11-25' },

  // Midwest
  '606': { lastSpring: '04-20', firstFall: '10-10' }, // Chicago
  '607': { lastSpring: '04-20', firstFall: '10-10' },
  '608': { lastSpring: '04-25', firstFall: '10-05' },
  '609': { lastSpring: '04-25', firstFall: '10-05' },
  '481': { lastSpring: '05-01', firstFall: '10-01' }, // Detroit
  '482': { lastSpring: '05-01', firstFall: '10-01' },
  '483': { lastSpring: '05-05', firstFall: '09-25' },
  '554': { lastSpring: '05-05', firstFall: '09-25' }, // Minneapolis
  '555': { lastSpring: '05-05', firstFall: '09-25' },
  '430': { lastSpring: '04-25', firstFall: '10-10' }, // Columbus OH
  '431': { lastSpring: '04-25', firstFall: '10-10' },
  '432': { lastSpring: '04-25', firstFall: '10-10' },
  '441': { lastSpring: '05-01', firstFall: '10-05' }, // Cleveland
  '442': { lastSpring: '05-01', firstFall: '10-05' },
  '631': { lastSpring: '04-15', firstFall: '10-15' }, // St. Louis
  '632': { lastSpring: '04-15', firstFall: '10-15' },
  '633': { lastSpring: '04-15', firstFall: '10-15' },

  // Southwest
  '850': { lastSpring: '03-01', firstFall: '11-20' }, // Phoenix
  '851': { lastSpring: '03-01', firstFall: '11-20' },
  '852': { lastSpring: '02-15', firstFall: '12-01' },
  '853': { lastSpring: '02-15', firstFall: '12-01' },
  '871': { lastSpring: '04-15', firstFall: '10-15' }, // Albuquerque
  '872': { lastSpring: '04-15', firstFall: '10-15' },
  '730': { lastSpring: '03-25', firstFall: '11-05' }, // Oklahoma City
  '731': { lastSpring: '03-25', firstFall: '11-05' },
  '750': { lastSpring: '03-15', firstFall: '11-15' }, // Dallas
  '751': { lastSpring: '03-15', firstFall: '11-15' },
  '752': { lastSpring: '03-15', firstFall: '11-15' },
  '760': { lastSpring: '03-20', firstFall: '11-10' }, // Fort Worth
  '761': { lastSpring: '03-20', firstFall: '11-10' },
  '770': { lastSpring: '02-20', firstFall: '11-25' }, // Houston
  '771': { lastSpring: '02-20', firstFall: '11-25' },
  '772': { lastSpring: '02-15', firstFall: '12-01' },
  '780': { lastSpring: '03-01', firstFall: '11-20' }, // San Antonio
  '781': { lastSpring: '03-01', firstFall: '11-20' },
  '782': { lastSpring: '02-25', firstFall: '11-25' },
  '787': { lastSpring: '03-15', firstFall: '11-15' }, // Austin
  '788': { lastSpring: '03-15', firstFall: '11-15' },

  // West Coast
  '900': { lastSpring: '02-15', firstFall: '12-15' }, // LA area
  '901': { lastSpring: '02-15', firstFall: '12-15' },
  '902': { lastSpring: '02-10', firstFall: '12-20' },
  '903': { lastSpring: '02-10', firstFall: '12-20' },
  '904': { lastSpring: '02-15', firstFall: '12-15' },
  '905': { lastSpring: '02-20', firstFall: '12-10' },
  '906': { lastSpring: '02-20', firstFall: '12-10' },
  '907': { lastSpring: '02-15', firstFall: '12-15' },
  '908': { lastSpring: '02-15', firstFall: '12-15' },
  '910': { lastSpring: '02-15', firstFall: '12-15' }, // Pasadena
  '911': { lastSpring: '02-15', firstFall: '12-15' },
  '912': { lastSpring: '03-01', firstFall: '12-01' }, // Glendale
  '913': { lastSpring: '03-01', firstFall: '12-01' },
  '917': { lastSpring: '02-25', firstFall: '12-05' }, // Industry
  '918': { lastSpring: '02-25', firstFall: '12-05' },
  '920': { lastSpring: '02-01', firstFall: '12-25' }, // San Diego
  '921': { lastSpring: '02-01', firstFall: '12-25' },
  '922': { lastSpring: '02-01', firstFall: '12-25' },
  '940': { lastSpring: '03-01', firstFall: '12-01' }, // San Francisco
  '941': { lastSpring: '03-01', firstFall: '12-01' },
  '942': { lastSpring: '03-01', firstFall: '12-01' },
  '943': { lastSpring: '03-01', firstFall: '12-01' },
  '944': { lastSpring: '02-20', firstFall: '12-10' },
  '945': { lastSpring: '03-15', firstFall: '11-20' }, // Oakland
  '946': { lastSpring: '03-15', firstFall: '11-20' },
  '947': { lastSpring: '03-20', firstFall: '11-15' }, // Berkeley
  '950': { lastSpring: '02-20', firstFall: '12-10' }, // San Jose
  '951': { lastSpring: '02-20', firstFall: '12-10' },
  '952': { lastSpring: '03-01', firstFall: '12-01' },
  '953': { lastSpring: '03-15', firstFall: '11-15' },
  '958': { lastSpring: '03-15', firstFall: '11-15' }, // Sacramento
  '959': { lastSpring: '03-15', firstFall: '11-15' },

  // Pacific Northwest
  '970': { lastSpring: '04-15', firstFall: '10-15' }, // Portland
  '971': { lastSpring: '04-15', firstFall: '10-15' },
  '972': { lastSpring: '04-15', firstFall: '10-15' },
  '973': { lastSpring: '04-20', firstFall: '10-10' },
  '980': { lastSpring: '04-10', firstFall: '10-20' }, // Seattle
  '981': { lastSpring: '04-10', firstFall: '10-20' },
  '982': { lastSpring: '04-15', firstFall: '10-15' },
  '983': { lastSpring: '04-15', firstFall: '10-15' },
  '984': { lastSpring: '04-15', firstFall: '10-15' },

  // Mountain
  '800': { lastSpring: '05-05', firstFall: '09-25' }, // Denver
  '801': { lastSpring: '05-05', firstFall: '09-25' },
  '802': { lastSpring: '05-05', firstFall: '09-25' },
  '803': { lastSpring: '05-10', firstFall: '09-20' }, // Boulder
  '804': { lastSpring: '05-10', firstFall: '09-20' },
  '805': { lastSpring: '05-15', firstFall: '09-15' }, // Longmont
  '840': { lastSpring: '05-01', firstFall: '10-01' }, // Salt Lake City
  '841': { lastSpring: '05-01', firstFall: '10-01' },
  '890': { lastSpring: '03-25', firstFall: '11-05' }, // Las Vegas
  '891': { lastSpring: '03-25', firstFall: '11-05' }
};

/**
 * Look up frost dates by ZIP code
 * @param {string} zipCode - 5-digit US ZIP code
 * @returns {{ lastSpringFrost: string, firstFallFrost: string } | null} ISO date strings or null if not found
 */
export const lookupFrostDates = (zipCode) => {
  if (!zipCode || typeof zipCode !== 'string') {
    return null;
  }

  // Clean the ZIP code - remove spaces and non-digits
  const cleanZip = zipCode.replace(/\D/g, '');

  // Must be at least 3 digits
  if (cleanZip.length < 3) {
    return null;
  }

  // Get the first 3 digits (ZIP code prefix)
  const prefix = cleanZip.substring(0, 3);
  const frostData = FROST_DATE_DATA[prefix];

  if (!frostData) {
    return null;
  }

  // Convert MM-DD to full ISO date using current year
  const currentYear = new Date().getFullYear();

  return {
    lastSpringFrost: `${currentYear}-${frostData.lastSpring}`,
    firstFallFrost: `${currentYear}-${frostData.firstFall}`
  };
};

/**
 * Check if a ZIP code is supported for frost date lookup
 * @param {string} zipCode - 5-digit US ZIP code
 * @returns {boolean}
 */
export const isZipCodeSupported = (zipCode) => {
  return lookupFrostDates(zipCode) !== null;
};

/**
 * Get the ZIP code prefix used for lookup
 * @param {string} zipCode - 5-digit US ZIP code
 * @returns {string | null} First 3 digits or null if invalid
 */
export const getZipCodePrefix = (zipCode) => {
  if (!zipCode || typeof zipCode !== 'string') {
    return null;
  }
  const cleanZip = zipCode.replace(/\D/g, '');
  if (cleanZip.length < 3) {
    return null;
  }
  return cleanZip.substring(0, 3);
};
