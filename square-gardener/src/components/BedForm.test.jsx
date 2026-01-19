import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import BedForm from './BedForm';

describe('BedForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders with empty fields for new bed', () => {
      render(<BedForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      expect(screen.getByText('Create New Bed')).toBeInTheDocument();
      expect(screen.getByLabelText('Bed Name')).toHaveValue('');
      expect(screen.getByLabelText('Width (ft)')).toHaveValue(null);
      expect(screen.getByLabelText('Height (ft)')).toHaveValue(null);
      expect(screen.getByText('Create Bed')).toBeInTheDocument();
    });

    it('renders with pre-filled fields for edit', () => {
      const bed = { id: 'bed-1', name: 'Main Garden', width: 4, height: 6 };
      render(<BedForm bed={bed} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      expect(screen.getByText('Edit Bed')).toBeInTheDocument();
      expect(screen.getByLabelText('Bed Name')).toHaveValue('Main Garden');
      expect(screen.getByLabelText('Width (ft)')).toHaveValue(4);
      expect(screen.getByLabelText('Height (ft)')).toHaveValue(6);
      expect(screen.getByText('Save Changes')).toBeInTheDocument();
    });

    it('displays calculated square footage', () => {
      render(<BedForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      fireEvent.change(screen.getByLabelText('Width (ft)'), { target: { value: '4' } });
      fireEvent.change(screen.getByLabelText('Height (ft)'), { target: { value: '3' } });

      expect(screen.getByText('12.0 sq ft')).toBeInTheDocument();
    });

    it('shows 0 sq ft when dimensions are empty', () => {
      render(<BedForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
      expect(screen.getByText('0 sq ft')).toBeInTheDocument();
    });

    it('shows 0 sq ft when dimensions are invalid', () => {
      render(<BedForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      fireEvent.change(screen.getByLabelText('Width (ft)'), { target: { value: 'abc' } });
      fireEvent.change(screen.getByLabelText('Height (ft)'), { target: { value: '4' } });

      expect(screen.getByText('0 sq ft')).toBeInTheDocument();
    });
  });

  describe('validation', () => {
    it('validates name is non-empty', () => {
      render(<BedForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      fireEvent.change(screen.getByLabelText('Width (ft)'), { target: { value: '4' } });
      fireEvent.change(screen.getByLabelText('Height (ft)'), { target: { value: '4' } });
      fireEvent.click(screen.getByText('Create Bed'));

      expect(screen.getByText('Name is required')).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('validates name with only whitespace', () => {
      render(<BedForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      fireEvent.change(screen.getByLabelText('Bed Name'), { target: { value: '   ' } });
      fireEvent.change(screen.getByLabelText('Width (ft)'), { target: { value: '4' } });
      fireEvent.change(screen.getByLabelText('Height (ft)'), { target: { value: '4' } });
      fireEvent.click(screen.getByText('Create Bed'));

      expect(screen.getByText('Name is required')).toBeInTheDocument();
    });

    it('validates width is required', () => {
      render(<BedForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      fireEvent.change(screen.getByLabelText('Bed Name'), { target: { value: 'Test' } });
      fireEvent.change(screen.getByLabelText('Height (ft)'), { target: { value: '4' } });
      fireEvent.click(screen.getByText('Create Bed'));

      expect(screen.getByText('Width is required')).toBeInTheDocument();
    });

    it('validates width is a number', () => {
      render(<BedForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      fireEvent.change(screen.getByLabelText('Bed Name'), { target: { value: 'Test' } });
      fireEvent.change(screen.getByLabelText('Width (ft)'), { target: { value: 'abc' } });
      fireEvent.change(screen.getByLabelText('Height (ft)'), { target: { value: '4' } });
      fireEvent.click(screen.getByText('Create Bed'));

      expect(screen.getByText('Width is required')).toBeInTheDocument();
    });

    it('validates width is positive number', () => {
      render(<BedForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      fireEvent.change(screen.getByLabelText('Bed Name'), { target: { value: 'Test' } });
      fireEvent.change(screen.getByLabelText('Width (ft)'), { target: { value: '-2' } });
      fireEvent.change(screen.getByLabelText('Height (ft)'), { target: { value: '4' } });
      fireEvent.click(screen.getByText('Create Bed'));

      expect(screen.getByText('Width must be greater than 0')).toBeInTheDocument();
    });

    it('validates zero width', () => {
      render(<BedForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      fireEvent.change(screen.getByLabelText('Bed Name'), { target: { value: 'Test' } });
      fireEvent.change(screen.getByLabelText('Width (ft)'), { target: { value: '0' } });
      fireEvent.change(screen.getByLabelText('Height (ft)'), { target: { value: '4' } });
      fireEvent.click(screen.getByText('Create Bed'));

      expect(screen.getByText('Width must be greater than 0')).toBeInTheDocument();
    });

    it('validates height is required', () => {
      render(<BedForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      fireEvent.change(screen.getByLabelText('Bed Name'), { target: { value: 'Test' } });
      fireEvent.change(screen.getByLabelText('Width (ft)'), { target: { value: '4' } });
      fireEvent.click(screen.getByText('Create Bed'));

      expect(screen.getByText('Height is required')).toBeInTheDocument();
    });

    it('validates height is a number', () => {
      render(<BedForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      fireEvent.change(screen.getByLabelText('Bed Name'), { target: { value: 'Test' } });
      fireEvent.change(screen.getByLabelText('Width (ft)'), { target: { value: '4' } });
      fireEvent.change(screen.getByLabelText('Height (ft)'), { target: { value: 'xyz' } });
      fireEvent.click(screen.getByText('Create Bed'));

      expect(screen.getByText('Height is required')).toBeInTheDocument();
    });

    it('validates height is positive number', () => {
      render(<BedForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      fireEvent.change(screen.getByLabelText('Bed Name'), { target: { value: 'Test' } });
      fireEvent.change(screen.getByLabelText('Width (ft)'), { target: { value: '4' } });
      fireEvent.change(screen.getByLabelText('Height (ft)'), { target: { value: '-1' } });
      fireEvent.click(screen.getByText('Create Bed'));

      expect(screen.getByText('Height must be greater than 0')).toBeInTheDocument();
    });

    it('validates zero height', () => {
      render(<BedForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      fireEvent.change(screen.getByLabelText('Bed Name'), { target: { value: 'Test' } });
      fireEvent.change(screen.getByLabelText('Width (ft)'), { target: { value: '4' } });
      fireEvent.change(screen.getByLabelText('Height (ft)'), { target: { value: '0' } });
      fireEvent.click(screen.getByText('Create Bed'));

      expect(screen.getByText('Height must be greater than 0')).toBeInTheDocument();
    });

    it('allows fractional dimensions', () => {
      render(<BedForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      fireEvent.change(screen.getByLabelText('Bed Name'), { target: { value: 'Test' } });
      fireEvent.change(screen.getByLabelText('Width (ft)'), { target: { value: '3.5' } });
      fireEvent.change(screen.getByLabelText('Height (ft)'), { target: { value: '4.5' } });
      fireEvent.click(screen.getByText('Create Bed'));

      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'Test',
        width: 3.5,
        height: 4.5
      });
    });
  });

  describe('form submission', () => {
    it('calls onSubmit with correct data', () => {
      render(<BedForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      fireEvent.change(screen.getByLabelText('Bed Name'), { target: { value: 'My Garden' } });
      fireEvent.change(screen.getByLabelText('Width (ft)'), { target: { value: '4' } });
      fireEvent.change(screen.getByLabelText('Height (ft)'), { target: { value: '6' } });
      fireEvent.click(screen.getByText('Create Bed'));

      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'My Garden',
        width: 4,
        height: 6
      });
    });

    it('trims whitespace from name', () => {
      render(<BedForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      fireEvent.change(screen.getByLabelText('Bed Name'), { target: { value: '  My Garden  ' } });
      fireEvent.change(screen.getByLabelText('Width (ft)'), { target: { value: '4' } });
      fireEvent.change(screen.getByLabelText('Height (ft)'), { target: { value: '4' } });
      fireEvent.click(screen.getByText('Create Bed'));

      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'My Garden',
        width: 4,
        height: 4
      });
    });

    it('calls onCancel when cancelled', () => {
      render(<BedForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      fireEvent.click(screen.getByText('Cancel'));

      expect(mockOnCancel).toHaveBeenCalled();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('edit mode', () => {
    it('updates form when remounted with different bed via key prop', () => {
      const { rerender } = render(
        <BedForm key="new" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      expect(screen.getByLabelText('Bed Name')).toHaveValue('');

      // Parent uses key prop to force remount when switching to edit mode
      rerender(
        <BedForm
          key="bed-1"
          bed={{ id: 'bed-1', name: 'Updated', width: 5, height: 5 }}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByLabelText('Bed Name')).toHaveValue('Updated');
      expect(screen.getByLabelText('Width (ft)')).toHaveValue(5);
      expect(screen.getByLabelText('Height (ft)')).toHaveValue(5);
    });

    it('handles bed with missing properties', () => {
      const bed = { id: 'bed-1' };
      render(<BedForm bed={bed} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      expect(screen.getByLabelText('Bed Name')).toHaveValue('');
      expect(screen.getByLabelText('Width (ft)')).toHaveValue(null);
      expect(screen.getByLabelText('Height (ft)')).toHaveValue(null);
    });
  });
});
