/**
 * Plant Library
 * Pre-populated database of common vegetables and herbs for square foot gardening
 */

export const plantLibrary = [
  {
    id: 'tomato',
    name: 'Tomato',
    scientificName: 'Solanum lycopersicum',
    wateringFrequency: 2, // days
    squaresPerPlant: 1, // 1 plant per square
    daysToMaturity: 70,
    plantingSeason: ['spring', 'summer'],
    sunRequirement: 'full',
    companionPlants: ['basil', 'carrot', 'marigold', 'parsley'],
    avoidPlants: ['cabbage', 'broccoli', 'cauliflower', 'potato'],
    companionReasons: {
      basil: 'Basil repels aphids and tomato hornworms while enhancing flavor',
      carrot: 'Carrots help aerate soil while tomatoes provide shade',
      marigold: 'Marigolds deter nematodes and whiteflies that attack tomatoes',
      parsley: 'Parsley attracts beneficial insects that protect tomatoes'
    },
    enemyReasons: {
      cabbage: 'Both are heavy feeders competing for the same nutrients',
      broccoli: 'Both are heavy feeders competing for the same nutrients',
      cauliflower: 'Both are heavy feeders competing for the same nutrients',
      potato: 'Both attract similar pests and diseases, especially blight'
    }
  },
  {
    id: 'lettuce',
    name: 'Lettuce',
    scientificName: 'Lactuca sativa',
    wateringFrequency: 1,
    squaresPerPlant: 0.25, // 4 plants per square
    daysToMaturity: 45,
    plantingSeason: ['spring', 'fall'],
    sunRequirement: 'partial',
    companionPlants: ['carrot', 'radish', 'cucumber', 'strawberry'],
    avoidPlants: ['parsley'],
    companionReasons: {
      carrot: 'Lettuce provides ground cover that helps carrots retain moisture',
      radish: 'Radishes grow quickly and help break up soil for lettuce roots',
      cucumber: 'Lettuce acts as living mulch, keeping soil cool for cucumbers',
      strawberry: 'Lettuce and strawberries have similar moisture needs'
    },
    enemyReasons: {
      parsley: 'Both compete for similar nutrients and growing space'
    }
  },
  {
    id: 'carrot',
    name: 'Carrot',
    scientificName: 'Daucus carota',
    wateringFrequency: 2,
    squaresPerPlant: 0.0625, // 16 plants per square
    daysToMaturity: 70,
    plantingSeason: ['spring', 'fall'],
    sunRequirement: 'full',
    companionPlants: ['lettuce', 'onion', 'tomato', 'pea'],
    avoidPlants: ['dill', 'parsnip'],
    companionReasons: {
      lettuce: 'Lettuce provides shade and helps retain soil moisture for carrots',
      onion: 'Onions repel carrot flies with their strong scent',
      tomato: 'Tomatoes provide partial shade without competing for root space',
      pea: 'Peas fix nitrogen in soil which benefits carrot growth'
    },
    enemyReasons: {
      dill: 'Dill attracts carrot flies and can stunt carrot growth',
      parsnip: 'Both compete for the same deep root space and nutrients'
    }
  },
  {
    id: 'basil',
    name: 'Basil',
    scientificName: 'Ocimum basilicum',
    wateringFrequency: 1,
    squaresPerPlant: 0.25,
    daysToMaturity: 60,
    plantingSeason: ['spring', 'summer'],
    sunRequirement: 'full',
    companionPlants: ['tomato', 'pepper', 'oregano'],
    avoidPlants: ['sage', 'rue'],
    companionReasons: {
      tomato: 'Basil repels pests and enhances tomato growth and flavor',
      pepper: 'Basil deters aphids and other pests that attack peppers',
      oregano: 'Both herbs thrive in similar growing conditions'
    },
    enemyReasons: {
      sage: 'Sage and basil compete for space and have different water needs',
      rue: 'Rue inhibits basil growth through allelopathy'
    }
  },
  {
    id: 'pepper',
    name: 'Bell Pepper',
    scientificName: 'Capsicum annuum',
    wateringFrequency: 2,
    squaresPerPlant: 1,
    daysToMaturity: 75,
    plantingSeason: ['spring', 'summer'],
    sunRequirement: 'full',
    companionPlants: ['basil', 'onion', 'spinach'],
    avoidPlants: ['fennel', 'kohlrabi']
  },
  {
    id: 'cucumber',
    name: 'Cucumber',
    scientificName: 'Cucumis sativus',
    wateringFrequency: 2,
    squaresPerPlant: 1,
    daysToMaturity: 55,
    plantingSeason: ['spring', 'summer'],
    sunRequirement: 'full',
    companionPlants: ['bean', 'pea', 'radish', 'lettuce'],
    avoidPlants: ['potato', 'sage']
  },
  {
    id: 'bean',
    name: 'Green Bean',
    scientificName: 'Phaseolus vulgaris',
    wateringFrequency: 2,
    squaresPerPlant: 0.11, // 9 plants per square
    daysToMaturity: 55,
    plantingSeason: ['spring', 'summer'],
    sunRequirement: 'full',
    companionPlants: ['carrot', 'cucumber', 'radish', 'strawberry'],
    avoidPlants: ['onion', 'garlic', 'fennel'],
    companionReasons: {
      carrot: 'Beans fix nitrogen that carrots need for growth',
      cucumber: 'Beans and cucumbers have compatible growing habits',
      radish: 'Radishes help aerate soil for bean roots',
      strawberry: 'Beans provide nitrogen that strawberries utilize'
    },
    enemyReasons: {
      onion: 'Onions inhibit bean growth through root secretions',
      garlic: 'Garlic stunts bean development with allelopathic compounds',
      fennel: 'Fennel secretes compounds toxic to most garden plants'
    }
  },
  {
    id: 'spinach',
    name: 'Spinach',
    scientificName: 'Spinacia oleracea',
    wateringFrequency: 2,
    squaresPerPlant: 0.11,
    daysToMaturity: 40,
    plantingSeason: ['spring', 'fall'],
    sunRequirement: 'partial',
    companionPlants: ['strawberry', 'pea', 'radish'],
    avoidPlants: ['potato']
  },
  {
    id: 'radish',
    name: 'Radish',
    scientificName: 'Raphanus sativus',
    wateringFrequency: 1,
    squaresPerPlant: 0.0625,
    daysToMaturity: 25,
    plantingSeason: ['spring', 'fall'],
    sunRequirement: 'full',
    companionPlants: ['lettuce', 'carrot', 'cucumber', 'pea'],
    avoidPlants: ['hyssop']
  },
  {
    id: 'onion',
    name: 'Onion',
    scientificName: 'Allium cepa',
    wateringFrequency: 3,
    squaresPerPlant: 0.11,
    daysToMaturity: 100,
    plantingSeason: ['spring', 'fall'],
    sunRequirement: 'full',
    companionPlants: ['carrot', 'tomato', 'pepper', 'lettuce'],
    avoidPlants: ['bean', 'pea', 'sage'],
    companionReasons: {
      carrot: 'Onions repel carrot flies while carrots deter onion flies',
      tomato: 'Onions deter aphids and other pests from tomatoes',
      pepper: 'Onions help repel pests that commonly attack peppers',
      lettuce: 'Onions and lettuce have compatible root depths'
    },
    enemyReasons: {
      bean: 'Onions inhibit bean growth through allelopathic compounds',
      pea: 'Onions stunt pea development with root secretions',
      sage: 'Both compete for similar nutrients and growing space'
    }
  },
  {
    id: 'broccoli',
    name: 'Broccoli',
    scientificName: 'Brassica oleracea',
    wateringFrequency: 2,
    squaresPerPlant: 1,
    daysToMaturity: 80,
    plantingSeason: ['spring', 'fall'],
    sunRequirement: 'full',
    companionPlants: ['beet', 'onion', 'celery'],
    avoidPlants: ['tomato', 'strawberry', 'pole-bean']
  },
  {
    id: 'cabbage',
    name: 'Cabbage',
    scientificName: 'Brassica oleracea var. capitata',
    wateringFrequency: 2,
    squaresPerPlant: 1,
    daysToMaturity: 90,
    plantingSeason: ['spring', 'fall'],
    sunRequirement: 'full',
    companionPlants: ['beet', 'celery', 'onion'],
    avoidPlants: ['tomato', 'strawberry'],
    companionReasons: {
      beet: 'Beets and cabbage have similar nutrient needs and timing',
      celery: 'Celery deters cabbage white butterflies',
      onion: 'Onions repel cabbage worms and aphids'
    },
    enemyReasons: {
      tomato: 'Both are heavy feeders competing for the same nutrients',
      strawberry: 'Strawberries can inhibit cabbage head formation'
    }
  },
  {
    id: 'cauliflower',
    name: 'Cauliflower',
    scientificName: 'Brassica oleracea var. botrytis',
    wateringFrequency: 2,
    squaresPerPlant: 1,
    daysToMaturity: 85,
    plantingSeason: ['spring', 'fall'],
    sunRequirement: 'full',
    companionPlants: ['beet', 'celery', 'onion'],
    avoidPlants: ['tomato', 'strawberry']
  },
  {
    id: 'zucchini',
    name: 'Zucchini',
    scientificName: 'Cucurbita pepo',
    wateringFrequency: 2,
    squaresPerPlant: 1,
    daysToMaturity: 50,
    plantingSeason: ['spring', 'summer'],
    sunRequirement: 'full',
    companionPlants: ['bean', 'corn', 'pea'],
    avoidPlants: ['potato']
  },
  {
    id: 'pea',
    name: 'Pea',
    scientificName: 'Pisum sativum',
    wateringFrequency: 2,
    squaresPerPlant: 0.125, // 8 plants per square
    daysToMaturity: 60,
    plantingSeason: ['spring', 'fall'],
    sunRequirement: 'full',
    companionPlants: ['carrot', 'cucumber', 'radish', 'spinach'],
    avoidPlants: ['onion', 'garlic']
  },
  {
    id: 'potato',
    name: 'Potato',
    scientificName: 'Solanum tuberosum',
    wateringFrequency: 3,
    squaresPerPlant: 1,
    daysToMaturity: 90,
    plantingSeason: ['spring'],
    sunRequirement: 'full',
    companionPlants: ['bean', 'corn', 'cabbage'],
    avoidPlants: ['tomato', 'cucumber', 'zucchini']
  },
  {
    id: 'beet',
    name: 'Beet',
    scientificName: 'Beta vulgaris',
    wateringFrequency: 2,
    squaresPerPlant: 0.11,
    daysToMaturity: 55,
    plantingSeason: ['spring', 'fall'],
    sunRequirement: 'full',
    companionPlants: ['broccoli', 'lettuce', 'onion'],
    avoidPlants: ['pole-bean']
  },
  {
    id: 'kale',
    name: 'Kale',
    scientificName: 'Brassica oleracea var. sabellica',
    wateringFrequency: 2,
    squaresPerPlant: 0.25,
    daysToMaturity: 55,
    plantingSeason: ['spring', 'fall'],
    sunRequirement: 'full',
    companionPlants: ['beet', 'celery', 'onion'],
    avoidPlants: ['tomato', 'strawberry']
  },
  {
    id: 'cilantro',
    name: 'Cilantro',
    scientificName: 'Coriandrum sativum',
    wateringFrequency: 2,
    squaresPerPlant: 0.25,
    daysToMaturity: 45,
    plantingSeason: ['spring', 'fall'],
    sunRequirement: 'partial',
    companionPlants: ['tomato', 'spinach'],
    avoidPlants: ['fennel']
  },
  {
    id: 'parsley',
    name: 'Parsley',
    scientificName: 'Petroselinum crispum',
    wateringFrequency: 2,
    squaresPerPlant: 0.25,
    daysToMaturity: 70,
    plantingSeason: ['spring', 'fall'],
    sunRequirement: 'partial',
    companionPlants: ['tomato', 'asparagus', 'corn'],
    avoidPlants: ['lettuce']
  },
  {
    id: 'strawberry',
    name: 'Strawberry',
    scientificName: 'Fragaria × ananassa',
    wateringFrequency: 2,
    squaresPerPlant: 0.25,
    daysToMaturity: 120,
    plantingSeason: ['spring'],
    sunRequirement: 'full',
    companionPlants: ['bean', 'lettuce', 'spinach'],
    avoidPlants: ['broccoli', 'cabbage', 'cauliflower']
  },
  {
    id: 'oregano',
    name: 'Oregano',
    scientificName: 'Origanum vulgare',
    wateringFrequency: 3,
    squaresPerPlant: 1,
    daysToMaturity: 90,
    plantingSeason: ['spring'],
    sunRequirement: 'full',
    companionPlants: ['basil', 'tomato', 'pepper'],
    avoidPlants: []
  },
  {
    id: 'thyme',
    name: 'Thyme',
    scientificName: 'Thymus vulgaris',
    wateringFrequency: 4,
    squaresPerPlant: 0.25,
    daysToMaturity: 90,
    plantingSeason: ['spring'],
    sunRequirement: 'full',
    companionPlants: ['cabbage', 'tomato', 'strawberry'],
    avoidPlants: []
  },
  {
    id: 'marigold',
    name: 'Marigold',
    scientificName: 'Tagetes',
    wateringFrequency: 2,
    squaresPerPlant: 0.25,
    daysToMaturity: 50,
    plantingSeason: ['spring', 'summer'],
    sunRequirement: 'full',
    companionPlants: ['tomato', 'cucumber', 'bean'],
    avoidPlants: []
  },
  {
    id: 'swiss-chard',
    name: 'Swiss Chard',
    scientificName: 'Beta vulgaris subsp. cicla',
    wateringFrequency: 2,
    squaresPerPlant: 0.25,
    daysToMaturity: 55,
    plantingSeason: ['spring', 'fall'],
    sunRequirement: 'full',
    companionPlants: ['bean', 'cabbage', 'onion'],
    avoidPlants: []
  },
  {
    id: 'eggplant',
    name: 'Eggplant',
    scientificName: 'Solanum melongena',
    wateringFrequency: 2,
    squaresPerPlant: 1,
    daysToMaturity: 80,
    plantingSeason: ['spring', 'summer'],
    sunRequirement: 'full',
    companionPlants: ['bean', 'pepper', 'spinach'],
    avoidPlants: ['fennel']
  },
  {
    id: 'garlic',
    name: 'Garlic',
    scientificName: 'Allium sativum',
    wateringFrequency: 4,
    squaresPerPlant: 0.11,
    daysToMaturity: 240,
    plantingSeason: ['fall'],
    sunRequirement: 'full',
    companionPlants: ['tomato', 'carrot', 'cucumber'],
    avoidPlants: ['bean', 'pea']
  },
  {
    id: 'arugula',
    name: 'Arugula',
    scientificName: 'Eruca vesicaria',
    wateringFrequency: 1,
    squaresPerPlant: 0.25,
    daysToMaturity: 40,
    plantingSeason: ['spring', 'fall'],
    sunRequirement: 'partial',
    companionPlants: ['beet', 'carrot', 'lettuce'],
    avoidPlants: []
  },
  {
    id: 'corn',
    name: 'Corn',
    scientificName: 'Zea mays',
    wateringFrequency: 3,
    squaresPerPlant: 0.25,
    daysToMaturity: 80,
    plantingSeason: ['spring', 'summer'],
    sunRequirement: 'full',
    companionPlants: ['bean', 'pea', 'cucumber', 'zucchini'],
    avoidPlants: ['tomato']
  },
  {
    id: 'sage',
    name: 'Sage',
    scientificName: 'Salvia officinalis',
    wateringFrequency: 4,
    squaresPerPlant: 1,
    daysToMaturity: 75,
    plantingSeason: ['spring'],
    sunRequirement: 'full',
    companionPlants: ['carrot', 'strawberry', 'tomato'],
    avoidPlants: ['cucumber', 'onion']
  },
  {
    id: 'aloe',
    name: 'Aloe',
    scientificName: 'Aloe vera',
    wateringFrequency: 7,
    squaresPerPlant: 0.25, // 4 plants per square
    daysToMaturity: 365, // perennial
    plantingSeason: ['spring', 'summer', 'fall'],
    sunRequirement: 'full',
    companionPlants: [],
    avoidPlants: []
  },
  {
    id: 'calathea',
    name: 'Calathea',
    scientificName: 'Calathea spp.',
    wateringFrequency: 3,
    squaresPerPlant: 0.25, // 4 plants per square
    daysToMaturity: 365, // perennial
    plantingSeason: ['spring', 'summer', 'fall'],
    sunRequirement: 'partial',
    companionPlants: [],
    avoidPlants: []
  }
];

