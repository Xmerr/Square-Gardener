import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import OverrideIndicator from './OverrideIndicator';

describe('OverrideIndicator', () => {
  describe('rendering', () => {
    it('renders calculated indicator when isOverride is false', () => {
      render(<OverrideIndicator isOverride={false} />);

      const indicator = screen.getByLabelText(/Calculated from library/);
      expect(indicator).toBeInTheDocument();
    });

    it('renders manual indicator when isOverride is true', () => {
      render(<OverrideIndicator isOverride={true} />);

      const indicator = screen.getByLabelText('Manually set');
      expect(indicator).toBeInTheDocument();
    });

    it('renders with subtle gray color', () => {
      const { container } = render(<OverrideIndicator isOverride={false} />);

      const span = container.querySelector('span');
      expect(span).toHaveClass('text-gray-400');
    });

    it('has hover transition classes', () => {
      const { container } = render(<OverrideIndicator isOverride={false} />);

      const span = container.querySelector('span');
      expect(span).toHaveClass('hover:text-gray-600');
      expect(span).toHaveClass('transition-colors');
    });

    it('has cursor-help class for tooltip indication', () => {
      const { container } = render(<OverrideIndicator isOverride={false} />);

      const span = container.querySelector('span');
      expect(span).toHaveClass('cursor-help');
    });

    it('has left margin for spacing', () => {
      const { container } = render(<OverrideIndicator isOverride={false} />);

      const span = container.querySelector('span');
      expect(span).toHaveClass('ml-1');
    });
  });

  describe('tooltip text', () => {
    it('shows "Calculated from library" for calculated values without default', () => {
      render(<OverrideIndicator isOverride={false} />);

      const indicator = screen.getByLabelText('Calculated from library');
      expect(indicator).toHaveAttribute('title', 'Calculated from library');
    });

    it('shows "Calculated from library" with default value when provided', () => {
      render(<OverrideIndicator isOverride={false} defaultValue="60 days" />);

      const indicator = screen.getByLabelText('Calculated from library (60 days)');
      expect(indicator).toHaveAttribute('title', 'Calculated from library (60 days)');
    });

    it('shows "Manually set" for overridden values', () => {
      render(<OverrideIndicator isOverride={true} />);

      const indicator = screen.getByLabelText('Manually set');
      expect(indicator).toHaveAttribute('title', 'Manually set');
    });

    it('ignores defaultValue when isOverride is true', () => {
      render(<OverrideIndicator isOverride={true} defaultValue="60 days" />);

      const indicator = screen.getByLabelText('Manually set');
      expect(indicator).toHaveAttribute('title', 'Manually set');
      expect(indicator).not.toHaveAttribute('title', expect.stringContaining('60 days'));
    });
  });

  describe('icons', () => {
    it('renders auto icon (sliders) for calculated values', () => {
      const { container } = render(<OverrideIndicator isOverride={false} />);

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveClass('w-3');
      expect(svg).toHaveClass('h-3');
      // Check for path element (auto icon has specific path)
      const path = svg.querySelector('path');
      expect(path).toBeInTheDocument();
      expect(path).toHaveAttribute('d', expect.stringContaining('M5 4a1 1 0 00-2 0v7.268'));
    });

    it('renders pencil icon for manual values', () => {
      const { container } = render(<OverrideIndicator isOverride={true} />);

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveClass('w-3');
      expect(svg).toHaveClass('h-3');
      // Check for path element (pencil icon has specific path)
      const path = svg.querySelector('path');
      expect(path).toBeInTheDocument();
      expect(path).toHaveAttribute('d', expect.stringContaining('13.586 3.586a2 2 0 112.828'));
    });

    it('icon has correct size classes', () => {
      const { container } = render(<OverrideIndicator isOverride={false} />);

      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('w-3');
      expect(svg).toHaveClass('h-3');
    });
  });

  describe('accessibility', () => {
    it('has aria-label for calculated values', () => {
      render(<OverrideIndicator isOverride={false} />);

      const indicator = screen.getByLabelText('Calculated from library');
      expect(indicator).toHaveAttribute('aria-label', 'Calculated from library');
    });

    it('has aria-label for manual values', () => {
      render(<OverrideIndicator isOverride={true} />);

      const indicator = screen.getByLabelText('Manually set');
      expect(indicator).toHaveAttribute('aria-label', 'Manually set');
    });

    it('has title attribute for browser tooltip', () => {
      render(<OverrideIndicator isOverride={false} defaultValue="test" />);

      const indicator = screen.getByLabelText('Calculated from library (test)');
      expect(indicator).toHaveAttribute('title');
    });
  });

  describe('edge cases', () => {
    it('handles empty string as defaultValue', () => {
      render(<OverrideIndicator isOverride={false} defaultValue="" />);

      const indicator = screen.getByLabelText('Calculated from library');
      expect(indicator).toBeInTheDocument();
    });

    it('handles numeric defaultValue', () => {
      render(<OverrideIndicator isOverride={false} defaultValue="123" />);

      const indicator = screen.getByLabelText('Calculated from library (123)');
      expect(indicator).toBeInTheDocument();
    });

    it('handles special characters in defaultValue', () => {
      render(<OverrideIndicator isOverride={false} defaultValue="0.25 sq/ft" />);

      const indicator = screen.getByLabelText('Calculated from library (0.25 sq/ft)');
      expect(indicator).toBeInTheDocument();
    });

    it('handles long defaultValue strings', () => {
      const longValue = 'Very long default value that might wrap';
      render(<OverrideIndicator isOverride={false} defaultValue={longValue} />);

      const indicator = screen.getByLabelText(`Calculated from library (${longValue})`);
      expect(indicator).toBeInTheDocument();
    });
  });
});
