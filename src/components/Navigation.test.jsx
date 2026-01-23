import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import Navigation from './Navigation';

const renderWithRouter = (initialEntries = ['/']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Navigation />
    </MemoryRouter>
  );
};

describe('Navigation', () => {
  describe('Desktop Navigation', () => {
    it('renders all navigation links in desktop view', () => {
      renderWithRouter();
      const links = screen.getAllByText('🏠 Home');
      expect(links.length).toBeGreaterThan(0);
      expect(screen.getAllByText('🌿 My Garden').length).toBeGreaterThan(0);
      expect(screen.getAllByText('📐 Planner').length).toBeGreaterThan(0);
      expect(screen.getAllByText('📅 Calendar').length).toBeGreaterThan(0);
    });

    it('home link has correct href', () => {
      renderWithRouter();
      const homeLinks = screen.getAllByText('🏠 Home');
      const homeLink = homeLinks[0].closest('a');
      expect(homeLink).toHaveAttribute('href', '/');
    });

    it('my garden link has correct href', () => {
      renderWithRouter();
      const gardenLinks = screen.getAllByText('🌿 My Garden');
      const gardenLink = gardenLinks[0].closest('a');
      expect(gardenLink).toHaveAttribute('href', '/my-garden');
    });

    it('planner link has correct href', () => {
      renderWithRouter();
      const plannerLinks = screen.getAllByText('📐 Planner');
      const plannerLink = plannerLinks[0].closest('a');
      expect(plannerLink).toHaveAttribute('href', '/planner');
    });

    it('calendar link has correct href', () => {
      renderWithRouter();
      const calendarLinks = screen.getAllByText('📅 Calendar');
      const calendarLink = calendarLinks[0].closest('a');
      expect(calendarLink).toHaveAttribute('href', '/calendar');
    });

    it('applies active class to current route', () => {
      renderWithRouter(['/my-garden']);
      const gardenLinks = screen.getAllByText('🌿 My Garden');
      const gardenLink = gardenLinks[0].closest('a');
      expect(gardenLink.className).toContain('bg-primary');
    });

    it('applies inactive class to non-current routes', () => {
      renderWithRouter(['/']);
      const gardenLinks = screen.getAllByText('🌿 My Garden');
      const gardenLink = gardenLinks[0].closest('a');
      expect(gardenLink.className).toContain('text-gray-700');
    });

    it('applies active class to planner route', () => {
      renderWithRouter(['/planner']);
      const plannerLinks = screen.getAllByText('📐 Planner');
      const plannerLink = plannerLinks[0].closest('a');
      expect(plannerLink.className).toContain('bg-primary');
    });

    it('applies active class to calendar route', () => {
      renderWithRouter(['/calendar']);
      const calendarLinks = screen.getAllByText('📅 Calendar');
      const calendarLink = calendarLinks[0].closest('a');
      expect(calendarLink.className).toContain('bg-primary');
    });

    it('applies active class to home route', () => {
      renderWithRouter(['/']);
      const homeLinks = screen.getAllByText('🏠 Home');
      const homeLink = homeLinks[0].closest('a');
      expect(homeLink.className).toContain('bg-primary');
    });
  });

  describe('Mobile Navigation', () => {
    it('renders mobile menu button', () => {
      renderWithRouter();
      const menuButton = screen.getByLabelText('Toggle navigation menu');
      expect(menuButton).toBeInTheDocument();
    });

    it('mobile menu is closed by default', () => {
      renderWithRouter();
      const menuButton = screen.getByLabelText('Toggle navigation menu');
      expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('toggles mobile menu when button is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter();
      const menuButton = screen.getByLabelText('Toggle navigation menu');

      // Menu should be closed initially
      expect(menuButton).toHaveAttribute('aria-expanded', 'false');

      // Click to open
      await user.click(menuButton);
      expect(menuButton).toHaveAttribute('aria-expanded', 'true');

      // Click to close
      await user.click(menuButton);
      expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('displays hamburger icon when menu is closed', () => {
      renderWithRouter();
      const menuButton = screen.getByLabelText('Toggle navigation menu');
      const svg = menuButton.querySelector('svg');
      const path = svg.querySelector('path');
      expect(path).toHaveAttribute('d', 'M4 6h16M4 12h16M4 18h16');
    });

    it('displays close icon when menu is open', async () => {
      const user = userEvent.setup();
      renderWithRouter();
      const menuButton = screen.getByLabelText('Toggle navigation menu');

      await user.click(menuButton);

      const svg = menuButton.querySelector('svg');
      const path = svg.querySelector('path');
      expect(path).toHaveAttribute('d', 'M6 18L18 6M6 6l12 12');
    });

    it('closes mobile menu when a link is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter();
      const menuButton = screen.getByLabelText('Toggle navigation menu');

      // Open menu
      await user.click(menuButton);
      expect(menuButton).toHaveAttribute('aria-expanded', 'true');

      // Click a navigation link
      const links = screen.getAllByText('🌿 My Garden');
      const mobileLink = links.find(link => link.closest('a')?.className.includes('block'));
      await user.click(mobileLink);

      // Menu should be closed
      expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('shows all navigation links when mobile menu is open', async () => {
      const user = userEvent.setup();
      renderWithRouter();
      const menuButton = screen.getByLabelText('Toggle navigation menu');

      await user.click(menuButton);

      // All links should be visible in mobile menu
      const mobileLinks = screen.getAllByText('🏠 Home').filter(
        link => link.closest('a')?.className.includes('block')
      );
      expect(mobileLinks.length).toBe(1);
    });

    it('applies correct styling to mobile menu links', async () => {
      const user = userEvent.setup();
      renderWithRouter(['/planner']);
      const menuButton = screen.getByLabelText('Toggle navigation menu');

      await user.click(menuButton);

      const plannerLinks = screen.getAllByText('📐 Planner');
      const mobilePlannerLink = plannerLinks.find(
        link => link.closest('a')?.className.includes('block')
      );
      const linkElement = mobilePlannerLink.closest('a');

      expect(linkElement.className).toContain('block');
      expect(linkElement.className).toContain('bg-primary');
      expect(linkElement.className).toContain('text-white');
    });

    it('applies inactive styling to non-active mobile menu links', async () => {
      const user = userEvent.setup();
      renderWithRouter(['/']);
      const menuButton = screen.getByLabelText('Toggle navigation menu');

      await user.click(menuButton);

      const gardenLinks = screen.getAllByText('🌿 My Garden');
      const mobileGardenLink = gardenLinks.find(
        link => link.closest('a')?.className.includes('block')
      );
      const linkElement = mobileGardenLink.closest('a');

      expect(linkElement.className).toContain('text-gray-700');
      expect(linkElement.className.split(' ')).not.toContain('bg-primary');
    });

    it('renders Menu label in mobile view', () => {
      renderWithRouter();
      expect(screen.getByText('Menu')).toBeInTheDocument();
    });
  });
});
