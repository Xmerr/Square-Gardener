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

  it('shows feature description', () => {
    render(<Watering />);
    expect(
      screen.getByText('This feature will help you track which plants need watering and when.')
    ).toBeInTheDocument();
  });

  it('renders water drop emoji', () => {
    render(<Watering />);
    expect(screen.getByText('💧')).toBeInTheDocument();
  });
});
