import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { formatCurrency, formatHours } from '../../lib/calculations';
import {
  getWeekStart,
  getWeekEnd,
  getMonthStart,
  getMonthEnd,
  getWeeklyShifts,
  getYearlyShifts,
  calculateSummaryTotals,
  formatDate,
  filterShiftsByDateRange,
} from '../../lib/utils';

function SummaryCard({
  title,
  dateRange,
  totals,
  shifts,
  isLoading,
  isExpanded,
  onToggle,
  headerAction,
}) {

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <div className="animate-pulse space-y-4">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="surface-card overflow-hidden self-start">
      <div className="p-4 sm:p-5 text-left">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
          <button
            type="button"
            onClick={onToggle}
            className="flex items-start gap-3 text-left flex-1 min-w-0 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors rounded-xl p-2 -m-2"
          >
            <div className="flex items-start gap-2 min-w-0 flex-1">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-[var(--color-primary)] shrink-0 mt-0.5" />
              <div className="min-w-0">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 truncate">
                  {title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {dateRange}
                </p>
              </div>
            </div>
          </button>

          <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 shrink-0">
            {headerAction}
            <button
              type="button"
              onClick={onToggle}
              className="h-9 w-9 rounded-xl flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label={isExpanded ? `Collapse ${title}` : `Expand ${title}`}
            >
              {isExpanded ? (
                <ChevronUp className="h-5 w-5 text-gray-400 shrink-0" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400 shrink-0" />
              )}
            </button>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-700/25 rounded-xl p-3 sm:p-4 mt-3 sm:mt-4">
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <div className="text-center">
              <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
                {totals.shiftCount}
              </p>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">Shifts</p>
            </div>
            <div className="text-center">
              <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
                {formatHours(totals.totalHours)}
              </p>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">Hours</p>
            </div>
            <div className="text-center">
              <p className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400 leading-tight">
                {formatCurrency(totals.totalCAD, 'CAD')}
              </p>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">CAD</p>
            </div>
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-slate-200 dark:border-slate-600 text-right">
            <p className="text-sm sm:text-base font-bold text-[var(--color-primary-dark)] dark:text-[var(--color-primary)]">
              PHP total: {formatCurrency(totals.totalPHP, 'PHP')}
            </p>
          </div>
        </div>
      </div>

      {/* Expanded shift list */}
      {isExpanded && shifts.length > 0 && (
        <div className="border-t border-slate-200 dark:border-slate-700 px-4 sm:px-5 py-4 bg-slate-50 dark:bg-slate-900/40">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            Included Shifts
          </p>
          <div className="space-y-2">
            {shifts.map((shift) => (
              <div
                key={shift.id}
                className="flex justify-between items-center py-2 px-3 bg-white dark:bg-slate-800 rounded-lg text-sm"
              >
                <div>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {shift.workplace_name}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 ml-2">
                    {formatDate(shift.shift_date)}
                  </span>
                </div>
                <div className="text-right">
                  <p className="font-medium text-green-600 dark:text-green-400">
                    {formatCurrency(shift.earnings_cad, 'CAD')}
                  </p>
                  <p className="text-xs text-[var(--color-primary-dark)] dark:text-[var(--color-primary)]">
                    {formatCurrency(shift.earnings_php || 0, 'PHP')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isExpanded && shifts.length === 0 && (
        <div className="border-t border-slate-200 dark:border-slate-700 px-5 py-8 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No shifts recorded in this period
          </p>
        </div>
      )}
    </div>
  );
}

function WeeklySummary({ shifts, isLoading, isExpanded = false, onToggle }) {
  const now = new Date();
  const weekStart = getWeekStart(now);
  const weekEnd = getWeekEnd(now);
  const weeklyShifts = getWeeklyShifts(shifts || [], now);
  const totals = calculateSummaryTotals(weeklyShifts);
  const dateRange = `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;

  return (
    <SummaryCard
      title="This Week"
      dateRange={dateRange}
      totals={totals}
      shifts={weeklyShifts}
      isLoading={isLoading}
      isExpanded={isExpanded}
      onToggle={onToggle}
    />
  );
}

function MonthlySummary({ shifts, isLoading, isExpanded = false, onToggle }) {
  const monthOptions = useMemo(() => {
    const seen = new Set();

    return (shifts || [])
      .map((shift) => {
        const date = typeof shift.shift_date === 'string' ? new Date(`${shift.shift_date}T00:00:00`) : shift.shift_date;
        const monthKey = format(date, 'yyyy-MM');

        if (seen.has(monthKey)) return null;
        seen.add(monthKey);

        return {
          value: monthKey,
          label: format(date, 'MMMM yyyy'),
          date,
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.value.localeCompare(a.value));
  }, [shifts]);

  const getDefaultMonth = () => {
    const currentMonth = format(new Date(), 'yyyy-MM');
    if (monthOptions.some((option) => option.value === currentMonth)) return currentMonth;
    return monthOptions[0]?.value || currentMonth;
  };

  const [selectedMonth, setSelectedMonth] = useState(getDefaultMonth);

  useEffect(() => {
    setSelectedMonth((current) => {
      if (monthOptions.some((option) => option.value === current)) return current;
      return getDefaultMonth();
    });
  }, [monthOptions]);

  const selectedMonthOption = monthOptions.find((option) => option.value === selectedMonth);
  const fallbackDate = selectedMonthOption?.date || new Date();
  const monthStart = getMonthStart(fallbackDate);
  const monthEnd = getMonthEnd(fallbackDate);
  const monthlyShifts = filterShiftsByDateRange(shifts || [], monthStart, monthEnd);
  const totals = calculateSummaryTotals(monthlyShifts);
  const dateRange = selectedMonthOption?.label || format(monthStart, 'MMMM yyyy');

  return (
    <SummaryCard
      title="Month Breakdown"
      dateRange={dateRange}
      totals={totals}
      shifts={monthlyShifts}
      isLoading={isLoading}
      isExpanded={isExpanded}
      onToggle={onToggle}
      headerAction={
        <div className="mt-3 sm:mt-0 sm:min-w-56">
          <label className="sr-only" htmlFor="month-summary-select">
            Select month
          </label>
          <select
            id="month-summary-select"
            value={selectedMonth}
            onChange={(event) => setSelectedMonth(event.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm font-medium text-slate-900 dark:text-slate-100 shadow-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
          >
            {monthOptions.length > 0 ? (
              monthOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))
            ) : (
              <option value={selectedMonth}>No months available</option>
            )}
          </select>
        </div>
      }
    />
  );
}

function YearlySummary({ shifts, isLoading, isExpanded = false, onToggle }) {
  const now = new Date();
  const yearlyShifts = getYearlyShifts(shifts || [], now);
  const totals = calculateSummaryTotals(yearlyShifts);
  const dateRange = format(now, 'yyyy');

  return (
    <SummaryCard
      title="This Year"
      dateRange={dateRange}
      totals={totals}
      shifts={yearlyShifts}
      isLoading={isLoading}
      isExpanded={isExpanded}
      onToggle={onToggle}
    />
  );
}

export { SummaryCard, WeeklySummary, MonthlySummary, YearlySummary };
export default SummaryCard;
