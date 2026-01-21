import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MonthDayPicker from './MonthDayPicker';

describe('MonthDayPicker', () => {
  describe('rendering', () => {
    it('should render month and day dropdowns', () => {
      render(<MonthDayPicker id="test" value="" onChange={vi.fn()} />);

      const monthSelect = screen.getByDisplayValue('Month');
      const daySelect = screen.getByDisplayValue('Day');

      expect(monthSelect).toBeInTheDocument();
      expect(daySelect).toBeInTheDocument();
    });

    it('should render all 12 months', () => {
      render(<MonthDayPicker id="test" value="" onChange={vi.fn()} />);

      const monthSelect = screen.getByDisplayValue('Month');
      const options = monthSelect.querySelectorAll('option');

      expect(options).toHaveLength(13); // 12 months + placeholder
      expect(options[1].textContent).toBe('January');
      expect(options[12].textContent).toBe('December');
    });

    it('should render 31 days by default', () => {
      render(<MonthDayPicker id="test" value="" onChange={vi.fn()} />);

      const daySelect = screen.getByDisplayValue('Day');
      const options = daySelect.querySelectorAll('option');

      expect(options).toHaveLength(32); // 31 days + placeholder
    });

    it('should populate month and day from value prop', () => {
      render(<MonthDayPicker id="test" value="04-15" onChange={vi.fn()} />);

      const monthSelect = screen.getByDisplayValue('April');
      const daySelect = screen.getByDisplayValue('15');

      expect(monthSelect).toBeInTheDocument();
      expect(daySelect).toBeInTheDocument();
    });

    it('should clear fields when value prop is empty string', () => {
      const { rerender } = render(<MonthDayPicker id="test" value="04-15" onChange={vi.fn()} />);

      expect(screen.getByDisplayValue('April')).toBeInTheDocument();

      rerender(<MonthDayPicker id="test" value="" onChange={vi.fn()} />);

      expect(screen.getByDisplayValue('Month')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Day')).toBeInTheDocument();
    });

    it('should clear fields when value prop is null', () => {
      const { rerender } = render(<MonthDayPicker id="test" value="04-15" onChange={vi.fn()} />);

      expect(screen.getByDisplayValue('April')).toBeInTheDocument();

      rerender(<MonthDayPicker id="test" value={null} onChange={vi.fn()} />);

      expect(screen.getByDisplayValue('Month')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Day')).toBeInTheDocument();
    });

    it('should apply error styling when hasError is true', () => {
      render(<MonthDayPicker id="test" value="" onChange={vi.fn()} hasError={true} />);

      const monthSelect = screen.getByDisplayValue('Month');
      const daySelect = screen.getByDisplayValue('Day');

      expect(monthSelect.className).toContain('border-red-500');
      expect(daySelect.className).toContain('border-red-500');
    });

    it('should not apply error styling when hasError is false', () => {
      render(<MonthDayPicker id="test" value="" onChange={vi.fn()} hasError={false} />);

      const monthSelect = screen.getByDisplayValue('Month');
      const daySelect = screen.getByDisplayValue('Day');

      expect(monthSelect.className).not.toContain('border-red-500');
      expect(daySelect.className).not.toContain('border-red-500');
      expect(monthSelect.className).toContain('border-gray-300');
      expect(daySelect.className).toContain('border-gray-300');
    });
  });

  describe('month selection', () => {
    it('should call onChange when month is selected with existing day', () => {
      const onChange = vi.fn();
      render(<MonthDayPicker id="test" value="" onChange={onChange} />);

      const monthSelect = screen.getByDisplayValue('Month');
      const daySelect = screen.getByDisplayValue('Day');

      fireEvent.change(daySelect, { target: { value: '15' } });
      fireEvent.change(monthSelect, { target: { value: '04' } });

      expect(onChange).toHaveBeenCalledWith('04-15');
    });

    it('should call onChange with empty string when only month is selected without day', () => {
      const onChange = vi.fn();
      render(<MonthDayPicker id="test" value="" onChange={onChange} />);

      const monthSelect = screen.getByDisplayValue('Month');
      fireEvent.change(monthSelect, { target: { value: '04' } });

      expect(onChange).toHaveBeenCalledWith('');
    });

    it('should update days dropdown for February', () => {
      const onChange = vi.fn();
      render(<MonthDayPicker id="test" value="" onChange={onChange} />);

      const monthSelect = screen.getByDisplayValue('Month');
      fireEvent.change(monthSelect, { target: { value: '02' } });

      const daySelect = screen.getByDisplayValue('Day');
      const options = daySelect.querySelectorAll('option');

      expect(options).toHaveLength(30); // 29 days + placeholder
    });

    it('should update days dropdown for 30-day months', () => {
      const onChange = vi.fn();
      render(<MonthDayPicker id="test" value="" onChange={onChange} />);

      const monthSelect = screen.getByDisplayValue('Month');
      fireEvent.change(monthSelect, { target: { value: '04' } }); // April

      const daySelect = screen.getByDisplayValue('Day');
      const options = daySelect.querySelectorAll('option');

      expect(options).toHaveLength(31); // 30 days + placeholder
    });

    it('should update days dropdown for 31-day months', () => {
      const onChange = vi.fn();
      render(<MonthDayPicker id="test" value="" onChange={onChange} />);

      const monthSelect = screen.getByDisplayValue('Month');
      fireEvent.change(monthSelect, { target: { value: '01' } }); // January

      const daySelect = screen.getByDisplayValue('Day');
      const options = daySelect.querySelectorAll('option');

      expect(options).toHaveLength(32); // 31 days + placeholder
    });

    it('should adjust day to max when switching to shorter month', () => {
      const onChange = vi.fn();
      render(<MonthDayPicker id="test" value="01-31" onChange={onChange} />);

      const monthSelect = screen.getByDisplayValue('January');
      fireEvent.change(monthSelect, { target: { value: '04' } }); // April has 30 days

      expect(onChange).toHaveBeenCalledWith('04-30');
    });

    it('should adjust day to 29 when switching to February', () => {
      const onChange = vi.fn();
      render(<MonthDayPicker id="test" value="01-31" onChange={onChange} />);

      const monthSelect = screen.getByDisplayValue('January');
      fireEvent.change(monthSelect, { target: { value: '02' } }); // February has 29 days

      expect(onChange).toHaveBeenCalledWith('02-29');
    });
  });

  describe('day selection', () => {
    it('should call onChange when day is selected with existing month', () => {
      const onChange = vi.fn();
      render(<MonthDayPicker id="test" value="" onChange={onChange} />);

      const monthSelect = screen.getByDisplayValue('Month');
      const daySelect = screen.getByDisplayValue('Day');

      fireEvent.change(monthSelect, { target: { value: '04' } });
      fireEvent.change(daySelect, { target: { value: '15' } });

      expect(onChange).toHaveBeenCalledWith('04-15');
    });

    it('should call onChange with empty string when only day is selected without month', () => {
      const onChange = vi.fn();
      render(<MonthDayPicker id="test" value="" onChange={onChange} />);

      const daySelect = screen.getByDisplayValue('Day');
      fireEvent.change(daySelect, { target: { value: '15' } });

      expect(onChange).toHaveBeenCalledWith('');
    });
  });

  describe('clearing values', () => {
    it('should call onChange with empty string when month is cleared', () => {
      const onChange = vi.fn();
      render(<MonthDayPicker id="test" value="04-15" onChange={onChange} />);

      const monthSelect = screen.getByDisplayValue('April');
      fireEvent.change(monthSelect, { target: { value: '' } });

      expect(onChange).toHaveBeenCalledWith('');
    });

    it('should call onChange with empty string when day is cleared', () => {
      const onChange = vi.fn();
      render(<MonthDayPicker id="test" value="04-15" onChange={onChange} />);

      const daySelect = screen.getByDisplayValue('15');
      fireEvent.change(daySelect, { target: { value: '' } });

      expect(onChange).toHaveBeenCalledWith('');
    });
  });

  describe('edge cases', () => {
    it('should handle invalid value prop gracefully', () => {
      render(<MonthDayPicker id="test" value="invalid" onChange={vi.fn()} />);

      expect(screen.getByDisplayValue('Month')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Day')).toBeInTheDocument();
    });

    it('should handle value prop with wrong format', () => {
      render(<MonthDayPicker id="test" value="2024-04-15" onChange={vi.fn()} />);

      expect(screen.getByDisplayValue('Month')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Day')).toBeInTheDocument();
    });

    it('should handle June with 30 days', () => {
      const onChange = vi.fn();
      render(<MonthDayPicker id="test" value="05-31" onChange={onChange} />);

      const monthSelect = screen.getByDisplayValue('May');
      fireEvent.change(monthSelect, { target: { value: '06' } }); // June has 30 days

      expect(onChange).toHaveBeenCalledWith('06-30');
    });

    it('should handle September with 30 days', () => {
      const onChange = vi.fn();
      render(<MonthDayPicker id="test" value="08-31" onChange={onChange} />);

      const monthSelect = screen.getByDisplayValue('August');
      fireEvent.change(monthSelect, { target: { value: '09' } }); // September has 30 days

      expect(onChange).toHaveBeenCalledWith('09-30');
    });

    it('should handle November with 30 days', () => {
      const onChange = vi.fn();
      render(<MonthDayPicker id="test" value="10-31" onChange={onChange} />);

      const monthSelect = screen.getByDisplayValue('October');
      fireEvent.change(monthSelect, { target: { value: '11' } }); // November has 30 days

      expect(onChange).toHaveBeenCalledWith('11-30');
    });
  });

  describe('accessibility', () => {
    it('should use id prop for month and day select elements', () => {
      render(<MonthDayPicker id="frost-date" value="" onChange={vi.fn()} />);

      expect(document.getElementById('frost-date-month')).toBeInTheDocument();
      expect(document.getElementById('frost-date-day')).toBeInTheDocument();
    });
  });
});