/**
 * Get plant by ID
 */
export const getPlantById = (id) => {
  return plantLibrary.find(plant => plant.id === id);
};

/**
 * Get plants by season
 */
export const getPlantsBySeason = (season) => {
  return plantLibrary.filter(plant =>
    plant.plantingSeason.includes(season)
  );
};

/**
 * Get companion plants for a given plant
 */
export const getCompanionPlants = (plantId) => {
  const plant = getPlantById(plantId);
  if (!plant) return [];

  return plant.companionPlants.map(id => getPlantById(id)).filter(Boolean);
};

/**
 * Validate plant library for conflicting companion/enemy relationships
 * Logs warnings if a plant lists another as both companion and enemy
 */
const validatePlantRelationships = () => {
  const warnings = [];

  plantLibrary.forEach(plant => {
    const conflictingPlants = plant.companionPlants.filter(id =>
      plant.avoidPlants.includes(id)
    );

    if (conflictingPlants.length > 0) {
      conflictingPlants.forEach(conflictId => {
        const conflictingPlant = getPlantById(conflictId);
        warnings.push(
          `WARNING: ${plant.name} lists ${conflictingPlant?.name || conflictId} as both companion and enemy. Treating as enemy.`
        );
      });
    }
  });

  return warnings;
};

// Run validation and log warnings
if (typeof window !== 'undefined') {
  const warnings = validatePlantRelationships();
  warnings.forEach(warning => console.warn(warning));
}

