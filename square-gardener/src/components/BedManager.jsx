import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import BedCard from './BedCard';
import BedForm from './BedForm';
import {
  getGardenBeds,
  addGardenBed,
  updateGardenBed,
  removeGardenBed,
  getBedCapacity,
  getPlantsByBed
} from '../utils/storage';

function BedManager({ onBedChange }) {
  const [beds, setBeds] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingBed, setEditingBed] = useState(null);
  const [capacities, setCapacities] = useState({});
  const [plantCounts, setPlantCounts] = useState({});
  const [deleteError, setDeleteError] = useState(null);

  const loadBeds = () => {
    const loadedBeds = getGardenBeds();
    setBeds(loadedBeds);

    const caps = {};
    const counts = {};
    loadedBeds.forEach((bed) => {
      caps[bed.id] = getBedCapacity(bed.id);
      counts[bed.id] = getPlantsByBed(bed.id).length;
    });
    setCapacities(caps);
    setPlantCounts(counts);
  };

  useEffect(() => {
    loadBeds();
  }, []);

  const handleCreateBed = (data) => {
    addGardenBed(data.name, data.width, data.height);
    loadBeds();
    setShowForm(false);
    onBedChange?.();
  };

  const handleUpdateBed = (data) => {
    updateGardenBed(editingBed.id, data);
    loadBeds();
    setEditingBed(null);
    onBedChange?.();
  };

  const handleDeleteBed = (bed) => {
    setDeleteError(null);
    const success = removeGardenBed(bed.id);
    if (success) {
      loadBeds();
      onBedChange?.();
    } else {
      setDeleteError('Cannot delete the last bed while plants exist. Please remove plants first or create another bed.');
    }
  };

  const handleEdit = (bed) => {
    setEditingBed(bed);
    setShowForm(false);
    setDeleteError(null);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingBed(null);
    setDeleteError(null);
  };

  const handleAddNew = () => {
    setShowForm(true);
    setEditingBed(null);
    setDeleteError(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Garden Beds</h2>
        {!showForm && !editingBed && (
          <button
            onClick={handleAddNew}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Bed
          </button>
        )}
      </div>

      {deleteError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {deleteError}
        </div>
      )}

      {(showForm || editingBed) && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <BedForm
            bed={editingBed}
            onSubmit={editingBed ? handleUpdateBed : handleCreateBed}
            onCancel={handleCancelForm}
          />
        </div>
      )}

      {beds.length === 0 && !showForm ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-700 mb-2">No Garden Beds Yet</h3>
          <p className="text-gray-500 mb-4">Create your first bed to start organizing your garden.</p>
          <button
            onClick={handleAddNew}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors"
          >
            Create Your First Bed
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {beds.map((bed) => (
            <BedCard
              key={bed.id}
              bed={bed}
              capacity={capacities[bed.id] || { total: 0, used: 0, available: 0, isOvercapacity: false }}
              plantCount={plantCounts[bed.id] || 0}
              onEdit={handleEdit}
              onDelete={handleDeleteBed}
            />
          ))}
        </div>
      )}
    </div>
  );
}

BedManager.propTypes = {
  onBedChange: PropTypes.func
};

export default BedManager;
