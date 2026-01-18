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

  it('shows feature description', () => {
    render(<Calendar />);
    expect(
      screen.getByText('This feature will show you optimal planting times for each season.')
    ).toBeInTheDocument();
  });

  it('renders calendar emoji', () => {
    render(<Calendar />);
    expect(screen.getByText('📅')).toBeInTheDocument();
  });
});