/**
 * Check if two plants are compatible using union logic
 * Two plants are compatible if NEITHER lists the other as an enemy
 * @param {string} plantId1 - First plant ID
 * @param {string} plantId2 - Second plant ID
 * @returns {boolean} True if plants are compatible (not enemies)
 */
export const arePlantsCompatible = (plantId1, plantId2) => {
  const plant1 = getPlantById(plantId1);
  const plant2 = getPlantById(plantId2);

  if (!plant1 || !plant2) return true;

  // Check both directions - if EITHER plant lists the other as an enemy, they're incompatible
  const plant1AvoidsPlant2 = plant1.avoidPlants.includes(plantId2);
  const plant2AvoidsPlant1 = plant2.avoidPlants.includes(plantId1);

  return !plant1AvoidsPlant2 && !plant2AvoidsPlant1;
};

/**
 * Check if two plants are companions using union logic
 * Two plants are companions if EITHER lists the other as a companion
 * BUT if there's a conflict (one lists as enemy), treat as enemy
 * @param {string} plantId1 - First plant ID
 * @param {string} plantId2 - Second plant ID
 * @returns {boolean} True if plants are companions
 */
export const arePlantsCompanions = (plantId1, plantId2) => {
  const plant1 = getPlantById(plantId1);
  const plant2 = getPlantById(plantId2);

  if (!plant1 || !plant2) return false;

  // Check if either plant lists the other as an enemy (conflict takes precedence)
  const plant1AvoidsPlant2 = plant1.avoidPlants.includes(plantId2);
  const plant2AvoidsPlant1 = plant2.avoidPlants.includes(plantId1);

  if (plant1AvoidsPlant2 || plant2AvoidsPlant1) {
    // If there's a conflict, log a warning
    const plant1HasAsCompanion = plant1.companionPlants.includes(plantId2);
    const plant2HasAsCompanion = plant2.companionPlants.includes(plantId1);

    if (plant1HasAsCompanion || plant2HasAsCompanion) {
      console.warn(
        `CONFLICT: ${plant1.name} and ${plant2.name} have conflicting companion/enemy relationships. Treating as enemies.`
      );
    }

    return false; // Enemy relationship takes precedence
  }

  // Check if EITHER plant lists the other as a companion (union logic)
  const plant1HasAsCompanion = plant1.companionPlants.includes(plantId2);
  const plant2HasAsCompanion = plant2.companionPlants.includes(plantId1);

  return plant1HasAsCompanion || plant2HasAsCompanion;
};

