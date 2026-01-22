import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Watering from './Watering';

describe('Watering', () => {
  it('renders page title', () => {
    render(<Watering />);
    expect(screen.getByText('Watering Schedule')).toBeInTheDocument();
  });

  it('renders page subtitle', () => {
    render(<Watering />);
    expect(screen.getByText('Track and manage your plant watering')).toBeInTheDocument();
  });

  it('shows coming soon message', () => {
    render(<Watering />);
    expect(screen.getByText('Coming Soon')).toBeInTheDocument();
  });

  it('shows main feature description', () => {
    render(<Watering />);
    expect(
      screen.getByText('Never forget to water your plants again. The Watering Schedule feature will help you keep your garden healthy and thriving.')
    ).toBeInTheDocument();
  });

  it('renders water drop emoji', () => {
    render(<Watering />);
    expect(screen.getByText('💧')).toBeInTheDocument();
  });

  it('shows smart watering calendar feature', () => {
    render(<Watering />);
    expect(screen.getByText('Smart Watering Calendar')).toBeInTheDocument();
    expect(
      screen.getByText(/View a calendar showing when each plant needs water/)
    ).toBeInTheDocument();
  });

  it('shows watering alerts feature', () => {
    render(<Watering />);
    expect(screen.getByText('Watering Alerts')).toBeInTheDocument();
    expect(
      screen.getByText(/Get notified when plants are overdue for watering/)
    ).toBeInTheDocument();
  });

  it('shows quick actions feature', () => {
    render(<Watering />);
    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    expect(
      screen.getByText(/Mark plants as watered with a single click/)
    ).toBeInTheDocument();
  });

  it('shows plant-specific requirements feature', () => {
    render(<Watering />);
    expect(screen.getByText('Plant-Specific Requirements')).toBeInTheDocument();
    expect(
      screen.getByText(/Different plants have different watering needs/)
    ).toBeInTheDocument();
  });

  it('shows status message', () => {
    render(<Watering />);
    expect(
      screen.getByText("We're working hard to bring you this feature. Stay tuned for updates!")
    ).toBeInTheDocument();
  });
});
