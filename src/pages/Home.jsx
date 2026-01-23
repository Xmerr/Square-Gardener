import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getGardenPlants, getGardenBeds } from '../utils/storage';
import { getPlantById } from '../data/plantLibrary';

function Home() {
  const [stats, setStats] = useState({
    totalPlants: 0,
    plantsNeedingWater: 0,
    upcomingHarvests: [],
    hasBeds: false
  });

  useEffect(() => {
    const gardenPlants = getGardenPlants();
    const gardenBeds = getGardenBeds();
    const today = new Date();

    // Calculate plants needing water
    const plantsNeedingWater = gardenPlants.filter(gp => {
      const plant = getPlantById(gp.plantId);
      if (!plant) return false;

      const lastWatered = new Date(gp.lastWatered);
      const daysSinceWatered = Math.floor((today - lastWatered) / (1000 * 60 * 60 * 24));
      return daysSinceWatered >= plant.wateringFrequency;
    }).length;

    // Calculate upcoming harvests (next 30 days)
    const upcomingHarvests = gardenPlants
      .map(gp => {
        const plant = getPlantById(gp.plantId);
        if (!plant) return null;

        const plantedDate = new Date(gp.plantedDate);
        const daysGrown = Math.floor((today - plantedDate) / (1000 * 60 * 60 * 24));
        const daysRemaining = plant.daysToMaturity - daysGrown;

        return {
          name: plant.name,
          daysRemaining,
          isReady: daysRemaining <= 0
        };
      })
      .filter(h => h && (h.isReady || h.daysRemaining <= 30))
      .sort((a, b) => a.daysRemaining - b.daysRemaining)
      .slice(0, 5);

    // Loading initial data from localStorage on mount is the correct pattern here
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStats({
      totalPlants: gardenPlants.length,
      plantsNeedingWater,
      upcomingHarvests,
      hasBeds: gardenBeds.length > 0
    });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-primary mb-2">Welcome to Square Gardener</h1>
        <p className="text-lg text-gray-600">Your Square Foot Gardening Companion</p>
      </div>

      {/* Getting Started - Prominent for New Users */}
      {stats.totalPlants === 0 && (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 shadow-lg border-2 border-primary mb-8">
          <div className="text-center">
            <div className="text-7xl mb-4 animate-bounce">🌱</div>
            <h2 className="text-3xl font-bold text-primary mb-4">
              Get Started with Square Gardening
            </h2>
            <p className="text-lg text-gray-700 mb-6 max-w-2xl mx-auto leading-relaxed">
              {!stats.hasBeds
                ? 'Square Foot Gardening is a simple way to grow more food in less space. Start by creating your first garden bed!'
                : 'Square Foot Gardening is a simple way to grow more food in less space. Start by adding plants to your garden and let us help you track watering schedules, harvests, and more!'
              }
            </p>
            <Link
              to="/my-garden"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-light text-white font-bold text-lg py-4 px-10 rounded-xl transition-all transform hover:scale-105 shadow-md hover:shadow-xl"
            >
              <span className="text-2xl">{!stats.hasBeds ? '🛏️' : '🌿'}</span>
              <span>{!stats.hasBeds ? 'Create Your First Bed' : 'Add Your First Plant'}</span>
            </Link>
          </div>
        </div>
      )}

      {/* View Your Garden - For Existing Users */}
      {stats.totalPlants > 0 && (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 shadow-lg border-2 border-primary mb-8">
          <div className="text-center">
            <div className="text-7xl mb-4">🌿</div>
            <h2 className="text-3xl font-bold text-primary mb-4">
              Your Garden is Growing
            </h2>
            <p className="text-lg text-gray-700 mb-6 max-w-2xl mx-auto leading-relaxed">
              Track your plants, monitor watering schedules, and see when your harvest will be ready!
            </p>
            <Link
              to="/my-garden"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-light text-white font-bold text-lg py-4 px-10 rounded-xl transition-all transform hover:scale-105 shadow-md hover:shadow-xl"
            >
              <span className="text-2xl">🌻</span>
              <span>View Your Garden</span>
            </Link>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link
          to="/my-garden"
          className="bg-gradient-to-br from-green-400 to-green-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm uppercase tracking-wide mb-1">Total Plants</p>
              <p className="text-4xl font-bold">{stats.totalPlants}</p>
            </div>
            <div className="text-5xl opacity-80">🌱</div>
          </div>
        </Link>

        <Link
          to="/watering"
          className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm uppercase tracking-wide mb-1">Need Water</p>
              <p className="text-4xl font-bold">{stats.plantsNeedingWater}</p>
            </div>
            <div className="text-5xl opacity-80">💧</div>
          </div>
        </Link>

        <Link
          to="/my-garden"
          className="bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-sm uppercase tracking-wide mb-1">Ready to Harvest</p>
              <p className="text-4xl font-bold">
                {stats.upcomingHarvests.filter(h => h.isReady).length}
              </p>
            </div>
            <div className="text-5xl opacity-80">🌾</div>
          </div>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Link
          to="/my-garden"
          className="bg-card rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border-2 border-transparent hover:border-primary"
        >
          <div className="flex items-center gap-4">
            <div className="text-5xl">🌿</div>
            <div>
              <h3 className="text-xl font-semibold text-primary mb-1">My Garden</h3>
              <p className="text-gray-600">Add and manage your plants</p>
            </div>
          </div>
        </Link>

        <Link
          to="/watering"
          className="bg-card rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border-2 border-transparent hover:border-primary"
        >
          <div className="flex items-center gap-4">
            <div className="text-5xl">💧</div>
            <div>
              <h3 className="text-xl font-semibold text-primary mb-1">Watering Schedule</h3>
              <p className="text-gray-600">Track and update watering</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Upcoming Harvests */}
      {stats.upcomingHarvests.length > 0 && (
        <div className="bg-card rounded-xl p-6 shadow-md">
          <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
            <span>🌾</span>
            <span>Upcoming Harvests</span>
          </h2>
          <div className="space-y-3">
            {stats.upcomingHarvests.map((harvest, index) => (
              <div
                key={index}
                className={`flex justify-between items-center p-3 rounded-lg ${
                  harvest.isReady
                    ? 'bg-green-100 border border-green-300'
                    : 'bg-gray-50'
                }`}
              >
                <span className="font-medium text-gray-800">{harvest.name}</span>
                <span
                  className={`font-bold ${
                    harvest.isReady
                      ? 'text-green-600'
                      : 'text-gray-600'
                  }`}
                >
                  {harvest.isReady ? 'Ready now!' : `${harvest.daysRemaining} days`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
