import { useState } from 'react';
import FrostDateForm from '../components/FrostDateForm';
import PlantSelector from '../components/PlantSelector';
import PlanningGrid from '../components/PlanningGrid';
import PlantingTimeline from '../components/PlantingTimeline';
import { getGardenBeds } from '../utils/storage';
import { getFrostDates } from '../utils/frostDateStorage';
import { generateArrangement } from '../utils/planningAlgorithm';
import { generatePlantingSchedule } from '../utils/plantingSchedule';

function Planner() {
  const [beds] = useState(() => getGardenBeds());
  const [selectedBed, setSelectedBed] = useState(() => {
    const loadedBeds = getGardenBeds();
    return loadedBeds.length > 0 ? loadedBeds[0] : null;
  });
  const [frostDates, setFrostDates] = useState(() => getFrostDates());
  const [selectedPlants, setSelectedPlants] = useState([]);
  const [arrangement, setArrangement] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [error, setError] = useState(null);

  const handleFrostDatesSave = (dates) => {
    setFrostDates(dates);
    // Regenerate schedule if plants are selected
    if (selectedPlants.length > 0 && dates) {
      const newSchedule = generatePlantingSchedule(selectedPlants, dates);
      setSchedule(newSchedule);
    }
  };

  const handlePlantsSelected = (plants) => {
    setSelectedPlants(plants);
    setError(null);
  };

  const handleGeneratePlan = () => {
    setError(null);

    try {
      const result = generateArrangement({
        width: selectedBed.width,
        height: selectedBed.height,
        plantSelections: selectedPlants,
        lockedSquares: null
      });

      setArrangement(result);

      // Generate planting schedule if frost dates are available
      if (frostDates && frostDates.lastSpringFrost && frostDates.firstFallFrost) {
        const newSchedule = generatePlantingSchedule(selectedPlants, frostDates);
        setSchedule(newSchedule);
      }
    } catch (err) {
      setError(err.message);
      setArrangement(null);
      setSchedule([]);
    }
  };

  const handleBedChange = (bedId) => {
    const bed = beds.find(b => b.id === bedId);
    setSelectedBed(bed);
    setArrangement(null);
    setSchedule([]);
    setError(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary mb-2">Garden Planner</h1>
        <p className="text-gray-600">Design your square foot garden layout</p>
      </div>

      <div className="space-y-6">
        <FrostDateForm onSave={handleFrostDatesSave} initialFrostDates={frostDates} />

        {beds.length === 0 ? (
          <div className="bg-card rounded-xl p-8 text-center shadow-md">
            <div className="text-6xl mb-4">📐</div>
            <h2 className="text-2xl font-semibold text-primary mb-2">No Beds Available</h2>
            <p className="text-gray-600">
              Create a garden bed in My Garden to start planning.
            </p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Select Bed</h2>
              <select
                value={selectedBed.id}
                onChange={(e) => handleBedChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              >
                {beds.map((bed) => (
                  <option key={bed.id} value={bed.id}>
                    {bed.name} ({bed.width}×{bed.height})
                  </option>
                ))}
              </select>
            </div>

            {selectedBed && (
              <>
                <PlantSelector
                  selectedPlants={selectedPlants}
                  onPlantsSelected={handlePlantsSelected}
                  availableSquares={selectedBed.width * selectedBed.height}
                />

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800">{error}</p>
                  </div>
                )}

                <div className="flex justify-center">
                  <button
                    onClick={handleGeneratePlan}
                    disabled={selectedPlants.length === 0}
                    className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Generate Plan
                  </button>
                </div>

                {arrangement && (
                  <PlanningGrid
                    arrangement={arrangement}
                    bed={selectedBed}
                    onSquareClick={null}
                    lockedSquares={null}
                  />
                )}

                {schedule.length > 0 && (
                  <PlantingTimeline schedule={schedule} frostDates={frostDates} />
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Planner;
