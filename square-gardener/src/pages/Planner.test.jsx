import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Planner from './Planner';

describe('Planner', () => {
  it('renders page title', () => {
    render(<Planner />);
    expect(screen.getByText('Garden Planner')).toBeInTheDocument();
  });

  it('renders page subtitle', () => {
    render(<Planner />);
    expect(screen.getByText('Design your square foot garden layout')).toBeInTheDocument();
  });

  it('shows coming soon message', () => {
    render(<Planner />);
    expect(screen.getByText('Coming Soon')).toBeInTheDocument();
  });

  it('shows feature description', () => {
    render(<Planner />);
    expect(
      screen.getByText(
        'This feature will let you plan your garden layout using square foot gardening principles.'
      )
    ).toBeInTheDocument();
  });

  it('renders planner emoji', () => {
    render(<Planner />);
    expect(screen.getByText('📐')).toBeInTheDocument();
  });
});
