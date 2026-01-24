import { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import FrostDateForm from '../components/FrostDateForm';
import PlantSelector from '../components/PlantSelector';
import PlanningGrid from '../components/PlanningGrid';
import PlantingTimeline from '../components/PlantingTimeline';
import PlantPalette from '../components/PlantPalette';
import { getGardenBeds, updateBedGrid, addGardenPlant } from '../utils/storage';
import { getFrostDates } from '../utils/frostDateStorage';
import { generateArrangement, generateArrangementWithFill } from '../utils/planningAlgorithm';
import { generatePlantingSchedule } from '../utils/plantingSchedule';

function Planner() {
  const [searchParams] = useSearchParams();
  const [beds] = useState(() => getGardenBeds());
  const [selectedBed, setSelectedBed] = useState(() => {
    const loadedBeds = getGardenBeds();
    const bedParam = searchParams.get('bed');
    if (bedParam) {
      const bed = loadedBeds.find(b => b.id === bedParam);
      if (bed) return bed;
    }
    return loadedBeds.length > 0 ? loadedBeds[0] : null;
  });
  const [frostDates, setFrostDates] = useState(() => getFrostDates());
  const [selectedPlants, setSelectedPlants] = useState([]);
  const [arrangement, setArrangement] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [lockedSquares, setLockedSquares] = useState(null);
  const [fillMode, setFillMode] = useState(false);
  const [appliedSuccess, setAppliedSuccess] = useState(false);
  const [plantsCreatedCount, setPlantsCreatedCount] = useState(0);
  const processedUrlParam = useRef(false);

  // Handle URL parameter changes (only runs once on mount if URL param present)
  useEffect(() => {
    if (processedUrlParam.current) return;

    const bedParam = searchParams.get('bed');
    if (bedParam && beds.length > 0) {
      const bed = beds.find(b => b.id === bedParam);
      if (bed) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedBed(bed);
        processedUrlParam.current = true;
      }
    }
  }, [searchParams, beds]);

  const handleFrostDatesSave = (dates) => {
    setFrostDates(dates);
    // Regenerate schedule if plants are selected
    if (selectedPlants.length > 0 && dates) {
      const newSchedule = generatePlantingSchedule(selectedPlants, dates);
      setSchedule(newSchedule);
    }
  };

  const handleSelectionChange = (plants) => {
    setSelectedPlants(plants);
    setError(null);
  };

  const handleGeneratePlan = () => {
    setError(null);
    setFillMode(false);

    try {
      const result = generateArrangement({
        width: selectedBed.width,
        height: selectedBed.height,
        plantSelections: selectedPlants,
        lockedSquares: null
      });

      setArrangement(result);
      setHistory([result]);
      setHistoryIndex(0);
      setLockedSquares(Array.from({ length: selectedBed.height }, () => Array(selectedBed.width).fill(false)));

      // Generate planting schedule if frost dates are available
      if (frostDates && frostDates.lastSpringFrost && frostDates.firstFallFrost) {
        const newSchedule = generatePlantingSchedule(selectedPlants, frostDates);
        setSchedule(newSchedule);
      }
    } catch (err) {
      setError(err.message);
      setArrangement(null);
      setSchedule([]);
      setHistory([]);
      setHistoryIndex(-1);
      setLockedSquares(null);
    }
  };

  const handleArrangementChange = (newArrangement) => {
    setArrangement(newArrangement);

    // Add to history, removing any future history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newArrangement);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);
    setArrangement(history[newIndex]);
  };

  const handleRedo = () => {
    const newIndex = historyIndex + 1;
    setHistoryIndex(newIndex);
    setArrangement(history[newIndex]);
  };

  const handleRegenerate = () => {
    handleGeneratePlan();
  };

  const handleFillBed = () => {
    setError(null);

    try {
      const result = generateArrangementWithFill({
        width: selectedBed.width,
        height: selectedBed.height,
        plantSelections: selectedPlants,
        lockedSquares: lockedSquares,
        fillMode: true
      });

      setArrangement(result);
      setFillMode(true);

      // Add to history
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(result);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);

      // Generate planting schedule if frost dates are available
      if (frostDates && frostDates.lastSpringFrost && frostDates.firstFallFrost) {
        const newSchedule = generatePlantingSchedule(selectedPlants, frostDates);
        setSchedule(newSchedule);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSquareDelete = (row, col) => {
    if (!arrangement || !lockedSquares) return;

    // Create new grid with deleted square
    const newGrid = arrangement.grid.map(r => [...r]);
    newGrid[row][col] = null;

    // Mark square as locked (empty)
    const newLockedSquares = lockedSquares.map(r => [...r]);
    newLockedSquares[row][col] = true;

    setLockedSquares(newLockedSquares);
    handleArrangementChange({
      ...arrangement,
      grid: newGrid
    });
  };

  const handleBedChange = (bedId) => {
    const bed = beds.find(b => b.id === bedId);
    setSelectedBed(bed);
    setArrangement(null);
    setSchedule([]);
    setError(null);
    setLockedSquares(null);
    setFillMode(false);
    setAppliedSuccess(false);
  };

  const handleApplyPlan = () => {
    if (!arrangement || !selectedBed) return;

    // First, save the grid layout
    const result = updateBedGrid(selectedBed.id, arrangement.grid);
    if (!result) return;

    // Aggregate plants by plantId to get total quantity for each
    const plantCounts = {};
    const grid = arrangement.grid;
    for (let row = 0; row < grid.length; row++) {
      for (let col = 0; col < grid[row].length; col++) {
        const plantId = grid[row][col];
        if (plantId) {
          plantCounts[plantId] = (plantCounts[plantId] || 0) + 1;
        }
      }
    }

    // Create or update plant records for each unique plant
    let plantsCreated = 0;
    Object.entries(plantCounts).forEach(([plantId, quantity]) => {
      addGardenPlant(plantId, selectedBed.id, quantity);
      plantsCreated++;
    });

    setPlantsCreatedCount(plantsCreated);
    setAppliedSuccess(true);
    setTimeout(() => setAppliedSuccess(false), 3000);
  };

  // Get unique plant IDs for the palette
  const palettePlantIds = useMemo(() => {
    return selectedPlants.map(p => p.plantId);
  }, [selectedPlants]);

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
                  availableSpace={selectedBed.width * selectedBed.height}
                  onSelectionChange={handleSelectionChange}
                  initialSelections={null}
                  fillMode={fillMode}
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
                    title={selectedPlants.length === 0 ? "Select plants above to generate a plan" : ""}
                    className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Generate Plan
                  </button>
                </div>

                {arrangement && (
                  <>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white rounded-lg shadow-md p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={handleUndo}
                          disabled={historyIndex <= 0}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                          title="Undo last change"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                          </svg>
                          Undo
                        </button>
                        <button
                          onClick={handleRedo}
                          disabled={historyIndex >= history.length - 1}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                          title="Redo last undone change"
                        >
                          Redo
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
                          </svg>
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleFillBed}
                          disabled={!arrangement || arrangement.grid.flat().filter(p => p).length === selectedBed.width * selectedBed.height}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                          title="Fill remaining spaces with selected plants"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                          </svg>
                          Fill Bed
                        </button>
                        <button
                          onClick={handleRegenerate}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                          title="Generate a new arrangement with the same plants"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Regenerate
                        </button>
                        <button
                          onClick={handleApplyPlan}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                          title="Save this arrangement to the bed"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Apply Plan
                        </button>
                      </div>
                    </div>

                    {appliedSuccess && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <p className="text-sm text-green-700 font-medium">
                            Plan applied! Created {plantsCreatedCount} plant{plantsCreatedCount !== 1 ? 's' : ''} in {selectedBed.name}. View them in My Garden.
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col lg:flex-row gap-6">
                      <div className="flex-1">
                        <PlanningGrid
                          arrangement={arrangement}
                          bed={selectedBed}
                          onSquareClick={null}
                          lockedSquares={lockedSquares}
                          onArrangementChange={handleArrangementChange}
                          onSquareDelete={handleSquareDelete}
                          editable={true}
                        />
                      </div>
                      {palettePlantIds.length > 0 && (
                        <div className="lg:w-64">
                          <PlantPalette plantIds={palettePlantIds} />
                        </div>
                      )}
                    </div>
                  </>
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
