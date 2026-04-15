import { ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { formatCurrency, formatHours } from '../../lib/calculations';
import {
  getWeekStart,
  getWeekEnd,
  getMonthStart,
  getWeeklyShifts,
  getMonthlyShifts,
  getYearlyShifts,
  calculateSummaryTotals,
  formatDate,
} from '../../lib/utils';

function SummaryCard({ title, dateRange, totals, shifts, isLoading, isExpanded, onToggle }) {

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
      <button
        onClick={onToggle}
        className="w-full p-4 sm:p-5 text-left hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors"
      >
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-[var(--color-primary)]" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {title}
              </h3>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {dateRange}
            </p>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
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
      </button>

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
  const now = new Date();
  const monthStart = getMonthStart(now);
  const monthlyShifts = getMonthlyShifts(shifts || [], now);
  const totals = calculateSummaryTotals(monthlyShifts);
  const dateRange = format(monthStart, 'MMMM yyyy');

  return (
    <SummaryCard
      title="This Month"
      dateRange={dateRange}
      totals={totals}
      shifts={monthlyShifts}
      isLoading={isLoading}
      isExpanded={isExpanded}
      onToggle={onToggle}
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
