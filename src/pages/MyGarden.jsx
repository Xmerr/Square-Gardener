import { useState, useMemo } from 'react';
import PlantCard from '../components/PlantCard';
import BedManager from '../components/BedManager';
import BedSelector from '../components/BedSelector';
import BedForm from '../components/BedForm';
import PlantForm from '../components/PlantForm';
import { plantLibrary, getPlantById } from '../data/plantLibrary';
import {
  getGardenPlants,
  addGardenPlant,
  removeGardenPlant,
  updateGardenPlant,
  getGardenBeds,
  getBedCapacity,
  addGardenBed
} from '../utils/storage';

function MyGarden() {
  const [gardenPlants, setGardenPlants] = useState(() => getGardenPlants());
  const [beds, setBeds] = useState(() => getGardenBeds());
  const [activeTab, setActiveTab] = useState('plants');
  const [showLibrary, setShowLibrary] = useState(false);
  const [showBedForm, setShowBedForm] = useState(false);
  const [selectedBedId, setSelectedBedId] = useState(null);
  const [selectedPlantId, setSelectedPlantId] = useState(null);
  const [plantQuantity, setPlantQuantity] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeason, setFilterSeason] = useState('all');
  const [editingPlant, setEditingPlant] = useState(null);

  const capacities = useMemo(() => {
    const caps = {};
    beds.forEach((bed) => {
      caps[bed.id] = getBedCapacity(bed.id);
    });
    return caps;
  }, [beds]);

  const loadData = () => {
    setGardenPlants(getGardenPlants());
    setBeds(getGardenBeds());
  };

  const handleAddPlant = () => {
    addGardenPlant(selectedPlantId, selectedBedId, plantQuantity);
    loadData();
    setShowLibrary(false);
    setSelectedPlantId(null);
    setSelectedBedId(null);
    setPlantQuantity(1);
  };

  const handleSelectPlant = (plantId) => {
    setSelectedPlantId(plantId);
    if (beds.length === 1) {
      setSelectedBedId(beds[0].id);
    }
  };

  const handleRemovePlant = (gardenPlantId) => {
    if (confirm('Are you sure you want to remove this plant from your garden?')) {
      removeGardenPlant(gardenPlantId);
      loadData();
    }
  };

  const handleEditPlant = (gardenPlant) => {
    setEditingPlant(gardenPlant);
  };

  const handleEditSubmit = (formData) => {
    const updates = {
      bedId: formData.bedId,
      variety: formData.variety,
      plantedDate: formData.plantedDate,
      quantity: formData.quantity,
      daysToMaturityOverride: formData.daysToMaturityOverride,
      spacePerPlantOverride: formData.spacePerPlantOverride
    };

    // If plant date changed and harvestDateOverride was not explicitly set,
    // we should clear any existing override so harvest is recalculated
    // This happens naturally since we're not including harvestDateOverride in updates
    // unless the user explicitly changed it

    updateGardenPlant(editingPlant.id, updates);
    loadData();
    setEditingPlant(null);
  };

  const handleEditCancel = () => {
    setEditingPlant(null);
  };

  const handleResetToDefaults = () => {
    // Reset to defaults: clear all overrides
    const updates = {
      daysToMaturityOverride: null,
      spacePerPlantOverride: null,
      harvestDateOverride: null
    };

    updateGardenPlant(editingPlant.id, updates);
    loadData();

    // Update the editing plant state to reflect the reset values
    setEditingPlant({
      ...editingPlant,
      ...updates
    });
  };

  const handleCreateBed = (data) => {
    if (data.is_pot) {
      addGardenBed(data.name, null, null, { is_pot: true, size: data.size });
    } else {
      addGardenBed(data.name, data.width, data.height, { is_pot: false });
    }
    loadData();
    setShowBedForm(false);
  };

  const getFilteredLibrary = () => {
    let filtered = plantLibrary;

    if (searchTerm) {
      filtered = filtered.filter(plant =>
        plant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plant.scientificName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterSeason !== 'all') {
      filtered = filtered.filter(plant =>
        plant.plantingSeason.includes(filterSeason)
      );
    }

    return filtered;
  };

  const getPlantsByBed = (bedId) => {
    return gardenPlants.filter(p => p.bedId === bedId);
  };

  const filteredLibrary = getFilteredLibrary();
  const selectedPlant = selectedPlantId ? getPlantById(selectedPlantId) : null;

  const handleOpenLibrary = () => {
    if (beds.length === 0) {
      setShowBedForm(true);
    } else {
      setShowLibrary(true);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary mb-2">My Garden</h1>
        <p className="text-gray-600">Track your plants and their progress</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('plants')}
          className={`pb-3 px-1 font-medium transition-colors ${
            activeTab === 'plants'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Plants
        </button>
        <button
          onClick={() => setActiveTab('beds')}
          className={`pb-3 px-1 font-medium transition-colors ${
            activeTab === 'beds'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Manage Beds
        </button>
      </div>

      {activeTab === 'beds' ? (
        <BedManager onBedChange={loadData} />
      ) : (
        <>
          {gardenPlants.length === 0 ? (
            <div className="bg-card rounded-xl p-8 text-center shadow-md">
              <div className="text-6xl mb-4">🌱</div>
              <h2 className="text-2xl font-semibold text-primary mb-2">Your garden is empty</h2>
              <p className="text-gray-600 mb-6">
                {beds.length === 0
                  ? 'Create a garden bed first, then add plants!'
                  : 'Add your first plant to start tracking your garden!'}
              </p>
              <button
                onClick={handleOpenLibrary}
                className="bg-primary hover:bg-primary-light text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                {beds.length === 0 ? 'Create Your First Bed' : 'Browse Plant Library'}
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
                  onClick={handleOpenLibrary}
                  className="bg-primary hover:bg-primary-light text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  + Add Plant
                </button>
              </div>

              {/* Group plants by bed */}
              {beds.map((bed) => {
                const plantsInBed = getPlantsByBed(bed.id);
                if (plantsInBed.length === 0) return null;

                const capacity = capacities[bed.id] || { total: 0, used: 0, available: 0, isOvercapacity: false };

                return (
                  <div key={bed.id} className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                      <h3 className="text-xl font-semibold text-gray-800">{bed.name}</h3>
                      <span className="text-sm text-gray-500">
                        ({bed.width}×{bed.height} ft)
                      </span>
                      <span className={`text-sm ${capacity.isOvercapacity ? 'text-red-600' : 'text-gray-500'}`}>
                        {capacity.used}/{capacity.total} sq ft
                      </span>
                      {capacity.isOvercapacity && (
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">
                          Overcrowded
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {plantsInBed.map((gardenPlant) => {
                        const plant = getPlantById(gardenPlant.plantId);
                        if (!plant) return null;

                        return (
                          <PlantCard
                            key={gardenPlant.id}
                            plant={plant}
                            gardenPlant={gardenPlant}
                            onRemove={handleRemovePlant}
                            onEdit={handleEditPlant}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Plants without beds (legacy/migration) */}
              {gardenPlants.filter(p => !p.bedId).length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Unassigned Plants</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {gardenPlants.filter(p => !p.bedId).map((gardenPlant) => {
                      const plant = getPlantById(gardenPlant.plantId);
                      if (!plant) return null;

                      return (
                        <PlantCard
                          key={gardenPlant.id}
                          plant={plant}
                          gardenPlant={gardenPlant}
                          onRemove={handleRemovePlant}
                          onEdit={handleEditPlant}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Create First Bed Modal */}
      {showBedForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <BedForm
              onSubmit={handleCreateBed}
              onCancel={() => setShowBedForm(false)}
            />
          </div>
        </div>
      )}

      {/* Plant Library Modal */}
      {showLibrary && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => {
            setShowLibrary(false);
            setSelectedPlantId(null);
            setSelectedBedId(null);
            setPlantQuantity(1);
          }}
        >
          <div
            className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-primary">
                    {selectedPlantId ? 'Select Bed & Quantity' : 'Plant Library'}
                  </h2>
                  <p className="text-gray-600">
                    {selectedPlantId ? `Adding ${selectedPlant?.name}` : 'Choose plants to add to your garden'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowLibrary(false);
                    setSelectedPlantId(null);
                    setSelectedBedId(null);
                    setPlantQuantity(1);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
                >
                  ×
                </button>
              </div>

              {!selectedPlantId && (
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
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {selectedPlantId ? (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={plantQuantity}
                      onChange={(e) => setPlantQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <BedSelector
                    beds={beds}
                    capacities={capacities}
                    selectedBedId={selectedBedId}
                    onSelect={setSelectedBedId}
                  />

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => {
                        setSelectedPlantId(null);
                        setSelectedBedId(null);
                        setPlantQuantity(1);
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleAddPlant}
                      disabled={!selectedBedId}
                      className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add to Garden
                    </button>
                  </div>
                </div>
              ) : (
                <>
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
                          onAdd={handleSelectPlant}
                          showAddButton={true}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Plant Modal */}
      {editingPlant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <PlantForm
              mode="edit"
              plant={editingPlant}
              onSubmit={handleEditSubmit}
              onCancel={handleEditCancel}
            />
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleResetToDefaults}
                className="w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Reset to Default Values
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyGarden;
