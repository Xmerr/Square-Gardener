import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders the Square Gardener header', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Square Gardener');
  });

  it('renders the tagline', () => {
    render(<App />);
    expect(screen.getByText('Your Square Foot Gardening Companion')).toBeInTheDocument();
  });

  it('renders the welcome card with Hello World', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Hello World!');
  });

  it('renders all coming soon features', () => {
    render(<App />);
    expect(screen.getByText(/Track your plants/)).toBeInTheDocument();
    expect(screen.getByText(/Plan your garden/)).toBeInTheDocument();
    expect(screen.getByText(/optimal planting times/)).toBeInTheDocument();
    expect(screen.getByText(/companion planting/)).toBeInTheDocument();
  });

  it('renders the footer', () => {
    render(<App />);
    expect(screen.getByText(/Built with React/)).toBeInTheDocument();
  });
});
