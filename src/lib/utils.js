import {
  format,
  parseISO,
  startOfWeek,
  startOfMonth,
  startOfYear,
  endOfWeek,
  endOfMonth,
  endOfYear,
  isWithinInterval,
  isSameMonth,
  isSameWeek,
  isSameYear,
} from 'date-fns';

/**
 * Format a date for display
 * @param {Date|string} date - Date to format
 * @param {string} formatStr - date-fns format string
 * @returns {string} Formatted date string
 */
export const formatDate = (date, formatStr = 'MMM d, yyyy') => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, formatStr);
};

/**
 * Format time for display
 * @param {Date|string} time - Time to format
 * @returns {string} Formatted time string (e.g., "9:00 AM")
 */
export const formatTime = (time) => {
  const d = typeof time === 'string' ? parseISO(time) : time;
  return format(d, 'h:mm a');
};

/**
 * Format time range for display
 * @param {Date|string} startTime - Start time
 * @param {Date|string} endTime - End time
 * @returns {string} Formatted time range (e.g., "9:00 AM - 5:00 PM")
 */
export const formatTimeRange = (startTime, endTime) => {
  return `${formatTime(startTime)} - ${formatTime(endTime)}`;
};

/**
 * Get the start of the current week (Monday)
 * @param {Date} date - Reference date
 * @returns {Date} Start of week (Monday)
 */
export const getWeekStart = (date = new Date()) => {
  return startOfWeek(date, { weekStartsOn: 1 }); // Monday
};

/**
 * Get the end of the current week (Sunday)
 * @param {Date} date - Reference date
 * @returns {Date} End of week (Sunday)
 */
export const getWeekEnd = (date = new Date()) => {
  return endOfWeek(date, { weekStartsOn: 1 });
};

/**
 * Get the start of the current month
 * @param {Date} date - Reference date
 * @returns {Date} Start of month
 */
export const getMonthStart = (date = new Date()) => {
  return startOfMonth(date);
};

/**
 * Get the end of the current month
 * @param {Date} date - Reference date
 * @returns {Date} End of month
 */
export const getMonthEnd = (date = new Date()) => {
  return endOfMonth(date);
};

/**
 * Get the start of the current year
 * @param {Date} date - Reference date
 * @returns {Date} Start of year
 */
export const getYearStart = (date = new Date()) => {
  return startOfYear(date);
};

/**
 * Get the end of the current year
 * @param {Date} date - Reference date
 * @returns {Date} End of year
 */
export const getYearEnd = (date = new Date()) => {
  return endOfYear(date);
};

/**
 * Check if a date is within the current week
 * @param {Date|string} date - Date to check
 * @param {Date} referenceDate - Reference date for "current" week
 * @returns {boolean} True if within current week
 */
export const isInCurrentWeek = (date, referenceDate = new Date()) => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return isSameWeek(d, referenceDate, { weekStartsOn: 1 });
};

/**
 * Check if a date is within the current month
 * @param {Date|string} date - Date to check
 * @param {Date} referenceDate - Reference date for "current" month
 * @returns {boolean} True if within current month
 */
export const isInCurrentMonth = (date, referenceDate = new Date()) => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return isSameMonth(d, referenceDate);
};

/**
 * Check if a date is within the current year
 * @param {Date|string} date - Date to check
 * @param {Date} referenceDate - Reference date for "current" year
 * @returns {boolean} True if within current year
 */
export const isInCurrentYear = (date, referenceDate = new Date()) => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return isSameYear(d, referenceDate);
};

/**
 * Check if a date is within a range
 * @param {Date|string} date - Date to check
 * @param {Date} start - Range start
 * @param {Date} end - Range end
 * @returns {boolean} True if within range
 */
export const isInDateRange = (date, start, end) => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return isWithinInterval(d, { start, end });
};

/**
 * Group shifts by month
 * @param {Array} shifts - Array of shift objects
 * @returns {Object} Object with month keys and shift arrays
 */
