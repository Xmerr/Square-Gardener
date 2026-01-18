import { NavLink } from 'react-router-dom';

function Navigation() {
  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center space-x-2 sm:space-x-4 md:space-x-8 py-3 sm:py-4 overflow-x-auto">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `px-3 py-2 rounded-md text-sm sm:text-base font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-primary text-white'
                  : 'text-gray-700 hover:bg-primary-light hover:text-white'
              }`
            }
          >
            🏠 Home
          </NavLink>
          <NavLink
            to="/my-garden"
            className={({ isActive }) =>
              `px-3 py-2 rounded-md text-sm sm:text-base font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-primary text-white'
                  : 'text-gray-700 hover:bg-primary-light hover:text-white'
              }`
            }
          >
            🌿 My Garden
          </NavLink>
          <NavLink
            to="/watering"
            className={({ isActive }) =>
              `px-3 py-2 rounded-md text-sm sm:text-base font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-primary text-white'
                  : 'text-gray-700 hover:bg-primary-light hover:text-white'
              }`
            }
          >
            💧 Watering
          </NavLink>
          <NavLink
            to="/planner"
            className={({ isActive }) =>
              `px-3 py-2 rounded-md text-sm sm:text-base font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-primary text-white'
                  : 'text-gray-700 hover:bg-primary-light hover:text-white'
              }`
            }
          >
            📐 Planner
          </NavLink>
          <NavLink
            to="/calendar"
            className={({ isActive }) =>
              `px-3 py-2 rounded-md text-sm sm:text-base font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-primary text-white'
                  : 'text-gray-700 hover:bg-primary-light hover:text-white'
              }`
            }
          >
            📅 Calendar
          </NavLink>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
