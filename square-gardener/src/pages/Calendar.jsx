function Calendar() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary mb-2">Planting Calendar</h1>
        <p className="text-gray-600">Find the best times to plant your crops</p>
      </div>

      <div className="bg-card rounded-xl p-8 text-center shadow-md">
        <div className="text-6xl mb-4">📅</div>
        <h2 className="text-2xl font-semibold text-primary mb-2">Coming Soon</h2>
        <p className="text-gray-600">
          This feature will show you optimal planting times for each season.
        </p>
      </div>
    </div>
  );
}

export default Calendar;