export const groupShiftsByMonth = (shifts) => {
  const grouped = {};

  shifts.forEach((shift) => {
    const date =
      typeof shift.shift_date === 'string'
        ? parseISO(shift.shift_date)
        : shift.shift_date;
    const monthKey = format(date, 'yyyy-MM');
    const monthLabel = format(date, 'MMMM yyyy');

    if (!grouped[monthKey]) {
      grouped[monthKey] = {
        key: monthKey,
        label: monthLabel,
        shifts: [],
      };
    }

    grouped[monthKey].shifts.push(shift);
  });

  // Sort by month key descending (newest first)
  return Object.values(grouped).sort((a, b) => b.key.localeCompare(a.key));
};

/**
 * Calculate summary totals from shifts
 * @param {Array} shifts - Array of shift objects
 * @returns {Object} Summary totals
 */
export const calculateSummaryTotals = (shifts) => {
  return shifts.reduce(
    (totals, shift) => ({
      shiftCount: totals.shiftCount + 1,
      totalHours: totals.totalHours + (shift.adjusted_hours || 0),
      totalCAD: totals.totalCAD + (shift.earnings_cad || 0),
      totalPHP: totals.totalPHP + (shift.earnings_php || 0),
    }),
    { shiftCount: 0, totalHours: 0, totalCAD: 0, totalPHP: 0 }
  );
};

/**
 * Filter shifts by date range
 * @param {Array} shifts - Array of shift objects
 * @param {Date} start - Range start
 * @param {Date} end - Range end
 * @returns {Array} Filtered shifts
 */
export const filterShiftsByDateRange = (shifts, start, end) => {
  return shifts.filter((shift) => {
    const shiftDate =
      typeof shift.shift_date === 'string'
        ? parseISO(shift.shift_date)
        : shift.shift_date;
    return isWithinInterval(shiftDate, { start, end });
  });
};

/**
 * Filter shifts for current week
 * @param {Array} shifts - Array of shift objects
 * @param {Date} referenceDate - Reference date
 * @returns {Array} Shifts in current week
 */
export const getWeeklyShifts = (shifts, referenceDate = new Date()) => {
  const start = getWeekStart(referenceDate);
  const end = getWeekEnd(referenceDate);
  return filterShiftsByDateRange(shifts, start, end);
};

/**
 * Filter shifts for current month
 * @param {Array} shifts - Array of shift objects
 * @param {Date} referenceDate - Reference date
 * @returns {Array} Shifts in current month
 */
export const getMonthlyShifts = (shifts, referenceDate = new Date()) => {
  const start = getMonthStart(referenceDate);
  const end = getMonthEnd(referenceDate);
  return filterShiftsByDateRange(shifts, start, end);
};

/**
 * Filter shifts for current year
 * @param {Array} shifts - Array of shift objects
 * @param {Date} referenceDate - Reference date
 * @returns {Array} Shifts in current year
 */
export const getYearlyShifts = (shifts, referenceDate = new Date()) => {
  const start = getYearStart(referenceDate);
  const end = getYearEnd(referenceDate);
  return filterShiftsByDateRange(shifts, start, end);
};

/**
 * Generate a unique ID
 * @returns {string} UUID
 */
export const generateId = () => {
  return crypto.randomUUID();
};

/**
 * Combine date and time strings into a Date object
 * @param {Date|string} date - Date portion
 * @param {string} time - Time string (HH:mm format)
 * @returns {Date} Combined date and time
 */
export const combineDateAndTime = (date, time) => {
  const d = typeof date === 'string' ? parseISO(date) : new Date(date);
  const [hours, minutes] = time.split(':').map(Number);
  d.setHours(hours, minutes, 0, 0);
  return d;
};

/**
 * Extract time string from Date object
 * @param {Date|string} date - Date with time
 * @returns {string} Time string (HH:mm format)
 */
export const extractTimeString = (date) => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'HH:mm');
};

/**
 * Classnames utility (simple cn function)
 * @param  {...string} classes - Class names to combine
 * @returns {string} Combined class string
 */
export const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

export default {
  formatDate,
  formatTime,
  formatTimeRange,
  getWeekStart,
  getWeekEnd,
  getMonthStart,
  getMonthEnd,
  getYearStart,
  getYearEnd,
  isInCurrentWeek,
  isInCurrentMonth,
  isInCurrentYear,
  isInDateRange,
  groupShiftsByMonth,
  calculateSummaryTotals,
  filterShiftsByDateRange,
  getWeeklyShifts,
  getMonthlyShifts,
  getYearlyShifts,
  generateId,
  combineDateAndTime,
  extractTimeString,
  cn,
};
