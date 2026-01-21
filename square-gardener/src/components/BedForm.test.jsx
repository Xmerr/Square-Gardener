import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import BedForm from './BedForm';

describe('BedForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering - bed mode', () => {
    it('renders with empty fields for new bed', () => {
      render(<BedForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      expect(screen.getByText('Create New Bed')).toBeInTheDocument();
      expect(screen.getByLabelText('Bed Name')).toHaveValue('');
      expect(screen.getByLabelText('Width (ft)')).toHaveValue(null);
      expect(screen.getByLabelText('Height (ft)')).toHaveValue(null);
      expect(screen.getByText('Create Bed')).toBeInTheDocument();
    });

    it('renders with pre-filled fields for edit', () => {
      const bed = { id: 'bed-1', name: 'Main Garden', width: 4, height: 6, is_pot: false };
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

    it('has example-style placeholders for width and height', () => {
      render(<BedForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const widthInput = screen.getByLabelText('Width (ft)');
      const heightInput = screen.getByLabelText('Height (ft)');

      expect(widthInput).toHaveAttribute('placeholder', 'e.g., 4');
      expect(heightInput).toHaveAttribute('placeholder', 'e.g., 4');
    });

    it('shows 0 sq ft when dimensions are invalid', () => {
      render(<BedForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      fireEvent.change(screen.getByLabelText('Width (ft)'), { target: { value: 'abc' } });
      fireEvent.change(screen.getByLabelText('Height (ft)'), { target: { value: '4' } });

      expect(screen.getByText('0 sq ft')).toBeInTheDocument();
    });

    it('shows the is_pot checkbox', () => {
      render(<BedForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
      expect(screen.getByLabelText('This is a pot')).toBeInTheDocument();
    });

    it('checkbox is unchecked by default', () => {
      render(<BedForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
      expect(screen.getByLabelText('This is a pot')).not.toBeChecked();
    });
  });

  describe('rendering - pot mode', () => {
    it('renders pot form when checkbox is checked', () => {
      render(<BedForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      fireEvent.click(screen.getByLabelText('This is a pot'));

      expect(screen.getByText('Create New Pot')).toBeInTheDocument();
      expect(screen.getByLabelText('Pot Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Size')).toBeInTheDocument();
      expect(screen.queryByLabelText('Width (ft)')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Height (ft)')).not.toBeInTheDocument();
      expect(screen.getByText('Create Pot')).toBeInTheDocument();
    });

    it('renders with pre-filled fields for pot edit', () => {
      const pot = { id: 'pot-1', name: 'Kitchen Aloe', is_pot: true, size: 'large' };
      render(<BedForm bed={pot} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      expect(screen.getByText('Edit Pot')).toBeInTheDocument();
      expect(screen.getByLabelText('Pot Name')).toHaveValue('Kitchen Aloe');
      expect(screen.getByLabelText('Size')).toHaveValue('large');
      expect(screen.getByText('Save Changes')).toBeInTheDocument();
    });

    it('displays pot capacity based on size', () => {
      render(<BedForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      fireEvent.click(screen.getByLabelText('This is a pot'));

      // Default size is medium (0.56 sq ft)
      expect(screen.getByText('0.56 sq ft')).toBeInTheDocument();
    });

    it('updates capacity when size changes', () => {
      render(<BedForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      fireEvent.click(screen.getByLabelText('This is a pot'));
      fireEvent.change(screen.getByLabelText('Size'), { target: { value: 'large' } });

      expect(screen.getByText('1 sq ft')).toBeInTheDocument();
    });

    it('shows all pot size options', () => {
      render(<BedForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      fireEvent.click(screen.getByLabelText('This is a pot'));

      const sizeSelect = screen.getByLabelText('Size');
      expect(sizeSelect).toContainHTML('Small (4-6 inch)');
      expect(sizeSelect).toContainHTML('Medium (8-10 inch)');
      expect(sizeSelect).toContainHTML('Large (12-14 inch)');
      expect(sizeSelect).toContainHTML('Extra Large (16+ inch)');
    });
  });

  describe('validation - bed mode', () => {
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
        is_pot: false,
        width: 3.5,
        height: 4.5
      });
    });
  });

  describe('validation - pot mode', () => {
    it('validates name is non-empty for pots', () => {
      render(<BedForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      fireEvent.click(screen.getByLabelText('This is a pot'));
      fireEvent.click(screen.getByText('Create Pot'));

      expect(screen.getByText('Name is required')).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('does not require width/height for pots', () => {
      render(<BedForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      fireEvent.click(screen.getByLabelText('This is a pot'));
      fireEvent.change(screen.getByLabelText('Pot Name'), { target: { value: 'My Pot' } });
      fireEvent.click(screen.getByText('Create Pot'));

      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  describe('form submission - bed mode', () => {
    it('calls onSubmit with correct data including is_pot', () => {
      render(<BedForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      fireEvent.change(screen.getByLabelText('Bed Name'), { target: { value: 'My Garden' } });
      fireEvent.change(screen.getByLabelText('Width (ft)'), { target: { value: '4' } });
      fireEvent.change(screen.getByLabelText('Height (ft)'), { target: { value: '6' } });
      fireEvent.click(screen.getByText('Create Bed'));

      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'My Garden',
        is_pot: false,
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
        is_pot: false,
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

  describe('form submission - pot mode', () => {
    it('calls onSubmit with pot data', () => {
      render(<BedForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      fireEvent.click(screen.getByLabelText('This is a pot'));
      fireEvent.change(screen.getByLabelText('Pot Name'), { target: { value: 'Kitchen Aloe' } });
      fireEvent.change(screen.getByLabelText('Size'), { target: { value: 'large' } });
      fireEvent.click(screen.getByText('Create Pot'));

      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'Kitchen Aloe',
        is_pot: true,
        size: 'large'
      });
    });

    it('defaults to medium size', () => {
      render(<BedForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      fireEvent.click(screen.getByLabelText('This is a pot'));
      fireEvent.change(screen.getByLabelText('Pot Name'), { target: { value: 'My Pot' } });
      fireEvent.click(screen.getByText('Create Pot'));

      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'My Pot',
        is_pot: true,
        size: 'medium'
      });
    });

    it('submits with small size', () => {
      render(<BedForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      fireEvent.click(screen.getByLabelText('This is a pot'));
      fireEvent.change(screen.getByLabelText('Pot Name'), { target: { value: 'Small Pot' } });
      fireEvent.change(screen.getByLabelText('Size'), { target: { value: 'small' } });
      fireEvent.click(screen.getByText('Create Pot'));

      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'Small Pot',
        is_pot: true,
        size: 'small'
      });
    });

    it('submits with extra_large size', () => {
      render(<BedForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      fireEvent.click(screen.getByLabelText('This is a pot'));
      fireEvent.change(screen.getByLabelText('Pot Name'), { target: { value: 'Big Pot' } });
      fireEvent.change(screen.getByLabelText('Size'), { target: { value: 'extra_large' } });
      fireEvent.click(screen.getByText('Create Pot'));

      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'Big Pot',
        is_pot: true,
        size: 'extra_large'
      });
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
          bed={{ id: 'bed-1', name: 'Updated', width: 5, height: 5, is_pot: false }}
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

    it('edits a pot correctly', () => {
      const pot = { id: 'pot-1', name: 'My Pot', is_pot: true, size: 'small' };
      render(<BedForm bed={pot} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      fireEvent.change(screen.getByLabelText('Pot Name'), { target: { value: 'Updated Pot' } });
      fireEvent.change(screen.getByLabelText('Size'), { target: { value: 'large' } });
      fireEvent.click(screen.getByText('Save Changes'));

      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'Updated Pot',
        is_pot: true,
        size: 'large'
      });
    });
  });

  describe('mode switching', () => {
    it('preserves name when switching from bed to pot mode', () => {
      render(<BedForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      fireEvent.change(screen.getByLabelText('Bed Name'), { target: { value: 'My Location' } });
      fireEvent.click(screen.getByLabelText('This is a pot'));

      expect(screen.getByLabelText('Pot Name')).toHaveValue('My Location');
    });

    it('preserves name when switching from pot to bed mode', () => {
      render(<BedForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      fireEvent.click(screen.getByLabelText('This is a pot'));
      fireEvent.change(screen.getByLabelText('Pot Name'), { target: { value: 'My Location' } });
      fireEvent.click(screen.getByLabelText('This is a pot'));

      expect(screen.getByLabelText('Bed Name')).toHaveValue('My Location');
    });
  });
});
