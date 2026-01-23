import { NavLink } from 'react-router-dom';
import { useState } from 'react';

function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const navLinkClass = ({ isActive }) =>
    `block px-4 py-2 rounded-md text-base font-medium transition-colors focus-visible:outline focus-visible:outline-3 focus-visible:outline-blue-600 focus-visible:outline-offset-2 ${
      isActive
        ? 'bg-primary text-white'
        : 'text-gray-700 hover:bg-primary-light hover:text-white'
    }`;

  const links = [
    { to: '/', label: '🏠 Home' },
    { to: '/my-garden', label: '🌿 My Garden' },
    { to: '/planner', label: '📐 Planner' },
    { to: '/calendar', label: '📅 Calendar' },
  ];

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mobile menu button */}
        <div className="md:hidden flex justify-between items-center py-3">
          <span className="text-sm font-medium text-gray-700">Menu</span>
          <button
            onClick={toggleMobileMenu}
            className="p-2 rounded-md text-gray-700 hover:bg-gray-100 focus-visible:outline focus-visible:outline-3 focus-visible:outline-blue-600 focus-visible:outline-offset-2 transition-colors"
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile dropdown menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-3 space-y-1">
            {links.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                className={navLinkClass}
                onClick={closeMobileMenu}
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        )}

        {/* Desktop menu */}
        <div className="hidden md:flex justify-center space-x-4 lg:space-x-8 py-4">
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `px-4 py-2 rounded-md text-base font-medium whitespace-nowrap transition-colors focus-visible:outline focus-visible:outline-3 focus-visible:outline-blue-600 focus-visible:outline-offset-2 ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-primary-light hover:text-white'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
