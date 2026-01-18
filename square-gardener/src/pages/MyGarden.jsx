import { useState, useEffect } from 'react';
import PlantCard from '../components/PlantCard';
import { plantLibrary, getPlantById } from '../data/plantLibrary';
import { getGardenPlants, addGardenPlant, removeGardenPlant } from '../utils/storage';

function MyGarden() {
  const [gardenPlants, setGardenPlants] = useState([]);
  const [showLibrary, setShowLibrary] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeason, setFilterSeason] = useState('all');

  useEffect(() => {
    const plants = getGardenPlants();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGardenPlants(plants);
  }, []);

  const handleAddPlant = (plantId) => {
    addGardenPlant(plantId);
    const plants = getGardenPlants();
    setGardenPlants(plants);
    setShowLibrary(false);
  };

  const handleRemovePlant = (gardenPlantId) => {
    if (confirm('Are you sure you want to remove this plant from your garden?')) {
      removeGardenPlant(gardenPlantId);
      const plants = getGardenPlants();
      setGardenPlants(plants);
    }
  };

  const getFilteredLibrary = () => {
    let filtered = plantLibrary;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(plant =>
        plant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plant.scientificName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by season
    if (filterSeason !== 'all') {
      filtered = filtered.filter(plant =>
        plant.plantingSeason.includes(filterSeason)
      );
    }

    return filtered;
  };

  const filteredLibrary = getFilteredLibrary();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary mb-2">My Garden</h1>
        <p className="text-gray-600">Track your plants and their progress</p>
      </div>

      {gardenPlants.length === 0 ? (
        <div className="bg-card rounded-xl p-8 text-center shadow-md">
          <div className="text-6xl mb-4">🌱</div>
          <h2 className="text-2xl font-semibold text-primary mb-2">Your garden is empty</h2>
          <p className="text-gray-600 mb-6">
            Add your first plant to start tracking your garden!
          </p>
          <button
            onClick={() => setShowLibrary(true)}
            className="bg-primary hover:bg-primary-light text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            Browse Plant Library
          </button>
        </div>
      ) : (
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌿</span>
              <span className="text-lg font-medium text-gray-700">
                {gardenPlants.length} {gardenPlants.length === 1 ? 'plant' : 'plants'} in your garden
              </span>
            </div>
            <button
              onClick={() => setShowLibrary(true)}
              className="bg-primary hover:bg-primary-light text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              + Add Plant
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gardenPlants.map((gardenPlant) => {
              const plant = getPlantById(gardenPlant.plantId);
              if (!plant) return null;

              return (
                <PlantCard
                  key={gardenPlant.id}
                  plant={plant}
                  gardenPlant={gardenPlant}
                  onRemove={handleRemovePlant}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Plant Library Modal */}
      {showLibrary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-primary">Plant Library</h2>
                  <p className="text-gray-600">Choose plants to add to your garden</p>
                </div>
                <button
                  onClick={() => setShowLibrary(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
                >
                  ×
                </button>
              </div>

              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="text"
                  placeholder="Search plants..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <select
                  value={filterSeason}
                  onChange={(e) => setFilterSeason(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">All Seasons</option>
                  <option value="spring">Spring</option>
                  <option value="summer">Summer</option>
                  <option value="fall">Fall</option>
                </select>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {filteredLibrary.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No plants found matching your criteria
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredLibrary.map((plant) => (
                    <PlantCard
                      key={plant.id}
                      plant={plant}
                      onAdd={handleAddPlant}
                      showAddButton={true}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyGarden;
