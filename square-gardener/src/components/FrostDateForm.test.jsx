import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FrostDateForm from './FrostDateForm';
import * as frostDateStorage from '../utils/frostDateStorage';
import * as frostDateLookup from '../utils/frostDateLookup';

vi.mock('../utils/frostDateStorage', () => ({
  getFrostDates: vi.fn(),
  saveFrostDates: vi.fn()
}));

vi.mock('../utils/frostDateLookup', () => ({
  lookupFrostDates: vi.fn(),
  isZipCodeSupported: vi.fn()
}));

describe('FrostDateForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    frostDateStorage.getFrostDates.mockReturnValue({
      lastSpringFrost: null,
      firstFallFrost: null,
      zipCode: null
    });
    frostDateStorage.saveFrostDates.mockReturnValue(true);
    frostDateLookup.lookupFrostDates.mockReturnValue(null);
    frostDateLookup.isZipCodeSupported.mockReturnValue(false);
  });

  describe('rendering', () => {
    it('should render the form with all inputs', () => {
      render(<FrostDateForm />);

      expect(screen.getByText('Frost Date Settings')).toBeInTheDocument();
      expect(screen.getByLabelText('ZIP Code (optional)')).toBeInTheDocument();
      expect(screen.getByLabelText('Last Spring Frost')).toBeInTheDocument();
      expect(screen.getByLabelText('First Fall Frost')).toBeInTheDocument();
      expect(screen.getByText('Save Frost Dates')).toBeInTheDocument();
    });

    it('should load existing frost dates on mount', () => {
      frostDateStorage.getFrostDates.mockReturnValue({
        lastSpringFrost: '2024-04-15',
        firstFallFrost: '2024-10-15',
        zipCode: '12345'
      });

      render(<FrostDateForm />);

      expect(screen.getByLabelText('Last Spring Frost')).toHaveValue('2024-04-15');
      expect(screen.getByLabelText('First Fall Frost')).toHaveValue('2024-10-15');
      expect(screen.getByLabelText('ZIP Code (optional)')).toHaveValue('12345');
    });

    it('should display current frost dates when set', () => {
      frostDateStorage.getFrostDates.mockReturnValue({
        lastSpringFrost: '2024-04-15',
        firstFallFrost: '2024-10-15',
        zipCode: null
      });

      render(<FrostDateForm />);

      expect(screen.getByText('Current frost dates:')).toBeInTheDocument();
    });

    it('should not display current dates message when dates are not set', () => {
      render(<FrostDateForm />);

      expect(screen.queryByText('Current frost dates:')).not.toBeInTheDocument();
    });

    it('should use initialFrostDates prop when provided', () => {
      const initialDates = {
        lastSpringFrost: '2024-05-01',
        firstFallFrost: '2024-09-30',
        zipCode: '54321'
      };

      render(<FrostDateForm initialFrostDates={initialDates} />);

      expect(screen.getByLabelText('Last Spring Frost')).toHaveValue('2024-05-01');
      expect(screen.getByLabelText('First Fall Frost')).toHaveValue('2024-09-30');
      expect(screen.getByLabelText('ZIP Code (optional)')).toHaveValue('54321');
    });
  });

  describe('ZIP code lookup', () => {
    it('should show message when ZIP code is too short', () => {
      render(<FrostDateForm />);

      const zipInput = screen.getByLabelText('ZIP Code (optional)');
      fireEvent.change(zipInput, { target: { value: '12' } });
      fireEvent.click(screen.getByText('Look Up'));

      expect(screen.getByText('Enter at least 3 digits of your ZIP code')).toBeInTheDocument();
    });

    it('should show message when ZIP code is empty', () => {
      render(<FrostDateForm />);

      fireEvent.click(screen.getByText('Look Up'));

      expect(screen.getByText('Enter at least 3 digits of your ZIP code')).toBeInTheDocument();
    });

    it('should fill dates when ZIP lookup succeeds', () => {
      frostDateLookup.lookupFrostDates.mockReturnValue({
        lastSpringFrost: '2024-04-15',
        firstFallFrost: '2024-10-15'
      });
      frostDateLookup.isZipCodeSupported.mockReturnValue(true);

      render(<FrostDateForm />);

      const zipInput = screen.getByLabelText('ZIP Code (optional)');
      fireEvent.change(zipInput, { target: { value: '10001' } });
      fireEvent.click(screen.getByText('Look Up'));

      expect(screen.getByLabelText('Last Spring Frost')).toHaveValue('2024-04-15');
      expect(screen.getByLabelText('First Fall Frost')).toHaveValue('2024-10-15');
      expect(screen.getByText('Frost dates found for your area!')).toBeInTheDocument();
    });

    it('should show error message when ZIP lookup fails', () => {
      frostDateLookup.lookupFrostDates.mockReturnValue(null);
      frostDateLookup.isZipCodeSupported.mockReturnValue(false);

      render(<FrostDateForm />);

      const zipInput = screen.getByLabelText('ZIP Code (optional)');
      fireEvent.change(zipInput, { target: { value: '99999' } });
      fireEvent.click(screen.getByText('Look Up'));

      expect(screen.getByText('ZIP code not found. Please enter dates manually.')).toBeInTheDocument();
    });
  });

  describe('form validation', () => {
    it('should show error when spring frost date is missing', () => {
      render(<FrostDateForm />);

      const fallInput = screen.getByLabelText('First Fall Frost');
      fireEvent.change(fallInput, { target: { value: '2024-10-15' } });
      fireEvent.click(screen.getByText('Save Frost Dates'));

      expect(screen.getByText('Last spring frost date is required')).toBeInTheDocument();
    });

    it('should show error when fall frost date is missing', () => {
      render(<FrostDateForm />);

      const springInput = screen.getByLabelText('Last Spring Frost');
      fireEvent.change(springInput, { target: { value: '2024-04-15' } });
      fireEvent.click(screen.getByText('Save Frost Dates'));

      expect(screen.getByText('First fall frost date is required')).toBeInTheDocument();
    });

    it('should show error when fall frost is before spring frost', () => {
      render(<FrostDateForm />);

      const springInput = screen.getByLabelText('Last Spring Frost');
      const fallInput = screen.getByLabelText('First Fall Frost');

      fireEvent.change(springInput, { target: { value: '2024-10-15' } });
      fireEvent.change(fallInput, { target: { value: '2024-04-15' } });
      fireEvent.click(screen.getByText('Save Frost Dates'));

      expect(screen.getByText('Fall frost must be after spring frost')).toBeInTheDocument();
    });

    it('should show error when dates are the same', () => {
      render(<FrostDateForm />);

      const springInput = screen.getByLabelText('Last Spring Frost');
      const fallInput = screen.getByLabelText('First Fall Frost');

      fireEvent.change(springInput, { target: { value: '2024-06-15' } });
      fireEvent.change(fallInput, { target: { value: '2024-06-15' } });
      fireEvent.click(screen.getByText('Save Frost Dates'));

      expect(screen.getByText('Fall frost must be after spring frost')).toBeInTheDocument();
    });
  });

  describe('form submission', () => {
    it('should save frost dates on valid submission', () => {
      const onSave = vi.fn();
      render(<FrostDateForm onSave={onSave} />);

      const springInput = screen.getByLabelText('Last Spring Frost');
      const fallInput = screen.getByLabelText('First Fall Frost');

      fireEvent.change(springInput, { target: { value: '2024-04-15' } });
      fireEvent.change(fallInput, { target: { value: '2024-10-15' } });
      fireEvent.click(screen.getByText('Save Frost Dates'));

      expect(frostDateStorage.saveFrostDates).toHaveBeenCalledWith({
        lastSpringFrost: '2024-04-15',
        firstFallFrost: '2024-10-15',
        zipCode: null
      });
      expect(onSave).toHaveBeenCalledWith({
        lastSpringFrost: '2024-04-15',
        firstFallFrost: '2024-10-15',
        zipCode: null
      });
    });

    it('should include ZIP code when provided', () => {
      const onSave = vi.fn();
      render(<FrostDateForm onSave={onSave} />);

      const zipInput = screen.getByLabelText('ZIP Code (optional)');
      const springInput = screen.getByLabelText('Last Spring Frost');
      const fallInput = screen.getByLabelText('First Fall Frost');

      fireEvent.change(zipInput, { target: { value: '10001' } });
      fireEvent.change(springInput, { target: { value: '2024-04-15' } });
      fireEvent.change(fallInput, { target: { value: '2024-10-15' } });
      fireEvent.click(screen.getByText('Save Frost Dates'));

      expect(frostDateStorage.saveFrostDates).toHaveBeenCalledWith({
        lastSpringFrost: '2024-04-15',
        firstFallFrost: '2024-10-15',
        zipCode: '10001'
      });
    });

    it('should not call onSave when validation fails', () => {
      const onSave = vi.fn();
      render(<FrostDateForm onSave={onSave} />);

      fireEvent.click(screen.getByText('Save Frost Dates'));

      expect(frostDateStorage.saveFrostDates).not.toHaveBeenCalled();
      expect(onSave).not.toHaveBeenCalled();
    });

    it('should work without onSave prop', () => {
      render(<FrostDateForm />);

      const springInput = screen.getByLabelText('Last Spring Frost');
      const fallInput = screen.getByLabelText('First Fall Frost');

      fireEvent.change(springInput, { target: { value: '2024-04-15' } });
      fireEvent.change(fallInput, { target: { value: '2024-10-15' } });
      fireEvent.click(screen.getByText('Save Frost Dates'));

      expect(frostDateStorage.saveFrostDates).toHaveBeenCalled();
    });
  });

  describe('clear functionality', () => {
    it('should show clear button when dates are set', () => {
      frostDateStorage.getFrostDates.mockReturnValue({
        lastSpringFrost: '2024-04-15',
        firstFallFrost: '2024-10-15',
        zipCode: null
      });

      render(<FrostDateForm />);

      expect(screen.getByText('Clear')).toBeInTheDocument();
    });

    it('should not show clear button when dates are not set', () => {
      render(<FrostDateForm />);

      expect(screen.queryByText('Clear')).not.toBeInTheDocument();
    });

    it('should clear all fields when clear is clicked', () => {
      const onSave = vi.fn();
      frostDateStorage.getFrostDates.mockReturnValue({
        lastSpringFrost: '2024-04-15',
        firstFallFrost: '2024-10-15',
        zipCode: '10001'
      });

      render(<FrostDateForm onSave={onSave} />);

      fireEvent.click(screen.getByText('Clear'));

      expect(screen.getByLabelText('Last Spring Frost')).toHaveValue('');
      expect(screen.getByLabelText('First Fall Frost')).toHaveValue('');
      expect(screen.getByLabelText('ZIP Code (optional)')).toHaveValue('');
      expect(frostDateStorage.saveFrostDates).toHaveBeenCalledWith({
        lastSpringFrost: null,
        firstFallFrost: null,
        zipCode: null
      });
      expect(onSave).toHaveBeenCalledWith(null);
    });

    it('should work without onSave prop when clearing', () => {
      frostDateStorage.getFrostDates.mockReturnValue({
        lastSpringFrost: '2024-04-15',
        firstFallFrost: '2024-10-15',
        zipCode: null
      });

      render(<FrostDateForm />);

      fireEvent.click(screen.getByText('Clear'));

      expect(frostDateStorage.saveFrostDates).toHaveBeenCalled();
    });
  });

  describe('input interactions', () => {
    it('should update spring frost date on change', () => {
      render(<FrostDateForm />);

      const springInput = screen.getByLabelText('Last Spring Frost');
      fireEvent.change(springInput, { target: { value: '2024-04-15' } });

      expect(springInput).toHaveValue('2024-04-15');
    });

    it('should update fall frost date on change', () => {
      render(<FrostDateForm />);

      const fallInput = screen.getByLabelText('First Fall Frost');
      fireEvent.change(fallInput, { target: { value: '2024-10-15' } });

      expect(fallInput).toHaveValue('2024-10-15');
    });

    it('should update ZIP code on change', () => {
      render(<FrostDateForm />);

      const zipInput = screen.getByLabelText('ZIP Code (optional)');
      fireEvent.change(zipInput, { target: { value: '10001' } });

      expect(zipInput).toHaveValue('10001');
    });

    it('should clear errors after successful ZIP lookup', () => {
      frostDateLookup.lookupFrostDates.mockReturnValue({
        lastSpringFrost: '2024-04-15',
        firstFallFrost: '2024-10-15'
      });
      frostDateLookup.isZipCodeSupported.mockReturnValue(true);

      render(<FrostDateForm />);

      // First trigger validation errors
      fireEvent.click(screen.getByText('Save Frost Dates'));
      expect(screen.getByText('Last spring frost date is required')).toBeInTheDocument();

      // Now do a successful ZIP lookup
      const zipInput = screen.getByLabelText('ZIP Code (optional)');
      fireEvent.change(zipInput, { target: { value: '10001' } });
      fireEvent.click(screen.getByText('Look Up'));

      // Errors should be cleared
      expect(screen.queryByText('Last spring frost date is required')).not.toBeInTheDocument();
    });
  });
});
