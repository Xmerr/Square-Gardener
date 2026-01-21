import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Calendar from './Calendar';

describe('Calendar', () => {
  it('renders page title', () => {
    render(<Calendar />);
    expect(screen.getByText('Planting Calendar')).toBeInTheDocument();
  });

  it('renders page subtitle', () => {
    render(<Calendar />);
    expect(screen.getByText('Find the best times to plant your crops')).toBeInTheDocument();
  });

  it('shows coming soon message', () => {
    render(<Calendar />);
    expect(screen.getByText('Coming Soon')).toBeInTheDocument();
  });

  it('shows main feature description', () => {
    render(<Calendar />);
    expect(
      screen.getByText('Plan your garden with confidence. Know exactly when to plant each crop for the best results in your climate zone.')
    ).toBeInTheDocument();
  });

  it('renders calendar emoji', () => {
    render(<Calendar />);
    expect(screen.getByText('📅')).toBeInTheDocument();
  });

  it('shows frost date integration feature', () => {
    render(<Calendar />);
    expect(screen.getByText('Frost Date Integration')).toBeInTheDocument();
    expect(
      screen.getByText(/Enter your location's last spring frost and first fall frost dates/)
    ).toBeInTheDocument();
  });

  it('shows seasonal planting timeline feature', () => {
    render(<Calendar />);
    expect(screen.getByText('Seasonal Planting Timeline')).toBeInTheDocument();
    expect(
      screen.getByText(/View a visual timeline showing when to plant spring crops/)
    ).toBeInTheDocument();
  });

  it('shows harvest date predictions feature', () => {
    render(<Calendar />);
    expect(screen.getByText('Harvest Date Predictions')).toBeInTheDocument();
    expect(
      screen.getByText(/Based on days to maturity for each plant/)
    ).toBeInTheDocument();
  });

  it('shows plant-specific guidance feature', () => {
    render(<Calendar />);
    expect(screen.getByText('Plant-Specific Guidance')).toBeInTheDocument();
    expect(
      screen.getByText(/See detailed planting instructions for each crop/)
    ).toBeInTheDocument();
  });

  it('shows multi-season planning feature', () => {
    render(<Calendar />);
    expect(screen.getByText('Multi-Season Planning')).toBeInTheDocument();
    expect(
      screen.getByText(/Plan your entire growing season at once/)
    ).toBeInTheDocument();
  });

  it('shows planning mode integration tip', () => {
    render(<Calendar />);
    expect(
      screen.getByText(/This feature will integrate with Planning Mode/)
    ).toBeInTheDocument();
  });

  it('shows status message', () => {
    render(<Calendar />);
    expect(
      screen.getByText("We're working hard to bring you this feature. Stay tuned for updates!")
    ).toBeInTheDocument();
  });
});
