import PropTypes from 'prop-types';
import {
  groupScheduleByMonth,
  getMonthLabel,
  formatDate,
  getSeasonColor
} from '../utils/plantingSchedule';

function PlantingTimeline({ schedule, frostDates }) {
  if (!schedule || schedule.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Planting Schedule</h3>
        <p className="text-center text-gray-500 py-8">
          No planting schedule available. Select plants to see when to plant them.
        </p>
      </div>
    );
  }

  const groupedSchedule = groupScheduleByMonth(schedule);
  const months = Object.keys(groupedSchedule).sort();

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Planting Schedule</h3>

      {frostDates && frostDates.lastSpringFrost && frostDates.firstFallFrost && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
          <div className="flex flex-wrap gap-4">
            <span className="text-blue-800">
              <strong>Last Spring Frost:</strong> {formatDate(frostDates.lastSpringFrost)}
            </span>
            <span className="text-blue-800">
              <strong>First Fall Frost:</strong> {formatDate(frostDates.firstFallFrost)}
            </span>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {months.map((monthKey) => {
          const items = groupedSchedule[monthKey];
          const monthLabel = getMonthLabel(monthKey);

          return (
            <div key={monthKey} className="border-l-4 border-primary pl-4">
              <h4 className="text-base font-semibold text-gray-700 mb-3">{monthLabel}</h4>
              <div className="space-y-2">
                {items.map((item) => {
                  const seasonColors = getSeasonColor(item.season);
                  return (
                    <div
                      key={item.plantId}
                      className={`p-3 rounded-lg border ${seasonColors}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-medium">{item.plantName}</p>
                          <p className="text-sm mt-1">
                            <span className="capitalize">{item.season}</span> planting window
                          </p>
                        </div>
                        <div className="text-right text-sm">
                          <div className="font-medium">
                            {formatDate(item.plantingWindow.start)} - {formatDate(item.plantingWindow.end)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-gray-600">Spring</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <span className="text-gray-600">Summer</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span className="text-gray-600">Fall</span>
          </div>
        </div>
      </div>
    </div>
  );
}

PlantingTimeline.propTypes = {
  schedule: PropTypes.arrayOf(
    PropTypes.shape({
      plantId: PropTypes.string.isRequired,
      plantName: PropTypes.string.isRequired,
      plantingWindow: PropTypes.shape({
        start: PropTypes.string.isRequired,
        end: PropTypes.string.isRequired
      }).isRequired,
      season: PropTypes.string.isRequired
    })
  ),
  frostDates: PropTypes.shape({
    lastSpringFrost: PropTypes.string,
    firstFallFrost: PropTypes.string,
    zipCode: PropTypes.string
  })
};

export default PlantingTimeline;
