import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import BedCard from './BedCard';

describe('BedCard', () => {
  const mockBed = {
    id: 'bed-1',
    name: 'Main Garden',
    width: 4,
    height: 4
  };

  const mockCapacity = {
    total: 16,
    used: 8,
    available: 8,
    isOvercapacity: false
  };

  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('displays bed name, dimensions, capacity', () => {
      render(
        <BedCard
          bed={mockBed}
          capacity={mockCapacity}
          plantCount={5}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('Main Garden')).toBeInTheDocument();
      expect(screen.getByText('4 ft × 4 ft (16 sq ft)')).toBeInTheDocument();
      expect(screen.getByText('8 / 16 sq ft')).toBeInTheDocument();
    });

    it('displays plant count singular', () => {
      render(
        <BedCard
          bed={mockBed}
          capacity={mockCapacity}
          plantCount={1}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('1 plant')).toBeInTheDocument();
    });

    it('displays plant count plural', () => {
      render(
        <BedCard
          bed={mockBed}
          capacity={mockCapacity}
          plantCount={5}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('5 plants')).toBeInTheDocument();
    });

    it('displays zero plants correctly', () => {
      render(
        <BedCard
          bed={mockBed}
          capacity={mockCapacity}
          plantCount={0}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('0 plants')).toBeInTheDocument();
    });
  });

  describe('capacity meter', () => {
    it('shows green color when under 90% capacity', () => {
      const capacity = { total: 16, used: 8, available: 8, isOvercapacity: false };
      render(
        <BedCard
          bed={mockBed}
          capacity={capacity}
          plantCount={5}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveClass('bg-green-500');
    });

    it('shows yellow color when at 90% capacity', () => {
      const capacity = { total: 16, used: 14.4, available: 1.6, isOvercapacity: false };
      render(
        <BedCard
          bed={mockBed}
          capacity={capacity}
          plantCount={10}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveClass('bg-yellow-500');
    });

    it('shows red color when overcapacity', () => {
      const capacity = { total: 16, used: 20, available: -4, isOvercapacity: true };
      render(
        <BedCard
          bed={mockBed}
          capacity={capacity}
          plantCount={15}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveClass('bg-red-500');
    });

    it('caps progress bar at 100%', () => {
      const capacity = { total: 16, used: 24, available: -8, isOvercapacity: true };
      render(
        <BedCard
          bed={mockBed}
          capacity={capacity}
          plantCount={20}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveStyle({ width: '100%' });
    });

    it('handles zero capacity', () => {
      const capacity = { total: 0, used: 0, available: 0, isOvercapacity: false };
      const zeroBed = { ...mockBed, width: 0, height: 0 };
      render(
        <BedCard
          bed={zeroBed}
          capacity={capacity}
          plantCount={0}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveStyle({ width: '0%' });
    });
  });

  describe('overcapacity warning', () => {
    it('shows overcapacity warning badge', () => {
      const capacity = { total: 16, used: 18, available: -2, isOvercapacity: true };
      render(
        <BedCard
          bed={mockBed}
          capacity={capacity}
          plantCount={12}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('Overcrowded by 2 sq ft')).toBeInTheDocument();
    });

    it('does not show warning when not overcapacity', () => {
      render(
        <BedCard
          bed={mockBed}
          capacity={mockCapacity}
          plantCount={5}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.queryByText(/Overcrowded/)).not.toBeInTheDocument();
    });

    it('shows overcapacity text styling', () => {
      const capacity = { total: 16, used: 18, available: -2, isOvercapacity: true };
      render(
        <BedCard
          bed={mockBed}
          capacity={capacity}
          plantCount={12}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('18 / 16 sq ft')).toHaveClass('text-red-600');
    });
  });

  describe('actions', () => {
    it('calls onEdit when edit clicked', () => {
      render(
        <BedCard
          bed={mockBed}
          capacity={mockCapacity}
          plantCount={5}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      fireEvent.click(screen.getByLabelText('Edit Main Garden'));
      expect(mockOnEdit).toHaveBeenCalledWith(mockBed);
    });

    it('calls onDelete when delete clicked', () => {
      render(
        <BedCard
          bed={mockBed}
          capacity={mockCapacity}
          plantCount={5}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      fireEvent.click(screen.getByLabelText('Delete Main Garden'));
      expect(mockOnDelete).toHaveBeenCalledWith(mockBed);
    });
  });
});
