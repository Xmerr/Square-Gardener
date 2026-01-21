import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-card rounded-xl p-8 shadow-md text-center">
        <div className="text-8xl mb-6">🌵</div>
        <h1 className="text-5xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-3xl font-semibold text-gray-800 mb-4">Page Not Found</h2>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          Oops! It looks like this garden path doesn't exist. The page you're looking for
          might have been moved, deleted, or never planted in the first place.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            to="/"
            className="bg-primary hover:bg-primary-light text-white font-medium py-3 px-8 rounded-lg transition-colors w-full sm:w-auto"
          >
            🏠 Go to Home
          </Link>
          <Link
            to="/my-garden"
            className="bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-8 rounded-lg transition-colors w-full sm:w-auto"
          >
            🌿 View My Garden
          </Link>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-gray-600 mb-4">Quick Navigation</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              to="/watering"
              className="text-primary hover:text-primary-light font-medium transition-colors"
            >
              💧 Watering
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              to="/planner"
              className="text-primary hover:text-primary-light font-medium transition-colors"
            >
              📐 Planner
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              to="/calendar"
              className="text-primary hover:text-primary-light font-medium transition-colors"
            >
              📅 Calendar
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
