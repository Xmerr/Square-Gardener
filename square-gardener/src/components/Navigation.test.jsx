import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Navigation from './Navigation';

const renderWithRouter = (initialEntries = ['/']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Navigation />
    </MemoryRouter>
  );
};

describe('Navigation', () => {
  it('renders all navigation links', () => {
    renderWithRouter();
    expect(screen.getByText('🏠 Home')).toBeInTheDocument();
    expect(screen.getByText('🌿 My Garden')).toBeInTheDocument();
    expect(screen.getByText('💧 Watering')).toBeInTheDocument();
    expect(screen.getByText('📐 Planner')).toBeInTheDocument();
    expect(screen.getByText('📅 Calendar')).toBeInTheDocument();
  });

  it('home link has correct href', () => {
    renderWithRouter();
    const homeLink = screen.getByText('🏠 Home').closest('a');
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('my garden link has correct href', () => {
    renderWithRouter();
    const gardenLink = screen.getByText('🌿 My Garden').closest('a');
    expect(gardenLink).toHaveAttribute('href', '/my-garden');
  });

  it('watering link has correct href', () => {
    renderWithRouter();
    const wateringLink = screen.getByText('💧 Watering').closest('a');
    expect(wateringLink).toHaveAttribute('href', '/watering');
  });

  it('planner link has correct href', () => {
    renderWithRouter();
    const plannerLink = screen.getByText('📐 Planner').closest('a');
    expect(plannerLink).toHaveAttribute('href', '/planner');
  });

  it('calendar link has correct href', () => {
    renderWithRouter();
    const calendarLink = screen.getByText('📅 Calendar').closest('a');
    expect(calendarLink).toHaveAttribute('href', '/calendar');
  });

  it('applies active class to current route', () => {
    renderWithRouter(['/my-garden']);
    const gardenLink = screen.getByText('🌿 My Garden').closest('a');
    expect(gardenLink.className).toContain('bg-primary');
  });

  it('applies inactive class to non-current routes', () => {
    renderWithRouter(['/']);
    const gardenLink = screen.getByText('🌿 My Garden').closest('a');
    expect(gardenLink.className).toContain('text-gray-700');
  });

  it('applies active class to watering route', () => {
    renderWithRouter(['/watering']);
    const wateringLink = screen.getByText('💧 Watering').closest('a');
    expect(wateringLink.className).toContain('bg-primary');
  });

  it('applies active class to planner route', () => {
    renderWithRouter(['/planner']);
    const plannerLink = screen.getByText('📐 Planner').closest('a');
    expect(plannerLink.className).toContain('bg-primary');
  });

  it('applies active class to calendar route', () => {
    renderWithRouter(['/calendar']);
    const calendarLink = screen.getByText('📅 Calendar').closest('a');
    expect(calendarLink.className).toContain('bg-primary');
  });

  it('applies active class to home route', () => {
    renderWithRouter(['/']);
    const homeLink = screen.getByText('🏠 Home').closest('a');
    expect(homeLink.className).toContain('bg-primary');
  });
});
