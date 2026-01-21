function Watering() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary mb-2">Watering Schedule</h1>
        <p className="text-gray-600">Track and manage your plant watering</p>
      </div>

      <div className="bg-card rounded-xl p-8 shadow-md">
        <div className="text-6xl mb-6 text-center">💧</div>
        <h2 className="text-2xl font-semibold text-primary mb-4 text-center">Coming Soon</h2>

        <div className="max-w-3xl mx-auto">
          <p className="text-gray-700 mb-6 text-center">
            Never forget to water your plants again. The Watering Schedule feature will help you keep your garden healthy and thriving.
          </p>

          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-primary mb-2 flex items-center gap-2">
                <span className="text-xl">📅</span>
                Smart Watering Calendar
              </h3>
              <p className="text-gray-700 text-sm">
                View a calendar showing when each plant needs water based on its specific watering frequency. See at a glance which plants need attention today, tomorrow, or this week.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-primary mb-2 flex items-center gap-2">
                <span className="text-xl">🔔</span>
                Watering Alerts
              </h3>
              <p className="text-gray-700 text-sm">
                Get notified when plants are overdue for watering. Each plant in your garden will be tracked based on when you last watered it and its specific watering needs.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-primary mb-2 flex items-center gap-2">
                <span className="text-xl">✓</span>
                Quick Actions
              </h3>
              <p className="text-gray-700 text-sm">
                Mark plants as watered with a single click. Update watering dates for individual plants or water your entire garden at once. Track your watering history to optimize your schedule.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-primary mb-2 flex items-center gap-2">
                <span className="text-xl">📊</span>
                Plant-Specific Requirements
              </h3>
              <p className="text-gray-700 text-sm">
                Different plants have different watering needs. Tomatoes need water every 1-2 days, while succulents can go 7-14 days. The system will track each plant's individual requirements automatically.
              </p>
            </div>
          </div>

          <div className="mt-8 text-center text-sm text-gray-500">
            <p>We're working hard to bring you this feature. Stay tuned for updates!</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Watering;
