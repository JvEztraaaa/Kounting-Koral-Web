import { useState } from 'react';
import { Pencil, Trash2, Clock, Calendar, FileText } from 'lucide-react';
import { formatCurrency, formatHours } from '../../lib/calculations';
import { formatDate, formatTimeRange } from '../../lib/utils';
import { Button, ConfirmDialog } from '../../components/ui';
import { useDeleteShift } from './useShifts';

function ShiftCard({ shift, viewMode = 'list', onEdit }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const deleteShift = useDeleteShift();

  const handleDelete = async () => {
    await deleteShift.mutateAsync(shift.id);
  };

  if (viewMode === 'grid') {
    return (
      <>
        <div className="surface-card p-3 sm:p-3.5 hover:shadow-md transition-shadow min-h-[148px] flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate pr-2">
              {shift.workplace_name}
            </h3>
            <div className="flex gap-1 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(shift)}
                aria-label="Edit shift"
                className="h-7 w-7"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDeleteConfirm(true)}
                aria-label="Delete shift"
                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 h-7 w-7"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mb-3">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(shift.shift_date)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {formatHours(shift.adjusted_hours)}
            </span>
          </div>

          <div className="mt-auto flex justify-end">
            <div className="text-right">
              <p className="text-lg leading-none font-bold text-green-600 dark:text-green-400">
                {formatCurrency(shift.earnings_cad, 'CAD')}
              </p>
              <p className="text-[11px] text-[var(--color-primary-dark)] dark:text-[var(--color-primary)] mt-1">
                {formatCurrency(shift.earnings_php, 'PHP')}
              </p>
            </div>
          </div>
        </div>

        <ConfirmDialog
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleDelete}
          title="Delete Shift"
          description={`Are you sure you want to delete this shift at ${shift.workplace_name}? This action cannot be undone.`}
          confirmText="Delete"
          loading={deleteShift.isPending}
        />
      </>
    );
  }

  // Default/list view: same simple card language as grid but with notes visible
  return (
    <>
      <div className="surface-card p-4 sm:p-4.5 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-2.5">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {shift.workplace_name}
            </h3>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(shift.shift_date)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {formatTimeRange(shift.start_time, shift.end_time)}
              </span>
            </div>
          </div>
          <div className="flex gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(shift)}
              aria-label="Edit shift"
              className="h-8 w-8"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowDeleteConfirm(true)}
              aria-label="Delete shift"
              className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 h-8 w-8"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-end justify-between mb-3.5">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {formatHours(shift.adjusted_hours)} • -{shift.break_minutes} min break
          </p>
          <div className="text-right">
            <p className="text-xl leading-none font-bold text-green-600 dark:text-green-400">
              {formatCurrency(shift.earnings_cad, 'CAD')}
            </p>
            <p className="text-xs text-[var(--color-primary-dark)] dark:text-[var(--color-primary)] mt-1">
              {formatCurrency(shift.earnings_php, 'PHP')}
            </p>
          </div>
        </div>

        {/* Notes */}
        {shift.notes && (
          <div className="pt-2.5 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
              <FileText className="h-4 w-4 mt-0.5 shrink-0" />
              <p className="line-clamp-2">{shift.notes}</p>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Shift"
        description={`Are you sure you want to delete this shift at ${shift.workplace_name}? This action cannot be undone.`}
        confirmText="Delete"
        loading={deleteShift.isPending}
      />
    </>
  );
}

export default ShiftCard;
