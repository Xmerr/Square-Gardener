import { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';

const MONTHS = [
  { value: '01', label: 'January' },
  { value: '02', label: 'February' },
  { value: '03', label: 'March' },
  { value: '04', label: 'April' },
  { value: '05', label: 'May' },
  { value: '06', label: 'June' },
  { value: '07', label: 'July' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' }
];

const getDaysInMonth = (month) => {
  if (!month) return 31;
  const monthNum = parseInt(month, 10);
  if ([4, 6, 9, 11].includes(monthNum)) return 30;
  if (monthNum === 2) return 29; // Allow Feb 29 for leap years
  return 31;
};

const parseValue = (value) => {
  if (value && typeof value === 'string' && value.match(/^\d{2}-\d{2}$/)) {
    const [m, d] = value.split('-');
    return { month: m, day: d };
  }
  return { month: '', day: '' };
};

function MonthDayPicker({ id, value, onChange, hasError }) {
  // Parse the external value to get initial state
  const initialParsed = useMemo(() => parseValue(value), [value]);

  // Local state for month and day, initialized from value but can diverge for partial selections
  const [localMonth, setLocalMonth] = useState(() => parseValue(value).month);
  const [localDay, setLocalDay] = useState(() => parseValue(value).day);

  // Key for resetting local state when external value changes
  const [lastExternalValue, setLastExternalValue] = useState(value);

  // Sync local state when external value changes (controlled component pattern)
  if (value !== lastExternalValue) {
    setLastExternalValue(value);
    const newParsed = parseValue(value);
    if (newParsed.month !== localMonth || newParsed.day !== localDay) {
      setLocalMonth(newParsed.month);
      setLocalDay(newParsed.day);
    }
  }

  const handleMonthChange = useCallback((e) => {
    const newMonth = e.target.value;
    setLocalMonth(newMonth);

    if (newMonth && localDay) {
      const maxDays = getDaysInMonth(newMonth);
      const dayNum = parseInt(localDay, 10);
      if (dayNum > maxDays) {
        const adjustedDay = maxDays.toString().padStart(2, '0');
        setLocalDay(adjustedDay);
        onChange(`${newMonth}-${adjustedDay}`);
      } else {
        onChange(`${newMonth}-${localDay}`);
      }
    } else {
      onChange('');
    }
  }, [localDay, onChange]);

  const handleDayChange = useCallback((e) => {
    const newDay = e.target.value;
    setLocalDay(newDay);

    if (localMonth && newDay) {
      onChange(`${localMonth}-${newDay}`);
    } else {
      onChange('');
    }
  }, [localMonth, onChange]);

  const daysInMonth = getDaysInMonth(localMonth);
  const days = useMemo(() => Array.from({ length: daysInMonth }, (_, i) => {
    const dayNum = i + 1;
    return {
      value: dayNum.toString().padStart(2, '0'),
      label: dayNum.toString()
    };
  }), [daysInMonth]);

  const borderColor = hasError ? 'border-red-500' : 'border-gray-300';

  // Suppress the unused variable warning - initialParsed is used for memoization tracking
  void initialParsed;

  return (
    <div className="flex gap-2">
      <select
        id={`${id}-month`}
        value={localMonth}
        onChange={handleMonthChange}
        className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${borderColor}`}
      >
        <option value="">Month</option>
        {MONTHS.map((m) => (
          <option key={m.value} value={m.value}>
            {m.label}
          </option>
        ))}
      </select>
      <select
        id={`${id}-day`}
        value={localDay}
        onChange={handleDayChange}
        className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${borderColor}`}
        style={{ width: '80px' }}
      >
        <option value="">Day</option>
        {days.map((d) => (
          <option key={d.value} value={d.value}>
            {d.label}
          </option>
        ))}
      </select>
    </div>
  );
}

MonthDayPicker.propTypes = {
  id: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  hasError: PropTypes.bool
};

export default MonthDayPicker;
