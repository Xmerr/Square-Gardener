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
      expect(screen.getByText('Last Spring Frost')).toBeInTheDocument();
      expect(screen.getByText('First Fall Frost')).toBeInTheDocument();
      expect(screen.getByText('Save Frost Dates')).toBeInTheDocument();
    });

    it('should load existing frost dates on mount with MM-DD format', () => {
      frostDateStorage.getFrostDates.mockReturnValue({
        lastSpringFrost: '04-15',
        firstFallFrost: '10-15',
        zipCode: '12345'
      });

      render(<FrostDateForm />);

      expect(screen.getByDisplayValue('April')).toBeInTheDocument();
      const daySelects = screen.getAllByDisplayValue('15');
      expect(daySelects).toHaveLength(2);
      expect(screen.getByDisplayValue('October')).toBeInTheDocument();
      expect(screen.getByLabelText('ZIP Code (optional)')).toHaveValue('12345');
    });

    it('should convert YYYY-MM-DD format to MM-DD for backward compatibility', () => {
      frostDateStorage.getFrostDates.mockReturnValue({
        lastSpringFrost: '2024-04-15',
        firstFallFrost: '2024-10-15',
        zipCode: '12345'
      });

      render(<FrostDateForm />);

      expect(screen.getByDisplayValue('April')).toBeInTheDocument();
      const daySelects = screen.getAllByDisplayValue('15');
      expect(daySelects).toHaveLength(2);
      expect(screen.getByDisplayValue('October')).toBeInTheDocument();
    });

    it('should display current frost dates when set', () => {
      frostDateStorage.getFrostDates.mockReturnValue({
        lastSpringFrost: '04-15',
        firstFallFrost: '10-15',
        zipCode: null
      });

      render(<FrostDateForm />);

      expect(screen.getByText('Current frost dates:')).toBeInTheDocument();
      expect(screen.getByText(/April 15/)).toBeInTheDocument();
      expect(screen.getByText(/October 15/)).toBeInTheDocument();
    });

    it('should not display current dates message when dates are not set', () => {
      render(<FrostDateForm />);

      expect(screen.queryByText('Current frost dates:')).not.toBeInTheDocument();
    });

    it('should use initialFrostDates prop when provided', () => {
      const initialDates = {
        lastSpringFrost: '05-01',
        firstFallFrost: '09-30',
        zipCode: '54321'
      };

      render(<FrostDateForm initialFrostDates={initialDates} />);

      expect(screen.getByDisplayValue('May')).toBeInTheDocument();
      expect(screen.getByDisplayValue('1')).toBeInTheDocument();
      expect(screen.getByDisplayValue('September')).toBeInTheDocument();
      expect(screen.getByDisplayValue('30')).toBeInTheDocument();
      expect(screen.getByLabelText('ZIP Code (optional)')).toHaveValue('54321');
    });

    it('should handle initialFrostDates with YYYY-MM-DD format', () => {
      const initialDates = {
        lastSpringFrost: '2024-05-01',
        firstFallFrost: '2024-09-30',
        zipCode: '54321'
      };

      render(<FrostDateForm initialFrostDates={initialDates} />);

      expect(screen.getByDisplayValue('May')).toBeInTheDocument();
      expect(screen.getByDisplayValue('1')).toBeInTheDocument();
      expect(screen.getByDisplayValue('September')).toBeInTheDocument();
      expect(screen.getByDisplayValue('30')).toBeInTheDocument();
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
        lastSpringFrost: '04-15',
        firstFallFrost: '10-15'
      });
      frostDateLookup.isZipCodeSupported.mockReturnValue(true);

      render(<FrostDateForm />);

      const zipInput = screen.getByLabelText('ZIP Code (optional)');
      fireEvent.change(zipInput, { target: { value: '10001' } });
      fireEvent.click(screen.getByText('Look Up'));

      expect(screen.getByDisplayValue('April')).toBeInTheDocument();
      expect(screen.getAllByDisplayValue('15')[0]).toBeInTheDocument();
      expect(screen.getByDisplayValue('October')).toBeInTheDocument();
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

      const fallMonthSelect = screen.getAllByDisplayValue('Month')[1];
      const fallDaySelect = screen.getAllByDisplayValue('Day')[1];

      fireEvent.change(fallMonthSelect, { target: { value: '10' } });
      fireEvent.change(fallDaySelect, { target: { value: '15' } });
      fireEvent.click(screen.getByText('Save Frost Dates'));

      expect(screen.getByText('Last spring frost date is required')).toBeInTheDocument();
    });

    it('should show error when fall frost date is missing', () => {
      render(<FrostDateForm />);

      const springMonthSelect = screen.getAllByDisplayValue('Month')[0];
      const springDaySelect = screen.getAllByDisplayValue('Day')[0];

      fireEvent.change(springMonthSelect, { target: { value: '04' } });
      fireEvent.change(springDaySelect, { target: { value: '15' } });
      fireEvent.click(screen.getByText('Save Frost Dates'));

      expect(screen.getByText('First fall frost date is required')).toBeInTheDocument();
    });

    it('should show error when fall frost is before spring frost', () => {
      render(<FrostDateForm />);

      const springMonthSelect = screen.getAllByDisplayValue('Month')[0];
      const springDaySelect = screen.getAllByDisplayValue('Day')[0];
      const fallMonthSelect = screen.getAllByDisplayValue('Month')[1];
      const fallDaySelect = screen.getAllByDisplayValue('Day')[1];

      fireEvent.change(springMonthSelect, { target: { value: '10' } });
      fireEvent.change(springDaySelect, { target: { value: '15' } });
      fireEvent.change(fallMonthSelect, { target: { value: '04' } });
      fireEvent.change(fallDaySelect, { target: { value: '15' } });
      fireEvent.click(screen.getByText('Save Frost Dates'));

      expect(screen.getByText('Fall frost must be after spring frost')).toBeInTheDocument();
    });

    it('should show error when dates are the same', () => {
      render(<FrostDateForm />);

      const springMonthSelect = screen.getAllByDisplayValue('Month')[0];
      const springDaySelect = screen.getAllByDisplayValue('Day')[0];
      const fallMonthSelect = screen.getAllByDisplayValue('Month')[1];
      const fallDaySelect = screen.getAllByDisplayValue('Day')[1];

      fireEvent.change(springMonthSelect, { target: { value: '06' } });
      fireEvent.change(springDaySelect, { target: { value: '15' } });
      fireEvent.change(fallMonthSelect, { target: { value: '06' } });
      fireEvent.change(fallDaySelect, { target: { value: '15' } });
      fireEvent.click(screen.getByText('Save Frost Dates'));

      expect(screen.getByText('Fall frost must be after spring frost')).toBeInTheDocument();
    });
  });

  describe('validation edge cases', () => {
    it('should show error for invalid spring frost date format', () => {
      const initialDates = {
        lastSpringFrost: 'invalid',
        firstFallFrost: '10-15',
        zipCode: null
      };

      render(<FrostDateForm initialFrostDates={initialDates} />);

      fireEvent.click(screen.getByText('Save Frost Dates'));

      expect(screen.getByText('Invalid date format')).toBeInTheDocument();
    });

    it('should show error for invalid fall frost date format', () => {
      const initialDates = {
        lastSpringFrost: '04-15',
        firstFallFrost: 'invalid',
        zipCode: null
      };

      render(<FrostDateForm initialFrostDates={initialDates} />);

      fireEvent.click(screen.getByText('Save Frost Dates'));

      expect(screen.getByText('Invalid date format')).toBeInTheDocument();
    });
  });

  describe('form submission', () => {
    it('should save frost dates on valid submission', () => {
      const onSave = vi.fn();
      render(<FrostDateForm onSave={onSave} />);

      const springMonthSelect = screen.getAllByDisplayValue('Month')[0];
      const springDaySelect = screen.getAllByDisplayValue('Day')[0];
      const fallMonthSelect = screen.getAllByDisplayValue('Month')[1];
      const fallDaySelect = screen.getAllByDisplayValue('Day')[1];

      fireEvent.change(springMonthSelect, { target: { value: '04' } });
      fireEvent.change(springDaySelect, { target: { value: '15' } });
      fireEvent.change(fallMonthSelect, { target: { value: '10' } });
      fireEvent.change(fallDaySelect, { target: { value: '15' } });
      fireEvent.click(screen.getByText('Save Frost Dates'));

      expect(frostDateStorage.saveFrostDates).toHaveBeenCalledWith({
        lastSpringFrost: '04-15',
        firstFallFrost: '10-15',
        zipCode: null
      });
      expect(onSave).toHaveBeenCalledWith({
        lastSpringFrost: '04-15',
        firstFallFrost: '10-15',
        zipCode: null
      });
    });

    it('should include ZIP code when provided', () => {
      const onSave = vi.fn();
      render(<FrostDateForm onSave={onSave} />);

      const zipInput = screen.getByLabelText('ZIP Code (optional)');
      const springMonthSelect = screen.getAllByDisplayValue('Month')[0];
      const springDaySelect = screen.getAllByDisplayValue('Day')[0];
      const fallMonthSelect = screen.getAllByDisplayValue('Month')[1];
      const fallDaySelect = screen.getAllByDisplayValue('Day')[1];

      fireEvent.change(zipInput, { target: { value: '10001' } });
      fireEvent.change(springMonthSelect, { target: { value: '04' } });
      fireEvent.change(springDaySelect, { target: { value: '15' } });
      fireEvent.change(fallMonthSelect, { target: { value: '10' } });
      fireEvent.change(fallDaySelect, { target: { value: '15' } });
      fireEvent.click(screen.getByText('Save Frost Dates'));

      expect(frostDateStorage.saveFrostDates).toHaveBeenCalledWith({
        lastSpringFrost: '04-15',
        firstFallFrost: '10-15',
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

      const springMonthSelect = screen.getAllByDisplayValue('Month')[0];
      const springDaySelect = screen.getAllByDisplayValue('Day')[0];
      const fallMonthSelect = screen.getAllByDisplayValue('Month')[1];
      const fallDaySelect = screen.getAllByDisplayValue('Day')[1];

      fireEvent.change(springMonthSelect, { target: { value: '04' } });
      fireEvent.change(springDaySelect, { target: { value: '15' } });
      fireEvent.change(fallMonthSelect, { target: { value: '10' } });
      fireEvent.change(fallDaySelect, { target: { value: '15' } });
      fireEvent.click(screen.getByText('Save Frost Dates'));

      expect(frostDateStorage.saveFrostDates).toHaveBeenCalled();
    });
  });

  describe('clear functionality', () => {
    it('should show clear button when dates are set', () => {
      frostDateStorage.getFrostDates.mockReturnValue({
        lastSpringFrost: '04-15',
        firstFallFrost: '10-15',
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
        lastSpringFrost: '04-15',
        firstFallFrost: '10-15',
        zipCode: '10001'
      });

      render(<FrostDateForm onSave={onSave} />);

      fireEvent.click(screen.getByText('Clear'));

      expect(screen.getAllByDisplayValue('Month')).toHaveLength(2);
      expect(screen.getAllByDisplayValue('Day')).toHaveLength(2);
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
        lastSpringFrost: '04-15',
        firstFallFrost: '10-15',
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

      const springMonthSelect = screen.getAllByDisplayValue('Month')[0];
      const springDaySelect = screen.getAllByDisplayValue('Day')[0];

      fireEvent.change(springMonthSelect, { target: { value: '04' } });
      fireEvent.change(springDaySelect, { target: { value: '15' } });

      expect(screen.getByDisplayValue('April')).toBeInTheDocument();
      expect(screen.getAllByDisplayValue('15')[0]).toBeInTheDocument();
    });

    it('should update fall frost date on change', () => {
      render(<FrostDateForm />);

      const fallMonthSelect = screen.getAllByDisplayValue('Month')[1];
      const fallDaySelect = screen.getAllByDisplayValue('Day')[1];

      fireEvent.change(fallMonthSelect, { target: { value: '10' } });
      fireEvent.change(fallDaySelect, { target: { value: '15' } });

      expect(screen.getByDisplayValue('October')).toBeInTheDocument();
      expect(screen.getAllByDisplayValue('15')[0]).toBeInTheDocument();
    });

    it('should update ZIP code on change', () => {
      render(<FrostDateForm />);

      const zipInput = screen.getByLabelText('ZIP Code (optional)');
      fireEvent.change(zipInput, { target: { value: '10001' } });

      expect(zipInput).toHaveValue('10001');
    });

    it('should clear errors after successful ZIP lookup', () => {
      frostDateLookup.lookupFrostDates.mockReturnValue({
        lastSpringFrost: '04-15',
        firstFallFrost: '10-15'
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

  describe('error clearing on valid input', () => {
    it('clears spring frost error when valid date is entered', () => {
      render(<FrostDateForm />);

      // First trigger a validation error
      const fallMonthSelect = screen.getAllByDisplayValue('Month')[1];
      const fallDaySelect = screen.getAllByDisplayValue('Day')[1];
      fireEvent.change(fallMonthSelect, { target: { value: '10' } });
      fireEvent.change(fallDaySelect, { target: { value: '15' } });
      fireEvent.click(screen.getByText('Save Frost Dates'));

      expect(screen.getByText('Last spring frost date is required')).toBeInTheDocument();

      // Now enter valid spring frost date
      const springMonthSelect = screen.getAllByDisplayValue('Month')[0];
      const springDaySelect = screen.getAllByDisplayValue('Day')[0];
      fireEvent.change(springMonthSelect, { target: { value: '04' } });
      fireEvent.change(springDaySelect, { target: { value: '15' } });

      expect(screen.queryByText('Last spring frost date is required')).not.toBeInTheDocument();
    });

    it('clears fall frost error when valid date is entered', () => {
      render(<FrostDateForm />);

      // Get all selects - use role-based queries for more reliable selection
      const monthSelects = screen.getAllByRole('combobox').filter(el => el.id.includes('month'));
      const daySelects = screen.getAllByRole('combobox').filter(el => el.id.includes('day'));

      // First trigger a validation error by setting spring frost only
      fireEvent.change(monthSelects[0], { target: { value: '04' } });
      fireEvent.change(daySelects[0], { target: { value: '15' } });
      fireEvent.click(screen.getByText('Save Frost Dates'));

      expect(screen.getByText('First fall frost date is required')).toBeInTheDocument();

      // Now enter valid fall frost date
      fireEvent.change(monthSelects[1], { target: { value: '10' } });
      fireEvent.change(daySelects[1], { target: { value: '15' } });

      expect(screen.queryByText('First fall frost date is required')).not.toBeInTheDocument();
    });

    it('clears fall frost order error when spring frost is corrected', () => {
      render(<FrostDateForm />);

      // Set up dates where fall is before spring
      const springMonthSelect = screen.getAllByDisplayValue('Month')[0];
      const springDaySelect = screen.getAllByDisplayValue('Day')[0];
      const fallMonthSelect = screen.getAllByDisplayValue('Month')[1];
      const fallDaySelect = screen.getAllByDisplayValue('Day')[1];

      fireEvent.change(springMonthSelect, { target: { value: '10' } });
      fireEvent.change(springDaySelect, { target: { value: '15' } });
      fireEvent.change(fallMonthSelect, { target: { value: '04' } });
      fireEvent.change(fallDaySelect, { target: { value: '15' } });
      fireEvent.click(screen.getByText('Save Frost Dates'));

      expect(screen.getByText('Fall frost must be after spring frost')).toBeInTheDocument();

      // Fix by changing spring to be before fall
      fireEvent.change(springMonthSelect, { target: { value: '03' } });

      expect(screen.queryByText('Fall frost must be after spring frost')).not.toBeInTheDocument();
    });

    it('clears fall frost order error when fall frost is corrected', () => {
      render(<FrostDateForm />);

      // Set up dates where fall is before spring
      const springMonthSelect = screen.getAllByDisplayValue('Month')[0];
      const springDaySelect = screen.getAllByDisplayValue('Day')[0];
      const fallMonthSelect = screen.getAllByDisplayValue('Month')[1];
      const fallDaySelect = screen.getAllByDisplayValue('Day')[1];

      fireEvent.change(springMonthSelect, { target: { value: '10' } });
      fireEvent.change(springDaySelect, { target: { value: '15' } });
      fireEvent.change(fallMonthSelect, { target: { value: '04' } });
      fireEvent.change(fallDaySelect, { target: { value: '15' } });
      fireEvent.click(screen.getByText('Save Frost Dates'));

      expect(screen.getByText('Fall frost must be after spring frost')).toBeInTheDocument();

      // Fix by changing fall to be after spring
      fireEvent.change(fallMonthSelect, { target: { value: '11' } });

      expect(screen.queryByText('Fall frost must be after spring frost')).not.toBeInTheDocument();
    });

    it('does not clear fall frost error when fall date is still invalid', () => {
      render(<FrostDateForm />);

      // Set up dates where fall is before spring
      const springMonthSelect = screen.getAllByDisplayValue('Month')[0];
      const springDaySelect = screen.getAllByDisplayValue('Day')[0];
      const fallMonthSelect = screen.getAllByDisplayValue('Month')[1];
      const fallDaySelect = screen.getAllByDisplayValue('Day')[1];

      fireEvent.change(springMonthSelect, { target: { value: '06' } });
      fireEvent.change(springDaySelect, { target: { value: '15' } });
      fireEvent.change(fallMonthSelect, { target: { value: '04' } });
      fireEvent.change(fallDaySelect, { target: { value: '15' } });
      fireEvent.click(screen.getByText('Save Frost Dates'));

      expect(screen.getByText('Fall frost must be after spring frost')).toBeInTheDocument();

      // Change fall to another invalid date (still before spring)
      fireEvent.change(fallMonthSelect, { target: { value: '05' } });

      // Error should still be present
      expect(screen.getByText('Fall frost must be after spring frost')).toBeInTheDocument();
    });

    it('keeps spring frost error when invalid date is entered', () => {
      render(<FrostDateForm />);

      // First trigger a validation error
      const fallMonthSelect = screen.getAllByDisplayValue('Month')[1];
      const fallDaySelect = screen.getAllByDisplayValue('Day')[1];
      fireEvent.change(fallMonthSelect, { target: { value: '10' } });
      fireEvent.change(fallDaySelect, { target: { value: '15' } });
      fireEvent.click(screen.getByText('Save Frost Dates'));

      expect(screen.getByText('Last spring frost date is required')).toBeInTheDocument();

      // Enter partial date (still invalid) - error is not cleared
      const springMonthSelect = screen.getAllByDisplayValue('Month')[0];
      fireEvent.change(springMonthSelect, { target: { value: '04' } });

      // Error should remain (not cleared because still invalid)
      expect(screen.getByText('Last spring frost date is required')).toBeInTheDocument();
    });

    it('keeps fall frost error when invalid date is entered', () => {
      render(<FrostDateForm />);

      // First trigger a validation error
      const springMonthSelect = screen.getAllByDisplayValue('Month')[0];
      const springDaySelect = screen.getAllByDisplayValue('Day')[0];
      fireEvent.change(springMonthSelect, { target: { value: '04' } });
      fireEvent.change(springDaySelect, { target: { value: '15' } });
      fireEvent.click(screen.getByText('Save Frost Dates'));

      expect(screen.getByText('First fall frost date is required')).toBeInTheDocument();

      // Enter partial date (still invalid) - error is not cleared
      const fallMonthSelect = screen.getAllByRole('combobox').filter(el => el.id.includes('month'))[1];
      fireEvent.change(fallMonthSelect, { target: { value: '10' } });

      // Error should remain (not cleared because still invalid - no day selected)
      expect(screen.getByText('First fall frost date is required')).toBeInTheDocument();
    });
  });

  describe('ZIP code validation', () => {
    it('should show error when non-numeric characters are entered', () => {
      render(<FrostDateForm />);

      const zipInput = screen.getByLabelText('ZIP Code (optional)');
      fireEvent.change(zipInput, { target: { value: 'invalid' } });

      expect(screen.getByText('ZIP code must contain only numbers')).toBeInTheDocument();
    });

    it('should show error when input exceeds 5 digits', () => {
      render(<FrostDateForm />);

      const zipInput = screen.getByLabelText('ZIP Code (optional)');
      fireEvent.change(zipInput, { target: { value: '123456' } });

      expect(screen.getByText('ZIP code must be 5 digits or less')).toBeInTheDocument();
    });

    it('should not show error for valid numeric input', () => {
      render(<FrostDateForm />);

      const zipInput = screen.getByLabelText('ZIP Code (optional)');
      fireEvent.change(zipInput, { target: { value: '12345' } });

      expect(screen.queryByText('ZIP code must contain only numbers')).not.toBeInTheDocument();
      expect(screen.queryByText('ZIP code must be 5 digits or less')).not.toBeInTheDocument();
    });

    it('should not show error for empty input', () => {
      render(<FrostDateForm />);

      const zipInput = screen.getByLabelText('ZIP Code (optional)');
      fireEvent.change(zipInput, { target: { value: '12345' } });
      fireEvent.change(zipInput, { target: { value: '' } });

      expect(screen.queryByText('ZIP code must contain only numbers')).not.toBeInTheDocument();
      expect(screen.queryByText('ZIP code must be 5 digits or less')).not.toBeInTheDocument();
    });

    it('should disable lookup button when there is a validation error', () => {
      render(<FrostDateForm />);

      const zipInput = screen.getByLabelText('ZIP Code (optional)');
      const lookupButton = screen.getByText('Look Up');

      fireEvent.change(zipInput, { target: { value: 'invalid' } });

      expect(lookupButton).toBeDisabled();
    });

    it('should enable lookup button when input is valid', () => {
      render(<FrostDateForm />);

      const zipInput = screen.getByLabelText('ZIP Code (optional)');
      const lookupButton = screen.getByText('Look Up');

      fireEvent.change(zipInput, { target: { value: '12345' } });

      expect(lookupButton).not.toBeDisabled();
    });

    it('should show error with red border on input field', () => {
      render(<FrostDateForm />);

      const zipInput = screen.getByLabelText('ZIP Code (optional)');
      fireEvent.change(zipInput, { target: { value: 'invalid' } });

      expect(zipInput).toHaveClass('border-red-500');
    });

    it('should show normal border when input is valid', () => {
      render(<FrostDateForm />);

      const zipInput = screen.getByLabelText('ZIP Code (optional)');
      fireEvent.change(zipInput, { target: { value: '12345' } });

      expect(zipInput).toHaveClass('border-gray-300');
      expect(zipInput).not.toHaveClass('border-red-500');
    });

    it('should clear validation error when valid input is entered', () => {
      render(<FrostDateForm />);

      const zipInput = screen.getByLabelText('ZIP Code (optional)');

      // Enter invalid input first
      fireEvent.change(zipInput, { target: { value: 'abc' } });
      expect(screen.getByText('ZIP code must contain only numbers')).toBeInTheDocument();

      // Enter valid input
      fireEvent.change(zipInput, { target: { value: '12345' } });
      expect(screen.queryByText('ZIP code must contain only numbers')).not.toBeInTheDocument();
    });

    it('should not show lookup message when there is a validation error', () => {
      frostDateLookup.lookupFrostDates.mockReturnValue({
        lastSpringFrost: '04-15',
        firstFallFrost: '10-15'
      });
      frostDateLookup.isZipCodeSupported.mockReturnValue(true);

      render(<FrostDateForm />);

      const zipInput = screen.getByLabelText('ZIP Code (optional)');

      // First do a successful lookup
      fireEvent.change(zipInput, { target: { value: '10001' } });
      fireEvent.click(screen.getByText('Look Up'));
      expect(screen.getByText('Frost dates found for your area!')).toBeInTheDocument();

      // Now enter invalid input
      fireEvent.change(zipInput, { target: { value: 'invalid' } });
      expect(screen.queryByText('Frost dates found for your area!')).not.toBeInTheDocument();
      expect(screen.getByText('ZIP code must contain only numbers')).toBeInTheDocument();
    });

    it('should clear validation error when clear button is clicked', () => {
      frostDateStorage.getFrostDates.mockReturnValue({
        lastSpringFrost: '04-15',
        firstFallFrost: '10-15',
        zipCode: '10001'
      });

      render(<FrostDateForm />);

      const zipInput = screen.getByLabelText('ZIP Code (optional)');

      // Enter invalid input
      fireEvent.change(zipInput, { target: { value: 'invalid' } });
      expect(screen.getByText('ZIP code must contain only numbers')).toBeInTheDocument();

      // Click clear
      fireEvent.click(screen.getByText('Clear'));

      expect(screen.queryByText('ZIP code must contain only numbers')).not.toBeInTheDocument();
    });

    it('should handle mixed alphanumeric input', () => {
      render(<FrostDateForm />);

      const zipInput = screen.getByLabelText('ZIP Code (optional)');
      fireEvent.change(zipInput, { target: { value: '123abc' } });

      expect(screen.getByText('ZIP code must contain only numbers')).toBeInTheDocument();
    });

    it('should handle special characters in input', () => {
      render(<FrostDateForm />);

      const zipInput = screen.getByLabelText('ZIP Code (optional)');
      fireEvent.change(zipInput, { target: { value: '12-34' } });

      expect(screen.getByText('ZIP code must contain only numbers')).toBeInTheDocument();
    });
  });
});
