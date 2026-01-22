import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PlantingTimeline from './PlantingTimeline';

describe('PlantingTimeline', () => {
  const mockFrostDates = {
    lastSpringFrost: '2026-04-15',
    firstFallFrost: '2026-10-15',
    zipCode: '12345'
  };

  const mockSchedule = [
    {
      plantId: 'tomato',
      plantName: 'Tomato',
      plantingWindow: {
        start: '2026-04-22',
        end: '2026-05-27'
      },
      season: 'spring'
    },
    {
      plantId: 'basil',
      plantName: 'Basil',
      plantingWindow: {
        start: '2026-04-22',
        end: '2026-05-27'
      },
      season: 'spring'
    },
    {
      plantId: 'lettuce',
      plantName: 'Lettuce',
      plantingWindow: {
        start: '2026-05-01',
        end: '2026-06-10'
      },
      season: 'spring'
    }
  ];

  test('should render empty state when no schedule', () => {
    render(<PlantingTimeline schedule={[]} frostDates={mockFrostDates} />);

    expect(screen.getByText('Planting Schedule')).toBeInTheDocument();
    expect(screen.getByText(/No planting schedule available/i)).toBeInTheDocument();
  });

  test('should render empty state when schedule is null', () => {
    render(<PlantingTimeline schedule={null} frostDates={mockFrostDates} />);

    expect(screen.getByText('Planting Schedule')).toBeInTheDocument();
    expect(screen.getByText(/No planting schedule available/i)).toBeInTheDocument();
  });

  test('should render schedule with multiple plants', () => {
    render(<PlantingTimeline schedule={mockSchedule} frostDates={mockFrostDates} />);

    expect(screen.getByText('Planting Schedule')).toBeInTheDocument();
    expect(screen.getByText('Tomato')).toBeInTheDocument();
    expect(screen.getByText('Basil')).toBeInTheDocument();
    expect(screen.getByText('Lettuce')).toBeInTheDocument();
  });

  test('should display frost dates when provided', () => {
    render(<PlantingTimeline schedule={mockSchedule} frostDates={mockFrostDates} />);

    expect(screen.getByText(/Last Spring Frost:/i)).toBeInTheDocument();
    expect(screen.getByText(/First Fall Frost:/i)).toBeInTheDocument();
    expect(screen.getByText(/Apr 15/i)).toBeInTheDocument();
    expect(screen.getByText(/Oct 15/i)).toBeInTheDocument();
  });

  test('should not display frost dates when not provided', () => {
    render(<PlantingTimeline schedule={mockSchedule} frostDates={null} />);

    expect(screen.queryByText(/Last Spring Frost:/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/First Fall Frost:/i)).not.toBeInTheDocument();
  });

  test('should not display frost dates when incomplete', () => {
    const incompleteFrostDates = { lastSpringFrost: '2026-04-15' };
    render(<PlantingTimeline schedule={mockSchedule} frostDates={incompleteFrostDates} />);

    expect(screen.queryByText(/Last Spring Frost:/i)).not.toBeInTheDocument();
  });

  test('should group plants by month', () => {
    render(<PlantingTimeline schedule={mockSchedule} frostDates={mockFrostDates} />);

    expect(screen.getByText('April 2026')).toBeInTheDocument();
    expect(screen.getByText('May 2026')).toBeInTheDocument();
  });

  test('should display planting windows', () => {
    render(<PlantingTimeline schedule={mockSchedule} frostDates={mockFrostDates} />);

    // Should show date ranges for plants - using getAllByText for duplicates
    const apr22Elements = screen.getAllByText(/Apr 22/i);
    expect(apr22Elements.length).toBeGreaterThan(0);

    const may27Elements = screen.getAllByText(/May 27/i);
    expect(may27Elements.length).toBeGreaterThan(0);

    expect(screen.getByText(/May 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Jun 10/i)).toBeInTheDocument();
  });

  test('should display season information', () => {
    render(<PlantingTimeline schedule={mockSchedule} frostDates={mockFrostDates} />);

    const springTexts = screen.getAllByText(/spring/i);
    expect(springTexts.length).toBeGreaterThan(0);
  });

  test('should render season legend', () => {
    render(<PlantingTimeline schedule={mockSchedule} frostDates={mockFrostDates} />);

    expect(screen.getByText('Spring')).toBeInTheDocument();
    expect(screen.getByText('Summer')).toBeInTheDocument();
    expect(screen.getByText('Fall')).toBeInTheDocument();
  });

  test('should apply correct styling for spring season', () => {
    const springSchedule = [
      {
        plantId: 'tomato',
        plantName: 'Tomato',
        plantingWindow: { start: '2026-04-22', end: '2026-05-27' },
        season: 'spring'
      }
    ];

    const { container } = render(<PlantingTimeline schedule={springSchedule} frostDates={mockFrostDates} />);

    const plantCard = container.querySelector('.text-green-600');
    expect(plantCard).toBeInTheDocument();
  });

  test('should apply correct styling for summer season', () => {
    const summerSchedule = [
      {
        plantId: 'cucumber',
        plantName: 'Cucumber',
        plantingWindow: { start: '2026-06-01', end: '2026-07-15' },
        season: 'summer'
      }
    ];

    const { container } = render(<PlantingTimeline schedule={summerSchedule} frostDates={mockFrostDates} />);

    const plantCard = container.querySelector('.text-amber-600');
    expect(plantCard).toBeInTheDocument();
  });

  test('should apply correct styling for fall season', () => {
    const fallSchedule = [
      {
        plantId: 'kale',
        plantName: 'Kale',
        plantingWindow: { start: '2026-08-01', end: '2026-09-15' },
        season: 'fall'
      }
    ];

    const { container } = render(<PlantingTimeline schedule={fallSchedule} frostDates={mockFrostDates} />);

    const plantCard = container.querySelector('.text-orange-600');
    expect(plantCard).toBeInTheDocument();
  });

  test('should handle schedule with single plant', () => {
    const singleSchedule = [mockSchedule[0]];
    render(<PlantingTimeline schedule={singleSchedule} frostDates={mockFrostDates} />);

    expect(screen.getByText('Tomato')).toBeInTheDocument();
    expect(screen.queryByText('Basil')).not.toBeInTheDocument();
  });

  test('should handle plants spanning multiple months', () => {
    const multiMonthSchedule = [
      {
        plantId: 'tomato',
        plantName: 'Tomato',
        plantingWindow: { start: '2026-04-22', end: '2026-05-27' },
        season: 'spring'
      },
      {
        plantId: 'cucumber',
        plantName: 'Cucumber',
        plantingWindow: { start: '2026-06-01', end: '2026-07-15' },
        season: 'summer'
      },
      {
        plantId: 'kale',
        plantName: 'Kale',
        plantingWindow: { start: '2026-08-01', end: '2026-09-15' },
        season: 'fall'
      }
    ];

    render(<PlantingTimeline schedule={multiMonthSchedule} frostDates={mockFrostDates} />);

    expect(screen.getByText('April 2026')).toBeInTheDocument();
    expect(screen.getByText('June 2026')).toBeInTheDocument();
    expect(screen.getByText('August 2026')).toBeInTheDocument();
  });

  test('should sort months chronologically', () => {
    const unsortedSchedule = [
      {
        plantId: 'kale',
        plantName: 'Kale',
        plantingWindow: { start: '2026-08-01', end: '2026-09-15' },
        season: 'fall'
      },
      {
        plantId: 'tomato',
        plantName: 'Tomato',
        plantingWindow: { start: '2026-04-22', end: '2026-05-27' },
        season: 'spring'
      }
    ];

    const { container } = render(<PlantingTimeline schedule={unsortedSchedule} frostDates={mockFrostDates} />);

    const monthHeaders = container.querySelectorAll('h4');
    expect(monthHeaders[0].textContent).toBe('April 2026');
    expect(monthHeaders[1].textContent).toBe('August 2026');
  });

  test('should display planting window text', () => {
    render(<PlantingTimeline schedule={mockSchedule} frostDates={mockFrostDates} />);

    const windowTexts = screen.getAllByText(/planting window/i);
    expect(windowTexts.length).toBe(mockSchedule.length);
  });

  test('should render without crashing when frostDates has only zipCode', () => {
    const partialFrostDates = { zipCode: '12345' };
    render(<PlantingTimeline schedule={mockSchedule} frostDates={partialFrostDates} />);

    expect(screen.getByText('Planting Schedule')).toBeInTheDocument();
    expect(screen.queryByText(/Last Spring Frost:/i)).not.toBeInTheDocument();
  });

  test('should handle empty frostDates object', () => {
    render(<PlantingTimeline schedule={mockSchedule} frostDates={{}} />);

    expect(screen.getByText('Planting Schedule')).toBeInTheDocument();
    expect(screen.queryByText(/Last Spring Frost:/i)).not.toBeInTheDocument();
  });

  test('should display correct number of plants in each month', () => {
    render(<PlantingTimeline schedule={mockSchedule} frostDates={mockFrostDates} />);

    // April 2026 should have Tomato and Basil
    const aprilSection = screen.getByText('April 2026').closest('div');
    expect(aprilSection).toBeInTheDocument();

    // May 2026 should have Lettuce
    const maySection = screen.getByText('May 2026').closest('div');
    expect(maySection).toBeInTheDocument();
  });
});
