import { useState } from 'react';
import { ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { formatCurrency, formatHours } from '../../lib/calculations';
import {
  getWeekStart,
  getWeekEnd,
  getMonthStart,
  getMonthEnd,
  getWeeklyShifts,
  getMonthlyShifts,
  getYearlyShifts,
  calculateSummaryTotals,
  formatDate,
} from '../../lib/utils';

function SummaryCard({ title, dateRange, totals, shifts, isLoading }) {
  const [isExpanded, setIsExpanded] = useState(false);

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
    <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl border-2 border-[var(--color-primary)] overflow-hidden shadow-sm">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 sm:p-5 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
      >
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-[var(--color-primary)]" />
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
                {title}
              </h3>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {dateRange}
            </p>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </div>

        <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg sm:rounded-xl p-3 sm:p-4 mt-3 sm:mt-4">
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
                {totals.shiftCount}
              </p>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">Shifts</p>
            </div>
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
                {formatHours(totals.totalHours)}
              </p>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">Hours</p>
            </div>
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400 leading-tight">
                {formatCurrency(totals.totalCAD, 'CAD')}
              </p>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">CAD</p>
            </div>
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-gray-200 dark:border-gray-600 text-right">
            <p className="text-base sm:text-lg font-bold text-orange-600 dark:text-orange-400">
              PHP total: {formatCurrency(totals.totalPHP, 'PHP')}
            </p>
          </div>
        </div>
      </button>

      {/* Expanded shift list */}
      {isExpanded && shifts.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 px-4 sm:px-5 py-4 bg-gray-50 dark:bg-gray-900/50">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Included Shifts
          </p>
          <div className="space-y-2">
            {shifts.map((shift) => (
              <div
                key={shift.id}
                className="flex justify-between items-center py-2 px-3 bg-white dark:bg-gray-800 rounded-lg text-sm"
              >
                <div>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {shift.workplace_name}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 ml-2">
                    {formatDate(shift.shift_date)}
                  </span>
                </div>
                <div className="text-right">
                  <p className="font-medium text-green-600 dark:text-green-400">
                    {formatCurrency(shift.earnings_cad, 'CAD')}
                  </p>
                  <p className="text-xs text-orange-600 dark:text-orange-400">
                    {formatCurrency(shift.earnings_php || 0, 'PHP')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isExpanded && shifts.length === 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 px-5 py-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No shifts recorded in this period
          </p>
        </div>
      )}
    </div>
  );
}

function WeeklySummary({ shifts, isLoading }) {
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
    />
  );
}

function MonthlySummary({ shifts, isLoading }) {
  const now = new Date();
  const monthStart = getMonthStart(now);
  const monthEnd = getMonthEnd(now);
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
    />
  );
}

function YearlySummary({ shifts, isLoading }) {
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
    />
  );
}

export { SummaryCard, WeeklySummary, MonthlySummary, YearlySummary };
export default SummaryCard;
