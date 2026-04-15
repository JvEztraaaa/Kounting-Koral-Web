import { z } from 'zod';
import { parseISO } from 'date-fns';
import { calculateOriginalHours, calculateBreakHours } from './calculations.js';

/**
 * Zod schema for shift form validation
 */
export const shiftSchema = z
  .object({
    workplaceName: z
      .string()
      .min(1, 'Workplace name is required')
      .transform((val) => val.trim()),
    shiftDate: z
      .string()
      .min(1, 'Shift date is required')
      .refine((value) => /^\d{4}-\d{2}-\d{2}$/.test(value), 'Invalid date'),
    startTime: z.string().min(1, 'Start time is required'),
    endTime: z.string().min(1, 'End time is required'),
    breakMinutes: z.coerce
      .number()
      .min(0, 'Break cannot be negative')
      .default(0),
    hourlyRateCAD: z.coerce
      .number()
      .positive('Hourly rate must be greater than 0'),
    conversionRatePHP: z.coerce
      .number()
      .positive('Conversion rate must be greater than 0'),
    notes: z.string().optional().default(''),
  })
  .refine(
    (data) => {
      // Create date objects for start and end times
      const [startHour, startMin] = data.startTime.split(':').map(Number);
      const [endHour, endMin] = data.endTime.split(':').map(Number);

      const startDate = parseISO(data.shiftDate);
      startDate.setHours(startHour, startMin, 0, 0);

      const endDate = parseISO(data.shiftDate);
      endDate.setHours(endHour, endMin, 0, 0);

      // Calculate hours (handles overnight)
      const originalHours = calculateOriginalHours(startDate, endDate);
      const breakHours = calculateBreakHours(data.breakMinutes);
      const adjustedHours = originalHours - breakHours;

      return adjustedHours > 0;
    },
    {
      message:
        'Adjusted work hours must be greater than 0. Break time cannot exceed or equal shift duration.',
      path: ['breakMinutes'],
    }
  );

/**
 * Zod schema for user settings validation
 */
export const settingsSchema = z.object({
  appTitle: z
    .string()
    .min(2, 'App title must be at least 2 characters')
    .max(60, 'App title must be 60 characters or less')
    .transform((val) => val.trim()),
  defaultHourlyRateCAD: z.coerce
    .number()
    .positive('Default hourly rate must be greater than 0')
    .default(15),
  defaultConversionRatePHP: z.coerce
    .number()
    .positive('Default conversion rate must be greater than 0')
    .default(43),
});

/**
 * Zod schema for work preset validation
 */
export const workPresetSchema = z.object({
  name: z
    .string()
    .min(1, 'Preset name is required')
    .max(100, 'Preset name must be 100 characters or less')
    .transform((val) => val.trim()),
});

/**
 * Zod schema for login form
 */
export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

/**
 * Zod schema for signup form
 */
export const signupSchema = z
  .object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

/**
 * Zod schema for password reset request
 */
export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

/**
 * Zod schema for password reset
 */
export const resetPasswordSchema = z
  .object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export default {
  shiftSchema,
  settingsSchema,
  workPresetSchema,
  loginSchema,
  signupSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
};
