import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { formatCurrency } from '../../lib/calculations';
import { groupShiftsByMonth, calculateSummaryTotals, cn } from '../../lib/utils';
import { ShiftCardSkeleton } from '../../components/common';
import ShiftCard from './ShiftCard';

function ShiftList({ shifts, isLoading, viewMode, onEditShift }) {
  const [collapsedMonths, setCollapsedMonths] = useState(new Set());

  const toggleMonth = (monthKey) => {
    setCollapsedMonths((prev) => {
      const next = new Set(prev);
      if (next.has(monthKey)) {
        next.delete(monthKey);
      } else {
        next.add(monthKey);
      }
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <ShiftCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const groupedShifts = groupShiftsByMonth(shifts);

  return (
    <div className="space-y-5 sm:space-y-6">
      {groupedShifts.map((group) => {
        const isCollapsed = collapsedMonths.has(group.key);
        const monthTotals = calculateSummaryTotals(group.shifts);

        return (
          <div key={group.key}>
            {/* Month header */}
            <button
              onClick={() => toggleMonth(group.key)}
              className="w-full flex items-center justify-between px-4 py-3.5 bg-[var(--color-primary-light)] dark:bg-[var(--color-primary)]/15 rounded-xl hover:brightness-95 transition-colors mb-3"
            >
              <div className="flex items-center gap-2">
                {isCollapsed ? (
                  <ChevronRight className="h-5 w-5 text-[var(--color-primary-dark)]" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-[var(--color-primary-dark)]" />
                )}
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {group.label}
                </span>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  ({group.shifts.length} shift{group.shifts.length !== 1 ? 's' : ''})
                </span>
              </div>
              <span className="font-medium text-green-600 dark:text-green-400">
                {formatCurrency(monthTotals.totalCAD, 'CAD')}
              </span>
            </button>

            {/* Shifts */}
            {!isCollapsed && (
              <div
                className={cn(
                  viewMode === 'grid'
                    ? 'grid grid-cols-2 gap-3'
                    : 'space-y-4'
                )}
              >
                {group.shifts.map((shift) => (
                  <ShiftCard
                    key={shift.id}
                    shift={shift}
                    viewMode={viewMode}
                    onEdit={onEditShift}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default ShiftList;
