import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import {
  Briefcase,
  Calendar,
  Clock3,
  Coffee,
  DollarSign,
  ArrowRightLeft,
  StickyNote,
} from 'lucide-react';
import { shiftSchema } from '../../lib/validation.js';
import { calculateShiftValues, formatCurrency, formatHours } from '../../lib/calculations';
import { combineDateAndTime, extractTimeString } from '../../lib/utils';
import { useCreateShift, useUpdateShift } from './useShifts';
import { useSettings, useWorkPresets } from '../settings/useSettings';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';

function ShiftModal({ isOpen, onClose, shift = null }) {
  const isEditing = !!shift;
  const createShift = useCreateShift();
  const updateShift = useUpdateShift();
  const { data: settings } = useSettings();
  const { data: presets = [] } = useWorkPresets();
  const [liveCalc, setLiveCalc] = useState(null);

  const defaultValues = shift
    ? {
        workplaceName: shift.workplace_name,
        shiftDate: format(new Date(shift.shift_date), 'yyyy-MM-dd'),
        startTime: extractTimeString(shift.start_time),
        endTime: extractTimeString(shift.end_time),
        breakMinutes: shift.break_minutes,
        hourlyRateCAD: shift.hourly_rate_cad,
        conversionRatePHP: shift.conversion_rate_php,
        notes: shift.notes || '',
      }
    : {
        workplaceName: '',
        shiftDate: format(new Date(), 'yyyy-MM-dd'),
        startTime: '09:00',
        endTime: '17:00',
        breakMinutes: 30,
        hourlyRateCAD: settings?.default_hourly_rate_cad || 15,
        conversionRatePHP: settings?.default_conversion_rate_php || 43,
        notes: '',
      };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(shiftSchema),
    defaultValues,
  });

  // Watch form values for live calculation
  const watchedValues = watch();

  const updateLiveCalc = () => {
    try {
      const { shiftDate, startTime, endTime, breakMinutes, hourlyRateCAD, conversionRatePHP } =
        watchedValues;

      if (shiftDate && startTime && endTime) {
        const startDateTime = combineDateAndTime(shiftDate, startTime);
        const endDateTime = combineDateAndTime(shiftDate, endTime);

        const calc = calculateShiftValues({
          startTime: startDateTime,
          endTime: endDateTime,
          breakMinutes: parseFloat(breakMinutes) || 0,
          hourlyRateCAD: parseFloat(hourlyRateCAD) || 0,
          conversionRatePHP: parseFloat(conversionRatePHP) || 0,
        });

        setLiveCalc(calc);
      }
    } catch {
      setLiveCalc(null);
    }
  };

  // Update live calc when values change
  useState(() => {
    updateLiveCalc();
  });

  const onSubmit = async (data) => {
    try {
      const startDateTime = combineDateAndTime(data.shiftDate, data.startTime);
      const endDateTime = combineDateAndTime(data.shiftDate, data.endTime);

      const calc = calculateShiftValues({
        startTime: startDateTime,
        endTime: endDateTime,
        breakMinutes: data.breakMinutes,
        hourlyRateCAD: data.hourlyRateCAD,
        conversionRatePHP: data.conversionRatePHP,
      });

      const shiftData = {
        workplace_name: data.workplaceName,
        shift_date: format(new Date(data.shiftDate), 'yyyy-MM-dd'),
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        break_minutes: data.breakMinutes,
        hourly_rate_cad: data.hourlyRateCAD,
        conversion_rate_php: data.conversionRatePHP,
        original_hours: calc.originalHours,
        break_hours: calc.breakHours,
        adjusted_hours: calc.adjustedHours,
        earnings_cad: calc.earningsCAD,
        earnings_php: calc.earningsPHP,
        notes: data.notes || null,
      };

      if (isEditing) {
        await updateShift.mutateAsync({ id: shift.id, ...shiftData });
      } else {
        await createShift.mutateAsync(shiftData);
      }

      onClose();
    } catch (error) {
      console.error('Failed to save shift:', error);
    }
  };

  const selectPreset = (presetName) => {
    setValue('workplaceName', presetName);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Shift' : 'Add New Shift'}
      description={isEditing ? 'Update shift details' : 'Log a new work shift'}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Workplace */}
        <div>
          <Input
            label={
              <span className="inline-flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-[var(--color-primary)]" />
                Workplace Name
              </span>
            }
            placeholder="Enter workplace name"
            error={errors.workplaceName?.message}
            {...register('workplaceName')}
            onBlur={updateLiveCalc}
          />
          {presets.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {presets.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => selectPreset(preset.name)}
                  className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Date and Times */}
        <div className="space-y-4">
          <Input
            label={
              <span className="inline-flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[var(--color-primary)]" />
                Date
              </span>
            }
            type="date"
            error={errors.shiftDate?.message}
            {...register('shiftDate')}
            onBlur={updateLiveCalc}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label={
                <span className="inline-flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-[var(--color-primary)]" />
                  Start Time
                </span>
              }
              type="time"
              error={errors.startTime?.message}
              {...register('startTime')}
              onBlur={updateLiveCalc}
            />
            <Input
              label={
                <span className="inline-flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-[var(--color-primary)]" />
                  End Time
                </span>
              }
              type="time"
              error={errors.endTime?.message}
              {...register('endTime')}
              onBlur={updateLiveCalc}
            />
          </div>
        </div>

        {/* Break and Rates */}
        <div className="space-y-4">
          <Input
            label={
              <span className="inline-flex items-center gap-2">
                <Coffee className="h-4 w-4 text-[var(--color-primary)]" />
                Break (minutes)
              </span>
            }
            type="number"
            min="0"
            step="1"
            error={errors.breakMinutes?.message}
            {...register('breakMinutes')}
            onBlur={updateLiveCalc}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label={
                <span className="inline-flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-[var(--color-primary)]" />
                  Hourly Rate (CAD)
                </span>
              }
              type="number"
              min="0"
              step="0.01"
              error={errors.hourlyRateCAD?.message}
              {...register('hourlyRateCAD')}
              onBlur={updateLiveCalc}
            />
            <Input
              label={
                <span className="inline-flex items-center gap-2">
                  <ArrowRightLeft className="h-4 w-4 text-[var(--color-primary)]" />
                  CAD → PHP Rate
                </span>
              }
              type="number"
              min="0"
              step="0.01"
              error={errors.conversionRatePHP?.message}
              {...register('conversionRatePHP')}
              onBlur={updateLiveCalc}
            />
          </div>
        </div>

        {/* Notes */}
        <Textarea
          label={
            <span className="inline-flex items-center gap-2">
              <StickyNote className="h-4 w-4 text-[var(--color-primary)]" />
              Notes (optional)
            </span>
          }
          placeholder="Add any notes about this shift..."
          rows={2}
          error={errors.notes?.message}
          {...register('notes')}
        />

        {/* Live Calculation Preview */}
        {liveCalc && liveCalc.adjustedHours > 0 && (
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Earnings Preview
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Original</span>
                <p className="font-semibold text-gray-900 dark:text-gray-100">
                  {formatHours(liveCalc.originalHours)}
                </p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Adjusted</span>
                <p className="font-semibold text-gray-900 dark:text-gray-100">
                  {formatHours(liveCalc.adjustedHours)}
                </p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">CAD</span>
                <p className="font-semibold text-green-600 dark:text-green-400">
                  {formatCurrency(liveCalc.earningsCAD, 'CAD')}
                </p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">PHP</span>
                <p className="font-semibold text-indigo-600 dark:text-indigo-400">
                  {formatCurrency(liveCalc.earningsPHP, 'PHP')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {isEditing ? 'Save Changes' : 'Add Shift'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default ShiftModal;
