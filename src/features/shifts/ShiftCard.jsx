import { useState } from 'react';
import { Pencil, Trash2, Clock, DollarSign, Calendar, FileText } from 'lucide-react';
import { formatCurrency, formatHours } from '../../lib/calculations';
import { formatDate, formatTimeRange, cn } from '../../lib/utils';
import { Badge, Button, ConfirmDialog } from '../../components/ui';
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
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
              {shift.workplace_name}
            </h3>
            <div className="flex gap-1 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(shift)}
                aria-label="Edit shift"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDeleteConfirm(true)}
                aria-label="Delete shift"
                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            {formatDate(shift.shift_date)}
          </p>
          
          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatHours(shift.adjusted_hours)}
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold text-green-600 dark:text-green-400">
                {formatCurrency(shift.earnings_cad, 'CAD')}
              </p>
              <p className="text-xs text-indigo-600 dark:text-indigo-400">
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

  // List view (detailed)
  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {shift.workplace_name}
            </h3>
            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
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
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(shift)}
              aria-label="Edit shift"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowDeleteConfirm(true)}
              aria-label="Delete shift"
              className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Hours breakdown */}
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 mb-4">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Original</span>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {formatHours(shift.original_hours)}
              </p>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Break</span>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                -{shift.break_minutes} min
              </p>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Adjusted</span>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {formatHours(shift.adjusted_hours)}
              </p>
            </div>
          </div>
        </div>

        {/* Earnings */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <DollarSign className="h-4 w-4 inline mr-1" />
            {formatHours(shift.adjusted_hours)} × ${shift.hourly_rate_cad}/hr
          </div>
          <div className="flex gap-3">
            <Badge variant="success" className="text-base px-3 py-1">
              {formatCurrency(shift.earnings_cad, 'CAD')}
            </Badge>
            <Badge variant="primary" className="text-base px-3 py-1">
              {formatCurrency(shift.earnings_php, 'PHP')}
            </Badge>
          </div>
        </div>

        {/* Notes */}
        {shift.notes && (
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
              <FileText className="h-4 w-4 mt-0.5 shrink-0" />
              <p>{shift.notes}</p>
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
