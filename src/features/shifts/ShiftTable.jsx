import { format } from 'date-fns';
import { formatCurrency, formatHours } from '../../lib/calculations';
import { formatDate, cn } from '../../lib/utils';
import { TableRowSkeleton } from '../../components/common';

function ShiftTable({ shifts, isLoading, onEditShift }) {
  if (isLoading) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                Workplace
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                Date
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                Hours
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                Rate
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                CAD
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                PHP
              </th>
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, i) => (
              <TableRowSkeleton key={i} />
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
              Workplace
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
              Date
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
              Hours
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
              Rate
            </th>
            <th className="px-4 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400">
              CAD
            </th>
            <th className="px-4 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400">
              PHP
            </th>
          </tr>
        </thead>
        <tbody>
          {shifts.map((shift, index) => (
            <tr
              key={shift.id}
              onClick={() => onEditShift(shift)}
              className={cn(
                'border-b border-gray-200 dark:border-gray-700 cursor-pointer',
                'hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors',
                index === shifts.length - 1 && 'border-b-0'
              )}
            >
              <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                {shift.workplace_name}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                {formatDate(shift.shift_date)}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                {formatHours(shift.adjusted_hours)}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                ${shift.hourly_rate_cad}/hr
              </td>
              <td className="px-4 py-3 text-sm text-right font-medium text-green-600 dark:text-green-400">
                {formatCurrency(shift.earnings_cad, 'CAD')}
              </td>
              <td className="px-4 py-3 text-sm text-right font-medium text-indigo-600 dark:text-indigo-400">
                {formatCurrency(shift.earnings_php, 'PHP')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ShiftTable;
