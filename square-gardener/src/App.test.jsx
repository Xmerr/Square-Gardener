import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import App from './App';

describe('App', () => {
  beforeEach(() => {
    // Reset window location for each test
    window.history.pushState({}, '', '/Square-Gardener/');
  });

  it('renders the Square Gardener header', () => {
    render(<App />);
    const headers = screen.getAllByText(/Square Gardener/);
    expect(headers.length).toBeGreaterThan(0);
  });

  it('renders the tagline', () => {
    render(<App />);
    expect(screen.getAllByText('Your Square Foot Gardening Companion').length).toBeGreaterThan(0);
  });

  it('renders the navigation menu', () => {
    render(<App />);
    expect(screen.getByText(/🏠 Home/)).toBeInTheDocument();
    expect(screen.getByText(/🌿 My Garden/)).toBeInTheDocument();
    expect(screen.getByText(/💧 Watering/)).toBeInTheDocument();
    expect(screen.getByText(/📐 Planner/)).toBeInTheDocument();
    expect(screen.getByText(/📅 Calendar/)).toBeInTheDocument();
  });

  it('renders the home page by default', () => {
    render(<App />);
    expect(screen.getByText(/Welcome to Square Gardener/)).toBeInTheDocument();
    expect(screen.getByText(/Get Started with Square Gardening/)).toBeInTheDocument();
  });

  it('renders the footer', () => {
    render(<App />);
    expect(screen.getByText(/Built with React/)).toBeInTheDocument();
  });
});
