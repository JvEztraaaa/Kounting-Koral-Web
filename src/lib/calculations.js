/**
 * Calculation utilities for shift hours and earnings
 * All monetary and hour values are rounded to 2 decimal places
 */

/**
 * Round a number to 2 decimal places
 * @param {number} num - Number to round
 * @returns {number} Rounded number
 */
export const round2 = (num) => {
  return Math.round(num * 100) / 100;
};

/**
 * Calculate original hours from start and end times
 * Handles overnight shifts (when end time is earlier than start time)
 * @param {Date} startTime - Shift start time
 * @param {Date} endTime - Shift end time
 * @returns {number} Hours worked (rounded to 2 decimals)
 */
export const calculateOriginalHours = (startTime, endTime) => {
  const start = startTime instanceof Date ? startTime : new Date(startTime);
  const end = endTime instanceof Date ? endTime : new Date(endTime);
  
  let diffMs = end.getTime() - start.getTime();
  
  // Handle overnight shifts
  if (diffMs < 0) {
    diffMs += 24 * 60 * 60 * 1000; // Add 24 hours in milliseconds
  }
  
  const hours = diffMs / (1000 * 60 * 60);
  return round2(hours);
};

/**
 * Convert break minutes to break hours
 * @param {number} breakMinutes - Break time in minutes
 * @returns {number} Break time in hours (rounded to 2 decimals)
 */
export const calculateBreakHours = (breakMinutes) => {
  if (!breakMinutes || breakMinutes < 0) return 0;
  return round2(breakMinutes / 60);
};

/**
 * Calculate adjusted hours (original hours minus break hours)
 * @param {number} originalHours - Total hours from time range
 * @param {number} breakHours - Break hours to deduct
 * @returns {number} Adjusted hours (minimum 0, rounded to 2 decimals)
 */
export const calculateAdjustedHours = (originalHours, breakHours) => {
  const adjusted = originalHours - breakHours;
  return round2(Math.max(0, adjusted));
};

/**
 * Calculate earnings in CAD
 * @param {number} adjustedHours - Hours worked after break deduction
 * @param {number} hourlyRateCAD - Hourly rate in CAD
 * @returns {number} Earnings in CAD (rounded to 2 decimals)
 */
export const calculateEarningsCAD = (adjustedHours, hourlyRateCAD) => {
  return round2(adjustedHours * hourlyRateCAD);
};

/**
 * Calculate earnings in PHP
 * @param {number} earningsCAD - Earnings in CAD
 * @param {number} conversionRate - CAD to PHP conversion rate
 * @returns {number} Earnings in PHP (rounded to 2 decimals)
 */
export const calculateEarningsPHP = (earningsCAD, conversionRate) => {
  return round2(earningsCAD * conversionRate);
};

/**
 * Calculate all shift values from input data
 * @param {Object} input - Input data
 * @param {Date} input.startTime - Shift start time
 * @param {Date} input.endTime - Shift end time
 * @param {number} input.breakMinutes - Break time in minutes
 * @param {number} input.hourlyRateCAD - Hourly rate in CAD
 * @param {number} input.conversionRatePHP - CAD to PHP conversion rate
 * @returns {Object} Calculated values
 */
export const calculateShiftValues = ({
  startTime,
  endTime,
  breakMinutes,
  hourlyRateCAD,
  conversionRatePHP,
}) => {
  const originalHours = calculateOriginalHours(startTime, endTime);
  const breakHours = calculateBreakHours(breakMinutes);
  const adjustedHours = calculateAdjustedHours(originalHours, breakHours);
  const earningsCAD = calculateEarningsCAD(adjustedHours, hourlyRateCAD);
  const earningsPHP = calculateEarningsPHP(earningsCAD, conversionRatePHP);

  return {
    originalHours,
    breakHours,
    adjustedHours,
    earningsCAD,
    earningsPHP,
  };
};

/**
 * Format currency with thousands separator
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (CAD or PHP)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'CAD') => {
  const formatter = new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: currency === 'PHP' ? 'PHP' : 'CAD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return formatter.format(amount);
};

/**
 * Format hours for display
 * @param {number} hours - Hours to format
 * @returns {string} Formatted hours string
 */
export const formatHours = (hours) => {
  return `${round2(hours).toFixed(2)} hrs`;
};

export default {
  round2,
  calculateOriginalHours,
  calculateBreakHours,
  calculateAdjustedHours,
  calculateEarningsCAD,
  calculateEarningsPHP,
  calculateShiftValues,
  formatCurrency,
  formatHours,
};
