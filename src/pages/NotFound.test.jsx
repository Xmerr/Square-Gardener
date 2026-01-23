import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import NotFound from './NotFound';

const renderNotFound = () => {
  return render(
    <MemoryRouter>
      <NotFound />
    </MemoryRouter>
  );
};

describe('NotFound', () => {
  describe('basic rendering', () => {
    it('renders 404 heading', () => {
      renderNotFound();
      expect(screen.getByText('404')).toBeInTheDocument();
    });

    it('renders Page Not Found title', () => {
      renderNotFound();
      expect(screen.getByText('Page Not Found')).toBeInTheDocument();
    });

    it('renders friendly error message', () => {
      renderNotFound();
      expect(screen.getByText(/Oops! It looks like this garden path doesn't exist/i)).toBeInTheDocument();
    });

    it('renders garden emoji', () => {
      renderNotFound();
      expect(screen.getByText('🌵')).toBeInTheDocument();
    });
  });

  describe('navigation options', () => {
    it('renders Go to Home button', () => {
      renderNotFound();
      const homeButton = screen.getByText('🏠 Go to Home');
      expect(homeButton).toBeInTheDocument();
      expect(homeButton.closest('a')).toHaveAttribute('href', '/');
    });

    it('renders View My Garden button', () => {
      renderNotFound();
      const gardenButton = screen.getByText('🌿 View My Garden');
      expect(gardenButton).toBeInTheDocument();
      expect(gardenButton.closest('a')).toHaveAttribute('href', '/my-garden');
    });
  });

  describe('quick navigation links', () => {
    it('renders Quick Navigation section', () => {
      renderNotFound();
      expect(screen.getByText('Quick Navigation')).toBeInTheDocument();
    });

    it('renders Planner link', () => {
      renderNotFound();
      const plannerLink = screen.getByText('📐 Planner');
      expect(plannerLink).toBeInTheDocument();
      expect(plannerLink.closest('a')).toHaveAttribute('href', '/planner');
    });

    it('renders Calendar link', () => {
      renderNotFound();
      const calendarLink = screen.getByText('📅 Calendar');
      expect(calendarLink).toBeInTheDocument();
      expect(calendarLink.closest('a')).toHaveAttribute('href', '/calendar');
    });
  });

  describe('styling', () => {
    it('applies consistent card styling', () => {
      const { container } = renderNotFound();
      const card = container.querySelector('.bg-card');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('rounded-xl', 'shadow-md');
    });

    it('applies primary color to buttons', () => {
      renderNotFound();
      const homeButton = screen.getByText('🏠 Go to Home');
      expect(homeButton).toHaveClass('bg-primary');
    });
  });
});