/**
 * Get the reason for a companion relationship between two plants
 * @param {string} plantId1 - First plant ID
 * @param {string} plantId2 - Second plant ID
 * @returns {string} The reason for companionship, or a fallback message
 */
export const getCompanionReason = (plantId1, plantId2) => {
  const plant1 = getPlantById(plantId1);
  const plant2 = getPlantById(plantId2);

  if (!plant1 || !plant2) {
    return 'These plants grow well together';
  }

  // Check if plant1 has a reason for plant2
  if (plant1.companionReasons?.[plantId2]) {
    return plant1.companionReasons[plantId2];
  }

  // Check if plant2 has a reason for plant1
  if (plant2.companionReasons?.[plantId1]) {
    return plant2.companionReasons[plantId1];
  }

  // Fallback message
  return 'These plants grow well together';
};

/**
 * Get the reason for an enemy relationship between two plants
 * @param {string} plantId1 - First plant ID
 * @param {string} plantId2 - Second plant ID
 * @returns {string} The reason for incompatibility, or a fallback message
 */
export const getEnemyReason = (plantId1, plantId2) => {
  const plant1 = getPlantById(plantId1);
  const plant2 = getPlantById(plantId2);

  if (!plant1 || !plant2) {
    return 'These plants should be kept apart';
  }

  // Check if plant1 has a reason for avoiding plant2
  if (plant1.enemyReasons?.[plantId2]) {
    return plant1.enemyReasons[plantId2];
  }

  // Check if plant2 has a reason for avoiding plant1
  if (plant2.enemyReasons?.[plantId1]) {
    return plant2.enemyReasons[plantId1];
  }

  // Fallback message
  return 'These plants should be kept apart';
};
