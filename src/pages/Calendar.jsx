function Calendar() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary mb-2">Planting Calendar</h1>
        <p className="text-gray-600">Find the best times to plant your crops</p>
      </div>

      <div className="bg-card rounded-xl p-8 shadow-md">
        <div className="text-6xl mb-6 text-center">📅</div>
        <h2 className="text-2xl font-semibold text-primary mb-4 text-center">Coming Soon</h2>

        <div className="max-w-3xl mx-auto">
          <p className="text-gray-700 mb-6 text-center">
            Plan your garden with confidence. Know exactly when to plant each crop for the best results in your climate zone.
          </p>

          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-primary mb-2 flex items-center gap-2">
                <span className="text-xl">🌡️</span>
                Frost Date Integration
              </h3>
              <p className="text-gray-700 text-sm">
                Enter your location's last spring frost and first fall frost dates. The calendar will automatically calculate optimal planting windows for each crop based on your local climate.
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-primary mb-2 flex items-center gap-2">
                <span className="text-xl">📆</span>
                Seasonal Planting Timeline
              </h3>
              <p className="text-gray-700 text-sm">
                View a visual timeline showing when to plant spring crops (after frost), summer crops (mid-season), and fall crops (before first frost). Each plant has specific planting windows for maximum success.
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-primary mb-2 flex items-center gap-2">
                <span className="text-xl">⏰</span>
                Harvest Date Predictions
              </h3>
              <p className="text-gray-700 text-sm">
                Based on days to maturity for each plant, the calendar will show you when to expect your harvest. Plan succession plantings to extend your harvest season throughout the year.
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-primary mb-2 flex items-center gap-2">
                <span className="text-xl">🌱</span>
                Plant-Specific Guidance
              </h3>
              <p className="text-gray-700 text-sm">
                See detailed planting instructions for each crop. Learn whether to direct seed or transplant, indoor vs. outdoor starting times, and special timing considerations for your favorite vegetables.
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-primary mb-2 flex items-center gap-2">
                <span className="text-xl">🗓️</span>
                Multi-Season Planning
              </h3>
              <p className="text-gray-700 text-sm">
                Plan your entire growing season at once. See which crops can be planted together in spring, what to plant in summer for fall harvest, and how to maximize your garden's productivity year-round.
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 inline-block">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">💡 Tip:</span> This feature will integrate with Planning Mode to help you create optimal garden layouts based on planting times and companion relationships.
              </p>
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>We're working hard to bring you this feature. Stay tuned for updates!</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Calendar;
